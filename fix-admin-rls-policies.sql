-- Fix RLS policies to allow admins to update user roles

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY tablename, policyname;

-- Drop old restrictive policies that might be blocking admin updates
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.users;

-- Create new RLS policies that allow admins to manage users

-- 1. Allow reading profiles
CREATE POLICY "Allow reading user profiles"
ON public.users
FOR SELECT
USING (
  -- Users can read their own profile
  auth.uid() = id
  -- Admins can read any profile
  OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  -- Or public can read non-sensitive user data (optional)
  OR true  -- Allow public to see creator profiles
);

-- 2. Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
WITH CHECK (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 3. Allow admins to update any user (including roles)
CREATE POLICY "Allow admins to update any user"
ON public.users
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 4. Verify the user we're trying to update
SELECT id, email, full_name, role 
FROM public.users 
WHERE email = 'djkeyviiken254@gmail.com';

-- 5. Try to manually update the role to test
-- IMPORTANT: Change this to 'blogger' if you want to test
UPDATE public.users 
SET role = 'blogger' 
WHERE email = 'djkeyviiken254@gmail.com';

-- 6. Verify the update worked
SELECT id, email, full_name, role 
FROM public.users 
WHERE email = 'djkeyviiken254@gmail.com';
