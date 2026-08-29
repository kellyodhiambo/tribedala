import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const sidebarLinks = [
  { label: 'Overview', path: '/dashboard', icon: 'ri-dashboard-line' },
  { label: 'Profile', path: '/dashboard/profile', icon: 'ri-user-line' },
  { label: 'Settings', path: '/dashboard/settings', icon: 'ri-settings-line' },
  { label: 'Applications', path: '/dashboard/applications', icon: 'ri-file-list-line' },
  { label: 'Notifications', path: '/dashboard/notifications', icon: 'ri-notification-line' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background-50">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-background-300/20 bg-background-50 sticky top-0 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-200 hover:bg-background-200 transition-colors"
        >
          <i className={`ri-${sidebarOpen ? 'close' : 'menu'}-line text-lg`} />
        </button>
        <h1 className="font-heading font-semibold text-sm text-foreground-200">My Dashboard</h1>
        <Link to="/" className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground-400 hover:text-primary-500 transition-colors">
          <i className="ri-home-line text-lg" />
        </Link>
      </div>

      <div className="flex">
        {/* Sidebar Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 lg:top-0 left-0 h-screen w-64 bg-background-100 border-r border-background-300/20 z-50 transform transition-transform duration-300 lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo area */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-background-300/20">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <i className="ri-dashboard-line text-primary-500" />
              </div>
              <span className="font-heading font-semibold text-sm text-foreground-100">Dashboard</span>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-foreground-400 hover:text-foreground-200 hover:bg-background-200/50'
                  }`}
                >
                  <div className="w-7 h-7 flex items-center justify-center">
                    <i className={`${link.icon} text-base`} />
                  </div>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-background-300/20">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground-500 hover:text-foreground-200 transition-colors"
              >
                <i className="ri-arrow-left-line" />
                Back to Site
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:pl-0">
          <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
