// GET /api/days -> { days: ["2026-11-17", "2026-11-16", ...], me: "you@example.com" }
export async function onRequestGet({ env, data }) {
  const { results } = await env.DB.prepare("SELECT date FROM briefs ORDER BY date DESC LIMIT 400").all();
  return Response.json({ days: results.map(r => r.date), me: data.email, open: env.DESK_OPEN === "1" }, { headers: { "cache-control": "no-store" } });
}
