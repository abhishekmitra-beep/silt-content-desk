// Generates a new team password, stores it (and a fresh cookie-signing key) as Cloudflare Pages secrets,
// and writes the password to TEAM_PASSWORD.txt next to this folder. It never prints the password.
// Run again any time to change the password: everyone gets signed out and needs the new one.
//   node scripts/set-password.mjs                      (generates a strong password)
//   NEW_DESK_PASSWORD='your-password' node scripts/set-password.mjs   (uses your own, 8+ characters)
import { execFileSync } from "node:child_process";
import { randomBytes, randomInt } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bin = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
import { siteConfig } from "../../site-config.mjs";
const PROJECT = siteConfig().deskProject;

// 4 groups of 4 from an alphabet without look-alike characters: about 79 bits.
const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
const group = () => Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join("");
// Use NEW_DESK_PASSWORD if given (your own choice, 8+ characters), otherwise generate a strong one.
const chosen = process.env.NEW_DESK_PASSWORD;
if (chosen !== undefined && chosen.length < 8) throw new Error("Password must be at least 8 characters.");
const password = chosen || `silt-${group()}-${group()}-${group()}-${group()}`;
const sessionSecret = randomBytes(48).toString("base64url");

function putSecret(name, value) {
  execFileSync(process.execPath, [bin, "pages", "secret", "put", name, "--project-name", PROJECT], {
    cwd: root, input: value, encoding: "utf8", stdio: ["pipe", "ignore", "pipe"],
  });
}

putSecret("SESSION_SECRET", sessionSecret);
putSecret("DESK_PASSWORD", password);

const out = path.join(root, "TEAM_PASSWORD.txt");
fs.writeFileSync(out, [
  "SILT Content Desk team password",
  `Site: https://${PROJECT}.pages.dev`,
  "",
  password,
  "",
  `Set ${new Date().toISOString().slice(0, 10)}. Share it only with the review team (not in public channels).`,
  "To change it: cd C:\\Users\\ASHUTOSH\\SILT_Content_Desk\\cloudflare, then run: node scripts/set-password.mjs, then: npm run deploy",
  "",
].join("\r\n"), "utf8");
console.log(`Secrets stored on Cloudflare. Password saved to ${out}`);
