import type { Chapter } from '../../../types'

export const devsecopsChapter: Chapter = {
  id: 'devsecops',
  slug: 'devsecops',
  title: 'DevSecOps: безопасность в pipeline',
  moduleId: 'security',
  order: 0,
  duration: '6–8 часов',
  level: 'intermediate',
  description:
    'Shift left security, управление секретами, Trivy, SAST, Kubernetes security, OWASP',
  sections: [
    {
      title: 'DevSecOps: безопасность как часть DevOps',
      content: `**DevSecOps** = Development + Security + Operations. Безопасность встроена в каждый этап жизненного цикла, а не добавлена в конце.

**Традиционный подход (плохо):**
\`Dev → QA → Security Review → Deploy\` — security как bottleneck, проверка раз в квартал.

**DevSecOps (хорошо):**
\`Dev + Security + Ops\` — автоматизированные проверки на каждом commit/build/deploy.

**Shared Responsibility Model (облако):**
- **Cloud Provider** — физическая безопасность, гипервизор, сеть
- **Ты** — данные, IAM, OS patching, application security, encryption

**Принципы:**
1. **Shift Left** — находи уязвимости раньше (дешевле чинить)
2. **Automate** — security checks в CI/CD, не manual review
3. **Least Privilege** — минимальные права везде
4. **Defense in Depth** — несколько слоёв защиты
5. **Immutable Infrastructure** — не патчи серверы, пересоздавай`,
    },
    {
      title: 'Shift Left Security',
      content: `**Shift Left** — перенос security checks влево по timeline (раньше в процессе).

**Стоимость исправления бага:**
- Design phase: $1
- Development: $10
- Testing: $100
- Production: $10,000+

**Security checks по этапам pipeline:**

| Этап | Проверка | Инструмент |
|------|----------|-----------|
| **Code** | SAST, secrets detection | Semgrep, Bandit, git-secrets |
| **Dependencies** | SCA (Software Composition Analysis) | Snyk, Dependabot, Trivy |
| **Build** | Dockerfile linting | Hadolint, Dockle |
| **Image** | Container scanning | Trivy, Grype, Snyk Container |
| **Deploy** | Policy checks | OPA, Kyverno, Conftest |
| **Runtime** | WAF, network policies | AWS WAF, Calico, Falco |
| **Infrastructure** | IaC scanning | Checkov, tfsec, KICS |

Каждый этап — автоматический gate. Fail → блокировка deploy.`,
    },
    {
      title: 'Управление секретами',
      content: `**Золотое правило:** никогда не храни секреты в Git, Dockerfile, env-файлах в репозитории, или hardcoded в коде.

**Что является секретом:**
- API keys, passwords, tokens
- Database credentials
- TLS private keys
- SSH keys
- Encryption keys

**Инструменты:**
- **HashiCorp Vault** — enterprise standard, dynamic secrets, rotation
- **AWS Secrets Manager** — managed, auto-rotation для RDS
- **AWS SSM Parameter Store** — проще, дешевле (SecureString)
- **Kubernetes Secrets** — base64 (НЕ encryption!), используй с external-secrets
- **Sealed Secrets** — encrypt secrets для GitOps (можно хранить в Git)
- **SOPS (Mozilla)** — encrypt YAML/JSON files с age/PGP keys
- **GitHub Actions Secrets** — для CI/CD variables

**External Secrets Operator** — синхронизирует Vault/AWS SM → K8s Secrets.`,
      code: {
        language: 'yaml',
        code: `# ExternalSecret — sync from AWS Secrets Manager
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: db-credentials
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: prod/database/password
    - secretKey: DB_HOST
      remoteRef:
        key: prod/database/host`,
        caption: 'External Secrets Operator → AWS SM',
      },
    },
    {
      title: 'Обнаружение секретов в коде',
      content: `**git-secrets**, **gitleaks**, **trufflehog** — сканирование репозитория на случайно закоммиченные секреты.

**Pre-commit hook** — блокировка commit с секретами.`,
      code: {
        language: 'bash',
        code: `# Установка gitleaks
brew install gitleaks

# Сканирование репозитория
gitleaks detect --source . --verbose

# Pre-commit hook (.pre-commit-config.yaml)
# repos:
#   - repo: https://github.com/gitleaks/gitleaks
#     hooks:
#       - id: gitleaks

# git-secrets (AWS)
git secrets --install
git secrets --register-aws
git secrets --scan`,
        caption: 'Сканирование секретов в Git',
      },
    },
    {
      title: 'SAST: статический анализ кода',
      content: `**SAST (Static Application Security Testing)** — анализ исходного кода без выполнения.

**Что находит:**
- SQL injection patterns
- Hardcoded credentials
- Insecure cryptography (MD5, SHA1)
- Path traversal
- XSS vulnerabilities
- Insecure deserialization

**Инструменты:**
| Инструмент | Языки | Интеграция |
|-----------|-------|-----------|
| **Semgrep** | 30+ языков | CI, IDE |
| **Bandit** | Python | CI |
| **gosec** | Go | CI |
| **ESLint security** | JavaScript | IDE, CI |
| **SonarQube** | 30+ языков | CI, dashboard |
| **CodeQL** | Multi | GitHub Advanced Security |`,
      code: {
        language: 'yaml',
        code: `# GitHub Actions — Semgrep SAST
name: Security Scan
on: [push, pull_request]
jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: semgrep/semgrep-action@v1
        with:
          config: p/default  # OWASP Top 10 rules
      - name: Bandit (Python)
        run: |
          pip install bandit
          bandit -r . -f json -o bandit-report.json`,
        caption: 'SAST в GitHub Actions',
      },
    },
    {
      title: 'SCA: сканирование зависимостей',
      content: `**SCA (Software Composition Analysis)** — проверка third-party dependencies на известные CVE.

**Проблема:** 80%+ кода в типичном приложении — зависимости. Log4Shell (CVE-2021-44228) показал масштаб риска.

**Инструменты:**
- **Dependabot** (GitHub) — автоматические PR с обновлениями
- **Snyk** — сканирование + fix recommendations
- **Trivy** — OS packages + language dependencies
- **npm audit** / **pip audit** — встроенные в package managers

**Policy:** critical/high CVE → блокировка deploy. Medium → fix в течение 30 дней.`,
      code: {
        language: 'bash',
        code: `# npm audit
npm audit
npm audit fix

# pip audit
pip install pip-audit
pip-audit

# Snyk
snyk test
snyk container test myapp:latest

# Trivy — filesystem scan
trivy fs --severity HIGH,CRITICAL .
trivy fs --scanners vuln,secret,misconfig .`,
        caption: 'Сканирование зависимостей',
      },
    },
    {
      title: 'Trivy: универсальный security scanner',
      content: `**Trivy** (Aqua Security) — all-in-one scanner:
- Container images (OS packages + app dependencies)
- Filesystem (IaC, configs, source code)
- Git repositories
- Kubernetes manifests
- SBOM generation (CycloneDX, SPDX)

**Почему Trivy:**
- Open-source, бесплатный
- Быстрый (первый scan ~секунды)
- Один инструмент для всего
- CI/CD friendly (exit code 1 при findings)`,
      code: {
        language: 'bash',
        code: `# Сканирование Docker-образа
trivy image myapp:latest
trivy image --severity HIGH,CRITICAL myapp:latest
trivy image --exit-code 1 --severity CRITICAL myapp:latest

# Сканирование Dockerfile
trivy config Dockerfile

# Сканирование K8s manifests
trivy config deployment.yaml

# Сканирование Terraform
trivy config --tf-vars terraform.tfvars .

# SBOM
trivy image --format cyclonedx -o sbom.json myapp:latest`,
        caption: 'Trivy — сканирование всего',
      },
    },
    {
      title: 'Trivy в CI/CD pipeline',
      content: `Интеграция Trivy в GitHub Actions — блокировка deploy при critical vulnerabilities.`,
      code: {
        language: 'yaml',
        code: `name: Container Security
on:
  push:
    branches: [main]
jobs:
  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t myapp:\${{ github.sha }} .

      - name: Run Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:\${{ github.sha }}
          format: table
          exit-code: 1
          severity: CRITICAL,HIGH
          ignore-unfixed: true

      - name: Scan IaC
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: config
          scan-ref: .
          exit-code: 1
          severity: CRITICAL,HIGH`,
        caption: 'Trivy в GitHub Actions',
      },
    },
    {
      title: 'Container Security Best Practices',
      content: `**Dockerfile security:**
1. **Non-root user** — \`USER app\` (не root!)
2. **Minimal base image** — alpine, distroless, scratch
3. **Multi-stage builds** — не тащи build tools в production image
4. **Pin versions** — \`node:20.11-alpine\`, не \`node:latest\`
5. **No secrets in image** — используй runtime injection
6. **Read-only filesystem** — \`readOnlyRootFilesystem: true\`

**Image signing:**
- **Cosign** (Sigstore) — подпись образов
- **Notary v2** — Docker Content Trust
- Policy: deploy только signed images (Kyverno, OPA)`,
      code: {
        language: 'dockerfile',
        code: `# Secure Dockerfile
FROM node:20.11-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20.11-alpine
RUN addgroup -g 1001 app && adduser -u 1001 -G app -D app
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=app:app . .
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]`,
        caption: 'Secure Dockerfile',
      },
    },
    {
      title: 'Kubernetes Security',
      content: `**4C Security Model для K8s:**
1. **Cloud** — IAM, VPC, encryption (AWS/GCP/Azure)
2. **Cluster** — RBAC, admission controllers, audit logging
3. **Container** — image scanning, non-root, read-only FS
4. **Code** — SAST, dependency scanning

**Pod Security Standards (PSS):**
- **Privileged** — unrestricted (не для production)
- **Baseline** — минимальные ограничения
- **Restricted** — максимальные (non-root, drop capabilities, read-only)

**Network Policies** — firewall между pods:
\`app pod → только db pod:5432\`, всё остальное denied.

**RBAC** — минимальные права для ServiceAccounts.

**Audit Logging** — кто что делал в API server.`,
      code: {
        language: 'yaml',
        code: `# NetworkPolicy — app может ходить только в db
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: app-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes: [Ingress, Egress]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: ingress-nginx
      ports:
        - port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - port: 5432
    - to:  # DNS
        - namespaceSelector: {}
      ports:
        - port: 53`,
        caption: 'NetworkPolicy — ограничение трафика',
      },
    },
    {
      title: 'Pod Security и RBAC',
      content: `**Pod Security Context** — ограничения на уровне pod/container.`,
      code: {
        language: 'yaml',
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-app
spec:
  template:
    spec:
      serviceAccountName: app-sa  # dedicated SA, not default
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: app
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          resources:
            limits:
              cpu: 500m
              memory: 512Mi`,
        caption: 'Secure Pod spec',
      },
    },
    {
      title: 'Policy as Code: OPA и Kyverno',
      content: `**Admission Controllers** — проверяют ресурсы перед созданием в K8s.

**OPA/Gatekeeper** — универсальный policy engine (Rego language):
- «Все images из approved registry»
- «Все pods имеют resource limits»
- «Запрет latest tag»

**Kyverno** — K8s-native policies (YAML, без Rego):
- Проще для K8s-специфичных правил
- Generate, mutate, validate policies`,
      code: {
        language: 'yaml',
        code: `# Kyverno — require labels
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-labels
      match:
        any:
          - resources:
              kinds: [Deployment, Service]
      validate:
        message: "Labels 'app' and 'env' are required"
        pattern:
          metadata:
            labels:
              app: "?*"
              env: "?*"
---
# Kyverno — disallow latest tag
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-latest
spec:
  rules:
    - name: require-image-tag
      match:
        any:
          - resources:
              kinds: [Pod]
      validate:
        message: "Using 'latest' tag is not allowed"
        pattern:
          spec:
            containers:
              - image: "!*:latest"`,
        caption: 'Kyverno policies',
      },
    },
    {
      title: 'OWASP Top 10 для DevOps',
      content: `**OWASP Top 10 (2021)** — самые критичные web-уязвимости. DevOps-инженер должен понимать каждую:

**A01: Broken Access Control** — IAM least privilege, RBAC в K8s
**A02: Cryptographic Failures** — TLS everywhere, encryption at rest (KMS)
**A03: Injection** — parameterized queries, input validation, SAST
**A04: Insecure Design** — threat modeling, security requirements
**A05: Security Misconfiguration** — CIS benchmarks, hardened AMIs, PSS
**A06: Vulnerable Components** — SCA, Dependabot, Trivy
**A07: Authentication Failures** — MFA, strong passwords, OAuth2/OIDC
**A08: Software Integrity Failures** — signed images (Cosign), SBOM
**A09: Logging & Monitoring Failures** — audit logs, CloudTrail, Falco
**A10: SSRF** — network policies, egress filtering

**DevOps impact:** A05, A06, A08, A09 — напрямую в зоне ответственности DevOps.`,
    },
    {
      title: 'Runtime Security: Falco',
      content: `**Falco** (CNCF) — runtime threat detection для K8s и Linux.

**Что детектит:**
- Shell в container (kubectl exec detection)
- Unexpected file access (/etc/shadow)
- Privilege escalation
- Outbound connections к suspicious IPs
- Write в system directories

**Как работает:** eBPF/kernel module → syscall monitoring → rules → alert.`,
      code: {
        language: 'yaml',
        code: `# Falco rule example
- rule: Terminal shell in container
  desc: A shell was spawned in a container
  condition: >
    spawned_process and container and
    shell_procs and proc.tty != 0 and
    not container_entrypoint
  output: >
    Shell spawned in container
    (user=%user.name container=%container.name
    shell=%proc.name parent=%proc.pname)
  priority: WARNING
  tags: [container, shell, mitre_execution]`,
        caption: 'Falco rule — shell detection',
      },
    },
    {
      title: 'Compliance и CIS Benchmarks',
      content: `**CIS Benchmarks** — best practices для hardening:
- **CIS AWS Foundations** — IAM, logging, networking
- **CIS Kubernetes** — API server, kubelet, etcd
- **CIS Docker** — daemon config, container runtime

**Инструменты проверки:**
- **kube-bench** — CIS Kubernetes benchmark
- **docker-bench-security** — CIS Docker benchmark
- **Prowler** — CIS AWS Foundations
- **Checkov/tfsec** — IaC compliance

**Compliance frameworks:**
- **SOC 2** — security controls для SaaS
- **PCI-DSS** — payment card data
- **HIPAA** — healthcare data
- **GDPR** — personal data (EU)
- **ISO 27001** — information security management`,
      code: {
        language: 'bash',
        code: `# kube-bench — CIS Kubernetes
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
kubectl logs -f job/kube-bench

# Prowler — CIS AWS
pip install prowler
prowler aws --compliance cis_1.5_aws

# Checkov — Terraform
checkov -d . --framework terraform`,
        caption: 'Compliance scanning',
      },
    },
    {
      title: 'Лабораторная: security pipeline',
      content: `**Цель:** построить полный security pipeline для pet-проекта.

**Шаги:**
1. Добавь \`.pre-commit-config.yaml\` с gitleaks
2. GitHub Actions: Semgrep SAST + Trivy scan на каждый PR
3. Dependabot: включи для repo (Settings → Security)
4. Dockerfile: non-root user, alpine base, multi-stage
5. Trivy scan image — 0 critical vulnerabilities
6. K8s: NetworkPolicy (app → db only), Pod Security Standards (restricted)
7. Kyverno: policy «no latest tag», «require resource limits»
8. kube-bench: запусти, исправь failed checks
9. Документируй security posture в README`,
    },
  ],
  practice: [
    'Добавь gitleaks pre-commit hook в pet-проект',
    'Настрой Trivy scan в GitHub Actions (блокировка при CRITICAL)',
    'Включи Dependabot, исправь найденные CVE',
    'Создай NetworkPolicy: app → db only',
    'Примени Pod Security Standards (restricted)',
    'Запусти kube-bench, исправь failed checks',
    'Пройди лабораторную «security pipeline»',
  ],
  resources: [
    { title: 'OWASP DevSecOps Guideline', url: 'https://owasp.org/www-project-devsecops-guideline/' },
    { title: 'Trivy', url: 'https://trivy.dev' },
    { title: 'Falco', url: 'https://falco.org' },
    { title: 'CIS Benchmarks', url: 'https://www.cisecurity.org/cis-benchmarks' },
    { title: 'Kyverno', url: 'https://kyverno.io' },
  ],
}
