import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';
import RichEditor from '@/components/feature/RichEditor';
import { compressImage, formatFileSize } from '@/lib/imageCompression';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image: string;
  status: 'draft' | 'published';
}

const categories = ['Technology', 'Lifestyle', 'Business', 'Art', 'Music', 'Culture', 'Other'];

export default function DashboardBlog() {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Other',
    cover_image: '',
    status: 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  console.log('[Blog] 📊 Profile:', { role: profile?.role, id: profile?.id, email: profile?.email });

  const canBlog = profile?.role === 'blogger' || profile?.role === 'creator' || profile?.role === 'official';

  if (!user || !profile) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl text-foreground-50">Blog</h1>
        <div className="card p-8 text-center">
          <i className="ri-loader-line text-3xl text-foreground-500 mb-3 animate-spin" />
          <p className="text-foreground-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!canBlog) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl text-foreground-50">Blog</h1>
        <div className="card p-8 text-center space-y-4">
          <div>
            <i className="ri-forbid-2-line text-3xl text-accent-500 mb-3" />
            <p className="text-foreground-400">You don't have permission to create blog posts.</p>
            <p className="text-sm text-foreground-500 mt-2">Your current role: <strong>{profile.role}</strong></p>
            <p className="text-sm text-foreground-500">Only bloggers and creators can publish content.</p>
          </div>
          <button
            onClick={async () => {
              setRefreshing(true);
              await refreshProfile();
              setRefreshing(false);
            }}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg bg-primary-500 text-background-50 text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Profile'}
          </button>
        </div>
      </div>
    );
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (value: string) => {
    setForm({
      ...form,
      title: value,
      slug: generateSlug(value),
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPG, PNG, and WebP images are supported.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      console.log('[Blog] 📸 Compressing image:', { originalSize: formatFileSize(file.size) });
      
      // Compress the image
      const compressedBlob = await compressImage(file, 500);
      
      console.log('[Blog] ✅ Compression complete:', { 
        originalSize: formatFileSize(file.size), 
        compressedSize: formatFileSize(compressedBlob.size) 
      });

      // Check if still too large
      if (compressedBlob.size / 1024 > 500) {
        setMessage({ 
          type: 'error', 
          text: `Image still too large after compression (${formatFileSize(compressedBlob.size)}). Please use a smaller image.` 
        });
        setUploading(false);
        return;
      }



      // Upload to Supabase storage directly
      console.log('[Blog] 📤 Uploading to Supabase storage...');

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const storagePath = `blog-images/${user.id}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('blog-images')
        .upload(storagePath, compressedBlob, { upsert: true });

      if (uploadError) {
        console.error('[Blog] ❌ Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('[Blog] ✅ Upload successful:', { path: data?.path });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      console.log('[Blog] ✅ Upload successful:', { publicUrl });

      // Update form with the image URL
      setForm({ ...form, cover_image: publicUrl });
      setMessage({ 
        type: 'success', 
        text: `Image uploaded successfully (${formatFileSize(compressedBlob.size)})` 
      });
    } catch (error) {
      console.error('[Blog] ❌ Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upload image' 
      });
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[Blog] 📝 Form data:', {
      title: form.title?.trim(),
      content: form.content?.trim(),
      hasTitleText: !!form.title?.trim(),
      hasContentText: !!form.content?.trim(),
      contentLength: form.content?.length,
    });

    if (!user?.id || !form.title.trim() || !form.content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('blog_posts').insert({
        author_id: user.id,
        author: profile?.full_name || user.email?.split('@')[0] || 'Unknown',
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        cover_image: form.cover_image,
        status: form.status,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: `Blog post ${form.status === 'published' ? 'published' : 'saved as draft'}!` });
        setForm({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          category: 'Other',
          cover_image: '',
          status: 'draft',
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save post' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-foreground-50">Create Blog Post</h1>
        <p className="text-sm text-foreground-500 mt-1">Write and publish articles to share with the community.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className={`p-4 rounded-lg text-sm flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-accent-500/10 border border-accent-500/30 text-accent-400'
          }`}>
            <i className={`${message.type === 'success' ? 'ri-check-circle-line' : 'ri-error-warning-line'} text-lg mt-0.5 flex-shrink-0`} />
            <span>{message.text}</span>
          </div>
        )}

        {/* Title */}
        <div className="card p-5 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-200 mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Your post title..."
              className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-200 mb-2">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated-from-title"
              className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors text-xs"
            />
            <p className="text-xs text-foreground-600 mt-1">URL: /blog/{form.slug || 'your-post-title'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-200 mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-foreground-50 focus:outline-none focus:border-primary-500 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-200 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-foreground-50 focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-200 mb-2">Featured Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-background-300/60 text-foreground-400 hover:text-foreground-200 hover:border-primary-500/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <i className="ri-upload-cloud-line mr-2" />
                {uploading ? 'Uploading...' : 'Click to upload or drag image'}
              </button>
              <p className="text-xs text-foreground-600">
                JPG, PNG or WebP. Max 500KB (will be automatically compressed).
              </p>
            </div>
            {form.cover_image && (
              <div className="mt-3 space-y-2">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-background-300/40 bg-background-100">
                  <img
                    src={form.cover_image}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, cover_image: '' })}
                  className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
                >
                  <i className="ri-delete-bin-line" />
                  Remove image
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-200 mb-2">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief summary of your post (for listings)..."
              rows={2}
              maxLength={300}
              className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors resize-none"
            />
            <p className="text-xs text-foreground-600 mt-1">{form.excerpt.length}/300</p>
          </div>
        </div>

        {/* Content Editor */}
        <div className="card p-5 md:p-6">
          <label className="block text-sm font-medium text-foreground-200 mb-3">Content</label>
          <RichEditor
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => setForm({ title: '', slug: '', excerpt: '', content: '', category: 'Other', cover_image: '', status: 'draft' })}
            disabled={saving}
            className="px-6 py-3 rounded-lg border border-background-300/60 text-foreground-300 hover:text-foreground-200 font-medium text-sm transition-colors disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-primary-500 text-background-50 font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-background-50 border-t-transparent rounded-full animate-spin inline-block mr-2" />
                Saving...
              </>
            ) : (
              `${form.status === 'draft' ? 'Save as Draft' : 'Publish'}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
