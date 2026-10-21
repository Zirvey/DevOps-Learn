import type { Chapter } from '../../../types'

export const helmChapter: Chapter = {
  id: 'helm',
  slug: 'helm',
  title: 'Helm',
  moduleId: 'orchestration',
  order: 2,
  duration: '5–6 часов',
  level: 'intermediate',
  description:
    'Полное руководство по Helm: charts, values, templates, releases, репозитории и production-паттерны',
  sections: [
    {
      title: 'Что такое Helm и зачем он нужен',
      content: `**Helm** — пакетный менеджер для Kubernetes. «apt/yum/homebrew для K8s». Упрощает установку, обновление и удаление сложных приложений.

**Проблема без Helm:**

\`\`\`
k8s/
├── namespace.yaml
├── configmap.yaml
├── secret.yaml
├── deployment.yaml
├── service.yaml
├── ingress.yaml
├── hpa.yaml
├── pdb.yaml
├── networkpolicy.yaml
└── serviceaccount.yaml
\`\`\`

10+ YAML-файлов × 3 окружения (dev/staging/prod) = 30+ файлов с дублированием.

**С Helm:**

\`\`\`
my-app/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
├── values-prod.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    └── ...
\`\`\`

Один chart + values per environment. Шаблонизация, версионирование, rollback.

**Ключевые концепции:**

| Концепция | Описание |
|-----------|----------|
| **Chart** | Пакет K8s-ресурсов (шаблоны + values + metadata) |
| **Release** | Установленный экземпляр chart в кластере |
| **Repository** | HTTP-сервер с chart'ами (как apt repo) |
| **Values** | Параметры конфигурации chart |
| **Templates** | Go templates → K8s YAML |`,
    },
    {
      title: 'Установка Helm и основные команды',
      content: `**Helm 3** (текущая версия) — без Tiller (server-side component из Helm 2). Безопаснее и проще.

**Установка:**

| Платформа | Команда |
|-----------|---------|
| macOS | \`brew install helm\` |
| Linux | \`curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash\` |
| Windows | \`choco install kubernetes-helm\` |

**Основные команды:**

| Команда | Описание |
|---------|----------|
| \`helm repo add\` | Добавить chart repository |
| \`helm search repo\` | Поиск chart'ов |
| \`helm install\` | Установить chart (создать release) |
| \`helm upgrade\` | Обновить release |
| \`helm rollback\` | Откатить release |
| \`helm uninstall\` | Удалить release |
| \`helm list\` | Список releases |
| \`helm status\` | Статус release |
| \`helm get values\` | Текущие values release |
| \`helm template\` | Рендер без установки (для CI/debug) |`,
      codes: [
        {
          language: 'bash',
          code: `# Установка и проверка
helm version

# Работа с репозиториями
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm search repo nginx
helm search repo nginx --versions

# Установка chart
helm install my-nginx bitnami/nginx \\
  --namespace web --create-namespace \\
  --set replicaCount=3 \\
  --set service.type=ClusterIP

# Управление release
helm list -A
helm status my-nginx -n web
helm get values my-nginx -n web
helm upgrade my-nginx bitnami/nginx --set replicaCount=5 -n web
helm rollback my-nginx 1 -n web
helm uninstall my-nginx -n web`,
          caption: 'Основные команды Helm',
        },
      ],
    },
    {
      title: 'Структура Helm Chart',
      content: `Стандартная структура chart, создаваемая через \`helm create\`:

\`\`\`
my-app/
├── Chart.yaml          # Метаданные chart (имя, версия, dependencies)
├── Chart.lock          # Lock-файл dependencies (как package-lock.json)
├── values.yaml         # Default values
├── values-dev.yaml     # Override для dev
├── values-prod.yaml    # Override для prod
├── templates/          # Go templates → K8s YAML
│   ├── _helpers.tpl    # Вспомогательные template functions
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   ├── serviceaccount.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── NOTES.txt       # Post-install инструкции
│   └── tests/
│       └── test-connection.yaml
├── charts/             # Зависимые sub-charts
└── .helmignore         # Исключения при packaging
\`\`\`

**Chart.yaml:**

\`\`\`yaml
apiVersion: v2
name: my-app
description: My application Helm chart
type: application
version: 1.2.0        # версия chart
appVersion: "2.1.0"   # версия приложения
\`\`\`

**Версионирование:** chart version (SemVer) ≠ app version. Chart version меняется при изменении templates/values, app version — при обновлении Docker-образа.`,
      code: {
        language: 'yaml',
        code: `# Chart.yaml
apiVersion: v2
name: my-app
description: A Helm chart for my application
type: application
version: 0.1.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: "15.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: "18.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled

maintainers:
  - name: DevOps Team
    email: devops@example.com`,
        caption: 'Chart.yaml с dependencies',
      },
    },
    {
      title: 'Values — конфигурация chart',
      content: `**values.yaml** — файл с default-параметрами chart. Переопределяется при install/upgrade.

**Способы передачи values (по приоритету):**

1. \`values.yaml\` в chart (defaults)
2. Parent chart's values (для sub-charts)
3. \`-f values-prod.yaml\` (файлы, последний побеждает)
4. \`--set key=value\` (CLI, наивысший приоритет)

**Структура values.yaml:**

\`\`\`yaml
replicaCount: 3
image:
  repository: ghcr.io/myorg/myapp
  tag: "1.0.0"
  pullPolicy: IfNotPresent
service:
  type: ClusterIP
  port: 80
ingress:
  enabled: true
  host: api.example.com
resources:
  requests:
    cpu: 100m
    memory: 128Mi
\`\`\`

**Sub-chart values:** передаются через ключ с именем sub-chart:

\`\`\`yaml
postgresql:
  enabled: true
  auth:
    password: secret
\`\`\`

**Global values:** доступны всем sub-charts через \`.Values.global\`.`,
      codes: [
        {
          language: 'yaml',
          code: `# values.yaml — defaults
replicaCount: 2

image:
  repository: ghcr.io/myorg/myapp
  pullPolicy: IfNotPresent
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  className: nginx
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: false
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

nodeSelector: {}
tolerations: []
affinity: {}`,
          caption: 'Типичный values.yaml',
        },
        {
          language: 'yaml',
          code: `# values-prod.yaml — production overrides
replicaCount: 5

image:
  tag: "2.1.0"

ingress:
  enabled: true
  hosts:
    - host: api.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: api-tls
      hosts:
        - api.example.com

resources:
  limits:
    cpu: "2"
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20`,
          caption: 'values-prod.yaml — production overrides',
        },
      ],
    },
    {
      title: 'Templates — Go templating в Helm',
      content: `Файлы в \`templates/\` — Go templates, которые Helm рендерит в K8s YAML с подстановкой values.

**Основной синтаксис:**

| Синтаксис | Описание | Пример |
|-----------|----------|--------|
| \`{{ .Values.key }}\` | Значение из values | \`{{ .Values.replicaCount }}\` |
| \`{{ .Release.Name }}\` | Имя release | \`my-app\` |
| \`{{ .Chart.Name }}\` | Имя chart | \`my-app\` |
| \`{{ .Chart.Version }}\` | Версия chart | \`1.0.0\` |
| \`{{- if .Values.ingress.enabled }}\` | Условие | Включить Ingress |
| \`{{- range .Values.env }}\` | Цикл | Список env vars |
| \`{{ include "name" . }}\` | Вызов helper | Из _helpers.tpl |
| \`{{ .Values.image.tag \\| default .Chart.AppVersion }}\` | Default value | Fallback |

**Важные функции:**

- \`default\` — значение по умолчанию
- \`required\` — обязательное значение (ошибка если пусто)
- \`toYaml\` / \`fromYaml\` — конвертация
- \` nindent\` — отступ для вложенного YAML
- \`quote\` — обернуть в кавычки
- \`b64enc\` / \`b64dec\` — base64

**_helpers.tpl** — переиспользуемые template functions (имена, labels).`,
      codes: [
        {
          language: 'yaml',
          code: `# templates/_helpers.tpl
{{- define "my-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{- define "my-app.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "my-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}`,
          caption: '_helpers.tpl — переиспользуемые функции',
        },
        {
          language: 'yaml',
          code: `# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "my-app.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "my-app.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          ports:
            - containerPort: {{ .Values.service.port }}
          {{- with .Values.resources }}
          resources:
            {{- toYaml . | nindent 12 }}
          {{- end }}`,
          caption: 'Deployment template с helpers',
        },
      ],
    },
    {
      title: 'Условная логика и циклы в templates',
      content: `Helm templates поддерживают полноценную логику для создания гибких chart'ов.

**Условия (if/else/end):**

\`\`\`yaml
{{- if .Values.ingress.enabled }}
# ... ingress manifest
{{- end }}
\`\`\`

**Циклы (range):**

\`\`\`yaml
{{- range .Values.env }}
- name: {{ .name }}
  value: {{ .value | quote }}
{{- end }}
\`\`\`

**With — изменение scope:**

\`\`\`yaml
{{- with .Values.nodeSelector }}
nodeSelector:
  {{- toYaml . | nindent 8 }}
{{- end }}
\`\`\`

**Паттерны:**

| Паттерн | Template |
|---------|----------|
| Optional block | \`{{- if .Values.x }}...{{- end }}\` |
| List of items | \`{{- range .Values.items }}...{{- end }}\` |
| Pass-through YAML | \`{{- toYaml .Values.annotations \\| nindent 4 }}\` |
| Required value | \`{{ required "image.tag is required" .Values.image.tag }}\` |
| Indentation | \`nindent 4\` (newline + indent) vs \`indent 4\` |`,
      code: {
        language: 'yaml',
        code: `# templates/ingress.yaml
{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "my-app.fullname" . }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "my-app.fullname" $ }}
                port:
                  number: {{ $.Values.service.port }}
          {{- end }}
    {{- end }}
{{- end }}`,
        caption: 'Ingress template с условиями и циклами',
      },
    },
    {
      title: 'Chart Dependencies — sub-charts',
      content: `Helm chart может зависеть от других chart'ов (sub-charts / dependencies). Аналог npm dependencies.

**Объявление в Chart.yaml:**

\`\`\`yaml
dependencies:
  - name: postgresql
    version: "15.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
\`\`\`

**Управление dependencies:**

\`\`\`bash
helm dependency update ./my-app    # скачать в charts/
helm dependency list ./my-app      # список
helm dependency build ./my-app   # из Chart.lock
\`\`\`

**Передача values в sub-chart:**

\`\`\`yaml
# values.yaml
postgresql:
  enabled: true
  auth:
    username: app
    password: secret
    database: myapp
  primary:
    persistence:
      size: 20Gi
\`\`\`

**Condition** — sub-chart устанавливается только если \`postgresql.enabled: true\`.

**Tags** — группировка dependencies:

\`\`\`yaml
dependencies:
  - name: redis
    tags:
      - cache
# helm install --set tags.cache=true
\`\`\``,
      codes: [
        {
          language: 'bash',
          code: `# Добавить dependency
helm dependency update ./my-app

# Структура после update
# my-app/charts/
#   postgresql-15.2.0.tgz
#   redis-18.5.0.tgz

# Установка с dependencies
helm install my-app ./my-app \\
  -f values.yaml \\
  --set postgresql.enabled=true \\
  --set redis.enabled=true

# Отключить sub-chart
helm upgrade my-app ./my-app --set postgresql.enabled=false`,
          caption: 'Управление chart dependencies',
        },
      ],
    },
    {
      title: 'Helm Hooks — lifecycle events',
      content: `**Helm Hooks** — выполнение K8s-ресурсов на определённых этапах жизненного цикла release.

**Типы hooks:**

| Hook | Когда выполняется |
|------|-------------------|
| \`pre-install\` | Перед созданием resources |
| \`post-install\` | После создания resources |
| \`pre-upgrade\` | Перед обновлением |
| \`post-upgrade\` | После обновления |
| \`pre-delete\` | Перед удалением |
| \`post-delete\` | После удаления |
| \`pre-rollback\` | Перед откатом |
| \`post-rollback\` | После отката |
| \`test\` | При \`helm test\` |

**Аннотации для hooks:**

\`\`\`yaml
annotations:
  "helm.sh/hook": pre-install,pre-upgrade
  "helm.sh/hook-weight": "-5"
  "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
\`\`\`

**Use cases:**

- \`pre-install\` — миграция БД перед деплоем
- \`post-install\` — smoke test, отправка уведомления
- \`pre-delete\` — backup данных перед удалением
- \`test\` — integration test после install`,
      code: {
        language: 'yaml',
        code: `# templates/job-migrate.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ include "my-app.fullname" . }}-migrate
  annotations:
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": before-hook-creation
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          command: ["npm", "run", "migrate"]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "my-app.fullname" . }}-db
                  key: url`,
        caption: 'Pre-install hook для миграции БД',
      },
    },
    {
      title: 'Helm в CI/CD — template, lint, test',
      content: `Helm интегрируется в CI/CD pipeline для валидации и автоматического деплоя.

**Этапы CI/CD с Helm:**

1. **Lint** — \`helm lint ./my-app\` — проверка chart
2. **Template** — \`helm template\` — рендер без установки
3. **Test** — \`helm test\` — post-install tests
4. **Package** — \`helm package\` — создать .tgz
5. **Push** — \`helm push\` — в OCI registry
6. **Install/Upgrade** — \`helm upgrade --install\` — деплой

**\`helm template\`** — рендерит templates локально. Идеален для:
- Проверки output в CI
- Diff перед deploy
- Генерации YAML для GitOps

**\`helm lint\`** — проверяет chart на ошибки (missing values, invalid YAML).

**\`helm diff\`** (плагин) — показывает diff между текущим release и новым.

**OCI Registry:** Helm 3.8+ поддерживает push/pull chart'ов в OCI-совместимые registry (GHCR, ECR, Harbor).`,
      codes: [
        {
          language: 'bash',
          code: `# Локальная валидация
helm lint ./my-app
helm lint ./my-app -f values-prod.yaml

# Рендер без установки
helm template my-app ./my-app -f values-prod.yaml
helm template my-app ./my-app -f values-prod.yaml > rendered.yaml

# Diff (плагин helm-diff)
helm plugin install https://github.com/databahn-ai/helm-diff
helm diff upgrade my-app ./my-app -f values-prod.yaml -n production

# Package и push в OCI registry
helm package ./my-app
helm push my-app-1.0.0.tgz oci://ghcr.io/myorg/charts

# Pull из OCI
helm pull oci://ghcr.io/myorg/charts/my-app --version 1.0.0`,
          caption: 'Helm в CI/CD pipeline',
        },
        {
          language: 'yaml',
          code: `# .github/workflows/helm-deploy.yml
name: Helm Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/setup-helm@v3

      - name: Lint
        run: helm lint ./charts/my-app -f values-prod.yaml

      - name: Template validation
        run: helm template my-app ./charts/my-app -f values-prod.yaml | kubeconform -summary

      - name: Deploy
        run: |
          helm upgrade --install my-app ./charts/my-app \\
            -f values-prod.yaml \\
            -n production --create-namespace \\
            --atomic --timeout 5m \\
            --set image.tag=\${{ github.sha }}`,
          caption: 'GitHub Actions с Helm deploy',
        },
      ],
    },
    {
      title: 'Release management — upgrade, rollback, history',
      content: `Helm отслеживает историю каждого release, что позволяет безопасно обновлять и откатывать.

**helm upgrade --install** — idempotent: создаёт release если не существует, обновляет если есть.

**Полезные флаги:**

| Флаг | Описание |
|------|----------|
| \`--atomic\` | Автоматический rollback при failure |
| \`--wait\` | Ждать ready всех resources |
| \`--timeout 5m\` | Таймаут ожидания |
| \`--dry-run\` | Симуляция без применения |
| \`--reset-values\` | Сбросить к chart defaults |
| \`--reuse-values\` | Сохранить текущие values |
| \`--force\` | Пересоздать resources (recreate pods) |
| \`--cleanup-on-fail\` | Удалить новые resources при failure |

**История releases:**

\`\`\`bash
helm history my-app -n production
# REVISION  STATUS      CHART           DESCRIPTION
# 1          superseded  my-app-1.0.0    Install complete
# 2          superseded  my-app-1.1.0    Upgrade complete
# 3          deployed    my-app-1.2.0    Upgrade complete
\`\`\`

**Rollback:** \`helm rollback my-app 1\` — откат к revision 1.`,
      codes: [
        {
          language: 'bash',
          code: `# Безопасный upgrade
helm upgrade --install my-app ./my-app \\
  -f values-prod.yaml \\
  -n production \\
  --atomic \\
  --wait \\
  --timeout 10m \\
  --set image.tag=2.0.0

# История
helm history my-app -n production

# Rollback
helm rollback my-app -n production          # к предыдущей
helm rollback my-app 2 -n production        # к revision 2

# Получить manifest конкретной revision
helm get manifest my-app --revision 2 -n production

# Удаление
helm uninstall my-app -n production
helm uninstall my-app -n production --keep-history  # сохранить историю`,
          caption: 'Release management',
        },
      ],
    },
    {
      title: 'Популярные Helm Charts и репозитории',
      content: `Экосистема Helm charts — один из главных активов Kubernetes-сообщества.

**Популярные chart repositories:**

| Repository | URL | Charts |
|------------|-----|--------|
| Bitnami | charts.bitnami.com | 200+ production-ready |
| Prometheus Community | prometheus-community.github.io | Monitoring stack |
| Ingress NGINX | kubernetes.github.io/ingress-nginx | Ingress controller |
| Jetstack | charts.jetstack.io | Cert Manager |
| Argo | argoproj.github.io/argo-helm | ArgoCD, Rollouts |
| Grafana | grafana.github.io/helm-charts | Grafana, Loki, Tempo |
| Elastic | helm.elastic.co | ELK stack |

**Часто используемые charts:**

| Chart | Назначение |
|-------|------------|
| \`bitnami/nginx\` | Web server |
| \`bitnami/postgresql\` | PostgreSQL |
| \`bitnami/redis\` | Redis |
| \`prometheus-community/kube-prometheus-stack\` | Full monitoring |
| \`ingress-nginx/ingress-nginx\` | Ingress controller |
| \`jetstack/cert-manager\` | TLS certificates |
| \`argo/argo-cd\` | GitOps CD |
| \`grafana/grafana\` | Dashboards |

**Artifact Hub** (artifacthub.io) — поисковик по всем публичным chart repositories.`,
      codes: [
        {
          language: 'bash',
          code: `# Установка monitoring stack
helm repo add prometheus-community \\
  https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \\
  -n monitoring --create-namespace \\
  -f monitoring-values.yaml

# Cert Manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \\
  -n cert-manager --create-namespace \\
  --set installCRDs=true

# ArgoCD
helm repo add argo https://argoproj.github.io/argo-helm
helm install argocd argo/argo-cd \\
  -n argocd --create-namespace`,
          caption: 'Установка популярных charts',
        },
      ],
    },
    {
      title: 'Создание собственного chart — полный пример',
      content: `Создадим production-ready chart для web-приложения с нуля.

**Шаги:**

1. \`helm create my-app\` — scaffold
2. Настроить Chart.yaml (metadata, dependencies)
3. Написать values.yaml (defaults) и values-prod.yaml
4. Адаптировать templates (deployment, service, ingress, hpa)
5. Добавить _helpers.tpl
6. \`helm lint\` → \`helm template\` → \`helm install\`

**Что включить в production chart:**

- Deployment с probes, resources, securityContext
- Service (ClusterIP)
- Ingress (опционально, condition)
- HPA (опционально, condition)
- ServiceAccount + RBAC
- ConfigMap и Secret templates
- PDB (PodDisruptionBudget)
- NOTES.txt с post-install инструкциями
- Test hook (curl health endpoint)`,
      codes: [
        {
          language: 'bash',
          code: `# Создание chart
helm create my-app
cd my-app

# Удалить лишние templates (оставить нужные)
rm templates/hpa.yaml templates/ingress.yaml templates/serviceaccount.yaml
# Переписать deployment.yaml, service.yaml под свой проект

# Валидация
helm lint .
helm template my-app . -f values.yaml
helm template my-app . -f values-prod.yaml | kubectl apply --dry-run=client -f -

# Установка
helm install my-app . -f values.yaml -n dev --create-namespace
helm test my-app -n dev`,
          caption: 'Создание chart с нуля',
        },
        {
          language: 'yaml',
          code: `# values.yaml для полного chart
replicaCount: 2

image:
  repository: ghcr.io/myorg/myapp
  tag: ""
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: false
  className: nginx
  annotations: {}
  hosts:
    - host: app.local
      paths:
        - path: /
          pathType: Prefix

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: false
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

pdb:
  enabled: true
  minAvailable: 1

env:
  - name: NODE_ENV
    value: production
  - name: LOG_LEVEL
    value: info`,
          caption: 'Values для собственного chart',
        },
      ],
    },
    {
      title: 'Helm vs Kustomize vs GitOps',
      content: `Три основных подхода к управлению K8s-манифестами. Часто используются вместе.

**Сравнение:**

| | Helm | Kustomize | Raw YAML + GitOps |
|---|------|-----------|-------------------|
| Шаблонизация | Go templates | Overlays + patches | Копипаста / генераторы |
| Пакетирование | Chart (.tgz) | Kustomization | Директория YAML |
| Версионирование | Chart version | Git tags | Git tags |
| Переиспользование | Dependencies | Bases + overlays | Copy |
| Сложность | Средняя | Низкая | Высокая (без инструментов) |
| Ecosystem | Огромный (charts) | Встроен в kubectl | — |
| Learning curve | Средний | Низкий | Низкий |

**Когда что использовать:**

- **Helm** — установка third-party apps (monitoring, ingress), packaging своих apps
- **Kustomize** — кастомизация base manifests per environment (встроен в kubectl)
- **Helm + Kustomize** — Helm chart как base, Kustomize patches поверх
- **GitOps (ArgoCD/Flux)** — continuous deployment из Git, поддерживает и Helm, и Kustomize

**Рекомендация для pet-проекта:**

1. Начни с plain YAML + kubectl apply
2. Добавь Kustomize overlays для dev/prod
3. Оберни в Helm chart для packaging и distribution
4. Подключи ArgoCD для GitOps`,
    },
    {
      title: 'Troubleshooting Helm',
      content: `Типичные проблемы при работе с Helm и способы их решения.

**Частые ошибки:**

| Ошибка | Причина | Решение |
|--------|---------|---------|
| \`Error: release already exists\` | Release с таким именем есть | \`helm upgrade --install\` или другое имя |
| \`Error: timed out waiting\` | Pod'ы не стали Ready | \`kubectl get pods\`, проверить logs |
| \`Error: rendered manifests contain a resource that already exists\` | Конфликт имён | \`helm uninstall\` или adopt resources |
| \`Error: validation failed\` | Невалидный template output | \`helm template\` + проверить YAML |
| \`INSTALLATION FAILED: cannot re-use a name\` | Release в статусе pending | \`helm rollback\` или удалить secret |
| Template syntax error | Ошибка в Go template | \`helm template --debug\` |

**Диагностика:**

\`\`\`bash
helm status my-app -n production
helm get manifest my-app -n production
helm get values my-app -n production --all
helm template my-app ./my-app --debug
\`\`\`

**Застрявший release (pending-install/pending-upgrade):**

\`\`\`bash
# Найти secret с release data
kubectl get secrets -n production -l owner=helm
# Удалить pending release secret
kubectl delete secret sh.helm.release.v1.my-app.v3 -n production
\`\`\``,
      codes: [
        {
          language: 'bash',
          code: `# Полная диагностика release
helm status my-app -n production
helm get all my-app -n production

# Debug template rendering
helm template my-app ./my-app -f values-prod.yaml --debug 2>&1 | less

# Проверить, что Helm видит
helm list -n production
helm history my-app -n production

# Принудительный upgrade
helm upgrade my-app ./my-app \\
  -f values-prod.yaml \\
  -n production \\
  --force \\
  --atomic \\
  --timeout 10m

# Очистка застрявшего release
helm uninstall my-app -n production
kubectl delete secrets -n production -l owner=helm,name=my-app`,
          caption: 'Диагностика и восстановление Helm release',
        },
      ],
    },
  ],
  practice: [
    'Установи Helm 3 и добавь репозитории bitnami и prometheus-community',
    'Установи nginx через bitnami/nginx chart, измени replicaCount через --set, проверь через helm get values',
    'Создай собственный chart через helm create, адаптируй templates под своё приложение',
    'Настрой values-dev.yaml и values-prod.yaml с существенными различиями, сравни output через helm template',
    'Добавь chart dependency (postgresql от bitnami), настрой values для sub-chart',
    'Напиши pre-install hook Job для миграции БД и test hook для проверки health endpoint',
    'Интегрируй helm lint и helm template в CI pipeline (GitHub Actions)',
    'Выполни helm upgrade --atomic, затем rollback и проверь helm history',
    'Установи kube-prometheus-stack chart и открой Grafana dashboard',
    'Проведи troubleshooting: сломай values, получи failed release и восстанови через rollback',
  ],
  resources: [
    { title: 'Helm Documentation', url: 'https://helm.sh/docs/' },
    { title: 'Artifact Hub — поиск charts', url: 'https://artifacthub.io' },
  ],
}
