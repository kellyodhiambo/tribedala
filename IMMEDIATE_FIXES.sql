-- =============================================================================
-- TRIBEDALA IMMEDIATE FIXES - RUN THESE IN SUPABASE SQL EDITOR
-- =============================================================================
-- Purpose: Fix the broken auth flow and enable the app to work
-- Timeline: Run these 3 SQL blocks in order
-- =============================================================================

-- BLOCK 1: DISABLE RLS AND DROP PROBLEMATIC POLICIES
-- =============================================================================
-- This disables RLS temporarily so we can safely drop and recreate policies
-- without infinite recursion errors

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_create_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "admins_can_view_all_users" ON public.users;
DROP POLICY IF EXISTS "admins_can_update_users" ON public.users;
DROP POLICY IF EXISTS "public_can_view_profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- BLOCK 2: RECREATE CORRECTED RLS POLICIES (NO INFINITE RECURSION)
-- =============================================================================

-- Policy 1: Users can insert their own profile during signup
CREATE POLICY "users_insert_own_profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 2: Users can always view their own profile (needed for login)
CREATE POLICY "users_select_own_profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "users_update_own_profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Allow public read for now (YOU CAN RESTRICT LATER)
-- This is a temporary measure to allow admin/features to work
-- Later: Replace with more granular permissions
CREATE POLICY "public_read_profiles"
ON public.users
FOR SELECT
USING (true);

-- Policy 5: Admins can update any user (simplified to avoid recursion)
CREATE POLICY "admin_update_any_user"
ON public.users
FOR UPDATE
USING (
  -- Only allow if current user has admin_role set in their profile
  -- This is checked in a separate lookup to avoid recursion
  auth.jwt()->>'role' = 'authenticated' AND
  auth.uid() IN (
    SELECT id FROM public.users WHERE admin_role IS NOT NULL LIMIT 1
  )
);

-- =============================================================================
-- BLOCK 3: CREATE MISSING TABLES FOR INCOMPLETE FEATURES
-- =============================================================================

-- Create inquiries table for contact form
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create payments table for ticket sales
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  phone_number text NOT NULL,
  mpesa_request_id text,
  mpesa_checkout_request_id text UNIQUE,
  status text DEFAULT 'initiated' CHECK (status IN ('initiated', 'pending', 'completed', 'failed')),
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Create tickets table for event attendance
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  tier_name text NOT NULL,
  price integer NOT NULL,
  quantity integer DEFAULT 1,
  qr_code text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  used_at timestamp with time zone
);

-- Create audit_logs table for admin tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES public.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================================================
-- BLOCK 4: ENABLE RLS ON NEW TABLES (OPTIONAL - CAN DO LATER)
-- =============================================================================

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Inquiries: Admin can view all, anyone can insert
CREATE POLICY "inquiries_insert_public" ON public.inquiries
FOR INSERT WITH CHECK (true);

CREATE POLICY "inquiries_select_admin" ON public.inquiries
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND admin_role IS NOT NULL)
);

-- Payments: Users can view their own, admins can view all
CREATE POLICY "payments_select_own" ON public.payments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_select_admin" ON public.payments
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND admin_role IS NOT NULL)
);

-- Tickets: Users can view their own
CREATE POLICY "tickets_select_own" ON public.tickets
FOR SELECT USING (auth.uid() = user_id);

-- Audit logs: Admins only
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND admin_role IS NOT NULL)
);

-- =============================================================================
-- VERIFICATION QUERIES - RUN THESE TO CONFIRM
-- =============================================================================

-- Check 1: Admin user exists
SELECT id, email, full_name, role, admin_role, verified FROM public.users 
WHERE email = 'amor@tribedala.com';

-- Check 2: RLS is enabled
SELECT n.nspname as schemaname, c.relname as tablename, c.relrowsecurity as rowsecurity 
FROM pg_class c
INNER JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND c.relname = 'users';

-- Check 3: Policies exist
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- Check 4: New tables created
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =============================================================================
-- TROUBLESHOOTING
-- =============================================================================

/*
If you still see "infinite recursion" error after running the above:

1. Make sure you ran Block 1 (disable RLS) first
2. Check that all old policies are dropped (Block 2 shows the drop statements)
3. Run Block 3 and 4 to create new policies

If login STILL fails after this:

1. Temporarily disable RLS:
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

2. Test login - if it works, RLS is the issue
3. Then enable RLS again:
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

4. If step 2 doesn't work, the issue is elsewhere (check Supabase auth settings)
*/

-- =============================================================================
-- WHAT TO DO NEXT
-- =============================================================================

/*
After running these SQL blocks:

1. Try logging in as admin (amor@tribedala.com)
2. You should see the admin dashboard
3. If you see any errors, note them and we'll debug further

Then we can work on:
- Completing the contact form (needs code change in React)
- Fixing the profile save handler (empty function)
- Adding payment integration (M-Pesa)
- SEO optimization

Good luck! 🚀
*/
