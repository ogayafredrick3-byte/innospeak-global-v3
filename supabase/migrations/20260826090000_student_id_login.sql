/*
  # Student ID login support

  Institutions issue each admitted student a student ID number and a
  temporary password (set directly on their `profiles` / `auth.users`
  row by an administrator). This migration adds:

  1. `profiles.must_change_password` — defaults to false for existing
     self-signup accounts; an administrator sets this to true when
     creating a student's account with a temporary password, forcing
     them to set their own password on first login.

  2. `get_login_email(p_student_number text)` — a SECURITY DEFINER
     function that lets the (unauthenticated) login form resolve a
     student ID to its account email, without exposing the `profiles`
     table itself to anonymous reads. It returns only the email string
     for an exact student_number match, or null if none exists.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION get_login_email(p_student_number text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT u.email
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.student_number = p_student_number
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION get_login_email(text) FROM public;
GRANT EXECUTE ON FUNCTION get_login_email(text) TO anon, authenticated;
