import type { Chapter } from '../../../types'

export const k8sBasicsChapter: Chapter = {
  id: 'kubernetes-basics',
  slug: 'kubernetes-basics',
  title: 'Kubernetes — основы',
  moduleId: 'orchestration',
  order: 0,
  duration: '10–12 часов',
  level: 'intermediate',
  description:
    'Фундамент Kubernetes: архитектура, kubectl, Pods, Deployments, Services, Ingress, ConfigMaps, Secrets и production-паттерны',
  sections: [
    {
      title: 'Зачем нужен Kubernetes',
      content: `**Kubernetes (K8s)** — open-source платформа оркестрации контейнеров. Автоматизирует деплой, масштабирование, сетевое взаимодействие и self-healing контейнеризированных приложений.

**Проблемы, которые решает K8s:**

| Проблема | Решение K8s |
|----------|-------------|
| Ручной деплой на серверы | Декларативные манифесты, GitOps |
| Downtime при обновлении | Rolling updates, zero-downtime deploy |
| Падение инстанса | Self-healing: автоматический перезапуск |
| Ручное масштабирование | HPA: автоскейлинг по CPU/RPS/custom metrics |
| Service discovery | Встроенный DNS, Services |
| Конфигурация | ConfigMaps, Secrets |
| Балансировка нагрузки | Service LoadBalancer, Ingress |

**Когда Kubernetes нужен:**

- Микросервисная архитектура (5+ сервисов)
- Требования к high availability (99.9%+)
- Auto-scaling под нагрузку
- Multi-cloud / hybrid cloud
- Команда с DevOps/SRE компетенциями

**Когда Kubernetes НЕ нужен:**

- MVP, pet-проект, один сервер → Docker Compose
- Команда < 3 человек без ops-опыта → PaaS (Railway, Fly.io, Heroku)
- Stateful monolith без планов масштабирования → VM + Docker
- Batch-задачи → AWS Batch, Cloud Run Jobs

> Kubernetes добавляет операционную сложность. Не используй K8s «потому что модно» — оцени реальные потребности.`,
    },
    {
      title: 'Архитектура кластера Kubernetes',
      content: `K8s-кластер состоит из **Control Plane** (управление) и **Worker Nodes** (рабочие нагрузки).

**Control Plane (Master):**

| Компонент | Роль |
|-----------|------|
| **kube-apiserver** | REST API — единая точка входа для всех операций |
| **etcd** | Распределённое key-value хранилище состояния кластера |
| **kube-scheduler** | Назначает Pod'ы на подходящие Node'ы |
| **kube-controller-manager** | Контроллеры: Deployment, ReplicaSet, Node, Service |
| **cloud-controller-manager** | Интеграция с облаком (LB, volumes, routes) |

**Worker Node:**

| Компонент | Роль |
|-----------|------|
| **kubelet** | Агент на ноде, управляет Pod'ами |
| **kube-proxy** | Сетевая маршрутизация (iptables/IPVS) для Services |
| **Container Runtime** | containerd, CRI-O — запуск контейнеров |

**Поток создания Pod:**

1. \`kubectl apply -f pod.yaml\` → API Server
2. Запись в etcd
3. Scheduler выбирает Node
4. kubelet на Node создаёт Pod через container runtime
5. kube-proxy настраивает сетевые правила

**Дополнительные компоненты production-кластера:**

- **CNI plugin** (Calico, Cilium, Flannel) — сеть Pod'ов
- **CSI driver** — persistent storage
- **Ingress Controller** (nginx, Traefik) — HTTP-маршрутизация
- **Cert Manager** — автоматические TLS-сертификаты
- **Metrics Server** — метрики для HPA
- **CoreDNS** — DNS внутри кластера`,
      codes: [
        {
          language: 'bash',
          code: `# Компоненты control plane (managed K8s — скрыты)
kubectl get componentstatuses    # deprecated, но информативно
kubectl get nodes -o wide
kubectl cluster-info

# Информация о ноде
kubectl describe node <node-name>
kubectl top nodes    # требует metrics-server`,
          caption: 'Проверка состояния кластера',
        },
      ],
    },
    {
      title: 'Установка Minikube',
      content: `**Minikube** — локальный однонодовый K8s-кластер для обучения и разработки. Запускает кластер в VM или Docker-контейнере.

**Требования:** 2+ CPU, 2GB+ RAM, Docker/VM driver.

**Поддерживаемые drivers:** docker (рекомендуется), hyperkit (macOS), virtualbox, kvm.

**Особенности Minikube:**

- Один Node (control plane + worker)
- Встроенные addons: dashboard, metrics-server, ingress
- \`minikube tunnel\` для LoadBalancer Services
- \`minikube service\` для доступа к NodePort
- Легко удалить и пересоздать`,
      codes: [
        {
          language: 'bash',
          code: `# Установка (macOS)
brew install minikube kubectl

# Запуск кластера
minikube start --cpus=4 --memory=8192 --driver=docker
minikube status

# Включить addons
minikube addons enable metrics-server
minikube addons enable ingress
minikube addons enable dashboard

# Использовать Docker daemon Minikube (собирать образы внутри кластера)
eval $(minikube docker-env)
docker build -t myapp:local .

# Доступ к сервисам
minikube service my-service --url
minikube tunnel    # для LoadBalancer (отдельный терминал)

# Dashboard
minikube dashboard

# Остановка и удаление
minikube stop
minikube delete`,
          caption: 'Minikube — установка и управление',
        },
      ],
    },
    {
      title: 'Установка kind (Kubernetes in Docker)',
      content: `**kind** (Kubernetes IN Docker) — запускает K8s-кластер как Docker-контейнеры. Быстрее Minikube, идеален для CI/CD.

**kind vs Minikube:**

| | kind | Minikube |
|---|------|----------|
| Скорость старта | ~30 сек | ~1-2 мин |
| Multi-node | Да (несколько Docker-контейнеров) | Нет (1 node) |
| LoadBalancer | Требует port-mapping | minikube tunnel |
| Dashboard | Нет встроенного | Есть addon |
| CI/CD | Идеален | Медленнее |
| Обучение | Хорош | Лучше (addons, tunnel) |

**kind особенности:**

- Каждая «нода» — Docker-контейнер
- Образы загружаются через \`kind load docker-image\`
- Конфигурация через YAML (multi-node, port mappings)
- Используется в Kubernetes CI (тестирование самого K8s)`,
      codes: [
        {
          language: 'bash',
          code: `# Установка
brew install kind

# Создать кластер
kind create cluster --name dev
kind create cluster --config kind-config.yaml

# kind-config.yaml — multi-node с port mapping
# kind: Cluster
# apiVersion: kind.x-k8s.io/v1alpha4
# nodes:
#   - role: control-plane
#     extraPortMappings:
#       - containerPort: 80
#         hostPort: 80
#   - role: worker
#   - role: worker

# Загрузить локальный образ в kind
docker build -t myapp:local .
kind load docker-image myapp:local --name dev

# Управление
kubectl cluster-info --context kind-dev
kind get clusters
kind delete cluster --name dev`,
          caption: 'kind — локальный multi-node кластер',
        },
      ],
    },
    {
      title: 'kubectl — основы работы',
      content: `**kubectl** — CLI для взаимодействия с Kubernetes API. Главный инструмент K8s-инженера.

**Структура команды:**

\`kubectl [command] [type] [name] [flags]\`

**Основные команды:**

| Command | Описание |
|---------|----------|
| \`create\` | Создать ресурс |
| \`apply\` | Создать или обновить (declarative, idempotent) |
| \`get\` | Получить список/детали |
| \`describe\` | Подробная информация + events |
| \`delete\` | Удалить ресурс |
| \`edit\` | Редактировать in-place |
| \`logs\` | Логи контейнера |
| \`exec\` | Выполнить команду в контейнере |
| \`port-forward\` | Проброс порта на localhost |
| \`scale\` | Масштабирование |
| \`rollout\` | Управление деплоем |

**Полезные флаги:**

- \`-n namespace\` — указать namespace
- \`-A\` / \`--all-namespaces\` — все namespaces
- \`-o wide\` — дополнительные колонки
- \`-o yaml\` / \`-o json\` — формат вывода
- \`--dry-run=client -o yaml\` — генерация YAML без применения
- \`-l app=myapp\` — фильтр по label
- \`--watch\` / \`-w\` — следить за изменениями

**kubectl apply vs create:** всегда предпочитай \`apply\` — идемпотентная операция, безопасна для CI/CD.`,
      codes: [
        {
          language: 'bash',
          code: `# Контекст и конфигурация
kubectl config get-contexts
kubectl config use-context minikube
kubectl config set-context --current --namespace=dev

# CRUD операции
kubectl apply -f deployment.yaml
kubectl apply -f k8s/                    # целая директория
kubectl get pods -n production -o wide
kubectl describe pod my-pod-abc123
kubectl delete -f deployment.yaml
kubectl delete pod my-pod --grace-period=0 --force

# Генерация YAML
kubectl create deployment nginx --image=nginx:alpine --dry-run=client -o yaml
kubectl run tmp --image=busybox --rm -it --restart=Never -- sh

# Отладка
kubectl logs my-pod -f --tail=100
kubectl logs my-pod -c sidecar          # конкретный контейнер
kubectl exec -it my-pod -- sh
kubectl port-forward svc/my-service 8080:80
kubectl top pods
kubectl get events --sort-by='.lastTimestamp'`,
          caption: 'Ежедневные команды kubectl',
        },
      ],
    },
    {
      title: 'Pods — минимальная единица',
      content: `**Pod** — наименьшая вычислительная единица в Kubernetes. Один или несколько контейнеров, разделяющих network namespace, IPC и volumes.

**Ключевые свойства Pod:**

- **Эфемерный** — Pod не «чинится», а пересоздаётся
- **Уникальный IP** в кластерной сети (per Pod, не per container)
- **Shared network** — контейнеры в Pod общаются через localhost
- **Shared volumes** — emptyDir, PVC монтируются во все контейнеры
- **QoS classes** — Guaranteed, Burstable, BestEffort

**Типы контейнеров в Pod:**

| Тип | Роль |
|-----|------|
| **Main container** | Основное приложение |
| **Init container** | Подготовка перед main (миграции, ожидание зависимостей) |
| **Sidecar** | Дополнительный процесс (logging, proxy, monitoring) |
| **Ephemeral container** | Отладка running Pod (kubectl debug) |

**Pod lifecycle phases:** Pending → Running → Succeeded/Failed

> **Важно:** не создавай Pod'ы напрямую в production. Используй Deployment, StatefulSet или DaemonSet — они управляют жизненным циклом Pod'ов.`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
    env: dev
spec:
  containers:
    - name: nginx
      image: nginx:1.25-alpine
      ports:
        - containerPort: 80
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 256Mi
      volumeMounts:
        - name: cache
          mountPath: /var/cache/nginx
  volumes:
    - name: cache
      emptyDir: {}`,
          caption: 'Базовый Pod манифест',
        },
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
spec:
  initContainers:
    - name: wait-for-db
      image: busybox:1.36
      command: ['sh', '-c', 'until nc -z db-service 5432; do sleep 2; done']
    - name: migrate
      image: myapp:1.0.0
      command: ['npm', 'run', 'migrate']
  containers:
    - name: app
      image: myapp:1.0.0
      ports:
        - containerPort: 3000`,
          caption: 'Pod с init containers',
        },
      ],
    },
    {
      title: 'Deployments — управление репликами',
      content: `**Deployment** — контроллер высокого уровня, управляющий ReplicaSet'ами и обеспечивающий декларативные обновления Pod'ов.

**Что Deployment даёт:**

- **Репликация** — N идентичных Pod'ов
- **Rolling update** — постепенное обновление без downtime
- **Rollback** — откат к предыдущей версии
- **Scaling** — изменение количества реплик
- **Self-healing** — пересоздание упавших Pod'ов

**Стратегии обновления:**

| Стратегия | Описание |
|-----------|----------|
| \`RollingUpdate\` (default) | Постепенная замена Pod'ов |
| \`Recreate\` | Убить все → создать новые (downtime) |

**Параметры RollingUpdate:**

- \`maxSurge\` — сколько лишних Pod'ов можно создать (default: 25%)
- \`maxUnavailable\` — сколько Pod'ов может быть недоступно (default: 25%)

**Связь объектов:** Deployment → ReplicaSet → Pod(s)`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: web-app
        version: "1.0.0"
    spec:
      containers:
        - name: app
          image: ghcr.io/myorg/web-app:1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5`,
          caption: 'Production Deployment',
        },
        {
          language: 'bash',
          code: `# Управление Deployment
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl scale deployment web-app --replicas=5
kubectl set image deployment/web-app app=ghcr.io/myorg/web-app:1.1.0
kubectl rollout status deployment/web-app
kubectl rollout history deployment/web-app
kubectl rollout undo deployment/web-app
kubectl rollout undo deployment/web-app --to-revision=2`,
          caption: 'Команды управления Deployment',
        },
      ],
    },
    {
      title: 'ReplicaSets и Labels/Selectors',
      content: `**ReplicaSet** — контроллер, поддерживающий стабильный набор Pod-реплик. Deployment управляет ReplicaSet'ами автоматически.

**Labels и Selectors** — фундаментальный механизм K8s для связывания ресурсов.

**Labels** — key/value метаданные на объектах:
\`\`\`yaml
labels:
  app: web-app
  env: production
  version: "1.0.0"
  team: backend
\`\`\`

**Selectors** — запросы по labels:
- \`matchLabels\` — точное совпадение
- \`matchExpressions\` — In, NotIn, Exists, DoesNotExist

**Рекомендуемые labels (стандарт):**

| Label | Пример | Назначение |
|-------|--------|------------|
| \`app.kubernetes.io/name\` | web-app | Имя приложения |
| \`app.kubernetes.io/version\` | 1.0.0 | Версия |
| \`app.kubernetes.io/component\` | api | Компонент |
| \`app.kubernetes.io/part-of\` | myplatform | Часть системы |
| \`app.kubernetes.io/managed-by\` | helm | Инструмент управления |

**Зачем labels:** Service находит Pod'ы по selector, Deployment — по matchLabels, NetworkPolicy — по matchLabels.`,
      codes: [
        {
          language: 'bash',
          code: `# Фильтрация по labels
kubectl get pods -l app=web-app
kubectl get pods -l 'env in (production,staging)'
kubectl get pods -l 'app=web-app,version!=1.0.0'
kubectl get all -l app=web-app

# Добавить/изменить label
kubectl label pod my-pod env=staging
kubectl label pod my-pod env=production --overwrite

# Удалить label
kubectl label pod my-pod env-`,
          caption: 'Работа с labels',
        },
      ],
    },
    {
      title: 'Services — ClusterIP',
      content: `**Service** — абстракция, предоставляющая стабильный сетевой endpoint для группы Pod'ов. Pod'ы эфемерны (IP меняется), Service — постоянен.

**ClusterIP** (default) — внутренний IP, доступен только внутри кластера.

**Как работает Service:**

1. Service имеет selector (labels) → находит Pod'ы
2. kube-proxy создаёт iptables/IPVS правила на каждой Node
3. Трафик на Service IP балансируется между Pod'ами (round-robin)
4. CoreDNS создаёт DNS-запись: \`my-service.namespace.svc.cluster.local\`

**DNS в кластере:**

| Запрос | Результат |
|--------|-----------|
| \`my-service\` | Service в том же namespace |
| \`my-service.prod\` | Service в namespace prod |
| \`my-service.prod.svc.cluster.local\` | FQDN |

**Service без selector** — для внешних endpoints (ExternalName, ручные Endpoints).`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: Service
metadata:
  name: web-app-service
  labels:
    app: web-app
spec:
  type: ClusterIP
  selector:
    app: web-app
  ports:
    - name: http
      port: 80          # порт Service
      targetPort: 3000  # порт контейнера
      protocol: TCP
  sessionAffinity: None  # или ClientIP для sticky sessions`,
          caption: 'ClusterIP Service',
        },
        {
          language: 'bash',
          code: `# Проверка Service
kubectl get svc
kubectl describe svc web-app-service
kubectl get endpoints web-app-service

# Доступ из другого Pod
kubectl run curl --image=curlimages/curl --rm -it --restart=Never -- \\
  curl http://web-app-service/health

# Port-forward для локального доступа
kubectl port-forward svc/web-app-service 8080:80`,
          caption: 'Диагностика Service',
        },
      ],
    },
    {
      title: 'Services — NodePort',
      content: `**NodePort** — расширяет ClusterIP, открывая порт на **каждой Node** кластера. Трафик: \`NodeIP:NodePort\` → Service → Pod.

**Диапазон портов:** 30000–32767 (по умолчанию).

**Когда использовать:**

- Локальная разработка (minikube service)
- Bare-metal кластеры без cloud LoadBalancer
- Отладка и тестирование
- **Не для production** напрямую — используй Ingress или LoadBalancer

**Схема трафика:**

\`\`\`
Client → NodeIP:30080 → kube-proxy → Service ClusterIP → Pod:8080
\`\`\`

**Ограничения:**

- Один NodePort на Service
- Диапазон 30000-32767 (не стандартные 80/443)
- Нет SSL termination
- Нет path-based routing`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  type: NodePort
  selector:
    app: web-app
  ports:
    - port: 80
      targetPort: 3000
      nodePort: 30080    # 30000-32767, опционально`,
          caption: 'NodePort Service',
        },
        {
          language: 'bash',
          code: `# Доступ к NodePort
kubectl get svc web-nodeport
# NodePort: 30080

# Minikube
minikube service web-nodeport --url

# Kind (с port mapping в конфиге)
curl http://localhost:30080

# Любая нода кластера
curl http://<node-ip>:30080`,
          caption: 'Доступ к NodePort Service',
        },
      ],
    },
    {
      title: 'Services — LoadBalancer',
      content: `**LoadBalancer** — расширяет NodePort, создавая внешний load balancer через cloud provider API (AWS ELB, GCP LB, Azure LB).

**Как работает в облаке:**

1. \`type: LoadBalancer\` → cloud-controller-manager
2. Cloud API создаёт Load Balancer
3. LB направляет трафик на NodePort всех Node'ов
4. Service получает EXTERNAL-IP

**Bare-metal альтернативы** (нет cloud LB):

- **MetalLB** — BGP/ARP для bare-metal
- **kube-vip** — virtual IP на Node
- **Ingress Controller** — рекомендуемый подход

**Аннотации для cloud providers:**

\`\`\`yaml
metadata:
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    cloud.google.com/load-balancer-type: "Internal"
\`\`\`

**Internal LoadBalancer** — доступен только внутри VPC (для backend-сервисов).`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: Service
metadata:
  name: web-lb
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
    - port: 80
      targetPort: 3000
  # loadBalancerIP: "1.2.3.4"  # статический IP (если поддерживается)`,
          caption: 'LoadBalancer Service в AWS',
        },
        {
          language: 'bash',
          code: `# Ожидание EXTERNAL-IP
kubectl get svc web-lb -w

# Minikube — требует minikube tunnel
minikube tunnel

# Проверка
curl http://<EXTERNAL-IP>/health`,
          caption: 'Доступ к LoadBalancer',
        },
      ],
    },
    {
      title: 'Ingress — HTTP-маршрутизация',
      content: `**Ingress** — API-объект для управления внешним HTTP/HTTPS доступом к Services. Один IP/домен → множество backend-сервисов.

**Ingress vs LoadBalancer:**

| | LoadBalancer | Ingress |
|---|-------------|---------|
| Протокол | TCP/UDP (L4) | HTTP/HTTPS (L7) |
| Стоимость | 1 LB на Service ($$$) | 1 LB на все Services |
| Routing | Только по порту | Host, path, headers |
| SSL | На каждом LB | Централизованный TLS |
| Use case | TCP-сервисы, gRPC | HTTP API, web-приложения |

**Ingress Controller** — обязательный компонент, реализующий Ingress spec:
- **nginx-ingress** — самый популярный
- **Traefik** — cloud-native, auto-discovery
- **HAProxy** — высокая производительность
- **AWS ALB Ingress Controller** — нативный AWS ALB

**Правила маршрутизации:**

\`\`\`
api.example.com/v1/*  → api-v1-service:80
api.example.com/v2/*  → api-v2-service:80
www.example.com       → frontend-service:80
\`\`\``,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
        - www.example.com
      secretName: example-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /v1
            pathType: Prefix
            backend:
              service:
                name: api-v1
                port:
                  number: 80
          - path: /v2
            pathType: Prefix
            backend:
              service:
                name: api-v2
                port:
                  number: 80
    - host: www.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80`,
          caption: 'Ingress с TLS и path routing',
        },
        {
          language: 'bash',
          code: `# Установка nginx-ingress (minikube)
minikube addons enable ingress

# Проверка
kubectl get ingress
kubectl describe ingress app-ingress

# Добавить в /etc/hosts (локально)
echo "$(minikube ip) api.example.com www.example.com" | sudo tee -a /etc/hosts
curl https://api.example.com/v1/health`,
          caption: 'Установка и проверка Ingress',
        },
      ],
    },
    {
      title: 'ConfigMaps — конфигурация приложений',
      content: `**ConfigMap** — объект для хранения неконфиденциальной конфигурации в виде key-value пар.

**Способы использования ConfigMap:**

| Способ | Описание |
|--------|----------|
| Env variable | \`env.valueFrom.configMapKeyRef\` |
| Env from | \`envFrom.configMapRef\` — все ключи как env |
| Volume mount | Файл в директории контейнера |
| Command args | Аргументы командной строки |

**Ограничения:**

- Максимальный размер: 1 MiB
- Не для секретов (используй Secret)
- Изменение ConfigMap **не перезапускает** Pod автоматически (volume mount обновляется с задержкой ~60 сек)
- Для hot-reload конфигурации — sidecar или Stakater Reloader

**Создание ConfigMap:**

\`\`\`bash
kubectl create configmap app-config --from-literal=LOG_LEVEL=info
kubectl create configmap nginx-config --from-file=nginx.conf
\`\`\``,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
  app.properties: |
    server.port=8080
    spring.profiles.active=production
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    spec:
      containers:
        - name: app
          image: myapp:1.0.0
          env:
            - name: LOG_LEVEL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: LOG_LEVEL
          volumeMounts:
            - name: config-volume
              mountPath: /etc/app/config
              readOnly: true
      volumes:
        - name: config-volume
          configMap:
            name: app-config
            items:
              - key: app.properties
                path: app.properties`,
          caption: 'ConfigMap как env и volume',
        },
      ],
    },
    {
      title: 'Secrets — хранение чувствительных данных',
      content: `**Secret** — объект для хранения конфиденциальных данных: паролей, токенов, TLS-сертификатов, SSH-ключей.

**Типы Secrets:**

| type | Назначение |
|------|------------|
| \`Opaque\` | Произвольные данные (default) |
| \`kubernetes.io/tls\` | TLS сертификат + ключ |
| \`kubernetes.io/dockerconfigjson\` | Credentials для Docker registry |
| \`kubernetes.io/basic-auth\` | Username + password |
| \`kubernetes.io/ssh-auth\` | SSH private key |

**Важно о безопасности:**

- Secrets в etcd хранятся **base64-encoded, НЕ encrypted** (by default)
- Включи **encryption at rest** для etcd в production
- Используй **External Secrets Operator** + Vault/AWS SSM для production
- Не коммить Secrets в Git — Sealed Secrets или SOPS
- RBAC: ограничь доступ к Secrets

**Использование аналогично ConfigMap:** env, volume mount, imagePullSecrets.`,
      codes: [
        {
          language: 'bash',
          code: `# Создание Secret
kubectl create secret generic db-credentials \\
  --from-literal=username=app \\
  --from-literal=password=s3cret

kubectl create secret docker-registry ghcr-secret \\
  --docker-server=ghcr.io \\
  --docker-username=myuser \\
  --docker-password=glpat-xxx

kubectl create secret tls example-tls \\
  --cert=tls.crt --key=tls.key`,
          caption: 'Создание Secrets',
        },
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:          # автоматический base64 (предпочтительнее data:)
  username: app
  password: s3cret
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: app
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password`,
          caption: 'Secret в Deployment',
        },
      ],
    },
    {
      title: 'Namespaces — логическое разделение',
      content: `**Namespace** — виртуальный кластер внутри физического. Изолирует ресурсы, RBAC, quotas.

**Стандартные namespaces:**

| Namespace | Назначение |
|-----------|------------|
| \`default\` | Ресурсы без namespace |
| \`kube-system\` | Компоненты K8s (CoreDNS, kube-proxy) |
| \`kube-public\` | Публичные ресурсы |
| \`kube-node-lease\` | Heartbeat нод |

**Типичная структура:**

\`\`\`
production     — prod workloads
staging        — pre-prod тестирование
development    — dev окружение
monitoring     — Prometheus, Grafana
ingress-nginx  — Ingress Controller
cert-manager   — TLS сертификаты
\`\`\`

**Изоляция между namespaces:**

- По умолчанию Pod'ы из разных namespaces **могут** общаться через Service FQDN
- NetworkPolicy может запретить cross-namespace трафик
- ResourceQuota ограничивает ресурсы per namespace
- RBAC ограничивает доступ per namespace`,
      codes: [
        {
          language: 'bash',
          code: `# Управление namespaces
kubectl create namespace production
kubectl get namespaces
kubectl config set-context --current --namespace=production

# Все ресурсы в namespace
kubectl get all -n production

# ResourceQuota
kubectl create quota prod-quota \\
  --hard=cpu=10,memory=20Gi,pods=50 \\
  -n production

# LimitRange (defaults для контейнеров)
kubectl apply -f - <<EOF
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: production
spec:
  limits:
    - default:
        cpu: 500m
        memory: 512Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      type: Container
EOF`,
          caption: 'Namespaces и квоты',
        },
      ],
    },
    {
      title: 'Resource requests и limits',
      content: `**Resource management** — критически важный аспект production K8s. Без requests/limits кластер деградирует.

**Requests vs Limits:**

| | Requests | Limits |
|---|----------|--------|
| Назначение | Гарантированный минимум | Максимум потребления |
| Scheduling | Scheduler учитывает requests | Не влияет на scheduling |
| CPU | Гарантированное время | Throttling при превышении |
| Memory | Гарантированная память | **OOM Kill** при превышении |

**QoS Classes (автоматически):**

| Class | Условие | Приоритет при eviction |
|-------|---------|------------------------|
| **Guaranteed** | requests = limits для всех контейнеров | Последний |
| **Burstable** | requests < limits | Средний |
| **BestEffort** | Нет requests/limits | Первый (OOM Kill) |

**Рекомендации:**

- Всегда указывай requests и limits
- Начни с VPA (Vertical Pod Autoscaler) recommendations
- CPU: requests = среднее потребление, limits = 2-4x requests
- Memory: requests = limits (избегай OOM)
- Используй \`kubectl top pods\` для мониторинга реального потребления`,
      codes: [
        {
          language: 'yaml',
          code: `resources:
  requests:
    cpu: 100m        # 0.1 CPU core
    memory: 128Mi    # 128 Mebibytes
  limits:
    cpu: 500m        # 0.5 CPU core
    memory: 512Mi

# Расширенные ресурсы
resources:
  requests:
    cpu: "2"
    memory: 4Gi
    ephemeral-storage: 1Gi
  limits:
    cpu: "4"
    memory: 8Gi
    ephemeral-storage: 2Gi
    nvidia.com/gpu: 1    # GPU`,
          caption: 'Resource requests и limits',
        },
        {
          language: 'bash',
          code: `# Мониторинг потребления
kubectl top pods -n production
kubectl top nodes
kubectl describe node <node> | grep -A5 "Allocated resources"

# VPA recommendation (если установлен)
kubectl get vpa -n production`,
          caption: 'Мониторинг ресурсов',
        },
      ],
    },
    {
      title: 'Health Probes — liveness, readiness, startup',
      content: `**Probes** — механизм проверки здоровья контейнеров. Kubelet периодически выполняет проверки и реагирует на результат.

**Три типа probes:**

| Probe | Вопрос | Действие при failure |
|-------|--------|---------------------|
| **Liveness** | Контейнер жив? | Перезапуск контейнера |
| **Readiness** | Готов принимать трафик? | Убрать из Service endpoints |
| **Startup** | Завершил ли инициализацию? | Блокирует liveness/readiness |

**Типы проверок (probe handlers):**

| Handler | Описание |
|---------|----------|
| \`httpGet\` | HTTP GET запрос (самый частый) |
| \`tcpSocket\` | TCP-подключение к порту |
| \`exec\` | Выполнение команды в контейнере |
| \`grpc\` | gRPC health check (K8s 1.24+) |

**Параметры probes:**

- \`initialDelaySeconds\` — задержка перед первой проверкой
- \`periodSeconds\` — интервал между проверками (default: 10)
- \`timeoutSeconds\` — таймаут (default: 1)
- \`failureThreshold\` — неудач до action (default: 3)
- \`successThreshold\` — успехов для recovery (default: 1)

**Типичные ошибки:**

- Liveness probe слишком агрессивный → restart loop
- Нет readiness probe → трафик на неготовый Pod
- Один endpoint для liveness и readiness → cascading failures`,
      codes: [
        {
          language: 'yaml',
          code: `containers:
  - name: app
    image: myapp:1.0.0
    ports:
      - containerPort: 3000
    startupProbe:
      httpGet:
        path: /health
        port: 3000
      failureThreshold: 30
      periodSeconds: 10
      # 30 * 10 = 300 сек на старт
    livenessProbe:
      httpGet:
        path: /health
        port: 3000
      initialDelaySeconds: 0
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /ready
        port: 3000
      initialDelaySeconds: 0
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3
      successThreshold: 1`,
          caption: 'Все три типа probes',
        },
      ],
    },
    {
      title: 'Rolling Updates — стратегия обновления',
      content: `**Rolling Update** — стратегия Deployment по умолчанию. Постепенно заменяет старые Pod'ы новыми без downtime.

**Процесс Rolling Update:**

1. Создаётся новый ReplicaSet с обновлённым Pod template
2. Увеличивается replicas нового RS (maxSurge)
3. Уменьшается replicas старого RS (maxUnavailable)
4. Процесс повторяется, пока все Pod'ы не обновятся
5. Старый ReplicaSet сохраняется (для rollback)

**Настройка стратегии:**

\`\`\`yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1          # +1 Pod сверх replicas
    maxUnavailable: 0    # 0 Pod'ов недоступно (zero-downtime)
\`\`\`

**Zero-downtime deploy требует:**

- \`maxUnavailable: 0\` — старые Pod'ы живы, пока новые не ready
- Readiness probe — новый Pod получает трафик только когда ready
- Достаточно ресурсов на Node для maxSurge Pod'ов

**Отслеживание:**

\`\`\`bash
kubectl rollout status deployment/web-app
kubectl rollout history deployment/web-app
\`\`\``,
      codes: [
        {
          language: 'bash',
          code: `# Обновление образа
kubectl set image deployment/web-app app=myapp:2.0.0
kubectl rollout status deployment/web-app --timeout=300s

# Пауза и возобновление
kubectl rollout pause deployment/web-app
kubectl rollout resume deployment/web-app

# Canary через аннотации (ручной)
kubectl patch deployment web-app -p \\
  '{"spec":{"template":{"metadata":{"annotations":{"deployment.kubernetes.io/revision":"canary"}}}}}'

# Проверка ReplicaSet'ов
kubectl get rs -l app=web-app`,
          caption: 'Управление rolling updates',
        },
      ],
    },
    {
      title: 'Rollback — откат деплоя',
      content: `Kubernetes сохраняет историю ReplicaSet'ов, что позволяет быстро откатиться к предыдущей версии.

**Механизм rollback:**

1. Deployment хранит \`revisionHistoryLimit\` (default: 10) старых ReplicaSet'ов
2. \`kubectl rollout undo\` переключает на предыдущий ReplicaSet
3. Rollback — это тоже rolling update (постепенная замена Pod'ов)

**Сценарии rollback:**

| Ситуация | Действие |
|----------|----------|
| Новая версия падает (CrashLoopBackOff) | \`kubectl rollout undo\` |
| Ошибки в логах после deploy | \`kubectl rollout undo\` |
| Performance degradation | \`kubectl rollout undo\` |
| Нужна конкретная версия | \`kubectl rollout undo --to-revision=N\` |

**Автоматический rollback:**

\`\`\`yaml
spec:
  minReadySeconds: 10
  progressDeadlineSeconds: 600
  revisionHistoryLimit: 5
\`\`\`

ArgoCD и Flagger обеспечивают автоматический rollback по метрикам (error rate, latency).

**Best practice:** каждый deploy через CI/CD с автоматическим smoke test. При failure — auto rollback.`,
      codes: [
        {
          language: 'bash',
          code: `# История ревизий
kubectl rollout history deployment/web-app
kubectl rollout history deployment/web-app --revision=3

# Откат к предыдущей версии
kubectl rollout undo deployment/web-app

# Откат к конкретной ревизии
kubectl rollout undo deployment/web-app --to-revision=2

# Проверка после отката
kubectl rollout status deployment/web-app
kubectl get pods -l app=web-app -o wide

# Записать причину (annotation)
kubectl annotate deployment/web-app \\
  kubernetes.io/change-cause="Rollback to v1.0.0 due to high error rate"`,
          caption: 'Rollback Deployment',
        },
      ],
    },
    {
      title: 'Практический workflow — деплой приложения',
      content: `Соберём полный workflow деплоя приложения в K8s — от образа до доступного через Ingress сервиса.

**Шаги:**

1. Собрать Docker-образ и запушить в registry
2. Создать Namespace
3. Создать Secret (DB credentials, registry pull)
4. Создать ConfigMap (app config)
5. Создать Deployment (с probes, resources)
6. Создать Service (ClusterIP)
7. Создать Ingress (внешний доступ)
8. Проверить: rollout status, logs, curl

**Порядок apply важен** — зависимости должны существовать до зависимых ресурсов. Используй \`kustomization.yaml\` или Helm для управления порядком.

**Структура директории:**

\`\`\`
k8s/
├── base/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
└── overlays/
    ├── dev/
    ├── staging/
    └── production/
\`\`\``,
      codes: [
        {
          language: 'bash',
          code: `# Полный деплой
export VERSION=1.0.0
export REGISTRY=ghcr.io/myorg/myapp

# 1. Build & push
docker build -t $REGISTRY:$VERSION .
docker push $REGISTRY:$VERSION

# 2. Deploy
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml -n production
kubectl apply -f k8s/configmap.yaml -n production
kubectl apply -f k8s/deployment.yaml -n production
kubectl apply -f k8s/service.yaml -n production
kubectl apply -f k8s/ingress.yaml -n production

# 3. Verify
kubectl rollout status deployment/web-app -n production
kubectl get pods,svc,ingress -n production
kubectl logs -l app=web-app -n production --tail=20

# 4. Test
curl -H "Host: api.example.com" http://$(minikube ip)/health`,
          caption: 'Полный workflow деплоя',
        },
      ],
    },
  ],
  practice: [
    'Установи minikube или kind и убедись, что kubectl работает с кластером',
    'Создай Pod вручную, проверь logs и exec, затем удали — объясни, почему в prod так не делают',
    'Задеплой nginx Deployment с 3 репликами, проверь через kubectl get pods -o wide на каких нодах они работают',
    'Создай ClusterIP Service и проверь DNS-доступность из временного curl-Pod',
    'Настрой NodePort Service и получи доступ к приложению через minikube service или port-forward',
    'Установи Ingress Controller, создай Ingress с двумя path rules для разных Services',
    'Создай ConfigMap и Secret, подключи их к Deployment через env и volume mount',
    'Создай namespace production с ResourceQuota и LimitRange',
    'Добавь liveness, readiness и startup probes к Deployment — проверь поведение при failure',
    'Выполни rolling update (смена image tag), затем rollback к предыдущей ревизии',
  ],
  resources: [
    { title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/home/' },
    { title: 'Kubectl Cheat Sheet', url: 'https://kubernetes.io/docs/reference/kubectl/quick-reference/' },
  ],
}
