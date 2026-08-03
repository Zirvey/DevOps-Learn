import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `AWS Networking: VPC, subnets, ALB`,
  duration: `6–8 hours`,
  description: `VPC, subnets, Internet Gateway, NAT, routing, Security Groups vs NACLs, Application Load Balancer`,
  sections: [
    {
      title: `VPC: an isolated network in the cloud`,
      content: `**VPC (Virtual Private Cloud)** is a logically isolated network in AWS. Every account gets a default VPC in each region, but for production create a **custom VPC**.

**Why a custom VPC:**
- Control CIDR blocks (IP addressing)
- Separate public/private subnets
- Peering with other VPCs or on-premise (VPN/Direct Connect)
- Compliance (isolate prod from dev)

**VPC components:**
- **Subnets** — network segments inside an AZ
- **Route Tables** — routing rules
- **Internet Gateway (IGW)** — internet egress for a public subnet
- **NAT Gateway** — outbound internet for a private subnet
- **Security Groups** — firewall at the instance level
- **NACLs** — firewall at the subnet level
- **VPC Endpoints** — private access to AWS services without the internet`,
    },
    {
      title: `CIDR and IP address planning`,
      content: `**CIDR (Classless Inter-Domain Routing)** — notation for IP ranges.

Examples:
- \`10.0.0.0/16\` — 65,536 addresses (10.0.0.0 – 10.0.255.255)
- \`10.0.1.0/24\` — 256 addresses (10.0.1.0 – 10.0.1.255)
- \`172.16.0.0/12\` — private range (RFC 1918)
- \`192.168.0.0/16\` — private range

**Recommended production layout:**
\`\`\`
VPC: 10.0.0.0/16
├── Public Subnet AZ-a:  10.0.1.0/24  (ALB, NAT, bastion)
├── Public Subnet AZ-b:  10.0.2.0/24
├── Private Subnet AZ-a: 10.0.10.0/24 (app servers, EKS nodes)
├── Private Subnet AZ-b: 10.0.11.0/24
├── DB Subnet AZ-a:      10.0.20.0/24 (RDS)
└── DB Subnet AZ-b:      10.0.21.0/24
\`\`\`

AWS reserves 5 IPs in each subnet: the first 4 + broadcast.`,
    },
    {
      title: `Creating a VPC and subnets`,
      content: `A custom VPC is created manually or via Terraform/CloudFormation. The default VPC has public subnets in all AZs — fine for learning, not for production.

**Subnet types:**
- **Public** — has route 0.0.0.0/0 → IGW; instances can have a public IP
- **Private** — no direct internet access; outbound via NAT
- **Isolated** — no internet route at all (VPC-internal only)

**Multi-AZ** — required for production. RDS, ALB, EKS need at least 2 AZs.`,
      code: {
        language: `bash`,
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
        caption: `Creating a VPC and subnets`,
      },
    },
    {
      title: `Internet Gateway and public access`,
      content: `**Internet Gateway (IGW)** is a horizontally scalable, redundant component that provides:
- Routing between the VPC and the internet
- NAT for instances with a public IP
- One IGW per VPC

**For a public subnet you need:**
1. Create and attach an IGW to the VPC
2. Add route 0.0.0.0/0 → IGW in the route table
3. Associate the route table with the public subnet
4. The instance must have a public IP (or Elastic IP)

**Elastic IP (EIP)** — static public IPv4. Free while attached to a running instance. **Billed** if attached to a stopped instance or not attached at all.`,
      code: {
        language: `bash`,
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
      title: `NAT Gateway: internet for a private subnet`,
      content: `Instances in a **private subnet** have no public IP. But they still need outbound internet for:
- Package updates (\`apt update\`)
- Calling external APIs
- Pulling Docker images

**NAT Gateway** — managed AWS service:
- Placed in a **public subnet**
- Has an Elastic IP
- Private subnet routes 0.0.0.0/0 → NAT Gateway
- **~$32/mo + traffic** — the most common cost trap!

**NAT Instance** — self-managed EC2 (cheaper, but you maintain it). For production — NAT Gateway.

**VPC Endpoints** — an alternative to NAT for AWS services (S3, DynamoDB, ECR) without leaving to the internet.`,
      code: {
        language: `bash`,
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
        caption: `NAT Gateway for a private subnet`,
      },
    },
    {
      title: `Route Tables: traffic routing`,
      content: `**Route Table** — a set of rules: “where to send a packet with destination X”.

**Local routes (created automatically):**
- \`10.0.0.0/16 → local\` — traffic inside the VPC
- \`pl-xxx (prefix list) → vpce-xxx\` — VPC Endpoint

**Typical routes:**
| Destination | Target | Subnet |
|-------------|--------|--------|
| 10.0.0.0/16 | local | all |
| 0.0.0.0/0 | igw-xxx | public |
| 0.0.0.0/0 | nat-xxx | private |
| pl-63a5400a (S3) | vpce-xxx | private (no NAT!) |

**Main route table** — default for subnets without an explicit association. Do not use main for public/private — create separate ones.

**Propagation** — a route table can receive routes from a Virtual Private Gateway (VPN) or Transit Gateway.`,
    },
    {
      title: `Security Groups: stateful firewall`,
      content: `**Security Group (SG)** — a virtual firewall at the **ENI (Elastic Network Interface)** level — i.e. instance, ALB, RDS.

**Characteristics:**
- **Stateful** — if inbound is allowed, the outbound reply is allowed automatically (and vice versa)
- Only **Allow** rules (no Deny)
- **All** rules are evaluated (allow if any match)
- Can reference other SGs: \`source: sg-app\` → \`port: 5432\`
- Default SG allows all outbound, inbound only from itself

**Typical layout:**
- \`sg-alb\` — inbound 80/443 from 0.0.0.0/0
- \`sg-app\` — inbound 8080 from sg-alb
- \`sg-db\` — inbound 5432 from sg-app`,
      code: {
        language: `bash`,
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
        caption: `Three-tier Security Group layout`,
      },
    },
    {
      title: `Network ACLs: stateless firewall at the subnet level`,
      content: `**NACL (Network Access Control List)** — firewall at the **subnet** level. Stateless — you need rules for both inbound and outbound.

**Characteristics:**
- **Stateless** — return traffic needs a separate rule
- **Allow and Deny** — you can explicitly block an IP (SG cannot)
- Evaluated by **rule number** (lowest to highest); first match wins
- Default NACL allows everything
- Custom NACL denies everything by default

**When to use NACL:**
- Blocking specific IP ranges (compliance)
- Extra defense layer (defense in depth)
- Separating a DMZ subnet

**In 95% of cases Security Groups are enough.** NACL is for specific scenarios.`,
      code: {
        language: `bash`,
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
      title: `Security Groups vs NACLs: comparison`,
      content: `| Characteristic | Security Group | NACL |
|----------------|---------------|------|
| Level | Instance (ENI) | Subnet |
| Stateful | Yes | No |
| Rules | Allow only | Allow + Deny |
| Evaluation | All rules | By number, first match |
| Scope | Specific ENI | All instances in the subnet |
| Default | Allow outbound | Deny all (custom) |

**Defense in depth:** SG for application-level (app → db), NACL for network-level (IP blocking).

**Common mistake:** open port 22 (SSH) in an SG to 0.0.0.0/0. Use a bastion host or AWS SSM Session Manager.`,
    },
    {
      title: `Application Load Balancer (ALB)`,
      content: `**ALB (Application Load Balancer)** — Layer 7 (HTTP/HTTPS) load balancer. Distributes traffic across targets (EC2, IP, Lambda, containers).

**ALB capabilities:**
- **Path-based routing** — \`/api/*\` → API targets, \`/*\` → frontend
- **Host-based routing** — \`api.example.com\` → API, \`www.example.com\` → web
- **SSL termination** — HTTPS on ALB, HTTP to backend
- **WebSocket** support
- **Sticky sessions** (cookies)
- **Health checks** — automatically remove unhealthy targets
- **WAF integration** — attack protection

**ALB vs NLB vs CLB:**
| Type | Layer | Purpose |
|-----|-------|-----------|
| ALB | 7 (HTTP) | Web apps, microservices |
| NLB | 4 (TCP/UDP) | Ultra-low latency, static IP |
| CLB | 4/7 | Legacy, do not use |`,
    },
    {
      title: `ALB: Target Groups, Listeners, Rules`,
      content: `**ALB components:**

1. **Listener** — accepts traffic on a port (80, 443). One ALB can have multiple listeners.
2. **Rules** — routing by path/host/header → Target Group
3. **Target Group** — a group of targets (EC2 instances, IP addresses, Lambda)
4. **Health Check** — periodic check (\`GET /health\` → 200)

**Target types:**
- **instance** — EC2 instance ID
- **ip** — IP address (on-premise, containers)
- **lambda** — serverless function

**ALB is placed in a public subnet.** Targets can be in a private subnet (ALB → app via SG).`,
      code: {
        language: `bash`,
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
        caption: `Creating an ALB with a Target Group`,
      },
    },
    {
      title: `Route 53 and DNS for ALB`,
      content: `**Route 53** — managed DNS service from AWS.

**Record types:**
- **A** — IPv4 (can be an Alias to ALB/CloudFront)
- **AAAA** — IPv6
- **CNAME** — alias (not for apex domain)
- **Alias** — AWS-specific, free, works on apex

**Alias record** — points to an AWS resource (ALB, CloudFront, S3). AWS updates the IP automatically when it changes.

**Health Checks** — Route 53 can check an endpoint and fail over.

**ACM (Certificate Manager)** — free SSL certificates for ALB/CloudFront.`,
      code: {
        language: `bash`,
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
      title: `VPC Flow Logs and network diagnostics`,
      content: `**VPC Flow Logs** — log IP traffic (accepted/rejected). Sent to CloudWatch Logs or S3.

Fields: srcaddr, dstaddr, srcport, dstport, protocol, action (ACCEPT/REJECT).

**Reachability Analyzer** — visual check: “can instance A reach instance B?”

**Diagnosing network issues:**
1. Security Group — inbound/outbound rules
2. NACL — stateless, check both directions
3. Route Table — correct gateway?
4. Subnet — public or private?
5. Instance — public IP / Elastic IP?
6. DNS — correct endpoint?
7. Flow Logs — ACCEPT or REJECT?`,
      code: {
        language: `bash`,
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
      title: `VPC Peering and Transit Gateway`,
      content: `**VPC Peering** — connect two VPCs (1:1). Traffic stays on the AWS backbone. **Not transitive** — if A↔B and B↔C, A↔C does not work.

**Transit Gateway** — hub-and-spoke. One TGW connects many VPCs, VPN, Direct Connect. Transitive routing.

**VPN (Site-to-Site)** — IPsec tunnel between on-premise and an AWS VPC.

**Direct Connect** — dedicated physical connection (1–100 Gbps). For enterprise with high traffic.

**PrivateLink** — access a service in another account/VPC without peering (consumer → endpoint → provider).`,
    },
    {
      title: `Lab: production-ready VPC`,
      content: `**Goal:** create a VPC with public/private subnets, NAT, ALB, and a three-tier architecture.

**Architecture:**
\`\`\`
Internet → IGW → ALB (public subnet)
                  ↓
              App EC2 (private subnet) → RDS (private subnet)
                  ↓
              NAT Gateway (public subnet) → Internet (updates)
\`\`\`

**Steps:**
1. VPC 10.0.0.0/16, 2 AZs
2. Public subnets (10.0.1.0/24, 10.0.2.0/24) + IGW + route
3. Private subnets (10.0.10.0/24, 10.0.11.0/24) + NAT GW + route
4. Security Groups: alb-sg, app-sg, db-sg (chain)
5. ALB in public, EC2 app in private, register in Target Group
6. RDS PostgreSQL in private subnet, access only from app-sg
7. Route 53 + ACM for HTTPS
8. VPC Flow Logs for audit
9. **Delete everything** after the lab`,
    },
  ],
  practice: [
    `Create a custom VPC with public and private subnets in 2 AZs`,
    `Configure IGW, NAT Gateway, and route tables`,
    `Create a Security Group chain: ALB → App → DB`,
    `Deploy an ALB with a Target Group and health checks`,
    `Enable VPC Flow Logs and analyze traffic`,
    `Complete the “production-ready VPC” lab`,
  ],
  resources: [
    { title: `VPC User Guide`, url: `https://docs.aws.amazon.com/vpc/latest/userguide/` },
    { title: `ALB Guide`, url: `https://docs.aws.amazon.com/elasticloadbalancing/latest/application/` },
    { title: `AWS Network Firewall`, url: `https://docs.aws.amazon.com/network-firewall/` },
  ],
  quiz: [
    {
      question: `How does a public subnet differ from a private one?`,
      options: [
        `Public has a route to an Internet Gateway; private usually goes via NAT`,
        `Private never has an IP`,
        `Public cannot have EC2`,
        `The difference is only the name`,
      ],
      answer: `Public has a route to an Internet Gateway; private usually goes via NAT`,
    },
    {
      question: `What is a NAT Gateway for?`,
      answer: `Provide outbound internet from a private subnet without inbound access from the outside.`,
    },
    {
      question: `What is a Security Group?`,
      options: [
        `A stateful firewall at the ENI/instance level`,
        `A router between regions`,
        `A DNS service`,
        `A type of S3 bucket policy`,
      ],
      answer: `A stateful firewall at the ENI/instance level`,
    },
    {
      question: `How does a NACL differ from a Security Group?`,
      options: [
        `NACL is stateless at the subnet level; SG is stateful at the instance level`,
        `NACL works only in Lambda`,
        `SG cannot be changed`,
        `NACL is only for S3`,
      ],
      answer: `NACL is stateless at the subnet level; SG is stateful at the instance level`,
    },
    {
      question: `What does VPC peering do?`,
      answer: `Connects two VPCs for private IP routing (subject to CIDR and routes).`,
    },
    {
      question: `What is Route 53 used for?`,
      options: [
        `DNS hosting and traffic routing`,
        `Creating EC2 AMIs`,
        `Storing Terraform state`,
        `Collecting CloudWatch metrics`,
      ],
      answer: `DNS hosting and traffic routing`,
    },
    {
      question: `What is an Internet Gateway (IGW) in a VPC?`,
      options: [
        `Gateway for inbound/outbound internet traffic of public subnets`,
        `VPN site-to-site only`,
        `L7 load balancer`,
        `A type of Security Group`,
      ],
      answer: `Gateway for inbound/outbound internet traffic of public subnets`,
      explanation: `Attached to a VPC; a 0.0.0.0/0 route in the route table points to the IGW.`,
    },
    {
      question: `Why use an Elastic IP?`,
      options: [
        `Static public IPv4 address bound to an instance or NAT`,
        `Private IP inside a VPC`,
        `DNS alias for S3`,
        `Traffic encryption`,
      ],
      answer: `Static public IPv4 address bound to an instance or NAT`,
    },
    {
      question: `How does Application Load Balancer differ from Network Load Balancer?`,
      options: [
        `ALB — L7 HTTP/HTTPS with routing by path/host; NLB — L4 TCP/UDP with low latency`,
        `NLB only for S3 static content`,
        `ALB does not support TLS`,
        `No difference`,
      ],
      answer: `ALB — L7 HTTP/HTTPS with routing by path/host; NLB — L4 TCP/UDP with low latency`,
      explanation: `Choice depends on protocol and routing requirements.`,
    },
    {
      question: `How do you give EC2 in a private subnet internet access without a public IP?`,
      answer: `Route 0.0.0.0/0 to a NAT Gateway in a public subnet with IGW.`,
    },
  ],
}

export default translation
