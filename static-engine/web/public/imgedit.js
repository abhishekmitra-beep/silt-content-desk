// IMAGE EDITOR for finished image statics (uploads, ChatGPT images, Library). Team, 25 Nov: "why doesn't every other static
// have an edit option". The words in an image are pixels, so this edits on top of the picture:
//   Cover box: hides old words, filled with a colour (pick it from the image) or smoothed from the pixels around it.
//   Words: new text in the brand fonts (Jost, Jost bold, Cormorant Garamond italic); drag, size, colour, align.
// Layers are saved with the static (per size) on top of the untouched original, so every edit stays editable.
const FONTS = { jost: ["SEJost", "normal", 400], jostb: ["SEJost", "normal", 700], corm: ["SECorm", "italic", 600], cormb: ["SECorm", "italic", 700] };
const FONT_NAMES = { jost: "Jost", jostb: "Jost bold", corm: "Cormorant italic", cormb: "Cormorant italic bold" };
const KEYS = ["4x5", "1x1", "9x16", "reels"];
let fontsReady = null;
function loadFonts() {
  if (fontsReady) return fontsReady;
  const faces = [["SEJost", "/fonts/jost-400.ttf", { weight: "400" }], ["SEJost", "/fonts/jost-700.ttf", { weight: "700" }],
    ["SECorm", "/fonts/cormorant-italic-600.ttf", { weight: "600", style: "italic" }], ["SECorm", "/fonts/cormorant-italic-700.ttf", { weight: "700", style: "italic" }]];
  fontsReady = Promise.all(faces.map(([n, u, d]) => new FontFace(n, `url(${u})`, d).load().then(f => document.fonts.add(f)))).catch(() => {});
  return fontsReady;
}
const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error("Couldn't load the image")); i.src = src; });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const cssFont = (L, sc = 1) => { const [fam, style, w] = FONTS[L.font] || FONTS.jost; return `${style} ${w} ${L.size * sc}px ${fam}`; };

// Fill a box from the pixels around it (the same idea as ffmpeg delogo): blend the left/right and top/bottom edges.
function smooth(ctx, x, y, w, h) {
  const W = ctx.canvas.width, H = ctx.canvas.height; x = Math.max(1, Math.round(x)); y = Math.max(1, Math.round(y));
  w = Math.min(Math.round(w), W - x - 1); h = Math.min(Math.round(h), H - y - 1); if (w < 2 || h < 2) return;
  const d = ctx.getImageData(x - 1, y - 1, w + 2, h + 2), p = d.data, rw = w + 2;
  const at = (i, j, c) => p[(j * rw + i) * 4 + c];
  for (let j = 1; j <= h; j++) for (let i = 1; i <= w; i++) {
    const u = i / (w + 1), v = j / (h + 1), dh = Math.min(i, w + 1 - i), dv = Math.min(j, h + 1 - j);
    for (let c = 0; c < 3; c++) {
      const H_ = at(0, j, c) * (1 - u) + at(w + 1, j, c) * u, V_ = at(i, 0, c) * (1 - v) + at(i, h + 1, c) * v;
      p[(j * rw + i) * 4 + c] = (H_ * dv + V_ * dh) / (dh + dv);
    }
  }
  ctx.putImageData(d, x - 1, y - 1);
}
function wrap(ctx, text, maxW) {
  const out = [];
  for (const para of String(text).split("\n")) {
    let line = ""; for (const word of para.split(/ +/)) { const t = line ? line + " " + word : word; if (line && ctx.measureText(t).width > maxW) { out.push(line); line = word; } else line = t; }
    out.push(line);
  }
  return out;
}
// Draw the base image plus layers onto a canvas at full size (used for the preview of smooth boxes and for saving).
async function compose(img, layers, upTo = Infinity) {
  await loadFonts();
  const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0);
  layers.slice(0, upTo).forEach(L => {
    if (L.type === "cover") { if (L.mode === "smooth") smooth(ctx, L.x, L.y, L.w, L.h); else { ctx.fillStyle = L.color || "#ffffff"; ctx.fillRect(L.x, L.y, L.w, L.h); } }
    else if (L.type === "text") {
      ctx.font = cssFont(L); ctx.fillStyle = L.color || "#ffffff"; ctx.textBaseline = "top";
      const lh = L.size * 1.15, lines = wrap(ctx, L.text, L.w);
      lines.forEach((ln, i) => { const lw = ctx.measureText(ln).width, x = L.align === "center" ? L.x + (L.w - lw) / 2 : L.align === "right" ? L.x + L.w - lw : L.x; ctx.fillText(ln, x, L.y + i * lh + L.size * .075); });
    }
  });
  return c;
}

let dlg, S = null;
function build() {
  dlg = document.createElement("dialog"); dlg.id = "imgEd";
  dlg.innerHTML = `<style>
#imgEd{width:min(1180px,96vw);max-height:94vh;padding:0;border:0;border-radius:14px}#imgEd .ie{display:flex;gap:18px;padding:18px;align-items:flex-start}
#imgEd .side{width:300px;flex:none;display:flex;flex-direction:column;gap:10px;max-height:86vh;overflow:auto}
#imgEd .side h3{margin:0;font-size:17px}#imgEd .side label{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.75}
#imgEd textarea,#imgEd select,#imgEd input[type=number]{width:100%;box-sizing:border-box}#imgEd .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#imgEd .stagewrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0}
#imgEd .stg{position:relative;user-select:none;touch-action:none;box-shadow:0 4px 20px rgba(0,0,0,.25);background:#000}
#imgEd .stg img.base{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#imgEd .ly{position:absolute;cursor:move;white-space:pre-wrap;line-height:1.15;outline:1px dashed rgba(226,128,26,.0)}
#imgEd .ly:hover{outline:2px dashed rgba(226,128,26,.8)}#imgEd .ly.sel{outline:2px solid #E2801A}
#imgEd .ly .h{position:absolute;right:-7px;bottom:-7px;width:14px;height:14px;background:#E2801A;border:2px solid #fff;border-radius:3px;cursor:nwse-resize;display:none}
#imgEd .ly.sel .h{display:block}#imgEd .hint{font-size:12px;opacity:.7;text-align:center}#imgEd .msg{min-height:1.2em;font-size:13px}
#imgEd.picking .stg{cursor:crosshair}#imgEd.picking .ly{pointer-events:none}
</style><div class="ie"><div class="side">
  <div class="row" style="justify-content:space-between"><h3 id="ieTitle"></h3><button id="ieClose">Close</button></div>
  <div class="row" id="ieSizes"></div>
  <div class="row"><button id="ieAddText">+ Words</button><button id="ieAddCover">+ Cover box</button></div>
  <p class="hint" style="text-align:left;margin:0">Cover the old words with a box, then add new words on top. Drag to move, pull the orange corner to resize.</p>
  <div id="iePanel"></div>
  <div class="row"><button id="ieReset">Reset this size</button></div>
  <div class="row"><button class="primary" id="ieSave">Save to Team Approval</button></div><div class="msg" id="ieMsg"></div>
</div><div class="stagewrap"><div class="stg" id="ieStage"><img class="base" id="ieBase" alt="Static"></div><div class="hint" id="ieHint"></div></div></div>`;
  document.body.appendChild(dlg);
  const $ = id => dlg.querySelector("#" + id);
  $("ieClose").onclick = () => dlg.close();
  $("ieAddText").onclick = () => { const W = S.img.naturalWidth; add({ type: "text", x: Math.round(W * .1), y: Math.round(S.img.naturalHeight * .1), w: Math.round(W * .8), text: "New words", font: "jostb", size: Math.round(W / 18), color: "#ffffff", align: "left" }); };
  $("ieAddCover").onclick = () => { const W = S.img.naturalWidth; add({ type: "cover", x: Math.round(W * .1), y: Math.round(S.img.naturalHeight * .1), w: Math.round(W * .5), h: Math.round(W * .1), mode: "smooth", color: "#ffffff" }); };
  $("ieReset").onclick = () => { if (!confirm("Remove every box and every new word on this size?")) return; S.layers[S.key] = []; S.sel = -1; draw(); };
  $("ieSave").onclick = save;
  // drag / resize on the stage
  const stage = $("ieStage"); let drag = null;
  stage.addEventListener("pointerdown", async e => {
    if (dlg.classList.contains("picking")) { e.preventDefault(); await pickAt(e); return; }
    const el = e.target.closest(".ly"); if (!el) { S.sel = -1; draw(); return; }
    e.preventDefault(); const i = +el.dataset.i, L = S.layers[S.key][i]; S.sel = i;
    drag = { i, mode: e.target.classList.contains("h") ? "size" : "move", x: e.clientX, y: e.clientY, L0: { ...L } };
    stage.setPointerCapture(e.pointerId); draw(false);
  });
  stage.addEventListener("pointermove", e => { if (!drag) return; const L = S.layers[S.key][drag.i], dx = (e.clientX - drag.x) / S.sc, dy = (e.clientY - drag.y) / S.sc;
    if (drag.mode === "move") { L.x = Math.round(drag.L0.x + dx); L.y = Math.round(drag.L0.y + dy); } else { L.w = Math.max(20, Math.round(drag.L0.w + dx)); if (L.type === "cover") L.h = Math.max(10, Math.round(drag.L0.h + dy)); }
    place(drag.i); });
  stage.addEventListener("pointerup", () => { if (!drag) return; const i = drag.i; drag = null; if (S.layers[S.key][i]?.type === "cover") refreshSmooth(); panel(); });
  $("iePanel").addEventListener("input", e => { const f = e.target.dataset.f; if (!f || S.sel < 0) return; const L = S.layers[S.key][S.sel];
    L[f] = e.target.type === "number" ? +e.target.value : e.target.value; place(S.sel); if (L.type === "cover" && (f === "mode" || f === "color")) refreshSmooth(); });
  $("iePanel").addEventListener("click", e => { const b = e.target.closest("button"); if (!b || S.sel < 0) return; const L = S.layers[S.key][S.sel];
    if (b.dataset.al) { L.align = b.dataset.al; place(S.sel); }
    if (b.dataset.sz) { L.size = Math.max(8, Math.round(L.size * (b.dataset.sz === "+" ? 1.08 : 1 / 1.08))); place(S.sel); panel(); }
    if (b.dataset.act === "del") { S.layers[S.key].splice(S.sel, 1); S.sel = -1; draw(); }
    if (b.dataset.act === "pick") { dlg.classList.add("picking"); $("ieHint").textContent = "Click the image to pick the background colour."; }
    if (b.dataset.act === "up" && S.sel < S.layers[S.key].length - 1) { const a = S.layers[S.key]; [a[S.sel], a[S.sel + 1]] = [a[S.sel + 1], a[S.sel]]; S.sel++; draw(); } });
  $("ieSizes").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) show(b.dataset.k); });
}
function add(L) { S.layers[S.key].push(L); S.sel = S.layers[S.key].length - 1; draw(); }
async function pickAt(e) {
  const r = dlg.querySelector("#ieStage").getBoundingClientRect(), x = Math.round((e.clientX - r.left) / S.sc), y = Math.round((e.clientY - r.top) / S.sc);
  const c = document.createElement("canvas"); c.width = 1; c.height = 1; const ctx = c.getContext("2d"); ctx.drawImage(S.img, x, y, 1, 1, 0, 0, 1, 1);
  const [R, G, B] = ctx.getImageData(0, 0, 1, 1).data, hex = "#" + [R, G, B].map(v => v.toString(16).padStart(2, "0")).join("");
  dlg.classList.remove("picking"); dlg.querySelector("#ieHint").textContent = ""; const L = S.layers[S.key][S.sel];
  if (L) { L.color = hex; if (L.type === "cover") L.mode = "fill"; draw(); }
}
async function refreshSmooth() {
  const ls = S.layers[S.key]; if (!ls.some(L => L.type === "cover" && L.mode === "smooth")) return draw();
  for (let i = 0; i < ls.length; i++) { const L = ls[i]; if (L.type !== "cover" || L.mode !== "smooth") continue;
    const c = await compose(S.img, ls.filter(x => x.type === "cover"), ls.filter(x => x.type === "cover").indexOf(L) + 1);
    const p = document.createElement("canvas"); p.width = Math.max(1, Math.round(L.w)); p.height = Math.max(1, Math.round(L.h)); p.getContext("2d").drawImage(c, L.x, L.y, L.w, L.h, 0, 0, L.w, L.h);
    L._prev = p.toDataURL(); }
  draw();
}
function place(i) {
  const L = S.layers[S.key][i], el = dlg.querySelector(`.ly[data-i="${i}"]`); if (!el) return; const sc = S.sc;
  Object.assign(el.style, { left: L.x * sc + "px", top: L.y * sc + "px", width: L.w * sc + "px" });
  if (L.type === "cover") { el.style.height = L.h * sc + "px"; el.style.background = L.mode === "smooth" ? (L._prev ? `url(${L._prev}) 0 0/100% 100%` : "rgba(255,255,255,.35)") : (L.color || "#fff"); }
  else { el.firstChild.textContent = L.text; Object.assign(el.style, { font: cssFont(L, sc), color: L.color, textAlign: L.align || "left" }); el.style.lineHeight = "1.15"; }
}
function draw(withPanel = true) {
  const st = dlg.querySelector("#ieStage"), ls = S.layers[S.key];
  st.querySelectorAll(".ly").forEach(n => n.remove());
  ls.forEach((L, i) => { const el = document.createElement("div"); el.className = "ly" + (i === S.sel ? " sel" : ""); el.dataset.i = i;
    el.innerHTML = (L.type === "text" ? "<span></span>" : "") + '<span class="h"></span>'; st.appendChild(el); place(i); });
  if (withPanel) panel();
}
function panel() {
  const p = dlg.querySelector("#iePanel"), L = S.layers[S.key][S.sel];
  if (!L) { p.innerHTML = `<p class="hint" style="text-align:left">${S.layers[S.key].length ? "Click a box or words on the image to change them." : "Nothing added on this size yet."}</p>`; return; }
  const common = `<div class="row"><button data-act="up" title="Bring forward">Bring forward</button><button data-act="del">Delete</button></div>`;
  if (L.type === "cover") p.innerHTML = `<label>Cover box</label><select data-f="mode"><option value="smooth"${L.mode === "smooth" ? " selected" : ""}>Smooth (blends with the photo)</option><option value="fill"${L.mode === "fill" ? " selected" : ""}>Fill with a colour</option></select>
    <div class="row"><input type="color" data-f="color" value="${esc(L.color || "#ffffff")}"><button data-act="pick">Pick colour from image</button></div>${common}`;
  else p.innerHTML = `<label>Words</label><textarea data-f="text" rows="3">${esc(L.text)}</textarea>
    <label>Font</label><select data-f="font">${Object.entries(FONT_NAMES).map(([k, n]) => `<option value="${k}"${L.font === k ? " selected" : ""}>${n}</option>`).join("")}</select>
    <label>Size</label><div class="row"><button data-sz="-">−</button><input type="number" data-f="size" value="${L.size}" style="width:80px"><button data-sz="+">+</button></div>
    <label>Colour</label><div class="row"><input type="color" data-f="color" value="${esc(L.color || "#ffffff")}"><button data-act="pick">Pick from image</button></div>
    <label>Align</label><div class="row"><button data-al="left">Left</button><button data-al="center">Centre</button><button data-al="right">Right</button></div>${common}`;
}
async function show(k) {
  S.key = k; S.sel = -1;
  dlg.querySelectorAll("#ieSizes [data-k]").forEach(b => b.setAttribute("aria-pressed", b.dataset.k === k));
  dlg.querySelector("#ieMsg").textContent = "Loading…";
  S.img = await loadImg(S.base(k)); await loadFonts();
  const W = S.img.naturalWidth, H = S.img.naturalHeight, maxW = Math.min(innerWidth - 400, 760), maxH = innerHeight * .82;
  S.sc = Math.min(maxW / W, maxH / H); const st = dlg.querySelector("#ieStage"); st.style.width = W * S.sc + "px"; st.style.height = H * S.sc + "px";
  dlg.querySelector("#ieBase").src = S.img.src; dlg.querySelector("#ieMsg").textContent = "";
  await refreshSmooth(); draw();
}
async function save() {
  const msg = dlg.querySelector("#ieMsg"), btn = dlg.querySelector("#ieSave"); btn.disabled = true; msg.textContent = "Saving…";
  try {
    const edited = S.keys.filter(k => JSON.stringify(strip(S.layers[k])) !== JSON.stringify(strip(S.orig[k] || [])));
    if (!edited.length) { msg.textContent = "Nothing changed yet."; return; }
    const changed = S.editOf ? edited : S.keys;   // a Library copy carries every size, edited or not
    const files = [];
    for (const k of changed) { const img = k === S.key ? S.img : await loadImg(S.base(k)); const c = await compose(img, S.layers[k]);
      const blob = await new Promise(r => c.toBlob(r, "image/jpeg", .92)); files.push([k, blob]); }
    const layers = Object.fromEntries(changed.map(k => [k, strip(S.layers[k])]));
    let id = S.editOf;
    for (let i = 0; i < files.length; i += 3) {
      const fd = new FormData();
      if (id) fd.append("edit_of", id);
      else { fd.append("title", (S.s.title || S.s.id) + " (edited)"); fd.append("funnel", S.s.funnel || "TOFU"); fd.append("product", S.s.product || "nights"); fd.append("library_id", S.s.id);
        fd.append("base_urls", JSON.stringify(Object.fromEntries(S.keys.map(k => [k, S.base(k)])))); }
      fd.append("layers", JSON.stringify(layers));
      for (const [k, b] of files.slice(i, i + 3)) fd.append("file", b, (k === "reels" ? "reels" : k) + ".jpg");
      const r = await fetch("/api/upload", { method: "POST", body: fd, headers: { "x-silt-actor": "team", "x-silt-name": encodeURIComponent(S.ctx.name() || "team") } });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.statusText); id = id || j.id;
    }
    S.orig = JSON.parse(JSON.stringify(S.layers)); msg.textContent = "Saved. The new version is waiting in Team Approval (the original is kept).";
    S.ctx.onSaved && S.ctx.onSaved();
  } catch (e) { msg.textContent = "Couldn't save: " + e.message; } finally { btn.disabled = false; }
}
const strip = ls => (ls || []).map(({ _prev, ...L }) => L);

export function openImgEditor(s, ctx) {
  if (!s || !s.files) return;
  if (!dlg) build();
  const keys = KEYS.filter(k => s.files[k]);
  if (!keys.length) { alert("This image has no 4:5, 1:1 or 9:16 file to edit."); return; }
  const lib = s.kind === "library";
  S = { s, ctx, keys, key: keys[0], sel: -1, editOf: lib ? null : (s._item ? s._item.id : s.id),
    base: k => s.base_files?.[k] ? "/api/file/" + s.base_files[k] : s.base_urls?.[k] ? s.base_urls[k] : ctx.imgUrl(s, k),
    layers: Object.fromEntries(keys.map(k => [k, JSON.parse(JSON.stringify(s.layers?.[k] || []))])) };
  S.orig = JSON.parse(JSON.stringify(S.layers));
  dlg.querySelector("#ieTitle").textContent = "Edit image: " + String(s.title || s.id).slice(0, 40);
  dlg.querySelector("#ieSizes").innerHTML = keys.map(k => `<button data-k="${k}">${k === "reels" ? "Reels" : k.replace("x", ":")}</button>`).join("");
  dlg.querySelector("#ieMsg").textContent = lib ? "Library image: saving makes an edited copy in Team Approval." : "";
  if (!dlg.open) dlg.showModal(); show(keys[0]);
}
