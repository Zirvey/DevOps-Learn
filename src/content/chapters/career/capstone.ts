import type { Chapter } from '../../../types'

export const capstoneChapter: Chapter = {
  id: 'capstone',
  slug: 'capstone-project',
  title: 'Capstone: путь приложения от кода до production',
  moduleId: 'career',
  order: 2,
  duration: '30–50 часов (проект)',
  level: 'intermediate',
  description:
    'Интеграционный проект: простое web-приложение через Docker, Compose, GitHub Actions, Terraform на VPS, Prometheus/Grafana, Loki и разбор инцидента с postmortem',
  sections: [
    {
      title: 'Цель capstone и критерии готовности',
      content: `**Capstone** — не ещё одна глава теории, а **сквозной проект**, который связывает модули handbook в одну историю.

**Стартовая точка:** минимальное web-приложение (например, FastAPI/Flask «status API» или Node.js Express с \`/health\` и \`/metrics\`).

**Финишная линия (Definition of Done):**
- Код в GitHub с README и архитектурной схемой
- Multi-stage Dockerfile, образ публикуется в GHCR
- \`docker compose\` поднимает app + reverse proxy локально
- GitHub Actions: lint/test → build → push image → deploy на VPS
- VPS создан Terraform (cloud-init, firewall, пользователь deploy)
- Prometheus + Grafana: CPU, memory, HTTP latency, error rate
- Loki + Promtail (или Alloy): централизованные логи приложения и nginx
- Симулированный инцident + **blameless postmortem** в \`docs/postmortem-001.md\`

**Артеfact для портфолио:** ссылка на repo, скриншот Grafana dashboard, ссылка на postmortem, 5-минутное demo video (опционально).`,
    },
    {
      title: 'Шаг 1: Приложение и Dockerfile',
      content: `Начни с **узкого scope**: один сервис, один порт, structured logging в stdout.

**Принципы образа:**
- **Multi-stage build** — builder с dev-зависимостями, runtime slim
- Non-root user (\`USER app\`)
- \`.dockerignore\` — не тащить \`.git\`, \`node_modules\`, secrets
- Healthcheck в Dockerfile или Compose

**Метрики:** добавь \`/metrics\` (Prometheus client) или хотя бы счётчик запросов — capstone без метрик «не считается».`,
      code: {
        language: 'dockerfile',
        caption: 'Пример multi-stage (Python)',
        code: `# syntax=docker/dockerfile:1
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
RUN useradd -m app
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY app/ ./app/
USER app
EXPOSE 8000
HEALTHCHECK CMD curl -f http://127.0.0.1:8000/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
      },
    },
    {
      title: 'Шаг 2: Docker Compose для локальной среды',
      content: `Compose — **контракт** «как запускать стек локально и на VPS».

**Минимальный стек capstone:**
- \`app\` — твоё приложение
- \`nginx\` — reverse proxy, TLS termination (локально — HTTP)
- \`prometheus\`, \`grafana\` — observability stack
- \`loki\`, \`promtail\` — логи

**Практики:**
- Именованные volumes для Grafana/Prometheus data
- Переменные через \`.env.example\` (без секретов в Git!)
- Profiles: \`docker compose --profile observability up\` для тяжёлого стека

На VPS тот же \`compose.yaml\` — единый источник правды; отличие только в secrets и домене.`,
      code: {
        language: 'yaml',
        caption: 'Фрагмент compose.yaml',
        code: `services:
  app:
    image: ghcr.io/you/capstone-app:latest
    env_file: .env
    restart: unless-stopped
  nginx:
    image: nginx:1.27-alpine
    ports: ["80:80"]
    volumes: ["./nginx.conf:/etc/nginx/conf.d/default.conf:ro"]
    depends_on: [app]
  prometheus:
    profiles: [observability]
    image: prom/prometheus:v2.54.0
    volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml:ro"]`,
      },
    },
    {
      title: 'Шаг 3: GitHub Actions — CI/CD pipeline',
      content: `Pipeline capstone должен быть **воспроизводимым** и **безопасным**.

**Stages:**
1. **CI** — checkout, cache deps, lint, unit tests
2. **Build** — docker buildx, tag \`sha\` + \`latest\`
3. **Push** — GHCR (\`GITHUB_TOKEN\` или PAT с минимальными правами)
4. **Deploy** — SSH на VPS или \`docker compose pull && up -d\`

**Secrets в GitHub:**
- \`DEPLOY_SSH_KEY\`, \`VPS_HOST\`, \`GHCR_TOKEN\` (если нужен отдельно)
- Никогда не echo secrets в logs

**Quality gates:** failed test = no deploy. Добавь \`concurrency\` group чтобы отменять старые deploy при новом push в main.`,
      code: {
        language: 'yaml',
        caption: '.github/workflows/deploy.yml (упрощённо)',
        code: `name: ci-cd
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt && pytest
  build-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:latest
  deploy:
    needs: build-push
    runs-on: ubuntu-latest
    steps:
      - run: |
          ssh deploy@\${{ secrets.VPS_HOST }} 'cd /opt/capstone && docker compose pull && docker compose up -d'`,
      },
    },
    {
      title: 'Шаг 4: Terraform — VPS и базовая безопасность',
      content: `**IaC** для capstone: один VPS (Hetzner, DigitalOcean, AWS EC2 — не важно), predictable bootstrap.

**Terraform modules (логически):**
- Provider + SSH key resource
- Firewall: 22 (твой IP), 80, 443; deny rest
- Cloud-init: user \`deploy\`, docker install, directory \`/opt/capstone\`

**State:** remote backend (S3 + DynamoDB или Terraform Cloud free tier) — покажи зрелость.

**Outputs:** \`public_ip\`, \`ssh_command\` — для README.

После \`terraform apply\`: скопируй compose + env на сервер (Ansible optional, scp достаточно для capstone).`,
      code: {
        language: 'hcl',
        caption: 'Firewall rule (пример)',
        code: `resource "hcloud_firewall" "app" {
  name = "capstone-fw"
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = [var.admin_cidr]
  }
  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}`,
      },
    },
    {
      title: 'Шаг 5: Prometheus, Grafana и алерты',
      content: `**Golden signals** для capstone HTTP-сервиса:
- **Latency** — histogram \`http_request_duration_seconds\`
- **Traffic** — \`rate(http_requests_total[5m])\`
- **Errors** — 5xx rate
- **Saturation** — CPU/memory node_exporter

**Grafana:**
- Dashboard JSON в repo (\`grafana/dashboards/\`)
- Datasource Prometheus provisioning

**Alerting (минимум):**
- Alertmanager rule: error rate > 5% 5m → webhook (можно в Slack simulator / email)

**SLO exercise:** задай SLO 99.9% и error budget — даже на toy-проекте покажи понимание SRE.`,
    },
    {
      title: 'Шаг 6: Loki и корреляция логов с метриками',
      content: `**Loki** — логи как labels, не full-text search engine.

**Promtail** читает:
- Docker container logs (\`/var/lib/docker/containers\`)
- nginx access/error logs

**Structured JSON logs** из приложения:
\`{"level":"error","msg":"db timeout","trace_id":"abc"}\`

В Grafana Explore: перейти от spike на графике к LogQL \`{job="app"} |= "error"\`.

**Retention:** 7d для capstone достаточно; документируй в README.`,
      code: {
        language: 'yaml',
        caption: 'promtail scrape (фрагмент)',
        code: `scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        target_label: container`,
      },
    },
    {
      title: 'Шаг 7: Инцident и blameless postmortem',
      content: `**Симуляция:** намеренно сломай deploy (bad env var, wrong image tag, fill disk) и пройди полный цикл.

**Incident timeline (шаблон):**
1. Detection — alert / user report
2. Triage — severity, коммуникация
3. Mitigation — rollback, scale, restart
4. Resolution — root cause fix
5. Postmortem — в течение 48h

**Postmortem структура:**
- Summary (1 абзац)
- Impact (duration, users — для capstone «симulated»)
- Timeline (UTC)
- Root cause (5 Whys)
- What went well / what went poorly
- Action items с owner и due date

> Blameless: фокус на системе («deploy без health check»), не на «кто нажал».

Опубликуй postmortem в repo — сильный сигнал для hiring manager.`,
    },
  ],
  practice: [
    'Создай repo capstone-app с `/health`, `/metrics` и JSON-логированием в stdout',
    'Напиши multi-stage Dockerfile и проверь `docker scout` или hadolint на best practices',
    'Собери compose с app + nginx; проверь curl через nginx до backend',
    'Настрой GitHub Actions: test на PR, deploy на push в main',
    'Провижин VPS через Terraform с firewall только для своего IP на SSH',
    'Добавь node_exporter и dashboard Grafana с CPU, memory и HTTP RPS',
    'Подключи Loki; найди в Explore логи одного failed request по trace/request id',
    'Симулируй bad deploy; откати через предыдущий image tag и задокументируй timeline',
    'Напиши postmortem `docs/postmortem-001.md` с минимум 3 action items',
    'Обнови README: архитектурная диаграмма (Mermaid), команды запуска, ссылки на dashboards',
  ],
  resources: [
    {
      title: 'Google SRE — Postmortem culture',
      url: 'https://sre.google/sre-book/postmortem-culture/',
    },
    {
      title: 'Prometheus — Getting started',
      url: 'https://prometheus.io/docs/prometheus/latest/getting_started/',
    },
    {
      title: 'Grafana Loki documentation',
      url: 'https://grafana.com/docs/loki/latest/',
    },
    {
      title: 'GitHub Actions — Encrypted secrets',
      url: 'https://docs.github.com/en/actions/security-guides/encrypted-secrets',
    },
  ],
}
