import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEpisodes } from '@/lib/queries';
import type { Episode } from '@/lib/queries';

export default function LatestContent() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        // Fetch episodes from all shows, sorted by published date (newest first), limited to 6
        const allEpisodes = await getEpisodes();
        const sorted = allEpisodes
          .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())
          .slice(0, 6);
        setEpisodes(sorted);
      } catch (error) {
        console.error('Failed to fetch episodes:', error);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <section className="section-padding py-10 md:py-16 bg-background-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4" />
              <p className="text-foreground-400">Loading latest content...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (episodes.length === 0) {
    return null;
  }

  return (
    <section className="section-padding py-10 md:py-16 bg-background-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <span className="text-xs font-semibold text-accent-500 tracking-wide uppercase">Fresh Content</span>
            <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground-50 mt-2">
              Latest from TribeDala
            </h2>
          </div>
          <Link
            to="/shows/podcast"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-accent-500 hover:text-accent-600 transition-colors"
          >
            Browse all
            <i className="ri-arrow-right-line" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              to={`/shows/episode/${ep.id}`}
              className="group bg-background-50 rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-video overflow-hidden bg-background-100">
                <img
                  src={ep.cover_image || 'https://via.placeholder.com/400x225'}
                  alt={ep.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-50/80 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-500/10 text-accent-500">
                    <i className="ri-video-line" />
                    Video
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-1 rounded bg-background-50/90 text-xs text-foreground-200 font-medium">
                    {ep.duration ? `${Math.floor(ep.duration / 60)}min` : 'N/A'}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-accent-500/90 flex items-center justify-center text-background-50">
                    <i className="ri-play-fill text-xl" />
                  </div>
                </div>
              </div>
              <div className="p-3 md:p-4">
                <h3 className="font-heading font-semibold text-xs md:text-sm text-foreground-50 mb-1 group-hover:text-accent-500 transition-colors line-clamp-2">
                  {ep.title}
                </h3>
                <p className="text-xs text-foreground-500 line-clamp-1 mb-2">
                  {ep.description}
                </p>
                <div className="flex items-center justify-between text-xs text-foreground-600 gap-2">
                  <span className="truncate">{ep.published_at ? new Date(ep.published_at).toLocaleDateString() : 'N/A'}</span>
                  <span className="text-accent-500 font-medium truncate">{ep.guest_names?.[0] || 'TribeDala'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex sm:hidden mt-8 justify-center">
          <Link
            to="/shows/podcast"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-background-50 bg-accent-500 rounded-lg hover:bg-accent-600 transition-colors"
          >
            Browse all
            <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </div>
    </section>
  );
}
