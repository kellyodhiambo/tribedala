import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEpisodes, getShowBySlug } from '@/lib/queries';
import type { Episode, Show } from '@/lib/queries';

export default function InterviewPage() {
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [showData, episodesData] = await Promise.all([
          getShowBySlug('interview'),
          getEpisodes({ showId: 'interview' }),
        ]);
        setShow(showData);
        setEpisodes(episodesData);
      } catch {
        setShow(null);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero */}
      <section className="relative pt-20 md:pt-24 pb-12 md:pb-16 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Cover */}
            <div className="relative aspect-square max-w-md mx-auto lg:mx-0 rounded-xl overflow-hidden">
              <img
                src={show?.cover_image || "https://readdy.ai/api/search-image?query=Two%20people%20in%20intimate%20interview%20setup%2C%20warm%20spotlight%20lighting%2C%20professional%20camera%20visible%2C%20creative%20studio%20background%2C%20editorial%20documentary%20photography&width=800&height=800&seq=show-interview-hero&orientation=squarish"}
                alt="Tribe Dala Interview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-transparent to-transparent" />
            </div>

            {/* Info */}
            <div className="space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 text-xs font-semibold text-accent-500">
                <i className="ri-video-line" />
                Video Series
              </span>
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground-50">
                {show?.name || 'Tribe Dala Interview'}
              </h1>
              <p className="text-sm md:text-base text-foreground-400 leading-relaxed max-w-lg">
                {show?.description || 'Raw, unfiltered conversations with creators, innovators, and changemakers shaping East Africa\'s future. Every interview tells a story that matters.'}
              </p>

              {/* Host */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-background-200 flex items-center justify-center">
                  <i className="ri-user-line text-foreground-400 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground-200">
                    {show?.hosts && Array.isArray(show.hosts) && show.hosts.length > 0 ? (show.hosts[0] as Record<string, string>)?.name || 'TribeDala Team' : 'TribeDala Team'}
                  </p>
                  <p className="text-xs text-foreground-500">{episodes.length} Episodes</p>
                </div>
              </div>

              {/* Subscribe buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { icon: 'ri-youtube-line', label: 'YouTube' },
                  { icon: 'ri-instagram-line', label: 'Instagram' },
                  { icon: 'ri-tiktok-line', label: 'TikTok' },
                ].map((platform) => (
                  <button
                    key={platform.label}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-background-200 hover:bg-accent-500 text-xs font-medium text-foreground-300 hover:text-background-50 transition-all"
                  >
                    <i className={platform.icon} />
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="section-padding py-10 md:py-16 bg-background-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs md:text-sm font-semibold text-accent-500 tracking-wide uppercase mb-2 block">
                Latest Interviews
              </span>
              <h2 className="font-heading font-bold text-xl md:text-3xl text-foreground-50">
                All Episodes
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse bg-background-200 h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {episodes.map((ep) => (
                <Link
                  key={ep.id}
                  to={`/shows/episode/${ep.id}`}
                  className="card overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={ep.cover_image}
                      alt={ep.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-background-50/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="ri-play-fill text-foreground-50 text-xl" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-1 rounded bg-background-50/80 text-xs text-foreground-200 font-medium">
                        {Math.floor(ep.duration / 60)}:{(ep.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-sm md:text-base text-foreground-50 mb-1 group-hover:text-accent-500 transition-colors">
                      {ep.title}
                    </h3>
                    <p className="text-xs text-foreground-500 line-clamp-2 mb-2">
                      {ep.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-foreground-600">
                      <span>{new Date(ep.published_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      {ep.guest_names && ep.guest_names.length > 0 && (
                        <span className="text-accent-500">Guest: {ep.guest_names[0]}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="font-heading font-bold text-xl md:text-3xl text-foreground-50">
            Want to Be Interviewed?
          </h2>
          <p className="text-sm md:text-base text-foreground-400 max-w-lg mx-auto">
            Share your journey, your craft, or your vision with the TribeDala community.
          </p>
          <Link to="/get-involved" className="btn-primary text-sm md:text-base inline-flex px-8 py-3">
            <i className="ri-video-line mr-2" />
            Request an Interview
          </Link>
        </div>
      </section>
    </div>
  );
}