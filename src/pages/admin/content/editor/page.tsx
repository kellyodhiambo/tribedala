import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import supabase from '@/hooks/useSupabase';
import RichEditor from '@/components/feature/RichEditor';

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

const emptyForm = {
  title: '',
  type: 'blog',
  category: '',
  author: '',
  status: 'draft',
  content: '',
  excerpt: '',
  thumbnail_file: null as File | null,
  thumbnail_url: '',
};

export default function BlogEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const editId = searchParams.get('id');

  useEffect(() => {
    if (editId) {
      loadBlogPost(editId);
    }
  }, [editId]);

  async function loadBlogPost(id: string) {
    try {
      const { data, error: err } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (err) throw err;

      setForm({
        title: data.title || '',
        type: 'blog',
        category: data.category || '',
        author: data.author || '',
        status: data.status || 'draft',
        content: data.content || '',
        excerpt: data.excerpt || '',
        thumbnail_file: null,
        thumbnail_url: data.cover_image || '',
      });
    } catch (err) {
      console.error('Error loading blog post:', err);
      setError('Failed to load blog post');
    }
  }

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

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!form.title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }

    if (!form.content.trim()) {
      setError('Content is required');
      setSaving(false);
      return;
    }

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
      cover_image: form.thumbnail_url,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    };

    try {
      if (editId) {
        const { error: err } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', editId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('blog_posts').insert(payload);
        if (err) throw err;
      }

      navigate('/admin/content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog post');
      setSaving(false);
    }
  }

  async function handleSaveDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!form.title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }

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
      status: 'draft',
      content: form.content,
      excerpt: form.excerpt || form.content.substring(0, 150).replace(/<[^>]*>/g, ''),
      views: 0,
      cover_image: form.thumbnail_url,
      published_at: null,
    };

    try {
      if (editId) {
        const { error: err } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', editId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('blog_posts').insert(payload);
        if (err) throw err;
      }

      navigate('/admin/content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background-200 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-background-300/30 bg-background-100 shadow-sm">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-6xl mx-auto w-full">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground-50">
              {editId ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
            <p className="text-sm text-foreground-500 mt-1">Write, edit, and publish your content</p>
          </div>
          <button
            onClick={() => navigate('/admin/content')}
            className="px-4 py-2 text-foreground-400 hover:text-foreground-200 transition-colors"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handlePublish} className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          {error && (
            <div className="p-4 bg-accent-500/10 border border-accent-500/30 rounded-lg text-sm text-accent-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-foreground-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter blog post title..."
              className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-lg text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            />
          </div>

          {/* Two Column Layout: Left Content, Right Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Excerpt */}
              <div className="space-y-2">
                <label htmlFor="excerpt" className="block text-sm font-medium text-foreground-300">
                  Excerpt (Optional)
                </label>
                <textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Brief summary that appears in blog listings..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 resize-none"
                />
              </div>

              {/* Blog Content */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground-300">
                  Blog Content
                </label>
                <div className="rounded-lg border border-background-300/60 bg-background-100 overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/30">
                  <RichEditor
                    value={form.content}
                    onChange={(html) => setForm({ ...form, content: html })}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar: Metadata */}
            <div className="lg:col-span-1 space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-foreground-300">
                  Category
                </label>
                <select
                  id="category"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
                >
                  <option value="">Select a category</option>
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label htmlFor="author" className="block text-sm font-medium text-foreground-300">
                  Author
                </label>
                <input
                  id="author"
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-foreground-300">
                  Visibility
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Public)</option>
                </select>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <label htmlFor="thumbnail" className="block text-sm font-medium text-foreground-300">
                  Cover Image
                </label>
                <div className="space-y-3">
                  <input
                    ref={thumbnailRef}
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-sm text-foreground-50 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary-500 file:text-background-50 file:cursor-pointer hover:file:bg-primary-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
                  />
                  {uploadingImage && (
                    <p className="text-xs text-primary-400">
                      <i className="ri-loader-4-line animate-spin mr-2" />
                      Uploading image...
                    </p>
                  )}
                  {form.thumbnail_url && (
                    <div className="space-y-2">
                      <img
                        src={form.thumbnail_url}
                        alt="Cover preview"
                        className="w-full h-32 rounded-lg object-cover border border-background-300/60"
                      />
                      <p className="text-xs text-foreground-400">
                        <i className="ri-check-line mr-1" />
                        Cover image uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30 space-y-2">
                <p className="text-xs font-medium text-primary-300">
                  <i className="ri-information-line mr-2" />
                  Tips for great content
                </p>
                <ul className="text-xs text-foreground-400 space-y-1">
                  <li>• Write clear, engaging headlines</li>
                  <li>• Add a cover image for better engagement</li>
                  <li>• Save as draft before publishing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Spacer for scrolling content */}
          <div className="h-12" />
        </form>
      </div>

      {/* Sticky Footer with Action Buttons */}
      <div className="sticky bottom-0 z-40 border-t border-background-300/30 bg-background-100 shadow-lg">
        <div className="max-w-6xl mx-auto p-4 md:p-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/content')}
            className="px-6 py-3 rounded-lg border border-background-300/60 text-foreground-300 hover:text-foreground-100 hover:border-foreground-300/30 transition-colors font-medium"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-6 py-3 rounded-lg border border-primary-500/50 text-primary-400 hover:text-primary-300 hover:border-primary-500 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="ri-draft-line mr-2" />
                  Save Draft
                </>
              )}
            </button>
            <button
              type="submit"
              onClick={handlePublish}
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-primary-500 text-background-50 hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-2-line" />
                  Publish Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
