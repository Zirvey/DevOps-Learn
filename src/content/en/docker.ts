import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: "Docker",
  duration: "6–8 hours",
  description: "The Complete Guide to Docker: From Architecture and Installation to Production-Ready Images, Networking, Volumes and Security",
  sections: [
    {
      title: "What are containers and why are they needed?",
      content: "A container is an isolated execution environment for an application with all its dependencies: libraries, interpreter, configuration and environment variables. The container is launched from an **image** - an immutable template that describes what exactly should be inside.\n\n**The problem that containers solve:**\n\n| Problem | How containers help |\n|----------|------------------------|\n| “It works for me, but not on production” | Same environment from dev to prod |\n| Dependency version conflict | Each application in its own isolated environment |\n| Long onboarding for a new developer | `docker compose up` - and the entire stack is ready |\n| Complex deployment | Image = an artifact that transfers between environments |\n| Scaling | Quick start (seconds, not minutes like VM) |\n\n**Key benefits of Docker:**\n\n- **Portability** — the image runs on any machine with Docker Engine\n- **Reproducibility** - Dockerfile captures the build process in code\n- **Efficiency** - containers share the host OS kernel, consuming fewer resources than virtual machines\n- **Versioning** - images are tagged (`app:1.0.0`, `app:latest`) and stored in the registry\n- **Isolation** - processes, file system and network are isolated via Linux namespaces and cgroups\n\nDocker is not the only containerization tool (there are Podman, containerd, CRI-O), but it is the de facto industry standard and the starting point for learning containers.",
    },
    {
      title: "Container vs virtual machine",
      content: "Understanding the difference between containers and virtual machines is a fundamental skill of a DevOps engineer.\n\n| Characteristics | Virtual Machine (VM) | Docker container |\n|----------------|------------------------|------------------|\n| Isolation | Hardware (Hypervisor) | At the OS level (namespaces) |\n| Guest OS | Full OS per VM | No - shares the host kernel |\n| Launch time | 1–5 minutes | 1–10 seconds |\n| Size | Gigabytes (OS + application) | Megabytes (app only) |\n| Density | 10–50 VM per server | 100–1000 containers per server |\n| Security | Strong (full isolation) | Good, but shares the kernel |\n| Use case | Legacy applications, different OS | Microservices, cloud-native |\n\n**Architectural diagram:**\n\n```\nVM:     App → Guest OS → Hypervisor → Host OS → Hardware\nDocker: App → Docker Engine (containerd) → Host OS (Linux) → Hardware\n```\n\n**When to choose a VM:** you need a different OS (Windows on a Linux host), strict isolation requirements, legacy applications without containerization.\n\n**When to choose containers:** microservices, CI/CD, cloud-native, fast iterations, Kubernetes orchestration.",
    },
    {
      title: "Docker architecture",
      content: "Docker is not a single binary, but a collection of components that work together.\n\n**Main components:**\n\n| Component | Role |\n|-----------|------|\n| **Docker CLI** | Client utility (`docker`), sends commands via REST API |\n| **Docker Daemon (dockerd)** | Background process on the host, manages images, containers, networks, volumes |\n| **containerd** | High-performance runtime, manages container lifecycle |\n| **runc** | OCI-compatible low-level runtime, creates and runs containers |\n| **Registry** | Image storage (Docker Hub, GHCR, ECR, Harbor) |\n| **BuildKit** | Modern image build engine (cache, multi-stage, parallelism) |\n\n**Execution flow of the `docker run` command:**\n\n1. CLI sends a request to Docker Daemon via Unix socket (`/var/run/docker.sock`)\n2. Daemon checks for the presence of the image locally; if not, pull from registry\n3. containerd creates a container via runc with the necessary namespaces and cgroups\n4. The container runs as an isolated process on the host\n\n**OCI (Open Container Initiative)** is an open standard for image format and runtime. Docker is OCI compliant, so Docker images run on Kubernetes (containerd/CRI-O).\n\n> **Important:** Docker Desktop on macOS/Windows uses a Linux VM under the hood because containers are a Linux technology.",
      codes: [
        {
          language: "bash",
          code: "# Проверить версии компонентов\ndocker version\ndocker info\n\n# Убедиться, что daemon работает\ndocker ps\n\n# BuildKit включён по умолчанию в Docker 23+\nDOCKER_BUILDKIT=1 docker build -t myapp .",
          caption: "Docker Engine Diagnostics",
        },
      ],
    },
    {
      title: "Installing Docker",
      content: "Installation depends on the operating system. Docker Desktop is recommended for training; for production servers - Docker Engine (CE).\n\n**Installation options:**\n\n| Platform | Method | Note |\n|-----------|--------|-----------|\n| macOS | Docker Desktop | GUI, Kubernetes built in |\n| Windows | Docker Desktop + WSL2 | Mandatory WSL2 backend |\n| Ubuntu/Debian | `apt install docker-ce` | Production servers |\n| RHEL/Rocky | `dnf install docker-ce` | Enterprise Linux |\n| Linux (general) | Convenience script | Quick start to learning |\n\n**After installing on Linux** add the user to the `docker` group so you don't have to use `sudo` on every command:\n\n`sudo usermod -aG docker $USER && newgrp docker`\n\n**Sanity check:** Running `docker run hello-world` should display a welcome message from Docker.",
      codes: [
        {
          language: "bash",
          code: "# Ubuntu/Debian — официальный репозиторий\nsudo apt update\nsudo apt install -y ca-certificates curl gnupg\nsudo install -m 0755 -d /etc/apt/keyrings\ncurl -fsSL https://download.docker.com/linux/ubuntu/gpg | \\\n  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg\necho \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\\n  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable\" | \\\n  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null\nsudo apt update\nsudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin\n\n# Проверка\ndocker --version\ndocker compose version\ndocker run hello-world",
          caption: "Installing Docker Engine on Ubuntu",
        },
        {
          language: "bash",
          code: "# macOS — через Homebrew\nbrew install --cask docker\n# Запустить Docker Desktop из Applications\n\n# Проверка\ndocker version\ndocker run hello-world",
          caption: "Installing Docker Desktop on macOS",
        },
      ],
    },
    {
      title: "Docker Images - images",
      content: "**Image** - read-only template from which containers are created. The image consists of layers, each layer is the result of one instruction in the Dockerfile.\n\n**Key Concepts:**\n\n- **Base image** — starting image (`alpine`, `ubuntu`, `node:20-alpine`)\n- **Tag** — version tag (`:latest`, `:1.0.0`, `:alpine`)\n- **Digest** - SHA256 hash of the image, guarantees immutability\n- **Manifest** — image metadata in the registry (multi-arch support)\n\n**Image name format:** `[registry/][namespace/]repository[:tag][@digest]`\n\nExamples:\n- `nginx` → Docker Hub, official image, tag latest\n- `nginx:1.25-alpine` → specific version\n- `ghcr.io/myorg/myapp:v2.1.0` → GitHub Container Registry\n- `123456789.dkr.ecr.eu-central-1.amazonaws.com/app@sha256:abc...` → ECR with digest\n\n**Image life cycle:** build → tag → push → pull → run → (prune)",
      codes: [
        {
          language: "bash",
          code: "# Скачать образ из registry\ndocker pull nginx:1.25-alpine\ndocker pull postgres:16-alpine\n\n# Список локальных образов\ndocker images\ndocker image ls --format \"table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}\"\n\n# Подробная информация об образе\ndocker image inspect nginx:1.25-alpine\n\n# Тегирование (создание нового имени для существующего образа)\ndocker tag nginx:1.25-alpine myregistry.example.com/web:prod\n\n# Удаление образов\ndocker rmi nginx:1.25-alpine\ndocker image prune -a    # удалить неиспользуемые образы\n\n# История слоёв образа\ndocker history nginx:1.25-alpine",
          caption: "Image management",
        },
      ],
    },
    {
      title: "Layers of images",
      content: "Each Docker image consists of **layers** - read-only file systems, superimposed on each other according to the Union File System (OverlayFS) principle.\n\n**How layers work:**\n\n1. Each instruction in the Dockerfile (`RUN`, `COPY`, `ADD`) creates a new layer\n2. Layers are cached - if the instruction has not changed, Docker reuses the cache\n3. When starting a container, **writable layer** (container layer) is added on top of the read-only layers\n4. Changes in the runtime container are not saved after deletion (if there is no volume)\n\n**Layer Optimization:**\n\n| Bad | Okay | Why |\n|-------|--------|--------|\n| `RUN apt update && apt install -y a && apt install -y b` (3 layers) | `RUN apt update && apt install -y a b && rm -rf /var/lib/apt/lists/*` (1 layer) | Fewer layers = smaller size |\n| `COPY .` at the beginning of the Dockerfile | First `COPY package.json`, then `COPY .` | Dependency cache is not invalidated when code changes |\n| Large base image (`ubuntu:22.04` ~77MB) | `alpine` (~5MB) or `distroless` | Less attack surface |\n\n**Copy-on-Write (CoW):** When the container modifies a file from the read-only layer, Docker copies it to the writable layer. It's fast, but the writable layer grows with intensive recordings.",
      codes: [
        {
          language: "bash",
          code: "# Посмотреть слои образа\ndocker history --no-trunc myapp:latest\n\n# Размер каждого слоя\ndocker image inspect myapp:latest --format='{{range .RootFS.Layers}}{{println .}}{{end}}'\n\n# Dive — интерактивный анализ слоёв (установить отдельно)\n# docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock \\\n#   wagoodman/dive:latest myapp:latest",
          caption: "Analysis of image layers",
        },
      ],
    },
    {
      title: "Dockerfile - Basics",
      content: "**Dockerfile** is a text file with instructions for building the image. Each instruction creates a layer.\n\n**Basic Instructions:**\n\n| Instructions | Destination | Example |\n|------------|------------|--------|\n| `FROM` | Base image (required first instruction) | `FROM node:20-alpine` |\n| `WORKDIR` | Working directory inside the container | `WORKDIR /app` |\n| `COPY` | Copying files from the host | `COPY package.json .` |\n| `ADD` | Like COPY + unpack tar + URL | Prefer COPY |\n| `RUN` | Execute command during build | `RUN npm ci` |\n| `ENV` | Environment variable | `ENV NODE_ENV=production` |\n| `EXPOSE` | Port documentation (does not open!) | `EXPOSE 3000` |\n| `USER` | User for runtime | `USER app` |\n| `CMD` | Default command (overridden) | `CMD [\"node\", \"index.js\"]` |\n| `ENTRYPOINT` | Basic command (not completely overridden) | `ENTRYPOINT [\"node\"]` |\n| `HEALTHCHECK` | Container Health Check | `HEALTHCHECK CMD curl -f http://localhost/health` |\n| `ARG` | Build-time-only variable | `ARG VERSION=1.0` |\n\n**CMD vs ENTRYPOINT:**\n- `CMD` - default arguments, easily overridden: `docker run img /bin/sh`\n- `ENTRYPOINT` - fixed entry point, `docker run img --arg` adds arguments",
      code: {
        language: "dockerfile",
        code: "FROM python:3.12-slim\n\nWORKDIR /app\n\n# Зависимости — отдельный слой для кэширования\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\n# Код приложения\nCOPY . .\n\n# Non-root пользователь\nRUN groupadd -r app && useradd -r -g app app\nUSER app\n\nEXPOSE 8000\n\nHEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\n  CMD python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/health')\" || exit 1\n\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
        caption: "Basic Dockerfile for a Python application",
      },
    },
    {
      title: "Dockerfile — best practices",
      content: "A production-ready Dockerfile follows a set of proven practices that impact security, image size, and build speed.\n\n**Best practices checklist:**\n\n1. **Minimum base image** - `alpine`, `slim`, `distroless` instead of full distributions\n2. **Non-root user** - never run an application as root in a container\n3. **One process per container** - the principle of “one container - one responsibility”\n4. **Pinning versions** - `node:20.11.0-alpine`, not `node:latest`\n5. **Layer caching** - dependencies first, code second\n6. **RUN Combination** - one RUN instruction with `&&` and cache flush\n7. **COPY instead of ADD** - ADD is only for tar archives and URLs\n8. **.dockerignore** - exclude unnecessary files from the build context\n9. **HEALTHCHECK** - for orchestrators and monitoring\n10. **Metadata** - LABEL for version, maintainer, git commit\n11. **Secrets** - never copy .env, keys, passwords into the image\n12. **Form exec** - `CMD [\"node\", \"app.js\"]`, not `CMD node app.js` (PID 1, signals)\n\n**Image Size - Typical Values:**\n\n| Base image | Size | Use case |\n|------------|--------|----------|\n| `node:20` | ~1 GB | Development |\n| `node:20-slim` | ~200 MB | Compromise |\n| `node:20-alpine` | ~130 MB | Production |\n| `gcr.io/distroless/nodejs20` | ~120 MB | Maximum security |",
      codes: [
        {
          language: "dockerfile",
          code: "# ПЛОХО ❌\nFROM node:latest\nWORKDIR /app\nCOPY . .\nRUN npm install\nEXPOSE 3000\nCMD npm start\n\n# ХОРОШО ✅\nFROM node:20.11.0-alpine AS base\nWORKDIR /app\nRUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs\n\nCOPY package.json package-lock.json ./\nRUN npm ci --only=production && npm cache clean --force\n\nCOPY --chown=nodejs:nodejs . .\n\nUSER nodejs\nEXPOSE 3000\n\nHEALTHCHECK --interval=30s --timeout=5s --retries=3 \\\n  CMD wget -qO- http://localhost:3000/health || exit 1\n\nCMD [\"node\", \"dist/index.js\"]",
          caption: "Comparison of bad and good Dockerfile",
        },
      ],
    },
    {
      title: "Multi-stage builds",
      content: "**Multi-stage build** is a build technique that uses multiple `FROM` stages in a single Dockerfile. Artifacts from intermediate stages are copied into the final image, and build dependencies are discarded.\n\n**Why is it necessary:**\n\n- The final image contains only runtime dependencies\n- Image size is reduced by 5–10 times\n- Build-tools (gcc, maven, npm devDependencies) do not get into production\n- Security: fewer packages = fewer vulnerabilities\n\n**Typical patterns:**\n\n| Language/stack | Builder stage | Final stage |\n|-----------|--------------|------------|\n| Node.js | `node:20-alpine` + npm ci + build | `node:20-alpine` or distroless |\n| Go | `golang:1.22` + go build | `scratch` or `alpine` |\n| Java | `maven:3.9` + mvn package | `eclipse-temurin:21-jre-alpine` |\n| Rust | `rust:1.77` + cargo build --release | `debian:bookworm-slim` |\n| Frontend | `node:20` + npm run build | `nginx:alpine` (static) |\n\nNamed stages (`AS builder`) allow them to be referenced via `COPY --from=builder`.",
      codes: [
        {
          language: "dockerfile",
          code: "# Go — минимальный образ из scratch\nFROM golang:1.22-alpine AS builder\nWORKDIR /app\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 GOOS=linux go build -ldflags=\"-s -w\" -o /server ./cmd/server\n\nFROM scratch\nCOPY --from=builder /server /server\nCOPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/\nEXPOSE 8080\nUSER 65534:65534\nENTRYPOINT [\"/server\"]",
          caption: "Go multi-stage → image ~10 MB",
        },
        {
          language: "dockerfile",
          code: "# Node.js + React frontend\nFROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\n\nFROM deps AS builder\nCOPY . .\nRUN npm run build\n\nFROM nginx:1.25-alpine AS production\nCOPY nginx.conf /etc/nginx/conf.d/default.conf\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80\nHEALTHCHECK CMD wget -qO- http://localhost/ || exit 1",
          caption: "Frontend: build in Node, serve via nginx",
        },
      ],
    },
    {
      title: ".dockerignore",
      content: "`.dockerignore` is a file that specifies which files and directories to **exclude** from the build context. Works similar to `.gitignore`.\n\n**Why is it needed:**\n\n- **Build speed** - fewer files are sent to Docker Daemon\n- **Security** - secrets (.env, credentials) are not included in the image\n- **Image size** — node_modules, .git, tests are not copied accidentally\n- **Cache** - changing excluded files does not invalidate the layer cache\n\n**What must be excluded:**\n\n| Category | Examples |\n|-----------|---------|\n| VCS | `.git`, `.gitignore` |\n| Dependencies | `node_modules`, `vendor`, `__pycache__` |\n| Secrets | `.env`, `*.pem`, `credentials.json` |\n| IDE | `.vscode`, `.idea` |\n| Documentation | `README.md`, `docs/` (if not needed in the image) |\n| Tests | `tests/`, `*.test.js`, `coverage/` |\n| Docker | `Dockerfile*`, `docker-compose*` |\n| CI/CD | `.github/`, `.gitlab-ci.yml` |\n\n> **Important:** `.dockerignore` does not protect against `COPY .` if the file has already been copied previously. Secrets should never be in the build context.",
      code: {
        language: "text",
        code: "# .dockerignore — универсальный шаблон\n\n# VCS\n.git\n.gitignore\n\n# Зависимости (устанавливаются в Dockerfile)\nnode_modules\nvendor\n__pycache__\n*.pyc\n.venv\n\n# Секреты и конфигурация\n.env\n.env.*\n*.pem\n*.key\ncredentials.json\nsecrets/\n\n# IDE и OS\n.vscode\n.idea\n.DS_Store\nThumbs.db\n\n# Тесты и документация\ntests/\ntest/\ncoverage/\n*.test.js\n*.spec.ts\nREADME.md\ndocs/\n\n# Docker и CI\nDockerfile*\ndocker-compose*\n.dockerignore\n.github/\n.gitlab-ci.yml\n\n# Build artifacts\ndist/\nbuild/\n*.log",
        caption: "Generic .dockerignore",
      },
    },
    {
      title: "Starting, stopping and deleting containers",
      content: "Container lifecycle management is a daily task for a DevOps engineer.\n\n**Container life cycle:**\n\n`created` → `running` → `paused` → `stopped` → `removed`\n\n**Key `docker run` flags:**\n\n| Flag | Description |\n|------|----------|\n| `-d` | Detached mode (background launch) |\n| `--name` | Container name |\n| `-p HOST:CONTAINER` | Port forwarding |\n| `-e KEY=VAL` | Environment variable |\n| `-v` / `--mount` | Mounting a volume |\n| `--network` | Network connection |\n| `--restart` | Restart policy (no, always, unless-stopped, on-failure) |\n| `--rm` | Auto-delete when stopped |\n| `-it` | Interactive mode + TTY |\n| `--memory` / `--cpus` | Resource Limit |\n| `--user` | Run as a specific user |\n\n**Restart policies:**\n- `no` — do not restart (default)\n- `always` - always restart\n- `unless-stopped` - restart until manually stopped (recommended for prod)\n- `on-failure:N` — restart with non-zero exit code, maximum N times",
      codes: [
        {
          language: "bash",
          code: "# Запуск\ndocker run -d --name web -p 8080:80 --restart unless-stopped nginx:alpine\ndocker run -it --rm ubuntu:22.04 bash          # интерактивная сессия\ndocker run -d --name api -e NODE_ENV=production -e PORT=3000 myapp:1.0\n\n# Просмотр\ndocker ps                    # запущенные\ndocker ps -a                 # все (включая остановленные)\ndocker ps --format \"table {{.Names}}\\t{{.Status}}\\t{{.Ports}}\"\n\n# Остановка и удаление\ndocker stop web              # SIGTERM → SIGKILL через 10 сек\ndocker kill web              # немедленный SIGKILL\ndocker rm web                # удалить остановленный\ndocker rm -f web             # принудительно остановить и удалить\n\n# Массовая очистка\ndocker container prune       # удалить все остановленные\ndocker system prune -a       # образы, контейнеры, сети, кэш сборки\ndocker system df             # использование диска",
          caption: "Life cycle of containers",
        },
      ],
    },
    {
      title: "Port forwarding (port mapping)",
      content: "By default, container ports are only accessible within the Docker network. **Port mapping** (`-p`) maps the host port to the container port.\n\n**Formats `-p`:**\n\n| Format | Description | Example |\n|--------|---------|--------|\n| `-p HOST:CONTAINER` | Host specific port | `-p 8080:80` |\n| `-p CONTAINER` | Random Host Port | `-p 80` |\n| `-p IP:HOST:CONTAINER` | Binding to IP | `-p 127.0.0.1:8080:80` |\n| `-p HOST:CONTAINER/udp` | UDP port | `-p 53:53/udp` |\n| `-P` | Forwarding all EXPOSE ports to random | `-P` |\n\n**Typical scenarios:**\n\n- **Development:** `-p 3000:3000` - the application is available on localhost:3000\n- **Reverse proxy:** nginx on `-p 80:80 -p 443:443`, backend without forwarding\n- **Security:** `-p 127.0.0.1:5432:5432` - The database is only accessible locally\n- **Several services:** each on its own port (`-p 3000:3000 -p 3001:3001`)\n\n> **Important:** `EXPOSE` in Dockerfile is documentation only. The port is not opened without `-p` when doing `docker run` or `ports:` in Compose.",
      codes: [
        {
          language: "bash",
          code: "# Веб-сервер на порту 8080\ndocker run -d --name nginx -p 8080:80 nginx:alpine\ncurl http://localhost:8080\n\n# PostgreSQL — только localhost\ndocker run -d --name db \\\n  -e POSTGRES_PASSWORD=secret \\\n  -p 127.0.0.1:5432:5432 \\\n  postgres:16-alpine\n\n# Несколько портов\ndocker run -d --name app \\\n  -p 3000:3000 \\\n  -p 9229:9229 \\\n  myapp:dev\n\n# Узнать, какие порты проброшены\ndocker port nginx",
          caption: "Examples of port forwarding",
        },
      ],
    },
    {
      title: "Volumes - named volumes",
      content: "The data in the container is **ephemeral** by default - when the container is deleted, the writable layer is destroyed. **Volumes** solve the problem of data persistence.\n\n**Three ways to mount data:**\n\n| Type | Management | Path | Use case |\n|-----|-----------|------|----------|\n| **Volume** | Docker | `/var/lib/docker/volumes/` | DB, persistent data |\n| **Bind mount** | User | Any path on the host | Configs, hot-reload in dev |\n| **tmpfs** | Docker (RAM) | In memory | Secrets, cache |\n\n**Volumes - recommended method** for production:\n- Managed by Docker (`docker volume create/ls/rm`)\n- Works on Linux and macOS/Windows (via VM)\n- You can make a backup via `docker run --rm -v vol:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data`\n- Supports volume drivers for NFS, cloud storage\n\n**Lifecycle:** volume exists independently of the container. `docker rm` does not remove volume. `docker volume prune` removes unused ones.",
      codes: [
        {
          language: "bash",
          code: "# Создать и использовать volume\ndocker volume create pgdata\ndocker volume ls\ndocker volume inspect pgdata\n\n# PostgreSQL с персистентным хранилищем\ndocker run -d --name postgres \\\n  -e POSTGRES_PASSWORD=secret \\\n  -e POSTGRES_DB=myapp \\\n  -v pgdata:/var/lib/postgresql/data \\\n  postgres:16-alpine\n\n# Backup volume\ndocker run --rm \\\n  -v pgdata:/data:ro \\\n  -v $(pwd):/backup \\\n  alpine tar czf /backup/pgdata-backup.tar.gz -C /data .\n\n# Restore\ndocker run --rm \\\n  -v pgdata:/data \\\n  -v $(pwd):/backup \\\n  alpine tar xzf /backup/pgdata-backup.tar.gz -C /data\n\n# Удаление\ndocker volume rm pgdata\ndocker volume prune",
          caption: "Working with Docker Volumes",
        },
      ],
    },
    {
      title: "Bind mounts - directory binding",
      content: "**Bind mount** mounts a specific host filesystem path into the container. Changes are visible on both sides in real time.\n\n**Volume vs Bind mount:**\n\n| | Volume | Bind mount |\n|---|--------|-----------|\n| Path on host | Managed by Docker | Specified explicitly |\n| Portability | High | Depends on the project structure |\n| Backup | `docker volume` commands | Common tools (rsync, tar) |\n| Dev hot-reload | Inconvenient | Perfect |\n| Production | Recommended | With caution |\n\n**Typical use cases bind mount:**\n\n1. **Development** - mounting the source code for hot-reload\n2. **Configuration** - nginx.conf, prometheus.yml without rebuilding the image\n3. **Logs** - recording logs to the host for collection (Fluentd, Filebeat)\n4. **SSL certificates** - Let's Encrypt certs in nginx\n\n**Syntax `--mount` (recommended) vs `-v`:**\n\n`--mount type=bind,source=/host/path,target=/container/path,readonly`\n\nAdvantage of `--mount`: explicit syntax, support for `readonly`, `consistency` (macOS).",
      codes: [
        {
          language: "bash",
          code: "# Dev: hot-reload Node.js приложения\ndocker run -d --name dev-app \\\n  -p 3000:3000 \\\n  -v $(pwd)/src:/app/src \\\n  -v /app/node_modules \\\n  -e NODE_ENV=development \\\n  myapp:dev\n\n# Монтирование конфига nginx (read-only)\ndocker run -d --name nginx \\\n  -p 80:80 \\\n  --mount type=bind,source=$(pwd)/nginx.conf,target=/etc/nginx/nginx.conf,readonly \\\n  nginx:alpine\n\n# Логи на хост\ndocker run -d --name app \\\n  -v $(pwd)/logs:/var/log/app \\\n  myapp:latest",
          caption: "Bind mounts in development and production",
        },
      ],
    },
    {
      title: "Docker Networking",
      content: "Docker provides a built-in networking subsystem for communication between containers.\n\n**Types of networks (drivers):**\n\n| Driver | Description | Use case |\n|--------|----------|----------|\n| `bridge` | Default. Isolated network on host | Standalone containers |\n| `host` | The container uses the host network directly | Maximum performance |\n| `none` | Without network | Isolated batch tasks |\n| `overlay` | Multi-host network (Swarm) | Docker Swarm clusters |\n| `macvlan` | The container receives a MAC address | Legacy applications, VLAN |\n\n**DNS in Docker:** containers in the same user-defined bridge network address each other **by container name**. This is a key mechanism for multi-container applications.\n\n**Working procedure:**\n1. Create a network: `docker network create app-net`\n2. Launch containers on the network: `docker run --network app-net --name api ...`\n3. Access: `http://api:3000` from another container on the same network\n\n**Default bridge (`docker0`)** does not support DNS by name - use user-defined networks.",
      codes: [
        {
          language: "bash",
          code: "# Создание и управление сетями\ndocker network ls\ndocker network create --driver bridge app-network\ndocker network inspect app-network\n\n# Контейнеры в одной сети — DNS по имени\ndocker run -d --name db --network app-network \\\n  -e POSTGRES_PASSWORD=secret postgres:16-alpine\n\ndocker run -d --name api --network app-network \\\n  -e DATABASE_URL=postgres://postgres:secret@db:5432/postgres \\\n  myapi:latest\n\n# Проверка связности\ndocker exec api ping -c 2 db\ndocker exec api curl http://db:5432  # PostgreSQL не HTTP, но DNS работает\n\n# Подключить существующий контейнер к сети\ndocker network connect app-network existing-container\n\n# Отключить и удалить\ndocker network disconnect app-network existing-container\ndocker network rm app-network",
          caption: "User-defined bridge network with DNS",
        },
      ],
    },
    {
      title: "Docker Hub and GitHub Container Registry (GHCR)",
      content: "**Registry** - storage and distribution of Docker images. Without a registry, CI/CD and deployment to Kubernetes are impossible.\n\n**Popular registry:**\n\n| Registry | URL | Features |\n|----------|-----|------------|\n| Docker Hub | `docker.io` | Public, 1 free private repo |\n| GHCR | `ghcr.io` | Integration with GitHub Actions, free for the public |\n| AWS ECR | `*.dkr.ecr.*.amazonaws.com` | Native AWS integration |\n| Google GCR/AR | `gcr.io` / `*.pkg.dev` | GCP ecosystem |\n| Harbor | Self-hosted | Enterprise, scanning, RBAC |\n| Azure ACR | `*.azurecr.io` | Azure ecosystem |\n\n**Image publishing workflow:**\n\n1. Build: `docker build -t myapp:1.0.0 .`\n2. Tagging: `docker tag myapp:1.0.0 ghcr.io/username/myapp:1.0.0`\n3. Login: `docker login ghcr.io`\n4. Push: `docker push ghcr.io/username/myapp:1.0.0`\n\n**Tagging in production:**\n- Never use `:latest` in production\n- Semantic versioning: `:1.0.0`, `:1.0`, `:1`\n- Git SHA: `:sha-abc1234` for tracing\n- Immutable tags - do not overwrite existing tags",
      codes: [
        {
          language: "bash",
          code: "# Docker Hub\ndocker login\ndocker build -t username/myapp:1.0.0 .\ndocker push username/myapp:1.0.0\n\n# GitHub Container Registry\necho $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin\ndocker build -t ghcr.io/username/myapp:1.0.0 .\ndocker push ghcr.io/username/myapp:1.0.0\n\n# Pull из private registry\ndocker pull ghcr.io/username/myapp:1.0.0\ndocker run -d ghcr.io/username/myapp:1.0.0",
          caption: "Publishing images to the registry",
        },
        {
          language: "yaml",
          code: "# GitHub Actions — автоматический push в GHCR\nname: Build and Push\non:\n  push:\n    branches: [main]\n    tags: ['v*']\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      packages: write\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      - uses: docker/build-push-action@v5\n        with:\n          context: .\n          push: true\n          tags: |\n            ghcr.io/${{ github.repository }}:${{ github.sha }}\n            ghcr.io/${{ github.repository }}:latest",
          caption: "CI/CD push to GHCR via GitHub Actions",
        },
      ],
    },
    {
      title: "Debugging containers",
      content: "Being able to diagnose problems in containers is a critical skill. A container “silently falls” is a typical situation that every DevOps engineer faces.\n\n**Debugging algorithm:**\n\n1. **Is the container running?** → `docker ps -a`\n2. **Why did you stop?** → `docker logs <container>`\n3. **Exit code?** → `docker inspect --format='{{.State.ExitCode}}' <container>`\n4. **Go inside** → `docker exec -it <container> sh`\n5. **If the container crashes immediately** → `docker run -it --entrypoint sh <image>`\n6. **Docker Events** → `docker events`\n7. **Resources** → `docker stats`\n\n**Typical problems:**\n\n| Symptom | Reason | Solution |\n|---------|---------|---------|\n| Exit code 137 | OOM Kill | Increase memory limit |\n| Exit code 1 | Application Error | Check logs |\n| Port already in use | Port conflict | `lsof -i :PORT`, change port |\n| Permission denied | Run as root, volume permissions | USER in Dockerfile, chown |\n| Cannot connect to DB | Invalid hostname/network | Use container name, not localhost |\n| Image not found | No image / no auth | docker pull, docker login |\n\n**Useful tools:** `dive` (layer analysis), `ctop` (monitoring), `lazydocker` (TUI for Docker).",
      codes: [
        {
          language: "bash",
          code: "# Логи\ndocker logs myapp\ndocker logs -f myapp              # follow (real-time)\ndocker logs --tail 100 myapp      # последние 100 строк\ndocker logs --since 10m myapp     # за последние 10 минут\ndocker logs myapp 2>&1 | grep ERROR\n\n# Инспекция\ndocker inspect myapp\ndocker inspect --format='{{json .State}}' myapp | jq\ndocker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' myapp\n\n# Зайти в контейнер\ndocker exec -it myapp sh\ndocker exec -it myapp bash        # если bash установлен\ndocker exec -u root -it myapp sh # от root для отладки\n\n# Переопределить entrypoint для отладки\ndocker run -it --rm --entrypoint sh myapp:broken\n\n# Мониторинг ресурсов\ndocker stats\ndocker stats --no-stream --format \"table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\"\n\n# Копирование файлов\ndocker cp myapp:/var/log/app.log ./app.log\ndocker cp ./config.yml myapp:/etc/app/config.yml",
          caption: "Docker Debugging Tools",
        },
      ],
    },
    {
      title: "Docker Security",
      content: "Containers **are not** full-fledged sandbox insulation. Docker security is the responsibility of both the image developer and the operator.\n\n**Safety Principles:**\n\n1. **Don't run as root** - `USER` in Dockerfile, `--user` in run\n2. **Minimum image** - fewer packages = fewer CVEs\n3. **Image scanning** - Trivy, Snyk, Docker Scout\n4. **Don't store secrets in the image** - Docker Secrets, Vault, env vars\n5. **Read-only filesystem** — `--read-only` + tmpfs for /tmp\n6. **Capabilities limitation** — `--cap-drop=ALL --cap-add=NET_BIND_SERVICE`\n7. **Don't mount docker.sock** into a container unless absolutely necessary\n8. **Update base images** - regular rebuild with current patches\n9. **Content Trust** - Docker Content Trust (DCT) for image verification\n10. **AppArmor/SELinux** - security profiles on the host\n\n**Vulnerability Scanning:**\n\n| Tool | Type | Team |\n|-----------|-----|---------|\n| Trivy | Open source | `trivy image myapp:1.0` |\n| Docker Scout | Built into Docker | `docker scout cves myapp:1.0` |\n| Snyk | SaaS | `snyk container test myapp:1.0` |\n| Gripe | Open source (Anchor) | `grype myapp:1.0` |\n\n**Rootless Docker** - launch Docker Daemon without root privileges. Increases host security, but has limitations (ports < 1024, overlay networks).",
      codes: [
        {
          language: "bash",
          code: "# Сканирование образа\ndocker scout cves myapp:1.0.0\ntrivy image --severity HIGH,CRITICAL myapp:1.0.0\n\n# Безопасный запуск\ndocker run -d \\\n  --name secure-app \\\n  --read-only \\\n  --tmpfs /tmp \\\n  --cap-drop=ALL \\\n  --security-opt=no-new-privileges \\\n  --user 1001:1001 \\\n  --memory=512m \\\n  --cpus=1.0 \\\n  myapp:1.0.0\n\n# Проверить, от какого пользователя работает контейнер\ndocker exec secure-app id",
          caption: "Safe launch and scanning",
        },
      ],
    },
    {
      title: "Production checklist for Docker",
      content: "Before rolling out the Docker image to production, go through this checklist. Each point is tested on real incidents.\n\n**Image:**\n\n- [ ] Multi-stage build - the final image is minimal\n- [ ] Base image pinned by digest or exact version\n- [ ] Non-root USER in Dockerfile\n- [ ] HEALTHCHECK defined\n- [ ].dockerignore configured\n- [ ] CVE scan passed (0 CRITICAL)\n- [ ] The image is signed (cosign/notary)\n- [ ] Tag - semver, not `:latest`\n\n**Runtime:**\n\n- [ ] `--restart unless-stopped` or orchestrator\n- [ ] Resource limits: `--memory`, `--cpus`\n- [ ] Logging: json-file with rotation or driver (fluentd, syslog)\n- [ ] Volumes for persistent data (not bind mount)\n- [ ] Secrets via env/secrets manager, not in the image\n- [ ] Read-only root filesystem where possible\n- [ ] Capabilities dropped\n\n**Monitoring:**\n\n- [ ] Health endpoint (`/health`, `/ready`)\n- [ ] Metrics (Prometheus exporter or /metrics)\n- [ ] Structured logging (JSON)\n- [ ] Graceful shutdown (SIGTERM processing)\n\n**CI/CD:**\n\n- [ ] Automatic build for every merge\n- [ ] Tests in the pipeline before the push image\n- [ ] Immutable tags in registry\n- [ ] Rollback plan (previous tag is always available)\n\n**Documentation:**\n\n- [ ] README with startup instructions\n- [ ] Environment variables are documented\n- [ ] Ports and volumes are described",
      codes: [
        {
          language: "bash",
          code: "# Production-ready запуск\ndocker run -d \\\n  --name myapp-prod \\\n  --restart unless-stopped \\\n  --read-only \\\n  --tmpfs /tmp:rw,noexec,nosuid,size=64m \\\n  --cap-drop=ALL \\\n  --security-opt=no-new-privileges \\\n  --user 1001:1001 \\\n  --memory=1g \\\n  --memory-swap=1g \\\n  --cpus=2.0 \\\n  --pids-limit=200 \\\n  --log-driver=json-file \\\n  --log-opt max-size=10m \\\n  --log-opt max-file=5 \\\n  -e NODE_ENV=production \\\n  -v app-data:/data \\\n  -p 127.0.0.1:3000:3000 \\\n  ghcr.io/myorg/myapp:1.2.3\n\n# Проверка\ndocker inspect myapp-prod --format='{{.State.Health.Status}}'\ndocker stats myapp-prod --no-stream",
          caption: "Production-ready docker run",
        },
      ],
    },
  ],
  practice: [
    "Install Docker Engine or Docker Desktop and run hello-world",
    "Write a Dockerfile with multi-stage build for your application (or a simple HTTP server in Node/Python/Go)",
    "Create a .dockerignore and make sure node_modules and .env are not included in the image",
    "Build an image, scan it using trivy or docker scout for vulnerabilities",
    "Run PostgreSQL with a named volume, create a table, delete the container, recreate - the data should be saved",
    "Create a user-defined bridge network, launch two containers and check DNS connectivity by name",
    "Push the image to GitHub Container Registry (GHCR) with the semver tag",
    "Set up a container with --read-only, non-root user, memory limit and healthcheck",
    "Debug a broken container: find the cause using logs, inspect and exec",
    "Go through the production checklist for your image and fix any problems found",
  ],
  resources: [
    { title: "Docker Documentation", url: "https://docs.docker.com" },
    { title: "Play with Docker (free sandbox)", url: "https://labs.play-with-docker.com" },
  ],
  quiz: [
    {
      question: "How is an image different from a container?",
      options: [
        "The image is an immutable template, the container is a running instance",
        "These are synonyms",
        "The container is stored in the registry, the image is stored only locally",
        "The image is always larger than runtime",
      ],
      answer: "The image is an immutable template, the container is a running instance",
    },
    {
      question: "What does each layer record in the Dockerfile?",
      answer: "New read-only layer of the image file system (except for the final container with a writable layer).",
    },
    {
      question: "Why use multi-stage build?",
      options: [
        "Reduce the size of the final image by separating the build from the runtime",
        "Run multiple containers in one process",
        "Bypass Docker Hub limits",
        "Disable layer cache",
      ],
      answer: "Reduce the size of the final image by separating the build from the runtime",
    },
    {
      question: "What does the -p 8080:80 flag do when docker run?",
      options: [
        "Forwards host port 8080 to container port 80",
        "Publishes the image to the registry",
        "Changes permissions to volume",
        "Runs a container in privileged without a network",
      ],
      answer: "Forwards host port 8080 to container port 80",
    },
    {
      question: "How does the default bridge network differ from host network mode?",
      answer: "Bridge isolates the container with NAT; host mode uses the host's network namespace directly.",
    },
    {
      question: "How to view container logs?",
      options: [
        "docker logs <container>",
        "docker images",
        "docker network ls",
        "docker volume prune",
      ],
      answer: "docker logs <container>",
    },
    {
      question: "What does .dockerignore do?",
      options: [
        "Excludes files from the build context during docker build",
        "Blocks pulling images from registry",
        "Disables container networking",
        "Removes unused volumes",
      ],
      answer: "Excludes files from the build context during docker build",
      explanation: "Speeds up builds and avoids copying secrets/node_modules into the context.",
    },
    {
      question: "How does docker exec differ from docker attach?",
      options: [
        "exec runs a new command in the container; attach connects to the main process",
        "attach always opens a shell",
        "exec works only on Windows",
        "No difference",
      ],
      answer: "exec runs a new command in the container; attach connects to the main process",
    },
    {
      question: "Why use a digest (sha256) instead of the latest tag when pulling an image?",
      options: [
        "To guarantee an exact immutable version of the image",
        "To speed up the network 10x",
        "To bypass Docker Hub limits without authentication",
        "latest is always immutable",
      ],
      answer: "To guarantee an exact immutable version of the image",
      explanation: "Tags can be overwritten; digest pins the contents.",
    },
    {
      question: "How do you remove all stopped containers with one command?",
      answer: "docker container prune (or docker rm $(docker ps -aq) with caution).",
    },
  ],
}

export default translation
