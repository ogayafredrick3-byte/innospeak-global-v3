-- DEPRECATED LEGACY MIGRATION — intentionally non-destructive.
--
-- The original version of this file dropped LMS tables with CASCADE. That is
-- unsafe for an existing installation because a migration-history mismatch
-- could erase learner enrolments, lesson progress, submissions and certificates.
-- Never reset production LMS data from a migration.
--
-- This migration is now a no-op. Later versioned migrations create or reconcile
-- the required schema using additive/idempotent operations. If this version was
-- already applied in a deployed database, Supabase will not replay it. If it was
-- not applied, the no-op prevents accidental data loss while the later schema
-- migrations continue in order.
DO $$
BEGIN
  RAISE NOTICE 'Legacy LMS reset migration is disabled; existing LMS data is preserved.';
END $$;
