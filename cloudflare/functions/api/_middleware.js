// Every /api request needs a valid team session, except signing in and out.
// Fails closed: if the password secrets aren't set, the API refuses everything.
import { configured, readSession } from "../../lib/auth.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function onRequest(ctx) {
  const { request, env } = ctx;
  if (!configured(env)) return json({ error: "Login isn't set up yet." }, 503);
  const p = new URL(request.url).pathname;
  if (p === "/api/login" || p === "/api/logout") return ctx.next();
  if (request.method !== "GET") {
    // Block cross-site form posts: writes must come from this site.
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return json({ error: "Bad origin" }, 403);
  }
  const s = await readSession(request, env);
  if (!s) return json({ error: "Please sign in." }, 401);
  ctx.data.email = s.name; // reviewer name, stored as reviewed_by
  return ctx.next();
}
