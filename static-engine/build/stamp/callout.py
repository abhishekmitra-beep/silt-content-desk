"""Hand-held stick with call-outs (idea from a competitor ad, rebuilt in the SILT look). ChatGPT makes only the hand plate
holding a BLANK sachet; the engine pastes the REAL stick file over it, draws five hairlines to short labels, the headline,
price and URL.   py -3 callout.py callout_spec.json
spec: [{key, product, headline, calls:[5 labels], plate, out, stick:{x,y,h}  (stick top-left in 1080x1920 plate coords)}]
"""
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import stamp as S
W = 1080


def apply_stick(plate1, st, prod):
    """Chroma-key version: ChatGPT makes the hand plate with a pure-green blank sachet. The green gives the exact outline (no rim,
    no guessing), its luminance gives the light / crimp shading that is multiplied onto the REAL stick artwork, and the thumb
    stays in front because it is simply not green."""
    a = np.asarray(plate1.convert("RGB")).astype(float); r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    key = g - np.maximum(r, b)
    hard = key > 45
    ys, xs = np.nonzero(hard)
    # biggest blob only: columns / rows that carry real mass
    cols = np.nonzero(hard.sum(0) > 8)[0]; x0, x1 = int(cols.min()), int(cols.max())
    rows = np.nonzero(hard[:, x0:x1 + 1].sum(1) > 8)[0]; y0, y1 = int(rows.min()), int(rows.max())
    sw, sh = x1 - x0 + 1, y1 - y0 + 1
    soft = np.clip((key - 2) / 10.0, 0, 1); win = np.zeros_like(soft); win[max(0, y0 - 6):y1 + 7, max(0, x0 - 6):x1 + 7] = 1; soft *= win
    mi = Image.fromarray((soft * 255).astype("uint8")).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(0.8))   # 2 px wider than the green: no green fringe
    PAD = 10
    ar = st.resize((sw, sh), Image.LANCZOS); base = Image.new("RGBA", (sw, sh), tuple(int(v) for v in np.asarray(ar.convert("RGB")).reshape(-1, 3).mean(0)) + (255,)); base.alpha_composite(ar)
    # shading from the green channel (saturated green: its brightness is the photographed light)
    Lg = np.asarray(Image.fromarray(np.clip(g, 0, 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))).astype(float)
    Lc = Lg[y0:y1 + 1, x0:x1 + 1]; inside = hard[y0:y1 + 1, x0:x1 + 1]; ref = np.percentile(Lc[inside], 70)
    shade = np.clip(1 + (Lc / ref - 1) * 2.4, 0.40, 1.22)
    rgb = np.asarray(base.convert("RGB")).astype(float) * shade[:, :, None]
    hi_ = np.clip((Lc / ref - 1.04) * 3.0, 0, 0.30)[:, :, None]; rgb = rgb + (255 - rgb) * hi_ * 0.5
    rgbp = np.pad(rgb, ((PAD, PAD), (PAD, PAD), (0, 0)), mode="edge")
    over = Image.fromarray(np.clip(rgbp, 0, 255).astype("uint8")).convert("RGBA")
    out = plate1.copy(); ox, oy = x0 - PAD, y0 - PAD; alpha = mi.crop((ox, oy, ox + over.width, oy + over.height)); out.paste(over, (ox, oy), alpha)
    return out, x0, y0, sw, sh


def build(spec, H):
    prod = spec["product"]; p = S.P[prod]; L = S.LAY[H]; lo, hi = S.SAFE[H]
    plate = Image.open(spec["plate"]).convert("RGBA")
    # stick position in the 1920 plate frame -> paste the real stick at its true shape over the blank sachet
    st = S.asset(p["stick"])
    plate1 = Image.new("RGBA", (W, 1920)); base = max(W / plate.width, 1920 / plate.height); fw, fh = round(plate.width * base), round(plate.height * base)
    plate1.alpha_composite(plate.resize((fw, fh), Image.LANCZOS), ((W - fw) // 2, (1920 - fh) // 2))
    plate1, sx, sy, sw, sh = apply_stick(plate1, st, prod)
    big, small = (33, 21) if H == 1920 else (30, 20) if H == 1350 else (28, 19)
    py = hi - 112; sc_y = py - 60
    img0 = None; band_top = L["head"] + 250; band_bot = sc_y - 41 - 22; z = min(1.0, (band_bot - band_top) / sh); tcy = (band_top + band_bot) / 2
    pcx, pcy = sx + sw / 2, sy + sh / 2
    dy = tcy - pcy * z - (1920 - 1920 * z) / 2 + (1920 - H) / 2
    fw_ = round(1080 * z); img = S.canvas(plate1, H, z, (fw_ - W) // 2, int(dy), bgmode="right"); d = ImageDraw.Draw(img); ink, acc = p["ink"], p["acc"]
    if prod == "mornings":
        arr = np.asarray(img.convert("RGB")).astype(float); yr = min(H - 1, L["head"] + 300); ref = arr[yr, 20:200].mean(0); fade = np.clip(1 - np.arange(H) / max(1, yr), 0, 1) ** 0.8
        top = Image.new("RGBA", (W, H), tuple(int(v) for v in ref) + (0,)); top.putalpha(Image.fromarray((np.repeat(fade[:, None], W, 1) * 235).astype("uint8"))); img.alpha_composite(top)
    S.scrim(img, 0, L["head"] + 330, 150 if H == 1920 else 130, 0)
    bb, y = S.headline(img, L["head"], spec["headline"], ink, acc, size=88 if H == 1920 else (84 if H == 1350 else 70)); chk = [("headline", bb)]
    ww, hh = sw * z, sh * z; scx = pcx * z; scy = tcy
    f = S.F(S.JOSTB, 26 if H != 1080 else 24); cink, cacc = ((43, 33, 28), (176, 92, 24)) if prod == "mornings" else (ink, acc)   # light apricot below the headline: dark call-outs
    ys = [scy - hh * .40, scy - hh * .20, scy + hh * .00, scy + hh * .20, scy + hh * .40]
    for i, (lab, (side, fx, fy)) in enumerate(zip(spec["calls"], spec["call_pts"])):
        dx, dyy = scx - ww / 2 + fx * ww, scy - hh / 2 + fy * hh; ly = ys[i]; lines = lab.split("|"); tw_ = max(S.tw(d, t, f, 3) for t in lines)
        if side == "R": tx = scx + ww / 2 + 80; ex = tx - 12
        else: tx = scx - ww / 2 - 80 - tw_; ex = tx + tw_ + 12
        d.line((dx, dyy, (dx + ex) / 2, ly), fill=cink + (215,), width=2); d.line(((dx + ex) / 2, ly, ex, ly), fill=cink + (215,), width=2); d.ellipse((dx - 6, dyy - 6, dx + 6, dyy + 6), fill=cacc)
        for k, t in enumerate(lines): S.text_sp(d, tx, ly - 13 + (k - (len(lines) - 1) / 2) * 30, t, f, cink, 3)
        chk.append((f"call{i}", (tx, ly - 16 * len(lines), tx + tw_, ly + 16 * len(lines))))
    # price + url
    isz, fsz = (32, 24) if H == 1920 else (32, 23) if H == 1350 else (30, 22); PCX = 690;   # hand sits lower-left: panels go to the right of it
    panel = (255, 248, 236, 150) if prod == "mornings" else (6, 16, 40, 105)
    bs = S.benefits_strip(img, prod, sc_y, cink, panel, isz, fsz, width=650, cx=PCX); chk.append(("benefits", bs))
    pr = S.price_pill(img, PCX, py, prod, big, small); un = S.url(img, PCX, pr[3] + 20, cink); chk += [("price", pr), ("url", un)]
    bad = []
    for n, (x0, y0, x1, y1) in chk:
        if y0 < lo - 1 or y1 > hi + 1 or x0 < S.SIDE - 1 or x1 > W - S.SIDE + 1: bad.append((n, int(x0), int(y0), int(x1), int(y1)))
    return img.convert("RGB"), bad


if __name__ == "__main__":
    specs = json.load(open(sys.argv[1], encoding="utf-8")); only = sys.argv[2:]
    for s in specs:
        if only and s["key"] not in only: continue
        os.makedirs(s["out"], exist_ok=True)
        for H, tag in ((1350, "4x5"), (1080, "1x1"), (1920, "9x16")):
            im, bad = build(s, H); im.save(f"{s['out']}/{s['key']}_{tag}.jpg", quality=93); print(s["key"], tag, "SAFE" if not bad else "PROBLEMS " + str(bad))
