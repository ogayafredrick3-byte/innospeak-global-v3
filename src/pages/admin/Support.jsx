import { useEffect, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listAllSupportTickets, updateSupportTicketStatus } from '../../lib/supabase/admin';
import { SUPPORT_CATEGORIES } from '../../lib/supabase/studentPortal';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

export default function Support() {
  const [state, setState] = useState({ loading: true, error: null, tickets: [] });

  function load() {
    listAllSupportTickets()
      .then((tickets) => setState({ loading: false, error: null, tickets }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load tickets.', tickets: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id, status) {
    try {
      await updateSupportTicketStatus(id, status);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not update this ticket.' }));
    }
  }

  const columns = [
    { key: 'student', label: 'Student', render: (r) => r.profiles?.full_name || r.profiles?.student_number || '—' },
    { key: 'category', label: 'Category', render: (r) => SUPPORT_CATEGORIES.find((c) => c.value === r.category)?.label || r.category },
    { key: 'subject', label: 'Subject' },
    { key: 'created_at', label: 'Submitted', render: (r) => new Date(r.created_at).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Update',
      render: (r) => (
        <SelectField
          name={`ticket-status-${r.id}`}
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
      <Seo title="Support Tickets" description="Review and resolve student support tickets." path="/admin/support" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Support Tickets</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Technical, academic and finance queries from students.</p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.tickets.length === 0 && (
            <EmptyState icon={LifeBuoy} title="No tickets yet" message="Student-submitted tickets will appear here." />
          )}
          {!state.loading && !state.error && state.tickets.length > 0 && <DataTable columns={columns} rows={state.tickets} />}
        </SectionCard>
      </div>
    </>
  );
}
