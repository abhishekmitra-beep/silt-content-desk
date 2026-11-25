-- SILT Static Engine: statics and ideas the team adds or edits on the website (built-in statics stay in statics.js).
-- kind: 'static' (a new static), 'override' (team edit of a built-in static, id = built-in id), 'idea'
CREATE TABLE IF NOT EXISTS se_items (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  doc TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_by TEXT,
  updated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS se_items_kind ON se_items(kind, status);
