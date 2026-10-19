import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Pin, Lock, Plus, Send, ChevronDown, ChevronRight,
  UserRound, GraduationCap, X, RefreshCw,
} from 'lucide-react';
import SectionCard from '../portal/SectionCard.jsx';
import { LoadingState, EmptyState } from '../portal/PortalStates.jsx';
import {
  listDiscussions, createDiscussion, listReplies, replyToDiscussion,
  setDiscussionState,
} from '../../lib/supabase/lms';
import { cn } from '../../utils/cn.js';

/* ──────────────────────────────────────────────────────────────
   Relative time
   ────────────────────────────────────────────────────────────── */

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ──────────────────────────────────────────────────────────────
   Avatar (small, initials-based)
   ────────────────────────────────────────────────────────────── */

function Avatar({ name, role, size = 'md' }) {
  const initials = String(name || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isInstructor = role === 'instructor';
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs';

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-body font-bold',
        sizeClass,
        isInstructor
          ? 'bg-gold-gradient text-navy-900'
          : 'bg-navy-100 text-navy-700'
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   Thread — one discussion with replies
   ────────────────────────────────────────────────────────────── */

function Thread({ discussion, isInstructor, onChanged }) {
  const [replies, setReplies] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    listReplies(discussion.id)
      .then((r) => {
        setReplies(r);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [discussion.id]);

  useEffect(() => {
    // Auto-expand + load replies if the thread is pinned or has activity
    if (discussion.is_pinned) {
      setExpanded(true);
      load();
    }
  }, [discussion.is_pinned, load]);

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && !loaded) load();
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await replyToDiscussion(discussion.id, replyText.trim(), isInstructor);
      setReplyText('');
      load();
    } catch {
      /* silent — the composer keeps the draft so the user can retry */
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePinToggle() {
    setBusy(true);
    try {
      await setDiscussionState(discussion.id, { is_pinned: !discussion.is_pinned });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleCloseToggle() {
    setBusy(true);
    try {
      await setDiscussionState(discussion.id, { is_closed: !discussion.is_closed });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const replyCount = loaded ? replies.length : (discussion.reply_count ?? 0);
  const isClosed = discussion.is_closed;

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white transition-colors',
        discussion.is_pinned
          ? 'border-gold-300/60 bg-gold-50/30'
          : 'border-navy-100'
      )}
    >
      {/* Thread header — always visible */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-navy-50/40"
        aria-expanded={expanded}
      >
        <span className="mt-0.5 shrink-0 text-navy-400">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>

        <Avatar
          name={discussion.profiles?.full_name || 'Student'}
          role={discussion.profiles?.role}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {discussion.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
                <Pin size={9} /> Pinned
              </span>
            )}
            {isClosed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600">
                <Lock size={9} /> Closed
              </span>
            )}
          </div>

          <h3
            className={cn(
              'font-display text-sm font-bold leading-snug text-navy-900 sm:text-base',
              discussion.is_pinned && 'mt-1.5'
            )}
          >
            {discussion.title}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-body text-xs text-navy-400">
            <span className="inline-flex items-center gap-1.5">
              <UserRound size={11} />
              {discussion.profiles?.full_name || 'Student'}
            </span>
            <span>{relativeTime(discussion.created_at)}</span>
            {loaded && (
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare size={11} />
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-navy-100 px-4 py-4 pl-[3.75rem]">
              {/* Original post */}
              {discussion.body && (
                <div className="rounded-xl bg-cream/60 p-3.5">
                  <p className="whitespace-pre-wrap font-body text-sm leading-6 text-navy-700">
                    {discussion.body}
                  </p>
                </div>
              )}

              {/* Replies */}
              {loaded && replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  {replies.map((r) => {
                    const rName = r.profiles?.full_name || 'User';
                    const rIsInstructor = r.is_instructor_reply;
                    return (
                      <div key={r.id} className="flex items-start gap-3">
                        <Avatar
                          name={rName}
                          role={rIsInstructor ? 'instructor' : 'student'}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-body text-xs font-bold text-navy-900">
                              {rName}
                            </span>
                            {rIsInstructor && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
                                <GraduationCap size={9} /> Instructor
                              </span>
                            )}
                            <span className="font-body text-[11px] text-navy-400">
                              {relativeTime(r.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap font-body text-sm leading-6 text-navy-700">
                            {r.body}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {loaded && replies.length === 0 && (
                <p className="mt-4 font-body text-xs italic text-navy-400">
                  No replies yet.
                </p>
              )}

              {/* Composer */}
              {!isClosed ? (
                <form onSubmit={handleReply} className="mt-4 flex items-start gap-2">
                  <Avatar
                    name="You"
                    role={isInstructor ? 'instructor' : 'student'}
                    size="sm"
                  />
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isInstructor ? 'Reply as instructor…' : 'Write a reply…'}
                    className="flex-1 rounded-xl border border-navy-100 bg-white px-3.5 py-2 font-body text-sm text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-navy-900 shadow-gold transition-opacity disabled:opacity-40"
                    aria-label="Send reply"
                  >
                    <Send size={14} />
                  </button>
                </form>
              ) : (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-navy-50 px-3.5 py-2.5">
                  <Lock size={13} className="shrink-0 text-navy-500" />
                  <p className="font-body text-xs text-navy-500">
                    This discussion is closed. {isInstructor && 'You can reopen it above.'}
                  </p>
                </div>
              )}

              {/* Instructor actions */}
              {isInstructor && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-navy-50 pt-3">
                  <button
                    type="button"
                    onClick={handlePinToggle}
                    disabled={busy}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-bold transition-colors disabled:opacity-50',
                      discussion.is_pinned
                        ? 'bg-gold-500/15 text-gold-800 hover:bg-gold-500/25'
                        : 'text-navy-500 hover:bg-navy-50'
                    )}
                  >
                    <Pin size={12} />
                    {discussion.is_pinned ? 'Unpin' : 'Pin to top'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseToggle}
                    disabled={busy}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs font-bold transition-colors disabled:opacity-50',
                      isClosed
                        ? 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                        : 'text-navy-500 hover:bg-navy-50'
                    )}
                  >
                    <Lock size={12} />
                    {isClosed ? 'Reopen' : 'Close thread'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   New discussion form
   ────────────────────────────────────────────────────────────── */

function NewDiscussionForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm({ title: '', body: '' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-navy-100 bg-cream/40 p-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm font-bold text-navy-900">Start a discussion</p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="rounded-lg p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700"
        >
          <X size={14} />
        </button>
      </div>

      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        placeholder="What's your question or topic?"
        required
        autoFocus
        className="w-full rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 font-body text-sm text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25"
      />

      <textarea
        value={form.body}
        onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
        placeholder="Add context — what you've tried, what you're stuck on, or what you want to discuss."
        rows={3}
        className="w-full rounded-xl border border-navy-100 bg-white px-3.5 py-2.5 font-body text-sm text-navy-900 placeholder:text-navy-300 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/25"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !form.title.trim()}
          className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-60"
        >
          <Send size={13} />
          {submitting ? 'Posting…' : 'Post discussion'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────────────────── */

export default function DiscussionBoard({ courseId, isInstructor = false }) {
  const [state, setState] = useState({ loading: true, discussions: [] });
  const [showNew, setShowNew] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    listDiscussions(courseId)
      .then((discussions) => setState({ loading: false, discussions }))
      .catch(() => setState({ loading: false, discussions: [] }));
  }, [courseId]);

  useEffect(() => { load(); }, [load, reloadKey]);

  async function handleCreate(form) {
    await createDiscussion(courseId, form);
    setShowNew(false);
    setReloadKey((k) => k + 1);
  }

  if (state.loading) return <LoadingState />;

  const pinned = state.discussions.filter((d) => d.is_pinned);
  const open = state.discussions.filter((d) => !d.is_pinned && !d.is_closed);
  const closed = state.discussions.filter((d) => !d.is_pinned && d.is_closed);

  return (
    <SectionCard
      title="Discussions"
      description={
        state.discussions.length === 0
          ? 'Ask questions and share ideas with your class.'
          : `${state.discussions.length} ${state.discussions.length === 1 ? 'discussion' : 'discussions'}`
      }
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            aria-label="Refresh discussions"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
          >
            <RefreshCw size={13} />
          </button>
          {!showNew && (
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="btn-gold inline-flex items-center gap-1.5 text-xs"
            >
              <Plus size={13} /> New discussion
            </button>
          )}
        </div>
      }
      className="mt-6"
    >
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <NewDiscussionForm
              onSubmit={handleCreate}
              onCancel={() => setShowNew(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {state.discussions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No discussions yet"
          message="Be the first to ask a question or start a conversation with your class."
        />
      ) : (
        <div className="space-y-6">
          {pinned.length > 0 && (
            <div>
              <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
                Pinned
              </p>
              <div className="space-y-3">
                {pinned.map((d) => (
                  <Thread key={d.id} discussion={d} isInstructor={isInstructor} onChanged={load} />
                ))}
              </div>
            </div>
          )}

          {open.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                  Open
                </p>
              )}
              <div className="space-y-3">
                {open.map((d) => (
                  <Thread key={d.id} discussion={d} isInstructor={isInstructor} onChanged={load} />
                ))}
              </div>
            </div>
          )}

          {closed.length > 0 && (
            <div>
              <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                Closed
              </p>
              <div className="space-y-3 opacity-75">
                {closed.map((d) => (
                  <Thread key={d.id} discussion={d} isInstructor={isInstructor} onChanged={load} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}