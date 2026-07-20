# DevOps Learn

**Онлайн-учебник по DevOps и Office IT** — структурированный курс с уроками, практикой и отслеживанием прогресса.

**Сайт:** [zirvey.github.io/DevOps-Learn](https://zirvey.github.io/DevOps-Learn/)

---

## О проекте

DevOps Learn — бесплатная платформа для самостоятельного изучения DevOps от основ до production-практики. Материал разбит на модули и главы: теория, примеры команд, практические задания и тесты. Прогресс сохраняется локально в браузере.

Подходит начинающим инженерам, студентам и тем, кто переходит в DevOps / SRE / системное администрирование.

### Что внутри

| | |
|---|---|
| **50 глав** | Linux, Git, Docker, Kubernetes, CI/CD, Terraform, Ansible, AWS, мониторинг, безопасность и др. |
| **15 модулей** | От «Что такое DevOps» до Office IT: сети, Wi‑Fi, Omada, Fortinet, Windows Server |
| **RU / EN** | Переключение языка интерфейса и контента |
| **Тренажёр терминала** | Интерактивная проверка команд Linux и Git прямо в уроке |
| **Тёмная / светлая тема** | Переключатель в шапке |
| **Прогресс** | Отмечай пройденные главы — процент сохраняется в `localStorage` |

### Модули курса

- Введение · Основы (Linux, Git, Bash, SSH, Nginx)
- Контейнеры · Оркестрация · CI/CD · Infrastructure as Code
- Облако (AWS) · Observability · Security
- Office IT: сети, VLAN, DHCP/DNS, Wi‑Fi, Omada, Fortinet
- Windows Server · IT Support · Карьера

---

## Локальный запуск

```bash
git clone git@github.com:Zirvey/DevOps-Learn.git
cd DevOps-Learn
npm install
npm run dev
```

Открой [http://localhost:5173](http://localhost:5173).

### Сборка

```bash
npm run build
npm run preview
```

### Hero-видео (терминал на фоне)

Если нужно перегенерировать фоновое видео для главной:

```bash
npm run generate:hero-video
```

Скрипт создаёт `public/media/hero-showcase.{mp4,webm}` и постер. Требуется Python 3 + ffmpeg.

---

## Стек

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- [React Router](https://reactrouter.com) — навигация по главам
- [react-markdown](https://github.com/remarkjs/react-markdown) — контент уроков
- [Lucide](https://lucide.dev) — иконки

---

## Деплой (GitHub Pages)

Сайт публикуется автоматически при push в ветку `main` через GitHub Actions (`.github/workflows/deploy-pages.yml`).

Базовый путь: `/DevOps-Learn/` — учитывается в роутинге и путях к статике.

---

## Структура репозитория

```
src/
  content/          # главы и модули (RU + EN переводы)
  components/       # UI: sidebar, hero, terminal lab, quiz
  i18n/             # локализация интерфейса
  pages/            # HomePage, ChapterPage
public/
  media/            # hero-видео и постер
```

---

## Лицензия

Учебные материалы — для личного и образовательного использования.
