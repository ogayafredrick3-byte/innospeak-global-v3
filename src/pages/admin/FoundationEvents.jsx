import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus, Search, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  FOUNDATION_EVENTS,
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  getCategory,
  getStatusLabel,
} from '../../lib/data/eventsData.js';
import {
  getCustomEvents,
  deleteEvent,
  updateEvent,
} from '../../lib/data/eventStore.js';

export default function FoundationEvents() {
  const [custom, setCustom] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const refresh = useCallback(() => {
    setCustom(getCustomEvents());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const allEvents = useMemo(() => [...custom, ...FOUNDATION_EVENTS], [custom]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEvents
      .filter((e) => statusFilter === 'all' || e.status === statusFilter)
      .filter((e) => {
        if (!q) return true;
        return `${e.title} ${e.venue} ${e.organizer}`.toLowerCase().includes(q);
      });
  }, [allEvents, query, statusFilter]);

  function handleDelete(id) {
    if (!window.confirm('Delete this event permanently?')) return;
    deleteEvent(id);
    refresh();
  }

  function handleTogglePublish(event) {
    const isPublished = ['published', 'upcoming', 'registration_open', 'registration_closed'].includes(event.status);
    updateEvent(event.id, {
      status: isPublished ? 'draft' : 'published',
    });
    refresh();
  }

  const counts = useMemo(() => {
    const map = { all: allEvents.length };
    EVENT_STATUSES.forEach((s) => {
      map[s.id] = allEvents.filter((e) => e.status === s.id).length;
    });
    return map;
  }, [allEvents]);

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-wider text-emerald-700">
                Foundation
              </p>
              <h1 className="font-display text-2xl font-bold text-navy-900">
                Events & Opportunities
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl font-body text-sm leading-6 text-navy-600">
            Publish workshops, information sessions, deadlines and community outreach events.
            Published events appear on the Foundation homepage and events page.
          </p>
        </div>
        <Link
          to="/admin/foundation/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
        >
          <Plus size={16} />
          Create Event
        </Link>
      </header>

      {/* Search + filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full rounded-2xl border border-navy-100 bg-white py-3 pl-11 pr-4 font-body text-sm outline-none transition placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-navy-100 bg-white px-4 py-3 font-body text-sm font-semibold text-navy-700 outline-none focus:border-emerald-500"
        >
          <option value="all">All statuses ({counts.all || 0})</option>
          {EVENT_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} ({counts[s.id] || 0})
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <CalendarDays size={24} className="text-emerald-600" />
          </div>
          <h3 className="mt-5 font-display text-lg font-bold text-navy-900">
            No events found
          </h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
            Create your first event, or change the search / filter above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => {
            const category = getCategory(event.category);
            const isCustom = custom.some((c) => c.id === event.id);
            const isPublished = ['published', 'upcoming', 'registration_open', 'registration_closed'].includes(event.status);

            return (
              <div
                key={event.id}
                className="flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
              >
                {/* Left: info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {category?.label || event.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${
                        isPublished
                          ? 'bg-emerald-600 text-white'
                          : 'bg-navy-100 text-navy-700'
                      }`}
                    >
                      {getStatusLabel(event.status)}
                    </span>
                    {!isCustom && (
                      <span className="rounded-full bg-cream px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-navy-500 ring-1 ring-navy-100">
                        Seed data
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold text-navy-900">
                    {event.title}
                  </h3>
                  <p className="mt-1 font-body text-xs text-navy-500">
                    {new Date(event.date).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                    {event.startTime && ` · ${event.startTime}`}
                    {event.venue && ` · ${event.venue}`}
                  </p>
                </div>

                {/* Right: actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {isCustom && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(event)}
                        aria-label={isPublished ? 'Unpublish' : 'Publish'}
                        title={isPublished ? 'Unpublish' : 'Publish'}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 text-navy-600 transition hover:border-emerald-400 hover:text-emerald-700"
                      >
                        {isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <Link
                        to={`/admin/foundation/events/${event.id}`}
                        aria-label="Edit"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 text-navy-600 transition hover:border-emerald-400 hover:text-emerald-700"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id)}
                        aria-label="Delete"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 text-navy-600 transition hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                  {!isCustom && (
                    <span className="rounded-lg border border-navy-100 px-3 py-2 font-body text-[11px] text-navy-400">
                      Edit in eventsData.js
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}