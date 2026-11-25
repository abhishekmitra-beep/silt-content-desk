CREATE TABLE IF NOT EXISTS posts (
  id   TEXT PRIMARY KEY,          -- e.g. 2026-11-16_x1
  date TEXT NOT NULL,             -- YYYY-MM-DD
  doc  TEXT NOT NULL              -- the full post as JSON (draft fields + review fields)
);
CREATE INDEX IF NOT EXISTS posts_date ON posts(date);

CREATE TABLE IF NOT EXISTS docs (
  key        TEXT PRIMARY KEY,    -- e.g. competitors
  doc        TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS briefs (
  date TEXT PRIMARY KEY,
  doc  TEXT NOT NULL
);

-- Content ideas: proposed by Claude or added by the team. Approved ideas with a date make up the content calendar.
CREATE TABLE IF NOT EXISTS ideas (
  id         TEXT PRIMARY KEY,    -- c-2026-12-01 (Claude) or t-<random> (team)
  date       TEXT,                -- YYYY-MM-DD calendar date, or NULL if not scheduled yet
  created_at TEXT NOT NULL,
  doc        TEXT NOT NULL        -- the idea as JSON (idea fields + review fields: status, note, reviewed_by)
);
CREATE INDEX IF NOT EXISTS ideas_date ON ideas(date);

-- Content agent (also created automatically on first use).
CREATE TABLE IF NOT EXISTS agent_items (
  id         TEXT PRIMARY KEY,    -- a-<time>-<random>
  kind       TEXT NOT NULL,       -- strategy | static | reel
  run_id     TEXT NOT NULL,       -- one strategy run
  created_at TEXT NOT NULL,
  doc        TEXT NOT NULL        -- JSON: the item plus review fields (status, note, script_status, ...)
);
CREATE INDEX IF NOT EXISTS agent_items_run ON agent_items(run_id);
CREATE TABLE IF NOT EXISTS media (
  id         TEXT PRIMARY KEY,    -- m-<time>-<random>
  mime       TEXT NOT NULL,
  b64        TEXT NOT NULL,       -- generated image, base64
  created_at TEXT NOT NULL
);
