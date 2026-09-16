# IntaSend Deployment Checklist

Use this checklist to deploy the IntaSend integration to production.

## Pre-Deployment

- [ ] All code is committed to GitHub
- [ ] Build passes locally: `npm run build`
- [ ] No console errors or warnings
- [ ] Environment variables documented

## IntaSend Setup

- [ ] Created IntaSend business account
- [ ] Verified identity with IntaSend
- [ ] Generated production API keys
- [ ] Tested sandbox credentials locally
- [ ] Configured webhook in IntaSend dashboard
- [ ] Verified webhook delivery logs work

## Environment Configuration

- [ ] Added to production `.env`:
  - [ ] `VITE_PUBLIC_INTASEND_PUBLIC_KEY=<key>`
  - [ ] `VITE_INTASEND_SECRET_KEY=<key>`
- [ ] Added to backend service (Vercel/Netlify):
  - [ ] `SUPABASE_URL=<url>`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=<key>`

## Database Setup

- [ ] Ran `create-tickets-tables.sql` in Supabase SQL Editor
- [ ] Verified `tickets` table created
- [ ] Verified `ticket_orders` table created
- [ ] Verified RLS policies are in place
- [ ] Tested database connections

## Webhook Deployment

- [ ] Deployed webhook handler to chosen platform:
  - [ ] **Vercel**: Deployed `/api/webhooks/intasend.ts`
  - [ ] **Netlify**: Deployed `/.netlify/functions/intasend`
  - [ ] **Supabase**: Deployed Edge Function
  - [ ] **AWS Lambda**: Deployed Lambda function
- [ ] Webhook URL is accessible from public internet
- [ ] SSL/HTTPS is enforced
- [ ] Webhook responds with 200 OK status

## IntaSend Webhook Configuration

- [ ] Logged into IntaSend dashboard
- [ ] Set webhook URL to: `<your-production-url>/api/webhooks/intasend`
- [ ] Set webhook method to: `POST`
- [ ] Set webhook event to: `payment.completed`
- [ ] Tested webhook delivery (send test from dashboard)
- [ ] Verified webhook appears in delivery logs

## Frontend Deployment

- [ ] Built production bundle: `npm run build`
- [ ] Deployed to production hosting:
  - [ ] Vercel
  - [ ] Netlify
  - [ ] GitHub Pages
  - [ ] Custom server
- [ ] Verified all pages load correctly
- [ ] Tested responsive design on mobile

## Testing in Production

- [ ] Created test event in admin
- [ ] Created test ticket in admin
- [ ] Filled out ticket purchase form
- [ ] Completed payment with real M-Pesa number
- [ ] Verified order in `ticket_orders` table
- [ ] Verified `quantity_sold` incremented in `tickets` table
- [ ] Verified payment_status is "completed"
- [ ] Verified IntaSend transaction ID is recorded

## Admin Access

- [ ] Admin can access `/admin/tickets`
- [ ] Admin can create tickets
- [ ] Admin can edit tickets
- [ ] Admin can deactivate tickets
- [ ] Admin can view sales data
- [ ] Admin can see revenue totals

## Event Page Testing

- [ ] Event detail page loads correctly
- [ ] Tickets are displayed with correct prices
- [ ] "Continue to Payment" button works
- [ ] Redirects to IntaSend payment page
- [ ] After payment, redirects back to event page
- [ ] Ticket quantity_sold updates after payment

## Monitoring

- [ ] Set up error logging (Sentry, DataDog, etc.)
- [ ] Set up payment success alerts
- [ ] Monitor webhook delivery failures
- [ ] Set up regular database backups
- [ ] Monitor Supabase usage metrics

## Performance

- [ ] Page load time < 3 seconds
- [ ] Payment page load time < 2 seconds
- [ ] Admin dashboard loads all data quickly
- [ ] No N+1 query problems
- [ ] Images are optimized
- [ ] CDN configured for static assets

## Security

- [ ] API keys are never logged
- [ ] All API calls use HTTPS
- [ ] RLS policies are enforced
- [ ] Webhook signature validation implemented
- [ ] Rate limiting configured
- [ ] CORS headers configured correctly
- [ ] No sensitive data in error messages

## Documentation

- [ ] Updated README with IntaSend info
- [ ] Created user guide for admins
- [ ] Created user guide for customers
- [ ] Added troubleshooting section
- [ ] Updated API documentation
- [ ] Added deployment notes

## Post-Deployment

- [ ] Monitor payment success rate (target: >95%)
- [ ] Monitor webhook delivery rate (target: 100%)
- [ ] Set up daily revenue reports
- [ ] Set up backup email notifications
- [ ] Schedule weekly production review
- [ ] Plan Phase 2 features

## Rollback Plan

- [ ] Documented current deployment state
- [ ] Have backup of previous version
- [ ] Know how to quickly revert if needed
- [ ] Have IntaSend support contact info
- [ ] Have Supabase backup procedures

## Sign-Off

- [ ] Product Manager: ___________  Date: ______
- [ ] Lead Developer: ___________  Date: ______
- [ ] DevOps/Infrastructure: ___________  Date: ______

---

## Common Issues & Fixes

### Webhook not firing
- [ ] Check IntaSend dashboard webhook delivery logs
- [ ] Verify webhook URL is publicly accessible
- [ ] Ensure HTTPS/SSL is working
- [ ] Test webhook manually from IntaSend dashboard

### Payments showing as "pending"
- [ ] Verify webhook is configured correctly
- [ ] Check Supabase service role key is correct
- [ ] Review webhook handler logs
- [ ] Manually test webhook handler

### Tickets not updating after payment
- [ ] Check RLS policies on `tickets` table
- [ ] Verify service role key has write access
- [ ] Test database connection from webhook handler
- [ ] Review webhook handler logs

### Payment page not loading
- [ ] Verify IntaSend API keys are correct
- [ ] Check IntaSend is enabled for your account
- [ ] Test payment initiation locally
- [ ] Check browser console for errors

---

**Last Updated**: August 30, 2026
**Status**: Ready for Production 🚀
