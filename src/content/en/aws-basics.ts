import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `AWS: fundamentals and key services`,
  duration: `8–10 hours`,
  description: `Account signup, IAM, AWS CLI, EC2, S3, and an overview of the Amazon Web Services ecosystem`,
  sections: [
    {
      title: `Why AWS and the cloud computing model`,
      content: `**Amazon Web Services (AWS)** is the largest public cloud provider (~32% of the IaaS/PaaS market). More than half of DevOps job posts at international companies mention AWS.

**Cloud models:**
- **IaaS** (Infrastructure as a Service) — EC2, VPC, EBS: you manage the OS and applications
- **PaaS** (Platform as a Service) — Elastic Beanstalk, RDS: the provider manages the OS
- **SaaS** (Software as a Service) — ready-made apps (WorkMail, Chime)

**Pricing models:**
- **On-Demand** — pay for actual usage (hourly/per-second)
- **Reserved Instances / Savings Plans** — up to 72% discount with a 1–3 year commitment
- **Spot Instances** — up to 90% discount, but AWS can reclaim the instance with a 2-minute warning

**Alternatives:** GCP (strong in Kubernetes and data), Azure (enterprise, Microsoft stack), Yandex Cloud / VK Cloud (data residency in RU). Principles transfer across providers — start with one and go deep.`,
    },
    {
      title: `Creating an AWS account and organization`,
      content: `The first step is signing up at [aws.amazon.com](https://aws.amazon.com). You will need a bank card ($1 verification charge, refunded).

**Right after registration:**
1. **Enable MFA on the root account** — root has unlimited permissions; do not use it for daily work
2. **Create an IAM user with AdministratorAccess** (or limited permissions) and use that
3. **Set up AWS Budgets** — alert when spending exceeds $10/50/100
4. **Pick a default region** — eu-central-1 (Frankfurt) for the EU, us-east-1 for the widest service coverage

**AWS Organizations** — for companies with multiple accounts:
- **Management account** — central administration
- **Member accounts** — dev, staging, prod are isolated
- **SCP (Service Control Policies)** — top-level guardrails (e.g. ban creating resources outside the EU)
- **Consolidated Billing** — one bill with volume discounts`,
      code: {
        language: `bash`,
        code: `# Проверка текущего аккаунта и региона
aws sts get-caller-identity
# Вывод: Account, Arn, UserId

aws configure get region
aws ec2 describe-regions --query 'Regions[].RegionName' --output table`,
        caption: `Account check after CLI setup`,
      },
    },
    {
      title: `Free Tier, billing, and cost control`,
      content: `**AWS Free Tier** lasts 12 months for new accounts, plus always-free services:

| Service | Free Tier |
|--------|-----------|
| EC2 | 750 h/mo t2.micro/t3.micro |
| S3 | 5 GB standard storage |
| RDS | 750 h db.t2.micro |
| Lambda | 1M requests/mo |
| CloudWatch | 10 metrics, 5 GB logs |

**Common Free Tier traps:**
- NAT Gateway — **~$32/mo** even with no traffic (not in Free Tier!)
- Elastic IP attached to a stopped instance — billed
- EBS volumes not attached to an instance — billed
- Cross-region traffic — billed

**Cost control tools:**
- **Cost Explorer** — spend analysis by service
- **AWS Budgets** — overspend alerts
- **Billing Alarms** — CloudWatch alarm on EstimatedCharges
- Tags \`Environment\`, \`Project\`, \`Owner\` — required for reporting`,
      code: {
        language: `bash`,
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
      title: `Regions, Availability Zones, and Edge Locations`,
      content: `**Region** — a geographic area (eu-central-1, us-east-1). Services in different regions are **fully isolated**.

**Availability Zone (AZ)** — an isolated data center inside a region. Usually 3+ AZs per region. For fault tolerance, place resources across multiple AZs.

**Local Zone / Wavelength** — extensions closer to users (low latency).

**Edge Locations** — CDN points for CloudFront (200+ worldwide).

**Choosing a region:**
- **Latency** — closer to users
- **Compliance** — GDPR may require an EU region
- **Services** — not all services are everywhere (new ones often land in us-east-1 first)
- **Price** — us-east-1 is usually cheaper

**ARN (Amazon Resource Name)** — unique resource identifier:
\`arn:aws:ec2:eu-central-1:123456789012:instance/i-0abc123\``,
    },
    {
      title: `IAM: the foundation of AWS security`,
      content: `**IAM (Identity and Access Management)** — authentication and authorization. Every AWS API call is checked by IAM.

**Key entities:**
- **User** — long-lived credentials for people or services
- **Group** — a collection of users with shared permissions
- **Role** — temporary credentials that services “assume” (EC2, Lambda, EKS)
- **Policy** — a JSON document describing permissions (Allow/Deny)

**Least Privilege** — grant the minimum required permissions. Never use \`*\` in Action unless you truly must.

**Root account** — created at signup, has full access. Use it only for:
- Changing billing info
- Recovering access
- Creating the first IAM admin

Everything else — via IAM User/Role.`,
    },
    {
      title: `IAM Users: create and manage`,
      content: `An IAM User is an identity for a person or application with long-lived credentials.

**Credential types:**
- **Console password** — web console login
- **Access Key ID + Secret Access Key** — for CLI/SDK (max 2 pairs per user)

**Best practices:**
- One user per person (no shared accounts)
- MFA required for production
- Rotate access keys every 90 days
- Do not create access keys for console-only users`,
      code: {
        language: `bash`,
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
        caption: `Managing IAM Users`,
      },
    },
    {
      title: `IAM Roles: temporary credentials for services`,
      content: `**Role** — a set of permissions without permanent credentials. A service “assumes” the role and gets **temporary** credentials via **STS (Security Token Service)**.

**When to use Roles:**
- EC2 instance → S3 access without hardcoded keys
- Lambda → DynamoDB access
- EKS Pod → AWS API access via IRSA
- CI/CD (GitHub Actions) → OIDC federation, no long-lived keys
- Cross-account access — a role in account B assumed by account A

**Trust Policy** — who can assume the role:
\`\`\`json
{
  "Effect": "Allow",
  "Principal": {"Service": "ec2.amazonaws.com"},
  "Action": "sts:AssumeRole"
}
\`\`\`

**Permission Policy** — what the role can do (same format as for a User).`,
      code: {
        language: `bash`,
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
        caption: `IAM Role for EC2 → S3`,
      },
    },
    {
      title: `IAM Policies: structure and best practices`,
      content: `A Policy is a JSON document with a **Statement** array. Each Statement contains:

- **Effect** — Allow or Deny (Deny always wins)
- **Action** — which API calls are allowed (\`s3:GetObject\`, \`ec2:*\`)
- **Resource** — which resources (ARN)
- **Condition** — extra constraints (IP, MFA, tags)

**Policy types:**
- **AWS Managed** — ready-made from AWS (\`AmazonS3ReadOnlyAccess\`)
- **Customer Managed** — created by you, reusable
- **Inline** — attached to one user/role/group (not recommended for production)

**Policy Evaluation Logic:**
1. Explicit Deny → deny
2. Explicit Allow → allow (if no Deny)
3. Default → implicit Deny`,
      code: {
        language: `json`,
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
        caption: `Customer Managed Policy — access to one S3 bucket with encryption`,
      },
    },
    {
      title: `MFA, Credential Report, and IAM audit`,
      content: `**MFA (Multi-Factor Authentication)** is required for:
- Root account
- IAM users with console access
- Sensitive API operations (can be required via Condition)

**MFA types:**
- **Virtual** — Google Authenticator, Authy (free)
- **Hardware** — YubiKey, Gemalto (for compliance)
- **SMS** — not recommended (SIM-swap attacks)

**IAM Credential Report** — CSV with status of all users (MFA, access key age, last used).

**IAM Access Analyzer** — finds resources reachable from outside (public S3, open SG).

**CloudTrail** — logs all API calls (who, when, what). Required for audit.`,
      code: {
        language: `bash`,
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
      title: `AWS CLI: install and configure`,
      content: `**AWS CLI v2** is the main way to work with AWS from the terminal. Installs on Linux, macOS, Windows.

**Authentication methods (priority order):**
1. **Environment variables** — \`AWS_ACCESS_KEY_ID\`, \`AWS_SECRET_ACCESS_KEY\`, \`AWS_SESSION_TOKEN\`
2. **Shared credentials file** — \`~/.aws/credentials\`
3. **Config file** — \`~/.aws/config\` (region, output format, profiles)
4. **IAM Role** — on EC2/ECS/Lambda (automatic)
5. **SSO** — \`aws sso login\` for enterprise

**Profiles** — multiple accounts/roles:
\`aws s3 ls --profile production\``,
      code: {
        language: `bash`,
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
        caption: `Install and configure AWS CLI`,
      },
    },
    {
      title: `EC2: overview and instance types`,
      content: `**EC2 (Elastic Compute Cloud)** — virtual machines in the cloud. The foundation of compute in AWS.

**Key concepts:**
- **Instance** — a running VM
- **AMI (Amazon Machine Image)** — template (OS + software)
- **Instance Type** — size (CPU, RAM, network)
- **EBS Volume** — disk attached to the instance
- **Key Pair** — SSH key for Linux, password for Windows
- **Security Group** — virtual firewall
- **Elastic IP** — static public IP

**Instance type families:**
| Prefix | Purpose | Example |
|---------|-----------|--------|
| t3/t4g | Burstable, dev/test | t3.micro (Free Tier) |
| m6i/m7g | General purpose | m6i.large |
| c6i | Compute-optimized | c6i.xlarge |
| r6i | Memory-optimized | r6i.2xlarge |
| g5 | GPU | g5.xlarge |

**Purchasing options:** On-Demand, Reserved, Spot, Dedicated Host.`,
    },
    {
      title: `EC2: launch an instance and connect`,
      content: `Full cycle: AMI → Launch → Security Group → Key Pair → Connect.

**User Data** — a script run on first boot (cloud-init). Use it for automatic setup (install nginx, docker).

**Instance Metadata Service (IMDSv2)** — \`http://169.254.169.254/latest/meta-data/\` — the instance gets information about itself (instance-id, AZ, IAM role credentials). **Always use IMDSv2** (requires a token).`,
      code: {
        language: `bash`,
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
        caption: `Launch EC2 and SSH connect`,
      },
    },
    {
      title: `EC2: Security Groups and EBS`,
      content: `**Security Group (SG)** — stateful firewall at the instance level:
- **Inbound** — incoming traffic (SSH :22, HTTP :80, HTTPS :443)
- **Outbound** — outgoing (usually All traffic allowed)
- Only Allow rules (no Deny)
- Can reference other SGs (app-SG → db-SG :5432)

**EBS (Elastic Block Store)** — block storage:
- **gp3** — general purpose SSD (default, 3000 IOPS)
- **io2** — high IOPS for databases
- **st1** — throughput-optimized HDD
- Snapshots — backups to S3, can copy across regions
- **Volume is not deleted** on terminate if \`DeleteOnTermination=false\`

**Placement Groups** — placement strategy: cluster (low latency), spread (fault tolerance), partition.`,
      code: {
        language: `bash`,
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
      title: `S3: object storage`,
      content: `**S3 (Simple Storage Service)** — object storage with 99.999999999% (11 nines) durability.

**Key concepts:**
- **Bucket** — container (globally unique name)
- **Object** — file + metadata (up to 5 TB)
- **Key** — object path (\`images/photo.jpg\`)
- **Versioning** — keep all object versions
- **Lifecycle** — automatic transition to Glacier / deletion
- **Replication** — copy to another region/bucket

**Storage Classes:**
| Class | Purpose |
|-------|-----------|
| S3 Standard | Frequent access |
| S3 IA | Infrequent access (cheaper) |
| S3 Glacier | Archive (minutes–hours retrieval) |
| S3 Intelligent-Tiering | Automatic tiering |

**Static Website Hosting** — S3 can host static sites (HTML/CSS/JS) + CloudFront for CDN.`,
      code: {
        language: `bash`,
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
        caption: `Core S3 operations`,
      },
    },
    {
      title: `S3: security and best practices`,
      content: `**S3 Security Layers:**
1. **Block Public Access** — global ban on public access (enable by default!)
2. **Bucket Policy** — resource-based policy (who can access)
3. **ACL** — legacy, do not use
4. **IAM Policy** — user/role-based access
5. **Encryption** — SSE-S3 (AWS managed), SSE-KMS (customer managed key), SSE-C (customer provided)
6. **Access Points** — named entry points with separate policies

**Common incidents:**
- Open bucket with PII → GDPR fines
- Credentials in a public bucket → compromise

**Best practices:**
- Block Public Access = ON
- Encryption at rest = ON
- Versioning = ON for critical data
- MFA Delete for production buckets
- Access Logging → separate bucket`,
      code: {
        language: `json`,
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
        caption: `Bucket Policy — encryption and HTTPS required`,
      },
    },
    {
      title: `Overview of key AWS services`,
      content: `**Compute:**
- **EC2** — virtual machines
- **Lambda** — serverless functions (pay per invocation)
- **ECS/EKS** — containers (managed K8s = EKS)
- **Elastic Beanstalk** — PaaS for web apps

**Storage:**
- **S3** — objects
- **EBS** — block disks for EC2
- **EFS** — shared file system (NFS)
- **FSx** — Windows/Lustre file systems

**Database:**
- **RDS** — managed PostgreSQL, MySQL, MariaDB, Oracle, SQL Server
- **Aurora** — AWS-optimized DB (PG/MySQL compatible)
- **DynamoDB** — NoSQL key-value
- **ElastiCache** — Redis/Memcached

**Networking:** VPC, Route 53 (DNS), CloudFront (CDN), API Gateway

**Security:** IAM, KMS, Secrets Manager, WAF, Shield

**Monitoring:** CloudWatch (metrics, logs, alerts), X-Ray (tracing)

**DevOps:** CodePipeline, CodeBuild, CodeDeploy, CloudFormation, Systems Manager`,
    },
    {
      title: `Lab: full cycle EC2 + S3 + IAM Role`,
      content: `**Goal:** deploy a web server on EC2 that reads files from S3 via an IAM Role (no hardcoded credentials).

**Steps:**
1. Create an S3 bucket, upload \`index.html\`
2. Create an IAM Role with \`s3:GetObject\` on the bucket
3. Create a Security Group: inbound 22 (your IP), 80 (0.0.0.0/0)
4. Launch EC2 (Amazon Linux 2023, t3.micro) with the IAM Role
5. User Data: install nginx, download index.html from S3 via AWS CLI
6. Check in the browser: \`http://<public-ip>\`
7. **Delete everything** after the lab (terminate EC2, delete bucket, delete role)

This lab reinforces IAM Roles, EC2, S3, Security Groups — the AWS foundation.`,
      code: {
        language: `bash`,
        code: `#!/bin/bash
# User Data для EC2
yum update -y && yum install -y nginx aws-cli
aws s3 cp s3://my-bucket/index.html /usr/share/nginx/html/
systemctl start nginx && systemctl enable nginx`,
        caption: `User Data — nginx + S3`,
      },
    },
  ],
  practice: [
    `Create an AWS Free Tier account, enable MFA on root, set a Budget alert at $10`,
    `Create an IAM user with MFA, configure the AWS CLI with a profile`,
    `Launch EC2 t3.micro (Amazon Linux), connect over SSH, install nginx`,
    `Create an S3 bucket, upload a static site, enable Block Public Access`,
    `Create an IAM Role for EC2 with S3 access and attach it to the instance`,
    `Complete the lab “full cycle EC2 + S3 + IAM Role”`,
    `Explore Cost Explorer — find the most expensive services (if any)`,
  ],
  resources: [
    { title: `AWS Free Tier`, url: `https://aws.amazon.com/free/` },
    { title: `AWS Skill Builder`, url: `https://skillbuilder.aws` },
    { title: `AWS CLI Reference`, url: `https://docs.aws.amazon.com/cli/latest/reference/` },
    { title: `IAM Best Practices`, url: `https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html` },
    { title: `EC2 User Guide`, url: `https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/` },
  ],
  quiz: [
    {
      question: `What are an AWS Region and an Availability Zone?`,
      options: [
        `Region — a geographic region; AZ — an isolated data center within the region`,
        `Region — VPC, AZ — subnet`,
        `Synonyms`,
        `Region — only for S3`,
      ],
      answer: `Region — a geographic region; AZ — an isolated data center within the region`,
    },
    {
      question: `What is IAM used for?`,


      options: [
        `Managing identities, access policies, and roles in AWS.`,
        `Routing traffic between VPC and the internet.`,
        `Storing S3 objects and bucket versioning.`,
        `Auto-scaling EC2 based on CPU metrics.`,
      ],
      answer: `Managing identities, access policies, and roles in AWS.`,
    },
    {
      question: `How does EC2 differ from Lambda at a high level?`,
      options: [
        `EC2 — virtual servers; Lambda — serverless execution on events`,
        `Lambda is always cheaper under constant load`,
        `EC2 does not support Linux`,
        `Lambda only stores S3 objects`,
      ],
      answer: `EC2 — virtual servers; Lambda — serverless execution on events`,
    },
    {
      question: `What does S3 store?`,
      options: [
        `Objects (files) in a bucket with service-level durability`,
        `Only relational tables`,
        `Kubernetes Pods`,
        `Only Docker images with no API`,
      ],
      answer: `Objects (files) in a bucket with service-level durability`,
    },
    {
      question: `What is the shared responsibility model in AWS?`,

      options: [
        `AWS is responsible for security of the cloud; the customer is responsible for security in the cloud (data, config, access).`,
        `AWS is fully responsible for all security aspects including customer data`,
        `The customer is only responsible for physical security of AWS data centers`,
        `Responsibility is split 50/50 with no distinction by service layer`,
      ],
      answer: `AWS is responsible for security of the cloud; the customer is responsible for security in the cloud (data, config, access).`,
    },
    {
      question: `Why enable MFA for root/IAM users?`,
      options: [
        `Reduce the risk of account compromise`,
        `Speed up API requests`,
        `Disable billing alerts`,
        `Replace VPC`,
      ],
      answer: `Reduce the risk of account compromise`,
    },
    {
      question: `What is an AWS IAM role compared to an IAM user?`,
      options: [
        `Role — temporary credentials for services/people via assume; user — permanent account with keys`,
        `User is always for EC2, role only for Lambda`,
        `Role cannot be attached to policies`,
        `They are the same thing`,
      ],
      answer: `Role — temporary credentials for services/people via assume; user — permanent account with keys`,
      explanation: `Roles are preferred for applications — no long-lived access keys.`,
    },
    {
      question: `What is CloudWatch used for in AWS?`,
      options: [
        `Metrics, alerts, logs, and dashboards for AWS resources`,
        `DNS only`,
        `Kubernetes Pod management`,
        `Git repository storage`,
      ],
      answer: `Metrics, alerts, logs, and dashboards for AWS resources`,
    },
    {
      question: `How does RDS differ from a self-managed database on EC2?`,
      options: [
        `RDS is a managed service with backups, patches, and failover options`,
        `RDS does not support PostgreSQL`,
        `EC2 is always cheaper at any load`,
        `No difference`,
      ],
      answer: `RDS is a managed service with backups, patches, and failover options`,
      explanation: `It reduces operational overhead but offers less control over the OS.`,
    },
    {
      question: `Name three ways to reduce the risk of leaking AWS access keys.`,
      options: [
        `IAM roles instead of keys, key rotation, MFA, banning keys in code/CI (any three reasonable practices).`,
        `Embed keys in README files for team visibility.`,
        `Use one shared root key for all services.`,
        `Disable MFA to simplify automation.`,
      ],
      answer: `IAM roles instead of keys, key rotation, MFA, banning keys in code/CI (any three reasonable practices).`,
    },
  ],
}

export default translation
