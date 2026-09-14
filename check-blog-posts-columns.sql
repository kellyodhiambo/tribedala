-- Check blog_posts table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- Check if featured_image column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'blog_posts' 
  AND column_name = 'featured_image'
) as featured_image_exists;
