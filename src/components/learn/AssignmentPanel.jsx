import { useEffect, useState, useCallback } from 'react';
import {
  FileText, Upload, CheckCircle2, AlertCircle, Clock, Award,
  Save, RefreshCw, Download, X, ClipboardList,
} from 'lucide-react';
import { LoadingState, EmptyState } from '../portal/PortalStates.jsx';
import StatusBadge from '../portal/StatusBadge.jsx';
import {
  getLessonAssignment, getMySubmissionStatus,
  submitAssignment, replaceSubmission, uploadSubmissionFile,
} from '../../lib/supabase/lms';

const SUBMISSION_TYPE_LABELS = {
  text: 'Text Response',
  file: 'File Upload',
  text_file: 'Text + File Upload',
};

function statusToBadge(status) {
  if (!status) return 'neutral';
  if (status === 'graded') return 'positive';
  if (status === 'resubmission_required') return 'negative';
  return 'pending';
}

function statusLabel(status) {
  if (!status) return 'Not Started';
  if (status === 'submitted') return 'Submitted';
  if (status === 'graded') return 'Graded';
  if (status === 'resubmission_required') return 'Resubmission Required';
  return status;
}

export default function AssignmentPanel({ lessonId, enrollmentId }) {
  const [state, setState] = useState({ loading: true, assignment: null, submission: null, error: null });
  const [textResponse, setTextResponse] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const load = useCallback(() => {
    setState((p) => ({ ...p, loading: true }));
    getLessonAssignment(lessonId)
      .then(async (assignment) => {
        if (!assignment || assignment.status !== 'published') {
          setState({ loading: false, assignment: null, submission: null, error: null });
          return;
        }
        const submission = await getMySubmissionStatus(assignment.id).catch(() => null);
        setState({ loading: false, assignment, submission, error: null });
        if (submission) {
          setTextResponse(submission.text_response || '');
          setFileUrl(submission.file_path || submission.file_url || '');
          setFileName(submission.file_name || '');
        }
      })
      .catch(() => setState({ loading: false, assignment: null, submission: null, error: 'Could not load assignment.' }));
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!state.assignment) return;
    const maxSize = state.assignment.max_file_size_mb || 10;
    if (file.size > maxSize * 1024 * 1024) {
      setSubmitError(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }
    const allowed = state.assignment.allowed_file_types;
    if (allowed && allowed.trim()) {
      const exts = allowed.split(',').map((s) => s.trim().toLowerCase());
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!exts.includes(fileExt)) {
        setSubmitError(`File type not allowed. Accepted: ${allowed}`);
        return;
      }
    }
    setUploading(true);
    setSubmitError(null);
    try {
      const { path } = await uploadSubmissionFile(state.assignment.id, file);
      setFileUrl(path);
      setFileName(file.name);
    } catch {
      setSubmitError('Could not upload file. Please try again.');
    }
    setUploading(false);
  }

  async function handleSubmit() {
    if (!state.assignment) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const needsText = state.assignment.submission_type === 'text' || state.assignment.submission_type === 'text_file';
      const needsFile = state.assignment.submission_type === 'file' || state.assignment.submission_type === 'text_file';
      if (needsText && !textResponse.trim()) { setSubmitError('Please enter a text response.'); setSubmitting(false); return; }
      if (needsFile && !fileUrl) { setSubmitError('Please upload a file.'); setSubmitting(false); return; }

      const isLate = state.assignment.due_date ? new Date() > new Date(state.assignment.due_date) : false;
      const canReplace = state.submission && state.submission.status === 'submitted' && state.assignment.allow_multiple_submissions;

      if (canReplace) {
        await replaceSubmission(state.submission.id, {
          textResponse: needsText ? textResponse : '',
          fileUrl: needsFile ? fileUrl : '',
          fileName: needsFile ? fileName : '',
          isLate,
        });
      } else if (state.submission && state.submission.status === 'resubmission_required') {
        const nextAttempt = (state.submission.attempt_number || 1) + 1;
        await submitAssignment(state.assignment.id, {
          textResponse: needsText ? textResponse : '',
          fileUrl: needsFile ? fileUrl : '',
          fileName: needsFile ? fileName : '',
          attemptNumber: nextAttempt,
          isLate,
          enrollmentId,
        });
      } else if (!state.submission) {
        await submitAssignment(state.assignment.id, {
          textResponse: needsText ? textResponse : '',
          fileUrl: needsFile ? fileUrl : '',
          fileName: needsFile ? fileName : '',
          attemptNumber: 1,
          isLate,
          enrollmentId,
        });
      } else {
        setSubmitError('You cannot resubmit this assignment.');
        setSubmitting(false);
        return;
      }
      setSubmitSuccess(true);
      load();
    } catch {
      setSubmitError('Could not submit. Please try again.');
    }
    setSubmitting(false);
  }

  if (state.loading) return <LoadingState />;
  if (!state.assignment) return null;

  const assignment = state.assignment;
  const submission = state.submission;
  const needsText = assignment.submission_type === 'text' || assignment.submission_type === 'text_file';
  const needsFile = assignment.submission_type === 'file' || assignment.submission_type === 'text_file';
  const canSubmit = !submission || submission.status === 'submitted' && assignment.allow_multiple_submissions || submission.status === 'resubmission_required';
  const isLate = assignment.due_date ? new Date() > new Date(assignment.due_date) : false;

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
            <ClipboardList size={20} />
          </span>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Assignment</p>
            <h3 className="font-display text-lg font-bold text-navy-900">{assignment.title}</h3>
          </div>
        </div>
        <StatusBadge status={submission ? submission.status : 'draft'} />
      </div>

      {/* Meta info */}
      <div className="mt-4 flex flex-wrap gap-4">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-1.5 font-body text-xs font-semibold text-navy-700">
          <Award size={13} className="text-gold-600" /> Max Score: {assignment.max_score}
        </span>
        {assignment.due_date && (
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-semibold ${isLate ? 'bg-rose-50 text-rose-700' : 'bg-navy-50 text-navy-700'}`}>
            <Clock size={13} className={isLate ? 'text-rose-600' : 'text-navy-400'} />
            Due: {new Date(assignment.due_date).toLocaleString()}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-1.5 font-body text-xs font-semibold text-navy-700">
          <FileText size={13} className="text-navy-400" /> {SUBMISSION_TYPE_LABELS[assignment.submission_type] || assignment.submission_type}
        </span>
      </div>

      {/* Description & Instructions */}
      {assignment.description && (
        <p className="mt-4 font-body text-sm text-navy-600">{assignment.description}</p>
      )}
      {assignment.instructions && (
        <div className="mt-3 rounded-xl bg-navy-50/50 p-4">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Instructions</p>
          <p className="mt-1 whitespace-pre-wrap font-body text-sm text-navy-700">{assignment.instructions}</p>
        </div>
      )}

      {/* Learning objectives */}
      {assignment.learning_objectives?.length > 0 && (
        <div className="mt-3">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Learning Objectives</p>
          <ul className="mt-1 space-y-1">
            {assignment.learning_objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 font-body text-sm text-navy-700">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-gold-600" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Graded result */}
      {submission?.status === 'graded' && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <p className="font-body text-sm font-bold text-navy-900">Graded: {submission.score} / {assignment.max_score}</p>
          </div>
          {submission.feedback && (
            <div className="mt-2">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-navy-400">Tutor Feedback</p>
              <p className="mt-1 whitespace-pre-wrap font-body text-sm text-navy-700">{submission.feedback}</p>
            </div>
          )}
          <p className="mt-2 font-body text-xs text-navy-400">
            Submitted: {new Date(submission.submitted_at).toLocaleString()}
            {submission.graded_at && ` · Graded: ${new Date(submission.graded_at).toLocaleString()}`}
          </p>
        </div>
      )}

      {/* Resubmission required */}
      {submission?.status === 'resubmission_required' && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />
            <p className="font-body text-sm font-bold text-navy-900">Resubmission Required</p>
          </div>
          {submission.feedback && (
            <p className="mt-2 whitespace-pre-wrap font-body text-sm text-navy-700">{submission.feedback}</p>
          )}
        </div>
      )}

      {/* Already submitted (not graded, no resubmit) */}
      {submission?.status === 'submitted' && !assignment.allow_multiple_submissions && (
        <div className="mt-4 rounded-2xl border border-navy-200 bg-navy-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-navy-500" />
            <p className="font-body text-sm font-bold text-navy-900">Submitted</p>
          </div>
          <p className="mt-1 font-body text-xs text-navy-400">
            Submitted: {new Date(submission.submitted_at).toLocaleString()}{submission.is_late ? ' (Late)' : ''}
          </p>
          <p className="mt-1 font-body text-xs text-navy-400">Awaiting grading by your tutor.</p>
        </div>
      )}

      {/* Submission form */}
      {canSubmit && (
        <div className="mt-4 space-y-4 border-t border-navy-100 pt-4">
          <p className="font-body text-sm font-bold text-navy-900">
            {submission?.status === 'resubmission_required' ? 'Resubmit Assignment' : submission ? 'Update Submission' : 'Submit Assignment'}
          </p>

          {submitError && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
              <p className="font-body text-sm text-navy-700">{submitError}</p>
            </div>
          )}
          {submitSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <p className="font-body text-sm text-navy-700">Submitted successfully.</p>
            </div>
          )}

          {needsText && (
            <div>
              <label className="font-body text-sm font-bold tracking-wide text-navy-900">Your Response</label>
              <textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                rows={6}
                placeholder="Type your response here..."
                className="mt-2 w-full rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/20"
              />
            </div>
          )}

          {needsFile && (
            <div>
              <label className="font-body text-sm font-bold tracking-wide text-navy-900">Upload File</label>
              {fileUrl ? (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="flex-1 truncate font-body text-sm text-emerald-700">{fileName}</span>
                  <button type="button" onClick={() => { setFileUrl(''); setFileName(''); }} className="text-navy-400 hover:text-rose-500"><X size={14} /></button>
                </div>
              ) : (
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy-200 bg-cream px-4 py-6 font-body text-sm text-navy-500 hover:border-gold-500 hover:text-gold-700">
                  <Upload size={16} />
                  {uploading ? 'Uploading...' : 'Click to upload a file'}
                  <input type="file" className="sr-only" onChange={handleUpload} disabled={uploading} />
                </label>
              )}
              {assignment.allowed_file_types && (
                <p className="mt-1 font-body text-xs text-navy-400">Accepted: {assignment.allowed_file_types} · Max {assignment.max_file_size_mb}MB</p>
              )}
            </div>
          )}

          <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-gold inline-flex items-center gap-2 disabled:opacity-60">
            {submission?.status === 'resubmission_required' ? <RefreshCw size={16} /> : <Save size={16} />}
            {submitting ? 'Submitting…' : submission?.status === 'resubmission_required' ? 'Resubmit' : submission ? 'Update Submission' : 'Submit Assignment'}
          </button>
        </div>
      )}
    </div>
  );
}
