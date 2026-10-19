/**
 * progressReportStore — quarterly updates written by Foundation staff.
 * Each report is tied to an application. Learner sees their own;
 * sponsors see anonymized summaries for what they fund.
 */

const KEY = 'innospeak.foundation.progress_reports.v1';

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
    console.warn('[progressReportStore] write failed', e);
  }
}

function generateId() {
  return `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getProgressReports() {
  return read();
}

export function getProgressReportsByApplication(applicationId) {
  return read().filter((r) => r.applicationId === applicationId);
}

export function getProgressReportsByProgram(programId) {
  return read().filter((r) => r.programId === programId);
}

export function createProgressReport({
  applicationId,
  programId,
  studentEmail,
  studentName,
  studentInitials,
  title,
  body,
  photoUrl,
  authorName,
  authorRole,
  visibleToSponsor = true,
}) {
  const list = read();
  const now = new Date().toISOString();
  const report = {
    id: generateId(),
    applicationId,
    programId,
    studentEmail: studentEmail || null,
    studentName: studentName || null,
    studentInitials: studentInitials || '—',
    title,
    body,
    photoUrl: photoUrl || null,
    authorName: authorName || 'Foundation Team',
    authorRole: authorRole || 'Program Operations',
    visibleToSponsor,
    createdAt: now,
  };
  list.unshift(report);
  write(list);
  return report;
}

export function updateProgressReport(id, updates) {
  const list = read();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  write(list);
  return list[idx];
}

export function deleteProgressReport(id) {
  write(read().filter((r) => r.id !== id));
}