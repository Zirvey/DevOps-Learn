import type { Chapter } from '../../../types'

export const certificationsChapter: Chapter = {
  id: 'certifications',
  slug: 'certifications',
  title: 'Сертификации DevOps и Cloud',
  moduleId: 'cloud',
  order: 3,
  duration: '2–3 часа',
  level: 'beginner',
  description:
    'Дорожная карта сертификаций AWS, Kubernetes, Terraform с планом подготовки на 8 недель',
  sections: [
    {
      title: 'Зачем нужны сертификации',
      content: `Сертификации — **не замена** практике и портфолио, но полезный инструмент:

**Плюсы:**
- Структурируют обучение (чёткий syllabus)
- Проходят HR-фильтры (особенно AWS SAA, CKA)
- Подтверждают baseline знаний
- Мотивируют систематически учиться
- Некоторые партнёрские программы AWS требуют certified staff

**Минусы:**
- Экзамен ≠ реальная работа (multiple choice vs debugging prod)
- Устаревают (пересдача каждые 2–3 года)
- Стоят денег ($150–400 за экзамен)
- Можно «натаскаться» без глубокого понимания

**Вывод:** сертификат + pet-проект на GitHub = сильная комбинация для junior/middle DevOps.`,
    },
    {
      title: 'Дорожная карта: рекомендуемый порядок',
      content: `**Уровень 0 (опционально):**
- **AWS Cloud Practitioner (CLF-C02)** — обзор AWS, $100, лёгкий

**Уровень 1 (фундамент):**
- **AWS Solutions Architect Associate (SAA-C03)** — самый востребованный AWS cert
- **CKA (Certified Kubernetes Administrator)** — must-have для K8s

**Уровень 2 (углубление):**
- **AWS Developer Associate (DVA-C02)** — CI/CD, Lambda, SDK
- **HashiCorp Terraform Associate** — IaC
- **CKAD (Certified Kubernetes Application Developer)** — деплой приложений

**Уровень 3 (продвинутый):**
- **AWS DevOps Engineer Professional (DOP-C02)** — CI/CD, monitoring, security
- **AWS Solutions Architect Professional (SAP-C02)** — multi-account, hybrid
- **CKS (Certified Kubernetes Security Specialist)** — security в K8s

**Security track (опционально):**
- **AWS Security Specialty (SCS-C02)**
- **CompTIA Security+**`,
    },
    {
      title: 'AWS Cloud Practitioner (CLF-C02)',
      content: `**Уровень:** Foundational | **Стоимость:** $100 | **Формат:** 65 вопросов, 90 мин | **Проходной:** 700/1000

**Темы:**
- Cloud concepts (IaaS, PaaS, SaaS)
- AWS global infrastructure (regions, AZ)
- Core services (EC2, S3, RDS, Lambda, VPC)
- Billing and pricing models
- Shared Responsibility Model
- Security (IAM basics, encryption)

**Кому:** абсолютные новички в облаке, менеджеры, sales.

**Стоит ли:** если уже знаешь AWS — пропусти и иди на SAA. Если совсем с нуля — хороший вход.`,
    },
    {
      title: 'AWS Solutions Architect Associate (SAA-C03)',
      content: `**Уровень:** Associate | **Стоимость:** $150 | **Формат:** 65 вопросов, 130 мин | **Проходной:** 720/1000

**Ключевые темы:**
- **Design resilient architectures** — Multi-AZ, Auto Scaling, ELB, Route 53
- **Design high-performing** — S3 storage classes, CloudFront, ElastiCache
- **Design secure** — IAM, KMS, Security Groups, WAF, encryption
- **Design cost-optimized** — Reserved/Spot, S3 lifecycle, right-sizing

**Сервисы для изучения:** EC2, S3, RDS, VPC, IAM, Route 53, CloudFront, SQS, SNS, Lambda, API Gateway, CloudWatch, CloudFormation.

**Самый востребованный** AWS-сертификат. 60%+ вакансий DevOps упоминают SAA.`,
    },
    {
      title: 'CKA: Certified Kubernetes Administrator',
      content: `**Организатор:** CNCF/Linux Foundation | **Стоимость:** $395 (1 пересдача) | **Формат:** практический, 2 часа, терминал

**Темы (вес в экзамене):**
- Storage (10%) — PV, PVC, StorageClass
- Troubleshooting (30%) — **самый большой блок!**
- Workloads & Scheduling (15%)
- Cluster Architecture (25%)
- Services & Networking (20%)

**Особенность:** нужно **решать задачи в реальном кластере**, не multiple choice. Умение быстро работать с \`kubectl\` критично.

**Подготовка:** killer.sh (2 mock exams включены), practice на minikube/kind.`,
      code: {
        language: 'bash',
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
        caption: 'Команды для CKA',
      },
    },
    {
      title: 'AWS Developer Associate (DVA-C02)',
      content: `**Уровень:** Associate | **Стоимость:** $150 | **Формат:** 65 вопросов, 130 мин

**Фокус:** разработка и деплой приложений на AWS.

**Темы:**
- AWS SDK и CLI
- Lambda, API Gateway, DynamoDB
- CI/CD: CodePipeline, CodeBuild, CodeDeploy
- Container services: ECS, ECR, EKS basics
- CloudFormation, SAM
- X-Ray tracing, CloudWatch

**Кому:** DevOps-инженерам, которые пишут и деплоят приложения. Хорошее дополнение к SAA.`,
    },
    {
      title: 'AWS DevOps Engineer Professional (DOP-C02)',
      content: `**Уровень:** Professional | **Стоимость:** $300 | **Формат:** 75 вопросов, 180 мин | **Проходной:** 750/1000

**Предварительные:** рекомендуется SAA + DVA (или эквивалентный опыт 2+ года).

**Темы:**
- CI/CD pipelines (CodePipeline, Jenkins, GitHub Actions на AWS)
- Infrastructure as Code (CloudFormation, CDK)
- Monitoring и logging (CloudWatch, X-Ray, CloudTrail)
- High availability и disaster recovery
- Security (IAM policies, Secrets Manager, compliance)
- Incident response и troubleshooting

**Самый релевантный** AWS cert для DevOps-инженера.`,
    },
    {
      title: 'Terraform Associate и другие IaC-сертификаты',
      content: `**HashiCorp Terraform Associate (003):**
- Стоимость: $70
- Формат: 57 вопросов, 60 мин
- Темы: HCL syntax, state management, modules, providers, workspaces
- Полезен, если активно используешь Terraform

**Pulumi:** нет официального cert, но есть badge programs.

**Ansible:** Red Hat Certified Specialist in Ansible Automation (EX447) — для enterprise.

**Git:** нет mainstream cert, но GitHub Foundations (бесплатный badge).`,
    },
    {
      title: 'Security-сертификаты',
      content: `**AWS Security Specialty (SCS-C02):**
- $300, Professional level
- IAM advanced, KMS, WAF, Shield, GuardDuty, Inspector, Macie
- Compliance: HIPAA, PCI-DSS, GDPR
- Incident response на AWS

**CKS (Certified Kubernetes Security Specialist):**
- $395, требует CKA
- Pod Security, Network Policies, RBAC, secrets, supply chain security
- Runtime security (Falco)

**CompTIA Security+:**
- $392, entry-level security
- Broad coverage: cryptography, network security, compliance
- Полезен для DevSecOps track`,
    },
    {
      title: 'План подготовки: 8 недель до SAA + CKA',
      content: `**Неделя 1–2: AWS Fundamentals**
- Пройди главы aws-basics и aws-networking этого учебника
- Практика: EC2, S3, IAM, VPC в Free Tier
- Курс: Stephane Maarek SAA на Udemy
- Practice exams: 1 тест в конце недели 2

**Неделя 3–4: AWS Advanced + SAA**
- RDS, Lambda, CloudFront, Route 53, CloudFormation
- Tutorials Dojo practice exams (6 штук)
- Слабые темы — повторить
- **Экзамен SAA** в конце недели 4

**Неделя 5–6: Kubernetes**
- Пройди главы orchestration этого учебника
- minikube/kind: deployments, services, ingress, PV/PVC
- killer.sh CKA course
- Practice: troubleshooting pods daily

**Неделя 7–8: CKA Intensive**
- Mock exams killer.sh (2 included)
- Тренировка скорости: решай задачи за < 5 мин
- \`kubectl\` shortcuts, aliases, автодополнение
- **Экзамен CKA** в конце недели 8`,
    },
    {
      title: 'Ежедневный распорядок подготовки',
      content: `**Будни (1.5–2 часа):**
- 30 мин — теория (видео/учебник)
- 45 мин — hands-on практика (AWS Free Tier / minikube)
- 15 мин — flashcards / cheat sheets

**Выходные (3–4 часа):**
- 1 practice exam (с разбором ошибок!)
- Pet-проект: применяй изученное
- Записывай слабые темы

**За неделю до экзамена:**
- Только practice exams (минимум 3)
- Cheat sheet: повтори все сервисы/команды
- Не учи новое — закрепляй известное
- Выспись накануне`,
    },
    {
      title: 'Советы по сдаче экзаменов',
      content: `**AWS (multiple choice):**
- Читай вопрос дважды — ищи ключевые слова (cost, security, availability)
- Elimination: убери явно неправильные ответы
- «Most cost-effective» ≠ «cheapest» — учитывай operational overhead
- Flag & Review: не застревай на одном вопросе
- Помечай вопросы с «Select TWO/THREE»

**CKA (практический):**
- \`kubectl explain\` — твой лучший друг на экзамене
- Создавай YAML файлов, не трать время на \`--dry-run=client -o yaml\`
- Проверяй каждую задачу: \`kubectl get\` после создания
- SSH на node: \`systemctl status kubelet\`, \`/var/log/pods/\`
- Настрой aliases ДО начала экзамена
- Управляй временем: 2 часа / ~17 задач = ~7 мин на задачу`,
      code: {
        language: 'bash',
        code: `# Настройка перед CKA экзаменом
alias k=kubectl
complete -F __start_kubectl k
export dry="--dry-run=client -o yaml"
export do="--force --grace-period=0"
# Создание pod быстро:
k run nginx --image=nginx $dry | k apply -f -
# Документация:
kubectl explain pod.spec.containers`,
        caption: 'CKA exam setup',
      },
    },
    {
      title: 'Бесплатные и доступные ресурсы',
      content: `**AWS:**
- [AWS Skill Builder](https://skillbuilder.aws) — бесплатные курсы
- [AWS Free Tier](https://aws.amazon.com/free/) — практика
- [Tutorials Dojo](https://tutorialsdojo.com) — лучшие practice exams ($15)
- [ExamPro AWS](https://www.exampro.co) — бесплатный курс SAA

**Kubernetes:**
- [killer.sh](https://killer.sh) — включён в CKA registration
- [KodeKloud CKA](https://kodekloud.com) — практические labs
- [Play with Kubernetes](https://labs.play-with-k8s.com) — бесплатный sandbox

**Terraform:**
- [HashiCorp Learn](https://developer.hashicorp.com/terraform/tutorials) — бесплатно
- [Gruntwork Blog](https://blog.gruntwork.io) — best practices

**Общие:**
- [DevOps Exercises](https://github.com/bregman-arie/devops-exercises) — вопросы с ответами`,
    },
    {
      title: 'Поддержание сертификатов',
      content: `**Срок действия:**
| Сертификат | Срок | Продление |
|-----------|------|-----------|
| AWS Associate | 3 года | Экзамен или CloudQuest |
| AWS Professional | 3 года | Экзамен |
| CKA/CKAD/CKS | 3 года | Экзамен за 12 мес до истечения |
| Terraform Associate | 2 года | Экзамен |

**AWS recertification:** сдай экзамен того же или более высокого уровня.

**Стратегия:** не гонись за всеми certs. 2–3 релевантных + сильное портфолио > 10 certs без практики.`,
    },
  ],
  practice: [
    'Выбери первую сертификацию (рекомендация: AWS SAA) и зарегистрируй дату экзамена через 8 недель',
    'Составь еженедельный план подготовки по шаблону из этой главы',
    'Пройди один бесплатный practice exam (ExamPro или Tutorials Dojo trial)',
    'Создай cheat sheet с ключевыми AWS сервисами и kubectl командами',
    'Настрой AWS Free Tier аккаунт для hands-on практики',
  ],
  resources: [
    { title: 'AWS Certification', url: 'https://aws.amazon.com/certification/' },
    { title: 'CNCF Certifications', url: 'https://www.cncf.io/certification/' },
    { title: 'HashiCorp Certifications', url: 'https://www.hashicorp.com/certification' },
    { title: 'Tutorials Dojo', url: 'https://tutorialsdojo.com' },
    { title: 'killer.sh', url: 'https://killer.sh' },
  ],
}
