import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * EmployerRoute — layout guard for /employer/*.
 * Allows roles: 'employer' and 'admin' (override).
 * Organisation linking is enforced by EmployerShell (onboarding form).
 */
export default function EmployerRoute() {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-cream pt-20">
        <div className="container-premium py-20 text-center">
          <p className="font-body text-sm text-navy-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = profile?.role;
  if (role !== 'employer' && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}