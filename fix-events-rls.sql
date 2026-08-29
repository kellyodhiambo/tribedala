-- Fix RLS policies for events table to allow authenticated users to create events

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to create events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated users to read events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated users to update events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated users to delete events" ON public.events;

-- Create new policies for events table
CREATE POLICY "Allow authenticated users to create events" ON public.events
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read events" ON public.events
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update events" ON public.events
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete events" ON public.events
FOR DELETE USING (auth.role() = 'authenticated');

-- Also fix storage.objects policies for the content bucket
DROP POLICY IF EXISTS "content_public_read" ON storage.objects;
DROP POLICY IF EXISTS "content_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "content_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "content_authenticated_delete" ON storage.objects;

CREATE POLICY "content_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'content');

CREATE POLICY "content_authenticated_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'content' AND auth.role() = 'authenticated');

CREATE POLICY "content_authenticated_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'content' AND auth.role() = 'authenticated');

CREATE POLICY "content_authenticated_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'content' AND auth.role() = 'authenticated');
