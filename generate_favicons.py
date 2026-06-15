"""Generate the interlocking gold wedding-rings favicon set.

Drawn at high resolution and downscaled with LANCZOS for crisp anti-aliasing.
Geometry mirrors favicon.svg (a 64-unit grid). Run: python generate_favicons.py
"""
from PIL import Image, ImageDraw, ImageChops

S = 1024
k = S / 64.0


def C(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


GOLD_TOP = C("EBD27A")
GOLD_MID = C("D4AF37")
GOLD_BOT = C("B5860C")
OUTLINE = C("8A6B1C")
CREAM = C("FBF7EE")


def vgrad(size):
    img = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        if t < 0.5:
            tt = t / 0.5
            col = tuple(int(GOLD_TOP[i] + (GOLD_MID[i] - GOLD_TOP[i]) * tt) for i in range(3))
        else:
            tt = (t - 0.5) / 0.5
            col = tuple(int(GOLD_MID[i] + (GOLD_BOT[i] - GOLD_MID[i]) * tt) for i in range(3))
        d.line([(0, y), (size, y)], fill=col)
    return img


GRAD = vgrad(S)


def band(draw, cx, cy, r, width, fill):
    """Stroke a circle of centre-line radius r and given width."""
    R = r + width / 2.0
    draw.ellipse([cx - R, cy - R, cx + R, cy + R], outline=fill, width=int(round(width)))


def make_ring(cx, cy, r, gw, ow):
    layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    band(d, cx, cy, r, gw + 2 * ow, OUTLINE + (255,))        # dark rim
    m = Image.new("L", (S, S), 0)
    band(ImageDraw.Draw(m), cx, cy, r, gw, 255)              # gold band mask
    layer.paste(GRAD, (0, 0), m)
    return layer


r, gw, ow = 14 * k, 5 * k, 0.8 * k
left = make_ring(23 * k, 33 * k, r, gw, ow)
right = make_ring(41 * k, 33 * k, r, gw, ow)

base = Image.new("RGBA", (S, S), (0, 0, 0, 0))
base.alpha_composite(left)
base.alpha_composite(right)                                  # right over left everywhere

# weave: restore left OVER right at the upper crossing only
topx, topy = 32 * k, (33 - 10.72) * k
region = Image.new("L", (S, S), 0)
ImageDraw.Draw(region).ellipse([topx - 7 * k, topy - 7 * k, topx + 7 * k, topy + 7 * k], fill=255)
topmask = ImageChops.multiply(left.split()[3], region)
base.paste(left, (0, 0), topmask)

# transparent PNGs
for sz, name in [(96, "favicon-96.png"), (32, "favicon-32.png"), (16, "favicon-16.png")]:
    base.resize((sz, sz), Image.LANCZOS).save(name)

# multi-resolution .ico
base.resize((256, 256), Image.LANCZOS).save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

# Apple touch icon on a cream tile (iOS shows transparent areas as black otherwise)
apple = Image.new("RGBA", (S, S), CREAM + (255,))
apple.alpha_composite(base)
apple.resize((180, 180), Image.LANCZOS).convert("RGB").save("apple-touch-icon.png")

print("favicons generated")
