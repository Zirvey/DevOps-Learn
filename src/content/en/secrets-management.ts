import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Secrets management: Vault, SOPS, CI, and Kubernetes',
  description:
    'Secrets in DevOps: HashiCorp Vault, Mozilla SOPS, GitHub Secrets, .env hygiene, and Sealed Secrets for Kubernetes',
  duration: '4–6 hours',
  sections: [
    {
      title: 'What counts as a secret and anti-patterns',
      content: `**Secrets:** passwords, API tokens, private keys, DB connection strings, encryption keys, kubeconfig, TLS private keys.

**Anti-patterns (everyone has seen these):**
- Commit \`.env\` to Git
- Secrets in Terraform state in plaintext (without a careful backend)
- Slack/email with a password “for a minute”
- One shared password for all staging/prod
- Logs that print env at startup

**Principle:** secrets are **generated**, **rotated**, **issued with least privilege**, and leave an **audit trail**.

**Defense layers:** secret manager + encryption at rest + RBAC + scanning (gitleaks, trufflehog).`,
    },
    {
      title: 'HashiCorp Vault — centralized store',
      content: `**Vault** — dynamic secrets, encryption as a service, audit log.

**Core concepts:**
- **Secrets engines** — KV v2 (static), Database (dynamic creds), PKI
- **Auth methods** — token, AppRole, Kubernetes, JWT/OIDC
- **Policies** — HCL paths like \`secret/data/prod/db\` read-only

**Dynamic DB credentials:** the app gets a username/password for 1h — automatic rotation.

**DevOps flow:**
1. CI authenticates via **JWT** (GitHub OIDC → Vault role)
2. Read a short-lived token
3. Deploy injects it into runtime (env / file)

**Ops:** unseal (Shamir or auto-unseal KMS), HA raft storage, backup snapshots.

> Vault is not “another password DB”; its power is **policy + dynamic secrets + audit**.`,
      code: {
        language: 'bash',
        caption: 'KV read (dev mode — lab only)',
        code: `export VAULT_ADDR=https://vault.example.com:8200
vault login -method=oidc
vault kv get -field=password secret/prod/database

# AppRole for automation:
vault read auth/approle/role/myapp/role-id`,
      },
    },
    {
      title: 'Mozilla SOPS — secrets in Git',
      content: `**SOPS** encrypts values in YAML/JSON/ENV files; keys are age or PGP/KMS.

**Workflow:**
- \`secrets.enc.yaml\` in Git (encrypted)
- CI/CD and admins with the private key decrypt at deploy
- Diff in a PR shows **what** changed, not plaintext

**Pros:** GitOps-friendly; review secret changes like code.

**Cons:** key management; no dynamic rotation out of the box.

**Integrations:** \`helm secrets\`, \`sops -d | kubectl apply\`, Flux SOPS decryption.`,
      code: {
        language: 'yaml',
        caption: 'SOPS-encrypted fragment example',
        code: `apiVersion: v1
kind: Secret
metadata:
  name: app-db
stringData:
  password: ENC[AES256_GCM,data:...,tag:...,type:str]
sops:
  age:
    - recipient: age1example...
  encrypted_regex: ^(password|token)$`,
      },
    },
    {
      title: 'GitHub Actions Secrets and OIDC',
      content: `**Repository / Environment secrets** — a simple starting point for CI.

**Best practices:**
- Environment **protection rules** (required reviewers for prod)
- Separate secrets per environment
- \`secrets.*\` only in masked logs; never pass them to untrusted forks

**OIDC to cloud/Vault** — no long-lived cloud keys in GitHub:
\`\`\`yaml
permissions:
  id-token: write
\`\`\`
→ assume an AWS role / Vault JWT auth.

**Rotation:** calendar reminder; invalidate PATs on employee offboarding.`,
    },
    {
      title: '.env hygiene and local development',
      content: `**Locally:**
- \`.env\` in \`.gitignore\` from day one
- Commit **\`.env.example\`** with dummy values and comments
- \`direnv\` / \`dotenv\` load — document it in the README

**Docker Compose:** \`env_file: .env\` — never bake secrets into the image via **ARG/ENV**.

**12-factor:** config in the environment; per-developer \`.env\` files stay local only.

**Scanning:** pre-commit gitleaks; GitHub secret scanning if available.`,
      code: {
        language: 'bash',
        caption: '.env.example',
        code: `# Copy to .env — never commit .env
DATABASE_URL=postgres://user:CHANGE_ME@localhost:5432/app
API_TOKEN=
LOG_LEVEL=debug`,
      },
    },
    {
      title: 'Kubernetes: Sealed Secrets and External Secrets',
      content: `**Problem:** a plain \`Secret\` in Git is base64, not encryption.

**Bitnami Sealed Secrets:**
- Controller in the cluster holds the private key
- \`kubeseal\` encrypts a Secret → \`SealedSecret\` safe in Git
- Only the cluster can decrypt

**External Secrets Operator:**
- Sync from Vault/AWS SM/GCP SM → native K8s Secret
- Single source of truth outside the cluster

**Choose:**
| Approach | When |
|----------|------|
| Sealed Secrets | GitOps, no external deps |
| ESO + Vault | Enterprise, rotation, audit |
| CSI Secret Store | Mount secrets as volumes |

**Always:** RBAC on Secret read; encrypt etcd (KMS at rest).`,
    },
    {
      title: 'Rotation, incident, and compliance checklist',
      content: `**Rotation playbook:**
1. Generate a new secret in the manager
2. Dual-write or blue/green config if needed
3. Revoke the old one after TTL
4. Verify the audit log

**If a secret leaked in Git:** assume compromised — rotate immediately, purge history (BFG) if public, open an incident ticket.

**Team checklist:**
- [ ] No secrets in the repo (automated scan)
- [ ] Prod secrets not in staging
- [ ] Break-glass procedure documented
- [ ] Offboarding revokes all tokens the same day`,
    },
  ],
  practice: [
    'Add `.env.example` and a gitleaks pre-commit hook to a practice repo',
    'Encrypt a YAML with SOPS (age key) and decrypt it in a CI job',
    'Create a GitHub Environment `production` with a required reviewer',
    'Write a Vault policy: read-only on path `secret/data/staging/*`',
    'Generate a SealedSecret with kubeseal for a dummy Secret',
    'Build a table: which tool for CI vs K8s vs local dev',
    'Run a tabletop: “PAT leaked in a public fork” — first-hour steps',
  ],
  resources: [
    { title: 'HashiCorp Vault documentation', url: 'https://developer.hashicorp.com/vault/docs' },
    { title: 'Mozilla SOPS', url: 'https://github.com/getsops/sops' },
    { title: 'Sealed Secrets', url: 'https://github.com/bitnami-labs/sealed-secrets' },
    {
      title: 'GitHub — Security hardening for Actions',
      url: 'https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions',
    },
  ],
  quiz: [
    {
      question: 'Main anti-pattern for secrets in Git?',
      options: [
        'Committing .env or private keys to the repository',
        'Using .env.example',
        'Encrypting with SOPS',
        'Vault policies',
      ],
      answer: 'Committing .env or private keys to the repository',
    },
    {
      question: 'What do Vault dynamic secrets give you for a database?',
      options: [
        'Short-lived credentials with automatic rotation',
        'One password forever in code',
        'Public access without auth',
        'Disabling the audit log',
      ],
      answer: 'Short-lived credentials with automatic rotation',
    },
    {
      question: 'Why use SOPS in GitOps?',
      options: [
        'Store encrypted secrets in Git with a reviewable diff',
        'Store plaintext passwords',
        'Replace TLS',
        'Remove RBAC',
      ],
      answer: 'Store encrypted secrets in Git with a reviewable diff',
    },
    {
      question: 'GitHub OIDC + id-token: write lets you?',
      options: [
        'Authenticate to cloud/Vault without long-lived cloud keys in secrets',
        'Push without checkout',
        'Read other people\'s private repos',
        'Disable branch protection',
      ],
      answer: 'Authenticate to cloud/Vault without long-lived cloud keys in secrets',
    },
    {
      question: 'What problem do Sealed Secrets solve?',
      options: [
        'Safely storing encrypted Secret manifests in Git',
        'CPU speed',
        'Replacing TLS',
        'Storing Docker images',
      ],
      answer: 'Safely storing encrypted Secret manifests in Git',
    },
    {
      question: 'What should be in .env.example?',
      options: [
        'Variable names and placeholders without real secrets',
        'Production passwords',
        'Private keys',
        'terraform.tfstate',
      ],
      answer: 'Variable names and placeholders without real secrets',
    },
    {
      question: 'First hour after a PAT leaks in a public fork?',
      options: [
        'Immediately revoke/rotate the token and audit usage',
        'Do nothing — wait',
        'Commit a new PAT to the README',
        'Delete only the issue',
      ],
      answer: 'Immediately revoke/rotate the token and audit usage',
    },
    {
      question: 'Least privilege for a CI secret means?',
      options: [
        'Minimal rights only for the needed environment/job',
        'Admin on every account',
        'A shared root password',
        'Secrets in logs for debugging',
      ],
      answer: 'Minimal rights only for the needed environment/job',
    },
    {
      question: 'External Secrets Operator syncs?',
      options: [
        'Secrets from Vault/cloud SM into native Kubernetes Secrets',
        'Pods into Services',
        'Ingress into ConfigMap',
        'Images into PV',
      ],
      answer: 'Secrets from Vault/cloud SM into native Kubernetes Secrets',
    },
    {
      question: 'Why is base64 in a Kubernetes Secret not encryption?',
      options: [
        'It is encoding — anyone with RBAC read can decode it',
        'It is AES-256 by default',
        'It is hashing',
        'It is TLS',
      ],
      answer: 'It is encoding — anyone with RBAC read can decode it',
    },
  ],
}

export default translation
