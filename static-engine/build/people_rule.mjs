// Team, 26 Nov: "make some women centric (25% of our buyers are women)". Replaces the kit's men-only PEOPLE rule.
import fs from "node:fs";
const key = (fs.readFileSync("web/RULES_KEY.txt", "utf8").match(/silt-rules-[A-Za-z0-9-]+/) || [""])[0]; if (!key) throw new Error("no key");
const rules = (await (await fetch("https://silt-static-engine.pages.dev/api/rules")).json()).rules;
const r = rules.find(x => x.text.startsWith("PEOPLE:")); if (!r) throw new Error("no people rule");
const text = `PEOPLE (team, 26 Nov, replaces the kit's men-only rule): no people unless the idea needs one. 25% of SILT buyers are women, so about 1 in 4 persona statics features a woman, the rest Indian men. Real-looking Indian adults over 25, real photographs: skin pores, fine lines, real hair and fabric creases, natural light, never glossy or AI-looking. Women are working professionals, mothers, doctors, founders, teachers, never stereotyped or sexualised. Deep sleep = completely expressionless face, no smile. Seen from behind or in profile is often the most premium.`;
if (text.length > 600) throw new Error("long " + text.length);
const res = await fetch("https://silt-static-engine.pages.dev/api/rules", { method: "POST", headers: { "content-type": "application/json", "x-rules-key": key, "x-silt-name": "Ashutosh" }, body: JSON.stringify({ edit: [{ id: r.id, text }] }) });
const j = await res.json(); console.log(res.status, (j.rules || []).find(x => x.id === r.id)?.text === text ? "people rule updated" : "MISMATCH", text.length);
