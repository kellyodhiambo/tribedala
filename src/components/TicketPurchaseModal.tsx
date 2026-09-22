import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';
import { generateTicketReference } from '@/lib/payhero';
import { initiateOrder } from '@/lib/pesapal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  description?: string;
}

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  eventName: string;
  eventId: string;
}

type Step = 'form' | 'waiting' | 'success' | 'failed';

export default function TicketPurchaseModal({
  isOpen,
  onClose,
  ticket,
  eventName,
  eventId: _eventId,
}: TicketPurchaseModalProps) {
  const { user } = useAuth();

  const [buyerName, setBuyerName] = useState(user?.user_metadata?.full_name ?? '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const orderId = useRef<string | null>(null);
  const payheroRef = useRef<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const ticketsRemaining = ticket.quantity_available - ticket.quantity_sold;
  const maxQuantity = Math.min(5, ticketsRemaining);
  const totalAmount = ticket.price * quantity;

  useEffect(() => {
    return () => stopPolling();
  }, []);

  if (!isOpen) return null;

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  function handleClose() {
    stopPolling();
    onClose();
    setTimeout(() => {
      setStep('form');
      setError('');
      setSubmitting(false);
      orderId.current = null;
      payheroRef.current = null;
    }, 300);
  }

  function handleRetry() {
    setStep('form');
    setError('');
    orderId.current = null;
    payheroRef.current = null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (quantity < 1 || quantity > maxQuantity) {
      setError(`Please select between 1 and ${maxQuantity} tickets.`);
      return;
    }

    setSubmitting(true);

    try {
      const ticketRef = generateTicketReference();

      const { data: orderData, error: orderErr } = await supabase
        .from('tickets')
        .insert({
          event_id: _eventId,
          user_id: user?.id ?? null,
          tier_name: ticket.name,
          ticket_name: ticket.name,
          price: ticket.price,
          quantity,
          total_amount: totalAmount,
          buyer_name: buyerName.trim(),
          buyer_email: buyerEmail.trim(),
          buyer_phone: buyerPhone.trim(),
          payment_status: 'pending',
          payment_method: 'pesapal',
          status: 'pending',
          payment_reference: ticketRef,
          human_reference: ticketRef,
        })
        .select()
        .single();

      if (orderErr || !orderData) {
        setError('Failed to create order: ' + (orderErr?.message ?? 'Unknown error'));
        setSubmitting(false);
        return;
      }

      orderId.current = orderData.id;

      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
      const callbackUrl = `${supabaseUrl}/functions/v1/pesapal-webhook`;
      const redirectUrl = `${window.location.origin}/events/${_eventId}?payment=success`;

      const result = await initiateOrder({
        orderId: orderData.id,
        amount: totalAmount,
        customerName: buyerName.trim(),
        customerEmail: buyerEmail.trim(),
        customerPhone: buyerPhone.trim(),
        eventName: eventName,
        redirectUrl,
        callbackUrl,
      });

      if (!result.success || !result.redirectUrl) {
        await supabase
          .from('tickets')
          .update({ payment_status: 'failed', status: 'failed' })
          .eq('id', orderData.id);
        setError(result.error ?? 'Failed to initiate payment. Please try again.');
        setSubmitting(false);
        return;
      }

      payheroRef.current = result.orderTrackingId || orderData.id;
      await supabase
        .from('tickets')
        .update({
          pesapal_reference: result.orderTrackingId,
          payment_queued_at: new Date().toISOString(),
        })
        .eq('id', orderData.id);

      setSubmitting(false);
      window.location.href = result.redirectUrl;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 overflow-hidden">
      <div className="bg-background-100 rounded-t-xl md:rounded-xl border border-background-300/40 w-full md:max-w-md max-h-[95vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between p-5 border-b border-background-300/30 flex-shrink-0">
          <div>
            <h2 className="font-heading font-semibold text-foreground-50">
              {step === 'success' ? 'Payment Confirmed!' : step === 'failed' ? 'Payment Failed' : 'Buy Tickets'}
            </h2>
            <p className="text-xs text-foreground-500 mt-0.5">{eventName}</p>
          </div>
          <button onClick={handleClose} className="text-foreground-500 hover:text-foreground-200">
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 rounded-md bg-accent-500/10 border border-accent-500/30 text-sm text-accent-400 flex items-start gap-2">
                  <i className="ri-error-warning-line mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-4 rounded-lg bg-background-200 border border-background-300/60">
                <p className="text-sm font-medium text-foreground-50">{ticket.name}</p>
                <p className="text-2xl font-heading font-bold text-primary-500 mt-2">
                  KES {ticket.price.toLocaleString()}
                </p>
                <p className="text-xs text-foreground-600 mt-1">
                  {ticketsRemaining > 0 ? `${ticketsRemaining} tickets available` : 'Sold out'}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground-400 mb-1.5">Full Name *</label>
                  <input
                    type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                    required placeholder="John Doe"
                    className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-400 mb-1.5">Email *</label>
                  <input
                    type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)}
                    required placeholder="you@email.com"
                    className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-400 mb-1.5">M-Pesa Phone *</label>
                  <input
                    type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)}
                    required placeholder="07XX XXX XXX or 254 7XX XXX XXX"
                    className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-400 mb-1.5">Quantity *</label>
                  <select
                    value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                  >
                    {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'ticket' : 'tickets'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-300">Total Amount</span>
                  <span className="text-2xl font-heading font-bold text-primary-500">
                    KES {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-background-300/30 flex-shrink-0">
              <button
                type="button" onClick={handleClose}
                className="flex-1 py-2 rounded-md text-sm border border-background-300/60 text-foreground-400 hover:text-foreground-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || ticketsRemaining <= 0}
                className="flex-1 btn-primary text-sm py-2"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-background-50 border-t-transparent rounded-full animate-spin" />
                    Sending prompt…
                  </span>
                ) : ticketsRemaining <= 0 ? 'Sold Out' : (
                  <><i className="ri-secure-payment-line mr-1.5" />Pay with Pesapal</>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-4xl text-primary-400" />
            </div>
            <div className="space-y-2">
              <p className="font-heading font-semibold text-foreground-50">Payment Successful!</p>
              <p className="text-sm text-foreground-400 leading-relaxed max-w-xs">
                Your ticket for <span className="text-foreground-200 font-medium">{eventName}</span> has been confirmed.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/30 text-left w-full max-w-xs space-y-1">
              <p className="text-xs text-foreground-500">Confirmed</p>
              <p className="text-sm font-medium text-foreground-100">{ticket.name} × {quantity}</p>
              <p className="text-lg font-heading font-bold text-primary-500">KES {totalAmount.toLocaleString()}</p>
            </div>
            <button onClick={handleClose} className="w-full btn-primary py-3 text-sm">
              <i className="ri-check-line mr-1.5" />Done
            </button>
          </div>
        )}

        {step === 'failed' && (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center">
              <i className="ri-close-circle-fill text-4xl text-accent-400" />
            </div>
            <div className="space-y-2">
              <p className="font-heading font-semibold text-foreground-50">Payment Failed</p>
              <p className="text-sm text-foreground-400 leading-relaxed max-w-xs">
                {error || 'The payment was not completed. Please try again.'}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={handleClose} className="flex-1 py-2.5 rounded-md text-sm border border-background-300/60 text-foreground-400">
                Close
              </button>
              <button onClick={handleRetry} className="flex-1 btn-primary py-2.5 text-sm">
                <i className="ri-restart-line mr-1.5" />Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
