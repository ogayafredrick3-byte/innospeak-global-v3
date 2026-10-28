/**
 * foundationData — content for the InnoSpeak Global Foundation.
 * Aligned with the Foundation positioning document.
 */

export const FOUNDATION_HERO = {
  eyebrow: 'InnoSpeak Global Foundation',
  title: 'Fund a defined intervention.',
  highlight: 'See the evidence of change.',
  description:
    'We design targeted education-access, digital opportunity, girls-in-engineering and community innovation programmes. Each programme is intended to have clear eligibility, a costed delivery plan and measurable outcomes before funding opens.',
  primaryCta: { label: 'Explore Our Programs', to: '#foundation-programs' },
  secondaryCta: { label: 'Apply for Support', to: '/apply?division=foundation' },
  tertiaryCta: { label: 'Support a Program', to: '#ways-to-give' },
};

export const FOUNDATION_STATS = [
  {
    id: 'learners',
    value: null,
    suffix: '',
    label: 'Learners Supported',
    description: 'Verified totals will be published after programme reporting is established.',
  },
  {
    id: 'communities',
    value: null,
    suffix: '',
    label: 'Communities Reached',
    description: 'Reported when delivery records have been verified.',
  },
  {
    id: 'digital',
    value: null,
    suffix: '',
    label: 'Digital Access Provided',
    description: 'Devices and access will be counted from verified distribution records.',
  },
  {
    id: 'projects',
    value: null,
    suffix: '',
    label: 'Projects Supported',
    description: 'Published after grant decisions and delivery are documented.',
  },
];

/**
 * FOCUS AREAS — the four flagship Foundation programs.
 * Additional programs can be added here without changing the layout.
 */
export const FOCUS_AREAS = [
  {
    id: 'education-access',
    name: 'Technical Education Access Fund',
    short: 'Support for learners facing financial barriers.',
    description:
      'A proposed bursary and essential-cost programme for learners whose education is at risk because of financial barriers. Support decisions should be based on published criteria, verified need and available funds.',
    targetGroup: 'Learners facing documented financial barriers to approved technical or professional education.',
    intendedOutcomes: ['Improved access to learning', 'Course continuation and completion', 'Progression into further training or work'],
    sponsorFunding: 'Tuition, approved training materials, safety equipment and essential participation costs.',
    measurement: 'Applications assessed, awards made, funds disbursed, course continuation and verified completion.',
    icon: 'award',
    supports: [
      'Tuition and school fees',
      'Examination fees',
      'Learning materials',
      'Accommodation and transport',
      'Technical and TVET costs',
    ],
    canApply: false,
    applyTo: '/apply?division=foundation&program=education-access',
  },
  {
    id: 'digital-access',
    name: 'Digital Opportunity Access Initiative',
    short: 'Reducing digital inequality.',
    description:
      'A proposed device, connectivity and digital-skills programme designed to turn access to technology into sustained learning capability.',
    targetGroup: 'Learners and community learning groups with a documented device, connectivity or digital-skills gap.',
    intendedOutcomes: ['Reliable access to learning tools', 'Improved digital competency', 'Continued use of devices and learning resources'],
    sponsorFunding: 'Devices, connectivity, maintenance, digital-skills instruction and accessible learning resources.',
    measurement: 'Devices delivered and functioning, training completion, competency checks and follow-up access.',
    icon: 'laptop',
    supports: [
      'Laptops and tablets',
      'Internet and data support',
      'Digital learning resources',
      'Digital literacy training',
      'Community digital access',
    ],
    canApply: false,
    applyTo: '/apply?division=foundation&program=digital-access',
  },
  {
    id: 'girls-in-stem',
    name: 'Girls Build: STEM & Engineering Pathways',
    short: 'Supporting girls and young women in Science, Technology, Engineering and Mathematics.',
    description:
      'A proposed practical STEM pathway combining supervised making, mentorship and technical career exposure for girls and young women.',
    targetGroup: 'Girls and young women selected through transparent eligibility and safeguarding criteria.',
    intendedOutcomes: ['Increased participation in practical STEM', 'Projects completed and competencies demonstrated', 'Progression into further STEM learning'],
    sponsorFunding: 'Workshop kits, safe equipment, mentor time, learning support and project materials.',
    measurement: 'Participation and completion, project evidence, competency assessments and learner progression.',
    icon: 'sparkles',
    supports: [
      'Education support',
      'STEM learning materials',
      'Technical equipment',
      'Mentorship and workshops',
      'Innovation projects and career exposure',
    ],
    canApply: false,
    applyTo: '/apply?division=foundation&program=girls-in-stem',
  },
  {
    id: 'community-grants',
    name: 'Community Engineering & Innovation Grants',
    short: 'Supporting community-led initiatives.',
    description:
      'A proposed small-grant pathway for feasible, community-led education, digital-access and engineering ideas with clear beneficiaries and testable outcomes.',
    targetGroup: 'Eligible community groups and project teams with a defined problem, feasible plan and accountable lead.',
    intendedOutcomes: ['Tested solutions to defined local problems', 'Community participation in delivery', 'Evidence to guide continuation or scale-up'],
    sponsorFunding: 'Approved prototype materials, testing, technical mentorship and milestone-based pilot costs.',
    measurement: 'Milestones completed, tests passed, pilots delivered, beneficiaries reached and lessons documented.',
    icon: 'heart',
    supports: [
      'Community digital learning centres',
      'School science and technical equipment',
      'Youth skills workshops',
      'Community learning programs',
      'Technology and local innovation initiatives',
    ],
    canApply: false,
    applyTo: '/apply?division=foundation&program=community-grants',
  },
];

/**
 * INITIATIVES — proposed programme concepts for sponsor discussion.
 * Do not mark these as open or funded until approval and live records exist.
 */
export const FOUNDATION_INITIATIVES = [
  {
    id: 'girls-in-tech',
    title: 'Girls Build: STEM & Engineering Pathways',
    category: 'Girls Build: STEM & Engineering Pathways',
    description:
      'A proposed cohort-based programme combining supervised STEM workshops, mentorship and a practical project showcase. Cohort size and delivery dates will be confirmed after partner and budget approval.',
    raised: null,
    goal: null,
    currency: 'USD',
    beneficiaries: null,
    status: 'proposed',
    fundingBrief: 'Workshop kits, mentor hours, safe equipment, project materials and learner support.',
    measures: 'Participation, completion, projects demonstrated and progression into further STEM learning.',
  },
  {
    id: 'community-digital',
    title: 'Digital Opportunity Access Cohort',
    category: 'Digital Opportunity Access Initiative',
    description:
      'A proposed digital-access cohort for learners or community groups that need devices, connectivity and guided digital-skills training. Locations and scale require local needs assessment.',
    raised: null,
    goal: null,
    currency: 'USD',
    beneficiaries: null,
    status: 'proposed',
    fundingBrief: 'Devices, connectivity, maintenance, accessible learning materials and instructor time.',
    measures: 'Devices kept functional, course completion, competency checks and sustained access.',
  },
  {
    id: 'education-access-fund',
    title: 'Technical Education Access Cohort',
    category: 'Technical Education Access Fund',
    description:
      'A proposed needs-based support fund for eligible learners facing verified financial barriers to approved technical and professional training.',
    raised: null,
    goal: null,
    currency: 'USD',
    beneficiaries: null,
    status: 'proposed',
    fundingBrief: 'Approved tuition, essential learning materials, safety equipment and participation costs.',
    measures: 'Awards made, funds disbursed, course continuation and verified completion.',
  },
  {
    id: 'community-grants-2026',
    title: 'Community Engineering & Innovation Pilot Grants',
    category: 'Community Engineering & Innovation Grants',
    description:
      'A proposed milestone-based grant round for feasible community projects that address a defined education, technology or engineering challenge.',
    raised: null,
    goal: null,
    currency: 'USD',
    beneficiaries: null,
    status: 'proposed',
    fundingBrief: 'Prototype materials, testing, technical review and approved pilot costs.',
    measures: 'Milestones achieved, prototypes tested, pilots completed and documented outcomes.',
  },
];

/**
 * HOW IT WORKS — six transparent steps.
 */
export const SUPPORT_STEPS = [
  {
    number: '01',
    title: 'Apply or Express Interest',
    description:
      'Complete a short application through your InnoSpeak account, telling us what support you need and why.',
  },
  {
    number: '02',
    title: 'Verification',
    description:
      'Our Foundation team verifies the information you provide and the documents you upload.',
  },
  {
    number: '03',
    title: 'Assessment',
    description:
      'Each application is assessed against the criteria of the relevant Foundation program.',
  },
  {
    number: '04',
    title: 'Selection',
    description:
      'Approved applicants are selected based on need, program fit and available funding.',
  },
  {
    number: '05',
    title: 'Support',
    description:
      'Approved support is allocated to tuition, materials, digital access or project funding.',
  },
  {
    number: '06',
    title: 'Follow-up & Impact',
    description:
      'We follow up on progress and, with consent, share impact with our supporters.',
  },
];

/**
 * WAYS TO GIVE — sponsor a Program, not an individual.
 */
export const WAYS_TO_GIVE = [
  {
    id: 'education-access',
    title: 'Technical Education Access Fund',
    description:
      'Fund defined technical-learning costs such as approved tuition, workshop materials, protective equipment and participation needs for eligible learners.',
    icon: 'award',
    cta: 'Support This Program',
    to: '/contact?interest=foundation-donate-education-access',
  },
  {
    id: 'digital-access',
    title: 'Digital Opportunity Access Initiative',
    description:
      'Fund devices, connectivity, maintenance and guided digital-skills training with follow-up competency checks.',
    icon: 'laptop',
    cta: 'Support This Program',
    to: '/contact?interest=foundation-donate-digital-access',
  },
  {
    id: 'girls-in-stem',
    title: 'Girls Build: STEM & Engineering Pathways',
    description:
      'Fund supervised engineering workshops, mentor time, safe project kits and evidence-based STEM progression.',
    icon: 'sparkles',
    cta: 'Support This Program',
    to: '/contact?interest=foundation-donate-girls-in-stem',
  },
  {
    id: 'community-grants',
    title: 'Community Engineering & Innovation Grants',
    description:
      'Fund milestone-based prototypes and community pilots with defined beneficiaries, testing evidence and accountable project leads.',
    icon: 'heart',
    cta: 'Support This Program',
    to: '/contact?interest=foundation-donate-community-grants',
  },
];

export const TRANSPARENCY = {
  summary: 'Funding should be traceable from commitment to verified delivery.',
  items: [],
  commitment:
    'We will publish financial allocations and impact results when they are supported by reviewed records. Until that reporting is in place, this page does not present estimated percentages or unverified impact figures as actual results.',
  reportingNote:
    'Each funded programme should have an approved budget, documented restrictions, recorded disbursements, supporting evidence and a periodic report describing outputs, outcomes and challenges.',
};

export const FOUNDATION_FAQ = [
  {
    q: 'Who can apply for Foundation support?',
    a: 'Learners and communities facing financial, digital or access barriers. You can be an InnoSpeak learner or applying to become one. Each Foundation program has its own eligibility criteria.',
  },
  {
    q: 'How do I apply?',
    a: 'Sign in to your InnoSpeak account and go to your portal. Select Foundation → My Applications → Start Application. Choose the program that fits your situation, complete the form and upload any required documents.',
  },
  {
    q: 'How long does the review take?',
    a: 'Review timelines depend on the programme, verification requirements and available funding. Any open application window should publish its expected decision timeline and how applicants will be updated.',
  },
  {
    q: 'Is it really free?',
    a: 'Support terms depend on the approved programme. The application guidance and award letter should state whether support is a grant, bursary, in-kind contribution or another arrangement, and whether repayment applies.',
  },
  {
    q: 'What certificate do Foundation-supported learners receive?',
    a: 'Any certificate depends on the course requirements and the issuing organisation. Foundation support alone is not a qualification or accreditation. The relevant course page should explain the issuer and what the credential represents.',
  },
  {
    q: 'Can I support a specific learner?',
    a: 'Our proposed model prioritises transparent programme funding and needs-based selection. Any restricted contribution or learner-specific sponsorship must be agreed in writing, verified and handled under the applicable privacy and safeguarding rules.',
  },
  {
    q: 'Can I contact the learner I support?',
    a: 'For privacy and safeguarding, no direct contact is allowed. Our Foundation team shares progress reports with supporters and relays any messages. This protects learners and their families.',
  },
  {
    q: 'Is my contribution tax-deductible?',
    a: "Tax treatment depends on the Foundation's legal status and the rules in your jurisdiction. Please obtain confirmation before assuming a contribution is tax-deductible.",
  },
];

export const FOUNDATION_CLOSING = {
  title: 'Opportunity should not depend on circumstance.',
  subtitle:
    'Help us remove barriers to learning and practical innovation. Contributions should be allocated to approved programmes and reported with clear evidence.',
  primaryCta: { label: 'Apply for Support', to: '/apply?division=foundation' },
  secondaryCta: { label: 'Support a Program', to: '#ways-to-give' },
};