/**
 * certificateData — content for the homepage certificate preview.
 * The certificate mock itself is rendered by CertificateMock.jsx.
 */

export const CERTIFICATE_INTRO = {
  eyebrow: 'Earned, Not Just Learned',
  title: 'Clear Evidence of What You Completed',
  subtitle:
    'Credential availability depends on the course and its completion requirements. Published course details should state the issuer, criteria and verification method before learners enrol.',
};

export const CERTIFICATE_SAMPLE = {
  learnerName: 'Sample Learner',
  courseName: 'Python Programming',
  courseCode: 'PY101',
  division: 'InnoSpeak Global Academy',
  issuedOn: 'Illustrative sample — not issued',
  certificateId: 'SAMPLE-NOT-VALID',
  signature: 'Fred Omondi',
  signatureTitle: 'Founder & CEO',
};

export const CERTIFICATE_TRUST_POINTS = [
  {
    id: 'verifiable',
    label: 'Verifiable',
    title: 'Verification where available',
    description:
      'A public verification method should be shown for credentials that have actually been issued and entered into the verification system.',
  },
  {
    id: 'shareable',
    label: 'Shareable',
    title: 'Shareable evidence',
    description:
      'Where supported, learners can share an issued credential or link to their portfolio evidence on a CV or professional profile.',
  },
  {
    id: 'division',
    label: 'Division-aware',
    title: 'Issuer is made clear',
    description:
      'Credential records should identify the issuing organisation and distinguish a course completion certificate from an externally awarded qualification.',
  },
];

export const CERTIFICATE_FEATURES = [
  { id: 'courses', label: 'Credential availability stated per course' },
  { id: 'verify', label: 'Verification method stated where available' },
  { id: 'divisions', label: 'Issuer and completion criteria disclosed' },
  { id: 'share', label: 'Shareable evidence where supported' },
];