-- Fix RLS Policies Blocking User Signup (Version 2)
-- Run this if you get "policy already exists" error
-- This version is safer - it only drops and recreates if policies exist

-- =============================================================================
-- STEP 1: DISABLE RLS TEMPORARILY
-- =============================================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 2: DROP ALL POLICIES THAT EXIST
-- =============================================================================
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "public_read_profiles" ON public.users;
DROP POLICY IF EXISTS "admins_view_all" ON public.users;
DROP POLICY IF EXISTS "admins_update_any" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "users_can_create_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "admins_can_view_all_users" ON public.users;
DROP POLICY IF EXISTS "admins_can_update_users" ON public.users;
DROP POLICY IF EXISTS "public_can_view_profiles" ON public.users;

-- =============================================================================
-- STEP 3: RE-ENABLE RLS
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 4: CREATE NEW POLICIES (SIMPLE & CLEAN)
-- =============================================================================

-- Allow users to INSERT their own profile (needed for signup)
CREATE POLICY "users_insert_own_profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to SELECT their own profile
CREATE POLICY "users_select_own_profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "users_update_own_profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ALLOW PUBLIC TO READ PROFILES (for app functionality)
CREATE POLICY "public_read_profiles"
ON public.users
FOR SELECT
USING (true);

-- =============================================================================
-- STEP 5: VERIFY
-- =============================================================================
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
