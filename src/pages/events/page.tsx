import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '@/hooks/useSupabase';

interface TicketTier { name: string; price: number; description: string; capacity: number }
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  cover_image: string;
  status: string;
  capacity: number;
  tickets_sold: number;
  ticket_tiers: TicketTier[];
}

export default function EventsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*')
        .in('status', tab === 'upcoming' ? ['upcoming', 'ongoing'] : ['past', 'cancelled'])
        .order('date', { ascending: tab === 'upcoming' });
      setEvents(data ?? []);
      setLoading(false);
    }
    fetchEvents();
  }, [tab]);

  return (
    <div className="min-h-screen bg-background-50">
      <section className="relative pt-20 md:pt-28 pb-12 md:pb-20 section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 text-xs font-semibold text-accent-500 mb-4">
            <i className="ri-calendar-event-line" />Events Hub
          </span>
          <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-foreground-50 mb-4">
            TribeDala Events
          </h1>
          <p className="text-sm md:text-lg text-foreground-400 max-w-2xl mx-auto">
            From intimate open mics to lakeside festivals. Find your next unforgettable experience with the Tribe.
          </p>
        </div>
      </section>

      <section className="section-padding py-6 md:py-10 bg-background-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            {(['upcoming', 'past'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-primary-500 text-background-50' : 'bg-background-200 text-foreground-400 hover:text-foreground-200'}`}>
                {t === 'upcoming' ? 'Upcoming' : 'Past Events'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <div key={i} className="card h-80 animate-pulse bg-background-200" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-foreground-500">No {tab} events at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event) => {
                const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={event.id} className="card overflow-hidden group">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {event.cover_image ? (
                        <img src={event.cover_image} alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-background-200 flex items-center justify-center">
                          <i className="ri-calendar-event-line text-3xl text-foreground-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        {tab === 'upcoming' ? (
                          <span className="px-2.5 py-1 rounded-full bg-accent-500 text-background-50 text-xs font-semibold">
                            {daysUntil > 0 ? `${daysUntil} days left` : 'Happening soon'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-background-200 text-foreground-400 text-xs font-medium">Past Event</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 md:p-5 space-y-3">
                      <h3 className="font-heading font-semibold text-base md:text-lg text-foreground-50 group-hover:text-accent-500 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-xs md:text-sm text-foreground-400">
                        <span className="flex items-center gap-1"><i className="ri-calendar-line text-primary-500" />{event.date}</span>
                        {event.time && <span className="flex items-center gap-1"><i className="ri-time-line text-primary-500" />{event.time}</span>}
                        <span className="flex items-center gap-1"><i className="ri-map-pin-line text-primary-500" />{event.venue}</span>
                      </div>
                      {event.description && (
                        <p className="text-xs md:text-sm text-foreground-500 line-clamp-2">{event.description}</p>
                      )}
                      {event.ticket_tiers?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {event.ticket_tiers.map((tier) => (
                            <span key={tier.name} className="px-2.5 py-1 rounded-full text-[11px] md:text-xs font-medium bg-background-200 text-foreground-300">
                              {tier.name}: KSh {Number(tier.price).toLocaleString()}
                            </span>
                          ))}
                        </div>
                      )}
                      {tab === 'upcoming' ? (
                        <Link to={`/events/${event.id}`} className="btn-primary text-xs md:text-sm w-full justify-center py-2.5">
                          Get Tickets <i className="ri-ticket-line ml-1.5" />
                        </Link>
                      ) : (
                        <button className="w-full py-2.5 rounded-md bg-background-200 text-xs md:text-sm font-medium text-foreground-500 hover:text-foreground-300 transition-colors">
                          View Recap
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding py-12 md:py-20">
        <div className="max-w-4xl mx-auto card p-6 md:p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto">
            <i className="ri-calendar-event-line text-accent-500 text-2xl" />
          </div>
          <h2 className="font-heading font-bold text-xl md:text-3xl text-foreground-50">Want to Host an Event?</h2>
          <p className="text-sm md:text-base text-foreground-400 max-w-lg mx-auto">
            From ticket sales to production support, we help event organizers create unforgettable experiences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/get-involved" className="btn-primary text-sm md:text-base px-6 py-3">
              <i className="ri-calendar-event-line mr-2" />List Your Event
            </Link>
            <Link to="/services" className="btn-secondary text-sm md:text-base px-6 py-3">Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
