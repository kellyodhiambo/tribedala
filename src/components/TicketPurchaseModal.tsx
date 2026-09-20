import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';
import { getPayHeroInstance } from '@/lib/payhero';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ticket {
  id: string;          // ticket_types.id
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
  onSuccess?: () => void;
}

// ─── Step enum ────────────────────────────────────────────────────────────────

type Step = 'form' | 'waiting' | 'success' | 'failed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Polling interval in ms */
const POLL_INTERVAL = 4_000;
/** Give up after 2.5 minutes — user can always tap "Check status" */
const POLL_TIMEOUT_MS = 150_000;

// ─── Component ───────────────────────────────────────────────────────────────

export default function TicketPurchaseModal({
  isOpen,
  onClose,
  ticket,
  eventName,
  eventId: _eventId,
  onSuccess,
}: TicketPurchaseModalProps) {
  const { user } = useAuth();

  // Form fields
  const [buyerName, setBuyerName] = useState(user?.user_metadata?.full_name ?? '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [quantity, setQuantity] = useState(1);

  // UI state
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Refs for polling
  const orderId = useRef<string | null>(null);
  const payheroRef = useRef<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStart = useRef<number>(0);

  const ticketsRemaining = ticket.quantity_available - ticket.quantity_sold;
  const maxQuantity = Math.min(5, ticketsRemaining);
  const totalAmount = ticket.price * quantity;

  // Clean up polling on unmount / close
  useEffect(() => {
    return () => stopPolling();
  }, []);

  if (!isOpen) return null;

  // ── Polling helpers ────────────────────────────────────────────────────────

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  async function pollStatus() {
    if (!orderId.current || !payheroRef.current) return;

    // Timeout guard
    if (Date.now() - pollStart.current > POLL_TIMEOUT_MS) {
      stopPolling();
      setError(
        'Payment confirmation is taking longer than expected. ' +
        'If you completed the M-Pesa prompt, tap "Check status" below.',
      );
      return;
    }

    try {
      const payhero = getPayHeroInstance();
      const statusRes = await payhero.getStatus(payheroRef.current);

      if (!statusRes.success) return; // transient error — keep polling

      const s = statusRes.status?.toUpperCase();

      if (s === 'SUCCESS') {
        stopPolling();
        // Update DB (webhook may have already done this — upsert is idempotent)
        await supabase
          .from('tickets')
          .update({ payment_status: 'completed', status: 'paid', payhero_receipt: statusRes.provider_reference ?? null })
          .eq('id', orderId.current);
        setStep('success');
        onSuccess?.();
      } else if (s === 'FAILED') {
        stopPolling();
        await supabase
          .from('tickets')
          .update({ payment_status: 'failed', status: 'failed' })
          .eq('id', orderId.current);
        setStep('failed');
        setError('Payment was declined or cancelled. Please try again.');
      }
      // QUEUED / PENDING → keep polling
    } catch (err) {
      console.error('[poll] Error checking status:', err);
    }
  }

  async function handleManualCheck() {
    if (!orderId.current || !payheroRef.current) return;
    setError('');
    try {
      const payhero = getPayHeroInstance();
      const statusRes = await payhero.getStatus(payheroRef.current);
      const s = statusRes.status?.toUpperCase();
      if (s === 'SUCCESS') {
        stopPolling();
        await supabase
          .from('tickets')
          .update({ payment_status: 'completed', status: 'paid', payhero_receipt: statusRes.provider_reference ?? null })
          .eq('id', orderId.current);
        setStep('success');
        onSuccess?.();
      } else if (s === 'FAILED') {
        stopPolling();
        setStep('failed');
        setError('Payment was declined or cancelled. Please try again.');
      } else {
        setError('Payment still pending — check that you completed the M-Pesa PIN prompt.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status check failed');
    }
  }

  // ── Form submit ───────────────────────────────────────────────────────────

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
      // 1. Create a pending purchase record in the tickets table
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
          payment_method: 'mpesa',
          status: 'pending',
        })
        .select()
        .single();

      if (orderErr || !orderData) {
        setError('Failed to create order: ' + (orderErr?.message ?? 'Unknown error'));
        setSubmitting(false);
        return;
      }

      orderId.current = orderData.id;

      // 2. Determine the webhook URL (Supabase Edge Function)
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
      const callbackUrl = `${supabaseUrl}/functions/v1/payhero-webhook`;

      // 3. Initiate STK push via PayHero
      const payhero = getPayHeroInstance();
      const stkRes = await payhero.initiateStk({
        phone_number: buyerPhone.trim(),
        amount: totalAmount,
        external_reference: orderData.id,
        customer_name: buyerName.trim(),
        callback_url: callbackUrl,
      });

      if (!stkRes.success || !stkRes.reference) {
        // Mark order as failed and surface error
        await supabase
          .from('tickets')
          .update({ payment_status: 'failed', status: 'failed' })
          .eq('id', orderData.id);
        setError(stkRes.error ?? 'Failed to send M-Pesa prompt. Check your phone number and try again.');
        setSubmitting(false);
        return;
      }

      // 4. Save PayHero reference in the record for status polling
      payheroRef.current = stkRes.reference;
      await supabase
        .from('tickets')
        .update({
          payhero_reference: stkRes.reference,
          payhero_checkout_request: stkRes.CheckoutRequestID ?? null,
          payment_reference: stkRes.reference,
        })
        .eq('id', orderData.id);

      // 5. Show waiting screen and start polling
      setSubmitting(false);
      setStep('waiting');
      pollStart.current = Date.now();
      pollTimer.current = setInterval(pollStatus, POLL_INTERVAL);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setSubmitting(false);
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  function handleClose() {
    stopPolling();
    onClose();
    // Reset state after modal closes
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 overflow-hidden">
      <div className="bg-background-100 rounded-t-xl md:rounded-xl border border-background-300/40 w-full md:max-w-md max-h-[95vh] overflow-hidden flex flex-col">

        {/* ── Header ── */}
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

        {/* ── STEP: Form ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 rounded-md bg-accent-500/10 border border-accent-500/30 text-sm text-accent-400 flex items-start gap-2">
                  <i className="ri-error-warning-line mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Ticket summary */}
              <div className="p-4 rounded-lg bg-background-200 border border-background-300/60">
                <p className="text-sm font-medium text-foreground-50">{ticket.name}</p>
                <p className="text-2xl font-heading font-bold text-primary-500 mt-2">
                  KES {ticket.price.toLocaleString()}
                </p>
                <p className="text-xs text-foreground-600 mt-1">
                  {ticketsRemaining > 0 ? `${ticketsRemaining} tickets available` : 'Sold out'}
                </p>
              </div>

              {/* Buyer fields */}
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
                  <p className="text-[11px] text-foreground-600 mt-1">
                    You will receive an M-Pesa prompt on this number.
                  </p>
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

              {/* Total */}
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
                  <><i className="ri-secure-payment-line mr-1.5" />Pay with M-Pesa</>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP: Waiting for M-Pesa PIN ── */}
        {step === 'waiting' && (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center">
              <span className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="font-heading font-semibold text-foreground-50">Waiting for M-Pesa</p>
              <p className="text-sm text-foreground-400 leading-relaxed max-w-xs">
                An M-Pesa prompt has been sent to <span className="text-foreground-200 font-medium">{buyerPhone}</span>.
                Enter your PIN to complete the payment.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-background-200 border border-background-300/60 text-left w-full max-w-xs space-y-1">
              <p className="text-xs text-foreground-500">Order summary</p>
              <p className="text-sm font-medium text-foreground-100">{ticket.name} × {quantity}</p>
              <p className="text-lg font-heading font-bold text-primary-500">KES {totalAmount.toLocaleString()}</p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-accent-500/10 border border-accent-500/30 text-sm text-accent-400 text-left w-full">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleManualCheck}
                className="w-full py-2.5 rounded-md text-sm border border-background-300/60 text-foreground-300 hover:text-foreground-50 hover:border-background-200 transition-colors"
              >
                <i className="ri-refresh-line mr-1.5" />Check payment status
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2 text-xs text-foreground-600 hover:text-foreground-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Success ── */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-4xl text-primary-400" />
            </div>
            <div className="space-y-2">
              <p className="font-heading font-semibold text-foreground-50">Payment Successful!</p>
              <p className="text-sm text-foreground-400 leading-relaxed max-w-xs">
                Your ticket for <span className="text-foreground-200 font-medium">{eventName}</span> has been confirmed.
                Check your email at <span className="text-foreground-200 font-medium">{buyerEmail}</span> for your ticket details.
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

        {/* ── STEP: Failed ── */}
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

        {/* ── Footer branding ── */}
        {step === 'form' && (
          <p className="text-[11px] text-foreground-600 text-center pb-3">
            <i className="ri-shield-check-line mr-1" />Payment powered by PayHero · M-Pesa
          </p>
        )}
      </div>
    </div>
  );
}
