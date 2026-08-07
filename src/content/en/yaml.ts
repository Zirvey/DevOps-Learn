import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'YAML and JSON for DevOps',
  description:
    'YAML and JSON in DevOps: syntax, indentation, anchors, validation, Kubernetes manifests, GitHub Actions, Docker Compose, Ansible',
  duration: '2–3 hours',
  sections: [
    {
      title: 'Why YAML and JSON in DevOps',
      content: `**Configuration as data** — the foundation of modern infrastructure:

| Format | Where it is used |
|--------|------------------|
| **YAML** | K8s, Docker Compose, GitHub Actions, Ansible, Helm values |
| **JSON** | API, Terraform (sometimes), package.json, AWS policies |
| **HCL** | Terraform (separate chapter) |

YAML is **human-friendly**, JSON is **machine-friendly**. Many tools accept both (YAML parses into the same structures).

> One typo in YAML indentation — an hour of debugging. Use validators and an IDE with highlighting.`,
    },
    {
      title: 'YAML syntax: basics',
      content: `**YAML** (YAML Ain't Markup Language) — data serialization.

**Rules:**
- Indent with **spaces** (not tabs!), usually 2
- Structure via indentation, not braces
- \`#\` — comment
- \`---\` — start of document
- \`...\` — end (rare)`,
      code: {
        language: 'yaml',
        caption: 'Basic types',
        code: `# Строка
name: my-application
description: "Строка с: двоеточием"
multiline: |
  Первая строка
  Вторая строка

# Числа и булевы
replicas: 3
port: 8080
enabled: true
disabled: false

# Null
value: null
# или: value: ~`,
      },
    },
    {
      title: 'Lists and maps',
      content: `**Map (dictionary):** key: value
**List (array):** hyphen + space`,
      codes: [
        {
          language: 'yaml',
          caption: 'Map and list',
          code: `services:
  web:
  api:
  db:

ports:
  - 80
  - 443
  - 8080

# Вложенность:
database:
  host: db.internal
  port: 5432
  credentials:
    user: app
    password: secret`,
        },
        {
          language: 'yaml',
          caption: 'Inline forms',
          code: `# Inline list:
tags: [web, production, api]

# Inline map:
labels: { app: nginx, env: prod }`,
        },
      ],
    },
    {
      title: 'Strings: quotes and multiline',
      content: `| Type | Syntax | Behavior |
|-----|-----------|-----------|
| Plain | \`hello\` | Simple text |
| Quoted | \`"hello: world"\` | Special characters, colons |
| Literal block | \`\|\` | Keeps newlines, adds \\n at the end |
| Folded block | \`>\` | Newlines → spaces |

**Escaping in double quotes:** \`\\n\`, \`\\t\`, \`\\\\\``,
      code: {
        language: 'yaml',
        code: `script: |
  #!/bin/bash
  set -euo pipefail
  echo "Starting app"

description: >
  Это длинное описание
  которое станет одной строкой
  с пробелами вместо переносов`,
      },
    },
    {
      title: 'Anchors and aliases',
      content: `**Anchor** (\`&\`) and **alias** (\`*\`) — reuse blocks (DRY in YAML).`,
      code: {
        language: 'yaml',
        code: `defaults: &defaults
  retries: 3
  timeout: 30s

job1:
  <<: *defaults
  name: backup

job2:
  <<: *defaults
  name: healthcheck`,
      },
    },
    {
      title: 'Common YAML mistakes',
      content: `1. **Tabs instead of spaces** — the parser fails
2. **Colon in an unquoted string** — need quotes
3. **yes/no/on/off** — in YAML 1.2 these are strings, not booleans (in 1.1 yes=true — be careful!)
4. **Numbers with a leading zero** — \`0123\` may become octal
5. **Empty value** — \`key:\` = null

**Always validate:**
\`yamllint file.yaml\`
\`python -c "import yaml; yaml.safe_load(open('f.yaml'))"\``,
    },
    {
      title: 'JSON: syntax',
      content: `**JSON** — a strict subset for data exchange.

- Double quotes for strings
- No comments
- No trailing comma (in the standard)
- Types: object {}, array [], string, number, boolean, null`,
      codes: [
        {
          language: 'json',
          caption: 'JSON example',
          code: `{
  "name": "my-app",
  "replicas": 3,
  "enabled": true,
  "tags": ["web", "api"],
  "database": {
    "host": "localhost",
    "port": 5432
  }
}`,
        },
        {
          language: 'bash',
          caption: 'Converting YAML ↔ JSON',
          code: `# yq (установи: snap install yq или brew)
yq -o=json config.yaml
yq -P file.json > file.yaml

# Python:
python -c "import json,yaml,sys; print(json.dumps(yaml.safe_load(sys.stdin)))" < f.yaml`,
        },
      ],
    },
    {
      title: 'Kubernetes manifests',
      content: `Standard K8s resource structure:`,
      code: {
        language: 'yaml',
        caption: 'Deployment + Service',
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: app
          image: ghcr.io/org/app:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "64Mi"
              cpu: "100m"
            limits:
              memory: "128Mi"
              cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: web-app
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP`,
      },
    },
    {
      title: 'Docker Compose',
      content: `Compose describes a multi-container application:`,
      code: {
        language: 'yaml',
        caption: 'docker-compose.yml',
        code: `services:
  web:
    build: .
    ports:
      - "8080:3000"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app

volumes:
  pgdata:`,
      },
    },
    {
      title: 'GitHub Actions workflow',
      content: `CI/CD pipeline in YAML:`,
      code: {
        language: 'yaml',
        caption: '.github/workflows/ci.yml',
        code: `name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:\${{ github.sha }} .`,
      },
    },
    {
      title: 'Ansible playbook (fragment)',
      content: `Ansible — YAML playbooks for configuring servers:`,
      code: {
        language: 'yaml',
        caption: 'playbook.yml',
        code: `---
- name: Configure web servers
  hosts: web
  become: true
  vars:
    nginx_port: 80
  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present
        update_cache: true

    - name: Start nginx
      systemd:
        name: nginx
        state: started
        enabled: true`,
      },
    },
    {
      title: 'Validation and linting',
      content: `**Tools:**
- **yamllint** — style and syntax
- **kubeval / kubeconform** — K8s schemas
- **actionlint** — GitHub Actions
- **ansible-lint** — Ansible

In CI, add a \`yamllint .\` step before apply/deploy.`,
      code: {
        language: 'yaml',
        caption: '.yamllint.yml',
        code: `extends: default
rules:
  line-length:
    max: 120
  indentation:
    spaces: 2
  truthy:
    allowed-values: ['true', 'false']`,
      },
    },
    {
      title: 'Secrets in YAML',
      content: `**Never** store plaintext secrets in Git.

**Alternatives:**
- Environment variables in CI
- Kubernetes Secrets (base64 — not encryption! use with encryption at rest)
- Sealed Secrets, SOPS
- External Secrets Operator + Vault/AWS SSM
- \`.env\` in .gitignore for local development

**Placeholders:** \`\${VAR}\` in Helm, envsubst, Ansible vault.`,
    },
    {
      title: 'Templating: Helm and envsubst',
      content: `Raw YAML does not scale — you need **parameters**.

**Helm values.yaml** — overrides per environment.
**envsubst** — substitute env vars into a template:
\`envsubst < template.yaml > output.yaml\`

**Kustomize** — patches without a templating engine.`,
    },
    {
      title: 'JSON in DevOps',
      content: `**Where JSON is required:**
- REST API request/response
- IAM policies (AWS)
- package.json, tsconfig.json
- \`docker inspect\` output
- Terraform plan -json

**jq** — process JSON in the shell (see the Bash chapter).`,
      code: {
        language: 'bash',
        code: `kubectl get pods -o json | jq '.items[].metadata.name'
aws sts get-caller-identity | jq .`,
      },
    },
  ],
  practice: [
    'Write docker-compose.yml: web (nginx) + redis. Verify: docker compose config',
    'Create a K8s Deployment manifest for nginx:alpine, 2 replicas. Validate: kubectl apply --dry-run=client -f',
    'Intentionally break YAML (tab instead of spaces) — read the parser error. Fix it',
    'Install yamllint, create .yamllint.yml, run it on your files',
    'Convert a compose file to JSON via yq. Compare the structure',
    'Write a GitHub Actions workflow: on push → checkout → echo hello. Check with actionlint if installed',
    'Use a YAML anchor: shared labels for 3 K8s Services via <<: *anchor',
    'Create a JSON IAM-like policy: Allow s3:GetObject on a bucket. Validate with jq .',
    'Write an Ansible playbook with 3 tasks (package, file, service) — even without running it',
    'Document in notes: 10 rules for safely working with YAML configs in Git',
  ],
  resources: [],
  quiz: [
    {
      question: 'How is a list denoted in YAML?',
      options: [
        'Items with a hyphen -',
        'Square brackets are required',
        'Only via commas on one line',
        'With the * character',
      ],
      answer: 'Items with a hyphen -',
    },
    {
      question: 'Why is indentation critical in YAML?',
      options: [
        'Indentation defines nesting; mixing tabs and spaces breaks parsing.',
        'YAML ignores indentation like JSON.',
        'Tabs and spaces are interchangeable in all parsers.',
        'Indentation is only cosmetic in YAML.',
      ],
      answer: 'Indentation defines nesting; mixing tabs and spaces breaks parsing.',
    },
    {
      question: 'How do you define a multiline string in YAML that keeps newlines?',
      options: [
        '| (literal block)',
        '> (folded) without newlines',
        'Only in quotes on one line',
        'Via JSON inside',
      ],
      answer: '| (literal block)',
    },
    {
      question: 'What does the apiVersion key mean in a Kubernetes manifest?',
      options: [
        'The API group version of the resource',
        'The application version on Docker Hub',
        'The Linux version on the node',
        'The Helm chart version',
      ],
      answer: 'The API group version of the resource',
    },
    {
      question: 'How does null in YAML differ from an empty string ""?',
      options: [
        'null means absence of a value; an empty string is a value of length 0.',
        'null and "" are always identical in YAML parsers',
        'null is a syntax error; "" is the only way to represent missing values',
        'null stores a zero-byte file path; "" stores a space character',
      ],
      answer: 'null means absence of a value; an empty string is a value of length 0.',
    },
    {
      question: 'What is the services section used for in docker-compose.yml?',
      options: [
        'Describing containers and their configuration',
        'Only a list of volumes on the host',
        'Configuring a CI pipeline',
        'Describing AWS IAM roles',
      ],
      answer: 'Describing containers and their configuration',
    },
    {
      question: 'How do you set a boolean false value in YAML?',
      options: [
        'false, False, FALSE, or n (depending on parser; usually false)',
        'Only 0 in quotes as a string, mandatory',
        'Cannot — strings only',
        'Via the ! symbol',
      ],
      answer: 'false, False, FALSE, or n (depending on parser; usually false)',
      explanation: 'In Kubernetes manifests, lowercase true/false is more common.',
    },
    {
      question: 'What do anchor &anchor and alias *alias do in YAML?',
      options: [
        'Reuse the same structure fragment by reference',
        'Encrypt a value',
        'Specify API version',
        'Define a multiline string',
      ],
      answer: 'Reuse the same structure fragment by reference',
    },
    {
      question: 'Why can the number 0123 in YAML be dangerous?',
      options: [
        'Some parsers interpret it as octal',
        'YAML does not support numbers',
        'It is always a string',
        'Breaks only JSON, not YAML',
      ],
      answer: 'Some parsers interpret it as octal',
      explanation: 'For ports and IDs, better to explicitly quote the value.',
    },
    {
      question: 'How do you set three replicas and nginx:1.25 image in a Kubernetes Deployment in YAML (name the keys)?',
      options: [
        'spec.replicas: 3 and spec.template.spec.containers[].image: nginx:1.25 (plus apiVersion/kind/metadata).',
        'metadata.replicas and status.template.image',
        'kind.replicas and containers.image without spec',
        'apiVersion.replicas and pod.template.image directly',
      ],
      answer: 'spec.replicas: 3 and spec.template.spec.containers[].image: nginx:1.25 (plus apiVersion/kind/metadata).',
    },
  ],
}

export default translation
