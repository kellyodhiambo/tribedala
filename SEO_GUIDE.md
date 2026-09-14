# TribeDala SEO Implementation Guide

## Overview

This guide explains the SEO infrastructure set up for TribeDala to ensure maximum search engine visibility and discoverability.

## Files Created

### 1. **sitemap.xml** (`/public/sitemap.xml`)
Static XML sitemap with all major pages and routes.

**Coverage:**
- Homepage
- Main navigation pages (about, team, services, contact, etc.)
- Show sections (podcast, interview, girlies)
- Legal pages (privacy, terms)
- Authentication pages (low priority)

**Priorities:**
- Homepage: 1.0 (highest)
- Main content sections: 0.85-0.95
- Support pages: 0.5-0.8
- Auth pages: 0.3 (minimal)

### 2. **robots.txt** (`/public/robots.txt`)
Instructions for search engine crawlers.

**Allows:**
- All public routes for crawling
- Main content areas: blog, events, creators, shows

**Disallows:**
- `/dashboard/` - Protected user area
- `/admin/` - Admin panel
- `/auth/` - Authentication routes
- Environment and log files

**Crawl Delay:** 1 second (be nice to servers)

### 3. **Dynamic Sitemap Generator** (`/scripts/generate-sitemap.mjs`)
Automatically generates sitemap with blog posts, events, and creators from Supabase.

**Usage:**
```bash
# Run manually
npm run build:sitemap

# Automatically runs on build
npm run build
```

**Output:** Updates `/public/sitemap.xml` with:
- Blog posts (published only)
- Active events
- Creator profiles
- Updated timestamps and priorities

**Priorities by Content Type:**
- Blog posts: 0.8
- Upcoming events: 0.85
- Past events: 0.7
- Creators: 0.7

### 4. **SEO Utilities Library** (`/src/lib/seo.ts`)
TypeScript utilities for managing meta tags and structured data.

**Features:**
- Dynamic meta tag updates
- Page-specific SEO configuration
- Content-specific SEO generators:
  - `createBlogPostSEO()`
  - `createEventSEO()`
  - `createCreatorSEO()`
  - `createEpisodeSEO()`
- JSON-LD structured data generation

**Usage Example:**
```typescript
import { updateMetaTags, createBlogPostSEO, SEO_CONFIG } from '@/lib/seo';

// For blog posts
const blogPost = { /* blog data */ };
updateMetaTags(createBlogPostSEO(blogPost));

// For static pages
updateMetaTags(SEO_CONFIG.about);
```

## Implementation Checklist

### ✅ Completed
- [x] sitemap.xml created with all public routes
- [x] robots.txt configured
- [x] Dynamic sitemap generator script
- [x] SEO utilities library
- [x] Build process integration (postbuild hook)
- [x] Environment variables configured

### ⏳ Next Steps

#### 1. **Update index.html with Meta Tags**
Add these to `index.html` in the `<head>`:
```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="Join TribeDala: a community platform for African creators, bloggers, and storytellers." />
<meta name="keywords" content="African creators, podcast, content community" />
<meta name="robots" content="index, follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="TribeDala" />
<meta property="og:image" content="https://tribedala.com/og-image.jpg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@tribedala" />

<!-- Canonical (updated per page) -->
<link rel="canonical" href="https://tribedala.com/" />
```

#### 2. **Integrate SEO in Page Components**
Add to top-level route components:
```typescript
import { useEffect } from 'react';
import { updateMetaTags, SEO_CONFIG } from '@/lib/seo';

export default function AboutPage() {
  useEffect(() => {
    updateMetaTags({
      ...SEO_CONFIG.about,
      canonicalUrl: 'https://tribedala.com/about',
    });
  }, []);

  return (/* page content */);
}
```

#### 3. **Submit to Search Engines**
- **Google Search Console:** https://search.google.com/search-console
  - Add property: https://tribedala.com
  - Submit sitemap: https://tribedala.com/sitemap.xml
  
- **Bing Webmaster Tools:** https://www.bing.com/webmasters
  - Submit sitemap same way

#### 4. **Add Structured Data**
Include JSON-LD in components using `generateOrganizationSchema()`:
```typescript
import { generateOrganizationSchema } from '@/lib/seo';

export default function Home() {
  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(generateOrganizationSchema())}
      </script>
      {/* page content */}
    </>
  );
}
```

#### 5. **Optimize Images**
- Add descriptive alt text to all images
- Use WebP format with fallbacks
- Compress images for faster loading
- Include `cover_image` URLs in blog/event posts

#### 6. **Monitor Performance**
- Google Analytics: Track user behavior
- Google Search Console: Monitor indexing and search performance
- Page Speed Insights: Monitor Core Web Vitals
- Monitor sitemap health: 0 errors, all URLs valid

## SEO Best Practices

### Content
- **Blog Posts:**
  - Minimum 300 words
  - Include focus keyword in title
  - Use descriptive slugs
  - Add cover images

- **Events:**
  - Clear title and description
  - Include date and location
  - Add event image
  - Mark past events appropriately

- **Creator Profiles:**
  - Complete bio information
  - Professional profile picture
  - Link to social media

### Technical
- **Page Load Speed:** Target <3 seconds
- **Mobile Responsiveness:** Mobile-first design
- **SSL/HTTPS:** Already enabled
- **Structured Markup:** Use schema.org vocabularies

### On-Page
- **Titles:** 50-60 characters
- **Descriptions:** 150-160 characters
- **Headings:** H1 per page, proper hierarchy
- **Internal Links:** Link to related content
- **URLs:** Readable, keyword-relevant slugs

## Dynamic Sitemap Details

### Blog Posts
- Fetches: Published posts only
- Updates: On every build
- Priority: 0.8
- Change frequency: Weekly

### Events
- Fetches: Active events only
- Updates: On every build
- Upcoming events: Priority 0.85
- Past events: Priority 0.7

### Creators
- Fetches: creator, blogger, official roles
- Updates: On every build
- Priority: 0.7
- Change frequency: Monthly

## Troubleshooting

### Sitemap Not Updating
1. Check environment variables loaded
2. Run: `npm run build:sitemap`
3. Verify: `public/sitemap.xml` updated

### Pages Not Indexed
1. Check `robots.txt` allows the page
2. Submit to Google Search Console
3. Request indexing in GSC
4. Wait 2-4 weeks for initial indexing

### Meta Tags Not Updating
1. Call `updateMetaTags()` in useEffect
2. Verify no other meta tags override
3. Clear browser cache
4. Check browser DevTools: Elements → head

## Environment Variables

Required for dynamic sitemap generation:
```
VITE_PUBLIC_SUPABASE_URL=https://jocwzqjzarihupnpcjmm.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hBrfRPAgiTPQozJJSihorg_4t7Dh_ne
DOMAIN=https://tribedala.com (optional, defaults to https://tribedala.com)
```

## Deployment

1. **Build Process:**
   ```bash
   npm run build
   # This runs:
   # 1. TypeScript compilation
   # 2. Vite build
   # 3. generate-sitemap.mjs
   ```

2. **Deploy:**
   - `/public/sitemap.xml` automatically deployed
   - `/public/robots.txt` automatically deployed
   - Static files served from `/public`

3. **Verify:**
   - Check https://tribedala.com/sitemap.xml
   - Check https://tribedala.com/robots.txt
   - Submit to Google/Bing

## Social Media Cards

When sharing on social media, these tags ensure proper display:
- Facebook: Uses og:title, og:description, og:image
- Twitter: Uses twitter:card, twitter:title, twitter:description, twitter:image
- LinkedIn: Uses og: tags

## Maintenance

### Monthly
- Review Search Console for errors
- Update blog sitemap entries
- Monitor top search queries

### Quarterly
- Analyze top-performing pages
- Identify gaps in content
- Update internal linking strategy
- Review Core Web Vitals

### Annually
- Audit all pages for relevance
- Update content where needed
- Review SEO strategy
- Rebuild sitemaps

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Sitemap Protocol](https://www.sitemaps.org/)
- [Schema.org](https://schema.org/)
- [Web Fundamentals](https://developers.google.com/web/fundamentals)

## Support

For SEO issues or questions:
1. Check Google Search Console
2. Review this guide
3. Test with: https://www.seobility.net/en/seocheck/
