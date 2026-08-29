import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '@/hooks/useSupabase';

interface Stats {
  totalMembers: number;
  totalCreators: number;
  totalEvents: number;
  pendingApplications: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  created_at: string;
}

const colorMap: Record<string, string> = {
  primary: 'bg-primary-500/15 text-primary-400',
  accent: 'bg-accent-500/15 text-accent-400',
  secondary: 'bg-secondary-500/15 text-secondary-400',
};

const statusStyles: Record<string, { bg: string; dot: string }> = {
  new: { bg: 'bg-accent-500/10 border-accent-500/30', dot: 'bg-accent-500' },
  info: { bg: 'bg-primary-500/10 border-primary-500/30', dot: 'bg-primary-500' },
  success: { bg: 'bg-green-500/10 border-green-500/30', dot: 'bg-green-500' },
  warning: { bg: 'bg-yellow-500/10 border-yellow-500/30', dot: 'bg-yellow-500' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, totalCreators: 0, totalEvents: 0, pendingApplications: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [members, creators, events, apps] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'member'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'creator'),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('creator_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalMembers: members.count ?? 0,
        totalCreators: creators.count ?? 0,
        totalEvents: events.count ?? 0,
        pendingApplications: apps.count ?? 0,
      });

      const { data: activityData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(7);

      if (activityData) {
        setActivity(activityData.map((item) => ({
          id: item.id,
          type: item.read ? 'info' : 'new',
          message: item.title || item.body || 'New activity',
          created_at: item.created_at,
        })));
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Members', value: stats.totalMembers.toLocaleString(), icon: 'ri-group-line', color: 'primary' },
    { label: 'Verified Creators', value: stats.totalCreators.toLocaleString(), icon: 'ri-user-star-line', color: 'accent' },
    { label: 'Events Hosted', value: stats.totalEvents.toLocaleString(), icon: 'ri-calendar-event-line', color: 'secondary' },
    { label: 'Pending Apps', value: stats.pendingApplications.toLocaleString(), icon: 'ri-file-list-3-line', color: 'accent' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl md:text-2xl text-foreground-50">Dashboard</h1>
        <p className="text-sm text-foreground-500 mt-1">Welcome back. Here&apos;s what&apos;s happening with TribeDala.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
              <i className={`${stat.icon} text-base`} />
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-background-200 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-heading font-bold text-foreground-50">{stat.value}</p>
            )}
            <p className="text-xs text-foreground-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'New Blog Post', path: '/admin/content', icon: 'ri-article-line' },
          { label: 'Create Event', path: '/admin/events', icon: 'ri-calendar-event-line' },
          { label: 'Review Applications', path: '/admin/applications', icon: 'ri-file-list-3-line' },
          { label: 'Manage Users', path: '/admin/users', icon: 'ri-group-line' },
        ].map((action) => (
          <Link
            key={action.label}
            to={action.path}
            className="card p-4 flex items-center gap-3 hover:border-primary-500/40 transition-colors group"
          >
            <div className="w-9 h-9 rounded-md bg-background-200 flex items-center justify-center text-foreground-400 group-hover:text-primary-400 transition-colors">
              <i className={`${action.icon} text-base`} />
            </div>
            <span className="text-sm font-medium text-foreground-200 group-hover:text-foreground-50 transition-colors whitespace-nowrap">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b border-background-300/30">
          <h3 className="font-heading font-semibold text-sm text-foreground-50">Recent Activity</h3>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-background-200 rounded animate-pulse" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="p-8 text-center text-sm text-foreground-600">No recent activity.</div>
        ) : (
          <div className="divide-y divide-background-300/20">
            {activity.map((item) => {
              const style = statusStyles[item.type] ?? statusStyles.info;
              return (
                <div key={item.id} className={`px-4 py-3 flex items-start gap-3 ${style.bg} border-l-2`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground-200">{item.message}</p>
                    <p className="text-xs text-foreground-600 mt-0.5">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
