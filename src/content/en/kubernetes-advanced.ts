import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: "Kubernetes — advanced",
  duration: "8–10 hours",
  description: "Persistent storage, StatefulSets, HPA, RBAC, Network Policies and troubleshooting production clusters",
  sections: [
    {
      title: "PersistentVolumes (PV) - cluster volumes",
      content: "**PersistentVolume (PV)** is a cluster resource that represents physical storage. Created by the administrator or dynamically via StorageClass.\n\n**PV life cycle:**\n\n| Phase | Description |\n|-------|----------|\n| `Available` | Free, ready to bind |\n| `Bound` | Tied to PVC |\n| `Released` | PVC removed, PV released |\n| `Failed` | Automatic recovery failed |\n\n**Provisioning methods:**\n\n- **Static** — administrator creates PV manually\n- **Dynamic** - StorageClass automatically creates PV when creating PVC\n\n**Reclaim Policy** - what to do with PV when deleting PVC:\n\n| Policy | Behavior |\n|--------|----------|\n| `Retain` | Data is saved, PV needs to be cleared manually |\n| `Delete` | PV and data are deleted (default for dynamic) |\n| `Recycle` | Deprecated - cleaning and reuse |\n\n**Access Modes:**\n\n| Mode | Description |\n|------|----------|\n| `ReadWriteOnce(RWO)` | One Node, read-write (most common) |\n| `ReadOnlyMany(ROX)` | Lots of Nodes, read-only |\n| `ReadWriteMany(RWX)` | Lots of Nodes, read-write (NFS, EFS) |\n| `ReadWriteOncePod (RWOP)` | One Pod (K8s 1.22+) |",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: PersistentVolume\nmetadata:\n  name: pv-nfs-data\nspec:\n  capacity:\n    storage: 10Gi\n  accessModes:\n    - ReadWriteMany\n  persistentVolumeReclaimPolicy: Retain\n  storageClassName: nfs\n  nfs:\n    server: nfs-server.example.com\n    path: /exports/data\n---\n# Local PV (для тестов)\napiVersion: v1\nkind: PersistentVolume\nmetadata:\n  name: pv-local\nspec:\n  capacity:\n    storage: 5Gi\n  accessModes:\n    - ReadWriteOnce\n  storageClassName: local\n  local:\n    path: /mnt/data\n  nodeAffinity:\n    required:\n      nodeSelectorTerms:\n        - matchExpressions:\n            - key: kubernetes.io/hostname\n              operator: In\n              values:\n                - worker-1",
          caption: "Static PersistentVolume",
        },
      ],
    },
    {
      title: "PersistentVolumeClaims (PVC) - storage request",
      content: "**PersistentVolumeClaim (PVC)** - storage request from a user/application. Kubernetes binds the PVC to the appropriate PV.\n\n**binding process:**\n\n1. The user creates a PVC (size, access mode, storage class)\n2. Kubernetes searches for a suitable PV (size ≥ request, access mode, storage class)\n3. If the PV is not found and the StorageClass supports dynamic provisioning → a new PV is created\n4. PVC goes into `Bound` status\n\n**Use in Pod:**\n\n```\n\nyaml\nvolumes:\n  - name: data\n    persistentVolumeClaim:\n      claimName: my-pvc\n```\n\n**Important points:**\n\n- PVC is tied to namespace, PV is a cluster resource\n- Removing a Pod **does not delete** PVC and data\n- PVC expansion (volume expansion) - if the StorageClass supports `allowVolumeExpansion: true`\n- Snapshots - VolumeSnapshot API for backup",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: postgres-pvc\n  namespace: production\nspec:\n  accessModes:\n    - ReadWriteOnce\n  storageClassName: gp3\n  resources:\n    requests:\n      storage: 20Gi\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: postgres\nspec:\n  template:\n    spec:\n      containers:\n        - name: postgres\n          image: postgres:16-alpine\n          volumeMounts:\n            - name: pgdata\n              mountPath: /var/lib/postgresql/data\n      volumes:\n        - name: pgdata\n          persistentVolumeClaim:\n            claimName: postgres-pvc",
          caption: "PVC in Deployment",
        },
        {
          language: "bash",
          code: "# Управление PVC\nkubectl get pv,pvc -A\nkubectl describe pvc postgres-pvc -n production\n\n# Расширение PVC\nkubectl patch pvc postgres-pvc -n production \\\n  -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"50Gi\"}}}}'\n\n# Snapshot (если CSI driver поддерживает)\nkubectl get volumesnapshots\nkubectl get volumesnapshotcontents",
          caption: "PVC management",
        },
      ],
    },
    {
      title: "StorageClasses - dynamic provisioning",
      content: "**StorageClass** - describes the storage “class” for dynamic provisioning. Analogous to instance type for disks.\n\n**StorageClass parameters:**\n\n| Parameter | Description |\n|----------|----------|\n| `provisioner` | CSI driver or in-tree provisioner |\n| `parameters` | Parameters for provisioner (type, iops, zone) |\n| `reclaimPolicy` | Retain or Delete |\n| `allowVolumeExpansion` | Allow PVC extension |\n| `volumeBindingMode` | Immediate or WaitForFirstConsumer |\n| `mountOptions` | Mount Options |\n\n**Popular provisioners:**\n\n| Cloud | StorageClass | Provisioner |\n|-------|------------|------------|\n| AWS | gp3, io2 | ebs.csi.aws.com |\n| GCP | pd-ssd, pd-standard | pd.csi.storage.gke.io |\n| Azure | managed-premium | disk.csi.azure.com |\n| On-prem | nfs, local | NFS provisioner, local-path |\n\n**`volumeBindingMode: WaitForFirstConsumer`** - PV is created only when a Pod is assigned to a Node (important for zone-aware scheduling).",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: gp3\n  annotations:\n    storageclass.kubernetes.io/is-default-class: \"true\"\nprovisioner: ebs.csi.aws.com\nparameters:\n  type: gp3\n  iops: \"3000\"\n  throughput: \"125\"\n  encrypted: \"true\"\nreclaimPolicy: Delete\nallowVolumeExpansion: true\nvolumeBindingMode: WaitForFirstConsumer\n---\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: local-path\nprovisioner: rancher.io/local-path\nreclaimPolicy: Delete\nvolumeBindingMode: WaitForFirstConsumer",
          caption: "StorageClass for AWS EBS and local-path",
        },
      ],
    },
    {
      title: "StatefulSets - stateful applications",
      content: "**StatefulSet** is a controller for stateful applications that require stable identity and persistent storage.\n\n**Differences from Deployment:**\n\n| | Deployment | StatefulSet |\n|---|-----------|------------|\n| Pod names | Random (hash suffix) | Predictable: app-0, app-1, app-2 |\n| Creation order | In parallel | Sequentially (0 → 1 → 2) |\n| Removal procedure | In parallel | Reverse (2 → 1 → 0) |\n| Storage | Shared or stateless | Unique PVC per Pod |\n| Network identity | General Service | Headless Service + stable DNS |\n| Scaling | Randomly | With preservation of identity |\n\n**Stable Network ID:**\n\n```\n<pod-name>.<headless-service>.<namespace>.svc.cluster.local\npostgres-0.postgres-headless.production.svc.cluster.local\n```\n\n**Use cases:** PostgreSQL, MySQL, MongoDB, Kafka, ZooKeeper, Elasticsearch, Redis Cluster.\n\n> For a production database in K8s, consider managed services (RDS, Cloud SQL). StatefulSet - for cases when managed is not available.",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: Service\nmetadata:\n  name: postgres-headless\nspec:\n  clusterIP: None          # headless service\n  selector:\n    app: postgres\n  ports:\n    - port: 5432\n---\napiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: postgres\nspec:\n  serviceName: postgres-headless\n  replicas: 3\n  selector:\n    matchLabels:\n      app: postgres\n  template:\n    metadata:\n      labels:\n        app: postgres\n    spec:\n      containers:\n        - name: postgres\n          image: postgres:16-alpine\n          ports:\n            - containerPort: 5432\n          env:\n            - name: POSTGRES_PASSWORD\n              valueFrom:\n                secretKeyRef:\n                  name: postgres-secret\n                  key: password\n            - name: PGDATA\n              value: /var/lib/postgresql/data/pgdata\n          volumeMounts:\n            - name: pgdata\n              mountPath: /var/lib/postgresql/data\n  volumeClaimTemplates:\n    - metadata:\n        name: pgdata\n      spec:\n        accessModes: [\"ReadWriteOnce\"]\n        storageClassName: gp3\n        resources:\n          requests:\n            storage: 20Gi",
          caption: "StatefulSet PostgreSQL with volumeClaimTemplates",
        },
        {
          language: "bash",
          code: "# Управление StatefulSet\nkubectl get statefulsets\nkubectl get pods -l app=postgres    # postgres-0, postgres-1, postgres-2\nkubectl get pvc                      # pgdata-postgres-0, pgdata-postgres-1, ...\n\n# Масштабирование (последовательно!)\nkubectl scale statefulset postgres --replicas=5\n\n# Удаление (сохраняет PVC!)\nkubectl delete statefulset postgres --cascade=orphan",
          caption: "StatefulSet Management",
        },
      ],
    },
    {
      title: "Horizontal Pod Autoscaler (HPA)",
      content: "**HPA** - automatic scaling of the number of Pods based on metrics.\n\n**Supported metrics:**\n\n| Metric | Source | Example |\n|---------|----------|--------|\n| CPU utilization | metrics-server | 70% CPU → scale up |\n| Memory utilization | metrics-server | 80% memory → scale up |\n| Custom metrics | Prometheus Adapter | requests/sec, queue depth |\n| External metrics | CloudWatch, Datadog | SQS queue length |\n\n**How HPA works:**\n\n1. HPA controller checks metrics every 15 seconds\n2. Compares the current value with target\n3. Calculates the desired number of replicas\n4. Updates replicas in Deployment/StatefulSet\n\n**Formula:** `desiredReplicas = ceil(currentReplicas * currentMetric / targetMetric)`\n\n**Requirements:**\n\n- metrics-server is installed in the cluster\n- Resource requests are specified (for CPU/memory metrics)\n- `minReplicas` ≥ 1\n\n**Stabilization:** scale-down with delay (default 300 sec) to avoid flapping.",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: web-app-hpa\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: web-app\n  minReplicas: 2\n  maxReplicas: 10\n  metrics:\n    - type: Resource\n      resource:\n        name: cpu\n        target:\n          type: Utilization\n          averageUtilization: 70\n    - type: Resource\n      resource:\n        name: memory\n        target:\n          type: Utilization\n          averageUtilization: 80\n  behavior:\n    scaleDown:\n      stabilizationWindowSeconds: 300\n      policies:\n        - type: Percent\n          value: 10\n          periodSeconds: 60\n    scaleUp:\n      stabilizationWindowSeconds: 0\n      policies:\n        - type: Percent\n          value: 100\n          periodSeconds: 15",
          caption: "HPA with CPU and memory metrics",
        },
        {
          language: "bash",
          code: "# Установка metrics-server\nkubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml\n\n# Проверка HPA\nkubectl get hpa\nkubectl describe hpa web-app-hpa\nkubectl top pods\n\n# Нагрузочный тест для проверки autoscaling\nkubectl run load-generator --image=busybox --rm -it --restart=Never -- \\\n  sh -c \"while true; do wget -q -O- http://web-app-service; done\"",
          caption: "HPA diagnostics and testing",
        },
      ],
    },
    {
      title: "RBAC — Role-Based Access Control",
      content: "**RBAC** is an authorization mechanism in Kubernetes. Determines who (Subject) can perform which actions (Verb) on which resources (Resource).\n\n**RBAC Components:**\n\n| Object | Scope | Description |\n|--------|-------|----------|\n| **Role** | Namespace | Set permissions in namespace |\n| **ClusterRole** | Cluster | Set permissions cluster-wide |\n| **RoleBinding** | Namespace | Binding Role to Subject |\n| **ClusterRoleBinding** | Cluster | Binding ClusterRole to Subject |\n\n**Subjects:** User, Group, ServiceAccount\n\n**Verbs:** get, list, watch, create, update, patch, delete, deletecollection\n\n**Typical Roles:**\n\n| Role | Permissions |\n|------|------------|\n| **view** | Read-only (get, list, watch) |\n| **edit** | view + create, update, patch, delete |\n| **admin** | edit + roles, bindings |\n| **cluster-admin** | Full access to everything |\n\n**ServiceAccount** — identity for Pods. Each namespace has a default ServiceAccount. Pods use SA to access the K8s API.\n\n**Least privilege principle:** Give the minimum necessary permissions.",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: app-sa\n  namespace: production\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata:\n  name: app-role\n  namespace: production\nrules:\n  - apiGroups: [\"\"]\n    resources: [\"configmaps\", \"secrets\"]\n    verbs: [\"get\", \"list\", \"watch\"]\n  - apiGroups: [\"\"]\n    resources: [\"pods\"]\n    verbs: [\"get\", \"list\"]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata:\n  name: app-rolebinding\n  namespace: production\nsubjects:\n  - kind: ServiceAccount\n    name: app-sa\n    namespace: production\nroleRef:\n  kind: Role\n  name: app-role\n  apiGroup: rbac.authorization.k8s.io",
          caption: "ServiceAccount + Role + RoleBinding",
        },
        {
          language: "bash",
          code: "# Проверка permissions\nkubectl auth can-i create deployments --namespace=production\nkubectl auth can-i delete pods --as=system:serviceaccount:production:app-sa\n\n# Встроенные ClusterRoles\nkubectl get clusterroles\nkubectl describe clusterrole view\n\n# Привязка встроенной роли\nkubectl create rolebinding dev-edit \\\n  --clusterrole=edit \\\n  --user=dev@example.com \\\n  --namespace=development",
          caption: "RBAC check",
        },
      ],
    },
    {
      title: "Network Policies - network isolation",
      content: "**NetworkPolicy** - firewall at the Pod level. Determines what traffic is allowed incoming (ingress) and outgoing (egress).\n\n**Requirements:**\n\n- CNI plugin with NetworkPolicy support (Calico, Cilium, Weave)\n- Flannel **does not support** NetworkPolicy\n\n**Default behavior:** without NetworkPolicy - all traffic is allowed. With NetworkPolicy - deny all + explicit allow rules.\n\n**Selectors:**\n\n- `podSelector` — Pods to which the policy applies\n- `namespaceSelector` - filter by namespace\n- `ipBlock` - CIDR blocks (external IP)\n\n**Typical patterns:**\n\n| Policy | Description |\n|--------|----------|\n| Deny all ingress | Block all incoming traffic |\n| Allow from frontend | Backend only accepts from frontend namespace |\n| Allow DNS | Allow egress on kube-dns (UDP 53) |\n| Allow external API | Egress to specific CIDRs |\n\n**Zero-trust networking:** default deny + explicit allow for each service.",
      codes: [
        {
          language: "yaml",
          code: "# Deny all ingress в namespace\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: deny-all-ingress\n  namespace: production\nspec:\n  podSelector: {}\n  policyTypes:\n    - Ingress\n---\n# Разрешить трафик только от frontend к backend\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: backend-policy\n  namespace: production\nspec:\n  podSelector:\n    matchLabels:\n      app: backend\n  policyTypes:\n    - Ingress\n    - Egress\n  ingress:\n    - from:\n        - namespaceSelector:\n            matchLabels:\n              name: frontend\n        - podSelector:\n            matchLabels:\n              app: frontend\n      ports:\n        - protocol: TCP\n          port: 3000\n  egress:\n    - to:\n        - podSelector:\n            matchLabels:\n              app: postgres\n      ports:\n        - protocol: TCP\n          port: 5432\n    - to:                          # DNS\n        - namespaceSelector: {}\n          podSelector:\n            matchLabels:\n              k8s-app: kube-dns\n      ports:\n        - protocol: UDP\n          port: 53",
          caption: "NetworkPolicy — deny all + selective allow",
        },
      ],
    },
    {
      title: "Troubleshooting - cluster diagnostics",
      content: "A systematic approach to diagnosing problems in Kubernetes.\n\n**Troubleshooting algorithm:**\n\n```\n1. kubectl get pods → статус Pod'а\n2. kubectl describe pod → Events, Conditions\n3. kubectl logs → ошибки приложения\n4. kubectl exec → проверка внутри контейнера\n5. kubectl get events → события кластера\n6. kubectl get endpoints → Service → Pod binding\n7. Network: dns lookup, curl, port-forward\n```\n\n**Typical Pod statuses:**\n\n| Status | Reason | Solution |\n|--------|---------|---------|\n| `Pending` | No resources / PVC is not bound | describe pod, check nodes/PVC |\n| `CrashLoopBackOff` | The application crashes on startup | logs, check config/secrets |\n| `ImagePullBackOff` | Image not found / no auth | Check image name, imagePullSecrets |\n| `OOMKilled` | Memory limit exceeded | Increase limits, optimize app |\n| `Error` | Container failed with error | logs of the previous container |\n| `CreateContainerConfigError` | ConfigMap/Secret not found | Check existence and names |\n| `Pending (Unschedulable)` | No suitable Node | Taints, nodeSelector, resources |\n\n**Useful debugging commands:**\n\n- `kubectl logs --previous` — logs of the previous (fallen) container\n- `kubectl debug` — ephemeral debug container\n- `kubectl cp` - copying files\n- `kubectl run tmp --rm -it --image=nicolaka/netshoot` - network debug toolbox",
      codes: [
        {
          language: "bash",
          code: "# Диагностика Pod\nkubectl get pods -o wide\nkubectl describe pod <pod-name>\nkubectl logs <pod-name> --previous\nkubectl logs <pod-name> -c <container-name>\n\n# Debug container (K8s 1.23+)\nkubectl debug <pod-name> -it --image=busybox --target=<container>\n\n# Ephemeral debug container\nkubectl run netshoot --rm -it --image=nicolaka/netshoot -- bash\n# Внутри: nslookup, curl, tcpdump, dig\n\n# События\nkubectl get events --sort-by='.lastTimestamp' -A\nkubectl get events --field-selector involvedObject.name=<pod-name>\n\n# Service connectivity\nkubectl get endpoints <service-name>\nkubectl run curl --rm -it --image=curlimages/curl -- \\\n  curl -v http://<service-name>.<namespace>.svc.cluster.local\n\n# Node issues\nkubectl describe node <node-name>\nkubectl get pods -A --field-selector spec.nodeName=<node-name>\nkubectl cordon <node-name>     # не планировать новые Pod'ы\nkubectl drain <node-name>      # эвакуация Pod'ов",
          caption: "Full set of troubleshooting commands",
        },
        {
          language: "bash",
          code: "# CrashLoopBackOff — пошаговая диагностика\nPOD=my-app-abc123\n\n# 1. События\nkubectl describe pod $POD | tail -20\n\n# 2. Логи текущего и предыдущего контейнера\nkubectl logs $POD\nkubectl logs $POD --previous\n\n# 3. Проверить конфигурацию\nkubectl get pod $POD -o yaml | grep -A20 \"env:\"\nkubectl get configmap,secret -n $(kubectl get pod $POD -o jsonpath='{.metadata.namespace}')\n\n# 4. Запустить образ вручную\nkubectl run debug --rm -it --image=<same-image> --command -- sh",
          caption: "Diagnostics CrashLoopBackOff",
        },
      ],
    },
    {
      title: "DaemonSets - agent on each node",
      content: "**DaemonSet** is a controller that guarantees the launch of one Pod on each Node (or on a subset of nodes by nodeSelector/affinity).\n\n**Use cases:**\n\n| Application | Why on every node |\n|------------|---------------------|\n| **node-exporter** | Collecting Host Metrics for Prometheus |\n| **fluentd/fluent-bit** | Collecting logs from a node |\n| **kube-proxy** | Network Routing (System) |\n| **Calico/Cilium node agent** | CNI networking |\n| **CSI driver node plugin** | Mount volumes |\n\n**Differences from Deployment:**\n\n- Pod is automatically created when adding a new Node\n- Pod is deleted when Node is deleted\n- `spec.template.spec.nodeSelector` / `affinity` for selecting nodes\n\n**DaemonSet update:** similar to Deployment - RollingUpdate or OnDelete strategy.",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: apps/v1\nkind: DaemonSet\nmetadata:\n  name: node-exporter\n  namespace: monitoring\nspec:\n  selector:\n    matchLabels:\n      app: node-exporter\n  template:\n    metadata:\n      labels:\n        app: node-exporter\n    spec:\n      hostNetwork: true\n      hostPID: true\n      tolerations:\n        - operator: Exists    # запускать на tainted нодах тоже\n      containers:\n        - name: node-exporter\n          image: prom/node-exporter:v1.7.0\n          ports:\n            - containerPort: 9100\n          resources:\n            requests:\n              cpu: 50m\n              memory: 64Mi",
          caption: "DaemonSet node-exporter for Prometheus",
        },
      ],
    },
    {
      title: "Jobs and CronJobs - batch tasks",
      content: "**Job** is a controller for one-time tasks that must complete successfully (exit 0).\n\n**CronJob** — Scheduled Job (cron syntax).\n\n**When to use:**\n\n| Type | Example |\n|----------|--------|\n| Job | Database migration, batch processing, data import |\n| CronJob | Daily backup, cache clearing, reports, certificate renewal |\n\n**Job parameters:**\n\n| Parameter | Description |\n|----------|----------|\n| `completions` | How many successes are needed (default: 1) |\n| `parallelism` | How many Pods in parallel (default: 1) |\n| `backoffLimit` | Attempts before failure (default: 6) |\n| `activeDeadlineSeconds` | Maximum execution time |\n| `ttlSecondsAfterFinished` | Automatic removal of Job after completion |\n\n**CronJob schedule:** standard cron - `0 2 * * *` (every day at 02:00 UTC).",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: db-backup\n  namespace: production\nspec:\n  schedule: \"0 3 * * *\"\n  concurrencyPolicy: Forbid\n  successfulJobsHistoryLimit: 3\n  failedJobsHistoryLimit: 1\n  jobTemplate:\n    spec:\n      backoffLimit: 2\n      ttlSecondsAfterFinished: 86400\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n            - name: backup\n              image: postgres:16-alpine\n              command:\n                - sh\n                - -c\n                - pg_dump -h postgres-0.postgres-headless -U app mydb | gzip > /backup/dump.sql.gz\n              volumeMounts:\n                - name: backup\n                  mountPath: /backup\n          volumes:\n            - name: backup\n              persistentVolumeClaim:\n                claimName: backup-pvc",
          caption: "CronJob - daily PostgreSQL backup",
        },
        {
          language: "bash",
          code: "# Управление Jobs\nkubectl get jobs,cronjobs -A\nkubectl create job manual-backup --from=cronjob/db-backup -n production\nkubectl logs job/manual-backup -n production\nkubectl delete job manual-backup -n production",
          caption: "Managing Jobs and CronJobs",
        },
      ],
    },
    {
      title: "Custom Resources and Operators",
      content: "**Custom Resource Definitions (CRD)** - extension of the K8s API with custom resource types. **Operator** — controller that manages custom resources.\n\n**Operator Pattern:**\n\n1. Define a CRD (for example, `PostgreSQL`, `RedisCluster`)\n2. Write Operator (Go + controller-runtime, or Kopf/Python)\n3. The user creates a custom resource YAML\n4. Operator reconciles desired state → creates Pods, Services, PVC\n\n**Popular Operators:**\n\n| Operator | CRD | Destination |\n|----------|-----|-----------|\n| **Prometheus Operator** | ServiceMonitor, PrometheusRule | Monitoring stack |\n| **Cert Manager** | Certificate, ClusterIssuer | TLS certificates |\n| **Strimzi** | Kafka | Apache Kafka clusters |\n| **Zalando Postgres Operator** | postgresql | PostgreSQL HA |\n| **External Secrets Operator** | ExternalSecret | Sync secrets from Vault/AWS |\n\n**Why should a DevOps engineer know:** most production K8s clusters use Operators. You don't write them, but you deploy and configure them via CRD YAML.\n\n```\n\nbash\nkubectl get crd\nkubectl api-resources | grep cert-manager\nkubectl get certificates -A\n```",
    },
    {
      title: "Production patterns and best practices",
      content: "Summary of production patterns for K8s clusters.\n\n**Pod Disruption Budget (PDB):**\n\nGuarantees the minimum number of available Pods during voluntary disruption (node drain, cluster upgrade).\n\n```\n\nyaml\nminAvailable: 2    # или maxUnavailable: 1\n```\n\n**Pod Topology Spread Constraints:**\n\nDistribution of Pods by zones/nodes for high availability.\n\n**Resource management:**\n\n- Always requests + limits\n- LimitRange for namespace defaults\n- ResourceQuota per namespace/team\n\n**Security:**\n\n- Pod Security Standards (restricted/baseline)\n- NetworkPolicy default deny\n- RBAC least privilege\n- No root containers\n- Read-only root filesystem\n- Seccomp/AppArmor profiles\n\n**Observability:**\n\n- Structured logging → centralized (ELK, Loki)\n- Prometheus metrics + Grafana dashboards\n- Distributed tracing (Jaeger, Tempo)\n- Alerting (Alertmanager, PagerDuty)\n\n**GitOps:**\n\n- ArgoCD or Flux for continuous deployment\n- All changes via Git PR\n- Automated sync + rollback",
      codes: [
        {
          language: "yaml",
          code: "apiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: web-app-pdb\nspec:\n  minAvailable: 2\n  selector:\n    matchLabels:\n      app: web-app\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-app\nspec:\n  template:\n    spec:\n      topologySpreadConstraints:\n        - maxSkew: 1\n          topologyKey: topology.kubernetes.io/zone\n          whenUnsatisfiable: DoNotSchedule\n          labelSelector:\n            matchLabels:\n              app: web-app\n      securityContext:\n        runAsNonRoot: true\n        runAsUser: 1001\n        fsGroup: 1001\n      containers:\n        - name: app\n          securityContext:\n            allowPrivilegeEscalation: false\n            readOnlyRootFilesystem: true\n            capabilities:\n              drop: [\"ALL\"]",
          caption: "PDB, topology spread, security context",
        },
      ],
    },
  ],
  practice: [
    "Create a StorageClass and PVC, connect to the Pod - make sure the data is saved when the Pod is recreated",
    "Deploy StatefulSet with 3 replicas, check stable Pod and DNS names (pod-0.headless-svc)",
    "Set up HPA for Deployment, install metrics-server and test autoscaling under load",
    "Create a ServiceAccount, Role and RoleBinding - check permissions via kubectl auth can-i",
    "Write NetworkPolicy: deny all ingress + allow only from frontend namespace",
    "Run CrashLoopBackOff Pod diagnostics: find the cause using describe, logs --previous, exec",
    "Create a PodDisruptionBudget and run kubectl drain on the node - make sure minAvailable is met",
    "Volume expansion setting: increase PVC and check that the file system has expanded",
  ],
  resources: [
    { title: "Kubernetes Production Best Practices", url: "https://kubernetes.io/docs/setup/best-practices/" },
    { title: "CNCF Cloud Native Trail Map", url: "https://github.com/cncf/trailmap" },
  ],
  quiz: [
    {
      question: "What does Horizontal Pod Autoscaler (HPA) do?",
      options: [
        "Scales the number of Pods by metrics (CPU, custom, etc.)",
        "Increases CPU limits on the node",
        "Creates a new cluster",
        "Rotates TLS certificates",
      ],
      answer: "Scales the number of Pods by metrics (CPU, custom, etc.)",
    },
    {
      question: "How is StatefulSet different from Deployment?",
      answer: "StatefulSet provides stable Pod names, ordered rollouts, and bound PVCs for stateful applications.",
    },
    {
      question: "What is NetworkPolicy used for?",
      options: [
        "Limiting network traffic between Pods at the cluster level",
        "Setting up DNS outside the cluster",
        "Collecting logs in Loki",
        "IAM User RBAC Management",
      ],
      answer: "Limiting network traffic between Pods at the cluster level",
    },
    {
      question: "What are taints and tolerances?",
      answer: "Taints push Pod away from the node; tolerations allow Pods to be scheduled on tainted nodes.",
    },
    {
      question: "Why do you need a PodDisruptionBudget (PDB)?",
      options: [
        "Limit the number of simultaneously unavailable Pods during voluntary disruption",
        "Deny all Deployment updates",
        "Keep backup etcd",
        "Configure Ingress TLS",
      ],
      answer: "Limit the number of simultaneously unavailable Pods during voluntary disruption",
    },
    {
      question: "What does kubectl drain node do?",
      answer: "Evacuates a Pod from a node (taking into account the PDB) for maintenance or removal of the node from the cluster.",
    },
  ],
}

export default translation
