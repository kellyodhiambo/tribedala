-- Add creator request fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS creator_request BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creator_request_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS creator_request_reason TEXT,
ADD COLUMN IF NOT EXISTS creator_request_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS creator_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS creator_approved_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS creator_approved_by UUID REFERENCES public.users(id);

-- Create index for faster queries on approved creators
CREATE INDEX IF NOT EXISTS idx_users_creator_approved ON public.users(creator_approved) WHERE creator_approved = TRUE;

-- Create index for pending creator requests
CREATE INDEX IF NOT EXISTS idx_users_creator_request_pending ON public.users(creator_request) WHERE creator_request = TRUE AND creator_approved = FALSE;
