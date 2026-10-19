/**
 * sponsorStore — local persistence for Foundation sponsors,
 * contributions and sponsorships.
 * Demo mode: localStorage. Swap for Supabase later.
 */

const SPONSORS_KEY = 'innospeak.foundation.sponsors.v1';
const CONTRIBUTIONS_KEY = 'innospeak.foundation.contributions.v1';
const SPONSORSHIPS_KEY = 'innospeak.foundation.sponsorships.v1';
const SESSION_KEY = 'innospeak.foundation.sponsor_session.v1';

function read(key) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(key, list) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn('[sponsorStore] write failed', e);
  }
}

function generateId(prefix = 'sp') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ═══════════════════════════════════════════════════════════════
   SPONSORS
   ═══════════════════════════════════════════════════════════════ */

export function getSponsors() {
  return read(SPONSORS_KEY);
}

export function getSponsorByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return read(SPONSORS_KEY).find((s) => s.email.toLowerCase() === normalized) || null;
}

export function getSponsor(id) {
  return read(SPONSORS_KEY).find((s) => s.id === id) || null;
}

export function upsertSponsor({ email, name, organization, tier }) {
  const normalized = email.trim().toLowerCase();
  const list = read(SPONSORS_KEY);
  const idx = list.findIndex((s) => s.email.toLowerCase() === normalized);
  const now = new Date().toISOString();

  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      name: name || list[idx].name,
      organization: organization || list[idx].organization,
      tier: tier || list[idx].tier,
      updatedAt: now,
    };
    write(SPONSORS_KEY, list);
    return list[idx];
  }

  const sponsor = {
    id: generateId('spr'),
    email: normalized,
    name: name || normalized,
    organization: organization || null,
    tier: tier || 'individual',
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(sponsor);
  write(SPONSORS_KEY, list);
  return sponsor;
}

export function deleteSponsor(id) {
  write(
    SPONSORS_KEY,
    read(SPONSORS_KEY).filter((s) => s.id !== id)
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTRIBUTIONS
   ═══════════════════════════════════════════════════════════════ */

export function getContributions() {
  return read(CONTRIBUTIONS_KEY);
}

export function getContributionsBySponsor(sponsorId) {
  return read(CONTRIBUTIONS_KEY).filter((c) => c.sponsorId === sponsorId);
}

export function getContributionsByProgram(programId) {
  return read(CONTRIBUTIONS_KEY).filter((c) => c.programId === programId);
}

export function getContribution(id) {
  return read(CONTRIBUTIONS_KEY).find((c) => c.id === id) || null;
}

export function createContribution({
  sponsorId,
  sponsorEmail,
  programId,
  amount,
  currency = 'USD',
  frequency = 'one_time',
  method = 'pending',
  reference = null,
  notes = null,
}) {
  const list = read(CONTRIBUTIONS_KEY);
  const now = new Date().toISOString();
  const contribution = {
    id: generateId('cnt'),
    sponsorId,
    sponsorEmail: sponsorEmail || null,
    programId,
    amount,
    currency,
    frequency,
    method,
    reference,
    notes,
    status: 'confirmed',
    createdAt: now,
  };
  list.unshift(contribution);
  write(CONTRIBUTIONS_KEY, list);
  return contribution;
}

export function updateContribution(id, updates) {
  const list = read(CONTRIBUTIONS_KEY);
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  write(CONTRIBUTIONS_KEY, list);
  return list[idx];
}

export function deleteContribution(id) {
  write(
    CONTRIBUTIONS_KEY,
    read(CONTRIBUTIONS_KEY).filter((c) => c.id !== id)
  );
}

export function sumContributionsByProgram() {
  const list = read(CONTRIBUTIONS_KEY);
  return list.reduce((acc, c) => {
    acc[c.programId] = (acc[c.programId] || 0) + Number(c.amount || 0);
    return acc;
  }, {});
}

/* ═══════════════════════════════════════════════════════════════
   SPONSORSHIPS (link sponsor → specific learner)
   ═══════════════════════════════════════════════════════════════ */

export function getSponsorships() {
  return read(SPONSORSHIPS_KEY);
}

export function getSponsorshipBySponsor(sponsorId) {
  return read(SPONSORSHIPS_KEY).filter((s) => s.sponsorId === sponsorId);
}

export function getSponsorshipByStudent(studentEmail) {
  if (!studentEmail) return [];
  const normalized = studentEmail.trim().toLowerCase();
  return read(SPONSORSHIPS_KEY).filter(
    (s) => (s.studentEmail || '').toLowerCase() === normalized
  );
}

export function createSponsorship({
  sponsorId,
  studentEmail,
  studentAdmissionNumber,
  programId,
  amountCommitted,
  frequency = 'monthly',
  visibilityTier = 'standard',
  notes,
}) {
  const list = read(SPONSORSHIPS_KEY);
  const now = new Date().toISOString();
  const sponsorship = {
    id: generateId('sps'),
    sponsorId,
    studentEmail: studentEmail || null,
    studentAdmissionNumber: studentAdmissionNumber || null,
    programId,
    amountCommitted,
    amountDisbursed: 0,
    frequency,
    visibilityTier,
    notes,
    status: 'active',
    startedAt: now,
    lastPaymentAt: null,
  };
  list.unshift(sponsorship);
  write(SPONSORSHIPS_KEY, list);
  return sponsorship;
}

export function updateSponsorship(id, updates) {
  const list = read(SPONSORSHIPS_KEY);
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  write(SPONSORSHIPS_KEY, list);
  return list[idx];
}

export function deleteSponsorship(id) {
  write(
    SPONSORSHIPS_KEY,
    read(SPONSORSHIPS_KEY).filter((s) => s.id !== id)
  );
}

/* ═══════════════════════════════════════════════════════════════
   SESSION (demo mode — sponsor "signs in" with email)
   ═══════════════════════════════════════════════════════════════ */

export function setSponsorSession(email) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ email: email.trim().toLowerCase(), at: new Date().toISOString() })
    );
  } catch {
    // ignore
  }
}

export function getSponsorSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSponsorSession() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}