/*
  # Student Portal schema

  Builds out the full institutional Student Portal on top of the existing
  `profiles` / `enrollments` / `courses` tables (Academy marketing catalog).
  These are separate, institutional-record concepts:

  - `profiles`      — existing; extended here with student-record fields
  - `programs`       — degree/diploma/certificate programs
  - `semesters`      — academic terms
  - `units`          — registrable units/courses within a program+semester
  - `unit_registrations`, `academic_records`, `fee_structures`,
    `fee_transactions`, `timetable_entries`, `attendance_records`,
    `exams`, `exam_results`, `student_documents`, `announcements`,
    `student_messages`, `service_requests`, `support_tickets`,
    `graduation_applications`

  ## Security model
  - Reference/catalog tables (`programs`, `semesters`, `units`,
    `timetable_entries`, `exams`, `fee_structures`, `announcements`) are
    readable by any authenticated user (institution-wide data, no PII).
  - Student-owned tables are restricted per-row to `student_id = auth.uid()`.
  - Tables that represent institution-issued records the student should not
    be able to fabricate (`academic_records`, `exam_results`,
    `fee_transactions`, `attendance_records`, `student_documents`) are
    SELECT-only for students — writes are expected via a trusted
    admin/service-role backend, not the anon/authenticated client.
  - `unit_registrations`, `service_requests`, `support_tickets`, and
    `graduation_applications` are student-initiated, so students may INSERT
    (and, where sensible, UPDATE/cancel) their own rows.
*/

-- ============================================================
-- 1. Extend profiles with student-record fields
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_number text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS national_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS next_of_kin_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS next_of_kin_phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS next_of_kin_relationship text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level_year text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_year text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_status text NOT NULL DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS program_id uuid;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_semester_id uuid;

-- ============================================================
-- 2. Reference tables: programs, semesters, units
-- ============================================================
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  department text,
  level text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles
  ADD CONSTRAINT profiles_program_id_fkey
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  academic_year text NOT NULL,
  start_date date,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles
  ADD CONSTRAINT profiles_current_semester_id_fkey
  FOREIGN KEY (current_semester_id) REFERENCES semesters(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  title text NOT NULL,
  credit_hours integer DEFAULT 3,
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  semester_id uuid REFERENCES semesters(id) ON DELETE CASCADE,
  lecturer_name text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. Academic registration & records
-- ============================================================
CREATE TABLE IF NOT EXISTS unit_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  semester_id uuid REFERENCES semesters(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'registered',
  registered_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academic_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES units(id) ON DELETE SET NULL,
  semester_id uuid REFERENCES semesters(id) ON DELETE SET NULL,
  score numeric,
  grade text,
  grade_points numeric,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 4. Fees & finance
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  semester_id uuid REFERENCES semesters(id) ON DELETE CASCADE,
  item text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fee_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semester_id uuid REFERENCES semesters(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'charge',
  amount numeric NOT NULL DEFAULT 0,
  method text,
  reference text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. Timetable, attendance, exams
-- ============================================================
CREATE TABLE IF NOT EXISTS timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE,
  semester_id uuid REFERENCES semesters(id) ON DELETE CASCADE,
  day_of_week text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  venue text,
  session_type text NOT NULL DEFAULT 'lecture',
  lecturer_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES units(id) ON DELETE SET NULL,
  semester_id uuid REFERENCES semesters(id) ON DELETE SET NULL,
  session_date date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'present',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) ON DELETE CASCADE,
  semester_id uuid REFERENCES semesters(id) ON DELETE CASCADE,
  exam_date date,
  start_time time,
  end_time time,
  venue text,
  exam_type text NOT NULL DEFAULT 'final',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  score numeric,
  grade text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 6. Documents, announcements, messages
-- ============================================================
CREATE TABLE IF NOT EXISTS student_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  title text NOT NULL,
  file_path text,
  status text NOT NULL DEFAULT 'available',
  issued_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  department text,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender text NOT NULL DEFAULT 'Institution',
  subject text NOT NULL,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 7. Services / requests, support, graduation
-- ============================================================
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS graduation_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_eligible',
  clearance_status text NOT NULL DEFAULT 'pending',
  fee_paid boolean NOT NULL DEFAULT false,
  ceremony_date date,
  applied_at timestamptz
);

-- ============================================================
-- 8. Row Level Security
-- ============================================================

-- Reference/catalog tables: readable by any authenticated user
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_programs" ON programs;
CREATE POLICY "auth_select_programs" ON programs FOR SELECT TO authenticated USING (true);

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_semesters" ON semesters;
CREATE POLICY "auth_select_semesters" ON semesters FOR SELECT TO authenticated USING (true);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_units" ON units;
CREATE POLICY "auth_select_units" ON units FOR SELECT TO authenticated USING (true);

ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_fee_structures" ON fee_structures;
CREATE POLICY "auth_select_fee_structures" ON fee_structures FOR SELECT TO authenticated USING (true);

ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_timetable_entries" ON timetable_entries;
CREATE POLICY "auth_select_timetable_entries" ON timetable_entries FOR SELECT TO authenticated USING (true);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_exams" ON exams;
CREATE POLICY "auth_select_exams" ON exams FOR SELECT TO authenticated USING (true);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_announcements" ON announcements;
CREATE POLICY "auth_select_announcements" ON announcements FOR SELECT TO authenticated USING (true);

-- Student-owned, student-writable: unit registrations
ALTER TABLE unit_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_unit_registrations" ON unit_registrations;
CREATE POLICY "own_select_unit_registrations" ON unit_registrations FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "own_insert_unit_registrations" ON unit_registrations;
CREATE POLICY "own_insert_unit_registrations" ON unit_registrations FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "own_update_unit_registrations" ON unit_registrations;
CREATE POLICY "own_update_unit_registrations" ON unit_registrations FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "own_delete_unit_registrations" ON unit_registrations;
CREATE POLICY "own_delete_unit_registrations" ON unit_registrations FOR DELETE TO authenticated USING (student_id = auth.uid());

-- Student-owned, read-only (institution writes these): academic records, exam results,
-- fee transactions, attendance, student documents
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_academic_records" ON academic_records;
CREATE POLICY "own_select_academic_records" ON academic_records FOR SELECT TO authenticated USING (student_id = auth.uid());

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_exam_results" ON exam_results;
CREATE POLICY "own_select_exam_results" ON exam_results FOR SELECT TO authenticated USING (student_id = auth.uid());

ALTER TABLE fee_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_fee_transactions" ON fee_transactions;
CREATE POLICY "own_select_fee_transactions" ON fee_transactions FOR SELECT TO authenticated USING (student_id = auth.uid());

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_attendance_records" ON attendance_records;
CREATE POLICY "own_select_attendance_records" ON attendance_records FOR SELECT TO authenticated USING (student_id = auth.uid());

ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_student_documents" ON student_documents;
CREATE POLICY "own_select_student_documents" ON student_documents FOR SELECT TO authenticated USING (student_id = auth.uid());

-- Student-owned, student-writable: messages (can mark read), service requests, support
-- tickets, graduation applications
ALTER TABLE student_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_student_messages" ON student_messages;
CREATE POLICY "own_select_student_messages" ON student_messages FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "own_update_student_messages" ON student_messages;
CREATE POLICY "own_update_student_messages" ON student_messages FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_service_requests" ON service_requests;
CREATE POLICY "own_select_service_requests" ON service_requests FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "own_insert_service_requests" ON service_requests;
CREATE POLICY "own_insert_service_requests" ON service_requests FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_support_tickets" ON support_tickets;
CREATE POLICY "own_select_support_tickets" ON support_tickets FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "own_insert_support_tickets" ON support_tickets;
CREATE POLICY "own_insert_support_tickets" ON support_tickets FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

ALTER TABLE graduation_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_select_graduation_applications" ON graduation_applications;
CREATE POLICY "own_select_graduation_applications" ON graduation_applications FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "own_insert_graduation_applications" ON graduation_applications;
CREATE POLICY "own_insert_graduation_applications" ON graduation_applications FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

-- ============================================================
-- 9. Storage: private per-student documents bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Students can view own documents" ON storage.objects;
CREATE POLICY "Students can view own documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'student-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 10. Helpful indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_unit_registrations_student ON unit_registrations (student_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_student ON academic_records (student_id);
CREATE INDEX IF NOT EXISTS idx_fee_transactions_student ON fee_transactions (student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records (student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results (student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_student ON student_documents (student_id);
CREATE INDEX IF NOT EXISTS idx_student_messages_student ON student_messages (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_student ON service_requests (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_student ON support_tickets (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_units_program_semester ON units (program_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_timetable_unit ON timetable_entries (unit_id);
