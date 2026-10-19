import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyCourses } from '../../lib/supabase/lms';

export default function Assessments() {
  const [state, setState] = useState({ loading: true, error: null, courses: [] });

  useEffect(() => {
    listMyCourses()
      .then((courses) => setState({ loading: false, error: null, courses }))
      .catch(() => setState({ loading: false, error: 'Could not load assessments.', courses: [] }));
  }, []);

  return (
    <>
      <Seo title="Assessments" description="Manage quizzes and assessments." path="/teach/assessments" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Assessments</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Create and manage quizzes, tests, and gradebook components for your courses.</p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.courses.length === 0 && (
            <EmptyState icon={GraduationCap} title="No assessments yet" message="Create a course to start building quizzes and gradebook components." />
          )}
          {!state.loading && !state.error && state.courses.length > 0 && (
            <div className="space-y-3">
              {state.courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3">
                  <div>
                    <p className="font-body text-sm font-semibold text-navy-900">{course.title}</p>
                    <p className="mt-0.5 font-body text-xs text-navy-500">{course.code || 'No code'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to={`/teach/courses/${course.id}/gradebook`} className="font-body text-xs font-semibold text-gold-700">Gradebook →</Link>
                    <Link to={`/teach/courses/${course.id}`} className="font-body text-xs font-semibold text-navy-600">Builder →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
