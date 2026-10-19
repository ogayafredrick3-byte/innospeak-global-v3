/**
 * disbursementStore — records every payout to a learner or project.
 * Admin records these; sponsors and learners see them (scoped).
 */

const KEY = 'innospeak.foundation.disbursements.v1';

function read() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[disbursementStore] write failed', e);
  }
}

function generateId() {
  return `dsb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const DISBURSEMENT_CATEGORIES = [
  { id: 'tuition', label: 'Tuition' },
  { id: 'materials', label: 'Learning Materials' },
  { id: 'transport', label: 'Transport' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'device', label: 'Device / Equipment' },
  { id: 'data', label: 'Internet / Data' },
  { id: 'project', label: 'Project Funding' },
  { id: 'other', label: 'Other' },
];

export function getCategoryLabel(id) {
  return DISBURSEMENT_CATEGORIES.find((c) => c.id === id)?.label || id;
}

export function getDisbursements() {
  return read();
}

export function getDisbursementsByApplication(applicationId) {
  return read().filter((d) => d.applicationId === applicationId);
}

export function getDisbursementsBySponsorship(sponsorshipId) {
  return read().filter((d) => d.sponsorshipId === sponsorshipId);
}

export function getDisbursementsByStudent(studentEmail) {
  if (!studentEmail) return [];
  const normalized = studentEmail.trim().toLowerCase();
  return read().filter((d) => (d.studentEmail || '').toLowerCase() === normalized);
}

export function createDisbursement({
  applicationId,
  sponsorshipId,
  studentEmail,
  studentName,
  category,
  amount,
  currency = 'USD',
  reference,
  receiptUrl,
  notes,
  recordedBy,
}) {
  const list = read();
  const now = new Date().toISOString();
  const d = {
    id: generateId(),
    applicationId: applicationId || null,
    sponsorshipId: sponsorshipId || null,
    studentEmail: studentEmail || null,
    studentName: studentName || null,
    category,
    amount: Number(amount) || 0,
    currency,
    reference: reference || null,
    receiptUrl: receiptUrl || null,
    notes: notes || null,
    recordedBy: recordedBy || 'staff',
    recordedAt: now,
    status: 'completed',
  };
  list.unshift(d);
  write(list);
  return d;
}

export function updateDisbursement(id, updates) {
  const list = read();
  const idx = list.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  write(list);
  return list[idx];
}

export function deleteDisbursement(id) {
  write(read().filter((d) => d.id !== id));
}

/** Total disbursed per application. */
export function sumDisbursedForApplication(applicationId) {
  return read()
    .filter((d) => d.applicationId === applicationId)
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);
}

/** Total disbursed against a sponsorship. */
export function sumDisbursedForSponsorship(sponsorshipId) {
  return read()
    .filter((d) => d.sponsorshipId === sponsorshipId)
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);
}