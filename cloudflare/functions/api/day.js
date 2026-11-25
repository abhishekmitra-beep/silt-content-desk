// GET /api/day?date=YYYY-MM-DD -> { posts: [...], brief: {...} | null }
export async function onRequestGet({ request, env }) {
  const date = new URL(request.url).searchParams.get("date") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: "Bad date" }, { status: 400 });
  const [posts, brief] = await Promise.all([
    env.DB.prepare("SELECT id, doc FROM posts WHERE date = ?").bind(date).all(),
    env.DB.prepare("SELECT doc FROM briefs WHERE date = ?").bind(date).first(),
  ]);
  return Response.json(
    {
      posts: posts.results.map(r => ({ ...JSON.parse(r.doc), _id: r.id })),
      brief: brief ? JSON.parse(brief.doc) : null,
    },
    { headers: { "cache-control": "no-store" } }
  );
}
