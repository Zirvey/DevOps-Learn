import type { Chapter } from '../../../types'

export const interviewsChapter: Chapter = {
  id: 'interviews',
  slug: 'interviews',
  title: 'Собеседования: 35+ вопросов с ответами',
  moduleId: 'career',
  order: 1,
  duration: '4–6 часов',
  level: 'intermediate',
  description:
    '35+ типичных вопросов DevOps-собеседований с подробными ответами: Linux, Docker, K8s, CI/CD, AWS, networking',
  sections: [
    {
      title: '1. Что происходит при выполнении curl https://google.com?',
      content: `**Полный путь запроса:**

1. **DNS Resolution** — curl вызывает \`getaddrinfo("google.com")\`. Resolver проверяет /etc/resolv.conf → DNS server (8.8.8.8 или ISP). DNS возвращает A-record (IP-адрес).

2. **TCP Handshake** — SYN → SYN-ACK → ACK на порт 443.

3. **TLS Handshake** — ClientHello → ServerHello → Certificate → Key Exchange → Finished. Проверка сертификата (CA chain, expiry, hostname).

4. **HTTP Request** — \`GET / HTTP/1.1\\nHost: google.com\\n...\`

5. **Server Processing** — Google LB → backend server → response.

6. **HTTP Response** — 301/302 redirect или 200 OK с HTML.

7. **Connection close** — TLS close_notify, TCP FIN.

**Для DevOps важно:** DNS (dig), TCP (tcpdump), TLS (openssl s_client), HTTP (curl -v).`,
    },
    {
      title: '2. В чём разница между CMD и ENTRYPOINT в Docker?',
      content: `**ENTRYPOINT** — основная команда контейнера (не перезаписывается, только дополняется).
**CMD** — аргументы по умолчанию для ENTRYPOINT (перезаписываются полностью).

\`\`\`dockerfile
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]
# docker run image → python app.py --port 8080
# docker run image --port 3000 → python app.py --port 3000

ENTRYPOINT ["python", "app.py"]
# docker run image bash → python app.py bash (bash = аргумент!)
\`\`\`

**Best practice:** ENTRYPOINT для фиксированной команды, CMD для default args. Используй exec form (\`["cmd", "arg"]\`), не shell form (\`cmd arg\`).`,
    },
    {
      title: '3. Что произойдёт, если pod упадёт? Как Deployment это обработает?',
      content: `**Цепочка событий:**

1. Container process завершается (exit code ≠ 0 или OOMKilled)
2. **kubelet** на node детектит container exit
3. Если **restartPolicy: Always** (default для Deployment) — kubelet перезапускает container в том же pod
4. Если pod в состоянии CrashLoopBackOff (слишком много рестартов) — exponential backoff
5. **Deployment controller** видит, что available replicas < desired → создаёт новый pod
6. **Scheduler** назначает новый pod на node с достаточными ресурсами
7. **kubelet** запускает containers, **readinessProbe** проверяет готовность
8. Pod добавляется в **Endpoints** → Service начинает маршрутизировать трафик

**Deployment гарантирует:** всегда N running replicas (если хватает ресурсов). Rolling update — постепенная замена pods.`,
    },
    {
      title: '4. Как откатить плохой деплой в Kubernetes?',
      content: `**Быстрый rollback:**
\`\`\`bash
kubectl rollout undo deployment/my-app -n production
kubectl rollout status deployment/my-app -n production
\`\`\`

**Откат к конкретной ревизии:**
\`\`\`bash
kubectl rollout history deployment/my-app
kubectl rollout undo deployment/my-app --to-revision=3
\`\`\`

**В CI/CD:** храни предыдущий image tag. При failed health check — автоматический rollback.

**Prevention:** canary deploy (10% → 50% → 100%), blue-green deploy, feature flags.

**Важно:** rollback возвращает **предыдущую версию Deployment spec** (image, env, config). Данные в БД не откатываются!`,
    },
    {
      title: '5. Что такое Terraform state? Зачем remote backend?',
      content: `**Terraform state** (\`terraform.tfstate\`) — JSON-файл, маппящий Terraform resources на реальные cloud resources.

**Зачем нужен:**
- Знает, какие ресурсы уже созданы (plan показывает только diff)
- Хранит metadata (dependencies, attributes)
- Без state Terraform не знает, что управлять

**Проблемы local state:**
- Не в Git (secrets в plaintext!)
- Конфликты при работе в команде
- Потеря файла = потеря control над инфраструктурой

**Remote backend (S3 + DynamoDB):**
- Shared state для команды
- State locking (DynamoDB) — предотвращает concurrent apply
- Encryption at rest
- Versioning (S3) — rollback state

\`\`\`hcl
backend "s3" {
  bucket         = "my-tf-state"
  key            = "prod/terraform.tfstate"
  region         = "eu-central-1"
  dynamodb_table = "tf-lock"
  encrypt        = true
}
\`\`\``,
    },
    {
      title: '6. Сайт лежит — с чего начнёшь диагностику?',
      content: `**Системный подход (MTTR minimization):**

1. **Подтверди** — это массовый outage или partial? (synthetic monitoring, status page)
2. **Scope** — все endpoints или один? Все регионы?
3. **Недавние изменения** — deploy за последние 30 мин? → rollback первым делом
4. **Метрики** (Grafana) — error rate, latency, CPU, memory (RED + USE)
5. **Логи** — последние ERROR, OOMKilled, CrashLoopBackOff
6. **Инфраструктура** — nodes healthy? Disk full? Network?
7. **Зависимости** — DB connections? Cache? External APIs?
8. **Коммуникация** — status update каждые 15 мин

**Правило:** mitigate first (rollback, scale), diagnose later.`,
    },
    {
      title: '7. Разница между replica set и deployment в Kubernetes?',
      content: `**ReplicaSet** — обеспечивает N running pods с заданным label selector. Не обновляет pods — только создаёт/удаляет для поддержания count.

**Deployment** — higher-level controller, управляет ReplicaSets. Добавляет:
- **Rolling updates** — постепенная замена pods
- **Rollback** — откат к предыдущей версии
- **Revision history** — хранение предыдущих ReplicaSets
- **Pause/Resume** — контроль rollout

**На практике:** всегда используй Deployment (или StatefulSet/DaemonSet), никогда ReplicaSet напрямую. ReplicaSet создаётся автоматически Deployment'ом.`,
    },
    {
      title: '8. Что такое inode и что будет, если они закончатся?',
      content: `**inode** — структура данных файловой системы, хранящая metadata файла (permissions, timestamps, block pointers). Каждый файл = 1 inode.

**Диск может быть «полным» двумя способами:**
1. Закончилось место (bytes) — \`df -h\` показывает 100%
2. Закончились inodes — \`df -i\` показывает 100% IUse%

**Типичная причина:** миллионы мелких файлов (sessions, cache, temp files, logs).

**Симптомы:** «No space left on device» при попытке создать файл, хотя \`df -h\` показывает свободное место.

**Решение:** найти директорию (\`find / -xdev -type f | cut -d/ -f2 | sort | uniq -c | sort -rn\`), удалить мелкие файлы, увеличить inode count (пересоздать FS).`,
    },
    {
      title: '9. Объясни разницу между TCP и UDP',
      content: `| | TCP | UDP |
|---|---|---|
| Connection | Connection-oriented (handshake) | Connectionless |
| Reliability | Guaranteed delivery, ordering | Best effort, no guarantee |
| Speed | Slower (overhead) | Faster |
| Use cases | HTTP, SSH, DB connections | DNS, video streaming, gaming |
| Flow control | Yes (window size) | No |
| Error checking | Checksum + retransmission | Checksum only |

**TCP handshake:** SYN → SYN-ACK → ACK (3-way).
**TCP teardown:** FIN → ACK → FIN → ACK (4-way).

**DevOps:** TCP для critical data (HTTP, DB). UDP для latency-sensitive (DNS queries, metrics, logs).`,
    },
    {
      title: '10. Как работает Docker networking?',
      content: `**Default: bridge network.** Каждый container получает virtual ethernet (veth pair) → docker0 bridge → NAT → host network.

**Типы networks:**
- **bridge** — default, containers на одном host общаются по IP
- **host** — container использует network stack хоста (no isolation)
- **none** — no networking
- **overlay** — multi-host networking (Docker Swarm, deprecated)
- **macvlan** — container получает MAC-адрес, виден в физической сети

**DNS в Docker:** встроенный DNS resolver (127.0.0.11) — containers обращаются друг к другу по **name** (не IP).

**docker-compose:** создаёт default network, services доступны по имени сервиса (\`http://db:5432\`).`,
    },
    {
      title: '11. Что такое CI/CD? Объясни pipeline',
      content: `**CI (Continuous Integration)** — автоматическая сборка и тестирование при каждом commit/PR.
**CD (Continuous Delivery/Deployment)** — автоматический deploy в staging/production.

**Типичный pipeline:**
\`\`\`
Code Push → Lint → Unit Tests → Build Image → Security Scan
  → Push to Registry → Deploy to Staging → Integration Tests
  → Deploy to Production (manual gate или auto)
\`\`\`

**CI tools:** GitHub Actions, GitLab CI, Jenkins, CircleCI, ArgoCD (GitOps).

**Принципы:**
- Каждый commit проходит pipeline
- Fail fast (lint перед tests)
- Immutable artifacts (Docker image с tag = git SHA)
- Environment parity (dev ≈ staging ≈ prod)`,
    },
    {
      title: '12. Разница между Symmetric и Asymmetric encryption?',
      content: `**Symmetric** — один ключ для encrypt и decrypt (AES-256).
- Быстрый, но проблема доставки ключа
- Используется для: data at rest, bulk encryption

**Asymmetric** — пара ключей: public (encrypt) + private (decrypt).
- Медленнее, но нет проблемы доставки ключа
- Используется для: TLS handshake, SSH keys, code signing

**TLS комбинирует оба:**
1. Asymmetric (RSA/ECDH) — обмен session key
2. Symmetric (AES) — шифрование данных с session key

**DevOps:** TLS certificates (Let's Encrypt, ACM), SSH keys, Kubernetes secrets encryption (KMS).`,
    },
    {
      title: '13. Что такое load balancing? Типы балансировщиков?',
      content: `**Load Balancer** — распределяет трафик между несколькими backend servers.

**Алгоритмы:**
- Round Robin — по очереди
- Least Connections — на сервер с минимумом connections
- IP Hash — sticky sessions по client IP
- Weighted — пропорционально capacity

**Типы (OSI layer):**
- **L4 (Transport)** — TCP/UDP, NLB, HAProxy (mode tcp)
- **L7 (Application)** — HTTP, ALB, nginx, Traefik

**L7 преимущества:** path-based routing, header manipulation, SSL termination, content-based routing.

**Health checks** — LB периодически проверяет backend (HTTP GET /health). Unhealthy → исключается из rotation.`,
    },
    {
      title: '14. Объясни CAP theorem',
      content: `**CAP Theorem** — в распределённой системе можно гарантировать максимум 2 из 3:

- **C (Consistency)** — все nodes видят одни данные одновременно
- **A (Availability)** — каждый запрос получает ответ (не error)
- **P (Partition Tolerance)** — система работает при network partition

**На практике:** P неизбежна (сеть ненадёжна), выбор между C и A:
- **CP** — MongoDB, HBase (consistency > availability)
- **AP** — Cassandra, DynamoDB (availability > consistency)
- **CA** — PostgreSQL single node (нет partition)

**DevOps implication:** выбор БД зависит от требований. Финансовые транзакции → CP. Social media feed → AP.`,
    },
    {
      title: '15. Как работает Git merge vs rebase?',
      content: `**Merge** — создаёт merge commit, объединяя две ветки. Сохраняет полную историю (включая branch structure).
\`\`\`bash
git checkout main
git merge feature  # создаёт merge commit
\`\`\`

**Rebase** — переносит commits feature branch на tip main. Линейная история, но переписывает commit hashes.
\`\`\`bash
git checkout feature
git rebase main  # feature commits поверх main
\`\`\`

**Правила:**
- **Merge** — для shared/public branches (main, develop)
- **Rebase** — для local feature branches (чистая история)
- **Никогда не rebase** pushed commits, которые используют другие

**DevOps:** trunk-based development (main + short-lived branches) — стандарт для CI/CD.`,
    },
    {
      title: '16. Что такое Infrastructure as Code? Преимущества?',
      content: `**IaC** — описание инфраструктуры в machine-readable файлах (Terraform HCL, CloudFormation YAML, Pulumi).

**Преимущества:**
- **Версионирование** — Git history, code review
- **Воспроизводимость** — одинаковая infra в dev/staging/prod
- **Автоматизация** — apply через CI/CD, не manual clicks
- **Документация** — код = документация (self-documenting)
- **Disaster Recovery** — пересоздать всё из кода

**Инструменты:** Terraform (multi-cloud), CloudFormation (AWS), Pulumi (real languages), Ansible (configuration management).

**Принцип:** никогда не создавай resources вручную в production.`,
    },
    {
      title: '17. Разница между horizontal и vertical scaling?',
      content: `**Vertical Scaling (Scale Up)** — больше ресурсов на одну machine (4 CPU → 8 CPU).
- Проще, но есть потолок (max instance size)
- Downtime при resize (для EC2)
- Single point of failure

**Horizontal Scaling (Scale Out)** — больше machines (2 servers → 10 servers).
- Практически без потолка
- Требует load balancer
- Отказоустойчивость (1 node упал — остальные работают)
- Сложнее (state management, data consistency)

**DevOps:** horizontal scaling — default для cloud-native apps. HPA в K8s, ASG в AWS. Vertical — для databases (RDS resize) или quick fix.`,
    },
    {
      title: '18. Что такое DNS? Типы записей?',
      content: `**DNS (Domain Name System)** — распределённая система, переводящая доменные имена в IP-адреса.

**Типы записей:**
| Тип | Назначение | Пример |
|-----|-----------|--------|
| **A** | Domain → IPv4 | example.com → 93.184.216.34 |
| **AAAA** | Domain → IPv6 | example.com → 2606:2800:... |
| **CNAME** | Alias → другой domain | www → example.com |
| **MX** | Mail server | @ → mail.example.com (priority 10) |
| **TXT** | Произвольный текст | SPF, DKIM, verification |
| **NS** | Name server | example.com → ns1.provider.com |
| **SRV** | Service location | _http._tcp → 0 5 80 server.example.com |
| **PTR** | Reverse DNS | IP → domain |

**TTL (Time To Live)** — сколько секунд DNS resolver кэширует ответ. Низкий TTL (60s) перед migration.`,
    },
    {
      title: '19. Как работает SSH? Что такое key-based auth?',
      content: `**SSH (Secure Shell)** — encrypted remote access (порт 22).

**Key-based authentication:**
1. Генерируешь пару ключей: \`ssh-keygen -t ed25519\`
2. Public key → \`~/.ssh/authorized_keys\` на сервере
3. Private key остаётся на клиенте (никогда не передаётся!)
4. SSH challenge-response с cryptographic proof

**vs Password auth:** ключи невозможно brute-force, автоматизация (CI/CD, Ansible).

**SSH config** (\`~/.ssh/config\`):
\`\`\`
Host prod
  HostName 10.0.1.5
  User deploy
  IdentityFile ~/.ssh/prod-key
  ProxyJump bastion
\`\`\`

**Security:** disable PasswordAuthentication, use fail2ban, restrict by IP in Security Group.`,
    },
    {
      title: '20. Что такое caching? Стратегии invalidation?',
      content: `**Caching** — хранение часто используемых данных в быстром storage (Redis, Memcached, CDN).

**Уровни cache:**
- **Browser cache** — Cache-Control headers
- **CDN** (CloudFront) — edge locations
- **Application cache** (Redis) — in-memory
- **Database query cache** — built-in (MySQL query cache, deprecated)

**Стратегии invalidation:**
- **TTL** — expire через N секунд (простой, но stale data)
- **Write-through** — обновляй cache при write в DB
- **Cache-aside** — app проверяет cache, при miss → DB → cache
- **Event-driven** — invalidation по event (message queue)

**Проблемы:** cache stampede (thundering herd), cache penetration (несуществующие keys).`,
    },
    {
      title: '21. Объясни разницу между process и thread',
      content: `**Process** — независимый экземпляр программы с собственным memory space, file descriptors, PID.
**Thread** — единица выполнения внутри process, разделяет memory space с другими threads.

| | Process | Thread |
|---|---|---|
| Memory | Изолированная | Разделяемая |
| Creation | Медленная (fork) | Быстрая |
| Communication | IPC (pipes, sockets) | Shared memory |
| Crash | Не влияет на другие | Убивает весь process |

**DevOps:** containers = isolated processes (namespaces + cgroups). \`kubectl top pods\` показывает CPU/memory per container (process group).`,
    },
    {
      title: '22. Что такое reverse proxy? Зачем nginx?',
      content: `**Reverse Proxy** — сервер, принимающий запросы от клиентов и перенаправляющий на backend servers. Клиент не знает о backend.

**Зачем:**
- **Load balancing** — распределение между backends
- **SSL termination** — HTTPS на proxy, HTTP к backend
- **Caching** — static content caching
- **Security** — скрытие backend IPs, WAF
- **Compression** — gzip responses
- **Rate limiting** — защита от DDoS

**nginx** — самый популярный reverse proxy. Также: HAProxy, Traefik, Envoy, Caddy.

**В K8s:** Ingress Controller (nginx-ingress, ALB controller) = reverse proxy для services.`,
    },
    {
      title: '23. Как работает Kubernetes Service? Типы?',
      content: `**Service** — стабильный network endpoint для динамического набора pods.

**Типы:**
- **ClusterIP** (default) — internal IP, доступен только внутри кластера
- **NodePort** — открывает порт на каждой node (30000-32767)
- **LoadBalancer** — создаёт cloud LB (ALB/NLB в AWS)
- **ExternalName** — CNAME DNS record

**Как работает:**
1. Service selector → matching pods
2. **Endpoints controller** создаёт Endpoints object с pod IPs
3. **kube-proxy** на каждой node настраивает iptables/IPVS rules
4. Traffic к Service IP → round-robin к pod IPs

**Headless Service** (clusterIP: None) — DNS возвращает pod IPs напрямую (для StatefulSet).`,
    },
    {
      title: '24. Что такое Prometheus? Как собирает метрики?',
      content: `**Prometheus** — open-source monitoring system (CNCF graduated).

**Pull model:** Prometheus server периодически HTTP GET \`/metrics\` с targets.

**Компоненты:**
- **Prometheus Server** — scrape, store (TSDB), query (PromQL)
- **Exporters** — node_exporter (host metrics), postgres_exporter, custom /metrics
- **Pushgateway** — для short-lived jobs (push вместо pull)
- **Alertmanager** — routing alerts
- **Service Discovery** — auto-discovery targets (K8s, EC2, DNS)

**Metric types:** Counter (monotonic), Gauge (current value), Histogram (distribution), Summary (quantiles).

**В K8s:** annotations на pod (\`prometheus.io/scrape: "true"\`) → auto-discovery.`,
    },
    {
      title: '25. Разница между Ansible, Terraform и Kubernetes?',
      content: `| | Terraform | Ansible | Kubernetes |
|---|---|---|---|
| **Тип** | IaC (provisioning) | Config management | Orchestration |
| **Подход** | Declarative | Procedural/Declarative | Declarative |
| **Что управляет** | Cloud resources | OS configuration | Containers |
| **State** | State file | Stateless (SSH) | etcd |
| **Идемпотентность** | Да | Да | Да (reconciliation) |

**Workflow:** Terraform создаёт EC2 → Ansible настраивает OS (install Docker, nginx) → Kubernetes оркестрирует containers.

**Современный подход:** Terraform (infra) + Kubernetes (workloads). Ansible — для bare metal или legacy systems.`,
    },
    {
      title: '26. Что такое SLI, SLO, SLA?',
      content: `**SLI (Service Level Indicator)** — метрика качества:
- Availability = successful requests / total requests
- Latency = requests faster than 200ms / total requests

**SLO (Service Level Objective)** — целевое значение SLI:
- «99.9% availability per month»
- «95% of requests < 200ms»

**SLA (Service Level Agreement)** — контракт с клиентом:
- «99.9% uptime or 10% credit»
- SLO обычно строже SLA (buffer)

**Error Budget** = 100% - SLO:
- 99.9% SLO → 0.1% budget → 43.2 min/month downtime
- Budget exhausted → freeze deploys, focus on reliability`,
    },
    {
      title: '27. Как работает SSL/TLS certificate?',
      content: `**Certificate** — digital document, подтверждающий identity сервера. Содержит: domain name, public key, expiry, CA signature.

**Chain of Trust:**
Root CA (trusted by OS/browser) → Intermediate CA → Server Certificate

**Let's Encrypt (ACME protocol):**
1. Запрос сертификата (certbot)
2. ACME server проверяет domain ownership (HTTP-01 или DNS-01 challenge)
3. Выдаёт certificate (90 дней)
4. Auto-renewal через cron/systemd timer

**В AWS:** ACM (Certificate Manager) — бесплатные certs для ALB/CloudFront. Auto-renewal.

**В K8s:** cert-manager — автоматическое получение и renewal certs для Ingress.`,
    },
    {
      title: '28. Что такое message queue? Зачем Kafka/RabbitMQ/SQS?',
      content: `**Message Queue** — асинхронная коммуникация между services через messages.

**Зачем:**
- **Decoupling** — producer не ждёт consumer
- **Buffering** — сглаживание пиков нагрузки
- **Reliability** — message не потеряется при crash consumer
- **Scaling** — multiple consumers обрабатывают параллельно

**Сравнение:**
| | RabbitMQ | Kafka | AWS SQS |
|---|---|---|---|
| Model | Queue (point-to-point) | Log (pub-sub) | Managed queue |
| Ordering | Per queue | Per partition | FIFO option |
| Retention | Until consumed | Configurable (days) | 14 days max |
| Throughput | Medium | Very high | High |

**DevOps:** SQS + Lambda для serverless async. Kafka для event streaming. RabbitMQ для task queues.`,
    },
    {
      title: '29. Объясни разницу между stateful и stateless приложениями',
      content: `**Stateless** — сервер не хранит client state между requests. Каждый request независим.
- Примеры: REST API, nginx, Lambda
- Масштабирование: trivial (любой instance обработает)
- Load balancing: round-robin без sticky sessions

**Stateful** — сервер хранит client state (session, connections).
- Примеры: WebSocket server, database, gaming server
- Масштабирование: сложнее (state synchronization)
- Load balancing: sticky sessions или shared state (Redis)

**В K8s:**
- Stateless → Deployment
- Stateful → StatefulSet (stable network ID, persistent storage)

**Cloud-native best practice:** stateless apps + external state store (DB, Redis, S3).`,
    },
    {
      title: '30. Что такое GitOps?',
      content: `**GitOps** — операционная модель, где Git repository = single source of truth для infrastructure и applications.

**Принципы:**
1. **Declarative** — desired state в Git (YAML)
2. **Versioned** — Git history = audit trail
3. **Automatic** — agent syncs Git → cluster (reconciliation loop)
4. **Continuous** — каждый merge → deploy

**Инструменты:**
- **ArgoCD** — K8s-native, UI, multi-cluster
- **Flux** — CNCF, modular, GitOps Toolkit
- **Terraform Cloud** — GitOps для infrastructure

**Workflow:**
\`\`\`
Developer → PR → Merge to main → ArgoCD detects change
  → Sync to K8s cluster → Health check → Done
\`\`\`

**Преимущества:** rollback = git revert, audit trail, consistent state, disaster recovery.`,
    },
    {
      title: '31. Как работает AWS Auto Scaling Group?',
      content: `**ASG (Auto Scaling Group)** — автоматическое управление количеством EC2 instances.

**Компоненты:**
- **Launch Template** — AMI, instance type, security groups
- **Scaling Policies** — когда добавлять/удалять instances
- **Health Checks** — EC2 status + ELB health check
- **Target Tracking** — maintain metric at target (CPU = 50%)

**Scaling policies:**
- **Target tracking** — CPU utilization = 50%
- **Step scaling** — CPU > 70% → +2 instances
- **Scheduled** — scale up at 9 AM, down at 6 PM
- **Predictive** — ML-based forecasting

**В K8s аналог:** HPA (Horizontal Pod Autoscaler) + Cluster Autoscaler (adds/removes nodes).`,
    },
    {
      title: '32. Что такое container orchestration? Зачем Kubernetes?',
      content: `**Container Orchestration** — автоматизация deploy, scaling, networking, health management для containers.

**Проблемы без orchestration:**
- Manual deploy на N servers
- No self-healing (container died → manual restart)
- No load balancing between containers
- No rolling updates

**Kubernetes решает:**
- **Scheduling** — размещение pods на nodes
- **Self-healing** — restart failed containers, replace nodes
- **Scaling** — manual + automatic (HPA)
- **Service discovery** — DNS-based
- **Rolling updates** — zero-downtime deploys
- **Secret/Config management**
- **Storage orchestration** — PV/PVC

**Альтернативы:** Docker Swarm (проще, меньше features), Nomad (HashiCorp), ECS (AWS-native).`,
    },
    {
      title: '33. Разница между blue-green и canary deployment?',
      content: `**Blue-Green Deployment:**
- Два identical environments: Blue (current) и Green (new)
- Deploy new version to Green → test → switch traffic → Blue becomes standby
- Rollback: switch back to Blue (instant)
- Нужно 2x resources

**Canary Deployment:**
- Постепенный rollout: 5% → 25% → 50% → 100% traffic to new version
- Мониторинг metrics на каждом этапе
- Rollback: redirect 100% traffic to old version
- Минимальные extra resources

**В K8s:**
- Blue-Green: два Deployments + Service selector switch
- Canary: Flagger, Argo Rollouts (automated canary with metrics analysis)

**Выбор:** Canary для production (меньше risk). Blue-Green для major releases или database migrations.`,
    },
    {
      title: '34. Что такое systemd? Как управлять сервисами?',
      content: `**systemd** — init system и service manager в современных Linux (RHEL 7+, Ubuntu 16+, Debian 8+).

**Unit files** — конфигурация services, timers, mounts:
\`\`\`bash
systemctl start nginx       # запустить
systemctl stop nginx        # остановить
systemctl restart nginx     # перезапустить
systemctl enable nginx      # автозапуск при boot
systemctl status nginx      # статус
systemctl list-units --type=service  # все services
journalctl -u nginx -f      # логи service
\`\`\`

**Unit file location:** /etc/systemd/system/myapp.service

**vs Docker:** systemd управляет processes на host. Docker — isolated containers. В K8s kubelet управляет containers (не systemd напрямую, но kubelet сам может быть systemd service).`,
    },
    {
      title: '35. Как бы ты спроектировал CI/CD для команды из 10 разработчиков?',
      content: `**Архитектура CI/CD для 10 devs:**

**Branching:** Trunk-based development (main + short-lived feature branches, max 2-3 days).

**CI Pipeline (на каждый PR):**
1. Lint + format check (2 min)
2. Unit tests (5 min)
3. Build Docker image (3 min)
4. SAST scan — Semgrep (2 min)
5. Container scan — Trivy (2 min)
6. Deploy to preview environment (3 min)
7. Integration tests (5 min)
→ Total: ~20 min

**CD Pipeline (merge to main):**
1. Deploy to staging (auto)
2. Smoke tests
3. Deploy to production (manual approval или auto с canary)
4. Canary: 10% → monitor 15 min → 50% → 100%
5. Auto-rollback при error rate > 1%

**Инструменты:** GitHub Actions, ArgoCD (GitOps), Terraform (infra), Trivy (security).

**Принципы:** fast feedback (< 20 min), automated gates, canary deploys, easy rollback, observability на каждом этапе.`,
    },
    {
      title: '36. Что такое /proc и /sys в Linux?',
      content: `**Virtual filesystems** — интерфейс к kernel data structures. Не занимают disk space.

**/proc** — process and system information:
- \`/proc/cpuinfo\` — CPU info
- \`/proc/meminfo\` — memory usage
- \`/proc/PID/\` — per-process info (status, cmdline, fd, maps)
- \`/proc/sys/\` — kernel parameters (sysctl)

**/sys** — kernel devices and drivers (sysfs):
- \`/sys/class/net/\` — network interfaces
- \`/sys/block/\` — block devices
- \`/sys/fs/cgroup/\` — cgroups (container resource limits)

**DevOps use:** debugging (\`cat /proc/PID/status\`), tuning (\`sysctl -w net.ipv4.tcp_tw_reuse=1\`), monitoring (\`/proc/stat\` for CPU).

**Containers:** /proc and /sys mounted with restrictions (hide other processes, limit writable sysctls).`,
    },
    {
      title: '37. Как обеспечить zero-downtime deployment?',
      content: `**Стратегии:**

1. **Rolling Update** (K8s default) — постепенная замена instances. maxUnavailable=0, maxSurge=1.

2. **Readiness Probe** — traffic только к ready pods. Новый pod не получает traffic до прохождения probe.

3. **PreStop Hook** — graceful shutdown: drain connections перед остановкой.
\`\`\`yaml
lifecycle:
  preStop:
    exec:
      command: ["sleep", "15"]
\`\`\`

4. **PodDisruptionBudget** — минимум available pods при voluntary disruption.

5. **Database migrations** — backward-compatible (add column, not rename). Expand → Migrate → Contract pattern.

6. **Feature flags** — deploy code с выключенной feature, enable без redeploy.

7. **Load Balancer** — deregister instance → drain → stop → deploy → health check → register.`,
    },
  ],
  practice: [
    'Пройди все 37 вопросов вслух, записывая ответы',
    'Для каждого вопроса напиши свой пример из опыта (даже учебного)',
    'Сделай mock interview с другом или AI — 30 мин, 10 случайных вопросов',
    'Создай Anki/flashcards для слабых тем',
    'Реши 10 задач с github.com/bregman-arie/devops-exercises',
    'Подготовь 2-минутный «расскажи о себе» для DevOps позиции',
  ],
  resources: [
    { title: 'DevOps Exercises', url: 'https://github.com/bregman-arie/devops-exercises' },
    { title: 'InterviewBit DevOps', url: 'https://www.interviewbit.com/devops-interview-questions/' },
    { title: 'r/devops Wiki', url: 'https://www.reddit.com/r/devops/wiki/index' },
  ],
}
