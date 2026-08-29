import { useState, useEffect } from 'react';
import supabase from '@/hooks/useSupabase';

const colorMap: Record<string, string> = {
  primary: 'bg-primary-500/15 text-primary-400',
  accent: 'bg-accent-500/15 text-accent-400',
  secondary: 'bg-secondary-500/15 text-secondary-400',
};

interface ContentStat { type: string; count: number; views: number }
interface RoleStat { role: string; count: number }

export default function AdminAnalytics() {
  const [userCount, setUserCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [contentStats, setContentStats] = useState<ContentStat[]>([]);
  const [roleStats, setRoleStats] = useState<RoleStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const [users, events, apps] = await Promise.all([
        supabase.from('users').select('id, role'),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('creator_applications').select('id', { count: 'exact', head: true }),
      ]);

      setUserCount(users.data?.length ?? 0);
      setEventCount(events.count ?? 0);
      setAppCount(apps.count ?? 0);

      if (users.data) {
        const grouped: Record<string, number> = {};
        for (const u of users.data) {
          grouped[u.role ?? 'member'] = (grouped[u.role ?? 'member'] ?? 0) + 1;
        }
        setRoleStats(Object.entries(grouped).map(([role, count]) => ({ role, count })));
      }

      setContentStats([]);
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  const kpiCards = [
    { label: 'Total Users', value: userCount.toLocaleString(), icon: 'ri-group-line', color: 'primary' },
    { label: 'Total Events', value: eventCount.toLocaleString(), icon: 'ri-calendar-event-line', color: 'secondary' },
    { label: 'Applications', value: appCount.toLocaleString(), icon: 'ri-file-list-3-line', color: 'accent' },
    { label: 'Content Pieces', value: contentStats.reduce((s, c) => s + c.count, 0).toLocaleString(), icon: 'ri-article-line', color: 'primary' },
  ];

  const totalUsers = roleStats.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl md:text-2xl text-foreground-50">Analytics</h1>
        <p className="text-sm text-foreground-500 mt-1">Live data from your Supabase database.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-2 ${colorMap[kpi.color]}`}>
              <i className={`${kpi.icon} text-base`} />
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-background-200 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-xl font-heading font-bold text-foreground-50">{kpi.value}</p>
            )}
            <p className="text-xs text-foreground-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-heading font-semibold text-sm text-foreground-50 mb-4">Users by Role</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-background-200 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {roleStats.map((r) => (
                <div key={r.role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground-300 capitalize">{r.role}</span>
                    <span className="text-foreground-400">{r.count} ({Math.round((r.count / totalUsers) * 100)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-background-200 overflow-hidden">
                    <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${(r.count / totalUsers) * 100}%` }} />
                  </div>
                </div>
              ))}
              {roleStats.length === 0 && <p className="text-sm text-foreground-600">No data yet.</p>}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-heading font-semibold text-sm text-foreground-50 mb-4">Content by Type</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-background-200 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {contentStats.map((c) => (
                <div key={c.type} className="p-3 rounded-md bg-background-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground-200 capitalize">{c.type}</span>
                    <span className="text-sm font-heading font-bold text-foreground-50">{c.views.toLocaleString()} views</span>
                  </div>
                  <p className="text-xs text-foreground-500">{c.count} {c.count === 1 ? 'piece' : 'pieces'}</p>
                </div>
              ))}
              {contentStats.length === 0 && <p className="text-sm text-foreground-600">No content yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
