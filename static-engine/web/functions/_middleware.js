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
  // Remember when the team's Claude / ChatGPT last used the API (for the "connected" status on the site).
  // Only real AI calls count: the skill's x-silt-client header, or the official ChatGPT / Claude fetchers. Never a page
  // open in a browser (the Claude desktop app's own browser has "Claude" in its user agent).
  if (url.pathname.startsWith("/api/") && ctx.env.DB && request.headers.get("sec-fetch-site") !== "same-origin" && !request.headers.get("x-silt-actor")) {
    const ua = request.headers.get("user-agent") || "", h = String(request.headers.get("x-silt-client") || "").toLowerCase();
    const client = h === "chatgpt" || /ChatGPT-User|OpenAI/i.test(ua) ? "chatgpt" : h === "claude" || /Claude-User|ClaudeBot|Anthropic/i.test(ua) ? "claude" : "";
    if (client) {
      const now = new Date().toISOString();
      // A personal skill / GPT carries its browser's code: every call keeps that browser's "connected" tick fresh.
      const code = String(request.headers.get("x-silt-code") || url.searchParams.get("silt_code") || "").toUpperCase();
      if (/^[A-Z2-9]{6}$/.test(code)) ctx.waitUntil(ctx.env.DB.prepare(`INSERT INTO se_items (id, kind, doc, status, created_by, updated_by, created_at, updated_at) VALUES (?, 'visitor', json_object(?, ?), 'active', ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET doc = json_set(se_items.doc, ?, ?), updated_at = excluded.updated_at`).bind("C-" + code, client, now, client, client, now, now, "$." + client, now).run().catch(() => {}));
      ctx.waitUntil(ctx.env.DB.prepare(`INSERT INTO se_items (id, kind, doc, status, created_by, updated_by, created_at, updated_at) VALUES (?, 'visitor', '{}', 'active', ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at, status = 'active'`).bind("S-" + client, client, client, now, now).run().catch(() => {}));
    }
  }
  const res = await ctx.next();
  const out = new Response(res.body, res);
  out.headers.set("x-robots-tag", "noindex, nofollow");
  if (url.pathname.startsWith("/api/")) out.headers.set("cache-control", "no-store");
  return out;
}
