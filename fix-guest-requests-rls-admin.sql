-- Fix guest requests RLS to allow admin viewing
-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view their own guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Users can create guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Users can update their own guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Authenticated users can view all guest requests" ON guest_requests;
DROP POLICY IF EXISTS "Authenticated users can update guest requests" ON guest_requests;

-- Create fresh policies
-- 1. Users can view their own requests
CREATE POLICY "Users can view their own guest requests"
  ON guest_requests FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert their own requests
CREATE POLICY "Users can insert guest requests"
  ON guest_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own requests
CREATE POLICY "Users can update their own guest requests"
  ON guest_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow all authenticated users to view all requests (for admin panel)
CREATE POLICY "All authenticated users can view all guest requests"
  ON guest_requests FOR SELECT
  USING (true);

-- 5. Allow all authenticated users to update (admin changes status)
CREATE POLICY "All authenticated users can update guest requests"
  ON guest_requests FOR UPDATE
  USING (true);
