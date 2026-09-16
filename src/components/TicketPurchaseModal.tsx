import { useState } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';
import { getIntaSendInstance } from '@/lib/intasend';

interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
}

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  eventName: string;
  eventId: string;
  onSuccess?: () => void;
}

export default function TicketPurchaseModal({
  isOpen,
  onClose,
  ticket,
  eventName,
  eventId,
}: TicketPurchaseModalProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState(user?.user_metadata?.full_name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalAmount = ticket.price * quantity;
  const ticketsRemaining = ticket.quantity_available - ticket.quantity_sold;
  const maxQuantity = Math.min(5, ticketsRemaining); // Max 5 tickets per purchase

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validate inputs
      if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
        setError('Please fill in all fields');
        setSubmitting(false);
        return;
      }

      if (quantity < 1 || quantity > maxQuantity) {
        setError(`Please select between 1 and ${maxQuantity} tickets`);
        setSubmitting(false);
        return;
      }

      // Create order in database first
      const { data: orderData, error: orderError } = await supabase
        .from('ticket_orders')
        .insert({
          ticket_id: ticket.id,
          user_id: user?.id || null,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
          quantity,
          total_amount: totalAmount,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        setError('Failed to create order: ' + orderError.message);
        setSubmitting(false);
        return;
      }

      // Initialize IntaSend payment
      const intasend = getIntaSendInstance();
      const [firstName, ...lastNameParts] = buyerName.split(' ');
      const lastName = lastNameParts.join(' ') || 'Customer';

      const redirectUrl = `${window.location.origin}/events/${eventId}?payment_status=completed`;
      const callbackUrl = `${window.location.origin}/api/webhooks/intasend`;

      const paymentResponse = await intasend.initiatePayment({
        first_name: firstName,
        last_name: lastName,
        email: buyerEmail,
        phone_number: buyerPhone,
        amount: totalAmount,
        currency: 'KES',
        api_ref: orderData.id,
        redirect_url: redirectUrl,
        callback_url: callbackUrl,
        metadata: {
          event_id: eventId,
          event_name: eventName,
          ticket_id: ticket.id,
          ticket_name: ticket.name,
          quantity,
          order_id: orderData.id,
        },
      });

      if (paymentResponse.status === 'error' || !paymentResponse.payment_url) {
        setError(paymentResponse.error || 'Failed to initiate payment');
        setSubmitting(false);
        return;
      }

      // Store IntaSend request ID in the order
      await supabase
        .from('ticket_orders')
        .update({ intasend_request_id: paymentResponse.request_id })
        .eq('id', orderData.id);

      // Redirect to IntaSend payment page
      window.location.href = paymentResponse.payment_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 overflow-hidden">
      <div className="bg-background-100 rounded-t-xl md:rounded-xl border border-background-300/40 w-full md:max-w-md max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-background-300/30 flex-shrink-0">
          <div>
            <h2 className="font-heading font-semibold text-foreground-50">Buy Tickets</h2>
            <p className="text-xs text-foreground-500 mt-0.5">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground-500 hover:text-foreground-200"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-md bg-accent-500/10 border border-accent-500/30 text-sm text-accent-400 flex items-start gap-2">
              <i className="ri-error-warning-line mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Ticket Info */}
          <div className="p-4 rounded-lg bg-background-200 border border-background-300/60">
            <p className="text-sm font-medium text-foreground-50">{ticket.name}</p>
            <p className="text-2xl font-heading font-bold text-primary-500 mt-2">
              KES {ticket.price.toLocaleString()}
            </p>
            <p className="text-xs text-foreground-600 mt-1">
              {ticketsRemaining > 0 ? `${ticketsRemaining} tickets available` : 'Sold out'}
            </p>
          </div>

          {/* Buyer Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground-400 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-400 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                required
                placeholder="you@email.com"
                className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-400 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                required
                placeholder="+254 7XX XXX XXX"
                className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-400 mb-1.5">
                Quantity *
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
              >
                {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'ticket' : 'tickets'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Total */}
          <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-300">Total Amount</span>
              <span className="text-2xl font-heading font-bold text-primary-500">
                KES {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-background-300/30 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-md text-sm border border-background-300/60 text-foreground-400 hover:text-foreground-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || ticketsRemaining <= 0}
            className="flex-1 btn-primary text-sm py-2"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-background-50 border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : ticketsRemaining <= 0 ? (
              'Sold Out'
            ) : (
              'Continue to Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
