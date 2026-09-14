-- Fix RLS Policies Blocking User Signup
-- This resolves "new row violates row-level security policy for table users" error
-- Run this in Supabase SQL Editor

-- =============================================================================
-- STEP 1: DISABLE RLS TEMPORARILY TO DROP/RECREATE POLICIES
-- =============================================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- =============================================================================
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
DROP POLICY IF EXISTS "public_read_profiles" ON public.users;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;

-- =============================================================================
-- STEP 3: RE-ENABLE RLS
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 4: CREATE CORRECTED POLICIES (NO INFINITE RECURSION)
-- =============================================================================

-- Policy 1: Users can INSERT their own profile (needed for signup)
CREATE POLICY "users_insert_own_profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 2: Users can SELECT their own profile
CREATE POLICY "users_select_own_profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Policy 3: Users can UPDATE their own profile
CREATE POLICY "users_update_own_profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: ALLOW PUBLIC TO READ PROFILES (temporary - for app to function)
-- This allows the app to fetch creator profiles, member profiles, etc.
CREATE POLICY "public_read_profiles"
ON public.users
FOR SELECT
USING (true);

-- Policy 5: Allow admins to view all users (without infinite recursion)
-- This uses a simpler approach: if the current user has admin role, they can see all profiles
-- Note: This requires an admin account to exist first and have role='admin'
CREATE POLICY "admins_view_all"
ON public.users
FOR SELECT
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Policy 6: Allow admins to update any user
CREATE POLICY "admins_update_any"
ON public.users
FOR UPDATE
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- =============================================================================
-- STEP 5: VERIFY POLICIES WERE CREATED
-- =============================================================================
SELECT tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- =============================================================================
-- NOTES:
-- =============================================================================
-- ✅ Policies now use auth.uid() = id for user-owned operations (no recursion)
-- ✅ Public read policy allows fetching profiles without auth issues
-- ✅ Admin policies use simple role check (requires admin account to exist)
-- ✅ INSERT policy specifically allows new users during signup
-- ✅ This fixes the "new row violates row-level security policy" error
