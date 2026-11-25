// POST /api/agent/strategy {statics?, reels?, focus?} -> (API mode only) runs the strategy with OpenAI.
// In ChatGPT Plus mode the Desk uses /api/agent/brief and /api/agent/import instead.
import { runStrategy, agentMode, json, fail } from "../../../lib/agent.js";

export async function onRequestPost({ request, env, data }) {
  if (agentMode(env) !== "api") return json({ error: "This Desk runs the agent through ChatGPT Plus. Use the brief and paste the answer back." }, 400);
  let b = {};
  try { b = await request.json(); } catch {}
  try { return json({ items: await runStrategy(env, data.email, b) }); } catch (e) { return fail(e); }
}
