# IntaSend Integration Guide

This document explains how to complete the IntaSend payment integration for event ticket sales on TribeDala.

## Overview

The IntaSend integration allows event organizers to sell tickets through TribeDala with the following features:

- **Ticket Management**: Create and manage tickets with different tiers and pricing
- **Payment Processing**: Accept payments via M-Pesa, credit cards, and bank transfers
- **Order Tracking**: Track all ticket sales and payments
- **Admin Dashboard**: Full visibility into ticket sales and revenue

## Setup Steps

### 1. Create IntaSend Account

1. Visit [IntaSend](https://intasend.com/)
2. Sign up for a business account
3. Complete identity verification
4. Navigate to Dashboard → Settings → API Keys
5. Copy your:
   - **Public Key** (publishable)
   - **Secret Key** (keep confidential)

### 2. Configure Environment Variables

Add your IntaSend credentials to `.env`:

```bash
VITE_PUBLIC_INTASEND_PUBLIC_KEY=your_public_key_here
VITE_INTASEND_SECRET_KEY=your_secret_key_here
```

**Important**: 
- Never commit `.env` to version control
- Use different keys for development and production
- Rotate keys regularly for security

### 3. Setup Supabase Database

Run the SQL migration to create the necessary tables:

```sql
-- Run: create-tickets-tables.sql
```

This creates:
- **tickets** table: Event ticket offerings
- **ticket_orders** table: Purchase orders and payment tracking

### 4. Configure IntaSend Webhook

The webhook notifies your app when payments are confirmed.

**In IntaSend Dashboard:**
1. Go to Settings → Webhooks
2. Add a new webhook with:
   - **Event**: Payment completed
   - **URL**: `https://yourdomain.com/api/webhooks/intasend`
   - **Method**: POST

**For Local Development:**
Use a tunnel service like ngrok:
```bash
ngrok http 5173
```

Then set webhook URL to: `https://your-ngrok-url.ngrok.io/api/webhooks/intasend`

### 5. Deploy Backend Function (Important!)

The webhook handler needs a backend/serverless function since it accesses your Supabase service role key.

**Option A: Supabase Edge Functions**

```typescript
// supabase/functions/intasend-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const payload = await req.json()
  
  try {
    // Call your webhook handler logic here
    // Update ticket_orders and tickets tables
    
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
```

**Option B: Vercel/Netlify Functions**

```typescript
// api/webhooks/intasend.ts
import { handleIntaSendWebhook } from '@/lib/webhook-handler'

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const result = await handleIntaSendWebhook(req.body)
    return res.status(200).json(result)
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}
```

### 6. Test the Integration

#### Create a Test Ticket

1. Log in as admin
2. Go to Admin → Tickets
3. Click "New Ticket"
4. Fill in:
   - Event: Select an event
   - Ticket Name: "Test Ticket"
   - Price: 500 KES
   - Quantity: 10

#### Purchase a Ticket

1. Go to an event detail page
2. Select the test ticket
3. Click "Continue to Payment"
4. Fill in buyer details
5. Click "Continue to Payment"
6. You'll be redirected to IntaSend payment page

#### Complete Payment (Sandbox)

IntaSend provides test credentials for sandbox testing:

- **M-Pesa Test Number**: Use any number in sandbox mode
- **Card Test**: Use card number `4111111111111111`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

#### Verify Order

After completing payment:

1. Check Admin → Tickets
2. Verify ticket `quantity_sold` increased
3. Check ticket_orders table for payment status

## File Structure

```
src/
├── lib/
│   ├── intasend.ts              # IntaSend SDK wrapper
│   └── webhook-handler.ts       # Webhook processing logic
├── components/
│   └── TicketPurchaseModal.tsx  # Payment UI modal
├── pages/
│   ├── events/detail/page.tsx   # Event ticket purchase
│   └── admin/tickets/page.tsx   # Admin ticket management
└── pages/api/webhooks/
    └── intasend.ts              # Webhook endpoint

database/
├── create-tickets-tables.sql    # Database schema
```

## Key Features

### Ticket Management
- Create multiple ticket tiers per event
- Set prices and quantities
- Activate/deactivate tickets
- Track sales progress

### Payment Processing
- Real-time payment status updates
- Multiple payment methods (M-Pesa, Cards, Bank Transfer)
- Secure payment handling
- Transaction ID tracking

### Admin Dashboard
- View all ticket sales
- Monitor revenue in real-time
- See ticket availability
- Generate reports

## Troubleshooting

### Payment not completing

**Issue**: User pays but order status stays "pending"

**Solution**:
1. Verify webhook URL is correct in IntaSend dashboard
2. Check webhook logs in IntaSend dashboard
3. Ensure Supabase credentials are correct
4. Check browser console for errors

### Webhook not firing

**Issue**: Orders not updating after payment

**Solution**:
1. Verify webhook is enabled in IntaSend dashboard
2. Check IntaSend webhook delivery logs
3. Ensure backend function is deployed
4. Test webhook manually from IntaSend dashboard

### IntaSend credentials not working

**Issue**: "Invalid credentials" error during payment

**Solution**:
1. Regenerate API keys in IntaSend dashboard
2. Update `.env` with new keys
3. Restart development server
4. Clear browser cache

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Validate webhook signatures** (implement in production)
3. **Use HTTPS** for all payment endpoints
4. **Store sensitive data** in environment variables
5. **Implement rate limiting** on webhook endpoints
6. **Log all transactions** for audit trails

## Next Steps

1. **Email Notifications**: Send confirmation emails to buyers
2. **Ticket Delivery**: Generate PDF tickets with QR codes
3. **Refunds**: Implement refund processing
4. **Analytics**: Create revenue reports and dashboards
5. **Multi-currency**: Support different currencies for events
6. **Discounts**: Add promo codes and discount codes

## Support

For IntaSend support, visit:
- [IntaSend Documentation](https://docs.intasend.com/)
- [IntaSend Dashboard](https://app.intasend.com/)

For TribeDala support:
- Contact the development team
- Check GitHub issues
- Review code documentation
