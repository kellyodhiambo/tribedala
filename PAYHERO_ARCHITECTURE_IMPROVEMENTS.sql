-- ============================================================
-- PAYHERO ARCHITECTURE IMPROVEMENTS
-- Implements:
-- 1. Human-readable ticket references (EVT-YYYY-XXXX-ABCD)
-- 2. QR code storage and generation
-- 3. Enhanced status lifecycle (PENDING → PAYMENT_QUEUED → PAID → TICKET_ISSUED → CHECKED_IN)
-- 4. Callback payload storage for audit trail
-- 5. Check-in tracking (checked_in timestamp, check_in_count)
-- 6. Payout calculations infrastructure
-- ============================================================

-- ── 1. Add new columns to tickets table ───────────────────────────────────────

ALTER TABLE tickets
  -- Human-readable reference (EVT-2026-XXXX-ABCD)
  ADD COLUMN IF NOT EXISTS human_reference TEXT UNIQUE,
  
  -- QR Code data (for display/email)
  ADD COLUMN IF NOT EXISTS qr_code_data    TEXT,  -- base64 or PNG data URL
  ADD COLUMN IF NOT EXISTS qr_code_url     TEXT,  -- external storage URL if needed
  
  -- Pesapal payment reference
  ADD COLUMN IF NOT EXISTS pesapal_reference TEXT,
  ADD COLUMN IF NOT EXISTS pesapal_webhook_payload JSONB,
  
  -- Enhanced status tracking
  ADD COLUMN IF NOT EXISTS payment_queued_at      TIMESTAMPTZ,  -- when payment initiated
  ADD COLUMN IF NOT EXISTS payment_completed_at   TIMESTAMPTZ,  -- when payment succeeded
  ADD COLUMN IF NOT EXISTS ticket_issued_at       TIMESTAMPTZ,  -- when QR/ticket generated
  
  -- Check-in tracking
  ADD COLUMN IF NOT EXISTS checked_in_at          TIMESTAMPTZ,  -- first check-in time
  ADD COLUMN IF NOT EXISTS check_in_count         INT DEFAULT 0, -- number of times checked in
  
  -- Callback payload storage (full audit trail)
  ADD COLUMN IF NOT EXISTS payhero_callback_payload JSONB,  -- complete PayHero webhook response
  
  -- Email delivery tracking
  ADD COLUMN IF NOT EXISTS email_sent_at          TIMESTAMPTZ,  -- when ticket email was sent
  
  -- Organizer payout tracking
  ADD COLUMN IF NOT EXISTS organizer_id           UUID,  -- FK to organizer/event owner
  ADD COLUMN IF NOT EXISTS platform_fee_amount    DECIMAL(10,2),  -- calculated fee
  ADD COLUMN IF NOT EXISTS net_payout_amount      DECIMAL(10,2);  -- amount after fee

-- ── 2. Add foreign key for organizer_id ───────────────────────────────────────
-- (Assumes you have an event_owner or organizer relationship)

ALTER TABLE tickets
  ADD CONSTRAINT fk_tickets_organizer
  FOREIGN KEY (organizer_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- ── 3. Create check-in log table for audit trail ────────────────────────────────

CREATE TABLE IF NOT EXISTS check_in_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  checked_in_by   UUID,  -- user/staff ID who validated
  check_in_time   TIMESTAMPTZ DEFAULT NOW(),
  device_info     TEXT,  -- which device/terminal validated
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_check_in_log_ticket_id 
  ON check_in_log(ticket_id);
CREATE INDEX IF NOT EXISTS idx_check_in_log_check_in_time 
  ON check_in_log(check_in_time);

-- ── 4. Create payout calculations table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payout_calculations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organizer_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start        DATE NOT NULL,
  period_end          DATE NOT NULL,
  gross_revenue       DECIMAL(12,2) NOT NULL,  -- sum of all ticket prices
  total_tickets_sold  INT NOT NULL,
  platform_fee_rate   DECIMAL(5,2) NOT NULL,  -- percentage (e.g. 5.00 for 5%)
  total_platform_fees DECIMAL(12,2) NOT NULL,
  net_payout          DECIMAL(12,2) NOT NULL,
  status              VARCHAR(50) DEFAULT 'pending',  -- pending, calculated, paid
  paid_at             TIMESTAMPTZ,
  payment_method      VARCHAR(50),  -- mpesa, bank_transfer, etc
  payment_reference   TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_calculations_organizer_event
  ON payout_calculations(organizer_id, event_id);
CREATE INDEX IF NOT EXISTS idx_payout_calculations_period
  ON payout_calculations(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payout_calculations_status
  ON payout_calculations(status);

-- ── 5. RLS Policies on new tables ──────────────────────────────────────────────

ALTER TABLE check_in_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_calculations ENABLE ROW LEVEL SECURITY;

-- check_in_log: Anyone can INSERT (for check-in), service_role bypasses
CREATE POLICY "Service role full access on check_in_log"
  ON check_in_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- check_in_log: Event organizers can VIEW their event's check-ins
CREATE POLICY "Organizers can view their check-in logs"
  ON check_in_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
        JOIN events e ON t.event_id = e.id
        WHERE t.id = check_in_log.ticket_id
        AND e.created_by = auth.uid()
    )
  );

-- payout_calculations: Service role full access
CREATE POLICY "Service role full access on payout_calculations"
  ON payout_calculations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- payout_calculations: Organizers can VIEW their own payouts
CREATE POLICY "Organizers can view their payout calculations"
  ON payout_calculations FOR SELECT
  USING (organizer_id = auth.uid());

-- ── 6. Create updated_at trigger for payout_calculations ─────────────────────

CREATE OR REPLACE FUNCTION update_payout_calculations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payout_calculations_updated_at ON payout_calculations;
CREATE TRIGGER payout_calculations_updated_at
  BEFORE UPDATE ON payout_calculations
  FOR EACH ROW EXECUTE FUNCTION update_payout_calculations_updated_at();

-- ── 7. Function: Calculate payout for an event and organizer ────────────────────

CREATE OR REPLACE FUNCTION calculate_event_payout(
  p_event_id UUID,
  p_organizer_id UUID,
  p_platform_fee_rate DECIMAL DEFAULT 5.00
)
RETURNS TABLE(
  gross_revenue DECIMAL,
  total_tickets INT,
  platform_fees DECIMAL,
  net_payout DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gross DECIMAL;
  v_count INT;
  v_fees DECIMAL;
BEGIN
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COUNT(*)
    INTO v_gross, v_count
  FROM tickets
  WHERE event_id = p_event_id
    AND payment_status = 'completed'
    AND created_at >= NOW() - INTERVAL '30 days';  -- last 30 days
  
  v_fees := v_gross * (p_platform_fee_rate / 100.0);
  
  RETURN QUERY SELECT 
    v_gross AS gross_revenue,
    v_count AS total_tickets,
    v_fees AS platform_fees,
    (v_gross - v_fees) AS net_payout;
END;
$$;

GRANT EXECUTE ON FUNCTION calculate_event_payout(UUID, UUID, DECIMAL) TO service_role;
GRANT EXECUTE ON FUNCTION calculate_event_payout(UUID, UUID, DECIMAL) TO authenticated;

-- ── 8. Backup/migration: Copy existing payment_reference to human_reference ────

-- This preserves any UUID references already in the system
UPDATE tickets 
  SET human_reference = payment_reference 
  WHERE human_reference IS NULL 
    AND payment_reference IS NOT NULL
    AND payment_reference LIKE 'EVT-%';  -- only if it looks like our format

-- ── 9. Update indexes for performance ──────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tickets_human_reference
  ON tickets(human_reference)
  WHERE human_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_checked_in_at
  ON tickets(checked_in_at)
  WHERE checked_in_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_organizer_id
  ON tickets(organizer_id)
  WHERE organizer_id IS NOT NULL;

-- ── Done ──────────────────────────────────────────────────────────────────────
-- Schema now supports:
-- ✓ Human-readable ticket references
-- ✓ QR code storage
-- ✓ Enhanced status lifecycle
-- ✓ Check-in audit trail
-- ✓ Payout calculations infrastructure
