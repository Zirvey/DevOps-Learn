import type { Chapter } from '../../../types'

export const gitlabCiChapter: Chapter = {
  id: 'gitlab-ci',
  slug: 'gitlab-ci',
  title: 'GitLab CI/CD: полный курс',
  moduleId: 'cicd',
  order: 2,
  duration: '5–6 часов',
  level: 'intermediate',
  description:
    'Полный курс GitLab CI/CD: .gitlab-ci.yml, stages и jobs, runners (shared, shell, Docker, Kubernetes), variables и secrets, artifacts и cache, rules, environments, Docker build/push, deploy в Kubernetes, include/extends, parent-child и multi-project pipelines, protected branches, сравнение с GitHub Actions',
  sections: [
    {
      title: 'Введение и архитектура GitLab CI',
      content: `**GitLab CI/CD** — встроенная CI/CD-платформа GitLab. Конфигурация pipeline описывается в файле \`.gitlab-ci.yml\` в корне репозитория (или через include).

**Компоненты архитектуры:**
\`\`\`
Git push / MR / schedule
    → GitLab (Coordinator)
    → Pipeline (stages → jobs)
    → Runner (executor: shell / docker / k8s)
    → Artifacts, environments, registry
\`\`\`

**Ключевые сущности:**
| Сущность | Описание |
|----------|----------|
| **Pipeline** | Полный CI/CD-процесс для одного события (push, MR) |
| **Stage** | Логическая группа jobs (build → test → deploy) |
| **Job** | Набор script-команд на одном runner |
| **Runner** | Агент, выполняющий jobs |
| **Artifact** | Файлы между jobs или для скачивания |
| **Environment** | Целевое окружение деплоя (staging, production) |

**Преимущества GitLab CI:**
- Единая платформа: Git + CI/CD + Registry + Kubernetes integration
- Auto DevOps — готовые pipeline из коробки
- Built-in Container Registry и Package Registry
- Merge Request pipelines с review apps
- Self-managed и GitLab.com (SaaS)

**Free tier (GitLab.com):** 400 CI/CD minutes/month (shared runners). Self-hosted runners — без лимита минут на SaaS.`,
    },
    {
      title: '.gitlab-ci.yml: структура и основы',
      content: `Файл \`.gitlab-ci.yml\` — единственный (или главный) источник конфигурации pipeline. Валидируется при коммите (CI Lint в UI: **Build → Pipeline editor → Validate**).

**Минимальная структура:**
\`\`\`
.gitlab-ci.yml
├── default (image, tags, before_script)
├── variables
├── stages (опционально — по умолчанию: build, test, deploy)
├── workflow (rules для всего pipeline)
└── jobs (lint, test, deploy...)
\`\`\`

**Обязательные поля job:** \`script\` — команды для выполнения.

**Частые поля job:**
| Поле | Назначение |
|------|------------|
| \`stage\` | Стадия pipeline |
| \`image\` | Docker-образ для job |
| \`tags\` | Выбор runner по тегам |
| \`before_script\` / \`after_script\` | Хуки до/после script |
| \`rules\` / \`only\` / \`except\` | Условия запуска |
| \`needs\` | DAG-зависимости между jobs |
| \`artifacts\` / \`cache\` | Файлы и кэш |
| \`environment\` | Окружение деплоя |

**Predefined variables:** GitLab автоматически предоставляет \`CI_COMMIT_SHA\`, \`CI_COMMIT_REF_NAME\`, \`CI_PROJECT_PATH\`, \`CI_PIPELINE_ID\` и десятки других.`,
      code: {
        language: 'yaml',
        code: `# .gitlab-ci.yml — минимальный pipeline

stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "20"

default:
  image: node:\${NODE_VERSION}
  before_script:
    - npm ci

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

test:
  stage: test
  script:
    - npm run lint
    - npm test

deploy:
  stage: deploy
  script:
    - echo "Deploying \${CI_COMMIT_SHA} to production"
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual`,
        caption: 'Базовый pipeline: build → test → deploy',
      },
    },
    {
      title: 'Stages, Jobs и needs',
      content: `**Stages** определяют порядок выполнения. Jobs внутри одной stage выполняются **параллельно**. Следующая stage начинается только когда **все** jobs текущей stage успешно завершились.

**По умолчанию** GitLab использует stages: \`build\`, \`test\`, \`deploy\`. Если job не указал stage — попадает в \`test\`.

**DAG (Directed Acyclic Graph)** — \`needs\` позволяет job начать до завершения всей stage:
\`\`\`
stage: test
├── unit-test (parallel)
├── integration-test (parallel)
└── e2e-test (needs: unit-test)  ← начнёт после unit-test, не ждёт integration
\`\`\`

**needs vs stage:**
- Без \`needs\` — job ждёт завершения **всех** jobs предыдущих stages
- С \`needs\` — job ждёт только указанные jobs (может начать раньше)
- \`needs: []\` — job не ждёт других jobs (полезно для первого job в DAG)

**parallel** — несколько экземпляров одного job:
\`\`\`yaml
test:
  parallel: 3   # test 1/3, test 2/3, test 3/3
\`\`\`

**resource_group** — mutex для jobs (один deploy в production at a time).`,
      code: {
        language: 'yaml',
        code: `stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths: [dist/]

unit-test:
  stage: test
  script:
    - npm run test:unit

integration-test:
  stage: test
  script:
    - npm run test:integration

e2e-test:
  stage: test
  needs:
    - job: unit-test
      artifacts: false
  script:
    - npm run test:e2e

deploy:
  stage: deploy
  needs:
    - job: build
      artifacts: true
    - job: e2e-test
      artifacts: false
  script:
    - ./deploy.sh
  resource_group: production`,
        caption: 'DAG с needs: e2e не ждёт integration-test',
      },
    },
    {
      title: 'Runners: типы и executors',
      content: `**Runner** — агент, который выполняет jobs. GitLab Coordinator назначает jobs на runners по тегам и доступности.

**Типы runners:**
| Тип | Описание |
|-----|----------|
| **Shared** | GitLab.com shared runners (saas) — \`gitlab-org\` |
| **Group** | Для всех проектов группы |
| **Project-specific** | Только для одного проекта |
| **Instance** | Для всего self-managed instance |

**Executors (как runner выполняет job):**
| Executor | Описание |
|----------|----------|
| **shell** | Команды прямо на хосте runner |
| **docker** | Job в Docker-контейнере (самый частый) |
| **kubernetes** | Pod в K8s-кластере |
| **docker+machine** | Auto-scaling через Docker Machine |
| **ssh** | Выполнение на remote host по SSH |

**Выбор runner через tags:**
\`\`\`yaml
deploy:
  tags:
    - docker
    - production
\`\`\`

Runner должен иметь **все** указанные tags.

**Регистрация self-hosted runner:**
\`\`\`bash
gitlab-runner register \\
  --url https://gitlab.com \\
  --token <RUNNER_TOKEN> \\
  --executor docker \\
  --docker-image alpine:latest \\
  --tag-list "docker,linux"
\`\`\`

**Kubernetes executor** — runner создаёт pod для каждого job. Идеально для больших кластеров и изоляции.`,
      code: {
        language: 'yaml',
        code: `# Job на shared runner (GitLab.com)
lint:
  image: node:20-alpine
  script:
    - npm run lint

# Job на self-hosted runner с тегами
deploy-on-prem:
  tags:
    - on-prem
    - shell
  script:
    - rsync -av dist/ /var/www/app/

# Kubernetes executor (runner config.toml)
# [runners.kubernetes]
#   namespace = "gitlab-runner"
#   image = "alpine:latest"

k8s-job:
  tags:
    - kubernetes
  image: bitnami/kubectl:latest
  script:
    - kubectl get nodes`,
        caption: 'Разные runners: shared, on-prem, kubernetes',
      },
    },
    {
      title: 'Variables, secrets и CI/CD variables',
      content: `GitLab предоставляет **три уровня** переменных (приоритет: job > project > group > instance):

**1. Predefined CI variables** — автоматически: \`CI_COMMIT_SHA\`, \`CI_JOB_ID\`, \`GITLAB_USER_LOGIN\`.

**2. Project/Group CI/CD Variables** — Settings → CI/CD → Variables:
- **Masked** — скрыты в логах
- **Protected** — доступны только в protected branches/tags
- **Environment scope** — только для конкретного environment

**3. Variables в .gitlab-ci.yml:**
\`\`\`yaml
variables:
  APP_NAME: myapp
  DOCKER_IMAGE: registry.gitlab.com/$CI_PROJECT_PATH
\`\`\`

**Секреты** — никогда в Git! Используй CI/CD Variables (masked) или External Secrets.

**Файловые переменные** — тип \`File\`: значение сохраняется во временный файл (kubeconfig, SSH key).

**Передача между jobs** — через \`artifacts:reports\` или dotenv artifact:
\`\`\`yaml
generate-version:
  script:
    - echo "VERSION=1.2.3" >> build.env
  artifacts:
    reports:
      dotenv: build.env
\`\`\`

**Vault integration** (GitLab 16+): секреты из HashiCorp Vault без хранения в GitLab.`,
      code: {
        language: 'yaml',
        code: `variables:
  DOCKER_REGISTRY: registry.gitlab.com
  IMAGE_NAME: $CI_REGISTRY_IMAGE

build:
  variables:
  script:
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHA .
    - docker push $IMAGE_NAME:$CI_COMMIT_SHA

deploy:
  environment: production
  variables:
    KUBECONFIG: /tmp/kubeconfig
  before_script:
    - echo "$KUBE_CONFIG" > /tmp/kubeconfig
  script:
    - kubectl set image deployment/app app=$IMAGE_NAME:$CI_COMMIT_SHA
  # KUBE_CONFIG — masked File variable в Settings → CI/CD`,
        caption: 'Variables и секрет через CI/CD Variables (File type)',
      },
    },
    {
      title: 'Artifacts и Cache',
      content: `**Artifacts** — файлы, сохраняемые после job и доступные в downstream jobs или для скачивания из UI.

**Типичное использование:**
- Передача build output (dist/, .jar) между jobs
- Test reports (JUnit, coverage)
- dotenv reports для переменных

**Параметры artifacts:**
| Параметр | Описание |
|----------|----------|
| \`paths\` | Файлы для сохранения |
| \`expire_in\` | TTL (1 hour, 1 week, never) |
| \`reports\` | junit, coverage, dotenv, terraform |
| \`when\` | on_success, on_failure, always |

**Cache** — ускорение pipeline через сохранение зависимостей между runs:
- Кэш **не гарантирован** (может быть очищен)
- Ключ \`key\` определяет идентификатор кэша
- \`policy: pull-push\` / \`pull\` / \`push\`

**Artifacts vs Cache:**
| | Artifacts | Cache |
|---|-----------|-------|
| Надёжность | Гарантированы до expire | Best-effort |
| Между jobs | Да (needs/download) | Да |
| Скачивание из UI | Да | Нет |
| Use case | Build output, reports | node_modules, .gradle |

**Dependency Proxy** — кэширование Docker images и packages на уровне GitLab.`,
      code: {
        language: 'yaml',
        code: `build:
  stage: build
  script:
    - npm ci
    - npm run build
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
    policy: pull-push
  artifacts:
    paths:
      - dist/
    expire_in: 1 day
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

test:
  stage: test
  needs:
    - job: build
      artifacts: true
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
    policy: pull
  script:
    - npm test`,
        caption: 'Cache для node_modules + artifacts dist/ и reports',
      },
    },
    {
      title: 'rules, only и except',
      content: `**rules** — современный способ условного запуска jobs (рекомендуется). Заменяет legacy \`only\`/\`except\`.

**rules** оцениваются сверху вниз, первое совпадение определяет поведение:
\`\`\`yaml
rules:
  - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    when: never          # не запускать на MR
  - if: $CI_COMMIT_BRANCH == "main"
    when: on_success
  - when: manual
\`\`\`

**Частые условия:**
| Выражение | Когда |
|-----------|-------|
| \`$CI_COMMIT_BRANCH == "main"\` | Push в main |
| \`$CI_PIPELINE_SOURCE == "merge_request_event"\` | MR pipeline |
| \`$CI_COMMIT_TAG\` | Push тега |
| \`$CI_COMMIT_BRANCH =~ /^release/\` | Regex на branch |

**workflow:rules** — условия для **всего pipeline** (не создавать pipeline вообще):
\`\`\`yaml
workflow:
  rules:
    - if: $CI_COMMIT_MESSAGE =~ /\\[skip ci\\]/
      when: never
    - when: always
\`\`\`

**only/except (legacy)** — всё ещё работает, но rules гибче:
\`\`\`yaml
deploy:
  only:
    - main
    - tags
  except:
    - schedules
\`\`\`

**changes** — запуск только при изменении файлов (в rules):
\`\`\`yaml
rules:
  - changes:
      - src/**/*
      - package.json
\`\`\``,
      code: {
        language: 'yaml',
        code: `workflow:
  rules:
    - if: $CI_COMMIT_MESSAGE =~ /\\[skip ci\\]/
      when: never
    - when: always

lint:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH

deploy-staging:
  stage: deploy
  environment: staging
  script:
    - ./deploy.sh staging
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

deploy-production:
  stage: deploy
  environment: production
  script:
    - ./deploy.sh production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
      allow_failure: false
  resource_group: production`,
        caption: 'workflow:rules + rules для staging и manual production',
      },
    },
    {
      title: 'Environments и Deployments',
      content: `**Environment** — логическое окружение деплоя (staging, production, review/*).

**Создание:** автоматически при первом job с \`environment:\`. Или вручную: **Operate → Environments**.

**Ключевые возможности:**
- **Deployment history** — кто, когда, какой commit задеплоил
- **Rollback** — redeploy предыдущего deployment из UI
- **Protected environments** — только определённые roles могут deploy
- **Stop environment** — on_stop job для teardown (review apps)
- **Environment URL** — ссылка в MR и deployments page

**Review Apps** — временные окружения для каждого MR:
\`\`\`yaml
review:
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    url: https://$CI_ENVIRONMENT_SLUG.example.com
    on_stop: stop_review
    auto_stop_in: 1 week
\`\`\`

**deployment_tier** — production, staging, development, testing, other (для DORA metrics).

**Protected environments:** Settings → CI/CD → Protected environments → указать roles и branches.`,
      code: {
        language: 'yaml',
        code: `deploy-staging:
  stage: deploy
  environment:
    name: staging
    url: https://staging.example.com
    deployment_tier: staging
  script:
    - helm upgrade --install myapp ./chart
      --namespace staging
      --set image.tag=$CI_COMMIT_SHA
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

deploy-production:
  stage: deploy
  environment:
    name: production
    url: https://example.com
    deployment_tier: production
  script:
    - helm upgrade --install myapp ./chart
      --namespace production
      --set image.tag=$CI_COMMIT_SHA
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual

review-app:
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    url: https://$CI_ENVIRONMENT_SLUG.review.example.com
    on_stop: stop-review
    auto_stop_in: 3 days
  script:
    - ./deploy-review.sh
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

stop-review:
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    action: stop
  script:
    - ./teardown-review.sh
  when: manual`,
        caption: 'Staging, production (manual) и review apps',
      },
    },
    {
      title: 'Docker: build и push в Registry',
      content: `GitLab включает **Container Registry** — \`registry.gitlab.com/<group>/<project>\`.

**Аутентификация в registry:**
- \`CI_REGISTRY_USER\` / \`CI_REGISTRY_PASSWORD\` — predefined variables
- Или \`CI_JOB_TOKEN\` для push в registry того же project

**Паттерн build + push:**
1. \`docker login\` с CI credentials
2. \`docker build\` с тегами (SHA, branch, semver)
3. \`docker push\`

**Docker-in-Docker (dind)** — для сборки images в Docker executor:
\`\`\`yaml
image: docker:24
services:
  - docker:24-dind
variables:
  DOCKER_TLS_CERTDIR: "/certs"
\`\`\`

**Kaniko** — альтернатива dind, не требует privileged mode (безопаснее в K8s).

**Dependency Proxy** — кэширует base images, ускоряет pull.

**GitLab CI/CD Components** — reusable pipeline components из catalog.`,
      code: {
        language: 'yaml',
        code: `build-image:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - |
      docker build \
        -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA \
        -t $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG \
        .
    - docker push $CI_REGISTRY_IMAGE --all-tags
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_TAG

# Kaniko (без privileged)
build-kaniko:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  script:
    - |
      /kaniko/executor \
        --context $CI_PROJECT_DIR \
        --dockerfile Dockerfile \
        --destination $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA`,
        caption: 'Docker-in-Docker и Kaniko build + push',
      },
    },
    {
      title: 'include, extends и шаблоны',
      content: `**include** — подключение внешних YAML-файлов (DRY, централизация):
\`\`\`yaml
include:
  - local: '/templates/.gitlab-ci-docker.yml'
  - project: 'mygroup/ci-templates'
    file: '/templates/test.yml'
    ref: main
  - remote: 'https://example.com/ci-template.yml'
  - component: gitlab.com/components/docker/build@1.0.0
\`\`\`

**extends** — наследование конфигурации job (аналог YAML anchor, но явный):
\`\`\`yaml
.deploy_template:
  stage: deploy
  image: bitnami/kubectl:latest
  before_script:
    - kubectl config use-context $KUBE_CONTEXT

deploy-staging:
  extends: .deploy_template
  environment: staging
  script:
    - kubectl apply -f k8s/
\`\`\`

**hidden jobs** — имена с точкой (\`.template\`) не создают job, только шаблон.

**YAML anchors** — альтернатива extends:
\`\`\`yaml
.retry: &retry
  retry:
    max: 2
    when: runner_system_failure

job1:
  <<: *retry
\`\`\`

**CI/CD Catalog** — публикация и использование components как пакетов pipeline.`,
      code: {
        language: 'yaml',
        code: `include:
  - local: .gitlab/ci/templates.yml
  - project: 'devops/ci-templates'
    file: '/kubernetes/deploy.yml'
    ref: v2.1.0

# .gitlab/ci/templates.yml
.test_template:
  image: node:20
  before_script:
    - npm ci
  cache:
    key:
      files: [package-lock.json]
    paths: [node_modules/]

unit-test:
  extends: .test_template
  stage: test
  script:
    - npm run test:unit

lint:
  extends: .test_template
  stage: test
  script:
    - npm run lint

deploy-k8s:
  extends: .k8s_deploy  # из include project
  variables:
    KUBE_NAMESPACE: production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual`,
        caption: 'include + extends для reusable templates',
      },
    },
    {
      title: 'Parent-child и multi-project pipelines',
      content: `**Parent-child pipelines** — trigger job запускает **child pipeline** в том же проекте с отдельным YAML.

**Зачем:**
- Разбить монолитный pipeline на части
- Разные trigger rules для разных конфигов
- Matrix/generate через child pipelines

\`\`\`yaml
generate-pipeline:
  stage: prepare
  trigger:
    include: .gitlab/ci/child-pipeline.yml
    strategy: depend   # parent ждёт child
\`\`\`

**Multi-project pipelines** — trigger pipeline в **другом** проекте:
\`\`\`yaml
trigger-downstream:
  trigger:
    project: mygroup/deploy-configs
    branch: main
    strategy: depend
\`\`\`

**bridge jobs** — trigger jobs отображаются как bridge в pipeline graph.

**CI/CD job token** — \`CI_JOB_TOKEN\` для аутентификации между projects (с scope limits).

**Downstream pipeline variables:**
\`\`\`yaml
trigger:
  project: other/project
  forward:
    pipeline_variables: true
  variables:
    UPSTREAM_SHA: $CI_COMMIT_SHA
\`\`\`

**vs GitHub Actions:** GitLab child/multi-project — нативные trigger jobs; GHA — \`workflow_call\` или repository_dispatch.`,
    },
    {
      title: 'Deploy в Kubernetes',
      content: `Типичные подходы деплоя в K8s из GitLab CI:

**1. kubectl / helm из CI (push model):**
- Runner с kubeconfig (CI variable File type)
- \`helm upgrade --install\` или \`kubectl apply\`

**2. GitLab Agent for Kubernetes (agentk):**
- Агент в кластере, pull-модель
- CI job подключается через \`kubectl\` context без kubeconfig на runner
- Безопаснее: нет credentials кластера на runner

**3. GitOps (ArgoCD/Flux):**
- CI только обновляет image tag в Git
- ArgoCD синхронизирует кластер

**Auto Deploy:**
\`\`\`yaml
deploy:
  environment: production
  script:
    - kubectl set image deployment/myapp
        app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
        -n production
    - kubectl rollout status deployment/myapp -n production
\`\`\`

**GitLab Environments + K8s:** GitLab может отслеживать deployments и показывать pod status в Environments UI (через agent).`,
      code: {
        language: 'yaml',
        code: `deploy-k8s:
  stage: deploy
  image: bitnami/kubectl:latest
  environment:
    name: production
    kubernetes:
      namespace: production
  before_script:
    - echo "$KUBECONFIG_CONTENT" | base64 -d > kubeconfig
    - export KUBECONFIG=kubeconfig
  script:
    - |
      kubectl set image deployment/myapp \
        myapp=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA \
        --namespace=production
    - |
      kubectl rollout status deployment/myapp \
        --namespace=production --timeout=300s
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual

# GitOps: обновить tag в manifests repo
update-gitops:
  stage: deploy
  image: alpine/git:latest
  script:
    - git clone https://gitlab.com/org/k8s-manifests.git
    - cd k8s-manifests/apps/myapp/overlays/production
    - kustomize edit set image myapp=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - git commit -am "deploy: $CI_COMMIT_SHA"
    - git push`,
        caption: 'kubectl deploy и GitOps update tag',
      },
    },
    {
      title: 'Protected branches и pipeline security',
      content: `**Protected branches** — ограничения на push/merge и CI:

Settings → Repository → Protected branches:
- **Allowed to merge** / **Allowed to push**
- **Allowed to deploy** — кто может deploy в protected environments

**Protected CI variables** — variables с флагом Protected доступны только в pipelines на protected branches/tags.

**Merge Request pipelines:**
- **Merged results pipeline** — тест на merge commit
- **Merge train** — серия MR тестируются вместе перед merge

**Pipeline security:**
- **CI_JOB_TOKEN** scope — ограничить доступ downstream projects
- **Secured CI/CD variables** — masked + protected
- **SAST/DAST** — встроенные security scanners (GitLab Ultimate или open templates)
- **Compliance pipelines** — enforced CI config для группы

**Fork MR security:** secrets не доступны в pipelines из fork (аналогично GitHub Actions).

**Approval rules:** required approvals перед merge → pipeline must pass.`,
    },
    {
      title: 'GitLab CI vs GitHub Actions',
      content: `| Аспект | GitLab CI | GitHub Actions |
|--------|-----------|----------------|
| Конфиг | \`.gitlab-ci.yml\` (один файл + include) | \`.github/workflows/*.yml\` (множество) |
| Организация | stages → jobs | workflows → jobs → steps |
| Reusable | extends, include, components | reusable workflows, composite actions |
| Runners | Self-hosted + GitLab shared | Self-hosted + GitHub-hosted |
| Registry | Built-in Container Registry | GHCR (отдельный сервис) |
| Environments | Environments + review apps | Environments + protection rules |
| DAG | \`needs\` | \`needs\` |
| Matrix | \`parallel:matrix\` | \`strategy.matrix\` |
| Child pipelines | trigger + include | \`workflow_call\` |
| Marketplace | CI/CD Catalog / templates | Actions Marketplace (20k+) |
| K8s integration | Agent for Kubernetes | Нет native (kubectl/helm) |
| Free tier | 400 min/month (SaaS) | 2000 min/month (private) |

**Когда GitLab CI:**
- Уже на GitLab (single platform)
- Нужен built-in registry + packages
- Review apps из коробки
- Self-managed с полным контролем

**Когда GitHub Actions:**
- Экосистема GitHub (GHCR, Packages, Codespaces)
- Marketplace actions
- Open source на GitHub

**Миграция:** концепции схожи — stages/jobs ≈ workflows/jobs, \`script\` ≈ \`run\`, \`rules\` ≈ \`if\`.`,
    },
    {
      title: 'Troubleshooting failed pipelines',
      content: `**Диагностика failed pipeline:**

**1. Job logs** — CI/CD → Pipelines → Job → полный лог. Ищи последнюю failed команду.

**2. CI Lint** — Build → Pipeline editor → Validate. Проверяет YAML до коммита.

**3. Common failures:**

| Проблема | Решение |
|----------|---------|
| \`script\` required | Добавить script в job |
| Runner not found | Проверить tags, runner online |
| Permission denied (registry) | CI_REGISTRY credentials, job token scope |
| dind connection refused | DOCKER_TLS_CERTDIR, privileged mode |
| Cache miss every run | Проверить key, paths |
| Job stuck | Runner disk/memory, timeout |
| Masked variable empty | Protected variable + unprotected branch |

**4. Debug techniques:**
\`\`\`yaml
debug:
  script:
    - env | sort          # все variables (masked скрыты)
    - docker info
    - kubectl config view
\`\`\`

**5. retry** — автоматический retry при infrastructure failures:
\`\`\`yaml
retry:
  max: 2
  when:
    - runner_system_failure
    - stuck_or_timeout_failure
\`\`\`

**6. CI/CD Analytics** — DORA metrics, pipeline duration trends.

**7. gitlab-runner verify** и \`gitlab-runner list\` на self-hosted.

**8. Minimal pipeline** для изоляции проблемы — убрать jobs, оставить один failing job.`,
      code: {
        language: 'bash',
        code: `# Локальная валидация .gitlab-ci.yml
# (через GitLab API или UI CI Lint)

# Проверка runner на self-hosted
gitlab-runner verify
gitlab-runner list

# Логи runner (systemd)
journalctl -u gitlab-runner -f

# Тест docker executor
docker run --rm -it gitlab/gitlab-runner exec docker \\
  --docker-image alpine:latest \\
  --shell bash

# Проверка registry auth
echo $CI_REGISTRY_PASSWORD | docker login \\
  -u $CI_REGISTRY_USER \\
  --password-stdin $CI_REGISTRY`,
        caption: 'Команды для диагностики runner и registry',
      },
    },
  ],
  practice: [
    'Создай .gitlab-ci.yml с stages build, test, deploy для pet-проекта на GitLab.com',
    'Настрой needs: unit-test → e2e-test без ожидания integration-test',
    'Зарегистрируй self-hosted runner (docker executor) и назначь job через tags',
    'Добавь masked CI/CD variable и используй для deploy (SSH key или kubeconfig)',
    'Настрой cache для npm/pip и artifacts для dist/ между jobs',
    'Реализуй rules: auto deploy на develop, manual deploy на main',
    'Создай review app environment с on_stop job для MR pipelines',
    'Собери Docker image и push в GitLab Container Registry',
    'Вынеси общие шаблоны в include/extends или отдельный ci-templates project',
    'Настрой child pipeline или multi-project trigger для deploy-configs repo',
  ],
  resources: [
    { title: 'GitLab CI/CD Docs', url: 'https://docs.gitlab.com/ee/ci/' },
    { title: 'GitLab CI YAML Reference', url: 'https://docs.gitlab.com/ee/ci/yaml/' },
    { title: 'GitLab Runner Docs', url: 'https://docs.gitlab.com/runner/' },
    { title: 'GitLab Container Registry', url: 'https://docs.gitlab.com/ee/user/packages/container_registry/' },
    { title: 'CI/CD Catalog', url: 'https://docs.gitlab.com/ee/ci/components/' },
    { title: 'GitLab vs GitHub Actions', url: 'https://docs.gitlab.com/ee/ci/migration/github_actions/' },
  ],
}
