import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const sloganLines = [
  { words: ['You', 'know', 'the'], delay: 0 },
  { words: ['Tribe,', 'You', 'know'], delay: 0.6 },
  { words: ['the', 'Vibe'], delay: 1.2 },
];

const accentIndices = new Map([
  ['0-3', true],  // line 0, word 3 = "Tribe,"
  ['2-1', true],  // line 2, word 1 = "Vibe"
]);

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }, []);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[45dvh] md:min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Real Studio Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/90627646-d1af-4173-a4d8-0db6a7da9f51_compressed_Untitled-designnn.webp"
          alt="TribeDala Studio"
          className="w-full h-full object-cover object-center transition-transform duration-[3000ms] ease-out"
          style={{
            transform: loaded
              ? `scale(1.03) translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)`
              : 'scale(1.08)',
          }}
        />
      </div>

      {/* Cinematic Dark Overlays — Multi-layer for depth */}
      {/* Base darkening */}
      <div className="absolute inset-0 bg-black/55" />
      {/* Bottom fade for scroll readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      {/* Side vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
      {/* Gold accent glow at center-top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgba(242,201,76,0.06)_0%,transparent_70%)]" />

      {/* Film grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Light flare / lens effect */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(242,201,76,0.08) 0%, transparent 70%)',
          top: '10%',
          left: '50%',
          transform: `translate(-50%, 0) translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
        }}
      />

      {/* Floating gold particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(24)].map((_, i) => {
          const size = 1.5 + Math.random() * 2.5;
          const isGold = i % 4 === 0;
          const isWarm = i % 4 === 1;
          return (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: isGold
                  ? 'rgba(242, 201, 76, 0.7)'
                  : isWarm
                    ? 'rgba(210, 140, 80, 0.5)'
                    : 'rgba(255, 255, 255, 0.25)',
                boxShadow: isGold
                  ? '0 0 8px rgba(242, 201, 76, 0.5), 0 0 16px rgba(242, 201, 76, 0.2)'
                  : isWarm
                    ? '0 0 6px rgba(210, 140, 80, 0.3)'
                    : '0 0 4px rgba(255, 255, 255, 0.2)',
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${6 + Math.random() * 8}s`,
              }}
            />
          );
        })}
      </div>

      {/* Horizontal light streak */}
      <div
        className="absolute w-[800px] h-[2px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(242,201,76,0.15), transparent)',
          top: '38%',
          left: '50%',
          transform: `translate(-50%, ${mousePos.y * 15}px) rotate(${2 + mousePos.x * 4}deg)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 section-padding w-full max-w-6xl mx-auto text-center pt-16 md:pt-24 pb-12 md:pb-24">
        {/* Location Badge */}
        <div
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 mb-5 md:mb-10 transition-all duration-1000 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500" />
          </span>
          <span className="text-xs md:text-sm font-medium text-white/70 tracking-wide">
            Kisumu, Kenya &middot; Creators&apos; Community &amp; Media Hub
          </span>
        </div>

        {/* Slogan — Cinematic reveal with gold accents */}
        <h1 className="font-heading font-bold text-[24px] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.06] tracking-tight mb-4 md:mb-8 max-w-5xl mx-auto drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
          {sloganLines.map((line, lineIdx) => (
            <span key={lineIdx} className="block overflow-hidden pb-1">
              <span className="inline-block">
                {line.words.map((word, wordIdx) => {
                  const isAccent = accentIndices.has(`${lineIdx}-${wordIdx}`);
                  return (
                    <span
                      key={wordIdx}
                      className={`inline-block mr-[0.22em] transition-all duration-700 ease-out ${
                        loaded
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-full'
                      } ${
                        isAccent
                          ? 'text-primary-400 relative drop-shadow-[0_0_20px_rgba(242,201,76,0.3)]'
                          : 'text-white'
                      }`}
                      style={{
                        transitionDelay: `${line.delay + wordIdx * 0.12}s`,
                        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      {word}
                      {isAccent && (
                        <span
                          className="absolute -bottom-1 md:-bottom-2 left-0 h-1 md:h-1.5 bg-primary-500/70 rounded-full transition-all duration-700"
                          style={{
                            width: loaded ? '100%' : '0%',
                            transitionDelay: `${line.delay + wordIdx * 0.12 + 0.4}s`,
                          }}
                        />
                      )}
                    </span>
                  );
                })}
              </span>
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <p
          className={`text-xs sm:text-base md:text-xl text-white/70 max-w-xl mx-auto mb-6 md:mb-12 font-body leading-relaxed transition-all duration-1000 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '2s' }}
        >
          The creative heartbeat of Kisumu. Podcasts that matter.
          Events that move. A community where creators become legends.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 transition-all duration-1000 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '2.3s' }}
        >
          <Link
            to="/get-involved"
            className="group relative overflow-hidden inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-primary-500 text-background-50 text-sm md:text-base font-semibold whitespace-nowrap transition-all duration-300 hover:bg-primary-600 hover:shadow-[0_0_40px_rgba(242,201,76,0.35)] cursor-pointer"
          >
            <span className="relative z-10 flex items-center">
              <i className="ri-user-add-line mr-2 group-hover:scale-110 transition-transform duration-300" />
              Join the Tribe
            </span>
          </Link>

          <Link
            to="/shows/podcast"
            className="group inline-flex items-center justify-center px-8 py-3.5 rounded-lg border border-white/25 text-sm md:text-base font-semibold text-white/90 whitespace-nowrap transition-all duration-300 hover:border-primary-500/60 hover:text-primary-400 hover:bg-primary-500/10 backdrop-blur-sm cursor-pointer"
          >
            <i className="ri-play-circle-line mr-2 group-hover:scale-110 transition-transform duration-300" />
            Watch Latest Episode
          </Link>

          <Link
            to="/events"
            className="hidden md:inline-flex items-center justify-center px-8 py-3.5 rounded-lg border border-white/25 text-sm md:text-base font-semibold text-white/90 whitespace-nowrap transition-all duration-300 hover:border-accent-500/60 hover:text-accent-400 hover:bg-accent-500/10 backdrop-blur-sm group cursor-pointer"
          >
            <i className="ri-calendar-event-line mr-2 group-hover:scale-110 transition-transform duration-300" />
            See Events
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className={`mt-8 md:mt-20 flex flex-wrap items-center justify-center gap-4 md:gap-12 transition-all duration-1000 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '2.6s' }}
        >
          {[
            { value: '340+', label: 'Episodes' },
            { value: '127+', label: 'Verified Creators' },
            { value: '8.4K+', label: 'Community Members' },
            { value: '56', label: 'Events Hosted' },
          ].map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <p className="font-heading font-bold text-lg md:text-3xl text-white group-hover:text-primary-400 transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {stat.value}
              </p>
              <p className="text-[10px] md:text-xs text-white/50 font-medium tracking-wide uppercase mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '3s' }}
      >
        <div className="flex flex-col items-center gap-2 text-white/40 hover:text-primary-500 transition-colors duration-300 cursor-pointer">
          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase drop-shadow-sm">Discover</span>
          <div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-primary-500 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}