-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  programme text DEFAULT '',
  intake text DEFAULT '',
  mode text DEFAULT '',
  country text DEFAULT '',
  city text DEFAULT '',
  address text DEFAULT '',
  education_level text DEFAULT '',
  institution text DEFAULT '',
  year_completed text DEFAULT '',
  english_proficiency text DEFAULT '',
  referral_source text DEFAULT '',
  documents jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_applications" ON applications;
CREATE POLICY "anon_insert_applications" ON applications
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_applications" ON applications;
CREATE POLICY "admin_select_applications" ON applications
  FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_update_applications" ON applications;
CREATE POLICY "admin_update_applications" ON applications
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_applications" ON applications;
CREATE POLICY "admin_delete_applications" ON applications
  FOR DELETE TO authenticated USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Tighten contact_messages (already exists) — replace broad policies with admin-only
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'contact_messages' AND cmd IN ('SELECT', 'UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON contact_messages', pol.policyname);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "admin_select_contact_messages" ON contact_messages;
CREATE POLICY "admin_select_contact_messages" ON contact_messages
  FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_update_contact_messages" ON contact_messages;
CREATE POLICY "admin_update_contact_messages" ON contact_messages
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_contact_messages" ON contact_messages;
CREATE POLICY "admin_delete_contact_messages" ON contact_messages
  FOR DELETE TO authenticated USING (is_admin());

-- Storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', false) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Anyone can upload application documents" ON storage.objects;
CREATE POLICY "Anyone can upload application documents" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'application-documents');