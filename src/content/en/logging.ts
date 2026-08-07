import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `Logging: structured logs, Loki, ELK`,
  duration: `5–6 hours`,
  description: `Structured logging, Loki, ELK stack, and log aggregation in Kubernetes`,
  sections: [
    {
      title: `Why centralize logs`,
      content: `In distributed systems logs are scattered across dozens/hundreds of instances. Without centralization, diagnosis becomes a nightmare.

**Problems without centralization:**
- In K8s a pod is recreated — logs on the pod disk are **lost**
- 50 microservices — you need SSH to each one to view logs
- Event correlation is impossible (a request passed through 5 services)
- No retention policy — disks fill up

**Centralized logging solves:**
- A single search point across all services
- Retention policy (30–90 days)
- Correlation by trace_id / request_id
- Alerts on log patterns (ERROR, OOM, exception)`,
    },
    {
      title: `Log levels and best practices`,
      content: `**Levels (RFC 5424):**
- **DEBUG** — detailed debugging (dev only)
- **INFO** — normal events (startup, request completed)
- **WARN** — potential problems (retry, deprecated API)
- **ERROR** — errors that need attention (exception, failed request)
- **FATAL/CRITICAL** — the service cannot continue

**Best practices:**
1. **Structured logs** (JSON) — not plain text
2. **Correlation ID** — one ID for the whole request chain
3. **Context** — service name, version, environment, hostname
4. **Do not log secrets** — passwords, tokens, PII (GDPR!)
5. **Correct level** — ERROR only for real errors
6. **Retention** — 30 days hot, 90 days warm, archive for compliance
7. **Sampling** — for high traffic: log 100% ERROR, 1% INFO`,
    },
    {
      title: `Structured logging`,
      content: `**Plain text (bad):**
\`2026-07-09 ERROR: Database connection failed for user 123\`

**JSON (good):**
Each field is a separate key, parsed automatically, filtered in Loki/ELK.`,
      code: {
        language: `json`,
        code: `{
  "timestamp": "2026-07-09T10:15:30.123Z",
  "level": "ERROR",
  "service": "api-gateway",
  "version": "2.1.0",
  "environment": "production",
  "trace_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "span_id": "span-001",
  "request_id": "req-98765",
  "method": "POST",
  "path": "/api/v1/orders",
  "status_code": 500,
  "duration_ms": 1523,
  "user_id": "user-123",
  "message": "Database connection failed",
  "error": {
    "type": "ConnectionTimeout",
    "message": "connection timeout after 30s",
    "stack": "..."
  }
}`,
        caption: `Structured JSON log`,
      },
    },
    {
      title: `Implementing structured logging`,
      content: `Examples for Python and Node.js — the most popular stacks in DevOps.`,
      code: {
        language: `python`,
        code: `import structlog
import logging

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
)

log = structlog.get_logger()

def handle_request(request):
    trace_id = request.headers.get("X-Trace-Id", "unknown")
    log.info("request_started",
        trace_id=trace_id,
        method=request.method,
        path=request.path,
    )
    try:
        result = process_order(request)
        log.info("request_completed",
            trace_id=trace_id,
            status_code=200,
            duration_ms=result.duration,
        )
    except Exception as e:
        log.error("request_failed",
            trace_id=trace_id,
            error_type=type(e).__name__,
            error_message=str(e),
            exc_info=True,
        )`,
        caption: `Structured logging in Python (structlog)`,
      },
    },
    {
      title: `ELK Stack: Elasticsearch, Logstash, Kibana`,
      content: `**ELK** is the classic enterprise logging stack.

**Components:**
- **Elasticsearch** — search engine and store (JSON documents, full-text search)
- **Logstash** — collect, parse, transform logs (heavy, JVM)
- **Kibana** — visualization, search, dashboards
- **Beats** — lightweight collection agents (Filebeat, Metricbeat)

**EFK** — Elasticsearch + **Fluentd** (instead of Logstash) + Kibana. Fluentd is lighter and native to K8s.

**ELK pros:**
- Powerful full-text search
- Mature ecosystem, many plugins
- Kibana — rich visualization

**ELK cons:**
- Resource-heavy (Elasticsearch eats RAM: 4+ GB minimum)
- Expensive to run (especially managed — Elastic Cloud)
- Complex setup and tuning`,
      code: {
        language: `yaml`,
        code: `# filebeat.yml — сбор логов с файлов
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/app/*.log
    json.keys_under_root: true
    json.add_error_key: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "app-logs-%{+yyyy.MM.dd}"

# Logstash pipeline (альтернатива)
# input { beats { port => 5044 } }
# filter {
#   json { source => "message" }
#   date { match => ["timestamp", "ISO8601"] }
# }
# output { elasticsearch { hosts => ["es:9200"] } }`,
        caption: `Filebeat → Elasticsearch`,
      },
    },
    {
      title: `Grafana Loki: a lightweight ELK alternative`,
      content: `**Loki** is log aggregation from Grafana Labs. Philosophy: “like Prometheus, but for logs”.

**Key differences from ELK:**
- **Does not index content** — only labels (metadata)
- Stores logs compressed in object storage (S3, GCS)
- **Cheaper** by 10–100x vs Elasticsearch
- Queries via **LogQL** (similar to PromQL)
- Native Grafana integration (one UI for metrics + logs)

**Trade-off:** no full-text search over content. Search by labels + grep over content. For 90% of DevOps tasks — enough.`,
      code: {
        language: `yaml`,
        code: `# promtail.yml — агент сбора логов для Loki
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: app
    static_configs:
      - targets: [localhost]
        labels:
          job: my-app
          environment: production
          __path__: /var/log/app/*.log
    pipeline_stages:
      - json:
          expressions:
            level: level
            trace_id: trace_id
      - labels:
          level:
          trace_id:`,
        caption: `Promtail → Loki`,
      },
    },
    {
      title: `LogQL: queries in Loki`,
      content: `**LogQL** is Loki's query language. Two types: log queries and metric queries.`,
      code: {
        language: `logql`,
        code: `# Все логи от api-gateway в production
{service="api-gateway", environment="production"}

# Фильтр по содержимому (grep)
{service="api-gateway"} |= "error"
{service="api-gateway"} |~ "timeout|connection.refused"
{service="api-gateway"} != "healthcheck"

# JSON parsing + фильтр
{service="api-gateway"} | json | level="ERROR"

# Metric query: error rate
rate({service="api-gateway"} | json | level="ERROR" [5m])

# Count errors per service
sum by (service) (count_over_time({level="ERROR"}[1h]))

# Trace correlation
{trace_id="a1b2c3d4-e5f6-7890-abcd-ef1234567890"}`,
        caption: `LogQL — common queries`,
      },
    },
    {
      title: `PLG Stack: Prometheus + Loki + Grafana`,
      content: `**PLG** is a modern open-source alternative to ELK + Prometheus. One UI (Grafana) for metrics and logs.

**Advantages:**
- Single UI for metrics and logs
- Correlation: click a spike in a metric → logs for the same period
- Cheaper than ELK (Loki + object storage vs Elasticsearch)
- Simpler to operate

**Docker Compose PLG:**`,
      code: {
        language: `yaml`,
        code: `# docker-compose.plg.yml
services:
  loki:
    image: grafana/loki:latest
    ports: ["3100:3100"]
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail.yml:/etc/promtail/config.yml

  prometheus:
    image: prom/prometheus:latest
    ports: ["9090:9090"]

  grafana:
    image: grafana/grafana:latest
    ports: ["3000:3000"]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin`,
        caption: `PLG Stack — Docker Compose`,
      },
    },
    {
      title: `Log aggregation in Kubernetes`,
      content: `In K8s logs are written to the container **stdout/stderr**. kubelet collects them under \`/var/log/pods/\`.

**Collection approaches:**

**1. Node-level agent (recommended):**
- DaemonSet: Fluentd/Fluent Bit/Promtail on every node
- Collects logs from all pods on the node
- Enriches metadata (namespace, pod, container, labels)

**2. Sidecar container:**
- Second container in the pod, reads the main app's logs
- For legacy apps that write to a file instead of stdout

**3. Direct shipping:**
- The app sends logs itself (not recommended — coupling)

**Best practice:** stdout → DaemonSet (Fluent Bit) → Loki/Elasticsearch.`,
    },
    {
      title: `Fluent Bit in Kubernetes`,
      content: `**Fluent Bit** is a lightweight log processor (0.5 MB RAM vs 40+ MB Logstash). The standard for K8s.`,
      code: {
        language: `yaml`,
        code: `# fluent-bit-values.yaml (Helm)
config:
  service:
    Flush: 1
    Log_Level: info
  inputs: |
    [INPUT]
        Name tail
        Path /var/log/containers/*.log
        Parser docker
        Tag kube.*
        Mem_Buf_Limit 5MB
  filters: |
    [FILTER]
        Name kubernetes
        Match kube.*
        Merge_Log On
        K8S-Logging.Parser On
  outputs: |
    [OUTPUT]
        Name loki
        Match *
        Host loki.monitoring.svc
        Port 3100
        Labels job=fluentbit
        auto_kubernetes_labels on

# Установка
# helm repo add fluent https://fluent.github.io/helm-charts
# helm install fluent-bit fluent/fluent-bit -f fluent-bit-values.yaml`,
        caption: `Fluent Bit → Loki in K8s`,
      },
    },
    {
      title: `Correlating logs, metrics, and traces`,
      content: `**Unified observability** — linking the three pillars via shared identifiers.

**trace_id** — end-to-end request ID:
1. API Gateway generates trace_id
2. Passes it in the X-Trace-Id header downstream
3. Each service logs with trace_id
4. Prometheus exemplars link metrics to a trace
5. Grafana: metrics → logs → traces in one click

**Grafana Tempo** — backend for traces. Integrates with Loki via trace_id.

**OpenTelemetry** — the standard for instrumentation (metrics + logs + traces with one SDK).`,
      code: {
        language: `yaml`,
        code: `# docker-compose с Tempo для traces
services:
  tempo:
    image: grafana/tempo:latest
    ports: ["3200:3200", "4317:4317"]
    command: ["-config.file=/etc/tempo.yaml"]

  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    ports: ["4318:4318"]
    volumes:
      - ./otel-config.yaml:/etc/otelcol/config.yaml`,
        caption: `OpenTelemetry Collector + Tempo`,
      },
    },
    {
      title: `Alerts on logs`,
      content: `You can build alerts on log patterns:

**Loki Ruler** — alerting rules on LogQL queries (like Prometheus rules).

**Examples:**
- ERROR rate > 10/min
- “OutOfMemory” in logs
- “connection refused” > 5 in 5 min
- Absence of logs (service silent = down)

**Elasticsearch Watcher** — alerting in the ELK stack.

**Prefer metric-based alerts** where possible (error rate from Prometheus); log-based — for specific patterns.`,
      code: {
        language: `yaml`,
        code: `# Loki alerting rule
groups:
  - name: log-alerts
    rules:
      - alert: HighErrorLogRate
        expr: |
          sum(rate({service="api-gateway"} | json | level="ERROR" [5m])) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High ERROR log rate in api-gateway"

      - alert: OOMDetected
        expr: |
          count_over_time({namespace="prod"} |~ "OOMKilled|OutOfMemory"[5m]) > 0
        for: 1m
        labels:
          severity: critical`,
        caption: `Loki alerting rules`,
      },
    },
    {
      title: `Comparing logging stacks`,
      content: `| Criteria | ELK | Loki (PLG) | CloudWatch Logs |
|----------|-----|------------|-----------------|
| Indexing | Full-text of content | Labels only | Limited |
| Cost | High (RAM, cluster) | Low (object storage) | Pay per ingest/storage |
| Ops complexity | High | Medium | Low (managed) |
| Search | Powerful | Labels + filter/grep | CloudWatch Insights |
| Metrics correlation | Separate stack | Native in Grafana | CloudWatch metrics |
| K8s fit | EFK/Fluentd | Excellent (Promtail/Fluent Bit) | Via agents |

**When to choose what:**
- **Loki/PLG** — most DevOps teams, cost-sensitive, Grafana already in use
- **ELK** — need powerful full-text search, enterprise analytics
- **CloudWatch** — AWS-only, minimal ops overhead`,
    },
    {
      title: `Lab: PLG stack with structured logging`,
      content: `**Goal:** set up structured logging and a PLG stack.

**Steps:**
1. Add structured JSON logging to the app (structlog / pino)
2. Docker Compose: Loki + Promtail + Grafana + Prometheus
3. Configure Promtail to scrape app logs
4. Grafana: Loki data source, explore LogQL queries
5. Correlate: metrics dashboard → logs for the same time range
6. Write a Loki alert on ERROR rate
7. Optional: Fluent Bit DaemonSet in minikube → Loki`,
    },
  ],
  practice: [
    `Add structured JSON logging to your pet project`,
    `Stand up Loki + Promtail + Grafana via Docker Compose`,
    `Write 5 useful LogQL queries for your app`,
    `Configure Fluent Bit as a DaemonSet in minikube`,
    `Set up log-based alerts in Loki Ruler`,
    `Compare ELK vs Loki for your use case (cost, search needs)`,
    `Complete the “PLG stack with structured logging” lab`,
  ],
  resources: [
    { title: `Grafana Loki`, url: `https://grafana.com/oss/loki/` },
    { title: `Fluent Bit`, url: `https://fluentbit.io` },
    { title: `Elastic Stack`, url: `https://www.elastic.co/elastic-stack` },
    { title: `OpenTelemetry`, url: `https://opentelemetry.io` },
  ],
  quiz: [
    {
      question: `What is structured logging?`,
      options: [
        `Logs in JSON/fields for machine search and parsing`,
        `Logs only in Russian`,
        `Output without a timestamp`,
        `Logs only in container stderr with no collection`,
      ],
      answer: `Logs in JSON/fields for machine search and parsing`,
    },
    {
      question: `Why centralize logs (ELK, Loki, CloudWatch Logs)?`,
      options: [
        `A single search point, correlation, retention, and access when individual hosts are down.`,
        `Logs must stay only on each local disk forever.`,
        `Centralization removes the need for timestamps.`,
        `It prevents any log retention policies.`,
      ],
      answer: `A single search point, correlation, retention, and access when individual hosts are down.`,
    },
    {
      question: `What is a log aggregation pipeline?`,
      options: [
        `Collect → parse → index/store → search/alerts`,
        `Only logrotate on one server`,
        `Compiling binaries`,
        `Terraform apply`,
      ],
      answer: `Collect → parse → index/store → search/alerts`,
    },
    {
      question: `Why should you not log passwords and tokens?`,
      options: [
        `Risk of leakage via log storage and analyst access`,
        `Logs do not support strings`,
        `CPU increases by 100%`,
        `JSON forbids secrets`,
      ],
      answer: `Risk of leakage via log storage and analyst access`,
    },
    {
      question: `How does a trace (distributed tracing) complement logs?`,
      options: [
        `It shows the request path across services with latency per span, making bottlenecks easier to find.`,
        `Traces replace the need for any logs entirely.`,
        `Traces only store ERROR level messages.`,
        `Tracing is unrelated to distributed systems.`,
      ],
      answer: `It shows the request path across services with latency per span, making bottlenecks easier to find.`,
    },
    {
      question: `What does a sidecar agent for logs do in Kubernetes?`,
      options: [
        `Reads logs from a shared volume/stdout and sends them to a backend`,
        `Replaces kube-proxy`,
        `Creates Ingress`,
        `Stores Docker images`,
      ],
      answer: `Reads logs from a shared volume/stdout and sends them to a backend`,
    },
    {
      question: `What is a log retention policy?`,
      options: [
        `Rules for how long to keep and when to delete logs for compliance/cost`,
        `Kubernetes RBAC policy`,
        `DNS record TTL`,
        `Docker image compression`,
      ],
      answer: `Rules for how long to keep and when to delete logs for compliance/cost`,
      explanation: `Storing all logs forever quickly becomes expensive.`,
    },
    {
      question: `Why add correlation_id / trace_id to structured logs?`,
      options: [
        `Link logs from one request across microservices`,
        `Speed up CPU by 50%`,
        `Replace metrics`,
        `Encrypt logs at rest`,
      ],
      answer: `Link logs from one request across microservices`,
    },
    {
      question: `How does the ELK stack differ from Grafana Loki at a high level?`,
      options: [
        `ELK often full-text indexes (Elasticsearch); Loki indexes labels, body compressed`,
        `Loki does not work with Kubernetes`,
        `ELK does not support JSON`,
        `No difference`,
      ],
      answer: `ELK often full-text indexes (Elasticsearch); Loki indexes labels, body compressed`,
      explanation: `Loki is cheaper with proper labels; ELK is stronger for complex full-text search.`,
    },
    {
      question: `What fields should you at minimum include in a production service structured log?`,
      options: [
        `timestamp, level, message, service/name, correlation/trace id, environment.`,
        `emoji, wallpaper path, RAM size`,
        `only free-text stack traces with no fields`,
        `hostname only`,
      ],
      answer: `timestamp, level, message, service/name, correlation/trace id, environment.`,
    },
  ],
}

export default translation
