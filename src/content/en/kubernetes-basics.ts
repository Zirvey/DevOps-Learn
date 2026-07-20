import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: "Kubernetes — basics",
  duration: "10–12 hours",
  description: "Kubernetes foundation: architecture, kubectl, Pods, Deployments, Services, Ingress, ConfigMaps, Secrets and production patterns",
  sections: [
    {
      title: "Why do you need Kubernetes?",
      content: "**Kubernetes (K8s)** is an open-source container orchestration platform. Automates deployment, scaling, networking and self-healing of containerized applications.\n\n**Problems that K8s solves:**\n\n| Problem | K8s Solution |\n|----------|------------|\n| Manual deployment to servers | Declarative manifests, GitOps |\n| Downtime when updating | Rolling updates, zero-downtime deploy |\n| Instance crash | Self-healing: automatic restart |\n| Manual scaling | HPA: autoscaling by CPU/RPS/custom metrics |\n| Service discovery | Built-in DNS, Services |\n| Configuration | ConfigMaps, Secrets |\n| Load Balancing | Service LoadBalancer, Ingress |\n\n**When Kubernetes is needed:**\n\n- Microservice architecture (5+ services)\n- High availability requirements (99.9%+)\n- Auto-scaling for load\n- Multi-cloud/hybrid cloud\n- Team with DevOps/SRE competencies\n\n**When Kubernetes is NOT needed:**\n\n- MVP, pet project, one server → Docker Compose\n- Team < 3 people without ops experience → PaaS (Railway, Fly.io, Heroku)\n- Stateful monolith without scaling plans → VM + Docker\n- Batch tasks → AWS Batch, Cloud Run Jobs\n\n> Kubernetes adds operational complexity. Don’t use K8s “because it’s fashionable” - evaluate your real needs.",
    },
    {
      title: "Kubernetes cluster architecture",
      content: "A K8s cluster consists of a **Control Plane** (control) and **Worker Nodes** (workloads).\n\n**Control Plane (Master):**\n\n| Component | Role |\n|-----------|------|\n| **kube-apiserver** | REST API - single entry point for all operations |\n| **etcd** | Distributed key-value storage of cluster state |\n| **kube-scheduler** | Assigns Pods to suitable Nodes |\n| **kube-controller-manager** | Controllers: Deployment, ReplicaSet, Node, Service |\n| **cloud-controller-manager** | Cloud integration (LB, volumes, routes) |\n\n**Worker Node:**\n\n| Component | Role |\n|-----------|------|\n| **kubelet** | Agent on the node, manages Pods |\n| **kube-proxy** | Network routing (iptables/IPVS) for Services |\n| **Container Runtime** | containerd, CRI-O - launching containers |\n\n**Pod creation flow:**\n\n1. `kubectl apply -f pod.yaml` → API Server\n2. Write to etcd\n3. Scheduler selects Node\n4. kubelet on Node creates a Pod via container runtime\n5. kube-proxy configures network rules\n\n**Additional components of the production cluster:**\n\n- **CNI plugin** (Calico, Cilium, Flannel) - network of Pods\n- **CSI driver** - persistent storage\n- **Ingress Controller** (nginx, Traefik) - HTTP routing\n- **Cert Manager** - automatic TLS certificates\n- **Metrics Server** - metrics for HPA\n- **CoreDNS** — DNS within the cluster",
      codes: [
        {
          language: "bash",
          code: "# Компоненты control plane (managed K8s — скрыты)\nkubectl get componentstatuses    # deprecated, но информативно\nkubectl get nodes -o wide\nkubectl cluster-info\n\n# Информация о ноде\nkubectl describe node <node-name>\nkubectl top nodes    # требует metrics-server",
          caption: "Checking the cluster status",
        },
      ],
    },
    {
      title: "Installing Minikube",
      content: "**Minikube** - local single-node K8s cluster for training and development. Starts a cluster in a VM or Docker container.\n\n**Requirements:** 2+ CPU, 2GB+ RAM, Docker/VM driver.\n\n**Supported drivers:** docker (recommended), hyperkit (macOS), virtualbox, kvm.\n\n**Minikube Features:**\n\n- One Node (control plane + worker)\n- Built-in addons: dashboard, metrics-server, ingress\n- `minikube tunnel` for LoadBalancer Services\n- `minikube service` to access NodePort\n- Easy to delete and recreate",
      codes: [
        {
          language: "bash",
          code: "# Установка (macOS)\nbrew install minikube kubectl\n\n# Запуск кластера\nminikube start --cpus=4 --memory=8192 --driver=docker\nminikube status\n\n# Включить addons\nminikube addons enable metrics-server\nminikube addons enable ingress\nminikube addons enable dashboard\n\n# Использовать Docker daemon Minikube (собирать образы внутри кластера)\neval $(minikube docker-env)\ndocker build -t myapp:local .\n\n# Доступ к сервисам\nminikube service my-service --url\nminikube tunnel    # для LoadBalancer (отдельный терминал)\n\n# Dashboard\nminikube dashboard\n\n# Остановка и удаление\nminikube stop\nminikube delete",
          caption: "Minikube - installation and management",
        },
      ],
    },
    {
      title: "Installation kind (Kubernetes in Docker)",
      content: "**kind** (Kubernetes IN Docker) - launches the K8s cluster as Docker containers. Faster than Minikube, ideal for CI/CD.\n\n**kind vs Minikube:**\n\n| | kind | minikube |\n|---|------|----------|\n| Launch speed | ~30 sec | ~1-2 min |\n| Multi-node | Yes (multiple Docker containers) | No (1 node) |\n| LoadBalancer | Requires port-mapping | minikube tunnel |\n| Dashboard | No built-in | There is addon |\n| CI/CD | Ideal | Slower |\n| Training | good | Better (addons, tunnel) |\n\n**kind of features:**\n\n- Each “node” is a Docker container\n- Images are loaded via `kind load docker-image`\n- Configuration via YAML (multi-node, port mappings)\n- Used in Kubernetes CI (testing K8s itself)",
      codes: [
        {
          language: "bash",
          code: "# Установка\nbrew install kind\n\n# Создать кластер\nkind create cluster --name dev\nkind create cluster --config kind-config.yaml\n\n# kind-config.yaml — multi-node с port mapping\n# kind: Cluster\n# apiVersion: kind.x-k8s.io/v1alpha4\n# nodes:\n#   - role: control-plane\n#     extraPortMappings:\n#       - containerPort: 80\n#         hostPort: 80\n#   - role: worker\n#   - role: worker\n\n# Загрузить локальный образ в kind\ndocker build -t myapp:local .\nkind load docker-image myapp:local --name dev\n\n# Управление\nkubectl cluster-info --context kind-dev\nkind get clusters\nkind delete cluster --name dev",
          caption: "kind - local multi-node cluster",
        },
      ],
    },
    {
      title: "kubectl - basics",
      content: "**kubectl** - CLI for interacting with the Kubernetes API. The main tool of the K8s engineer.\n\n**Team structure:**\n\n`kubectl [command] [type] [name] [flags]`\n\n**Basic commands:**\n\n| Command | Description |\n|---------|----------|\n| `create` | Create resource |\n| `apply` | Create or update (declarative, idempotent) |\n| `get` | Get List/Details |\n| `describe` | More information + events |\n| `delete` | Delete resource |\n| `edit` | Edit in-place |\n| `logs` | Container logs |\n| `exec` | Run command in container |\n| `port-forward` | Port forwarding to localhost |\n| `scale` | Scaling |\n| `rollout` | Deployment management |\n\n**Useful flags:**\n\n- `-n namespace` — specify namespace\n- `-A` / `--all-namespaces` — all namespaces\n- `-o wide` — additional columns\n- `-o yaml` / `-o json` - output format\n- `--dry-run=client -o yaml` - generate YAML without application\n- `-l app=myapp` — filter by label\n- `--watch` / `-w` — watch for changes\n\n**kubectl apply vs create:** always prefer `apply` - idempotent operation, CI/CD safe.",
      codes: [
        {
          language: "bash",
          code: "# Контекст и конфигурация\nkubectl config get-contexts\nkubectl config use-context minikube\nkubectl config set-context --current --namespace=dev\n\n# CRUD операции\nkubectl apply -f deployment.yaml\nkubectl apply -f k8s/                    # целая директория\nkubectl get pods -n production -o wide\nkubectl describe pod my-pod-abc123\nkubectl delete -f deployment.yaml\nkubectl delete pod my-pod --grace-period=0 --force\n\n# Генерация YAML\nkubectl create deployment nginx --image=nginx:alpine --dry-run=client -o yaml\nkubectl run tmp --image=busybox --rm -it --restart=Never -- sh\n\n# Отладка\nkubectl logs my-pod -f --tail=100\nkubectl logs my-pod -c sidecar          # конкретный контейнер\nkubectl exec -it my-pod -- sh\nkubectl port-forward svc/my-service 8080:80\nkubectl top pods\nkubectl get events --sort-by='.lastTimestamp'",
          caption: "Daily kubectl commands",
        },
      ],
    },
    {
      title: "Pods - minimum unit",
      content: "**Pod** is the smallest computing unit in Kubernetes. One or more containers sharing network namespace, IPC and volumes.\n\n**Key Pod Properties:**\n\n- **Ephemeral** - Pod is not “repaired”, but recreated\n- **Unique IP** in a cluster network (per Pod, not per container)\n- **Shared network** — containers in a Pod communicate via localhost\n- **Shared volumes** — emptyDir, PVC are mounted in all containers\n- **QoS classes** — Guaranteed, Burstable, BestEffort\n\n**Container types in Pod:**\n\n| Type | Role |\n|-----|------|\n| **Main container** | Main application |\n| **Init container** | Preparing before main (migrations, waiting for dependencies) |\n| **Sidecar** | Additional process (logging, proxy, monitoring) |\n| **Ephemeral container** | Debugging running Pod (kubectl debug) |\n\n**Pod lifecycle phases:** Pending → Running → Succeeded/Failed\n\n> **Important:** do not create Pods directly in production. Use Deployment, StatefulSet or DaemonSet - they manage the life cycle of Pods.",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx-pod\n  labels:\n    app: nginx\n    env: dev\nspec:\n  containers:\n    - name: nginx\n      image: nginx:1.25-alpine\n      ports:\n        - containerPort: 80\n      resources:\n        requests:\n          cpu: 100m\n          memory: 128Mi\n        limits:\n          cpu: 500m\n          memory: 256Mi\n      volumeMounts:\n        - name: cache\n          mountPath: /var/cache/nginx\n  volumes:\n    - name: cache\n      emptyDir: {}",
          caption: "Basic Pod manifest",
        },
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: Pod\nmetadata:\n  name: app-with-init\nspec:\n  initContainers:\n    - name: wait-for-db\n      image: busybox:1.36\n      command: ['sh', '-c', 'until nc -z db-service 5432; do sleep 2; done']\n    - name: migrate\n      image: myapp:1.0.0\n      command: ['npm', 'run', 'migrate']\n  containers:\n    - name: app\n      image: myapp:1.0.0\n      ports:\n        - containerPort: 3000",
          caption: "Pod with init containers",
        },
      ],
    },
    {
      title: "Deployments - replica management",
      content: "**Deployment** is a high-level controller that manages ReplicaSets and provides declarative updates to Pods.\n\n**What Deployment gives:**\n\n- **Replication** — N identical Pods\n- **Rolling update** - gradual update without downtime\n- **Rollback** — rollback to the previous version\n- **Scaling** — changing the number of replicas\n- **Self-healing** — re-creation of fallen Pods\n\n**Upgrade Strategies:**\n\n| Strategy | Description |\n|-----------|----------|\n| `RollingUpdate` (default) | Gradual replacement of Pods |\n| `Recreate` | Kill everything → create new ones (downtime) |\n\n**RollingUpdate parameters:**\n\n- `maxSurge` - how many extra Pods can be created (default: 25%)\n- `maxUnavailable` - how many Pods may be unavailable (default: 25%)\n\n**Object connection:** Deployment → ReplicaSet → Pod(s)",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-app\n  labels:\n    app: web-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web-app\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0\n  template:\n    metadata:\n      labels:\n        app: web-app\n        version: \"1.0.0\"\n    spec:\n      containers:\n        - name: app\n          image: ghcr.io/myorg/web-app:1.0.0\n          ports:\n            - containerPort: 3000\n          env:\n            - name: NODE_ENV\n              value: production\n          resources:\n            requests:\n              cpu: 100m\n              memory: 128Mi\n            limits:\n              cpu: 500m\n              memory: 512Mi\n          livenessProbe:\n            httpGet:\n              path: /health\n              port: 3000\n            initialDelaySeconds: 15\n            periodSeconds: 10\n          readinessProbe:\n            httpGet:\n              path: /ready\n              port: 3000\n            initialDelaySeconds: 5\n            periodSeconds: 5",
          caption: "Production Deployment",
        },
        {
          language: "bash",
          code: "# Управление Deployment\nkubectl apply -f deployment.yaml\nkubectl get deployments\nkubectl scale deployment web-app --replicas=5\nkubectl set image deployment/web-app app=ghcr.io/myorg/web-app:1.1.0\nkubectl rollout status deployment/web-app\nkubectl rollout history deployment/web-app\nkubectl rollout undo deployment/web-app\nkubectl rollout undo deployment/web-app --to-revision=2",
          caption: "Deployment Control Commands",
        },
      ],
    },
    {
      title: "ReplicaSets and Labels/Selectors",
      content: "**ReplicaSet** is a controller that supports a stable set of Pod replicas. Deployment manages ReplicaSets automatically.\n\n**Labels and Selectors** are the fundamental mechanism of K8s for linking resources.\n\n**Labels** — key/value metadata on objects:\n\n```\n\nyaml\nlabels:\n  app: web-app\n  env: production\n  version: \"1.0.0\"\n  team: backend\n```\n\n**Selectors** — queries by labels:\n- `matchLabels` - exact match\n- `matchExpressions` — In, NotIn, Exists, DoesNotExist\n\n**Recommended labels (standard):**\n\n| Label | Example | Destination |\n|-------|--------|-----------|\n| `app.kubernetes.io/name` | web-app | Application name |\n| `app.kubernetes.io/version` | 1.0.0 | Version |\n| `app.kubernetes.io/component` | api | Component |\n| `app.kubernetes.io/part-of` | myplatform | Part of the system |\n| `app.kubernetes.io/managed-by` | helm | Management Tool |\n\n**Why labels:** Service finds Pods by selector, Deployment - by matchLabels, NetworkPolicy - by matchLabels.",
      codes: [
        {
          language: "bash",
          code: "# Фильтрация по labels\nkubectl get pods -l app=web-app\nkubectl get pods -l 'env in (production,staging)'\nkubectl get pods -l 'app=web-app,version!=1.0.0'\nkubectl get all -l app=web-app\n\n# Добавить/изменить label\nkubectl label pod my-pod env=staging\nkubectl label pod my-pod env=production --overwrite\n\n# Удалить label\nkubectl label pod my-pod env-",
          caption: "Working with labels",
        },
      ],
    },
    {
      title: "Services — ClusterIP",
      content: "**Service** is an abstraction that provides a stable network endpoint for a group of Pods. Pods are ephemeral (IP changes), Service is permanent.\n\n**ClusterIP** (default) - internal IP, available only within the cluster.\n\n**How Service works:**\n\n1. Service has selector (labels) → finds Pods\n2. kube-proxy creates iptables/IPVS rules on each Node\n3. Traffic on Service IP is balanced between Pods (round-robin)\n4. CoreDNS creates a DNS record: `my-service.namespace.svc.cluster.local`\n\n**DNS in the cluster:**\n\n| Request | Result |\n|--------|----------|\n| `my-service` | Service in the same namespace |\n| `my-service.prod` | Service in namespace prod |\n| `my-service.prod.svc.cluster.local` | FQDN |\n\n**Service without selector** - for external endpoints (ExternalName, manual Endpoints).",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: Service\nmetadata:\n  name: web-app-service\n  labels:\n    app: web-app\nspec:\n  type: ClusterIP\n  selector:\n    app: web-app\n  ports:\n    - name: http\n      port: 80          # порт Service\n      targetPort: 3000  # порт контейнера\n      protocol: TCP\n  sessionAffinity: None  # или ClientIP для sticky sessions",
          caption: "ClusterIP Service",
        },
        {
          language: "bash",
          code: "# Проверка Service\nkubectl get svc\nkubectl describe svc web-app-service\nkubectl get endpoints web-app-service\n\n# Доступ из другого Pod\nkubectl run curl --image=curlimages/curl --rm -it --restart=Never -- \\\n  curl http://web-app-service/health\n\n# Port-forward для локального доступа\nkubectl port-forward svc/web-app-service 8080:80",
          caption: "Diagnostics Service",
        },
      ],
    },
    {
      title: "Services — NodePort",
      content: "**NodePort** - Extends ClusterIP by opening a port on **each Node** of the cluster. Traffic: `NodeIP:NodePort` → Service → Pod.\n\n**Port Range:** 30000 - 32767 (default).\n\n**When to use:**\n\n- Local development (minikube service)\n- Bare-metal clusters without cloud LoadBalancer\n- Debugging and testing\n- **Not for production** directly - use Ingress or LoadBalancer\n\n**Traffic pattern:**\n\n```\nClient → NodeIP:30080 → kube-proxy → Service ClusterIP → Pod:8080\n```\n\n**Limitations:**\n\n- One NodePort per Service\n- Range 30000-32767 (not standard 80/443)\n- No SSL termination\n- No path-based routing",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: Service\nmetadata:\n  name: web-nodeport\nspec:\n  type: NodePort\n  selector:\n    app: web-app\n  ports:\n    - port: 80\n      targetPort: 3000\n      nodePort: 30080    # 30000-32767, опционально",
          caption: "NodePort Service",
        },
        {
          language: "bash",
          code: "# Доступ к NodePort\nkubectl get svc web-nodeport\n# NodePort: 30080\n\n# Minikube\nminikube service web-nodeport --url\n\n# Kind (с port mapping в конфиге)\ncurl http://localhost:30080\n\n# Любая нода кластера\ncurl http://<node-ip>:30080",
          caption: "Access to NodePort Service",
        },
      ],
    },
    {
      title: "Services — LoadBalancer",
      content: "**LoadBalancer** - extends NodePort by creating an external load balancer via cloud provider API (AWS ELB, GCP LB, Azure LB).\n\n**How it works in the cloud:**\n\n1. `type: LoadBalancer` → cloud-controller-manager\n2. Cloud API creates Load Balancer\n3. LB directs traffic to the NodePort of all Nodes\n4. Service receives EXTERNAL-IP\n\n**Bare-metal alternatives** (no cloud LB):\n\n- **MetalLB** — BGP/ARP for bare-metal\n- **kube-vip** - virtual IP on Node\n- **Ingress Controller** - recommended approach\n\n**Annotations for cloud providers:**\n\n```\n\nyaml\nmetadata:\n  annotations:\n    service.beta.kubernetes.io/aws-load-balancer-type: \"nlb\"\n    cloud.google.com/load-balancer-type: \"Internal\"\n```\n\n**Internal LoadBalancer** - available only inside the VPC (for backend services).",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: Service\nmetadata:\n  name: web-lb\n  annotations:\n    service.beta.kubernetes.io/aws-load-balancer-scheme: \"internet-facing\"\nspec:\n  type: LoadBalancer\n  selector:\n    app: web-app\n  ports:\n    - port: 80\n      targetPort: 3000\n  # loadBalancerIP: \"1.2.3.4\"  # статический IP (если поддерживается)",
          caption: "LoadBalancer Service on AWS",
        },
        {
          language: "bash",
          code: "# Ожидание EXTERNAL-IP\nkubectl get svc web-lb -w\n\n# Minikube — требует minikube tunnel\nminikube tunnel\n\n# Проверка\ncurl http://<EXTERNAL-IP>/health",
          caption: "Access to LoadBalancer",
        },
      ],
    },
    {
      title: "Ingress - HTTP routing",
      content: "**Ingress** - API object for managing external HTTP/HTTPS access to Services. One IP/domain → many backend services.\n\n**Ingress vs LoadBalancer:**\n\n| | LoadBalancer | Ingress |\n|---|------------|---------|\n| Protocol | TCP/UDP (L4) | HTTP/HTTPS (L7) |\n| Cost | 1 LB on Service ($$$) | 1 LB for all Services |\n| Routing | Only by port | Host, path, headers |\n| SSL | On each LB | Centralized TLS |\n| Use case | TCP services, gRPC | HTTP API, web applications |\n\n**Ingress Controller** is a required component that implements the Ingress spec:\n- **nginx-ingress** - the most popular\n- **Traefik** — cloud-native, auto-discovery\n- **HAProxy** - high performance\n- **AWS ALB Ingress Controller** - native AWS ALB\n\n**Routing rules:**\n\n```\napi.example.com/v1/*  → api-v1-service:80\napi.example.com/v2/*  → api-v2-service:80\nwww.example.com       → frontend-service:80\n```",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: app-ingress\n  annotations:\n    nginx.ingress.kubernetes.io/rewrite-target: /\n    cert-manager.io/cluster-issuer: letsencrypt-prod\nspec:\n  ingressClassName: nginx\n  tls:\n    - hosts:\n        - api.example.com\n        - www.example.com\n      secretName: example-tls\n  rules:\n    - host: api.example.com\n      http:\n        paths:\n          - path: /v1\n            pathType: Prefix\n            backend:\n              service:\n                name: api-v1\n                port:\n                  number: 80\n          - path: /v2\n            pathType: Prefix\n            backend:\n              service:\n                name: api-v2\n                port:\n                  number: 80\n    - host: www.example.com\n      http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: frontend\n                port:\n                  number: 80",
          caption: "Ingress with TLS and path routing",
        },
        {
          language: "bash",
          code: "# Установка nginx-ingress (minikube)\nminikube addons enable ingress\n\n# Проверка\nkubectl get ingress\nkubectl describe ingress app-ingress\n\n# Добавить в /etc/hosts (локально)\necho \"$(minikube ip) api.example.com www.example.com\" | sudo tee -a /etc/hosts\ncurl https://api.example.com/v1/health",
          caption: "Installing and testing Ingress",
        },
      ],
    },
    {
      title: "ConfigMaps - application configuration",
      content: "**ConfigMap** - an object for storing non-confidential configuration in the form of key-value pairs.\n\n**Ways to use ConfigMap:**\n\n| Method | Description |\n|--------|----------|\n| Env variable | `env.valueFrom.configMapKeyRef` |\n| Env from | `envFrom.configMapRef` - all keys as env |\n| volume mount | File in container directory |\n| Command args | Command Line Arguments |\n\n**Limitations:**\n\n- Maximum size: 1 MiB\n- Not for secrets (use Secret)\n- Changing ConfigMap **does not restart** Pod automatically (volume mount is updated with a delay of ~60 sec)\n- For hot-reload configuration - sidecar or Stakater Reloader\n\n**Creating ConfigMap:**\n\n```\n\nbash\nkubectl create configmap app-config --from-literal=LOG_LEVEL=info\nkubectl create configmap nginx-config --from-file=nginx.conf\n```",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  LOG_LEVEL: \"info\"\n  MAX_CONNECTIONS: \"100\"\n  app.properties: |\n    server.port=8080\n    spring.profiles.active=production\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  template:\n    spec:\n      containers:\n        - name: app\n          image: myapp:1.0.0\n          env:\n            - name: LOG_LEVEL\n              valueFrom:\n                configMapKeyRef:\n                  name: app-config\n                  key: LOG_LEVEL\n          volumeMounts:\n            - name: config-volume\n              mountPath: /etc/app/config\n              readOnly: true\n      volumes:\n        - name: config-volume\n          configMap:\n            name: app-config\n            items:\n              - key: app.properties\n                path: app.properties",
          caption: "ConfigMap as env and volume",
        },
      ],
    },
    {
      title: "Secrets - storing sensitive data",
      content: "**Secret** - an object for storing confidential data: passwords, tokens, TLS certificates, SSH keys.\n\n**Types of Secrets:**\n\n| type | Destination |\n|------|-----------|\n| `Opaque` | Arbitrary data (default) |\n| `kubernetes.io/tls` | TLS certificate + key |\n| `kubernetes.io/dockerconfigjson` | Credentials for Docker registry |\n| `kubernetes.io/basic-auth` | Username + password |\n| `kubernetes.io/ssh-auth` | SSH private key |\n\n**Safety Important:**\n\n- Secrets in etcd are stored **base64-encoded, NOT encrypted** (by default)\n- Enable **encryption at rest** for etcd in production\n- Use **External Secrets Operator** + Vault/AWS SSM for production\n- Do not commit Secrets to Git - Sealed Secrets or SOPS\n- RBAC: restrict access to Secrets\n\n**Usage is similar to ConfigMap:** env, volume mount, imagePullSecrets.",
      codes: [
        {
          language: "bash",
          code: "# Создание Secret\nkubectl create secret generic db-credentials \\\n  --from-literal=username=app \\\n  --from-literal=password=s3cret\n\nkubectl create secret docker-registry ghcr-secret \\\n  --docker-server=ghcr.io \\\n  --docker-username=myuser \\\n  --docker-password=glpat-xxx\n\nkubectl create secret tls example-tls \\\n  --cert=tls.crt --key=tls.key",
          caption: "Creation of Secrets",
        },
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: Secret\nmetadata:\n  name: db-credentials\ntype: Opaque\nstringData:          # автоматический base64 (предпочтительнее data:)\n  username: app\n  password: s3cret\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: app\nspec:\n  template:\n    spec:\n      imagePullSecrets:\n        - name: ghcr-secret\n      containers:\n        - name: app\n          env:\n            - name: DB_PASSWORD\n              valueFrom:\n                secretKeyRef:\n                  name: db-credentials\n                  key: password",
          caption: "Secret in Deployment",
        },
      ],
    },
    {
      title: "Namespaces - logical separation",
      content: "**Namespace**—virtual cluster inside a physical one. Isolates resources, RBAC, quotas.\n\n**Standard namespaces:**\n\n| Namespace | Destination |\n|-----------|-----------|\n| `default` | Resources without namespace |\n| `kube-system` | K8s components (CoreDNS, kube-proxy) |\n| `kube-public` | Public Resources |\n| `kube-node-lease` | Heartbeat node |\n\n**Typical structure:**\n\n```\nproduction     — prod workloads\nstaging        — pre-prod тестирование\ndevelopment    — dev окружение\nmonitoring     — Prometheus, Grafana\ningress-nginx  — Ingress Controller\ncert-manager   — TLS сертификаты\n```\n\n**Isolation between namespaces:**\n\n- By default, Pods from different namespaces **can** communicate via Service FQDN\n- NetworkPolicy can prohibit cross-namespace traffic\n- ResourceQuota limits resources per namespace\n- RBAC restricts access per namespace",
      codes: [
        {
          language: "bash",
          code: "# Управление namespaces\nkubectl create namespace production\nkubectl get namespaces\nkubectl config set-context --current --namespace=production\n\n# Все ресурсы в namespace\nkubectl get all -n production\n\n# ResourceQuota\nkubectl create quota prod-quota \\\n  --hard=cpu=10,memory=20Gi,pods=50 \\\n  -n production\n\n# LimitRange (defaults для контейнеров)\nkubectl apply -f - <<EOF\napiVersion: v1\nkind: LimitRange\nmetadata:\n  name: default-limits\n  namespace: production\nspec:\n  limits:\n    - default:\n        cpu: 500m\n        memory: 512Mi\n      defaultRequest:\n        cpu: 100m\n        memory: 128Mi\n      type: Container\nEOF",
          caption: "Namespaces and quotas",
        },
      ],
    },
    {
      title: "Resource requests and limits",
      content: "**Resource management** is a critical aspect of production K8s. Without requests/limits, the cluster degrades.\n\n**Requests vs Limits:**\n\n| | Requests | Limits |\n|---|----------|--------|\n| Destination | Minimum Guaranteed | Maximum consumption |\n| Scheduling | Scheduler takes into account requests | Does not affect scheduling |\n| CPU | Guaranteed time | Throttling when exceeded |\n| Memory | Guaranteed Memory | **OOM Kill** when exceeded |\n\n**QoS Classes (automatic):**\n\n| Class | Condition | Priority for eviction |\n|-------|---------|-----------------------|\n| **Guaranteed** | requests = limits for all containers | Last |\n| **Burstable** | requests < limits | Medium |\n| **BestEffort** | No requests/limits | First (OOM Kill) |\n\n**Recommendations:**\n\n- Always indicate requests and limits\n- Start with VPA (Vertical Pod Autoscaler) recommendations\n- CPU: requests = average consumption, limits = 2-4x requests\n- Memory: requests = limits (avoid OOM)\n- Use `kubectl top pods` to monitor real consumption",
      codes: [
        {
          language: "yaml",
          code: "resources:\n  requests:\n    cpu: 100m        # 0.1 CPU core\n    memory: 128Mi    # 128 Mebibytes\n  limits:\n    cpu: 500m        # 0.5 CPU core\n    memory: 512Mi\n\n# Расширенные ресурсы\nresources:\n  requests:\n    cpu: \"2\"\n    memory: 4Gi\n    ephemeral-storage: 1Gi\n  limits:\n    cpu: \"4\"\n    memory: 8Gi\n    ephemeral-storage: 2Gi\n    nvidia.com/gpu: 1    # GPU",
          caption: "Resource requests and limits",
        },
        {
          language: "bash",
          code: "# Мониторинг потребления\nkubectl top pods -n production\nkubectl top nodes\nkubectl describe node <node> | grep -A5 \"Allocated resources\"\n\n# VPA recommendation (если установлен)\nkubectl get vpa -n production",
          caption: "Resource monitoring",
        },
      ],
    },
    {
      title: "Health Probes — liveness, readiness, startup",
      content: "**Probes** is a mechanism for checking the health of containers. Kubelet periodically performs checks and reacts to the result.\n\n**Three types of probes:**\n\n| Probe | Question | Action in case of failure |\n|-------|--------|---------------------|\n| **Liveness** | Is the container alive? | Restarting the container |\n| **Readiness** | Ready to receive traffic? | Remove from Service endpoints |\n| **Startup** | Have you completed initialization? | Blocks liveness/readiness |\n\n**Types of probe handlers:**\n\n| Handler | Description |\n|---------|----------|\n| `httpGet` | HTTP GET request (most common) |\n| `tcpSocket` | TCP port connection |\n| `exec` | Executing a command in a container |\n| `grpc` | gRPC health check (K8s 1.24+) |\n\n**Probes parameters:**\n\n- `initialDelaySeconds` — delay before the first check\n- `periodSeconds` — interval between checks (default: 10)\n- `timeoutSeconds` — timeout (default: 1)\n- `failureThreshold` — failures before action (default: 3)\n- `successThreshold` — success for recovery (default: 1)\n\n**Typical mistakes:**\n\n- Liveness probe too aggressive → restart loop\n- No readiness probe → traffic to an unready Pod\n- One endpoint for liveness and readiness → cascading failures",
      codes: [
        {
          language: "yaml",
          code: "containers:\n  - name: app\n    image: myapp:1.0.0\n    ports:\n      - containerPort: 3000\n    startupProbe:\n      httpGet:\n        path: /health\n        port: 3000\n      failureThreshold: 30\n      periodSeconds: 10\n      # 30 * 10 = 300 сек на старт\n    livenessProbe:\n      httpGet:\n        path: /health\n        port: 3000\n      initialDelaySeconds: 0\n      periodSeconds: 10\n      timeoutSeconds: 5\n      failureThreshold: 3\n    readinessProbe:\n      httpGet:\n        path: /ready\n        port: 3000\n      initialDelaySeconds: 0\n      periodSeconds: 5\n      timeoutSeconds: 3\n      failureThreshold: 3\n      successThreshold: 1",
          caption: "All three types of probes",
        },
      ],
    },
    {
      title: "Rolling Updates - update strategy",
      content: "**Rolling Update** is the default Deployment strategy. Gradually replaces old Pods with new ones without downtime.\n\n**Rolling Update Process:**\n\n1. A new ReplicaSet is created with an updated Pod template\n2. The replicas of the new RS are increasing (maxSurge)\n3. Replicas of the old RS are reduced (maxUnavailable)\n4. The process is repeated until all Pods are updated\n5. The old ReplicaSet is saved (for rollback)\n\n**Strategy settings:**\n\n```\n\nyaml\nstrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 1          # +1 Pod сверх replicas\n    maxUnavailable: 0    # 0 Pod'ов недоступно (zero-downtime)\n```\n\n**Zero-downtime deployment requires:**\n\n- `maxUnavailable: 0` - old Pods are alive until new ones are ready\n- Readiness probe - new Pod receives traffic only when ready\n- Enough Node resources for maxSurge Pods\n\n**Tracking:**\n\n```\n\nbash\nkubectl rollout status deployment/web-app\nkubectl rollout history deployment/web-app\n```",
      codes: [
        {
          language: "bash",
          code: "# Обновление образа\nkubectl set image deployment/web-app app=myapp:2.0.0\nkubectl rollout status deployment/web-app --timeout=300s\n\n# Пауза и возобновление\nkubectl rollout pause deployment/web-app\nkubectl rollout resume deployment/web-app\n\n# Canary через аннотации (ручной)\nkubectl patch deployment web-app -p \\\n  '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"deployment.kubernetes.io/revision\":\"canary\"}}}}}'\n\n# Проверка ReplicaSet'ов\nkubectl get rs -l app=web-app",
          caption: "Managing rolling updates",
        },
      ],
    },
    {
      title: "Rollback - deployment rollback",
      content: "Kubernetes saves the history of ReplicaSets, which allows you to quickly roll back to a previous version.\n\n**Rollback mechanism:**\n\n1. Deployment stores `revisionHistoryLimit` (default: 10) of old ReplicaSets\n2. `kubectl rollout undo` switches to the previous ReplicaSet\n3. Rollback is also a rolling update (gradual replacement of Pods)\n\n**rollback scripts:**\n\n| Situation | Action |\n|----------|----------|\n| The new version crashes (CrashLoopBackOff) | `kubectl rollout undo` |\n| Errors in logs after deploy | `kubectl rollout undo` |\n| Performance degradation | `kubectl rollout undo` |\n| Need specific version | `kubectl rollout undo --to-revision=N` |\n\n**Automatic rollback:**\n\n```\n\nyaml\nspec:\n  minReadySeconds: 10\n  progressDeadlineSeconds: 600\n  revisionHistoryLimit: 5\n```\n\nArgoCD and Flagger provide automatic rollback based on metrics (error rate, latency).\n\n**Best practice:** each deploy via CI/CD with automatic smoke test. In case of failure - auto rollback.",
      codes: [
        {
          language: "bash",
          code: "# История ревизий\nkubectl rollout history deployment/web-app\nkubectl rollout history deployment/web-app --revision=3\n\n# Откат к предыдущей версии\nkubectl rollout undo deployment/web-app\n\n# Откат к конкретной ревизии\nkubectl rollout undo deployment/web-app --to-revision=2\n\n# Проверка после отката\nkubectl rollout status deployment/web-app\nkubectl get pods -l app=web-app -o wide\n\n# Записать причину (annotation)\nkubectl annotate deployment/web-app \\\n  kubernetes.io/change-cause=\"Rollback to v1.0.0 due to high error rate\"",
          caption: "Rollback Deployment",
        },
      ],
    },
    {
      title: "Practical workflow - application deployment",
      content: "Let's put together a complete workflow for deploying the application in K8s - from the image to the service accessible through Ingress.\n\n**Steps:**\n\n1. Build a Docker image and push it to the registry\n2. Create a Namespace\n3. Create a Secret (DB credentials, registry pull)\n4. Create ConfigMap (app config)\n5. Create Deployment (with probes, resources)\n6. Create a Service (ClusterIP)\n7. Create Ingress (external access)\n8. Check: rollout status, logs, curl\n\n**The order of apply is important** - dependencies must exist before dependent resources. Use `kustomization.yaml` or Helm to manage the order.\n\n**Directory structure:**\n\n```\nk8s/\n├── base/\n│   ├── namespace.yaml\n│   ├── configmap.yaml\n│   ├── secret.yaml\n│   ├── deployment.yaml\n│   ├── service.yaml\n│   └── ingress.yaml\n└── overlays/\n    ├── dev/\n    ├── staging/\n    └── production/\n```",
      codes: [
        {
          language: "bash",
          code: "# Полный деплой\nexport VERSION=1.0.0\nexport REGISTRY=ghcr.io/myorg/myapp\n\n# 1. Build & push\ndocker build -t $REGISTRY:$VERSION .\ndocker push $REGISTRY:$VERSION\n\n# 2. Deploy\nkubectl apply -f k8s/namespace.yaml\nkubectl apply -f k8s/secret.yaml -n production\nkubectl apply -f k8s/configmap.yaml -n production\nkubectl apply -f k8s/deployment.yaml -n production\nkubectl apply -f k8s/service.yaml -n production\nkubectl apply -f k8s/ingress.yaml -n production\n\n# 3. Verify\nkubectl rollout status deployment/web-app -n production\nkubectl get pods,svc,ingress -n production\nkubectl logs -l app=web-app -n production --tail=20\n\n# 4. Test\ncurl -H \"Host: api.example.com\" http://$(minikube ip)/health",
          caption: "Full deployment workflow",
        },
      ],
    },
  ],
  practice: [
    "Install minikube or kind and make sure kubectl works with the cluster",
    "Create a Pod manually, check logs and exec, then delete - explain why they don't do this in prod",
    "Nginx Deployment deployment with 3 replicas, check via kubectl get pods -o wide which nodes they are running on",
    "Create a ClusterIP Service and check DNS availability from a temporary curl-Pod",
    "Set up NodePort Service and access the application via minikube service or port-forward",
    "Install Ingress Controller, create Ingress with two path rules for different Services",
    "Create a ConfigMap and Secret, connect them to Deployment via env and volume mount",
    "Create a namespace production with ResourceQuota and LimitRange",
    "Add liveness, readiness and startup probes to Deployment - check the behavior in case of failure",
    "Perform a rolling update (change the image tag), then rollback to the previous revision",
  ],
  resources: [
    { title: "Kubernetes Documentation", url: "https://kubernetes.io/docs/home/" },
    { title: "Kubectl Cheat Sheet", url: "https://kubernetes.io/docs/reference/kubectl/quick-reference/" },
  ],
  quiz: [
    {
      question: "Which Kubernetes object provides the desired number of Pod replicas?",
      options: [
        "Deployment",
        "ConfigMap",
        "IngressClass",
        "PersistentVolume only",
      ],
      answer: "Deployment",
    },
    {
      question: "How is a Pod different from a container?",
      answer: "Pod is the minimum scheduling unit in K8s; it can contain one or more containers with a common network/volume.",
    },
    {
      question: "Why do you need a Service like ClusterIP?",
      options: [
        "Stable internal IP/DNS for access to Pod",
        "Publish externally via LoadBalancer automatically",
        "Keeping secrets",
        "Creating a namespace",
      ],
      answer: "Stable internal IP/DNS for access to Pod",
    },
    {
      question: "What does ConfigMap store?",
      options: [
        "Configuration data in the form of key-value",
        "Docker images",
        "TLS private key only in etcd plaintext",
        "Terraform State",
      ],
      answer: "Configuration data in the form of key-value",
    },
    {
      question: "Which command will show the Pod in all namespaces?",
      answer: "kubectl get pods -A or kubectl get pods --all-namespaces",
    },
    {
      question: "What does a liveness probe do?",
      options: [
        "Restarts the container if the check fails",
        "Removes Deployment",
        "Scales HPA",
        "Creates Ingress",
      ],
      answer: "Restarts the container if the check fails",
    },
    {
      question: "Why are labels and selectors needed?",
      answer: "Link objects (Service, Deployment) to the Pod group using labels.",
    },
  ],
}

export default translation
