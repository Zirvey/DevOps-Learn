import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `DevSecOps: security in the pipeline`,
  duration: `6–8 hours`,
  description: `Shift left security, secrets management, Trivy, SAST, Kubernetes security, OWASP`,
  sections: [
    {
      title: `DevSecOps: security as part of DevOps`,
      content: `**DevSecOps** = Development + Security + Operations. Security is built into every stage of the lifecycle, not bolted on at the end.

**Traditional approach (bad):**
\`Dev → QA → Security Review → Deploy\` — security as a bottleneck, review once a quarter.

**DevSecOps (good):**
\`Dev + Security + Ops\` — automated checks on every commit/build/deploy.

**Shared Responsibility Model (cloud):**
- Cloud provider: physical security, hypervisor, managed service internals
- You: IAM, data, application code, configs, network rules

**Goal:** find and fix vulnerabilities **before** production, automatically, on every change.`,
    },
    {
      title: `Shift Left Security`,
      content: `**Shift Left** — move security checks left on the timeline (earlier in the process).

**Cost of fixing a bug:**
- Design phase: $1
- Development: $10
- Testing: $100
- Production: $10,000+

**Security checks by pipeline stage:**

| Stage | Check | Tool |
|------|----------|-----------|
| **Code** | SAST, secrets detection | Semgrep, Bandit, git-secrets |
| **Dependencies** | SCA (Software Composition Analysis) | Dependabot, Snyk, Trivy |
| **Build** | Container image scanning | Trivy, Grype, Clair |
| **Deploy** | IaC scanning, policy as code | Checkov, tfsec, OPA/Kyverno |
| **Runtime** | Threat detection | Falco, runtime agents |

Shift left does not cancel runtime security — it complements it.`,
    },
    {
      title: `Secrets management`,
      content: `**Golden rule:** never store secrets in Git, Dockerfiles, env files in the repo, or hardcoded in code.

**What counts as a secret:**
- API keys, passwords, tokens
- Database credentials
- TLS private keys
- SSH keys
- Encryption keys

**Tools:**
- **HashiCorp Vault** — enterprise standard, dynamic secrets, rotation
- **AWS Secrets Manager** — managed, auto-rotation for RDS
- **AWS SSM Parameter Store** — simpler/cheaper for many cases
- **Sealed Secrets / External Secrets Operator** — secrets in K8s from an external vault
- **SOPS** — encrypt files in Git (age/pgp)

**Patterns:**
- Inject secrets at runtime (env from vault), not at build time
- Short-lived credentials (IRSA, STS) instead of long-lived keys
- Rotate regularly; audit access`,
      code: {
        language: `yaml`,
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
        caption: `External Secrets Operator → AWS SM`,
      },
    },
    {
      title: `Detecting secrets in code`,
      content: `**git-secrets**, **gitleaks**, **trufflehog** — scan the repository for accidentally committed secrets.

**Pre-commit hook** — block commits that contain secrets.`,
      code: {
        language: `bash`,
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
        caption: `Scanning secrets in Git`,
      },
    },
    {
      title: `SAST: static code analysis`,
      content: `**SAST (Static Application Security Testing)** — analyze source code without running it.

**What it finds:**
- SQL injection patterns
- Hardcoded credentials
- Insecure cryptography (MD5, SHA1)
- Path traversal
- XSS vulnerabilities
- Insecure deserialization

**Tools:**
| Tool | Languages | Integration |
|-----------|-------|-----------|
| **Semgrep** | 30+ languages | CI, IDE |
| **Bandit** | Python | CI |
| **gosec** | Go | CI |
| **SonarQube** | Many | CI, quality gates |
| **CodeQL** | Many | GitHub |

Run SAST on every PR; fail the pipeline on high/critical findings.`,
      code: {
        language: `yaml`,
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
        caption: `SAST in GitHub Actions`,
      },
    },
    {
      title: `SCA: dependency scanning`,
      content: `**SCA (Software Composition Analysis)** — check third-party dependencies for known CVEs.

**Problem:** 80%+ of code in a typical app is dependencies. Log4Shell (CVE-2021-44228) showed the scale of the risk.

**Tools:**
- **Dependabot** (GitHub) — automatic PRs with updates
- **Snyk** — scanning + fix recommendations
- **Trivy** — OS packages + language dependencies
- **npm audit** / **pip-audit** / **govulncheck**

**Practices:**
- Pin versions and review upgrades
- SBOM (Software Bill of Materials) for supply-chain visibility
- Block Critical/High CVEs in CI before deploy`,
      code: {
        language: `bash`,
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
        caption: `Dependency scanning`,
      },
    },
    {
      title: `Trivy: universal security scanner`,
      content: `**Trivy** (Aqua Security) — all-in-one scanner:
- Container images (OS packages + app dependencies)
- Filesystem (IaC, configs, source code)
- Git repositories
- Kubernetes manifests
- SBOM generation (CycloneDX, SPDX)

**Why Trivy:**
- Open-source, free
- Fast (first scan ~seconds)
- One tool for everything
- CI/CD friendly (exit code 1 on findings)`,
      code: {
        language: `bash`,
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
        caption: `Trivy — scan everything`,
      },
    },
    {
      title: `Trivy in a CI/CD pipeline`,
      content: `Integrating Trivy into GitHub Actions — block deploy on critical vulnerabilities.`,
      code: {
        language: `yaml`,
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
        caption: `Trivy in GitHub Actions`,
      },
    },
    {
      title: `Container Security Best Practices`,
      content: `**Dockerfile security:**
1. **Non-root user** — \`USER app\` (not root!)
2. **Minimal base image** — alpine, distroless, scratch
3. **Multi-stage builds** — do not ship build tools in the production image
4. **Pin versions** — \`node:20.11-alpine\`, not \`node:latest\`
5. **No secrets in the image** — use runtime injection
6. **Read-only filesystem** — \`readOnlyRootFilesystem: true\`

**Image signing:**
- **Cosign** / Sigstore — sign and verify images
- Admit only signed images into the cluster (policy)

**Registry:** private registry (ECR/GHCR), vulnerability scanning on push.`,
      code: {
        language: `dockerfile`,
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
        caption: `Secure Dockerfile`,
      },
    },
    {
      title: `Kubernetes Security`,
      content: `**4C Security Model for K8s:**
1. **Cloud** — IAM, VPC, encryption (AWS/GCP/Azure)
2. **Cluster** — RBAC, admission controllers, audit logging
3. **Container** — image scanning, non-root, read-only FS
4. **Code** — SAST, dependency scanning

**Pod Security Standards (PSS):**
- **Privileged** — unrestricted (not for production)
- **Baseline** — minimal restrictions
- **Restricted** — maximum restrictions (recommended for prod)

**Network Policies** — restrict pod-to-pod traffic (default deny + allow needed paths).

**RBAC** — least privilege for ServiceAccounts and humans.`,
      code: {
        language: `yaml`,
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
        caption: `NetworkPolicy — traffic restriction`,
      },
    },
    {
      title: `Pod Security and RBAC`,
      content: `**Pod Security Context** — restrictions at the pod/container level.`,
      code: {
        language: `yaml`,
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
        caption: `Secure Pod spec`,
      },
    },
    {
      title: `Policy as Code: OPA and Kyverno`,
      content: `**Admission Controllers** — validate resources before they are created in K8s.

**OPA/Gatekeeper** — universal policy engine (Rego language):
- “All images from an approved registry”
- “All pods have resource limits”
- “Ban the latest tag”

**Kyverno** — K8s-native policies (YAML, no Rego):
- Simpler for K8s-specific rules
- Generate, mutate, validate policies`,
      code: {
        language: `yaml`,
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
        caption: `Kyverno policies`,
      },
    },
    {
      title: `OWASP Top 10 for DevOps`,
      content: `**OWASP Top 10 (2021)** — the most critical web vulnerabilities. A DevOps engineer should understand each:

**A01: Broken Access Control** — IAM least privilege, RBAC in K8s
**A02: Cryptographic Failures** — TLS everywhere, encryption at rest (KMS)
**A03: Injection** — parameterized queries, input validation, SAST
**A04: Insecure Design** — threat modeling, security requirements
**A05: Security Misconfiguration** — harden defaults, CIS benchmarks, IaC scanning
**A06: Vulnerable Components** — SCA, Dependabot, image scanning
**A07: Identification/Auth Failures** — MFA, short-lived tokens, OIDC
**A08: Software and Data Integrity** — signed artifacts, supply chain (SLSA)
**A09: Logging Failures** — audit logs, no secrets in logs, retention
**A10: SSRF** — restrict egress, metadata service protection (IMDSv2)

DevOps owns much of A05, A06, A08, A09 through platform and pipeline work.`,
    },
    {
      title: `Runtime Security: Falco`,
      content: `**Falco** (CNCF) — runtime threat detection for K8s and Linux.

**What it detects:**
- Shell in a container (kubectl exec detection)
- Unexpected file access (/etc/shadow)
- Privilege escalation
- Outbound connections to suspicious IPs
- Writes to system directories

**How it works:** eBPF/kernel module → syscall monitoring → rules → alert.`,
      code: {
        language: `yaml`,
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
        caption: `Falco rule — shell detection`,
      },
    },
    {
      title: `Compliance and CIS Benchmarks`,
      content: `**CIS Benchmarks** — best practices for hardening:
- **CIS AWS Foundations** — IAM, logging, networking
- **CIS Kubernetes** — API server, kubelet, etcd
- **CIS Docker** — daemon config, container runtime

**Assessment tools:**
- **kube-bench** — CIS Kubernetes benchmark
- **docker-bench-security** — CIS Docker benchmark
- **Prowler** — CIS AWS Foundations
- **Checkov/tfsec** — IaC compliance

Automate checks in CI and schedule periodic audits in production.`,
      code: {
        language: `bash`,
        code: `# kube-bench — CIS Kubernetes
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
kubectl logs -f job/kube-bench

# Prowler — CIS AWS
pip install prowler
prowler aws --compliance cis_1.5_aws

# Checkov — Terraform
checkov -d . --framework terraform`,
        caption: `Compliance scanning`,
      },
    },
    {
      title: `Lab: security pipeline`,
      content: `**Goal:** build a full security pipeline for a pet project.

**Steps:**
1. Add \`.pre-commit-config.yaml\` with gitleaks
2. GitHub Actions: Semgrep SAST + Trivy scan on every PR
3. Dependabot: enable for the repo (Settings → Security)
4. Dockerfile: non-root user, alpine base, multi-stage
5. Trivy scan image — 0 critical vulnerabilities
6. K8s: NetworkPolicy (app → db only), Pod Security Standards (restricted)
7. Optional: kube-bench and fix failed checks`,
    },
  ],
  practice: [
    `Add a gitleaks pre-commit hook to your pet project`,
    `Configure Trivy scan in GitHub Actions (block on CRITICAL)`,
    `Enable Dependabot and fix found CVEs`,
    `Create a NetworkPolicy: app → db only`,
    `Apply Pod Security Standards (restricted)`,
    `Run kube-bench and fix failed checks`,
    `Complete the “security pipeline” lab`,
  ],
  resources: [
    { title: `OWASP DevSecOps Guideline`, url: `https://owasp.org/www-project-devsecops-guideline/` },
    { title: `Trivy`, url: `https://trivy.dev` },
    { title: `Falco`, url: `https://falco.org` },
    { title: `CIS Benchmarks`, url: `https://www.cisecurity.org/cis-benchmarks` },
    { title: `Kyverno`, url: `https://kyverno.io` },
  ],
  quiz: [
    {
      question: `What is SAST?`,
      options: [
        `Static analysis of source code for vulnerabilities`,
        `Scanning a running application from the outside`,
        `Disk encryption`,
        `Rotating kubeconfig`,
      ],
      answer: `Static analysis of source code for vulnerabilities`,
    },
    {
      question: `Why scan Docker images in CI?`,
      answer: `Find known CVEs in base layers and dependencies before deploying to prod.`,
    },
    {
      question: `What is the principle of least privilege?`,
      options: [
        `The minimum permissions required to do the job`,
        `Admin for all users`,
        `Disable MFA`,
        `Public S3 buckets by default`,
      ],
      answer: `The minimum permissions required to do the job`,
    },
    {
      question: `Where is it safer to store secrets in K8s?`,
      options: [
        `Secret + external vault (Vault, AWS SM) with limited RBAC`,
        `In a ConfigMap in plain text`,
        `In Pod annotations`,
        `In Dockerfile ENV`,
      ],
      answer: `Secret + external vault (Vault, AWS SM) with limited RBAC`,
    },
    {
      question: `What does OWASP Top 10 cover for web applications?`,
      answer: `Common vulnerability classes: injection, broken auth, XSS, and others.`,
    },
    {
      question: `What is shift-left security?`,
      options: [
        `Embedding security checks earlier in the SDLC`,
        `Moving all checks to prod only`,
        `Rejecting pentests`,
        `Deploying only on Fridays`,
      ],
      answer: `Embedding security checks earlier in the SDLC`,
    },
    {
      question: `What is DAST?`,
      options: [
        `Dynamic testing of a running application for vulnerabilities`,
        `Static analysis of source code`,
        `Disk encryption`,
        `SSH key rotation`,
      ],
      answer: `Dynamic testing of a running application for vulnerabilities`,
      explanation: `Complements SAST: sees runtime configuration and real HTTP responses.`,
    },
    {
      question: `Why sign container images (cosign, Notary)?`,
      options: [
        `Verify integrity and trusted source of the image before deploy`,
        `Speed up docker pull`,
        `Replace Kubernetes RBAC`,
        `Compress image layers`,
      ],
      answer: `Verify integrity and trusted source of the image before deploy`,
    },
    {
      question: `What does dependency scanning in CI check?`,
      options: [
        `Known CVEs in libraries from lock files (npm, pip, maven, etc.)`,
        `Only code style`,
        `DNS records`,
        `Docker volume size`,
      ],
      answer: `Known CVEs in libraries from lock files (npm, pip, maven, etc.)`,
      explanation: `Supply chain is a common attack vector; scanning catches vulnerable dependencies early.`,
    },
    {
      question: `Name three hardening measures for Kubernetes API and worker nodes.`,
      answer: `RBAC least privilege, private API endpoint/network policies, regular patches and restricting privileged Pods.`,
    },
  ],
}

export default translation
