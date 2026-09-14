# Blog Image Upload - Ready for Testing

## Status
✅ Image compression implemented
✅ featured_image column exists in database
✅ blog-images storage bucket created
✅ Edge function created for secure uploads
✅ Build passed

## How It Works

### Upload Flow:
1. User selects image on `/dashboard/blog`
2. Image compressed to max 500KB automatically (client-side)
3. Compressed blob sent to Supabase edge function
4. Edge function uses service role to upload to storage
5. Public URL returned and stored in database

### Security:
- Authenticated users only
- Compression happens client-side (no server overhead)
- Edge function validates auth token
- Service role used only on backend (never exposed to client)

## Deployment Steps

### 1. Deploy Edge Function
```bash
cd tribedala
supabase functions deploy upload-blog-image
```

Or manually:
- Go to Supabase Dashboard → Edge Functions
- Create new function: `upload-blog-image`
- Copy content from: `supabase/functions/upload-blog-image/index.ts`
- Deploy

### 2. Test the Upload
1. Login at `/auth/login` or `/auth/signup`
2. Go to `/dashboard/blog`
3. Click "Click to upload or drag image"
4. Select any JPG, PNG, or WebP image
5. Wait for compression
6. See preview below button
7. Fill in other fields
8. Click "Publish" or "Save as Draft"

## Expected Behavior

✅ **Before Upload:**
- Shows upload button with dashed border
- "JPG, PNG or WebP. Max 500KB (will be automatically compressed)."

✅ **During Upload:**
- Button shows "Uploading..."
- Console logs show compression progress
- Spinner appears

✅ **After Upload:**
- Image preview displays below button
- Success message: "Image uploaded successfully (XXX KB)"
- "Remove image" button appears
- Can now publish blog post with image

## Technical Details

### Files Modified:
- `src/pages/dashboard/blog/page.tsx` - Updated to use edge function
- `src/lib/imageCompression.ts` - Compression utility (unchanged)
- `supabase/functions/upload-blog-image/index.ts` - NEW edge function

### Database:
- `blog_posts.featured_image` → stores public URL from storage

### Storage:
- Bucket: `blog-images` (public)
- Path: `blog-images/{user-id}/{timestamp}-{filename}`
- All images < 500KB (guaranteed)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Upload failed" | Check edge function is deployed |
| "Not authenticated" | Make sure you're logged in |
| "Image too large" | Use smaller image or lower quality |
| "Function not found" | Deploy edge function to Supabase |

## Edge Function Details

**Endpoint:** `https://jocwzqjzarihupnpcjmm.supabase.co/functions/v1/upload-blog-image`

**Method:** POST

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: multipart/form-data`

**Body:**
- `file` - Image blob (compressed, < 500KB)
- `bucket` - Storage bucket name (default: "blog-images")

**Response:**
```json
{
  "success": true,
  "path": "blog-images/user-id/timestamp-filename.png",
  "publicUrl": "https://..."
}
```

## Testing Checklist

- [ ] Edge function deployed
- [ ] Login works
- [ ] Blog page loads
- [ ] Image upload button works
- [ ] Compression completes
- [ ] Preview displays
- [ ] Blog post saves with image URL
- [ ] Image accessible via public URL
- [ ] File size < 500KB in storage
