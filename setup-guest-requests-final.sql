-- MASTER FIX: Complete setup for guest_requests table
-- This resolves RLS policy conflicts and enables proper INSERT/SELECT/UPDATE

-- Step 1: Ensure RLS is enabled
ALTER TABLE guest_requests ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Users can create guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Users can insert guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Users can update their own guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Authenticated users can view all guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Authenticated users can update guest requests" ON guest_requests;
DROP POLICY IF EXISTS "All authenticated users can view all guest requests" ON guest_requests;
DROP POLICY IF EXISTS "All authenticated users can update guest requests" ON guest_requests;
DROP POLICY IF EXISTS "All authenticated can view all requests" ON guest_requests;
DROP POLICY IF EXISTS "All authenticated can update all requests" ON guest_requests;

-- Step 3: Create clean, non-conflicting policies
-- POLICY 1: Any authenticated user can INSERT their own request
CREATE POLICY "insert_own_request"
  ON guest_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- POLICY 2: Any authenticated user can VIEW their own request
CREATE POLICY "select_own_request"
  ON guest_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- POLICY 3: Any authenticated user can UPDATE their own request
CREATE POLICY "update_own_request"
  ON guest_requests 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- POLICY 4: All authenticated users can VIEW all requests (for admin panel)
-- This allows the admin dashboard to fetch all requests
CREATE POLICY "view_all_requests"
  ON guest_requests 
  FOR SELECT 
  USING (true);

-- POLICY 5: All authenticated users can UPDATE any request (for admin status changes)
-- This allows admins to update status and notes
CREATE POLICY "update_all_requests"
  ON guest_requests 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Step 4: Verify the policies are in place
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'guest_requests'
ORDER BY policyname;

-- Step 5: Confirm RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'guest_requests';
