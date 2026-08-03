"""Generate crisp transparent paw assets for PWA + floating button."""
from __future__ import annotations

import base64
import io
import os
import re

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "landing-page", "src", "assets")
SVG_PATH = os.path.join(ASSETS, "logoDownload.svg")
PAW_BUTTON = os.path.join(ASSETS, "logoDownload-paw.png")
CARPI_PATH = os.path.join(ASSETS, "carpi.jpg")


def load_source_paw() -> Image.Image:
    if os.path.isfile(SVG_PATH):
        data = open(SVG_PATH, encoding="utf-8").read()
        m = re.search(r'(?:xlink:)?href="data:image/png;base64,([^"]+)"', data)
        if m:
            raw = base64.b64decode(m.group(1))
            img = Image.open(io.BytesIO(raw)).convert("RGBA")
            print("source: logoDownload.svg embedded PNG", img.size)
            return img
    if os.path.isfile(PAW_BUTTON):
        print("source: existing logoDownload-paw.png")
        return Image.open(PAW_BUTTON).convert("RGBA")
    print("source: carpi.jpg (fallback)")
    return Image.open(CARPI_PATH).convert("RGBA")


def remove_dark_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if r < 40 and g < 40 and b < 40:
                pixels[x, y] = (0, 0, 0, 0)
                continue
            if r < 55 and g < 55 and b < 55:
                fade = int(255 * ((max(r, g, b) - 40) / 15))
                pixels[x, y] = (r, g, b, max(0, min(255, fade)))
    return img


def make_square(
    img: Image.Image,
    size: int,
    pad_ratio: float,
    shift_x_ratio: float = 0.0,
) -> Image.Image:
    """Crop to content, center on transparent square (optional right shift), resize."""
    bbox = img.getbbox()
    cropped = img.crop(bbox) if bbox else img
    cw, ch = cropped.size
    side = max(cw, ch)
    pad = int(side * pad_ratio)
    canvas = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
    ox = (canvas.size[0] - cw) // 2 + int(side * shift_x_ratio)
    oy = (canvas.size[1] - ch) // 2
    ox = max(0, min(ox, canvas.size[0] - cw))
    oy = max(0, min(oy, canvas.size[1] - ch))
    canvas.paste(cropped, (ox, oy), cropped)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def save_png(img: Image.Image, path: str) -> None:
    img.save(path, "PNG", optimize=True)
    print("wrote", path, img.size)


def main() -> None:
    raw = remove_dark_background(load_source_paw())

    # Botón flotante: misma composición que el SVG (sin cropear), a 512px.
    button_paw = raw.resize((512, 512), Image.Resampling.LANCZOS)
    save_png(button_paw, PAW_BUTTON)

    targets = [
        os.path.join(ROOT, "frontend", "public", "icons"),
        os.path.join(ROOT, "landing-page", "public", "icons"),
    ]

    # Íconos PWA (NO el botón flotante): leve shift a la derecha para percibirse centrada
    ICON_SHIFT = 0.035
    sizes_any = {
        "icon-192.png": 192,
        "icon-512.png": 512,
        "icon-1024.png": 1024,
    }

    for folder in targets:
        os.makedirs(folder, exist_ok=True)

        for name, size in sizes_any.items():
            icon = make_square(raw, size, pad_ratio=0.04, shift_x_ratio=ICON_SHIFT)
            save_png(icon, os.path.join(folder, name))

        apple_size = 180
        apple_paw = make_square(raw, apple_size, pad_ratio=0.06, shift_x_ratio=ICON_SHIFT)
        apple = Image.new("RGBA", (apple_size, apple_size), (248, 250, 252, 255))
        apple.paste(apple_paw, (0, 0), apple_paw)
        save_png(apple, os.path.join(folder, "apple-touch-icon.png"))

        for size in (192, 512, 1024):
            bg = Image.new("RGBA", (size, size), (248, 250, 252, 255))
            inner = int(size * 0.78)
            icon = make_square(raw, inner, pad_ratio=0.02, shift_x_ratio=ICON_SHIFT)
            ox = (size - inner) // 2
            oy = (size - inner) // 2
            bg.paste(icon, (ox, oy), icon)
            save_png(bg, os.path.join(folder, f"icon-maskable-{size}.png"))


if __name__ == "__main__":
    main()
