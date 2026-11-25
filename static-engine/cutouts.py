"""Cut the official SILT pack shots out of their white studio backgrounds (real product images, never redrawn)."""
import sys, numpy as np
from collections import deque
from PIL import Image, ImageFilter
A = "assets/"

def flood_cut(im, tol, grey=False):
    a = np.asarray(im).astype(int); h, w = a.shape[:2]
    cand = (255 - a).max(2) < tol
    if grey:
        sat = a.max(2) - a.min(2)
        cand |= (sat < 22) & (a.min(2) > 110)
    bg = np.zeros((h, w), bool); dq = deque()
    for y in range(h):
        for x in (0, w - 1):
            if cand[y, x]: bg[y, x] = True; dq.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if cand[y, x] and not bg[y, x]: bg[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for yy, xx in ((y+1, x), (y-1, x), (y, x+1), (y, x-1)):
            if 0 <= yy < h and 0 <= xx < w and not bg[yy, xx] and cand[yy, xx]:
                bg[yy, xx] = True; dq.append((yy, xx))
    alpha = Image.fromarray(((~bg) * 255).astype("uint8"))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
    rgba = im.convert("RGBA"); rgba.putalpha(alpha)
    return rgba.crop(rgba.getbbox())

jobs = {
  "mornings_boxstick_cut.png": ("mornings_pack_raw.png", None, 30, True),
  "nights_boxstick_cut.png": ("nights_pack_raw.png", None, 30, True),
  "mornings_stick_cut.png": ("mornings_stick_raw.png", None, 14, False),
}
for out, (src, box, tol, grey) in jobs.items():
    im = Image.open(A + src).convert("RGB")
    if box: im = im.crop(box)
    c = flood_cut(im, tol, grey); c.save(A + out); print(out, c.size)

# Mornings box alone = the left part of the box + stick cut (the plain crop clipped the box edge).
bs = Image.open(A + "mornings_boxstick_cut.png")
b = bs.crop((0, 0, 790, bs.height)); b = b.crop(b.getbbox()); b.save(A + "mornings_box_cut.png"); print("mornings_box_cut.png", b.size)
