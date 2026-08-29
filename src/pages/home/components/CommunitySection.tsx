import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getCommunityStats, getUpcomingEvents } from '@/lib/queries';
import { AnimatedCounter } from './CreatorSpotlight';

interface Stat {
  id: string;
  label: string;
  value: number;
  suffix: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  start_date: string;
  venue: string;
  ticket_tiers: { name: string; price: number; description: string; capacity: number }[];
  status: string;
  date?: string;
  time?: string;
}

export default function CommunitySection() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [stats, setStats] = useState<Stat[]>([]);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCommunityStats(),
      getUpcomingEvents(1),
    ])
      .then(([communityStats, upcoming]) => {
        setStats(communityStats);
        setNextEvent(upcoming[0] ?? null);
      })
      .catch(() => {
        setStats([]);
        setNextEvent(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setNewsletterStatus('error');
      return;
    }
    setNewsletterStatus('success');
    setEmail('');
    setTimeout(() => setNewsletterStatus('idle'), 5000);
  };

  const daysUntil = nextEvent
    ? Math.ceil((new Date(nextEvent.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <section className="section-padding py-16 md:py-24 bg-background-50">
      <div className="max-w-7xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-12 md:mb-20">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="card p-5 text-center animate-pulse bg-background-200 h-24" />
            ))
          ) : (
            stats.map((stat) => (
              <div
                key={stat.id}
                className="card p-5 text-center hover:bg-background-200/40 transition-colors"
              >
                <p className="font-heading font-bold text-xl md:text-3xl text-primary-500 mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[11px] md:text-sm text-foreground-500">{stat.label}</p>
              </div>
            ))
          )}
        </div>

        {/* Two Column: Events + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Upcoming Event */}
          <div className="space-y-6">
            <div>
              <span className="text-sm font-semibold text-accent-500 tracking-wide uppercase mb-2 block">
                Next Up
              </span>
              <h2 className="font-heading font-bold text-xl md:text-3xl text-foreground-50">
                {nextEvent?.title || 'Loading...'}
              </h2>
            </div>

            {nextEvent && (
              <div className="card overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={nextEvent.cover_image}
                    alt={nextEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 rounded-full bg-accent-500 text-background-50 text-xs font-semibold">
                      {daysUntil > 0 ? `${daysUntil} days left` : 'Happening soon'}
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap gap-3 text-sm text-foreground-400">
                    <span className="flex items-center gap-1.5">
                      <i className="ri-calendar-line text-primary-500" />
                      {nextEvent.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="ri-time-line text-primary-500" />
                      {nextEvent.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="ri-map-pin-line text-primary-500" />
                      {nextEvent.venue}
                    </span>
                  </div>
                  <p className="text-sm text-foreground-400">
                    {nextEvent.description}
                  </p>
                  {nextEvent.ticket_tiers && nextEvent.ticket_tiers.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {nextEvent.ticket_tiers.map((tier) => (
                        <span
                          key={tier.name}
                          className="px-3 py-1.5 rounded-full bg-background-200 text-xs text-foreground-300"
                        >
                          {tier.name}: KES {tier.price.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link to={`/events/${nextEvent.id}`} className="btn-primary text-sm w-full justify-center mt-2">
                    Get Tickets
                    <i className="ri-ticket-line ml-2" />
                  </Link>
                </div>
              </div>
            )}

            <Link to="/events" className="text-sm font-medium text-primary-500 flex items-center gap-1 hover:gap-2 transition-all">
              View All Events
              <i className="ri-arrow-right-line" />
            </Link>
          </div>

          {/* Newsletter + Social */}
          <div className="space-y-6">
            <div>
              <span className="text-sm font-semibold text-primary-500 tracking-wide uppercase mb-2 block">
                Stay Connected
              </span>
              <h2 className="font-heading font-bold text-xl md:text-3xl text-foreground-50">
                Join the Community
              </h2>
            </div>

            <p className="text-foreground-400">
              Get weekly drops of the freshest episodes, event invites, creator
              opportunities, and behind-the-scenes content. No spam — just the vibe.
            </p>

            <form onSubmit={handleNewsletter} className="card p-5 space-y-4">
              <div>
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-md bg-background-200 border border-background-300/50 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center text-sm">
                Subscribe to the Tribe
                <i className="ri-mail-send-line ml-2" />
              </button>
              {newsletterStatus === 'success' && (
                <p className="text-xs text-primary-400 text-center">
                  You&apos;re in! Check your inbox for a welcome message.
                </p>
              )}
              {newsletterStatus === 'error' && (
                <p className="text-xs text-accent-400 text-center">
                  Please enter a valid email address.
                </p>
              )}
            </form>

            {/* Social links */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-foreground-200 mb-4">Follow the Tribe</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: 'ri-instagram-line', label: 'Instagram', handle: '@tribedala', color: 'hover:text-pink-500' },
                  { icon: 'ri-youtube-line', label: 'YouTube', handle: 'TribeDala TV', color: 'hover:text-red-500' },
                  { icon: 'ri-twitter-x-line', label: 'X', handle: '@tribedala', color: 'hover:text-white' },
                  { icon: 'ri-tiktok-line', label: 'TikTok', handle: '@tribedala', color: 'hover:text-cyan-400' },
                  { icon: 'ri-spotify-line', label: 'Spotify', handle: 'TribeDala', color: 'hover:text-green-500' },
                  { icon: 'ri-whatsapp-line', label: 'WhatsApp', handle: 'Community', color: 'hover:text-green-400' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className={`flex items-center gap-3 p-3 rounded-md bg-background-200/50 hover:bg-background-200 transition-colors group ${social.color}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-background-300/50 flex items-center justify-center">
                      <i className={`${social.icon} text-foreground-400 group-hover:text-inherit transition-colors text-sm`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground-200">{social.label}</p>
                      <p className="text-[10px] text-foreground-600">{social.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
