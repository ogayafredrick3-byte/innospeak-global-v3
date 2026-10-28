import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLmsCourse } from '../src/lib/data/lmsCourse.js';
import { getProgrammeByCode } from '../src/lib/data/programmeData.js';

test('catalogue-seeded LMS course code resolves to the matching catalogue course', () => {
  const catalogue = getProgrammeByCode('ENG101');
  assert.ok(catalogue, 'ENG101 should exist in the public catalogue');
  const resolved = resolveLmsCourse({ id: 'lms-id', code: 'ENG101', title: 'English Speaking Fundamentals', status: 'published' });
  assert.equal(resolved.code, 'ENG101');
  assert.equal(resolved.hasCatalogueMatch, true);
  assert.equal(resolved.title, catalogue.name);
});

test('programme_code remains supported for instructor-linked LMS courses', () => {
  const resolved = resolveLmsCourse({ id: 'lms-id', programme_code: 'ENG101', title: 'Custom title', status: 'published' });
  assert.equal(resolved.code, 'ENG101');
  assert.equal(resolved.hasCatalogueMatch, true);
});

test('unlinked LMS-only courses still resolve safely', () => {
  const resolved = resolveLmsCourse({ id: 'lms-id', title: 'Independent Workshop', status: 'published', description: 'A standalone workshop.' });
  assert.equal(resolved.title, 'Independent Workshop');
  assert.equal(resolved.hasCatalogueMatch, false);
  assert.equal(resolved.description, 'A standalone workshop.');
});

import GENERATED_CURRICULA from '../src/lib/data/courseCurricula.generated.js';

test('all catalogue courses have six modules and course-specific module outcomes', () => {
  assert.equal(Object.keys(GENERATED_CURRICULA).length, 368);
  const modules = Object.values(GENERATED_CURRICULA).flatMap((course) => course.courseStructure || []);
  assert.equal(modules.length, 2208);
  assert.ok(Object.values(GENERATED_CURRICULA).every((course) => course.courseStructure?.length === 6));
  assert.equal(new Set(modules.map((module) => JSON.stringify(module.learningOutcomes || []))).size, 2208);
  assert.ok(modules.every((module) => (module.learningOutcomes || []).length >= 3));
});

test('payment and enrolment migration keeps price authority on the server', async () => {
  const fs = await import('node:fs');
  const migration = fs.readFileSync(new URL('../supabase/migrations/20261019140000_payment_and_enrollment_security.sql', import.meta.url), 'utf8');
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.create_course_payment/i);
  assert.match(migration, /course\.is_free = true/i);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.confirm_payment_and_enroll/i);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.confirm_payment_and_enroll[\s\S]*TO service_role/i);
  assert.doesNotMatch(migration, /DROP TABLE/i);
});

test('payment Edge Functions do not trust browser-provided amount for checkout', async () => {
  const fs = await import('node:fs');
  const mpesa = fs.readFileSync(new URL('../supabase/functions/mpesa-pay/index.ts', import.meta.url), 'utf8');
  const paypal = fs.readFileSync(new URL('../supabase/functions/paypal-pay/index.ts', import.meta.url), 'utf8');
  assert.match(mpesa, /payment\.student_id !== user\.id/);
  assert.match(mpesa, /Math\.round\(amount\)/);
  assert.match(mpesa, /verifyMpesaCheckout\(checkoutRequestId\)/);
  assert.match(paypal, /routeBody\?\.action === 'create-order'/);
  assert.match(paypal, /Math\.abs\(orderAmount - Number\(payment\.amount\)\)/);
  assert.match(paypal, /Math\.abs\(capturedAmount - Number\(payment\.amount\)\)/);
});

test('M-PESA callbacks bypass gateway JWT but other edge functions keep it enabled', async () => {
  const fs = await import('node:fs');
  const config = fs.readFileSync(new URL('../supabase/config.toml', import.meta.url), 'utf8');
  assert.match(config, /\[functions\.mpesa-pay\]\s+# Safaricom callbacks[\s\S]*?verify_jwt = false/);
  assert.match(config, /\[functions\.paypal-pay\]\s*verify_jwt = true/);
});


test('learner progress RPC is guarded and the old definer RPC is revoked from browsers', async () => {
  const fs = await import('node:fs');
  const migration = fs.readFileSync(new URL('../supabase/migrations/20261019150000_lms_progress_rpc_security.sql', import.meta.url), 'utf8');
  const client = fs.readFileSync(new URL('../src/lib/supabase/lms.js', import.meta.url), 'utf8');
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.get_course_progress_secure/i);
  assert.match(migration, /target_student_id <> auth\.uid\(\)/i);
  assert.match(migration, /REVOKE EXECUTE ON FUNCTION public\.get_course_progress\(uuid, uuid\) FROM PUBLIC, anon, authenticated/i);
  assert.match(client, /rpc\('get_course_progress_secure'/);
});

test('private LMS files use short-lived signed URLs and persist object paths', async () => {
  const fs = await import('node:fs');
  const client = fs.readFileSync(new URL('../src/lib/supabase/lms.js', import.meta.url), 'utf8');
  const storageMigration = fs.readFileSync(new URL('../supabase/migrations/20261019160000_storage_access_hardening.sql', import.meta.url), 'utf8');
  assert.match(client, /createSignedUrl\(path, 60 \* 60\)/);
  assert.match(client, /return \{ path \};/);
  assert.match(storageMigration, /inno_submission_file_select/i);
  assert.match(storageMigration, /inno_lesson_resource_select/i);
  assert.doesNotMatch(client, /createSignedUrl\(path, 60 \* 60 \* 24 \* 365\)/);
});


test('all structured catalogue courses expose consistent owner-authorised self-paced flags', async () => {
  const { COURSES } = await import('../src/lib/data/programmeData.js');
  assert.equal(COURSES.length, 368);
  assert.ok(COURSES.every((course) => course.ownerAuthorizedForPublication === true));
  assert.ok(COURSES.every((course) => course.enrollmentOpen === true));
  assert.ok(COURSES.every((course) => course.selfPacedAvailable === true));
  assert.ok(COURSES.every((course) => course.studyMode === 'Self-paced online'));
});


test('lightweight publication code set stays aligned with the generated curricula', async () => {
  const { OWNER_AUTHORIZED_COURSE_CODES } = await import('../src/lib/data/coursePublicationCodes.js');
  assert.equal(OWNER_AUTHORIZED_COURSE_CODES.size, 368);
  assert.ok(Object.keys(GENERATED_CURRICULA).every((code) => OWNER_AUTHORIZED_COURSE_CODES.has(code)));
});

test('LMS flow hardening migration uses server-authorized enrolment and progress writes', async () => {
  const fs = await import('node:fs');
  const migration = fs.readFileSync(new URL('../supabase/migrations/20261019180000_lms_flow_hardening.sql', import.meta.url), 'utf8');
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.enroll_in_free_course/i);
  assert.match(migration, /course\.is_free IS DISTINCT FROM true/i);
  assert.match(migration, /status = 'published'/i);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.start_lesson_progress_secure/i);
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.complete_lesson_progress_secure/i);
  assert.match(migration, /enrollment\.status = 'active'/i);
  assert.match(migration, /REVOKE INSERT, UPDATE, DELETE ON TABLE public\.lesson_progress FROM anon, authenticated/i);
  assert.match(migration, /REVOKE INSERT ON TABLE public\.lms_enrollments FROM anon, authenticated/i);
  assert.doesNotMatch(migration, /DROP TABLE/i);
});

test('LMS browser data layer uses trusted RPCs for enrolment and lesson progress', async () => {
  const fs = await import('node:fs');
  const client = fs.readFileSync(new URL('../src/lib/supabase/lms.js', import.meta.url), 'utf8');
  const portal = fs.readFileSync(new URL('../src/lib/supabase/portal.js', import.meta.url), 'utf8');
  assert.match(client, /rpc\('enroll_in_free_course'/);
  assert.match(portal, /rpc\('enroll_in_free_course'/);
  assert.match(client, /rpc\('start_lesson_progress_secure'/);
  assert.match(client, /rpc\('complete_lesson_progress_secure'/);
  assert.doesNotMatch(client, /from\('lesson_progress'\)\s*\n\s*\.upsert/);
  assert.doesNotMatch(client, /from\('lms_enrollments'\)\s*\n\s*\.upsert/);
  assert.match(client, /\.eq\('student_id', uid\)/);
});

test('lesson content is sanitized and lesson loading waits for verified enrolment', async () => {
  const fs = await import('node:fs');
  const renderer = fs.readFileSync(new URL('../src/components/learn/SafeLessonContent.jsx', import.meta.url), 'utf8');
  const player = fs.readFileSync(new URL('../src/pages/learn/LearningPlayer.jsx', import.meta.url), 'utf8');
  const editor = fs.readFileSync(new URL('../src/pages/teach/LessonContentBuilder.jsx', import.meta.url), 'utf8');
  assert.match(renderer, /DROP_TAGS/);
  assert.match(renderer, /safeProtocol/);
  assert.match(renderer, /noopener noreferrer/);
  assert.match(player, /Do not request lesson content or write progress until course enrolment has[\s\S]*been verified/);
  assert.match(player, /SafeLessonContent/);
  assert.ok(player.indexOf('getMyEnrollment(courseId)') < player.indexOf('listModulesWithLessons(courseId)'), 'enrolment must be verified before lesson/module queries');
  assert.match(editor, /sanitizeLessonContent\(value/);
  assert.match(editor, /SafeLessonContent/);
  assert.doesNotMatch(player, /dangerouslySetInnerHTML=\{\{\s*__html:\s*lesson\.content\s*\}\}/);
  assert.doesNotMatch(editor, /dangerouslySetInnerHTML=\{\{\s*__html:\s*lesson\.content\s*\}\}/);
});

test('legacy LMS reset migration is non-destructive for deployed databases', async () => {
  const fs = await import('node:fs');
  const legacy = fs.readFileSync(new URL('../supabase/migrations/20260829080000_reset_lms_tables_before_rebuild.sql', import.meta.url), 'utf8');
  assert.match(legacy, /intentionally non-destructive/i);
  assert.match(legacy, /DO \$\$/);
  assert.doesNotMatch(legacy, /DROP TABLE|TRUNCATE|DELETE FROM/i);
});

test('role-protected routes wait for profile hydration before evaluating roles', async () => {
  const fs = await import('node:fs');
  for (const file of ['AdminRoute.jsx', 'InstructorRoute.jsx', 'EmployerRoute.jsx']) {
    const source = fs.readFileSync(new URL(`../src/components/auth/${file}`, import.meta.url), 'utf8');
    assert.match(source, /profileLoading/);
    assert.match(source, /loading \|\| \(user && profileLoading\)/);
  }
});

test('lesson media URLs reject unsafe schemes and allow only recognised YouTube embeds', async () => {
  const { safeHttpUrl, getYouTubeEmbedUrl } = await import('../src/lib/security/urls.js');
  assert.equal(safeHttpUrl('javascript:alert(1)'), null);
  assert.equal(safeHttpUrl('data:text/html,hello'), null);
  assert.equal(safeHttpUrl('https://user:pass@example.com/file.pdf'), null);
  assert.equal(safeHttpUrl('https://example.com/file.pdf'), 'https://example.com/file.pdf');
  assert.equal(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(getYouTubeEmbedUrl('https://evil.example/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(getYouTubeEmbedUrl('javascript:alert("youtube.com")'), null);
});

test('lesson resource file URLs are signed before being returned to the player', async () => {
  const fs = await import('node:fs');
  const client = fs.readFileSync(new URL('../src/lib/supabase/lms.js', import.meta.url), 'utf8');
  const getLessonBlock = client.slice(client.indexOf('export async function getLesson('), client.indexOf('// Lesson resources'));
  assert.match(getLessonBlock, /signPrivateObject\('lesson-resources', resource\.file_url\)/);
  assert.match(getLessonBlock, /file_url: signed\.url/);
  assert.match(getLessonBlock, /storage_path: signed\.path/);
});
