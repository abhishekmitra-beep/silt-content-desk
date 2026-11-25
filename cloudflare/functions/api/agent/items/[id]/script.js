// POST /api/agent/items/<id>/script {note?} -> asks Claude to write (or rewrite with the note) the script for an
// approved reel idea. Claude picks the request up on the SILT computer and saves the script back to the Desk.
import { requestScript, json, fail } from "../../../../../lib/agent.js";

export async function onRequestPost({ request, env, params, data }) {
  const id = String(params.id || "");
  if (!/^a-[a-z0-9-]{3,40}$/.test(id)) return json({ error: "Bad id" }, 400);
  let b = {};
  try { b = await request.json(); } catch {}
  try { return json(await requestScript(env, id, b.note, data.email)); } catch (e) { return fail(e); }
}
