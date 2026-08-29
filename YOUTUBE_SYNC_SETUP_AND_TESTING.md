# 🚀 YOUTUBE SYNC FEATURE - SETUP & TESTING GUIDE

**Status**: Code complete, ready for deployment and testing
**Components**: Database migration, API functions, Admin UI
**Time to Deploy**: 5 minutes
**Time to Test**: 10 minutes

---

## 📋 SETUP CHECKLIST

### Step 1: Run Database Migration (2 min)

**File**: `YOUTUBE_CHANNEL_SETUP.sql`

```
1. Go to Supabase dashboard (app.supabase.com)
2. Login: amor@tribedala.com
3. Select project: prllmmcscqlsiezgaqrb
4. Click: SQL Editor → New Query
5. Copy ALL SQL from YOUTUBE_CHANNEL_SETUP.sql
6. Paste into editor
7. Click: RUN (blue button)
8. Wait for success message
9. Verify: Shows table now has youtube_channel_id column
10. Verify: Episodes table now has youtube_video_id column
```

**Expected Output**:
```
Success ✅

Shows table:
| id | slug | name | youtube_channel_id |
| ... | podcast | Tribe Dala Podcast | UCsoMDHBsGyqkGpzlz7boodA |
| ... | interview | Tribe Dala Interview | UCsoMDHBsGyqkGpzlz7boodA |
| ... | girlies | Tribe Dala Girlies | UCsoMDHBsGyqkGpzlz7boodA |

Episodes table:
New columns added:
- youtube_video_id (TEXT)
- youtube_imported_at (TIMESTAMP)
```

---

### Step 2: Restart Development Server (1 min)

**Why**: The new component and functions need to be loaded

```powershell
# In your terminal:
npm run dev

# Should show:
# ➜  Local:   http://localhost:5173/
# ➜  Press q to quit
```

---

### Step 3: Verify Admin Panel Link

Once dev server is running:

```
1. Open: http://localhost:5173/admin (or your local dev URL)
2. Login if needed: amor@tribedala.com
3. Go to: Admin → Content Management → (should see "YouTube Sync" option OR)
4. Navigate directly: http://localhost:5173/admin/youtube-sync
5. Should see: YouTube Sync page with show selector
```

---

## 🧪 TESTING GUIDE

### Test 1: Page Loads Correctly (1 min)

```
1. Go to: http://localhost:5173/admin/youtube-sync
2. Should see:
   ✅ "YouTube Sync" heading
   ✅ "Select Show to Import Videos Into" dropdown
   ✅ "Fetch Videos from YouTube" button (disabled until show selected)
   ✅ Empty state message: "Select a show above..."
3. No console errors
```

### Test 2: Show Selection (1 min)

```
1. Click: "Select Show to Import Videos Into" dropdown
2. Should see 3 options:
   ✅ Tribe Dala Podcast
   ✅ Tribe Dala Interview
   ✅ Tribe Dala Girlies
3. Select: "Tribe Dala Podcast"
4. Should see:
   ✅ "Fetch Videos from YouTube" button now ENABLED (blue)
   ✅ Channel ID displayed: "📺 Channel ID: UCsoMDHBsGyqkGpzlz7boodA"
5. Empty state changes to: "Click 'Fetch Videos from YouTube'..."
```

### Test 3: Fetch YouTube Videos (2 min)

```
1. Make sure a show is selected (e.g., Podcast)
2. Click: "Fetch Videos from YouTube" button
3. Should see:
   ✅ Button changes to: "Fetching YouTube Videos..." (loading spinner)
   ✅ Takes 2-5 seconds
4. After loading completes:
   ✅ Shows message: "Found X videos from YouTube channel"
   ✅ Videos display in grid (each showing):
      - Thumbnail image
      - Video title
      - Upload date
      - Channel name
      - Checkbox (top right)
      - "Assign to Show" dropdown
5. Check browser console:
   ✅ No red errors
   ✅ Can see network request to: googleapis.com/youtube/v3/...
```

**Expected Results**:
```
You should see all videos from your channel:
- Thumbnails load correctly
- Titles visible
- Dates showing in format: mm/dd/yyyy
- Channel shows your YouTube channel name
- Dropdowns working for category selection
```

### Test 4: Video Selection (1 min)

```
1. With videos loaded, click checkbox on first video
2. Should see:
   ✅ Checkbox checked (blue)
   ✅ Card gets blue ring border: "Videos (1 selected)"
3. Click "Select All" link
4. Should see:
   ✅ All checkboxes checked
   ✅ "Videos (5 selected)" (or however many videos)
5. Click "Deselect All"
6. Should see:
   ✅ All checkboxes unchecked
   ✅ "Videos (0 selected)"
```

### Test 5: Category Assignment (1 min)

```
1. Select a few videos (check boxes)
2. For first video, click "Assign to Show" dropdown
3. Should see:
   ✅ Podcast
   ✅ Interview
   ✅ Girlies
4. Select "Interview"
5. Should see:
   ✅ Dropdown now shows "Interview"
   ✅ Can change multiple times
6. Assign videos to different shows:
   - Video 1 → Podcast
   - Video 2 → Interview
   - Video 3 → Girlies
```

### Test 6: Save Videos (2 min)

```
1. Select 2-3 videos
2. Assign them to shows (can be same or different)
3. Click: "Save 3 Videos" button
4. Should see:
   ✅ Button changes to: "Saving..." (loading spinner)
   ✅ Takes 3-10 seconds
5. After saving:
   ✅ Success message: "✅ Successfully saved X videos!"
   ✅ Videos grid disappears
   ✅ Back to: "Select a show..." empty state
```

**What's Happening Behind Scenes**:
- Videos are being inserted into episodes table
- Each video linked to correct show via show_id
- youtube_video_id field populated with YouTube ID
- youtube_imported_at timestamp recorded
- status set to 'published' (appears on website immediately)

---

## ✅ VERIFY IN DATABASE

After saving videos, check Supabase:

```
1. Go to Supabase dashboard
2. Click: Tables → episodes
3. Look for your new videos:
   ✅ title: Your YouTube video title
   ✅ type: 'video'
   ✅ show_id: UUID of selected show
   ✅ youtube_video_id: YouTube video ID
   ✅ youtube_imported_at: Current timestamp
   ✅ video_url: https://www.youtube.com/embed/[VIDEO_ID]
   ✅ cover_image: Thumbnail URL from YouTube
   ✅ status: 'published'
```

---

## 🌐 VERIFY ON WEBSITE

After saving videos, check website:

```
1. Go to your website homepage: http://localhost:5173
2. Look for: "Latest Content" carousel
3. Should see:
   ✅ Your newly imported YouTube videos
   ✅ Thumbnails showing
   ✅ Titles showing
   ✅ Can click to view
   ✅ Videos appearing for the right shows

4. Go to show pages:
   ✅ http://localhost:5173/shows/podcast
   ✅ http://localhost:5173/shows/interview
   ✅ http://localhost:5173/shows/girlies
5. Should see:
   ✅ Videos you assigned to each show
   ✅ Thumbnails and metadata correct
   ✅ No broken images/links
```

---

## 🐛 TROUBLESHOOTING

### Issue: "YouTube API key not configured in .env"

**Fix**:
```
1. Check .env file has: VITE_YOUTUBE_API_KEY=AIzaSyCcz2AhayOkps64R5CHuO_6J2GtRRIPO4w
2. Restart dev server: npm run dev
3. Try again
```

### Issue: No videos appear when clicking "Fetch"

**Check**:
1. Did you run the database migration?
2. Does the show have youtube_channel_id set?
3. Do you have videos in your YouTube channel?
4. Check browser console for error message
5. Try: https://www.youtube.com/channel/UCsoMDHBsGyqkGpzlz7boodA
6. Should see your channel with videos

**Debug**:
```
Open browser console (F12 → Console tab)
You should NOT see red errors
Look for logs about YouTube API call
If error: "YouTube channel not found or is private" 
  → Check channel ID is correct
```

### Issue: Videos save but don't appear on website

**Check**:
1. Are videos set to status='published'? (Should be automatic)
2. In Supabase, verify episodes table shows saved videos
3. Verify show_id is correct UUID
4. Try refreshing homepage
5. Check if you're filtering by date/category elsewhere

### Issue: Duplicate videos appear

**Should NOT happen because**:
- Unique constraint on youtube_video_id prevents duplicates
- checkVideoExists() prevents re-importing
- If you sync twice, second sync should skip duplicates

**If it happens**:
1. Go to Supabase → episodes table
2. Delete duplicate rows manually
3. Check for database constraint error in console

### Issue: Videos appear but with wrong metadata

**Fix**:
1. Go to Supabase → episodes table
2. Find video (search by youtube_video_id)
3. Edit fields manually if needed:
   - title
   - description
   - cover_image
4. Or delete and re-import

---

## 📊 FEATURE CHECKLIST

After testing, verify these work:

- [ ] Can access YouTube Sync page at /admin/youtube-sync
- [ ] Can select a show from dropdown
- [ ] "Fetch Videos" button is disabled until show selected
- [ ] "Fetch Videos" successfully retrieves videos from YouTube
- [ ] Videos display in grid with:
  - [ ] Thumbnail images
  - [ ] Video titles
  - [ ] Upload dates
  - [ ] Channel names
  - [ ] Checkboxes for selection
  - [ ] Category dropdowns
- [ ] Can select/deselect individual videos
- [ ] Can use "Select All" / "Deselect All"
- [ ] Can assign each video to a show
- [ ] Can save selected videos
- [ ] Success message shows: "X videos saved"
- [ ] Videos appear in Supabase episodes table with:
  - [ ] Correct show_id
  - [ ] youtube_video_id populated
  - [ ] youtube_imported_at timestamp
  - [ ] status = 'published'
- [ ] Videos appear on website:
  - [ ] Homepage carousel
  - [ ] Show-specific pages (podcast/interview/girlies)
  - [ ] With correct thumbnails
  - [ ] With correct titles
- [ ] No duplicate imports on second sync
- [ ] Error messages are user-friendly
- [ ] No console errors

---

## 🎉 SUCCESS CRITERIA

Feature is working when:

✅ All 6 testing scenarios pass without errors
✅ Videos appear in database with correct metadata
✅ Videos visible on website immediately after save
✅ No duplicate videos when syncing multiple times
✅ Admin can categorize videos into different shows
✅ Error messages are clear and helpful

---

## 🚀 NEXT STEPS

After testing completes:

1. **Phase 2B Complete** ✅
   - YouTube channel auto-import working
   - Admin can bulk import and categorize videos

2. **Phase 3 (Future)** - Advanced features:
   - [ ] Auto-sync on schedule (daily check for new videos)
   - [ ] Smart categorization (AI detects video type)
   - [ ] Bulk edit imported videos
   - [ ] Video preview player
   - [ ] Comment sync from YouTube

---

## 📝 QUICK REFERENCE

### Admin Workflow

```
1. Login to admin panel
2. Go to: YouTube Sync
3. Select: Show (Podcast/Interview/Girlies)
4. Click: Fetch Videos from YouTube
5. Wait for videos to load
6. Review videos
7. Assign each to correct show
8. Click: Save Videos
9. Done! Videos appear on website ✅
```

### Database Changes

```
Shows table:
- NEW COLUMN: youtube_channel_id (TEXT)
  └─ All shows set to: UCsoMDHBsGyqkGpzlz7boodA

Episodes table:
- NEW COLUMN: youtube_video_id (TEXT, UNIQUE)
- NEW COLUMN: youtube_imported_at (TIMESTAMP)
- NEW CONSTRAINT: unique_youtube_video_id
```

### New API Functions (queries.ts)

```
- fetchYouTubeVideos(channelId) → YouTubeVideo[]
- checkVideoExists(youtubeVideoId) → boolean
- saveYouTubeVideos(showId, videos) → {saved, skipped, errors}
- getYouTubeImportedVideos(showId) → Episode[]
- syncShowYouTubeVideos(showId, channelId) → {saved, skipped, total}
```

---

## 📞 SUPPORT

If anything doesn't work:

1. Check browser console (F12) for error messages
2. Check Supabase table structure (should have new columns)
3. Verify .env has YouTube API key
4. Restart dev server (npm run dev)
5. Clear browser cache (Ctrl+Shift+Delete)
6. Try in incognito/private mode

---

**Status**: ✅ Ready for testing
**Estimated Test Time**: 15 minutes
**Success Rate**: Should be 100% if setup correct

**Let me know when you've:**
1. ✅ Run the database migration
2. ✅ Restarted the dev server
3. ✅ Completed testing
4. ✅ Verified videos appear on website

Then Phase 2 is COMPLETE! 🎉
