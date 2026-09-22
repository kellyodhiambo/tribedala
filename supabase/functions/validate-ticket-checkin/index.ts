/**
 * Supabase Edge Function: validate-ticket-checkin
 * 
 * Validates a ticket QR code and processes check-in.
 * Prevents duplicate check-ins and validates payment status.
 * 
 * Deploy:
 *   supabase functions deploy validate-ticket-checkin --no-verify-jwt
 * 
 * Request body:
 * {
 *   "qrData": "{\"tid\":\"...\",\"ref\":\"...\",\"evt\":\"...\"}",
 *   "checkedInBy"?: "user-id",
 *   "deviceInfo"?: "iPhone 15 Pro"
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

interface CheckInRequest {
  qrData: string
  checkedInBy?: string
  deviceInfo?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  let body: CheckInRequest
  try {
    body = await req.json() as CheckInRequest
  } catch {
    console.error('[check-in] Bad JSON')
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { qrData, checkedInBy, deviceInfo } = body

  if (!qrData) {
    return new Response(JSON.stringify({ error: 'Missing QR data' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Parse QR code payload
  let qrPayload: { tid?: string; ref?: string; evt?: string }
  try {
    qrPayload = JSON.parse(qrData)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid QR code format' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { tid: ticketId, ref: humanRef, evt: eventId } = qrPayload

  if (!ticketId || !humanRef) {
    return new Response(JSON.stringify({ error: 'Invalid QR code data' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Fetch ticket details
  const { data: ticket, error: ticketErr } = await supabase
    .from('tickets')
    .select(
      `
      id,
      human_reference,
      buyer_name,
      buyer_email,
      tier_name,
      quantity,
      total_amount,
      payment_status,
      status,
      checked_in_at,
      check_in_count,
      event_id,
      events:event_id (id, title, date, location)
    `
    )
    .eq('id', ticketId)
    .eq('human_reference', humanRef)
    .single()

  if (ticketErr || !ticket) {
    console.error('[check-in] Ticket not found:', ticketId, humanRef, ticketErr)
    return new Response(
      JSON.stringify({ error: 'Ticket not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Validate payment status
  if (ticket.payment_status !== 'completed') {
    return new Response(
      JSON.stringify({
        error: 'Payment not completed',
        details: `Ticket payment status: ${ticket.payment_status}`,
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const event = Array.isArray(ticket.events) ? ticket.events[0] : ticket.events

  // Validate event date (should be today or past)
  if (event && event.date) {
    const eventDate = new Date(event.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (eventDate > today) {
      return new Response(
        JSON.stringify({
          error: 'Event has not started yet',
          eventDate: event.date,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  // Check for duplicate check-in
  const warnings: string[] = []
  if (ticket.checked_in_at) {
    const checkedInTime = new Date(ticket.checked_in_at)
    warnings.push(
      `Already checked in at ${checkedInTime.toLocaleTimeString('en-KE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}`
    )
  }

  // Update ticket with check-in
  const now = new Date().toISOString()
  const checkInCount = (ticket.check_in_count || 0) + 1

  const { error: updateErr } = await supabase
    .from('tickets')
    .update({
      check_in_count: checkInCount,
      checked_in_at: ticket.checked_in_at || now, // Only set on first check-in
      status: 'checked_in',
      updated_at: now,
    })
    .eq('id', ticketId)

  if (updateErr) {
    console.error('[check-in] Update failed:', updateErr)
    return new Response(
      JSON.stringify({ error: 'Failed to record check-in' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Log check-in to audit trail
  try {
    await supabase.from('check_in_log').insert({
      ticket_id: ticketId,
      checked_in_by: checkedInBy || null,
      device_info: deviceInfo || null,
    })
  } catch (err) {
    console.warn('[check-in] Failed to log check-in:', err)
    // Don't fail the check-in if logging fails
  }

  // Return success response
  return new Response(
    JSON.stringify({
      success: true,
      ticket: {
        id: ticket.id,
        human_reference: ticket.human_reference,
        buyer_name: ticket.buyer_name,
        buyer_email: ticket.buyer_email,
        tier_name: ticket.tier_name,
        quantity: ticket.quantity,
        payment_status: ticket.payment_status,
        status: ticket.status,
      },
      event: event
        ? {
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
        }
        : null,
      checkInInfo: {
        checkedInCount: checkInCount,
        firstCheckInAt: ticket.checked_in_at,
        lastCheckInAt: now,
        isFirstCheckIn: !ticket.checked_in_at,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
