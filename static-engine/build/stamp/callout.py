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


def build(spec, H):
    prod = spec["product"]; p = S.P[prod]; L = S.LAY[H]; lo, hi = S.SAFE[H]
    plate = Image.open(spec["plate"]).convert("RGBA")
    # stick position in the 1920 plate frame -> paste the real stick at its true shape over the blank sachet
    st = S.asset(p["stick"])
    plate1 = Image.new("RGBA", (W, 1920)); base = max(W / plate.width, 1920 / plate.height); fw, fh = round(plate.width * base), round(plate.height * base)
    plate1.alpha_composite(plate.resize((fw, fh), Image.LANCZOS), ((W - fw) // 2, (1920 - fh) // 2))
    a = np.asarray(plate1.convert("RGB")).astype(int); white = (a.min(2) > 150) & ((a.max(2) - a.min(2)) < 45)       # the blank sachet
    ys_, xs_ = np.nonzero(white); keep = (xs_ > 300) & (xs_ < 800); ys_, xs_ = ys_[keep], xs_[keep]
    x1_, x99_ = np.percentile(xs_, 0.5), np.percentile(xs_, 99.5); sy = int(np.percentile(ys_, 0.5)); sw = int(x99_ - x1_ + 10); sh = int(sw * st.height / st.width); sx = int((x1_ + x99_) / 2 - sw / 2)
    stk = st.resize((sw, sh), Image.LANCZOS); orig = plate1.copy(); plate1.alpha_composite(stk, (sx, sy))
    # keep the thumb and finger in FRONT of the stick: where the original pixel is skin, restore it
    o = np.asarray(orig.convert("RGB")).astype(int); skin = ((o[:, :, 0] - o[:, :, 2]) > 38) & (o[:, :, 0] > 95); m = Image.fromarray((skin * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))
    box = Image.new("L", (W, 1920), 0); box.paste(m.crop((sx - 4, sy - 4, sx + sw + 4, sy + sh + 4)), (sx - 4, sy - 4)); plate1.paste(orig, (0, 0), box)
    big, small = (33, 21) if H == 1920 else (30, 20) if H == 1350 else (28, 19)
    py = hi - 112; sc_y = py - 60
    img0 = None; band_top = L["head"] + 250; band_bot = sc_y - 41 - 22; z = min(1.0, (band_bot - band_top) / sh); tcy = (band_top + band_bot) / 2
    pcx, pcy = sx + sw / 2, sy + sh / 2
    dy = tcy - pcy * z - (1920 - 1920 * z) / 2 + (1920 - H) / 2
    fw_ = round(1080 * z); img = S.canvas(plate1, H, z, (fw_ - W) // 2, int(dy), bgmode="right"); d = ImageDraw.Draw(img); ink, acc = p["ink"], p["acc"]
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
    isz, fsz = (40, 28) if H == 1920 else (36, 26) if H == 1350 else (32, 24); panel = (255, 248, 236, 150) if prod == "mornings" else (6, 16, 40, 105)
    bs = S.benefits_strip(img, prod, sc_y, cink, panel, isz, fsz); chk.append(("benefits", bs))
    pr = S.price_pill(img, 540, py, prod, big, small); un = S.url(img, 540, pr[3] + 20, cink); chk += [("price", pr), ("url", un)]
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
