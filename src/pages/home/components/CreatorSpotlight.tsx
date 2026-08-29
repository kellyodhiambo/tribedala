import { useRef, useEffect, useState } from 'react';
import { getCreators } from '@/lib/queries';
import type { Profile } from '@/lib/queries';

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function CreatorSpotlight() {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCreators({ featured: true })
      .then((data) => setCreators(data))
      .catch(() => setCreators([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section-padding py-16 md:py-24 bg-background-100">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-background-200 rounded animate-pulse mb-10" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse bg-background-200 h-[400px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding py-16 md:py-24 bg-background-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <span className="text-sm font-semibold text-accent-500 tracking-wide uppercase mb-2 block">
              Spotlight
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground-50">
              Creator Spotlight
            </h2>
          </div>
          <p className="text-foreground-400 max-w-md md:text-right">
            Meet the voices and visionaries shaping East African culture through TribeDala.
          </p>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="card overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Avatar */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={creator.avatar_url}
                  alt={creator.full_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/20 to-transparent" />
                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-background-50/80 text-xs font-medium text-foreground-200">
                    {creator.creator_category}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 md:p-4 -mt-10 md:-mt-12 relative">
                <h3 className="font-heading font-bold text-sm md:text-lg text-foreground-50 mb-0.5">
                  {creator.full_name}
                </h3>
                <p className="text-[11px] md:text-xs text-primary-500 font-medium mb-1.5 md:mb-2">
                  {creator.role}
                </p>
                <p className="text-[11px] md:text-xs text-foreground-500 line-clamp-2 mb-2 md:mb-3">
                  {creator.bio}
                </p>
                {/* Socials */}
                <div className="flex items-center gap-2">
                  {Object.entries(creator.social_links).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      className="w-7 h-7 rounded-full bg-background-200 hover:bg-primary-500 flex items-center justify-center text-foreground-500 hover:text-background-50 transition-all"
                      aria-label={platform}
                    >
                      <i className={`ri-${platform === 'twitter' ? 'twitter-x' : platform}-line text-xs`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { AnimatedCounter };