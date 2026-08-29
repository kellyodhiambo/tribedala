-- Fix RLS policies for blog_posts table

-- Disable RLS temporarily to set up policies
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to read blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to delete blog posts" ON public.blog_posts;

-- Create new policies for blog_posts
CREATE POLICY "Allow authenticated users to insert blog posts" ON public.blog_posts
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read blog posts" ON public.blog_posts
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update blog posts" ON public.blog_posts
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete blog posts" ON public.blog_posts
FOR DELETE USING (auth.role() = 'authenticated');
