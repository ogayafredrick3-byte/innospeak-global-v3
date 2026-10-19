-- Additive LMS content hardening for the owner-authorised self-paced catalogue.
-- Safe to re-run: it updates only seeded lessons that still contain the
-- original generic template and have no authored objectives/activity.
-- It intentionally does not drop tables or overwrite authored lesson content.
BEGIN;

UPDATE lessons AS lesson
SET
  content = regexp_replace(
    regexp_replace(
      lesson.content,
      '### Learning outcomes.*?### Guided learning activities',
      format(
        E'### Learning outcomes\n1. Explain the key concepts in %s as they apply to %s.\n2. Apply an appropriate method to a defined task in %s.\n3. Produce evidence of learning and evaluate it against stated success criteria.\n\n### Guided learning activities',
        course.title, module.title, course.title
      ),
      's'
    ),
    '### Guided learning activities.*?### Evidence of learning',
    format(
      E'### Guided learning activities\n1. Apply the methods in %s to the module task "%s" and record your process.\n2. Complete a short retrieval check and explain your reasoning in your own words.\n3. Review the work against the success criteria and record one improvement.\n\n### Evidence of learning',
      course.title, module.title
    ),
    's'
  ),
  learning_objectives = jsonb_build_array(
    format('Explain the key concepts in %s as they apply to %s.', course.title, module.title),
    format('Apply an appropriate method to a defined task in %s.', course.title),
    format('Produce evidence of learning and evaluate it against stated success criteria for %s.', course.title)
  ),
  practical_activity = format(
    'For %s, complete a practical task connected to "%s". Submit a work sample, describe your method, and compare the result with the stated success criteria.',
    course.title, module.title
  ),
  updated_at = now()
FROM modules AS module
JOIN lms_courses AS course ON course.id = module.course_id
WHERE lesson.module_id = module.id
  AND lesson.status = 'published'
  AND lesson.content LIKE '%Work addresses the stated task and intended audience.%'
  AND (lesson.learning_objectives IS NULL OR lesson.learning_objectives = '[]'::jsonb)
  AND COALESCE(lesson.practical_activity, '') = '';

-- Indexes are additive and idempotent; the core unique course/enrolment
-- constraints already exist in the original LMS schema migrations.
CREATE INDEX IF NOT EXISTS idx_lms_courses_published_title
  ON lms_courses (title) WHERE status = 'published';

COMMIT;
