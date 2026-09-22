-- Drop the problematic INSERT policy and recreate it correctly
DROP POLICY IF EXISTS "Anyone can purchase tickets" ON tickets;

-- Recreate with explicit CHECK clause (not WITH CHECK on INSERT, which is redundant)
CREATE POLICY "Anyone can purchase tickets"
  ON tickets FOR INSERT
  WITH CHECK (true);

-- Also verify service role can bypass
DROP POLICY IF EXISTS "Service role full access on tickets" ON tickets;
CREATE POLICY "Service role full access on tickets"
  ON tickets FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Test: Can anon insert?
-- SELECT current_user;
