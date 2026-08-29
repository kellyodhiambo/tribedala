import { useRef, useState } from 'react';
import supabase from '@/hooks/useSupabase';

const DEFAULT_AVATAR = 'https://readdy.ai/api/search-image?query=Confident%20African%20man%20in%20his%2030s%20wearing%20black%20turtleneck%2C%20creative%20director%20portrait%2C%20warm%20studio%20lighting%2C%20minimalist%20background%2C%20editorial%20headshot%20photography&width=120&height=120&seq=dash-avatar&orientation=squarish';

export default function DashboardProfile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: 'James Okello',
    displayName: 'jamesokello',
    email: 'james@tribedala.co.ke',
    bio: 'Founder & Creative Director at TribeDala. Building East Africa\'s most vibrant creator community.',
    location: 'Kisumu, Kenya',
    website: 'https://tribedala.co.ke',
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUrl(URL.createObjectURL(file));
    setAvatarError('');

    try {
      setUploadingAvatar(true);
      const ext = file.name.split('.').pop() || 'png';
      const path = `avatars/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Unable to upload profile photo.');
      setAvatarUrl(DEFAULT_AVATAR);
    } finally {
      setUploadingAvatar(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: form.fullName,
          bio: form.bio,
          location: form.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', '8aaca027-9291-40f3-92ce-bd58552bb703'); // Admin user ID

      if (error) {
        alert('❌ Error saving profile: ' + error.message);
      } else {
        alert('✅ Profile updated successfully!');
      }
    } catch (err) {
      alert('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground-50">Profile</h1>
        <p className="text-sm text-foreground-500 mt-1">Manage your public profile and personal information.</p>
      </div>

      {/* Avatar Section */}
      <div className="card p-5 md:p-6">
        <h2 className="font-heading font-semibold text-sm text-foreground-100 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-background-200 overflow-hidden flex-shrink-0">
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-background-200 text-xs font-medium text-foreground-300 hover:bg-background-300 transition-colors"
            >
              <i className="ri-upload-line mr-1.5" />
              {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
            </button>
            <p className="text-[10px] text-foreground-600">
              JPG, PNG or WebP. Max 2MB.
            </p>
            {avatarError && <p className="text-[10px] text-accent-400">{avatarError}</p>}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <form onSubmit={handleSave} className="card p-5 md:p-6 space-y-5">
        <h2 className="font-heading font-semibold text-sm text-foreground-100">Personal Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-400">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 placeholder-foreground-600 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-400">Display Name</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 placeholder-foreground-600 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-400">Email</label>
          <input
            type="email"
            value={form.email}
            disabled
            className="w-full px-3.5 py-2.5 rounded-lg bg-background-200/50 border border-background-300/20 text-sm text-foreground-400 cursor-not-allowed"
          />
          <p className="text-[10px] text-foreground-600">Contact support to change your email address.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-400">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-3.5 py-2.5 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 placeholder-foreground-600 focus:outline-none focus:border-primary-500/50 transition-colors resize-none"
          />
          <p className="text-[10px] text-foreground-600">{form.bio.length}/500</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-400">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 placeholder-foreground-600 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-400">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 placeholder-foreground-600 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-foreground-300 uppercase tracking-wider">Social Links</h3>
          {['Instagram', 'Twitter / X', 'YouTube', 'TikTok'].map((platform) => (
            <div key={platform} className="flex items-center gap-3">
              <span className="w-24 text-xs text-foreground-500 flex-shrink-0">{platform}</span>
              <input
                type="url"
                placeholder={`https://${platform.toLowerCase().replace(' / x', '')}.com/yourhandle`}
                className="flex-1 px-3.5 py-2 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 placeholder-foreground-600 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button type="submit" className="btn-primary text-sm px-6 py-2.5 rounded-lg">
            <i className="ri-save-line mr-1.5" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}