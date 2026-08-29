import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';

const logoUrl = 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/f58dfcce-93e8-4fa3-a8d4-b82a8b19c9dc_compressed_c89e2e3e7e3dc1f6adaa98235aa55554.webp';

const sidebarLinks = [
  { label: 'Dashboard', path: '/admin', icon: 'ri-dashboard-line' },
  { label: 'Content', path: '/admin/content', icon: 'ri-article-line' },
  { label: 'YouTube Sync', path: '/admin/youtube-sync', icon: 'ri-youtube-line' },
  { label: 'Events & Tickets', path: '/admin/events', icon: 'ri-calendar-event-line' },
  { label: 'Applications', path: '/admin/applications', icon: 'ri-file-list-3-line' },
  { label: 'Users', path: '/admin/users', icon: 'ri-group-line' },
  { label: 'Analytics', path: '/admin/analytics', icon: 'ri-bar-chart-line' },
  { label: 'Settings', path: '/admin/settings', icon: 'ri-settings-3-line' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-background-100 border-r border-background-300/30 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-background-300/30">
          <img src={logoUrl} alt="TribeDala" className="h-7 w-auto object-contain" />
          <span className="text-xs font-medium bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">Admin</span>
        </div>

        {/* Links */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-foreground-400 hover:text-foreground-200 hover:bg-background-200'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${link.icon} text-base`} />
              </div>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-background-300/30 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground-500 hover:text-foreground-200 hover:bg-background-200 transition-colors"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-left-line text-sm" />
            </div>
            Back to Site
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground-500 hover:text-accent-400 hover:bg-background-200 transition-colors w-full"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-logout-box-line text-sm" />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="h-14 lg:hidden flex items-center gap-3 px-4 border-b border-background-300/30 bg-background-50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-md text-foreground-200 hover:bg-background-200"
          >
            <i className="ri-menu-line text-lg" />
          </button>
          <img src={logoUrl} alt="TribeDala" className="h-6 w-auto object-contain" />
          <span className="text-xs font-medium bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
