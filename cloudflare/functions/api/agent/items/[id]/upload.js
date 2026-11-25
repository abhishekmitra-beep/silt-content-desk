// POST /api/agent/items/<id>/upload {b64, mime, note?} -> saves an image made in ChatGPT Plus as a new version of the static.
// The browser shrinks it to a 1080 x 1920 JPEG first, so it fits the database.
import { uploadStaticImage, json, fail } from "../../../../../lib/agent.js";

export async function onRequestPost({ request, env, params, data }) {
  const id = String(params.id || "");
  if (!/^a-[a-z0-9-]{3,40}$/.test(id)) return json({ error: "Bad id" }, 400);
  let b;
  try { b = await request.json(); } catch { return json({ error: "Bad upload" }, 400); }
  try { return json(await uploadStaticImage(env, id, b, data.email)); } catch (e) { return fail(e); }
}
