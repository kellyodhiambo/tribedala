import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const logoUrl = 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/f58dfcce-93e8-4fa3-a8d4-b82a8b19c9dc_compressed_c89e2e3e7e3dc1f6adaa98235aa55554.webp';

const showsDropdownItems = [
  { label: 'Tribe Dala Podcast', path: '/shows/podcast', icon: 'ri-mic-line' },
  { label: 'Tribe Dala Interview', path: '/shows/interview', icon: 'ri-video-line' },
  { label: 'Tribe Dala Girlies', path: '/shows/girlies', icon: 'ri-heart-line' },
];

const mainNavLinks = [
  { label: 'Home', path: '/', icon: 'ri-home-line' },
  { label: 'Blog', path: '/blog', icon: 'ri-article-line' },
  { label: 'Events', path: '/events', icon: 'ri-calendar-event-line' },
  { label: 'Creators', path: '/creators', icon: 'ri-user-star-line' },
  { label: 'About', path: '/about', icon: 'ri-information-line' },
];

const mobileBottomLinks = [
  { label: 'Home', path: '/', icon: 'ri-home-line' },
  { label: 'Shows', path: '/shows', icon: 'ri-mic-line' },
  { label: 'Network', path: '/network', icon: 'ri-group-line' },
  { label: 'Events', path: '/events', icon: 'ri-calendar-event-line' },
];

const moreLinks = [
  { label: 'Creators', path: '/creators', icon: 'ri-user-star-line' },
  { label: 'Network', path: '/network', icon: 'ri-group-line' },
  { label: 'Blog', path: '/blog', icon: 'ri-article-line' },
  { label: 'About', path: '/about', icon: 'ri-information-line' },
  { label: 'Services', path: '/services', icon: 'ri-briefcase-line' },
  { label: 'Team', path: '/team', icon: 'ri-team-line' },
  { label: 'Get Involved', path: '/get-involved', icon: 'ri-user-add-line' },
  { label: 'Contact', path: '/contact', icon: 'ri-mail-line' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showsOpen, setShowsOpen] = useState(false);
  const showsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowsOpen(false);
  }, [location.pathname]);

  // Close shows dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showsRef.current && !showsRef.current.contains(e.target as Node)) {
        setShowsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('tribedala-dark-mode');
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isShowsActive = () => location.pathname.startsWith('/shows');

  return (
    <>
      {/* Top Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background-50/90 backdrop-blur-xl border-b border-background-300/20 shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
            : 'bg-transparent'
        }`}
      >
        <nav className="section-padding flex items-center justify-between h-14 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src={logoUrl}
              alt="TribeDala"
              className="h-7 md:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            <Link
              to="/"
              className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'text-primary-500'
                  : 'text-foreground-300 hover:text-foreground-50 hover:bg-background-200/50'
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary-500" />
              )}
            </Link>

            {/* Shows Dropdown */}
            <div ref={showsRef} className="relative">
              <button
                onClick={() => setShowsOpen(!showsOpen)}
                onMouseEnter={() => setShowsOpen(true)}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isShowsActive()
                    ? 'text-primary-500'
                    : 'text-foreground-300 hover:text-foreground-50 hover:bg-background-200/50'
                }`}
              >
                Shows
                <i
                  className={`ri-arrow-down-s-line text-xs transition-transform duration-300 ${
                    showsOpen ? 'rotate-180' : ''
                  }`}
                />
                {isShowsActive() && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary-500" />
                )}
              </button>

              {/* Dropdown Panel */}
              <div
                onMouseLeave={() => setShowsOpen(false)}
                className={`absolute top-full left-0 mt-2 w-64 rounded-xl bg-background-100/95 backdrop-blur-xl border border-background-300/30 overflow-hidden shadow-2xl shadow-black/20 transition-all duration-300 origin-top ${
                  showsOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="p-2">
                  <Link
                    to="/shows"
                    onClick={() => setShowsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground-400 uppercase tracking-wider hover:text-foreground-200 transition-colors"
                  >
                    <i className="ri-stack-line" />
                    All Shows
                    <i className="ri-arrow-right-line ml-auto" />
                  </Link>
                  <div className="h-px bg-background-300/30 my-1 mx-3" />
                  {showsDropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                        isActive(item.path)
                          ? 'bg-primary-500/10 text-primary-500'
                          : 'text-foreground-300 hover:text-foreground-50 hover:bg-background-200/60'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-primary-500/20 text-primary-500'
                            : 'bg-background-200/50 text-foreground-500 group-hover:bg-background-300/60 group-hover:text-foreground-200'
                        }`}
                      >
                        <i className={`${item.icon} text-sm`} />
                      </div>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {mainNavLinks.slice(1).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-primary-500'
                    : 'text-foreground-300 hover:text-foreground-50 hover:bg-background-200/50'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary-500" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-foreground-300 hover:text-foreground-50 hover:bg-background-200/50 transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/get-involved"
              className="btn-primary text-sm px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(242,201,76,0.15)] hover:shadow-[0_0_30px_rgba(242,201,76,0.3)] transition-all duration-300"
            >
              Join the Tribe
            </Link>
          </div>

          {/* Mobile: Right actions */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-200 hover:text-foreground-50 hover:bg-background-200 transition-colors"
              aria-label="More menu"
            >
              <i className={`ri-${mobileMenuOpen ? 'close' : 'more-2'}-line text-lg`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-50/95 backdrop-blur-xl border-t border-background-300/20 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {mobileBottomLinks.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors relative ${
                (item.path === '/shows' ? isShowsActive() : isActive(item.path))
                  ? 'text-primary-500'
                  : 'text-foreground-500 hover:text-foreground-300'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${item.icon} text-base`} />
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {(item.path === '/shows' ? isShowsActive() : isActive(item.path)) && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500" />
              )}
            </Link>
          ))}
          {/* More button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
              mobileMenuOpen ? 'text-primary-500' : 'text-foreground-500 hover:text-foreground-300'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-menu-line text-base" />
            </div>
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen More Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-background-50/98 backdrop-blur-xl lg:hidden animate-fade-in">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-background-300/20">
              <img src={logoUrl} alt="TribeDala" className="h-7 w-auto object-contain" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-200 hover:text-foreground-50 hover:bg-background-200 transition-colors"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {/* Shows section */}
              <p className="px-3 py-1 text-[11px] font-semibold text-foreground-500 uppercase tracking-wider">
                Shows
              </p>
              {showsDropdownItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-foreground-200 hover:text-foreground-50 hover:bg-background-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-background-200 flex items-center justify-center">
                    <i className={`${item.icon} text-sm`} />
                  </div>
                  {item.label}
                </Link>
              ))}

              <div className="h-px bg-background-300/20 my-3" />

              {/* General links */}
              <p className="px-3 py-1 text-[11px] font-semibold text-foreground-500 uppercase tracking-wider">
                Explore
              </p>
              {moreLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-foreground-200 hover:text-foreground-50 hover:bg-background-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-background-200 flex items-center justify-center">
                    <i className={`${link.icon} text-sm`} />
                  </div>
                  {link.label}
                </Link>
              ))}

              {/* CTA */}
              <div className="pt-4 border-t border-background-300/20 mt-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-background-300/40 text-sm font-medium text-foreground-200 hover:text-foreground-50 hover:bg-background-200 transition-colors"
                >
                  <i className="ri-login-box-line" />
                  Sign In
                </Link>
                <Link
                  to="/get-involved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-sm py-3 justify-center"
                >
                  <i className="ri-user-add-line mr-2" />
                  Join the Tribe
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}