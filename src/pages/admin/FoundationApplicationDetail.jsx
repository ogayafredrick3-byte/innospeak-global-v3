import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, CheckCircle2, XCircle, Clock, Check, Banknote,
  FileText, User, Mail, ExternalLink, AlertCircle, MessageSquarePlus,
} from 'lucide-react';
import {
  TIMELINE_STEPS,
  getProgramLabel,
  getStatusLabel,
  getCurrentStepIndex,
} from '../../lib/data/foundationApplicationsData.js';
import { getRequiredDocuments } from '../../lib/data/foundationDocumentsData.js';
import {
  getApplication,
  pushStatus,
  updateApplication,
  setDocumentStatus,
} from '../../lib/data/foundationAppStore.js';

const STATUS_TONE = {
  submitted: 'bg-blue-50 text-blue-700 ring-blue-200',
  under_review: 'bg-amber-50 text-amber-800 ring-amber-200',
  verification: 'bg-violet-50 text-violet-700 ring-violet-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  waitlisted: 'bg-amber-50 text-amber-800 ring-amber-200',
  declined: 'bg-rose-50 text-rose-700 ring-rose-200',
  funding_pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  support_confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-navy-50 text-navy-700 ring-navy-200',
};

function StatusChip({ status }) {
  const cls = STATUS_TONE[status] || STATUS_TONE.submitted;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 font-body text-[11px] font-bold uppercase tracking-wider ring-1 ${cls}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FoundationApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportSummary, setSupportSummary] = useState('');
  const [supportNotes, setSupportNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  function refresh() {
    const app = getApplication(id);
    if (!app) {
      setNotFound(true);
      return;
    }
    setApplication(app);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound) return <Navigate to="/admin/foundation/applications" replace />;
  if (!application) return null;

  const currentStep = getCurrentStepIndex(application.status);
  const timeline = application.timeline || [];
  const notifications = application.notifications || [];
  const requiredSlots = getRequiredDocuments(application.program);
  const documents = application.documents || {};

  function handleStatusChange(nextStatus, note) {
    setBusy(true);
    pushStatus(id, nextStatus, note);
    refresh();
    setBusy(false);
    setActionNote('');
    setShowNoteModal(false);
  }

  function handleAddNote() {
    if (!actionNote.trim()) return;
    setBusy(true);
    pushStatus(id, application.status, actionNote.trim());
    refresh();
    setActionNote('');
    setShowNoteModal(false);
    setBusy(false);
  }

  function handleConfirmSupport() {
    if (!supportSummary.trim()) return;
    setBusy(true);
    updateApplication(id, {
      support: {
        summary: supportSummary.trim(),
        notes: supportNotes.trim(),
        confirmedAt: new Date().toISOString(),
      },
    });
    pushStatus(id, 'support_confirmed', `Support confirmed: ${supportSummary.trim()}`);
    refresh();
    setShowSupportModal(false);
    setSupportSummary('');
    setSupportNotes('');
    setBusy(false);
  }

  function handleVerifyDoc(docKey, docId) {
    setDocumentStatus(id, docKey, docId, 'verified', null);
    refresh();
  }

  function handleRejectDocConfirm() {
    if (!rejectTarget || !rejectReason.trim()) return;
    setDocumentStatus(
      id,
      rejectTarget.docKey,
      rejectTarget.docId,
      'rejected',
      rejectReason.trim()
    );
    // Notify the applicant
    pushStatus(
      id,
      application.status,
      `Document rejected — "${rejectTarget.fileName}": ${rejectReason.trim()}. Please re-upload.`
    );
    refresh();
    setRejectTarget(null);
    setRejectReason('');
  }

  function getAvailableActions() {
    const s = application.status;
    const actions = [];

    if (s === 'submitted') {
      actions.push({
        label: 'Start Review',
        next: 'under_review',
        tone: 'primary',
        note: 'Your application is now under review by our Foundation team.',
        icon: Clock,
      });
    }
    if (s === 'under_review') {
      actions.push({
        label: 'Mark Verified',
        next: 'verification',
        tone: 'primary',
        note: 'We are now verifying the information provided in your application.',
        icon: CheckCircle2,
      });
    }
    if (s === 'verification') {
      actions.push({
        label: 'Approve',
        next: 'approved',
        tone: 'success',
        note: 'Your application has been approved. We are now arranging your support.',
        icon: Check,
      });
      actions.push({
        label: 'Waitlist',
        next: 'waitlisted',
        tone: 'warning',
        note: 'Your application has been placed on our waitlist. We will contact you when funding becomes available.',
        icon: Clock,
      });
      actions.push({
        label: 'Decline',
        next: 'declined',
        tone: 'danger',
        note: 'After careful review, we are unable to support this application at this time.',
        icon: XCircle,
      });
    }
    if (s === 'approved' || s === 'waitlisted') {
      actions.push({
        label: 'Confirm Support',
        next: null,
        tone: 'success',
        note: null,
        icon: Banknote,
        opensModal: 'support',
      });
    }
    if (s === 'support_confirmed' || s === 'funding_pending') {
      actions.push({
        label: 'Mark Completed',
        next: 'completed',
        tone: 'primary',
        note: 'Support delivery is complete. Thank you for being part of InnoSpeak Global Foundation.',
        icon: CheckCircle2,
      });
    }

    return actions;
  }

  const actions = getAvailableActions();

  return (
    <>
      <Link
        to="/admin/foundation/applications"
        className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-navy-500 transition-colors hover:text-emerald-700"
      >
        <ArrowLeft size={14} />
        All Applications
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              {getProgramLabel(application.program)}
            </h1>
            <StatusChip status={application.status} />
          </div>
          <p className="mt-2 font-mono text-sm font-bold text-emerald-700">
            {application.reference}
          </p>
          <p className="mt-1 font-body text-sm text-navy-500">
            Submitted{' '}
            {new Date(application.submittedAt).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* ═══ Left ═══ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">Applicant</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                  Name
                </dt>
                <dd className="mt-1 flex items-center gap-2 font-body text-sm font-semibold text-navy-900">
                  <User size={14} className="text-navy-400" />
                  {application.userName || '—'}
                </dd>
              </div>
              <div>
                <dt className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                  Email
                </dt>
                <dd className="mt-1 flex items-center gap-2 font-body text-sm font-semibold text-navy-900">
                  <Mail size={14} className="text-navy-400" />
                  {application.userEmail || '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Documents */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">
              Required Documents
            </h2>
            <p className="mt-1 font-body text-xs text-navy-500">
              Verify each document below. Rejections notify the applicant to re-upload.
            </p>

            {requiredSlots.length === 0 ? (
              <p className="mt-4 font-body text-sm text-navy-500">
                No documents required for this programme.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {requiredSlots.map((slot) => {
                  const files = documents[slot.id] || [];
                  return (
                    <div
                      key={slot.id}
                      className="rounded-2xl border border-navy-100 bg-cream/30 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-body text-sm font-bold text-navy-900">
                            {slot.label}
                            {slot.required && (
                              <span className="ml-1 text-emerald-600">*</span>
                            )}
                          </p>
                          <p className="mt-0.5 font-body text-xs text-navy-500">
                            {slot.description}
                          </p>
                        </div>
                        {files.length === 0 ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-800">
                            <Clock size={11} />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            <Check size={11} />
                            {files.length} uploaded
                          </span>
                        )}
                      </div>

                      {files.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {files.map((f) => {
                            const status = f.status || 'uploaded';
                            const statusCls =
                              status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                                : status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800 ring-rose-200'
                                  : 'bg-navy-100 text-navy-700 ring-navy-200';
                            return (
                              <li
                                key={f.id}
                                className="flex flex-col gap-2 rounded-xl border border-navy-100 bg-white px-3 py-3 sm:flex-row sm:items-center"
                              >
                                <FileText size={16} className="shrink-0 text-navy-400" />

                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-body text-sm font-semibold text-navy-900">
                                    {f.name}
                                  </p>
                                  <p className="mt-0.5 font-body text-[11px] text-navy-400">
                                    {formatSize(f.size)} · uploaded{' '}
                                    {new Date(f.uploadedAt).toLocaleDateString()}
                                  </p>
                                  {f.note && (
                                    <p className="mt-1 font-body text-xs italic text-rose-700">
                                      Note: {f.note}
                                    </p>
                                  )}
                                </div>

                                <span
                                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ring-1 ${statusCls}`}
                                >
                                  {status === 'verified' ? (
                                    <Check size={10} />
                                  ) : status === 'rejected' ? (
                                    <XCircle size={10} />
                                  ) : (
                                    <Clock size={10} />
                                  )}
                                  {status}
                                </span>

                                {f.url && (
                                  <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="View"
                                    className="shrink-0 rounded-lg p-1.5 text-navy-500 transition hover:bg-navy-50 hover:text-navy-900"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                )}

                                {status !== 'verified' && (
                                  <div className="flex shrink-0 items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyDoc(slot.id, f.id)}
                                      className="rounded-lg bg-emerald-600 px-3 py-1.5 font-body text-[11px] font-bold text-white transition hover:bg-emerald-700"
                                    >
                                      Verify
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setRejectTarget({
                                          docKey: slot.id,
                                          docId: f.id,
                                          fileName: f.name,
                                        })
                                      }
                                      className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-body text-[11px] font-bold text-rose-700 transition hover:bg-rose-50"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Statement */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">
              Statement of Need
            </h2>
            <div className="mt-4 whitespace-pre-line rounded-xl border border-navy-100 bg-cream/40 p-5 font-body text-sm leading-7 text-navy-700">
              {application.reason || 'No statement provided.'}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">
              Application Timeline
            </h2>
            <ol className="relative mt-5 space-y-6">
              <span className="pointer-events-none absolute left-[11px] top-2 bottom-2 w-px bg-navy-100" />
              {TIMELINE_STEPS.map((step, idx) => {
                const isPast = idx < currentStep;
                const isCurrent = idx === currentStep;
                const entry =
                  timeline.find((t) => t.status === step.id) ||
                  (step.id === 'decision'
                    ? timeline.find((t) =>
                        ['approved', 'waitlisted', 'declined'].includes(t.status)
                      )
                    : null);
                return (
                  <li key={step.id} className="relative flex gap-4">
                    <span
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                        isPast
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-navy-100 text-navy-400'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 size={14} />
                      ) : isCurrent ? (
                        <Clock size={13} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1 pb-1">
                      <p
                        className={`font-body text-sm font-bold ${
                          isPast || isCurrent ? 'text-navy-900' : 'text-navy-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 font-body text-xs leading-5 text-navy-500">
                        {entry?.note || step.description}
                      </p>
                      {entry?.at && (
                        <p className="mt-1 font-body text-[11px] text-navy-400">
                          {new Date(entry.at).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Staff notes */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-navy-900">
                Staff Notes
              </h2>
              <button
                type="button"
                onClick={() => setShowNoteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 font-body text-xs font-semibold text-navy-700 transition hover:border-emerald-400 hover:text-emerald-700"
              >
                <MessageSquarePlus size={13} />
                Add Note
              </button>
            </div>
            {notifications.filter((n) => n.type === 'note').length === 0 ? (
              <p className="mt-3 font-body text-sm text-navy-500">
                No staff notes yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {notifications
                  .filter((n) => n.type === 'note')
                  .map((n) => (
                    <li
                      key={n.id}
                      className="rounded-xl border border-navy-100 bg-cream/40 p-4"
                    >
                      <p className="font-body text-sm leading-6 text-navy-700">
                        {n.message}
                      </p>
                      <p className="mt-1 font-body text-[11px] text-navy-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        {/* ═══ Right column ═══ */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">Actions</h2>
            <p className="mt-1 font-body text-xs text-navy-500">
              Every action is logged on the timeline and sent as a notification.
            </p>

            {actions.length === 0 ? (
              <p className="mt-4 rounded-xl bg-cream/40 p-4 font-body text-sm text-navy-500">
                No actions available for this status.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const cls =
                    action.tone === 'success'
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:scale-[1.02]'
                      : action.tone === 'warning'
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : action.tone === 'danger'
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-navy-900 text-white hover:bg-navy-800';
                  return (
                    <button
                      key={action.label}
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (action.opensModal === 'support') {
                          setShowSupportModal(true);
                          return;
                        }
                        handleStatusChange(action.next, action.note);
                      }}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-body text-sm font-bold shadow-md transition-transform disabled:opacity-60 ${cls}`}
                    >
                      <Icon size={15} />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {application.support && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="font-display text-base font-bold text-emerald-900">
                Confirmed Support
              </h2>
              <p className="mt-2 font-body text-sm font-semibold text-emerald-800">
                {application.support.summary}
              </p>
              {application.support.notes && (
                <p className="mt-2 font-body text-xs leading-5 text-emerald-700">
                  {application.support.notes}
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-navy-100 bg-cream/40 p-5">
            <h2 className="font-display text-sm font-bold text-navy-900">Audit</h2>
            <dl className="mt-3 space-y-2 font-body text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-navy-500">Reference</dt>
                <dd className="font-mono font-semibold text-navy-900">
                  {application.reference}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-navy-500">Submitted</dt>
                <dd className="font-semibold text-navy-900">
                  {new Date(application.submittedAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-navy-500">Last updated</dt>
                <dd className="font-semibold text-navy-900">
                  {new Date(application.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-navy-500">Timeline entries</dt>
                <dd className="font-semibold text-navy-900">{timeline.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* ═══ Add note modal ═══ */}
      {showNoteModal && (
        <Modal onClose={() => setShowNoteModal(false)} title="Add Staff Note">
          <p className="font-body text-sm text-navy-600">
            This note is visible to the Foundation team only. The applicant will not see it.
          </p>
          <textarea
            rows={4}
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            placeholder="e.g. Called applicant — confirmed household income and school fees."
            className="mt-4 w-full resize-y rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNoteModal(false)}
              className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-navy-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || !actionNote.trim()}
              onClick={handleAddNote}
              className="rounded-xl bg-navy-900 px-5 py-2.5 font-body text-sm font-bold text-white disabled:opacity-60"
            >
              Add Note
            </button>
          </div>
        </Modal>
      )}

      {/* ═══ Confirm support modal ═══ */}
      {showSupportModal && (
        <Modal onClose={() => setShowSupportModal(false)} title="Confirm Support">
          <p className="font-body text-sm text-navy-600">
            Describe the support being confirmed. The applicant will see this in their portal.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block font-body text-sm font-bold text-navy-900">
                Support summary <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                value={supportSummary}
                onChange={(e) => setSupportSummary(e.target.value)}
                placeholder="e.g. Full tuition for the January 2027 intake"
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
            </div>
            <div>
              <label className="mb-2 block font-body text-sm font-bold text-navy-900">
                Additional notes
              </label>
              <textarea
                rows={3}
                value={supportNotes}
                onChange={(e) => setSupportNotes(e.target.value)}
                placeholder="Any further information the applicant should know."
                className="w-full resize-y rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSupportModal(false)}
              className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-navy-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || !supportSummary.trim()}
              onClick={handleConfirmSupport}
              className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-2.5 font-body text-sm font-bold text-white disabled:opacity-60"
            >
              Confirm Support
            </button>
          </div>
        </Modal>
      )}

      {/* ═══ Reject document modal ═══ */}
      {rejectTarget && (
        <Modal onClose={() => setRejectTarget(null)} title="Reject Document">
          <p className="font-body text-sm text-navy-600">
            The applicant will be notified and asked to re-upload.
          </p>
          <p className="mt-2 font-body text-xs font-semibold text-navy-900">
            File: {rejectTarget.fileName}
          </p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Photo is unclear — please re-upload a clearer copy."
            className="mt-4 w-full resize-y rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectTarget(null)}
              className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-navy-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!rejectReason.trim()}
              onClick={handleRejectDocConfirm}
              className="rounded-xl bg-rose-600 px-5 py-2.5 font-body text-sm font-bold text-white disabled:opacity-60"
            >
              Reject Document
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium-lg sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-navy-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-navy-700 hover:bg-navy-100"
          >
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}