-- ============================================================
-- FIX: Make tickets table support guest (anonymous) purchases
-- Paste this in Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Remove NOT NULL constraints that block guest checkout
ALTER TABLE tickets ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE tickets ALTER COLUMN qr_code DROP NOT NULL;
ALTER TABLE tickets ALTER COLUMN payment_reference DROP NOT NULL;

-- 2. Drop ALL existing policies on tickets (clean slate)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'tickets' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON tickets';
  END LOOP;
END $$;

-- 3. Re-create clean policies

-- Service role: full access (needed by webhook Edge Function)
CREATE POLICY "Service role full access on tickets"
  ON tickets FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Anyone (anon + logged-in) can INSERT a purchase
CREATE POLICY "Anyone can purchase tickets"
  ON tickets FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Logged-in users can read their own purchases
CREATE POLICY "Users can read their own tickets"
  ON tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update payment status on their own tickets
CREATE POLICY "Users can update their own tickets"
  ON tickets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Anonymous users can update guest tickets (payment status polling)
CREATE POLICY "Anon can update guest tickets"
  ON tickets FOR UPDATE TO anon
  USING (user_id IS NULL);
