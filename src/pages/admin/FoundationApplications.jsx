import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Search, Filter, Inbox, CheckCircle2, XCircle, Clock, FileText, ChevronRight,
} from 'lucide-react';
import { getApplications } from '../../lib/data/foundationAppStore.js';
import {
  APPLICATION_STATUSES,
  FOUNDATION_PROGRAMS,
  getProgramLabel,
  getStatusLabel,
} from '../../lib/data/foundationApplicationsData.js';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'submitted', label: 'New' },
  { id: 'under_review', label: 'In Review' },
  { id: 'verification', label: 'Verification' },
  { id: 'approved', label: 'Approved' },
  { id: 'declined', label: 'Declined' },
  { id: 'completed', label: 'Completed' },
];

// Status → tone classes
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
  draft: 'bg-navy-50 text-navy-500 ring-navy-100',
};

function StatusChip({ status }) {
  const cls = STATUS_TONE[status] || STATUS_TONE.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ring-1 ${cls}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export default function FoundationApplications() {
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('all');

  const refresh = useCallback(() => {
    setApplications(getApplications());
  }, []);

  useEffect(() => {
    refresh();
    // Poll for changes (until Supabase realtime is wired)
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  const counts = useMemo(() => {
    const map = { all: applications.length };
    APPLICATION_STATUSES.forEach((s) => {
      map[s.id] = applications.filter((a) => a.status === s.id).length;
    });
    // Group for tabs
    map.submitted = map.submitted || 0;
    map.in_review = (map.under_review || 0) + (map.verification || 0);
    return map;
  }, [applications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      // Tab filter
      if (tab !== 'all') {
        if (tab === 'submitted' && a.status !== 'submitted') return false;
        if (tab === 'under_review' && !['under_review', 'verification'].includes(a.status)) return false;
        if (tab === 'verification' && a.status !== 'verification') return false;
        if (tab === 'approved' && !['approved', 'support_confirmed'].includes(a.status)) return false;
        if (tab === 'declined' && a.status !== 'declined') return false;
        if (tab === 'completed' && a.status !== 'completed') return false;
      }
      // Program filter
      if (programFilter !== 'all' && a.program !== programFilter) return false;
      // Search
      if (q) {
        const hay = `${a.reference} ${a.userName || ''} ${a.userEmail || ''} ${a.reason}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [applications, tab, query, programFilter]);

  return (
    <div>
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <Heart size={20} />
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-emerald-700">
                Foundation
              </p>
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Scholarship Applications
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-navy-600">
            Review, verify and decide on Foundation applications submitted by learners.
          </p>
        </div>
      </header>

      {/* Stat tiles */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Inbox}
          label="Total"
          value={counts.all}
          tone="navy"
        />
        <StatTile
          icon={Clock}
          label="Awaiting Review"
          value={counts.submitted}
          tone="amber"
        />
        <StatTile
          icon={CheckCircle2}
          label="Approved"
          value={counts.approved}
          tone="emerald"
        />
        <StatTile
          icon={XCircle}
          label="Declined"
          value={counts.declined}
          tone="rose"
        />
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => {
          const count =
            t.id === 'all'
              ? counts.all
              : t.id === 'under_review'
                ? counts.in_review
                : counts[t.id] || 0;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold transition ${
                active
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                  : 'border-navy-100 bg-white text-navy-700 hover:border-emerald-300'
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold ${
                  active ? 'bg-white/25' : 'bg-navy-100 text-navy-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference, name, email or statement…"
            className="w-full rounded-2xl border border-navy-100 bg-white py-3 pl-11 pr-4 font-body text-sm outline-none transition placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
        </div>
        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="rounded-2xl border border-navy-100 bg-white px-4 py-3 font-body text-sm font-semibold text-navy-700 outline-none focus:border-emerald-500"
        >
          <option value="all">All programmes</option>
          {FOUNDATION_PROGRAMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <FileText size={24} className="text-emerald-600" />
          </div>
          <h3 className="mt-5 font-display text-lg font-bold text-navy-900">
            No applications found
          </h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
            {applications.length === 0
              ? 'Applications submitted by learners will appear here.'
              : 'Try changing the filters above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Link
              key={app.id}
              to={`/admin/foundation/applications/${app.id}`}
              className="group flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-premium sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {app.reference}
                  </span>
                  <StatusChip status={app.status} />
                  <span className="rounded-full bg-navy-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600">
                    {getProgramLabel(app.program)}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-navy-900">
                  {app.userName || app.userEmail || 'Anonymous applicant'}
                </h3>
                <p className="mt-1 line-clamp-1 font-body text-xs text-navy-500">
                  {app.reason || 'No statement provided.'}
                </p>
                <p className="mt-2 font-body text-[11px] text-navy-400">
                  Submitted{' '}
                  {new Date(app.submittedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 font-body text-sm font-bold text-navy-900 transition-colors group-hover:text-emerald-700">
                Review
                <ChevronRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, tone = 'navy' }) {
  const tones = {
    navy: 'bg-navy-50 text-navy-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 font-body text-[11px] font-bold uppercase tracking-wider text-navy-500">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-navy-900">{value}</p>
    </div>
  );
}