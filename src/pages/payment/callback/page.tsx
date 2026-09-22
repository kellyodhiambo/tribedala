/**
 * Payment Callback Page
 * 
 * After customer completes payment on Pesapal, they're redirected here.
 * This page verifies payment status and shows success/failure message.
 */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import supabase from '@/hooks/useSupabase';
import { getPaymentStatus } from '@/lib/pesapal';

interface PaymentResult {
  success: boolean;
  message: string;
  ticketRef?: string;
  eventName?: string;
  buyerEmail?: string;
}

export default function PaymentCallbackPage() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyPayment();
  }, [searchParams]);

  async function verifyPayment() {
    try {
      // Get order ID and tracking ID from URL params
      // Pesapal redirects to: redirect_url?OrderTrackingId=...
      const orderTrackingId = searchParams.get('OrderTrackingId');

      if (!orderTrackingId) {
        setResult({
          success: false,
          message: 'Invalid payment callback - missing order tracking ID',
        });
        setLoading(false);
        return;
      }

      // Check payment status with Pesapal
      const statusResult = await getPaymentStatus(orderTrackingId);

      if (!statusResult.success || !statusResult.data) {
        setResult({
          success: false,
          message: 'Failed to check payment status. Please contact support.',
        });
        setLoading(false);
        return;
      }

      const { data: paymentData } = statusResult;
      const merchantRef = paymentData.merchant_reference;

      // Fetch ticket details from database
      const { data: ticket } = await supabase
        .from('tickets')
        .select('id, human_reference, buyer_email, tier_name, quantity, event_id, events:event_id(title)')
        .eq('id', merchantRef)
        .single();

      if (!ticket) {
        setResult({
          success: false,
          message: 'Ticket not found in our system',
        });
        setLoading(false);
        return;
      }

      const getEventTitle = () => {
        if (!ticket.events) return 'Your Event';
        if (Array.isArray(ticket.events)) {
          return ticket.events[0]?.title ?? 'Your Event';
        }
        return (ticket.events as Record<string, unknown>).title ?? 'Your Event';
      };

      const eventTitle = getEventTitle();
      const isCompleted = paymentData.payment_status_code === 'COMPLETED';

      if (isCompleted) {
        // Payment successful - ticket should already be updated by webhook
        setResult({
          success: true,
          message: `Payment successful! Your ticket for ${eventTitle} has been confirmed.`,
          ticketRef: ticket.human_reference,
          eventName: eventTitle,
          buyerEmail: ticket.buyer_email,
        });
      } else if (paymentData.payment_status_code === 'PENDING') {
        setResult({
          success: false,
          message: 'Payment is still pending. Please check your M-Pesa to confirm the transaction.',
        });
      } else {
        setResult({
          success: false,
          message: `Payment ${paymentData.payment_status_code}: ${
            paymentData.error_message || 'Please try again or contact support'
          }`,
        });
      }
    } catch (err) {
      console.error('[PaymentCallback] Error:', err);
      setResult({
        success: false,
        message: 'An error occurred while verifying your payment. Please contact support.',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-heading font-semibold text-foreground-50 mb-2">
            Verifying Payment
          </h2>
          <p className="text-sm text-foreground-400">
            Please wait while we confirm your transaction...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-4xl text-accent-400" />
          </div>
          <h2 className="text-xl font-heading font-semibold text-foreground-50 mb-2">
            Error
          </h2>
          <p className="text-sm text-foreground-400">
            Could not process your payment. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {result.success ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto">
              <i className="ri-checkbox-circle-fill text-4xl text-primary-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-semibold text-foreground-50">
                Payment Confirmed!
              </h2>
              <p className="text-sm text-foreground-400">
                {result.message}
              </p>
            </div>

            {result.ticketRef && (
              <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30 text-left space-y-3">
                <div>
                  <p className="text-xs text-foreground-500 font-medium">Ticket Reference</p>
                  <p className="text-lg font-heading font-bold text-primary-500 font-mono mt-1">
                    {result.ticketRef}
                  </p>
                </div>
                {result.buyerEmail && (
                  <div className="pt-3 border-t border-primary-500/20">
                    <p className="text-xs text-foreground-500">Confirmation email sent to:</p>
                    <p className="text-sm text-foreground-200 mt-1">{result.buyerEmail}</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => window.location.href = '/'}
              className="w-full btn-primary py-3 text-sm"
            >
              <i className="ri-home-line mr-2" />
              Back to Home
            </button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto">
              <i className="ri-close-circle-fill text-4xl text-accent-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-semibold text-foreground-50">
                Payment Failed
              </h2>
              <p className="text-sm text-foreground-400">
                {result.message}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = eventId ? `/events/${eventId}` : '/events'}
                className="w-full btn-primary py-3 text-sm"
              >
                <i className="ri-arrow-left-line mr-2" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 rounded-md text-sm border border-background-300/60 text-foreground-400 hover:text-foreground-200"
              >
                <i className="ri-home-line mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
