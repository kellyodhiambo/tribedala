import { useState } from 'react';

export default function DashboardSettings() {
  const [emailNotifs, setEmailNotifs] = useState({
    newEpisodes: true,
    eventReminders: true,
    applicationUpdates: true,
    communityNews: false,
    marketingEmails: false,
  });

  const [inAppNotifs, setInAppNotifs] = useState({
    messages: true,
    mentions: true,
    applicationStatus: true,
    eventUpdates: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showInDirectory: true,
    allowMessages: 'creators_only',
  });

  const toggleEmail = (key: keyof typeof emailNotifs) => {
    setEmailNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInApp = (key: keyof typeof inAppNotifs) => {
    setInAppNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground-50">Settings</h1>
        <p className="text-sm text-foreground-500 mt-1">Manage your account preferences and privacy.</p>
      </div>

      {/* Notification Preferences */}
      <div className="card p-5 md:p-6 space-y-5">
        <h2 className="font-heading font-semibold text-sm text-foreground-100">Email Notifications</h2>
        <div className="space-y-3">
          {[
            { key: 'newEpisodes' as const, label: 'New Episodes', desc: 'When a new episode drops from shows you follow' },
            { key: 'eventReminders' as const, label: 'Event Reminders', desc: 'Reminders before events you\'ve registered for' },
            { key: 'applicationUpdates' as const, label: 'Application Updates', desc: 'Status changes on your applications' },
            { key: 'communityNews' as const, label: 'Community News', desc: 'Weekly digest of what\'s happening in the Tribe' },
            { key: 'marketingEmails' as const, label: 'Marketing & Promotions', desc: 'Special offers, partner deals, and promotions' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm text-foreground-200">{item.label}</p>
                <p className="text-xs text-foreground-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleEmail(item.key)}
                className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                  emailNotifs[item.key] ? 'bg-primary-500' : 'bg-background-400'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                    emailNotifs[item.key] ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="card p-5 md:p-6 space-y-5">
        <h2 className="font-heading font-semibold text-sm text-foreground-100">In-App Notifications</h2>
        <div className="space-y-3">
          {[
            { key: 'messages' as const, label: 'Messages', desc: 'Direct messages and group chat notifications' },
            { key: 'mentions' as const, label: 'Mentions', desc: 'When someone mentions you in a post or comment' },
            { key: 'applicationStatus' as const, label: 'Application Status', desc: 'Updates on your creator/organizer applications' },
            { key: 'eventUpdates' as const, label: 'Event Updates', desc: 'Changes to events you\'re attending' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm text-foreground-200">{item.label}</p>
                <p className="text-xs text-foreground-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleInApp(item.key)}
                className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                  inAppNotifs[item.key] ? 'bg-primary-500' : 'bg-background-400'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                    inAppNotifs[item.key] ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="card p-5 md:p-6 space-y-5">
        <h2 className="font-heading font-semibold text-sm text-foreground-100">Privacy</h2>
        <div className="space-y-3">
          {[
            { key: 'profileVisible' as const, label: 'Public Profile', desc: 'Allow others to view your profile page' },
            { key: 'showInDirectory' as const, label: 'Creator Directory', desc: 'Show your profile in the verified creators directory' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm text-foreground-200">{item.label}</p>
                <p className="text-xs text-foreground-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setPrivacy((prev) => ({ ...prev, [item.key]: !privacy[item.key] }))}
                className={`relative w-10 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                  privacy[item.key] ? 'bg-primary-500' : 'bg-background-400'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                    privacy[item.key] ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}

          <div className="pt-3 border-t border-background-300/20">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-400">Who can message you?</label>
              <select
                value={privacy.allowMessages}
                onChange={(e) => setPrivacy((prev) => ({ ...prev, allowMessages: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 focus:outline-none focus:border-primary-500/50 transition-colors"
              >
                <option value="everyone">Everyone</option>
                <option value="creators_only">Verified Creators Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="card p-5 md:p-6 space-y-4">
        <h2 className="font-heading font-semibold text-sm text-foreground-100">Password & Security</h2>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Current password"
            className="w-full px-3.5 py-2.5 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 placeholder-foreground-600 focus:outline-none focus:border-primary-500/50 transition-colors"
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full px-3.5 py-2.5 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 placeholder-foreground-600 focus:outline-none focus:border-primary-500/50 transition-colors"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-3.5 py-2.5 rounded-lg bg-background-200 border border-background-300/50 text-sm text-foreground-100 placeholder-foreground-600 focus:outline-none focus:border-primary-500/50 transition-colors"
          />
          <button className="btn-primary text-sm px-6 py-2.5 rounded-lg">
            Update Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-5 md:p-6 border-accent-500/20">
        <h2 className="font-heading font-semibold text-sm text-accent-500 mb-3">Danger Zone</h2>
        <p className="text-xs text-foreground-500 mb-4">
          Once you deactivate your account, there is no going back. Please be certain.
        </p>
        <button className="px-5 py-2.5 rounded-lg border border-accent-500/30 text-xs font-medium text-accent-500 hover:bg-accent-500/10 transition-colors">
          Deactivate Account
        </button>
      </div>
    </div>
  );
}