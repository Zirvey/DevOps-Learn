import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `Portfolio: pet project from idea to production`,
  duration: `20–40 hours (project)`,
  description: `Step-by-step build of a full-stack DevOps pet project: from code to production with CI/CD, K8s, and monitoring`,
  sections: [
    {
      title: `Why a pet project`,
      content: `A single strong pet project on GitHub is worth more than ten certificates without practice. Recruiters and hiring managers look at:

1. **GitHub profile** — are there real projects?
2. **README** — can you explain the architecture?
3. **CI/CD** — a green badge means the pipeline works
4. **Infrastructure** — Terraform, K8s manifests
5. **Commit history** — regular commits, meaningful messages

**A pet project proves:** you did not just read a handbook — you **built** a production-like system yourself.`,
    },
    {
      title: `Choosing a project idea`,
      content: `**Criteria for a good idea:**
- Solves a real (even small) problem
- Complex enough to demonstrate DevOps skills
- Not too complex — 2–4 weeks of scope
- Personally interesting (you will work on it in the evenings)

**Ideas:**
| Project | Stack | DevOps highlight |
|--------|------|-----------------|
| URL shortener | Go/Python + Redis + PostgreSQL | High RPS, caching |
| Task tracker API | Node.js + MongoDB | CI/CD, K8s deploy |
| DevOps dashboard | React + Prometheus API | Monitoring integration |
| Chat / notifications | WebSocket + Redis | Horizontal scaling |
| File storage API | S3 + Lambda | Serverless + IaC |

**Recommendation for this handbook:** a URL shortener or Task API — enough surface for CI/CD, K8s, Terraform, and monitoring without endless product work.`,
    },
    {
      title: `Step 1: Architecture and planning`,
      content: `Before writing code — draw the architecture. Use draw.io, Excalidraw, or Mermaid.

**Target pet-project architecture:**
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

**Repositories (monorepo or multi-repo):**
- \`app/\` — application code
- \`infra/\` — Terraform
- \`k8s/\` or \`deploy/\` — manifests / Helm
- \`monitoring/\` — dashboards, alert rules
- \`.github/workflows/\` — CI/CD

Write a short ADR or README section: why EKS, why Postgres, what is out of scope.`,
    },
    {
      title: `Step 2: Application — backend API`,
      content: `Start with a minimal API. For a URL shortener:

**Endpoints:**
- \`POST /api/shorten\` — create a short link
- \`GET /:code\` — redirect to the original URL
- \`GET /health\` — health check
- \`GET /metrics\` — Prometheus metrics
- \`GET /api/stats/:code\` — click stats

**Requirements:**
- Structured JSON logging (trace_id)
- Prometheus metrics endpoint
- Health and readiness endpoints
- Environment variables for config (12-factor app)
- Graceful shutdown (SIGTERM handling)`,
      code: {
        language: `javascript`,
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
        caption: `Health, readiness, metrics endpoints`,
      },
    },
    {
      title: `Step 3: Dockerfile and local development`,
      content: `**Multi-stage Dockerfile** + **docker-compose.yml** for local development.`,
      code: {
        language: `yaml`,
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
        caption: `docker-compose.yml for local development`,
      },
    },
    {
      title: `Step 4: CI Pipeline — tests and build`,
      content: `**GitHub Actions** — CI on every push and PR.

**Stages:**
1. Lint (eslint, prettier)
2. Unit tests
3. Build Docker image
4. Security scan (Trivy)
5. Push to registry (main branch only)`,
      code: {
        language: `yaml`,
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
        caption: `CI pipeline — test, build, scan`,
      },
    },
    {
      title: `Step 5: CD Pipeline — deploy to Kubernetes`,
      content: `**CD** — automatic deploy after successful CI.`,
      code: {
        language: `yaml`,
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
        caption: `CD pipeline — deploy to K8s`,
      },
    },
    {
      title: `Step 6: Terraform — cloud infrastructure`,
      content: `Describe AWS infrastructure in Terraform: VPC, EKS, RDS, ECR.`,
      code: {
        language: `hcl`,
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
        caption: `Terraform — VPC + EKS`,
      },
    },
    {
      title: `Step 7: Kubernetes manifests`,
      content: `K8s manifests: Namespace, Deployment, Service, Ingress, ConfigMap, Secret (via ExternalSecret).`,
      code: {
        language: `yaml`,
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
        caption: `Kubernetes Deployment`,
      },
    },
    {
      title: `Step 8: Monitoring and logging`,
      content: `Connect Prometheus + Grafana + Loki to the pet project.

**What to monitor:**
- Request rate, error rate, latency (RED)
- CPU, memory per pod (USE)
- Database connections, query latency
- Redis hit rate

**Grafana dashboard** — export JSON, put it in \`monitoring/grafana/dashboards/\`.

**Alerts:**
- Error rate > 1% for 5 min
- p99 latency > 1s
- Pod restarts > 0`,
    },
    {
      title: `Step 9: README — your business card`,
      content: `**README.md** is the first thing a recruiter sees. Structure:

\`\`\`markdown
# URL Shortener — DevOps Pet Project

[![CI](badge)](link) [![Deploy](badge)](link)

Production-ready URL shortener with full DevOps pipeline.

## Architecture
[diagram]

## Tech Stack
- **App:** Node.js, Express, PostgreSQL, Redis
- **Infra:** AWS (EKS, RDS, ALB), Terraform
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus, Grafana, Loki
- **Security:** Trivy, Network Policies, Pod Security

## Features
- Auto-scaling (HPA)
- HTTPS via ALB + ACM
- Structured logging + metrics
- Zero-downtime deploys

## How to run
### Local
docker compose up

### Deploy
See docs/deploy.md
\`\`\`

Add screenshots of Grafana and the architecture diagram.`,
    },
    {
      title: `Step 10: Final polish`,
      content: `**Checklist before publishing:**

- [ ] CI badge green in README
- [ ] Architecture diagram (draw.io / Mermaid)
- [ ] Screenshot of Grafana dashboard
- [ ] Trivy scan: 0 critical vulnerabilities
- [ ] All secrets via ExternalSecret/Vault (not in Git!)
- [ ] NetworkPolicy configured
- [ ] HPA configured (autoscaling demo)
- [ ] Postman/OpenAPI spec for the API
- [ ] CONTRIBUTING.md (if open source)
- [ ] GitHub Topics: devops, kubernetes, terraform, docker, ci-cd

**Promotion:**
- Post on Habr / dev.to / LinkedIn
- Mention in your CV and cover letter
- Be ready to walk through the architecture in an interview`,
    },
    {
      title: `Resume: how to describe the pet project`,
      content: `**Bad:**
“Pet project on GitHub”

**Good:**
“URL Shortener (GitHub: link) — full-stack DevOps project:
- CI/CD pipeline (GitHub Actions): test → build → Trivy scan → deploy
- Infrastructure as Code (Terraform): AWS EKS, RDS, VPC
- Kubernetes: 3 replicas, HPA, Network Policies, Ingress with HTTPS
- Observability: Prometheus metrics, Grafana dashboards, Loki logs
- Security: Trivy scanning, non-root containers, Pod Security Standards”

**Formula:** [What] + [Technologies] + [Result/Impact]`,
    },
  ],
  practice: [
    `Pick a pet-project idea and create a GitHub repo`,
    `Draw an architecture diagram`,
    `Implement an API with /health, /ready, /metrics endpoints`,
    `Write a Dockerfile (multi-stage, non-root) and docker-compose.yml`,
    `Set up CI: lint → test → build → Trivy scan`,
    `Set up CD: deploy to K8s (minikube or EKS)`,
    `Add Terraform for AWS infrastructure`,
    `Connect Prometheus + Grafana, create a dashboard`,
    `Write a README with badges, a diagram, and screenshots`,
    `Publish a post about the project on Habr or LinkedIn`,
  ],
  resources: [
    { title: `GitHub Skills`, url: `https://skills.github.com` },
    { title: `Awesome DevOps`, url: `https://github.com/awesome-devops` },
    { title: `r/devops`, url: `https://reddit.com/r/devops` },
    { title: `Excalidraw`, url: `https://excalidraw.com` },
  ],
  quiz: [
    {
      question: `What should a strong DevOps pet project include?`,
      options: [
        `README, architecture, CI/CD, IaC, link to code and how to reproduce`,
        `Only a screenshot with no repository`,
        `Passwords in the repo for “honesty”`,
        `A copy of someone else’s project with no understanding`,
      ],
      answer: `README, architecture, CI/CD, IaC, link to code and how to reproduce`,
    },
    {
      question: `Why draw an architecture diagram in a portfolio?`,
      answer: `To show understanding of data flows, networks, CI/CD, and observability.`,
    },
    {
      question: `How do you describe your contribution in a team project honestly?`,
      options: [
        `Concrete tasks: pipeline, monitoring, migration — with result metrics`,
        `Claim the whole company`,
        `Never mention the team`,
        `Only vague phrases with no detail`,
      ],
      answer: `Concrete tasks: pipeline, monitoring, migration — with result metrics`,
    },
    {
      question: `Why is a public GitHub/GitLab important?`,
      answer: `Recruiters and interviewers can assess code style, commits, and documentation.`,
    },
    {
      question: `Which pet project best demonstrates a DevOps stack?`,
      options: [
        `A microservice on K8s with Terraform, CI, monitoring, and HTTPS`,
        `Hello World in a single .txt file`,
        `A fork with no changes`,
        `A private repo with no description`,
      ],
      answer: `A microservice on K8s with Terraform, CI, monitoring, and HTTPS`,
    },
    {
      question: `What should you include in a README for a reviewer?`,
      answer: `Project goal, stack, prerequisites, deploy/destroy commands, diagram, and dashboard screenshots.`,
    },
    {
      question: `Why show a CI pipeline status badge in a portfolio?`,
      options: [
        `Shows the project builds and tests pass automatically`,
        `Speeds up git clone`,
        `Replaces code review`,
        `Hides build errors`,
      ],
      answer: `Shows the project builds and tests pass automatically`,
      explanation: `Reviewers see process maturity without running locally.`,
    },
    {
      question: `How to describe homelab honestly on a resume?`,
      options: [
        `Specific stack, what you automated, link to repo and metrics (uptime, cost)`,
        `"Set up everything in the world" with no details`,
        `Only "know Docker"`,
        `Never mention homelab`,
      ],
      answer: `Specific stack, what you automated, link to repo and metrics (uptime, cost)`,
    },
    {
      question: `Why add a Makefile or scripts/ to a pet project?`,
      options: [
        `Simplify reproduce deploy/destroy for reviewers`,
        `Hide commands from users`,
        `Replace README`,
        `Mandatory GitHub requirement`,
      ],
      answer: `Simplify reproduce deploy/destroy for reviewers`,
      explanation: `One entrypoint (\`make up\`) lowers the bar for reviewing the project.`,
    },
    {
      question: `What three sections are useful in ARCHITECTURE.md for a DevOps project?`,
      answer: `Component diagram, CI/CD flow, network/secrets and observability.`,
    },
  ],
}

export default translation
