import { useEffect, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import TextField from '../../components/ui/TextField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getMySupportTickets, submitSupportTicket, SUPPORT_CATEGORIES } from '../../lib/supabase/studentPortal';

export default function Support() {
  const [state, setState] = useState({ loading: true, error: null, tickets: [] });
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function load() {
    getMySupportTickets()
      .then((tickets) => setState({ loading: false, error: null, tickets }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your tickets.', tickets: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!category || !subject || !message) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitSupportTicket({ category, subject, message });
      setCategory('');
      setSubject('');
      setMessage('');
      load();
    } catch (err) {
      setSubmitError(err.message || 'Could not submit your ticket.');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: 'subject', label: 'Subject' },
    { key: 'category', label: 'Category', render: (r) => SUPPORT_CATEGORIES.find((c) => c.value === r.category)?.label || r.category },
    { key: 'created_at', label: 'Submitted', render: (r) => new Date(r.created_at).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <Seo title="Support" description="Get help desk, technical, academic and finance support." path="/portal/support" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Support</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Submit a ticket for technical, academic or finance queries.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Submit a Ticket" className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <SelectField
              label="Category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={SUPPORT_CATEGORIES}
              required
            />
            <TextField label="Subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <TextField label="Message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} required />
            {submitError && <ErrorState message={submitError} />}
            <button
              type="submit"
              disabled={submitting || !category || !subject || !message}
              className="btn-gold inline-flex w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              <LifeBuoy size={16} />
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Your Tickets" className="lg:col-span-2">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.tickets.length === 0 && (
            <EmptyState icon={LifeBuoy} title="No tickets yet" message="Tickets you submit will show up here." />
          )}
          {!state.loading && !state.error && state.tickets.length > 0 && <DataTable columns={columns} rows={state.tickets} />}
        </SectionCard>
      </div>
    </>
  );
}
