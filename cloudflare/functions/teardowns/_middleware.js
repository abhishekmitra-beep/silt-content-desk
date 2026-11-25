// Competitor ad teardowns (/teardowns/*) are static pages, but only for signed-in team members.
import { configured, readSession } from "../../lib/auth.js";

export async function onRequest(ctx) {
  const { request, env } = ctx;
  if (!configured(env)) return new Response("Login isn't set up yet.", { status: 503 });
  const s = await readSession(request, env);
  if (!s) return Response.redirect(new URL("/", request.url).toString(), 302);
  const res = await ctx.next();
  const out = new Response(res.body, res);
  out.headers.set("cache-control", "private, no-store");
  out.headers.set("x-robots-tag", "noindex");
  return out;
}
