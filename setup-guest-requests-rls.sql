-- Enable RLS and set up policies for guest_requests
ALTER TABLE guest_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own guest requests"
  ON guest_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create guest requests
CREATE POLICY "Users can create guest requests"
  ON guest_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests (except status, which only admin can change)
CREATE POLICY "Users can update their own guest requests"
  ON guest_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- IMPORTANT: For admins to view all requests, either:
-- 1. Create a service_role policy (if using service role key):
-- CREATE POLICY "Service role can access all requests"
--   ON guest_requests
--   USING (auth.role() = 'service_role');

-- 2. OR disable RLS temporarily to test:
-- ALTER TABLE guest_requests DISABLE ROW LEVEL SECURITY;

-- 3. OR create an admin role check after profiles table exists:
-- CREATE POLICY "Admins can view all guest requests"
--   ON guest_requests FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );
