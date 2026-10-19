/*
# Create contact_messages table for the public Contact form

1. New Tables
- `contact_messages`
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `email` (text, not null)
  - `phone` (text, optional)
  - `subject` (text, not null — e.g. "Admissions", "Partnerships")
  - `message` (text, not null)
  - `status` (text, default 'new' — for future admin triage e.g. 'read'/'replied')
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `contact_messages`.
- Same pattern as `applications` (20260710061349_create_applications_table.sql):
  this is a public, no-sign-in form, so anon + authenticated may INSERT
  only. SELECT/UPDATE/DELETE are restricted to authenticated (admin)
  users for future admin tooling.
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) to submit contact messages
DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages"
ON contact_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Restrict read/update/delete to authenticated (admin) users
DROP POLICY IF EXISTS "auth_select_contact_messages" ON contact_messages;
CREATE POLICY "auth_select_contact_messages"
ON contact_messages FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_contact_messages" ON contact_messages;
CREATE POLICY "auth_update_contact_messages"
ON contact_messages FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_contact_messages" ON contact_messages;
CREATE POLICY "auth_delete_contact_messages"
ON contact_messages FOR DELETE
TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages (email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);