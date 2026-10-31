-- Add The Political Lab to the shows list used by YouTube Sync and the public Shows hub.
INSERT INTO public.shows (slug, name, brand, description, cover_image, accent_color, hosts, youtube_channel_id)
VALUES (
  'the-political-lab',
  'The Political Lab',
  'TribeDala',
  'A forum for bold conversations about politics, leadership, and public affairs. The Political Lab examines current affairs, challenges ideas, and amplifies the voices shaping Kenya's future.',
  '/the-political-lab.png',
  '#D4A853',
  '[{"name":"TribeDala Team"}]'::jsonb,
  'UCsoMDHBsGyqkGpzlz7boodA'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  description = EXCLUDED.description,
  youtube_channel_id = EXCLUDED.youtube_channel_id,
  updated_at = now();
