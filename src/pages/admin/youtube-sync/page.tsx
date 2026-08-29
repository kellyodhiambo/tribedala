import { useState, useEffect } from 'react';
import { fetchYouTubeVideos, saveYouTubeVideos, getShows } from '@/lib/queries';
import type { YouTubeVideo, Show } from '@/lib/queries';

interface VideoWithCategory extends YouTubeVideo {
  category?: string;
  selected: boolean;
}

export default function YouTubeSyncPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShowId, setSelectedShowId] = useState<string>('');
  const [selectedShowSlug, setSelectedShowSlug] = useState<string>('');
  const [videos, setVideos] = useState<VideoWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ saved: 0, skipped: 0, total: 0 });

  // Load shows on mount
  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      const showsList = await getShows();
      console.log('Loaded shows:', showsList);
      setShows(showsList);
    } catch (err) {
      setError('Failed to load shows');
      console.error('Failed to load shows:', err);
    }
  };

  const handleShowSelect = (showId: string) => {
    const show = shows.find(s => s.id === showId);
    if (show) {
      setSelectedShowId(showId);
      setSelectedShowSlug(show.slug);
      setVideos([]);
      setError('');
      setSuccess('');
    }
  };

  const handleFetchVideos = async () => {
    if (!selectedShowId) {
      setError('Please select a show first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const show = shows.find(s => s.id === selectedShowId);
      console.log('Selected show:', show);
      
      if (!show) {
        throw new Error('Show not found');
      }
      
      if (!show.youtube_channel_id) {
        throw new Error('YouTube channel ID not configured for this show');
      }

      console.log('Fetching videos from channel:', show.youtube_channel_id);
      const fetchedVideos = await fetchYouTubeVideos(show.youtube_channel_id);
      
      console.log('Fetched videos:', fetchedVideos);
      
      if (fetchedVideos.length === 0) {
        setError('No videos found in YouTube channel');
        setVideos([]);
        return;
      }

      const videosWithCategory: VideoWithCategory[] = fetchedVideos.map(v => ({
        ...v,
        category: selectedShowSlug,
        selected: true,
      }));

      setVideos(videosWithCategory);
      setSuccess(`Found ${fetchedVideos.length} videos from YouTube channel`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch videos from YouTube';
      setError(errorMsg);
      console.error('YouTube fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (videoId: string, newCategory: string) => {
    setVideos(videos.map(v =>
      v.videoId === videoId ? { ...v, category: newCategory } : v
    ));
  };

  const handleToggleSelect = (videoId: string) => {
    setVideos(videos.map(v =>
      v.videoId === videoId ? { ...v, selected: !v.selected } : v
    ));
  };

  const handleSaveVideos = async () => {
    const selectedVideos = videos.filter(v => v.selected);
    
    if (selectedVideos.length === 0) {
      setError('Please select at least one video to save');
      return;
    }

    setSyncing(true);
    setError('');
    setSuccess('');

    try {
      // Group videos by category
      const videosByCategory = selectedVideos.reduce((acc, video) => {
        const category = video.category || selectedShowSlug;
        if (!acc[category]) acc[category] = [];
        acc[category].push(video);
        return acc;
      }, {} as Record<string, VideoWithCategory[]>);

      let totalSaved = 0;
      let totalSkipped = 0;

      // Save videos for each category
      for (const [categorySlug, categoryVideos] of Object.entries(videosByCategory)) {
        const show = shows.find(s => s.slug === categorySlug);
        if (!show) {
          throw new Error(`Show not found for category: ${categorySlug}`);
        }

        const result = await saveYouTubeVideos(show.id, categoryVideos);
        totalSaved += result.saved;
        totalSkipped += result.skipped;
      }

      setStats({
        saved: totalSaved,
        skipped: totalSkipped,
        total: selectedVideos.length,
      });

      setSuccess(`✅ Successfully saved ${totalSaved} videos! ${totalSkipped > 0 ? `(${totalSkipped} duplicates skipped)` : ''}`);
      setVideos([]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save videos';
      setError(errorMsg);
      console.error('Save error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const selectedCount = videos.filter(v => v.selected).length;
  const selectedShow = shows.find(s => s.id === selectedShowId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-xl md:text-2xl text-foreground-50">YouTube Sync</h1>
        <p className="text-sm text-foreground-500 mt-1">Import videos from your YouTube channel and categorize them into Tribe Dala shows.</p>
      </div>

      {/* Show Selector */}
      <div className="card p-6 space-y-4">
        <div>
          <label htmlFor="show-select" className="block text-sm font-medium text-foreground-300 mb-2">
            Select Show to Import Videos Into
          </label>
          <select
            id="show-select"
            value={selectedShowId}
            onChange={(e) => handleShowSelect(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-background-200 border border-background-300/60 text-foreground-50 focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="">-- Select a show --</option>
            {shows.map((show) => (
              <option key={show.id} value={show.id}>
                {show.name}
              </option>
            ))}
          </select>
          {selectedShow && (
            <p className="text-xs text-foreground-600 mt-2">
              📺 Channel ID: {selectedShow.youtube_channel_id}
            </p>
          )}
        </div>

        {/* Fetch Button */}
        <button
          onClick={handleFetchVideos}
          disabled={!selectedShowId || loading}
          className="w-full btn-primary py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2" />
              Fetching YouTube Videos...
            </>
          ) : (
            <>
              <i className="ri-youtube-line mr-2" />
              Fetch Videos from YouTube
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-accent-500/10 border border-accent-500/30">
          <p className="text-sm text-accent-400">
            <i className="ri-error-warning-line mr-2" />
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-sm text-green-400">
            <i className="ri-check-circle-line mr-2" />
            {success}
          </p>
        </div>
      )}

      {stats.saved > 0 && (
        <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
          <p className="text-sm text-primary-400">
            <i className="ri-checkbox-circle-line mr-2" />
            {stats.saved} videos saved • {stats.skipped} duplicates skipped • {stats.total} total
          </p>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg text-foreground-50">
              Videos ({selectedCount} selected)
            </h2>
            <button
              onClick={() => setVideos(videos.map(v => ({ ...v, selected: !videos.every(x => !x.selected) })))}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              {videos.every(v => !v.selected) ? 'Select All' : 'Deselect All'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.videoId}
                className={`card overflow-hidden transition-all ${video.selected ? 'ring-2 ring-primary-500' : ''}`}
              >
                {/* Checkbox & Thumbnail */}
                <div className="relative aspect-video bg-background-200 overflow-hidden group cursor-pointer" onClick={() => handleToggleSelect(video.videoId)}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${video.selected ? 'bg-primary-500 border-primary-500' : 'border-white'}`}>
                      {video.selected && <i className="ri-check-line text-white text-sm" />}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={video.selected}
                      onChange={() => handleToggleSelect(video.videoId)}
                      className="w-5 h-5 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-sm text-foreground-100 line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <p className="text-xs text-foreground-600">
                      {new Date(video.publishedAt).toLocaleDateString('en-KE')}
                    </p>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-medium text-foreground-400 mb-1.5">
                      Assign to Show
                    </label>
                    <select
                      value={video.category || ''}
                      onChange={(e) => handleCategoryChange(video.videoId, e.target.value)}
                      className="w-full px-2 py-1.5 rounded text-xs bg-background-200 border border-background-300/60 text-foreground-50 focus:outline-none focus:border-primary-500"
                    >
                      {shows.map((show) => (
                        <option key={show.id} value={show.slug}>
                          {show.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Channel */}
                  <p className="text-xs text-foreground-600 truncate">
                    <i className="ri-channel-line mr-1" />
                    {video.channelTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setVideos([])}
              className="flex-1 py-3 rounded-lg text-sm border border-background-300/60 text-foreground-400 hover:text-foreground-200 hover:border-background-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveVideos}
              disabled={selectedCount === 0 || syncing}
              className="flex-1 btn-primary py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {syncing ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="ri-save-line mr-2" />
                  Save {selectedCount} Videos
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && videos.length === 0 && selectedShowId && (
        <div className="card p-12 text-center space-y-4">
          <div className="text-4xl text-foreground-600">
            <i className="ri-youtube-line" />
          </div>
          <p className="text-foreground-500">
            Click "Fetch Videos from YouTube" to load videos from your channel
          </p>
        </div>
      )}

      {/* No Show Selected */}
      {!selectedShowId && (
        <div className="card p-12 text-center space-y-4">
          <div className="text-4xl text-foreground-600">
            <i className="ri-video-add-line" />
          </div>
          <p className="text-foreground-500">
            Select a show above to get started with importing YouTube videos
          </p>
        </div>
      )}
    </div>
  );
}
