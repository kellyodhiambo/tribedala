# ⚙️ RUNNING YOUTUBE CHANNEL MIGRATION IN SUPABASE

**Status**: Migration SQL ready, need to execute in Supabase dashboard
**File**: YOUTUBE_CHANNEL_SETUP.sql
**Time**: 2 minutes

---

## 🚀 HOW TO RUN THE MIGRATION

### Step 1: Go to Supabase Dashboard

```
1. Open: https://app.supabase.com
2. Login with: amor@tribedala.com
3. Select project: prllmmcscqlsiezgaqrb
```

### Step 2: Open SQL Editor

```
1. Click: "SQL Editor" (left sidebar)
2. Click: "+ New Query" (top right)
3. Or click: "Run a new query" in center
```

### Step 3: Copy and Paste Migration SQL

```
1. Open file: YOUTUBE_CHANNEL_SETUP.sql
2. Copy ALL the SQL code
3. Paste into Supabase SQL Editor
4. The editor should show the full migration script
```

### Step 4: Execute the Migration

```
1. Click: "RUN" button (top right, blue button)
2. Wait for it to complete (should be < 5 seconds)
3. Should see: "Success" message
4. Check for any errors (usually none)
```

### Step 5: Verify It Worked

After running, you should see these results:

**Result 1: Shows with YouTube Channel ID**
```
| id  | slug      | name                  | youtube_channel_id        |
|-----|-----------|----------------------|---------------------------|
| ... | podcast   | Tribe Dala Podcast   | UCsoMDHBsGyqkGpzlz7boodA |
| ... | interview | Tribe Dala Interview | UCsoMDHBsGyqkGpzlz7boodA |
| ... | girlies   | Tribe Dala Girlies   | UCsoMDHBsGyqkGpzlz7boodA |
```

**Result 2: Episodes Table Structure**
```
Should see new columns:
├─ youtube_video_id (TEXT)
└─ youtube_imported_at (TIMESTAMP WITH TIME ZONE)
```

---

## ✅ WHAT THE MIGRATION DOES

```
1. ✅ Adds youtube_channel_id column to shows table
   └─ Stores YouTube channel ID for each show

2. ✅ Adds youtube_video_id column to episodes table
   └─ Tracks which YouTube video this episode came from

3. ✅ Adds youtube_imported_at column to episodes table
   └─ Tracks when episode was imported from YouTube

4. ✅ Updates all shows with your channel ID
   └─ All three shows now linked to: UCsoMDHBsGyqkGpzlz7boodA

5. ✅ Creates unique constraint on youtube_video_id
   └─ Prevents duplicate videos from being imported twice
```

---

## 🔍 IF IT FAILS

### Common Issues & Fixes

**Issue**: "Column already exists"
```
Cause: Migration already ran before
Fix: This is fine! Just means it's idempotent
Action: Continue, no problem
```

**Issue**: "Constraint already exists"
```
Cause: Unique constraint was already added
Fix: This is fine! Just means it's idempotent
Action: Continue, no problem
```

**Issue**: "Permission denied"
```
Cause: Supabase role doesn't have permissions
Fix: Contact Supabase support (unlikely with your account)
Action: Try running as service role
```

**Issue**: No error, but no output
```
Cause: Migration ran successfully (normal!)
Fix: Check manually in Table Editor
Action: Go to tables, verify columns exist
```

---

## 📋 AFTER MIGRATION

### Verify in Supabase Table Editor

1. **Check shows table**:
   - Click: Tables → shows
   - Look for: youtube_channel_id column
   - Should show: UCsoMDHBsGyqkGpzlz7boodA for all rows

2. **Check episodes table**:
   - Click: Tables → episodes
   - Look for: youtube_video_id column
   - Look for: youtube_imported_at column
   - Should be empty (no videos imported yet)

---

## 🎯 NEXT STEP

After migration completes:

1. I'll add YouTube API functions to queries.ts
2. I'll create the admin sync interface
3. You'll be able to sync videos from YouTube!

---

## 📝 WHAT TO DO NOW

1. **Run the migration** in Supabase (copy-paste SQL, click RUN)
2. **Verify it worked** (check shows table has channel ID)
3. **Let me know** when done, so I can proceed with step 3

**Time**: 2 minutes
**Difficulty**: Very easy (just copy-paste)
**Reversible**: Yes (can drop columns if needed)

---

**Ready to go? Just let me know when the migration is done!** ✅

