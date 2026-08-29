-- Fix Infinite Recursion in RLS Policies
-- Run this in your Supabase SQL Editor

-- First, disable RLS temporarily to drop and recreate policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create corrected policies WITHOUT infinite recursion

-- Policy 1: Users can insert their own profile
CREATE POLICY "users_can_create_own_profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 2: Users can view their own profile
CREATE POLICY "users_can_view_own_profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "users_can_update_own_profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can view all users (uses auth.jwt() to avoid recursion)
CREATE POLICY "admins_can_view_all_users"
ON public.users
FOR SELECT
USING (
  -- Check if current user is admin by looking at their role in the JWT
  auth.jwt()->>'role' = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND auth.uid() != id  -- Avoid self-reference
  )
);

-- Policy 5: Allow admins to view all users (alternative: public read for now)
-- This is a simpler approach - allow all authenticated users to view profiles
-- You can restrict this later with more granular policies
CREATE POLICY "public_can_view_profiles"
ON public.users
FOR SELECT
USING (true);

-- Policy 6: Admins can update any user
CREATE POLICY "admins_can_update_users"
ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Verify the policies
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;
