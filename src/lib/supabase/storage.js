import { supabase } from './client';

/**
 * storage — upload helper for the `application-documents` bucket
 * (see supabase/migrations/20260729120000_create_application_documents_bucket.sql).
 *
 * FileUpload.jsx calls this per file, immediately on selection, so what
 * the applicant sees actually reflects a real upload instead of a
 * simulated progress bar with nothing behind it.
 */

const BUCKET = 'application-documents';

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

/**
 * Upload a single document.
 *
 * @param {File} file
 * @param {string} draftId - a random id generated once when the Apply
 *   form is opened (see Apply.jsx), used to group one applicant's
 *   uploads in Storage before an application_number exists yet.
 * @param {string} docKey - which document slot this is, e.g. 'cv'.
 * @returns {Promise<{ path: string }>}
 */
export async function uploadApplicationDocument(file, draftId, docKey) {
  if (!supabase) {
    throw new Error('Document upload is unavailable because Supabase has not been configured.');
  }

  const path = `${draftId}/${docKey}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(error.message);

  return { path: data.path };
}