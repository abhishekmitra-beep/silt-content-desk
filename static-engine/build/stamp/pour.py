"""'One stick. A STEADIER MORNING.' pour static, engine version (team 26 Nov: the ChatGPT-drawn one was soft).
ChatGPT makes only the scene: a man's hand pouring a pure-green blank sachet into a glass. The engine keys the green out, warps the REAL
stick artwork onto it (tilted), then stamps the headline, five paper tags, the real pack, price and URL, all sharp, in 3 sizes.
py -3 pour.py <plate.png> <out_dir> <key>"""
import sys, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import stamp as S
W = 1080
PLATE, OUT, KEY = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
TAGS = ["80 mg Caffeine", "200 mg L-Theanine", "5 g Prebiotic Fibre", "6 Billion Probiotics", "Vitamins D3, K2, B12, C"]
ANG = [4, -3, 3, -2.5, 2.5]; XOFF = [0, 22, -6, 26, 4]


def key_stick(plate1):
    """Replace the green sachet by the real stick artwork at the same tilt; returns the new plate and the stick's centre (plate coords)."""
    a = np.asarray(plate1.convert("RGB")).astype(float); r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    key = g - np.maximum(r, b); hard = (key > 45).astype("uint8")
    n, lab, stats, _ = cv2.connectedComponentsWithStats(hard, 8); k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA])); blob = (lab == k).astype("uint8")
    cnts, _ = cv2.findContours(blob, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); cnt = max(cnts, key=cv2.contourArea)
    (cx, cy), (rw, rh), ang = cv2.minAreaRect(cnt); box = cv2.boxPoints(((cx, cy), (rw, rh), ang))
    # long axis u: from the hand end (upper-left) to the pouring end (lower-right)
    e = [box[(i + 1) % 4] - box[i] for i in range(4)]; lens = [np.hypot(*v) for v in e]; i = int(np.argmax(lens)); u = e[i] / lens[i]
    if u[0] < 0: u = -u
    Ld = max(rw, rh); Wd = min(rw, rh); right = np.array([u[1], -u[0]])
    art = S.asset("mornings_stick_cut.png"); aw, ah = art.size
    # artwork without its cut-out edge: crop a few pixels in, fill any transparent corner from its neighbours (no pale rim)
    art = art.crop((8, 14, aw - 8, ah - 14)); aw, ah = art.size; arr = np.asarray(art); hole = (arr[:, :, 3] < 250).astype("uint8") * 255
    rgb0 = cv2.inpaint(np.ascontiguousarray(arr[:, :, :3]), hole, 4, cv2.INPAINT_TELEA); base = Image.fromarray(rgb0).convert("RGBA")
    c = np.array([cx, cy]); src = np.float32([[0, 0], [aw, 0], [0, ah]])
    dst = np.float32([c + (-.5) * Wd * right + (-.5) * Ld * u, c + (.5) * Wd * right + (-.5) * Ld * u, c + (-.5) * Wd * right + (.5) * Ld * u])
    M = cv2.getAffineTransform(src, dst)
    # supersample: warp the artwork at 4x inside the stick's box, then average down (no aliasing, crisp print)
    ys_, xs_ = np.nonzero(blob); X0, X1, Y0, Y1 = max(0, xs_.min() - 14), min(plate1.width, xs_.max() + 15), max(0, ys_.min() - 14), min(plate1.height, ys_.max() + 15); SS = 4
    dst4 = (dst - np.float32([X0, Y0])) * SS; M4 = cv2.getAffineTransform(src, dst4.astype(np.float32))
    warp = cv2.warpAffine(np.asarray(base.convert("RGB")), M4, ((X1 - X0) * SS, (Y1 - Y0) * SS), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    warp = cv2.resize(warp, (X1 - X0, Y1 - Y0), interpolation=cv2.INTER_AREA).astype(float)
    # alpha: the keyed green (soft edge); thumb and fingers stay in front because they are not green
    kc = key[Y0:Y1, X0:X1]; bc = blob[Y0:Y1, X0:X1]; near = cv2.dilate(bc, np.ones((13, 13), np.uint8)).astype(float)
    soft = np.clip((kc - 8) / 12.0, 0, 1) * near
    mi = Image.fromarray((soft * 255).astype("uint8")).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    # light: the green's brightness inside the shape only (edges blend with the backdrop and would draw a dark rim), pushed out to the rim
    gc = np.clip(g[Y0:Y1, X0:X1], 0, 255).astype("uint8"); inner = cv2.erode(bc, np.ones((7, 7), np.uint8))
    ring = ((cv2.dilate(bc, np.ones((15, 15), np.uint8)) > 0) & (inner == 0)).astype("uint8") * 255
    gfix = cv2.inpaint(gc, ring, 5, cv2.INPAINT_TELEA); Lg = cv2.GaussianBlur(gfix.astype(np.float32), (0, 0), 1.2)
    ref = float(np.median(Lg[inner > 0])); shade = np.clip(1 + (Lg / ref - 1) * 1.0, 0.82, 1.10) * 1.05
    rgb = np.clip(warp * shade[:, :, None], 0, 255)
    over = Image.fromarray(rgb.astype("uint8")).convert("RGBA"); out = plate1.copy(); out.paste(over, (X0, Y0), mi)
    return out, (cx, cy), (Ld, Wd), u


def tag(img, cx, cy, text, ang, size):
    f = S.F(S.JOSTB, size); d0 = ImageDraw.Draw(img); w = int(S.tw(d0, text, f)) + 44; h = size + 30; s3 = 3
    t = Image.new("RGBA", (w * s3, h * s3), (0, 0, 0, 0)); td = ImageDraw.Draw(t)
    # torn paper strip: cream, slightly irregular short edges
    rng = np.random.RandomState(abs(hash(text)) % 9999); jl = [int(rng.randint(0, 5 * s3)) for _ in range(4)]
    td.polygon([(jl[0], 0), (w * s3 - jl[1], 0), (w * s3, h * s3 // 2 + jl[2] - 6), (w * s3 - jl[3], h * s3), (0, h * s3), (jl[2], h * s3 // 2 - 5)], fill=(246, 234, 210, 255))
    td.text((w * s3 // 2, h * s3 // 2 - 2 * s3), text, font=S.F(S.JOSTB, size * s3), fill=(43, 33, 28, 255), anchor="mm")
    t = t.resize((w * 2, h * 2), Image.LANCZOS).rotate(ang, resample=Image.BICUBIC, expand=True)   # 2x then back: keeps edges clean
    t = t.resize((t.width // 2, t.height // 2), Image.LANCZOS)
    sh = Image.new("L", t.size, 0); sh.paste(t.split()[3].point(lambda v: int(v * .5)), (3, 6)); sh = sh.filter(ImageFilter.GaussianBlur(5))
    lay = Image.new("RGBA", t.size, (30, 12, 0, 0)); lay.putalpha(sh)
    x0, y0 = int(cx - t.width / 2), int(cy - t.height / 2); img.alpha_composite(lay, (x0, y0)); img.alpha_composite(t, (x0, y0))
    return (x0, y0, x0 + t.width, y0 + t.height)


plate = Image.open(PLATE).convert("RGBA")
p1 = Image.new("RGBA", (W, 1920)); bs = max(W / plate.width, 1920 / plate.height); fw, fh = round(plate.width * bs), round(plate.height * bs)
p1.alpha_composite(plate.resize((fw, fh), Image.LANCZOS), ((W - fw) // 2, (1920 - fh) // 2))
p1, (scx, scy), (Ld, Wd), u = key_stick(p1)
# measured on plate pour2 (1080x1920 frame): upper arm top, lower hand bottom, glass top, powder stream x
ARM_TOP, HAND_BOTTOM, GLASS_TOP, STREAM_X = 500, 1215, 945, 585
p = S.P["mornings"]; ink = p["ink"]; acc = p["acc"]


def place(p1, H, z, y_arm_target):
    """Scale the plate by z, put its upper-arm line at y_arm_target, and fill the gaps by repeating the edge pixels (softened)."""
    fw, fh = round(1080 * z), round(1920 * z); sc = np.asarray(p1.convert("RGB").resize((fw, fh), Image.LANCZOS))
    xo = (1080 - fw) // 2; yo = int(round(y_arm_target - ARM_TOP * z))
    big = cv2.copyMakeBorder(sc, 400, 400, 400, 400, cv2.BORDER_REPLICATE); pad = cv2.GaussianBlur(big, (0, 0), 8)
    mask = np.ones(big.shape[:2], np.float32); mask[400:400 + fh, 400:400 + fw] = 0; mask = cv2.GaussianBlur(mask, (0, 0), 6)[:, :, None]
    # soften the seam: keep the sharp pixels inside the plate, the blurred repeat outside
    mix = (big * (1 - mask) + pad * mask).astype("uint8")
    out = mix[400 - yo:400 - yo + H, 400 - xo:400 - xo + 1080]
    return Image.fromarray(out).convert("RGBA"), xo, yo


for H, tag_ in ((1350, "4x5"), (1080, "1x1"), (1920, "9x16")):
    L = S.LAY[H]; lo, hi = S.SAFE[H]; big, small = (30, 20) if H != 1920 else (31, 20); hs = 88 if H == 1920 else (84 if H == 1350 else 70)
    arm_t = L["head"] + 2 * hs + 26; z = 1.0
    img, xo, yo = place(p1, H, z, arm_t); chk = []
    def to_c(px, py): return xo + px * z, yo + py * z
    S.scrim(img, 0, L["head"] + 330, 140 if H == 1920 else 120, 0)
    bb, y = S.headline(img, L["head"], "One stick. *A STEADIER MORNING.*", ink, acc, size=hs, maxw=760); chk.append(("headline", bb))
    # five paper tags in the right column, between the headline and the glass
    tsz = 30 if H == 1920 else 28 if H == 1350 else 25; pitch = tsz * 2.6
    g_top = to_c(0, GLASS_TOP)[1]; span = g_top - 20 - arm_t; need = 4 * pitch + tsz + 30
    ty = arm_t + max(0, (span - need) / 2) + (tsz + 30) / 2; tx = 810
    for i, t in enumerate(TAGS):
        r = tag(img, tx + XOFF[i], ty + i * pitch, t, ANG[i], tsz); chk.append((f"tag{i}", r))
    # left column under the left hand: pack, price pill, URL (bottom-aligned to the red line)
    CX = 268; ph = {1920: 250, 1350: 215, 1080: 190}[H]; pr_h = big + 30; url_h = 34
    y_url = hi - 6 - url_h; y_pill = y_url - 16 - pr_h; y_pack = y_pill - 22 - ph
    left_hand_bottom = to_c(0, 835)[1]
    _, _, pw = S.pack("mornings", ph); pb = S.paste_pack(img, "mornings", int(CX - pw / 2), y_pack, ph); chk.append(("pack", pb))
    pr = S.price_pill(img, CX, y_pill, "mornings", big, small); un = S.url(img, CX, y_url, ink, size=22, sp=5); chk += [("price", pr), ("url", un)]
    if y_pack < left_hand_bottom + 8: chk.append(("pack_hits_hand", (0, 0, 0, 9999)))
    bad = [(n, int(x0), int(y0), int(x1), int(y1)) for n, (x0, y0, x1, y1) in chk if y0 < lo - 1 or y1 > hi + 1 or x0 < S.SIDE - 1 or x1 > W - S.SIDE + 1]
    img.convert("RGB").save(f"{OUT}/{KEY}_{tag_}.jpg", quality=94); print(KEY, tag_, "SAFE" if not bad else "PROBLEMS " + str(bad), f"pack_top={y_pack} hand_bottom={left_hand_bottom:.0f}")
