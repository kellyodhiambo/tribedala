-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
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
CREATE TABLE public.creator_applications (
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
CREATE TABLE public.shows (
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
CREATE TABLE public.episodes (
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
CREATE TABLE public.blog_posts (
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
CREATE TABLE public.events (
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
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id)
);
CREATE TABLE public.tickets (
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
CREATE TABLE public.service_requests (
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
CREATE TABLE public.chat_channels (
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
CREATE TABLE public.chat_messages (
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
CREATE TABLE public.chat_channel_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  last_read_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_channel_members_pkey PRIMARY KEY (id),
  CONSTRAINT chat_channel_members_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.chat_channels(id),
  CONSTRAINT chat_channel_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
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
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  followed_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id),
  CONSTRAINT follows_followed_id_fkey FOREIGN KEY (followed_id) REFERENCES public.users(id)
);
CREATE TABLE public.blog_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_comments_pkey PRIMARY KEY (id),
  CONSTRAINT blog_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
