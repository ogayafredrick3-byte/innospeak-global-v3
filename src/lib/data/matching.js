/**
 * matching — transparent skill/goal matching between learners and
 * opportunities (spec §21).
 *
 * No AI, no black box. Every recommendation is explainable:
 *   "Why this matches: ✓ Matches your Python skill ✓ Aligned with your goals"
 *
 * Derives from data already aggregated in careerProfile.js — no new
 * tables, no new schema.
 */

import { useEffect, useState } from 'react';
import { buildCareerProfile } from './careerProfile';

/* ──────────────────────────────────────────────────────────────
   Scoring weights — tune from one place
   ────────────────────────────────────────────────────────────── */

const WEIGHTS = {
  SKILL_MATCH: 40,
  GOAL_MATCH: 15,
  MAX_SCORE: 100,
};

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'against', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'each', 'from', 'further', 'have', 'having',
  'here', 'into', 'more', 'most', 'only', 'other', 'over', 'same', 'should',
  'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'under', 'until', 'very', 'were',
  'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your', 'yours',
  'also', 'just', 'like', 'make', 'want', 'need', 'help', 'work', 'role',
]);

/* ──────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────── */

function normalize(str) {
  return String(str || '').toLowerCase().trim();
}

function contentWords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

/** True if two skill strings overlap (substring match, case-insensitive). */
function skillsOverlap(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

/* ──────────────────────────────────────────────────────────────
   Core scoring
   ────────────────────────────────────────────────────────────── */

/**
 * Score a single opportunity against an aggregated career profile.
 * Returns { score: 0-100, reasons: [{ type, label, detail }] }.
 *
 * Reasons are always shown to the user — that's the whole point.
 */
export function scoreOpportunity(opportunity, profile) {
  if (!opportunity || !profile) return { score: 0, reasons: [] };

  const reasons = [];
  let score = 0;

  /* ── 1. Skill overlap ──────────────────────────────────── */
  const oppSkills = (opportunity.skills || []).filter(Boolean);
  const learnerSkills = (profile.skills || []).map((s) => s.name).filter(Boolean);

  const matchedSkills = oppSkills.filter((oppSkill) =>
    learnerSkills.some((learnerSkill) => skillsOverlap(oppSkill, learnerSkill))
  );

  if (matchedSkills.length > 0) {
    score += matchedSkills.length * WEIGHTS.SKILL_MATCH;
    reasons.push({
      type: 'skill',
      label:
        matchedSkills.length === 1
          ? `Matches your ${matchedSkills[0]} skill`
          : `Matches ${matchedSkills.length} of your skills`,
      detail: matchedSkills,
    });
  }

  /* ── 2. Goal alignment ─────────────────────────────────── */
  const goalText = [
    ...(profile.goals || []).map((g) => `${g.title || ''} ${g.description || ''}`),
  ].join(' ');

  if (goalText.trim()) {
    const oppWords = new Set([
      ...contentWords(opportunity.title),
      ...contentWords(opportunity.description),
    ]);
    const goalWords = new Set(contentWords(goalText));

    const matched = [...oppWords].filter((w) => goalWords.has(w));

    if (matched.length > 0) {
      score += matched.length * WEIGHTS.GOAL_MATCH;
      reasons.push({
        type: 'goal',
        label:
          matched.length === 1
            ? 'Aligned with one of your active goals'
            : 'Aligned with your active goals',
        detail: matched.slice(0, 3),
      });
    }
  }

  /* ── 3. Bonus for having evidence ──────────────────────── */
  const hasProof = (profile.certificates?.length || 0) > 0 || (profile.portfolio?.length || 0) > 0;
  if (hasProof && score > 0) {
    reasons.push({
      type: 'evidence',
      label: 'You have relevant evidence in your profile',
      detail: [],
    });
  }

  return {
    score: Math.min(WEIGHTS.MAX_SCORE, score),
    reasons,
  };
}

/**
 * Match a list of opportunities against a profile.
 * Returns [{ opportunity, score, reasons }], sorted by score desc,
 * filtered to only positive matches.
 */
export function matchOpportunities(opportunities, profile, { limit } = {}) {
  if (!Array.isArray(opportunities) || !profile) return [];

  const scored = opportunities
    .map((opportunity) => ({
      opportunity,
      ...scoreOpportunity(opportunity, profile),
    }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  return typeof limit === 'number' ? scored.slice(0, limit) : scored;
}

/* ──────────────────────────────────────────────────────────────
   React hook — fetches the aggregated profile once per user
   ────────────────────────────────────────────────────────────── */

/**
 * useCareerProfile — loads the aggregated career profile for the
 * current user. Returns null when not signed in. Never throws.
 */
export function useCareerProfile(user) {
  const [state, setState] = useState({ loading: true, profile: null });

  useEffect(() => {
    if (!user?.id) {
      setState({ loading: false, profile: null });
      return undefined;
    }

    let cancelled = false;
    setState({ loading: true, profile: null });

    buildCareerProfile()
      .then((profile) => {
        if (!cancelled) setState({ loading: false, profile });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, profile: null });
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  return state;
}