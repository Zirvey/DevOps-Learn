import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'FinOps: cloud cost awareness',
  description:
    'FinOps for DevOps: cost visibility, tagging, budgets and alerts, rightsizing, and shared ownership of cloud spend',
  duration: '3–4 hours',
  sections: [
    {
      title: 'FinOps and the DevOps role',
      content: `**FinOps** (Financial Operations) is the practice of **shared** ownership of cloud spend: finance, product, and engineering.

**DevOps owns:**
- Tagging/labelling resources at create time (Terraform \`default_tags\`)
- Instance types, storage class, retention choices
- Autoscaling bounds — scale-down matters
- Spot / reserved capacity awareness
- “Cost of reliability” — N+2 vs budget

**Not the goal:** blindly cut costs until outage. **Goal:** **unit economics** — cost per customer, per request, per TB.`,
    },
    {
      title: 'Visibility: Cost Explorer, CUR, dashboards',
      content: `**You can't optimize what you can't see.**

**AWS:** Cost Explorer, **CUR** (Cost and Usage Report) → Athena/Glue, Budgets  
**GCP:** Billing export to BigQuery  
**Azure:** Cost Management + exports

**Analysis dimensions:**
- Service (EC2, S3, RDS, data transfer!)
- Account / project / environment
- Tags: \`Environment\`, \`Team\`, \`Application\`

**DevOps dashboard:** weekly spend by team; anomaly detection (sudden +40%).`,
    },
    {
      title: 'Tagging strategy',
      content: `**Mandatory tags** (enforce via SCP, Terraform policy, OPA):
| Tag | Example |
|-----|---------|
| Environment | prod / staging / dev |
| Owner | team-platform |
| CostCenter | CC-1234 |
| Application | checkout-api |

**Anti-patterns:**
- Untagged resources → “other” bucket hell
- Tags only in the console, not in IaC → drift

**Terraform AWS provider:**
\`\`\`hcl
default_tags {
  tags = { Environment = var.env, ManagedBy = "terraform" }
}
\`\`\`

**Kubernetes:** labels mirror tags for chargeback reports (Kubecost).`,
    },
    {
      title: 'Budgets, alerts, and guardrails',
      content: `**AWS Budgets:** monthly cap, forecast alert at 80%, action via SNS → Slack/PagerDuty.

**Guardrails:**
- SCP deny expensive instance types in dev accounts
- Max EBS volume size policy
- Auto shutdown schedules for dev (Lambda off-hours)

**FinOps review:** monthly 30 minutes — top 5 cost drivers, action items.

**Anomaly:** a cross-AZ data-transfer spike often means misconfigured K8s or chatty microservices.`,
    },
    {
      title: 'Rightsizing and waste',
      content: `**Common waste:**
- Idle EC2 / forgotten VMs
- Oversized RDS “just in case”
- Unattached EBS volumes and old snapshots
- S3 without lifecycle (IA/Glacier)
- Over-provisioned K8s requests → stranded CPU

**Rightsizing tools:** AWS Compute Optimizer, Kubecost recommendations.

**Process:**
1. Identify the top 10 expensive resources
2. Check utilization metrics (30d CPU < 20%?)
3. Downsize or autoscale
4. Measure savings next month

**Spot instances:** batch/CI-tolerant workloads — 60–90% savings with interruption handling.`,
    },
    {
      title: 'Architectural cost decisions',
      content: `**Tradeoffs DevOps should voice:**
- Multi-AZ RDS vs backup RTO
- NAT Gateway vs VPC endpoints (S3 gateway is free)
- Managed K8s control-plane fee vs self-managed ops cost
- Log retention 90d in hot storage — $$$

**Well-Architected Cost Optimization pillar** — checklist for design reviews.

**Document** a “cost assumption” in an ADR: “We accept $X/mo for managed Redis because...”`,
    },
    {
      title: 'Homelab and personal cloud hygiene',
      content: `Even on a **$5 VPS** and free tier:
- Billing alerts on day one
- Destroy lab resources after the capstone
- Avoid leaked access keys → crypto-mining bill

FinOps mindset starts before enterprise — habits scale.`,
    },
  ],
  practice: [
    'Enable an AWS Budget of $10 with an email alert on a personal account (or simulate in a spreadsheet)',
    'Add default_tags in a Terraform module and check Cost Explorer grouped by Environment',
    'Find 3 untagged or orphaned resources in a lab account — delete or tag them',
    'Calculate monthly cost diff: t3.medium vs t3.small at ~15% average CPU',
    'Configure S3 lifecycle: transition logs > 30d to IA',
    'Build a chargeback report: Team × Service × $ for a fictional month',
  ],
  resources: [
    { title: 'FinOps Foundation — Framework', url: 'https://www.finops.org/framework/' },
    {
      title: 'AWS Cost Management',
      url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/what-is-costmanagement.html',
    },
    {
      title: 'AWS Well-Architected — Cost Optimization',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
    },
  ],
  quiz: [
    {
      question: 'FinOps in DevOps is?',
      options: [
        'Shared ownership of cloud spend and unit economics',
        'Finance-only work with no engineers',
        'Dropping monitoring',
        'Buying only the largest instances',
      ],
      answer: 'Shared ownership of cloud spend and unit economics',
    },
    {
      question: 'Why mandatorily tag resources?',
      options: [
        'Allocate cost by team/env/application in reports',
        'Speed up CPU',
        'Encrypt EBS',
        'Replace IAM',
      ],
      answer: 'Allocate cost by team/env/application in reports',
    },
    {
      question: 'Typical cloud waste?',
      options: [
        'Idle VMs, unattached volumes, oversized RDS, missing S3 lifecycle',
        'Too many unit tests',
        'README too long',
        'Using HTTPS',
      ],
      answer: 'Idle VMs, unattached volumes, oversized RDS, missing S3 lifecycle',
    },
    {
      question: 'AWS Budgets are used for?',
      options: [
        'Alerts when actual/forecast spend exceeds a threshold',
        'Creating EC2',
        'DNS failover',
        'TLS renewal',
      ],
      answer: 'Alerts when actual/forecast spend exceeds a threshold',
    },
    {
      question: 'Spot instances fit when?',
      options: [
        'The workload tolerates interruption (batch, CI workers)',
        'Stateful primary DB without a replica',
        'Single-node prod without retry',
        'Secrets only',
      ],
      answer: 'The workload tolerates interruption (batch, CI workers)',
    },
    {
      question: 'Terraform default_tags help you?',
      options: [
        'Automatically tag resources on create for cost visibility',
        'Encrypt state',
        'Delete billing',
        'Disable CloudTrail',
      ],
      answer: 'Automatically tag resources on create for cost visibility',
    },
    {
      question: 'A cross-AZ data transfer spike may mean?',
      options: [
        'Chatty apps/K8s without topology-aware design',
        'Successful FinOps',
        'Expired cert',
        'DNS TTL only',
      ],
      answer: 'Chatty apps/K8s without topology-aware design',
    },
    {
      question: 'Rightsizing relies on?',
      options: [
        'Utilization metrics over a period (CPU/memory) vs instance size',
        'Dashboard color',
        'GitHub star count',
        'Number of markdown files',
      ],
      answer: 'Utilization metrics over a period (CPU/memory) vs instance size',
    },
    {
      question: 'CUR (Cost and Usage Report) is for?',
      options: [
        'Detailed billing analysis in Athena/BI',
        'SSH keys',
        'Container runtime',
        'Ingress TLS',
      ],
      answer: 'Detailed billing analysis in Athena/BI',
    },
    {
      question: 'Personal lab FinOps habit?',
      options: [
        'Billing alerts on day one and teardown after experiments',
        'Leave everything running',
        'Publish access keys',
        'Ignore free-tier limits',
      ],
      answer: 'Billing alerts on day one and teardown after experiments',
    },
  ],
}

export default translation
