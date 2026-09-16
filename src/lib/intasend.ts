/**
 * IntaSend Payment Gateway Integration
 * Handles payment processing for event tickets
 */

export interface IntaSendPaymentRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  amount: number;
  currency: 'KES' | 'UGX' | 'TZS'; // Supported currencies
  api_ref: string; // Unique reference ID
  redirect_url?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface IntaSendPaymentResponse {
  request_id: string;
  status: string;
  payment_url?: string;
  error?: string;
  message?: string;
}

export interface IntaSendTransactionStatus {
  request_id: string;
  status: string;
  amount?: number;
  currency?: string;
  transaction_id?: string;
  error?: string;
  message?: string;
}

class IntaSendPaymentService {
  private baseUrl = 'https://payment.intasend.com/api/v1';
  private publicKey: string;
  private secretKey: string;

  constructor(publicKey: string, secretKey: string) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
  }

  /**
   * Get authorization header for IntaSend API
   */
  private getAuthHeader(): Record<string, string> {
    const credentials = `${this.publicKey}:${this.secretKey}`;
    const encodedCredentials = btoa(credentials);
    return {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Initialize a payment request
   */
  async initiatePayment(request: IntaSendPaymentRequest): Promise<IntaSendPaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-initiate/`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          first_name: request.first_name,
          last_name: request.last_name,
          email: request.email,
          phone_number: request.phone_number,
          amount: request.amount,
          currency: request.currency || 'KES',
          api_ref: request.api_ref,
          redirect_url: request.redirect_url,
          callback_url: request.callback_url,
          ...(request.metadata && { metadata: request.metadata }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[IntaSend] Payment initiation error:', data);
        return {
          request_id: '',
          status: 'error',
          error: data.error || 'Payment initiation failed',
          message: data.message,
        };
      }

      console.log('[IntaSend] Payment initiated successfully:', data);
      return {
        request_id: data.request_id,
        status: data.status || 'pending',
        payment_url: data.payment_url,
      };
    } catch (error) {
      console.error('[IntaSend] Payment initiation exception:', error);
      return {
        request_id: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(requestId: string): Promise<IntaSendTransactionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-status/${requestId}/`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[IntaSend] Status check error:', data);
        return {
          request_id: requestId,
          status: 'error',
          error: data.error || 'Status check failed',
        };
      }

      console.log('[IntaSend] Transaction status:', data);
      return {
        request_id: requestId,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        transaction_id: data.transaction_id,
      };
    } catch (error) {
      console.error('[IntaSend] Status check exception:', error);
      return {
        request_id: requestId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(transactionId: string, reason?: string): Promise<{ status: string; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/refund/`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          transaction_id: transactionId,
          ...(reason && { reason }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[IntaSend] Refund error:', data);
        return {
          status: 'error',
          error: data.error || 'Refund failed',
          message: data.message,
        };
      }

      console.log('[IntaSend] Refund processed:', data);
      return {
        status: 'success',
        message: data.message,
      };
    } catch (error) {
      console.error('[IntaSend] Refund exception:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Create and export singleton instance
let intaSendInstance: IntaSendPaymentService | null = null;

export function initializeIntaSend(publicKey: string, secretKey: string): IntaSendPaymentService {
  if (!intaSendInstance) {
    intaSendInstance = new IntaSendPaymentService(publicKey, secretKey);
  }
  return intaSendInstance;
}

export function getIntaSendInstance(): IntaSendPaymentService {
  if (!intaSendInstance) {
    const publicKey = import.meta.env.VITE_PUBLIC_INTASEND_PUBLIC_KEY;
    const secretKey = import.meta.env.VITE_INTASEND_SECRET_KEY;

    if (!publicKey || !secretKey) {
      throw new Error('IntaSend credentials not configured. Check your .env file.');
    }

    intaSendInstance = new IntaSendPaymentService(publicKey, secretKey);
  }
  return intaSendInstance;
}

export default IntaSendPaymentService;
