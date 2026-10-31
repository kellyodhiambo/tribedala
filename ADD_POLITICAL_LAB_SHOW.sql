-- Add The Political Lab to the shows list used by YouTube Sync and the public Shows hub.
INSERT INTO public.shows (slug, name, brand, description, cover_image, accent_color, hosts, youtube_channel_id)
VALUES (
  'the-political-lab',
  'The Political Lab',
  'TribeDala',
  'Thoughtful conversations and analysis on politics, leadership, and the issues shaping our communities.',
  'https://readdy.ai/api/search-image?query=cinematic%20editorial%20photograph%20of%20a%20Kenyan%20political%20roundtable%20discussion%20with%20African%20leaders%20in%20a%20modern%20studio%2C%20deep%20charcoal%20background%2C%20warm%20amber%20spotlights%2C%20serious%20conversation%2C%20no%20text%2C%20no%20watermark&width=1200&height=1200&seq=dala-political-lab&orientation=squarish',
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
