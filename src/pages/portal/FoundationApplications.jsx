import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Plus, ChevronRight, FileText, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatCard from '../../components/portal/StatCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { EmptyState } from '../../components/portal/PortalStates.jsx';
import { useAuth } from '../../context/AuthContext';
import {
  FOUNDATION_PROGRAMS,
  getProgramLabel,
  getStatusLabel,
} from '../../lib/data/foundationApplicationsData.js';
import {
  getApplications,
  createApplication,
  countByStatus,
} from '../../lib/data/foundationAppStore.js';

export default function FoundationApplications() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [program, setProgram] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(null);

  const email = user?.email || profile?.email || null;

  function refresh() {
    setApplications(getApplications(email));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const counts = useMemo(() => countByStatus(email), [email, applications]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!program) return setSubmitError('Please choose a programme.');
    if (reason.trim().length < 30) return setSubmitError('Please describe your situation in at least 30 characters.');
    setSubmitError('');
    setSubmitting(true);

    const app = createApplication({
      program,
      reason,
      userEmail: email,
      userName: profile?.full_name || null,
    });

    setJustSubmitted(app);
    setProgram('');
    setReason('');
    setSubmitting(false);
    setFormOpen(false);
    refresh();
  }

  return (
    <>
      <Seo
        title="Foundation Applications"
        description="Apply for and track your InnoSpeak Global Foundation support."
        path="/portal/foundation"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Student Portal
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            Foundation Applications
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-navy-500">
            Apply for Foundation support and follow the progress of every application
            you submit.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
        >
          <Plus size={16} />
          Start Application
        </button>
      </div>

      {justSubmitted && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-body text-sm font-bold text-emerald-900">
              Application submitted — reference {justSubmitted.reference}
            </p>
            <p className="mt-1 font-body text-xs leading-5 text-emerald-800">
              Foundation staff will begin reviewing your application. You will be notified at each stage.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total Applications" value={counts.total} />
        <StatCard icon={Clock} label="In Progress" value={counts.inProgress} />
        <StatCard icon={CheckCircle2} label="Approved" value={counts.approved} />
        <StatCard icon={Heart} label="Completed" value={counts.completed} />
      </div>

      {/* Inline start form */}
      {formOpen && (
        <div className="mt-6">
          <SectionCard title="Start a New Application">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Which programme are you applying for?"
                  name="program"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  required
                  placeholder="Select a programme…"
                  options={FOUNDATION_PROGRAMS.map((p) => ({
                    value: p.id,
                    label: p.label,
                  }))}
                />

                <div className="sm:col-span-2">
                  <label
                    htmlFor="foundation-reason"
                    className="mb-2 block font-body text-sm font-bold tracking-wide text-navy-900"
                  >
                    Tell us about your situation
                    <span className="ml-1 text-emerald-600">*</span>
                  </label>
                  <textarea
                    id="foundation-reason"
                    rows={5}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe why you need Foundation support and what you hope to achieve."
                    className="w-full resize-y rounded-2xl border border-navy-100 bg-white px-5 py-4 font-body text-sm text-navy-900 shadow-sm outline-none transition placeholder:text-navy-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                  />
                  <p className="mt-1 font-body text-xs text-navy-400">
                    {reason.length} / 1000 characters
                  </p>
                </div>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                  <p className="font-body text-sm font-semibold text-red-600">{submitError}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-navy-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-5 py-2.5 font-body text-sm font-bold text-navy-900 transition-colors hover:border-navy-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-2.5 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        <SectionCard
          title="Your Applications"
          description="Every Foundation application you have submitted."
        >
          {applications.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No applications yet"
              message="Start your first Foundation application using the button above."
            />
          ) : (
            <ul className="space-y-3">
              {applications.map((app) => (
                <li key={app.id}>
                  <Link
                    to={`/portal/foundation/${app.id}`}
                    className="group flex flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-premium sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          {app.reference}
                        </span>
                        <StatusBadge status={getStatusLabel(app.status)} />
                      </div>
                      <p className="mt-2 font-display text-base font-bold text-navy-900">
                        {getProgramLabel(app.program)}
                      </p>
                      <p className="mt-1 font-body text-xs text-navy-500">
                        Submitted{' '}
                        {new Date(app.submittedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 font-body text-sm font-bold text-navy-900 transition-colors group-hover:text-emerald-700">
                      View
                      <ChevronRight size={16} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}