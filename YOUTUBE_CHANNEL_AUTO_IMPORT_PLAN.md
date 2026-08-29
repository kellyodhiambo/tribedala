# 🎬 YOUTUBE CHANNEL AUTO-IMPORT FEATURE - PHASE 2 PLAN

**Objective**: Auto-fetch YouTube videos from your channel and let admin categorize them into:
- Tribe Dala Podcast
- Tribe Dala Interview
- Tribe Dala Girlies

**Status**: Design complete, ready for implementation
**API Key**: Ready ✅ (AIzaSyCcz2AhayOkps64R5CHuO_6J2GtRRIPO4w)

---

## 📋 CURRENT SITUATION

### What Exists
```
✅ Shows table: podcast, interview, girlies (3 shows)
✅ Episodes table: linked to shows via show_id foreign key
✅ YouTube API Key: Available in .env
✅ Admin panel: Can manually add videos
✅ Current workflow: Admin pastes URL → Manual categorization
```

### What's Missing
```
❌ YouTube Channel ID storage in database
❌ Automatic video fetching from channel
❌ Video discovery/sync interface
❌ Bulk categorization UI
```

---

## 🎯 PROPOSED WORKFLOW

### Admin Workflow (After Implementation)

```
1. Admin goes to: Admin Panel → Content Management
2. Clicks: "Sync YouTube Videos" (NEW BUTTON)
3. System shows:
   ├─ "Checking your YouTube channel..."
   ├─ Discovers 25 new videos
   ├─ Shows all videos in a grid
   └─ Each video has:
      ├─ Title
      ├─ Thumbnail
      ├─ Channel
      ├─ Upload date
      └─ 3 Category buttons:
         ├─ [Podcast]
         ├─ [Interview]
         └─ [Girlies]

4. Admin clicks category for each video
   ├─ "This is a Podcast episode" → Click [Podcast]
   ├─ Video moves to Podcast section
   └─ Can change category anytime

5. After categorizing:
   ├─ Click "Save All" or auto-save
   ├─ All videos saved to database
   ├─ All appear on website immediately
   └─ Done! 🎉
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### Step 1: Add YouTube Channel ID to Database

**Migration SQL**:
```sql
-- Add youtube_channel_id column to shows table
ALTER TABLE public.shows ADD COLUMN youtube_channel_id TEXT;

-- Update existing shows with channel IDs:
UPDATE public.shows SET youtube_channel_id = 'UC...' WHERE slug = 'podcast';
UPDATE public.shows SET youtube_channel_id = 'UC...' WHERE slug = 'interview';
UPDATE public.shows SET youtube_channel_id = 'UC...' WHERE slug = 'girlies';

-- Or use your actual channel ID if all videos are from same channel:
UPDATE public.shows SET youtube_channel_id = 'YOUR_CHANNEL_ID' WHERE id IS NOT NULL;
```

**Questions for you**:
- Do all your videos come from ONE YouTube channel?
- Or different channels for each show?
- What's your YouTube Channel ID? (Found in YouTube Settings)

---

### Step 2: Add YouTube Video ID Field to Episodes

**Optional - for tracking**:
```sql
ALTER TABLE public.episodes ADD COLUMN youtube_video_id TEXT;
ALTER TABLE public.episodes ADD COLUMN youtube_fetch_date TIMESTAMP;
```

This allows:
- Tracking which YouTube video = which episode
- Preventing duplicate imports
- Easy relinking if needed

---

### Step 3: Add New API Functions

**File**: `src/lib/queries.ts`

```typescript
// Fetch YouTube videos from a channel
export async function fetchYouTubeVideos(channelId: string): Promise<any[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  
  // Call YouTube Data API to get channel's uploads
  const uploadsPlaylistUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const channelRes = await fetch(uploadsPlaylistUrl);
  const channelData = await channelRes.json();
  
  if (!channelData.items?.[0]) throw new Error('Channel not found');
  
  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
  
  // Get videos from uploads playlist
  const playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`;
  const playlistRes = await fetch(playlistItemsUrl);
  const playlistData = await playlistRes.json();
  
  // Extract video data
  return (playlistData.items || []).map(item => ({
    videoId: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
  }));
}

// Save imported videos to episodes
export async function saveYouTubeVideos(
  showId: string,
  videos: any[]
): Promise<void> {
  const episodes = videos.map(video => ({
    show_id: showId,
    title: video.title,
    slug: video.title.toLowerCase().replace(/\s+/g, '-'),
    description: video.description,
    type: 'video',
    cover_image: video.thumbnail,
    video_url: `https://www.youtube.com/embed/${video.videoId}`,
    youtube_video_id: video.videoId,
    published_at: video.publishedAt,
    status: 'published',
    duration: 0,
    guest_names: [],
  }));
  
  const { error } = await supabase
    .from('episodes')
    .insert(episodes);
  
  if (error) throw error;
}
```

---

### Step 4: Create YouTube Sync UI

**New Component**: `src/pages/admin/youtube-sync/page.tsx`

```typescript
import { useState } from 'react';
import { fetchYouTubeVideos, saveYouTubeVideos } from '@/lib/queries';
import supabase from '@/hooks/useSupabase';

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  category?: string; // 'podcast', 'interview', 'girlies'
}

export default function YouTubeSyncPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedShow, setSelectedShow] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Fetch YouTube videos
  const handleFetchVideos = async () => {
    setLoading(true);
    try {
      // Get channel ID for selected show
      const { data: show } = await supabase
        .from('shows')
        .select('youtube_channel_id')
        .eq('slug', selectedShow)
        .single();

      if (!show?.youtube_channel_id) {
        alert('YouTube channel ID not configured for this show');
        return;
      }

      const fetchedVideos = await fetchYouTubeVideos(show.youtube_channel_id);
      setVideos(fetchedVideos.map(v => ({ ...v, category: selectedShow })));
    } catch (error) {
      alert('Error fetching videos: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // Save selected videos
  const handleSaveVideos = async () => {
    setSyncing(true);
    try {
      // Get show ID from slug
      const { data: show } = await supabase
        .from('shows')
        .select('id')
        .eq('slug', selectedShow)
        .single();

      await saveYouTubeVideos(show.id, videos);
      alert('Videos imported successfully!');
      setVideos([]);
    } catch (error) {
      alert('Error saving videos: ' + error);
    } finally {
      setSyncing(false);
    }
  };

  // Update video category
  const updateVideoCategory = (videoId: string, category: string) => {
    setVideos(videos.map(v =>
      v.videoId === videoId ? { ...v, category } : v
    ));
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Sync YouTube Videos</h1>

      {/* Show Selector */}
      <div className="space-y-2">
        <label>Select Show</label>
        <select
          value={selectedShow}
          onChange={(e) => setSelectedShow(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select a show --</option>
          <option value="podcast">Tribe Dala Podcast</option>
          <option value="interview">Tribe Dala Interview</option>
          <option value="girlies">Tribe Dala Girlies</option>
        </select>
      </div>

      {/* Fetch Button */}
      <button
        onClick={handleFetchVideos}
        disabled={!selectedShow || loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Fetch Videos from YouTube'}
      </button>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.videoId} className="border rounded-lg p-4">
            {/* Thumbnail */}
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-40 object-cover rounded mb-3"
            />

            {/* Title */}
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
              {video.title}
            </h3>

            {/* Category Buttons */}
            <div className="flex gap-2 flex-wrap">
              {['podcast', 'interview', 'girlies'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateVideoCategory(video.videoId, cat)}
                  className={`px-2 py-1 text-xs rounded ${
                    video.category === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      {videos.length > 0 && (
        <button
          onClick={handleSaveVideos}
          disabled={syncing}
          className="w-full bg-green-500 text-white px-4 py-3 rounded font-semibold disabled:opacity-50"
        >
          {syncing ? 'Saving...' : `Save ${videos.length} Videos`}
        </button>
      )}
    </div>
  );
}
```

---

## 📊 DATA FLOW

### Sync Process

```
1. Admin clicks "Sync YouTube Videos"
   ↓
2. Admin selects show (Podcast/Interview/Girlies)
   ↓
3. System retrieves YouTube channel ID for that show
   ↓
4. YouTube API v3 called:
   ├─ Get channel uploads playlist
   ├─ Fetch videos from playlist (max 50)
   └─ Extract: title, thumbnail, description, date
   ↓
5. Videos displayed in UI with category buttons
   ↓
6. Admin clicks category for each video:
   ├─ [Podcast] → Video assigned to podcast show
   ├─ [Interview] → Video assigned to interview show
   └─ [Girlies] → Video assigned to girlies show
   ↓
7. Admin clicks "Save All"
   ↓
8. All videos inserted into episodes table:
   ├─ show_id: assigned based on category
   ├─ title: from YouTube
   ├─ cover_image: from YouTube thumbnail
   ├─ video_url: YouTube embed URL
   ├─ youtube_video_id: tracked for updates
   ├─ status: 'published'
   └─ published_at: from YouTube date
   ↓
9. Videos appear on website IMMEDIATELY! 🎉
```

---

## 🎯 FEATURE SET

### What Admin Can Do

```
✅ Auto-fetch all videos from YouTube channel
✅ Preview videos with thumbnails
✅ Choose category (Podcast/Interview/Girlies) per video
✅ Save all at once (bulk operation)
✅ Skip videos they don't want
✅ Videos appear on website immediately
✅ No duplicate imports (tracks youtube_video_id)
```

### Shows Configuration

```
Show Definitions:
├─ Tribe Dala Podcast
│  └─ youtube_channel_id: (your channel)
│  └─ slug: 'podcast'
│  └─ Videos saved with show_id pointing to this show
│
├─ Tribe Dala Interview
│  └─ youtube_channel_id: (your channel)
│  └─ slug: 'interview'
│  └─ Videos saved with show_id pointing to this show
│
└─ Tribe Dala Girlies
   └─ youtube_channel_id: (your channel)
   └─ slug: 'girlies'
   └─ Videos saved with show_id pointing to this show
```

---

## 🔑 KEY INFORMATION NEEDED

Before implementation, please provide:

```
1. Your YouTube Channel ID
   └─ Where to find: YouTube Settings → About → Channel ID
   └─ Format: UC... (26 characters)

2. Do all three shows pull from ONE channel?
   └─ Or different channels per show?

3. Video filtering preferences
   └─ Import ALL videos?
   └─ Only recent videos?
   └─ Only videos with certain keywords?
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 2A: Database Setup (15 min)
- [ ] Get YouTube Channel ID from you
- [ ] Run migration to add `youtube_channel_id` column to shows
- [ ] Run migration to add `youtube_video_id` column to episodes
- [ ] Update shows table with channel IDs

### Phase 2B: Backend API (30 min)
- [ ] Add `fetchYouTubeVideos()` function to queries.ts
- [ ] Add `saveYouTubeVideos()` function to queries.ts
- [ ] Add duplicate prevention logic
- [ ] Add error handling

### Phase 2C: Frontend UI (45 min)
- [ ] Create YouTube sync page component
- [ ] Build video grid display
- [ ] Add category selection buttons
- [ ] Add bulk save functionality
- [ ] Add loading states and error messages

### Phase 2D: Testing (30 min)
- [ ] Test YouTube API connection
- [ ] Test video fetching
- [ ] Test categorization
- [ ] Test bulk save
- [ ] Test video appearance on website

---

## 🚀 QUICK IMPLEMENTATION TIMELINE

```
If you provide Channel ID today:
├─ 1 hour: Database setup + API functions
├─ 1 hour: UI creation
├─ 30 min: Testing
└─ Total: 2.5 hours to full feature
```

---

## ✨ FUTURE ENHANCEMENTS

After Phase 2 is live:

```
✅ Phase 3A: Auto-sync scheduled
  └─ Automatically check for new videos daily
  └─ Notify admin of new videos
  └─ Auto-categorize based on title keywords

✅ Phase 3B: Bulk edit
  └─ Edit title/description in bulk
  └─ Add guests/metadata
  └─ Reschedule publish dates

✅ Phase 3C: Smart categorization
  └─ AI-based tagging
  └─ Auto-assign to show based on content
```

---

## 📞 NEXT STEPS

1. **Provide YouTube Channel ID** - You provide, I implement
2. **I'll add database columns** - Migrations run in Supabase
3. **I'll create sync interface** - Admin panel feature
4. **You test the feature** - We verify it works
5. **Videos appear automatically** - Life is easier!

---

**Status**: Ready to implement upon your confirmation
**Complexity**: Medium
**Impact**: High (game-changing for content workflow)
**Time to Implement**: 2-3 hours

Would you like me to proceed with Phase 2 implementation? Just provide your YouTube Channel ID! 🚀

