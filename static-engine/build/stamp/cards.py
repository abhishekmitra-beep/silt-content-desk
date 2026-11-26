"""SILT engine cards: the swipe-file formats (bad news, handwritten note, chat, search result, notes list, text post, family
forward, email, don't-buy, objection, price breakdown, mistakes, open letter, us vs them, expectation vs reality, doses) drawn
entirely by the engine on a SILT background, with the real pack, price pill and URL under them (rule 35: no ChatGPT text).

  py -3 cards.py cards_spec.json [key ...]   ->  <out>/<key>_4x5.jpg _1x1.jpg _9x16.jpg + red-line check
Generic cards only: no app names, logos, likes, ratings or notification badges.
"""
import sys, os, json, re
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import stamp as S

W = 1080; CW = 860
WF = "C:/Windows/Fonts/"
def FW(name, size): return ImageFont.truetype(WF + name, size)
SEG, SEGB, INK, COUR, COURB, TIMES, TIMESB, TIMESI = "segoeui.ttf", "segoeuib.ttf", "Inkfree.ttf", "cour.ttf", "courbd.ttf", "times.ttf", "timesbd.ttf", "timesi.ttf"


def wrap(d, text, font, maxw):
    out = []
    for para in text.split("\n"):
        cur = ""
        for w in para.split():
            t = (cur + " " + w).strip()
            if d.textlength(t, font=font) > maxw and cur: out.append(cur); cur = w
            else: cur = t
        out.append(cur)
    return out


def shadowed(card, blur=22, off=14, alpha=110):
    pad = blur * 3; base = Image.new("RGBA", (card.width + pad * 2, card.height + pad * 2), (0, 0, 0, 0))
    sh = Image.new("L", base.size, 0); sh.paste(card.split()[3], (pad, pad + off)); sh = sh.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * alpha / 255))
    base.alpha_composite(Image.merge("RGBA", (*[Image.new("L", base.size, 0)] * 3, sh))); base.alpha_composite(card, (pad, pad)); return base, pad


def rrect(size, r, fill, outline=None, width=0):
    s = 3; im = Image.new("RGBA", (size[0] * s, size[1] * s), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, size[0] * s - 1, size[1] * s - 1), r * s, fill=fill, outline=outline, width=width * s)
    return im.resize(size, Image.LANCZOS)


def blank(h, fill=(255, 255, 255, 255), r=34):
    return rrect((CW, h), r, fill)


# ---------- card renderers: each returns an RGBA image CW wide (height as needed) ----------
def r_news(c, P):
    pad = 48; tmp = Image.new("RGBA", (CW, 1200)); d = ImageDraw.Draw(tmp); y = pad
    ft = FW(SEGB, 28); tw = int(d.textlength("BAD NEWS", font=ft)) + 36
    tmp.alpha_composite(rrect((tw, 50), 8, (214, 40, 40, 255)), (pad, y)); d.text((pad + 18, y + 25), "BAD NEWS", font=ft, fill=(255, 255, 255), anchor="lm"); y += 82
    fh = FW(SEGB, 60)
    for ln in wrap(d, c["head"], fh, CW - pad * 2): d.text((pad, y), ln, font=fh, fill=(20, 20, 20)); y += 74
    y += 14; d.line((pad, y, CW - pad, y), fill=(20, 20, 20), width=4); y += 30
    fs = FW(SEGB, 40)
    for ln in wrap(d, c["sub"], fs, CW - pad * 2): d.text((pad, y), ln, font=fs, fill=(30, 30, 30)); y += 54
    y += 22
    for w in (CW - pad * 2, CW - pad * 2, int((CW - pad * 2) * .55)): tmp.alpha_composite(rrect((w, 16), 8, (232, 232, 232, 255)), (pad, y)); y += 36
    y += pad - 10; card = blank(y); card.alpha_composite(tmp.crop((0, 0, CW, y)), (0, 0)); return card


def r_note(c, P):
    ln = c["lines"]; lh = 78; h = 70 + lh * len(ln) + 40; paper = Image.new("RGBA", (CW, h), (253, 250, 238, 255)); d = ImageDraw.Draw(paper)
    for i in range(len(ln) + 1): d.line((0, 62 + lh * (i + 1) - 8, CW, 62 + lh * (i + 1) - 8), fill=(196, 208, 236), width=3)
    d.line((70, 0, 70, h), fill=(232, 150, 150), width=3); f = FW(INK, 60)
    for i, t in enumerate(ln): d.text((110, 52 + lh * i), t, font=f, fill=(28, 48, 128))
    m = Image.new("L", (CW, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, CW - 1, h - 1), 10, fill=255); paper.putalpha(m)
    return paper.rotate(-2.0, expand=True, resample=Image.BICUBIC)


def bubble(text, f, maxw, fill, fg, bold=False):
    d0 = ImageDraw.Draw(Image.new("RGBA", (10, 10))); lines = wrap(d0, text, f, maxw); w = int(max(d0.textlength(t, font=f) for t in lines)) + 56; h = 38 * len(lines) + 40
    b = rrect((w, h), 30, fill); d = ImageDraw.Draw(b)
    for i, t in enumerate(lines): d.text((28, 20 + i * 38 + 19), t, font=f, fill=fg, anchor="lm")
    return b


def chat_frame(name, sub, msgs, label=None, label_name=None):
    f = FW(SEG, 36); fb = FW(SEGB, 36); parts = []
    for side, t, *bold in msgs: parts.append((side, bubble(t, fb if bold and bold[0] else f, 540, (255, 255, 255, 255) if side == "L" else (219, 244, 196, 255), (20, 20, 20))))
    h = 120 + sum(p[1].height + 20 for p in parts) + 50 + (60 if label else 0)
    card = Image.new("RGBA", (CW, h), (238, 232, 222, 255)); d = ImageDraw.Draw(card); d.rectangle((0, 0, CW, 104), fill=(250, 250, 250))
    d.ellipse((34, 22, 96, 84), fill=(196, 182, 232)); d.text((116, 36), name, font=FW(SEGB, 36), fill=(20, 20, 20), anchor="lm"); d.text((116, 74), sub, font=FW(SEG, 24), fill=(130, 130, 130), anchor="lm")
    y = 128
    if label: d.text((CW - 40, y + 10), label, font=FW(SEG, 26), fill=(120, 120, 120), anchor="ra"); y += 52
    for side, b in parts:
        x = 34 if side == "L" else CW - 34 - b.width
        if label_name and side == "L" and label_name: pass
        card.alpha_composite(b, (x, y)); y += b.height + 20
    m = Image.new("L", (CW, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, CW - 1, h - 1), 34, fill=255); card.putalpha(m); return card


def r_chat(c, P): return chat_frame(c["contact"], "online", [(s, t, *b) for s, t, *b in [(m[0], m[1], m[2] if len(m) > 2 else False) for m in c["msgs"]]])


def r_forward(c, P):
    f = FW(SEG, 38); d0 = ImageDraw.Draw(Image.new("RGBA", (10, 10))); lines = wrap(d0, c["text"], f, 640)
    h = 130 + 150 + 44 * len(lines) + 60; card = Image.new("RGBA", (CW, h), (238, 232, 222, 255)); d = ImageDraw.Draw(card); d.rectangle((0, 0, CW, 104), fill=(250, 250, 250))
    d.ellipse((34, 22, 96, 84), fill=(196, 182, 232)); d.text((116, 52), c["group"], font=FW(SEGB, 36), fill=(20, 20, 20), anchor="lm")
    bw = 720; bh = 120 + 44 * len(lines) - 4; b = rrect((bw, bh), 28, (255, 255, 255, 255)); bd = ImageDraw.Draw(b)
    bd.text((28, 30), "Forwarded", font=FW(SEG, 26), fill=(125, 125, 125), anchor="lm"); bd.text((28, 68), c["sender"], font=FW(SEGB, 32), fill=(190, 60, 120), anchor="lm")
    for i, t in enumerate(lines): bd.text((28, 112 + i * 44), t, font=f, fill=(20, 20, 20), anchor="lm")
    card.alpha_composite(b, (34, 140)); h2 = 140 + bh + 50; card = card.crop((0, 0, CW, h2))
    m = Image.new("L", (CW, h2), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, CW - 1, h2 - 1), 34, fill=255); card.putalpha(m); return card


def r_search(c, P):
    pad = 40; tmp = Image.new("RGBA", (CW, 1100)); d = ImageDraw.Draw(tmp); y = pad
    tmp.alpha_composite(rrect((CW - pad * 2, 84), 42, (243, 243, 243, 255)), (pad, y)); d.ellipse((pad + 28, y + 28, pad + 56, y + 56), outline=(110, 110, 110), width=4)
    d.text((pad + 80, y + 42), c["query"], font=FW(SEG, 38), fill=(30, 30, 30), anchor="lm"); y += 120
    fu, ft, fs = FW(SEG, 26), FW(SEGB, 42), FW(SEG, 32); tl = wrap(d, c["title"], ft, CW - pad * 2 - 60); sl = wrap(d, c["snippet"], fs, CW - pad * 2 - 60)
    bh = 40 + 36 + 52 * len(tl) + 12 + 42 * len(sl) + 30; tmp.alpha_composite(rrect((CW - pad * 2, bh), 18, (238, 249, 220, 255)), (pad, y))
    yy = y + 30; d.text((pad + 30, yy), c.get("url", "siltnutrition.com"), font=fu, fill=(30, 120, 50)); yy += 46
    for t in tl: d.text((pad + 30, yy), t, font=ft, fill=(26, 60, 190)); yy += 52
    yy += 12
    for t in sl: d.text((pad + 30, yy), t, font=fs, fill=(70, 70, 70)); yy += 42
    y += bh + 34
    for w in (CW - pad * 2 - 60, CW - pad * 2 - 160, CW - pad * 2 - 100): tmp.alpha_composite(rrect((w, 16), 8, (232, 232, 232, 255)), (pad + 10, y)); y += 34
    y += pad; card = blank(y); card.alpha_composite(tmp.crop((0, 0, CW, y)), (0, 0)); return card


def r_notes(c, P):
    pad = 52; tmp = Image.new("RGBA", (CW, 1200)); d = ImageDraw.Draw(tmp); y = pad
    ft = FW(SEGB, 54)
    for ln in wrap(d, c["title"], ft, CW - pad * 2): d.text((pad, y), ln, font=ft, fill=(20, 20, 20)); y += 66
    y += 18; fi = FW(SEG, 40)
    for i, it in enumerate(c["items"]):
        t = (f"{i + 1}. " if not c.get("plain") else "") + it
        for ln in wrap(d, t, fi, CW - pad * 2):
            d.text((pad, y), ln, font=fi, fill=(40, 40, 40));
            if i in c.get("strike", []): d.line((pad - 6, y + 28, pad + d.textlength(ln, font=fi) + 6, y + 22), fill=(40, 40, 40), width=4)
            y += 54
    y += 14; fl = FW(SEGB, 42)
    for ln in wrap(d, c["last"], fl, CW - pad * 2): d.text((pad, y), ln, font=fl, fill=(20, 20, 20)); y += 56
    y += pad - 6; card = blank(y, (255, 252, 240, 255)); card.alpha_composite(tmp.crop((0, 0, CW, y)), (0, 0)); return card


def r_post(c, P):
    pad = 48; tmp = Image.new("RGBA", (CW, 1000)); d = ImageDraw.Draw(tmp); y = pad
    d.ellipse((pad, y, pad + 88, y + 88), fill=P["avatar"]); d.text((pad + 44, y + 44), "S", font=FW(SEGB, 46), fill=(255, 255, 255), anchor="mm")
    d.text((pad + 112, y + 44), c.get("name", "SILT Nutrition"), font=FW(SEGB, 40), fill=(20, 20, 20), anchor="lm"); y += 130
    ft = FW(SEG, 52)
    for ln in wrap(d, c["text"], ft, CW - pad * 2): d.text((pad, y), ln, font=ft, fill=(20, 20, 20)); y += 68
    y += pad - 10; card = blank(y); card.alpha_composite(tmp.crop((0, 0, CW, y)), (0, 0)); return card


def r_email(c, P):
    pad = 48; tmp = Image.new("RGBA", (CW, 1200)); d = ImageDraw.Draw(tmp); y = 30
    for i, col in enumerate(((230, 110, 100), (240, 190, 90), (120, 200, 120))): d.ellipse((pad + i * 38, y, pad + i * 38 + 22, y + 22), fill=col)
    y += 66; fs = FW(SEGB, 52)
    for ln in wrap(d, c["subject"], fs, CW - pad * 2): d.text((pad, y), ln, font=fs, fill=(20, 20, 20)); y += 64
    y += 14; d.line((pad, y, CW - pad, y), fill=(220, 220, 220), width=3); y += 30; fb = FW(SEG, 38)
    for ln in wrap(d, c["body"], fb, CW - pad * 2): d.text((pad, y), ln, font=fb, fill=(45, 45, 45)); y += 54
    y += 20; fsg = FW(SEG, 36)
    for ln in wrap(d, c["sig"], fsg, CW - pad * 2): d.text((pad, y), ln, font=fsg, fill=(110, 110, 110)); y += 48
    y += pad - 8; card = blank(y); card.alpha_composite(tmp.crop((0, 0, CW, y)), (0, 0)); return card


def r_big(c, P):
    tmp = Image.new("RGBA", (CW, 900)); d = ImageDraw.Draw(tmp); f = S.F(S.CORM[500], 92); y = 20
    for ln in wrap(d, c["line"], f, CW - 60):
        w = d.textlength(ln, font=f); d.text(((CW - w) / 2 + 2, y + 3), ln, font=f, fill=(0, 0, 0, 110)); d.text(((CW - w) / 2, y), ln, font=f, fill=P["ink"]); y += 100
    y += 22; fs = S.F(S.JOST, 38)
    for ln in wrap(d, c["small"], fs, CW - 80): w = d.textlength(ln, font=fs); d.text(((CW - w) / 2, y), ln, font=fs, fill=P["ink"]); y += 52
    return tmp.crop((0, 0, CW, y + 20))


def r_objection(c, P):
    tmp = Image.new("RGBA", (CW, 1400)); d = ImageDraw.Draw(tmp); f = S.F(S.CORM[700], 82); y = 10; q = "\u201c" + c["quote"] + "\u201d"
    for ln in wrap(d, q, f, CW - 50): w = d.textlength(ln, font=f); d.text(((CW - w) / 2 + 2, y + 3), ln, font=f, fill=(0, 0, 0, 110)); d.text(((CW - w) / 2, y), ln, font=f, fill=P["ink"]); y += 92
    y += 34; pad = 44; ans = Image.new("RGBA", (CW, 600)); ad = ImageDraw.Draw(ans); fa = FW(SEGB, 42); yy = pad
    for ln in wrap(ad, c["answer"], fa, CW - pad * 2): ad.text((pad, yy), ln, font=fa, fill=(20, 20, 20)); yy += 58
    yy += pad - 8; card = blank(yy); card.alpha_composite(ans.crop((0, 0, CW, yy)), (0, 0)); tmp.alpha_composite(card, (0, y)); return tmp.crop((0, 0, CW, y + yy + 6))


def r_receipt(c, P):
    pad = 52; tmp = Image.new("RGBA", (CW, 1000)); d = ImageDraw.Draw(tmp); y = pad; f, fb = FW(COUR, 40), FW(COURB, 40)
    t = c["title"]; w = d.textlength(t, font=fb); d.text(((CW - w) / 2, y), t, font=fb, fill=(20, 20, 20)); y += 66
    d.line((pad, y, CW - pad, y), fill=(120, 120, 120), width=3); y += 30
    for lab, val in c["rows"]:
        d.text((pad, y), lab, font=f, fill=(30, 30, 30));
        if val: d.text((CW - pad, y), val, font=f, fill=(30, 30, 30), anchor="ra")
        y += 58
    y += 6; d.line((pad, y, CW - pad, y), fill=(120, 120, 120), width=3); y += 28
    ftt = FW(COURB, 54); d.text((pad, y), c["total"][0], font=ftt, fill=(15, 15, 15)); d.text((CW - pad, y), c["total"][1], font=ftt, fill=(15, 15, 15), anchor="ra"); y += 80
    if c.get("note"):
        fn = FW(COURB, 34); w = d.textlength(c["note"], font=fn); y += 10; d.text(((CW - w) / 2, y), c["note"], font=fn, fill=(60, 60, 60)); y += 56
    y += pad - 10; card = blank(y, (255, 253, 246, 255), 18); card.alpha_composite(tmp.crop((0, 0, CW, y)), (0, 0)); return card


def r_list(c, P):
    pad = 52; tmp = Image.new("RGBA", (CW, 1000)); d = ImageDraw.Draw(tmp); y = pad; ft = FW(SEGB, 54)
    d.text((pad, y), c["title"], font=ft, fill=(20, 20, 20)); y += 90; f = FW(SEG, 48); fn = FW(SEGB, 48)
    for i, it in enumerate(c["items"]):
        d.ellipse((pad, y, pad + 64, y + 64), fill=P["accent_dark"]); d.text((pad + 32, y + 32), str(i + 1), font=fn, fill=(255, 255, 255), anchor="mm")
        d.text((pad + 96, y + 32), it, font=f, fill=(25, 25, 25), anchor="lm")
        if i == c.get("circle"):
            w = d.textlength(it, font=f); tmp.alpha_composite(rrect((int(w + 120), 86), 43, (0, 0, 0, 0), outline=(210, 150, 30, 255), width=6), (pad + 70, y - 11))
        y += 104
    y += pad - 40; card = blank(y); card.alpha_composite(tmp.crop((0, 0, CW, y)), (0, 0)); return card


def r_letter(c, P):
    pad = 60; tmp = Image.new("RGBA", (CW, 1100)); d = ImageDraw.Draw(tmp); y = pad; f = FW(TIMESI, 58)
    for ln in wrap(d, c["body"], f, CW - pad * 2): d.text((pad, y), ln, font=f, fill=(40, 34, 30)); y += 76
    y += 30; fs = FW(TIMES, 42); d.text((CW - pad, y), c["sign"], font=fs, fill=(70, 60, 54), anchor="ra"); y += 70
    y += pad - 24; card = blank(y, (250, 245, 232, 255), 18); card.alpha_composite(tmp.crop((0, 0, CW, y)), (0, 0)); return card


def r_compare(c, P):
    pad = 30; cols = [290, 270, 270]; fh, fr = FW(SEGB, 32), FW(SEG, 34); fb = FW(SEGB, 36); rh = 104
    h = 110 + rh * len(c["rows"]) + 30; card = blank(h); d = ImageDraw.Draw(card)
    x = pad + cols[0]; d.rounded_rectangle((pad + cols[0] + cols[1] + 6, 24, pad + sum(cols) - 6, h - 24), 22, fill=P["highlight"])
    d.text((x + cols[1] / 2, 62), c["cols"][0], font=fh, fill=(80, 80, 80), anchor="mm"); d.text((x + cols[1] + cols[2] / 2, 62), c["cols"][1], font=fh, fill=P["hl_text"], anchor="mm")
    for i, (lab, a, b) in enumerate(c["rows"]):
        y = 110 + rh * i + rh / 2; d.line((pad, 110 + rh * i, CW - pad, 110 + rh * i), fill=(230, 230, 230), width=3)
        d.text((pad + 6, y), lab, font=fr, fill=(40, 40, 40), anchor="lm"); d.text((x + cols[1] / 2, y), a, font=fr, fill=(110, 110, 110), anchor="mm"); d.text((x + cols[1] + cols[2] / 2, y), b, font=fb, fill=P["hl_text"], anchor="mm")
    return card


def r_split(c, P):
    h = 420; card = Image.new("RGBA", (CW, h), (0, 0, 0, 0)); d = ImageDraw.Draw(card)
    l = rrect((CW // 2 - 8, h), 34, (96, 100, 112, 255)); r = rrect((CW // 2 - 8, h), 34, P["accent_fill"] + (255,)); card.alpha_composite(l, (0, 0)); card.alpha_composite(r, (CW // 2 + 8, 0))
    for i, (lab, word) in enumerate((c["left"], c["right"])):
        cx = CW // 4 + i * CW // 2; col = (235, 235, 240) if i == 0 else P["on_accent"]
        d.text((cx, 120), lab.upper(), font=S.F(S.JOSTB, 34), fill=col, anchor="mm"); d.text((cx, 245), word, font=S.F(S.CORM[700], 100), fill=col, anchor="mm")
    return card


def r_doses(c, P):
    pad = 52; tmp = Image.new("RGBA", (CW, 1300)); d = ImageDraw.Draw(tmp); y = pad; ft = FW(SEGB, 52)
    d.text((pad, y), c["title"], font=ft, fill=(20, 20, 20)); y += 66; d.text((pad, y), c["note"], font=FW(SEG, 30), fill=(120, 120, 120)); y += 56; d.line((pad, y, CW - pad, y), fill=(20, 20, 20), width=5); y += 18
    f, fb = FW(SEG, 36), FW(SEGB, 36)
    for lab, val in c["rows"]:
        ls = wrap(d, lab, f, 560); d.text((pad, y + 14), ls[0], font=f, fill=(30, 30, 30));
        if len(ls) > 1: d.text((pad, y + 54), ls[1], font=f, fill=(30, 30, 30))
        d.text((CW - pad, y + 14), val, font=fb, fill=(20, 20, 20), anchor="ra"); y += 66 if len(ls) == 1 else 108; d.line((pad, y, CW - pad, y), fill=(210, 210, 210), width=3)
    y += pad - 20; card = blank(y); card.alpha_composite(tmp.crop((0, 0, CW, y)), (0, 0)); return card


R = dict(news=r_news, note=r_note, chat=r_chat, forward=r_forward, search=r_search, notes=r_notes, post=r_post, email=r_email, big=r_big,
         objection=r_objection, receipt=r_receipt, list=r_list, letter=r_letter, compare=r_compare, split=r_split, doses=r_doses)
PAL = {"nights": dict(avatar=(31, 58, 107), accent_dark=(31, 58, 107), highlight=(222, 232, 250, 255), hl_text=(31, 58, 107), accent_fill=(159, 192, 255), on_accent=(10, 24, 60), ink=(244, 240, 230)),
       "mornings": dict(avatar=(200, 110, 40), accent_dark=(200, 110, 40), highlight=(253, 235, 200, 255), hl_text=(150, 70, 18), accent_fill=(235, 184, 88), on_accent=(43, 33, 28), ink=(43, 33, 28)),
       "combo": dict(avatar=(31, 58, 107), accent_dark=(31, 58, 107), highlight=(253, 235, 200, 255), hl_text=(31, 58, 107), accent_fill=(235, 200, 120), on_accent=(10, 24, 60), ink=(244, 240, 230))}


def background(prod, H):
    y = np.linspace(0, 1, H)[:, None, None]
    if prod == "nights": c0, c1 = np.array((26, 52, 112)), np.array((8, 20, 54)); a = c0 * (1 - y) + c1 * y; a = a * np.ones((1, W, 3))
    elif prod == "mornings": c0, c1 = np.array((250, 200, 124)), np.array((206, 126, 58)); a = c0 * (1 - y) + c1 * y; a = a * np.ones((1, W, 3))
    else:
        x = np.linspace(0, 1, W)[None, :, None]; amb = np.array((238, 160, 80)); nav = np.array((20, 40, 96)); a = (amb * (1 - x) + nav * x) * (1 - 0.35 * y) * np.ones((H, 1, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype("uint8")).convert("RGBA")


def build(spec, H):
    prod = spec["product"]; P = PAL[prod]; combo = prod == "combo"; L = S.LAY[H]; lo, hi = S.SAFE[H]
    img = background(prod, H); chk = []
    # bottom block
    if combo:
        x, yy, h = L["cpack"]; b1 = S.paste_pack(img, "mornings", x, yy, h); b2 = S.paste_pack(img, "nights", b1[2] + 56, yy, h); chk += [("pack1", b1), ("pack2", b2)]
        big, small = (33, 21) if H == 1920 else (30, 20) if H == 1350 else (28, 19)
        pr = S.price_pill(img, 540, yy + h + L["cgap"], "nights", big, small, ("SILT Combo", " · Rs. 1,800 for 15 + 15 sticks")); pl = S.outline_pill(img, 540, pr[3] + 18, "Make it a combo – Use code COMBO10 for extra 10% off", 24 if H == 1920 else 22, S.GOLD)
        un = S.url(img, 540, pl[3] + 18, P["ink"]); chk += [("price", pr), ("pill", pl), ("url", un)]; block_top = yy
    else:
        x, yy, h = L["pack"]; chk.append(("pack", S.paste_pack(img, prod, x, yy, h))); bx = L["ben"][0]; cx = (bx + 1010) / 2 - 25
        big, small = (33, 21) if H == 1920 else (30, 20) if H == 1350 else (28, 19)
        bx, by, isz, fsz, pitch = L["ben"]; panel = (255, 248, 236, 150) if prod == "mornings" else (6, 16, 40, 105)
        bb_ = S.benefits_list(img, prod, bx, by, isz, fsz, pitch, P["ink"], panel=panel); chk.append(("benefits", bb_))
        pr = S.price_pill(img, cx, bb_[3] + L["gap"], prod, big, small); un = S.url(img, cx, pr[3] + 20, P["ink"]); chk += [("price", pr), ("url", un)]; block_top = yy
    card = R[spec["fmt"]](spec["data"], P)
    top = lo + 24; avail = block_top - 34 - top; maxw = 900
    sc = min(1.0, avail / card.height, maxw / card.width) if spec["fmt"] != "split" else min(1.0, avail / card.height)
    if sc < 1: card = card.resize((int(card.width * sc), int(card.height * sc)), Image.LANCZOS)
    if spec["fmt"] not in ("big", "objection", "split"): sh, pad = shadowed(card)
    else: sh, pad = card, 0
    cx0 = (W - card.width) // 2; cy0 = top + max(0, (avail - card.height) // 2)
    img.alpha_composite(sh, (cx0 - pad, cy0 - pad)); chk.append(("card", (cx0, cy0, cx0 + card.width, cy0 + card.height)))
    bad = []
    for n, (x0, y0, x1, y1) in chk:
        if y0 < lo - 1 or y1 > hi + 1 or x0 < S.SIDE - 1 or x1 > W - S.SIDE + 1: bad.append((n, int(x0), int(y0), int(x1), int(y1)))
    return img.convert("RGB"), bad, sc


if __name__ == "__main__":
    specs = json.load(open(sys.argv[1], encoding="utf-8")); only = sys.argv[2:]
    for s in specs:
        if only and s["key"] not in only: continue
        os.makedirs(s["out"], exist_ok=True)
        for H, tag in ((1350, "4x5"), (1080, "1x1"), (1920, "9x16")):
            im, bad, sc = build(s, H); im.save(f"{s['out']}/{s['key']}_{tag}.jpg", quality=93)
            print(s["key"], tag, "SAFE" if not bad else "PROBLEMS " + str(bad), f"scale {sc:.2f}" if sc < 0.92 else "")
