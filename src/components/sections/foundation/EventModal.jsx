import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, MapPin, Users, ExternalLink, Mail, Phone, AlertCircle,
} from 'lucide-react';
import {
  getCategory,
  getStatusLabel,
  getTypeLabel,
} from '../../../lib/data/eventsData.js';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function EventModal({ event, onClose, onRegister }) {
  useEffect(() => {
    if (!event) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm sm:p-8"
          onClick={onClose}
        >
          <motion.article
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-premium-lg"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-md transition hover:bg-white"
            >
              <X size={18} />
            </button>

            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-navy-900 sm:h-56">
              {event.coverImage ? (
                <img src={event.coverImage} alt={event.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-display text-6xl font-bold text-white/20">
                    {formatDate(event.date).split(' ')[0]?.slice(0, 3).toUpperCase() || 'EVT'}
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <div className="flex flex-wrap items-center gap-2">
                {getCategory(event.category) && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {getCategory(event.category).label}
                  </span>
                )}
                <span className="rounded-full bg-navy-900 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-400">
                  {getStatusLabel(event.status)}
                </span>
                <span className="rounded-full bg-cream px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-navy-700 ring-1 ring-navy-100">
                  {getTypeLabel(event.eventType)}
                </span>
              </div>

              <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl lg:text-4xl">
                {event.title}
              </h2>

              <p className="mt-3 font-body text-base leading-7 text-navy-600">
                {event.shortDescription}
              </p>

              <div className="mt-6 grid gap-4 rounded-2xl border border-navy-100 bg-cream/50 p-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="mt-0.5 text-emerald-600" />
                  <div>
                    <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">Date</p>
                    <p className="mt-0.5 font-body text-sm font-semibold text-navy-900">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                {(event.startTime || event.endTime) && (
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">Time</p>
                      <p className="mt-0.5 font-body text-sm font-semibold text-navy-900">
                        {event.startTime}{event.endTime && ` – ${event.endTime}`}
                      </p>
                    </div>
                  </div>
                )}

                {event.venue && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">Venue</p>
                      <p className="mt-0.5 font-body text-sm font-semibold text-navy-900">{event.venue}</p>
                    </div>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-start gap-3">
                    <Users size={18} className="mt-0.5 text-emerald-600" />
                    <div>
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">Capacity</p>
                      <p className="mt-0.5 font-body text-sm font-semibold text-navy-900">
                        {event.capacity} seats
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {event.fullDescription && (
                <div className="mt-8">
                  <h3 className="font-display text-lg font-bold text-navy-900">About this event</h3>
                  <div className="mt-3 whitespace-pre-line font-body text-sm leading-7 text-navy-700">
                    {event.fullDescription}
                  </div>
                </div>
              )}

              <div className="mt-8 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 sm:grid-cols-2">
                <div>
                  <p className="font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">Organised by</p>
                  <p className="mt-1 font-body text-sm font-bold text-navy-900">
                    {event.organizer || 'InnoSpeak Global Foundation'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {event.contactEmail && (
                    <a href={`mailto:${event.contactEmail}`} className="flex items-center gap-2 font-body text-sm text-navy-700 hover:text-emerald-700">
                      <Mail size={13} />
                      {event.contactEmail}
                    </a>
                  )}
                  {event.contactPhone && (
                    <a href={`tel:${event.contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-2 font-body text-sm text-navy-700 hover:text-emerald-700">
                      <Phone size={13} />
                      {event.contactPhone}
                    </a>
                  )}
                </div>
              </div>

              {event.registrationDeadline && event.status === 'registration_open' && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50/70 px-4 py-3">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-gold-700" />
                  <p className="font-body text-sm text-gold-800">
                    <strong>Registration closes</strong> on {formatDate(event.registrationDeadline)}.
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 border-t border-navy-100 pt-6 sm:flex-row">
                {event.status === 'registration_open' && event.registrationMethod === 'internal' && (
                  <button
                    type="button"
                    onClick={() => onRegister(event)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                  >
                    Register for This Event
                  </button>
                )}
                {event.registrationMethod === 'external' && event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-3 font-body text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                  >
                    Register on External Site
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3 font-body text-sm font-bold text-navy-900 transition-colors hover:border-emerald-400 hover:text-emerald-700"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}