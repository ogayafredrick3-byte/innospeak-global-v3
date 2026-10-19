-- Foundation: profiles table (must exist before anything else)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  email text DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor', 'lms_admin')),
  student_number text,
  phone text,
  avatar_url text,
  must_change_password boolean NOT NULL DEFAULT false,
  national_id text,
  date_of_birth date,
  gender text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  next_of_kin_name text,
  next_of_kin_phone text,
  next_of_kin_relationship text,
  department text,
  level_year text,
  academic_year text,
  student_status text NOT NULL DEFAULT 'active',
  program_id uuid,
  current_semester_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'lms_admin')));

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- is_admin helper (needed by other migrations)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- get_login_email for student ID login
CREATE OR REPLACE FUNCTION get_login_email(p_student_number text)
RETURNS text
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE
AS $$
  SELECT u.email FROM profiles p JOIN auth.users u ON u.id = p.id
  WHERE p.student_number = p_student_number LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION get_login_email(text) TO anon, authenticated;