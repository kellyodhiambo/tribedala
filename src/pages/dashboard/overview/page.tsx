import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';

const quickActions = [
  { label: 'Browse Events', path: '/events', icon: 'ri-calendar-event-line' },
  { label: 'Explore Shows', path: '/shows', icon: 'ri-mic-line' },
  { label: 'Discover Creators', path: '/creators', icon: 'ri-user-star-line' },
  { label: 'Get Involved', path: '/get-involved', icon: 'ri-user-add-line' },
];

interface ActivityItem {
  id: string;
  action: string;
  time: string;
  icon: string;
  color: string;
}

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    eventsAttended: 0,
    applications: 0,
    savedEpisodes: 0,
    accountType: 'Member',
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !profile) return;

    async function fetchStats() {
      if (!user || !user.id) return;

      try {
        // Get events attended count
        const { count: eventsCount } = await supabase
          .from('event_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get applications/creator requests count
        const { data: creatorRequests } = await supabase
          .from('users')
          .select('creator_request')
          .eq('id', user.id)
          .maybeSingle();

        const applicationsCount = creatorRequests?.creator_request ? 1 : 0;

        // Get saved episodes count
        const { count: savedEpisodesCount } = await supabase
          .from('saves')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('item_type', 'episode');

        // Get account type from profile
        const accountType = profile?.role 
          ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
          : 'Member';

        setStats({
          eventsAttended: eventsCount || 0,
          applications: applicationsCount,
          savedEpisodes: savedEpisodesCount || 0,
          accountType,
        });

        // Fetch recent activity
        const activities: ActivityItem[] = [];

        // Recent event registrations
        const { data: recentEvents } = await supabase
          .from('event_attendees')
          .select('created_at, event_id, events(title)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);

        recentEvents?.forEach((event: any) => {
          const eventTitle = event.events?.title || 'Event';
          activities.push({
            id: `event-${event.event_id}`,
            action: `Registered for ${eventTitle}`,
            time: formatTime(event.created_at),
            icon: 'ri-ticket-line',
            color: 'text-primary-500',
          });
        });

        // Recent saved episodes
        const { data: recentSaves } = await supabase
          .from('saves')
          .select('created_at, item_id, item_type, episodes(title)')
          .eq('user_id', user.id)
          .eq('item_type', 'episode')
          .order('created_at', { ascending: false })
          .limit(2);

        recentSaves?.forEach((save: any) => {
          const episodeTitle = save.episodes?.title || 'Episode';
          activities.push({
            id: `save-${save.item_id}`,
            action: `Saved "${episodeTitle}" episode`,
            time: formatTime(save.created_at),
            icon: 'ri-bookmark-line',
            color: 'text-secondary-500',
          });
        });

        // Creator application/request
        if (profile?.creator_request) {
          activities.push({
            id: 'creator-request',
            action: `Application submitted: Creator (${profile.creator_category || 'Creator'})`,
            time: formatTime(profile.creator_request_date || new Date().toISOString()),
            icon: 'ri-file-list-line',
            color: 'text-accent-500',
          });
        }

        // Account creation
        activities.push({
          id: 'account-created',
          action: 'Joined TribeDala community',
          time: formatTime(profile?.created_at || new Date().toISOString()),
          icon: 'ri-user-add-line',
          color: 'text-foreground-400',
        });

        // Sort by time and take most recent
        activities.sort((a, b) => {
          const timeToMinutes = (timeStr: string) => {
            if (timeStr.includes('ago')) {
              const num = parseInt(timeStr);
              const unit = timeStr.split(' ')[1];
              if (unit.includes('hour')) return num * 60;
              if (unit.includes('day')) return num * 1440;
              if (unit.includes('week')) return num * 10080;
              return num;
            }
            return 0;
          };
          return timeToMinutes(a.time) - timeToMinutes(b.time);
        });

        setRecentActivity(activities.slice(0, 4));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user?.id, profile?.id]);

  function formatTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  }

  const statItems = [
    { value: stats.eventsAttended, label: 'Events Attended', icon: 'ri-calendar-check-line', color: 'text-primary-500', bg: 'bg-primary-500/10' },
    { value: stats.applications, label: 'Applications', icon: 'ri-file-list-line', color: 'text-accent-500', bg: 'bg-accent-500/10' },
    { value: stats.savedEpisodes, label: 'Saved Episodes', icon: 'ri-bookmark-line', color: 'text-secondary-500', bg: 'bg-secondary-500/10' },
    { value: stats.accountType, label: 'Account Type', icon: 'ri-user-line', color: 'text-foreground-300', bg: 'bg-background-200' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground-50">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-foreground-500 mt-1">
          Here&apos;s what&apos;s happening with your TribeDala account.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 md:p-5 h-24 bg-background-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="card p-4 md:p-5 hover:bg-background-200/40 transition-colors">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <i className={`${stat.icon} ${stat.color} text-base`} />
              </div>
              <p className="font-heading font-bold text-xl md:text-2xl text-foreground-50">{stat.value}</p>
              <p className="text-xs text-foreground-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

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
        {loading ? (
          <div className="card space-y-2 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-background-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="card divide-y divide-background-300/20">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-4 hover:bg-background-200/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-background-200 flex items-center justify-center flex-shrink-0">
                    <i className={`${activity.icon} ${activity.color} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground-200">{activity.action}</p>
                    <p className="text-xs text-foreground-600 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-foreground-500">
                <p className="text-sm">No activity yet. Start exploring TribeDala!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
