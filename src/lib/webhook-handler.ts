/**
 * IntaSend Webhook Handler
 * Processes payment confirmations from IntaSend
 * 
 * This is a server-side handler for processing webhook callbacks.
 * Use this in your backend/serverless function (Supabase Edge Functions, Vercel, etc.)
 */

import { createClient } from '@supabase/supabase-js';

interface IntaSendWebhookPayload {
  request_id: string;
  transaction_id: string;
  status: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

interface WebhookHandlerOptions {
  supabaseUrl: string;
  supabaseServiceKey: string;
}

export async function handleIntaSendWebhook(
  payload: IntaSendWebhookPayload,
  options: WebhookHandlerOptions
) {
  console.log('[Webhook] Processing IntaSend payment callback:', payload);

  // Validate payload
  if (!payload.request_id || !payload.status) {
    throw new Error('Invalid webhook payload: missing request_id or status');
  }

  const { supabaseUrl, supabaseServiceKey } = options;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Map IntaSend status to our status
    const orderStatus = 
      payload.status === 'complete' ? 'completed' :
      payload.status === 'failed' ? 'failed' :
      payload.status === 'pending' ? 'pending' :
      'pending';

    console.log(`[Webhook] Mapped status: ${payload.status} → ${orderStatus}`);

    // Update ticket order with payment info
    const { data: orderData, error: orderError } = await supabase
      .from('ticket_orders')
      .update({
        payment_status: orderStatus,
        intasend_transaction_id: payload.transaction_id,
      })
      .eq('intasend_request_id', payload.request_id)
      .select()
      .single();

    if (orderError) {
      console.error('[Webhook] Error updating ticket order:', orderError);
      throw orderError;
    }

    console.log('[Webhook] Updated ticket order:', orderData);

    // If payment is completed, update ticket quantities
    if (orderStatus === 'completed' && orderData?.ticket_id) {
      console.log('[Webhook] Payment completed, updating ticket quantities');

      // Get the ticket to update quantity_sold
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('quantity_sold')
        .eq('id', orderData.ticket_id)
        .single();

      if (ticketError) {
        console.error('[Webhook] Error fetching ticket:', ticketError);
        throw ticketError;
      }

      const newQuantitySold = (ticketData?.quantity_sold || 0) + (orderData?.quantity || 1);

      const { error: updateError } = await supabase
        .from('tickets')
        .update({ quantity_sold: newQuantitySold })
        .eq('id', orderData.ticket_id);

      if (updateError) {
        console.error('[Webhook] Error updating ticket quantity:', updateError);
        throw updateError;
      }

      console.log(`[Webhook] Updated ticket quantity_sold to ${newQuantitySold}`);

      // TODO: Send confirmation email to buyer
      // TODO: Generate ticket PDF/QR code
      // TODO: Create audit log
    }

    // If payment failed, you might want to notify the user
    if (orderStatus === 'failed') {
      console.log('[Webhook] Payment failed for order:', orderData?.id);
      // TODO: Send failure notification email
    }

    return {
      success: true,
      request_id: payload.request_id,
      order_id: orderData?.id,
      status: orderStatus,
      message: 'Webhook processed successfully',
    };
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    throw error;
  }
}

export default handleIntaSendWebhook;
