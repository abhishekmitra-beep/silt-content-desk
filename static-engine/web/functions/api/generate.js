// POST /api/generate {idea, image?, thumb?, count, funnel, product}
// Turns one idea (text and/or a reference image) into finished statics with Cloudflare Workers AI (no team API keys):
//  1. if there's an image, a vision model describes it (layout, hook, mood) so it can inspire the statics;
//  2. a text model writes the statics as JSON, following the Plan of Action, the brand facts and the HOUSE RULES;
//  3. every static is normalised to a real format, copy-checked, saved for the team and returned.
import { ensure } from "./_db.js";
import { BRAND_BRIEF, TEMPLATES, SCENES, checkCopy, wordCount, TEXT_LIMIT, META_FIELDS } from "../../public/engine.js";
import { STATICS } from "../../public/statics.js";
import { buildBrief, briefText, pickLenses } from "./_brief.js";

const TEXT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const FUNNELS = ["TOFU", "MOFU", "BOFU", "RET"], PRODUCTS = ["mornings", "nights", "combo"];
const RELATABLE = ["problemsolution", "scene", "meme", "poll", "chat", "tweet", "notes", "email", "calendar", "checklist", "statement", "forward", "newscard", "search"];

const SKEL = {};
for (const s of STATICS) if (!SKEL[s.t]) SKEL[s.t] = Object.fromEntries(Object.entries(s).filter(([k]) => (!META_FIELDS.includes(k) || ["scene", "scene_a", "scene_b", "scene_problem", "scene_solution"].includes(k)) && !k.startsWith("_") && !["note", "check"].includes(k)));

const PLAN = `PLAN OF ACTION (SILT's own):
- Every static follows Hook > Problem > Solution > Reason to believe > CTA, squeezed into one image: the headline is the hook (or the problem), the sub line is the solution or the proof, the cta is the call to action.
- Pillars: ADHERENCE (simple, tasty, a ritual you won't skip) and TRUST (honest, transparent, every dose on the pack, evidence backed).
- Funnel: TOFU = new audience, MOFU = retargeting with proof, BOFU = hot audience with the offer (COMBO10), RET = existing customers and the ritual (no discount push). TOFU, MOFU and BOFU land "Replaces the stack"; RET lands the ritual / routine.
- OUR SIGNATURE FORMAT is "problemsolution": a PROBLEM | SOLUTION split (like a before / after, but the right side shows the SILT ritual, never a promised result). Use it for about HALF of every batch. The problem side is a relatable scene (or "jars" for the supplement shelf); the solution side is ALWAYS the SILT pack (box + stick) as the answer. Problem and solution lines: 3 to 7 words each.
- RELATABLE FIRST: at least 6 in 10 statics must be about a real moment busy Indian professionals live (1 AM scrolling, Monday standups, chai, wedding season, travel, back-to-back calls, snoozing alarms), NOT a product shot. The product appears small or not at all in those. Prefer the formats: scene (a real-life photo with the line on it), meme, poll, chat, tweet, notes, email, calendar, checklist, statement.
- LESS TEXT: about ${TEXT_LIMIT.good} words per static, ${TEXT_LIMIT.max} at most, call to action included.
- Tone: friend, not parent. Tongue-in-cheek, corporate puns welcome. Never fear-based.`;

const EXAMPLES = ["T15", "T17", "T16", "T10", "T12", "T13", "R11", "B08"].map(id => STATICS.find(s => s.id === id)).filter(Boolean)
  .map(s => JSON.stringify(Object.fromEntries(Object.entries(s).filter(([k]) => !["id", "slug", "format", "check", "theme", "shot"].includes(k))))).join("\n");
const sceneList = Object.entries(SCENES).map(([k, v]) => `${k}: ${v.mood}`).join("\n");

function extractJson(t) {
  if (t && typeof t === "object") return t;   // Workers AI sometimes returns parsed JSON
  const s = String(t || "").replace(/```(?:json)?/g, "");
  const a = s.indexOf("["), o = s.indexOf("{");
  for (const start of [o, a].filter(i => i >= 0).sort((x, y) => x - y)) {
    const open = s[start], close = open === "[" ? "]" : "}";
    const end = s.lastIndexOf(close);
    if (end > start) { try { return JSON.parse(s.slice(start, end + 1)); } catch {} }
  }
  throw new Error("The AI didn't return valid JSON: " + s.slice(0, 120));
}

function normalise(x, fb) {
  const t = TEMPLATES.includes(x?.t) ? x.t : TEMPLATES.includes(x?.format) ? x.format : "problemsolution";
  const base = JSON.parse(JSON.stringify(STATICS.find(s => s.t === t) || STATICS[0]));
  const s = { ...base, t, format: base.format, slug: "idea", check: undefined };
  s.funnel = FUNNELS.includes(x?.funnel) ? x.funnel : (fb.funnel !== "auto" ? fb.funnel : base.funnel);
  s.product = PRODUCTS.includes(x?.product) ? x.product : (fb.product !== "auto" ? fb.product : base.product);
  if (fb.funnel !== "auto") s.funnel = fb.funnel;
  if (fb.product !== "auto") s.product = fb.product;
  s.concept = String(x?.concept || "Idea").slice(0, 50);
  for (const k of Object.keys(SKEL[t] || {})) {
    if (x?.[k] === undefined) continue;
    if (typeof x[k] === typeof base[k] && !(Array.isArray(base[k]) && !Array.isArray(x[k]))) s[k] = x[k];
  }
  for (const k of ["scene", "scene_a", "scene_b"]) if (k in s && !SCENES[s[k]]) s[k] = Object.keys(SCENES)[0];
  for (const k of ["scene_problem", "scene_solution"]) if (k in s && !SCENES[s[k]] && !["product", "jars"].includes(s[k])) s[k] = k === "scene_problem" ? "night-phone" : "product";
  if (typeof x?.cta === "string" && x.cta.trim()) s.cta = x.cta.slice(0, 40);
  if (t === "scene" && !x?.shot) s.shot = "stick";
  delete s.check;
  return s;
}

async function describeImage(env, dataUrl) {
  const b64 = String(dataUrl).split(",")[1] || "";
  const bytes = [...Uint8Array.from(atob(b64), c => c.charCodeAt(0))];
  const ask = "Describe this ad or image for a copywriter in 6 short lines: 1) what's shown, 2) the hook or headline, 3) the layout, 4) the mood and colours, 5) the psychology that makes it work, 6) how a wellness drink brand could borrow the idea without copying it.";
  const run = () => env.AI.run(VISION_MODEL, { prompt: ask, image: bytes, max_tokens: 400 });
  try { return (await run()).response; }
  catch (e) {
    if (/agree/i.test(String(e?.message || e))) { await env.AI.run(VISION_MODEL, { prompt: "agree" }).catch(() => {}); return (await run()).response; }
    throw e;
  }
}

async function writeStatics(env, { idea, imageNote, n, funnel, product, rules, brief }) {
  const sys = `${BRAND_BRIEF}\n\n${PLAN}\n\n${rules.length ? "HOUSE RULES (from Abhishek; these override everything above):\n" + rules.map((r, i) => `${i + 1}. ${r}`).join("\n") + "\n" : ""}`;
  const user = `${brief ? brief + "\n\n" : ""}IDEA: ${idea || (imageNote ? "(see the reference image)" : "NONE GIVEN. Explore: invent one fresh idea from the angles above that no existing static covers, and make every static around it. Put that idea, in under 12 words, in a top-level field \"idea\".")}\n${imageNote ? "REFERENCE IMAGE (borrow the idea, never copy a brand's words or logo):\n" + imageNote + "\n" : ""}
Make ${n} different statics from this idea, each a NEW take that no existing static already has. ${funnel === "auto" ? "Spread them across TOFU, MOFU, BOFU and RET." : "All for funnel " + funnel + "."} ${product === "auto" ? "Pick mornings, nights or combo to fit each one." : "All for product " + product + "."}
Each static is a JSON object with "t" (the format), "funnel", "product", "concept" (2 to 4 words), optional "cta" (max 5 words), and EXACTLY the text keys of its format:
${Object.entries(SKEL).map(([t, k]) => t + ": " + JSON.stringify(k)).join("\n")}
For "problemsolution" set scene_problem and scene_solution to a scene key, "product" or "jars". For "scene" and "meme" pick scene keys from this list:\n${sceneList}
GOOD EXAMPLES (match this quality: specific, witty, short, every text key filled with NEW words about the idea):
${EXAMPLES}
Every static must be clearly about the IDEA. Write fresh words for every text key; never reuse the example lines. The product named in the copy must match "product".
Reply with ONLY {"idea": "...", "statics": [ ...${n} objects... ]}.`;
  const call = model => env.AI.run(model, { messages: [{ role: "system", content: sys }, { role: "user", content: user }], max_tokens: Math.min(4096, 300 * n + 500), temperature: 0.7, response_format: { type: "json_object" } });
  let out, used = TEXT_MODEL;
  try { out = await call(TEXT_MODEL); } catch (e) { used = FALLBACK_MODEL + " (main model failed: " + String(e.message || e).slice(0, 80) + ")"; out = await call(FALLBACK_MODEL); }
  writeStatics.lastModel = used;
  let j;
  try { j = extractJson(out?.response ?? out); }
  catch (e) { const out2 = await call(FALLBACK_MODEL); j = extractJson(out2?.response ?? out2); }
  const list = Array.isArray(j) ? j : (j.statics || []);
  list.idea = !Array.isArray(j) && j.idea ? String(j.idea).replace(/\s+/g, " ").trim().slice(0, 140) : "";
  return list;
}

export async function onRequestPost({ request, env, data }) {
  await ensure(env);
  if (!env.AI) return Response.json({ error: "Cloudflare AI isn't connected to this site." }, { status: 503 });
  let body; try { body = await request.json(); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }
  let idea = String(body.idea || "").replace(/\s+/g, " ").trim().slice(0, 600);
  const explore = body.explore === true;
  const image = typeof body.image === "string" && body.image.startsWith("data:image/") && body.image.length < 1_800_000 ? body.image : null;
  if (!idea && !image && !explore) return Response.json({ error: "Type an idea, add an image, or press Explore something new." }, { status: 400 });
  const count = Math.max(1, Math.min(30, parseInt(body.count, 10) || 6));
  const funnel = FUNNELS.includes(body.funnel) ? body.funnel : "auto", product = PRODUCTS.includes(body.product) ? body.product : "auto";
  const who = data.name || "team", now = new Date().toISOString();

  const rulesRow = await env.DB.prepare("SELECT doc FROM se_items WHERE id = 'house-rules'").first();
  const rules = rulesRow ? (JSON.parse(rulesRow.doc).rules || []).map(r => r.text) : [];

  // What already exists (approved, rejected, every line, past ideas, format use) + new angles to explore.
  let briefTxt = "", lenses = pickLenses(explore ? 4 : 3);
  try { briefTxt = briefText(await buildBrief(env, { maxLines: 90 }), lenses); } catch (e) { briefTxt = ""; }
  let explored = "";
  let imageNote = "";
  if (image) { try { imageNote = await describeImage(env, image); } catch (e) { imageNote = ""; } }

  // Write in batches of up to 10 so long lists don't get cut off.
  const raw = [];
  for (let left = count; left > 0; left -= 10) {
    // Explore: the first batch invents the idea; later batches build on that same idea.
    try { const got = await writeStatics(env, { idea: idea || explored, imageNote, n: Math.min(10, left), funnel, product, rules, brief: briefTxt }); raw.push(...got); if (explore && !idea && !explored && got.idea) explored = got.idea; }
    catch (e) { if (!raw.length && left === count) return Response.json({ error: "The AI couldn't write statics this time (" + String(e.message || e).slice(0, 160) + "). Try again, or use your own Claude / ChatGPT below." }, { status: 502 }); }
  }

  if (!idea && explore) idea = "Explored: " + (explored || "something new");
  const ideaId = "I" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const made = [];
  for (const x of raw.slice(0, count)) {
    const s = normalise(x, { funnel, product });
    const base = STATICS.find(b => b.t === s.t);
    const textKeys = Object.keys(SKEL[s.t] || {}).filter(k => typeof base[k] === "string" && !k.startsWith("scene"));
    if (textKeys.length && textKeys.every(k => s[k] === base[k])) continue;   // the AI left the example text in place
    if (product === "auto") { const txt = JSON.stringify(x); const m = /mornings/i.test(txt), ni = /nights/i.test(txt); if (m && !ni) s.product = "mornings"; else if (ni && !m) s.product = "nights"; else if (m && ni) s.product = "combo"; }
    const id = "G" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    s.id = id; s.slug = (s.concept || "idea").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "idea";
    s.idea_id = ideaId; s.source = idea.slice(0, 200);
    const flags = checkCopy(s), w = wordCount(s);
    if (w > TEXT_LIMIT.max) flags.push(`${w} words: too texty, trim it.`);
    if (flags.length) s.flags = flags;
    await env.DB.prepare("INSERT INTO se_items (id, kind, doc, status, created_by, updated_by, created_at, updated_at) VALUES (?, 'static', ?, 'approval', ?, ?, ?, ?)")
      .bind(id, JSON.stringify(s), who, who, now, now).run();
    made.push({ id, kind: "static", doc: s, status: "approval", created_by: who, updated_by: who, updated_at: now });
  }
  const thumb = typeof body.thumb === "string" && body.thumb.startsWith("data:image/") && body.thumb.length < 120_000 ? body.thumb : null;
  const ideaDoc = { id: ideaId, text: idea, image: thumb, image_note: imageNote.slice(0, 1200), count, funnel, product, made: made.map(m => m.id), rules_used: rules.length, lenses, explored: explore };
  await env.DB.prepare("INSERT INTO se_items (id, kind, doc, status, created_by, updated_by, created_at, updated_at) VALUES (?, 'idea', ?, 'active', ?, ?, ?, ?)")
    .bind(ideaId, JSON.stringify(ideaDoc), who, who, now, now).run();
  return Response.json({ idea: { id: ideaId, kind: "idea", doc: ideaDoc, status: "active", created_by: who, updated_at: now }, statics: made, info: { model: writeStatics.lastModel, written: raw.length, kept: made.length, raw: body.debug ? raw.slice(0, 4) : undefined } });
}
