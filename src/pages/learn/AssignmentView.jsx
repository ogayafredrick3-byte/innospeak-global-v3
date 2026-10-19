import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState } from '../../components/portal/PortalStates.jsx';
import { getAssignment, getMySubmissionStatus, submitAssignment, uploadSubmissionFile } from '../../lib/supabase/lms';

export default function AssignmentView() {
  const { assignmentId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, assignment: null, submission: null });
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    Promise.all([getAssignment(assignmentId), getMySubmissionStatus(assignmentId)])
      .then(([assignment, submission]) => setState({ loading: false, error: null, assignment, submission }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load this assignment.', assignment: null, submission: null }));
  }, [assignmentId]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let fileUrl = null;
      let fileName = null;
      if (file) {
        const result = await uploadSubmissionFile(assignmentId, file);
        fileUrl = result.path;
        fileName = file.name;
      }
      const isLate = state.assignment.due_date ? new Date() > new Date(state.assignment.due_date) : false;
      const attemptNumber = (state.submission?.attempt_number || 0) + 1;
      await submitAssignment(assignmentId, {
        textResponse: comment,
        fileUrl,
        fileName,
        attemptNumber,
        isLate,
      });
      setFile(null);
      setComment('');
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not submit this assignment.' }));
    } finally {
      setSubmitting(false);
    }
  }

  if (state.loading) return <LoadingState />;
  if (state.error && !state.assignment) return <ErrorState message={state.error} />;

  const { assignment, submission } = state;
  const canSubmit = !submission || submission.status === 'resubmission_required' || (submission.status === 'submitted' && assignment.allow_multiple_submissions);
  const isPastDue = assignment.due_date ? new Date() > new Date(assignment.due_date) : false;

  return (
    <>
      <Seo title={assignment.title} description="Assignment." path={`/learn/assignments/${assignmentId}`} />

      <Link to="/learn" className="font-body text-sm font-semibold text-navy-500 hover:text-navy-800">
        ← Back to learning
      </Link>

      <SectionCard title={assignment.title} className="mt-4">
        {assignment.instructions && <p className="font-body text-sm text-navy-700 whitespace-pre-wrap">{assignment.instructions}</p>}
        <div className="mt-3 flex flex-wrap gap-4 font-body text-xs text-navy-500">
          <span>Max score: {assignment.max_score}</span>
          {assignment.due_date && <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>}
          <span>Type: {assignment.submission_type}</span>
        </div>

        {state.error && <div className="mt-4"><ErrorState message={state.error} /></div>}

        {submission && (
          <div className="mt-6 border-t border-navy-100 pt-4">
            <p className="font-body text-sm font-semibold text-navy-900">Your Submission</p>
            <div className="mt-2 rounded-lg bg-navy-50/60 px-3 py-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-navy-800">Attempt {submission.attempt_number} — {new Date(submission.submitted_at).toLocaleString()}</span>
                <span className="font-body text-xs font-semibold text-gold-700">{submission.status}</span>
              </div>
              {submission.status === 'graded' && (
                <p className="mt-1 font-body text-sm text-emerald-700">Score: {submission.score} / {assignment.max_score}</p>
              )}
              {submission.feedback && <p className="mt-1 font-body text-sm text-navy-600">Feedback: {submission.feedback}</p>}
            </div>
          </div>
        )}

        {canSubmit ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-navy-100 pt-6">
            {(assignment.submission_type === 'file' || assignment.submission_type === 'text_file') && (
              <div>
                <label className="font-body text-sm font-bold text-navy-900">File{assignment.allowed_file_types ? ` (${assignment.allowed_file_types})` : ''}</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-2 block font-body text-sm" />
              </div>
            )}
            {(assignment.submission_type === 'text' || assignment.submission_type === 'text_file') && (
              <div>
                <label className="font-body text-sm font-bold text-navy-900">Response</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-navy-200 px-3 py-2 font-body text-sm" />
              </div>
            )}
            <button type="submit" disabled={submitting} className="btn-gold inline-flex items-center gap-2 disabled:opacity-60">
              <Upload size={16} /> {submitting ? 'Submitting…' : submission ? 'Resubmit Assignment' : 'Submit Assignment'}
            </button>
          </form>
        ) : (
          <p className="mt-6 font-body text-sm text-navy-500">
            {isPastDue ? 'The due date has passed.' : 'You have submitted this assignment and it is awaiting grading.'}
          </p>
        )}
      </SectionCard>
    </>
  );
}
