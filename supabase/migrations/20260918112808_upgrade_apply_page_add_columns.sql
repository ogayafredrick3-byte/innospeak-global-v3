/*
# Upgrade applications table for division selection and full form data

## Purpose
The Apply page now lets applicants choose between InnoSpeak Global Academy and
InnoSpeak Global Labs. The existing `applications` table is missing columns that
the frontend already sends (first_name, last_name, academy, pathway, course_code,
duration, fees, study_mode, nationality, gender, etc.) and needs a new `division`
column to record which InnoSpeak division the applicant chose.

## Changes
1. New columns on `applications`:
   - `division` (text) — 'academy' or 'labs'
   - `academy` (text) — the academy/label name (e.g. "InnoSpeak Global Academy")
   - `pathway` (text) — the selected pathway/program id
   - `course_code` (text) — the selected course code
   - `first_name` (text)
   - `middle_name` (text)
   - `last_name` (text)
   - `gender` (text)
   - `date_of_birth` (date)
   - `nationality` (text)
   - `phone_number` (text)
   - `whatsapp_number` (text)
   - `national_id` (text)
   - `county_state` (text)
   - `postal_address` (text)
   - `current_occupation` (text)
   - `preferred_schedule` (text)
   - `preferred_learning_mode` (text)
   - `duration` (text)
   - `study_mode` (text)
   - `fees` (text)
   - `declaration` (boolean, default false)
   - `application_number` (text, unique)

2. Existing columns `full_name`, `phone`, `mode`, `address`, `english_proficiency`
   are kept for backward compatibility — no data is lost.

3. Index on `application_number` for lookup.

4. No RLS policy changes — existing policies remain in place.
*/

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS division text DEFAULT '',
  ADD COLUMN IF NOT EXISTS academy text DEFAULT '',
  ADD COLUMN IF NOT EXISTS pathway text DEFAULT '',
  ADD COLUMN IF NOT EXISTS course_code text DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS middle_name text,
  ADD COLUMN IF NOT EXISTS last_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS gender text DEFAULT '',
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS nationality text DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS national_id text,
  ADD COLUMN IF NOT EXISTS county_state text DEFAULT '',
  ADD COLUMN IF NOT EXISTS postal_address text,
  ADD COLUMN IF NOT EXISTS current_occupation text,
  ADD COLUMN IF NOT EXISTS preferred_schedule text DEFAULT '',
  ADD COLUMN IF NOT EXISTS preferred_learning_mode text DEFAULT '',
  ADD COLUMN IF NOT EXISTS duration text DEFAULT '',
  ADD COLUMN IF NOT EXISTS study_mode text DEFAULT '',
  ADD COLUMN IF NOT EXISTS fees text DEFAULT '',
  ADD COLUMN IF NOT EXISTS declaration boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS application_number text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_application_number
  ON applications (application_number) WHERE application_number IS NOT NULL;
