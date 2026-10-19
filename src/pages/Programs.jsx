import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Search,
  GraduationCap,
  FlaskConical,
  HeartHandshake,
  BookOpen,
  X,
  Compass,
} from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import HeroBackground from '../components/ui/HeroBackground.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../lib/motion/presets';
import { COURSES, getCoursesByPathway } from '../lib/data/programmeData.js';
import { PATHWAYS, TRACKS } from '../lib/data/registry.js';

/* ──────────────────────────────────────────────────────────────
   Three divisions of the ecosystem
   ────────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    id: 'academy',
    title: 'InnoSpeak Global Academy',
    tagline: 'Structured Learning',
    description:
      'Structured learning, professional development, digital skills, communication, technical education and certification.',
    icon: GraduationCap,
    to: '/academy',
    cta: 'Explore Academy',
    cardBg: 'bg-gold-500/10',
    border: 'border-gold-500/30',
    iconBg: 'bg-gold-gradient text-navy-900',
    taglineColor: 'text-gold-700',
  },
  {
    id: 'labs',
    title: 'InnoSpeak Global Labs',
    tagline: 'Practical Innovation',
    description:
      'Practical engineering, technology, innovation, projects, entrepreneurship and hands-on development.',
    icon: FlaskConical,
    to: '/labs',
    cta: 'Explore Labs',
    cardBg: 'bg-navy-500/10',
    border: 'border-navy-400/30',
    iconBg: 'bg-navy-800 text-white',
    taglineColor: 'text-navy-700',
  },
  {
    id: 'foundation',
    title: 'InnoSpeak Global Foundation',
    tagline: 'Impact & Access',
    description:
      'Scholarships, educational support, opportunity access and community impact.',
    icon: HeartHandshake,
    to: '/foundation',
    cta: 'Explore Foundation',
    cardBg: 'bg-emerald-500/10',
    border: 'border-emerald-400/40',
    iconBg: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white',
    taglineColor: 'text-emerald-700',
  },
];

const DIVISION_FILTERS = [
  { id: 'all', label: 'All Programs' },
  { id: 'academy', label: 'Academy' },
  { id: 'labs', label: 'Labs' },
];

/* ──────────────────────────────────────────────────────────────
   Floating dots for the hero
   ────────────────────────────────────────────────────────────── */

const HERO_DOTS = [
  { left: '12%', top: '22%', size: 5, delay: 0, duration: 9 },
  { left: '82%', top: '26%', size: 4, delay: 1.2, duration: 11 },
  { left: '28%', top: '72%', size: 6, delay: 0.6, duration: 10 },
  { left: '72%', top: '68%', size: 3, delay: 1.8, duration: 12 },
];

/* ──────────────────────────────────────────────────────────────
   Program card
   ────────────────────────────────────────────────────────────── */

function ProgramCard({ program }) {
  // Show up to 3 sample courses from this program
  const sampleCourses = useMemo(() => {
    const courses = getCoursesByPathway(program.id);
    return courses.slice(0, 3);
  }, [program.id]);

  const isLabs = program.division === 'labs';

  return (
    <Link
      to={`/programs/${program.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3">
        <span
          className={`rounded-full px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider ${
            isLabs
              ? 'bg-navy-700 text-gold-300'
              : 'bg-gold-500/10 text-gold-700 ring-1 ring-gold-500/20'
          }`}
        >
          {isLabs ? 'Labs' : 'Academy'}
        </span>
        <span className="font-mono text-[11px] font-semibold text-navy-400">
          {program.code}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700 sm:text-lg">
          {program.title}
        </h3>

        <p className="mt-2 flex-1 line-clamp-3 font-body text-sm leading-6 text-navy-500">
          {program.description}
        </p>

        {/* Sample courses preview */}
        {sampleCourses.length > 0 && (
          <div className="mt-4 border-t border-navy-100 pt-4">
            <p className="mb-2 font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
              Popular courses
            </p>
            <ul className="space-y-1.5">
              {sampleCourses.slice(0, 2).map((c) => (
                <li
                  key={c.code}
                  className="flex items-center gap-2 font-body text-xs text-navy-600"
                >
                  <span className="shrink-0 font-mono text-[10px] font-bold text-gold-600">
                    {c.code}
                  </span>
                  <span className="truncate">{c.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta chips */}
        {(program.levels.length > 0 || program.studyModes.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {program.levels.slice(0, 2).map((lvl) => (
              <span
                key={lvl}
                className="rounded-full bg-cream px-2.5 py-1 font-body text-[10px] font-semibold text-navy-600 ring-1 ring-navy-100"
              >
                {lvl}
              </span>
            ))}
            {program.studyModes.slice(0, 1).map((mode) => (
              <span
                key={mode}
                className="rounded-full bg-gold-500/10 px-2.5 py-1 font-body text-[10px] font-semibold text-gold-700"
              >
                {mode}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-4">
          <span className="inline-flex items-center gap-1.5 font-body text-sm font-bold text-navy-900">
            <BookOpen size={14} className="text-gold-600" aria-hidden="true" />
            {program.courseCount} {program.courseCount === 1 ? 'course' : 'courses'}
          </span>
          <span className="inline-flex items-center gap-1 font-body text-sm font-semibold text-gold-700 transition-all duration-300 group-hover:gap-2">
            Explore
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function Programs() {
  const [query, setQuery] = useState('');
  const [division, setDivision] = useState('all');

  const programs = useMemo(() => {
    const academyPrograms = PATHWAYS.map((p) => {
      const courses = getCoursesByPathway(p.id);
      return {
        id: p.id,
        code: p.code,
        slug: p.slug,
        title: p.title,
        description: p.shortDescription,
        division: 'academy',
        courseCount: courses.length,
        levels: [...new Set(courses.map((c) => c.level).filter(Boolean))].slice(0, 3),
        studyModes: [...new Set(courses.map((c) => c.studyMode).filter(Boolean))].slice(0, 2),
      };
    });

    const labsPrograms = TRACKS.map((t) => {
      const courses = getCoursesByPathway(t.id);
      return {
        id: t.id,
        code: t.code,
        slug: t.slug,
        title: t.title,
        description: t.shortDescription,
        division: 'labs',
        courseCount: courses.length,
        levels: [...new Set(courses.map((c) => c.level).filter(Boolean))].slice(0, 3),
        studyModes: [...new Set(courses.map((c) => c.studyMode).filter(Boolean))].slice(0, 2),
      };
    });

    return [...academyPrograms, ...labsPrograms];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((p) => {
      if (division !== 'all' && p.division !== division) return false;
      if (q && !`${p.title} ${p.description} ${p.code}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [programs, division, query]);

  const academyCount = programs.filter((p) => p.division === 'academy').length;
  const labsCount = programs.filter((p) => p.division === 'labs').length;

  return (
    <>
      <Seo
        title="Programs — Learn. Build. Innovate."
        description="Explore the 19 programs within the InnoSpeak Global ecosystem — 12 Academy pathways and 7 Labs tracks."
        path="/programs"
      />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-28 pb-16 md:pt-32 md:pb-20">
        <HeroBackground variant="homepage" />
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />

        {/* Animated gold orbs */}
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold-500/15 blur-[120px]"
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
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        ))}

        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 font-body text-[11px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
              <Compass size={12} />
              The InnoSpeak Global Ecosystem
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:text-6xl">
              Learn. Build. Innovate.
              <span className="block text-gradient-gold">Make an Impact.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-[1.7] text-navy-200 sm:text-lg">
              Explore every path within the InnoSpeak Global ecosystem — structured
              learning, practical innovation, and educational support.
            </p>

            {/* Quick stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-body text-xs font-semibold text-white/80 backdrop-blur-sm">
                {programs.length} programs
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-body text-xs font-semibold text-white/80 backdrop-blur-sm">
                {academyCount} Academy pathways
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-body text-xs font-semibold text-white/80 backdrop-blur-sm">
                {labsCount} Labs tracks
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Three Pillars ═══ */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <div className="mb-12 sm:mb-14 lg:mb-16">
            <SectionHeading
              eyebrow="One Ecosystem. Three Divisions."
              title="Choose Your Path Within InnoSpeak Global"
              subtitle="Academy is the learning engine. Labs is the building engine. Foundation is the impact engine — one account, one ecosystem."
            />
          </div>

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-7">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={inViewOnce}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={`group relative overflow-hidden rounded-2xl border ${pillar.border} ${pillar.cardBg} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg sm:p-8`}
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${pillar.iconBg} shadow-md sm:h-14 sm:w-14`}>
                    <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-navy-900 sm:text-xl">
                    {pillar.title}
                  </h3>
                  <p className={`mt-1 font-body text-[10px] font-bold uppercase tracking-[0.18em] sm:text-xs ${pillar.taglineColor}`}>
                    {pillar.tagline}
                  </p>
                  <p className="mt-3 font-body text-sm leading-6 text-navy-600">
                    {pillar.description}
                  </p>

                  <Link
                    to={pillar.to}
                    className="mt-5 inline-flex items-center gap-2 font-body text-sm font-bold text-navy-900 transition-all duration-300 group-hover:gap-3 group-hover:text-gold-700"
                  >
                    {pillar.cta}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Program Discovery ═══ */}
      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          {/* Heading + search */}
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                Program Discovery
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                {programs.length} programs across 2 divisions
              </h2>
              <p className="mt-3 max-w-xl font-body text-sm leading-6 text-navy-500">
                {academyCount} Academy pathways · {labsCount} Labs tracks. Every
                program groups related courses into a clear learning route.
              </p>
            </div>

            <div className="relative lg:w-80">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search programs..."
                className="w-full rounded-2xl border border-navy-100 bg-white py-3 pl-11 pr-10 font-body text-sm text-navy-900 shadow-sm outline-none transition placeholder:text-navy-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter pills */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {DIVISION_FILTERS.map((d) => {
              const isActive = division === d.id;
              const count =
                d.id === 'all'
                  ? programs.length
                  : programs.filter((p) => p.division === d.id).length;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDivision(d.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                      : 'border-navy-100 bg-white text-navy-700 hover:border-gold-300 hover:text-gold-700'
                  }`}
                >
                  {d.label}
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-navy-100 text-navy-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result count */}
          <p className="mb-6 font-body text-sm text-navy-500">
            Showing {filtered.length} {filtered.length === 1 ? 'program' : 'programs'}
          </p>

          {/* Grid / empty state */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center"
            >
              <Compass size={32} className="mx-auto text-navy-300" />
              <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                No programs match your search
              </h3>
              <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
                Try a different term, or clear the filters to see all {programs.length} programs.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setDivision('all');
                }}
                className="btn-gold mt-6 inline-flex items-center gap-2 px-6 py-3"
              >
                Show All Programs
                <ArrowRight size={15} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer(0.06, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {filtered.map((program) => (
                <motion.div key={program.id} variants={fadeUpItem} className="h-full">
                  <ProgramCard program={program} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
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
              Ready to start your journey?
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-[1.7] text-navy-200 sm:text-base lg:text-lg">
              Apply to InnoSpeak Global Academy or Labs and take the first step
              toward your future.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/apply"
                className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
              >
                Apply Now
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 sm:w-auto"
              >
                Contact Admissions
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}