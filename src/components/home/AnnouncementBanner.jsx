import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, X, Sparkles, Gift, FlaskConical, Award,
} from 'lucide-react';
import { ANNOUNCEMENTS, ROTATION_INTERVAL } from './announcementData.js';

const ICONS = {
  sparkles: Sparkles,
  gift: Gift,
  flask: FlaskConical,
  award: Award,
};

export default function AnnouncementBanner() {
  const [open, setOpen] = useState(true);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-rotate through announcements
  useEffect(() => {
    if (!open || paused) return;
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % ANNOUNCEMENTS.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [open, paused]);

  if (!open) return null;

  const item = ANNOUNCEMENTS[current];
  const Icon = ICONS[item.icon] || Sparkles;

  return (
    <div
      className="relative z-40 overflow-hidden bg-gold-500 text-navy-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-premium relative min-h-11 px-12 py-2.5 sm:px-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center gap-1.5 text-center sm:flex-row sm:gap-3"
          >
            {/* Icon */}
            <span className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-950/10 text-navy-950 sm:inline-flex">
              <Icon size={12} strokeWidth={2.5} />
            </span>

            {/* Pill */}
            <span className="inline-flex shrink-0 items-center rounded-full bg-navy-950 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-white">
              {item.pill}
            </span>

            {/* Message */}
            <p className="font-body text-xs font-semibold sm:text-sm">
              {item.message}
            </p>

            {/* CTA */}
            {item.cta && (
              <Link
                to={item.cta.to}
                className="inline-flex shrink-0 items-center gap-1 font-body text-xs font-extrabold underline underline-offset-2 transition hover:no-underline sm:text-sm"
              >
                {item.cta.label}
                <ArrowRight size={13} />
              </Link>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-1">
          {ANNOUNCEMENTS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to announcement ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-4 bg-navy-950'
                  : 'w-1 bg-navy-950/30 hover:bg-navy-950/60'
              }`}
            />
          ))}
        </div>

        {/* Dismiss */}
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition hover:bg-navy-950/10 sm:right-6"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}