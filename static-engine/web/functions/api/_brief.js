// What the engine already has, so every new static (from the site's AI or a team member's own Claude / ChatGPT)
// builds on it instead of repeating it: what the team approved (works), what was rejected (avoid), every line that
// already exists (don't repeat), which formats are overused or barely used, and unexplored angles to push into.
import { STATICS } from "../../public/statics.js";
import { LIBRARY } from "../../public/library.js";
import { TEMPLATES } from "../../public/engine.js";

const line = d => String(d.headline || d.problem || d.question || d.top || d.title || d.text || d.quote || "").replace(/\*/g, "").replace(/\s+/g, " ").trim().slice(0, 110);

// Angles to explore. Each generation is pushed into a few of these that the engine hasn't covered much.
export const LENSES = [   // angles in the SILT Creative Kit v2 way: one photographable hero object that acts out the message
  "bucket benefit: one sculptural hero object that acts out deeper nights or steadier mornings",
  "bucket ingredient: one hero built from a real ingredient (glycine, magnesium, KSM-66, L-theanine, PHGG fibre, amla, fennel)",
  "bucket proof: the Nights lab facts as clean typeset information, like a premium spec sheet",
  "bucket price: Rs. 900 for 15 sticks against what it replaces",
  "bucket replace the stack: ten bottles (Mornings) or four bottles (Nights), or one stick",
  "bucket restock: down to the last stick",
  "a work object at rest as the hero: a closed laptop, a silenced phone face down, a switched-off desk lamp",
  "a time object as the hero: an alarm clock, a calendar page, an hourglass",
  "a new metaphor as a real object: the ritual as a calendar invite, a standup, a cheat code or an out-of-office",
  "a quiet corporate wink (EOD, OOO, circle back, bandwidth) as the headline, the hero kept serene",
  "an Indian cultural moment shot as a still life: Diwali diya, wedding-season mithai box, monsoon window, IPL night",
  "a man over 30 seen from behind or in profile, only if the idea truly needs a person"
];

// What each rejection reason teaches (the tags on the Reject window).
export const REJECT_TAGS = {
  "Words in Meta red zones": "Keep every word, the price and the pack inside the playbook text boxes (4:5 y 135 to 1215, Reels above 1248).",
  "Too much text": "Cut to the headline, the solution, the price and the CTA. Less is more.",
  "Weak hook": "Open on a sharper, specific moment someone would recognise in one second.",
  "Wrong product or problem": "Match the problem to the product: Mornings = gut, 3 PM slump, vitamins; Nights = sleep, 3 AM, waking unrecovered.",
  "Repeats an existing static": "New situation, new line, new format. Check the list of what exists.",
  "Pack wrong or hidden": "The real pack, large, lower right, never covered, never redrawn.",
  "Not Indian / wrong person": "Only when needed: a real-looking Indian man over 30, never women; a real photograph, not AI-looking.",
  "Spelling or wrong words": "Print the exact words, spelled right; check every word before saving.",
  "Off-brand look": "Follow the kit look: premium, clean, calm, one idea, about 40% empty.",
  "Claim or fact problem": "Only facts, doses and prices from the brief and the pack; no promises."
};
export async function lessons(env) {
  const rows = (await env.DB.prepare("SELECT id, kind, doc, updated_at FROM se_items WHERE status = 'rejected' AND doc LIKE '%reject_%' ORDER BY updated_at DESC LIMIT 200").all()).results;
  const items = rows.map(r => ({ ...r, doc: JSON.parse(r.doc) })).filter(r => !r.doc.deleted && (r.doc.reject_reason || (r.doc.reject_tags || []).length));
  const counts = {}; for (const r of items) for (const t of r.doc.reject_tags || []) counts[t] = (counts[t] || 0) + 1;
  const rules = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} (${n}x): ${REJECT_TAGS[t] || ""}`.trim());
  const recent = items.slice(0, 25).map(r => `[${r.doc.t || r.kind}/${r.doc.product || ""}] "${line(r.doc) || r.doc.title || r.doc.id}" rejected: ${[...(r.doc.reject_tags || []), r.doc.reject_reason].filter(Boolean).join("; ")}`);
  return { total: items.length, rules, recent };
}
export async function buildBrief(env, { maxLines = 90 } = {}) {
  const { results } = await env.DB.prepare("SELECT id, kind, doc, status FROM se_items WHERE kind IN ('static', 'override', 'upload', 'decision') AND status != 'archived' ORDER BY updated_at DESC LIMIT 1500").all();
  const items = results.map(r => ({ ...r, doc: JSON.parse(r.doc) }));
  const ideaRows = (await env.DB.prepare("SELECT doc FROM se_items WHERE kind = 'idea' AND status != 'archived' ORDER BY updated_at DESC LIMIT 60").all()).results;
  const ideas = [...new Set(ideaRows.map(r => { try { const d = JSON.parse(r.doc); return String(d.text || d.title || "").trim(); } catch { return ""; } }).filter(Boolean))].slice(0, 40);
  const decided = Object.fromEntries(items.filter(i => i.kind === "decision").map(i => [i.doc.id, i.status]));
  const all = [];
  // Newest first: what the team and the AI made lately matters most for "don't repeat".
  for (const i of items.filter(i => i.kind !== "decision")) all.push({ src: i.kind, t: i.doc.t || "image", funnel: i.doc.funnel, product: i.doc.product, line: line(i.doc), status: i.status });
  // The old built-in and Library sets are gone (team reset, 26 Nov): only what is in the database counts as existing.
  const good = all.filter(x => x.status === "approved" || x.status === "ai_approved");
  const bad = all.filter(x => x.status === "rejected" || x.status === "ai_rejected");
  const seen = new Set(), existing = [];
  for (const x of all) { const k = x.line.toLowerCase(); if (x.line && !seen.has(k)) { seen.add(k); existing.push(x.line); } }
  const usage = Object.fromEntries(TEMPLATES.map(t => [t, 0]));
  for (const x of all) if (x.t in usage) usage[x.t]++;
  const byUse = Object.entries(usage).sort((a, b) => a[1] - b[1]);
  const women = all.filter(x => /\b(she|her|woman|women|mother|mom|mummy|girl|priya|ananya)\b/i.test(x.line)).length;
  let les = { total: 0, rules: [], recent: [] }; try { les = await lessons(env); } catch {}
  return {
    lessons: les,
    total: all.length,
    approved: good.slice(0, 25).map(x => `[${x.funnel}/${x.product}/${x.t}${x.status === "ai_approved" ? ", AI-approved" : ""}] ${x.line}`),
    rejected: bad.slice(0, 20).map(x => `[${x.funnel}/${x.t}${x.status === "ai_rejected" ? ", AI-rejected" : ""}] ${x.line}`),
    existing: existing.slice(0, maxLines),
    all_lines: existing,
    least_used_formats: byUse.slice(0, 6).map(([t, n]) => `${t} (${n})`),
    most_used_formats: byUse.slice(-4).reverse().map(([t, n]) => `${t} (${n})`),
    ideas,
    women_share: all.length ? Math.round(100 * women / all.length) + "%" : "0%",
    lenses: LENSES
  };
}

// Near-copy check: two lines that share most of their meaningful words are the same idea.
const STOP = new Set("the a an and or of to in on for is it you your with ek ka ki ke ko se hai ho bas aur me main".split(" "));
export const words = t => new Set(String(t || "").toLowerCase().replace(/\*/g, "").replace(/[^a-z0-9ऀ-ॿ ]+/g, " ").split(/\s+/).filter(w => w.length > 1 && !STOP.has(w)).map(w => w.length > 3 ? w.replace(/s$/, "") : w));
// Moments the AI keeps falling back on. One static per moment in a batch, so a batch can't be four "3 PM slump"s.
export const TOPICS = {
  "the 3 PM slump": /\b3\s*(pm|baje)\b|3 o.?clock|afternoon slump|post.?lunch/i,
  "1-2 AM awake": /\b(1|2|3)\s*am\b|\b(1|2)\s*baje raat|midnight|raat ke (1|2|do|ek)/i,
  "the supplement jars / bottles": /supplement|\bjars?\b|bottles?|\bpills?\b|tablets?/i,
  "the snooze button / alarm": /snooze|alarm/i,
  "phone scrolling in bed": /scroll|phone|reels?\b|sleep mode/i,
  "chai / coffee": /\bchai\b|coffee/i,
  "doses on the pack / label": /\bdoses?\b|label|pack pe|blend/i,
  "melatonin": /melatonin/i,
  "the discount / COMBO10": /\d+\s*%|combo10|discount/i
};
export const topicsOf = t => Object.keys(TOPICS).filter(k => TOPICS[k].test(String(t || "")));
export function similar(a, b) {
  const A = words(a), B = words(b); if (!A.size || !B.size) return false;
  let n = 0; for (const w of A) if (B.has(w)) n++;
  return n / Math.max(A.size, B.size) >= 0.6 && n >= 2;   // most of BOTH lines is the same words
}
export { line as headLine };

export function pickLenses(n = 3) {
  const a = [...LENSES]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

// The text block the AI reads before it writes.
export function briefText(b, lenses) {
  const L = b.lessons && b.lessons.total ? `LESSONS FROM TEAM REJECTIONS (${b.lessons.total} so far). Test every static against these before you save it; if it repeats one, rewrite it:
${b.lessons.rules.map(r => "- " + r).join("\n")}
Recent rejections and why:
${b.lessons.recent.map(r => "  " + r).join("\n")}

` : "";
  return L + `WHAT THE ENGINE ALREADY HAS (${b.total} statics). Build on it, never repeat it:
- WORKS (approved, keep the spirit, find NEW situations): ${b.approved.length ? "\n  " + b.approved.join("\n  ") : "none yet"}
- AVOID (rejected, don't make anything like these): ${b.rejected.length ? "\n  " + b.rejected.join("\n  ") : "none yet"}
- ALREADY SAID (do not reuse these lines or ideas): ${b.existing.join(" | ")}
- IDEAS ALREADY EXPLORED (go somewhere new; you may build on one, never redo it): ${b.ideas.length ? b.ideas.join(" | ") : "none yet"}
- Follow the house rules (the SILT Creative Kit v2): one idea, one photographable hero, premium still life, 9:16. People only when needed: real-looking Indian men over 30, never women.
EXPLORE NEW GROUND in this batch. Each static should take one of these angles (spread them):
${lenses.map(l => "- " + l).join("\n")}
Every static must be a genuinely new idea: a new situation, a new joke, a new line. No near-copies of anything above.`;
}
