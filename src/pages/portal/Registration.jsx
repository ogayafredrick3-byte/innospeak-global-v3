import { useEffect, useState } from 'react';
import { ClipboardList, XCircle } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getMyRegistrations, dropRegistration } from '../../lib/supabase/studentPortal';

export default function Registration() {
  const [state, setState] = useState({ loading: true, error: null, registrations: [] });
  const [dropping, setDropping] = useState(null);

  function load() {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getMyRegistrations()
      .then((registrations) => setState({ loading: false, error: null, registrations }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your registration.', registrations: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDrop(id) {
    setDropping(id);
    try {
      await dropRegistration(id);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not drop this unit.' }));
    } finally {
      setDropping(null);
    }
  }

  const registered = state.registrations.filter((r) => r.status === 'registered');
  const dropped = state.registrations.filter((r) => r.status !== 'registered');

  const columns = [
    { key: 'code', label: 'Unit Code', render: (r) => r.units?.code || '—' },
    { key: 'title', label: 'Unit Title', render: (r) => r.units?.title || '—' },
    { key: 'credit_hours', label: 'Credit Hours', render: (r) => r.units?.credit_hours ?? '—' },
    { key: 'semester', label: 'Semester', render: (r) => r.semesters?.name || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: '',
      render: (r) =>
        r.status === 'registered' ? (
          <button
            type="button"
            onClick={() => handleDrop(r.id)}
            disabled={dropping === r.id}
            className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
          >
            <XCircle size={14} />
            {dropping === r.id ? 'Dropping…' : 'Drop'}
          </button>
        ) : null,
    },
  ];

  return (
    <>
      <Seo title="Academic Registration" description="Manage your unit registration." path="/portal/registration" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Academic Registration</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Your registered program, units and current semester registration status.
        </p>
      </div>

      <div className="mt-6">
        {state.loading && <LoadingState />}
        {!state.loading && state.error && <ErrorState message={state.error} />}

        {!state.loading && !state.error && (
          <SectionCard title="Registered Units" description="Units you are currently enrolled in this semester.">
            {registered.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No active registrations"
                message="You have not registered any units for the current semester yet. Contact your department to add units."
              />
            ) : (
              <DataTable columns={columns} rows={registered} />
            )}

            {dropped.length > 0 && (
              <div className="mt-8">
                <h3 className="font-body text-sm font-semibold text-navy-700">Previously Dropped</h3>
                <div className="mt-3">
                  <DataTable columns={columns} rows={dropped} />
                </div>
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </>
  );
}
