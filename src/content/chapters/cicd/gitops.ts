import type { Chapter } from '../../../types'

export const gitopsChapter: Chapter = {
  id: 'gitops',
  slug: 'gitops',
  title: 'GitOps и ArgoCD',
  moduleId: 'cicd',
  order: 3,
  duration: '4–5 часов',
  level: 'intermediate',
  description:
    'Принципы GitOps, установка и использование ArgoCD, sync policies, App of Apps, multi-environment',
  sections: [
    {
      title: 'Что такое GitOps',
      content: `**GitOps** — операционная модель, где Git-репозиторий является **единственным источником правды** для инфраструктуры и приложений.

**Определение (Weaveworks, 2017):**
> GitOps — это способ реализации Continuous Deployment для cloud-native приложений. GitOps использует Git как единственный источник правды для декларативной инфраструктуры и приложений.

**Ключевая идея:** если состояние кластера отличается от того, что описано в Git — система автоматически (или по запросу) приводит кластер к желаемому состоянию.

**GitOps vs традиционный CI/CD:**
| | Традиционный CD | GitOps |
|---|---|---|
| Триггер деплоя | CI pipeline (push model) | Изменение в Git (pull model) |
| Кто деплоит | CI-сервер (kubectl/helm) | Агент в кластере (ArgoCD) |
| Источник правды | CI-конфиг + K8s | Git-репозиторий |
| Rollback | Перезапуск pipeline | Git revert |
| Аудит | Логи CI | Git history |`,
    },
    {
      title: 'Четыре принципа GitOps',
      content: `**1. Декларативность**
Вся система описана декларативно (YAML-манифесты K8s, Helm charts, Kustomize). Желаемое состояние, а не императивные команды.

**2. Версионирование в Git**
Конфигурация хранится в Git с полной историей изменений. Каждое изменение — коммит с автором, датой, описанием. Code review через Pull Request.

**3. Автоматическое применение**
Утверждённые изменения в Git автоматически применяются к целевой системе. ArgoCD отслеживает Git и синхронизирует кластер.

**4. Непрерывная сверка (reconciliation)**
Агент в кластере постоянно сравнивает фактическое состояние с желаемым. Любое расхождение (drift) обнаруживается и может быть автоматически исправлено.

\`\`\`
Developer → git push → Git Repo → ArgoCD detects → Sync to K8s
                                         ↑
                              Continuous reconciliation
\`\`\``,
    },
    {
      title: 'Push vs Pull модель деплоя',
      content: `**Push-модель (традиционный CI/CD):**
\`\`\`
CI Server ──kubectl apply──→ Kubernetes Cluster
\`\`\`
- CI-сервер имеет credentials кластера (kubeconfig)
- CI «толкает» изменения в кластер
- Риск: компрометация CI = доступ к кластеру
- Множество CI-серверов → множество точек доступа

**Pull-модель (GitOps):**
\`\`\`
Git Repo ←──watch── ArgoCD Agent (inside cluster) ──apply──→ K8s
\`\`\`
- Агент **внутри** кластера сам забирает изменения из Git
- CI только обновляет Git (image tag, манифесты)
- Credentials кластера не покидают кластер
- Один агент, один источник правды

**Преимущества Pull:**
- Безопасность — нет внешнего доступа к API кластера
- Надёжность — агент работает даже если CI недоступен
- Аудит — все изменения через Git
- Rollback — git revert = откат деплоя`,
    },
    {
      title: 'ArgoCD: архитектура',
      content: `**ArgoCD** — декларативный GitOps continuous delivery tool для Kubernetes.

**Компоненты:**
| Компонент | Назначение |
|-----------|-----------|
| **API Server** | REST/gRPC API, Web UI, CLI |
| **Repository Server** | Клонирование Git, генерация манифестов (Helm, Kustomize) |
| **Application Controller** | Сравнение desired vs live state, sync |
| **Redis** | Кэширование |
| **Dex** (optional) | SSO аутентификация |

**Application CRD** — основной ресурс ArgoCD:
\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
spec:
  source:
    repoURL: https://github.com/org/k8s-manifests
    path: apps/my-app
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
\`\`\`

ArgoCD устанавливается **внутри** Kubernetes-кластера.`,
    },
    {
      title: 'Установка ArgoCD',
      content: `**Установка в Kubernetes (production):**`,
      code: {
        language: 'bash',
        code: `# Создать namespace
kubectl create namespace argocd

# Установить ArgoCD
kubectl apply -n argocd -f \\
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Дождаться готовности
kubectl wait --for=condition=available deployment --all \\
  -n argocd --timeout=300s

# Получить начальный пароль admin
kubectl -n argocd get secret argocd-initial-admin-secret \\
  -o jsonpath="{.data.password}" | base64 -d

# Port-forward для доступа к UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Установить CLI
brew install argocd  # macOS
# или
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd && sudo mv argocd /usr/local/bin/

# Логин
argocd login localhost:8080 --username admin --insecure`,
        caption: 'Установка ArgoCD и CLI',
      },
    },
    {
      title: 'Создание Application',
      content: `**Через CLI:**
\`\`\`bash
argocd app create my-app \\
  --repo https://github.com/org/k8s-manifests.git \\
  --path apps/my-app/overlays/production \\
  --dest-server https://kubernetes.default.svc \\
  --dest-namespace production \\
  --sync-policy automated
\`\`\`

**Через YAML (рекомендуется — Application в Git):**
Application CRD хранится в Git → ArgoCD управляет сам собой (bootstrap).

**Структура Git-репозитория для GitOps:**
\`\`\`
k8s-manifests/
├── apps/
│   ├── my-app/
│   │   ├── base/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── kustomization.yaml
│   │   └── overlays/
│   │       ├── staging/
│   │       └── production/
│   └── another-app/
├── infrastructure/
│   ├── ingress-nginx/
│   └── cert-manager/
└── argocd/
    ├── applications/
    └── projects/
\`\`\``,
      code: {
        language: 'yaml',
        code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/k8s-manifests.git
    targetRevision: main
    path: apps/my-app/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m`,
        caption: 'Application CRD с automated sync',
      },
    },
    {
      title: 'Sync Policies',
      content: `**Sync Policy** определяет, как ArgoCD применяет изменения.

**Manual sync (по умолчанию):**
- ArgoCD обнаруживает drift, но ждёт ручного подтверждения
- Подходит для production с review

**Automated sync:**
\`\`\`yaml
syncPolicy:
  automated:
    prune: true      # удалять ресурсы, убранные из Git
    selfHeal: true   # откатывать ручные изменения в кластере
    allowEmpty: false
\`\`\`

**Опции sync:**
| Опция | Описание |
|-------|----------|
| \`CreateNamespace=true\` | Создать namespace, если не существует |
| \`PruneLast=true\` | Удалять ресурсы после создания новых |
| \`ApplyOutOfSyncOnly=true\` | Применять только изменённые ресурсы |
| \`ServerSideApply=true\` | Server-side apply (K8s 1.22+) |

**Sync phases:**
1. **Pre-sync** — hooks перед синхронизацией (миграции БД)
2. **Sync** — применение манифестов
3. **Post-sync** — hooks после (smoke tests)
4. **Sync fail** — rollback hooks

**Retry policy** — автоматические повторы при ошибках sync.`,
    },
    {
      title: 'Health Checks и Sync Status',
      content: `ArgoCD отслеживает **три состояния** каждого Application:

**Sync Status:**
| Статус | Значение |
|--------|----------|
| Synced | Кластер соответствует Git |
| OutOfSync | Есть расхождения |

**Health Status:**
| Статус | Значение |
|--------|----------|
| Healthy | Все ресурсы работают |
| Progressing | Идёт деплой (rolling update) |
| Degraded | Проблемы (pod crash, failed probe) |
| Missing | Ресурс не найден |
| Suspended | Приостановлен (CronJob) |

**App Status в UI:**
- 🟢 Synced + Healthy — всё хорошо
- 🟡 OutOfSync — нужен sync (или auto-sync сработает)
- 🔴 Degraded — проблема, нужно вмешательство

**CLI:**
\`\`\`bash
argocd app get my-app          # детали
argocd app diff my-app         # diff Git vs cluster
argocd app sync my-app         # принудительный sync
argocd app history my-app      # история деплоев
argocd app rollback my-app     # откат
\`\`\``,
    },
    {
      title: 'App of Apps pattern',
      content: `**App of Apps** — паттерн, где один ArgoCD Application управляет другими Applications.

**Зачем:**
- Bootstrap всего кластера из одного Git-репозитория
- Декларативное управление всеми приложениями
- Добавление нового app = новый YAML в Git

**Структура:**
\`\`\`
argocd/
├── bootstrap/
│   └── root-app.yaml      # App of Apps root
├── applications/
│   ├── my-app.yaml         # Application CRD
│   ├── monitoring.yaml
│   └── ingress.yaml
└── projects/
    └── production.yaml
\`\`\`

**Root Application:**
\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/org/k8s-manifests.git
    path: argocd/applications
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
\`\`\`

ArgoCD читает все YAML в \`argocd/applications/\` и создаёт Applications. Каждый Application деплоит своё приложение.`,
      code: {
        language: 'yaml',
        code: `# argocd/applications/my-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: production
  source:
    repoURL: https://github.com/org/k8s-manifests.git
    path: apps/my-app/overlays/production
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true`,
        caption: 'Application в App of Apps',
      },
    },
    {
      title: 'Multi-environment с Kustomize',
      content: `**Kustomize** — встроенный в ArgoCD инструмент для управления конфигурацией по окружениям.

**Структура:**
\`\`\`
apps/my-app/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml    # replicas: 1
    │   └── patch-replicas.yaml
    ├── staging/
    │   └── kustomization.yaml    # replicas: 2
    └── production/
        ├── kustomization.yaml    # replicas: 5
        └── patch-resources.yaml
\`\`\`

**base/kustomization.yaml:**
\`\`\`yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
\`\`\`

**overlays/production/kustomization.yaml:**
\`\`\`yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
replicas:
  - name: my-app
    count: 5
patches:
  - path: patch-resources.yaml
images:
  - name: my-app
    newTag: v1.2.3
\`\`\`

**CI/CD + GitOps flow:**
1. CI собирает Docker-образ → push в registry
2. CI обновляет \`newTag\` в overlay → commit в Git
3. ArgoCD обнаруживает изменение → sync → deploy`,
    },
    {
      title: 'Helm с ArgoCD',
      content: `ArgoCD нативно поддерживает **Helm charts** как source.

**Из Helm-репозитория:**
\`\`\`yaml
source:
  repoURL: https://charts.bitnami.com/bitnami
  chart: nginx
  targetRevision: 15.0.0
  helm:
    values: |
      replicaCount: 3
      service:
        type: ClusterIP
\`\`\`

**Из Git (Helm chart в репозитории):**
\`\`\`yaml
source:
  repoURL: https://github.com/org/charts.git
  path: charts/my-app
  helm:
    valueFiles:
      - values-production.yaml
    parameters:
      - name: image.tag
        value: v1.2.3
\`\`\`

**Helm vs Kustomize в GitOps:**
| | Helm | Kustomize |
|---|------|-----------|
| Шаблонизация | Go templates | Patches, overlays |
| Параметризация | values.yaml | overlays |
| Экосистема | Charts hub | Встроен в kubectl |
| Сложность | Выше | Ниже |

Для GitOps часто используют **Kustomize** (проще, нативный) или **Helm** (богаче экосистема).`,
    },
    {
      title: 'ArgoCD Projects и RBAC',
      content: `**AppProject** — логическая группировка Applications с политиками доступа.

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: production
  namespace: argocd
spec:
  description: Production applications
  sourceRepos:
    - https://github.com/org/*
  destinations:
    - namespace: production
      server: https://kubernetes.default.svc
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
  namespaceResourceWhitelist:
    - group: 'apps'
      kind: Deployment
\`\`\`

**RBAC в ArgoCD:**
- Встроенная RBAC policy (CSV в ConfigMap)
- SSO через Dex (GitHub, GitLab, LDAP, SAML)
- Роли: admin, developer, readonly

\`\`\`csv
p, role:developer, applications, sync, production/*, allow
p, role:developer, applications, get, */*, allow
g, my-team, role:developer
\`\`\`

**Принцип:** каждая команда — свой AppProject с ограниченным доступом к namespace и репозиториям.`,
    },
    {
      title: 'Интеграция CI/CD с GitOps',
      content: `**Полный flow: CI (GitHub Actions) + GitOps (ArgoCD):**

\`\`\`
Developer push → GitHub Actions:
  1. Lint + Test
  2. Build Docker image
  3. Push to registry
  4. Update image tag in k8s-manifests repo
     (yq or kustomize edit set image)
  → ArgoCD detects change → Auto-sync → Deploy
\`\`\`

**CI НЕ делает kubectl/helm** — только обновляет Git.

**Обновление image tag в CI:**`,
      code: {
        language: 'yaml',
        code: `# GitHub Actions step: update image tag
- name: Update image tag in GitOps repo
  run: |
    git clone https://github.com/org/k8s-manifests.git
    cd k8s-manifests
    cd apps/my-app/overlays/production
    kustomize edit set image my-app=ghcr.io/org/my-app:\${{ github.sha }}
    git config user.name "github-actions"
    git config user.email "actions@github.com"
    git add .
    git commit -m "deploy: my-app \${{ github.sha }}"
    git push`,
        caption: 'CI обновляет tag → ArgoCD деплоит',
      },
    },
    {
      title: 'Rollback и disaster recovery',
      content: `**Rollback в GitOps = git revert:**

\`\`\`bash
# Посмотреть историю
argocd app history my-app

# Откат к предыдущей ревизии
argocd app rollback my-app 2

# Или через Git
git revert HEAD
git push
# → ArgoCD auto-sync → откат в кластере
\`\`\`

**Преимущества GitOps rollback:**
- Мгновенный — ArgoCD sync за секунды
- Аудируемый — git log показывает кто и когда
- Предсказуемый — точно известное предыдущее состояние
- Не нужен CI pipeline для отката

**Disaster recovery:**
- Кластер уничтожен → создать новый → установить ArgoCD → указать на Git → всё восстановлено
- Git = backup всей конфигурации

**Self-heal:**
\`\`\`yaml
syncPolicy:
  automated:
    selfHeal: true
\`\`\`
Кто-то вручную изменил deployment в кластере → ArgoCD автоматически вернёт к Git-состоянию.`,
    },
    {
      title: 'Best practices GitOps',
      content: `**1. Один репозиторий или несколько?**
- **Monorepo** — все манифесты в одном repo (проще для малых команд)
- **Multirepo** — app code + infra repo (разделение ответственности)

**2. Trunk-based для манифестов**
- main = production, overlays для окружений
- PR review для изменений инфраструктуры

**3. Не храни секреты в Git**
- Sealed Secrets, External Secrets Operator, SOPS
- ArgoCD поддерживает encrypted values

**4. App of Apps для bootstrap**
- Один root Application управляет всем

**5. Мониторинг ArgoCD**
- Prometheus metrics (встроены)
- Алерты на Degraded / OutOfSync
- Notification services (Slack, email)

**6. Progressive delivery**
- Argo Rollouts для canary/blue-green
- Интеграция с Prometheus для анализа canary

**7. Policy enforcement**
- OPA/Gatekeeper для валидации манифестов
- ArgoCD Pre-sync hooks для проверок`,
    },
  ],
  practice: [
    'Установи ArgoCD в minikube/kind и получи доступ к Web UI',
    'Создай Git-репозиторий k8s-manifests со структурой base/overlays (dev, staging, production)',
    'Создай ArgoCD Application для деплоя nginx с automated sync и selfHeal',
    'Настрой App of Apps: root Application управляет несколькими приложениями',
    'Измени deployment вручную в кластере (kubectl edit) и наблюдай self-heal ArgoCD',
    'Интегрируй с GitHub Actions: CI обновляет image tag → ArgoCD деплоит',
    'Выполни rollback через argocd app rollback и через git revert — сравни',
    'Настрой Kustomize overlays с разным количеством replicas для dev и production',
  ],
  resources: [
    { title: 'ArgoCD Docs', url: 'https://argo-cd.readthedocs.io' },
    { title: 'GitOps Principles', url: 'https://opengitops.dev' },
  ],
}
