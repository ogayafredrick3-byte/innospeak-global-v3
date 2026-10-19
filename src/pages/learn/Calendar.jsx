import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, Video, ClipboardCheck, ArrowRight, RefreshCw } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { listPublishedSessions } from '../../lib/supabase/learning.js';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayKey(date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function Calendar() {
  const [state, setState] = useState({ loading: true, error: null, sessions: [] });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    listPublishedSessions()
      .then((sessions) => setState({ loading: false, error: null, sessions }))
      .catch((err) => setState({ loading: false, error: err.message, sessions: [] }));
  }, [reloadKey]);

  const grouped = useMemo(
    () =>
      state.sessions.reduce((acc, item) => {
        const key = dayKey(new Date(item.starts_at));
        (acc[key] ||= []).push(item);
        return acc;
      }, {}),
    [state.sessions]
  );

  const sortedDays = useMemo(() => Object.keys(grouped), [grouped]);
  const today = new Date();

  return (
    <>
      <Seo title="Learning Calendar" description="Your learning calendar." path="/learn/calendar" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Schedule
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            Learning Calendar
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            A single place for live sessions, deadlines, and upcoming assessments.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="btn-outline inline-flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/learn/sessions" className="btn-gold inline-flex items-center gap-2 text-sm">
            <Video size={14} /> Live Sessions
          </Link>
        </div>
      </div>

      <div className="mt-6">
        {state.loading && <LoadingState />}
        {state.error && !state.loading && <ErrorState message={state.error} />}

        {!state.loading && !state.error && state.sessions.length === 0 && (
          <SectionCard>
            <EmptyState
              icon={CalendarDays}
              title="Your calendar is clear"
              message="Published learning sessions will be grouped here by date."
            />
          </SectionCard>
        )}

        {!state.loading && !state.error && sortedDays.length > 0 && (
          <div className="space-y-7">
            {sortedDays.map((day) => {
              const firstDate = new Date(grouped[day][0].starts_at);
              const isToday = isSameDay(firstDate, today);
              const isPast = firstDate < today && !isToday;

              return (
                <section key={day}>
                  <div className="mb-3 flex items-center gap-3">
                    <h2
                      className={`font-display text-base font-bold ${
                        isToday ? 'text-gold-700' : isPast ? 'text-navy-400' : 'text-navy-900'
                      }`}
                    >
                      {day}
                    </h2>
                    {isToday && (
                      <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-gold-800">
                        Today
                      </span>
                    )}
                    {isPast && (
                      <span className="rounded-full bg-navy-50 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-navy-500">
                        Past
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {grouped[day].map((item) => {
                      const start = new Date(item.starts_at);
                      const end = new Date(item.ends_at);
                      const isAssessment = item.session_type === 'assessment';

                      return (
                        <SectionCard key={item.id} className="p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
                                {isAssessment ? (
                                  <ClipboardCheck size={17} />
                                ) : (
                                  <Video size={17} />
                                )}
                              </span>
                              <div>
                                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
                                  {item.session_type?.replaceAll('_', ' ') || 'Session'}
                                </p>
                                <h3 className="mt-0.5 font-display text-base font-bold leading-snug text-navy-900">
                                  {item.title}
                                </h3>
                                <p className="mt-0.5 font-body text-sm text-navy-500">
                                  {item.courses?.title || 'Course session'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 font-body text-xs font-semibold text-navy-500">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={13} />
                                {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {' – '}
                                {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {item.meeting_url && (
                                <a
                                  href={item.meeting_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500/10 px-2.5 py-1 font-bold text-gold-700 hover:bg-gold-500/20"
                                >
                                  Join
                                  <ArrowRight size={11} />
                                </a>
                              )}
                            </div>
                          </div>
                        </SectionCard>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}