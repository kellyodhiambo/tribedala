import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';

const logoUrl = 'https://storage.helloreaddy.io/project_files/90292c71-4818-4cf6-8925-3fa555ca85da/f58dfcce-93e8-4fa3-a8d4-b82a8b19c9dc_compressed_c89e2e3e7e3dc1f6adaa98235aa55554.webp';

const roleOptions = [
  { value: 'member', label: 'Community Member', description: 'Follow content, buy tickets, join the newsletter', icon: 'ri-heart-line' },
  { value: 'creator', label: 'Creator', description: 'Podcaster, DJ, MC, Videographer, Blogger, etc.', icon: 'ri-mic-2-line' },
  { value: 'organizer', label: 'Event Organizer', description: 'List and sell tickets for your events', icon: 'ri-calendar-event-line' },
  { value: 'business', label: 'Business / Brand', description: 'Request marketing, sponsor content, book creators', icon: 'ri-briefcase-line' },
];

const creatorCategories = [
  { value: 'podcaster', label: 'Podcaster' },
  { value: 'dj', label: 'DJ' },
  { value: 'mc', label: 'MC / Host' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'blogger', label: 'Blogger / Writer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'dancer', label: 'Dancer' },
  { value: 'other', label: 'Other' },
];

export default function CompleteProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('member');
  const [creatorCategory, setCreatorCategory] = useState('podcaster');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in or profile already completed
  useEffect(() => {
    if (!user) {
      navigate('/signup');
      return;
    }

    // If profile already has a role set (not 'member' or already completed), redirect to dashboard
    if (profile && profile.role !== 'member') {
      navigate('/dashboard');
      return;
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      const updateData: any = {
        role: selectedRole,
        updated_at: new Date().toISOString(),
      };

      if (selectedRole === 'creator') {
        updateData.creator_category = creatorCategory;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }

      // Refresh profile context
      await refreshProfile();

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo + Title */}
          <div className="text-center mb-10">
            <div className="inline-block mb-6">
              <img src={logoUrl} alt="TribeDala" className="h-9 w-auto object-contain mx-auto" />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground-50 mb-2">
              Welcome to the Tribe!
            </h1>
            <p className="text-sm text-foreground-400">
              {user.user_metadata?.full_name || user.email}, tell us what brings you here
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-accent-500/10 border border-accent-500/30 text-sm text-accent-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground-200 mb-4">
                I want to join as a...
              </label>
              <div className="space-y-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      selectedRole === role.value
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-background-300/60 bg-background-100 hover:border-background-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <i className={`${role.icon} text-lg text-primary-500 mt-0.5`} />
                      <div className="flex-1">
                        <p className="font-medium text-foreground-100">{role.label}</p>
                        <p className="text-xs text-foreground-500 mt-1">{role.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedRole === 'creator' && (
              <div>
                <label htmlFor="creator-category" className="block text-sm font-medium text-foreground-200 mb-2">
                  What type of creator are you?
                </label>
                <select
                  id="creator-category"
                  value={creatorCategory}
                  onChange={(e) => setCreatorCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background-100 border border-background-300/60 text-sm text-foreground-50 focus:outline-none focus:border-primary-500 transition-colors"
                >
                  {creatorCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-background-50 border-t-transparent rounded-full animate-spin inline-block mr-2" />
                  Setting up your profile...
                </>
              ) : (
                'Get Started →'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-foreground-500 mt-8">
            You can change this later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
