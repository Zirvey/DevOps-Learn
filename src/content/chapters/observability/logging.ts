import type { Chapter } from '../../../types'

export const loggingChapter: Chapter = {
  id: 'logging',
  slug: 'logging',
  title: 'Логирование: структурированные логи, Loki, ELK',
  moduleId: 'observability',
  order: 1,
  duration: '5–6 часов',
  level: 'intermediate',
  description:
    'Структурированное логирование, Loki, ELK stack, агрегация логов в Kubernetes',
  sections: [
    {
      title: 'Зачем централизовать логи',
      content: `В распределённых системах логи разбросаны по десяткам/сотням инстансов. Без централизации диагностика превращается в кошмар.

**Проблемы без централизации:**
- В K8s pod пересоздаётся — логи на диске pod'а **теряются**
- 50 микросервисов — нужно SSH на каждый для просмотра логов
- Корреляция событий невозможна (запрос прошёл через 5 сервисов)
- Нет retention policy — диски переполняются

**Централизованное логирование решает:**
- Единая точка поиска по всем сервисам
- Retention policy (30–90 дней)
- Корреляция по trace_id / request_id
- Алерты на паттерны в логах (ERROR, OOM, exception)`,
    },
    {
      title: 'Уровни логирования и best practices',
      content: `**Уровни (RFC 5424):**
- **DEBUG** — детальная отладка (только dev)
- **INFO** — нормальные события (startup, request completed)
- **WARN** — потенциальные проблемы (retry, deprecated API)
- **ERROR** — ошибки, требующие внимания (exception, failed request)
- **FATAL/CRITICAL** — сервис не может продолжать работу

**Best practices:**
1. **Структурированные логи** (JSON) — не plain text
2. **Correlation ID** — один ID на весь request chain
3. **Контекст** — service name, version, environment, hostname
4. **Не логируй секреты** — пароли, tokens, PII (GDPR!)
5. **Правильный уровень** — ERROR только для реальных ошибок
6. **Retention** — 30 дней hot, 90 дней warm, archive для compliance
7. **Sampling** — для high-traffic: логируй 100% ERROR, 1% INFO`,
    },
    {
      title: 'Структурированное логирование',
      content: `**Plain text (плохо):**
\`2026-07-09 ERROR: Database connection failed for user 123\`

**JSON (хорошо):**
Каждое поле — отдельный ключ, парсится автоматически, фильтруется в Loki/ELK.`,
      code: {
        language: 'json',
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
        caption: 'Структурированный JSON-лог',
      },
    },
    {
      title: 'Реализация structured logging',
      content: `Примеры для Python и Node.js — самые популярные стеки в DevOps.`,
      code: {
        language: 'python',
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
        caption: 'Structured logging в Python (structlog)',
      },
    },
    {
      title: 'ELK Stack: Elasticsearch, Logstash, Kibana',
      content: `**ELK** — классический enterprise стек логирования.

**Компоненты:**
- **Elasticsearch** — поисковый движок и хранилище (JSON documents, full-text search)
- **Logstash** — сбор, парсинг, трансформация логов (тяжёлый, на JVM)
- **Kibana** — визуализация, поиск, дашборды
- **Beats** — легковесные агенты сбора (Filebeat, Metricbeat)

**EFK** — Elasticsearch + **Fluentd** (вместо Logstash) + Kibana. Fluentd легче, нативен для K8s.

**Плюсы ELK:**
- Мощный full-text search
- Зрелая экосистема, много плагинов
- Kibana — богатая визуализация

**Минусы ELK:**
- Ресурсоёмкий (Elasticsearch жрёт RAM: 4+ GB minimum)
- Дорогой в эксплуатации (особенно managed — Elastic Cloud)
- Сложная настройка и tuning`,
      code: {
        language: 'yaml',
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
        caption: 'Filebeat → Elasticsearch',
      },
    },
    {
      title: 'Grafana Loki: лёгкая альтернатива ELK',
      content: `**Loki** — log aggregation от Grafana Labs. Философия: «как Prometheus, но для логов».

**Ключевые отличия от ELK:**
- **Не индексирует содержимое** — только labels (metadata)
- Хранит логи сжатыми в object storage (S3, GCS)
- **Дешевле** в 10–100x по сравнению с Elasticsearch
- Запросы через **LogQL** (похож на PromQL)
- Нативная интеграция с Grafana (один UI для metrics + logs)

**Trade-off:** нет full-text search по содержимому. Поиск по labels + grep по содержимому. Для 90% DevOps задач — достаточно.`,
      code: {
        language: 'yaml',
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
        caption: 'Promtail → Loki',
      },
    },
    {
      title: 'LogQL: запросы в Loki',
      content: `**LogQL** — язык запросов Loki. Два типа: log queries и metric queries.`,
      code: {
        language: 'logql',
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
        caption: 'LogQL — типичные запросы',
      },
    },
    {
      title: 'PLG Stack: Prometheus + Loki + Grafana',
      content: `**PLG** — современная open-source альтернатива ELK + Prometheus. Один UI (Grafana) для metrics и logs.

**Преимущества:**
- Единый UI для метрик и логов
- Корреляция: клик на spike в метрике → логи за тот же период
- Дешевле ELK (Loki + object storage vs Elasticsearch)
- Проще в эксплуатации

**Docker Compose PLG:**`,
      code: {
        language: 'yaml',
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
        caption: 'PLG Stack — Docker Compose',
      },
    },
    {
      title: 'Агрегация логов в Kubernetes',
      content: `В K8s логи пишутся в **stdout/stderr** контейнера. kubelet собирает их в \`/var/log/pods/\`.

**Подходы к сбору:**

**1. Node-level agent (рекомендуется):**
- DaemonSet: Fluentd/Fluent Bit/Promtail на каждой node
- Собирает логи всех pods на node
- Обогащает metadata (namespace, pod, container, labels)

**2. Sidecar container:**
- Второй контейнер в pod'е, читает логи основного
- Для legacy apps, пишущих в файл вместо stdout

**3. Direct shipping:**
- Приложение само отправляет логи (не рекомендуется — coupling)

**Best practice:** stdout → DaemonSet (Fluent Bit) → Loki/Elasticsearch.`,
    },
    {
      title: 'Fluent Bit в Kubernetes',
      content: `**Fluent Bit** — легковесный log processor (0.5 MB RAM vs 40+ MB Logstash). Стандарт для K8s.`,
      code: {
        language: 'yaml',
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
        caption: 'Fluent Bit → Loki в K8s',
      },
    },
    {
      title: 'Корреляция логов, метрик и трейсов',
      content: `**Unified observability** — связь между тремя столпами через общие идентификаторы.

**trace_id** — сквозной ID запроса:
1. API Gateway генерирует trace_id
2. Передаёт в заголовке X-Trace-Id downstream
3. Каждый сервис логирует с trace_id
4. Prometheus exemplars связывают метрики с trace
5. Grafana: metrics → logs → traces одним кликом

**Grafana Tempo** — backend для traces. Интеграция с Loki через trace_id.

**OpenTelemetry** — стандарт для instrumentation (metrics + logs + traces единым SDK).`,
      code: {
        language: 'yaml',
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
        caption: 'OpenTelemetry Collector + Tempo',
      },
    },
    {
      title: 'Алерты на логи',
      content: `Алерты можно строить на паттерны в логах:

**Loki Ruler** — alerting rules на LogQL queries (как Prometheus rules).

**Примеры:**
- ERROR rate > 10/min
- «OutOfMemory» в логах
- «connection refused» > 5 за 5 мин
- Отсутствие логов (сервис молчит = упал)

**Elasticsearch Watcher** — alerting в ELK stack.

**Предпочитай metric-based alerts** где возможно (error rate из Prometheus), log-based — для специфических паттернов.`,
      code: {
        language: 'yaml',
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
        caption: 'Loki alerting rules',
      },
    },
    {
      title: 'Сравнение стеков логирования',
      content: `| Критерий | ELK | PLG (Loki) | CloudWatch |
|----------|-----|-----------|------------|
| Поиск | Full-text | Labels + grep | Filter patterns |
| Стоимость | Высокая | Низкая | Pay per GB |
| RAM | 4+ GB/node | 0.5 GB | Managed |
| K8s integration | EFK (Fluentd) | Promtail/Fluent Bit | Fluent Bit |
| UI | Kibana | Grafana | CloudWatch Console |
| Масштаб | Enterprise | Startup–Mid | AWS-native |

**Рекомендация:**
- **Обучение/pet-project:** PLG (Docker Compose)
- **K8s production:** PLG или EFK
- **AWS-only, без ops:** CloudWatch Logs
- **Enterprise, full-text search:** ELK`,
    },
    {
      title: 'Лабораторная: PLG stack с structured logging',
      content: `**Цель:** поднять PLG, настроить structured logging, корреляцию по trace_id.

**Шаги:**
1. Docker Compose: Loki + Promtail + Prometheus + Grafana
2. Добавь JSON logging в pet-проект (structlog / pino)
3. Каждый request генерирует trace_id (UUID)
4. Promtail собирает логи, парсит JSON, создаёт labels
5. Grafana: Explore → Loki → фильтр по level=ERROR
6. Создай dashboard: log volume + error rate
7. Корреляция: найди trace_id в логах → найди метрики за тот же период
8. Напиши Loki alert rule на ERROR rate`,
    },
  ],
  practice: [
    'Добавь JSON structured logging в pet-проект',
    'Подними Loki + Promtail + Grafana (Docker Compose)',
    'Настрой trace_id propagation между сервисами',
    'Создай Grafana dashboard для логов',
    'Установи Fluent Bit в minikube, отправляй логи в Loki',
    'Напиши LogQL запросы: errors, trace correlation, rate',
    'Пройди лабораторную «PLG stack»',
  ],
  resources: [
    { title: 'Grafana Loki', url: 'https://grafana.com/oss/loki/' },
    { title: 'Fluent Bit', url: 'https://fluentbit.io' },
    { title: 'Elastic Stack', url: 'https://www.elastic.co/elastic-stack' },
    { title: 'OpenTelemetry', url: 'https://opentelemetry.io' },
  ],
}
