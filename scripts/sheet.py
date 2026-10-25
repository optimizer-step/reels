import sys, glob
from PIL import Image, ImageDraw
files = sys.argv[2:]
out = sys.argv[1]
w, h = 360, 640
cols = min(6, len(files))
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 28)), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((w, h), Image.LANCZOS)
    x, y = (i % cols) * w, (i // cols) * (h + 28)
    sheet.paste(im, (x, y + 28))
    d.text((x + 6, y + 6), f.split("/")[-1], fill=(255, 255, 0))
sheet.save(out)
