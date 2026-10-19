-- ══════════════════════════════════════════════════════════════
-- Phase 3: Opportunity Applications
-- Supports application_method = 'internal' | 'both'
-- External-only opportunities never touch this table.
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS opportunity_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  uuid NOT NULL REFERENCES career_opportunities(id) ON DELETE CASCADE,
  student_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'submitted',
  message         text,
  phone           text,
  portfolio_url   text,
  resume_url      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid REFERENCES auth.users(id),
  review_notes    text,
  UNIQUE (opportunity_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_opp_apps_student      ON opportunity_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_opp_apps_opportunity  ON opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_apps_status       ON opportunity_applications(status);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE opportunity_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students insert own applications"   ON opportunity_applications;
DROP POLICY IF EXISTS "students read own applications"     ON opportunity_applications;
DROP POLICY IF EXISTS "students withdraw own applications" ON opportunity_applications;
DROP POLICY IF EXISTS "admins read all applications"       ON opportunity_applications;
DROP POLICY IF EXISTS "admins update all applications"     ON opportunity_applications;

CREATE POLICY "students insert own applications"
  ON opportunity_applications FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "students read own applications"
  ON opportunity_applications FOR SELECT
  USING (auth.uid() = student_id);

-- Students may only withdraw — cannot change status to anything else
CREATE POLICY "students withdraw own applications"
  ON opportunity_applications FOR UPDATE
  USING (auth.uid() = student_id AND status IN ('submitted', 'reviewing'))
  WITH CHECK (auth.uid() = student_id AND status = 'withdrawn');

CREATE POLICY "admins read all applications"
  ON opportunity_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "admins update all applications"
  ON opportunity_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_opp_apps_touch ON opportunity_applications;
CREATE TRIGGER trg_opp_apps_touch
  BEFORE UPDATE ON opportunity_applications
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();