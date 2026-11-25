// GET /api/prompt?id=<static id>: the static's ChatGPT prompt and follow-ups, for Claude's ChatGPT connector
// (read-only, open to any page, like the rest of the site's GET data).
import { ensure } from "./_db.js";
export async function onRequestGet({ request, env }) {
  await ensure(env);
  const id = new URL(request.url).searchParams.get("id") || "";
  const row = await env.DB.prepare("SELECT doc FROM se_items WHERE id = ? AND kind = 'static'").bind(id).first();
  if (!row) return Response.json({ error: "no static " + id }, { status: 404, headers: { "access-control-allow-origin": "*" } });
  const d = JSON.parse(row.doc);
  return Response.json({ id, product: d.product, concept: d.concept, prompt: d.chatgpt_prompt || "", followups: d.chatgpt_followups || {} }, { headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
}
