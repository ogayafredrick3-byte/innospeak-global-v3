/**
 * learnerContext — assembles a compact snapshot of the learner's
 * InnoSpeak activity to feed the AI (spec: "AI helps learners,
 * tutors, everyone — access courses, coding, writings, everything").
 *
 * DESIGN NOTES
 *   - Never throws. Each source is settled independently — a broken
 *     source contributes nothing, the rest still work.
 *   - Never includes sensitive data (email, phone, address, password,
 *     tokens). Only institutional + public activity data.
 *   - Serialises to a compact text summary, not raw JSON — cheaper on
 *     tokens and easier for the model to reason over.
 *   - Capped by count (top N of each) so a power user can't blow up the
 *     prompt size.
 */

import {
  listMyEnrollments,
  getCourseProgress,
} from '../supabase/lms';
import { listMyPortfolio, listMyCertificates } from '../supabase/learning';
import { listMyGoals } from '../supabase/platform';
import { listMyApplications } from '../supabase/career';
import { getProgrammeByCode } from '../data/programmeData';

/* ──────────────────────────────────────────────────────────────
   Caps — keep the serialised context well under ~1500 tokens
   ────────────────────────────────────────────────────────────── */

const MAX_ENROLLED = 6;
const MAX_COMPLETED = 5;
const MAX_PORTFOLIO = 5;
const MAX_SKILLS = 8;
const MAX_GOALS = 5;
const MAX_APPLICATIONS = 4;
const PROGRESS_CONCURRENCY = 4;

/* ──────────────────────────────────────────────────────────────
   Utility
   ────────────────────────────────────────────────────────────── */

function short(str, max = 90) {
  const s = String(str || '').trim().replace(/\s+/g, ' ');
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function formatMonthYear(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/** Concurrency-limited map. */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        results[i] = await fn(items[i], i);
      } catch {
        results[i] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/* ──────────────────────────────────────────────────────────────
   Source readers — each returns a plain array or []
   ────────────────────────────────────────────────────────────── */

async function safeSettled(fn) {
  try {
    return (await fn()) || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[learnerContext] source failed:', err?.message || err);
    return [];
  }
}

async function readEnrollments(userId) {
  const enrollments = await safeSettled(listMyEnrollments);
  if (enrollments.length === 0) return { enrolled: [], completed: [] };

  // Fetch progress for the top N most recent enrollments
  const recent = enrollments.slice(0, MAX_ENROLLED + MAX_COMPLETED);

  const withProgress = await mapLimit(recent, PROGRESS_CONCURRENCY, async (e) => {
    try {
      const progress = await getCourseProgress(e.course_id, userId);
      return { ...e, progress };
    } catch {
      return { ...e, progress: null };
    }
  });

  const enrolled = [];
  const completed = [];

  for (const e of withProgress) {
    if (!e) continue;
    const course = e.lms_courses || {};
    const code = course.code || null;
    const title = course.title || 'Untitled course';
    const pct = e.progress?.percent ?? 0;

    const entry = { code, title, progress: pct };

    if (pct >= 100) {
      completed.push(entry);
    } else {
      enrolled.push(entry);
    }
  }

  return {
    enrolled: enrolled.slice(0, MAX_ENROLLED),
    completed: completed.slice(0, MAX_COMPLETED),
  };
}

async function readPortfolio() {
  const items = await safeSettled(listMyPortfolio);
  return items.slice(0, MAX_PORTFOLIO).map((p) => ({
    title: p.title || 'Untitled project',
    description: short(p.description, 100),
    skills: Array.isArray(p.skills) ? p.skills.slice(0, 5) : [],
  }));
}

async function readCertificates() {
  const certs = await safeSettled(listMyCertificates);
  return certs.slice(0, MAX_COMPLETED).map((c) => ({
    code: c.lms_courses?.code || c.course_code || null,
    title: c.course_title || c.lms_courses?.title || 'Certificate',
    issuedAt: formatMonthYear(c.issue_date || c.created_at),
  }));
}

async function readGoals() {
  const goals = await safeSettled(listMyGoals);
  return goals
    .filter((g) => g.status !== 'completed')
    .slice(0, MAX_GOALS)
    .map((g) => ({
      title: g.title || 'Untitled goal',
      targetDate: formatMonthYear(g.target_date),
    }));
}

async function readApplications() {
  const apps = await safeSettled(() => listMyApplications());
  return apps.slice(0, MAX_APPLICATIONS).map((a) => ({
    title: a.career_opportunities?.title || 'Opportunity',
    status: a.status || 'submitted',
  }));
}

/* ──────────────────────────────────────────────────────────────
   Skills — mirror of careerProfile aggregation, but capped
   ────────────────────────────────────────────────────────────── */

function deriveSkills(certificates, portfolio) {
  const map = new Map();

  portfolio.forEach((item) => {
    (item.skills || []).forEach((skill) => {
      const name = String(skill || '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!map.has(key)) map.set(key, { name, count: 0 });
      map.get(key).count += 1;
    });
  });

  certificates.forEach((cert) => {
    if (!cert.code) return;
    const course = getProgrammeByCode(cert.code);
    if (!course?.category) return;
    const key = course.category.toLowerCase();
    if (!map.has(key)) map.set(key, { name: course.category, count: 0 });
    map.get(key).count += 1;
  });

  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_SKILLS);
}

/* ──────────────────────────────────────────────────────────────
   Serialiser
   ────────────────────────────────────────────────────────────── */

function serialise(snapshot) {
  const lines = [];

  if (snapshot.name) lines.push(`Name: ${snapshot.name}`);
  if (snapshot.admissionNumber) lines.push(`Admission number: ${snapshot.admissionNumber}`);
  lines.push('');

  if (snapshot.enrolled.length > 0) {
    lines.push('Currently enrolled:');
    snapshot.enrolled.forEach((e) => {
      const codeStr = e.code ? `${e.code} ` : '';
      const pctStr = e.progress > 0 ? ` — ${e.progress}% complete` : ' — not started';
      lines.push(`- ${codeStr}${e.title}${pctStr}`);
    });
    lines.push('');
  }

  if (snapshot.completed.length > 0) {
    lines.push('Completed courses:');
    snapshot.completed.forEach((c) => {
      const codeStr = c.code ? `${c.code} ` : '';
      lines.push(`- ${codeStr}${c.title}`);
    });
    lines.push('');
  }

  if (snapshot.certificates.length > 0) {
    lines.push('Certificates earned:');
    snapshot.certificates.forEach((c) => {
      const codeStr = c.code ? ` (${c.code})` : '';
      const dateStr = c.issuedAt ? `, ${c.issuedAt}` : '';
      lines.push(`- ${c.title}${codeStr}${dateStr}`);
    });
    lines.push('');
  }

  if (snapshot.portfolio.length > 0) {
    lines.push('Portfolio projects:');
    snapshot.portfolio.forEach((p) => {
      const skillsStr = p.skills.length > 0 ? ` [${p.skills.join(', ')}]` : '';
      const descStr = p.description ? ` — ${p.description}` : '';
      lines.push(`- ${p.title}${skillsStr}${descStr}`);
    });
    lines.push('');
  }

  if (snapshot.skills.length > 0) {
    lines.push('Skills demonstrated:');
    snapshot.skills.forEach((s) => {
      lines.push(`- ${s.name} (${s.count} evidence source${s.count === 1 ? '' : 's'})`);
    });
    lines.push('');
  }

  if (snapshot.goals.length > 0) {
    lines.push('Active goals:');
    snapshot.goals.forEach((g) => {
      const dateStr = g.targetDate ? ` (target: ${g.targetDate})` : '';
      lines.push(`- ${g.title}${dateStr}`);
    });
    lines.push('');
  }

  if (snapshot.applications.length > 0) {
    lines.push('Recent opportunity applications:');
    snapshot.applications.forEach((a) => {
      lines.push(`- ${a.title} — ${a.status}`);
    });
    lines.push('');
  }

  return lines.join('\n').trim();
}

/* ──────────────────────────────────────────────────────────────
   Public API
   ────────────────────────────────────────────────────────────── */

/**
 * Build a learner snapshot from InnoSpeak systems.
 *
 * @param {{ id: string, profile?: object }} user
 * @returns {Promise<{ name: string, admissionNumber: string|null, enrolled: [], ... } | null>}
 */
export async function buildLearnerContext(user) {
  if (!user?.id) return null;

  const [enrollmentsResult, portfolio, certificates, goals, applications] =
    await Promise.all([
      readEnrollments(user.id),
      readPortfolio(),
      readCertificates(),
      readGoals(),
      readApplications(),
    ]);

  const profile = user.profile || {};

  const snapshot = {
    name: profile.full_name?.split(/\s+/)[0] || '',
    admissionNumber:
      profile.admission_number || profile.student_number || null,
    enrolled: enrollmentsResult.enrolled,
    completed: enrollmentsResult.completed,
    portfolio,
    certificates,
    goals,
    applications,
    skills: [],
  };

  snapshot.skills = deriveSkills(certificates, snapshot.portfolio);

  return snapshot;
}

/**
 * Serialise the snapshot into a compact text block for the AI.
 * Returns empty string if the snapshot is essentially empty.
 */
export function serialiseLearnerContext(snapshot) {
  if (!snapshot) return '';
  return serialise(snapshot);
}