"""Remove the 'SiLT Nutrition | A BEDTIME DRINK MIX' lockup from the earlier library statics (team, 26 Nov: no lockup on any static).
Finds the wordmark by multi-scale template matching on a stroke map, masks the lockup strokes in its row band, inpaints.
py -3 remove_lockup.py <src_dir> <out_dir> [name-substring ...]"""
import cv2, numpy as np, sys, os, glob, json
SRC = sys.argv[1]; OUT = sys.argv[2]; ONLY = sys.argv[3:]
os.makedirs(OUT, exist_ok=True)
def cmap(im):
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY); bg = cv2.medianBlur(g, 21); return np.abs(g.astype(np.int16) - bg.astype(np.int16)).astype(np.uint8)
ref = cv2.imread("../../library/png/SILT_Nights_Another-hour-gone_4x5_1080x1350.png"); rc = cmap(ref)
TPL = rc[36:126, 245:430]; TPL = cv2.GaussianBlur(TPL, (3, 3), 0)       # wordmark + divider; (4:5 offsets: x 255-375, y 45-118)
REF_X0, REF_Y0 = 245, 36
def find(c, H):
    cs = cv2.GaussianBlur(c, (3, 3), 0); best = (-1, None)
    for s in np.arange(0.6, 1.2, 0.04):
        t = cv2.resize(TPL, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        reg = cs[0:int(H * 0.33), 150:950]
        if reg.shape[0] < t.shape[0] or reg.shape[1] < t.shape[1]: continue
        r = cv2.matchTemplate(reg, t, cv2.TM_CCOEFF_NORMED); _, mx, _, loc = cv2.minMaxLoc(r)
        if mx > best[0]: best = (mx, (loc[0] + 150, loc[1], s))
    return best
rep = {}
for f in sorted(glob.glob(SRC + "/*.png")):
    n = os.path.basename(f)
    if ONLY and not any(o in n for o in ONLY): continue
    im = cv2.imread(f); H = im.shape[0]; c = cmap(im); sc, (x, y, s) = find(c, H)
    # lockup box in this image: template origin is REF_X0/REF_Y0 offset (x 245, y 36); wordmark band 45..118 -> rows y+9s .. y+82s
    rows0, rows1 = int(y + 3 * s), int(y + 88 * s); cols0 = int(x - 4 * s); cols1 = int(x + (835 - 245 + 8) * s)
    mask = np.zeros(im.shape[:2], np.uint8); band = c[rows0:rows1, cols0:cols1]
    thr = max(26, int(band.mean() + 1.5 * band.std() * 0)) ; m = (band > 26).astype(np.uint8) * 255
    mask[rows0:rows1, cols0:cols1] = m; mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=1)
    out = cv2.inpaint(im, mask, 6, cv2.INPAINT_TELEA); cv2.imwrite(os.path.join(OUT, n), out)
    rep[n] = dict(score=round(float(sc), 2), x=int(x), y=int(y), s=round(float(s), 2), px=int((mask > 0).sum()))
    print(n[5:-14].ljust(46), rep[n])
json.dump(rep, open(os.path.join(OUT, "_report.json"), "w"), indent=1)
