-- Diagnostic queries to check guest_requests table

-- 1. Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'guest_requests'
) AS table_exists;

-- 2. Count all records in guest_requests
SELECT COUNT(*) as total_requests FROM guest_requests;

-- 3. Show all records (if any)
SELECT id, user_id, name, email, request_type, status, created_at 
FROM guest_requests 
ORDER BY created_at DESC;

-- 4. Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'guest_requests';

-- 5. List all policies on guest_requests
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'guest_requests'
ORDER BY policyname;

-- 6. Check if current user is authenticated
SELECT auth.uid() as current_user_id, auth.role() as current_role;

-- 7. Try to fetch as authenticated user (test RLS)
SELECT COUNT(*) as visible_requests FROM guest_requests;
