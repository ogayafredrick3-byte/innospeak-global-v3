/**
 * opportunities — public opportunity model (spec §12).
 *
 * Reads the existing `career_opportunities` table. Extended fields
 * (mode, level, duration, compensation, requirements, verified, featured)
 * are OPTIONAL — old rows without them still render correctly.
 *
 * Schema migration that unlocks the full model is documented at the bottom
 * of this file. Adding the columns is safe and non-breaking.
 */

/* ──────────────────────────────────────────────────────────────
   Normalization — one shape for the whole app
   ────────────────────────────────────────────────────────────── */

export const OPPORTUNITY_MODES = ['On-site', 'Hybrid', 'Remote'];
export const OPPORTUNITY_LEVELS = ['Entry', 'Intermediate', 'Advanced'];

/**
 * Convert a raw DB row into the shape the UI expects.
 * Never throws — missing fields become safe defaults.
 */
export function normalizeOpportunity(row) {
  if (!row) return null;

  // Legacy `remote: boolean` maps to a mode when `mode` is absent
  const mode =
    row.mode ||
    (row.remote === true ? 'Remote' : row.location ? 'On-site' : 'Remote');

  return {
    id: row.id,
    title: row.title || 'Untitled opportunity',
    organisation: row.organisation || '',
    opportunity_type: (row.opportunity_type || 'opportunity').toLowerCase(),
    category: row.category || null,
    description: row.description || '',
    skills: Array.isArray(row.skills) ? row.skills.filter(Boolean) : [],
    level: row.level || null,
    mode,
    location: row.location || '',
    remote: row.remote === true || mode === 'Remote',
    duration: row.duration || null,
    compensation: row.compensation || null,
    start_date: row.start_date || null,
    closing_date: row.closing_date || null,
    requirements: Array.isArray(row.requirements) ? row.requirements.filter(Boolean) : [],
    application_url: row.application_url || null,
    application_method: row.application_method || (row.application_url ? 'external' : 'contact'),
    status: row.status || (row.published === false ? 'draft' : 'published'),
    featured: row.featured === true,
    verified: row.verified === true,
    created_at: row.created_at || null,
    published_at: row.published_at || row.created_at || null,
  };
}

export function normalizeOpportunities(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeOpportunity).filter(Boolean);
}

/* ──────────────────────────────────────────────────────────────
   Filtering
   ────────────────────────────────────────────────────────────── */

/**
 * Filter a normalized opportunity list.
 * Every filter is optional — null / 'all' / empty string means "no filter".
 */
export function filterOpportunities(opportunities, filters = {}) {
  const { query = '', type = 'all', mode = 'all', level = 'all', hideExpired = false } = filters;
  const q = query.trim().toLowerCase();
  const now = Date.now();

  return opportunities.filter((o) => {
    if (type !== 'all' && o.opportunity_type !== type) return false;
    if (mode !== 'all' && o.mode !== mode) return false;
    if (level !== 'all' && o.level !== level) return false;

    if (hideExpired && o.closing_date) {
      const closes = new Date(o.closing_date).getTime();
      if (!Number.isNaN(closes) && closes < now) return false;
    }

    if (!q) return true;

    const haystack = `${o.title} ${o.organisation} ${o.description} ${o.location} ${o.skills.join(' ')}`.toLowerCase();
    return haystack.includes(q);
  });
}

/**
 * Sort priority:
 *   1. Featured
 *   2. Verified
 *   3. Closing soon (earliest deadline first, undefined last)
 *   4. Most recently created
 */
export function sortOpportunities(opportunities) {
  return [...opportunities].sort((a, b) => {
    if (a.featured !== b.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    if (a.verified !== b.verified) return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);

    const aClose = a.closing_date ? new Date(a.closing_date).getTime() : Infinity;
    const bClose = b.closing_date ? new Date(b.closing_date).getTime() : Infinity;
    if (aClose !== bClose) return aClose - bClose;

    const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bCreated - aCreated;
  });
}

/* ──────────────────────────────────────────────────────────────
   Facet helpers — build filter options from what actually exists
   ────────────────────────────────────────────────────────────── */

export function availableTypes(opportunities) {
  const set = new Set();
  opportunities.forEach((o) => o.opportunity_type && set.add(o.opportunity_type));
  return [...set].sort();
}

export function availableModes(opportunities) {
  const set = new Set();
  opportunities.forEach((o) => o.mode && set.add(o.mode));
  return OPPORTUNITY_MODES.filter((m) => set.has(m));
}

export function availableLevels(opportunities) {
  const set = new Set();
  opportunities.forEach((o) => o.level && set.add(o.level));
  return OPPORTUNITY_LEVELS.filter((l) => set.has(l));
}

/* ──────────────────────────────────────────────────────────────
   Display helpers
   ────────────────────────────────────────────────────────────── */

/**
 * Human-readable closing date with proximity hint.
 * Returns { label, urgent, expired }.
 */
export function deadlineInfo(closingDate) {
  if (!closingDate) return null;
  const closes = new Date(closingDate).getTime();
  if (Number.isNaN(closes)) return null;

  const now = Date.now();
  const days = Math.ceil((closes - now) / (1000 * 60 * 60 * 24));

  if (days < 0) return { label: 'Closed', urgent: false, expired: true };
  if (days === 0) return { label: 'Closes today', urgent: true, expired: false };
  if (days === 1) return { label: 'Closes tomorrow', urgent: true, expired: false };
  if (days <= 7) return { label: `Closes in ${days} days`, urgent: true, expired: false };

  return {
    label: `Closes ${new Date(closingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    urgent: false,
    expired: false,
  };
}

/* ──────────────────────────────────────────────────────────────
   §12 — Schema migration (run this when ready to unlock the full model)
   ──────────────────────────────────────────────────────────────

   ALTER TABLE career_opportunities
     ADD COLUMN IF NOT EXISTS category            text,
     ADD COLUMN IF NOT EXISTS mode                text,   -- 'On-site' | 'Hybrid' | 'Remote'
     ADD COLUMN IF NOT EXISTS level               text,   -- 'Entry' | 'Intermediate' | 'Advanced'
     ADD COLUMN IF NOT EXISTS duration            text,
     ADD COLUMN IF NOT EXISTS compensation        text,
     ADD COLUMN IF NOT EXISTS start_date          date,
     ADD COLUMN IF NOT EXISTS requirements        text[]  DEFAULT '{}',
     ADD COLUMN IF NOT EXISTS application_method  text    DEFAULT 'external',
     ADD COLUMN IF NOT EXISTS status              text    DEFAULT 'published',
     ADD COLUMN IF NOT EXISTS featured            boolean DEFAULT false,
     ADD COLUMN IF NOT EXISTS verified            boolean DEFAULT false,
     ADD COLUMN IF NOT EXISTS published_at        timestamptz DEFAULT now();

   -- Backfill existing rows so nothing looks broken
   UPDATE career_opportunities
   SET mode = CASE WHEN remote = true THEN 'Remote' ELSE 'On-site' END
   WHERE mode IS NULL;

   UPDATE career_opportunities
   SET status = CASE WHEN published = true THEN 'published' ELSE 'draft' END
   WHERE status IS NULL;

   -- All new columns are nullable or have defaults — existing rows keep working.

   ─────────────────────────────────────────────────────────────── */