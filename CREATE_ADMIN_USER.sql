-- Create Admin User Profile
-- Run this in your new Supabase project's SQL Editor
-- This links your admin user (created in Auth) to the users table

INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  admin_role,
  verified,
  status,
  created_at,
  updated_at
)
VALUES (
  'c2dc9add-023d-49ad-8e00-c60158dab200'::uuid,
  'amor@tribedala.com',
  'Admin',
  'admin',
  'super_admin',
  true,
  'active',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  admin_role = 'super_admin',
  verified = true,
  updated_at = now();

-- Verify the user was created
SELECT id, email, full_name, role, admin_role, verified FROM public.users WHERE id = 'c2dc9add-023d-49ad-8e00-c60158dab200'::uuid;
