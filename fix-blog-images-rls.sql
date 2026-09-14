-- Fix RLS policies for blog-images bucket - allow authenticated users to upload

-- Drop all existing policies on storage.objects for blog-images
DROP POLICY IF EXISTS "Users can upload blog images to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own blog images" ON storage.objects;

-- Simple and permissive policies:

-- 1. Allow authenticated users to upload/insert images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- 2. Allow anyone to view/read blog images
CREATE POLICY "Anyone can view blog images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-images');

-- 3. Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- 4. Allow authenticated users to update images
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');
