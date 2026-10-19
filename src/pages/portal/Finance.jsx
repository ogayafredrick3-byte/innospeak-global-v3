import { useEffect, useState } from 'react';
import { Wallet, Receipt } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatCard from '../../components/portal/StatCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getFeeTransactions, computeFeeBalance } from '../../lib/supabase/studentPortal';

export default function Finance() {
  const [state, setState] = useState({ loading: true, error: null, transactions: [] });

  useEffect(() => {
    getFeeTransactions()
      .then((transactions) => setState({ loading: false, error: null, transactions }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load your fee statement.', transactions: [] }));
  }, []);

  const balance = computeFeeBalance(state.transactions);
  const totalCharged = state.transactions.filter((t) => t.type === 'charge').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalPaid = state.transactions.filter((t) => t.type === 'payment').reduce((s, t) => s + Number(t.amount || 0), 0);

  const columns = [
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
    { key: 'description', label: 'Description', render: (r) => r.description || '—' },
    { key: 'type', label: 'Type', render: (r) => (r.type === 'payment' ? 'Payment' : 'Charge') },
    { key: 'method', label: 'Method', render: (r) => r.method || '—' },
    { key: 'reference', label: 'Reference', render: (r) => r.reference || '—' },
    {
      key: 'amount',
      label: 'Amount (KES)',
      render: (r) => (
        <span className={r.type === 'payment' ? 'font-semibold text-emerald-700' : 'font-semibold text-navy-800'}>
          {r.type === 'payment' ? '-' : ''}
          {Number(r.amount || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <>
      <Seo title="Fees & Finance" description="Track your fee balance, payments and receipts." path="/portal/finance" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Fees &amp; Finance</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Your fee structure, balance and payment history.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Total Charged" value={`KES ${totalCharged.toLocaleString()}`} />
        <StatCard icon={Receipt} label="Total Paid" value={`KES ${totalPaid.toLocaleString()}`} />
        <StatCard
          label="Balance"
          value={`KES ${balance.toLocaleString()}`}
          hint={balance > 0 ? 'Financial clearance pending' : 'Cleared'}
        />
      </div>

      <div className="mt-6">
        <SectionCard title="Fee Statement" description="A record of every charge and payment on your account.">
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.transactions.length === 0 && (
            <EmptyState icon={Receipt} title="No transactions yet" message="Your fee statement will appear here once billing begins." />
          )}
          {!state.loading && !state.error && state.transactions.length > 0 && (
            <DataTable columns={columns} rows={state.transactions} />
          )}
        </SectionCard>
      </div>
    </>
  );
}
