/*
  # LMS Phase 1 — Role foundation

  Extends the existing `profiles.role` column (currently 'student' | 'admin')
  to support two new LMS roles, without touching any existing data or
  breaking the current `is_admin()` helper used throughout the Student
  Portal / Admin dashboard.

  New roles:
    - 'instructor'  — creates/manages their own lms_courses (added in Phase 2+)
    - 'lms_admin'   — manages all LMS content, but not institution-wide
                      Student Portal records (that stays 'admin'-only)

  'admin' (Super Admin) implicitly has every LMS permission too — enforced
  by having is_lms_admin() and is_instructor() both return true for admins,
  so a Super Admin never gets locked out of LMS screens.

  This migration adds ONLY the role/permission layer. No course, module,
  lesson, or other LMS domain tables are created yet — those belong to
  Phase 2 onward per the agreed phased rollout, so this migration can be
  applied and verified in isolation first.
*/

-- ============================================================
-- 1. Widen the role constraint (profiles.role is currently a
--    free-text column defaulting to 'student' with no CHECK — we add
--    one now so invalid roles can never be written, from any client).
-- ============================================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'admin', 'instructor', 'lms_admin'));

-- ============================================================
-- 2. Permission helper functions (SECURITY DEFINER, same pattern
--    as the existing is_admin() so RLS policies can call them safely
--    without recursive-policy issues).
-- ============================================================

-- True for Super Admin OR LMS Admin — the two roles that manage all
-- LMS content across every course.
CREATE OR REPLACE FUNCTION is_lms_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'lms_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION is_lms_admin() TO authenticated;

-- True for any user allowed to act as an instructor: Super Admin,
-- LMS Admin, or a user explicitly given the 'instructor' role.
-- Course-level "is this instructor assigned to THIS course" checks
-- come in Phase 2 once course_instructors exists — this is only the
-- coarse "can this user use instructor tooling at all" check.
CREATE OR REPLACE FUNCTION is_instructor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'lms_admin', 'instructor')
  );
$$;

GRANT EXECUTE ON FUNCTION is_instructor() TO authenticated;

-- Convenience: current user's role, for the frontend to branch on
-- without a second round-trip query against profiles.
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION current_user_role() TO authenticated;

-- ============================================================
-- 3. Audit log table (Phase 1, since every later phase writes to
--    it — role changes are the first audited action).
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Super Admin / LMS Admin can read the audit trail.
DROP POLICY IF EXISTS "lms_admin_read_audit_logs" ON audit_logs;
CREATE POLICY "lms_admin_read_audit_logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (is_lms_admin());

-- Inserts happen via SECURITY DEFINER functions only (added per-phase
-- as each auditable action is built), never directly from the client —
-- so there is deliberately NO insert policy for 'authenticated' here.

-- ============================================================
-- 4. Role-change audit trigger — every time an admin changes
--    someone's role, log it automatically. This is the first real
--    audit event and proves the audit_logs table works end-to-end.
-- ============================================================
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(),
      'role_changed',
      'profiles',
      NEW.id,
      jsonb_build_object('from_role', OLD.role, 'to_role', NEW.role)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_role_change ON profiles;
CREATE TRIGGER trg_log_role_change
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();
