import type { Chapter } from '../../../types'

export const portfolioChapter: Chapter = {
  id: 'portfolio',
  slug: 'portfolio',
  title: 'Портфолио: pet-проект от идеи до production',
  moduleId: 'career',
  order: 0,
  duration: '20–40 часов (проект)',
  level: 'beginner',
  description:
    'Пошаговое создание full-stack DevOps pet-проекта: от кода до production с CI/CD, K8s и мониторингом',
  sections: [
    {
      title: 'Зачем pet-проект',
      content: `Один хороший pet-проект на GitHub ценнее десяти сертификатов без практики. Рекрутер и hiring manager смотрят:

1. **GitHub profile** — есть ли реальные проекты?
2. **README** — можешь ли объяснить архитектуру?
3. **CI/CD** — зелёный badge = pipeline работает
4. **Infrastructure** — Terraform, K8s manifests
5. **Commit history** — регулярные коммиты, осмысленные messages

**Pet-проект доказывает:** ты не просто читал учебник, а **построил** production-like систему своими руками.`,
    },
    {
      title: 'Выбор идеи проекта',
      content: `**Критерии хорошей идеи:**
- Решает реальную (пусть маленькую) проблему
- Достаточно сложная для демонстрации DevOps навыков
- Не слишком сложная — scope на 2–4 недели
- Интересна лично тебе (будешь работать над ней вечерами)

**Идеи:**
| Проект | Стек | DevOps highlight |
|--------|------|-----------------|
| URL shortener | Go/Python + Redis + PostgreSQL | High RPS, caching |
| Task tracker API | Node.js + MongoDB | CI/CD, K8s deploy |
| DevOps dashboard | React + Prometheus API | Monitoring integration |
| Blog platform | Next.js + PostgreSQL | Static + SSR, CDN |
| Chat application | WebSocket + Redis pub/sub | Real-time, scaling |
| Infrastructure monitor | Python + Prometheus exporter | Custom metrics |

**Рекомендация:** URL shortener или Task API — оптимальный баланс сложности и демонстрации навыков.`,
    },
    {
      title: 'Шаг 1: Архитектура и планирование',
      content: `Прежде чем писать код — нарисуй архитектуру. Используй draw.io, Excalidraw или Mermaid.

**Целевая архитектура pet-проекта:**
\`\`\`
User → Route 53 → ALB → EKS (3 replicas)
                              ↓
                         PostgreSQL (RDS)
                              ↓
                         Redis (ElastiCache)
                              ↓
                    Prometheus + Grafana
                              ↓
                         Loki (logs)
\`\`\`

**Репозитории (monorepo или multi-repo):**
\`\`\`
devops-pet-project/
├── app/                  # Application code
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── infra/                # Infrastructure as Code
│   ├── terraform/        # AWS resources
│   └── k8s/              # Kubernetes manifests
├── .github/
│   └── workflows/        # CI/CD pipelines
├── monitoring/
│   ├── prometheus/
│   └── grafana/
├── docker-compose.yml    # Local development
└── README.md
\`\`\`

**Создай GitHub repo** с описанием, topics (devops, kubernetes, terraform), и LICENSE (MIT).`,
    },
    {
      title: 'Шаг 2: Application — backend API',
      content: `Начни с минимального API. Для URL shortener:

**Endpoints:**
- \`POST /api/shorten\` — создать короткую ссылку
- \`GET /:code\` — redirect на оригинальный URL
- \`GET /health\` — health check
- \`GET /metrics\` — Prometheus metrics
- \`GET /api/stats/:code\` — статистика переходов

**Требования:**
- Structured JSON logging (trace_id)
- Prometheus metrics endpoint
- Health и readiness endpoints
- Environment variables для конфигурации (12-factor app)
- Graceful shutdown (SIGTERM handling)`,
      code: {
        language: 'javascript',
        code: `// Express.js — health + metrics endpoints
const express = require('express');
const promClient = require('prom-client');

const app = express();
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});`,
        caption: 'Health, readiness, metrics endpoints',
      },
    },
    {
      title: 'Шаг 3: Dockerfile и локальная разработка',
      content: `**Multi-stage Dockerfile** + **docker-compose.yml** для локальной разработки.`,
      code: {
        language: 'yaml',
        code: `# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/shortener
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: shortener
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d shortener"]
      interval: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:`,
        caption: 'docker-compose.yml для локальной разработки',
      },
    },
    {
      title: 'Шаг 4: CI Pipeline — тесты и сборка',
      content: `**GitHub Actions** — CI на каждый push и PR.

**Stages:**
1. Lint (eslint, prettier)
2. Unit tests
3. Build Docker image
4. Security scan (Trivy)
5. Push to registry (только main branch)`,
      code: {
        language: 'yaml',
        code: `name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

  build-and-push:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/\${{ github.repository }}:\${{ github.sha }}
          exit-code: 1
          severity: CRITICAL`,
        caption: 'CI pipeline — test, build, scan',
      },
    },
    {
      title: 'Шаг 5: CD Pipeline — деплой в Kubernetes',
      content: `**CD** — автоматический deploy после успешного CI.`,
      code: {
        language: 'yaml',
        code: `name: CD
on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    if: \${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: \${{ secrets.KUBE_CONFIG }}

      - name: Deploy
        run: |
          kubectl set image deployment/url-shortener \\
            app=ghcr.io/\${{ github.repository }}:\${{ github.event.workflow_run.head_sha }} \\
            -n production
          kubectl rollout status deployment/url-shortener -n production`,
        caption: 'CD pipeline — deploy to K8s',
      },
    },
    {
      title: 'Шаг 6: Terraform — облачная инфраструктура',
      content: `Опиши AWS инфраструктуру в Terraform: VPC, EKS, RDS, ECR.`,
      code: {
        language: 'hcl',
        code: `# infra/terraform/main.tf
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "pet-project"
  cidr = "10.0.0.0/16"
  azs  = ["eu-central-1a", "eu-central-1b"]

  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true  # dev: экономия
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "pet-project"
  cluster_version = "1.29"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  eks_managed_node_groups = {
    default = {
      instance_types = ["t3.medium"]
      min_size       = 1
      max_size       = 3
      desired_size   = 2
    }
  }
}`,
        caption: 'Terraform — VPC + EKS',
      },
    },
    {
      title: 'Шаг 7: Kubernetes manifests',
      content: `K8s manifests: Namespace, Deployment, Service, Ingress, ConfigMap, Secret (через ExternalSecret).`,
      code: {
        language: 'yaml',
        code: `# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: url-shortener
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels: { app: url-shortener }
  template:
    metadata:
      labels: { app: url-shortener }
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: app
          image: ghcr.io/user/url-shortener:latest
          ports: [{ containerPort: 3000 }]
          envFrom:
            - configMapRef: { name: app-config }
            - secretRef: { name: db-credentials }
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits: { cpu: 500m, memory: 512Mi }
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
            initialDelaySeconds: 10
          readinessProbe:
            httpGet: { path: /ready, port: 3000 }
            initialDelaySeconds: 5`,
        caption: 'Kubernetes Deployment',
      },
    },
    {
      title: 'Шаг 8: Мониторинг и логирование',
      content: `Подключи Prometheus + Grafana + Loki к pet-проекту.

**Что мониторить:**
- Request rate, error rate, latency (RED)
- CPU, memory per pod (USE)
- Database connections, query latency
- Redis hit rate

**Grafana dashboard** — экспортируй JSON, положи в \`monitoring/grafana/dashboards/\`.

**Алерты:**
- Error rate > 1% за 5 мин
- p99 latency > 1s
- Pod restarts > 0`,
    },
    {
      title: 'Шаг 9: README — визитная карточка',
      content: `**README.md** — первое, что видит рекрутер. Структура:

\`\`\`markdown
# URL Shortener — DevOps Pet Project

[![CI](badge)](link) [![Deploy](badge)](link)

Production-ready URL shortener with full DevOps pipeline.

## Architecture
[диаграмма]

## Tech Stack
- **App:** Node.js, Express, PostgreSQL, Redis
- **Infra:** AWS (EKS, RDS, ALB), Terraform
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus, Grafana, Loki
- **Security:** Trivy, Network Policies, Pod Security

## Features
- Auto-scaling (HPA)
- Zero-downtime deploys
- Structured logging with trace_id
- Prometheus metrics
- Security scanning in CI

## Quick Start
docker-compose up -d

## Deployment
See [infra/README.md](infra/README.md)

## Monitoring
Grafana dashboard: [screenshot]
\`\`\`

Добавь **screenshots** Grafana dashboard и архитектурную диаграмму.`,
    },
    {
      title: 'Шаг 10: Финальные штрихи',
      content: `**Чеклист перед публикацией:**

- [ ] CI badge зелёный в README
- [ ] Архитектурная диаграмма (draw.io / Mermaid)
- [ ] Screenshot Grafana dashboard
- [ ] Trivy scan: 0 critical vulnerabilities
- [ ] Все secrets через ExternalSecret/Vault (не в Git!)
- [ ] NetworkPolicy настроен
- [ ] HPA настроен (autoscaling demo)
- [ ] Postman/OpenAPI spec для API
- [ ] CONTRIBUTING.md (если open source)
- [ ] GitHub Topics: devops, kubernetes, terraform, docker, ci-cd

**Продвижение:**
- Пост на Habr / dev.to с описанием архитектуры
- LinkedIn post с ссылкой на GitHub
- Reddit r/devops (Show and Tell)
- Добавь в резюме с ссылкой`,
    },
    {
      title: 'Резюме: как описать pet-проект',
      content: `**Плохо:**
«Pet-проект на GitHub»

**Хорошо:**
«URL Shortener (GitHub: link) — full-stack DevOps проект:
- CI/CD pipeline (GitHub Actions): test → build → Trivy scan → deploy
- Infrastructure as Code (Terraform): AWS EKS, RDS, VPC
- Kubernetes: 3 replicas, HPA, Network Policies, Ingress с HTTPS
- Observability: Prometheus metrics, Grafana dashboards, Loki logs
- Security: Trivy scanning, non-root containers, Pod Security Standards»

**Формула:** [Что] + [Технологии] + [Результат/Impact]`,
    },
  ],
  practice: [
    'Выбери идею pet-проекта и создай GitHub repo',
    'Нарисуй архитектурную диаграмму',
    'Реализуй API с /health, /ready, /metrics endpoints',
    'Напиши Dockerfile (multi-stage, non-root) и docker-compose.yml',
    'Настрой CI: lint → test → build → Trivy scan',
    'Настрой CD: deploy в K8s (minikube или EKS)',
    'Добавь Terraform для AWS инфраструктуры',
    'Подключи Prometheus + Grafana, создай dashboard',
    'Напиши README с badges, диаграммой и screenshots',
    'Опубликуй пост о проекте на Habr или LinkedIn',
  ],
  resources: [
    { title: 'GitHub Skills', url: 'https://skills.github.com' },
    { title: 'Awesome DevOps', url: 'https://github.com/awesome-devops' },
    { title: 'r/devops', url: 'https://reddit.com/r/devops' },
    { title: 'Excalidraw', url: 'https://excalidraw.com' },
  ],
}
