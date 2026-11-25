import { ensure } from "../_db.js";
// PUT /api/items/<id> {doc?, status?}  -> update a team static or idea (status: active | approved | made | archived)
// DELETE /api/items/<id>               -> archive it (nothing is hard-deleted; an archived override restores the built-in static)
const STATUSES = new Set(["active", "draft", "changes", "approval", "approved", "rejected", "made", "archived"]);
const MAX = 24000;

export async function onRequestPut({ request, env, params, data }) {
  await ensure(env);
  const id = String(params.id || "");
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }
  const row = await env.DB.prepare("SELECT kind, doc, status FROM se_items WHERE id = ?").bind(id).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  let doc = JSON.parse(row.doc), status = row.status;
  if (body.doc !== undefined) {
    if (!body.doc || typeof body.doc !== "object" || Array.isArray(body.doc)) return Response.json({ error: "Bad doc" }, { status: 400 });
    if (JSON.stringify(body.doc).length > MAX) return Response.json({ error: "Too long" }, { status: 413 });
    doc = { ...body.doc, id: doc.id };
  }
  if (body.status !== undefined) {
    if (!STATUSES.has(body.status)) return Response.json({ error: "Bad status" }, { status: 400 });
    status = body.status;
  }
  const now = new Date().toISOString(), who = data.name || "team";
  await env.DB.prepare("UPDATE se_items SET doc = ?, status = ?, updated_by = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(doc), status, who, now, id).run();
  return Response.json({ id, kind: row.kind, doc, status, updated_by: who, updated_at: now });
}

export async function onRequestDelete({ env, params, data }) {
  await ensure(env);
  const id = String(params.id || "");
  const now = new Date().toISOString();
  const r = await env.DB.prepare("UPDATE se_items SET status = 'archived', updated_by = ?, updated_at = ? WHERE id = ?").bind(data.name || "team", now, id).run();
  return Response.json({ ok: true, changed: r.meta?.changes ?? 0 });
}
