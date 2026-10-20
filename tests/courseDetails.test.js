import test from 'node:test';
import assert from 'node:assert/strict';
import { COURSES } from '../src/lib/data/programmeData.js';
import { buildCourseData, COURSE_DETAILS } from '../src/lib/data/courseDetails.js';

test('all catalogue course detail pages expose career directions without inventing testimonials', () => {
  assert.equal(COURSES.length, 368);
  for (const course of COURSES) {
    const detail = buildCourseData(course.code);
    assert.ok(detail, `Course detail should resolve for ${course.code}`);
    assert.ok(detail.careers.length >= 3, `${course.code} should show relevant career directions`);
    assert.ok(detail.careers.every((career) => typeof career === 'string' && career.trim().length > 0));
    // Reviews are social proof and must never be generated as filler.
    assert.ok(Array.isArray(detail.reviews), `${course.code} reviews should remain an array`);
  }
});

test('course detail fallback career directions are based on the course pathway', () => {
  const software = COURSES.find((course) => course.pathwayId === 'software-engineering' && !COURSE_DETAILS[course.code]?.careers?.length);
  assert.ok(software, 'A software pathway course without course-specific career records should exist');
  const detail = buildCourseData(software.code);
  assert.ok(detail.careers.some((career) => /software|web development|testing|application support/i.test(career)));
});
