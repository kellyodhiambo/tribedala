import { Link } from 'react-router-dom';

const stats = [
  { value: '5', label: 'Events Attended', icon: 'ri-calendar-check-line', color: 'text-primary-500', bg: 'bg-primary-500/10' },
  { value: '2', label: 'Applications', icon: 'ri-file-list-line', color: 'text-accent-500', bg: 'bg-accent-500/10' },
  { value: '12', label: 'Saved Episodes', icon: 'ri-bookmark-line', color: 'text-secondary-500', bg: 'bg-secondary-500/10' },
  { value: 'Member', label: 'Account Type', icon: 'ri-user-line', color: 'text-foreground-300', bg: 'bg-background-200' },
];

const recentActivity = [
  { id: 1, action: 'Registered for Tribe Vibe Festival 2026', time: '2 hours ago', icon: 'ri-ticket-line', color: 'text-primary-500' },
  { id: 2, action: 'Saved "The Rise of Kenyan Podcasting" episode', time: '1 day ago', icon: 'ri-bookmark-line', color: 'text-secondary-500' },
  { id: 3, action: 'Application submitted: Creator (Podcaster)', time: '3 days ago', icon: 'ri-file-list-line', color: 'text-accent-500' },
  { id: 4, action: 'Joined TribeDala community', time: '1 week ago', icon: 'ri-user-add-line', color: 'text-foreground-400' },
];

const quickActions = [
  { label: 'Browse Events', path: '/events', icon: 'ri-calendar-event-line' },
  { label: 'Explore Shows', path: '/shows', icon: 'ri-mic-line' },
  { label: 'Discover Creators', path: '/creators', icon: 'ri-user-star-line' },
  { label: 'Get Involved', path: '/get-involved', icon: 'ri-user-add-line' },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground-50">
          Welcome back, Creator
        </h1>
        <p className="text-sm text-foreground-500 mt-1">
          Here&apos;s what&apos;s happening with your TribeDala account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4 md:p-5 hover:bg-background-200/40 transition-colors">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <i className={`${stat.icon} ${stat.color} text-base`} />
            </div>
            <p className="font-heading font-bold text-xl md:text-2xl text-foreground-50">{stat.value}</p>
            <p className="text-xs text-foreground-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-heading font-semibold text-base text-foreground-100 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="card p-4 text-center hover:bg-background-200/40 hover:border-primary-500/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                <i className={`${action.icon} text-primary-500 group-hover:text-background-50 text-lg`} />
              </div>
              <span className="text-xs font-medium text-foreground-300 group-hover:text-foreground-100 transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-heading font-semibold text-base text-foreground-100 mb-3">Recent Activity</h2>
        <div className="card divide-y divide-background-300/20">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-4 hover:bg-background-200/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-background-200 flex items-center justify-center flex-shrink-0">
                <i className={`${activity.icon} ${activity.color} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground-200">{activity.action}</p>
                <p className="text-xs text-foreground-600 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
