import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileCheck2, Users, Megaphone, Plus, BarChart3, ClipboardList,
  Download, CheckCircle2, AlertCircle, RefreshCw, X, FileText, ChevronDown, ChevronRight,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import DiscussionBoard from '../../components/lms/DiscussionBoard.jsx';
import {
  getCourse,
  listModulesWithLessons,
  listCourseAssignments,
  listAssignmentSubmissions,
  listCourseEnrollments,
  listCourseAnnouncements,
  createAnnouncement,
  gradeSubmission,
  requestResubmission,
  getCourseAnalytics,
} from '../../lib/supabase/lms';

const SUBMISSION_TYPE_LABELS = {
  text: 'Text Response',
  file: 'File Upload',
  text_file: 'Text + File',
};

function statusBadgeVariant(status) {
  if (status === 'graded') return 'positive';
  if (status === 'resubmission_required') return 'negative';
  return 'pending';
}

function GradingRow({ submission, assignment, onGraded }) {
  const [expanded, setExpanded] = useState(false);
  const [score, setScore] = useState(submission.score ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleGrade() {
    if (score === '' || score === null) { setError('Enter a score first.'); return; }
    setSaving(true);
    setError(null);
    try {
      await gradeSubmission(submission.id, { score: Number(score), feedback });
      onGraded();
    } catch {
      setError('Could not save grade.');
    }
    setSaving(false);
  }

  async function handleResubmission() {
    setSaving(true);
    setError(null);
    try {
      await requestResubmission(submission.id, feedback || 'Please resubmit this assignment.');
      onGraded();
    } catch {
      setError('Could not request resubmission.');
    }
    setSaving(false);
  }

  return (
    <div className="border-t border-navy-50">
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-navy-50/40"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? <ChevronDown size={14} className="text-navy-400" /> : <ChevronRight size={14} className="text-navy-400" />}
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-semibold text-navy-800">
            {submission.profiles?.full_name || submission.student_id}
          </p>
          <p className="font-body text-xs text-navy-400">
            Attempt {submission.attempt_number} · {new Date(submission.submitted_at).toLocaleString()}
            {submission.is_late && <span className="ml-1 text-rose-600">(Late)</span>}
          </p>
        </div>
        <StatusBadge status={submission.status} />
        <span className="font-body text-sm font-semibold text-navy-700">
          {submission.score != null ? `${submission.score}/${assignment.max_score}` : '—'}
        </span>
      </div>

      {expanded && (
        <div className="space-y-3 bg-navy-50/30 px-4 py-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
              <AlertCircle size={14} className="text-rose-600" />
              <p className="font-body text-sm text-rose-700">{error}</p>
            </div>
          )}

          {/* Text response */}
          {submission.text_response && (
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Text Response</p>
              <div className="mt-1 rounded-lg border border-navy-100 bg-white p-3">
                <p className="whitespace-pre-wrap font-body text-sm text-navy-700">{submission.text_response}</p>
              </div>
            </div>
          )}

          {/* File */}
          {submission.file_url && (
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Submitted File</p>
              <a
                href={submission.file_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-2 rounded-lg border border-navy-100 bg-white px-3 py-2 font-body text-sm font-semibold text-gold-700 hover:bg-gold-50"
              >
                <Download size={14} /> {submission.file_name || 'Download file'}
              </a>
            </div>
          )}

          {!submission.text_response && !submission.file_url && (
            <p className="font-body text-sm text-navy-400">No content submitted.</p>
          )}

          {/* Grading controls */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Score</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  value={score}
                  max={assignment.max_score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-24 rounded-lg border border-navy-200 px-3 py-2 font-body text-sm"
                  placeholder="0"
                />
                <span className="font-body text-sm text-navy-400">/ {assignment.max_score}</span>
              </div>
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                placeholder="Write feedback for the student..."
                className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGrade}
              disabled={saving || score === ''}
              className="btn-gold inline-flex items-center gap-2 text-xs disabled:opacity-60"
            >
              <CheckCircle2 size={14} /> {saving ? 'Saving…' : 'Mark as Graded'}
            </button>
            <button
              type="button"
              onClick={handleResubmission}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 font-body text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
            >
              <RefreshCw size={14} /> Request Resubmission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentGrading({ assignment, onGraded }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    listAssignmentSubmissions(assignment.id)
      .then(setSubmissions)
      .finally(() => setLoading(false));
  }, [assignment.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;

  const gradedCount = submissions.filter((s) => s.status === 'graded').length;
  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
  const resubmitCount = submissions.filter((s) => s.status === 'resubmission_required').length;

  return (
    <SectionCard
      title={assignment.title}
      description={`${submissions.length} submission(s) · ${gradedCount} graded · ${pendingCount} pending · ${resubmitCount} resubmission requested`}
      className="mt-4"
    >
      <div className="mb-3 flex flex-wrap gap-2 font-body text-xs text-navy-500">
        <span className="rounded-lg bg-navy-50 px-2 py-1">Type: {SUBMISSION_TYPE_LABELS[assignment.submission_type] || assignment.submission_type}</span>
        <span className="rounded-lg bg-navy-50 px-2 py-1">Max score: {assignment.max_score}</span>
        {assignment.due_date && <span className="rounded-lg bg-navy-50 px-2 py-1">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>}
        {assignment.lessons?.title && <span className="rounded-lg bg-navy-50 px-2 py-1">Lesson: {assignment.lessons.title}</span>}
      </div>

      {submissions.length === 0 ? (
        <EmptyState icon={FileCheck2} title="No submissions yet" message="Students will appear here once they submit their work." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-navy-100">
          {submissions.map((s) => (
            <GradingRow key={s.id} submission={s} assignment={assignment} onGraded={load} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

export default function Submissions() {
  const { courseId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, course: null, assignments: [], enrollments: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '' });
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const loadAnnouncements = useCallback(() => {
    listCourseAnnouncements(courseId).then(setAnnouncements).catch(() => {});
  }, [courseId]);

  useEffect(() => {
    Promise.all([getCourse(courseId), listModulesWithLessons(courseId), listCourseEnrollments(courseId), listCourseAssignments(courseId)])
      .then(async ([course, modules, enrollments, assignments]) => {
        setState({ loading: false, error: null, course, assignments, enrollments });
      })
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load submissions.', course: null, assignments: [], enrollments: [] }));
    loadAnnouncements();
    getCourseAnalytics(courseId).then(setAnalytics).catch(() => {});
  }, [courseId, loadAnnouncements]);

  async function handlePostAnnouncement(e) {
    e.preventDefault();
    if (!announcementForm.title) return;
    await createAnnouncement(courseId, announcementForm);
    setAnnouncementForm({ title: '', body: '' });
    setShowAnnouncementForm(false);
    loadAnnouncements();
  }

  if (state.loading) return <LoadingState />;
  if (state.error) return <ErrorState message={state.error} />;

  return (
    <>
      <Seo title={`${state.course.title} — Grading`} description="Grade student submissions." path={`/teach/courses/${courseId}/submissions`} />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">{state.course.title}</h1>
      </div>

      {analytics && (
        <SectionCard title="Course Analytics" className="mt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="font-display text-2xl font-bold text-navy-900">{analytics.enrolled}</p>
              <p className="font-body text-xs text-navy-500">Enrolled</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-navy-900">{analytics.completion_rate_percent}%</p>
              <p className="font-body text-xs text-navy-500">Completion Rate</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-navy-900">{analytics.avg_progress_percent}%</p>
              <p className="font-body text-xs text-navy-500">Avg Progress</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-navy-900">{analytics.avg_quiz_score_percent}%</p>
              <p className="font-body text-xs text-navy-500">Avg Quiz Score</p>
            </div>
          </div>
          {analytics.students_needing_attention?.length > 0 && (
            <div className="mt-4 rounded-xl bg-rose-50 p-3">
              <p className="font-body text-xs font-semibold text-rose-800">
                <BarChart3 size={13} className="mr-1 inline" />
                {analytics.students_needing_attention.length} student(s) may need attention (enrolled 14+ days, under 20% progress)
              </p>
            </div>
          )}
        </SectionCard>
      )}

      <SectionCard title="Announcements" className="mt-6">
        <button type="button" onClick={() => setShowAnnouncementForm((v) => !v)} className="btn-outline mb-4 inline-flex items-center gap-2 text-xs">
          <Plus size={13} /> Post Announcement
        </button>
        {showAnnouncementForm && (
          <form onSubmit={handlePostAnnouncement} className="mb-4 space-y-3 rounded-xl border border-navy-100 p-4">
            <input
              type="text"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Announcement title"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-sm"
              required
            />
            <textarea
              value={announcementForm.body}
              onChange={(e) => setAnnouncementForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Message to enrolled students…"
              rows={3}
              className="w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-sm"
            />
            <button type="submit" className="btn-gold text-sm">Post to Class</button>
          </form>
        )}
        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" />
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-lg bg-gold-500/5 px-3 py-3">
                <p className="font-body text-sm font-semibold text-navy-900">{a.title}</p>
                <p className="mt-1 font-body text-sm text-navy-700">{a.body}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Enrolled Students" className="mt-6">
        {state.enrollments.length === 0 ? (
          <EmptyState icon={Users} title="No students enrolled yet" />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {state.enrollments.map((e) => (
              <li key={e.id} className="rounded-lg bg-navy-50/60 px-3 py-2 font-body text-sm text-navy-800">
                {e.profiles?.full_name || e.student_id} <span className="text-xs text-navy-400">— {e.status}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <div className="mt-6">
        <h2 className="font-display text-lg font-bold text-navy-900">Assignment Submissions</h2>
        {state.assignments.length === 0 && (
          <div className="mt-2">
            <EmptyState icon={ClipboardList} title="No assignments yet" message="Create assignments from the Lesson Content Builder to start collecting submissions." />
          </div>
        )}
        {state.assignments.map((a) => (
          <AssignmentGrading key={a.id} assignment={a} onGraded={() => {}} />
        ))}
      </div>

      <DiscussionBoard courseId={courseId} isInstructor />
    </>
  );
}
