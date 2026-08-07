import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'GitLab CI/CD: The Complete Course',
  duration: '5–6 hours',
  description:
    'Full GitLab CI/CD course: .gitlab-ci.yml, stages and jobs, runners (shared, shell, Docker, Kubernetes), variables and secrets, artifacts and cache, rules, environments, Docker build/push, Kubernetes deploy, include/extends, parent-child and multi-project pipelines, protected branches, comparison with GitHub Actions',
  sections: [
    {
      title: 'Introduction and GitLab CI Architecture',
      content:
        '**GitLab CI/CD** is GitLab\'s built-in CI/CD platform. Pipeline configuration is described in `.gitlab-ci.yml` at the repository root (or via include).\n\n**Architecture components:**\n\n```\nGit push / MR / schedule\n    → GitLab (Coordinator)\n    → Pipeline (stages → jobs)\n    → Runner (executor: shell / docker / k8s)\n    → Artifacts, environments, registry\n```\n\n**Key entities:**\n| Entity | Description |\n|--------|-------------|\n| **Pipeline** | Full CI/CD process for one event (push, MR) |\n| **Stage** | Logical group of jobs (build → test → deploy) |\n| **Job** | Set of script commands on one runner |\n| **Runner** | Agent that executes jobs |\n| **Artifact** | Files between jobs or for download |\n| **Environment** | Target deployment environment (staging, production) |\n\n**GitLab CI advantages:**\n- Single platform: Git + CI/CD + Registry + Kubernetes integration\n- Auto DevOps — ready-made pipelines out of the box\n- Built-in Container Registry and Package Registry\n- Merge Request pipelines with review apps\n- Self-managed and GitLab.com (SaaS)\n\n**Free tier (GitLab.com):** 400 CI/CD minutes/month (shared runners). Self-hosted runners — no SaaS minute limit.',
    },
    {
      title: '.gitlab-ci.yml: Structure and Basics',
      content:
        'The `.gitlab-ci.yml` file is the single (or main) source of pipeline configuration. Validated on commit (CI Lint in UI: **Build → Pipeline editor → Validate**).\n\n**Minimal structure:**\n\n```\n.gitlab-ci.yml\n├── default (image, tags, before_script)\n├── variables\n├── stages (optional — default: build, test, deploy)\n├── workflow (rules for entire pipeline)\n└── jobs (lint, test, deploy...)\n```\n\n**Required job field:** `script` — commands to execute.\n\n**Common job fields:**\n| Field | Purpose |\n|-------|---------|\n| `stage` | Pipeline stage |\n| `image` | Docker image for job |\n| `tags` | Runner selection by tags |\n| `before_script` / `after_script` | Hooks before/after script |\n| `rules` / `only` / `except` | Run conditions |\n| `needs` | DAG dependencies between jobs |\n| `artifacts` / `cache` | Files and cache |\n| `environment` | Deployment environment |\n\n**Predefined variables:** GitLab automatically provides `CI_COMMIT_SHA`, `CI_COMMIT_REF_NAME`, `CI_PROJECT_PATH`, `CI_PIPELINE_ID`, and dozens more.',
      code: {
        language: 'yaml',
        code: `# .gitlab-ci.yml — minimal pipeline

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
        caption: 'Basic pipeline: build → test → deploy',
      },
    },
    {
      title: 'Stages, Jobs, and needs',
      content:
        '**Stages** define execution order. Jobs within one stage run **in parallel**. The next stage starts only when **all** jobs in the current stage complete successfully.\n\n**By default** GitLab uses stages: `build`, `test`, `deploy`. If a job has no stage — it lands in `test`.\n\n**DAG (Directed Acyclic Graph)** — `needs` lets a job start before the entire stage finishes:\n\n```\nstage: test\n├── unit-test (parallel)\n├── integration-test (parallel)\n└── e2e-test (needs: unit-test)  ← starts after unit-test, does not wait for integration\n```\n\n**needs vs stage:**\n- Without `needs` — job waits for **all** jobs in previous stages\n- With `needs` — job waits only for specified jobs (can start earlier)\n- `needs: []` — job does not wait for other jobs (useful for first job in DAG)\n\n**parallel** — multiple instances of one job:\n\n```yaml\ntest:\n  parallel: 3   # test 1/3, test 2/3, test 3/3\n```\n\n**resource_group** — mutex for jobs (one deploy to production at a time).',
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
        caption: 'DAG with needs: e2e does not wait for integration-test',
      },
    },
    {
      title: 'Runners: Types and Executors',
      content:
        'A **Runner** is the agent that executes jobs. The GitLab Coordinator assigns jobs to runners by tags and availability.\n\n**Runner types:**\n| Type | Description |\n|------|-------------|\n| **Shared** | GitLab.com shared runners (SaaS) |\n| **Group** | For all projects in a group |\n| **Project-specific** | Only for one project |\n| **Instance** | For entire self-managed instance |\n\n**Executors (how runner runs job):**\n| Executor | Description |\n|----------|-------------|\n| **shell** | Commands directly on runner host |\n| **docker** | Job in Docker container (most common) |\n| **kubernetes** | Pod in K8s cluster |\n| **docker+machine** | Auto-scaling via Docker Machine |\n| **ssh** | Execution on remote host via SSH |\n\n**Runner selection via tags:**\n\n```yaml\ndeploy:\n  tags:\n    - docker\n    - production\n```\n\nRunner must have **all** specified tags.\n\n**Self-hosted runner registration:**\n\n```bash\ngitlab-runner register \\\n  --url https://gitlab.com \\\n  --token <RUNNER_TOKEN> \\\n  --executor docker \\\n  --docker-image alpine:latest \\\n  --tag-list "docker,linux"\n```\n\n**Kubernetes executor** — runner creates a pod for each job. Ideal for large clusters and isolation.',
      code: {
        language: 'yaml',
        code: `# Job on shared runner (GitLab.com)
lint:
  image: node:20-alpine
  script:
    - npm run lint

# Job on self-hosted runner with tags
deploy-on-prem:
  tags:
    - on-prem
    - shell
  script:
    - rsync -av dist/ /var/www/app/

k8s-job:
  tags:
    - kubernetes
  image: bitnami/kubectl:latest
  script:
    - kubectl get nodes`,
        caption: 'Different runners: shared, on-prem, kubernetes',
      },
    },
    {
      title: 'Variables, Secrets, and CI/CD Variables',
      content:
        'GitLab provides **three levels** of variables (priority: job > project > group > instance):\n\n**1. Predefined CI variables** — automatic: `CI_COMMIT_SHA`, `CI_JOB_ID`, `GITLAB_USER_LOGIN`.\n\n**2. Project/Group CI/CD Variables** — Settings → CI/CD → Variables:\n- **Masked** — hidden in logs\n- **Protected** — available only on protected branches/tags\n- **Environment scope** — only for specific environment\n\n**3. Variables in .gitlab-ci.yml:**\n\n```yaml\nvariables:\n  APP_NAME: myapp\n  DOCKER_IMAGE: registry.gitlab.com/$CI_PROJECT_PATH\n```\n\n**Secrets** — never in Git! Use CI/CD Variables (masked) or External Secrets.\n\n**File variables** — type `File`: value saved to a temp file (kubeconfig, SSH key).\n\n**Passing between jobs** — via `artifacts:reports` or dotenv artifact:\n\n```yaml\ngenerate-version:\n  script:\n    - echo "VERSION=1.2.3" >> build.env\n  artifacts:\n    reports:\n      dotenv: build.env\n```\n\n**Vault integration** (GitLab 16+): secrets from HashiCorp Vault without storing in GitLab.',
      code: {
        language: 'yaml',
        code: `variables:
  DOCKER_REGISTRY: registry.gitlab.com
  IMAGE_NAME: $CI_REGISTRY_IMAGE

build:
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
  # KUBE_CONFIG — masked File variable in Settings → CI/CD`,
        caption: 'Variables and secret via CI/CD Variables (File type)',
      },
    },
    {
      title: 'Artifacts and Cache',
      content:
        '**Artifacts** — files saved after a job and available in downstream jobs or for download from UI.\n\n**Typical uses:**\n- Passing build output (dist/, .jar) between jobs\n- Test reports (JUnit, coverage)\n- dotenv reports for variables\n\n**Artifact parameters:**\n| Parameter | Description |\n|-----------|-------------|\n| `paths` | Files to save |\n| `expire_in` | TTL (1 hour, 1 week, never) |\n| `reports` | junit, coverage, dotenv, terraform |\n| `when` | on_success, on_failure, always |\n\n**Cache** — speeds up pipeline by saving dependencies between runs:\n- Cache is **not guaranteed** (may be cleared)\n- `key` defines cache identifier\n- `policy: pull-push` / `pull` / `push`\n\n**Artifacts vs Cache:**\n| | Artifacts | Cache |\n|---|-----------|-------|\n| Reliability | Guaranteed until expire | Best-effort |\n| Between jobs | Yes (needs/download) | Yes |\n| UI download | Yes | No |\n| Use case | Build output, reports | node_modules, .gradle |\n\n**Dependency Proxy** — caches Docker images and packages at GitLab level.',
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
        caption: 'Cache for node_modules + artifacts dist/ and reports',
      },
    },
    {
      title: 'rules, only, and except',
      content:
        '**rules** — modern way to conditionally run jobs (recommended). Replaces legacy `only`/`except`.\n\n**rules** are evaluated top to bottom; first match determines behavior:\n\n```yaml\nrules:\n  - if: $CI_PIPELINE_SOURCE == "merge_request_event"\n    when: never          # do not run on MR\n  - if: $CI_COMMIT_BRANCH == "main"\n    when: on_success\n  - when: manual\n```\n\n**Common conditions:**\n| Expression | When |\n|------------|------|\n| `$CI_COMMIT_BRANCH == "main"` | Push to main |\n| `$CI_PIPELINE_SOURCE == "merge_request_event"` | MR pipeline |\n| `$CI_COMMIT_TAG` | Tag push |\n| `$CI_COMMIT_BRANCH =~ /^release/` | Regex on branch |\n\n**workflow:rules** — conditions for the **entire pipeline** (do not create pipeline at all):\n\n```yaml\nworkflow:\n  rules:\n    - if: $CI_COMMIT_MESSAGE =~ /\\[skip ci\\]/\n      when: never\n    - when: always\n```\n\n**only/except (legacy)** — still works, but rules are more flexible.\n\n**changes** — run only when files change (in rules):\n\n```yaml\nrules:\n  - changes:\n      - src/**/*\n      - package.json\n```',
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
        caption: 'workflow:rules + rules for staging and manual production',
      },
    },
    {
      title: 'Environments and Deployments',
      content:
        'An **Environment** is a logical deployment target (staging, production, review/*).\n\n**Creation:** automatically on first job with `environment:`. Or manually: **Operate → Environments**.\n\n**Key features:**\n- **Deployment history** — who, when, which commit deployed\n- **Rollback** — redeploy previous deployment from UI\n- **Protected environments** — only certain roles can deploy\n- **Stop environment** — on_stop job for teardown (review apps)\n- **Environment URL** — link in MR and deployments page\n\n**Review Apps** — temporary environments for each MR:\n\n```yaml\nreview:\n  environment:\n    name: review/$CI_COMMIT_REF_SLUG\n    url: https://$CI_ENVIRONMENT_SLUG.example.com\n    on_stop: stop_review\n    auto_stop_in: 1 week\n```\n\n**deployment_tier** — production, staging, development, testing, other (for DORA metrics).\n\n**Protected environments:** Settings → CI/CD → Protected environments → specify roles and branches.',
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
        caption: 'Staging, production (manual), and review apps',
      },
    },
    {
      title: 'Docker: Build and Push to Registry',
      content:
        'GitLab includes a **Container Registry** — `registry.gitlab.com/<group>/<project>`.\n\n**Registry authentication:**\n- `CI_REGISTRY_USER` / `CI_REGISTRY_PASSWORD` — predefined variables\n- Or `CI_JOB_TOKEN` for push to the same project registry\n\n**Build + push pattern:**\n1. `docker login` with CI credentials\n2. `docker build` with tags (SHA, branch, semver)\n3. `docker push`\n\n**Docker-in-Docker (dind)** — for building images in Docker executor:\n\n```yaml\nimage: docker:24\nservices:\n  - docker:24-dind\nvariables:\n  DOCKER_TLS_CERTDIR: "/certs"\n```\n\n**Kaniko** — dind alternative, does not require privileged mode (safer in K8s).\n\n**Dependency Proxy** — caches base images, speeds up pull.\n\n**GitLab CI/CD Components** — reusable pipeline components from catalog.',
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
        caption: 'Docker-in-Docker and Kaniko build + push',
      },
    },
    {
      title: 'include, extends, and Templates',
      content:
        '**include** — import external YAML files (DRY, centralization):\n\n```yaml\ninclude:\n  - local: \'/templates/.gitlab-ci-docker.yml\'\n  - project: \'mygroup/ci-templates\'\n    file: \'/templates/test.yml\'\n    ref: main\n  - remote: \'https://example.com/ci-template.yml\'\n  - component: gitlab.com/components/docker/build@1.0.0\n```\n\n**extends** — inherit job configuration (like YAML anchor, but explicit):\n\n```yaml\n.deploy_template:\n  stage: deploy\n  image: bitnami/kubectl:latest\n  before_script:\n    - kubectl config use-context $KUBE_CONTEXT\n\ndeploy-staging:\n  extends: .deploy_template\n  environment: staging\n  script:\n    - kubectl apply -f k8s/\n```\n\n**Hidden jobs** — names with a dot (`.template`) do not create a job, only a template.\n\n**YAML anchors** — alternative to extends:\n\n```yaml\n.retry: &retry\n  retry:\n    max: 2\n    when: runner_system_failure\n\njob1:\n  <<: *retry\n```\n\n**CI/CD Catalog** — publish and use components as pipeline packages.',
      code: {
        language: 'yaml',
        code: `include:
  - local: .gitlab/ci/templates.yml
  - project: 'devops/ci-templates'
    file: '/kubernetes/deploy.yml'
    ref: v2.1.0

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
  extends: .k8s_deploy
  variables:
    KUBE_NAMESPACE: production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual`,
        caption: 'include + extends for reusable templates',
      },
    },
    {
      title: 'Parent-child and Multi-project Pipelines',
      content:
        '**Parent-child pipelines** — a trigger job starts a **child pipeline** in the same project with separate YAML.\n\n**Why:**\n- Split monolithic pipeline into parts\n- Different trigger rules for different configs\n- Matrix/generate via child pipelines\n\n```yaml\ngenerate-pipeline:\n  stage: prepare\n  trigger:\n    include: .gitlab/ci/child-pipeline.yml\n    strategy: depend   # parent waits for child\n```\n\n**Multi-project pipelines** — trigger pipeline in **another** project:\n\n```yaml\ntrigger-downstream:\n  trigger:\n    project: mygroup/deploy-configs\n    branch: main\n    strategy: depend\n```\n\n**Bridge jobs** — trigger jobs appear as bridges in pipeline graph.\n\n**CI/CD job token** — `CI_JOB_TOKEN` for authentication between projects (with scope limits).\n\n**Downstream pipeline variables:**\n\n```yaml\ntrigger:\n  project: other/project\n  forward:\n    pipeline_variables: true\n  variables:\n    UPSTREAM_SHA: $CI_COMMIT_SHA\n```\n\n**vs GitHub Actions:** GitLab child/multi-project — native trigger jobs; GHA — `workflow_call` or repository_dispatch.',
    },
    {
      title: 'Deploy to Kubernetes',
      content:
        'Typical K8s deployment approaches from GitLab CI:\n\n**1. kubectl / helm from CI (push model):**\n- Runner with kubeconfig (CI variable File type)\n- `helm upgrade --install` or `kubectl apply`\n\n**2. GitLab Agent for Kubernetes (agentk):**\n- Agent in cluster, pull model\n- CI job connects via `kubectl` context without kubeconfig on runner\n- Safer: no cluster credentials on runner\n\n**3. GitOps (ArgoCD/Flux):**\n- CI only updates image tag in Git\n- ArgoCD syncs cluster\n\n**Auto Deploy:**\n\n```yaml\ndeploy:\n  environment: production\n  script:\n    - kubectl set image deployment/myapp\n        app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA\n        -n production\n    - kubectl rollout status deployment/myapp -n production\n```\n\n**GitLab Environments + K8s:** GitLab can track deployments and show pod status in Environments UI (via agent).',
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

update-gitops:
  stage: deploy
  image: alpine/git:latest
  script:
    - git clone https://gitlab.com/org/k8s-manifests.git
    - cd k8s-manifests/apps/myapp/overlays/production
    - kustomize edit set image myapp=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - git commit -am "deploy: $CI_COMMIT_SHA"
    - git push`,
        caption: 'kubectl deploy and GitOps update tag',
      },
    },
    {
      title: 'Protected Branches and Pipeline Security',
      content:
        '**Protected branches** — restrictions on push/merge and CI:\n\nSettings → Repository → Protected branches:\n- **Allowed to merge** / **Allowed to push**\n- **Allowed to deploy** — who can deploy to protected environments\n\n**Protected CI variables** — variables with Protected flag available only in pipelines on protected branches/tags.\n\n**Merge Request pipelines:**\n- **Merged results pipeline** — test on merge commit\n- **Merge train** — series of MRs tested together before merge\n\n**Pipeline security:**\n- **CI_JOB_TOKEN** scope — limit downstream project access\n- **Secured CI/CD variables** — masked + protected\n- **SAST/DAST** — built-in security scanners (GitLab Ultimate or open templates)\n- **Compliance pipelines** — enforced CI config for group\n\n**Fork MR security:** secrets not available in pipelines from forks (similar to GitHub Actions).\n\n**Approval rules:** required approvals before merge → pipeline must pass.',
    },
    {
      title: 'GitLab CI vs GitHub Actions',
      content:
        '| Aspect | GitLab CI | GitHub Actions |\n|--------|-----------|----------------|\n| Config | `.gitlab-ci.yml` (one file + include) | `.github/workflows/*.yml` (multiple) |\n| Organization | stages → jobs | workflows → jobs → steps |\n| Reusable | extends, include, components | reusable workflows, composite actions |\n| Runners | Self-hosted + GitLab shared | Self-hosted + GitHub-hosted |\n| Registry | Built-in Container Registry | GHCR (separate service) |\n| Environments | Environments + review apps | Environments + protection rules |\n| DAG | `needs` | `needs` |\n| Matrix | `parallel:matrix` | `strategy.matrix` |\n| Child pipelines | trigger + include | `workflow_call` |\n| Marketplace | CI/CD Catalog / templates | Actions Marketplace (20k+) |\n| K8s integration | Agent for Kubernetes | No native (kubectl/helm) |\n| Free tier | 400 min/month (SaaS) | 2000 min/month (private) |\n\n**When GitLab CI:**\n- Already on GitLab (single platform)\n- Need built-in registry + packages\n- Review apps out of the box\n- Self-managed with full control\n\n**When GitHub Actions:**\n- GitHub ecosystem (GHCR, Packages, Codespaces)\n- Marketplace actions\n- Open source on GitHub\n\n**Migration:** concepts are similar — stages/jobs ≈ workflows/jobs, `script` ≈ `run`, `rules` ≈ `if`.',
    },
    {
      title: 'Troubleshooting Failed Pipelines',
      content:
        '**Diagnosing failed pipeline:**\n\n**1. Job logs** — CI/CD → Pipelines → Job → full log. Find the last failed command.\n\n**2. CI Lint** — Build → Pipeline editor → Validate. Checks YAML before commit.\n\n**3. Common failures:**\n\n| Problem | Solution |\n|---------|----------|\n| `script` required | Add script to job |\n| Runner not found | Check tags, runner online |\n| Permission denied (registry) | CI_REGISTRY credentials, job token scope |\n| dind connection refused | DOCKER_TLS_CERTDIR, privileged mode |\n| Cache miss every run | Check key, paths |\n| Job stuck | Runner disk/memory, timeout |\n| Masked variable empty | Protected variable + unprotected branch |\n\n**4. Debug techniques:**\n\n```yaml\ndebug:\n  script:\n    - env | sort\n    - docker info\n    - kubectl config view\n```\n\n**5. retry** — automatic retry on infrastructure failures:\n\n```yaml\nretry:\n  max: 2\n  when:\n    - runner_system_failure\n    - stuck_or_timeout_failure\n```\n\n**6. CI/CD Analytics** — DORA metrics, pipeline duration trends.\n\n**7. gitlab-runner verify** and `gitlab-runner list` on self-hosted.\n\n**8. Minimal pipeline** to isolate the problem — remove jobs, keep one failing job.',
      code: {
        language: 'bash',
        code: `# Validate .gitlab-ci.yml (via GitLab API or UI CI Lint)

# Check runner on self-hosted
gitlab-runner verify
gitlab-runner list

# Runner logs (systemd)
journalctl -u gitlab-runner -f

# Test docker executor
docker run --rm -it gitlab/gitlab-runner exec docker \\
  --docker-image alpine:latest \\
  --shell bash

# Check registry auth
echo $CI_REGISTRY_PASSWORD | docker login \\
  -u $CI_REGISTRY_USER \\
  --password-stdin $CI_REGISTRY`,
        caption: 'Commands for runner and registry diagnostics',
      },
    },
  ],
  practice: [
    'Create .gitlab-ci.yml with build, test, deploy stages for a pet project on GitLab.com',
    'Configure needs: unit-test → e2e-test without waiting for integration-test',
    'Register a self-hosted runner (docker executor) and assign a job via tags',
    'Add a masked CI/CD variable and use it for deploy (SSH key or kubeconfig)',
    'Set up cache for npm/pip and artifacts for dist/ between jobs',
    'Implement rules: auto deploy on develop, manual deploy on main',
    'Create a review app environment with on_stop job for MR pipelines',
    'Build a Docker image and push to GitLab Container Registry',
    'Move common templates to include/extends or a separate ci-templates project',
    'Set up a child pipeline or multi-project trigger for a deploy-configs repo',
  ],
  resources: [
    { title: 'GitLab CI/CD Docs', url: 'https://docs.gitlab.com/ee/ci/' },
    { title: 'GitLab CI YAML Reference', url: 'https://docs.gitlab.com/ee/ci/yaml/' },
    { title: 'GitLab Runner Docs', url: 'https://docs.gitlab.com/runner/' },
    { title: 'GitLab Container Registry', url: 'https://docs.gitlab.com/ee/user/packages/container_registry/' },
    { title: 'CI/CD Catalog', url: 'https://docs.gitlab.com/ee/ci/components/' },
    { title: 'GitLab vs GitHub Actions', url: 'https://docs.gitlab.com/ee/ci/migration/github_actions/' },
  ],
  quiz: [
    {
      question: 'Where is the GitLab CI/CD pipeline configuration defined?',
      options: [
        '.gitlab-ci.yml in the repository',
        '.github/workflows/*.yml',
        'Jenkinsfile only',
        'docker-compose.yml',
      ],
      answer: '.gitlab-ci.yml in the repository',
    },
    {
      question: 'What is the difference between a stage and a job in GitLab CI?',
      options: [
        'A stage is a logical group; jobs within a stage run in parallel, and stages run sequentially.',
        'A job is a group of stages that run in parallel.',
        'Stages and jobs are interchangeable terms.',
        'Only one job can exist per pipeline.',
      ],
      answer:
        'A stage is a logical group; jobs within a stage run in parallel, and stages run sequentially.',
    },
    {
      question: 'How does needs differ from default stage ordering?',
      options: [
        'needs creates DAG dependencies — job waits only for specified jobs, not entire previous stages',
        'needs is the same as stage order',
        'needs runs jobs only on tags',
        'needs disables parallel execution',
      ],
      answer:
        'needs creates DAG dependencies — job waits only for specified jobs, not entire previous stages',
      explanation:
        'Without needs, a job waits for all jobs in previous stages to complete.',
    },
    {
      question: 'Which executor runs each GitLab CI job in a Docker container?',
      options: ['docker', 'shell', 'ssh', 'parallels'],
      answer: 'docker',
    },
    {
      question: 'How do you store secrets securely in GitLab CI?',
      options: [
        'CI/CD Variables with masked/protected flags in project settings',
        'Hardcode in .gitlab-ci.yml',
        'Commit secrets to README',
        'Use public gist URLs',
      ],
      answer: 'CI/CD Variables with masked/protected flags in project settings',
    },
    {
      question: 'What is the difference between artifacts and cache?',
      options: [
        'Artifacts are guaranteed files passed between jobs until expire_in; cache is best-effort for speeding up repeated runs (e.g. dependencies).',
        'Artifacts and cache are the same GitLab feature with different names',
        'Cache is mandatory and never expires; artifacts are optional only',
        'Artifacts speed up tests; cache is only for Docker images',
      ],
      answer:
        'Artifacts are guaranteed files passed between jobs until expire_in; cache is best-effort for speeding up repeated runs (e.g. dependencies).',
    },
    {
      question: 'Which keyword replaces only/except for conditional job execution?',
      options: ['rules', 'when', 'trigger', 'extends'],
      answer: 'rules',
    },
    {
      question: 'How do you trigger a pipeline in another GitLab project?',
      options: [
        'trigger job with project: and branch:',
        'workflow_call keyword',
        'repository_dispatch event',
        'actions/checkout@v4',
      ],
      answer: 'trigger job with project: and branch:',
      explanation:
        'Multi-project pipelines use a trigger job; workflow_call is GitHub Actions.',
    },
    {
      question: 'What does extends do in .gitlab-ci.yml?',
      options: [
        'Inherits configuration from a hidden or named template job (DRY for shared job settings).',
        'Storing Docker images between GitLab runners',
        'Automatic encryption of secrets in the repository',
        'Forcing pipeline runs only on a cron schedule',
      ],
      answer:
        'Inherits configuration from a hidden or named template job (DRY for shared job settings).',
    },
    {
      question: 'Why might a masked CI/CD variable be empty in a pipeline job?',
      options: [
        'Protected variable used on an unprotected branch',
        'Variable name too long',
        'Runner is shared',
        'Using rules instead of only',
      ],
      answer: 'Protected variable used on an unprotected branch',
      explanation:
        'Protected variables are only exposed in pipelines for protected branches/tags.',
    },
  ],
}

export default translation
