import type { Chapter } from '../../../types'

export const dockerChapter: Chapter = {
  id: 'docker',
  slug: 'docker',
  title: 'Docker',
  moduleId: 'containers',
  order: 0,
  duration: '6–8 часов',
  level: 'beginner',
  description:
    'Полное руководство по Docker: от архитектуры и установки до production-ready образов, сетей, томов и безопасности',
  sections: [
    {
      title: 'Что такое контейнеры и зачем они нужны',
      content: `Контейнер — это изолированная среда выполнения приложения со всеми его зависимостями: библиотеками, интерпретатором, конфигурацией и переменными окружения. Контейнер запускается из **образа (image)** — неизменяемого шаблона, который описывает, что именно должно быть внутри.

**Проблема, которую решают контейнеры:**

| Проблема | Как контейнеры помогают |
|----------|-------------------------|
| «У меня работает, а на проде — нет» | Одинаковая среда от dev до prod |
| Конфликт версий зависимостей | Каждое приложение в своём изолированном окружении |
| Долгий onboarding нового разработчика | \`docker compose up\` — и весь стек готов |
| Сложный деплой | Образ = артефакт, который переносится между средами |
| Масштабирование | Быстрый старт (секунды, не минуты как у VM) |

**Ключевые преимущества Docker:**

- **Портативность** — образ работает на любой машине с Docker Engine
- **Воспроизводимость** — Dockerfile фиксирует процесс сборки в коде
- **Эффективность** — контейнеры делят ядро хост-ОС, потребляя меньше ресурсов, чем виртуальные машины
- **Версионирование** — образы тегируются (\`app:1.0.0\`, \`app:latest\`) и хранятся в registry
- **Изоляция** — процессы, файловая система и сеть изолированы через Linux namespaces и cgroups

Docker — не единственный инструмент контейнеризации (есть Podman, containerd, CRI-O), но де-факто стандарт индустрии и отправная точка для изучения контейнеров.`,
    },
    {
      title: 'Контейнер vs виртуальная машина',
      content: `Понимание разницы между контейнерами и виртуальными машинами — фундаментальный навык DevOps-инженера.

| Характеристика | Виртуальная машина (VM) | Docker-контейнер |
|----------------|-------------------------|------------------|
| Изоляция | Аппаратная (Hypervisor) | На уровне ОС (namespaces) |
| Гостевая ОС | Полная ОС на каждую VM | Нет — делится ядро хоста |
| Время запуска | 1–5 минут | 1–10 секунд |
| Размер | Гигабайты (ОС + приложение) | Мегабайты (только приложение) |
| Плотность | 10–50 VM на сервер | 100–1000 контейнеров на сервер |
| Безопасность | Сильная (полная изоляция) | Хорошая, но делит ядро |
| Use case | Legacy-приложения, разные ОС | Микросервисы, cloud-native |

**Архитектурная схема:**

\`\`\`
VM:     App → Guest OS → Hypervisor → Host OS → Hardware
Docker: App → Docker Engine (containerd) → Host OS (Linux) → Hardware
\`\`\`

**Когда выбирать VM:** нужна другая ОС (Windows на Linux-хосте), жёсткие требования к изоляции, legacy-приложения без контейнеризации.

**Когда выбирать контейнеры:** микросервисы, CI/CD, cloud-native, быстрые итерации, Kubernetes-оркестрация.`,
    },
    {
      title: 'Архитектура Docker',
      content: `Docker — это не один бинарник, а набор компонентов, работающих вместе.

**Основные компоненты:**

| Компонент | Роль |
|-----------|------|
| **Docker CLI** | Клиентская утилита (\`docker\`), отправляет команды через REST API |
| **Docker Daemon (dockerd)** | Фоновый процесс на хосте, управляет образами, контейнерами, сетями, томами |
| **containerd** | Высокопроизводительный runtime, управляет жизненным циклом контейнеров |
| **runc** | OCI-совместимый низкоуровневый runtime, создаёт и запускает контейнеры |
| **Registry** | Хранилище образов (Docker Hub, GHCR, ECR, Harbor) |
| **BuildKit** | Современный движок сборки образов (кэш, multi-stage, параллелизм) |

**Поток выполнения команды \`docker run\`:**

1. CLI отправляет запрос Docker Daemon через Unix socket (\`/var/run/docker.sock\`)
2. Daemon проверяет наличие образа локально; если нет — pull из registry
3. containerd создаёт контейнер через runc с нужными namespaces и cgroups
4. Контейнер запускается как изолированный процесс на хосте

**OCI (Open Container Initiative)** — открытый стандарт формата образов и runtime. Docker совместим с OCI, поэтому образы Docker работают в Kubernetes (containerd/CRI-O).

> **Важно:** Docker Desktop на macOS/Windows использует Linux VM под капотом, потому что контейнеры — это технология Linux.`,
      codes: [
        {
          language: 'bash',
          code: `# Проверить версии компонентов
docker version
docker info

# Убедиться, что daemon работает
docker ps

# BuildKit включён по умолчанию в Docker 23+
DOCKER_BUILDKIT=1 docker build -t myapp .`,
          caption: 'Диагностика Docker Engine',
        },
      ],
    },
    {
      title: 'Установка Docker',
      content: `Установка зависит от операционной системы. Для обучения рекомендуется Docker Desktop; для production-серверов — Docker Engine (CE).

**Варианты установки:**

| Платформа | Способ | Примечание |
|-----------|--------|------------|
| macOS | Docker Desktop | GUI, Kubernetes встроен |
| Windows | Docker Desktop + WSL2 | Обязательно WSL2 backend |
| Ubuntu/Debian | \`apt install docker-ce\` | Production-серверы |
| RHEL/Rocky | \`dnf install docker-ce\` | Enterprise Linux |
| Linux (универсально) | Convenience script | Быстрый старт для обучения |

**После установки на Linux** добавь пользователя в группу \`docker\`, чтобы не использовать \`sudo\` при каждой команде:

\`sudo usermod -aG docker $USER && newgrp docker\`

**Проверка работоспособности:** запуск \`docker run hello-world\` должен вывести приветственное сообщение от Docker.`,
      codes: [
        {
          language: 'bash',
          code: `# Ubuntu/Debian — официальный репозиторий
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \\
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \\
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверка
docker --version
docker compose version
docker run hello-world`,
          caption: 'Установка Docker Engine на Ubuntu',
        },
        {
          language: 'bash',
          code: `# macOS — через Homebrew
brew install --cask docker
# Запустить Docker Desktop из Applications

# Проверка
docker version
docker run hello-world`,
          caption: 'Установка Docker Desktop на macOS',
        },
      ],
    },
    {
      title: 'Docker Images — образы',
      content: `**Image (образ)** — read-only шаблон, из которого создаются контейнеры. Образ состоит из слоёв (layers), каждый слой — результат одной инструкции в Dockerfile.

**Ключевые понятия:**

- **Base image** — стартовый образ (\`alpine\`, \`ubuntu\`, \`node:20-alpine\`)
- **Tag** — метка версии (\`:latest\`, \`:1.0.0\`, \`:alpine\`)
- **Digest** — SHA256-хеш образа, гарантирует неизменность
- **Manifest** — метаданные образа в registry (поддержка multi-arch)

**Формат имени образа:** \`[registry/][namespace/]repository[:tag][@digest]\`

Примеры:
- \`nginx\` → Docker Hub, official image, tag latest
- \`nginx:1.25-alpine\` → конкретная версия
- \`ghcr.io/myorg/myapp:v2.1.0\` → GitHub Container Registry
- \`123456789.dkr.ecr.eu-central-1.amazonaws.com/app@sha256:abc...\` → ECR с digest

**Жизненный цикл образа:** build → tag → push → pull → run → (prune)`,
      codes: [
        {
          language: 'bash',
          code: `# Скачать образ из registry
docker pull nginx:1.25-alpine
docker pull postgres:16-alpine

# Список локальных образов
docker images
docker image ls --format "table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}"

# Подробная информация об образе
docker image inspect nginx:1.25-alpine

# Тегирование (создание нового имени для существующего образа)
docker tag nginx:1.25-alpine myregistry.example.com/web:prod

# Удаление образов
docker rmi nginx:1.25-alpine
docker image prune -a    # удалить неиспользуемые образы

# История слоёв образа
docker history nginx:1.25-alpine`,
          caption: 'Управление образами',
        },
      ],
    },
    {
      title: 'Слои образов (layers)',
      content: `Каждый образ Docker состоит из **слоёв (layers)** — read-only файловых систем, наложенных друг на друга по принципу Union File System (OverlayFS).

**Как работают слои:**

1. Каждая инструкция в Dockerfile (\`RUN\`, \`COPY\`, \`ADD\`) создаёт новый слой
2. Слои кэшируются — если инструкция не изменилась, Docker переиспользует кэш
3. При запуске контейнера поверх read-only слоёв добавляется **writable layer** (container layer)
4. Изменения в runtime-контейнере не сохраняются после удаления (если нет volume)

**Оптимизация слоёв:**

| Плохо | Хорошо | Почему |
|-------|--------|--------|
| \`RUN apt update && apt install -y a && apt install -y b\` (3 слоя) | \`RUN apt update && apt install -y a b && rm -rf /var/lib/apt/lists/*\` (1 слой) | Меньше слоёв = меньше размер |
| \`COPY .\` в начале Dockerfile | Сначала \`COPY package.json\`, потом \`COPY .\` | Кэш зависимостей не инвалидируется при изменении кода |
| Большой base image (\`ubuntu:22.04\` ~77MB) | \`alpine\` (~5MB) или \`distroless\` | Меньше attack surface |

**Copy-on-Write (CoW):** когда контейнер изменяет файл из read-only слоя, Docker копирует его в writable layer. Это быстро, но writable layer растёт при интенсивных записях.`,
      codes: [
        {
          language: 'bash',
          code: `# Посмотреть слои образа
docker history --no-trunc myapp:latest

# Размер каждого слоя
docker image inspect myapp:latest --format='{{range .RootFS.Layers}}{{println .}}{{end}}'

# Dive — интерактивный анализ слоёв (установить отдельно)
# docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock \\
#   wagoodman/dive:latest myapp:latest`,
          caption: 'Анализ слоёв образа',
        },
      ],
    },
    {
      title: 'Dockerfile — основы',
      content: `**Dockerfile** — текстовый файл с инструкциями для сборки образа. Каждая инструкция создаёт слой.

**Основные инструкции:**

| Инструкция | Назначение | Пример |
|------------|------------|--------|
| \`FROM\` | Базовый образ (обязательная первая инструкция) | \`FROM node:20-alpine\` |
| \`WORKDIR\` | Рабочая директория внутри контейнера | \`WORKDIR /app\` |
| \`COPY\` | Копирование файлов с хоста | \`COPY package.json .\` |
| \`ADD\` | Как COPY + распаковка tar + URL | Предпочитай COPY |
| \`RUN\` | Выполнение команды при сборке | \`RUN npm ci\` |
| \`ENV\` | Переменная окружения | \`ENV NODE_ENV=production\` |
| \`EXPOSE\` | Документация порта (не открывает!) | \`EXPOSE 3000\` |
| \`USER\` | Пользователь для runtime | \`USER app\` |
| \`CMD\` | Команда по умолчанию (переопределяется) | \`CMD ["node", "index.js"]\` |
| \`ENTRYPOINT\` | Основная команда (не переопределяется полностью) | \`ENTRYPOINT ["node"]\` |
| \`HEALTHCHECK\` | Проверка здоровья контейнера | \`HEALTHCHECK CMD curl -f http://localhost/health\` |
| \`ARG\` | Переменная только на этапе сборки | \`ARG VERSION=1.0\` |

**CMD vs ENTRYPOINT:**
- \`CMD\` — аргументы по умолчанию, легко переопределяется: \`docker run img /bin/sh\`
- \`ENTRYPOINT\` — фиксированная точка входа, \`docker run img --arg\` добавляет аргументы`,
      code: {
        language: 'dockerfile',
        code: `FROM python:3.12-slim

WORKDIR /app

# Зависимости — отдельный слой для кэширования
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Код приложения
COPY . .

# Non-root пользователь
RUN groupadd -r app && useradd -r -g app app
USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
        caption: 'Базовый Dockerfile для Python-приложения',
      },
    },
    {
      title: 'Dockerfile — best practices',
      content: `Production-ready Dockerfile следует набору проверенных практик, которые влияют на безопасность, размер образа и скорость сборки.

**Чеклист best practices:**

1. **Минимальный base image** — \`alpine\`, \`slim\`, \`distroless\` вместо полных дистрибутивов
2. **Non-root user** — никогда не запускай приложение от root в контейнере
3. **Один процесс на контейнер** — принцип «один контейнер — одна ответственность»
4. **Пинning версий** — \`node:20.11.0-alpine\`, не \`node:latest\`
5. **Кэширование слоёв** — сначала зависимости, потом код
6. **Объединение RUN** — одна инструкция RUN с \`&&\` и очисткой кэша
7. **COPY вместо ADD** — ADD только для tar-архивов и URL
8. **.dockerignore** — исключай ненужные файлы из контекста сборки
9. **HEALTHCHECK** — для оркестраторов и мониторинга
10. **Метаданные** — LABEL для версии, maintainer, git commit
11. **Секреты** — никогда не копируй .env, ключи, пароли в образ
12. **Форма exec** — \`CMD ["node", "app.js"]\`, не \`CMD node app.js\` (PID 1, сигналы)

**Размер образа — типичные значения:**

| Base image | Размер | Use case |
|------------|--------|----------|
| \`node:20\` | ~1 GB | Разработка |
| \`node:20-slim\` | ~200 MB | Компромисс |
| \`node:20-alpine\` | ~130 MB | Production |
| \`gcr.io/distroless/nodejs20\` | ~120 MB | Максимальная безопасность |`,
      codes: [
        {
          language: 'dockerfile',
          code: `# ПЛОХО ❌
FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD npm start

# ХОРОШО ✅
FROM node:20.11.0-alpine AS base
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --chown=nodejs:nodejs . .

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]`,
          caption: 'Сравнение плохого и хорошего Dockerfile',
        },
      ],
    },
    {
      title: 'Multi-stage builds',
      content: `**Multi-stage build** — техника сборки, при которой используется несколько стадий \`FROM\` в одном Dockerfile. Артефакты из промежуточных стадий копируются в финальный образ, а build-зависимости отбрасываются.

**Зачем нужно:**

- Финальный образ содержит только runtime-зависимости
- Размер образа уменьшается в 5–10 раз
- Build-tools (gcc, maven, npm devDependencies) не попадают в production
- Безопасность: меньше пакетов = меньше уязвимостей

**Типичные паттерны:**

| Язык/стек | Builder stage | Final stage |
|-----------|---------------|-------------|
| Node.js | \`node:20-alpine\` + npm ci + build | \`node:20-alpine\` или distroless |
| Go | \`golang:1.22\` + go build | \`scratch\` или \`alpine\` |
| Java | \`maven:3.9\` + mvn package | \`eclipse-temurin:21-jre-alpine\` |
| Rust | \`rust:1.77\` + cargo build --release | \`debian:bookworm-slim\` |
| Frontend | \`node:20\` + npm run build | \`nginx:alpine\` (статика) |

Именованные стадии (\`AS builder\`) позволяют ссылаться на них через \`COPY --from=builder\`.`,
      codes: [
        {
          language: 'dockerfile',
          code: `# Go — минимальный образ из scratch
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

FROM scratch
COPY --from=builder /server /server
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8080
USER 65534:65534
ENTRYPOINT ["/server"]`,
          caption: 'Go multi-stage → образ ~10 MB',
        },
        {
          language: 'dockerfile',
          code: `# Node.js + React frontend
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build

FROM nginx:1.25-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1`,
          caption: 'Frontend: build в Node, serve через nginx',
        },
      ],
    },
    {
      title: '.dockerignore',
      content: `\`.dockerignore\` — файл, определяющий, какие файлы и директории **исключить** из build context (контекста сборки). Работает аналогично \`.gitignore\`.

**Зачем нужен:**

- **Скорость сборки** — меньше файлов отправляется Docker Daemon
- **Безопасность** — секреты (.env, credentials) не попадают в образ
- **Размер образа** — node_modules, .git, тесты не копируются случайно
- **Кэш** — изменение исключённых файлов не инвалидирует кэш слоёв

**Что обязательно исключать:**

| Категория | Примеры |
|-----------|---------|
| VCS | \`.git\`, \`.gitignore\` |
| Зависимости | \`node_modules\`, \`vendor\`, \`__pycache__\` |
| Секреты | \`.env\`, \`*.pem\`, \`credentials.json\` |
| IDE | \`.vscode\`, \`.idea\` |
| Документация | \`README.md\`, \`docs/\` (если не нужны в образе) |
| Тесты | \`tests/\`, \`*.test.js\`, \`coverage/\` |
| Docker | \`Dockerfile*\`, \`docker-compose*\` |
| CI/CD | \`.github/\`, \`.gitlab-ci.yml\` |

> **Важно:** \`.dockerignore\` не защищает от \`COPY .\` если файл уже был скопирован ранее. Секреты никогда не должны находиться в build context.`,
      code: {
        language: 'text',
        code: `# .dockerignore — универсальный шаблон

# VCS
.git
.gitignore

# Зависимости (устанавливаются в Dockerfile)
node_modules
vendor
__pycache__
*.pyc
.venv

# Секреты и конфигурация
.env
.env.*
*.pem
*.key
credentials.json
secrets/

# IDE и OS
.vscode
.idea
.DS_Store
Thumbs.db

# Тесты и документация
tests/
test/
coverage/
*.test.js
*.spec.ts
README.md
docs/

# Docker и CI
Dockerfile*
docker-compose*
.dockerignore
.github/
.gitlab-ci.yml

# Build artifacts
dist/
build/
*.log`,
        caption: 'Универсальный .dockerignore',
      },
    },
    {
      title: 'Запуск, остановка и удаление контейнеров',
      content: `Управление жизненным циклом контейнеров — ежедневная задача DevOps-инженера.

**Жизненный цикл контейнера:**

\`created\` → \`running\` → \`paused\` → \`stopped\` → \`removed\`

**Ключевые флаги \`docker run\`:**

| Флаг | Описание |
|------|----------|
| \`-d\` | Detached mode (фоновый запуск) |
| \`--name\` | Имя контейнера |
| \`-p HOST:CONTAINER\` | Проброс порта |
| \`-e KEY=VAL\` | Переменная окружения |
| \`-v\` / \`--mount\` | Монтирование тома |
| \`--network\` | Подключение к сети |
| \`--restart\` | Политика перезапуска (no, always, unless-stopped, on-failure) |
| \`--rm\` | Автоудаление при остановке |
| \`-it\` | Интерактивный режим + TTY |
| \`--memory\` / \`--cpus\` | Ограничение ресурсов |
| \`--user\` | Запуск от конкретного пользователя |

**Политики restart:**
- \`no\` — не перезапускать (по умолчанию)
- \`always\` — всегда перезапускать
- \`unless-stopped\` — перезапускать, пока не остановлен вручную (рекомендуется для prod)
- \`on-failure:N\` — перезапуск при ненулевом exit code, максимум N раз`,
      codes: [
        {
          language: 'bash',
          code: `# Запуск
docker run -d --name web -p 8080:80 --restart unless-stopped nginx:alpine
docker run -it --rm ubuntu:22.04 bash          # интерактивная сессия
docker run -d --name api -e NODE_ENV=production -e PORT=3000 myapp:1.0

# Просмотр
docker ps                    # запущенные
docker ps -a                 # все (включая остановленные)
docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"

# Остановка и удаление
docker stop web              # SIGTERM → SIGKILL через 10 сек
docker kill web              # немедленный SIGKILL
docker rm web                # удалить остановленный
docker rm -f web             # принудительно остановить и удалить

# Массовая очистка
docker container prune       # удалить все остановленные
docker system prune -a       # образы, контейнеры, сети, кэш сборки
docker system df             # использование диска`,
          caption: 'Жизненный цикл контейнеров',
        },
      ],
    },
    {
      title: 'Проброс портов (port mapping)',
      content: `По умолчанию порты контейнера доступны только внутри Docker-сети. **Port mapping** (\`-p\`) связывает порт хоста с портом контейнера.

**Форматы \`-p\`:**

| Формат | Описание | Пример |
|--------|----------|--------|
| \`-p HOST:CONTAINER\` | Конкретный порт хоста | \`-p 8080:80\` |
| \`-p CONTAINER\` | Случайный порт хоста | \`-p 80\` |
| \`-p IP:HOST:CONTAINER\` | Привязка к IP | \`-p 127.0.0.1:8080:80\` |
| \`-p HOST:CONTAINER/udp\` | UDP-порт | \`-p 53:53/udp\` |
| \`-P\` | Проброс всех EXPOSE-портов на случайные | \`-P\` |

**Типичные сценарии:**

- **Разработка:** \`-p 3000:3000\` — приложение доступно на localhost:3000
- **Reverse proxy:** nginx на \`-p 80:80 -p 443:443\`, backend без проброса
- **Безопасность:** \`-p 127.0.0.1:5432:5432\` — БД доступна только локально
- **Несколько сервисов:** каждый на своём порту (\`-p 3000:3000 -p 3001:3001\`)

> **Важно:** \`EXPOSE\` в Dockerfile — только документация. Порт не открывается без \`-p\` при \`docker run\` или \`ports:\` в Compose.`,
      codes: [
        {
          language: 'bash',
          code: `# Веб-сервер на порту 8080
docker run -d --name nginx -p 8080:80 nginx:alpine
curl http://localhost:8080

# PostgreSQL — только localhost
docker run -d --name db \\
  -e POSTGRES_PASSWORD=secret \\
  -p 127.0.0.1:5432:5432 \\
  postgres:16-alpine

# Несколько портов
docker run -d --name app \\
  -p 3000:3000 \\
  -p 9229:9229 \\
  myapp:dev

# Узнать, какие порты проброшены
docker port nginx`,
          caption: 'Примеры проброса портов',
        },
      ],
    },
    {
      title: 'Volumes — именованные тома',
      content: `Данные в контейнере по умолчанию **эфемерны** — при удалении контейнера writable layer уничтожается. **Volumes** решают проблему персистентности данных.

**Три способа монтирования данных:**

| Тип | Управление | Путь | Use case |
|-----|------------|------|----------|
| **Volume** | Docker | \`/var/lib/docker/volumes/\` | БД, персистентные данные |
| **Bind mount** | Пользователь | Любой путь на хосте | Конфиги, hot-reload в dev |
| **tmpfs** | Docker (RAM) | В памяти | Секреты, кэш |

**Volumes — рекомендуемый способ** для production:
- Управляются Docker (\`docker volume create/ls/rm\`)
- Работают на Linux и macOS/Windows (через VM)
- Можно делать backup через \`docker run --rm -v vol:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data\`
- Поддерживают volume drivers для NFS, cloud storage

**Жизненный цикл:** volume существует независимо от контейнера. \`docker rm\` не удаляет volume. \`docker volume prune\` удаляет неиспользуемые.`,
      codes: [
        {
          language: 'bash',
          code: `# Создать и использовать volume
docker volume create pgdata
docker volume ls
docker volume inspect pgdata

# PostgreSQL с персистентным хранилищем
docker run -d --name postgres \\
  -e POSTGRES_PASSWORD=secret \\
  -e POSTGRES_DB=myapp \\
  -v pgdata:/var/lib/postgresql/data \\
  postgres:16-alpine

# Backup volume
docker run --rm \\
  -v pgdata:/data:ro \\
  -v $(pwd):/backup \\
  alpine tar czf /backup/pgdata-backup.tar.gz -C /data .

# Restore
docker run --rm \\
  -v pgdata:/data \\
  -v $(pwd):/backup \\
  alpine tar xzf /backup/pgdata-backup.tar.gz -C /data

# Удаление
docker volume rm pgdata
docker volume prune`,
          caption: 'Работа с Docker Volumes',
        },
      ],
    },
    {
      title: 'Bind mounts — привязка директорий',
      content: `**Bind mount** монтирует конкретный путь файловой системы хоста в контейнер. Изменения видны с обеих сторон в реальном времени.

**Volume vs Bind mount:**

| | Volume | Bind mount |
|---|--------|------------|
| Путь на хосте | Управляется Docker | Задаётся явно |
| Портативность | Высокая | Зависит от структуры проекта |
| Backup | \`docker volume\` команды | Обычные инструменты (rsync, tar) |
| Dev hot-reload | Неудобно | Идеально |
| Production | Рекомендуется | С осторожностью |

**Типичные use cases bind mount:**

1. **Разработка** — монтирование исходного кода для hot-reload
2. **Конфигурация** — nginx.conf, prometheus.yml без пересборки образа
3. **Логи** — запись логов на хост для сбора (Fluentd, Filebeat)
4. **SSL-сертификаты** — Let's Encrypt certs в nginx

**Синтаксис \`--mount\` (рекомендуемый) vs \`-v\`:**

\`--mount type=bind,source=/host/path,target=/container/path,readonly\`

Преимущество \`--mount\`: явный синтаксис, поддержка \`readonly\`, \`consistency\` (macOS).`,
      codes: [
        {
          language: 'bash',
          code: `# Dev: hot-reload Node.js приложения
docker run -d --name dev-app \\
  -p 3000:3000 \\
  -v $(pwd)/src:/app/src \\
  -v /app/node_modules \\
  -e NODE_ENV=development \\
  myapp:dev

# Монтирование конфига nginx (read-only)
docker run -d --name nginx \\
  -p 80:80 \\
  --mount type=bind,source=$(pwd)/nginx.conf,target=/etc/nginx/nginx.conf,readonly \\
  nginx:alpine

# Логи на хост
docker run -d --name app \\
  -v $(pwd)/logs:/var/log/app \\
  myapp:latest`,
          caption: 'Bind mounts в разработке и production',
        },
      ],
    },
    {
      title: 'Docker Networking',
      content: `Docker предоставляет встроенную сетевую подсистему для связи между контейнерами.

**Типы сетей (drivers):**

| Driver | Описание | Use case |
|--------|----------|----------|
| \`bridge\` | Default. Изолированная сеть на хосте | Standalone контейнеры |
| \`host\` | Контейнер использует сеть хоста напрямую | Максимальная производительность |
| \`none\` | Без сети | Изолированные batch-задачи |
| \`overlay\` | Multi-host сеть (Swarm) | Docker Swarm кластеры |
| \`macvlan\` | Контейнер получает MAC-адрес | Legacy-приложения, VLAN |

**DNS в Docker:** контейнеры в одной user-defined bridge-сети обращаются друг к другу **по имени контейнера**. Это ключевой механизм для multi-container приложений.

**Порядок работы:**
1. Создать сеть: \`docker network create app-net\`
2. Запустить контейнеры в сети: \`docker run --network app-net --name api ...\`
3. Обращаться: \`http://api:3000\` из другого контейнера в той же сети

**Default bridge (\`docker0\`)** не поддерживает DNS по имени — используй user-defined networks.`,
      codes: [
        {
          language: 'bash',
          code: `# Создание и управление сетями
docker network ls
docker network create --driver bridge app-network
docker network inspect app-network

# Контейнеры в одной сети — DNS по имени
docker run -d --name db --network app-network \\
  -e POSTGRES_PASSWORD=secret postgres:16-alpine

docker run -d --name api --network app-network \\
  -e DATABASE_URL=postgres://postgres:secret@db:5432/postgres \\
  myapi:latest

# Проверка связности
docker exec api ping -c 2 db
docker exec api curl http://db:5432  # PostgreSQL не HTTP, но DNS работает

# Подключить существующий контейнер к сети
docker network connect app-network existing-container

# Отключить и удалить
docker network disconnect app-network existing-container
docker network rm app-network`,
          caption: 'User-defined bridge network с DNS',
        },
      ],
    },
    {
      title: 'Docker Hub и GitHub Container Registry (GHCR)',
      content: `**Registry** — хранилище и распространение Docker-образов. Без registry невозможен CI/CD и деплой в Kubernetes.

**Популярные registry:**

| Registry | URL | Особенности |
|----------|-----|-------------|
| Docker Hub | \`docker.io\` | Публичный, 1 бесплатный private repo |
| GHCR | \`ghcr.io\` | Интеграция с GitHub Actions, бесплатно для public |
| AWS ECR | \`*.dkr.ecr.*.amazonaws.com\` | Нативная интеграция с AWS |
| Google GCR/AR | \`gcr.io\` / \`*.pkg.dev\` | GCP экосистема |
| Harbor | Self-hosted | Enterprise, сканирование, RBAC |
| Azure ACR | \`*.azurecr.io\` | Azure экосистема |

**Workflow публикации образа:**

1. Собрать: \`docker build -t myapp:1.0.0 .\`
2. Тегировать: \`docker tag myapp:1.0.0 ghcr.io/username/myapp:1.0.0\`
3. Логин: \`docker login ghcr.io\`
4. Push: \`docker push ghcr.io/username/myapp:1.0.0\`

**Тегирование в production:**
- Никогда не используй \`:latest\` в production
- Семантическое версионирование: \`:1.0.0\`, \`:1.0\`, \`:1\`
- Git SHA: \`:sha-abc1234\` для трассировки
- Immutable tags — не перезаписывай существующие теги`,
      codes: [
        {
          language: 'bash',
          code: `# Docker Hub
docker login
docker build -t username/myapp:1.0.0 .
docker push username/myapp:1.0.0

# GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker build -t ghcr.io/username/myapp:1.0.0 .
docker push ghcr.io/username/myapp:1.0.0

# Pull из private registry
docker pull ghcr.io/username/myapp:1.0.0
docker run -d ghcr.io/username/myapp:1.0.0`,
          caption: 'Публикация образов в registry',
        },
        {
          language: 'yaml',
          code: `# GitHub Actions — автоматический push в GHCR
name: Build and Push
on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/\${{ github.repository }}:\${{ github.sha }}
            ghcr.io/\${{ github.repository }}:latest`,
          caption: 'CI/CD push в GHCR через GitHub Actions',
        },
      ],
    },
    {
      title: 'Отладка контейнеров',
      content: `Умение диагностировать проблемы в контейнерах — критический навык. Контейнер «молча падает» — типичная ситуация, с которой сталкивается каждый DevOps-инженер.

**Алгоритм отладки:**

1. **Контейнер запущен?** → \`docker ps -a\`
2. **Почему остановился?** → \`docker logs <container>\`
3. **Exit code?** → \`docker inspect --format='{{.State.ExitCode}}' <container>\`
4. **Зайти внутрь** → \`docker exec -it <container> sh\`
5. **Если контейнер падает сразу** → \`docker run -it --entrypoint sh <image>\`
6. **События Docker** → \`docker events\`
7. **Ресурсы** → \`docker stats\`

**Типичные проблемы:**

| Симптом | Причина | Решение |
|---------|---------|---------|
| Exit code 137 | OOM Kill | Увеличить memory limit |
| Exit code 1 | Ошибка приложения | Проверить logs |
| Port already in use | Конфликт портов | \`lsof -i :PORT\`, сменить порт |
| Permission denied | Запуск от root, volume permissions | USER в Dockerfile, chown |
| Cannot connect to DB | Неверный hostname/сеть | Использовать имя контейнера, не localhost |
| Image not found | Нет образа / нет auth | docker pull, docker login |

**Полезные инструменты:** \`dive\` (анализ слоёв), \`ctop\` (мониторинг), \`lazydocker\` (TUI для Docker).`,
      codes: [
        {
          language: 'bash',
          code: `# Логи
docker logs myapp
docker logs -f myapp              # follow (real-time)
docker logs --tail 100 myapp      # последние 100 строк
docker logs --since 10m myapp     # за последние 10 минут
docker logs myapp 2>&1 | grep ERROR

# Инспекция
docker inspect myapp
docker inspect --format='{{json .State}}' myapp | jq
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' myapp

# Зайти в контейнер
docker exec -it myapp sh
docker exec -it myapp bash        # если bash установлен
docker exec -u root -it myapp sh # от root для отладки

# Переопределить entrypoint для отладки
docker run -it --rm --entrypoint sh myapp:broken

# Мониторинг ресурсов
docker stats
docker stats --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}"

# Копирование файлов
docker cp myapp:/var/log/app.log ./app.log
docker cp ./config.yml myapp:/etc/app/config.yml`,
          caption: 'Инструменты отладки Docker',
        },
      ],
    },
    {
      title: 'Безопасность Docker',
      content: `Контейнеры **не являются** полноценной sandbox-изоляцией. Безопасность Docker — ответственность и разработчика образа, и оператора.

**Принципы безопасности:**

1. **Не запускай от root** — \`USER\` в Dockerfile, \`--user\` при run
2. **Минимальный образ** — меньше пакетов = меньше CVE
3. **Сканирование образов** — Trivy, Snyk, Docker Scout
4. **Не храни секреты в образе** — Docker Secrets, Vault, env vars
5. **Read-only filesystem** — \`--read-only\` + tmpfs для /tmp
6. **Ограничение capabilities** — \`--cap-drop=ALL --cap-add=NET_BIND_SERVICE\`
7. **Не монтируй docker.sock** в контейнер без крайней необходимости
8. **Обновляй base images** — регулярный rebuild с актуальными патчами
9. **Content Trust** — Docker Content Trust (DCT) для верификации образов
10. **AppArmor/SELinux** — профили безопасности на хосте

**Сканирование уязвимостей:**

| Инструмент | Тип | Команда |
|------------|-----|---------|
| Trivy | Open source | \`trivy image myapp:1.0\` |
| Docker Scout | Встроен в Docker | \`docker scout cves myapp:1.0\` |
| Snyk | SaaS | \`snyk container test myapp:1.0\` |
| Grype | Open source (Anchore) | \`grype myapp:1.0\` |

**Rootless Docker** — запуск Docker Daemon без root-привилегий. Повышает безопасность хоста, но имеет ограничения (порты < 1024, overlay networks).`,
      codes: [
        {
          language: 'bash',
          code: `# Сканирование образа
docker scout cves myapp:1.0.0
trivy image --severity HIGH,CRITICAL myapp:1.0.0

# Безопасный запуск
docker run -d \\
  --name secure-app \\
  --read-only \\
  --tmpfs /tmp \\
  --cap-drop=ALL \\
  --security-opt=no-new-privileges \\
  --user 1001:1001 \\
  --memory=512m \\
  --cpus=1.0 \\
  myapp:1.0.0

# Проверить, от какого пользователя работает контейнер
docker exec secure-app id`,
          caption: 'Безопасный запуск и сканирование',
        },
      ],
    },
    {
      title: 'Production checklist для Docker',
      content: `Перед выкаткой Docker-образа в production пройди этот чеклист. Каждый пункт проверен на реальных инцидентах.

**Образ (Image):**

- [ ] Multi-stage build — финальный образ минимален
- [ ] Base image pinned по digest или точной версии
- [ ] Non-root USER в Dockerfile
- [ ] HEALTHCHECK определён
- [ ] .dockerignore настроен
- [ ] Сканирование на CVE пройдено (0 CRITICAL)
- [ ] Образ подписан (cosign/notary)
- [ ] Тег — semver, не \`:latest\`

**Runtime:**

- [ ] \`--restart unless-stopped\` или оркестратор
- [ ] Resource limits: \`--memory\`, \`--cpus\`
- [ ] Логирование: json-file с ротацией или драйвер (fluentd, syslog)
- [ ] Volumes для персистентных данных (не bind mount)
- [ ] Секреты через env/secrets manager, не в образе
- [ ] Read-only root filesystem где возможно
- [ ] Capabilities dropped

**Мониторинг:**

- [ ] Health endpoint (\`/health\`, \`/ready\`)
- [ ] Метрики (Prometheus exporter или /metrics)
- [ ] Structured logging (JSON)
- [ ] Graceful shutdown (обработка SIGTERM)

**CI/CD:**

- [ ] Автоматическая сборка на каждый merge
- [ ] Тесты в pipeline до push образа
- [ ] Immutable tags в registry
- [ ] Rollback plan (предыдущий тег всегда доступен)

**Документация:**

- [ ] README с инструкцией запуска
- [ ] Переменные окружения задокументированы
- [ ] Порты и volumes описаны`,
      codes: [
        {
          language: 'bash',
          code: `# Production-ready запуск
docker run -d \\
  --name myapp-prod \\
  --restart unless-stopped \\
  --read-only \\
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \\
  --cap-drop=ALL \\
  --security-opt=no-new-privileges \\
  --user 1001:1001 \\
  --memory=1g \\
  --memory-swap=1g \\
  --cpus=2.0 \\
  --pids-limit=200 \\
  --log-driver=json-file \\
  --log-opt max-size=10m \\
  --log-opt max-file=5 \\
  -e NODE_ENV=production \\
  -v app-data:/data \\
  -p 127.0.0.1:3000:3000 \\
  ghcr.io/myorg/myapp:1.2.3

# Проверка
docker inspect myapp-prod --format='{{.State.Health.Status}}'
docker stats myapp-prod --no-stream`,
          caption: 'Production-ready docker run',
        },
      ],
    },
  ],
  practice: [
    'Установи Docker Engine или Docker Desktop и запусти hello-world',
    'Напиши Dockerfile с multi-stage build для своего приложения (или простого HTTP-сервера на Node/Python/Go)',
    'Создай .dockerignore и убедись, что node_modules и .env не попадают в образ',
    'Собери образ, просканируй его через trivy или docker scout на уязвимости',
    'Запусти PostgreSQL с именованным volume, создай таблицу, удали контейнер, пересоздай — данные должны сохраниться',
    'Создай user-defined bridge network, запусти два контейнера и проверь DNS-связность по имени',
    'Запушь образ в GitHub Container Registry (GHCR) с тегом semver',
    'Настрой контейнер с --read-only, non-root user, memory limit и healthcheck',
    'Отладь «сломанный» контейнер: найди причину через logs, inspect и exec',
    'Пройди production checklist для своего образа и исправь найденные проблемы',
  ],
  resources: [
    { title: 'Docker Documentation', url: 'https://docs.docker.com' },
    { title: 'Play with Docker (бесплатная песочница)', url: 'https://labs.play-with-docker.com' },
  ],
}
