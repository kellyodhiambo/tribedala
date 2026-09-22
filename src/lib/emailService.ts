/**
 * Email Service
 * Handles ticket delivery and other transactional emails
 * Uses Resend API (https://resend.com)
 */

export interface TicketEmailData {
  buyerName: string;
  buyerEmail: string;
  eventName: string;
  ticketTier: string;
  quantity: number;
  totalPrice: number;
  humanReference: string;
  qrCodeDataUrl?: string;  // base64 QR code image
  eventDate?: string;
  eventLocation?: string;
  eventDescription?: string;
}

/**
 * Generate HTML email template for ticket
 */
export function generateTicketEmailHTML(data: TicketEmailData): string {
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
    : '';

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
          .cta-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
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
  `;
}

/**
 * Send ticket confirmation email via Resend
 * This should be called from a backend API or Edge Function
 * For now, we provide the HTML template for sending
 */
export async function sendTicketEmail(
  data: TicketEmailData,
  resendApiKey: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Note: This requires a backend API to call Resend
    // Resend API keys should never be exposed in frontend code
    // This is a template for backend use
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'tickets@tribedala.com',
        to: data.buyerEmail,
        subject: `🎟️ Your Ticket Confirmed - ${data.eventName}`,
        html: generateTicketEmailHTML(data),
        reply_to: 'support@tribedala.com',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
    };
  } catch (err) {
    console.error('[EmailService] Error sending ticket email:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export default {
  generateTicketEmailHTML,
  sendTicketEmail,
};
