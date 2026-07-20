import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `Amazon EKS: Kubernetes on AWS`,
  duration: `8–10 hours`,
  description: `Create an EKS cluster, node groups, kubectl, deploy apps, Ingress, and Helm`,
  sections: [
    {
      title: `What is Amazon EKS`,
      content: `**Amazon EKS (Elastic Kubernetes Service)** is managed Kubernetes from AWS. AWS manages the control plane (API server, etcd, scheduler, controller manager); you manage worker nodes and workloads.

**Why EKS instead of self-managed K8s on EC2:**
- Control plane is managed, HA across 3 AZs (AWS owns uptime)
- Automatic Kubernetes version updates
- AWS integrations: IAM, VPC, ALB, ECR, CloudWatch
- **EKS Anywhere** — the same K8s on-premise
- **EKS Fargate** — serverless nodes (no EC2 management)

**Cost:**
- Control plane: **$0.10/hour** (~$73/mo) — even for an empty cluster
- Worker nodes: EC2/Fargate pricing
- Data transfer, EBS, NAT Gateway — extra

**Alternatives:** GKE (Google), AKS (Azure), self-managed (kubeadm), k3s (lightweight).`,
    },
    {
      title: `EKS architecture`,
      content: `**Control Plane (managed by AWS):**
- API Server — endpoint for kubectl
- etcd — cluster state store
- Scheduler — assigns pods to nodes
- Controller Manager — reconciliation loops
- Runs in AWS-managed subnets (you do not see them)

**Data Plane (managed by you):**
- **Managed Node Group** — AWS creates and updates EC2 instances
- **Self-managed nodes** — you manage ASG and AMI
- **Fargate** — serverless, per-pod billing

**Networking:**
- The cluster runs in **your VPC subnets**
- Pod networking: **VPC CNI** (each pod gets an IP from the VPC subnet)
- Service networking: **kube-proxy** + ClusterIP / NodePort / LoadBalancer

**EKS Endpoint:** public (internet access) and/or private (VPC only).`,
    },
    {
      title: `Prep: tools and prerequisites`,
      content: `**Required tools:**
- **aws CLI v2** — auth and management
- **kubectl** — talk to the cluster
- **eksctl** — CLI to create/manage EKS (recommended)
- **helm** — package manager for K8s
- **Docker** — build images

**AWS prerequisites:**
- VPC with subnets in at least 2 AZs
- IAM permissions: eks:*, ec2:*, iam:*
- Quotas: at least 2 EC2 instances for nodes`,
      code: {
        language: `bash`,
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
        caption: `Installing tools for EKS`,
      },
    },
    {
      title: `Creating an EKS cluster with eksctl`,
      content: `**eksctl** is the simplest way to create EKS. One command creates the VPC, cluster, node group, and IAM roles.

**ClusterConfig** — a YAML file for declarative creation (recommended for production instead of CLI flags).`,
      code: {
        language: `yaml`,
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
        caption: `ClusterConfig for eksctl`,
      },
    },
    {
      title: `Creating the cluster: commands`,
      content: `After creating the cluster, eksctl automatically updates \`~/.kube/config\`.`,
      code: {
        language: `bash`,
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
        caption: `Create and delete an EKS cluster`,
      },
    },
    {
      title: `Node Groups: Managed vs Self-managed vs Fargate`,
      content: `**Managed Node Group (MNG):**
- AWS creates the ASG, launch template, and updates nodes
- Rolling update when changing AMI/K8s version
- Recommended for most cases

**Self-managed:**
- You create the ASG, bootstrap script, and update manually
- More control, more work
- For special AMIs/requirements

**Fargate:**
- No EC2 instances — AWS runs the pod as a serverless container
- Pay for vCPU/memory per pod
- Good for batch jobs, low-traffic services
- Limits: no DaemonSets, no privileged containers

**Choosing instance type:**
- Dev: t3.medium (2 vCPU, 4 GB)
- Prod general: m6i.large (2 vCPU, 8 GB)
- Memory-heavy: r6i.large
- Spot instances: up to 70% savings (for fault-tolerant workloads)`,
      code: {
        language: `bash`,
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
      title: `kubectl and cluster access`,
      content: `**kubeconfig** — file with credentials and the cluster endpoint. Usually \`~/.kube/config\`.

**aws eks update-kubeconfig** — adds/updates the context for an EKS cluster. Uses IAM for auth (not client certificates).

**aws-auth ConfigMap** — maps IAM roles/users → K8s RBAC. Without an aws-auth entry, an IAM user cannot work with the cluster.`,
      code: {
        language: `bash`,
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
        caption: `Configuring kubectl for EKS`,
      },
    },
    {
      title: `IAM for EKS: IRSA and RBAC`,
      content: `**IRSA (IAM Roles for Service Accounts)** — a pod gets temporary AWS credentials via an OIDC provider. No hardcoded keys.

**How it works:**
1. The EKS cluster has an OIDC provider
2. The ServiceAccount is annotated with an IAM Role ARN
3. The pod uses a projected volume token
4. The AWS SDK assumes the role automatically

**RBAC in EKS:**
- **aws-auth ConfigMap** — IAM → K8s groups mapping
- **Roles/RoleBindings** — permissions inside the cluster
- **EKS Access Entries** (newer API) — replacement for aws-auth`,
      code: {
        language: `yaml`,
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
        caption: `IRSA — pod with S3 access`,
      },
    },
    {
      title: `ECR: Container Registry on AWS`,
      content: `**ECR (Elastic Container Registry)** — private Docker registry in AWS. Integrates with EKS via IAM.

**Workflow:**
1. Create an ECR repository
2. Build a Docker image locally
3. Tag the image with the ECR URI
4. Push to ECR (aws ecr get-login-password)
5. Deploy to EKS with the image from ECR`,
      code: {
        language: `bash`,
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
        caption: `Push an image to ECR`,
      },
    },
    {
      title: `Deploying an application to EKS`,
      content: `Full deploy cycle: Deployment → Service → verify.

**Deployment** — declarative pod management (replicas, rolling update, rollback).
**Service** — stable endpoint for pods (ClusterIP, NodePort, LoadBalancer).`,
      code: {
        language: `yaml`,
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
        caption: `Deployment + Service`,
      },
    },
    {
      title: `Ingress and AWS Load Balancer Controller`,
      content: `**Ingress** — routes HTTP/HTTPS traffic into the cluster. On AWS, Ingress creates an **ALB** automatically via the **AWS Load Balancer Controller**.

**Install:**
1. IAM policy for the controller
2. IRSA ServiceAccount
3. Helm install aws-load-balancer-controller
4. Ingress resource with annotations`,
      code: {
        language: `bash`,
        code: `# Установка AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \\
  -n kube-system \\
  --set clusterName=devops-handbook \\
  --set serviceAccount.create=false \\
  --set serviceAccount.name=aws-load-balancer-controller`,
        caption: `Install ALB Controller via Helm`,
      },
    },
    {
      title: `Ingress resource for ALB`,
      content: `After creating Ingress, AWS automatically creates an ALB. The DNS name appears in status.`,
      code: {
        language: `yaml`,
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
        caption: `Ingress with ALB and HTTPS`,
      },
    },
    {
      title: `Helm: package manager for Kubernetes`,
      content: `**Helm** manages K8s apps as packages (charts). Instead of dozens of YAML files — one chart with values.

**Core commands:**
- \`helm repo add\` — add a chart repository
- \`helm install\` — install a chart
- \`helm upgrade\` — upgrade a release
- \`helm rollback\` — roll back
- \`helm uninstall\` — remove`,
      code: {
        language: `bash`,
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
        caption: `Helm basics`,
      },
    },
    {
      title: `Monitoring EKS: metrics-server and CloudWatch`,
      content: `**metrics-server** — collect CPU/memory metrics for \`kubectl top\` and HPA (Horizontal Pod Autoscaler).

**Container Insights** — CloudWatch agent for pod metrics and logs.

**Install metrics-server:**
\`kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml\`

**HPA** — automatically scale pods by CPU/memory/custom metrics.`,
      code: {
        language: `yaml`,
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
        caption: `HPA — autoscaling by CPU`,
      },
    },
    {
      title: `Lab: full deploy on EKS`,
      content: `**Goal:** from zero to a working app with HTTPS on EKS.

**Steps:**
1. \`eksctl create cluster -f cluster.yaml\` (15 min)
2. Create an ECR repo, build & push a Docker image
3. Deploy: \`kubectl apply -f deployment.yaml\`
4. Install AWS Load Balancer Controller (Helm)
5. Create an ACM certificate, Ingress with HTTPS
6. Route 53: alias record → ALB DNS
7. Verify: \`curl https://app.example.com/health\`
8. Configure HPA, test autoscaling: \`kubectl run load --image=busybox ...\`
9. **Delete the cluster:** \`eksctl delete cluster\` (~$73/mo control plane!)

This lab combines EKS, ECR, ALB, Route 53, Helm — a full production workflow.`,
    },
  ],
  practice: [
    `Install aws CLI, kubectl, eksctl, helm`,
    `Create an EKS cluster with eksctl (remember to delete it after!)`,
    `Configure kubeconfig, verify kubectl get nodes`,
    `Create an ECR repo, build and push a Docker image`,
    `Deploy the app: Deployment + Service + Ingress`,
    `Install AWS Load Balancer Controller, configure HTTPS`,
    `Complete the “full deploy on EKS” lab`,
  ],
  resources: [
    { title: `EKS User Guide`, url: `https://docs.aws.amazon.com/eks/latest/userguide/` },
    { title: `eksctl Documentation`, url: `https://eksctl.io` },
    { title: `AWS Load Balancer Controller`, url: `https://kubernetes-sigs.github.io/aws-load-balancer-controller/` },
    { title: `EKS Best Practices`, url: `https://aws.github.io/aws-eks-best-practices/` },
  ],
  quiz: [
    {
      question: `What is EKS?`,
      options: [
        `A managed Kubernetes control plane from AWS`,
        `Only managed node groups with no API`,
        `A serverless database`,
        `A CDN for static assets`,
      ],
      answer: `A managed Kubernetes control plane from AWS`,
    },
    {
      question: `Who manages the control plane in EKS?`,
      answer: `AWS; the customer manages worker nodes, add-ons, and workloads.`,
    },
    {
      question: `What is aws-load-balancer-controller for?`,
      options: [
        `Creating ALB/NLB for Service/Ingress in EKS`,
        `Collecting logs to CloudWatch only`,
        `Installing Helm without RBAC`,
        `Creating an S3 bucket`,
      ],
      answer: `Creating ALB/NLB for Service/Ingress in EKS`,
    },
    {
      question: `How does a managed node group differ from self-managed?`,
      options: [
        `AWS manages the EC2 lifecycle in the group (updates, scaling hooks)`,
        `Self-managed cannot autoscale`,
        `Managed node group has no kubelet`,
        `There is no difference`,
      ],
      answer: `AWS manages the EC2 lifecycle in the group (updates, scaling hooks)`,
    },
    {
      question: `How does a Pod get IAM permissions in EKS?`,
      answer: `Via IRSA (IAM Roles for Service Accounts) with the cluster OIDC provider.`,
    },
    {
      question: `Why place worker nodes in a private subnet?`,
      options: [
        `Reduce attack surface; outbound traffic via NAT`,
        `Speed up image pulls without NAT`,
        `Disable RBAC`,
        `A hard EKS requirement for all clusters with no exceptions`,
      ],
      answer: `Reduce attack surface; outbound traffic via NAT`,
    },
  ],
}

export default translation
