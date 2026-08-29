-- Add address column to events table if it doesn't exist
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add any other missing columns
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS ticket_tiers JSONB;
