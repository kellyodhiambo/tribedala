import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEpisodes, getShowBySlug, getCreators } from '@/lib/queries';
import type { Episode, Profile } from '@/lib/queries';

const GIRLIES_PHOTOS = [
  {
    url: 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/0cf972b6-a97a-491c-8588-7dd50bbda12e_compressed_stock-girlies-aa.webp',
    caption: 'The Girlies in studio',
  },
  {
    url: 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/1ec56beb-a916-4820-a87a-820f48cabd83_compressed_stock.webp',
    caption: 'Behind the mic',
  },
  {
    url: 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/69ebdbd6-3d09-4ed0-be61-84e46c3ad024_compressed_stock-girlise.webp',
    caption: 'Girlies squad',
  },
  {
    url: 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/a0a3c64e-b184-4b2d-8c52-2c33ab12ea19_compressed_bbxbx.webp',
    caption: 'Casual vibes',
  },
  {
    url: 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/a9b0ca4b-2c37-4f4b-90b1-32e0bcc00a90_compressed_IMG_0921-1ddd.webp',
    caption: 'In conversation',
  },
];



export default function GirliesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [crewMembers, setCrewMembers] = useState<Profile[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [, episodesData, crewData] = await Promise.all([
          getShowBySlug('girlies'),
          getEpisodes({ showId: 'girlies' }),
          getCreators(),
        ]);
        setEpisodes(episodesData);
        setCrewMembers(crewData || []);
      } catch {
        setEpisodes([]);
        setCrewMembers([]);
      }
    }
    fetchData();
  }, []);



  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev !== null && prev < GIRLIES_PHOTOS.length - 1 ? prev + 1 : prev));
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero with Show Info */}
      <section className="section-padding py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Cover Image */}
            <div className="relative aspect-square max-w-md mx-auto lg:mx-0 rounded-xl overflow-hidden bg-background-200">
              <img
                src="https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/0cf972b6-a97a-491c-8588-7dd50bbda12e_compressed_stock-girlies-aa.webp"
                alt="Tribe Dala Girlies"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-transparent to-transparent" />
            </div>

            {/* Show Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 text-xs font-semibold text-accent-500 mb-3 block">
                  <i className="ri-women-line" />
                  By Women, For Everyone
                </span>
                <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground-50 mb-3">
                  Tribe Dala Girlies
                </h1>
                <p className="text-sm md:text-base text-foreground-400 leading-relaxed">
                  Stories, insights, and conversations celebrating women innovators and creators in our community.
                </p>
              </div>

              {/* Host Info */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background-100">
                <div className="w-10 h-10 rounded-full bg-background-200 flex items-center justify-center flex-shrink-0">
                  <i className="ri-women-line text-accent-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground-200">Hosted by TribeDala Team</p>
                  <p className="text-xs text-foreground-500">{episodes.length} Episodes</p>
                </div>
              </div>

              {/* Recent Episodes Preview */}
              <div>
                <p className="text-xs font-semibold text-foreground-500 uppercase tracking-wider mb-3">
                  Recent Episodes
                </p>
                <div className="space-y-2">
                  {episodes.slice(0, 3).map((ep) => (
                    <Link
                      key={ep.id}
                      to={`/shows/episode/${ep.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-background-100 transition-colors group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-background-200">
                        <img src={ep.cover_image} alt={ep.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground-200 group-hover:text-accent-500 transition-colors line-clamp-1">
                          {ep.title}
                        </p>
                        <p className="text-[10px] text-foreground-500">
                          {Math.floor(ep.duration / 60)}:{(ep.duration % 60).toString().padStart(2, '0')} • {new Date(ep.published_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-accent-500/10 group-hover:bg-accent-500 flex items-center justify-center flex-shrink-0 transition-colors">
                        <i className="ri-arrow-right-line text-xs text-accent-500 group-hover:text-background-50" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/shows/girlies" className="btn-primary text-xs md:text-sm px-6 py-2.5 rounded-lg">
                  Explore Girlies
                  <i className="ri-arrow-right-line ml-2" />
                </Link>
                <Link to="/get-involved" className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-background-300/50 text-xs md:text-sm font-medium text-foreground-300 hover:text-foreground-50 hover:bg-background-100 transition-all">
                  Request to Be a Guest
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section className="section-padding py-10 md:py-16 bg-background-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <span className="text-xs font-semibold text-accent-500 tracking-wide uppercase mb-2 block">
                Latest Episodes
              </span>
              <h2 className="font-heading font-bold text-2xl md:text-4xl text-foreground-50">
                All Girlies Content
              </h2>
            </div>
            <Link
              to="/shows/hub"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-accent-500 hover:text-accent-600 transition-colors"
            >
              View All Shows
              <i className="ri-arrow-right-line" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                to={`/shows/episode/${ep.id}`}
                className="group bg-background-50 rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-lg cursor-pointer block"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={ep.cover_image || 'https://via.placeholder.com/400x225'}
                    alt={ep.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-50/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-500/10 text-accent-500"
                    >
                      <i className="ri-video-line" />
                      Video
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 rounded bg-background-50/90 text-xs text-foreground-200 font-medium">
                      {ep.duration ? `${Math.floor(ep.duration / 60)}:${(ep.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-accent-500/90 flex items-center justify-center text-background-50">
                      <i className="ri-play-fill text-xl" />
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="font-heading font-semibold text-sm md:text-base text-foreground-50 mb-1.5 group-hover:text-accent-500 transition-colors">
                    {ep.title}
                  </h3>
                  <p className="text-xs text-foreground-500 line-clamp-2 mb-3">
                    {ep.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-foreground-600">
                    <span>{ep.published_at ? new Date(ep.published_at).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-accent-500 font-medium">{ep.guest_names?.[0] ? `Guest: ${ep.guest_names[0]}` : 'No guests'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The Girlies Crew — Dynamic Members */}
      {crewMembers.length > 0 && (
        <section className="section-padding py-10 md:py-16 bg-background-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              <span className="text-xs font-semibold text-accent-500 tracking-wide uppercase mb-2 block">
                The Girlies Crew
              </span>
              <h2 className="font-heading font-bold text-2xl md:text-4xl text-foreground-50">
                Meet Our Members
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {crewMembers.map((member) => (
                <Link
                  key={member.id}
                  to={`/creators/${member.id}`}
                  className="group relative rounded-xl overflow-hidden bg-background-100 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    {member.avatar_url && (
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/30 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h3 className="font-heading font-bold text-lg md:text-xl text-foreground-50 mb-1">
                      {member.full_name || 'Creator'}
                    </h3>
                    <p className="text-xs font-semibold text-accent-500 mb-2">
                      {member.creator_category || 'Creator'}
                    </p>
                    <p className="text-xs md:text-sm text-foreground-400 leading-relaxed mb-3 line-clamp-2">
                      {member.bio || 'Passionate creator with unique perspective'}
                    </p>
                    <div className="flex items-center gap-3">
                      {member.social_links?.instagram && (
                        <a href={member.social_links.instagram} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-background-50/80 flex items-center justify-center text-foreground-300 hover:bg-accent-500 hover:text-background-50 transition-all"
                          aria-label="Instagram"
                        >
                          <i className="ri-instagram-line" />
                        </a>
                      )}
                      {member.social_links?.twitter && (
                        <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-background-50/80 flex items-center justify-center text-foreground-300 hover:bg-accent-500 hover:text-background-50 transition-all"
                          aria-label="Twitter"
                        >
                          <i className="ri-twitter-x-line" />
                        </a>
                      )}
                      {member.social_links?.youtube && (
                        <a href={member.social_links.youtube} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-background-50/80 flex items-center justify-center text-foreground-300 hover:bg-accent-500 hover:text-background-50 transition-all"
                          aria-label="YouTube"
                        >
                          <i className="ri-youtube-line" />
                        </a>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Episodes */}
      <section className="section-padding py-10 md:py-16 bg-background-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <span className="text-xs font-semibold text-accent-500 tracking-wide uppercase mb-2 block">
                Latest Episodes
              </span>
              <h2 className="font-heading font-bold text-2xl md:text-4xl text-foreground-50">
                All Girlies Content
              </h2>
            </div>
            <Link
              to="/shows/hub"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-accent-500 hover:text-accent-600 transition-colors"
            >
              View All Shows
              <i className="ri-arrow-right-line" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                to={`/shows/episode/${ep.id}`}
                className="group bg-background-50 rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-lg cursor-pointer block"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={ep.cover_image || 'https://via.placeholder.com/400x225'}
                    alt={ep.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-50/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-500/10 text-accent-500"
                    >
                      <i className="ri-video-line" />
                      Video
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 rounded bg-background-50/90 text-xs text-foreground-200 font-medium">
                      {ep.duration ? `${ep.duration}s` : 'N/A'}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-accent-500/90 flex items-center justify-center text-background-50">
                      <i className="ri-play-fill text-xl" />
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="font-heading font-semibold text-sm md:text-base text-foreground-50 mb-1.5 group-hover:text-accent-500 transition-colors">
                    {ep.title}
                  </h3>
                  <p className="text-xs text-foreground-500 line-clamp-2 mb-3">
                    {ep.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-foreground-600">
                    <span>{ep.published_at ? new Date(ep.published_at).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-accent-500 font-medium">{ep.guest_names?.[0] ? `Guest: ${ep.guest_names[0]}` : 'No guests'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* In the Studio */}
      <section className="section-padding py-10 md:py-16 bg-background-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative rounded-xl overflow-hidden aspect-video lg:aspect-[4/3]">
              <img
                src="https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/a9b0ca4b-2c37-4f4b-90b1-32e0bcc00a90_compressed_IMG_0921-1ddd.webp"
                alt="In the studio"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-background-50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold">Recording Session</span>
              </div>
            </div>
            <div className="space-y-5">
              <span className="text-xs font-semibold text-accent-500 tracking-wide uppercase">
                Inside the Studio
              </span>
              <h2 className="font-heading font-bold text-2xl md:text-4xl text-foreground-50">
                Where the Magic Happens
              </h2>
              <p className="text-sm md:text-base text-foreground-400 leading-relaxed">
                Every episode of Girlies is recorded in a safe, creative space designed to amplify
                female voices. From casual kitchen-table conversations to deep dives on culture and
                career, we bring authentic storytelling to the forefront.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'ri-headphone-line', label: 'Studio Recordings', value: '86+' },
                  { icon: 'ri-live-line', label: 'Live Sessions', value: '24' },
                  { icon: 'ri-user-voice-line', label: 'Guest Features', value: '120+' },
                  { icon: 'ri-heart-line', label: 'Community Loves', value: '45K' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-background-100 rounded-lg p-3 md:p-4">
                    <i className={`${stat.icon} text-accent-500 text-lg mb-1`} />
                    <p className="text-xl md:text-2xl font-bold text-foreground-50">{stat.value}</p>
                    <p className="text-xs text-foreground-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding py-12 md:py-20 bg-background-100">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-xs font-semibold text-accent-500 tracking-wide uppercase">
            Join the Movement
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground-50">
            Want to Be Featured on Girlies?
          </h2>
          <p className="text-sm md:text-base text-foreground-400 max-w-lg mx-auto">
            We&apos;re always looking for powerful female voices to share their stories with our community.
            Got a story, a perspective, or a conversation worth having?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/get-involved" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-accent-500 text-background-50 text-sm font-bold hover:bg-accent-600 transition-colors">
              <i className="ri-women-line" />
              Request to Be on Girlies
            </Link>
            <Link to="/shows/hub" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-background-200 text-foreground-300 text-sm font-bold hover:bg-background-100 transition-colors">
              <i className="ri-arrow-left-line" />
              All Shows
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background-50/10 flex items-center justify-center text-background-50 hover:bg-background-50/20 transition-colors"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            <i className="ri-close-line" />
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background-50/10 flex items-center justify-center text-background-50 hover:bg-background-50/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              aria-label="Previous"
            >
              <i className="ri-arrow-left-line" />
            </button>
          )}
          {lightboxIndex < GIRLIES_PHOTOS.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background-50/10 flex items-center justify-center text-background-50 hover:bg-background-50/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              aria-label="Next"
            >
              <i className="ri-arrow-right-line" />
            </button>
          )}
          <div className="max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={GIRLIES_PHOTOS[lightboxIndex].url}
              alt={GIRLIES_PHOTOS[lightboxIndex].caption}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <p className="text-center text-background-50 text-sm mt-3 font-medium">
              {GIRLIES_PHOTOS[lightboxIndex].caption} — {lightboxIndex + 1} / {GIRLIES_PHOTOS.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
