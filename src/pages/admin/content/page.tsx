import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/hooks/useSupabase';

const tabs = ['All', 'Blog Posts', 'Podcast Episodes', 'Video Episodes', 'Drafts'];

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

export default function AdminContent() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

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
        <button onClick={() => navigate('/admin/content/editor')} className="btn-primary text-sm whitespace-nowrap">
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
                    <button onClick={() => navigate(`/admin/content/editor?id=${item.id}`)} className="text-left hover:text-primary-400 transition-colors">
                      <p className="text-foreground-100 font-medium hover:underline">{item.title}</p>
                      <p className="text-xs text-foreground-600 mt-0.5">{item.published_at ? new Date(item.published_at).toLocaleDateString() : '—'}</p>
                    </button>
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
                  <td className="p-3 text-right flex items-center justify-end gap-2">
                    <button onClick={() => navigate(`/admin/content/editor?id=${item.id}`)}
                      className="w-8 h-8 rounded-md inline-flex items-center justify-center text-foreground-500 hover:text-primary-400 hover:bg-background-200 transition-colors" title="Edit">
                      <i className="ri-edit-line text-sm" />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-md inline-flex items-center justify-center text-foreground-500 hover:text-accent-400 hover:bg-background-200 transition-colors" title="Delete">
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
    </div>
  );
}
