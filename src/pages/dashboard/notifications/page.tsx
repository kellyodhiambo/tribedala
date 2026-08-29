import { useState } from 'react';

const initialNotifications = [
  {
    id: 1,
    type: 'message',
    title: 'New message from DJ Shani',
    body: 'Hey! Would love to have you on the podcast next week. Are you available Tuesday?',
    time: '5 minutes ago',
    read: false,
    icon: 'ri-message-line',
    color: 'text-primary-500',
    bg: 'bg-primary-500/10',
  },
  {
    id: 2,
    type: 'application',
    title: 'Application Approved',
    body: 'Your Creator application (Podcaster) has been approved! Welcome to the verified creator community.',
    time: '2 hours ago',
    read: false,
    icon: 'ri-checkbox-circle-line',
    color: 'text-primary-500',
    bg: 'bg-primary-500/10',
  },
  {
    id: 3,
    type: 'event',
    title: 'Tribe Vibe Festival 2026 — Early Bird Ends Soon',
    body: 'Early bird tickets for the festival end in 48 hours. Get yours before prices go up.',
    time: '1 day ago',
    read: true,
    icon: 'ri-ticket-line',
    color: 'text-accent-500',
    bg: 'bg-accent-500/10',
  },
  {
    id: 4,
    type: 'opportunity',
    title: 'New Opportunity: Collab with Girlies',
    body: 'The Girlies crew is looking for a videographer for their next episode. Check the opportunity board.',
    time: '2 days ago',
    read: true,
    icon: 'ri-lightbulb-line',
    color: 'text-secondary-500',
    bg: 'bg-secondary-500/10',
  },
  {
    id: 5,
    type: 'system',
    title: 'Welcome to TribeDala',
    body: 'Your account has been created successfully. Explore shows, events, and connect with creators.',
    time: '1 week ago',
    read: true,
    icon: 'ri-user-add-line',
    color: 'text-foreground-400',
    bg: 'bg-background-200',
  },
];

export default function DashboardNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground-50">Notifications</h1>
          <p className="text-sm text-foreground-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-background-200 p-0.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === 'all' ? 'bg-background-100 text-foreground-100 shadow-sm' : 'text-foreground-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === 'unread' ? 'bg-background-100 text-foreground-100 shadow-sm' : 'text-foreground-500'
              }`}
            >
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary-500 font-medium hover:text-primary-400 transition-colors whitespace-nowrap"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-background-200 flex items-center justify-center mx-auto mb-3">
              <i className="ri-notification-off-line text-foreground-500 text-xl" />
            </div>
            <p className="text-sm text-foreground-400">No notifications yet</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <button
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`w-full text-left card p-4 flex items-start gap-3 hover:bg-background-200/30 transition-colors ${
                !notif.read ? 'border-l-2 border-l-primary-500' : ''
              }`}
            >
              <div className={`w-9 h-9 rounded-lg ${notif.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <i className={`${notif.icon} ${notif.color} text-base`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground-100' : 'text-foreground-200'}`}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-foreground-500 leading-relaxed">{notif.body}</p>
                <p className="text-[10px] text-foreground-600 mt-1.5">{notif.time}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
