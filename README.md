# DevOps Learn

**Live:** [zirvey.github.io/DevOps-Learn](https://zirvey.github.io/DevOps-Learn/)

---

## English

**DevOps & Office IT learning platform** — a structured course with lessons, hands-on practice, and progress tracking.

DevOps Learn is a free platform for self-paced DevOps study — from fundamentals to production practice. Content is split into modules and chapters: theory, command examples, exercises, and quizzes. Progress is saved locally in your browser.

Great for junior engineers, students, and anyone moving into DevOps, SRE, or system administration.

### What's inside

| | |
|---|---|
| **50 chapters** | Linux, Git, Docker, Kubernetes, CI/CD, Terraform, Ansible, AWS, monitoring, security, and more |
| **15 modules** | From “What is DevOps” to Office IT: networking, Wi‑Fi, Omada, Fortinet, Windows Server |
| **RU / EN** | Switch UI and chapter content language |
| **Terminal trainer** | Interactive Linux and Git command checks inside lessons |
| **Dark / light theme** | Toggle in the header |
| **Progress** | Mark chapters complete — saved in `localStorage` |

### Course modules

- Introduction · Fundamentals (Linux, Git, Bash, SSH, Nginx)
- Containers · Orchestration · CI/CD · Infrastructure as Code
- Cloud (AWS) · Observability · Security
- Office IT: networks, VLAN, DHCP/DNS, Wi‑Fi, Omada, Fortinet
- Windows Server · IT Support · Career

### Local setup

```bash
git clone git@github.com:Zirvey/DevOps-Learn.git
cd DevOps-Learn
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Build:**

```bash
npm run build
npm run preview
```

**Hero video** (terminal background on the home page):

```bash
npm run generate:hero-video
```

Creates `public/media/hero-showcase.{mp4,webm}` and a poster. Requires Python 3 + ffmpeg.

### Stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- [React Router](https://reactrouter.com)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [Lucide](https://lucide.dev)

### Repository layout

```
src/
  content/          # chapters and modules (RU + EN)
  components/       # UI: sidebar, hero, terminal lab, quiz
  i18n/             # UI localization
  pages/            # HomePage, ChapterPage
public/
  media/            # hero video and poster
```

### License

Educational use for personal and non-commercial learning.

---

## Русский

**Платформа по DevOps и Office IT** — структурированный курс с уроками, практикой и отслеживанием прогресса.

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

### Локальный запуск

```bash
git clone git@github.com:Zirvey/DevOps-Learn.git
cd DevOps-Learn
npm install
npm run dev
```

Открой [http://localhost:5173](http://localhost:5173).

**Сборка:**

```bash
npm run build
npm run preview
```

**Hero-видео** (терминал на фоне главной):

```bash
npm run generate:hero-video
```

Скрипт создаёт `public/media/hero-showcase.{mp4,webm}` и постер. Требуется Python 3 + ffmpeg.

### Стек

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- [React Router](https://reactrouter.com)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [Lucide](https://lucide.dev)

### Структура репозитория

```
src/
  content/          # главы и модули (RU + EN)
  components/       # UI: sidebar, hero, terminal lab, quiz
  i18n/             # локализация интерфейса
  pages/            # HomePage, ChapterPage
public/
  media/            # hero-видео и постер
```

### Лицензия

Учебные материалы — для личного и образовательного использования.
