import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Search,
  Sparkles,
  X,
  Compass,
  GraduationCap,
  FlaskConical,
  Tag,
} from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import HeroSlider from '../components/home/HeroSlider.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../lib/motion/presets';
import { COURSES, PATHWAYS, TRACKS } from '../lib/data/programmeData.js';
import { getCurriculumStatus } from '../lib/data/courseReadiness.js';

/* ──────────────────────────────────────────────────────────────
   Filter option sets
   ────────────────────────────────────────────────────────────── */

const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];
const MODES = ['All modes', 'Online', 'Hybrid', 'Physical / Hybrid', 'Physical'];

const DIVISION_FILTERS = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'academy', label: 'Academy', icon: GraduationCap },
  { id: 'labs', label: 'Labs', icon: FlaskConical },
];

const PAGE_SIZE = 24;

const container = staggerContainer(0.06, 0.1);

const HERO_DOTS = [
  { left: '10%', top: '24%', size: 5, delay: 0, duration: 9 },
  { left: '84%', top: '28%', size: 4, delay: 1.2, duration: 11 },
  { left: '24%', top: '70%', size: 6, delay: 0.6, duration: 10 },
  { left: '74%', top: '66%', size: 3, delay: 1.8, duration: 12 },
];

// Module-level lookup so every card doesn't re-scan the registry
const GROUPING_BY_ID = new Map();
PATHWAYS.forEach((p) => GROUPING_BY_ID.set(p.id, p));
TRACKS.forEach((t) => GROUPING_BY_ID.set(t.id, t));

/* ──────────────────────────────────────────────────────────────
   Course card
   ────────────────────────────────────────────────────────────── */

function CourseCard({ course }) {
  const isLabs = (course.division || course.pillar) === 'labs';

  return (
    <Link
      to={`/courses/${course.code}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
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
          {course.code}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-cream px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-navy-600 ring-1 ring-navy-100">
            {course.level}
          </span>
          {course.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
              <Sparkles size={10} aria-hidden="true" />
              Featured
            </span>
          )}
        </div>

        <h3 className="mt-4 font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700 sm:text-lg">
          {course.name}
        </h3>

        <p className="mt-2 flex-1 line-clamp-3 font-body text-sm leading-6 text-navy-500">
          {course.shortDescription}
        </p>

        {/* Meta */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-navy-100 pt-4 font-body text-xs text-navy-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={13} className="text-gold-600" aria-hidden="true" />
            {course.duration}
          </span>
          <span className="inline-flex items-center gap-1.5 truncate">
            <BookOpen size={13} className="text-gold-600" aria-hidden="true" />
            <span className="truncate">{course.studyMode}</span>
          </span>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-4">
          <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-navy-700">
            <Tag size={13} className="text-gold-600" aria-hidden="true" />
            Indicative: {course.fees}
          </span>
          <span className="inline-flex items-center gap-1 font-body text-sm font-semibold text-gold-700 transition-all duration-300 group-hover:gap-2">
            View details
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
   Main page
   ────────────────────────────────────────────────────────────── */

export default function CourseCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [division, setDivision] = useState('all');
  const [pathway, setPathway] = useState(
    () => searchParams.get('pathway') || 'all'
  );
  const [level, setLevel] = useState('All levels');
  const [mode, setMode] = useState('All modes');
  const [curriculumFilter, setCurriculumFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Keep pathway in sync with the URL (deep-linking from ProgramDetails)
  useEffect(() => {
    setPathway(searchParams.get('pathway') || 'all');
  }, [searchParams]);

  // Reset pagination when any filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, division, pathway, level, mode, curriculumFilter]);

  const handlePathwayChange = (value) => {
    setPathway(value);
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('pathway');
    else next.set('pathway', value);
    setSearchParams(next, { replace: true });
  };

  const handleDivisionChange = (value) => {
    setDivision(value);
    if (pathway === 'all') return;
    const isAcademyPathway = PATHWAYS.some((p) => p.id === pathway);
    const isLabsTrack = TRACKS.some((t) => t.id === pathway);
    if (value === 'academy' && !isAcademyPathway) handlePathwayChange('all');
    else if (value === 'labs' && !isLabsTrack) handlePathwayChange('all');
  };

  const handleClearFilters = () => {
    setQuery('');
    setDivision('all');
    setLevel('All levels');
    setMode('All modes');
    setCurriculumFilter('all');
    handlePathwayChange('all');
  };

  // Show the complete catalogue transparently. Curriculum readiness is
  // displayed per course; it is not confused with a live intake or accreditation.
  const activeCourses = useMemo(() => COURSES, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = activeCourses.filter((course) => {
      const courseDivision = course.division || course.pillar || 'academy';
      if (division !== 'all' && courseDivision !== division) return false;
      if (pathway !== 'all' && course.pathwayId !== pathway) return false;
      if (level !== 'All levels' && course.level !== level) return false;
      if (mode !== 'All modes' && course.studyMode !== mode) return false;
      const hasStructuredContent = getCurriculumStatus(course).hasStructuredContent;
      if (curriculumFilter === 'structured' && !hasStructuredContent) return false;
      if (curriculumFilter === 'draft' && hasStructuredContent) return false;
      if (!q) return true;
      return `${course.code} ${course.name} ${course.shortDescription} ${course.category}`
        .toLowerCase()
        .includes(q);
    });

    // Featured first, then alphabetical by code
    return filtered.sort((a, b) => {
      if (!!b.featured !== !!a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return a.code.localeCompare(b.code);
    });
  }, [activeCourses, query, division, pathway, level, mode, curriculumFilter]);

  const academyCount = activeCourses.filter(
    (c) => (c.division || c.pillar) === 'academy'
  ).length;
  const labsCount = activeCourses.filter(
    (c) => (c.division || c.pillar) === 'labs'
  ).length;

  const counts = {
    all: activeCourses.length,
    academy: academyCount,
    labs: labsCount,
  };

  const hasActiveFilters =
    query ||
    division !== 'all' ||
    pathway !== 'all' ||
    level !== 'All levels' ||
    mode !== 'All modes' ||
    curriculumFilter !== 'all';

  const visiblePaged = visible.slice(0, visibleCount);
  const hasMore = visible.length > visibleCount;

  return (
    <>
      <Seo
        title="Courses | InnoSpeak Global"
        description="Explore the InnoSpeak Global course catalogue, with structured curriculum and draft-outline status clearly labelled."
        path="/courses"
      />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-28 pb-16 md:pt-32 md:pb-20">
        <HeroSlider showIndicators={false} autoRotate={false} />
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />

        {/* Animated orbs */}
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
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 font-body text-[11px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
              <BookOpen size={12} aria-hidden="true" />
              Course Catalogue
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:text-6xl">
              Learn a skill.
              <span className="block text-gradient-gold">Build proof. Move forward.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-[1.7] text-navy-200 sm:text-lg">
              Explore {activeCourses.length} catalogue entries across communication, technology,
              engineering, business, education and professional development. Each listing distinguishes structured course content from a draft outline; neither status alone means an intake is open.
            </p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md"
            >
              <Search size={18} className="text-white/60" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by course, code or skill…"
                aria-label="Search courses"
                className="w-full bg-transparent py-2 font-body text-sm text-white outline-none placeholder:text-white/45"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Filters + Grid ═══ */}
      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inViewOnce}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6"
          >
            {/* Division pills */}
            <div className="flex flex-wrap items-center gap-2">
              {DIVISION_FILTERS.map((d) => {
                const isActive = division === d.id;
                const Icon = d.icon;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleDivisionChange(d.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                        : 'border-navy-100 bg-white text-navy-700 hover:border-gold-300 hover:text-gold-700'
                    }`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    {d.label}
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-navy-100 text-navy-600'
                      }`}
                    >
                      {counts[d.id]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pathway + Level + Mode */}
            <div className="mt-5 grid gap-4 border-t border-navy-100 pt-5 lg:grid-cols-2 xl:grid-cols-4 lg:items-end">
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                  Learning area
                </span>
                <select
                  value={pathway}
                  onChange={(e) => handlePathwayChange(e.target.value)}
                  aria-label="Filter by learning area"
                  className="rounded-xl border border-navy-100 bg-white px-3 py-2.5 font-body text-sm text-navy-700 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                >
                  <option value="all">All learning areas</option>
                  {division !== 'labs' && (
                    <optgroup label="Academy Pathways">
                      {PATHWAYS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {division !== 'academy' && (
                    <optgroup label="Labs Tracks">
                      {TRACKS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                  Level
                </span>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  aria-label="Filter by level"
                  className="rounded-xl border border-navy-100 bg-white px-3 py-2.5 font-body text-sm text-navy-700 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                >
                  {LEVELS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                  Study mode
                </span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  aria-label="Filter by study mode"
                  className="rounded-xl border border-navy-100 bg-white px-3 py-2.5 font-body text-sm text-navy-700 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                >
                  {MODES.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                  Curriculum status
                </span>
                <select
                  value={curriculumFilter}
                  onChange={(e) => setCurriculumFilter(e.target.value)}
                  aria-label="Filter by curriculum status"
                  className="rounded-xl border border-navy-100 bg-white px-3 py-2.5 font-body text-sm text-navy-700 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                >
                  <option value="all">All catalogue entries</option>
                  <option value="structured">Structured curriculum</option>
                  <option value="draft">Draft outline</option>
                </select>
              </label>
            </div>

            {/* Result count + clear */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-5">
              <p className="font-body text-sm text-navy-500">
                Showing{' '}
                <span className="font-bold text-navy-900">
                  {visiblePaged.length}
                </span>{' '}
                of{' '}
                <span className="font-bold text-navy-900">{visible.length}</span>{' '}
                {visible.length === 1 ? 'course' : 'courses'}
                {hasActiveFilters && (
                  <span className="text-navy-400"> · filters active</span>
                )}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-100 bg-white px-4 py-2 font-body text-xs font-semibold text-navy-700 transition hover:border-gold-300 hover:text-gold-700"
                >
                  <X size={12} aria-hidden="true" />
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>

          {/* Grid / empty state */}
          {visible.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white py-20 text-center"
            >
              <Compass size={32} className="mx-auto text-navy-300" aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                No courses match your search
              </h3>
              <p className="mx-auto mt-2 max-w-md font-body text-sm text-navy-500">
                Try a different term, or clear the filters to see all{' '}
                {activeCourses.length} courses.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-gold mt-6 inline-flex items-center gap-2 px-6 py-3"
              >
                Show All Courses
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={inViewOnce}
                className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
              >
                {visiblePaged.map((course) => (
                  <motion.div
                    key={course.code}
                    variants={fadeUpItem}
                    className="h-full"
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </motion.div>

              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-6 py-3 font-body text-sm font-bold text-navy-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
                  >
                    Show more courses
                    <span className="text-navy-400">
                      ({visible.length - visibleCount} remaining)
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ═══ Cross-link CTA ═══ */}
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
              Prefer a structured path?
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-[1.7] text-navy-200 sm:text-base lg:text-lg">
              Programs group related courses into clear learning routes — from
              Academy pathways to Labs tracks.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/programs"
                className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
              >
                Browse Programs
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/apply"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 sm:w-auto"
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}