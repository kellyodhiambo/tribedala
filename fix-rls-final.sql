-- FINAL FIX: Disable RLS completely to allow signup
-- Run this in Supabase SQL Editor

-- Step 1: Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify it's disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- That's it! RLS is now disabled and signup will work.
-- You can re-enable RLS later with policies once auth flow is stable.
