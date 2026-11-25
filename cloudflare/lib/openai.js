// OpenAI calls for the content agent. The key lives in the Pages secret OPENAI_API_KEY and never reaches the browser.
// Models are set with optional Pages variables: OPENAI_TEXT_MODEL, OPENAI_IMAGE_MODEL, OPENAI_IMAGE_SIZE, OPENAI_IMAGE_QUALITY.
// AGENT_MOCK=1 (local testing only) returns canned answers instead of calling OpenAI.

export const models = env => ({
  text: env.OPENAI_TEXT_MODEL || "gpt-5.6-sol",
  image: env.OPENAI_IMAGE_MODEL || "gpt-image-2",
  size: env.OPENAI_IMAGE_SIZE || "1088x1920", // 9:16; sizes must be multiples of 16
  quality: env.OPENAI_IMAGE_QUALITY || "high",
});

export class AgentError extends Error {
  constructor(message, status = 502) { super(message); this.status = status; }
}

function key(env) {
  if (!env.OPENAI_API_KEY) throw new AgentError("The OpenAI key isn't set yet. Add OPENAI_API_KEY as a Pages secret (see SETUP.md).", 503);
  return env.OPENAI_API_KEY;
}

async function failure(res) {
  let msg = `OpenAI returned ${res.status}`;
  try { const j = await res.json(); if (j.error?.message) msg += `: ${j.error.message}`; } catch {}
  return new AgentError(msg, res.status === 429 ? 429 : 502);
}

// Chat call that must answer with one JSON object.
export async function chatJSON(env, system, user, mock) {
  if (env.AGENT_MOCK === "1") return mock();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key(env)}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: models(env).text,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  if (!res.ok) throw await failure(res);
  const j = await res.json();
  const text = j.choices?.[0]?.message?.content || "";
  try { return JSON.parse(text); } catch { throw new AgentError("ChatGPT didn't answer in the expected format. Try again."); }
}

// One image, returned as base64 JPEG. With a pack photo it uses the edits endpoint so the real box is used as reference.
export async function image(env, prompt, pack) {
  const m = models(env);
  if (env.AGENT_MOCK === "1") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1088" height="1920"><rect width="100%" height="100%" fill="#C9D5EA"/><text x="80" y="400" font-size="64" font-family="sans-serif" fill="#101E41">Mock static (${pack ? "with pack photo" : "no pack"})</text></svg>`;
    return { b64: btoa(svg), mime: "image/svg+xml" };
  }
  let res;
  if (pack) {
    const form = new FormData();
    form.append("model", m.image);
    form.append("prompt", prompt);
    form.append("size", m.size);
    form.append("quality", m.quality);
    form.append("output_format", "jpeg");
    form.append("output_compression", "82");
    form.append("image[]", new File([await pack.arrayBuffer()], "pack.png", { type: "image/png" }));
    res = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { authorization: `Bearer ${key(env)}` }, body: form });
  } else {
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { authorization: `Bearer ${key(env)}`, "content-type": "application/json" },
      body: JSON.stringify({ model: m.image, prompt, size: m.size, quality: m.quality, output_format: "jpeg", output_compression: 82 }),
    });
  }
  if (!res.ok) throw await failure(res);
  const j = await res.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) throw new AgentError("OpenAI sent no image back. Try again.");
  return { b64, mime: "image/jpeg" };
}
