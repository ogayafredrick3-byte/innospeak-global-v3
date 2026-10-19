import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Compass,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  Users,
  UserRound,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import HeroBackground from '../../components/ui/HeroBackground.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../lib/motion/presets';
import { listCareerOpportunities } from '../../lib/supabase/platform.js';
import { normalizeOpportunities } from '../../lib/data/opportunities';

const container = staggerContainer(0.06, 0.1);

/* ──────────────────────────────────────────────────────────────
   Category map — spec §10
   Each category declares which opportunity_type values belong
   to it. Adding new types later (via the admin form) auto-surfaces
   here without code changes to this file.
   ────────────────────────────────────────────────────────────── */

const CONNECTION_CATEGORIES = [
  {
    id: 'projects',
    icon: Target,
    title: 'Real-World Projects',
    description:
      'Organisations submit practical problems. You deliver, gain evidence, and build a track record.',
    includes: [
      'Build a website or app',
      'Design an electrical solution',
      'Develop a data system',
      'Create a training programme',
    ],
    matchTypes: ['project'],
    filterType: 'project',
  },
  {
    id: 'industry',
    icon: Building2,
    title: 'Industry Experience',
    description:
      'Internships, industrial attachments, apprenticeships and structured workplace learning.',
    includes: ['Internships', 'Industrial attachments', 'Apprenticeships', 'Workplace learning'],
    matchTypes: ['internship', 'attachment', 'apprenticeship'],
    filterType: 'internship',
  },
  {
    id: 'challenges',
    icon: Lightbulb,
    title: 'Innovation Challenges',
    description:
      'Technical challenges, competitions, hackathons and solution-building sprints.',
    includes: ['Technical challenges', 'Competitions', 'Hackathons', 'Innovation sprints'],
    matchTypes: ['challenge', 'competition'],
    filterType: 'challenge',
  },
  {
    id: 'community',
    icon: Users,
    title: 'Community Projects',
    description:
      'Use your skills to contribute to meaningful community and development work.',
    includes: ['Community programmes', 'Non-profit projects', 'Development initiatives', 'Volunteer work'],
    matchTypes: ['community', 'volunteer'],
    filterType: 'volunteer',
  },
  {
    id: 'freelance',
    icon: BriefcaseBusiness,
    title: 'Freelance & Service',
    description:
      'Short-term and project-based paid work that builds both income and experience.',
    includes: ['Freelance contracts', 'Short-term engagements', 'Service projects', 'Consulting work'],
    matchTypes: ['freelance', 'service', 'contract'],
    filterType: 'freelance',
  },
  {
    id: 'mentorship',
    icon: UserRound,
    title: 'Mentorship & Industry',
    description:
      'Structured connections with experienced professionals and industry partners.',
    includes: ['One-to-one mentoring', 'Industry talks', 'Career advice', 'Professional networks'],
    matchTypes: ['mentorship'],
    filterType: 'mentorship',
    fallbackHref: '/learn/mentorship',
    fallbackLabel: 'Request a Mentor',
  },
];

/* ──────────────────────────────────────────────────────────────
   Category card
   ────────────────────────────────────────────────────────────── */

function ConnectionCard({ category, count, status }) {
  const Icon = category.icon;
  const hasLiveOpportunities = status === 'ready' && count > 0;

  return (
    <motion.div variants={fadeUpItem} className="h-full">
      <div className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors duration-300 group-hover:bg-gold-gradient group-hover:text-navy-900">
            <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
          </div>
          {hasLiveOpportunities && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles size={10} aria-hidden="true" />
              {count} live
            </span>
          )}
        </div>

        {/* Title + description */}
        <h3 className="mt-5 font-display text-lg font-bold text-navy-900">
          {category.title}
        </h3>
        <p className="mt-2 font-body text-sm leading-6 text-navy-500">
          {category.description}
        </p>

        {/* Includes list */}
        <div className="mt-5 flex-1 border-t border-navy-100 pt-5">
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
            This includes
          </p>
          <ul className="mt-3 space-y-2">
            {category.includes.map((item) => (
              <li key={item} className="flex items-start gap-2 font-body text-sm text-navy-600">
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-navy-100 pt-5">
          {hasLiveOpportunities ? (
            <Link
              to={`/career-hub/opportunities?type=${category.filterType}`}
              className="btn-gold inline-flex items-center gap-2 text-sm"
            >
              Browse {count === 1 ? 'opportunity' : 'opportunities'}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ) : category.fallbackHref ? (
            <Link
              to={category.fallbackHref}
              className="btn-gold inline-flex items-center gap-2 text-sm"
            >
              {category.fallbackLabel || 'Open'}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ) : (
            <Link
              to={`/career-hub/opportunities?type=${category.filterType}`}
              className="inline-flex items-center gap-2 font-body text-sm font-bold text-gold-700 transition-all duration-300 hover:gap-3"
            >
              Browse when available
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
          {hasLiveOpportunities && category.fallbackHref && (
            <Link
              to={category.fallbackHref}
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-navy-600 transition-colors hover:text-gold-700"
            >
              {category.fallbackLabel || 'Also see'}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function Connections() {
  const [state, setState] = useState({
    status: 'loading', // 'loading' | 'ready' | 'error'
    opportunities: [],
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', opportunities: [] });
    listCareerOpportunities()
      .then((rows) => {
        if (!cancelled) {
          setState({
            status: 'ready',
            opportunities: normalizeOpportunities(rows),
          });
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[Connections] load failed:', err);
        if (!cancelled) {
          setState({ status: 'error', opportunities: [] });
        }
      });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const counts = useMemo(() => {
    const map = {};
    CONNECTION_CATEGORIES.forEach((c) => {
      map[c.id] = state.opportunities.filter((o) =>
        c.matchTypes.includes(o.opportunity_type)
      ).length;
    });
    return map;
  }, [state.opportunities]);

  return (
    <>
      <Seo
        title="Practical Connections — Career Hub"
        description="Where skills meet real-world needs. Projects, industry experience, challenges, community work, freelance and mentorship."
        path="/career-hub/connections"
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
          className="pointer-events-none absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-gold-500/15 blur-[120px]"
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

            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-2 font-body text-[11px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
              <Compass size={12} aria-hidden="true" />
              Practical Connections
            </span>

            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:text-6xl">
              Where skills meet
              <span className="block text-gradient-gold">real-world needs</span>
            </h1>

            <p className="mt-6 max-w-2xl font-body text-base leading-[1.7] text-navy-200 sm:text-lg">
              Go beyond learning. Apply your abilities through real projects,
              industry experiences, challenges, mentorship and community
              opportunities.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/career-hub/opportunities"
                className="btn-gold inline-flex items-center gap-2 px-7 py-3"
              >
                Browse All Opportunities
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/learn/career"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300"
              >
                Build My Career Profile
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Intro ═══ */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Six Ways To Connect"
            title="Choose the experience that fits your goals"
            subtitle="Every opportunity you complete becomes evidence in your portfolio and strengthens your career profile."
          />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={inViewOnce}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:gap-6"
          >
            {CONNECTION_CATEGORIES.map((category) => (
              <ConnectionCard
                key={category.id}
                category={category}
                count={counts[category.id] || 0}
                status={state.status}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Cross-links ═══ */}
      <section className="bg-cream py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <SectionHeading
            eyebrow="Related Areas"
            title="Keep building your career"
            subtitle="Skills, credentials and profile all work together with practical experience."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'My Portfolio', href: '/learn/portfolio', description: 'Showcase the projects you\u2019ve built.' },
              { title: 'My Career Profile', href: '/learn/career', description: 'See how your skills and evidence aggregate.' },
              { title: 'My Applications', href: '/learn/applications', description: 'Track every opportunity you\u2019ve applied for.' },
              { title: 'Mentorship', href: '/learn/mentorship', description: 'Request structured guidance from professionals.' },
            ].map(({ title, href, description }) => (
              <Link
                key={title}
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
            ))}
          </div>
        </div>
      </section>

      {/* ═══ For Organisations ═══ */}
      <section className="bg-navy-900 py-16 sm:py-20 lg:py-24">
        <div className="container-premium">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-300">
              For Organisations
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Have a problem worth solving?
            </h2>
            <p className="mt-5 font-body text-base leading-[1.7] text-navy-200">
              Submit a real-world project or challenge. Learners apply their
              skills, deliver, and gain practical experience — while you get
              fresh thinking on a real problem.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn-gold inline-flex items-center gap-2 px-7 py-3">
                Submit a Project
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/partnerships"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300"
              >
                Partnership Details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}