-- Add featured_image column to blog_posts table if it doesn't exist

-- Check and add featured_image column
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
AND column_name = 'featured_image';

-- Show all columns in blog_posts
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;
