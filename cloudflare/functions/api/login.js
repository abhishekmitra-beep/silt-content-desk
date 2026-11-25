// POST /api/login {name, password} -> sets the session cookie.
import { passwordMatches, makeSession, sessionCookie, SESSION_DAYS } from "../../lib/auth.js";

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Bad origin" }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }
  const name = String(body.name || "").replace(/\s+/g, " ").trim().slice(0, 40);
  if (!name) return Response.json({ error: "Enter your name so reviews show who made them." }, { status: 400 });
  if (!(await passwordMatches(body.password, env))) {
    await new Promise(r => setTimeout(r, 800)); // slow down guessing
    return Response.json({ error: "That password isn't right." }, { status: 401 });
  }
  const token = await makeSession(name, env);
  return Response.json({ name }, { headers: { "set-cookie": sessionCookie(token, SESSION_DAYS * 86400), "cache-control": "no-store" } });
}
