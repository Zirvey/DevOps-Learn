import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `DevOps and Cloud certifications`,
  duration: `2–3 hours`,
  description: `Certification roadmap for AWS, Kubernetes, and Terraform with an 8-week study plan`,
  sections: [
    {
      title: `Why certifications matter`,
      content: `Certifications are **not a substitute** for practice and a portfolio, but they are a useful tool:

**Pros:**
- Structure learning (clear syllabus)
- Pass HR filters (especially AWS SAA, CKA)
- Confirm a knowledge baseline
- Motivate systematic study
- Some AWS partner programs require certified staff

**Cons:**
- An exam ≠ real work (multiple choice vs debugging prod)
- They expire (retake every 2–3 years)
- Cost money ($150–400 per exam)
- You can "cram" without deep understanding

**Takeaway:** certificate + a pet project on GitHub = a strong combo for junior/middle DevOps.`,
    },
    {
      title: `Roadmap: recommended order`,
      content: `**Level 0 (optional):**
- **AWS Cloud Practitioner (CLF-C02)** — AWS overview, $100, easy

**Level 1 (foundation):**
- **AWS Solutions Architect Associate (SAA-C03)** — the most in-demand AWS cert
- **CKA (Certified Kubernetes Administrator)** — must-have for K8s

**Level 2 (going deeper):**
- **AWS Developer Associate (DVA-C02)** — CI/CD, Lambda, SDK
- **HashiCorp Terraform Associate** — IaC
- **CKAD (Certified Kubernetes Application Developer)** — deploying apps

**Level 3 (advanced):**
- **AWS DevOps Engineer Professional (DOP-C02)** — CI/CD, monitoring, security
- **AWS Solutions Architect Professional (SAP-C02)** — multi-account, hybrid
- **CKS (Certified Kubernetes Security Specialist)** — security in K8s

**Security track (optional):**
- **AWS Security Specialty (SCS-C02)**
- **CompTIA Security+**`,
    },
    {
      title: `AWS Cloud Practitioner (CLF-C02)`,
      content: `**Level:** Foundational | **Cost:** $100 | **Format:** 65 questions, 90 min | **Passing:** 700/1000

**Topics:**
- Cloud concepts (IaaS, PaaS, SaaS)
- AWS global infrastructure (regions, AZ)
- Core services (EC2, S3, RDS, Lambda, VPC)
- Billing and pricing models
- Shared Responsibility Model
- Security (IAM basics, encryption)

**Who:** absolute cloud beginners, managers, sales.

**Worth it?** If you already know AWS — skip and go for SAA. If starting from scratch — a good entry point.`,
    },
    {
      title: `AWS Solutions Architect Associate (SAA-C03)`,
      content: `**Level:** Associate | **Cost:** $150 | **Format:** 65 questions, 130 min | **Passing:** 720/1000

**Key topics:**
- **Design resilient architectures** — Multi-AZ, Auto Scaling, ELB, Route 53
- **Design high-performing** — S3 storage classes, CloudFront, ElastiCache
- **Design secure** — IAM, KMS, Security Groups, WAF, encryption
- **Design cost-optimized** — Reserved/Spot, S3 lifecycle, right-sizing

**Services to study:** EC2, S3, RDS, VPC, IAM, Route 53, CloudFront, SQS, SNS, Lambda, API Gateway, CloudWatch, CloudFormation.

**The most in-demand** AWS certificate. 60%+ of DevOps job posts mention SAA.`,
    },
    {
      title: `CKA: Certified Kubernetes Administrator`,
      content: `**Organizer:** CNCF/Linux Foundation | **Cost:** $395 (1 retake) | **Format:** practical, 2 hours, terminal

**Topics (exam weight):**
- Storage (10%) — PV, PVC, StorageClass
- Troubleshooting (30%) — **the largest block!**
- Workloads & Scheduling (15%)
- Cluster Architecture (25%)
- Services & Networking (20%)

**Special:** you must **solve tasks in a real cluster**, not multiple choice. Being fast with \`kubectl\` is critical.

**Prep:** killer.sh (2 mock exams included), practice on minikube/kind.`,
      code: {
        language: `bash`,
        code: `# Типичные задачи CKA
kubectl get pods -A | grep -v Running
kubectl describe pod <failing-pod> -n <namespace>
kubectl logs <pod> --previous
kubectl edit deployment <name>
kubectl create deployment nginx --image=nginx --replicas=3
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl create -f network-policy.yaml
kubectl drain <node> --ignore-daemonsets
kubectl cordon <node>`,
        caption: `Commands for CKA`,
      },
    },
    {
      title: `AWS Developer Associate (DVA-C02)`,
      content: `**Level:** Associate | **Cost:** $150 | **Format:** 65 questions, 130 min

**Focus:** building and deploying applications on AWS.

**Topics:**
- AWS SDK and CLI
- Lambda, API Gateway, DynamoDB
- CI/CD: CodePipeline, CodeBuild, CodeDeploy
- Container services: ECS, ECR, EKS basics
- CloudFormation, SAM
- X-Ray tracing, CloudWatch

**Who:** DevOps engineers who write and deploy apps. A good complement to SAA.`,
    },
    {
      title: `AWS DevOps Engineer Professional (DOP-C02)`,
      content: `**Level:** Professional | **Cost:** $300 | **Format:** 75 questions, 180 min | **Passing:** 750/1000

**Prerequisites:** SAA + DVA recommended (or equivalent 2+ years of experience).

**Topics:**
- CI/CD pipelines (CodePipeline, Jenkins, GitHub Actions on AWS)
- Infrastructure as Code (CloudFormation, CDK)
- Monitoring and logging (CloudWatch, X-Ray, CloudTrail)
- High availability and disaster recovery
- Security (IAM policies, Secrets Manager, compliance)
- Incident response and troubleshooting

**The most relevant** AWS cert for a DevOps engineer.`,
    },
    {
      title: `Terraform Associate and other IaC certs`,
      content: `**HashiCorp Terraform Associate (003):**
- Cost: $70
- Format: 57 questions, 60 min
- Topics: HCL syntax, state management, modules, providers, workspaces
- Useful if you actively use Terraform

**Pulumi:** no official cert, but there are badge programs.

**Ansible:** Red Hat Certified Specialist in Ansible Automation (EX447) — for enterprise.

**Git:** no mainstream cert, but GitHub Foundations (free badge).`,
    },
    {
      title: `Security certifications`,
      content: `**AWS Security Specialty (SCS-C02):**
- $300, Professional level
- IAM advanced, KMS, WAF, Shield, GuardDuty, Inspector, Macie
- Compliance: HIPAA, PCI-DSS, GDPR
- Incident response on AWS

**CKS (Certified Kubernetes Security Specialist):**
- $395, requires CKA
- Pod Security, Network Policies, RBAC, secrets, supply chain security
- Runtime security (Falco)

**CompTIA Security+:**
- $392, entry-level security
- Broad coverage: cryptography, network security, compliance
- Useful for a DevSecOps track`,
    },
    {
      title: `Study plan: 8 weeks to SAA + CKA`,
      content: `**Weeks 1–2: AWS Fundamentals**
- Complete the aws-basics and aws-networking chapters in this handbook
- Practice: EC2, S3, IAM, VPC on Free Tier
- Course: Stephane Maarek SAA on Udemy
- Practice exams: 1 test at the end of week 2

**Weeks 3–4: AWS Advanced + SAA**
- RDS, Lambda, CloudFront, Route 53, CloudFormation
- Tutorials Dojo practice exams (6 of them)
- Weak topics — review
- **SAA exam** at the end of week 4

**Weeks 5–6: Kubernetes**
- Complete the orchestration chapters in this handbook
- minikube/kind: deployments, services, ingress, PV/PVC
- killer.sh CKA course
- Practice: troubleshooting pods daily

**Weeks 7–8: CKA Intensive**
- Mock exams on killer.sh (2 included)
- Speed drills: solve tasks in < 5 min
- \`kubectl\` shortcuts, aliases, autocomplete
- **CKA exam** at the end of week 8`,
    },
    {
      title: `Daily study routine`,
      content: `**Weekdays (1.5–2 hours):**
- 30 min — theory (video/handbook)
- 45 min — hands-on practice (AWS Free Tier / minikube)
- 15 min — flashcards / cheat sheets

**Weekends (3–4 hours):**
- 1 practice exam (with error review!)
- Pet project: apply what you learned
- Note weak topics

**One week before the exam:**
- Practice exams only (at least 3)
- Cheat sheet: review all services/commands
- Do not learn new material — reinforce what you know
- Sleep well the night before`,
    },
    {
      title: `Exam tips`,
      content: `**AWS (multiple choice):**
- Read the question twice — look for keywords (cost, security, availability)
- Elimination: remove clearly wrong answers
- "Most cost-effective" ≠ "cheapest" — factor in operational overhead
- Flag & Review: do not get stuck on one question
- Mark questions with "Select TWO/THREE"

**CKA (practical):**
- \`kubectl explain\` — your best friend on the exam
- Create YAML files; do not waste time only on \`--dry-run=client -o yaml\`
- Verify every task: \`kubectl get\` after creating
- SSH to a node: \`systemctl status kubelet\`, \`/var/log/pods/\`
- Set up aliases BEFORE the exam starts
- Manage time: 2 hours / ~17 tasks = ~7 min per task`,
      code: {
        language: `bash`,
        code: `# Настройка перед CKA экзаменом
alias k=kubectl
complete -F __start_kubectl k
export dry="--dry-run=client -o yaml"
export do="--force --grace-period=0"
# Создание pod быстро:
k run nginx --image=nginx $dry | k apply -f -
# Документация:
kubectl explain pod.spec.containers`,
        caption: `CKA exam setup`,
      },
    },
    {
      title: `Free and affordable resources`,
      content: `**AWS:**
- [AWS Skill Builder](https://skillbuilder.aws) — free courses
- [AWS Free Tier](https://aws.amazon.com/free/) — practice
- [Tutorials Dojo](https://tutorialsdojo.com) — best practice exams ($15)
- [ExamPro AWS](https://www.exampro.co) — free SAA course

**Kubernetes:**
- [killer.sh](https://killer.sh) — included with CKA registration
- [KodeKloud CKA](https://kodekloud.com) — practical labs
- [Play with Kubernetes](https://labs.play-with-k8s.com) — free sandbox

**Terraform:**
- [HashiCorp Learn](https://developer.hashicorp.com/terraform/tutorials) — free
- [Gruntwork Blog](https://blog.gruntwork.io) — best practices

**General:**
- [DevOps Exercises](https://github.com/bregman-arie/devops-exercises) — Q&A`,
    },
    {
      title: `Maintaining certifications`,
      content: `**Validity:**
| Certificate | Validity | Renewal |
|-----------|------|-----------|
| AWS Associate | 3 years | Exam or CloudQuest |
| AWS Professional | 3 years | Exam |
| CKA/CKAD/CKS | 3 years | Exam within 12 months before expiry |
| Terraform Associate | 2 years | Exam |

**AWS recertification:** pass the same or a higher-level exam.

**Strategy:** do not chase every cert. 2–3 relevant ones + a strong portfolio > 10 certs with no practice.`,
    },
  ],
  practice: [
    `Pick your first certification (recommendation: AWS SAA) and schedule the exam date in 8 weeks`,
    `Build a weekly study plan using the template from this chapter`,
    `Take one free practice exam (ExamPro or Tutorials Dojo trial)`,
    `Create a cheat sheet with key AWS services and kubectl commands`,
    `Set up an AWS Free Tier account for hands-on practice`,
  ],
  resources: [
    { title: `AWS Certification`, url: `https://aws.amazon.com/certification/` },
    { title: `CNCF Certifications`, url: `https://www.cncf.io/certification/` },
    { title: `HashiCorp Certifications`, url: `https://www.hashicorp.com/certification` },
    { title: `Tutorials Dojo`, url: `https://tutorialsdojo.com` },
    { title: `killer.sh`, url: `https://killer.sh` },
  ],
  quiz: [
    {
      question: `Why should a DevOps engineer get certifications?`,
      options: [
        `To structure knowledge and prove skills to employers`,
        `To fully replace hands-on experience`,
        `To guarantee a salary`,
        `To avoid interviews`,
      ],
      answer: `To structure knowledge and prove skills to employers`,
    },
    {
      question: `How does CKA differ from CKAD in focus?`,
      answer: `CKA focuses on cluster administration; CKAD focuses on developing and deploying apps on Kubernetes.`,
    },
    {
      question: `Which AWS certification covers broad cloud fundamentals?`,
      options: [
        `AWS Certified Cloud Practitioner / Solutions Architect Associate`,
        `AWS Certified Barista`,
        `Only SAP on Azure`,
        `CompTIA Linux+ only`,
      ],
      answer: `AWS Certified Cloud Practitioner / Solutions Architect Associate`,
    },
    {
      question: `What is the most effective way to prepare for hands-on exams?`,
      options: [
        `Practice in labs/killercoda/homelab aligned to exam domains`,
        `Only reading PDFs with no terminal time`,
        `Memorizing questions without kubectl`,
        `Skipping time management`,
      ],
      answer: `Practice in labs/killercoda/homelab aligned to exam domains`,
    },
    {
      question: `How long do AWS and Kubernetes (CNCF) certs usually remain valid?`,
      answer: `About 3 years; you must retake or recertify per the program rules.`,
    },
    {
      question: `What matters more on the market: a certificate or a pet project?`,
      options: [
        `They complement each other; projects often weigh more in interviews`,
        `Only the certificate`,
        `Only a university diploma`,
        `None of the above`,
      ],
      answer: `They complement each other; projects often weigh more in interviews`,
    },
  ],
}

export default translation
