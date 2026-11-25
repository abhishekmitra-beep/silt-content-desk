// SILT Content Desk helper. Talks to the remote D1 database through wrangler (uses this PC's `wrangler login`).
//
//   node scripts/desk.mjs exists <date>            -> prints "yes" or "no" (are that day's drafts loaded?)
//   node scripts/desk.mjs reviews <sinceDate>      -> prints review data (status, notes, edits) since that date
//   node scripts/desk.mjs load <date> [--replace]  -> loads ../drafts/posts/<date>_*.json and ../drafts/brief-<date>.json
//                                                     (--replace overwrites only posts nobody has reviewed yet)
//   node scripts/desk.mjs import <dir>             -> loads <dir>/posts/*.json and <dir>/briefs/*.json (keeps review fields)
//   node scripts/desk.mjs count <date>             -> number of posts stored for that day
//   node scripts/desk.mjs schema                   -> creates any missing tables (safe to rerun)
//   node scripts/desk.mjs ideas-load <file.json>   -> loads Claude's content ideas {ideas:[...]}; reviewed ideas are never overwritten
//   node scripts/desk.mjs ideas-status [sinceDate] -> prints every idea with its status, calendar date and note
//
// New posts never overwrite existing ones (so reviews are kept). Briefs are replaced.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const drafts = path.resolve(root, "..", "drafts");
const DB = "silt_desk";
// DESK_LOCAL=1 points every command at the local dev database (wrangler pages dev) instead of the live one.
const WHERE = process.env.DESK_LOCAL ? "--local" : "--remote";

const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "");

// Runs the project's own wrangler (npm install in this folder) through node directly, so no shell splits arguments.
const wranglerBin = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
function wrangler(args) {
  if (!fs.existsSync(wranglerBin)) throw new Error("Run `npm install` in the cloudflare folder first.");
  return execFileSync(process.execPath, [wranglerBin, ...args], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}
function query(sql) {
  const out = wrangler(["d1", "execute", DB, WHERE, "--json", "--command", sql]);
  const parsed = JSON.parse(out.slice(out.indexOf("[")));
  return parsed[0]?.results || [];
}
function runFile(sql) {
  const f = path.join(os.tmpdir(), `silt-desk-${Date.now()}.sql`);
  fs.writeFileSync(f, sql, "utf8");
  try { return wrangler(["d1", "execute", DB, WHERE, "--yes", `--file=${f}`]); }
  finally { fs.rmSync(f, { force: true }); }
}
// With replace, an existing post is overwritten only if nobody has reviewed it yet (still pending, never touched).
function postSql(id, doc, replace = false) {
  if (!/^\d{4}-\d{2}-\d{2}_[xrlc]\d{1,2}$/.test(id)) throw new Error(`Bad post id ${id}`);
  if (!isDate(doc.date) || !id.startsWith(doc.date)) throw new Error(`Post ${id} has a date that doesn't match its id`);
  const onConflict = replace
    ? `ON CONFLICT(id) DO UPDATE SET doc = excluded.doc WHERE json_extract(posts.doc, '$.status') = 'pending' AND json_extract(posts.doc, '$.reviewed_at') IS NULL`
    : `ON CONFLICT(id) DO NOTHING`;
  return `INSERT INTO posts (id, date, doc) VALUES (${q(id)}, ${q(doc.date)}, ${q(JSON.stringify(doc))}) ${onConflict};`;
}
function briefSql(doc) {
  if (!isDate(doc.date)) throw new Error("Brief has no valid date");
  return `INSERT INTO briefs (date, doc) VALUES (${q(doc.date)}, ${q(JSON.stringify(doc))}) ON CONFLICT(date) DO UPDATE SET doc = excluded.doc;`;
}
const readJson = f => JSON.parse(fs.readFileSync(f, "utf8"));

const [cmd, arg] = process.argv.slice(2);
if (cmd === "exists" || cmd === "count") {
  if (!isDate(arg)) throw new Error("Give a date like 2026-11-17");
  const n = query(`SELECT COUNT(*) AS n FROM posts WHERE date = ${q(arg)}`)[0]?.n ?? 0;
  console.log(cmd === "exists" ? (n > 0 ? "yes" : "no") : n);
} else if (cmd === "reviews") {
  if (!isDate(arg)) throw new Error("Give a since-date like 2026-11-10");
  const rows = query(`SELECT doc FROM posts WHERE date >= ${q(arg)} ORDER BY date, id`);
  // Compact on purpose: the unattended 6 PM run must never need pipes or redirects to read this.
  const short = (t, n = 260) => (t && t.length > n ? t.slice(0, n) + "..." : t);
  for (const { doc } of rows) {
    const p = JSON.parse(doc);
    const id = `${p.date}_${({ x: "x", reddit: "r", linkedin: "l", reddit_comment: "c" })[p.platform] || "?"}${p.slot}`;
    if (p.status === "pending" && !p.note && !p.edited_text) { console.log(JSON.stringify({ id, status: "pending (not reviewed)" })); continue; }
    console.log(JSON.stringify({
      id, platform: p.platform, subreddit: p.subreddit, angle: p.angle, product: p.product, pillar: p.pillar,
      status: p.status, note: p.note || undefined, text: short(p.text),
      edited_title: p.edited_title, edited_text: short(p.edited_text, 600),
    }));
  }
} else if (cmd === "load") {
  if (!isDate(arg)) throw new Error("Give a date like 2026-11-17");
  const postsDir = path.join(drafts, "posts");
  const files = fs.readdirSync(postsDir).filter(f => f.startsWith(arg + "_") && f.endsWith(".json"));
  const briefFile = path.join(drafts, `brief-${arg}.json`);
  if (!files.length) throw new Error(`No drafts/posts/${arg}_*.json files`);
  if (!fs.existsSync(briefFile)) throw new Error(`Missing drafts/brief-${arg}.json`);
  const replace = process.argv.includes("--replace");
  const sql = [...files.map(f => postSql(f.replace(/\.json$/, ""), readJson(path.join(postsDir, f)), replace)), briefSql(readJson(briefFile))].join("\n");
  runFile(sql);
  console.log(`Loaded ${files.length} posts and the brief for ${arg}${replace ? " (unreviewed posts replaced)" : ""}.`);
} else if (cmd === "weekly-ads") {
  // node scripts/desk.mjs weekly-ads  -> re-harvests competitor Meta ads (silt-ad-tools/weekly-diff.mjs),
  // writes "this week" into competitors/teardowns.json, then stores it for the Ad teardowns tab.
  const tools = process.env.SILT_AD_TOOLS || path.resolve(root, "..", "..", "silt-ad-tools");
  execFileSync(process.execPath, [path.join(tools, "weekly-diff.mjs"), ...(arg ? [arg] : [])], { stdio: "inherit", timeout: 3 * 60 * 60 * 1000 });
  const file = path.resolve(root, "..", "competitors", "teardowns.json");
  const body = JSON.stringify(readJson(file));
  runFile(`INSERT INTO docs (key, doc, updated_at) VALUES ('teardowns', ${q(body)}, ${q(new Date().toISOString())}) ON CONFLICT(key) DO UPDATE SET doc = excluded.doc, updated_at = excluded.updated_at;`);
  console.log(`Stored doc "teardowns" (${body.length} bytes).`);
} else if (cmd === "doc") {
  // node scripts/desk.mjs doc <key> <file.json>  -> stores a reference document (e.g. competitors)
  const file = process.argv[4];
  if (!/^[a-z0-9-]{1,40}$/.test(arg || "") || !file) throw new Error("Usage: doc <key> <file.json>");
  const fresh = readJson(path.resolve(file));
  // Docs the team reviews item by item: carry their review fields over, so storing a new version never wipes reviews.
  const LIST = { retention: "messages", scripts: "scripts" }[arg];
  if (LIST) {
    const old = query(`SELECT doc FROM docs WHERE key = ${q(arg)}`)[0];
    const prev = old ? Object.fromEntries((JSON.parse(old.doc)[LIST] || []).map(x => [x.id, x])) : {};
    let kept = 0;
    for (const item of fresh[LIST] || []) {
      const p = prev[item.id]; if (!p || !p.reviewed_at) continue;
      for (const k of ["status", "note", "edited_text", "edited_text_hi", "reviewed_at", "reviewed_by"]) if (p[k] !== undefined) item[k] = p[k];
      kept++;
    }
    console.log(`Kept reviews on ${kept} ${LIST}.`);
  }
  const body = JSON.stringify(fresh);
  runFile(`INSERT INTO docs (key, doc, updated_at) VALUES (${q(arg)}, ${q(body)}, ${q(new Date().toISOString())}) ON CONFLICT(key) DO UPDATE SET doc = excluded.doc, updated_at = excluded.updated_at;`);
  console.log(`Stored doc "${arg}" (${body.length} bytes).`);
  // A new teardown list usually means a new ad-library teardown page: refresh the digest the content agent reads.
  if (arg === "teardowns" && !process.env.DESK_NO_DIGEST) execFileSync(process.execPath, [path.join(here, "teardown-digest.mjs"), "--store"], { cwd: root, stdio: "inherit", env: process.env });
} else if (cmd === "import") {
  const dir = path.resolve(arg || "");
  const pd = path.join(dir, "posts"), bd = path.join(dir, "briefs");
  const lines = [];
  if (fs.existsSync(pd)) for (const f of fs.readdirSync(pd).filter(f => f.endsWith(".json"))) lines.push(postSql(f.replace(/\.json$/, ""), readJson(path.join(pd, f))));
  if (fs.existsSync(bd)) for (const f of fs.readdirSync(bd).filter(f => f.endsWith(".json"))) lines.push(briefSql(readJson(path.join(bd, f))));
  if (!lines.length) throw new Error("Nothing to import");
  runFile(lines.join("\n"));
  console.log(`Imported ${lines.length} documents.`);
} else if (cmd === "schema") {
  runFile(fs.readFileSync(path.join(root, "schema.sql"), "utf8"));
  console.log("Schema applied (existing tables untouched).");
} else if (cmd === "drop-plan") {
  // One-off: removes the retired Month plan table and its overview docs.
  runFile(`DROP TABLE IF EXISTS plan;\nDELETE FROM docs WHERE key LIKE 'plan-%';`);
  console.log("Month plan table and overview removed.");
} else if (cmd === "ideas-load") {
  const { ideas = [] } = readJson(path.resolve(arg || ""));
  const ids = new Set(), now = new Date().toISOString();
  const lines = ideas.map((it, i) => {
    if (!/^c-[a-z0-9-]{3,40}$/.test(it.id || "")) throw new Error(`Bad idea id ${it.id} (Claude ideas start with c-)`);
    if (ids.has(it.id)) throw new Error(`Duplicate id ${it.id}`);
    ids.add(it.id);
    if (!it.title) throw new Error(`Idea ${it.id} has no title`);
    if (it.date != null && !isDate(it.date)) throw new Error(`Idea ${it.id} has a bad date`);
    // created_at keeps file order stable in the newest-first list.
    const created = new Date(Date.parse(now) - i * 1000).toISOString();
    const doc = { status: "pending", source: "claude", ...it, date: it.date ?? null, created_at: created };
    // Never overwrite an idea someone has already reviewed.
    return `INSERT INTO ideas (id, date, created_at, doc) VALUES (${q(it.id)}, ${doc.date ? q(doc.date) : "NULL"}, ${q(created)}, ${q(JSON.stringify(doc))}) ON CONFLICT(id) DO UPDATE SET doc = excluded.doc, date = excluded.date WHERE json_extract(ideas.doc, '$.reviewed_at') IS NULL;`;
  });
  if (!lines.length) throw new Error("No ideas in the file");
  runFile(lines.join("\n"));
  console.log(`Loaded ${lines.length} ideas.`);
} else if (cmd === "ideas-status") {
  // Optional since-date filters on created_at.
  const since = isDate(arg) ? arg : "0000";
  for (const { doc } of query(`SELECT doc FROM ideas WHERE created_at >= ${q(since)} ORDER BY created_at`)) {
    const p = JSON.parse(doc);
    console.log(JSON.stringify({ id: p.id, title: p.title, channel: p.channel, source: p.source, proposed_by: p.proposed_by, status: p.status, date: p.date, note: p.note || undefined, reviewed_by: p.reviewed_by }));
  }
} else {
  console.log("Usage: node scripts/desk.mjs exists|count|reviews|load|import|doc|schema|ideas-load|ideas-status|drop-plan <arg>");
  process.exit(1);
}
