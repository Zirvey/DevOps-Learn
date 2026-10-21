import type { Chapter } from '../../types'

export const introChapters: Chapter[] = [
  {
    id: 'what-is-devops',
    slug: 'what-is-devops',
    title: 'Что такое DevOps',
    moduleId: 'intro',
    order: 0,
    duration: '1–1.5 часа',
    level: 'beginner',
    description:
      'Полное введение в философию DevOps: культура, практики, метрики, роли и отличие от традиционной эксплуатации',
    sections: [
      {
        title: 'Определение и суть DevOps',
        content: `**DevOps** (Development + Operations) — это не должность, не один инструмент и не отдел. Это **набор культурных принципов, практик и инструментов**, объединяющих разработку программного обеспечения и его эксплуатацию в единый непрерывный процесс.

> «DevOps — это культура, в которой разработчики и операционные инженеры работают вместе на протяжении всего жизненного цикла продукта: от проектирования до эксплуатации в продакшене.»

**Главная цель DevOps** — сократить время от идеи до ценности для пользователя (time-to-market), повысить качество релизов и сделать системы **надёжными, воспроизводимыми и безопасными**.

Традиционная модель «разработчики пишут код → передают ops → ops деплоит и чинит» порождает:
- Долгие циклы релизов (раз в квартал или реже)
- «Стена» между командами и взаимные обвинения при инцидентах
- Ручные, невоспроизводимые деплои
- Страх перед изменениями в продакшене

DevOps разрушает эту стену через **совместную ответственность**, **автоматизацию** и **обратную связь** от продакшена.`,
      },
      {
        title: 'История: от Agile к DevOps',
        content: `Чтобы понять DevOps, нужно увидеть эволюцию:

| Эра | Подход | Проблема |
|-----|--------|----------|
| Waterfall | Последовательные фазы, редкие релизы | Медленная реакция на рынок |
| Agile (2001) | Итерации, гибкость разработки | Ops остаётся «за бортом» |
| DevOps (~2009) | Dev + Ops в одном цикле | — |

Ключевые вехи:
- **2009** — конференция Velocity, доклад «10+ Deploys Per Day» (Flickr)
- **2009** — появление термина DevOps (Патрик Дебуа)
- **2010** — DevOpsDays в Бельгии
- **2013** — «The Phoenix Project» — бестселлер, популяризировавший идеи
- **2014+** — Docker, Kubernetes, облака ускорили adoption

**Agile** ускорил разработку, но **не решил проблему доставки**. DevOps дополняет Agile: не только «быстро писать код», но и «быстро и безопасно доставлять его пользователям».`,
      },
      {
        title: 'Модель CALMS',
        content: `Академическое и практическое сообщество описывает DevOps через аббревиатуру **CALMS**:

**C — Culture (Культура)**
Совместная ответственность за продукт. Нет «это не моя зона». Blameless postmortems после инцидентов.

**A — Automation**
Всё повторяемое — в код: сборка, тесты, деплой, инфраструктура, мониторинг.

**L — Lean**
Устранение потерь: ожидание, ручной труд, незавершённая работа, лишние процессы.

**M — Measurement**
Метрики DORA, SLI/SLO, время восстановления, частота деплоев. Решения на основе данных.

**S — Sharing**
Обмен знаниями: документация, runbooks, внутренние митапы, открытый код конфигов.

> Без культуры (C) автоматизация (A) превращается в «быстрый хаос». Без измерений (M) невозможно понять, улучшаетесь вы или нет.`,
      },
      {
        title: 'Ключевые принципы',
        content: `**1. Культура сотрудничества и доверия**
Разработчики понимают эксплуатацию; ops-инженеры участвуют в архитектуре. On-call могут нести и разработчики.

**2. Автоматизация всего повторяемого**
Ручной деплой в пятницу вечером — антипаттерн. Pipeline делает одно и то же каждый раз.

**3. CI/CD — непрерывная интеграция и доставка**
Код часто мержится в main, автоматически тестируется и доставляется (или готов к доставке по кнопке).

**4. Infrastructure as Code (IaC)**
Серверы, сети, DNS, балансировщики — в Git. Изменения через PR и review.

**5. Мониторинг, логирование, observability**
Ты не можешь улучшить то, что не измеряешь. Метрики, логи, трейсы — глаза и уши в продакшене.

**6. DevSecOps — безопасность с первого дня**
Сканирование зависимостей, секреты в vault, least privilege, security в pipeline — не «в конце проекта».

**7. Идемпотентность и воспроизводимость**
Повторный запуск скрипта/плейбука даёт тот же результат. Окружения dev/staging/prod максимально похожи.`,
      },
      {
        title: 'DevOps Lifecycle (Infinity Loop)',
        content: `Жизненный цикл DevOps — **бесконечный цикл** непрерывного улучшения:

\`\`\`
    Plan ──→ Code ──→ Build ──→ Test
      ↑                           ↓
   Monitor ←── Operate ←── Deploy ←── Release
\`\`\`

| Этап | Что происходит | Типичные инструменты |
|------|----------------|---------------------|
| **Plan** | Бэклог, приоритеты, инциденты | Jira, Linear, GitHub Issues |
| **Code** | Разработка, review | Git, IDE, pre-commit hooks |
| **Build** | Компиляция, образы | GitHub Actions, Jenkins, GitLab CI |
| **Test** | Unit, integration, e2e, security | pytest, Playwright, Trivy |
| **Release** | Версионирование, changelog | semantic-release, tags |
| **Deploy** | Доставка в окружения | ArgoCD, Helm, Terraform |
| **Operate** | Эксплуатация, масштабирование | K8s, systemd, autoscaler |
| **Monitor** | Метрики, алерты, логи | Prometheus, Grafana, Loki |

Каждый этап **питает** следующий. Мониторинг возвращает данные в Plan (новые фичи, баги, tech debt).`,
      },
      {
        title: 'Метрики DORA',
        content: `**DORA** (DevOps Research and Assessment) — золотой стандарт измерения зрелости DevOps. Четыре ключевые метрики:

**1. Deployment Frequency** — как часто вы деплоите в продакшен
- Elite: несколько раз в день
- Low: раз в месяц или реже

**2. Lead Time for Changes** — время от коммита до работы в продакшене
- Elite: менее часа
- Low: от месяца до полугода

**3. Change Failure Rate** — доля деплоев, вызвавших сбой
- Elite: 0–15%
- Low: 46–60%

**4. Time to Restore Service (MTTR)** — время восстановления после инцидента
- Elite: менее часа
- Low: от недели до месяца

> Высокие показатели DORA коррелируют с бизнес-результатами: скорость доставки, стабильность, удовлетворённость команд.`,
      },
      {
        title: 'Чем занимается DevOps-инженер',
        content: `**DevOps Engineer** — инженер на стыке разработки и эксплуатации. Типичные зоны ответственности:

**CI/CD и автоматизация**
- Проектирование и поддержка pipeline
- Кэширование, параллелизация, оптимизация времени сборки

**Контейнеры и оркестрация**
- Docker, Kubernetes, Helm charts
- Resource limits, HPA, network policies

**Облако и IaC**
- AWS/GCP/Azure: VPC, IAM, EC2, S3, RDS
- Terraform, Pulumi, Ansible, CloudFormation

**Наблюдаемость**
- Prometheus, Grafana, ELK/Loki, Datadog
- SLI/SLO, алертинг, on-call ротации

**Безопасность и compliance**
- Secrets management (Vault, SSM)
- RBAC, audit logs, vulnerability scanning

**Надёжность**
- Инцидент-менеджмент, postmortems
- Capacity planning, disaster recovery

DevOps-инженер **не** «тот, кто только крутит сервера». Он **строит платформу**, на которой команда разработки безопасно и быстро доставляет продукт.`,
      },
      {
        title: 'Смежные роли: SRE, Platform Engineer',
        content: `| Роль | Фокус | Отличие от «классического» DevOps |
|------|-------|-----------------------------------|
| **DevOps Engineer** | CI/CD, инфраструктура, автоматизация | Широкий стек, часто в продуктовых командах |
| **SRE** (Site Reliability Engineer) | Надёжность, SLO, toil reduction | Инженерный подход Google: error budget, автоматизация рутины |
| **Platform Engineer** | Internal Developer Platform (IDP) | Self-service для разработчиков: «золотые пути» |
| **Cloud Engineer** | Облачная архитектура | Глубокая экспертиза в AWS/GCP/Azure |
| **Release Engineer** | Процесс релизов, артефакты | Меньше инфраструктуры, больше pipeline |

На практике границы размыты. Вакансия «DevOps» может означать SRE или Platform. Важно читать **конкретные требования**, а не только title.`,
      },
      {
        title: 'DevOps vs традиционный Sysadmin',
        content: `| Аспект | Традиционный Sysadmin | DevOps |
|--------|----------------------|--------|
| Деплой | Ручной, по runbook | Автоматический pipeline |
| Инфраструктура | Ручная настройка серверов | IaC, immutable infrastructure |
| Изменения | Редкие, «окна обслуживания» | Частые, малые batch |
| Ответственность | Ops «владеет» продакшеном | Shared ownership |
| Документация | Wiki, устаревает | Код в Git — source of truth |
| Масштаб | Вертикальный (больше RAM/CPU) | Горизонтальный (больше инстансов) |

DevOps **не отменяет** знание Linux, сетей и системного администрирования — наоборот, **углубляет** их через автоматизацию и масштаб.`,
      },
      {
        title: 'Антипаттерны DevOps',
        content: `Чего избегать при внедрении DevOps:

**«DevOps-отдел»** — создание изолированной команды «DevOps», которая становится новой стеной. DevOps — это способ работы **всех**, а не отдельный silo.

**«Инструмент = DevOps»** — покупка Jenkins и Kubernetes без смены культуры даёт «автоматизированный хаос».

**«NoOps»** — миф, что ops исчезнет. Эксплуатация никуда не девается; меняется **характер** работы.

**Hero culture** — один человек «знает всё» и тушит все пожары. Это bus factor = 1 и выгорание.

**Игнорирование безопасности** — «потом закроем». Техдолг в security дороже всего.

**100% uptime как цель** — недостижимо и контрпродуктивно. Правильная цель — **SLO** и управляемый риск.`,
      },
      {
        title: 'Три пути DevOps (The Three Ways)',
        content: `Из «The DevOps Handbook» — три фундаментальных принципа:

**Первый путь: Поток (Flow)**
Ускорить движение работы от разработки к пользователю. Убрать блокеры, WIP limits, малые batch.

**Второй путь: Обратная связь (Feedback)**
Быстро узнавать о проблемах: мониторинг, тесты, пользовательская обратная связь. Усиливать feedback loops.

**Третий путь: Непрерывное обучение (Continual Learning)**
Эксперименты, blameless postmortems, время на улучшения (20% как у Google). Культура, где ошибки — источник обучения.`,
      },
      {
        title: 'Когда DevOps особенно ценен',
        content: `DevOps даёт максимальный эффект когда:

- Продукт **часто обновляется** (SaaS, веб, мобильные бэкенды)
- Есть **микросервисная** или распределённая архитектура
- Команда **растёт** и ручные процессы не масштабируются
- Требуется **compliance** и аудит изменений
- **Инциденты** дорого стоят (финтех, e-commerce, healthcare)

Менее критично для: редких релизов embedded, десктоп ПО без серверной части, очень маленьких статических сайтов. Но базовые практики (Git, CI, IaC) полезны почти везде.`,
      },
    ],
    practice: [
      'Запиши 5 проблем традиционной модели «dev vs ops», которые ты видел или можешь представить в реальной компании',
      'Для каждого принципа CALMS приведи один конкретный пример из жизни (работа, учёба, open source)',
      'Найди 3 вакансии DevOps/SRE/Platform Engineer и выпиши: повторяющиеся технологии, soft skills, уровень (junior/middle)',
      'Оцени гипотетическую команду по 4 метрикам DORA: deployment frequency, lead time, change failure rate, MTTR — что бы ты улучшил первым?',
      'Составь сравнительную таблицу: «как делают сейчас» vs «как с DevOps» для сценария: баг в продакшене в пятницу вечером',
      'Прочитай один blameless postmortem (публичный, например от GitLab или Cloudflare) и выпиши 3 урока',
      'Опиши «три пути» своими словами и приведи по одному действию для каждого пути в контексте pet-проекта',
      'Сформулируй ответ на вопрос собеседования: «Что такое DevOps и чем он отличается от просто использования Docker?»',
    ],
    resources: [
      { title: 'The DevOps Handbook', url: 'https://itrevolution.com/product/the-devops-handbook/' },
      { title: 'Google SRE Book', url: 'https://sre.google/books/' },
    ],
  },
  {
    id: 'learning-roadmap',
    slug: 'learning-roadmap',
    title: 'Дорожная карта обучения',
    moduleId: 'intro',
    order: 1,
    duration: '45 мин',
    level: 'beginner',
    description:
      'Пошаговый план изучения DevOps от нуля до junior: этапы, сроки, pet-проект, оборудование и методика обучения',
    sections: [
      {
        title: 'Обзор пути: от нуля до junior',
        content: `Путь в DevOps — **марафон**, не спринт. При **10–15 часах в неделю** реалистичный срок до уровня **junior DevOps** — **6–9 месяцев**.

Структура обучения в этом учебнике следует логике **снизу вверх** (bottom-up):

1. **Фундамент** — Linux, сети, Git, Bash, SSH, YAML, Nginx
2. **Контейнеры** — Docker, Compose
3. **Оркестрация** — Kubernetes
4. **CI/CD** — pipeline, GitHub Actions
5. **IaC** — Terraform, Ansible
6. **Облако** — AWS/GCP основы
7. **Observability** — Prometheus, Grafana, логи
8. **Security & Career** — безопасность, собеседования

> Не перескакивай фундамент. Kubernetes без понимания Linux и сетей — рецепт постоянной «магии», которую ты не понимаешь.`,
      },
      {
        title: 'Месяц 1–2: Фундамент',
        content: `**Цель:** уверенно работать в Linux-терминале, понимать сети, версионировать код.

| Неделя | Темы | Результат |
|--------|------|-----------|
| 1–2 | Linux: ФС, пользователи, права, процессы | VPS или VM, SSH, базовые команды |
| 3 | Сети: TCP/IP, DNS, HTTP, curl, firewall | Диагностика сетевых проблем |
| 4 | Git: ветки, merge, remote, PR workflow | Репозиторий на GitHub |
| 5–6 | Bash: скрипты, cron, автоматизация | 2–3 рабочих скрипта |
| 7 | SSH: ключи, config, hardening | Безпарольный вход по ключу |
| 8 | YAML + Nginx: конфиги, reverse proxy, SSL | Статический сайт за Nginx |

**Практика:** один **VPS** (Hetzner, DigitalOcean, Timeweb — от ~300–500 ₽/мес) или **локальная VM** (VirtualBox, UTM, Multipass).`,
      },
      {
        title: 'Месяц 3: Контейнеры',
        content: `**Цель:** контейнеризировать приложение и запускать multi-container стеки.

- Установка Docker Engine / Docker Desktop
- \`docker run\`, \`build\`, \`push\`, volumes, networks
- **Dockerfile**: multi-stage, non-root user, .dockerignore
- **Docker Compose**: web + db + redis
- Registry: Docker Hub, GitHub Container Registry (GHCR)

**Pet-проект:** упаковать своё (или учебное) веб-приложение в образ и запустить через Compose локально и на VPS.`,
      },
      {
        title: 'Месяц 4: CI/CD',
        content: `**Цель:** автоматический pipeline при каждом push.

- Концепции: CI vs CD, stages, artifacts
- **GitHub Actions** (или GitLab CI): lint → test → build → push image
- Secrets в CI, environments (staging/production)
- Деплой на VPS через SSH или в registry для последующего pull

**Результат:** push в main → тесты зелёные → образ в registry → (опционально) деплой.`,
      },
      {
        title: 'Месяц 5–6: Kubernetes',
        content: `**Цель:** понимать оркестрацию и деплоить приложение в кластер.

- Архитектура K8s: control plane, nodes, etcd
- Workloads: Pod, Deployment, ReplicaSet, StatefulSet
- Networking: Service, Ingress, DNS внутри кластера
- Config: ConfigMap, Secret
- **Helm** — пакетный менеджер для K8s
- Локально: **minikube**, **kind**, **k3d**

> Для обучения достаточно локального кластера. Managed K8s (EKS, GKE) — после основ.`,
      },
      {
        title: 'Месяц 7–8: IaC и облако',
        content: `**Terraform**
- Providers, resources, state, plan/apply
- Модули, workspaces, remote state (S3 + DynamoDB)

**Ansible**
- Inventory, playbooks, roles, idempotency

**Облако (выбери одно)**
- **AWS**: EC2, S3, IAM, VPC, RDS — Free Tier 12 месяцев
- **GCP**: Compute Engine, Cloud Storage, IAM
- **Azure**: аналогичный набор

**Цель:** поднять инфраструктуру pet-проекта кодом, а не кликами в консоли.`,
      },
      {
        title: 'Месяц 9+: Observability и безопасность',
        content: `**Observability**
- Метрики: Prometheus, exporters, PromQL
- Визуализация: Grafana, dashboards
- Логи: Loki или ELK stack
- Алертинг: Alertmanager, on-call basics

**Security / DevSecOps**
- SAST, dependency scanning (Trivy, Dependabot)
- Secrets: Vault, sealed secrets
- Network policies, RBAC в K8s
- OWASP Top 10 — обзор

**Career**
- Резюме, GitHub portfolio, mock interviews
- Сертификации (опционально): CKA, AWS SAA`,
      },
      {
        title: 'Необходимое оборудование',
        content: `**Минимум:**
- Компьютер с **8 GB RAM** (16 GB **настоятельно** для Docker + K8s локально)
- **macOS**, **Linux** или **Windows + WSL2**
- Стабильный интернет

**Рекомендуется:**
- SSD с 50+ GB свободного места (образы Docker занимают много)
- Второй монитор — удобно: терминал + документация

**Бесплатные ресурсы для практики:**
| Ресурс | Для чего |
|--------|----------|
| GitHub | Репозитории, Actions, GHCR |
| AWS Free Tier | Облако 12 мес |
| minikube / kind | Локальный Kubernetes |
| Oracle Cloud Free Tier | Always-free VPS (ограничения) |
| Multipass | Быстрые Ubuntu VM |

**Не обязательно покупать:** платные курсы на старте — этот учебник + практика достаточны для junior.`,
      },
      {
        title: 'Pet-проект: сквозная нить обучения',
        content: `Один проект на весь путь — **лучшая стратегия**. Пример:

**Старт:** простое веб-приложение (Node.js/Python/Go — любой стек)
- CRUD API + простой фронт или только API

**Этапы эволюции:**
1. Код в Git, README, .gitignore
2. Деплой на VPS: systemd + Nginx reverse proxy
3. Dockerfile → Docker Compose (app + PostgreSQL)
4. GitHub Actions: test + build image
5. Деплой в K8s (Deployment + Service + Ingress)
6. Terraform: VPC, VM или managed K8s
7. Prometheus metrics endpoint + Grafana dashboard
8. HTTPS, secrets, backup script

> Каждый новый навык **применяй к этому проекту**. Портфолио из одного хорошо проработанного репо лучше десяти hello-world.`,
      },
      {
        title: 'Как учиться эффективно',
        content: `**Правило 70/30:** 70% времени — **руки в терминале**, 30% — чтение и видео.

**Active recall:** после главы закрой учебник и воспроизведи команды из памяти.

**Spaced repetition:** возвращайся к Linux/Git через неделю — закрепление.

**Документируй:** веди заметки в этом учебнике или в Obsidian/Notion. Напиши runbook для своего VPS.

**Учись на ошибках:** сломай что-нибудь в VM (не на работе!) — восстановление учит лучше теории.

**Сообщество:** Habr DevOps, Telegram-чаты, локальные митапы. Задавай вопросы с **контекстом**: что делал, что ожидал, что получил.

**Избегай tutorial hell:** после 2–3 глав по теме — **свой проект**, не бесконечные курсы.`,
      },
      {
        title: 'Типичные ошибки новичков',
        content: `1. **Сразу в Kubernetes** без Linux и Docker — постоянное «непонятно почему не работает»
2. **Только видео** — без практики ничего не запоминается
3. **Прыжки между облаками** — выбери одно (AWS чаще в вакансиях), углубись
4. **Игнор Git** — «потом выучу» — Git нужен с первого дня
5. **Страх терминала** — GUI-инструменты полезны, но 80% DevOps — CLI
6. **Отсутствие pet-проекта** — нечего показать на собеседовании
7. **Зубрёжка команд** — понимай **зачем**, не только **как**`,
      },
      {
        title: 'Чеклист готовности к junior',
        content: `Отметь себя честно (да/частично/нет):

**Linux & Shell**
- [ ] SSH на сервер, навигация, права, systemd, логи
- [ ] Bash-скрипт с \`set -euo pipefail\`
- [ ] Диагностика: disk, memory, processes

**Сети**
- [ ] DNS, HTTP, curl, firewall basics
- [ ] Понимание портов и reverse proxy

**Git**
- [ ] Branch, merge, conflict resolution, PR
- [ ] .gitignore, tags

**Контейнеры & K8s**
- [ ] Dockerfile, docker compose
- [ ] Deployment, Service, Ingress в K8s

**CI/CD & IaC**
- [ ] Pipeline: test + build
- [ ] Terraform: создать VM или S3 bucket

**Soft**
- [ ] Объяснить инцидент без обвинений
- [ ] Написать понятный README

**8+ «да»** — можно смело откликаться на junior позиции.`,
      },
      {
        title: 'Сертификации: нужны ли они',
        content: `Сертификации **не обязательны** для junior, но помогают структурировать обучение и пройти HR-фильтры.

| Сертификация | Когда имеет смысл |
|--------------|-------------------|
| **CKA** (Kubernetes) | После 2–3 месяцев практики с K8s |
| **AWS SAA** | При фокусе на AWS |
| **LFCS** (Linux) | Слабый Linux на собеседованиях |
| **HashiCorp Terraform** | После реальных проектов с TF |

**Порядок:** сначала pet-проект и практика → потом сертификация для закрепления. Сертификат без опыта на собеседовании быстро проверяется.`,
      },
    ],
    practice: [
      'Создай GitHub-репозиторий \`devops-handbook-practice\` с README: цели, стек pet-проекта, чеклист по месяцам',
      'Установи WSL2 (Windows) или Multipass/UTM (macOS) с Ubuntu 22.04/24.04 — зафиксируй версию в заметках',
      'Составь личный план на 3 месяца: конкретные цели по неделям (не «изучить Linux», а «настроить VPS, nginx, SSL»)',
      'Арендуй VPS или подними локальную VM — запиши IP, способ доступа, ОС в свой runbook',
      'Пройди чеклист готовности к junior — отметь слабые зоны и поставь их первыми в плане',
      'Найди 5 junior DevOps вакансий: выпиши общий стек и составь таблицу «знаю / учу / не знаю»',
      'Выдели в календаре 10 часов в неделю на обучение — защити это время как рабочую встречу',
      'Опиши pet-проект в 10 предложениях: что делает, стек, как будешь деплоить к концу 6 месяца',
    ],
    resources: [
      { title: 'roadmap.sh — DevOps', url: 'https://roadmap.sh/devops' },
    ],
  },
  {
    id: 'devops-tools-overview',
    slug: 'devops-tools-overview',
    title: 'Экосистема инструментов DevOps',
    moduleId: 'intro',
    order: 2,
    duration: '1–1.5 часа',
    level: 'beginner',
    description:
      'Обзор всей экосистемы DevOps: VCS, CI/CD, контейнеры, оркестрация, IaC, облака, observability, security — что для чего и как связано',
    sections: [
      {
        title: 'Карта экосистемы',
        content: `DevOps — это **не один инструмент**, а **ландшафт** взаимосвязанных категорий. Упрощённая карта:

\`\`\`
[Code: Git] → [CI: Actions/Jenkins] → [Artifacts: Registry]
       ↓                                      ↓
[IaC: Terraform] → [Runtime: K8s/Docker] → [Deploy: ArgoCD/Helm]
       ↓                                      ↓
[Cloud: AWS/GCP] ← [Config: Ansible]    → [Observe: Prom/Grafana]
       ↓                                      ↓
[Secrets: Vault]  ← [Security: Trivy]   → [Logs: Loki/ELK]
\`\`\`

Каждая категория решает **свою задачу**. Ошибка новичка — пытаться выучить всё сразу. Правильный путь — **последовательно**, по мере прохождения учебника.`,
      },
      {
        title: 'Контроль версий (VCS)',
        content: `**Задача:** хранить историю кода и конфигов, совместная работа, code review.

| Инструмент | Описание | Когда использовать |
|------------|----------|-------------------|
| **Git** | Стандарт де-факто | Всегда. Код, Terraform, Helm, Ansible |
| **GitHub** | Хостинг + Actions + Issues | Open source, стартапы |
| **GitLab** | Хостинг + встроенный CI/CD | Self-hosted, enterprise |
| **Bitbucket** | Atlassian ecosystem | Jira + Confluence shops |

**Связанные практики:** branching strategy (Git Flow, trunk-based), PR/MR, branch protection, signed commits.

> В DevOps в Git хранится не только приложение, но и **вся инфраструктура** — «Git as single source of truth».`,
      },
      {
        title: 'CI/CD — непрерывная интеграция и доставка',
        content: `**CI (Continuous Integration):** каждый merge запускает сборку и тесты.
**CD (Continuous Delivery/Deployment):** артефакт автоматически доставляется в окружение (или готов к одобренному деплою).

| Инструмент | Тип | Особенности |
|------------|-----|-------------|
| **GitHub Actions** | Cloud CI | YAML в репо, marketplace actions |
| **GitLab CI** | Встроенный в GitLab | .gitlab-ci.yml, runners |
| **Jenkins** | Self-hosted | Плагины, Groovy pipelines, legacy |
| **CircleCI** | Cloud | Быстрый старт |
| **ArgoCD / Flux** | GitOps CD | Sync K8s из Git |
| **Tekton** | Cloud-native CI | K8s-native pipelines |

**Типичный pipeline:**
\`lint → unit test → build image → security scan → push registry → deploy staging → smoke test → deploy prod\``,
        codes: [
          {
            language: 'yaml',
            caption: 'Упрощённый GitHub Actions workflow',
            code: `name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
      - run: docker build -t app:\${{ github.sha }} .
      - run: docker push ghcr.io/org/app:\${{ github.sha }}`,
          },
        ],
      },
      {
        title: 'Контейнеризация',
        content: `**Задача:** упаковать приложение с зависимостями в переносимый изолированный образ.

| Инструмент | Роль |
|------------|------|
| **Docker** | Сборка и запуск контейнеров, Dockerfile |
| **Docker Compose** | Multi-container на одном хосте |
| **Podman** | Альтернатива Docker, rootless |
| **buildah/skopeo** | Сборка и копирование образов без daemon |

**Registry (хранилище образов):**
- Docker Hub — публичный каталог
- **GHCR** (ghcr.io) — GitHub Container Registry
- **ECR** (AWS), **GCR/Artifact Registry** (GCP), **ACR** (Azure)
- **Harbor** — self-hosted enterprise registry

**Форматы:** OCI image — открытый стандарт; Docker-образы совместимы.`,
      },
      {
        title: 'Оркестрация контейнеров',
        content: `**Задача:** управлять сотнями/тысячами контейнеров: scheduling, scaling, self-healing, networking.

| Инструмент | Масштаб | Статус |
|------------|---------|--------|
| **Kubernetes (K8s)** | Кластер, production standard | Де-факто стандарт |
| **Docker Swarm** | Простой кластер Docker | Устаревает |
| **Nomad** | HashiCorp, не только контейнеры | Нишевый |
| **ECS/Fargate** | AWS-native | В AWS экосистеме |

**Экосистема Kubernetes:**
- **kubectl** — CLI
- **Helm** — charts (пакеты)
- **Kustomize** — overlay конфигов
- **Ingress**: nginx-ingress, Traefik
- **Service mesh** (advanced): Istio, Linkerd`,
      },
      {
        title: 'Infrastructure as Code (IaC)',
        content: `**Задача:** описать инфраструктуру декларативно в коде, версионировать, review через PR.

| Инструмент | Подход | Лучше для |
|------------|--------|-----------|
| **Terraform** | Декларативный, multi-cloud | Облачные ресурсы: VM, VPC, S3, RDS |
| **OpenTofu** | Форк Terraform (open source) | То же, лицензия |
| **Pulumi** | Код на Python/TS/Go | Кто предпочитает императив в коде |
| **CloudFormation** | AWS-only, JSON/YAML | Строго AWS |
| **Ansible** | Императивный, agentless | Конфигурация ОС, deploy на VM |
| **Crossplane** | K8s-native IaC | Platform teams |

**Terraform workflow:** \`init → plan → apply → destroy\`
**State** — критичен: храни в remote backend (S3 + lock), не в git plaintext.`,
      },
      {
        title: 'Облачные провайдеры',
        content: `**Задача:** аренда вычислений, хранилищ, сетей без своего дата-центра.

| Провайдер | Доля рынка | Ключевые сервисы |
|-----------|------------|------------------|
| **AWS** | ~32% | EC2, S3, IAM, VPC, EKS, Lambda, RDS |
| **Azure** | ~23% | VMs, Blob, AKS, Entra ID |
| **GCP** | ~11% | GCE, GCS, GKE, BigQuery |
| **Yandex Cloud** | РФ/СНГ | Compute, Object Storage, Managed K8s |

**Базовые концепции (везде):**
- **IAM** — кто что может (users, roles, policies)
- **VPC** — изолированная сеть
- **Regions / AZ** — отказоустойчивость
- **Managed services** — RDS, managed K8s (меньше ops)

> Выбери **одно** облако для глубокого изучения. Концепции переносятся.`,
      },
      {
        title: 'Конфигурация и секреты',
        content: `| Категория | Инструменты | Назначение |
|-----------|-------------|------------|
| **Форматы** | YAML, JSON, HCL, TOML | Конфиги, манифесты |
| **Шаблонизация** | Helm, Kustomize, envsubst | Параметризация |
| **Secrets** | HashiCorp Vault, AWS SSM, Sealed Secrets | Пароли, ключи, токены |
| **Config management** | Ansible, Chef, Puppet | Состояние серверов |

**Золотое правило:** секреты **никогда** в Git в открытом виде. Используй vault, CI secrets, или encrypted files (SOPS, git-crypt).`,
      },
      {
        title: 'Observability: метрики, логи, трейсы',
        content: `**Три столпа observability:**

**1. Metrics** — числовые временные ряды (CPU, RPS, latency p99)
- **Prometheus** — сбор и хранение
- **Grafana** — дашборды и визуализация
- **Datadog, New Relic** — SaaS all-in-one (платно)

**2. Logs** — текстовые события
- **Loki** — как Prometheus, но для логов (Grafana stack)
- **ELK** — Elasticsearch + Logstash + Kibana
- **Fluentd/Fluent Bit** — агенты сбора

**3. Traces** — путь запроса через микросервисы
- **Jaeger**, **Zipkin**, **Tempo**

**Алертинг:** Alertmanager (Prometheus), PagerDuty, Opsgenie — эскалация on-call.`,
      },
      {
        title: 'Сеть и балансировка',
        content: `| Инструмент | Роль |
|------------|------|
| **Nginx** | Reverse proxy, static, load balancing |
| **Traefik** | Dynamic config, K8s Ingress |
| **HAProxy** | L4/L7 load balancer |
| **Cloud LB** | ALB/NLB (AWS), Cloud Load Balancing (GCP) |
| **CDN** | Cloudflare, Fastly — кэш на edge |
| **DNS** | Route53, Cloudflare DNS, BIND |

**TLS:** Let's Encrypt + certbot / cert-manager (в K8s) — бесплатные сертификаты.`,
      },
      {
        title: 'Безопасность (DevSecOps)',
        content: `| Область | Инструменты |
|---------|-------------|
| **SAST** | SonarQube, Semgrep |
| **Dependency scan** | Trivy, Snyk, Dependabot |
| **Container scan** | Trivy, Clair |
| **Secrets detection** | gitleaks, truffleHog |
| **Policy as Code** | OPA, Kyverno (K8s) |
| **WAF** | ModSecurity, Cloudflare WAF |
| **SIEM** | Splunk, Wazuh |

**Shift-left:** проверки в CI **до** деплоя, а не аудит раз в год.`,
      },
      {
        title: 'Артефакты и пакеты',
        content: `| Тип | Репозитории |
|-----|-------------|
| Docker images | GHCR, ECR, Harbor |
| npm/pip/maven | npmjs, PyPI, Nexus, Artifactory |
| Helm charts | chartmuseum, OCI in registry |
| Terraform modules | Terraform Registry, private git |

**Версионирование:** semantic versioning (semver) — \`MAJOR.MINOR.PATCH\`. Теги Git ↔ версии образов.`,
      },
      {
        title: 'Коммуникация и инциденты',
        content: `| Инструмент | Назначение |
|------------|------------|
| **Slack / Mattermost** | Команда, интеграции с алертами |
| **PagerDuty / Opsgenie** | On-call, эскалация |
| **Jira / Linear** | Тикеты, инциденты, postmortem action items |
| **Statuspage** | Публичный статус для пользователей |
| **Confluence / Notion** | Runbooks, документация |

**Интеграция:** Alertmanager → Slack → PagerDuty при критических алертах.`,
      },
      {
        title: 'Как выбирать инструменты',
        content: `Критерии выбора в реальных компаниях:

1. **Зрелость команды** — Jenkins имеет смысл если уже есть; greenfield — GitHub Actions
2. **Облако** — в AWS логичны EKS, ECR, CloudFormation/Terraform AWS provider
3. **Self-hosted vs SaaS** — compliance, cost, operational burden
4. **Community & hiring** — K8s + Terraform проще найти людей
5. **Не изобретай велосипед** — стандартные решения для стандартных задач

**Для обучения:** следуй этому учебнику. Не распыляйся на 5 CI-систем — освой одну глубоко.`,
      },
      {
        title: 'Связь инструментов в типичном стеке',
        content: `Пример **modern startup stack**:

1. Код в **GitHub**
2. **GitHub Actions** — CI: test, build, Trivy scan
3. Образ в **GHCR**
4. **Terraform** — VPC, EKS cluster в AWS
5. **ArgoCD** — sync Helm chart из Git в EKS
6. **Prometheus + Grafana** — метрики
7. **Loki** — логи
8. **External Secrets** — секреты из AWS SSM
9. **Cloudflare** — DNS + CDN + WAF

Каждый компонент заменяем: GitLab вместо GitHub, Flux вместо ArgoCD — **паттерны** важнее брендов.`,
      },
      {
        title: 'Что изучать в этом учебнике и в каком порядке',
        content: `Соответствие модулей учебника и категорий инструментов:

| Модуль учебника | Инструменты |
|-----------------|-------------|
| Fundamentals | Linux, Git, Bash, SSH, Nginx, YAML |
| Containers | Docker, Compose |
| Orchestration | Kubernetes, Helm |
| CI/CD | GitHub Actions, GitOps концепции |
| IaC | Terraform, Ansible |
| Cloud | AWS (основы) |
| Observability | Prometheus, Grafana, Loki |
| Security & Career | DevSecOps, собеседования |

Эта глава — **карта местности**. Детали — в следующих модулях.`,
      },
    ],
    practice: [
      'Нарисуй (на бумаге или Excalidraw) схему: от git push до работающего приложения в K8s — укажи минимум 8 инструментов',
      'Для каждой категории (VCS, CI, Containers, IaC, Observe) выпиши 1 инструмент, который будешь изучать в этом учебнике, и 1 альтернативу',
      'Найди docker-compose.yml или .github/workflows в популярном open source (nginx, prometheus) — определи, какие категории инструментов там используются',
      'Составь таблицу «инструмент → какую проблему решает → чем заменить» для 15 инструментов из этой главы',
      'Объясни разницу CI и CD своими словами; приведи пример continuous deployment vs continuous delivery',
      'Ответь: зачем registry между CI и Kubernetes? Что хранится в registry?',
      'Сравни Terraform и Ansible: когда нужны оба, когда только один?',
      'Выбери гипотетический стек для pet-проекта (5–7 инструментов) и обоснуй каждый выбор в 2 предложениях',
    ],
    resources: [
      { title: 'CNCF Landscape', url: 'https://landscape.cncf.io' },
    ],
  },
]
