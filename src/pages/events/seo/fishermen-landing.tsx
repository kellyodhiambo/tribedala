/**
 * Fisherman's DALA Experience - SEO Landing Pages
 * Multiple keyword-targeted variations for Google visibility
 */

import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { setMetaTags, setStructuredData, generateEventSchema } from '@/utils/seo';
import './fishermen-landing.css';

const EVENT_ID = '7b6ee853-a953-4c14-8e9f-b74e4be50133';

interface LandingPageConfig {
  slug: string;
  title: string;
  metaDescription: string;
  heading: string;
  subheading: string;
  keywords: string[];
  sections: Array<{
    title: string;
    content: string;
  }>;
}

const landingConfigs: Record<string, LandingPageConfig> = {
  'fishermen-experience': {
    slug: 'fishermen-experience',
    title: 'The Fisherman\'s DALA Experience - Live Music Festival',
    metaDescription:
      'Experience the ultimate fishermen celebration at DALA - featuring Coster Onjwang, Okello Max & more. October 5, 2026 at Jomo Kenyatta Stadium, Kisumu.',
    heading: 'The Fisherman\'s DALA Experience',
    subheading: 'A celebration of fishermen culture, music, and community',
    keywords: ['fishermen experience', 'DALA event', 'live music', 'kisumu event'],
    sections: [
      {
        title: 'Experience the Magic',
        content:
          'Join us for an unforgettable evening celebrating the fishermen of Lake Victoria. DALA is more than just music—it\'s a celebration of culture, heritage, and community.',
      },
      {
        title: 'World-Class Artists',
        content:
          'Featuring performances from Coster Onjwang, Gabiro Mtu Necessary, Hype Ballo, Legroy Odhiambo, and many more talented artists.',
      },
      {
        title: 'Affordable Tickets',
        content: 'General Admission: 1,500 KES | VIP: 5,000 KES | Premium VIP: 10,000 KES | Jalupo Exclusive: 25,000 KES',
      },
    ],
  },
  'kisumu-events': {
    slug: 'kisumu-events',
    title: 'Best Events in Kisumu - DALA Experience 2026',
    metaDescription:
      'Discover the top entertainment events in Kisumu. DALA Experience features live music, cultural performances, and amazing entertainment for the whole family.',
    heading: 'Kisumu\'s Premier Entertainment Event',
    subheading: 'The biggest event happening in Kisumu this October',
    keywords: ['events in kisumu', 'kisumu entertainment', 'kisumu music festival', 'what to do in kisumu'],
    sections: [
      {
        title: 'Why Choose DALA in Kisumu?',
        content:
          'Kisumu is the heart of Kenya\'s cultural scene, and DALA brings the best entertainment to this vibrant city. Located at Jomo Kenyatta Stadium.',
      },
      {
        title: 'Easy Access',
        content:
          'Located in Mamboleo, easily accessible from anywhere in Kisumu. Ample parking and comfortable seating for all attendees.',
      },
    ],
  },
  'jomo-kenyatta-stadium': {
    slug: 'jomo-kenyatta-stadium',
    title: 'Events at Jomo Kenyatta Stadium - DALA Experience',
    metaDescription:
      'Book your tickets for DALA Experience at Jomo Kenyatta Stadium in Kisumu. Premier venue for live entertainment and cultural events.',
    heading: 'Premier Venue: Jomo Kenyatta Stadium',
    subheading: 'Experience world-class entertainment at Kisumu\'s iconic stadium',
    keywords: [
      'Jomo Kenyatta Stadium',
      'events at Jomo Kenyatta',
      'stadium events kisumu',
      'live music at Jomo Kenyatta Stadium',
    ],
    sections: [
      {
        title: 'About the Venue',
        content:
          'Jomo Kenyatta Stadium is Kisumu\'s premier entertainment venue, offering state-of-the-art facilities for world-class events.',
      },
      {
        title: 'Facilities & Amenities',
        content:
          'Professional sound system, comfortable seating, spacious parking, food and beverage services, and easy accessibility.',
      },
    ],
  },
  'mamboleo-events': {
    slug: 'mamboleo-events',
    title: 'Events in Mamboleo, Kisumu - DALA Experience',
    metaDescription:
      'Experience DALA at Mamboleo, Kisumu. Live music, entertainment, and cultural celebrations in Kisumu\'s most vibrant area.',
    heading: 'Mamboleo\'s Cultural Hub',
    subheading: 'Where entertainment meets community in Kisumu',
    keywords: ['mamboleo events', 'mamboleo kisumu', 'events in mamboleo', 'entertainment mamboleo'],
    sections: [
      {
        title: 'Mamboleo Experience',
        content:
          'Mamboleo is the beating heart of Kisumu\'s entertainment scene. DALA Experience brings the community together for an unforgettable celebration.',
      },
    ],
  },
  'october-2026-events': {
    slug: 'october-2026-events',
    title: 'October 2026 Events in Kisumu - DALA Experience',
    metaDescription:
      'Plan your October 2026 activities in Kisumu with DALA Experience. October 5, 2026 - the event you won\'t want to miss!',
    heading: 'October Events in Kisumu',
    subheading: 'Mark your calendar for October 5, 2026',
    keywords: ['october events', 'october 2026 kisumu', 'october events kenya', 'fall events kisumu'],
    sections: [
      {
        title: 'Save the Date',
        content: 'October 5, 2026 - Join us for DALA Experience, Kisumu\'s hottest event of the season.',
      },
    ],
  },
  'music-festival-kisumu': {
    slug: 'music-festival-kisumu',
    title: 'Kisumu Music Festival - DALA Experience 2026',
    metaDescription:
      'Discover Kisumu\'s biggest music festival. DALA Experience features top Kenyan artists and world-class entertainment. October 5, 2026.',
    heading: 'Kisumu\'s Premier Music Festival',
    subheading: 'Celebrating the best of East African music culture',
    keywords: ['music festival kisumu', 'kisumu music festival', 'live music events kisumu', 'music festival kenya'],
    sections: [
      {
        title: 'Music & Culture',
        content:
          'DALA Experience is more than a music festival—it\'s a celebration of East African culture, heritage, and artistic excellence.',
      },
      {
        title: 'Featured Artists',
        content:
          'Featuring performances from Kenya\'s finest musicians: Coster Onjwang, Okello Max, Hype Ballo, and many more.',
      },
    ],
  },
  'live-music-events': {
    slug: 'live-music-events',
    title: 'Live Music Events in Kisumu - DALA Experience',
    metaDescription:
      'Enjoy live music at DALA Experience in Kisumu. World-class performers, amazing atmosphere, and unforgettable entertainment.',
    heading: 'Live Music Excellence',
    subheading: 'Experience the best live performances in Kisumu',
    keywords: ['live music events', 'live entertainment kisumu', 'music performances', 'live shows kisumu'],
    sections: [
      {
        title: 'Live Performances',
        content:
          'Experience live performances from some of East Africa\'s most talented and celebrated musical artists.',
      },
    ],
  },
};

export default function FishermanEventLanding() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [config, setConfig] = useState<LandingPageConfig | null>(null);

  useEffect(() => {
    const currentSlug = slug || 'fishermen-experience';
    const pageConfig = landingConfigs[currentSlug];

    if (pageConfig) {
      setConfig(pageConfig);

      // Set meta tags
      setMetaTags({
        title: pageConfig.title,
        description: pageConfig.metaDescription,
        keywords: pageConfig.keywords.join(', '),
        canonical: `https://tribedala.com${location.pathname}`,
        ogTitle: pageConfig.title,
        ogDescription: pageConfig.metaDescription,
        ogUrl: `https://tribedala.com${location.pathname}`,
        ogImage: 'https://tribedala.com/dala-experience-og.png',
        twitterCard: 'summary_large_image',
        twitterTitle: pageConfig.title,
        twitterDescription: pageConfig.metaDescription,
        robots: 'index, follow',
      });

      // Set structured data
      setStructuredData(
        generateEventSchema({
          eventId: EVENT_ID,
          title: 'The Fisherman\'s DALA Experience',
          description: pageConfig.metaDescription,
          date: '2026-10-05T18:00:00',
          location: 'Jomo Kenyatta Stadium, Mamboleo, Kisumu',
          price: 1500,
          image: 'https://tribedala.com/dala-experience.png',
          organizer: 'AVAIA Events',
        })
      );
    }
  }, [slug, location]);

  if (!config) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="fishermen-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>{config.heading}</h1>
          <p>{config.subheading}</p>
        <button className="cta-button" onClick={() => window.location.href = `/events/${EVENT_ID}`}>
          Get Tickets Now
        </button>
        </div>
      </section>

      {/* Content Sections */}
      <section className="content-sections">
        <div className="container">
          {config.sections.map((section, index) => (
            <div key={index} className="content-block">
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Event Details */}
      <section className="event-details">
        <div className="container">
          <div className="details-grid">
            <div className="detail-card">
              <h3>📅 Date</h3>
              <p>Saturday, October 5, 2026</p>
            </div>
            <div className="detail-card">
              <h3>📍 Location</h3>
              <p>Jomo Kenyatta Stadium, Mamboleo, Kisumu</p>
            </div>
            <div className="detail-card">
              <h3>⏰ Time</h3>
              <p>From 6:00 PM</p>
            </div>
            <div className="detail-card">
              <h3>🎫 Tickets</h3>
              <p>Starting from KES 1,500</p>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Lineup */}
      <section className="artist-lineup">
        <div className="container">
          <h2>Featured Artists & Performers</h2>
          <div className="artists-grid">
            {[
              'Coster Onjwang',
              'Gabiro Mtu Necessary',
              'Hype Ballo',
              'Legroy Odhiambo',
              'Jibadia Ididd Achieng',
              'Okello Max',
              'Prince Indah',
              'Joboya Band',
              'The Fishers Band',
            ].map((artist) => (
              <div key={artist} className="artist-card">
                <h3>{artist}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="final-cta">
        <div className="container">
          <h2>Don't Miss Out!</h2>
          <p>Get your tickets today and be part of Kisumu's biggest event</p>
        <button className="cta-button-large" onClick={() => window.location.href = `/events/${EVENT_ID}/tickets`}>
          Book Tickets for DALA Experience
        </button>
        </div>
      </section>
    </div>
  );
}
