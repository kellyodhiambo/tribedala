-- Add parent_comment_id field to blog_comments table to support comment replies
ALTER TABLE blog_comments 
ADD COLUMN parent_comment_id uuid REFERENCES blog_comments(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX idx_blog_comments_parent ON blog_comments(parent_comment_id);
