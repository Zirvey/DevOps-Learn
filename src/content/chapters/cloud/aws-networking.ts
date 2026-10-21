import type { Chapter } from '../../../types'

export const awsNetworkingChapter: Chapter = {
  id: 'aws-networking',
  slug: 'aws-networking',
  title: 'AWS Networking: VPC, subnets, ALB',
  moduleId: 'cloud',
  order: 1,
  duration: '6–8 часов',
  level: 'intermediate',
  description:
    'VPC, подсети, Internet Gateway, NAT, маршрутизация, Security Groups vs NACLs, Application Load Balancer',
  sections: [
    {
      title: 'VPC: изолированная сеть в облаке',
      content: `**VPC (Virtual Private Cloud)** — логически изолированная сеть в AWS. Каждый аккаунт получает default VPC в каждом регионе, но для production создавай **custom VPC**.

**Зачем custom VPC:**
- Контроль CIDR-блоков (IP-адресация)
- Разделение public/private subnets
- Peering с другими VPC или on-premise (VPN/Direct Connect)
- Compliance (изоляция prod от dev)

**Компоненты VPC:**
- **Subnets** — сегменты сети внутри AZ
- **Route Tables** — правила маршрутизации
- **Internet Gateway (IGW)** — выход в интернет для public subnet
- **NAT Gateway** — исходящий интернет для private subnet
- **Security Groups** — firewall на уровне instance
- **NACLs** — firewall на уровне subnet
- **VPC Endpoints** — приватный доступ к AWS сервисам без интернета`,
    },
    {
      title: 'CIDR и планирование IP-адресов',
      content: `**CIDR (Classless Inter-Domain Routing)** — нотация для IP-диапазонов.

Примеры:
- \`10.0.0.0/16\` — 65 536 адресов (10.0.0.0 – 10.0.255.255)
- \`10.0.1.0/24\` — 256 адресов (10.0.1.0 – 10.0.1.255)
- \`172.16.0.0/12\` — private range (RFC 1918)
- \`192.168.0.0/16\` — private range

**Рекомендуемая схема для production:**
\`\`\`
VPC: 10.0.0.0/16
├── Public Subnet AZ-a:  10.0.1.0/24  (ALB, NAT, bastion)
├── Public Subnet AZ-b:  10.0.2.0/24
├── Private Subnet AZ-a: 10.0.10.0/24 (app servers, EKS nodes)
├── Private Subnet AZ-b: 10.0.11.0/24
├── DB Subnet AZ-a:      10.0.20.0/24 (RDS)
└── DB Subnet AZ-b:      10.0.21.0/24
\`\`\`

AWS резервирует 5 IP в каждой subnet: первые 4 + broadcast.`,
    },
    {
      title: 'Создание VPC и subnets',
      content: `Custom VPC создаётся вручную или через Terraform/CloudFormation. Default VPC имеет public subnets во всех AZ — удобно для обучения, но не для production.

**Subnet types:**
- **Public** — имеет маршрут 0.0.0.0/0 → IGW, instances могут иметь public IP
- **Private** — нет прямого доступа из интернета, исходящий через NAT
- **Isolated** — нет маршрута в интернет вообще (только VPC internal)

**Multi-AZ** — обязательно для production. RDS, ALB, EKS требуют минимум 2 AZ.`,
      code: {
        language: 'bash',
        code: `# Создать VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 \\
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=prod-vpc}]'

# Создать subnets в разных AZ
aws ec2 create-subnet --vpc-id vpc-0abc --cidr-block 10.0.1.0/24 \\
  --availability-zone eu-central-1a \\
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-1a}]'

aws ec2 create-subnet --vpc-id vpc-0abc --cidr-block 10.0.10.0/24 \\
  --availability-zone eu-central-1a \\
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-1a}]'

# Включить auto-assign public IP для public subnet
aws ec2 modify-subnet-attribute \\
  --subnet-id subnet-public \\
  --map-public-ip-on-launch`,
        caption: 'Создание VPC и subnets',
      },
    },
    {
      title: 'Internet Gateway и публичный доступ',
      content: `**Internet Gateway (IGW)** — горизонтально масштабируемый, redundant компонент, обеспечивающий:
- Маршрутизацию трафика VPC ↔ интернет
- NAT для instances с public IP
- Один IGW на VPC

**Для public subnet нужно:**
1. Создать и attach IGW к VPC
2. Добавить маршрут 0.0.0.0/0 → IGW в route table
3. Associate route table с public subnet
4. Instance должен иметь public IP (или Elastic IP)

**Elastic IP (EIP)** — статический публичный IPv4. Бесплатен, пока привязан к running instance. **Платный**, если привязан к stopped instance или не привязан вообще.`,
      code: {
        language: 'bash',
        code: `# Создать и привязать IGW
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --internet-gateway-id igw-0abc --vpc-id vpc-0abc

# Route table для public subnet
aws ec2 create-route-table --vpc-id vpc-0abc
aws ec2 create-route \\
  --route-table-id rtb-0abc \\
  --destination-cidr-block 0.0.0.0/0 \\
  --gateway-id igw-0abc

aws ec2 associate-route-table \\
  --route-table-id rtb-0abc \\
  --subnet-id subnet-public-1a

# Elastic IP
aws ec2 allocate-address --domain vpc
aws ec2 associate-address --instance-id i-0abc --allocation-id eipalloc-0abc`,
      },
    },
    {
      title: 'NAT Gateway: интернет для private subnet',
      content: `Instances в **private subnet** не имеют public IP. Но им нужен исходящий интернет для:
- Обновления пакетов (\`apt update\`)
- Вызовов внешних API
- Скачивания Docker images

**NAT Gateway** — managed сервис AWS:
- Размещается в **public subnet**
- Имеет Elastic IP
- Private subnet маршрутизирует 0.0.0.0/0 → NAT Gateway
- **~$32/мес + трафик** — самая частая «ловушка» расходов!

**NAT Instance** — self-managed EC2 (дешевле, но нужно поддерживать). Для production — NAT Gateway.

**VPC Endpoints** — альтернатива NAT для AWS сервисов (S3, DynamoDB, ECR) без выхода в интернет.`,
      code: {
        language: 'bash',
        code: `# Создать NAT Gateway в public subnet
aws ec2 create-nat-gateway \\
  --subnet-id subnet-public-1a \\
  --allocation-id eipalloc-0abc

# Route table для private subnet
aws ec2 create-route-table --vpc-id vpc-0abc
aws ec2 create-route \\
  --route-table-id rtb-private \\
  --destination-cidr-block 0.0.0.0/0 \\
  --nat-gateway-id nat-0abc

aws ec2 associate-route-table \\
  --route-table-id rtb-private \\
  --subnet-id subnet-private-1a`,
        caption: 'NAT Gateway для private subnet',
      },
    },
    {
      title: 'Route Tables: маршрутизация трафика',
      content: `**Route Table** — набор правил: «куда отправить пакет с destination X».

**Локальные маршруты (создаются автоматически):**
- \`10.0.0.0/16 → local\` — трафик внутри VPC
- \`pl-xxx (prefix list) → vpce-xxx\` — VPC Endpoint

**Типичные маршруты:**
| Destination | Target | Subnet |
|-------------|--------|--------|
| 10.0.0.0/16 | local | все |
| 0.0.0.0/0 | igw-xxx | public |
| 0.0.0.0/0 | nat-xxx | private |
| pl-63a5400a (S3) | vpce-xxx | private (без NAT!) |

**Main route table** — default для subnets без явной association. Не используй main для public/private — создавай отдельные.

**Propagation** — route table может получать маршруты от Virtual Private Gateway (VPN) или Transit Gateway.`,
    },
    {
      title: 'Security Groups: stateful firewall',
      content: `**Security Group (SG)** — виртуальный firewall на уровне **ENI (Elastic Network Interface)** — т.е. instance, ALB, RDS.

**Характеристики:**
- **Stateful** — если inbound разрешён, outbound ответ автоматически разрешён (и наоборот)
- Только **Allow** правила (нет Deny)
- Оцениваются **все** правила (разрешение если хоть одно match)
- Можно ссылаться на другие SG: \`source: sg-app\` → \`port: 5432\`
- Default SG разрешает all outbound, inbound только от себя

**Типичная схема:**
- \`sg-alb\` — inbound 80/443 from 0.0.0.0/0
- \`sg-app\` — inbound 8080 from sg-alb
- \`sg-db\` — inbound 5432 from sg-app`,
      code: {
        language: 'bash',
        code: `# SG для ALB
aws ec2 create-security-group --group-name alb-sg --vpc-id vpc-0abc
aws ec2 authorize-security-group-ingress --group-id sg-alb \\
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# SG для app — только от ALB
aws ec2 create-security-group --group-name app-sg --vpc-id vpc-0abc
aws ec2 authorize-security-group-ingress --group-id sg-app \\
  --protocol tcp --port 8080 --source-group sg-alb

# SG для RDS — только от app
aws ec2 create-security-group --group-name db-sg --vpc-id vpc-0abc
aws ec2 authorize-security-group-ingress --group-id sg-db \\
  --protocol tcp --port 5432 --source-group sg-app`,
        caption: 'Трёхуровневая схема Security Groups',
      },
    },
    {
      title: 'Network ACLs: stateless firewall на уровне subnet',
      content: `**NACL (Network Access Control List)** — firewall на уровне **subnet**. Stateless — нужны правила и для inbound, и для outbound.

**Характеристики:**
- **Stateless** — ответный трафик требует отдельного правила
- **Allow и Deny** — можно явно запретить IP (в SG нельзя)
- Оцениваются по **номеру правила** (от меньшего к большему), первое match побеждает
- Default NACL разрешает всё
- Custom NACL по умолчанию запрещает всё

**Когда использовать NACL:**
- Блокировка конкретных IP-диапазонов (compliance)
- Дополнительный слой защиты (defense in depth)
- Разделение DMZ subnet

**В 95% случаев достаточно Security Groups.** NACL — для специфических сценариев.`,
      code: {
        language: 'bash',
        code: `# Создать NACL и правила
aws ec2 create-network-acl --vpc-id vpc-0abc
aws ec2 create-network-acl-entry \\
  --network-acl-id acl-0abc \\
  --rule-number 100 \\
  --protocol tcp \\
  --port-range From=80,To=80 \\
  --cidr-block 0.0.0.0/0 \\
  --rule-action allow \\
  --ingress

# Deny конкретного IP
aws ec2 create-network-acl-entry \\
  --network-acl-id acl-0abc \\
  --rule-number 50 \\
  --protocol -1 \\
  --cidr-block 198.51.100.0/24 \\
  --rule-action deny \\
  --ingress`,
      },
    },
    {
      title: 'Security Groups vs NACLs: сравнение',
      content: `| Характеристика | Security Group | NACL |
|----------------|---------------|------|
| Уровень | Instance (ENI) | Subnet |
| Stateful | Да | Нет |
| Правила | Только Allow | Allow + Deny |
| Оценка | Все правила | По номеру, первый match |
| Применение | К конкретному ENI | Ко всем instances в subnet |
| Default | Allow outbound | Deny all (custom) |

**Defense in depth:** SG для application-level (app → db), NACL для network-level (блокировка IP).

**Типичная ошибка:** открыть port 22 (SSH) в SG на 0.0.0.0/0. Используй bastion host или AWS SSM Session Manager.`,
    },
    {
      title: 'Application Load Balancer (ALB)',
      content: `**ALB (Application Load Balancer)** — Layer 7 (HTTP/HTTPS) балансировщик. Распределяет трафик между targets (EC2, IP, Lambda, containers).

**Возможности ALB:**
- **Path-based routing** — \`/api/*\` → API targets, \`/*\` → frontend
- **Host-based routing** — \`api.example.com\` → API, \`www.example.com\` → web
- **SSL termination** — HTTPS на ALB, HTTP к backend
- **WebSocket** support
- **Sticky sessions** (cookies)
- **Health checks** — автоматическое исключение unhealthy targets
- **Integration с WAF** — защита от атак

**ALB vs NLB vs CLB:**
| Тип | Layer | Назначение |
|-----|-------|-----------|
| ALB | 7 (HTTP) | Web apps, microservices |
| NLB | 4 (TCP/UDP) | Ultra-low latency, static IP |
| CLB | 4/7 | Legacy, не используй |`,
    },
    {
      title: 'ALB: Target Groups, Listeners, Rules',
      content: `**Компоненты ALB:**

1. **Listener** — принимает трафик на порту (80, 443). Один ALB может иметь несколько listeners.
2. **Rules** — маршрутизация по path/host/header → Target Group
3. **Target Group** — группа targets (EC2 instances, IP addresses, Lambda)
4. **Health Check** — периодическая проверка (\`GET /health\` → 200)

**Target types:**
- **instance** — EC2 instance ID
- **ip** — IP address (on-premise, containers)
- **lambda** — serverless function

**ALB размещается в public subnet.** Targets могут быть в private subnet (ALB → app через SG).`,
      code: {
        language: 'bash',
        code: `# Создать ALB
aws elbv2 create-load-balancer \\
  --name my-alb \\
  --subnets subnet-public-1a subnet-public-1b \\
  --security-groups sg-alb \\
  --scheme internet-facing

# Target Group
aws elbv2 create-target-group \\
  --name app-tg \\
  --protocol HTTP --port 8080 \\
  --vpc-id vpc-0abc \\
  --health-check-path /health \\
  --health-check-interval-seconds 30

# Зарегистрировать targets
aws elbv2 register-targets \\
  --target-group-arn arn:aws:elasticloadbalancing:...:targetgroup/app-tg/... \\
  --targets Id=i-0abc1 Id=i-0abc2

# Listener HTTPS
aws elbv2 create-listener \\
  --load-balancer-arn arn:aws:elasticloadbalancing:...:loadbalancer/app/my-alb/... \\
  --protocol HTTPS --port 443 \\
  --certificates CertificateArn=arn:aws:acm:... \\
  --default-actions Type=forward,TargetGroupArn=arn:...:targetgroup/app-tg/...`,
        caption: 'Создание ALB с Target Group',
      },
    },
    {
      title: 'Route 53 и DNS для ALB',
      content: `**Route 53** — managed DNS сервис AWS.

**Типы записей:**
- **A** — IPv4 (можно Alias на ALB/CloudFront)
- **AAAA** — IPv6
- **CNAME** — алиас (нельзя на apex domain)
- **Alias** — AWS-специфичный, бесплатный, работает на apex

**Alias record** — указывает на AWS ресурс (ALB, CloudFront, S3). AWS автоматически обновляет IP при изменении.

**Health Checks** — Route 53 может проверять endpoint и переключать на failover.

**ACM (Certificate Manager)** — бесплатные SSL-сертификаты для ALB/CloudFront.`,
      code: {
        language: 'bash',
        code: `# Запросить SSL-сертификат
aws acm request-certificate \\
  --domain-name example.com \\
  --subject-alternative-names '*.example.com' \\
  --validation-method DNS

# Alias record на ALB
aws route53 change-resource-record-sets \\
  --hosted-zone-id Z1234567890 \\
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "app.example.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z215JYRZR1TBD5",
          "DNSName": "my-alb-123.eu-central-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'`,
      },
    },
    {
      title: 'VPC Flow Logs и сетевая диагностика',
      content: `**VPC Flow Logs** — логирование IP-трафика (accepted/rejected). Отправляется в CloudWatch Logs или S3.

Поля: srcaddr, dstaddr, srcport, dstport, protocol, action (ACCEPT/REJECT).

**Reachability Analyzer** — визуальная проверка: «может ли instance A достучаться до instance B?»

**Диагностика сетевых проблем:**
1. Security Group — inbound/outbound rules
2. NACL — stateless, проверь оба направления
3. Route Table — правильный gateway?
4. Subnet — public или private?
5. Instance — public IP / Elastic IP?
6. DNS — правильный endpoint?
7. Flow Logs — ACCEPT или REJECT?`,
      code: {
        language: 'bash',
        code: `# Включить VPC Flow Logs
aws ec2 create-flow-logs \\
  --resource-type VPC \\
  --resource-ids vpc-0abc \\
  --traffic-type ALL \\
  --log-destination-type cloud-watch-logs \\
  --log-group-name /vpc/flow-logs/prod

# Проверить SG rules
aws ec2 describe-security-groups --group-ids sg-0abc

# Traceroute из EC2
traceroute -n 10.0.20.5
curl -v http://internal-alb.local/health`,
      },
    },
    {
      title: 'VPC Peering и Transit Gateway',
      content: `**VPC Peering** — соединение двух VPC (1:1). Трафик остаётся в AWS backbone. **Нет транзитивности** — если A↔B и B↔C, то A↔C не работает.

**Transit Gateway** — hub-and-spoke модель. Один TGW соединяет множество VPC, VPN, Direct Connect. Транзитивная маршрутизация.

**VPN (Site-to-Site)** — IPsec туннель между on-premise и AWS VPC.

**Direct Connect** — выделенное физическое соединение (1–100 Gbps). Для enterprise с большим трафиком.

**PrivateLink** — доступ к сервису другого аккаунта/VPC без peering (consumer → endpoint → provider).`,
    },
    {
      title: 'Лабораторная: production-ready VPC',
      content: `**Цель:** создать VPC с public/private subnets, NAT, ALB и трёхуровневой архитектурой.

**Архитектура:**
\`\`\`
Internet → IGW → ALB (public subnet)
                  ↓
              App EC2 (private subnet) → RDS (private subnet)
                  ↓
              NAT Gateway (public subnet) → Internet (updates)
\`\`\`

**Шаги:**
1. VPC 10.0.0.0/16, 2 AZ
2. Public subnets (10.0.1.0/24, 10.0.2.0/24) + IGW + route
3. Private subnets (10.0.10.0/24, 10.0.11.0/24) + NAT GW + route
4. Security Groups: alb-sg, app-sg, db-sg (цепочка)
5. ALB в public, EC2 app в private, зарегистрировать в Target Group
6. RDS PostgreSQL в private subnet, доступ только от app-sg
7. Route 53 + ACM для HTTPS
8. VPC Flow Logs для аудита
9. **Удали всё** после лабораторной`,
    },
  ],
  practice: [
    'Создай custom VPC с public и private subnets в 2 AZ',
    'Настрой IGW, NAT Gateway, route tables',
    'Создай цепочку Security Groups: ALB → App → DB',
    'Разверни ALB с Target Group и health checks',
    'Настрой VPC Flow Logs и проанализируй трафик',
    'Пройди лабораторную «production-ready VPC»',
  ],
  resources: [
    { title: 'VPC User Guide', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/' },
    { title: 'ALB Guide', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/' },
    { title: 'AWS Network Firewall', url: 'https://docs.aws.amazon.com/network-firewall/' },
  ],
}
