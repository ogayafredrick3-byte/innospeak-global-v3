import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ArrowLeft, CheckCircle2, XCircle, AlertCircle,
  Clock, Send, Upload, Eye, HelpCircle, Circle, ClipboardList,
  Award, Save,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  listAllCourses, getCourseForAdmin, listModulesWithLessons,
  setCourseUnderReview, approveCourse, publishCourse,
  rejectCourse, requestCourseChanges,
  getLessonQuizForAdmin,
  getCourseAssignmentsForAdmin,
  updateCourseCompletionConfig,
} from '../../lib/supabase/lms';

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">{label}</p>
      <p className="mt-1 font-body text-sm text-navy-800">{value || '—'}</p>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium">
      <h3 className="font-display text-base font-bold text-navy-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function LessonQuizInfo({ lessonIds }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonIds.length === 0) { setLoading(false); return; }
    Promise.all(lessonIds.map((id) => getLessonQuizForAdmin(id).catch(() => null)))
      .then((results) => {
        setQuizzes(results.filter(Boolean));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lessonIds.join(',')]);

  if (loading || quizzes.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 rounded-lg bg-navy-50/60 p-3">
      <p className="flex items-center gap-1.5 font-body text-xs font-bold text-navy-700">
        <HelpCircle size={13} className="text-gold-600" /> Quizzes
      </p>
      {quizzes.map((qz) => (
        <div key={qz.id} className="rounded-lg border border-navy-100 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 font-body text-xs font-semibold ${
              qz.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {qz.status === 'published' ? 'Published' : 'Draft'}
            </span>
            <p className="font-body text-xs font-semibold text-navy-900">{qz.title}</p>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 font-body text-xs text-navy-400">
            <span>{(qz.quiz_questions || []).length} questions</span>
            <span>Pass: {qz.passing_score_percent}%</span>
            <span>Max attempts: {qz.max_attempts}</span>
            {qz.require_pass_to_complete && <span className="text-gold-700">Required to complete lesson</span>}
          </div>
          {(qz.quiz_questions || []).length > 0 && (
            <ul className="mt-2 space-y-1">
              {qz.quiz_questions.sort((a, b) => a.position - b.position).map((qq, qi) => (
                <li key={qq.id} className="font-body text-xs text-navy-600">
                  <span className="font-semibold text-navy-700">{qi + 1}.</span> {qq.question_text}
                  <span className="ml-1 text-navy-400">({qq.question_type}, {qq.marks}m)</span>
                  {qq.quiz_question_options && (
                    <ul className="ml-4 mt-0.5 space-y-0.5">
                      {qq.quiz_question_options.sort((a, b) => a.position - b.position).map((o) => (
                        <li key={o.id} className="flex items-center gap-1">
                          {o.is_correct
                            ? <CheckCircle2 size={10} className="text-emerald-600" />
                            : <Circle size={10} className="text-navy-200" />}
                          <span className={o.is_correct ? 'text-emerald-700' : 'text-navy-500'}>{o.option_text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function LessonAssignmentInfo({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    getCourseAssignmentsForAdmin(courseId)
      .then(setAssignments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading || assignments.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 rounded-lg bg-navy-50/60 p-3">
      <p className="flex items-center gap-1.5 font-body text-xs font-bold text-navy-700">
        <ClipboardList size={13} className="text-gold-600" /> Assignments ({assignments.length})
      </p>
      {assignments.map((asg) => (
        <div key={asg.id} className="rounded-lg border border-navy-100 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 font-body text-xs font-semibold ${
              asg.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {asg.status === 'published' ? 'Published' : 'Draft'}
            </span>
            <p className="font-body text-xs font-semibold text-navy-900">{asg.title}</p>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 font-body text-xs text-navy-400">
            <span>Max score: {asg.max_score}</span>
            <span>Type: {asg.submission_type === 'text' ? 'Text' : asg.submission_type === 'file' ? 'File' : 'Text + File'}</span>
            {asg.due_date && <span>Due: {new Date(asg.due_date).toLocaleDateString()}</span>}
            {asg.lessons?.title && <span>Lesson: {asg.lessons.title}</span>}
          </div>
          {asg.description && <p className="mt-1 font-body text-xs text-navy-500">{asg.description}</p>}
        </div>
      ))}
    </div>
  );
}

export default function CourseReview() {
  const [list, setList] = useState({ loading: true, error: null, items: [] });
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState({ loading: false, error: null, course: null, modules: [] });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [notes, setNotes] = useState('');
  const [completionConfig, setCompletionConfig] = useState({
    awards_certificate: true,
    requires_lesson_completion: true,
    requires_quiz_pass: false,
    requires_assignment_completion: false,
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const loadList = useCallback(async () => {
    setList({ loading: true, error: null, items: [] });
    try {
      const items = await listAllCourses();
      setList({ loading: false, error: null, items });
    } catch {
      setList({ loading: false, error: 'Could not load courses.', items: [] });
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  const loadDetail = useCallback(async (id) => {
    setSelectedId(id);
    setDetail({ loading: true, error: null, course: null, modules: [] });
    setNotes('');
    setActionError(null);
    try {
      const [course, modules] = await Promise.all([getCourseForAdmin(id), listModulesWithLessons(id)]);
      setDetail({ loading: false, error: null, course, modules });
      setNotes(course.reviewer_notes || '');
      setCompletionConfig({
        awards_certificate: course.awards_certificate !== false,
        requires_lesson_completion: course.requires_lesson_completion !== false,
        requires_quiz_pass: course.requires_quiz_pass === true,
        requires_assignment_completion: course.requires_assignment_completion === true,
      });
    } catch {
      setDetail({ loading: false, error: 'Could not load this course.', course: null, modules: [] });
    }
  }, []);

  async function handleAction(action) {
    if (!selectedId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (action === 'review') {
        await setCourseUnderReview(selectedId);
      } else if (action === 'approve') {
        await approveCourse(selectedId);
      } else if (action === 'publish') {
        await publishCourse(selectedId);
      } else if (action === 'reject') {
        if (!notes.trim()) { setActionError('Please provide feedback notes for the rejection.'); setActionLoading(false); return; }
        await rejectCourse(selectedId, notes);
      } else if (action === 'changes') {
        if (!notes.trim()) { setActionError('Please provide feedback notes for the change request.'); setActionLoading(false); return; }
        await requestCourseChanges(selectedId, notes);
      }
      await loadDetail(selectedId);
      await loadList();
    } catch {
      setActionError('Could not complete this action. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Course',
      render: (r) => (
        <button onClick={() => loadDetail(r.id)} className="text-left">
          <p className="font-body text-sm font-semibold text-navy-900 hover:text-gold-600">{r.title}</p>
          <p className="font-body text-xs text-navy-500">{r.category || 'No category'}</p>
        </button>
      ),
    },
    {
      key: 'instructor',
      label: 'Instructor',
      render: (r) => {
        const ins = r.course_instructors?.[0]?.profiles;
        return ins ? `${ins.full_name || '—'}` : '—';
      },
    },
    { key: 'level', label: 'Level', render: (r) => r.level || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'action',
      label: '',
      render: (r) => (
        <button onClick={() => loadDetail(r.id)} className="font-body text-xs font-semibold text-gold-700 hover:text-gold-800">
          Review →
        </button>
      ),
    },
  ];

  // Detail view
  if (selectedId) {
    const course = detail.course;
    const canAct = course && ['submitted', 'under_review', 'changes_requested', 'rejected'].includes(course.status);
    const canPublish = course && course.status === 'approved';

    return (
      <>
        <Seo title="Course Review" description="Review submitted courses." path="/admin/course-review" />

        <button
          onClick={() => { setSelectedId(null); setDetail({ loading: false, error: null, course: null, modules: [] }); }}
          className="inline-flex items-center gap-2 font-body text-sm font-semibold text-navy-600 hover:text-gold-600"
        >
          <ArrowLeft size={16} /> Back to list
        </button>

        {detail.loading && <div className="mt-6"><SectionCard><LoadingState /></SectionCard></div>}
        {detail.error && <div className="mt-6"><SectionCard><ErrorState message={detail.error} /></SectionCard></div>}

        {course && !detail.loading && (
          <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
                <h1 className="mt-1 font-display text-2xl font-bold text-navy-900">{course.title}</h1>
                <p className="mt-1 font-body text-sm text-navy-500">{course.code || 'No code'}</p>
              </div>
              <StatusBadge status={course.status} className="text-sm" />
            </div>

            {/* Course Details */}
            <DetailSection title="Course Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Title" value={course.title} />
                <InfoRow label="Category" value={course.category} />
                <InfoRow label="Level" value={course.level} />
                <InfoRow label="Duration" value={course.duration} />
                <InfoRow label="Language" value={course.language} />
                <InfoRow label="Instructor" value={course.course_instructors?.[0]?.profiles?.full_name || '—'} />
              </div>
              <div className="mt-4">
                <InfoRow label="Description" value={course.description} />
              </div>
              <div className="mt-4">
                <InfoRow label="Requirements" value={course.requirements} />
              </div>
              {course.thumbnail_path && (
                <div className="mt-4">
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Thumbnail</p>
                  <img src={course.thumbnail_path} alt="Course thumbnail" className="mt-2 h-32 w-56 rounded-xl object-cover border border-navy-100" />
                </div>
              )}
            </DetailSection>

            {/* Learning Outcomes */}
            {course.learning_outcomes && course.learning_outcomes.length > 0 && (
              <DetailSection title="Learning Outcomes">
                <ul className="space-y-2">
                  {course.learning_outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-gold-600" />
                      <span className="font-body text-sm text-navy-700">{o}</span>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {/* Course Content */}
            <DetailSection title={`Course Content (${detail.modules.length} modules)`}>
              {detail.modules.length === 0 ? (
                <p className="font-body text-sm text-navy-400">No modules have been added to this course yet.</p>
              ) : (
                <div className="space-y-3">
                  {detail.modules.map((mod, idx) => (
                    <div key={mod.id} className="rounded-xl border border-navy-100 p-4">
                      <p className="font-body text-sm font-bold text-navy-900">Module {idx + 1}: {mod.title}</p>
                      {mod.description && <p className="mt-1 font-body text-xs text-navy-500">{mod.description}</p>}
                      {(mod.lessons || []).length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {mod.lessons.map((lesson, li) => (
                            <li key={lesson.id} className="flex items-center gap-2 font-body text-xs text-navy-600">
                              <BookOpen size={12} className="text-navy-400" />
                              {li + 1}. {lesson.title} <span className="text-navy-400">({lesson.content_type})</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <LessonQuizInfo moduleId={mod.id} lessonIds={(mod.lessons || []).map((l) => l.id)} />
                      <LessonAssignmentInfo courseId={course.id} />
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

            {/* Reviewer feedback from previous round */}
            {course.reviewer_notes && (course.status === 'rejected' || course.status === 'changes_requested') && (
              <div className={`rounded-2xl border p-4 ${course.status === 'rejected' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Previous Feedback</p>
                <p className="mt-1 font-body text-sm text-navy-700">{course.reviewer_notes}</p>
              </div>
            )}

            {/* Review actions */}
            {canAct && (
              <SectionCard title="Review Actions" description="Approve, reject, or request changes for this course.">
                {actionError && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-body text-sm text-navy-800">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
                    <span>{actionError}</span>
                  </div>
                )}
                <div>
                  <label className="font-body text-sm font-bold tracking-wide text-navy-900">Reviewer Notes</label>
                  <p className="mt-0.5 font-body text-xs text-navy-400">Visible to the tutor when rejecting or requesting changes</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter feedback for the tutor..."
                    className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {course.status === 'submitted' && (
                    <button type="button" onClick={() => handleAction('review')} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 font-body text-sm font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-60">
                      <Clock size={15} /> Mark Under Review
                    </button>
                  )}
                  <button type="button" onClick={() => handleAction('approve')} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-body text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                    <CheckCircle2 size={15} /> Approve
                  </button>
                  <button type="button" onClick={() => handleAction('changes')} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-body text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60">
                    <AlertCircle size={15} /> Request Changes
                  </button>
                  <button type="button" onClick={() => handleAction('reject')} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 font-body text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </SectionCard>
            )}

            {/* Publish action */}
            {canPublish && (
              <SectionCard title="Publish Course" description="This course has been approved. Publish it to make it available to students.">
                <button type="button" onClick={() => handleAction('publish')} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-body text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                  <Upload size={15} /> Publish Course
                </button>
              </SectionCard>
            )}

            {/* Already published */}
            {course.status === 'published' && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <div>
                  <p className="font-body text-sm font-bold text-navy-900">Course Published</p>
                  <p className="mt-0.5 font-body text-sm text-navy-500">This course is live and available to students.</p>
                </div>
              </div>
            )}

            {/* Completion & Certificate Settings */}
            <SectionCard title="Completion & Certificate Settings" description="Configure what students must satisfy to complete this course and earn a certificate.">
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completionConfig.awards_certificate}
                    onChange={(e) => setCompletionConfig((p) => ({ ...p, awards_certificate: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-navy-300 text-gold-600 focus:ring-gold-500"
                  />
                  <div>
                    <p className="flex items-center gap-1.5 font-body text-sm font-bold text-navy-900">
                      <Award size={15} className="text-gold-600" /> Awards certificate
                    </p>
                    <p className="font-body text-xs text-navy-400">Issue a verifiable certificate when a student completes this course.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completionConfig.requires_lesson_completion}
                    onChange={(e) => setCompletionConfig((p) => ({ ...p, requires_lesson_completion: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-navy-300 text-gold-600 focus:ring-gold-500"
                  />
                  <div>
                    <p className="font-body text-sm font-bold text-navy-900">Require all lessons completed</p>
                    <p className="font-body text-xs text-navy-400">Student must mark every lesson as complete.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completionConfig.requires_quiz_pass}
                    onChange={(e) => setCompletionConfig((p) => ({ ...p, requires_quiz_pass: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-navy-300 text-gold-600 focus:ring-gold-500"
                  />
                  <div>
                    <p className="font-body text-sm font-bold text-navy-900">Require all quizzes passed</p>
                    <p className="font-body text-xs text-navy-400">Student must pass every published quiz in this course.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completionConfig.requires_assignment_completion}
                    onChange={(e) => setCompletionConfig((p) => ({ ...p, requires_assignment_completion: e.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-navy-300 text-gold-600 focus:ring-gold-500"
                  />
                  <div>
                    <p className="font-body text-sm font-bold text-navy-900">Require all assignments completed</p>
                    <p className="font-body text-xs text-navy-400">Student must complete/submit all assignments in this course.</p>
                  </div>
                </label>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setConfigSaving(true);
                    setConfigSaved(false);
                    try {
                      await updateCourseCompletionConfig(selectedId, completionConfig);
                      setConfigSaved(true);
                      setTimeout(() => setConfigSaved(false), 3000);
                    } catch {
                      setActionError('Could not save completion settings.');
                    } finally {
                      setConfigSaving(false);
                    }
                  }}
                  disabled={configSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 font-body text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
                >
                  <Save size={15} /> {configSaving ? 'Saving…' : 'Save Settings'}
                </button>
                {configSaved && (
                  <span className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-emerald-600">
                    <CheckCircle2 size={15} /> Settings saved
                  </span>
                )}
              </div>
            </SectionCard>
          </div>
        )}
      </>
    );
  }

  // List view
  return (
    <>
      <Seo title="Course Review" description="Review and approve tutor courses." path="/admin/course-review" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Course Review</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Review courses submitted by tutors. Approve courses to make them available for publishing, or reject with feedback.
        </p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {list.loading && <LoadingState />}
          {!list.loading && list.error && <ErrorState message={list.error} />}
          {!list.loading && !list.error && list.items.length === 0 && (
            <EmptyState icon={BookOpen} title="No courses yet" message="Courses created by tutors will appear here for review." />
          )}
          {!list.loading && !list.error && list.items.length > 0 && (
            <DataTable columns={columns} rows={list.items} />
          )}
        </SectionCard>
      </div>
    </>
  );
}
