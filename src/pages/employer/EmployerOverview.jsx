import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, BriefcaseBusiness, Inbox, Plus, RefreshCw } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState } from '../../components/portal/PortalStates.jsx';
import {
  listMyOrganisationOpportunities,
  listMyOrganisationApplications,
  getMyOrganisation,
} from '../../lib/supabase/organisations';

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
        <Icon size={17} />
      </span>
      <div>
        <p className="font-display text-lg font-bold leading-none text-navy-900">{value}</p>
        <p className="mt-0.5 font-body text-xs text-navy-500">{label}</p>
      </div>
    </div>
  );
}

export default function EmployerOverview() {
  const [state, setState] = useState({
    loading: true,
    error: false,
    org: null,
    opportunities: [],
    applications: [],
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));
    Promise.all([
      getMyOrganisation(),
      listMyOrganisationOpportunities(),
      listMyOrganisationApplications(),
    ])
      .then(([org, opportunities, applications]) => {
        if (!cancelled) {
          setState({ loading: false, error: false, org, opportunities, applications });
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[EmployerOverview] load failed:', err);
        if (!cancelled) setState({ loading: false, error: true, org: null, opportunities: [], applications: [] });
      });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const activeOpportunities = state.opportunities.filter((o) => o.published).length;
  const newApplications = state.applications.filter((a) => a.status === 'submitted').length;

  return (
    <>
      <Seo
        title="Employer Overview | InnoSpeak Global"
        description="Manage your organisation's opportunities and applications."
        path="/employer"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Employer Portal
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            {state.org?.name || 'Overview'}
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            Post opportunities, review applications and connect with emerging talent.
          </p>
        </div>
        <Link
          to="/employer/opportunities/new"
          className="btn-gold inline-flex shrink-0 items-center gap-2 text-sm"
        >
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
                Unable to load your dashboard right now
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
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatPill icon={BriefcaseBusiness} label="Opportunities" value={state.opportunities.length} />
            <StatPill icon={Award} label="Active" value={activeOpportunities} />
            <StatPill icon={Inbox} label="Applications" value={state.applications.length} />
            <StatPill icon={Inbox} label="New" value={newApplications} />
          </div>

          <SectionCard
            title="Recent Applications"
            description="Applications submitted to your opportunities."
            action={
              state.applications.length > 0 && (
                <Link
                  to="/employer/applications"
                  className="font-body text-sm font-bold text-gold-700 hover:text-gold-800"
                >
                  View all →
                </Link>
              )
            }
            className="mt-6"
          >
            {state.applications.length === 0 ? (
              <p className="font-body text-sm text-navy-500">
                No applications yet. Once you publish opportunities, applications will appear here.
              </p>
            ) : (
              <ul className="space-y-2">
                {state.applications.slice(0, 5).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-body text-sm font-semibold text-navy-900">
                        {a.profiles?.full_name || 'Applicant'}
                      </p>
                      <p className="truncate font-body text-xs text-navy-400">
                        {a.career_opportunities?.title || 'Opportunity'}
                      </p>
                    </div>
                    <span className="rounded-full bg-navy-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600">
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Your Opportunities"
            description="Everything your organisation has posted."
            action={
              state.opportunities.length > 0 && (
                <Link
                  to="/employer/opportunities"
                  className="font-body text-sm font-bold text-gold-700 hover:text-gold-800"
                >
                  Manage →
                </Link>
              )
            }
            className="mt-6"
          >
            {state.opportunities.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-body text-sm text-navy-500">
                  You haven&apos;t posted any opportunities yet.
                </p>
                <Link
                  to="/employer/opportunities/new"
                  className="btn-gold mt-4 inline-flex items-center gap-2 text-sm"
                >
                  <Plus size={15} aria-hidden="true" />
                  Post your first opportunity
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {state.opportunities.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <Link
                      to={`/employer/opportunities/${o.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 transition-colors hover:border-gold-300"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-body text-sm font-semibold text-navy-900">
                          {o.title}
                        </p>
                        <p className="font-body text-xs capitalize text-navy-400">
                          {o.opportunity_type}
                          {o.closing_date && ` · closes ${new Date(o.closing_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${
                          o.published
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-navy-50 text-navy-600'
                        }`}
                      >
                        {o.published ? 'Published' : 'Draft'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      )}
    </>
  );
}