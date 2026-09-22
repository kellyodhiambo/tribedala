/**
 * Supabase Edge Function: payhero-webhook
 *
 * PayHero POSTs payment results to this URL after an M-Pesa STK push.
 * It:
 * - Updates the 'tickets' table (purchase records) with payment status
 * - Stores the complete callback payload for audit trail
 * - Increments quantity_sold on 'ticket_types' (the catalog table)
 * - Generates QR code for the ticket
 * - Marks ticket status as TICKET_ISSUED once payment is confirmed
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
    .select('id, event_id, quantity, payment_status, tier_name, buyer_name, buyer_email, human_reference')
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

  // Prepare QR code data
  let qrCodeData: string | null = null
  if (isSuccess) {
    try {
      const qrPayload = {
        tid: purchase.id,
        ref: purchase.human_reference,
        evt: purchase.event_id,
      }
      
      // Simple QR code generation: We'll store the data for the frontend to render
      // In production, you might generate this server-side or use a QR API
      qrCodeData = JSON.stringify(qrPayload)
      console.log('[webhook] Generated QR payload:', qrCodeData)
    } catch (err) {
      console.warn('[webhook] QR generation failed:', err)
      // Don't fail the entire webhook if QR generation fails
    }
  }

  // Update the purchase record
  const updatePayload: Record<string, unknown> = {
    payment_status:   paymentStatus,
    status:           isSuccess ? 'paid' : 'failed',
    payhero_receipt:  r.MpesaReceiptNumber ?? null,
    payhero_result_desc: r.ResultDesc ?? null,
    payhero_result_code: r.ResultCode,
    payhero_callback_payload: body,  // Store entire callback for audit trail
    updated_at:       new Date().toISOString(),
  }

  // On success, add ticket_issued status and timestamps
  if (isSuccess) {
    updatePayload.status = 'ticket_issued'  // Enhanced status lifecycle
    updatePayload.payment_completed_at = new Date().toISOString()
    updatePayload.ticket_issued_at = new Date().toISOString()
    if (qrCodeData) {
      updatePayload.qr_code_data = qrCodeData
    }
  }

  const { error: updateErr } = await supabase
    .from('tickets')
    .update(updatePayload)
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
  
  // On success, trigger email sending via the send-ticket-email function
  if (isSuccess) {
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-ticket-email`
      
      // Call the email function (fire-and-forget, non-blocking)
      fetch(emailFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: purchase.id }),
      }).catch(err => {
        console.warn('[webhook] Email function call failed:', err)
        // Don't fail the webhook if email fails
      })
    } catch (err) {
      console.warn('[webhook] Error triggering email:', err)
    }
  }
  
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
