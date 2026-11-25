// GET /api/visit -> { first: true } the first time a network (IP address) opens the Static Engine, so the page can show
// the "connect your Claude / ChatGPT" welcome. Only a salted SHA-256 hash of the IP is kept, never the address itself.
import { ensure } from "./_db.js";

export async function onRequestGet({ request, env }) {
  await ensure(env);
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("silt-se-v1|" + ip));
  const id = "V-" + [...new Uint8Array(buf)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
  const seen = await env.DB.prepare("SELECT id FROM se_items WHERE id = ?").bind(id).first();
  if (seen) return Response.json({ first: false });
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT OR IGNORE INTO se_items (id, kind, doc, status, created_at, updated_at) VALUES (?, 'visitor', '{}', 'active', ?, ?)").bind(id, now, now).run();
  return Response.json({ first: true });
}
