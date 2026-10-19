/**
 * labsData — Lab Tracks metadata for Labs pages.
 * V3: derived from TRACKS in registry.js so there is one source of truth.
 */

import { TRACKS } from './registry.js';

// Per-track presentation metadata (icon key, sub-tracks, technologies).
// Sub-tracks are descriptive — the enrollable unit is the COURSE.
const TRACK_METADATA = {
  'software-engineering': {
    icon: 'Code',
    tracks: [
      'Coding Fundamentals',
      'Web Development (HTML, CSS)',
      'Frontend Development (JavaScript, React)',
      'Backend Development (Node.js, Python, Java)',
      'Full-Stack Web Development',
      'Mobile App Development',
      'Git & Version Control',
      'AI Integration for Developers',
      'Technical Interview Preparation',
    ],
    technologies: ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'React Native', 'Git', 'REST APIs'],
  },
  'data-analytics': {
    icon: 'BarChart3',
    tracks: [
      'Data Literacy',
      'Excel for Data Analysis',
      'SQL & Database Management',
      'Power BI',
      'Python for Data Science',
      'Data Science',
      'Business Analytics',
      'Data Engineering',
    ],
    technologies: ['Excel', 'SQL', 'Power BI', 'Python', 'Pandas', 'NumPy', 'DAX'],
  },
  'ai-intelligent-systems': {
    icon: 'Brain',
    tracks: [
      'AI Fundamentals',
      'Applied AI Tools',
      'AI Prompt Engineering',
      'Generative AI Applications',
      'AI Agents Development',
      'Machine Learning',
      'AI Integration',
    ],
    technologies: ['OpenAI', 'LangChain', 'CrewAI', 'Hugging Face', 'TensorFlow', 'PyTorch', 'RAG'],
  },
  'cloud-infrastructure': {
    icon: 'Cloud',
    tracks: [
      'Cloud Computing',
      'AWS Cloud Practitioner',
      'AWS Solutions Architect',
      'Azure Fundamentals (AZ-900)',
      'Linux Administration',
      'Networking (CCNA)',
      'DevOps Fundamentals',
      'Docker & Kubernetes',
    ],
    technologies: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'CI/CD'],
  },
  cybersecurity: {
    icon: 'ShieldCheck',
    tracks: [
      'Cybersecurity Awareness',
      'Cybersecurity Fundamentals',
      'Network Security',
      'Cloud Security',
      'Application Security',
      'SOC Analysis',
      'Incident Response',
      'DevSecOps',
      'Digital Forensics',
    ],
    technologies: ['SIEM', 'Wireshark', 'Kali Linux', 'NIST', 'OWASP', 'Metasploit', 'Burp Suite'],
  },
  'engineering-smart-systems': {
    icon: 'Cog',
    tracks: [
      'Engineering Drawing',
      'Electrical Installation',
      'Electronics',
      'Renewable Energy',
      'Solar Installation',
      'PLC Programming',
      'Industrial Automation',
      'IoT Fundamentals',
      'Robotics',
      'Mechatronics',
      '3D Printing',
    ],
    technologies: ['AutoCAD', 'PLC', 'Arduino', 'Raspberry Pi', 'IoT', 'Solar PV', 'SCADA'],
  },
  'creative-technology': {
    icon: 'Sparkles',
    tracks: [
      'Motion Graphics',
      'Motion Design',
      'Podcast Production',
      'Videography',
      'AI Video Generation & Editing',
      'AI Image Generation & Editing',
      '3D Modeling',
    ],
    technologies: ['After Effects', 'Premiere Pro', 'Runway', 'Midjourney', 'Figma', 'Blender'],
  },
};

export const LAB_SCHOOLS = TRACKS.map((track) => {
  const meta = TRACK_METADATA[track.id] || { icon: 'Brain', tracks: [], technologies: [] };
  return {
    id: track.id,
    title: track.title,
    description: track.shortDescription,
    code: track.code,
    slug: track.slug,
    icon: meta.icon,
    tracks: meta.tracks,
    technologies: meta.technologies,
    status: track.status,
  };
});

export function getLabSchoolById(id) {
  return LAB_SCHOOLS.find((s) => s.id === id) || null;
}

export function getLabSchoolByCode(code) {
  return LAB_SCHOOLS.find((s) => s.code === code) || null;
}