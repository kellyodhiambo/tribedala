-- =============================================================================
-- TRIBEDALA IMMEDIATE FIXES v2 - SIMPLIFIED & CORRECTED
-- =============================================================================
-- Run this entire file in Supabase SQL Editor
-- All blocks are independent and can be run together
-- =============================================================================

-- BLOCK 1: DISABLE RLS AND DROP PROBLEMATIC POLICIES
-- =============================================================================

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
-- BLOCK 2: RECREATE CORRECTED RLS POLICIES
-- =============================================================================

-- Allow users to view their own profile
CREATE POLICY "users_select_own_profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Allow users to create their own profile
CREATE POLICY "users_insert_own_profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own_profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow public to read profiles (temporary - for app to function)
CREATE POLICY "public_read_profiles"
ON public.users
FOR SELECT
USING (true);

-- =============================================================================
-- BLOCK 3: CREATE MISSING TABLES
-- =============================================================================

-- Inquiries table for contact form
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

-- Payments table for M-Pesa transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  phone_number text NOT NULL,
  mpesa_request_id text,
  mpesa_checkout_request_id text UNIQUE,
  status text DEFAULT 'initiated',
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Tickets table for event attendance
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  tier_name text NOT NULL,
  price integer NOT NULL,
  quantity integer DEFAULT 1,
  qr_code text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  used_at timestamp with time zone
);

-- Audit logs for admin tracking
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
-- BLOCK 4: ADD INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify admin user exists
SELECT id, email, full_name, role, admin_role, verified FROM public.users 
WHERE email = 'amor@tribedala.com';

-- Verify RLS is enabled on users table
SELECT relname, relrowsecurity FROM pg_class
WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Verify policies exist
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- Verify new tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('inquiries', 'payments', 'tickets', 'audit_logs')
ORDER BY tablename;

