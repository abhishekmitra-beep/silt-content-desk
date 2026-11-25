// SILT Static Engine is open (no login, per the user on 25 Nov 2026). People type their name once in the page,
// which is sent as the x-silt-name header and stored as created_by / updated_by.
// Writes must come from this site (blocks cross-site form posts). Search engines are asked not to index anything.
export async function onRequest(ctx) {
  const { request } = ctx;
  const url = new URL(request.url);
  if (url.pathname === "/login" || url.pathname === "/login.html") return Response.redirect(new URL("/", url).toString(), 302);
  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) return new Response("Bad origin", { status: 403 });
  }
  const raw = request.headers.get("x-silt-name") || "";
  let name = "";
  try { name = decodeURIComponent(raw); } catch { name = raw; }
  ctx.data.name = name.replace(/[^\p{L}\p{N} .'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 40) || "team";
  // Who is acting: a person clicking on the site ("team") or an AI over the API ("ai").
  // Only team clicks can make a static live; AI verdicts go to the AI Approval tab (user, 25 Nov).
  ctx.data.actor = request.headers.get("x-silt-actor") === "team" && request.headers.get("origin") === url.origin ? "team" : "ai";
  const res = await ctx.next();
  const out = new Response(res.body, res);
  out.headers.set("x-robots-tag", "noindex, nofollow");
  if (url.pathname.startsWith("/api/")) out.headers.set("cache-control", "no-store");
  return out;
}
