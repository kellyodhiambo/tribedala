import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '@/hooks/useSupabase';
import TicketPurchaseModal from '@/components/TicketPurchaseModal';

interface Event {
  id: string;
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
  ticket_link?: string;
}

interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  description?: string;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    async function fetchEventAndTickets() {
      if (!id) return;
      
      // Fetch event
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      setEvent(eventData);

      // Fetch active ticket types for this event
      const { data: ticketsData } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', id)
        .eq('is_active', true)
        .order('price', { ascending: true });

      setTickets(ticketsData || []);
      setLoading(false);
    }
    
    fetchEventAndTickets();
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
  
  // Calculate total tickets sold
  const totalTicketsSold = tickets.reduce((sum, ticket) => sum + ticket.quantity_sold, 0);
  const totalTicketsAvailable = tickets.reduce((sum, ticket) => sum + ticket.quantity_available, 0);
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

              {/* External Ticket Link */}
              {event.ticket_link && (
                <a
                  href={event.ticket_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent-500/10 border border-accent-500/30 hover:bg-accent-500/20 transition-colors text-sm font-medium text-accent-400 hover:text-accent-300"
                >
                  <i className="ri-ticket-line" />
                  Buy Tickets on External Link
                  <i className="ri-external-link-line text-xs" />
                </a>
              )}

              {tickets.length === 0 ? (
                <p className="text-sm text-foreground-500">No tickets available for this event.</p>
              ) : (
                tickets.map((ticket) => {
                  const remaining = ticket.quantity_available - ticket.quantity_sold;
                  const isSoldOut = remaining <= 0;
                  
                  return (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-md border transition-all ${
                        isUpcoming && !isSoldOut ? 'cursor-pointer' : ''
                      } ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-primary-500/10 border-primary-500/40'
                          : 'bg-background-200/50 border-transparent hover:border-background-300/50'
                      }`}
                      onClick={() => {
                        if (isUpcoming && !isSoldOut) {
                          setSelectedTicket(ticket);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground-100">{ticket.name}</p>
                        </div>
                        <p className="text-sm font-heading font-bold text-primary-400 whitespace-nowrap">
                          KES {ticket.price.toLocaleString()}
                        </p>
                      </div>
                      {isUpcoming && (
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-foreground-500">{remaining} remaining</span>
                          {isSoldOut ? (
                            <span className="text-xs text-accent-400 font-medium">Sold out</span>
                          ) : selectedTicket?.id === ticket.id ? (
                            <span className="text-xs text-primary-400 font-medium">Selected</span>
                          ) : (
                            <span className="text-xs text-foreground-600">Click to select</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {isUpcoming && selectedTicket && (
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="w-full btn-primary py-3 text-sm"
                >
                  <i className="ri-secure-payment-line mr-1.5" />Continue to Payment
                </button>
              )}

              {isUpcoming && !selectedTicket && tickets.length > 0 && (
                <p className="text-xs text-foreground-500 text-center py-2">
                  Select a ticket above to continue
                </p>
              )}

              {!isUpcoming && (
                <p className="text-xs text-foreground-500 text-center py-2">
                  Tickets for this event are no longer available
                </p>
              )}

              <p className="text-[11px] text-foreground-600 text-center">
                <i className="ri-shield-check-line mr-1" />Payment powered by PayHero · M-Pesa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Purchase Modal */}
      {showTicketModal && selectedTicket && (
        <TicketPurchaseModal
          isOpen={showTicketModal}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTicket(null);
          }}
          ticket={selectedTicket}
          eventName={event.title}
          eventId={event.id}
        />
      )}
    </div>
  );
}
