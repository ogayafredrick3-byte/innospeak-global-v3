-- InnoSpeak Global: admission issuance, verification, registration, and profile-linking workflow.
-- Apply as a single Supabase migration after staging verification; do not execute piecemeal.
-- Existing student_number values are preserved; no user/auth records are deleted.

BEGIN;

-- 1. Add the fields used by the admissions UI and account-linking flow.
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS admission_number text,
  ADD COLUMN IF NOT EXISTS institutional_email text,
  ADD COLUMN IF NOT EXISTS admission_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS admission_issued_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admission_number text,
  ADD COLUMN IF NOT EXISTS institutional_email text,
  ADD COLUMN IF NOT EXISTS personal_email text;

-- 2. Preserve legacy student numbers by copying them only where the new field is empty.
UPDATE public.applications
SET admission_number = student_number
WHERE admission_number IS NULL
  AND student_number IS NOT NULL
  AND btrim(student_number) <> '';

UPDATE public.profiles
SET admission_number = student_number
WHERE admission_number IS NULL
  AND student_number IS NOT NULL
  AND btrim(student_number) <> '';

-- The previous migration used 'accepted'; normalize already-issued legacy admissions to the live 'approved' state.
UPDATE public.applications
SET status = 'approved'
WHERE status = 'accepted'
  AND (nullif(btrim(admission_number), '') IS NOT NULL OR nullif(btrim(student_number), '') IS NOT NULL);

-- Backfill the application/profile link only where a unique existing student number matches.
UPDATE public.applications a
SET admitted_profile_id = p.id
FROM public.profiles p
WHERE a.admitted_profile_id IS NULL
  AND a.student_number IS NOT NULL
  AND p.student_number = a.student_number;

-- Do not silently overwrite an existing student's personal email or student number.
UPDATE public.profiles p
SET personal_email = COALESCE(p.personal_email, p.email)
WHERE p.personal_email IS NULL AND p.email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS applications_admission_number_unique
  ON public.applications (admission_number)
  WHERE admission_number IS NOT NULL AND btrim(admission_number) <> '';
CREATE UNIQUE INDEX IF NOT EXISTS profiles_admission_number_unique
  ON public.profiles (admission_number)
  WHERE admission_number IS NOT NULL AND btrim(admission_number) <> '';

-- Institutional email addresses must be unique within each table,
-- case-insensitively. The same learner's address may exist in both tables.
CREATE UNIQUE INDEX IF NOT EXISTS applications_institutional_email_unique
  ON public.applications (lower(institutional_email))
  WHERE institutional_email IS NOT NULL AND btrim(institutional_email) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_institutional_email_unique
  ON public.profiles (lower(institutional_email))
  WHERE institutional_email IS NOT NULL AND btrim(institutional_email) <> '';

CREATE TABLE IF NOT EXISTS public.admission_course_abbreviation_overrides (
  course_code text PRIMARY KEY,
  abbreviation text NOT NULL CHECK (abbreviation ~ '^[A-Z]{3}$')
);

INSERT INTO public.admission_course_abbreviation_overrides(course_code, abbreviation)
VALUES
  ('ELE201','EEE'), ('PY101','PYT'), ('AI101','AIT'), ('ML101','MLT'),
  ('GO101','GOP'), ('K8S101','KTS'), ('K8S201','KTS'),
  ('DS101','DSA'), ('DS102','DSA'), ('DS103','DSA'), ('DS104','DSA'),
  ('DS105','DSA'), ('DS106','DSA'), ('DS107','DSA'), ('DS108','DSA'),
  ('DS109','DSA'), ('DS110','DSA'), ('DS111','DSA'), ('DS112','DSA'),
  ('DS113','DSA'), ('DS114','DSA'), ('DS115','DSA'), ('DS116','DSA'),
  ('DS117','DSA'), ('DS118','DSA'), ('DS119','DSA'), ('DS120','DSA'),
  ('DS121','DSA'), ('DS122','DSA'), ('DS123','DSA'), ('DS124','DSA'),
  ('CI101','CRT'), ('CI102','CRT'), ('CI103','CRT'), ('CI104','CRT'),
  ('CI105','CRT'), ('CI106','CRT'), ('CI107','CRT'), ('CI108','CRT'),
  ('CI109','CRT'), ('CI110','CRT'), ('CI111','CRT'), ('CI112','CRT'),
  ('CI113','CRT'), ('CI114','CRT'), ('CI115','CRT'), ('CI116','CRT'),
  ('CI117','CRT'), ('CI118','CRT'), ('CI119','CRT'), ('CI120','CRT')
ON CONFLICT (course_code) DO UPDATE SET abbreviation = EXCLUDED.abbreviation;

CREATE TABLE IF NOT EXISTS public.admission_number_course_year_sequence (
  abbreviation text NOT NULL CHECK (abbreviation ~ '^[A-Z]{3}$'),
  admission_year integer NOT NULL CHECK (admission_year BETWEEN 2000 AND 9999),
  last_value integer NOT NULL DEFAULT 0 CHECK (last_value BETWEEN 0 AND 9999),
  PRIMARY KEY (abbreviation, admission_year)
);
ALTER TABLE public.admission_number_course_year_sequence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admission_number_course_year_sequence FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.course_admission_abbreviation(p_course_code text)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  v_code text := upper(btrim(coalesce(p_course_code, '')));
  v_abbr text;
BEGIN
  IF v_code = '' THEN RAISE EXCEPTION 'A course code is required.'; END IF;
  SELECT abbreviation INTO v_abbr
  FROM public.admission_course_abbreviation_overrides WHERE course_code = v_code;
  IF v_abbr IS NULL THEN
    v_abbr := left(regexp_replace(v_code, '[^A-Z]', '', 'g'), 3);
  END IF;
  IF v_abbr !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'Course code % needs a three-letter abbreviation override.', v_code;
  END IF;
  RETURN v_abbr;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_admission_number(p_course_code text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  v_abbr text := public.course_admission_abbreviation(p_course_code);
  v_year integer := extract(year FROM current_date)::integer;
  v_serial integer;
  v_candidate text;
BEGIN
  INSERT INTO public.admission_number_course_year_sequence(abbreviation, admission_year, last_value)
  VALUES (v_abbr, v_year, 0)
  ON CONFLICT (abbreviation, admission_year) DO NOTHING;

  -- Seed from any already-issued new-format values before incrementing. Row update is concurrency-safe.
  UPDATE public.admission_number_course_year_sequence s
  SET last_value = greatest(s.last_value, coalesce((
    SELECT max(right(x.admission_number, 4)::integer)
    FROM (
      SELECT admission_number FROM public.applications
      UNION ALL
      SELECT admission_number FROM public.profiles
    ) x
    WHERE x.admission_number ~ ('^ISG' || v_abbr || right(v_year::text, 2) || '[0-9]{4}$')
  ), 0))
  WHERE s.abbreviation = v_abbr AND s.admission_year = v_year;

  UPDATE public.admission_number_course_year_sequence s
  SET last_value = s.last_value + 1
  WHERE s.abbreviation = v_abbr AND s.admission_year = v_year AND s.last_value < 9999
  RETURNING s.last_value INTO v_serial;
  IF v_serial IS NULL THEN
    RAISE EXCEPTION 'Admission-number capacity exhausted for % in %.', v_abbr, v_year;
  END IF;
  v_candidate := 'ISG' || v_abbr || right(v_year::text, 2) || lpad(v_serial::text, 4, '0');
  IF v_candidate !~ '^ISG[A-Z]{3}[0-9]{6}$' THEN RAISE EXCEPTION 'Generated admission number is invalid.'; END IF;
  RETURN v_candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_institutional_email(
  p_admission_number text,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL
)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  v_base text;
  v_suffix text;
  v_candidate text;
  v_attempt integer := 0;
BEGIN
  IF p_admission_number IS NULL OR btrim(p_admission_number) = '' THEN
    RAISE EXCEPTION 'Admission number is required.';
  END IF;
  v_base := lower(coalesce(nullif(btrim(p_first_name), ''), 'student') || '.' ||
                  coalesce(nullif(btrim(p_last_name), ''), 'user'));
  v_base := regexp_replace(v_base, '[^a-z0-9]+', '.', 'g');
  v_base := trim(both '.' from v_base);
  IF v_base = '' THEN v_base := 'student'; END IF;
  v_suffix := lower(regexp_replace(p_admission_number, '[^A-Za-z0-9]', '', 'g'));
  v_candidate := v_base || '.' || v_suffix || '@innospeak.global';
  WHILE EXISTS (SELECT 1 FROM public.applications WHERE institutional_email = v_candidate)
     OR EXISTS (SELECT 1 FROM public.profiles WHERE institutional_email = v_candidate) LOOP
    v_attempt := v_attempt + 1;
    v_candidate := v_base || '.' || v_suffix || '.' || v_attempt::text || '@innospeak.global';
  END LOOP;
  RETURN v_candidate;
END;
$$;

-- 3. Admin-only, transactional and idempotent approval. Uses live status value 'approved'.
CREATE OR REPLACE FUNCTION public.approve_application_with_admission(p_application_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, auth, pg_temp AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_app public.applications%ROWTYPE;
  v_admission_number text;
  v_institutional_email text;
  v_already_issued boolean := false;
BEGIN
  IF v_admin_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role IN ('admin', 'lms_admin')
  ) THEN
    RAISE EXCEPTION 'Administrator access is required.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_app FROM public.applications WHERE id = p_application_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found.' USING ERRCODE = 'P0002'; END IF;

  v_admission_number := nullif(btrim(v_app.admission_number), '');
  IF v_admission_number IS NULL THEN
    v_admission_number := nullif(btrim(v_app.student_number), '');
  END IF;
  IF v_admission_number IS NULL THEN
    IF nullif(btrim(v_app.course_code), '') IS NULL THEN
      RAISE EXCEPTION 'A course code is required before issuing an admission number.';
    END IF;
    v_admission_number := public.generate_admission_number(v_app.course_code);
  ELSE
    v_already_issued := true;
  END IF;

  v_institutional_email := coalesce(
    nullif(btrim(v_app.institutional_email), ''),
    public.generate_institutional_email(v_admission_number, v_app.first_name, v_app.last_name)
  );

  UPDATE public.applications
  SET status = 'approved',
      admission_number = v_admission_number,
      student_number = coalesce(nullif(btrim(student_number), ''), v_admission_number),
      institutional_email = v_institutional_email,
      admission_issued_at = coalesce(admission_issued_at, now()),
      admission_issued_by = coalesce(admission_issued_by, v_admin_id),
      reviewed_at = coalesce(reviewed_at, now())
  WHERE id = p_application_id;

  RETURN jsonb_build_object(
    'application_id', p_application_id,
    'status', 'approved',
    'admission_number', v_admission_number,
    'institutional_email', v_institutional_email,
    'already_issued', v_already_issued
  );
END;
$$;

-- 4. Public verification reveals only minimal application status and institutional email, never personal email.
CREATE OR REPLACE FUNCTION public.verify_admission_number(p_admission_number text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE v_app public.applications%ROWTYPE;
BEGIN
  IF nullif(btrim(coalesce(p_admission_number, '')), '') IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'already_registered', false);
  END IF;

  SELECT * INTO v_app
  FROM public.applications a
  WHERE upper(coalesce(a.admission_number, '')) = upper(btrim(p_admission_number))
     OR upper(coalesce(a.student_number, '')) = upper(btrim(p_admission_number))
  ORDER BY CASE WHEN a.status = 'approved' THEN 0 ELSE 1 END, a.created_at DESC
  LIMIT 1;

  IF NOT FOUND OR v_app.status <> 'approved' THEN
    RETURN jsonb_build_object('valid', false, 'already_registered', false);
  END IF;
  RETURN jsonb_build_object(
    'valid', true,
    'already_registered', v_app.admitted_profile_id IS NOT NULL OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE upper(coalesce(p.admission_number, '')) = upper(btrim(p_admission_number))
         OR upper(coalesce(p.student_number, '')) = upper(btrim(p_admission_number))
    ),
    'name', concat_ws(' ', v_app.first_name, v_app.middle_name, v_app.last_name),
    'institutional_email', v_app.institutional_email,
    'status', v_app.status
  );
END;
$$;

-- 5. Link newly-created profiles to approved applications by admission number.
CREATE OR REPLACE FUNCTION public.link_profile_to_admission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, auth, pg_temp AS $$
DECLARE v_app public.applications%ROWTYPE;
  v_meta_admission_number text;
BEGIN
  SELECT u.raw_user_meta_data ->> 'admission_number' INTO v_meta_admission_number
  FROM auth.users u WHERE u.id = NEW.id;
  IF NEW.admission_number IS NULL THEN
    NEW.admission_number := nullif(btrim(v_meta_admission_number), '');
  END IF;
  IF NEW.admission_number IS NULL THEN
    NEW.admission_number := nullif(btrim(NEW.student_number), '');
  END IF;
  IF NEW.admission_number IS NULL THEN RETURN NEW; END IF;

  SELECT * INTO v_app FROM public.applications a
  WHERE (upper(coalesce(a.admission_number, '')) = upper(NEW.admission_number)
      OR upper(coalesce(a.student_number, '')) = upper(NEW.admission_number))
    AND a.status = 'approved'
  ORDER BY a.created_at DESC
  LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Admission number is invalid or not approved.'; END IF;
  IF v_app.admitted_profile_id IS NOT NULL AND v_app.admitted_profile_id <> NEW.id THEN
    RAISE EXCEPTION 'Admission number is already linked to another account.';
  END IF;
  IF nullif(btrim(v_app.email), '') IS NULL
     OR nullif(btrim(NEW.email), '') IS NULL
     OR lower(btrim(v_app.email)) <> lower(btrim(NEW.email)) THEN
    RAISE EXCEPTION 'Use the same email address submitted with the admission application.';
  END IF;

  NEW.admission_number := coalesce(v_app.admission_number, v_app.student_number);
  NEW.student_number := coalesce(nullif(btrim(NEW.student_number), ''), NEW.admission_number);
  NEW.institutional_email := coalesce(NEW.institutional_email, v_app.institutional_email,
                                      public.generate_institutional_email(NEW.admission_number, v_app.first_name, v_app.last_name));
  NEW.personal_email := coalesce(NEW.personal_email, NEW.email);
  NEW.full_name := coalesce(nullif(btrim(NEW.full_name), ''), concat_ws(' ', v_app.first_name, v_app.middle_name, v_app.last_name));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_profile_admission ON public.profiles;
CREATE TRIGGER trg_link_profile_admission
BEFORE INSERT OR UPDATE OF admission_number, student_number ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.link_profile_to_admission();

-- Keep application link in sync after a matching profile is inserted/updated.
CREATE OR REPLACE FUNCTION public.sync_application_admission_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NEW.admission_number IS NOT NULL THEN
    UPDATE public.applications
    SET admitted_profile_id = NEW.id,
        admission_number = coalesce(admission_number, NEW.admission_number),
        student_number = coalesce(nullif(btrim(student_number), ''), NEW.student_number),
        institutional_email = coalesce(institutional_email, NEW.institutional_email)
    WHERE (upper(coalesce(admission_number, '')) = upper(NEW.admission_number)
        OR upper(coalesce(student_number, '')) = upper(NEW.admission_number))
      AND status = 'approved'
      AND (admitted_profile_id IS NULL OR admitted_profile_id = NEW.id);
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_sync_application_admission_profile ON public.profiles;
CREATE TRIGGER trg_sync_application_admission_profile
AFTER INSERT OR UPDATE OF admission_number, student_number ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_application_admission_profile();

-- Prevent browser-side status updates from bypassing the transactional approval RPC.
CREATE OR REPLACE FUNCTION public.enforce_application_approval_workflow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    IF TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'Applications cannot be inserted as approved; use the admin approval workflow.';
    ELSIF OLD.status IS DISTINCT FROM 'approved' THEN
      IF nullif(btrim(NEW.admission_number), '') IS NULL
         OR NEW.admission_issued_at IS NULL
         OR NEW.admission_issued_by IS NULL THEN
        RAISE EXCEPTION 'Approve applications through approve_application_with_admission so admission issuance is atomic.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_enforce_application_approval_workflow ON public.applications;
CREATE TRIGGER trg_enforce_application_approval_workflow
BEFORE INSERT OR UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.enforce_application_approval_workflow();

-- Legacy resolver is intentionally limited to the currently authenticated user's own profile.
CREATE OR REPLACE FUNCTION public.resolve_admission_login(p_admission_number text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public, auth, pg_temp AS $$
  SELECT p.email
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id = auth.uid()
    AND upper(coalesce(p.admission_number, p.student_number, '')) = upper(btrim(coalesce(p_admission_number, '')))
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.course_admission_abbreviation(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_admission_number(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_institutional_email(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.approve_application_with_admission(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_application_with_admission(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.verify_admission_number(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admission_number(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.resolve_admission_login(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_admission_login(text) TO authenticated;

COMMIT;
