/**
 * SEO utilities for TribeDala
 * Helps manage meta tags and structured data
 */

interface SEOMetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  canonicalUrl?: string;
}

const SITE_NAME = 'TribeDala';
const DOMAIN = 'https://tribedala.com';

export const DEFAULT_SEO = {
  title: `${SITE_NAME} - African Content Community Platform`,
  description: 'Join TribeDala: a community platform for African creators, bloggers, and storytellers. Discover shows, events, and connect with fellow creators.',
  keywords: 'African creators, podcast, content creators, community, blog, events, storytelling',
  ogImage: `${DOMAIN}/og-image.jpg`,
  twitterCard: 'summary_large_image',
};

export const SEO_CONFIG = {
  home: {
    title: `${SITE_NAME} - African Content Community Platform`,
    description: 'Discover the African content revolution. Join TribeDala for shows, blogs, events, and creator networking.',
    ogType: 'website',
  },
  about: {
    title: `About ${SITE_NAME}`,
    description: 'Learn about our mission to empower African creators and build a thriving community.',
  },
  team: {
    title: `Our Team - ${SITE_NAME}`,
    description: 'Meet the passionate team behind TribeDala.',
  },
  shows: {
    title: `Shows - ${SITE_NAME}`,
    description: 'Explore our collection of podcasts, interviews, and exclusive shows.',
    keywords: 'podcast, interviews, shows, African content, storytelling',
  },
  blog: {
    title: `Blog - ${SITE_NAME}`,
    description: 'Read articles, insights, and stories from creators in the TribeDala community.',
    keywords: 'blog, articles, creator insights, African storytelling',
  },
  events: {
    title: `Events - ${SITE_NAME}`,
    description: 'Discover and attend community events, workshops, and networking gatherings.',
    keywords: 'events, workshops, community gathering, networking',
  },
  creators: {
    title: `Creators - ${SITE_NAME}`,
    description: 'Connect with African creators, businesses, and content professionals.',
    keywords: 'creators, creators network, African talent, content professionals',
  },
  services: {
    title: `Services - ${SITE_NAME}`,
    description: 'Explore our platform services and offerings for creators.',
  },
  contact: {
    title: `Contact Us - ${SITE_NAME}`,
    description: 'Get in touch with the TribeDala team.',
  },
  roadmap: {
    title: `Roadmap - ${SITE_NAME}`,
    description: 'See what\'s coming next on TribeDala.',
  },
  getInvolved: {
    title: `Get Involved - ${SITE_NAME}`,
    description: 'Join our community and become a creator, partner, or contributor.',
  },
};

export function updateMetaTags(config: SEOMetaTags) {
  // Title
  if (config.title) {
    document.title = config.title;
    updateOrCreateMeta('og:title', config.ogTitle || config.title);
    updateOrCreateMeta('twitter:title', config.title);
  }

  // Description
  if (config.description) {
    updateOrCreateMeta('description', config.description);
    updateOrCreateMeta('og:description', config.ogDescription || config.description);
    updateOrCreateMeta('twitter:description', config.description);
  }

  // Keywords
  if (config.keywords) {
    updateOrCreateMeta('keywords', config.keywords);
  }

  // Open Graph
  if (config.ogImage) {
    updateOrCreateMeta('og:image', config.ogImage);
    updateOrCreateMeta('twitter:image', config.ogImage);
  }

  if (config.ogType) {
    updateOrCreateMeta('og:type', config.ogType);
  }

  // Twitter
  if (config.twitterCard) {
    updateOrCreateMeta('twitter:card', config.twitterCard);
  }

  // Canonical URL
  if (config.canonicalUrl) {
    updateOrCreateCanonical(config.canonicalUrl);
  }

  // Always set
  updateOrCreateMeta('og:site_name', SITE_NAME);
  updateOrCreateMeta('og:url', window.location.href);
  updateOrCreateMeta('twitter:site', '@tribedala');
}

function updateOrCreateMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }

  element.content = content;
}

function updateOrCreateCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}

export function createBlogPostSEO(post: {
  slug: string;
  title: string;
  content: string;
  cover_image?: string;
  author?: string;
  created_at: string;
  updated_at: string;
}) {
  // Extract first 160 chars of content for description
  const cleanContent = post.content.replace(/<[^>]*>/g, '').trim();
  const description = cleanContent.substring(0, 160) + (cleanContent.length > 160 ? '...' : '');

  return {
    title: `${post.title} - Blog | ${SITE_NAME}`,
    description,
    keywords: 'blog, article, African content',
    ogType: 'article',
    ogImage: post.cover_image,
    canonicalUrl: `${DOMAIN}/blog/${post.slug}`,
  };
}

export function createEventSEO(event: {
  id: string;
  title: string;
  description: string;
  image?: string;
  start_date: string;
}) {
  const eventDate = new Date(event.start_date);
  
  return {
    title: `${event.title} - Event | ${SITE_NAME}`,
    description: event.description.substring(0, 160),
    keywords: 'event, community, networking, workshop',
    ogType: 'event',
    ogImage: event.image,
    canonicalUrl: `${DOMAIN}/events/${event.id}`,
  };
}

export function createCreatorSEO(creator: {
  id: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
}) {
  const description = creator.bio ? creator.bio.substring(0, 160) : `Explore ${creator.full_name}'s profile on TribeDala`;

  return {
    title: `${creator.full_name} - Creator | ${SITE_NAME}`,
    description,
    keywords: 'creator, profile, African talent',
    ogImage: creator.avatar_url,
    canonicalUrl: `${DOMAIN}/creators/${creator.id}`,
  };
}

export function createEpisodeSEO(episode: {
  id: string;
  title: string;
  description?: string;
  image?: string;
  show_type: string;
}) {
  return {
    title: `${episode.title} - ${episode.show_type} | ${SITE_NAME}`,
    description: episode.description?.substring(0, 160) || `Listen to ${episode.title} on TribeDala`,
    keywords: 'episode, podcast, show, audio content',
    ogType: 'music.radio_station',
    ogImage: episode.image,
    canonicalUrl: `${DOMAIN}/shows/episode/${episode.id}`,
  };
}

// Structured Data for JSON-LD
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TribeDala',
    url: DOMAIN,
    logo: `${DOMAIN}/logo.png`,
    description: DEFAULT_SEO.description,
    sameAs: [
      'https://twitter.com/tribedala',
      'https://instagram.com/tribedala',
      'https://facebook.com/tribedala',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@tribedala.com',
    },
  };
}

export function generateBreadcrumbs(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${DOMAIN}${item.url}`,
    })),
  };
}
