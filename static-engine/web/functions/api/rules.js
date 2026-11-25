// House rules for every generated static (Abhishek's instructions, or his Claude's).
//   GET  /api/rules                         -> { rules: [{id, text, by, at}], updated_at }
//   POST /api/rules  {add: "text"} | {remove: id} | {edit: [{id, text}]} | {replace: ["...", ...]}   needs header x-rules-key = RULES_KEY
// Anyone can read them; only someone with the rules key can change them (the site itself is open).
import { ensure } from "./_db.js";

async function read(env) {
  const row = await env.DB.prepare("SELECT doc, updated_at FROM se_items WHERE id = 'house-rules'").first();
  return row ? { ...JSON.parse(row.doc), updated_at: row.updated_at } : { rules: [], updated_at: null };
}

export async function onRequestGet({ env }) {
  await ensure(env);
  return Response.json(await read(env));
}

export async function onRequestPost({ request, env, data }) {
  await ensure(env);
  if (!env.RULES_KEY || request.headers.get("x-rules-key") !== env.RULES_KEY) return Response.json({ error: "Only someone with the rules key can change the house rules." }, { status: 403 });
  let body; try { body = await request.json(); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }
  const cur = await read(env), who = data.name || "team", now = new Date().toISOString();
  let rules = cur.rules || [];
  const clean = t => String(t || "").replace(/\s+/g, " ").trim().slice(0, 600);
  if (Array.isArray(body.replace)) rules = body.replace.map(clean).filter(Boolean).slice(0, 60).map((text, i) => ({ id: "r" + Date.now().toString(36) + i, text, by: who, at: now }));
  if (body.add) { const t = clean(body.add); if (t) rules.push({ id: "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), text: t, by: who, at: now }); }
  if (body.remove) rules = rules.filter(r => r.id !== body.remove);
  // {edit: [{id, text}]}: change a rule's words in place, keeping its number and author (who edited it is recorded)
  for (const e of Array.isArray(body.edit) ? body.edit : body.edit ? [body.edit] : []) {
    const r = rules.find(x => x.id === e.id), t = clean(e.text); if (r && t && t !== r.text) Object.assign(r, { text: t, edited_by: who, edited_at: now });
  }
  if (rules.length > 60) return Response.json({ error: "Keep it to 60 rules or fewer." }, { status: 400 });
  await env.DB.prepare(`INSERT INTO se_items (id, kind, doc, status, created_by, updated_by, created_at, updated_at) VALUES ('house-rules', 'rules', ?, 'active', ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET doc = excluded.doc, updated_by = excluded.updated_by, updated_at = excluded.updated_at`).bind(JSON.stringify({ rules }), who, who, now, now).run();
  return Response.json({ rules, updated_at: now });
}
