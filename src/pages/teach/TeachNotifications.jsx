import { useEffect, useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listMyNotifications, markAllNotificationsRead } from '../../lib/supabase/lms';

export default function TeachNotifications() {
  const [state, setState] = useState({ loading: true, error: null, notifications: [] });

  function load() {
    listMyNotifications(50)
      .then((notifications) => setState({ loading: false, error: null, notifications }))
      .catch(() => setState({ loading: false, error: 'Could not load notifications.', notifications: [] }));
  }

  useEffect(() => { load(); }, []);

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      load();
    } catch { /* ignore */ }
  }

  return (
    <>
      <Seo title="Notifications" description="Your notifications." path="/teach/notifications" />

      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Teach</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Notifications</h1>
          <p className="mt-2 font-body text-sm text-navy-500">Stay updated on student activity, submissions, and course events.</p>
        </div>
        {!state.loading && state.notifications.length > 0 && (
          <button onClick={handleMarkAll} className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2 font-body text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50">
            <CheckCircle2 size={15} />
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.notifications.length === 0 && (
            <EmptyState icon={Bell} title="No notifications" message="You're all caught up. New notifications will appear here." />
          )}
          {!state.loading && !state.error && state.notifications.length > 0 && (
            <div className="space-y-2">
              {state.notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${n.is_read ? 'border-navy-50 bg-white' : 'border-gold-200 bg-gold-50/40'}`}>
                  <div className="flex-1">
                    <p className="font-body text-sm font-semibold text-navy-900">{n.title || 'Notification'}</p>
                    {n.body && <p className="mt-1 font-body text-sm text-navy-600">{n.body}</p>}
                    <p className="mt-1 font-body text-xs text-navy-400">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && <StatusBadge status="unread" />}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
