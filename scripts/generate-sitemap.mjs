#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for TribeDala
 * Generates sitemap.xml with dynamic blog posts, events, and creators from Supabase
 * Run: node scripts/generate-sitemap.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const DOMAIN = process.env.DOMAIN || 'https://tribedala.com';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing VITE_PUBLIC_SUPABASE_URL or VITE_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STATIC_ROUTES = [
  { path: '', priority: 1.0, changefreq: 'weekly' },
  { path: 'about', priority: 0.9, changefreq: 'monthly' },
  { path: 'team', priority: 0.8, changefreq: 'monthly' },
  { path: 'get-involved', priority: 0.9, changefreq: 'monthly' },
  { path: 'services', priority: 0.8, changefreq: 'monthly' },
  { path: 'contact', priority: 0.8, changefreq: 'monthly' },
  { path: 'roadmap', priority: 0.7, changefreq: 'monthly' },
  { path: 'privacy', priority: 0.5, changefreq: 'yearly' },
  { path: 'terms', priority: 0.5, changefreq: 'yearly' },
  { path: 'shows', priority: 0.95, changefreq: 'weekly' },
  { path: 'shows/podcast', priority: 0.9, changefreq: 'weekly' },
  { path: 'shows/interview', priority: 0.9, changefreq: 'weekly' },
  { path: 'shows/girlies', priority: 0.9, changefreq: 'weekly' },
  { path: 'blog', priority: 0.95, changefreq: 'daily' },
  { path: 'events', priority: 0.9, changefreq: 'weekly' },
  { path: 'creators', priority: 0.9, changefreq: 'weekly' },
  { path: 'network', priority: 0.85, changefreq: 'weekly' },
];

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

function createUrlEntry(path, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${DOMAIN}/${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generateSitemap() {
  console.log('🔄 Generating sitemap...');

  const urlEntries = [];

  // Add static routes
  const today = formatDate(new Date());
  for (const route of STATIC_ROUTES) {
    urlEntries.push(createUrlEntry(route.path, today, route.changefreq, route.priority));
  }

  try {
    // Fetch published blog posts
    console.log('📝 Fetching blog posts...');
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (blogError) throw blogError;

    if (blogPosts && blogPosts.length > 0) {
      console.log(`  ✓ Found ${blogPosts.length} blog posts`);
      for (const post of blogPosts) {
        urlEntries.push(
          createUrlEntry(
            `blog/${post.slug}`,
            formatDate(post.updated_at),
            'weekly',
            0.8
          )
        );
      }
    }

    // Fetch published events
    console.log('📅 Fetching events...');
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('id, updated_at, start_date')
      .eq('status', 'active')
      .order('start_date', { ascending: false });

    if (eventError) throw eventError;

    if (events && events.length > 0) {
      console.log(`  ✓ Found ${events.length} events`);
      for (const event of events) {
        const priority = new Date(event.start_date) > new Date() ? 0.85 : 0.7;
        urlEntries.push(
          createUrlEntry(
            `events/${event.id}`,
            formatDate(event.updated_at),
            'weekly',
            priority
          )
        );
      }
    }

    // Fetch creators with profiles
    console.log('👥 Fetching creators...');
    const { data: creators, error: creatorError } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .in('role', ['creator', 'blogger', 'official'])
      .order('updated_at', { ascending: false });

    if (creatorError) throw creatorError;

    if (creators && creators.length > 0) {
      console.log(`  ✓ Found ${creators.length} creators`);
      for (const creator of creators) {
        urlEntries.push(
          createUrlEntry(
            `creators/${creator.id}`,
            formatDate(creator.updated_at),
            'monthly',
            0.7
          )
        );
      }
    }

    // Build XML
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const xmlNamespaces = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
                         '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n' +
                         '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n\n';
    const xmlBody = urlEntries.join('\n\n');
    const xmlFooter = '\n\n</urlset>';

    const sitemap = xmlHeader + xmlNamespaces + xmlBody + xmlFooter;

    // Write to public folder
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);

    console.log(`\n✅ Sitemap generated successfully!`);
    console.log(`📍 Location: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${urlEntries.length}`);
    console.log(`🌐 Domain: ${DOMAIN}`);

  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

generateSitemap();
