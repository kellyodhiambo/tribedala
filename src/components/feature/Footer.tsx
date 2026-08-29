import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

const footerLinks = {
  content: [
    { label: 'Podcast', path: '/shows/podcast' },
    { label: 'Interview', path: '/shows/interview' },
    { label: 'Girlies', path: '/shows/girlies' },
    { label: 'Blog', path: '/blog' },
    { label: 'Events', path: '/events' },
  ],
  community: [
    { label: 'Verified Creators', path: '/creators' },
    { label: 'Official Team', path: '/team' },
    { label: 'Get Involved', path: '/get-involved' },
    { label: 'Services', path: '/services' },
  ],
  company: [
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Use', path: '/terms' },
  ],
};

const socialLinks = [
  { icon: 'ri-instagram-line', label: 'Instagram', href: '#' },
  { icon: 'ri-youtube-line', label: 'YouTube', href: '#' },
  { icon: 'ri-twitter-x-line', label: 'X / Twitter', href: '#' },
  { icon: 'ri-tiktok-line', label: 'TikTok', href: '#' },
  { icon: 'ri-spotify-line', label: 'Spotify', href: '#' },
];

const logoUrl = 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/f58dfcce-93e8-4fa3-a8d4-b82a8b19c9dc_compressed_c89e2e3e7e3dc1f6adaa98235aa55554.webp';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      return;
    }
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <footer className="bg-background-100 border-t border-background-300/30">
      <div className="section-padding py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-block">
              <img src={logoUrl} alt="TribeDala" className="h-8 md:h-9 w-auto object-contain" />
            </Link>
            <p className="text-sm text-foreground-400 leading-relaxed max-w-sm">
              Kisumu&apos;s home for creators, podcasts, live events, and media.
              You know the Tribe, You know the Vibe.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-background-200 hover:bg-primary-500 flex items-center justify-center text-foreground-400 hover:text-background-50 transition-all duration-200"
                >
                  <i className={`${social.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h4 className="font-heading font-semibold text-sm text-foreground-50 mb-4">
              Content
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.content.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-foreground-400 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 sm:col-span-1">
            <h4 className="font-heading font-semibold text-sm text-foreground-50 mb-4">
              Community
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.community.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-foreground-400 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 sm:col-span-1">
            <h4 className="font-heading font-semibold text-sm text-foreground-50 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-foreground-400 hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h4 className="font-heading font-semibold text-sm text-foreground-50 mb-4">
              Newsletter
            </h4>
            <p className="text-xs text-foreground-500 mb-3">
              Get the latest episodes, events, and creator news delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 rounded-md bg-background-200 border border-background-300/50 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full btn-primary text-sm py-2"
              >
                Subscribe
              </button>
              {status === 'success' && (
                <p className="text-xs text-primary-400">You&apos;re subscribed! Welcome to the tribe.</p>
              )}
              {status === 'error' && (
                <p className="text-xs text-accent-400">Please enter a valid email.</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background-300/30">
        <div className="section-padding py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-foreground-600">
            &copy; {new Date().getFullYear()} TribeDala. All rights reserved.
          </p>
          <p className="text-xs text-foreground-600">
            Made with vibe in Kisumu, Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}