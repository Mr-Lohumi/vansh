-- ═══════════════════════════════════════════════════════════════
--   VANSH (वंश) — Supabase Table Setup
--   Run this ONCE in your Supabase SQL Editor:
--   https://supabase.com/dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- Create the shared members table
CREATE TABLE IF NOT EXISTS vansh_members (
  id            TEXT PRIMARY KEY,
  username      TEXT,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  email         TEXT,
  gender        TEXT DEFAULT 'M',
  age           INTEGER DEFAULT 0,
  dob           DATE,
  caste         TEXT DEFAULT 'Brahmin',
  gotra         TEXT DEFAULT 'Kashyap',
  native_place  TEXT,
  occupation    TEXT,
  verified      BOOLEAN DEFAULT true,
  image_url     TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vansh_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON vansh_members FOR SELECT USING (true);
CREATE POLICY "public_insert" ON vansh_members FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON vansh_members FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_vansh_members_names ON vansh_members (first_name, last_name, username);

-- ═══════════════════════════════════════════════════════════════
--   NEW: Global Invites Table (Cross-Device Notifications)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vansh_invites (
  id            TEXT PRIMARY KEY,
  from_user_id  TEXT NOT NULL,
  to_user_id    TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vansh_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_invites" ON vansh_invites FOR SELECT USING (true);
CREATE POLICY "public_insert_invites" ON vansh_invites FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_invites" ON vansh_invites FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_vansh_invites_to_user ON vansh_invites (to_user_id);
