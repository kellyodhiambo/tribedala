# 🔧 MANUAL MIGRATION STEPS - YouTube Channel Setup

**Status**: Migration SQL ready, needs manual execution in Supabase
**File**: YOUTUBE_CHANNEL_SETUP.sql
**Time**: 2 minutes

---

## ✅ QUICK STEPS

### Step 1: Open Supabase Dashboard
```
1. Go to: https://app.supabase.com
2. Login with: amor@tribedala.com
3. Password: [your password]
```

### Step 2: Select Your Project
```
1. Look for project: prllmmcscqlsiezgaqrb
2. Click on it to open
```

### Step 3: Open SQL Editor
```
1. Left sidebar: Click "SQL Editor"
2. Top right: Click "+ New Query" (or "New Query" button)
3. Or: Click "Run a new query"
```

### Step 4: Copy Migration SQL
```
1. File: YOUTUBE_CHANNEL_SETUP.sql
2. Select ALL content
3. Copy (Ctrl+C)
```

### Step 5: Paste into SQL Editor
```
1. Click in the SQL editor area
2. Paste (Ctrl+V)
3. Should see all the SQL statements
```

### Step 6: Execute the Migration
```
1. Look for blue "RUN" button (top right)
2. Click RUN
3. Wait 2-5 seconds
4. Should see success message
```

### Step 7: Verify Success
```
Expected output:
├─ ALTER TABLE: shows ... ADD COLUMN youtube_channel_id
├─ ALTER TABLE: episodes ... ADD COLUMN youtube_video_id  
├─ UPDATE: public.shows SET youtube_channel_id = 'UCsoMDHBsGyqkGpzlz7boodA'
├─ ALTER TABLE: Add unique constraint
└─ SELECT: All 3 shows with youtube_channel_id populated
```

---

## 📋 MIGRATION SQL

Copy and paste this entire SQL block into Supabase SQL Editor:

```sql
-- YouTube Channel Auto-Import Setup
-- This migration adds YouTube channel ID support to shows and episodes tables

-- Step 1: Add youtube_channel_id to shows table
ALTER TABLE public.shows ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT;

-- Step 2: Add youtube_video_id to episodes table (for tracking)
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS youtube_imported_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Update all existing shows with the YouTube channel ID
-- All three shows (Podcast, Interview, Girlies) use the same channel: UCsoMDHBsGyqkGpzlz7boodA
UPDATE public.shows 
SET youtube_channel_id = 'UCsoMDHBsGyqkGpzlz7boodA'
WHERE youtube_channel_id IS NULL OR youtube_channel_id = '';

-- Step 4: Create unique constraint on youtube_video_id to prevent duplicates
ALTER TABLE public.episodes ADD CONSTRAINT unique_youtube_video_id UNIQUE (youtube_video_id) 
WHERE youtube_video_id IS NOT NULL;

-- Verification: Check that all shows have YouTube channel ID
SELECT id, slug, name, youtube_channel_id 
FROM public.shows;

-- Verification: Check episodes structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'episodes' 
ORDER BY ordinal_position;
```

---

## ✅ VERIFY IT WORKED

After running the migration, you should see:

### Shows Table Results
```
| id  | slug      | name                  | youtube_channel_id        |
|-----|-----------|----------------------|---------------------------|
| ... | podcast   | Tribe Dala Podcast   | UCsoMDHBsGyqkGpzlz7boodA |
| ... | interview | Tribe Dala Interview | UCsoMDHBsGyqkGpzlz7boodA |
| ... | girlies   | Tribe Dala Girlies   | UCsoMDHBsGyqkGpzlz7boodA |
```

### Episodes Table Columns
```
column_name          | data_type
─────────────────────┼──────────────────────────
...existing columns...
youtube_video_id     | text
youtube_imported_at  | timestamp with time zone
```

---

## 🎯 AFTER MIGRATION

Once you see the success message:

1. ✅ Don't close the tab (migration is done)
2. ✅ Go back to terminal
3. ✅ Restart dev server: `npm run dev`
4. ✅ Test YouTube Sync feature at: `http://localhost:5173/admin/youtube-sync`

---

## 🆘 TROUBLESHOOTING

### Issue: "Column already exists"
**This is FINE!**
- Means migration might have run before
- OR columns already exist
- Result: No changes needed, everything is set up ✅

### Issue: "Constraint already exists"
**This is also FINE!**
- Unique constraint already in place
- Result: Feature already working ✅

### Issue: Error message appears
**Try:**
1. Check syntax is exactly as shown above
2. Make sure you're in the right project
3. Try each statement individually
4. Look for typos in SQL

### Issue: Nothing happens when I click RUN
**Check:**
1. Is the SQL text actually in the editor?
2. Is there a RUN button visible?
3. Try: Refresh the page (Ctrl+R)
4. Try: Copy-paste the SQL again

---

## 📞 ALTERNATIVE: Run via Supabase CLI

If you prefer CLI:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref prllmmcscqlsiezgaqrb

# Run the SQL file
supabase db push --file YOUTUBE_CHANNEL_SETUP.sql
```

---

## ✅ COMPLETE CHECKLIST

- [ ] Opened https://app.supabase.com
- [ ] Logged in with amor@tribedala.com
- [ ] Selected project prllmmcscqlsiezgaqrb
- [ ] Opened SQL Editor
- [ ] Copied SQL from YOUTUBE_CHANNEL_SETUP.sql
- [ ] Pasted into SQL Editor
- [ ] Clicked RUN button
- [ ] Saw success message
- [ ] Verified shows have youtube_channel_id
- [ ] Restarted dev server (npm run dev)
- [ ] Ready to test YouTube Sync feature!

---

## 🎉 YOU'RE DONE!

Once migration completes:

1. ✅ Database updated
2. ✅ YouTube columns added
3. ✅ Shows configured
4. ✅ Ready for YouTube sync feature

**Next**: Restart dev server and test at `/admin/youtube-sync` 🚀

