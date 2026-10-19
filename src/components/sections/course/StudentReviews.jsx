import { motion } from 'framer-motion';
import { Star, Quote, MessageSquare } from 'lucide-react';
import SectionHeading from '../../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../../lib/motion/presets';

const container = staggerContainer(0.1, 0.05);

function getInitials(name) {
  return String(name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function StudentReviews({ course }) {
  const reviews = course.reviews || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-premium">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
        >
          <div className="mb-12 sm:mb-14 lg:mb-16">
            <SectionHeading
              eyebrow="Student Reviews"
              title="What Our Students Say"
              subtitle={
                reviews.length > 0
                  ? 'Real stories from learners who completed this course.'
                  : 'Reviews from learners who complete this course will appear here.'
              }
            />
          </div>

          {/* ── Empty state ── */}
          {reviews.length === 0 ? (
            <motion.div
              variants={fadeUpItem}
              className="mx-auto max-w-3xl rounded-2xl border border-dashed border-navy-200 bg-cream/40 px-6 py-16 text-center shadow-premium sm:px-10 sm:py-20"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
                <MessageSquare size={24} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900 sm:text-xl">
                No reviews yet
              </h3>
              <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-navy-500">
                Be the first to share your experience. Reviews from verified learners are
                published here as they complete the course.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Rating summary */}
              <motion.div
                variants={fadeUpItem}
                className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-gold-200 bg-gold-50/60 px-6 py-5 sm:flex-row sm:justify-center sm:gap-6 sm:py-6"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-navy-900">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="font-body text-sm text-navy-500">/ 5</span>
                </div>
                <div className="flex flex-col items-center gap-1 sm:items-start">
                  <div className="flex gap-0.5" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={18}
                        className={
                          s < Math.round(averageRating)
                            ? 'fill-gold-500 text-gold-500'
                            : 'text-navy-200'
                        }
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="font-body text-xs text-navy-600">
                    Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}
                  </span>
                </div>
              </motion.div>

              {/* Reviews grid */}
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                {reviews.map((review, i) => (
                  <motion.article
                    key={i}
                    variants={fadeUpItem}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex h-full flex-col rounded-2xl border border-navy-100 bg-cream p-6 shadow-premium transition-all duration-300 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7"
                  >
                    <Quote size={26} className="text-gold-300" aria-hidden="true" />

                    <div
                      className="mt-3 flex gap-0.5"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          size={15}
                          className={
                            s < review.rating
                              ? 'fill-gold-500 text-gold-500'
                              : 'text-navy-100'
                          }
                          aria-hidden="true"
                        />
                      ))}
                    </div>

                    <p className="mt-4 flex-1 font-body text-sm leading-6 text-navy-600">
                      &ldquo;{review.text}&rdquo;
                    </p>

                    <div className="mt-6 flex items-center gap-3 border-t border-navy-100 pt-5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 font-body text-xs font-bold text-gold-400">
                        {getInitials(review.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-body text-sm font-bold text-navy-900">
                          {review.name}
                        </p>
                        {review.country && (
                          <p className="truncate font-body text-xs text-navy-400">
                            {review.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}