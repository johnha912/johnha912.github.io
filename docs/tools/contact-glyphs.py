"""Outline "Let's talk." from the self-hosted Google Sans exactly as the Contact h1 renders it
(wght 600, features ss01 + kerning, letter-spacing -0.035em, line-height 1.04; an opsz axis is
used only if the font file still has one) and print an inline SVG, one <path> per glyph.
Units: 1000 per em; y = 0 is the baseline; the viewBox is the h1's line box.
usage: python docs/tools/contact-glyphs.py site/assets/fonts/google-sans-latin.woff2 > out.svg
needs: pip install --user fonttools brotli uharfbuzz; paste the output into the Contact h1."""
import io
import sys

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

TEXT, WGHT, OPSZ, TRACK, LH = "Let’s talk.", 600, 32, -0.035, 1.04

tt = TTFont(sys.argv[1])
buf = io.BytesIO()
tt.flavor = None
tt.save(buf)
upem = tt["head"].unitsPerEm
asc, desc = tt["hhea"].ascent, -tt["hhea"].descent
axes = {a.axisTag for a in tt["fvar"].axes}

face = hb.Face(buf.getvalue())
font = hb.Font(face)
font.set_variations({k: v for k, v in {"wght": WGHT, "opsz": OPSZ}.items() if k in axes})
b = hb.Buffer()
b.add_str(TEXT)
b.guess_segment_properties()
hb.shape(font, b, {"kern": True, "ss01": True})

k = 1000 / upem


class Pen(SVGPathPen):
    """SVG path pen that scales to 1000/em, flips y and offsets x, with integer coordinates."""

    def __init__(self, dx):
        super().__init__(None, ntos=lambda v: str(round(v)))
        self.dx = dx

    def _t(self, p):
        return ((p[0] + self.dx) * k, -p[1] * k)

    def moveTo(self, p): super().moveTo(self._t(p))
    def lineTo(self, p): super().lineTo(self._t(p))
    def qCurveTo(self, *ps): super().qCurveTo(*[self._t(p) if p else p for p in ps])
    def curveTo(self, *ps): super().curveTo(*[self._t(p) for p in ps])


x, paths = 0, []
for info, pos in zip(b.glyph_infos, b.glyph_positions):
    pen = Pen(x + pos.x_offset)
    font.draw_glyph_with_pen(info.codepoint, pen)
    d = pen.getCommands()
    if d:
        paths.append(d)
    x += pos.x_advance + TRACK * upem

half = (LH * upem - (asc + desc)) / 2  # CSS half-leading (negative here)
top = -(half + asc) * k
w, h = round(x * k), round(LH * 1000)
print(f'<svg class="morph" viewBox="0 {round(top)} {w} {h}" aria-hidden="true" focusable="false">'
      + "".join(f'<path d="{d}"/>' for d in paths) + "</svg>")
print(f"width {x / upem:.4f}em, glyphs {len(paths)}, axes {sorted(axes)}", file=sys.stderr)
