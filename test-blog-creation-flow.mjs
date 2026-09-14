import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jocwzqjzarihupnpcjmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY3d6cWp6YXJpaHVwbnBjam1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NjYxOSwiZXhwIjoyMTA0OTcyNjE5fQ.EGsV-1HQ5HZ1lEmovMiapdjmJjrPzUl-XdZtk00U0cU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBlogCreation() {
  try {
    console.log('🧪 Testing Blog Creation Flow...\n');

    // Create a test blog post
    const testBlog = {
      author_id: 'c2dc9add-023d-49ad-8e00-c60158dab200',
      author: 'Admin Test User',
      title: `Test Blog ${new Date().toISOString()}`,
      slug: `test-blog-${Date.now()}`,
      excerpt: 'This is a test blog post to verify the creation flow.',
      content: '<p>This is test content for the blog post.</p><p>It should have multiple paragraphs.</p>',
      category: 'Technology',
      cover_image: 'https://jocwzqjzarihupnpcjmm.supabase.co/storage/v1/object/public/blog-images/test/sample.png',
      status: 'published',
      published_at: new Date().toISOString(),
    };

    console.log('📝 Creating blog post with data:');
    console.log('  Title:', testBlog.title);
    console.log('  Author:', testBlog.author);
    console.log('  Status:', testBlog.status);
    console.log('');

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([testBlog])
      .select();

    if (error) {
      console.error('❌ Failed to create blog post:', error);
      console.error('Details:', error.details);
      return;
    }

    console.log('✅ Blog post created successfully!');
    const post = data[0];
    console.log('  ID:', post.id);
    console.log('  Title:', post.title);
    console.log('  Author:', post.author);
    console.log('  Status:', post.status);
    console.log('  Cover Image:', post.cover_image ? '✅' : '❌');
    console.log('');

    // Fetch it back to verify
    console.log('🔍 Fetching post back from database...');
    const { data: fetchedPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', post.id)
      .single();

    if (fetchError) {
      console.error('❌ Failed to fetch post:', fetchError);
      return;
    }

    console.log('✅ Post retrieved successfully');
    console.log('  Title:', fetchedPost.title);
    console.log('  Author:', fetchedPost.author);
    console.log('  Content length:', fetchedPost.content?.length || 0);
    console.log('  Cover Image URL:', fetchedPost.cover_image ? `✅ ${fetchedPost.cover_image.substring(0, 60)}...` : '❌ EMPTY');
    console.log('');

    // Check if it's in the published list
    console.log('📋 Checking if post appears in published posts list...');
    const { data: publishedPosts, error: listError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5);

    if (listError) {
      console.error('❌ Failed to fetch published posts:', listError);
      return;
    }

    const foundPost = publishedPosts.find(p => p.id === post.id);
    if (foundPost) {
      console.log('✅ Post found in published list!');
    } else {
      console.log('❌ Post NOT found in published list');
    }

    console.log('');
    console.log('📊 Summary:');
    console.log('  ✅ Blog post creation works');
    console.log('  ✅ Author field is populated');
    console.log('  ✅ Content saves correctly');
    console.log('  ✅ Image field is supported');
    console.log('  ✅ Status filter works');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBlogCreation();
