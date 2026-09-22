/**
 * Ticket Service
 * Handles QR code generation, ticket validation, and ticket utilities
 */

export interface TicketQRData {
  ticketId: string;
  humanReference: string;
  eventId: string;
  eventName: string;
  buyerName: string;
  buyerEmail: string;
  tier: string;
  quantity: number;
  issuedAt: string;
  validUntil?: string;
}

/**
 * Generate QR code as a data URL
 * The QR encodes the ticket ID and human reference for validation
 */
export async function generateQRCode(data: TicketQRData): Promise<string> {
  try {
    // Dynamically import QRCode to avoid SSR issues
    const { default: QRCode } = await import('qrcode');
    
    // Create a compact JSON payload to encode in the QR
    const payload = {
      tid: data.ticketId,
      ref: data.humanReference,
      evt: data.eventId,
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrDataUrl;
  } catch (err) {
    console.error('[TicketService] QR generation failed:', err);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Validate a QR code payload
 * Returns decoded ticket info if valid
 */
export function decodeQRPayload(jsonString: string): TicketQRData | null {
  try {
    const decoded = JSON.parse(jsonString);
    if (!decoded.tid || !decoded.ref) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Format ticket details for display/email
 */
export function formatTicketDetails(
  humanReference: string,
  eventName: string,
  ticketName: string,
  quantity: number,
  price: number,
): string {
  return `
Ticket Reference: ${humanReference}
Event: ${eventName}
Tier: ${ticketName}
Quantity: ${quantity} ticket${quantity !== 1 ? 's' : ''}
Price per ticket: KES ${price.toLocaleString()}
Total: KES ${(price * quantity).toLocaleString()}
  `.trim();
}

/**
 * Generate a short PIN for manual check-in validation
 * 4-digit code derived from ticket ID
 */
export function generateCheckInPIN(ticketId: string): string {
  // Convert UUID to a number and modulo 10000 for 4-digit PIN
  const hash = ticketId
    .replace(/-/g, '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const pin = (hash % 10000).toString().padStart(4, '0');
  return pin;
}

/**
 * Create a check-in validation code for the mobile app
 * Combines human reference, PIN, and timestamp for uniqueness
 */
export function createCheckInCode(
  humanReference: string,
  ticketId: string,
): string {
  const pin = generateCheckInPIN(ticketId);
  // Return: EVT-2026-XXXX-ABCD-1234 (reference + PIN for manual entry)
  return `${humanReference}-${pin}`;
}

/**
 * Validate check-in code format
 */
export function validateCheckInCodeFormat(code: string): boolean {
  // Format: EVT-YYYY-XXXX-ABCD-DDDD (where DDDD is the PIN)
  const pattern = /^EVT-\d{4}-\d{4}-[A-Z0-9]{4}-\d{4}$/;
  return pattern.test(code);
}

/**
 * Check if a ticket is valid for check-in
 * (not already checked in, payment completed, event not expired, etc.)
 */
export interface CheckInValidation {
  valid: boolean;
  reason?: string;
  ticketStatus?: string;
  canCheckIn: boolean;
}

export function validateTicketForCheckIn(
  paymentStatus: string,
  checkedInAt: string | null,
  eventDate: Date,
  allowDuplicate: boolean = false,
): CheckInValidation {
  // Payment must be completed
  if (paymentStatus !== 'completed') {
    return {
      valid: false,
      canCheckIn: false,
      reason: `Ticket not paid (status: ${paymentStatus})`,
    };
  }

  // Event must not be in the future
  if (new Date() < eventDate) {
    return {
      valid: false,
      canCheckIn: false,
      reason: 'Event has not started yet',
      ticketStatus: 'early',
    };
  }

  // Ticket must not already be checked in
  if (checkedInAt && !allowDuplicate) {
    return {
      valid: false,
      canCheckIn: false,
      reason: `Already checked in at ${new Date(checkedInAt).toLocaleString()}`,
      ticketStatus: 'already_checked_in',
    };
  }

  return {
    valid: true,
    canCheckIn: true,
    ticketStatus: 'valid',
  };
}

export default {
  generateQRCode,
  decodeQRPayload,
  formatTicketDetails,
  generateCheckInPIN,
  createCheckInCode,
  validateCheckInCodeFormat,
  validateTicketForCheckIn,
};
