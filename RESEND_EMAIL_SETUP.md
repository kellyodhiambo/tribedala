# Resend Email Setup Guide

This guide walks you through setting up Resend for sending ticket confirmation emails.

## Step 1: Create Resend Account

1. Go to https://resend.com
2. Sign up with your email
3. Verify your email address
4. Create a new API key from the dashboard

## Step 2: Configure Supabase Secrets

The `send-ticket-email` Edge Function needs the Resend API key as a secret.

### Via Supabase Dashboard:
1. Open your Supabase project: https://app.supabase.com
2. Go to **Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (starts with `re_`)

### Via Supabase CLI:
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

## Step 3: Deploy the Email Function

Deploy the `send-ticket-email` Edge Function:

```bash
supabase functions deploy send-ticket-email --no-verify-jwt
```

## Step 4: Configure Domain Verification (Production)

In Resend dashboard, add your domain and verify DNS records for production emails.

For testing, you can use the default `onboarding@resend.dev` domain.

## Step 5: Update Email Configuration

In the `send-ticket-email` function (`supabase/functions/send-ticket-email/index.ts`):
- Change `from: 'tickets@tribedala.com'` to your verified Resend domain
- Update `reply_to` if needed

## Step 6: Testing

### Send a Test Email Manually

```bash
curl -X POST http://localhost:54321/functions/v1/send-ticket-email \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "ticket-uuid-here"}'
```

### Full Workflow Test

1. Start the dev server: `npm run dev`
2. Create a test event and ticket type
3. Try purchasing a ticket (this will fail at STK push without PayHero funding, but the order will be created)
4. Update the order status manually:
   ```sql
   UPDATE tickets
   SET payment_status = 'completed'
   WHERE id = 'your-ticket-id';
   ```
5. Call the email function to send the test email

## Troubleshooting

### Email Not Sent
- Check Supabase Edge Function logs: `supabase functions logs send-ticket-email`
- Verify `RESEND_API_KEY` secret is set: `supabase secrets list`
- Confirm email function deployed: Check Supabase dashboard

### "Email service not configured"
- `RESEND_API_KEY` secret is missing or empty
- Re-run: `supabase secrets set RESEND_API_KEY=re_your_api_key`
- Redeploy: `supabase functions deploy send-ticket-email`

### "Failed to send email"
- Check that your Resend domain is verified (if not using `onboarding@resend.dev`)
- Verify recipient email is valid
- Check Resend dashboard for bounced emails

## Email Template Customization

The email template is generated in `src/lib/emailService.ts`:
- `generateTicketEmailHTML()` - HTML email layout
- Customize colors, branding, text as needed
- Updates automatically in the Edge Function

## Resend Pricing

- **Free tier**: 100 emails/day
- **Pro tier**: Pay-per-email (usually $0.0005 per email)

See https://resend.com/pricing for current rates.

## Environment Variables

For local development, add to `.env`:

```env
# Not needed for frontend (API key should never be in frontend)
# Secrets are managed via Supabase CLI
```

## Next Steps

After email setup:
1. Test the full payment + email flow
2. Customize email template with your branding
3. Add SMS delivery (optional, using a service like Twilio)
4. Track email delivery rates in Resend dashboard
