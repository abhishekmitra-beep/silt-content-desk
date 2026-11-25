// POST /api/retention/<messageId> with a JSON patch {status?, note?, edited_text?}.
// Updates that message inside the "retention" doc. The reviewer comes from the team login (data.email = name).
const STATUSES = new Set(["pending", "approved", "changes", "rejected", "live"]);
const LIMITS = { note: 2000, edited_text: 4000, edited_text_hi: 4000 };

export async function onRequestPost({ request, env, params, data }) {
  const id = String(params.id || "");
  if (!/^r\d{2}[a-z]?$/.test(id)) return Response.json({ error: "Bad message id" }, { status: 400 });
  let patch;
  try { patch = await request.json(); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }

  const clean = {};
  if ("status" in patch) {
    if (!STATUSES.has(patch.status)) return Response.json({ error: "Bad status" }, { status: 400 });
    clean.status = patch.status;
  }
  for (const k of Object.keys(LIMITS)) {
    if (!(k in patch)) continue;
    const v = patch[k];
    if (v === null && k.startsWith("edited_text")) { clean[k] = null; continue; }
    if (typeof v !== "string" || v.length > LIMITS[k]) return Response.json({ error: `Bad ${k}` }, { status: 400 });
    clean[k] = v;
  }
  if (!Object.keys(clean).length) return Response.json({ error: "Nothing to change" }, { status: 400 });

  const row = await env.DB.prepare("SELECT doc FROM docs WHERE key = 'retention'").first();
  if (!row) return Response.json({ error: "Retention flow not found" }, { status: 404 });
  const doc = JSON.parse(row.doc);
  const msg = (doc.messages || []).find(m => m.id === id);
  if (!msg) return Response.json({ error: "Message not found" }, { status: 404 });
  Object.assign(msg, clean, { reviewed_at: new Date().toISOString(), reviewed_by: data.email });
  for (const k of ["edited_text", "edited_text_hi"]) if (msg[k] === null) delete msg[k];
  await env.DB.prepare("UPDATE docs SET doc = ?, updated_at = ? WHERE key = 'retention'").bind(JSON.stringify(doc), new Date().toISOString()).run();
  return Response.json(msg);
}
