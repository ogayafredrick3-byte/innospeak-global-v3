import test from 'node:test';
import assert from 'node:assert/strict';
import { getLessonValidationError } from '../src/lib/lms/lessonValidation.js';

test('lesson validation requires a title for draft or publication', () => {
  assert.match(getLessonValidationError({ title: '  ' }), /lesson title/i);
  assert.equal(getLessonValidationError({ title: 'Circuit Fundamentals' }), null);
});

test('lesson validation rejects unsafe media URLs', () => {
  assert.match(getLessonValidationError({ title: 'Lesson', videoUrl: 'javascript:alert(1)' }), /video URL/i);
  assert.match(getLessonValidationError({ title: 'Lesson', externalUrl: 'data:text/html,bad' }), /external URL/i);
});

test('incomplete lessons can be saved as drafts but not published', () => {
  const lesson = { title: 'Ohm’s Law' };
  assert.equal(getLessonValidationError(lesson), null);
  assert.match(getLessonValidationError({ ...lesson, publish: true }), /before publishing/i);
});

test('lessons with tutor-created content, activities, media, or resources can be published', () => {
  for (const material of [
    { content: '<p>Understand voltage, current and resistance.</p>' },
    { practicalActivity: 'Measure the resistance in a simulated circuit.' },
    { videoUrl: 'https://example.org/lesson-video' },
    { externalUrl: 'https://example.org/reference' },
    { resourceCount: 1 },
  ]) {
    assert.equal(getLessonValidationError({ title: 'Lesson', publish: true, ...material }), null);
  }
});
