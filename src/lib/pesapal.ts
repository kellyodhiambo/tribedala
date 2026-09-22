/**
 * Pesapal Payment Service
 * Handles M-Pesa, card, and bank transfer payments via Pesapal
 * Direct collection to merchant account - no pre-funding needed
 */

interface PesapalAuthResponse {
  token: string;
  expiresIn: number;
  tokenType: string;
}

interface PesapalOrderRequest {
  id: string;                    // Your order ID (UUID)
  currency: string;              // "KES"
  amount: number;                // Amount in KES
  description: string;           // "Ticket Purchase - Event Name"
  callback_url: string;          // Where Pesapal sends payment confirmation
  redirect_url: string;          // Where to send customer after payment
  billing_address: {
    email_address: string;
    phone_number: string;
    first_name: string;
    last_name?: string;
    line_1?: string;
    city?: string;
    postal_code?: string;
    country_code?: string;
  };
}

interface PesapalOrderResponse {
  order_tracking_id: string;      // Track this payment
  merchant_reference: string;     // Your reference (order ID)
  redirect_url: string;           // Send customer here to pay
  error?: string;
}

interface PesapalTransactionStatus {
  order_tracking_id: string;
  merchant_reference: string;
  payment_method: string;        // "MPESA", "AIRTEL", "CARD", "BANK"
  payment_status_description: string;
  payment_account: string;
  payment_status_code: string;   // "COMPLETED", "FAILED", "PENDING"
  amount: number;
  currency: string;
  error_message?: string;
  created_date?: string;
}

// Environment variables
const PESAPAL_CONSUMER_KEY = import.meta.env.VITE_PESAPAL_CONSUMER_KEY as string;
const PESAPAL_CONSUMER_SECRET = import.meta.env.VITE_PESAPAL_CONSUMER_SECRET as string;
const PESAPAL_API_URL = 'https://api.pesapal.com/api/';

// Token cache (in production, use Redis or similar)
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth2 token from Pesapal
 * Tokens expire in ~1 hour
 */
async function getAuthToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const credentials = btoa(`${PESAPAL_CONSUMER_KEY}:${PESAPAL_CONSUMER_SECRET}`);

  try {
    const response = await fetch(`${PESAPAL_API_URL}Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status}`);
    }

    const data = (await response.json()) as PesapalAuthResponse;

    // Cache token (expire 5 minutes early for safety)
    cachedToken = {
      token: data.token,
      expiresAt: Date.now() + (data.expiresIn - 300) * 1000,
    };

    return data.token;
  } catch (err) {
    console.error('[Pesapal] Token request failed:', err);
    throw new Error('Failed to authenticate with Pesapal');
  }
}

/**
 * Initiate a payment order with Pesapal
 * Returns a redirect URL where customer pays
 */
export async function initiateOrder(params: {
  orderId: string;              // Unique order ID from your system
  amount: number;               // Amount in KES
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventName: string;
  redirectUrl: string;          // Where to send after payment
  callbackUrl: string;          // Where Pesapal sends webhook
}): Promise<{ success: boolean; redirectUrl?: string; error?: string; orderTrackingId?: string }> {
  if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
    return { success: false, error: 'Pesapal credentials not configured' };
  }

  try {
    const token = await getAuthToken();

    const orderRequest: PesapalOrderRequest = {
      id: params.orderId,
      currency: 'KES',
      amount: params.amount,
      description: `Ticket Purchase - ${params.eventName}`,
      callback_url: params.callbackUrl,
      redirect_url: params.redirectUrl,
      billing_address: {
        email_address: params.customerEmail,
        phone_number: params.customerPhone,
        first_name: params.customerName.split(' ')[0],
        last_name: params.customerName.split(' ').slice(1).join(' ') || undefined,
        country_code: 'KE',
      },
    };

    const response = await fetch(`${PESAPAL_API_URL}Transactions/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Pesapal] Order creation failed:', error);
      return { success: false, error: 'Failed to create payment order' };
    }

    const data = (await response.json()) as PesapalOrderResponse;

    if (data.error) {
      return { success: false, error: data.error };
    }

    return {
      success: true,
      redirectUrl: data.redirect_url,
      orderTrackingId: data.order_tracking_id,
    };
  } catch (err) {
    console.error('[Pesapal] Order initiation failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Payment initiation failed' };
  }
}

/**
 * Check payment status
 * Called after customer completes payment on Pesapal
 */
export async function getPaymentStatus(
  orderTrackingId: string
): Promise<{ success: boolean; status?: string; data?: PesapalTransactionStatus; error?: string }> {
  if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
    return { success: false, error: 'Pesapal credentials not configured' };
  }

  try {
    const token = await getAuthToken();

    const response = await fetch(
      `${PESAPAL_API_URL}Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: `Status check failed: ${response.status}` };
    }

    const data = (await response.json()) as PesapalTransactionStatus;

    return {
      success: true,
      status: data.payment_status_code,
      data,
    };
  } catch (err) {
    console.error('[Pesapal] Status check failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Status check failed' };
  }
}

/**
 * Validate webhook signature from Pesapal
 * Use this to verify callbacks are from Pesapal
 */
export async function validateWebhookSignature(payload: Record<string, unknown>, signature: string): Promise<boolean> {
  if (!PESAPAL_CONSUMER_SECRET) return false;

  try {
    // Use SubtleCrypto for browser compatibility
    const encoder = new TextEncoder();
    const payloadString = JSON.stringify(payload);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(PESAPAL_CONSUMER_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature_bytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payloadString)
    );

    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature_bytes)));
    return expectedSignature === signature;
  } catch (err) {
    console.error('[Pesapal] Signature validation failed:', err);
    return false;
  }
}

/**
 * Format payment status for UI display
 */
export function formatPaymentStatus(status: string): {
  isCompleted: boolean;
  isFailed: boolean;
  isPending: boolean;
  displayText: string;
} {
  const statusMap: Record<string, string> = {
    COMPLETED: 'Payment confirmed',
    PENDING: 'Payment pending',
    FAILED: 'Payment failed',
    CANCELLED: 'Payment cancelled',
  };

  return {
    isCompleted: status === 'COMPLETED',
    isFailed: status === 'FAILED' || status === 'CANCELLED',
    isPending: status === 'PENDING',
    displayText: statusMap[status] || 'Unknown status',
  };
}

export default {
  initiateOrder,
  getPaymentStatus,
  validateWebhookSignature,
  formatPaymentStatus,
};
