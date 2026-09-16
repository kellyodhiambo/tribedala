-- Add RLS policies to existing guest_requests table

-- Enable RLS
ALTER TABLE guest_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own guest requests"
  ON guest_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create guest requests
CREATE POLICY "Users can create guest requests"
  ON guest_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests
CREATE POLICY "Users can update their own guest requests"
  ON guest_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow all authenticated users to view all requests (for admin access)
CREATE POLICY "Authenticated users can view all guest requests"
  ON guest_requests FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to update requests (for admin status updates)
CREATE POLICY "Authenticated users can update guest requests"
  ON guest_requests FOR UPDATE
  USING (auth.role() = 'authenticated');
