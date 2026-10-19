/**
 * eventsData — Foundation events system.
 * Categories, statuses, event types, and seed event data.
 *
 * NOTE: No events are confirmed yet. The seed events below are placeholders
 * marked with status: 'draft' — they do NOT appear publicly until Foundation
 * staff publish them through /admin/foundation/events.
 */

export const EVENT_CATEGORIES = [
  { id: 'scholarship-deadlines', label: 'Scholarship Deadlines', accent: 'gold' },
  { id: 'stem-workshops', label: 'STEM Workshops', accent: 'emerald' },
  { id: 'community-outreach', label: 'Community Outreach', accent: 'navy' },
  { id: 'fundraising', label: 'Fundraising', accent: 'gold' },
  { id: 'digital-skills', label: 'Digital Skills', accent: 'emerald' },
  { id: 'girls-in-stem', label: 'Girls in STEM', accent: 'emerald' },
  { id: 'innovation-challenges', label: 'Innovation Challenges', accent: 'navy' },
  { id: 'grant-calls', label: 'Grant Calls', accent: 'emerald' },
  { id: 'volunteer', label: 'Volunteer', accent: 'gold' },
  { id: 'partner-events', label: 'Partner Events', accent: 'navy' },
  { id: 'information-sessions', label: 'Information Sessions', accent: 'emerald' },
];

export const EVENT_STATUSES = [
  { id: 'draft', label: 'Draft' },
  { id: 'published', label: 'Published' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'registration_open', label: 'Registration Open' },
  { id: 'registration_closed', label: 'Registration Closed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const EVENT_TYPES = [
  { id: 'online', label: 'Online' },
  { id: 'in_person', label: 'In-Person' },
  { id: 'hybrid', label: 'Hybrid' },
];

export const PUBLIC_STATUSES = ['published', 'upcoming', 'registration_open', 'registration_closed'];

export function getCategory(id) {
  return EVENT_CATEGORIES.find((c) => c.id === id) || null;
}

export function getStatusLabel(id) {
  return EVENT_STATUSES.find((s) => s.id === id)?.label || id;
}

export function getTypeLabel(id) {
  return EVENT_TYPES.find((t) => t.id === id)?.label || id;
}

/**
 * FOUNDATION_EVENTS — no real events confirmed yet.
 * Leave empty until the Foundation team publishes real events.
 * Draft examples are stored in DRAFT_EXAMPLES below for reference only.
 */
export const FOUNDATION_EVENTS = [];

/**
 * DRAFT_EXAMPLES — reference drafts, not shown publicly.
 * When ready, staff use /admin/foundation/events to create real events.
 */
export const DRAFT_EXAMPLES = [
  {
    id: 'draft-girls-in-stem',
    title: 'Girls in STEM Workshop',
    category: 'girls-in-stem',
    shortDescription:
      'Planned interactive session introducing young women to opportunities in engineering, technology and innovation.',
    status: 'draft',
    date: null,
    venue: null,
  },
  {
    id: 'draft-community-digital',
    title: 'Community Digital Literacy Workshop',
    category: 'digital-skills',
    shortDescription:
      'Planned digital literacy training for adult community learners.',
    status: 'draft',
    date: null,
    venue: null,
  },
  {
    id: 'draft-community-grants-info',
    title: 'Community Impact Grants — Information Session',
    category: 'information-sessions',
    shortDescription:
      'Planned session for community groups interested in applying for Community Impact Grants.',
    status: 'draft',
    date: null,
    venue: null,
  },
];

export const EVENTS_INTRO = {
  eyebrow: 'Upcoming Events & Opportunities',
  title: 'Events, Workshops & Deadlines',
  subtitle:
    'Foundation events, information sessions, STEM workshops and application deadlines will appear here as they are confirmed.',
};
