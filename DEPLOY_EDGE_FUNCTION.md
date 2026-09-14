# Deploy Upload Edge Function

## Quick Start

### Option 1: Using Supabase CLI (Recommended)

```bash
cd c:\Users\LENOVO\Desktop\tribedala
supabase functions deploy upload-blog-image
```

### Option 2: Manual Via Dashboard

1. Go to https://app.supabase.com
2. Select your project: `jocwzqjzarihupnpcjmm`
3. Go to **Edge Functions** in the sidebar
4. Click **Create new function**
5. Name it: `upload-blog-image`
6. Copy the entire code from: `supabase/functions/upload-blog-image/index.ts`
7. Click **Deploy**

## Verify Deployment

```bash
supabase functions list
```

You should see:
```
upload-blog-image
```

## Test the Function

```bash
# Create a test image and upload
curl -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@test.jpg" \
  -F "bucket=blog-images" \
  https://jocwzqjzarihupnpcjmm.supabase.co/functions/v1/upload-blog-image
```

## If Deploy Fails

### Error: "Function not found after deploy"
- Wait 10-15 seconds for propagation
- Refresh the dashboard
- Try the function call again

### Error: "Service role key not found"
- The edge function environment variables are auto-configured
- Make sure Supabase CLI is authenticated: `supabase login`
- Check project credentials are correct

### Error: "Bucket not found"
- Run: `node setup-blog-images-bucket.mjs`
- Wait for bucket creation
- Try deploy again

## Rollback (if needed)

```bash
supabase functions delete upload-blog-image
```

Then redeploy without the function - the app will still work but uploads will fail with "Function not found" error.

## Environment Variables

The edge function automatically has access to:
- `SUPABASE_URL` - Project URL
- `SUPABASE_ANON_KEY` - Anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role (for upload)
- `SUPABASE_JWT_SECRET` - JWT secret

No manual configuration needed!
