// Team, 26 Nov: add the SILT Buyer Intelligence findings (282 buyers) to the statics. Qualitative only: the site and repo are public,
// so no spend / ROAS / CAC figures and no individual buyer quotes go in.
import fs from "node:fs";
const key = (fs.readFileSync("web/RULES_KEY.txt", "utf8").match(/silt-rules-[A-Za-z0-9-]+/) || [""])[0]; if (!key) throw new Error("no key");
const R = [
`BUYER INTEL 1, WHO (282 real buyers, launch to 26 Nov): the core buyer is a wired-and-tired metro professional, 35 to 54, in Bangalore, Mumbai or NCR, tech or corporate job; about 70% men, 25 to 30% women (women 25-34 and 45-64 are the cheapest to win and lean Mornings and gut). Do NOT aim statics at men 25-34 (they click, rarely buy). Set scenes in weekday life: desk, laptop, calls, commute, late evening. Most orders land 6 to 10 pm, so evening and night moments land.`,
`BUYER INTEL 2, WHAT SELLS: (1) REPLACES THE STACK is the top reason and converts best: many bottles or pills become ONE stick. (2) Proof: every dose printed, evidence-backed, no melatonin, not habit-forming. (3) Goals in order: sleep, energy, gut, then recovery. (4) Price is the top objection, so never hide it: Rs. 900 for 15 sticks, Combo is what two-thirds buy, COMBO10. (5) Statics have sold with the stack idea, the crossed-out idea and a sleep mask. Never quote a buyer, never invent proof.`
];
for (const t of R) { if (t.length > 600) throw new Error("long " + t.length);
  const res = await fetch("https://silt-static-engine.pages.dev/api/rules", { method: "POST", headers: { "content-type": "application/json", "x-rules-key": key, "x-silt-name": "Ashutosh" }, body: JSON.stringify({ add: t }) });
  const j = await res.json(); console.log(res.status, t.slice(0, 24), t.length, (j.rules || []).some(r => r.text === t) ? "ok" : "MISMATCH"); }
