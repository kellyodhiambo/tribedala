import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jocwzqjzarihupnpcjmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY3d6cWp6YXJpaHVwbnBjam1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NjYxOSwiZXhwIjoyMTA0OTcyNjE5fQ.EGsV-1HQ5HZ1lEmovMiapdjmJjrPzUl-XdZtk00U0cU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugBlogPost() {
  try {
    console.log('🔍 Checking all blog posts...\n');

    // Get all blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('❌ No blog posts found');
      return;
    }

    console.log(`✅ Found ${posts.length} blog post(s)\n`);

    // Loop through all posts
    posts.forEach((post, idx) => {
      console.log(`\n--- Post ${idx + 1} ---`);
      console.log('  Title:', post.title);
      console.log('  Author ID:', post.author_id);
      console.log('  Author:', post.author || '❌ EMPTY');
      console.log('  Cover Image:', post.cover_image ? `✅ Found` : '❌ EMPTY');
      if (post.cover_image) {
        console.log('    URL:', post.cover_image.substring(0, 100) + '...');
      }
      console.log('  Featured Image:', post.featured_image ? `✅ Found` : '❌ EMPTY');
      if (post.featured_image) {
        console.log('    URL:', post.featured_image.substring(0, 100) + '...');
      }
      console.log('  Status:', post.status);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugBlogPost();
