/**
 * gradeBundles — CBE Grade 3–12 enrollment bundles.
 * One enrollment = one grade = all subjects.
 */

export const GRADE_BUNDLES = [
  { code: 'PRI-G03', level: 'primary', grade: 3, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Primary Grade 3', duration: '12 Weeks', feesUSD: 65,
    isFree: false, levelBand: 'Foundation', elective: null,
    subjects: [
      { code: 'PRI-ENG-03', name: 'English' },
      { code: 'PRI-KIS-03', name: 'Kiswahili / KSL' },
      { code: 'PRI-MAT-03', name: 'Mathematics' },
      { code: 'PRI-REL-03', name: 'Religious Education' },
      { code: 'PRI-AGR-03', name: 'Agriculture and Nutrition' },
      { code: 'PRI-SOC-03', name: 'Social Studies' },
      { code: 'PRI-CRE-03', name: 'Creative Arts' },
      { code: 'PRI-SCI-03', name: 'Science and Technology' },
    ]},

  { code: 'PRI-G04', level: 'primary', grade: 4, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Primary Grade 4', duration: '12 Weeks', feesUSD: 75,
    isFree: false, levelBand: 'Foundation',
    elective: ['French','German','Mandarin','Arabic','Indigenous Language'],
    subjects: [
      { code: 'PRI-ENG-04', name: 'English' },
      { code: 'PRI-KIS-04', name: 'Kiswahili / KSL' },
      { code: 'PRI-MAT-04', name: 'Mathematics' },
      { code: 'PRI-REL-04', name: 'Religious Education' },
      { code: 'PRI-AGR-04', name: 'Agriculture and Nutrition' },
      { code: 'PRI-SOC-04', name: 'Social Studies' },
      { code: 'PRI-CRE-04', name: 'Creative Arts' },
      { code: 'PRI-SCI-04', name: 'Science and Technology' },
    ]},

  { code: 'PRI-G05', level: 'primary', grade: 5, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Primary Grade 5', duration: '12 Weeks', feesUSD: 75,
    isFree: false, levelBand: 'Foundation',
    elective: ['French','German','Mandarin','Arabic','Indigenous Language'],
    subjects: [
      { code: 'PRI-ENG-05', name: 'English' },
      { code: 'PRI-KIS-05', name: 'Kiswahili / KSL' },
      { code: 'PRI-MAT-05', name: 'Mathematics' },
      { code: 'PRI-REL-05', name: 'Religious Education' },
      { code: 'PRI-AGR-05', name: 'Agriculture and Nutrition' },
      { code: 'PRI-SOC-05', name: 'Social Studies' },
      { code: 'PRI-CRE-05', name: 'Creative Arts' },
      { code: 'PRI-SCI-05', name: 'Science and Technology' },
    ]},

  { code: 'PRI-G06', level: 'primary', grade: 6, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Primary Grade 6', duration: '12 Weeks', feesUSD: 80,
    isFree: false, levelBand: 'Foundation',
    elective: ['French','German','Mandarin','Arabic','Indigenous Language'],
    subjects: [
      { code: 'PRI-ENG-06', name: 'English' },
      { code: 'PRI-KIS-06', name: 'Kiswahili / KSL' },
      { code: 'PRI-MAT-06', name: 'Mathematics' },
      { code: 'PRI-REL-06', name: 'Religious Education' },
      { code: 'PRI-AGR-06', name: 'Agriculture and Nutrition' },
      { code: 'PRI-SOC-06', name: 'Social Studies' },
      { code: 'PRI-CRE-06', name: 'Creative Arts' },
      { code: 'PRI-SCI-06', name: 'Science and Technology' },
    ]},

  { code: 'JSS-G07', level: 'junior_secondary', grade: 7, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Junior Secondary Grade 7', duration: '12 Weeks', feesUSD: 120,
    isFree: false, levelBand: 'Practitioner',
    elective: ['Visual Arts','Performing Arts','Home Science','Computer Science','Foreign/Indigenous Languages'],
    subjects: [
      { code: 'JSS-ENG-07', name: 'English' },
      { code: 'JSS-KIS-07', name: 'Kiswahili / KSL' },
      { code: 'JSS-MAT-07', name: 'Mathematics' },
      { code: 'JSS-INT-07', name: 'Integrated Science' },
      { code: 'JSS-SOC-07', name: 'Social Studies' },
      { code: 'JSS-BUS-07', name: 'Business Studies' },
      { code: 'JSS-AGR-07', name: 'Agriculture' },
      { code: 'JSS-PRE-07', name: 'Pre-Technical and Pre-Career Studies' },
      { code: 'JSS-REL-07', name: 'Religious Education' },
    ]},

  { code: 'JSS-G08', level: 'junior_secondary', grade: 8, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Junior Secondary Grade 8', duration: '12 Weeks', feesUSD: 125,
    isFree: false, levelBand: 'Practitioner',
    elective: ['Visual Arts','Performing Arts','Home Science','Computer Science','Foreign/Indigenous Languages'],
    subjects: [
      { code: 'JSS-ENG-08', name: 'English' },
      { code: 'JSS-KIS-08', name: 'Kiswahili / KSL' },
      { code: 'JSS-MAT-08', name: 'Mathematics' },
      { code: 'JSS-INT-08', name: 'Integrated Science' },
      { code: 'JSS-SOC-08', name: 'Social Studies' },
      { code: 'JSS-BUS-08', name: 'Business Studies' },
      { code: 'JSS-AGR-08', name: 'Agriculture' },
      { code: 'JSS-PRE-08', name: 'Pre-Technical and Pre-Career Studies' },
      { code: 'JSS-REL-08', name: 'Religious Education' },
    ]},

  { code: 'JSS-G09', level: 'junior_secondary', grade: 9, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Junior Secondary Grade 9', duration: '12 Weeks', feesUSD: 130,
    isFree: false, levelBand: 'Practitioner',
    elective: ['Visual Arts','Performing Arts','Home Science','Computer Science','Foreign/Indigenous Languages'],
    subjects: [
      { code: 'JSS-ENG-09', name: 'English' },
      { code: 'JSS-KIS-09', name: 'Kiswahili / KSL' },
      { code: 'JSS-MAT-09', name: 'Mathematics' },
      { code: 'JSS-INT-09', name: 'Integrated Science' },
      { code: 'JSS-SOC-09', name: 'Social Studies' },
      { code: 'JSS-BUS-09', name: 'Business Studies' },
      { code: 'JSS-AGR-09', name: 'Agriculture' },
      { code: 'JSS-PRE-09', name: 'Pre-Technical and Pre-Career Studies' },
      { code: 'JSS-REL-09', name: 'Religious Education' },
    ]},

  { code: 'SSS-G10', level: 'senior_secondary', grade: 10, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Senior Secondary Grade 10', duration: '16 Weeks', feesUSD: 180,
    isFree: false, levelBand: 'Professional',
    subjects: [
      { code: 'SSS-ENG-10', name: 'English' },
      { code: 'SSS-KIS-10', name: 'Kiswahili / KSL' },
      { code: 'SSS-MAT-10', name: 'Core Mathematics' },
      { code: 'SSS-CSL-10', name: 'Community Service Learning' },
    ],
    pathwayOptions: ['Arts & Sports Science','Social Sciences','STEM'],
    pathwayElectives: {
      'Arts & Sports Science': ['Music','Dance','Fine Art','Sports Science','Theatre'],
      'Social Sciences': ['History & Citizenship','Geography','Business Studies','Literature in English'],
      'STEM': ['Physics','Chemistry','Biology','Computer Science','Electrical Technology','Building Construction','Aviation Technology'],
    }},

  { code: 'SSS-G11', level: 'senior_secondary', grade: 11, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Senior Secondary Grade 11', duration: '16 Weeks', feesUSD: 190,
    isFree: false, levelBand: 'Professional',
    subjects: [
      { code: 'SSS-ENG-11', name: 'English' },
      { code: 'SSS-KIS-11', name: 'Kiswahili / KSL' },
      { code: 'SSS-MAT-11', name: 'Core Mathematics' },
      { code: 'SSS-CSL-11', name: 'Community Service Learning' },
    ],
    pathwayOptions: ['Arts & Sports Science','Social Sciences','STEM'],
    pathwayElectives: {
      'Arts & Sports Science': ['Music','Dance','Fine Art','Sports Science','Theatre'],
      'Social Sciences': ['History & Citizenship','Geography','Business Studies','Literature in English'],
      'STEM': ['Physics','Chemistry','Biology','Computer Science','Electrical Technology','Building Construction','Aviation Technology'],
    }},

  { code: 'SSS-G12', level: 'senior_secondary', grade: 12, division: 'academy',
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    title: 'Senior Secondary Grade 12', duration: '16 Weeks', feesUSD: 200,
    isFree: false, levelBand: 'Professional',
    subjects: [
      { code: 'SSS-ENG-12', name: 'English' },
      { code: 'SSS-KIS-12', name: 'Kiswahili / KSL' },
      { code: 'SSS-MAT-12', name: 'Core Mathematics' },
      { code: 'SSS-CSL-12', name: 'Community Service Learning' },
    ],
    pathwayOptions: ['Arts & Sports Science','Social Sciences','STEM'],
    pathwayElectives: {
      'Arts & Sports Science': ['Music','Dance','Fine Art','Sports Science','Theatre'],
      'Social Sciences': ['History & Citizenship','Geography','Business Studies','Literature in English'],
      'STEM': ['Physics','Chemistry','Biology','Computer Science','Electrical Technology','Building Construction','Aviation Technology'],
    }},
];

export const TVET_LEVELS = [
  { code: 'ART', title: 'Artisan Certificate', status: 'coming_soon',
    entryRequirement: 'KCPE', modules: 1,
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    description: 'Practical artisan training for skilled trades.' },
  { code: 'CRF', title: 'Craft Certificate', status: 'coming_soon',
    entryRequirement: 'KCSE D Plain', modules: 2,
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    description: 'Craft-level training for technical trades and certifications.' },
  { code: 'DIP', title: 'Diploma', status: 'coming_soon',
    entryRequirement: 'KCSE C- Minus', modules: 3,
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    description: 'Diploma-level technical training across engineering, ICT and business.' },
  { code: 'HDP', title: 'Higher Diploma', status: 'coming_soon',
    entryRequirement: 'Diploma Pass', modules: 2,
    pathwayId: 'kenya-curriculum-tvet', groupingCode: 'ACP-KCV',
    description: 'Advanced diploma training for specialist technical roles.' },
];

export function getGradeBundle(code) {
  return GRADE_BUNDLES.find((g) => g.code === code) || null;
}
export function getGradesByLevel(level) {
  return GRADE_BUNDLES.filter((g) => g.level === level);
}