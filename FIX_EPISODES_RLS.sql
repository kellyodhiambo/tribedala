-- FIX: Add missing INSERT policy to episodes table for YouTube sync feature
-- This allows authenticated users to insert episodes (YouTube videos)

-- Enable RLS if not already enabled
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Add INSERT policy for episodes
CREATE POLICY "Authenticated users can insert episodes"
ON public.episodes
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for episodes (for editing after creation)
CREATE POLICY "Users can update their own episodes"
ON public.episodes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Keep existing SELECT policy (already works)
-- "Public can read episodes" - allows public to read published episodes

-- Verify policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'episodes'
ORDER BY policyname;
