import type { Chapter } from '../../../types'

export const secretsManagementChapter: Chapter = {
  id: 'secrets-management',
  slug: 'secrets-management',
  title: 'Управление секретами: Vault, SOPS, CI и Kubernetes',
  moduleId: 'security',
  order: 1,
  duration: '4–6 часов',
  level: 'intermediate',
  description:
    'Секреты в DevOps: HashiCorp Vault, Mozilla SOPS, GitHub Secrets, гигиена .env, обзор Sealed Secrets для Kubernetes',
  sections: [
    {
      title: 'Что считается секретом и anti-patterns',
      content: `**Секреты:** passwords, API tokens, private keys, DB connection strings, encryption keys, kubeconfig, TLS private keys.

**Anti-patterns (видели все):**
- Commit \`.env\` в Git
- Secrets в Terraform state plaintext (without careful backend)
- Slack/email с паролем «на минутку»
- Один shared password на все staging/prod
- Logs print env at startup

**Principle:** секреты **генерируются**, **ротируются**, **выдаются по least privilege**, **audit trail**.

**Defense layers:** secret manager + encryption at rest + RBAC + scanning (gitleaks, trufflehog).`,
    },
    {
      title: 'HashiCorp Vault — централизованное хранилище',
      content: `**Vault** — dynamic secrets, encryption as a service, audit log.

**Core concepts:**
- **Secrets engines** — KV v2 (static), Database (dynamic creds), PKI
- **Auth methods** — token, AppRole, Kubernetes, JWT/OIDC
- **Policies** — HCL paths \`secret/data/prod/db\` read-only

**Dynamic DB credentials:** app получает username/password на 1h — автоматическая ротация.

**DevOps flow:**
1. CI auth via **JWT** (GitHub OIDC → Vault role)
2. Read short-lived token
3. Deploy injects into runtime (env / file)

**Ops:** unseal (Shamir или auto-unseal KMS), HA raft storage, backup snapshots.

> Vault — не «ещё одна БД паролей»; сила в **policy + dynamic secrets + audit**.`,
      code: {
        language: 'bash',
        caption: 'KV read (dev mode — только lab)',
        code: `export VAULT_ADDR=https://vault.example.com:8200
vault login -method=oidc
vault kv get -field=password secret/prod/database

# AppRole для automation:
vault read auth/approle/role/myapp/role-id`,
      },
    },
    {
      title: 'Mozilla SOPS — секреты в Git',
      content: `**SOPS** шифрует значения в YAML/JSON/ENV файлах; ключи — age или PGP/KMS.

**Workflow:**
- \`secrets.enc.yaml\` в Git (encrypted)
- CI/CD и admins с private key decrypt at deploy
- Diff в PR видит **что** изменилось, не plaintext

**Плюсы:** GitOps-friendly, review secrets changes like code.

**Минусы:** key management; не dynamic rotation из коробки.

**Интеграция:** \`helm secrets\`, \`sops -d | kubectl apply\`, Flux SOPS decryption.`,
      code: {
        language: 'yaml',
        caption: 'Пример SOPS-encrypted fragment',
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
      title: 'GitHub Actions Secrets и OIDC',
      content: `**Repository / Environment secrets** — простой старт для CI.

**Best practices:**
- Environment **protection rules** (required reviewers for prod)
- Separate secrets per environment
- \`secrets.*\` только в masked logs; не передавать в untrusted forks

**OIDC to cloud/Vault** — без long-lived cloud keys в GitHub:
\`\`\`yaml
permissions:
  id-token: write
\`\`\`
→ assume AWS role / Vault JWT auth.

**Rotation:** calendar reminder; invalidate PAT after employee offboarding.`,
    },
    {
      title: '.env hygiene и локальная разработка',
      content: `**Локально:**
- \`.env\` в \`.gitignore\` с первого дня
- Commit **\`.env.example\`** с dummy values и комментариями
- \`direnv\` / \`dotenv\` load — документировать в README

**Docker Compose:** \`env_file: .env\` — never bake secrets in image **ARG/ENV**.

**12-factor:** config in environment; разные .env per developer via local only files.

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
      title: 'Kubernetes: Sealed Secrets и External Secrets',
      content: `**Problem:** plain \`Secret\` in Git is base64, not encryption.

**Bitnami Sealed Secrets:**
- Controller in cluster holds private key
- \`kubeseal\` encrypts Secret → \`SealedSecret\` safe in Git
- Only cluster can decrypt

**External Secrets Operator:**
- Sync from Vault/AWS SM/GCP SM → native K8s Secret
- Single source of truth outside cluster

**Choose:**
| Подход | Когда |
|--------|--------|
| Sealed Secrets | GitOps, no external deps |
| ESO + Vault | Enterprise, rotation, audit |
| CSI Secret Store | Mount secrets as volumes |

**Always:** RBAC on Secret read; encrypt etcd (KMS at rest).`,
    },
    {
      title: 'Rotation, incident и compliance checklist',
      content: `**Rotation playbook:**
1. Generate new secret in manager
2. Dual-write or blue/green config if needed
3. Revoke old after TTL
4. Verify audit log

**If secret leaked in Git:** assume compromised — rotate immediately, purge history (BFG) if public, incident ticket.

**Checklist для команды:**
- [ ] No secrets in repo (automated scan)
- [ ] Prod secrets not in staging
- [ ] Break-glass procedure documented
- [ ] Offboarding revokes all tokens same day`,
    },
  ],
  practice: [
    'Добавь `.env.example` и gitleaks pre-commit в учебный repo',
    'Зашифруй YAML с SOPS (age key) и расшифруй в CI job',
    'Создай GitHub Environment `production` с required reviewer',
    'Напиши Vault policy: read-only на path `secret/data/staging/*`',
    'Сгенерируй SealedSecret через kubeseal для dummy Secret',
    'Составь таблицу: какой инструмент для CI vs K8s vs local dev',
    'Проведи tabletop: «PAT утёк в public fork» — шаги первого часа',
  ],
  resources: [
    {
      title: 'HashiCorp Vault documentation',
      url: 'https://developer.hashicorp.com/vault/docs',
    },
    {
      title: 'Mozilla SOPS',
      url: 'https://github.com/getsops/sops',
    },
    {
      title: 'Sealed Secrets',
      url: 'https://github.com/bitnami-labs/sealed-secrets',
    },
    {
      title: 'GitHub — Security hardening for Actions',
      url: 'https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions',
    },
  ],
}
