import type { Chapter } from '../../../types'

export const awsEksChapter: Chapter = {
  id: 'aws-eks',
  slug: 'aws-eks',
  title: 'Amazon EKS: Kubernetes в AWS',
  moduleId: 'cloud',
  order: 2,
  duration: '8–10 часов',
  level: 'advanced',
  description:
    'Создание EKS-кластера, node groups, kubectl, деплой приложений, Ingress и Helm',
  sections: [
    {
      title: 'Что такое Amazon EKS',
      content: `**Amazon EKS (Elastic Kubernetes Service)** — managed Kubernetes от AWS. AWS управляет control plane (API server, etcd, scheduler, controller manager), ты управляешь worker nodes и workloads.

**Зачем EKS, а не self-managed K8s на EC2:**
- Control plane — managed, HA across 3 AZ (AWS отвечает за uptime)
- Автоматические обновления Kubernetes version
- Интеграция с AWS: IAM, VPC, ALB, ECR, CloudWatch
- **EKS Anywhere** — тот же K8s on-premise
- **EKS Fargate** — serverless nodes (без управления EC2)

**Стоимость:**
- Control plane: **$0.10/час** (~$73/мес) — даже для пустого кластера
- Worker nodes: EC2/Fargate pricing
- Data transfer, EBS, NAT Gateway — дополнительно

**Альтернативы:** GKE (Google), AKS (Azure), self-managed (kubeadm), k3s (lightweight).`,
    },
    {
      title: 'Архитектура EKS',
      content: `**Control Plane (managed by AWS):**
- API Server — endpoint для kubectl
- etcd — хранилище состояния кластера
- Scheduler — назначение pods на nodes
- Controller Manager — reconciliation loops
- Размещён в AWS-управляемых subnets (не видишь)

**Data Plane (managed by you):**
- **Managed Node Group** — AWS создаёт и обновляет EC2 instances
- **Self-managed nodes** — ты управляешь ASG и AMI
- **Fargate** — serverless, per-pod billing

**Networking:**
- Кластер размещается в **твоих VPC subnets**
- Pod networking: **VPC CNI** (каждый pod получает IP из VPC subnet)
- Service networking: **kube-proxy** + ClusterIP / NodePort / LoadBalancer

**EKS Endpoint:** public (доступ из интернета) и/или private (только из VPC).`,
    },
    {
      title: 'Подготовка: инструменты и prerequisites',
      content: `**Необходимые инструменты:**
- **aws CLI v2** — аутентификация и управление
- **kubectl** — взаимодействие с кластером
- **eksctl** — CLI для создания/управления EKS (рекомендуется)
- **helm** — package manager для K8s
- **Docker** — сборка образов

**AWS prerequisites:**
- VPC с subnets в минимум 2 AZ
- IAM permissions: eks:*, ec2:*, iam:*
- Квоты: минимум 2 EC2 instances для nodes`,
      code: {
        language: 'bash',
        code: `# Установка инструментов (macOS)
brew install awscli kubectl eksctl helm

# Проверка версий
aws --version
kubectl version --client
eksctl version
helm version

# Настройка kubectl автодополнения
echo 'source <(kubectl completion zsh)' >> ~/.zshrc

# Проверка AWS credentials
aws sts get-caller-identity`,
        caption: 'Установка инструментов для EKS',
      },
    },
    {
      title: 'Создание EKS-кластера с eksctl',
      content: `**eksctl** — самый простой способ создать EKS. Одна команда создаёт VPC, кластер, node group, IAM roles.

**ClusterConfig** — YAML-файл для декларативного создания (рекомендуется для production вместо CLI flags).`,
      code: {
        language: 'yaml',
        code: `# cluster.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: devops-handbook
  region: eu-central-1
  version: "1.29"

vpc:
  cidr: 10.1.0.0/16
  nat:
    gateway: Single  # или HighlyAvailable для prod

managedNodeGroups:
  - name: ng-default
    instanceType: t3.medium
    desiredCapacity: 2
    minSize: 1
    maxSize: 4
    volumeSize: 30
    labels:
      role: general
    tags:
      Environment: dev

iam:
  withOIDC: true  # для IRSA (IAM Roles for Service Accounts)

cloudWatch:
  clusterLogging:
    enableTypes: ["api", "audit", "authenticator"]`,
        caption: 'ClusterConfig для eksctl',
      },
    },
    {
      title: 'Создание кластера: команды',
      content: `После создания кластера eksctl автоматически обновит \`~/.kube/config\`.`,
      code: {
        language: 'bash',
        code: `# Создать кластер из конфига
eksctl create cluster -f cluster.yaml
# Время: 15-20 минут

# Или быстрый способ (dev)
eksctl create cluster \\
  --name dev-cluster \\
  --region eu-central-1 \\
  --nodegroup-name workers \\
  --node-type t3.medium \\
  --nodes 2 \\
  --nodes-min 1 \\
  --nodes-max 4

# Проверить кластер
eksctl get cluster
kubectl get nodes
kubectl get pods -A

# Удалить кластер (ВАЖНО — экономия!)
eksctl delete cluster --name devops-handbook`,
        caption: 'Создание и удаление EKS кластера',
      },
    },
    {
      title: 'Node Groups: Managed vs Self-managed vs Fargate',
      content: `**Managed Node Group (MNG):**
- AWS создаёт ASG, launch template, обновляет nodes
- Rolling update при смене AMI/K8s version
- Рекомендуется для большинства случаев

**Self-managed:**
- Ты создаёшь ASG, bootstrap script, обновляешь вручную
- Больше контроля, больше работы
- Для специфических AMI/requirements

**Fargate:**
- Нет EC2 instances — AWS запускает pod как serverless container
- Платишь за vCPU/memory per pod
- Подходит для batch jobs, low-traffic services
- Ограничения: нет DaemonSets, нет privileged containers

**Выбор instance type:**
- Dev: t3.medium (2 vCPU, 4 GB)
- Prod general: m6i.large (2 vCPU, 8 GB)
- Memory-heavy: r6i.large
- Spot instances: до 70% экономии (для fault-tolerant workloads)`,
      code: {
        language: 'bash',
        code: `# Добавить node group
eksctl create nodegroup \\
  --cluster devops-handbook \\
  --name ng-spot \\
  --node-type t3.medium \\
  --nodes 2 \\
  --spot \\
  --instance-types t3.medium,t3.large

# Масштабирование
eksctl scale nodegroup \\
  --cluster devops-handbook \\
  --name ng-default \\
  --nodes 3

# Обновление K8s version
eksctl upgrade cluster --name devops-handbook --version 1.30
eksctl upgrade nodegroup --cluster devops-handbook --name ng-default`,
      },
    },
    {
      title: 'kubectl и доступ к кластеру',
      content: `**kubeconfig** — файл с credentials и endpoint кластера. Обычно \`~/.kube/config\`.

**aws eks update-kubeconfig** — добавляет/обновляет context для EKS кластера. Использует IAM для аутентификации (не client certificates).

**aws-auth ConfigMap** — маппинг IAM roles/users → K8s RBAC. Без записи в aws-auth IAM user не сможет работать с кластером.`,
      code: {
        language: 'bash',
        code: `# Настроить kubeconfig
aws eks update-kubeconfig \\
  --name devops-handbook \\
  --region eu-central-1

# Переключение context
kubectl config get-contexts
kubectl config use-context arn:aws:eks:eu-central-1:123:cluster/devops-handbook

# Базовые команды
kubectl get nodes -o wide
kubectl get pods -A
kubectl describe node <node-name>
kubectl top nodes  # требует metrics-server

# Проверка доступа
kubectl auth can-i create deployments
kubectl auth can-i '*' '*' --as=system:serviceaccount:default:default`,
        caption: 'Настройка kubectl для EKS',
      },
    },
    {
      title: 'IAM для EKS: IRSA и RBAC',
      content: `**IRSA (IAM Roles for Service Accounts)** — pod получает временные AWS credentials через OIDC provider. Без hardcoded keys.

**Как работает:**
1. EKS кластер имеет OIDC provider
2. ServiceAccount аннотирован IAM Role ARN
3. Pod использует projected volume token
4. AWS SDK автоматически assume role

**RBAC в EKS:**
- **aws-auth ConfigMap** — маппинг IAM → K8s groups
- **Roles/RoleBindings** — permissions внутри кластера
- **EKS Access Entries** (новый API) — замена aws-auth`,
      code: {
        language: 'yaml',
        code: `# ServiceAccount с IRSA
apiVersion: v1
kind: ServiceAccount
metadata:
  name: s3-reader
  namespace: default
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/eks-s3-reader
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-s3
spec:
  template:
    spec:
      serviceAccountName: s3-reader
      containers:
        - name: app
          image: my-app:latest
          env:
            - name: AWS_REGION
              value: eu-central-1`,
        caption: 'IRSA — pod с доступом к S3',
      },
    },
    {
      title: 'ECR: Container Registry в AWS',
      content: `**ECR (Elastic Container Registry)** — private Docker registry в AWS. Интегрирован с EKS через IAM.

**Workflow:**
1. Создай ECR repository
2. Build Docker image локально
3. Tag image с ECR URI
4. Push в ECR (aws ecr get-login-password)
5. Deploy в EKS с image из ECR`,
      code: {
        language: 'bash',
        code: `# Создать ECR repository
aws ecr create-repository --repository-name my-app --region eu-central-1

# Login в ECR
aws ecr get-login-password --region eu-central-1 | \\
  docker login --username AWS --password-stdin \\
  123456789012.dkr.ecr.eu-central-1.amazonaws.com

# Build, tag, push
docker build -t my-app:v1.0.0 .
docker tag my-app:v1.0.0 \\
  123456789012.dkr.ecr.eu-central-1.amazonaws.com/my-app:v1.0.0
docker push 123456789012.dkr.ecr.eu-central-1.amazonaws.com/my-app:v1.0.0`,
        caption: 'Push образа в ECR',
      },
    },
    {
      title: 'Деплой приложения в EKS',
      content: `Полный цикл деплоя: Deployment → Service → проверка.

**Deployment** — декларативное управление pods (replicas, rolling update, rollback).
**Service** — стабильный endpoint для pods (ClusterIP, NodePort, LoadBalancer).`,
      code: {
        language: 'yaml',
        code: `# deployment.yaml
apiVersion: apps/v1
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
        - name: web
          image: 123456789012.dkr.ecr.eu-central-1.amazonaws.com/my-app:v1.0.0
          ports:
            - containerPort: 8080
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
              port: 8080
            initialDelaySeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP`,
        caption: 'Deployment + Service',
      },
    },
    {
      title: 'Ingress и AWS Load Balancer Controller',
      content: `**Ingress** — маршрутизация HTTP/HTTPS трафика в кластер. В AWS Ingress создаёт **ALB** автоматически через **AWS Load Balancer Controller**.

**Установка:**
1. IAM policy для controller
2. IRSA ServiceAccount
3. Helm install aws-load-balancer-controller
4. Ingress resource с annotations`,
      code: {
        language: 'bash',
        code: `# Установка AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \\
  -n kube-system \\
  --set clusterName=devops-handbook \\
  --set serviceAccount.create=false \\
  --set serviceAccount.name=aws-load-balancer-controller`,
        caption: 'Установка ALB Controller через Helm',
      },
    },
    {
      title: 'Ingress resource для ALB',
      content: `После создания Ingress AWS автоматически создаст ALB. DNS name появится в status.`,
      code: {
        language: 'yaml',
        code: `# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:eu-central-1:123:certificate/abc
    alb.ingress.kubernetes.io/healthcheck-path: /health
spec:
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80`,
        caption: 'Ingress с ALB и HTTPS',
      },
    },
    {
      title: 'Helm: package manager для Kubernetes',
      content: `**Helm** — управление K8s приложениями как пакетами (charts). Вместо десятков YAML файлов — один chart с values.

**Основные команды:**
- \`helm repo add\` — добавить chart repository
- \`helm install\` — установить chart
- \`helm upgrade\` — обновить release
- \`helm rollback\` — откатить
- \`helm uninstall\` — удалить`,
      code: {
        language: 'bash',
        code: `# Установить nginx через Helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-nginx bitnami/nginx \\
  --set service.type=LoadBalancer \\
  --set replicaCount=2

# Кастомные values
helm install my-app ./charts/my-app -f values-prod.yaml

# Обновление
helm upgrade my-nginx bitnami/nginx --set replicaCount=3

# Откат
helm rollback my-nginx 1

# Список releases
helm list -A`,
        caption: 'Helm basics',
      },
    },
    {
      title: 'Мониторинг EKS: metrics-server и CloudWatch',
      content: `**metrics-server** — сбор CPU/memory metrics для \`kubectl top\` и HPA (Horizontal Pod Autoscaler).

**Container Insights** — CloudWatch agent для метрик и логов pods.

**Установка metrics-server:**
\`kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml\`

**HPA** — автоматическое масштабирование pods по CPU/memory/custom metrics.`,
      code: {
        language: 'yaml',
        code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`,
        caption: 'HPA — автомасштабирование по CPU',
      },
    },
    {
      title: 'Лабораторная: полный деплой на EKS',
      content: `**Цель:** от нуля до работающего приложения с HTTPS на EKS.

**Шаги:**
1. \`eksctl create cluster -f cluster.yaml\` (15 мин)
2. Создай ECR repo, build & push Docker image
3. Deploy: \`kubectl apply -f deployment.yaml\`
4. Установи AWS Load Balancer Controller (Helm)
5. Создай ACM certificate, Ingress с HTTPS
6. Route 53: alias record → ALB DNS
7. Проверь: \`curl https://app.example.com/health\`
8. Настрой HPA, проверь autoscaling: \`kubectl run load --image=busybox ...\`
9. **Удали кластер:** \`eksctl delete cluster\` (~$73/мес control plane!)

Эта лабораторная объединяет EKS, ECR, ALB, Route 53, Helm — полный production workflow.`,
    },
  ],
  practice: [
    'Установи aws CLI, kubectl, eksctl, helm',
    'Создай EKS кластер через eksctl (не забудь удалить после!)',
    'Настрой kubeconfig, проверь kubectl get nodes',
    'Создай ECR repo, собери и запушь Docker image',
    'Задеплой приложение: Deployment + Service + Ingress',
    'Установи AWS Load Balancer Controller, настрой HTTPS',
    'Пройди лабораторную «полный деплой на EKS»',
  ],
  resources: [
    { title: 'EKS User Guide', url: 'https://docs.aws.amazon.com/eks/latest/userguide/' },
    { title: 'eksctl Documentation', url: 'https://eksctl.io' },
    { title: 'AWS Load Balancer Controller', url: 'https://kubernetes-sigs.github.io/aws-load-balancer-controller/' },
    { title: 'EKS Best Practices', url: 'https://aws.github.io/aws-eks-best-practices/' },
  ],
}
