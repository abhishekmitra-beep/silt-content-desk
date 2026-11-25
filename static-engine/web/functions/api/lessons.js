// GET /api/lessons: what the team rejected and why, as lessons for every AI (and the Rules tab).
import { ensure } from "./_db.js";
import { lessons, REJECT_TAGS } from "./_brief.js";
export async function onRequestGet({ env }) {
  await ensure(env);
  return Response.json({ ...(await lessons(env)), tags: Object.keys(REJECT_TAGS) }, { headers: { "cache-control": "no-store" } });
}
