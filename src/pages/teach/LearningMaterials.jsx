import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyCourses, listModulesWithLessons } from '../../lib/supabase/lms';

export default function LearningMaterials() {
  const [state, setState] = useState({ loading: true, error: null, courses: [] });

  useEffect(() => {
    listMyCourses()
      .then(async (courses) => {
        const enriched = await Promise.all(
          (courses || []).map(async (c) => {
            try {
              const modules = await listModulesWithLessons(c.id);
              const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
              return { ...c, moduleCount: modules.length, lessonCount };
            } catch {
              return { ...c, moduleCount: 0, lessonCount: 0 };
            }
          })
        );
        setState({ loading: false, error: null, courses: enriched });
      })
      .catch(() => setState({ loading: false, error: 'Could not load materials.', courses: [] }));
  }, []);

  return (
    <>
      <Seo title="Learning Materials" description="Manage your course content." path="/teach/materials" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Learning Materials</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Manage modules, lessons, and resources across your courses.</p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.courses.length === 0 && (
            <EmptyState icon={FileText} title="No materials yet" message="Create a course first, then add modules and lessons." />
          )}
          {!state.loading && !state.error && state.courses.length > 0 && (
            <div className="space-y-3">
              {state.courses.map((course) => (
                <Link key={course.id} to={`/teach/courses/${course.id}`} className="flex items-center justify-between rounded-xl border border-navy-100 px-4 py-3 transition-colors hover:bg-navy-50/60">
                  <div>
                    <p className="font-body text-sm font-semibold text-navy-900">{course.title}</p>
                    <p className="mt-0.5 font-body text-xs text-navy-500">{course.moduleCount} modules · {course.lessonCount} lessons</p>
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
