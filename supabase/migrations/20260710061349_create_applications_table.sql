/*
  # Application documents storage bucket

  The Apply form's Step 6 (Upload Documents) previously only recorded
  {name, type, size} metadata in the `applications.documents` jsonb column
  — the actual file was never uploaded anywhere and was silently discarded.
  This migration adds a real private bucket to store those files.

  1. New Storage bucket
    - `application-documents` (private — `public` is false)

  2. Security
    - Anyone (anon or authenticated) may INSERT (upload) new objects into
      this bucket, mirroring how `applications` allows anon INSERT only.
    - No SELECT/UPDATE/DELETE policy is created for this bucket. Uploaded
      documents (passport photos, national ID scans, certificates) are
      more sensitive than the rest of the application record, so — unlike
      `applications`, whose SELECT policy allows any authenticated user to
      read every row (see 20260710061349_create_applications_table.sql) —
      client-side code can never read, list, overwrite or delete a file
      here at all. Retrieval is only possible via the Supabase dashboard
      or a future trusted admin backend using the service-role key.
      If an authenticated admin tool is built later that needs to display
      these files, add a scoped SELECT policy at that point rather than
      opening this up to all authenticated users.
*/

insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

create policy "Anyone can upload application documents"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'application-documents');
