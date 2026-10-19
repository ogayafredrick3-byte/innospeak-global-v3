/**
 * labsCourses — aggregates all new Lab courses created for the expansion.
 * These are merged into the COURSES array in programmeData.js.
 */

import { AI_COURSES } from './labs/aiCourses.js';
import { SE_COURSES } from './labs/seCourses.js';
import { CLOUD_COURSES } from './labs/cloudCourses.js';
import { DS_COURSES } from './labs/dsCourses.js';
import { ENG_COURSES } from './labs/engCourses.js';
import { CI_COURSES } from './labs/ciCourses.js';

export const NEW_LABS_COURSES = [
  ...AI_COURSES,
  ...SE_COURSES,
  ...CLOUD_COURSES,
  ...DS_COURSES,
  ...ENG_COURSES,
  ...CI_COURSES,
];
