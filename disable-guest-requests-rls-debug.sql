-- TEMPORARY: Disable RLS on guest_requests table for debugging
-- This will allow us to see if data exists and test basic functionality
-- We'll re-enable RLS with proper policies after debugging

ALTER TABLE guest_requests DISABLE ROW LEVEL SECURITY;

-- Now verify it's disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'guest_requests';

-- Check how many records exist
SELECT COUNT(*) as total_guest_requests FROM guest_requests;

-- Show all records
SELECT id, user_id, name, email, request_type, status, created_at 
FROM guest_requests 
ORDER BY created_at DESC 
LIMIT 20;
