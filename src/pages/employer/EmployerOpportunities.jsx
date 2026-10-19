import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  listMyOrganisationOpportunities,
  deleteMyOrganisationOpportunity,
} from '../../lib/supabase/organisations';

export default function EmployerOpportunities() {
  const [state, setState] = useState({ loading: true, error: false, data: [] });
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));
    listMyOrganisationOpportunities()
      .then((rows) => {
        if (!cancelled) setState({ loading: false, error: false, data: rows });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[EmployerOpportunities] load failed:', err);
        if (!cancelled) setState({ loading: false, error: true, data: [] });
      });
    return () => { cancelled = true; };
  }, [reloadKey]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this opportunity? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await deleteMyOrganisationOpportunity(id);
      setReloadKey((k) => k + 1);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[EmployerOpportunities] delete failed:', err);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Seo
        title="Our Opportunities | Employer Portal"
        description="Manage your organisation's opportunities."
        path="/employer/opportunities"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Employer Portal
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            Our Opportunities
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            Publish and manage everything your organisation offers to learners.
          </p>
        </div>
        <Link to="/employer/opportunities/new" className="btn-gold inline-flex shrink-0 items-center gap-2 text-sm">
          <Plus size={15} aria-hidden="true" />
          Post Opportunity
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
                Unable to load your opportunities
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

      {!state.loading && !state.error && state.data.length === 0 && (
        <SectionCard className="mt-6">
          <EmptyState
            icon={BriefcaseBusiness}
            title="No opportunities yet"
            message="Post your first opportunity to start receiving applications from InnoSpeak learners."
            action={
              <Link to="/employer/opportunities/new" className="btn-gold text-sm">
                Post Opportunity
              </Link>
            }
          />
        </SectionCard>
      )}

      {!state.loading && !state.error && state.data.length > 0 && (
        <div className="mt-6 space-y-3">
          {state.data.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/employer/opportunities/${o.id}`}
                    className="font-display text-base font-bold text-navy-900 hover:text-gold-700"
                  >
                    {o.title}
                  </Link>
                  <p className="mt-1 font-body text-xs capitalize text-navy-400">
                    {o.opportunity_type}
                    {o.mode && ` · ${o.mode}`}
                    {o.location && ` · ${o.location}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${
                      o.published
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-navy-50 text-navy-600'
                    }`}
                  >
                    {o.published ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    to={`/employer/opportunities/${o.id}`}
                    aria-label="Edit opportunity"
                    className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-navy-50 hover:text-gold-700"
                  >
                    <Edit3 size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(o.id)}
                    disabled={busyId === o.id}
                    aria-label="Delete opportunity"
                    className="rounded-lg p-2 text-navy-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {o.description && (
                <p className="mt-3 line-clamp-2 font-body text-sm text-navy-500">
                  {o.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}