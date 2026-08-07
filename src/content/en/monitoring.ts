import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `Monitoring: Prometheus, Grafana, alerting`,
  duration: `6–8 hours`,
  description: `Prometheus, Grafana, alerting, SLI/SLO/SLA, dashboards, and Google SRE golden signals`,
  sections: [
    {
      title: `The three pillars of observability`,
      content: `**Observability** is the ability to understand a system's internal state from external data. Three pillars:

**1. Metrics** — numeric measurements over time
- CPU: 45%, Memory: 2.1 GB, HTTP latency p99: 230ms
- Compact, aggregatable, ideal for alerts and dashboards
- Tools: Prometheus, CloudWatch, Datadog

**2. Logs** — discrete events with context
- “User 123 failed login from IP 10.0.0.5”
- Detailed, but bulky and expensive to store
- Tools: Loki, ELK, CloudWatch Logs

**3. Traces** — the path of a request through a distributed system
- API Gateway → Auth Service → DB → Cache (120ms total)
- Critical for microservices
- Tools: Jaeger, Tempo, Zipkin, AWS X-Ray

**Without monitoring** you learn about a problem when a customer calls. **With monitoring** — minutes before users notice.`,
    },
    {
      title: `Prometheus: architecture and principles`,
      content: `**Prometheus** is an open-source monitoring system from CNCF. The standard for Kubernetes.

**Architecture:**
- **Prometheus Server** — scrape, store, query (PromQL)
- **Exporters** — metric adapters (node_exporter, postgres_exporter)
- **Pushgateway** — for batch/short-lived jobs
- **Alertmanager** — alert routing
- **Service Discovery** — automatic target discovery (K8s, EC2, Consul)

**Pull model:** Prometheus scrapes metrics from endpoints (\`/metrics\`). Alternative — push (Graphite, Datadog).

**Storage:** local TSDB (time-series database), default retention 15 days. Long-term — Thanos, Cortex, Mimir.

**Metric types:**
- **Counter** — monotonically increasing (requests_total)
- **Gauge** — current value (memory_usage_bytes)
- **Histogram** — distribution (request_duration_seconds)
- **Summary** — quantiles (histogram-like with client-side quantiles)`,
    },
    {
      title: `Prometheus: configuration and scrape`,
      content: `**prometheus.yml** — the main config. Defines scrape targets, intervals, rules.`,
      code: {
        language: `yaml`,
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
        caption: `prometheus.yml — scrape configs`,
      },
    },
    {
      title: `PromQL: the Prometheus query language`,
      content: `**PromQL (Prometheus Query Language)** — a powerful language for queries and alerts.

**Basic queries:**
- \`http_requests_total\` — raw metric
- \`rate(http_requests_total[5m])\` — requests/sec over 5 min
- \`histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))\` — p99 latency`,
      code: {
        language: `promql`,
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
        caption: `PromQL — common queries`,
      },
    },
    {
      title: `Exporting metrics from an application`,
      content: `The application should export metrics on the \`/metrics\` endpoint in Prometheus format (text exposition format).

**Client libraries:** prometheus/client_python, prom-client (Node.js), prometheus/client_golang.`,
      code: {
        language: `python`,
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
        caption: `Exporting metrics from Python (Flask)`,
      },
    },
    {
      title: `Grafana: visualization and dashboards`,
      content: `**Grafana** is a visualization platform. Connects to Prometheus, Loki, CloudWatch, Elasticsearch, and 100+ sources.

**Core concepts:**
- **Data Source** — connection to Prometheus/Loki/etc
- **Dashboard** — a set of panels
- **Panel** — one chart/table/stat (Graph, Stat, Table, Heatmap)
- **Variable** — dynamic filters ($namespace, $pod)
- **Alert** — rules based on queries (or via Alertmanager)

**Dashboard best practices:**
- **RED method** for services: Rate, Errors, Duration
- **USE method** for resources: Utilization, Saturation, Errors
- One dashboard = one service/team
- Variables for namespace, environment
- Annotations for deploy events`,
    },
    {
      title: `Grafana: creating a dashboard`,
      content: `Example docker-compose for a local Prometheus + Grafana stack.`,
      code: {
        language: `yaml`,
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
        caption: `Docker Compose: Prometheus + Grafana`,
      },
    },
    {
      title: `Google SRE golden signals`,
      content: `Google SRE defines **4 golden signals** — the minimum metric set for any service:

**1. Latency** — request processing time
- Distinguish successful vs failed requests
- Monitor percentiles: p50, p95, p99 (not average!)
- p99 = 99% of requests faster than this value

**2. Traffic** — load on the system
- HTTP requests/sec, transactions/sec, network I/O
- Helps distinguish load problems from infrastructure issues

**3. Errors** — rate of unsuccessful requests
- Explicit (HTTP 5xx) + implicit (HTTP 200 with an error in the body)
- Error rate = errors / total requests

**4. Saturation** — how close the system is to its limits
- CPU queue depth, memory pressure, disk I/O wait
- “How many more requests can the system handle?”`,
    },
    {
      title: `SLI, SLO, and SLA: formalizing reliability`,
      content: `**SLI (Service Level Indicator)** — a concrete quality metric:
- Availability: % of successful requests
- Latency: % of requests faster than 200ms
- Throughput: requests/sec

**SLO (Service Level Objective)** — the target SLI value:
- “99.9% of requests return 2xx over 30 days”
- “95% of requests faster than 200ms”
- “99.99% uptime”

**SLA (Service Level Agreement)** — a contract with the customer:
- “If uptime < 99.9%, the customer gets a 10% credit”
- SLO is usually stricter than SLA (buffer)

**Error Budget** = 100% - SLO:
- SLO 99.9% → error budget 0.1% = 43.2 min/mo downtime
- While budget remains — you can take risk (deploy, experiments)
- Budget exhausted — freeze deploys, focus on stability`,
      code: {
        language: `promql`,
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
        caption: `PromQL for SLI/SLO/Error Budget`,
      },
    },
    {
      title: `Alerting: Alertmanager`,
      content: `**Alertmanager** — routing, grouping, and silencing alerts.

**Pipeline:** Prometheus rules → firing alerts → Alertmanager → PagerDuty/Slack/Email

**Principles of good alerts:**
- **Actionable** — the recipient knows what to do
- **Specific** — not “CPU > 50%”, but “Error rate > 1% for 5 min”
- **No alert fatigue** — better to miss than spam
- **Severity levels:** critical (wake up), warning (check tomorrow), info

**Bad alerts:**
- CPU > 50% (noisy, not actionable)
- Disk > 80% (no trend/prediction)
- Pod restarted (may be a normal rolling update)`,
      code: {
        language: `yaml`,
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
        caption: `Prometheus alert rules`,
      },
    },
    {
      title: `Alertmanager: routing and integrations`,
      content: `**alertmanager.yml** — routing configuration.`,
      code: {
        language: `yaml`,
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
        caption: `Alertmanager routing`,
      },
    },
    {
      title: `Monitoring Kubernetes`,
      content: `**kube-prometheus-stack** — a Helm chart that includes:
- Prometheus + Alertmanager
- Grafana with pre-built dashboards
- node-exporter, kube-state-metrics
- Default alert rules for K8s

**Key K8s metrics:**
- Pod restarts, OOMKilled, CrashLoopBackOff
- Node CPU/memory/disk pressure
- Deployment replicas available vs desired
- PVC usage
- API server latency`,
      code: {
        language: `bash`,
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
        caption: `kube-prometheus-stack in K8s`,
      },
    },
    {
      title: `RED and USE methodologies`,
      content: `**RED (for services/requests):**
- **R**ate — requests per second
- **E**rrors — failed requests per second
- **D**uration — latency distribution

Apply to: API gateways, microservices, web servers.

**USE (for resources/infrastructure):**
- **U**tilization — % time resource busy (CPU 80%)
- **S**aturation — queue depth, wait time
- **E**rrors — error count

Apply to: CPU, memory, disk, network interfaces.

**Combine:** RED at the service level + USE at the infrastructure level = full picture.`,
    },
    {
      title: `On-call and escalation`,
      content: `**On-call rotation** — the on-duty engineer owns alerts 24/7.

**Best practices:**
- Rotation: 1 week per person, at least 3 people in the rotation
- Runbooks for every alert (what to check, how to fix)
- Escalation: 5 min without ack → next level
- Post-incident review after every critical alert
- “Blameless” — focus on process, not the person

**Tools:** PagerDuty, Opsgenie, Grafana OnCall (open-source).

**Runbook template:**
1. Alert description
2. Impact (what is broken for users)
3. Diagnosis steps (commands, dashboards)
4. Mitigation (how to fix quickly)
5. Resolution (how to fix permanently)`,
    },
    {
      title: `Lab: full monitoring stack`,
      content: `**Goal:** stand up Prometheus + Grafana + Alertmanager, create a dashboard and an alert.

**Steps:**
1. Docker Compose: Prometheus, Grafana, node-exporter, Alertmanager
2. Add a scrape target — your app with /metrics
3. Grafana: connect Prometheus data source
4. Create a dashboard: CPU, memory, request rate, error rate, p99 latency
5. Write an alert rule: error rate > 5% for 5 min
6. Configure Alertmanager → Slack webhook
7. Generate load and errors, verify the alert fires
8. Write a runbook for your alert`,
    },
  ],
  practice: [
    `Stand up Prometheus + Grafana via Docker Compose`,
    `Add a /metrics endpoint to your pet project`,
    `Create a Grafana dashboard with RED metrics`,
    `Write 3 alert rules: error rate, latency, disk space`,
    `Configure Alertmanager → Slack`,
    `Install kube-prometheus-stack in minikube`,
    `Complete the “full monitoring stack” lab`,
  ],
  resources: [
    { title: `Prometheus Docs`, url: `https://prometheus.io/docs/` },
    { title: `Grafana Tutorials`, url: `https://grafana.com/tutorials/` },
    { title: `Google SRE Book`, url: `https://sre.google/sre-book/table-of-contents/` },
    { title: `kube-prometheus-stack`, url: `https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack` },
  ],
  quiz: [
    {
      question: `How does a metric differ from a log?`,
      options: [
        `A metric is a numeric time series; a log is a text event with context`,
        `A log is always realtime-only`,
        `A metric is not stored`,
        `There is no difference`,
      ],
      answer: `A metric is a numeric time series; a log is a text event with context`,
    },
    {
      question: `What are SLI and SLO?`,

      options: [
        `SLI is a measurable quality indicator; SLO is the target SLI value over a period.`,
        `SLI — cloud budget; SLO — on-call team name`,
        `SLI and SLO — alert types in PagerDuty`,
        `SLO replaces the need for metrics`,
      ],
      answer: `SLI is a measurable quality indicator; SLO is the target SLI value over a period.`,
    },
    {
      question: `What is alerting for?`,
      options: [
        `Notify people about a problem by rules, without replacing diagnosis`,
        `Store all logs forever`,
        `Automatically fix any bug`,
        `Replace on-call`,
      ],
      answer: `Notify people about a problem by rules, without replacing diagnosis`,
    },
    {
      question: `What is cardinality in metrics and why is it dangerous?`,
      options: [
        `Many unique label combinations → growth in storage and cost`,
        `Low scrape frequency`,
        `Absence of Grafana`,
        `Using HTTPS`,
      ],
      answer: `Many unique label combinations → growth in storage and cost`,
    },
    {
      question: `Name the four golden monitoring signals (Google SRE).`,


      options: [
        `Latency, Traffic, Errors, Saturation.`,
        `CPU, Memory, Disk, Network only`,
        `Logs, Traces, Metrics, Profiles`,
        `Uptime, Cost, Users, Revenue`,
      ],
      answer: `Latency, Traffic, Errors, Saturation.`,
    },
    {
      question: `What does blackbox monitoring do?`,
      options: [
        `Checks availability from the outside (HTTP, TCP, DNS)`,
        `Takes a JVM heap dump`,
        `Reads application logs from a file`,
        `Manages Kubernetes RBAC`,
      ],
      answer: `Checks availability from the outside (HTTP, TCP, DNS)`,
    },
    {
      question: `What is an error budget in SRE context?`,
      options: [
        `Allowed amount of downtime/errors before breaching the SLO`,
        `Budget for buying servers`,
        `CPU limit in Kubernetes`,
        `Number of on-call shifts`,
      ],
      answer: `Allowed amount of downtime/errors before breaching the SLO`,
      explanation: `Links reliability to release pace: exhausted budget — slow down changes.`,
    },
    {
      question: `Why use the RED method (Rate, Errors, Duration)?`,
      options: [
        `Core metric set for request-driven services`,
        `Only for batch jobs`,
        `Replaces logging`,
        `TLS encryption method`,
      ],
      answer: `Core metric set for request-driven services`,
    },
    {
      question: `What does a recording rule do in Prometheus?`,
      options: [
        `Precomputes and stores a frequently used query as a new metric`,
        `Deletes old metrics`,
        `Sends email alerts`,
        `Creates Grafana dashboards`,
      ],
      answer: `Precomputes and stores a frequently used query as a new metric`,
      explanation: `Speeds up dashboards and reduces query load at high cardinality.`,
    },
    {
      question: `Name three signs of a "noisy" alert worth revisiting.`,
      options: [
        `Fires without actionable steps, doesn't correlate with user impact, duplicates other alerts.`,
        `Always pages on-call with clear runbooks.`,
        `Only triggers during planned maintenance windows.`,
        `Correlates strongly with customer-facing outages every time.`,
      ],
      answer: `Fires without actionable steps, doesn't correlate with user impact, duplicates other alerts.`,
    },
  ],
}

export default translation
