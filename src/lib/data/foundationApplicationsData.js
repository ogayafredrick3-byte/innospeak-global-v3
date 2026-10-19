/**
 * foundationApplicationsData — config for Foundation applications.
 * Statuses, programs, timeline steps and helpers.
 */

export const FOUNDATION_PROGRAMS = [
  { id: 'education-access', label: 'Education Access Fund' },
  { id: 'digital-access', label: 'Digital Access Initiative' },
  { id: 'girls-in-stem', label: 'Girls in STEM' },
  { id: 'community-grants', label: 'Community Impact Grants' },
];

export const APPLICATION_STATUSES = [
  { id: 'draft', label: 'Draft', tone: 'neutral' },
  { id: 'submitted', label: 'Submitted', tone: 'info' },
  { id: 'under_review', label: 'Under Review', tone: 'warning' },
  { id: 'verification', label: 'Verification', tone: 'warning' },
  { id: 'approved', label: 'Approved', tone: 'success' },
  { id: 'waitlisted', label: 'Waitlisted', tone: 'warning' },
  { id: 'declined', label: 'Declined', tone: 'danger' },
  { id: 'funding_pending', label: 'Funding Pending', tone: 'warning' },
  { id: 'support_confirmed', label: 'Support Confirmed', tone: 'success' },
  { id: 'completed', label: 'Completed', tone: 'info' },
];

/**
 * The learner-facing timeline. Each status maps to a step index here.
 * Steps are shown as a vertical progress indicator on the detail page.
 */
export const TIMELINE_STEPS = [
  { id: 'submitted', label: 'Submitted', description: 'Your application was received.' },
  { id: 'under_review', label: 'Under Review', description: 'Foundation staff are reviewing your application.' },
  { id: 'verification', label: 'Verification', description: 'We are verifying the information you provided.' },
  { id: 'decision', label: 'Decision', description: 'A decision has been made on your application.' },
  { id: 'support_confirmed', label: 'Support Confirmed', description: 'Approved support is being arranged.' },
  { id: 'completed', label: 'Completed', description: 'Support was delivered successfully.' },
];

// Map status → timeline step index (which step is "current")
export const STATUS_STEP_INDEX = {
  draft: -1,
  submitted: 0,
  under_review: 1,
  verification: 2,
  approved: 3,
  waitlisted: 3,
  declined: 3,
  funding_pending: 3,
  support_confirmed: 4,
  completed: 5,
};

export function getProgramLabel(id) {
  return FOUNDATION_PROGRAMS.find((p) => p.id === id)?.label || id;
}

export function getStatusLabel(id) {
  return APPLICATION_STATUSES.find((s) => s.id === id)?.label || id;
}

export function getStatusTone(id) {
  return APPLICATION_STATUSES.find((s) => s.id === id)?.tone || 'neutral';
}

export function getCurrentStepIndex(status) {
  const idx = STATUS_STEP_INDEX[status];
  return typeof idx === 'number' ? idx : -1;
}