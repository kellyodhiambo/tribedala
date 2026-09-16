-- Add admin RLS policies to guest_requests table
-- Run this AFTER profiles table is created with role column

-- Admins can view all guest requests
CREATE POLICY "Admins can view all guest requests"
  ON guest_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update guest requests (including status)
CREATE POLICY "Admins can update guest requests"
  ON guest_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
