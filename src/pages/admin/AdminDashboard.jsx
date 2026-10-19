import { useEffect, useState } from 'react';
import { Users, SendHorizonal, LifeBuoy, Wallet, ClipboardList, Mail } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import StatCard from '../../components/portal/StatCard.jsx';
import { LoadingState, ErrorState } from '../../components/portal/PortalStates.jsx';
import { getAdminOverview } from '../../lib/supabase/admin';

export default function AdminDashboard() {
  const [state, setState] = useState({ loading: true, error: null, overview: null });

  useEffect(() => {
    getAdminOverview()
      .then((overview) => setState({ loading: false, error: null, overview }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load the admin overview.', overview: null }));
  }, []);

  return (
    <>
      <Seo title="Admin Dashboard" description="InnoSpeak Global admin overview." path="/admin" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-2 font-body text-sm text-navy-500">An overview of student activity across the institution.</p>
      </div>

      <div className="mt-6">
        {state.loading && <LoadingState />}
        {!state.loading && state.error && <ErrorState message={state.error} />}
        {!state.loading && !state.error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Students" value={state.overview.students} />
            <StatCard icon={ClipboardList} label="Pending Applications" value={state.overview.pendingApplications} />
            <StatCard icon={Mail} label="New Messages" value={state.overview.newMessages} />
            <StatCard icon={SendHorizonal} label="Pending Requests" value={state.overview.pendingRequests} />
            <StatCard icon={LifeBuoy} label="Open Tickets" value={state.overview.openTickets} />
            <StatCard icon={Wallet} label="Total Outstanding Fees" value={`KES ${state.overview.unpaidBalance.toLocaleString()}`} />
          </div>
        )}
      </div>
    </>
  );
}
