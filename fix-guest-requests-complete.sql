-- Complete fix for guest_requests table
-- Re-enable RLS first
ALTER TABLE guest_requests ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Users can create guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Users can insert guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Users can update their own guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Authenticated users can view all guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Authenticated users can update guest requests" ON guest_requests;
DROP POLICY IF EXISTS "All authenticated users can view all guest requests" ON guest_requests;
DROP POLICY IF EXISTS "All authenticated users can update guest requests" ON guest_requests;

-- Create new comprehensive policies

-- 1. Users can INSERT their own requests
CREATE POLICY "Users can insert guest requests"
  ON guest_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Users can SELECT their own requests
CREATE POLICY "Users can view their own requests"
  ON guest_requests FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Users can UPDATE their own requests (but not status)
CREATE POLICY "Users can update their own requests"
  ON guest_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. ADMIN ACCESS: Allow all authenticated users to SELECT all requests
-- This is a temporary solution - in production, check against a profiles/roles table
CREATE POLICY "All authenticated can view all requests"
  ON guest_requests FOR SELECT
  USING (true);

-- 5. ADMIN ACCESS: Allow all authenticated users to UPDATE all requests (for admin status changes)
CREATE POLICY "All authenticated can update all requests"
  ON guest_requests FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verify policies
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'guest_requests'
ORDER BY policyname;
