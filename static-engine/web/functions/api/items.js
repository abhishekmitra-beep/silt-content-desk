import { ensure } from "./_db.js";
import { asActor } from "./items/[id].js";
import { checkCopy, wordCount, TEXT_LIMIT } from "../../public/engine.js";
// The Checker: every static saved here (from the site, or from someone's own Claude / ChatGPT) gets the copy rules applied.
function checker(doc) {
  try { const f = checkCopy(doc); const w = wordCount(doc); if (w > TEXT_LIMIT.max) f.push(w + " words: too texty, trim it."); if (f.length) doc.flags = f; else delete doc.flags; } catch {}
  return doc;
}
// Team statics and ideas, shared by everyone signed in to the SILT Static Engine.
//   GET  /api/items            -> { items: [{id, kind, doc, status, created_by, updated_by, updated_at}] } (archived left out)
//   POST /api/items {kind, doc} -> creates a static, idea, or an override of a built-in static (doc.id = built-in id)
// Open site: ctx.data.name is the name the person typed (x-silt-name header). Statuses: draft > changes | approval > approved | rejected.
// "decision" = the team approved or rejected a built-in or library static (id "D-<static id>").
const KINDS = new Set(["static", "override", "idea", "decision"]);
const MAX = 24000;

export async function onRequestGet({ env }) {
  await ensure(env);
  const { results } = await env.DB.prepare("SELECT id, kind, doc, status, created_by, updated_by, updated_at FROM se_items WHERE status != 'archived' AND kind != 'visitor' ORDER BY updated_at DESC LIMIT 3000").all();
  return Response.json({ items: results.map(r => ({ ...r, doc: JSON.parse(r.doc) })) }, { headers: { "cache-control": "no-store" } });
}

export async function onRequestPost({ request, env, data }) {
  await ensure(env);
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }
  const kind = String(body.kind || ""), doc = body.doc;
  if (!KINDS.has(kind) || !doc || typeof doc !== "object" || Array.isArray(doc)) return Response.json({ error: "Need kind and doc" }, { status: 400 });
  if (kind === "static" || kind === "override") checker(doc);
  const text = JSON.stringify(doc);
  if (text.length > MAX) return Response.json({ error: "Too long" }, { status: 413 });
  let id;
  if (kind === "decision") {
    if (!/^[TMBRL]\d{2}$/.test(String(doc.id || ""))) return Response.json({ error: "Decisions need a built-in or library id like T01 or L05" }, { status: 400 });
    if (!["approved", "rejected", "ai_approved", "ai_rejected"].includes(body.status)) return Response.json({ error: "Decision must be approved or rejected" }, { status: 400 });
    id = "D-" + doc.id;
  } else if (kind === "override") {
    id = String(doc.id || "");
    if (!/^[TMBR]\d{2}$/.test(id)) return Response.json({ error: "Overrides need a built-in id like T01" }, { status: 400 });
  } else {
    id = (kind === "idea" ? "I" : "N") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    doc.id = kind === "idea" ? id : (doc.id && /^N[0-9a-z]+$/.test(doc.id) ? doc.id : id);
    if (kind === "static") id = doc.id;
  }
  let status = ["draft", "changes", "approval", "approved", "ai_approved"].includes(body.status) || (kind === "decision" && ["rejected", "ai_rejected"].includes(body.status)) ? body.status : (kind === "idea" ? "active" : "draft");
  if (kind !== "idea") status = asActor(status, data.actor);
  if (data.actor !== "team" && (kind === "decision" || kind === "override")) {
    const prev = await env.DB.prepare("SELECT status FROM se_items WHERE id = ?").bind(id).first();
    if (prev && ["approved", "rejected"].includes(prev.status)) return Response.json({ error: "The team has already decided on this static; an AI can't change that." }, { status: 409 });
  }
  const now = new Date().toISOString(), who = data.name || "team";
  await env.DB.prepare(`INSERT INTO se_items (id, kind, doc, status, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET doc = excluded.doc, status = excluded.status, updated_by = excluded.updated_by, updated_at = excluded.updated_at`)
    .bind(id, kind, JSON.stringify(doc), status, who, who, now, now).run();
  return Response.json({ id, kind, doc, status, created_by: who, updated_by: who, updated_at: now });
}
