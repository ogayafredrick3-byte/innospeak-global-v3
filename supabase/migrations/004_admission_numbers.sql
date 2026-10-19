-- ============================================================
-- Admission Numbers — ISG-YYYY-NNNNN
-- ============================================================

-- 1. applications: admission fields
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS admission_number      text,
  ADD COLUMN IF NOT EXISTS institutional_email   text,
  ADD COLUMN IF NOT EXISTS admission_issued_at   timestamptz,
  ADD COLUMN IF NOT EXISTS admission_issued_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_applications_admission_number
  ON applications(admission_number) WHERE admission_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_applications_institutional_email
  ON applications(institutional_email) WHERE institutional_email IS NOT NULL;

-- 2. profiles: admission fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS admission_number     text,
  ADD COLUMN IF NOT EXISTS institutional_email  text,
  ADD COLUMN IF NOT EXISTS personal_email       text,
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_admission_number
  ON profiles(admission_number) WHERE admission_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_institutional_email
  ON profiles(institutional_email) WHERE institutional_email IS NOT NULL;

-- Optional one-liner if your existing profiles.student_number already
-- holds an admission number and you want to migrate it:
-- UPDATE profiles SET admission_number = student_number
--   WHERE student_number IS NOT NULL AND admission_number IS NULL;

-- 3. sequence table
CREATE TABLE IF NOT EXISTS admission_number_sequence (
  year       integer PRIMARY KEY,
  last_value integer NOT NULL DEFAULT 0
);
ALTER TABLE admission_number_sequence ENABLE ROW LEVEL SECURITY;
-- No policies on purpose — reachable only via SECURITY DEFINER functions.

-- 4. admission number generator
CREATE OR REPLACE FUNCTION generate_admission_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  y integer := EXTRACT(YEAR FROM now())::integer;
  n integer;
  candidate text;
BEGIN
  INSERT INTO admission_number_sequence (year, last_value)
  VALUES (y, 1)
  ON CONFLICT (year)
  DO UPDATE SET last_value = admission_number_sequence.last_value + 1
  RETURNING last_value INTO n;

  candidate := 'ISG-' || y || '-' || LPAD(n::text, 5, '0');

  WHILE EXISTS (SELECT 1 FROM applications WHERE admission_number = candidate)
     OR EXISTS (SELECT 1 FROM profiles     WHERE admission_number = candidate) LOOP
    UPDATE admission_number_sequence SET last_value = last_value + 1
      WHERE year = y RETURNING last_value INTO n;
    candidate := 'ISG-' || y || '-' || LPAD(n::text, 5, '0');
  END LOOP;

  RETURN candidate;
END;
$$;

-- 5. institutional email generator
-- e.g. john.doe.00123@innospeak.global
CREATE OR REPLACE FUNCTION generate_institutional_email(
  p_admission_number text,
  p_first_name       text,
  p_last_name        text
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base text;
  suffix text;
  candidate text;
  i integer := 0;
BEGIN
  suffix := RIGHT(p_admission_number, 5);
  base := LOWER(
    COALESCE(NULLIF(TRIM(p_first_name), ''), 'student') || '.' ||
    COALESCE(NULLIF(TRIM(p_last_name),  '') , 'user')
  );
  base := REGEXP_REPLACE(base, '[^a-z0-9]+', '.', 'g');
  base := TRIM(BOTH '.' FROM base);
  IF base = '' THEN base := 'student'; END IF;

  candidate := base || '.' || suffix || '@innospeak.global';

  WHILE EXISTS (SELECT 1 FROM applications WHERE institutional_email = candidate)
     OR EXISTS (SELECT 1 FROM profiles     WHERE institutional_email = candidate) LOOP
    i := i + 1;
    candidate := base || '.' || suffix || '.' || i || '@innospeak.global';
  END LOOP;

  RETURN candidate;
END;
$$;

-- 6. approve + issue (admin only)
CREATE OR REPLACE FUNCTION approve_application_with_admission(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_row applications%ROWTYPE;
  adm  text;
  inst text;
  caller uuid := auth.uid();
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = caller AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins may approve applications.';
  END IF;

  SELECT * INTO app_row FROM applications WHERE id = p_application_id;
  IF app_row IS NULL THEN
    RAISE EXCEPTION 'Application not found.';
  END IF;

  IF app_row.admission_number IS NOT NULL THEN
    RETURN jsonb_build_object(
      'admission_number',    app_row.admission_number,
      'institutional_email', app_row.institutional_email,
      'already_issued',      true
    );
  END IF;

  adm  := generate_admission_number();
  inst := generate_institutional_email(adm, app_row.first_name, app_row.last_name);

  UPDATE applications
  SET status                = 'accepted',
      admission_number      = adm,
      institutional_email   = inst,
      admission_issued_at   = now(),
      admission_issued_by   = caller
  WHERE id = p_application_id;

  RETURN jsonb_build_object(
    'admission_number',    adm,
    'institutional_email', inst,
    'already_issued',      false
  );
END;
$$;

-- 7. verify admission number (public — used by /register)
CREATE OR REPLACE FUNCTION verify_admission_number(p_admission_number text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text := UPPER(TRIM(p_admission_number));
  app_row    applications%ROWTYPE;
  already    boolean;
BEGIN
  IF normalized IS NULL OR normalized = '' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'empty');
  END IF;

  SELECT * INTO app_row FROM applications WHERE admission_number = normalized LIMIT 1;
  IF app_row IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  already := EXISTS (SELECT 1 FROM profiles WHERE admission_number = normalized);

  RETURN jsonb_build_object(
    'valid',                true,
    'already_registered',   already,
    'name',                 TRIM(COALESCE(app_row.first_name,'') || ' ' || COALESCE(app_row.last_name,'')),
    'email',                COALESCE(app_row.email, ''),
    'institutional_email',  app_row.institutional_email,
    'status',               app_row.status
  );
END;
$$;

-- 8. resolve admission number → personal email (public — used by /login)
CREATE OR REPLACE FUNCTION resolve_admission_login(p_admission_number text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text := UPPER(TRIM(p_admission_number));
  result text;
BEGIN
  IF normalized IS NULL OR normalized = '' THEN RETURN NULL; END IF;

  SELECT COALESCE(personal_email, email) INTO result
  FROM profiles
  WHERE admission_number = normalized
  LIMIT 1;

  RETURN result;
END;
$$;

-- 9. Trigger — auto-link profile to approved application on signup
CREATE OR REPLACE FUNCTION link_profile_to_admission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  app_row    applications%ROWTYPE;
BEGIN
  IF NEW.admission_number IS NOT NULL THEN
    RETURN NEW;  -- already linked
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  IF user_email IS NULL OR user_email = '' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO app_row
  FROM applications
  WHERE LOWER(email) = LOWER(user_email)
    AND admission_number IS NOT NULL
  ORDER BY admission_issued_at DESC NULLS LAST
  LIMIT 1;

  IF app_row IS NULL THEN
    RETURN NEW;  -- regular signup, not an admitted student
  END IF;

  NEW.admission_number    := app_row.admission_number;
  NEW.institutional_email := app_row.institutional_email;
  NEW.personal_email      := user_email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_profile_admission ON profiles;
CREATE TRIGGER trg_link_profile_admission
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_profile_to_admission();

-- 10. Grants
GRANT EXECUTE ON FUNCTION verify_admission_number(text)         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION resolve_admission_login(text)         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION approve_application_with_admission(uuid) TO authenticated;