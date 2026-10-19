import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Inbox, GraduationCap, MessageSquare, Award,
  ClipboardCheck, CalendarDays, Sparkles, X,
} from 'lucide-react';
import {
  listMyNotifications, markNotificationRead, markAllNotificationsRead,
} from '../../lib/supabase/lms';
import { cn } from '../../utils/cn.js';

/* ──────────────────────────────────────────────────────────────
   Helpers
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

// Pick an icon from the notification type. Falls back to Bell.
const TYPE_ICONS = {
  enrollment: GraduationCap,
  course: GraduationCap,
  message: MessageSquare,
  discussion: MessageSquare,
  certificate: Award,
  grade: Award,
  assignment: ClipboardCheck,
  submission: ClipboardCheck,
  session: CalendarDays,
  event: CalendarDays,
};

function iconFor(notification) {
  const key = (notification.type || notification.notification_type || '').toLowerCase();
  return TYPE_ICONS[key] || Sparkles;
}

/* ──────────────────────────────────────────────────────────────
   Individual notification row
   ────────────────────────────────────────────────────────────── */

function NotificationRow({ notification, onClick }) {
  const Icon = iconFor(notification);
  const isUnread = !notification.is_read;

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors',
        isUnread ? 'bg-gold-500/5 hover:bg-gold-500/10' : 'hover:bg-navy-50/60'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          isUnread
            ? 'bg-gold-500/15 text-gold-700'
            : 'bg-navy-100 text-navy-600'
        )}
      >
        <Icon size={14} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'font-body text-sm leading-snug',
              isUnread ? 'font-bold text-navy-900' : 'font-semibold text-navy-700'
            )}
          >
            {notification.title || 'Notification'}
          </p>
          {isUnread && (
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"
              aria-label="Unread"
            />
          )}
        </div>

        {notification.body && (
          <p className="mt-0.5 line-clamp-2 font-body text-xs leading-5 text-navy-500">
            {notification.body}
          </p>
        )}

        <p className="mt-1 font-body text-[10px] font-semibold uppercase tracking-wider text-navy-400">
          {relativeTime(notification.created_at)}
        </p>
      </div>
    </div>
  );

  const hasLink = notification.link_path && notification.link_path !== '#';

  if (hasLink) {
    return (
      <Link
        to={notification.link_path}
        onClick={onClick}
        className="block"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left"
    >
      {content}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────────────────── */

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Lazy-load on first open
  useEffect(() => {
    if (!open || loaded) return undefined;
    setLoading(true);
    listMyNotifications()
      .then((n) => {
        setNotifications(n);
        setLoaded(true);
      })
      .catch(() => setLoaded(true))
      .finally(() => setLoading(false));
    return undefined;
  }, [open, loaded]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const hasUnread = loaded && unreadCount > 0;

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      /* silent — the UI just won't clear, user can retry */
    }
  }, []);

  const handleClickNotification = useCallback(async (n) => {
    if (n.is_read) return;
    try {
      await markNotificationRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
      );
    } catch {
      /* silent */
    }
  }, []);

  const unreadItems = notifications.filter((n) => !n.is_read);
  const readItems = notifications.filter((n) => n.is_read);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
          open
            ? 'bg-navy-100 text-navy-900'
            : 'text-navy-700 hover:bg-navy-50'
        )}
        aria-label={
          hasUnread
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={18} />

        {/* Animated badge */}
        <AnimatePresence>
          {hasUnread && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 font-body text-[10px] font-bold text-white shadow-sm"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-premium-lg"
            role="menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-navy-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="font-display text-sm font-bold text-navy-900">
                  Notifications
                </p>
                {hasUnread && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 font-body text-[10px] font-bold text-rose-700">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hasUnread && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    aria-label="Mark all as read"
                    title="Mark all as read"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700 lg:hidden"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[26rem] overflow-y-auto">
              {/* Loading */}
              {loading && (
                <div className="space-y-2 p-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl bg-navy-50/40 px-3 py-2.5"
                    >
                      <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-navy-100" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-navy-100" />
                        <div className="h-2.5 w-1/2 animate-pulse rounded bg-navy-100" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty */}
              {!loading && loaded && notifications.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-400">
                    <Inbox size={22} />
                  </span>
                  <p className="mt-3 font-body text-sm font-bold text-navy-900">
                    You&rsquo;re all caught up
                  </p>
                  <p className="mx-auto mt-1 max-w-[16rem] font-body text-xs leading-5 text-navy-400">
                    New notifications about courses, grades, and activity will appear here.
                  </p>
                </div>
              )}

              {/* Unread section */}
              {!loading && unreadItems.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                    New
                  </p>
                  <div className="space-y-0.5">
                    {unreadItems.map((n) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        onClick={() => handleClickNotification(n)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Read section */}
              {!loading && readItems.length > 0 && (
                <div className={cn('p-2', unreadItems.length > 0 && 'border-t border-navy-100')}>
                  {unreadItems.length > 0 && (
                    <p className="px-2 py-1.5 font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                      Earlier
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {readItems.map((n) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        onClick={() => handleClickNotification(n)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}