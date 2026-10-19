import { useEffect, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { listContactMessages, updateContactMessageStatus, deleteContactMessage } from '../../lib/supabase/admin';

export default function ContactMessages() {
  const [state, setState] = useState({ loading: true, error: null, messages: [] });

  function load() {
    listContactMessages()
      .then((messages) => setState({ loading: false, error: null, messages }))
      .catch((err) => setState({ loading: false, error: err.message || 'Could not load messages.', messages: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkReplied(id) {
    try {
      await updateContactMessageStatus(id, 'replied');
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not update this message.' }));
    }
  }

  async function handleDelete(id) {
    try {
      await deleteContactMessage(id);
      load();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message || 'Could not delete this message.' }));
    }
  }

  return (
    <>
      <Seo title="Contact Messages" description="Messages submitted via the public contact form." path="/admin/messages" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Contact Messages</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Submissions from the public Contact page.</p>
      </div>

      <div className="mt-6">
        <SectionCard>
          {state.loading && <LoadingState />}
          {!state.loading && state.error && <ErrorState message={state.error} />}
          {!state.loading && !state.error && state.messages.length === 0 && (
            <EmptyState icon={Mail} title="No messages yet" message="Contact form submissions will appear here." />
          )}
          {!state.loading && !state.error && state.messages.length > 0 && (
            <ul className="space-y-3">
              {state.messages.map((m) => (
                <li key={m.id} className="rounded-xl border border-navy-100 bg-cream px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-body text-sm font-semibold text-navy-900">
                        {m.subject} — <span className="font-normal text-navy-600">{m.name}</span>
                      </p>
                      <p className="mt-1 font-body text-xs text-navy-400">
                        {m.email} {m.phone ? `· ${m.phone}` : ''} · {new Date(m.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2 font-body text-sm text-navy-700">{m.message}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusBadge status={m.status} />
                      <div className="flex items-center gap-3">
                        {m.status !== 'replied' && (
                          <button
                            type="button"
                            onClick={() => handleMarkReplied(m.id)}
                            className="whitespace-nowrap font-body text-xs font-semibold text-gold-700 hover:text-gold-800"
                          >
                            Mark Replied
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="inline-flex items-center gap-1 whitespace-nowrap font-body text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
