"""SILT Static Engine stamper (team rule, 26 Nov: "the engine writes the words, ChatGPT looks too AI").

ChatGPT makes ONLY a clean scene plate (no words, no pack, no icons). This script stamps everything brand on it:
headline (Cormorant italic, key words bold in the accent colour), support line (Jost), the official icons
(Packaging Emoticons EM_AM / EM_PM), the real pack files, the price pill, the URL.  Same design in 3 sizes.

  py -3 stamp.py spec.json          spec: [{key, product, headline, sub, plate, layout, dy:{1350:..,1080:..}, zoom, out}]
  Writes <out>/<key>_4x5.jpg  _1x1.jpg  _9x16.jpg and prints red-line problems (Meta: 4:5 y135-1215, 1:1 65px, 9:16 y269-1248, sides 65).
"""
import sys, os, json, re
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__)); A = HERE + "/assets/"; FD = HERE + "/fonts/"
W = 1080
SAFE = {1920: (269, 1248), 1350: (135, 1215), 1080: (65, 1015)}; SIDE = 65

P = {
    "nights":   dict(box="nights_box_cut.png", stick="nights_stick_cut.png", em="EM_PM", glyph="light", acc=(159, 192, 255), ink=(244, 240, 230),
                    pill_bg=(244, 240, 230), pill_fg=(8, 22, 53), labels=("Deep Sleep", "Recovery", "Stress Relief")),
    "mornings": dict(box="mornings_box_cut.png", stick="mornings_stick_cut.png", em="EM_AM", glyph="light", acc=(235, 184, 88), ink=(255, 248, 236),
                    pill_bg=(255, 248, 236), pill_fg=(43, 33, 28), labels=("Steady Energy", "Gut Health", "Daily Vitamins")),
}
GOLD = (235, 200, 120)


def F(name, size): return ImageFont.truetype(FD + name, size)
JOST, JOSTB = "jost-400.ttf", "jost-700.ttf"; CORM = {500: "cormorant-italic-500.ttf", 700: "cormorant-italic-700.ttf"}
GEORGIA_B = "C:/Windows/Fonts/timesbd.ttf"; GEORGIA_I = "C:/Windows/Fonts/timesi.ttf"


def tw(d, t, f, sp=0): return d.textlength(t, font=f) + sp * max(len(t) - 1, 0)


def text_sp(d, x, y, t, f, fill, sp=0, anchor="la"):
    if not sp: d.text((x, y), t, font=f, fill=fill, anchor=anchor); return
    for ch in t: d.text((x, y), ch, font=f, fill=fill, anchor=anchor); x += d.textlength(ch, font=f) + sp


_c = {}
def asset(n):
    if n not in _c: _c[n] = Image.open(A + n).convert("RGBA")
    return _c[n]


def glyph(em, n, size, colour):
    key = (em, n, size, colour)
    if key not in _c:
        a = np.asarray(Image.open(A + f"{em}_{n}.png").convert("RGB")).astype(float)
        if em == "EM_PM": alpha = np.clip((a.min(2) - 90) * 255 / 120, 0, 255)      # white glyph on navy
        else:             alpha = np.clip((200 - a.mean(2)) * 255 / 110, 0, 255)    # dark glyph on cream
        g = Image.new("RGBA", (a.shape[1], a.shape[0]), colour + (255,)); g.putalpha(Image.fromarray(alpha.astype("uint8")))
        g = g.crop(g.getbbox()); s = size / max(g.size)
        _c[key] = g.resize((max(1, int(g.width * s)), max(1, int(g.height * s))), Image.LANCZOS)
    return _c[key]


def pack(prod, h, stick_ratio=0.92, gap=10):
    p = P[prod]; box = asset(p["box"]); st = asset(p["stick"])
    bw = int(box.width * h / box.height); box = box.resize((bw, h), Image.LANCZOS)
    sh = int(h * stick_ratio); sw = int(st.width * sh / st.height); st = st.resize((sw, sh), Image.LANCZOS)
    pad = 50; c = Image.new("RGBA", (bw + gap + sw + pad * 2, h + pad * 2), (0, 0, 0, 0))
    sha = Image.new("L", c.size, 0); ImageDraw.Draw(sha).ellipse((pad - 20, pad + h - 22, pad + bw + gap + sw + 20, pad + h + 22), fill=140)
    sha = sha.filter(ImageFilter.GaussianBlur(16)); c.alpha_composite(Image.merge("RGBA", (*[Image.new("L", c.size, 0)] * 3, sha)))
    c.alpha_composite(box, (pad, pad)); c.alpha_composite(st, (pad + bw + gap, pad + h - sh))
    return c, pad, bw + gap + sw


def paste_pack(img, prod, x, y, h, grade=0.16):
    pk, pad, w = pack(prod, h)
    amb = img.crop((max(0, x), max(0, y), min(W, x + w), min(img.height, y + h))).convert("RGB").resize((1, 1), Image.BOX).getpixel((0, 0))
    rgb = pk.convert("RGB"); tint = Image.new("RGB", rgb.size, amb)
    mix = Image.blend(rgb, ImageChops.multiply(rgb, Image.blend(Image.new("RGB", rgb.size, (255, 255, 255)), tint, .6)), grade).convert("RGBA")
    mix.putalpha(pk.split()[3]); img.alpha_composite(mix, (int(x - pad), int(y - pad)))
    return (x, y, x + w, y + h)


def scrim(img, y0, y1, a0, a1, colour=(0, 0, 0)):
    y1 = min(y1, img.height); h = y1 - y0
    if h <= 0: return
    m = Image.fromarray(np.repeat(np.linspace(a0, a1, h)[:, None], W, 1).astype("uint8"))
    lay = Image.new("RGBA", (W, h), colour + (0,)); lay.putalpha(m); img.alpha_composite(lay, (0, y0))


def luma(img, box):
    return sum(img.crop(box).convert("L").resize((1, 1), Image.BOX).getpixel((0, 0)) for _ in [0])


def headline(img, y, text, ink, acc, maxw=900, size=88, shadow=True):
    """'Plain part *KEY PART*' -> plain on line 1 (Cormorant italic), key part on line 2 (bold italic, accent). Auto-fits the width."""
    d = ImageDraw.Draw(img)
    m = re.match(r"^(.*?)\*(.+?)\*(.*)$", text.strip())
    if m: a, k, b = (m.group(1).strip(), m.group(2).strip(), m.group(3).strip()); lines = [(a, False), (k, True)] if a else [(k, True)]
    else: lines = [(text.strip(), False)]
    if b if m else False: lines.append((b, False))
    while size > 54:
        fs = [F(CORM[700 if k else 500], size) for _, k in lines]
        if max(tw(d, t, f) for (t, _), f in zip(lines, fs)) <= maxw: break
        size -= 2
    y0 = y; x0, x1 = 1e9, -1e9
    for (t, key), f in zip(lines, fs):
        w = tw(d, t, f); x = (W - w) / 2
        if shadow: d.text((x + 2, y + 3), t, font=f, fill=(0, 0, 0, 120))
        d.text((x, y), t, font=f, fill=(acc if key else ink)); x0 = min(x0, x); x1 = max(x1, x + w); y += int(size * 1.0)
    return (x0, y0, x1, y), y


def subline(img, y, text, ink, size=34):
    d = ImageDraw.Draw(img); f = F(JOST, size)
    words = text.split(); lines = [""]
    for w in words:
        if tw(d, (lines[-1] + " " + w).strip(), f) > 820: lines.append(w)
        else: lines[-1] = (lines[-1] + " " + w).strip()
    x0, x1 = 1e9, -1e9; y0 = y
    for ln in lines:
        w = tw(d, ln, f); x = (W - w) / 2; d.text((x + 1, y + 2), ln, font=f, fill=(0, 0, 0, 110)); d.text((x, y), ln, font=f, fill=ink)
        x0 = min(x0, x); x1 = max(x1, x + w); y += int(size * 1.3)
    return (x0, y0, x1, y), y


def benefits_list(img, prod, x, y, isz, fsz, pitch, ink, panel=None, panel_w=None):
    p = P[prod]; d = ImageDraw.Draw(img); f = F(JOSTB, fsz); right = x
    if panel:   # soft backing so the rows stay legible on any scene
        wmax = max(tw(d, lab, f) for lab in p["labels"]) + isz + 22; pad = 24; S = 3
        h = 3 * pitch - (pitch - isz) + pad * 2; w = int(panel_w or (wmax + pad * 2))
        pl = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0)); ImageDraw.Draw(pl).rounded_rectangle((0, 0, w * S - 1, h * S - 1), 26 * S, fill=panel)
        img.alpha_composite(pl.resize((w, h), Image.LANCZOS), (int(x - pad), int(y - pad)))
    for i, lab in enumerate(p["labels"]):
        yy = y + i * pitch; g = glyph(p["em"], i + 1, isz, ink)
        img.alpha_composite(g, (int(x + (isz - g.width) / 2), int(yy + (isz - g.height) / 2)))
        d.text((x + isz + 22, yy + isz / 2), lab, font=f, fill=ink, anchor="lm"); right = max(right, x + isz + 22 + tw(d, lab, f))
        if i < 2:
            ry = int(yy + pitch - (pitch - isz) / 2); d.line((x, ry, x + (right - x) + 4, ry), fill=ink + (110,), width=2)
    return (x, y, right, y + 3 * pitch - (pitch - isz))


def right_block(img, prod, L, H, ink, panel, pack_bbox):
    """Benefits panel, price pill and URL as ONE aligned block: same width, same centre, centred vertically on the pack
    and horizontally in the space to the right of it."""
    p = P[prod]; d = ImageDraw.Draw(img); bx, by, isz, fsz, pitch = L["ben"]; big, small = (33, 21) if H == 1920 else (30, 20) if H == 1350 else (28, 19)
    f = F(JOSTB, fsz); wtext = max(tw(d, lab, f) for lab in p["labels"]) + isz + 22
    fb, fs = F(JOSTB, big), F(JOST, small); pill_w = int(tw(d, "Rs. 900", fb) + tw(d, " for a box of 15 sticks", fs) + 70)
    pad = 24; panel_w = max(int(wtext + pad * 2), pill_w); panel_h = 3 * pitch - (pitch - isz) + pad * 2; pill_h = big + 30
    gap = 16; block_h = panel_h + gap + pill_h + 18 + 32
    px0, py0, px1, py1 = pack_bbox; cx = (px1 + 40 + 1015) / 2; x0 = int(cx - panel_w / 2); top = int(py0 + (py1 - py0 - block_h) / 2)
    tx = x0 + (panel_w - wtext) / 2
    benefits_list(img, prod, tx, top + pad, isz, fsz, pitch, ink, panel=panel, panel_w=panel_w)
    pr = price_pill(img, cx, top + panel_h + gap, prod, big, small, None, fixed_w=panel_w); un = url(img, cx, pr[3] + 16, ink)
    return [("benefits", (x0, top, x0 + panel_w, top + panel_h)), ("price", pr), ("url", un)]


def combo_geom(H):
    """Heights of the Combo bottom block (packs + two-column benefits | price | offer pill | url), stacked up from the red line."""
    lo, hi = SAFE[H]; ph = 190 if H != 1080 else 170; isz, fsz, pitch = (34, 24, 56) if H != 1080 else (30, 22, 52)
    panel_h = 34 + 3 * pitch - (pitch - isz) + 36; row_h = max(panel_h, ph); big = 33 if H == 1920 else 30 if H == 1350 else 28
    pill_sz = 24 if H == 1920 else 22; total = row_h + 22 + (big + 30) + 16 + (pill_sz + 30) + 16 + 32
    return dict(top=hi - total - 4, ph=ph, isz=isz, fsz=fsz, pitch=pitch, panel_h=panel_h, row_h=row_h, big=big, small=(21 if H == 1920 else 20 if H == 1350 else 19), pill_sz=pill_sz)


def combo_block(img, H, ink, panel):
    """Combo: both real packs on the left, ONE two-column benefits panel on the right (Mornings | Nights), then the Combo price,
    the COMBO10 pill and the URL, centred. Returns the red-line boxes."""
    g = combo_geom(H); d = ImageDraw.Draw(img); chk = []; top = g["top"]; ph = g["ph"]; yy = top + (g["row_h"] - ph) / 2
    b1 = paste_pack(img, "mornings", 72, yy, ph); b2 = paste_pack(img, "nights", b1[2] + 34, yy, ph); chk += [("pack1", b1), ("pack2", b2)]
    x0 = int(b2[2] + 36); pw = 1015 - x0; py0 = int(top + (g["row_h"] - g["panel_h"]) / 2); S3 = 3
    pl = Image.new("RGBA", (pw * S3, g["panel_h"] * S3), (0, 0, 0, 0)); ImageDraw.Draw(pl).rounded_rectangle((0, 0, pw * S3 - 1, g["panel_h"] * S3 - 1), 26 * S3, fill=panel)
    img.alpha_composite(pl.resize((pw, g["panel_h"]), Image.LANCZOS), (x0, py0)); f = F(JOSTB, g["fsz"]); fh = F(JOSTB, 18); col = (pw - 40) / 2
    for ci, (em, key, head, hc) in enumerate((("EM_AM", "mornings", "MORNINGS", P["mornings"]["acc"]), ("EM_PM", "nights", "NIGHTS", P["nights"]["acc"]))):
        cx0 = x0 + 20 + col * ci; text_sp(d, cx0 + 4, py0 + 20, head, fh, hc, 4)
        for r, lab in enumerate(P[key]["labels"]):
            cy = py0 + 34 + 24 + r * g["pitch"] + g["isz"] / 2; gl = glyph(em, r + 1, g["isz"], ink)
            img.alpha_composite(gl, (int(cx0 + 4 + (g["isz"] - gl.width) / 2), int(cy - gl.height / 2))); d.text((cx0 + 4 + g["isz"] + 12, cy), lab, font=f, fill=ink, anchor="lm")
    chk.append(("benefits", (x0, py0, x0 + pw, py0 + g["panel_h"])))
    y = top + g["row_h"] + 22; pr = price_pill(img, 540, y, "nights", g["big"], g["small"], ("SILT Combo", " · Rs. 1,800 for 15 + 15 sticks"))
    pl2 = outline_pill(img, 540, pr[3] + 16, "Make it a combo – Use code COMBO10 for extra 10% off", g["pill_sz"], GOLD); un = url(img, 540, pl2[3] + 16, ink)
    return chk + [("price", pr), ("pill", pl2), ("url", un)]


def benefits_strip(img, prod, cy, ink, panel=None, isz=38, fsz=27, width=900, cx=540):
    """The three official benefit icons + labels in one row (auto-centred). Returns its bbox."""
    p = P[prod]; d = ImageDraw.Draw(img); f = F(JOSTB, fsz); h = isz + 46; x0 = int(cx - width / 2); y0 = int(cy - h / 2)
    if panel:
        S3 = 3; pl = Image.new("RGBA", (width * S3, h * S3), (0, 0, 0, 0)); ImageDraw.Draw(pl).rounded_rectangle((0, 0, width * S3 - 1, h * S3 - 1), 26 * S3, fill=panel)
        img.alpha_composite(pl.resize((width, h), Image.LANCZOS), (x0, y0))
    cell = width / 3
    for i, lab in enumerate(p["labels"]):
        g = glyph(p["em"], i + 1, isz, ink); tw_ = tw(d, lab, f); item = g.width + 14 + tw_; x = x0 + cell * i + (cell - item) / 2
        img.alpha_composite(g, (int(x), int(cy - g.height / 2))); d.text((x + g.width + 14, cy), lab, font=f, fill=ink, anchor="lm")
    return (x0, y0, x0 + width, y0 + h)


def price_pill(img, cx, y, prod, big, small, text=None, fixed_w=None):
    p = P[prod]; d = ImageDraw.Draw(img)
    main, rest = text if text else ("Rs. 900", " for a box of 15 sticks")
    fb, fs = F(JOSTB, big), F(JOST, small); w = tw(d, main, fb) + tw(d, rest, fs); h = big + 30; pw = int(fixed_w or (w + 70)); x0 = int(cx - pw / 2)
    S = 3; pl = Image.new("RGBA", (pw * S, h * S), (0, 0, 0, 0)); ImageDraw.Draw(pl).rounded_rectangle((0, 0, pw * S - 1, h * S - 1), h * S // 2, fill=p["pill_bg"] + (255,))
    img.alpha_composite(pl.resize((pw, h), Image.LANCZOS), (x0, y)); tx = x0 + (pw - w) / 2
    d.text((tx, y + h / 2), main, font=fb, fill=p["pill_fg"], anchor="lm"); d.text((tx + tw(d, main, fb), y + h / 2 + 3), rest, font=fs, fill=p["pill_fg"], anchor="lm")
    return (x0, y, x0 + pw, y + h)


def outline_pill(img, cx, y, text, size, colour):
    d = ImageDraw.Draw(img); f = F(JOST, size); w = int(tw(d, text, f) + 64); h = size + 30; x0 = int(cx - w / 2)
    S = 3; pl = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0)); ImageDraw.Draw(pl).rounded_rectangle((2, 2, w * S - 3, h * S - 3), h * S // 2, outline=colour + (255,), width=5)
    img.alpha_composite(pl.resize((w, h), Image.LANCZOS), (x0, y)); d.text((cx, y + h / 2), text, font=f, fill=colour, anchor="mm")
    return (x0, y, x0 + w, y + h)


def url(img, cx, y, ink, size=24, sp=6):
    d = ImageDraw.Draw(img); f = F(JOST, size); t = "siltnutrition.com"; w = tw(d, t, f, sp)
    text_sp(d, cx - w / 2, y, t, f, ink + (225,), sp); return (cx - w / 2, y, cx + w / 2, y + size + 6)


# ---------- plate -> canvas ----------
def canvas(plate, H, zoom=1.0, dx=0, dy=0, bgmode="blur"):
    """Cover the plate to 1080x1920*zoom, then take the centred 1080xH window shifted by dy; gaps are filled with a blurred copy."""
    base = max(W / plate.width, 1920 / plate.height) * zoom
    fw, fh = round(plate.width * base), round(plate.height * base); fg = plate.resize((fw, fh), Image.LANCZOS)
    x = (W - fw) // 2 + dx; y = (1920 - fh) // 2 + dy - (1920 - H) // 2
    if bgmode == "right":   # plain fill: each row takes the colour of the plate's right edge strip, rows beyond the plate the top / bottom edge
        arr = np.asarray(fg.convert("RGB")).astype(float); k = max(4, fw // 30); rowc = arr[:, -k:].mean(1); col = np.zeros((H, 3))
        for yy in range(H):
            r = yy - y; col[yy] = rowc[0] if r < 0 else (rowc[-1] if r >= fh else rowc[r])
        bb = Image.fromarray(np.repeat(col[:, None, :], W, 1).astype("uint8")).filter(ImageFilter.GaussianBlur(25)).convert("RGBA")
    else:
        cv = max(W / plate.width, H / plate.height) * 1.12
        bb = plate.resize((round(plate.width * cv), round(plate.height * cv)), Image.LANCZOS)
        bb = bb.crop(((bb.width - W) // 2, (bb.height - H) // 2, (bb.width - W) // 2 + W, (bb.height - H) // 2 + H)).filter(ImageFilter.GaussianBlur(40)).convert("RGBA")
    m = Image.new("L", (fw, fh), 255); a = np.asarray(m).astype(float); fe = 90
    ramp = np.linspace(0, 255, fe)
    if x > 0: a[:, :fe] = np.minimum(a[:, :fe], ramp[None, :])
    if y > 0: a[:fe, :] = np.minimum(a[:fe, :], ramp[:, None])
    if x + fw < W: a[:, -fe:] = np.minimum(a[:, -fe:], ramp[::-1][None, :])
    if y + fh < H: a[-fe:, :] = np.minimum(a[-fe:, :], ramp[::-1][:, None])
    fg.putalpha(Image.fromarray(a.astype("uint8"))); bb.alpha_composite(fg, (x, y)); return bb


def subject_center(plate):
    """Vertical centre (in 1080x1920 frame coordinates) of the busy band of a plate = where the subject is."""
    g = np.asarray(plate.convert("L").resize((108, 192), Image.LANCZOS)).astype(float)
    e = np.abs(np.diff(g, axis=1)).mean(1)[:-1] + np.abs(np.diff(g, axis=0)).mean(1)[:-0 or None][:191][:191].mean() * 0
    gy = np.abs(np.diff(g, axis=0)).mean(1); e = np.abs(np.diff(g, axis=1)).mean(1)[:191] + gy
    e = np.convolve(e, np.ones(5) / 5, mode="same"); lo, hi = 19, 163
    thr = 0.22 * e[lo:hi].max(); idx = [i for i in range(lo, hi) if e[i] > thr]
    if not idx: return 960, 960
    return idx[0] * 10, (idx[-1] + 1) * 10


# ---------- layouts ----------
LAY = {   # every y below the headline is computed from the row above it (fixed gaps), so the spacing is the same in every size
    1920: dict(head=300, pack=(96, 920, 290), ben=(560, 945, 42, 30, 58), gap=26, cpack=(232, 780, 250), cgap=28, sub_gap=14, news_ph=400),
    1350: dict(head=168, pack=(90, 885, 290), ben=(545, 912, 40, 28, 58), gap=30, cpack=(232, 790, 225), cgap=22, sub_gap=12, news_ph=400),
    1080: dict(head=92, pack=(90, 705, 255), ben=(530, 728, 36, 26, 54), gap=28, cpack=(240, 640, 180), cgap=20, sub_gap=10, news_ph=330),
}


def build_one(spec, H):
    prod = spec["product"]; combo = prod == "combo"; p = P["nights" if prod == "combo" else prod]; L = LAY[H]
    plate = Image.open(spec["plate"]).convert("RGBA")
    if str(H) in spec.get("dy", {}): dy = spec["dy"][str(H)]
    else:   # put the subject between the headline block and the pack block
        head_bottom = L["head"] + (250 if spec.get("sub") else 200); pack_top = combo_geom(H)["top"] if combo else L["pack"][1]
        st, sb = subject_center(plate); off = (1920 - H) / 2
        target = (head_bottom + pack_top) / 2 + (30 if H == 1920 else 0); dy = target - ((st + sb) / 2 - off)
        top_c = st + dy - off
        if top_c < head_bottom + 50: dy += head_bottom + 50 - top_c      # the subject must clear the headline block first
        sb_c = sb + dy - off; lim = pack_top - 26
        if sb_c > lim: dy -= sb_c - lim
        if st + dy - off < head_bottom + 40: dy = head_bottom + 40 - (st - off)   # headline clearance wins
        dy = int(max(-300, min(300, dy)))
    img = canvas(plate, H, spec.get("zoom", 1.0), spec.get("dx", 0), dy)
    bad = []; lo, hi = SAFE[H]
    top_l = luma(img, (0, L["head"] - 20, W, L["head"] + 260))
    dark_ink = top_l > 150 and not spec.get("force_light")
    ink = (43, 33, 28) if dark_ink else p["ink"]; acc = (150, 70, 18) if dark_ink else (p["acc"] if not combo else GOLD)
    if not dark_ink: scrim(img, 0, L["head"] + 330, 150 if H == 1920 else 130, 0)
    bb, y = headline(img, L["head"], spec["headline"], ink, acc, size=88 if H == 1920 else (84 if H == 1350 else 70), shadow=not dark_ink); chk = [("headline", bb)]
    if spec.get("sub"): b2, y = subline(img, y + L["sub_gap"], spec["sub"], ink, 34 if H != 1080 else 30); chk.append(("sub", b2))
    if combo:
        chk += combo_block(img, H, ink, (6, 16, 40, 150))
    else:
        x, yy, h = L["pack"]; pb = paste_pack(img, prod, x, yy, h); chk.append(("pack", pb))
        chk += right_block(img, prod, L, H, ink, ((255, 248, 236, 150) if dark_ink else (6, 16, 40, 105)), pb)
    for n, (x0, y0, x1, y1) in chk:
        if y0 < lo - 1 or y1 > hi + 1 or x0 < SIDE - 1 or x1 > W - SIDE + 1: bad.append((n, int(x0), int(y0), int(x1), int(y1)))
    return img.convert("RGB"), bad


# ---------- newspaper front page (editorial format: the masthead may carry the name "SILT Nutrition") ----------
def build_news(spec, H):
    prod = spec["product"]; p = P[prod]; L = LAY[H]; d0 = None
    paper = (243, 236, 220); ink = (31, 58, 107) if prod == "nights" else (43, 33, 28); rule = ink
    img = Image.new("RGBA", (W, H), paper + (255,)); rng = np.random.default_rng(7)
    n = (rng.normal(0, 3.0, (H, W, 1)) * np.ones((1, 1, 3))); arr = np.clip(np.asarray(img.convert("RGB")).astype(float) + n, 0, 255).astype("uint8"); img = Image.fromarray(arr).convert("RGBA")
    d = ImageDraw.Draw(img); lo, hi = SAFE[H]; top = lo + 25; chk = []
    f = ImageFont.truetype(GEORGIA_B, 84 if H == 1920 else 74); t = "SILT Nutrition"; w = tw(d, t, f); d.text(((W - w) / 2, top), t, font=f, fill=ink); chk.append(("masthead", ((W - w) / 2, top, (W + w) / 2, top + 90)))
    y = top + 104; d.line((110, y, W - 110, y), fill=rule, width=4); d.line((110, y + 9, W - 110, y + 9), fill=rule, width=2); y += 26
    tag = {"nights": "A BEDTIME DRINK MIX", "mornings": "A DAILY DRINK MIX"}[prod]; ft = F(JOST, 22); tw_ = tw(d, tag, ft, 7); text_sp(d, (W - tw_) / 2, y, tag, ft, ink, 7); y += 58
    m = re.match(r"^(.*?)\*(.+?)\*(.*)$", spec["headline"]); parts = [x for x in ([m.group(1).strip(), m.group(2).strip(), m.group(3).strip()] if m else [spec["headline"]]) if x]
    size = 84 if H == 1920 else 76
    while size > 50:
        fh = ImageFont.truetype(GEORGIA_B, size)
        if max(tw(d, s, fh) for s in parts) <= 860: break
        size -= 2
    hy0 = y
    for s in parts: d.text((110, y), s, font=fh, fill=ink); y += int(size * 1.08)
    chk.append(("headline", (110, hy0, 110 + max(tw(d, s, fh) for s in parts), y)))
    if spec.get("sub"):
        fi = ImageFont.truetype(GEORGIA_I, 32); words = spec["sub"].split(); lines = [""]
        for wd in words:
            if tw(d, (lines[-1] + " " + wd).strip(), fi) > 860: lines.append(wd)
            else: lines[-1] = (lines[-1] + " " + wd).strip()
        y += 8; sy0 = y
        for ln in lines: d.text((110, y), ln, font=fi, fill=ink); y += 42
        chk.append(("deck", (110, sy0, 970, y)))
    y += 22; ph = max(170, min(L["news_ph"], hi - 118 - 26 - 6 - 104 - y)); box = (110, y, W - 110, y + ph)
    # framed studio photo: smooth gradient + the real pack
    g = np.linspace(0, 1, ph)[:, None, None]; c0 = np.array((22, 44, 96) if prod == "nights" else (246, 190, 110)); c1 = np.array((8, 22, 60) if prod == "nights" else (200, 120, 52))
    pg = (c0 * (1 - g) + c1 * g) * np.ones((1, W - 220, 3)); photo = Image.fromarray(np.clip(pg, 0, 255).astype("uint8")).convert("RGBA")
    ph_h = int(ph * 0.66); pk, pad, pw_ = pack(prod, ph_h); photo.alpha_composite(pk, ((photo.width - pw_) // 2 - pad, ph - ph_h - pad - int(ph * .08)))
    img.alpha_composite(photo, (110, y)); d.rectangle(box, outline=rule, width=3); chk.append(("photo", box)); y += ph + 20
    bs = benefits_strip(img, prod, y + 42, ink, None, 34, 25, 860); d.line((110, bs[3] + 8, W - 110, bs[3] + 8), fill=rule, width=2); chk.append(("benefits", bs)); y = bs[3] + 24
    pr = "Rs. 900 for a box of 15 sticks"; fp = ImageFont.truetype(GEORGIA_B, 40); pwid = tw(d, pr, fp)
    d.rectangle((110, y, W - 110, y + 118), outline=rule, width=3); d.text((W / 2, y + 40), pr, font=fp, fill=ink, anchor="mm"); fu = F(JOST, 24)
    text_sp(d, (W - tw(d, "siltnutrition.com", fu, 6)) / 2, y + 74, "siltnutrition.com", fu, ink, 6); chk.append(("price", (110, y, W - 110, y + 118)))
    bad = []
    for nm, (x0, y0, x1, y1) in chk:
        if y0 < lo - 1 or y1 > hi + 1 or x0 < SIDE - 1 or x1 > W - SIDE + 1: bad.append((nm, int(x0), int(y0), int(x1), int(y1)))
    return img.convert("RGB"), bad


if __name__ == "__main__":
    specs = json.load(open(sys.argv[1], encoding="utf-8")); only = sys.argv[2:]
    for s in specs:
        if only and s["key"] not in only: continue
        os.makedirs(s["out"], exist_ok=True)
        for H, tag in ((1350, "4x5"), (1080, "1x1"), (1920, "9x16")):
            try: im, bad = (build_news if s.get("layout") == "news" else build_one)(s, H)
            except Exception as e: print(s["key"], tag, "ERROR", repr(e)); raise
            im.save(f"{s['out']}/{s['key']}_{tag}.jpg", quality=93)
            print(s["key"], tag, "SAFE" if not bad else "PROBLEMS " + str(bad))
