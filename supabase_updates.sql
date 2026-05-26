-- ═══════════════════════════════════════════════════════════════
--   NEW: Social Posts Table (Timeline/Wall)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vansh_posts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  content       TEXT,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vansh_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "public_read_posts" ON vansh_posts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "public_insert_posts" ON vansh_posts FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS idx_vansh_posts_user ON vansh_posts (user_id);

-- ═══════════════════════════════════════════════════════════════
--   NEW: Direct Messages Table (Inbox)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vansh_messages (
  id            TEXT PRIMARY KEY,
  from_user_id  TEXT NOT NULL,
  to_user_id    TEXT NOT NULL,
  content       TEXT NOT NULL,
  has_alliance_card BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vansh_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "public_read_msg" ON vansh_messages FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "public_insert_msg" ON vansh_messages FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS idx_vansh_msg_to ON vansh_messages (to_user_id);
CREATE INDEX IF NOT EXISTS idx_vansh_msg_from ON vansh_messages (from_user_id);
