import { useEffect, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listAllServiceRequests, updateServiceRequestStatus } from '../../lib/supabase/admin';
import { SERVICE_REQUEST_TYPES } from '../../lib/supabase/studentPortal';

const STATUS_OPTIONS = ['submitted', 'processing', 'approved', 'rejected'];

export default function Requests() {
  const [state, setState] = useState({ loading: true, error: null, requests: [] });

  function load() {
    listAllServiceRequests()
      .then((requests) => setState({ loading: false, error: null, requests }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load requests.', requests: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id, status) {
    try {
      await updateServiceRequestStatus(id, status);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not update this request.' }));
    }
  }

  const columns = [
    { key: 'student', label: 'Student', render: (r) => r.profiles?.full_name || r.profiles?.student_number || '—' },
    { key: 'request_type', label: 'Request', render: (r) => SERVICE_REQUEST_TYPES.find((t) => t.value === r.request_type)?.label || r.request_type },
    { key: 'created_at', label: 'Submitted', render: (r) => new Date(r.created_at).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Update',
      render: (r) => (
        <SelectField
          name={`status-${r.id}`}
          value={r.status}
          onChange={(e) => handleStatusChange(r.id, e.target.value)}
          options={STATUS_OPTIONS}
          className="min-w-[10rem]"
        />
      ),
    },
  ];

  return (
    <>
      <Seo title="Service Requests" description="Review and action student service requests." path="/admin/requests" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Service Requests</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Transcripts, letters, deferments, clearance and more.</p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.requests.length === 0 && (
            <EmptyState icon={SendHorizonal} title="No requests yet" message="Student-submitted requests will appear here." />
          )}
          {!state.loading && !state.error && state.requests.length > 0 && <DataTable columns={columns} rows={state.requests} />}
        </SectionCard>
      </div>
    </>
  );
}
