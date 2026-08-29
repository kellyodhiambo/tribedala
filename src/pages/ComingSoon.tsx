import { Link, useLocation } from 'react-router-dom';

export default function ComingSoon() {
  const location = useLocation();
  const pageName = location.pathname.split('/').filter(Boolean).join(' / ').replace(/-/g, ' ');
  const displayName = pageName
    ? pageName.charAt(0).toUpperCase() + pageName.slice(1)
    : 'Page';

  return (
    <div className="min-h-[70vh] flex items-center justify-center section-padding">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
          <i className="ri-tools-line text-primary-500 text-3xl" />
        </div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground-50 mb-3">
          {displayName} — Coming Soon
        </h1>
        <p className="text-foreground-400 mb-8">
          We&apos;re building something amazing here. Check back soon or explore what&apos;s already live.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary text-sm px-6 py-3">
            Back to Home
          </Link>
          <Link to="/shows" className="btn-secondary text-sm px-6 py-3">
            Explore Shows
          </Link>
        </div>
      </div>
    </div>
  );
}