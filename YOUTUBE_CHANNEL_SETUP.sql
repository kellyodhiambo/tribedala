-- YouTube Channel Auto-Import Setup
-- This migration adds YouTube channel ID support to shows and episodes tables

-- Step 1: Add youtube_channel_id to shows table
ALTER TABLE public.shows ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT;

-- Step 2: Add youtube_video_id to episodes table (for tracking)
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS youtube_imported_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Update all existing shows with the YouTube channel ID
-- All three shows (Podcast, Interview, Girlies) use the same channel: UCsoMDHBsGyqkGpzlz7boodA
UPDATE public.shows 
SET youtube_channel_id = 'UCsoMDHBsGyqkGpzlz7boodA'
WHERE youtube_channel_id IS NULL OR youtube_channel_id = '';

-- Step 4: Create unique constraint on youtube_video_id to prevent duplicates
-- Note: NULL values are allowed and don't trigger uniqueness constraint
ALTER TABLE public.episodes ADD CONSTRAINT unique_youtube_video_id UNIQUE (youtube_video_id);

-- Verification: Check that all shows have YouTube channel ID
SELECT id, slug, name, youtube_channel_id 
FROM public.shows;

-- Verification: Check episodes structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'episodes' 
ORDER BY ordinal_position;
