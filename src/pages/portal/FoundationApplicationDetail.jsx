import { useEffect, useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, FileText, Bell, CheckCircle2, Circle, Clock,
  Upload, Trash2, AlertCircle, Check, X, ExternalLink,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  TIMELINE_STEPS,
  getProgramLabel,
  getStatusLabel,
  getCurrentStepIndex,
} from '../../lib/data/foundationApplicationsData.js';
import {
  getRequiredDocuments,
  missingRequiredCount,
} from '../../lib/data/foundationDocumentsData.js';
import {
  getApplication,
  markNotificationsRead,
  addDocument,
  removeDocument,
} from '../../lib/data/foundationAppStore.js';

const MAX_FILE_MB = 8;

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DocumentSlot({ slot, files, onUpload, onRemove }) {
  const inputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');

  function handleFiles(e) {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setUploadError('');

    for (const file of list) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setUploadError(`File must be under ${MAX_FILE_MB}MB.`);
        continue;
      }
      onUpload({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  const hasFiles = files && files.length > 0;

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        hasFiles ? 'border-emerald-200 bg-emerald-50/40' : 'border-navy-100 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-bold text-navy-900">
            {slot.label}
            {slot.required && <span className="ml-1 text-emerald-600">*</span>}
          </p>
          <p className="mt-1 font-body text-xs leading-5 text-navy-500">
            {slot.description}
          </p>
        </div>
        {hasFiles && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <Check size={11} />
            Uploaded
          </span>
        )}
      </div>

      {/* Uploaded files list */}
      {hasFiles && (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-3 py-2.5"
            >
              <FileText size={16} className="shrink-0 text-navy-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-semibold text-navy-900">
                  {f.name}
                </p>
                <p className="mt-0.5 flex items-center gap-2 font-body text-[11px] text-navy-400">
                  <span>{formatSize(f.size)}</span>
                  {f.status === 'verified' && (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <Check size={10} />
                      Verified by staff
                    </span>
                  )}
                  {f.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <X size={10} />
                      Rejected
                      {f.note && <span className="italic">· {f.note}</span>}
                    </span>
                  )}
                </p>
              </div>
              {f.url && (
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View file"
                  className="shrink-0 rounded-lg p-1.5 text-navy-500 transition hover:bg-navy-50 hover:text-navy-900"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                aria-label="Remove file"
                className="shrink-0 rounded-lg p-1.5 text-navy-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 font-body text-sm font-semibold transition ${
          hasFiles
            ? 'border-navy-200 bg-white text-navy-600 hover:border-emerald-400 hover:text-emerald-700'
            : 'border-navy-200 bg-white text-navy-600 hover:border-emerald-400 hover:text-emerald-700'
        }`}
      >
        <Upload size={15} />
        {hasFiles ? 'Add another file' : 'Choose file'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={slot.accept}
        onChange={handleFiles}
        className="hidden"
      />

      {uploadError && (
        <p className="mt-2 flex items-center gap-1.5 font-body text-xs font-semibold text-red-600">
          <AlertCircle size={12} />
          {uploadError}
        </p>
      )}
    </div>
  );
}

export default function FoundationApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [notFound, setNotFound] = useState(false);

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
    markNotificationsRead(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound) return <Navigate to="/portal/foundation" replace />;
  if (!application) return null;

  const currentStep = getCurrentStepIndex(application.status);
  const notifications = application.notifications || [];
  const requiredSlots = getRequiredDocuments(application.program);
  const documents = application.documents || {};
  const missing = missingRequiredCount(application);

  return (
    <>
      <Seo
        title={`Application ${application.reference}`}
        description="Foundation application detail and progress."
        path={`/portal/foundation/${id}`}
      />

      <Link
        to="/portal/foundation"
        className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-navy-500 transition-colors hover:text-emerald-700"
      >
        <ArrowLeft size={14} />
        All Applications
      </Link>

      <div className="mt-4">
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Foundation Application
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            {getProgramLabel(application.program)}
          </h1>
          <StatusBadge status={getStatusLabel(application.status)} />
        </div>
        <p className="mt-2 font-mono text-sm font-bold text-emerald-700">
          {application.reference}
        </p>
        <p className="mt-1 font-body text-sm text-navy-500">
          Submitted{' '}
          {new Date(application.submittedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Documents alert */}
      {missing > 0 && application.status === 'submitted' && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gold-300 bg-gold-50 px-5 py-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-gold-700" />
          <div>
            <p className="font-body text-sm font-bold text-navy-900">
              {missing} required document{missing > 1 ? 's' : ''} pending
            </p>
            <p className="mt-1 font-body text-xs leading-5 text-navy-600">
              Upload the documents below so our Foundation team can begin reviewing your application.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents */}
          {requiredSlots.length > 0 && (
            <SectionCard
              title="Required Documents"
              description="Upload clear, readable copies. Files can be removed or re-uploaded any time before review."
            >
              <div className="space-y-4">
                {requiredSlots.map((slot) => (
                  <DocumentSlot
                    key={slot.id}
                    slot={slot}
                    files={documents[slot.id] || []}
                    onUpload={(fileData) => {
                      addDocument(application.id, slot.id, fileData);
                      refresh();
                    }}
                    onRemove={(docId) => {
                      removeDocument(application.id, slot.id, docId);
                      refresh();
                    }}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {/* Timeline */}
          <SectionCard title="Application Progress">
            <ol className="relative space-y-6">
              <span className="pointer-events-none absolute left-[11px] top-2 bottom-2 w-px bg-navy-100" />

              {TIMELINE_STEPS.map((step, idx) => {
                const isPast = idx < currentStep;
                const isCurrent = idx === currentStep;
                const entry =
                  (application.timeline || []).find((t) => t.status === step.id) ||
                  (step.id === 'decision'
                    ? (application.timeline || []).find((t) =>
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
                            ? 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50'
                            : 'bg-navy-100 text-navy-400'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 size={14} />
                      ) : isCurrent ? (
                        <Clock size={13} />
                      ) : (
                        <Circle size={10} />
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
                          {new Date(entry.at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </SectionCard>

          {/* Statement */}
          <SectionCard title="What You Applied For">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                  Programme
                </dt>
                <dd className="mt-1 font-body text-sm font-semibold text-navy-900">
                  {getProgramLabel(application.program)}
                </dd>
              </div>
              <div>
                <dt className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                  Reference
                </dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-navy-900">
                  {application.reference}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                  Your Statement
                </dt>
                <dd className="mt-1 whitespace-pre-line font-body text-sm leading-6 text-navy-700">
                  {application.reason || '—'}
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <SectionCard title="Updates" description="Messages from the Foundation team.">
            {notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No updates yet"
                message="You'll see messages here as your application progresses."
              />
            ) : (
              <ul className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 rounded-xl border border-navy-100 bg-cream/40 px-4 py-3"
                  >
                    <Bell size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-body text-sm leading-6 text-navy-700">
                        {n.message}
                      </p>
                      <p className="mt-1 font-body text-[11px] text-navy-400">
                        {new Date(n.createdAt).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {application.support && (
            <SectionCard title="Approved Support" description="What the Foundation has confirmed.">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Heart size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-body text-sm font-bold text-emerald-900">
                      {application.support.summary}
                    </p>
                    {application.support.notes && (
                      <p className="mt-1 font-body text-xs leading-5 text-emerald-800">
                        {application.support.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          <div className="rounded-2xl border border-navy-100 bg-cream/50 p-5">
            <p className="font-display text-sm font-bold text-navy-900">
              Need help?
            </p>
            <p className="mt-1 font-body text-xs leading-5 text-navy-500">
              Contact the Foundation team through your{' '}
              <Link
                to="/portal/support"
                className="font-semibold text-emerald-700 hover:underline"
              >
                Support
              </Link>{' '}
              page.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}