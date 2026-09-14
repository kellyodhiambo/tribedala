import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jocwzqjzarihupnpcjmm.supabase.co';
const supabaseAnonKey = 'sb_publishable_hBrfRPAgiTPQozJJSihorg_4t7Dh_ne';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBlogCreation() {
  try {
    console.log('🧪 Testing blog post creation with featured image...\n');

    // Use admin user
    const adminUserId = 'c2dc9add-023d-49ad-8e00-c60158dab200';

    // Create test blog post
    const blogPost = {
      author_id: adminUserId,
      title: 'Test Blog Post - ' + new Date().toISOString(),
      slug: 'test-blog-' + Date.now(),
      excerpt: 'This is a test blog post to verify the featured_image column exists.',
      content: '<p>Test content here</p>',
      category: 'Technology',
      featured_image: 'https://example.com/test.jpg', // Just a test URL
      status: 'draft',
      published_at: null,
    };

    console.log('📝 Creating blog post:', {
      title: blogPost.title,
      slug: blogPost.slug,
      author_id: blogPost.author_id,
    });

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogPost])
      .select();

    if (error) {
      console.error('❌ Error creating blog post:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return;
    }

    console.log('✅ Blog post created successfully!');
    console.log('📄 Post ID:', data?.[0]?.id);
    console.log('🔗 Slug:', data?.[0]?.slug);

    // Fetch to verify
    console.log('\n🔍 Fetching created post...');
    const { data: fetchedPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', data?.[0]?.id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching post:', fetchError);
      return;
    }

    console.log('✅ Post fetched successfully');
    console.log('\nPost data:');
    console.log(JSON.stringify(fetchedPost, null, 2));

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBlogCreation();
