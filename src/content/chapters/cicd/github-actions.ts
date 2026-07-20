import type { Chapter } from '../../../types'

export const githubActionsChapter: Chapter = {
  id: 'github-actions',
  slug: 'github-actions',
  title: 'GitHub Actions: полный курс',
  moduleId: 'cicd',
  order: 1,
  duration: '5–6 часов',
  level: 'intermediate',
  description:
    'Workflows, jobs, steps, secrets, environments, matrix, caching, Docker build, deploy в Kubernetes, reusable workflows',
  sections: [
    {
      title: 'Введение в GitHub Actions',
      content: `**GitHub Actions** — встроенная CI/CD-платформа GitHub. Workflow описывается в YAML-файлах в репозитории.

**Преимущества:**
- Zero setup — работает из коробки для любого GitHub-репозитория
- Бесплатный tier: 2000 мин/мес (private), unlimited (public)
- Marketplace с 20 000+ готовых actions
- Интеграция с GitHub (PR checks, environments, packages)
- Self-hosted runners для приватных сетей

**Архитектура:**
\`\`\`
Event (push/PR) → Workflow → Job(s) → Step(s) → Action / Shell command
\`\`\`

Workflow-файлы хранятся в \`.github/workflows/\` и версионируются в Git.`,
    },
    {
      title: 'Workflow, Job, Step, Action',
      content: `**Workflow** — автоматизированный процесс, определённый YAML-файлом. Один репозиторий может иметь множество workflows.

**Job** — набор steps, выполняемых на одном runner. Jobs могут зависеть друг от друга (\`needs\`) и выполняться параллельно.

**Step** — отдельная задача внутри job. Либо запускает action (\`uses\`), либо shell-команду (\`run\`).

**Action** — переиспользуемый блок кода (composite, JavaScript, Docker).

\`\`\`
Workflow: ci.yml
├── Job: lint (runs-on: ubuntu-latest)
│   ├── Step: checkout (uses: actions/checkout@v4)
│   └── Step: run eslint (run: npm run lint)
├── Job: test (needs: lint)
│   ├── Step: checkout
│   ├── Step: setup node
│   └── Step: run tests
└── Job: deploy (needs: test, if: main)
    └── Step: deploy to k8s
\`\`\``,
      code: {
        language: 'yaml',
        code: `name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test`,
        caption: 'Минимальный workflow: lint → test',
      },
    },
    {
      title: 'Триггеры (on)',
      content: `Ключ \`on\` определяет, когда запускается workflow.

**Основные триггеры:**
| Триггер | Когда срабатывает |
|---------|-------------------|
| \`push\` | Push в указанные ветки/теги |
| \`pull_request\` | Открытие/обновление PR |
| \`schedule\` | Cron-расписание |
| \`workflow_dispatch\` | Ручной запуск из UI |
| \`release\` | Создание release |
| \`workflow_call\` | Вызов из другого workflow |

**Фильтрация:**
- \`branches\` / \`branches-ignore\`
- \`paths\` / \`paths-ignore\` — запуск только при изменении определённых файлов
- \`tags\` — по тегам (v*)

**Concurrency** — отмена предыдущих запусков при новом push:
\`\`\`yaml
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true
\`\`\``,
      code: {
        language: 'yaml',
        code: `on:
  push:
    branches: [main, develop]
    paths:
      - 'src/**'
      - 'package.json'
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'    # каждый понедельник в 06:00 UTC
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options: [staging, production]`,
        caption: 'Комбинированные триггеры с фильтрацией',
      },
    },
    {
      title: 'Runners',
      content: `**Runner** — сервер, на котором выполняются jobs.

**GitHub-hosted runners:**
| Runner | ОС | Использование |
|--------|-----|---------------|
| \`ubuntu-latest\` | Ubuntu 24.04 | Linux-приложения, Docker |
| \`windows-latest\` | Windows Server | .NET, Windows apps |
| \`macos-latest\` | macOS 14 | iOS, macOS apps |

**Self-hosted runners:**
- Устанавливаются на своих серверах / в приватной сети
- Доступ к internal resources (БД, VPN)
- Нет лимита минут (но свои ресурсы)
- Labels для маршрутизации: \`runs-on: [self-hosted, linux, gpu]\`

**Выбор runner:**
\`\`\`yaml
jobs:
  build:
    runs-on: ubuntu-latest     # GitHub-hosted
  deploy-internal:
    runs-on: [self-hosted, production]  # свой runner
\`\`\`

Для 95% задач достаточно \`ubuntu-latest\`.`,
    },
    {
      title: 'Steps: uses vs run',
      content: `**Step с \`uses\`** — запускает action (готовый или свой):
\`\`\`yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: '20'
\`\`\`

**Step с \`run\`** — выполняет shell-команду:
\`\`\`yaml
- run: npm ci
- run: echo "Hello" >> \$GITHUB_STEP_SUMMARY
  shell: bash
\`\`\`

**Параметры step:**
- \`name\` — отображаемое имя
- \`id\` — идентификатор для ссылок (\`steps.build.outputs.version\`)
- \`if\` — условие выполнения
- \`env\` — переменные окружения
- \`working-directory\` — рабочая директория
- \`timeout-minutes\` — таймаут (default: 360)
- \`continue-on-error\` — не останавливать job при ошибке`,
      code: {
        language: 'yaml',
        code: `steps:
  - name: Checkout code
    uses: actions/checkout@v4

  - name: Install dependencies
    run: npm ci
    working-directory: ./app

  - name: Run tests with coverage
    id: test
    run: |
      npm test -- --coverage
      echo "coverage=\$(cat coverage/coverage-summary.json | jq .total.lines.pct)" >> \$GITHUB_OUTPUT

  - name: Check coverage threshold
    if: steps.test.outputs.coverage < 80
    run: echo "::error::Coverage below 80%" && exit 1`,
        caption: 'Steps с id, outputs и условиями',
      },
    },
    {
      title: 'Переменные и контексты',
      content: `GitHub Actions предоставляет **контексты** — объекты с информацией о workflow, job, runner.

**Основные контексты:**
| Контекст | Содержимое |
|----------|-----------|
| \`github\` | event, ref, sha, actor, repository |
| \`env\` | переменные окружения |
| \`job\` | status, container |
| \`steps\` | outputs предыдущих steps |
| \`secrets\` | секреты репозитория |
| \`vars\` | variables репозитория/организации |
| \`runner\` | os, arch, name |

**Синтаксис:** \`\${{ context.property }}\`

**Уровни переменных (от низшего к высшему приоритету):**
1. Step-level \`env\`
2. Job-level \`env\`
3. Workflow-level \`env\`
4. Repository/Organization variables
5. Repository secrets

**Outputs между steps:**
\`\`\`yaml
- id: build
  run: echo "version=1.2.3" >> \$GITHUB_OUTPUT
- run: echo "Version is \${{ steps.build.outputs.version }}"
\`\`\``,
      code: {
        language: 'yaml',
        code: `env:
  NODE_ENV: production

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      APP_NAME: my-app
    steps:
      - run: |
          echo "Branch: \${{ github.ref_name }}"
          echo "SHA: \${{ github.sha }}"
          echo "Actor: \${{ github.actor }}"
          echo "Event: \${{ github.event_name }}"
          echo "Run ID: \${{ github.run_id }}"`,
        caption: 'Использование github-контекста',
      },
    },
    {
      title: 'Secrets',
      content: `**Secrets** — зашифрованные значения, доступные в workflow через \`\${{ secrets.NAME }}\`.

**Где хранить:**
- **Repository secrets** — Settings → Secrets → Actions
- **Organization secrets** — для всех репозиториев org
- **Environment secrets** — привязаны к environment (dev/staging/prod)

**Правила безопасности:**
1. **Никогда** не хардкодь секреты в workflow-файлах
2. **Никогда** не выводи секреты в логи (GitHub маскирует, но осторожно с base64)
3. Используй **OIDC** вместо long-lived credentials для облаков
4. Минимальные права — scope secrets к environments
5. Ротация секретов — регулярно обновляй

**OIDC (OpenID Connect)** — временные токены вместо статических ключей:
\`\`\`yaml
permissions:
  id-token: write
  contents: read
# → AWS, GCP, Azure принимают OIDC token
\`\`\`

**GITHUB_TOKEN** — автоматический токен для API GitHub (packages, releases). Scope ограничен текущим репозиторием.`,
      code: {
        language: 'yaml',
        code: `jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to container registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Deploy via SSH
        env:
          SSH_KEY: \${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          echo "\$SSH_KEY" > key.pem
          chmod 600 key.pem
          ssh -i key.pem user@server 'docker pull myapp:latest'`,
        caption: 'Использование secrets в workflow',
      },
    },
    {
      title: 'Environments и protection rules',
      content: `**Environments** — именованные deployment targets (dev, staging, production) с правилами защиты.

**Настройка:** Settings → Environments → New environment

**Protection rules:**
- **Required reviewers** — manual approval перед деплоем (1–6 человек)
- **Wait timer** — задержка перед деплоем (0–43 200 мин)
- **Deployment branches** — только определённые ветки могут деплоить
- **Environment secrets** — секреты, доступные только в этом environment

**Использование в workflow:**
\`\`\`yaml
jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - run: ./deploy.sh
\`\`\`

**Deployment history** — GitHub показывает кто, когда и какой коммит задеплоил в каждый environment.

**Рекомендация:** всегда используй environment с required reviewers для production.`,
      code: {
        language: 'yaml',
        code: `jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: kubectl apply -f k8s/ --namespace=staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://myapp.example.com
    steps:
      - run: kubectl apply -f k8s/ --namespace=production`,
        caption: 'Деплой в staging (авто) и production (с approval)',
      },
    },
    {
      title: 'Matrix builds',
      content: `**Matrix strategy** — параллельный запуск job с разными комбинациями параметров.

**Применение:**
- Тестирование на разных версиях Node.js / Python / Go
- Кросс-платформенная сборка (linux, windows, macos)
- Тестирование с разными БД

\`\`\`yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, windows-latest]
\`\`\`

→ Создаст 6 job'ов (3 версии × 2 ОС).

**Опции:**
- \`fail-fast: false\` — не отменять остальные при ошибке одного
- \`max-parallel: 4\` — ограничить параллелизм
- \`include\` / \`exclude\` — добавить/убрать комбинации`,
      code: {
        language: 'yaml',
        code: `jobs:
  test:
    runs-on: \${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest]
        node-version: [18, 20, 22]
        include:
          - os: ubuntu-latest
            node-version: 22
            coverage: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
      - if: matrix.coverage
        run: npm run test:coverage`,
        caption: 'Matrix: 2 ОС × 3 версии Node.js',
      },
    },
    {
      title: 'Кэширование зависимостей',
      content: `**Кэширование** ускоряет pipeline, сохраняя зависимости между запусками.

**Встроенный cache в setup actions:**
\`\`\`yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'    # автоматически кэширует node_modules
\`\`\`

Поддерживается: npm, yarn, pnpm, pip, go, gradle, maven, cargo.

**actions/cache** — универсальный кэш:
\`\`\`yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: \${{ runner.os }}-npm-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-npm-
\`\`\`

**Принципы:**
- \`key\` — уникальный идентификатор (включай hash файлов зависимостей)
- \`restore-keys\` — partial match для fallback
- Кэш привязан к ветке, но доступен across branches
- Лимит: 10 GB на репозиторий
- Не кэшируй артефакты сборки — только зависимости`,
      code: {
        language: 'yaml',
        code: `jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Cache Docker layers
        uses: actions/cache@v4
        with:
          path: /tmp/.buildx-cache
          key: \${{ runner.os }}-buildx-\${{ github.sha }}
          restore-keys: |
            \${{ runner.os }}-buildx-

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci   # из кэша, если key совпал`,
        caption: 'Кэширование npm и Docker layers',
      },
    },
    {
      title: 'Артефакты (artifacts)',
      content: `**Artifacts** — файлы, сохраняемые между jobs или скачиваемые после workflow.

**Загрузка:**
\`\`\`yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7
\`\`\`

**Скачивание:**
\`\`\`yaml
- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
\`\`\`

**Применение:**
- Передача build-артефактов между jobs (build → test → deploy)
- Сохранение test reports, coverage reports
- Сохранение логов для отладки

**Лимиты:** 500 MB на artifact (бесплатный), 10 GB (paid). Retention: 1–90 дней.

Для Docker-образов используй registry (GHCR, ECR), а не artifacts.`,
    },
    {
      title: 'Docker build и push',
      content: `Стандартный паттерн: собрать Docker-образ и запушить в registry при merge в main.

**Компоненты:**
1. \`docker/login-action\` — аутентификация в registry
2. \`docker/setup-buildx-action\` — BuildKit builder
3. \`docker/build-push-action\` — сборка и push
4. \`docker/metadata-action\` — генерация тегов

**GitHub Container Registry (GHCR):**
- \`ghcr.io/<owner>/<image>:<tag>\`
- Аутентификация через \`GITHUB_TOKEN\` или PAT
- Бесплатно для public, included в GitHub plan для private`,
      code: {
        language: 'yaml',
        code: `jobs:
  build-and-push:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - uses: docker/setup-buildx-action@v3

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: |
            type=sha
            type=ref,event=branch
            type=semver,pattern={{version}}

      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max`,
        caption: 'Build + push в GHCR с кэшированием',
      },
    },
    {
      title: 'Deploy в Kubernetes',
      content: `Деплой в K8s из GitHub Actions — типичный CD-шаг.

**Подходы:**
1. **kubectl apply** — прямое применение манифестов
2. **Helm upgrade** — через Helm chart
3. **ArgoCD** — GitOps (обновить image tag в Git → ArgoCD синхронизирует)

**Аутентификация в K8s:**
- Kubeconfig как secret
- OIDC (EKS, GKE, AKS)
- Service Account token

**Паттерн: обновить image tag и apply:**
\`\`\`yaml
- run: |
    sed -i "s|image: .*|image: ghcr.io/org/app:\${{ github.sha }}|" k8s/deployment.yaml
    kubectl apply -f k8s/
\`\`\`

Для production рекомендуется **GitOps** (ArgoCD/Flux) вместо прямого kubectl из CI.`,
      code: {
        language: 'yaml',
        code: `jobs:
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Configure kubectl
        uses: azure/k8s-set-context@v4
        with:
          kubeconfig: \${{ secrets.KUBE_CONFIG }}

      - name: Update image tag
        run: |
          kubectl set image deployment/myapp \\
            app=ghcr.io/\${{ github.repository }}:\${{ github.sha }} \\
            --namespace=production

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/myapp \\
            --namespace=production --timeout=300s`,
        caption: 'Деплой в K8s: обновление image + rollout status',
      },
    },
    {
      title: 'Reusable workflows',
      content: `**Reusable workflows** — вынос общей логики в отдельный workflow, вызываемый из других.

**Создание** (\`.github/workflows/reusable-ci.yml\`):
\`\`\`yaml
on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
    secrets:
      npm-token:
        required: true
\`\`\`

**Вызов:**
\`\`\`yaml
jobs:
  ci:
    uses: ./.github/workflows/reusable-ci.yml
    with:
      node-version: '20'
    secrets:
      npm-token: \${{ secrets.NPM_TOKEN }}
\`\`\`

**Преимущества:**
- DRY — одна CI-логика для множества репозиториев
- Централизованное обновление (org-level workflows)
- Стандартизация across teams

**Организационные workflows:**
\`\`\`yaml
uses: my-org/.github/.github/workflows/ci.yml@main
\`\`\``,
      code: {
        language: 'yaml',
        code: `# .github/workflows/reusable-docker-build.yml
name: Reusable Docker Build

on:
  workflow_call:
    inputs:
      image-name:
        required: true
        type: string
    outputs:
      image-tag:
        value: \${{ jobs.build.outputs.tag }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      tag: \${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        id: build
        with:
          push: true
          tags: \${{ inputs.image-name }}:\${{ github.sha }}`,
        caption: 'Reusable workflow для Docker build',
      },
    },
    {
      title: 'Composite Actions',
      content: `**Composite Action** — переиспользуемый набор steps в одном action.

**Структура:**
\`\`\`
.github/actions/setup-app/
├── action.yml
└── (optional scripts)
\`\`\`

**action.yml:**
\`\`\`yaml
name: 'Setup App'
description: 'Install dependencies and build'
inputs:
  node-version:
    default: '20'
runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: \${{ inputs.node-version }}
    - run: npm ci
      shell: bash
    - run: npm run build
      shell: bash
\`\`\`

**Использование:**
\`\`\`yaml
- uses: ./.github/actions/setup-app
  with:
    node-version: '22'
\`\`\`

Composite actions — для логики внутри репозитория. Reusable workflows — для логики между репозиториями.`,
    },
    {
      title: 'Полный CI/CD pipeline: пример',
      content: `Соберём всё вместе — production-ready pipeline:`,
      code: {
        language: 'yaml',
        code: `name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage

  build-and-push:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: echo "Deploy \${{ github.sha }} to staging"

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: echo "Deploy \${{ github.sha }} to production"`,
        caption: 'Полный pipeline: test → build → staging → production',
      },
    },
    {
      title: 'Отладка и best practices',
      content: `**Отладка workflows:**
- **Actions tab** — логи каждого run, step, timing
- **\`echo "::debug::message"\`** — debug-вывод (включи в Settings → Secrets → Actions → Debug)
- **\`act\`** — локальный запуск workflows (nektos/act)
- **Workflow visualization** — граф зависимостей jobs

**Best practices:**
1. Пинning actions по SHA, не по tag (\`@v4\` → \`@<commit-sha>\` для prod)
2. Минимальные \`permissions\` (principle of least privilege)
3. \`concurrency\` с \`cancel-in-progress\` для экономии минут
4. Кэширование зависимостей
5. Fail fast — lint перед тестами
6. Environments с approval для production
7. OIDC вместо long-lived secrets
8. Reusable workflows для стандартизации
9. \`timeout-minutes\` на jobs для защиты от зависания
10. Dependabot для обновления actions

**Частые ошибки:**
- Забыть \`permissions\` для GITHUB_TOKEN (packages, deployments)
- Не указать \`needs\` → jobs запускаются параллельно без зависимости
- Секреты не доступны в fork PR (by design, security)`,
    },
  ],
  practice: [
    'Создай workflow: lint + unit test на каждый PR в репозитории pet-проекта',
    'Добавь matrix build для Node.js 18, 20, 22 на ubuntu и macOS',
    'Настрой кэширование npm-зависимостей и измерь разницу во времени pipeline',
    'Добавь сборку Docker-образа и push в GHCR при merge в main',
    'Создай environments staging и production с required reviewers для prod',
    'Напиши reusable workflow для Docker build и вызови его из основного CI',
    'Создай composite action для setup + build и используй в workflow',
    'Добавь deploy step: kubectl set image или обновление манифеста в Git (GitOps)',
    'Настрой concurrency с cancel-in-progress и workflow_dispatch с выбором environment',
    'Установи act и запусти workflow локально для отладки',
  ],
  resources: [
    { title: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions' },
    { title: 'Actions Marketplace', url: 'https://github.com/marketplace?type=actions' },
  ],
}
