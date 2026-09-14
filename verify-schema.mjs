import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jocwzqjzarihupnpcjmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY3d6cWp6YXJpaHVwbnBjam1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NjYxOSwiZXhwIjoyMTA0OTcyNjE5fQ.EGsV-1HQ5HZ1lEmovMiapdjmJjrPzUl-XdZtk00U0cU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySchema() {
  try {
    console.log('🔍 Checking blog_posts table schema...\n');
    console.log('📋 Attempting to create a test blog post...\n');

    const testPost = {
      author_id: 'c2dc9add-023d-49ad-8e00-c60158dab200',
      title: 'Schema Test - ' + new Date().toISOString(),
      slug: 'schema-test-' + Date.now(),
      excerpt: 'Testing schema',
      content: '<p>Test</p>',
      category: 'Technology',
      featured_image: null,
      status: 'draft',
      published_at: null,
    };

    const { error: insertError } = await supabase
      .from('blog_posts')
      .insert([testPost]);

    if (insertError) {
      if (insertError.message.includes('featured_image')) {
        console.log('❌ featured_image column NOT found');
        console.log('Error:', insertError.message);
        console.log('\n✅ Solution: Run this SQL in Supabase:');
        console.log(`
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS featured_image TEXT;
        `);
      } else {
        console.log('❌ Other insert error:', insertError);
      }
    } else {
      console.log('✅ Test post created successfully');
      console.log('✅ featured_image column EXISTS and is working!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifySchema();
