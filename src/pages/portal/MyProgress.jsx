import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Award, BookOpen, Calendar, ChevronLeft, CircleCheck as CheckCircle2,
  Clock, Play, RefreshCw, Sparkles, Target, TrendingUp,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  getStudentAcademicSummary,
  getStudentCoursePerformance,
  getStudentRecentActivity,
  getStudentAssessmentPerformance,
  getStudentCourseDetail,
} from '../../lib/supabase/lms';

/* ──────────────────────────────────────────────────────────────
   Small helpers
   ────────────────────────────────────────────────────────────── */

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return ''; }
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

function ProgressBar({ percent, tone = 'gold', size = 'md' }) {
  const tones = {
    gold:    'bg-gold-500',
    emerald: 'bg-emerald-500',
    navy:    'bg-navy-800',
  };
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };
  return (
    <div className={`w-full rounded-full bg-navy-100 ${heights[size]}`}>
      <div
        className={`rounded-full transition-all duration-500 ${tones[tone]} ${heights[size]}`}
        style={{ width: `${Math.min(100, Math.max(0, percent || 0))}%` }}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = 'gold' }) {
  const tones = {
    gold:    'bg-gold-500/10 text-gold-700',
    emerald: 'bg-emerald-500/10 text-emerald-700',
    navy:    'bg-navy-100 text-navy-700',
    amber:   'bg-amber-100 text-amber-700',
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-none text-navy-900">
          {value}
        </p>
        <p className="mt-0.5 truncate font-body text-xs text-navy-500">{label}</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Course row (list + detail view)
   ────────────────────────────────────────────────────────────── */

function CourseProgressCard({ course, onOpen }) {
  const percent = course.progress_percent ?? course.percent ?? 0;
  const completedLessons = course.completed_lessons ?? 0;
  const totalLessons = course.total_lessons ?? 0;
  const isComplete = percent >= 100;
  const notStarted = percent === 0;
  const title = course.course_title || course.title || 'Course';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-navy-100 bg-white p-5 text-left shadow-sm transition-all hover:border-gold-300/60 hover:shadow-premium"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold leading-snug text-navy-900">
            {title}
          </p>
          {course.course_code && (
            <p className="mt-1 font-mono text-xs font-bold text-gold-700">
              {course.course_code}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${
            isComplete
              ? 'bg-emerald-50 text-emerald-700'
              : notStarted
                ? 'bg-navy-50 text-navy-500'
                : 'bg-gold-500/10 text-gold-700'
          }`}
        >
          {isComplete ? 'Completed' : notStarted ? 'Not started' : 'In progress'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ProgressBar percent={percent} tone={isComplete ? 'emerald' : 'gold'} />
        <span className="shrink-0 font-body text-sm font-bold text-navy-800">
          {Math.round(percent)}%
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-xs text-navy-500">
        {totalLessons > 0 && (
          <span>
            {completedLessons} / {totalLessons} lessons
          </span>
        )}
        {course.avg_quiz_score_percent != null && (
          <span>Avg quiz: {Math.round(course.avg_quiz_score_percent)}%</span>
        )}
        {course.last_activity && (
          <span className="inline-flex items-center gap-1">
            <Clock size={11} /> {relativeTime(course.last_activity)}
          </span>
        )}
      </div>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
   Recent activity feed
   ────────────────────────────────────────────────────────────── */

const ACTIVITY_ICONS = {
  lesson_completed: CheckCircle2,
  quiz_passed:      Award,
  quiz_attempted:   Award,
  enrolled:         BookOpen,
  certificate:      Award,
};

function ActivityRow({ item }) {
  const Icon = ACTIVITY_ICONS[item.activity_type] || TrendingUp;
  const label =
    item.activity_type === 'lesson_completed' ? 'Completed lesson'
    : item.activity_type === 'quiz_passed'    ? 'Passed quiz'
    : item.activity_type === 'quiz_attempted' ? 'Attempted quiz'
    : item.activity_type === 'enrolled'       ? 'Enrolled'
    : item.activity_type === 'certificate'    ? 'Certificate earned'
    : 'Activity';

  return (
    <div className="flex items-start gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-body text-sm font-semibold text-navy-900">{label}</p>
        <p className="mt-0.5 truncate font-body text-xs text-navy-500">
          {item.course_title || item.title || '—'}
          {item.lesson_title ? ` · ${item.lesson_title}` : ''}
        </p>
      </div>
      <span className="shrink-0 font-body text-[11px] text-navy-400">
        {relativeTime(item.created_at || item.occurred_at)}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Assessment performance list
   ────────────────────────────────────────────────────────────── */

function AssessmentRow({ item }) {
  const scorePercent = item.score_percent ?? item.percent ?? 0;
  const passed = item.passed ?? scorePercent >= (item.passing_score_percent || 70);
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-sm font-semibold text-navy-900">
            {item.quiz_title || item.title || 'Quiz'}
          </p>
          {item.course_title && (
            <p className="mt-0.5 truncate font-body text-xs text-navy-500">
              {item.course_title}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${
            passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {passed ? 'Passed' : 'Not passed'}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar percent={scorePercent} tone={passed ? 'emerald' : 'gold'} size="sm" />
        <span className="shrink-0 font-body text-xs font-bold text-navy-800">
          {Math.round(scorePercent)}%
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Single-course detail view (when :courseId param is set)
   ────────────────────────────────────────────────────────────── */

function CourseDetailView({ courseId }) {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: false, detail: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: false, detail: null });
    getStudentCourseDetail(courseId)
      .then((detail) => {
        if (!cancelled) setState({ loading: false, error: false, detail });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[MyProgress] course detail failed:', err);
        if (!cancelled) setState({ loading: false, error: true, detail: null });
      });
    return () => { cancelled = true; };
  }, [courseId]);

  if (state.loading) {
    return <SectionCard><LoadingState /></SectionCard>;
  }

  if (state.error || !state.detail) {
    return (
      <SectionCard>
        <EmptyState
          icon={BookOpen}
          title="Could not load this course"
          message="The course detail isn't available right now. Try again in a moment."
        />
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/portal/progress')}
            className="btn-outline text-sm"
          >
            Back to all progress
          </button>
        </div>
      </SectionCard>
    );
  }

  const d = state.detail;
  const percent = d.progress_percent ?? d.percent ?? 0;

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate('/portal/progress')}
        className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-navy-500 transition-colors hover:text-navy-900"
      >
        <ChevronLeft size={15} /> All courses
      </button>

      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
              Course progress
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-navy-900">
              {d.course_title || d.title || 'Course'}
            </h2>
            {d.course_code && (
              <p className="mt-1 font-mono text-xs font-bold text-gold-700">
                {d.course_code}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <ProgressBar percent={percent} />
          <span className="shrink-0 font-display text-2xl font-bold text-navy-900">
            {Math.round(percent)}%
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Lessons"
            value={`${d.completed_lessons ?? 0} / ${d.total_lessons ?? 0}`}
            tone="navy"
          />
          <StatCard
            icon={Award}
            label="Avg quiz"
            value={`${Math.round(d.avg_quiz_score_percent ?? 0)}%`}
            tone="gold"
          />
          <StatCard
            icon={Calendar}
            label="Enrolled"
            value={formatDate(d.enrolled_at)}
            tone="navy"
          />
          <StatCard
            icon={Clock}
            label="Last active"
            value={relativeTime(d.last_activity) || '—'}
            tone="emerald"
          />
        </div>
      </SectionCard>

      {Array.isArray(d.modules) && d.modules.length > 0 && (
        <SectionCard title="Module breakdown">
          <div className="space-y-4">
            {d.modules.map((m, i) => {
              const moduleLessons = m.lessons || [];
              const moduleCompleted = moduleLessons.filter((l) => l.status === 'completed').length;
              const modulePercent = moduleLessons.length
                ? (moduleCompleted / moduleLessons.length) * 100
                : 0;
              return (
                <div key={m.id || i} className="rounded-xl border border-navy-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-body text-sm font-bold text-navy-900">
                      {m.title || `Module ${i + 1}`}
                    </p>
                    <span className="font-body text-xs font-semibold text-navy-500">
                      {moduleCompleted}/{moduleLessons.length}
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar percent={modulePercent} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function MyProgress() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    loading: true,
    error: false,
    summary: null,
    courses: [],
    activity: [],
    assessments: [],
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (courseId) return undefined; // detail view loads its own data
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));

    Promise.all([
      getStudentAcademicSummary().catch(() => null),
      getStudentCoursePerformance().catch(() => []),
      getStudentRecentActivity(12).catch(() => []),
      getStudentAssessmentPerformance().catch(() => []),
    ])
      .then(([summary, courses, activity, assessments]) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: false,
          summary: summary || null,
          courses: Array.isArray(courses) ? courses : [],
          activity: Array.isArray(activity) ? activity : [],
          assessments: Array.isArray(assessments) ? assessments : [],
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[MyProgress] load failed:', err);
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: true }));
      });

    return () => { cancelled = true; };
  }, [courseId, reloadKey]);

  const totals = useMemo(() => {
    const s = state.summary || {};
    const enrolled = s.total_enrolled ?? state.courses.length;
    const completed = s.total_completed ?? state.courses.filter(
      (c) => (c.progress_percent ?? c.percent ?? 0) >= 100
    ).length;
    const avgProgress = s.avg_progress_percent ?? (
      state.courses.length
        ? state.courses.reduce((sum, c) => sum + (c.progress_percent ?? c.percent ?? 0), 0) / state.courses.length
        : 0
    );
    const avgQuiz = s.avg_quiz_score_percent ?? (
      state.assessments.length
        ? state.assessments.reduce((sum, a) => sum + (a.score_percent ?? a.percent ?? 0), 0) / state.assessments.length
        : 0
    );
    return {
      enrolled,
      completed,
      avgProgress: Math.round(avgProgress),
      avgQuiz: Math.round(avgQuiz),
    };
  }, [state.summary, state.courses, state.assessments]);

  // Detail view — a single course
  if (courseId) {
    return (
      <>
        <Seo
          title="Course Progress"
          description="Your progress on a specific course."
          path={`/portal/progress/${courseId}`}
        />
        <CourseDetailView courseId={courseId} />
      </>
    );
  }

  return (
    <>
      <Seo
        title="My Progress"
        description="Your learning progress across InnoSpeak Global courses."
        path="/portal/progress"
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Learning
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            My Progress
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            Track how you&apos;re doing across every course you&apos;re enrolled in.
          </p>
        </div>
        <Link
          to="/learn"
          className="btn-outline inline-flex shrink-0 items-center gap-2 text-sm"
        >
          <Play size={14} aria-hidden="true" />
          Go to E-Learning
        </Link>
      </div>

      {state.loading && (
        <SectionCard className="mt-6">
          <LoadingState />
        </SectionCard>
      )}

      {state.error && !state.loading && (
        <SectionCard className="mt-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-base font-bold text-navy-900">
                Unable to load your progress right now
              </p>
              <p className="mt-1 font-body text-sm text-navy-500">
                Please try again shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="btn-outline inline-flex items-center gap-2 text-sm"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </SectionCard>
      )}

      {!state.loading && !state.error && (
        <>
          {/* Summary */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={BookOpen}
              label="Enrolled courses"
              value={totals.enrolled}
              tone="navy"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={totals.completed}
              tone="emerald"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg progress"
              value={`${totals.avgProgress}%`}
              tone="gold"
            />
            <StatCard
              icon={Award}
              label="Avg quiz score"
              value={`${totals.avgQuiz}%`}
              tone="gold"
            />
          </div>

          {/* Courses grid */}
          <SectionCard
            title="Your courses"
            description="Click a course to see the module breakdown."
            className="mt-6"
          >
            {state.courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No enrolled courses yet"
                message="Once you enroll in a course, your progress will show up here."
                action={
                  <Link to="/learn/catalog" className="btn-gold text-sm">
                    Browse Courses
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {state.courses.map((c) => (
                  <CourseProgressCard
                    key={c.course_id || c.id || c.course_title}
                    course={c}
                    onOpen={() => navigate(`/portal/progress/${c.course_id || c.id}`)}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Two-column: activity + assessments */}
          {(state.activity.length > 0 || state.assessments.length > 0) && (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {state.activity.length > 0 && (
                <SectionCard title="Recent activity">
                  <div className="space-y-2">
                    {state.activity.slice(0, 8).map((item, i) => (
                      <ActivityRow key={item.id || i} item={item} />
                    ))}
                  </div>
                </SectionCard>
              )}

              {state.assessments.length > 0 && (
                <SectionCard title="Assessment performance">
                  <div className="space-y-3">
                    {state.assessments.slice(0, 6).map((item, i) => (
                      <AssessmentRow key={item.id || i} item={item} />
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          )}

          {/* Achievements (if summary exposes them) */}
          {state.summary?.certificates_count != null && state.summary.certificates_count > 0 && (
            <div className="mt-6 rounded-2xl border border-gold-200 bg-gold-50/60 p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900">
                  <Award size={20} strokeWidth={1.8} />
                </span>
                <div className="flex-1">
                  <p className="font-body text-sm font-bold text-navy-900">
                    You&apos;ve earned {state.summary.certificates_count}{' '}
                    {state.summary.certificates_count === 1 ? 'certificate' : 'certificates'}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-navy-600">
                    Verify, print, or share them anytime.
                  </p>
                </div>
                <Link
                  to="/learn/certificates"
                  className="btn-gold inline-flex shrink-0 items-center gap-2 text-sm"
                >
                  View certificates
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}