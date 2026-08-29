import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEpisodes, getShowBySlug } from '@/lib/queries';
import type { Episode } from '@/lib/queries';

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

const HOSTS = [
  {
    name: 'Grace Achieng',
    role: 'Head of Content & Host',
    bio: 'Storyteller, producer, and unapologetic advocate for female voices in African media.',
    photo: 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/0cf972b6-a97a-491c-8588-7dd50bbda12e_compressed_stock-girlies-aa.webp',
    handle: '@graceachieng',
  },
  {
    name: 'Wanjiku Muriuki',
    role: 'Community Manager & Co-Host',
    bio: 'Connector, curator, and the heartbeat of the TribeDala community.',
    photo: 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/69ebdbd6-3d09-4ed0-be61-84e46c3ad024_compressed_stock-girlise.webp',
    handle: '@wanjikumuriuki',
  },
  {
    name: 'Amina Hassan',
    role: 'Content Strategist & Co-Host',
    bio: 'Writer, researcher, and the brain behind every episode that hits different.',
    photo: 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/a0a3c64e-b184-4b2d-8c52-2c33ab12ea19_compressed_bbxbx.webp',
    handle: '@aminahassan',
  },
];

export default function GirliesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [, episodesData] = await Promise.all([
          getShowBySlug('girlies'),
          getEpisodes({ showId: 'girlies' }),
        ]);
        setEpisodes(episodesData);
      } catch {
        setEpisodes([]);
      } finally {
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const parallaxOffset = scrollY * 0.3;

  return (
    <div className="min-h-screen bg-background-50">
      {/* Cinematic Hero */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden flex items-end">
        <div
          className="absolute inset-0 w-full h-[120%]"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        >
          <img
            src="https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/0cf972b6-a97a-491c-8588-7dd50bbda12e_compressed_stock-girlies-aa.webp"
            alt="Tribe Dala Girlies"
            className="w-full h-full object-cover object-center"
          />
        </div>
        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

        <div className="relative w-full px-4 md:px-6 lg:px-8 pb-16 md:pb-24 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500/20 backdrop-blur-sm text-xs font-bold text-accent-500 mb-5">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
              By the Women of TribeDala
            </span>

            <h1 className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl text-background-50 mb-4 leading-[0.95]">
              Tribe Dala{' '}
              <span className="text-accent-500">Girlies</span>
            </h1>

            <p className="text-sm md:text-base lg:text-lg text-background-50/90 leading-relaxed max-w-xl mb-8">
              A space where female creators own the narrative unapologetically.
              Podcasts, videos, and stories by the women of TribeDala, for everyone.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link to="/get-involved" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-500 text-background-50 text-sm font-bold hover:bg-accent-600 transition-colors">
                <i className="ri-women-line" />
                Request to Be on Girlies
              </Link>
              <div className="flex gap-2">
                {['ri-spotify-line', 'ri-youtube-line', 'ri-instagram-line', 'ri-tiktok-line'].map((icon) => (
                  <button
                    key={icon}
                    className="w-10 h-10 rounded-lg bg-background-50/10 backdrop-blur-sm flex items-center justify-center text-background-50 hover:bg-accent-500 hover:text-background-50 transition-all"
                    aria-label="Platform"
                  >
                    <i className={icon} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 text-background-50/80 text-xs md:text-sm font-medium">
              <div className="flex items-center gap-2">
                <i className="ri-mic-line text-accent-500" />
                <span>86 Episodes</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-video-line text-accent-500" />
                <span>34 Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-group-line text-accent-500" />
                <span>3 Hosts</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-calendar-line text-accent-500" />
                <span>Since 2021</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery — Bento Grid */}
      <section className="section-padding py-10 md:py-16 bg-background-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <span className="text-xs font-semibold text-accent-500 tracking-wide uppercase mb-2 block">
              Gallery
            </span>
            <h2 className="font-heading font-bold text-2xl md:text-4xl text-foreground-50">
              Behind the Girlies
            </h2>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[120px] md:auto-rows-[180px]">
            {/* Large feature */}
            <div
              className="col-span-2 row-span-2 relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightboxIndex(0)}
            >
              <img
                src={GIRLIES_PHOTOS[0].url}
                alt={GIRLIES_PHOTOS[0].caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 text-background-50 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {GIRLIES_PHOTOS[0].caption}
              </div>
            </div>

            {/* Tall */}
            <div
              className="col-span-1 row-span-2 relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightboxIndex(1)}
            >
              <img
                src={GIRLIES_PHOTOS[1].url}
                alt={GIRLIES_PHOTOS[1].caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 text-background-50 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {GIRLIES_PHOTOS[1].caption}
              </div>
            </div>

            {/* Small top-right */}
            <div
              className="col-span-1 row-span-1 relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightboxIndex(2)}
            >
              <img
                src={GIRLIES_PHOTOS[2].url}
                alt={GIRLIES_PHOTOS[2].caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 text-background-50 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {GIRLIES_PHOTOS[2].caption}
              </div>
            </div>

            {/* Bottom row */}
            <div
              className="col-span-2 row-span-1 relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightboxIndex(3)}
            >
              <img
                src={GIRLIES_PHOTOS[3].url}
                alt={GIRLIES_PHOTOS[3].caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 text-background-50 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {GIRLIES_PHOTOS[3].caption}
              </div>
            </div>

            {/* Wide bottom-right */}
            <div
              className="col-span-1 row-span-1 relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setLightboxIndex(4)}
            >
              <img
                src={GIRLIES_PHOTOS[4].url}
                alt={GIRLIES_PHOTOS[4].caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 text-background-50 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {GIRLIES_PHOTOS[4].caption}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Hosts */}
      <section className="section-padding py-10 md:py-16 bg-background-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-xs font-semibold text-accent-500 tracking-wide uppercase mb-2 block">
              The Girlies Crew
            </span>
            <h2 className="font-heading font-bold text-2xl md:text-4xl text-foreground-50">
              Meet the Hosts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {HOSTS.map((host) => (
              <div
                key={host.name}
                className="group relative rounded-xl overflow-hidden bg-background-100"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={host.photo}
                    alt={host.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className="font-heading font-bold text-lg md:text-xl text-foreground-50 mb-1">
                    {host.name}
                  </h3>
                  <p className="text-xs font-semibold text-accent-500 mb-2">
                    {host.role}
                  </p>
                  <p className="text-xs md:text-sm text-foreground-400 leading-relaxed mb-3">
                    {host.bio}
                  </p>
                  <div className="flex items-center gap-3">
                    {['ri-instagram-line', 'ri-twitter-x-line', 'ri-youtube-line'].map((icon) => (
                      <button
                        key={icon}
                        className="w-8 h-8 rounded-full bg-background-50/80 flex items-center justify-center text-foreground-300 hover:bg-accent-500 hover:text-background-50 transition-all"
                        aria-label="Social"
                      >
                        <i className={icon} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
