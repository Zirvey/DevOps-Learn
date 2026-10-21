import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Troubleshooting: common production scenarios',
  description:
    'Walkthroughs of real scenarios: CrashLoopBackOff, CI failing on npm ci, nginx 502, disk full, OOM — logs, hypotheses, and step-by-step diagnosis',
  duration: '4–5 hours',
  sections: [
    {
      title: 'A troubleshooting method for DevOps',
      content: `**Goal** — don't guess; shrink the hypothesis space with data.

**Universal algorithm:**
1. **Symptom** — what does the user/monitoring see? (502, pod Restarting, pipeline red)
2. **Scope** — one service or the whole cluster? after which change?
3. **Recent changes** — deploy, config, secret rotation, traffic spike
4. **Logs + metrics + traces** — triangulation
5. **Hypothesis → test → fix → verify**

**Tools by layer:**
| Layer | K8s | VM / Compose |
|-------|-----|--------------|
| Status | \`kubectl get/describe\` | \`systemctl\`, \`docker ps\` |
| Logs | \`kubectl logs\`, events | journald, container logs |
| Metrics | Prometheus, kube-state | node_exporter |
| Network | \`kubectl exec curl\`, NetworkPolicy | \`ss\`, tcpdump, nginx error log |

Keep a **runbook** template: symptom, checks, escalation.`,
    },
    {
      title: 'Scenario: CrashLoopBackOff in Kubernetes',
      content: `**Symptom:** \`kubectl get pods\` → STATUS \`CrashLoopBackOff\`, RESTARTS climbs.

**Typical causes:**
- App crashes on start (exception, missing env)
- **Liveness probe** too aggressive — kills a pod that is not ready yet
- Wrong command/args, read-only filesystem
- OOMKilled (see separate scenario)

**Diagnosis:**
\`\`\`
kubectl describe pod <name> -n <ns>   # Events, exit code, probes
kubectl logs <name> -n <ns> --previous # logs from the crashed container
kubectl get events -n <ns> --sort-by=.lastTimestamp
\`\`\`

**Example Events:**
\`Back-off restarting failed container\`
\`Liveness probe failed: HTTP probe failed with statuscode: 503\`

**Fix patterns:**
- Fix env/configmap/secret
- Relax liveness / add startupProbe
- Increase \`initialDelaySeconds\`

> **Anti-pattern:** only \`kubectl delete pod\` without understanding — the pod recreates with the same error.`,
      code: {
        language: 'yaml',
        caption: 'startupProbe vs liveness (fragment)',
        code: `startupProbe:
  httpGet:
    path: /health
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  periodSeconds: 15`,
      },
    },
    {
      title: 'Scenario: CI fails on npm ci',
      content: `**Symptom:** GitHub Actions / GitLab CI red on the \`npm ci\` step.

**Typical logs:**
\`\`\`
npm ERR! \`npm ci\` can only install packages when your package.json and package-lock.json are in sync
npm ERR! Missing: lodash@4.17.21 from lock file
\`\`\`

**Causes:**
- Changed \`package.json\` without updating the lockfile
- Different npm versions locally vs CI (lockfileVersion)
- Private registry — missing \`.npmrc\` / token in CI
- Corrupted CI cache

**Diagnosis:**
1. Locally: \`npm ci\` in a clean clone
2. Compare \`node -v\` and \`npm -v\` with the CI image
3. Check the \`actions/setup-node\` cache key

**Fix:**
- \`npm install\` locally → commit the lockfile
- Pin Node in \`.nvmrc\` / \`engines\` in package.json
- Secrets for private packages

**Prevention:** branch protection + required CI; pre-commit hook for lockfile sync.`,
      code: {
        language: 'yaml',
        caption: 'CI: pin Node and npm ci',
        code: `- uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
    cache: 'npm'
- run: npm ci --prefer-offline`,
      },
    },
    {
      title: 'Scenario: nginx 502 Bad Gateway',
      content: `**Symptom:** client sees **502**; nginx is up, backend is down or not answering.

**nginx error.log:**
\`\`\`
upstream prematurely closed connection while reading response header from upstream
connect() failed (111: Connection refused) while connecting to upstream
\`\`\`

**Causes:**
- Backend down / crash / still starting
- Wrong upstream host/port (docker network, k8s service name)
- Timeout — backend slower than \`proxy_read_timeout\`
- TLS mismatch between nginx and upstream

**Diagnosis:**
1. \`curl -v http://127.0.0.1:UPSTREAM_PORT/health\` **from the same host** as nginx
2. Check the \`upstream\` block and resolver (for variable upstreams)
3. \`docker compose ps\` / \`kubectl get endpoints\` — are there ready backends?

**Fix:**
- Bring backend up, fix service discovery
- Increase timeouts or optimize the backend
- Add healthchecks to the upstream pool (nginx plus / external LB)

**Metrics:** alert on \`5xx rate\` and \`upstream_connect_time\`.`,
      code: {
        language: 'nginx',
        caption: 'Debug directives (temporary)',
        code: `error_log /var/log/nginx/error.log debug;
proxy_connect_timeout 5s;
proxy_read_timeout 60s;
# upstream app { server app:8000 max_fails=3 fail_timeout=30s; }`,
      },
    },
    {
      title: 'Scenario: disk full (No space left on device)',
      content: `**Symptom:** deploy fails, logs won't write, \`write error\`, pod Evicted.

**Quick checks:**
\`\`\`
df -h
df -i          # inodes exhausted with millions of tiny files
du -xh /var | sort -h | tail -20
\`\`\`

**Frequent culprits:**
- **Docker:** unused images/layers (\`docker system df\`)
- **Logs:** \`/var/log\`, journald without rotation
- **Loki/Prometheus** retention without limits
- **Core dumps**, temp files in /tmp

**K8s:** emptyDir without a limit, PVC without usage monitoring

**Mitigation:**
- Cleanup: \`journalctl --vacuum-size=500M\`, prune docker
- **Alerts** on disk > 80% for 15m
- Log rotation, retention policies

**Prevention:** treat disk as a metric; capacity planning; separate volume for data.`,
      code: {
        language: 'bash',
        code: `sudo journalctl --disk-usage
docker system prune -af   # careful — removes unused images
find /var/log -type f -name '*.gz' -mtime +14 -ls`,
      },
    },
    {
      title: 'Scenario: OOM (Out Of Memory)',
      content: `**Symptom:** process killed; in dmesg/journal: \`Out of memory: Kill process\`; in K8s: \`OOMKilled\`, exit code 137.

**Linux OOM killer** picks a victim by oom_score — often Java/Node without limits.

**K8s:**
\`\`\`
kubectl describe pod | grep -A5 Last State
# Reason: OOMKilled
\`\`\`
Check **requests/limits** — memory limit too low or missing (no limit on the node risks neighbors).

**Diagnosis:**
- Metrics: memory working set vs limit
- Heap dump / profiling for app leaks
- \`kubectl top pod\`

**Fix:**
- Raise the memory limit (temporarily)
- Fix the leak, tune JVM \`-Xmx\`
- HPA on memory (careful — lag)

**Link to CrashLoopBackOff:** pod starts → memory spike → OOM → restart loop.`,
    },
    {
      title: 'Building a personal runbook library',
      content: `After each scenario, capture a **one-page runbook** in the team repo.

**Template:**
- **Alert / ticket type**
- **Quick checks** (3–5 commands)
- **Known causes** (top 3)
- **Escalation** (when to call platform / vendor)
- **Post-incident** — is a postmortem needed?

Practice **game days**: on staging deliberately reproduce 502, full disk, bad deploy — measure MTTR.

**Observability tie-in:** every runbook should link a dashboard and a log query (LogQL/SQL), not only CLI commands.`,
    },
  ],
  practice: [
    'On minikube/kind create a Deployment with a bad CMD — get CrashLoopBackOff and fix via logs --previous',
    'Break package.json/lock sync — fix CI and pin the Node version',
    'Bring up nginx + backend; stop the backend, reproduce 502, find the line in error.log',
    'Fill 90% of disk on a lab VM (dd file) — configure a Prometheus alert rule',
    'Set a 64Mi memory limit on a memory-hungry pod — observe OOMKilled and tune the limit',
    'Write a one-page runbook for one scenario from this chapter',
    'Map “pod Restarting” to events vs metrics vs logs — a table in your notes',
  ],
  resources: [
    {
      title: 'Kubernetes — Debug Running Pods',
      url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/',
    },
    { title: 'nginx — Debugging', url: 'https://nginx.org/en/docs/debugging_log.html' },
    {
      title: 'Google SRE — Managing Incidents',
      url: 'https://sre.google/sre-book/managing-incidents/',
    },
    { title: 'npm ci documentation', url: 'https://docs.npmjs.com/cli/v10/commands/npm-ci' },
  ],
  quiz: [
    {
      question: 'First step on CrashLoopBackOff?',
      options: [
        'kubectl describe pod and logs (--previous), study Events',
        'Immediately kubectl delete pod without analysis',
        'Reboot the whole cluster',
        'Disable liveness forever without diagnosis',
      ],
      answer: 'kubectl describe pod and logs (--previous), study Events',
    },
    {
      question: 'Typical cause of npm ci “lock file out of sync”?',
      options: [
        'Changed package.json without updating package-lock.json',
        'Node too new for Linux',
        'npm ci only works offline',
        'Missing package.json',
      ],
      answer: 'Changed package.json without updating package-lock.json',
    },
    {
      question: 'nginx 502 most often means?',
      options: [
        'Upstream is unreachable or refused the connection',
        'Client sent too many cookies',
        'Client DNS is broken',
        'Client TLS certificate expired',
      ],
      answer: 'Upstream is unreachable or refused the connection',
    },
    {
      question: 'Which command checks inode exhaustion?',
      options: ['df -i', 'free -m', 'uptime', 'whoami'],
      answer: 'df -i',
    },
    {
      question: 'Exit code 137 in Kubernetes is often linked to?',
      options: [
        'OOMKilled — memory limit exceeded',
        'Successful exit',
        'Graceful shutdown via SIGTERM',
        'Missing image',
      ],
      answer: 'OOMKilled — memory limit exceeded',
    },
    {
      question: 'What to check for a 502 between nginx and a docker compose backend?',
      options: [
        'curl the upstream from the nginx host and the correct service name on the compose network',
        'Only DNS TTL in the browser',
        'curl version on the developer laptop',
        'Grafana theme color',
      ],
      answer:
        'curl the upstream from the nginx host and the correct service name on the compose network',
    },
    {
      question: 'Why have startupProbe separate from liveness?',
      options: [
        'Give the app time to start without liveness killing it before ready',
        'Speed up the crash loop',
        'Disable readiness',
        'Hide logs',
      ],
      answer: 'Give the app time to start without liveness killing it before ready',
    },
    {
      question: 'Common cause of “No space left on device” on a Docker host?',
      options: [
        'Uncleared images/layers and logs',
        'Too many SSH keys',
        'Small swap',
        'IPv6',
      ],
      answer: 'Uncleared images/layers and logs',
    },
    {
      question: 'What belongs in a troubleshooting runbook?',
      options: [
        'Symptom, quick checks, known causes, escalation',
        'Only personal notes without commands',
        'Production passwords',
        'Salary history',
      ],
      answer: 'Symptom, quick checks, known causes, escalation',
    },
    {
      question: 'When CI fails on npm ci, what to compare locally and in CI?',
      options: [
        'Node/npm versions and a clean npm ci after clone',
        'Only the GitHub logo color',
        'Monitor size',
        'HR time zone',
      ],
      answer: 'Node/npm versions and a clean npm ci after clone',
    },
  ],
}

export default translation
