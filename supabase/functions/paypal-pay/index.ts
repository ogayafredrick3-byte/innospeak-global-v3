// supabase/functions/paypal-pay/index.ts
//
// PayPal checkout for course enrollment.
//
// Flow:
//   1. Frontend POSTs to /create-order with { courseId, courseCode, amount, currency, paymentId }
//   2. This function creates a PayPal order server-side
//   3. Frontend redirects to PayPal approval URL
//   4. After approval, frontend POSTs to /capture with { paymentId, orderId }
//   5. This function captures the order via PayPal API
//   6. On success, calls confirm_payment_and_enroll RPC
//
// Required secrets:
//   PAYPAL_CLIENT_ID
//   PAYPAL_CLIENT_SECRET
//   PAYPAL_BASE_URL — https://api-m.paypal.com (live) or https://api-m.sandbox.paypal.com (sandbox)
//   SUPABASE_URL — pre-populated
//   SUPABASE_SERVICE_ROLE_KEY — pre-populated

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
const PAYPAL_BASE_URL = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.paypal.com';
const PUBLIC_SITE_URL = Deno.env.get('PUBLIC_SITE_URL');

async function getAuthenticatedUser(req: Request) {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: authorization },
  });
  if (!response.ok) return null;
  return response.json();
}

async function supabaseSelect(table: string, filters: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filters}`, {
    headers: { 'Content-Type': 'application/json', apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });
  if (!res.ok) throw new Error(`Select ${table} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function getPaypalAccessToken(): Promise<string> {
  const credentials = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function supabaseRpc(fn: string, params: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RPC ${fn} failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function supabaseUpdate(table: string, id: string, fields: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update ${table} failed: ${res.status} ${text}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Supabase functions.invoke calls the function root; route by the body
    // action as well as optional path suffixes so both invocation styles work.
    const routeBody = await req.clone().json().catch(() => ({}));
    if (url.pathname.endsWith('/create-order') || routeBody?.action === 'create-order') {
      return await handleCreateOrder(req);
    }
    if (url.pathname.endsWith('/capture') || routeBody?.action === 'capture') {
      return await handleCapture(req);
    }

    return new Response(JSON.stringify({ error: 'Unknown endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('paypal-pay error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Payment processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================
// Create PayPal order
// ============================================================
async function handleCreateOrder(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return new Response(
      JSON.stringify({ error: 'PayPal is not configured on the server. Contact support.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const user = await getAuthenticatedUser(req);
  if (!user?.id) {
    return new Response(JSON.stringify({ error: 'Please sign in before starting a payment.' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!PUBLIC_SITE_URL) {
    return new Response(JSON.stringify({ error: 'PayPal return URL is not configured on the server.' }), {
      status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const paymentId = String(body?.paymentId || '');
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) {
    return new Response(JSON.stringify({ error: 'A valid payment reference is required.' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const paymentRows = await supabaseSelect('payments', `id=eq.${encodeURIComponent(paymentId)}&select=*`);
  const payment = paymentRows[0];
  if (!payment || payment.student_id !== user.id || payment.provider !== 'paypal' || payment.status !== 'pending') {
    return new Response(JSON.stringify({ error: 'This payment cannot be processed for the current account.' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const amount = Number(payment.amount);
  const currency = String(payment.currency || '');
  const courseCode = String(payment.course_code || '');
  if (!Number.isFinite(amount) || amount <= 0 || !currency || !courseCode) {
    return new Response(JSON.stringify({ error: 'The stored payment record is incomplete. Please restart checkout.' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const accessToken = await getPaypalAccessToken();

  const orderRes = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: payment.id,
          custom_id: payment.course_code,
          description: `Course: ${courseCode}`,
          amount: {
            currency_code: currency || 'USD',
            value: Number(amount).toFixed(2),
          },
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
        return_url: `${new URL(PUBLIC_SITE_URL).origin}/payment-return`,
        cancel_url: `${new URL(PUBLIC_SITE_URL).origin}/payment-return?cancelled=1`,
        user_action: 'PAY_NOW',
      },
    }),
  });

  if (!orderRes.ok) {
    const errText = await orderRes.text();
    console.error('PayPal create order error:', orderRes.status, errText);
    await supabaseRpc('fail_payment', { p_payment_id: paymentId, p_status: 'failed' });
    return new Response(
      JSON.stringify({ error: 'Could not create PayPal order. Please try again.' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const orderData = await orderRes.json();

  // Store PayPal order ID on payment record
  if (!orderData?.id || !orderData.links?.some((l: { rel: string }) => l.rel === 'approve')) {
    await supabaseRpc('fail_payment', { p_payment_id: paymentId, p_status: 'failed' });
    return new Response(JSON.stringify({ error: 'PayPal did not return a usable approval link.' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await supabaseUpdate('payments', paymentId, {
    provider_checkout_id: orderData.id,
    updated_at: new Date().toISOString(),
  });

  // Find the approval URL
  const approvalUrl = orderData.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href;

  return new Response(
    JSON.stringify({
      success: true,
      orderId: orderData.id,
      approvalUrl,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ============================================================
// Capture PayPal order (after buyer approval)
// ============================================================
async function handleCapture(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return new Response(JSON.stringify({ error: 'PayPal is not configured on the server.' }), {
      status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const user = await getAuthenticatedUser(req);
  if (!user?.id) {
    return new Response(JSON.stringify({ error: 'Please sign in with the account used for checkout.' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const body = await req.json();
  const orderId = String(body?.orderId || '');
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Missing PayPal order reference.' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const paymentRows = await supabaseSelect('payments', `provider_checkout_id=eq.${encodeURIComponent(orderId)}&select=*`);
  const payment = paymentRows[0];
  if (!payment || payment.student_id !== user.id || payment.provider !== 'paypal') {
    return new Response(JSON.stringify({ error: 'No PayPal payment matches this account and order.' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (payment.status === 'paid') {
    return new Response(JSON.stringify({ success: true, enrolled: true, status: 'enrolled', message: 'Already confirmed' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (payment.status !== 'pending') {
    return new Response(JSON.stringify({ error: 'This PayPal payment is no longer pending.' }), {
      status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const accessToken = await getPaypalAccessToken();
  // Verify the approved order is linked to this payment and its canonical
  // amount/currency before requesting capture.
  const orderRes = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });
  if (!orderRes.ok) {
    return new Response(JSON.stringify({ error: 'Could not verify the PayPal order.' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const orderData = await orderRes.json();
  const purchaseUnit = orderData?.purchase_units?.[0];
  const orderAmount = Number(purchaseUnit?.amount?.value);
  if (purchaseUnit?.reference_id !== payment.id ||
      purchaseUnit?.amount?.currency_code !== payment.currency ||
      !Number.isFinite(orderAmount) || Math.abs(orderAmount - Number(payment.amount)) > 0.01) {
    return new Response(JSON.stringify({ error: 'PayPal order details do not match the stored payment.' }), {
      status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const captureRes = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });
  if (!captureRes.ok) {
    const errText = await captureRes.text();
    console.error('PayPal capture error:', captureRes.status, errText);
    return new Response(JSON.stringify({ error: 'PayPal payment could not be captured. Please try again.' }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const captureData = await captureRes.json();
  const capture = captureData?.purchase_units?.[0]?.payments?.captures?.[0];
  const capturedAmount = Number(capture?.amount?.value);
  if (captureData?.status !== 'COMPLETED' || capture?.status !== 'COMPLETED' ||
      capture?.amount?.currency_code !== payment.currency || !Number.isFinite(capturedAmount) ||
      Math.abs(capturedAmount - Number(payment.amount)) > 0.01) {
    console.error('PayPal capture details did not match the payment record', payment.id);
    return new Response(JSON.stringify({ error: 'PayPal capture could not be verified against the payment amount.' }), {
      status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const result = await supabaseRpc('confirm_payment_and_enroll', {
    p_payment_id: payment.id,
    p_provider_transaction_id: capture.id || orderId,
    p_course_id: payment.course_id,
    p_course_code: payment.course_code,
  });
  return new Response(JSON.stringify(result), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
