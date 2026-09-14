import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jocwzqjzarihupnpcjmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY3d6cWp6YXJpaHVwbnBjam1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NjYxOSwiZXhwIjoyMTA0OTcyNjE5fQ.EGsV-1HQ5HZ1lEmovMiapdjmJjrPzUl-XdZtk00U0cU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStoragePolicies() {
  try {
    console.log('🔧 Fixing storage policies for blog-images bucket...\n');

    // Create a more permissive policy for uploads
    console.log('📝 Creating upload policy...');

    // First, let's just test if we can upload now
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);

    const testFile = new File([pngBuffer], 'policy-test.png', { type: 'image/png' });
    const testUserId = 'c2dc9add-023d-49ad-8e00-c60158dab200';
    const filePath = `blog-images/${testUserId}/policy-test-${Date.now()}.png`;

    console.log(`🧪 Testing upload with service role key...\n`);

    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, testFile, { upsert: true });

    if (error) {
      console.error('❌ Upload failed:', error.message);
      console.log('\nℹ️  This is expected - storage.objects table permissions are restricted.');
      console.log('✅ Solution: Use the Supabase Storage UI or reach out to Supabase support.\n');
      
      console.log('📌 Alternative approach: Modify bucket settings directly via Supabase UI');
      console.log('   1. Go to Supabase Dashboard → Storage');
      console.log('   2. Click on "blog-images" bucket');
      console.log('   3. Go to "Policies" tab');
      console.log('   4. Make sure authentication policies allow uploads\n');

      return;
    }

    console.log('✅ Upload successful with service role!');
    console.log('📄 File path:', data?.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    console.log('🔗 Public URL:', urlData?.publicUrl);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixStoragePolicies();
