import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Compass,
  ExternalLink,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  Lightbulb,
  MapPin,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  UserRound,
} from 'lucide-react';
import Seo from '../components/ui/Seo.jsx';
import HeroBackground from '../components/ui/HeroBackground.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import SectionCard from '../components/portal/SectionCard.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../lib/motion/presets';
import { listCareerOpportunities } from '../lib/supabase/platform.js';
import { normalizeOpportunities } from '../lib/data/opportunities';

const container = staggerContainer(0.1, 0.1);
const gridContainer = staggerContainer(0.06, 0.1);

/* ──────────────────────────────────────────────────────────────
   Static content — matches spec §8, §9, §10, §22, §23, §26
   ────────────────────────────────────────────────────────────── */

const JOURNEY_STEPS = [
  { icon: GraduationCap, title: 'Learn',       description: 'Build knowledge through Academy and Lab courses.' },
  { icon: FlaskConical,  title: 'Practice',    description: 'Apply knowledge through LMS activities, assignments and Lab work.' },
  { icon: Lightbulb,     title: 'Demonstrate', description: 'Build projects, complete assessments and develop evidence.' },
  { icon: Award,         title: 'Verify',      description: 'Earn certificates and recognised credentials.' },
  { icon: Handshake,     title: 'Connect',     description: 'Discover employers, mentors, projects and opportunities.' },
  { icon: TrendingUp,    title: 'Progress',    description: 'Move into employment, experience, entrepreneurship or further learning.' },
];

const DEVELOPMENT_AREAS = [
  { icon: TrendingUp, title: 'Career Development',          description: 'Structured guidance to help you identify, pursue and achieve your professional goals — from first role to leadership.', href: '/learn/goals' },
  { icon: BookOpen,   title: 'Skills & Professional Growth', description: 'Build the technical, communication and leadership skills that employers and clients actually value.', href: '/courses' },
  { icon: Rocket,     title: 'Projects & Experience',       description: 'Labs projects, portfolio builds and practical challenges that turn learning into demonstrable evidence.', href: '/learn/projects' },
  { icon: Award,      title: 'Credentials & Achievements',  description: 'Earn recognised credentials that validate your skills and signal your readiness to employers and partners.', href: '/learn/certificates' },
];

const CONNECTION_TYPES = [
  { icon: Target,             title: 'Real-World Projects',    description: 'Organisations submit practical problems. You deliver, gain evidence, and build a track record.' },
  { icon: Building2,          title: 'Industry Experience',    description: 'Internships, industrial attachments, apprenticeships and structured workplace learning.' },
  { icon: Lightbulb,          title: 'Innovation Challenges',  description: 'Technical challenges, competitions, hackathons and solution-building sprints.' },
  { icon: Users,              title: 'Community Projects',     description: 'Use your skills to contribute to meaningful community and development work.' },
  { icon: BriefcaseBusiness,  title: 'Freelance & Service',    description: 'Short-term and project-based paid work that builds both income and experience.' },
  { icon: UserRound,          title: 'Mentorship & Industry',  description: 'Structured connections with experienced professionals and industry partners.' },
];

const CAREER_DEVELOPMENT_RESOURCES = [
  { title: 'CV & Portfolio',            description: 'Build strong applications and a portfolio that proves what you can do.', href: '/learn/portfolio' },
  { title: 'Interview Preparation',     description: 'Prepare for interviews with structure, practice and feedback.',           href: '/courses/ITP101' },
  { title: 'Professional Communication', description: 'Develop the workplace communication that gets you heard.',               href: '/courses/ENG105' },
  { title: 'Workplace Skills',          description: 'Professionalism, teamwork, time management and leadership.',              href: '/courses/EMP101' },
  { title: 'Career Guidance',           description: 'Understand career paths, make informed choices and plan next steps.',     href: '/learn/goals' },
  { title: 'Entrepreneurship',          description: 'Explore self-employment, side income and opportunity creation.',          href: '/courses/ENT101' },
];

const CAREER_EVENT_TYPES = [
  'Career fairs',
  'Employer sessions',
  'Industry days',
  'CV workshops',
  'Interview clinics',
  'Mentorship sessions',
  'Innovation challenges',
  'Technical competitions',
  'Networking events',
];

const EMPLOYER_BENEFITS = [
  { icon: GraduationCap, title: 'Find Talent',           description: 'Discover emerging professionals with structured learning and practical evidence.' },
  { icon: Users,         title: 'Host Internships',      description: 'Offer practical experience and build a pipeline of skilled, work-ready candidates.' },
  { icon: Target,        title: 'Submit a Project',      description: 'Present a real-world problem for learners to solve as part of their practical work.' },
  { icon: Handshake,     title: 'Partner With InnoSpeak', description: 'Collaborate on training, mentorship, challenges, curriculum, Labs and career events.' },
];

/* ──────────────────────────────────────────────────────────────
   Opportunity card + states
   ────────────────────────────────────────────────────────────── */

function OpportunityCard({ opportunity: o }) {
  return (
    <SectionCard className="flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-gold-500/10 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-gold-700">
          {o.opportunity_type || 'Opportunity'}
        </span>
        <BriefcaseBusiness size={18} className="shrink-0 text-navy-300" aria-hidden="true" />
      </div>

      <h3 className="mt-4 font-display text-lg font-bold leading-snug text-navy-900">
        {o.title}
      </h3>
      {o.organisation && (
        <p className="mt-1 font-body text-sm font-semibold text-navy-600">{o.organisation}</p>
      )}

      {(o.location || o.remote) && (
        <p className="mt-3 inline-flex items-center gap-1.5 font-body text-xs text-navy-500">
          <MapPin size={13} aria-hidden="true" />
          {o.location || 'Location flexible'}
          {o.remote ? ' · Remote' : ''}
        </p>
      )}

      {o.description && (
        <p className="mt-3 flex-1 line-clamp-3 font-body text-sm leading-6 text-navy-500">
          {o.description}
        </p>
      )}

      {o.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {o.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-full bg-navy-50 px-2.5 py-1 font-body text-[11px] font-semibold text-navy-600"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {o.closing_date && (
        <p className="mt-4 font-body text-xs font-semibold text-navy-500">
          Closes: {new Date(o.closing_date).toLocaleDateString()}
        </p>
      )}

      <Link
        to={`/career-hub/opportunities/${o.id}`}
        className="btn-gold mt-5 inline-flex items-center gap-2 text-sm"
      >
        View
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </SectionCard>
  );
}

function OpportunitySkeleton() {
  return (
    <SectionCard className="animate-pulse p-6">
      <div className="h-5 w-20 rounded-full bg-navy-100" />
      <div className="mt-4 h-5 w-3/4 rounded bg-navy-100" />
      <div className="mt-2 h-4 w-1/2 rounded bg-navy-100" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-navy-100" />
        <div className="h-3 w-5/6 rounded bg-navy-100" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-navy-100" />
        <div className="h-6 w-20 rounded-full bg-navy-100" />
      </div>
    </SectionCard>
  );
}

function OpportunityErrorState({ onRetry }) {
  return (
    <SectionCard className="md:col-span-2">
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

function OpportunityEmptyState() {
  return (
    <SectionCard className="md:col-span-2">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-600">
          <Sparkles size={22} aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-base font-bold text-navy-900">
          Opportunities are currently being curated
        </h3>
        <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-navy-500">
          Published opportunities will appear here as the career team adds them.
          In the meantime, explore the Academy and Labs to build the skills that
          make you stand out.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/academy" className="btn-outline inline-flex items-center gap-2 text-sm">
            Explore Academy
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link to="/labs" className="btn-outline inline-flex items-center gap-2 text-sm">
            Explore Labs
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function CareerHub() {
  const [state, setState] = useState({ loading: true, error: false, data: [] });
  const [typeFilter, setTypeFilter] = useState('all');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));
    listCareerOpportunities()
      .then((rows) => {
        if (!cancelled) {
          setState({ loading: false, error: false, data: normalizeOpportunities(rows) });
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[CareerHub] Failed to load opportunities:', err);
        if (!cancelled) setState({ loading: false, error: true, data: [] });
      });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  const availableTypes = useMemo(() => {
    const set = new Set();
    state.data.forEach((o) => {
      if (o.opportunity_type) set.add(o.opportunity_type);
    });
    return [...set].sort();
  }, [state.data]);

  const filteredOpportunities = useMemo(() => {
    if (typeFilter === 'all') return state.data;
    return state.data.filter((o) => o.opportunity_type === typeFilter);
  }, [state.data, typeFilter]);

  useEffect(() => {
    if (typeFilter !== 'all' && !availableTypes.includes(typeFilter)) {
      setTypeFilter('all');
    }
  }, [availableTypes, typeFilter]);

  return (
    <>
      <Seo
        title="Career Hub — Turn Learning Into Opportunity"
        description="Career development, practical experience, credentials and real-world connections — everything you need to move from learning to earning."
        path="/career-hub"
      />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-28 pb-16 md:pt-32 md:pb-20">
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
          className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold-500/15 blur-[120px]"
          aria-hidden="true"
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 20, -20, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-[110px]"
          aria-hidden="true"
        />

        <div className="container-premium relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 font-body text-[11px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
              <Compass size={12} aria-hidden="true" />
              InnoSpeak Global Career Hub
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:text-6xl">
              Turn Learning Into
              <span className="block text-gradient-gold">Opportunity</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-[1.7] text-navy-200 sm:text-lg">
              Career development, practical experience, credentials and real-world
              connections — everything you need to move from learning to earning.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/career-hub/opportunities"
                className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto"
              >
                Explore Opportunities
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/learn/career"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 sm:w-auto"
              >
                Build My Career Profile
              </Link>
              <Link
                to="/career-hub/connections"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-3 font-body text-sm font-bold text-white/80 transition-colors hover:text-gold-300 sm:w-auto"
              >
                Explore Practical Connections
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Career Journey ═══ */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="The Journey"
            title="Your Journey From Learning to Opportunity"
            subtitle="Six connected stages — from the first course you take to the career progress you make."
          />

          <motion.ol
            variants={gridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {JOURNEY_STEPS.map(({ icon: Icon, title, description }, i) => (
              <motion.li
                key={title}
                variants={fadeUpItem}
                className="group relative rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
                    <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs font-bold text-navy-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                  {title}
                </h3>
                <p className="mt-2 font-body text-sm leading-6 text-navy-500">
                  {description}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ═══ Build Your Career ═══ */}
      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Build Your Career"
            title="Four areas of focused growth"
            subtitle="Everything you need to move from learning to earning — structured guidance, practical skills, real projects and recognised credentials."
          />

          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          >
            {DEVELOPMENT_AREAS.map(({ icon: Icon, title, description, href }) => (
              <motion.div key={title} variants={fadeUpItem} className="h-full">
                <Link
                  to={href}
                  className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
                    <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                    {title}
                  </h3>
                  <p className="mt-2 flex-1 font-body text-sm leading-6 text-navy-600">
                    {description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-body text-sm font-bold text-gold-700 transition-all duration-300 group-hover:gap-3">
                    Open
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Practical Connections ═══ */}
      <section id="practical-connections" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Practical Connections"
            title="Where skills meet real-world needs"
            subtitle="Go beyond learning. Apply your abilities through real projects, industry experiences, challenges, mentorship and community opportunities."
          />

          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {CONNECTION_TYPES.map(({ icon: Icon, title, description }) => (
              <motion.div key={title} variants={fadeUpItem} className="h-full">
                <Link
                  to="/career-hub/connections"
                  className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
                    <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-navy-900 transition-colors group-hover:text-gold-700">
                    {title}
                  </h3>
                  <p className="mt-2 flex-1 font-body text-sm leading-6 text-navy-500">
                    {description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-body text-sm font-bold text-gold-700 transition-all duration-300 group-hover:gap-3">
                    Explore
                    <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Opportunities ═══ */}
      <section id="opportunities" className="bg-cream py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Opportunities"
            title="Jobs, Internships, Projects & More"
            subtitle="Published opportunities from the InnoSpeak Global career team and partner organisations."
          />

          {!state.loading && !state.error && availableTypes.length > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold transition-all duration-200 ${
                  typeFilter === 'all'
                    ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                    : 'border-navy-100 bg-white text-navy-700 hover:border-gold-300 hover:text-gold-700'
                }`}
              >
                All
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold ${
                    typeFilter === 'all' ? 'bg-white/25 text-white' : 'bg-navy-100 text-navy-600'
                  }`}
                >
                  {state.data.length}
                </span>
              </button>
              {availableTypes.map((type) => {
                const isActive = typeFilter === type;
                const count = state.data.filter((o) => o.opportunity_type === type).length;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-semibold capitalize transition-all duration-200 ${
                      isActive
                        ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                        : 'border-navy-100 bg-white text-navy-700 hover:border-gold-300 hover:text-gold-700'
                    }`}
                  >
                    {type}
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

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {state.loading ? (
              <>
                <OpportunitySkeleton />
                <OpportunitySkeleton />
              </>
            ) : state.error ? (
              <OpportunityErrorState onRetry={retry} />
            ) : filteredOpportunities.length === 0 ? (
              <OpportunityEmptyState />
            ) : (
              filteredOpportunities.slice(0, 4).map((o) => (
                <OpportunityCard key={o.id} opportunity={o} />
              ))
            )}
          </div>

          {!state.loading && !state.error && state.data.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                to="/career-hub/opportunities"
                className="inline-flex items-center gap-2 font-body text-sm font-bold text-gold-700 transition-all hover:gap-3"
              >
                View all opportunities
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══ Career Profile preview ═══ */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inViewOnce}
              transition={{ duration: 0.5 }}
            >
              <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                Your Career Profile
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                A professional identity that proves what you can do
              </h2>
              <p className="mt-5 font-body text-base leading-[1.75] text-navy-600">
                Your Career Profile aggregates what you&apos;ve learned, built and
                earned across InnoSpeak — skills, credentials, projects, experience
                and availability — into one place. It grows as you grow.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/learn/career" className="btn-gold inline-flex items-center gap-2">
                  Build My Career Profile
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/learn/portfolio" className="btn-outline inline-flex items-center gap-2 text-sm">
                  View My Portfolio
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inViewOnce}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl border border-navy-100 bg-cream p-6 shadow-premium sm:p-7"
            >
              <p className="font-body text-[11px] font-bold uppercase tracking-wider text-navy-400">
                What your profile brings together
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  { icon: Award,      label: 'Credentials',  note: 'From completed courses' },
                  { icon: Rocket,     label: 'Projects',     note: 'From your Portfolio & Labs' },
                  { icon: BookOpen,   label: 'Skills',       note: 'Demonstrated through learning & assessment' },
                  { icon: BriefcaseBusiness, label: 'Experience', note: 'Entered by you, verified where possible' },
                  { icon: Target,     label: 'Career Goals', note: 'What you want to move toward' },
                  { icon: CalendarDays, label: 'Availability', note: 'When you\'re ready for the next step' },
                ].map(({ icon: Icon, label, note }) => (
                  <li key={label} className="flex items-start gap-3 rounded-2xl border border-navy-100 bg-white p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
                      <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-body text-sm font-bold text-navy-900">{label}</p>
                      <p className="font-body text-xs text-navy-500">{note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Career Development ═══ */}
      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Career Development"
            title="Tools for your career journey"
            subtitle="Practical resources and short courses that prepare you for the roles, projects and opportunities ahead."
          />

          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {CAREER_DEVELOPMENT_RESOURCES.map(({ title, description, href }) => (
              <motion.div key={title} variants={fadeUpItem} className="h-full">
                <Link
                  to={href}
                  className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
                >
                  <h3 className="font-display text-base font-bold text-navy-900 transition-colors group-hover:text-gold-700">
                    {title}
                  </h3>
                  <p className="mt-2 flex-1 font-body text-sm leading-6 text-navy-500">
                    {description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-body text-sm font-bold text-gold-700 transition-all duration-300 group-hover:gap-3">
                    Open
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Career Events ═══ */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Career Events"
            title="Fairs, workshops, mentorship and challenges"
            subtitle="Structured events that connect you with employers, mentors and practical opportunities."
          />

          <motion.ul
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-2"
          >
            {CAREER_EVENT_TYPES.map((label) => (
              <motion.li
                key={label}
                variants={fadeUpItem}
                className="rounded-full border border-navy-100 bg-cream px-4 py-2 font-body text-sm font-semibold text-navy-700"
              >
                {label}
              </motion.li>
            ))}
          </motion.ul>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/events" className="btn-gold inline-flex items-center gap-2">
              View All Events
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/foundation/events" className="btn-outline inline-flex items-center gap-2 text-sm">
              Foundation Events
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ For Employers ═══ */}
      <section className="bg-navy-900 py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <div className="mb-12 text-center">
            <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-300">
              For Employers & Organizations
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Connect with emerging talent
            </h2>
            <p className="mx-auto mt-3 max-w-2xl font-body text-sm leading-relaxed text-navy-200 sm:text-base">
              Work with learners who combine structured learning with practical
              evidence of what they can do.
            </p>
          </div>

          <motion.div
            variants={gridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {EMPLOYER_BENEFITS.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUpItem}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient text-navy-900 shadow-md">
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-white">
                  {title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-gold inline-flex items-center gap-2">
              Get in Touch
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/partnerships" className="btn-outline inline-flex items-center gap-2 border-white/30 text-white hover:bg-white hover:text-navy-900">
              Partnership Details
            </Link>
          </div>
        </div>
      </section>

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
              Ready to build your career?
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-[1.7] text-navy-200 sm:text-base lg:text-lg">
              Turn what you have learned into what you can do next.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link to="/learn/career" className="btn-gold inline-flex w-full items-center justify-center gap-2 px-7 py-3 sm:w-auto">
                Build My Career Profile
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300 sm:w-auto"
              >
                Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}