import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, Play } from 'lucide-react';
import { STORY_CATEGORY_LABELS } from './foundationStoriesData.js';

const CATEGORY_STYLES = {
  sponsor: 'bg-gold-500/10 text-gold-700',
  learner: 'bg-emerald-50 text-emerald-700',
  activity: 'bg-navy-50 text-navy-700',
  review: 'bg-violet-50 text-violet-700',
};

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// Very light markdown: **bold** and paragraph breaks. Keeps content readable
// without pulling in a dependency.
function renderBody(text) {
  return text.split('\n\n').map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-4 font-body text-base leading-7 text-navy-700">
        {parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**') ? (
            <strong key={j} className="font-semibold text-navy-900">
              {p.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{p}</span>
          )
        )}
      </p>
    );
  });
}

export default function StoryModal({ story, onClose }) {
  useEffect(() => {
    if (!story) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [story, onClose]);

  return (
    <AnimatePresence>
      {story && (
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
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close story"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow-md transition hover:bg-white"
            >
              <X size={18} />
            </button>

            {/* Hero image */}
            {story.image ? (
              <div className="aspect-[16/9] w-full overflow-hidden bg-cream">
                <img src={story.image} alt={story.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-emerald-100 via-emerald-50 to-navy-50 sm:h-56">
                <span className="font-display text-6xl font-bold text-emerald-700/30">
                  {story.author.avatar}
                </span>
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              {/* Category + date */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[story.category]}`}
                >
                  {STORY_CATEGORY_LABELS[story.category]}
                </span>
                {story.date && (
                  <span className="inline-flex items-center gap-1.5 font-body text-xs text-navy-500">
                    <Calendar size={12} />
                    {formatDate(story.date)}
                  </span>
                )}
                {story.readMinutes && (
                  <span className="inline-flex items-center gap-1.5 font-body text-xs text-navy-500">
                    <Clock size={12} />
                    {story.readMinutes} min
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl lg:text-4xl">
                {story.title}
              </h2>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3 border-y border-navy-100 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-body text-xs font-bold text-emerald-700">
                  {story.author.avatar}
                </span>
                <div>
                  <div className="font-body text-sm font-bold text-navy-900">
                    {story.author.name}
                  </div>
                  <div className="font-body text-xs text-navy-500">{story.author.role}</div>
                </div>
                {story.location && (
                  <div className="ml-auto inline-flex items-center gap-1.5 font-body text-xs text-navy-500">
                    <MapPin size={12} />
                    {story.location}
                  </div>
                )}
              </div>

              {/* Video (if any) */}
              {story.video && (
                <a
                  href={story.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center gap-3 rounded-2xl border border-navy-100 bg-cream/60 p-4 transition hover:border-emerald-300"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-gold-400">
                    <Play size={16} fill="currentColor" />
                  </span>
                  <span className="font-body text-sm font-semibold text-navy-900">
                    Watch the full story
                  </span>
                </a>
              )}

              {/* Article body */}
              <div className="mt-6">{renderBody(story.body)}</div>

              {/* Gallery */}
              {story.gallery && story.gallery.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {story.gallery.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Footer CTA */}
              <div className="mt-8 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6">
                <p className="font-display text-lg font-bold text-navy-900">
                  Want to write the next story?
                </p>
                <p className="mt-1 font-body text-sm text-navy-600">
                  Fund a scholarship or sponsor an initiative. Your contribution will be shown here.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <a
                    href="/contact?interest=foundation-donate"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-2.5 font-body text-sm font-bold text-white shadow-md"
                  >
                    Donate
                  </a>
                  <a
                    href="/contact?interest=foundation-sponsor-learner"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-2.5 font-body text-sm font-bold text-navy-900 hover:border-emerald-400"
                  >
                    Sponsor a Learner
                  </a>
                </div>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}