import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '@/hooks/useSupabase';

interface TicketTier { name: string; price: number; description: string; capacity: number }
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
  tickets_sold: number;
  ticket_tiers: TicketTier[];
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      setEvent(data);
      setLoading(false);
    }
    fetchEvent();
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
  const totalSoldPct = Math.round((event.tickets_sold / event.capacity) * 100);
  const tiers: TicketTier[] = event.ticket_tiers ?? [];
  const selectedTierObj = tiers.find((t) => t.name === selectedTier);
  const tierSold = event.tickets_sold ?? 0;
  const totalPrice = selectedTierObj ? selectedTierObj.price * quantity : 0;

  function getTierRemaining(tier: TicketTier) {
    const eventCapacity = event?.capacity ?? 0;
    return Math.max(0, (tier.capacity || eventCapacity) - tierSold);
  }

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
                  <p>{event.tickets_sold}/{event.capacity} tickets sold</p>
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

              {tiers.length === 0 ? (
                <p className="text-sm text-foreground-500">No ticket tiers available.</p>
              ) : tiers.map((tier) => {
                const remaining = getTierRemaining(tier);
                return (
                  <div key={tier.name}
                    className={`p-3 rounded-md border transition-all ${isUpcoming ? 'cursor-pointer' : ''} ${
                      selectedTier === tier.name ? 'bg-primary-500/10 border-primary-500/40' : 'bg-background-200/50 border-transparent hover:border-background-300/50'}`}
                    onClick={() => { if (isUpcoming && remaining > 0) { setSelectedTier(tier.name); setQuantity(1); } }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground-100">{tier.name}</p>
                        {tier.description && <p className="text-xs text-foreground-500 mt-0.5">{tier.description}</p>}
                      </div>
                      <p className="text-sm font-heading font-bold text-primary-400 whitespace-nowrap">
                        KSh {Number(tier.price).toLocaleString()}
                      </p>
                    </div>
                    {isUpcoming && (
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-foreground-500">{remaining} remaining</span>
                        {remaining === 0 ? (
                          <span className="text-xs text-accent-400">Sold out</span>
                        ) : selectedTier === tier.name ? (
                          <span className="text-xs text-primary-400 font-medium">Selected</span>
                        ) : (
                          <span className="text-xs text-foreground-600">Click to select</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isUpcoming && selectedTierObj && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-300">Quantity</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-md bg-background-200 flex items-center justify-center text-foreground-300 hover:text-foreground-100 hover:bg-background-300 transition-colors">
                        <i className="ri-subtract-line" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-foreground-50">{quantity}</span>
                      <button onClick={() => setQuantity((q) => Math.min(getTierRemaining(selectedTierObj), q + 1))}
                        className="w-8 h-8 rounded-md bg-background-200 flex items-center justify-center text-foreground-300 hover:text-foreground-100 hover:bg-background-300 transition-colors">
                        <i className="ri-add-line" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-background-300/30">
                    <span className="text-sm text-foreground-300">Total</span>
                    <span className="text-lg font-heading font-bold text-primary-400">KSh {totalPrice.toLocaleString()}</span>
                  </div>
                  <button onClick={() => setShowModal(true)} className="w-full btn-primary py-3 text-sm">
                    <i className="ri-secure-payment-line mr-1.5" />Proceed to Checkout
                  </button>
                </div>
              )}

              {isUpcoming && !selectedTierObj && tiers.length > 0 && (
                <p className="text-xs text-foreground-500 text-center py-2">Select a ticket tier above to continue</p>
              )}

              {!isUpcoming && (
                <p className="text-xs text-foreground-500 text-center py-2">Tickets for this event are no longer available</p>
              )}

              <p className="text-[11px] text-foreground-600 text-center">Payment powered by TribeDala. Secure checkout.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showModal && selectedTierObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-background-100 rounded-lg max-w-md w-full p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-foreground-50">Checkout</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-background-200 flex items-center justify-center text-foreground-400 hover:text-foreground-200">
                <i className="ri-close-line" />
              </button>
            </div>

            <div className="p-4 rounded-md bg-background-200/50 space-y-3">
              <div className="flex items-start gap-3">
                {event.cover_image && <img src={event.cover_image} alt={event.title} className="w-16 h-16 rounded-md object-cover" />}
                <div>
                  <p className="text-sm font-medium text-foreground-100">{event.title}</p>
                  <p className="text-xs text-foreground-500">{event.date}{event.time ? ` · ${event.time}` : ''}</p>
                  <p className="text-xs text-foreground-500">{event.venue}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-background-300/30 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-400">{selectedTierObj.name} x {quantity}</span>
                  <span className="text-foreground-200 font-medium">KSh {(selectedTierObj.price * quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-400">Service fee (5%)</span>
                  <span className="text-foreground-200 font-medium">KSh {Math.round(selectedTierObj.price * quantity * 0.05).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-heading font-bold pt-2 border-t border-background-300/30">
                  <span className="text-foreground-50">Total</span>
                  <span className="text-primary-400">KSh {Math.round(totalPrice * 1.05).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="checkout-name" className="block text-xs font-medium text-foreground-300 mb-1.5">Full Name</label>
                <input id="checkout-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2.5 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors" />
              </div>
              <div>
                <label htmlFor="checkout-phone" className="block text-xs font-medium text-foreground-300 mb-1.5">Phone Number</label>
                <input id="checkout-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full px-3 py-2.5 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors" />
              </div>
            </div>

            <button onClick={() => { setShowModal(false); setSelectedTier(null); setQuantity(1); setName(''); setPhone(''); }}
              className="w-full btn-primary py-3 text-sm">
              <i className="ri-secure-payment-line mr-1.5" />Complete Payment (Mock)
            </button>
            <p className="text-[11px] text-foreground-600 text-center">
              Payment integration coming soon. M-Pesa and card payments will be available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
