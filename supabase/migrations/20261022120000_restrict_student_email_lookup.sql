BEGIN;

REVOKE ALL ON FUNCTION public.get_login_email(text)
  FROM PUBLIC, anon, authenticated;

COMMIT;
