-- Course/year admission numbers: ISG + ABBR + YY + NNNN (12 characters).
-- Existing issued values are deliberately preserved; this migration only
-- validates new-format IDs and changes future issuance.

CREATE TABLE IF NOT EXISTS public.admission_course_abbreviation_overrides (
  course_code text PRIMARY KEY,
  abbreviation text NOT NULL CHECK (abbreviation ~ '^[A-Z]{3}$')
);

INSERT INTO public.admission_course_abbreviation_overrides(course_code, abbreviation)
VALUES
  ('ELE201', 'EEE'),
  ('PY101', 'PYT'),
  ('AI101', 'AIT'),
  ('ML101', 'MLT'),
  ('GO101', 'GOP'),
  ('K8S101', 'KTS'),
  ('K8S201', 'KTS'),
  ('DS101', 'DSA'),
  ('DS102', 'DSA'),
  ('DS103', 'DSA'),
  ('DS104', 'DSA'),
  ('DS105', 'DSA'),
  ('DS106', 'DSA'),
  ('DS107', 'DSA'),
  ('DS108', 'DSA'),
  ('DS109', 'DSA'),
  ('DS110', 'DSA'),
  ('DS111', 'DSA'),
  ('DS112', 'DSA'),
  ('DS113', 'DSA'),
  ('DS114', 'DSA'),
  ('DS115', 'DSA'),
  ('DS116', 'DSA'),
  ('DS117', 'DSA'),
  ('DS118', 'DSA'),
  ('DS119', 'DSA'),
  ('DS120', 'DSA'),
  ('DS121', 'DSA'),
  ('DS122', 'DSA'),
  ('DS123', 'DSA'),
  ('DS124', 'DSA'),
  ('CI101', 'CRT'),
  ('CI102', 'CRT'),
  ('CI103', 'CRT'),
  ('CI104', 'CRT'),
  ('CI105', 'CRT'),
  ('CI106', 'CRT'),
  ('CI107', 'CRT'),
  ('CI108', 'CRT'),
  ('CI109', 'CRT'),
  ('CI110', 'CRT'),
  ('CI111', 'CRT'),
  ('CI112', 'CRT'),
  ('CI113', 'CRT'),
  ('CI114', 'CRT'),
  ('CI115', 'CRT'),
  ('CI116', 'CRT'),
  ('CI117', 'CRT'),
  ('CI118', 'CRT'),
  ('CI119', 'CRT'),
  ('CI120', 'CRT')
ON CONFLICT (course_code) DO UPDATE
SET abbreviation = EXCLUDED.abbreviation;

CREATE TABLE IF NOT EXISTS public.admission_number_course_year_sequence (
  abbreviation text NOT NULL CHECK (abbreviation ~ '^[A-Z]{3}$'),
  admission_year integer NOT NULL CHECK (admission_year BETWEEN 2000 AND 9999),
  last_value integer NOT NULL DEFAULT 0 CHECK (last_value BETWEEN 0 AND 9999),
  PRIMARY KEY (abbreviation, admission_year)
);

ALTER TABLE public.admission_number_course_year_sequence ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.course_admission_abbreviation(p_course_code text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_code text := UPPER(BTRIM(COALESCE(p_course_code, '')));
  result text;
BEGIN
  IF normalized_code = '' THEN
    RAISE EXCEPTION 'A course code is required to issue an admission number.';
  END IF;

  SELECT abbreviation INTO result
  FROM public.admission_course_abbreviation_overrides
  WHERE course_code = normalized_code;

  IF result IS NULL THEN
    result := LEFT(REGEXP_REPLACE(normalized_code, '[^A-Z]', '', 'g'), 3);
  END IF;

  IF result !~ '^[A-Z]{3}$' THEN
    RAISE EXCEPTION 'Course code % does not resolve to a valid three-letter admission abbreviation.', normalized_code;
  END IF;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_admission_number(p_course_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  abbreviation text := public.course_admission_abbreviation(p_course_code);
  admission_year integer := EXTRACT(YEAR FROM CURRENT_DATE)::integer;
  serial_number integer;
  candidate text;
BEGIN
  INSERT INTO public.admission_number_course_year_sequence(abbreviation, admission_year, last_value)
  VALUES (abbreviation, admission_year, 0)
  ON CONFLICT (abbreviation, admission_year) DO NOTHING;

  -- Seed above any matching previously-issued number before allocating.
  UPDATE public.admission_number_course_year_sequence s
  SET last_value = GREATEST(
    s.last_value,
    COALESCE((
      SELECT MAX(RIGHT(x.admission_number, 4)::integer)
      FROM (
        SELECT admission_number FROM public.applications
        UNION ALL
        SELECT admission_number FROM public.profiles
      ) x
      WHERE x.admission_number ~ ('^ISG' || abbreviation || RIGHT(admission_year::text, 2) || '[0-9]{4}$')
    ), 0)
  )
  WHERE s.abbreviation = abbreviation AND s.admission_year = admission_year;

  UPDATE public.admission_number_course_year_sequence
  SET last_value = last_value + 1
  WHERE admission_number_course_year_sequence.abbreviation = abbreviation
    AND admission_number_course_year_sequence.admission_year = admission_year
    AND last_value < 9999
  RETURNING last_value INTO serial_number;

  IF serial_number IS NULL THEN
    RAISE EXCEPTION 'Admission serial capacity exhausted for course abbreviation % in year %.', abbreviation, admission_year;
  END IF;

  candidate := 'ISG' || abbreviation || RIGHT(admission_year::text, 2) || LPAD(serial_number::text, 4, '0');
  IF LENGTH(candidate) <> 12 OR candidate !~ '^ISG[A-Z]{3}[0-9]{6}$' THEN
    RAISE EXCEPTION 'Generated admission number failed validation.';
  END IF;
  RETURN candidate;
END;
$$;

-- New-format IDs are constrained. Legacy hyphenated values are retained as-is.
ALTER TABLE public.applications
  ADD CONSTRAINT applications_admission_number_format_check
  CHECK (
    admission_number IS NULL
    OR admission_number ~ '^ISG[A-Z]{3}[0-9]{6}$'
    OR admission_number ~ '^ISG-[0-9]{4}-[0-9]{4,5}$'
  ) NOT VALID;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_admission_number_format_check
  CHECK (
    admission_number IS NULL
    OR admission_number ~ '^ISG[A-Z]{3}[0-9]{6}$'
    OR admission_number ~ '^ISG-[0-9]{4}-[0-9]{4,5}$'
  ) NOT VALID;

CREATE OR REPLACE FUNCTION public.approve_application_with_admission(p_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_row public.applications%ROWTYPE;
  adm text;
  inst text;
  caller uuid := auth.uid();
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = caller AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins may approve applications.';
  END IF;

  SELECT * INTO app_row
  FROM public.applications
  WHERE id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found.';
  END IF;

  IF app_row.admission_number IS NOT NULL THEN
    RETURN jsonb_build_object(
      'admission_number', app_row.admission_number,
      'institutional_email', app_row.institutional_email,
      'already_issued', true
    );
  END IF;

  IF COALESCE(BTRIM(app_row.course_code), '') = '' THEN
    RAISE EXCEPTION 'A course code is required before issuing a course-based admission number.';
  END IF;

  adm := public.generate_admission_number(app_row.course_code);
  inst := public.generate_institutional_email(adm, app_row.first_name, app_row.last_name);

  UPDATE public.applications
  SET status = 'accepted',
      admission_number = adm,
      student_number = adm,
      institutional_email = inst,
      admission_issued_at = now(),
      admission_issued_by = caller
  WHERE id = p_application_id;

  RETURN jsonb_build_object(
    'admission_number', adm,
    'student_number', adm,
    'institutional_email', inst,
    'already_issued', false
  );
END;
$$;

-- Link newly created profiles by the exact supplied admission number first.
CREATE OR REPLACE FUNCTION public.link_profile_to_admission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supplied_number text := UPPER(BTRIM(COALESCE(NEW.admission_number, NEW.student_number, '')));
  user_email text;
  app_row public.applications%ROWTYPE;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

  IF supplied_number <> '' THEN
    SELECT * INTO app_row
    FROM public.applications
    WHERE admission_number = supplied_number
    FOR UPDATE;

    IF NOT FOUND OR app_row.status <> 'accepted' THEN
      RAISE EXCEPTION 'Admission number is invalid or has not been issued.';
    END IF;
    IF user_email IS NULL OR LOWER(user_email) <> LOWER(app_row.email) THEN
      RAISE EXCEPTION 'The account email must match the email on the admitted application.';
    END IF;

    NEW.admission_number := app_row.admission_number;
    NEW.student_number := app_row.admission_number;
    NEW.institutional_email := app_row.institutional_email;
    NEW.personal_email := user_email;
    UPDATE public.applications SET admitted_profile_id = NEW.id WHERE id = app_row.id;
    RETURN NEW;
  END IF;

  -- Preserve legacy email-based linking for existing hyphenated admission IDs.
  IF user_email IS NULL OR user_email = '' THEN
    RETURN NEW;
  END IF;
  SELECT * INTO app_row
  FROM public.applications
  WHERE LOWER(email) = LOWER(user_email)
    AND admission_number IS NOT NULL
  ORDER BY admission_issued_at DESC NULLS LAST
  LIMIT 1;

  IF FOUND THEN
    NEW.admission_number := app_row.admission_number;
    NEW.student_number := COALESCE(NEW.student_number, app_row.admission_number);
    NEW.institutional_email := app_row.institutional_email;
    NEW.personal_email := user_email;
    UPDATE public.applications SET admitted_profile_id = NEW.id WHERE id = app_row.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_admission_number(p_admission_number text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text := UPPER(BTRIM(COALESCE(p_admission_number, '')));
  app_row public.applications%ROWTYPE;
  already boolean;
BEGIN
  IF normalized = '' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'empty');
  END IF;
  IF normalized !~ '^ISG[A-Z]{3}[0-9]{6}$'
     AND normalized !~ '^ISG-[0-9]{4}-[0-9]{4,5}$' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'format');
  END IF;

  SELECT * INTO app_row FROM public.applications WHERE admission_number = normalized LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  already := EXISTS (SELECT 1 FROM public.profiles WHERE admission_number = normalized);
  RETURN jsonb_build_object(
    'valid', true,
    'already_registered', already,
    'name', TRIM(COALESCE(app_row.first_name, '') || ' ' || COALESCE(app_row.last_name, '')),
    'email', COALESCE(app_row.email, ''),
    'institutional_email', app_row.institutional_email,
    'status', app_row.status
  );
END;
$$;

-- Rebind auth/profile registration with explicit admission-number precedence.
DROP TRIGGER IF EXISTS trg_link_profile_admission ON public.profiles;
CREATE TRIGGER trg_link_profile_admission
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.link_profile_to_admission();

-- Do not let client roles allocate numbers directly.
REVOKE ALL ON FUNCTION public.course_admission_abbreviation(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_admission_number(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admission_number(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_application_with_admission(uuid) TO authenticated;
