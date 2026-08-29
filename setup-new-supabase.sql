-- TribeDala Complete Database Setup
-- Run this in your new Supabase project's SQL Editor
-- =====================================================

-- 1. ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLES
-- =====================================================

-- Users table (linked to Supabase auth)
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
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
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
  published_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'published'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT episodes_pkey PRIMARY KEY (id),
  CONSTRAINT episodes_show_id_fkey FOREIGN KEY (show_id) REFERENCES public.shows(id)
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
  status text DEFAULT 'published'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
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
  CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id)
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
  CONSTRAINT tickets_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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
  CONSTRAINT creator_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT creator_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id)
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
  CONSTRAINT service_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id),
  CONSTRAINT service_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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
  CONSTRAINT chat_channels_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
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
  CONSTRAINT chat_messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.chat_channels(id),
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT chat_messages_reply_to_fkey FOREIGN KEY (reply_to) REFERENCES public.chat_messages(id)
);

-- Chat channel members table
CREATE TABLE IF NOT EXISTS public.chat_channel_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  last_read_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_channel_members_pkey PRIMARY KEY (id),
  CONSTRAINT chat_channel_members_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.chat_channels(id),
  CONSTRAINT chat_channel_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  followed_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id),
  CONSTRAINT follows_followed_id_fkey FOREIGN KEY (followed_id) REFERENCES public.users(id)
);

-- Blog comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_comments_pkey PRIMARY KEY (id),
  CONSTRAINT blog_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 3. ENABLE ROW LEVEL SECURITY
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

-- 4. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Users RLS Policies
CREATE POLICY "Users can create their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  )
);

CREATE POLICY "Admins can update any user"
ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  )
);

-- Shows - Public can read
CREATE POLICY "Public can read shows"
ON public.shows
FOR SELECT
USING (true);

-- Episodes - Public can read
CREATE POLICY "Public can read episodes"
ON public.episodes
FOR SELECT
USING (true);

-- Blog Posts - Public can read published
CREATE POLICY "Public can read published blog posts"
ON public.blog_posts
FOR SELECT
USING (status = 'published' OR auth.uid() = author_id);

-- Events - Public can read
CREATE POLICY "Public can read events"
ON public.events
FOR SELECT
USING (true);

-- Tickets - Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view tickets for their events"
ON public.tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = tickets.event_id
      AND e.organizer_id = auth.uid()
  )
);

-- Services - Public can read
CREATE POLICY "Public read services"
ON public.services
FOR SELECT
USING (true);

-- Creator Applications - Users can view their own, admins can view all
CREATE POLICY "Users can view their own applications"
ON public.creator_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.creator_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  )
);

-- Service Requests - Users can view their own
CREATE POLICY "Users can view their own service requests"
ON public.service_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all service requests"
ON public.service_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  )
);

-- Notifications - Users can only see their own
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Follows - Users can follow
CREATE POLICY "Authenticated users can follow"
ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Blog Comments - Public can read, authenticated can insert
CREATE POLICY "Public can read comments"
ON public.blog_comments
FOR SELECT
USING (true);

-- 5. SEED DEFAULT SERVICES
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

-- 6. CREATE ADMIN USER PROFILE
-- =====================================================
-- NOTE: You must first create the user in Supabase Auth dashboard,
-- then run this query. Replace the UID with your admin's actual UID.

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
  '8aaca027-9291-40f3-92ce-bd58552bb703'::uuid,
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

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- You can now use your TribeDala application!
-- The admin user (amor@tribedala.com) has been created with full admin access.
