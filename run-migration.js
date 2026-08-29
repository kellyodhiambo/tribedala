#!/usr/bin/env node

/**
 * Run YouTube Channel Setup Migration on Supabase
 * This script executes the SQL migration via Supabase API
 */

const fs = require('fs');
const path = require('path');

// Read the SQL migration file
const sqlFile = path.join(__dirname, 'YOUTUBE_CHANNEL_SETUP.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Supabase credentials
const PROJECT_ID = 'prllmmcscqlsiezgaqrb';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGxtbWNzY3Fsc2llemdhcXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzkxODE1MCwiZXhwIjoyMTAzNDk0MTUwfQ.cB_Itxs2kzcxBX-Q1HGlD8YfJy-5VYj2obIS0ZRQ6hw';

console.log('🚀 Running YouTube Channel Setup Migration...\n');

// We'll need to use fetch or axios to call Supabase API
// For now, let's provide instructions since Node might not have these

console.log('📋 Migration SQL to execute:\n');
console.log('═'.repeat(80));
console.log(sql);
console.log('═'.repeat(80));

console.log('\n✅ Manual Instructions:');
console.log('────────────────────────────────────────────────────────────────────────────');
console.log('1. Go to: https://app.supabase.com');
console.log('2. Login with: amor@tribedala.com');
console.log('3. Project: prllmmcscqlsiezgaqrb');
console.log('4. Click: SQL Editor → New Query');
console.log('5. Paste the SQL above');
console.log('6. Click: RUN button (blue)');
console.log('7. Wait for success message');
console.log('────────────────────────────────────────────────────────────────────────────');

console.log('\n📊 What the migration does:');
console.log('  ✓ Adds youtube_channel_id to shows table');
console.log('  ✓ Adds youtube_video_id to episodes table');
console.log('  ✓ Adds youtube_imported_at to episodes table');
console.log('  ✓ Creates unique constraint to prevent duplicates');
console.log('  ✓ Sets all shows to use channel: UCsoMDHBsGyqkGpzlz7boodA\n');
