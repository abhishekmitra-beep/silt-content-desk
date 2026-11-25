// GET /api/queue: the ideas waiting for Claude, oldest first, plus the brief (what the engine already has) and the house
// rules, so whoever's Claude picks one up can think it through properly. Also lists the statics that still need their
// image from ChatGPT (Claude wrote the prompt; ChatGPT makes the picture; someone uploads it onto the static).
import { ensure } from "./_db.js";
import { buildBrief, briefText, pickLenses, headLine } from "./_brief.js";

export async function onRequestGet({ env }) {
  await ensure(env);
  const rows = (await env.DB.prepare("SELECT id, doc, status, created_by, updated_by, created_at, updated_at FROM se_items WHERE kind = 'idea' AND status IN ('waiting', 'working') ORDER BY created_at ASC LIMIT 50").all()).results;
  const ideas = [];
  for (const r of rows) {
    const d = JSON.parse(r.doc);
    const ids = (d.made || []).slice(-60);
    const made = ids.length ? (await env.DB.prepare(`SELECT doc FROM se_items WHERE id IN (${ids.map(() => "?").join(",")})`).bind(...ids).all()).results.map(x => headLine(JSON.parse(x.doc))) : [];
    ideas.push({ id: r.id, idea: d.text, status: r.status, count: d.count || 6, funnel: d.funnel || "auto", product: d.product || "auto", image_note: d.image_note || "", asked_by: r.created_by, working: r.status === "working" ? r.updated_by : "", already_made_for_this_idea: made });
  }
  const needImg = (await env.DB.prepare("SELECT id, doc, status FROM se_items WHERE kind = 'static' AND status NOT IN ('archived', 'rejected') AND doc LIKE '%chatgpt_prompt%' ORDER BY created_at DESC LIMIT 200").all()).results
    .map(r => ({ id: r.id, status: r.status, doc: JSON.parse(r.doc) })).filter(x => x.doc.chatgpt_prompt && !(x.doc.files && Object.keys(x.doc.files).length))
    .map(x => ({ static_id: x.id, idea_id: x.doc.idea_id, headline: headLine(x.doc), chatgpt_prompt: x.doc.chatgpt_prompt, funnel: x.doc.funnel, product: x.doc.product }));
  const rulesRow = await env.DB.prepare("SELECT doc FROM se_items WHERE id = 'house-rules'").first();
  const rules = rulesRow ? (JSON.parse(rulesRow.doc).rules || []).map(r => r.text) : [];
  const b = await buildBrief(env, { maxLines: 200 });
  return Response.json({ ideas, need_images: needImg, house_rules: rules, brief: briefText(b, pickLenses(4)) }, { headers: { "cache-control": "no-store" } });
}
