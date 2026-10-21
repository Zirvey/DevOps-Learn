import type { Chapter } from '../../../types'

export const troubleshootingChapter: Chapter = {
  id: 'troubleshooting',
  slug: 'troubleshooting-scenarios',
  title: 'Troubleshooting: типовые сценарии в production',
  moduleId: 'observability',
  order: 1,
  duration: '4–5 часов',
  level: 'intermediate',
  description:
    'Разбор реальных сценариев: CrashLoopBackOff, падение CI на npm ci, nginx 502, переполнение диска, OOM — логи, гипотезы и пошаговая диагностика',
  sections: [
    {
      title: 'Метод troubleshooting для DevOps',
      content: `**Цель** — не угадывать, а сужать пространство гипотез данными.

**Универсальный алгоритм:**
1. **Symptom** — что видит пользователь/мониторинг? (502, pod Restarting, pipeline red)
2. **Scope** — один сервис или весь кластер? после какого изменения?
3. **Recent changes** — deploy, config, secret rotation, traffic spike
4. **Logs + metrics + traces** — triangulation
5. **Hypothesis → test → fix → verify**

**Инструменты по слоям:**
| Слой | K8s | VM / Compose |
|------|-----|--------------|
| Статус | \`kubectl get/describe\` | \`systemctl\`, \`docker ps\` |
| Логи | \`kubectl logs\`, events | journald, container logs |
| Метрики | Prometheus, kube-state | node_exporter |
| Сеть | \`kubectl exec curl\`, NetworkPolicy | \`ss\`, tcpdump, nginx error log |

Держи **runbook** шаблон: symptom, checks, escalation.`,
    },
    {
      title: 'Сценарий: CrashLoopBackOff в Kubernetes',
      content: `**Symptom:** \`kubectl get pods\` → STATUS \`CrashLoopBackOff\`, RESTARTS растёт.

**Типичные причины:**
- Приложение падает при старте (exception, missing env)
- **Liveness probe** слишком агressive — убивает ещё не готовый pod
- Wrong command/args, read-only filesystem
- OOMKilled (см. отдельный сценарий)

**Диагностика:**
\`\`\`
kubectl describe pod <name> -n <ns>   # Events, exit code, probes
kubectl logs <name> -n <ns> --previous # логи упавшего контейнера
kubectl get events -n <ns> --sort-by=.lastTimestamp
\`\`\`

**Пример Events:**
\`Back-off restarting failed container\`
\`Liveness probe failed: HTTP probe failed with statuscode: 503\`

**Fix patterns:**
- Исправить env/configmap/secret
- Ослабить liveness / добавить startupProbe
- Увеличить \`initialDelaySeconds\`

> **Anti-pattern:** только \`kubectl delete pod\` без понимания причины — pod пересоздастся с той же ошибкой.`,
      code: {
        language: 'yaml',
        caption: 'startupProbe vs liveness (фрагмент)',
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
      title: 'Сценарий: CI падает на npm ci',
      content: `**Symptom:** GitHub Actions / GitLab CI red на шаге \`npm ci\`.

**Типичные логи:**
\`\`\`
npm ERR! \`npm ci\` can only install packages when your package.json and package-lock.json are in sync
npm ERR! Missing: lodash@4.17.21 from lock file
\`\`\`

**Причины:**
- Изменили \`package.json\` без обновления lockfile
- Разные версии npm локально vs CI (lockfileVersion)
- Private registry — нет \`.npmrc\` / token в CI
- Corrupted cache в CI

**Диагностика:**
1. Локально: \`npm ci\` в clean clone
2. Сравни \`node -v\` и \`npm -v\` с CI image
3. Проверь \`actions/setup-node\` cache key

**Fix:**
- \`npm install\` локально → commit lockfile
- Pin Node version в \`.nvmrc\` / \`engines\` в package.json
- Secrets для private packages

**Prevention:** branch protection + required CI; pre-commit hook на lockfile sync.`,
      code: {
        language: 'yaml',
        caption: 'CI: pin Node и npm ci',
        code: `- uses: actions/setup-node@v4
  with:
    node-version-file: '.nvmrc'
    cache: 'npm'
- run: npm ci --prefer-offline`,
      },
    },
    {
      title: 'Сценарий: nginx 502 Bad Gateway',
      content: `**Symptom:** клиент видит **502**; nginx жив, backend — нет или не отвечает.

**nginx error.log:**
\`\`\`
upstream prematurely closed connection while reading response header from upstream
connect() failed (111: Connection refused) while connecting to upstream
\`\`\`

**Причины:**
- Backend down / crash / ещё стартует
- Wrong upstream host/port (docker network, k8s service name)
- Timeout — backend медленнее \`proxy_read_timeout\`
- TLS mismatch между nginx и upstream

**Диагностика:**
1. \`curl -v http://127.0.0.1:UPSTREAM_PORT/health\` **с той же машины**, что nginx
2. Проверь \`upstream\` block и resolver (для variable upstream)
3. \`docker compose ps\` / \`kubectl get endpoints\` — есть ли ready backends?

**Fix:**
- Поднять backend, исправить service discovery
- Увеличить timeouts или оптимизировать backend
- Добавить healthcheck в upstream pool (nginx plus / external LB)

**Метрики:** alert на \`5xx rate\` и \`upstream_connect_time\`.`,
      code: {
        language: 'nginx',
        caption: 'Отладочные директивы (временно)',
        code: `error_log /var/log/nginx/error.log debug;
proxy_connect_timeout 5s;
proxy_read_timeout 60s;
# upstream app { server app:8000 max_fails=3 fail_timeout=30s; }`,
      },
    },
    {
      title: 'Сценарий: disk full (No space left on device)',
      content: `**Symptom:** deploy fail, logs не пишутся, \`write error\`, pod Evicted.

**Быстрая проверка:**
\`\`\`
df -h
df -i          # inodes exhausted при миллионах мелких файлов
du -xh /var | sort -h | tail -20
\`\`\`

**Частые виновники:**
- **Docker:** неиспользуемые images/layers (\`docker system df\`)
- **Logs:** \`/var/log\`, journald без rotation
- **Loki/Prometheus** retention без лимитов
- **Core dumps**, temp files в /tmp

**K8s:** emptyDir без limit, PVC без мониторинга usage

**Mitigation:**
- Очистка: \`journalctl --vacuum-size=500M\`, prune docker
- **Alerts** на disk > 80% за 15m
- Log rotation, retention policies

**Prevention:** treat disk as metric; capacity planning; separate volume для data.`,
      code: {
        language: 'bash',
        code: `sudo journalctl --disk-usage
docker system prune -af   # осторожно — удалит неиспользуемые images
find /var/log -type f -name '*.gz' -mtime +14 -ls`,
      },
    },
    {
      title: 'Сценарий: OOM (Out Of Memory)',
      content: `**Symptom:** процесс killed, в dmesg/journal: \`Out of memory: Kill process\`; в K8s: \`OOMKilled\`, exit code 137.

**Linux OOM killer** выбирает жертву по oom_score — часто Java/Node без лимитов.

**K8s:**
\`\`\`
kubectl describe pod | grep -A5 Last State
# Reason: OOMKilled
\`\`\`
Проверь **requests/limits** — limit memory слишком низкий или отсутствует (no limit на node — risk для соседей).

**Диагностика:**
- Metrics: memory working set vs limit
- Heap dump / profiling для app leaks
- \`kubectl top pod\`

**Fix:**
- Увеличить memory limit (временно)
- Исправить leak, tune JVM \`-Xmx\`
- HPA по memory (осторожно — lag)

**Связь с CrashLoopBackOff:** pod стартует → memory spike → OOM → restart loop.`,
    },
    {
      title: 'Сборка личной библиотеки runbooks',
      content: `После каждого сценария зафиксируй **one-page runbook** в repo команды.

**Шаблон:**
- **Alert / ticket type**
- **Quick checks** (3–5 команд)
- **Known causes** (top 3)
- **Escalation** (когда звать platform / vendor)
- **Post-incident** — нужен ли postmortem?

Практикуй **game days**: на staging намеренно воспроизводи 502, full disk, bad deploy — измеряй MTTR.

**Observability tie-in:** каждый runbook должен ссылаться на dashboard и log query (LogQL/SQL), не только на команды CLI.`,
    },
  ],
  practice: [
    'На minikube/kind создай Deployment с неверным CMD — добейся CrashLoopBackOff и почини через logs --previous',
    'Сломай sync package.json/lock — почини CI и добавь pin Node version',
    'Подними nginx + backend; останови backend и воспроизведи 502, найди строку в error.log',
    'Заполни 90% диска в lab VM (файл dd) — настрой alert rule в Prometheus',
    'Установи memory limit 64Mi на memory-hungry pod — наблюдай OOMKilled и подбери limit',
    'Напиши runbook на 1 страницу для одного сценария из главы',
    'Сопоставь symptom «pod Restarting» с events vs metrics vs logs — таблица в заметках',
  ],
  resources: [
    {
      title: 'Kubernetes — Debug Running Pods',
      url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/',
    },
    {
      title: 'nginx — Debugging',
      url: 'https://nginx.org/en/docs/debugging_log.html',
    },
    {
      title: 'Google SRE — Managing Incidents',
      url: 'https://sre.google/sre-book/managing-incidents/',
    },
    {
      title: 'npm ci documentation',
      url: 'https://docs.npmjs.com/cli/v10/commands/npm-ci',
    },
  ],
}
