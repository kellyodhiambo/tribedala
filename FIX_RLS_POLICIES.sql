-- Fix RLS Policies for Users Table
-- Run this in your new Supabase project's SQL Editor
-- This allows users to read their own profile

-- Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "users_create_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_read_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_delete_own_profile" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- CREATE: Anyone authenticated can create their own profile
CREATE POLICY "users_insert_own_profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- READ: Users can read their own profile
CREATE POLICY "users_select_own_profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- UPDATE: Users can update their own profile
CREATE POLICY "users_update_own_profile" ON public.users
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- DELETE: Users can delete their own profile
CREATE POLICY "users_delete_own_profile" ON public.users
FOR DELETE USING (auth.uid() = id);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';
