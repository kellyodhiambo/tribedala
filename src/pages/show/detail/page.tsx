import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEpisodes, getShowBySlug } from '@/lib/queries';
import type { Episode, Show } from '@/lib/queries';

export default function ShowDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!slug) return;
    Promise.all([getShowBySlug(slug), getEpisodes({ showId: slug })])
      .then(([showData, episodeData]) => {
        if (!active) return;
        setShow(showData);
        setEpisodes(episodeData);
      })
      .catch((error) => {
        console.error('Unable to load show:', error);
        if (active) {
          setShow(null);
          setEpisodes([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-foreground-400">Loading show...</div>;
  }

  if (!show) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-heading text-2xl text-foreground-50">Show not found</h1>
        <Link to="/shows" className="text-sm text-primary-500 hover:text-primary-400">Browse all shows</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background-50 pt-20 md:pt-24">
      <section className="section-padding py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <Link to="/shows" className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-400 hover:text-foreground-200">
            <i className="ri-arrow-left-line" /> All Shows
          </Link>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">TribeDala Show</span>
              <h1 className="mt-3 font-heading text-3xl font-bold text-foreground-50 md:text-5xl">{show.name}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground-400 md:text-base">{show.description}</p>
              <p className="mt-4 text-sm text-foreground-500">{episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}</p>
            </div>
            {show.cover_image && <img src={show.cover_image} alt={show.name} className="aspect-video w-full rounded-xl object-cover" />}
          </div>
        </div>
      </section>
      <section className="section-padding bg-background-100 py-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 font-heading text-2xl font-bold text-foreground-50">Episodes</h2>
          {episodes.length === 0 ? (
            <p className="text-sm text-foreground-500">New episodes are coming soon.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {episodes.map((episode) => (
                <Link key={episode.id} to={`/shows/episode/${episode.id}`} className="group overflow-hidden rounded-xl border border-background-300/40 bg-background-50 transition hover:-translate-y-1">
                  <div className="aspect-video bg-background-200">
                    {episode.cover_image && <img src={episode.cover_image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold text-foreground-50 group-hover:text-primary-500">{episode.title}</h3>
                    <p className="mt-2 line-clamp-2 text-xs text-foreground-500">{episode.description}</p>
                    <p className="mt-3 text-xs text-foreground-600">{episode.published_at ? new Date(episode.published_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
