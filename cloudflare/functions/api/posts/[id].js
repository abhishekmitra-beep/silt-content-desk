// POST /api/posts/<id> with a JSON patch of review fields. The reviewer is taken from the Access login.
const STATUSES = new Set(["pending", "approved", "changes", "rejected", "posted"]);
const LIMITS = { note: 2000, edited_text: 10000, edited_title: 300 };

export async function onRequestPost({ request, env, params, data }) {
  const id = String(params.id || "");
  if (!/^\d{4}-\d{2}-\d{2}_[xrlc]\d{1,2}$/.test(id)) return Response.json({ error: "Bad post id" }, { status: 400 });
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
    if (v === null && k !== "note") { clean[k] = null; continue; }
    if (typeof v !== "string" || v.length > LIMITS[k]) return Response.json({ error: `Bad ${k}` }, { status: 400 });
    clean[k] = v;
  }
  if (!Object.keys(clean).length) return Response.json({ error: "Nothing to change" }, { status: 400 });

  const row = await env.DB.prepare("SELECT doc FROM posts WHERE id = ?").bind(id).first();
  if (!row) return Response.json({ error: "Post not found" }, { status: 404 });
  const doc = { ...JSON.parse(row.doc), ...clean, reviewed_at: new Date().toISOString(), reviewed_by: data.email };
  for (const k of ["edited_text", "edited_title"]) if (doc[k] === null) delete doc[k];
  await env.DB.prepare("UPDATE posts SET doc = ? WHERE id = ?").bind(JSON.stringify(doc), id).run();
  return Response.json({ ...doc, _id: id });
}
