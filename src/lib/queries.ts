import { supabase } from '../hooks/useSupabase';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
  creator_category: string;
  admin_role: string | null;
  bio: string;
  verified: boolean;
  featured: boolean;
  social_links: Record<string, string>;
  portfolio_links: Record<string, string>;
  location: string;
  status: string;
  notification_email: boolean;
  notification_inapp: boolean;
  privacy_profile_visible: boolean;
  privacy_allow_messages: boolean;
  created_at: string;
  updated_at: string;
}

export interface Show {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  cover_image: string;
  accent_color: string;
  hosts: Record<string, unknown>[];
  youtube_channel_id?: string;
  created_at: string;
  updated_at: string;
  episodeCount?: number;
}

export interface Episode {
  id: string;
  show_id: string;
  title: string;
  slug: string;
  description: string;
  type: 'podcast' | 'video';
  cover_image: string;
  audio_url: string;
  video_url: string;
  duration: number;
  guest_names: string[];
  published_at: string;
  status: string;
  created_at: string;
  updated_at: string;
  show?: Show;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  author: string;
  tags: string[];
  published_at: string;
  status: string;
  created_at: string;
  updated_at: string;
  readTime?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  start_date: string;
  end_date: string;
  venue: string;
  venue_address: string;
  organizer_id: string;
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
  ticket_tiers: TicketTier[];
  total_capacity: number;
  created_at: string;
  updated_at: string;
  tickets_sold?: number;
  date?: string;
  time?: string;
}

export interface TicketTier {
  name: string;
  price: number;
  description: string;
  capacity: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

export interface CreatorApplication {
  id: string;
  user_id: string;
  role_requested: string;
  category: string;
  portfolio_url: string;
  sample_work_urls: string[];
  reason: string;
  status: string;
  reviewed_by: string;
  review_notes: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: string;
  details: string;
  budget_range: string;
  contact_email: string;
  timeline: string;
  status: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
  parent_comment_id?: string | null;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatEventTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function getShows(): Promise<Show[]> {
  const { data, error } = await supabase
    .from('shows')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Show[];
}

export async function getShowBySlug(slug: string): Promise<Show | null> {
  const { data, error } = await supabase
    .from('shows')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as Show | null;
}

export async function getEpisodes(filters?: { showId?: string; type?: string }): Promise<Episode[]> {
  let query = supabase
    .from('episodes')
    .select('*, show:shows(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (filters?.showId) {
    // Support both UUID and slug
    // If it looks like a UUID (has dashes), use it directly
    // Otherwise, treat it as a slug and join with shows table
    if (filters.showId.includes('-')) {
      // It's a UUID
      query = query.eq('show_id', filters.showId);
    } else {
      // It's a slug - need to join with shows table
      const { data: showData } = await supabase
        .from('shows')
        .select('id')
        .eq('slug', filters.showId)
        .single();
      
      if (showData) {
        query = query.eq('show_id', showData.id);
      } else {
        return [];
      }
    }
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Episode[];
}

export async function getEpisodeById(id: string): Promise<Episode | null> {
  const { data, error } = await supabase
    .from('episodes')
    .select('*, show:shows(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Episode | null;
}

export async function getBlogPosts(filters?: { category?: string; status?: string }): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as BlogPost | null;
}

export async function getEvents(filters?: { status?: string[] }): Promise<Event[]> {
  let query = supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;

  const events = (data ?? []) as Event[];
  return events.map((ev) => ({
    ...ev,
    date: formatEventDate(ev.start_date),
    time: formatEventTime(ev.start_date),
  }));
}

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const ev = data as Event;
  return {
    ...ev,
    date: formatEventDate(ev.start_date),
    time: formatEventTime(ev.start_date),
  };
}

export async function getCreators(filters?: { category?: string; featured?: boolean }): Promise<Profile[]> {
  let query = supabase
    .from('users')
    .select('*')
    .eq('role', 'creator')
    .order('full_name', { ascending: true });

  if (filters?.category) {
    query = query.eq('creator_category', filters.category);
  }
  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getCreatorBySlug(slug: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'creator')
    .eq('full_name', slug.replace(/-/g, ' '))
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function getOfficialMembers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'official')
    .order('full_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getLatestContent(limit = 6): Promise<{ type: 'podcast' | 'video' | 'blog'; title: string; description: string; coverImage: string; brand: string; duration: string; publishedAt: string; guest: string; id: string }[]> {
  const [episodes, posts] = await Promise.all([
    getEpisodes().catch(() => [] as Episode[]),
    getBlogPosts().catch(() => [] as BlogPost[]),
  ]);

  const episodeItems = episodes.slice(0, Math.ceil(limit / 2)).map((ep) => ({
    type: ep.type as 'podcast' | 'video',
    title: ep.title,
    description: ep.description,
    coverImage: ep.cover_image,
    brand: ep.show?.name ?? 'TribeDala',
    duration: formatDuration(ep.duration),
    publishedAt: new Date(ep.published_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }),
    guest: ep.guest_names?.[0] ?? '',
    id: ep.id,
  }));

  const postItems = posts.slice(0, Math.floor(limit / 2)).map((post) => ({
    type: 'blog' as const,
    title: post.title,
    description: post.excerpt,
    coverImage: post.cover_image,
    brand: 'TribeDala Blog',
    duration: post.readTime ?? '5 min read',
    publishedAt: new Date(post.published_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }),
    guest: post.author ?? '',
    id: post.id,
  }));

  const combined = [...episodeItems, ...postItems];
  combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return combined.slice(0, limit);
}

export async function getCommunityStats(): Promise<{ id: string; label: string; value: number; suffix: string }[]> {
  const [creatorsRes, episodesRes, eventsRes, membersRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'creator').eq('verified', true),
    supabase.from('episodes').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'member'),
  ]);

  const verifiedCreators = creatorsRes.count ?? 0;
  const episodesPublished = episodesRes.count ?? 0;
  const eventsHosted = eventsRes.count ?? 0;
  const communityMembers = membersRes.count ?? 0;

  return [
    { id: 'creators', label: 'Verified Creators', value: verifiedCreators, suffix: '+' },
    { id: 'episodes', label: 'Episodes Published', value: episodesPublished, suffix: '+' },
    { id: 'events', label: 'Events Hosted', value: eventsHosted, suffix: '' },
    { id: 'members', label: 'Community Members', value: communityMembers, suffix: '+' },
  ];
}

export async function getUpcomingEvents(limit = 3): Promise<Event[]> {
  const events = await getEvents({ status: ['upcoming', 'ongoing'] });
  return events.slice(0, limit);
}

export async function getPastEvents(): Promise<Event[]> {
  return getEvents({ status: ['past', 'cancelled'] });
}

export async function getUserFollows(userId: string): Promise<Follow[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', userId);

  if (error) throw error;
  return (data ?? []) as Follow[];
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Notification[];
}

export async function getCreatorApplications(userId?: string): Promise<CreatorApplication[]> {
  let query = supabase
    .from('creator_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CreatorApplication[];
}

export async function getServiceRequests(userId?: string): Promise<ServiceRequest[]> {
  let query = supabase
    .from('service_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ServiceRequest[];
}

export async function getBlogComments(postId: string): Promise<BlogComment[]> {
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as BlogComment[];
}

export async function getCurrentUser(): Promise<{ user: User | null; session: Session | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  return { user: session?.user ?? null, session };
}

export async function getEventTicketsSold(eventId: string): Promise<number> {
  const { count, error } = await supabase
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (error) throw error;
  return count ?? 0;
}

// ============================================
// YouTube Channel Auto-Import Functions
// ============================================

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  duration?: string;
}

/**
 * Fetch all videos from a YouTube channel
 * Uses YouTube Data API v3 to get channel uploads playlist
 */
export async function fetchYouTubeVideos(channelId: string): Promise<YouTubeVideo[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured in .env');
  }

  try {
    // Step 1: Get the uploads playlist ID for the channel
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const channelRes = await fetch(channelUrl);
    
    if (!channelRes.ok) {
      throw new Error(`YouTube API error: ${channelRes.statusText}`);
    }
    
    const channelData = await channelRes.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('YouTube channel not found or is private');
    }
    
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    
    // Step 2: Get videos from the uploads playlist
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`;
    const playlistRes = await fetch(playlistUrl);
    
    if (!playlistRes.ok) {
      throw new Error(`YouTube API error: ${playlistRes.statusText}`);
    }
    
    const playlistData = await playlistRes.json();
    
    if (!playlistData.items) {
      return [];
    }
    
    // Step 3: Extract and format video data
    const videos: YouTubeVideo[] = playlistData.items.map((item: any) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description || '',
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || '',
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    }));
    
    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
}

/**
 * Check if a video already exists in the database
 * Returns true if youtube_video_id already exists in episodes table
 */
export async function checkVideoExists(youtubeVideoId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('episodes')
    .select('id', { count: 'exact', head: true })
    .eq('youtube_video_id', youtubeVideoId);
  
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/**
 * Save YouTube videos to the episodes table
 * Links them to a specific show and marks them as published
 */
export async function saveYouTubeVideos(
  showId: string,
  videos: YouTubeVideo[]
): Promise<{ saved: number; skipped: number; errors: string[] }> {
  const results = { saved: 0, skipped: 0, errors: [] as string[] };
  
  try {
    // Filter out videos that already exist
    const newVideos = [];
    for (const video of videos) {
      try {
        const exists = await checkVideoExists(video.videoId);
        if (exists) {
          results.skipped++;
        } else {
          newVideos.push(video);
        }
      } catch (err) {
        results.errors.push(`Error checking video ${video.videoId}: ${err}`);
      }
    }
    
    if (newVideos.length === 0) {
      return results;
    }
    
    // Prepare episode records
    const episodes = newVideos.map(video => ({
      show_id: showId,
      title: video.title,
      slug: video.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      description: video.description,
      type: 'video' as const,
      cover_image: video.thumbnail,
      video_url: `https://www.youtube.com/embed/${video.videoId}`,
      youtube_video_id: video.videoId,
      youtube_imported_at: new Date().toISOString(),
      published_at: new Date(video.publishedAt).toISOString(),
      status: 'published',
      duration: 0,
      guest_names: [],
      audio_url: '',
    }));
    
    // Insert episodes in batch
    const { error } = await supabase
      .from('episodes')
      .insert(episodes);
    
    if (error) {
      throw new Error(`Failed to save episodes: ${error.message}`);
    }
    
    results.saved = newVideos.length;
    return results;
  } catch (error) {
    console.error('Error saving YouTube videos:', error);
    throw error;
  }
}

/**
 * Get all videos for a show that were imported from YouTube
 */
export async function getYouTubeImportedVideos(showId: string): Promise<Episode[]> {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('show_id', showId)
    .eq('type', 'video')
    .not('youtube_video_id', 'is', null)
    .order('youtube_imported_at', { ascending: false });
  
  if (error) throw error;
  return (data ?? []) as Episode[];
}

/**
 * Sync YouTube videos for a specific show
 * Fetches new videos and saves them (handles duplicates automatically)
 */
export async function syncShowYouTubeVideos(
  showId: string,
  channelId: string
): Promise<{ saved: number; skipped: number; total: number }> {
  try {
    // Fetch all videos from YouTube channel
    const videos = await fetchYouTubeVideos(channelId);
    
    // Save them to database (automatically skips duplicates)
    const result = await saveYouTubeVideos(showId, videos);
    
    return {
      saved: result.saved,
      skipped: result.skipped,
      total: videos.length,
    };
  } catch (error) {
    console.error('Error syncing YouTube videos:', error);
    throw error;
  }
}
