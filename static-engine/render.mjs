// Renders every static in every size to PNG with headless Chrome, then checks the copy.
//   node render.mjs                 -> all 30 statics x 3 sizes into out/
//   node render.mjs T01 B05         -> only those ids
//   node render.mjs --sizes 4x5     -> only that size
// Also writes site/png/*.jpg previews + site/statics.json for the website.
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { render, fileName, SIZES, checkCopy } from "./engine.js";
import { STATICS } from "./statics.js";
import { CHROME } from "./chrome.mjs";

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const sizeArg = args.includes("--sizes") ? args[args.indexOf("--sizes") + 1].split(",") : Object.keys(SIZES);
const ids = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--sizes");
const list = STATICS.filter(s => !ids.length || ids.includes(s.id));

// ---- copy checks (rules live in engine.js) ----
const problems = list.flatMap(s => checkCopy(s).map(p => `${s.id}: ${p}`));
if (problems.length) { console.error("COPY CHECK FAILED:\n" + problems.join("\n")); process.exit(1); }
console.log(`copy check ok for ${list.length} statics`);

// JPG thumbnail: ffmpeg if installed, else macOS sips.
async function jpg(src, dst) {
  try { await run("ffmpeg", ["-v", "error", "-y", "-i", src, "-q:v", "3", dst]); }
  catch { await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "85", src, "--out", dst]); }
}

// ---- render ----
const build = path.join(here, "build"), out = path.join(here, "out"), site = path.join(here, "site");
for (const d of [build, out, path.join(site, "png")]) fs.mkdirSync(d, { recursive: true });
const jobs = [];
for (const s of list) for (const z of sizeArg) jobs.push({ s, z });
let done = 0;
async function one({ s, z }) {
  const name = fileName(s, z), html = path.join(build, name + ".html"), png = path.join(out, name + ".png");
  fs.writeFileSync(html, render(s, z, "../"));
  const { w, h } = SIZES[z];
  await run(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--default-background-color=00000000",
    `--window-size=${w},${h}`, "--virtual-time-budget=3000", `--screenshot=${png}`, pathToFileURL(html).href], { timeout: 60000 });
  // light JPG copy for the website
  await jpg(png, path.join(site, "png", name + ".jpg"));
  done++; if (done % 10 === 0 || done === jobs.length) console.log(`${done}/${jobs.length}`);
}
const POOL = 4;
for (let i = 0; i < jobs.length; i += POOL) await Promise.all(jobs.slice(i, i + POOL).map(one));
fs.writeFileSync(path.join(site, "statics.json"), JSON.stringify(STATICS.map(s => ({ ...s, files: Object.fromEntries(Object.keys(SIZES).map(z => [z, fileName(s, z)])) })), null, 1));
console.log(`rendered ${jobs.length} files into ${out}`);
