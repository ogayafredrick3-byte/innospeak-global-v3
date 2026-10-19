/**
 * storyStore — local persistence for Foundation story submissions.
 * Demo mode: uses localStorage. Swap these functions for Supabase calls
 * when the backend is ready. The API is designed so callers don't change.
 */

const STORAGE_KEY = 'innospeak.foundation.stories.v1';

function read() {
  if (typeof window === 'undefined') return { pending: [], approved: [], rejected: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pending: [], approved: [], rejected: [] };
    const parsed = JSON.parse(raw);
    return {
      pending: Array.isArray(parsed.pending) ? parsed.pending : [],
      approved: Array.isArray(parsed.approved) ? parsed.approved : [],
      rejected: Array.isArray(parsed.rejected) ? parsed.rejected : [],
    };
  } catch (e) {
    console.warn('[storyStore] failed to read', e);
    return { pending: [], approved: [], rejected: [] };
  }
}

function write(data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[storyStore] failed to write', e);
  }
}

function generateId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function initialsOf(name) {
  return String(name || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Convert a raw submission payload to a story object the UI can render. */
function normalizeSubmission(payload) {
  const id = generateId();
  const initials = initialsOf(payload.author?.name);

  // Build object URLs for photos/videos. These are valid for the current
  // session but expire on refresh — acceptable for demo mode.
  const image = payload.photos?.[0] ? URL.createObjectURL(payload.photos[0]) : null;
  const gallery = payload.photos?.slice(1).map((f) => URL.createObjectURL(f)) || [];
  const video = payload.video ? URL.createObjectURL(payload.video) : null;

  return {
    id,
    category: payload.category,
    rating: payload.rating || null,
    featured: false,
    status: 'pending',
    title: payload.title,
    excerpt: payload.body.slice(0, 220) + (payload.body.length > 220 ? '…' : ''),
    body: payload.body,
    author: {
      name: payload.author?.name || 'Anonymous',
      role: payload.author?.role || 'Community Member',
      avatar: initials,
    },
    location: payload.location || '',
    date: new Date().toISOString().slice(0, 10),
    readMinutes: Math.max(1, Math.round(payload.body.split(/\s+/).length / 200)),
    image,
    gallery,
    video,
    videoUrl: payload.videoUrl || null,
    submittedAt: payload.submittedAt || new Date().toISOString(),
  };
}

/** Add a new submission to the pending queue. */
export function submitStory(payload) {
  const data = read();
  const story = normalizeSubmission(payload);
  data.pending.unshift(story);
  write(data);
  return story;
}

/** Get all stories by status. */
export function getPendingStories() {
  return read().pending;
}

export function getApprovedStories() {
  return read().approved;
}

export function getRejectedStories() {
  return read().rejected;
}

/** Approve a pending story — moves it to approved. */
export function approveStory(id) {
  const data = read();
  const idx = data.pending.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const [story] = data.pending.splice(idx, 1);
  data.approved.unshift({ ...story, status: 'approved' });
  write(data);
  return story;
}

/** Reject a pending story — moves it to rejected. */
export function rejectStory(id) {
  const data = read();
  const idx = data.pending.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const [story] = data.pending.splice(idx, 1);
  data.rejected.unshift({ ...story, status: 'rejected' });
  write(data);
  return story;
}

/** Delete a story from any bucket. */
export function deleteStory(id) {
  const data = read();
  data.pending = data.pending.filter((s) => s.id !== id);
  data.approved = data.approved.filter((s) => s.id !== id);
  data.rejected = data.rejected.filter((s) => s.id !== id);
  write(data);
}

/** Wipe all local submissions — useful for testing. */
export function clearAllStories() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}