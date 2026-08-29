-- Add missing columns to blog_comments table if they don't exist
ALTER TABLE blog_comments
ADD COLUMN IF NOT EXISTS user_name text,
ADD COLUMN IF NOT EXISTS user_avatar text,
ADD COLUMN IF NOT EXISTS parent_comment_id uuid REFERENCES blog_comments(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON blog_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
