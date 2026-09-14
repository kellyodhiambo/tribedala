import { useState, useEffect } from 'react';
import supabase from '@/hooks/useSupabase';

const tabs = ['All', 'Pending', 'Approved'];

interface CreatorRequest {
  id: string;
  full_name: string;
  email: string;
  creator_request_category: string;
  creator_request_reason: string;
  creator_request_date: string;
  creator_approved: boolean;
  creator_approved_date?: string;
}

export default function AdminApplications() {
  const [requests, setRequests] = useState<CreatorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<CreatorRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  async function fetchRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, creator_request, creator_request_category, creator_request_reason, creator_request_date, creator_approved, creator_approved_date')
      .eq('creator_request', true)
      .order('creator_request_date', { ascending: false });

    if (error) {
      console.error('Creator requests fetch error:', error);
    } else {
      setRequests((data ?? []) as CreatorRequest[]);
    }

    setLoading(false);
  }

  useEffect(() => { fetchRequests(); }, []);

  const filtered = requests.filter((req) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return !req.creator_approved;
    if (activeTab === 'Approved') return req.creator_approved;
    return false;
  });

  const pendingCount = requests.filter((r) => !r.creator_approved).length;

  async function handleApprove() {
    if (!selectedRequest) return;
    setProcessing(true);

    const { error } = await supabase
      .from('users')
      .update({
        creator_approved: true,
        creator_approved_date: new Date().toISOString(),
        role: 'creator',
        status: 'active',
        verified: true,
      })
      .eq('id', selectedRequest.id);

    if (error) {
      console.error('Error approving request:', error);
    } else {
      setSelectedRequest((prev) => prev ? { ...prev, creator_approved: true, creator_approved_date: new Date().toISOString() } : null);
      await fetchRequests();
    }

    setProcessing(false);
  }

  async function handleReject() {
    if (!selectedRequest) return;
    setProcessing(true);

    const { error } = await supabase
      .from('users')
      .update({
        creator_request: false,
      })
      .eq('id', selectedRequest.id);

    if (error) {
      console.error('Error rejecting request:', error);
    } else {
      await fetchRequests();
      setSelectedRequest(null);
    }

    setProcessing(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl md:text-2xl text-foreground-50">Creator Requests</h1>
        <p className="text-sm text-foreground-500 mt-1">
          {pendingCount} pending — {requests.length} total requests.
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
          ) : filtered.length > 0 ? filtered.map((req) => (
            <button key={req.id} onClick={() => setSelectedRequest(req)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedRequest?.id === req.id ? 'border-primary-500/50 bg-primary-500/5' : 'border-background-300/30 bg-background-100 hover:border-background-400'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground-50 truncate">
                    {req.full_name}
                  </h4>
                  <p className="text-xs text-foreground-500 mt-0.5">
                    {req.creator_request_category} — {new Date(req.creator_request_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                  !req.creator_approved ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400'
                }`}>
                  {req.creator_approved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </button>
          )) : (
            <p className="text-center text-sm text-foreground-600 py-8">No requests found.</p>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="card p-5 space-y-4 sticky top-20">
              <div>
                <h3 className="font-heading font-semibold text-foreground-50">
                  {selectedRequest.full_name}
                </h3>
                <p className="text-xs text-foreground-500 mt-0.5">{selectedRequest.email}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-500">Category:</span>
                  <span className="text-foreground-200">{selectedRequest.creator_request_category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-500">Date:</span>
                  <span className="text-foreground-200">{new Date(selectedRequest.creator_request_date).toLocaleDateString()}</span>
                </div>
                {selectedRequest.creator_approved_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-500">Approved:</span>
                    <span className="text-green-400">{new Date(selectedRequest.creator_approved_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              {selectedRequest.creator_request_reason && (
                <div>
                  <p className="text-xs text-foreground-500 mb-1">Reason:</p>
                  <p className="text-sm text-foreground-200 leading-relaxed whitespace-pre-line">{selectedRequest.creator_request_reason}</p>
                </div>
              )}
              {!selectedRequest.creator_approved && (
                <div className="flex gap-2 pt-2 border-t border-background-300/30">
                  <button onClick={handleApprove} disabled={processing}
                    className="flex-1 py-2 rounded-md text-sm font-medium bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50">
                    {processing ? '...' : 'Approve'}
                  </button>
                  <button onClick={handleReject} disabled={processing}
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
