import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Learning roadmap',
  duration: '45 min',
  description:
    'A step-by-step plan for learning DevOps from zero to junior: stages, timelines, pet project, equipment, and study methods',
  sections: [
    {
      title: 'Path overview: from zero to junior',
      content: `The path into DevOps is a **marathon**, not a sprint. At **10–15 hours per week**, a realistic timeline to **junior DevOps** level is **6–9 months**.

Learning in this handbook follows a **bottom-up** logic:

1. **Fundamentals** — Linux, networking, Git, Bash, SSH, YAML, Nginx
2. **Containers** — Docker, Compose
3. **Orchestration** — Kubernetes
4. **CI/CD** — pipelines, GitHub Actions
5. **IaC** — Terraform, Ansible
6. **Cloud** — AWS/GCP basics
7. **Observability** — Prometheus, Grafana, logs
8. **Security & Career** — security, interviews

> Do not skip the fundamentals. Kubernetes without understanding Linux and networking is a recipe for constant "magic" you do not understand.`,
    },
    {
      title: 'Months 1–2: Fundamentals',
      content: `**Goal:** work confidently in a Linux terminal, understand networking, version code.

| Week | Topics | Outcome |
|------|--------|---------|
| 1–2 | Linux: FS, users, permissions, processes | VPS or VM, SSH, basic commands |
| 3 | Networking: TCP/IP, DNS, HTTP, curl, firewall | Diagnose network problems |
| 4 | Git: branches, merge, remote, PR workflow | Repository on GitHub |
| 5–6 | Bash: scripts, cron, automation | 2–3 working scripts |
| 7 | SSH: keys, config, hardening | Passwordless key-based login |
| 8 | YAML + Nginx: configs, reverse proxy, SSL | Static site behind Nginx |

**Practice:** one **VPS** (Hetzner, DigitalOcean, Timeweb — from ~$5–10/mo) or a **local VM** (VirtualBox, UTM, Multipass).`,
    },
    {
      title: 'Month 3: Containers',
      content: `**Goal:** containerize an application and run multi-container stacks.

- Install Docker Engine / Docker Desktop
- \`docker run\`, \`build\`, \`push\`, volumes, networks
- **Dockerfile**: multi-stage, non-root user, .dockerignore
- **Docker Compose**: web + db + redis
- Registry: Docker Hub, GitHub Container Registry (GHCR)

**Pet project:** package your (or a learning) web app into an image and run it via Compose locally and on a VPS.`,
    },
    {
      title: 'Month 4: CI/CD',
      content: `**Goal:** an automatic pipeline on every push.

- Concepts: CI vs CD, stages, artifacts
- **GitHub Actions** (or GitLab CI): lint → test → build → push image
- Secrets in CI, environments (staging/production)
- Deploy to a VPS via SSH or to a registry for a later pull

**Outcome:** push to main → green tests → image in registry → (optionally) deploy.`,
    },
    {
      title: 'Months 5–6: Kubernetes',
      content: `**Goal:** understand orchestration and deploy an app to a cluster.

- K8s architecture: control plane, nodes, etcd
- Workloads: Pod, Deployment, ReplicaSet, StatefulSet
- Networking: Service, Ingress, in-cluster DNS
- Config: ConfigMap, Secret
- **Helm** — package manager for K8s
- Locally: **minikube**, **kind**, **k3d**

> For learning, a local cluster is enough. Managed K8s (EKS, GKE) — after the basics.`,
    },
    {
      title: 'Months 7–8: IaC and cloud',
      content: `**Terraform**
- Providers, resources, state, plan/apply
- Modules, workspaces, remote state (S3 + DynamoDB)

**Ansible**
- Inventory, playbooks, roles, idempotency

**Cloud (pick one)**
- **AWS**: EC2, S3, IAM, VPC, RDS — Free Tier 12 months
- **GCP**: Compute Engine, Cloud Storage, IAM
- **Azure**: similar set

**Goal:** stand up pet-project infrastructure with code, not console clicks.`,
    },
    {
      title: 'Month 9+: Observability and security',
      content: `**Observability**
- Metrics: Prometheus, exporters, PromQL
- Visualization: Grafana, dashboards
- Logs: Loki or ELK stack
- Alerting: Alertmanager, on-call basics

**Security / DevSecOps**
- SAST, dependency scanning (Trivy, Dependabot)
- Secrets: Vault, sealed secrets
- Network policies, RBAC in K8s
- OWASP Top 10 — overview

**Career**
- Resume, GitHub portfolio, mock interviews
- Certifications (optional): CKA, AWS SAA`,
    },
    {
      title: 'Required equipment',
      content: `**Minimum:**
- A computer with **8 GB RAM** (16 GB **strongly** recommended for Docker + K8s locally)
- **macOS**, **Linux**, or **Windows + WSL2**
- Stable internet

**Recommended:**
- SSD with 50+ GB free (Docker images take a lot of space)
- A second monitor — handy: terminal + docs

**Free resources for practice:**
| Resource | For what |
|----------|----------|
| GitHub | Repos, Actions, GHCR |
| AWS Free Tier | Cloud for 12 months |
| minikube / kind | Local Kubernetes |
| Oracle Cloud Free Tier | Always-free VPS (with limits) |
| Multipass | Fast Ubuntu VMs |

**You do not need to buy:** paid courses at the start — this handbook + practice is enough for junior.`,
    },
    {
      title: 'Pet project: a thread through learning',
      content: `One project for the whole path is the **best strategy**. Example:

**Start:** a simple web app (Node.js/Python/Go — any stack)
- CRUD API + simple frontend, or API only

**Evolution stages:**
1. Code in Git, README, .gitignore
2. Deploy to VPS: systemd + Nginx reverse proxy
3. Dockerfile → Docker Compose (app + PostgreSQL)
4. GitHub Actions: test + build image
5. Deploy to K8s (Deployment + Service + Ingress)
6. Terraform: VPC, VM, or managed K8s
7. Prometheus metrics endpoint + Grafana dashboard
8. HTTPS, secrets, backup script

> Apply every new skill **to this project**. A portfolio of one well-worked repo beats ten hello-worlds.`,
    },
    {
      title: 'How to learn effectively',
      content: `**70/30 rule:** 70% of time — **hands in the terminal**, 30% — reading and video.

**Active recall:** after a chapter, close the handbook and reproduce commands from memory.

**Spaced repetition:** come back to Linux/Git a week later — retention.

**Document:** keep notes in this handbook or in Obsidian/Notion. Write a runbook for your VPS.

**Learn from mistakes:** break something in a VM (not at work!) — recovery teaches better than theory.

**Community:** DevOps forums, Telegram chats, local meetups. Ask questions with **context**: what you did, what you expected, what you got.

**Avoid tutorial hell:** after 2–3 chapters on a topic — **your own project**, not endless courses.`,
    },
    {
      title: 'Typical beginner mistakes',
      content: `1. **Straight into Kubernetes** without Linux and Docker — constant "unclear why it doesn't work"
2. **Video only** — without practice nothing sticks
3. **Jumping between clouds** — pick one (AWS is more common in job ads), go deep
4. **Ignoring Git** — "I'll learn it later" — Git is needed from day one
5. **Fear of the terminal** — GUI tools help, but 80% of DevOps is CLI
6. **No pet project** — nothing to show in interviews
7. **Memorizing commands** — understand **why**, not only **how**`,
    },
    {
      title: 'Junior readiness checklist',
      content: `Rate yourself honestly (yes / partial / no):

**Linux & Shell**
- [ ] SSH to a server, navigation, permissions, systemd, logs
- [ ] Bash script with \`set -euo pipefail\`
- [ ] Diagnostics: disk, memory, processes

**Networking**
- [ ] DNS, HTTP, curl, firewall basics
- [ ] Understanding ports and reverse proxy

**Git**
- [ ] Branch, merge, conflict resolution, PR
- [ ] .gitignore, tags

**Containers & K8s**
- [ ] Dockerfile, docker compose
- [ ] Deployment, Service, Ingress in K8s

**CI/CD & IaC**
- [ ] Pipeline: test + build
- [ ] Terraform: create a VM or S3 bucket

**Soft**
- [ ] Explain an incident without blame
- [ ] Write a clear README

**8+ "yes"** — you can confidently apply to junior roles.`,
    },
    {
      title: 'Certifications: do you need them',
      content: `Certifications are **not required** for junior, but they help structure learning and pass HR filters.

| Certification | When it makes sense |
|---------------|---------------------|
| **CKA** (Kubernetes) | After 2–3 months of K8s practice |
| **AWS SAA** | When focusing on AWS |
| **LFCS** (Linux) | Weak Linux in interviews |
| **HashiCorp Terraform** | After real TF projects |

**Order:** pet project and practice first → then certification to reinforce. A cert without experience is quickly tested in interviews.`,
    },
  ],
  practice: [
    'Create a GitHub repo `devops-handbook-practice` with a README: goals, pet-project stack, monthly checklist',
    'Install WSL2 (Windows) or Multipass/UTM (macOS) with Ubuntu 22.04/24.04 — record the version in your notes',
    'Build a personal 3-month plan: concrete weekly goals (not "learn Linux," but "set up VPS, nginx, SSL")',
    'Rent a VPS or start a local VM — record IP, access method, OS in your runbook',
    'Go through the junior readiness checklist — mark weak areas and put them first in the plan',
    'Find 5 junior DevOps job ads: list the common stack and make a "know / learning / do not know" table',
    'Block 10 hours per week in your calendar for learning — protect that time like a work meeting',
    'Describe your pet project in 10 sentences: what it does, stack, how you will deploy it by the end of month 6',
  ],
  resources: [
    { title: 'roadmap.sh — DevOps', url: 'https://roadmap.sh/devops' },
  ],
  quiz: [
    {
      question: 'Where should a beginner with no admin experience start learning DevOps?',
      options: [
        'Linux, networking, Git, and command-line basics',
        'Straight into production Kubernetes',
        'Certifications only, no practice',
        'Terraform only without understanding the OS',
      ],
      answer: 'Linux, networking, Git, and command-line basics',
    },
    {
      question: 'Why are pet projects and a homelab important in a roadmap?',
      answer:
        'They give practical experience with deploy, debugging, and automation outside workplace constraints.',
      explanation: 'Employers value demonstrated skills, not theory alone.',
    },
    {
      question: 'What order for learning containers is usually recommended?',
      options: [
        'Docker → Docker Compose → Kubernetes basics → advanced topics',
        'Kubernetes → Docker → Ansible → Git',
        'Helm → Docker → Linux → YAML',
        'EKS → Terraform → Bash → Nginx',
      ],
      answer: 'Docker → Docker Compose → Kubernetes basics → advanced topics',
    },
    {
      question: 'Why is it important to alternate theory and practice when learning DevOps?',
      options: [
        'Tools are forgotten quickly without hands-on practice',
        'Theory fully replaces lab work',
        'Practice is only needed for interviews',
        'Watching videos without repetition is enough',
      ],
      answer: 'Tools are forgotten quickly without hands-on practice',
    },
    {
      question: 'Which soft skills are useful for a DevOps engineer?',
      answer:
        'Cross-team communication, documentation, incident work, and learnability.',
    },
    {
      question: 'When does it make sense to go deeper into cloud (AWS/GCP/Azure)?',
      options: [
        'After Linux, networking, containers, and CI/CD basics',
        'Before learning Git and Bash',
        'Only after 10 years of experience',
        'Cloud is not needed for a DevOps engineer',
      ],
      answer: 'After Linux, networking, containers, and CI/CD basics',
    },
  ],
}

export default translation
