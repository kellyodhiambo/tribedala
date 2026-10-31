import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEpisodes, getShowBySlug } from '@/lib/queries';
import type { Episode, Show } from '@/lib/queries';

const politicalLabCover = 'https://readdy.ai/api/search-image?query=cinematic%20editorial%20photograph%20of%20a%20Kenyan%20political%20roundtable%20discussion%20with%20African%20leaders%20in%20a%20modern%20studio%2C%20deep%20charcoal%20background%2C%20warm%20amber%20spotlights%2C%20serious%20conversation%2C%20no%20text%2C%20no%20watermark&width=1200&height=1200&seq=dala-political-lab&orientation=squarish';

export default function ShowDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!slug) return () => { active = false; };

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

  const isPoliticalLab = show.slug === 'the-political-lab';
  const host = Array.isArray(show.hosts) && show.hosts.length
    ? String((show.hosts[0] as Record<string, unknown>)?.name ?? 'TribeDala Team')
    : 'TribeDala Team';
  const coverImage = show.cover_image || (isPoliticalLab ? politicalLabCover : '');
  const channelUrl = show.youtube_channel_id ? `https://www.youtube.com/channel/${show.youtube_channel_id}` : null;

  return (
    <main className="min-h-screen bg-background-50">
      <section className="relative overflow-hidden pt-20 md:pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-background-50 to-background-50" />
        <div className="relative section-padding py-10 md:py-16">
          <div className="mx-auto max-w-7xl">
            <Link to="/shows" className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-400 hover:text-foreground-200">
              <i className="ri-arrow-left-line" /> All Shows
            </Link>
            <div className="grid grid-cols-1 items-center gap-8 md:gap-12 lg:grid-cols-2">
              <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-background-200 shadow-xl">
                {coverImage ? (
                  <img src={coverImage} alt={show.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500/20 to-background-200">
                    <i className={`${isPoliticalLab ? 'ri-government-line' : 'ri-mic-line'} text-7xl text-primary-500`} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background-950/70 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-background-950/70 px-3 py-1 text-xs font-semibold text-white">
                  {show.brand || 'TribeDala'}
                </span>
              </div>

              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-3 py-1.5 text-xs font-semibold text-primary-500">
                  <i className={isPoliticalLab ? 'ri-government-line' : 'ri-live-line'} />
                  {isPoliticalLab ? 'Politics, leadership & public affairs' : 'TribeDala Show'}
                </span>
                <h1 className="font-heading text-3xl font-bold text-foreground-50 md:text-4xl lg:text-5xl">{show.name}</h1>
                <p className="max-w-xl text-sm leading-relaxed text-foreground-400 md:text-base">{show.description}</p>

                <div className="flex items-center gap-3 rounded-xl border border-background-300/40 bg-background-100 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
                    <i className={`${isPoliticalLab ? 'ri-government-line' : 'ri-user-voice-line'} text-xl`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground-200">Hosted by {host}</p>
                    <p className="text-xs text-foreground-500">{episodes.length} {episodes.length === 1 ? 'Episode' : 'Episodes'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {channelUrl && (
                    <a href={channelUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600">
                      <i className="ri-youtube-line text-lg" /> Watch on YouTube
                    </a>
                  )}
                  <Link to="/shows" className="inline-flex items-center gap-2 rounded-lg border border-background-300/60 px-5 py-3 text-sm font-medium text-foreground-300 transition hover:bg-background-100">
                    Explore all shows <i className="ri-arrow-right-line" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background-100 py-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-primary-500">Latest from {show.name}</span>
              <h2 className="font-heading text-2xl font-bold text-foreground-50 md:text-3xl">Episodes & Videos</h2>
            </div>
            <span className="text-sm text-foreground-500">{episodes.length} total</span>
          </div>
          {episodes.length === 0 ? (
            <div className="rounded-xl border border-background-300/40 bg-background-50 px-5 py-10 text-center">
              <i className="ri-youtube-line mb-3 text-3xl text-primary-500" />
              <p className="font-semibold text-foreground-200">No videos assigned to this show yet</p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-foreground-500">Once an admin assigns and saves a YouTube video to {show.name} in YouTube Sync, it will appear here.</p>
            </div>
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
