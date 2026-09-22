/**
 * Supabase Edge Function: send-ticket-email
 * 
 * Called by the payhero-webhook after successful payment.
 * Sends ticket confirmation email to the buyer with QR code.
 * 
 * Deploy:
 *   supabase functions deploy send-ticket-email --no-verify-jwt
 * 
 * Required secrets:
 *   RESEND_API_KEY    — Your Resend API key (from https://resend.com)
 *   SUPABASE_URL      — Your project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

interface SendEmailRequest {
  ticketId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  let body: SendEmailRequest
  try {
    body = await req.json() as SendEmailRequest
  } catch {
    console.error('[send-email] Bad JSON')
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { ticketId } = body
  if (!ticketId) {
    return new Response(JSON.stringify({ error: 'Missing ticketId' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log('[send-email] Processing ticket:', ticketId)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Fetch ticket details
  const { data: ticket, error: ticketErr } = await supabase
    .from('tickets')
    .select(`
      id, 
      buyer_name, 
      buyer_email, 
      tier_name, 
      quantity, 
      total_amount,
      human_reference,
      qr_code_data,
      event_id,
      payment_status
    `)
    .eq('id', ticketId)
    .eq('payment_status', 'completed')
    .single()

  if (ticketErr || !ticket) {
    console.error('[send-email] Ticket not found or not paid:', ticketId, ticketErr)
    return new Response(JSON.stringify({ error: 'Ticket not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Fetch event details
  const { data: event } = await supabase
    .from('events')
    .select('title, date, location, description')
    .eq('id', ticket.event_id)
    .single()

  // Build email HTML
  const emailHtml = generateTicketEmailHTML({
    buyerName: ticket.buyer_name,
    buyerEmail: ticket.buyer_email,
    eventName: event?.title || 'Your Event',
    ticketTier: ticket.tier_name,
    quantity: ticket.quantity,
    totalPrice: ticket.total_amount,
    humanReference: ticket.human_reference,
    qrCodeDataUrl: ticket.qr_code_data || undefined,
    eventDate: event?.date,
    eventLocation: event?.location,
    eventDescription: event?.description,
  })

  // Send via Resend
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    console.error('[send-email] RESEND_API_KEY not configured')
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'tickets@tribedala.com',
        to: ticket.buyer_email,
        subject: `🎟️ Your Ticket Confirmed - ${event?.title || 'Tribedala'}`,
        html: emailHtml,
        reply_to: 'support@tribedala.com',
      }),
    })

    const resendResponse = await res.json()

    if (!res.ok) {
      console.error('[send-email] Resend API error:', resendResponse)
      return new Response(JSON.stringify({ error: resendResponse.message || 'Email send failed' }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('[send-email] Email sent successfully:', resendResponse.id)

    // Mark email as sent in database
    await supabase
      .from('tickets')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', ticketId)

    return new Response(JSON.stringify({ ok: true, messageId: resendResponse.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[send-email] Error:', err)
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

/**
 * Generate ticket email HTML (same as frontend)
 */
function generateTicketEmailHTML(data: {
  buyerName: string
  buyerEmail: string
  eventName: string
  ticketTier: string
  quantity: number
  totalPrice: number
  humanReference: string
  qrCodeDataUrl?: string
  eventDate?: string
  eventLocation?: string
  eventDescription?: string
}): string {
  const qrBlock = data.qrCodeDataUrl
    ? `
      <tr>
        <td style="padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your Ticket QR Code</p>
          <img src="${data.qrCodeDataUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 2px solid #3b82f6; border-radius: 8px;" />
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">Save or screenshot this QR code for check-in</p>
        </td>
      </tr>
    `
    : ''

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.5;
            color: #333;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 30px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 30px 20px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #1f2937;
          }
          .ticket-box {
            background-color: #f3f4f6;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .ticket-detail {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #d1d5db;
          }
          .ticket-detail:last-child {
            border-bottom: none;
          }
          .ticket-label {
            font-weight: 600;
            color: #6b7280;
          }
          .ticket-value {
            color: #1f2937;
            text-align: right;
          }
          .reference-block {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .reference-label {
            font-size: 12px;
            color: #6b7280;
            margin: 0;
          }
          .reference-value {
            font-size: 20px;
            font-weight: bold;
            color: #3b82f6;
            margin: 5px 0 0 0;
            font-family: 'Courier New', monospace;
          }
          .event-info {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
          }
          .event-info-title {
            font-weight: 600;
            color: #15803d;
            margin-bottom: 8px;
          }
          .event-info-detail {
            margin: 5px 0;
            color: #4b5563;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎟️ Your Ticket is Confirmed!</h1>
          </div>
          
          <div class="content">
            <p class="greeting">Hi ${data.buyerName},</p>
            
            <p>Thank you for purchasing a ticket to <strong>${data.eventName}</strong>! Your payment has been confirmed.</p>
            
            <table>
              ${qrBlock}
              <tr>
                <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                  <div class="reference-block">
                    <p class="reference-label">YOUR TICKET REFERENCE</p>
                    <p class="reference-value">${data.humanReference}</p>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 15px 0; font-weight: 600; color: #1f2937;">Order Details</p>
                  <div class="ticket-box">
                    <div class="ticket-detail">
                      <span class="ticket-label">Ticket Tier</span>
                      <span class="ticket-value">${data.ticketTier}</span>
                    </div>
                    <div class="ticket-detail">
                      <span class="ticket-label">Quantity</span>
                      <span class="ticket-value">${data.quantity}</span>
                    </div>
                    <div class="ticket-detail">
                      <span class="ticket-label">Total Amount</span>
                      <span class="ticket-value" style="font-weight: bold; color: #3b82f6;">KES ${data.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </td>
              </tr>
              
              ${data.eventDate || data.eventLocation ? `
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                    <div class="event-info">
                      <p class="event-info-title">📅 Event Details</p>
                      ${data.eventDate ? `<p class="event-info-detail"><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
                      ${data.eventLocation ? `<p class="event-info-detail"><strong>Location:</strong> ${data.eventLocation}</p>` : ''}
                      ${data.eventDescription ? `<p class="event-info-detail"><strong>Description:</strong> ${data.eventDescription}</p>` : ''}
                    </div>
                  </td>
                </tr>
              ` : ''}
              
              <tr>
                <td style="padding: 20px; text-align: center;">
                  <p style="margin: 0 0 15px 0; font-size: 14px; color: #6b7280;">Important: Save your QR code above. You'll need it to check in at the event.</p>
                </td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${data.buyerEmail}</p>
            <p>If you have any questions, please contact support@tribedala.com</p>
            <p style="margin-top: 10px;">© 2026 Tribedala. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
