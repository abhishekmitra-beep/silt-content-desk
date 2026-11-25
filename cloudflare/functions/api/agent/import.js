// POST /api/agent/import {text, meta} -> saves ChatGPT's pasted answer as a new strategy with its statics and reel ideas.
import { importRun, json, fail } from "../../../lib/agent.js";

export async function onRequestPost({ request, env, data }) {
  let b;
  try { b = await request.json(); } catch { return json({ error: "Bad request" }, 400); }
  if (typeof b.text !== "string" || b.text.length > 200000) return json({ error: "Paste ChatGPT's answer (under 200,000 characters)." }, 400);
  try { return json({ items: await importRun(env, b.text, b.meta, data.email) }); } catch (e) { return fail(e); }
}
