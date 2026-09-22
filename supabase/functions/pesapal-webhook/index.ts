/**
 * Supabase Edge Function: pesapal-webhook
 *
 * Pesapal POSTs payment confirmations to this URL after payment completes.
 * Direct collection model: money goes to YOUR merchant account, not intermediary.
 *
 * Deploy:
 *   supabase functions deploy pesapal-webhook --no-verify-jwt
 *
 * Required secrets:
 *   SUPABASE_URL             — your project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (bypasses RLS)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

interface PesapalWebhookPayload {
  id: number
  code: string
  status: string // "COMPLETED", "FAILED", "PENDING"
  merchant_reference: string
  created_date: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  let body: PesapalWebhookPayload
  try {
    body = await req.json() as PesapalWebhookPayload
  } catch {
    console.error('[pesapal-webhook] Bad JSON')
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('[pesapal-webhook] Received:', JSON.stringify(body))

  const { merchant_reference: ticketId, status: paymentStatus } = body

  if (!ticketId) {
    console.warn('[pesapal-webhook] No merchant_reference — ignoring')
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Fetch ticket details
  const { data: ticket, error: fetchErr } = await supabase
    .from('tickets')
    .select(
      `
      id, 
      event_id, 
      quantity, 
      payment_status, 
      tier_name, 
      buyer_name, 
      buyer_email, 
      human_reference
    `
    )
    .eq('id', ticketId)
    .single()

  if (fetchErr || !ticket) {
    console.error('[pesapal-webhook] Ticket not found:', ticketId, fetchErr)
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Map Pesapal status to our status
  let finalStatus: string
  let dbPaymentStatus: string

  if (paymentStatus === 'COMPLETED') {
    finalStatus = 'ticket_issued'
    dbPaymentStatus = 'completed'
  } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
    finalStatus = 'failed'
    dbPaymentStatus = 'failed'
  } else if (paymentStatus === 'PENDING') {
    finalStatus = 'payment_queued'
    dbPaymentStatus = 'pending'
  } else {
    finalStatus = 'pending'
    dbPaymentStatus = 'pending'
  }

  // Idempotency: skip if already finalised
  if (
    ticket.payment_status === 'completed' ||
    ticket.payment_status === 'failed'
  ) {
    console.log('[pesapal-webhook] Already finalised, skipping:', ticket.id)
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Update the ticket record
  const updatePayload: Record<string, unknown> = {
    payment_status: dbPaymentStatus,
    status: finalStatus,
    pesapal_reference: body.code,
    pesapal_webhook_payload: body, // Store complete webhook for audit
    updated_at: new Date().toISOString(),
  }

  // On success, add timestamps
  if (paymentStatus === 'COMPLETED') {
    updatePayload.payment_completed_at = new Date().toISOString()
    updatePayload.ticket_issued_at = new Date().toISOString()
  }

  const { error: updateErr } = await supabase
    .from('tickets')
    .update(updatePayload)
    .eq('id', ticket.id)

  if (updateErr) {
    console.error('[pesapal-webhook] Update failed:', updateErr)
    return new Response(JSON.stringify({ error: 'DB update failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // On success — find the matching ticket_type and increment quantity_sold
  if (paymentStatus === 'COMPLETED') {
    const { data: ticketType } = await supabase
      .from('ticket_types')
      .select('id')
      .eq('event_id', ticket.event_id)
      .eq('name', ticket.tier_name)
      .maybeSingle()

    if (ticketType) {
      const { error: rpcErr } = await supabase.rpc('increment_tickets_sold', {
        p_ticket_type_id: ticketType.id,
        p_quantity: ticket.quantity,
      })
      if (rpcErr) console.error('[pesapal-webhook] increment_tickets_sold failed:', rpcErr)
    }

    // Trigger email sending
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-ticket-email`

      fetch(emailFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id }),
      }).catch(err => {
        console.warn('[pesapal-webhook] Email function call failed:', err)
      })
    } catch (err) {
      console.warn('[pesapal-webhook] Error triggering email:', err)
    }
  }

  console.log(`[pesapal-webhook] Ticket ${ticket.id} → ${dbPaymentStatus}`)
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
