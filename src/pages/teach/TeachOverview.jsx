import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ClipboardCheck, GraduationCap, Plus } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatCard from '../../components/portal/StatCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyCourses, listCourseEnrollments } from '../../lib/supabase/lms';

export default function TeachOverview() {
  const [state, setState] = useState({ loading: true, error: null, courses: [] });

  useEffect(() => {
    listMyCourses()
      .then(async (courses) => {
        const enriched = await Promise.all(
          (courses || []).map(async (c) => {
            try {
              const enrollments = await listCourseEnrollments(c.id);
              return { ...c, studentCount: enrollments.length };
            } catch {
              return { ...c, studentCount: 0 };
            }
          })
        );
        setState({ loading: false, error: null, courses: enriched });
      })
      .catch(() => setState({ loading: false, error: 'Could not load your courses.', courses: [] }));
  }, []);

  const totalStudents = state.courses.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  return (
    <>
      <Seo title="Overview" description="Tutor dashboard overview." path="/teach" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Overview</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Welcome to your tutor dashboard. Here's a snapshot of your teaching activity.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="My Courses" value={state.loading ? '—' : state.courses.length} />
        <StatCard icon={Users} label="Total Students" value={state.loading ? '—' : totalStudents} />
        <StatCard icon={ClipboardCheck} label="Published" value={state.loading ? '—' : state.courses.filter((c) => c.status === 'published').length} />
        <StatCard icon={GraduationCap} label="Drafts" value={state.loading ? '—' : state.courses.filter((c) => c.status === 'draft').length} />
      </div>

      <div className="mt-6">
        <SectionCard title="Your Courses" action={<Link to="/teach/create-course" className="btn-gold inline-flex items-center gap-2 text-sm"><Plus size={15} /> New Course</Link>}>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.courses.length === 0 && (
            <EmptyState icon={BookOpen} title="No courses yet" message="Create your first course to get started." action={<Link to="/teach/create-course" className="btn-gold inline-flex items-center gap-2"><Plus size={15} /> Create Course</Link>} />
          )}
          {!state.loading && !state.error && state.courses.length > 0 && (
            <div className="space-y-3">
              {state.courses.map((course) => (
                <Link key={course.id} to={`/teach/courses/${course.id}`} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 transition-colors hover:bg-navy-50/60">
                  <div>
                    <p className="font-body text-sm font-semibold text-navy-900">{course.title}</p>
                    <p className="mt-0.5 font-body text-xs text-navy-500">{course.code || 'No code'} · {course.studentCount} students</p>
                  </div>
                  <span className="font-body text-xs font-semibold text-gold-700">Open →</span>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
