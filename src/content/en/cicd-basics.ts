import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: "CI/CD: theory and practice",
  duration: "4–5 hours",
  description: "The theory of continuous integration and delivery: pipeline stages, branching strategies, artifacts and environments",
  sections: [
    {
      title: "What is CI/CD and why is it needed?",
      content: "**CI/CD** (Continuous Integration / Continuous Delivery / Continuous Deployment) - a set of practices and tools that automate the code path from commit to production.\n\n**Problems without CI/CD:**\n- Manual builds and deploys is a source of human errors\n- “It works for me” - different dev and prod environments\n- Rare releases - big, risky changes\n- Long feedback time - bugs are discovered late\n\n**Solution:** each commit goes through an automated pipeline: checks → build → tests → deployment. Feedback in minutes, not days.\n\nCI/CD is not a tool, but a **culture and process** supported by automation.",
    },
    {
      title: "CI: Continuous Integration",
      content: "**Continuous Integration** - developers often (several times a day) integrate code into a common branch (usually `main`). Each integration runs automatic builds and tests.\n\n**Key principles of CI:**\n1. **Single repository** - all the code in one place (or monorepo with a clear structure)\n2. **Automatic build** - every push/merge starts build\n3. **Automatic tests** - unit, integration, lint\n4. **Quick feedback** - pipeline < 10–15 minutes for the CI part\n5. **Fix immediately** - broken main blocks the team → fix it immediately\n\n**Rule:** if main is red, priority #1 is to fix it rather than write new code.\n\n**What CI checks:**\n- Compilation/assembly\n- Unit tests\n- Linters and formatters\n- Static analysis (SAST)\n- Dependency checking (SCA)",
    },
    {
      title: "CD: Delivery vs Deployment",
      content: "**Continuous Delivery** - the code is always in the “ready for deployment to production” state. The last step (deployment to prod) is **manual** (button, approval).\n\n**Continuous Deployment** - every commit that goes through the pipeline **automatically** goes into production without manual intervention.\n\n| | Continuous Delivery | Continuous Deployment |\n|---|---|---|\n| Deploy to prod | Manual | Automatic |\n| Risk | Lower | Higher (needs strong tests) |\n| Suitable for | Enterprise, regulated | SaaS, startups |\n| Requirements | Good tests | Excellent tests + feature flags |\n\n**Important:** both options require automation of the entire path to staging. The only difference is in the last step.\n\nMost teams start with **Continuous Delivery** and move to Deployment as they grow in maturity.",
    },
    {
      title: "Anatomy of a pipeline: stages",
      content: "A typical CI/CD pipeline consists of sequential and parallel **stages**:\n\n```\n┌─────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐   ┌────────┐\n│  Lint   │ → │  Test   │ → │  Build   │ → │ Security │ → │ Package │ → │ Deploy │\n│ Format  │   │  Unit   │   │ Compile  │   │   Scan   │   │  Image  │   │  Env   │\n└─────────┘   │ Integr. │   └──────────┘   └──────────┘   └─────────┘   └────────┘\n              └─────────┘\n```\n\n**1. Lint & Format** - code style, static analysis\n**2. Test** - unit → integration → e2e (testing pyramid)\n**3. Build** - compilation, assembly of the artifact\n**4. Security** - SAST, dependency scan, container scan\n**5. Package** — Docker image, JAR, npm package\n**6. Deploy** - deployment to the environment (dev → staging → prod)\n\n**Fail fast principle:** cheap checks (lint) come first. Expensive checks (e2e) - after unit tests.\n\n**Parallelization:** Independent jobs (lint + unit tests) are launched simultaneously to speed up.",
    },
    {
      title: "Branching Strategies: Git Flow",
      content: "**Git Flow** is a classic model with long-lived branches:\n\n- `main` - production code, only through release\n- `develop` — integration branch\n- `feature/*` - new features from develop\n- `release/*` — preparing a release\n- `hotfix/*` - urgent fixes from main\n\n**Pros:** clear separation, suitable for versioned releases (v1.0, v2.0).\n**Cons:** complexity, long-lived branches, merge hell.\n\n**CI/CD with Git Flow:**\n- CI for each push to a feature branch\n- CD in staging when merged in develop\n- CD in prod with merge release → main\n\nSuitable for: desktop applications, products with a fixed release cycle.",
    },
    {
      title: "Branching Strategies: Trunk-Based Development",
      content: "**Trunk-Based Development (TBD)** - all developers commit to one branch (`main` / `trunk`) several times a day.\n\n**TBD Rules:**\n- Branches live < 1 day (short-lived feature branches are acceptable)\n- Feature flags hide unfinished code\n- main is always green and deployable\n\n**Pros:**\n- Minimum merge conflicts\n- Fast integration\n- Ideal for Continuous Deployment\n- Recommended by Google, Facebook, Netflix\n\n**Disadvantages:** requires discipline, feature flags, strong tests.\n\n**CI/CD with TBD:**\n- CI for each push in main\n- CD: automatic deployment to prod (or via feature flags)\n\nThis is the **gold standard** for modern DevOps teams.",
      code: {
        language: "bash",
        code: "# Типичный TBD workflow\ngit checkout main\ngit pull origin main\ngit checkout -b fix/login-timeout   # короткая ветка\n# ... изменения ...\ngit push origin fix/login-timeout\n# → CI запускается на PR\n# → merge в main → CD деплоит в prod",
        caption: "Trunk-Based: short branches, fast merge",
      },
    },
    {
      title: "Branching Strategies: GitHub Flow",
      content: "**GitHub Flow** is a simplified model for web applications and SaaS:\n\n1. `main` - always deployable\n2. Create a feature branch from main\n3. Commit, push, open Pull Request\n4. Code review + CI passes\n5. Merge in main → automatic deployment\n\n**Difference from Git Flow:** there is no develop branch, no release branches. One thread: feature → main → prod.\n\n**CI/CD mapping:**\n| Event | Pipeline |\n|---------|----------|\n| Push to feature branch | CI (lint, test, build) |\n| Pull Request | CI + preview deploy |\n| Merge in main | CD (deploy staging → prod) |\n\nGitHub Flow + Trunk-Based is the most popular combination in the industry.",
    },
    {
      title: "Assembly artifacts",
      content: "**Artifact** is the result of the assembly, which is transferred between the stages of the pipeline and deployed.\n\n**Artifact Types:**\n| Type | Example | Storage |\n|----------|--------|-----------|\n| Docker image | `myapp:1.2.3` | GHCR, ECR, Docker Hub |\n| JAR/WAR | `app-1.2.3.jar` | Nexus, Artifactory, S3 |\n| npm package | `@company/lib@1.0.0` | npm registry, Verdaccio |\n| Binary | `app-linux-amd64` | S3, GitHub Releases |\n| Helm chart | `myapp-1.2.3.tgz` | ChartMuseum, OCI registry |\n| Terraform plan | `plan.tfplan` | S3, CI artifacts |\n\n**Principles of working with artifacts:**\n1. **Immutability** - an artifact with the `1.2.3` tag is never overwritten\n2. **Versioning** - tag = git SHA or semver\n3. **One artifact - all environments** - one image is deployed to dev, staging, prod\n4. **Promotion, not reassembly** - staging and prod receive the same artifact\n\n```\nBuild once → Test everywhere → Deploy anywhere\n```\n\n**Anti-pattern:** rebuild the image for each environment with different configs inside. Configuration - through environment variables / ConfigMaps, not through rebuilding.",
    },
    {
      title: "Environments",
      content: "**Environment** is an isolated application instance with its own infrastructure and configuration.\n\n**Typical chain:**\n\n```\ndev → staging → production\n```\n\n| Environment | Destination | Data | Access |\n|-----------|-----------|--------|--------|\n| **dev** | Development, experiments | Fake/seed | Developers |\n| **staging** | Pre-prod testing | Copy prod (anonymized) | QA + DevOps |\n| **production** | Real users | Real | Limited |\n\n**Additional environments:**\n- **preview** — temporary environment for each PR (ephemeral)\n- **canary** — a subset of prod traffic for the new version\n- **dr** (disaster recovery) - prod backup\n\n**Principles:**\n1. **Environment parity** - staging is as similar as possible to prod (same services, versions)\n2. **Isolation** - separate namespace / VPC / accounts\n3. **Promotion of artifacts** - one image goes through all environments\n4. **Configuration via variables** - the only difference is env vars / secrets\n5. **Infrastructure as Code** - environments are created the same way (Terraform)",
    },
    {
      title: "Quality Gates and Policies",
      content: "**Quality Gate** is a set of criteria that the pipeline must pass in order to continue.\n\n**Examples of quality gates:**\n- Code coverage ≥ 80%\n- 0 critical vulnerabilities (SAST/SCA)\n- All unit tests are green\n- Lint without errors\n- Performance test: p99 < 200ms\n- Manual approval for prod\n\n**Branch protection rules (GitHub):**\n- Require PR reviews (minimum 1–2)\n- Require status checks (CI green)\n- Require signed commits\n- No direct push to main\n\n**Deployment gates:**\n- Automatic deployment to dev/staging\n- Manual approval for production\n- Scheduled deploy windows (nightly releases)\n- Canary analysis before full rollout\n\nQuality gates turn “hope everything works” into **measurable criteria**.",
    },
    {
      title: "Deployment strategies",
      content: "**Rolling Update** - gradual replacement of old instances with new ones. K8s Deployment standard.\n\n**Blue-Green** - two identical environments. Traffic switches from Blue (current) to Green (new) instantly.\n- Plus: instant rollback (switch back)\n- Disadvantage: double resources\n\n**Canary** - a small % of traffic (5-10%) is directed to the new version. If successful, a gradual increase.\n- Plus: minimum blast radius\n- Disadvantage: complexity (you need a service mesh or ingress with weight)\n\n**Recreate** - stop all old ones, start new ones. Simple, but with downtime.\n\n| Strategy | Downtime | Rollback | Difficulty |\n|-----------|----------|----------|-----------|\n| Rolling | No | Medium | Low |\n| Blue-Green | No | Quick | Average |\n| Canary | No | Quick | High |\n| Recreate | Yes | Quick | Low |\n\nFor Kubernetes: Rolling - default, Canary - via Argo Rollouts or Flagger.",
    },
    {
      title: "Pipeline as Code",
      content: "**Pipeline as Code** - description of the CI/CD pipeline in a file stored in the repository next to the code.\n\n**Advantages:**\n- Versioning in Git (pipeline change history)\n- Code review for pipeline (PR for workflow)\n- Reproducibility - the same pipeline for everyone\n- Documentation - the pipeline describes itself\n\n**Formats:**\n| Tool | Format | File |\n|-----------|--------|------|\n| GitHub Actions | YAML | `.github/workflows/*.yml` |\n| GitLab CI | YAML | `.gitlab-ci.yml` |\n| Jenkins | Groovy (Jenkinsfile) | `Jenkinsfile` |\n| ArgoCD | YAML (Application CRD) | Git repo |\n\n**Principle:** pipeline is part of the code base, not a configuration in the CI server UI.\n\nChanging the pipeline goes through the same process: branch → PR → review → merge.",
    },
    {
      title: "CI/CD Tools",
      content: "| Tool | Type | Features |\n|-----------|-----|------------|\n| **GitHub Actions** | CI/CD | Built in GitHub, YAML, marketplace actions |\n| **GitLab CI** | CI/CD | Full DevOps lifecycle, self-hosted runners |\n| **Jenkins** | CI/CD | Classic, 2000+ plugins, self-hosted |\n| **CircleCI** | CI | Cloud-first, quick start |\n| **ArgoCD** | CD (GitOps) | Declarative deployment in K8s |\n| **Flux** | CD (GitOps) | Alternative to ArgoCD |\n| **Tekton** | CI/CD | Cloud-native pipelines for K8s |\n| **Spinnaker** | CD | Multi-cloud deployment |\n\n**How to choose:**\n- Code on GitHub → **GitHub Actions** (free tier, zero setup)\n- Self-hosted GitLab → **GitLab CI**\n- Legacy enterprise → **Jenkins** (but consider migration)\n- Kubernetes CD → **ArgoCD** or **Flux**\n\nFor training and pet projects: **GitHub Actions** is the best choice.",
    },
    {
      title: "DORA Metrics",
      content: "**DORA** (DevOps Research and Assessment) - four key metrics of DevOps maturity:\n\n**1. Deployment Frequency** - how often do you deploy to prod?\n- Elite: several times a day\n- Low: once a month or less\n\n**2. Lead Time for Changes** - time from commit to prod?\n- Elite: < 1 hour\n- Low: > 6 months\n\n**3. Change Failure Rate** - % of deployments that caused an incident?\n- Elite: 0–15%\n- Low: 46–60%\n\n**4. Mean Time to Recovery (MTTR)** - recovery time after an incident?\n- Elite: < 1 hour\n- Low: > 1 week\n\n**How to improve:**\n- Deploy more often → smaller changes → less risk\n- CI/CD automation → reduction of lead time\n- Monitoring + rollback → decrease in MTTR\n- Tests + canary → reduction in failure rate\n\nMeasure these metrics and track your progress quarter after quarter.",
    },
    {
      title: "Security in the pipeline (DevSecOps)",
      content: "**Shift-left security** - embedding security checks into CI/CD, and not just before release.\n\n**Security stages in the pipeline:**\n\n1. **Pre-commit** — secret scanning (gitleaks, trufflehog)\n2. **CI: SAST** - static code analysis (CodeQL, Semgrep, SonarQube)\n3. **CI: SCA** - dependency scanning (Dependabot, Snyk, Trivy)\n4. **Build: Container scan** - scanning a Docker image (Trivy, Grype)\n5. **CD: DAST** - dynamic analysis (OWASP ZAP)\n6. **Runtime** - monitoring in prod (Falco, runtime security)\n\n**Principles:**\n- Secrets - only in vault/secrets manager, never in code\n- Minimum rights for CI/CD runners\n- Artifact signature (cosign, Sigstore)\n- SBOM (Software Bill of Materials) for each release\n\nSecurity is not a separate stage, but **part of each stage** of the pipeline.",
    },
    {
      title: "CI/CD antipatterns",
      content: "**1. Long pipeline (> 30 min)**\n→ Developers stop waiting. Solution: parallelization, caching, fail fast.\n\n**2. Flaky tests**\n→ Pipeline is unstable, trust is falling. Solution: quarantine, retry with a limit, repair.\n\n**3. Manual steps in an “automatic” pipeline**\n→ Copy-paste configs, SSH to server. Solution: everything is in code (IaC, GitOps).\n\n**4. Different artifacts for different environments**\n→ “It worked for staging.” Solution: build once, deploy everywhere.\n\n**5. No rollback**\n→ Panic during an incident. Solution: automatic rollback, blue-green.\n\n**6. Secrets in workflow files**\n→ Leak via Git. Solution: secrets manager, OIDC.\n\n**7. Pipeline without tests**\n→ Deploy at random. Solution: testing pyramid, coverage gates.\n\n**8. “Works on my machine” pipeline**\n→ CI green, prod red. Solution: environment parity, containerization.",
    },
    {
      title: "Pipeline design: checklist",
      content: "When designing CI/CD for a project, answer the following questions:\n\n**1. Triggers:** push, PR, tag, schedule, manual?\n**2. Stages:** lint → test → build → scan → deploy?\n**3. Branching:** TBD, GitHub Flow, Git Flow?\n**4. Environments:** dev, staging, prod - which ones and when?\n**5. Artifacts:** Docker image? Versioning?\n**6. Deploy:** rolling, blue-green, canary?\n**7. Secrets:** where to store? OIDC?\n**8. Rollback:** automatic? How?\n**9. Notifications:** Slack, email in case of failure?\n**10. Pipeline time:** target < 10 min for CI?\n\n**Minimum pipeline for a pet project:**\n\n```\nPR → lint + unit test\nmerge main → build image → push registry → deploy staging\ntag v* → deploy production (manual approval)\n```\n\nStart with the minimum and add stages as the project grows.",
      code: {
        language: "yaml",
        code: "# Минимальный pipeline (концептуально)\nstages:\n  - lint          # 1-2 мин\n  - test          # 3-5 мин\n  - build         # 2-3 мин\n  - deploy-dev    # автоматически\n  - deploy-staging # автоматически\n  - deploy-prod   # manual approval",
        caption: "Recommended stage structure",
      },
    },
  ],
  practice: [
    "Draw a CI/CD pipeline diagram for your pet project: define stages, triggers and environments",
    "Compare Git Flow and Trunk-Based Development: which approach is right for your project and why",
    "Define build artifacts for your stack (Docker image, JAR, npm package) and where to store them",
    "Design a chain of environments dev → staging → prod: what services, data and accesses are in each",
    "Fill out the pipeline design checklist (10 questions from the last section) for a pet project",
    "Describe quality gates: what code coverage, what security scans, is manual approval needed for prod",
    "Choose a deployment strategy (rolling / blue-green / canary) for your project and justify your choice",
    "Evaluate current DORA metrics (or hypothetical ones) and create an improvement plan for 3 months",
  ],
  resources: [
    { title: "GitHub Actions Docs", url: "https://docs.github.com/en/actions" },
    { title: "DORA Metrics", url: "https://dora.dev" },
  ],
  quiz: [
    {
      question: "How is CI different from CD?",
      options: [
        "CI - integration and tests, CD - delivery/deployment to environments",
        "CI only for Java, CD only for Python",
        "CD means no tests",
        "It's the same thing",
      ],
      answer: "CI - integration and tests, CD - delivery/deployment to environments",
    },
    {
      question: "Why run a pipeline on a pull request?",

      options: [
        "Early detection of errors before merging into the main branch.",
        "To speed up merge without code review",
        "Only for generating a changelog",
        "Pipeline on PR runs exclusively on main",
      ],
      answer: "Early detection of errors before merging into the main branch.",
    },
    {
      question: "What is an artifact in the pipeline?",
      options: [
        "Build result (image, jar, bundle) passed between stages",
        "Only job log",
        "The secret is in plain text",
        "Terraform state locally",
      ],
      answer: "Build result (image, jar, bundle) passed between stages",
    },
    {
      question: "Why is the “build once, deploy many” principle important?",
      options: [
        "The same artifact passes through all environments, reducing discrepancies",
        "To avoid storing versions",
        "To deploy only manually",
        "To disable tests",
      ],
      answer: "The same artifact passes through all environments, reducing discrepancies",
    },
    {
      question: "What are the typical stages of a CI pipeline for a web application?",
      options: [
        "Lint, unit tests, build, integration/e2e, security scan, publish artifact/image.",
        "Deploy to production first, then run tests.",
        "Only manual QA with no automation.",
        "Compile once and skip all verification stages.",
      ],
      answer: "Lint, unit tests, build, integration/e2e, security scan, publish artifact/image.",
    },
    {
      question: "What is deployment strategy blue-green?",
      options: [
        "Two identical environments; traffic switches to the new one after verification",
        "Gradual replacement of Pods one at a time without downtime",
        "Deploy only on Fridays",
        "Rollback via git reset",
      ],
      answer: "Two identical environments; traffic switches to the new one after verification",
    },
    {
      question: "What is canary deployment?",
      options: [
        "Gradual rollout of a new version to a small share of traffic",
        "Deploy only on weekends",
        "Rollback by deleting the cluster",
        "Replacing CI with CD",
      ],
      answer: "Gradual rollout of a new version to a small share of traffic",
      explanation: "Reduces risk: errors are visible to a small audience before full rollout.",
    },
    {
      question: "Why cache dependencies in a CI pipeline?",
      options: [
        "Speed up repeated builds and reduce load on the registry",
        "Store secrets between jobs",
        "Disable tests",
        "Replace artifact storage",
      ],
      answer: "Speed up repeated builds and reduce load on the registry",
    },
    {
      question: "What is a deployment gate (manual approval)?",
      options: [
        "A point in the pipeline where a person approves promotion to prod",
        "Automatic unconditional rollback",
        "Secret in plain text",
        "A type of unit test",
      ],
      answer: "A point in the pipeline where a person approves promotion to prod",
      explanation: "Often used for regulated or high-risk environments.",
    },
    {
      question: "List three practices to speed up the feedback loop in CI.",
      options: [
        "Parallel jobs, dependency caching, fast unit tests at early stages.",
        "Run all stages sequentially with no cache.",
        "Deploy first and test in production only.",
        "Disable pipelines to reduce CI cost.",
      ],
      answer: "Parallel jobs, dependency caching, fast unit tests at early stages.",
    },
  ],
}

export default translation
