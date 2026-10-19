/**
 * eventStore — local persistence for Foundation events.
 * Demo mode: uses localStorage for admin-created events.
 * Swap for Supabase when the backend is wired.
 */

const STORAGE_KEY = 'innospeak.foundation.events.v1';

function read() {
  if (typeof window === 'undefined') return { custom: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { custom: [] };
    const parsed = JSON.parse(raw);
    return { custom: Array.isArray(parsed.custom) ? parsed.custom : [] };
  } catch {
    return { custom: [] };
  }
}

function write(data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[eventStore] write failed', e);
  }
}

function generateId() {
  return `local-evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Add a new event (admin-created). */
export function createEvent(payload) {
  const data = read();
  const event = {
    id: generateId(),
    slug: `${slugify(payload.title)}-${Date.now().toString(36)}`,
    ...payload,
    attendees: 0,
    createdAt: new Date().toISOString(),
  };
  data.custom.unshift(event);
  write(data);
  return event;
}

/** Update an existing custom event. */
export function updateEvent(id, updates) {
  const data = read();
  const idx = data.custom.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  data.custom[idx] = { ...data.custom[idx], ...updates };
  write(data);
  return data.custom[idx];
}

/** Delete a custom event. */
export function deleteEvent(id) {
  const data = read();
  data.custom = data.custom.filter((e) => e.id !== id);
  write(data);
}

/** Get all custom (admin-created) events. */
export function getCustomEvents() {
  return read().custom;
}

/** Get one custom event by id. */
export function getCustomEvent(id) {
  return read().custom.find((e) => e.id === id) || null;
}

/** Clear all custom events (testing). */
export function clearCustomEvents() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}