import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'DevOps tools ecosystem',
  duration: '1–1.5 hours',
  description:
    'Overview of the full DevOps ecosystem: VCS, CI/CD, containers, orchestration, IaC, cloud, observability, security — what each is for and how they connect',
  sections: [
    {
      title: 'Ecosystem map',
      content: `DevOps is **not one tool**, but a **landscape** of interconnected categories. A simplified map:

\`\`\`
[Code: Git] → [CI: Actions/Jenkins] → [Artifacts: Registry]
       ↓                                      ↓
[IaC: Terraform] → [Runtime: K8s/Docker] → [Deploy: ArgoCD/Helm]
       ↓                                      ↓
[Cloud: AWS/GCP] ← [Config: Ansible]    → [Observe: Prom/Grafana]
       ↓                                      ↓
[Secrets: Vault]  ← [Security: Trivy]   → [Logs: Loki/ELK]
\`\`\`

Each category solves **its own problem**. A beginner's mistake is trying to learn everything at once. The right path is **sequential**, as you go through the handbook.`,
    },
    {
      title: 'Version control (VCS)',
      content: `**Job:** store code and config history, collaborate, code review.

| Tool | Description | When to use |
|------|-------------|-------------|
| **Git** | De facto standard | Always. Code, Terraform, Helm, Ansible |
| **GitHub** | Hosting + Actions + Issues | Open source, startups |
| **GitLab** | Hosting + built-in CI/CD | Self-hosted, enterprise |
| **Bitbucket** | Atlassian ecosystem | Jira + Confluence shops |

**Related practices:** branching strategy (Git Flow, trunk-based), PR/MR, branch protection, signed commits.

> In DevOps, Git stores not only the application but **all infrastructure** — "Git as single source of truth."`,
    },
    {
      title: 'CI/CD — continuous integration and delivery',
      content: `**CI (Continuous Integration):** every merge triggers a build and tests.
**CD (Continuous Delivery/Deployment):** the artifact is automatically delivered to an environment (or ready for an approved deploy).

| Tool | Type | Notes |
|------|------|-------|
| **GitHub Actions** | Cloud CI | YAML in the repo, marketplace actions |
| **GitLab CI** | Built into GitLab | .gitlab-ci.yml, runners |
| **Jenkins** | Self-hosted | Plugins, Groovy pipelines, legacy |
| **CircleCI** | Cloud | Fast start |
| **ArgoCD / Flux** | GitOps CD | Sync K8s from Git |
| **Tekton** | Cloud-native CI | K8s-native pipelines |

**Typical pipeline:**
\`lint → unit test → build image → security scan → push registry → deploy staging → smoke test → deploy prod\``,
      codes: [
        {
          language: 'yaml',
          caption: 'Simplified GitHub Actions workflow',
          code: `name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
      - run: docker build -t app:\${{ github.sha }} .
      - run: docker push ghcr.io/org/app:\${{ github.sha }}`,
        },
      ],
    },
    {
      title: 'Containerization',
      content: `**Job:** package an application with dependencies into a portable isolated image.

| Tool | Role |
|------|------|
| **Docker** | Build and run containers, Dockerfile |
| **Docker Compose** | Multi-container on one host |
| **Podman** | Docker alternative, rootless |
| **buildah/skopeo** | Build and copy images without a daemon |

**Registry (image store):**
- Docker Hub — public catalog
- **GHCR** (ghcr.io) — GitHub Container Registry
- **ECR** (AWS), **GCR/Artifact Registry** (GCP), **ACR** (Azure)
- **Harbor** — self-hosted enterprise registry

**Formats:** OCI image — open standard; Docker images are compatible.`,
    },
    {
      title: 'Container orchestration',
      content: `**Job:** manage hundreds/thousands of containers: scheduling, scaling, self-healing, networking.

| Tool | Scale | Status |
|------|-------|--------|
| **Kubernetes (K8s)** | Cluster, production standard | De facto standard |
| **Docker Swarm** | Simple Docker cluster | Declining |
| **Nomad** | HashiCorp, not only containers | Niche |
| **ECS/Fargate** | AWS-native | In the AWS ecosystem |

**Kubernetes ecosystem:**
- **kubectl** — CLI
- **Helm** — charts (packages)
- **Kustomize** — config overlays
- **Ingress**: nginx-ingress, Traefik
- **Service mesh** (advanced): Istio, Linkerd`,
    },
    {
      title: 'Infrastructure as Code (IaC)',
      content: `**Job:** describe infrastructure declaratively in code, version it, review via PR.

| Tool | Approach | Best for |
|------|----------|----------|
| **Terraform** | Declarative, multi-cloud | Cloud resources: VM, VPC, S3, RDS |
| **OpenTofu** | Terraform fork (open source) | Same, license |
| **Pulumi** | Code in Python/TS/Go | Prefer imperative-in-code |
| **CloudFormation** | AWS-only, JSON/YAML | Strictly AWS |
| **Ansible** | Imperative, agentless | OS config, deploy to VMs |
| **Crossplane** | K8s-native IaC | Platform teams |

**Terraform workflow:** \`init → plan → apply → destroy\`
**State** is critical: store in a remote backend (S3 + lock), not plaintext in git.`,
    },
    {
      title: 'Cloud providers',
      content: `**Job:** rent compute, storage, and networks without your own datacenter.

| Provider | Market share | Key services |
|----------|--------------|--------------|
| **AWS** | ~32% | EC2, S3, IAM, VPC, EKS, Lambda, RDS |
| **Azure** | ~23% | VMs, Blob, AKS, Entra ID |
| **GCP** | ~11% | GCE, GCS, GKE, BigQuery |
| **Yandex Cloud** | RU/CIS | Compute, Object Storage, Managed K8s |

**Core concepts (everywhere):**
- **IAM** — who can do what (users, roles, policies)
- **VPC** — isolated network
- **Regions / AZ** — fault tolerance
- **Managed services** — RDS, managed K8s (less ops)

> Pick **one** cloud for deep study. Concepts transfer.`,
    },
    {
      title: 'Configuration and secrets',
      content: `| Category | Tools | Purpose |
|----------|-------|---------|
| **Formats** | YAML, JSON, HCL, TOML | Configs, manifests |
| **Templating** | Helm, Kustomize, envsubst | Parameterization |
| **Secrets** | HashiCorp Vault, AWS SSM, Sealed Secrets | Passwords, keys, tokens |
| **Config management** | Ansible, Chef, Puppet | Server state |

**Golden rule:** secrets **never** in Git in plaintext. Use a vault, CI secrets, or encrypted files (SOPS, git-crypt).`,
    },
    {
      title: 'Observability: metrics, logs, traces',
      content: `**Three pillars of observability:**

**1. Metrics** — numeric time series (CPU, RPS, latency p99)
- **Prometheus** — collect and store
- **Grafana** — dashboards and visualization
- **Datadog, New Relic** — SaaS all-in-one (paid)

**2. Logs** — text events
- **Loki** — like Prometheus, but for logs (Grafana stack)
- **ELK** — Elasticsearch + Logstash + Kibana
- **Fluentd/Fluent Bit** — collection agents

**3. Traces** — request path across microservices
- **Jaeger**, **Zipkin**, **Tempo**

**Alerting:** Alertmanager (Prometheus), PagerDuty, Opsgenie — on-call escalation.`,
    },
    {
      title: 'Networking and load balancing',
      content: `| Tool | Role |
|------|------|
| **Nginx** | Reverse proxy, static, load balancing |
| **Traefik** | Dynamic config, K8s Ingress |
| **HAProxy** | L4/L7 load balancer |
| **Cloud LB** | ALB/NLB (AWS), Cloud Load Balancing (GCP) |
| **CDN** | Cloudflare, Fastly — edge cache |
| **DNS** | Route53, Cloudflare DNS, BIND |

**TLS:** Let's Encrypt + certbot / cert-manager (in K8s) — free certificates.`,
    },
    {
      title: 'Security (DevSecOps)',
      content: `| Area | Tools |
|------|-------|
| **SAST** | SonarQube, Semgrep |
| **Dependency scan** | Trivy, Snyk, Dependabot |
| **Container scan** | Trivy, Clair |
| **Secrets detection** | gitleaks, truffleHog |
| **Policy as Code** | OPA, Kyverno (K8s) |
| **WAF** | ModSecurity, Cloudflare WAF |
| **SIEM** | Splunk, Wazuh |

**Shift-left:** checks in CI **before** deploy, not an audit once a year.`,
    },
    {
      title: 'Artifacts and packages',
      content: `| Type | Repositories |
|------|--------------|
| Docker images | GHCR, ECR, Harbor |
| npm/pip/maven | npmjs, PyPI, Nexus, Artifactory |
| Helm charts | chartmuseum, OCI in registry |
| Terraform modules | Terraform Registry, private git |

**Versioning:** semantic versioning (semver) — \`MAJOR.MINOR.PATCH\`. Git tags ↔ image versions.`,
    },
    {
      title: 'Communication and incidents',
      content: `| Tool | Purpose |
|------|---------|
| **Slack / Mattermost** | Team, alert integrations |
| **PagerDuty / Opsgenie** | On-call, escalation |
| **Jira / Linear** | Tickets, incidents, postmortem action items |
| **Statuspage** | Public status for users |
| **Confluence / Notion** | Runbooks, documentation |

**Integration:** Alertmanager → Slack → PagerDuty on critical alerts.`,
    },
    {
      title: 'How to choose tools',
      content: `Selection criteria in real companies:

1. **Team maturity** — Jenkins makes sense if you already have it; greenfield — GitHub Actions
2. **Cloud** — in AWS, EKS, ECR, CloudFormation/Terraform AWS provider are natural
3. **Self-hosted vs SaaS** — compliance, cost, operational burden
4. **Community & hiring** — K8s + Terraform make hiring easier
5. **Do not reinvent the wheel** — standard solutions for standard problems

**For learning:** follow this handbook. Do not spread across 5 CI systems — master one deeply.`,
    },
    {
      title: 'How tools connect in a typical stack',
      content: `Example **modern startup stack**:

1. Code in **GitHub**
2. **GitHub Actions** — CI: test, build, Trivy scan
3. Image in **GHCR**
4. **Terraform** — VPC, EKS cluster in AWS
5. **ArgoCD** — sync Helm chart from Git into EKS
6. **Prometheus + Grafana** — metrics
7. **Loki** — logs
8. **External Secrets** — secrets from AWS SSM
9. **Cloudflare** — DNS + CDN + WAF

Every component is replaceable: GitLab instead of GitHub, Flux instead of ArgoCD — **patterns** matter more than brands.`,
    },
    {
      title: 'What to study in this handbook and in what order',
      content: `Mapping handbook modules to tool categories:

| Handbook module | Tools |
|-----------------|-------|
| Fundamentals | Linux, Git, Bash, SSH, Nginx, YAML |
| Containers | Docker, Compose |
| Orchestration | Kubernetes, Helm |
| CI/CD | GitHub Actions, GitOps concepts |
| IaC | Terraform, Ansible |
| Cloud | AWS (basics) |
| Observability | Prometheus, Grafana, Loki |
| Security & Career | DevSecOps, interviews |

This chapter is a **map of the terrain**. Details come in the following modules.`,
    },
  ],
  practice: [
    'Draw (on paper or Excalidraw) a diagram: from git push to a running app in K8s — mark at least 8 tools',
    'For each category (VCS, CI, Containers, IaC, Observe) list 1 tool you will study in this handbook and 1 alternative',
    'Find a docker-compose.yml or .github/workflows in popular open source (nginx, prometheus) — identify which tool categories are used',
    'Build a table "tool → problem it solves → what could replace it" for 15 tools from this chapter',
    'Explain CI vs CD in your own words; give an example of continuous deployment vs continuous delivery',
    'Answer: why is there a registry between CI and Kubernetes? What is stored in the registry?',
    'Compare Terraform and Ansible: when do you need both, when only one?',
    'Pick a hypothetical stack for a pet project (5–7 tools) and justify each choice in 2 sentences',
  ],
  resources: [
    { title: 'CNCF Landscape', url: 'https://landscape.cncf.io' },
  ],
  quiz: [
    {
      question: 'Which category does Git belong to in a DevOps stack?',
      options: [
        'Version control and collaborative coding',
        'Container orchestration',
        'Metrics collection',
        'Runtime secrets management',
      ],
      answer: 'Version control and collaborative coding',
    },
    {
      question: 'How does Terraform differ from Ansible at a high level?',
      options: [
        'Terraform is declarative IaC for infrastructure; Ansible is configuration and automation',
        'Terraform is Windows-only; Ansible is Linux-only',
        'Ansible creates VPCs; Terraform configures packages',
        'They are the same tool',
      ],
      answer:
        'Terraform is declarative IaC for infrastructure; Ansible is configuration and automation',
    },
    {
      question: 'Name typical CI/CD pipeline components.',
      options: [
        'Checkout, build, test, scan, package, deploy, notify.',
        'Email, print, fax, archive',
        'Only git push and kubectl apply',
        'Compile, sign, ship, invoice',
      ],
      answer: 'Checkout, build, test, scan, package, deploy, notify.',
    },
    {
      question: 'What are Prometheus and Grafana used for in an observability stack?',
      options: [
        'Metrics collection and visualization/alerting',
        'Storing source code',
        'Orchestrating pods',
        'Managing DNS zones',
      ],
      answer: 'Metrics collection and visualization/alerting',
    },
    {
      question: 'What does a reverse proxy like Nginx do in an application architecture?',
      options: [
        'Terminates TLS, load-balances, and proxies requests to backends',
        'Compiles Docker images',
        'Stores Terraform state',
        'Replaces the version control system',
      ],
      answer: 'Terminates TLS, load-balances, and proxies requests to backends',
    },
    {
      question: 'List three DevSecOps tool categories.',

      options: [
        'SAST, DAST/image scanning, secrets and policy management.',
        'CI/CD pipelines, Docker, and Kubernetes only',
        'Monitoring, logging, and alerting without security checks',
        'VCS, issue tracker, and wiki for documentation',
      ],
      answer: 'SAST, DAST/image scanning, secrets and policy management.',
    },
    {
      question: 'What category do Jenkins/GitLab CI fall into in a DevOps stack?',
      options: [
        'CI/CD — automation of build, test, and delivery',
        'Container runtime',
        'DNS management system',
        'Time-series database',
      ],
      answer: 'CI/CD — automation of build, test, and delivery',
      explanation: 'CI/CD servers orchestrate the pipeline between commit and deploy.',
    },
    {
      question: 'What are HashiCorp Vault or AWS Secrets Manager used for in the stack?',
      options: [
        'Secure storage and rotation of secrets with access control',
        'CPU metrics collection',
        'Pod orchestration in Kubernetes',
        'Compiling Terraform modules',
      ],
      answer: 'Secure storage and rotation of secrets with access control',
    },
    {
      question: 'How does a message broker (Kafka, RabbitMQ) differ from a reverse proxy?',
      options: [
        'Broker asynchronously delivers messages between services; proxy proxies HTTP requests',
        'They are the same component',
        'Broker replaces Git',
        'Proxy stores event queues',
      ],
      answer: 'Broker asynchronously delivers messages between services; proxy proxies HTTP requests',
      explanation: 'Different roles: queues/streams vs inbound HTTP traffic.',
    },
    {
      question: 'List three categories of tools typically included in a "platform" DevOps stack.',

      options: [
        'VCS, CI/CD, containerization/orchestration, IaC, monitoring/logging (any three from this list).',
        'IDE, browser, email client',
        'Cloud billing consoles only',
        'HR systems, accounting, CRM',
      ],
      answer: 'VCS, CI/CD, containerization/orchestration, IaC, monitoring/logging (any three from this list).',
    },
  ],
}

export default translation
