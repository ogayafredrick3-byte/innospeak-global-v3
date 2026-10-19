import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyCourses } from '../../lib/supabase/lms';

export default function MyCourses() {
  const [state, setState] = useState({ loading: true, error: null, courses: [] });

  useEffect(() => {
    listMyCourses()
      .then((courses) => setState({ loading: false, error: null, courses }))
      .catch(() => setState({ loading: false, error: 'Could not load your courses.', courses: [] }));
  }, []);

  return (
    <>
      <Seo title="My Courses" description="Manage your courses." path="/teach/courses" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">My Courses</h1>
        <p className="mt-2 font-body text-sm text-navy-500">All courses you teach. Click a course to manage its content, students, and grading.</p>
      </div>

      <div className="mt-6">
        <SectionCard action={<Link to="/teach/create-course" className="btn-gold inline-flex items-center gap-2 text-sm"><Plus size={15} /> New Course</Link>}>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.courses.length === 0 && (
            <EmptyState icon={BookOpen} title="No courses yet" message="Create your first course to get started." />
          )}
          {!state.loading && !state.error && state.courses.length > 0 && (
            <div className="space-y-3">
              {state.courses.map((course) => (
                <Link key={course.id} to={`/teach/courses/${course.id}`} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 transition-colors hover:bg-navy-50/60">
                  <div>
                    <p className="font-body text-sm font-semibold text-navy-900">{course.title}</p>
                    <p className="mt-0.5 font-body text-xs text-navy-500">{course.code || 'No code'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={course.status} />
                    <span className="font-body text-xs font-semibold text-gold-700">Open →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
