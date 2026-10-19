import { useEffect, useState } from 'react';
import { Receipt, RefreshCw } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listAllPayments } from '../../lib/supabase/payments';

const PROVIDER_LABELS = {
  mpesa: 'M-PESA',
  paypal: 'PayPal',
};

const STATUS_VARIANTS = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  cancelled: 'neutral',
  refunded: 'neutral',
};

export default function AdminPayments() {
  const [state, setState] = useState({ loading: true, error: null, payments: [] });

  function load() {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    listAllPayments()
      .then((payments) => setState({ loading: false, error: null, payments }))
      .catch((err) =>
        setState({ loading: false, error: err.message || 'Could not load payments.', payments: [] })
      );
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Seo title="Payments" description="Transaction history for all course payments." path="/admin/payments" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Payments</h1>
          <p className="mt-2 font-body text-sm text-navy-500">
            All course payment transactions across M-PESA and PayPal.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={state.loading}
          className="btn-outline flex shrink-0 items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={14} className={state.loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.payments.length === 0 && (
            <EmptyState
              icon={Receipt}
              title="No payments yet"
              message="Course payments will appear here once students start enrolling in paid courses."
            />
          )}
          {!state.loading && !state.error && state.payments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-navy-100 text-left">
                    <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-navy-500">Student</th>
                    <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-navy-500">Course</th>
                    <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-navy-500">Provider</th>
                    <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-navy-500">Amount</th>
                    <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-navy-500">Status</th>
                    <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-navy-500">Transaction ID</th>
                    <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-wider text-navy-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {state.payments.map((p) => (
                    <tr key={p.id} className="border-b border-navy-50 hover:bg-cream/50">
                      <td className="px-4 py-3 font-body text-sm text-navy-900">
                        <span className="font-mono text-xs text-navy-500">{p.student_id?.slice(0, 8)}</span>
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-navy-700">
                        {p.course_code || p.course_id?.slice(0, 8) || '—'}
                      </td>
                      <td className="px-4 py-3 font-body text-sm text-navy-700">
                        {PROVIDER_LABELS[p.provider] || p.provider}
                      </td>
                      <td className="px-4 py-3 font-body text-sm font-semibold text-navy-900">
                        {p.currency} {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-xs font-semibold ${
                            p.status === 'paid'
                              ? 'bg-green-50 text-green-700'
                              : p.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : p.status === 'failed'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-navy-50 text-navy-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-navy-500">
                        {p.provider_transaction_id ? (
                          <span className="font-mono">{p.provider_transaction_id}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-navy-500">
                        {new Date(p.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
