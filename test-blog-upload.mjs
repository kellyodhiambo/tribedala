import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://jocwzqjzarihupnpcjmm.supabase.co';
const supabaseAnonKey = 'sb_publishable_hBrfRPAgiTPQozJJSihorg_4t7Dh_ne';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
  try {
    console.log('🧪 Testing blog image upload...\n');

    // Create a simple test image (1x1 white pixel PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);

    const testFile = new File([pngBuffer], 'test.png', { type: 'image/png' });
    const testUserId = 'c2dc9add-023d-49ad-8e00-c60158dab200'; // Admin user
    const filePath = `blog-images/${testUserId}/test-${Date.now()}.png`;

    console.log(`📤 Uploading test image to: ${filePath}`);
    
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, testFile, { upsert: true });

    if (error) {
      console.error('❌ Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
      });
      return;
    }

    console.log('✅ Upload successful!');
    console.log('📄 File path:', data?.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    console.log('🔗 Public URL:', urlData?.publicUrl);
    
    // Try to download it
    console.log('\n🔍 Verifying access to public URL...');
    const response = await fetch(urlData?.publicUrl);
    console.log('✅ Public URL is accessible (HTTP', response.status, ')');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testUpload();
