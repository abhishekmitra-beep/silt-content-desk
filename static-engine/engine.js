// SILT static engine: one template per swipe-file format, three sizes, real product cut-outs only.
// Shared by the website (/static-engine/, renders live in the browser) and render.mjs (Chrome headless -> PNG).
// render(spec, sizeId, base) returns a complete HTML document for one static.

export const SIZES = {
  "4x5": { w: 1080, h: 1350, pad: [135, 72, 135, 72], fs: 10, pack: 400, label: "Feed", ratio: "4x5" },
  "1x1": { w: 1080, h: 1080, pad: [65, 68, 65, 68], fs: 8.6, pack: 330, label: "Square", ratio: "1x1" },
  // Placement playbook 25 Nov: 4:5 text y 135-1215, 1:1 inside 65 px, 9:16 built to the Reels box y 269-1248 (also safe in Stories) (Meta covers the top 269 px with the
  // profile row, and the bottom 269 px in Stories / 672 px in Reels); the lower part stays plain.
  "9x16": { w: 1080, h: 1920, pad: [275, 80, 680, 80], fs: 7.4, pack: 330, label: "Stories", ratio: "9x16" }
};

export const THEMES = {
  am: { bg: "#FBF4E6", ink: "#2A1E14", sub: "#6E5B47", acc: "#E2801A", acc2: "#F4B84A", card: "#FFFFFF", line: "#EAD9BD", logo: "logo_dark.png" },
  pm: { bg: "#16245E", ink: "#FFFFFF", sub: "#C7D4F4", acc: "#9FC0FF", acc2: "#F1E66A", card: "#22357F", line: "#33479A", logo: "logo_white.png" },
  combo: { bg: "#F4F1EA", ink: "#17245C", sub: "#525B76", acc: "#E2801A", acc2: "#3D5BD4", card: "#FFFFFF", line: "#DEDAD0", logo: "logo_dark.png" },
  navy: { bg: "#111B3D", ink: "#F6F1E7", sub: "#B9C3DD", acc: "#EBB858", acc2: "#9FC0FF", card: "#1B2858", line: "#2B3A6E", logo: "logo_white.png" }
};

// Relatable scene photos (clean plates, no text) for statics that are not product-led. "pos" = where the words sit.
// ONLY scenes whose people read as Indian (user, 25 Nov: "Use indian characters"). Removed: WA0020, WA0016, WA0032, WA0019.
export const SCENES = {
  // Added 25 Nov from Abhishek ("Claude statics 25 Nov" / SILT_scene_photos_6.zip)
  "tired-3pm":     { file: "a_tired3pm.jpg", pos: "bottom", mood: "3 PM slump at home, rubbing his neck with a mug of chai, daytime" },
  "ceiling-2am":   { file: "a_ceiling.jpg", pos: "bottom", mood: "2 AM on the clock, lying awake staring at the ceiling" },
  "mug-calm":      { file: "mug.jpg", pos: "bottom", mood: "calm in bed at night with a warm mug, laptop closed (the wind-down ritual)" },
  "jar-january":   { file: "x_jar.jpg", pos: "top", mood: "holding up a forgotten supplement jar from the kitchen shelf, sheepish grin" },
  "founder-2am":   { file: "f_bed2am.jpg", pos: "bottom", mood: "the founder awake at 2 AM in bed, face lit by the phone" },
  "founder-3pm":   { file: "f_yawn.jpg", pos: "bottom", mood: "the founder yawning at his desk at 3 PM, daytime" },
  "night-phone":   { file: "WA0012.jpg", pos: "top", mood: "doomscrolling in bed at night, phone glow" },
  "pillow-office": { file: "WA0033.jpg", pos: "top", mood: "a tiny office desk working on a pillow at night (work follows you to bed)" },
  "bear":          { file: "WA0026.jpg", pos: "top", mood: "curled up under a heavy blanket like a hibernating bear" },
  "awake-eyes":    { file: "WA0029.jpg", pos: "bottom", mood: "lying awake staring, light across the eyes" },
  "peek-blanket":  { file: "WA0035.jpg", pos: "bottom", mood: "eyes peeking out from the blanket, can't sleep (black and white)" },
  "eye-bw":        { file: "WA0022.jpg", pos: "bottom", mood: "one eye open under the sheets, black and white" },
  "pillow-hug":    { file: "WA0014.jpg", pos: "bottom", mood: "hugging a tall stack of pillows, funny" },
  "ugly-sleep":    { file: "WA0025.jpg", pos: "bottom", mood: "deep sleep, mouth open, the best kind" },
  "onesie":        { file: "fe9df54c.jpg", pos: "top", mood: "grown man asleep in a baby onesie, funny" },
  "cloud":         { file: "WA0028.jpg", pos: "top", mood: "resting on clouds, head massage, calm" },
  "morning-light": { file: "WA0024.jpg", pos: "top", mood: "arm over the face in morning light, not ready for the day" },
  "deep-dark":     { file: "WA0011.jpg", pos: "top", mood: "deep sleep in a dark bedroom with a lamp" },
  "outdoors":      { file: "WA0017.jpg", pos: "top", mood: "peaceful nap on a pillow outdoors, greenery" },
  "eye-mask":      { file: "WA0018.jpg", pos: "top", mood: "sleeping with an eye mask, white sheets" },
  "brain-glow":    { file: "WA0010.jpg", pos: "top", mood: "sleeping with a glowing brain and heart (body repairing)" },
  "line-drawn":    { file: "WA0036.jpg", pos: "top", mood: "line drawing of a man asleep" },
  "blinds":        { file: "WA0037.jpg", pos: "top", mood: "sleeping by dark blinds, calm night" },
  "curled-night":  { file: "WA0023.jpg", pos: "top", mood: "curled up asleep, moon in the window" },
  "peek-blinds":   { file: "WA0015.jpg", pos: "bottom", mood: "someone peeking through blinds at a sleeper" },
  "purple-top":    { file: "WA0030.jpg", pos: "top", mood: "top-down sleeper in purple light" },
  "clay-tired":    { file: "WA0027.jpg", pos: "bottom", mood: "clay figure sitting tired in bed, zombie-like" }
};
const scene = (A, k) => A + "scenes/" + (SCENES[k] || SCENES["night-phone"]).file;
// A photo made for this static (e.g. by ChatGPT from the static's photo brief) and uploaded to the site replaces the
// library scene photo. Only the site's own file URLs are used.
const okPhoto = p => typeof p === "string" && /^\/api\/file\/F[0-9a-z]+$/.test(p);
const photoOr = (s, A, k, which = "photo") => okPhoto(s[which]) ? s[which] : scene(A, k);

export const PRODUCTS = {
  mornings: { box: "mornings_box_cut.png", boxstick: "mornings_boxstick_cut.png", stick: "mornings_stick_cut.png" },
  nights: { box: "nights_box_cut.png", boxstick: "nights_boxstick_cut.png", stick: "nights_stick_cut.png" }
};

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// **bold** and *accent* inside copy
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, '<em class="acc">$1</em>').replace(/\n/g, "<br>");

// PRODUCT PLACEMENT (Abhishek, 25 Nov): the pack is the hero. Closed box + 1 stick together (the *_boxstick cut-outs),
// about a third of the image height, lower right on a soft contact shadow; never a lone stick or a corner sticker.
// Combo shows both packs, Mornings left and Nights right. Only shot: "none" leaves it out (the back-of-pack panel).
const PLINE = { mornings: 'SILT Mornings · <b>DAILY</b> energy and nutrition', nights: 'SILT Nights · <b>NIGHTLY</b> sleep and recovery', combo: 'SILT Combo · <b>DAILY</b> energy, <b>NIGHTLY</b> sleep' };
const bottles = (A, p) => `<div class="psimg bottles" style="background-image:url('${A}bottles_${p === "mornings" || p === "nights" ? p : "combo"}.jpg')"></div>`;
function packHTML(product, A, cls = "") {
  const img = p => `<img src="${A}${PRODUCTS[p].boxstick}" alt="SILT ${p[0].toUpperCase() + p.slice(1)} box and stick">`;
  return product === "combo" ? `<div class="pack duo ${cls}">${img("mornings")}${img("nights")}</div>` : `<div class="pack ${cls}">${img(product === "nights" ? "nights" : "mornings")}</div>`;
}
function productImgs(spec, A) {
  if (spec.shot === "none") return "";
  if ((spec.shot === "stick" || spec.shot === "sticks") && !["scene", "statement", "offer", "review"].includes(spec.t)) { const st = p => `<img src="${A}${PRODUCTS[p].stick}" alt="SILT ${p} stick">`; return spec.product === "combo" ? `<div class="pack duo sticks">${st("mornings")}${st("nights")}</div>` : `<div class="pack sticks">${st(spec.product === "nights" ? "nights" : "mornings")}</div>`; }
  return packHTML(spec.product, A);
}

const T = {
  // 01 The bad news ad
  newscard: s => `<div class="news card"><div class="newsbar"><span class="tag">BAD NEWS</span><span class="date">${esc(s.dateline || "")}</span></div>
    <h1>${rich(s.headline)}</h1><div class="goodbar"><span class="tag gnews">GOOD NEWS</span></div><p class="good">${rich(s.good)}</p></div>`,
  // 05 The search result ad
  search: s => `<div class="search"><div class="bar"><span class="glass"></span>${esc(s.query)}</div>
    <div class="result card"><div class="url">siltnutrition.com › ${esc(s.slug)}</div><h2>${rich(s.title)}</h2><p>${rich(s.snippet)}</p></div></div>
    ${s.headline ? `<h1 class="mid">${rich(s.headline)}</h1>` : ""}`,
  // 06 The Notes app ad
  notes: s => `<div class="notes card"><div class="notesbar"><span>‹ Notes</span><span>Done</span></div>
    <h2>${rich(s.title)}</h2><ol>${s.items.map(i => `<li>${rich(i)}</li>`).join("")}</ol>${s.last ? `<p class="last">${rich(s.last)}</p>` : ""}</div>`,
  // 07 The tweet ad
  tweet: s => `<div class="tweet card"><div class="who"><span class="av"><img src="${s._A}logo_white.png" alt=""></span><div><b>SILT Nutrition</b><span>Brand account</span></div></div>
    <p class="tw">${rich(s.text)}</p><div class="time">${esc(s.time || "8:02 AM")}</div></div>`,
  // 08 The family WhatsApp forward
  forward: s => `<div class="fwd"><div class="fwdlabel">↪ Forwarded many times</div><div class="flowers">🌸🌼🌺🌼🌸</div>
    <div class="glitter">${esc(s.greeting || "Good Morning")}</div><div class="bless">${rich(s.bless)}</div>
    <div class="offerbox">${rich(s.offer)}</div><div class="fwdend">${rich(s.sign)}</div></div>`,
  // 09 The out-of-office email
  email: s => `<div class="email card"><div class="row"><span>FROM</span><b>${esc(s.from)}</b></div><div class="row"><span>SUBJECT</span><b>${esc(s.subject)}</b></div>
    <div class="body">${s.lines.map(l => `<p>${rich(l)}</p>`).join("")}</div><div class="sig">${rich(s.sig)}</div></div>`,
  // Calendar block (ritual positioning)
  calendar: s => `<h1 class="top">${rich(s.headline)}</h1><div class="cal card">${s.slots.map(x => `<div class="slot ${x.me ? "me" : ""}"><span class="t">${esc(x.t)}</span><span class="ev">${rich(x.ev)}</span></div>`).join("")}</div>`,
  // EOD report checklist (ticks, never clickable-looking boxes)
  checklist: s => `<div class="eod card"><div class="eodtitle">${esc(s.title)}</div>${s.items.map(i => `<div class="ck ${i.done ? "" : "todo"}"><span class="mk">${i.done ? "✓" : "→"}</span>${rich(i.t)}</div>`).join("")}</div>${s.headline ? `<h1 class="mid">${rich(s.headline)}</h1>` : ""}`,
  // 04 The chat (clearly a joke between you and yourself, not a customer testimonial)
  chat: s => `<div class="chat card"><div class="chathead">${esc(s.with)}</div>${s.msgs.map(m => `<div class="bub ${m.me ? "me" : ""}">${rich(m.t)}</div>`).join("")}</div>${s.headline ? `<h1 class="mid">${rich(s.headline)}</h1>` : ""}`,
  // Three-part explainer (educational)
  parts: s => `<h1 class="top">${rich(s.headline)}</h1><div class="parts">${s.items.map((i, n) => `<div class="part card"><span class="n">${n + 1}</span><div><b>${rich(i.h)}</b><span>${rich(i.d)}</span></div></div>`).join("")}</div>`,
  // 24 The mistakes ad
  mistakes: s => `<h1 class="top">${rich(s.headline)}</h1><div class="mist">${s.items.map((i, n) => `<div class="mi"><span class="n">0${n + 1}</span><span>${rich(i)}</span></div>`).join("")}</div>${s.turn ? `<p class="turn">${rich(s.turn)}</p>` : ""}`,
  // 27 Expectation vs reality, flipped / before-after of the routine
  beforeafter: s => `<h1 class="top">${rich(s.headline)}</h1><div class="ba"><div class="half before"><span class="lab">${esc(s.left || "BEFORE")}</span><div class="bimg" style="background-image:url('${s._A}bottles_${s.product === "mornings" || s.product === "nights" ? s.product : "combo"}.jpg')"></div><p>${rich(s.before)}</p></div>
    <div class="half after"><span class="lab">${esc(s.right || "AFTER")}</span>${packHTML(s.product, s._A, "inpanel")}<p>${rich(s.after)}</p></div></div>`,
  // Big statement (pattern interrupt)
  statement: s => `<div class="statement">${s.kicker ? `<div class="kick">${esc(s.kicker)}</div>` : ""}<h1 class="huge">${rich(s.headline)}</h1>${s.sub ? `<p class="lede">${rich(s.sub)}</p>` : ""}</div>`,
  // 26 Us vs them
  vs: s => `<h1 class="top">${rich(s.headline)}</h1><table class="vs card"><thead><tr><th></th><th>${esc(s.us)}</th><th>${esc(s.them)}</th></tr></thead><tbody>${s.rows.map(r => `<tr><td>${rich(r[0])}</td><td class="${r[1] ? "y" : "x"}">${r[1] ? "✓" : "✕"}</td><td class="${r[2] ? "y" : "x"}">${r[2] ? "✓" : "✕"}</td></tr>`).join("")}</tbody></table>`,
  // The real back-of-pack photo (behind the scenes / transparency)
  backpanel: s => `<h1 class="top">${rich(s.headline)}</h1><div class="panel"><img src="${s._A}mornings-back-2k.jpg" alt="Back of the SILT Mornings pack"></div>${s.sub ? `<p class="lede c">${rich(s.sub)}</p>` : ""}`,
  // Big numbers
  bignum: s => `<div class="bignum">${s.nums.map(n => `<div><b>${esc(n.n)}</b><span>${rich(n.l)}</span></div>`).join("")}</div>${s.headline ? `<h1 class="mid">${rich(s.headline)}</h1>` : ""}`,
  // When you'll feel it (from our website timeline)
  timeline: s => `<h1 class="top">${rich(s.headline)}</h1><div class="tl card">${s.rows.map(r => `<div class="tr"><span class="when">${esc(r.when)}</span><span>${rich(r.what)}</span></div>`).join("")}</div>${s.foot ? `<p class="foot">${rich(s.foot)}</p>` : ""}`,
  // Ingredient chips with doses
  chips: s => `<h1 class="top">${rich(s.headline)}</h1>${s.sub ? `<p class="lede">${rich(s.sub)}</p>` : ""}<div class="chips">${s.items.map(i => `<div class="chip card"><b>${esc(i.dose)}</b><span>${esc(i.name)}</span><em>${esc(i.role || "")}</em></div>`).join("")}</div>`,
  // Real review card (no stars unless the rating is known)
  review: s => `<div class="review card"><div class="q">“</div><p>${rich(s.quote)}</p><div class="by">${esc(s.by)}</div></div>${s.headline ? `<h1 class="mid">${rich(s.headline)}</h1>` : ""}`,
  // Unboxing flat lay
  unbox: s => `<h1 class="top">${rich(s.headline)}</h1><div class="unbox"><img class="b1" src="${s._A}mornings_box_cut.png" alt=""><img class="b2" src="${s._A}nights_box_cut.png" alt=""><img class="s1" src="${s._A}mornings_stick_cut.png" alt=""><img class="s2" src="${s._A}nights_stick_cut.png" alt=""></div><div class="labels">${s.labels.map(l => `<span>${rich(l)}</span>`).join("")}</div>`,
  // 21 The objection ad
  objection: s => `<h1 class="quote">${rich(s.quote)}</h1>${s.sub ? `<p class="lede">${rich(s.sub)}</p>` : ""}<div class="ticks">${s.ticks.map(t => `<div><span>✓</span>${rich(t)}</div>`).join("")}</div>`,
  // 20 The "don't buy this" ad
  dontbuy: s => `<div class="dont"><div class="dh">DON'T BUY THIS IF</div>${s.items.map(i => `<div class="dx"><span>✕</span>${rich(i)}</div>`).join("")}<p class="else">${rich(s.else)}</p></div>`,
  // 23 The restaurant bill
  bill: s => `<div class="bill"><div class="bt">SILT</div><div class="bsub">${esc(s.sub || "TABLE 01 · ONE RITUAL")}</div>${s.lines.map(l => `<div class="bl ${l.cls || ""}"><span>${rich(l.k)}</span><span>${esc(l.v)}</span></div>`).join("")}<div class="bfoot">${rich(s.foot)}</div></div>`,
  // Offer card
  offer: s => `<div class="offer"><div class="kick">${esc(s.kicker)}</div><h1 class="huge">${rich(s.headline)}</h1><div class="code"><span>CODE</span><b>${esc(s.code)}</b></div>${s.sub ? `<p class="lede c">${rich(s.sub)}</p>` : ""}</div>`,
  // AM / PM split ritual
  // Relatable scene: a real-life moment, words on the photo; the pack stands beside the person, lower right, as the answer
  scene: s => { const pos = s.product === "combo" ? "top" : (SCENES[s.scene] || {}).pos === "bottom" ? "bottom" : "top"; return `<div class="scenebg" style="background-image:url('${photoOr(s, s._A, s.scene)}')"></div><div class="scenefade ${pos === "bottom" ? "b" : "t"}"></div>
    <div class="scenetext ${pos === "bottom" ? "b" : "t"}"><h1 class="huge">${rich(s.headline)}</h1>${s.sub ? `<p class="lede sol">${rich(s.sub)}</p>` : ""}<div class="pline big">${PLINE[s.product] || PLINE.combo}</div></div>`; },
  // PROBLEM | SOLUTION (our take on the before/after split): a relatable problem moment next to the SILT ritual.
  // A side can be a scene photo, or "product" (brand colour + the stick) or "jars" (the supplement shelf).
  problemsolution: s => {
    const side = (kind, sc, lab, line) => {
      const p = s.product === "combo" ? null : s.product;
      const inner = sc === "product" ? `<div class="pspanel ${s.product}">${packHTML(s.product, s._A, "inpanel")}</div>`
        : okPhoto(s.photo) && kind === "prob" ? `<div class="psimg" style="background-image:url('${s.photo}')"></div>`
        : sc === "jars" ? bottles(s._A, s.product)
        : `<div class="psimg" style="background-image:url('${scene(s._A, sc)}')"></div>`;
      return `<div class="ps ${kind}">${inner}<span class="pstag ${kind}">${esc(lab)}</span><div class="psline">${rich(line)}${kind === "sol" ? `<div class="pline">${PLINE[s.product] || PLINE.combo}</div>` : ""}</div></div>`;
    };
    return `${s.headline ? `<h1 class="top c">${rich(s.headline)}</h1>` : ""}<div class="psrow">${side("prob", s.scene_problem, s.label_problem || "Problem", s.problem)}${side("sol", "product", s.label_solution || "Solution", s.solution)}</div>`;
  },
  // Two-panel meme: two moments, two captions
  meme: s => `<div class="meme"><div class="mcol">${[["a", s.top, s.scene_a], ["b", s.bottom, s.scene_b]].map(([k, cap, sc]) => `<div class="mp"><div class="mimg" style="background-image:url('${photoOr(s, s._A, sc, k === "a" ? "photo" : "photo_b")}')"></div><div class="mcap">${rich(cap)}</div></div>`).join("")}</div>${packHTML(s.product, s._A, "beside")}</div>`,
  // Relatable poll / quiz (no product): a question and 3 or 4 answers
  poll: s => `<div class="poll"><div class="kick">${esc(s.kicker || "Be honest")}</div><h1 class="top">${rich(s.question)}</h1>${s.options.map((o, i) => `<div class="opt"><span>${"ABCD"[i]}</span>${rich(o)}</div>`).join("")}${s.sub ? `<p class="lede">${rich(s.sub)}</p>` : ""}</div>`,
  ritual: s => `<h1 class="top c">${rich(s.headline)}</h1><div class="split"><div class="am"><span class="lab">${esc(s.am)}</span><img src="${s._A}mornings_boxstick_cut.png" alt="SILT Mornings box and stick"><p>${rich(s.amline)}</p></div><div class="pm"><span class="lab">${esc(s.pm)}</span><img src="${s._A}nights_boxstick_cut.png" alt="SILT Nights box and stick"><p>${rich(s.pmline)}</p></div></div>`
};
// Templates that draw their own product (no separate product shot)
const KICK_IN_BODY = new Set(["statement", "offer", "poll"]);
const FULL_BLEED = new Set(["scene"]);
const OWN_PRODUCT = new Set(["beforeafter", "unbox", "ritual", "backpanel", "meme", "problemsolution"]);

function css(z, th, A, F) {
  return `@font-face{font-family:Jost;src:url(${F}jost-400.ttf);font-weight:400}@font-face{font-family:Jost;src:url(${F}jost-700.ttf);font-weight:700}
@font-face{font-family:Corm;src:url(${F}cormorant-italic-600.ttf);font-weight:600;font-style:italic}@font-face{font-family:Corm;src:url(${F}cormorant-italic-700.ttf);font-weight:700;font-style:italic}
*{box-sizing:border-box;margin:0;padding:0}html,body{width:${z.w}px;height:${z.h}px;overflow:hidden;background:${th.bg}}
.frame{position:relative;width:${z.w}px;height:${z.h}px;overflow:hidden;background:${th.bg};color:${th.ink};font-family:Jost,sans-serif;font-size:${z.fs}px;
 --acc:${th.acc};--acc2:${th.acc2};--card:${th.card};--line:${th.line};--sub:${th.sub};--ink:${th.ink};--bg:${th.bg}}
.frame:before{content:"";position:absolute;left:-20%;right:-20%;bottom:-38%;height:62%;border-radius:50%;background:${th.card};opacity:.55}
.safe{position:absolute;left:${z.pad[3]}px;right:${z.pad[1]}px;top:${z.pad[0]}px;bottom:${z.pad[2]}px;display:flex;flex-direction:column;gap:2.4em}
header{display:flex;align-items:center;justify-content:space-between;flex:none}header img{height:8.4em}
header .k{font-size:2.3em;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--acc);border:.12em solid var(--acc);border-radius:99em;padding:.35em .9em}
main{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:2.2em}
footer{flex:none;display:flex;align-items:center;justify-content:space-between;gap:2em}
.cta{background:var(--acc);color:${th === THEMES.pm || th === THEMES.navy ? "#111B3D" : "#fff"};font-weight:700;font-size:2.5em;padding:.55em 1.1em;border-radius:99em;white-space:nowrap}
.url{font-size:2em;color:var(--sub);letter-spacing:.04em}
.note{font-size:1.45em;color:var(--sub);text-align:right;max-width:46%}
h1{font-weight:700;font-size:6.2em;line-height:1.04;letter-spacing:-.015em}h1.top{font-size:5.6em}h1.mid{font-size:4.6em}h1.c,.c{text-align:center}
h1.huge{font-size:9em;line-height:.98}h1.quote{font-family:Corm,serif;font-style:italic;font-weight:700;font-size:7.4em;line-height:1}
em.acc{font-style:normal;color:var(--acc)}b{font-weight:700}
.lede{font-size:2.9em;line-height:1.3;color:var(--sub)}
.card{background:var(--card);border-radius:2.2em;box-shadow:0 1.2em 3em rgba(10,20,50,.12)}
.pack{flex:none;height:${z.pack}px;margin-top:auto;align-self:flex-end;position:relative;display:flex;align-items:flex-end;justify-content:flex-end;gap:${Math.round(z.pack * .04)}px;max-width:100%}
.pack img{height:100%;width:auto;max-width:100%;object-fit:contain;position:relative;z-index:1;filter:drop-shadow(0 .8em 1.2em rgba(0,0,0,.18))}
.pack.duo img{max-width:49%}
.pack:after{content:"";position:absolute;left:6%;right:2%;bottom:-3%;height:12%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(15,20,40,.32),rgba(15,20,40,0) 70%);z-index:0}
.pack.inpanel{height:auto;width:100%;margin:auto 0;align-self:center;justify-content:center}.pack.inpanel img{height:auto;max-height:${z.pack}px}.pack.inpanel:after{bottom:-6%}
.meme{flex:1;min-height:0;display:flex;gap:1.4em;align-items:flex-end}.mcol{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;gap:1.4em}
.pack.beside{height:${Math.round(z.pack * .78)}px;margin:0;align-self:flex-end}
/* newscard */.news{padding:3.2em 3.4em;color:#1d1d1f;background:#fff}.newsbar{display:flex;justify-content:space-between;align-items:center;border-bottom:.3em solid #1d1d1f;padding-bottom:1.2em;margin-bottom:2em}
.news .tag{background:#D42A1F;color:#fff;font-weight:700;font-size:2.2em;padding:.25em .7em;letter-spacing:.1em}.news .date{font-size:2em;color:#666}.news h1{font-size:5.6em}.news .goodbar{display:flex;align-items:center;border-top:.3em solid #1d1d1f;margin-top:1.8em;padding-top:1.4em;margin-bottom:1em}.news .tag.gnews{background:#1E8E4E}.news .good{font-size:3.4em;line-height:1.25;color:#1d1d1f;font-weight:600}
/* search */.search{display:flex;flex-direction:column;gap:2em}.search .bar{background:#fff;color:#222;border-radius:99em;padding:1.1em 1.6em;font-size:3em;display:flex;align-items:center;gap:.7em;box-shadow:0 .6em 2em rgba(0,0,0,.12)}
.glass{width:.8em;height:.8em;border:.13em solid #666;border-radius:50%;position:relative;flex:none}.glass:after{content:"";position:absolute;width:.35em;height:.13em;background:#666;right:-.32em;bottom:-.12em;transform:rotate(45deg)}
.result{padding:2.6em 3em;color:#1d1d1f;background:#fff}.result .url{font-size:2.1em;color:#2a6b3f}.result h2{font-size:3.8em;color:#1a3fbf;margin:.3em 0;line-height:1.15}.result p{font-size:2.7em;color:#444;line-height:1.35}
/* notes */.notes{background:#FFFDF6;color:#222;padding:2.4em 3.2em 3em}.notesbar{display:flex;justify-content:space-between;color:#D9A200;font-size:2.6em;margin-bottom:1.2em}.notes h2{font-size:4.2em;line-height:1.1;margin-bottom:.6em}
.notes ol{font-size:3.1em;line-height:1.45;padding-left:1.2em}.notes .last{font-size:3.1em;font-weight:700;margin-top:.7em}
/* tweet */.tweet{background:#fff;color:#0f1419;padding:3em 3.4em}.who{display:flex;gap:1.4em;align-items:center;font-size:2.6em}.who div{display:flex;flex-direction:column}.who span:not(.av){color:#536471;font-size:.85em}
.av{width:2.6em;height:2.6em;border-radius:50%;background:#16245E;display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none}.av img{width:80%;height:auto;object-fit:contain;transform:translateY(4%)}
.tw{font-size:4.3em;line-height:1.25;margin:.7em 0 .5em}.time{font-size:2.2em;color:#536471}
/* forward */.fwd{background:linear-gradient(180deg,#FF9A3C,#FFD45C 55%,#FFF1B8);border-radius:2.2em;padding:2.6em 3em;text-align:center;color:#5a1a00;box-shadow:0 1.2em 3em rgba(0,0,0,.15)}
.fwdlabel{text-align:left;font-size:2.1em;color:#6b4a2a;font-style:italic}.flowers{font-size:6em;margin:.1em 0}.glitter{font-family:Corm,serif;font-style:italic;font-weight:700;font-size:10.5em;line-height:1;color:#B0124F;text-shadow:0 .03em 0 #fff,0 -.03em 0 #fff,.03em 0 0 #fff,-.03em 0 0 #fff,0 .08em .2em rgba(120,0,40,.35)}
.bless{font-size:3.4em;margin:.4em 0 .8em;color:#7a2500;font-weight:700}.offerbox{background:#fff;color:#17245C;border-radius:1.4em;padding:1.1em 1.4em;font-size:3.2em;line-height:1.3}.fwdend{font-size:2.6em;margin-top:.8em;color:#6b2a00}
/* email */.email{background:#fff;color:#202124;padding:2.6em 3.2em}.email .row{display:flex;gap:1.2em;font-size:2.4em;border-bottom:.08em solid #e3e3e3;padding:.55em 0}.email .row span{color:#888;width:5.2em;letter-spacing:.08em;font-size:.8em;padding-top:.2em}
.email .body{font-size:3.2em;line-height:1.4;margin:1em 0}.email .body p{margin-bottom:.5em}.email .sig{font-size:2.6em;color:#555;border-top:.08em solid #e3e3e3;padding-top:.8em}
/* calendar */.cal{padding:1.8em 2.2em;display:flex;flex-direction:column;gap:1em;color:#202124;background:#fff}.slot{display:flex;gap:1.4em;align-items:center;font-size:2.8em;padding:.55em .8em;border-radius:.6em;background:#EEF1F8;color:#55607a}
.slot .t{width:4.6em;font-size:.82em;color:#7a8296}.slot.me{background:var(--acc);color:#fff;font-weight:700;font-size:3.2em}.slot.me .t{color:#fff}
/* checklist */.eod{padding:2.8em 3.2em;font-size:3.3em}.eodtitle{font-size:.8em;letter-spacing:.2em;color:var(--sub);font-weight:700;margin-bottom:.8em}.ck{display:flex;gap:.8em;align-items:center;padding:.45em 0;border-bottom:.04em solid var(--line)}
.ck .mk{color:var(--acc);font-weight:700;width:1em}.ck.todo{font-weight:700}.ck.todo .mk{color:var(--acc2)}
/* chat */.chat{background:#EFE7DD;padding:2.4em;display:flex;flex-direction:column;gap:1.2em;color:#111}.chathead{font-size:2.4em;font-weight:700;color:#333;margin-bottom:.4em}
.bub{background:#fff;border-radius:1.2em;padding:.8em 1.1em;font-size:3.1em;line-height:1.3;max-width:82%;align-self:flex-start}.bub.me{background:#D9FDD3;align-self:flex-end}
/* parts */.parts{display:flex;flex-direction:column;gap:1.4em}.part{display:flex;gap:1.6em;align-items:center;padding:1.6em 2em}.part .n{font-size:5em;font-weight:700;color:var(--acc);width:1em}.part b{font-size:3.4em;display:block}.part span{font-size:2.6em;color:var(--sub);line-height:1.3}
/* mistakes */.mist{display:flex;flex-direction:column;gap:1.5em}.mi{display:flex;gap:1.2em;font-size:3.4em;line-height:1.25;align-items:baseline}.mi .n{color:var(--acc);font-weight:700;font-size:1.3em}.turn{font-size:3.4em;font-weight:700;color:var(--acc)}
/* before after */.ba{flex:1;min-height:0;display:flex;gap:2em}.half{flex:1;border-radius:2em;padding:2em;display:flex;flex-direction:column;gap:1.4em;align-items:center;text-align:center}
.half .lab{font-weight:700;letter-spacing:.2em;font-size:2.3em}.half p{font-size:2.8em;line-height:1.25}.before{background:#E7E3DA;color:#555}.bimg{flex:1;width:100%;min-height:0;border-radius:1.2em;background-size:cover;background-position:center 60%}.after{background:var(--card)}
.jars{flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:3em 1.2em;align-content:center;width:100%;min-height:0}.jars i{display:block;position:relative;aspect-ratio:3/5;max-height:17em;width:52%;margin:auto;border-radius:.9em .9em .7em .7em;background:linear-gradient(90deg,#d9d6cf,#fff 40%,#e6e2da);box-shadow:0 .6em 1.2em rgba(0,0,0,.18)}
.jars i:before{content:"";position:absolute;left:16%;right:16%;top:-11%;height:14%;border-radius:.4em;background:var(--cap,#6b7a99)}.jars i:after{content:"";position:absolute;left:0;right:0;top:34%;height:30%;background:var(--lab,#9aa6c2);opacity:.85}
.jars i:nth-child(1){--cap:#2f8f5b;--lab:#a7d9b9}.jars i:nth-child(2){--cap:#d9534f;--lab:#f3b7b5}.jars i:nth-child(3){--cap:#3b6fd4;--lab:#b5c9f2}.jars i:nth-child(4){--cap:#e0a526;--lab:#f6dc9c}.jars i:nth-child(5){--cap:#7b4fb8;--lab:#d3c1ee}.jars i:nth-child(6){--cap:#333;--lab:#cfcfcf}
.jars i:nth-child(2),.jars i:nth-child(5){transform:rotate(4deg)}.jars i:nth-child(3){transform:rotate(-3deg)}
.after .pack{width:100%}
/* statement */.statement{flex:1;display:flex;flex-direction:column;justify-content:center;gap:2em}.kick{font-size:2.4em;letter-spacing:.22em;color:var(--acc);font-weight:700;text-transform:uppercase}
/* vs */table.vs{width:100%;border-collapse:separate;border-spacing:0;padding:1.4em 2em;font-size:3em}.vs th{font-size:.8em;letter-spacing:.12em;color:var(--sub);padding:.5em;text-align:center}.vs th:nth-child(2){color:var(--acc)}
.vs td{padding:.55em .4em;border-top:.04em solid var(--line)}.vs td.y,.vs td.x{text-align:center;font-weight:700;width:3.4em}.vs td.y{color:#2E8B57}.vs td.x{color:#C0392B}
/* backpanel */.panel{flex:1;min-height:0;border-radius:2em;overflow:hidden;box-shadow:0 1.2em 3em rgba(0,0,0,.18)}.panel img{width:100%;height:100%;object-fit:cover;object-position:${"72% 26%"};transform:scale(1.9);transform-origin:76% 24%}
/* bignum */.bignum{display:flex;flex-direction:column;gap:1.6em}.bignum div{display:flex;align-items:baseline;gap:.4em;flex-wrap:wrap}.bignum b{font-size:12em;line-height:.9;color:var(--acc)}.bignum span{font-size:3.6em;font-weight:700}
/* timeline */.tl{padding:1.4em 2.4em}.tr{display:flex;gap:1.6em;font-size:3em;padding:.7em 0;border-bottom:.04em solid var(--line);line-height:1.25}.tr:last-child{border:0}.tr .when{width:6.2em;flex:none;color:var(--acc);font-weight:700}.foot{font-size:2.3em;color:var(--sub)}
/* chips */.chips{display:grid;grid-template-columns:1fr 1fr;gap:1.4em}.chip{padding:1.6em 1.8em;display:flex;flex-direction:column;gap:.2em}.chip b{font-size:5em;color:var(--acc);line-height:1}.chip span{font-size:3em;font-weight:700}.chip em{font-size:2.3em;color:var(--sub);font-style:normal}
/* review */.review{padding:3em 3.4em;position:relative}.review .q{font-family:Corm,serif;font-size:16em;line-height:.6;color:var(--acc);height:.45em}.review p{font-family:Corm,serif;font-style:italic;font-weight:700;font-size:6.6em;line-height:1.08}.review .by{font-size:2.4em;color:var(--sub);margin-top:1.2em;letter-spacing:.06em}
/* unbox */.unbox{flex:1;min-height:0;position:relative}.unbox img{position:absolute;filter:drop-shadow(0 1.4em 1.8em rgba(0,0,0,.25));object-fit:contain}
.unbox .b1{left:0;top:6%;height:62%;transform:rotate(-6deg)}.unbox .b2{right:0;top:4%;height:62%;transform:rotate(5deg)}.unbox .s1{left:30%;bottom:0;height:60%;transform:rotate(-14deg)}.unbox .s2{right:30%;bottom:0;height:60%;transform:rotate(12deg)}
.labels{display:flex;justify-content:center;gap:2.4em;font-size:3em;font-weight:700}
/* objection */.ticks{display:flex;flex-direction:column;gap:1.1em}.ticks div{font-size:3.3em;line-height:1.25;display:flex;gap:.6em}.ticks span{color:#2E8B57;font-weight:700}
/* dontbuy */.dont{display:flex;flex-direction:column;gap:1.3em}.dh{font-size:6.4em;font-weight:700;line-height:1}.dx{font-size:3.5em;display:flex;gap:.6em;line-height:1.2}.dx span{color:#D0453A;font-weight:700}.else{font-size:3.6em;font-weight:700;color:var(--acc);margin-top:.4em}
/* bill */.bill{align-self:center;width:78%;background:#fff;color:#222;padding:3em 3.2em;font-family:"Courier New",monospace;box-shadow:0 1.2em 3em rgba(0,0,0,.18);clip-path:polygon(0 0,100% 0,100% 97%,95% 100%,90% 97%,85% 100%,80% 97%,75% 100%,70% 97%,65% 100%,60% 97%,55% 100%,50% 97%,45% 100%,40% 97%,35% 100%,30% 97%,25% 100%,20% 97%,15% 100%,10% 97%,5% 100%,0 97%)}
.bt{text-align:center;font-family:Jost;font-weight:700;font-size:5em;letter-spacing:.2em}.bsub{text-align:center;font-size:2em;color:#777;margin-bottom:1.6em}.bl{display:flex;justify-content:space-between;font-size:2.8em;padding:.4em 0;border-bottom:.05em dashed #bbb}
.bl.total{font-weight:700;border-bottom:.1em solid #222}.bl.disc{color:#C0392B}.bl.pay{font-weight:700;font-size:3.6em;border:0;padding-top:.6em}.bfoot{font-size:2em;color:#666;margin-top:1.2em;text-align:center}
/* offer */.offer{flex:1;display:flex;flex-direction:column;justify-content:center;gap:2em}.code{align-self:flex-start;display:flex;gap:1em;align-items:center;border:.18em dashed var(--acc);border-radius:1.2em;padding:.6em 1.2em;font-size:3.6em}.code span{font-size:.6em;letter-spacing:.2em;color:var(--sub)}.code b{letter-spacing:.1em}
/* scene */.frame.full{background:#0d1020;color:#fff}.frame.full:before{display:none}.scenebg{position:absolute;inset:0;background-size:cover;background-position:center}
.scenefade{position:absolute;left:0;right:0;height:62%}.scenefade.t{top:0;background:linear-gradient(180deg,rgba(8,12,30,.86),rgba(8,12,30,.55) 55%,rgba(8,12,30,0))}.scenefade.b{bottom:0;background:linear-gradient(0deg,rgba(8,12,30,.9),rgba(8,12,30,.6) 55%,rgba(8,12,30,0))}
.frame.full .safe{z-index:2}.frame.full main{justify-content:flex-start}.scenetext{display:flex;flex-direction:column;gap:1.4em;max-width:92%}.scenetext.b{margin-top:auto}.scenetext h1{color:#fff;text-shadow:0 .1em .6em rgba(0,0,0,.35)}.scenetext .lede{color:#E8ECF7}
.frame.full em.acc{color:#EBB858}.frame.full .url{color:#D9DEEB}.frame.full main{position:relative}.frame.full .pack{position:absolute;right:0;bottom:0;margin:0}.frame.full .scenetext.b{max-width:56%}
/* problem | solution */.psrow{flex:1;min-height:0;display:flex;gap:1.2em;position:relative}.ps.prob{flex:.8}.ps.sol{flex:1.25}.ps.prob .psline{font-size:2.9em}.ps.sol .psline{font-size:4.1em}.pline{margin-top:.45em;font-size:.5em;font-weight:400;letter-spacing:.01em;background:rgba(255,255,255,.95);color:#17245C;border-radius:.6em;padding:.35em .6em;display:inline-block}.pline b{font-weight:800;letter-spacing:.04em}.psimg.bottles{background-size:cover;background-position:center 60%}.pack.sticks img{max-width:24%}.prodrow{margin-top:auto;display:flex;align-items:flex-end;gap:2.4em;width:100%}.prodrow .pack{margin-top:0;flex:none;width:auto}.psolb{flex:1;min-width:0;padding-bottom:2.2em;display:flex;flex-direction:column;gap:.7em}.psolb .pn{font-size:2.4em;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.75}.psolb .pl{font-size:4.8em;font-weight:800;line-height:1.02}.psolb .pl b{font-weight:900;letter-spacing:.03em}.psolb .pi{font-size:2.5em;font-weight:600;opacity:.9}.psolb .pp{font-size:2.6em;font-weight:700;align-self:flex-start;padding:.3em .7em;border-radius:.5em;background:rgba(235,184,88,.95);color:#17245C}.frame.full .prodrow{position:static}.prodrow .pack{max-width:52%}.prodrow .pack.duo img{max-width:50%;height:auto;max-height:100%}.prodrow .pack.sticks img{max-width:none;height:100%}.scenetext h1.huge{font-size:6.4em}.scenetext .lede.sol{font-size:4.6em;font-weight:700;color:#fff;line-height:1.15}.pline.big{font-size:2.2em;align-self:flex-start}.ps{flex:1;position:relative;border-radius:2em;overflow:hidden;box-shadow:0 1.2em 2.6em rgba(0,0,0,.16)}
.psimg{position:absolute;inset:0;background-size:cover;background-position:center 35%}.ps.prob .psimg{filter:saturate(.75) brightness(.92)}
.pspanel{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:6%}.pspanel.mornings{background:radial-gradient(circle at 50% 40%,#FFE3A8,#F2A541 70%)}.pspanel.nights{background:radial-gradient(circle at 50% 40%,#5C7EE6,#1C2C7A 75%)}.pspanel.combo{background:linear-gradient(90deg,#F7C66E 50%,#3E5BD0 50%)}
.pspanel .psstick{height:66%;filter:drop-shadow(0 1.4em 1.6em rgba(0,0,0,.3));margin-top:-8%}.jarsbg{background:#E4DFD4}.jarsbg .jars{width:80%;margin-top:-14%}
.pstag{position:absolute;top:1.2em;left:1.2em;font-weight:700;font-size:2.7em;padding:.2em .7em;border-radius:.4em;transform:rotate(-4deg);box-shadow:0 .3em .8em rgba(0,0,0,.2)}.pstag.prob{background:#fff;color:#C0392B}.pstag.sol{background:#EBB858;color:#17245C;transform:rotate(3deg)}
.psline{position:absolute;left:0;right:0;bottom:0;padding:3.2em 1.1em 1.1em;font-size:3.5em;font-weight:700;line-height:1.08;color:#fff;background:linear-gradient(0deg,rgba(8,12,30,.85),rgba(8,12,30,0))}
/* meme */.mp{flex:1;min-height:0;position:relative;border-radius:1.8em;overflow:hidden;box-shadow:0 1em 2.4em rgba(0,0,0,.18)}.mimg{position:absolute;inset:0;background-size:cover;background-position:center 30%}
.mcap{position:absolute;left:0;right:0;top:0;padding:1em 1.2em 2.4em;font-size:3.6em;font-weight:700;color:#fff;line-height:1.1;background:linear-gradient(180deg,rgba(0,0,0,.72),rgba(0,0,0,0))}
/* poll */.poll{display:flex;flex-direction:column;gap:1.3em}.opt{display:flex;gap:.8em;align-items:center;background:var(--card);border-radius:1.4em;padding:.7em 1em;font-size:3.4em;box-shadow:0 .5em 1.4em rgba(10,20,50,.08)}.opt span{width:1.6em;height:1.6em;border-radius:50%;background:var(--acc);color:#fff;display:grid;place-items:center;font-weight:700;font-size:.8em;flex:none}
/* ritual */.split{flex:1;min-height:0;display:flex;gap:2em}.split>div{flex:1;border-radius:2.2em;padding:2.2em;display:flex;flex-direction:column;align-items:center;gap:1.2em;text-align:center;min-height:0}
.split .am{background:#FBE7C4;color:#3A2410}.split .pm{background:#1E2F78;color:#fff}.split .lab{font-size:2.4em;font-weight:700;letter-spacing:.2em}.split img{flex:none;height:${Math.round(z.pack * .82)}px;max-height:62%;max-width:94%;object-fit:contain;filter:drop-shadow(0 1em 1.4em rgba(0,0,0,.25))}.split p{font-size:3em;font-weight:700;line-height:1.2}
`;
}

// Header label: the funnel message unless the static sets its own (and shows it in the header).
export const MESSAGE = { TOFU: "Replaces the stack", MOFU: "Replaces the stack", BOFU: "Replaces the stack", RET: "Your daily ritual" };
// The funnel message (Replaces the stack / Your daily ritual) lives in the copy, not as a header label (user, 25 Nov).

export function render(spec, sizeId, base = "") {
  const z = SIZES[sizeId], th = THEMES[spec.theme || (spec.product === "nights" ? "pm" : spec.product === "mornings" ? "am" : "combo")];
  const A = base + "assets/", F = base + "fonts/";
  const s = { ...spec, _A: A };
  const body = T[spec.t](s);
  const full = FULL_BLEED.has(spec.t), logo = full ? "logo_white.png" : th.logo;
  const SOLB = { mornings: ["<b>DAILY</b> energy and nutrition", "Steady Energy · Gut Health · Daily Vitamins", "Rs. 900 · 15 sticks"], nights: ["<b>NIGHTLY</b> sleep and recovery", "Deep Sleep · Recovery · Stress Relief", "Rs. 900 · 15 sticks · No melatonin"], combo: ["Both, morning and night", "<b>DAILY</b> energy · <b>NIGHTLY</b> sleep", "Rs. 1,800 · COMBO10 for 10% off"] };
  const pimg = OWN_PRODUCT.has(spec.t) ? "" : productImgs(spec, A);
  const sb = SOLB[spec.product] || SOLB.combo;
  const prod = !pimg ? "" : full ? pimg : `<div class="prodrow"><div class="psolb ${spec.product}"><div class="pn">SILT ${spec.product === "combo" ? "Combo" : spec.product === "nights" ? "Nights" : "Mornings"}</div><div class="pl">${sb[0]}</div><div class="pi">${sb[1]}</div><div class="pp">${sb[2]}</div></div>${pimg}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(spec.id)}</title><style>${css(z, th, A, F)}</style></head><body>
<div class="frame${full ? " full" : ""}">${full ? body.split("<div class=\"scenetext")[0] : ""}<div class="safe"><header><img src="${A}${logo}" alt="SILT Nutrition"></header>
<main>${full ? "<div class=\"scenetext" + body.split("<div class=\"scenetext")[1] : body}${prod}</main>
<footer><span class="cta">${esc(spec.cta || (spec.funnel === "RET" ? "Your 60-second ritual" : spec.product === "nights" ? "SILT Nights · NIGHTLY sleep and recovery" : spec.product === "mornings" ? "SILT Mornings · DAILY energy and nutrition" : "Extra 10% off the Combo · COMBO10"))}</span>${spec.note ? `<span class="note">${esc(spec.note)}</span>` : `<span class="url">siltnutrition.com</span>`}</footer></div></div></body></html>`;
}

export function fileName(spec, sizeId) {
  const z = SIZES[sizeId];
  const prod = spec.product[0].toUpperCase() + spec.product.slice(1);
  return `SILT_${prod}_${spec.id}-${spec.slug}_${z.label}_${z.ratio}_${z.w}x${z.h}`;
}

export const TEMPLATES = Object.keys(T);

// ---------- Copy check (shared by render.mjs and the website) ----------
export const FACT_NUMBERS = ["80", "200", "5", "6", "3", "250", "300", "900", "15", "60", "10", "1,800", "19", "293", "0", "72", "2", "100", "30", "4", "1", "7", "9", "8", "11", "12", "2019", "1:07", "7:30", "9:00", "11:00", "2:00", "5:30", "8:00", "8:02", "66"];
const META_KEYS = new Set(["id", "slug", "product", "funnel", "concept", "format", "t", "theme", "shot", "check", "files", "_new", "_team", "status", "created_by", "updated_by", "updated_at", "check_report", "review_note", "maker", "inspired_by", "made_on", "scene", "scene_a", "scene_b", "scene_problem", "scene_solution", "idea_id", "flags", "source", "photo", "photo_b", "photo_brief", "chatgpt_prompt", "names", "made_with", "ai_note", "ai_verdict", "made_by_ai"]);
export const META_FIELDS = [...META_KEYS];
// Returns a list of problems; empty means the copy passes. Numbers outside the fact list need a team check.
export function checkCopy(s) {
  const out = [];
  const text = JSON.stringify(Object.fromEntries(Object.entries(s).filter(([k]) => !META_KEYS.has(k) && !k.startsWith("_") && !(s.t === "vs" && k === "rows"))));
  if (/[—–]/.test(text)) out.push("Has an em or en dash. Use a comma, a full stop or \"to\".");
  if (/AG1|Supply ?6|Oziva|Upside|Wellbeing Nutrition|Stack Club|Fast&Up|Whole Truth|Cosmix|IM8/i.test(text)) out.push("Names a competitor. Compare against \"the usual stack\" instead.");
  if (/easy return|money.?back|guarantee|full refund|no.questions/i.test(text)) out.push("Promises returns or a guarantee. Our policy is no returns; damaged or wrong products are replaced within 72 hours.");
  if (/★|\d ?stars?\b|5-star/i.test(text)) out.push("Shows a star rating we haven't verified.");
  if (/melatonin-free|cure|treat|clinically proven|doctor recommended/i.test(text)) out.push("Medical-sounding claim (cure, treat, clinically proven...). Check with the team.");
  const nums = [...new Set((text.match(/\d[\d,:]*/g) || []).map(n => n.replace(/,$/, "")))].filter(n => !FACT_NUMBERS.includes(n) && !/^\d{1,2}:\d{2}$/.test(n));
  if (nums.length) out.push(`Numbers not on the pack or website: ${nums.join(", ")}. Check them before this goes live.`);
  if (!TEMPLATES.includes(s.t)) out.push(`Unknown format "${s.t}".`);
  if (!["mornings", "nights", "combo"].includes(s.product)) out.push(`Product must be mornings, nights or combo.`);
  return out;
}

// ---------- Brand brief for the team's own Claude / ChatGPT ----------
export const BRAND_BRIEF = `You are helping the SILT Nutrition team write copy for a Meta ad static (an Indian wellness drink-mix brand).
FACTS (use only these numbers):
- SILT Mornings stick: 80 mg caffeine + 200 mg L-theanine, 5 g PHGG fibre, 6 billion probiotics, vitamins D3, K2, B12 and C at 100% RDA. Lemon Orange.
- SILT Nights stick: 3 g glycine, 250 mg magnesium (bisglycinate), 300 mg KSM-66 ashwagandha, 200 mg L-theanine. Chamomile Lemon. No melatonin.
- No added sugar, no maltodextrin, every dose printed on the pack. 19 ingredients, 293 lab checks, 0 failed (lab reports on siltnutrition.com).
- Rs 900 for 15 sticks (Rs 60 a stick). Combo = Mornings + Nights, Rs 1,800. Code COMBO10 = extra 10% off the Combo.
- Damaged or wrong product: photos within 72 hours, we replace it. NO returns otherwise. Delivery 2 to 10 working days.
- Real verified review you may quote: "Taste of SILT Night is really amazing."
MESSAGE:
- TOFU, MOFU, BOFU (acquisition): "Replaces the stack" (Mornings replaces the morning stack, Nights the sleep stack, the Combo the whole stack).
- Retention (existing customers): the ritual and routine (own the morning and the night; boring is interesting; no discount push).
PEOPLE: every person, name and setting is Indian (Indian faces in images; names like Priya, Rohan, Ananya, Arjun; chai, autos, Bengaluru traffic, Diwali, wedding season, back-to-back calls).
RULES: "we" brand voice, LESS TEXT (about 22 words per image), short lines, no em or en dashes, never name competitors, no star ratings, no cure or treat claims, no fake reviews, testimonials or results, no fake urgency. Use *word* to colour one word and **word** for bold.`;

export function aiPrompt(spec, ask) {
  const clean = Object.fromEntries(Object.entries(spec).filter(([k]) => !k.startsWith("_") && !["files", "status", "created_by", "updated_by", "updated_at"].includes(k)));
  return `${BRAND_BRIEF}

TASK: ${ask || "Improve this static's copy so it lands the funnel message clearly."}
This static uses the "${spec.t}" format for ${spec.product} (${spec.funnel}). Keep every key and the same JSON structure; only change the text values. Keep it short enough to fit on one image.

CURRENT STATIC (JSON):
${JSON.stringify(clean, null, 1)}

Reply with ONLY the updated JSON object, nothing before or after it.`;
}

export function aiIdeasPrompt(ask) {
  return `${BRAND_BRIEF}

TASK: ${ask || "Suggest 8 new static ad ideas spread across TOFU, MOFU, BOFU and Retention."}
Formats you can use: ${TEMPLATES.join(", ")}.

Reply with ONLY a JSON array, each item like:
{"title": "short name", "funnel": "TOFU|MOFU|BOFU|RET", "product": "mornings|nights|combo", "format": "one of the formats", "headline": "the main line", "note": "why it works"}`;
}

// ---------- Text density (Meta: less text = more reach) ----------
// Counts the words that end up on the image (CTA and footer included).
export function wordCount(spec) {
  const vals = [];
  const walk = v => { if (typeof v === "string") vals.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
  for (const [k, v] of Object.entries(spec)) if (!META_KEYS.has(k) && !k.startsWith("_")) walk(k === "rows" && spec.t === "vs" ? v.map(r => r[0]) : v);
  walk(spec.cta || "Extra 10% off the Combo"); 
  return vals.join(" ").replace(/\*/g, "").split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length;
}
export const TEXT_LIMIT = { good: 22, max: 32 };

// ---------- Maker: the team's own Claude / ChatGPT drafts a static, copying a competitor pattern ----------
export function makerPrompt(inp, patterns) {
  const pats = (patterns || []).map(p => `- ${p.brand}: "${p.title}". ${p.text}`).join("\n");
  return `${BRAND_BRIEF}

You are the MAKER. Draft ONE Meta ad static for SILT.
Product: ${inp.product}. Funnel: ${inp.funnel} (${inp.funnel === "RET" ? "existing customers, message = the ritual / routine" : "message = Replaces the stack"}).
Audience: ${inp.audience || "busy Indian professionals, 25 to 40"}. Angle: ${inp.angle || "your choice"}. Tone: ${inp.tone || "tongue-in-cheek, friend not parent"}.
${pats ? `COPY THE SKILL, NOT THE WORDS: these competitor patterns are working in Meta ads right now. Borrow the structure or the psychology, never their wording or their name:
${pats}
` : ""}
LESS TEXT: at most ${TEXT_LIMIT.good} words on the whole image, including the call to action. One idea. The product photo does the rest.
FORMAT: use the "${inp.format}" format. Fill exactly these keys (same types) and nothing else:
${JSON.stringify(inp.skeleton, null, 1)}

Reply with ONLY the JSON object.`;
}

// ---------- Checker (AI second opinion; the automatic checks run on the website) ----------
export function checkerPrompt(spec, report) {
  const clean = Object.fromEntries(Object.entries(spec).filter(([k]) => !k.startsWith("_") && !["files", "check_report", "review_note"].includes(k)));
  return `${BRAND_BRIEF}

You are the CHECKER for a SILT Meta ad static. Be strict and short.
Automatic checks already found: ${report && report.issues.length ? report.issues.join(" | ") : "nothing"}. Words on the image: ${report ? report.words : "?"} (target ${TEXT_LIMIT.good} or fewer).
Check: 1) every number and claim matches the FACTS; 2) the funnel message is clear in 2 seconds (${spec.funnel === "RET" ? "the ritual / routine" : "Replaces the stack"}); 3) it isn't too texty; 4) nothing copies a competitor's wording or names a brand; 5) no fake urgency, reviews or results.
STATIC (JSON):
${JSON.stringify(clean, null, 1)}

Reply with ONLY JSON: {"verdict": "pass" or "fix", "issues": ["..."], "fixed": <the same JSON object with your fixes, fewer words>}`;
}

// ---------- Daily batch: 30 statics from one prompt (Maker) ----------
export const BATCH_MIX = { TOFU: 9, MOFU: 7, BOFU: 6, RET: 8 };
export function batchPrompt(inp, skeletons, patterns) {
  const n = inp.count || 30;
  const pats = (patterns || []).map(p => "- " + p.brand + ": \"" + p.title + "\". " + p.text).join("\n");
  const mix = Object.entries(BATCH_MIX).map(([k, v]) => k + " " + Math.round(v * n / 30)).join(", ");
  return BRAND_BRIEF + "\n\nYou are the MAKER. Make " + n + " NEW, different Meta ad statics for SILT for " + (inp.date || "today") + ".\n"
    + "Mix: " + mix + " (funnel codes TOFU, MOFU, BOFU, RET). Spread across mornings, nights and combo. Use at least 10 different formats.\n"
    + (inp.focus ? "Today's focus: " + inp.focus + "\n" : "")
    + "LESS TEXT: about " + TEXT_LIMIT.good + " words per image (" + TEXT_LIMIT.max + " at most), call to action included. One idea per static.\n"
    + (pats ? "COPY THE SKILL, NOT THE WORDS. These competitor patterns are working in Meta ads now; borrow the structure or psychology, never their wording or brand:\n" + pats + "\n" : "")
    + "FORMATS: each static is one JSON object with \"t\" (the format), \"funnel\", \"product\", \"concept\" (2 to 4 words) and exactly the text keys shown for that format:\n"
    + Object.entries(skeletons).map(([t, k]) => t + ": " + JSON.stringify(k)).join("\n")
    + "\n\nReply with ONLY a JSON array of " + n + " objects.";
}

// One-time setup the team pastes into a Claude Project or a custom GPT, so every daily prompt follows the rules.
export const AI_SETUP = BRAND_BRIEF + "\n\nHOW WE WORK: you are part of the SILT Static Engine. The MAKER writes statics as JSON in the formats the engine gives you. The CHECKER verifies facts, claims, words and the funnel message. Keep every static to about " + TEXT_LIMIT.good + " words. Copy competitor skills (structure, psychology), never their words or names. Never invent reviews, results, sleep scores, numbers or deadlines. Always reply with JSON only when asked for JSON.";
