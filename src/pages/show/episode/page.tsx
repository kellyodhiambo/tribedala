import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEpisodeById, getEpisodes } from '@/lib/queries';
import type { Episode } from '@/lib/queries';

export default function EpisodePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [relatedEpisodes, setRelatedEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const ep = await getEpisodeById(id);
        if (!ep) {
          navigate('/');
          return;
        }

        setEpisode(ep);

        // Fetch related episodes from the same show
        if (ep.show_id) {
          const related = await getEpisodes({ showId: ep.show_id });
          setRelatedEpisodes(related.filter(e => e.id !== id).slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching episode:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-96 h-64 bg-background-200 rounded-lg mb-4" />
          <div className="w-96 h-8 bg-background-200 rounded mb-2" />
          <div className="w-96 h-4 bg-background-200 rounded" />
        </div>
      </div>
    );
  }

  if (!episode) {
    return null;
  }

  const isVideo = episode.type === 'video';

  return (
    <div className="min-h-screen bg-background-50">
      {/* Back Button */}
      <div className="section-padding pt-6 pb-3">
        <Link
          to={episode.show_id ? `/shows/episode/${episode.id}` : '/shows'}
          className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          <i className="ri-arrow-left-line" />
          Back to Episodes
        </Link>
      </div>

      {/* Main Content */}
      <div className="section-padding py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Player */}
          {isVideo && episode.video_url ? (
            <div className="mb-8">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={episode.video_url}
                  title={episode.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : episode.audio_url ? (
            <div className="mb-8 p-6 bg-background-100 rounded-xl">
              <div className="flex items-center justify-center mb-4">
                <i className="ri-music-2-line text-3xl text-primary-500" />
              </div>
              <audio controls className="w-full">
                <source src={episode.audio_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <div className="mb-8 p-12 bg-background-100 rounded-xl text-center">
              <i className="ri-video-off-line text-4xl text-foreground-600 mb-3 block" />
              <p className="text-foreground-500">No media available</p>
            </div>
          )}

          {/* Info */}
          <div className="space-y-6">
            {/* Title & Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-xs font-semibold text-primary-500">
                  <i className={isVideo ? 'ri-video-line' : 'ri-mic-line'} />
                  {isVideo ? 'Video' : 'Podcast'}
                </span>
                {episode.show && (
                  <span className="text-xs text-foreground-500">
                    From <span className="text-foreground-300 font-medium">{episode.show.name}</span>
                  </span>
                )}
              </div>
              <h1 className="font-heading font-bold text-2xl md:text-4xl text-foreground-50 mb-3">
                {episode.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-500">
                <span className="flex items-center gap-1.5">
                  <i className="ri-calendar-line" />
                  {new Date(episode.published_at).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {episode.duration > 0 && (
                  <span className="flex items-center gap-1.5">
                    <i className="ri-time-line" />
                    {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
                  </span>
                )}
                {episode.guest_names && episode.guest_names.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <i className="ri-user-line" />
                    Guest: {episode.guest_names.join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-background-300/30" />

            {/* Description */}
            {episode.description && (
              <div>
                <h2 className="text-lg font-semibold text-foreground-50 mb-3">About</h2>
                <p className="text-sm md:text-base text-foreground-400 leading-relaxed whitespace-pre-wrap">
                  {episode.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Episodes */}
      {relatedEpisodes.length > 0 && (
        <div className="section-padding py-12 md:py-16 bg-background-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading font-bold text-xl md:text-2xl text-foreground-50 mb-6">
              More from {episode.show?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedEpisodes.map((ep) => (
                <Link
                  key={ep.id}
                  to={`/shows/episode/${ep.id}`}
                  className="card overflow-hidden group hover:-translate-y-1 transition-transform"
                >
                  <div className="relative aspect-video overflow-hidden bg-background-300">
                    <img
                      src={ep.cover_image}
                      alt={ep.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-background-50/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="ri-play-fill text-foreground-50 text-lg" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-foreground-50 group-hover:text-primary-500 transition-colors line-clamp-2">
                      {ep.title}
                    </h3>
                    <p className="text-xs text-foreground-600 mt-2">
                      {new Date(ep.published_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
