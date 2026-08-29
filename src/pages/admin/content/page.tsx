import { useState, useEffect, useRef } from 'react';
import supabase from '@/hooks/useSupabase';
import RichEditor from '@/components/feature/RichEditor';

const tabs = ['All', 'Blog Posts', 'Podcast Episodes', 'Video Episodes', 'Drafts'];

const BLOG_CATEGORIES = [
  { id: 'politics', label: 'Politics' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'culture', label: 'Culture & Arts' },
  { id: 'technology', label: 'Technology' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'business', label: 'Business' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'education', label: 'Education' },
  { id: 'news', label: 'News' },
  { id: 'opinion', label: 'Opinion' },
];

interface ContentItem {
  id: string;
  title: string;
  type: string;
  category: string;
  author: string;
  status: string;
  published_at: string;
  views: number;
  thumbnail_url?: string;
}

const emptyForm = { title: '', type: 'blog', category: '', author: '', status: 'published', content: '', excerpt: '', thumbnail_file: null as File | null, thumbnail_url: '' };

export default function AdminContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const thumbnailRef = useRef<HTMLInputElement>(null);

  async function fetchContent() {
    setLoading(true);
    try {
      // Fetch from both episodes and blog_posts tables
      const [episodesRes, blogRes] = await Promise.all([
        supabase.from('episodes').select('*'),
        supabase.from('blog_posts').select('*'),
      ]);

      // Combine and map results
      const episodes = (episodesRes.data ?? []).map(ep => ({
        id: ep.id,
        title: ep.title,
        type: ep.type || 'podcast',
        category: ep.category || 'general',
        author: ep.author || 'Unknown',
        status: ep.status || 'draft',
        published_at: ep.published_at,
        views: ep.views || 0,
        thumbnail_url: ep.thumbnail_url,
      }));

      const blogs = (blogRes.data ?? []).map(blog => ({
        id: blog.id,
        title: blog.title,
        type: 'blog',
        category: blog.category || 'general',
        author: blog.author || 'Unknown',
        status: blog.status || 'draft',
        published_at: blog.published_at,
        views: blog.views || 0,
        thumbnail_url: blog.thumbnail_url,
      }));

      // Merge and sort by published_at
      const allItems = [...episodes, ...blogs].sort((a, b) => {
        const dateA = new Date(a.published_at || 0).getTime();
        const dateB = new Date(b.published_at || 0).getTime();
        return dateB - dateA;
      });

      setItems(allItems);
    } catch (err) {
      console.error('Error fetching content:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchContent(); }, []);

  const filtered = items.filter((item) => {
    if (activeTab === 'Blog Posts') return item.type === 'blog';
    if (activeTab === 'Podcast Episodes') return item.type === 'podcast';
    if (activeTab === 'Video Episodes') return item.type === 'video';
    if (activeTab === 'Drafts') return item.status === 'draft';
    return true;
  }).filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  const extractYouTubeVideoId = (url: string): string | null => {
    const regexes = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const regex of regexes) {
      const match = url.match(regex);
      if (match) return match[1];
    }
    return null;
  };

  const getYouTubeThumbnail = (youtubeUrl: string): string | null => {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleYouTubeUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setError('');
    
    if (!url.trim()) {
      setForm({ ...form, content: '', thumbnail_url: '', title: '', author: '', category: '' });
      return;
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube link.');
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API key not configured');
      }

      // Fetch detailed video metadata from YouTube Data API v3
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch YouTube video details');
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found or is private');
      }

      const video = data.items[0];
      const snippet = video.snippet;
      
      // Extract detailed information from YouTube API
      const title = snippet.title || 'YouTube Video';
      const channelTitle = snippet.channelTitle || 'Unknown Channel';
      const categoryId = snippet.categoryId || 'general';
      const thumbnailUrl = snippet.thumbnails?.maxres?.url || 
                           snippet.thumbnails?.high?.url || 
                           snippet.thumbnails?.medium?.url ||
                           getYouTubeThumbnail(url);
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      // Auto-fill form with detailed YouTube data
      setForm({
        ...form,
        title: title,
        content: embedUrl,
        thumbnail_url: thumbnailUrl || '',
        category: categoryId,
        author: channelTitle,
      });
      
    } catch (err) {
      console.error('YouTube API error:', err);
      // Fallback to oEmbed if API fails
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
          const data = await response.json();
          const title = data.title || 'YouTube Video';
          const thumbnailUrl = getYouTubeThumbnail(url);
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;

          setForm({
            ...form,
            title: title,
            content: embedUrl,
            thumbnail_url: thumbnailUrl || '',
          });
        } else {
          setError('Failed to fetch YouTube video details. Please check the URL and try again.');
        }
      } catch (fallbackErr) {
        setError('Failed to fetch YouTube video details. Please check the URL and try again.');
      }
    }
  };

  const handleThumbnailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `content-thumbnails/${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(path, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('content').getPublicUrl(path);
      setForm({ ...form, thumbnail_url: data.publicUrl, thumbnail_file: file });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload thumbnail');
    } finally {
      setUploadingImage(false);
    }
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    if (!form.title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }

    const table = form.type === 'blog' ? 'blog_posts' : 'episodes';
    
    // Generate slug from title
    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    const payload: any = {
      title: form.title,
      slug: slug,
      category: form.category,
      author: form.author,
      status: form.status,
      content: form.content,
      excerpt: form.excerpt || form.content.substring(0, 150).replace(/<[^>]*>/g, ''),
      views: 0,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    };

    // For blogs, use cover_image field; for episodes, use thumbnail_url
    if (form.type === 'blog') {
      payload.cover_image = form.thumbnail_url;
    } else {
      payload.thumbnail_url = form.thumbnail_url;
      payload.type = form.type;
    }

    const { error: err } = await supabase.from(table).insert(payload);
    setSaving(false);
    
    if (err) {
      setError(err.message);
      return;
    }
    
    setShowModal(false);
    setForm(emptyForm);
    if (thumbnailRef.current) thumbnailRef.current.value = '';
    fetchContent();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this content?')) return;
    
    // Try deleting from both tables
    const blogRes = await supabase.from('blog_posts').delete().eq('id', id);
    const episodeRes = await supabase.from('episodes').delete().eq('id', id);
    
    if (blogRes.error && episodeRes.error) {
      alert('Error deleting content');
      return;
    }
    
    fetchContent();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl md:text-2xl text-foreground-50">Content Management</h1>
          <p className="text-sm text-foreground-500 mt-1">Manage blog posts, podcast episodes, and video content.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm whitespace-nowrap">
          <i className="ri-add-line mr-2" />New Content
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-400 hover:text-foreground-200'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-500 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search content..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background-300/30">
                <th className="text-left p-3 font-medium text-foreground-500 text-xs">Title</th>
                <th className="text-left p-3 font-medium text-foreground-500 text-xs hidden md:table-cell">Type</th>
                <th className="text-left p-3 font-medium text-foreground-500 text-xs hidden lg:table-cell">Category</th>
                <th className="text-left p-3 font-medium text-foreground-500 text-xs hidden md:table-cell">Author</th>
                <th className="text-left p-3 font-medium text-foreground-500 text-xs">Status</th>
                <th className="text-left p-3 font-medium text-foreground-500 text-xs hidden lg:table-cell">Views</th>
                <th className="text-right p-3 font-medium text-foreground-500 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="p-3"><div className="h-8 bg-background-200 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.map((item) => (
                <tr key={item.id} className="border-b border-background-300/20 hover:bg-background-100/50 transition-colors">
                  <td className="p-3">
                    <p className="text-foreground-100 font-medium">{item.title}</p>
                    <p className="text-xs text-foreground-600 mt-0.5">{item.published_at ? new Date(item.published_at).toLocaleDateString() : '—'}</p>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background-200 text-foreground-400 capitalize">{item.type}</span>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-foreground-400">{item.category}</td>
                  <td className="p-3 hidden md:table-cell text-foreground-400">{item.author}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'published' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-foreground-400">{item.views?.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-md inline-flex items-center justify-center text-foreground-500 hover:text-accent-400 hover:bg-background-200 transition-colors">
                      <i className="ri-delete-bin-line text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && <div className="p-8 text-center text-sm text-foreground-600">No content found.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background-100 rounded-xl border border-background-300/40 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-background-300/30">
              <h2 className="font-heading font-semibold text-foreground-50">New Content</h2>
              <button onClick={() => setShowModal(false)} className="text-foreground-500 hover:text-foreground-200">
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {error && <p className="text-sm text-accent-400 bg-accent-500/10 border border-accent-500/30 rounded-md p-3">{error}</p>}
              
              {/* Type Selector */}
              <div>
                <label htmlFor="type" className="block text-sm text-foreground-300 mb-1.5">Type</label>
                <select id="type" value={form.type} onChange={(e) => {
                  setForm({ ...form, type: e.target.value, content: '', thumbnail_url: '', title: '' });
                  setError('');
                }}
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500">
                  {['blog', 'podcast', 'video'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* YouTube URL - Only for Videos */}
              {form.type === 'video' && (
                <div className="space-y-3 p-3 bg-primary-500/10 border border-primary-500/30 rounded-md">
                  <label htmlFor="youtube-url" className="block text-sm text-foreground-300 mb-1.5">YouTube URL</label>
                  <input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={handleYouTubeUrlChange}
                    className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-xs text-foreground-600">✨ Paste a YouTube URL to auto-fill title, thumbnail, and description</p>
                  {form.thumbnail_url && form.type === 'video' && (
                    <div className="flex items-center gap-2 pt-2">
                      <img src={form.thumbnail_url} alt="Video thumbnail" className="w-12 h-12 rounded object-cover" />
                      <div>
                        <span className="text-xs text-primary-400">✅ YouTube video loaded!</span>
                        <p className="text-xs text-foreground-600">Title and thumbnail auto-filled</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {form.type === 'video' && (
                <>
                  {/* Title - Read-only for videos */}
                  <div>
                    <label htmlFor="title-video" className="block text-sm text-foreground-300 mb-1.5">Title (from YouTube)</label>
                    <input 
                      id="title-video"
                      type="text" 
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Auto-filled from YouTube"
                      className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" 
                    />
                    <p className="text-xs text-foreground-600 mt-1">Can edit if needed</p>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category-video" className="block text-sm text-foreground-300 mb-1.5">Category</label>
                    <input 
                      id="category-video"
                      type="text" 
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" 
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label htmlFor="author-video" className="block text-sm text-foreground-300 mb-1.5">Author/Channel</label>
                    <input 
                      id="author-video"
                      type="text" 
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" 
                    />
                  </div>
                </>
              )}

              {/* Regular fields for Blog and Podcast */}
              {form.type !== 'video' && (
                <>
                  <div>
                    <label htmlFor="title" className="block text-sm text-foreground-300 mb-1.5">Title</label>
                    <input 
                      id="title"
                      type="text" 
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm text-foreground-300 mb-1.5">Category</label>
                    <select 
                      id="category"
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select a category</option>
                      {BLOG_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="author" className="block text-sm text-foreground-300 mb-1.5">Author</label>
                    <input 
                      id="author"
                      type="text" 
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500" 
                    />
                  </div>

                  {/* Thumbnail Upload - For Blog & Podcast */}
              {form.type !== 'video' && (
                <div>
                  <label htmlFor="thumbnail" className="block text-sm text-foreground-300 mb-1.5">Thumbnail Image</label>
                  <div className="space-y-2">
                    <input
                      ref={thumbnailRef}
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                    />
                    {uploadingImage && <p className="text-xs text-primary-400">⏳ Uploading image...</p>}
                    {form.thumbnail_url && form.type !== 'video' && (
                      <div className="flex items-center gap-2">
                        <img src={form.thumbnail_url} alt="Thumbnail preview" className="w-12 h-12 rounded object-cover" />
                        <span className="text-xs text-foreground-400">✅ Image uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content/Description */}
              {form.type === 'video' ? (
                <div>
                  <label className="block text-sm text-foreground-300 mb-1.5">Video Description</label>
                  <textarea
                    value={form.content}
                    disabled
                    rows={3}
                    placeholder="Auto-filled from YouTube"
                    className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 resize-none opacity-50"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {form.type === 'blog' && (
                    <div>
                      <label className="block text-sm text-foreground-300 mb-1.5">Excerpt (Optional)</label>
                      <textarea
                        value={form.excerpt}
                        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                        rows={2}
                        placeholder="Brief summary that appears in blog listings (auto-generated from content if not provided)"
                        className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 resize-none focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-foreground-300 mb-1.5">
                      {form.type === 'blog' ? 'Blog Content' : 'Episode Description'}
                    </label>
                    <RichEditor
                      value={form.content}
                      onChange={(html) => setForm({ ...form, content: html })}
                      placeholder={form.type === 'blog' ? 'Write your blog post here... (Supports formatting, images, links)' : 'Enter episode description'}
                    />
                  </div>
                </div>
              )}
              </>
              )}
              
              {/* Status & Actions */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="content-status" className="block text-sm text-foreground-300 mb-1.5">Status</label>
                  <select id="content-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500">
                    {['draft', 'published'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                  className="flex-1 py-2 rounded-md text-sm border border-background-300/60 text-foreground-400 hover:text-foreground-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm py-2">
                  {saving ? 'Saving...' : 'Save Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
