import type { Chapter } from '../../../types'

export const incidentsChapter: Chapter = {
  id: 'incidents',
  slug: 'incidents',
  title: 'Инциденты: реагирование, on-call, postmortems',
  moduleId: 'observability',
  order: 2,
  duration: '4–5 часов',
  level: 'intermediate',
  description:
    'Incident response, on-call практики, postmortems, отладка production-систем',
  sections: [
    {
      title: 'Что такое инцидент',
      content: `**Инцидент** — незапланированное событие, негативно влияющее на сервис или пользователей.

**Severity levels:**
| Уровень | Описание | Пример | Response time |
|---------|----------|--------|---------------|
| **SEV1** | Полный outage, все пользователи | Сайт недоступен | 15 мин |
| **SEV2** | Значительная деградация | 50% запросов 5xx | 30 мин |
| **SEV3** | Частичная деградация | Один feature сломан | 2 часа |
| **SEV4** | Минорная проблема | Медленные отчёты | Следующий рабочий день |

**Incident vs Problem:**
- **Incident** — «сайт лежит прямо сейчас» (реактивно)
- **Problem** — «root cause recurring OOM» (проактивно, после postmortem)

**Цель incident response:** восстановить сервис как можно быстрее (MTTR), затем разобраться почему (postmortem).`,
    },
    {
      title: 'Incident Response Lifecycle',
      content: `**6 фаз (Google SRE / PagerDuty model):**

**1. Detection** — обнаружение (алерт, пользователь, мониторинг)
**2. Triage** — оценка severity, создание incident channel
**3. Response** — назначение Incident Commander, mitigation
**4. Mitigation** — восстановление сервиса (rollback, scale, failover)
**5. Resolution** — подтверждение, что проблема решена
**6. Postmortem** — анализ root cause, action items

**Ключевой принцип:** сначала **mitigate** (вернуть сервис), потом **diagnose** (найти причину). Не наоборот!

Rollback за 5 минут лучше, чем debugging 2 часа при лежащем проде.`,
    },
    {
      title: 'Роли в incident response',
      content: `**Incident Commander (IC)** — координатор:
- Принимает решения (rollback? scale? failover?)
- Делегирует задачи, не делает всё сам
- Коммуницирует статус stakeholders
- Единственный источник правды

**Technical Lead** — ведёт техническую диагностику:
- Анализирует логи, метрики, traces
- Предлагает mitigation options IC
- Координирует инженеров

**Communications Lead** — обновляет:
- Status page (status.example.com)
- Slack/email для stakeholders
- Support team (что говорить пользователям)

**Scribe** — документирует timeline:
- Когда обнаружено, кто что делал, когда mitigated
- Критично для postmortem

На SEV3/SEV4 одному инженеру можно совмещать роли. На SEV1/SEV2 — чёткое разделение.`,
    },
    {
      title: 'On-call: организация дежурств',
      content: `**On-call** — инженер доступен 24/7 для реагирования на алерты.

**Best practices:**
- **Rotation:** 1 неделя на человека, минимум 3–4 в ротации
- **Follow-the-sun:** разные TZ для global teams
- **Compensation:** доплата или day-off после тяжёлой недели
- **Runbooks:** для каждого alert — пошаговая инструкция
- **Escalation policy:** 5 мин без ack → team lead → VP Engineering
- **Alert quality:** лучше 0 алертов, чем 100 шумных

**On-call checklist (начало смены):**
1. Проверь что PagerDuty/Opsgenie notifications работают
2. Проверь доступы: VPN, kubectl, AWS console, Grafana
3. Прочитай handoff notes от предыдущего дежурного
4. Проверь текущие алерты и known issues`,
    },
    {
      title: 'Диагностика production: системный подход',
      content: `Когда приходит алерт «сайт лежит», не паникуй. Следуй чеклисту:

**Шаг 1: Подтверди проблему**
- Status page, synthetic monitoring, user reports
- Это реальный incident или false positive?

**Шаг 2: Определи scope**
- Все пользователи или регион/сегмент?
- Все endpoints или один?
- Когда началось? (correlate с deploy)

**Шаг 3: Проверь недавние изменения**
- Deploy в последние 30 мин? → rollback первым делом
- Config change? Infrastructure change?
- \`kubectl rollout history\`, CI/CD pipeline logs

**Шаг 4: Метрики (Grafana)**
- Error rate, latency, traffic — RED signals
- CPU, memory, disk — USE signals
- Сравни с «нормальным» периодом (вчера, неделю назад)

**Шаг 5: Логи**
- Последние ERROR/FATAL
- OOMKilled, CrashLoopBackOff
- Connection refused, timeout

**Шаг 6: Зависимости**
- Database: connections, replication lag
- Cache: Redis memory, hit rate
- External APIs: status pages, latency
- DNS, CDN, load balancer health`,
      code: {
        language: 'bash',
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
        caption: 'Чеклист команд для диагностики',
      },
    },
    {
      title: 'Типичные production проблемы и решения',
      content: `**OOMKilled (Out of Memory):**
- Симптом: pod restart, \`kubectl describe pod\` → OOMKilled
- Быстро: увеличь memory limit
- Надолго: профилирование memory leak, оптимизация

**CrashLoopBackOff:**
- Симптом: pod постоянно перезапускается
- Проверь: \`kubectl logs --previous\`, config errors, missing env vars
- Быстро: rollback deployment

**502/503 Bad Gateway:**
- Симптом: ALB/Ingress возвращает 502
- Причина: нет healthy targets (app не отвечает на health check)
- Проверь: pod status, health endpoint, security groups

**Database connection exhausted:**
- Симптом: «too many connections», timeout на DB queries
- Быстро: restart connection pool, scale read replicas
- Надолго: connection pooling (PgBouncer), оптимизация queries

**Disk full:**
- Симптом: невозможно писать логи/данные
- Быстро: очисти старые логи, увеличь volume
- Надолго: log rotation, monitoring disk usage

**DNS resolution failure:**
- Симптом: «could not resolve host»
- Проверь: CoreDNS pods, NetworkPolicy, VPC DNS settings`,
    },
    {
      title: 'Mitigation: быстрое восстановление',
      content: `**Правило: mitigate first, diagnose later.**

**Rollback deployment:**
\`kubectl rollout undo deployment/my-app -n prod\`

**Scale up:**
\`kubectl scale deployment/my-app --replicas=10 -n prod\`

**Restart pods:**
\`kubectl rollout restart deployment/my-app -n prod\`

**Failover:**
- Переключи DNS на backup region
- Promote read replica to primary
- Активируй disaster recovery site

**Feature flag:**
- Отключи проблемную feature без deploy
- LaunchDarkly, Unleash, или custom flags

**Circuit breaker:**
- Изолируй failing dependency
- Return cached/fallback response

**Важно:** документируй каждое действие в incident channel с timestamp. Это станет основой postmortem.`,
      code: {
        language: 'bash',
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
        caption: 'Emergency mitigation commands',
      },
    },
    {
      title: 'Коммуникация во время инцидента',
      content: `**Правила коммуникации:**

1. **Incident channel** — отдельный Slack channel (#inc-2026-07-09-api-outage)
2. **Status updates** — каждые 15–30 мин, даже если «ещё разбираемся»
3. **Шаблон update:**
   - Status: Investigating / Mitigating / Resolved
   - Impact: «50% API requests returning 500»
   - ETA: «Ожидаем восстановление через 30 мин»
   - Next update: «Следующий update в 15:30 UTC»

4. **Не обвиняй** — «deploy caused issue», не «Вася задеплоил баг»
5. **Status page** — обновляй для external users (Instatus, Statuspage.io)
6. **Post-resolution** — «Resolved at 15:45 UTC. Postmortem будет завтра»

**Для пользователей:**
- Честность: «Мы знаем о проблеме и работаем над ней»
- Не обещай ETA, если не уверен
- После resolution: краткое объяснение (без технических деталей)`,
    },
    {
      title: 'Postmortem: blameless разбор',
      content: `**Postmortem** — документ с анализом инцидента. Цель: **научиться**, а не наказать.

**Blameless culture (Google SRE):**
- Фокус на системных причинах, не на людях
- «Почему deploy прошёл без canary?» вместо «Почему Вася задеплоил?»
- Любой инженер мог бы сделать ту же ошибку
- Action items улучшают систему, не наказывают человека

**Структура postmortem:**
1. **Summary** — что случилось, impact, duration
2. **Timeline** — хронология с точными timestamps
3. **Root Cause** — техническая причина (5 Whys)
4. **Impact** — сколько пользователей, revenue, duration
5. **What went well** — что сработало (быстрый rollback, хороший runbook)
6. **What went poorly** — что замедлило (нет runbook, alert не сработал)
7. **Action Items** — конкретные задачи с owner и deadline
8. **Lessons Learned** — что изменить в процессах`,
    },
    {
      title: '5 Whys: поиск root cause',
      content: `**Техника 5 Whys** — итеративный вопрос «почему?» до root cause.

**Пример:**
1. **Почему** API возвращал 500? → Database connection timeout
2. **Почему** connection timeout? → Connection pool исчерпан (max 100)
3. **Почему** pool исчерпан? → Медленные queries блокируют connections
4. **Почему** queries медленные? → Missing index на orders.created_at
5. **Почему** missing index? → Нет review DB migrations в CI

**Root cause:** нет автоматической проверки DB migrations.
**Action item:** добавить migration review + query performance test в CI.

**Важно:** root cause — это процесс/система, не «инженер забыл index».`,
    },
    {
      title: 'Шаблон postmortem',
      content: `Используй этот шаблон после каждого SEV1/SEV2 инцидента.`,
      code: {
        language: 'markdown',
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
        caption: 'Postmortem template',
      },
    },
    {
      title: 'Runbooks: документация для on-call',
      content: `**Runbook** — пошаговая инструкция для конкретного alert/incident. On-call инженер в 3 ночи не должен думать — он должен следовать runbook.

**Структура runbook:**
1. **Alert name** и описание
2. **Severity** и escalation path
3. **Impact** — что чувствуют пользователи
4. **Diagnosis** — команды для проверки (copy-paste ready)
5. **Mitigation** — быстрые действия для восстановления
6. **Resolution** — долгосрочное исправление
7. **Escalation** — когда звать team lead

**Где хранить:** Confluence, Notion, Git repo (docs/runbooks/), PagerDuty (встроенные runbooks).

**Правило:** если alert сработал 3 раза без runbook — напиши runbook до 4-го раза.`,
    },
    {
      title: 'Chaos Engineering: проактивная подготовка',
      content: `**Chaos Engineering** — намеренное внесение сбоев для проверки устойчивости.

**Принципы (Netflix Chaos Monkey):**
1. Строй hypothesis: «система выдержит падение 1 AZ»
2. Вноси реальный сбой в production (или staging)
3. Проверяй: сработали ли alerts, failover, runbooks
4. Улучшай систему по результатам

**Инструменты:**
- **Chaos Monkey** — random instance termination
- **Litmus Chaos** — K8s-native chaos experiments
- **AWS Fault Injection Simulator** — controlled AWS failures
- **Gremlin** — enterprise chaos platform

**Примеры экспериментов:**
- Kill random pod → Deployment восстанавливает?
- Network latency +500ms → timeout handling работает?
- DB failover → app переключается на replica?
- AZ failure → multi-AZ setup спасает?

**Начни со staging**, потом production с ограниченным blast radius.`,
      code: {
        language: 'yaml',
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
        caption: 'Litmus Chaos — pod delete experiment',
      },
    },
    {
      title: 'Метрики incident management',
      content: `**MTTD (Mean Time To Detect)** — среднее время от начала проблемы до обнаружения.
- Цель: < 5 мин (через алерты, не через пользователей)

**MTTR (Mean Time To Resolve)** — среднее время от обнаружения до восстановления.
- Цель: SEV1 < 30 мин, SEV2 < 1 час

**MTBF (Mean Time Between Failures)** — среднее время между инцидентами.
- Цель: растёт со временем (система становится надёжнее)

**Incident frequency** — количество инцидентов per month.
- Tracking: уменьшение SEV1/SEV2 = прогресс

**Action item completion rate** — % action items из postmortems, выполненных в срок.
- Цель: > 80%. Невыполненные action items → повторные инциденты.`,
    },
    {
      title: 'Лабораторная: симуляция инцидента',
      content: `**Цель:** пройти полный цикл incident response на учебном стенде.

**Подготовка:**
- Pet-проект в K8s с мониторингом (Prometheus + Grafana)
- Намеренно внеси баг: memory leak, missing env var, или bad deploy

**Сценарий:**
1. **Detection:** дождись alert (или обнаружь вручную)
2. **Triage:** оцени severity, создай «incident channel» (заметки)
3. **Diagnosis:** следуй чеклисту (метрики → логи → events → deploys)
4. **Mitigation:** rollback или fix
5. **Resolution:** подтверди восстановление в Grafana
6. **Postmortem:** напиши blameless postmortem по шаблону
7. **Action items:** минимум 3 конкретных улучшения

**Бонус:** проведи chaos experiment (pod delete) и проверь self-healing.`,
    },
  ],
  practice: [
    'Напиши runbook для 3 alerts из monitoring главы',
    'Создай incident response checklist (распечатай/сохрани)',
    'Проведи симуляцию инцидента на pet-проекте',
    'Напиши blameless postmortem по шаблону',
    'Настрой escalation policy в Alertmanager или PagerDuty trial',
    'Проведи chaos experiment: kubectl delete pod — проверь self-healing',
  ],
  resources: [
    { title: 'Google SRE Book — Chapters 14-15', url: 'https://sre.google/sre-book/table-of-contents/' },
    { title: 'PagerDuty Incident Response', url: 'https://response.pagerduty.com' },
    { title: 'Postmortem Templates', url: 'https://github.com/dastergon/postmortem-templates' },
    { title: 'Litmus Chaos', url: 'https://litmuschaos.io' },
  ],
}
