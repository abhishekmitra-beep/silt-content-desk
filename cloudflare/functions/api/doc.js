// GET /api/doc?key=competitors -> a stored reference document (behind the team login like everything in /api).
export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!/^[a-z0-9-]{1,40}$/.test(key)) return Response.json({ error: "Bad key" }, { status: 400 });
  const row = await env.DB.prepare("SELECT doc, updated_at FROM docs WHERE key = ?").bind(key).first();
  if (!row) return Response.json({ error: "Not found" }, { status: 404, headers: { "cache-control": "no-store" } });
  return Response.json({ ...JSON.parse(row.doc), updated_at: row.updated_at }, { headers: { "cache-control": "no-store" } });
}
