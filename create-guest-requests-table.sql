-- Create guest_requests table for managing show guest and creator service requests
CREATE TABLE IF NOT EXISTS guest_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Request type: 'guest' for show guest requests, 'creator' for creator services
  request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('guest', 'creator')),
  
  -- For guest requests: which show(s) they want to be on (can be multiple, stored as array)
  shows UUID[] DEFAULT NULL,
  
  -- Personal details
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Professional info
  bio TEXT,
  website VARCHAR(500),
  social_handles JSONB DEFAULT NULL, -- {twitter: '', instagram: '', tiktok: '', youtube: ''}
  
  -- Guest-specific fields
  guest_topics TEXT, -- What they want to discuss
  previous_podcast_experience TEXT,
  
  -- Creator services fields
  service_type VARCHAR(100), -- e.g., 'production', 'editing', 'writing', 'design'
  portfolio_link VARCHAR(500),
  service_description TEXT,
  
  -- Media
  profile_image_url VARCHAR(500),
  
  -- Status and metadata
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_guest_requests_user_id ON guest_requests(user_id);
CREATE INDEX idx_guest_requests_request_type ON guest_requests(request_type);
CREATE INDEX idx_guest_requests_status ON guest_requests(status);
CREATE INDEX idx_guest_requests_created_at ON guest_requests(created_at DESC);

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

-- Users can update their own requests (except status, which only admin can change)
CREATE POLICY "Users can update their own guest requests"
  ON guest_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

-- Add updated_at trigger
CREATE TRIGGER guest_requests_updated_at
  BEFORE UPDATE ON guest_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
