"""Leaked-chat static, plain: heading + the founder / doctor chat screenshot exactly as it is. No pack, benefits, price or URL (team, 26 Nov).
py -3 leak_plain.py <screenshot> <out_dir> <key>"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import stamp as S
W = 1080; SRC, OUT, KEY = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(OUT, exist_ok=True)
shot = Image.open(SRC).convert("RGB")
def bg(H):
    top, bot = np.array([11, 20, 46]), np.array([5, 10, 26]); t = np.linspace(0, 1, H)[:, None, None]
    return Image.fromarray((top * (1 - t) + bot * t).repeat(W, 1).astype("uint8")).convert("RGBA")
for H, tag in ((1350, "4x5"), (1080, "1x1"), (1920, "9x16")):
    lo, hi = S.SAFE[H]; img = bg(H); d = ImageDraw.Draw(img); k = {1920: 1.0, 1350: 0.95, 1080: 0.78}[H]
    f1, f2 = S.F(S.JOSTB, int(78 * k)), S.F(S.JOSTB, int(34 * k)); acc, ink = (159, 192, 255), (244, 240, 230)
    a = "LEAKED CHAT"; w1 = S.tw(d, a, f1, 5); y = lo + 10; chk = []
    S.text_sp(d, (W - w1) / 2, y, a, f1, acc, 5); chk.append((( W - w1) / 2, y, (W + w1) / 2, y + int(78 * k))); y += int(98 * k)
    for ln in ["BETWEEN OUR FOUNDER AND", "A DOCTOR CUSTOMER"] if k < 0.9 or True else []:
        pass
    line = "BETWEEN OUR FOUNDER AND A DOCTOR CUSTOMER"; w2 = S.tw(d, line, f2, 2)
    lines = [line] if w2 <= 940 else ["BETWEEN OUR FOUNDER", "AND A DOCTOR CUSTOMER"]
    for ln in lines:
        w2 = S.tw(d, ln, f2, 2); S.text_sp(d, (W - w2) / 2, y, ln, f2, ink, 2); chk.append(((W - w2) / 2, y, (W + w2) / 2, y + int(40 * k))); y += int(48 * k)
    y += int(26 * k); avail_h = hi - 10 - y; cw = 950; ch = round(shot.height * cw / shot.width)
    if ch > avail_h: ch = avail_h; cw = round(shot.width * ch / shot.height)
    card = shot.resize((cw, ch), Image.LANCZOS).convert("RGBA"); m = Image.new("L", card.size, 0); S3 = 3
    mm = Image.new("L", (cw * S3, ch * S3), 0); ImageDraw.Draw(mm).rounded_rectangle((0, 0, cw * S3 - 1, ch * S3 - 1), 26 * S3, fill=255); card.putalpha(mm.resize(card.size, Image.LANCZOS))
    # vertically centre the chat in the space under the heading
    cy = y + max(0, (avail_h - ch) // 2); cx = (W - cw) // 2
    sh = Image.new("RGBA", (cw + 120, ch + 120), (0, 0, 0, 0)); s2 = Image.new("L", sh.size, 0); s2.paste(card.split()[3], (60, 70)); s2 = s2.filter(ImageFilter.GaussianBlur(20)).point(lambda v: int(v * .55))
    sh.putalpha(s2); img.alpha_composite(sh, (cx - 60, cy - 60)); img.alpha_composite(card, (cx, cy)); chk.append((cx, cy, cx + cw, cy + ch))
    bad = [(int(x0), int(y0), int(x1), int(y1)) for x0, y0, x1, y1 in chk if y0 < lo - 1 or y1 > hi + 1 or x0 < S.SIDE - 1 or x1 > W - S.SIDE + 1]
    img.convert("RGB").save(f"{OUT}/{KEY}_{tag}.jpg", quality=94); print(KEY, tag, "SAFE" if not bad else "PROBLEMS " + str(bad), f"chat {cw}x{ch}")
