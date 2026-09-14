-- TribeDala Complete Database Setup for New Supabase Project
-- Run this entire file in your new Supabase project's SQL Editor
-- =====================================================
-- This will set up:
-- 1. All required tables
-- 2. Row Level Security policies
-- 3. Default data (services)
-- 4. Admin user profile
-- =====================================================

-- Step 1: ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Step 2: CREATE ALL TABLES
-- =====================================================

-- Users table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text DEFAULT ''::text,
  avatar_url text DEFAULT ''::text,
  role text DEFAULT 'member'::text,
  creator_category text DEFAULT 'other'::text,
  admin_role text,
  bio text DEFAULT ''::text,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  social_links jsonb,
  portfolio_links jsonb,
  location text DEFAULT ''::text,
  status text DEFAULT 'active'::text,
  notification_email boolean DEFAULT true,
  notification_inapp boolean DEFAULT true,
  privacy_profile_visible boolean DEFAULT true,
  privacy_allow_messages boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Shows table
CREATE TABLE IF NOT EXISTS public.shows (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  brand text NOT NULL,
  description text DEFAULT ''::text,
  cover_image text DEFAULT ''::text,
  accent_color text DEFAULT '#D4A853'::text,
  hosts jsonb,
  youtube_channel_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shows_pkey PRIMARY KEY (id)
);

-- Episodes table
CREATE TABLE IF NOT EXISTS public.episodes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  show_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text DEFAULT ''::text,
  type text DEFAULT 'podcast'::text,
  cover_image text DEFAULT ''::text,
  audio_url text DEFAULT ''::text,
  video_url text DEFAULT ''::text,
  duration integer DEFAULT 0,
  guest_names jsonb,
  youtube_video_id text,
  youtube_imported_at timestamp with time zone,
  published_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'published'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT episodes_pkey PRIMARY KEY (id),
  CONSTRAINT episodes_show_id_fkey FOREIGN KEY (show_id) REFERENCES public.shows(id) ON DELETE CASCADE,
  CONSTRAINT unique_youtube_video_id UNIQUE (youtube_video_id)
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text DEFAULT ''::text,
  content text DEFAULT ''::text,
  cover_image text DEFAULT ''::text,
  category text DEFAULT 'General'::text,
  author_id uuid,
  tags jsonb,
  published_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'draft'::text,
  approval_status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT ''::text,
  cover_image text DEFAULT ''::text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  venue text DEFAULT ''::text,
  venue_address text DEFAULT ''::text,
  organizer_id uuid,
  status text DEFAULT 'upcoming'::text,
  ticket_tiers jsonb,
  total_capacity integer DEFAULT 0,
  tickets_sold integer DEFAULT 0,
  time text DEFAULT '14:00',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  tier_name text DEFAULT 'General'::text,
  price integer DEFAULT 0,
  quantity integer DEFAULT 1,
  qr_code text DEFAULT ''::text,
  status text DEFAULT 'reserved'::text,
  payment_reference text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tickets_pkey PRIMARY KEY (id),
  CONSTRAINT tickets_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
  CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'ri-briefcase-line',
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);

-- Creator applications table
CREATE TABLE IF NOT EXISTS public.creator_applications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  role_requested text NOT NULL,
  category text DEFAULT 'other'::text,
  portfolio_url text DEFAULT ''::text,
  sample_work_urls jsonb,
  reason text DEFAULT ''::text,
  status text DEFAULT 'pending'::text,
  reviewed_by uuid,
  review_notes text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT creator_applications_pkey PRIMARY KEY (id),
  CONSTRAINT creator_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT creator_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Service requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  service_type text DEFAULT 'other'::text,
  details text DEFAULT ''::text,
  budget_range text DEFAULT ''::text,
  contact_email text DEFAULT ''::text,
  timeline text DEFAULT ''::text,
  status text DEFAULT 'pending'::text,
  assigned_to uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT service_requests_pkey PRIMARY KEY (id),
  CONSTRAINT service_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT service_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Chat channels table
CREATE TABLE IF NOT EXISTS public.chat_channels (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text DEFAULT 'group'::text,
  category text DEFAULT ''::text,
  created_by uuid,
  is_opportunity_board boolean DEFAULT false,
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_channels_pkey PRIMARY KEY (id),
  CONSTRAINT chat_channels_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  channel_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text DEFAULT ''::text,
  reply_to uuid,
  read_by jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT chat_messages_reply_to_fkey FOREIGN KEY (reply_to) REFERENCES public.chat_messages(id) ON DELETE CASCADE
);

-- Chat channel members table
CREATE TABLE IF NOT EXISTS public.chat_channel_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  last_read_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_channel_members_pkey PRIMARY KEY (id),
  CONSTRAINT chat_channel_members_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  CONSTRAINT chat_channel_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text DEFAULT 'system'::text,
  title text DEFAULT ''::text,
  body text DEFAULT ''::text,
  link text DEFAULT ''::text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  followed_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT follows_followed_id_fkey FOREIGN KEY (followed_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Blog comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_comments_pkey PRIMARY KEY (id),
  CONSTRAINT blog_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  CONSTRAINT blog_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =====================================================
-- Step 3: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Step 4: CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- ===== USERS POLICIES =====
CREATE POLICY "users_create_own_profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_read_own_profile"
ON public.users
FOR SELECT
USING (auth.uid() = id OR role = 'admin');

CREATE POLICY "users_update_own_profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own_profile"
ON public.users
FOR DELETE
USING (auth.uid() = id);

-- ===== SHOWS POLICIES =====
CREATE POLICY "shows_public_read"
ON public.shows
FOR SELECT
USING (true);

-- ===== EPISODES POLICIES =====
CREATE POLICY "episodes_public_read"
ON public.episodes
FOR SELECT
USING (true);

-- ===== BLOG POSTS POLICIES =====
CREATE POLICY "blog_posts_public_read_published"
ON public.blog_posts
FOR SELECT
USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "blog_posts_author_insert"
ON public.blog_posts
FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "blog_posts_author_update"
ON public.blog_posts
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- ===== EVENTS POLICIES =====
CREATE POLICY "events_public_read"
ON public.events
FOR SELECT
USING (true);

-- ===== TICKETS POLICIES =====
CREATE POLICY "tickets_user_read_own"
ON public.tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "tickets_organizer_read"
ON public.tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = tickets.event_id
      AND e.organizer_id = auth.uid()
  )
);

CREATE POLICY "tickets_user_insert"
ON public.tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ===== SERVICES POLICIES =====
CREATE POLICY "services_public_read"
ON public.services
FOR SELECT
USING (true);

-- ===== CREATOR APPLICATIONS POLICIES =====
CREATE POLICY "creator_apps_user_read_own"
ON public.creator_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "creator_apps_admin_read_all"
ON public.creator_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "creator_apps_user_insert"
ON public.creator_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ===== SERVICE REQUESTS POLICIES =====
CREATE POLICY "service_reqs_user_read_own"
ON public.service_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "service_reqs_admin_read_all"
ON public.service_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "service_reqs_user_insert"
ON public.service_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ===== NOTIFICATIONS POLICIES =====
CREATE POLICY "notifications_user_read_own"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "notifications_user_insert"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_user_update_own"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ===== FOLLOWS POLICIES =====
CREATE POLICY "follows_authenticated_insert"
ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_public_read"
ON public.follows
FOR SELECT
USING (true);

-- ===== CHAT CHANNELS POLICIES =====
CREATE POLICY "chat_channels_public_read"
ON public.chat_channels
FOR SELECT
USING (true);

CREATE POLICY "chat_channels_member_read"
ON public.chat_channels
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_channel_members m
    WHERE m.channel_id = chat_channels.id
      AND m.user_id = auth.uid()
  )
);

-- ===== CHAT MESSAGES POLICIES =====
CREATE POLICY "chat_messages_member_read"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_channel_members m
    WHERE m.channel_id = chat_messages.channel_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "chat_messages_sender_insert"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- ===== CHAT CHANNEL MEMBERS POLICIES =====
CREATE POLICY "chat_channel_members_read"
ON public.chat_channel_members
FOR SELECT
USING (true);

CREATE POLICY "chat_channel_members_insert"
ON public.chat_channel_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ===== BLOG COMMENTS POLICIES =====
CREATE POLICY "blog_comments_public_read"
ON public.blog_comments
FOR SELECT
USING (true);

CREATE POLICY "blog_comments_authenticated_insert"
ON public.blog_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Step 5: SEED SHOWS WITH YOUTUBE INTEGRATION
-- =====================================================

INSERT INTO public.shows (
  id,
  slug,
  name,
  brand,
  description,
  cover_image,
  accent_color,
  hosts,
  youtube_channel_id,
  created_at,
  updated_at
)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'girlies',
    'Tribe Dala Girlies',
    'TribeDala',
    'Stories, insights, and conversations celebrating women innovators and creators in our community.',
    'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/0cf972b6-a97a-491c-8588-7dd50bbda12e_compressed_stock-girlies-aa.webp',
    '#D4A853',
    '["Hosted by TribeDala Team"]'::jsonb,
    'UCsoMDHBsGyqkGpzlz7boodA',
    now(),
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'podcast-hub',
    'TribeDala Podcast Hub',
    'TribeDala',
    'Deep-dive conversations with innovators, entrepreneurs, and creators shaping East Africa.',
    'https://via.placeholder.com/400x400?text=TribeDala+Podcast',
    '#D4A853',
    '["TribeDala Team"]'::jsonb,
    'UCsoMDHBsGyqkGpzlz7boodA',
    now(),
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'interviews',
    'The Interviews',
    'TribeDala',
    'One-on-one conversations with compelling voices from across the continent.',
    'https://via.placeholder.com/400x400?text=The+Interviews',
    '#D4A853',
    '["Interview Team"]'::jsonb,
    'UCsoMDHBsGyqkGpzlz7boodA',
    now(),
    now()
  )
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Step 5b: SEED DEFAULT SERVICES
-- =====================================================

INSERT INTO public.services (title, description, icon, features)
VALUES
  (
    'Content Creation',
    'Professional podcast production, video shoots, photo sessions, and blog writing tailored to your brand voice.',
    'ri-video-line',
    '["Podcast recording & editing","Video production & post-production","Blog & article writing","Social media content strategy","Brand storytelling"]'::jsonb
  ),
  (
    'Marketing & Promotion',
    'Social media strategy, influencer campaigns, and targeted promotion across East African digital platforms.',
    'ri-megaphone-line',
    '["Social media management","Influencer marketing","Campaign strategy & execution","Community growth","Brand partnerships"]'::jsonb
  ),
  (
    'Event Hosting & Production',
    'End-to-end event planning, stage production, MC services, and live streaming for your launch or festival.',
    'ri-calendar-event-line',
    '["Professional MC & hosting","Event planning & logistics","Stage management","DJ & sound services","Post-event content"]'::jsonb
  ),
  (
    'Ticketing Platform',
    'Sell tickets seamlessly with our integrated platform. QR check-in, real-time sales tracking, and instant payouts.',
    'ri-ticket-line',
    '["Easy event listing","Multiple ticket tiers","QR code digital tickets","Sales dashboard","Attendee management"]'::jsonb
  ),
  (
    'Creator Collaborations',
    'Matchmaking between brands and verified creators for authentic partnerships that actually convert.',
    'ri-hand-heart-line',
    '["Creator matchmaking","Branded content production","Campaign management","Performance reporting","Long-term partnerships"]'::jsonb
  ),
  (
    'Studio & Equipment Hire',
    'Access professional recording studios, cameras, lighting, and editing suites at TribeDala headquarters.',
    'ri-mic-line',
    '["Professional studio space","Camera & lighting kits","Editing suites","Technical support","Flexible booking"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- Step 6: CREATE FUNCTION FOR AUTO-CREATE USER PROFILE
-- =====================================================
-- This function automatically creates a user profile when someone signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Step 7: CREATE ADMIN USER PROFILE
-- =====================================================
-- IMPORTANT: First create the admin user in Supabase Auth dashboard
-- Then replace '8aaca027-9291-40f3-92ce-bd58552bb703' with the actual admin UID
-- You can find the UID in: Settings → Authentication → Users

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
--   '8aaca027-9291-40f3-92ce-bd58552bb703'::uuid,
--   'amor@tribedala.com',
--   'Admin',
--   'admin',
--   'super_admin',
--   true,
--   'active',
--   now(),
--   now()
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   role = 'admin',
--   admin_role = 'super_admin',
--   verified = true,
--   updated_at = now();

-- =====================================================
-- MIGRATION COMPLETE ✓
-- =====================================================
-- Your new Supabase project is now fully configured!
--
-- NEXT STEPS:
-- 1. Update your .env file with new Supabase credentials:
--    VITE_PUBLIC_SUPABASE_URL=<new-project-url>
--    VITE_PUBLIC_SUPABASE_ANON_KEY=<new-anon-key>
--    SUPABASE_SERVICE_ROLE_KEY=<new-service-role-key>
--
-- 2. In Supabase Settings → Authentication → Providers:
--    - Add Google OAuth credentials (Client ID + Secret)
--    - Configure Apple OAuth if needed
--
-- 3. Create your admin user:
--    - Go to Settings → Authentication → Users
--    - Create a user with admin email
--    - Copy the UID and uncomment + run the admin insert query above
--
-- 4. Test:
--    npm run dev
--    Try signing up with email, then with Google OAuth
--
-- =====================================================
