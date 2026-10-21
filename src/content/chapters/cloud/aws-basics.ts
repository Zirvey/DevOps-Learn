import type { Chapter } from '../../../types'

export const awsBasicsChapter: Chapter = {
  id: 'aws-basics',
  slug: 'aws-basics',
  title: 'AWS: основы и ключевые сервисы',
  moduleId: 'cloud',
  order: 0,
  duration: '8–10 часов',
  level: 'intermediate',
  description:
    'Регистрация аккаунта, IAM, AWS CLI, EC2, S3 и обзор экосистемы Amazon Web Services',
  sections: [
    {
      title: 'Почему AWS и модель облачных вычислений',
      content: `**Amazon Web Services (AWS)** — крупнейший публичный облачный провайдер (~32% рынка IaaS/PaaS). Более половины вакансий DevOps в международных компаниях упоминают AWS.

**Модель облака:**
- **IaaS** (Infrastructure as a Service) — EC2, VPC, EBS: ты управляешь ОС и приложениями
- **PaaS** (Platform as a Service) — Elastic Beanstalk, RDS: провайдер управляет ОС
- **SaaS** (Software as a Service) — готовые приложения (WorkMail, Chime)

**Модели оплаты:**
- **On-Demand** — платишь за фактическое использование (почасово/посекундно)
- **Reserved Instances / Savings Plans** — скидка до 72% при обязательстве на 1–3 года
- **Spot Instances** — до 90% скидки, но AWS может забрать инстанс с уведомлением за 2 минуты

**Альтернативы:** GCP (силён в Kubernetes и data), Azure (enterprise, Microsoft-стек), Yandex Cloud / VK Cloud (локализация данных в РФ). Принципы переносятся между провайдерами — начни с одного и углубись.`,
    },
    {
      title: 'Создание AWS-аккаунта и организация',
      content: `Первый шаг — регистрация на [aws.amazon.com](https://aws.amazon.com). Потребуется банковская карта (списание $1 для верификации, возвращается).

**Сразу после регистрации:**
1. **Включи MFA на root-аккаунте** — root имеет неограниченные права, его нельзя использовать для повседневной работы
2. **Создай IAM-пользователя с AdministratorAccess** (или ограниченными правами) и используй его
3. **Настрой AWS Budgets** — алерт при превышении $10/50/100
4. **Выбери регион по умолчанию** — eu-central-1 (Франкфурт) для EU, us-east-1 для максимального набора сервисов

**AWS Organizations** — для компаний с несколькими аккаунтами:
- **Management account** — центральное управление
- **Member accounts** — dev, staging, prod изолированы
- **SCP (Service Control Policies)** — ограничения сверху (например, запрет создания ресурсов вне EU)
- **Consolidated Billing** — единый счёт со скидками за объём`,
      code: {
        language: 'bash',
        code: `# Проверка текущего аккаунта и региона
aws sts get-caller-identity
# Вывод: Account, Arn, UserId

aws configure get region
aws ec2 describe-regions --query 'Regions[].RegionName' --output table`,
        caption: 'Проверка аккаунта после настройки CLI',
      },
    },
    {
      title: 'Free Tier, биллинг и контроль расходов',
      content: `**AWS Free Tier** действует 12 месяцев для новых аккаунтов + всегда бесплатные сервисы:

| Сервис | Free Tier |
|--------|-----------|
| EC2 | 750 ч/мес t2.micro/t3.micro |
| S3 | 5 GB стандартного хранения |
| RDS | 750 ч db.t2.micro |
| Lambda | 1 млн запросов/мес |
| CloudWatch | 10 метрик, 5 GB логов |

**Типичные ловушки Free Tier:**
- NAT Gateway — **~$32/мес** даже без трафика (не входит в Free Tier!)
- Elastic IP, привязанный к остановленному инстансу — платный
- EBS volumes, не привязанные к инстансу — платные
- Трафик между регионами — платный

**Инструменты контроля:**
- **Cost Explorer** — анализ расходов по сервисам
- **AWS Budgets** — алерты при превышении
- **Billing Alarms** — CloudWatch alarm на EstimatedCharges
- Теги \`Environment\`, \`Project\`, \`Owner\` — обязательны для отчётности`,
      code: {
        language: 'bash',
        code: `# Создать budget alert через CLI
aws budgets create-budget \\
  --account-id $(aws sts get-caller-identity --query Account --output text) \\
  --budget '{
    "BudgetName": "monthly-50",
    "BudgetLimit": {"Amount": "50", "Unit": "USD"},
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }' \\
  --notifications-with-subscribers '[{
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [{"SubscriptionType": "EMAIL", "Address": "you@example.com"}]
  }]'`,
      },
    },
    {
      title: 'Регионы, Availability Zones и Edge Locations',
      content: `**Region** — географическая область (eu-central-1, us-east-1). Сервисы в разных регионах **полностью изолированы**.

**Availability Zone (AZ)** — изолированный дата-центр внутри региона. Обычно 3+ AZ на регион. Для отказоустойчивости размещай ресурсы в нескольких AZ.

**Local Zone / Wavelength** — расширения ближе к пользователям (низкая latency).

**Edge Locations** — CDN-точки для CloudFront (200+ по миру).

**Выбор региона:**
- **Latency** — ближе к пользователям
- **Compliance** — GDPR требует EU-регион
- **Сервисы** — не все сервисы доступны везде (новые сначала в us-east-1)
- **Цена** — us-east-1 обычно дешевле

**ARN (Amazon Resource Name)** — уникальный идентификатор ресурса:
\`arn:aws:ec2:eu-central-1:123456789012:instance/i-0abc123\``,
    },
    {
      title: 'IAM: основа безопасности AWS',
      content: `**IAM (Identity and Access Management)** — сервис аутентификации и авторизации. Каждый API-вызов в AWS проверяется IAM.

**Ключевые сущности:**
- **User** — долгоживущие credentials для людей или сервисов
- **Group** — коллекция пользователей с общими правами
- **Role** — временные credentials, которые «надевают» сервисы (EC2, Lambda, EKS)
- **Policy** — JSON-документ, описывающий разрешения (Allow/Deny)

**Принцип Least Privilege** — давай минимально необходимые права. Никогда не используй \`*\` в Action без крайней необходимости.

**Root account** — создаётся при регистрации, имеет полный доступ. Используй только для:
- Смены billing info
- Восстановления доступа
- Создания первого IAM admin

Всё остальное — через IAM User/Role.`,
    },
    {
      title: 'IAM Users: создание и управление',
      content: `IAM User — идентификатор для человека или приложения с долгоживущими credentials.

**Типы credentials:**
- **Console password** — вход в веб-консоль
- **Access Key ID + Secret Access Key** — для CLI/SDK (максимум 2 пары на user)

**Best practices:**
- Один user на человека (не shared accounts)
- MFA обязателен для production
- Access keys ротируй каждые 90 дней
- Не создавай access keys для console-only пользователей`,
      code: {
        language: 'bash',
        code: `# Создание IAM user через CLI
aws iam create-user --user-name devops-engineer

aws iam create-login-profile \\
  --user-name devops-engineer \\
  --password 'TempPass123!' \\
  --password-reset-required

aws iam create-access-key --user-name devops-engineer

# Привязка managed policy
aws iam attach-user-policy \\
  --user-name devops-engineer \\
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

# Список пользователей
aws iam list-users --query 'Users[].UserName'`,
        caption: 'Управление IAM Users',
      },
    },
    {
      title: 'IAM Roles: временные credentials для сервисов',
      content: `**Role** — набор permissions без постоянных credentials. Сервис «надевает» роль и получает **временные** credentials через **STS (Security Token Service)**.

**Когда использовать Roles:**
- EC2 instance → доступ к S3 без hardcoded keys
- Lambda → доступ к DynamoDB
- EKS Pod → доступ к AWS API через IRSA
- CI/CD (GitHub Actions) → OIDC federation, без long-lived keys
- Cross-account access — роль в аккаунте B, которую надевает аккаунт A

**Trust Policy** — кто может «надеть» роль:
\`\`\`json
{
  "Effect": "Allow",
  "Principal": {"Service": "ec2.amazonaws.com"},
  "Action": "sts:AssumeRole"
}
\`\`\`

**Permission Policy** — что роль может делать (тот же формат, что у User).`,
      code: {
        language: 'bash',
        code: `# Создать роль для EC2 с доступом к S3
aws iam create-role \\
  --role-name EC2-S3-ReadOnly \\
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy \\
  --role-name EC2-S3-ReadOnly \\
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

aws iam create-instance-profile --instance-profile-name EC2-S3-Profile
aws iam add-role-to-instance-profile \\
  --instance-profile-name EC2-S3-Profile \\
  --role-name EC2-S3-ReadOnly`,
        caption: 'IAM Role для EC2 → S3',
      },
    },
    {
      title: 'IAM Policies: структура и best practices',
      content: `Policy — JSON-документ с **Statement** массивом. Каждый Statement содержит:

- **Effect** — Allow или Deny (Deny всегда побеждает)
- **Action** — какие API-вызовы разрешены (\`s3:GetObject\`, \`ec2:*\`)
- **Resource** — на какие ресурсы (ARN)
- **Condition** — дополнительные ограничения (IP, MFA, tags)

**Типы policies:**
- **AWS Managed** — готовые от AWS (\`AmazonS3ReadOnlyAccess\`)
- **Customer Managed** — созданные вами, переиспользуемые
- **Inline** — привязаны к одному user/role/group (не рекомендуется для production)

**Policy Evaluation Logic:**
1. Explicit Deny → запрет
2. Explicit Allow → разрешение (если нет Deny)
3. Default → неявный Deny`,
      code: {
        language: 'json',
        code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBuckets",
      "Effect": "Allow",
      "Action": ["s3:ListAllMyBuckets", "s3:GetBucketLocation"],
      "Resource": "*"
    },
    {
      "Sid": "BucketAccess",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::my-app-uploads/*",
      "Condition": {
        "StringEquals": {"s3:x-amz-server-side-encryption": "AES256"}
      }
    }
  ]
}`,
        caption: 'Customer Managed Policy — доступ к одному S3 bucket с шифрованием',
      },
    },
    {
      title: 'MFA, Credential Report и аудит IAM',
      content: `**MFA (Multi-Factor Authentication)** — обязателен для:
- Root account
- IAM users с console access
- Sensitive API operations (можно требовать через Condition)

**Типы MFA:**
- **Virtual** — Google Authenticator, Authy (бесплатно)
- **Hardware** — YubiKey, Gemalto (для compliance)
- **SMS** — не рекомендуется (SIM-swap атаки)

**IAM Credential Report** — CSV со статусом всех users (MFA, access keys age, last used).

**IAM Access Analyzer** — находит ресурсы, доступные извне (public S3, open SG).

**CloudTrail** — логирует все API-вызовы (кто, когда, что). Обязателен для аудита.`,
      code: {
        language: 'bash',
        code: `# Включить MFA для IAM user (виртуальный)
aws iam create-virtual-mfa-device \\
  --virtual-mfa-device-name devops-mfa \\
  --outfile QRCode.png \\
  --bootstrap-method QRCodePNG

aws iam enable-mfa-device \\
  --user-name devops-engineer \\
  --serial-number arn:aws:iam::ACCOUNT:mfa/devops-mfa \\
  --authentication-code-1 123456 \\
  --authentication-code-2 789012

# Credential Report
aws iam generate-credential-report
aws iam get-credential-report --query 'Content' --output text | base64 -d`,
      },
    },
    {
      title: 'AWS CLI: установка и настройка',
      content: `**AWS CLI v2** — основной инструмент взаимодействия с AWS из терминала. Устанавливается на Linux, macOS, Windows.

**Способы аутентификации (в порядке приоритета):**
1. **Environment variables** — \`AWS_ACCESS_KEY_ID\`, \`AWS_SECRET_ACCESS_KEY\`, \`AWS_SESSION_TOKEN\`
2. **Shared credentials file** — \`~/.aws/credentials\`
3. **Config file** — \`~/.aws/config\` (region, output format, profiles)
4. **IAM Role** — на EC2/ECS/Lambda (автоматически)
5. **SSO** — \`aws sso login\` для enterprise

**Profiles** — несколько аккаунтов/ролей:
\`aws s3 ls --profile production\``,
      code: {
        language: 'bash',
        code: `# Установка AWS CLI v2 (macOS)
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o AWSCLIV2.pkg
sudo installer -pkg AWSCLIV2.pkg -target /

# Базовая настройка
aws configure
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region: eu-central-1
# Default output format: json

# Несколько профилей
aws configure --profile dev
aws configure --profile prod

# Использование профиля
export AWS_PROFILE=prod
aws sts get-caller-identity

# Assume Role
aws sts assume-role \\
  --role-arn arn:aws:iam::123456789012:role/DeployRole \\
  --role-session-name deploy-session`,
        caption: 'Установка и configure AWS CLI',
      },
    },
    {
      title: 'EC2: обзор и типы инстансов',
      content: `**EC2 (Elastic Compute Cloud)** — виртуальные машины в облаке. Основа compute в AWS.

**Ключевые понятия:**
- **Instance** — запущенная VM
- **AMI (Amazon Machine Image)** — шаблон (ОС + софт)
- **Instance Type** — размер (CPU, RAM, network)
- **EBS Volume** — диск, привязанный к инстансу
- **Key Pair** — SSH-ключ для Linux, пароль для Windows
- **Security Group** — виртуальный firewall
- **Elastic IP** — статический публичный IP

**Семейства instance types:**
| Префикс | Назначение | Пример |
|---------|-----------|--------|
| t3/t4g | Burstable, dev/test | t3.micro (Free Tier) |
| m6i/m7g | General purpose | m6i.large |
| c6i | Compute-optimized | c6i.xlarge |
| r6i | Memory-optimized | r6i.2xlarge |
| g5 | GPU | g5.xlarge |

**Purchasing options:** On-Demand, Reserved, Spot, Dedicated Host.`,
    },
    {
      title: 'EC2: запуск инстанса и подключение',
      content: `Полный цикл: AMI → Launch → Security Group → Key Pair → Connect.

**User Data** — скрипт, выполняемый при первом запуске (cloud-init). Используй для автоматической настройки (установка nginx, docker).

**Instance Metadata Service (IMDSv2)** — \`http://169.254.169.254/latest/meta-data/\` — инстанс получает информацию о себе (instance-id, AZ, IAM role credentials). **Всегда используй IMDSv2** (требует token).`,
      code: {
        language: 'bash',
        code: `# Создать key pair
aws ec2 create-key-pair \\
  --key-name my-key \\
  --query 'KeyMaterial' \\
  --output text > ~/.ssh/my-key.pem
chmod 400 ~/.ssh/my-key.pem

# Запустить инстанс
aws ec2 run-instances \\
  --image-id ami-0c7217cdde317cfec \\
  --instance-type t3.micro \\
  --key-name my-key \\
  --security-group-ids sg-0123456789abcdef0 \\
  --subnet-id subnet-0abc123 \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-server}]' \\
  --user-data '#!/bin/bash
yum update -y
yum install -y nginx
systemctl start nginx
systemctl enable nginx'

# Подключение по SSH
ssh -i ~/.ssh/my-key.pem ec2-user@<public-ip>

# Остановка и удаление
aws ec2 stop-instances --instance-ids i-0abc123
aws ec2 terminate-instances --instance-ids i-0abc123`,
        caption: 'Запуск EC2 и SSH-подключение',
      },
    },
    {
      title: 'EC2: Security Groups и EBS',
      content: `**Security Group (SG)** — stateful firewall на уровне инстанса:
- **Inbound** — входящий трафик (SSH :22, HTTP :80, HTTPS :443)
- **Outbound** — исходящий (обычно All traffic разрешён)
- Правила только Allow (нет Deny)
- Можно ссылаться на другие SG (app-SG → db-SG :5432)

**EBS (Elastic Block Store)** — блочное хранилище:
- **gp3** — general purpose SSD (default, 3000 IOPS)
- **io2** — high IOPS для БД
- **st1** — throughput-optimized HDD
- Snapshots — бэкапы в S3, можно копировать между регионами
- **Volume не удаляется** при terminate, если \`DeleteOnTermination=false\`

**Placement Groups** — стратегия размещения: cluster (низкая latency), spread (отказоустойчивость), partition.`,
      code: {
        language: 'bash',
        code: `# Создать Security Group
aws ec2 create-security-group \\
  --group-name web-sg \\
  --description "Web server SG" \\
  --vpc-id vpc-0abc123

aws ec2 authorize-security-group-ingress \\
  --group-id sg-0abc123 \\
  --protocol tcp --port 22 --cidr 203.0.113.0/24

aws ec2 authorize-security-group-ingress \\
  --group-id sg-0abc123 \\
  --protocol tcp --port 80 --cidr 0.0.0.0/0

# Создать и примонтировать EBS volume
aws ec2 create-volume --size 20 --volume-type gp3 --availability-zone eu-central-1a
aws ec2 attach-volume --volume-id vol-0abc --instance-id i-0abc --device /dev/sdf`,
      },
    },
    {
      title: 'S3: объектное хранилище',
      content: `**S3 (Simple Storage Service)** — объектное хранилище с 99.999999999% (11 девяток) durability.

**Ключевые понятия:**
- **Bucket** — контейнер (глобально уникальное имя)
- **Object** — файл + metadata (до 5 TB)
- **Key** — путь к объекту (\`images/photo.jpg\`)
- **Versioning** — хранение всех версий объекта
- **Lifecycle** — автоматический переход в Glacier / удаление
- **Replication** — копирование в другой регион/bucket

**Storage Classes:**
| Класс | Назначение |
|-------|-----------|
| S3 Standard | Частый доступ |
| S3 IA | Редкий доступ (дешевле) |
| S3 Glacier | Архив (минуты–часы retrieval) |
| S3 Intelligent-Tiering | Автоматический выбор |

**Static Website Hosting** — S3 может хостить статику (HTML/CSS/JS) + CloudFront для CDN.`,
      code: {
        language: 'bash',
        code: `# Создать bucket
aws s3 mb s3://my-devops-handbook-$(date +%s) --region eu-central-1

# Загрузить файл
aws s3 cp index.html s3://my-bucket/
aws s3 sync ./dist s3://my-bucket/ --delete

# Публичный доступ (осторожно!)
aws s3api put-bucket-policy --bucket my-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}'

# Включить versioning
aws s3api put-bucket-versioning \\
  --bucket my-bucket \\
  --versioning-configuration Status=Enabled

# Список объектов
aws s3 ls s3://my-bucket/ --recursive --human-readable`,
        caption: 'Основные операции S3',
      },
    },
    {
      title: 'S3: безопасность и best practices',
      content: `**S3 Security Layers:**
1. **Block Public Access** — глобальный запрет публичного доступа (включай по умолчанию!)
2. **Bucket Policy** — resource-based policy (кто может access)
3. **ACL** — legacy, не используй
4. **IAM Policy** — user/role-based access
5. **Encryption** — SSE-S3 (AWS managed), SSE-KMS (customer managed key), SSE-C (customer provided)
6. **Access Points** — именованные entry points с отдельными policies

**Типичные инциденты:**
- Открытый bucket с PII → штрафы GDPR
- Credentials в публичном bucket → компрометация

**Best practices:**
- Block Public Access = ON
- Encryption at rest = ON
- Versioning = ON для критичных данных
- MFA Delete для production buckets
- Access Logging → отдельный bucket`,
      code: {
        language: 'json',
        code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-secure-bucket/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms"
        }
      }
    },
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-secure-bucket",
        "arn:aws:s3:::my-secure-bucket/*"
      ],
      "Condition": {
        "Bool": {"aws:SecureTransport": "false"}
      }
    }
  ]
}`,
        caption: 'Bucket Policy — шифрование и HTTPS обязательны',
      },
    },
    {
      title: 'Обзор ключевых сервисов AWS',
      content: `**Compute:**
- **EC2** — виртуальные машины
- **Lambda** — serverless functions (платишь за вызовы)
- **ECS/EKS** — контейнеры (managed K8s = EKS)
- **Elastic Beanstalk** — PaaS для веб-приложений

**Storage:**
- **S3** — объекты
- **EBS** — блочные диски для EC2
- **EFS** — shared file system (NFS)
- **FSx** — Windows/Lustre file systems

**Database:**
- **RDS** — managed PostgreSQL, MySQL, MariaDB, Oracle, SQL Server
- **Aurora** — AWS-оптимизированная БД (совместима с PG/MySQL)
- **DynamoDB** — NoSQL key-value
- **ElastiCache** — Redis/Memcached

**Networking:** VPC, Route 53 (DNS), CloudFront (CDN), API Gateway

**Security:** IAM, KMS, Secrets Manager, WAF, Shield

**Monitoring:** CloudWatch (метрики, логи, алерты), X-Ray (tracing)

**DevOps:** CodePipeline, CodeBuild, CodeDeploy, CloudFormation, Systems Manager`,
    },
    {
      title: 'Лабораторная: полный цикл EC2 + S3 + IAM Role',
      content: `**Цель:** развернуть веб-сервер на EC2, который читает файлы из S3 через IAM Role (без hardcoded credentials).

**Шаги:**
1. Создай S3 bucket, загрузи \`index.html\`
2. Создай IAM Role с policy \`s3:GetObject\` на bucket
3. Создай Security Group: inbound 22 (твой IP), 80 (0.0.0.0/0)
4. Запусти EC2 (Amazon Linux 2023, t3.micro) с IAM Role
5. User Data: установи nginx, скачай index.html из S3 через AWS CLI
6. Проверь в браузере: \`http://<public-ip>\`
7. **Удали всё** после лабораторной (terminate EC2, delete bucket, delete role)

Эта лабораторная закрепляет IAM Roles, EC2, S3, Security Groups — фундамент AWS.`,
      code: {
        language: 'bash',
        code: `#!/bin/bash
# User Data для EC2
yum update -y && yum install -y nginx aws-cli
aws s3 cp s3://my-bucket/index.html /usr/share/nginx/html/
systemctl start nginx && systemctl enable nginx`,
        caption: 'User Data — nginx + S3',
      },
    },
  ],
  practice: [
    'Создай AWS Free Tier аккаунт, включи MFA на root, настрой Budget alert на $10',
    'Создай IAM user с MFA, настрой AWS CLI с профилем',
    'Запусти EC2 t3.micro (Amazon Linux), подключись по SSH, установи nginx',
    'Создай S3 bucket, загрузи статический сайт, включи Block Public Access',
    'Создай IAM Role для EC2 с доступом к S3, привяжи к инстансу',
    'Пройди лабораторную «полный цикл EC2 + S3 + IAM Role»',
    'Изучи Cost Explorer — найди самые дорогие сервисы (если есть)',
  ],
  resources: [
    { title: 'AWS Free Tier', url: 'https://aws.amazon.com/free/' },
    { title: 'AWS Skill Builder', url: 'https://skillbuilder.aws' },
    { title: 'AWS CLI Reference', url: 'https://docs.aws.amazon.com/cli/latest/reference/' },
    { title: 'IAM Best Practices', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html' },
    { title: 'EC2 User Guide', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/' },
  ],
}
