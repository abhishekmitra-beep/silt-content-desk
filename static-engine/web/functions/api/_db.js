// Creates the team tables on first use (safe to run again).
//  se_items: statics, edits, ideas, decisions, house rules, uploads (JSON docs)
//  se_files: finished images uploaded as they are (one row per image file, under 1.9 MB each)
let ready = false;
export async function ensure(env) {
  if (ready) return;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS se_items (id TEXT PRIMARY KEY, kind TEXT NOT NULL, doc TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_by TEXT, updated_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS se_files (id TEXT PRIMARY KEY, mime TEXT NOT NULL, w INTEGER, h INTEGER, size INTEGER, name TEXT, data BLOB NOT NULL, created_by TEXT, created_at TEXT NOT NULL)").run();
  ready = true;
}
