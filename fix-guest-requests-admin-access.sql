-- Add missing policies for admin access to guest_requests

-- Allow all authenticated users to view all requests (for admin dashboard)
CREATE POLICY IF NOT EXISTS "Authenticated users can view all guest requests"
  ON guest_requests FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to update requests (for admin status updates)
CREATE POLICY IF NOT EXISTS "Authenticated users can update guest requests"
  ON guest_requests FOR UPDATE
  USING (auth.role() = 'authenticated');
