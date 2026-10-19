import { useEffect, useState } from 'react';
import {
  CalendarDays, Clock3, Video, MapPin, ExternalLink, CheckCircle2,
  PlayCircle, Radio, RefreshCw,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { listPublishedSessions } from '../../lib/supabase/learning.js';
import { checkInSession } from '../../lib/supabase/platform.js';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';

function relativeStart(startsAt) {
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const diffMin = Math.round((start - now) / 60000);
  if (diffMin < 0) return null;
  if (diffMin < 5) return 'Starting now';
  if (diffMin < 60) return `Starts in ${diffMin}m`;
  const hrs = Math.round(diffMin / 60);
  if (hrs < 24) return `Starts in ${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function SessionCard({ session, isLive, isCheckedIn, busy, onCheckIn }) {
  const start = new Date(session.starts_at);
  const end = new Date(session.ends_at);
  const upcoming = relativeStart(session.starts_at);

  return (
    <SectionCard className="flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 text-gold-700">
          <Video size={19} />
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-rose-700">
            <Radio size={11} className="animate-pulse" />
            Live now
          </span>
        ) : (
          <span className="rounded-full bg-navy-50 px-2.5 py-1 font-body text-[11px] font-bold capitalize text-navy-600">
            {session.session_type?.replaceAll('_', ' ') || 'Session'}
          </span>
        )}
      </div>

      <h2 className="mt-5 font-display text-lg font-bold capitalize leading-snug text-navy-900">
        {session.title}
      </h2>
      <p className="mt-1 font-body text-sm text-navy-500">
        {session.courses?.title || 'Course session'}
      </p>

      {session.description && (
        <p className="mt-3 font-body text-sm leading-6 text-navy-600">
          {session.description}
        </p>
      )}

      <div className="mt-5 flex-1 space-y-2 font-body text-xs font-semibold text-navy-500">
        <p className="flex items-center gap-2">
          <CalendarDays size={14} />
          {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          {' · '}
          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="flex items-center gap-2">
          <Clock3 size={14} />
          Until {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {upcoming && <span className="text-gold-700"> · {upcoming}</span>}
        </p>
        {(session.location || session.meeting_url) && (
          <p className="flex items-center gap-2">
            <MapPin size={14} />
            {session.location || 'Online'}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-100 pt-5">
        {session.meeting_url && (
          <a
            href={session.meeting_url}
            target="_blank"
            rel="noreferrer"
            className="btn-gold inline-flex items-center gap-2 text-sm"
          >
            {isLive ? 'Join now' : 'Join session'}
            <ExternalLink size={14} />
          </a>
        )}
        <button
          type="button"
          onClick={onCheckIn}
          disabled={busy || isCheckedIn}
          className="btn-outline inline-flex items-center gap-2 text-sm disabled:opacity-60"
        >
          {isCheckedIn ? (
            <>
              <CheckCircle2 size={14} className="text-emerald-600" />
              Attendance recorded
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              {busy ? 'Recording…' : 'Check in'}
            </>
          )}
        </button>
        {session.recording_url && (
          <a
            href={session.recording_url}
            target="_blank"
            rel="noreferrer"
            className="btn-outline inline-flex items-center gap-2 text-sm"
          >
            <PlayCircle size={14} /> Recording
          </a>
        )}
      </div>
    </SectionCard>
  );
}

export default function Sessions() {
  const [state, setState] = useState({ loading: true, error: null, sessions: [] });
  const [checked, setChecked] = useState(new Set());
  const [busy, setBusy] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  async function load() {
    try {
      const sessions = await listPublishedSessions();
      setState({ loading: false, error: null, sessions });
    } catch (err) {
      setState({ loading: false, error: err.message, sessions: [] });
    }
  }

  useEffect(() => { load(); }, [reloadKey]);

  async function checkIn(id) {
    try {
      setBusy(id);
      await checkInSession(id);
      setChecked((p) => new Set([...p, id]));
    } catch (e) {
      setState((p) => ({ ...p, error: e.message }));
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <Seo title="Live Sessions" description="Your scheduled learning sessions." path="/learn/sessions" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">
            Learning schedule
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            Live Sessions
          </h1>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-navy-500">
            Join scheduled lectures, tutorials, practical demonstrations, workshops
            and office hours. Attendance is recorded from this page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="btn-outline inline-flex shrink-0 items-center gap-2 text-sm"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="mt-6">
        {state.loading && <LoadingState />}
        {state.error && !state.loading && <ErrorState message={state.error} />}
        {!state.loading && !state.error && state.sessions.length === 0 && (
          <SectionCard>
            <EmptyState
              icon={Video}
              title="No sessions published yet"
              message="When an instructor publishes a session for one of your courses, it will appear here."
            />
          </SectionCard>
        )}
        {!state.loading && !state.error && state.sessions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {state.sessions.map((s) => {
              const start = new Date(s.starts_at).getTime();
              const end = new Date(s.ends_at).getTime();
              const now = Date.now();
              const isLive = now >= start && now <= end;
              return (
                <SessionCard
                  key={s.id}
                  session={s}
                  isLive={isLive}
                  isCheckedIn={checked.has(s.id)}
                  busy={busy === s.id}
                  onCheckIn={() => checkIn(s.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}