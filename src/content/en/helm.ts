import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: "Helm",
  duration: "5–6 hours",
  description: "A complete guide to Helm: charts, values, templates, releases, repositories and production patterns",
  sections: [
    {
      title: "What is Helm and why is it needed?",
      content: "**Helm** is a package manager for Kubernetes. \"apt/yum/homebrew for K8s\". Makes it easy to install, update, and uninstall complex applications.\n\n**Problem without Helm:**\n\n```\nk8s/\n├── namespace.yaml\n├── configmap.yaml\n├── secret.yaml\n├── deployment.yaml\n├── service.yaml\n├── ingress.yaml\n├── hpa.yaml\n├── pdb.yaml\n├── networkpolicy.yaml\n└── serviceaccount.yaml\n```\n\n10+ YAML files × 3 environments (dev/staging/prod) = 30+ files with duplication.\n\n**With Helm:**\n\n```\nmy-app/\n├── Chart.yaml\n├── values.yaml\n├── values-dev.yaml\n├── values-staging.yaml\n├── values-prod.yaml\n└── templates/\n    ├── deployment.yaml\n    ├── service.yaml\n    └── ...\n```\n\nOne chart + values ​​per environment. Templating, versioning, rollback.\n\n**Key Concepts:**\n\n| Concept | Description |\n|-----------|----------|\n| **Chart** | K8s resource package (templates + values ​​+ metadata) |\n| **Release** | Installed chart instance in the cluster |\n| **Repository** | HTTP server with charts (like apt repo) |\n| **Values** | chart configuration options |\n| **Templates** | Go templates → K8s YAML |",
    },
    {
      title: "Helm installation and basic commands",
      content: "**Helm 3** (current version) - without Tiller (server-side component from Helm 2). Safer and easier.\n\n**Installation:**\n\n| Platform | Team |\n|-----------|---------|\n| macOS | `brew install helm` |\n| Linux | `curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash` |\n| Windows | `choco install kubernetes-helm` |\n\n**Basic commands:**\n\n| Team | Description |\n|---------|----------|\n| `helm repo add` | Add chart repository |\n| `helm search repo` | Search for charts |\n| `helm install` | Install chart (create release) |\n| `helm upgrade` | Update release |\n| `helm rollback` | Rollback release |\n| `helm uninstall` | Remove release |\n| `helm list` | List of releases |\n| `helm status` | release status |\n| `helm get values` | Current values ​​release |\n| `helm template` | Render without installation (for CI/debug) |",
      codes: [
        {
          language: "bash",
          code: "# Установка и проверка\nhelm version\n\n# Работа с репозиториями\nhelm repo add bitnami https://charts.bitnami.com/bitnami\nhelm repo add prometheus-community https://prometheus-community.github.io/helm-charts\nhelm repo update\nhelm search repo nginx\nhelm search repo nginx --versions\n\n# Установка chart\nhelm install my-nginx bitnami/nginx \\\n  --namespace web --create-namespace \\\n  --set replicaCount=3 \\\n  --set service.type=ClusterIP\n\n# Управление release\nhelm list -A\nhelm status my-nginx -n web\nhelm get values my-nginx -n web\nhelm upgrade my-nginx bitnami/nginx --set replicaCount=5 -n web\nhelm rollback my-nginx 1 -n web\nhelm uninstall my-nginx -n web",
          caption: "Basic Helm Commands",
        },
      ],
    },
    {
      title: "Helm Chart Structure",
      content: "Standard chart structure created via `helm create`:\n\n```\nmy-app/\n├── Chart.yaml          # Метаданные chart (имя, версия, dependencies)\n├── Chart.lock          # Lock-файл dependencies (как package-lock.json)\n├── values.yaml         # Default values\n├── values-dev.yaml     # Override для dev\n├── values-prod.yaml    # Override для prod\n├── templates/          # Go templates → K8s YAML\n│   ├── _helpers.tpl    # Вспомогательные template functions\n│   ├── deployment.yaml\n│   ├── service.yaml\n│   ├── ingress.yaml\n│   ├── hpa.yaml\n│   ├── serviceaccount.yaml\n│   ├── configmap.yaml\n│   ├── secret.yaml\n│   ├── NOTES.txt       # Post-install инструкции\n│   └── tests/\n│       └── test-connection.yaml\n├── charts/             # Зависимые sub-charts\n└── .helmignore         # Исключения при packaging\n```\n\n**Chart.yaml:**\n\n```\n\nyaml\napiVersion: v2\nname: my-app\ndescription: My application Helm chart\ntype: application\nversion: 1.2.0        # версия chart\nappVersion: \"2.1.0\"   # версия приложения\n```\n\n**Versioning:** chart version (SemVer) ≠ app version. Chart version changes when templates/values ​​change, app version changes when Docker image is updated.",
      code: {
        language: "yaml",
        code: "# Chart.yaml\napiVersion: v2\nname: my-app\ndescription: A Helm chart for my application\ntype: application\nversion: 0.1.0\nappVersion: \"1.0.0\"\n\ndependencies:\n  - name: postgresql\n    version: \"15.x.x\"\n    repository: https://charts.bitnami.com/bitnami\n    condition: postgresql.enabled\n  - name: redis\n    version: \"18.x.x\"\n    repository: https://charts.bitnami.com/bitnami\n    condition: redis.enabled\n\nmaintainers:\n  - name: DevOps Team\n    email: devops@example.com",
        caption: "Chart.yaml with dependencies",
      },
    },
    {
      title: "Values ​​- chart configuration",
      content: "**values.yaml** - file with default chart parameters. Overridden during install/upgrade.\n\n**Methods of transmitting values (by priority):**\n\n1. `values.yaml` in chart (defaults)\n2. Parent chart's values (for sub-charts)\n3. `-f values-prod.yaml` (files, last one wins)\n4. `--set key=value` (CLI, highest priority)\n\n**Structure of values.yaml:**\n\n```\n\nyaml\nreplicaCount: 3\nimage:\n  repository: ghcr.io/myorg/myapp\n  tag: \"1.0.0\"\n  pullPolicy: IfNotPresent\nservice:\n  type: ClusterIP\n  port: 80\ningress:\n  enabled: true\n  host: api.example.com\nresources:\n  requests:\n    cpu: 100m\n    memory: 128Mi\n```\n\n**Sub-chart values:** are passed through a key named sub-chart:\n\n```\n\nyaml\npostgresql:\n  enabled: true\n  auth:\n    password: secret\n```\n\n**Global values:** are available to all sub-charts via `.Values.global`.",
      codes: [
        {
          language: "yaml",
          code: "# values.yaml — defaults\nreplicaCount: 2\n\nimage:\n  repository: ghcr.io/myorg/myapp\n  pullPolicy: IfNotPresent\n  tag: \"\"\n\nimagePullSecrets: []\nnameOverride: \"\"\nfullnameOverride: \"\"\n\nserviceAccount:\n  create: true\n  annotations: {}\n  name: \"\"\n\nservice:\n  type: ClusterIP\n  port: 80\n\ningress:\n  enabled: false\n  className: nginx\n  hosts:\n    - host: chart-example.local\n      paths:\n        - path: /\n          pathType: Prefix\n\nresources:\n  limits:\n    cpu: 500m\n    memory: 512Mi\n  requests:\n    cpu: 100m\n    memory: 128Mi\n\nautoscaling:\n  enabled: false\n  minReplicas: 2\n  maxReplicas: 10\n  targetCPUUtilizationPercentage: 80\n\nnodeSelector: {}\ntolerations: []\naffinity: {}",
          caption: "Typical values.yaml",
        },
        {
          language: "yaml",
          code: "# values-prod.yaml — production overrides\nreplicaCount: 5\n\nimage:\n  tag: \"2.1.0\"\n\ningress:\n  enabled: true\n  hosts:\n    - host: api.example.com\n      paths:\n        - path: /\n          pathType: Prefix\n  tls:\n    - secretName: api-tls\n      hosts:\n        - api.example.com\n\nresources:\n  limits:\n    cpu: \"2\"\n    memory: 2Gi\n  requests:\n    cpu: 500m\n    memory: 512Mi\n\nautoscaling:\n  enabled: true\n  minReplicas: 3\n  maxReplicas: 20",
          caption: "values-prod.yaml — production overrides",
        },
      ],
    },
    {
      title: "Templates — Go templating in Helm",
      content: "The files in `templates/` are Go templates that Helm renders in K8s YAML with values ​​substitution.\n\n**Basic syntax:**\n\n| Syntax | Description | Example |\n|-----------|----------|--------|\n| `{{ .Values.key }}` | Value from values ​​| `{{ .Values.replicaCount }}` |\n| `{{ .Release.Name }}` | Name release | `my-app` |\n| `{{ .Chart.Name }}` | Name chart | `my-app` |\n| `{{ .Chart.Version }}` | chart version | `1.0.0` |\n| `{{- if .Values.ingress.enabled }}` | Condition | Enable Ingress |\n| `{{- range .Values.env }}` | Cycle | List of env vars |\n| `{{ include \"name\" . }}` | Call helper | From _helpers.tpl |\n| `{{ .Values.image.tag \\| default .Chart.AppVersion }}` | Default value | Fallback |\n\n**Important Features:**\n\n- `default` - default value\n- `required` - required value (error if empty)\n- `toYaml` / `fromYaml` - conversion\n- ` nindent` — indentation for nested YAML\n- `quote` — wrap in quotes\n- `b64enc` / `b64dec` - base64\n\n**_helpers.tpl** - reused template functions (names, labels).",
      codes: [
        {
          language: "yaml",
          code: "# templates/_helpers.tpl\n{{- define \"my-app.fullname\" -}}\n{{- if .Values.fullnameOverride }}\n{{- .Values.fullnameOverride | trunc 63 | trimSuffix \"-\" }}\n{{- else }}\n{{- $name := default .Chart.Name .Values.nameOverride }}\n{{- printf \"%s-%s\" .Release.Name $name | trunc 63 | trimSuffix \"-\" }}\n{{- end }}\n{{- end }}\n\n{{- define \"my-app.labels\" -}}\nhelm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}\napp.kubernetes.io/name: {{ include \"my-app.name\" . }}\napp.kubernetes.io/instance: {{ .Release.Name }}\napp.kubernetes.io/version: {{ .Chart.AppVersion | quote }}\napp.kubernetes.io/managed-by: {{ .Release.Service }}\n{{- end }}",
          caption: "_helpers.tpl - reused functions",
        },
        {
          language: "yaml",
          code: "# templates/deployment.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{ include \"my-app.fullname\" . }}\n  labels:\n    {{- include \"my-app.labels\" . | nindent 4 }}\nspec:\n  {{- if not .Values.autoscaling.enabled }}\n  replicas: {{ .Values.replicaCount }}\n  {{- end }}\n  selector:\n    matchLabels:\n      {{- include \"my-app.selectorLabels\" . | nindent 6 }}\n  template:\n    metadata:\n      labels:\n        {{- include \"my-app.selectorLabels\" . | nindent 8 }}\n    spec:\n      containers:\n        - name: {{ .Chart.Name }}\n          image: \"{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}\"\n          ports:\n            - containerPort: {{ .Values.service.port }}\n          {{- with .Values.resources }}\n          resources:\n            {{- toYaml . | nindent 12 }}\n          {{- end }}",
          caption: "Deployment template with helpers",
        },
      ],
    },
    {
      title: "Conditional logic and loops in templates",
      content: "Helm templates support full logic for creating flexible charts.\n\n**Conditions (if/else/end):**\n\n```\n\nyaml\n{{- if .Values.ingress.enabled }}\n# ... ingress manifest\n{{- end }}\n```\n\n**Cycles (range):**\n\n```\n\nyaml\n{{- range .Values.env }}\n- name: {{ .name }}\n  value: {{ .value | quote }}\n{{- end }}\n```\n\n**With - change scope:**\n\n```\n\nyaml\n{{- with .Values.nodeSelector }}\nnodeSelector:\n  {{- toYaml . | nindent 8 }}\n{{- end }}\n```\n\n**Patterns:**\n\n| Pattern | Template |\n|---------|----------|\n| Optional block | `{{- if .Values.x }}...{{- end }}` |\n| List of items | `{{- range .Values.items }}...{{- end }}` |\n| Pass-through YAML | `{{- toYaml .Values.annotations \\| nindent 4 }}` |\n| Required value | `{{ required \"image.tag is required\" .Values.image.tag }}` |\n| Indentation | `nindent 4` (newline + indent) vs `indent 4` |",
      code: {
        language: "yaml",
        code: "# templates/ingress.yaml\n{{- if .Values.ingress.enabled -}}\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: {{ include \"my-app.fullname\" . }}\n  {{- with .Values.ingress.annotations }}\n  annotations:\n    {{- toYaml . | nindent 4 }}\n  {{- end }}\nspec:\n  {{- if .Values.ingress.className }}\n  ingressClassName: {{ .Values.ingress.className }}\n  {{- end }}\n  rules:\n    {{- range .Values.ingress.hosts }}\n    - host: {{ .host | quote }}\n      http:\n        paths:\n          {{- range .paths }}\n          - path: {{ .path }}\n            pathType: {{ .pathType }}\n            backend:\n              service:\n                name: {{ include \"my-app.fullname\" $ }}\n                port:\n                  number: {{ $.Values.service.port }}\n          {{- end }}\n    {{- end }}\n{{- end }}",
        caption: "Ingress template with conditions and loops",
      },
    },
    {
      title: "Chart Dependencies — sub-charts",
      content: "Helm chart may depend on other charts (sub-charts / dependencies). Similar to npm dependencies.\n\n**Ad in Chart.yaml:**\n\n```\n\nyaml\ndependencies:\n  - name: postgresql\n    version: \"15.x.x\"\n    repository: https://charts.bitnami.com/bitnami\n    condition: postgresql.enabled\n```\n\n**Manage dependencies:**\n\n```\n\nbash\nhelm dependency update ./my-app    # скачать в charts/\nhelm dependency list ./my-app      # список\nhelm dependency build ./my-app   # из Chart.lock\n```\n\n**Passing values ​​to sub-chart:**\n\n```\n\nyaml\n# values.yaml\npostgresql:\n  enabled: true\n  auth:\n    username: app\n    password: secret\n    database: myapp\n  primary:\n    persistence:\n      size: 20Gi\n```\n\n**Condition** - sub-chart is installed only if `postgresql.enabled: true`.\n\n**Tags** — dependencies grouping:\n\n```\n\nyaml\ndependencies:\n  - name: redis\n    tags:\n      - cache\n# helm install --set tags.cache=true\n```",
      codes: [
        {
          language: "bash",
          code: "# Добавить dependency\nhelm dependency update ./my-app\n\n# Структура после update\n# my-app/charts/\n#   postgresql-15.2.0.tgz\n#   redis-18.5.0.tgz\n\n# Установка с dependencies\nhelm install my-app ./my-app \\\n  -f values.yaml \\\n  --set postgresql.enabled=true \\\n  --set redis.enabled=true\n\n# Отключить sub-chart\nhelm upgrade my-app ./my-app --set postgresql.enabled=false",
          caption: "Managing chart dependencies",
        },
      ],
    },
    {
      title: "Helm Hooks — lifecycle events",
      content: "**Helm Hooks** - execution of K8s resources at certain stages of the release life cycle.\n\n**Types of hooks:**\n\n| Hook | When executed |\n|------|-------------------|\n| `pre-install` | Before creating resources |\n| `post-install` | After creating resources |\n| `pre-upgrade` | Before update |\n| `post-upgrade` | After update |\n| `pre-delete` | Before deleting |\n| `post-delete` | After removal |\n| `pre-rollback` | Before the rollback |\n| `post-rollback` | After rollback |\n| `test` | With `helm test` |\n\n**Annotations for hooks:**\n\n```\n\nyaml\nannotations:\n  \"helm.sh/hook\": pre-install,pre-upgrade\n  \"helm.sh/hook-weight\": \"-5\"\n  \"helm.sh/hook-delete-policy\": before-hook-creation,hook-succeeded\n```\n\n**Use cases:**\n\n- `pre-install` — database migration before deployment\n- `post-install` — smoke test, sending notification\n- `pre-delete` — backup data before deletion\n- `test` — integration test after install",
      code: {
        language: "yaml",
        code: "# templates/job-migrate.yaml\napiVersion: batch/v1\nkind: Job\nmetadata:\n  name: {{ include \"my-app.fullname\" . }}-migrate\n  annotations:\n    \"helm.sh/hook\": pre-install,pre-upgrade\n    \"helm.sh/hook-weight\": \"-5\"\n    \"helm.sh/hook-delete-policy\": before-hook-creation\nspec:\n  template:\n    spec:\n      restartPolicy: Never\n      containers:\n        - name: migrate\n          image: \"{{ .Values.image.repository }}:{{ .Values.image.tag }}\"\n          command: [\"npm\", \"run\", \"migrate\"]\n          env:\n            - name: DATABASE_URL\n              valueFrom:\n                secretKeyRef:\n                  name: {{ include \"my-app.fullname\" . }}-db\n                  key: url",
        caption: "Pre-install hook for database migration",
      },
    },
    {
      title: "Helm in CI/CD - template, lint, test",
      content: "Helm integrates into the CI/CD pipeline for validation and automatic deployment.\n\n**CI/CD stages with Helm:**\n\n1. **Lint** — `helm lint ./my-app` — chart check\n2. **Template** - `helm template` - render without installation\n3. **Test** - `helm test` - post-install tests\n4. **Package** - `helm package` - create .tgz\n5. **Push** - `helm push` - in the OCI registry\n6. **Install/Upgrade** - `helm upgrade --install` - deployment\n\n**`helm template`** - renders templates locally. Ideal for:\n- Check output in CI\n- Diff before deploy\n- YAML generation for GitOps\n\n**`helm lint`** - checks the chart for errors (missing values, invalid YAML).\n\n**`helm diff`** (plugin) - shows the diff between the current release and the new one.\n\n**OCI Registry:** Helm 3.8+ supports push/pull charts in OCI-compatible registries (GHCR, ECR, Harbor).",
      codes: [
        {
          language: "bash",
          code: "# Локальная валидация\nhelm lint ./my-app\nhelm lint ./my-app -f values-prod.yaml\n\n# Рендер без установки\nhelm template my-app ./my-app -f values-prod.yaml\nhelm template my-app ./my-app -f values-prod.yaml > rendered.yaml\n\n# Diff (плагин helm-diff)\nhelm plugin install https://github.com/databahn-ai/helm-diff\nhelm diff upgrade my-app ./my-app -f values-prod.yaml -n production\n\n# Package и push в OCI registry\nhelm package ./my-app\nhelm push my-app-1.0.0.tgz oci://ghcr.io/myorg/charts\n\n# Pull из OCI\nhelm pull oci://ghcr.io/myorg/charts/my-app --version 1.0.0",
          caption: "Helm in CI/CD pipeline",
        },
        {
          language: "yaml",
          code: "# .github/workflows/helm-deploy.yml\nname: Helm Deploy\non:\n  push:\n    branches: [main]\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: azure/setup-helm@v3\n\n      - name: Lint\n        run: helm lint ./charts/my-app -f values-prod.yaml\n\n      - name: Template validation\n        run: helm template my-app ./charts/my-app -f values-prod.yaml | kubeconform -summary\n\n      - name: Deploy\n        run: |\n          helm upgrade --install my-app ./charts/my-app \\\n            -f values-prod.yaml \\\n            -n production --create-namespace \\\n            --atomic --timeout 5m \\\n            --set image.tag=${{ github.sha }}",
          caption: "GitHub Actions with Helm deploy",
        },
      ],
    },
    {
      title: "Release management — upgrade, rollback, history",
      content: "Helm tracks the history of each release, allowing you to safely update and rollback.\n\n**helm upgrade --install** — idempotent: creates release if it does not exist, updates if it exists.\n\n**Useful flags:**\n\n| Flag | Description |\n|------|----------|\n| `--atomic` | Automatic rollback in case of failure |\n| `--wait` | Wait for all resources ready |\n| `--timeout 5m` | Wait timeout |\n| `--dry-run` | Simulation without application |\n| `--reset-values` | Reset to chart defaults |\n| `--reuse-values` | Save current values ​​|\n| `--force` | Recreate resources (recreate pods) |\n| `--cleanup-on-fail` | Remove new resources on failure |\n\n**History of releases:**\n\n```\n\nbash\nhelm history my-app -n production\n# REVISION  STATUS      CHART           DESCRIPTION\n# 1          superseded  my-app-1.0.0    Install complete\n# 2          superseded  my-app-1.1.0    Upgrade complete\n# 3          deployed    my-app-1.2.0    Upgrade complete\n```\n\n**Rollback:** `helm rollback my-app 1` - rollback to revision 1.",
      codes: [
        {
          language: "bash",
          code: "# Безопасный upgrade\nhelm upgrade --install my-app ./my-app \\\n  -f values-prod.yaml \\\n  -n production \\\n  --atomic \\\n  --wait \\\n  --timeout 10m \\\n  --set image.tag=2.0.0\n\n# История\nhelm history my-app -n production\n\n# Rollback\nhelm rollback my-app -n production          # к предыдущей\nhelm rollback my-app 2 -n production        # к revision 2\n\n# Получить manifest конкретной revision\nhelm get manifest my-app --revision 2 -n production\n\n# Удаление\nhelm uninstall my-app -n production\nhelm uninstall my-app -n production --keep-history  # сохранить историю",
          caption: "Release management",
        },
      ],
    },
    {
      title: "Popular Helm Charts and Repositories",
      content: "The Helm charts ecosystem is one of the main assets of the Kubernetes community.\n\n**Popular chart repositories:**\n\n| Repository | URL | Charts |\n|------------|-----|--------|\n| Bitnami | charts.bitnami.com | 200+ production-ready |\n| Prometheus Community | prometheus-community.github.io | Monitoring stack |\n| Ingress NGINX | kubernetes.github.io/ingress-nginx | Ingress controller |\n| Jetstack | charts.jetstack.io | Cert Manager |\n| Argo | argoproj.github.io/argo-helm | ArgoCD, Rollouts |\n| Grafana | grafana.github.io/helm-charts | Grafana, Loki, Tempo |\n| Elastic | helm.elastic.co | ELK stack |\n\n**Frequently used charts:**\n\n| Chart | Destination |\n|-------|-----------|\n| `bitnami/nginx` | Web server |\n| `bitnami/postgresql` | PostgreSQL |\n| `bitnami/redis` | Redis |\n| `prometheus-community/kube-prometheus-stack` | Full monitoring |\n| `ingress-nginx/ingress-nginx` | Ingress controller |\n| `jetstack/cert-manager` | TLS certificates |\n| `argo/argo-cd` | GitOps CD |\n| `grafana/grafana` | Dashboards |\n\n**Artifact Hub** (artifacthub.io) is a search engine for all public chart repositories.",
      codes: [
        {
          language: "bash",
          code: "# Установка monitoring stack\nhelm repo add prometheus-community \\\n  https://prometheus-community.github.io/helm-charts\nhelm repo update\n\nhelm install monitoring prometheus-community/kube-prometheus-stack \\\n  -n monitoring --create-namespace \\\n  -f monitoring-values.yaml\n\n# Cert Manager\nhelm repo add jetstack https://charts.jetstack.io\nhelm install cert-manager jetstack/cert-manager \\\n  -n cert-manager --create-namespace \\\n  --set installCRDs=true\n\n# ArgoCD\nhelm repo add argo https://argoproj.github.io/argo-helm\nhelm install argocd argo/argo-cd \\\n  -n argocd --create-namespace",
          caption: "Installing popular charts",
        },
      ],
    },
    {
      title: "Creating your own chart - complete example",
      content: "Let's create a production-ready chart for a web application from scratch.\n\n**Steps:**\n\n1. `helm create my-app` - scaffold\n2. Set up Chart.yaml (metadata, dependencies)\n3. Write values.yaml (defaults) and values-prod.yaml\n4. Adapt templates (deployment, service, ingress, hpa)\n5. Add _helpers.tpl\n6. `helm lint` → `helm template` → `helm install`\n\n**What to include in the production chart:**\n\n- Deployment with probes, resources, securityContext\n- Service (ClusterIP)\n- Ingress (optional, condition)\n- HPA (optional, condition)\n- ServiceAccount + RBAC\n- ConfigMap and Secret templates\n- PDB (PodDisruptionBudget)\n- NOTES.txt with post-install instructions\n- Test hook (curl health endpoint)",
      codes: [
        {
          language: "bash",
          code: "# Создание chart\nhelm create my-app\ncd my-app\n\n# Удалить лишние templates (оставить нужные)\nrm templates/hpa.yaml templates/ingress.yaml templates/serviceaccount.yaml\n# Переписать deployment.yaml, service.yaml под свой проект\n\n# Валидация\nhelm lint .\nhelm template my-app . -f values.yaml\nhelm template my-app . -f values-prod.yaml | kubectl apply --dry-run=client -f -\n\n# Установка\nhelm install my-app . -f values.yaml -n dev --create-namespace\nhelm test my-app -n dev",
          caption: "Creating a chart from scratch",
        },
        {
          language: "yaml",
          code: "# values.yaml для полного chart\nreplicaCount: 2\n\nimage:\n  repository: ghcr.io/myorg/myapp\n  tag: \"\"\n  pullPolicy: IfNotPresent\n\nservice:\n  type: ClusterIP\n  port: 80\n  targetPort: 3000\n\ningress:\n  enabled: false\n  className: nginx\n  annotations: {}\n  hosts:\n    - host: app.local\n      paths:\n        - path: /\n          pathType: Prefix\n\nresources:\n  requests:\n    cpu: 100m\n    memory: 128Mi\n  limits:\n    cpu: 500m\n    memory: 512Mi\n\nautoscaling:\n  enabled: false\n  minReplicas: 2\n  maxReplicas: 10\n  targetCPUUtilizationPercentage: 70\n\npdb:\n  enabled: true\n  minAvailable: 1\n\nenv:\n  - name: NODE_ENV\n    value: production\n  - name: LOG_LEVEL\n    value: info",
          caption: "Values ​​for your own chart",
        },
      ],
    },
    {
      title: "Helm vs Kustomize vs GitOps",
      content: "Three main approaches to managing K8s manifests. Often used together.\n\n**Comparison:**\n\n| | Helm | Customize | Raw YAML + GitOps |\n|---|------|-----------|-------------------|\n| Templating | Go templates | Overlays + patches | Copy-paste / generators |\n| Bagging | Chart (.tgz) | Customization | YAML directory |\n| Versioning | Chart version | Git tags | Git tags |\n| Reuse | Dependencies | Bases + overlays | Copy |\n| Difficulty | Average | Low | High (no tools) |\n| Ecosystem | Huge (charts) | Built into kubectl | — |\n| Learning curve | Medium | Low | Low |\n\n**When to use what:**\n\n- **Helm** — installation of third-party apps (monitoring, ingress), packaging of your apps\n- **Kustomize** - customization of base manifests per environment (built into kubectl)\n- **Helm + Kustomize** — Helm chart as base, Kustomize patches on top\n- **GitOps (ArgoCD/Flux)** - continuous deployment from Git, supports both Helm and Kustomize\n\n**Recommendation for a pet project:**\n\n1. Start with plain YAML + kubectl apply\n2. Add Kustomize overlays for dev/prod\n3. Wrap in Helm chart for packaging and distribution\n4. Connect ArgoCD for GitOps",
    },
    {
      title: "Troubleshooting Helm",
      content: "Typical problems when working with Helm and ways to solve them.\n\n**Common mistakes:**\n\n| Error | Reason | Solution |\n|--------|---------|---------|\n| `Error: release already exists` | There is a Release with this name | `helm upgrade --install` or other name |\n| `Error: timed out waiting` | Pods did not become Ready | `kubectl get pods`, check logs |\n| `Error: rendered manifests contain a resource that already exists` | Name conflict | `helm uninstall` or adopt resources |\n| `Error: validation failed` | Invalid template output | `helm template` + check YAML |\n| `INSTALLATION FAILED: cannot re-use a name` | Release in pending status | `helm rollback` or remove secret |\n| Template syntax error | Error in Go template | `helm template --debug` |\n\n**Diagnostics:**\n\n```\n\nbash\nhelm status my-app -n production\nhelm get manifest my-app -n production\nhelm get values my-app -n production --all\nhelm template my-app ./my-app --debug\n```\n\n**Stuck release (pending-install/pending-upgrade):**\n\n```\n\nbash\n# Найти secret с release data\nkubectl get secrets -n production -l owner=helm\n# Удалить pending release secret\nkubectl delete secret sh.helm.release.v1.my-app.v3 -n production\n```",
      codes: [
        {
          language: "bash",
          code: "# Полная диагностика release\nhelm status my-app -n production\nhelm get all my-app -n production\n\n# Debug template rendering\nhelm template my-app ./my-app -f values-prod.yaml --debug 2>&1 | less\n\n# Проверить, что Helm видит\nhelm list -n production\nhelm history my-app -n production\n\n# Принудительный upgrade\nhelm upgrade my-app ./my-app \\\n  -f values-prod.yaml \\\n  -n production \\\n  --force \\\n  --atomic \\\n  --timeout 10m\n\n# Очистка застрявшего release\nhelm uninstall my-app -n production\nkubectl delete secrets -n production -l owner=helm,name=my-app",
          caption: "Diagnostics and recovery Helm release",
        },
      ],
    },
  ],
  practice: [
    "Install Helm 3 and add the bitnami and prometheus-community repositories",
    "Install nginx via bitnami/nginx chart, change replicaCount via --set, check via helm get values",
    "Create your own using helm create, adapt templates to your application",
    "Setting up values-dev.yaml and values-prod.yaml with significant differences, compare output via helm template",
    "Add chart dependency (postgresql from bitnami), values ​​setting for sub-chart",
    "Write a pre-install hook Job to migrate the database and a test hook to check the health endpoint",
    "Integrate helm lint and helm template into the CI pipeline (GitHub Actions)",
    "Run helm upgrade --atomic, then rollback and check helm history",
    "Install kube-prometheus-stack chart and open Grafana dashboard",
    "Carry out troubleshooting: break values, get failed release and restore via rollback",
  ],
  resources: [
    { title: "Helm Documentation", url: "https://helm.sh/docs/" },
    { title: "Artifact Hub - search charts", url: "https://artifacthub.io" },
  ],
  quiz: [
    {
      question: "What is Helm chart?",
      options: [
        "Kubernetes manifest template package with values",
        "Binary container image",
        "Plugin for Terraform",
        "Service type in K8s",
      ],
      answer: "Kubernetes manifest template package with values",
    },
    {
      question: "Where are chart parameters usually overridden during installation?",
      answer: "In values.yaml or via --set / -f custom-values.yaml during helm install/upgrade.",
    },
    {
      question: "How is helm upgrade --install different from a separate install?",
      options: [
        "Idempotent: will install or update release",
        "Only removes release",
        "Works without kubeconfig",
        "Creates only ConfigMap",
      ],
      answer: "Idempotent: will install or update release",
    },
    {
      question: "What does Helm release store?",
      options: [
        "Installed chart instance with revision history",
        "Only Docker registry credentials",
        "Application logs",
        "AWS VPC Status",
      ],
      answer: "Installed chart instance with revision history",
    },
    {
      question: "Why use hooks (pre-install, post-upgrade)?",
      answer: "Execute Job or other resources before/after main manifests (migrations, tests).",
    },
    {
      question: "How to roll back a release to a previous revision?",
      options: [
        "helm rollback <release> <revision>",
        "kubectl undo deployment",
        "git revert HEAD",
        "terraform destroy",
      ],
      answer: "helm rollback <release> <revision>",
    },
    {
      question: "What is a Helm repository (chart repo)?",
      options: [
        "HTTP repository with a chart package index for helm repo add/install",
        "Git main branch",
        "Docker registry",
        "Kubernetes Namespace type",
      ],
      answer: "HTTP repository with a chart package index for helm repo add/install",
      explanation: "Lets you version and distribute charts as artifacts.",
    },
    {
      question: "What are helpers in _helpers.tpl used for in a chart?",
      options: [
        "Reusable named templates for labels/names",
        "Storing binary files",
        "Secrets in plain text",
        "Only for NOTES.txt",
      ],
      answer: "Reusable named templates for labels/names",
    },
    {
      question: "What does helm template do?",
      options: [
        "Renders manifests locally without installing to the cluster",
        "Removes a release",
        "Creates a new cluster",
        "Automatically pushes the chart to an OCI registry",
      ],
      answer: "Renders manifests locally without installing to the cluster",
      explanation: "Useful for debugging templates and CI validation before deploy.",
    },
    {
      question: "How do you pass multiple values files when installing a chart?",
      answer: "helm install -f values.yaml -f prod.yaml <release> <chart> (file order matters — last one overrides).",
    },
  ],
}

export default translation
