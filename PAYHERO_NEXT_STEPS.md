# PayHero Integration - Next Steps

## 🔴 Current Blocker

**Error**: `STK push failed - merchant has insufficient balance`

**Root Cause**: PayHero merchant account (ID 12340) needs funding to send M-Pesa prompts.

**Resolution**: Fund the merchant account with at least KES 1,000 to test.

---

## What's Complete ✅

We've implemented 4 major features:

1. **✅ Unique Ticket References** (EVT-2026-XXXX-ABCD)
   - Automatically generated for each purchase
   - Human-readable and easy to reference
   - Displayed in UI and emails

2. **✅ QR Code Generation**
   - Generated after payment success
   - Embedded in ticket confirmation emails
   - Can be scanned for check-in validation

3. **✅ Email Delivery System**
   - Beautiful HTML emails with ticket details
   - QR code embedded as image
   - Powered by Resend (professional email service)

4. **✅ Check-In Validation**
   - API endpoint to validate QR codes
   - Prevents duplicate check-ins
   - Logs all check-in attempts for audit trail

---

## What's Left (TODO)

5. **Refine Status Lifecycle** (1 hour)
   - Track: PENDING → PAYMENT_QUEUED → PAID → TICKET_ISSUED → CHECKED_IN
   - Add timestamps for each stage

6. **Organizer Payouts** (3 hours)
   - Calculate revenue minus platform fees
   - Create payout dashboard for organizers
   - Track payout history

---

## To Deploy These Features

### 1. Deploy Database Schema

```bash
# Option A: Via Supabase Dashboard
# Go to SQL Editor → Paste content from:
# → PAYHERO_ARCHITECTURE_IMPROVEMENTS.sql

# Option B: Via CLI
supabase db push
```

### 2. Deploy Edge Functions

```bash
# Deploy updated webhook
supabase functions deploy payhero-webhook --no-verify-jwt

# Deploy email sender
supabase functions deploy send-ticket-email --no-verify-jwt

# Deploy check-in validator
supabase functions deploy validate-ticket-checkin --no-verify-jwt
```

### 3. Install New Dependencies

```bash
npm install
# Installs: qrcode, resend
```

### 4. Configure Email Service (Resend)

```bash
# 1. Create account at https://resend.com
# 2. Copy your API key (starts with re_)
# 3. Set it in Supabase:

supabase secrets set RESEND_API_KEY=re_your_api_key_here

# 4. Verify deployment:
supabase secrets list
```

---

## To Test Full Workflow

Once PayHero account is funded:

### 1. Start Dev Server
```bash
npm run dev
# Opens http://localhost:5173
```

### 2. Create Test Event & Tickets
- Navigate to `/admin/events`
- Create new event or select existing
- Create ticket types (General Admission, VIP, etc.)

### 3. Purchase Ticket
- Go to event page
- Click "Buy Ticket"
- Fill in buyer details
- Complete payment

### 4. Verify Each Step

#### ✅ Step 1: Order Created with Reference
- Check database:
  ```sql
  SELECT id, human_reference, payment_status, status 
  FROM tickets 
  ORDER BY created_at DESC LIMIT 1;
  ```
- Expected: `human_reference` = "EVT-2026-XXXX-ABCD"

#### ✅ Step 2: QR Code Generated
- After payment, you should see QR code in success screen
- Check database:
  ```sql
  SELECT qr_code_data 
  FROM tickets 
  WHERE id = 'ticket-id';
  ```
- Expected: Long base64 string starting with "data:image/png"

#### ✅ Step 3: Email Sent
- Check your email for ticket confirmation
- Verify QR code is embedded in email
- Check database:
  ```sql
  SELECT email_sent_at 
  FROM tickets 
  WHERE id = 'ticket-id';
  ```
- Expected: Timestamp (not NULL)

#### ✅ Step 4: Check-In Validation
- Call the validation endpoint:
  ```bash
  curl -X POST http://localhost:54321/functions/v1/validate-ticket-checkin \
    -H "Content-Type: application/json" \
    -d '{
      "qrData": "{\"tid\":\"ticket-id\",\"ref\":\"EVT-2026-XXXX-ABCD\",\"evt\":\"event-id\"}",
      "checkedInBy": "staff-id",
      "deviceInfo": "Test Device"
    }'
  ```
- Expected: Success response with check-in info

#### ✅ Step 5: Duplicate Check-In Prevention
- Call validation again with same QR code
- Expected: Success but with warning "Already checked in at..."
- Check database:
  ```sql
  SELECT check_in_count, checked_in_at 
  FROM tickets 
  WHERE id = 'ticket-id';
  ```
- Expected: `check_in_count` = 2, `checked_in_at` = first check-in time

---

## Immediate Action Items

### For You (User):

1. **Fund PayHero Account**
   - Log in to PayHero dashboard
   - Add at least KES 1,000 to merchant account 12340
   - Confirm balance shows updated

2. **After Funding**
   - Let me know: "PayHero account funded"
   - I'll help you test the full workflow

### For Me (Once Funded):

1. Help test full payment flow
2. Debug any issues that arise
3. Complete the 2 remaining tasks (status lifecycle, payouts)
4. Prepare for production deployment

---

## File Reference

### Configuration Files
- `PAYHERO_ARCHITECTURE_IMPROVEMENTS.sql` - Database schema
- `PAYHERO_DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `RESEND_EMAIL_SETUP.md` - Email configuration
- `package.json` - Dependencies (qrcode, resend)

### Code Files
- `src/lib/payhero.ts` - Reference generation
- `src/lib/ticketService.ts` - QR code utilities
- `src/lib/emailService.ts` - Email templates
- `src/components/TicketPurchaseModal.tsx` - UI integration
- `supabase/functions/payhero-webhook/index.ts` - Payment webhook
- `supabase/functions/send-ticket-email/index.ts` - Email function
- `supabase/functions/validate-ticket-checkin/index.ts` - Check-in API

---

## Questions?

If you hit any errors:

1. Check logs:
   ```bash
   supabase functions logs payhero-webhook
   supabase functions logs send-ticket-email
   supabase functions logs validate-ticket-checkin
   ```

2. Check database:
   ```sql
   SELECT * FROM tickets ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM check_in_log;
   ```

3. Verify Edge Functions are deployed:
   ```bash
   supabase functions list
   ```

---

## Success Looks Like

After funding PayHero and testing:

```
1. User buys ticket
   ↓
2. Order created with reference EVT-2026-XXXX-ABCD ✅
   ↓
3. M-Pesa prompt sent to phone ✅ (was failing, now works)
   ↓
4. User enters PIN and pays ✅
   ↓
5. Payment confirmed ✅
   ↓
6. QR code generated ✅
   ↓
7. Email sent with QR code ✅
   ↓
8. User scans QR at venue ✅
   ↓
9. Check-in recorded ✅
   ↓
10. Organizer gets paid (minus platform fee) ✅ (TODO after funding)
```

---

## Timeline

- **Now**: Fund PayHero account ⏳
- **After Funding**: Test workflow (~30 min)
- **Complete Remaining Tasks**: Status lifecycle + Payouts (~4 hours)
- **Production Ready**: By end of day

Let me know once you've funded the account!
