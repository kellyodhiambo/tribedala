# Blog Images Setup Guide

## Status
✅ Bucket created: `blog-images`
❌ RLS Policies need fixing

## What to do:

### Step 1: Fix RLS Policies in Supabase

Go to **Supabase Console** → **SQL Editor** and run:

```sql
-- Fix RLS policies for blog-images bucket - allow authenticated users to upload

-- Drop all existing policies on storage.objects for blog-images
DROP POLICY IF EXISTS "Users can upload blog images to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own blog images" ON storage.objects;

-- Simple and permissive policies:

-- 1. Allow authenticated users to upload/insert images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- 2. Allow anyone to view/read blog images
CREATE POLICY "Anyone can view blog images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-images');

-- 3. Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- 4. Allow authenticated users to update images
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');
```

### Step 2: Test the upload

1. Go to `/dashboard/blog`
2. Click "Click to upload or drag image"
3. Select a JPG, PNG, or WebP image
4. Image will be compressed to max 500KB automatically
5. Preview appears below the upload button
6. Click "Publish" to save the blog post with the image

### Features

- **Automatic compression** to max 500KB
- **Canvas-based compression** preserves quality
- **Preview** before saving
- **Remove image** button if needed
- **Organized storage** by user ID

### How it works

1. User selects image → File input triggers
2. Image compressed using Canvas API (max 500KB)
3. Compressed blob uploaded to Supabase storage
4. Public URL generated and saved in `blog_posts.featured_image`
5. Preview displayed to user
6. When blog post saved, URL persists in database

### File structure

```
storage/
  blog-images/
    user-id-1/
      test-1789424883852.png
      another-image.jpg
    user-id-2/
      blog-cover.png
```

### Image specs

- **Max size**: 500KB (after compression)
- **Formats**: JPG, PNG, WebP
- **Max dimensions**: 1920x1920 (scales down if larger)
- **Quality**: 90% JPEG quality (reduced if needed for size)

## Troubleshooting

**"Bucket not found" error:**
- Run `node setup-blog-images-bucket.mjs` again
- Verify bucket exists in Supabase Storage console

**"RLS policy violation" error:**
- Run the SQL fix above
- Make sure all old policies are dropped first

**"Image too large" error:**
- Image still over 500KB after compression
- Try a smaller/lower quality image
- Max 1920x1920 dimensions recommended
