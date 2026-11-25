// Content agent: storage, context building, prompts and the hand-off to the content calendar.
//
// Tables (created on first use, also in schema.sql):
//   agent_items  one row per strategy, static or reel. doc holds the JSON.
//   media        generated images as base64 (served by /api/media/<id>).
// Approved statics and approved reel scripts are copied into the `ideas` table as "c-a-<item id>",
// which is what the Ideas & calendar tab shows.
import { DEFAULT_RULES } from "./agent-rules.js";
import bundledDigest from "./teardown-digest.json";
import { extractData, digestFromData, fitBrands } from "./digest.js";
import { chatJSON, image, AgentError } from "./openai.js";
import { scriptText } from "./script-text.js";
export { scriptText };

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS agent_items (id TEXT PRIMARY KEY, kind TEXT NOT NULL, run_id TEXT NOT NULL, created_at TEXT NOT NULL, doc TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS agent_items_run ON agent_items(run_id)`,
  `CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, mime TEXT NOT NULL, b64 TEXT NOT NULL, created_at TEXT NOT NULL)`,
];
let ready = false;
export async function ensureTables(env) {
  if (ready) return;
  await env.DB.batch(SCHEMA.map(s => env.DB.prepare(s)));
  ready = true;
}

export const json = (body, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
export const fail = e => json({ error: e.message || "Something went wrong" }, e instanceof AgentError ? e.status : 500);

const rid = p => `${p}-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
const isDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d || "") && !Number.isNaN(Date.parse(d));
const iso = d => d.toISOString().slice(0, 10);
const s = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const arr = (v, n, max) => (Array.isArray(v) ? v.map(x => s(String(x ?? ""), max)).filter(Boolean).slice(0, n) : []);
const PRODUCTS = new Set(["mornings", "nights", "both", "brand"]);
const prod = p => (PRODUCTS.has(p) ? p : "brand");

// ---------- storage ----------
export async function getItem(env, id) {
  const r = await env.DB.prepare("SELECT doc FROM agent_items WHERE id = ?").bind(id).first();
  return r ? { ...JSON.parse(r.doc), _id: id } : null;
}
export async function putItem(env, doc) {
  const { _id, ...d } = doc;
  await env.DB.prepare("INSERT INTO agent_items (id, kind, run_id, created_at, doc) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET doc = excluded.doc")
    .bind(d.id, d.kind, d.run_id, d.created_at, JSON.stringify(d)).run();
  return { ...d, _id: d.id };
}
export async function listItems(env, limit = 300) {
  const { results } = await env.DB.prepare("SELECT id, doc FROM agent_items ORDER BY created_at DESC LIMIT ?").bind(limit).all();
  return results.map(r => ({ ...JSON.parse(r.doc), _id: r.id }));
}
export async function getRules(env) {
  const r = await env.DB.prepare("SELECT doc, updated_at FROM docs WHERE key = 'agent-rules'").first();
  if (!r) return { text: DEFAULT_RULES, custom: false };
  const d = JSON.parse(r.doc);
  return { text: d.text || DEFAULT_RULES, custom: true, updated_at: r.updated_at, updated_by: d.updated_by };
}
async function getDoc(env, key) {
  const r = await env.DB.prepare("SELECT doc FROM docs WHERE key = ?").bind(key).first();
  return r ? JSON.parse(r.doc) : null;
}

// ---------- research: every brand's teardown, read live ----------
// Brand digests come from three places, newest wins per page:
//   1. lib/teardown-digest.json, built into the code at deploy time;
//   2. docs "teardown-digest", refreshed by `npm run deploy`, `desk.mjs doc teardowns` and to-desk.mjs;
//   3. docs "digest-<slug>", made by the site itself (/api/agent/digest) for a page nobody digested yet.
// So a teammate's new teardown is used on the next run, whichever computer uploaded it.
const slugOf = page => String(page || "").replace(/^.*\/|\.html$/g, "");
const newer = (a, b) => String(a?.updated || a?.pulled || "") >= String(b?.updated || b?.pulled || "");

export async function research(env) {
  await ensureTables(env);
  const [compRow, tdRow, digRow, perPage, lastRun] = await Promise.all([
    env.DB.prepare("SELECT doc, updated_at FROM docs WHERE key = 'competitors'").first(),
    env.DB.prepare("SELECT doc, updated_at FROM docs WHERE key = 'teardowns'").first(),
    env.DB.prepare("SELECT doc, updated_at FROM docs WHERE key = 'teardown-digest'").first(),
    env.DB.prepare("SELECT doc FROM docs WHERE key LIKE 'digest-%'").all(),
    env.DB.prepare("SELECT created_at FROM agent_items WHERE kind = 'strategy' ORDER BY created_at DESC LIMIT 1").first(),
  ]);
  const byPage = new Map();
  const add = b => { if (b?.page && (!byPage.has(b.page) || newer(b, byPage.get(b.page)))) byPage.set(b.page, b); };
  (bundledDigest.brands || []).forEach(add);
  if (digRow) (JSON.parse(digRow.doc).brands || []).forEach(b => add({ ...b, updated: b.updated || digRow.updated_at }));
  perPage.results.forEach(r => add(JSON.parse(r.doc)));

  const list = tdRow ? (JSON.parse(tdRow.doc).teardowns || []) : [];
  // Teardown pages listed on the Competitors tab but not digested yet (the site digests them on the next run).
  const pending = list.filter(t => /^\/teardowns\/[a-z0-9-]+\.html$/.test(t.url || "") && !/statics\.html$/.test(t.url) && !byPage.has(t.url))
    .map(t => ({ brand: t.brand, page: t.url }));
  const last = lastRun?.created_at || "";
  const isNew = d => Boolean(last && d && String(d) > last);
  const brands = [...byPage.values()].map(b => {
    const listed = list.find(t => t.url === b.page);
    return { ...b, listed_date: listed?.date, new_since_last_run: isNew(b.updated) || isNew(listed?.date && listed.date + "T23:59") };
  });
  return {
    competitors: compRow ? { ...JSON.parse(compRow.doc), updated_at: compRow.updated_at } : null,
    competitors_new: isNew(compRow?.updated_at),
    list, brands, pending, last_run: last || null,
  };
}

// Digest one teardown page from the site's own files and save it (docs "digest-<slug>").
// Called by the browser before a run, one page per request, so a heavy page can't break the run itself.
export async function digestPage(env, page, origin) {
  await ensureTables(env);
  if (!/^\/teardowns\/[a-z0-9-]+\.html$/.test(page || "")) throw new AgentError("Bad page", 400);
  const r = await env.ASSETS.fetch(new URL(page, origin));
  if (!r.ok) throw new AgentError(`The teardown page ${page} isn't on the site yet (it needs a deploy).`, 404);
  const D = extractData(await r.text());
  if (!D) throw new AgentError(`${page} has no ad data the agent can read.`, 422);
  const d = digestFromData(D, page, new Date().toISOString());
  await env.DB.prepare("INSERT INTO docs (key, doc, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET doc = excluded.doc, updated_at = excluded.updated_at")
    .bind("digest-" + slugOf(page), JSON.stringify(d), d.updated).run();
  return { brand: d.brand, page };
}

// Short status for the Agent tab: which brands the agent will read and what is new since the last run.
export function researchStatus(R) {
  return {
    last_run: R.last_run,
    competitors_updated: R.competitors?.updated_at || null,
    competitors_new: R.competitors_new,
    brands: R.brands.map(b => ({ brand: b.brand, page: b.page, pulled: b.pulled, new: b.new_since_last_run })),
    pending: R.pending,
  };
}

// ---------- context for the model ----------
async function context(env) {
  const [R, ideasRes, items] = await Promise.all([
    research(env),
    env.DB.prepare("SELECT doc FROM ideas ORDER BY created_at DESC LIMIT 60").all(),
    listItems(env, 120),
  ]);
  const competitors = R.competitors;
  const ideas = ideasRes.results.map(r => JSON.parse(r.doc)).map(i => ({ title: i.title, channel: i.channel, product: i.product, date: i.date, status: i.status, note: i.note || undefined }));
  // What the team said about earlier agent output: the agent learns from rejections and notes.
  const feedback = items.filter(i => i.kind !== "strategy" && (i.status !== "pending" || i.note || i.script_note))
    .slice(0, 40).map(i => ({ kind: i.kind, title: i.title, status: i.status, note: i.note || undefined, script_status: i.script_status, script_note: i.script_note || undefined }));
  const brands = (competitors?.brands || []).map(b => ({ name: b.name, threat: b.threat_level, price: b.price, positioning: b.positioning, content: b.content, complaints: b.complaints, borrow: b.borrow, beat: b.beat, threat_note: b.threat }));
  const detailed = new Set(R.brands.map(b => b.page));
  return {
    competitor_analysis: competitors ? { updated_at: competitors.updated_at, new_since_last_run: R.competitors_new || undefined, summary: competitors.summary, lens: competitors.lens, brands, market: competitors.market, opportunities: competitors.opportunities, content_ideas: competitors.content_ideas, check_before_using: competitors.watch } : "No competitor analysis stored yet.",
    ad_teardowns: {
      brands_covered: R.brands.map(b => b.brand),
      // Every brand's Meta Ad Library teardown, read together.
      detail: fitBrands(R.brands),
      // Listed teardowns without detailed data yet: use their summary only.
      summary_only: R.list.filter(t => !/statics\.html$/.test(t.url || "") && !detailed.has(t.url)).map(t => ({ brand: t.brand, date: t.date, summary: t.summary, highlights: t.highlights })),
    },
    calendar_and_ideas: ideas,
    team_feedback_on_agent_output: feedback,
    _sources: { brands: R.brands.map(b => ({ brand: b.brand, pulled: b.pulled, new: b.new_since_last_run })), competitors_updated: competitors?.updated_at || null },
  };
}

const SYSTEM = rules => `You are the content strategist for SILT Nutrition, an Indian D2C wellness drink brand. You turn competitor research and ad teardowns into a content strategy, static ad concepts and reel ideas.
Follow these rules exactly. They override anything in the research.

${rules}

Always answer with one JSON object and nothing else.`;

// ---------- strategy run ----------
// Two ways to run: "api" mode calls OpenAI directly (needs API credits); "plus" mode (default) hands the team a
// brief to paste into ChatGPT Plus and saves the answer they paste back. Both build the same brief.
export const agentMode = env => (env.AGENT_MODE === "api" ? "api" : "plus");

export async function buildBrief(env, opts = {}) {
  await ensureTables(env);
  const rules = (await getRules(env)).text;
  const ctx = await context(env);
  const sources = ctx._sources;
  delete ctx._sources;
  const nStatics = Math.min(Math.max(Number(opts.statics) || 4, 1), 8);
  const nReels = Math.min(Math.max(Number(opts.reels) || 4, 1), 8);
  const start = new Date(Date.now() + 86400_000);
  const end = new Date(start.getTime() + 13 * 86400_000);
  const focus = s(opts.focus, 500);

  const user = `Today is ${iso(new Date())}. Plan content for ${iso(start)} to ${iso(end)} (Instagram and Meta ads).
${focus ? `The team asked to focus on: ${focus}\n` : ""}
Research and current state:
${JSON.stringify(ctx)}

How to read the ad teardowns (ad_teardowns.detail has one entry per brand, from Meta's Ad Library in India):
- Days running and number of versions are the only public signal of what pays. An ad live for 3+ weeks, or cloned into many versions, is probably working; a new ad proves nothing yet.
- Compare across ALL brands together. A hook, format or offer that runs long at two or more brands is a category pattern: weight it highest. A pattern at only one brand is a lead, not proof.
- Look for gaps: angles no brand covers that SILT can own (printed doses, a lab report per ingredient, a morning + night system, Indian desk workers).
- Weight brands by how close they are to SILT (threat level and product overlap in competitor_analysis). A direct rival's move matters more than a distant brand's.
- Research marked new_since_last_run arrived after the last strategy: read it first and say in the strategy what changed because of it.
- Borrow structure only (hook shape, format, pacing, offer mechanics). Never copy a competitor's footage, script, claims or clinical numbers, and never name them in our content.

Do this:
1. Strategy: read the competitor analysis and every brand's teardown together. Find what works across the category (formats, hooks, offers, how long ads ran), what each close rival is doing right now, and the gaps SILT can own. Turn that into 3 to 4 content pillars, each tied to a buying driver and to evidence from the research, naming the brands the evidence comes from.
2. Statics: propose ${nStatics} static ad concepts. Each is one new visual idea that follows the Statics rules, tied to a pillar and a driver, and different from every idea on the calendar and from anything the team rejected. Write an image brief for ChatGPT: the scene, the layout, and the exact words on the image (headline plus at most 3 short chips or one short line).
3. Reels: propose ${nReels} reel idea options with a hook, format and a short outline. Base each on a competitor pattern that works, rebuilt in SILT's voice. Do not write full scripts yet.
4. Give every static and reel a suggested date in the window, spread across the two weeks, no more than one static and one reel per day.
5. Learn from team_feedback_on_agent_output: avoid what was rejected and apply every note.

Answer in this JSON shape:
{"strategy":{"summary":"3-4 sentences","whats_new":"what changed since the last strategy because of new research, or empty","pillars":[{"name":"","driver":"","why":"","evidence":"with the brands it comes from"}],"category_patterns":[{"pattern":"","brands":["brands where it runs long"],"strength":"proven|emerging","use":"how SILT uses it"}],"insights":[{"what":"what a competitor does","source":"brand","so_what":"what SILT does about it"}],"gaps":["angles no brand covers that SILT can own"],"avoid":["things not to do this fortnight"]},
"statics":[{"title":"","product":"mornings|nights|both","driver":"","pillar":"","why":"why this will work, with the evidence","visual_idea":"the one creative idea in a sentence","scene":"what the image shows","layout":"where the logo, headline, box, glass and chips sit","text":{"headline":"","line":"optional short line","chips":["optional, max 3"]},"meta":{"primary":"Meta primary text, 1-3 short lines","headline":"Meta headline, max 40 characters"},"date":"YYYY-MM-DD"}],
"reels":[{"title":"","product":"mornings|nights|both|brand","driver":"","pillar":"","hook":"first line or on-screen question","format":"e.g. creator talking to phone camera, 30-40 s","outline":"3-5 sentences: beats from hook to close","based_on":"the competitor pattern or teardown ad this borrows from","why":"","date":"YYYY-MM-DD"}]}`;

  return {
    system: SYSTEM(rules), user,
    meta: { statics: nStatics, reels: nReels, start: iso(start), end: iso(end), focus, sources },
  };
}

// The whole brief as one message for ChatGPT Plus.
export function briefText(b) {
  return `${b.system}\n\n---\n\n${b.user}\n\nReply with only the JSON object, in one code block, and nothing else.`;
}

export async function runStrategy(env, by, opts = {}) {
  const b = await buildBrief(env, opts);
  const out = await chatJSON(env, b.system, b.user, () => mockStrategy(b.meta.statics, b.meta.reels, new Date(b.meta.start + "T00:00:00Z")));
  return saveRun(env, out, b.meta, by, "api");
}

// Pull the JSON object out of whatever the team pasted from ChatGPT (code block, extra words, smart quotes).
export function parsePasted(text) {
  let t = String(text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1];
  const a = t.indexOf("{"), z = t.lastIndexOf("}");
  if (a < 0 || z <= a) throw new AgentError("That doesn't look like ChatGPT's answer. Paste the whole reply, including the code block.", 400);
  t = t.slice(a, z + 1);
  try { return JSON.parse(t); } catch {}
  try { return JSON.parse(t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/,\s*([}\]])/g, "$1")); }
  catch { throw new AgentError("Couldn't read ChatGPT's answer. Ask ChatGPT to \"reply again with only valid JSON in one code block\" and paste that.", 400); }
}

export async function importRun(env, text, meta, by) {
  await ensureTables(env);
  const out = parsePasted(text);
  if (!out.strategy && !(out.statics || []).length && !(out.reels || []).length) throw new AgentError("The answer has no strategy, statics or reels in it.", 400);
  const m = meta && isDate(meta.start) && isDate(meta.end) ? meta : (await buildBrief(env, meta || {})).meta;
  return saveRun(env, out, { ...m, statics: Math.min(Math.max(Number(m.statics) || 4, 1), 8), reels: Math.min(Math.max(Number(m.reels) || 4, 1), 8), focus: s(m.focus, 500) }, by, "chatgpt-plus");
}

async function saveRun(env, out, meta, by, via) {
  const { statics: nStatics, reels: nReels, focus, sources } = meta;
  const run_id = rid("run");
  const now = new Date().toISOString();
  const base = { run_id, created_at: now, created_by: by };
  const inWindow = d => (isDate(d) ? d : "");

  const st = out.strategy || {};
  const saved = [await putItem(env, {
    ...base, id: rid("a"), kind: "strategy", focus: focus || undefined, via,
    period: { start: meta.start, end: meta.end },
    summary: s(st.summary, 2000),
    pillars: (st.pillars || []).slice(0, 6).map(p => ({ name: s(p.name, 120), driver: s(p.driver, 60), why: s(p.why, 600), evidence: s(p.evidence, 600) })),
    whats_new: s(st.whats_new, 800),
    category_patterns: (st.category_patterns || []).slice(0, 8).map(p => ({ pattern: s(p.pattern, 300), brands: arr(p.brands, 10, 60), strength: p.strength === "proven" ? "proven" : "emerging", use: s(p.use, 400) })),
    insights: (st.insights || []).slice(0, 12).map(p => ({ what: s(p.what, 400), source: s(p.source, 120), so_what: s(p.so_what, 400) })),
    gaps: arr(st.gaps, 6, 300),
    avoid: arr(st.avoid, 8, 300),
    sources,
  })];
  for (const x of (out.statics || []).slice(0, nStatics)) {
    const it = {
      ...base, id: rid("a"), kind: "static", status: "pending",
      title: s(x.title, 160), product: prod(x.product), driver: s(x.driver, 60), pillar: s(x.pillar, 120), why: s(x.why, 800),
      visual_idea: s(x.visual_idea, 400), scene: s(x.scene, 1500), layout: s(x.layout, 800),
      text: { headline: s(x.text?.headline, 120), line: s(x.text?.line, 120), chips: arr(x.text?.chips, 3, 40) },
      meta: { primary: s(x.meta?.primary, 600), headline: s(x.meta?.headline, 60) },
      date: inWindow(x.date), image_status: "waiting", images: [],
    };
    it.image_prompt = staticPrompt(it);
    saved.push(await putItem(env, it));
  }
  for (const x of (out.reels || []).slice(0, nReels)) {
    saved.push(await putItem(env, {
      ...base, id: rid("a"), kind: "reel", status: "pending",
      title: s(x.title, 160), product: prod(x.product), driver: s(x.driver, 60), pillar: s(x.pillar, 120),
      hook: s(x.hook, 300), format: s(x.format, 200), outline: s(x.outline, 1500), based_on: s(x.based_on, 300), why: s(x.why, 800),
      date: inWindow(x.date),
    }));
  }
  return saved;
}

// ---------- statics ----------
export function staticPrompt(it, extra) {
  const t = it.text || {};
  const words = [t.headline && `Headline: "${t.headline}"`, t.line && `Short line: "${t.line}"`, ...(t.chips || []).map(c => `Chip: "${c}"`)].filter(Boolean);
  const look = it.product === "nights"
    ? "SILT Nights look: light powder blue (#C9D5EA) and silver with navy (#101E41) accents, calm evening light. Not cream, not gold, not dark marble. Any Nights drink in a glass is cloudy, milky, whitish and slightly translucent, never orange or yellow."
    : it.product === "mornings"
      ? "SILT Mornings look: cream (#FAF0D4) with dawn gold (#EBB858) accents and navy (#0A1737) text, soft morning daylight."
      : "SILT Mornings + Nights look: cream and dawn gold on the Mornings side, light powder blue and silver on the Nights side, navy text.";
  return [
    `Create a vertical 9:16 social media ad image (1080 x 1920) for SILT Nutrition, an Indian wellness drink brand for busy professionals.`,
    it.product === "brand" ? "" : `PRODUCT: the attached photo is the real SILT ${it.product === "nights" ? "Nights" : "Mornings"} box and stick. Use it exactly: same shape, colours, logo and label text. Show the box large, straight and fully readable. Do not redraw, rename or add any text on the packaging. No cartoon sticks.`,
    `IDEA: ${it.visual_idea}`,
    `SCENE: ${it.scene}`,
    `LAYOUT: ${it.layout} The SILT logo sits large at the top. Keep all text and the product inside the middle area (x 65 to 1015, y 320 to 1600), clear of the bottom right corner.`,
    `TEXT ON THE IMAGE (spell it exactly as written, add no other words): ${words.join("; ")}. Headline in a clean geometric sans-serif like Jost, sentence case. Chips are separate navy rounded pills with white text.`,
    `STYLE: ${look} Photorealistic, premium, sober and classy. Indian people and Indian settings.`,
    `RULES: No other brands or logos. No prices, no "Shop now" button, no claims beyond the words above. No emoji.`,
    extra ? `CHANGES REQUESTED BY THE TEAM: ${extra}` : "",
  ].filter(Boolean).join("\n\n");
}

// Saves a new image version on a static (made by OpenAI, or made in ChatGPT Plus and uploaded).
async function storeImage(env, it, img, note, prompt, by) {
  if (!img.b64 || img.b64.length > 1_900_000) throw new AgentError("The image is too large to store (keep it under about 1.4 MB). The Desk shrinks uploads automatically; try another file.", 413);
  const mid = rid("m");
  const at = new Date().toISOString();
  await env.DB.prepare("INSERT INTO media (id, mime, b64, created_at) VALUES (?, ?, ?, ?)").bind(mid, img.mime, img.b64, at).run();
  it.images = [...(it.images || []), { id: mid, at, note: s(note, 1000) || undefined, by: by || undefined }];
  it.image_id = mid;
  it.image_status = "ready";
  if (prompt) it.image_prompt = prompt;
  if (it.status === "changes") it.status = "pending"; // a new version goes back for review
  return putItem(env, it);
}

export async function makeStaticImage(env, id, note, origin) {
  await ensureTables(env);
  const it = await getItem(env, id);
  if (!it || it.kind !== "static") throw new AgentError("Static not found", 404);
  const prompt = staticPrompt(it, s(note, 1000));
  let pack = null;
  if (it.product !== "brand") {
    const file = it.product === "nights" ? "silt-nights-pack.png" : "silt-mornings-pack.png";
    const r = await env.ASSETS.fetch(new URL(`/teardowns/assets/${file}`, origin));
    if (r.ok) pack = await r.blob();
  }
  return storeImage(env, it, await image(env, prompt, pack), note, prompt);
}

const MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
export async function uploadStaticImage(env, id, body, by) {
  await ensureTables(env);
  const it = await getItem(env, id);
  if (!it || it.kind !== "static") throw new AgentError("Static not found", 404);
  const mime = String(body?.mime || "");
  const b64 = String(body?.b64 || "").replace(/^data:[^,]*,/, "");
  if (!MIMES.has(mime) || !/^[A-Za-z0-9+/=]+$/.test(b64.slice(0, 200))) throw new AgentError("Upload a JPG, PNG or WebP image.", 400);
  return storeImage(env, it, { b64, mime }, body.note, null, by);
}

// ---------- reel scripts (written by Claude) ----------
// The Desk only queues the request. Claude picks it up on the SILT computer
// (scripts/reel-scripts.mjs, run by a scheduled Claude task or on request) and saves the script back.
export async function requestScript(env, id, note, by) {
  await ensureTables(env);
  const it = await getItem(env, id);
  if (!it || it.kind !== "reel") throw new AgentError("Reel not found", 404);
  if (it.status !== "approved") throw new AgentError("Approve the reel idea before asking for its script.", 400);
  it.script_status = "requested";
  it.script_request = { note: s(note, 2000) || undefined, by, at: new Date().toISOString(), rewrite: Boolean(it.script_text) };
  if (note) it.script_note = s(note, 2000);
  return putItem(env, it);
}

// ---------- review patches and the calendar ----------
const STATUSES = new Set(["pending", "approved", "changes", "rejected"]);

export async function patchItem(env, id, patch, by, origin) {
  await ensureTables(env);
  const it = await getItem(env, id);
  if (!it || it.kind === "strategy") throw new AgentError("Item not found", 404);
  const now = new Date().toISOString();
  if ("status" in patch) {
    if (!STATUSES.has(patch.status)) throw new AgentError("Bad status", 400);
    if (patch.status === "approved" && it.kind === "static" && !it.image_id) throw new AgentError("Generate the image before approving this static.", 400);
    it.status = patch.status; it.reviewed_by = by; it.reviewed_at = now;
  }
  if ("script_status" in patch) {
    if (!STATUSES.has(patch.script_status)) throw new AgentError("Bad status", 400);
    if (!it.script_text) throw new AgentError("There is no script yet.", 400);
    it.script_status = patch.script_status; it.script_reviewed_by = by; it.script_reviewed_at = now;
  }
  if ("note" in patch) it.note = s(patch.note, 2000);
  if ("script_note" in patch) it.script_note = s(patch.script_note, 2000);
  if ("script_text" in patch) {
    if (typeof patch.script_text !== "string" || patch.script_text.length > 12000) throw new AgentError("Bad script", 400);
    it.script_text = patch.script_text; it.script_edited_by = by; it.script_edited_at = now;
  }
  if ("date" in patch) {
    if (patch.date && !isDate(patch.date)) throw new AgentError("Bad date", 400);
    it.date = patch.date || "";
  }
  if ("title" in patch) it.title = s(patch.title, 160) || it.title;
  if ("text" in patch && it.kind === "static") {
    const t = patch.text || {};
    it.text = { headline: s(t.headline, 120), line: s(t.line, 120), chips: arr(t.chips, 3, 40) };
  }
  if ("scene" in patch && it.kind === "static") it.scene = s(patch.scene, 1500);
  if ("meta" in patch && it.kind === "static") it.meta = { primary: s(patch.meta?.primary, 600), headline: s(patch.meta?.headline, 60) };
  if (it.kind === "static" && ("text" in patch || "scene" in patch)) it.image_prompt = staticPrompt(it);
  await syncCalendar(env, it, by, origin);
  return putItem(env, it);
}

// Approved static, or a reel whose idea is approved, goes on the calendar.
// A reel shows faded (status pending) until its script is approved, then solid.
async function syncCalendar(env, it, by) {
  const ideaId = "c-a-" + it.id.replace(/^a-/, "");
  const existing = await env.DB.prepare("SELECT doc FROM ideas WHERE id = ?").bind(ideaId).first();
  let status = null;
  if (it.kind === "static") status = it.status === "approved" ? "approved" : null;
  if (it.kind === "reel" && it.status === "approved") status = it.script_status === "approved" ? "approved" : "pending";
  if (!status) {
    // Taken back: keep the calendar entry but mark it so the team sees it is no longer approved.
    if (existing) {
      const d = { ...JSON.parse(existing.doc), status: it.status === "rejected" ? "rejected" : "changes", note: "Taken back on the Agent tab." };
      await env.DB.prepare("UPDATE ideas SET doc = ? WHERE id = ?").bind(JSON.stringify(d), ideaId).run();
    }
    return;
  }
  if (!it.date) it.date = await nextFreeDay(env, it.kind);
  const now = new Date().toISOString();
  const prior = existing ? JSON.parse(existing.doc) : {};
  const doc = {
    ...prior,
    id: ideaId, title: it.title, channel: it.kind === "static" ? "Meta ad (static)" : "Instagram reel", product: it.product,
    date: it.date, status, source: "agent", proposed_by: "Content agent", agent_item: it.id,
    summary: it.kind === "static"
      ? [it.visual_idea, it.text?.headline && `Headline: "${it.text.headline}"`, it.meta?.primary && `Meta copy: ${it.meta.primary}`].filter(Boolean).join("\n")
      : [it.hook && `Hook: ${it.hook}`, it.format, it.outline].filter(Boolean).join("\n"),
    image_url: it.image_id ? `/api/media/${it.image_id}` : undefined,
    script: it.kind === "reel" ? it.script_text || undefined : undefined,
    shotlist: it.kind === "reel" ? it.script?.shotlist : undefined,
    created_at: prior.created_at || now, reviewed_at: now, reviewed_by: by,
    note: it.kind === "reel" && status === "pending" ? "Idea approved. Script waiting for approval on the Agent tab." : prior.note && prior.note !== "Taken back on the Agent tab." && !/^Idea approved/.test(prior.note) ? prior.note : undefined,
  };
  await env.DB.prepare("INSERT INTO ideas (id, date, created_at, doc) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET doc = excluded.doc, date = excluded.date")
    .bind(ideaId, doc.date, doc.created_at, JSON.stringify(doc)).run();
}

async function nextFreeDay(env, kind) {
  const channel = kind === "static" ? "Meta ad (static)" : "Instagram reel";
  const from = iso(new Date(Date.now() + 86400_000));
  const { results } = await env.DB.prepare("SELECT date, doc FROM ideas WHERE date >= ?").bind(from).all();
  const taken = new Set(results.filter(r => { const d = JSON.parse(r.doc); return d.channel === channel && d.status !== "rejected"; }).map(r => r.date));
  const d = new Date(from + "T00:00:00Z");
  while (taken.has(iso(d))) d.setUTCDate(d.getUTCDate() + 1);
  return iso(d);
}

// ---------- mock answers for local testing (AGENT_MOCK=1) ----------
function mockStrategy(nS, nR, start) {
  const day = i => iso(new Date(start.getTime() + i * 86400_000));
  return {
    strategy: { summary: "Mock strategy for local testing.", pillars: [{ name: "Read the label", driver: "transparency", why: "Mock", evidence: "Mock" }], insights: [{ what: "Creators talk to camera", source: "Supply6 teardown", so_what: "Shoot creator reels" }], avoid: ["Symptom questions"] },
    statics: Array.from({ length: nS }, (_, i) => ({ title: `Mock static ${i + 1}`, product: i % 2 ? "nights" : "mornings", driver: "transparency", pillar: "Read the label", why: "Mock", visual_idea: "Box beside a glass on a desk", scene: "A desk at 9 AM", layout: "Logo top, box left, glass right", text: { headline: "Your morning supplements, in one glass.", chips: ["Steady Energy", "Gut Health"] }, meta: { primary: "Mock copy", headline: "Mock headline" }, date: day(i * 2) })),
    reels: Array.from({ length: nR }, (_, i) => ({ title: `Mock reel ${i + 1}`, product: i % 2 ? "nights" : "mornings", driver: "founder_trust", pillar: "Read the label", hook: "What do you take at 3 PM?", format: "Creator to camera, 35 s", outline: "Mock outline", based_on: "Supply6 #5", why: "Mock", date: day(i * 2 + 1) })),
  };
}
