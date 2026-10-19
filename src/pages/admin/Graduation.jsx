import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listAllGraduationApplications, updateGraduationApplication } from '../../lib/supabase/admin';

const STATUS_OPTIONS = ['not_eligible', 'eligible', 'applied', 'cleared', 'approved'];
const CLEARANCE_OPTIONS = ['pending', 'cleared'];

export default function Graduation() {
  const [state, setState] = useState({ loading: true, error: null, applications: [] });

  function load() {
    listAllGraduationApplications()
      .then((applications) => setState({ loading: false, error: null, applications }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load graduation applications.', applications: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpdate(id, updates) {
    try {
      await updateGraduationApplication(id, updates);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not update this application.' }));
    }
  }

  const columns = [
    { key: 'student', label: 'Student', render: (r) => r.profiles?.full_name || r.profiles?.student_number || '—' },
    { key: 'status', label: 'Eligibility', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'clearance_status', label: 'Clearance', render: (r) => <StatusBadge status={r.clearance_status} /> },
    { key: 'fee_paid', label: 'Fee Paid', render: (r) => (r.fee_paid ? 'Yes' : 'No') },
    {
      key: 'actions',
      label: 'Update',
      render: (r) => (
        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            name={`grad-status-${r.id}`}
            value={r.status}
            onChange={(e) => handleUpdate(r.id, { status: e.target.value })}
            options={STATUS_OPTIONS}
            className="min-w-[9rem]"
          />
          <SelectField
            name={`grad-clearance-${r.id}`}
            value={r.clearance_status}
            onChange={(e) => handleUpdate(r.id, { clearance_status: e.target.value })}
            options={CLEARANCE_OPTIONS}
            className="min-w-[8rem]"
          />
          <button
            type="button"
            onClick={() => handleUpdate(r.id, { fee_paid: !r.fee_paid })}
            className="whitespace-nowrap font-body text-xs font-semibold text-gold-700 hover:text-gold-800"
          >
            Mark {r.fee_paid ? 'Unpaid' : 'Paid'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Seo title="Graduation" description="Review graduation applications and clearance." path="/admin/graduation" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Graduation</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Eligibility, clearance and graduation fee status.</p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.applications.length === 0 && (
            <EmptyState icon={Award} title="No applications yet" message="Student graduation applications will appear here." />
          )}
          {!state.loading && !state.error && state.applications.length > 0 && <DataTable columns={columns} rows={state.applications} />}
        </SectionCard>
      </div>
    </>
  );
}
