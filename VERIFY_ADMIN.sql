-- Verify admin user was created correctly
-- Run this in Supabase SQL Editor

-- Check if admin user profile exists
SELECT id, email, full_name, role, admin_role, verified, status 
FROM public.users 
WHERE id = 'c2dc9add-023d-49ad-8e00-c60158dab200'::uuid;

-- If the above returns nothing, run this to create it:
-- INSERT INTO public.users (
--   id,
--   email,
--   full_name,
--   role,
--   admin_role,
--   verified,
--   status,
--   created_at,
--   updated_at
-- )
-- VALUES (
--   'c2dc9add-023d-49ad-8e00-c60158dab200'::uuid,
--   'amor@tribedala.com',
--   'Admin',
--   'admin',
--   'super_admin',
--   true,
--   'active',
--   now(),
--   now()
-- );

-- Check all users in the system
SELECT id, email, full_name, role FROM public.users LIMIT 10;

-- Check if RLS policy is blocking the read
-- (This should be visible because 'admin' role should have read access)
