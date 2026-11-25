// POST /api/agent/items/<id>/image {note?} -> (API mode only) makes a new image with OpenAI, keeping earlier versions.
import { makeStaticImage, agentMode, json, fail } from "../../../../../lib/agent.js";

export async function onRequestPost({ request, env, params }) {
  if (agentMode(env) !== "api") return json({ error: "This Desk makes images in ChatGPT Plus. Copy the prompt, make the image in ChatGPT, then upload it." }, 400);
  const id = String(params.id || "");
  if (!/^a-[a-z0-9-]{3,40}$/.test(id)) return json({ error: "Bad id" }, 400);
  let b = {};
  try { b = await request.json(); } catch {}
  try { return json(await makeStaticImage(env, id, b.note, new URL(request.url).origin)); } catch (e) { return fail(e); }
}
