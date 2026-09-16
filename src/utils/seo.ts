/**
 * SEO Utilities
 * Handle meta tags, structured data, and SEO best practices
 */

export interface EventSeoData {
  eventId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price?: number;
  image?: string;
  organizer?: string;
}

/**
 * Generate meta tags for event pages
 */
export function generateEventMetaTags(data: EventSeoData) {
  const url = `https://tribedala.com/events/${data.eventId}`;

  return {
    // Basic meta tags
    title: `${data.title} - TribeDala Events`,
    description: data.description,
    keywords: `${data.title}, ${data.location}, event, ${new Date(data.date).toLocaleDateString()}`,

    // Open Graph (Facebook, LinkedIn, etc.)
    ogTitle: data.title,
    ogDescription: data.description,
    ogType: 'event',
    ogUrl: url,
    ogImage: data.image || 'https://tribedala.com/og-image.png',

    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterTitle: data.title,
    twitterDescription: data.description,
    twitterImage: data.image || 'https://tribedala.com/og-image.png',
    twitterCreator: '@tribedala',

    // Additional meta tags
    canonical: url,
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0',
  };
}

/**
 * Generate JSON-LD structured data for events
 */
export function generateEventSchema(data: EventSeoData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.title,
    description: data.description,
    url: `https://tribedala.com/events/${data.eventId}`,
    image: data.image || 'https://tribedala.com/og-image.png',
    startDate: data.date,
    location: {
      '@type': 'Place',
      name: data.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kisumu',
        addressCountry: 'KE',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: data.organizer || 'TribeDala Events',
      url: 'https://tribedala.com',
    },
    offers: data.price
      ? {
          '@type': 'Offer',
          url: `https://tribedala.com/events/${data.eventId}/tickets`,
          price: data.price,
          priceCurrency: 'KES',
          availability: 'https://schema.org/InStock',
        }
      : undefined,
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  const items = breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/**
 * Generate organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TribeDala',
    url: 'https://tribedala.com',
    logo: 'https://tribedala.com/logo.png',
    description: 'East African digital community platform for entertainment, events, and creators',
    sameAs: [
      'https://twitter.com/tribedala',
      'https://instagram.com/tribedala',
      'https://facebook.com/tribedala',
      'https://youtube.com/@tribedala',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kisumu',
      addressCountry: 'KE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: 'https://tribedala.com/contact',
    },
  };
}

/**
 * Generate local business schema
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'TribeDala Events',
    image: 'https://tribedala.com/og-image.png',
    description: 'East African event platform for music, entertainment, and community',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kisumu',
      addressRegion: 'Kisumu County',
      addressCountry: 'KE',
    },
    areaServed: ['KE', 'UG', 'TZ'],
    priceRange: '$$',
  };
}

/**
 * Set page meta tags in document head
 */
export function setMetaTags(tags: Record<string, string>) {
  // Title
  if (tags.title) {
    document.title = tags.title;
  }

  // Update or create meta tags
  const metaTag = (name: string, property: string, content: string) => {
    let tag = document.querySelector(`meta[${property}="${name}"]`) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta') as HTMLMetaElement;
      tag.setAttribute(property, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  // Standard meta tags
  if (tags.description) metaTag('description', 'name', tags.description);
  if (tags.keywords) metaTag('keywords', 'name', tags.keywords);
  if (tags.robots) metaTag('robots', 'name', tags.robots);
  if (tags.viewport) metaTag('viewport', 'name', tags.viewport);

  // Canonical link
  if (tags.canonical) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link') as HTMLLinkElement;
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', tags.canonical);
  }

  // Open Graph
  if (tags.ogTitle) metaTag('og:title', 'property', tags.ogTitle);
  if (tags.ogDescription) metaTag('og:description', 'property', tags.ogDescription);
  if (tags.ogType) metaTag('og:type', 'property', tags.ogType);
  if (tags.ogUrl) metaTag('og:url', 'property', tags.ogUrl);
  if (tags.ogImage) metaTag('og:image', 'property', tags.ogImage);

  // Twitter Card
  if (tags.twitterCard) metaTag('twitter:card', 'name', tags.twitterCard);
  if (tags.twitterTitle) metaTag('twitter:title', 'name', tags.twitterTitle);
  if (tags.twitterDescription) metaTag('twitter:description', 'name', tags.twitterDescription);
  if (tags.twitterImage) metaTag('twitter:image', 'name', tags.twitterImage);
  if (tags.twitterCreator) metaTag('twitter:creator', 'name', tags.twitterCreator);
}

/**
 * Set structured data in document head
 */
export function setStructuredData(schema: object) {
  let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script') as HTMLScriptElement;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

/**
 * Generate SEO-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Keywords for Fisherman's DALA Experience
 */
export const fishermanEventKeywords = {
  primary: [
    'fishermen experience',
    'DALA experience kisumu',
    'Jomo Kenyatta Stadium events',
    'mamboleo events kisumu',
    'events in kisumu',
    'kisumu music festival',
    'october events kisumu',
  ],
  artists: [
    'Coster Onjwang',
    'Gabiro Mtu Necessary',
    'Hype Ballo',
    'Legroy Odhiambo',
    'Okello Max',
    'Prince Indah',
    'Joboya Band',
    'Fishers Band',
  ],
  locations: ['Jomo Kenyatta Stadium', 'Mamboleo', 'Kisumu', 'Kisumu County', 'Lake Victoria'],
  categories: [
    'live music',
    'festival',
    'entertainment',
    'cultural event',
    'music festival kenya',
    'kisumu entertainment',
  ],
};

export default {
  generateEventMetaTags,
  generateEventSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  setMetaTags,
  setStructuredData,
  generateSlug,
  fishermanEventKeywords,
};
