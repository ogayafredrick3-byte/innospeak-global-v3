/**
 * foundationAppStore — local persistence for Foundation applications.
 * Demo mode: uses localStorage. Swap for Supabase when the backend is wired.
 */

import { allRequiredUploaded } from './foundationDocumentsData.js';

const STORAGE_KEY = 'innospeak.foundation.applications.v1';
const COUNTER_KEY = 'innospeak.foundation.counter.v1';

function readAll() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[foundationAppStore] write failed', e);
  }
}

function nextReference() {
  if (typeof window === 'undefined') return 'FND-0000-00000';
  let counter = 0;
  try {
    const raw = window.localStorage.getItem(COUNTER_KEY);
    counter = raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    counter = 0;
  }
  counter += 1;
  try {
    window.localStorage.setItem(COUNTER_KEY, String(counter));
  } catch {
    // ignore
  }
  const year = new Date().getFullYear();
  return `FND-${year}-${String(counter).padStart(5, '0')}`;
}

function generateId() {
  return `fnd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createApplication({ program, reason, userEmail, userName }) {
  const list = readAll();
  const now = new Date().toISOString();

  const application = {
    id: generateId(),
    reference: nextReference(),
    program,
    reason: reason?.trim() || '',
    status: 'submitted',
    userEmail: userEmail || null,
    userName: userName || null,
    submittedAt: now,
    updatedAt: now,
    documents: {},
    notifications: [
      {
        id: `notif-${Date.now()}`,
        type: 'submitted',
        message:
          'Your application has been received. Please upload the required documents so our Foundation team can review it.',
        createdAt: now,
        read: false,
      },
    ],
    timeline: [{ status: 'submitted', at: now, note: 'Application received.' }],
    support: null,
  };

  list.unshift(application);
  writeAll(list);
  return application;
}

export function getApplications(userEmail) {
  const list = readAll();
  if (!userEmail) return list;
  return list.filter((a) => !a.userEmail || a.userEmail === userEmail);
}

export function getApplication(id) {
  return readAll().find((a) => a.id === id) || null;
}

export function updateApplication(id, updates) {
  const list = readAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  writeAll(list);
  return list[idx];
}

export function pushStatus(id, status, note) {
  const list = readAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  const app = list[idx];
  app.status = status;
  app.updatedAt = now;
  app.timeline = [...(app.timeline || []), { status, at: now, note: note || '' }];
  app.notifications = [
    {
      id: `notif-${Date.now()}`,
      type: 'status',
      message: note || `Status updated to ${status}.`,
      createdAt: now,
      read: false,
    },
    ...(app.notifications || []),
  ];
  writeAll(list);
  return app;
}

export function markNotificationsRead(id) {
  const list = readAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  list[idx].notifications = (list[idx].notifications || []).map((n) => ({
    ...n,
    read: true,
  }));
  writeAll(list);
  return list[idx];
}

export function deleteApplication(id) {
  const list = readAll().filter((a) => a.id !== id);
  writeAll(list);
}

export function countByStatus(userEmail) {
  const list = getApplications(userEmail);
  return {
    total: list.length,
    inProgress: list.filter((a) =>
      ['submitted', 'under_review', 'verification', 'funding_pending'].includes(a.status)
    ).length,
    approved: list.filter((a) => ['approved', 'support_confirmed'].includes(a.status)).length,
    completed: list.filter((a) => a.status === 'completed').length,
  };
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT HANDLING
   ═══════════════════════════════════════════════════════════════ */

/**
 * Add an uploaded document to a specific slot.
 * fileData = { name, size, type, url (objectURL) }
 */
export function addDocument(applicationId, docKey, fileData) {
  const list = readAll();
  const idx = list.findIndex((a) => a.id === applicationId);
  if (idx === -1) return null;
  const app = list[idx];

  const doc = {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: fileData.name,
    size: fileData.size,
    type: fileData.type,
    url: fileData.url,
    status: 'uploaded',
    note: null,
    uploadedAt: new Date().toISOString(),
  };

  app.documents = { ...(app.documents || {}) };
  app.documents[docKey] = [...(app.documents[docKey] || []), doc];
  app.updatedAt = new Date().toISOString();

  // If all required docs uploaded and status was 'submitted', advance to 'verification'
  if (app.status === 'submitted' && allRequiredUploaded(app)) {
    const now = new Date().toISOString();
    app.status = 'verification';
    app.timeline = [
      ...(app.timeline || []),
      {
        status: 'verification',
        at: now,
        note: 'All required documents received. Verification is now in progress.',
      },
    ];
    app.notifications = [
      {
        id: `notif-${Date.now()}`,
        type: 'status',
        message:
          'All your documents have been received. Your application is now under verification.',
        createdAt: now,
        read: false,
      },
      ...(app.notifications || []),
    ];
  }

  writeAll(list);
  return app;
}

export function removeDocument(applicationId, docKey, docId) {
  const list = readAll();
  const idx = list.findIndex((a) => a.id === applicationId);
  if (idx === -1) return null;
  const app = list[idx];

  app.documents = { ...(app.documents || {}) };
  app.documents[docKey] = (app.documents[docKey] || []).filter((d) => d.id !== docId);
  app.updatedAt = new Date().toISOString();

  writeAll(list);
  return app;
}

/**
 * Staff-only — update a document's verification status.
 * status: 'uploaded' | 'verified' | 'rejected'
 */
export function setDocumentStatus(applicationId, docKey, docId, status, note) {
  const list = readAll();
  const idx = list.findIndex((a) => a.id === applicationId);
  if (idx === -1) return null;
  const app = list[idx];

  app.documents = { ...(app.documents || {}) };
  app.documents[docKey] = (app.documents[docKey] || []).map((d) =>
    d.id === docId
      ? { ...d, status, note: note || d.note, reviewedAt: new Date().toISOString() }
      : d
  );
  app.updatedAt = new Date().toISOString();

  writeAll(list);
  return app;
}