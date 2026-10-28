import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

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

const invalidCredentials = () =>
  json({ error: 'Invalid student ID or password.' }, 401);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  let body: { studentNumber?: unknown; password?: unknown };

  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const studentNumber =
    typeof body.studentNumber === 'string' ? body.studentNumber.trim() : '';
  const password =
    typeof body.password === 'string' ? body.password : '';

  if (
    !studentNumber ||
    studentNumber.length > 100 ||
    !password ||
    password.length > 1024
  ) {
    return invalidCredentials();
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let email = 'student-id-login-invalid@invalid.example';

  try {
    const { data: profile, error } = await admin
      .from('profiles')
      .select('id')
      .eq('student_number', studentNumber)
      .maybeSingle();

    if (!error && profile?.id) {
      const { data: userData, error: userError } =
        await admin.auth.admin.getUserById(profile.id);

      if (!userError && userData.user?.email) {
        email = userData.user.email;
      }
    }
  } catch {
    // Do not expose profile lookup or account-existence details.
  }

  // Route both known and unknown student IDs through password authentication.
  // Supabase Auth's own rate limits remain important for abuse protection.
  let authResponse: Response;

  try {
    authResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      },
    );
  } catch {
    return json({ error: 'Authentication is temporarily unavailable.' }, 503);
  }

  if (!authResponse.ok) {
    if (authResponse.status === 429) {
      return json(
        { error: 'Too many attempts. Please try again later.' },
        429,
      );
    }
    return invalidCredentials();
  }

  let session: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    expires_at?: number;
    token_type?: string;
  };

  try {
    session = await authResponse.json();
  } catch {
    return json({ error: 'Authentication is temporarily unavailable.' }, 503);
  }

  if (!session.access_token || !session.refresh_token) {
    return invalidCredentials();
  }

  // Never return the resolved account email or raw Auth user object.
  return json({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
  });
});
