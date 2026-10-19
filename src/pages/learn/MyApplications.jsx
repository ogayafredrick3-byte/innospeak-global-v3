import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  ClipboardList,
  RefreshCw,
  X,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../lib/motion/presets';
import {
  listMyApplications,
  withdrawApplication,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
} from '../../lib/supabase/career';

const container = staggerContainer(0.06, 0.05);

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

export default function MyApplications() {
  const [state, setState] = useState({ loading: true, error: false, data: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));
    listMyApplications()
      .then((rows) => {
        if (!cancelled) setState({ loading: false, error: false, data: rows });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[MyApplications] load failed:', err);
        if (!cancelled) setState({ loading: false, error: true, data: [] });
      });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const stats = useMemo(() => {
    const active = state.data.filter((a) =>
      ['submitted', 'reviewing', 'shortlisted', 'offered'].includes(a.status)
    ).length;
    const closed = state.data.filter((a) =>
      ['rejected', 'withdrawn'].includes(a.status)
    ).length;
    return { total: state.data.length, active, closed };
  }, [state.data]);

  async function handleWithdraw(id) {
    if (!window.confirm('Withdraw this application? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await withdrawApplication(id);
      setReloadKey((k) => k + 1);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[MyApplications] withdraw failed:', err);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Seo
        title="My Applications"
        description="Track your opportunity applications."
        path="/learn/applications"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Career
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            My Applications
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            Track the opportunities you&apos;ve applied for and their current status.
          </p>
        </div>
        <Link
          to="/career-hub/opportunities"
          className="btn-outline inline-flex flex-shrink-0 items-center gap-2 text-sm"
        >
          <BriefcaseBusiness size={15} aria-hidden="true" />
          Browse Opportunities
        </Link>
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
                Unable to load your applications right now
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
          {state.data.length === 0 ? (
            <SectionCard className="mt-6">
              <EmptyState
                icon={ClipboardList}
                title="No applications yet"
                message="Browse opportunities and apply to get started. Your applications will appear here."
                action={
                  <Link to="/career-hub/opportunities" className="btn-gold text-sm">
                    Browse Opportunities
                  </Link>
                }
              />
            </SectionCard>
          ) : (
            <>
              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: stats.total },
                  { label: 'Active', value: stats.active },
                  { label: 'Closed', value: stats.closed },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-navy-100 bg-white px-4 py-3 text-center shadow-sm"
                  >
                    <p className="font-display text-xl font-bold text-navy-900">{s.value}</p>
                    <p className="mt-0.5 font-body text-xs text-navy-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* List */}
              <motion.ul
                variants={container}
                initial="hidden"
                animate="visible"
                className="mt-6 space-y-3"
              >
                {state.data.map((a) => {
                  const opp = a.career_opportunities || {};
                  const canWithdraw = ['submitted', 'reviewing'].includes(a.status);
                  return (
                    <motion.li key={a.id} variants={fadeUpItem}>
                      <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-premium">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/career-hub/opportunities/${opp.id}`}
                              className="font-display text-base font-bold text-navy-900 hover:text-gold-700"
                            >
                              {opp.title || 'Opportunity'}
                            </Link>
                            {opp.organisation && (
                              <p className="mt-0.5 font-body text-sm font-semibold text-navy-500">
                                {opp.organisation}
                              </p>
                            )}
                          </div>
                          <StatusChip status={a.status} />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-navy-100 pt-4 font-body text-xs text-navy-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={12} aria-hidden="true" />
                            Applied {new Date(a.created_at).toLocaleDateString()}
                          </span>
                          {opp.opportunity_type && (
                            <span className="inline-flex items-center gap-1.5 capitalize">
                              <BriefcaseBusiness size={12} aria-hidden="true" />
                              {opp.opportunity_type}
                            </span>
                          )}
                          {a.review_notes && (
                            <span className="text-navy-600">
                              <span className="font-semibold">Note:</span> {a.review_notes}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            to={`/career-hub/opportunities/${opp.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-navy-100 bg-white px-4 py-2 font-body text-xs font-bold text-navy-700 transition hover:border-gold-300 hover:text-gold-700"
                          >
                            View Opportunity
                            <ArrowRight size={12} aria-hidden="true" />
                          </Link>
                          {canWithdraw && (
                            <button
                              type="button"
                              onClick={() => handleWithdraw(a.id)}
                              disabled={busyId === a.id}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 font-body text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                            >
                              <X size={12} aria-hidden="true" />
                              {busyId === a.id ? 'Withdrawing…' : 'Withdraw'}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </>
          )}
        </>
      )}
    </>
  );
}