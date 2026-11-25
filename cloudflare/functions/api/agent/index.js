// GET /api/agent -> { items, rules, models, research }   everything the Agent tab shows (newest first)
import { ensureTables, listItems, getRules, research, researchStatus, agentMode, json, fail } from "../../../lib/agent.js";
import { models } from "../../../lib/openai.js";

export async function onRequestGet({ env }) {
  try {
    await ensureTables(env);
    const [items, rules, R] = await Promise.all([listItems(env), getRules(env), research(env)]);
    return json({ items, rules, mode: agentMode(env), models: models(env), research: researchStatus(R), key_set: Boolean(env.OPENAI_API_KEY), mock: env.AGENT_MOCK === "1" });
  } catch (e) { return fail(e); }
}
