/**
 * careerProfile — read-only aggregation layer for the Career Profile page.
 *
 * SPEC §3 (source-of-truth): never duplicate. This module reads from the
 * existing systems (Portfolio, Certificates, Goals, Mentorship) and derives
 * a unified profile shape. It does NOT own any of this data.
 *
 * SPEC §41 Phase 2: aggregation only. Schema for learner-controlled fields
 * (Professional Summary, Career Interests, Availability) is Phase 2b work.
 */

import { getProgrammeByCode } from './programmeData';
import { listMyPortfolio, listMyCertificates } from '../supabase/learning';
import { listMyGoals, listMentorshipRequests } from '../supabase/platform';

/* ──────────────────────────────────────────────────────────────
   Skill aggregation — SPEC §20 (Skill → Evidence → Opportunity)
   ────────────────────────────────────────────────────────────── */

/**
 * Derive a skill list with evidence from existing learner data.
 * Two evidence sources today:
 *   - portfolio items (explicit `skills[]`)
 *   - certificates (course category, resolved via programmeData)
 *
 * Returns: [{ name, sources: [{type, label, id}], sourceCount }]
 *   sorted by evidence strength (most-supported first).
 */
function aggregateSkills(certificates, portfolio) {
  const map = new Map();

  const add = (rawName, source) => {
    const name = String(rawName || '').trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!map.has(key)) map.set(key, { name, sources: [] });
    map.get(key).sources.push(source);
  };

  // Evidence 1: portfolio items declare their own skills
  portfolio.forEach((item) => {
    (item.skills || []).forEach((skill) =>
      add(skill, { type: 'portfolio', label: item.title, id: item.id })
    );
  });

  // Evidence 2: certificates imply the course's category as a skill family
  certificates.forEach((cert) => {
    const code = cert.lms_courses?.code || cert.course_code;
    if (!code) return;
    const course = getProgrammeByCode(code);
    if (!course?.category) return;
    add(course.category, {
      type: 'certificate',
      label: course.name,
      id: cert.id,
    });
  });

  return [...map.values()]
    .map((s) => ({ ...s, sourceCount: s.sources.length }))
    .sort((a, b) => b.sourceCount - a.sourceCount);
}

/* ──────────────────────────────────────────────────────────────
   Aggregation
   ────────────────────────────────────────────────────────────── */

/**
 * Build the aggregated Career Profile.
 * Never throws — each source failure is swallowed so a single broken
 * service (e.g. one table misconfigured) doesn't blank the whole page.
 */
export async function buildCareerProfile() {
  const [portfolioR, certificatesR, goalsR, mentorshipsR] = await Promise.allSettled([
    listMyPortfolio(),
    listMyCertificates(),
    listMyGoals(),
    listMentorshipRequests(),
  ]);

  const unwrap = (r) => (r.status === 'fulfilled' ? r.value || [] : []);

  // Log failures so devs see them, but never surface raw errors to the user.
  [portfolioR, certificatesR, goalsR, mentorshipsR].forEach((r, i) => {
    if (r.status === 'rejected') {
      // eslint-disable-next-line no-console
      console.error(`[careerProfile] source ${i} failed:`, r.reason);
    }
  });

  const portfolio = unwrap(portfolioR);
  const certificates = unwrap(certificatesR);
  const goals = unwrap(goalsR);
  const mentorships = unwrap(mentorshipsR);

  const activeCertificates = certificates.filter(
    (c) => (c.status || 'active') === 'active'
  );
  const activeGoals = goals.filter((g) => g.status !== 'completed');
  const openMentorships = mentorships.filter(
    (m) => m.status === 'pending' || m.status === 'active'
  );

  return {
    // Raw sources (kept separate — the profile does not replace them)
    portfolio,
    certificates: activeCertificates,
    goals: activeGoals,
    mentorships: openMentorships,

    // Derived
    skills: aggregateSkills(activeCertificates, portfolio),

    // Summary stats
    summary: {
      credentials: activeCertificates.length,
      projects: portfolio.length,
      activeGoals: activeGoals.length,
      openMentorships: openMentorships.length,
    },
  };
}

/* ──────────────────────────────────────────────────────────────
   Phase 2b — learner-controlled profile fields (not yet persisted)
   ────────────────────────────────────────────────────────────── */

/**
 * The shape that will eventually live in a `career_profiles` table.
 * Documented here so it's ready when Phase 2b adds the schema.
 *
 *   professional_summary  text
 *   career_interests      text[]   -- e.g. ['Engineering', 'Renewable Energy']
 *   availability          text     -- 'Immediately' | 'Within 1 month' | 'Open to offers'
 *   preferred_types       text[]   -- e.g. ['internship', 'project', 'job']
 *   visibility            text     -- 'private' | 'employers' | 'public'
 */
export const CAREER_PROFILE_EMPTY = Object.freeze({
  professional_summary: '',
  career_interests: [],
  availability: '',
  preferred_types: [],
  visibility: 'private',
});