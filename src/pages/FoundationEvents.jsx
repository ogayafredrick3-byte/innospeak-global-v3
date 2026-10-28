import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Filter, Search } from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import HeroBackground from '../components/ui/HeroBackground.jsx';
import EventCard from '../components/sections/foundation/EventCard.jsx';
import EventModal from '../components/sections/foundation/EventModal.jsx';
import EventRegistrationForm from '../components/sections/foundation/EventRegistrationForm.jsx';
import {
  FOUNDATION_EVENTS,
  EVENT_CATEGORIES,
  PUBLIC_STATUSES,
} from '../lib/data/eventsData.js';
import { getCustomEvents } from '../lib/data/eventStore.js';

const FLOATING_DOTS = [
  { left: '14%', top: '22%', size: 5, delay: 0, duration: 8 },
  { left: '84%', top: '26%', size: 4, delay: 1.2, duration: 10 },
  { left: '30%', top: '72%', size: 5, delay: 0.6, duration: 9 },
  { left: '72%', top: '68%', size: 3, delay: 1.8, duration: 11 },
];

function isUpcoming(event) {
  if (!event.date) return false;
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

export default function FoundationEvents() {
  const [allEvents, setAllEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showPast, setShowPast] = useState(false);
  const [openEvent, setOpenEvent] = useState(null);
  const [registerEvent, setRegisterEvent] = useState(null);

  const refresh = useCallback(() => {
    const custom = getCustomEvents().filter((e) => PUBLIC_STATUSES.includes(e.status));
    setAllEvents([...custom, ...FOUNDATION_EVENTS]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEvents
      .filter((e) => PUBLIC_STATUSES.includes(e.status))
      .filter((e) => (showPast ? true : isUpcoming(e)))
      .filter((e) => category === 'all' || e.category === category)
      .filter((e) => {
        if (!q) return true;
        return `${e.title} ${e.shortDescription} ${e.venue}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        // Upcoming ascending by date, past descending
        if (showPast) return new Date(b.date) - new Date(a.date);
        return new Date(a.date) - new Date(b.date);
      });
  }, [allEvents, query, category, showPast]);

  const upcomingCount = allEvents.filter((e) => PUBLIC_STATUSES.includes(e.status) && isUpcoming(e)).length;
  const pastCount = allEvents.filter((e) => PUBLIC_STATUSES.includes(e.status) && !isUpcoming(e)).length;

  return (
    <>
      <Seo
        title="Events & Opportunities — InnoSpeak Global Foundation"
        description="Upcoming Foundation events, STEM workshops, information sessions, scholarship deadlines and community outreach."
        path="/foundation/events"
      />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-32 pb-20 text-white md:pt-40 md:pb-24">
        <HeroBackground variant="professional" />
        <motion.div
          animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-gold-500/15 blur-[120px]"
          aria-hidden="true"
        />
        <motion.div
          animate={{ x: [0, -50, 40, 0], y: [0, 40, -30, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-emerald-400/20 blur-[100px]"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />

        {FLOATING_DOTS.map((dot, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute rounded-full bg-emerald-300/50"
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        ))}

        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 font-body text-[11px] font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
              <CalendarDays size={13} />
              Events & Opportunities
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] text-white sm:text-5xl md:text-6xl">
              Upcoming Events & Opportunities
            </h1>
            <p className="mt-5 max-w-2xl font-body text-base leading-[1.7] text-emerald-50/90 sm:text-lg">
              Foundation events, information sessions, STEM workshops and application deadlines
              are open to learners, communities and partners.
            </p>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/5 to-transparent" />
      </section>

      {/* ═══ Filters + listing ═══ */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-premium">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-navy-100 bg-white p-5 shadow-premium"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, workshops, deadlines..."
                  className="w-full rounded-xl border border-navy-100 bg-white py-3 pl-11 pr-4 font-body text-sm text-navy-900 outline-none transition placeholder:text-navy-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
                />
              </div>

              {/* Category select */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-navy-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl border border-navy-100 bg-white px-4 py-3 font-body text-sm text-navy-700 outline-none focus:border-emerald-500"
                >
                  <option value="all">All categories</option>
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Upcoming / Past toggle */}
              <div className="flex rounded-xl border border-navy-100 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setShowPast(false)}
                  className={`rounded-lg px-4 py-2 font-body text-sm font-semibold transition ${
                    !showPast ? 'bg-emerald-600 text-white' : 'text-navy-700 hover:text-emerald-700'
                  }`}
                >
                  Upcoming ({upcomingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setShowPast(true)}
                  className={`rounded-lg px-4 py-2 font-body text-sm font-semibold transition ${
                    showPast ? 'bg-emerald-600 text-white' : 'text-navy-700 hover:text-emerald-700'
                  }`}
                >
                  Past ({pastCount})
                </button>
              </div>
            </div>
          </motion.div>

          {/* Result count */}
          <p className="mt-6 font-body text-sm text-navy-500">
            {filtered.length === 0
              ? 'No events match your filters.'
              : `${filtered.length} ${filtered.length === 1 ? 'event' : 'events'} found.`}
          </p>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {filtered.map((event, i) => (
                <EventCard key={event.id} event={event} onOpen={setOpenEvent} index={i} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center">
              <CalendarDays size={32} className="mx-auto text-navy-300" />
              <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                No events found
              </h3>
              <p className="mt-2 font-body text-sm text-navy-500">
                Try changing your search or category filter.
              </p>
            </div>
          )}
        </div>
      </section>

      <EventModal
        event={openEvent}
        onClose={() => setOpenEvent(null)}
        onRegister={(evt) => {
          setOpenEvent(null);
          setRegisterEvent(evt);
        }}
      />

      <EventRegistrationForm
        event={registerEvent}
        open={!!registerEvent}
        onClose={() => setRegisterEvent(null)}
        onSubmit={() => refresh()}
      />
    </>
  );
}