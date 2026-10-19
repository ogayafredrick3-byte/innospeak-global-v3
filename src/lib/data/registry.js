/**
 * registry — canonical groupings for Academy (Pathways) and Labs (Tracks).
 */

export const DIVISIONS = Object.freeze({
  ACADEMY: 'academy',
  LABS: 'labs',
  FOUNDATION: 'foundation',
});

export const PATHWAYS = [
  { id: 'english-communication', code: 'ACP-ENG', slug: 'english-communication',
    title: 'English & Communication Pathway',
    shortDescription: 'Professional and academic English, communication and writing skills.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'world-languages', code: 'ACP-WLD', slug: 'world-languages',
    title: 'World Languages Pathway',
    shortDescription: 'Practical language skills for travel, career and cross-cultural work.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'international-qualifications', code: 'ACP-IQU', slug: 'international-qualifications',
    title: 'International Qualifications Pathway',
    shortDescription: 'Preparation for internationally recognised exams and university admission.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-01-21' },

  { id: 'kenya-curriculum-tvet', code: 'ACP-KCV', slug: 'kenya-curriculum-tvet',
    title: 'Kenya Curriculum & TVET Pathway',
    shortDescription: 'CBE Grade 3–12, TVET, Artisan, Craft and Diploma support.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'digital-skills-productivity', code: 'ACP-DSP', slug: 'digital-skills-productivity',
    title: 'Digital Skills & Productivity Pathway',
    shortDescription: 'Foundational digital skills, AI literacy and productivity tools.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'creative-design-media', code: 'ACP-CDM', slug: 'creative-design-media',
    title: 'Creative Design & Media Pathway',
    shortDescription: 'Visual, video, motion and multimedia production skills.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'business-entrepreneurship', code: 'ACP-BUS', slug: 'business-entrepreneurship',
    title: 'Business & Entrepreneurship Pathway',
    shortDescription: 'Management, entrepreneurship and leadership skills.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'freelancing-remote-work', code: 'ACP-FRW', slug: 'freelancing-remote-work',
    title: 'Freelancing & Remote Work Pathway',
    shortDescription: 'In-demand digital skills to work independently from anywhere.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'career-global', code: 'ACP-CGO', slug: 'career-global',
    title: 'Career & Global Opportunities Pathway',
    shortDescription: 'CV, interview, migration and international career preparation.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'education-teaching-training', code: 'ACP-ETT', slug: 'education-teaching-training',
    title: 'Education, Teaching & Training Pathway',
    shortDescription: 'Teaching, training, curriculum design and EdTech for educators.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'health-hospitality-community', code: 'ACP-HHC', slug: 'health-hospitality-community',
    title: 'Health, Hospitality & Community Pathway',
    shortDescription: 'Hospitality, tourism, health and community-development skills.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },

  { id: 'personal-life-skills', code: 'ACP-PLS', slug: 'personal-life-skills',
    title: 'Personal & Life Skills Pathway',
    shortDescription: 'Emotional intelligence, critical thinking, resilience and life skills.',
    division: 'academy', status: 'active', admissionStatus: 'open',
    programVersion: '3.0', curriculumVersion: '2026.1', reviewDate: '2027-09-01' },
];

export const TRACKS = [
  { id: 'software-engineering', code: 'LT-SWE', slug: 'software-engineering',
    title: 'Software Engineering Track',
    shortDescription: 'Full-stack development, programming languages and software projects.',
    division: 'labs', status: 'active', admissionStatus: 'open',
    trackVersion: '3.0', reviewDate: '2027-09-01' },

  { id: 'data-analytics', code: 'LT-DAT', slug: 'data-analytics',
    title: 'Data & Analytics Track',
    shortDescription: 'Excel, SQL, Power BI, Data Science and Data Engineering.',
    division: 'labs', status: 'active', admissionStatus: 'open',
    trackVersion: '3.0', reviewDate: '2027-09-01' },

  { id: 'ai-intelligent-systems', code: 'LT-AIS', slug: 'ai-intelligent-systems',
    title: 'AI & Intelligent Systems Track',
    shortDescription: 'AI literacy, AI Agents, Machine Learning and applied AI systems.',
    division: 'labs', status: 'active', admissionStatus: 'open',
    trackVersion: '3.0', reviewDate: '2027-09-01' },

  { id: 'cloud-infrastructure', code: 'LT-CLD', slug: 'cloud-infrastructure',
    title: 'Cloud & Infrastructure Track',
    shortDescription: 'Cloud, DevOps, Docker, Kubernetes and IT certifications.',
    division: 'labs', status: 'active', admissionStatus: 'open',
    trackVersion: '3.0', reviewDate: '2027-09-01' },

  { id: 'cybersecurity', code: 'LT-CYB', slug: 'cybersecurity',
    title: 'Cybersecurity Track',
    shortDescription: 'Network security, cloud security, SOC, forensics and DevSecOps.',
    division: 'labs', status: 'active', admissionStatus: 'open',
    trackVersion: '3.0', reviewDate: '2027-09-01' },

  { id: 'engineering-smart-systems', code: 'LT-ENG', slug: 'engineering-smart-systems',
    title: 'Engineering & Smart Systems Track',
    shortDescription: 'Electrical, solar, PLC, robotics, IoT and mechatronics.',
    division: 'labs', status: 'active', admissionStatus: 'open',
    trackVersion: '3.0', reviewDate: '2027-09-01' },

  { id: 'creative-technology', code: 'LT-CRT', slug: 'creative-technology',
    title: 'Creative Technology Track',
    shortDescription: 'Motion design, AI video, 3D and immersive media.',
    division: 'labs', status: 'active', admissionStatus: 'open',
    trackVersion: '3.0', reviewDate: '2027-09-01' },
];

export function getGrouping(code) {
  return PATHWAYS.find((p) => p.code === code)
      || TRACKS.find((t) => t.code === code)
      || null;
}

export function getGroupingById(id) {
  return PATHWAYS.find((p) => p.id === id)
      || TRACKS.find((t) => t.id === id)
      || null;
}

export function getAllGroupings() {
  return [...PATHWAYS, ...TRACKS];
}