import { useState, useEffect } from 'react';
import supabase from '@/hooks/useSupabase';

type GuestRequest = any;

const tabs = ['All', 'Pending', 'Reviewed', 'Approved', 'Rejected'];
const requestTypes = ['All', 'Guest', 'Creator'];

export default function AdminGuestRequests() {
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'reviewed' | 'approved' | 'rejected'>('reviewed');
  const [adminNotes, setAdminNotes] = useState('');

  async function fetchRequests() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('guest_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = requests
    .filter((req) => activeTab === 'All' || req.status === activeTab.toLowerCase())
    .filter((req) => activeType === 'All' || (req.request_type === 'guest' ? 'Guest' : 'Creator') === activeType)
    .filter((req) => req.name.toLowerCase().includes(search.toLowerCase()) || req.email.toLowerCase().includes(search.toLowerCase()));

  async function handleUpdateStatus(request: GuestRequest, status: string, notes: string) {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('guest_requests')
        .update({
          status: status as any,
          admin_notes: notes || null,
        })
        .eq('id', request.id);

      if (error) throw error;
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (error) {
      alert('Error updating request: ' + (error as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  function openModal(request: GuestRequest) {
    setSelectedRequest(request);
    setNewStatus((request.status as any) || 'reviewed');
    setAdminNotes(request.admin_notes || '');
    setShowModal(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl md:text-2xl text-foreground-50">Guest Requests & Collaboration Pitches</h1>
        <p className="text-sm text-foreground-500 mt-1">Review and manage show guest requests and creator service applications.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Requests', value: requests.length },
          { label: 'Pending', value: requests.filter((r) => r.status === 'pending').length },
          { label: 'Approved', value: requests.filter((r) => r.status === 'approved').length },
          { label: 'Rejected', value: requests.filter((r) => r.status === 'rejected').length },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs text-foreground-500">{stat.label}</p>
            <p className="text-2xl font-heading font-bold text-foreground-50">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Filter */}
          <div className="flex gap-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-primary-500 text-background-50'
                    : 'bg-background-100 text-foreground-400 hover:text-foreground-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex gap-1 flex-wrap">
            {requestTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeType === type
                    ? 'bg-accent-500 text-background-50'
                    : 'bg-background-100 text-foreground-400 hover:text-foreground-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-500 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background-100 border border-background-300/60 text-sm text-foreground-50 placeholder-foreground-600 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-background-200" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => (
            <div key={request.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold text-foreground-50 truncate">{request.name}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                        request.request_type === 'guest'
                          ? 'bg-primary-500/15 text-primary-400'
                          : 'bg-accent-500/15 text-accent-400'
                      }`}
                    >
                      {request.request_type === 'guest' ? 'Guest Request' : 'Creator Services'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                        request.status === 'pending'
                          ? 'bg-yellow-500/15 text-yellow-400'
                          : request.status === 'approved'
                          ? 'bg-green-500/15 text-green-400'
                          : request.status === 'rejected'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-foreground-500/15 text-foreground-400'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-500">{request.email}</p>
                  {request.phone && <p className="text-xs text-foreground-600">{request.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground-400">
                {request.bio && <p><span className="font-medium text-foreground-300">Bio:</span> {request.bio.substring(0, 100)}...</p>}
                {request.request_type === 'guest' && request.guest_topics && (
                  <p><span className="font-medium text-foreground-300">Topics:</span> {request.guest_topics.substring(0, 100)}...</p>
                )}
                {request.request_type === 'creator' && request.service_type && (
                  <p><span className="font-medium text-foreground-300">Service:</span> {request.service_type}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-foreground-600">
                <span>{new Date(request.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => openModal(request)}
                  className="px-3 py-1.5 rounded-md bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors text-xs font-medium"
                >
                  Review & Update
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-sm text-foreground-600 text-center py-8">No requests found.</p>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 overflow-hidden">
          <div className="bg-background-100 rounded-t-xl md:rounded-xl border border-background-300/40 w-full md:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-background-300/30 flex-shrink-0">
              <div>
                <h2 className="font-heading font-semibold text-foreground-50">{selectedRequest.name}</h2>
                <p className="text-xs text-foreground-500">{selectedRequest.email}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-foreground-500 hover:text-foreground-200"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-foreground-200 mb-2">Personal Information</h3>
                <div className="space-y-1 text-sm text-foreground-400">
                  {selectedRequest.phone && <p><span className="text-foreground-300">Phone:</span> {selectedRequest.phone}</p>}
                  {selectedRequest.website && (
                    <p>
                      <span className="text-foreground-300">Website:</span>{' '}
                      <a href={selectedRequest.website} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">
                        {selectedRequest.website}
                      </a>
                    </p>
                  )}
                  {selectedRequest.bio && <p><span className="text-foreground-300">Bio:</span> {selectedRequest.bio}</p>}
                </div>
              </div>

              {/* Social Handles */}
              {selectedRequest.social_handles && Object.keys(selectedRequest.social_handles).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground-200 mb-2">Social Media</h3>
                  <div className="space-y-1 text-sm text-foreground-400">
                    {Object.entries(selectedRequest.social_handles as Record<string, string>).map(([key, value]) => (
                      <p key={key}>
                        <span className="text-foreground-300 capitalize">{key}:</span> {value}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Guest-Specific */}
              {selectedRequest.request_type === 'guest' && (
                <>
                  {selectedRequest.guest_topics && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground-200 mb-2">Topics of Interest</h3>
                      <p className="text-sm text-foreground-400">{selectedRequest.guest_topics}</p>
                    </div>
                  )}
                  {selectedRequest.previous_podcast_experience && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground-200 mb-2">Podcast Experience</h3>
                      <p className="text-sm text-foreground-400">{selectedRequest.previous_podcast_experience}</p>
                    </div>
                  )}
                </>
              )}

              {/* Creator-Specific */}
              {selectedRequest.request_type === 'creator' && (
                <>
                  {selectedRequest.service_type && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground-200 mb-2">Service Type</h3>
                      <p className="text-sm text-foreground-400 capitalize">{selectedRequest.service_type}</p>
                    </div>
                  )}
                  {selectedRequest.portfolio_link && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground-200 mb-2">Portfolio</h3>
                      <a
                        href={selectedRequest.portfolio_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-400 hover:text-primary-300"
                      >
                        View Portfolio
                      </a>
                    </div>
                  )}
                  {selectedRequest.service_description && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground-200 mb-2">Service Description</h3>
                      <p className="text-sm text-foreground-400">{selectedRequest.service_description}</p>
                    </div>
                  )}
                </>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-semibold text-foreground-200 mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this request for future reference..."
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-semibold text-foreground-200 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-foreground-600">
                <p>Submitted: {new Date(selectedRequest.created_at).toLocaleString()}</p>
                {selectedRequest.updated_at && (
                  <p>Updated: {new Date(selectedRequest.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-background-300/30 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-md text-sm border border-background-300/60 text-foreground-400 hover:text-foreground-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest, newStatus, adminNotes)}
                disabled={updating}
                className="flex-1 btn-primary text-sm py-2"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
