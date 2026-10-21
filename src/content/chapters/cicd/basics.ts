import type { Chapter } from '../../../types'

export const cicdBasicsChapter: Chapter = {
  id: 'cicd-basics',
  slug: 'cicd-basics',
  title: 'CI/CD: теория и практика',
  moduleId: 'cicd',
  order: 0,
  duration: '4–5 часов',
  level: 'intermediate',
  description:
    'Теория непрерывной интеграции и доставки: этапы pipeline, стратегии ветвления, артефакты и окружения',
  sections: [
    {
      title: 'Что такое CI/CD и зачем он нужен',
      content: `**CI/CD** (Continuous Integration / Continuous Delivery / Continuous Deployment) — набор практик и инструментов, автоматизирующих путь кода от коммита до продакшена.

**Проблемы без CI/CD:**
- Ручная сборка и деплой — источник человеческих ошибок
- «У меня работает» — разные окружения dev и prod
- Редкие релизы — большие, рискованные изменения
- Долгая обратная связь — баги обнаруживаются поздно

**Решение:** каждый коммит проходит автоматизированный pipeline: проверки → сборка → тесты → деплой. Обратная связь за минуты, а не дни.

CI/CD — не инструмент, а **культура и процесс**, подкреплённые автоматизацией.`,
    },
    {
      title: 'CI: Continuous Integration',
      content: `**Continuous Integration** — разработчики часто (несколько раз в день) интегрируют код в общую ветку (обычно \`main\`). Каждая интеграция запускает автоматическую сборку и тесты.

**Ключевые принципы CI:**
1. **Единый репозиторий** — весь код в одном месте (или монорепо с чёткой структурой)
2. **Автоматическая сборка** — каждый push/merge запускает build
3. **Автоматические тесты** — unit, integration, lint
4. **Быстрая обратная связь** — pipeline < 10–15 минут для CI-части
5. **Исправление сразу** — сломанный main блокирует команду → чиним немедленно

**Правило:** если main красный — приоритет №1 починить, а не писать новый код.

**Что проверяет CI:**
- Компиляция / сборка
- Unit-тесты
- Линтеры и форматтеры
- Статический анализ (SAST)
- Проверка зависимостей (SCA)`,
    },
    {
      title: 'CD: Delivery vs Deployment',
      content: `**Continuous Delivery** — код всегда в состоянии «готов к деплою в прод». Последний шаг (деплой в prod) — **ручной** (кнопка, approval).

**Continuous Deployment** — каждый коммит, прошедший pipeline, **автоматически** попадает в прод без ручного вмешательства.

| | Continuous Delivery | Continuous Deployment |
|---|---|---|
| Деплой в prod | Ручной | Автоматический |
| Риск | Ниже | Выше (нужны сильные тесты) |
| Подходит для | Enterprise, regulated | SaaS, стартапы |
| Требования | Хорошие тесты | Отличные тесты + feature flags |

**Важно:** оба варианта требуют автоматизации всего пути до staging. Разница только в последнем шаге.

Большинство команд начинают с **Continuous Delivery** и переходят к Deployment по мере роста зрелости.`,
    },
    {
      title: 'Анатомия pipeline: этапы',
      content: `Типичный CI/CD pipeline состоит из последовательных и параллельных **стадий (stages)**:

\`\`\`
┌─────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐   ┌────────┐
│  Lint   │ → │  Test   │ → │  Build   │ → │ Security │ → │ Package │ → │ Deploy │
│ Format  │   │  Unit   │   │ Compile  │   │   Scan   │   │  Image  │   │  Env   │
└─────────┘   │ Integr. │   └──────────┘   └──────────┘   └─────────┘   └────────┘
              └─────────┘
\`\`\`

**1. Lint & Format** — стиль кода, статический анализ
**2. Test** — unit → integration → e2e (пирамида тестирования)
**3. Build** — компиляция, сборка артефакта
**4. Security** — SAST, dependency scan, container scan
**5. Package** — Docker-образ, JAR, npm-пакет
**6. Deploy** — выкладка в окружение (dev → staging → prod)

**Принцип fail fast:** дешёвые проверки (lint) — первыми. Дорогие (e2e) — после unit-тестов.

**Параллелизация:** независимые job'ы (lint + unit tests) запускаются одновременно для ускорения.`,
    },
    {
      title: 'Стратегии ветвления: Git Flow',
      content: `**Git Flow** — классическая модель с долгоживущими ветками:

- \`main\` — продакшен-код, только через release
- \`develop\` — интеграционная ветка
- \`feature/*\` — новые фичи от develop
- \`release/*\` — подготовка релиза
- \`hotfix/*\` — срочные исправления от main

**Плюсы:** чёткое разделение, подходит для версионных релизов (v1.0, v2.0).
**Минусы:** сложность, долгоживущие ветки, merge hell.

**CI/CD с Git Flow:**
- CI на каждый push в feature-ветку
- CD в staging при merge в develop
- CD в prod при merge release → main

Подходит для: desktop-приложения, продукты с фиксированным release cycle.`,
    },
    {
      title: 'Стратегии ветвления: Trunk-Based Development',
      content: `**Trunk-Based Development (TBD)** — все разработчики коммитят в одну ветку (\`main\` / \`trunk\`) несколько раз в день.

**Правила TBD:**
- Ветки живут < 1 дня (короткоживущие feature branches допустимы)
- Feature flags скрывают незавершённый код
- main всегда зелёный и deployable

**Плюсы:**
- Минимум merge-конфликтов
- Быстрая интеграция
- Идеально для Continuous Deployment
- Рекомендован Google, Facebook, Netflix

**Минусы:** требует дисциплины, feature flags, сильных тестов.

**CI/CD с TBD:**
- CI на каждый push в main
- CD: автоматический деплой в prod (или через feature flags)

Это **золотой стандарт** для современных DevOps-команд.`,
      code: {
        language: 'bash',
        code: `# Типичный TBD workflow
git checkout main
git pull origin main
git checkout -b fix/login-timeout   # короткая ветка
# ... изменения ...
git push origin fix/login-timeout
# → CI запускается на PR
# → merge в main → CD деплоит в prod`,
        caption: 'Trunk-Based: короткие ветки, быстрый merge',
      },
    },
    {
      title: 'Стратегии ветвления: GitHub Flow',
      content: `**GitHub Flow** — упрощённая модель для веб-приложений и SaaS:

1. \`main\` — всегда deployable
2. Создай feature-ветку от main
3. Коммить, push, открой Pull Request
4. Code review + CI проходит
5. Merge в main → автоматический деплой

**Отличие от Git Flow:** нет ветки develop, нет release-веток. Один поток: feature → main → prod.

**CI/CD mapping:**
| Событие | Pipeline |
|---------|----------|
| Push в feature-ветку | CI (lint, test, build) |
| Pull Request | CI + preview deploy |
| Merge в main | CD (deploy staging → prod) |

GitHub Flow + Trunk-Based — самая популярная комбинация в индустрии.`,
    },
    {
      title: 'Артефакты сборки',
      content: `**Артефакт** — результат сборки, который передаётся между стадиями pipeline и деплоится.

**Типы артефактов:**
| Тип | Пример | Хранилище |
|-----|--------|-----------|
| Docker-образ | \`myapp:1.2.3\` | GHCR, ECR, Docker Hub |
| JAR/WAR | \`app-1.2.3.jar\` | Nexus, Artifactory, S3 |
| npm-пакет | \`@company/lib@1.0.0\` | npm registry, Verdaccio |
| Бинарник | \`app-linux-amd64\` | S3, GitHub Releases |
| Helm chart | \`myapp-1.2.3.tgz\` | ChartMuseum, OCI registry |
| Terraform plan | \`plan.tfplan\` | S3, CI artifacts |

**Принципы работы с артефактами:**
1. **Иммутабельность** — артефакт с тегом \`1.2.3\` никогда не перезаписывается
2. **Версионирование** — тег = git SHA или semver
3. **Один артефакт — все окружения** — один образ деплоится в dev, staging, prod
4. **Промоушн, не пересборка** — staging и prod получают тот же артефакт

\`\`\`
Build once → Test everywhere → Deploy anywhere
\`\`\`

**Антипаттерн:** пересобирать образ для каждого окружения с разными конфигами внутри. Конфигурация — через environment variables / ConfigMaps, не через пересборку.`,
    },
    {
      title: 'Окружения (Environments)',
      content: `**Окружение** — изолированный инстанс приложения с собственной инфраструктурой и конфигурацией.

**Типичная цепочка:**
\`\`\`
dev → staging → production
\`\`\`

| Окружение | Назначение | Данные | Доступ |
|-----------|-----------|--------|--------|
| **dev** | Разработка, эксперименты | Фейковые / seed | Разработчики |
| **staging** | Pre-prod тестирование | Копия prod (анонимизированная) | QA + DevOps |
| **production** | Реальные пользователи | Реальные | Ограниченный |

**Дополнительные окружения:**
- **preview** — временное окружение на каждый PR (ephemeral)
- **canary** — подмножество prod-трафика для новой версии
- **dr** (disaster recovery) — резервная копия prod

**Принципы:**
1. **Паритет окружений** — staging максимально похож на prod (те же сервисы, версии)
2. **Изоляция** — отдельные namespace / VPC / аккаунты
3. **Промоушн артефактов** — один образ проходит все окружения
4. **Конфигурация через переменные** — разница только в env vars / secrets
5. **Infrastructure as Code** — окружения создаются одинаково (Terraform)`,
    },
    {
      title: 'Quality Gates и политики',
      content: `**Quality Gate** — набор критериев, которые pipeline должен пройти, чтобы продолжить.

**Примеры quality gates:**
- Code coverage ≥ 80%
- 0 critical vulnerabilities (SAST/SCA)
- Все unit-тесты зелёные
- Lint без ошибок
- Performance test: p99 < 200ms
- Manual approval для prod

**Branch protection rules (GitHub):**
- Require PR reviews (минимум 1–2)
- Require status checks (CI green)
- Require signed commits
- No direct push to main

**Deployment gates:**
- Автоматический деплой в dev/staging
- Manual approval для production
- Scheduled deploy windows (ночные релизы)
- Canary analysis перед полным rollout

Quality gates превращают «надежду, что всё работает» в **измеримые критерии**.`,
    },
    {
      title: 'Стратегии деплоя',
      content: `**Rolling Update** — постепенная замена старых инстансов новыми. Стандарт K8s Deployment.

**Blue-Green** — два идентичных окружения. Трафик переключается с Blue (текущий) на Green (новый) мгновенно.
- Плюс: мгновенный rollback (переключить обратно)
- Минус: двойные ресурсы

**Canary** — небольшой % трафика (5–10%) направляется на новую версию. При успехе — постепенное увеличение.
- Плюс: минимальный blast radius
- Минус: сложность (нужен service mesh или ingress с weight)

**Recreate** — остановить все старые, запустить новые. Простой, но с downtime.

| Стратегия | Downtime | Rollback | Сложность |
|-----------|----------|----------|-----------|
| Rolling | Нет | Средний | Низкая |
| Blue-Green | Нет | Быстрый | Средняя |
| Canary | Нет | Быстрый | Высокая |
| Recreate | Да | Быстрый | Низкая |

Для Kubernetes: Rolling — default, Canary — через Argo Rollouts или Flagger.`,
    },
    {
      title: 'Pipeline as Code',
      content: `**Pipeline as Code** — описание CI/CD pipeline в файле, хранящемся в репозитории рядом с кодом.

**Преимущества:**
- Версионирование в Git (история изменений pipeline)
- Code review для pipeline (PR на workflow)
- Воспроизводимость — одинаковый pipeline для всех
- Документация — pipeline сам себя описывает

**Форматы:**
| Инструмент | Формат | Файл |
|-----------|--------|------|
| GitHub Actions | YAML | \`.github/workflows/*.yml\` |
| GitLab CI | YAML | \`.gitlab-ci.yml\` |
| Jenkins | Groovy (Jenkinsfile) | \`Jenkinsfile\` |
| ArgoCD | YAML (Application CRD) | Git repo |

**Принцип:** pipeline — часть кодовой базы, не конфигурация в UI CI-сервера.

Изменение pipeline проходит тот же процесс: ветка → PR → review → merge.`,
    },
    {
      title: 'Инструменты CI/CD',
      content: `| Инструмент | Тип | Особенности |
|-----------|-----|-------------|
| **GitHub Actions** | CI/CD | Встроен в GitHub, YAML, marketplace actions |
| **GitLab CI** | CI/CD | Полный DevOps lifecycle, self-hosted runners |
| **Jenkins** | CI/CD | Классика, 2000+ плагинов, self-hosted |
| **CircleCI** | CI | Cloud-first, быстрый старт |
| **ArgoCD** | CD (GitOps) | Декларативный деплой в K8s |
| **Flux** | CD (GitOps) | Альтернатива ArgoCD |
| **Tekton** | CI/CD | Cloud-native pipelines для K8s |
| **Spinnaker** | CD | Multi-cloud deployment |

**Как выбрать:**
- Код на GitHub → **GitHub Actions** (бесплатный tier, zero setup)
- Self-hosted GitLab → **GitLab CI**
- Legacy enterprise → **Jenkins** (но рассмотри миграцию)
- Kubernetes CD → **ArgoCD** или **Flux**

Для обучения и pet-проектов: **GitHub Actions** — оптимальный выбор.`,
    },
    {
      title: 'Метрики DORA',
      content: `**DORA** (DevOps Research and Assessment) — четыре ключевые метрики зрелости DevOps:

**1. Deployment Frequency** — как часто деплоите в prod?
- Elite: несколько раз в день
- Low: раз в месяц или реже

**2. Lead Time for Changes** — время от коммита до prod?
- Elite: < 1 часа
- Low: > 6 месяцев

**3. Change Failure Rate** — % деплоев, вызвавших инцидент?
- Elite: 0–15%
- Low: 46–60%

**4. Mean Time to Recovery (MTTR)** — время восстановления после инцидента?
- Elite: < 1 часа
- Low: > 1 недели

**Как улучшать:**
- Чаще деплоить → меньшие изменения → меньше риск
- CI/CD автоматизация → сокращение lead time
- Мониторинг + rollback → снижение MTTR
- Тесты + canary → снижение failure rate

Измеряй эти метрики и отслеживай прогресс квартал за кварталом.`,
    },
    {
      title: 'Безопасность в pipeline (DevSecOps)',
      content: `**Shift-left security** — встраивание проверок безопасности в CI/CD, а не только перед релизом.

**Стадии безопасности в pipeline:**

1. **Pre-commit** — secret scanning (gitleaks, trufflehog)
2. **CI: SAST** — статический анализ кода (CodeQL, Semgrep, SonarQube)
3. **CI: SCA** — сканирование зависимостей (Dependabot, Snyk, Trivy)
4. **Build: Container scan** — сканирование Docker-образа (Trivy, Grype)
5. **CD: DAST** — динамический анализ (OWASP ZAP)
6. **Runtime** — мониторинг в prod (Falco, runtime security)

**Принципы:**
- Секреты — только в vault/secrets manager, никогда в коде
- Минимальные права для CI/CD runners
- Подпись артефактов (cosign, Sigstore)
- SBOM (Software Bill of Materials) для каждого релиза

Безопасность — не отдельный этап, а **часть каждого этапа** pipeline.`,
    },
    {
      title: 'Антипаттерны CI/CD',
      content: `**1. Долгий pipeline (> 30 мин)**
→ Разработчики перестают ждать. Решение: параллелизация, кэширование, fail fast.

**2. Flaky tests**
→ Pipeline нестабилен, доверие падает. Решение: quarantine, retry с лимитом, починка.

**3. Ручные шаги в «автоматическом» pipeline**
→ Copy-paste конфигов, SSH на сервер. Решение: всё в коде (IaC, GitOps).

**4. Разные артефакты для разных окружений**
→ «На staging работало». Решение: build once, deploy everywhere.

**5. Отсутствие rollback**
→ Паника при инциденте. Решение: автоматический rollback, blue-green.

**6. Секреты в workflow-файлах**
→ Утечка через Git. Решение: secrets manager, OIDC.

**7. Pipeline без тестов**
→ Деплой наудачу. Решение: пирамида тестирования, coverage gates.

**8. «Работает на моей машине» pipeline**
→ CI зелёный, prod красный. Решение: паритет окружений, контейнеризация.`,
    },
    {
      title: 'Проектирование pipeline: чеклист',
      content: `При проектировании CI/CD для проекта ответь на вопросы:

**1. Триггеры:** push, PR, tag, schedule, manual?
**2. Стадии:** lint → test → build → scan → deploy?
**3. Ветвление:** TBD, GitHub Flow, Git Flow?
**4. Окружения:** dev, staging, prod — какие и когда?
**5. Артефакты:** Docker-образ? Версионирование?
**6. Деплой:** rolling, blue-green, canary?
**7. Секреты:** где хранить? OIDC?
**8. Rollback:** автоматический? Как?
**9. Уведомления:** Slack, email при failure?
**10. Время pipeline:** целевое < 10 мин для CI?

**Минимальный pipeline для pet-проекта:**
\`\`\`
PR → lint + unit test
merge main → build image → push registry → deploy staging
tag v* → deploy production (manual approval)
\`\`\`

Начни с минимума и добавляй стадии по мере роста проекта.`,
      code: {
        language: 'yaml',
        code: `# Минимальный pipeline (концептуально)
stages:
  - lint          # 1-2 мин
  - test          # 3-5 мин
  - build         # 2-3 мин
  - deploy-dev    # автоматически
  - deploy-staging # автоматически
  - deploy-prod   # manual approval`,
        caption: 'Рекомендуемая структура стадий',
      },
    },
  ],
  practice: [
    'Нарисуй схему CI/CD pipeline для своего pet-проекта: определи стадии, триггеры и окружения',
    'Сравни Git Flow и Trunk-Based Development: какой подход подходит для твоего проекта и почему',
    'Определи артефакты сборки для своего стека (Docker-образ, JAR, npm-пакет) и где их хранить',
    'Спроектируй цепочку окружений dev → staging → prod: какие сервисы, данные и доступы в каждом',
    'Заполни чеклист проектирования pipeline (10 вопросов из последней секции) для pet-проекта',
    'Опиши quality gates: какой code coverage, какие security scans, нужен ли manual approval для prod',
    'Выбери стратегию деплоя (rolling / blue-green / canary) для своего проекта и обоснуй выбор',
    'Оцени текущие DORA-метрики (или гипотетические) и составь план улучшения на 3 месяца',
  ],
  resources: [
    { title: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions' },
    { title: 'DORA Metrics', url: 'https://dora.dev' },
  ],
}
