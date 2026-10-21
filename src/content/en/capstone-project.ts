import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Capstone: from code to production',
  description:
    'Integration project: a simple web app through Docker, Compose, GitHub Actions, Terraform on a VPS, Prometheus/Grafana, Loki, and an incident postmortem',
  duration: '30–50 hours (project)',
  sections: [
    {
      title: 'Capstone goals and definition of done',
      content: `**Capstone** is not another theory chapter — it is an **end-to-end project** that ties handbook modules into one story.

**Starting point:** a minimal web app (for example FastAPI/Flask “status API” or Node Express with \`/health\` and \`/metrics\`).

**Definition of Done:**
- Code on GitHub with README and architecture diagram
- Multi-stage Dockerfile; image published to GHCR
- \`docker compose\` runs app + reverse proxy locally
- GitHub Actions: lint/test → build → push image → deploy to VPS
- VPS provisioned with Terraform (cloud-init, firewall, deploy user)
- Prometheus + Grafana: CPU, memory, HTTP latency, error rate
- Loki + Promtail (or Alloy): centralized app and nginx logs
- Simulated incident + **blameless postmortem** in \`docs/postmortem-001.md\`

**Portfolio artefact:** repo link, Grafana dashboard screenshot, postmortem link, optional 5-minute demo video.`,
    },
    {
      title: 'Step 1: Application and Dockerfile',
      content: `Start with **narrow scope**: one service, one port, structured logging to stdout.

**Image principles:**
- **Multi-stage build** — builder with dev deps, slim runtime
- Non-root user (\`USER app\`)
- \`.dockerignore\` — do not ship \`.git\`, \`node_modules\`, secrets
- Healthcheck in Dockerfile or Compose

**Metrics:** add \`/metrics\` (Prometheus client) or at least a request counter — a capstone without metrics “does not count”.`,
      code: {
        language: 'dockerfile',
        caption: 'Multi-stage example (Python)',
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
      title: 'Step 2: Docker Compose for the local stack',
      content: `Compose is the **contract** for “how to run the stack locally and on the VPS”.

**Minimum capstone stack:**
- \`app\` — your application
- \`nginx\` — reverse proxy, TLS termination (locally — HTTP)
- \`prometheus\`, \`grafana\` — observability stack
- \`loki\`, \`promtail\` — logs

**Practices:**
- Named volumes for Grafana/Prometheus data
- Variables via \`.env.example\` (no secrets in Git!)
- Profiles: \`docker compose --profile observability up\` for the heavy stack

On the VPS use the same \`compose.yaml\` — one source of truth; only secrets and domain differ.`,
      code: {
        language: 'yaml',
        caption: 'compose.yaml fragment',
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
      title: 'Step 3: GitHub Actions — CI/CD pipeline',
      content: `The capstone pipeline must be **reproducible** and **safe**.

**Stages:**
1. **CI** — checkout, cache deps, lint, unit tests
2. **Build** — docker buildx, tag \`sha\` + \`latest\`
3. **Push** — GHCR (\`GITHUB_TOKEN\` or a minimal PAT)
4. **Deploy** — SSH to VPS or \`docker compose pull && up -d\`

**Secrets in GitHub:**
- \`DEPLOY_SSH_KEY\`, \`VPS_HOST\`, \`GHCR_TOKEN\` (if needed separately)
- Never echo secrets into logs

**Quality gates:** failed test = no deploy. Add a \`concurrency\` group to cancel stale deploys on a new push to main.`,
      code: {
        language: 'yaml',
        caption: '.github/workflows/deploy.yml (simplified)',
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
      title: 'Step 4: Terraform — VPS and basic security',
      content: `**IaC** for the capstone: one VPS (Hetzner, DigitalOcean, AWS EC2 — pick any), predictable bootstrap.

**Terraform modules (logical):**
- Provider + SSH key resource
- Firewall: 22 (your IP), 80, 443; deny the rest
- Cloud-init: user \`deploy\`, Docker install, directory \`/opt/capstone\`

**State:** remote backend (S3 + DynamoDB or Terraform Cloud free tier) — shows maturity.

**Outputs:** \`public_ip\`, \`ssh_command\` — for the README.

After \`terraform apply\`: copy compose + env to the server (Ansible optional; scp is enough for capstone).`,
      code: {
        language: 'hcl',
        caption: 'Firewall rule example',
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
      title: 'Step 5: Prometheus, Grafana, and alerts',
      content: `**Golden signals** for a capstone HTTP service:
- **Latency** — histogram \`http_request_duration_seconds\`
- **Traffic** — \`rate(http_requests_total[5m])\`
- **Errors** — 5xx rate
- **Saturation** — CPU/memory via node_exporter

**Grafana:**
- Dashboard JSON in the repo (\`grafana/dashboards/\`)
- Prometheus datasource provisioning

**Alerting (minimum):**
- Alertmanager rule: error rate > 5% for 5m → webhook (Slack simulator / email)

**SLO exercise:** set an SLO of 99.9% and an error budget — even on a toy project, show SRE understanding.`,
    },
    {
      title: 'Step 6: Loki and correlating logs with metrics',
      content: `**Loki** — logs as labels, not a full-text search engine.

**Promtail** reads:
- Docker container logs (\`/var/lib/docker/containers\`)
- nginx access/error logs

**Structured JSON logs** from the app:
\`{"level":"error","msg":"db timeout","trace_id":"abc"}\`

In Grafana Explore: jump from a spike on the graph to LogQL \`{job="app"} |= "error"\`.

**Retention:** 7d is enough for capstone; document it in the README.`,
      code: {
        language: 'yaml',
        caption: 'promtail scrape (fragment)',
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
      title: 'Step 7: Incident and blameless postmortem',
      content: `**Simulation:** deliberately break a deploy (bad env var, wrong image tag, fill disk) and walk the full cycle.

**Incident timeline (template):**
1. Detection — alert / user report
2. Triage — severity, communication
3. Mitigation — rollback, scale, restart
4. Resolution — root-cause fix
5. Postmortem — within 48h

**Postmortem structure:**
- Summary (one paragraph)
- Impact (duration, users — for capstone “simulated”)
- Timeline (UTC)
- Root cause (5 Whys)
- What went well / what went poorly
- Action items with owner and due date

> Blameless: focus on the system (“deploy without health check”), not “who clicked”.

Publish the postmortem in the repo — a strong signal for hiring managers.`,
    },
  ],
  practice: [
    'Create a capstone-app repo with /health, /metrics, and JSON logging to stdout',
    'Write a multi-stage Dockerfile and run hadolint or docker scout for best practices',
    'Build compose with app + nginx; verify curl through nginx to the backend',
    'Configure GitHub Actions: test on PR, deploy on push to main',
    'Provision a VPS with Terraform and SSH firewall limited to your IP',
    'Add node_exporter and a Grafana dashboard with CPU, memory, and HTTP RPS',
    'Connect Loki; find one failed request in Explore by trace/request id',
    'Simulate a bad deploy; roll back via previous image tag and document the timeline',
    'Write docs/postmortem-001.md with at least 3 action items',
    'Update README: Mermaid architecture diagram, run commands, dashboard links',
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
    { title: 'Grafana Loki documentation', url: 'https://grafana.com/docs/loki/latest/' },
    {
      title: 'GitHub Actions — Encrypted secrets',
      url: 'https://docs.github.com/en/actions/security-guides/encrypted-secrets',
    },
  ],
  quiz: [
    {
      question: 'What belongs in a capstone Definition of Done?',
      options: [
        'CI/CD, containerization, IaC VPS, metrics/logs, and a postmortem after a simulated incident',
        'Only a README with no deploy',
        'Only local docker run without Git',
        'Only Terraform with no application',
      ],
      answer:
        'CI/CD, containerization, IaC VPS, metrics/logs, and a postmortem after a simulated incident',
    },
    {
      question: 'Why use a multi-stage Dockerfile in the capstone?',
      options: [
        'Smaller runtime image without build dependencies and better security',
        'To store secrets in the final layer',
        'To run the container only as root',
        'To disable the healthcheck',
      ],
      answer: 'Smaller runtime image without build dependencies and better security',
    },
    {
      question: 'Which minimum observability stack is mentioned for the capstone?',
      options: [
        'Prometheus + Grafana for metrics and Loki for logs',
        'Only ping every 5 minutes',
        'Only email on failure',
        'Only Zabbix without the application',
      ],
      answer: 'Prometheus + Grafana for metrics and Loki for logs',
    },
    {
      question: 'Where should secrets for GitHub Actions deploy live?',
      options: [
        'GitHub Encrypted Secrets / Environments, not in the repository',
        'In a Dockerfile ARG',
        'In compose.yaml as plaintext',
        'In the README',
      ],
      answer: 'GitHub Encrypted Secrets / Environments, not in the repository',
    },
    {
      question: 'What is a blameless postmortem in the capstone?',
      options: [
        'An incident review focused on system improvements, not finding someone to blame',
        'Public punishment of the deploy author',
        'A report with no action items',
        'Only restarting the service',
      ],
      answer:
        'An incident review focused on system improvements, not finding someone to blame',
    },
    {
      question: 'Why use the same compose.yaml locally and on the VPS?',
      options: [
        'One run contract for the stack and less drift between environments',
        'So you do not need nginx',
        'To store Terraform state in compose',
        'Windows only',
      ],
      answer: 'One run contract for the stack and less drift between environments',
    },
    {
      question: 'Which app endpoint matters for Prometheus in the capstone?',
      options: [
        '/metrics or equivalent HTTP metrics',
        '/favicon.ico',
        '/admin/delete-all',
        '/.env',
      ],
      answer: '/metrics or equivalent HTTP metrics',
    },
    {
      question: 'What to do after terraform apply for the capstone?',
      options: [
        'Copy compose/env to the server and run the deploy pipeline',
        'Delete the VPS immediately',
        'Commit terraform.tfstate to public Git',
        'Open SSH to 0.0.0.0/0 forever',
      ],
      answer: 'Copy compose/env to the server and run the deploy pipeline',
    },
    {
      question: 'Which artefact strengthens the portfolio after the capstone?',
      options: [
        'Repo link, Grafana dashboard, and a published postmortem',
        'IDE screenshot with no code',
        'List of watched videos',
        'Empty private repo',
      ],
      answer: 'Repo link, Grafana dashboard, and a published postmortem',
    },
    {
      question: 'Why does the pipeline need a “test failed → no deploy” gate?',
      options: [
        'To avoid shipping broken artefacts to production',
        'To speed up deploy at any cost',
        'To skip lint',
        'To deploy only on Fridays',
      ],
      answer: 'To avoid shipping broken artefacts to production',
    },
  ],
}

export default translation
