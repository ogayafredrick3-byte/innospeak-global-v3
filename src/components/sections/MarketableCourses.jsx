import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../lib/motion/presets';
import { COURSES } from '../../lib/data/programmeData.js';
import { getHighMarketabilityCourses, getMarketability } from '../../lib/data/marketability.js';
import { getGrouping } from '../../lib/data/registry.js';

/**
 * MarketableCourses — showcases high-demand courses.
 * Selection uses round-robin across pathways so the section is always
 * diverse (never 6 courses from one pathway) even when many high-demand
 * courses live in the same pathway.
 */

/**
 * Round-robin picker: takes one course from each pathway in turn until
 * `limit` is reached. Preserves pathway order as it appears in `courses`.
 */
function pickDiverse(courses, limit) {
  const byPathway = new Map();
  for (const c of courses) {
    const key = c.groupingCode || c.pathwayId || 'other';
    if (!byPathway.has(key)) byPathway.set(key, []);
    byPathway.get(key).push(c);
  }
  const buckets = [...byPathway.values()].sort((a, b) => b.length - a.length);
  const picked = [];
  let i = 0;
  let guard = 0;
  while (picked.length < limit && guard < courses.length * 3) {
    const bucket = buckets[i % buckets.length];
    if (bucket && bucket.length > 0) picked.push(bucket.shift());
    i++;
    guard++;
  }
  return picked;
}

export default function MarketableCourses({
  division = null,
  limit = 6,
  title = 'Most In-Demand Courses',
  subtitle = 'Courses aligned with Kenya and global employer demand in 2026.',
}) {
  const courses = useMemo(() => {
    const pool = division
      ? COURSES.filter((c) => (c.division || c.pillar) === division)
      : COURSES;
    return pickDiverse(getHighMarketabilityCourses(pool), limit);
  }, [division, limit]);

  if (courses.length === 0) return null;

  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-premium">
        <SectionHeading eyebrow="High Demand" title={title} subtitle={subtitle} />

        <motion.div
          variants={staggerContainer(0.06, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={inViewOnce}
          className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {courses.map((course) => {
            const grouping = getGrouping(course.groupingCode);
            const isFree = course.isFree === true;

            return (
              <motion.div
                key={course.code}
                variants={fadeUpItem}
                className="group flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg"
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/10 px-2.5 py-1 font-body text-[11px] font-bold uppercase tracking-wide text-gold-700">
                    <TrendingUp size={11} />
                    High Demand
                  </span>
                  {isFree && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/10 px-2.5 py-1 font-body text-[11px] font-bold uppercase tracking-wide text-gold-700">
                      <Sparkles size={11} />
                      Free
                    </span>
                  )}
                </div>

                {/* Code */}
                <span className="mt-4 font-mono text-xs font-semibold text-navy-400">
                  {course.code}
                </span>

                {/* Title */}
                <h3 className="mt-1 font-display text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700">
                  {course.name}
                </h3>

                {/* Pathway */}
                {grouping && (
                  <p className="mt-1 font-body text-xs font-semibold text-gold-600">
                    {grouping.title}
                  </p>
                )}

                {/* Description */}
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-navy-600 line-clamp-3">
                  {course.shortDescription}
                </p>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-navy-100 pt-4">
                  <span
                    className={`font-body text-sm font-bold ${
                      isFree ? 'text-gold-600' : 'text-navy-900'
                    }`}
                  >
                    {isFree ? 'Free' : course.fees || `KES ${(course.feesUSD || 0) * 130}`}
                  </span>
                  <Link
                    to={`/courses/${course.code}`}
                    className="inline-flex items-center gap-1 font-body text-sm font-semibold text-gold-700 hover:text-gold-800"
                  >
                    View course
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </motion.div>
            );
          })}
          </motion.div>

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <Link
            to={division === 'labs' ? '/labs' : division === 'academy' ? '/academy' : '/courses'}
            className="btn-outline inline-flex items-center gap-2"
          >
            Browse all {division === 'labs' ? 'Labs courses' : division === 'academy' ? 'Academy courses' : 'courses'}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}