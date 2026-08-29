# 🚀 YOUTUBE SYNC MIGRATION - START HERE

## ⚠️ IMPORTANT: Manual Step Required

The YouTube Channel Auto-Import feature code is complete, but you need to run ONE database migration manually.

---

## ✅ WHAT TO DO NOW (2 minutes)

### Step 1: Go to Supabase
```
https://app.supabase.com
```

### Step 2: Login
```
Email: amor@tribedala.com
(use your password)
```

### Step 3: Select Project
```
prllmmcscqlsiezgaqrb
```

### Step 4: SQL Editor
```
Left sidebar → SQL Editor
Click: "+ New Query"
```

### Step 5: Copy & Paste Migration SQL
```
1. Open file: YOUTUBE_CHANNEL_SETUP.sql
2. Select ALL
3. Copy (Ctrl+A, Ctrl+C)
4. Paste into Supabase editor (Ctrl+V)
```

### Step 6: Run Migration
```
Click: RUN button (blue, top right)
Wait: 2-5 seconds
See: Success message
```

### Step 7: Verify Success
```
Should see table showing:
- podcast: UCsoMDHBsGyqkGpzlz7boodA
- interview: UCsoMDHBsGyqkGpzlz7boodA
- girlies: UCsoMDHBsGyqkGpzlz7boodA
```

---

## 📖 Need Detailed Instructions?

See: **MIGRATION_MANUAL_STEPS.md**

---

## 🎯 After Migration

```bash
# 1. Restart dev server
npm run dev

# 2. Test YouTube Sync
# Go to: http://localhost:5173/admin/youtube-sync
```

---

## 📋 The Migration SQL

If you need to copy-paste manually, here's the SQL:

```sql
ALTER TABLE public.shows ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS youtube_imported_at TIMESTAMP WITH TIME ZONE;
UPDATE public.shows SET youtube_channel_id = 'UCsoMDHBsGyqkGpzlz7boodA' WHERE youtube_channel_id IS NULL OR youtube_channel_id = '';
ALTER TABLE public.episodes ADD CONSTRAINT unique_youtube_video_id UNIQUE (youtube_video_id) WHERE youtube_video_id IS NOT NULL;
SELECT id, slug, name, youtube_channel_id FROM public.shows;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'episodes' ORDER BY ordinal_position;
```

---

**Time**: 2 minutes
**Difficulty**: Very Easy (copy-paste + click)
**Status**: Ready to deploy! 🚀

