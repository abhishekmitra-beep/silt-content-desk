// Contact sheet of every 4:5 static: out/_contact_sheet_4x5.png
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process"; import { pathToFileURL, fileURLToPath } from "node:url";
import { STATICS } from "./statics.js"; import { CHROME } from "./chrome.mjs"; import { fileName } from "./engine.js";
const here = path.dirname(fileURLToPath(import.meta.url));
const size = process.argv[2] || "4x5", cols = 6, w = 300, h = size === "4x5" ? 375 : size === "1x1" ? 300 : 533;
const cells = STATICS.map(s => `<figure><img src="${pathToFileURL(path.join(here, "out", fileName(s, size) + ".png")).href}"><figcaption>${s.id} · ${s.funnel} · ${s.concept}</figcaption></figure>`).join("");
const rows = Math.ceil(STATICS.length / cols), W = cols * (w + 12) + 12, H = rows * (h + 40) + 12;
const html = path.join(here, "build", "_contact.html");
fs.writeFileSync(html, `<!doctype html><style>body{margin:0;background:#333;font:13px sans-serif;color:#eee}div{display:grid;grid-template-columns:repeat(${cols},${w}px);gap:12px;padding:12px}figure{margin:0}img{width:${w}px;height:${h}px;display:block}figcaption{padding:4px 0}</style><div>${cells}</div>`);
const out = path.join(here, "out", `_contact_sheet_${size}.png`);
execFileSync(CHROME, ["--headless=new", "--hide-scrollbars", `--window-size=${W},${H}`, "--virtual-time-budget=4000", `--screenshot=${out}`, pathToFileURL(html).href]);
console.log(out);
