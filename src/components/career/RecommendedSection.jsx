import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import SectionCard from '../portal/SectionCard.jsx';
import { staggerContainer, fadeUpItem, inViewOnce } from '../../lib/motion/presets';

const container = staggerContainer(0.08, 0.1);

/* ──────────────────────────────────────────────────────────────
   Reason chip — icon depends on reason type
   ────────────────────────────────────────────────────────────── */

const REASON_ICONS = {
  skill:    CheckCircle2,
  goal:     Target,
  evidence: Award,
};

function ReasonChip({ reason }) {
  const Icon = REASON_ICONS[reason.type] || CheckCircle2;
  return (
    <span className="inline-flex items-start gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 font-body text-[11px] font-semibold leading-tight text-emerald-800">
      <Icon size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span className="text-left">{reason.label}</span>
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   Recommended card — compact, reasons-first
   ────────────────────────────────────────────────────────────── */

function RecommendedCard({ match }) {
  const o = match.opportunity;

  return (
    <Link
      to={`/career-hub/opportunities/${o.id}`}
      className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:border-gold-300/60 hover:shadow-premium-lg"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-gold-500/10 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
          {o.opportunity_type}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-navy-900 px-2.5 py-0.5 font-mono text-[10px] font-bold text-gold-400">
          {match.score}
          <span className="opacity-60">%</span>
        </span>
      </div>

      {/* Title + org */}
      <h3 className="mt-3 font-display text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-gold-700">
        {o.title}
      </h3>
      {o.organisation && (
        <p className="mt-1 font-body text-xs font-semibold text-navy-500">
          {o.organisation}
        </p>
      )}

      {/* Location/mode */}
      {(o.location || o.mode) && (
        <p className="mt-2 inline-flex items-center gap-1.5 font-body text-[11px] text-navy-400">
          <MapPin size={11} aria-hidden="true" />
          {o.location || o.mode}
          {o.mode && o.location ? ` · ${o.mode}` : ''}
        </p>
      )}

      {/* Reasons — the whole point of this component */}
      {match.reasons.length > 0 && (
        <div className="mt-4 flex-1 border-t border-navy-100 pt-4">
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-navy-400">
            Why this matches
          </p>
          <div className="mt-2 space-y-1.5">
            {match.reasons.slice(0, 3).map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                <span className="font-body text-xs leading-5 text-navy-600">
                  {reason.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 inline-flex items-center gap-1.5 font-body text-xs font-bold text-gold-700 transition-all duration-300 group-hover:gap-2.5">
        View opportunity
        <ArrowRight size={12} aria-hidden="true" />
      </div>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────
   RecommendedSection — used on listing + Career Profile
   ────────────────────────────────────────────────────────────── */

/**
 * RecommendedSection — shows top matched opportunities for the current
 * learner. Renders nothing if the user isn't signed in, has no profile
 * data, or there are no matches. Designed to slot above the main grid.
 */
export function RecommendedSection({ matches, title = 'Recommended for You', subtitle = 'Based on your skills and goals — always explainable.', compact = false }) {
  if (!matches || matches.length === 0) return null;

  const visible = compact ? matches.slice(0, 3) : matches.slice(0, 3);

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-gold-50 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-gold-700">
            <Sparkles size={11} aria-hidden="true" />
            Matched to your profile
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 font-body text-sm text-navy-500">{subtitle}</p>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={inViewOnce}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
      >
        {visible.map((match) => (
          <motion.div key={match.opportunity.id} variants={fadeUpItem} className="h-full">
            <RecommendedCard match={match} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   WhyThisMatches — sidebar card for the detail page
   ────────────────────────────────────────────────────────────── */

/**
 * WhyThisMatches — shows the specific reasons an opportunity matches
 * the current learner's profile. Renders nothing when there are no
 * reasons (i.e. the user isn't signed in, or the match score is 0).
 */
export function WhyThisMatches({ match }) {
  if (!match || match.score === 0 || match.reasons.length === 0) return null;

  return (
    <SectionCard title="Why This Matches You">
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-emerald-50 to-white p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
          <TrendingUp size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-lg font-bold leading-none text-navy-900">
            {match.score}
            <span className="ml-0.5 font-body text-sm font-semibold text-navy-400">% match</span>
          </p>
          <p className="mt-0.5 font-body text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Based on your profile
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {match.reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <p className="font-body text-sm font-semibold text-navy-800">
                {reason.label}
              </p>
              {reason.detail?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {reason.detail.slice(0, 4).map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-navy-50 px-2 py-0.5 font-body text-[10px] font-semibold text-navy-600"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}