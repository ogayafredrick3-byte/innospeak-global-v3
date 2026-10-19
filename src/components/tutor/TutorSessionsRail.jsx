import { MessageSquarePlus, MessageSquare, Trash2 } from 'lucide-react';
import { getPersonaById, PERSONA_ACCENTS } from '../../lib/tutor/tutorPersonas';
import { cn } from '../../utils/cn.js';

function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;

  if (diff < min) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / min)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function sessionTitle(session) {
  const firstUser = session.messages?.find((m) => m.role === 'user' && m.content);
  if (firstUser) {
    const text = firstUser.content.trim();
    return text.length > 46 ? `${text.slice(0, 46)}…` : text;
  }
  const persona = getPersonaById(session.personaId);
  return `${persona.label} session`;
}

function SessionRow({ session, isActive, onSelect, onDelete }) {
  const persona = getPersonaById(session.personaId);
  const accent = PERSONA_ACCENTS[persona.accent] || PERSONA_ACCENTS.gold;

  return (
    <div
      className={cn(
        'group relative flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 transition-colors duration-150',
        isActive ? 'bg-navy-900 text-white shadow-sm' : 'hover:bg-navy-50'
      )}
      onClick={() => onSelect(session.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(session.id);
        }
      }}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
          isActive ? 'bg-white/15 text-white' : cn(accent.bg, accent.text)
        )}
      >
        <MessageSquare size={13} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate font-body text-xs font-semibold',
            isActive ? 'text-white' : 'text-navy-800'
          )}
        >
          {sessionTitle(session)}
        </p>
        <p
          className={cn(
            'mt-0.5 font-body text-[10px]',
            isActive ? 'text-white/60' : 'text-navy-400'
          )}
        >
          {persona.label} · {relativeTime(session.updatedAt)}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
        }}
        aria-label="Delete session"
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100',
          isActive
            ? 'text-white/60 hover:bg-white/10 hover:text-white'
            : 'text-navy-400 hover:bg-rose-50 hover:text-rose-600'
        )}
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

export default function TutorSessionsRail({
  sessions,
  activeSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  preferredMode,
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white shadow-premium">
      {/* Header */}
      <div className="border-b border-navy-100 px-4 py-3.5">
        <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
          Compass Sessions
        </p>
        <p className="mt-0.5 font-body text-xs text-navy-500">
          {sessions.length === 0
            ? 'No sessions yet'
            : `${sessions.length} session${sessions.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* New session button */}
      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={() => onNewSession(preferredMode)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-navy-200 bg-cream/40 px-3 py-2.5 font-body text-xs font-bold text-navy-700 transition-all hover:border-gold-400 hover:bg-gold-50/40 hover:text-gold-800"
        >
          <MessageSquarePlus size={14} />
          New session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {sessions.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="font-body text-xs leading-5 text-navy-400">
              Your conversations will appear here once you start one.
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {sessions.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                isActive={s.id === activeSessionId}
                onSelect={onSelectSession}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}