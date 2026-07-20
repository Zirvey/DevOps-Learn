import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `Incidents: response, on-call, postmortems`,
  duration: `4–5 hours`,
  description: `Incident response, on-call practices, postmortems, and debugging production systems`,
  sections: [
    {
      title: `What is an incident`,
      content: `**Incident** — an unplanned event that negatively affects a service or users.

**Severity levels:**
| Level | Description | Example | Response time |
|---------|----------|--------|---------------|
| **SEV1** | Full outage, all users | Site unavailable | 15 min |
| **SEV2** | Significant degradation | 50% of requests 5xx | 30 min |
| **SEV3** | Partial degradation | One feature broken | 2 hours |
| **SEV4** | Minor issue | Slow reports | Next business day |

**Incident vs Problem:**
- **Incident** — “the site is down right now” (reactive)
- **Problem** — “root cause of recurring OOM” (proactive, after postmortem)

**Goal of incident response:** restore the service as fast as possible (MTTR), then understand why (postmortem).`,
    },
    {
      title: `Incident Response Lifecycle`,
      content: `**6 phases (Google SRE / PagerDuty model):**

**1. Detection** — discovery (alert, user, monitoring)
**2. Triage** — severity assessment, create incident channel
**3. Response** — assign Incident Commander, mitigation
**4. Mitigation** — restore the service (rollback, scale, failover)
**5. Resolution** — confirm the problem is solved
**6. Postmortem** — root cause analysis, action items

**Key principle:** first **mitigate** (bring the service back), then **diagnose** (find the cause). Not the other way around!

A 5-minute rollback beats 2 hours of debugging while production is down.`,
    },
    {
      title: `Roles in incident response`,
      content: `**Incident Commander (IC)** — coordinator:
- Makes decisions (rollback? scale? failover?)
- Delegates tasks, does not do everything alone
- Communicates status to stakeholders
- Single source of truth

**Technical Lead** — leads technical diagnosis:
- Analyzes logs, metrics, traces
- Proposes mitigation options to the IC
- Coordinates engineers

**Communications Lead** — updates:
- Status page (status.example.com)
- Slack/email for stakeholders
- Support team (what to tell users)

**Scribe** — documents the timeline:
- When detected, who did what, when mitigated
- Critical for the postmortem

On SEV3/SEV4 one engineer can combine roles. On SEV1/SEV2 — clear separation.`,
    },
    {
      title: `On-call: organizing rotations`,
      content: `**On-call** — an engineer is available 24/7 to respond to alerts.

**Best practices:**
- **Rotation:** 1 week per person, at least 3–4 in the rotation
- **Follow-the-sun:** different time zones for global teams
- **Compensation:** bonus pay or a day off after a hard week
- **Runbooks:** a step-by-step guide for every alert
- **Escalation policy:** 5 min without ack → team lead → VP Engineering
- **Alert quality:** better 0 alerts than 100 noisy ones

**On-call checklist (start of shift):**
1. Verify PagerDuty/Opsgenie notifications work
2. Check access: VPN, kubectl, AWS console, Grafana
3. Read handoff notes from the previous on-call
4. Review current alerts and known issues`,
    },
    {
      title: `Production diagnosis: a systematic approach`,
      content: `When the alert “site is down” fires, do not panic. Follow the checklist:

**Step 1: Confirm the problem**
- Status page, synthetic monitoring, user reports
- Real incident or false positive?

**Step 2: Determine scope**
- All users or a region/segment?
- All endpoints or one?
- When did it start? (correlate with deploy)

**Step 3: Check recent changes**
- Deploy in the last 30 min? → rollback first
- Config change? Infrastructure change?
- \`kubectl rollout history\`, CI/CD pipeline logs

**Step 4: Metrics (Grafana)**
- Error rate, latency, traffic — RED signals
- CPU, memory, disk — USE signals
- Compare with a “normal” period (yesterday, a week ago)

**Step 5: Logs**
- Latest ERROR/FATAL
- OOMKilled, CrashLoopBackOff
- Connection refused, timeout

**Step 6: Dependencies**
- Database: connections, replication lag
- Cache: Redis memory, hit rate
- External APIs: status pages, latency
- DNS, CDN, load balancer health`,
      code: {
        language: `bash`,
        code: `# Быстрая диагностика K8s
kubectl get pods -A | grep -v Running
kubectl get events -A --sort-by=.lastTimestamp | tail -20
kubectl top nodes
kubectl top pods -A --sort-by=memory | head -10

# Недавние деплои
kubectl rollout history deployment/my-app -n prod
kubectl describe deployment my-app -n prod | tail -20

# Логи проблемного pod
kubectl logs -f deployment/my-app -n prod --tail=100
kubectl logs deployment/my-app -n prod --previous  # crashed container

# Проверка endpoints
curl -s -o /dev/null -w "%{http_code} %{time_total}s\\n" https://api.example.com/health
dig api.example.com
nslookup api.example.com`,
        caption: `Diagnosis command checklist`,
      },
    },
    {
      title: `Typical production problems and fixes`,
      content: `**OOMKilled (Out of Memory):**
- Symptom: pod restart, \`kubectl describe pod\` → OOMKilled
- Fast: increase memory limit
- Long-term: profile memory leak, optimize

**CrashLoopBackOff:**
- Symptom: pod keeps restarting
- Check: \`kubectl logs --previous\`, config errors, missing env vars
- Fast: rollback deployment

**502/503 Bad Gateway:**
- Symptom: ALB/Ingress returns 502
- Cause: no healthy targets (app not answering health check)
- Check: pod status, health endpoint, security groups

**Database connection exhausted:**
- Symptom: “too many connections”, timeout on DB queries
- Fast: restart connection pool, scale read replicas
- Long-term: connection pooling (PgBouncer), query optimization

**Disk full:**
- Symptom: cannot write logs/data
- Fast: clean old logs, grow volume
- Long-term: log rotation, disk usage monitoring

**DNS resolution failure:**
- Symptom: “could not resolve host”
- Check: CoreDNS pods, NetworkPolicy, VPC DNS settings`,
    },
    {
      title: `Mitigation: fast recovery`,
      content: `**Rule: mitigate first, diagnose later.**

**Rollback deployment:**
\`kubectl rollout undo deployment/my-app -n prod\`

**Scale up:**
\`kubectl scale deployment/my-app --replicas=10 -n prod\`

**Restart pods:**
\`kubectl rollout restart deployment/my-app -n prod\`

**Failover:**
- Switch DNS to a backup region
- Promote read replica to primary
- Activate disaster recovery site

**Feature flag:**
- Disable the broken feature without a deploy
- LaunchDarkly, Unleash, or custom flags

**Circuit breaker:**
- Isolate a failing dependency
- Return cached/fallback response

**Important:** document every action in the incident channel with a timestamp. That becomes the postmortem foundation.`,
      code: {
        language: `bash`,
        code: `# Emergency rollback
kubectl rollout undo deployment/api -n production
kubectl rollout status deployment/api -n production

# Scale to handle load while fixing
kubectl scale deployment/api --replicas=20 -n production

# Drain problematic node
kubectl cordon node-1
kubectl drain node-1 --ignore-daemonsets --delete-emptydir-data

# Temporary: increase resource limits
kubectl set resources deployment/api -n production \\
  --limits=cpu=2,memory=4Gi \\
  --requests=cpu=1,memory=2Gi`,
        caption: `Emergency mitigation commands`,
      },
    },
    {
      title: `Communication during an incident`,
      content: `**Communication rules:**

1. **Incident channel** — a dedicated Slack channel (#inc-2026-07-09-api-outage)
2. **Status updates** — every 15–30 min, even if “still investigating”
3. **Update template:**
   - Status: Investigating / Mitigating / Resolved
   - Impact: “50% of API requests returning 500”
   - ETA: “Expect recovery in 30 min”
   - Next update: “Next update at 15:30 UTC”

4. **Do not blame** — “deploy caused issue”, not “Vasya shipped a bug”
5. **Status page** — update for external users (Instatus, Statuspage.io)
6. **Post-resolution** — “Resolved at 15:45 UTC. Postmortem tomorrow”

**For users:**
- Honesty: “We know about the problem and are working on it”
- Do not promise an ETA if unsure
- After resolution: a short explanation (without deep technical detail)`,
    },
    {
      title: `Postmortem: blameless review`,
      content: `**Postmortem** — a document analyzing the incident. Goal: **learn**, not punish.

**Blameless culture (Google SRE):**
- Focus on systemic causes, not people
- “Why did the deploy go without a canary?” instead of “Why did Vasya deploy?”
- Any engineer could have made the same mistake
- Action items improve the system; they do not punish a person

**Postmortem structure:**
1. **Summary** — what happened, impact, duration
2. **Timeline** — chronology with exact timestamps
3. **Root Cause** — technical cause (5 Whys)
4. **Impact** — how many users, revenue, duration
5. **What went well** — what worked (fast rollback, good runbook)
6. **What went poorly** — what slowed you down (no runbook, alert did not fire)
7. **Action Items** — concrete tasks with owner and deadline
8. **Lessons Learned** — what to change in processes`,
    },
    {
      title: `5 Whys: finding root cause`,
      content: `**5 Whys technique** — iteratively ask “why?” until you reach root cause.

**Example:**
1. **Why** did the API return 500? → Database connection timeout
2. **Why** connection timeout? → Connection pool exhausted (max 100)
3. **Why** pool exhausted? → Slow queries blocking connections
4. **Why** slow queries? → Missing index on orders.created_at
5. **Why** missing index? → No DB migration review in CI

**Root cause:** no automated check of DB migrations.
**Action item:** add migration review + query performance test to CI.

**Important:** root cause is a process/system issue, not “the engineer forgot an index”.`,
    },
    {
      title: `Postmortem template`,
      content: `Use this template after every SEV1/SEV2 incident.`,
      code: {
        language: `markdown`,
        code: `# Postmortem: API Outage 2026-07-09

## Summary
- **Duration:** 45 minutes (14:00 - 14:45 UTC)
- **Severity:** SEV2
- **Impact:** 30% of API requests returned 500 errors
- **Root Cause:** Database connection pool exhaustion after deploy

## Timeline (UTC)
- 14:00 — Alert: HighErrorRate fired
- 14:05 — On-call engineer acknowledged, created #inc-api-outage
- 14:10 — Identified: errors correlate with deploy at 13:55
- 14:15 — Rollback initiated
- 14:25 — Rollback complete, error rate dropping
- 14:45 — Error rate back to normal, incident resolved

## Root Cause
Deploy v2.3.0 introduced N+1 query in /api/orders endpoint.
Under normal load: 50 DB connections. After deploy: 200+ connections.
Connection pool max: 100. Result: timeout cascade.

## Action Items
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Add query performance test to CI | @dev-team | 2026-07-16 | Open |
| Add DB connection pool metric + alert | @sre | 2026-07-12 | Open |
| Implement canary deploy (10% → 50% → 100%) | @platform | 2026-07-23 | Open |
| Write runbook for DB connection issues | @oncall | 2026-07-11 | Open |

## Lessons Learned
- Rollback worked in 10 min — good
- No alert on DB connection pool usage — bad
- Deploy went 0% → 100% without canary — bad`,
        caption: `Postmortem template`,
      },
    },
    {
      title: `Runbooks: documentation for on-call`,
      content: `**Runbook** — a step-by-step guide for a specific alert/incident. An on-call engineer at 3 a.m. should not invent solutions — they should follow the runbook.

**Runbook structure:**
1. **Alert name** and description
2. **Severity** and escalation path
3. **Impact** — what users feel
4. **Diagnosis** — commands to check (copy-paste ready)
5. **Mitigation** — fast actions to restore
6. **Resolution** — long-term fix
7. **Escalation** — when to call the team lead

**Where to store:** Confluence, Notion, Git repo (docs/runbooks/), PagerDuty (built-in runbooks).

**Rule:** if an alert fires 3 times without a runbook — write the runbook before the 4th time.`,
    },
    {
      title: `Chaos Engineering: proactive preparation`,
      content: `**Chaos Engineering** — deliberately injecting failures to verify resilience.

**Principles (Netflix Chaos Monkey):**
1. Build a hypothesis: “the system survives loss of 1 AZ”
2. Inject a real failure in production (or staging)
3. Verify: did alerts, failover, and runbooks work?
4. Improve the system based on results

**Tools:**
- **Chaos Monkey** — random instance termination
- **Litmus Chaos** — K8s-native chaos experiments
- **AWS Fault Injection Simulator** — controlled AWS failures
- **Gremlin** — enterprise chaos platform

**Example experiments:**
- Kill a random pod → does Deployment restore it?
- Network latency +500ms → does timeout handling work?
- DB failover → does the app switch to a replica?
- AZ failure → does multi-AZ save you?

**Start with staging**, then production with a limited blast radius.`,
      code: {
        language: `yaml`,
        code: `# Litmus Chaos experiment: pod delete
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: nginx-chaos
  namespace: default
spec:
  appinfo:
    appns: default
    applabel: "app=nginx"
    appkind: deployment
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: "60"
            - name: CHAOS_INTERVAL
              value: "10"
            - name: FORCE
              value: "false"`,
        caption: `Litmus Chaos — pod delete experiment`,
      },
    },
    {
      title: `Incident management metrics`,
      content: `**MTTD (Mean Time To Detect)** — average time from problem start to detection.
- Goal: < 5 min (via alerts, not via users)

**MTTR (Mean Time To Resolve)** — average time from detection to recovery.
- Goal: SEV1 < 30 min, SEV2 < 1 hour

**MTBF (Mean Time Between Failures)** — average time between incidents.
- Goal: grows over time (system becomes more reliable)

**Incident frequency** — number of incidents per month.
- Tracking: fewer SEV1/SEV2 = progress

**Action item completion rate** — % of postmortem action items done on time.
- Goal: > 80%. Incomplete action items → repeat incidents.`,
    },
    {
      title: `Lab: incident simulation`,
      content: `**Goal:** walk through a full incident response cycle on a training setup.

**Prep:**
- Pet project in K8s with monitoring (Prometheus + Grafana)
- Intentionally introduce a bug: memory leak, missing env var, or bad deploy

**Scenario:**
1. **Detection:** wait for an alert (or discover manually)
2. **Triage:** assess severity, create an “incident channel” (notes)
3. **Diagnosis:** follow the checklist (metrics → logs → events → deploys)
4. **Mitigation:** rollback or fix
5. **Resolution:** confirm recovery in Grafana
6. **Postmortem:** write a blameless postmortem from the template
7. **Action items:** at least 3 concrete improvements

**Bonus:** run a chaos experiment (pod delete) and verify self-healing.`,
    },
  ],
  practice: [
    `Write a runbook for 3 alerts from the monitoring chapter`,
    `Create an incident response checklist (print/save it)`,
    `Run an incident simulation on your pet project`,
    `Write a blameless postmortem from the template`,
    `Configure an escalation policy in Alertmanager or a PagerDuty trial`,
    `Run a chaos experiment: kubectl delete pod — verify self-healing`,
  ],
  resources: [
    { title: `Google SRE Book — Chapters 14-15`, url: `https://sre.google/sre-book/table-of-contents/` },
    { title: `PagerDuty Incident Response`, url: `https://response.pagerduty.com` },
    { title: `Postmortem Templates`, url: `https://github.com/dastergon/postmortem-templates` },
    { title: `Litmus Chaos`, url: `https://litmuschaos.io` },
  ],
  quiz: [
    {
      question: `Who is the incident commander?`,
      options: [
        `Response coordinator: priorities, communication, delegation`,
        `The only person who fixes everything by hand`,
        `The company lawyer`,
        `Author of the last commit by default`,
      ],
      answer: `Response coordinator: priorities, communication, delegation`,
    },
    {
      question: `What is MTTR?`,
      answer: `Mean Time To Recovery — average time to restore the service after an incident.`,
    },
    {
      question: `First step in a major outage?`,
      options: [
        `Stabilize the service (mitigate), then find the root cause`,
        `Immediately deploy an untested hotfix`,
        `Delete monitoring so it stops making noise`,
        `Wait until the end of the shift`,
      ],
      answer: `Stabilize the service (mitigate), then find the root cause`,
    },
    {
      question: `Why keep a timeline during an incident?`,
      options: [
        `For the postmortem and understanding the sequence of actions`,
        `To hide mistakes`,
        `Only for AWS billing`,
        `Terraform requires a timeline`,
      ],
      answer: `For the postmortem and understanding the sequence of actions`,
    },
    {
      question: `What should a blameless postmortem include?`,
      answer: `Impact, timeline, root cause, contributing factors, action items with owners.`,
    },
    {
      question: `How does severity P1 differ from P3 roughly?`,
      options: [
        `P1 — critical business outage; P3 — low impact / workaround exists`,
        `P3 always requires the CEO`,
        `P1 — warning only`,
        `No difference`,
      ],
      answer: `P1 — critical business outage; P3 — low impact / workaround exists`,
    },
  ],
}

export default translation
