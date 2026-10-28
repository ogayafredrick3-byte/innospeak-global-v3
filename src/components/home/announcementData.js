/**
 * announcementData — messages that rotate in the top banner.
 * Add / reorder / remove freely — the banner adapts automatically.
 */

export const ANNOUNCEMENTS = [
  {
    id: 'intake',
    icon: 'sparkles',
    pill: 'Admissions Open',
    message: 'January 2026 intake is now open across Academy, Labs and CBE.',
    cta: { label: 'Apply now', to: '/apply' },
  },
  {
    id: 'free-courses',
    icon: 'gift',
    pill: 'Free',
    message: 'Start with 10 free courses. No payment is required, and certificates are issued on completion.',
    cta: { label: 'Browse free', to: '/courses' },
  },
  {
    id: 'labs',
    icon: 'flask',
    pill: 'New',
    message: 'Seven Labs tracks now live: Software, Data, AI, Cloud, Security, Engineering & Creative.',
    cta: { label: 'Explore Labs', to: '/labs' },
  },
  {
    id: 'certificates',
    icon: 'award',
    pill: 'Certified',
    message: 'Every course issues a verifiable InnoSpeak certificate that you can share on LinkedIn and include in your CV.',
    cta: { label: 'See how', to: '/verify-certificate' },
  },
];

// How long each announcement stays before rotating (ms)
export const ROTATION_INTERVAL = 7000;