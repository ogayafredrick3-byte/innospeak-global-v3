// supabase/functions/send-admission-email/index.ts
//
// InnoSpeak Student Portal — Admission Email Edge Function
//
// Called right after a student is admitted (see admitApplication in
// src/lib/supabase/admin.js). Verifies the caller is an admin, then
// sends a welcome email with the student's login credentials via
// Resend's free tier (100/day, 3,000/month, no credit card).
//
// Setup (one time):
//   1. Get a free API key at https://resend.com (API Keys -> Create)
//   2. supabase secrets set RESEND_API_KEY=re_your_key_here
//   3. supabase functions deploy send-admission-email
//
// Sends from onboarding@resend.dev until you verify your own domain in
// the Resend dashboard (Domains -> Add Domain) — verified domains
// deliver more reliably and avoid the occasional spam-folder landing
// that shared testing addresses can get.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_ADDRESS = 'InnoSpeak Global <onboarding@resend.dev>';

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

function emailHtml({
  fullName,
  studentNumber,
  email,
  tempPassword,
  portalUrl,
}: {
  fullName: string;
  studentNumber: string;
  email: string;
  tempPassword: string;
  portalUrl: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1e2a4a;">
    <div style="background: linear-gradient(135deg, #0a1128, #1e2a5e); padding: 32px 28px; border-radius: 12px 12px 0 0;">
      <p style="color: #d4a017; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 6px;">InnoSpeak Global</p>
      <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Welcome, ${fullName}!</h1>
    </div>
    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
      <p style="font-size: 14px; line-height: 1.6;">
        Your application has been approved and your student portal account is ready. Here are your login details:
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Student ID</td>
          <td style="padding: 8px 0; font-weight: 700;">${studentNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Email</td>
          <td style="padding: 8px 0; font-weight: 700;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Temporary Password</td>
          <td style="padding: 8px 0; font-weight: 700;">${tempPassword}</td>
        </tr>
      </table>
      <p style="font-size: 13px; line-height: 1.6; color: #6b7280;">
        You'll be asked to set your own password the first time you log in.
      </p>
      <a href="${portalUrl}/login" style="display: inline-block; margin-top: 12px; background: linear-gradient(135deg, #d4a017, #b8860b); color: #0a1128; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 8px;">
        Log In to Your Portal
      </a>
    </div>
  </div>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing authorization header.' }, 401);
  const callerJwt = authHeader.replace('Bearer ', '');

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: callerData, error: callerError } = await adminClient.auth.getUser(callerJwt);
  if (callerError || !callerData?.user) return json({ error: 'Not authenticated.' }, 401);

  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', callerData.user.id)
    .maybeSingle();

  if (callerProfile?.role !== 'admin') {
    return json({ error: 'Only administrators can send admission emails.' }, 403);
  }

  if (!RESEND_API_KEY) {
    return json({ error: 'Email is not configured on the server yet (missing RESEND_API_KEY).' }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { email, fullName, studentNumber, tempPassword, portalUrl } = body as {
    email?: string;
    fullName?: string;
    studentNumber?: string;
    tempPassword?: string;
    portalUrl?: string;
  };

  if (!email || !fullName || !studentNumber || !tempPassword || !portalUrl) {
    return json({ error: 'email, fullName, studentNumber, tempPassword and portalUrl are required.' }, 400);
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [email],
      subject: `Welcome to InnoSpeak Global — Student ID ${studentNumber}`,
      html: emailHtml({ fullName, studentNumber, email, tempPassword, portalUrl }),
    }),
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text();
    console.error('Resend error:', resendRes.status, errText);
    return json({ error: 'Could not send the admission email.' }, 502);
  }

  return json({ sent: true });
});