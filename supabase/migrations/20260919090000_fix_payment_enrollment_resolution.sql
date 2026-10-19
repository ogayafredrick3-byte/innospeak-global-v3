/*
  # Fix — confirm_payment_and_enroll could lose a successful payment

  Bug: payments.course_id is nullable, and catalogue courses are
  identified by a text code (e.g. "DA5-101") that may have no matching
  lms_courses row. When course_id was NULL, the function ran:

      INSERT INTO lms_enrollments (student_id, course_id, status)
      VALUES (v_payment.student_id, NULL, 'active')

  against lms_enrollments.course_id which is NOT NULL. That raises an
  exception, which rolls back the whole transaction — including the
  "UPDATE payments SET status = 'paid'" a few lines above it.

  Net effect: the learner is charged by M-PESA/PayPal, Safaricom's
  callback is processed, and the payment is still left marked 'pending'
  with no enrollment. Money taken, nothing delivered, and no record that
  it succeeded.

  Fix, in order:
    1. Resolve course_code -> lms_courses.id when course_id is NULL,
       so catalogue purchases enroll correctly.
    2. If it still cannot be resolved, record the payment as PAID and
       return success with 'enrollment_pending', instead of throwing.
       A confirmed payment must never be rolled back because the
       course mapping is missing — that is a staff follow-up, not a
       reason to discard the transaction.
*/

CREATE OR REPLACE FUNCTION confirm_payment_and_enroll(
  p_payment_id uuid,
  p_provider_transaction_id text,
  p_course_id uuid DEFAULT NULL,
  p_course_code text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_course_uuid uuid;
  v_enrolled boolean := false;
BEGIN
  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  IF v_payment.status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already confirmed', 'payment_id', p_payment_id);
  END IF;

  IF v_payment.status NOT IN ('pending') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment is ' || v_payment.status || ', cannot confirm');
  END IF;

  -- Always mark the payment paid first. Enrollment is a downstream
  -- consequence and must not be able to undo a confirmed transaction.
  UPDATE payments
  SET status = 'paid',
      provider_transaction_id = p_provider_transaction_id,
      paid_at = now(),
      updated_at = now()
  WHERE id = p_payment_id;

  -- Resolve the course: explicit uuid -> payment's uuid -> lookup by code.
  v_course_uuid := COALESCE(p_course_id, v_payment.course_id);

  IF v_course_uuid IS NULL THEN
    SELECT id INTO v_course_uuid
    FROM lms_courses
    WHERE code = COALESCE(p_course_code, v_payment.course_code)
    ORDER BY (status = 'published') DESC
    LIMIT 1;
  END IF;

  IF v_course_uuid IS NOT NULL AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'lms_enrollments'
  ) THEN
    INSERT INTO lms_enrollments (student_id, course_id, status)
    VALUES (v_payment.student_id, v_course_uuid, 'active')
    ON CONFLICT (course_id, student_id) DO UPDATE SET status = 'active';

    -- Backfill the uuid so admin reporting and checkCoursePaid() by id work.
    UPDATE payments SET course_id = v_course_uuid WHERE id = p_payment_id AND course_id IS NULL;

    v_enrolled := true;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'enrolled', v_enrolled,
    'status', CASE WHEN v_enrolled THEN 'enrolled' ELSE 'enrollment_pending' END,
    'message', CASE
      WHEN v_enrolled THEN 'Payment confirmed and enrollment activated'
      ELSE 'Payment confirmed. This course has no matching LMS course yet — staff will activate access.'
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION confirm_payment_and_enroll TO authenticated;
