// GET  /api/ideas -> { ideas: [...] }  every idea, newest first
// POST /api/ideas {title, details, channel, product, date} -> adds a team idea (status "pending")
const PRODUCTS = new Set(["", "mornings", "nights", "both", "brand"]);

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT id, doc FROM ideas ORDER BY created_at DESC LIMIT 1000").all();
  return Response.json({ ideas: results.map(r => ({ ...JSON.parse(r.doc), _id: r.id })) }, { headers: { "cache-control": "no-store" } });
}

export async function onRequestPost({ request, env, data }) {
  let b;
  try { b = await request.json(); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }
  const s = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const title = s(b.title, 160), details = s(b.details, 4000), channel = s(b.channel, 40), product = s(b.product, 20), date = s(b.date, 10);
  if (!title) return Response.json({ error: "Give the idea a title." }, { status: 400 });
  if (!PRODUCTS.has(product)) return Response.json({ error: "Bad product" }, { status: 400 });
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))) return Response.json({ error: "Bad date" }, { status: 400 });
  const id = "t-" + Date.now().toString(36) + "-" + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  const now = new Date().toISOString();
  const doc = { id, title, summary: details, channel, product: product || undefined, date: date || null, status: "pending", source: "team", proposed_by: data.email, created_at: now };
  await env.DB.prepare("INSERT INTO ideas (id, date, created_at, doc) VALUES (?, ?, ?, ?)").bind(id, doc.date, now, JSON.stringify(doc)).run();
  return Response.json({ ...doc, _id: id });
}
