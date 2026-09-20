/**
 * Supabase Edge Function: payhero-webhook
 *
 * PayHero POSTs payment results to this URL after an M-Pesa STK push.
 * It updates the 'tickets' table (purchase records) and increments
 * quantity_sold on 'ticket_types' (the catalog table).
 *
 * Deploy:
 *   supabase functions deploy payhero-webhook --no-verify-jwt
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

interface PayHeroCallbackResponse {
  Amount: number
  CheckoutRequestID: string
  ExternalReference: string  // our tickets.id (purchase record UUID)
  MerchantRequestID: string
  MpesaReceiptNumber: string
  Phone: string
  ResultCode: number          // 0 = success
  ResultDesc: string
  Status: string
}

interface PayHeroCallback {
  forward_url: string
  status: string              // "Success" | "Failed"
  response: PayHeroCallbackResponse
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  let body: PayHeroCallback
  try {
    body = await req.json() as PayHeroCallback
  } catch {
    console.error('[webhook] Bad JSON')
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('[webhook] Received:', JSON.stringify(body))

  const r = body.response
  if (!r?.ExternalReference) {
    console.warn('[webhook] No ExternalReference — ignoring')
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const isSuccess    = r.ResultCode === 0
  const paymentStatus = isSuccess ? 'completed' : 'failed'

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ExternalReference = tickets.id (the purchase row we inserted on STK initiation)
  const { data: purchase, error: fetchErr } = await supabase
    .from('tickets')
    .select('id, event_id, quantity, payment_status, tier_name')
    .eq('id', r.ExternalReference)
    .single()

  if (fetchErr || !purchase) {
    console.error('[webhook] Purchase record not found:', r.ExternalReference, fetchErr)
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Idempotency: skip if already finalised
  if (purchase.payment_status === 'completed' || purchase.payment_status === 'failed') {
    console.log('[webhook] Already finalised, skipping:', purchase.id)
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Update the purchase record
  const { error: updateErr } = await supabase
    .from('tickets')
    .update({
      payment_status:   paymentStatus,
      status:           isSuccess ? 'paid' : 'failed',
      payhero_receipt:  r.MpesaReceiptNumber ?? null,
      payhero_result_desc: r.ResultDesc ?? null,
      payhero_result_code: r.ResultCode,
      updated_at:       new Date().toISOString(),
    })
    .eq('id', purchase.id)

  if (updateErr) {
    console.error('[webhook] Update failed:', updateErr)
    return new Response(JSON.stringify({ error: 'DB update failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // On success — find the matching ticket_type and increment quantity_sold
  if (isSuccess) {
    const { data: ticketType } = await supabase
      .from('ticket_types')
      .select('id')
      .eq('event_id', purchase.event_id)
      .eq('name', purchase.tier_name)
      .maybeSingle()

    if (ticketType) {
      const { error: rpcErr } = await supabase.rpc('increment_tickets_sold', {
        p_ticket_type_id: ticketType.id,
        p_quantity: purchase.quantity,
      })
      if (rpcErr) console.error('[webhook] increment_tickets_sold failed:', rpcErr)
    } else {
      // ticket_types row missing — do a direct update as fallback (best effort)
      console.warn('[webhook] No ticket_type found for tier:', purchase.tier_name)
    }
  }

  console.log(`[webhook] Purchase ${purchase.id} → ${paymentStatus}`)
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
