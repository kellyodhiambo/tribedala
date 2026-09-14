import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jocwzqjzarihupnpcjmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY3d6cWp6YXJpaHVwbnBjam1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NjYxOSwiZXhwIjoyMTA0OTcyNjE5fQ.EGsV-1HQ5HZ1lEmovMiapdjmJjrPzUl-XdZtk00U0cU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBucket() {
  try {
    console.log('📦 Creating blog-images bucket...');

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('blog-images', {
      public: true,
      fileSizeLimit: 524288, // 512KB = 500KB safe limit
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Bucket created successfully:', data);
    }

    // List buckets to confirm
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    console.log('\n📚 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`);
    });

    console.log('\n✅ Setup complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupBucket();
