// POST /api/agent/digest {page: "/teardowns/<slug>.html"} -> reads a new teardown page into the agent's research.
// The Agent tab calls this for each listed teardown that hasn't been read yet, just before a run.
import { digestPage, json, fail } from "../../../lib/agent.js";

export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch {}
  try { return json(await digestPage(env, String(b.page || ""), new URL(request.url).origin)); } catch (e) { return fail(e); }
}
