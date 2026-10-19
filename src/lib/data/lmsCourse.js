/**
 * lmsCourse — the bridge between the LMS and the public course catalogue.
 *
 * MODEL: programmeData.js is the source of truth for what each course IS.
 *        lms_courses is the source of truth for how it's TAUGHT (modules,
 *        lessons, progress, enrollment).
 *
 * Seeded catalogue courses use lms_courses.code; instructor-created courses
 * may link with programme_code. Both identifiers are supported.
 *
 * `resolveLmsCourse(lmsCourse)` returns a unified shape:
 *   - LMS-owned fields pass through
 *   - Catalogue fields (pathway, level, category, duration, division,
 *     studyMode, fees, code) are merged in when the link exists
 *   - When there's no link, LMS-native fields are used as fallbacks
 *
 * Nothing here is destructive — if the catalogue link is missing, the
 * LMS-only fields render exactly as they did before.
 */

import { getProgrammeByCode } from './programmeData.js';

/**
 * Merge an LMS course with its catalogue entry (if linked).
 *
 * @param {object} lmsCourse — row from `lms_courses`
 * @returns {object|null}
 */
export function resolveLmsCourse(lmsCourse) {
  if (!lmsCourse) return null;

  const code = lmsCourse.programme_code || lmsCourse.code || null;
  const catalogue = code ? getProgrammeByCode(code) : null;
  const hasCatalogueMatch = Boolean(catalogue);

  return {
    // ── LMS-owned (always present) ────────────────────────────
    id: lmsCourse.id,
    status: lmsCourse.status,
    estimated_hours: lmsCourse.estimated_hours,
    awards_certificate: lmsCourse.awards_certificate,

    // ── Identifiers ───────────────────────────────────────────
    code,                  // null when unlinked
    hasCatalogueMatch,

    // ── Display fields (catalogue first, LMS fallback) ────────
    title: catalogue?.name || lmsCourse.title || 'Untitled course',
    description:
      catalogue?.shortDescription || lmsCourse.description || '',

    // ── Taxonomy — only from the catalogue ────────────────────
    division: catalogue?.division || lmsCourse.division || 'academy',
    pathway: catalogue?.category || lmsCourse.category || null,
    pathwayId: catalogue?.pathwayId || null,
    level: catalogue?.level || lmsCourse.level || null,
    studyMode: catalogue?.studyMode || null,
    duration: catalogue?.duration || lmsCourse.duration || null,
    fees: catalogue?.fees || null,
    feesUSD: catalogue?.feesUSD ?? null,
    isFree: catalogue?.isFree === true,
    certificatePriceUSD: catalogue?.certificatePriceUSD ?? null,
    featured: catalogue?.featured || false,

    // ── Pass-through — components may need the raw LMS record ─
    _lms: lmsCourse,
    _catalogue: catalogue,
  };
}

/** Bulk variant. */
export function resolveLmsCourses(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(resolveLmsCourse).filter(Boolean);
}

/**
 * Division label + styling token, keyed by division.
 * Kept here (not in the component) so the same tokens are used everywhere.
 */
export const DIVISION_TOKENS = {
  academy: {
    label: 'Academy',
    chip: 'bg-gold-500/10 text-gold-700 ring-gold-500/20',
    dot: 'bg-gold-500',
  },
  labs: {
    label: 'Labs',
    chip: 'bg-navy-900 text-gold-300 ring-navy-800',
    dot: 'bg-navy-700',
  },
  foundation: {
    label: 'Foundation',
    chip: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20',
    dot: 'bg-emerald-600',
  },
};