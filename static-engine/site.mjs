// Assembles the "SILT Static Engine" website in web/public from the engine, the specs, the assets and the renders.
// Run after render.mjs:  node site.mjs  then  cd web && node ../../cloudflare/node_modules/wrangler/bin/wrangler.js pages deploy public --project-name silt-static-engine --branch main
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), pub = path.join(here, "web", "public");
const cp = (a, b) => { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.copyFileSync(a, b); };
const rendered = fs.existsSync(path.join(here, "out")) ? fs.readdirSync(path.join(here, "out")).filter(f => f.startsWith("SILT_") && f.endsWith(".png")) : [];
if (rendered.length < 120) { console.error(`Only ${rendered.length} rendered PNGs in out/. Run "npm run render" first, or the site would go live without its statics.`); process.exit(1); }
for (const f of ["engine.js", "statics.js", "library.js"]) cp(path.join(here, f), path.join(pub, f));
const engine = fs.readFileSync(path.join(here, "engine.js"), "utf8");
const used = new Set([...engine.matchAll(/"([a-z_\-0-9]+\.(?:png|jpg))"/g)].map(m => m[1]).concat(["logo_white.png", "logo_dark.png", "mornings-back-2k.jpg", "bottles_combo.jpg", "bottles_mornings.jpg", "bottles_nights.jpg"]));
for (const f of used) if (fs.existsSync(path.join(here, "assets", f))) cp(path.join(here, "assets", f), path.join(pub, "assets", f));
for (const f of fs.readdirSync(path.join(here, "assets", "scenes"))) cp(path.join(here, "assets", "scenes", f), path.join(pub, "assets", "scenes", f));
for (const d of ["png", "thumb"]) { fs.rmSync(path.join(pub, "library", d), { recursive: true, force: true }); for (const f of fs.readdirSync(path.join(here, "library", d))) cp(path.join(here, "library", d, f), path.join(pub, "library", d, f)); }
for (const f of fs.readdirSync(path.join(here, "fonts"))) cp(path.join(here, "fonts", f), path.join(pub, "fonts", f));
for (const d of ["png", "thumb"]) fs.rmSync(path.join(pub, d), { recursive: true, force: true });
for (const f of fs.readdirSync(path.join(here, "out")).filter(f => f.startsWith("SILT_"))) cp(path.join(here, "out", f), path.join(pub, "png", f));
for (const f of fs.readdirSync(path.join(here, "site", "png"))) cp(path.join(here, "site", "png", f), path.join(pub, "thumb", f));
fs.writeFileSync(path.join(pub, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#17245C"/><text x="32" y="44" font-family="Georgia,serif" font-size="34" fill="#EBB858" text-anchor="middle">S</text></svg>`);
fs.writeFileSync(path.join(here, "web", "wrangler.toml"), `name = "silt-static-engine"
pages_build_output_dir = "public"
compatibility_date = "2025-09-01"
# Open site (no login, user's choice 25 Nov 2026). The page sends the person's name as the x-silt-name header.
# Team statics and ideas live in table se_items of the Content Desk database (schema.sql).
[[d1_databases]]
binding = "DB"
database_name = "silt_desk"
database_id = "722c1c48-c0f8-4c54-ae5a-5a8c313274bf"
# Cloudflare Workers AI writes statics from ideas (functions/api/generate.js). RULES_KEY (a Pages secret) guards the house rules.
[ai]
binding = "AI"
`);
// Competitor patterns for the Maker ("copy the skill, not the words"), from the Content Desk's teardown digest.
const dg = JSON.parse(fs.readFileSync(path.resolve(here, "..", "cloudflare", "lib", "teardown-digest.json"), "utf8"));
// Plus hand-written entries for brands without a full teardown yet (build/teardown_extra.json, e.g. Delta State).
const extra = JSON.parse(fs.readFileSync(path.resolve(here, "build", "teardown_extra.json"), "utf8"));
const TD = [...(dg.brands || []), ...extra].map(b => ({ brand: b.brand, pulled: b.pulled || "",
  patterns: (b.patterns || []).map(p => ({ title: p.title, text: String(p.text || "").slice(0, 420) })),
  ideas: (b.ideas_for_silt || []).map(i => ({ product: i.product || "", hook: String(i.hook || "").replace(/[“”]/g, '"').slice(0, 160), format: String(i.format || "").slice(0, 160), outline: String(i.outline || "").slice(0, 320) })) }));
fs.writeFileSync(path.join(pub, "teardowns.json"), JSON.stringify(TD));
fs.writeFileSync(path.join(pub, "teardowns.js"), "// Built by site.mjs from the Content Desk's Ad teardowns (+ build/teardown_extra.json). Do not edit by hand.\nexport const TEARDOWNS = " + JSON.stringify(TD) + ";\n");
console.log("assets:", [...used].join(", "));
console.log("pngs:", fs.readdirSync(path.join(pub, "png")).length, "thumbs:", fs.readdirSync(path.join(pub, "thumb")).length);
