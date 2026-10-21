import type { Chapter } from '../../../types'

export const yamlChapter: Chapter = {
  id: 'yaml',
  slug: 'yaml',
  title: 'YAML и JSON для DevOps',
  moduleId: 'fundamentals',
  order: 5,
  duration: '2–3 часа',
  level: 'beginner',
  description:
    'YAML и JSON в DevOps: синтаксис, отступы, якоря, валидация, Kubernetes манифесты, GitHub Actions, Docker Compose, Ansible',
  sections: [
    {
      title: 'Зачем YAML и JSON в DevOps',
      content: `**Конфигурация как данные** — основа современной инфраструктуры:

| Формат | Где используется |
|--------|------------------|
| **YAML** | K8s, Docker Compose, GitHub Actions, Ansible, Helm values |
| **JSON** | API, Terraform (иногда), package.json, AWS policies |
| **HCL** | Terraform (отдельная глава) |

YAML — **human-friendly**, JSON — **machine-friendly**. Многие инструменты принимают оба (YAML парсится в те же структуры).

> Одна опечатка в отступе YAML — час отладки. Используй валидаторы и IDE с подсветкой.`,
    },
    {
      title: 'Синтаксис YAML: основы',
      content: `**YAML** (YAML Ain't Markup Language) — сериализация данных.

**Правила:**
- Отступы **пробелами** (не табы!), обычно 2
- Структура через отступ, не скобки
- \`#\` — комментарий
- \`---\` — начало документа
- \`...\` — конец (редко)`,
      code: {
        language: 'yaml',
        caption: 'Базовые типы',
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
      title: 'Списки и словари',
      content: `**Словарь (map):** ключ: значение
**Список (array):** дефис + пробел`,
      codes: [
        {
          language: 'yaml',
          caption: 'Map и list',
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
          caption: 'Inline формы',
          code: `# Inline list:
tags: [web, production, api]

# Inline map:
labels: { app: nginx, env: prod }`,
        },
      ],
    },
    {
      title: 'Строки: кавычки и многострочность',
      content: `| Тип | Синтаксис | Поведение |
|-----|-----------|-----------|
| Обычная | \`hello\` | Простой текст |
| В кавычках | \`"hello: world"\` | Спецсимволы, двоеточия |
| Literal block | \`\|\` | Сохраняет переносы, добавляет \\n в конце |
| Folded block | \`>\` | Переносы → пробелы |

**Экранирование в двойных кавычках:** \`\\n\`, \`\\t\`, \`\\\\\``,
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
      title: 'Якоря и алиасы',
      content: `**Якорь** (\`&\`) и **алиас** (\`*\`) — переиспользование блоков (DRY в YAML).`,
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
      title: 'Типичные ошибки YAML',
      content: `1. **Табы вместо пробелов** — парсер падает
2. **Двоеточие в незакрытой строке** — нужны кавычки
3. **yes/no/on/off** — в YAML 1.2 это строки, не boolean (в 1.1 yes=true — осторожно!)
4. **Числа с ведущим нулём** — \`0123\` может стать восьмеричным
5. **Пустое значение** — \`key:\` = null

**Всегда валидируй:**
\`yamllint file.yaml\`
\`python -c "import yaml; yaml.safe_load(open('f.yaml'))"\``,
    },
    {
      title: 'JSON: синтаксис',
      content: `**JSON** — строгий подмножество для обмена данными.

- Двойные кавычки для строк
- Нет комментариев
- Нет trailing comma (в стандарте)
- Типы: object {}, array [], string, number, boolean, null`,
      codes: [
        {
          language: 'json',
          caption: 'Пример JSON',
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
          caption: 'Конвертация YAML ↔ JSON',
          code: `# yq (установи: snap install yq или brew)
yq -o=json config.yaml
yq -P file.json > file.yaml

# Python:
python -c "import json,yaml,sys; print(json.dumps(yaml.safe_load(sys.stdin)))" < f.yaml`,
        },
      ],
    },
    {
      title: 'Kubernetes манифесты',
      content: `Стандартная структура K8s ресурса:`,
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
      content: `Compose описывает multi-container приложение:`,
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
      content: `CI/CD pipeline в YAML:`,
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
      title: 'Ansible playbook (фрагмент)',
      content: `Ansible — YAML playbooks для конфигурации серверов:`,
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
      title: 'Валидация и линтинг',
      content: `**Инструменты:**
- **yamllint** — стиль и синтаксис
- **kubeval / kubeconform** — K8s схемы
- **actionlint** — GitHub Actions
- **ansible-lint** — Ansible

В CI добавляй шаг \`yamllint .\` перед apply/deploy.`,
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
      title: 'Секреты в YAML',
      content: `**Никогда** не храни plaintext секреты в Git.

**Альтернативы:**
- Environment variables в CI
- Kubernetes Secrets (base64 — не шифрование! используй с encryption at rest)
- Sealed Secrets, SOPS
- External Secrets Operator + Vault/AWS SSM
- \`.env\` в .gitignore для локальной разработки

**Плейсхолдеры:** \`\${VAR}\` в Helm, envsubst, Ansible vault.`,
    },
    {
      title: 'Шаблонизация: Helm и envsubst',
      content: `Сырой YAML не масштабируется — нужны **параметры**.

**Helm values.yaml** — переопределение для окружений.
**envsubst** — подстановка env vars в шаблон:
\`envsubst < template.yaml > output.yaml\`

**Kustomize** — patches без шаблонизатора.`,
    },
    {
      title: 'JSON в DevOps',
      content: `**Где JSON обязателен:**
- REST API request/response
- IAM policies (AWS)
- package.json, tsconfig.json
- \`docker inspect\` output
- Terraform plan -json

**jq** — обработка JSON в shell (см. главу Bash).`,
      code: {
        language: 'bash',
        code: `kubectl get pods -o json | jq '.items[].metadata.name'
aws sts get-caller-identity | jq .`,
      },
    },
  ],
  practice: [
    'Напиши docker-compose.yml: web (nginx) + redis. Проверь: docker compose config',
    'Создай K8s Deployment manifest для nginx:alpine, 2 replicas. Валидируй: kubectl apply --dry-run=client -f',
    'Намеренно сломай YAML (таб вместо пробелов) — прочитай ошибку парсера. Исправь',
    'Установи yamllint, создай .yamllint.yml, прогони по своим файлам',
    'Конвертируй compose файл в JSON через yq. Сравни структуру',
    'Напиши GitHub Actions workflow: on push → checkout → echo hello. Проверь actionlint если установлен',
    'Используй YAML anchor: общие labels для 3 K8s Services через <<: *anchor',
    'Создай JSON IAM-like policy: Allow s3:GetObject на bucket. Валидируй jq .',
    'Напиши Ansible playbook из 3 tasks (package, file, service) — даже без запуска',
    'Документируй в заметках: 10 правил безопасной работы с YAML конфигами в Git',
  ],
  resources: [],
}
