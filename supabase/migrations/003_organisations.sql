-- ══════════════════════════════════════════════════════════════
-- Phase 5: Employer Accounts & Organisations
-- ══════════════════════════════════════════════════════════════

-- ── 1. Organisations table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS organisations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE,
  logo_url      text,
  website       text,
  industry      text,
  description   text,
  location      text,
  contact_email text,
  contact_phone text,
  verified      boolean DEFAULT false,
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orgs_slug ON organisations(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_verified ON organisations(verified);

-- ── 2. Profiles: link to organisation ───────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS organisation_id uuid REFERENCES organisations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organisation_id);

-- ── 3. Career opportunities: org ownership ──────────────────
ALTER TABLE career_opportunities
  ADD COLUMN IF NOT EXISTS organisation_id uuid REFERENCES organisations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_opps_org ON career_opportunities(organisation_id);

-- ── 4. RLS: organisations ──────────────────────────────────
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads organisations" ON organisations;
DROP POLICY IF EXISTS "employers create organisations" ON organisations;
DROP POLICY IF EXISTS "employers update own organisation" ON organisations;
DROP POLICY IF EXISTS "admins manage organisations" ON organisations;

CREATE POLICY "anyone reads organisations"
  ON organisations FOR SELECT
  USING (true);

CREATE POLICY "employers create organisations"
  ON organisations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "employers update own organisation"
  ON organisations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.organisation_id = organisations.id
    )
  );

CREATE POLICY "admins manage organisations"
  ON organisations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ── 5. RLS: employer-scoped opportunities ──────────────────
DROP POLICY IF EXISTS "employers read own opportunities" ON career_opportunities;
DROP POLICY IF EXISTS "employers insert own opportunities" ON career_opportunities;
DROP POLICY IF EXISTS "employers update own opportunities" ON career_opportunities;
DROP POLICY IF EXISTS "employers delete own opportunities" ON career_opportunities;

CREATE POLICY "employers read own opportunities"
  ON career_opportunities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'employer'
        AND profiles.organisation_id = career_opportunities.organisation_id
    )
  );

CREATE POLICY "employers insert own opportunities"
  ON career_opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'employer'
        AND profiles.organisation_id = career_opportunities.organisation_id
    )
  );

CREATE POLICY "employers update own opportunities"
  ON career_opportunities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'employer'
        AND profiles.organisation_id = career_opportunities.organisation_id
    )
  );

CREATE POLICY "employers delete own opportunities"
  ON career_opportunities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'employer'
        AND profiles.organisation_id = career_opportunities.organisation_id
    )
  );

-- ── 6. RLS: employer-scoped applications ───────────────────
DROP POLICY IF EXISTS "employers read own opportunity applications" ON opportunity_applications;
DROP POLICY IF EXISTS "employers update own opportunity applications" ON opportunity_applications;

CREATE POLICY "employers read own opportunity applications"
  ON opportunity_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM career_opportunities co
      JOIN profiles p ON p.organisation_id = co.organisation_id
      WHERE co.id = opportunity_applications.opportunity_id
        AND p.id = auth.uid()
        AND p.role = 'employer'
    )
  );

CREATE POLICY "employers update own opportunity applications"
  ON opportunity_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM career_opportunities co
      JOIN profiles p ON p.organisation_id = co.organisation_id
      WHERE co.id = opportunity_applications.opportunity_id
        AND p.id = auth.uid()
        AND p.role = 'employer'
    )
  );

-- ── 7. updated_at trigger ──────────────────────────────────
DROP TRIGGER IF EXISTS trg_orgs_touch ON organisations;
CREATE TRIGGER trg_orgs_touch
  BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();