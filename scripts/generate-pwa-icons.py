"""Generate transparent paw PWA icons from carpi.jpg."""
from __future__ import annotations

import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def remove_black_bg(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = pixels[x, y]
            if r < 45 and g < 45 and b < 45:
                pixels[x, y] = (0, 0, 0, 0)
    return img


def make_square(img: Image.Image, size: int) -> Image.Image:
    bbox = img.getbbox()
    cropped = img.crop(bbox) if bbox else img
    cw, ch = cropped.size
    side = max(cw, ch)
    pad = int(side * 0.08)
    canvas = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
    ox = (canvas.size[0] - cw) // 2
    oy = (canvas.size[1] - ch) // 2
    canvas.paste(cropped, (ox, oy), cropped)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    carpi_path = os.path.join(ROOT, "landing-page", "src", "assets", "carpi.jpg")
    paw = remove_black_bg(Image.open(carpi_path))

    preview = make_square(paw, 512)
    preview.save(os.path.join(ROOT, "landing-page", "src", "assets", "carpi-pata.png"), "PNG")

    targets = [
        os.path.join(ROOT, "frontend", "public", "icons"),
        os.path.join(ROOT, "landing-page", "public", "icons"),
    ]
    sizes = {
        "icon-192.png": 192,
        "icon-512.png": 512,
        "apple-touch-icon.png": 180,
    }

    for folder in targets:
        os.makedirs(folder, exist_ok=True)
        for name, size in sizes.items():
            icon = make_square(paw, size)
            out = os.path.join(folder, name)
            if name == "apple-touch-icon.png":
                bg = Image.new("RGBA", (size, size), (15, 23, 42, 255))
                bg.paste(icon, (0, 0), icon)
                bg.save(out, "PNG")
            else:
                icon.save(out, "PNG")
            print("wrote", out)


if __name__ == "__main__":
    main()
