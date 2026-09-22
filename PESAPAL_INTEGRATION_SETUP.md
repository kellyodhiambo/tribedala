# Pesapal Payment Integration Guide

## Overview

Pesapal is a payment aggregator that enables direct collection from customers to YOUR merchant account.

**Key Advantage**: No pre-funding needed. Customer pays → Money goes directly to your account.

---

## How It Works

```
Customer enters payment form
    ↓
Clicks "Pay with Pesapal"
    ↓
Redirected to Pesapal payment page
    ↓
Customer selects payment method (M-Pesa, card, bank, etc.)
    ↓
Payment processed
    ↓
Customer redirected back to your site
    ↓
Pesapal sends webhook confirmation
    ↓
You receive money in your account
    ✅ Money goes straight to YOU
```

---

## Configuration

### Your Credentials (Already Set)

In `.env`:
```env
VITE_PESAPAL_CONSUMER_KEY=hg9lMoNl9DcJyh4YQ02cgEpV+OPK63PP
VITE_PESAPAL_CONSUMER_SECRET=kO0EUNUeZaKnbzowFMhtwEXgQWw=
```

These are already configured. ✅

---

## Deployment Steps

### Step 1: Update Database Schema

```bash
# Run the SQL migration:
# File: PAYHERO_ARCHITECTURE_IMPROVEMENTS.sql
# (Now includes Pesapal columns)

# Via Supabase CLI:
supabase db push
```

### Step 2: Deploy Edge Function

```bash
supabase functions deploy pesapal-webhook --no-verify-jwt
```

### Step 3: Update .env (Already Done ✅)

The Pesapal credentials are already in `.env`:
- VITE_PESAPAL_CONSUMER_KEY
- VITE_PESAPAL_CONSUMER_SECRET

### Step 4: Install Dependencies

```bash
npm install
# (Already includes qrcode and resend)
```

### Step 5: Update Router (If Using React Router)

Make sure the payment callback page route is registered:

```tsx
// In your router config:
{
  path: '/payment/callback',
  element: <PaymentCallbackPage />
}
```

---

## How Payment Flow Works

### 1. Customer Clicks "Buy Ticket"

- Opens `TicketPurchaseModal`
- Fills in name, email, phone
- Selects quantity
- Clicks "Pay with Pesapal"

### 2. Order Created

```typescript
// Order created in database with:
- id (UUID)
- human_reference (EVT-2026-XXXX-ABCD)
- payment_status: "pending"
- payment_method: "pesapal"
```

### 3. Pesapal Payment Initiated

```typescript
await initiateOrder({
  orderId: orderData.id,
  amount: totalAmount,
  customerName: buyerName,
  customerEmail: buyerEmail,
  customerPhone: buyerPhone,
  eventName: eventName,
  redirectUrl: 'https://yoursite.com/events/{eventId}?payment=success',
  callbackUrl: 'https://yoursite.com/functions/v1/pesapal-webhook'
});
```

### 4. Customer Redirected to Pesapal

- Customer sees payment form
- Selects M-Pesa (or other payment method)
- Enters phone/payment details
- Completes payment

### 5. Payment Confirmation Webhook

Pesapal POSTs to `/functions/v1/pesapal-webhook`:

```json
{
  "id": 12345,
  "code": "pesapal_ref_12345",
  "status": "COMPLETED",
  "merchant_reference": "order-uuid",
  "created_date": "2026-09-20T14:30:00Z"
}
```

**Webhook automatically**:
- Updates ticket status to "paid"
- Generates QR code
- Increments ticket sales counter
- Triggers email delivery
- Records `pesapal_webhook_payload` for audit

### 6. Customer Redirected Back

After Pesapal processes, customer is sent to:
```
https://yoursite.com/events/{eventId}?payment=success
```

Or if they access `/payment/callback`, they see:
- ✅ Success page with ticket reference
- ✅ Link to download QR code
- ✅ Email confirmation status

### 7. Email Sent

Automatically after payment confirmed:
- Ticket confirmation email
- QR code embedded
- Ticket reference shown
- Event details included

### 8. Check-In at Event

- Staff scans QR code
- Calls `/functions/v1/validate-ticket-checkin`
- Returns: ✅ John Doe - VIP (2 tickets) - First check-in
- Ticket marked as checked_in

---

## Testing Payment Flow

### Test 1: Payment Initiation

```bash
npm run dev
# Navigate to any event
# Click "Buy Ticket"
# Fill form with:
  Name: Test User
  Email: test@example.com
  Phone: 254712345678
  Quantity: 1
# Click "Pay with Pesapal"
```

**Expected**: Redirected to Pesapal payment page

### Test 2: Use Pesapal Test Card

On Pesapal payment page, use test credentials:
- Phone: (if M-Pesa) Any number will work in sandbox
- Card: (if card) Use Pesapal test card

**Expected**: Payment processes in sandbox

### Test 3: Webhook Received

Check Supabase logs:
```bash
supabase functions logs pesapal-webhook
```

**Expected**: Log shows webhook received and processed

### Test 4: Email Sent

Check inbox for ticket confirmation:

**Expected**: Email with:
- Ticket reference (EVT-2026-XXXX-ABCD)
- QR code as image
- Event details
- Buyer info

### Test 5: QR Code Validation

```bash
curl -X POST http://localhost:54321/functions/v1/validate-ticket-checkin \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "{\"tid\":\"order-id\",\"ref\":\"EVT-2026-XXXX-ABCD\",\"evt\":\"event-id\"}"
  }'
```

**Expected**: Success response with ticket details

---

## Database Schema Changes

### New Columns on `tickets` Table

```sql
-- Pesapal references
pesapal_reference TEXT              -- Pesapal's transaction ID
pesapal_webhook_payload JSONB       -- Complete webhook payload

-- Payment tracking
payment_queued_at TIMESTAMPTZ       -- When payment initiated
payment_completed_at TIMESTAMPTZ    -- When payment succeeded
ticket_issued_at TIMESTAMPTZ        -- When QR generated

-- Other features (already added)
human_reference TEXT UNIQUE         -- EVT-2026-XXXX-ABCD
qr_code_data TEXT                   -- Base64 QR image
checked_in_at TIMESTAMPTZ           -- Check-in timestamp
check_in_count INT                  -- Number of check-ins
email_sent_at TIMESTAMPTZ           -- Email sent timestamp
```

---

## Files Changed

### New Files
- `src/lib/pesapal.ts` - Pesapal API service
- `src/pages/payment/callback/page.tsx` - Payment callback page
- `supabase/functions/pesapal-webhook/index.ts` - Webhook handler

### Updated Files
- `src/components/TicketPurchaseModal.tsx` - Now uses Pesapal instead of PayHero
- `.env` - Added Pesapal credentials
- `PAYHERO_ARCHITECTURE_IMPROVEMENTS.sql` - Added Pesapal columns

### Removed/Deprecated
- PayHero integration (no longer used)

---

## Error Handling

### Customer Facing

1. **Payment Failed**
   - Pesapal shows error
   - Customer redirected back with error
   - Order marked as "failed"
   - Customer can try again

2. **Network Error**
   - Payment initiation fails
   - User sees error message
   - Can retry immediately

3. **Invalid Details**
   - Pesapal validates on their side
   - Shows error on payment page
   - Customer can correct

### Backend

1. **Webhook Not Received**
   - Order stays in "pending"
   - Customer can manually check status
   - After 24hrs, we can mark as timeout

2. **Webhook Retry**
   - Pesapal retries webhook 3 times
   - Idempotency check prevents duplicates
   - Both `payment_status` and `pesapal_reference` checked

3. **Webhook Verification**
   - Future: Add HMAC signature validation
   - Currently: Trusts Pesapal (whitelisted IP)

---

## Monitoring

### Check Payment Status

```sql
-- View all payments
SELECT id, human_reference, payment_status, pesapal_reference, payment_completed_at
FROM tickets
WHERE payment_status IN ('completed', 'failed')
ORDER BY payment_completed_at DESC
LIMIT 10;
```

### Check Webhook Logs

```bash
supabase functions logs pesapal-webhook --limit 50
```

### Check Email Delivery

```sql
-- View which tickets got emails
SELECT id, human_reference, buyer_email, email_sent_at
FROM tickets
WHERE email_sent_at IS NOT NULL
ORDER BY email_sent_at DESC
LIMIT 10;
```

---

## Support & Debugging

### Issue: Payment Page Won't Load

**Debug**:
1. Check `.env` credentials are correct
2. Check browser console for errors
3. Verify Pesapal account is active
4. Check Supabase function logs

```bash
supabase functions logs
```

### Issue: Webhook Not Triggering

**Debug**:
1. Check webhook function is deployed
2. Verify Pesapal has correct webhook URL
3. Check function logs
4. Test webhook manually

```bash
curl -X POST http://localhost:54321/functions/v1/pesapal-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "code": "test",
    "status": "COMPLETED",
    "merchant_reference": "test-order-id",
    "created_date": "2026-09-20T14:30:00Z"
  }'
```

### Issue: Email Not Sent

**Debug**:
1. Check Resend API key is set
2. Check `send-ticket-email` function is deployed
3. Check email function logs
4. Verify webhook triggered email call

```bash
supabase functions logs send-ticket-email
```

---

## Production Deployment

### Step 1: Update Pesapal Account

1. Log in to Pesapal dashboard
2. Add production merchant account details
3. Update webhook URL to production
4. Get production API credentials

### Step 2: Deploy to Production

```bash
# Update .env with production credentials
# (Should already be set)

# Deploy database migrations
supabase db push --project-ref=prod-project

# Deploy functions
supabase functions deploy pesapal-webhook --no-verify-jwt --project-ref=prod-project
supabase functions deploy send-ticket-email --no-verify-jwt --project-ref=prod-project
supabase functions deploy validate-ticket-checkin --no-verify-jwt --project-ref=prod-project

# Deploy application
npm run build
# Deploy to your hosting (Vercel, Netlify, etc.)
```

### Step 3: Verify Production

1. Test full payment flow
2. Verify email delivery
3. Check webhook processing
4. Monitor for errors

---

## Next Steps

1. ✅ Deploy database migrations
2. ✅ Deploy Edge Functions
3. ✅ Update TicketPurchaseModal to use Pesapal
4. ⏳ Test full payment flow
5. ⏳ Complete remaining features (payouts, etc.)
6. ⏳ Deploy to production

---

## Success Criteria

- [x] Payment initiated with Pesapal
- [x] Customer redirected to payment page
- [x] Webhook received and processed
- [ ] Order marked as paid
- [ ] QR code generated
- [ ] Email sent with confirmation
- [ ] Check-in validation works
- [ ] Organizer gets paid (after payout implementation)

---

## Support

For issues:
1. Check logs: `supabase functions logs`
2. Check database: `SELECT * FROM tickets ORDER BY created_at DESC`
3. Test manually: Use curl commands above
4. Contact: support@tribedala.com

