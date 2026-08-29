#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://prllmmcscqlsiezgaqrb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGxtbWNzY3Fsc2llemdhcXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzkxODE1MCwiZXhwIjoyMTAzNDk0MTUwfQ.cB_Itxs2kzcxBX-Q1HGlD8YfJy-5VYj2obIS0ZRQ6hw'
);

console.log('🔍 Checking shows table...\n');

const { data: shows, error } = await supabase
  .from('shows')
  .select('id, slug, name, youtube_channel_id');

if (error) {
  console.error('❌ Error:', error.message);
} else {
  console.log('✅ Shows found:\n');
  if (shows && shows.length > 0) {
    shows.forEach(show => {
      console.log(`📺 ${show.name.padEnd(30)} | Channel ID: ${show.youtube_channel_id || 'NOT SET'}`);
    });
  } else {
    console.log('⚠️  No shows found in database');
  }
}
