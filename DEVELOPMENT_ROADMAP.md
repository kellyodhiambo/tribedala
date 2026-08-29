# TribeDala Development Roadmap

**Project Status**: ~80% database-connected, needs payment integration & SEO optimization

---

## 🎯 PHASE 1: CRITICAL FIXES (Week 1-2)

### 1.1 Fix Login/Auth Flow [BLOCKING]
**Status**: ❌ BROKEN - "Failed to fetch" on admin login
**Impact**: Cannot access admin dashboard or user features
**Tasks**:
- [ ] Fix RLS policies on `users` table (infinite recursion error)
- [ ] Test login with proper error handling
- [ ] Verify profile fetch after authentication
- [ ] Enable RLS again with correct policies

**Files to Fix**:
- `src/hooks/AuthContext.tsx` - Profile fetch error handling
- Supabase RLS policies - Remove infinite recursion

**Estimated Time**: 2-3 hours

---

### 1.2 Complete Contact Form Database Integration
**Status**: ❌ NOT IMPLEMENTED
**Impact**: Contact requests are lost, no lead capture
**What's Missing**:
- No database submission in contact form
- No email notification on submission
- No admin interface to view inquiries

**Implementation**:
```sql
-- Create inquiries table
CREATE TABLE public.inquiries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' ('new', 'contacted', 'resolved'),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**Code Changes**:
```typescript
// src/pages/contact/page.tsx - Add this to handleSubmit()
const { error } = await supabase
  .from('inquiries')
  .insert([{ name, email, phone, subject, message }]);
```

**Files to Update**:
- `src/pages/contact/page.tsx` - Add form submission
- `src/lib/queries.ts` - Add `getInquiries()` function
- `src/pages/admin/content/page.tsx` - OR create new `/admin/inquiries` page

**Estimated Time**: 1-2 hours

---

### 1.3 Complete Dashboard Profile Save Handler
**Status**: ⚠️ INCOMPLETE - Form validates but doesn't save
**Impact**: Users cannot update their profiles
**Current Code**:
```typescript
const handleSave = async () => {
  // Empty function - does nothing!
};
```

**Implementation**:
```typescript
const handleSave = async () => {
  setLoading(true);
  const { error } = await supabase
    .from('users')
    .update({
      full_name: formData.full_name,
      bio: formData.bio,
      location: formData.location,
      social_links: formData.social_links,
      portfolio_links: formData.portfolio_links,
      notification_email: formData.notification_email,
      notification_inapp: formData.notification_inapp,
      privacy_profile_visible: formData.privacy_profile_visible,
      privacy_allow_messages: formData.privacy_allow_messages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) showError(error.message);
  else showSuccess('Profile updated successfully');
  setLoading(false);
};
```

**Files to Update**:
- `src/pages/dashboard/profile/page.tsx` - Complete handleSave function
- Add success/error toast notifications

**Estimated Time**: 1 hour

---

### 1.4 Fix Admin Content Management Query
**Status**: ❌ WRONG TABLE - Queries non-existent table
**Impact**: Admin content management broken
**Current Issue**:
```typescript
// Wrong - table doesn't exist
const { data } = await supabase.from('content').select('*');
```

**Should Be**:
```typescript
// Query from actual tables
const [episodes, posts] = await Promise.all([
  supabase.from('episodes').select('*'),
  supabase.from('blog_posts').select('*'),
]);
```

**Files to Fix**:
- `src/pages/admin/content/page.tsx` - Fix query to use episodes + blog_posts

**Estimated Time**: 1 hour

---

## 💳 PHASE 2: PAYMENT INTEGRATION (Week 3-4)

### 2.1 M-Pesa Payment Gateway Setup
**Status**: ❌ NOT IMPLEMENTED
**Impact**: Cannot sell event tickets
**Priority**: CRITICAL (Revenue blocker)

**Steps**:

#### A. Setup M-Pesa Daraja Account
- [ ] Register at https://developer.safaricom.co.ke/
- [ ] Get Consumer Key & Consumer Secret
- [ ] Get Shortcode, Passkey, Phone (for STK)

#### B. Install Dependencies
```bash
npm install axios dotenv
```

#### C. Create Payment Service
**File**: `src/lib/mpesaService.ts`
```typescript
import axios from 'axios';

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
  accountReference: string;
  description: string;
}

export const mpesaService = {
  async getAccessToken() {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');
    
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    return response.data.access_token;
  },

  async initiateStkPush(request: STKPushRequest) {
    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: request.amount,
        PartyA: request.phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: request.phoneNumber,
        CallBackURL: `${process.env.VITE_APP_URL}/api/mpesa/callback`,
        AccountReference: request.accountReference,
        TransactionDesc: request.description,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  },
};
```

#### D. Create Payments Table
```sql
CREATE TABLE public.payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id),
  event_id uuid NOT NULL REFERENCES public.events(id),
  amount decimal(10, 2) NOT NULL,
  phone_number text NOT NULL,
  mpesa_request_id text,
  mpesa_checkout_request_id text,
  status text DEFAULT 'initiated' ('initiated', 'pending', 'completed', 'failed'),
  error_message text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  completed_at timestamp
);

CREATE TABLE public.tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id),
  event_id uuid NOT NULL REFERENCES public.events(id),
  payment_id uuid REFERENCES public.payments(id),
  tier_name text NOT NULL,
  price integer NOT NULL,
  quantity integer DEFAULT 1,
  qr_code text,
  status text DEFAULT 'active' ('active', 'used', 'cancelled'),
  created_at timestamp DEFAULT now()
);
```

#### E. Wire into Event Checkout Modal
**File**: `src/pages/events/detail/page.tsx`
```typescript
const handlePayment = async () => {
  const response = await mpesaService.initiateStkPush({
    phoneNumber: userPhone.replace(/\D/g, ''),
    amount: totalAmount,
    orderId: event.id,
    accountReference: `EVENT_${event.id}_${Date.now()}`,
    description: `Tickets: ${event.title}`,
  });

  if (response.ResponseCode === '0') {
    // Save payment to database
    const { data: payment } = await supabase
      .from('payments')
      .insert([{
        user_id: user.id,
        event_id: event.id,
        amount: totalAmount,
        phone_number: userPhone,
        mpesa_checkout_request_id: response.CheckoutRequestID,
        status: 'pending',
      }])
      .select()
      .single();

    // Poll for payment confirmation
    pollPaymentStatus(payment.id);
  }
};

const pollPaymentStatus = (paymentId: string) => {
  const interval = setInterval(async () => {
    const { data: payment } = await supabase
      .from('payments')
      .select('status')
      .eq('id', paymentId)
      .single();

    if (payment?.status === 'completed') {
      clearInterval(interval);
      showSuccess('Payment received! Tickets sent to your email.');
      // Generate and send tickets
    } else if (payment?.status === 'failed') {
      clearInterval(interval);
      showError('Payment failed. Please try again.');
    }
  }, 3000); // Check every 3 seconds, max 60 seconds
};
```

#### F. Create Webhook Endpoint
**File**: `src/api/mpesa-callback.ts` (requires backend/serverless function)
```typescript
// Handle M-Pesa callback
export default async function handler(req, res) {
  const body = req.body.Body.stkCallback;
  
  if (body.ResultCode === 0) {
    // Payment successful - update database
    await supabase
      .from('payments')
      .update({ status: 'completed', completed_at: new Date() })
      .eq('mpesa_checkout_request_id', body.CheckoutRequestID);

    // Generate tickets
    await generateTickets(paymentId);
    
    // Send email with tickets
    await sendTicketEmail(user.email, tickets);
  } else {
    // Payment failed
    await supabase
      .from('payments')
      .update({ 
        status: 'failed',
        error_message: body.ResultDesc
      })
      .eq('mpesa_checkout_request_id', body.CheckoutRequestID);
  }
  
  res.json({ ResultCode: 0 });
}
```

#### G. Environment Variables
**Update `.env`**:
```
VITE_MPESA_SHORTCODE=your_shortcode
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
VITE_APP_URL=http://localhost:5173
```

**Files to Create/Update**:
- `src/lib/mpesaService.ts` - NEW
- `src/pages/events/detail/page.tsx` - Add payment handler
- `src/lib/queries.ts` - Add `getPayments()`, `updatePayment()`
- `.env` - Add M-Pesa credentials
- Database migration - Create payments + tickets tables
- API endpoint - For webhook callback (Netlify function or Vercel)

**Estimated Time**: 8-10 hours

---

### 2.2 Ticket Generation & Delivery
**Status**: ❌ NOT IMPLEMENTED
**Tasks**:
- [ ] Generate QR codes for tickets (use `qrcode` npm package)
- [ ] Create ticket PDF template
- [ ] Send email with PDF attachment (use SendGrid or Resend)
- [ ] Store ticket QR in database

**Dependencies**:
```bash
npm install qrcode pdfkit resend
```

**Files to Create**:
- `src/lib/ticketService.ts` - QR + PDF generation
- `src/lib/emailService.ts` - Email sending

**Estimated Time**: 4-6 hours

---

## 🔍 PHASE 3: SEO OPTIMIZATION (Week 5)

### 3.1 Meta Tags & Open Graph
**Status**: ❌ MINIMAL IMPLEMENTATION
**Impact**: Poor search ranking, bad social sharing

**Tasks**:
- [ ] Create `src/utils/seoHelpers.ts` for dynamic meta tags
- [ ] Update blog detail page with og:, twitter:, schema.org tags
- [ ] Update event detail pages
- [ ] Update creator profile pages

**File**: `src/utils/seoHelpers.ts` - NEW
```typescript
export function updateMetaTags(config: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedDate?: string;
}) {
  // Update document title
  document.title = `${config.title} | TribeDala`;

  // Helper to set meta tag
  const setMeta = (name: string, content: string) => {
    let element = document.querySelector(`meta[name="${name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  const setOG = (property: string, content: string) => {
    let element = document.querySelector(`meta[property="${property}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', property);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Basic meta
  setMeta('description', config.description);
  setMeta('viewport', 'width=device-width, initial-scale=1');

  // Open Graph
  setOG('og:title', config.title);
  setOG('og:description', config.description);
  if (config.image) setOG('og:image', config.image);
  if (config.url) setOG('og:url', config.url);
  setOG('og:type', config.type || 'website');

  // Twitter Card
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', config.title);
  setMeta('twitter:description', config.description);
  if (config.image) setMeta('twitter:image', config.image);

  // Schema.org JSON-LD
  if (config.type === 'article') {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: config.title,
      description: config.description,
      image: config.image,
      author: { '@type': 'Person', name: config.author },
      datePublished: config.publishedDate,
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
```

**Usage Example** (Blog Detail Page):
```typescript
useEffect(() => {
  updateMetaTags({
    title: post.title,
    description: post.excerpt,
    image: post.cover_image,
    type: 'article',
    author: post.author?.full_name,
    publishedDate: post.published_at,
  });
}, [post]);
```

**Estimated Time**: 3-4 hours

---

### 3.2 Sitemap & Robots.txt
**Status**: ❌ NOT CREATED
**Tasks**:
- [ ] Create `/public/robots.txt`
- [ ] Generate `/public/sitemap.xml` dynamically
- [ ] Add canonical URLs to pages

**File**: `/public/robots.txt` - NEW
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/

Sitemap: https://tribedala.com/sitemap.xml
```

**File**: `src/lib/sitemapGenerator.ts` - NEW (generate at build time)
```typescript
export async function generateSitemap() {
  const baseUrl = 'https://tribedala.com';
  
  // Get all dynamic content
  const [blogs, events, creators, shows] = await Promise.all([
    supabase.from('blog_posts').select('slug, updated_at'),
    supabase.from('events').select('slug, updated_at'),
    supabase.from('users').select('full_name, updated_at').eq('role', 'creator'),
    supabase.from('shows').select('slug, updated_at'),
  ]);

  const urls = [
    // Static pages
    { loc: baseUrl, priority: 1.0, changefreq: 'weekly' },
    { loc: `${baseUrl}/about`, priority: 0.8, changefreq: 'monthly' },
    { loc: `${baseUrl}/creators`, priority: 0.9, changefreq: 'daily' },
    { loc: `${baseUrl}/events`, priority: 0.9, changefreq: 'daily' },
    { loc: `${baseUrl}/blog`, priority: 0.8, changefreq: 'daily' },

    // Dynamic pages
    ...blogs.data.map(p => ({
      loc: `${baseUrl}/blog/${p.slug}`,
      lastmod: p.updated_at,
      priority: 0.7,
      changefreq: 'monthly',
    })),
    ...events.data.map(e => ({
      loc: `${baseUrl}/events/${e.slug}`,
      lastmod: e.updated_at,
      priority: 0.8,
      changefreq: 'weekly',
    })),
    ...creators.data.map(c => ({
      loc: `${baseUrl}/creators/${c.full_name.replace(/ /g, '-')}`,
      lastmod: c.updated_at,
      priority: 0.7,
      changefreq: 'monthly',
    })),
  ];

  return generateXml(urls);
}
```

**Estimated Time**: 2-3 hours

---

### 3.3 Structured Data (Schema.org)
**Status**: ❌ NOT IMPLEMENTED
**Tasks**:
- [ ] Add Event schema to event pages
- [ ] Add Organization schema to homepage
- [ ] Add Person schema to creator profiles
- [ ] Add BreadcrumbList for navigation

**Estimated Time**: 3-4 hours

---

## 📱 PHASE 4: FEATURE COMPLETENESS (Week 6-7)

### 4.1 Real-time Notifications
**Status**: ⚠️ DATABASE ONLY
**What's Missing**: No subscriptions to notification table

**Implementation**:
```typescript
// In AuthContext useEffect
const notificationSubscription = supabase
  .from('notifications')
  .on('INSERT', (payload) => {
    // Add to notifications list
    setNotifications(prev => [payload.new, ...prev]);
    // Show toast
    showNotification(payload.new.title);
  })
  .subscribe();

return () => {
  supabase.removeSubscription(notificationSubscription);
};
```

**Estimated Time**: 2 hours

---

### 4.2 Blog Comments Display & Submission
**Status**: ⚠️ DATABASE ONLY
**What's Missing**: 
- Comments not fetched on blog detail page
- No comment submission form
- No comment reply threading

**Implementation**:
```typescript
// Blog Detail Page
useEffect(() => {
  const fetchComments = async () => {
    const comments = await getBlogComments(post.id);
    setComments(comments);
  };
  fetchComments();
}, [post.id]);

const handleCommentSubmit = async (content: string) => {
  const { error } = await supabase
    .from('blog_comments')
    .insert([{
      post_id: post.id,
      user_id: user.id,
      content: content,
    }]);

  if (!error) {
    setComments(prev => [...prev, newComment]);
  }
};
```

**Estimated Time**: 3 hours

---

### 4.3 File Upload Infrastructure
**Status**: ⚠️ PARTIAL (Avatar only)
**What's Missing**:
- Episode audio/video uploads
- Blog cover image uploads
- Event cover image uploads
- Podcast/video player

**Implementation**:
```typescript
// Create storage buckets
const createBuckets = async () => {
  const buckets = ['episodes', 'blog-covers', 'event-covers'];
  
  for (const bucket of buckets) {
    await supabase.storage.createBucket(bucket, { public: true });
  }
};

// Upload handler (reusable)
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  
  if (!error) {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
  throw error;
};
```

**Estimated Time**: 4-5 hours

---

### 4.4 Podcast/Video Player
**Status**: ❌ NOT IMPLEMENTED
**Tasks**:
- [ ] Integrate Plyr.io or react-player
- [ ] Create responsive player component
- [ ] Add playlist support
- [ ] Add episode progress tracking

**Dependencies**:
```bash
npm install react-player
```

**Estimated Time**: 3-4 hours

---

## 🛡️ PHASE 5: SECURITY & PERFORMANCE (Week 8)

### 5.1 Fix RLS Policies (URGENT)
- [ ] Remove infinite recursion in user policies
- [ ] Implement proper admin role checks
- [ ] Add insert-only policies for forms

**Estimated Time**: 2-3 hours

### 5.2 Add Error Boundaries
- [ ] Create React error boundary component
- [ ] Wrap main routes
- [ ] Add error recovery UI

**Estimated Time**: 2 hours

### 5.3 Rate Limiting & Validation
- [ ] Server-side form validation
- [ ] Rate limit API calls
- [ ] CSRF token implementation

**Estimated Time**: 3 hours

### 5.4 Performance Optimization
- [ ] Image optimization (next/image equivalent)
- [ ] Code splitting for routes
- [ ] Lazy load components
- [ ] Cache management

**Estimated Time**: 4 hours

---

## 📊 PHASE 6: ANALYTICS & MONITORING (Week 9)

### 6.1 Google Analytics Integration
**Tasks**:
```bash
npm install @react-router-dom/analytics
```

**Estimated Time**: 2 hours

### 6.2 Admin Analytics Dashboard
- [ ] User growth charts
- [ ] Event attendance stats
- [ ] Revenue tracking
- [ ] Content performance

**Estimated Time**: 4-5 hours

---

## 🧪 TESTING STRATEGY

### Unit Tests (Jest)
- RLS policy validation
- Payment service functions
- SEO helper functions

### Integration Tests (Playwright)
- Login flow
- Payment flow
- Form submissions

### E2E Tests (Cypress)
- Complete user journey (signup → event attendance)
- Admin workflow
- Payment processing

---

## 📈 SUCCESS METRICS

| Metric | Target | Current |
|--------|--------|---------|
| **Page Load Time** | <3s | Unknown |
| **SEO Score** | >90 | ~40 |
| **Payment Conversion** | >2% | N/A (not live) |
| **User Retention** | >40% | Unknown |
| **Mobile Traffic** | >60% | Unknown |
| **Error Rate** | <0.1% | Unknown |

---

## 📋 IMPLEMENTATION CHECKLIST

### Week 1-2: Critical Fixes
- [ ] Fix auth/login flow
- [ ] Complete contact form DB integration
- [ ] Complete profile save handler
- [ ] Fix admin content query

### Week 3-4: Payments
- [ ] M-Pesa setup complete
- [ ] Ticket generation working
- [ ] Email delivery tested
- [ ] Payment flow end-to-end tested

### Week 5: SEO
- [ ] Meta tags implemented
- [ ] Sitemap generated
- [ ] Schema.org markup added
- [ ] robots.txt created

### Week 6-7: Features
- [ ] Real-time notifications live
- [ ] Blog comments working
- [ ] File uploads complete
- [ ] Media player implemented

### Week 8: Security
- [ ] RLS policies fixed
- [ ] Error boundaries added
- [ ] Input validation server-side
- [ ] Performance optimized

### Week 9: Analytics
- [ ] Google Analytics integrated
- [ ] Admin analytics dashboard built
- [ ] Monitoring alerts configured

---

## 💰 ESTIMATED EFFORT

| Phase | Hours | Priority |
|-------|-------|----------|
| Phase 1: Critical Fixes | 5 | 🔴 URGENT |
| Phase 2: Payment Integration | 18 | 🔴 CRITICAL |
| Phase 3: SEO | 12 | 🟡 HIGH |
| Phase 4: Features | 17 | 🟡 HIGH |
| Phase 5: Security | 11 | 🟡 MEDIUM |
| Phase 6: Analytics | 6 | 🟢 LOW |
| **TOTAL** | **69 hours** | |

**Timeline**: 9 weeks if working 8 hours/day, 5 days/week

---

## 🎓 NOTES

- **Admin User Created**: amor@tribedala.com (8aaca027-9291-40f3-92ce-bd58552bb703) ✅
- **Supabase Project**: https://prllmmcscqlsiezgaqrb.supabase.co
- **Main Issues**: RLS policies, missing payment integration, incomplete forms, minimal SEO
- **Biggest Revenue Impact**: Payment integration (blocks ticket sales)
- **Biggest UX Impact**: Login flow fix (blocks all access)
- **Biggest SEO Impact**: Meta tags + structured data (improves discovery)

