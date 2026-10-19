/*
  # Admin role & admin-wide policies

  Adds an admin role to `profiles` and an `is_admin()` helper, then grants
  admins full (SELECT/INSERT/UPDATE/DELETE) access to every Student Portal
  table via an additional permissive policy per table. This sits alongside
  the existing student "own row" policies — Postgres OR's permissive
  policies together, so students keep their existing access and admins
  gain full access on top, without removing any prior policy.

  To make a user an admin: in the Supabase dashboard's Table Editor, open
  `profiles`, find their row, and set `role` to 'admin'.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Admins can read/manage every profile (student records)
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Reference/catalog tables: admins can create/edit/delete, not just read
DROP POLICY IF EXISTS "admin_all_programs" ON programs;
CREATE POLICY "admin_all_programs" ON programs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_semesters" ON semesters;
CREATE POLICY "admin_all_semesters" ON semesters FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_units" ON units;
CREATE POLICY "admin_all_units" ON units FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_fee_structures" ON fee_structures;
CREATE POLICY "admin_all_fee_structures" ON fee_structures FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_timetable_entries" ON timetable_entries;
CREATE POLICY "admin_all_timetable_entries" ON timetable_entries FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_exams" ON exams;
CREATE POLICY "admin_all_exams" ON exams FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_announcements" ON announcements;
CREATE POLICY "admin_all_announcements" ON announcements FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Student-owned tables: admins get full read/write across every student
DROP POLICY IF EXISTS "admin_all_unit_registrations" ON unit_registrations;
CREATE POLICY "admin_all_unit_registrations" ON unit_registrations FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_academic_records" ON academic_records;
CREATE POLICY "admin_all_academic_records" ON academic_records FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_exam_results" ON exam_results;
CREATE POLICY "admin_all_exam_results" ON exam_results FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_fee_transactions" ON fee_transactions;
CREATE POLICY "admin_all_fee_transactions" ON fee_transactions FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_attendance_records" ON attendance_records;
CREATE POLICY "admin_all_attendance_records" ON attendance_records FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_student_documents" ON student_documents;
CREATE POLICY "admin_all_student_documents" ON student_documents FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_student_messages" ON student_messages;
CREATE POLICY "admin_all_student_messages" ON student_messages FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_service_requests" ON service_requests;
CREATE POLICY "admin_all_service_requests" ON service_requests FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_support_tickets" ON support_tickets;
CREATE POLICY "admin_all_support_tickets" ON support_tickets FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_all_graduation_applications" ON graduation_applications;
CREATE POLICY "admin_all_graduation_applications" ON graduation_applications FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admins can view every uploaded student document, not just their own folder
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'student-documents' AND is_admin());

DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'student-documents' AND is_admin());
