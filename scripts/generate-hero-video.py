#!/usr/bin/env python3
"""Generate hero showcase video — close-up terminal with DevOps commands."""

from __future__ import annotations

import math
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Install Pillow: python3 -m venv .venv-video && .venv-video/bin/pip install pillow")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "media"
FRAMES_DIR = ROOT / ".hero-video-frames"

W, H = 1280, 720
FPS = 24
DURATION_SEC = 18
TOTAL_FRAMES = FPS * DURATION_SEC

# Basedash terminal palette
BG = (0, 0, 0)
TERM_BG = (5, 6, 7)
TERM_BORDER = (51, 51, 51)
TITLE_BAR = (10, 11, 12)
PROMPT = (63, 203, 127)  # mint
TEXT = (232, 234, 238)  # bone white
MUTED = (179, 179, 179)  # ash gray
CURSOR = (153, 132, 216)  # lavender

FONT_PATHS = [
    "/System/Library/Fonts/Menlo.ttc",
    "/Library/Fonts/JetBrainsMono-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
]

SEQUENCES = [
    {
        "cmd": "ssh deploy@prod-server",
        "output": [
            "Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 6.5.0)",
            "Last login: Fri Jul 17 09:14:22 2026 from 10.0.1.42",
        ],
        "hold": 36,
    },
    {
        "cmd": "docker ps --format 'table {{.Names}}\\t{{.Status}}'",
        "output": [
            "NAMES          STATUS",
            "api-gateway    Up 3 days (healthy)",
            "worker-01      Up 3 days",
            "redis-cache    Up 3 days",
        ],
        "hold": 42,
    },
    {
        "cmd": "kubectl get pods -n production",
        "output": [
            "NAME                     READY   STATUS    RESTARTS",
            "api-7f8b9c6d5-xk2lm      1/1     Running   0",
            "worker-5d4c8b7f9-mn8pq    1/1     Running   1",
        ],
        "hold": 42,
    },
    {
        "cmd": "terraform plan -out=tfplan",
        "output": [
            "Plan: 2 to add, 0 to change, 0 to destroy.",
            "Saved the plan to: tfplan",
        ],
        "hold": 36,
    },
    {
        "cmd": "git push origin main",
        "output": [
            "Enumerating objects: 12, done.",
            "To github.com:org/infra.git",
            "   a3f1c2d..9e8b7a1  main -> main",
        ],
        "hold": 36,
    },
]


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_PATHS:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size, index=0)
            except OSError:
                continue
    return ImageFont.load_default()


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease_in_out(t: float) -> float:
    return t * t * (3 - 2 * t)


def build_timeline() -> list[dict]:
    """Map each frame index to visible state."""
    timeline: list[dict] = []
    frame = 0
    history: list[tuple[str, list[str]]] = []

    for seq in SEQUENCES:
        cmd = seq["cmd"]
        output = seq["output"]
        chars_per_frame = max(1, len(cmd) // 28)

        for i in range(0, len(cmd) + 1, chars_per_frame):
            if frame >= TOTAL_FRAMES:
                break
            timeline.append(
                {
                    "history": list(history),
                    "cmd_partial": cmd[:i],
                    "cmd_full": cmd,
                    "output": [],
                    "frame": frame,
                }
            )
            frame += 1

        # typing done — show output char by char on first line then full
        for step in range(8):
            if frame >= TOTAL_FRAMES:
                break
            visible_lines = min(len(output), 1 + step // 2)
            timeline.append(
                {
                    "history": list(history),
                    "cmd_partial": cmd,
                    "cmd_full": cmd,
                    "output": output[:visible_lines],
                    "frame": frame,
                }
            )
            frame += 1

        history.append((cmd, output))
        for _ in range(seq["hold"]):
            if frame >= TOTAL_FRAMES:
                break
            timeline.append(
                {
                    "history": list(history[:-1]),
                    "cmd_partial": cmd,
                    "cmd_full": cmd,
                    "output": output,
                    "frame": frame,
                }
            )
            frame += 1

    while len(timeline) < TOTAL_FRAMES:
        last = timeline[-1] if timeline else {
            "history": [],
            "cmd_partial": "",
            "cmd_full": "",
            "output": [],
        }
        timeline.append({**last, "frame": len(timeline)})

    return timeline[:TOTAL_FRAMES]


def draw_frame(state: dict, frame_idx: int) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Subtle vignette / gradient wash (lavender)
    for y in range(H):
        t = y / H
        r = int(lerp(0, 18, (1 - t) ** 2))
        g = int(lerp(0, 8, (1 - t) ** 2))
        b = int(lerp(0, 32, (1 - t) ** 2))
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Close-up terminal — large, centered
    margin_x = int(W * 0.06)
    margin_y = int(H * 0.08)
    tx, ty = margin_x, margin_y
    tw, th = W - margin_x * 2, H - margin_y * 2

    draw.rounded_rectangle(
        [tx, ty, tx + tw, ty + th],
        radius=16,
        fill=TERM_BG,
        outline=TERM_BORDER,
        width=1,
    )

    bar_h = 44
    draw.rounded_rectangle(
        [tx, ty, tx + tw, ty + bar_h],
        radius=16,
        fill=TITLE_BAR,
    )
    draw.rectangle([tx, ty + bar_h - 16, tx + tw, ty + bar_h], fill=TITLE_BAR)

    # Traffic lights
    for i, color in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        cx = tx + 28 + i * 22
        cy = ty + bar_h // 2
        draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=color)

    draw.text(
        (tx + tw // 2 - 60, ty + 12),
        "terminal — prod",
        fill=MUTED,
        font=load_font(15),
    )

    font = load_font(28)
    line_h = 38
    px = tx + 32
    py = ty + bar_h + 28
    max_y = ty + th - 32

    lines: list[tuple[str, tuple[int, int, int]]] = []

    for old_cmd, old_out in state["history"]:
        lines.append((f"$ {old_cmd}", PROMPT))
        for o in old_out:
            lines.append((o, MUTED))

    partial = state["cmd_partial"]
    lines.append((f"$ {partial}", PROMPT))
    for o in state["output"]:
        lines.append((o, MUTED))

    # Scroll: show last N lines that fit
    visible: list[tuple[str, tuple[int, int, int], str]] = []
    for text, color in lines:
        if text.startswith("$ "):
            prompt, rest = "$ ", text[2:]
            visible.append((prompt, PROMPT, rest))
        else:
            visible.append(("", color, text))

    max_lines = max(1, (max_y - py) // line_h)
    visible = visible[-max_lines:]

    y = py
    cursor_blink = (frame_idx // 12) % 2 == 0
    is_typing = partial != state["cmd_full"]
    last_idx = len(visible) - 1

    for idx, (prompt, pcolor, rest) in enumerate(visible):
        if y > max_y:
            break
        x = px
        if prompt:
            draw.text((x, y), prompt, fill=pcolor, font=font)
            bbox = draw.textbbox((x, y), prompt, font=font)
            x = bbox[2]
            draw.text((x, y), rest, fill=TEXT, font=font)
            if (
                is_typing
                and idx == last_idx
                and cursor_blink
            ):
                bbox = draw.textbbox((x, y), rest, font=font)
                draw.rectangle(
                    [bbox[2] + 2, y + 4, bbox[2] + 10, y + line_h - 8],
                    fill=CURSOR,
                )
        else:
            draw.text((x, y), rest, fill=pcolor, font=font)
        y += line_h

    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if FRAMES_DIR.exists():
        for f in FRAMES_DIR.glob("*.png"):
            f.unlink()
    else:
        FRAMES_DIR.mkdir(parents=True)

    timeline = build_timeline()
    print(f"Rendering {len(timeline)} frames at {W}x{H}...")

    for i, state in enumerate(timeline):
        frame = draw_frame(state, i)
        frame.save(FRAMES_DIR / f"frame_{i:05d}.png")
        if i % 48 == 0:
            print(f"  {i}/{len(timeline)}")

    mp4 = OUT_DIR / "hero-showcase.mp4"
    webm = OUT_DIR / "hero-showcase.webm"
    poster = OUT_DIR / "hero-showcase-poster.jpg"

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", str(FRAMES_DIR / "frame_%05d.png"),
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-crf", "23",
            "-preset", "medium",
            "-movflags", "+faststart",
            str(mp4),
        ],
        check=True,
        capture_output=True,
    )

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", str(mp4),
            "-c:v", "libvpx-vp9",
            "-crf", "32",
            "-b:v", "0",
            str(webm),
        ],
        check=True,
        capture_output=True,
    )

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", str(mp4),
            "-vframes", "1",
            "-q:v", "2",
            str(poster),
        ],
        check=True,
        capture_output=True,
    )

    # Cleanup frames
    for f in FRAMES_DIR.glob("*.png"):
        f.unlink()
    FRAMES_DIR.rmdir()

    print(f"Done:\n  {mp4}\n  {webm}\n  {poster}")
    print(f"MP4 size: {mp4.stat().st_size / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
