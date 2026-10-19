/*
  # Admissions -> LMS bridge schema

  `src/lib/supabase/admin.js` already calls `generate_student_number()`
  and reads/writes `applications.student_number`, `.admitted_profile_id`,
  `.lms_course_id`, and `.lms_enrollment_status` (see `admitApplication()`
  and `generateStudentNumber()`) — but no migration in this repo ever
  created them. This adds exactly those pieces, nothing else.

  Must run AFTER the LMS courses table exists under its final name
  (`lms_courses`, per the rename applied in
  20260829100000_lms_courses_enrollment.sql), since `lms_course_id`
  references it.

  `generate_student_number()` uses a real sequence (not a MAX(...)+1
  read-then-write) so two simultaneous admits can never collide, per the
  concurrency-safety guarantee described in admin.js's own comment.
*/

CREATE SEQUENCE IF NOT EXISTS student_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_student_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next integer;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only an admin can generate a student number.';
  END IF;
  v_next := nextval('student_number_seq');
  RETURN 'ISG-' || to_char(now(), 'YYYY') || '-' || lpad(v_next::text, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_student_number() TO authenticated;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS student_number text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS admitted_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS lms_course_id uuid REFERENCES lms_courses(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS lms_enrollment_status text;

CREATE INDEX IF NOT EXISTS idx_applications_admitted_profile ON applications(admitted_profile_id);
