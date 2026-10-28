import { getProgrammeByCode, getPathwayById } from './programmeData.js';
import { getCourseGovernance } from './catalogPolicy.js';
import { getCurriculumStatus } from './courseReadiness.js';
import GENERATED_CURRICULA from './courseCurricula.generated.js';

/**
 * courseDetails — rich course data for the Course Details Template.
 *
 * Only real, verified course data lives here. Courses without an entry
 * fall back to base course fields (via buildCourseData) and show empty
 * states in sections that need structured content (modules, reviews).
 *
 * Structured so it can later be loaded from Firestore.
 */

/* ──────────────────────────────────────────────────────────────
   SHARED CONTENT
   ────────────────────────────────────────────────────────────── */

const SHARED_FAQS = [
  {
    question: 'Who can apply?',
    answer:
      'Anyone aged 16 and above with an interest in the subject. Some courses require prior qualifications. Check the Entry Requirements section for details.',
  },
  {
    question: 'How do I study?',
    answer:
      'Choose the mode that suits you: online, physical (on-campus), or hybrid. Classes are scheduled on weekdays, weekends, or evenings to fit around your life.',
  },
  {
    question: 'Do I receive a certificate?',
    answer:
      'Credential arrangements depend on the specific course and its approved delivery model. The course page should identify the issuer, completion criteria and any verification process. InnoSpeak-issued completion records should not be confused with an externally accredited qualification.',
  },
  {
    question: 'Can I study online?',
    answer:
      'Study mode is listed on each course page. Online, hybrid and physical delivery are offered only where the course has a confirmed delivery arrangement; do not assume every course is available in every mode.',
  },
  {
    question: 'Can I pay in instalments?',
    answer:
      'Payment methods and instalment arrangements must be confirmed with admissions for the specific course or intake. Do not assume an instalment plan is available until it has been confirmed in writing.',
  },
];

const DEFAULT_CERT_ITEMS = [
  { icon: 'Award', label: 'Completion record', description: 'Issued only where the course has an approved completion process' },
  { icon: 'Monitor', label: 'Digital credential', description: 'Availability and verification depend on the configured credential system' },
  { icon: 'FileText', label: 'Learning record', description: 'Provided where defined by the course and delivery arrangement' },
  { icon: 'Briefcase', label: 'Portfolio evidence', description: 'Project and work samples where included in the curriculum' },
  { icon: 'ShieldCheck', label: 'Verification status', description: 'Any external recognition or accreditation must be confirmed separately' },
];

/*
 * Pathway-level career directions are used only when a course does not have
 * individually reviewed career entries. They describe possible applications
 * of the skills, not promised jobs or professional eligibility. Course-specific
 * career data takes precedence whenever it is available.
 */
const CAREER_DIRECTIONS_BY_PATHWAY = {
  'english-communication': [
    'Customer support and client communication',
    'Administrative and communications support',
    'English tutoring or language support, where appropriately qualified',
    'Workplace communication and presentation roles',
  ],
  'world-languages': [
    'Multilingual customer support',
    'Language-services project assistance',
    'Localization and content-review support',
    'Language tutoring, where appropriately qualified',
  ],
  'international-qualifications': [
    'Progression to further study or professional training',
    'Academic administration and learner support',
    'Examination preparation support, where qualified',
    'Roles aligned with the specific qualification studied',
  ],
  'kenya-curriculum-tvet': [
    'Teaching and learning support',
    'Training administration and workshop support',
    'Curriculum and instructional-material support',
    'Technical training roles where required credentials are held',
  ],
  'digital-skills-productivity': [
    'Digital administration and office support',
    'Data entry and records coordination',
    'Digital operations support',
    'Productivity-tool support for teams and small businesses',
  ],
  'creative-design-media': [
    'Graphic design and visual-content assistance',
    'Social media and digital-content production',
    'Multimedia production support',
    'Creative project coordination',
  ],
  'business-entrepreneurship': [
    'Small-business and enterprise development',
    'Business operations and administration',
    'Sales, marketing and customer relations',
    'Project coordination, depending on experience',
  ],
  'freelancing-remote-work': [
    'Independent freelance service delivery',
    'Virtual assistance and remote administration',
    'Remote customer support',
    'Online tutoring or specialist services where qualified',
  ],
  'career-global': [
    'Career development and job-search support',
    'Recruitment and people-operations assistance',
    'Project and programme support',
    'Professional progression within the learner’s existing field',
  ],
  'education-teaching-training': [
    'Teaching and learner-support roles',
    'Training coordination and administration',
    'Instructional content development',
    'Trainer or educator roles where required qualifications are held',
  ],
  'health-hospitality-community': [
    'Hospitality and service operations',
    'Community-programme support',
    'Customer care and service coordination',
    'Administrative support in relevant service settings',
  ],
  'personal-life-skills': [
    'Teamwork and workplace communication',
    'Community and volunteer coordination',
    'Personal effectiveness in existing roles',
    'Peer-support activities where suitable and appropriately supervised',
  ],
  'software-engineering': [
    'Junior software and web development',
    'Quality assurance and software testing',
    'Application support and maintenance',
    'Entry-level development project work',
  ],
  'data-analytics': [
    'Junior data and reporting analysis',
    'Data quality and records support',
    'Business intelligence support',
    'Dashboard and operational reporting',
  ],
  'ai-intelligent-systems': [
    'AI-enabled workflow and automation support',
    'Data preparation and AI operations support',
    'AI application prototyping',
    'Responsible adoption of AI tools in a relevant field',
  ],
  'cloud-infrastructure': [
    'Cloud and IT operations support',
    'Junior systems administration',
    'Infrastructure monitoring and service desk work',
    'DevOps support, depending on practical experience',
  ],
  'cybersecurity': [
    'IT support with a security focus',
    'Security operations trainee pathways',
    'Security awareness and compliance support',
    'Entry-level risk and incident documentation support',
  ],
  'engineering-smart-systems': [
    'Electronics and engineering technician pathways',
    'Automation and control-system support',
    'Technical project and workshop assistance',
    'IoT and prototype development support',
  ],
  'creative-technology': [
    'Interactive and multimedia content production',
    'Digital experience and interface prototyping',
    'Creative technology project support',
    'Digital media production and testing',
  ],
};

function getCareerDirections(base, detail) {
  if (Array.isArray(detail?.careers) && detail.careers.length > 0) return detail.careers;
  return CAREER_DIRECTIONS_BY_PATHWAY[base.pathwayId] || [
    'Entry-level support roles related to the course subject',
    'Further study or specialist training in the subject area',
    'Project-based practice to build a portfolio of evidence',
    'Applying the skills within the learner’s current workplace or business',
  ];
}

/* ──────────────────────────────────────────────────────────────
   COURSE DETAILS
   ────────────────────────────────────────────────────────────── */

export const COURSE_DETAILS = {
  // ═══ Global Languages & Communication Pathway ═══
  ENG101: {
    overview: {
      description:
        'English Speaking Fundamentals is a practical, beginner-friendly course designed to build confident, fluent spoken English for everyday and professional contexts. Through guided conversation, pronunciation drills, and real-world scenarios, you will develop the communication skills needed to express yourself clearly and naturally.',
      targetAudience:
        'Beginners and early learners who want to build confidence in spoken English, professionals who need basic English for the workplace, and students preparing for further study.',
      objectives: [
        'Develop accurate pronunciation and natural intonation',
        'Build a functional everyday vocabulary',
        'Construct grammatically correct sentences in conversation',
        'Participate confidently in introductions and small talk',
      ],
      outcomes: [
        'Speak English with greater confidence in social and professional settings',
        'Understand and use common phrases and expressions naturally',
        'Hold short conversations on familiar topics',
        'Transition to advanced communication courses with a solid foundation',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'MessageSquare', text: 'Communicate confidently in everyday situations' },
      { icon: 'BookOpen', text: 'Develop practical speaking and listening skills' },
      { icon: 'Briefcase', text: 'Apply English in professional contexts' },
      { icon: 'Globe', text: 'Connect with people across cultures' },
      { icon: 'Brain', text: 'Think critically in a second language' },
      { icon: 'Lightbulb', text: 'Solve real-world communication challenges' },
    ],
    modules: [
      { title: 'Introduction to Spoken English', description: 'Sounds, rhythm, and intonation patterns of natural English speech.', hours: 6 },
      { title: 'Building Vocabulary', description: 'Essential everyday vocabulary and common expressions for daily life.', hours: 8 },
      { title: 'Grammar in Conversation', description: 'Core grammatical structures used in spoken English, from tenses to question forms.', hours: 10 },
      { title: 'Practical Conversations', description: 'Role-plays and guided dialogues for introductions, shopping, travel, and more.', hours: 10 },
      { title: 'Assessment & Feedback', description: 'Individual speaking assessment with personalised feedback and next steps.', hours: 4 },
    ],
    entryRequirements: [
      'Minimum age of 16 years',
      'Basic literacy in any language',
      'Internet access for online learners',
      'Commitment to attend and participate',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly speaking and listening tasks' },
      { icon: 'Users', label: 'Practical Work', description: 'Guided conversation role-plays' },
      { icon: 'Mic', label: 'Presentations', description: 'Short oral presentations' },
      { icon: 'Award', label: 'Final Assessment', description: 'One-on-one speaking evaluation' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Customer Support Representative', 'Receptionist', 'Retail Assistant', 'Call Centre Agent', 'Administrative Assistant', 'Hospitality Staff'],
    relatedCourses: ['ENG102', 'ENG106', 'ENG105', 'ENG104'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  ENG102: {
    overview: {
      description:
        'Advanced English Communication refines your grammar, fluency, and professional English for high-stakes contexts. You will master complex sentence structures, formal and informal registers, and the art of persuasive communication.',
      targetAudience:
        'Learners with intermediate English who want to advance to professional-level communication, and professionals preparing for leadership or client-facing roles.',
      objectives: [
        'Master advanced grammatical structures',
        'Develop formal and informal communication registers',
        'Build persuasive and negotiation skills',
        'Write professional emails and reports',
      ],
      outcomes: [
        'Communicate fluently in professional and academic settings',
        'Write clear, structured professional documents',
        'Negotiate and persuade effectively in English',
        'Transition to specialised communication or qualification courses',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'MessageSquare', text: 'Communicate with precision and fluency' },
      { icon: 'PenLine', text: 'Write professional documents with confidence' },
      { icon: 'Briefcase', text: 'Apply English in high-stakes professional contexts' },
      { icon: 'Users', text: 'Negotiate and persuade effectively' },
      { icon: 'Brain', text: 'Think critically and articulate complex ideas' },
      { icon: 'Lightbulb', text: 'Solve communication challenges in real time' },
    ],
    modules: [
      { title: 'Advanced Grammar & Syntax', description: 'Complex sentence structures, conditionals, and nuanced tense usage.', hours: 8 },
      { title: 'Professional Writing', description: 'Emails, reports, proposals, and formal correspondence.', hours: 10 },
      { title: 'Persuasive Communication', description: 'Rhetoric, negotiation, and influencing techniques.', hours: 10 },
      { title: 'Advanced Conversation Practice', description: 'Debates, discussions, and professional role-plays.', hours: 8 },
      { title: 'Assessment & Certification', description: 'Written and oral assessment with feedback.', hours: 4 },
    ],
    entryRequirements: [
      'Intermediate English proficiency',
      'Completion of ENG101 or equivalent',
      'Internet access for online learners',
      'Commitment to weekly assignments',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly writing and speaking tasks' },
      { icon: 'Users', label: 'Practical Work', description: 'Professional communication simulations' },
      { icon: 'Mic', label: 'Presentations', description: 'Persuasive oral presentations' },
      { icon: 'Award', label: 'Final Assessment', description: 'Written and oral examination' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Public Relations Officer', 'Communications Specialist', 'Business Executive', 'Project Manager', 'Content Writer', 'Diplomatic Staff'],
    relatedCourses: ['ENG101', 'ENG106', 'ENG105', 'ENG104'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  // ═══ Qualifications Pathway ═══
  IEL101: {
    overview: {
      description:
        'IELTS Academic Preparation is a focused course that builds the strategies and skills needed for the IELTS Academic test. Study Listening, Reading, Writing and Speaking with regular practice tests and instructor guidance.',
      targetAudience:
        'Students planning to study abroad, professionals seeking immigration or work visas, and anyone who needs an internationally recognised English language qualification.',
      objectives: [
        'Master all four IELTS modules (Listening, Reading, Writing, Speaking)',
        'Develop time management strategies for the exam',
        'Build academic and general vocabulary',
        'Practise with authentic IELTS materials',
      ],
      outcomes: [
        'Achieve a target IELTS band score of 6.5–8.0',
        'Approach the exam with confidence and strategy',
        'Write structured Task 1 and Task 2 essays',
        'Speak fluently in the IELTS interview format',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'Headphones', text: 'Understand complex spoken English with accuracy' },
      { icon: 'BookOpen', text: 'Read and comprehend academic texts rapidly' },
      { icon: 'PenLine', text: 'Write structured essays under time pressure' },
      { icon: 'Mic', text: 'Speak fluently on familiar and abstract topics' },
      { icon: 'Clock', text: 'Manage time effectively during the exam' },
      { icon: 'Target', text: 'Achieve your target band score' },
    ],
    modules: [
      { title: 'IELTS Overview & Strategy', description: 'Exam format, scoring criteria, and test-taking strategies.', hours: 6 },
      { title: 'Listening Module', description: 'Accurate listening for detail, main ideas, and opinion across accents.', hours: 10 },
      { title: 'Reading Module', description: 'Skimming, scanning, and deep comprehension of academic passages.', hours: 10 },
      { title: 'Writing Module', description: 'Task 1 (data description) and Task 2 (essay) with model answers.', hours: 12 },
      { title: 'Speaking Module & Mock Tests', description: 'Interview practice, full mock tests, and feedback.', hours: 12 },
    ],
    entryRequirements: [
      'Intermediate English proficiency (IELTS 5.0+ or equivalent)',
      'Familiarity with academic reading',
      'Internet access for online learners',
      'Commitment to daily practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly module-focused tasks' },
      { icon: 'ClipboardCheck', label: 'Mock Tests', description: 'Full-length IELTS practice tests' },
      { icon: 'Mic', label: 'Speaking Practice', description: 'Individual interview simulations' },
      { icon: 'Award', label: 'Final Assessment', description: 'Full mock exam with band score prediction' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['International Student', 'Healthcare Professional (abroad)', 'Immigration Applicant', 'Academic Researcher', 'Global Professional', 'Scholarship Candidate'],
    relatedCourses: ['IEL102', 'TOF101', 'CAM101', 'ENG102'],
    faqs: SHARED_FAQS,
    reviews: [
      { name: 'Grace Wanjiku', country: 'Kenya', rating: 5, text: 'I achieved a band 7.5 thanks to this course. The mock tests and speaking practice were invaluable.' },
      { name: 'Mohammed Yusuf', country: 'Somalia', rating: 5, text: 'The writing module was the best part. I finally understood how to structure Task 2 essays.' },
      { name: 'Sarah Kimani', country: 'Kenya', rating: 5, text: 'Professional instructors and authentic materials. I felt fully prepared on exam day.' },
    ],
  },

  IEL102: {
    overview: {
      description:
        'IELTS General Training focuses on the General Training module of the IELTS exam, designed for those seeking immigration, work visas, or vocational training in English-speaking countries. You will practise with authentic materials and develop strategies for each section.',
      targetAudience:
        'Professionals seeking immigration to English-speaking countries, skilled workers applying for work visas, and anyone needing IELTS General Training for visa purposes.',
      objectives: [
        'Master the General Training Reading and Writing modules',
        'Develop strategies for the Listening and Speaking sections',
        'Practise with authentic General Training materials',
        'Build confidence for the exam',
      ],
      outcomes: [
        'Achieve your target IELTS General Training band score',
        'Write effective General Training Task 1 letters and Task 2 essays',
        'Read and understand workplace and general texts',
        'Speak confidently in the IELTS interview',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'Headphones', text: 'Understand spoken English in everyday contexts' },
      { icon: 'BookOpen', text: 'Read workplace and general training texts' },
      { icon: 'PenLine', text: 'Write letters and essays for the General Training module' },
      { icon: 'Mic', text: 'Speak confidently in the interview' },
      { icon: 'Clock', text: 'Manage time during the exam' },
      { icon: 'Target', text: 'Achieve your visa-required band score' },
    ],
    modules: [
      { title: 'General Training Overview', description: 'Exam format, differences from Academic, and strategies.', hours: 6 },
      { title: 'Reading (General)', description: 'Workplace and general texts, scanning, and comprehension.', hours: 8 },
      { title: 'Writing (General)', description: 'Task 1 letters and Task 2 essays with model answers.', hours: 10 },
      { title: 'Listening & Speaking', description: 'Listening practice and interview preparation.', hours: 10 },
      { title: 'Mock Tests & Feedback', description: 'Full mock tests and personalised feedback.', hours: 8 },
    ],
    entryRequirements: [
      'Intermediate English proficiency',
      'Basic familiarity with IELTS format',
      'Internet access for online learners',
      'Commitment to regular practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly General Training tasks' },
      { icon: 'ClipboardCheck', label: 'Mock Tests', description: 'Full-length practice tests' },
      { icon: 'Mic', label: 'Speaking Practice', description: 'Interview simulations' },
      { icon: 'Award', label: 'Final Assessment', description: 'Full mock exam with band prediction' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Immigration Applicant', 'Skilled Worker (abroad)', 'Visa Applicant', 'Vocational Trainee', 'Healthcare Worker', 'Trades Professional'],
    relatedCourses: ['IEL101', 'TOF101', 'CAM101', 'ENG102'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  TOF101: {
    overview: {
      description:
        'TOEFL Preparation is a comprehensive course that prepares you for the TOEFL iBT exam. Covering Reading, Listening, Speaking, and Writing, you will develop the academic English skills and test-taking strategies needed to achieve a high score.',
      targetAudience:
        'Students applying to universities in North America, professionals seeking academic credentials, and anyone needing a TOEFL score for admission.',
      objectives: [
        'Master all four TOEFL iBT sections',
        'Develop academic English skills',
        'Build effective test-taking strategies',
        'Practise with authentic TOEFL materials',
      ],
      outcomes: [
        'Achieve a target TOEFL score of 90–110+',
        'Read and comprehend academic passages',
        'Write integrated and independent essays',
        'Speak confidently in the speaking section',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'BookOpen', text: 'Read and comprehend academic texts' },
      { icon: 'Headphones', text: 'Understand lectures and conversations' },
      { icon: 'PenLine', text: 'Write integrated and independent essays' },
      { icon: 'Mic', text: 'Speak on academic and campus topics' },
      { icon: 'Clock', text: 'Manage time across all sections' },
      { icon: 'Target', text: 'Achieve your target TOEFL score' },
    ],
    modules: [
      { title: 'TOEFL Overview & Strategy', description: 'Exam format, scoring, and test strategies.', hours: 6 },
      { title: 'Reading Section', description: 'Academic reading comprehension and question types.', hours: 10 },
      { title: 'Listening Section', description: 'Lectures, conversations, and note-taking skills.', hours: 10 },
      { title: 'Speaking & Writing', description: 'Independent and integrated tasks with practice.', hours: 12 },
      { title: 'Mock Tests & Feedback', description: 'Full-length practice tests and feedback.', hours: 8 },
    ],
    entryRequirements: [
      'Intermediate English proficiency',
      'Familiarity with academic English',
      'Internet access for online learners',
      'Commitment to daily practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly section-focused tasks' },
      { icon: 'ClipboardCheck', label: 'Mock Tests', description: 'Full-length TOEFL practice tests' },
      { icon: 'Mic', label: 'Speaking Practice', description: 'Speaking task simulations' },
      { icon: 'Award', label: 'Final Assessment', description: 'Full mock exam with score prediction' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['University Applicant', 'Graduate Student', 'Scholarship Candidate', 'International Student', 'Academic Researcher', 'Exchange Student'],
    relatedCourses: ['IEL101', 'IEL102', 'CAM101', 'ENG102'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  CAM101: {
    overview: {
      description:
        'Cambridge English prepares you for Cambridge English qualifications, including B2 First and C1 Advanced. You will develop the reading, writing, listening, and speaking skills needed to pass these internationally recognised exams.',
      targetAudience:
        'Students and professionals seeking Cambridge English certification for study, work, or visa purposes.',
      objectives: [
        'Master all Cambridge English exam sections',
        'Develop advanced English skills',
        'Build exam strategies and techniques',
        'Practise with authentic Cambridge materials',
      ],
      outcomes: [
        'Pass the B2 First or C1 Advanced exam',
        'Demonstrate advanced English proficiency',
        'Use English confidently in professional settings',
        'Enhance your CV with a recognised qualification',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'BookOpen', text: 'Master Cambridge exam formats' },
      { icon: 'Headphones', text: 'Understand complex spoken English' },
      { icon: 'PenLine', text: 'Write structured exam responses' },
      { icon: 'Mic', text: 'Speak at an advanced level' },
      { icon: 'Target', text: 'Achieve your target Cambridge grade' },
      { icon: 'Award', text: 'Earn a recognised qualification' },
    ],
    modules: [
      { title: 'Cambridge Exam Overview', description: 'B2 First and C1 Advanced formats, scoring, and strategies.', hours: 8 },
      { title: 'Reading & Use of English', description: 'Comprehension, vocabulary, and grammar tasks.', hours: 10 },
      { title: 'Writing', description: 'Essay, report, review, and letter writing.', hours: 10 },
      { title: 'Listening & Speaking', description: 'Listening comprehension and speaking tasks.', hours: 10 },
      { title: 'Mock Exams & Feedback', description: 'Full mock exams and personalised feedback.', hours: 8 },
    ],
    entryRequirements: [
      'Upper-intermediate English proficiency',
      'Familiarity with exam formats',
      'Internet access for online learners',
      'Commitment to regular practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly exam-focused tasks' },
      { icon: 'ClipboardCheck', label: 'Mock Exams', description: 'Full-length Cambridge practice exams' },
      { icon: 'Mic', label: 'Speaking Practice', description: 'Speaking task simulations' },
      { icon: 'Award', label: 'Final Assessment', description: 'Full mock exam with grade prediction' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['University Applicant', 'Professional (certified)', 'International Student', 'Visa Applicant', 'Academic Candidate', 'Global Professional'],
    relatedCourses: ['IEL101', 'IEL102', 'TOF101', 'ENG102'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  IGC101: {
    overview: {
      description:
        'IGCSE Foundation is a comprehensive course that builds a strong academic foundation for IGCSE examination success. Covering core subjects and study skills, it prepares learners for the rigour of international qualifications.',
      targetAudience:
        'Students aged 13–16 preparing for IGCSE, learners transitioning to international curriculum, and anyone seeking a strong academic foundation.',
      objectives: [
        'Build core academic skills across key subjects',
        'Develop effective study and revision strategies',
        'Understand IGCSE exam format and expectations',
        'Build confidence for international examinations',
      ],
      outcomes: [
        'Approach IGCSE study with confidence and strategy',
        'Demonstrate strong foundational knowledge',
        'Apply effective study and revision techniques',
        'Progress to IGCSE O Level and beyond',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'BookOpen', text: 'Build strong academic foundations' },
      { icon: 'Brain', text: 'Develop effective study strategies' },
      { icon: 'ClipboardCheck', text: 'Understand IGCSE exam formats' },
      { icon: 'PenLine', text: 'Write structured academic responses' },
      { icon: 'Target', text: 'Approach exams with confidence' },
      { icon: 'Lightbulb', text: 'Think critically across subjects' },
    ],
    modules: [
      { title: 'Study Skills & Academic Foundations', description: 'Note-taking, revision techniques, and time management.', hours: 8 },
      { title: 'Core English', description: 'Reading comprehension, writing, and grammar for IGCSE.', hours: 12 },
      { title: 'Core Mathematics', description: 'Number, algebra, geometry, and statistics foundations.', hours: 12 },
      { title: 'Sciences Foundations', description: 'Basic concepts in biology, chemistry, and physics.', hours: 10 },
      { title: 'Assessment & Exam Practice', description: 'Mock IGCSE questions and exam technique.', hours: 8 },
    ],
    entryRequirements: [
      'Basic English literacy',
      'Completion of primary education or equivalent',
      'Internet access for online learners',
      'Commitment to regular study',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly subject-specific tasks' },
      { icon: 'ClipboardCheck', label: 'Mock Exams', description: 'IGCSE-format practice tests' },
      { icon: 'PenLine', label: 'Written Work', description: 'Essays and structured responses' },
      { icon: 'Award', label: 'Final Assessment', description: 'Comprehensive mock examination' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['IGCSE Student', 'A Level Candidate', 'International Student', 'Scholarship Applicant', 'Academic Pathway', 'University Preparation'],
    relatedCourses: ['IGC201', 'IEL101', 'ENG101', 'ICT101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  IGC201: {
    overview: {
      description:
        'IGCSE O Level provides comprehensive preparation for IGCSE O Level examinations across English, Mathematics, Sciences, and Humanities. You will develop the knowledge and exam technique needed for top grades.',
      targetAudience: 'Students preparing for IGCSE O Level examinations, typically aged 14–16.',
      objectives: [
        'Master core IGCSE O Level subjects',
        'Develop exam technique and time management',
        'Build subject-specific knowledge',
        'Practise with past papers',
      ],
      outcomes: [
        'Approach IGCSE O Level exams with confidence',
        'Demonstrate strong subject knowledge',
        'Write structured exam responses',
        'Progress to AS and A Level',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'BookOpen', text: 'Master core IGCSE subjects' },
      { icon: 'PenLine', text: 'Write structured exam responses' },
      { icon: 'Brain', text: 'Think critically across subjects' },
      { icon: 'ClipboardCheck', text: 'Practise with past papers' },
      { icon: 'Target', text: 'Achieve top IGCSE grades' },
      { icon: 'Lightbulb', text: 'Develop independent study skills' },
    ],
    modules: [
      { title: 'English Language & Literature', description: 'Reading, writing, and literary analysis for IGCSE.', hours: 12 },
      { title: 'Mathematics', description: 'Number, algebra, geometry, and statistics for O Level.', hours: 12 },
      { title: 'Sciences', description: 'Biology, chemistry, and physics for IGCSE O Level.', hours: 12 },
      { title: 'Humanities', description: 'History, geography, and social studies.', hours: 8 },
      { title: 'Exam Practice & Mock Tests', description: 'Past papers, exam technique, and mock tests.', hours: 10 },
    ],
    entryRequirements: [
      'Completion of IGC101 or equivalent',
      'Basic English literacy',
      'Internet access for online learners',
      'Commitment to regular study',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Subject-specific tasks' },
      { icon: 'ClipboardCheck', label: 'Mock Exams', description: 'IGCSE-format mock tests' },
      { icon: 'PenLine', label: 'Written Work', description: 'Essays and structured responses' },
      { icon: 'Award', label: 'Final Assessment', description: 'Comprehensive mock examination' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['IGCSE Student', 'AS Level Candidate', 'International Student', 'Scholarship Applicant', 'University Preparation', 'Academic Pathway'],
    relatedCourses: ['IGC101', 'IGC301', 'IEL101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  IGC301: {
    overview: {
      description:
        'IGCSE AS Level prepares students for the AS Level examinations, bridging the gap between O Level and A Level with advanced subject content and critical thinking development.',
      targetAudience:
        'Students who have completed IGCSE O Level and are preparing for AS Level examinations.',
      objectives: [
        'Master AS Level subject content',
        'Develop critical thinking and analysis',
        'Build advanced exam technique',
        'Prepare for A Level study',
      ],
      outcomes: [
        'Approach AS Level exams with confidence',
        'Demonstrate advanced subject knowledge',
        'Analyse and evaluate complex topics',
        'Progress to A Level study',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'BookOpen', text: 'Master AS Level content' },
      { icon: 'Brain', text: 'Develop critical analysis skills' },
      { icon: 'PenLine', text: 'Write advanced academic essays' },
      { icon: 'ClipboardCheck', text: 'Master AS Level exam technique' },
      { icon: 'Target', text: 'Achieve top AS Level grades' },
      { icon: 'Lightbulb', text: 'Think independently and critically' },
    ],
    modules: [
      { title: 'Advanced English', description: 'Advanced language, literature, and academic writing.', hours: 12 },
      { title: 'Advanced Mathematics', description: 'Pure maths, mechanics, and statistics for AS Level.', hours: 12 },
      { title: 'Advanced Sciences', description: 'Biology, chemistry, and physics at AS Level depth.', hours: 12 },
      { title: 'Elective Subjects', description: 'Choose from humanities, business, or arts.', hours: 8 },
      { title: 'Exam Practice & Mock Tests', description: 'AS Level past papers and exam technique.', hours: 10 },
    ],
    entryRequirements: [
      'Completion of IGC201 or equivalent (O Level)',
      'Strong academic record',
      'Internet access for online learners',
      'Commitment to intensive study',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Advanced subject tasks' },
      { icon: 'ClipboardCheck', label: 'Mock Exams', description: 'AS Level mock tests' },
      { icon: 'PenLine', label: 'Essays', description: 'Analytical essays and responses' },
      { icon: 'Award', label: 'Final Assessment', description: 'Full mock examination' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['AS Level Student', 'A Level Candidate', 'University Applicant', 'Scholarship Candidate', 'Academic Pathway', 'Research Pathway'],
    relatedCourses: ['IGC101', 'IGC201', 'IGC401', 'IEL101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  IGC401: {
    overview: {
      description:
        'IGCSE A Level is the most advanced IGCSE qualification, preparing students for university admission worldwide. You will master complex subject content and develop the analytical skills needed for higher education.',
      targetAudience:
        'Students who have completed AS Level and are preparing for A Level examinations and university admission.',
      objectives: [
        'Master A Level subject content',
        'Develop university-level analytical skills',
        'Build independent research skills',
        'Prepare for university admission',
      ],
      outcomes: [
        'Approach A Level exams with confidence',
        'Demonstrate university-level knowledge',
        'Analyse and evaluate complex topics independently',
        'Gain admission to universities worldwide',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'BookOpen', text: 'Master A Level content' },
      { icon: 'Brain', text: 'Think at a university level' },
      { icon: 'PenLine', text: 'Write research-level essays' },
      { icon: 'ClipboardCheck', text: 'Excel in A Level exams' },
      { icon: 'Target', text: 'Gain university admission' },
      { icon: 'Lightbulb', text: 'Conduct independent research' },
    ],
    modules: [
      { title: 'Advanced English & Literature', description: 'University-level language and literary analysis.', hours: 14 },
      { title: 'Advanced Mathematics', description: 'Further maths, mechanics, and statistics.', hours: 14 },
      { title: 'Advanced Sciences', description: 'Biology, chemistry, and physics at A Level depth.', hours: 14 },
      { title: 'Specialist Electives', description: 'Specialised subjects for university preparation.', hours: 10 },
      { title: 'Exam Practice & University Prep', description: 'A Level past papers and university preparation.', hours: 12 },
    ],
    entryRequirements: [
      'Completion of IGC301 or equivalent (AS Level)',
      'Excellent academic record',
      'Internet access for online learners',
      'Commitment to intensive study',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'University-level assignments' },
      { icon: 'ClipboardCheck', label: 'Mock Exams', description: 'A Level mock examinations' },
      { icon: 'PenLine', label: 'Research Essays', description: 'Independent research essays' },
      { icon: 'Award', label: 'Final Assessment', description: 'Full A Level mock examination' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['University Student', 'Researcher', 'Professional (certified)', 'Graduate Candidate', 'Scholarship Recipient', 'Global Career Pathway'],
    relatedCourses: ['IGC101', 'IGC201', 'IGC301', 'IEL101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  // ═══ World Languages Pathway ═══
  ARB101: {
    overview: {
      description:
        'Arabic Language is a practical, immersive course that develops your speaking, reading, and writing skills in Modern Standard Arabic. From the alphabet to everyday conversation, you will build a strong foundation in one of the world\u2019s most widely spoken languages.',
      targetAudience:
        'Beginners with no prior Arabic knowledge, professionals working with Arabic-speaking communities, and students interested in Arabic culture or Islamic studies.',
      objectives: [
        'Master the Arabic alphabet and pronunciation',
        'Build everyday conversational vocabulary',
        'Read and write basic Arabic script',
        'Understand Arabic cultural contexts',
      ],
      outcomes: [
        'Read and write the Arabic alphabet confidently',
        'Hold simple conversations in Arabic',
        'Understand basic spoken Arabic in daily contexts',
        'Progress to intermediate Arabic study',
      ],
    },
    languageOfInstruction: 'English / Arabic',
    learningOutcomes: [
      { icon: 'BookOpen', text: 'Read and write Arabic script with confidence' },
      { icon: 'MessageSquare', text: 'Hold everyday conversations in Arabic' },
      { icon: 'Globe', text: 'Understand Arabic cultural contexts' },
      { icon: 'Headphones', text: 'Understand spoken Arabic in daily life' },
      { icon: 'Brain', text: 'Develop cross-cultural thinking' },
      { icon: 'Lightbulb', text: 'Apply Arabic in travel, work, or study' },
    ],
    modules: [
      { title: 'The Arabic Alphabet', description: 'Letters, sounds, and writing systems of Modern Standard Arabic.', hours: 8 },
      { title: 'Everyday Vocabulary', description: 'Greetings, numbers, colours, family, food, and daily expressions.', hours: 8 },
      { title: 'Basic Grammar', description: 'Sentence structure, gender, plurals, and essential verb forms.', hours: 10 },
      { title: 'Conversational Practice', description: 'Role-plays for shopping, travel, introductions, and daily life.', hours: 10 },
      { title: 'Assessment & Next Steps', description: 'Reading, writing, and speaking assessment with feedback.', hours: 4 },
    ],
    entryRequirements: [
      'No prior Arabic knowledge required',
      'Basic English literacy (for instruction)',
      'Internet access for online learners',
      'Commitment to daily practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly reading and writing tasks' },
      { icon: 'Users', label: 'Practical Work', description: 'Conversation role-plays' },
      { icon: 'Mic', label: 'Presentations', description: 'Short oral presentation in Arabic' },
      { icon: 'Award', label: 'Final Assessment', description: 'Reading, writing, and speaking evaluation' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Interpreter', 'Translator', 'Diplomatic Staff', 'NGO Worker', 'International Business', 'Arabic Teacher'],
    relatedCourses: ['SOM101', 'SWA101', 'FRE101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  SWA101: {
    overview: {
      description:
        'Swahili Language is a practical course that builds conversational fluency in Swahili, the most widely spoken African language. You will learn greetings, everyday vocabulary, grammar, and cultural context.',
      targetAudience:
        'Beginners with no prior Swahili knowledge, professionals working in East Africa, and anyone interested in African languages and culture.',
      objectives: [
        'Master Swahili pronunciation and greetings',
        'Build everyday conversational vocabulary',
        'Understand Swahili grammar basics',
        'Develop cultural awareness',
      ],
      outcomes: [
        'Hold simple conversations in Swahili',
        'Understand spoken Swahili in daily contexts',
        'Read and write basic Swahili',
        'Navigate East African contexts with confidence',
      ],
    },
    languageOfInstruction: 'English / Swahili',
    learningOutcomes: [
      { icon: 'MessageSquare', text: 'Hold everyday conversations in Swahili' },
      { icon: 'Headphones', text: 'Understand spoken Swahili' },
      { icon: 'BookOpen', text: 'Read and write basic Swahili' },
      { icon: 'Globe', text: 'Understand East African culture' },
      { icon: 'Briefcase', text: 'Use Swahili in professional contexts' },
      { icon: 'Lightbulb', text: 'Navigate East Africa with confidence' },
    ],
    modules: [
      { title: 'Swahili Foundations', description: 'Pronunciation, greetings, and basic expressions.', hours: 6 },
      { title: 'Everyday Vocabulary', description: 'Family, food, shopping, travel, and daily life.', hours: 8 },
      { title: 'Grammar Basics', description: 'Noun classes, verb conjugation, and sentence structure.', hours: 10 },
      { title: 'Conversational Practice', description: 'Role-plays for daily life, work, and travel.', hours: 8 },
      { title: 'Assessment & Feedback', description: 'Speaking, reading, and writing assessment.', hours: 4 },
    ],
    entryRequirements: [
      'No prior Swahili knowledge required',
      'Basic English literacy',
      'Internet access for online learners',
      'Commitment to daily practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practice tasks' },
      { icon: 'Users', label: 'Practical Work', description: 'Conversation role-plays' },
      { icon: 'Mic', label: 'Speaking', description: 'Oral practice and evaluation' },
      { icon: 'Award', label: 'Final Assessment', description: 'Reading, writing, and speaking evaluation' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Interpreter', 'Translator', 'NGO Worker', 'Tourism Professional', 'Researcher', 'East Africa Business Professional'],
    relatedCourses: ['ARB101', 'SOM101', 'FRE101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  SOM101: {
    overview: {
      description:
        'Somali Language is a practical course that develops your speaking, reading, and writing skills in Somali. You will learn everyday vocabulary, grammar, and cultural context for personal and professional use.',
      targetAudience:
        'Beginners with no prior Somali knowledge, professionals working with Somali-speaking communities, and diaspora reconnecting with their language.',
      objectives: [
        'Master Somali pronunciation and greetings',
        'Build everyday conversational vocabulary',
        'Understand Somali grammar basics',
        'Develop cultural awareness',
      ],
      outcomes: [
        'Hold simple conversations in Somali',
        'Understand spoken Somali in daily contexts',
        'Read and write basic Somali',
        'Connect with Somali-speaking communities',
      ],
    },
    languageOfInstruction: 'English / Somali',
    learningOutcomes: [
      { icon: 'MessageSquare', text: 'Hold everyday conversations in Somali' },
      { icon: 'Headphones', text: 'Understand spoken Somali' },
      { icon: 'BookOpen', text: 'Read and write basic Somali' },
      { icon: 'Globe', text: 'Understand Somali culture' },
      { icon: 'Briefcase', text: 'Use Somali in professional contexts' },
      { icon: 'Lightbulb', text: 'Connect with Somali communities' },
    ],
    modules: [
      { title: 'Somali Foundations', description: 'Pronunciation, greetings, and basic expressions.', hours: 6 },
      { title: 'Everyday Vocabulary', description: 'Family, food, shopping, travel, and daily life.', hours: 8 },
      { title: 'Grammar Basics', description: 'Sentence structure, verbs, and essential grammar.', hours: 10 },
      { title: 'Conversational Practice', description: 'Role-plays for daily life, work, and community.', hours: 8 },
      { title: 'Assessment & Feedback', description: 'Speaking, reading, and writing assessment.', hours: 4 },
    ],
    entryRequirements: [
      'No prior Somali knowledge required',
      'Basic English literacy',
      'Internet access for online learners',
      'Commitment to daily practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practice tasks' },
      { icon: 'Users', label: 'Practical Work', description: 'Conversation role-plays' },
      { icon: 'Mic', label: 'Speaking', description: 'Oral practice and evaluation' },
      { icon: 'Award', label: 'Final Assessment', description: 'Reading, writing, and speaking evaluation' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Interpreter', 'Translator', 'NGO Worker', 'Community Worker', 'Healthcare Professional', 'Education Professional'],
    relatedCourses: ['ARB101', 'SWA101', 'FRE101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  FRE101: {
    overview: {
      description:
        'French Language is a practical course that develops your speaking, reading, and writing skills in French. From greetings to conversation, you will build a strong foundation in one of the world\u2019s most important diplomatic and business languages.',
      targetAudience:
        'Beginners with no prior French knowledge, students planning to study in francophone countries, and professionals working with French-speaking clients.',
      objectives: [
        'Master French pronunciation and greetings',
        'Build everyday conversational vocabulary',
        'Understand French grammar basics',
        'Develop cultural awareness',
      ],
      outcomes: [
        'Hold simple conversations in French',
        'Understand spoken French in daily contexts',
        'Read and write basic French',
        'Progress to intermediate French study',
      ],
    },
    languageOfInstruction: 'English / French',
    learningOutcomes: [
      { icon: 'MessageSquare', text: 'Hold everyday conversations in French' },
      { icon: 'Headphones', text: 'Understand spoken French' },
      { icon: 'BookOpen', text: 'Read and write basic French' },
      { icon: 'Globe', text: 'Understand francophone culture' },
      { icon: 'Briefcase', text: 'Use French in professional contexts' },
      { icon: 'Lightbulb', text: 'Navigate francophone contexts with confidence' },
    ],
    modules: [
      { title: 'French Foundations', description: 'Pronunciation, greetings, and basic expressions.', hours: 8 },
      { title: 'Everyday Vocabulary', description: 'Family, food, shopping, travel, and daily life.', hours: 8 },
      { title: 'Grammar Basics', description: 'Articles, genders, verbs, and sentence structure.', hours: 10 },
      { title: 'Conversational Practice', description: 'Role-plays for daily life, work, and travel.', hours: 10 },
      { title: 'Assessment & Feedback', description: 'Speaking, reading, and writing assessment.', hours: 4 },
    ],
    entryRequirements: [
      'No prior French knowledge required',
      'Basic English literacy',
      'Internet access for online learners',
      'Commitment to daily practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practice tasks' },
      { icon: 'Users', label: 'Practical Work', description: 'Conversation role-plays' },
      { icon: 'Mic', label: 'Speaking', description: 'Oral practice and evaluation' },
      { icon: 'Award', label: 'Final Assessment', description: 'Reading, writing, and speaking evaluation' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Interpreter', 'Translator', 'Diplomatic Staff', 'International Business', 'Tourism Professional', 'French Teacher'],
    relatedCourses: ['ARB101', 'SWA101', 'GER101', 'SPA101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  GER101: {
    overview: {
      description:
        'German Language is a practical course that develops your speaking, reading, and writing skills in German. You will build a foundation in Europe\u2019s most spoken native language, useful for study, work, and travel in German-speaking countries.',
      targetAudience:
        'Beginners with no prior German knowledge, students planning to study in Germany, and professionals working with German-speaking clients.',
      objectives: [
        'Master German pronunciation and greetings',
        'Build everyday conversational vocabulary',
        'Understand German grammar basics',
        'Develop cultural awareness',
      ],
      outcomes: [
        'Hold simple conversations in German',
        'Understand spoken German in daily contexts',
        'Read and write basic German',
        'Progress to intermediate German study',
      ],
    },
    languageOfInstruction: 'English / German',
    learningOutcomes: [
      { icon: 'MessageSquare', text: 'Hold everyday conversations in German' },
      { icon: 'Headphones', text: 'Understand spoken German' },
      { icon: 'BookOpen', text: 'Read and write basic German' },
      { icon: 'Globe', text: 'Understand German culture' },
      { icon: 'Briefcase', text: 'Use German in professional contexts' },
      { icon: 'Lightbulb', text: 'Prepare for study or work in Germany' },
    ],
    modules: [
      { title: 'German Foundations', description: 'Pronunciation, greetings, and basic expressions.', hours: 8 },
      { title: 'Everyday Vocabulary', description: 'Family, food, shopping, travel, and daily life.', hours: 8 },
      { title: 'Grammar Basics', description: 'Articles, cases, verbs, and sentence structure.', hours: 10 },
      { title: 'Conversational Practice', description: 'Role-plays for daily life, work, and travel.', hours: 10 },
      { title: 'Assessment & Feedback', description: 'Speaking, reading, and writing assessment.', hours: 4 },
    ],
    entryRequirements: [
      'No prior German knowledge required',
      'Basic English literacy',
      'Internet access for online learners',
      'Commitment to daily practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practice tasks' },
      { icon: 'Users', label: 'Practical Work', description: 'Conversation role-plays' },
      { icon: 'Mic', label: 'Speaking', description: 'Oral practice and evaluation' },
      { icon: 'Award', label: 'Final Assessment', description: 'Reading, writing, and speaking evaluation' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Interpreter', 'Translator', 'Engineering Professional', 'International Business', 'Student in Germany', 'German Teacher'],
    relatedCourses: ['FRE101', 'SPA101', 'MAN101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  SPA101: {
    overview: {
      description:
        'Spanish Language is a practical course that develops your speaking, reading, and writing skills in Spanish, the second most spoken native language in the world. You will learn everyday vocabulary, grammar, and cultural context.',
      targetAudience:
        'Beginners with no prior Spanish knowledge, professionals working with Spanish-speaking clients, and travellers to Spanish-speaking countries.',
      objectives: [
        'Master Spanish pronunciation and greetings',
        'Build everyday conversational vocabulary',
        'Understand Spanish grammar basics',
        'Develop cultural awareness',
      ],
      outcomes: [
        'Hold simple conversations in Spanish',
        'Understand spoken Spanish in daily contexts',
        'Read and write basic Spanish',
        'Progress to intermediate Spanish study',
      ],
    },
    languageOfInstruction: 'English / Spanish',
    learningOutcomes: [
      { icon: 'MessageSquare', text: 'Hold everyday conversations in Spanish' },
      { icon: 'Headphones', text: 'Understand spoken Spanish' },
      { icon: 'BookOpen', text: 'Read and write basic Spanish' },
      { icon: 'Globe', text: 'Understand Hispanic culture' },
      { icon: 'Briefcase', text: 'Use Spanish in professional contexts' },
      { icon: 'Lightbulb', text: 'Navigate Spanish-speaking contexts with confidence' },
    ],
    modules: [
      { title: 'Spanish Foundations', description: 'Pronunciation, greetings, and basic expressions.', hours: 8 },
      { title: 'Everyday Vocabulary', description: 'Family, food, shopping, travel, and daily life.', hours: 8 },
      { title: 'Grammar Basics', description: 'Articles, genders, verbs, and sentence structure.', hours: 10 },
      { title: 'Conversational Practice', description: 'Role-plays for daily life, work, and travel.', hours: 10 },
      { title: 'Assessment & Feedback', description: 'Speaking, reading, and writing assessment.', hours: 4 },
    ],
    entryRequirements: [
      'No prior Spanish knowledge required',
      'Basic English literacy',
      'Internet access for online learners',
      'Commitment to daily practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practice tasks' },
      { icon: 'Users', label: 'Practical Work', description: 'Conversation role-plays' },
      { icon: 'Mic', label: 'Speaking', description: 'Oral practice and evaluation' },
      { icon: 'Award', label: 'Final Assessment', description: 'Reading, writing, and speaking evaluation' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Interpreter', 'Translator', 'International Business', 'Tourism Professional', 'Customer Support', 'Spanish Teacher'],
    relatedCourses: ['FRE101', 'GER101', 'MAN101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  MAN101: {
    overview: {
      description:
        'Mandarin Chinese is a practical course that develops your speaking, reading, and writing skills in Mandarin Chinese, the most spoken native language in the world. You will learn tones, characters, everyday vocabulary, and cultural context.',
      targetAudience:
        'Beginners with no prior Mandarin knowledge, business professionals working with China, and students interested in Chinese language and culture.',
      objectives: [
        'Master Mandarin tones and pronunciation',
        'Learn basic Chinese characters',
        'Build everyday conversational vocabulary',
        'Understand Chinese cultural context',
      ],
      outcomes: [
        'Hold simple conversations in Mandarin',
        'Read and write basic Chinese characters',
        'Understand spoken Mandarin in daily contexts',
        'Navigate Chinese-speaking contexts with confidence',
      ],
    },
    languageOfInstruction: 'English / Mandarin',
    learningOutcomes: [
      { icon: 'MessageSquare', text: 'Hold everyday conversations in Mandarin' },
      { icon: 'Headphones', text: 'Understand spoken Mandarin' },
      { icon: 'BookOpen', text: 'Read and write basic Chinese characters' },
      { icon: 'Globe', text: 'Understand Chinese culture' },
      { icon: 'Briefcase', text: 'Use Mandarin in business contexts' },
      { icon: 'Lightbulb', text: 'Navigate Chinese-speaking contexts' },
    ],
    modules: [
      { title: 'Mandarin Foundations', description: 'Tones, pronunciation, and Pinyin romanisation.', hours: 10 },
      { title: 'Basic Characters', description: 'Essential characters and stroke order.', hours: 10 },
      { title: 'Everyday Vocabulary', description: 'Greetings, numbers, family, food, and daily life.', hours: 10 },
      { title: 'Conversational Practice', description: 'Role-plays for daily life, business, and travel.', hours: 10 },
      { title: 'Assessment & Feedback', description: 'Speaking, reading, and writing assessment.', hours: 4 },
    ],
    entryRequirements: [
      'No prior Mandarin knowledge required',
      'Basic English literacy',
      'Internet access for online learners',
      'Commitment to daily practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practice tasks' },
      { icon: 'Users', label: 'Practical Work', description: 'Conversation role-plays' },
      { icon: 'Mic', label: 'Speaking', description: 'Oral practice and evaluation' },
      { icon: 'Award', label: 'Final Assessment', description: 'Reading, writing, and speaking evaluation' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Interpreter', 'Translator', 'International Business', 'Import/Export Professional', 'Manufacturing Professional', 'Mandarin Teacher'],
    relatedCourses: ['FRE101', 'GER101', 'SPA101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  // ═══ Digital Skills Pathway ═══
  ICT101: {
    overview: {
      description:
        'ICT Essentials is a foundational course that builds core digital literacy and productivity skills for the modern workplace. From computer fundamentals to essential software tools, you will gain the confidence to navigate the digital world.',
      targetAudience:
        'Beginners new to computers, professionals looking to upgrade their digital skills, and anyone who wants to build foundational ICT competence.',
      objectives: [
        'Understand computer hardware and software fundamentals',
        'Master file management and internet navigation',
        'Develop productivity with Microsoft Office and Google Workspace',
        'Build safe and responsible digital habits',
      ],
      outcomes: [
        'Use a computer confidently for daily tasks',
        'Create documents, spreadsheets, and presentations',
        'Navigate the internet safely and efficiently',
        'Progress to advanced digital skills courses',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'Monitor', text: 'Use computers and digital tools confidently' },
      { icon: 'FileText', text: 'Create professional documents and spreadsheets' },
      { icon: 'Globe', text: 'Navigate the internet safely and efficiently' },
      { icon: 'ShieldCheck', text: 'Practice safe digital habits' },
      { icon: 'Briefcase', text: 'Apply ICT skills in the workplace' },
      { icon: 'Lightbulb', text: 'Solve everyday digital problems' },
    ],
    modules: [
      { title: 'Computer Fundamentals', description: 'Hardware, software, operating systems, and file management.', hours: 6 },
      { title: 'Internet & Email', description: 'Browsing, search, email communication, and online safety.', hours: 6 },
      { title: 'Microsoft Office Essentials', description: 'Word, Excel, and PowerPoint for productivity.', hours: 12 },
      { title: 'Google Workspace', description: 'Docs, Sheets, Slides, and Drive for cloud collaboration.', hours: 8 },
      { title: 'Assessment & Certification', description: 'Practical tasks and final assessment.', hours: 4 },
    ],
    entryRequirements: [
      'No prior computer experience required',
      'Basic English literacy',
      'Access to a computer or smartphone',
      'Commitment to hands-on practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practical tasks' },
      { icon: 'ClipboardCheck', label: 'Practical Work', description: 'Real-world document and spreadsheet tasks' },
      { icon: 'Monitor', label: 'Projects', description: 'Mini-projects using Office and Google Workspace' },
      { icon: 'Award', label: 'Final Assessment', description: 'Comprehensive practical exam' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Administrative Assistant', 'Data Entry Clerk', 'Virtual Assistant', 'Office Manager', 'Customer Support', 'Digital Entrepreneur'],
    relatedCourses: ['ICT102', 'ICT201', 'ENG101', 'ENG105'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  ICT102: {
    overview: {
      description:
        'Computer Packages is a comprehensive course covering the essential software packages used in offices worldwide. You will master word processing, spreadsheets, presentations, databases, and internet tools.',
      targetAudience:
        'Beginners who want to master office software, job seekers needing computer skills, and professionals upgrading their software proficiency.',
      objectives: [
        'Master word processing with Word',
        'Develop spreadsheet skills with Excel',
        'Create presentations with PowerPoint',
        'Use databases and internet tools',
      ],
      outcomes: [
        'Create professional documents',
        'Build and analyse spreadsheets',
        'Design effective presentations',
        'Use office software confidently',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'FileText', text: 'Create professional documents' },
      { icon: 'ClipboardCheck', text: 'Build and analyse spreadsheets' },
      { icon: 'Monitor', text: 'Design effective presentations' },
      { icon: 'Briefcase', text: 'Use office software confidently' },
      { icon: 'Lightbulb', text: 'Solve office productivity challenges' },
      { icon: 'Globe', text: 'Use internet tools effectively' },
    ],
    modules: [
      { title: 'Word Processing', description: 'Microsoft Word: documents, formatting, and templates.', hours: 8 },
      { title: 'Spreadsheets', description: 'Microsoft Excel: formulas, charts, and data analysis.', hours: 10 },
      { title: 'Presentations', description: 'Microsoft PowerPoint: slides, design, and delivery.', hours: 6 },
      { title: 'Databases & Internet', description: 'Microsoft Access, internet, and email tools.', hours: 8 },
      { title: 'Assessment & Certification', description: 'Practical tasks and final assessment.', hours: 4 },
    ],
    entryRequirements: [
      'Basic computer literacy',
      'Basic English literacy',
      'Access to a computer',
      'Commitment to hands-on practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practical tasks' },
      { icon: 'ClipboardCheck', label: 'Practical Work', description: 'Real-world document and spreadsheet tasks' },
      { icon: 'Monitor', label: 'Projects', description: 'Mini-projects using Office software' },
      { icon: 'Award', label: 'Final Assessment', description: 'Comprehensive practical exam' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Office Assistant', 'Data Entry Clerk', 'Administrative Officer', 'Records Clerk', 'Customer Support', 'Secretary'],
    relatedCourses: ['ICT101', 'ICT201', 'ICT202', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  ICT201: {
    overview: {
      description:
        'Microsoft Office is a focused course that takes you from basic to advanced proficiency in Word, Excel, PowerPoint, and Outlook. You will learn to create professional documents, analyse data, build presentations, and manage communications.',
      targetAudience:
        'Professionals who need advanced Microsoft Office skills, job seekers, and anyone who wants to master the Office suite.',
      objectives: [
        'Master advanced Word features',
        'Develop advanced Excel data analysis skills',
        'Create professional PowerPoint presentations',
        'Manage email and calendar with Outlook',
      ],
      outcomes: [
        'Use Microsoft Office at an advanced level',
        'Create professional documents and reports',
        'Analyse data with Excel formulas and charts',
        'Manage professional communications',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'FileText', text: 'Master advanced Word features' },
      { icon: 'ClipboardCheck', text: 'Analyse data with Excel' },
      { icon: 'Monitor', text: 'Create professional presentations' },
      { icon: 'Mail', text: 'Manage email with Outlook' },
      { icon: 'Briefcase', text: 'Use Office at a professional level' },
      { icon: 'Lightbulb', text: 'Automate office tasks' },
    ],
    modules: [
      { title: 'Advanced Word', description: 'Styles, templates, mail merge, and long documents.', hours: 8 },
      { title: 'Advanced Excel', description: 'Formulas, pivot tables, charts, and data analysis.', hours: 12 },
      { title: 'PowerPoint Mastery', description: 'Design, animations, and professional delivery.', hours: 6 },
      { title: 'Outlook & Integration', description: 'Email, calendar, and Office integration.', hours: 6 },
      { title: 'Assessment & Certification', description: 'Practical exam and certification.', hours: 4 },
    ],
    entryRequirements: [
      'Basic computer literacy (ICT101 or equivalent)',
      'Basic English literacy',
      'Access to a computer',
      'Commitment to hands-on practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practical tasks' },
      { icon: 'ClipboardCheck', label: 'Practical Work', description: 'Real-world Office tasks' },
      { icon: 'Monitor', label: 'Projects', description: 'Mini-projects using Office apps' },
      { icon: 'Award', label: 'Final Assessment', description: 'Comprehensive practical exam' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Office Manager', 'Executive Assistant', 'Data Analyst', 'Project Coordinator', 'Administrative Manager', 'Business Professional'],
    relatedCourses: ['ICT101', 'ICT102', 'ICT202', 'ENG105'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  ICT202: {
    overview: {
      description:
        'Google Workspace is a practical course that develops your skills in Google\u2019s cloud productivity suite. You will learn to create documents, manage spreadsheets, build presentations, store files, and collaborate in real time.',
      targetAudience:
        'Professionals and students who use Google Workspace, teams collaborating in the cloud, and anyone switching from Microsoft Office to Google.',
      objectives: [
        'Master Google Docs, Sheets, and Slides',
        'Manage files with Google Drive',
        'Communicate with Gmail and Meet',
        'Collaborate in real time',
      ],
      outcomes: [
        'Use Google Workspace confidently',
        'Create and share cloud documents',
        'Collaborate with teams in real time',
        'Manage cloud storage effectively',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'FileText', text: 'Master Google Docs, Sheets, and Slides' },
      { icon: 'Globe', text: 'Manage files with Google Drive' },
      { icon: 'Mail', text: 'Communicate with Gmail and Meet' },
      { icon: 'Users', text: 'Collaborate in real time' },
      { icon: 'Briefcase', text: 'Use Google Workspace professionally' },
      { icon: 'Lightbulb', text: 'Boost productivity with cloud tools' },
    ],
    modules: [
      { title: 'Google Docs', description: 'Create, format, and share documents.', hours: 4 },
      { title: 'Google Sheets', description: 'Spreadsheets, formulas, and charts.', hours: 6 },
      { title: 'Google Slides', description: 'Presentations, design, and delivery.', hours: 4 },
      { title: 'Drive, Gmail & Meet', description: 'File storage, email, and video meetings.', hours: 6 },
      { title: 'Assessment & Certification', description: 'Practical tasks and assessment.', hours: 4 },
    ],
    entryRequirements: [
      'Basic computer literacy',
      'Basic English literacy',
      'Access to a computer with internet',
      'Commitment to hands-on practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practical tasks' },
      { icon: 'ClipboardCheck', label: 'Practical Work', description: 'Real-world cloud tasks' },
      { icon: 'Monitor', label: 'Projects', description: 'Mini-projects using Google apps' },
      { icon: 'Award', label: 'Final Assessment', description: 'Comprehensive practical exam' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Virtual Assistant', 'Remote Worker', 'Project Coordinator', 'Content Creator', 'Online Educator', 'Cloud Collaboration Specialist'],
    relatedCourses: ['ICT101', 'ICT102', 'ICT201', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  ICT301: {
    overview: {
      description:
        'Digital Literacy is a comprehensive course that builds the skills to navigate the digital world safely and effectively. From internet safety to digital communication, online research, and digital citizenship, you will develop the confidence to thrive online.',
      targetAudience:
        'Beginners who want to build digital confidence, parents, seniors, and anyone who wants to use the internet safely and effectively.',
      objectives: [
        'Build safe internet browsing habits',
        'Develop digital communication skills',
        'Learn online research and evaluation',
        'Understand digital citizenship',
      ],
      outcomes: [
        'Navigate the internet safely',
        'Communicate effectively online',
        'Evaluate online information critically',
        'Practice responsible digital citizenship',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'ShieldCheck', text: 'Browse the internet safely' },
      { icon: 'MessageSquare', text: 'Communicate effectively online' },
      { icon: 'Globe', text: 'Research and evaluate online information' },
      { icon: 'Brain', text: 'Think critically about digital content' },
      { icon: 'Users', text: 'Practice responsible digital citizenship' },
      { icon: 'Lightbulb', text: 'Protect your digital identity' },
    ],
    modules: [
      { title: 'Internet Safety', description: 'Safe browsing, passwords, and online threats.', hours: 4 },
      { title: 'Digital Communication', description: 'Email, messaging, and online etiquette.', hours: 4 },
      { title: 'Online Research', description: 'Search, evaluate sources, and verify information.', hours: 4 },
      { title: 'Digital Citizenship', description: 'Privacy, data, social media, and digital rights.', hours: 4 },
      { title: 'Assessment & Certification', description: 'Practical assessment and certification.', hours: 4 },
    ],
    entryRequirements: [
      'No prior experience required',
      'Basic English literacy',
      'Access to a smartphone or computer',
      'Commitment to learning',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practical tasks' },
      { icon: 'ClipboardCheck', label: 'Practical Work', description: 'Real-world online tasks' },
      { icon: 'Globe', label: 'Research', description: 'Online research exercises' },
      { icon: 'Award', label: 'Final Assessment', description: 'Practical assessment' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Digital Citizen', 'Online Shopper', 'Remote Worker', 'Student', 'Community Member', 'Internet User'],
    relatedCourses: ['ICT101', 'ICT102', 'CYB101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  WEB101: {
    overview: {
      description:
        'Introduction to Web Development is a hands-on course that teaches you to build websites from scratch using HTML, CSS, and JavaScript. You will learn modern web development practices and build a portfolio of projects.',
      targetAudience:
        'Beginners interested in web development, students considering a tech career, and professionals who want to build websites.',
      objectives: [
        'Master HTML structure and semantics',
        'Style websites with CSS',
        'Add interactivity with JavaScript',
        'Build responsive, modern websites',
      ],
      outcomes: [
        'Build websites from scratch',
        'Create responsive layouts',
        'Add interactivity with JavaScript',
        'Build a web development portfolio',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'Code', text: 'Build websites with HTML' },
      { icon: 'Monitor', text: 'Style websites with CSS' },
      { icon: 'Lightbulb', text: 'Add interactivity with JavaScript' },
      { icon: 'Briefcase', text: 'Build a portfolio of projects' },
      { icon: 'Cpu', text: 'Understand how the web works' },
      { icon: 'Rocket', text: 'Prepare for advanced web development' },
    ],
    modules: [
      { title: 'HTML Foundations', description: 'Structure, elements, forms, and semantics.', hours: 10 },
      { title: 'CSS Styling', description: 'Selectors, layout, flexbox, grid, and responsive design.', hours: 14 },
      { title: 'JavaScript Basics', description: 'Variables, functions, DOM manipulation, and events.', hours: 14 },
      { title: 'Responsive Projects', description: 'Build responsive websites from scratch.', hours: 10 },
      { title: 'Assessment & Portfolio', description: 'Final project and portfolio assessment.', hours: 8 },
    ],
    entryRequirements: [
      'Basic computer literacy',
      'Familiarity with using a web browser',
      'Access to a computer with internet',
      'Commitment to weekly coding practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly coding tasks' },
      { icon: 'Code', label: 'Projects', description: 'Build real websites' },
      { icon: 'ClipboardCheck', label: 'Practical Work', description: 'Hands-on development' },
      { icon: 'Award', label: 'Final Assessment', description: 'Build and present a final project' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Junior Web Developer', 'Frontend Developer', 'Freelance Web Developer', 'Web Designer', 'WordPress Developer', 'Tech Entrepreneur'],
    relatedCourses: ['COD101', 'ICT101', 'AI101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  COD101: {
    overview: {
      description:
        'Coding Fundamentals introduces programming and computational thinking. Through hands-on projects, learn concepts that apply across languages, including variables, loops, functions and data structures.',
      targetAudience:
        'Beginners interested in technology and programming, students considering a career in tech, and professionals who want to understand coding fundamentals.',
      objectives: [
        'Understand core programming concepts',
        'Write simple programs using variables, loops, and conditionals',
        'Build basic functions and work with data',
        'Develop problem-solving and computational thinking',
      ],
      outcomes: [
        'Write and run simple programs independently',
        'Understand how software is built',
        'Approach problems with a programmer\u2019s mindset',
        'Progress to web development or specialised coding courses',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'Code', text: 'Write and run simple programs' },
      { icon: 'Brain', text: 'Think computationally and solve problems' },
      { icon: 'Lightbulb', text: 'Build basic projects from scratch' },
      { icon: 'Briefcase', text: 'Apply coding in professional contexts' },
      { icon: 'Cpu', text: 'Understand how software works' },
      { icon: 'Rocket', text: 'Prepare for advanced tech courses' },
    ],
    modules: [
      { title: 'Introduction to Programming', description: 'What is code? How computers think. Setting up your environment.', hours: 6 },
      { title: 'Core Concepts', description: 'Variables, data types, operators, and input/output.', hours: 10 },
      { title: 'Control Flow', description: 'Conditionals, loops, and logic for decision-making in code.', hours: 12 },
      { title: 'Functions & Data', description: 'Reusable functions, arrays, and basic data structures.', hours: 12 },
      { title: 'Projects & Assessment', description: 'Build a mini-project and complete a practical assessment.', hours: 8 },
    ],
    entryRequirements: [
      'Basic computer literacy (ICT101 or equivalent)',
      'Logical thinking and problem-solving interest',
      'Access to a computer with internet',
      'Commitment to weekly coding practice',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly coding exercises' },
      { icon: 'Code', label: 'Projects', description: 'Hands-on coding mini-projects' },
      { icon: 'ClipboardCheck', label: 'Practical Work', description: 'Real-world programming tasks' },
      { icon: 'Award', label: 'Final Assessment', description: 'Build and present a final project' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Junior Developer', 'Web Developer', 'Data Analyst', 'QA Tester', 'Tech Entrepreneur', 'IT Support Specialist'],
    relatedCourses: ['WEB101', 'ICT101', 'AI101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  AI101: {
    overview: {
      description:
        'AI Productivity Tools is a cutting-edge course that teaches you to leverage artificial intelligence tools for productivity, creativity, and professional work. You will learn to use AI assistants, automate tasks, and integrate AI into your workflow.',
      targetAudience:
        'Professionals who want to use AI tools, entrepreneurs, creatives, and anyone curious about practical AI applications.',
      objectives: [
        'Master popular AI productivity tools',
        'Learn to write effective AI prompts',
        'Automate repetitive tasks with AI',
        'Integrate AI into your professional workflow',
      ],
      outcomes: [
        'Use AI tools to boost productivity',
        'Write effective prompts for AI assistants',
        'Automate tasks and save time',
        'Integrate AI into your work confidently',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'Cpu', text: 'Master popular AI productivity tools' },
      { icon: 'Lightbulb', text: 'Write effective AI prompts' },
      { icon: 'Rocket', text: 'Automate tasks with AI' },
      { icon: 'Briefcase', text: 'Integrate AI into your workflow' },
      { icon: 'Brain', text: 'Think critically about AI capabilities' },
      { icon: 'Target', text: 'Boost productivity by 10x' },
    ],
    modules: [
      { title: 'AI Landscape', description: 'Overview of AI tools, capabilities, and limitations.', hours: 4 },
      { title: 'Prompt Engineering', description: 'Writing effective prompts for AI assistants.', hours: 8 },
      { title: 'AI for Productivity', description: 'Automating tasks, writing, and research with AI.', hours: 8 },
      { title: 'AI for Creativity', description: 'Image generation, content creation, and design with AI.', hours: 6 },
      { title: 'Assessment & Portfolio', description: 'AI-powered project and portfolio assessment.', hours: 6 },
    ],
    entryRequirements: [
      'Basic computer literacy',
      'Familiarity with web tools',
      'Access to a computer with internet',
      'Curiosity about AI',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practical AI tasks' },
      { icon: 'ClipboardCheck', label: 'Practical Work', description: 'Real-world AI applications' },
      { icon: 'Cpu', label: 'Projects', description: 'AI-powered mini-projects' },
      { icon: 'Award', label: 'Final Assessment', description: 'Build and present an AI project' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['AI-Enhanced Professional', 'Content Creator', 'Digital Entrepreneur', 'Productivity Consultant', 'Research Assistant', 'Creative Professional'],
    relatedCourses: ['COD101', 'WEB101', 'ICT101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },

  CYB101: {
    overview: {
      description:
        'Cyber Safety Basics is a practical course that teaches you to protect yourself and your organisation online. From password security to phishing detection, data privacy, and safe browsing, you will build essential cybersecurity awareness.',
      targetAudience:
        'Everyone who uses the internet, parents, professionals, and anyone who wants to stay safe online.',
      objectives: [
        'Master password security',
        'Detect and avoid phishing and scams',
        'Protect your personal data and privacy',
        'Browse the internet safely',
      ],
      outcomes: [
        'Create and manage strong passwords',
        'Identify and avoid online threats',
        'Protect your digital identity',
        'Practice safe browsing habits',
      ],
    },
    languageOfInstruction: 'English',
    learningOutcomes: [
      { icon: 'ShieldCheck', text: 'Create and manage strong passwords' },
      { icon: 'Brain', text: 'Identify phishing and online scams' },
      { icon: 'Lock', text: 'Protect your personal data' },
      { icon: 'Globe', text: 'Browse the internet safely' },
      { icon: 'Briefcase', text: 'Apply cyber safety at work' },
      { icon: 'Lightbulb', text: 'Protect your digital identity' },
    ],
    modules: [
      { title: 'Password Security', description: 'Strong passwords, password managers, and two-factor authentication.', hours: 4 },
      { title: 'Phishing & Scams', description: 'Identifying phishing, scams, and social engineering.', hours: 4 },
      { title: 'Data Privacy', description: 'Protecting personal data, privacy settings, and data rights.', hours: 4 },
      { title: 'Safe Browsing', description: 'Safe browsing, malware, and secure connections.', hours: 4 },
      { title: 'Assessment & Certification', description: 'Practical assessment and certification.', hours: 4 },
    ],
    entryRequirements: [
      'Basic computer literacy',
      'Basic English literacy',
      'Access to a computer with internet',
      'Commitment to learning',
    ],
    assessment: [
      { icon: 'FileText', label: 'Assignments', description: 'Weekly practical tasks' },
      { icon: 'ShieldCheck', label: 'Practical Work', description: 'Real-world security exercises' },
      { icon: 'Brain', label: 'Quizzes', description: 'Scenario-based assessments' },
      { icon: 'Award', label: 'Final Assessment', description: 'Practical assessment' },
    ],
    certification: { items: DEFAULT_CERT_ITEMS },
    careers: ['Security-Aware Professional', 'IT Support', 'Office Worker', 'Parent', 'Community Leader', 'Safe Internet User'],
    relatedCourses: ['ICT101', 'ICT301', 'COD101', 'ENG101'],
    faqs: SHARED_FAQS,
    reviews: [],
  },
};

/* ──────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────── */

/**
 * Get full course detail data for a course code.
 * Returns null if no rich detail data exists.
 */
export function getCourseDetail(code) {
  return COURSE_DETAILS[code] || null;
}

/**
 * Build a complete course data object for the template, merging
 * base course data with rich detail data (if available).
 */
/**
 * Generate a course-specific curriculum development draft for catalogue courses
 * that do not yet have an authored curriculum. These drafts are review-ready
 * starting points, not academically approved syllabi. A course owner must
 * validate scope, prerequisites, learning hours, resources, assessment and safety.
 */
function inferCurriculumDomain(base) {
  const text = `${base.name || ''} ${base.category || ''} ${base.shortDescription || ''} ${base.fullDescription || ''}`.toLowerCase();
  const rules = [
    { key: 'electrical-engineering', test: /electrical|electronics|power systems|wiring|circuit|plc|automation|renewable energy|solar|embedded|instrumentation|engineering lab|mechatronic|robotics|control systems/, modules: [
      ['Principles, terminology and system context', 'Define the key electrical/electronic quantities, components, system boundaries and use cases relevant to this course. Confirm the required mathematics and prior technical knowledge.'],
      ['System analysis and design method', 'Interpret diagrams, specifications and constraints; select a suitable analysis or design method and explain the assumptions behind it.'],
      ['Tools, measurements and safe practice', 'Identify suitable instruments, software, components and protective measures. Practical work involving electricity or machinery requires approved risk assessment, supervision and equipment.'],
      ['Applied design, build or fault-finding task', 'Work through a scoped case or supervised practical: calculate or configure, document the process, test against stated criteria and diagnose deviations.'],
      ['Verification, technical reporting and improvement', 'Present calculations, diagrams, measurements and test evidence; compare results with specifications and recommend safe, evidence-based improvements.']
    ], practical: 'A reviewed design, calculation set, simulation, test record or supervised practical task appropriate to the course scope.' },
    { key: 'programming-software', test: /programming|coding|software|web development|web design|javascript|python|java\b|react|frontend|backend|api|git|github|devops|cloud|cyber|network|database|linux|ict|computer|information technology|mobile app/, modules: [
      ['Environment, workflow and core concepts', 'Set up or inspect the required development environment; explain the core concepts, terminology and workflow used in this subject.'],
      ['Core syntax, architecture or configuration', 'Build understanding of the central language features, system components, configuration patterns or architecture used in the course.'],
      ['Guided implementation and debugging', 'Complete progressively harder exercises; reproduce errors, inspect outputs, debug systematically and document the decisions made.'],
      ['Integrated practical project', 'Build or configure a small, scoped solution with clear requirements, versioned work, tests and a short user or technical guide.'],
      ['Testing, security and deployment/readiness', 'Test against requirements, consider accessibility and security where relevant, document limitations and prepare a maintainable handover.']
    ], practical: 'A runnable code artefact, configured environment, repository, technical lab record or tested prototype.' },
    { key: 'data-ai', test: /data|analytics|artificial intelligence|\bai\b|machine learning|deep learning|power bi|excel|statistics|visuali[sz]ation|business intelligence|prompt|automation/, modules: [
      ['Problem framing, data and responsible use', 'Define the decision or task, identify the data or inputs needed, assess quality and limitations, and establish privacy, bias and responsible-use considerations.'],
      ['Methods, tools and analytical workflow', 'Learn the principal methods and tools used in this subject and explain when each method is appropriate.'],
      ['Hands-on analysis or model workflow', 'Prepare inputs, perform a guided analysis or build a small workflow, check intermediate results and keep the process reproducible.'],
      ['Interpretation and decision-focused deliverable', 'Turn outputs into a report, dashboard, model evaluation or workflow that answers the original question without overstating certainty.'],
      ['Validation, communication and governance', 'Check accuracy and limitations, communicate findings for the intended audience, and document data provenance, assumptions and responsible-use safeguards.']
    ], practical: 'A reproducible analysis, dashboard, model/workflow evaluation or decision brief using an approved dataset or test case.' },
    { key: 'business-entrepreneurship', test: /business|entrepreneur|startup|ecommerce|e-commerce|marketing|sales|customer service|project management|operations|leadership|management|human resource|procurement|supply chain|strategy|business plan/, modules: [
      ['Customer, organisation and problem context', 'Identify the target customer or stakeholder, the problem to solve, relevant operating context and success criteria.'],
      ['Business models, processes and tools', 'Map the relevant business process, compare appropriate methods and select tools suited to the organisation’s scale and constraints.'],
      ['Planning, execution and measurement', 'Create a practical plan with tasks, responsibilities, resources, timeline and measurable indicators; use a realistic scenario to practise implementation.'],
      ['Applied business case or operating artefact', 'Develop a scoped business plan, campaign, process map, service script, project plan or operational improvement proposal.'],
      ['Performance review, ethics and next steps', 'Evaluate the proposal against evidence and metrics; address customer protection, ethics, inclusion, risk and continuous improvement.']
    ], practical: 'A business case, campaign plan, process map, project plan or other course-specific workplace artefact.' },
    { key: 'finance-accounting', test: /finance|financial|accounting|bookkeeping|tax|payroll|budget|investment|banking|credit|insurance|audit|risk management/, modules: [
      ['Financial context, terminology and records', 'Define the financial concepts, source documents, reporting period and assumptions relevant to the course.'],
      ['Methods, calculations and controls', 'Practise the core calculations or procedures, explain the rationale and apply appropriate checks and reconciliations.'],
      ['Tools, records and worked cases', 'Use a spreadsheet, ledger, template or approved tool to process a realistic but non-sensitive case and retain an audit trail.'],
      ['Interpretation and recommendations', 'Interpret the results, identify discrepancies or risks and communicate implications for the relevant decision-maker.'],
      ['Compliance, ethics and quality review', 'Check applicable rules with current authoritative sources, protect confidential information and verify the work against an approved checklist.']
    ], practical: 'A worked case, reconciled records, budget, financial analysis or control checklist using fictional or authorised data.' },
    { key: 'creative-design-media', test: /design|graphic|video|photo|photography|animation|illustration|creative|media|content creation|branding|ui\/ux|user experience|editing|multimedia|visual/, modules: [
      ['Audience, brief and creative direction', 'Translate a brief into audience needs, message, constraints, references and measurable acceptance criteria.'],
      ['Principles, tools and production workflow', 'Apply the design or media principles and tools relevant to the subject; select formats and workflows that fit the brief.'],
      ['Technique practice and iteration', 'Produce small exercises, test alternatives and use critique to improve clarity, consistency and technical quality.'],
      ['Portfolio-ready production project', 'Create a coherent deliverable or set of assets against an agreed brief, with source files and a rationale for key decisions.'],
      ['Quality assurance, rights and presentation', 'Check technical specifications, accessibility, licensing, consent and brand consistency; present the work and reflect on revisions.']
    ], practical: 'A portfolio artefact or production package with source files, rationale and a quality/rights checklist.' },
    { key: 'language-communication', test: /english|language|speaking|pronunciation|grammar|writing|communication|public speaking|presentation|ielts|toefl|arabic|swahili|somali|french|german|spanish|translation|interpretation|literacy|reading|listening/, modules: [
      ['Diagnostic needs and communication foundations', 'Identify the learner’s current level and goals; establish the language or communication features needed for the target situations.'],
      ['Input, vocabulary and language structures', 'Build comprehension and accurate use of the relevant vocabulary, grammar, discourse patterns or communication conventions.'],
      ['Guided practice and feedback', 'Practise listening, reading, speaking, writing or presentation tasks using clear models and structured feedback.'],
      ['Authentic task and performance', 'Complete a realistic communication task for the intended audience and context, then revise using feedback.'],
      ['Performance review and independent practice', 'Use a transparent rubric to reflect on accuracy, clarity, fluency or audience impact and set an independent practice plan.']
    ], practical: 'A recorded or live performance, writing portfolio, presentation, language task or other observable communication sample.' },
    { key: 'education-training', test: /teaching|trainer|training|education|instruction|pedagog|curriculum|facilitation|tutor|learning design|assessment design/, modules: [
      ['Learner needs, context and outcomes', 'Analyse the learner group, entry level, learning context and intended outcomes; note inclusion and accessibility requirements.'],
      ['Instructional design and learning strategies', 'Align content, learning activities and assessment; select methods appropriate to the outcomes and delivery setting.'],
      ['Learning resources and facilitation practice', 'Develop or adapt a lesson resource, learning activity or assessment instrument and practise facilitating it.'],
      ['Micro-teaching or learning intervention', 'Deliver a short lesson or learning intervention, gather structured feedback and reflect on learner evidence.'],
      ['Assessment, inclusion and improvement', 'Use transparent criteria, provide constructive feedback, maintain learner privacy and plan improvements based on evidence.']
    ], practical: 'A lesson plan, learning resource, assessment tool and/or observed micro-teaching portfolio.' },
    { key: 'career-workplace', test: /career|job search|cv|resume|interview|freelanc|remote work|workplace|professional development|employability|portfolio|personal brand|time management|productivity|soft skill|resilience|adaptability|critical thinking/, modules: [
      ['Self-assessment and target setting', 'Identify current strengths, gaps and goals; translate a broad ambition into measurable next steps.'],
      ['Core methods and professional tools', 'Practise the frameworks, communication patterns and tools used for the target workplace or career task.'],
      ['Guided simulations and feedback', 'Complete realistic scenarios such as role-plays, work samples, planning exercises or peer review using clear criteria.'],
      ['Personal action plan and evidence artefact', 'Create a role-specific CV, portfolio item, project plan, service offer or professional development plan.'],
      ['Reflection, ethics and progression', 'Review evidence of progress, identify gaps, address professionalism and responsible conduct, and define the next learning or job-search steps.']
    ], practical: 'A tailored portfolio item, career plan, work sample, interview performance or professional action plan.' },
    { key: 'research-academic', test: /research|academic|study skills|scholarship|essay|critical reading|methodology|thesis|citation|report writing/, modules: [
      ['Question framing and academic conventions', 'Define the question or task, scope and intended audience; identify the relevant academic conventions and integrity requirements.'],
      ['Source discovery and evidence evaluation', 'Find suitable sources, assess credibility and relevance, and distinguish evidence from opinion or unsupported claims.'],
      ['Analysis, argument and method', 'Organise evidence, select an appropriate method and build a coherent line of reasoning with transparent limitations.'],
      ['Drafting and applied research task', 'Produce a structured essay, report, proposal or research artefact using a documented process and appropriate referencing.'],
      ['Review, integrity and communication', 'Revise against a rubric, check citations and originality, communicate limitations and prepare a clear final submission.']
    ], practical: 'A referenced essay, research proposal, analytical report or other evidence-based academic artefact.' },
    { key: 'general', test: /./, modules: [
      ['Purpose, context and baseline concepts', 'Define the course problem space, key terms, intended audience and baseline knowledge required for meaningful progress.'],
      ['Core methods and decision points', 'Break the subject into its principal concepts or methods; compare options and explain when each is appropriate.'],
      ['Guided practice with worked examples', 'Complete scaffolded exercises and analyse examples, errors and decision points relevant to the course.'],
      ['Applied project or case response', 'Produce a practical artefact or case response that integrates the course concepts against explicit requirements.'],
      ['Evaluation, communication and progression', 'Check the work against an approved rubric, explain decisions and limitations, and identify a next-step learning pathway.']
    ], practical: 'A subject-specific work sample, case response, project or performance task defined by the course owner.' }
  ];
  return rules.find((rule) => rule.test.test(text)) || rules[rules.length - 1];
}

function buildDraftCurriculum(base) {
  const subject = base.name;
  const context = base.shortDescription || base.fullDescription || `the ${subject} learning area`;
  const domain = inferCurriculumDomain(base);
  const level = base.level || 'Level to be confirmed';
  const duration = base.duration || 'Duration to be confirmed';
  const isLabs = (base.division || base.pillar) === 'labs' || domain.key === 'electrical-engineering';
  const objectives = [
    `Explain the principal concepts, terminology and professional context of ${subject}.`,
    `Apply appropriate ${domain.key.replace(/-/g, ' ')} methods to a guided task related to ${subject}.`,
    `Produce and evaluate a practical work sample using explicit requirements, evidence and feedback.`,
    `Identify relevant ethical, safety, accessibility or quality considerations for ${subject}.`,
  ];
  const outcomes = [
    `Describe key concepts and explain how they relate to ${subject} practice.`,
    `Select and use an appropriate method, tool or framework for a defined task.`,
    `Complete a course-relevant practical task and document the process and result.`,
    `Evaluate work against agreed criteria, identify limitations and recommend improvements.`,
  ];
  const learningOutcomes = [
    { icon: 'BookOpen', text: outcomes[0] },
    { icon: 'Target', text: outcomes[1] },
    { icon: isLabs ? 'Wrench' : 'FolderCheck', text: outcomes[2] },
    { icon: 'ClipboardCheck', text: outcomes[3] },
    { icon: 'ShieldCheck', text: `Recognise relevant quality, safety, ethics or responsible-use requirements for ${subject}.` },
  ];
  const moduleActivities = [
    ['diagnostic questions', 'worked examples', 'key-term map'],
    ['guided demonstration', 'comparison exercise', 'decision log'],
    ['scaffolded lab or practice', 'error analysis', 'peer feedback'],
    ['project brief', 'prototype or draft artefact', 'progress checkpoint'],
    ['quality checklist', 'short presentation', 'reflective improvement plan'],
  ];
  const modules = domain.modules.map(([title, description], index) => ({
    title: `${subject}: ${title}`,
    description: `${description} Application focus: ${context}`,
    hours: [4, 6, 6, 6, 4][index],
    learningOutcomes: [outcomes[Math.min(index, outcomes.length - 1)]],
    learningActivities: moduleActivities[index],
    evidenceOfLearning: index === 3 ? domain.practical : `A completed ${subject.toLowerCase()} task, annotated working or short explanation appropriate to this module.`,
    status: 'draft',
  }));
  const assessment = [
    { icon: 'BookOpen', label: 'Knowledge checks — 10%', weighting: 10, description: `Low-stakes checks on ${subject} concepts, terminology and decision-making; item bank requires course-owner validation.` },
    { icon: 'ClipboardCheck', label: 'Guided practical tasks — 20%', weighting: 20, description: 'Two or more scaffolded tasks assessed for process, accuracy, safe/ethical practice and response to feedback.' },
    { icon: isLabs ? 'Wrench' : 'FolderCheck', label: 'Applied project / performance — 40%', weighting: 40, description: `${domain.practical} Requires an approved brief, feasible resources, explicit success criteria and a marking rubric.` },
    { icon: 'BadgeCheck', label: 'Final assessment and reflection — 30%', weighting: 30, description: 'A course-aligned demonstration plus short rationale/reflection; pass threshold, moderation and reassessment must be authorised before delivery.' },
  ];
  return {
    objectives, outcomes, learningOutcomes, modules, assessment,
    curriculumDevelopment: {
      status: 'draft_for_academic_review',
      domain: domain.key,
      intendedLevel: level,
      catalogueDuration: duration,
      indicativeLearningHours: 26,
      hourAllocationStatus: 'provisional',
      contextSummary: context,
      capstone: domain.practical,
      assessmentBlueprint: {
        proposedWeightingTotal: 100,
        weightingStatus: 'proposed_not_authorised',
        passMark: null,
        reassessmentPolicy: 'Must be defined and approved by the course owner before enrolment opens.',
        moderation: 'Independent moderation and reasonable-adjustment arrangements must be documented before delivery.',
      },
      draftRubric: [
        { criterion: 'Subject knowledge and accuracy', suggestedWeight: 25, descriptor: 'Correct use of key concepts, terminology and methods.' },
        { criterion: 'Application and problem-solving', suggestedWeight: 30, descriptor: 'Appropriate selection and application of methods to the stated task.' },
        { criterion: 'Quality of evidence or artefact', suggestedWeight: 25, descriptor: 'Work is complete, usable, documented and aligned with the brief.' },
        { criterion: 'Communication, ethics and reflection', suggestedWeight: 20, descriptor: 'Clear explanation of decisions, limitations, responsible practice and improvement.' },
      ],
      teachingAndLearning: {
        approach: 'Outcome-aligned teaching combining concise instruction, worked examples, guided practice, feedback and an applied task.',
        inclusion: 'Provide accessible materials, clear instructions, reasonable adjustments and alternatives where a learning activity is not safely or practically accessible.',
        feedbackCycle: 'Provide formative feedback before the summative task and give learners an opportunity to act on that feedback.',
      },
      resourcesToConfirm: [
        'Approved learning materials and current references appropriate to this course.',
        'Instructor expertise and learner-to-instructor ratio.',
        'Required software, equipment, datasets or practice environment and their availability.',
        'Accessibility, connectivity, safeguarding and data-protection arrangements.',
      ],
      requiredReview: [
        'Confirm learner profile, entry requirements and prerequisite knowledge.',
        'Validate subject-specific scope, sequence, depth and current terminology.',
        'Approve module outcomes, teaching activities and total learning hours against the advertised duration.',
        'Confirm instructor qualifications, delivery mode, tools, resources and accessibility arrangements.',
        'For practical or technical work, approve risk assessment, supervision, equipment and safe operating procedures.',
        'Approve assessment briefs, marking rubrics, weighting, pass threshold, moderation and reassessment.',
        'Verify fees, credential wording, intellectual-property permissions and any external standards or accreditation claims.',
        'Record reviewer identity, decision, version and review date in the authoritative course-governance system.',
      ],
      disclaimer: 'AI-assisted curriculum development content authorised by the project owner for catalogue publication and self-paced study. It is not a claim of external accreditation or independent subject-expert validation. Live or regulated delivery may require additional review.',
    },
  };
}
export function buildCourseData(code) {
  const base = getProgrammeByCode(code);
  if (!base) return null;

  const detail = getCourseDetail(code);
  const generated = GENERATED_CURRICULA[base.code];
  const pathway = getPathwayById(base.pathwayId);
  const governance = getCourseGovernance(base);
  const draft = buildDraftCurriculum(base);

  return {
    // Base course data
    code: base.code,
    name: base.name,
    academy: base.academy,
    pathway: pathway?.title || base.category,
    pathwayId: base.pathwayId,
    category: base.category,
    shortDescription: base.shortDescription,
    description: base.fullDescription,
    duration: base.duration,
    studyMode: base.studyMode,
    listedStudyMode: base.listedStudyMode || base.studyMode,
    level: base.level,
    language: base.language,
    fees: base.fees,
    feesUSD: base.feesUSD,
    isFree: base.isFree === true,
    certificatePriceUSD: base.certificatePriceUSD,
    division: base.division || base.pillar,
    certification: base.certification,
    entryRequirements: base.entryRequirements,
    instructor: base.instructor,
    brochureUrl: base.brochureUrl,
    calendarUrl: base.calendarUrl,
    featuredImage: base.featuredImage,
    featured: base.featured,
    ...governance,
    status: getCurriculumStatus(base).hasStructuredContent
      ? 'Owner-authorised · self-paced enrolment open'
      : 'Curriculum content required before publication',
    hasStructuredCurriculum: getCurriculumStatus(base).hasStructuredContent,
    // The project owner has authorised the structured catalogue content for publication. This is not external accreditation or proof of specialist review.
    ownerAuthorizedForPublication: getCurriculumStatus(base).hasStructuredContent,
    // Catalogue courses with published structured content are available as self-paced study. Fixed-date cohorts and instructor-led sessions are separate offerings.
    enrollmentOpen: getCurriculumStatus(base).hasStructuredContent,
    offering: getCurriculumStatus(base).hasStructuredContent ? {
      status: 'open',
      mode: 'self-paced',
      deliveryMode: 'Self-paced online',
      schedule: 'Flexible, learner-paced study',
      instructorDisplay: 'InnoSpeak Global learning team',
      note: 'Self-paced catalogue enrolment is open. Any live cohort, instructor-led session or fixed timetable will be announced separately.',
    } : null,
    ownerAuthorization: getCurriculumStatus(base).hasStructuredContent ? {
      scope: 'catalogue-publication',
      authorizedBy: 'Project owner',
      authorizedOn: '2026-10-19',
      status: 'owner-authorized',
      deliveryReadiness: 'self-paced-enrolment-open',
      note: 'Owner authorisation enables self-paced online enrolment in the published catalogue. It does not claim external accreditation or independent specialist validation; live cohorts and instructor-led sessions are separate offerings.',
    } : null,
    // Kept distinct from owner authorization: this field represents a formal academic-review record only.
    curriculumApproved: base.curriculumApproved === true,

    // Rich detail (or honest empty fallbacks)
    overview: detail?.overview || {
      description: generated?.courseDescription || base.fullDescription,
      targetAudience: generated?.targetAudience || 'Learners interested in this programme who meet the entry requirements.',
      objectives: draft.objectives,
      outcomes: generated?.learningOutcomes || draft.outcomes,
    },
    languageOfInstruction: detail?.languageOfInstruction || base.language,
    learningOutcomes: detail?.learningOutcomes || (generated?.learningOutcomes || draft.learningOutcomes).map((item) => typeof item === 'string' ? { icon: 'BookOpen', text: item } : item),
    modules: (generated?.courseStructure || detail?.modules || draft.modules).map((module) => ({ ...module, description: module.description || module.purpose })),
    curriculumDevelopment: {
      ...draft.curriculumDevelopment,
      status: getCurriculumStatus(base).hasStructuredContent
        ? 'owner_authorized_for_catalogue_publication'
        : 'curriculum_content_required_before_publication',
      contextSummary: base.shortDescription || base.fullDescription || base.name,
      disclaimer: getCurriculumStatus(base).hasStructuredContent
        ? 'The project owner has authorised this structured content for catalogue publication and self-paced online enrolment. This does not claim external accreditation or independent subject-expert validation. Live cohorts, instructor-led sessions and regulated delivery arrangements are separate offerings and must be confirmed before they are advertised.'
        : 'Curriculum content has not yet been authorised for catalogue publication. Complete and authorise the course content before publication; confirm delivery arrangements and applicable safety or regulatory checks before opening enrolment.',
    },
    entryRequirements: detail?.entryRequirements || generated?.prerequisites || base.entryRequirements,
    assessment: (generated?.assessmentPlan || detail?.assessment || draft.assessment).map((item, index) => ({
      icon: ['BookOpen', 'ClipboardCheck', 'FolderCheck', 'BadgeCheck'][index] || 'ClipboardCheck',
      label: item.name ? `${item.name} — ${item.weighting}%` : item.label,
      description: item.brief || item.description,
      weighting: item.weighting,
    })),
    capstone: generated?.capstone || null,
    contentAuthorization: generated?.contentAuthorization || null,
    certificationItems: detail?.certification?.items || DEFAULT_CERT_ITEMS,
    careers: getCareerDirections(base, detail),
    relatedCourses: detail?.relatedCourses || [],
    faqs: detail?.faqs || SHARED_FAQS,
    reviews: detail?.reviews || [],
  };
}