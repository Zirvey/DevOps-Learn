import type { Chapter } from '../../../types'

export const monitoringChapter: Chapter = {
  id: 'monitoring',
  slug: 'monitoring',
  title: 'Мониторинг: Prometheus, Grafana, алертинг',
  moduleId: 'observability',
  order: 0,
  duration: '6–8 часов',
  level: 'intermediate',
  description:
    'Prometheus, Grafana, алертинг, SLI/SLO/SLA, дашборды и золотые сигналы Google SRE',
  sections: [
    {
      title: 'Три столпа наблюдаемости (Observability)',
      content: `**Observability** — способность понять внутреннее состояние системы по внешним данным. Три столпа:

**1. Metrics (метрики)** — числовые измерения во времени
- CPU: 45%, Memory: 2.1 GB, HTTP latency p99: 230ms
- Компактные, агрегируемые, идеальны для алертов и дашбордов
- Инструменты: Prometheus, CloudWatch, Datadog

**2. Logs (логи)** — дискретные события с контекстом
- «User 123 failed login from IP 10.0.0.5»
- Детальные, но объёмные и дорогие в хранении
- Инструменты: Loki, ELK, CloudWatch Logs

**3. Traces (трейсы)** — путь запроса через распределённую систему
- API Gateway → Auth Service → DB → Cache (120ms total)
- Критичны для микросервисов
- Инструменты: Jaeger, Tempo, Zipkin, AWS X-Ray

**Без мониторинга** ты узнаешь о проблеме, когда позвонит клиент. **С мониторингом** — за минуты до того, как пользователи заметят.`,
    },
    {
      title: 'Prometheus: архитектура и принципы',
      content: `**Prometheus** — open-source система мониторинга от CNCF. Стандарт для Kubernetes.

**Архитектура:**
- **Prometheus Server** — сбор, хранение, запросы (PromQL)
- **Exporters** — адаптеры метрик (node_exporter, postgres_exporter)
- **Pushgateway** — для batch/short-lived jobs
- **Alertmanager** — маршрутизация алертов
- **Service Discovery** — автоматическое обнаружение targets (K8s, EC2, Consul)

**Pull model:** Prometheus сам забирает метрики с endpoints (\`/metrics\`). Альтернатива — push (Graphite, Datadog).

**Хранение:** локальный TSDB (time-series database), retention по умолчанию 15 дней. Долгосрочное — Thanos, Cortex, Mimir.

**Типы метрик:**
- **Counter** — монотонно растущий (requests_total)
- **Gauge** — текущее значение (memory_usage_bytes)
- **Histogram** — распределение (request_duration_seconds)
- **Summary** — квантили (аналог histogram с client-side quantiles)`,
    },
    {
      title: 'Prometheus: конфигурация и scrape',
      content: `**prometheus.yml** — главный конфиг. Определяет scrape targets, intervals, rules.`,
      code: {
        language: 'yaml',
        code: `# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - /etc/prometheus/rules/*.yml

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'my-app'
    metrics_path: /metrics
    static_configs:
      - targets: ['app:8080']
    scrape_interval: 5s

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true`,
        caption: 'prometheus.yml — scrape configs',
      },
    },
    {
      title: 'PromQL: язык запросов Prometheus',
      content: `**PromQL (Prometheus Query Language)** — мощный язык для запросов и алертов.

**Базовые запросы:**
- \`http_requests_total\` — raw metric
- \`rate(http_requests_total[5m])\` — requests/sec за 5 мин
- \`histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))\` — p99 latency`,
      code: {
        language: 'promql',
        code: `# Rate of HTTP requests per second
rate(http_requests_total[5m])

# Error rate (5xx)
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m])) * 100

# p99 latency
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# CPU usage per pod
sum(rate(container_cpu_usage_seconds_total{namespace="prod"}[5m])) by (pod)

# Memory usage percentage
(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# Predict disk full in 4 hours
predict_linear(node_filesystem_avail_bytes[1h], 4*3600) < 0`,
        caption: 'PromQL — типичные запросы',
      },
    },
    {
      title: 'Экспорт метрик из приложения',
      content: `Приложение должно экспортировать метрики на endpoint \`/metrics\` в формате Prometheus (text exposition format).

**Клиентские библиотеки:** prometheus/client_python, prom-client (Node.js), prometheus/client_golang.`,
      code: {
        language: 'python',
        code: `from prometheus_client import Counter, Histogram, generate_latest
from flask import Flask, Response
import time

app = Flask(__name__)

REQUEST_COUNT = Counter(
    'http_requests_total', 'Total HTTP requests',
    ['method', 'endpoint', 'status']
)
REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds', 'Request latency',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)

@app.route('/metrics')
def metrics():
    return Response(generate_latest(), mimetype='text/plain')

@app.route('/api/users')
def users():
    start = time.time()
    # ... business logic ...
    REQUEST_COUNT.labels('GET', '/api/users', '200').inc()
    REQUEST_LATENCY.labels('GET', '/api/users').observe(time.time() - start)
    return {"users": []}`,
        caption: 'Экспорт метрик из Python (Flask)',
      },
    },
    {
      title: 'Grafana: визуализация и дашборды',
      content: `**Grafana** — платформа визуализации. Подключается к Prometheus, Loki, CloudWatch, Elasticsearch и 100+ источникам.

**Основные понятия:**
- **Data Source** — подключение к Prometheus/Loki/etc
- **Dashboard** — набор panels
- **Panel** — один график/таблица/stat (Graph, Stat, Table, Heatmap)
- **Variable** — динамические фильтры ($namespace, $pod)
- **Alert** — правила на основе queries (или через Alertmanager)

**Best practices для дашбордов:**
- **RED method** для services: Rate, Errors, Duration
- **USE method** для resources: Utilization, Saturation, Errors
- Один dashboard = один сервис/команда
- Variables для namespace, environment
- Annotations для deploy events`,
    },
    {
      title: 'Grafana: создание дашборда',
      content: `Пример docker-compose для локального стека Prometheus + Grafana.`,
      code: {
        language: 'yaml',
        code: `# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports: ["3000:3000"]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter:latest
    ports: ["9100:9100"]

volumes:
  grafana-data:`,
        caption: 'Docker Compose: Prometheus + Grafana',
      },
    },
    {
      title: 'Золотые сигналы Google SRE',
      content: `Google SRE определяет **4 золотых сигнала** — минимальный набор метрик для любого сервиса:

**1. Latency** — время обработки запроса
- Различай successful vs failed requests
- Мониторь percentiles: p50, p95, p99 (не average!)
- p99 = 99% запросов быстрее этого значения

**2. Traffic** — нагрузка на систему
- HTTP requests/sec, transactions/sec, network I/O
- Помогает отличить проблему нагрузки от инфраструктуры

**3. Errors** — частота неуспешных запросов
- Explicit (HTTP 5xx) + implicit (HTTP 200 с ошибкой в body)
- Error rate = errors / total requests

**4. Saturation** — насколько система «на пределе»
- CPU queue depth, memory pressure, disk I/O wait
- «Сколько ещё запросов система выдержит?»`,
    },
    {
      title: 'SLI, SLO и SLA: формализация надёжности',
      content: `**SLI (Service Level Indicator)** — конкретная метрика качества:
- Availability: % успешных запросов
- Latency: % запросов быстрее 200ms
- Throughput: requests/sec

**SLO (Service Level Objective)** — целевое значение SLI:
- «99.9% запросов возвращают 2xx за 30 дней»
- «95% запросов быстрее 200ms»
- «99.99% uptime»

**SLA (Service Level Agreement)** — контракт с клиентом:
- «Если uptime < 99.9%, клиент получает кредит 10%»
- SLO обычно строже SLA (buffer)

**Error Budget** = 100% - SLO:
- SLO 99.9% → error budget 0.1% = 43.2 мин/мес downtime
- Пока budget есть — можно рисковать (deploy, эксперименты)
- Budget исчерпан — freeze deploys, фокус на stability`,
      code: {
        language: 'promql',
        code: `# SLI: availability за 30 дней
sum(increase(http_requests_total{status!~"5.."}[30d]))
/ sum(increase(http_requests_total[30d])) * 100

# Error budget remaining (SLO 99.9%)
1 - (
  sum(increase(http_requests_total{status=~"5.."}[30d]))
  / sum(increase(http_requests_total[30d]))
) / (1 - 0.999)

# Burn rate alert (быстрое сжигание budget)
sum(rate(http_requests_total{status=~"5.."}[1h]))
/ sum(rate(http_requests_total[1h])) > 0.01 * 14.4`,
        caption: 'PromQL для SLI/SLO/Error Budget',
      },
    },
    {
      title: 'Алертинг: Alertmanager',
      content: `**Alertmanager** — маршрутизация, группировка, подавление (silencing) алертов.

**Pipeline:** Prometheus rules → firing alerts → Alertmanager → PagerDuty/Slack/Email

**Принципы хороших алертов:**
- **Actionable** — получатель знает, что делать
- **Конкретные** — не «CPU > 50%», а «Error rate > 1% за 5 мин»
- **Без alert fatigue** — лучше пропустить, чем заспамить
- **Severity levels:** critical (wake up), warning (check tomorrow), info

**Плохие алерты:**
- CPU > 50% (шум, не actionable)
- Disk > 80% (без trend/prediction)
- Pod restarted (может быть нормальным rolling update)`,
      code: {
        language: 'yaml',
        code: `# alert-rules.yml
groups:
  - name: app-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate > 1% for 5 minutes"
          description: "Current error rate: {{ $value | humanizePercentage }}"

      - alert: HighLatencyP99
        expr: |
          histogram_quantile(0.99,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "p99 latency > 2s"

      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical`,
        caption: 'Prometheus alert rules',
      },
    },
    {
      title: 'Alertmanager: маршрутизация и интеграции',
      content: `**alertmanager.yml** — конфигурация маршрутизации.`,
      code: {
        language: 'yaml',
        code: `# alertmanager.yml
route:
  receiver: 'default'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
      continue: true
    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'default'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'your-pagerduty-key'
        severity: critical

  - name: 'slack-warnings'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#warnings'`,
        caption: 'Alertmanager routing',
      },
    },
    {
      title: 'Мониторинг Kubernetes',
      content: `**kube-prometheus-stack** — Helm chart, включающий:
- Prometheus + Alertmanager
- Grafana с pre-built dashboards
- node-exporter, kube-state-metrics
- Default alert rules для K8s

**Ключевые метрики K8s:**
- Pod restarts, OOMKilled, CrashLoopBackOff
- Node CPU/memory/disk pressure
- Deployment replicas available vs desired
- PVC usage
- API server latency`,
      code: {
        language: 'bash',
        code: `# Установка kube-prometheus-stack
helm repo add prometheus-community \\
  https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \\
  -n monitoring --create-namespace

# Port-forward Grafana
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
# Login: admin / prom-operator

# Полезные kubectl команды
kubectl top nodes
kubectl top pods -A
kubectl get events --sort-by=.lastTimestamp`,
        caption: 'kube-prometheus-stack в K8s',
      },
    },
    {
      title: 'RED и USE методологии',
      content: `**RED (для services/requests):**
- **R**ate — requests per second
- **E**rrors — failed requests per second
- **D**uration — latency distribution

Применяй для: API gateways, microservices, web servers.

**USE (для resources/infrastructure):**
- **U**tilization — % time resource busy (CPU 80%)
- **S**aturation — queue depth, wait time
- **E**rrors — error count

Применяй для: CPU, memory, disk, network interfaces.

**Комбинируй:** RED на уровне сервиса + USE на уровне инфраструктуры = полная картина.`,
    },
    {
      title: 'On-call и escalation',
      content: `**On-call rotation** — дежурный инженер отвечает за алерты 24/7.

**Best practices:**
- Rotation: 1 неделя на человека, минимум 3 человека в ротации
- Runbooks для каждого alert (что проверить, как починить)
- Escalation: 5 мин без ack → следующий уровень
- Post-incident review после каждого critical alert
- «Blameless» — фокус на процесс, не на человека

**Инструменты:** PagerDuty, Opsgenie, Grafana OnCall (open-source).

**Runbook template:**
1. Alert description
2. Impact (что сломано для пользователей)
3. Diagnosis steps (команды, дашборды)
4. Mitigation (как починить быстро)
5. Resolution (как починить навсегда)`,
    },
    {
      title: 'Лабораторная: полный monitoring stack',
      content: `**Цель:** поднять Prometheus + Grafana + Alertmanager, создать дашборд и алерт.

**Шаги:**
1. Docker Compose: Prometheus, Grafana, node-exporter, Alertmanager
2. Добавь scrape target — своё приложение с /metrics
3. Grafana: подключи Prometheus data source
4. Создай dashboard: CPU, memory, request rate, error rate, p99 latency
5. Напиши alert rule: error rate > 5% за 5 мин
6. Настрой Alertmanager → Slack webhook
7. Сгенерируй нагрузку и ошибки, проверь что алерт сработал
8. Напиши runbook для своего алерта`,
    },
  ],
  practice: [
    'Подними Prometheus + Grafana через Docker Compose',
    'Добавь /metrics endpoint в pet-проект',
    'Создай Grafana dashboard с RED метриками',
    'Напиши 3 alert rules: error rate, latency, disk space',
    'Настрой Alertmanager → Slack',
    'Установи kube-prometheus-stack в minikube',
    'Пройди лабораторную «полный monitoring stack»',
  ],
  resources: [
    { title: 'Prometheus Docs', url: 'https://prometheus.io/docs/' },
    { title: 'Grafana Tutorials', url: 'https://grafana.com/tutorials/' },
    { title: 'Google SRE Book', url: 'https://sre.google/sre-book/table-of-contents/' },
    { title: 'kube-prometheus-stack', url: 'https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack' },
  ],
}
