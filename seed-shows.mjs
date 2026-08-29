#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://prllmmcscqlsiezgaqrb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGxtbWNzY3Fsc2llemdhcXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzkxODE1MCwiZXhwIjoyMTAzNDk0MTUwfQ.cB_Itxs2kzcxBX-Q1HGlD8YfJy-5VYj2obIS0ZRQ6hw'
);

console.log('🌱 Seeding shows table...\n');

const showsToCreate = [
  {
    slug: 'podcast',
    name: 'Tribe Dala Podcast',
    brand: 'Tribe Dala',
    description: 'The flagship show where culture, creativity, and conversation collide. Deep dives with Kenya\'s most compelling voices.',
    cover_image: 'https://readdy.ai/api/search-image?query=Professional%20podcast%20recording%20studio&width=800&height=800&seq=show-podcast-hero&orientation=squarish',
    accent_color: '#D4A853',
    hosts: [{ name: 'TribeDala Team' }],
    youtube_channel_id: 'UCsoMDHBsGyqkGpzlz7boodA'
  },
  {
    slug: 'interview',
    name: 'Tribe Dala Interview',
    brand: 'Tribe Dala',
    description: 'Raw, unfiltered conversations with creators, innovators, and changemakers shaping East Africa\'s future.',
    cover_image: 'https://readdy.ai/api/search-image?query=Two%20people%20in%20intimate%20interview%20setup&width=800&height=800&seq=show-interview-hero&orientation=squarish',
    accent_color: '#E07A5F',
    hosts: [{ name: 'TribeDala Team' }],
    youtube_channel_id: 'UCsoMDHBsGyqkGpzlz7boodA'
  },
  {
    slug: 'girlies',
    name: 'Tribe Dala Girlies',
    brand: 'Tribe Dala',
    description: 'Stories, insights, and conversations celebrating women innovators and creators in our community.',
    cover_image: 'https://readdy.ai/api/search-image?query=Female%20content%20creators%20in%20creative%20studio&width=800&height=800&seq=show-girlies-hero&orientation=squarish',
    accent_color: '#D4A5A5',
    hosts: [{ name: 'TribeDala Team' }],
    youtube_channel_id: 'UCsoMDHBsGyqkGpzlz7boodA'
  }
];

try {
  // Check if shows already exist
  const { data: existingShows } = await supabase
    .from('shows')
    .select('slug');

  const existingSlugs = existingShows?.map(s => s.slug) || [];
  const showsToInsert = showsToCreate.filter(s => !existingSlugs.includes(s.slug));

  if (showsToInsert.length === 0) {
    console.log('✅ All shows already exist!\n');
    
    // List them
    const { data: shows } = await supabase
      .from('shows')
      .select('slug, name, youtube_channel_id');
    
    shows?.forEach(show => {
      console.log(`  📺 ${show.name} → ${show.youtube_channel_id || 'NO CHANNEL ID'}`);
    });
  } else {
    // Insert new shows
    const { data: insertedShows, error } = await supabase
      .from('shows')
      .insert(showsToInsert)
      .select();

    if (error) {
      console.error('❌ Error inserting shows:', error.message);
      process.exit(1);
    }

    console.log(`✅ Created ${insertedShows?.length || 0} shows:\n`);
    insertedShows?.forEach(show => {
      console.log(`  📺 ${show.name}`);
      console.log(`     Channel ID: ${show.youtube_channel_id}`);
      console.log(`     Slug: ${show.slug}\n`);
    });
  }

  console.log('🎉 Seeding complete!');
  console.log('\nShows are now ready for YouTube sync feature.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
