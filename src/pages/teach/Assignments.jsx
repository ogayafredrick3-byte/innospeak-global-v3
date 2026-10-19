import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyCourses, listModulesWithLessons } from '../../lib/supabase/lms';
import { supabase } from '../../lib/supabase/client';

export default function Assignments() {
  const [state, setState] = useState({ loading: true, error: null, courses: [] });

  useEffect(() => {
    listMyCourses()
      .then(async (courses) => {
        const enriched = await Promise.all(
          (courses || []).map(async (c) => {
            try {
              const modules = await listModulesWithLessons(c.id);
              let assignmentCount = 0;
              for (const m of modules) {
                for (const l of m.lessons || []) {
                  try {
                    const { count } = await supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('module_id', m.id);
                    assignmentCount += count || 0;
                  } catch { /* skip */ }
                }
              }
              return { ...c, assignmentCount };
            } catch {
              return { ...c, assignmentCount: 0 };
            }
          })
        );
        setState({ loading: false, error: null, courses: enriched });
      })
      .catch(() => setState({ loading: false, error: 'Could not load assignments.', courses: [] }));
  }, []);

  return (
    <>
      <Seo title="Assignments" description="Manage course assignments." path="/teach/assignments" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Assignments</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Create and manage assignments for your courses. Review submissions and provide feedback.</p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.courses.length === 0 && (
            <EmptyState icon={ClipboardCheck} title="No assignments yet" message="Create a course and add modules to start assigning work." />
          )}
          {!state.loading && !state.error && state.courses.length > 0 && (
            <div className="space-y-3">
              {state.courses.map((course) => (
                <Link key={course.id} to={`/teach/courses/${course.id}`} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 transition-colors hover:bg-navy-50/60">
                  <div>
                    <p className="font-body text-sm font-semibold text-navy-900">{course.title}</p>
                    <p className="mt-0.5 font-body text-xs text-navy-500">{course.assignmentCount} assignments</p>
                  </div>
                  <span className="font-body text-xs font-semibold text-gold-700">Manage →</span>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
