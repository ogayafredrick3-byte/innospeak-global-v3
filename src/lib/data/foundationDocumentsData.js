/**
 * foundationDocumentsData — required documents per Foundation program.
 * Each program defines which uploads the learner must provide.
 */

export const REQUIRED_DOCUMENTS = {
  'education-access': [
    {
      id: 'national-id',
      label: 'National ID or Birth Certificate',
      description: 'A clear photo or scan of your ID document.',
      required: true,
      accept: 'image/*,.pdf',
    },
    {
      id: 'school-records',
      label: 'Latest School Records',
      description: 'Report form, transcript or admission letter from your current institution.',
      required: true,
      accept: '.pdf,.jpg,.jpeg,.png',
    },
    {
      id: 'income-proof',
      label: 'Proof of Financial Need',
      description: 'Payslip, letter from employer, or a signed statement of your household situation.',
      required: true,
      accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
    },
  ],

  'digital-access': [
    {
      id: 'national-id',
      label: 'National ID or Birth Certificate',
      description: 'A clear photo or scan of your ID document.',
      required: true,
      accept: 'image/*,.pdf',
    },
    {
      id: 'income-proof',
      label: 'Proof of Financial Need',
      description: 'Payslip or signed statement describing why you need digital access support.',
      required: true,
      accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
    },
  ],

  'girls-in-stem': [
    {
      id: 'national-id',
      label: 'National ID or Birth Certificate',
      description: 'A clear photo or scan of your ID document.',
      required: true,
      accept: 'image/*,.pdf',
    },
    {
      id: 'school-records',
      label: 'Latest School Records',
      description: 'Report form or transcript showing your recent academic performance.',
      required: true,
      accept: '.pdf,.jpg,.jpeg,.png',
    },
    {
      id: 'stem-statement',
      label: 'Statement of STEM Interest',
      description: 'A short written statement about why you want to pursue STEM (one page).',
      required: true,
      accept: '.pdf,.doc,.docx',
    },
  ],

  'community-grants': [
    {
      id: 'org-registration',
      label: 'Organisation Registration',
      description: 'Certificate of registration or letter confirming your group identity.',
      required: true,
      accept: '.pdf,.jpg,.jpeg,.png',
    },
    {
      id: 'project-proposal',
      label: 'Project Proposal',
      description: 'A 2–3 page description of your project, its goals and how it benefits the community.',
      required: true,
      accept: '.pdf,.doc,.docx',
    },
    {
      id: 'project-budget',
      label: 'Project Budget',
      description: 'An itemised budget showing how the funding would be used.',
      required: true,
      accept: '.pdf,.xls,.xlsx,.doc,.docx',
    },
  ],
};

export const DOCUMENT_STATUS = {
  uploaded: { label: 'Uploaded', tone: 'info' },
  verified: { label: 'Verified', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export function getRequiredDocuments(program) {
  return REQUIRED_DOCUMENTS[program] || [];
}

/** True if all required docs have at least one uploaded file. */
export function allRequiredUploaded(application) {
  const required = getRequiredDocuments(application.program);
  const docs = application.documents || {};
  return required
    .filter((d) => d.required)
    .every((slot) => Array.isArray(docs[slot.id]) && docs[slot.id].length > 0);
}

/** Count how many required docs still have no file. */
export function missingRequiredCount(application) {
  const required = getRequiredDocuments(application.program).filter((d) => d.required);
  const docs = application.documents || {};
  return required.filter(
    (slot) => !Array.isArray(docs[slot.id]) || docs[slot.id].length === 0
  ).length;
}