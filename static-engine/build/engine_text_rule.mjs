import fs from "node:fs";
const key = (fs.readFileSync("web/RULES_KEY.txt", "utf8").match(/silt-rules-[A-Za-z0-9-]+/) || [""])[0]; if (!key) throw new Error("no key");
const text = `THE ENGINE WRITES THE WORDS (team, 26 Nov, ChatGPT text looks AI): ChatGPT makes only the clean scene plate: no words, numbers, logo, icons, price, box or stick (calm empty top 30% and bottom 40%). The engine then stamps everything brand: headline in Cormorant italic with the key words bold in the accent colour, support line and labels in Jost, the official icons, the price pill, the URL, and the real pack files (box + stick). Fixed spacing, inside the red lines, same in every size.`;
if (text.length > 600) throw new Error("long " + text.length);
const r = await fetch("https://silt-static-engine.pages.dev/api/rules", { method: "POST", headers: { "content-type": "application/json", "x-rules-key": key, "x-silt-name": "Ashutosh" }, body: JSON.stringify({ add: text }) });
const j = await r.json(); console.log(r.status, (j.rules || []).length, "rules", (j.rules || []).at(-1)?.text === text ? "saved in full" : "MISMATCH", text.length);
