# Hero video

## Быстрый старт

Сгенерировать терминал автоматически:

```bash
npm run generate:hero-video
```

Создаст:
- `hero-showcase.mp4` — loop, 1280×720, ~18 сек
- `hero-showcase.webm` — WebM версия
- `hero-showcase-poster.jpg` — постер

Скрипт: `scripts/generate-hero-video.py` (Python + Pillow + ffmpeg).

## Свой ролик

| Файл | Назначение |
|------|------------|
| `hero-showcase.mp4` | Основное видео (H.264, loop, без звука) |
| `hero-showcase.webm` | WebM для меньшего веса |
| `hero-showcase-poster.jpg` | Постер до загрузки |

Рекомендации: тёмный фон, крупный терминал, без аудио.

Пока файлов нет — показывается CSS-fallback (metric cards).
