/**
 * PayHero Payment Gateway Integration
 * Handles M-Pesa STK Push payments for event tickets.
 *
 * API reference: https://docs.payhero.co.ke
 * Base URL: https://backend.payhero.co.ke/api/v2
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PayHeroStkRequest {
  /** Customer phone number in 254XXXXXXXXX format */
  phone_number: string;
  /** Amount in KES (integer) */
  amount: number;
  /** Your order/reference ID — returned in callback as ExternalReference */
  external_reference: string;
  /** Customer display name shown on the STK prompt */
  customer_name?: string;
  /** Public URL that PayHero will POST the payment result to */
  callback_url: string;
}

export interface PayHeroStkResponse {
  success: boolean;
  /** PayHero internal reference — use this to query status */
  reference?: string;
  CheckoutRequestID?: string;
  status?: string;
  /** Human-readable error when success is false */
  error?: string;
}

export interface PayHeroStatusResponse {
  success: boolean;
  /** "QUEUED" | "SUCCESS" | "FAILED" */
  status?: string;
  reference?: string;
  /** M-Pesa receipt number — present on SUCCESS */
  provider_reference?: string;
  third_party_reference?: string;
  CheckoutRequestID?: string;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a Kenyan phone number to 254XXXXXXXXX.
 * Accepts: 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
 */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
  if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
  // already looks right or unrecognised — return as-is and let PayHero validate
  return digits;
}

// ─── Service class ────────────────────────────────────────────────────────────

class PayHeroService {
  private readonly baseUrl = 'https://backend.payhero.co.ke/api/v2';
  private readonly authToken: string;
  private readonly channelId: number;

  constructor(authToken: string, channelId: number) {
    this.authToken = authToken;
    this.channelId = channelId;
  }

  private headers(): Record<string, string> {
    return {
      'Authorization': this.authToken,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Initiate an M-Pesa STK Push via PayHero.
   * The customer will receive a PIN prompt on their phone.
   */
  async initiateStk(req: PayHeroStkRequest): Promise<PayHeroStkResponse> {
    try {
      const body = {
        amount: req.amount,
        phone_number: normalisePhone(req.phone_number),
        channel_id: this.channelId,
        provider: 'm-pesa',
        external_reference: req.external_reference,
        customer_name: req.customer_name ?? '',
        callback_url: req.callback_url,
      };

      console.log('[PayHero] STK push request:', { ...body, phone_number: '***' });

      const res = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('[PayHero] STK push response:', data);

      if (!res.ok || data.success === false) {
        return {
          success: false,
          error: data.error_description ?? data.detail ?? data.message ?? 'STK push failed',
        };
      }

      return {
        success: true,
        reference: data.reference,
        CheckoutRequestID: data.CheckoutRequestID,
        status: data.status ?? 'QUEUED',
      };
    } catch (err) {
      console.error('[PayHero] STK push exception:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }

  /**
   * Query the status of a previously initiated payment.
   * Pass the `reference` returned by initiateStk.
   */
  async getStatus(reference: string): Promise<PayHeroStatusResponse> {
    try {
      const url = `${this.baseUrl}/transaction-status?reference=${encodeURIComponent(reference)}`;
      const res = await fetch(url, { method: 'GET', headers: this.headers() });
      const data = await res.json();
      console.log('[PayHero] Status response:', data);

      if (!res.ok) {
        return { success: false, error: data.detail ?? data.message ?? 'Status check failed' };
      }

      return {
        success: true,
        status: data.status,
        reference: data.reference,
        provider_reference: data.provider_reference,
        third_party_reference: data.third_party_reference,
        CheckoutRequestID: data.CheckoutRequestID,
      };
    } catch (err) {
      console.error('[PayHero] Status check exception:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _instance: PayHeroService | null = null;

export function getPayHeroInstance(): PayHeroService {
  if (_instance) return _instance;

  const authToken = import.meta.env.VITE_PAYHERO_AUTH_TOKEN as string | undefined;
  const channelId = Number(import.meta.env.VITE_PAYHERO_CHANNEL_ID);

  if (!authToken || !channelId) {
    throw new Error(
      'PayHero credentials not configured. ' +
      'Set VITE_PAYHERO_AUTH_TOKEN and VITE_PAYHERO_CHANNEL_ID in your .env file.',
    );
  }

  _instance = new PayHeroService(authToken, channelId);
  return _instance;
}

export default PayHeroService;
