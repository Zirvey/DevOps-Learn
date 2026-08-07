import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `Interviews: 35+ questions with answers`,
  duration: `4–6 hours`,
  description: `35+ typical DevOps interview questions with detailed answers: Linux, Docker, K8s, CI/CD, AWS, networking`,
  sections: [
    {
      title: `1. What happens when you run curl https://google.com?`,
      content: `**Full request path:**

1. **DNS Resolution** — curl calls \`getaddrinfo("google.com")\`. The resolver checks /etc/resolv.conf → DNS server (8.8.8.8 or ISP). DNS returns an A-record (IP address).

2. **TCP Handshake** — SYN → SYN-ACK → ACK on port 443.

3. **TLS Handshake** — ClientHello → ServerHello → Certificate → Key Exchange → Finished. Certificate validation (CA chain, expiry, hostname).

4. **HTTP Request** — \`GET / HTTP/1.1\\nHost: google.com\\n...\`

5. **Server Processing** — Google LB → backend server → response.

6. **HTTP Response** — 301/302 redirect or 200 OK with HTML.

7. **Connection close** — TLS close_notify, TCP FIN.

**For DevOps this matters:** DNS (dig), TCP (tcpdump), TLS (openssl s_client), HTTP (curl -v).`,
    },
    {
      title: `2. What is the difference between CMD and ENTRYPOINT in Docker?`,
      content: `**ENTRYPOINT** — the main executable of the container (immutable “what to run”).
**CMD** — default arguments to ENTRYPOINT (easy to override).

\`\`\`dockerfile
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
# docker run myimage -g "daemon on;"  → nginx -g "daemon on;"
\`\`\`

If only CMD is set — it becomes the process.
If both are set — CMD is arguments to ENTRYPOINT.
\`docker run image args\` overrides CMD, not ENTRYPOINT (unless \`--entrypoint\`).

**Best practice:** ENTRYPOINT for the binary, CMD for default flags.`,
    },
    {
      title: `3. What happens if a pod crashes? How does a Deployment handle it?`,
      content: `**Deployment** owns a **ReplicaSet**, which owns **Pods**.

If a pod crashes (CrashLoop, OOMKilled, node failure):
1. kubelet / controller notices the pod is not Running
2. ReplicaSet sees \`replicas < desired\`
3. Creates a new pod to replace it
4. Self-healing without manual intervention

**livenessProbe** — if it fails, kubelet restarts the container.
**readinessProbe** — if it fails, the pod is removed from Service endpoints (traffic stops, no restart).

\`restartPolicy: Always\` (default for Deployments) — always restart.`,
    },
    {
      title: `4. How do you roll back a bad deploy in Kubernetes?`,
      content: `**Ways to roll back:**

\`\`\`bash
# Roll back to the previous revision
kubectl rollout undo deployment/my-app

# Roll back to a specific revision
kubectl rollout history deployment/my-app
kubectl rollout undo deployment/my-app --to-revision=3

# Status
kubectl rollout status deployment/my-app
\`\`\`

**Helm:**
\`\`\`bash
helm rollback my-release 1
\`\`\`

**Best practices:** keep revisionHistoryLimit > 0, use readiness probes so a bad deploy does not receive traffic, prefer canary/blue-green for critical services.`,
    },
    {
      title: `5. What is Terraform state? Why use a remote backend?`,
      content: `**Terraform state** is a JSON file mapping resources in code to real IDs in the cloud (plus metadata and dependencies).

Without state Terraform does not know what already exists and may try to recreate everything.

**Remote backend (S3 + DynamoDB):**
- Shared state for the team
- Locking (no parallel apply)
- Encryption and versioning
- CI/CD can apply safely

**Never** commit state to Git (secrets!). Use a remote backend and \`*.tfstate*\` in \`.gitignore\`.`,
    },
    {
      title: `6. The site is down — where do you start diagnosis?`,
      content: `**Systematic checklist:**

1. **Confirm** — real outage or false positive? Status page, synthetics, users
2. **Scope** — all users / region / one endpoint? When did it start?
3. **Recent changes** — deploy in last 30 min? → rollback first
4. **Metrics** — RED (rate, errors, duration), USE (CPU/mem/disk)
5. **Logs** — ERROR/FATAL, OOMKilled, timeouts
6. **Dependencies** — DB, cache, external APIs, DNS, LB

Rule: **mitigate first** (rollback/scale), then dig into root cause.`,
    },
    {
      title: `7. Difference between ReplicaSet and Deployment in Kubernetes?`,
      content: `**ReplicaSet** — maintains N copies of a pod (desired replicas).
**Deployment** — a higher-level object that manages ReplicaSets and provides:
- Rolling updates
- Rollback
- Declarative updates of the pod template
- Revision history

In practice you almost always use **Deployment**; ReplicaSet is an implementation detail (except rare special cases).`,
    },
    {
      title: `8. What is an inode and what happens when they run out?`,
      content: `**inode** — a filesystem metadata structure: permissions, owner, timestamps, pointers to data blocks. Each file/directory consumes one inode.

**If inodes run out** — you cannot create new files even with free disk space (\`No space left on device\`).

\`\`\`bash
df -i          # inode usage
find / -xdev -type f | wc -l
\`\`\`

Common cause: millions of small files (caches, logs, mail spool). Fix: delete files, raise inode count when creating the FS, or change layout.`,
    },
    {
      title: `9. Explain the difference between TCP and UDP`,
      content: `**TCP** — connection-oriented, reliable, ordered delivery, congestion control. HTTP, SSH, databases.

**UDP** — connectionless, no delivery guarantee, low overhead. DNS, video/VoIP, gaming, metrics (often).

| | TCP | UDP |
|---|-----|-----|
| Connection | Handshake | No |
| Reliability | ACKs, retransmit | Best-effort |
| Order | Guaranteed | Not guaranteed |
| Speed | Higher overhead | Faster/lighter |

Choose TCP when correctness matters; UDP when latency and simplicity matter.`,
    },
    {
      title: `10. How does Docker networking work?`,
      content: `**Docker networking modes:**
- **bridge** (default) — virtual network on the host, NAT to the outside
- **host** — container shares the host network stack
- **none** — no network
- **overlay** — multi-host (Swarm/K8s CNI related concepts)

Containers on the same bridge reach each other by name (embedded DNS in user-defined networks).
Ports: \`-p host:container\` publishes to the host.

In Compose, services on one network resolve by service name.`,
    },
    {
      title: `11. What is CI/CD? Explain a pipeline`,
      content: `**CI (Continuous Integration)** — frequently merge code, automatically build and test.
**CD (Continuous Delivery/Deployment)** — automatically deliver to environments (with or without manual approve).

**Typical pipeline:**
1. Lint / static analysis
2. Unit tests
3. Build artifact / Docker image
4. Security scan (SAST, Trivy)
5. Push to registry
6. Deploy to staging
7. Integration / e2e tests
8. Deploy to production (manual gate or auto)

Tools: GitHub Actions, GitLab CI, Jenkins, Tekton.`,
    },
    {
      title: `12. Difference between symmetric and asymmetric encryption?`,
      content: `**Symmetric** — one shared key for encrypt/decrypt (AES). Fast; key distribution is hard.
**Asymmetric** — key pair public/private (RSA, ECDSA). Public encrypts / verifies; private decrypts / signs.

TLS uses both: asymmetric to exchange a session key, then symmetric for bulk data.

**DevOps angle:** secrets management, TLS certs, SSH keys, signing images (cosign).`,
    },
    {
      title: `13. What is load balancing? Types of load balancers?`,
      content: `**Load balancing** — distribute traffic across multiple backends for scale and HA.

**Types:**
- **L4 (NLB)** — TCP/UDP, ultra-low latency
- **L7 (ALB)** — HTTP path/host routing, TLS termination
- **DNS round-robin** — simple, coarse
- **Client-side** — app chooses backend

Algorithms: round-robin, least connections, IP hash (sticky).

Health checks remove unhealthy targets.`,
    },
    {
      title: `14. Explain the CAP theorem`,
      content: `**CAP theorem** — in a distributed system you can strongly guarantee only two of three:
- **Consistency** — all nodes see the same data
- **Availability** — every request gets a response
- **Partition tolerance** — system works despite network splits

Under partition you choose CP (e.g. etcd, ZooKeeper) or AP (e.g. Dynamo-style). CA without P is unrealistic on real networks.

Useful interview framing; real systems make nuanced trade-offs (tunable consistency).`,
    },
    {
      title: `15. How do Git merge vs rebase work?`,
      content: `**merge** — combines histories; creates a merge commit (unless fast-forward). Preserves full branch history.

**rebase** — replays your commits on top of another base. Linear history; rewrites commit SHAs.

\`\`\`bash
git checkout feature
git rebase main      # move feature onto latest main
git checkout main
git merge feature    # fast-forward often
\`\`\`

**Rule:** do not rebase shared/public commits others already pulled. Interactive rebase is fine for local cleanup.`,
    },
    {
      title: `16. What is Infrastructure as Code? Benefits?`,
      content: `**IaC** — manage infrastructure via code (Terraform, CloudFormation, Pulumi, Ansible for config).

**Benefits:**
- Versioning and PR review
- Reproducible environments
- Faster provisioning
- Less drift / snowflake servers
- Automation in CI/CD

Declarative (Terraform) vs imperative (Ansible) — often used together.`,
    },
    {
      title: `17. Difference between horizontal and vertical scaling?`,
      content: `**Vertical scaling** — bigger machine (more CPU/RAM). Limits: hardware ceiling, downtime for resize.

**Horizontal scaling** — more instances behind a load balancer. Needs stateless apps (or shared state), better for cloud elasticity.

K8s HPA / ASG = horizontal. Resizing an RDS instance class = vertical.`,
    },
    {
      title: `18. What is DNS? Record types?`,
      content: `**DNS** maps names to records (usually IPs).

**Common record types:**
- **A / AAAA** — IPv4 / IPv6
- **CNAME** — alias to another name
- **MX** — mail servers
- **TXT** — SPF/DKIM/verification
- **NS** — name servers
- **SRV** — service discovery

Resolution: stub resolver → recursive resolver → root → TLD → authoritative.

**DevOps tools:** \`dig\`, \`nslookup\`, Route 53, CoreDNS.`,
    },
    {
      title: `19. How does SSH work? What is key-based auth?`,
      content: `**SSH** — encrypted remote shell (and tunneling/SCP).

**Key-based auth:**
1. Client has private key; server has public key in \`authorized_keys\`
2. Challenge-response proves possession of private key
3. No password over the network

\`\`\`bash
ssh-keygen -t ed25519
ssh-copy-id user@host
\`\`\`

Harden: disable password auth, disable root login, use bastion/SSM, short-lived certs.`,
    },
    {
      title: `20. What is caching? Invalidation strategies?`,
      content: `**Caching** stores expensive results closer to the consumer (memory, CDN, Redis).

**Invalidation strategies:**
- **TTL** — expire after time
- **Write-through / write-back**
- **Cache-aside** — app reads cache, on miss loads DB and fills cache
- **Explicit invalidate** on update
- **Event-driven** purge

Problems: stale data, thundering herd, cache stampede — use soft TTL, locking, or request coalescing.`,
    },
    {
      title: `21. Explain the difference between a process and a thread`,
      content: `**Process** — isolated execution with its own address space, PID, resources.
**Thread** — lighter unit of execution inside a process; shares memory with sibling threads.

Processes: safer isolation, higher overhead (IPC).
Threads: cheaper concurrency, need synchronization (mutexes) to avoid races.

Containers usually isolate processes; apps may be multi-threaded inside.`,
    },
    {
      title: `22. What is a reverse proxy? Why nginx?`,
      content: `**Reverse proxy** — sits in front of backends; clients talk to the proxy.

**nginx roles:** TLS termination, load balancing, static files, caching, rate limiting, path routing.

Unlike a forward proxy (client-side), a reverse proxy represents the server side.

Alternatives: Envoy, Traefik, HAProxy, cloud ALB.`,
    },
    {
      title: `23. How does a Kubernetes Service work? Types?`,
      content: `**Service** provides a stable virtual IP (ClusterIP) and DNS name for a set of pods selected by labels.

**Types:**
- **ClusterIP** — internal only (default)
- **NodePort** — expose on each node IP:port
- **LoadBalancer** — cloud LB (ALB/NLB via controller)
- **ExternalName** — DNS CNAME to external service

Endpoints/EndpointSlices track ready pod IPs. Combined with Ingress for HTTP routing.`,
    },
    {
      title: `24. What is Prometheus? How does it collect metrics?`,
      content: `**Prometheus** — pull-based metrics TSDB + PromQL.

**Collection:** scrapes HTTP \`/metrics\` endpoints on an interval (exporters, apps, k8s SD).

Stores time series with labels. Alertmanager handles routing. Grafana visualizes.

Cardinality (too many unique label sets) is the main operational risk.`,
    },
    {
      title: `25. Difference between Ansible, Terraform, and Kubernetes?`,
      content: `**Terraform** — provision cloud infrastructure (declarative IaC, state).
**Ansible** — configure OS/apps over SSH (procedural, agentless).
**Kubernetes** — orchestrate containers (scheduling, self-healing, scaling).

Typical flow: Terraform creates VPC/EKS → Ansible or cloud-init bootstraps nodes (less common on EKS) → Kubernetes runs workloads. They complement, not replace, each other.`,
    },
    {
      title: `26. What are SLI, SLO, SLA?`,
      content: `**SLI** — Service Level Indicator (measurable signal: availability, latency).
**SLO** — Service Level Objective (target for an SLI, e.g. 99.9%).
**SLA** — Service Level Agreement (contract with consequences if broken).

Error budget = 1 − SLO. Use it to balance velocity vs reliability.`,
    },
    {
      title: `27. How does an SSL/TLS certificate work?`,
      content: `**TLS handshake** establishes encryption and authenticates the server (and optionally the client).

Certificate: public key + identity + CA signature.
Client verifies: chain of trust, expiry, hostname (SAN).

**In practice:** ACM/Let’s Encrypt for certs, TLS on ALB/Ingress, HTTPS everywhere, HSTS.`,
    },
    {
      title: `28. What is a message queue? Why Kafka/RabbitMQ/SQS?`,
      content: `**Message queue** — asynchronous communication between producers and consumers.

**Why:** decoupling, buffering spikes, retries, fan-out.

- **RabbitMQ** — classic broker, flexible routing
- **Kafka** — log/stream, high throughput, replay
- **SQS** — managed AWS queue, simple and durable

Choose based on ordering, throughput, retention, and ops cost.`,
    },
    {
      title: `29. Explain stateful vs stateless applications`,
      content: `**Stateless** — each request is independent; state lives in DB/cache. Easy to scale horizontally.

**Stateful** — instance keeps local state (sessions on disk, sticky data). Harder to move/scale; needs volumes, sticky sessions, or leader election.

Prefer stateless app tiers; push state to managed stores (RDS, Redis).`,
    },
    {
      title: `30. What is GitOps?`,
      content: `**GitOps** — desired system state declared in Git; an agent (Argo CD, Flux) continuously reconciles the cluster to match Git.

Benefits: audit trail, PRs for changes, easy rollback (\`git revert\`), drift detection.

Git is the source of truth for deployable config.`,
    },
    {
      title: `31. How does an AWS Auto Scaling Group work?`,
      content: `**ASG** manages a fleet of EC2 instances:
- Min / desired / max capacity
- Launch template (AMI, type, SG)
- Scaling policies (CPU, ALB requests, custom metrics)
- Health checks (EC2 or ELB) replace unhealthy instances

Integrates with ALB target groups. Spot + mixed instances for cost savings.`,
    },
    {
      title: `32. What is container orchestration? Why Kubernetes?`,
      content: `**Container orchestration** schedules and manages containers across machines: placement, restarts, scaling, networking, config.

**Why Kubernetes:** declarative API, huge ecosystem, multi-cloud skill transfer, self-healing, rolling updates, service discovery.

Alternatives: ECS, Nomad, Swarm (less common now).`,
    },
    {
      title: `33. Difference between blue-green and canary deployment?`,
      content: `**Blue-green** — two full environments; switch traffic at once (LB/DNS). Fast rollback; needs 2× resources.

**Canary** — send a small % of traffic to the new version, then ramp up. Cheaper, detects issues early; needs metrics and progressive delivery (Flagger, Argo Rollouts).

Both beat “deploy to all at once” for production risk.`,
    },
    {
      title: `34. What is systemd? How do you manage services?`,
      content: `**systemd** — init system and service manager on modern Linux.

\`\`\`bash
systemctl status nginx
systemctl start|stop|restart|reload nginx
systemctl enable nginx   # start on boot
journalctl -u nginx -f
\`\`\`

Unit files in \`/etc/systemd/system/\`. Prefer systemd over ad-hoc nohup for daemons.`,
    },
    {
      title: `35. How would you design CI/CD for a team of 10 developers?`,
      content: `**Design sketch for 10 developers:**

1. **Monorepo or multi-repo** with protected \`main\`
2. **PR checks:** lint, unit tests, SAST, build
3. **Environments:** dev (auto), staging (auto), prod (approve)
4. **Artifacts:** versioned images in ECR/GHCR
5. **Deploy:** GitOps (Argo CD) or pipeline apply with Helm
6. **Preview envs** optional for PRs
7. **Observability + rollback** required before prod auto-promote
8. **Secrets** via vault/OIDC — no long-lived keys in CI

Focus on fast feedback (<15 min CI) and safe prod (canary, health checks).`,
    },
    {
      title: `36. What are /proc and /sys in Linux?`,
      content: `**Virtual filesystems** — interfaces to kernel data structures. They do not consume disk space like normal files.

**/proc** — process and system information:
- \`/proc/cpuinfo\` — CPU info
- \`/proc/meminfo\` — memory usage
- \`/proc/PID/\` — per-process info (status, cmdline, fd, maps)
- \`/proc/sys/\` — kernel parameters (sysctl)

**/sys** — kernel devices and drivers (sysfs):
- \`/sys/class/net/\` — network interfaces
- \`/sys/block/\` — block devices

DevOps uses them for diagnostics (\`cat /proc/meminfo\`) and tuning (\`sysctl\`).`,
    },
    {
      title: `37. How do you achieve zero-downtime deployment?`,
      content: `**Zero-downtime deployment techniques:**

1. **Rolling update** — replace pods gradually; readiness probes gate traffic
2. **Blue-green** — switch LB when green is healthy
3. **Canary** — ramp traffic with automated abort on bad metrics
4. **DB migrations** — expand/contract (backward-compatible first)
5. **Connection draining** — give in-flight requests time to finish
6. **Graceful shutdown** — handle SIGTERM, stop taking work, finish requests

Avoid: killing all replicas at once, incompatible schema flips, long startup without readiness.`,
    },
  ],
  practice: [
    `Go through all 37 questions out loud, recording your answers`,
    `For each question, write your own example from experience (even from learning)`,
    `Do a mock interview with a friend or AI — 30 min, 10 random questions`,
    `Create Anki/flashcards for weak topics`,
    `Solve 10 tasks from github.com/bregman-arie/devops-exercises`,
    `Prepare a 2-minute “tell me about yourself” for a DevOps role`,
  ],
  resources: [
    { title: `DevOps Exercises`, url: `https://github.com/bregman-arie/devops-exercises` },
    { title: `InterviewBit DevOps`, url: `https://www.interviewbit.com/devops-interview-questions/` },
    { title: `r/devops Wiki`, url: `https://www.reddit.com/r/devops/wiki/index` },
  ],
  quiz: [
    {
      question: `How do you answer “tell me about an incident” using STAR?`,
      options: [
        `Situation, Task, Action, Result — focusing on your actions and the outcome`,
        `Only blame colleagues`,
        `Avoid details`,
        `Talk only about CALMS theory`,
      ],
      answer: `Situation, Task, Action, Result — focusing on your actions and the outcome`,
    },
    {
      question: `What should you ask the interviewer about the team and processes?`,
      options: [
        `On-call, CI/CD maturity, IaC, postmortem culture, expectations for the role in the first 90 days.`,
        `Only salary and vacation days.`,
        `Whether the team uses a specific editor theme.`,
        `How to avoid all production incidents forever.`,
      ],
      answer: `On-call, CI/CD maturity, IaC, postmortem culture, expectations for the role in the first 90 days.`,
    },
    {
      question: `How do you explain Docker vs Kubernetes in an interview?`,
      options: [
        `Docker — package/run containers; K8s — orchestration, scaling, self-healing`,
        `Kubernetes replaces the Linux kernel`,
        `Docker is Windows-only`,
        `They are the same thing`,
      ],
      answer: `Docker — package/run containers; K8s — orchestration, scaling, self-healing`,
    },
    {
      question: `Why clarify requirements in system design?`,
      options: [
        `SLA, RPS, budget, compliance, and timelines change the choice between managed/self-hosted and the architecture.`,
        `Requirements never matter once you pick Kubernetes`,
        `Only the programming language defines the architecture`,
        `Timelines are irrelevant if you use microservices`,
      ],
      answer: `SLA, RPS, budget, compliance, and timelines change the choice between managed/self-hosted and the architecture.`,
    },
    {
      question: `How do you show a blameless culture in an interview?`,
      options: [
        `Tell an incident story focused on improvements, not blame`,
        `Say there were never any mistakes`,
        `Blame only the vendor`,
        `Avoid the topic of incidents`,
      ],
      answer: `Tell an incident story focused on improvements, not blame`,
    },
    {
      question: `Which topics appear most often in junior/middle DevOps interviews?`,

      options: [
        `Linux, networking, Git, CI/CD, Docker/K8s basics, troubleshooting, cloud fundamentals.`,
        `UI design and marketing only`,
        `1C and accounting exclusively`,
        `COBOL and mainframe knowledge only`,
      ],
      answer: `Linux, networking, Git, CI/CD, Docker/K8s basics, troubleshooting, cloud fundamentals.`,
    },
    {
      question: `What do you do if you do not know the answer to a technical question?`,
      options: [
        `Say so honestly, describe your reasoning and related experience`,
        `Invent a confident wrong answer`,
        `Stay silent until the interview ends`,
        `Steer to personal topics`,
      ],
      answer: `Say so honestly, describe your reasoning and related experience`,
    },
    {
      question: `How do you structure an answer to "how would you design CI/CD for a startup"?`,
      options: [
        `Clarify requirements → VCS/branching → build/test → artifacts → deploy stages → observability`,
        `Immediately name one tool without questions`,
        `Only talk about certificates`,
        `Avoid the topic of tests`,
      ],
      answer: `Clarify requirements → VCS/branching → build/test → artifacts → deploy stages → observability`,
      explanation: `Shows systematic thinking and consideration of team context.`,
    },
    {
      question: `What should you ask about on-call in an interview?`,
      options: [
        `Rotation, compensation, page frequency, runbook maturity`,
        `Only salary`,
        `Office color`,
        `Windows version on laptop`,
      ],
      answer: `Rotation, compensation, page frequency, runbook maturity`,
    },
    {
      question: `How do you briefly explain the difference between IaC and configuration management?`,

      options: [
        `IaC (Terraform) provisions infrastructure; CM (Ansible) configures OS and packages on existing hosts.`,
        `IaC and CM are the same; both only install packages.`,
        `IaC configures OS on servers; CM creates VPC and subnet.`,
        `CM is only for containers; IaC is only for databases.`,
      ],
      answer: `IaC (Terraform) provisions infrastructure; CM (Ansible) configures OS and packages on existing hosts.`,
    },
  ],
}

export default translation
