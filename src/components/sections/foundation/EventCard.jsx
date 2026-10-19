import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { getCategory, getTypeLabel, getStatusLabel } from '../../../lib/data/eventsData.js';

const ACCENT_STYLES = {
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    icon: 'from-emerald-600 to-emerald-700',
  },
  gold: {
    badge: 'bg-gold-500/10 text-gold-700',
    dot: 'bg-gold-500',
    icon: 'from-gold-500 to-gold-600',
  },
  navy: {
    badge: 'bg-navy-50 text-navy-700',
    dot: 'bg-navy-700',
    icon: 'from-navy-700 to-navy-900',
  },
};

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function EventCard({ event, onOpen, index = 0 }) {
  const category = getCategory(event.category);
  const accent = ACCENT_STYLES[category?.accent] || ACCENT_STYLES.emerald;

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(event)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white text-left shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-premium-lg"
    >
      {/* Cover / placeholder */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-50 to-navy-50">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-5xl font-bold text-emerald-700/25">
              {formatDate(event.date).split(' ')[1] || 'EVT'}
            </span>
          </div>
        )}

        {category && (
          <span
            className={`absolute left-4 top-4 rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/40 backdrop-blur-sm ${accent.badge}`}
          >
            {category.label}
          </span>
        )}

        {event.featured && (
          <span className="absolute right-4 top-4 rounded-full bg-navy-900 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-400">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
          <span className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-500">
            {getStatusLabel(event.status)}
          </span>
        </div>

        <h3 className="mt-2 font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-emerald-700">
          {event.title}
        </h3>

        <p className="mt-2 flex-1 line-clamp-2 font-body text-sm leading-6 text-navy-600">
          {event.shortDescription}
        </p>

        <div className="mt-4 space-y-1.5 font-body text-xs text-navy-500">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(event.date)}
            {event.startTime && ` · ${event.startTime}`}
          </span>
          {event.venue && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} />
              <span className="truncate">{event.venue}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users size={12} />
            {getTypeLabel(event.eventType)}
            {event.capacity && ` · ${event.capacity} seats`}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-4">
          <span className="font-body text-xs font-semibold text-navy-500">
            {event.registrationDeadline ? `Reg. by ${formatDate(event.registrationDeadline)}` : 'Open registration'}
          </span>
          <span className="inline-flex items-center gap-1 font-body text-sm font-bold text-emerald-700 transition-all duration-300 group-hover:gap-2">
            View
            <span className="text-[14px]">→</span>
          </span>
        </div>
      </div>
    </motion.button>
  );
}