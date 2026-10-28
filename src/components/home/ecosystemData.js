/**
 * ecosystemData — four connected engines in brand order:
 * LEARN (Academy) → BUILD (Labs) → GROW (Career Hub) → IMPACT (Foundation).
 */

export const ECOSYSTEM_CARDS = [
  {
    id: 'academy',
    name: 'InnoSpeak Global Academy',
    tagline: 'Learn. Practice. Master.',
    description:
      'Structured learning pathways with clear entry expectations, published curriculum status and transparent delivery information.',
    icon: 'graduation',
    link: '/academy',
    features: [
      'Course catalogue with defined pathways',
      'Delivery modes confirmed per intake',
      'Clear completion and credential information',
      'Outcome-led learning',
    ],
  },
  {
    id: 'labs',
    name: 'InnoSpeak Global Labs',
    tagline: 'Innovate. Build. Launch.',
    description:
      'A practical innovation environment for software, AI, data, cybersecurity and engineering projects, with clear distinctions between planned and delivered lab experiences.',
    icon: 'flask',
    link: '/labs',
    features: [
      '7 specialisation tracks',
      'AI · Software · Cloud · Security',
      'Project-based learning design',
      'Project evidence and testing',
    ],
  },
  {
    id: 'career-hub',
    name: 'InnoSpeak Career Hub',
    tagline: 'Prove. Connect. Progress.',
    description:
      'Connect learning records, practical projects and portfolio evidence to career planning, mentorship and relevant opportunities.',
    icon: 'career',
    link: '/career-hub',
    features: [
      'Project portfolio',
      'Career development',
      'Opportunities and mentorship',
      'Skills evidence',
    ],
  },
  {
    id: 'foundation',
    name: 'InnoSpeak Global Foundation',
    tagline: 'Empower. Support. Transform.',
    description:
      'A programme portfolio designed to improve education access, digital capability, girls’ participation in STEM and community-led innovation, with funding and results reported transparently.',
    icon: 'heart',
    link: '/foundation',
    features: [
      'Education access',
      'Girls in engineering',
      'Digital opportunity',
      'Community innovation',
    ],
  },
];

export const ECOSYSTEM_STATEMENT =
  'Four connected engines work toward one mission: turning learning into capability, opportunity and measurable community impact.';