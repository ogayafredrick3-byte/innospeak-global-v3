-- Payment and enrollment security hardening.
-- Adds canonical course prices, creates payments storage if missing, prevents
-- browser-created payment records and blocks direct self-enrolment in paid courses.
-- Payment confirmation is reserved for the trusted server-side Edge Functions.
BEGIN;

ALTER TABLE public.lms_courses
  ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS price_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_currency text NOT NULL DEFAULT 'KES';

UPDATE public.lms_courses AS course
SET is_free = price.is_free,
    price_amount = price.amount,
    price_currency = price.currency,
    updated_at = now()
FROM (VALUES
    ('ENG101', true, 0, 'KES'),
    ('ENG102', false, 14000, 'KES'),
    ('ENG103', false, 16000, 'KES'),
    ('ENG104', false, 14000, 'KES'),
    ('ENG105', false, 14000, 'KES'),
    ('ENG106', false, 12000, 'KES'),
    ('ENG107', false, 12000, 'KES'),
    ('ENG108', false, 14000, 'KES'),
    ('ENG109', false, 12000, 'KES'),
    ('ENG110', false, 12000, 'KES'),
    ('ENG111', true, 0, 'KES'),
    ('ENG112', false, 12000, 'KES'),
    ('ENG113', false, 12000, 'KES'),
    ('ENG114', false, 14000, 'KES'),
    ('ENG115', false, 14000, 'KES'),
    ('ENG116', false, 12000, 'KES'),
    ('ENG117', false, 8000, 'KES'),
    ('SWA101', false, 15000, 'KES'),
    ('FRE101', false, 18000, 'KES'),
    ('SPA101', false, 18000, 'KES'),
    ('GER101', false, 18000, 'KES'),
    ('MAN101', false, 20000, 'KES'),
    ('JPN101', false, 20000, 'KES'),
    ('ARB101', false, 18000, 'KES'),
    ('POR101', false, 16000, 'KES'),
    ('ITA101', false, 16000, 'KES'),
    ('RUS101', false, 16000, 'KES'),
    ('KOR101', false, 18000, 'KES'),
    ('TUR101', false, 15000, 'KES'),
    ('SOM101', false, 12000, 'KES'),
    ('IEL101', false, 18000, 'KES'),
    ('IEL102', false, 16000, 'KES'),
    ('TOF101', false, 18000, 'KES'),
    ('PTE101', false, 16000, 'KES'),
    ('DET101', false, 10000, 'KES'),
    ('SAT101', false, 22000, 'KES'),
    ('GRE101', false, 24000, 'KES'),
    ('GMA101', false, 24000, 'KES'),
    ('CAM101', false, 20000, 'KES'),
    ('IGC101', false, 20000, 'KES'),
    ('IGC201', false, 24000, 'KES'),
    ('IGC301', false, 26000, 'KES'),
    ('IGC401', false, 28000, 'KES'),
    ('IBD101', false, 28000, 'KES'),
    ('EDX101', false, 24000, 'KES'),
    ('APC101', false, 28000, 'KES'),
    ('TOE101', false, 16000, 'KES'),
    ('TVT101', false, 20000, 'KES'),
    ('TVI101', false, 18000, 'KES'),
    ('TVB101', false, 16000, 'KES'),
    ('TVA101', false, 16000, 'KES'),
    ('TVH101', false, 16000, 'KES'),
    ('CBE101', false, 14000, 'KES'),
    ('EDR101', false, 14000, 'KES'),
    ('ELI101', false, 18000, 'KES'),
    ('ELN101', false, 18000, 'KES'),
    ('EMA101', false, 16000, 'KES'),
    ('TVE101', false, 14000, 'KES'),
    ('REN101', false, 18000, 'KES'),
    ('SOL101', false, 18000, 'KES'),
    ('ICT101', true, 0, 'KES'),
    ('ICT102', false, 14000, 'KES'),
    ('ICT301', false, 14000, 'KES'),
    ('ICT201', false, 10000, 'KES'),
    ('ICT202', false, 12000, 'KES'),
    ('ICT204', false, 25000, 'KES'),
    ('COD101', true, 0, 'KES'),
    ('PY101', false, 16000, 'KES'),
    ('AIF101', true, 0, 'KES'),
    ('AI101', false, 14000, 'KES'),
    ('CYB101', true, 0, 'KES'),
    ('DLP101', true, 0, 'KES'),
    ('DLP102', false, 4000, 'KES'),
    ('DLP103', false, 4000, 'KES'),
    ('DLP104', false, 5000, 'KES'),
    ('DLP105', true, 0, 'KES'),
    ('DLP106', false, 12000, 'KES'),
    ('PHO101', false, 16000, 'KES'),
    ('AFX101', false, 18000, 'KES'),
    ('PRE101', false, 16000, 'KES'),
    ('IND101', false, 14000, 'KES'),
    ('VDE101', false, 14000, 'KES'),
    ('VDG101', false, 12000, 'KES'),
    ('GRD101', false, 16000, 'KES'),
    ('PSD101', false, 18000, 'KES'),
    ('ILL101', false, 16000, 'KES'),
    ('FIG101', false, 14000, 'KES'),
    ('UIX101', false, 16000, 'KES'),
    ('UID101', false, 16000, 'KES'),
    ('UXD101', false, 16000, 'KES'),
    ('MOG101', false, 16000, 'KES'),
    ('MOT101', false, 18000, 'KES'),
    ('POD101', false, 12000, 'KES'),
    ('BRD101', false, 16000, 'KES'),
    ('CCN101', false, 12000, 'KES'),
    ('BUS101', false, 16000, 'KES'),
    ('BUS102', false, 14000, 'KES'),
    ('BUS103', false, 18000, 'KES'),
    ('BUS104', false, 16000, 'KES'),
    ('BUS105', false, 18000, 'KES'),
    ('BUS106', false, 14000, 'KES'),
    ('BUS107', false, 22000, 'KES'),
    ('BUS108', false, 18000, 'KES'),
    ('BUS109', false, 14000, 'KES'),
    ('HRM101', false, 18000, 'KES'),
    ('SLM101', false, 16000, 'KES'),
    ('BAN101', false, 20000, 'KES'),
    ('FIN101', false, 10000, 'KES'),
    ('PMG101', false, 18000, 'KES'),
    ('ENT101', false, 18000, 'KES'),
    ('LDR101', false, 14000, 'KES'),
    ('UPW101', false, 12000, 'KES'),
    ('FIV101', false, 12000, 'KES'),
    ('VAS101', false, 12000, 'KES'),
    ('DEN101', false, 8000, 'KES'),
    ('AIP101', false, 14000, 'KES'),
    ('ACW101', false, 15000, 'KES'),
    ('TWR101', false, 15000, 'KES'),
    ('TUT101', false, 12000, 'KES'),
    ('LKD101', true, 0, 'KES'),
    ('FRL101', false, 8000, 'KES'),
    ('FRL102', false, 8000, 'KES'),
    ('FRL103', false, 6000, 'KES'),
    ('FRL104', false, 16000, 'KES'),
    ('FRL105', false, 14000, 'KES'),
    ('FRL106', false, 16000, 'KES'),
    ('FRL107', false, 16000, 'KES'),
    ('CVW101', true, 0, 'KES'),
    ('ITP101', true, 0, 'KES'),
    ('EMP101', false, 10000, 'KES'),
    ('WET101', false, 8000, 'KES'),
    ('CRD102', false, 5000, 'KES'),
    ('CRD103', false, 5000, 'KES'),
    ('CRD104', false, 16000, 'KES'),
    ('CRD105', false, 8000, 'KES'),
    ('CRD106', false, 18000, 'KES'),
    ('CRD107', false, 8000, 'KES'),
    ('SAP101', false, 16000, 'KES'),
    ('SCH101', false, 14000, 'KES'),
    ('IMD101', false, 14000, 'KES'),
    ('IJR101', false, 14000, 'KES'),
    ('OEP101', false, 10000, 'KES'),
    ('EDT101', false, 16000, 'KES'),
    ('EDT102', false, 12000, 'KES'),
    ('EDT103', false, 14000, 'KES'),
    ('EDT104', false, 20000, 'KES'),
    ('EDT105', false, 14000, 'KES'),
    ('EDT106', false, 20000, 'KES'),
    ('EDT107', false, 18000, 'KES'),
    ('EDT108', true, 0, 'KES'),
    ('EDT109', false, 14000, 'KES'),
    ('EDT110', false, 8000, 'KES'),
    ('HSP101', false, 16000, 'KES'),
    ('HSP102', false, 16000, 'KES'),
    ('HSP103', false, 12000, 'KES'),
    ('HSP104', false, 12000, 'KES'),
    ('HSP105', false, 8000, 'KES'),
    ('HSP106', false, 12000, 'KES'),
    ('HSP107', false, 14000, 'KES'),
    ('CUS101', false, 10000, 'KES'),
    ('PDS101', false, 8000, 'KES'),
    ('PDS102', false, 8000, 'KES'),
    ('PDS103', false, 8000, 'KES'),
    ('PDS104', false, 8000, 'KES'),
    ('PDS105', false, 6000, 'KES'),
    ('PDS106', false, 10000, 'KES'),
    ('PDS107', false, 8000, 'KES'),
    ('CQI101', false, 8000, 'KES'),
    ('GBC101', false, 8000, 'KES'),
    ('ML101', false, 28000, 'KES'),
    ('JAV101', false, 20000, 'KES'),
    ('JSC101', false, 18000, 'KES'),
    ('REA101', false, 18000, 'KES'),
    ('WEB101', true, 0, 'KES'),
    ('MOB101', false, 20000, 'KES'),
    ('CLD101', false, 22000, 'KES'),
    ('NET101', false, 24000, 'KES'),
    ('LNX101', false, 18000, 'KES'),
    ('CYB201', false, 22000, 'KES'),
    ('DSC101', false, 26000, 'KES'),
    ('SQL101', false, 14000, 'KES'),
    ('ELE201', false, 26000, 'KES'),
    ('ELC101', false, 26000, 'KES'),
    ('PLC101', false, 22000, 'KES'),
    ('CAD101', false, 18000, 'KES'),
    ('CIV101', false, 26000, 'KES'),
    ('MEC101', false, 26000, 'KES'),
    ('MTR101', false, 24000, 'KES'),
    ('ROB101', false, 28000, 'KES'),
    ('IAT101', false, 24000, 'KES'),
    ('IOT101', false, 20000, 'KES'),
    ('TDP101', false, 14000, 'KES'),
    ('AIF102', false, 24000, 'KES'),
    ('AIF103', false, 26000, 'KES'),
    ('AIF104', false, 24000, 'KES'),
    ('AIF105', false, 26000, 'KES'),
    ('AIF106', false, 20000, 'KES'),
    ('AIF107', false, 22000, 'KES'),
    ('AIF108', false, 24000, 'KES'),
    ('AIF109', false, 20000, 'KES'),
    ('AIF110', false, 22000, 'KES'),
    ('AIF111', false, 22000, 'KES'),
    ('AIF112', false, 26000, 'KES'),
    ('AIF113', false, 28000, 'KES'),
    ('AIF114', false, 18000, 'KES'),
    ('AIF115', false, 24000, 'KES'),
    ('AIF116', false, 28000, 'KES'),
    ('AIF117', false, 24000, 'KES'),
    ('AIF118', false, 22000, 'KES'),
    ('AIF119', false, 22000, 'KES'),
    ('AIF120', false, 28000, 'KES'),
    ('AIF121', false, 28000, 'KES'),
    ('AIF122', false, 18000, 'KES'),
    ('AIF123', false, 26000, 'KES'),
    ('AIF124', false, 26000, 'KES'),
    ('AIF125', false, 28000, 'KES'),
    ('AIF126', false, 30000, 'KES'),
    ('TYP101', false, 20000, 'KES'),
    ('GO101', false, 22000, 'KES'),
    ('RST101', false, 24000, 'KES'),
    ('CPP101', false, 24000, 'KES'),
    ('FSE101', false, 24000, 'KES'),
    ('BSE101', false, 24000, 'KES'),
    ('FSE201', false, 30000, 'KES'),
    ('SSE101', false, 28000, 'KES'),
    ('SSE102', false, 26000, 'KES'),
    ('SSE103', false, 28000, 'KES'),
    ('SSE104', false, 22000, 'KES'),
    ('SSE105', false, 22000, 'KES'),
    ('SSE106', false, 22000, 'KES'),
    ('SSE107', false, 24000, 'KES'),
    ('SSE108', false, 14000, 'KES'),
    ('SSE109', false, 16000, 'KES'),
    ('SSE110', false, 20000, 'KES'),
    ('SSE111', false, 24000, 'KES'),
    ('SSE112', false, 22000, 'KES'),
    ('SSE113', false, 20000, 'KES'),
    ('SSE114', false, 26000, 'KES'),
    ('SSE115', false, 26000, 'KES'),
    ('SSE116', false, 22000, 'KES'),
    ('SSE117', false, 22000, 'KES'),
    ('SSE118', false, 18000, 'KES'),
    ('SSE119', false, 24000, 'KES'),
    ('AWS101', false, 20000, 'KES'),
    ('AWS201', false, 28000, 'KES'),
    ('AZU101', false, 20000, 'KES'),
    ('AZU201', false, 28000, 'KES'),
    ('GCP101', false, 20000, 'KES'),
    ('DOC101', false, 22000, 'KES'),
    ('DOC201', false, 14000, 'KES'),
    ('K8S101', false, 28000, 'KES'),
    ('K8S201', false, 30000, 'KES'),
    ('TFM101', false, 24000, 'KES'),
    ('TFM201', false, 26000, 'KES'),
    ('ANS101', false, 22000, 'KES'),
    ('CICD101', false, 20000, 'KES'),
    ('CICD102', false, 20000, 'KES'),
    ('SRV101', false, 24000, 'KES'),
    ('DSO101', false, 26000, 'KES'),
    ('CSE101', false, 28000, 'KES'),
    ('MON101', false, 22000, 'KES'),
    ('PGM101', false, 20000, 'KES'),
    ('ELK101', false, 22000, 'KES'),
    ('CNE101', false, 24000, 'KES'),
    ('CCO101', false, 20000, 'KES'),
    ('IAC101', false, 26000, 'KES'),
    ('SRE101', false, 28000, 'KES'),
    ('CHE101', false, 22000, 'KES'),
    ('DS101', false, 22000, 'KES'),
    ('DS102', false, 20000, 'KES'),
    ('DS103', false, 22000, 'KES'),
    ('DS104', false, 20000, 'KES'),
    ('DS105', false, 20000, 'KES'),
    ('DS106', false, 16000, 'KES'),
    ('DS107', false, 26000, 'KES'),
    ('DS108', false, 28000, 'KES'),
    ('DS109', false, 28000, 'KES'),
    ('DS110', false, 28000, 'KES'),
    ('DS111', false, 28000, 'KES'),
    ('DS112', false, 26000, 'KES'),
    ('DS113', false, 24000, 'KES'),
    ('DS114', false, 26000, 'KES'),
    ('DS115', false, 26000, 'KES'),
    ('DS116', false, 24000, 'KES'),
    ('DS117', false, 24000, 'KES'),
    ('DS118', false, 26000, 'KES'),
    ('DS119', false, 22000, 'KES'),
    ('DS120', false, 18000, 'KES'),
    ('DS121', false, 20000, 'KES'),
    ('DS122', false, 22000, 'KES'),
    ('DS123', false, 28000, 'KES'),
    ('DS124', false, 24000, 'KES'),
    ('ENG201', false, 26000, 'KES'),
    ('ENG202', false, 26000, 'KES'),
    ('ENG203', false, 28000, 'KES'),
    ('ENG204', false, 26000, 'KES'),
    ('ENG205', false, 24000, 'KES'),
    ('ENG206', false, 26000, 'KES'),
    ('ENG207', false, 24000, 'KES'),
    ('ENG208', false, 28000, 'KES'),
    ('ENG209', false, 22000, 'KES'),
    ('ENG210', false, 24000, 'KES'),
    ('ENG211', false, 30000, 'KES'),
    ('CI101', false, 18000, 'KES'),
    ('CI102', false, 14000, 'KES'),
    ('CI103', false, 18000, 'KES'),
    ('CI104', false, 22000, 'KES'),
    ('CI105', false, 24000, 'KES'),
    ('CI106', false, 26000, 'KES'),
    ('CI107', false, 28000, 'KES'),
    ('CI108', false, 24000, 'KES'),
    ('CI109', false, 26000, 'KES'),
    ('CI110', false, 26000, 'KES'),
    ('CI111', false, 28000, 'KES'),
    ('CI112', false, 24000, 'KES'),
    ('CI113', false, 28000, 'KES'),
    ('CI114', false, 18000, 'KES'),
    ('CI115', false, 22000, 'KES'),
    ('CI116', false, 24000, 'KES'),
    ('CI117', false, 22000, 'KES'),
    ('CI118', false, 24000, 'KES'),
    ('CI119', false, 28000, 'KES'),
    ('CI120', false, 22000, 'KES'),
    ('GIT101', false, 1300, 'KES'),
    ('FSW101', false, 5850, 'KES'),
    ('AID101', false, 3900, 'KES'),
    ('DTL101', true, 0, 'KES'),
    ('EXL101', false, 1950, 'KES'),
    ('PBI101', false, 3250, 'KES'),
    ('PYD101', false, 2860, 'KES'),
    ('DEG101', false, 5200, 'KES'),
    ('AIA101', false, 4550, 'KES'),
    ('GEN101', false, 3640, 'KES'),
    ('AWSC101', false, 3250, 'KES'),
    ('AWS102', false, 5850, 'KES'),
    ('AZR101', false, 2860, 'KES'),
    ('DVO101', false, 3640, 'KES'),
    ('DKR101', false, 5200, 'KES'),
    ('CYB301', false, 3900, 'KES'),
    ('CYB302', false, 4160, 'KES'),
    ('CYB303', false, 3900, 'KES'),
    ('CYB304', false, 4160, 'KES'),
    ('CYB305', false, 3900, 'KES'),
    ('CYB306', false, 4550, 'KES'),
    ('CYB307', false, 4550, 'KES'),
    ('AIL101', true, 0, 'KES'),
    ('PDS108', false, 1560, 'KES'),
    ('PDS109', false, 1300, 'KES'),
    ('BUS110', false, 2600, 'KES'),
    ('ECM101', false, 1950, 'KES'),
    ('AIV101', false, 2860, 'KES'),
    ('AII101', false, 2340, 'KES'),
    ('CRD108', false, 1300, 'KES'),
    ('EDT111', false, 2340, 'KES'),
    ('EDT112', false, 2340, 'KES'),
    ('EDT113', false, 2340, 'KES'),
    ('EDT114', false, 2600, 'KES'),
    ('EDT115', false, 2340, 'KES'),
    ('HSP108', false, 2600, 'KES'),
    ('HSP109', false, 2600, 'KES'),
    ('HSP110', false, 2340, 'KES'),
    ('HSP111', false, 2600, 'KES'),
    ('HSP112', false, 1560, 'KES'),
    ('CBET101', false, 2860, 'KES'),
    ('CBET102', false, 2860, 'KES'),
    ('PDS110', false, 1300, 'KES'),
    ('PDS111', false, 1560, 'KES'),
    ('PDS112', false, 1560, 'KES')
) AS price(code, is_free, amount, currency)
WHERE course.code = price.code;

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.lms_courses(id) ON DELETE SET NULL,
  course_code text,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'KES',
  provider text NOT NULL CHECK (provider IN ('mpesa', 'paypal')),
  phone text,
  status text NOT NULL DEFAULT 'pending',
  provider_transaction_id text,
  provider_checkout_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS student_id uuid,
  ADD COLUMN IF NOT EXISTS course_id uuid,
  ADD COLUMN IF NOT EXISTS course_code text,
  ADD COLUMN IF NOT EXISTS amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'KES',
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS provider_transaction_id text,
  ADD COLUMN IF NOT EXISTS provider_checkout_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_payments_student_created ON public.payments(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_course_code ON public.payments(course_code);
CREATE INDEX IF NOT EXISTS idx_payments_provider_transaction ON public.payments(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_checkout ON public.payments(provider_checkout_id);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Remove historical permissive policies so payment privacy is deterministic.
DO $$
DECLARE policy_row record;
BEGIN
  FOR policy_row IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.payments', policy_row.policyname);
  END LOOP;
END $$;

CREATE POLICY payments_select_owner_or_admin ON public.payments
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR is_lms_admin());

REVOKE ALL ON TABLE public.payments FROM anon, authenticated;
GRANT SELECT ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;

-- Prices are server-owned. The browser supplies a course code and provider,
-- never an authoritative amount, student ID, or payment status.
CREATE OR REPLACE FUNCTION public.create_course_payment(
  p_course_code text,
  p_provider text,
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_course public.lms_courses%ROWTYPE;
  v_payment public.payments%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF lower(COALESCE(p_provider, '')) NOT IN ('mpesa', 'paypal') THEN
    RAISE EXCEPTION 'Unsupported payment provider';
  END IF;
  IF lower(p_provider) = 'mpesa' AND COALESCE(trim(p_phone), '') = '' THEN
    RAISE EXCEPTION 'A phone number is required for M-PESA';
  END IF;

  SELECT * INTO v_course
  FROM public.lms_courses
  WHERE code = upper(trim(COALESCE(p_course_code, '')))
    AND status = 'published'
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Published course not found';
  END IF;
  IF v_course.is_free OR COALESCE(v_course.price_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'This course does not require a payment';
  END IF;

  INSERT INTO public.payments
    (student_id, course_id, course_code, amount, currency, provider, phone, status)
  VALUES
    (v_user_id, v_course.id, v_course.code, v_course.price_amount,
     COALESCE(v_course.price_currency, 'KES'), lower(p_provider), NULLIF(trim(p_phone), ''), 'pending')
  RETURNING * INTO v_payment;

  RETURN to_jsonb(v_payment);
END;
$$;

REVOKE ALL ON FUNCTION public.create_course_payment(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_course_payment(text, text, text) TO authenticated;

-- Replace permissive learner insert policies. Paid enrolments are created only
-- by confirm_payment_and_enroll after the trusted provider flow verifies payment.
DROP POLICY IF EXISTS student_self_enroll ON public.lms_enrollments;
DROP POLICY IF EXISTS insert_enrollments ON public.lms_enrollments;
DROP POLICY IF EXISTS student_free_self_enroll ON public.lms_enrollments;
CREATE POLICY student_free_self_enroll ON public.lms_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.lms_courses AS course
      WHERE course.id = lms_enrollments.course_id
        AND course.status = 'published'
        AND course.is_free = true
    )
  );

-- The payment confirmation RPC must never be callable directly by a browser
-- user, since it changes payment status and creates enrolments.
-- DEFERRED: REVOKE ALL ON FUNCTION public.confirm_payment_and_enroll(uuid, text, uuid, text) FROM PUBLIC, anon, authenticated;
-- DEFERRED: GRANT EXECUTE ON FUNCTION public.confirm_payment_and_enroll(uuid, text, uuid, text) TO service_role;

COMMIT;
