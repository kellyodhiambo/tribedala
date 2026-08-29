-- Fix RLS policies for blog_comments table

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Allow authenticated users to read comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Allow authenticated users to update own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Allow authenticated users to delete own comments" ON public.blog_comments;

-- Create new policies for blog_comments
CREATE POLICY "Allow authenticated users to insert comments" ON public.blog_comments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read comments" ON public.blog_comments
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update own comments" ON public.blog_comments
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete own comments" ON public.blog_comments
FOR DELETE USING (auth.role() = 'authenticated');
