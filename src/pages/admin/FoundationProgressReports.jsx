import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText, Plus, Trash2, X, Lock,
} from 'lucide-react';
import {
  getProgressReports,
  createProgressReport,
  deleteProgressReport,
} from '../../lib/data/progressReportStore.js';
import { getApplications } from '../../lib/data/foundationAppStore.js';
import { FOUNDATION_PROGRAMS } from '../../lib/data/foundationApplicationsData.js';

function initialsOf(name) {
  if (!name) return '—';
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getProgramLabel(id) {
  return FOUNDATION_PROGRAMS.find((p) => p.id === id)?.label || id;
}

export default function FoundationProgressReports() {
  const [reports, setReports] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    applicationId: '',
    title: '',
    body: '',
    visibleToSponsor: true,
  });
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    setReports(getProgressReports());
    setApplications(getApplications());
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  // Only applications that are approved/support_confirmed are eligible for reports
  const eligibleApps = useMemo(
    () =>
      applications.filter((a) =>
        ['approved', 'support_confirmed', 'completed'].includes(a.status)
      ),
    [applications]
  );

  function handleSave(e) {
    e.preventDefault();
    if (!form.applicationId) return setError('Select an application.');
    if (form.title.trim().length < 5) return setError('Title must be at least 5 characters.');
    if (form.body.trim().length < 40) return setError('Report must be at least 40 characters.');
    setError('');

    const app = applications.find((a) => a.id === form.applicationId);
    if (!app) return setError('Application not found.');

    createProgressReport({
      applicationId: app.id,
      programId: app.program,
      studentEmail: app.userEmail,
      studentName: app.userName,
      studentInitials: initialsOf(app.userName || app.userEmail),
      title: form.title.trim(),
      body: form.body.trim(),
      authorName: 'Foundation Team',
      authorRole: 'Program Operations',
      visibleToSponsor: form.visibleToSponsor,
    });

    setForm({ applicationId: '', title: '', body: '', visibleToSponsor: true });
    setShowModal(false);
    refresh();
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this report?')) return;
    deleteProgressReport(id);
    refresh();
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-emerald-700">
                Foundation
              </p>
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Progress Reports
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-navy-600">
            Write updates for funded learners. Learners see their own reports; sponsors
            see only the initials + program when visible-to-sponsor is on.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          disabled={eligibleApps.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} />
          Write Report
        </button>
      </header>

      {eligibleApps.length === 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50 px-5 py-4">
          <Lock size={18} className="mt-0.5 shrink-0 text-gold-700" />
          <div>
            <p className="font-body text-sm font-bold text-navy-900">
              No eligible applications
            </p>
            <p className="mt-1 font-body text-xs leading-5 text-navy-600">
              Approve an application first, then you can write a progress report for the learner.
            </p>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
          <FileText size={32} className="mx-auto text-navy-300" />
          <h3 className="mt-4 font-display text-lg font-bold text-navy-900">No reports yet</h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
            Write your first progress report to share with a funded learner and their sponsor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-display text-sm font-bold text-emerald-700">
                    {r.studentInitials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {getProgramLabel(r.programId)}
                      </span>
                      {r.visibleToSponsor ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          Visible to sponsor
                        </span>
                      ) : (
                        <span className="rounded-full bg-navy-100 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600">
                          Learner only
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-navy-900">
                      {r.title}
                    </h3>
                    <p className="mt-0.5 font-body text-[11px] text-navy-400">
                      {r.studentName || r.studentEmail} ·{' '}
                      {new Date(r.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="rounded-lg p-2 text-navy-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="mt-4 whitespace-pre-line font-body text-sm leading-7 text-navy-700">
                {r.body}
              </p>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="Write Progress Report">
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Application *" id="applicationId">
              <select
                id="applicationId"
                value={form.applicationId}
                onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select an approved application…</option>
                {eligibleApps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.reference} — {a.userName || a.userEmail}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Report title *" id="title">
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Term 2 progress — strong improvement in mathematics"
                className="w-full rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
            </Field>

            <Field label="Report body *" id="body">
              <textarea
                rows={6}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Describe progress, achievements, challenges and next steps. Avoid identifying details such as the learner's full name, address or specific school if visible-to-sponsor is on."
                className="w-full resize-y rounded-xl border border-navy-100 px-4 py-3 font-body text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
              />
            </Field>

            <label className="flex items-start gap-3 rounded-xl border border-navy-100 bg-cream/40 p-4">
              <input
                type="checkbox"
                checked={form.visibleToSponsor}
                onChange={(e) => setForm({ ...form, visibleToSponsor: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-navy-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-body text-sm leading-6 text-navy-700">
                Share this report with the sponsor (shows only initials and program — never
                full name or contact details).
              </span>
            </label>

            {error && <p className="font-body text-xs font-semibold text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 border-t border-navy-100 pt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-navy-200 bg-white px-4 py-2.5 font-body text-sm font-bold text-navy-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-2.5 font-body text-sm font-bold text-white"
              >
                Publish Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-body text-sm font-bold text-navy-900">{label}</label>
      {children}
    </div>
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-navy-700 hover:bg-navy-100"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}