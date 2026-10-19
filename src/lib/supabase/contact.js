import { supabase } from './client';

/**
 * contactApi — data layer for the public Contact form.
 *
 * Same pattern as lib/supabase/applications.js: the page calls this
 * function rather than touching Supabase directly, and it fails with a
 * clear error if Supabase hasn't been configured instead of crashing.
 */

export async function submitContactMessage(data) {
  if (!supabase) {
    throw new Error('Message submission is unavailable because Supabase has not been configured.');
  }

  const record = {
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    subject: data.subject,
    message: data.message,
  };

  const { data: inserted, error } = await supabase
    .from('contact_messages')
    .insert(record)
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  return { id: inserted.id };
}