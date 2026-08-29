const applications = [
  {
    id: 'app-1',
    type: 'Creator Application',
    category: 'Podcaster',
    status: 'pending',
    submittedAt: '2026-08-01',
    message: 'Your application is being reviewed by our team. We typically respond within 5-7 business days.',
    icon: 'ri-mic-line',
    color: 'text-primary-500',
    bg: 'bg-primary-500/10',
    statusColor: 'bg-secondary-500',
  },
  {
    id: 'app-2',
    type: 'Podcast Guest Request',
    category: 'Tribe Dala Podcast',
    status: 'approved',
    submittedAt: '2026-07-20',
    message: 'Great news! You\'ve been selected as a guest. Our team will reach out to schedule your recording session.',
    icon: 'ri-user-voice-line',
    color: 'text-accent-500',
    bg: 'bg-accent-500/10',
    statusColor: 'bg-primary-500',
  },
  {
    id: 'app-3',
    type: 'Event Organizer Application',
    category: 'Event Organizer',
    status: 'rejected',
    submittedAt: '2026-07-10',
    message: 'Unfortunately, your application was not approved at this time. You can apply again after 30 days.',
    icon: 'ri-calendar-event-line',
    color: 'text-foreground-400',
    bg: 'bg-background-200',
    statusColor: 'bg-accent-500',
  },
];

const statusLabels = {
  pending: 'Under Review',
  approved: 'Approved',
  rejected: 'Not Approved',
};

export default function DashboardApplications() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground-50">Applications</h1>
          <p className="text-sm text-foreground-500 mt-1">Track the status of your submissions and requests.</p>
        </div>
        <a
          href="/get-involved"
          className="btn-primary text-xs md:text-sm px-5 py-2.5 rounded-lg hidden sm:inline-flex"
        >
          <i className="ri-add-line mr-1.5" />
          New Application
        </a>
      </div>

      <div className="space-y-3">
        {applications.map((app) => (
          <div key={app.id} className="card p-5 hover:bg-background-200/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg ${app.bg} flex items-center justify-center flex-shrink-0`}>
                <i className={`${app.icon} ${app.color} text-lg`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-heading font-semibold text-sm text-foreground-100">{app.type}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    app.status === 'approved' ? 'bg-primary-500/15 text-primary-500' :
                    app.status === 'rejected' ? 'bg-accent-500/15 text-accent-500' :
                    'bg-secondary-500/15 text-secondary-500'
                  }`}>
                    {statusLabels[app.status as keyof typeof statusLabels]}
                  </span>
                </div>
                <p className="text-xs text-foreground-500 mb-2">
                  {app.category} &middot; Submitted {app.submittedAt}
                </p>
                <p className="text-xs text-foreground-400 leading-relaxed">{app.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile CTA */}
      <div className="sm:hidden">
        <a
          href="/get-involved"
          className="btn-primary w-full text-sm py-3 justify-center rounded-lg"
        >
          <i className="ri-add-line mr-1.5" />
          New Application
        </a>
      </div>
    </div>
  );
}