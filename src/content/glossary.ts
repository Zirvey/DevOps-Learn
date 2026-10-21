import type { GlossaryTerm } from '../types'

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'ci-cd',
    termRu: 'CI/CD',
    termEn: 'CI/CD',
    definitionRu:
      'Continuous Integration / Continuous Delivery (или Deployment): автоматическая сборка, тесты и доставка изменений в окружения.',
    definitionEn:
      'Continuous Integration / Continuous Delivery (or Deployment): automated build, test, and delivery of changes to environments.',
    relatedSlugs: ['cicd-basics', 'github-actions', 'gitlab-ci'],
  },
  {
    id: 'iac',
    termRu: 'Infrastructure as Code',
    termEn: 'Infrastructure as Code',
    definitionRu:
      'Описание инфраструктуры в коде (Terraform, CloudFormation, Ansible), чтобы окружения были воспроизводимы и версионируемы.',
    definitionEn:
      'Describing infrastructure in code (Terraform, CloudFormation, Ansible) so environments are reproducible and versioned.',
    relatedSlugs: ['terraform', 'ansible'],
  },
  {
    id: 'container',
    termRu: 'Контейнер',
    termEn: 'Container',
    definitionRu:
      'Изолированный процесс с собственной ФС и сетью на общем ядре ОС. Docker — самый распространённый runtime.',
    definitionEn:
      'An isolated process with its own filesystem and network on a shared OS kernel. Docker is the most common runtime.',
    relatedSlugs: ['docker', 'docker-compose'],
  },
  {
    id: 'k8s',
    termRu: 'Kubernetes (K8s)',
    termEn: 'Kubernetes (K8s)',
    definitionRu:
      'Оркестратор контейнеров: расписание подов, сервисы, масштабирование, самовосстановление.',
    definitionEn:
      'Container orchestrator: scheduling pods, services, scaling, and self-healing.',
    relatedSlugs: ['kubernetes-basics', 'kubernetes-advanced', 'helm'],
  },
  {
    id: 'gitops',
    termRu: 'GitOps',
    termEn: 'GitOps',
    definitionRu:
      'Желаемое состояние кластера хранится в Git; контроллер (Argo CD, Flux) непрерывно синхронизирует кластер с репозиторием.',
    definitionEn:
      'Desired cluster state lives in Git; a controller (Argo CD, Flux) continuously syncs the cluster to the repo.',
    relatedSlugs: ['gitops'],
  },
  {
    id: 'sli-slo',
    termRu: 'SLI / SLO / SLA',
    termEn: 'SLI / SLO / SLA',
    definitionRu:
      'SLI — измеряемый индикатор (latency, error rate). SLO — целевой уровень. SLA — договорные обязательства перед клиентом.',
    definitionEn:
      'SLI — measurable indicator (latency, error rate). SLO — target level. SLA — contractual commitment to the customer.',
    relatedSlugs: ['monitoring', 'incidents', 'helpdesk-and-sla'],
  },
  {
    id: 'mttr',
    termRu: 'MTTR',
    termEn: 'MTTR',
    definitionRu:
      'Mean Time To Recovery — среднее время восстановления после инцидента. Одна из метрик DORA.',
    definitionEn:
      'Mean Time To Recovery — average time to restore service after an incident. A DORA metric.',
    relatedSlugs: ['incidents', 'what-is-devops'],
  },
  {
    id: 'observability',
    termRu: 'Observability',
    termEn: 'Observability',
    definitionRu:
      'Способность понимать состояние системы по метрикам, логам и трейсам без заранее заложенных дашбордов на каждый кейс.',
    definitionEn:
      'Ability to understand system state from metrics, logs, and traces without a pre-built dashboard for every case.',
    relatedSlugs: ['monitoring', 'logging', 'zabbix'],
  },
  {
    id: 'vlan',
    termRu: 'VLAN',
    termEn: 'VLAN',
    definitionRu:
      'Virtual LAN — логическое сегментирование L2-сети для изоляции трафика (офис, гости, серверы).',
    definitionEn:
      'Virtual LAN — logical L2 segmentation to isolate traffic (office, guests, servers).',
    relatedSlugs: ['vlan-switching', 'office-network-design'],
  },
  {
    id: 'nat',
    termRu: 'NAT',
    termEn: 'NAT',
    definitionRu:
      'Network Address Translation — подмена адресов (часто private → public) на границе сети.',
    definitionEn:
      'Network Address Translation — rewriting addresses (often private → public) at the network edge.',
    relatedSlugs: ['networking', 'opnsense-firewall-nat', 'fortigate-firewall-policies'],
  },
  {
    id: 'tls',
    termRu: 'TLS / PKI',
    termEn: 'TLS / PKI',
    definitionRu:
      'TLS шифрует трафик; PKI — инфраструктура сертификатов и доверия (CA, цепочки, CRL/OCSP).',
    definitionEn:
      'TLS encrypts traffic; PKI is the certificate and trust infrastructure (CA, chains, CRL/OCSP).',
    relatedSlugs: ['tls-pki', 'nginx'],
  },
  {
    id: 'secrets',
    termRu: 'Secrets management',
    termEn: 'Secrets management',
    definitionRu:
      'Хранение и ротация секретов вне кода: Vault, SOPS, облачные secret stores, sealed secrets в K8s.',
    definitionEn:
      'Storing and rotating secrets outside code: Vault, SOPS, cloud secret stores, sealed secrets in K8s.',
    relatedSlugs: ['secrets-management', 'devsecops'],
  },
  {
    id: 'finops',
    termRu: 'FinOps',
    termEn: 'FinOps',
    definitionRu:
      'Практика управления облачными затратами: теги, бюджеты, rightsizing, видимость для инженеров и финансов.',
    definitionEn:
      'Cloud cost management practice: tags, budgets, rightsizing, visibility for engineers and finance.',
    relatedSlugs: ['finops-cost', 'aws-basics'],
  },
  {
    id: 'idempotency',
    termRu: 'Идемпотентность',
    termEn: 'Idempotency',
    definitionRu:
      'Повторный запуск операции даёт тот же результат без побочных эффектов (ключевой принцип Ansible/Terraform).',
    definitionEn:
      'Re-running an operation yields the same result without side effects (core Ansible/Terraform principle).',
    relatedSlugs: ['ansible', 'terraform'],
  },
  {
    id: 'blameless',
    termRu: 'Blameless postmortem',
    termEn: 'Blameless postmortem',
    definitionRu:
      'Разбор инцидента без поиска виноватых: фокус на системных причинах и action items.',
    definitionEn:
      'Incident review without blame: focus on systemic causes and action items.',
    relatedSlugs: ['incidents', 'what-is-devops'],
  },
  {
    id: 'dockerfile',
    termRu: 'Dockerfile',
    termEn: 'Dockerfile',
    definitionRu:
      'Текст с инструкциями (FROM, RUN, COPY, CMD), по которому Docker собирает образ слоя за слоем.',
    definitionEn:
      'A text file of instructions (FROM, RUN, COPY, CMD) that Docker uses to build an image layer by layer.',
    relatedSlugs: ['docker', 'cicd-basics'],
  },
  {
    id: 'pod',
    termRu: 'Pod',
    termEn: 'Pod',
    definitionRu:
      'Наименьшая единица планирования в Kubernetes: один или несколько контейнеров с общей сетью и томами.',
    definitionEn:
      'Smallest schedulable unit in Kubernetes: one or more containers sharing network and volumes.',
    relatedSlugs: ['kubernetes-basics', 'aws-eks'],
  },
  {
    id: 'deployment',
    termRu: 'Deployment',
    termEn: 'Deployment',
    definitionRu:
      'Kubernetes-ресурс, который описывает желаемое число реплик подов и стратегию обновления (RollingUpdate и др.).',
    definitionEn:
      'Kubernetes resource that declares desired pod replicas and an update strategy (e.g. RollingUpdate).',
    relatedSlugs: ['kubernetes-basics', 'kubernetes-advanced', 'helm'],
  },
  {
    id: 'service',
    termRu: 'Service (K8s)',
    termEn: 'Service (K8s)',
    definitionRu:
      'Стабильная сетевая точка доступа к набору подов (ClusterIP, NodePort, LoadBalancer) по селекторам меток.',
    definitionEn:
      'Stable network endpoint for a set of pods (ClusterIP, NodePort, LoadBalancer) via label selectors.',
    relatedSlugs: ['kubernetes-basics', 'networking'],
  },
  {
    id: 'ingress',
    termRu: 'Ingress',
    termEn: 'Ingress',
    definitionRu:
      'Правила HTTP(S)-маршрутизации снаружи кластера к сервисам: хосты, пути, TLS-терминация.',
    definitionEn:
      'HTTP(S) routing rules from outside the cluster to Services: hosts, paths, TLS termination.',
    relatedSlugs: ['kubernetes-basics', 'nginx', 'tls-pki'],
  },
  {
    id: 'helm-chart',
    termRu: 'Helm Chart',
    termEn: 'Helm Chart',
    definitionRu:
      'Пакет шаблонов Kubernetes-манифестов с values.yaml: версионируемая установка и апгрейд приложений в кластере.',
    definitionEn:
      'Packaged Kubernetes manifest templates with values.yaml: versioned install and upgrade of apps in a cluster.',
    relatedSlugs: ['helm', 'kubernetes-basics', 'gitops'],
  },
  {
    id: 'pipeline',
    termRu: 'Pipeline',
    termEn: 'Pipeline',
    definitionRu:
      'Цепочка автоматизированных шагов CI/CD: checkout, build, test, scan, deploy — обычно в GitHub Actions или GitLab CI.',
    definitionEn:
      'Chain of automated CI/CD steps: checkout, build, test, scan, deploy — typically in GitHub Actions or GitLab CI.',
    relatedSlugs: ['cicd-basics', 'github-actions', 'gitlab-ci'],
  },
  {
    id: 'registry',
    termRu: 'Registry',
    termEn: 'Registry',
    definitionRu:
      'Хранилище контейнерных образов (Docker Hub, GHCR, ECR): push/pull по тегам и дайджестам.',
    definitionEn:
      'Container image store (Docker Hub, GHCR, ECR): push/pull by tags and digests.',
    relatedSlugs: ['docker', 'aws-basics', 'cicd-basics'],
  },
  {
    id: 'blue-green',
    termRu: 'Blue-green deployment',
    termEn: 'Blue-green deployment',
    definitionRu:
      'Два одинаковых окружения (blue/green); трафик переключается целиком на новое после проверки, старое остаётся для отката.',
    definitionEn:
      'Two identical environments (blue/green); traffic switches entirely to the new one after validation; the old one remains for rollback.',
    relatedSlugs: ['cicd-basics', 'kubernetes-advanced'],
  },
  {
    id: 'canary',
    termRu: 'Canary release',
    termEn: 'Canary release',
    definitionRu:
      'Постепенный выпуск: небольшая доля трафика идёт на новую версию; при ошибках — откат, при успехе — расширение.',
    definitionEn:
      'Gradual rollout: a small traffic share hits the new version; on errors roll back, on success expand.',
    relatedSlugs: ['cicd-basics', 'kubernetes-advanced', 'monitoring'],
  },
  {
    id: 'rollback',
    termRu: 'Rollback',
    termEn: 'Rollback',
    definitionRu:
      'Возврат к предыдущей рабочей версии приложения или инфраструктуры после неудачного деплоя или релиза.',
    definitionEn:
      'Reverting to a previous working application or infrastructure version after a failed deploy or release.',
    relatedSlugs: ['cicd-basics', 'kubernetes-basics', 'incidents'],
  },
  {
    id: 'prometheus',
    termRu: 'Prometheus',
    termEn: 'Prometheus',
    definitionRu:
      'Система сбора метрик по pull-модели: time-series БД, PromQL, service discovery, алерты через Alertmanager.',
    definitionEn:
      'Pull-based metrics system: time-series DB, PromQL, service discovery, alerts via Alertmanager.',
    relatedSlugs: ['monitoring', 'logging'],
  },
  {
    id: 'grafana',
    termRu: 'Grafana',
    termEn: 'Grafana',
    definitionRu:
      'Платформа визуализации: дашборды по метрикам, логам и трейсам из Prometheus, Loki и других источников.',
    definitionEn:
      'Visualization platform: dashboards over metrics, logs, and traces from Prometheus, Loki, and other sources.',
    relatedSlugs: ['monitoring', 'logging', 'zabbix'],
  },
  {
    id: 'on-call',
    termRu: 'On-call',
    termEn: 'On-call',
    definitionRu:
      'Дежурство инженера: получение алертов вне рабочего времени, эскалация и первичная реакция на инциденты.',
    definitionEn:
      'Engineer duty rotation: receiving after-hours alerts, escalation, and first response to incidents.',
    relatedSlugs: ['incidents', 'helpdesk-and-sla', 'monitoring'],
  },
  {
    id: 'runbook',
    termRu: 'Runbook',
    termEn: 'Runbook',
    definitionRu:
      'Пошаговая инструкция реакции на известный инцидент или задачу: диагностика, mitigation, эскалация, контакты.',
    definitionEn:
      'Step-by-step guide for a known incident or task: diagnosis, mitigation, escalation, contacts.',
    relatedSlugs: ['incidents', 'troubleshooting-scenarios', 'support-playbooks'],
  },
  {
    id: 'least-privilege',
    termRu: 'Least privilege',
    termEn: 'Least privilege',
    definitionRu:
      'Принцип минимальных прав: субъект получает только разрешения, необходимые для задачи — в IAM, AD, K8s RBAC.',
    definitionEn:
      'Principle of minimal rights: a subject gets only the permissions needed for the task — in IAM, AD, K8s RBAC.',
    relatedSlugs: ['devsecops', 'aws-basics', 'active-directory'],
  },
  {
    id: 'mfa',
    termRu: 'MFA',
    termEn: 'MFA',
    definitionRu:
      'Multi-Factor Authentication — вход по нескольким факторам (пароль + TOTP/ключ/биометрия) для снижения риска компрометации.',
    definitionEn:
      'Multi-Factor Authentication — sign-in with multiple factors (password + TOTP/key/biometrics) to reduce compromise risk.',
    relatedSlugs: ['devsecops', 'active-directory', 'ssh'],
  },
  {
    id: 'ssh-key',
    termRu: 'SSH-ключ',
    termEn: 'SSH key',
    definitionRu:
      'Пара публичный/приватный ключ для аутентификации по SSH без пароля; приватный ключ хранят защищённо.',
    definitionEn:
      'Public/private key pair for passwordless SSH authentication; the private key must be stored securely.',
    relatedSlugs: ['ssh', 'linux', 'devsecops'],
  },
  {
    id: 'vpc',
    termRu: 'VPC',
    termEn: 'VPC',
    definitionRu:
      'Virtual Private Cloud — изолированная виртуальная сеть в облаке со своими CIDR, подсетями и маршрутизацией.',
    definitionEn:
      'Virtual Private Cloud — isolated cloud network with its own CIDR, subnets, and routing.',
    relatedSlugs: ['aws-basics', 'aws-networking', 'networking'],
  },
  {
    id: 'security-group',
    termRu: 'Security Group',
    termEn: 'Security Group',
    definitionRu:
      'Stateful firewall на уровне инстанса/ENI в AWS: разрешённые inbound/outbound порты и источники.',
    definitionEn:
      'Stateful firewall at the instance/ENI level in AWS: allowed inbound/outbound ports and sources.',
    relatedSlugs: ['aws-networking', 'aws-basics', 'devsecops'],
  },
  {
    id: 'iam',
    termRu: 'IAM',
    termEn: 'IAM',
    definitionRu:
      'Identity and Access Management — пользователи, роли, политики доступа к облачным API и ресурсам.',
    definitionEn:
      'Identity and Access Management — users, roles, and policies for cloud APIs and resources.',
    relatedSlugs: ['aws-basics', 'devsecops', 'secrets-management'],
  },
  {
    id: 'load-balancer',
    termRu: 'Load balancer',
    termEn: 'Load balancer',
    definitionRu:
      'Распределитель нагрузки (L4/L7): балансирует трафик между бэкендами, health checks, TLS-терминация.',
    definitionEn:
      'Traffic distributor (L4/L7): balances across backends, health checks, TLS termination.',
    relatedSlugs: ['aws-networking', 'nginx', 'kubernetes-basics'],
  },
  {
    id: 'dhcp',
    termRu: 'DHCP',
    termEn: 'DHCP',
    definitionRu:
      'Протокол автоматической выдачи IP, шлюза, DNS и других параметров хостам в LAN/офисной сети.',
    definitionEn:
      'Protocol that automatically assigns IP, gateway, DNS, and other host parameters on a LAN/office network.',
    relatedSlugs: ['office-dhcp-dns', 'office-network-design', 'networking'],
  },
  {
    id: 'dns',
    termRu: 'DNS',
    termEn: 'DNS',
    definitionRu:
      'Система имён: резолвит домены в IP (A/AAAA), сервисы (SRV), почту (MX); критична для офиса и облака.',
    definitionEn:
      'Name system: resolves domains to IPs (A/AAAA), services (SRV), mail (MX); critical for office and cloud.',
    relatedSlugs: ['office-dhcp-dns', 'networking', 'aws-networking'],
  },
  {
    id: 'ssid',
    termRu: 'SSID',
    termEn: 'SSID',
    definitionRu:
      'Имя беспроводной сети Wi‑Fi; в офисе обычно разделяют corp/guest/IoT с разной аутентификацией и VLAN.',
    definitionEn:
      'Wi‑Fi network name; offices typically split corp/guest/IoT with different auth and VLANs.',
    relatedSlugs: ['office-wifi', 'omada-fundamentals', 'omada-wireless'],
  },
  {
    id: 'radius',
    termRu: 'RADIUS',
    termEn: 'RADIUS',
    definitionRu:
      'Протокол централизованной аутентификации/авторизации (часто 802.1X на Wi‑Fi и коммутаторах).',
    definitionEn:
      'Centralized authentication/authorization protocol (often 802.1X on Wi‑Fi and switches).',
    relatedSlugs: ['office-wifi', 'omada-wireless', 'active-directory'],
  },
  {
    id: 'firewall',
    termRu: 'Firewall',
    termEn: 'Firewall',
    definitionRu:
      'Межсетевой экран: фильтрация трафика по правилам (зоны, порты, приложения) на границе или внутри сети.',
    definitionEn:
      'Network filter enforcing traffic rules (zones, ports, apps) at the edge or inside the network.',
    relatedSlugs: ['fortigate-fundamentals', 'opnsense-fundamentals', 'networking'],
  },
  {
    id: 'vpn',
    termRu: 'VPN',
    termEn: 'VPN',
    definitionRu:
      'Зашифрованный туннель удалённого доступа или site-to-site между офисами/облаком поверх публичной сети.',
    definitionEn:
      'Encrypted remote-access or site-to-site tunnel between offices/cloud over a public network.',
    relatedSlugs: ['opnsense-vpn', 'fortinet-vpn', 'networking'],
  },
  {
    id: 'wireguard',
    termRu: 'WireGuard',
    termEn: 'WireGuard',
    definitionRu:
      'Современный VPN-протокол с простым ключным обменом и высокой производительностью; часто в OPNsense/роутерах.',
    definitionEn:
      'Modern VPN protocol with simple key exchange and high performance; common on OPNsense/routers.',
    relatedSlugs: ['opnsense-vpn', 'opnsense-fundamentals', 'networking'],
  },
  {
    id: 'gpo',
    termRu: 'GPO',
    termEn: 'GPO',
    definitionRu:
      'Group Policy Object — политики Active Directory для настроек ОС, ПО и безопасности на компьютерах и пользователях.',
    definitionEn:
      'Group Policy Object — Active Directory policies for OS, software, and security settings on computers and users.',
    relatedSlugs: ['gpo-user-management', 'active-directory', 'windows-server-basics'],
  },
  {
    id: 'domain-controller',
    termRu: 'Domain Controller',
    termEn: 'Domain Controller',
    definitionRu:
      'Сервер Active Directory, который аутентифицирует пользователей, хранит каталог и обслуживает Kerberos/LDAP.',
    definitionEn:
      'Active Directory server that authenticates users, holds the directory, and serves Kerberos/LDAP.',
    relatedSlugs: ['active-directory', 'windows-server-basics', 'gpo-user-management'],
  },
  {
    id: 'intune-autopilot',
    termRu: 'Autopilot / Intune',
    termEn: 'Autopilot / Intune',
    definitionRu:
      'MDM/endpoint management в Microsoft 365: подготовка устройств (Autopilot) и политики приложений/безопасности (Intune).',
    definitionEn:
      'Microsoft 365 MDM/endpoint management: device provisioning (Autopilot) and app/security policies (Intune).',
    relatedSlugs: ['endpoint-support', 'windows-server-basics', 'helpdesk-and-sla'],
  },
  {
    id: 'rpo-rto',
    termRu: 'RPO / RTO',
    termEn: 'RPO / RTO',
    definitionRu:
      'RPO — допустимая потеря данных (возраст бэкапа). RTO — целевое время восстановления сервиса после аварии.',
    definitionEn:
      'RPO — acceptable data loss (backup age). RTO — target time to restore service after an outage.',
    relatedSlugs: ['backups-disaster-recovery', 'incidents', 'windows-server-basics'],
  },
  {
    id: 'dora',
    termRu: 'DORA metrics',
    termEn: 'DORA metrics',
    definitionRu:
      'Четыре метрики delivery: частота деплоев, lead time, change failure rate, MTTR — ориентир зрелости DevOps.',
    definitionEn:
      'Four delivery metrics: deployment frequency, lead time, change failure rate, MTTR — a DevOps maturity signal.',
    relatedSlugs: ['what-is-devops', 'cicd-basics', 'incidents'],
  },
  {
    id: 'trunk-based',
    termRu: 'Trunk-based development',
    termEn: 'Trunk-based development',
    definitionRu:
      'Короткие ветки и частые мержи в main; feature flags вместо долгоживущих feature-веток.',
    definitionEn:
      'Short-lived branches and frequent merges to main; feature flags instead of long-lived feature branches.',
    relatedSlugs: ['git', 'cicd-basics', 'gitops'],
  },
  {
    id: 'feature-flag',
    termRu: 'Feature flag',
    termEn: 'Feature flag',
    definitionRu:
      'Переключатель функциональности без нового деплоя: постепенно включают фичу, A/B и быстрый kill-switch.',
    definitionEn:
      'Runtime toggle for a feature without a new deploy: gradual rollout, A/B, and a fast kill-switch.',
    relatedSlugs: ['cicd-basics', 'git', 'what-is-devops'],
  },
  {
    id: 'chaos-engineering',
    termRu: 'Chaos engineering',
    termEn: 'Chaos engineering',
    definitionRu:
      'Намеренные сбои в контролируемых условиях, чтобы проверить устойчивость системы и качество runbook-ов.',
    definitionEn:
      'Intentional failures under controlled conditions to validate system resilience and runbook quality.',
    relatedSlugs: ['troubleshooting-scenarios', 'incidents', 'monitoring'],
  },
  {
    id: 'hpa',
    termRu: 'HPA',
    termEn: 'HPA',
    definitionRu:
      'Horizontal Pod Autoscaler — автоматически меняет число реплик Deployment по CPU/памяти или кастомным метрикам.',
    definitionEn:
      'Horizontal Pod Autoscaler — automatically scales Deployment replicas by CPU/memory or custom metrics.',
    relatedSlugs: ['kubernetes-advanced', 'kubernetes-basics', 'monitoring'],
  },
  {
    id: 'configmap',
    termRu: 'ConfigMap',
    termEn: 'ConfigMap',
    definitionRu:
      'Kubernetes-объект для несекретных конфигураций: env, файлы настроек, монтируемые в под.',
    definitionEn:
      'Kubernetes object for non-secret config: env vars, config files, mounted into pods.',
    relatedSlugs: ['kubernetes-basics', 'yaml', 'helm'],
  },
  {
    id: 'persistent-volume',
    termRu: 'PersistentVolume',
    termEn: 'PersistentVolume',
    definitionRu:
      'Постоянное хранилище в Kubernetes: том переживает перезапуск пода; claim (PVC) запрашивает нужный размер и класс.',
    definitionEn:
      'Durable storage in Kubernetes: volume outlives pod restarts; a claim (PVC) requests size and storage class.',
    relatedSlugs: ['kubernetes-basics', 'kubernetes-advanced', 'docker'],
  },
]
