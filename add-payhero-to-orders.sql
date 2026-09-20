-- Migration: add PayHero columns to ticket_orders and helpers
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Add PayHero-specific columns to ticket_orders
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS payhero_reference        TEXT,        -- PayHero internal reference (from STK response)
  ADD COLUMN IF NOT EXISTS payhero_checkout_request TEXT,        -- CheckoutRequestID from PayHero / M-Pesa
  ADD COLUMN IF NOT EXISTS payhero_receipt          TEXT,        -- MpesaReceiptNumber (set by webhook on success)
  ADD COLUMN IF NOT EXISTS payhero_result_code      INTEGER,     -- ResultCode: 0 = success
  ADD COLUMN IF NOT EXISTS payhero_result_desc      TEXT;        -- ResultDesc from M-Pesa

-- 2. Drop the old IntaSend columns if they exist (safe — never had real data)
ALTER TABLE ticket_orders
  DROP COLUMN IF EXISTS intasend_request_id,
  DROP COLUMN IF EXISTS intasend_transaction_id;

-- 3. Index on payhero_reference for fast status polling
CREATE INDEX IF NOT EXISTS idx_ticket_orders_payhero_ref
  ON ticket_orders (payhero_reference)
  WHERE payhero_reference IS NOT NULL;

-- 4. Stored procedure used by the webhook to atomically increment quantity_sold
--    without risking oversell (checks available capacity first).
CREATE OR REPLACE FUNCTION increment_tickets_sold(
  p_ticket_id UUID,
  p_quantity  INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as the function owner (service role), bypasses RLS
AS $$
DECLARE
  v_available INT;
  v_sold      INT;
BEGIN
  SELECT quantity_available, quantity_sold
    INTO v_available, v_sold
    FROM tickets
   WHERE id = p_ticket_id
     FOR UPDATE;            -- row-level lock to prevent race conditions

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket % not found', p_ticket_id;
  END IF;

  IF (v_sold + p_quantity) > v_available THEN
    RAISE EXCEPTION 'Ticket % oversold: available=%, sold=%, requested=%',
      p_ticket_id, v_available, v_sold, p_quantity;
  END IF;

  UPDATE tickets
     SET quantity_sold = quantity_sold + p_quantity,
         updated_at    = NOW()
   WHERE id = p_ticket_id;
END;
$$;

-- 5. Grant execute on the function to the service role and anon (webhook runs as service role)
GRANT EXECUTE ON FUNCTION increment_tickets_sold(UUID, INT) TO service_role;
GRANT EXECUTE ON FUNCTION increment_tickets_sold(UUID, INT) TO authenticated;
