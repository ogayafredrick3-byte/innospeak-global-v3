import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, BookOpen, Target,
  Download, ExternalLink, Video, FileText, Headphones, Presentation,
  File, Link as LinkIcon, Play, Lock, ChevronDown, ChevronRight,
  Menu, X, GraduationCap, Clock, ListChecks, Sparkles, PanelRight,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { useAuth } from '../../context/AuthContext';
import {
  getCourse, getMyEnrollment, listModulesWithLessons, getLesson,
  getCourseProgress, getLessonProgress, getAllLessonProgress,
  markLessonStarted, markLessonComplete, checkCourseCompletion,
} from '../../lib/supabase/lms';
import { resolveLmsCourse } from '../../lib/data/lmsCourse';
import CourseBadges from '../../components/learn/CourseBadges.jsx';
import LessonCompass from '../../components/learn/LessonCompass.jsx';
import QuizPlayer from '../../components/learn/QuizPlayer.jsx';
import AssignmentPanel from '../../components/learn/AssignmentPanel.jsx';
import SafeLessonContent from '../../components/learn/SafeLessonContent.jsx';
import { getYouTubeEmbedUrl, safeHttpUrl } from '../../lib/security/urls.js';

const RESOURCE_ICONS = {
  video: Video,
  pdf: FileText,
  audio: Headphones,
  presentation: Presentation,
  document: File,
  link: LinkIcon,
  downloadable: Download,
};

/* ──────────────────────────────────────────────────────────────
   Progress ring
   ────────────────────────────────────────────────────────────── */

function ProgressRing({ percent, size = 48, stroke = 4 }) {
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-navy-100" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-gold-500 transition-all duration-500"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dy="0.35em" textAnchor="middle" className="fill-navy-900 font-body text-xs font-bold">
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   Sidebar module (course tree)
   ────────────────────────────────────────────────────────────── */

function SidebarModule({ module, lessons, progressMap, currentLessonId, onSelectLesson, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const moduleLessons = lessons.filter((l) => l.module_id === module.id);
  const completedCount = moduleLessons.filter((l) => progressMap[l.id]?.status === 'completed').length;

  return (
    <div className="border-b border-navy-100/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-navy-50/40"
      >
        {open ? <ChevronDown size={14} className="text-navy-400" /> : <ChevronRight size={14} className="text-navy-400" />}
        <span className="flex-1 truncate font-body text-sm font-bold text-navy-900">{module.title}</span>
        <span className="font-body text-xs text-navy-400">{completedCount}/{moduleLessons.length}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              {moduleLessons.map((lesson) => {
                const prog = progressMap[lesson.id];
                const isCurrent = lesson.id === currentLessonId;
                const isCompleted = prog?.status === 'completed';
                const isStarted = prog?.status === 'in_progress';
                const isLocked = lesson.status === 'draft';

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    disabled={isLocked}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 pl-8 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isCurrent
                        ? 'bg-gold-500/10 border-l-2 border-gold-500'
                        : 'hover:bg-navy-50/40 border-l-2 border-transparent'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-600" />
                    ) : isStarted ? (
                      <Play size={15} className="flex-shrink-0 text-gold-600" />
                    ) : isLocked ? (
                      <Lock size={14} className="flex-shrink-0 text-navy-300" />
                    ) : (
                      <Circle size={15} className="flex-shrink-0 text-navy-300" />
                    )}
                    <span className={`flex-1 truncate font-body text-sm ${
                      isCurrent ? 'font-bold text-navy-900' : 'text-navy-700'
                    }`}>
                      {lesson.title}
                    </span>
                    {isCompleted && (
                      <span className="font-body text-xs text-emerald-600">Done</span>
                    )}
                  </button>
                );
              })}
              {moduleLessons.length === 0 && (
                <p className="px-8 py-2 font-body text-xs text-navy-400">No lessons yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Lesson content — polished
   ────────────────────────────────────────────────────────────── */

function LessonContent({ lesson, resources, isComplete, isStarted, onComplete, completing }) {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(lesson.video_url);
  const safeVideoUrl = safeHttpUrl(lesson.video_url);
  const safeExternalUrl = safeHttpUrl(lesson.external_url);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
            <BookOpen size={20} />
          </span>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Lesson</p>
            <h1 className="font-display text-xl font-bold text-navy-900 sm:text-2xl">{lesson.title}</h1>
          </div>
        </div>
        {lesson.description && (
          <p className="mt-3 font-body text-sm leading-6 text-navy-600">{lesson.description}</p>
        )}
      </div>

      {/* Learning objectives */}
      {lesson.learning_objectives?.length > 0 && (
        <div className="rounded-2xl border border-gold-200 bg-gold-50/50 p-5">
          <p className="flex items-center gap-2 font-body text-sm font-bold text-navy-900">
            <Target size={16} className="text-gold-600" /> Learning Objectives
          </p>
          <ul className="mt-3 space-y-2">
            {lesson.learning_objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 font-body text-sm text-navy-700">
                <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0 text-gold-600" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Video */}
      {lesson.content_type === 'video' && (youtubeEmbedUrl || safeVideoUrl) && (
        <div className="overflow-hidden rounded-2xl border border-navy-100 shadow-premium">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title={`${lesson.title} video`}
              className="aspect-video w-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video controls preload="metadata" className="aspect-video w-full" src={safeVideoUrl} />
          )}
        </div>
      )}

      {/* External link */}
      {lesson.content_type === 'link' && safeExternalUrl && (
        <a
          href={safeExternalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm font-semibold text-gold-700 shadow-sm hover:bg-gold-50"
        >
          <ExternalLink size={16} /> Open external resource
        </a>
      )}

      {/* Rich text */}
      {lesson.content && (
        <SafeLessonContent
          content={lesson.content}
          className="prose prose-sm max-w-none rounded-2xl border border-navy-100 bg-white p-6 font-body text-navy-800 shadow-sm sm:p-8"
        />
      )}

      {/* Practical activity */}
      {lesson.practical_activity && (
        <div className="rounded-2xl border border-navy-100 bg-cream p-5">
          <p className="flex items-center gap-2 font-body text-sm font-bold text-navy-900">
            <ListChecks size={16} className="text-gold-600" /> Practical Activity
          </p>
          <p className="mt-2 whitespace-pre-wrap font-body text-sm leading-6 text-navy-700">
            {lesson.practical_activity}
          </p>
        </div>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <div>
          <p className="font-body text-sm font-bold text-navy-900">Lesson Resources</p>
          <div className="mt-3 space-y-2">
            {resources.map((r) => {
              const Icon = RESOURCE_ICONS[r.resource_type] || BookOpen;
              const href = safeHttpUrl(r.external_url) || safeHttpUrl(r.file_url);
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-sm">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-semibold text-navy-800">{r.title}</p>
                    {r.description && <p className="font-body text-xs text-navy-500">{r.description}</p>}
                  </div>
                  {r.is_downloadable && href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500/10 px-3 py-2 font-body text-xs font-semibold text-gold-700 transition-colors hover:bg-gold-500/20"
                    >
                      <Download size={14} /> Download
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mark complete */}
      <div className="flex items-center justify-between border-t border-navy-100 pt-6">
        {isComplete ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 font-body text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={17} /> Lesson Completed
          </span>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            disabled={completing}
            className="btn-gold inline-flex items-center gap-2 disabled:opacity-60"
          >
            <CheckCircle2 size={17} /> {completing ? 'Saving…' : 'Mark as Complete'}
          </button>
        )}
        {isStarted && !isComplete && (
          <span className="font-body text-xs text-navy-400">In progress</span>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function LearningPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: true, error: null, course: null, enrollment: null,
    modules: [], progressData: null, progressMap: {}, flatLessons: [],
  });
  const [lessonState, setLessonState] = useState({
    loading: lessonId ? true : false, error: null, lesson: null, resources: [], progress: null,
  });
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compassOpen, setCompassOpen] = useState(false); // mobile drawer
  const [completionResult, setCompletionResult] = useState(null);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const courseRequestRef = useRef(0);
  const lessonRequestRef = useRef(0);

  const loadCourse = useCallback(async () => {
    const requestId = ++courseRequestRef.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [rawCourse, enrollment] = await Promise.all([
        getCourse(courseId),
        getMyEnrollment(courseId),
      ]);
      if (requestId !== courseRequestRef.current) return;

      if (!enrollment || enrollment.status !== 'active') {
        setState({
          loading: false,
          error: 'You are not enrolled in this course. Enroll first to access learning content.',
          course: null, enrollment: null, modules: [], progressData: null, progressMap: {}, flatLessons: [],
        });
        return;
      }

      // Do not fetch modules, lessons or learner progress until the active
      // enrolment has been confirmed by the backend.
      const [modules, progressData] = await Promise.all([
        listModulesWithLessons(courseId),
        getCourseProgress(courseId, user?.id).catch(() => null),
      ]);
      if (requestId !== courseRequestRef.current) return;

      const course = resolveLmsCourse(rawCourse);
      // Progress and lesson navigation only include published learner-facing content.
      const learnerModules = (modules || []).map((module) => ({
        ...module,
        lessons: (module.lessons || []).filter((lesson) => lesson.status === 'published'),
      }));
      const flatLessons = learnerModules.flatMap((module) =>
        module.lessons.map((lesson) => ({ ...lesson, module_id: module.id, module_title: module.title }))
      );
      const progressRows = await getAllLessonProgress(courseId).catch(() => []);
      if (requestId !== courseRequestRef.current) return;
      const progressMap = {};
      progressRows.forEach((progress) => { progressMap[progress.lesson_id] = progress; });

      setState({ loading: false, error: null, course, enrollment, modules: learnerModules, progressData, progressMap, flatLessons });
    } catch (err) {
      if (requestId !== courseRequestRef.current) return;
      setState((prev) => ({ ...prev, loading: false, error: err.message || 'Could not load this course.' }));
    }
  }, [courseId, user?.id]);

  const loadLesson = useCallback(async (lid) => {
    const requestId = ++lessonRequestRef.current;
    if (!lid) {
      setLessonState({ loading: false, error: null, lesson: null, resources: [], progress: null });
      return;
    }
    setLessonState({ loading: true, error: null, lesson: null, resources: [], progress: null });
    try {
      const lesson = await getLesson(lid);
      if (requestId !== lessonRequestRef.current) return;
      const progressBefore = await getLessonProgress(lid).catch(() => null);
      if (requestId !== lessonRequestRef.current) return;
      if (!progressBefore || progressBefore.status === 'not_started') {
        await markLessonStarted(lid);
      }
      if (requestId !== lessonRequestRef.current) return;
      const progress = await getLessonProgress(lid).catch(() => progressBefore);
      if (requestId !== lessonRequestRef.current) return;
      const resources = (lesson.lesson_resources || []).sort((a, b) => (a.position || 0) - (b.position || 0));
      setLessonState({ loading: false, error: null, lesson, resources, progress });
    } catch (err) {
      if (requestId !== lessonRequestRef.current) return;
      setLessonState({ loading: false, error: err.message || 'Could not load this lesson.', lesson: null, resources: [], progress: null });
    }
  }, []);

  useEffect(() => {
    loadCourse();
    return () => { courseRequestRef.current += 1; };
  }, [loadCourse]);

  useEffect(() => {
    // Do not request lesson content or write progress until course enrolment has
    // been verified and the lesson is confirmed to belong to this course.
    if (state.loading) return undefined;
    if (state.error || !state.enrollment) {
      lessonRequestRef.current += 1;
      setLessonState({ loading: false, error: null, lesson: null, resources: [], progress: null });
      return undefined;
    }
    if (!lessonId) {
      loadLesson(null);
      return undefined;
    }
    const permittedLesson = state.flatLessons.find((lesson) => lesson.id === lessonId && lesson.status === 'published');
    if (!permittedLesson) {
      lessonRequestRef.current += 1;
      setLessonState({ loading: false, error: 'This lesson is not available in the enrolled course.', lesson: null, resources: [], progress: null });
      return undefined;
    }
    loadLesson(lessonId);
    return () => { lessonRequestRef.current += 1; };
  }, [lessonId, loadLesson, state.loading, state.error, state.enrollment, state.flatLessons]);

  function selectLesson(lid) {
    setSidebarOpen(false);
    navigate(`/learn/courses/${courseId}/lessons/${lid}`);
  }

  async function handleComplete() {
    if (!lessonId) return;
    setCompleting(true);
    try {
      await markLessonComplete(lessonId);
      const progress = await getLessonProgress(lessonId);
      setLessonState((prev) => ({ ...prev, progress }));
      setState((prev) => {
        const newMap = { ...prev.progressMap, [lessonId]: progress };
        const completedCount = prev.flatLessons.filter((l) => newMap[l.id]?.status === 'completed').length;
        const total = prev.flatLessons.length;
        const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        return { ...prev, progressMap: newMap, progressData: { ...prev.progressData, percent, completed_lessons: completedCount } };
      });
      if (state.enrollment?.id) {
        try {
          const result = await checkCourseCompletion(state.enrollment.id);
          if (result?.success && result?.completed) {
            setCompletionResult(result);
            setShowCompletionBanner(true);
          }
        } catch { /* Completion eligibility is checked again on refresh. */ }
      }
    } catch (err) {
      setLessonState((prev) => ({ ...prev, error: err?.message || 'Could not save lesson progress. Please retry.' }));
    } finally {
      setCompleting(false);
    }
  }

  const { prevLesson, nextLesson } = useMemo(() => {
    const flat = state.flatLessons;
    const idx = flat.findIndex((l) => l.id === lessonId);
    if (idx < 0) return { prevLesson: null, nextLesson: null };
    return {
      prevLesson: idx > 0 ? flat[idx - 1] : null,
      nextLesson: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
    };
  }, [state.flatLessons, lessonId]);

  const resumeLessonId = useMemo(() => {
    const flat = state.flatLessons;
    if (flat.length === 0) return null;
    const inProgress = flat.find((l) => state.progressMap[l.id]?.status === 'in_progress');
    if (inProgress) return inProgress.id;
    const notCompleted = flat.find((l) => state.progressMap[l.id]?.status !== 'completed');
    if (notCompleted) return notCompleted.id;
    return flat[0].id;
  }, [state.flatLessons, state.progressMap]);

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  const { course, modules, progressData, progressMap } = state;
  const totalLessons = state.flatLessons.length;
  const completedLessons = state.flatLessons.filter((l) => progressMap[l.id]?.status === 'completed').length;
  const percent = progressData?.percent ?? (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);

  /* ── Course overview (no lesson selected) ──────────────── */
  if (!lessonId) {
    return (
      <>
        <Seo title={course.title} description={course.description} path={`/learn/courses/${courseId}`} />

        <div className="flex items-center justify-between">
          <Link to="/learn" className="inline-flex items-center gap-1 font-body text-sm font-semibold text-navy-500 hover:text-navy-800">
            <ArrowLeft size={15} /> Back to My Learning
          </Link>
        </div>

        {/* Course header */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-navy-100 bg-gradient-to-br from-navy-900 to-navy-800 p-6 shadow-premium sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-400">Enrolled Course</p>
              <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{course.title}</h1>
              {course.description && <p className="mt-2 font-body text-sm text-navy-200">{course.description}</p>}

              {/* Badges */}
              <div className="mt-4">
                <CourseBadges course={course} size="sm" className="[&>span]:border-white/10 [&>span]:bg-white/10 [&>span]:text-white [&_a]:border-white/10 [&_a]:bg-white/10 [&_a]:text-white" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-body text-xs text-navy-200">
                  <BookOpen size={14} className="text-gold-400" /> {totalLessons} lessons
                </span>
                <span className="inline-flex items-center gap-1.5 font-body text-xs text-navy-200">
                  <ListChecks size={14} className="text-gold-400" /> {modules.length} modules
                </span>
                {course.duration && (
                  <span className="inline-flex items-center gap-1.5 font-body text-xs text-navy-200">
                    <Clock size={14} className="text-gold-400" /> {course.duration}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <ProgressRing percent={percent} size={80} stroke={5} />
              <button
                type="button"
                onClick={() => resumeLessonId && navigate(`/learn/courses/${courseId}/lessons/${resumeLessonId}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 font-body text-sm font-bold text-navy-900 shadow-lg transition-colors hover:bg-gold-400"
              >
                <Play size={16} /> {completedLessons > 0 ? 'Continue Learning' : 'Start Course'}
              </button>
            </div>
          </div>
        </div>

        {/* Module list */}
        <div className="mt-6 space-y-3">
          {modules.map((module, mIdx) => {
            const moduleLessons = state.flatLessons.filter((l) => l.module_id === module.id);
            const moduleCompleted = moduleLessons.filter((l) => progressMap[l.id]?.status === 'completed').length;
            const modulePercent = moduleLessons.length > 0 ? Math.round((moduleCompleted / moduleLessons.length) * 100) : 0;

            return (
              <div key={module.id} className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-navy-100 bg-navy-50/40 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 font-display text-sm font-bold text-gold-400">
                      {mIdx + 1}
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold text-navy-900">{module.title}</p>
                      <p className="font-body text-xs text-navy-400">{moduleCompleted}/{moduleLessons.length} lessons completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden h-1.5 w-24 rounded-full bg-navy-100 sm:block">
                      <div className="h-1.5 rounded-full bg-gold-500 transition-all duration-500" style={{ width: `${modulePercent}%` }} />
                    </div>
                    <span className="font-body text-xs font-semibold text-gold-700">{modulePercent}%</span>
                  </div>
                </div>
                <div className="divide-y divide-navy-50">
                  {moduleLessons.map((lesson) => {
                    const prog = progressMap[lesson.id];
                    const isCompleted = prog?.status === 'completed';
                    const isStarted = prog?.status === 'in_progress';
                    const isLocked = lesson.status === 'draft';

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => !isLocked && selectLesson(lesson.id)}
                        disabled={isLocked}
                        className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${
                          isLocked ? 'cursor-not-allowed opacity-50' : 'hover:bg-navy-50/40'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-600" />
                        ) : isStarted ? (
                          <Play size={16} className="flex-shrink-0 text-gold-600" />
                        ) : isLocked ? (
                          <Lock size={16} className="flex-shrink-0 text-navy-300" />
                        ) : (
                          <Circle size={18} className="flex-shrink-0 text-navy-300" />
                        )}
                        <div className="flex-1">
                          <p className="font-body text-sm font-semibold text-navy-800">{lesson.title}</p>
                          {lesson.description && <p className="font-body text-xs text-navy-400">{lesson.description}</p>}
                        </div>
                        <span className="font-body text-xs uppercase tracking-wider text-navy-300">{lesson.content_type}</span>
                      </button>
                    );
                  })}
                  {moduleLessons.length === 0 && (
                    <p className="px-5 py-4 font-body text-sm text-navy-400">No lessons in this module yet.</p>
                  )}
                </div>
              </div>
            );
          })}
          {modules.length === 0 && (
            <EmptyState icon={BookOpen} title="No modules yet" message="This course doesn't have any content yet. Check back soon." />
          )}
        </div>
      </>
    );
  }

  /* ── Lesson view ──────────────────────────────────────── */
  if (lessonState.loading) return <LoadingState />;
  if (lessonState.error) return <ErrorState message={lessonState.error} />;

  const lesson = lessonState.lesson;
  const isComplete = lessonState.progress?.status === 'completed';
  const isStarted = lessonState.progress?.status === 'in_progress';

  return (
    <>
      <Seo title={lesson.title} description={lesson.description} path={`/learn/courses/${courseId}/lessons/${lessonId}`} />

      {/* Mobile action bar */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-3.5 py-2 font-body text-sm font-semibold text-navy-700 shadow-sm"
        >
          <Menu size={15} /> Contents
        </button>
        <button
          type="button"
          onClick={() => setCompassOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-3.5 py-2 font-body text-sm font-semibold text-navy-700 shadow-sm"
        >
          <Sparkles size={15} /> Ask Compass
        </button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Desktop sidebar */}
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-80 flex-shrink-0 overflow-y-auto rounded-2xl border border-navy-100 bg-white shadow-sm lg:block">
          <div className="border-b border-navy-100 px-4 py-4">
            <Link to={`/learn/courses/${courseId}`} className="inline-flex items-center gap-1 font-body text-xs font-semibold text-navy-500 hover:text-navy-800">
              <ArrowLeft size={13} /> Course Overview
            </Link>
            <p className="mt-2 truncate font-display text-sm font-bold text-navy-900">{course.title}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-navy-100">
                <div className="h-1.5 rounded-full bg-gold-500 transition-all duration-500" style={{ width: `${percent}%` }} />
              </div>
              <span className="font-body text-xs font-semibold text-gold-700">{percent}%</span>
            </div>
          </div>
          <div className="overflow-y-auto">
            {modules.map((module) => (
              <SidebarModule
                key={module.id}
                module={module}
                lessons={state.flatLessons}
                progressMap={progressMap}
                currentLessonId={lessonId}
                onSelectLesson={selectLesson}
                defaultOpen={state.flatLessons.some((l) => l.module_id === module.id && l.id === lessonId)}
              />
            ))}
          </div>
        </aside>

        {/* Main lesson area */}
        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-3xl">
            <LessonContent
              lesson={lesson}
              resources={lessonState.resources}
              isComplete={isComplete}
              isStarted={isStarted}
              onComplete={handleComplete}
              completing={completing}
            />

            <QuizPlayer lessonId={lessonId} enrollmentId={state.enrollment?.id} />
            <AssignmentPanel lessonId={lessonId} enrollmentId={state.enrollment?.id} />

            {/* Prev / Next */}
            <div className="mt-8 flex items-center justify-between border-t border-navy-100 pt-6">
              {prevLesson ? (
                <button
                  type="button"
                  onClick={() => selectLesson(prevLesson.id)}
                  className="group inline-flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-sm transition-colors hover:bg-navy-50/40"
                >
                  <ArrowLeft size={16} className="text-navy-400 group-hover:text-gold-600" />
                  <div className="text-left">
                    <p className="font-body text-xs text-navy-400">Previous</p>
                    <p className="font-body text-sm font-semibold text-navy-800">{prevLesson.title}</p>
                  </div>
                </button>
              ) : (
                <Link
                  to={`/learn/courses/${courseId}`}
                  className="group inline-flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-sm transition-colors hover:bg-navy-50/40"
                >
                  <ArrowLeft size={16} className="text-navy-400 group-hover:text-gold-600" />
                  <div className="text-left">
                    <p className="font-body text-xs text-navy-400">Back to</p>
                    <p className="font-body text-sm font-semibold text-navy-800">Course Overview</p>
                  </div>
                </Link>
              )}

              {nextLesson ? (
                <button
                  type="button"
                  onClick={() => selectLesson(nextLesson.id)}
                  className="group inline-flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-sm transition-colors hover:bg-navy-50/40"
                >
                  <div className="text-right">
                    <p className="font-body text-xs text-navy-400">Next</p>
                    <p className="font-body text-sm font-semibold text-navy-800">{nextLesson.title}</p>
                  </div>
                  <ArrowRight size={16} className="text-navy-400 group-hover:text-gold-600" />
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                  <Sparkles size={16} className="text-emerald-600" />
                  <p className="font-body text-sm font-semibold text-emerald-700">
                    {completedLessons === totalLessons ? 'Course Complete!' : 'Last Lesson'}
                  </p>
                </div>
              )}
            </div>

            {/* Completion banner */}
            {showCompletionBanner && completionResult?.success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <GraduationCap size={22} />
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold text-emerald-900">Course Completed!</p>
                    <p className="mt-1 font-body text-sm text-emerald-700">
                      Congratulations. You have met all completion requirements for this course.
                      {completionResult?.certificate_id
                        ? ' Your certificate has been issued and is available in your certificate library.'
                        : ''}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {completionResult?.certificate_id && (
                        <Link
                          to="/learn/certificates"
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          <GraduationCap size={15} /> View My Certificates
                        </Link>
                      )}
                      <button
                        onClick={() => setShowCompletionBanner(false)}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 px-4 py-2 font-body text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Continue Learning
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCompletionBanner(false)}
                    className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-100"
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Desktop Compass rail */}
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-80 flex-shrink-0 xl:block">
          <LessonCompass
            lesson={lesson}
            course={course}
            courseCode={course.code}
          />
        </aside>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[60] flex lg:hidden">
            <div className="absolute inset-0 bg-navy-950/50" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="relative flex h-full w-80 max-w-[85%] flex-col bg-white shadow-premium-lg"
            >
              <div className="flex items-center justify-between border-b border-navy-100 px-4 py-4">
                <div>
                  <Link to={`/learn/courses/${courseId}`} onClick={() => setSidebarOpen(false)} className="inline-flex items-center gap-1 font-body text-xs font-semibold text-navy-500 hover:text-navy-800">
                    <ArrowLeft size={13} /> Course Overview
                  </Link>
                  <p className="mt-1 truncate font-display text-sm font-bold text-navy-900">{course.title}</p>
                </div>
                <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-50">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {modules.map((module) => (
                  <SidebarModule
                    key={module.id}
                    module={module}
                    lessons={state.flatLessons}
                    progressMap={progressMap}
                    currentLessonId={lessonId}
                    onSelectLesson={selectLesson}
                    defaultOpen={state.flatLessons.some((l) => l.module_id === module.id && l.id === lessonId)}
                  />
                ))}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Compass drawer */}
      <AnimatePresence>
        {compassOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end xl:hidden">
            <div className="absolute inset-0 bg-navy-950/50" onClick={() => setCompassOpen(false)} />
            <motion.aside
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="relative flex h-full w-96 max-w-[90%] flex-col bg-cream p-3 shadow-premium-lg"
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <p className="font-body text-xs font-bold uppercase tracking-wider text-navy-400">
                  Lesson Compass
                </p>
                <button
                  type="button"
                  onClick={() => setCompassOpen(false)}
                  className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-100"
                  aria-label="Close Compass"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <LessonCompass
                  lesson={lesson}
                  course={course}
                  courseCode={course.code}
                />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}