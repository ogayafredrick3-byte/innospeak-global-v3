// supabase/functions/create-student/index.ts
//
// InnoSpeak Student Portal — Admin "create student account" Edge Function
//
// The browser (via src/lib/supabase/admin.js) sends student details here.
// This function verifies the CALLER is an admin, then uses the
// project's service-role key (server-only — never sent to the browser)
// to create the new auth user and their profile row in one step.
//
// Deploy:
//   supabase functions deploy create-student
//
// No extra secrets to configure — SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are automatically available to every Edge
// Function in a Supabase project.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing authorization header.' }, 401);
  const callerJwt = authHeader.replace('Bearer ', '');

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1. Identify the caller and confirm they are an admin.
  const { data: callerData, error: callerError } = await adminClient.auth.getUser(callerJwt);
  if (callerError || !callerData?.user) return json({ error: 'Not authenticated.' }, 401);

  const { data: callerProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', callerData.user.id)
    .maybeSingle();

  if (profileError || callerProfile?.role !== 'admin') {
    return json({ error: 'Only administrators can create student accounts.' }, 403);
  }

  // 2. Validate the request body.
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { email, password, fullName, studentNumber, department, programId, levelYear, academicYear } = body as {
    email?: string;
    password?: string;
    fullName?: string;
    studentNumber?: string;
    department?: string;
    programId?: string;
    levelYear?: string;
    academicYear?: string;
  };

  if (!email || !password || !fullName || !studentNumber) {
    return json({ error: 'email, password, fullName and studentNumber are required.' }, 400);
  }
  if (password.length < 8) {
    return json({ error: 'Temporary password must be at least 8 characters.' }, 400);
  }

  // 3. Create the auth user.
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created?.user) {
    return json({ error: createError?.message || 'Could not create the student account.' }, 400);
  }

  // 4. Populate their profile with institutional details.
  //    (A blank row may already exist from an auth trigger — upsert covers both cases.)
  const { error: upsertError } = await adminClient.from('profiles').upsert(
    {
      id: created.user.id,
      full_name: fullName,
      student_number: studentNumber,
      department: department || null,
      program_id: programId || null,
      level_year: levelYear || null,
      academic_year: academicYear || null,
      student_status: 'active',
      role: 'student',
      must_change_password: true,
    },
    { onConflict: 'id' }
  );

  if (upsertError) {
    // Roll back the auth user so we don't leave an orphaned login with no profile.
    await adminClient.auth.admin.deleteUser(created.user.id);
    return json({ error: upsertError.message || 'Could not save the student profile.' }, 400);
  }

  return json({ id: created.user.id, email, studentNumber });
});
