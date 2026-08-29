-- Temporarily Disable RLS to Debug the Issue
-- Run this in your Supabase SQL Editor

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify the admin user exists
SELECT id, email, full_name, role, admin_role, verified, status FROM public.users 
WHERE email = 'amor@tribedala.com';
