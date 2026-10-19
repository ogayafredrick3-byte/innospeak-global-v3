import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import EventCard from './EventCard.jsx';
import EventModal from './EventModal.jsx';
import EventRegistrationForm from './EventRegistrationForm.jsx';
import {
  FOUNDATION_EVENTS,
  PUBLIC_STATUSES,
  EVENTS_INTRO,
} from '../../../lib/data/eventsData.js';
import { getCustomEvents } from '../../../lib/data/eventStore.js';

const MAX_SHOWN = 3;

function isUpcoming(event) {
  if (!event.date) return false;
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

export default function UpcomingEvents() {
  const [allEvents, setAllEvents] = useState([]);
  const [openEvent, setOpenEvent] = useState(null);
  const [registerEvent, setRegisterEvent] = useState(null);

  const refresh = useCallback(() => {
    const custom = getCustomEvents().filter((e) => PUBLIC_STATUSES.includes(e.status));
    setAllEvents([...custom, ...FOUNDATION_EVENTS]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upcoming = useMemo(() => {
    return allEvents
      .filter((e) => PUBLIC_STATUSES.includes(e.status))
      .filter(isUpcoming)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, MAX_SHOWN);
  }, [allEvents]);

  if (upcoming.length === 0) return null;

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-premium">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={EVENTS_INTRO.eyebrow}
            title={EVENTS_INTRO.title}
            subtitle={EVENTS_INTRO.subtitle}
          />
          <Link
            to="/foundation/events"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-emerald-400 hover:text-emerald-700"
          >
            <CalendarDays size={16} />
            View All Events
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {upcoming.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              onOpen={setOpenEvent}
              index={i}
            />
          ))}
        </div>
      </div>

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
    </section>
  );
}