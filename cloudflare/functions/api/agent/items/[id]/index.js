// POST /api/agent/items/<id> with a patch: status, note, date, title, text, scene, meta (statics),
// script_text, script_status, script_note (reels). Approving puts the item on the content calendar.
import { patchItem, json, fail } from "../../../../../lib/agent.js";

export async function onRequestPost({ request, env, params, data }) {
  const id = String(params.id || "");
  if (!/^a-[a-z0-9-]{3,40}$/.test(id)) return json({ error: "Bad id" }, 400);
  let patch;
  try { patch = await request.json(); } catch { return json({ error: "Bad JSON" }, 400); }
  try { return json(await patchItem(env, id, patch, data.email, new URL(request.url).origin)); } catch (e) { return fail(e); }
}
