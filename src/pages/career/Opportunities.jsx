import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Compass,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import HeroBackground from '../../components/ui/HeroBackground.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../lib/motion/presets';
import { listCareerOpportunities } from '../../lib/supabase/platform.js';
import {
  normalizeOpportunities,
  filterOpportunities,
  sortOpportunities,
  availableTypes,
  availableModes,
  availableLevels,
  deadlineInfo,
} from '../../lib/data/opportunities';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCareerProfile, matchOpportunities } from '../../lib/data/matching';
import { RecommendedSection } from '../../components/career/RecommendedSection.jsx';

const container = staggerContainer(0.06, 0.1);

/* ──────────────────────────────────────────────────────────────
   Card
   ────────────────────────────────────────────────────────────── */

function OpportunityCard({ opportunity: o }) {
  const deadline = deadlineInfo(o.closing_date);

  return (
    <Link
      to={`/career-hub/opportunities/${o.id}`}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
    >
      {/* Top badges */}
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-gold-500/10 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-gold-700">
          {o.opportunity_type}
        </span>
        <div className="flex items-center gap-1.5">
          {o.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
              <Sparkles size={10} aria-hidden="true" />
              Featured
            </span>
          )}
          {o.verified && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Title + org */}
      <h3 className="mt-4 font-display text-lg font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700">
        {o.title}
      </h3>
      {o.organisation && (
        <p className="mt-1 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-navy-600">
          <Building2 size={13} className="text-navy-400" aria-hidden="true" />
          {o.organisation}
        </p>
      )}

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-xs text-navy-500">
        {o.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} aria-hidden="true" />
            {o.location}
          </span>
        )}
        {o.mode && (
          <span className="inline-flex items-center gap-1.5">
            <Compass size={12} aria-hidden="true" />
            {o.mode}
          </span>
        )}
      </div>

      {/* Description */}
      {o.description && (
        <p className="mt-3 flex-1 line-clamp-3 font-body text-sm leading-6 text-navy-500">
          {o.description}
        </p>
      )}

      {/* Skills */}
      {o.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {o.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-full bg-navy-50 px-2.5 py-1 font-body text-[11px] font-semibold text-navy-600"
            >
              {s}
            </span>
          ))}
          {o.skills.length > 4 && (
            <span className="rounded-full bg-navy-50 px-2.5 py-1 font-body text-[11px] font-semibold text-navy-400">
              +{o.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-navy-100 pt-4">
        {deadline ? (
          <span
            className={`font-body text-xs font-semibold ${
              deadline.expired
                ? 'text-navy-400'
                : deadline.urgent
                  ? 'text-rose-600'
                  : 'text-navy-500'
            }`}
          >
            {deadline.label}
          </span>
        ) : (
          <span className="font-body text-xs font-semibold text-navy-400">
            Rolling
          </span>
        )}
        <span className="inline-flex items-center gap-1 font-body text-sm font-bold text-gold-700 transition-all duration-300 group-hover:gap-2">
          View
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────
   States
   ────────────────────────────────────────────────────────────── */

function Skeleton() {
  return (
    <SectionCard className="animate-pulse p-6">
      <div className="flex justify-between">
        <div className="h-5 w-20 rounded-full bg-navy-100" />
        <div className="h-5 w-16 rounded-full bg-navy-100" />
      </div>
      <div className="mt-4 h-5 w-3/4 rounded bg-navy-100" />
      <div className="mt-2 h-4 w-1/2 rounded bg-navy-100" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-navy-100" />
        <div className="h-3 w-5/6 rounded bg-navy-100" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-navy-100" />
        <div className="h-6 w-20 rounded-full bg-navy-100" />
      </div>
    </SectionCard>
  );
}

function ErrorState({ onRetry }) {
  return (
    <SectionCard className="md:col-span-2 lg:col-span-3">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-navy-900">
            Unable to load opportunities right now
          </h3>
          <p className="mt-1 font-body text-sm text-navy-500">
            Please try again shortly.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="btn-outline inline-flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Retry
        </button>
      </div>
    </SectionCard>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <SectionCard className="md:col-span-2 lg:col-span-3">
      <div className="py-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
          <Sparkles size={22} aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-base font-bold text-navy-900">
          {hasFilters
            ? 'No opportunities match your filters'
            : 'Opportunities are currently being curated'}
        </h3>
        <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-navy-500">
          {hasFilters
            ? 'Try a different search term or clear the filters.'
            : 'Published opportunities will appear here as the career team adds them.'}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="btn-gold mt-5 inline-flex items-center gap-2 text-sm"
          >
            Clear Filters
          </button>
        )}
      </div>
    </SectionCard>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function Opportunities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: false, data: [] });
  const [reloadKey, setReloadKey] = useState(0);

  // Filters — search and type come from URL for deep-linking
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [type, setType] = useState(() => searchParams.get('type') || 'all');
  const [mode, setMode] = useState(() => searchParams.get('mode') || 'all');
  const [level, setLevel] = useState(() => searchParams.get('level') || 'all');

  // Signed-in learner profile — used for matching. Never blocks the page.
  const { user } = useAuth();
  const { profile } = useCareerProfile(user);

  // Fetch
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));
    listCareerOpportunities()
      .then((rows) => {
        if (!cancelled) setState({ loading: false, error: false, data: normalizeOpportunities(rows) });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[Opportunities] load failed:', err);
        if (!cancelled) setState({ loading: false, error: true, data: [] });
      });
    return () => { cancelled = true; };
  }, [reloadKey]);

  // Sync filters to URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (type !== 'all') next.set('type', type);
    if (mode !== 'all') next.set('mode', mode);
    if (level !== 'all') next.set('level', level);
    setSearchParams(next, { replace: true });
  }, [query, type, mode, level, setSearchParams]);

  const retry = () => setReloadKey((k) => k + 1);
  const clearFilters = () => {
    setQuery('');
    setType('all');
    setMode('all');
    setLevel('all');
  };

  const types = useMemo(() => availableTypes(state.data), [state.data]);
  const modes = useMemo(() => availableModes(state.data), [state.data]);
  const levels = useMemo(() => availableLevels(state.data), [state.data]);

  const filtered = useMemo(() => {
    return sortOpportunities(
      filterOpportunities(state.data, { query, type, mode, level, hideExpired: false })
    );
  }, [state.data, query, type, mode, level]);

  // Personalised recommendations — only when signed in with a usable profile.
  const recommended = useMemo(
    () => (profile ? matchOpportunities(state.data, profile, { limit: 3 }) : []),
    [state.data, profile]
  );

  const hasFilters =
    query.trim() !== '' || type !== 'all' || mode !== 'all' || level !== 'all';

  return (
    <>
      <Seo
        title="Opportunities — Career Hub"
        description="Jobs, internships, attachments, apprenticeships, projects, freelance work, challenges and mentorship — published by InnoSpeak Global and partner organisations."
        path="/career-hub/opportunities"
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-28 pb-12 md:pt-32 md:pb-14">
        <HeroBackground variant="professional" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-gold-500/15 blur-[120px]"
          aria-hidden="true"
        />

        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Link
              to="/career-hub"
              className="inline-flex items-center gap-2 font-body text-xs font-semibold text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Career Hub
            </Link>

            <h1 className="mt-5 font-display text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              Opportunities
            </h1>
            <p className="mt-4 max-w-2xl font-body text-base leading-[1.7] text-navy-200">
              Jobs, internships, attachments, apprenticeships, projects, freelance work,
              challenges and mentorship — from InnoSpeak Global and partner organisations.
            </p>

            {/* Search */}
            <div className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
              <Search size={18} className="text-white/60" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, organisation or skill…"
                aria-label="Search opportunities"
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="bg-cream py-12 sm:py-16 lg:py-20">
        <div className="container-premium">
          {/* Recommended for You — only renders when signed in with matchable data */}
          {!state.loading && !state.error && recommended.length > 0 && (
            <RecommendedSection
              matches={recommended}
              subtitle="Based on your skills, projects and goals — every match is explainable."
            />
          )}

          {/* Filter bar */}
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
            {/* Type pills */}
            {types.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setType('all')}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold capitalize transition-all duration-200 ${
                    type === 'all'
                      ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                      : 'border-navy-100 bg-white text-navy-700 hover:border-gold-300 hover:text-gold-700'
                  }`}
                >
                  All
                </button>
                {types.map((t) => {
                  const isActive = type === t;
                  const count = state.data.filter((o) => o.opportunity_type === t).length;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold capitalize transition-all duration-200 ${
                        isActive
                          ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                          : 'border-navy-100 bg-white text-navy-700 hover:border-gold-300 hover:text-gold-700'
                      }`}
                    >
                      {t}
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
            )}

            {/* Secondary filters */}
            {(modes.length > 0 || levels.length > 0 || hasFilters) && (
              <div className="mt-5 grid gap-4 border-t border-navy-100 pt-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
                {modes.length > 0 && (
                  <label className="flex flex-col gap-1.5">
                    <span className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                      Mode
                    </span>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="rounded-xl border border-navy-100 bg-white px-3 py-2.5 font-body text-sm text-navy-700 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                    >
                      <option value="all">All modes</option>
                      {modes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {levels.length > 0 && (
                  <label className="flex flex-col gap-1.5">
                    <span className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
                      Level
                    </span>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="rounded-xl border border-navy-100 bg-white px-3 py-2.5 font-body text-sm text-navy-700 outline-none transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/15"
                    >
                      <option value="all">All levels</option>
                      {levels.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {hasFilters && (
                  <div className="lg:col-start-4 lg:justify-self-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 rounded-full border border-navy-100 bg-white px-4 py-2 font-body text-xs font-semibold text-navy-700 transition hover:border-gold-300 hover:text-gold-700"
                    >
                      <X size={12} aria-hidden="true" />
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Result count */}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-navy-100 pt-5">
              <p className="inline-flex items-center gap-2 font-body text-sm text-navy-500">
                <Filter size={13} aria-hidden="true" />
                {state.loading ? (
                  'Loading…'
                ) : (
                  <>
                    <span className="font-bold text-navy-900">{filtered.length}</span>{' '}
                    {filtered.length === 1 ? 'opportunity' : 'opportunities'}
                    {hasFilters && <span className="text-navy-400"> · filtered</span>}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {state.loading ? (
              <>
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </>
            ) : state.error ? (
              <ErrorState onRetry={retry} />
            ) : filtered.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
            ) : (
              filtered.map((o) => (
                <motion.div key={o.id} variants={fadeUpItem} className="h-full">
                  <OpportunityCard opportunity={o} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}