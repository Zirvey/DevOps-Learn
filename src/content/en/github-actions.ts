import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: "GitHub Actions: The Complete Course",
  duration: "5–6 hours",
  description: "Workflows, jobs, steps, secrets, environments, matrix, caching, Docker build, deploy to Kubernetes, reusable workflows",
  sections: [
    {
      title: "Introduction to GitHub Actions",
      content: "**GitHub Actions** is GitHub's built-in CI/CD platform. The workflow is described in YAML files in the repository.\n\n**Advantages:**\n- Zero setup - works out of the box for any GitHub repository\n- Free tier: 2000 min/month (private), unlimited (public)\n- Marketplace with 20,000+ ready-made actions\n- Integration with GitHub (PR checks, environments, packages)\n- Self-hosted runners for private networks\n\n**Architecture:**\n\n```\nEvent (push/PR) → Workflow → Job(s) → Step(s) → Action / Shell command\n```\n\nWorkflow files are stored in `.github/workflows/` and are versioned in Git.",
    },
    {
      title: "Workflow, Job, Step, Action",
      content: "**Workflow** is an automated process defined by a YAML file. One repository can have many workflows.\n\n**Job** — a set of steps executed on one runner. Jobs can depend on each other (`needs`) and be executed in parallel.\n\n**Step** is a separate task within a job. Either runs an action (`uses`) or a shell command (`run`).\n\n**Action** - reusable block of code (composite, JavaScript, Docker).\n\n```\nWorkflow: ci.yml\n├── Job: lint (runs-on: ubuntu-latest)\n│   ├── Step: checkout (uses: actions/checkout@v4)\n│   └── Step: run eslint (run: npm run lint)\n├── Job: test (needs: lint)\n│   ├── Step: checkout\n│   ├── Step: setup node\n│   └── Step: run tests\n└── Job: deploy (needs: test, if: main)\n    └── Step: deploy to k8s\n```",
      code: {
        language: "yaml",
        code: "name: CI Pipeline\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm run lint\n\n  test:\n    needs: lint\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test",
        caption: "Minimum workflow: lint → test",
      },
    },
    {
      title: "Triggers (on)",
      content: "The `on` key determines when the workflow starts.\n\n**Main triggers:**\n| Trigger | When triggered |\n|---------|----|\n| `push` | Push to specified branches/tags |\n| `pull_request` | Opening/updating PR |\n| `schedule` | Cron schedule |\n| `workflow_dispatch` | Manual launch from UI |\n| `release` | Creating release |\n| `workflow_call` | Call from another workflow |\n\n**Filtering:**\n- `branches` / `branches-ignore`\n- `paths` / `paths-ignore` - run only when certain files change\n- `tags` — by tags (v*)\n\n**Concurrency** - canceling previous runs with a new push:\n\n```\n\nyaml\nconcurrency:\n  group: ${{ github.workflow }}-${{ github.ref }}\n  cancel-in-progress: true\n```",
      code: {
        language: "yaml",
        code: "on:\n  push:\n    branches: [main, develop]\n    paths:\n      - 'src/**'\n      - 'package.json'\n  pull_request:\n    branches: [main]\n  schedule:\n    - cron: '0 6 * * 1'    # каждый понедельник в 06:00 UTC\n  workflow_dispatch:\n    inputs:\n      environment:\n        description: 'Target environment'\n        required: true\n        type: choice\n        options: [staging, production]",
        caption: "Combination triggers with filtering",
      },
    },
    {
      title: "Runners",
      content: "**Runner** is the server on which jobs are executed.\n\n**GitHub-hosted runners:**\n| Runner | OS | Usage |\n|--------|-----|--------------|\n| `ubuntu-latest` | Ubuntu 24.04 | Linux applications, Docker |\n| `windows-latest` | Windows Server | .NET, Windows apps |\n| `macos-latest` | macOS 14 | iOS, macOS apps |\n\n**Self-hosted runners:**\n- Installed on your servers / private network\n- Access to internal resources (DB, VPN)\n- No minutes limit (but your resources)\n- Labels for routing: `runs-on: [self-hosted, linux, gpu]`\n\n**Select runner:**\n\n```\n\nyaml\njobs:\n  build:\n    runs-on: ubuntu-latest     # GitHub-hosted\n  deploy-internal:\n    runs-on: [self-hosted, production]  # свой runner\n```\n\nFor 95% of tasks, `ubuntu-latest` is sufficient.",
    },
    {
      title: "Steps: uses vs run",
      content: "**Step with `uses`** - launches an action (ready-made or your own):\n\n```\n\nyaml\n- uses: actions/checkout@v4\n- uses: actions/setup-node@v4\n  with:\n    node-version: '20'\n```\n\n**Step with `run`** - executes the shell command:\n\n```\n\nyaml\n- run: npm ci\n- run: echo \"Hello\" >> $GITHUB_STEP_SUMMARY\n  shell: bash\n```\n\n**Step parameters:**\n- `name` — display name\n- `id` — identifier for links (`steps.build.outputs.version`)\n- `if` — execution condition\n- `env` — environment variables\n- `working-directory` - working directory\n- `timeout-minutes` — timeout (default: 360)\n- `continue-on-error` - do not stop job on error",
      code: {
        language: "yaml",
        code: "steps:\n  - name: Checkout code\n    uses: actions/checkout@v4\n\n  - name: Install dependencies\n    run: npm ci\n    working-directory: ./app\n\n  - name: Run tests with coverage\n    id: test\n    run: |\n      npm test -- --coverage\n      echo \"coverage=$(cat coverage/coverage-summary.json | jq .total.lines.pct)\" >> $GITHUB_OUTPUT\n\n  - name: Check coverage threshold\n    if: steps.test.outputs.coverage < 80\n    run: echo \"::error::Coverage below 80%\" && exit 1",
        caption: "Steps with id, outputs and conditions",
      },
    },
    {
      title: "Variables and Contexts",
      content: "GitHub Actions provides **contexts** - objects with information about workflow, job, runner.\n\n**Main Contexts:**\n| Context | Contents |\n|----------|-----------|\n| `github` | event, ref, sha, actor, repository |\n| `env` | environment variables |\n| `job` | status, container |\n| `steps` | outputs of previous steps |\n| `secrets` | repository secrets |\n| `vars` | repository/organization variables |\n| `runner` | os, arch, name |\n\n**Syntax:** `${{ context.property }}`\n\n**Variable levels (lowest to highest priority):**\n1. Step-level `env`\n2. Job-level `env`\n3. Workflow-level `env`\n4. Repository/Organization variables\n5. Repository secrets\n\n**Outputs between steps:**\n\n```\n\nyaml\n- id: build\n  run: echo \"version=1.2.3\" >> $GITHUB_OUTPUT\n- run: echo \"Version is ${{ steps.build.outputs.version }}\"\n```",
      code: {
        language: "yaml",
        code: "env:\n  NODE_ENV: production\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    env:\n      APP_NAME: my-app\n    steps:\n      - run: |\n          echo \"Branch: ${{ github.ref_name }}\"\n          echo \"SHA: ${{ github.sha }}\"\n          echo \"Actor: ${{ github.actor }}\"\n          echo \"Event: ${{ github.event_name }}\"\n          echo \"Run ID: ${{ github.run_id }}\"",
        caption: "Using github context",
      },
    },
    {
      title: "Secrets",
      content: "**Secrets** - encrypted values ​​available in workflow via `${{ secrets.NAME }}`.\n\n**Where to store:**\n- **Repository secrets** — Settings → Secrets → Actions\n- **Organization secrets** - for all org repositories\n- **Environment secrets** - tied to environment (dev/staging/prod)\n\n**Safety Rules:**\n1. **Never** hardcode secrets in workflow files\n2. **Never** log secrets (GitHub masks them, but be careful with base64)\n3. Use **OIDC** instead of long-lived credentials for clouds\n4. Minimum rights - scope secrets to environments\n5. Rotation of secrets - update regularly\n\n**OIDC (OpenID Connect)** - temporary tokens instead of static keys:\n\n```\n\nyaml\npermissions:\n  id-token: write\n  contents: read\n# → AWS, GCP, Azure принимают OIDC token\n```\n\n**GITHUB_TOKEN** - automatic token for the GitHub API (packages, releases). Scope is limited to the current repository.",
      code: {
        language: "yaml",
        code: "jobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Login to container registry\n        uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n\n      - name: Deploy via SSH\n        env:\n          SSH_KEY: ${{ secrets.SSH_PRIVATE_KEY }}\n        run: |\n          echo \"$SSH_KEY\" > key.pem\n          chmod 600 key.pem\n          ssh -i key.pem user@server 'docker pull myapp:latest'",
        caption: "Using secrets in workflow",
      },
    },
    {
      title: "Environments and protection rules",
      content: "**Environments** - named deployment targets (dev, staging, production) with protection rules.\n\n**Settings:** Settings → Environments → New environment\n\n**Protection rules:**\n- **Required reviewers** — manual approval before deployment (1–6 people)\n- **Wait timer** — delay before deployment (0–43,200 min)\n- **Deployment branches** - only certain branches can deploy\n- **Environment secrets** - secrets available only in this environment\n\n**Use in workflow:**\n\n```\n\nyaml\njobs:\n  deploy-prod:\n    runs-on: ubuntu-latest\n    environment:\n      name: production\n      url: https://myapp.com\n    steps:\n      - run: ./deploy.sh\n```\n\n**Deployment history** - GitHub shows who, when and what commit was deployed to each environment.\n\n**Recommendation:** Always use environment with required reviewers for production.",
      code: {
        language: "yaml",
        code: "jobs:\n  deploy-staging:\n    runs-on: ubuntu-latest\n    environment: staging\n    steps:\n      - run: kubectl apply -f k8s/ --namespace=staging\n\n  deploy-production:\n    needs: deploy-staging\n    runs-on: ubuntu-latest\n    if: github.ref == 'refs/heads/main'\n    environment:\n      name: production\n      url: https://myapp.example.com\n    steps:\n      - run: kubectl apply -f k8s/ --namespace=production",
        caption: "Deploy to staging (auto) and production (with approval)",
      },
    },
    {
      title: "Matrix builds",
      content: "**Matrix strategy**—parallel launch of jobs with different combinations of parameters.\n\n**Application:**\n- Testing on different versions of Node.js / Python / Go\n- Cross-platform assembly (linux, windows, macos)\n- Testing with different databases\n\n```\n\nyaml\nstrategy:\n  matrix:\n    node-version: [18, 20, 22]\n    os: [ubuntu-latest, windows-latest]\n```\n\n→ Creates 6 jobs (3 versions × 2 OS).\n\n**Options:**\n- `fail-fast: false` - do not cancel the others if one fails\n- `max-parallel: 4` - limit parallelism\n- `include` / `exclude` - add/remove combinations",
      code: {
        language: "yaml",
        code: "jobs:\n  test:\n    runs-on: ${{ matrix.os }}\n    strategy:\n      fail-fast: false\n      matrix:\n        os: [ubuntu-latest, macos-latest]\n        node-version: [18, 20, 22]\n        include:\n          - os: ubuntu-latest\n            node-version: 22\n            coverage: true\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: ${{ matrix.node-version }}\n      - run: npm ci\n      - run: npm test\n      - if: matrix.coverage\n        run: npm run test:coverage",
        caption: "Matrix: 2 OS × 3 Node.js versions",
      },
    },
    {
      title: "Dependency Caching",
      content: "**Caching** speeds up the pipeline by preserving dependencies between runs.\n\n**Built-in cache in setup actions:**\n\n```\n\nyaml\n- uses: actions/setup-node@v4\n  with:\n    node-version: '20'\n    cache: 'npm'    # автоматически кэширует node_modules\n```\n\nSupported: npm, yarn, pnpm, pip, go, gradle, maven, cargo.\n\n**actions/cache** - universal cache:\n\n```\n\nyaml\n- uses: actions/cache@v4\n  with:\n    path: ~/.npm\n    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}\n    restore-keys: |\n      ${{ runner.os }}-npm-\n```\n\n**Principles:**\n- `key` - unique identifier (include hash of dependency files)\n- `restore-keys` — partial match for fallback\n- The cache is tied to a branch, but is available across branches\n- Limit: 10 GB per repository\n- Don't cache build artifacts - only dependencies",
      code: {
        language: "yaml",
        code: "jobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Cache Docker layers\n        uses: actions/cache@v4\n        with:\n          path: /tmp/.buildx-cache\n          key: ${{ runner.os }}-buildx-${{ github.sha }}\n          restore-keys: |\n            ${{ runner.os }}-buildx-\n\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci   # из кэша, если key совпал",
        caption: "npm caching and Docker layers",
      },
    },
    {
      title: "Artifacts",
      content: "**Artifacts** - files saved between jobs or downloaded after workflow.\n\n**Loading:**\n\n```\n\nyaml\n- uses: actions/upload-artifact@v4\n  with:\n    name: build-output\n    path: dist/\n    retention-days: 7\n```\n\n**Download:**\n\n```\n\nyaml\n- uses: actions/download-artifact@v4\n  with:\n    name: build-output\n    path: dist/\n```\n\n**Application:**\n- Transfer of build artifacts between jobs (build → test → deploy)\n- Saving test reports, coverage reports\n- Saving logs for debugging\n\n**Limits:** 500 MB per artifact (free), 10 GB (paid). Retention: 1–90 days.\n\nFor Docker images, use registry (GHCR, ECR), not artifacts.",
    },
    {
      title: "Docker build and push",
      content: "Standard pattern: build a Docker image and push it into the registry when merging into main.\n\n**Components:**\n1. `docker/login-action` - authentication in the registry\n2. `docker/setup-buildx-action` - BuildKit builder\n3. `docker/build-push-action` - build and push\n4. `docker/metadata-action` - tag generation\n\n**GitHub Container Registry (GHCR):**\n- `ghcr.io/<owner>/<image>:<tag>`\n- Authentication via `GITHUB_TOKEN` or PAT\n- Free for public, included in GitHub plan for private",
      code: {
        language: "yaml",
        code: "jobs:\n  build-and-push:\n    runs-on: ubuntu-latest\n    if: github.ref == 'refs/heads/main'\n    permissions:\n      contents: read\n      packages: write\n    steps:\n      - uses: actions/checkout@v4\n\n      - uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n\n      - uses: docker/setup-buildx-action@v3\n\n      - uses: docker/metadata-action@v5\n        id: meta\n        with:\n          images: ghcr.io/${{ github.repository }}\n          tags: |\n            type=sha\n            type=ref,event=branch\n            type=semver,pattern={{version}}\n\n      - uses: docker/build-push-action@v5\n        with:\n          context: .\n          push: true\n          tags: ${{ steps.meta.outputs.tags }}\n          labels: ${{ steps.meta.outputs.labels }}\n          cache-from: type=gha\n          cache-to: type=gha,mode=max",
        caption: "Build + push in GHCR with caching",
      },
    },
    {
      title: "Deploy to Kubernetes",
      content: "Deploying to K8s from GitHub Actions is a typical CD step.\n\n**Approaches:**\n1. **kubectl apply** - direct application of manifests\n2. **Helm upgrade** - via Helm chart\n3. **ArgoCD** - GitOps (update image tag in Git → ArgoCD synchronizes)\n\n**Authentication in K8s:**\n- Kubeconfig as secret\n- OIDC (EKS, GKE, AKS)\n- Service Account token\n\n**Pattern: update image tag and apply:**\n\n```\n\nyaml\n- run: |\n    sed -i \"s|image: .*|image: ghcr.io/org/app:${{ github.sha }}|\" k8s/deployment.yaml\n    kubectl apply -f k8s/\n```\n\nFor production, **GitOps** (ArgoCD/Flux) is recommended instead of direct kubectl from CI.",
      code: {
        language: "yaml",
        code: "jobs:\n  deploy:\n    needs: build-and-push\n    runs-on: ubuntu-latest\n    environment: production\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Configure kubectl\n        uses: azure/k8s-set-context@v4\n        with:\n          kubeconfig: ${{ secrets.KUBE_CONFIG }}\n\n      - name: Update image tag\n        run: |\n          kubectl set image deployment/myapp \\\n            app=ghcr.io/${{ github.repository }}:${{ github.sha }} \\\n            --namespace=production\n\n      - name: Wait for rollout\n        run: |\n          kubectl rollout status deployment/myapp \\\n            --namespace=production --timeout=300s",
        caption: "Deploy to K8s: update image + rollout status",
      },
    },
    {
      title: "Reusable workflows",
      content: "**Reusable workflows** - moving the general logic into a separate workflow, called from others.\n\n**Creation** (`.github/workflows/reusable-ci.yml`):\n\n```\n\nyaml\non:\n  workflow_call:\n    inputs:\n      node-version:\n        required: true\n        type: string\n    secrets:\n      npm-token:\n        required: true\n```\n\n**Call:**\n\n```\n\nyaml\njobs:\n  ci:\n    uses: ./.github/workflows/reusable-ci.yml\n    with:\n      node-version: '20'\n    secrets:\n      npm-token: ${{ secrets.NPM_TOKEN }}\n```\n\n**Advantages:**\n- DRY - one CI logic for many repositories\n- Centralized update (org-level workflows)\n- Standardization across teams\n\n**Organizational workflows:**\n\n```\n\nyaml\nuses: my-org/.github/.github/workflows/ci.yml@main\n```",
      code: {
        language: "yaml",
        code: "# .github/workflows/reusable-docker-build.yml\nname: Reusable Docker Build\n\non:\n  workflow_call:\n    inputs:\n      image-name:\n        required: true\n        type: string\n    outputs:\n      image-tag:\n        value: ${{ jobs.build.outputs.tag }}\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    outputs:\n      tag: ${{ steps.meta.outputs.tags }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/build-push-action@v5\n        id: build\n        with:\n          push: true\n          tags: ${{ inputs.image-name }}:${{ github.sha }}",
        caption: "Reusable workflow for Docker build",
      },
    },
    {
      title: "Composite Actions",
      content: "**Composite Action** - a reusable set of steps in one action.\n\n**Structure:**\n\n```\n.github/actions/setup-app/\n├── action.yml\n└── (optional scripts)\n```\n\n**action.yml:**\n```\n\nyaml\nname: 'Setup App'\ndescription: 'Install dependencies and build'\ninputs:\n  node-version:\n    default: '20'\nruns:\n  using: 'composite'\n  steps:\n    - uses: actions/setup-node@v4\n      with:\n        node-version: ${{ inputs.node-version }}\n    - run: npm ci\n      shell: bash\n    - run: npm run build\n      shell: bash\n```\n\n**Usage:**\n\n```\n\nyaml\n- uses: ./.github/actions/setup-app\n  with:\n    node-version: '22'\n```\n\nComposite actions - for logic inside the repository. Reusable workflows - for logic between repositories.",
    },
    {
      title: "Full CI/CD pipeline: example",
      content: "Let's put everything together - production-ready pipeline:",
      code: {
        language: "yaml",
        code: "name: CI/CD\n\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\nconcurrency:\n  group: ci-${{ github.ref }}\n  cancel-in-progress: true\n\njobs:\n  lint-and-test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test -- --coverage\n\n  build-and-push:\n    needs: lint-and-test\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      packages: write\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      - uses: docker/build-push-action@v5\n        with:\n          push: true\n          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}\n\n  deploy-staging:\n    needs: build-and-push\n    runs-on: ubuntu-latest\n    environment: staging\n    steps:\n      - run: echo \"Deploy ${{ github.sha }} to staging\"\n\n  deploy-production:\n    needs: deploy-staging\n    runs-on: ubuntu-latest\n    environment: production\n    steps:\n      - run: echo \"Deploy ${{ github.sha }} to production\"",
        caption: "Full pipeline: test → build → staging → production",
      },
    },
    {
      title: "Debugging and best practices",
      content: "**Debugging workflows:**\n- **Actions tab** — logs of each run, step, timing\n- **`echo \"::debug::message\"`** — debug output (turn on in Settings → Secrets → Actions → Debug)\n- **`act`** — local launch of workflows (nektos/act)\n- **Workflow visualization** — jobs dependency graph\n\n**Best practices:**\n1. Pinning actions by SHA, not by tag (`@v4` → `@<commit-sha>` for prod)\n2. Minimum `permissions` (principle of least privilege)\n3. `concurrency` with `cancel-in-progress` to save minutes\n4. Dependency caching\n5. Fail fast - lint before tests\n6. Environments with approval for production\n7. OIDC instead of long-lived secrets\n8. Reusable workflows for standardization\n9. `timeout-minutes` on jobs to protect against freezing\n10. Dependabot for updating actions\n\n**Common mistakes:**\n- Forget `permissions` for GITHUB_TOKEN (packages, deployments)\n- Don't specify `needs` → jobs run in parallel without dependency\n- Secrets are not available in fork PR (by design, security)",
    },
  ],
  practice: [
    "Create a workflow: lint + unit test for each PR in the pet project repository",
    "Add matrix build for Node.js 18, 20, 22 on ubuntu and macOS",
    "Set up npm dependency caching and measure the difference in pipeline time",
    "Add Docker image build and push to GHCR when merging in main",
    "Create staging and production environments with required reviewers for prod",
    "Write a reusable workflow for Docker build and call it from the main CI",
    "Create a composite action for setup + build and use it in workflow",
    "Add deploy step: kubectl set image or update manifest in Git (GitOps)",
    "Setting up concurrency with cancel-in-progress and workflow_dispatch with environment selection",
    "Install act and run workflow locally for debugging",
  ],
  resources: [
    { title: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" },
    { title: "Actions Marketplace", url: "https://github.com/marketplace?type=actions" },
  ],
  quiz: [
    {
      question: "Where are workflows described in GitHub Actions?",
      options: [
        ".github/workflows/*.yml",
        "Jenkinsfile in root only",
        ".gitlab-ci.yml",
        "docker-compose.yml",
      ],
      answer: ".github/workflows/*.yml",
    },
    {
      question: "How is job different from step?",

      options: [
        "Job — set steps on runner; step - a separate action (action or shell).",
        "Job — a separate shell command; step — the entire pipeline.",
        "Job runs only locally; step — only in the cloud.",
        "No difference — they are synonyms in GitHub Actions.",
      ],
      answer: "Job — set steps on runner; step - a separate action (action or shell).",
    },
    {
      question: "How to pass a secret to a workflow securely?",
      options: [
        "Via GitHub Secrets and ${{ secrets.NAME }}",
        "In plain text in a workflow file",
        "In a commit in the README",
        "Via public gist",
      ],
      answer: "Via GitHub Secrets and ${{ secrets.NAME }}",
    },
    {
      question: "What does actions/checkout do?",
      options: [
        "Clones the repository on runner",
        "Publishes a Docker image",
        "Creates a Kubernetes cluster",
        "Deploy to AWS without credentials",
      ],
      answer: "Clones the repository on runner",
    },
    {
      question: "When to use matrix strategy?",

      options: [
        "For parallel running on different OS versions, languages ​​or parameters.",
        "For strictly sequential job execution one after another",
        "Only for deploying to a single target environment",
        "For storing secrets and environment variables in the workflow",
      ],
      answer: "For parallel running on different OS versions, languages ​​or parameters.",
    },
    {
      question: "How is workflow_dispatch different from push trigger?",
      options: [
        "Manually starting workflow from UI/API",
        "Autorun on every commit",
        "Only for fork PR",
        "Run via cron only, no exceptions",
      ],
      answer: "Manually starting workflow from UI/API",
    },
    {
      question: "What is a GitHub Actions runner?",
      options: [
        "Execution environment for a job (GitHub-hosted or self-hosted)",
        "Docker registry only",
        "Type of branch protection",
        "kubectl plugin",
      ],
      answer: "Execution environment for a job (GitHub-hosted or self-hosted)",
      explanation: "Self-hosted runners are needed for access to private networks or specific hardware.",
    },
    {
      question: "How do you limit a workflow to pull_request from the same repository (not a fork)?",
      options: [
        "Condition if: github.event.pull_request.head.repo.full_name == github.repository",
        "Disable all triggers",
        "Use only workflow_dispatch",
        "Cannot be limited",
      ],
      answer: "Condition if: github.event.pull_request.head.repo.full_name == github.repository",
    },
    {
      question: "How does needs differ from depends_on in the GHA context?",
      options: [
        "needs sets job order in workflow; depends_on is a Docker Compose term",
        "needs runs matrix",
        "depends_on is a synonym for needs in GHA",
        "No difference",
      ],
      answer: "needs sets job order in workflow; depends_on is a Docker Compose term",
      explanation: "In GitHub Actions, jobs are parallel by default without needs.",
    },
    {
      question: "How do you pass output from one job to the next in GitHub Actions?",
      options: [
        "Via job outputs and referencing needs.<job_id>.outputs.<name> in subsequent steps.",
        "By copying files manually between runners.",
        "Using only environment secrets with no job outputs.",
        "Through a shared database outside GitHub.",
      ],
      answer: "Via job outputs and referencing needs.<job_id>.outputs.<name> in subsequent steps.",
    },
  ],
}

export default translation
