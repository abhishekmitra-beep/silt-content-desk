// Claude's side of the Content agent. Uses this PC's `wrangler login` to read and write the Desk database.
//
//   node scripts/reel-scripts.mjs pending                  -> JSON: reel script requests waiting for Claude, with
//                                                             the idea, the team's notes, the current script and the rules
//   node scripts/reel-scripts.mjs save <id> <script.json>  -> saves Claude's script for that reel (goes to "To review")
//   node scripts/reel-scripts.mjs image <id> <file>        -> adds an image made in ChatGPT Plus to a static
//                                                             (shrunk to a 1080 x 1920 JPEG with ImageMagick)
//
// script.json shape: {"length_s":35,"hook":"","scenes":[{"time":"0-3s","visual":"","voiceover":"","on_screen":"","sfx":""}],
//                     "caption":"","shotlist":[""],"checks":[""]}
// Set CLOUDFLARE_ACCOUNT_ID if the login can see more than one Cloudflare account. DESK_LOCAL=1 uses the local test database.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scriptText } from "../lib/script-text.js";
import { DEFAULT_RULES } from "../lib/agent-rules.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WHERE = process.env.DESK_LOCAL ? "--local" : "--remote";
const wranglerBin = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const s = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const arr = (v, n, m) => (Array.isArray(v) ? v.map(x => s(String(x ?? ""), m)).filter(Boolean).slice(0, n) : []);

function wrangler(args) {
  if (!fs.existsSync(wranglerBin)) throw new Error("Run `npm install` in the cloudflare folder first.");
  return execFileSync(process.execPath, [wranglerBin, ...args], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}
function query(sql) {
  const out = wrangler(["d1", "execute", "silt_desk", WHERE, "--json", "--command", sql]);
  return JSON.parse(out.slice(out.indexOf("[")))[0]?.results || [];
}
function runSql(sql) {
  const f = path.join(os.tmpdir(), `silt-agent-${Date.now()}.sql`);
  fs.writeFileSync(f, sql, "utf8");
  try { wrangler(["d1", "execute", "silt_desk", WHERE, "--yes", `--file=${f}`]); } finally { fs.rmSync(f, { force: true }); }
}
function getItem(id) {
  if (!/^a-[a-z0-9-]{3,40}$/.test(id || "")) throw new Error(`Bad item id ${id}`);
  const r = query(`SELECT doc FROM agent_items WHERE id = ${q(id)}`)[0];
  if (!r) throw new Error(`No agent item ${id}`);
  return JSON.parse(r.doc);
}
const putItem = d => runSql(`UPDATE agent_items SET doc = ${q(JSON.stringify(d))} WHERE id = ${q(d.id)};`);

const [cmd, a1, a2] = process.argv.slice(2);

if (cmd === "pending") {
  const rows = query(`SELECT doc FROM agent_items WHERE kind = 'reel' AND json_extract(doc, '$.script_status') = 'requested' ORDER BY created_at`);
  const rulesRow = query(`SELECT doc FROM docs WHERE key = 'agent-rules'`)[0];
  const rules = rulesRow ? JSON.parse(rulesRow.doc).text || DEFAULT_RULES : DEFAULT_RULES;
  const runs = new Map();
  const requests = rows.map(r => JSON.parse(r.doc)).map(it => {
    if (!runs.has(it.run_id)) {
      const st = query(`SELECT doc FROM agent_items WHERE kind = 'strategy' AND run_id = ${q(it.run_id)}`)[0];
      runs.set(it.run_id, st ? (({ summary, pillars, category_patterns, gaps, avoid }) => ({ summary, pillars, category_patterns, gaps, avoid }))(JSON.parse(st.doc)) : null);
    }
    return {
      id: it.id, title: it.title, product: it.product, driver: it.driver, pillar: it.pillar, hook: it.hook, format: it.format,
      outline: it.outline, based_on: it.based_on, why: it.why, planned_date: it.date,
      team_note_on_idea: it.note || undefined, request: it.script_request, current_script: it.script_text || undefined,
      strategy: runs.get(it.run_id),
    };
  });
  // Earlier scripts the team approved or edited are the best guide to the voice they want.
  const examples = query(`SELECT doc FROM agent_items WHERE kind = 'reel' AND json_extract(doc, '$.script_status') IN ('approved','changes','rejected') ORDER BY created_at DESC LIMIT 6`)
    .map(r => JSON.parse(r.doc)).map(it => ({ title: it.title, status: it.script_status, note: it.script_note || undefined, script: it.script_text }));
  console.log(JSON.stringify({ count: requests.length, requests, rules, team_reviewed_scripts: examples }, null, 1));
} else if (cmd === "save") {
  const it = getItem(a1);
  if (it.kind !== "reel") throw new Error(`${a1} is not a reel`);
  const out = JSON.parse(fs.readFileSync(path.resolve(a2), "utf8"));
  const scenes = (out.scenes || []).slice(0, 16).map(x => ({ time: s(x.time, 20), visual: s(x.visual, 600), voiceover: s(x.voiceover, 600), on_screen: s(x.on_screen, 300), sfx: s(x.sfx, 120) }));
  if (!scenes.length) throw new Error("The script has no scenes");
  it.script = { length_s: Number(out.length_s) || undefined, hook: s(out.hook, 300), scenes, caption: s(out.caption, 2200), shotlist: arr(out.shotlist, 24, 300), checks: arr(out.checks, 12, 300) };
  it.script_text = scriptText(it.script);
  it.script_status = "pending";
  it.script_at = new Date().toISOString();
  it.script_by = "Claude";
  it.script_versions = (it.script_versions || 0) + 1;
  it.last_script_request = it.script_request;
  delete it.script_request;
  putItem(it);
  console.log(`Saved script v${it.script_versions} for "${it.title}". It's on the Agent tab, waiting for review.`);
} else if (cmd === "image") {
  const it = getItem(a1);
  if (it.kind !== "static") throw new Error(`${a1} is not a static`);
  const src = path.resolve(a2 || "");
  if (!fs.existsSync(src)) throw new Error(`No file ${src}`);
  const tmp = path.join(os.tmpdir(), `silt-static-${Date.now()}.jpg`);
  execFileSync("magick", [src, "-resize", "1080x1920>", "-strip", "-quality", "85", tmp]);
  const b64 = fs.readFileSync(tmp).toString("base64");
  fs.rmSync(tmp, { force: true });
  if (b64.length > 1_900_000) throw new Error("Image still too large after shrinking");
  const mid = `m-${Date.now().toString(36)}-${Math.floor(Math.random() * 2 ** 32).toString(36)}`;
  const at = new Date().toISOString();
  it.images = [...(it.images || []), { id: mid, at, by: "Claude (ChatGPT Plus)" }];
  it.image_id = mid;
  it.image_status = "ready";
  if (it.status === "changes") it.status = "pending";
  // D1 caps one SQL statement at 100 KB, so the image goes in as 90 KB pieces appended in order.
  const parts = b64.match(/.{1,90000}/g);
  const sql = [`INSERT INTO media (id, mime, b64, created_at) VALUES (${q(mid)}, 'image/jpeg', ${q(parts[0])}, ${q(at)});`,
    ...parts.slice(1).map(p => `UPDATE media SET b64 = b64 || ${q(p)} WHERE id = ${q(mid)};`),
    `UPDATE agent_items SET doc = ${q(JSON.stringify(it))} WHERE id = ${q(it.id)};`];
  runSql(sql.join("\n"));
  const check = query(`SELECT length(b64) AS n FROM media WHERE id = ${q(mid)}`)[0]?.n;
  if (check !== b64.length) throw new Error(`Image stored incompletely (${check} of ${b64.length} characters)`);
  console.log(`Added image ${mid} to "${it.title}".`);
} else {
  console.log("Usage: node scripts/reel-scripts.mjs pending | save <id> <script.json> | image <id> <file>");
  process.exit(1);
}
