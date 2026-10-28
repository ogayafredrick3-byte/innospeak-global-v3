import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const register = read('../src/pages/Register.jsx');
const adminApplications = read('../src/pages/admin/Applications.jsx');
const admissions = read('../src/lib/supabase/admissions.js');
const migration = read('../supabase/migrations/20261026120000_admissions_workflow.sql');

test('registration never prefills or receives personal email from public admission verification', () => {
  assert.match(register, /setPersonalEmail\(''\)/);
  assert.doesNotMatch(register, /setPersonalEmail\(result\.email/);
  assert.match(register, /same email address you submitted with your application/i);
  assert.match(admissions, /never returns personal email/i);
});

test('approval from the admin UI always calls the transactional approval RPC', () => {
  assert.match(adminApplications, /status === 'approved'[\s\S]*?handleApprove\(id\)/);
  assert.match(adminApplications, /'approved'/);
  assert.doesNotMatch(adminApplications, /'accepted', 'rejected'/);
  assert.match(admissions, /rpc\('approve_application_with_admission'/);
});

test('admissions SQL verifies approved status and never returns application personal email', () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.verify_admission_number/);
  assert.match(migration, /v_app\.status <> 'approved'/);
  assert.match(migration, /'institutional_email', v_app\.institutional_email/);
  assert.doesNotMatch(migration, /'email', v_app\.email/);
  assert.match(migration, /lower\(btrim\(v_app\.email\)\) <> lower\(btrim\(NEW\.email\)\)/);
});

test('admission number allocation is transaction-safe and restricted to authorized callers', () => {
  assert.match(migration, /UPDATE public\.admission_number_course_year_sequence s[\s\S]*?last_value = s\.last_value \+ 1/);
  assert.match(migration, /IF v_admin_id IS NULL OR NOT EXISTS/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.generate_admission_number\(text\) FROM PUBLIC, anon, authenticated/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.approve_application_with_admission\(uuid\) TO authenticated/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.enforce_application_approval_workflow/);
  assert.match(migration, /Approve applications through approve_application_with_admission/);
});
