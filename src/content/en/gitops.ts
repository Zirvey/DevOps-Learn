import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: "GitOps and ArgoCD",
  duration: "4–5 hours",
  description: "GitOps principles, installation and use of ArgoCD, sync policies, App of Apps, multi-environment",
  sections: [
    {
      title: "What is GitOps",
      content: "**GitOps** is an operating model where the Git repository is the **single source of truth** for infrastructure and applications.\n\n**Definition (Weaveworks, 2017):**\n> GitOps is a way to implement Continuous Deployment for cloud-native applications. GitOps uses Git as the single source of truth for declarative infrastructure and applications.\n\n**Key idea:** if the state of the cluster differs from what is described in Git, the system automatically (or upon request) brings the cluster to the desired state.\n\n**GitOps vs traditional CI/CD:**\n| | Traditional CD | GitOps |\n|---|---|---|\n| Deployment trigger | CI pipeline (push model) | Change in Git (pull model) |\n| Who deploys | CI server (kubectl/helm) | Agent in a cluster (ArgoCD) |\n| Source of truth | CI config + K8s | Git repository |\n| Rollback | Restarting the pipeline | Git revert |\n| Audit | CI logs | Git history |",
    },
    {
      title: "Four principles of GitOps",
      content: "**1. Declarative**\nThe entire system is described declaratively (YAML manifests K8s, Helm charts, Kustomize). Desired state, not imperative commands.\n\n**2. Versioning in Git**\nThe configuration is stored in Git with a complete history of changes. Each change is a commit with an author, date, and description. Code review via Pull Request.\n\n**3. Automatic application**\nApproved changes in Git are automatically applied to the target system. ArgoCD monitors Git and syncs the cluster.\n\n**4. Continuous reconciliation**\nThe agent in the cluster constantly compares the actual state with the desired state. Any discrepancy (drift) is detected and can be automatically corrected.\n\n```\nDeveloper → git push → Git Repo → ArgoCD detects → Sync to K8s\n                                         ↑\n                              Continuous reconciliation\n```",
    },
    {
      title: "Push vs Pull deployment model",
      content: "**Push model (traditional CI/CD):**\n\n```\nCI Server ──kubectl apply──→ Kubernetes Cluster\n```\n\n- CI server has cluster credentials (kubeconfig)\n- CI “pushes” changes to the cluster\n- Risk: CI compromise = cluster access\n- Many CI servers → many access points\n\n**Pull model (GitOps):**\n\n```\nGit Repo ←──watch── ArgoCD Agent (inside cluster) ──apply──→ K8s\n```\n\n- The agent **inside** the cluster itself takes changes from Git\n- CI only updates Git (image tag, manifests)\n- Cluster credentials do not leave the cluster\n- One agent, one source of truth\n\n**Benefits of Pull:**\n- Security - no external access to the cluster API\n- Reliability - the agent works even if CI is unavailable\n- Audit - all changes via Git\n- Rollback — git revert = deployment rollback",
    },
    {
      title: "ArgoCD: architecture",
      content: "**ArgoCD** is a declarative GitOps continuous delivery tool for Kubernetes.\n\n**Components:**\n| Component | Destination |\n|-----------|-----------|\n| **API Server** | REST/gRPC API, Web UI, CLI |\n| **Repository Server** | Git cloning, manifest generation (Helm, Kustomize) |\n| **Application Controller** | Comparison desired vs live state, sync |\n| **Redis** | Caching |\n| **Dex** (optional) | SSO authentication |\n\n**Application CRD** is the main ArgoCD resource:\n\n```\n\nyaml\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: my-app\nspec:\n  source:\n    repoURL: https://github.com/org/k8s-manifests\n    path: apps/my-app\n    targetRevision: main\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: production\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true\n```\n\nArgoCD is installed **inside** a Kubernetes cluster.",
    },
    {
      title: "Installing ArgoCD",
      content: "**Installation in Kubernetes (production):**",
      code: {
        language: "bash",
        code: "# Создать namespace\nkubectl create namespace argocd\n\n# Установить ArgoCD\nkubectl apply -n argocd -f \\\n  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml\n\n# Дождаться готовности\nkubectl wait --for=condition=available deployment --all \\\n  -n argocd --timeout=300s\n\n# Получить начальный пароль admin\nkubectl -n argocd get secret argocd-initial-admin-secret \\\n  -o jsonpath=\"{.data.password}\" | base64 -d\n\n# Port-forward для доступа к UI\nkubectl port-forward svc/argocd-server -n argocd 8080:443\n\n# Установить CLI\nbrew install argocd  # macOS\n# или\ncurl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64\nchmod +x argocd && sudo mv argocd /usr/local/bin/\n\n# Логин\nargocd login localhost:8080 --username admin --insecure",
        caption: "Installing ArgoCD and CLI",
      },
    },
    {
      title: "Creating an Application",
      content: "**Via CLI:**\n\n```\n\nbash\nargocd app create my-app \\\n  --repo https://github.com/org/k8s-manifests.git \\\n  --path apps/my-app/overlays/production \\\n  --dest-server https://kubernetes.default.svc \\\n  --dest-namespace production \\\n  --sync-policy automated\n```\n\n**Via YAML (recommended - Application in Git):**\nApplication CRD is stored in Git → ArgoCD manages itself (bootstrap).\n\n**Git repository structure for GitOps:**\n\n```\nk8s-manifests/\n├── apps/\n│   ├── my-app/\n│   │   ├── base/\n│   │   │   ├── deployment.yaml\n│   │   │   ├── service.yaml\n│   │   │   └── kustomization.yaml\n│   │   └── overlays/\n│   │       ├── staging/\n│   │       └── production/\n│   └── another-app/\n├── infrastructure/\n│   ├── ingress-nginx/\n│   └── cert-manager/\n└── argocd/\n    ├── applications/\n    └── projects/\n```",
      code: {
        language: "yaml",
        code: "apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: my-app\n  namespace: argocd\n  finalizers:\n    - resources-finalizer.argocd.argoproj.io\nspec:\n  project: default\n  source:\n    repoURL: https://github.com/myorg/k8s-manifests.git\n    targetRevision: main\n    path: apps/my-app/overlays/production\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: production\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true\n    syncOptions:\n      - CreateNamespace=true\n    retry:\n      limit: 5\n      backoff:\n        duration: 5s\n        factor: 2\n        maxDuration: 3m",
        caption: "Application CRD with automated sync",
      },
    },
    {
      title: "Sync Policies",
      content: "**Sync Policy** determines how ArgoCD applies changes.\n\n**Manual sync (default):**\n- ArgoCD detects drift, but waits for manual confirmation\n- Suitable for production with review\n\n**Automated sync:**\n\n```\n\nyaml\nsyncPolicy:\n  automated:\n    prune: true      # удалять ресурсы, убранные из Git\n    selfHeal: true   # откатывать ручные изменения в кластере\n    allowEmpty: false\n```\n\n**sync options:**\n| Option | Description |\n|-------|----------|\n| `CreateNamespace=true` | Create namespace if does not exist |\n| `PruneLast=true` | Delete resources after creating new ones |\n| `ApplyOutOfSyncOnly=true` | Apply only changed resources |\n| `ServerSideApply=true` | Server-side apply (K8s 1.22+) |\n\n**Sync phases:**\n1. **Pre-sync** — hooks before synchronization (database migration)\n2. **Sync** - applying manifests\n3. **Post-sync** - hooks after (smoke tests)\n4. **Sync fail** - rollback hooks\n\n**Retry policy** - automatic retries in case of sync errors.",
    },
    {
      title: "Health Checks and Sync Status",
      content: "ArgoCD monitors **three states** of each Application:\n\n**Sync Status:**\n| Status | Meaning |\n|--------|----------|\n| Synced | Cluster conforms to Git |\n| OutOfSync | There are discrepancies |\n\n**Health Status:**\n| Status | Meaning |\n|--------|----------|\n| Healthy | All resources are working |\n| Progress | Rolling update in progress |\n| Degraded | Problems (pod crash, failed probe) |\n| Missing | Resource not found |\n| Suspended | Suspended (CronJob) |\n\n**App Status in UI:**\n- 🟢 Synced + Healthy - everything is fine\n- 🟡 OutOfSync - sync is needed (or auto-sync will work)\n- 🔴 Degraded is a problem, intervention is needed\n\n**CLI:**\n\n```\n\nbash\nargocd app get my-app          # детали\nargocd app diff my-app         # diff Git vs cluster\nargocd app sync my-app         # принудительный sync\nargocd app history my-app      # история деплоев\nargocd app rollback my-app     # откат\n```",
    },
    {
      title: "App of Apps pattern",
      content: "**App of Apps** is a pattern where one ArgoCD Application manages other Applications.\n\n**Why:**\n- Bootstrap the entire cluster from one Git repository\n- Declarative management of all applications\n- Adding new app = new YAML in Git\n\n**Structure:**\n\n```\nargocd/\n├── bootstrap/\n│   └── root-app.yaml      # App of Apps root\n├── applications/\n│   ├── my-app.yaml         # Application CRD\n│   ├── monitoring.yaml\n│   └── ingress.yaml\n└── projects/\n    └── production.yaml\n```\n\n**Root Application:**\n```\n\nyaml\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: root\n  namespace: argocd\nspec:\n  source:\n    repoURL: https://github.com/org/k8s-manifests.git\n    path: argocd/applications\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: argocd\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true\n```\n\nArgoCD reads all YAML in `argocd/applications/` and creates Applications. Each Application deploys its own application.",
      code: {
        language: "yaml",
        code: "# argocd/applications/my-app.yaml\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: my-app\n  namespace: argocd\nspec:\n  project: production\n  source:\n    repoURL: https://github.com/org/k8s-manifests.git\n    path: apps/my-app/overlays/production\n    targetRevision: main\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: production\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true",
        caption: "Application in App of Apps",
      },
    },
    {
      title: "Multi-environment with Kustomize",
      content: "**Kustomize** is a tool built into ArgoCD for managing configuration by environment.\n\n**Structure:**\n\n```\napps/my-app/\n├── base/\n│   ├── deployment.yaml\n│   ├── service.yaml\n│   └── kustomization.yaml\n└── overlays/\n    ├── dev/\n    │   ├── kustomization.yaml    # replicas: 1\n    │   └── patch-replicas.yaml\n    ├── staging/\n    │   └── kustomization.yaml    # replicas: 2\n    └── production/\n        ├── kustomization.yaml    # replicas: 5\n        └── patch-resources.yaml\n```\n\n**base/kustomization.yaml:**\n```\n\nyaml\napiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nresources:\n  - deployment.yaml\n  - service.yaml\n```\n\n**overlays/production/kustomization.yaml:**\n```\n\nyaml\napiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nresources:\n  - ../../base\nreplicas:\n  - name: my-app\n    count: 5\npatches:\n  - path: patch-resources.yaml\nimages:\n  - name: my-app\n    newTag: v1.2.3\n```\n\n**CI/CD + GitOps flow:**\n1. CI builds Docker image → push to registry\n2. CI updates `newTag` in overlay → commit in Git\n3. ArgoCD detects change → sync → deploy",
    },
    {
      title: "Helm with ArgoCD",
      content: "ArgoCD natively supports **Helm charts** as a source.\n\n**From the Helm repository:**\n\n```\n\nyaml\nsource:\n  repoURL: https://charts.bitnami.com/bitnami\n  chart: nginx\n  targetRevision: 15.0.0\n  helm:\n    values: |\n      replicaCount: 3\n      service:\n        type: ClusterIP\n```\n\n**From Git (Helm chart in repository):**\n\n```\n\nyaml\nsource:\n  repoURL: https://github.com/org/charts.git\n  path: charts/my-app\n  helm:\n    valueFiles:\n      - values-production.yaml\n    parameters:\n      - name: image.tag\n        value: v1.2.3\n```\n\n**Helm vs Kustomize in GitOps:**\n| | Helm | Customize |\n|---|------|-----------|\n| Templating | Go templates | Patches, overlays |\n| Parameterization | values.yaml | overlays |\n| Ecosystem | Charts hub | Built into kubectl |\n| Difficulty | Above | Below |\n\nFor GitOps, they often use **Kustomize** (simpler, native) or **Helm** (richer ecosystem).",
    },
    {
      title: "ArgoCD Projects and RBAC",
      content: "**AppProject** - logical grouping of Applications with access policies.\n\n```\n\nyaml\napiVersion: argoproj.io/v1alpha1\nkind: AppProject\nmetadata:\n  name: production\n  namespace: argocd\nspec:\n  description: Production applications\n  sourceRepos:\n    - https://github.com/org/*\n  destinations:\n    - namespace: production\n      server: https://kubernetes.default.svc\n  clusterResourceWhitelist:\n    - group: ''\n      kind: Namespace\n  namespaceResourceWhitelist:\n    - group: 'apps'\n      kind: Deployment\n```\n\n**RBAC in ArgoCD:**\n- Built-in RBAC policy (CSV in ConfigMap)\n- SSO via Dex (GitHub, GitLab, LDAP, SAML)\n- Roles: admin, developer, readonly\n\n```\n\ncsv\np, role:developer, applications, sync, production/*, allow\np, role:developer, applications, get, */*, allow\ng, my-team, role:developer\n```\n\n**Principle:** each team is its own AppProject with limited access to namespace and repositories.",
    },
    {
      title: "CI/CD integration with GitOps",
      content: "**Full flow: CI (GitHub Actions) + GitOps (ArgoCD):**\n\n```\nDeveloper push → GitHub Actions:\n  1. Lint + Test\n  2. Build Docker image\n  3. Push to registry\n  4. Update image tag in k8s-manifests repo\n     (yq or kustomize edit set image)\n  → ArgoCD detects change → Auto-sync → Deploy\n```\n\n**CI does NOT do kubectl/helm** - only updates Git.\n\n**Updating image tag in CI:**",
      code: {
        language: "yaml",
        code: "# GitHub Actions step: update image tag\n- name: Update image tag in GitOps repo\n  run: |\n    git clone https://github.com/org/k8s-manifests.git\n    cd k8s-manifests\n    cd apps/my-app/overlays/production\n    kustomize edit set image my-app=ghcr.io/org/my-app:${{ github.sha }}\n    git config user.name \"github-actions\"\n    git config user.email \"actions@github.com\"\n    git add .\n    git commit -m \"deploy: my-app ${{ github.sha }}\"\n    git push",
        caption: "CI updates tag → ArgoCD deploys",
      },
    },
    {
      title: "Rollback and disaster recovery",
      content: "**Rollback in GitOps = git revert:**\n\n```\n\nbash\n# Посмотреть историю\nargocd app history my-app\n\n# Откат к предыдущей ревизии\nargocd app rollback my-app 2\n\n# Или через Git\ngit revert HEAD\ngit push\n# → ArgoCD auto-sync → откат в кластере\n```\n\n**Advantages of GitOps rollback:**\n- Instant - ArgoCD sync in seconds\n- Audited - git log shows who and when\n- Predictable - exactly known previous state\n- No CI pipeline needed for rollback\n\n**Disaster recovery:**\n- Cluster destroyed → create a new one → install ArgoCD → point to Git → everything is restored\n- Git = backup of the entire configuration\n\n**Self-heal:**\n\n```\n\nyaml\nsyncPolicy:\n  automated:\n    selfHeal: true\n```\n\nSomeone manually changed the deployment in the cluster → ArgoCD will automatically return to the Git state.",
    },
    {
      title: "Best practices GitOps",
      content: "**1. One repository or several?**\n- **Monorepo** - all manifests in one repo (easier for small teams)\n- **Multirepo** - app code + infra repo (separation of responsibilities)\n\n**2. Trunk-based for manifests**\n- main = production, overlays for environments\n- PR review for infrastructure changes\n\n**3. Don't keep secrets in Git**\n- Sealed Secrets, External Secrets Operator, SOPS\n- ArgoCD supports encrypted values\n\n**4. App of Apps for bootstrap**\n- One root Application controls everything\n\n**5. ArgoCD monitoring**\n- Prometheus metrics (built-in)\n- Alerts for Degraded / OutOfSync\n- Notification services (Slack, email)\n\n**6. Progressive delivery**\n- Argo Rollouts for canary/blue-green\n- Integration with Prometheus for canary analysis\n\n**7. Policy enforcement**\n- OPA/Gatekeeper for manifest validation\n- ArgoCD Pre-sync hooks for checks",
    },
  ],
  practice: [
    "Install ArgoCD in minikube/kind and get access to the Web UI",
    "Create a Git repository k8s-manifests with a base/overlays structure (dev, staging, production)",
    "Create an ArgoCD Application for nginx deployment with automated sync and selfHeal",
    "App of Apps setup: root Application manages multiple apps",
    "Change the deployment manually in the cluster (kubectl edit) and observe the self-heal ArgoCD",
    "Integrate with GitHub Actions: CI updates image tag → ArgoCD deploy",
    "Run rollback via argocd app rollback and via git revert - compare",
    "Setting up Kustomize overlays with different numbers of replicas for dev and production",
  ],
  resources: [
    { title: "ArgoCD Docs", url: "https://argo-cd.readthedocs.io" },
    { title: "GitOps Principles", url: "https://opengitops.dev" },
  ],
  quiz: [
    {
      question: "What is the essence of GitOps?",
      options: [
        "The desired state in Git is a single source of truth, the controller synchronizes the cluster",
        "Deploy only via SSH manually",
        "Storing logs in Git",
        "Opting out of CI",
      ],
      answer: "The desired state in Git is a single source of truth, the controller synchronizes the cluster",
    },
    {
      question: "What tools are often used for GitOps in Kubernetes?",

      options: [
        "Argo CD, Flux (and analogues).",
        "Only kubectl apply without a sync controller",
        "Jenkins and TeamCity for deploying from Git",
        "Terraform only without tying to a Kubernetes cluster",
      ],
      answer: "Argo CD, Flux (and analogues).",
    },
    {
      question: "What does drift mean in GitOps?",
      options: [
        "Discrepancy between the live state of the cluster and manifests in Git",
        "Increased network latency",
        "CPU drop on node",
        "TLS certificate expiration",
      ],
      answer: "Discrepancy between the live state of the cluster and manifests in Git",
    },
    {
      question: "Why is pull-based deployment preferable to push in some scenarios?",
      options: [
        "The agent in the cluster itself pulls changes, there are fewer external credentials with write access",
        "Push is always faster",
        "Pull doesn't require Git",
        "Push is safer for production",
      ],
      answer: "The agent in the cluster itself pulls changes, there are fewer external credentials with write access",
    },
    {
      question: "How to organize promotion between dev/stage/prod in GitOps?",
      options: [
        "Separate branches/directories/overlay (Kustomize) or updating the image tag via PR.",
        "kubectl apply directly on production clusters from laptops.",
        "Store secrets in plain text in the main branch.",
        "Disable pull requests for faster deploys.",
      ],
      answer: "Separate branches/directories/overlay (Kustomize) or updating the image tag via PR.",
    },
    {
      question: "What does Argo CD do when sync?",
      options: [
        "Sets the cluster resources to the state from Git",
        "Builds Docker images",
        "Creates EC2 instances via console",
        "Removes default namespace",
      ],
      answer: "Sets the cluster resources to the state from Git",
    },
    {
      question: "What is the app-of-apps pattern in Argo CD?",
      options: [
        "Root Application manages other Applications from Git",
        "One Pod runs all microservices",
        "Monorepo without branches",
        "Way to store Docker images",
      ],
      answer: "Root Application manages other Applications from Git",
      explanation: "Simplifies cluster bootstrap and managing multiple applications.",
    },
    {
      question: "Why use a separate repo for manifests in GitOps?",
      options: [
        "Separate application lifecycle from desired infrastructure state",
        "Speed up git clone 100x",
        "Bypass Kubernetes RBAC",
        "Must store binaries in Git LFS",
      ],
      answer: "Separate application lifecycle from desired infrastructure state",
    },
    {
      question: "What does auto-sync in Argo CD mean?",
      options: [
        "Automatic application of changes from Git without manual sync",
        "Automatic merge to main without review",
        "Remove drift without logs",
        "Build images in cluster",
      ],
      answer: "Automatic application of changes from Git without manual sync",
      explanation: "Convenient for dev; in prod often keep manual sync or approval.",
    },
    {
      question: "How to safely update an image tag in GitOps without a direct push to main?",
      options: [
        "Via PR updating values/manifest with review; CI can open a PR after a successful image build.",
        "Push directly to main without review.",
        "kubectl set image on production from a laptop.",
        "Edit cluster state only with helm delete.",
      ],
      answer: "Via PR updating values/manifest with review; CI can open a PR after a successful image build.",
    },
  ],
}

export default translation
