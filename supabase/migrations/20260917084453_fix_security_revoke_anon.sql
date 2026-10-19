-- Fix security: revoke anon execute on all SECURITY DEFINER functions except verify_certificate and get_login_email

REVOKE EXECUTE ON FUNCTION is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION is_lms_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION can_manage_course(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION is_course_instructor(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION course_id_for_lesson(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION can_manage_lesson(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION is_lesson_instructor(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION is_lesson_enrolled(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION is_enrolled(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION submit_quiz_attempt(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION grade_submission(uuid, integer, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION request_resubmission(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION get_student_assignment_status(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION get_course_progress(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION submit_course_for_review(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION set_course_under_review(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION approve_course(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION publish_course(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION reject_course(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION request_course_changes(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION reorder_modules(uuid, uuid[]) FROM anon;
REVOKE EXECUTE ON FUNCTION reorder_lessons(uuid, uuid[]) FROM anon;
REVOKE EXECUTE ON FUNCTION generate_student_number() FROM anon;
REVOKE EXECUTE ON FUNCTION generate_certificate_number() FROM anon;
REVOKE EXECUTE ON FUNCTION check_and_record_completion(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION revoke_certificate(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION reactivate_certificate(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION get_course_analytics(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION get_lms_overview() FROM anon;
REVOKE EXECUTE ON FUNCTION get_student_academic_summary(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION get_student_course_performance(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION get_student_recent_activity(uuid, int) FROM anon;
REVOKE EXECUTE ON FUNCTION get_student_course_detail(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION get_student_assessment_performance(uuid) FROM anon;

-- Fix search_path on trigger functions
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;