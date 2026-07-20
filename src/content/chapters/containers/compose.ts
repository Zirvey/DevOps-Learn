import type { Chapter } from '../../../types'

export const composeChapter: Chapter = {
  id: 'docker-compose',
  slug: 'docker-compose',
  title: 'Docker Compose',
  moduleId: 'containers',
  order: 1,
  duration: '4–5 часов',
  level: 'beginner',
  description:
    'Полное руководство по Docker Compose: multi-container стеки, сети, volumes, healthchecks и production-паттерны',
  sections: [
    {
      title: 'Что такое Docker Compose',
      content: `**Docker Compose** — инструмент для определения и запуска multi-container приложений. Весь стек описывается в YAML-файле (\`compose.yaml\` или \`docker-compose.yml\`), а одна команда поднимает все сервисы.

**Проблема без Compose:**

\`\`\`bash
docker network create app-net
docker run -d --name db --network app-net -e POSTGRES_PASSWORD=secret -v pgdata:/data postgres:16
docker run -d --name cache --network app-net redis:7-alpine
docker run -d --name api --network app-net -e DATABASE_URL=... -p 3000:3000 myapi
# ... и так для каждого сервиса, в правильном порядке
\`\`\`

**С Compose:**

\`\`\`bash
docker compose up -d
\`\`\`

**Когда использовать Compose:**

| Сценарий | Compose подходит? |
|----------|-------------------|
| Локальная разработка | Да — идеально |
| CI/CD integration tests | Да — поднять стек, прогнать тесты, teardown |
| Staging (малые проекты) | Да — с осторожностью |
| Production (high availability) | Нет — используй Kubernetes/Swarm |
| Демо и обучение | Да |

Compose — часть Docker CLI начиная с версии 2 (плагин \`docker compose\`, не отдельный бинарник \`docker-compose\`).`,
    },
    {
      title: 'Compose v1 vs v2 и структура файла',
      content: `**Compose v2** (текущая версия) — встроенный плагин Docker CLI. Команда: \`docker compose\` (через пробел).

**Ключевые отличия v1 → v2:**

| | Compose v1 | Compose v2 |
|---|------------|------------|
| Команда | \`docker-compose\` | \`docker compose\` |
| Реализация | Python | Go (в Docker CLI) |
| Build | Отдельный builder | BuildKit |
| Profiles | Нет | Да |
| Watch | Нет | Да (dev mode) |
| Статус | Deprecated | Активная разработка |

**Структура compose.yaml:**

\`\`\`yaml
# Верхнеуровневые ключи
name: my-project          # Имя проекта (префикс контейнеров)
services:                 # Описание сервисов (контейнеров)
  app: ...
  db: ...
networks:                 # Пользовательские сети
  backend: ...
volumes:                  # Именованные тома
  pgdata: ...
secrets:                  # Секреты (Swarm / Compose)
  db_password: ...
configs:                  # Конфигурационные файлы
  nginx_conf: ...
\`\`\`

**Имя файла:** \`compose.yaml\` (рекомендуется), \`compose.yml\`, \`docker-compose.yaml\`. Docker ищет файлы в текущей директории автоматически.`,
      codes: [
        {
          language: 'bash',
          code: `# Проверить версию
docker compose version

# Указать конкретный файл
docker compose -f compose.yaml up -d
docker compose -f compose.yaml -f compose.prod.yaml up -d

# Указать имя проекта
docker compose -p myproject up -d`,
          caption: 'Базовые команды Compose v2',
        },
      ],
    },
    {
      title: 'Сервисы — основные параметры',
      content: `Каждый ключ в \`services:\` описывает один контейнер (или группу реплик в Swarm mode).

**Основные параметры сервиса:**

| Параметр | Описание | Пример |
|----------|----------|--------|
| \`image\` | Готовый образ из registry | \`postgres:16-alpine\` |
| \`build\` | Сборка из Dockerfile | \`build: .\` или \`build: { context: ., dockerfile: Dockerfile.dev }\` |
| \`ports\` | Проброс портов | \`"8080:80"\` или \`"127.0.0.1:5432:5432"\` |
| \`expose\` | Открыть порт только внутри сети | \`expose: ["3000"]\` |
| \`environment\` | Переменные окружения | \`POSTGRES_PASSWORD: secret\` |
| \`env_file\` | Файл с переменными | \`env_file: .env\` |
| \`volumes\` | Монтирование | \`pgdata:/var/lib/postgresql/data\` |
| \`networks\` | Подключение к сетям | \`networks: [backend, frontend]\` |
| \`depends_on\` | Зависимости (порядок запуска) | \`depends_on: [db, cache]\` |
| \`restart\` | Политика перезапуска | \`unless-stopped\` |
| \`healthcheck\` | Проверка здоровья | см. отдельную секцию |
| \`deploy\` | Ресурсы (Swarm / Compose) | \`replicas: 3\` |
| \`command\` | Переопределение CMD | \`command: npm run dev\` |
| \`entrypoint\` | Переопределение ENTRYPOINT | |
| \`user\` | Пользователь | \`"1001:1001"\` |
| \`working_dir\` | Рабочая директория | \`/app\` |
| \`labels\` | Метаданные | для Traefik, мониторинга |`,
      code: {
        language: 'yaml',
        code: `services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
      target: development
      args:
        NODE_VERSION: "20"
    image: myapp-api:dev
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://app:secret@db:5432/myapp
      REDIS_URL: redis://cache:6379
    env_file:
      - .env
    volumes:
      - ./api/src:/app/src          # hot-reload
      - /app/node_modules            # anonymous volume
    networks:
      - backend
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s`,
        caption: 'Полный пример сервиса API',
      },
    },
    {
      title: 'Volumes и networks в Compose',
      content: `Compose автоматически создаёт **default network** для проекта. Все сервисы в ней могут обращаться друг к другу по имени сервиса (DNS).

**Volumes в Compose:**

| Синтаксис | Тип | Пример |
|-----------|-----|--------|
| \`volume_name:/path\` | Named volume | \`pgdata:/var/lib/postgresql/data\` |
| \`./host/path:/container/path\` | Bind mount | \`./src:/app/src\` |
| \`/container/path\` | Anonymous volume | \`/app/node_modules\` |

**Networks в Compose:**

- **Default** — все сервисы в одной bridge-сети
- **Custom** — изоляция: frontend-сеть для nginx, backend-сеть для API и БД
- **External** — подключение к существующей сети: \`external: true\`

**Паттерн изоляции:** nginx в \`frontend\` + \`backend\` сетях, API только в \`backend\`, БД только в \`backend\`. Nginx не может напрямую достучаться до БД.`,
      codes: [
        {
          language: 'yaml',
          code: `services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    networks:
      - frontend
      - backend
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro

  api:
    build: ./api
    expose:
      - "3000"
    networks:
      - backend
    volumes:
      - api-logs:/var/log/app

  db:
    image: postgres:16-alpine
    networks:
      - backend
    volumes:
      - pgdata:/var/lib/postgresql/data

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true    # нет доступа к интернету

volumes:
  pgdata:
    driver: local
  api-logs:`,
          caption: 'Изолированные сети и volumes',
        },
      ],
    },
    {
      title: 'Переменные окружения и секреты',
      content: `Compose поддерживает несколько способов передачи конфигурации в контейнеры.

**Способы задания переменных (по приоритету, от низшего к высшему):**

1. \`env_file: .env\` — файл с KEY=VALUE
2. \`environment:\` в compose.yaml
3. Shell environment при запуске: \`DATABASE_URL=... docker compose up\`
4. \`--env-file\` флаг CLI

**Подстановка переменных в compose.yaml:**

\`\`\`yaml
services:
  db:
    image: postgres:\${POSTGRES_VERSION:-16}-alpine
    environment:
      POSTGRES_PASSWORD: \${DB_PASSWORD:?err}
\`\`\`

- \`\${VAR:-default}\` — значение по умолчанию
- \`\${VAR:?error}\` — обязательная переменная, ошибка если не задана
- \`\${VAR}\` — подстановка из .env или shell

**Секреты (Compose, не Swarm):**

Для production используй внешние secret managers (Vault, AWS SSM). В Compose секреты монтируются как файлы в \`/run/secrets/\`.

> **Важно:** \`.env\` файл добавь в \`.gitignore\`. Создай \`.env.example\` с пустыми/фиктивными значениями для документации.`,
      codes: [
        {
          language: 'text',
          code: `# .env.example — шаблон для разработчиков
POSTGRES_VERSION=16
DB_PASSWORD=changeme
DB_NAME=myapp
DB_USER=app
REDIS_PASSWORD=
API_PORT=3000
NODE_ENV=development`,
          caption: '.env.example — шаблон переменных',
        },
        {
          language: 'yaml',
          code: `services:
  db:
    image: postgres:\${POSTGRES_VERSION:-16}-alpine
    environment:
      POSTGRES_DB: \${DB_NAME}
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASSWORD:?Database password is required}
    env_file:
      - .env

  api:
    build: .
    environment:
      DATABASE_URL: postgres://\${DB_USER}:\${DB_PASSWORD}@db:5432/\${DB_NAME}
      REDIS_URL: redis://:\${REDIS_PASSWORD}@cache:6379`,
          caption: 'Подстановка переменных в compose.yaml',
        },
      ],
    },
    {
      title: 'Health checks и depends_on',
      content: `**Healthcheck** позволяет Compose (и оркестраторам) определять, готов ли сервис принимать трафик.

**Параметры healthcheck:**

| Параметр | Описание | По умолчанию |
|----------|----------|--------------|
| \`test\` | Команда проверки | — |
| \`interval\` | Интервал между проверками | 30s |
| \`timeout\` | Таймаут команды | 30s |
| \`retries\` | Неудачных попыток до unhealthy | 3 |
| \`start_period\` | Grace period при старте | 0s |

**depends_on с condition:**

\`depends_on\` без condition только гарантирует **порядок запуска**, но не готовность сервиса. С \`condition: service_healthy\` Compose ждёт, пока healthcheck пройдёт.

| Condition | Поведение |
|-----------|-----------|
| \`service_started\` | Контейнер запущен (default) |
| \`service_healthy\` | Healthcheck прошёл |
| \`service_completed_successfully\` | Контейнер завершился с exit 0 (для init/migration) |

**Типичный паттерн:** init-контейнер для миграций БД → API ждёт healthy DB → nginx ждёт healthy API.`,
      codes: [
        {
          language: 'yaml',
          code: `services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s

  migrate:
    build: ./api
    command: npm run migrate
    depends_on:
      db:
        condition: service_healthy
    restart: "no"

  api:
    build: ./api
    depends_on:
      db:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s`,
          caption: 'Цепочка зависимостей с healthcheck',
        },
      ],
    },
    {
      title: 'Полный стек: API + PostgreSQL + Redis + Nginx',
      content: `Рассмотрим production-like стек для типичного web-приложения. Этот пример демонстрирует все ключевые концепции Compose.

**Архитектура стека:**

\`\`\`
Internet → Nginx (:80) → API (:3000) → PostgreSQL (:5432)
                                      → Redis (:6379)
\`\`\`

**Компоненты:**

| Сервис | Роль | Образ |
|--------|------|-------|
| nginx | Reverse proxy, SSL termination, static files | nginx:alpine |
| api | Backend REST API | custom build |
| db | Реляционная БД | postgres:16-alpine |
| cache | Кэш, сессии, очереди | redis:7-alpine |

Стек использует изолированные сети, healthchecks, named volumes и переменные окружения из .env файла.`,
      code: {
        language: 'yaml',
        code: `name: myapp

services:
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "\${NGINX_PORT:-80}:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/static:/usr/share/nginx/html:ro
    networks:
      - frontend
    depends_on:
      api:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    image: myapp-api:\${APP_VERSION:-latest}
    expose:
      - "3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://\${DB_USER}:\${DB_PASSWORD}@db:5432/\${DB_NAME}
      REDIS_URL: redis://cache:6379
      PORT: 3000
    networks:
      - frontend
      - backend
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: \${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER} -d \${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 1G

  cache:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    networks:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

volumes:
  pgdata:
  redisdata:`,
        caption: 'Полный production-like compose.yaml',
      },
    },
    {
      title: 'Override-файлы и профили',
      content: `Compose поддерживает **несколько файлов** и **профили** для разных окружений и сценариев.

**Override-файлы:**

Docker Compose автоматически читает \`compose.yaml\` + \`compose.override.yaml\` (если существует). Override **мержится** поверх основного файла.

\`\`\`bash
# Dev (автоматически: compose.yaml + compose.override.yaml)
docker compose up -d

# Production
docker compose -f compose.yaml -f compose.prod.yaml up -d

# CI
docker compose -f compose.yaml -f compose.ci.yaml up -d --abort-on-container-exit
\`\`\`

**Типичные различия dev vs prod:**

| Параметр | Dev (override) | Prod |
|----------|----------------|------|
| Build target | \`development\` | \`production\` |
| Volumes | Bind mount исходников | Только named volumes |
| Ports | Все порты наружу | Только nginx :80/:443 |
| Restart | \`no\` | \`unless-stopped\` |
| Resources | Без лимитов | CPU/memory limits |
| Logging | debug level | info/warn |

**Profiles** — условное включение сервисов:

\`\`\`bash
docker compose --profile debug up -d    # включает сервисы с profiles: [debug]
docker compose --profile monitoring up -d
\`\`\`

Сервисы без \`profiles\` запускаются всегда. С \`profiles\` — только при явном указании.`,
      codes: [
        {
          language: 'yaml',
          code: `# compose.override.yaml — автоматически для dev
services:
  api:
    build:
      target: development
    volumes:
      - ./api/src:/app/src
      - /app/node_modules
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
    ports:
      - "3000:3000"
      - "9229:9229"    # Node.js debugger

  db:
    ports:
      - "5432:5432"     # прямой доступ к БД для dev

  # Adminer — только для разработки
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    profiles:
      - debug
    depends_on:
      - db`,
          caption: 'compose.override.yaml для разработки',
        },
        {
          language: 'yaml',
          code: `# compose.prod.yaml
services:
  api:
    build:
      target: production
    image: ghcr.io/myorg/myapp:\${APP_VERSION}
    environment:
      NODE_ENV: production
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 1G
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"

  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro`,
          caption: 'compose.prod.yaml для production',
        },
      ],
    },
    {
      title: 'Команды Docker Compose',
      content: `Полный справочник команд Compose v2 для ежедневной работы.

**Управление жизненным циклом:**

| Команда | Описание |
|---------|----------|
| \`docker compose up -d\` | Запуск в фоне |
| \`docker compose up -d --build\` | Пересборка + запуск |
| \`docker compose up -d --force-recreate\` | Пересоздать контейнеры |
| \`docker compose down\` | Остановка и удаление контейнеров |
| \`docker compose down -v\` | + удаление volumes |
| \`docker compose down --rmi all\` | + удаление образов |
| \`docker compose stop\` | Остановка без удаления |
| \`docker compose start\` | Запуск остановленных |
| \`docker compose restart api\` | Перезапуск конкретного сервиса |

**Мониторинг и отладка:**

| Команда | Описание |
|---------|----------|
| \`docker compose ps\` | Статус сервисов |
| \`docker compose logs -f api\` | Логи в реальном времени |
| \`docker compose logs --tail=50\` | Последние 50 строк |
| \`docker compose exec api sh\` | Shell в контейнере |
| \`docker compose top\` | Процессы в контейнерах |
| \`docker compose port api 3000\` | Проброшенный порт |
| \`docker compose config\` | Валидировать и показать итоговый YAML |`,
      codes: [
        {
          language: 'bash',
          code: `# Запуск и остановка
docker compose up -d
docker compose up -d --build --force-recreate api
docker compose down
docker compose down -v --remove-orphans

# Мониторинг
docker compose ps
docker compose ps --format json
docker compose logs -f --tail=100 api db
docker compose top

# Выполнение команд
docker compose exec api sh
docker compose exec -u root db psql -U postgres -d myapp
docker compose run --rm api npm test        # одноразовый контейнер
docker compose run --rm api npm run migrate

# Масштабирование (без Swarm — дублирует контейнеры)
docker compose up -d --scale api=3

# Валидация
docker compose config                    # итоговый YAML
docker compose config --quiet            # только проверка синтаксиса

# Образы
docker compose build
docker compose build --no-cache api
docker compose pull
docker compose push`,
          caption: 'Полный справочник команд Compose',
        },
      ],
    },
    {
      title: 'Compose Watch — режим разработки',
      content: `**Compose Watch** (Docker Compose 2.22+) — встроенный механизм синхронизации файлов и автоматического перезапуска при изменениях. Альтернатива bind mount для hot-reload.

**Действия watch:**

| Action | Описание |
|--------|----------|
| \`sync\` | Синхронизация файлов в контейнер |
| \`sync+restart\` | Синхронизация + перезапуск контейнера |
| \`rebuild\` | Пересборка образа при изменении |
| \`sync+exec\` | Синхронизация + выполнение команды |

**Запуск:**

\`\`\`bash
docker compose watch
# или
docker compose up --watch
\`\`\`

**Когда использовать Watch vs bind mount:**

| | Bind mount | Compose Watch |
|---|------------|---------------|
| Скорость | Мгновенно | Небольшая задержка |
| Совместимость | Проблемы на macOS/Windows | Кроссплатформенно |
| node_modules | Конфликт с хостом | Нет конфликта |
| Rebuild | Ручной | Автоматический |`,
      code: {
        language: 'yaml',
        code: `services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    develop:
      watch:
        - action: sync
          path: ./api/src
          target: /app/src
          ignore:
            - node_modules/
        - action: rebuild
          path: ./api/package.json
        - action: sync+restart
          path: ./api/prisma/schema.prisma`,
        caption: 'Compose Watch для hot-reload',
      },
    },
    {
      title: 'Compose в CI/CD',
      content: `Docker Compose широко используется в CI/CD для integration-тестов: поднять полный стек, прогнать тесты, удалить всё.

**Паттерн CI pipeline:**

1. \`docker compose -f compose.yaml -f compose.ci.yaml build\`
2. \`docker compose -f compose.yaml -f compose.ci.yaml up -d\`
3. Ждать healthy всех сервисов
4. Запустить тесты: \`docker compose exec -T api npm test\`
5. \`docker compose down -v\` (всегда, даже при ошибке — \`if: always()\`)

**compose.ci.yaml особенности:**

- Фиксированные пароли (не из .env)
- Проброс портов для test runner
- \`restart: "no"\` — не перезапускать при падении
- Минимальные ресурсы
- Healthcheck с коротким start_period

**GitHub Actions пример** — тесты против реального PostgreSQL и Redis, а не моков.`,
      codes: [
        {
          language: 'yaml',
          code: `# compose.ci.yaml
services:
  api:
    build:
      context: ./api
      target: test
    environment:
      NODE_ENV: test
      DATABASE_URL: postgres://test:test@db:5432/testdb
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
    restart: "no"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: testdb
    tmpfs:
      - /var/lib/postgresql/data    # RAM disk — быстрее для CI
    restart: "no"`,
          caption: 'compose.ci.yaml для тестов',
        },
        {
          language: 'yaml',
          code: `# .github/workflows/test.yml
name: Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Start services
        run: docker compose -f compose.yaml -f compose.ci.yaml up -d --wait
      - name: Run tests
        run: docker compose -f compose.yaml -f compose.ci.yaml exec -T api npm test
      - name: Tear down
        if: always()
        run: docker compose -f compose.yaml -f compose.ci.yaml down -v`,
          caption: 'GitHub Actions с Compose',
        },
      ],
    },
    {
      title: 'Compose в production — ограничения и альтернативы',
      content: `Docker Compose **может** работать в production для небольших проектов, но имеет фундаментальные ограничения.

**Ограничения Compose в production:**

| Ограничение | Последствие |
|-------------|-------------|
| Нет auto-scaling | Ручное \`--scale\`, нет реакции на нагрузку |
| Single host | Нет распределения по серверам (без Swarm) |
| Нет rolling updates | Downtime при обновлении |
| Нет self-healing | restart policy — максимум что есть |
| Нет service mesh | Нет mTLS, circuit breaker, retry |
| Нет RBAC | Любой с доступом к хосту управляет всем |

**Когда Compose в production допустим:**

- MVP / pet-проекты с одним сервером
- Internal tools с малым трафиком
- Staging-окружение
- VPS с 1–2 сервисами и \`restart: unless-stopped\`

**Когда нужен Kubernetes:**

- > 3 сервисов с зависимостями
- Требуется zero-downtime deploy
- Auto-scaling по CPU/RPS
- Multi-node кластер
- Compliance (RBAC, network policies, audit)

**Миграция Compose → Kubernetes:** Kompose (\`kompose convert\`) генерирует K8s-манифесты из compose.yaml. Результат — отправная точка, не финальное решение.`,
    },
    {
      title: 'Troubleshooting Docker Compose',
      content: `Типичные проблемы при работе с Compose и способы их решения.

**Диагностический алгоритм:**

1. \`docker compose config\` — валидный ли YAML?
2. \`docker compose ps\` — все ли сервисы running/healthy?
3. \`docker compose logs <service>\` — ошибки в логах?
4. \`docker compose exec <service> sh\` — зайти и проверить
5. \`docker network inspect <project>_backend\` — DNS, IP-адреса

**Частые проблемы:**

| Проблема | Причина | Решение |
|----------|---------|---------|
| \`service "api" is not running\` | Контейнер упал при старте | \`docker compose logs api\` |
| \`connection refused\` к db | depends_on без healthcheck | Добавить condition: service_healthy |
| \`port is already allocated\` | Порт занят на хосте | \`lsof -i :PORT\`, сменить порт |
| \`volume already exists\` | Конфликт имён volumes | \`docker compose down -v\` |
| Медленный bind mount (macOS) | VirtioFS/osxfs | Использовать named volume или Compose Watch |
| \`env variable not set\` | Нет .env файла | Скопировать .env.example → .env |
| Orphan containers | Сервис удалён из yaml | \`docker compose down --remove-orphans\` |
| Build cache устарел | Старые слои | \`docker compose build --no-cache\` |`,
      codes: [
        {
          language: 'bash',
          code: `# Диагностика
docker compose config --quiet          # валидация
docker compose ps -a                   # все контейнеры
docker compose logs --tail=50 api      # последние логи
docker compose events                  # события в реальном времени

# Проверка сети
docker compose exec api ping -c 2 db
docker compose exec api nc -zv db 5432

# Проверка DNS
docker compose exec api nslookup db

# Полный reset
docker compose down -v --remove-orphans --rmi local
docker compose up -d --build --force-recreate

# Проверить итоговую конфигурацию
docker compose config > resolved-config.yaml`,
          caption: 'Диагностика проблем Compose',
        },
      ],
    },
  ],
  practice: [
    'Создай compose.yaml с API (build) + PostgreSQL + Redis — проверь DNS-связность между сервисами',
    'Добавь healthcheck для каждого сервиса и depends_on с condition: service_healthy',
    'Настрой compose.override.yaml для dev с bind mount и debug-портом',
    'Создай compose.prod.yaml с resource limits, restart policy и без проброса портов БД',
    'Добавь nginx как reverse proxy перед API с изолированными frontend/backend сетями',
    'Настрой .env и .env.example — убедись, что .env в .gitignore',
    'Напиши GitHub Actions workflow: compose up → integration tests → compose down',
    'Попробуй Compose Watch для hot-reload при изменении исходников',
    'Выполни миграцию БД через одноразовый сервис с condition: service_completed_successfully',
    'Проведи полный troubleshooting: сломай конфигурацию и восстанови стек по алгоритму из главы',
  ],
  resources: [
    { title: 'Docker Compose Documentation', url: 'https://docs.docker.com/compose/' },
    { title: 'Compose Specification', url: 'https://compose-spec.io' },
  ],
}
