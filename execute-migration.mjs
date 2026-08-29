#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlFile = path.join(__dirname, 'YOUTUBE_CHANNEL_SETUP.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

const PROJECT_REF = 'prllmmcscqlsiezgaqrb';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybGxtbWNzY3Fsc2llemdhcXJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzkxODE1MCwiZXhwIjoyMTAzNDk0MTUwfQ.cB_Itxs2kzcxBX-Q1HGlD8YfJy-5VYj2obIS0ZRQ6hw';

console.log('🚀 Executing YouTube Channel Setup Migration via Supabase API...\n');

async function executeMigration() {
  try {
    // Call Supabase management API to execute SQL
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `API error: ${response.status}`);
    }

    console.log('✅ Migration executed successfully!\n');
    console.log('Results:', result);
    
  } catch (error) {
    console.error('❌ Migration via API failed:', error.message);
    console.log('\n📋 The SQL migration needs to be run manually in Supabase dashboard:');
    console.log('1. Go to: https://app.supabase.com');
    console.log('2. Login: amor@tribedala.com');
    console.log('3. Project: prllmmcscqlsiezgaqrb');
    console.log('4. SQL Editor → New Query');
    console.log('5. Copy-paste the content below:\n');
    console.log('═'.repeat(80));
    console.log(sql);
    console.log('═'.repeat(80));
    console.log('\n6. Click: RUN button');
  }
}

executeMigration();
