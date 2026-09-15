import { useState } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';
import type { Show } from '@/lib/queries';

interface GuestRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: 'guest' | 'creator'; // 'guest' for show guests, 'creator' for creator services
  shows?: Show[]; // Available shows (for guest requests)
  onSuccess?: () => void;
}

export default function GuestRequestModal({
  isOpen,
  onClose,
  requestType,
  shows = [],
  onSuccess,
}: GuestRequestModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedShows, setSelectedShows] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    website: '',
    twitterHandle: '',
    instagramHandle: '',
    tikTokHandle: '',
    youtubeHandle: '',
    // Guest-specific
    guestTopics: '',
    podcastExperience: '',
    // Creator services
    serviceType: '',
    portfolioLink: '',
    serviceDescription: '',
  });

  if (!isOpen || !user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!form.name.trim() || !form.email.trim()) {
        setError('Name and email are required');
        setLoading(false);
        return;
      }

      if (requestType === 'guest' && selectedShows.length === 0) {
        setError('Please select at least one show');
        setLoading(false);
        return;
      }

      if (requestType === 'creator' && !form.serviceType.trim()) {
        setError('Please specify the service type');
        setLoading(false);
        return;
      }

      // Build social handles object
      const socialHandles: Record<string, string> = {};
      if (form.twitterHandle) socialHandles.twitter = form.twitterHandle;
      if (form.instagramHandle) socialHandles.instagram = form.instagramHandle;
      if (form.tikTokHandle) socialHandles.tiktok = form.tikTokHandle;
      if (form.youtubeHandle) socialHandles.youtube = form.youtubeHandle;

      const payload: Record<string, any> = {
        user_id: user?.id,
        request_type: requestType,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        bio: form.bio || null,
        website: form.website || null,
        social_handles: Object.keys(socialHandles).length > 0 ? socialHandles : null,
        status: 'pending',
      };

      if (requestType === 'guest') {
        payload.shows = selectedShows;
        payload.guest_topics = form.guestTopics || null;
        payload.previous_podcast_experience = form.podcastExperience || null;
      } else if (requestType === 'creator') {
        payload.service_type = form.serviceType;
        payload.service_description = form.serviceDescription || null;
        payload.portfolio_link = form.portfolioLink || null;
      }

      const { error: insertError } = await supabase
        .from('guest_requests')
        .insert([payload]);

      if (insertError) throw insertError;

      // Success
      setForm({
        name: user?.user_metadata?.name || '',
        email: user?.email || '',
        phone: '',
        bio: '',
        website: '',
        twitterHandle: '',
        instagramHandle: '',
        tikTokHandle: '',
        youtubeHandle: '',
        guestTopics: '',
        podcastExperience: '',
        serviceType: '',
        portfolioLink: '',
        serviceDescription: '',
      });
      setSelectedShows([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4 overflow-hidden">
      <div className="bg-background-100 rounded-t-xl md:rounded-xl border border-background-300/40 w-full md:max-w-2xl h-[95vh] md:max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-background-300/30 flex-shrink-0">
          <h2 className="font-heading font-semibold text-foreground-50">
            {requestType === 'guest' ? 'Request to Be a Guest' : 'Request Creator Services'}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground-500 hover:text-foreground-200"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <p className="text-sm text-accent-400 bg-accent-500/10 border border-accent-500/30 rounded-md p-3">
              {error}
            </p>
          )}

          {/* Personal Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-200 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-foreground-400 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground-400 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground-400 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground-400 mb-1.5">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://yoursite.com"
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-foreground-400 mb-1.5">Bio / About You</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={2}
                className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>
          </div>

          {/* Social Handles */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-200 mb-3">Social Media (optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'twitterHandle', label: 'Twitter/X', placeholder: '@handle' },
                { id: 'instagramHandle', label: 'Instagram', placeholder: '@handle' },
                { id: 'tikTokHandle', label: 'TikTok', placeholder: '@handle' },
                { id: 'youtubeHandle', label: 'YouTube', placeholder: '@channel' },
              ].map((social) => (
                <div key={social.id}>
                  <label className="block text-xs text-foreground-400 mb-1.5">{social.label}</label>
                  <input
                    type="text"
                    value={form[social.id as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [social.id]: e.target.value })}
                    placeholder={social.placeholder}
                    className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Guest-Specific Fields */}
          {requestType === 'guest' && (
            <div>
              <h3 className="text-sm font-semibold text-foreground-200 mb-3">Guest Information</h3>

              {/* Show Selection */}
              <div className="mb-3">
                <label className="block text-xs text-foreground-400 mb-2">Which shows interest you? *</label>
                <div className="space-y-2">
                  {shows.map((show) => (
                    <label key={show.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedShows.includes(show.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedShows([...selectedShows, show.id]);
                          } else {
                            setSelectedShows(selectedShows.filter((id) => id !== show.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-background-300/60 bg-background-200 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-foreground-300">{show.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-foreground-400 mb-1.5">
                  What topics would you like to discuss?
                </label>
                <textarea
                  value={form.guestTopics}
                  onChange={(e) => setForm({ ...form, guestTopics: e.target.value })}
                  placeholder="e.g., Content creation, technology trends, personal growth..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-foreground-400 mb-1.5">
                  Previous Podcast Experience (optional)
                </label>
                <textarea
                  value={form.podcastExperience}
                  onChange={(e) => setForm({ ...form, podcastExperience: e.target.value })}
                  placeholder="Have you been on podcasts before? Tell us about it..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Creator Services Fields */}
          {requestType === 'creator' && (
            <div>
              <h3 className="text-sm font-semibold text-foreground-200 mb-3">Service Information</h3>

              <div>
                <label className="block text-xs text-foreground-400 mb-1.5">Service Type *</label>
                <select
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select a service...</option>
                  <option value="production">Video/Podcast Production</option>
                  <option value="editing">Editing & Post-Production</option>
                  <option value="writing">Writing & Copywriting</option>
                  <option value="design">Design & Graphics</option>
                  <option value="marketing">Marketing & Growth</option>
                  <option value="photography">Photography</option>
                  <option value="music">Music & Audio</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mt-3">
                <label className="block text-xs text-foreground-400 mb-1.5">Portfolio Link</label>
                <input
                  type="url"
                  value={form.portfolioLink}
                  onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })}
                  placeholder="https://portfolio.com or link to your best work"
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="mt-3">
                <label className="block text-xs text-foreground-400 mb-1.5">
                  Service Description
                </label>
                <textarea
                  value={form.serviceDescription}
                  onChange={(e) => setForm({ ...form, serviceDescription: e.target.value })}
                  placeholder="Tell us about your services, experience, and what you can offer TribeDala..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md bg-background-200 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-md text-sm border border-background-300/60 text-foreground-400 hover:text-foreground-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary text-sm py-2"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
