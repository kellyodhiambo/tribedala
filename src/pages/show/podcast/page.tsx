import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEpisodes, getShowBySlug } from '@/lib/queries';
import type { Episode, Show } from '@/lib/queries';

export default function PodcastPage() {
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [showData, episodesData] = await Promise.all([
          getShowBySlug('podcast'),
          getEpisodes({ showId: 'podcast' }),
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
                src={show?.cover_image || "https://readdy.ai/api/search-image?query=Professional%20podcast%20recording%20studio%20with%20vintage%20microphones%20and%20warm%20golden%20accent%20lighting%2C%20African%20creative%20space%2C%20deep%20charcoal%20walls%2C%20editorial%20photography%20style&width=800&height=800&seq=show-podcast-hero&orientation=squarish"}
                alt="Tribe Dala Podcast"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-transparent to-transparent" />
            </div>

            {/* Info */}
            <div className="space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-xs font-semibold text-primary-500">
                <i className="ri-mic-line" />
                Flagship Show
              </span>
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground-50">
                {show?.name || 'Tribe Dala Podcast'}
              </h1>
              <p className="text-sm md:text-base text-foreground-400 leading-relaxed max-w-lg">
                {show?.description || 'The flagship show where culture, creativity, and conversation collide. Deep dives with Kenya\'s most compelling voices. New episodes every Tuesday.'}
              </p>

              {/* Host */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-background-200 flex items-center justify-center">
                  <i className="ri-mic-line text-primary-500 text-lg" />
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
                  { icon: 'ri-spotify-line', label: 'Spotify' },
                  { icon: 'ri-apple-line', label: 'Apple Podcasts' },
                  { icon: 'ri-youtube-line', label: 'YouTube' },
                  { icon: 'ri-rss-line', label: 'RSS' },
                ].map((platform) => (
                  <button
                    key={platform.label}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-background-200 hover:bg-primary-500 text-xs font-medium text-foreground-300 hover:text-background-50 transition-all"
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

      {/* Episodes */}
      <section className="section-padding py-10 md:py-16 bg-background-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs md:text-sm font-semibold text-primary-500 tracking-wide uppercase mb-2 block">
                Latest Episodes
              </span>
              <h2 className="font-heading font-bold text-xl md:text-3xl text-foreground-50">
                All Episodes
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card p-3 md:p-4 h-24 animate-pulse bg-background-200" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {episodes.map((ep) => (
                <Link
                  key={ep.id}
                  to={`/shows/episode/${ep.id}`}
                  className="card p-3 md:p-4 flex gap-3 md:gap-4 items-center group hover:bg-background-200/40 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={ep.cover_image} alt={ep.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-sm md:text-base text-foreground-50 group-hover:text-primary-500 transition-colors line-clamp-1">
                      {ep.title}
                    </h3>
                    <p className="text-xs text-foreground-500 line-clamp-1 mt-0.5 hidden sm:block">
                      {ep.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground-600">
                      <span className="flex items-center gap-1">
                        <i className="ri-time-line" />
                        {Math.floor(ep.duration / 60)}:{(ep.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <span>{new Date(ep.published_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      {ep.guest_names && ep.guest_names.length > 0 && (
                        <span className="text-primary-500">Guest: {ep.guest_names[0]}</span>
                      )}
                    </div>
                  </div>
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-500/10 group-hover:bg-primary-500 flex items-center justify-center flex-shrink-0 transition-colors">
                    <i className="ri-play-fill text-primary-500 group-hover:text-background-50 text-sm md:text-base" />
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
            Want to Be a Guest?
          </h2>
          <p className="text-sm md:text-base text-foreground-400 max-w-lg mx-auto">
            Got a story worth telling? We&apos;re always looking for compelling voices to feature on the podcast.
          </p>
          <Link to="/get-involved" className="btn-primary text-sm md:text-base inline-flex px-8 py-3">
            <i className="ri-mic-line mr-2" />
            Request to Be on the Podcast
          </Link>
        </div>
      </section>
    </div>
  );
}
