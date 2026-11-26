// Deploys one of the two sites to the Cloudflare names in site.config.json (or SILT's own names if there is none).
//   node deploy.mjs desk     -> refreshes the teardown digest, then deploys cloudflare/public
//   node deploy.mjs engine   -> builds the Static Engine site (static-engine/site.mjs), then deploys static-engine/web/public
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT, siteConfig, wranglerBin } from "./site-config.mjs";

const which = process.argv[2];
const cfg = siteConfig();
const run = (args, cwd) => execFileSync(process.execPath, args, { cwd, stdio: "inherit" });
if (!fs.existsSync(wranglerBin())) { console.error("Run `npm install` in the cloudflare folder first."); process.exit(1); }

if (which === "desk") {
  const dir = path.join(ROOT, "cloudflare");
  run(["scripts/teardown-digest.mjs", "--store"], dir);
  run([wranglerBin(), "pages", "deploy", "public", "--project-name", cfg.deskProject, "--branch", "main"], dir);
  console.log(`\nContent Desk: https://${cfg.deskProject}.pages.dev`);
} else if (which === "engine") {
  const dir = path.join(ROOT, "static-engine");
  run(["site.mjs"], dir);
  run([wranglerBin(), "pages", "deploy", "public", "--project-name", cfg.engineProject, "--branch", "main", "--commit-dirty=true"], path.join(dir, "web"));
  console.log(`\nStatic Engine: https://${cfg.engineProject}.pages.dev`);
} else {
  console.error("Usage: node deploy.mjs desk | engine");
  process.exit(2);
}
