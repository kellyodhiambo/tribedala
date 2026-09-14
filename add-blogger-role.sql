-- Add blogger role support to the system
-- This SQL adds the necessary constraints and indexes for the blogger role

-- Update the users table to support blogger role (if not already supported by CHECK constraint)
-- The role column should accept: member, creator, blogger, organizer, business, official, admin

-- Create index for faster queries on blogger role
CREATE INDEX IF NOT EXISTS idx_users_role_blogger ON public.users(role) WHERE role = 'blogger';

-- Create index for approved bloggers/creators
CREATE INDEX IF NOT EXISTS idx_users_approved_creators ON public.users(creator_approved, role) 
WHERE creator_approved = TRUE AND (role = 'creator' OR role = 'blogger');

-- Create index for blog posts by author
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_published ON public.blog_posts(author_id, status, published_at DESC) 
WHERE status = 'published';

-- Update RLS policy for blog_posts to allow bloggers and creators to insert their own posts
-- Assuming blog_posts table has author_id, status columns

-- Allow bloggers/creators to select published posts (already should exist)
-- Allow authenticated users to insert blog posts if they're a blogger/creator
DO $$
BEGIN
  -- Check if the policy exists first
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' 
    AND policyname = 'Users can create blog posts if they are creator or blogger'
  ) THEN
    CREATE POLICY "Users can create blog posts if they are creator or blogger"
    ON public.blog_posts
    FOR INSERT
    WITH CHECK (
      auth.uid() = author_id 
      AND (
        (SELECT role FROM auth.users WHERE id = auth.uid()) IN ('creator', 'blogger', 'official', 'admin')
        OR EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() 
          AND role IN ('creator', 'blogger', 'official', 'admin')
        )
      )
    );
  END IF;
END $$;

-- Allow bloggers/creators to update their own posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' 
    AND policyname = 'Users can update their own blog posts'
  ) THEN
    CREATE POLICY "Users can update their own blog posts"
    ON public.blog_posts
    FOR UPDATE
    USING (
      auth.uid() = author_id 
      AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('creator', 'blogger', 'official', 'admin')
    )
    WITH CHECK (
      auth.uid() = author_id 
      AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('creator', 'blogger', 'official', 'admin')
    );
  END IF;
END $$;

-- Allow everyone to select published blog posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' 
    AND policyname = 'Anyone can view published blog posts'
  ) THEN
    CREATE POLICY "Anyone can view published blog posts"
    ON public.blog_posts
    FOR SELECT
    USING (status = 'published' OR auth.uid() = author_id);
  END IF;
END $$;
