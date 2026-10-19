import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Copy, Hash } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listApplications, updateApplicationStatus } from '../../lib/supabase/admin';
import { approveApplicationWithAdmission } from '../../lib/supabase/admissions';

const STATUS_OPTIONS = ['submitted', 'under_review', 'additional_info_required', 'accepted', 'rejected', 'enrolled'];

function ApproveAction({ row, onApprove, busy }) {
  const [copied, setCopied] = useState(false);

  if (row.admission_number) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
          <Hash size={11} aria-hidden="true" />
          {row.admission_number}
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(row.admission_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          aria-label="Copy admission number"
          className="rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
        >
          {copied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onApprove(row.id)}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-body text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60"
    >
      <CheckCircle2 size={12} />
      {busy ? 'Issuing…' : 'Approve & Issue'}
    </button>
  );
}

export default function Applications() {
  const [state, setState] = useState({ loading: true, error: null, applications: [] });
  const [busyId, setBusyId] = useState(null);

  function load() {
    listApplications()
      .then((applications) => setState({ loading: false, error: null, applications }))
      .catch((err) =>
        setState({ loading: false, error: err.message || 'Could not load applications.', applications: [] })
      );
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(id, status) {
    try {
      await updateApplicationStatus(id, status);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not update this application.' }));
    }
  }

  async function handleApprove(id) {
    setBusyId(id);
    try {
      await approveApplicationWithAdmission(id);
      load();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Applications] approve failed:', err);
      setState((prev) => ({
        ...prev,
        error:
          err?.message?.includes('Supabase')
            ? 'Admission issuing is unavailable because Supabase has not been configured.'
            : err?.message || 'Could not issue an admission number for this application.',
      }));
    } finally {
      setBusyId(null);
    }
  }

  const columns = [
    { key: 'application_number', label: 'Application #' },
    {
      key: 'name',
      label: 'Applicant',
      render: (r) => `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.full_name || '—',
    },
    {
      key: 'division',
      label: 'Division',
      render: (r) => {
        if (!r.division) return '—';
        return r.division === 'labs' ? 'Labs' : r.division === 'academy' ? 'Academy' : r.division;
      },
    },
    { key: 'programme', label: 'Programme', render: (r) => r.programme || r.course_code || '—' },
    { key: 'email', label: 'Email' },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'admission',
      label: 'Admission',
      render: (r) => (
        <ApproveAction row={r} onApprove={handleApprove} busy={busyId === r.id} />
      ),
    },
    {
      key: 'actions',
      label: 'Update',
      render: (r) => (
        <SelectField
          name={`app-status-${r.id}`}
          value={r.status}
          onChange={(e) => handleStatusChange(r.id, e.target.value)}
          options={STATUS_OPTIONS}
          className="min-w-[9rem]"
        />
      ),
    },
  ];

  return (
    <>
      <Seo title="Applications" description="Review and action admission applications." path="/admin/applications" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Applications</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Click <strong>Approve &amp; Issue</strong> to accept an application and generate the
            student&rsquo;s course-based admission number (ISG + course code + year + serial). The student then registers at{' '}
          <code className="rounded bg-navy-50 px-1 py-0.5 font-mono text-[11px]">/register</code> using
          that number.
        </p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.applications.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="No applications yet"
              message="Submitted admission applications will appear here."
            />
          )}
          {!state.loading && !state.error && state.applications.length > 0 && (
            <DataTable columns={columns} rows={state.applications} />
          )}
        </SectionCard>
      </div>
    </>
  );
}