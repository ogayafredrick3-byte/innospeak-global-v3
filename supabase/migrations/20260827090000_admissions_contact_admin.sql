/*
  # Admissions review + lock down applications & contact_messages

  1. Adds a review workflow to `applications` (status, reviewed_at,
     reviewer_notes) so admins can approve/reject admissions.

  2. Security fix: `applications` and `contact_messages` were previously
     readable/writable by *any* authenticated user (see the "Same pattern
     as applications" note in 20260730130000_create_contact_messages_table.sql)
     — meaning any logged-in student could read every admission
     application and every contact form submission. This tightens both
     tables so only admins can SELECT/UPDATE/DELETE, while public
     (anon) submission (INSERT) is left untouched — a DO block drops
     only the SELECT/UPDATE/DELETE policies on each table, regardless of
     their existing names, before adding fresh admin-only ones.
*/

ALTER TABLE applications ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewer_notes text;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'applications' AND cmd IN ('SELECT', 'UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON applications', pol.policyname);
  END LOOP;

  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'contact_messages' AND cmd IN ('SELECT', 'UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON contact_messages', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "admin_select_applications" ON applications FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_applications" ON applications FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_applications" ON applications FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "admin_select_contact_messages" ON contact_messages FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "admin_update_contact_messages" ON contact_messages FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_contact_messages" ON contact_messages FOR DELETE TO authenticated USING (is_admin());
