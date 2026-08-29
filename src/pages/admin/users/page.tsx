import { useState, useEffect } from 'react';
import supabase from '@/hooks/useSupabase';

const tabs = ['All', 'Members', 'Creators', 'Organizers', 'Businesses', 'Official', 'Suspended'];

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  creator_category: string;
  verified: boolean;
  status: string;
  created_at: string;
  location: string;
}

const roleColors: Record<string, string> = {
  official: 'bg-primary-500/15 text-primary-400',
  creator: 'bg-accent-500/15 text-accent-400',
  organizer: 'bg-secondary-500/15 text-secondary-400',
  business: 'bg-blue-500/15 text-blue-400',
  member: 'bg-foreground-500/15 text-foreground-400',
  admin: 'bg-green-500/15 text-green-400',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Users fetch error:', error);
      setUsers([]);
      setLoading(false);
      return;
    }
    setUsers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => {
    if (activeTab === 'Members') return u.role === 'member';
    if (activeTab === 'Creators') return u.role === 'creator';
    if (activeTab === 'Organizers') return u.role === 'organizer';
    if (activeTab === 'Businesses') return u.role === 'business';
    if (activeTab === 'Official') return u.role === 'official';
    if (activeTab === 'Suspended') return u.status === 'suspended';
    return true;
  }).filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleSuspend(user: AdminUser) {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    await supabase.from('users').update({ status: newStatus }).eq('id', user.id);
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
    setActionUserId(null);
  }

  async function toggleVerify(user: AdminUser) {
    await supabase.from('users').update({ verified: !user.verified }).eq('id', user.id);
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, verified: !u.verified } : u));
    setActionUserId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl md:text-2xl text-foreground-50">User Management</h1>
        <p className="text-sm text-foreground-500 mt-1">{users.length} total users across all roles.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-400 hover:text-foreground-200'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-500 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background-300/30">
                <th className="text-left p-3 font-medium text-foreground-500 text-xs">User</th>
                <th className="text-left p-3 font-medium text-foreground-500 text-xs hidden md:table-cell">Role</th>
                <th className="text-left p-3 font-medium text-foreground-500 text-xs hidden lg:table-cell">Category</th>
                <th className="text-left p-3 font-medium text-foreground-500 text-xs">Status</th>
                <th className="text-left p-3 font-medium text-foreground-500 text-xs hidden lg:table-cell">Joined</th>
                <th className="text-right p-3 font-medium text-foreground-500 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="p-3"><div className="h-10 bg-background-200 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.map((u) => (
                <tr key={u.id} className="border-b border-background-300/20 hover:bg-background-100/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-background-200 flex items-center justify-center text-xs font-medium text-foreground-400">
                        {u.full_name?.charAt(0) ?? '?'}
                      </div>
                      <div>
                        <p className="text-foreground-100 font-medium text-sm flex items-center gap-1.5">
                          {u.full_name}
                          {u.verified && (
                            <span className="w-4 h-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                              <i className="ri-verified-badge-fill text-[10px] text-primary-400" />
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-foreground-600">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[u.role] ?? 'text-foreground-500'}`}>{u.role}</span>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-foreground-400 text-xs">{u.creator_category || '—'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.status === 'active' ? 'bg-green-500/15 text-green-400' :
                      u.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-accent-500/15 text-accent-400'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 hidden lg:table-cell text-foreground-500 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-right relative">
                    <button onClick={() => setActionUserId(actionUserId === u.id ? null : u.id)}
                      className="w-8 h-8 rounded-md inline-flex items-center justify-center text-foreground-500 hover:text-foreground-200 hover:bg-background-200 transition-colors">
                      <i className="ri-more-2-fill text-sm" />
                    </button>
                    {actionUserId === u.id && (
                      <div className="absolute right-3 top-10 z-10 bg-background-100 border border-background-300/40 rounded-lg shadow-lg py-1 min-w-[140px]">
                        <button onClick={() => toggleVerify(u)}
                          className="w-full text-left px-3 py-2 text-xs text-foreground-300 hover:bg-background-200 transition-colors">
                          {u.verified ? 'Remove Verification' : 'Verify User'}
                        </button>
                        <button onClick={() => toggleSuspend(u)}
                          className="w-full text-left px-3 py-2 text-xs text-accent-400 hover:bg-background-200 transition-colors">
                          {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && <div className="p-8 text-center text-sm text-foreground-600">No users found.</div>}
      </div>
    </div>
  );
}
