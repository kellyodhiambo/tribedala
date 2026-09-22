# PayHero M-Pesa Integration - Deployment Checklist

## Overview
4 of 7 architectural improvements completed. Ready for testing once PayHero merchant account is funded.

---

## Phase 1: Database Schema ✅

- [x] Create `human_reference` column on tickets
- [x] Create `qr_code_data` and `qr_code_url` columns
- [x] Create timestamp columns: `payment_queued_at`, `payment_completed_at`, `ticket_issued_at`
- [x] Create `checked_in_at` and `check_in_count` columns
- [x] Create `email_sent_at` column
- [x] Create `payhero_callback_payload` JSONB column
- [x] Create `organizer_id`, `platform_fee_amount`, `net_payout_amount` columns
- [x] Create `check_in_log` table for audit trail
- [x] Create `payout_calculations` table
- [x] Create RLS policies for new tables
- [x] Create `calculate_event_payout()` function

**File**: `PAYHERO_ARCHITECTURE_IMPROVEMENTS.sql`

**Status**: Ready to deploy

---

## Phase 2: Frontend Components ✅

- [x] Generate unique ticket references (EVT-2026-XXXX-ABCD)
- [x] Generate QR codes for tickets
- [x] Display QR code in success screen
- [x] Store QR code in database
- [x] Display ticket reference in success screen

**Files**: 
- `src/lib/payhero.ts` - Reference generation
- `src/lib/ticketService.ts` - QR code utilities
- `src/components/TicketPurchaseModal.tsx` - QR display

**Status**: Ready to deploy

---

## Phase 3: Email Delivery ✅

- [x] Create email template with QR code
- [x] Create Resend Edge Function
- [x] Integrate email sending into webhook
- [x] Track email send status

**Files**:
- `src/lib/emailService.ts` - Email template
- `supabase/functions/send-ticket-email/index.ts` - Email function
- `RESEND_EMAIL_SETUP.md` - Setup guide

**Setup Required**:
```bash
# 1. Create Resend account: https://resend.com
# 2. Get API key
# 3. Set Supabase secret:
supabase secrets set RESEND_API_KEY=re_your_api_key

# 4. Deploy function:
supabase functions deploy send-ticket-email --no-verify-jwt
```

**Status**: Ready to deploy (requires Resend API key)

---

## Phase 4: Check-In Validation ✅

- [x] Create check-in validation Edge Function
- [x] Validate QR code format and contents
- [x] Prevent duplicate check-ins
- [x] Log check-ins to audit trail
- [x] Return detailed check-in info

**File**: `supabase/functions/validate-ticket-checkin/index.ts`

**Deploy**:
```bash
supabase functions deploy validate-ticket-checkin --no-verify-jwt
```

**API Endpoint**: `POST /functions/v1/validate-ticket-checkin`

**Status**: Ready to deploy

---

## Phase 5: Enhanced Status Lifecycle (TODO)

**Current**: pending → paid → checked_in

**Proposed**: pending → payment_queued → paid → ticket_issued → checked_in

**Changes needed**:
- [ ] Update webhook to set `payment_queued_at` when STK initiated
- [ ] Update webhook to set `payment_completed_at` when M-Pesa succeeds
- [ ] Update webhook to set `ticket_issued_at` when QR generated
- [ ] Update modal to reflect status in UI
- [ ] Create status badge component

**Estimated Time**: 1 hour

---

## Phase 6: Payout Calculations (TODO)

**Database**: Already created (`payout_calculations` table + RPC function)

**Changes needed**:
- [ ] Create organizer payout dashboard page
- [ ] Implement payout calculation logic
- [ ] Add payout history view
- [ ] Create payout processing workflow

**Estimated Time**: 3 hours

---

## Dependencies

### Added to package.json:
```json
{
  "qrcode": "^1.5.4",
  "resend": "^4.0.0"
}
```

### Install:
```bash
npm install
```

---

## Pre-Deployment Checks

### 1. Database Migration
```bash
# Check schema changes
supabase db diff

# Apply migrations
supabase db push
```

**File to run**: `PAYHERO_ARCHITECTURE_IMPROVEMENTS.sql`

### 2. Edge Functions
```bash
# Deploy all functions
supabase functions deploy payhero-webhook --no-verify-jwt
supabase functions deploy send-ticket-email --no-verify-jwt
supabase functions deploy validate-ticket-checkin --no-verify-jwt
```

### 3. Dependencies
```bash
npm install
npm run build
```

### 4. Environment Variables
Required secrets in Supabase:
```
RESEND_API_KEY      → Your Resend API key
```

---

## Testing Workflow

### Test 1: Reference Generation
```typescript
import { generateTicketReference } from '@/lib/payhero';

const ref = generateTicketReference();
console.log(ref); // EVT-2026-0123-ABC4
```

### Test 2: QR Code Generation
```typescript
import { generateQRCode } from '@/lib/ticketService';

const qrData = await generateQRCode({
  ticketId: 'uuid',
  humanReference: 'EVT-2026-0123-ABC4',
  eventId: 'event-uuid',
  eventName: 'Test Event',
  buyerName: 'John Doe',
  buyerEmail: 'john@example.com',
  tier: 'VIP',
  quantity: 2,
  issuedAt: new Date().toISOString(),
});
```

### Test 3: Email Template
```typescript
import { generateTicketEmailHTML } from '@/lib/emailService';

const html = generateTicketEmailHTML({
  buyerName: 'John Doe',
  buyerEmail: 'john@example.com',
  eventName: 'Test Event',
  ticketTier: 'VIP',
  quantity: 2,
  totalPrice: 3000,
  humanReference: 'EVT-2026-0123-ABC4',
  qrCodeDataUrl: 'data:image/png;base64,...',
});
```

### Test 4: Check-In Validation
```bash
curl -X POST http://localhost:54321/functions/v1/validate-ticket-checkin \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "{\"tid\":\"...\",\"ref\":\"EVT-2026-0123-ABC4\",\"evt\":\"...\"}",
    "checkedInBy": "staff-user-id",
    "deviceInfo": "iPhone 15 Pro"
  }'
```

### Test 5: Full Workflow (After PayHero Funding)
1. Start dev server: `npm run dev`
2. Navigate to event page
3. Click "Buy Ticket"
4. Fill in ticket form
5. Complete M-Pesa payment
6. Verify:
   - ✅ Order created with human reference
   - ✅ QR code displayed on success screen
   - ✅ Ticket email received with QR code
   - ✅ Validate QR code at check-in endpoint

---

## Deployment to Production

### Step 1: Test on Staging
```bash
npm run build
# Deploy to staging environment
```

### Step 2: Database Migrations
- Run SQL on production database
- Verify schema changes
- Check RLS policies

### Step 3: Deploy Edge Functions
```bash
supabase functions deploy payhero-webhook --no-verify-jwt --project-ref=prod-ref
supabase functions deploy send-ticket-email --no-verify-jwt --project-ref=prod-ref
supabase functions deploy validate-ticket-checkin --no-verify-jwt --project-ref=prod-ref
```

### Step 4: Set Secrets
```bash
supabase secrets set RESEND_API_KEY=re_prod_api_key --project-ref=prod-ref
```

### Step 5: Verify Deployment
- Test ticket purchase flow
- Verify email delivery
- Test check-in validation
- Monitor logs for errors

---

## Current Blocker

**Issue**: PayHero merchant account (ID 12340) has insufficient balance

**Resolution**:
1. Log into PayHero dashboard
2. Add funds to merchant account
3. Once funded, STK push will succeed

**Once Funded**: All tests can proceed

---

## Success Criteria

- [x] Unique ticket references generated (EVT-YYYY-XXXX-ABCD format)
- [x] QR codes generated and stored
- [x] QR codes displayed in success screen and email
- [x] Email delivery system integrated
- [x] Check-in validation prevents duplicates
- [ ] Full payment flow tested end-to-end
- [ ] Organizer payouts calculated correctly
- [ ] Production deployment successful

---

## Support Files

- `PAYHERO_ARCHITECTURE_IMPROVEMENTS.sql` - Database schema
- `RESEND_EMAIL_SETUP.md` - Email configuration
- `src/lib/payhero.ts` - PayHero service
- `src/lib/ticketService.ts` - Ticket utilities
- `src/lib/emailService.ts` - Email generation
- `src/components/TicketPurchaseModal.tsx` - UI integration
- `supabase/functions/payhero-webhook/index.ts` - Payment webhook
- `supabase/functions/send-ticket-email/index.ts` - Email function
- `supabase/functions/validate-ticket-checkin/index.ts` - Check-in validation

---

## Next Actions

### Immediate (Before Funding):
1. ✅ Deploy database schema
2. ✅ Deploy Edge Functions
3. ✅ Install dependencies
4. ✅ Configure Resend

### After PayHero Funding:
1. Test full payment flow
2. Verify email delivery
3. Test QR code generation
4. Complete status lifecycle refinement
5. Implement payout calculations
6. Deploy to production

---

## Timeline

- **Phase 1-4**: ✅ Complete (2-3 hours completed)
- **Phase 5**: ⏳ 1 hour (status lifecycle)
- **Phase 6**: ⏳ 3 hours (payouts)
- **Testing**: ⏳ 2 hours (after funding)
- **Production**: ⏳ 1 hour (deployment)

**Total Remaining**: ~7 hours (after PayHero funding)

---

## Questions?

Refer to:
- `PAYHERO_ARCHITECTURE_IMPROVEMENTS.md` - Implementation summary
- `RESEND_EMAIL_SETUP.md` - Email setup details
- Code comments in source files
