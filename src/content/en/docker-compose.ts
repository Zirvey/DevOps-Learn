import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: "Docker Compose",
  duration: "4–5 hours",
  description: "A complete guide to Docker Compose: multi-container stacks, networks, volumes, healthchecks and production patterns",
  sections: [
    {
      title: "What is Docker Compose",
      content: "**Docker Compose** is a tool for defining and running multi-container applications. The entire stack is described in a YAML file (`compose.yaml` or `docker-compose.yml`), and one command brings up all the services.\n\n**Problem without Compose:**\n\n```\n\nbash\ndocker network create app-net\ndocker run -d --name db --network app-net -e POSTGRES_PASSWORD=secret -v pgdata:/data postgres:16\ndocker run -d --name cache --network app-net redis:7-alpine\ndocker run -d --name api --network app-net -e DATABASE_URL=... -p 3000:3000 myapi\n# ... и так для каждого сервиса, в правильном порядке\n```\n\n**With Compose:**\n\n```\n\nbash\ndocker compose up -d\n```\n\n**When to use Compose:**\n\n| Script | Is Compose suitable? |\n|----------|-------------------|\n| Local development | Yes - perfect |\n| CI/CD integration tests | Yes - raise the stack, run tests, teardown |\n| Staging (small projects) | Yes - with caution |\n| Production (high availability) | No - use Kubernetes/Swarm |\n| Demo and training | Yes |\n\nCompose has been part of the Docker CLI since version 2 (the `docker compose` plugin, not a separate `docker-compose` binary).",
    },
    {
      title: "Compose v1 vs v2 and file structure",
      content: "**Compose v2** (current version) is a built-in Docker CLI plugin. Command: `docker compose` (space separated).\n\n**Key differences v1 → v2:**\n\n| | Compose v1 | Compose v2 |\n|---|-----------|------------|\n| Team | `docker-compose` | `docker compose` |\n| Implementation | Python | Go (in Docker CLI) |\n| Build | Separate builder | BuildKit |\n| Profiles | No | Yes |\n| Watch | No | Yes (dev mode) |\n| Status | Deprecated | Active development |\n\n**Compose.yaml structure:**\n\n```\n\nyaml\n# Верхнеуровневые ключи\nname: my-project          # Имя проекта (префикс контейнеров)\nservices:                 # Описание сервисов (контейнеров)\n  app: ...\n  db: ...\nnetworks:                 # Пользовательские сети\n  backend: ...\nvolumes:                  # Именованные тома\n  pgdata: ...\nsecrets:                  # Секреты (Swarm / Compose)\n  db_password: ...\nconfigs:                  # Конфигурационные файлы\n  nginx_conf: ...\n```\n\n**File name:** `compose.yaml` (recommended), `compose.yml`, `docker-compose.yaml`. Docker searches for files in the current directory automatically.",
      codes: [
        {
          language: "bash",
          code: "# Проверить версию\ndocker compose version\n\n# Указать конкретный файл\ndocker compose -f compose.yaml up -d\ndocker compose -f compose.yaml -f compose.prod.yaml up -d\n\n# Указать имя проекта\ndocker compose -p myproject up -d",
          caption: "Basic Compose v2 commands",
        },
      ],
    },
    {
      title: "Services - main parameters",
      content: "Each key in `services:` describes one container (or a group of replicas in Swarm mode).\n\n**Main parameters of the service:**\n\n| Parameter | Description | Example |\n|----------|----------|--------|\n| `image` | Ready image from registry | `postgres:16-alpine` |\n| `build` | Build from Dockerfile | `build: .` or `build: { context: ., dockerfile: Dockerfile.dev }` |\n| `ports` | Port forwarding | `\"8080:80\"` or `\"127.0.0.1:5432:5432\"` |\n| `expose` | Open port only within the network | `expose: [\"3000\"]` |\n| `environment` | Environment Variables | `POSTGRES_PASSWORD: secret` |\n| `env_file` | File with variables | `env_file: .env` |\n| `volumes` | Mounting | `pgdata:/var/lib/postgresql/data` |\n| `networks` | Connecting to networks | `networks: [backend, frontend]` |\n| `depends_on` | Dependencies (run order) | `depends_on: [db, cache]` |\n| `restart` | Restart Policy | `unless-stopped` |\n| `healthcheck` | Health check | see separate section |\n| `deploy` | Resources (Swarm/Compose) | `replicas: 3` |\n| `command` | CMD Override | `command: npm run dev` |\n| `entrypoint` | Overriding ENTRYPOINT | |\n| `user` | User | `\"1001:1001\"` |\n| `working_dir` | Working directory | `/app` |\n| `labels` | Metadata | for Traefik, monitoring |",
      code: {
        language: "yaml",
        code: "services:\n  api:\n    build:\n      context: ./api\n      dockerfile: Dockerfile\n      target: development\n      args:\n        NODE_VERSION: \"20\"\n    image: myapp-api:dev\n    ports:\n      - \"3000:3000\"\n    environment:\n      NODE_ENV: development\n      DATABASE_URL: postgres://app:secret@db:5432/myapp\n      REDIS_URL: redis://cache:6379\n    env_file:\n      - .env\n    volumes:\n      - ./api/src:/app/src          # hot-reload\n      - /app/node_modules            # anonymous volume\n    networks:\n      - backend\n    depends_on:\n      db:\n        condition: service_healthy\n      cache:\n        condition: service_started\n    restart: unless-stopped\n    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:3000/health\"]\n      interval: 30s\n      timeout: 5s\n      retries: 3\n      start_period: 10s",
        caption: "Full API service example",
      },
    },
    {
      title: "Volumes and networks in Compose",
      content: "Compose automatically creates a **default network** for the project. All services in it can access each other by service name (DNS).\n\n**Volumes in Compose:**\n\n| Syntax | Type | Example |\n|-----------|-----|--------|\n| `volume_name:/path` | Named volume | `pgdata:/var/lib/postgresql/data` |\n| `./host/path:/container/path` | Bind mount | `./src:/app/src` |\n| `/container/path` | Anonymous volume | `/app/node_modules` |\n\n**Networks in Compose:**\n\n- **Default** — all services in one bridge network\n- **Custom** - isolation: frontend network for nginx, backend network for API and database\n- **External** — connection to an existing network: `external: true`\n\n**Isolation pattern:** nginx in `frontend` + `backend` networks, API only in `backend`, DB only in `backend`. Nginx cannot directly reach the database.",
      codes: [
        {
          language: "yaml",
          code: "services:\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"\n    networks:\n      - frontend\n      - backend\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro\n\n  api:\n    build: ./api\n    expose:\n      - \"3000\"\n    networks:\n      - backend\n    volumes:\n      - api-logs:/var/log/app\n\n  db:\n    image: postgres:16-alpine\n    networks:\n      - backend\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\nnetworks:\n  frontend:\n    driver: bridge\n  backend:\n    driver: bridge\n    internal: true    # нет доступа к интернету\n\nvolumes:\n  pgdata:\n    driver: local\n  api-logs:",
          caption: "Isolated networks and volumes",
        },
      ],
    },
    {
      title: "Environment Variables and Secrets",
      content: "Compose supports several ways to pass configuration to containers.\n\n**Ways to set variables (by priority, from lowest to highest):**\n\n1. `env_file: .env` - file with KEY=VALUE\n2. `environment:` in compose.yaml\n3. Shell environment at startup: `DATABASE_URL=... docker compose up`\n4. `--env-file` CLI flag\n\n**Variable substitution in compose.yaml:**\n\n```\n\nyaml\nservices:\n  db:\n    image: postgres:${POSTGRES_VERSION:-16}-alpine\n    environment:\n      POSTGRES_PASSWORD: ${DB_PASSWORD:?err}\n```\n\n- `${VAR:-default}` — default value\n- `${VAR:?error}` — required variable, error if not specified\n- `${VAR}` - substitution from .env or shell\n\n**Secrets (Compose, not Swarm):**\n\nFor production, use external secret managers (Vault, AWS SSM). In Compose, secrets are mounted as files in `/run/secrets/`.\n\n> **Important:** Add the `.env` file to `.gitignore`. Create `.env.example` with empty/dummy values ​​for documentation.",
      codes: [
        {
          language: "text",
          code: "# .env.example — шаблон для разработчиков\nPOSTGRES_VERSION=16\nDB_PASSWORD=changeme\nDB_NAME=myapp\nDB_USER=app\nREDIS_PASSWORD=\nAPI_PORT=3000\nNODE_ENV=development",
          caption: ".env.example - variable template",
        },
        {
          language: "yaml",
          code: "services:\n  db:\n    image: postgres:${POSTGRES_VERSION:-16}-alpine\n    environment:\n      POSTGRES_DB: ${DB_NAME}\n      POSTGRES_USER: ${DB_USER}\n      POSTGRES_PASSWORD: ${DB_PASSWORD:?Database password is required}\n    env_file:\n      - .env\n\n  api:\n    build: .\n    environment:\n      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}\n      REDIS_URL: redis://:${REDIS_PASSWORD}@cache:6379",
          caption: "Variable substitution in compose.yaml",
        },
      ],
    },
    {
      title: "Health checks and depends_on",
      content: "**Healthcheck** allows Compose (and orchestrators) to determine if a service is ready to accept traffic.\n\n**healthcheck parameters:**\n\n| Parameter | Description | Default |\n|----------|----------|--------------|\n| `test` | Review Team | — |\n| `interval` | Check interval | 30s |\n| `timeout` | Team timeout | 30s |\n| `retries` | Failed attempts to unhealthy | 3 |\n| `start_period` | Grace period at start | 0s |\n\n**depends_on with condition:**\n\n`depends_on` without condition only guarantees **startup order**, but not service readiness. With `condition: service_healthy` Compose waits for the healthcheck to pass.\n\n| Condition | Behavior |\n|-----------|-----------|\n| `service_started` | Container started (default) |\n| `service_healthy` | Healthcheck passed |\n| `service_completed_successfully` | The container exited with exit 0 (for init/migration) |\n\n**Typical pattern:** init container for database migrations → API waits for healthy DB → nginx waits for healthy API.",
      codes: [
        {
          language: "yaml",
          code: "services:\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: myapp\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres -d myapp\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n      start_period: 10s\n\n  migrate:\n    build: ./api\n    command: npm run migrate\n    depends_on:\n      db:\n        condition: service_healthy\n    restart: \"no\"\n\n  api:\n    build: ./api\n    depends_on:\n      db:\n        condition: service_healthy\n      migrate:\n        condition: service_completed_successfully\n    healthcheck:\n      test: [\"CMD\", \"wget\", \"-qO-\", \"http://localhost:3000/health\"]\n      interval: 10s\n      timeout: 5s\n      retries: 3\n      start_period: 30s",
          caption: "Dependency chain with healthcheck",
        },
      ],
    },
    {
      title: "Full stack: API + PostgreSQL + Redis + Nginx",
      content: "Let's consider a production-like stack for a typical web application. This example demonstrates all the key concepts of Compose.\n\n**Stack architecture:**\n\n```\nInternet → Nginx (:80) → API (:3000) → PostgreSQL (:5432)\n                                      → Redis (:6379)\n```\n\n**Components:**\n\n| Service | Role | Image |\n|--------|------|-------|\n| nginx | Reverse proxy, SSL termination, static files | nginx:alpine |\n| api | Backend REST API | custom build |\n| db | Relational database | postgres:16-alpine |\n| cache | Cache, sessions, queues | redis:7-alpine |\n\nThe stack uses isolated networks, healthchecks, named volumes and environment variables from the .env file.",
      code: {
        language: "yaml",
        code: "name: myapp\n\nservices:\n  nginx:\n    image: nginx:1.25-alpine\n    ports:\n      - \"${NGINX_PORT:-80}:80\"\n    volumes:\n      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro\n      - ./nginx/static:/usr/share/nginx/html:ro\n    networks:\n      - frontend\n    depends_on:\n      api:\n        condition: service_healthy\n    restart: unless-stopped\n    healthcheck:\n      test: [\"CMD\", \"wget\", \"-qO-\", \"http://localhost/health\"]\n      interval: 30s\n      timeout: 5s\n      retries: 3\n\n  api:\n    build:\n      context: ./api\n      dockerfile: Dockerfile\n    image: myapp-api:${APP_VERSION:-latest}\n    expose:\n      - \"3000\"\n    environment:\n      NODE_ENV: production\n      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}\n      REDIS_URL: redis://cache:6379\n      PORT: 3000\n    networks:\n      - frontend\n      - backend\n    depends_on:\n      db:\n        condition: service_healthy\n      cache:\n        condition: service_healthy\n    restart: unless-stopped\n    healthcheck:\n      test: [\"CMD\", \"wget\", \"-qO-\", \"http://localhost:3000/health\"]\n      interval: 15s\n      timeout: 5s\n      retries: 3\n      start_period: 40s\n    deploy:\n      resources:\n        limits:\n          cpus: \"1.0\"\n          memory: 512M\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: ${DB_USER}\n      POSTGRES_PASSWORD: ${DB_PASSWORD}\n      POSTGRES_DB: ${DB_NAME}\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro\n    networks:\n      - backend\n    restart: unless-stopped\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U ${DB_USER} -d ${DB_NAME}\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n    deploy:\n      resources:\n        limits:\n          memory: 1G\n\n  cache:\n    image: redis:7-alpine\n    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru\n    volumes:\n      - redisdata:/data\n    networks:\n      - backend\n    restart: unless-stopped\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      timeout: 3s\n      retries: 5\n\nnetworks:\n  frontend:\n    driver: bridge\n  backend:\n    driver: bridge\n    internal: true\n\nvolumes:\n  pgdata:\n  redisdata:",
        caption: "Full production-like composition.yaml",
      },
    },
    {
      title: "Override files and profiles",
      content: "Compose supports **multiple files** and **profiles** for different environments and scenarios.\n\n**Override files:**\n\nDocker Compose automatically reads `compose.yaml` + `compose.override.yaml` (if exists). Override **merges** over the main file.\n\n```\n\nbash\n# Dev (автоматически: compose.yaml + compose.override.yaml)\ndocker compose up -d\n\n# Production\ndocker compose -f compose.yaml -f compose.prod.yaml up -d\n\n# CI\ndocker compose -f compose.yaml -f compose.ci.yaml up -d --abort-on-container-exit\n```\n\n**Typical differences between dev vs prod:**\n\n| Parameter | Dev (override) | Prod |\n|----------|----------------|------|\n| Build target | `development` | `production` |\n| Volumes | Bind mount sources | Named volumes only |\n| Ports | All ports out | Only nginx :80/:443 |\n| Restart | `no` | `unless-stopped` |\n| Resources | No limits | CPU/memory limits |\n| Logging | debug level | info/warn |\n\n**Profiles** — conditional inclusion of services:\n\n```\n\nbash\ndocker compose --profile debug up -d    # включает сервисы с profiles: [debug]\ndocker compose --profile monitoring up -d\n```\n\nServices without `profiles` always start. With `profiles` - only when explicitly specified.",
      codes: [
        {
          language: "yaml",
          code: "# compose.override.yaml — автоматически для dev\nservices:\n  api:\n    build:\n      target: development\n    volumes:\n      - ./api/src:/app/src\n      - /app/node_modules\n    environment:\n      NODE_ENV: development\n      DEBUG: \"app:*\"\n    ports:\n      - \"3000:3000\"\n      - \"9229:9229\"    # Node.js debugger\n\n  db:\n    ports:\n      - \"5432:5432\"     # прямой доступ к БД для dev\n\n  # Adminer — только для разработки\n  adminer:\n    image: adminer\n    ports:\n      - \"8080:8080\"\n    profiles:\n      - debug\n    depends_on:\n      - db",
          caption: "compose.override.yaml for development",
        },
        {
          language: "yaml",
          code: "# compose.prod.yaml\nservices:\n  api:\n    build:\n      target: production\n    image: ghcr.io/myorg/myapp:${APP_VERSION}\n    environment:\n      NODE_ENV: production\n    deploy:\n      resources:\n        limits:\n          cpus: \"2.0\"\n          memory: 1G\n    logging:\n      driver: json-file\n      options:\n        max-size: \"10m\"\n        max-file: \"5\"\n\n  nginx:\n    ports:\n      - \"80:80\"\n      - \"443:443\"\n    volumes:\n      - ./nginx/ssl:/etc/nginx/ssl:ro",
          caption: "compose.prod.yaml for production",
        },
      ],
    },
    {
      title: "Docker Compose Commands",
      content: "A complete reference of Compose v2 commands for your daily work.\n\n**Lifecycle management:**\n\n| Team | Description |\n|---------|----------|\n| `docker compose up -d` | Running in background |\n| `docker compose up -d --build` | Reassembly + launch |\n| `docker compose up -d --force-recreate` | Recreate containers |\n| `docker compose down` | Stopping and removing containers |\n| `docker compose down -v` | + remove volumes |\n| `docker compose down --rmi all` | + removal of images |\n| `docker compose stop` | Stop without deleting |\n| `docker compose start` | Starting stopped |\n| `docker compose restart api` | Restarting a specific service |\n\n**Monitoring and Debugging:**\n\n| Team | Description |\n|---------|----------|\n| `docker compose ps` | Services status |\n| `docker compose logs -f api` | Real-time logs |\n| `docker compose logs --tail=50` | Last 50 lines |\n| `docker compose exec api sh` | Shell in container |\n| `docker compose top` | Processes in containers |\n| `docker compose port api 3000` | Forwarded port |\n| `docker compose config` | Validate and show final YAML |",
      codes: [
        {
          language: "bash",
          code: "# Запуск и остановка\ndocker compose up -d\ndocker compose up -d --build --force-recreate api\ndocker compose down\ndocker compose down -v --remove-orphans\n\n# Мониторинг\ndocker compose ps\ndocker compose ps --format json\ndocker compose logs -f --tail=100 api db\ndocker compose top\n\n# Выполнение команд\ndocker compose exec api sh\ndocker compose exec -u root db psql -U postgres -d myapp\ndocker compose run --rm api npm test        # одноразовый контейнер\ndocker compose run --rm api npm run migrate\n\n# Масштабирование (без Swarm — дублирует контейнеры)\ndocker compose up -d --scale api=3\n\n# Валидация\ndocker compose config                    # итоговый YAML\ndocker compose config --quiet            # только проверка синтаксиса\n\n# Образы\ndocker compose build\ndocker compose build --no-cache api\ndocker compose pull\ndocker compose push",
          caption: "Complete Compose Command Reference",
        },
      ],
    },
    {
      title: "Compose Watch - Development Mode",
      content: "**Compose Watch** (Docker Compose 2.22+) - built-in mechanism for synchronizing files and automatically restarting when changes occur. An alternative to bind mount for hot-reload.\n\n**Watch actions:**\n\n| Action | Description |\n|--------|----------|\n| `sync` | Synchronizing files into a container |\n| `sync+restart` | Synchronization + container restart |\n| `rebuild` | Rebuilding the image when changing |\n| `sync+exec` | Synchronization + command execution |\n\n**Launch:**\n\n```\n\nbash\ndocker compose watch\n# или\ndocker compose up --watch\n```\n\n**When to use Watch vs bind mount:**\n\n| | Bind mount | Compose Watch |\n|---|-----------|--------------|\n| Speed ​​| Instantly | Slight delay |\n| Compatibility | Problems on macOS/Windows | Cross-platform |\n| node_modules | Host conflict | No conflict |\n| Rebuild | Manual | Automatic |",
      code: {
        language: "yaml",
        code: "services:\n  api:\n    build: ./api\n    ports:\n      - \"3000:3000\"\n    develop:\n      watch:\n        - action: sync\n          path: ./api/src\n          target: /app/src\n          ignore:\n            - node_modules/\n        - action: rebuild\n          path: ./api/package.json\n        - action: sync+restart\n          path: ./api/prisma/schema.prisma",
        caption: "Compose Watch for hot-reload",
      },
    },
    {
      title: "Compose in CI/CD",
      content: "Docker Compose is widely used in CI/CD for integration tests: raise the full stack, run tests, delete everything.\n\n**CI pipeline pattern:**\n\n1. `docker compose -f compose.yaml -f compose.ci.yaml build`\n2. `docker compose -f compose.yaml -f compose.ci.yaml up -d`\n3. Wait healthy for all services\n4. Run tests: `docker compose exec -T api npm test`\n5. `docker compose down -v` (always, even if there is an error - `if: always()`)\n\n**compose.ci.yaml features:**\n\n- Fixed passwords (not from .env)\n- Port forwarding for test runner\n- `restart: \"no\"` - do not restart if it crashes\n- Minimal resources\n- Healthcheck with short start_period\n\n**GitHub Actions example** - tests against real PostgreSQL and Redis, not mocks.",
      codes: [
        {
          language: "yaml",
          code: "# compose.ci.yaml\nservices:\n  api:\n    build:\n      context: ./api\n      target: test\n    environment:\n      NODE_ENV: test\n      DATABASE_URL: postgres://test:test@db:5432/testdb\n      REDIS_URL: redis://cache:6379\n    depends_on:\n      db:\n        condition: service_healthy\n    restart: \"no\"\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: test\n      POSTGRES_PASSWORD: test\n      POSTGRES_DB: testdb\n    tmpfs:\n      - /var/lib/postgresql/data    # RAM disk — быстрее для CI\n    restart: \"no\"",
          caption: "compose.ci.yaml for tests",
        },
        {
          language: "yaml",
          code: "# .github/workflows/test.yml\nname: Integration Tests\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Start services\n        run: docker compose -f compose.yaml -f compose.ci.yaml up -d --wait\n      - name: Run tests\n        run: docker compose -f compose.yaml -f compose.ci.yaml exec -T api npm test\n      - name: Tear down\n        if: always()\n        run: docker compose -f compose.yaml -f compose.ci.yaml down -v",
          caption: "GitHub Actions with Compose",
        },
      ],
    },
    {
      title: "Compose in production - limitations and alternatives",
      content: "Docker Compose **can** work in production for small projects, but it has fundamental limitations.\n\n**Limitations of Compose in production:**\n\n| Limit | Consequence |\n|------------|------------|\n| No auto-scaling | Manual `--scale`, no response to load |\n| Single host | No distribution across servers (no Swarm) |\n| No rolling updates | Downtime when updating |\n| No self-healing | restart policy - maximum there is |\n| No service mesh | No mTLS, circuit breaker, retry |\n| No RBAC | Anyone with host access controls everything |\n\n**When Compose in production is acceptable:**\n\n- MVP/pet projects with one server\n- Internal tools with low traffic\n- Staging environment\n- VPS with 1–2 services and `restart: unless-stopped`\n\n**When you need Kubernetes:**\n\n-> 3 services with dependencies\n- Requires zero-downtime deployment\n- Auto-scaling by CPU/RPS\n- Multi-node cluster\n- Compliance (RBAC, network policies, audit)\n\n**Compose → Kubernetes migration:** Kompose (`kompose convert`) generates K8s manifests from compose.yaml. The result is a starting point, not a final solution.",
    },
    {
      title: "Troubleshooting Docker Compose",
      content: "Typical problems when working with Compose and how to solve them.\n\n**Diagnostic algorithm:**\n\n1. `docker compose config` - is YAML valid?\n2. `docker compose ps` - are all services running/healthy?\n3. `docker compose logs <service>` - errors in logs?\n4. `docker compose exec <service> sh` - go in and check\n5. `docker network inspect <project>_backend` - DNS, IP addresses\n\n**Common problems:**\n\n| Problem | Reason | Solution |\n|----------|---------|---------|\n| `service \"api\" is not running` | The container fell at the start | `docker compose logs api` |\n| `connection refused` to db | depends_on without healthcheck | Add condition: service_healthy |\n| `port is already allocated` | Port busy on host | `lsof -i :PORT`, change port |\n| `volume already exists` | volumes name conflict | `docker compose down -v` |\n| Slow bind mount (macOS) | VirtioFS/osxfs | Use named volume or Compose Watch |\n| `env variable not set` | No .env file | Copy .env.example → .env |\n| Orphan containers | Service removed from yaml | `docker compose down --remove-orphans` |\n| Build cache is deprecated | Old layers | `docker compose build --no-cache` |",
      codes: [
        {
          language: "bash",
          code: "# Диагностика\ndocker compose config --quiet          # валидация\ndocker compose ps -a                   # все контейнеры\ndocker compose logs --tail=50 api      # последние логи\ndocker compose events                  # события в реальном времени\n\n# Проверка сети\ndocker compose exec api ping -c 2 db\ndocker compose exec api nc -zv db 5432\n\n# Проверка DNS\ndocker compose exec api nslookup db\n\n# Полный reset\ndocker compose down -v --remove-orphans --rmi local\ndocker compose up -d --build --force-recreate\n\n# Проверить итоговую конфигурацию\ndocker compose config > resolved-config.yaml",
          caption: "Diagnosing Compose problems",
        },
      ],
    },
  ],
  practice: [
    "Create compose.yaml with API (build) + PostgreSQL + Redis - check DNS connectivity between services",
    "Add healthcheck for each service and depends_on with condition: service_healthy",
    "Setting up compose.override.yaml for dev with bind mount and debug port",
    "Create compose.prod.yaml with resource limits, restart policy and without database port forwarding",
    "Add nginx as a reverse proxy in front of the API with isolated frontend/backend networks",
    "Set up .env and .env.example - make sure .env is in .gitignore",
    "Write GitHub Actions workflow: compose up → integration tests → compose down",
    "Try Compose Watch for hot-reload when changing sources",
    "Perform a database migration through a one-time service with condition: service_completed_successfully",
    "Carry out a complete troubleshooting: break the configuration and restore the stack using the algorithm from the chapter",
  ],
  resources: [
    { title: "Docker Compose Documentation", url: "https://docs.docker.com/compose/" },
    { title: "Compose Specification", url: "https://compose-spec.io" },
  ],
  quiz: [
    {
      question: "What file does docker compose read by default?",
      options: [
        "docker-compose.yml or compose.yaml",
        "Dockerfile",
        "package.json",
        "helm values.yaml",
      ],
      answer: "docker-compose.yml or compose.yaml",
    },
    {
      question: "How to associate services by name in Compose?",

      options: [
        "Services in the same user-defined network refer to each other by service name as a DNS name.",
        "You must use hardcoded container IP addresses",
        "Services connect via links: in Compose v3",
        "Service name is available only in host network mode",
      ],
      answer: "Services in the same user-defined network refer to each other by service name as a DNS name.",
    },
    {
      question: "What does depends_on do?",
      options: [
        "Sets the startup order, but does not wait for the application to be ready without healthcheck",
        "Ensures that the database has accepted connections",
        "Creates Kubernetes Deployment",
        "Mounts secrets from Vault",
      ],
      answer: "Sets the startup order, but does not wait for the application to be ready without healthcheck",
    },
    {
      question: "How is volume different from bind mount?",
      options: [
        "Volume is managed by Docker, bind mount is a direct path from the host",
        "Bind mount is faster only on Windows",
        "Volume cannot be made persistent",
        "No difference",
      ],
      answer: "Volume is managed by Docker, bind mount is a direct path from the host",
    },
    {
      question: "How to override environment variables for local development?",

      options: [
        "Via .env file, environment in compose or docker compose --env-file.",
        "Only by editing Dockerfile without compose",
        "Via git commit message",
        "By renaming the container with docker rename",
      ],
      answer: "Via .env file, environment in compose or docker compose --env-file.",
    },
    {
      question: "How to raise a stack in the background?",
      options: [
        "docker compose up -d",
        "docker compose build --no-cache only",
        "docker run compose",
        "kubectl apply -f compose.yml",
      ],
      answer: "docker compose up -d",
    },
    {
      question: "How do you define a healthcheck for a service in Compose?",
      options: [
        "healthcheck section with test, interval, retries in the service definition",
        "Only via external Kubernetes probe",
        "Via Dockerfile EXPOSE",
        "Healthcheck is not supported in Compose",
      ],
      answer: "healthcheck section with test, interval, retries in the service definition",
      explanation: "Enables depends_on with condition: service_healthy in Compose v2.",
    },
    {
      question: "What does docker compose down -v do?",
      options: [
        "Stops containers and removes the project's named/anonymous volumes",
        "Only stops without removing networks",
        "Builds images without cache",
        "Publishes ports externally",
      ],
      answer: "Stops containers and removes the project's named/anonymous volumes",
    },
    {
      question: "How do you override the container startup command in a compose file?",
      options: [
        "command or entrypoint key in the service",
        "Only via docker run after up",
        "Via networks section",
        "Cannot — only from Dockerfile",
      ],
      answer: "command or entrypoint key in the service",
      explanation: "Useful for dev mode with hot reload without rebuilding the image.",
    },
    {
      question: "How do you start only one service from a multi-service compose file?",
      options: [
        "docker compose up -d service_name",
        "docker compose down service_name",
        "docker compose restart --all",
        "docker run service_name",
      ],
      answer: "docker compose up -d service_name",
    },
  ],
}

export default translation
