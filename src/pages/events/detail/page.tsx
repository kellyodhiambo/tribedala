import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '@/hooks/useSupabase';

interface TicketTier {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
}

interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  description: string;
  cover_image: string;
  status: string;
  organizer: string;
  capacity: number;
  tickets_sold: number;
  ticket_tiers: TicketTier[] | null;
}
export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      setEvent((data as Event | null) ?? null);
      setLoading(false);
    }

    void fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-background-200 flex items-center justify-center mx-auto">
            <i className="ri-calendar-event-line text-2xl text-foreground-500" />
          </div>
          <h2 className="font-heading text-xl text-foreground-50">Event not found</h2>
          <p className="text-sm text-foreground-500">We couldn&apos;t find this event. It may have been removed.</p>
          <Link to="/events" className="btn-primary text-sm mt-2 inline-flex">
            <i className="ri-arrow-left-line mr-1.5" />Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isUpcoming = event.status === 'upcoming' || event.status === 'ongoing';
  const daysLeft = Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  
  const ticketTiers = Array.isArray(event.ticket_tiers) ? event.ticket_tiers : [];
  const totalTicketsSold = ticketTiers.reduce((sum, ticket) => sum + Number(ticket.sold ?? 0), 0);
  const totalTicketsAvailable = ticketTiers.reduce((sum, ticket) => sum + Number(ticket.quantity ?? 0), 0);
  const totalSoldPct = totalTicketsAvailable > 0 ? Math.round((totalTicketsSold / totalTicketsAvailable) * 100) : 0;
  return (
    <div className="min-h-screen bg-background-50">
      {/* Hero */}
      <div className="relative h-[300px] md:h-[420px] overflow-hidden">
        {event.cover_image ? (
          <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-background-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <Link to="/events" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-primary-400 transition-colors mb-4">
            <i className="ri-arrow-left-line" /> Back to Events
          </Link>
          <h1 className="font-heading text-2xl md:text-4xl text-white drop-shadow-lg">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/80">
            <span className="flex items-center gap-1"><i className="ri-calendar-line text-primary-400" /> {event.date}</span>
            {event.time && <span className="flex items-center gap-1"><i className="ri-time-line text-primary-400" /> {event.time}</span>}
            <span className="flex items-center gap-1"><i className="ri-map-pin-line text-primary-400" /> {event.venue}</span>
          </div>
        </div>
      </div>

      <div className="section-padding py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {isUpcoming ? (
              <div className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <i className="ri-timer-flash-line text-xl text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground-50">{daysLeft}</p>
                  <p className="text-xs text-foreground-500">days until the event</p>
                </div>
                <div className="ml-auto text-sm text-foreground-400 text-right">
                  <p>{totalTicketsSold}/{totalTicketsAvailable} tickets sold</p>
                  <div className="w-32 h-1.5 bg-background-200 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${totalSoldPct}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-500/20 flex items-center justify-center">
                  <i className="ri-check-double-line text-xl text-secondary-400" />
                </div>
                <div>
                  <p className="text-sm font-heading font-bold text-foreground-50">Event Completed</p>
                  <p className="text-xs text-foreground-500">This event has already taken place.</p>
                </div>
                <Link to="/events" className="ml-auto btn-primary text-xs px-4 py-2">Upcoming Events</Link>
              </div>
            )}

            {event.description && (
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground-50 mb-3">About This Event</h3>
                <p className="text-sm text-foreground-300 leading-relaxed">{event.description}</p>
              </div>
            )}

            <div className="card p-5">
              <h3 className="font-heading font-semibold text-sm text-foreground-50 mb-3">Venue</h3>
              <p className="text-sm text-foreground-200 font-medium">{event.venue}</p>
              {event.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-foreground-500 hover:text-primary-400 transition-colors mt-1 group">
                  <i className="ri-map-pin-line text-primary-500 group-hover:text-primary-400" />
                  {event.address}
                  <i className="ri-external-link-line opacity-60" />
                </a>
              )}
              {event.address && (
                <div className="mt-3 h-48 rounded-md overflow-hidden border border-background-300/30">
                  <iframe
                    title={`Map to ${event.venue}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(event.address)}&output=embed`}
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>

            {event.organizer && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background-200 flex items-center justify-center">
                  <i className="ri-user-line text-foreground-400" />
                </div>
                <div>
                  <p className="text-xs text-foreground-500">Organized by</p>
                  <p className="text-sm font-medium text-foreground-200">{event.organizer}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Tickets */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24 space-y-5">
              <h3 className="font-heading font-semibold text-foreground-50">
                {isUpcoming ? 'Get Tickets' : 'Ticket Info'}
              </h3>

              {ticketTiers.length === 0 ? (
                <p className="text-sm text-foreground-500">Ticket details are not available yet.</p>
              ) : (
                <div className="space-y-3">
                  {ticketTiers.map((ticket) => {
                    const remaining = Number(ticket.quantity ?? 0) - Number(ticket.sold ?? 0);
                    return (
                      <div key={ticket.id ?? ticket.name} className="rounded-md border border-background-300/30 bg-background-200/50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground-100">{ticket.name}</p>
                            {ticket.description && <p className="mt-1 text-xs text-foreground-500">{ticket.description}</p>}
                          </div>
                          <p className="whitespace-nowrap text-sm font-heading font-bold text-primary-400">
                            {Number(ticket.price) === 0 ? 'Free' : `KES ${Number(ticket.price).toLocaleString()}`}
                          </p>
                        </div>
                        {isUpcoming && <p className="mt-3 text-xs text-foreground-500">{remaining > 0 ? `${remaining} remaining` : 'Sold out'}</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {isUpcoming && ticketTiers.some((ticket) => Number(ticket.quantity ?? 0) > Number(ticket.sold ?? 0)) && (
                <a
                  href={`https://tickets.tribedala.com/events/${encodeURIComponent(event.slug)}`}
                  className="w-full btn-primary py-3 text-center text-sm"
                >
                  <i className="ri-secure-payment-line mr-1.5" />Book on TicketHub
                </a>
              )}
              {!isUpcoming && (
                <p className="text-xs text-foreground-500 text-center py-2">
                  Tickets for this event are no longer available
                </p>
              )}

              <p className="text-[11px] text-foreground-600 text-center">
                <i className="ri-shield-check-line mr-1" />Booking and ticket delivery are handled on TicketHub
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
