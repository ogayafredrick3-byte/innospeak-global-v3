import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatCard from '../../components/portal/StatCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getGraduationStatus, applyForGraduation } from '../../lib/supabase/studentPortal';

export default function Graduation() {
  const [state, setState] = useState({ loading: true, error: null, application: null });
  const [applying, setApplying] = useState(false);

  function load() {
    getGraduationStatus()
      .then((application) => setState({ loading: false, error: null, application }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your graduation status.', application: null }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApply() {
    setApplying(true);
    try {
      await applyForGraduation();
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not submit your graduation application.' }));
    } finally {
      setApplying(false);
    }
  }

  const app = state.application;

  return (
    <>
      <Seo title="Graduation" description="Check your graduation eligibility, clearance and ceremony details." path="/portal/graduation" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Graduation</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Your eligibility, clearance status and graduation application.
        </p>
      </div>

      <div className="mt-6">
        {state.loading && <LoadingState />}
        {!state.loading && state.error && <ErrorState message={state.error} />}

        {!state.loading && !state.error && !app && (
          <SectionCard title="Graduation Status">
            <EmptyState
              icon={GraduationCap}
              title="No graduation application on file"
              message="Once you are eligible, you can submit your graduation application here."
              action={
                <button type="button" onClick={handleApply} disabled={applying} className="btn-gold disabled:opacity-60">
                  {applying ? 'Submitting…' : 'Apply for Graduation'}
                </button>
              }
            />
          </SectionCard>
        )}

        {!state.loading && !state.error && app && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Eligibility" value={<StatusBadge status={app.status} />} />
              <StatCard label="Clearance" value={<StatusBadge status={app.clearance_status} />} />
              <StatCard label="Graduation Fee" value={app.fee_paid ? 'Paid' : 'Pending'} />
            </div>

            <div className="mt-6">
              <SectionCard title="Ceremony Information">
                {app.ceremony_date ? (
                  <p className="font-body text-sm text-navy-700">
                    Your graduation ceremony is scheduled for{' '}
                    <strong>{new Date(app.ceremony_date).toLocaleDateString()}</strong>.
                  </p>
                ) : (
                  <p className="font-body text-sm text-navy-500">Ceremony details will be published once confirmed.</p>
                )}
              </SectionCard>
            </div>
          </>
        )}
      </div>
    </>
  );
}
