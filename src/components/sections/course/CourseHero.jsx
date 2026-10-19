import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Clock, BarChart3, Monitor, Award, Info, GraduationCap,
  ChevronRight, ArrowRight, Sparkles,
} from 'lucide-react';
import { Button } from '../../ui';
import { staggerContainer, fadeUpItem, easeOutExpo } from '../../../lib/motion/presets';
import { PATHWAYS, TRACKS } from '../../../lib/data/programmeData.js';
import HeroBackground from '../../ui/HeroBackground.jsx';

/**
 * CourseHero — top of every course page.
 * Breadcrumb (Home / Programs / Pathway / Code) → code + pathway badge →
 * name → info pills → status → enrollment card.
 *
 * Accepts an optional `grouping` prop (pre-resolved Academy pathway or Labs
 * track). Falls back to resolving it from `course.pathwayId`.
 */

const container = staggerContainer(0.1, 0.05);

export default function CourseHero({ course, grouping: groupingProp }) {
  const isFree = course.isFree === true;
  const isLabs = course.division === 'labs' || course.pillar === 'labs';

  // Resolve the parent program for the breadcrumb.
  const grouping = useMemo(() => {
    if (groupingProp) return groupingProp;
    if (!course.pathwayId) return null;
    return (
      PATHWAYS.find((p) => p.id === course.pathwayId) ||
      TRACKS.find((t) => t.id === course.pathwayId) ||
      null
    );
  }, [groupingProp, course.pathwayId]);

  const INFO_PILLS = [
    { icon: BarChart3, label: 'Level', value: course.level },
    { icon: Monitor, label: 'Mode', value: course.studyMode },
    { icon: Clock, label: 'Duration', value: course.duration },
    { icon: Award, label: 'Language', value: course.language },
  ].filter((p) => p.value);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-white to-cream pb-14 pt-28 sm:pb-16 sm:pt-32 lg:pb-20 lg:pt-36">
      <HeroBackground variant="homepage" />
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-navy-900/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-premium relative">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
          {/* ═══ Left column ═══ */}
          <motion.div variants={container} initial="hidden" animate="visible">
            {/* Breadcrumb — Home / Programs / [Pathway] / CODE */}
            <motion.nav
              variants={fadeUpItem}
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 font-body text-xs font-semibold text-navy-500"
            >
              <Link to="/" className="transition-colors hover:text-navy-900">
                Home
              </Link>
              <ChevronRight size={12} className="text-navy-300" aria-hidden="true" />
              <Link to="/programs" className="transition-colors hover:text-navy-900">
                Programs
              </Link>
              {grouping && (
                <>
                  <ChevronRight size={12} className="text-navy-300" aria-hidden="true" />
                  <Link
                    to={`/programs/${grouping.slug}`}
                    className="max-w-[14rem] truncate transition-colors hover:text-navy-900"
                  >
                    {grouping.title}
                  </Link>
                </>
              )}
              <ChevronRight size={12} className="text-navy-300" aria-hidden="true" />
              <span className="font-mono text-gold-700">{course.code}</span>
            </motion.nav>

            {/* Code + pathway */}
            <motion.div variants={fadeUpItem} className="mt-5 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center rounded-full bg-navy-900 px-3.5 py-1.5 font-mono text-xs font-bold text-gold-400">
                {course.code}
              </span>
              {course.pathway && (
                <span className="inline-flex items-center rounded-full bg-gold-500/10 px-3.5 py-1.5 font-body text-[11px] font-bold uppercase tracking-wider text-gold-700 ring-1 ring-gold-500/20">
                  {course.pathway}
                </span>
              )}
              {isFree && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 font-body text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  <Sparkles size={11} aria-hidden="true" />
                  Free
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUpItem}
              className="mt-5 font-display text-3xl font-bold leading-[1.12] text-navy-900 sm:text-4xl lg:text-[2.75rem]"
            >
              {course.name}
            </motion.h1>

            {/* Academy/division line */}
            <motion.p
              variants={fadeUpItem}
              className="mt-3 font-body text-sm font-medium text-navy-500"
            >
              {course.academy}
            </motion.p>

            {/* Short description */}
            {course.shortDescription && (
              <motion.p
                variants={fadeUpItem}
                className="mt-5 max-w-2xl font-body text-base leading-[1.7] text-navy-600"
              >
                {course.shortDescription}
              </motion.p>
            )}

            {/* Info pills */}
            {INFO_PILLS.length > 0 && (
              <motion.div variants={fadeUpItem} className="mt-6 flex flex-wrap gap-2.5">
                {INFO_PILLS.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-3.5 py-2 font-body text-xs font-medium text-navy-700 shadow-premium"
                  >
                    <Icon size={14} className="text-gold-600" aria-hidden="true" />
                    <span className="font-semibold text-navy-900">{label}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </motion.div>
            )}

          </motion.div>

          {/* ═══ Right column — enrollment card ═══ */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <div className="relative overflow-hidden rounded-3xl border border-navy-100 bg-white p-6 shadow-premium-lg sm:p-7">
              {/* Top: icon + division badge */}
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-400">
                  <GraduationCap size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span className="rounded-full bg-gold-500/10 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
                  {isLabs ? 'Labs' : 'Academy'}
                </span>
              </div>

              {/* Pricing */}
              <div className="mt-5 border-t border-navy-100 pt-5">
                <p className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                  {isFree ? 'Learning Access' : 'Indicative Course Fee'}
                </p>
                <p
                  className={`mt-1 font-display text-3xl font-bold ${
                    isFree ? 'text-emerald-600' : 'text-navy-900'
                  }`}
                >
                  {isFree ? 'Free' : course.fees}
                </p>
                {!isFree && (
                  <p className="mt-1 font-body text-xs text-navy-500">
                    The published catalogue fee is shown here. Available checkout methods are displayed during enrolment; live cohorts are announced separately.
                  </p>
                )}
                {isFree && course.certificatePriceUSD > 0 && (
                  <p className="mt-1 font-body text-xs text-navy-500">
                    Certificate pricing, if applicable, is separate and must be confirmed.
                  </p>
                )}
              </div>

              {/* Key info */}
              <dl className="mt-5 space-y-2.5 border-t border-navy-100 pt-5">
                <div className="flex items-center justify-between font-body text-xs">
                  <dt className="text-navy-500">Duration</dt>
                  <dd className="font-semibold text-navy-900">{course.duration || '—'}</dd>
                </div>
                <div className="flex items-center justify-between font-body text-xs">
                  <dt className="text-navy-500">Study Mode</dt>
                  <dd className="font-semibold text-navy-900">{course.studyMode || '—'}</dd>
                </div>
                <div className="flex items-center justify-between font-body text-xs">
                  <dt className="text-navy-500">Level</dt>
                  <dd className="font-semibold text-navy-900">{course.level || '—'}</dd>
                </div>
                <div className="flex items-center justify-between font-body text-xs">
                  <dt className="text-navy-500">Credential</dt>
                  <dd className="max-w-[12rem] truncate text-right font-semibold text-navy-900">
                    {course.certification || 'To be confirmed'}
                  </dd>
                </div>
              </dl>

              {/* CTAs */}
              <div className="mt-6 space-y-2.5 border-t border-navy-100 pt-5">
                <Button
                  to={`/courses/${course.code}#course-enrolment`}
                  variant="gold"
                  size="lg"
                  className="w-full justify-center"
                >
                  {isFree ? 'Start Learning Free' : 'Enroll in Course'}
                  <ArrowRight size={16} className="ml-2" aria-hidden="true" />
                </Button>
                <Link
                  to="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-3 font-body text-sm font-bold text-navy-900 transition-all duration-300 hover:border-gold-400 hover:text-gold-700"
                >
                  <Info size={15} aria-hidden="true" />
                  Request Information
                </Link>
              </div>

              {/* Reassurance */}
              <p className="mt-4 text-center font-body text-[11px] text-navy-400">
                {isFree
                  ? 'Certificate eligibility depends on the course completion criteria'
                  : 'Secure checkout; access activates after payment confirmation'}
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}