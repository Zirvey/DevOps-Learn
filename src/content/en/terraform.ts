import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `Terraform: Infrastructure as Code`,
  duration: `6–8 hours`,
  description: `Declarative cloud infrastructure management: HCL, providers, state, modules, remote backend, AWS VPC+EC2+SG`,
  sections: [
    {
      title: `Infrastructure as Code`,
      content: `**Infrastructure as Code (IaC)** is an approach to managing infrastructure through machine-readable configuration files instead of manual clicks in a cloud UI.

**Problems with manual management:**
- **Snowflake servers** — every server is unique and hard to reproduce
- **No history** — who created the resource? When? Why?
- **Slow** — console clicks for every resource
- **Errors** — human mistakes during setup
- **Drift** — configuration diverges from documentation

**IaC benefits:**
- **Versioning** — change history in Git
- **Reproducibility** — the same infra in dev/staging/prod
- **Code review** — changes go through PRs
- **Automation** — apply via CI/CD
- **Documentation** — the code is the documentation
- **Speed** — stand up an environment in minutes

**Approaches:**
| | Declarative | Imperative |
|---|---|---|
| You describe | Desired state | Steps to get there |
| Example | Terraform, CloudFormation | Ansible, Chef |
| Idempotency | Yes | Depends |`,
    },
    {
      title: `What is Terraform`,
      content: `**Terraform** (HashiCorp) is the most popular IaC tool. Declarative: you describe the desired state; Terraform computes the diff and applies changes.

**Key concepts:**
- **Providers** — plugins for clouds (AWS, GCP, Azure, K8s, GitHub...)
- **Resources** — infrastructure objects (EC2, S3, VPC...)
- **State** — current infrastructure state
- **Plan** — preview of changes before apply
- **Modules** — reusable configurations

**Terraform vs alternatives:**
| | Terraform | Pulumi | CloudFormation | CDK |
|---|---|---|---|---|
| Language | HCL | Python/TS/Go | YAML/JSON | Python/TS |
| Clouds | 3000+ providers | 100+ | AWS only | AWS/GCP/Azure |
| State | Own | Own | AWS-managed | CloudFormation |

**OpenTofu** is an open-source Terraform fork (after HashiCorp moved to BSL). Compatible with Terraform.

Terraform is the **industry standard** for multi-cloud IaC.`,
    },
    {
      title: `Installing Terraform`,
      content: `**macOS (Homebrew):**
\`\`\`bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
\`\`\`

**Linux:**
\`\`\`bash
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com \\$(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
\`\`\`

**Verify:**
\`\`\`bash
terraform version
# Terraform v1.9.x
# on darwin_arm64
\`\`\`

**Autocomplete:**
\`\`\`bash
terraform -install-autocomplete  # bash/zsh
\`\`\`

**tfenv** — version manager (like nvm for Node):
\`\`\`bash
brew install tfenv
tfenv install 1.9.0
tfenv use 1.9.0
\`\`\`

Pin the version in \`required_version\` for team consistency.`,
      code: {
        language: `bash`,
        code: `terraform version
terraform -help

# Структура проекта
mkdir my-infra && cd my-infra
touch main.tf variables.tf outputs.tf
terraform init`,
        caption: `First steps after install`,
      },
    },
    {
      title: `First project: init, plan, apply`,
      content: `**Terraform workflow — four commands:**

\`\`\`bash
terraform init      # 1. Initialize, download providers
terraform plan      # 2. Preview changes (dry-run)
terraform apply     # 3. Apply changes
terraform destroy   # 4. Delete everything
\`\`\`

**init** — downloads providers, initializes the backend, creates \`.terraform/\`.
**plan** — compares desired state (code) with current state (state file) and shows the diff.
**apply** — executes the plan (with confirmation or \`-auto-approve\`).
**destroy** — deletes all managed resources.

**Minimal main.tf:**`,
      code: {
        language: `hcl`,
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
        caption: `Minimal Terraform project — S3 bucket`,
      },
    },
    {
      title: `HCL: language syntax`,
      content: `**HCL (HashiCorp Configuration Language)** is Terraform's configuration language.

**Blocks:**
\`\`\`hcl
block_type "label1" "label2" {
  argument = "value"
  nested_block {
    key = "value"
  }
}
\`\`\`

**Data types:**
| Type | Example | Description |
|-----|--------|----------|
| string | \`"hello"\` | String |
| number | \`42\`, \`3.14\` | Number |
| bool | \`true\`, \`false\` | Boolean |
| list | \`["a", "b"]\` | Ordered list |
| map | \`{key = "val"}\` | Key-value |
| object | \`{name = "x", port = 80}\` | Structure |
| tuple | \`[string, number]\` | Typed list |

**Interpolation and expressions:**
\`\`\`hcl
name = "server-\${var.env}-\${var.index}"
cidr = var.subnet_cidrs[0]
tags = merge(var.common_tags, { Name = "web" })
count = length(var.availability_zones)
\`\`\`

**Comments:** \`#\` or \`//\` for single-line, \`/* */\` for multi-line.`,
    },
    {
      title: `Providers`,
      content: `**Provider** — a plugin that talks to a cloud provider API.

**Declaration:**
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

**Versioning:**
| Operator | Meaning |
|----------|----------|
| \`= 5.0.0\` | Exact version |
| \`~> 5.0\` | >= 5.0, < 6.0 |
| \`>= 4.0\` | Minimum 4.0 |

**Multiple providers (alias):**
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

**Popular providers:** aws, google, azurerm, kubernetes, helm, github, docker, cloudflare.

Registry: registry.terraform.io — 3000+ providers.`,
    },
    {
      title: `Resources`,
      content: `**Resource** — an infrastructure object managed by Terraform.

**Syntax:**
\`\`\`hcl
resource "provider_type" "local_name" {
  argument1 = "value"
  argument2 = 42
}
\`\`\`

- \`provider_type\` — resource type (aws_instance, google_compute_instance)
- \`local_name\` — name in Terraform (for references)
- Arguments — resource parameters

**Referencing a resource:**
\`\`\`hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id    # reference to another resource
  security_groups = [aws_security_group.web.id]
}
\`\`\`

**Meta-arguments:**
| Argument | Description |
|----------|----------|
| \`count\` | Create N copies |
| \`for_each\` | Create from a map/set |
| \`depends_on\` | Explicit dependency |
| \`lifecycle\` | create_before_destroy, prevent_destroy, ignore_changes |
| \`provider\` | Choose provider (alias) |`,
      code: {
        language: `hcl`,
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
        caption: `Resource with count and lifecycle`,
      },
    },
    {
      title: `Data Sources`,
      content: `**Data Source** — read existing resources (not managed by Terraform).

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
  ami           = data.aws_ami.ubuntu.id   # use the data source
  instance_type = "t3.micro"
}
\`\`\`

**Resource vs Data Source:**
| | Resource | Data Source |
|---|----------|-------------|
| Management | Terraform creates/deletes | Read-only |
| Syntax | \`resource "type" "name"\` | \`data "type" "name"\` |
| Reference | \`aws_instance.web.id\` | \`data.aws_ami.ubuntu.id\` |

**Using data sources:**
- Find AMI, VPC, subnet by filters
- Read existing resources (created manually or by another Terraform)
- Get the current AWS account ID and region`,
    },
    {
      title: `Variables (input parameters)`,
      content: `**Variables** — parameterize configuration.

**Declaration (variables.tf):**
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

**Usage:**
\`\`\`hcl
resource "aws_instance" "web" {
  instance_type = var.instance_type
}
\`\`\`

**Ways to set values (lowest to highest priority):**
1. Default in the variable block
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
        language: `hcl`,
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
        caption: `Typed variables with defaults`,
      },
    },
    {
      title: `Outputs`,
      content: `**Outputs** — export values from Terraform (IPs, DNS, IDs).

\`\`\`hcl
output "instance_public_ip" {
  description = "Public IP of the web server"
  value       = aws_instance.web.public_ip
}

output "vpc_id" {
  value = aws_vpc.main.id
}
\`\`\`

**Usage:**
\`\`\`bash
terraform output                    # all outputs
terraform output instance_public_ip # a specific output
terraform output -json             # JSON format
\`\`\`

**Passing between modules / Terraform projects:**
\`\`\`hcl
# In another Terraform project:
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

Outputs are the bridge between Terraform modules and external systems (Ansible inventory, CI/CD).`,
    },
    {
      title: `Local Values`,
      content: `**Locals** — intermediate computed values for DRY.

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
| Input | From outside (tfvars, CLI) | Only inside the code |
| Purpose | Parameterization | Computations, DRY |
| Override | Yes | No |`,
    },
    {
      title: `State: the heart of Terraform`,
      content: `**Terraform State** is a JSON file that maps resources in code to real objects in the cloud.

**Why state is needed:**
- Terraform knows which resources already exist
- Computes the diff (plan) — what to create, change, delete
- Stores metadata (IP, ARN, dependencies)
- Without state Terraform does not know what to manage

**Local state (default):**
\`\`\`
terraform.tfstate      # current state
terraform.tfstate.backup  # previous version
\`\`\`

**⚠️ CRITICAL:**
- **Never** commit state to Git (it contains secrets!)
- **Never** edit state by hand (except via \`terraform state\` commands)
- **Always** use a remote backend for team work
- Add \`*.tfstate*\` to \`.gitignore\`

**State commands:**
\`\`\`bash
terraform state list                    # all resources
terraform state show aws_instance.web   # resource details
terraform state mv old.name new.name    # rename
terraform state rm aws_instance.old     # remove from state (without deleting in the cloud)
terraform import aws_instance.web i-123  # import an existing resource
\`\`\``,
    },
    {
      title: `Remote Backend: S3 + DynamoDB`,
      content: `**Remote Backend** — store state remotely with locking.

**S3 + DynamoDB (AWS) — the team standard:**`,
      code: {
        language: `hcl`,
        code: `terraform {
  backend "s3" {
    bucket         = "my-company-terraform-state"
    key            = "production/network/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}`,
        caption: `Remote backend: S3 + DynamoDB lock`,
      },
    },
    {
      title: `Creating S3 backend infrastructure`,
      content: `Before using a remote backend you need an S3 bucket and a DynamoDB table.

**Bootstrap (once, manually or with a separate Terraform):**`,
      code: {
        language: `hcl`,
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
        caption: `Bootstrap: S3 bucket + DynamoDB for state locking`,
      },
    },
    {
      title: `State Locking`,
      content: `**State Locking** — prevent two users/CI from applying at once.

**How it works:**
1. \`terraform apply\` → write a lock to DynamoDB
2. Second apply → error "Error acquiring state lock"
3. Apply finishes → lock released

**Force-unlock (carefully!):**
\`\`\`bash
terraform force-unlock <LOCK_ID>
\`\`\`

**State versioning (S3):**
- S3 versioning keeps state history
- You can restore a previous version after a mistake

**Best practices:**
- One state file per logical unit (network, compute, database)
- Not one giant state — split by modules/environments
- Encrypt state at rest (S3 encryption)
- Restrict access to the state bucket (IAM policies)`,
    },
    {
      title: `Modules`,
      content: `**Module** — a reusable package of Terraform configuration.

**Module layout:**
\`\`\`
modules/vpc/
├── main.tf
├── variables.tf
├── outputs.tf
└── README.md
\`\`\`

**Usage:**
\`\`\`hcl
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["eu-central-1a", "eu-central-1b"]
  environment        = "production"
}

# Using module outputs
resource "aws_instance" "web" {
  subnet_id = module.vpc.public_subnet_ids[0]
}
\`\`\`

**Module sources:**
| Source | Example |
|--------|--------|
| Local | \`./modules/vpc\` |
| Git | \`git::https://github.com/org/terraform-modules.git//vpc?ref=v1.0.0\` |
| Registry | \`terraform-aws-modules/vpc/aws\` (3.8M downloads) |

**Terraform Registry** — registry.terraform.io — public modules from HashiCorp and the community.`,
      code: {
        language: `hcl`,
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
        caption: `Using the community VPC module`,
      },
    },
    {
      title: `Workspaces`,
      content: `**Workspaces** — multiple state files for one configuration.

\`\`\`bash
terraform workspace new staging
terraform workspace new production
terraform workspace list
terraform workspace select production
\`\`\`

**Usage in code:**
\`\`\`hcl
resource "aws_instance" "web" {
  instance_type = terraform.workspace == "production" ? "t3.medium" : "t3.micro"

  tags = {
    Environment = terraform.workspace
  }
}
\`\`\`

**Workspaces vs separate directories:**
| | Workspaces | Separate dirs |
|---|-----------|----------------|
| Code | One | May differ |
| State | Different (per workspace) | Different (per key) |
| Complexity | Lower | Higher |
| Recommendation | Dev/staging | Production (separate state) |

**For production** prefer a separate directory + separate state key, not a workspace.`,
    },
    {
      title: `Plan/Apply workflow in a team`,
      content: `**Standard team workflow:**

\`\`\`
1. git checkout -b feature/add-redis
2. Write/change .tf files
3. terraform fmt -check     # formatting
4. terraform validate         # syntax validation
5. terraform plan             # preview changes
6. git commit + push + PR
7. CI: terraform plan (comment on the PR)
8. Code review + approve
9. Merge → CI: terraform apply
\`\`\`

**CI/CD for Terraform (GitHub Actions):**
\`\`\`yaml
- run: terraform init
- run: terraform plan -out=plan.tfplan
- run: terraform apply plan.tfplan  # only on main
\`\`\`

**Tools:**
- **tflint** — Terraform linter
- **checkov / tfsec** — security scanning
- **terraform-docs** — auto-generate docs
- **Atlantis** — PR-based Terraform workflow
- **Terraform Cloud** — managed Terraform (HashiCorp)

**Rule:** plan in the PR, apply only after merge and review.`,
    },
    {
      title: `AWS Provider: configuration`,
      content: `**AWS Provider authentication (priority):**
1. Environment variables: \`AWS_ACCESS_KEY_ID\`, \`AWS_SECRET_ACCESS_KEY\`
2. Shared credentials file: \`~/.aws/credentials\`
3. IAM Role (EC2 instance profile, ECS task role)
4. SSO / IAM Identity Center

**Recommendation:** IAM Role instead of access keys. For local development — AWS SSO or \`aws configure\`.

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

**default_tags** — automatically added to all resources (AWS provider >= 3.0).

**Multiple regions:**
\`\`\`hcl
provider "aws" {
  alias  = "replica"
  region = "us-west-2"
}
\`\`\``,
    },
    {
      title: `Example: VPC`,
      content: `Full example creating a VPC with public and private subnets:`,
      code: {
        language: `hcl`,
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
        caption: `VPC with public subnets and Internet Gateway`,
      },
    },
    {
      title: `Example: EC2 + Security Group`,
      content: `An EC2 instance in a public subnet with a Security Group:`,
      code: {
        language: `hcl`,
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
        caption: `EC2 + Security Group with SSH, HTTP, HTTPS`,
      },
    },
    {
      title: `Lifecycle, destroy, and import`,
      content: `**Lifecycle meta-argument:**
\`\`\`hcl
resource "aws_instance" "web" {
  lifecycle {
    prevent_destroy = true          # forbid terraform destroy
    create_before_destroy = true    # create new before deleting old
    ignore_changes = [ami]          # ignore AMI changes
  }
}
\`\`\`

**Destroy:**
\`\`\`bash
terraform destroy                    # delete everything
terraform destroy -target=aws_instance.web  # delete a specific resource
\`\`\`

**Import existing resources:**
\`\`\`bash
# Write the resource block in .tf, then:
terraform import aws_instance.web i-0abc123def456
terraform plan  # verify state matches the code
\`\`\`

**Moved block (Terraform >= 1.1) — refactor without destroy:**
\`\`\`hcl
moved {
  from = aws_instance.old_name
  to   = aws_instance.new_name
}
\`\`\`

Import and moved are key tools for evolving infrastructure without downtime.`,
    },
  ],
  practice: [
    `Install Terraform and the AWS CLI, configure credentials (aws configure or SSO)`,
    `Create an S3 bucket manually, then describe it in Terraform and run import`,
    `Stand up a VPC with 2 public + 2 private subnets, an Internet Gateway, and route tables`,
    `Add an EC2 t3.micro in a public subnet with a Security Group (SSH + HTTP)`,
    `Configure a remote backend: create an S3 bucket + DynamoDB table, migrate state`,
    `Extract the VPC into a ./modules/vpc module and use it from the root module`,
    `Create workspaces dev and staging, verify different instance_type values`,
    `Set up GitHub Actions: terraform plan on PR, apply on merge to main`,
    `Add tflint and tfsec to the CI pipeline for validation and security scanning`,
    `Run terraform destroy and confirm all resources are deleted`,
  ],
  resources: [
    { title: `Terraform Docs`, url: `https://developer.hashicorp.com/terraform/docs` },
    { title: `Terraform AWS Tutorial`, url: `https://developer.hashicorp.com/terraform/tutorials/aws-get-started` },
  ],
  quiz: [
    {
      question: `What is terraform plan for?`,
      options: [
        `Show a change plan without applying it`,
        `Delete state`,
        `Generate SSH keys`,
        `Run unit tests`,
      ],
      answer: `Show a change plan without applying it`,
    },
    {
      question: `What does Terraform state store?`,
      answer: `The mapping of resources in code to real IDs in the provider, plus dependency metadata.`,
    },
    {
      question: `Why use a remote backend (S3 + DynamoDB)?`,
      options: [
        `Team collaboration, locking, and reliable state storage`,
        `Faster internet`,
        `Replacing the provider plugin`,
        `Disabling drift detection`,
      ],
      answer: `Team collaboration, locking, and reliable state storage`,
    },
    {
      question: `How does a resource differ from a data source?`,
      options: [
        `A resource creates/manages an object; a data source only reads an existing one`,
        `A data source is always paid`,
        `A resource cannot be deleted`,
        `There is no difference`,
      ],
      answer: `A resource creates/manages an object; a data source only reads an existing one`,
    },
    {
      question: `What does terraform import do?`,
      answer: `Adds an existing infrastructure object into state under Terraform management.`,
    },
    {
      question: `Why must you not commit secrets in .tf files?`,
      options: [
        `They will end up in Git history and CI logs`,
        `Terraform cannot parse them`,
        `The provider will refuse to work`,
        `State does not support strings`,
      ],
      answer: `They will end up in Git history and CI logs`,
    },
    {
      question: `What does terraform validate do?`,
      options: [
        `Checks syntax and internal consistency of configuration`,
        `Applies changes in the cloud`,
        `Deletes state`,
        `Generates provider credentials`,
      ],
      answer: `Checks syntax and internal consistency of configuration`,
      explanation: `Often run in CI before plan/apply.`,
    },
    {
      question: `Why use terraform workspace?`,
      options: [
        `Multiple state for the same code (dev/stage/prod) with context switching`,
        `Replace Git branches`,
        `Store secrets`,
        `Speed up internet`,
      ],
      answer: `Multiple state for the same code (dev/stage/prod) with context switching`,
    },
    {
      question: `What is lifecycle { prevent_destroy = true }?`,
      options: [
        `Prevents terraform destroy for a critical resource`,
        `Disables plan`,
        `Enables auto-approve`,
        `Creates a resource without state`,
      ],
      answer: `Prevents terraform destroy for a critical resource`,
      explanation: `Protection from accidental deletion of prod database or bucket.`,
    },
    {
      question: `How do you pass an output value from one module to another?`,
      answer: `Via output in the child module and reference module.<name>.<output> in the parent code.`,
    },
  ],
}

export default translation
