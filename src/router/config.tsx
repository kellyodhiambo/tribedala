import type { RouteObject } from 'react-router-dom';
import Layout from '@/components/feature/Layout';
import AuthGuard from '@/components/feature/AuthGuard';
import AdminLayout from '@/pages/admin/AdminLayout';
import DashboardLayout from '@/pages/dashboard/DashboardLayout';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/home/page';
import ShowsHubPage from '@/pages/show/hub/page';
import PodcastPage from '@/pages/show/podcast/page';
import EpisodePage from '@/pages/show/episode/page';
import InterviewPage from '@/pages/show/interview/page';
import GirliesPage from '@/pages/show/girlies/page';
import EventsPage from '@/pages/events/page';
import EventDetailPage from '@/pages/events/detail/page';
import BlogPage from '@/pages/blog/page';
import BlogDetailPage from '@/pages/blog/detail/page';
import CreatorsPage from '@/pages/creators/page';
import CreatorDetailPage from '@/pages/creators/detail/page';
import CreatorNetworkPage from '@/pages/creators/network/page';
import TeamPage from '@/pages/team/page';
import LoginPage from '@/pages/auth/login/page';
import SignupPage from '@/pages/auth/signup/page';
import AboutPage from '@/pages/about/page';
import ServicesPage from '@/pages/services/page';
import ContactPage from '@/pages/contact/page';
import GetInvolvedPage from '@/pages/get-involved/page';
import DashboardOverview from '@/pages/dashboard/overview/page';
import DashboardProfile from '@/pages/dashboard/profile/page';
import DashboardSettings from '@/pages/dashboard/settings/page';
import DashboardApplications from '@/pages/dashboard/applications/page';
import DashboardNotifications from '@/pages/dashboard/notifications/page';
import AdminDashboard from '@/pages/admin/dashboard/page';
import AdminContent from '@/pages/admin/content/page';
import AdminEvents from '@/pages/admin/events/page';
import AdminApplications from '@/pages/admin/applications/page';
import AdminUsers from '@/pages/admin/users/page';
import AdminAnalytics from '@/pages/admin/analytics/page';
import AdminSettings from '@/pages/admin/settings/page';
import YouTubeSyncPage from '@/pages/admin/youtube-sync/page';
import ComingSoon from '@/pages/ComingSoon';
import RoadmapPage from '@/pages/roadmap/page';

const routes: RouteObject[] = [
  // Public site routes (with main Navbar + Footer)
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'shows', element: <ShowsHubPage /> },
      { path: 'shows/podcast', element: <PodcastPage /> },
      { path: 'shows/interview', element: <InterviewPage /> },
      { path: 'shows/girlies', element: <GirliesPage /> },
      { path: 'shows/episode/:id', element: <EpisodePage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/:slug', element: <BlogDetailPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/:id', element: <EventDetailPage /> },
      { path: 'creators', element: <CreatorsPage /> },
      { path: 'creators/:slug', element: <CreatorDetailPage /> },
      { path: 'network', element: <CreatorNetworkPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'get-involved', element: <GetInvolvedPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'roadmap', element: <RoadmapPage /> },
      { path: 'privacy', element: <ComingSoon /> },
      { path: 'terms', element: <ComingSoon /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
    ],
  },
  // User Dashboard routes
  {
    path: '/dashboard',
    element: (
      <AuthGuard allowedRoles={['member', 'creator', 'organizer', 'business', 'official']}>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { path: '', element: <DashboardOverview /> },
      { path: 'profile', element: <DashboardProfile /> },
      { path: 'settings', element: <DashboardSettings /> },
      { path: 'applications', element: <DashboardApplications /> },
      { path: 'notifications', element: <DashboardNotifications /> },
    ],
  },
  // Admin routes (separate layout, no main nav/footer)
  {
    path: '/admin',
    element: (
      <AuthGuard allowedRoles={['admin', 'official']}>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { path: '', element: <AdminDashboard /> },
      { path: 'content', element: <AdminContent /> },
      { path: 'youtube-sync', element: <YouTubeSyncPage /> },
      { path: 'events', element: <AdminEvents /> },
      { path: 'applications', element: <AdminApplications /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
  // 404 catch-all
  { path: '*', element: <NotFound /> },
];

export default routes;