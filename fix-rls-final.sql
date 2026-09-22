-- Drop ALL policies on tickets and recreate from scratch
DROP POLICY IF EXISTS "Anon can update guest tickets" ON tickets;
DROP POLICY IF EXISTS "Anyone can purchase tickets" ON tickets;
DROP POLICY IF EXISTS "Service role full access on tickets" ON tickets;
DROP POLICY IF EXISTS "Users can read their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;

-- RLS is enabled, but we need policies that actually work

-- 1. Service role: unrestricted access
CREATE POLICY "Service role full access on tickets"
  ON tickets FOR ALL TO service_role
  USING (true);

-- 2. Anon can INSERT (for guest checkout)
CREATE POLICY "Anon INSERT tickets"
  ON tickets FOR INSERT TO anon
  WITH CHECK (true);

-- 3. Authenticated users can INSERT
CREATE POLICY "Authenticated INSERT tickets"
  ON tickets FOR INSERT TO authenticated
  WITH CHECK (true);

-- 4. Authenticated users can update their own tickets
CREATE POLICY "Authenticated UPDATE own tickets"
  ON tickets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- 5. Anon can update guest tickets (user_id IS NULL)
CREATE POLICY "Anon UPDATE guest tickets"
  ON tickets FOR UPDATE TO anon
  USING (user_id IS NULL);

-- 6. Authenticated users can read their own
CREATE POLICY "Authenticated SELECT own tickets"
  ON tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
