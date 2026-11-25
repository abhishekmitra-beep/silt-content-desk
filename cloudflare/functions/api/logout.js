// POST /api/logout -> clears the session cookie.
import { sessionCookie } from "../../lib/auth.js";

export async function onRequestPost() {
  return Response.json({ ok: true }, { headers: { "set-cookie": sessionCookie("", 0), "cache-control": "no-store" } });
}
