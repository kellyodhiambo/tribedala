import { useState, useEffect } from 'react';
import supabase from '@/hooks/useSupabase';

const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

type RequestSource = 'creator' | 'service';

interface Application {
  id: string;
  applicant: string;
  email: string;
  type: string;
  category: string;
  created_at: string;
  status: string;
  details: string;
  user_id: string;
  source: RequestSource;
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [processing, setProcessing] = useState(false);

  async function fetchApplications() {
    setLoading(true);

    const [creatorResult, serviceResult] = await Promise.all([
      supabase.from('creator_applications').select('*').order('created_at', { ascending: false }),
      supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
    ]);

    if (creatorResult.error) {
      console.error('Creator applications fetch error:', creatorResult.error);
    }

    if (serviceResult.error) {
      console.error('Service requests fetch error:', serviceResult.error);
    }

    const creatorRequests = (creatorResult.data ?? []).map((item) => ({
      id: item.id,
      applicant: item.full_name ?? item.user_id ?? 'Applicant',
      email: item.email ?? '',
      type: item.role_requested ?? 'Creator',
      category: item.category ?? '—',
      created_at: item.created_at,
      status: item.status ?? 'pending',
      details: item.reason ?? '',
      user_id: item.user_id,
      source: 'creator' as const,
    }));

    const serviceRequests = (serviceResult.data ?? []).map((item) => ({
      id: item.id,
      applicant: item.user_id ?? 'Applicant',
      email: item.contact_email ?? '',
      type: item.service_type ?? 'Request',
      category: '—',
      created_at: item.created_at,
      status: item.status ?? 'pending',
      details: item.details ?? '',
      user_id: item.user_id,
      source: 'service' as const,
    }));

    setApplications([...creatorRequests, ...serviceRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setLoading(false);
  }

  useEffect(() => { fetchApplications(); }, []);

  const filtered = applications.filter((app) =>
    activeTab === 'All' || app.status === activeTab.toLowerCase()
  );

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  async function handleAction(action: 'approved' | 'rejected') {
    if (!selectedApp) return;
    setProcessing(true);

    if (selectedApp.source === 'creator') {
      await supabase.from('creator_applications').update({ status: action }).eq('id', selectedApp.id);

      if (action === 'approved' && selectedApp.user_id) {
        const roleMap: Record<string, string> = { Creator: 'creator', Organizer: 'organizer' };
        const newRole = roleMap[selectedApp.type];
        if (newRole) {
          await supabase.from('users').update({
            role: newRole,
            creator_category: selectedApp.category !== '—' ? selectedApp.category : 'other',
            verified: true,
            status: 'active',
          }).eq('id', selectedApp.user_id);
        }
      }
    } else {
      await supabase.from('service_requests').update({ status: action }).eq('id', selectedApp.id);
    }

    setApplications((prev) => prev.map((a) => a.id === selectedApp.id ? { ...a, status: action } : a));
    setSelectedApp((prev) => prev ? { ...prev, status: action } : null);
    setProcessing(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl md:text-2xl text-foreground-50">Applications</h1>
        <p className="text-sm text-foreground-500 mt-1">
          {pendingCount} pending — {applications.length} total requests.
        </p>
      </div>

      <div className="flex gap-1 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-400 hover:text-foreground-200'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-16 bg-background-200 rounded-lg animate-pulse" />)
          ) : filtered.map((app) => (
            <button key={app.id} onClick={() => setSelectedApp(app)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedApp?.id === app.id ? 'border-primary-500/50 bg-primary-500/5' : 'border-background-300/30 bg-background-100 hover:border-background-400'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground-50 truncate">
                    {app.source === 'service' ? app.email || 'Community request' : app.applicant}
                  </h4>
                  <p className="text-xs text-foreground-500 mt-0.5">
                    {app.type}{app.category && app.category !== '—' ? ` · ${app.category}` : ''} — {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                  app.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                  app.status === 'approved' ? 'bg-green-500/15 text-green-400' :
                  'bg-accent-500/15 text-accent-400'}`}>
                  {app.status}
                </span>
              </div>
            </button>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-sm text-foreground-600 py-8">No requests found.</p>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedApp ? (
            <div className="card p-5 space-y-4 sticky top-20">
              <div>
                <h3 className="font-heading font-semibold text-foreground-50">
                  {selectedApp.source === 'service' ? (selectedApp.email || 'Community request') : selectedApp.applicant}
                </h3>
                <p className="text-xs text-foreground-500 mt-0.5">{selectedApp.email || 'Community request'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-500">Type:</span>
                  <span className="text-foreground-200">{selectedApp.type}</span>
                </div>
                {selectedApp.category && selectedApp.category !== '—' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-500">Category:</span>
                    <span className="text-foreground-200">{selectedApp.category}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-500">Date:</span>
                  <span className="text-foreground-200">{new Date(selectedApp.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {selectedApp.details && (
                <div>
                  <p className="text-xs text-foreground-500 mb-1">Details:</p>
                  <p className="text-sm text-foreground-200 leading-relaxed whitespace-pre-line">{selectedApp.details}</p>
                </div>
              )}
              {selectedApp.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-background-300/30">
                  <button onClick={() => handleAction('approved')} disabled={processing}
                    className="flex-1 py-2 rounded-md text-sm font-medium bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50">
                    {processing ? '...' : 'Approve'}
                  </button>
                  <button onClick={() => handleAction('rejected')} disabled={processing}
                    className="flex-1 py-2 rounded-md text-sm font-medium bg-accent-500/15 text-accent-400 hover:bg-accent-500/25 transition-colors disabled:opacity-50">
                    {processing ? '...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center text-sm text-foreground-600">
              Select a request to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
