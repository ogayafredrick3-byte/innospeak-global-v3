import { useEffect, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import TextField from '../../components/ui/TextField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getMyServiceRequests, submitServiceRequest, SERVICE_REQUEST_TYPES } from '../../lib/supabase/studentPortal';

export default function Requests() {
  const [state, setState] = useState({ loading: true, error: null, requests: [] });
  const [requestType, setRequestType] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function load() {
    getMyServiceRequests()
      .then((requests) => setState({ loading: false, error: null, requests }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your requests.', requests: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!requestType) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitServiceRequest(requestType, { notes });
      setRequestType('');
      setNotes('');
      load();
    } catch (err) {
      setSubmitError(err.message || 'Could not submit your request.');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: 'request_type', label: 'Request', render: (r) => SERVICE_REQUEST_TYPES.find((t) => t.value === r.request_type)?.label || r.request_type },
    { key: 'created_at', label: 'Submitted', render: (r) => new Date(r.created_at).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <Seo title="Services & Requests" description="Submit and track institutional service requests." path="/portal/requests" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Services / Requests</h1>
        <p className="mt-2 font-body text-sm text-navy-500">
          Request transcripts, letters, unit or program changes, deferment, clearance and more.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="New Request" className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField
              label="Request Type"
              name="request_type"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              options={SERVICE_REQUEST_TYPES}
              required
            />
            <TextField
              label="Notes"
              name="notes"
              optional
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details for this request"
            />
            {submitError && <ErrorState message={submitError} />}
            <button
              type="submit"
              disabled={submitting || !requestType}
              className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              <SendHorizonal size={16} />
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Your Requests"
          description="Submitted → Processing → Approved / Rejected"
          className="lg:col-span-2"
        >
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.requests.length === 0 && (
            <EmptyState icon={SendHorizonal} title="No requests yet" message="Requests you submit will appear here with their status." />
          )}
          {!state.loading && !state.error && state.requests.length > 0 && <DataTable columns={columns} rows={state.requests} />}
        </SectionCard>
      </div>
    </>
  );
}
