import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowRight, Star } from 'lucide-react';
import { STORY_CATEGORY_LABELS } from './foundationStoriesData.js';

const CATEGORY_STYLES = {
  sponsor: { bg: 'bg-gold-500/10', text: 'text-gold-700', ring: 'ring-gold-500/25' },
  learner: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-500/25' },
  activity: { bg: 'bg-navy-50', text: 'text-navy-700', ring: 'ring-navy-500/20' },
  review: { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-500/25' },
};

export default function StoryCard({ story, onOpen, index = 0 }) {
  const style = CATEGORY_STYLES[story.category] || CATEGORY_STYLES.activity;
  const categoryLabel = STORY_CATEGORY_LABELS[story.category] || 'Story';

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(story)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white text-left shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-premium-lg"
    >
      {/* Image / placeholder */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-emerald-100 via-emerald-50 to-navy-50">
        {story.image ? (
          <img
            src={story.image}
            alt={story.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-4xl font-bold text-emerald-700/30">
              {story.author.avatar}
            </span>
          </div>
        )}

        {/* Category badge */}
        <span
          className={`absolute left-4 top-4 rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ring-1 backdrop-blur-sm ${style.bg} ${style.text} ${style.ring}`}
        >
          {categoryLabel}
        </span>

        {/* Featured pill */}
        {story.featured && (
          <span className="absolute right-4 top-4 rounded-full bg-navy-900 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-400">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-emerald-700">
          {story.title}
        </h3>

        <p className="mt-2 flex-1 line-clamp-3 font-body text-sm leading-6 text-navy-600">
          {story.excerpt}
        </p>

        {/* Rating (reviews only) */}
        {story.category === 'review' && story.rating ? (
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={14}
                className={
                  n <= story.rating
                    ? 'fill-emerald-500 text-emerald-500'
                    : 'text-navy-200'
                }
              />
            ))}
            <span className="ml-1 font-body text-xs font-semibold text-navy-700">
              {story.rating}.0
            </span>
          </div>
        ) : null}

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[11px] text-navy-500">
          {story.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} />
              {story.location}
            </span>
          )}
          {story.readMinutes && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {story.readMinutes} min read
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-body text-[10px] font-bold text-emerald-700">
              {story.author.avatar}
            </span>
            <span className="font-body text-xs font-semibold text-navy-700">
              {story.author.name}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 font-body text-sm font-bold text-emerald-700 transition-all duration-300 group-hover:gap-2">
            Read
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}