import fs from "node:fs";
const key = (fs.readFileSync("web/RULES_KEY.txt", "utf8").match(/silt-rules-[A-Za-z0-9-]+/) || [""])[0]; if (!key) throw new Error("no key");
const rules = (await (await fetch("https://silt-static-engine.pages.dev/api/rules")).json()).rules;
const r = rules.find(x => x.text.startsWith("OFFICIAL ICONS")); if (!r) throw new Error("no rule");
const text = `OFFICIAL ICONS (team, 26 Nov): icon rows use only the brand's Packaging Emoticons (Drive 1UKgPyL34QgN99f2Fh1XkGSryOw6pmKl6; site /kit/ICONS_Mornings.png, /kit/ICONS_Nights.png). Mornings: bolt = Steady Energy, gut squiggle = Gut Health, capsule = Daily Vitamins. Nights: moon with Z = Deep Sleep, flexed arm = Recovery, meditating person = Stress Relief. Attach the sheet; ChatGPT copies the shapes exactly, one size, no circles, evenly spaced, centred on each label with a clear gap. If redrawn, swap in the real files. Never invent icons.`;
if (text.length > 600) throw new Error("long " + text.length);
const res = await fetch("https://silt-static-engine.pages.dev/api/rules", { method: "POST", headers: { "content-type": "application/json", "x-rules-key": key, "x-silt-name": "Ashutosh" }, body: JSON.stringify({ edit: [{ id: r.id, text }] }) });
const j = await res.json(); console.log(res.status, (j.rules || []).find(x => x.id === r.id)?.text === text ? "icon rule saved in full" : "MISMATCH", text.length);
