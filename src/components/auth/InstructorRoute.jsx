import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const INSTRUCTOR_ROLES = ['admin', 'lms_admin', 'instructor'];

// UX-layer guard only — the real enforcement is the RLS policies in
// the LMS migrations (is_instructor() / is_course_instructor()), same
// pattern as AdminRoute/ProtectedRoute elsewhere in this app.
export default function InstructorRoute() {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-100 border-t-gold-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!INSTRUCTOR_ROLES.includes(profile?.role)) return <Navigate to="/portal" replace />;

  return <Outlet />;
}
