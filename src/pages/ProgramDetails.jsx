import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  GraduationCap,
  Layers3,
  FlaskConical,
  CheckCircle2,
  Compass,
  Info,
  Sparkles,
} from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import HeroSlider from '../components/home/HeroSlider.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../lib/motion/presets';
import {
  getProgramBySlug,
  getProgramCourses,
  getProgramDurationSummary,
  getProgramStudyModes,
  getProgramLevels,
  getProgramCta,
  PATHWAYS,
  TRACKS,
} from '../lib/data/programmeData.js';

/* ──────────────────────────────────────────────────────────────
   Hero floating dots
   ────────────────────────────────────────────────────────────── */

const HERO_DOTS = [
  { left: '12%', top: '24%', size: 5, delay: 0, duration: 9 },
  { left: '82%', top: '26%', size: 4, delay: 1.2, duration: 11 },
  { left: '26%', top: '72%', size: 6, delay: 0.6, duration: 10 },
  { left: '72%', top: '68%', size: 3, delay: 1.8, duration: 12 },
];

const GRID_STYLE = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
  backgroundSize: '64px 64px',
};

/* ──────────────────────────────────────────────────────────────
   Not-found state
   ────────────────────────────────────────────────────────────── */

function ProgramNotFound({ slug }) {
  return (
    <>
      <Seo
        title="Program Not Found"
        description="This program could not be found."
        path={`/programs/${slug || ''}`}
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-32 pb-24">
        <HeroBackground />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={GRID_STYLE}
          aria-hidden="true"
        />
        <div className="container-premium relative z-10 text-center">
          <Compass size={40} className="mx-auto text-gold-400" aria-hidden="true" />
          <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">
            Program not found
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-sm leading-6 text-navy-200 sm:text-base">
            This program may have been renamed or is no longer available.
          </p>
          <Link
            to="/programs"
            className="btn-gold mt-8 inline-flex items-center gap-2 px-7 py-3"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Programs
          </Link>
        </div>
      </section>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   Course card
   ────────────────────────────────────────────────────────────── */

function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.code}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3">
        <span className="rounded-full bg-gold-500/10 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700 ring-1 ring-gold-500/20">
          {course.level}
        </span>
        <span className="font-mono text-[11px] font-semibold text-navy-400">
          {course.code}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {course.featured && (
          <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-gold-500/15 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
            <Sparkles size={10} aria-hidden="true" />
            Featured
          </span>
        )}

        <h3 className="font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700 sm:text-lg">
          {course.name}
        </h3>

        <p className="mt-2 flex-1 line-clamp-3 font-body text-sm leading-6 text-navy-500">
          {course.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-navy-100 pt-4 font-body text-xs text-navy-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={13} className="text-gold-600" aria-hidden="true" />
            {course.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={13} className="text-gold-600" aria-hidden="true" />
            {course.studyMode}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-end border-t border-navy-100 pt-3">
          <span className="inline-flex items-center gap-1 font-body text-sm font-semibold text-gold-700 transition-all duration-300 group-hover:gap-2">
            View course
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────
   Related program card
   ────────────────────────────────────────────────────────────── */

function RelatedProgramCard({ program }) {
  return (
    <Link
      to={`/programs/${program.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-6"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold text-navy-400">
          {program.code}
        </span>
        <ArrowRight
          size={15}
          className="text-navy-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-gold-600"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-3 font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700">
        {program.title}
      </h3>
      <p className="mt-2 line-clamp-3 font-body text-sm leading-6 text-navy-500">
        {program.shortDescription}
      </p>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────
   Program view (all hooks live here, unconditionally)
   ────────────────────────────────────────────────────────────── */

function ProgramView({ program }) {
  const programId = program.id;
  const isLabs = program.division === 'labs';

  const courses = useMemo(() => getProgramCourses(programId), [programId]);
  const durationSummary = useMemo(
    () => getProgramDurationSummary(programId),
    [programId]
  );
  const studyModes = useMemo(() => getProgramStudyModes(programId), [programId]);
  const levels = useMemo(() => getProgramLevels(programId), [programId]);

  // Aggregate unique entry requirements across the program's courses
  const entryRequirements = useMemo(() => {
    const all = courses.flatMap((c) => c.entryRequirements || []);
    return [...new Set(all)];
  }, [courses]);

  // Sibling programs in the same division
  const relatedPrograms = useMemo(() => {
    const pool = isLabs ? TRACKS : PATHWAYS;
    return pool
      .filter(
        (p) =>
          p.id !== programId &&
          (p.status === 'active' || p.status === 'coming_soon')
      )
      .slice(0, 3);
  }, [programId, isLabs]);

  const cta = getProgramCta(program);
  const isComingSoon = program.status === 'coming_soon';

  // Defensive: never link a program's primary CTA back to itself,
  // and never render a dead "Coming Soon" button in the hero.
  const isSelfLink = cta.to === `/programs/${program.slug}`;
  const primaryCta = cta.disabled
    ? { label: 'Contact Admissions', to: '/contact', disabled: false }
    : isSelfLink
      ? {
          label: 'Browse Courses',
          to: `/courses?pathway=${program.id}`,
          disabled: false,
        }
      : cta;

  // Version — Pathways use curriculumVersion, Tracks use trackVersion
  const version =
    program.curriculumVersion ||
    program.trackVersion ||
    program.programVersion ||
    null;

  const badgeRing = isLabs
    ? 'border-white/15 bg-white/10 text-white/90'
    : 'border-gold-500/30 bg-gold-500/10 text-gold-300';

  const accentTextClass = 'text-gold-300';

  return (
    <>
      <Seo
        title={`${program.title} — InnoSpeak Global`}
        description={program.shortDescription}
        path={`/programs/${program.slug}`}
      />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-28 pb-16 md:pt-32 md:pb-20">
          <HeroSlider showIndicators={false} autoRotate={false} />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={GRID_STYLE}
          aria-hidden="true"
        />

        {/* Animated orbs */}
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-gold-500/15 blur-[120px]"
          aria-hidden="true"
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 20, -20, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-[110px]"
          aria-hidden="true"
        />

        {/* Floating dots */}
        {HERO_DOTS.map((dot, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute rounded-full bg-gold-400/40"
            style={{
              left: dot.left,
              top: dot.top,
              width: dot.size,
              height: dot.size,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: dot.duration,
              delay: dot.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
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
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 font-body text-xs font-semibold text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              All Programs
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm ${badgeRing}`}
              >
                {isLabs ? (
                  <FlaskConical size={11} aria-hidden="true" />
                ) : (
                  <GraduationCap size={11} aria-hidden="true" />
                )}
                {isLabs ? 'Labs Track' : 'Academy Pathway'}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                {program.code}
              </span>
              {isComingSoon && (
                <span className="rounded-full border border-gold-400/40 bg-gold-500/10 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-gold-300">
                  Coming Soon
                </span>
              )}
            </div>

            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.12] text-white sm:text-5xl">
              {program.title}
            </h1>

            <p className="mt-5 max-w-2xl font-body text-base leading-[1.7] text-navy-200 sm:text-lg">
              {program.shortDescription}
            </p>

            {/* Meta row */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-body text-sm text-white/75">
              <span className="inline-flex items-center gap-2">
                <Layers3 size={15} className={accentTextClass} aria-hidden="true" />
                {courses.length} {courses.length === 1 ? 'course' : 'courses'}
              </span>
              {levels.length > 0 && (
                <span className="inline-flex items-center gap-2">
                  <GraduationCap size={15} className={accentTextClass} aria-hidden="true" />
                  {levels.join(' · ')}
                </span>
              )}
              {durationSummary && (
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={15} className={accentTextClass} aria-hidden="true" />
                  {durationSummary}
                </span>
              )}
              {studyModes.length > 0 && (
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={15} className={accentTextClass} aria-hidden="true" />
                  {studyModes.join(' · ')}
                </span>
              )}
            </div>

            {/* CTA */}
            <div className="mt-9">
              <Link
                to={primaryCta.to}
                className="btn-gold inline-flex items-center gap-2 px-7 py-3"
              >
                {primaryCta.label}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Overview + At a Glance ═══ */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            {/* Left: Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inViewOnce}
              transition={{ duration: 0.5 }}
            >
              <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                Overview
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                About this program
              </h2>
              <p className="mt-5 font-body text-base leading-[1.75] text-navy-600">
                {program.shortDescription} This program brings together{' '}
                <span className="font-semibold text-navy-900">
                  {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                </span>{' '}
                designed as a coherent learning route — each course builds toward
                practical capability you can apply directly.
              </p>

              {entryRequirements.length > 0 && (
                <div className="mt-10">
                  <h3 className="flex items-center gap-2 font-display text-xl font-bold text-navy-900">
                    <Info size={18} className="text-gold-600" aria-hidden="true" />
                    Entry Requirements
                  </h3>
                  <p className="mt-2 font-body text-sm text-navy-500">
                    These are the typical requirements across the program's courses.
                  </p>
                  <ul className="mt-4 space-y-2 font-body text-sm leading-6 text-navy-600">
                    {entryRequirements.map((item, i) => (
                      <li key={i} className="flex gap-2.5">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Right: At a Glance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inViewOnce}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-fit rounded-2xl border border-navy-100 bg-cream p-6 sm:p-7 lg:sticky lg:top-24"
            >
              <h3 className="font-display text-lg font-bold text-navy-900">
                Program at a Glance
              </h3>
              <dl className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-navy-100 pb-4">
                  <dt className="font-body text-xs font-bold uppercase tracking-wider text-navy-400">
                    Code
                  </dt>
                  <dd className="font-mono text-sm font-semibold text-navy-900">
                    {program.code}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-navy-100 pb-4">
                  <dt className="font-body text-xs font-bold uppercase tracking-wider text-navy-400">
                    Division
                  </dt>
                  <dd className="font-body text-sm font-semibold text-navy-900">
                    {isLabs ? 'Labs' : 'Academy'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-navy-100 pb-4">
                  <dt className="font-body text-xs font-bold uppercase tracking-wider text-navy-400">
                    Courses
                  </dt>
                  <dd className="font-body text-sm font-semibold text-navy-900">
                    {courses.length}
                  </dd>
                </div>
                {levels.length > 0 && (
                  <div className="flex items-start justify-between gap-4 border-b border-navy-100 pb-4">
                    <dt className="font-body text-xs font-bold uppercase tracking-wider text-navy-400">
                      Levels
                    </dt>
                    <dd className="text-right font-body text-sm font-semibold text-navy-900">
                      {levels.join(', ')}
                    </dd>
                  </div>
                )}
                {durationSummary && (
                  <div className="flex items-start justify-between gap-4 border-b border-navy-100 pb-4">
                    <dt className="font-body text-xs font-bold uppercase tracking-wider text-navy-400">
                      Duration
                    </dt>
                    <dd className="text-right font-body text-sm font-semibold text-navy-900">
                      {durationSummary}
                    </dd>
                  </div>
                )}
                {studyModes.length > 0 && (
                  <div className="flex items-start justify-between gap-4 border-b border-navy-100 pb-4">
                    <dt className="font-body text-xs font-bold uppercase tracking-wider text-navy-400">
                      Study Mode
                    </dt>
                    <dd className="text-right font-body text-sm font-semibold text-navy-900">
                      {studyModes.join(', ')}
                    </dd>
                  </div>
                )}
                {version && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-body text-xs font-bold uppercase tracking-wider text-navy-400">
                      Version
                    </dt>
                    <dd className="font-body text-sm font-semibold text-navy-900">
                      {version}
                    </dd>
                  </div>
                )}
              </dl>

              <Link
                to={primaryCta.to}
                className="btn-gold mt-6 inline-flex w-full items-center justify-center gap-2 px-5 py-3"
              >
                {primaryCta.label}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Courses ═══ */}
      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                Curriculum
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                Courses in this program
              </h2>
              <p className="mt-3 max-w-xl font-body text-sm leading-6 text-navy-500">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'}{' '}
                grouped into one structured learning route.
              </p>
            </div>
            <Link
              to={`/courses?pathway=${program.id}`}
              className="hidden items-center gap-2 font-body text-sm font-bold text-gold-700 transition-all hover:gap-3 sm:inline-flex"
            >
              Browse all courses
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 bg-white py-16 text-center">
              <BookOpen size={28} className="mx-auto text-navy-300" aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                Courses coming soon
              </h3>
              <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
                Courses for this program will be published soon. Check back, or
                contact admissions to register your interest.
              </p>
              <Link
                to="/contact"
                className="btn-gold mt-6 inline-flex items-center gap-2 px-6 py-3"
              >
                Contact Admissions
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer(0.06, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {courses.map((course) => (
                <motion.div
                  key={course.code}
                  variants={fadeUpItem}
                  className="h-full"
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══ Related Programs ═══ */}
      {relatedPrograms.length > 0 && (
        <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="container-premium">
            <div className="mb-10 text-center">
              <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                Continue Exploring
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                More {isLabs ? 'Labs tracks' : 'Academy pathways'}
              </h2>
            </div>

            <motion.div
              variants={staggerContainer(0.08, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {relatedPrograms.map((p) => (
                <motion.div key={p.id} variants={fadeUpItem} className="h-full">
                  <RelatedProgramCard program={p} />
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-10 text-center">
              <Link
                to="/programs"
                className="inline-flex items-center gap-2 font-body text-sm font-bold text-gold-700 transition-all hover:gap-3"
              >
                View all programs
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Final CTA ═══ */}
      <section className="relative overflow-hidden bg-navy-950 py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-950" />

        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl"
          aria-hidden="true"
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 20, -20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-premium relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inViewOnce}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl"
          >
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-[1.7] text-navy-200 sm:text-base lg:text-lg">
              {isComingSoon
                ? 'This program will open for applications soon. Contact admissions to register your interest.'
                : 'Take the next step in your learning journey with InnoSpeak Global.'}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              {isComingSoon ? (
                <>
                  <Link
                    to="/contact"
                    className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
                  >
                    Contact Admissions
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    to="/programs"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 sm:w-auto"
                  >
                    <ArrowLeft size={15} aria-hidden="true" />
                    Back to Programs
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={primaryCta.to}
                    className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
                  >
                    {primaryCta.label}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 sm:w-auto"
                  >
                    Browse All Courses
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   Entry — thin wrapper, no hooks before the null check
   ────────────────────────────────────────────────────────────── */

export default function ProgramDetails() {
  const { slug } = useParams();
  const program = getProgramBySlug(slug);

  if (
    !program ||
    (program.status !== 'active' && program.status !== 'coming_soon')
  ) {
    return <ProgramNotFound slug={slug} />;
  }

  return <ProgramView program={program} />;
}