// GET /api/brief: what the engine already has, for the team's own Claude / ChatGPT to read BEFORE writing statics,
// so new statics build on what works, skip what was rejected, never repeat a line, and explore new angles.
import { ensure } from "./_db.js";
import { buildBrief, briefText, pickLenses } from "./_brief.js";

export async function onRequestGet({ env }) {
  await ensure(env);
  const b = await buildBrief(env, { maxLines: 200 });
  const suggested = pickLenses(4);
  return Response.json({ ...b, suggested_angles: suggested, prompt: briefText(b, suggested) });
}
