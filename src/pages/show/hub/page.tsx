import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getShows, getEpisodes } from '@/lib/queries';
import type { Show, Episode } from '@/lib/queries';



export default function ShowsHubPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShows()
      .then((data) => setShows(data))
      .catch(() => setShows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-12 md:pb-20 section-padding">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(var(--primary-500)/0.06)_0%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-xs font-semibold text-primary-500 mb-4">
            <i className="ri-stack-line" />
            All Shows
          </span>
          <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-foreground-50 mb-4">
            Tribe Dala Shows
          </h1>
          <p className="text-sm md:text-lg text-foreground-400 max-w-xl mx-auto">
            Three distinct shows. One creative community. Tune in, get inspired, and find your tribe.
          </p>
        </div>
      </section>

      {/* Show Cards */}
      <section className="section-padding pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse bg-background-200 h-96" />
            ))
          ) : (
            shows.map((show) => {
              const bgClass = show.accent_color === '#E07A5F' ? 'from-accent-500/10 to-accent-500/5' :
                              show.accent_color === '#D4A5A5' ? 'from-rose-500/10 to-rose-500/5' :
                              'from-primary-500/10 to-primary-500/5';
              return <ShowCard key={show.id} show={show} bgClass={bgClass} />;
            })
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-padding py-12 md:py-20 bg-background-100">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-heading font-bold text-2xl md:text-4xl text-foreground-50">
            Got a Story Worth Telling?
          </h2>
          <p className="text-sm md:text-base text-foreground-400 max-w-lg mx-auto">
            We&apos;re always looking for fresh voices. Apply to be a guest on any of our shows,
            or pitch your own content idea.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/get-involved" className="btn-primary text-sm md:text-base px-8 py-3.5 rounded-lg">
              <i className="ri-mic-line mr-2" />
              Apply to Be a Guest
            </Link>
            <Link to="/get-involved" className="btn-secondary text-sm md:text-base px-8 py-3.5 rounded-lg">
              <i className="ri-lightbulb-line mr-2" />
              Propose a Collaboration
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ShowCard({ show, bgClass }: { show: Show; bgClass: string }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    getEpisodes({ showId: show.slug })
      .then((data) => setEpisodes(data.slice(0, 3)))
      .catch(() => setEpisodes([]));
  }, [show.slug]);

  const host = show.hosts && Array.isArray(show.hosts) && show.hosts.length > 0
    ? (show.hosts[0] as Record<string, string>)?.name || 'TribeDala Team'
    : 'TribeDala Team';

  return (
    <div
      className="group card overflow-hidden hover:border-primary-500/20 transition-all duration-500"
    >
      <div className={`grid grid-cols-1 lg:grid-cols-5 bg-gradient-to-r ${bgClass}`}>
        {/* Cover Image */}
        <div className="lg:col-span-2 relative aspect-[4/3] lg:aspect-auto overflow-hidden">
          <img
            src={show.cover_image}
            alt={show.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background-100 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-100 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <i className="ri-stack-line text-primary-500 text-lg" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl md:text-2xl lg:text-3xl text-foreground-50 group-hover:text-primary-500 transition-colors">
                {show.name}
              </h2>
              <p className="text-xs text-foreground-500">
                Hosted by {host} &middot; {episodes.length} Episodes
              </p>
            </div>
          </div>

          <p className="text-sm md:text-base text-foreground-400 leading-relaxed mb-6 max-w-lg">
            {show.description}
          </p>

          {/* Recent Episodes */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-semibold text-foreground-500 uppercase tracking-wider">
              Recent Episodes
            </p>
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-background-200/50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={ep.cover_image} alt={ep.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground-200 line-clamp-1">
                    {ep.title}
                  </p>
                  <p className="text-[10px] text-foreground-500">
                    {Math.floor(ep.duration / 60)}:{(ep.duration % 60).toString().padStart(2, '0')} &middot; {new Date(ep.published_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-primary-500/10 group-hover:bg-primary-500 flex items-center justify-center flex-shrink-0 transition-colors">
                  <i className="ri-play-fill text-primary-500 group-hover:text-background-50 text-xs" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/shows/${show.slug}`}
              className="btn-primary text-xs md:text-sm px-6 py-2.5 rounded-lg"
            >
              Explore {show.name.split(' ').pop()}
              <i className="ri-arrow-right-line ml-2" />
            </Link>
            <Link
              to="/get-involved"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-background-300/50 text-xs md:text-sm font-medium text-foreground-300 hover:text-foreground-50 hover:bg-background-200 transition-all"
            >
              Request to Be a Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}