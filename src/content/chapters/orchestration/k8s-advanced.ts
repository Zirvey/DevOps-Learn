import type { Chapter } from '../../../types'

export const k8sAdvancedChapter: Chapter = {
  id: 'kubernetes-advanced',
  slug: 'kubernetes-advanced',
  title: 'Kubernetes — продвинутый уровень',
  moduleId: 'orchestration',
  order: 1,
  duration: '8–10 часов',
  level: 'advanced',
  description:
    'Persistent storage, StatefulSets, HPA, RBAC, Network Policies и troubleshooting production-кластеров',
  sections: [
    {
      title: 'PersistentVolumes (PV) — тома кластера',
      content: `**PersistentVolume (PV)** — ресурс кластера, представляющий физическое хранилище. Создаётся администратором или динамически через StorageClass.

**Жизненный цикл PV:**

| Phase | Описание |
|-------|----------|
| \`Available\` | Свободен, готов к привязке |
| \`Bound\` | Привязан к PVC |
| \`Released\` | PVC удалён, PV освобождён |
| \`Failed\` | Автоматическое восстановление не удалось |

**Способы provisioning:**

- **Static** — администратор создаёт PV вручную
- **Dynamic** — StorageClass автоматически создаёт PV при создании PVC

**Reclaim Policy** — что делать с PV при удалении PVC:

| Policy | Поведение |
|--------|-----------|
| \`Retain\` | Данные сохраняются, PV нужно очистить вручную |
| \`Delete\` | PV и данные удаляются (default для dynamic) |
| \`Recycle\` | Deprecated — очистка и reuse |

**Access Modes:**

| Mode | Описание |
|------|----------|
| \`ReadWriteOnce (RWO)\` | Один Node, read-write (самый частый) |
| \`ReadOnlyMany (ROX)\` | Множество Node'ов, read-only |
| \`ReadWriteMany (RWX)\` | Множество Node'ов, read-write (NFS, EFS) |
| \`ReadWriteOncePod (RWOP)\` | Один Pod (K8s 1.22+) |`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs-data
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  storageClassName: nfs
  nfs:
    server: nfs-server.example.com
    path: /exports/data
---
# Local PV (для тестов)
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-local
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: local
  local:
    path: /mnt/data
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - worker-1`,
          caption: 'Static PersistentVolume',
        },
      ],
    },
    {
      title: 'PersistentVolumeClaims (PVC) — запрос хранилища',
      content: `**PersistentVolumeClaim (PVC)** — запрос на хранилище от пользователя/приложения. Kubernetes привязывает PVC к подходящему PV.

**Процесс binding:**

1. Пользователь создаёт PVC (размер, access mode, storage class)
2. Kubernetes ищет подходящий PV (размер ≥ запрос, access mode, storage class)
3. Если PV не найден и StorageClass поддерживает dynamic provisioning → создаётся новый PV
4. PVC переходит в статус \`Bound\`

**Использование в Pod:**

\`\`\`yaml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc
\`\`\`

**Важные моменты:**

- PVC привязан к namespace, PV — кластерный ресурс
- Удаление Pod **не удаляет** PVC и данные
- Расширение PVC (volume expansion) — если StorageClass поддерживает \`allowVolumeExpansion: true\`
- Snapshot'ы — VolumeSnapshot API для backup`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: production
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: 20Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  template:
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          volumeMounts:
            - name: pgdata
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: pgdata
          persistentVolumeClaim:
            claimName: postgres-pvc`,
          caption: 'PVC в Deployment',
        },
        {
          language: 'bash',
          code: `# Управление PVC
kubectl get pv,pvc -A
kubectl describe pvc postgres-pvc -n production

# Расширение PVC
kubectl patch pvc postgres-pvc -n production \\
  -p '{"spec":{"resources":{"requests":{"storage":"50Gi"}}}}'

# Snapshot (если CSI driver поддерживает)
kubectl get volumesnapshots
kubectl get volumesnapshotcontents`,
          caption: 'Управление PVC',
        },
      ],
    },
    {
      title: 'StorageClasses — динамическое provisioning',
      content: `**StorageClass** — описывает «класс» хранилища для dynamic provisioning. Аналог instance type для дисков.

**Параметры StorageClass:**

| Параметр | Описание |
|----------|----------|
| \`provisioner\` | CSI driver или in-tree provisioner |
| \`parameters\` | Параметры для provisioner (type, iops, zone) |
| \`reclaimPolicy\` | Retain или Delete |
| \`allowVolumeExpansion\` | Разрешить расширение PVC |
| \`volumeBindingMode\` | Immediate или WaitForFirstConsumer |
| \`mountOptions\` | Опции монтирования |

**Популярные provisioners:**

| Cloud | StorageClass | Provisioner |
|-------|-------------|-------------|
| AWS | gp3, io2 | ebs.csi.aws.com |
| GCP | pd-ssd, pd-standard | pd.csi.storage.gke.io |
| Azure | managed-premium | disk.csi.azure.com |
| On-prem | nfs, local | NFS provisioner, local-path |

**\`volumeBindingMode: WaitForFirstConsumer\`** — PV создаётся только когда Pod назначен на Node (важно для zone-aware scheduling).`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
  encrypted: "true"
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
provisioner: rancher.io/local-path
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer`,
          caption: 'StorageClass для AWS EBS и local-path',
        },
      ],
    },
    {
      title: 'StatefulSets — stateful приложения',
      content: `**StatefulSet** — контроллер для stateful приложений, требующих стабильной идентичности и персистентного хранилища.

**Отличия от Deployment:**

| | Deployment | StatefulSet |
|---|------------|-------------|
| Имена Pod'ов | Случайные (hash suffix) | Предсказуемые: app-0, app-1, app-2 |
| Порядок создания | Параллельно | Последовательно (0 → 1 → 2) |
| Порядок удаления | Параллельно | Обратный (2 → 1 → 0) |
| Storage | Shared или stateless | Уникальный PVC per Pod |
| Network identity | Общий Service | Headless Service + stable DNS |
| Scaling | Произвольно | С сохранением identity |

**Stable Network ID:**

\`\`\`
<pod-name>.<headless-service>.<namespace>.svc.cluster.local
postgres-0.postgres-headless.production.svc.cluster.local
\`\`\`

**Use cases:** PostgreSQL, MySQL, MongoDB, Kafka, ZooKeeper, Elasticsearch, Redis Cluster.

> Для production БД в K8s рассмотри managed services (RDS, Cloud SQL). StatefulSet — для случаев, когда managed недоступен.`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None          # headless service
  selector:
    app: postgres
  ports:
    - port: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          volumeMounts:
            - name: pgdata
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: pgdata
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: gp3
        resources:
          requests:
            storage: 20Gi`,
          caption: 'StatefulSet PostgreSQL с volumeClaimTemplates',
        },
        {
          language: 'bash',
          code: `# Управление StatefulSet
kubectl get statefulsets
kubectl get pods -l app=postgres    # postgres-0, postgres-1, postgres-2
kubectl get pvc                      # pgdata-postgres-0, pgdata-postgres-1, ...

# Масштабирование (последовательно!)
kubectl scale statefulset postgres --replicas=5

# Удаление (сохраняет PVC!)
kubectl delete statefulset postgres --cascade=orphan`,
          caption: 'Управление StatefulSet',
        },
      ],
    },
    {
      title: 'Horizontal Pod Autoscaler (HPA)',
      content: `**HPA** — автоматическое масштабирование количества Pod'ов на основе метрик.

**Поддерживаемые метрики:**

| Метрика | Источник | Пример |
|---------|----------|--------|
| CPU utilization | metrics-server | 70% CPU → scale up |
| Memory utilization | metrics-server | 80% memory → scale up |
| Custom metrics | Prometheus Adapter | requests/sec, queue depth |
| External metrics | CloudWatch, Datadog | SQS queue length |

**Как работает HPA:**

1. HPA controller каждые 15 сек проверяет метрики
2. Сравнивает текущее значение с target
3. Вычисляет желаемое количество реплик
4. Обновляет replicas в Deployment/StatefulSet

**Формула:** \`desiredReplicas = ceil(currentReplicas * currentMetric / targetMetric)\`

**Требования:**

- metrics-server установлен в кластере
- Resource requests указаны (для CPU/memory metrics)
- \`minReplicas\` ≥ 1

**Стабилизация:** scale-down с задержкой (default 300 сек), чтобы избежать flapping.`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
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
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15`,
          caption: 'HPA с CPU и memory метриками',
        },
        {
          language: 'bash',
          code: `# Установка metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Проверка HPA
kubectl get hpa
kubectl describe hpa web-app-hpa
kubectl top pods

# Нагрузочный тест для проверки autoscaling
kubectl run load-generator --image=busybox --rm -it --restart=Never -- \\
  sh -c "while true; do wget -q -O- http://web-app-service; done"`,
          caption: 'HPA диагностика и тестирование',
        },
      ],
    },
    {
      title: 'RBAC — Role-Based Access Control',
      content: `**RBAC** — механизм авторизации в Kubernetes. Определяет, кто (Subject) может выполнять какие действия (Verb) над какими ресурсами (Resource).

**Компоненты RBAC:**

| Объект | Scope | Описание |
|--------|-------|----------|
| **Role** | Namespace | Набор permissions в namespace |
| **ClusterRole** | Cluster | Набор permissions cluster-wide |
| **RoleBinding** | Namespace | Привязка Role к Subject |
| **ClusterRoleBinding** | Cluster | Привязка ClusterRole к Subject |

**Subjects:** User, Group, ServiceAccount

**Verbs:** get, list, watch, create, update, patch, delete, deletecollection

**Типичные роли:**

| Роль | Permissions |
|------|-------------|
| **view** | Read-only (get, list, watch) |
| **edit** | view + create, update, patch, delete |
| **admin** | edit + roles, bindings |
| **cluster-admin** | Полный доступ ко всему |

**ServiceAccount** — identity для Pod'ов. Каждый namespace имеет default ServiceAccount. Pod'ы используют SA для доступа к K8s API.

**Принцип least privilege:** давай минимально необходимые permissions.`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-role
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["configmaps", "secrets"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-rolebinding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: app-sa
    namespace: production
roleRef:
  kind: Role
  name: app-role
  apiGroup: rbac.authorization.k8s.io`,
          caption: 'ServiceAccount + Role + RoleBinding',
        },
        {
          language: 'bash',
          code: `# Проверка permissions
kubectl auth can-i create deployments --namespace=production
kubectl auth can-i delete pods --as=system:serviceaccount:production:app-sa

# Встроенные ClusterRoles
kubectl get clusterroles
kubectl describe clusterrole view

# Привязка встроенной роли
kubectl create rolebinding dev-edit \\
  --clusterrole=edit \\
  --user=dev@example.com \\
  --namespace=development`,
          caption: 'Проверка RBAC',
        },
      ],
    },
    {
      title: 'Network Policies — сетевая изоляция',
      content: `**NetworkPolicy** — firewall на уровне Pod'ов. Определяет, какой трафик разрешён входящий (ingress) и исходящий (egress).

**Требования:**

- CNI plugin с поддержкой NetworkPolicy (Calico, Cilium, Weave)
- Flannel **не поддерживает** NetworkPolicy

**Default behavior:** без NetworkPolicy — весь трафик разрешён. С NetworkPolicy — deny all + явные allow rules.

**Селекторы:**

- \`podSelector\` — Pod'ы, к которым применяется policy
- \`namespaceSelector\` — фильтр по namespace
- \`ipBlock\` — CIDR блоки (внешние IP)

**Типичные паттерны:**

| Policy | Описание |
|--------|----------|
| Deny all ingress | Блокировать весь входящий трафик |
| Allow from frontend | Backend принимает только от frontend namespace |
| Allow DNS | Разрешить egress на kube-dns (UDP 53) |
| Allow external API | Egress на конкретные CIDR |

**Zero-trust networking:** default deny + explicit allow для каждого сервиса.`,
      codes: [
        {
          language: 'yaml',
          code: `# Deny all ingress в namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
---
# Разрешить трафик только от frontend к backend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: frontend
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:                          # DNS
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53`,
          caption: 'NetworkPolicy — deny all + selective allow',
        },
      ],
    },
    {
      title: 'Troubleshooting — диагностика кластера',
      content: `Систематический подход к диагностике проблем в Kubernetes.

**Алгоритм troubleshooting:**

\`\`\`
1. kubectl get pods → статус Pod'а
2. kubectl describe pod → Events, Conditions
3. kubectl logs → ошибки приложения
4. kubectl exec → проверка внутри контейнера
5. kubectl get events → события кластера
6. kubectl get endpoints → Service → Pod binding
7. Network: dns lookup, curl, port-forward
\`\`\`

**Типичные статусы Pod'ов:**

| Status | Причина | Решение |
|--------|---------|---------|
| \`Pending\` | Нет ресурсов / PVC не bound | describe pod, проверить nodes/PVC |
| \`CrashLoopBackOff\` | Приложение падает при старте | logs, проверить config/secrets |
| \`ImagePullBackOff\` | Образ не найден / нет auth | Проверить image name, imagePullSecrets |
| \`OOMKilled\` | Превышен memory limit | Увеличить limits, оптимизировать app |
| \`Error\` | Контейнер завершился с ошибкой | logs предыдущего контейнера |
| \`CreateContainerConfigError\` | ConfigMap/Secret не найден | Проверить существование и имена |
| \`Pending (Unschedulable)\` | Нет подходящей Node | Taints, nodeSelector, resources |

**Полезные команды отладки:**

- \`kubectl logs --previous\` — логи предыдущего (упавшего) контейнера
- \`kubectl debug\` — ephemeral debug container
- \`kubectl cp\` — копирование файлов
- \`kubectl run tmp --rm -it --image=nicolaka/netshoot\` — сетевой debug toolbox`,
      codes: [
        {
          language: 'bash',
          code: `# Диагностика Pod
kubectl get pods -o wide
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous
kubectl logs <pod-name> -c <container-name>

# Debug container (K8s 1.23+)
kubectl debug <pod-name> -it --image=busybox --target=<container>

# Ephemeral debug container
kubectl run netshoot --rm -it --image=nicolaka/netshoot -- bash
# Внутри: nslookup, curl, tcpdump, dig

# События
kubectl get events --sort-by='.lastTimestamp' -A
kubectl get events --field-selector involvedObject.name=<pod-name>

# Service connectivity
kubectl get endpoints <service-name>
kubectl run curl --rm -it --image=curlimages/curl -- \\
  curl -v http://<service-name>.<namespace>.svc.cluster.local

# Node issues
kubectl describe node <node-name>
kubectl get pods -A --field-selector spec.nodeName=<node-name>
kubectl cordon <node-name>     # не планировать новые Pod'ы
kubectl drain <node-name>      # эвакуация Pod'ов`,
          caption: 'Полный набор troubleshooting команд',
        },
        {
          language: 'bash',
          code: `# CrashLoopBackOff — пошаговая диагностика
POD=my-app-abc123

# 1. События
kubectl describe pod $POD | tail -20

# 2. Логи текущего и предыдущего контейнера
kubectl logs $POD
kubectl logs $POD --previous

# 3. Проверить конфигурацию
kubectl get pod $POD -o yaml | grep -A20 "env:"
kubectl get configmap,secret -n $(kubectl get pod $POD -o jsonpath='{.metadata.namespace}')

# 4. Запустить образ вручную
kubectl run debug --rm -it --image=<same-image> --command -- sh`,
          caption: 'Диагностика CrashLoopBackOff',
        },
      ],
    },
    {
      title: 'DaemonSets — агент на каждой ноде',
      content: `**DaemonSet** — контроллер, гарантирующий запуск одного Pod'а на каждой Node (или на подмножестве нод по nodeSelector/affinity).

**Use cases:**

| Приложение | Зачем на каждой ноде |
|------------|---------------------|
| **node-exporter** | Сбор метрик хоста для Prometheus |
| **fluentd/fluent-bit** | Сбор логов с ноды |
| **kube-proxy** | Сетевая маршрутизация (системный) |
| **Calico/Cilium node agent** | CNI networking |
| **CSI driver node plugin** | Монтирование volumes |

**Отличия от Deployment:**

- Pod автоматически создаётся при добавлении новой Node
- Pod удаляется при удалении Node
- \`spec.template.spec.nodeSelector\` / \`affinity\` для выбора нод

**Обновление DaemonSet:** аналогично Deployment — RollingUpdate или OnDelete strategy.`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      hostNetwork: true
      hostPID: true
      tolerations:
        - operator: Exists    # запускать на tainted нодах тоже
      containers:
        - name: node-exporter
          image: prom/node-exporter:v1.7.0
          ports:
            - containerPort: 9100
          resources:
            requests:
              cpu: 50m
              memory: 64Mi`,
          caption: 'DaemonSet node-exporter для Prometheus',
        },
      ],
    },
    {
      title: 'Jobs и CronJobs — batch-задачи',
      content: `**Job** — контроллер для одноразовых задач, которые должны завершиться успешно (exit 0).

**CronJob** — Job по расписанию (cron syntax).

**Когда использовать:**

| Тип | Пример |
|-----|--------|
| Job | Миграция БД, batch-обработка, data import |
| CronJob | Ежедневный backup, очистка кэша, отчёты, certificate renewal |

**Параметры Job:**

| Параметр | Описание |
|----------|----------|
| \`completions\` | Сколько успешных завершений нужно (default: 1) |
| \`parallelism\` | Сколько Pod'ов параллельно (default: 1) |
| \`backoffLimit\` | Попыток перед failure (default: 6) |
| \`activeDeadlineSeconds\` | Максимальное время выполнения |
| \`ttlSecondsAfterFinished\` | Автоудаление Job после завершения |

**CronJob schedule:** стандартный cron — \`0 2 * * *\` (каждый день в 02:00 UTC).`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: db-backup
  namespace: production
spec:
  schedule: "0 3 * * *"
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      backoffLimit: 2
      ttlSecondsAfterFinished: 86400
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: postgres:16-alpine
              command:
                - sh
                - -c
                - pg_dump -h postgres-0.postgres-headless -U app mydb | gzip > /backup/dump.sql.gz
              volumeMounts:
                - name: backup
                  mountPath: /backup
          volumes:
            - name: backup
              persistentVolumeClaim:
                claimName: backup-pvc`,
          caption: 'CronJob — ежедневный backup PostgreSQL',
        },
        {
          language: 'bash',
          code: `# Управление Jobs
kubectl get jobs,cronjobs -A
kubectl create job manual-backup --from=cronjob/db-backup -n production
kubectl logs job/manual-backup -n production
kubectl delete job manual-backup -n production`,
          caption: 'Управление Jobs и CronJobs',
        },
      ],
    },
    {
      title: 'Custom Resources и Operators',
      content: `**Custom Resource Definitions (CRD)** — расширение K8s API пользовательскими типами ресурсов. **Operator** — контроллер, управляющий custom resources.

**Паттерн Operator:**

1. Определяешь CRD (например, \`PostgreSQL\`, \`RedisCluster\`)
2. Пишешь Operator (Go + controller-runtime, или Kopf/Python)
3. Пользователь создаёт custom resource YAML
4. Operator reconciles desired state → создаёт Pod'ы, Services, PVC

**Популярные Operators:**

| Operator | CRD | Назначение |
|----------|-----|------------|
| **Prometheus Operator** | ServiceMonitor, PrometheusRule | Monitoring stack |
| **Cert Manager** | Certificate, ClusterIssuer | TLS certificates |
| **Strimzi** | Kafka | Apache Kafka clusters |
| **Zalando Postgres Operator** | postgresql | PostgreSQL HA |
| **External Secrets Operator** | ExternalSecret | Sync secrets from Vault/AWS |

**Зачем знать DevOps-инженеру:** большинство production K8s-кластеров используют Operators. Ты не пишешь их, но деплоишь и конфигурируешь через CRD YAML.

\`\`\`bash
kubectl get crd
kubectl api-resources | grep cert-manager
kubectl get certificates -A
\`\`\``,
    },
    {
      title: 'Production patterns и best practices',
      content: `Сводка production-паттернов для K8s-кластеров.

**Pod Disruption Budget (PDB):**

Гарантирует минимальное количество доступных Pod'ов при voluntary disruption (node drain, cluster upgrade).

\`\`\`yaml
minAvailable: 2    # или maxUnavailable: 1
\`\`\`

**Pod Topology Spread Constraints:**

Распределение Pod'ов по зонам/нодам для high availability.

**Resource management:**

- Всегда requests + limits
- LimitRange для namespace defaults
- ResourceQuota per namespace/team

**Security:**

- Pod Security Standards (restricted/baseline)
- NetworkPolicy default deny
- RBAC least privilege
- No root containers
- Read-only root filesystem
- Seccomp/AppArmor profiles

**Observability:**

- Structured logging → centralized (ELK, Loki)
- Prometheus metrics + Grafana dashboards
- Distributed tracing (Jaeger, Tempo)
- Alerting (Alertmanager, PagerDuty)

**GitOps:**

- ArgoCD или Flux для continuous deployment
- Все изменения через Git PR
- Automated sync + rollback`,
      codes: [
        {
          language: 'yaml',
          code: `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: web-app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  template:
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: web-app
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
        - name: app
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]`,
          caption: 'PDB, topology spread, security context',
        },
      ],
    },
  ],
  practice: [
    'Создай StorageClass и PVC, подключи к Pod — убедись, что данные сохраняются при пересоздании Pod',
    'Задеплой StatefulSet с 3 репликами, проверь стабильные имена Pod и DNS (pod-0.headless-svc)',
    'Настрой HPA для Deployment, установи metrics-server и проверь autoscaling под нагрузкой',
    'Создай ServiceAccount, Role и RoleBinding — проверь permissions через kubectl auth can-i',
    'Напиши NetworkPolicy: deny all ingress + allow только от frontend namespace',
    'Проведи диагностику CrashLoopBackOff Pod: найди причину через describe, logs --previous, exec',
    'Создай PodDisruptionBudget и выполни kubectl drain на ноде — убедись, что minAvailable соблюдается',
    'Настрой volume expansion: увеличь PVC и проверь, что файловая система расширилась',
  ],
  resources: [
    { title: 'Kubernetes Production Best Practices', url: 'https://kubernetes.io/docs/setup/best-practices/' },
    { title: 'CNCF Cloud Native Trail Map', url: 'https://github.com/cncf/trailmap' },
  ],
}
