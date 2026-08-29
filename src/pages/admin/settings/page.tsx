const sectionCards = [
  { id: 'hero', title: 'Hero Section', description: 'Slogan, CTA buttons, background video', icon: 'ri-home-line' },
  { id: 'content', title: 'Featured Content', description: 'Latest episodes, blog posts, spotlights', icon: 'ri-article-line' },
  { id: 'nav', title: 'Navigation', description: 'Menu items, footer links, Shows dropdown', icon: 'ri-menu-line' },
  { id: 'brand', title: 'Branding', description: 'Logo, colors, typography', icon: 'ri-palette-line' },
  { id: 'notifications', title: 'Notifications', description: 'Email templates, in-app notification settings', icon: 'ri-notification-3-line' },
  { id: 'integrations', title: 'Integrations', description: 'Resend, payment gateways, social media', icon: 'ri-plug-line' },
];

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-xl md:text-2xl text-foreground-50">Site Settings</h1>
        <p className="text-sm text-foreground-500 mt-1">Configure your TribeDala site appearance and behavior.</p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sectionCards.map((card) => (
          <button
            key={card.id}
            className="card p-4 text-left flex items-start gap-4 hover:border-primary-500/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-md bg-background-200 flex items-center justify-center text-foreground-400 group-hover:text-primary-400 transition-colors shrink-0">
              <i className={`${card.icon} text-lg`} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-foreground-100 group-hover:text-foreground-50 transition-colors">{card.title}</h4>
              <p className="text-xs text-foreground-500 mt-0.5">{card.description}</p>
            </div>
            <div className="shrink-0 w-5 h-5 flex items-center justify-center text-foreground-600">
              <i className="ri-arrow-right-s-line text-base" />
            </div>
          </button>
        ))}
      </div>

      {/* Newsletter Tool */}
      <div className="card p-5">
        <h3 className="font-heading font-semibold text-sm text-foreground-50 mb-4">Newsletter Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="newsletter-from-name" className="block text-sm text-foreground-300 mb-1.5">Sender Name</label>
            <input
              id="newsletter-from-name"
              type="text"
              defaultValue="TribeDala"
              className="w-full max-w-sm px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="newsletter-from-email" className="block text-sm text-foreground-300 mb-1.5">Sender Email</label>
            <input
              id="newsletter-from-email"
              type="email"
              defaultValue="hello@tribedala.co.ke"
              className="w-full max-w-sm px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="newsletter-footer" className="block text-sm text-foreground-300 mb-1.5">Footer Text</label>
            <textarea
              id="newsletter-footer"
              rows={2}
              defaultValue="You're receiving this because you joined the TribeDala community."
              className="w-full max-w-sm px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
          <button className="btn-primary text-sm">Save Newsletter Settings</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-5 border-accent-500/30">
        <h3 className="font-heading font-semibold text-sm text-accent-400 mb-2">Danger Zone</h3>
        <p className="text-xs text-foreground-500 mb-4">Irreversible actions. Proceed with caution.</p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-md text-sm font-medium border border-accent-500/40 text-accent-400 hover:bg-accent-500/10 transition-colors whitespace-nowrap">
            Reset Analytics
          </button>
          <button className="px-4 py-2 rounded-md text-sm font-medium border border-accent-500/40 text-accent-400 hover:bg-accent-500/10 transition-colors whitespace-nowrap">
            Purge Draft Content
          </button>
        </div>
      </div>
    </div>
  );
}