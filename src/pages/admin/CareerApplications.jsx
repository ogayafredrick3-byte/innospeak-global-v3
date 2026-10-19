import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Filter,
  Mail,
  Phone,
  RefreshCw,
  User,
  X,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  listAllApplications,
  updateApplicationStatus,
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
} from '../../lib/supabase/career';

const TONE_CLASSES = {
  neutral:  'bg-navy-50 text-navy-600 ring-navy-100',
  pending:  'bg-amber-50 text-amber-700 ring-amber-100',
  positive: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  negative: 'bg-rose-50 text-rose-700 ring-rose-100',
};

function StatusChip({ status }) {
  const tone = APPLICATION_STATUS_TONES[status] || 'neutral';
  const label = APPLICATION_STATUS_LABELS[status] || status;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ring-1 ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

function ApplicationRow({ application: a, onUpdate, busy }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(a.review_notes || '');
  const [status, setStatus] = useState(a.status);

  const opp = a.career_opportunities || {};
  const student = a.profiles || {};

  async function handleSave() {
    await onUpdate(a.id, status, notes);
    setOpen(false);
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/career-hub/opportunities/${opp.id}`}
            className="font-display text-base font-bold text-navy-900 hover:text-gold-700"
          >
            {opp.title || 'Opportunity'}
          </Link>
          <p className="mt-0.5 font-body text-sm text-navy-500">
            {opp.organisation || '—'}
            {opp.opportunity_type && <span className="text-navy-400"> · {opp.opportunity_type}</span>}
          </p>
        </div>
        <StatusChip status={a.status} />
      </div>

      {/* Applicant block */}
      <div className="mt-4 grid gap-3 rounded-xl bg-cream p-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 font-body text-sm">
          <User size={14} className="flex-shrink-0 text-gold-600" aria-hidden="true" />
          <span className="font-semibold text-navy-900">
            {student.full_name || 'Unknown applicant'}
          </span>
        </div>
        {student.email && (
          <div className="flex items-center gap-2 font-body text-sm">
            <Mail size={14} className="flex-shrink-0 text-gold-600" aria-hidden="true" />
            <a href={`mailto:${student.email}`} className="text-navy-700 hover:text-gold-700">
              {student.email}
            </a>
          </div>
        )}
        {a.phone && (
          <div className="flex items-center gap-2 font-body text-sm">
            <Phone size={14} className="flex-shrink-0 text-gold-600" aria-hidden="true" />
            <span className="text-navy-700">{a.phone}</span>
          </div>
        )}
        <div className="font-body text-xs text-navy-400">
          Applied {new Date(a.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Message */}
      {a.message && (
        <div className="mt-3 rounded-xl border border-navy-100 bg-white p-4">
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
            Applicant message
          </p>
          <p className="mt-1.5 whitespace-pre-wrap font-body text-sm leading-6 text-navy-700">
            {a.message}
          </p>
        </div>
      )}

      {/* Links */}
      {(a.portfolio_url || a.resume_url) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {a.portfolio_url && (
            <a
              href={a.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-100 bg-white px-3 py-1.5 font-body text-xs font-semibold text-navy-700 hover:border-gold-300"
            >
              Portfolio
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
          {a.resume_url && (
            <a
              href={a.resume_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy-100 bg-white px-3 py-1.5 font-body text-xs font-semibold text-navy-700 hover:border-gold-300"
            >
              Resume
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      {/* Review toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 inline-flex items-center gap-1.5 font-body text-xs font-bold text-gold-700 hover:text-gold-800"
      >
        {open ? 'Hide review' : 'Review application'}
        <ArrowRight size={11} className={`transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-navy-100 pt-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-navy-100 bg-white px-3 py-2 font-body text-sm text-navy-700 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {APPLICATION_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
              Internal notes
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes visible to the applicant…"
              className="w-full rounded-xl border border-navy-100 bg-white px-3 py-2 font-body text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60"
            >
              <CheckCircle2 size={14} aria-hidden="true" />
              {busy ? 'Saving…' : 'Save Update'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-4 py-2 font-body text-sm font-semibold text-navy-700 hover:border-gold-300"
            >
              <X size={14} aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CareerApplications() {
  const [state, setState] = useState({ loading: true, error: false, data: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));
    listAllApplications()
      .then((rows) => {
        if (!cancelled) setState({ loading: false, error: false, data: rows });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[CareerApplications] load failed:', err);
        if (!cancelled) setState({ loading: false, error: true, data: [] });
      });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const counts = useMemo(() => {
    const map = { all: state.data.length };
    APPLICATION_STATUSES.forEach((s) => {
      map[s] = state.data.filter((a) => a.status === s).length;
    });
    return map;
  }, [state.data]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return state.data;
    return state.data.filter((a) => a.status === statusFilter);
  }, [state.data, statusFilter]);

  async function handleUpdate(id, status, notes) {
    setBusyId(id);
    try {
      await updateApplicationStatus(id, status, notes);
      setReloadKey((k) => k + 1);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[CareerApplications] update failed:', err);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Seo
        title="Career Applications"
        description="Review and manage opportunity applications."
        path="/admin/career-applications"
      />

      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="page-title">Career Applications</h1>
        <p className="page-copy">
          Review, shortlist and respond to applications submitted through Career Hub.
        </p>
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
                Unable to load applications right now
              </p>
              <p className="mt-1 font-body text-sm text-navy-500">Please try again shortly.</p>
            </div>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="btn-outline inline-flex items-center gap-2 text-sm"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Retry
            </button>
          </div>
        </SectionCard>
      )}

      {!state.loading && !state.error && (
        <>
          {/* Filter pills */}
          {state.data.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-wider text-navy-400">
                <Filter size={11} aria-hidden="true" />
                Filter
              </span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition ${
                  statusFilter === 'all'
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-navy-100 bg-white text-navy-700 hover:border-gold-300'
                }`}
              >
                All <span className="text-[10px] opacity-70">{counts.all}</span>
              </button>
              {APPLICATION_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  disabled={counts[s] === 0}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition disabled:opacity-40 ${
                    statusFilter === s
                      ? 'border-navy-900 bg-navy-900 text-white'
                      : 'border-navy-100 bg-white text-navy-700 hover:border-gold-300'
                  }`}
                >
                  {APPLICATION_STATUS_LABELS[s]}
                  <span className="text-[10px] opacity-70">{counts[s]}</span>
                </button>
              ))}
            </div>
          )}

          {/* List */}
          {state.data.length === 0 ? (
            <SectionCard className="mt-6">
              <EmptyState
                icon={CheckCircle2}
                title="No applications yet"
                message="Applications submitted through Career Hub will appear here."
              />
            </SectionCard>
          ) : filtered.length === 0 ? (
            <SectionCard className="mt-6">
              <EmptyState
                icon={Filter}
                title="No applications match this filter"
                message="Try a different status filter."
              />
            </SectionCard>
          ) : (
            <div className="mt-6 space-y-4">
              {filtered.map((a) => (
                <ApplicationRow
                  key={a.id}
                  application={a}
                  onUpdate={handleUpdate}
                  busy={busyId === a.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}