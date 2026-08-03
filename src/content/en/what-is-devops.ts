import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'What is DevOps',
  duration: '1–1.5 hours',
  description:
    'A full introduction to DevOps philosophy: culture, practices, metrics, roles, and how it differs from traditional operations',
  sections: [
    {
      title: 'Definition and essence of DevOps',
      content: `**DevOps** (Development + Operations) is not a job title, a single tool, or a department. It is a **set of cultural principles, practices, and tools** that unite software development and operations into one continuous process.

> "DevOps is a culture in which developers and operations engineers work together throughout the entire product lifecycle: from design to production operations."

**The main goal of DevOps** is to shorten the time from idea to user value (time-to-market), improve release quality, and make systems **reliable, reproducible, and secure**.

The traditional model "developers write code → hand off to ops → ops deploys and fixes" creates:
- Long release cycles (once a quarter or less)
- A "wall" between teams and blame games during incidents
- Manual, non-reproducible deploys
- Fear of changing production

DevOps breaks that wall through **shared ownership**, **automation**, and **feedback** from production.`,
    },
    {
      title: 'History: from Agile to DevOps',
      content: `To understand DevOps, you need to see the evolution:

| Era | Approach | Problem |
|-----|----------|---------|
| Waterfall | Sequential phases, rare releases | Slow market response |
| Agile (2001) | Iterations, flexible development | Ops stays "out of the loop" |
| DevOps (~2009) | Dev + Ops in one cycle | — |

Key milestones:
- **2009** — Velocity conference, "10+ Deploys Per Day" talk (Flickr)
- **2009** — the term DevOps appears (Patrick Debois)
- **2010** — DevOpsDays in Belgium
- **2013** — "The Phoenix Project" — bestseller that popularized the ideas
- **2014+** — Docker, Kubernetes, and cloud accelerated adoption

**Agile** sped up development but **did not solve delivery**. DevOps complements Agile: not only "write code fast," but also "deliver it to users quickly and safely."`,
    },
    {
      title: 'The CALMS model',
      content: `The academic and practitioner community describes DevOps with the acronym **CALMS**:

**C — Culture**
Shared ownership of the product. No "that's not my area." Blameless postmortems after incidents.

**A — Automation**
Everything repeatable goes into code: build, tests, deploy, infrastructure, monitoring.

**L — Lean**
Eliminate waste: waiting, manual work, unfinished work, unnecessary processes.

**M — Measurement**
DORA metrics, SLI/SLO, recovery time, deploy frequency. Data-driven decisions.

**S — Sharing**
Knowledge sharing: documentation, runbooks, internal meetups, open config code.

> Without culture (C), automation (A) becomes "fast chaos." Without measurement (M), you cannot tell whether you are improving.`,
    },
    {
      title: 'Key principles',
      content: `**1. Collaboration and trust culture**
Developers understand operations; ops engineers take part in architecture. Developers can also be on-call.

**2. Automate everything repeatable**
A manual Friday-evening deploy is an anti-pattern. The pipeline does the same thing every time.

**3. CI/CD — continuous integration and delivery**
Code is merged into main often, tested automatically, and delivered (or ready to deliver at the push of a button).

**4. Infrastructure as Code (IaC)**
Servers, networks, DNS, load balancers — in Git. Changes via PR and review.

**5. Monitoring, logging, observability**
You cannot improve what you do not measure. Metrics, logs, and traces are your eyes and ears in production.

**6. DevSecOps — security from day one**
Dependency scanning, secrets in a vault, least privilege, security in the pipeline — not "at the end of the project."

**7. Idempotency and reproducibility**
Re-running a script/playbook yields the same result. Dev/staging/prod environments are as similar as possible.`,
    },
    {
      title: 'DevOps Lifecycle (Infinity Loop)',
      content: `The DevOps lifecycle is an **infinite loop** of continuous improvement:

\`\`\`
    Plan ──→ Code ──→ Build ──→ Test
      ↑                           ↓
   Monitor ←── Operate ←── Deploy ←── Release
\`\`\`

| Stage | What happens | Typical tools |
|-------|--------------|---------------|
| **Plan** | Backlog, priorities, incidents | Jira, Linear, GitHub Issues |
| **Code** | Development, review | Git, IDE, pre-commit hooks |
| **Build** | Compilation, images | GitHub Actions, Jenkins, GitLab CI |
| **Test** | Unit, integration, e2e, security | pytest, Playwright, Trivy |
| **Release** | Versioning, changelog | semantic-release, tags |
| **Deploy** | Delivery to environments | ArgoCD, Helm, Terraform |
| **Operate** | Operations, scaling | K8s, systemd, autoscaler |
| **Monitor** | Metrics, alerts, logs | Prometheus, Grafana, Loki |

Each stage **feeds** the next. Monitoring returns data to Plan (new features, bugs, tech debt).`,
    },
    {
      title: 'DORA metrics',
      content: `**DORA** (DevOps Research and Assessment) is the gold standard for measuring DevOps maturity. Four key metrics:

**1. Deployment Frequency** — how often you deploy to production
- Elite: multiple times per day
- Low: once a month or less

**2. Lead Time for Changes** — time from commit to running in production
- Elite: under an hour
- Low: from a month to half a year

**3. Change Failure Rate** — share of deploys that caused a failure
- Elite: 0–15%
- Low: 46–60%

**4. Time to Restore Service (MTTR)** — recovery time after an incident
- Elite: under an hour
- Low: from a week to a month

> High DORA scores correlate with business outcomes: delivery speed, stability, and team satisfaction.`,
    },
    {
      title: 'What a DevOps engineer does',
      content: `**DevOps Engineer** — an engineer at the intersection of development and operations. Typical areas of responsibility:

**CI/CD and automation**
- Designing and maintaining pipelines
- Caching, parallelization, build-time optimization

**Containers and orchestration**
- Docker, Kubernetes, Helm charts
- Resource limits, HPA, network policies

**Cloud and IaC**
- AWS/GCP/Azure: VPC, IAM, EC2, S3, RDS
- Terraform, Pulumi, Ansible, CloudFormation

**Observability**
- Prometheus, Grafana, ELK/Loki, Datadog
- SLI/SLO, alerting, on-call rotations

**Security and compliance**
- Secrets management (Vault, SSM)
- RBAC, audit logs, vulnerability scanning

**Reliability**
- Incident management, postmortems
- Capacity planning, disaster recovery

A DevOps engineer is **not** "someone who only manages servers." They **build the platform** on which the development team delivers the product safely and quickly.`,
    },
    {
      title: 'Related roles: SRE, Platform Engineer',
      content: `| Role | Focus | Difference from "classic" DevOps |
|------|-------|----------------------------------|
| **DevOps Engineer** | CI/CD, infrastructure, automation | Broad stack, often in product teams |
| **SRE** (Site Reliability Engineer) | Reliability, SLO, toil reduction | Google's engineering approach: error budget, automating toil |
| **Platform Engineer** | Internal Developer Platform (IDP) | Self-service for developers: "golden paths" |
| **Cloud Engineer** | Cloud architecture | Deep expertise in AWS/GCP/Azure |
| **Release Engineer** | Release process, artifacts | Less infrastructure, more pipeline |

In practice the boundaries blur. A "DevOps" job posting may mean SRE or Platform. Read the **specific requirements**, not only the title.`,
    },
    {
      title: 'DevOps vs traditional Sysadmin',
      content: `| Aspect | Traditional Sysadmin | DevOps |
|--------|----------------------|--------|
| Deploy | Manual, by runbook | Automated pipeline |
| Infrastructure | Manual server setup | IaC, immutable infrastructure |
| Changes | Rare, "maintenance windows" | Frequent, small batches |
| Ownership | Ops "owns" production | Shared ownership |
| Documentation | Wiki, goes stale | Code in Git — source of truth |
| Scale | Vertical (more RAM/CPU) | Horizontal (more instances) |

DevOps does **not** replace knowledge of Linux, networking, and system administration — on the contrary, it **deepens** them through automation and scale.`,
    },
    {
      title: 'DevOps anti-patterns',
      content: `What to avoid when adopting DevOps:

**"DevOps department"** — creating an isolated "DevOps" team that becomes a new wall. DevOps is a way of working for **everyone**, not a separate silo.

**"Tool = DevOps"** — buying Jenkins and Kubernetes without changing culture yields "automated chaos."

**"NoOps"** — the myth that ops will disappear. Operations do not go away; the **nature** of the work changes.

**Hero culture** — one person "knows everything" and puts out every fire. That is bus factor = 1 and burnout.

**Ignoring security** — "we'll fix it later." Security tech debt is the most expensive kind.

**100% uptime as a goal** — unreachable and counterproductive. The right goal is an **SLO** and managed risk.`,
    },
    {
      title: 'The Three Ways of DevOps',
      content: `From "The DevOps Handbook" — three fundamental principles:

**First Way: Flow**
Accelerate work from development to the user. Remove blockers, WIP limits, small batches.

**Second Way: Feedback**
Learn about problems quickly: monitoring, tests, user feedback. Strengthen feedback loops.

**Third Way: Continual Learning**
Experiments, blameless postmortems, time for improvements (20% like at Google). A culture where mistakes are a source of learning.`,
    },
    {
      title: 'When DevOps is especially valuable',
      content: `DevOps has the greatest impact when:

- The product is **updated often** (SaaS, web, mobile backends)
- There is a **microservice** or distributed architecture
- The team is **growing** and manual processes do not scale
- **Compliance** and change audit are required
- **Incidents** are expensive (fintech, e-commerce, healthcare)

Less critical for: rare embedded releases, desktop software without a server side, very small static sites. But core practices (Git, CI, IaC) are useful almost everywhere.`,
    },
  ],
  practice: [
    'Write down 5 problems of the traditional "dev vs ops" model that you have seen or can imagine in a real company',
    'For each CALMS principle, give one concrete example from life (work, study, open source)',
    'Find 3 DevOps/SRE/Platform Engineer job postings and list: recurring technologies, soft skills, level (junior/middle)',
    'Score a hypothetical team on the 4 DORA metrics: deployment frequency, lead time, change failure rate, MTTR — what would you improve first?',
    'Build a comparison table: "how it is done now" vs "how with DevOps" for the scenario: a production bug on Friday evening',
    'Read one blameless postmortem (public, e.g. from GitLab or Cloudflare) and write down 3 lessons',
    'Describe the "Three Ways" in your own words and give one action for each way in the context of a pet project',
    'Draft an interview answer: "What is DevOps and how is it different from simply using Docker?"',
  ],
  resources: [
    { title: 'The DevOps Handbook', url: 'https://itrevolution.com/product/the-devops-handbook/' },
    { title: 'Google SRE Book', url: 'https://sre.google/books/' },
  ],
  quiz: [
    {
      question: 'What does the acronym CALMS mean in the context of DevOps?',
      options: [
        'Culture, Automation, Lean, Measurement, Sharing',
        'Code, Agile, Linux, Monitoring, Security',
        'Continuous, Automated, Lean, Managed, Scalable',
        'Collaboration, Architecture, Logging, Metrics, Support',
      ],
      answer: 'Culture, Automation, Lean, Measurement, Sharing',
      explanation: 'CALMS is a common model for describing the five pillars of DevOps.',
    },
    {
      question: 'What is the main goal of DevOps compared to the traditional "dev vs ops" model?',
      options: [
        'Shorten time-to-market and improve delivery reliability',
        'Remove testing for the sake of speed',
        'Hand all operations over to developers only',
        'Replace Agile with Waterfall',
      ],
      answer: 'Shorten time-to-market and improve delivery reliability',
    },
    {
      question: 'What is a blameless postmortem?',
      answer:
        'An incident review without hunting for someone to blame, focused on systemic causes and process improvements.',
      explanation:
        'A no-blame culture helps people share information honestly and prevent repeats.',
    },
    {
      question: 'Which metrics are most often associated with DevOps effectiveness (DORA)?',
      options: [
        'Deploy frequency, lead time, MTTR, change failure rate',
        'Lines of code, team size, number of servers',
        'CPU, RAM, disk IOPS, network throughput',
        'Number of Jira tickets and HR response time',
      ],
      answer: 'Deploy frequency, lead time, MTTR, change failure rate',
    },
    {
      question: 'How does DevOps complement Agile?',
      options: [
        'Agile speeds up development; DevOps speeds up delivery and operations',
        'DevOps cancels iterations and sprints',
        'Agile only applies to frontend',
        'DevOps is only a set of cloud services',
      ],
      answer: 'Agile speeds up development; DevOps speeds up delivery and operations',
    },
    {
      question: 'Name three key anti-patterns of the traditional "wall between dev and ops" model.',
      answer:
        'Long releases, manual non-reproducible deploys, mutual blame during incidents.',
    },
    {
      question: 'What does "you build it, you run it" mean in DevOps?',
      options: [
        'The team that built the service is responsible for running it in production',
        'Only ops deploys, dev does not participate in incidents',
        'Developers write code without tests',
        'Operations is fully outsourced',
      ],
      answer: 'The team that built the service is responsible for running it in production',
      explanation: 'The principle strengthens ownership and breaks down the wall between creation and support.',
    },
    {
      question: 'How does Continuous Delivery differ from Continuous Deployment?',
      options: [
        'CDelivery prepares releases for deploy manually or by decision; CDeployment automatically rolls out to prod',
        'Continuous Deployment does not use tests',
        'Continuous Delivery works only with monoliths',
        'They are identical terms',
      ],
      answer: 'CDelivery prepares releases for deploy manually or by decision; CDeployment automatically rolls out to prod',
    },
    {
      question: 'Why adopt Infrastructure as Code in DevOps?',
      options: [
        'Version, reproduce, and review infrastructure like code',
        'Replace monitoring with logs in Git',
        'Remove the need for the cloud',
        'Store passwords in the repository',
      ],
      answer: 'Version, reproduce, and review infrastructure like code',
      explanation: 'IaC reduces configuration drift and speeds up environment recovery.',
    },
    {
      question: 'Describe how production feedback helps the team improve the product in DevOps culture.',
      answer: 'Metrics, alerts, and postmortems provide data for prioritizing reliability, automation, and reducing lead time.',
    },
  ],
}

export default translation
