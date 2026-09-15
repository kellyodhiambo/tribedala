import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import supabase from '@/hooks/useSupabase';

interface Application {
  id: string;
  type: 'creator_applications' | 'guest_requests';
  category: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  submittedAt: string;
  message: string;
  icon: string;
  color: string;
  bg: string;
}

const statusLabels = {
  pending: 'Under Review',
  reviewed: 'Reviewed',
  approved: 'Approved',
  rejected: 'Not Approved',
};

export default function DashboardApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      if (!user?.id) {
        console.log('No user ID, skipping fetch');
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('Fetching applications for user:', user.id);
      
      try {
        // Fetch creator applications
        const { data: creatorApps, error: creatorError } = await supabase
          .from('creator_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (creatorError) {
          console.error('Creator apps error:', creatorError);
        } else {
          console.log('Creator apps fetched:', creatorApps?.length || 0);
        }

        // Fetch guest requests
        const { data: guestRequests, error: guestError } = await supabase
          .from('guest_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (guestError) {
          console.error('Guest requests error:', guestError);
        } else {
          console.log('Guest requests fetched:', guestRequests?.length || 0);
        }

        const apps: Application[] = [];

        // Add creator applications
        if (creatorApps && creatorApps.length > 0) {
          creatorApps.forEach((app) => {
            apps.push({
              id: app.id,
              type: 'creator_applications',
              category: app.category || 'Creator',
              status: app.status,
              submittedAt: new Date(app.created_at).toLocaleDateString(),
              message:
                app.status === 'approved'
                  ? 'Your application has been approved! Welcome to TribeDala.'
                  : app.status === 'rejected'
                  ? app.review_notes || 'Your application was not approved. You can apply again later.'
                  : 'Your application is being reviewed by our team. We typically respond within 5-7 business days.',
              icon: 'ri-user-star-line',
              color: 'text-primary-500',
              bg: 'bg-primary-500/10',
            });
          });
        }

        // Add guest requests
        if (guestRequests && guestRequests.length > 0) {
          guestRequests.forEach((req) => {
            const showNames = req.shows && Array.isArray(req.shows) ? 'Multiple Shows' : 'Show Guest';
            apps.push({
              id: req.id,
              type: 'guest_requests',
              category: req.request_type === 'guest' ? showNames : (req.service_type || 'Creator Services'),
              status: req.status,
              submittedAt: new Date(req.created_at).toLocaleDateString(),
              message:
                req.status === 'approved'
                  ? 'Great! Your request has been approved. Our team will contact you soon.'
                  : req.status === 'rejected'
                  ? req.admin_notes || 'Your request was not approved at this time.'
                  : 'Your request is being reviewed. We will get back to you soon.',
              icon: req.request_type === 'guest' ? 'ri-mic-line' : 'ri-briefcase-line',
              color: req.request_type === 'guest' ? 'text-accent-500' : 'text-secondary-500',
              bg: req.request_type === 'guest' ? 'bg-accent-500/10' : 'bg-secondary-500/10',
            });
          });
        }

        // Sort by date, newest first
        apps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        console.log('Total applications to display:', apps.length);
        setApplications(apps);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [user?.id]);
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground-50">Applications</h1>
          <p className="text-sm text-foreground-500 mt-1">Track the status of your submissions and requests.</p>
        </div>
        <Link
          to="/get-involved"
          className="btn-primary text-xs md:text-sm px-5 py-2.5 rounded-lg hidden sm:inline-flex"
        >
          <i className="ri-add-line mr-1.5" />
          New Application
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-background-200" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-background-200 flex items-center justify-center mx-auto">
            <i className="ri-inbox-line text-2xl text-foreground-600" />
          </div>
          <p className="text-sm text-foreground-500">No applications or requests yet.</p>
          <Link to="/get-involved" className="btn-primary text-xs inline-flex">
            Submit Your First Application
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="card p-5 hover:bg-background-200/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${app.bg} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${app.icon} ${app.color} text-lg`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold text-sm text-foreground-100">
                      {app.type === 'creator_applications' ? 'Creator Application' : 'Request to Be a Guest/Creator'}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        app.status === 'approved'
                          ? 'bg-primary-500/15 text-primary-500'
                          : app.status === 'rejected'
                          ? 'bg-accent-500/15 text-accent-500'
                          : 'bg-secondary-500/15 text-secondary-500'
                      }`}
                    >
                      {statusLabels[app.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-500 mb-2">
                    {app.category} &middot; Submitted {app.submittedAt}
                  </p>
                  <p className="text-xs text-foreground-400 leading-relaxed">{app.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile CTA */}
      <div className="sm:hidden">
        <Link to="/get-involved" className="btn-primary w-full text-sm py-3 justify-center rounded-lg">
          <i className="ri-add-line mr-1.5" />
          New Application
        </Link>
      </div>
    </div>
  );
}