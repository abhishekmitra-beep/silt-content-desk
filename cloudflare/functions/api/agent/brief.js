// POST /api/agent/brief {statics?, reels?, focus?} -> { text, meta }: the whole brief to paste into ChatGPT Plus.
// It holds the competitor analysis, every brand's ad teardown, the calendar, the rules and the team's feedback.
import { buildBrief, briefText, json, fail } from "../../../lib/agent.js";

export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch {}
  try { const brief = await buildBrief(env, b); return json({ text: briefText(brief), meta: brief.meta }); } catch (e) { return fail(e); }
}
