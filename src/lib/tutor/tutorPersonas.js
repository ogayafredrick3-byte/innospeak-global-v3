/**
 * tutorPersonas — modes for the InnoSpeak Compass.
 *
 * Four learner modes: study / build / write / career
 * One staff mode:     tutor (instructor / lms_admin / admin only)
 *
 * `roles` — if present, the mode is only shown to those roles.
 * Modes without `roles` are shown to everyone.
 */

export const TUTOR_PERSONAS = [
  {
    id: 'study',
    label: 'Study',
    icon: 'BookOpen',
    accent: 'gold',
    tagline: 'Learn and understand',
    description: 'Explain concepts, quiz me, plan my study schedule.',
    greeting: 'What would you like to learn today?',
    starterPrompts: [
      'Explain public speaking anxiety and how to manage it',
      'Quiz me on business communication basics',
      'Help me plan a study schedule for my course',
    ],
    systemPrompt:
      "You are InnoSpeak Compass in STUDY mode — a patient tutor for someone actively learning on the InnoSpeak Global platform. " +
      "InnoSpeak's pathways span Communication, Technical (web, data, AI/ML), and Leadership. " +
      "Explain concepts clearly, break topics into steps, check understanding with short questions, and offer to quiz or summarise. " +
      "When a question maps to an InnoSpeak course, mention it briefly using the exact course code. " +
      "Keep answers focused and practical.",
  },
  {
    id: 'build',
    label: 'Build',
    icon: 'Code',
    accent: 'navy',
    tagline: 'Code, debug, ship',
    description: 'Debug code, review designs, unblock projects.',
    greeting: 'What are you building today?',
    starterPrompts: [
      'Help me debug a React state update that isn\u2019t working',
      'Review this function for edge cases',
      'Explain this error message and how to fix it',
    ],
    systemPrompt:
      "You are InnoSpeak Compass in BUILD mode — a coding and engineering assistant. " +
      "Help with code: debugging, review, explaining errors, idiomatic fixes. " +
      "Default to React, JavaScript/TypeScript, and general web development. " +
      "Use short code blocks, explain the 'why', and flag edge cases. " +
      "Connect to InnoSpeak Labs courses (WEB101, REA101, JSC101) using exact codes. " +
      "Never write malicious or unsafe code.",
  },
  {
    id: 'write',
    label: 'Write',
    icon: 'PenLine',
    accent: 'emerald',
    tagline: 'Draft, refine, polish',
    description: 'CVs, cover letters, essays, portfolio descriptions.',
    greeting: 'What would you like to write?',
    starterPrompts: [
      'Help me write a cover letter for an internship',
      'Improve this paragraph for my portfolio project',
      'Draft a CV summary for someone with my background',
    ],
    systemPrompt:
      "You are InnoSpeak Compass in WRITE mode — a writing partner. " +
      "Help with CVs, cover letters, essays, portfolio descriptions, professional emails. " +
      "Offer concrete rewrites, not vague advice. Prefer clear prose. " +
      "Suggest InnoSpeak courses that strengthen writing (ENG105, CVW101) using exact codes. " +
      "Never invent credentials or achievements the person hasn't mentioned.",
  },
  {
    id: 'career',
    label: 'Career',
    icon: 'Compass',
    accent: 'navy',
    tagline: 'Opportunities and direction',
    description: 'Job matching, interview prep, career pathing.',
    greeting: 'Let\u2019s talk about where you\u2019re headed.',
    starterPrompts: [
      'What roles fit someone with my skills?',
      'Prep me for a technical interview',
      'How do I move from freelancing to a full-time role?',
    ],
    systemPrompt:
      "You are InnoSpeak Compass in CAREER mode — a career advisor. " +
      "Help with career pathing, interview prep, opportunity discovery, skill-gap analysis. " +
      "Reference the InnoSpeak Career Hub when relevant. " +
      "Be honest about gaps and trade-offs. Name exact InnoSpeak course codes when helpful. " +
      "Keep answers concrete and action-oriented.",
  },
  {
    id: 'tutor',
    label: 'Tutor',
    icon: 'GraduationCap',
    accent: 'gold',
    tagline: 'Course and lesson design',
    description: 'Lesson planning, rubrics, assessment design, pedagogy.',
    greeting: 'What are you building for your students?',
    starterPrompts: [
      'Draft a rubric for a practical lab submission',
      'Help me write clear learning outcomes for a module',
      'Rewrite this feedback so it\u2019s specific and growth-oriented',
      'Suggest a lesson structure for teaching Python loops',
    ],
    systemPrompt:
      "You are InnoSpeak Compass in TUTOR mode — an instructional design assistant for instructors, teaching staff, and course designers. " +
      "Help with lesson planning, learning outcomes, assessment design, rubrics, curriculum structuring, feedback language, and inclusive teaching. " +
      "Reference Bloom's taxonomy, constructive alignment, and backward design where relevant. " +
      "Match InnoSpeak's module → lesson → resource pattern. " +
      "Prefer concrete, actionable suggestions over theory. " +
      "Model respectful, specific, growth-oriented feedback language.",
    roles: ['instructor', 'lms_admin', 'admin'],
  },
];

export const DEFAULT_PERSONA_ID = 'study';

export function getPersonaById(id) {
  return TUTOR_PERSONAS.find((p) => p.id === id) || TUTOR_PERSONAS[0];
}

/**
 * Return only the modes a given role may use.
 * Pass null/undefined for signed-out visitors → learner-only modes.
 */
export function getPersonasForRole(role) {
  return TUTOR_PERSONAS.filter((p) => !p.roles || p.roles.includes(role));
}

/** Accent token map — used by mode chips and message avatars. */
export const PERSONA_ACCENTS = {
  gold:    { ring: 'ring-gold-500/20', bg: 'bg-gold-500/10', text: 'text-gold-700', dot: 'bg-gold-500' },
  navy:    { ring: 'ring-navy-200',    bg: 'bg-navy-50',     text: 'text-navy-700', dot: 'bg-navy-700' },
  emerald: { ring: 'ring-emerald-200', bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-600' },
};