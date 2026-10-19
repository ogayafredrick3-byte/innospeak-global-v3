import { useEffect, useState } from 'react';
import { Bell, Mail, MailOpen } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import { getAnnouncements, getMyMessages, markMessageRead } from '../../lib/supabase/studentPortal';

export default function Communication() {
  const [state, setState] = useState({ loading: true, error: null, announcements: [], messages: [] });

  function load() {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    Promise.all([getAnnouncements(), getMyMessages()])
      .then(([announcements, messages]) => setState({ loading: false, error: null, announcements, messages }))
      .catch((err) => setState((prev) => ({ ...prev, loading: false, error: err.message || 'Could not load communications.' })));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkRead(id) {
    try {
      await markMessageRead(id);
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => (m.id === id ? { ...m, is_read: true } : m)),
      }));
    } catch {
      /* non-critical */
    }
  }

  return (
    <>
      <Seo title="Communication" description="Institutional announcements and messages." path="/portal/communication" />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Student Portal</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Communication</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Announcements, notices and messages from the institution.</p>
      </div>

      {state.loading && <div className="mt-8"><LoadingState /></div>}
      {!state.loading && state.error && <div className="mt-8"><ErrorState message={state.error} /></div>}

      {!state.loading && !state.error && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionCard title="Announcements" description="Institution and department-wide notices.">
            {state.announcements.length === 0 ? (
              <EmptyState icon={Bell} title="No announcements" message="Check back later for institutional updates." />
            ) : (
              <ul className="space-y-3">
                {state.announcements.map((a) => (
                  <li key={a.id} className="rounded-xl border border-navy-100 bg-cream px-4 py-3">
                    <p className="font-body text-sm font-semibold text-navy-900">{a.title}</p>
                    <p className="mt-1 font-body text-sm text-navy-600">{a.body}</p>
                    <p className="mt-2 font-body text-xs text-navy-400">{new Date(a.created_at).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Messages" description="Direct messages sent to you.">
            {state.messages.length === 0 ? (
              <EmptyState icon={Mail} title="No messages" message="You have no messages yet." />
            ) : (
              <ul className="space-y-3">
                {state.messages.map((m) => (
                  <li
                    key={m.id}
                    className={`rounded-xl border px-4 py-3 ${m.is_read ? 'border-navy-100 bg-white' : 'border-gold-200 bg-gold-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-body text-sm font-semibold text-navy-900">{m.subject}</p>
                        <p className="mt-1 font-body text-xs text-navy-400">
                          From {m.sender} &middot; {new Date(m.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!m.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(m.id)}
                          className="inline-flex items-center gap-1 whitespace-nowrap font-body text-xs font-semibold text-gold-700 hover:text-gold-800"
                        >
                          <MailOpen size={13} />
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="mt-2 font-body text-sm text-navy-600">{m.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}
    </>
  );
}
