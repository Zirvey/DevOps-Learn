import type { Chapter } from '../../../types'

export const finopsChapter: Chapter = {
  id: 'finops',
  slug: 'finops-cost',
  title: 'FinOps: осознанные расходы в облаке',
  moduleId: 'cloud',
  order: 4,
  duration: '3–4 часа',
  level: 'beginner',
  description:
    'FinOps для DevOps: видимость затрат, tagging, budgets и alerts, rightsizing и культура совместной ответственности за cloud spend',
  sections: [
    {
      title: 'FinOps и роль DevOps',
      content: `**FinOps** (Financial Operations) — практика **совместной** ответственности за облачные расходы: finance, product, engineering.

**DevOps включает:**
- Tagging/labelling ресурсов при создании (Terraform default_tags)
- Выбор instance types, storage class, retention
- Autoscaling bounds — scale down matters
- Spot / reserved capacity awareness
- «Cost of reliability» — N+2 vs budget

**Не цель:** резать costs слепо до outage. **Цель:** **unit economics** — cost per customer, per request, per TB.`,
    },
    {
      title: 'Visibility: Cost Explorer, CUR, dashboards',
      content: `**You can't optimize what you can't see.**

**AWS:** Cost Explorer, **CUR** (Cost and Usage Report) → Athena/Glue, Budgets
**GCP:** Billing export to BigQuery
**Azure:** Cost Management + exports

**Dimensions для анализа:**
- Service (EC2, S3, RDS, data transfer!)
- Account / project / environment
- Tags: \`Environment\`, \`Team\`, \`Application\`

**DevOps dashboard:** weekly spend by team; anomaly detection ( sudden +40% ).`,
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
- Untagged resources → «other» bucket hell
- Tags only in console, not in IaC → drift

**Terraform AWS provider:**
\`\`\`hcl
default_tags {
  tags = { Environment = var.env, ManagedBy = "terraform" }
}
\`\`\`

**Kubernetes:** labels mirror tags for chargeback reports (Kubecost).`,
    },
    {
      title: 'Budgets, alerts и guardrails',
      content: `**AWS Budgets:** monthly cap, forecast alert at 80%, action via SNS → Slack/PagerDuty.

**Guardrails:**
- SCP deny expensive instance types in dev accounts
- Max EBS volume size policy
- Auto shutdown schedules for dev (Lambda off-hours)

**FinOps review:** monthly 30-min — top 5 cost drivers, action items.

**Anomaly:** data transfer cross-AZ spike often = misconfigured K8s or chatty microservices.`,
    },
    {
      title: 'Rightsizing и waste',
      content: `**Common waste:**
- Idle EC2 / forgotten VMs
- Oversized RDS «just in case»
- Unattached EBS volumes and old snapshots
- S3 without lifecycle (IA/Glacier)
- Over-provisioned K8s requests → stranded CPU

**Rightsizing tools:** AWS Compute Optimizer, Kubecost recommendations.

**Process:**
1. Identify top 10 expensive resources
2. Check utilization metrics (30d CPU < 20%?)
3. Downsize or autoscale
4. Measure savings next month

**Spot instances:** batch/CI tolerant workloads — 60–90% savings with interruption handling.`,
    },
    {
      title: 'Architectural cost decisions',
      content: `**Tradeoffs DevOps должен озвучивать:**
- Multi-AZ RDS vs backup RTO
- NAT Gateway vs VPC endpoints (S3 gateway free)
- Managed K8s control plane fee vs self-managed ops cost
- Log retention 90d in hot storage — $$$

**Well-Architected Cost Optimization pillar** — checklist для design reviews.

**Document** «cost assumption» в ADR: «We accept $X/mo for managed Redis because...»`,
    },
    {
      title: 'Homelab и personal cloud hygiene',
      content: `Даже на **$5 VPS** и free tier:
- Billing alerts Day 1
- Destroy lab resources after capstone
- Avoid leaked access keys → crypto mining bill

FinOps mindset начинается до enterprise — habits scale.`,
    },
  ],
  practice: [
    'Включи AWS Budget $10 с email alert на personal account (или симуляция в spreadsheet)',
    'Добавь default_tags в Terraform module и проверь Cost Explorer group by Environment',
    'Найди 3 untagged или orphaned resources в lab account — удалить или tag',
    'Посчитай monthly cost diff: t3.medium vs t3.small при 15% CPU avg',
    'Настрой S3 lifecycle: transition logs > 30d to IA',
    'Составь chargeback отчёт: table Team × Service × $ для вымышленного месяца',
  ],
  resources: [
    {
      title: 'FinOps Foundation — Framework',
      url: 'https://www.finops.org/framework/',
    },
    {
      title: 'AWS Cost Management',
      url: 'https://docs.aws.amazon.com/cost-management/latest/userguide/what-is-costmanagement.html',
    },
    {
      title: 'AWS Well-Architected — Cost Optimization',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
    },
  ],
}
