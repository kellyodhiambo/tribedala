-- Migration: Add missing columns and tables for mock data removal
-- Run this in Supabase SQL Editor after the main schema

-- Add missing columns to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS tickets_sold integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS time text DEFAULT '14:00';

-- Create services table for homepage services section
CREATE TABLE IF NOT EXISTS public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'ri-briefcase-line',
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public can read services
CREATE POLICY "Public read services" ON public.services
  FOR SELECT USING (true);

-- Authenticated users can insert/update/delete (admin manages via admin panel)
CREATE POLICY "Authenticated insert services" ON public.services
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update services" ON public.services
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete services" ON public.services
  FOR DELETE USING (auth.role() = 'authenticated');

-- Seed default services if table is empty
INSERT INTO public.services (title, description, icon, features)
SELECT * FROM (VALUES
  ('Content Creation', 'Professional podcast production, video shoots, photo sessions, and blog writing tailored to your brand voice.', 'ri-video-line', '["Podcast recording & editing","Video production & post-production","Blog & article writing","Social media content strategy","Brand storytelling"]'::jsonb),
  ('Marketing & Promotion', 'Social media strategy, influencer campaigns, and targeted promotion across East African digital platforms.', 'ri-megaphone-line', '["Social media management","Influencer marketing","Campaign strategy & execution","Community growth","Brand partnerships"]'::jsonb),
  ('Event Hosting & Production', 'End-to-end event planning, stage production, MC services, and live streaming for your launch or festival.', 'ri-calendar-event-line', '["Professional MC & hosting","Event planning & logistics","Stage management","DJ & sound services","Post-event content"]'::jsonb),
  ('Ticketing Platform', 'Sell tickets seamlessly with our integrated platform. QR check-in, real-time sales tracking, and instant payouts.', 'ri-ticket-line', '["Easy event listing","Multiple ticket tiers","QR code digital tickets","Sales dashboard","Attendee management"]'::jsonb),
  ('Creator Collaborations', 'Matchmaking between brands and verified creators for authentic partnerships that actually convert.', 'ri-hand-heart-line', '["Creator matchmaking","Branded content production","Campaign management","Performance reporting","Long-term partnerships"]'::jsonb),
  ('Studio & Equipment Hire', 'Access professional recording studios, cameras, lighting, and editing suites at TribeDala headquarters.', 'ri-mic-line', '["Professional studio space","Camera & lighting kits","Editing suites","Technical support","Flexible booking"]'::jsonb)
) AS seed(title, description, icon, features)
WHERE NOT EXISTS (SELECT 1 FROM public.services LIMIT 1);
