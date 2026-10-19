import { supabase } from './client';

/**
 * payments — data layer for course payments (M-PESA + PayPal).
 *
 * Free courses (price = 0) skip this layer entirely and use the
 * existing enrollment flow. Paid courses create a pending payment,
 * go through the provider's checkout, and only after server-side
 * confirmation does the enrollment get activated.
 */

function assertConfigured() {
  if (!supabase) {
    throw new Error('Payments are unavailable because Supabase has not been configured.');
  }
}

/**
 * Create a pending payment record in the database.
 * The edge function will update it after provider confirmation.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createPendingPayment({ courseId, courseCode, provider, phone }) {
  assertConfigured();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData?.user?.id) throw new Error('You must be logged in to make a payment.');

  // Amount, currency, course mapping and student identity are resolved by a
  // SECURITY DEFINER RPC from the canonical published LMS course record.
  // Browser-provided price/student values are deliberately not persisted.
  const code = courseCode || (UUID_RE.test(String(courseId || '')) ? null : courseId);
  if (!code) throw new Error('A valid catalogue course code is required for checkout.');
  const { data, error } = await supabase.rpc('create_course_payment', {
    p_course_code: code,
    p_provider: provider,
    p_phone: phone || null,
  });
  if (error) {
    if (error.code === '23505') {
      throw new Error('You already have an active payment for this course. Please complete or cancel it first.');
    }
    throw error;
  }
  const payment = Array.isArray(data) ? data[0] : data;
  if (!payment?.id || !payment?.amount || !payment?.currency) {
    throw new Error('The payment service returned an incomplete payment record. Please contact support.');
  }
  return payment;
}

/**
 * Initiate M-PESA STK Push via edge function.
 */
export async function initiateMpesaPayment({ paymentId }) {
  assertConfigured();
  const { data, error } = await supabase.functions.invoke('mpesa-pay', {
    body: {
      action: 'initiate',
      paymentId,
    },
  });
  if (error) throw new Error(error.message || 'Could not initiate M-PESA payment.');
  if (data?.error) throw new Error(data.error);
  return data;
}

/**
 * Create a PayPal order via edge function.
 * Returns { orderId, approvalUrl }.
 */
export async function createPaypalOrder({ paymentId }) {
  assertConfigured();
  const { data, error } = await supabase.functions.invoke('paypal-pay', {
    body: {
      action: 'create-order',
      paymentId,
    },
  });
  if (error) throw new Error(error.message || 'Could not create PayPal order.');
  if (data?.error) throw new Error(data.error);
  return data;
}

/**
 * Capture a PayPal order after buyer approval.
 */
export async function capturePaypalOrder({ orderId }) {
  assertConfigured();
  const { data, error } = await supabase.functions.invoke('paypal-pay', {
    body: {
      action: 'capture',
      orderId,
    },
  });
  if (error) throw new Error(error.message || 'Could not capture PayPal payment.');
  if (data?.error) throw new Error(data.error);
  return data;
}

/**
 * Get the current user's payments.
 */
export async function listMyPayments() {
  assertConfigured();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Check if a student has a paid payment for a course.
 */
export async function checkCoursePaid(courseRef) {
  assertConfigured();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const uid = authData?.user?.id;
  if (!uid) return null;
  // Always scope the result to the current learner, even with RLS enabled.
  const column = UUID_RE.test(String(courseRef || '')) ? 'course_id' : 'course_code';
  const { data, error } = await supabase
    .from('payments')
    .select('id, status, course_id, course_code, amount, currency')
    .eq('student_id', uid)
    .eq(column, courseRef)
    .eq('status', 'paid')
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Get a single payment by ID.
 */
export async function getPayment(paymentId) {
  assertConfigured();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================================
// Admin: list all payments
// ============================================================
export async function listAllPayments() {
  assertConfigured();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
