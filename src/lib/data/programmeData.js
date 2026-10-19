import { OWNER_AUTHORIZED_COURSE_CODES } from './coursePublicationCodes.js';
/**
 * programmeData — central catalogue of all InnoSpeak Global programmes.
 * Shared by the Academy page, Programme Catalogue, Course Details Template,
 * Admissions system, and Labs pages.
 *
 * V3 (Sep 2026): PATHWAYS now re-exported from registry.js. COURSES is
 * the merged + migrated base catalogue with new Academy/Labs courses and
 * archived courses filtered out.
 */

import { NEW_LABS_COURSES } from './labsCourses.js';
import { migrateCourses, filterArchived } from './courseMigration.js';
import { NEW_ACADEMY_COURSES, NEW_LABS_TRACK_COURSES } from './newCourses.js';
import { EXPANSION_ACADEMY_COURSES } from './expansionCourses.js';

export const ACADEMY = 'InnoSpeak Academy';
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const STUDY_MODES = ['Online', 'Hybrid', 'Physical / Hybrid', 'Physical'];
export const DURATIONS = ['2 Weeks', '3 Weeks', '4 Weeks', '6 Weeks', '8 Weeks', '10 Weeks', '12 Weeks', '16 Weeks'];

// ── PATHWAYS now comes from the V3 registry ──────────────────
import { PATHWAYS, TRACKS } from './registry.js';
export { PATHWAYS, TRACKS };

// ── BASE COURSES (migrated at export time) ───────────────────
const _BASE_COURSES = [
  {
    code: "ENG101", name: "English Speaking Fundamentals", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Build confident, fluent spoken English for everyday and professional contexts.",
    fullDescription: "English Speaking Fundamentals is a practical, beginner-friendly course designed to build confident, fluent spoken English for everyday and professional contexts. Through guided conversation, pronunciation drills, and real-world scenarios, you will develop the communication skills needed to express yourself clearly and naturally.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 12,500", certification: "Certificate of Completion",
    entryRequirements: [
    "Minimum age of 16 years",
    "Basic literacy in any language",
    "Internet access for online learners",
    "Commitment to attend and participate"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-02-01",
  },
  {
    code: "ENG102", name: "Advanced English Communication", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Refine grammar, fluency and professional English for academic, workplace and international communication.",
    fullDescription: "Advanced English Communication builds on foundational English skills to develop the accuracy, fluency and confidence needed for academic study, professional workplaces and international communication.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Certificate of Completion",
    entryRequirements: [
    "Completion of ENG101 or equivalent",
    "Intermediate English proficiency",
    "Internet access for online learners",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-02-02",
  },
  {
    code: "ENG103", name: "Academic English", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Master the English skills needed for university study and academic writing.",
    fullDescription: "Academic English develops the reading, writing, listening and speaking skills needed for university-level academic study, covering essay structure, critical analysis, academic vocabulary and citation conventions.",
    duration: "10 Weeks", studyMode: "Online", level: "Advanced", language: "English",
    fees: "KES 16,000", certification: "Academic English Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Academic study goals",
    "Internet access for online learners",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-02-03",
  },
  {
    code: "ENG104", name: "Business English", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Communicate professionally in business settings with confidence.",
    fullDescription: "Business English develops the vocabulary, tone and communication skills needed for professional business settings, covering emails, reports, meetings, negotiations and presentations.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Business English Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Professional or business context",
    "Internet access for online learners",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-02-04",
  },
  {
    code: "ENG105", name: "Professional Communication", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Master workplace communication from email to presentations.",
    fullDescription: "Professional Communication equips you with the skills to communicate effectively in the modern workplace. From email etiquette to meeting facilitation, you will learn to navigate professional interactions with confidence and polish.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Professional Communication Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Some workplace experience recommended",
    "Internet access for online learners",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-02-05",
  },
  {
    code: "ENG106", name: "Public Speaking", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Speak confidently and persuasively in front of any audience.",
    fullDescription: "Public Speaking is a transformative course that helps you master the art of persuasive, structured public speaking and presentation. Whether you are addressing a small team or a large audience, you will learn to speak with clarity, confidence, and impact.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Public Speaking Certificate",
    entryRequirements: [
    "Basic English speaking ability",
    "Willingness to practise in front of others",
    "Internet access for online learners",
    "Commitment to weekly presentations"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-02-06",
  },
  {
    code: "ENG107", name: "Presentation Skills", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Design and deliver compelling presentations that captivate any audience.",
    fullDescription: "Presentation Skills covers presentation design, visual aids, delivery techniques, audience engagement and handling Q&A sessions for creating impactful professional and academic presentations.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 12,000", certification: "Presentation Skills Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Willingness to practise",
    "Internet access for online learners",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-02-07",
  },
  {
    code: "ENG108", name: "Technical Writing", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Write clear, precise technical documents and guides.",
    fullDescription: "Technical Writing teaches the principles of clear, precise technical documentation, covering user manuals, API docs, process documentation and technical reports for professional and technical contexts.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Technical Writing Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Technical background helpful",
    "Internet access for online learners",
    "Commitment to weekly writing"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-02-08",
  },
  {
    code: "ENG109", name: "Creative Writing", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Unleash your creativity and craft compelling stories, poems and narratives.",
    fullDescription: "Creative Writing develops the craft of creative writing, covering fiction, poetry, narrative structure, character development and the creative process for aspiring writers and storytellers.",
    duration: "8 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Creative Writing Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in creative expression",
    "Internet access for online learners",
    "Commitment to weekly writing"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-02-09",
  },
  {
    code: "ENG110", name: "Copywriting & Content Writing", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Write persuasive copy and engaging content for digital platforms.",
    fullDescription: "Copywriting & Content Writing covers persuasive writing techniques, SEO content, social media copy, email marketing and brand voice for creating compelling digital content that converts.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Copywriting Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Interest in writing",
    "Internet access for online learners",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-02-10",
  },
  {
    code: "ENG111", name: "English Grammar Masterclass", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Master English grammar from fundamentals to advanced structures.",
    fullDescription: "English Grammar Masterclass provides a comprehensive study of English grammar, covering parts of speech, sentence structure, tenses, conditionals and advanced grammatical constructions for accurate, confident English.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 10,000", certification: "Grammar Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Desire to improve accuracy",
    "Internet access for online learners",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-02-11",
  },
  {
    code: "ENG112", name: "Pronunciation & Accent Training", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Refine your pronunciation and speak English with clarity and confidence.",
    fullDescription: "Pronunciation & Accent Training develops clear, natural English pronunciation through phonetic practice, intonation exercises and targeted accent modification for confident spoken English.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Pronunciation Certificate",
    entryRequirements: [
    "Basic English speaking ability",
    "Desire to improve pronunciation",
    "Internet access for online learners",
    "Commitment to daily practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-02-12",
  },
  {
    code: "ENG113", name: "Cross-cultural Communication", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Communicate effectively across cultures in global, diverse workplaces.",
    fullDescription: "Cross-cultural Communication develops the awareness and skills needed to communicate effectively with people from different cultural backgrounds. Learners explore cultural dimensions, communication styles, etiquette and strategies for bridging cultural gaps in professional and social settings.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 12,000", certification: "Cross-cultural Communication Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Interest in intercultural communication",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-01",
  },
  {
    code: "ENG114", name: "English for Healthcare", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Master the English used in healthcare settings for patient care and professional practice.",
    fullDescription: "English for Healthcare equips healthcare professionals and students with the English vocabulary, communication patterns and documentation skills needed in clinical settings, patient interactions, medical correspondence and interprofessional handovers.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "English for Healthcare Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Background or interest in healthcare",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-02",
  },
  {
    code: "ENG115", name: "English for Engineers", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Develop the technical English skills needed for engineering study and professional practice.",
    fullDescription: "English for Engineers builds the technical reading, writing and communication skills engineers need for documentation, project reports, specifications, team collaboration and international engineering environments.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "English for Engineers Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Background or interest in engineering",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-03",
  },
  {
    code: "ENG116", name: "English for Hospitality", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Build the English skills used in hotels, restaurants and tourism service settings.",
    fullDescription: "English for Hospitality develops the speaking, listening and writing skills needed for front desk, food service, guest relations and tourism operations, with practical scenarios drawn from real hospitality settings.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "English for Hospitality Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Interest in hospitality or tourism",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-04",
  },
  {
    code: "ENG117", name: "English for Customer Service", academy: ACADEMY,
    pathwayId: "global-language", category: "Global Languages & Communication", pillar: "academy",
    shortDescription: "Develop the English communication skills for excellent customer service delivery.",
    fullDescription: "English for Customer Service builds the speaking and writing skills needed for customer-facing roles, covering greetings, handling complaints, de-escalation, email and chat support and professional telephone manner.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "English for Customer Service Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Interest in customer-facing roles",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-05",
  },
  {
    code: "SWA101", name: "Swahili Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn Swahili for everyday communication, travel and business in East Africa.",
    fullDescription: "Swahili Language introduces learners to Kiswahili, covering everyday vocabulary, grammar, conversation and cultural context for communication in Swahili-speaking communities.",
    duration: "12 Weeks", studyMode: "Online", level: "Beginner", language: "English / Swahili",
    fees: "KES 15,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Swahili knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-03-01",
  },
  {
    code: "FRE101", name: "French Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn French for travel, study, work and francophone cultural engagement.",
    fullDescription: "French Language introduces learners to conversational French, covering vocabulary, grammar, pronunciation and cultural context for personal and professional use in French-speaking regions.",
    duration: "12 Weeks", studyMode: "Online", level: "Beginner", language: "English / French",
    fees: "KES 18,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior French knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-03-02",
  },
  {
    code: "SPA101", name: "Spanish Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn Spanish for travel, career and cultural engagement.",
    fullDescription: "Spanish Language introduces learners to conversational Spanish, covering vocabulary, grammar, pronunciation and cultural context for personal and professional use in Spanish-speaking regions.",
    duration: "12 Weeks", studyMode: "Online", level: "Beginner", language: "English / Spanish",
    fees: "KES 18,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Spanish knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-03-03",
  },
  {
    code: "GER101", name: "German Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn German for study, work and cultural engagement in German-speaking countries.",
    fullDescription: "German Language introduces learners to conversational German, covering vocabulary, grammar, pronunciation and cultural context for personal and professional use in German-speaking regions.",
    duration: "12 Weeks", studyMode: "Online", level: "Beginner", language: "English / German",
    fees: "KES 18,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior German knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-03-04",
  },
  {
    code: "MAN101", name: "Mandarin Chinese Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn Mandarin Chinese for business, study and cultural engagement.",
    fullDescription: "Mandarin Chinese Language introduces learners to Mandarin Chinese, covering Pinyin, characters, tones, everyday vocabulary and conversation for communication in Chinese-speaking communities.",
    duration: "12 Weeks", studyMode: "Online", level: "Beginner", language: "English / Chinese",
    fees: "KES 20,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Chinese knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-03-05",
  },
  {
    code: "JPN101", name: "Japanese Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn Japanese for travel, work and cultural engagement.",
    fullDescription: "Japanese Language introduces learners to conversational Japanese, covering hiragana, katakana, basic kanji, vocabulary, grammar and cultural context for personal and professional use.",
    duration: "12 Weeks", studyMode: "Online", level: "Beginner", language: "English / Japanese",
    fees: "KES 20,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Japanese knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-03-06",
  },
  {
    code: "ARB101", name: "Arabic Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn Arabic for travel, study, work and cultural engagement.",
    fullDescription: "Arabic Language introduces learners to conversational Arabic, covering the alphabet, vocabulary, grammar, pronunciation and cultural context for personal and professional use in Arabic-speaking regions.",
    duration: "12 Weeks", studyMode: "Online", level: "Beginner", language: "English / Arabic",
    fees: "KES 18,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Arabic knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-03-07",
  },
  {
    code: "POR101", name: "Portuguese Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn Portuguese for travel, career and cultural engagement.",
    fullDescription: "Portuguese Language introduces learners to conversational Portuguese, covering vocabulary, grammar, pronunciation and cultural context for personal and professional use in Portuguese-speaking regions.",
    duration: "10 Weeks", studyMode: "Online", level: "Beginner", language: "English / Portuguese",
    fees: "KES 16,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Portuguese knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-03-08",
  },
  {
    code: "ITA101", name: "Italian Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn Italian for travel, culture and personal enrichment.",
    fullDescription: "Italian Language introduces learners to conversational Italian, covering vocabulary, grammar, pronunciation and cultural context for personal and professional use in Italian-speaking regions.",
    duration: "10 Weeks", studyMode: "Online", level: "Beginner", language: "English / Italian",
    fees: "KES 16,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Italian knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-03-09",
  },
  {
    code: "RUS101", name: "Russian Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn Russian for travel, study and cultural engagement.",
    fullDescription: "Russian Language introduces learners to conversational Russian, covering the Cyrillic alphabet, vocabulary, grammar, pronunciation and cultural context for personal and professional use.",
    duration: "10 Weeks", studyMode: "Online", level: "Beginner", language: "English / Russian",
    fees: "KES 16,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Russian knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-03-10",
  },
  {
    code: "KOR101", name: "Korean Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn practical Korean for travel, study, work and cultural engagement.",
    fullDescription: "Korean Language introduces learners to Hangul, everyday vocabulary, grammar and conversation, building practical communication skills and cultural understanding for engagement with Korean-speaking communities.",
    duration: "12 Weeks", studyMode: "Online", level: "Beginner", language: "English / Korean",
    fees: "KES 18,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Korean knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-06",
  },
  {
    code: "TUR101", name: "Turkish Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Develop practical Turkish language skills for travel, study and cultural exchange.",
    fullDescription: "Turkish Language introduces learners to conversational Turkish, covering the alphabet, everyday vocabulary, grammar and cultural context for personal and professional use in Turkish-speaking regions.",
    duration: "10 Weeks", studyMode: "Online", level: "Beginner", language: "English / Turkish",
    fees: "KES 15,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Turkish knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-07",
  },
  {
    code: "SOM101", name: "Somali Language", academy: ACADEMY,
    pathwayId: "languages", category: "World Languages", pillar: "academy",
    shortDescription: "Learn Somali for everyday communication and cultural connection.",
    fullDescription: "Somali Language introduces learners to conversational Somali, covering vocabulary, grammar, pronunciation and cultural context for personal and professional use in Somali-speaking communities.",
    duration: "10 Weeks", studyMode: "Online", level: "Beginner", language: "English / Somali",
    fees: "KES 12,000", certification: "Proficiency Certificate",
    entryRequirements: [
    "No prior Somali knowledge required",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-03-11",
  },
  {
    code: "IEL101", name: "IELTS Academic Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Achieve your target IELTS Academic band score with focused preparation.",
    fullDescription: "IELTS Academic Preparation is a focused, results-driven course that equips you with the strategies, skills, and practice needed to achieve top IELTS Academic band scores. Covering all four modules — Listening, Reading, Writing, and Speaking — you will learn from certified instructors and take regular mock tests.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "IELTS Readiness Certificate",
    entryRequirements: [
    "Intermediate English proficiency (IELTS 5.0+ or equivalent)",
    "Familiarity with academic reading",
    "Internet access for online learners",
    "Commitment to daily practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-04-01",
  },
  {
    code: "IEL102", name: "IELTS General Training", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Prepare for the IELTS General Training module for immigration and work visas.",
    fullDescription: "IELTS General Training focuses on the General Training module of the IELTS exam, designed for those seeking immigration, work visas, or vocational training in English-speaking countries.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "IELTS Readiness Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Basic familiarity with IELTS format",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-02",
  },
  {
    code: "TOF101", name: "TOEFL Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Achieve a high TOEFL iBT score with comprehensive preparation.",
    fullDescription: "TOEFL Preparation is a comprehensive course that prepares you for the TOEFL iBT exam. Covering Reading, Listening, Speaking, and Writing, you will develop the academic English skills and test-taking strategies needed to achieve a high score.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "TOEFL Readiness Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Familiarity with academic English",
    "Internet access for online learners",
    "Commitment to daily practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-04-03",
  },
  {
    code: "PTE101", name: "PTE Academic", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Master the PTE Academic exam with targeted preparation.",
    fullDescription: "PTE Academic prepares learners for the Pearson Test of English Academic, covering speaking, writing, reading and listening with computer-based test strategies and authentic practice materials.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "PTE Readiness Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Basic computer literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-04",
  },
  {
    code: "DET101", name: "Duolingo English Test (DET) Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Prepare for the Duolingo English Test for university admissions.",
    fullDescription: "Duolingo English Test (DET) Preparation covers the DET format, question types, speaking and writing tasks and test strategies for achieving a high score on this increasingly popular English proficiency test.",
    duration: "4 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 10,000", certification: "DET Readiness Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Basic computer literacy",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-05",
  },
  {
    code: "SAT101", name: "SAT Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Achieve your target SAT score for university admissions.",
    fullDescription: "SAT Preparation covers the digital SAT format, including reading, writing and math sections, with test strategies, timed practice and personalised feedback for university admission.",
    duration: "10 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 22,000", certification: "SAT Readiness Certificate",
    entryRequirements: [
    "Upper-intermediate English proficiency",
    "Strong mathematics background",
    "Internet access for online learners",
    "Commitment to intensive practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-04-06",
  },
  {
    code: "GRE101", name: "GRE Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Prepare for the GRE for graduate school admissions.",
    fullDescription: "GRE Preparation covers verbal reasoning, quantitative reasoning and analytical writing, with test strategies, timed practice and personalised feedback for graduate school admission.",
    duration: "10 Weeks", studyMode: "Online", level: "Advanced", language: "English",
    fees: "KES 24,000", certification: "GRE Readiness Certificate",
    entryRequirements: [
    "Upper-intermediate English proficiency",
    "Strong quantitative background",
    "Internet access for online learners",
    "Commitment to intensive practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-07",
  },
  {
    code: "GMA101", name: "GMAT Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Master the GMAT for business school admissions.",
    fullDescription: "GMAT Preparation covers quantitative, verbal, integrated reasoning and analytical writing assessment, with test strategies, timed practice and personalised feedback for business school admission.",
    duration: "10 Weeks", studyMode: "Online", level: "Advanced", language: "English",
    fees: "KES 24,000", certification: "GMAT Readiness Certificate",
    entryRequirements: [
    "Upper-intermediate English proficiency",
    "Strong quantitative background",
    "Internet access for online learners",
    "Commitment to intensive practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-08",
  },
  {
    code: "CAM101", name: "Cambridge English", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Prepare for Cambridge English qualifications including B2 First and C1 Advanced.",
    fullDescription: "Cambridge English prepares you for Cambridge English qualifications, including B2 First and C1 Advanced. You will develop the reading, writing, listening, and speaking skills needed to pass these internationally recognised exams.",
    duration: "10 Weeks", studyMode: "Online", level: "Advanced", language: "English",
    fees: "KES 20,000", certification: "Cambridge Readiness Certificate",
    entryRequirements: [
    "Upper-intermediate English proficiency",
    "Familiarity with exam formats",
    "Internet access for online learners",
    "Commitment to regular practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-04-09",
  },
  {
    code: "IGC101", name: "IGCSE Foundation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Build a strong academic foundation for IGCSE examination success.",
    fullDescription: "IGCSE Foundation is a comprehensive course that builds a strong academic foundation for IGCSE examination success. Covering core subjects and study skills, it prepares learners for the rigour of international qualifications.",
    duration: "12 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 20,000", certification: "IGCSE Foundation Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Age 13-16",
    "Internet access for online learners",
    "Commitment to regular study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-10",
  },
  {
    code: "IGC201", name: "IGCSE O Level", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Prepare for IGCSE O Level examinations across core subjects.",
    fullDescription: "IGCSE O Level provides comprehensive preparation for IGCSE O Level examinations, covering core subjects including English, Mathematics and Sciences with exam technique and past paper practice.",
    duration: "16 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 24,000", certification: "IGCSE Certificate",
    entryRequirements: [
    "Completion of IGC101 or equivalent",
    "Intermediate English proficiency",
    "Internet access for online learners",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-11",
  },
  {
    code: "IGC301", name: "IGCSE AS Level", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Prepare for IGCSE AS Level examinations with targeted subject support.",
    fullDescription: "IGCSE AS Level provides comprehensive preparation for IGCSE AS Level examinations, covering advanced subject content, analytical skills and exam technique for AS Level success.",
    duration: "16 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 26,000", certification: "IGCSE Certificate",
    entryRequirements: [
    "Completion of IGC201 or equivalent",
    "Upper-intermediate English proficiency",
    "Internet access for online learners",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-12",
  },
  {
    code: "IGC401", name: "IGCSE A Level", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Master IGCSE A Level subjects for university admission.",
    fullDescription: "IGCSE A Level provides comprehensive preparation for IGCSE A Level examinations, covering advanced subject content, critical analysis and exam technique for university admission.",
    duration: "16 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 28,000", certification: "IGCSE Certificate",
    entryRequirements: [
    "Completion of IGC301 or equivalent",
    "Advanced English proficiency",
    "Internet access for online learners",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-13",
  },
  {
    code: "IBD101", name: "IB Diploma Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Prepare for the International Baccalaureate Diploma Programme.",
    fullDescription: "IB Diploma Preparation supports learners in the International Baccalaureate Diploma Programme, covering core subjects, Theory of Knowledge, Extended Essay and CAS requirements.",
    duration: "16 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 28,000", certification: "IB Readiness Certificate",
    entryRequirements: [
    "Upper-intermediate English proficiency",
    "Strong academic record",
    "Internet access for online learners",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-14",
  },
  {
    code: "EDX101", name: "Pearson Edexcel Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Prepare for Pearson Edexcel international qualifications.",
    fullDescription: "Pearson Edexcel Preparation covers Pearson Edexcel international GCSE and A Level qualifications, with subject content, exam technique and past paper practice.",
    duration: "12 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 24,000", certification: "Edexcel Readiness Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Strong academic record",
    "Internet access for online learners",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-04-15",
  },
  {
    code: "APC101", name: "AP Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Targeted preparation for Advanced Placement exams for US university credit.",
    fullDescription: "AP Preparation supports learners preparing for College Board Advanced Placement exams across core subjects, building subject mastery and exam technique for earning university credit while in high school.",
    duration: "12 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 28,000", certification: "AP Readiness Certificate",
    entryRequirements: [
    "Upper-intermediate English proficiency",
    "Strong academic record",
    "Internet access for online learners",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-09",
  },
  {
    code: "TOE101", name: "TOEIC Preparation", academy: ACADEMY,
    pathwayId: "international-qualifications", category: "International Qualifications", pillar: "academy",
    shortDescription: "Prepare for the TOEIC, the global standard for workplace English assessment.",
    fullDescription: "TOEIC Preparation equips learners with the strategies and practice needed for the Test of English for International Communication, covering listening and reading sections with timed drills and authentic test materials.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "TOEIC Readiness Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Basic computer literacy",
    "Internet access for online learners",
    "Commitment to timed practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-08",
  },
  {
    code: "CBP101", name: "CBE Primary Support (PP1 – Grade 6)", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    status: 'Active',
    shortDescription: "CBE-aligned support for learners from PP1 through Grade 6.",
    fullDescription: "CBE Primary Support covers the Competency Based Education curriculum for Pre-Primary 1 through Grade 6, building core literacy, numeracy and foundational competencies aligned with the current Kenyan CBE framework.",
    duration: "12 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "CBE Primary Support Certificate",
    entryRequirements: [
    "Enrolled in PP1 through Grade 6",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-01",
  },
  {
    code: "CBJ101", name: "CBE Junior Secondary (Grades 7–9)", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    status: 'Active',
    shortDescription: "CBE/CBC support for Junior Secondary learners across Grades 7, 8 and 9.",
    fullDescription: "CBE Junior Secondary provides structured learning support for learners in Grades 7 through 9, covering all core learning areas and optional subjects aligned with Kenya's Competency Based Curriculum. Explore individual grades and subjects through the CBE Academy.",
    duration: "Ongoing", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "CBE Junior Secondary Certificate",
    entryRequirements: [
    "Enrolled in Grade 7 through Grade 9",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-01",
  },
  {
    code: "KCS101", name: "KCSE Revision", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    status: 'Active',
    shortDescription: "Comprehensive KCSE revision across core subjects.",
    fullDescription: "KCSE Revision provides comprehensive revision for the Kenya Certificate of Secondary Education examination, covering core subjects with past papers, exam technique and targeted revision.",
    duration: "16 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 20,000", certification: "KCSE Readiness Certificate",
    entryRequirements: [
    "Form 4 student or equivalent",
    "Intermediate English proficiency",
    "Internet access for online learners",
    "Commitment to intensive revision"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-05-02",
  },
  {
    code: "CBS101", name: "CBE Senior School (Grades 10–12)", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    status: 'Active',
    shortDescription: "CBE/CBC support for Senior School learners across Grades 10, 11 and 12, including STEM, Social Sciences and Arts & Sports pathways.",
    fullDescription: "CBE Senior School provides pathway-focused learning support for learners in Grades 10 through 12. Learners choose from the STEM, Social Sciences, or Arts & Sports Science pathways, each with core and specialised subjects aligned with Kenya's Competency Based Curriculum. Explore individual grades, pathways and subjects through the CBE Academy.",
    duration: "Ongoing", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 18,000", certification: "CBE Senior School Certificate",
    entryRequirements: [
    "Enrolled in Grade 10 through Grade 12",
    "Intermediate English proficiency",
    "Internet access for online learners",
    "Commitment to regular study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-02",
  },
  {
    code: "TVT101", name: "TVET Engineering", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Structured TVET engineering theory and practice for KNEC examinations.",
    fullDescription: "TVET Engineering provides comprehensive preparation for KNEC TVET engineering trades, combining theory revision with practical workshop skills across electrical, mechanical and automotive specialisations.",
    duration: "12 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 20,000", certification: "TVET Engineering Certificate",
    entryRequirements: [
    "KCSE certificate or equivalent",
    "Basic mathematics and science background",
    "Commitment to practical training"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-10",
  },
  {
    code: "TVI101", name: "TVET ICT", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Structured ICT trade preparation for KNEC TVET examinations.",
    fullDescription: "TVET ICT prepares learners for KNEC TVET ICT trade examinations, covering hardware, networking basics, software applications and IT support fundamentals for certification and employment.",
    duration: "12 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "TVET ICT Certificate",
    entryRequirements: [
    "KCSE certificate or equivalent",
    "Basic computer literacy",
    "Commitment to practical training"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-11",
  },
  {
    code: "TVB101", name: "TVET Business", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Structured business trade preparation for KNEC TVET examinations.",
    fullDescription: "TVET Business prepares learners for KNEC TVET business trade examinations, covering office administration, bookkeeping, business communication and entrepreneurship fundamentals for certification and employment.",
    duration: "12 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "TVET Business Certificate",
    entryRequirements: [
    "KCSE certificate or equivalent",
    "Basic English literacy",
    "Commitment to practical training"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-12",
  },
  {
    code: "TVA101", name: "TVET Agriculture", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Structured agricultural trade preparation for KNEC TVET examinations.",
    fullDescription: "TVET Agriculture prepares learners for KNEC TVET agricultural trade examinations, covering crop production, livestock management, farm machinery and agribusiness fundamentals for certification and employment.",
    duration: "12 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "TVET Agriculture Certificate",
    entryRequirements: [
    "KCSE certificate or equivalent",
    "Basic science background",
    "Commitment to practical training"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-13",
  },
  {
    code: "TVH101", name: "TVET Hospitality", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Structured hospitality trade preparation for KNEC TVET examinations.",
    fullDescription: "TVET Hospitality prepares learners for KNEC TVET hospitality trade examinations, covering food production, food and beverage service, front office operations and housekeeping for certification and employment.",
    duration: "12 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "TVET Hospitality Certificate",
    entryRequirements: [
    "KCSE certificate or equivalent",
    "Basic English literacy",
    "Commitment to practical training"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-14",
  },
  {
    code: "CBE101", name: "Competency Based Education", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Understand and apply Competency Based Education principles in TVET settings.",
    fullDescription: "Competency Based Education introduces the principles and practices of CBE as applied in TVET institutions, covering competency design, assessment and delivery for trainers and educators working within the CBC and TVET framework.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "CBE Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Teaching or training background (recommended)",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-15",
  },
  {
    code: "DIP101", name: "Diploma Support Programme", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Academic support for diploma-level learners across disciplines.",
    fullDescription: "Diploma Support Programme provides academic support for diploma-level learners, covering study skills, assignment writing, exam preparation and subject-specific support across disciplines.",
    duration: "12 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Diploma Support Certificate",
    entryRequirements: [
    "Diploma-level learner",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to regular study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-04",
  },
  {
    code: "EDR101", name: "Engineering Drawing", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Master technical drawing for engineering and design.",
    fullDescription: "Engineering Drawing covers technical drawing principles, orthographic projection, isometric drawing, dimensioning and CAD basics for engineering and technical applications.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Engineering Drawing Certificate",
    entryRequirements: [
    "Basic mathematics background",
    "Basic English literacy",
    "Access to drawing tools or CAD software",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-05",
  },
  {
    code: "ELI101", name: "Electrical Installation", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Learn electrical installation for residential and commercial buildings.",
    fullDescription: "Electrical Installation covers electrical circuits, wiring, safety, installation practices and basic electrical codes for residential and commercial electrical work.",
    duration: "8 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "Electrical Installation Certificate",
    entryRequirements: [
    "Basic mathematics background",
    "Basic English literacy",
    "Willingness to undertake practical training",
    "Commitment to safety practices"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-06",
  },
  {
    code: "ELN101", name: "Electronics", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Understand electronics from basic components to circuit design.",
    fullDescription: "Electronics covers electronic components, circuit analysis, soldering, testing and basic circuit design for building and repairing electronic devices.",
    duration: "8 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "Electronics Certificate",
    entryRequirements: [
    "Basic mathematics background",
    "Basic English literacy",
    "Willingness to undertake practical training",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-07",
  },
  {
    code: "EMA101", name: "Engineering Mathematics", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Master the mathematics needed for engineering study and practice.",
    fullDescription: "Engineering Mathematics covers algebra, trigonometry, calculus, statistics and engineering applications of mathematics for engineering students and professionals.",
    duration: "10 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 16,000", certification: "Engineering Mathematics Certificate",
    entryRequirements: [
    "Strong mathematics background",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-08",
  },
  {
    code: "ART101", name: "Artisan Courses", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Practical artisan training for skilled trades.",
    fullDescription: "Artisan Courses provide practical training in skilled trades including plumbing, masonry, carpentry, welding and electrical installation for employment and self-employment.",
    duration: "8 Weeks", studyMode: "Physical", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Artisan Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Willingness to undertake physical practical training",
    "Commitment to attendance"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-09",
  },
  {
    code: "CRA101", name: "Craft Certificate Courses", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Craft-level training for technical trades and certifications.",
    fullDescription: "Craft Certificate Courses provide craft-level training in technical trades, covering theory and practical skills for KNEC craft certificate examinations and employment.",
    duration: "12 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Craft Certificate",
    entryRequirements: [
    "KCSE certificate or equivalent",
    "Basic English literacy",
    "Willingness to undertake practical training",
    "Commitment to regular attendance"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-10",
  },
  {
    code: "TVE101", name: "KNEC TVET Revision", academy: ACADEMY,
    pathwayId: "national-tvet", category: "National Curriculum & TVET", pillar: "academy",
    shortDescription: "Comprehensive revision for KNEC TVET examinations across trades.",
    fullDescription: "KNEC TVET Revision provides comprehensive revision for KNEC TVET examinations, covering core trade theory, practical skills and past paper practice across engineering, ICT and business trades.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "TVET Revision Certificate",
    entryRequirements: [
    "TVET trainee",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to intensive revision"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-11",
  },
  {
    code: "REN101", name: "Renewable Energy", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Understand renewable energy systems and technologies.",
    fullDescription: "Renewable Energy covers solar, wind, hydro and biomass energy systems, including system design, installation, maintenance and policy for the renewable energy sector.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "Renewable Energy Certificate",
    entryRequirements: [
    "Basic science background",
    "Basic English literacy",
    "Internet access for online learners",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-12",
  },
  {
    code: "SOL101", name: "Solar Installation", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Learn to design, install and maintain solar power systems.",
    fullDescription: "Solar Installation covers solar panel types, system sizing, battery storage, charge controllers, inverters, installation practices and maintenance for residential and commercial solar systems.",
    duration: "8 Weeks", studyMode: "Physical / Hybrid", level: "Beginner", language: "English",
    fees: "KES 18,000", certification: "Solar Installation Certificate",
    entryRequirements: [
    "Basic mathematics and science background",
    "Basic English literacy",
    "Willingness to undertake practical training"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-09-12",
  },
  {
    code: "ICT101", name: "ICT Essentials", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Build comprehensive digital literacy for safe, effective, and confident online life.",
    fullDescription: "ICT Essentials is a foundational course that builds core digital literacy and productivity skills for the modern workplace. From computer fundamentals to essential software tools, you will gain the confidence to navigate the digital world.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 15,000", certification: "Digital Skills Certificate",
    entryRequirements: [
    "No prior computer experience required",
    "Basic English literacy",
    "Access to a computer or smartphone",
    "Commitment to hands-on practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-05-01",
  },
  {
    code: "ICT102", name: "Computer Packages", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Master essential computer packages for office productivity and employment.",
    fullDescription: "Computer Packages is a comprehensive course covering the essential software packages used in offices worldwide. You will master word processing, spreadsheets, presentations, databases, and internet tools.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Computer Packages Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer",
    "Commitment to hands-on practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-05-02",
  },
  {
    code: "ICT301", name: "Advanced Computer Packages", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Deepen your command of office software with advanced formulas, automation and design features.",
    fullDescription: "Advanced Computer Packages builds on foundational computer skills, covering advanced spreadsheet formulas and pivot tables, mail merge, macros basics, advanced presentation design and document collaboration for confident, efficient office work.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Advanced Computer Packages Certificate",
    entryRequirements: [
    "Completion of ICT102 or equivalent",
    "Basic English literacy",
    "Access to a computer",
    "Commitment to hands-on practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-03",
  },
  {
    code: "ICT201", name: "Internet & Web Research", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Navigate the internet safely and effectively for research, communication and learning.",
    fullDescription: "Internet & Web Research teaches effective search techniques, source evaluation, online safety and digital communication, helping learners use the internet confidently for study, work and daily life.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 10,000", certification: "Digital Skills Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to hands-on practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-04",
  },
  {
    code: "ICT202", name: "Digital Productivity", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Boost productivity with digital tools and efficient workflows.",
    fullDescription: "Digital Productivity covers advanced productivity techniques including automation, templates, shortcuts and workflow optimisation across popular office and cloud tools.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 12,000", certification: "Digital Productivity Certificate",
    entryRequirements: [
    "Completion of ICT102 or equivalent",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to hands-on practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-05",
  },
  {
    code: "ICT204", name: "ICDL Certification", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Achieve internationally recognised certification in essential computer skills.",
    fullDescription: "ICDL Certification prepares learners for the International Computer Driving Licence, covering computer essentials, online essentials, word processing, spreadsheets, presentations and online collaboration.",
    duration: "12 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 25,000", certification: "ICDL Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to certification exams"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-05-06",
  },
  {
    code: "COD101", name: "Coding Fundamentals", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Learn the building blocks of programming and computational thinking.",
    fullDescription: "Coding Fundamentals introduces programming concepts including variables, loops, conditionals, functions and data structures, using a beginner-friendly language to build computational thinking.",
    duration: "8 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Coding Fundamentals Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-07",
  },
  {
    code: "PY101", name: "Python Programming", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Learn Python, one of the world's most in-demand programming languages, from the ground up.",
    fullDescription: "Python Programming builds practical coding skills from syntax and data types to functions, file handling and simple projects, giving learners a strong foundation in one of the most popular programming languages.",
    duration: "10 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Python Programming Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-05-08",
  },
  {
    code: "AIF101", name: "Artificial Intelligence Fundamentals", academy: ACADEMY,
    pathwayId: "school-ai", category: "Digital Intelligence", pillar: "labs",
    shortDescription: "Understand how AI works and explore its real-world applications and impact.",
    fullDescription: "Artificial Intelligence Fundamentals introduces the concepts behind AI, including machine learning, neural networks and natural language processing, with practical exploration of AI tools and their real-world impact.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "AI Fundamentals Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-05-09",
  },
  {
    code: "AI101", name: "Applied AI Tools", academy: ACADEMY,
    pathwayId: "school-ai", category: "Digital Intelligence", pillar: "labs",
    shortDescription: "Master AI tools to boost productivity, creativity, and professional efficiency.",
    fullDescription: "Applied AI Tools introduces practical AI tools for content creation, data analysis, design and automation, helping learners integrate AI into their daily work and study.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Applied AI Tools Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to hands-on practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-05-10",
  },
  {
    code: "CYB101", name: "Cybersecurity Awareness", academy: ACADEMY,
    pathwayId: "school-cybersecurity", category: "Cybersecurity & Digital Safety", pillar: "labs",
    shortDescription: "Learn essential cybersecurity skills to stay safe online and protect your data.",
    fullDescription: "Cybersecurity Awareness covers password security, phishing, malware, safe browsing, social media privacy and basic digital hygiene for individuals and small organisations.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Cybersecurity Awareness Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-05-11",
  },
  {
    code: "DLP101", name: "Internet Safety", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Learn to protect yourself and your family online with essential internet safety skills.",
    fullDescription: "Internet Safety covers password security, phishing detection, social media privacy, safe browsing habits and online scam awareness, helping learners build safe and confident online habits.",
    duration: "3 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 5,000", certification: "Internet Safety Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Access to a smartphone or computer",
    "Commitment to learning"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-16",
  },
  {
    code: "DLP102", name: "Zoom Essentials", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Master Zoom for meetings, webinars and online collaboration.",
    fullDescription: "Zoom Essentials teaches learners to host and join Zoom meetings, manage participants, share screens, use breakout rooms and run professional webinars for work, teaching and collaboration.",
    duration: "2 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 4,000", certification: "Zoom Essentials Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Access to a computer with webcam",
    "Internet access"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-17",
  },
  {
    code: "DLP103", name: "Microsoft Teams", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Learn to use Microsoft Teams for workplace communication and collaboration.",
    fullDescription: "Microsoft Teams teaches learners to set up and manage teams, channels, chats, meetings, file sharing and app integrations for seamless workplace collaboration and remote work.",
    duration: "2 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 4,000", certification: "Microsoft Teams Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Access to a computer with internet",
    "Commitment to hands-on practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-18",
  },
  {
    code: "DLP104", name: "Email Productivity", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Master professional email communication and inbox management.",
    fullDescription: "Email Productivity develops efficient email habits for the modern workplace, covering professional email writing, inbox organisation, filters and labels, scheduling and communication etiquette.",
    duration: "3 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 5,000", certification: "Email Productivity Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "An active email account",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-19",
  },
  {
    code: "DLP105", name: "Online Research Skills", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Learn to find, evaluate and use online information effectively and responsibly.",
    fullDescription: "Online Research Skills teaches learners to use search engines effectively, evaluate source credibility, use academic databases, cite sources and avoid misinformation for study, work and personal research.",
    duration: "3 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 5,000", certification: "Online Research Skills Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Access to a computer with internet",
    "Commitment to learning"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-20",
  },
  {
    code: "DLP106", name: "Digital Entrepreneurship", academy: ACADEMY,
    pathwayId: "digital-literacy-productivity", category: "Digital Literacy & Productivity", pillar: "academy",
    shortDescription: "Learn to start and grow a business using digital tools and platforms.",
    fullDescription: "Digital Entrepreneurship introduces the fundamentals of building an online business, covering digital business models, social media marketing, e-commerce platforms, online payments and digital customer acquisition.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Digital Entrepreneurship Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Interest in entrepreneurship"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-21",
  },
  {
    code: "PHO101", name: "Photoshop Essentials", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Master Adobe Photoshop for photo editing and digital design.",
    fullDescription: "Photoshop Essentials covers photo editing, retouching, layer management, selections, masks and compositing using Adobe Photoshop for professional digital image editing.",
    duration: "8 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Photoshop Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with Photoshop",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-01",
  },
  {
    code: "AFX101", name: "After Effects", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Create stunning motion graphics and visual effects with Adobe After Effects.",
    fullDescription: "After Effects covers motion graphics, animation, compositing, visual effects and rendering using Adobe After Effects for professional video and motion content.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "After Effects Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic design software familiarity",
    "Access to a computer with After Effects",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-02",
  },
  {
    code: "PRE101", name: "Premiere Pro", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Edit professional videos with Adobe Premiere Pro.",
    fullDescription: "Premiere Pro covers video editing, colour correction, audio editing, transitions and exporting using Adobe Premiere Pro for professional video production.",
    duration: "8 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Premiere Pro Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with Premiere Pro",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-03",
  },
  {
    code: "IND101", name: "InDesign", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Design professional layouts for print and digital publishing.",
    fullDescription: "InDesign covers page layout, master pages, typography, styles and exporting for print and digital publishing using Adobe InDesign.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "InDesign Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic design knowledge",
    "Access to a computer with InDesign",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-04",
  },
  {
    code: "VDE101", name: "Videography", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Shoot professional video with any camera.",
    fullDescription: "Videography covers camera operation, composition, lighting, audio recording and shooting techniques for creating professional video content with any camera.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Videography Certificate",
    entryRequirements: [
    "Access to a camera (smartphone or dedicated camera)",
    "Basic English literacy",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-05",
  },
  {
    code: "VDG101", name: "Video Editing", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Edit videos that tell compelling stories.",
    fullDescription: "Video Editing covers editing principles, pacing, storytelling, colour grading and sound design for creating professional video content.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Video Editing Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with editing software",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-06",
  },
  {
    code: "GRD101", name: "Graphic Design", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Master the principles of graphic design for print and digital media.",
    fullDescription: "Graphic Design covers design principles, typography, colour theory, layout and visual communication for creating professional graphic design work across print and digital media.",
    duration: "8 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Graphic Design Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-07",
  },
  {
    code: "PSD101", name: "Photoshop Advanced", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Master advanced Photoshop techniques for professional design work.",
    fullDescription: "Photoshop Advanced covers advanced compositing, retouching, 3D, automation and professional workflows using Adobe Photoshop for high-end design production.",
    duration: "8 Weeks", studyMode: "Online", level: "Advanced", language: "English",
    fees: "KES 18,000", certification: "Photoshop Advanced Certificate",
    entryRequirements: [
    "Completion of PHO101 or equivalent",
    "Basic English literacy",
    "Access to a computer with Photoshop",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-08",
  },
  {
    code: "ILL101", name: "Illustrator", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Create vector graphics and illustrations with Adobe Illustrator.",
    fullDescription: "Illustrator covers vector drawing, paths, shapes, typography, logos and illustration using Adobe Illustrator for professional graphic design and illustration.",
    duration: "8 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Illustrator Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with Illustrator",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-09",
  },
  {
    code: "FIG101", name: "Figma Design", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Master Figma for collaborative interface design and prototyping.",
    fullDescription: "Figma Design teaches learners to use Figma for UI design, prototyping, design systems and collaboration, building the skills needed for modern digital product design workflows.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Figma Design Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-10",
  },
  {
    code: "UIX101", name: "UI/UX Design Fundamentals", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Design intuitive, user-centred digital products from wireframe to prototype.",
    fullDescription: "UI/UX Design Fundamentals covers user research, wireframing, prototyping, usability testing and design systems, giving learners a practical foundation in digital product design.",
    duration: "8 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "UI/UX Design Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-11",
  },
  {
    code: "UID101", name: "UI Design", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Master the visual design of digital interfaces.",
    fullDescription: "UI Design covers visual hierarchy, colour theory, typography, component design and design systems for web and mobile interfaces, building practical skills in digital visual design.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "UI Design Certificate",
    entryRequirements: [
    "Basic design knowledge or completion of UIX101",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-12",
  },
  {
    code: "UXD101", name: "UX Design", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Master user research, usability and experience design for digital products.",
    fullDescription: "UX Design covers user research methods, personas, journey mapping, usability testing and information architecture, building the skills to design experiences users love.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "UX Design Certificate",
    entryRequirements: [
    "Basic design knowledge or completion of UIX101",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-13",
  },
  {
    code: "MOG101", name: "Motion Graphics", academy: ACADEMY,
    pathwayId: "school-creative-ai-immersive", category: "Creative Technology & Immersive Media", pillar: "labs",
    shortDescription: "Create dynamic motion graphics for video, web and social media.",
    fullDescription: "Motion Graphics covers animation principles, keyframing, easing, text animation and compositing using After Effects, building skills for creating professional motion content.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Motion Graphics Certificate",
    entryRequirements: [
    "Basic design software familiarity",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-14",
  },
  {
    code: "MOT101", name: "Motion Design", academy: ACADEMY,
    pathwayId: "school-creative-ai-immersive", category: "Creative Technology & Immersive Media", pillar: "labs",
    shortDescription: "Master motion design for digital products and brand experiences.",
    fullDescription: "Motion Design covers advanced animation, transitions, micro-interactions and motion branding for digital products, building skills in creating polished motion design work.",
    duration: "8 Weeks", studyMode: "Online", level: "Advanced", language: "English",
    fees: "KES 18,000", certification: "Motion Design Certificate",
    entryRequirements: [
    "Completion of MOG101 or equivalent",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-15",
  },
  {
    code: "POD101", name: "Podcast Production", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Plan, record, edit and publish professional podcasts.",
    fullDescription: "Podcast Production covers planning, recording, editing, publishing and monetising podcasts, with practical skills in audio equipment, editing software and distribution platforms.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Podcast Production Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet and microphone",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-16",
  },
  {
    code: "BRD101", name: "Branding & Identity", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Build compelling brand identities for businesses and organisations.",
    fullDescription: "Branding & Identity covers brand strategy, logo design, visual identity systems, brand guidelines and brand application, building the skills to create cohesive brand experiences.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Branding Certificate",
    entryRequirements: [
    "Basic design knowledge",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-17",
  },
  {
    code: "CCN101", name: "Content Creation", academy: ACADEMY,
    pathwayId: "creative-design", category: "Creative Design & Media", pillar: "academy",
    shortDescription: "Create engaging content for social media, blogs and digital platforms.",
    fullDescription: "Content Creation covers content strategy, writing, visual content, video content, social media platforms and analytics, building the skills to create compelling content that grows audiences.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Content Creation Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-18",
  },
  {
    code: "BUS101", name: "Business Essentials", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Build a strong foundation in business principles and practice.",
    fullDescription: "Business Essentials covers business fundamentals including business models, operations, marketing, finance and strategy for starting and running a successful business.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Business Essentials Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in business",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-07-01",
  },
  {
    code: "BUS102", name: "Lean Startup", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Learn the Lean Startup methodology to build products customers actually want.",
    fullDescription: "Lean Startup teaches the build-measure-learn loop, minimum viable products, customer development and validated learning, helping entrepreneurs reduce risk and build ventures that solve real problems.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Lean Startup Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in entrepreneurship",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-22",
  },
  {
    code: "BUS103", name: "Product Management", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Learn to discover, define and deliver products that customers love.",
    fullDescription: "Product Management covers product strategy, roadmapping, user research, prioritisation frameworks and cross-functional leadership, equipping learners to manage products from idea to launch and beyond.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "Product Management Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Some work experience (recommended)",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-23",
  },
  {
    code: "BUS104", name: "Venture Capital", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Understand how venture capital works and how to raise funding for growth.",
    fullDescription: "Venture Capital covers funding stages, term sheets, valuation methods, investor pitches and deal structures, helping founders and aspiring investors understand the venture funding ecosystem.",
    duration: "6 Weeks", studyMode: "Online", level: "Advanced", language: "English",
    fees: "KES 16,000", certification: "Venture Capital Certificate",
    entryRequirements: [
    "Basic business knowledge",
    "Interest in startup funding",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-24",
  },
  {
    code: "BUS105", name: "Innovation Management", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Learn to manage innovation processes and build a culture of continuous innovation.",
    fullDescription: "Innovation Management covers innovation frameworks, design of innovation processes, building innovation culture, managing R&D and measuring innovation outcomes for organisations of all sizes.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "Innovation Management Certificate",
    entryRequirements: [
    "Basic business knowledge",
    "Interest in innovation",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-25",
  },
  {
    code: "BUS106", name: "Design Thinking", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Learn the Design Thinking process to solve complex problems creatively.",
    fullDescription: "Design Thinking teaches the empathise, define, ideate, prototype and test process, helping learners tackle complex problems with human-centred, creative approaches for products, services and organisations.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Design Thinking Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in problem-solving",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-26",
  },
  {
    code: "BUS107", name: "Strategic Leadership", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Develop the strategic thinking and leadership skills for senior leadership roles.",
    fullDescription: "Strategic Leadership covers vision setting, strategic decision-making, leading change, organisational design and executive communication, preparing experienced leaders for senior and C-suite roles.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 22,000", certification: "Strategic Leadership Certificate",
    entryRequirements: [
    "Management or leadership experience",
    "Basic English proficiency",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-27",
  },
  {
    code: "BUS108", name: "Growth Marketing", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Learn data-driven marketing strategies to drive rapid, sustainable growth.",
    fullDescription: "Growth Marketing covers acquisition, activation, retention, referral and revenue strategies, using analytics, A/B testing, SEO, content marketing and automation to drive measurable growth.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "Growth Marketing Certificate",
    entryRequirements: [
    "Basic marketing knowledge",
    "Basic computer literacy",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-28",
  },
  {
    code: "BUS109", name: "Customer Success", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Learn to drive customer retention, satisfaction and expansion for SaaS and service businesses.",
    fullDescription: "Customer Success covers onboarding, adoption tracking, churn prevention, expansion strategies and customer advocacy, equipping learners to build and lead customer success functions.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Customer Success Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in customer-facing roles",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-29",
  },
  {
    code: "HRM101", name: "Human Resource Management", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Build the skills to manage people, recruitment and workplace performance.",
    fullDescription: "Human Resource Management covers recruitment, onboarding, performance management, employee relations and basic labour law, giving learners a practical foundation in HR practice.",
    duration: "10 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "HR Management Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in people management",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-07-08",
  },
  {
    code: "SLM101", name: "Sales & Marketing", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Build practical skills to sell effectively and market products with impact.",
    fullDescription: "Sales & Marketing covers the sales process, negotiation, customer relationship building and core marketing principles, giving learners the practical toolkit to drive revenue for any business.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Sales & Marketing Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in sales or marketing",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-07-09",
  },
  {
    code: "BAN101", name: "Business Analytics", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Use data to make smarter, evidence-based business decisions.",
    fullDescription: "Business Analytics teaches learners to interpret business data, build simple dashboards and reports, and use analytics to guide decision-making across sales, operations and marketing functions.",
    duration: "10 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 20,000", certification: "Business Analytics Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic numeracy skills",
    "Access to a computer with internet",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-07-10",
  },
  {
    code: "FIN101", name: "Financial Literacy", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Master personal and business finance fundamentals.",
    fullDescription: "Financial Literacy covers budgeting, saving, investing, debt management, insurance and financial planning for personal financial health and basic business finance.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 10,000", certification: "Financial Literacy Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Basic numeracy skills",
    "Access to a computer with internet",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-07-11",
  },
  {
    code: "PMG101", name: "Project Management", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Learn to plan, execute and deliver projects successfully.",
    fullDescription: "Project Management covers project planning, scheduling, risk management, stakeholder communication and project delivery methodologies for managing projects of any size.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "Project Management Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Some work experience (recommended)",
    "Access to a computer with internet",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-07-12",
  },
  {
    code: "ENT101", name: "Entrepreneurship", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Turn your business idea into a viable venture.",
    fullDescription: "Entrepreneurship covers idea validation, market research, business models, funding, legal structures and launch strategies for starting and growing a successful business.",
    duration: "10 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 18,000", certification: "Entrepreneurship Certificate",
    entryRequirements: [
    "Basic English literacy",
    "A business idea (helpful but not required)",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-07-13",
  },
  {
    code: "LDR101", name: "Leadership Essentials", academy: ACADEMY,
    pathwayId: "business", category: "Business, Entrepreneurship & Leadership", pillar: "academy",
    shortDescription: "Develop the leadership skills to lead teams and organisations.",
    fullDescription: "Leadership Essentials covers leadership styles, team building, decision-making, communication and emotional intelligence for leading teams and organisations effectively.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Leadership Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Some work or team experience",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-07-14",
  },
  {
    code: "UPW101", name: "Upwork Masterclass", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Build a winning Upwork profile and land your first international clients.",
    fullDescription: "Upwork Masterclass teaches learners to build a compelling profile, write winning proposals, price their services and manage client relationships to succeed as a freelancer on Upwork.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Freelancing Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "A marketable skill to offer (writing, design, coding, etc.)",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-08-01",
  },
  {
    code: "FIV101", name: "Fiverr Success", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Create standout gigs and build a thriving freelance business on Fiverr.",
    fullDescription: "Fiverr Success teaches learners to create optimised gigs, price services strategically, manage orders and build a strong reputation as a freelancer on Fiverr.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Freelancing Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "A marketable skill to offer",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-08-02",
  },
  {
    code: "VAS101", name: "Virtual Assistant Training", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Build the administrative and organisational skills to work as a professional virtual assistant.",
    fullDescription: "Virtual Assistant Training covers calendar management, email handling, customer communication, basic bookkeeping and productivity tools used by remote administrative professionals worldwide.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Virtual Assistant Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Basic computer literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-08-03",
  },
  {
    code: "DEN101", name: "Data Entry", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Build speed, accuracy and professionalism for remote data entry work.",
    fullDescription: "Data Entry covers typing accuracy and speed, spreadsheet organisation, data cleaning basics and client communication practices used in remote data entry and back-office work.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Data Entry Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-08-04",
  },
  {
    code: "AIP101", name: "AI Prompt Engineering", academy: ACADEMY,
    pathwayId: "school-ai", category: "Digital Intelligence", pillar: "labs",
    shortDescription: "Master the art of writing effective prompts to get the best results from AI tools.",
    fullDescription: "AI Prompt Engineering teaches learners to design effective prompts for text, image and code-generation AI tools, covering prompt structure, iteration techniques and use cases across freelancing, content and business tasks.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Prompt Engineering Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Familiarity with AI chat tools",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-08-05",
  },
  {
    code: "ACW101", name: "Academic Writing (Freelance)", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Build the skills to earn income writing academic content for clients worldwide.",
    fullDescription: "Academic Writing (Freelance) teaches research, citation, structuring and editing skills for academic assignments, papers and essays, along with the platforms and practices used to find freelance academic writing clients responsibly.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 15,000", certification: "Academic Writing Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Strong research and writing interest",
    "Access to a computer with internet",
    "Commitment to weekly writing assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-08-06",
  },
  {
    code: "TWR101", name: "Technical Writing (Freelance)", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Turn technical writing skills into a freelance income stream.",
    fullDescription: "Technical Writing (Freelance) builds on core technical writing skills with a focus on finding clients, pricing projects and delivering manuals, guides and documentation as a remote freelancer.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 15,000", certification: "Technical Writing Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Basic computer skills",
    "Access to a computer with internet",
    "Commitment to weekly writing assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-08-07",
  },
  {
    code: "TRN101", name: "Transcription", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Build the listening, typing and formatting skills for professional transcription work.",
    fullDescription: "Transcription covers accurate listening, fast typing, formatting standards and quality control used in professional audio and video transcription work for remote clients.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Transcription Certificate",
    entryRequirements: [
    "Good listening and typing skills",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-08-08",
  },
  {
    code: "TUT101", name: "Online Tutoring", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Build the skills to teach and earn income as an online tutor.",
    fullDescription: "Online Tutoring covers lesson planning, using online teaching tools, managing student engagement and building a client base, preparing learners to tutor subjects or languages remotely.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Online Tutoring Certificate",
    entryRequirements: [
    "Subject matter expertise in area to be taught",
    "Basic English proficiency",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-08-09",
  },
  {
    code: "LKD101", name: "LinkedIn Optimization", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Build a compelling LinkedIn presence to attract clients, jobs and opportunities.",
    fullDescription: "LinkedIn Optimization teaches learners to craft a strong profile, grow a relevant network, and use content and outreach strategically to attract freelance clients or job opportunities through LinkedIn.",
    duration: "3 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "LinkedIn Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "A LinkedIn account",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-08-10",
  },
  {
    code: "CVI101", name: "CV & Interview Masterclass", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Build a standout CV and interview with confidence for remote and freelance opportunities.",
    fullDescription: "CV & Interview Masterclass covers writing a results-focused CV, preparing for common interview questions and presenting yourself professionally for remote and freelance roles.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "CV & Interview Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Access to a computer with internet",
    "Commitment to weekly practice sessions"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-08-11",
  },
  {
    code: "FRL101", name: "Proposal Writing", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Learn to write winning proposals for freelance and contract work.",
    fullDescription: "Proposal Writing teaches learners to craft compelling, persuasive proposals for freelance platforms, RFPs and direct client pitches, covering structure, persuasion, pricing and differentiation.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Proposal Writing Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "A marketable skill to offer",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-30",
  },
  {
    code: "FRL102", name: "Client Communication", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Build the communication skills to manage freelance clients professionally.",
    fullDescription: "Client Communication covers setting expectations, progress reporting, handling difficult conversations, scope management and maintaining long-term client relationships for freelance and remote work success.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Client Communication Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Interest in freelancing",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-12-31",
  },
  {
    code: "FRL103", name: "Pricing Your Services", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Learn to price freelance services confidently and profitably.",
    fullDescription: "Pricing Your Services covers hourly vs. fixed pricing, value-based pricing, packaging services, negotiating rates and managing price increases, helping freelancers maximise income without losing clients.",
    duration: "3 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 6,000", certification: "Pricing Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "A marketable skill to offer",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-01",
  },
  {
    code: "FRL104", name: "Agency Building", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Learn to scale from solo freelancer to running a profitable agency.",
    fullDescription: "Agency Building covers hiring and managing contractors, scaling operations, building agency brand, managing multiple clients and transitioning from freelancer to agency owner.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Agency Building Certificate",
    entryRequirements: [
    "Freelancing experience",
    "Basic English proficiency",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-02",
  },
  {
    code: "FRL105", name: "AI for Freelancers", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Leverage AI tools to deliver freelance work faster and at higher quality.",
    fullDescription: "AI for Freelancers teaches practical use of AI tools for content creation, design, coding assistance, research and client communication, helping freelancers increase productivity and expand their service offerings.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "AI for Freelancers Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Some freelancing experience",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-03",
  },
  {
    code: "FRL106", name: "Remote Project Management", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Learn to manage projects and teams effectively in fully remote environments.",
    fullDescription: "Remote Project Management covers async communication, remote team coordination, virtual standups, documentation practices and digital collaboration tools for managing distributed projects and teams.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Remote Project Management Certificate",
    entryRequirements: [
    "Basic project management knowledge",
    "Basic computer literacy",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-04",
  },
  {
    code: "FRL107", name: "Digital Consulting", academy: ACADEMY,
    pathwayId: "freelancing", category: "Freelancing & Remote Work", pillar: "academy",
    shortDescription: "Learn to build and run a digital consulting business.",
    fullDescription: "Digital Consulting covers defining a consulting niche, packaging advisory services, finding and closing clients, delivering value remotely and scaling a consulting practice for sustainable income.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Digital Consulting Certificate",
    entryRequirements: [
    "Professional experience in a field",
    "Basic English proficiency",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-05",
  },
  {
    code: "CVW101", name: "CV Writing", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Learn to craft a professional CV that stands out to employers.",
    fullDescription: "CV Writing teaches learners to structure, format and write a compelling CV and cover letter tailored to different roles and industries, backed by practical feedback and examples.",
    duration: "2 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 5,000", certification: "CV Writing Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-10-01",
  },
  {
    code: "ITP101", name: "Interview Preparation", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Build the skills and confidence to perform well in job interviews.",
    fullDescription: "Interview Preparation covers common interview formats, answering technique, body language and mock interview practice, helping learners walk into any interview with confidence.",
    duration: "3 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 6,000", certification: "Interview Preparation Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Commitment to mock interview practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-10-02",
  },
  {
    code: "EMP101", name: "Employability Skills", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Build the core soft skills employers look for across every industry.",
    fullDescription: "Employability Skills develops communication, teamwork, problem-solving, time management and adaptability — the core soft skills that employers consistently rank as essential across every industry.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 10,000", certification: "Employability Skills Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Commitment to weekly practical exercises"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-10-03",
  },
  {
    code: "WET101", name: "Workplace Ethics", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Understand the professional conduct and ethical standards expected at work.",
    fullDescription: "Workplace Ethics covers professional conduct, confidentiality, conflict of interest, workplace diversity and ethical decision-making, preparing learners to navigate real workplace situations responsibly.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Workplace Ethics Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-10-04",
  },
  {
    code: "CRD102", name: "ATS CV Writing", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Learn to write CVs that pass Applicant Tracking Systems and reach recruiters.",
    fullDescription: "ATS CV Writing teaches learners to format and optimise CVs for Applicant Tracking Systems, covering keyword optimisation, formatting rules, parsing-friendly layouts and tailoring CVs for specific job postings.",
    duration: "2 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 5,000", certification: "ATS CV Writing Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Access to a computer with internet",
    "Commitment to practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-06",
  },
  {
    code: "CRD103", name: "Cover Letter Writing", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Learn to write compelling cover letters that get you noticed.",
    fullDescription: "Cover Letter Writing teaches the structure, tone and strategy behind effective cover letters, helping learners craft personalised, persuasive letters for different roles and industries.",
    duration: "2 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 5,000", certification: "Cover Letter Writing Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Access to a computer with internet",
    "Commitment to practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-07",
  },
  {
    code: "CRD104", name: "Technical Interview Prep", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Prepare for technical interviews at leading technology companies.",
    fullDescription: "Technical Interview Prep covers data structures, algorithms, system design, coding challenges and behavioural interviews, with mock interview practice and strategy for technical roles at tech companies.",
    duration: "6 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Technical Interview Readiness Certificate",
    entryRequirements: [
    "Programming experience",
    "Basic computer science knowledge",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-08",
  },
  {
    code: "CRD105", name: "Portfolio Development", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Build a professional portfolio that showcases your skills and wins opportunities.",
    fullDescription: "Portfolio Development teaches learners to curate, structure and present their work in a compelling portfolio, covering case studies, project descriptions, visual presentation and online portfolio platforms.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Portfolio Development Certificate",
    entryRequirements: [
    "Some completed work or projects",
    "Basic English literacy",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-09",
  },
  {
    code: "CRD106", name: "Executive Communication", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Develop the communication skills for senior and executive-level roles.",
    fullDescription: "Executive Communication covers board-level presentations, strategic messaging, stakeholder management, media communication and executive presence, preparing leaders for senior communication demands.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 18,000", certification: "Executive Communication Certificate",
    entryRequirements: [
    "Management or leadership experience",
    "Strong English proficiency",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-10",
  },
  {
    code: "CRD107", name: "Career Planning", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Learn to plan and navigate a fulfilling, strategic career path.",
    fullDescription: "Career Planning covers self-assessment, career mapping, skill gap analysis, industry research and long-term career strategy, helping learners make intentional, informed career decisions.",
    duration: "4 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Career Planning Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in strategic career planning",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-11",
  },
  {
    code: "SAP101", name: "Study Abroad Pathways", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Navigate the full process of applying to study at an international institution.",
    fullDescription: "Study Abroad Pathways covers university selection, application strategies, visa processes, scholarship applications and pre-departure preparation for studying at international institutions.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Study Abroad Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Strong academic record",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-10-05",
  },
  {
    code: "SCH101", name: "Scholarship Application Mastery", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Learn to find and win competitive scholarships for study abroad.",
    fullDescription: "Scholarship Application Mastery covers scholarship search, eligibility analysis, essay writing, recommendation letters and interview preparation for winning competitive scholarships.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Scholarship Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Strong academic record",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-10-06",
  },
  {
    code: "IMD101", name: "International Migration & Diaspora Engagement", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Understand and prepare the documentation required for international visas and immigration.",
    fullDescription: "International Migration & Diaspora Engagement covers visa types, immigration pathways, documentation, diaspora engagement and legal considerations for international migration.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Migration Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-10-07",
  },
  {
    code: "IJR101", name: "International Job Readiness", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Prepare to search for and secure job opportunities in international markets.",
    fullDescription: "International Job Readiness covers international CV writing, job search platforms, work visa requirements, cultural preparation and interview techniques for international employment.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Job Readiness Certificate",
    entryRequirements: [
    "Intermediate English proficiency",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-10-08",
  },
  {
    code: "OEP101", name: "Overseas Employment Preparation", academy: ACADEMY,
    pathwayId: "career", category: "Career Development", pillar: "academy",
    shortDescription: "Prepare thoroughly for the practical realities of working overseas.",
    fullDescription: "Overseas Employment Preparation covers contracts, cultural adaptation, remittance planning, legal rights and practical preparation for working in international environments.",
    duration: "4 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 10,000", certification: "Overseas Employment Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-10-09",
  },
  {
    code: "EDT101", name: "Teaching Methodologies", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Learn modern teaching methodologies for effective classroom and online instruction.",
    fullDescription: "Teaching Methodologies covers contemporary pedagogical approaches including active learning, differentiated instruction, inquiry-based learning and flipped classroom models for effective teaching across diverse settings.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 16,000", certification: "Teaching Methodologies Certificate",
    entryRequirements: [
    "Teaching experience or interest in education",
    "Basic English literacy",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2027-01-12",
  },
  {
    code: "EDT102", name: "Online Teaching", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Learn to design and deliver engaging online lessons for remote learners.",
    fullDescription: "Online Teaching covers virtual classroom setup, lesson planning for online delivery, student engagement techniques, assessment online and using digital teaching platforms effectively.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Online Teaching Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Teaching experience or interest",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-13",
  },
  {
    code: "EDT103", name: "Classroom Management", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Build the skills to manage classrooms effectively and create positive learning environments.",
    fullDescription: "Classroom Management covers behaviour management, establishing routines, creating positive classroom culture, conflict resolution and engagement strategies for maintaining productive learning environments.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Classroom Management Certificate",
    entryRequirements: [
    "Teaching experience or interest",
    "Basic English literacy",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-14",
  },
  {
    code: "EDT104", name: "Curriculum Development", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Learn to design effective curricula for schools, training and online courses.",
    fullDescription: "Curriculum Development covers curriculum design principles, learning outcome mapping, content sequencing, alignment with standards and curriculum evaluation for formal and informal education settings.",
    duration: "10 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 20,000", certification: "Curriculum Development Certificate",
    entryRequirements: [
    "Teaching or training experience",
    "Basic English literacy",
    "Commitment to intensive assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-15",
  },
  {
    code: "EDT105", name: "Assessment Strategies", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Learn to design fair, effective assessments that measure real learning.",
    fullDescription: "Assessment Strategies covers formative and summative assessment design, rubric development, authentic assessment, feedback strategies and data-driven assessment improvement for educators.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Assessment Strategies Certificate",
    entryRequirements: [
    "Teaching experience or interest",
    "Basic English literacy",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-16",
  },
  {
    code: "EDT106", name: "Educational Leadership", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Develop the leadership skills to lead schools and educational institutions.",
    fullDescription: "Educational Leadership covers school leadership, staff development, educational policy, stakeholder management and institutional improvement strategies for current and aspiring education leaders.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Advanced", language: "English",
    fees: "KES 20,000", certification: "Educational Leadership Certificate",
    entryRequirements: [
    "Teaching or leadership experience",
    "Basic English literacy",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-17",
  },
  {
    code: "EDT107", name: "Instructional Design", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Learn to design effective, engaging learning experiences and materials.",
    fullDescription: "Instructional Design covers learning theory, needs analysis, instructional design models (ADDIE, SAM), storyboarding, multimedia learning principles and evaluation for creating effective training and learning materials.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "Instructional Design Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in learning design",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-18",
  },
  {
    code: "EDT108", name: "AI for Educators", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Learn to use AI tools to enhance teaching, assessment and lesson planning.",
    fullDescription: "AI for Educators introduces practical AI tools for lesson planning, content creation, assessment design, personalised learning and administrative efficiency, helping educators integrate AI into their teaching practice.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "AI for Educators Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Teaching experience or interest",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-19",
  },
  {
    code: "EDT109", name: "Inclusive Education", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Learn to create inclusive learning environments for diverse learners.",
    fullDescription: "Inclusive Education covers differentiation, universal design for learning, supporting learners with special needs, cultural inclusion and creating accessible learning materials for diverse classrooms.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 14,000", certification: "Inclusive Education Certificate",
    entryRequirements: [
    "Teaching experience or interest",
    "Basic English literacy",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-20",
  },
  {
    code: "EDT110", name: "EdTech Tools", academy: ACADEMY,
    pathwayId: "education-teaching-excellence", category: "Education & Teaching Excellence", pillar: "academy",
    shortDescription: "Master the digital tools transforming modern education.",
    fullDescription: "EdTech Tools covers learning management systems, interactive whiteboards, assessment platforms, student response systems and collaboration tools, helping educators select and use technology to enhance teaching and learning.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "EdTech Tools Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Teaching experience or interest",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-21",
  },
  {
    code: "HSP101", name: "Hospitality Management", academy: ACADEMY,
    pathwayId: "health-hospitality-community", category: "Health, Hospitality & Community Development", pillar: "academy",
    shortDescription: "Learn the fundamentals of managing hotels, restaurants and hospitality operations.",
    fullDescription: "Hospitality Management covers front office operations, housekeeping management, food and beverage service, guest relations and hospitality business operations for hotels, restaurants and tourism establishments.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Hospitality Management Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in hospitality",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2027-01-22",
  },
  {
    code: "HSP102", name: "Tourism Management", academy: ACADEMY,
    pathwayId: "health-hospitality-community", category: "Health, Hospitality & Community Development", pillar: "academy",
    shortDescription: "Learn to manage and promote tourism businesses and destinations.",
    fullDescription: "Tourism Management covers tour operations, destination marketing, sustainable tourism, visitor experience design and tourism policy, preparing learners for roles in Kenya's growing tourism sector.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Tourism Management Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in tourism",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-23",
  },
  {
    code: "HSP103", name: "Caregiving", academy: ACADEMY,
    pathwayId: "health-hospitality-community", category: "Health, Hospitality & Community Development", pillar: "academy",
    shortDescription: "Build the skills to provide professional care for the elderly, ill and vulnerable.",
    fullDescription: "Caregiving covers personal care, safety, nutrition, medication management, emotional support and professional ethics for providing compassionate care to elderly, ill or vulnerable individuals.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Caregiving Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Compassion and patience",
    "Commitment to practical training"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-24",
  },
  {
    code: "HSP104", name: "Nutrition", academy: ACADEMY,
    pathwayId: "health-hospitality-community", category: "Health, Hospitality & Community Development", pillar: "academy",
    shortDescription: "Learn the fundamentals of nutrition for personal and community health.",
    fullDescription: "Nutrition covers macronutrients, micronutrients, balanced diet planning, nutrition across life stages, dietary requirements and community nutrition for personal wellbeing and professional practice.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Nutrition Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in health and nutrition",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-25",
  },
  {
    code: "HSP105", name: "Food Safety", academy: ACADEMY,
    pathwayId: "health-hospitality-community", category: "Health, Hospitality & Community Development", pillar: "academy",
    shortDescription: "Learn essential food safety practices for hospitality and food service.",
    fullDescription: "Food Safety covers food hygiene, safe food handling, HACCP principles, contamination prevention and food safety regulations for restaurants, hotels and food service operations.",
    duration: "4 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Food Safety Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in food service",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-26",
  },
  {
    code: "HSP106", name: "Community Health", academy: ACADEMY,
    pathwayId: "health-hospitality-community", category: "Health, Hospitality & Community Development", pillar: "academy",
    shortDescription: "Learn to promote health and wellbeing in communities.",
    fullDescription: "Community Health covers public health fundamentals, health promotion, disease prevention, community health assessment and health education for improving health outcomes in communities.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 12,000", certification: "Community Health Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in community health",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-27",
  },
  {
    code: "HSP107", name: "Event Management", academy: ACADEMY,
    pathwayId: "health-hospitality-community", category: "Health, Hospitality & Community Development", pillar: "academy",
    shortDescription: "Learn to plan, organise and deliver successful events.",
    fullDescription: "Event Management covers event planning, budgeting, venue selection, vendor management, marketing, logistics and post-event evaluation for conferences, weddings, corporate events and community gatherings.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "Event Management Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in event planning",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-28",
  },
  {
    code: "CUS101", name: "Customer Service Excellence", academy: ACADEMY,
    pathwayId: "health-hospitality-community", category: "Health, Hospitality & Community Development", pillar: "academy",
    shortDescription: "Build the skills to deliver excellent, professional customer experiences.",
    fullDescription: "Customer Service Excellence covers communication, problem resolution, customer engagement, service recovery and professional conduct for delivering outstanding customer service.",
    duration: "6 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 10,000", certification: "Customer Service Certificate",
    entryRequirements: [
    "Basic English proficiency",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-07-15",
  },
  {
    code: "PDS101", name: "Emotional Intelligence", academy: ACADEMY,
    pathwayId: "personal-development-life-skills", category: "Personal Development & Life Skills", pillar: "academy",
    shortDescription: "Develop self-awareness, empathy and emotional regulation for personal and professional success.",
    fullDescription: "Emotional Intelligence covers self-awareness, self-regulation, empathy, social skills and motivation, helping learners understand and manage emotions for better relationships, leadership and wellbeing.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Emotional Intelligence Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in personal growth",
    "Commitment to self-reflection"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2027-01-29",
  },
  {
    code: "PDS102", name: "Critical Thinking", academy: ACADEMY,
    pathwayId: "personal-development-life-skills", category: "Personal Development & Life Skills", pillar: "academy",
    shortDescription: "Learn to think clearly, analyse arguments and make better decisions.",
    fullDescription: "Critical Thinking covers logical reasoning, argument analysis, cognitive biases, evidence evaluation and decision-making frameworks, helping learners think clearly and make better decisions in all areas of life.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Critical Thinking Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in analytical thinking",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-30",
  },
  {
    code: "PDS103", name: "Creativity & Innovation", academy: ACADEMY,
    pathwayId: "personal-development-life-skills", category: "Personal Development & Life Skills", pillar: "academy",
    shortDescription: "Unlock your creative potential and learn to generate innovative ideas.",
    fullDescription: "Creativity & Innovation covers creative thinking techniques, ideation methods, overcoming creative blocks, design thinking basics and building a creative mindset for personal and professional innovation.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Creativity & Innovation Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Openness to new ideas",
    "Commitment to weekly exercises"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-01-31",
  },
  {
    code: "PDS104", name: "Productivity & Time Management", academy: ACADEMY,
    pathwayId: "personal-development-life-skills", category: "Personal Development & Life Skills", pillar: "academy",
    shortDescription: "Learn to manage time, prioritise effectively and get more of the right things done.",
    fullDescription: "Productivity & Time Management covers prioritisation frameworks, time blocking, habit formation, focus techniques, digital productivity tools and overcoming procrastination for personal and professional effectiveness.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Productivity Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Desire to improve productivity",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-02-01",
  },
  {
    code: "PDS105", name: "Goal Setting", academy: ACADEMY,
    pathwayId: "personal-development-life-skills", category: "Personal Development & Life Skills", pillar: "academy",
    shortDescription: "Learn to set, plan and achieve meaningful personal and professional goals.",
    fullDescription: "Goal Setting covers SMART goals, OKRs, vision mapping, action planning, accountability systems and overcoming obstacles, helping learners turn aspirations into achievable, measurable goals.",
    duration: "3 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 6,000", certification: "Goal Setting Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Desire to achieve meaningful goals",
    "Commitment to weekly exercises"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-02-02",
  },
  {
    code: "PDS106", name: "Personal Branding", academy: ACADEMY,
    pathwayId: "personal-development-life-skills", category: "Personal Development & Life Skills", pillar: "academy",
    shortDescription: "Learn to build and communicate a compelling personal brand.",
    fullDescription: "Personal Branding covers defining your brand identity, online presence, content strategy, professional image, networking and communicating your unique value for career and business opportunities.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 10,000", certification: "Personal Branding Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in personal growth",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-02-03",
  },
  {
    code: "PDS107", name: "Problem Solving", academy: ACADEMY,
    pathwayId: "personal-development-life-skills", category: "Personal Development & Life Skills", pillar: "academy",
    shortDescription: "Learn structured problem-solving techniques for work and life.",
    fullDescription: "Problem Solving covers problem definition, root cause analysis, solution generation, decision matrices, implementation planning and evaluation, equipping learners with practical techniques for any challenge.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Problem Solving Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in analytical thinking",
    "Commitment to weekly assignments"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2027-02-04",
  },
  {
    code: "CQI101", name: "Cultural Intelligence", academy: ACADEMY,
    pathwayId: "personal-development-life-skills", category: "Personal Development & Life Skills", pillar: "academy",
    shortDescription: "Build the skills to work and communicate effectively across cultures.",
    fullDescription: "Cultural Intelligence develops the awareness and skills to work effectively across cultures, covering cultural dimensions, communication styles and strategies for bridging cultural gaps.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Cultural Intelligence Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in intercultural communication",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-10-06",
  },
  {
    code: "GBC101", name: "Global Citizenship", academy: ACADEMY,
    pathwayId: "personal-development-life-skills", category: "Personal Development & Life Skills", pillar: "academy",
    shortDescription: "Explore the responsibilities and opportunities of engaging as a global citizen.",
    fullDescription: "Global Citizenship explores the concept of global citizenship, covering global interdependence, sustainable development goals, civic engagement and the responsibilities of being a global citizen.",
    duration: "4 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 8,000", certification: "Global Citizenship Certificate",
    entryRequirements: [
    "Basic English literacy",
    "Interest in global issues",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-10-07",
  },
  {
    code: "ML101", name: "Machine Learning", academy: ACADEMY,
    pathwayId: "school-ai", category: "Digital Intelligence", pillar: "labs",
    shortDescription: "Learn to build and evaluate machine learning models using real datasets.",
    fullDescription: "Machine Learning covers supervised and unsupervised learning, model evaluation, feature engineering and deployment basics, using Python and popular ML libraries.",
    duration: "12 Weeks", studyMode: "Online", level: "Advanced", language: "English",
    fees: "KES 28,000", certification: "Machine Learning Certificate",
    entryRequirements: [
    "Python programming proficiency",
    "Basic statistics and mathematics",
    "Access to a computer with internet",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-14",
  },
  {
    code: "JAV101", name: "Java Programming", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Build a strong foundation in Java for enterprise software and Android development.",
    fullDescription: "Java Programming covers object-oriented programming, data structures, exception handling and basic enterprise patterns, building a strong foundation in one of the most widely used programming languages.",
    duration: "12 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 20,000", certification: "Java Programming Certificate",
    entryRequirements: [
    "Basic programming knowledge",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-09",
  },
  {
    code: "JSC101", name: "JavaScript Programming", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Master JavaScript, the essential language of the interactive web.",
    fullDescription: "JavaScript Programming covers DOM manipulation, events, async programming, APIs and modern ES6+ features, building the skills needed for modern web development.",
    duration: "10 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "JavaScript Programming Certificate",
    entryRequirements: [
    "Basic programming knowledge",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-10",
  },
  {
    code: "REA101", name: "React Development", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Build modern, component-based web applications with React.",
    fullDescription: "React Development covers components, hooks, state management, routing and API integration, building the skills to create modern single-page applications with React.",
    duration: "10 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "React Development Certificate",
    entryRequirements: [
    "JavaScript proficiency",
    "Basic HTML and CSS",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-11",
  },
  {
    code: "WEB101", name: "Web Development", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Learn HTML, CSS, and JavaScript to build your first responsive websites.",
    fullDescription: "Web Development covers HTML5, CSS3, responsive design, basic JavaScript and deployment, giving learners the skills to build and publish modern websites from scratch.",
    duration: "10 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 16,000", certification: "Web Development Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-12",
  },
  {
    code: "MOB101", name: "Mobile App Development", academy: ACADEMY,
    pathwayId: "school-software-engineering", category: "Software & Digital Systems", pillar: "labs",
    shortDescription: "Design and build mobile applications for Android and iOS.",
    fullDescription: "Mobile App Development covers cross-platform development with React Native, covering UI components, navigation, state management, API integration and deployment to app stores.",
    duration: "10 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 20,000", certification: "Mobile Development Certificate",
    entryRequirements: [
    "JavaScript proficiency",
    "Basic React knowledge",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-13",
  },
  {
    code: "CLD101", name: "Cloud Computing", academy: ACADEMY,
    pathwayId: "school-cloud-devops", category: "Cloud, Infrastructure & DevOps", pillar: "labs",
    shortDescription: "Learn to deploy, manage and secure applications on modern cloud platforms.",
    fullDescription: "Cloud Computing covers cloud architecture, deployment models, scaling, security and cost management across AWS and Azure, building practical cloud infrastructure skills.",
    duration: "10 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 22,000", certification: "Cloud Computing Certificate",
    entryRequirements: [
    "Basic networking knowledge",
    "Basic Linux familiarity",
    "Access to a computer with internet",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-18",
  },
  {
    code: "NET101", name: "Networking (CCNA)", academy: ACADEMY,
    pathwayId: "school-cloud-devops", category: "Cloud, Infrastructure & DevOps", pillar: "labs",
    shortDescription: "Build practical networking skills and prepare for the Cisco CCNA certification.",
    fullDescription: "Networking (CCNA) covers network fundamentals, IP addressing, routing, switching, security and troubleshooting, preparing learners for the Cisco CCNA certification exam.",
    duration: "12 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 24,000", certification: "CCNA Readiness Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-19",
  },
  {
    code: "LNX101", name: "Linux Administration", academy: ACADEMY,
    pathwayId: "school-cloud-devops", category: "Cloud, Infrastructure & DevOps", pillar: "labs",
    shortDescription: "Build practical skills in managing and administering Linux systems.",
    fullDescription: "Linux Administration covers installation, file systems, user management, permissions, process management, networking and shell scripting for managing Linux servers.",
    duration: "8 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 18,000", certification: "Linux Administration Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic command line familiarity",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-20",
  },
  {
    code: "CYB201", name: "Cybersecurity Fundamentals", academy: ACADEMY,
    pathwayId: "school-cybersecurity", category: "Cybersecurity & Digital Safety", pillar: "labs",
    shortDescription: "Build foundational skills in network security, threat detection and incident response.",
    fullDescription: "Cybersecurity Fundamentals covers network security principles, threat detection, vulnerability assessment, incident response and security operations for protecting systems and data.",
    duration: "10 Weeks", studyMode: "Online", level: "Intermediate", language: "English",
    fees: "KES 22,000", certification: "Cybersecurity Certificate",
    entryRequirements: [
    "Basic networking knowledge",
    "Basic computer literacy",
    "Access to a computer with internet",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-17",
  },
  {
    code: "DSC101", name: "Data Science", academy: ACADEMY,
    pathwayId: "school-data-science", category: "Data, Analytics & Intelligent Systems", pillar: "labs",
    shortDescription: "Analyse, visualise and draw insight from data using modern data science tools.",
    fullDescription: "Data Science covers data cleaning, exploratory analysis, visualisation, statistical methods and introductory machine learning using Python, Pandas and visualisation libraries.",
    duration: "12 Weeks", studyMode: "Online", level: "Advanced", language: "English",
    fees: "KES 26,000", certification: "Data Science Certificate",
    entryRequirements: [
    "Python programming proficiency",
    "Basic statistics and mathematics",
    "Access to a computer with internet",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-06-15",
  },
  {
    code: "SQL101", name: "SQL & Database Management", academy: ACADEMY,
    pathwayId: "school-data-science", category: "Data, Analytics & Intelligent Systems", pillar: "labs",
    shortDescription: "Learn to design, query and manage relational databases using SQL.",
    fullDescription: "SQL & Database Management covers database design, normalisation, SQL queries, joins, aggregation, indexing and basic database administration for managing data effectively.",
    duration: "8 Weeks", studyMode: "Online", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "SQL Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-06-16",
  },
  {
    code: "ELE201", name: "Electrical Engineering", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Build a strong foundation in electrical engineering theory and application.",
    fullDescription: "Electrical Engineering covers circuit analysis, electrical machines, power systems and electrical safety, building a strong foundation in electrical engineering theory and practice.",
    duration: "16 Weeks", studyMode: "Physical / Hybrid", level: "Advanced", language: "English",
    fees: "KES 26,000", certification: "Electrical Engineering Certificate",
    entryRequirements: [
    "Strong mathematics and physics background",
    "Basic English literacy",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-09-01",
  },
  {
    code: "ELC101", name: "Electronics Engineering", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Explore the design and analysis of electronic circuits and systems.",
    fullDescription: "Electronics Engineering covers analog and digital circuits, semiconductor devices, signal processing and PCB design for building and analysing electronic systems.",
    duration: "16 Weeks", studyMode: "Physical / Hybrid", level: "Advanced", language: "English",
    fees: "KES 26,000", certification: "Electronics Engineering Certificate",
    entryRequirements: [
    "Strong mathematics and physics background",
    "Basic English literacy",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-09-02",
  },
  {
    code: "PLC101", name: "PLC Programming", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Learn to program Programmable Logic Controllers used in industrial automation.",
    fullDescription: "PLC Programming covers ladder logic, function block diagrams, PLC hardware, HMI integration and industrial communication protocols for automation control systems.",
    duration: "10 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 22,000", certification: "PLC Programming Certificate",
    entryRequirements: [
    "Basic electrical or electronics background",
    "Basic English literacy",
    "Willingness to undertake practical training"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-09-03",
  },
  {
    code: "CAD101", name: "AutoCAD", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Master computer-aided design for engineering and architectural drawings.",
    fullDescription: "AutoCAD covers 2D drafting, 3D modelling, dimensions, annotations, layouts and plotting, building practical CAD skills for engineering and architecture.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 18,000", certification: "AutoCAD Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic mathematics background",
    "Access to a computer with AutoCAD installed",
    "Commitment to weekly practice"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-09-04",
  },
  {
    code: "CIV101", name: "Civil Engineering Basics", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Build a foundational understanding of civil engineering principles and construction.",
    fullDescription: "Civil Engineering Basics covers surveying, construction materials, structural analysis, hydraulics and project management for civil engineering projects.",
    duration: "16 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 26,000", certification: "Civil Engineering Certificate",
    entryRequirements: [
    "Strong mathematics and physics background",
    "Basic English literacy",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-09-05",
  },
  {
    code: "MEC101", name: "Mechanical Engineering", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Explore the fundamentals of mechanical systems, materials and design.",
    fullDescription: "Mechanical Engineering covers thermodynamics, fluid mechanics, materials science, machine design and manufacturing processes for mechanical systems.",
    duration: "16 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 26,000", certification: "Mechanical Engineering Certificate",
    entryRequirements: [
    "Strong mathematics and physics background",
    "Basic English literacy",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-09-06",
  },
  {
    code: "MTR101", name: "Mechatronics", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Combine mechanical, electronic and computing skills to build smart systems.",
    fullDescription: "Mechatronics introduces the integration of mechanical systems, electronics and computing, covering sensors, actuators, microcontrollers and control programming for smart devices.",
    duration: "12 Weeks", studyMode: "Physical / Hybrid", level: "Advanced", language: "English",
    fees: "KES 24,000", certification: "Mechatronics Certificate",
    entryRequirements: [
    "Basic electronics and programming background",
    "Basic English literacy",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-09-07",
  },
  {
    code: "ROB101", name: "Robotics", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Design, build and program robots from the ground up.",
    fullDescription: "Robotics covers robot kinematics, sensors, actuators, microcontroller programming and robot operating systems for building autonomous and remote-controlled robots.",
    duration: "12 Weeks", studyMode: "Physical / Hybrid", level: "Advanced", language: "English",
    fees: "KES 28,000", certification: "Robotics Certificate",
    entryRequirements: [
    "Basic programming and electronics background",
    "Basic English literacy",
    "Commitment to intensive study"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: true, createdAt: "2026-09-08",
  },
  {
    code: "IAT101", name: "Industrial Automation", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Learn to design and manage automated systems for modern manufacturing.",
    fullDescription: "Industrial Automation covers sensors, actuators, control systems and industrial networking used to automate manufacturing and processing lines, preparing learners for roles in modern industrial facilities.",
    duration: "12 Weeks", studyMode: "Physical / Hybrid", level: "Intermediate", language: "English",
    fees: "KES 24,000", certification: "Industrial Automation Certificate",
    entryRequirements: [
    "Basic electrical or electronics background",
    "Basic English literacy",
    "Willingness to undertake practical training"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-09-09",
  },
  {
    code: "IOT101", name: "IoT Fundamentals", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Build connected devices using Internet of Things (IoT) technology.",
    fullDescription: "IoT Fundamentals covers IoT architecture, sensors, microcontrollers, wireless protocols, cloud integration and data visualisation for building connected IoT devices and systems.",
    duration: "8 Weeks", studyMode: "Hybrid", level: "Intermediate", language: "English",
    fees: "KES 20,000", certification: "IoT Certificate",
    entryRequirements: [
    "Basic programming and electronics background",
    "Basic English literacy",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-09-10",
  },
  {
    code: "TDP101", name: "3D Printing", academy: ACADEMY,
    pathwayId: "school-engineering-innovation", category: "Engineering, Automation & Innovation", pillar: "labs",
    shortDescription: "Learn 3D modelling and printing from design to finished product.",
    fullDescription: "3D Printing covers 3D modelling basics, slicer software, printer setup, calibration, material selection and post-processing for creating physical objects from digital designs.",
    duration: "6 Weeks", studyMode: "Hybrid", level: "Beginner", language: "English",
    fees: "KES 14,000", certification: "3D Printing Certificate",
    entryRequirements: [
    "Basic computer literacy",
    "Basic English literacy",
    "Access to a computer with internet"
  ],
    instructor: { name: "To be announced", bio: "Instructor details will be confirmed before intake." },
    brochureUrl: '#', calendarUrl: '#', featuredImage: null,
    featured: false, createdAt: "2026-09-11",
  },
];

// ── V3: migrate base courses, merge new, filter archived ─────

/**
 * Merge order matters: the first occurrence of a course code wins.
 * Order is: base catalogue → Labs (cloudCourses, aiCourses, etc.) →
 * Labs track courses (newCourses) → new Academy → expansion Academy.
 *
 * If two files ever define the same code, the earlier one is kept and
 * the later one is dropped. In dev, the collision is logged so it can
 * be fixed at the source instead of being silently swallowed.
 */
function dedupeByCode(courses) {
  const seen = new Set();
  const dropped = [];
  const result = [];
  for (const c of courses) {
    if (!c || !c.code) continue;
    if (seen.has(c.code)) {
      dropped.push(c.code);
      continue;
    }
    seen.add(c.code);
    result.push(c);
  }
  return { result, dropped };
}

const _MERGED = migrateCourses([
  ..._BASE_COURSES,
  ...NEW_LABS_COURSES,
  ...NEW_LABS_TRACK_COURSES,
  ...NEW_ACADEMY_COURSES,
  ...EXPANSION_ACADEMY_COURSES,
]);

const _FILTERED = filterArchived(_MERGED);

const { result: _COURSES_DEDUPED, dropped: _DROPPED_CODES } = dedupeByCode(_FILTERED);

if (import.meta.env?.DEV && _DROPPED_CODES.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    '[programmeData] Duplicate course codes dropped (fix at source):',
    [...new Set(_DROPPED_CODES)]
  );
}

// Normalize publication/access state once so every page (including consumers
// that use raw catalogue rows rather than buildCourseData) sees the same policy.
// Only courses with an actual structured curriculum are owner-authorised here.
export const COURSES = _COURSES_DEDUPED.map((course) => {
  const ownerAuthorized = OWNER_AUTHORIZED_COURSE_CODES.has(String(course.code || '').toUpperCase());
  return {
    ...course,
    listedStudyMode: course.studyMode || null,
    studyMode: ownerAuthorized ? 'Self-paced online' : course.studyMode,
    ownerAuthorizedForPublication: ownerAuthorized,
    enrollmentOpen: ownerAuthorized,
    selfPacedAvailable: ownerAuthorized,
    publicationStatus: ownerAuthorized ? 'owner-authorized' : 'draft',
    independentAcademicReviewStatus: 'pending',
    externalAccreditationStatus: 'not-claimed',
    fixedCohortStatus: 'not-confirmed',
  };
});

export const PROGRAMMES = COURSES;

export const INTAKES = ['January', 'March', 'May', 'September', 'December'];

export function getProgrammeByCode(code) {
  return COURSES.find((course) => course.code === code) || null;
}

export function getPathwayById(id) {
  return PATHWAYS.find((pathway) => pathway.id === id) || null;
}

export function getPathwayByCourseCode(code) {
  const course = getProgrammeByCode(code);
  return course ? getPathwayById(course.pathwayId) : null;
}

export function getCoursesByPathway(pathwayId) {
  if (!pathwayId) return [];
  return COURSES.filter((course) => course.pathwayId === pathwayId);
}

export function getFeaturedCourses() {
  return COURSES.filter((course) => course.featured);
}

export function parseFee(fees) {
  return Number.parseInt(String(fees).replace(/[^0-9]/g, ''), 10) || 0;
}

export function getAcademyCourses() {
  return COURSES.filter((course) => (course.division || course.pillar || 'academy') === 'academy');
}

export function getLabsCourses() {
  return COURSES.filter((course) => (course.division || course.pillar) === 'labs');
}

export function getAcademyPathways() {
  const pathwayIds = new Set(getAcademyCourses().map((course) => course.pathwayId));
  return PATHWAYS.filter((pathway) => pathwayIds.has(pathway.id));
}

export function getProgramBySlug(slug) {
  return PATHWAYS.find((pathway) => pathway.slug === slug)
    || TRACKS.find((track) => track.slug === slug)
    || null;
}

export function getVisiblePrograms() {
  return PATHWAYS.filter((pathway) => pathway.status === 'active' || pathway.status === 'coming_soon');
}

export function getProgramCourses(programId) {
  return getCoursesByPathway(programId);
}

export function getProgramCourseIds(programId) {
  return getProgramCourses(programId).map((course) => course.code);
}

export function getProgramStudyModes(programId) {
  return [...new Set(getProgramCourses(programId).map((course) => course.studyMode).filter(Boolean))];
}

export function getProgramLevels(programId) {
  return [...new Set(getProgramCourses(programId).map((course) => course.level).filter(Boolean))];
}

export function getProgramDurationSummary(programId) {
  const durations = [...new Set(getProgramCourses(programId).map((course) => course.duration).filter(Boolean))];
  if (durations.length === 0) return null;
  if (durations.length === 1) return durations[0];
  return `${durations[0]} - ${durations[durations.length - 1]}`;
}

export function getProgramCta(program) {
  if (program.status === 'archived') return { label: 'Archived', to: null, disabled: true };
  if (program.status === 'coming_soon') return { label: 'Coming Soon', to: null, disabled: true };
  if (program.status === 'active' && program.admissionStatus === 'open') {
    return { label: 'Apply Now', to: '/apply', disabled: false };
  }
  return { label: 'Explore Courses', to: `/programs/${program.slug}`, disabled: false };
}
