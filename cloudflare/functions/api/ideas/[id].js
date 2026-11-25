// POST /api/ideas/<id> with a JSON patch: status, date ("" to unschedule), note.
const STATUSES = new Set(["pending", "approved", "changes", "rejected"]);

export async function onRequestPost({ request, env, params, data }) {
  const id = String(params.id || "");
  if (!/^[ct]-[a-z0-9-]{3,40}$/.test(id)) return Response.json({ error: "Bad idea id" }, { status: 400 });
  let patch;
  try { patch = await request.json(); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }

  const clean = {};
  if ("status" in patch) {
    if (!STATUSES.has(patch.status)) return Response.json({ error: "Bad status" }, { status: 400 });
    clean.status = patch.status;
  }
  if ("date" in patch) {
    if (patch.date === "" || patch.date === null) clean.date = null;
    else if (/^\d{4}-\d{2}-\d{2}$/.test(patch.date) && !Number.isNaN(Date.parse(patch.date))) clean.date = patch.date;
    else return Response.json({ error: "Bad date" }, { status: 400 });
  }
  if ("note" in patch) {
    if (typeof patch.note !== "string" || patch.note.length > 2000) return Response.json({ error: "Bad note" }, { status: 400 });
    clean.note = patch.note.trim();
  }
  if (!Object.keys(clean).length) return Response.json({ error: "Nothing to change" }, { status: 400 });

  const row = await env.DB.prepare("SELECT doc FROM ideas WHERE id = ?").bind(id).first();
  if (!row) return Response.json({ error: "Idea not found" }, { status: 404 });
  const doc = { ...JSON.parse(row.doc), ...clean, reviewed_at: new Date().toISOString(), reviewed_by: data.email };
  await env.DB.prepare("UPDATE ideas SET doc = ?, date = ? WHERE id = ?").bind(JSON.stringify(doc), doc.date ?? null, id).run();
  return Response.json({ ...doc, _id: id });
}
