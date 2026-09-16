/**
 * Dynamic Sitemap Generator
 * Generates XML sitemaps for Google indexing based on event data
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://tribedala.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate sitemap XML from URL list
   */
  generateXml(urls: SitemapUrl[]): string {
    const urlElements = urls
      .map(
        (url) => `  <url>
    <loc>${this.escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  /**
   * Generate sitemap index for multiple sitemaps
   */
  generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
    const sitemapElements = sitemaps
      .map(
        (sitemap) => `  <sitemap>
    <loc>${this.escapeXml(sitemap.loc)}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ''}
  </sitemap>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate Fisherman's DALA Experience event URLs
   */
  generateEventUrls(eventId: string): SitemapUrl[] {
    const today = new Date().toISOString().split('T')[0];

    return [
      // Main event page
      {
        loc: `${this.baseUrl}/events/${eventId}`,
        lastmod: today,
        changefreq: 'daily',
        priority: 1.0,
      },
      // Event landing pages (keyword variations)
      {
        loc: `${this.baseUrl}/events/${eventId}/fishermen-experience`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/kisumu-events`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/jomo-kenyatta-stadium`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/mamboleo-events`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/october-2026-events`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/music-festival-kisumu`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/live-music-events`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8,
      },
      // Ticket pages (conversion-focused)
      {
        loc: `${this.baseUrl}/events/${eventId}/tickets`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.95,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/general-admission`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/vip-tickets`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/jalupo-exclusive`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.9,
      },
      // Artist pages
      {
        loc: `${this.baseUrl}/events/${eventId}/artists`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.85,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/artist/coster-onjwang`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/artist/gabiro-mtu-necessary`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/artist/hype-ballo`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/artist/legroy-odhiambo`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/artist/jibadia-ididd-achieng`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/artist/okello-max`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/artist/prince-indah`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/artist/joboya-band`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/artist/fishers-band`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      },
      // Location pages
      {
        loc: `${this.baseUrl}/events/${eventId}/location`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/about`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/schedule`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.85,
      },
      // Gallery and media
      {
        loc: `${this.baseUrl}/events/${eventId}/gallery`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.7,
      },
      // Information pages
      {
        loc: `${this.baseUrl}/events/${eventId}/faq`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.7,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/directions`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.75,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/parking`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.6,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/accommodation`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.6,
      },
      // Booking and social
      {
        loc: `${this.baseUrl}/events/${eventId}/book-now`,
        lastmod: today,
        changefreq: 'daily',
        priority: 1.0,
      },
      {
        loc: `${this.baseUrl}/events/${eventId}/share`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.6,
      },
    ];
  }

  /**
   * Generate all static site URLs
   */
  generateStaticUrls(): SitemapUrl[] {
    const today = new Date().toISOString().split('T')[0];

    return [
      { loc: `${this.baseUrl}/`, priority: 1.0, changefreq: 'daily', lastmod: today },
      { loc: `${this.baseUrl}/events`, priority: 0.9, changefreq: 'daily', lastmod: today },
      { loc: `${this.baseUrl}/about`, priority: 0.8, changefreq: 'monthly', lastmod: today },
      { loc: `${this.baseUrl}/shows`, priority: 0.8, changefreq: 'weekly', lastmod: today },
      { loc: `${this.baseUrl}/blog`, priority: 0.8, changefreq: 'daily', lastmod: today },
      { loc: `${this.baseUrl}/creators`, priority: 0.7, changefreq: 'weekly', lastmod: today },
      { loc: `${this.baseUrl}/team`, priority: 0.7, changefreq: 'monthly', lastmod: today },
      { loc: `${this.baseUrl}/contact`, priority: 0.7, changefreq: 'monthly', lastmod: today },
    ];
  }
}

export default SitemapGenerator;
