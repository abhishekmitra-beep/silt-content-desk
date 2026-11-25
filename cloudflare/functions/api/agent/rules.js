// POST /api/agent/rules {text} -> saves the agent's brand, statics and reels rules. {text: ""} restores the defaults.
import { getRules, json, fail } from "../../../lib/agent.js";

export async function onRequestPost({ request, env, data }) {
  try {
    const b = await request.json();
    if (typeof b.text !== "string" || b.text.length > 30000) return json({ error: "Rules must be text under 30,000 characters." }, 400);
    if (!b.text.trim()) await env.DB.prepare("DELETE FROM docs WHERE key = 'agent-rules'").run();
    else await env.DB.prepare("INSERT INTO docs (key, doc, updated_at) VALUES ('agent-rules', ?, ?) ON CONFLICT(key) DO UPDATE SET doc = excluded.doc, updated_at = excluded.updated_at")
      .bind(JSON.stringify({ text: b.text, updated_by: data.email }), new Date().toISOString()).run();
    return json(await getRules(env));
  } catch (e) { return fail(e); }
}
