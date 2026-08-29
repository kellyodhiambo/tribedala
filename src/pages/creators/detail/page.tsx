import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCreatorBySlug } from '@/lib/queries';
import type { Profile } from '@/lib/queries';

export default function CreatorDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [creator, setCreator] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getCreatorBySlug(slug)
      .then((data) => setCreator(data))
      .catch(() => setCreator(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50 pt-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-foreground-500 mt-3">Loading creator...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50 pt-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-background-200 flex items-center justify-center mx-auto">
            <i className="ri-user-search-line text-2xl text-foreground-500" />
          </div>
          <h2 className="font-heading text-xl text-foreground-50">Creator not found</h2>
          <Link to="/creators" className="text-sm text-primary-500 hover:text-primary-400">&larr; Back to Creators</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 pt-14 md:pt-20">
      {/* Cover */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={creator.avatar_url} alt={creator.full_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/40 to-transparent" />
      </div>

      <div className="section-padding -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-5">
          {/* Avatar */}
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-background-50 overflow-hidden shrink-0 bg-background-100">
            <img src={creator.avatar_url} alt={creator.full_name} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl md:text-3xl text-foreground-50">{creator.full_name}</h1>
              {creator.verified && (
                <span className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <i className="ri-verified-badge-fill text-xs text-primary-400" />
                </span>
              )}
              {creator.featured && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-400 font-medium">Featured</span>
              )}
            </div>
            <p className="text-sm text-foreground-400 mt-1">{creator.role}</p>
            <p className="text-xs text-foreground-600 mt-0.5 flex items-center gap-1">
              <i className="ri-map-pin-line" /> {creator.location}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-foreground-50">0</p>
              <p className="text-[10px] text-foreground-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-foreground-50">0</p>
              <p className="text-[10px] text-foreground-500">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-foreground-50">0</p>
              <p className="text-[10px] text-foreground-500">Collabs</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-heading font-semibold text-sm text-foreground-50 mb-3">About</h3>
              <p className="text-sm text-foreground-300 leading-relaxed">{creator.bio}</p>
            </div>

            {/* Portfolio */}
            <div>
              <h3 className="font-heading font-semibold text-sm text-foreground-50 mb-4">Portfolio</h3>
              <div className="space-y-2">
                {Object.entries(creator.portfolio_links).map(([title, url]) => (
                  <a
                    key={title}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card p-4 block hover:bg-background-200 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-foreground-100">{title}</h4>
                      </div>
                      <i className="ri-external-link-line text-foreground-500" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5 space-y-5 sticky top-24">
              <h3 className="font-heading font-semibold text-sm text-foreground-50">Connect</h3>

              {/* Social links */}
              <div className="space-y-2">
                {Object.entries(creator.social_links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    className="flex items-center gap-3 p-2.5 rounded-md hover:bg-background-200 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-md bg-background-200 flex items-center justify-center text-foreground-400 group-hover:text-primary-400 transition-colors">
                      <i className={`ri-${platform === 'twitter' ? 'twitter-x' : platform}-line text-sm`} />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-300">{platform.charAt(0).toUpperCase() + platform.slice(1)}</p>
                      <p className="text-xs text-foreground-500 truncate max-w-[180px]">{url}</p>
                    </div>
                  </a>
                ))}
              </div>

              <button className="btn-primary w-full text-sm">
                <i className="ri-message-3-line mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
