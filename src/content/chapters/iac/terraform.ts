import type { Chapter } from '../../../types'

export const terraformChapter: Chapter = {
  id: 'terraform',
  slug: 'terraform',
  title: 'Terraform: Infrastructure as Code',
  moduleId: 'iac',
  order: 0,
  duration: '6–8 часов',
  level: 'intermediate',
  description:
    'Декларативное управление облачной инфраструктурой: HCL, providers, state, modules, remote backend, AWS VPC+EC2+SG',
  sections: [
    {
      title: 'Infrastructure as Code',
      content: `**Infrastructure as Code (IaC)** — подход к управлению инфраструктурой через машиночитаемые конфигурационные файлы, а не ручные действия в UI облака.

**Проблемы ручного управления:**
- **Snowflake servers** — каждый сервер уникален, невозможно воспроизвести
- **Нет истории** — кто создал ресурс? Когда? Зачем?
- **Медленно** — клики в консоли AWS для каждого ресурса
- **Ошибки** — человеческий фактор при настройке
- **Drift** — конфигурация расходится с документацией

**Преимущества IaC:**
- **Версионирование** — история изменений в Git
- **Воспроизводимость** — одинаковая инфра в dev/staging/prod
- **Code Review** — изменения проходят PR
- **Автоматизация** — apply через CI/CD
- **Документация** — код = документация
- **Быстрота** — поднять окружение за минуты

**Подходы:**
| | Декларативный | Императивный |
|---|---|---|
| Описываешь | Желаемое состояние | Шаги достижения |
| Пример | Terraform, CloudFormation | Ansible, Chef |
| Идемпотентность | Да | Зависит |`,
    },
    {
      title: 'Что такое Terraform',
      content: `**Terraform** (HashiCorp) — самый популярный IaC-инструмент. Декларативный: описываешь желаемое состояние, Terraform вычисляет diff и применяет изменения.

**Ключевые концепции:**
- **Providers** — плагины для облаков (AWS, GCP, Azure, K8s, GitHub...)
- **Resources** — инфраструктурные объекты (EC2, S3, VPC...)
- **State** — текущее состояние инфраструктуры
- **Plan** — preview изменений перед apply
- **Modules** — переиспользуемые конфигурации

**Terraform vs альтернативы:**
| | Terraform | Pulumi | CloudFormation | CDK |
|---|---|---|---|---|
| Язык | HCL | Python/TS/Go | YAML/JSON | Python/TS |
| Облака | 3000+ providers | 100+ | Только AWS | AWS/GCP/Azure |
| State | Свой | Свой | AWS-managed | CloudFormation |

**OpenTofu** — open-source форк Terraform (после смены лицензии HashiCorp на BSL). Совместим с Terraform.

Terraform — **стандарт индустрии** для multi-cloud IaC.`,
    },
    {
      title: 'Установка Terraform',
      content: `**macOS (Homebrew):**
\`\`\`bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
\`\`\`

**Linux:**
\`\`\`bash
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com \$(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
\`\`\`

**Проверка:**
\`\`\`bash
terraform version
# Terraform v1.9.x
# on darwin_arm64
\`\`\`

**Автодополнение:**
\`\`\`bash
terraform -install-autocomplete  # bash/zsh
\`\`\`

**tfenv** — менеджер версий (как nvm для Node):
\`\`\`bash
brew install tfenv
tfenv install 1.9.0
tfenv use 1.9.0
\`\`\`

Рекомендуется фиксировать версию в \`required_version\` для consistency в команде.`,
      code: {
        language: 'bash',
        code: `terraform version
terraform -help

# Структура проекта
mkdir my-infra && cd my-infra
touch main.tf variables.tf outputs.tf
terraform init`,
        caption: 'Первые шаги после установки',
      },
    },
    {
      title: 'Первый проект: init, plan, apply',
      content: `**Workflow Terraform — четыре команды:**

\`\`\`bash
terraform init      # 1. Инициализация, скачивание providers
terraform plan      # 2. Preview изменений (dry-run)
terraform apply     # 3. Применить изменения
terraform destroy   # 4. Удалить всё
\`\`\`

**init** — скачивает providers, инициализирует backend, создаёт \`.terraform/\`.
**plan** — сравнивает desired state (код) с current state (state file), показывает diff.
**apply** — выполняет plan (с подтверждением или \`-auto-approve\`).
**destroy** — удаляет все managed resources.

**Минимальный main.tf:**`,
      code: {
        language: 'hcl',
        code: `terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

resource "aws_s3_bucket" "example" {
  bucket = "my-unique-bucket-name-12345"

  tags = {
    Name        = "Example bucket"
    Environment = "dev"
  }
}`,
        caption: 'Минимальный Terraform проект — S3 bucket',
      },
    },
    {
      title: 'HCL: синтаксис языка',
      content: `**HCL (HashiCorp Configuration Language)** — язык конфигурации Terraform.

**Блоки:**
\`\`\`hcl
block_type "label1" "label2" {
  argument = "value"
  nested_block {
    key = "value"
  }
}
\`\`\`

**Типы данных:**
| Тип | Пример | Описание |
|-----|--------|----------|
| string | \`"hello"\` | Строка |
| number | \`42\`, \`3.14\` | Число |
| bool | \`true\`, \`false\` | Булево |
| list | \`["a", "b"]\` | Упорядоченный список |
| map | \`{key = "val"}\` | Ключ-значение |
| object | \`{name = "x", port = 80}\` | Структура |
| tuple | \`[string, number]\` | Типизированный список |

**Интерполяция и выражения:**
\`\`\`hcl
name = "server-\${var.env}-\${var.index}"
cidr = var.subnet_cidrs[0]
tags = merge(var.common_tags, { Name = "web" })
count = length(var.availability_zones)
\`\`\`

**Комментарии:** \`#\` или \`//\` для однострочных, \`/* */\` для многострочных.`,
    },
    {
      title: 'Providers',
      content: `**Provider** — плагин, взаимодействующий с API облачного провайдера.

**Объявление:**
\`\`\`hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}
\`\`\`

**Версионирование:**
| Оператор | Значение |
|----------|----------|
| \`= 5.0.0\` | Точная версия |
| \`~> 5.0\` | >= 5.0, < 6.0 |
| \`>= 4.0\` | Минимум 4.0 |

**Множественные providers (alias):**
\`\`\`hcl
provider "aws" {
  alias  = "us_east"
  region = "us-east-1"
}

resource "aws_s3_bucket" "logs" {
  provider = aws.us_east
  bucket   = "logs-bucket"
}
\`\`\`

**Популярные providers:** aws, google, azurerm, kubernetes, helm, github, docker, cloudflare.

Registry: registry.terraform.io — 3000+ providers.`,
    },
    {
      title: 'Resources',
      content: `**Resource** — инфраструктурный объект, управляемый Terraform.

**Синтаксис:**
\`\`\`hcl
resource "provider_type" "local_name" {
  argument1 = "value"
  argument2 = 42
}
\`\`\`

- \`provider_type\` — тип ресурса (aws_instance, google_compute_instance)
- \`local_name\` — имя в Terraform (для ссылок)
- Аргументы — параметры ресурса

**Ссылка на ресурс:**
\`\`\`hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id    # ссылка на другой ресурс
  security_groups = [aws_security_group.web.id]
}
\`\`\`

**Meta-аргументы:**
| Аргумент | Описание |
|----------|----------|
| \`count\` | Создать N копий |
| \`for_each\` | Создать по map/set |
| \`depends_on\` | Явная зависимость |
| \`lifecycle\` | create_before_destroy, prevent_destroy, ignore_changes |
| \`provider\` | Выбор provider (alias) |`,
      code: {
        language: 'hcl',
        code: `resource "aws_instance" "web" {
  count         = 3
  ami           = var.ami_id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "web-\${count.index + 1}"
  }

  lifecycle {
    create_before_destroy = true
  }
}`,
        caption: 'Resource с count и lifecycle',
      },
    },
    {
      title: 'Data Sources',
      content: `**Data Source** — чтение существующих ресурсов (не управляемых Terraform).

\`\`\`hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id   # используем data source
  instance_type = "t3.micro"
}
\`\`\`

**Resource vs Data Source:**
| | Resource | Data Source |
|---|----------|-------------|
| Управление | Terraform создаёт/удаляет | Только чтение |
| Синтаксис | \`resource "type" "name"\` | \`data "type" "name"\` |
| Ссылка | \`aws_instance.web.id\` | \`data.aws_ami.ubuntu.id\` |

**Применение data sources:**
- Поиск AMI, VPC, subnet по фильтрам
- Чтение существующих ресурсов (созданных вручную или другим Terraform)
- Получение текущего AWS account ID, region`,
    },
    {
      title: 'Variables (входные параметры)',
      content: `**Variables** — параметризация конфигурации.

**Объявление (variables.tf):**
\`\`\`hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"

  validation {
    condition     = contains(["t3.micro", "t3.small", "t3.medium"], var.instance_type)
    error_message = "Allowed: t3.micro, t3.small, t3.medium"
  }
}

variable "environment" {
  type = string
}
\`\`\`

**Использование:**
\`\`\`hcl
resource "aws_instance" "web" {
  instance_type = var.instance_type
}
\`\`\`

**Способы задания значений (приоритет от низшего к высшему):**
1. Default в variable block
2. \`terraform.tfvars\` / \`*.auto.tfvars\`
3. \`-var-file="prod.tfvars"\`
4. \`-var="instance_type=t3.large"\`
5. \`TF_VAR_instance_type\` environment variable

**terraform.tfvars:**
\`\`\`hcl
instance_type = "t3.small"
environment   = "production"
\`\`\``,
      code: {
        language: 'hcl',
        code: `variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of AZs"
  type        = list(string)
  default     = ["eu-central-1a", "eu-central-1b"]
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "my-project"
    ManagedBy   = "terraform"
  }
}`,
        caption: 'Типизированные variables с defaults',
      },
    },
    {
      title: 'Outputs',
      content: `**Outputs** — экспорт значений из Terraform (IP-адреса, DNS, IDs).

\`\`\`hcl
output "instance_public_ip" {
  description = "Public IP of the web server"
  value       = aws_instance.web.public_ip
}

output "vpc_id" {
  value = aws_vpc.main.id
}
\`\`\`

**Использование:**
\`\`\`bash
terraform output                    # все outputs
terraform output instance_public_ip # конкретный output
terraform output -json             # JSON формат
\`\`\`

**Передача между модулями / Terraform projects:**
\`\`\`hcl
# В другом Terraform проекте:
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state"
    key    = "network/terraform.tfstate"
    region = "eu-central-1"
  }
}

resource "aws_instance" "app" {
  subnet_id = data.terraform_remote_state.network.outputs.public_subnet_id
}
\`\`\`

Outputs — мост между Terraform-модулями и внешними системами (Ansible inventory, CI/CD).`,
    },
    {
      title: 'Local Values',
      content: `**Locals** — промежуточные вычисляемые значения для DRY.

\`\`\`hcl
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project
    ManagedBy   = "terraform"
  }

  name_prefix = "\${var.project}-\${var.environment}"

  subnet_cidrs = [
    for i, az in var.availability_zones :
    cidrsubnet(var.vpc_cidr, 8, i)
  ]
}

resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  tags       = merge(local.common_tags, { Name = "\${local.name_prefix}-vpc" })
}
\`\`\`

**Locals vs Variables:**
| | Variables | Locals |
|---|-----------|--------|
| Ввод | Извне (tfvars, CLI) | Только внутри кода |
| Назначение | Параметризация | Вычисления, DRY |
| Переопределение | Да | Нет |`,
    },
    {
      title: 'State: сердце Terraform',
      content: `**Terraform State** — JSON-файл, хранящий mapping между ресурсами в коде и реальными объектами в облаке.

**Зачем нужен state:**
- Terraform знает, какие ресурсы уже созданы
- Вычисляет diff (plan) — что создать, изменить, удалить
- Хранит metadata (IP, ARN, dependencies)
- Без state Terraform не знает, что управлять

**Локальный state (по умолчанию):**
\`\`\`
terraform.tfstate      # текущее состояние
terraform.tfstate.backup  # предыдущая версия
\`\`\`

**⚠️ КРИТИЧЕСКИ ВАЖНО:**
- **Никогда** не коммить state в Git (содержит секреты!)
- **Никогда** не редактировать state вручную (кроме \`terraform state\` команд)
- **Всегда** использовать remote backend для командной работы
- Добавь \`*.tfstate*\` в \`.gitignore\`

**Команды state:**
\`\`\`bash
terraform state list                    # все ресурсы
terraform state show aws_instance.web   # детали ресурса
terraform state mv old.name new.name    # переименовать
terraform state rm aws_instance.old     # убрать из state (не удаляя в облаке)
terraform import aws_instance.web i-123  # импорт существующего ресурса
\`\`\``,
    },
    {
      title: 'Remote Backend: S3 + DynamoDB',
      content: `**Remote Backend** — хранение state в удалённом хранилище с блокировкой.

**S3 + DynamoDB (AWS) — стандарт для команд:**`,
      code: {
        language: 'hcl',
        code: `terraform {
  backend "s3" {
    bucket         = "my-company-terraform-state"
    key            = "production/network/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}`,
        caption: 'Remote backend: S3 + DynamoDB lock',
      },
    },
    {
      title: 'Создание S3 backend инфраструктуры',
      content: `Перед использованием remote backend нужно создать S3 bucket и DynamoDB table.

**Bootstrap (один раз, вручную или отдельным Terraform):**`,
      code: {
        language: 'hcl',
        code: `# bootstrap/main.tf — запускается с local backend
resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-company-terraform-state"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}`,
        caption: 'Bootstrap: S3 bucket + DynamoDB для state locking',
      },
    },
    {
      title: 'State Locking',
      content: `**State Locking** — предотвращение одновременного apply двумя пользователями/CI.

**Как работает:**
1. \`terraform apply\` → запись lock в DynamoDB
2. Второй apply → ошибка "Error acquiring state lock"
3. Apply завершён → lock снят

**Принудительное снятие lock (осторожно!):**
\`\`\`bash
terraform force-unlock <LOCK_ID>
\`\`\`

**State versioning (S3):**
- S3 versioning сохраняет историю state
- Можно восстановить предыдущую версию при ошибке

**Best practices:**
- Один state file на логическую единицу (network, compute, database)
- Не один giant state — разбивай по модулям/окружениям
- Encrypt state at rest (S3 encryption)
- Restrict access к state bucket (IAM policies)`,
    },
    {
      title: 'Modules',
      content: `**Module** — переиспользуемый пакет Terraform-конфигурации.

**Структура модуля:**
\`\`\`
modules/vpc/
├── main.tf
├── variables.tf
├── outputs.tf
└── README.md
\`\`\`

**Использование:**
\`\`\`hcl
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["eu-central-1a", "eu-central-1b"]
  environment        = "production"
}

# Использование outputs модуля
resource "aws_instance" "web" {
  subnet_id = module.vpc.public_subnet_ids[0]
}
\`\`\`

**Источники модулей:**
| Source | Пример |
|--------|--------|
| Локальный | \`./modules/vpc\` |
| Git | \`git::https://github.com/org/terraform-modules.git//vpc?ref=v1.0.0\` |
| Registry | \`terraform-aws-modules/vpc/aws\` (3.8M downloads) |

**Terraform Registry** — registry.terraform.io — публичные модули от HashiCorp и community.`,
      code: {
        language: 'hcl',
        code: `module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["eu-central-1a", "eu-central-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Environment = "production"
  }
}`,
        caption: 'Использование community VPC module',
      },
    },
    {
      title: 'Workspaces',
      content: `**Workspaces** — множественные state files в одной конфигурации.

\`\`\`bash
terraform workspace new staging
terraform workspace new production
terraform workspace list
terraform workspace select production
\`\`\`

**Использование в коде:**
\`\`\`hcl
resource "aws_instance" "web" {
  instance_type = terraform.workspace == "production" ? "t3.medium" : "t3.micro"

  tags = {
    Environment = terraform.workspace
  }
}
\`\`\`

**Workspaces vs отдельные директории:**
| | Workspaces | Отдельные dirs |
|---|-----------|----------------|
| Код | Один | Может отличаться |
| State | Разный (по workspace) | Разный (по key) |
| Сложность | Ниже | Выше |
| Рекомендация | Dev/staging | Production (отдельный state) |

**Для production** рекомендуется отдельная директория + отдельный state key, а не workspace.`,
    },
    {
      title: 'Plan/Apply workflow в команде',
      content: `**Стандартный workflow для команды:**

\`\`\`
1. git checkout -b feature/add-redis
2. Написать/изменить .tf файлы
3. terraform fmt -check     # форматирование
4. terraform validate         # валидация синтаксиса
5. terraform plan             # preview изменений
6. git commit + push + PR
7. CI: terraform plan (комментарий в PR)
8. Code review + approve
9. Merge → CI: terraform apply
\`\`\`

**CI/CD для Terraform (GitHub Actions):**
\`\`\`yaml
- run: terraform init
- run: terraform plan -out=plan.tfplan
- run: terraform apply plan.tfplan  # только на main
\`\`\`

**Инструменты:**
- **tflint** — линтер для Terraform
- **checkov / tfsec** — security scanning
- **terraform-docs** — автогенерация документации
- **Atlantis** — PR-based Terraform workflow
- **Terraform Cloud** — managed Terraform (HashiCorp)

**Правило:** plan в PR, apply только после merge и review.`,
    },
    {
      title: 'AWS Provider: настройка',
      content: `**Аутентификация AWS Provider (приоритет):**
1. Environment variables: \`AWS_ACCESS_KEY_ID\`, \`AWS_SECRET_ACCESS_KEY\`
2. Shared credentials file: \`~/.aws/credentials\`
3. IAM Role (EC2 instance profile, ECS task role)
4. SSO / IAM Identity Center

**Рекомендация:** IAM Role вместо access keys. Для локальной разработки — AWS SSO или \`aws configure\`.

\`\`\`hcl
provider "aws" {
  region = "eu-central-1"

  default_tags {
    tags = {
      Project   = "my-project"
      ManagedBy = "terraform"
    }
  }
}
\`\`\`

**default_tags** — автоматически добавляются ко всем ресурсам (AWS provider >= 3.0).

**Множественные регионы:**
\`\`\`hcl
provider "aws" {
  alias  = "replica"
  region = "us-west-2"
}
\`\`\``,
    },
    {
      title: 'Пример: VPC',
      content: `Полный пример создания VPC с public и private subnets:`,
      code: {
        language: 'hcl',
        code: `resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "\${var.project}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "\${var.project}-igw" }
}

resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = { Name = "public-\${var.availability_zones[count.index]}" }
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = { Name = "private-\${var.availability_zones[count.index]}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "public-rt" }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}`,
        caption: 'VPC с public subnets и Internet Gateway',
      },
    },
    {
      title: 'Пример: EC2 + Security Group',
      content: `EC2-инстанс в public subnet с Security Group:`,
      code: {
        language: 'hcl',
        code: `data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_security_group" "web" {
  name_prefix = "web-sg-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
    description = "SSH from admin"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "web-sg" }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.web.id]
  key_name               = var.key_pair_name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = { Name = "web-server" }
}

output "web_public_ip" {
  value = aws_instance.web.public_ip
}`,
        caption: 'EC2 + Security Group с SSH, HTTP, HTTPS',
      },
    },
    {
      title: 'Lifecycle, destroy и импорт',
      content: `**Lifecycle meta-argument:**
\`\`\`hcl
resource "aws_instance" "web" {
  lifecycle {
    prevent_destroy = true          # запретить terraform destroy
    create_before_destroy = true    # создать новый перед удалением старого
    ignore_changes = [ami]          # игнорировать изменения AMI
  }
}
\`\`\`

**Destroy:**
\`\`\`bash
terraform destroy                    # удалить всё
terraform destroy -target=aws_instance.web  # удалить конкретный ресурс
\`\`\`

**Import существующих ресурсов:**
\`\`\`bash
# Написать resource block в .tf, затем:
terraform import aws_instance.web i-0abc123def456
terraform plan  # проверить, что state совпадает с кодом
\`\`\`

**Moved block (Terraform >= 1.1) — рефакторинг без destroy:**
\`\`\`hcl
moved {
  from = aws_instance.old_name
  to   = aws_instance.new_name
}
\`\`\`

Import и moved — ключевые инструменты для эволюции инфраструктуры без даунтайма.`,
    },
  ],
  practice: [
    'Установи Terraform и AWS CLI, настрой credentials (aws configure или SSO)',
    'Создай S3 bucket вручную, затем опиши его в Terraform и выполни import',
    'Подними VPC с 2 public + 2 private subnets, Internet Gateway и route tables',
    'Добавь EC2 t3.micro в public subnet с Security Group (SSH + HTTP)',
    'Настрой remote backend: создай S3 bucket + DynamoDB table, мигрируй state',
    'Вынеси VPC в модуль ./modules/vpc и используй его в root module',
    'Создай workspaces dev и staging, проверь разные instance_type',
    'Настрой GitHub Actions: terraform plan на PR, apply на merge в main',
    'Добавь tflint и tfsec в CI pipeline для валидации и security scan',
    'Выполни terraform destroy и убедись, что все ресурсы удалены',
  ],
  resources: [
    { title: 'Terraform Docs', url: 'https://developer.hashicorp.com/terraform/docs' },
    { title: 'Terraform AWS Tutorial', url: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started' },
  ],
}
