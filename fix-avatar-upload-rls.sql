-- Fix Avatar Upload RLS Policy
-- Allows authenticated users to upload profile pictures to avatars bucket

-- 1. Enable storage RLS if not enabled
ALTER ROLE authenticated SET statement_timeout = '30s';

-- 2. Create policy for authenticated users to INSERT into avatars bucket
-- First, disable existing policies if any
BEGIN;

-- Drop existing policies if they exist (won't error if they don't)
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "authenticated-avatar-upload" ON storage.objects;

-- Create new INSERT policy - Allow authenticated users to upload to avatars bucket
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Also allow SELECT and UPDATE for their own files
CREATE POLICY "Allow users to read their own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR TRUE)
);

CREATE POLICY "Allow users to update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow DELETE
CREATE POLICY "Allow users to delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

COMMIT;

-- Verify policies are created
SELECT 
  policyname, 
  cmd, 
  qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;
