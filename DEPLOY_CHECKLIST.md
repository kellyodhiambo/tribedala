# TribeDala SEO Deployment Checklist

## Phase 1: Pre-Deployment (Local Testing)

### Files Verification
- [ ] `/public/sitemap.xml` exists and is valid XML
- [ ] `/public/robots.txt` exists
- [ ] `/public/.htaccess` exists
- [ ] `/src/lib/seo.ts` exists
- [ ] `/scripts/generate-sitemap.mjs` exists
- [ ] `package.json` has `build:sitemap` and `postbuild` scripts

### Local Testing
- [ ] Run `npm run build:sitemap` successfully
- [ ] Verify `/public/sitemap.xml` contains blog posts, events, creators
- [ ] Check sitemap is valid XML (no parsing errors)
- [ ] Verify robots.txt is readable
- [ ] Check `.htaccess` syntax is correct

```bash
# Test commands
npm run build:sitemap
npm run build  # Should auto-generate sitemap

# Verify output
cat public/sitemap.xml | head -20  # Check valid XML
cat public/robots.txt              # Check content
```

---

## Phase 2: Git & GitHub

### Commit Changes
- [ ] Stage SEO files: `git add public/ src/lib/seo.ts scripts/generate-sitemap.mjs`
- [ ] Stage updated package.json
- [ ] Create descriptive commit message
- [ ] Push to GitHub

```bash
git add public/sitemap.xml public/robots.txt public/.htaccess
git add src/lib/seo.ts scripts/generate-sitemap.mjs
git add package.json
git commit -m "feat: add complete SEO infrastructure with sitemaps"
git push origin main
```

### GitHub Verification
- [ ] Check files appear in GitHub repo
- [ ] Verify no secrets in commits
- [ ] Check GitHub Pages (if enabled) serves files

---

## Phase 3: Production Deployment

### Pre-Deployment
- [ ] Backup current production (recommended)
- [ ] Notify team about deployment
- [ ] Check environment is stable

### Deployment
- [ ] Deploy to production server
- [ ] Verify all files copied to `/public/`
- [ ] Verify web server running

### Post-Deployment Verification
- [ ] Visit `https://tribedala.com/sitemap.xml` in browser
  - Should show XML content (not error)
  - Should not show 404
  - Should not be redirected elsewhere
  
- [ ] Visit `https://tribedala.com/robots.txt` in browser
  - Should show text content
  - Should include crawl rules
  - Should reference sitemap

- [ ] Check homepage loads normally
  - No 500 errors
  - No .htaccess issues (if using Apache)
  - No mixed content warnings

### Test URLs
```
https://tribedala.com/                    ✓ Should work
https://tribedala.com/about               ✓ Should work
https://tribedala.com/blog                ✓ Should work
https://tribedala.com/sitemap.xml         ✓ Should return XML
https://tribedala.com/robots.txt          ✓ Should return text
```

---

## Phase 4: Search Engine Submission

### Google Search Console

**Setup:**
- [ ] Go to https://search.google.com/search-console
- [ ] Create new property for `https://tribedala.com`
- [ ] Choose verification method (Domain, URL prefix, DNS, HTML tag, etc.)
- [ ] Complete verification
- [ ] Add alternate domain variations if needed (`www.tribedala.com`, etc.)

**Submit Sitemap:**
- [ ] Go to Sitemaps section
- [ ] Add new sitemap: `https://tribedala.com/sitemap.xml`
- [ ] Monitor indexation status
- [ ] Check for any errors or warnings

**Initial Setup Tasks:**
- [ ] Add property for `https://www.tribedala.com` (if applicable)
- [ ] Set preferred domain (www vs non-www)
- [ ] Download site verification confirmation

**Monitoring:**
- [ ] Check back in 24 hours for initial results
- [ ] Watch for crawl errors
- [ ] Monitor coverage report
- [ ] Review top queries

### Bing Webmaster Tools

**Setup:**
- [ ] Go to https://www.bing.com/webmasters
- [ ] Add site: `https://tribedala.com`
- [ ] Verify ownership (any method)

**Submit Sitemap:**
- [ ] Go to Sitemaps
- [ ] Submit: `https://tribedala.com/sitemap.xml`
- [ ] Monitor indexation

---

## Phase 5: Monitoring & Validation (First Week)

### Day 1-2
- [ ] Check Google Search Console shows indexing activity
- [ ] Verify sitemaps detected by search engines
- [ ] Monitor error logs for any issues

### Day 3-7
- [ ] Check GSC crawl stats
- [ ] Look for any "Crawl errors" section
- [ ] Review coverage status
- [ ] Check if pages appear in search results

### Search Operators to Test
```
site:tribedala.com                     (should show your pages)
site:tribedala.com/blog                (should show blog pages)
site:tribedala.com/events              (should show events)
site:tribedala.com/creators            (should show creators)
```

### Tools to Verify
- [ ] Google: https://search.google.com (search your site)
- [ ] Bing: https://www.bing.com (search your site)
- [ ] Google Cache: `cache:tribedala.com` (check if cached)

---

## Phase 6: Integration in Components

### Add to Key Pages
- [ ] Homepage - Add `updateMetaTags(SEO_CONFIG.home)` in useEffect
- [ ] About - Add `updateMetaTags(SEO_CONFIG.about)` 
- [ ] Blog listing - Add `updateMetaTags(SEO_CONFIG.blog)`
- [ ] Blog post - Add `updateMetaTags(createBlogPostSEO(post))`
- [ ] Events - Add `updateMetaTags(SEO_CONFIG.events)`
- [ ] Creators - Add `updateMetaTags(SEO_CONFIG.creators)`
- [ ] Creators detail - Add `updateMetaTags(createCreatorSEO(creator))`

### Test Meta Tags
For each page:
- [ ] View page source (Ctrl+U)
- [ ] Check for `<title>` tag
- [ ] Check for `<meta name="description">`
- [ ] Check for `<meta property="og:*">` tags
- [ ] Check for `<link rel="canonical">`

### Browser DevTools Check
For each page:
- [ ] Open DevTools (F12)
- [ ] Go to Elements tab
- [ ] Expand `<head>` section
- [ ] Verify meta tags present
- [ ] Verify title matches expected

---

## Phase 7: Performance Monitoring

### Setup Analytics
- [ ] Add Google Analytics (if not already)
- [ ] Add Search Console to Analytics
- [ ] Create dashboard for SEO metrics

### Key Metrics to Monitor
- [ ] Google Search Console:
  - [ ] Total impressions (where your pages appear in search)
  - [ ] Total clicks (how many people click through)
  - [ ] Average position (where you rank)
  - [ ] CTR (click-through rate)

- [ ] Google Analytics:
  - [ ] Organic traffic (vs paid, direct, referral)
  - [ ] New vs returning visitors
  - [ ] Bounce rate
  - [ ] Pages per session
  - [ ] Average session duration

### Tools to Use
- [ ] Google Search Console: https://search.google.com/search-console
- [ ] Google Analytics: https://analytics.google.com
- [ ] Google PageSpeed Insights: https://pagespeed.web.dev
- [ ] Bing Webmaster: https://www.bing.com/webmasters

---

## Phase 8: Ongoing Maintenance

### Weekly (Every 7 days)
- [ ] Check Google Search Console for errors
- [ ] Review top search queries
- [ ] Monitor crawl stats
- [ ] Check for any issues

### Monthly (Every 30 days)
- [ ] Review top-performing pages
- [ ] Identify low-performing pages to improve
- [ ] Check organic traffic trends
- [ ] Verify all pages still indexed

### Quarterly (Every 90 days)
- [ ] Full SEO audit
- [ ] Analyze content gaps
- [ ] Review and update old content
- [ ] Check for broken links
- [ ] Test page speed

### Annually (Every 365 days)
- [ ] Full site SEO review
- [ ] Update SEO strategy
- [ ] Rebuild sitemaps
- [ ] Audit all pages

---

## Phase 9: Troubleshooting

### Common Issues

**Sitemap not found (404)**
```bash
# Check file exists
ls -la public/sitemap.xml

# Check file permissions (read by web server)
chmod 644 public/sitemap.xml

# Check web server config
# Verify /public files are being served
```

**Pages not indexed after 2 weeks**
- [ ] Check robots.txt allows page: `curl -s tribedala.com/robots.txt | grep -i disallow`
- [ ] Submit to GSC manually
- [ ] Request indexing in GSC
- [ ] Check page quality (not thin content)
- [ ] Ensure page is reachable (no 404/redirects)

**Sitemap errors in GSC**
- [ ] Download error report
- [ ] Fix reported URLs
- [ ] Regenerate sitemap: `npm run build:sitemap`
- [ ] Resubmit to GSC

**Meta tags not showing**
- [ ] Verify `updateMetaTags()` called in `useEffect`
- [ ] Check no other tags override
- [ ] Clear browser cache: Ctrl+Shift+Delete
- [ ] Check page source (Ctrl+U)

---

## Phase 10: Sign-Off

### Final Verification
- [ ] All files deployed and accessible
- [ ] Sitemaps submitted to all search engines
- [ ] No crawl errors in GSC
- [ ] Meta tags working on key pages
- [ ] No broken links in sitemap
- [ ] .htaccess not causing issues

### Communication
- [ ] Notify team: "SEO infrastructure deployed"
- [ ] Document changes in wiki/docs
- [ ] Schedule monitoring review (1 month)
- [ ] Set calendar reminders for maintenance

### Documentation
- [ ] Link to SEO_GUIDE.md in project README
- [ ] Document search console credentials (securely)
- [ ] Create monitoring dashboard/spreadsheet
- [ ] Document any customizations made

---

## Quick Command Reference

```bash
# Test sitemap generation
npm run build:sitemap

# Full build with sitemap
npm run build

# Verify files exist
ls -la public/sitemap.xml
ls -la public/robots.txt
ls -la src/lib/seo.ts

# Check XML validity (if xmllint available)
xmllint --noout public/sitemap.xml

# Git workflow
git add public/sitemap.xml public/robots.txt public/.htaccess
git add src/lib/seo.ts scripts/generate-sitemap.mjs package.json
git commit -m "feat: add SEO infrastructure"
git push origin main

# Verify in production
curl -s https://tribedala.com/sitemap.xml | head -20
curl -s https://tribedala.com/robots.txt
```

---

## Success Criteria

✅ **Deployment is successful when:**

1. All files deployed to `/public/`
2. `https://tribedala.com/sitemap.xml` returns valid XML
3. `https://tribedala.com/robots.txt` returns valid text
4. Sitemaps submitted to Google Search Console
5. Sitemaps submitted to Bing Webmaster Tools
6. No 404 errors for sitemap/robots.txt
7. No crawl errors reported after 24 hours
8. Initial pages start getting indexed (within 2 weeks)

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Local Testing | 1 hour | Ready |
| Git & GitHub | 15 mins | Ready |
| Production Deploy | 1 hour | Ready |
| Search Engine Submit | 30 mins | Ready |
| Monitoring Week 1 | Ongoing | ⏳ In Progress |
| Component Integration | 2 hours | ⏳ Pending |
| Performance Setup | 1 hour | ⏳ Pending |
| Ongoing Maintenance | Weekly/Monthly | ⏳ Upcoming |

---

## Status Summary

```
✅ Files Created: 8 files
✅ Local Testing: Ready
✅ Git/GitHub: Ready to push
⏳ Production Deploy: Awaiting approval
⏳ Search Engine Submit: After deploy
⏳ Monitoring: After submit

Expected Timeline: 2-3 hours total setup
Expected Benefits: 20-50% organic traffic increase within 6 months
```

---

**Created:** August 30, 2026  
**Status:** Ready for Deployment  
**Next Step:** Submit to search engines after production deployment
