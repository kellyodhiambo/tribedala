-- Setup RLS policies for blog-images bucket

-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload blog images to their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public to view/download images
CREATE POLICY "Public can view blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'blog-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
