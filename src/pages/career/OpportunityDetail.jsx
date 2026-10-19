import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  GraduationCap,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import HeroBackground from '../../components/ui/HeroBackground.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import { LoadingState } from '../../components/portal/PortalStates.jsx';
import ApplyForm from '../../components/career/ApplyForm.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../lib/motion/presets';
import { listCareerOpportunities } from '../../lib/supabase/platform.js';
import { normalizeOpportunities, deadlineInfo } from '../../lib/data/opportunities';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCareerProfile, scoreOpportunity } from '../../lib/data/matching';
import { WhyThisMatches } from '../../components/career/RecommendedSection.jsx';

const container = staggerContainer(0.08, 0.08);

/* ──────────────────────────────────────────────────────────────
   Related card (compact)
   ────────────────────────────────────────────────────────────── */

function RelatedCard({ opportunity: o }) {
  return (
    <Link
      to={`/career-hub/opportunities/${o.id}`}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
    >
      <span className="w-fit rounded-full bg-gold-500/10 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
        {o.opportunity_type}
      </span>
      <h3 className="mt-3 font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700">
        {o.title}
      </h3>
      {o.organisation && (
        <p className="mt-1 font-body text-xs font-semibold text-navy-500">
          {o.organisation}
        </p>
      )}
      <span className="mt-auto pt-4 inline-flex items-center gap-1 font-body text-xs font-bold text-gold-700 transition-all duration-300 group-hover:gap-2">
        View
        <ArrowRight size={12} aria-hidden="true" />
      </span>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────
   Meta item
   ────────────────────────────────────────────────────────────── */

function MetaItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-700">
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div>
        <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
          {label}
        </p>
        <p className="mt-0.5 font-body text-sm font-semibold text-navy-900">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Not found
   ────────────────────────────────────────────────────────────── */

function NotFound() {
  return (
    <>
      <Seo
        title="Opportunity Not Found"
        description="This opportunity could not be found."
        path="/career-hub/opportunities"
      />
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-32 pb-24">
        <HeroBackground variant="professional" />
        <div className="container-premium relative z-10 text-center">
          <BriefcaseBusiness size={40} className="mx-auto text-gold-400" aria-hidden="true" />
          <h1 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">
            Opportunity not found
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-sm leading-6 text-navy-200 sm:text-base">
            This opportunity may have closed or been removed.
          </p>
          <Link
            to="/career-hub/opportunities"
            className="btn-gold mt-8 inline-flex items-center gap-2 px-7 py-3"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            All Opportunities
          </Link>
        </div>
      </section>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main page
   ────────────────────────────────────────────────────────────── */

export default function OpportunityDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, error: false, opportunity: null, all: [] });
  const [reloadKey, setReloadKey] = useState(0);

  // Signed-in learner profile — used for "Why this matches you". Never blocks the page.
  const { user } = useAuth();
  const { profile } = useCareerProfile(user);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: false }));

    listCareerOpportunities()
      .then((rows) => {
        if (cancelled) return;
        const normalized = normalizeOpportunities(rows);
        const match = normalized.find((o) => String(o.id) === String(id)) || null;
        setState({
          loading: false,
          error: false,
          opportunity: match,
          all: normalized,
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[OpportunityDetail] load failed:', err);
        if (!cancelled) setState({ loading: false, error: true, opportunity: null, all: [] });
      });

    return () => { cancelled = true; };
  }, [id, reloadKey]);

  const related = useMemo(() => {
    if (!state.opportunity || state.all.length === 0) return [];
    const current = state.opportunity;
    return state.all
      .filter(
        (o) =>
          o.id !== current.id &&
          (o.opportunity_type === current.opportunity_type ||
            o.skills.some((s) => current.skills.includes(s)))
      )
      .slice(0, 3);
  }, [state.opportunity, state.all]);

  // Match score against the signed-in learner — null when not signed in.
  const matchResult = useMemo(
    () => (profile && state.opportunity ? scoreOpportunity(state.opportunity, profile) : null),
    [profile, state.opportunity]
  );

  if (state.loading) {
    return (
      <>
        <Seo title="Loading… | InnoSpeak Global" description="Loading opportunity." path={`/career-hub/opportunities/${id}`} />
        <section className="bg-cream pt-32 pb-16">
          <div className="container-premium">
            <SectionCard>
              <LoadingState />
            </SectionCard>
          </div>
        </section>
      </>
    );
  }

  if (state.error) {
    return (
      <>
        <Seo title="Opportunity | InnoSpeak Global" description="Opportunity." path={`/career-hub/opportunities/${id}`} />
        <section className="bg-cream pt-32 pb-16">
          <div className="container-premium">
            <SectionCard>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-base font-bold text-navy-900">
                    Unable to load this opportunity right now
                  </h2>
                  <p className="mt-1 font-body text-sm text-navy-500">
                    Please try again shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="btn-outline inline-flex items-center gap-2 text-sm"
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  Retry
                </button>
              </div>
            </SectionCard>
          </div>
        </section>
      </>
    );
  }

  const o = state.opportunity;
  if (!o) return <NotFound />;

  const deadline = deadlineInfo(o.closing_date);
  const method = o.application_method || (o.application_url ? 'external' : 'internal');
  const showExternal = (method === 'external' || method === 'both') && o.application_url;
  const showInternal = method === 'internal' || method === 'both';

  return (
    <>
      <Seo
        title={`${o.title} — ${o.organisation || 'Opportunity'} | InnoSpeak Global`}
        description={o.description?.slice(0, 155) || 'Career opportunity.'}
        path={`/career-hub/opportunities/${o.id}`}
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 pt-28 pb-12 md:pt-32 md:pb-16">
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
              to="/career-hub/opportunities"
              className="inline-flex items-center gap-2 font-body text-xs font-semibold text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              All Opportunities
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-sm">
                {o.opportunity_type}
              </span>
              {o.featured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold-400/40 bg-gold-500/10 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-gold-300">
                  <Sparkles size={11} aria-hidden="true" />
                  Featured
                </span>
              )}
              {o.verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  <ShieldCheck size={11} aria-hidden="true" />
                  Verified
                </span>
              )}
            </div>

            <h1 className="mt-5 font-display text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              {o.title}
            </h1>

            {o.organisation && (
              <p className="mt-4 inline-flex items-center gap-2 font-body text-base font-semibold text-navy-200 sm:text-lg">
                <Building2 size={16} className="text-gold-400" aria-hidden="true" />
                {o.organisation}
              </p>
            )}

            {o.description && (
              <p className="mt-5 max-w-2xl font-body text-base leading-[1.7] text-navy-200 sm:text-lg">
                {o.description}
              </p>
            )}

            {/* Primary CTA — external link if external/both */}
            {showExternal && (
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={o.application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-gold inline-flex items-center gap-2 px-7 py-3"
                >
                  Apply Externally
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
                {showInternal && (
                  <a
                    href="#apply-inline"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3 font-body text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold-400 hover:bg-white/10 hover:text-gold-300"
                  >
                    Apply in Platform
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-cream py-12 sm:py-16 lg:py-20">
        <div className="container-premium">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
            {/* Left: details */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              className="space-y-6"
            >
              <motion.div variants={fadeUpItem}>
                <SectionCard title="Details">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <MetaItem icon={MapPin} label="Location" value={o.location || (o.mode === 'Remote' ? 'Remote' : null)} />
                    <MetaItem icon={Compass} label="Mode" value={o.mode} />
                    <MetaItem icon={BriefcaseBusiness} label="Type" value={o.opportunity_type} />
                    <MetaItem icon={GraduationCap} label="Level" value={o.level} />
                    <MetaItem icon={Clock} label="Duration" value={o.duration} />
                    <MetaItem icon={Tag} label="Compensation" value={o.compensation} />
                    <MetaItem
                      icon={Calendar}
                      label="Start date"
                      value={o.start_date ? new Date(o.start_date).toLocaleDateString() : null}
                    />
                    <MetaItem
                      icon={Calendar}
                      label="Application deadline"
                      value={
                        o.closing_date
                          ? new Date(o.closing_date).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })
                          : null
                      }
                    />
                  </div>
                  {deadline && (
                    <p
                      className={`mt-5 rounded-xl border px-4 py-3 font-body text-sm font-semibold ${
                        deadline.expired
                          ? 'border-navy-200 bg-navy-50 text-navy-500'
                          : deadline.urgent
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-gold-200 bg-gold-50 text-gold-800'
                      }`}
                    >
                      {deadline.label}
                    </p>
                  )}
                </SectionCard>
              </motion.div>

              {o.requirements.length > 0 && (
                <motion.div variants={fadeUpItem}>
                  <SectionCard title="Requirements">
                    <ul className="space-y-2.5">
                      {o.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 flex-shrink-0 text-emerald-600"
                            aria-hidden="true"
                          />
                          <span className="font-body text-sm leading-6 text-navy-700">
                            {req}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                </motion.div>
              )}

              {o.skills.length > 0 && (
                <motion.div variants={fadeUpItem}>
                  <SectionCard title="Skills">
                    <div className="flex flex-wrap gap-2">
                      {o.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-navy-50 px-3 py-1.5 font-body text-xs font-semibold text-navy-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </SectionCard>
                </motion.div>
              )}

              {o.description && (
                <motion.div variants={fadeUpItem}>
                  <SectionCard title="About This Opportunity">
                    <p className="whitespace-pre-wrap font-body text-sm leading-7 text-navy-600">
                      {o.description}
                    </p>
                  </SectionCard>
                </motion.div>
              )}
            </motion.div>

            {/* Right: sidebar */}
            <motion.aside
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={inViewOnce}
              className="space-y-6 lg:sticky lg:top-24 lg:h-fit"
            >
              {/* Why this matches you — only when signed in with a positive match */}
              {matchResult && matchResult.score > 0 && (
                <motion.div variants={fadeUpItem}>
                  <WhyThisMatches match={matchResult} />
                </motion.div>
              )}

              {/* In-app application */}
              {showInternal && (
                <motion.div variants={fadeUpItem} id="apply-inline">
                  <SectionCard title="Apply for This Opportunity">
                    <ApplyForm opportunity={o} />
                  </SectionCard>
                </motion.div>
              )}

              {/* External-only fallback */}
              {!showInternal && showExternal && (
                <motion.div variants={fadeUpItem}>
                  <SectionCard title="Ready to Apply?">
                    <p className="font-body text-sm leading-6 text-navy-500">
                      This opportunity accepts applications through an external form.
                    </p>
                    <a
                      href={o.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-gold mt-5 inline-flex w-full items-center justify-center gap-2 text-sm"
                    >
                      Apply Now
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </SectionCard>
                </motion.div>
              )}

              <motion.div variants={fadeUpItem}>
                <SectionCard title="Organisation">
                  <p className="font-body text-sm font-bold text-navy-900">
                    {o.organisation || 'InnoSpeak Global'}
                  </p>
                  <p className="mt-2 font-body text-xs leading-5 text-navy-500">
                    This opportunity was published through the InnoSpeak Global
                    career team.
                  </p>
                  <Link
                    to="/learn/career"
                    className="mt-4 inline-flex items-center gap-1.5 font-body text-xs font-bold text-gold-700 hover:text-gold-800"
                  >
                    View My Career Profile
                    <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                </SectionCard>
              </motion.div>
            </motion.aside>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-16">
              <div className="mb-8 text-center">
                <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-gold-700">
                  Related Opportunities
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
                  You may also be interested in
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <RelatedCard key={r.id} opportunity={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}