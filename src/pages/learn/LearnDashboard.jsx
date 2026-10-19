import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Compass, Play, CircleCheck as CheckCircle2, Clock,
  TrendingUp, ArrowRight, BookOpen, Award,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyEnrollments, getCourseProgress } from '../../lib/supabase/lms';
import { useAuth } from '../../context/AuthContext';
import { resolveLmsCourse } from '../../lib/data/lmsCourse';
import CourseBadges from '../../components/learn/CourseBadges.jsx';

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
        <Icon size={17} />
      </span>
      <div>
        <p className="font-display text-lg font-bold leading-none text-navy-900">{value}</p>
        <p className="mt-0.5 font-body text-xs text-navy-500">{label}</p>
      </div>
    </div>
  );
}

export default function LearnDashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, enrollments: [] });

  useEffect(() => {
    listMyEnrollments()
      .then(async (enrollments) => {
        const withProgress = await Promise.all(
          enrollments.map(async (e) => {
            try {
              const progress = await getCourseProgress(e.course_id, user.id);
              return { ...e, progress };
            } catch {
              return { ...e, progress: null };
            }
          })
        );
        setState({ loading: false, error: null, enrollments: withProgress });
      })
      .catch((err) =>
        setState({
          loading: false,
          error: err.message || 'Could not load your courses.',
          enrollments: [],
        })
      );
  }, [user?.id]);

  const stats = useMemo(() => {
    const total = state.enrollments.length;
    const inProgress = state.enrollments.filter((e) => {
      const pct = e.progress?.percent ?? 0;
      return pct > 0 && pct < 100;
    }).length;
    const completed = state.enrollments.filter((e) => (e.progress?.percent ?? 0) >= 100).length;
    const notStarted = total - inProgress - completed;
    return { total, inProgress, completed, notStarted };
  }, [state.enrollments]);

  const continueCourse = useMemo(
    () =>
      state.enrollments
        .filter((e) => {
          const pct = e.progress?.percent ?? 0;
          return pct > 0 && pct < 100;
        })
        .sort((a, b) => (b.progress?.updated_at || '').localeCompare(a.progress?.updated_at || ''))[0],
    [state.enrollments]
  );

  const notStartedCourses = useMemo(
    () => state.enrollments.filter((e) => (e.progress?.percent ?? 0) === 0),
    [state.enrollments]
  );

  const completedCourses = useMemo(
    () => state.enrollments.filter((e) => (e.progress?.percent ?? 0) >= 100),
    [state.enrollments]
  );

  if (state.loading) {
    return (
      <>
        <Seo title="My Learning" description="Your enrolled courses and learning progress." path="/learn" />
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Learn</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">My Learning</h1>
        </div>
        <SectionCard className="mt-6">
          <LoadingState />
        </SectionCard>
      </>
    );
  }

  if (state.error) {
    return (
      <>
        <Seo title="My Learning" description="Your enrolled courses and learning progress." path="/learn" />
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Learn</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">My Learning</h1>
        </div>
        <SectionCard className="mt-6">
          <ErrorState message={state.error} />
        </SectionCard>
      </>
    );
  }

  if (state.enrollments.length === 0) {
    return (
      <>
        <Seo title="My Learning" description="Your enrolled courses and learning progress." path="/learn" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Learn</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">My Learning</h1>
          </div>
          <Link to="/learn/catalog" className="btn-outline inline-flex items-center gap-2 text-sm">
            <Compass size={15} /> Browse Courses
          </Link>
        </div>
        <SectionCard className="mt-6">
          <EmptyState
            icon={GraduationCap}
            title="You're not enrolled in any course yet"
            message="Browse the catalog to find a course to start learning."
            action={
              <Link to="/learn/catalog" className="btn-gold text-sm">
                Browse Courses
              </Link>
            }
          />
        </SectionCard>
      </>
    );
  }

  return (
    <>
      <Seo title="My Learning" description="Your enrolled courses and learning progress." path="/learn" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Learn</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">My Learning</h1>
        </div>
        <Link to="/learn/catalog" className="btn-outline inline-flex items-center gap-2 text-sm">
          <Compass size={15} /> Browse Courses
        </Link>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatPill icon={BookOpen} label="Enrolled" value={stats.total} />
        <StatPill icon={Play} label="In Progress" value={stats.inProgress} />
        <StatPill icon={CheckCircle2} label="Completed" value={stats.completed} />
        <StatPill icon={Clock} label="Not Started" value={stats.notStarted} />
      </div>

      {/* Continue Learning */}
      {continueCourse && (() => {
        const resolved = resolveLmsCourse(continueCourse.lms_courses || {});
        return (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gold-200 bg-gradient-to-br from-navy-900 to-navy-800 p-5 shadow-premium sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wider text-gold-400">
                  <TrendingUp size={14} /> Continue Learning
                </p>
                <h2 className="mt-1.5 truncate font-display text-xl font-bold text-white sm:text-2xl">
                  {resolved.title}
                </h2>
                {resolved.code && resolved.hasCatalogueMatch && (
                  <p className="mt-1 font-mono text-xs font-bold text-gold-300">
                    {resolved.code}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 w-32 rounded-full bg-navy-700">
                    <div
                      className="h-2 rounded-full bg-gold-500 transition-all duration-500"
                      style={{ width: `${continueCourse.progress?.percent ?? 0}%` }}
                    />
                  </div>
                  <span className="font-body text-xs font-semibold text-gold-400">
                    {continueCourse.progress?.percent ?? 0}%
                  </span>
                </div>
                <p className="mt-2 font-body text-xs text-navy-300">
                  {continueCourse.progress?.completed_lessons ?? 0} / {continueCourse.progress?.total_lessons ?? 0} lessons complete
                </p>
              </div>
              <Link
                to={`/learn/courses/${continueCourse.course_id}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gold-500 px-5 py-3 font-body text-sm font-bold text-navy-900 shadow-lg transition-colors hover:bg-gold-400"
              >
                <Play size={16} /> Resume <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        );
      })()}

      {/* All courses */}
      <SectionCard title="My Courses" className="mt-6">
        <div className="space-y-3">
          {state.enrollments.map((e) => {
            const pct = e.progress?.percent ?? 0;
            const isCompleted = pct >= 100;
            const isInProgress = pct > 0 && pct < 100;
            const resolved = resolveLmsCourse(e.lms_courses || {});

            return (
              <Link
                key={e.id}
                to={`/learn/courses/${e.course_id}`}
                className="block rounded-xl border border-navy-100 px-4 py-4 transition-colors hover:bg-navy-50/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-semibold text-navy-900">
                      {resolved.title}
                    </p>
                    {/* Badges — pathway, level, division when catalogue-linked */}
                    {resolved.hasCatalogueMatch && (
                      <div className="mt-2">
                        <CourseBadges course={resolved} size="sm" showDuration={false} />
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isCompleted && <CheckCircle2 size={15} className="text-emerald-600" />}
                    <span className="font-body text-xs font-semibold text-gold-700">
                      {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'} →
                    </span>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-navy-100">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gold-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 font-body text-xs text-navy-500">
                  {e.progress
                    ? `${e.progress.completed_lessons} / ${e.progress.total_lessons} lessons complete`
                    : 'Progress unavailable'}
                </p>
              </Link>
            );
          })}
        </div>
      </SectionCard>

      {/* Not started */}
      {notStartedCourses.length > 0 && (
        <SectionCard
          title="Ready to Begin"
          description="Courses you're enrolled in but haven't started yet."
          className="mt-6"
        >
          <div className="space-y-2">
            {notStartedCourses.map((e) => {
              const resolved = resolveLmsCourse(e.lms_courses || {});
              return (
                <Link
                  key={e.id}
                  to={`/learn/courses/${e.course_id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-navy-200 bg-cream px-4 py-3 transition-colors hover:bg-gold-50/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm font-semibold text-navy-800">
                      {resolved.title}
                    </p>
                    <p className="font-body text-xs text-navy-400">Not started yet</p>
                  </div>
                  <span className="inline-flex items-center gap-1 font-body text-xs font-bold text-gold-700">
                    <Play size={13} /> Start
                  </span>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Completed */}
      {completedCourses.length > 0 && (
        <SectionCard
          title="Completed"
          description="Courses you've finished. Review content anytime."
          className="mt-6"
        >
          <div className="space-y-2">
            {completedCourses.map((e) => {
              const resolved = resolveLmsCourse(e.lms_courses || {});
              return (
                <Link
                  key={e.id}
                  to={`/learn/courses/${e.course_id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 transition-colors hover:bg-emerald-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm font-semibold text-navy-800">
                      {resolved.title}
                    </p>
                    <p className="font-body text-xs text-emerald-600">Completed — 100%</p>
                  </div>
                  <span className="inline-flex items-center gap-1 font-body text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={13} /> Review
                  </span>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Footer CTA — link to full progress page */}
      <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-5">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
              <TrendingUp size={18} strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-body text-sm font-bold text-navy-900">
                Want a deeper view?
              </p>
              <p className="mt-0.5 font-body text-xs text-navy-500">
                See module-by-module breakdown, quiz scores, and recent activity.
              </p>
            </div>
          </div>
          <Link
            to="/portal/progress"
            className="btn-outline inline-flex shrink-0 items-center gap-2 text-sm"
          >
            My Progress
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}