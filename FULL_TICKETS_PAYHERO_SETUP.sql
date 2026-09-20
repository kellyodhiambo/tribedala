-- ============================================================
-- PAYHERO PAYMENT SETUP — works with the real 'tickets' table
-- Run in Supabase Dashboard → SQL Editor → New query
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE
-- ============================================================

-- ── 1. Add missing columns to the existing 'tickets' table ───────────────────
--    Current real schema: id, event_id, user_id, tier_name, price, quantity,
--                         qr_code, status, payment_reference, created_at
--    We add buyer info + PayHero fields.

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS buyer_name               TEXT,
  ADD COLUMN IF NOT EXISTS buyer_email              TEXT,
  ADD COLUMN IF NOT EXISTS buyer_phone              TEXT,
  ADD COLUMN IF NOT EXISTS total_amount             DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_method           TEXT DEFAULT 'mpesa',
  ADD COLUMN IF NOT EXISTS payhero_reference        TEXT,
  ADD COLUMN IF NOT EXISTS payhero_checkout_request TEXT,
  ADD COLUMN IF NOT EXISTS payhero_receipt          TEXT,
  ADD COLUMN IF NOT EXISTS payhero_result_code      INTEGER,
  ADD COLUMN IF NOT EXISTS payhero_result_desc      TEXT,
  ADD COLUMN IF NOT EXISTS updated_at               TIMESTAMPTZ DEFAULT NOW();

-- ── 2. Rename existing columns to match our app (if they differ) ─────────────
--    'tier_name' → our app calls it 'name' on the Ticket interface
--    'status'    → our app uses 'payment_status'
--    We ADD alias columns rather than renaming to avoid breaking anything.

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS ticket_name      TEXT,
  ADD COLUMN IF NOT EXISTS payment_status   TEXT DEFAULT 'pending';

-- Backfill alias columns from existing columns
UPDATE tickets SET
  ticket_name    = tier_name,
  payment_status = CASE status
    WHEN 'paid'       THEN 'completed'
    WHEN 'pending'    THEN 'pending'
    WHEN 'failed'     THEN 'failed'
    WHEN 'refunded'   THEN 'refunded'
    ELSE status
  END
WHERE ticket_name IS NULL OR payment_status IS NULL;

-- ── 3. Add a ticket_types table (the catalog of available ticket tiers) ───────
--    The existing 'tickets' table stores PURCHASED tickets.
--    We need a separate catalog for "what tickets can be bought for this event".

CREATE TABLE IF NOT EXISTS ticket_types (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           UUID          NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name               VARCHAR(255)  NOT NULL,
  description        TEXT,
  price              DECIMAL(10,2) NOT NULL,
  quantity_available INT           NOT NULL DEFAULT 0,
  quantity_sold      INT           NOT NULL DEFAULT 0,
  is_active          BOOLEAN       DEFAULT true,
  created_at         TIMESTAMPTZ   DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   DEFAULT NOW()
);

-- ── 4. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tickets_event_id
  ON tickets(event_id);

CREATE INDEX IF NOT EXISTS idx_tickets_payment_status
  ON tickets(payment_status);

CREATE INDEX IF NOT EXISTS idx_tickets_payhero_ref
  ON tickets(payhero_reference)
  WHERE payhero_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id
  ON ticket_types(event_id);

CREATE INDEX IF NOT EXISTS idx_ticket_types_active
  ON ticket_types(is_active);

-- ── 5. RLS on ticket_types ────────────────────────────────────────────────────

ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_types'
    AND policyname = 'Anyone can view active ticket types'
  ) THEN
    CREATE POLICY "Anyone can view active ticket types"
      ON ticket_types FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_types'
    AND policyname = 'Service role full access on ticket_types'
  ) THEN
    CREATE POLICY "Service role full access on ticket_types"
      ON ticket_types FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 6. Service role bypass on tickets (needed by the webhook) ─────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tickets'
    AND policyname = 'Service role full access on tickets'
  ) THEN
    CREATE POLICY "Service role full access on tickets"
      ON tickets FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Allow anyone to INSERT a ticket (guest checkout)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tickets'
    AND policyname = 'Anyone can purchase tickets'
  ) THEN
    CREATE POLICY "Anyone can purchase tickets"
      ON tickets FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Allow users to update their own tickets (for status polling update)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tickets'
    AND policyname = 'Users can update their own tickets'
  ) THEN
    CREATE POLICY "Users can update their own tickets"
      ON tickets FOR UPDATE
      USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

-- ── 7. updated_at trigger on ticket_types ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_ticket_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ticket_types_updated_at ON ticket_types;
CREATE TRIGGER ticket_types_updated_at
  BEFORE UPDATE ON ticket_types
  FOR EACH ROW EXECUTE FUNCTION update_ticket_types_updated_at();

-- ── 8. increment_tickets_sold() — called by the PayHero webhook ───────────────

CREATE OR REPLACE FUNCTION increment_tickets_sold(
  p_ticket_type_id UUID,
  p_quantity       INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available INT;
  v_sold      INT;
BEGIN
  SELECT quantity_available, quantity_sold
    INTO v_available, v_sold
    FROM ticket_types
   WHERE id = p_ticket_type_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket type % not found', p_ticket_type_id;
  END IF;

  IF (v_sold + p_quantity) > v_available THEN
    RAISE EXCEPTION 'Oversold: available=%, sold=%, requested=%',
      v_available, v_sold, p_quantity;
  END IF;

  UPDATE ticket_types
     SET quantity_sold = quantity_sold + p_quantity,
         updated_at    = NOW()
   WHERE id = p_ticket_type_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_tickets_sold(UUID, INT) TO service_role;
GRANT EXECUTE ON FUNCTION increment_tickets_sold(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_tickets_sold(UUID, INT) TO anon;

-- ── Done ──────────────────────────────────────────────────────────────────────
-- 'tickets'      — purchase records (extended with buyer info + PayHero cols)
-- 'ticket_types' — catalog of available ticket tiers per event
-- increment_tickets_sold(p_ticket_type_id, p_quantity) — webhook RPC
