import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('[AuthGuard] 🛡️ Checking access:', {
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    userRole: profile?.role,
    allowedRoles,
    pathname: location.pathname,
    allowed: !allowedRoles || (profile && allowedRoles.includes(profile.role))
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-foreground-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[AuthGuard] ❌ No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !profile) {
    console.log('[AuthGuard] ⏳ Waiting for profile to load...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-foreground-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    console.log('[AuthGuard] ❌ Role not allowed. User role:', profile.role, 'Allowed:', allowedRoles);
    return <Navigate to="/" replace />;
  }

  if (profile && profile.status === 'pending' && allowedRoles && !allowedRoles.includes('admin') && !allowedRoles.includes('official')) {
    console.log('[AuthGuard] ⏳ User pending approval');
    return <Navigate to="/" replace />;
  }

  console.log('[AuthGuard] ✅ Access granted');
  return <>{children}</>;
}