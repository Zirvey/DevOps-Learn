import type { Chapter } from '../../../types'

export const zabbixChapter: Chapter = {
  id: 'zabbix',
  slug: 'zabbix',
  title: 'Zabbix: мониторинг инфраструктуры',
  moduleId: 'observability',
  order: 3,
  duration: '5–6 часов',
  level: 'intermediate',
  description:
    'Архитектура Zabbix, агенты, шаблоны, триггеры, actions, интеграция с Grafana — enterprise мониторинг инфраструктуры',
  sections: [
    {
      title: 'Zabbix vs Prometheus: когда что использовать',
      content: `**Zabbix** и **Prometheus** — две популярные open-source системы мониторинга, но с разной философией.

| Критерий | Zabbix | Prometheus |
|----------|--------|------------|
| **Модель** | Push + Pull (agent → server) | Pull (scrape /metrics) |
| **UI** | Встроенный web frontend | Grafana (отдельно) |
| **Конфигурация** | UI + API + шаблоны | YAML + PromQL |
| **Алертинг** | Встроенный (triggers → actions) | Alertmanager (отдельно) |
| **Discovery** | LLD, network discovery | Service discovery |
| **Типичный use case** | Серверы, сеть, legacy, enterprise | Cloud-native, K8s, микросервисы |

**Zabbix сильнее когда:**
- Нужен all-in-one: UI, алерты, reporting из одной системы
- Мониторинг гетерогенной инфраструктуры (Linux, Windows, SNMP-устройства)
- Remote sites через Zabbix Proxy
- Организация хочет шаблоны и inventory «из коробки»

**Prometheus сильнее когда:**
- Kubernetes-native стек (kube-prometheus-stack)
- Микросервисы с /metrics endpoint
- PromQL и экосистема CNCF
- Short-lived jobs, custom metrics в приложении

**В production часто оба:** Prometheus для K8s/apps, Zabbix для bare metal, сети, Windows AD, SNMP. Grafana объединяет дашборды.`,
    },
    {
      title: 'Архитектура Zabbix',
      content: `**Компоненты Zabbix 7.x:**

**1. Zabbix Server** — центральный мозг:
- Получает данные от agents и proxies
- Вычисляет triggers, выполняет actions
- Пишет в database, обслуживает frontend
- Один active server в кластере (HA через failover)

**2. Zabbix Database** — хранение конфигурации и истории:
- **MySQL/MariaDB**, **PostgreSQL**, или **TimescaleDB** (для больших объёмов)
- History tables (сырые данные) + trends (агрегаты)
- Конфигурация: hosts, templates, triggers

**3. Zabbix Frontend** — PHP web UI:
- Dashboards, maps, reports, configuration
- Обычно на том же сервере или отдельный nginx + php-fpm

**4. Zabbix Agent / Agent 2** — на мониторируемых хостах:
- Собирает локальные метрики (CPU, disk, custom scripts)
- Agent 2 — Go-based, плагины, активный режим (push к server)

**5. Zabbix Proxy** — для remote sites и scale:
- Собирает данные локально, буферизует, отправляет на server
- Снижает latency и нагрузку на central server
- Полезен при ограниченной связности WAN

**Поток данных:**
\`Agent/Proxy → Server → DB\` (метрики)
\`Server → Trigger evaluation → Action → Notification\` (алерты)

**Режимы сбора:**
- **Active checks** — agent сам отправляет данные (меньше открытых портов)
- **Passive checks** — server запрашивает agent (порт 10050)
- **SNMP** — для switches, routers, UPS
- **IPMI** — hardware sensors
- **HTTP/Java/Grafana** — application monitoring`,
    },
    {
      title: 'Установка: обзор развёртывания',
      content: `**Варианты установки Zabbix Server:**

**1. Пакеты (APT/YUM)** — классика для production:
- Ubuntu/Debian: официальный repo Zabbix
- RHEL/CentOS: zabbix-release rpm
- Компоненты: server, frontend, agent, proxy — отдельные пакеты

**2. Docker / Docker Compose** — lab и небольшие инсталляции:
- Официальные images: zabbix/zabbix-server-pgsql, zabbix-web-nginx-pgsql
- Быстрый старт, но backup/upgrade требуют дисциплины

**3. Kubernetes (Helm)** — cloud-native деплой:
- community chart или zabbix-kubernetes
- External DB (RDS, managed PostgreSQL) рекомендуется

**Минимальные требования (small env):**
- 2 CPU, 4 GB RAM, 50 GB disk (зависит от retention и hosts count)
- PostgreSQL 15+ или MySQL 8+

**Первый запуск после установки:**
1. Открыть web UI (http://server/zabbix)
2. Проверить что DB schema создана
3. Login: Admin / zabbix (сменить пароль!)
4. **Configuration → Hosts** — добавить первый host
5. Установить agent на host, link template «Linux by Zabbix agent»

**Важно:** timezone, NTP на всех компонентах. Рассинхрон времени ломает triggers и graphs.`,
      code: {
        language: 'bash',
        code: `# Ubuntu 24.04 — установка Zabbix 7.x server + frontend (PostgreSQL)
wget https://repo.zabbix.com/zabbix/7.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_7.0-1+ubuntu24.04_all.deb
sudo dpkg -i zabbix-release_7.0-1+ubuntu24.04_all.deb
sudo apt update
sudo apt install -y zabbix-server-pgsql zabbix-frontend-php zabbix-nginx-conf zabbix-sql-scripts zabbix-agent2

# Создать DB (пример PostgreSQL)
sudo -u postgres createuser --pwprompt zabbix
sudo -u postgres createdb -O zabbix zabbix
zcat /usr/share/zabbix-sql-scripts/postgresql/server.sql.gz | sudo -u zabbix psql zabbix

# Настроить /etc/zabbix/zabbix_server.conf
# DBHost=localhost DBName=zabbix DBUser=zabbix DBPassword=<password>

sudo systemctl enable --now zabbix-server zabbix-agent2 nginx php8.3-fpm
sudo systemctl status zabbix-server`,
        caption: 'Установка Zabbix Server на Ubuntu (обзор)',
      },
    },
    {
      title: 'Zabbix Agent 2: установка и конфигурация',
      content: `**Zabbix Agent 2** — рекомендуемый агент (замена legacy Agent 1).

**Преимущества Agent 2:**
- Написан в Go, единый бинарник
- Плагинная архитектура (MySQL, Redis, Docker, SMART, etc.)
- Active и passive режимы
- Совместим с keys legacy agent (большинство)

**Установка на Linux:**
\`apt install zabbix-agent2\` или пакет из repo Zabbix.

**Ключевые параметры zabbix_agent2.conf:**
- \`Server=\` — IP Zabbix server/proxy (для passive, кто может запрашивать)
- \`ServerActive=\` — адрес для active checks (agent push)
- \`Hostname=\` — должен совпадать с именем host в Zabbix UI
- \`ListenPort=10050\` — порт passive mode

**User parameters / plugins:**
- Custom metrics через \`Plugins.SystemRun\` или legacy \`UserParameter\`
- Официальные plugins: \`mysql\`, \`redis\`, \`docker\`, \`memcached\`

**Безопасность:**
- Agent не должен быть доступен из internet
- \`AllowKey=system.run[*]\` — ограничь или отключи (RCE risk)
- Firewall: 10050 только от server/proxy`,
      code: {
        language: 'ini',
        code: `# /etc/zabbix/zabbix_agent2.conf (фрагмент)
PidFile=/var/run/zabbix/zabbix_agent2.pid
LogFile=/var/log/zabbix/zabbix_agent2.log
LogFileSize=10

# Passive: кто может подключаться к agent
Server=10.0.1.10,10.0.1.20
ListenPort=10050

# Active: куда agent отправляет данные
ServerActive=10.0.1.10:10051

# Имя host в Zabbix UI — должно совпадать!
Hostname=web-prod-01

# Custom user parameter (legacy style)
UserParameter=nginx.status,curl -s -o /dev/null -w '%{http_code}' http://localhost/nginx_status

# Agent 2 plugin example (Docker)
Plugins.Docker.Endpoint=unix:///var/run/docker.sock`,
        caption: 'Конфигурация Zabbix Agent 2',
      },
    },
    {
      title: 'Hosts, host groups и inventory',
      content: `**Host** — логическая сущность для мониторинга (сервер, VM, switch, service).

**Создание host:**
1. **Configuration → Hosts → Create host**
2. Host name — техническое имя (совпадает с Hostname в agent)
3. Visible name — человекочитаемое
4. Groups — организация (Linux servers, Production, DMZ)
5. Interfaces — Agent (10050), SNMP, IPMI, JMX
6. Templates — link готовые наборы items/triggers
7. Macros — \`{$SNMP_COMMUNITY}\`, custom variables

**Host groups** — логическая группировка:
- Права доступа (user group → read/write на group)
- Mass update templates
- Dashboard filters

**Inventory** — CMDB-lite в Zabbix:
- OS, hardware, location, contact, serial number
- Автозаполнение через inventory macros в templates
- Полезно для отчётов и audit

**Maintenance periods** — подавление алертов:
- Плановые работы, patching window
- Host в maintenance → triggers не шлют notifications

**Best practices:**
- Один host = один физический/виртуальный сервер (не смешивать roles)
- Naming convention: \`env-role-NN\` (prod-web-01)
- Всегда через templates, не raw items на host
- Tags (Zabbix 5.4+) — для фильтрации в dashboards и problems`,
    },
    {
      title: 'Templates: стандартизация мониторинга',
      content: `**Template** — reusable набор items, triggers, graphs, dashboards, discovery rules.

**Зачем templates:**
- Один раз настроил «Linux by Zabbix agent» → link на 500 серверов
- Обновление template → все linked hosts получают изменения
- Версионирование и audit через export/import XML/YAML

**Структура template:**
- **Items** — что собирать (CPU load, disk space)
- **Triggers** — условия алертов
- **Graphs** — визуализация в UI
- **Discovery rules** — LLD для auto-discovery
- **Web scenarios** — synthetic monitoring (HTTP checks)

**Linked templates** — наследование:
- Base: «Template OS Linux» + «Template App Nginx»
- Host получает объединение всех items/triggers

**Официальные templates (Zabbix 7):**
- Linux by Zabbix agent / agent active
- Windows by Zabbix agent
- Apache/Nginx/MySQL/PostgreSQL
- Network devices (SNMP)

**Custom template workflow:**
1. Создай template «Template App MyService»
2. Добавь items (keys, intervals)
3. Создай triggers с severity
4. Graphs и dashboards
5. Export XML → Git (version control!)
6. Link на hosts или через LLD

**Template vs Host items:**
- Изменения в template → propagates to hosts
- Direct items на host — только для исключений`,
    },
    {
      title: 'Items, keys и типы данных',
      content: `**Item** — конкретная метрика: «CPU utilization», «Free disk space on /».

**Компоненты item:**
- **Name** — описание
- **Key** — уникальный идентификатор (\`system.cpu.util\`, \`vfs.fs.size[/,free]\`)
- **Type** — Zabbix agent, SNMP, HTTP agent, Script, Calculated, etc.
- **Update interval** — как часто собирать (1m, 5m)
- **History/Trends** — retention (7d history, 365d trends по умолчанию)

**Популярные agent keys:**
- \`system.cpu.util[,idle]\` — CPU idle %
- \`vm.memory.util\` — memory utilization
- \`vfs.fs.size[/,pfree]\` — free disk %
- \`net.if.in[eth0]\` — network inbound
- \`proc.num[nginx]\` — process count
- \`log[/var/log/syslog,error]\` — log monitoring

**Value types:**
- **Numeric (float)** — CPU, latency
- **Character** — version string, status text
- **Log** — log entries
- **Text** — multi-line (не для graphs)

**Preprocessing** — трансформация до сохранения:
- Multiplier, JSONPath, Regular expression, Throttle
- Пример: SNMP raw value → multiply by 0.01 → %

**Trapper items** — push от приложения:
- \`zabbix_sender -z server -s host -k trapper.key -o 42\`
- Для custom app metrics без agent polling`,
      code: {
        language: 'bash',
        code: `# Проверка key на agent вручную
zabbix_agent2 -t system.cpu.util
zabbix_agent2 -t vfs.fs.size[/,pfree]

# Отправка custom metric (trapper item)
zabbix_sender -z zabbix.example.com -s web-prod-01 -k app.queue.depth -o 127

# Тест с timestamp
zabbix_sender -z zabbix.example.com -s web-prod-01 \\
  -k app.orders.rate -o 42.5 -T

# Массовая отправка из скрипта backup
BACKUP_SIZE=$(du -sb /backup/latest | awk '{print $1}')
zabbix_sender -z zabbix.example.com -s backup-server -k backup.size.bytes -o "$BACKUP_SIZE"`,
        caption: 'Тестирование keys и zabbix_sender',
      },
    },
    {
      title: 'Triggers, severity и корреляция',
      content: `**Trigger** — логическое выражение на items. Когда TRUE → problem (алерт).

**Trigger expression syntax:**
\`{host:key.function(params)} operator constant\`

**Функции:**
- \`last()\` — последнее значение
- \`avg(5m)\` — среднее за 5 минут
- \`min(), max(), count(), change()\`
- \`nodata(10m)\` — нет данных 10 мин (agent down?)

**Примеры:**
- High CPU: \`avg(/web-prod-01/system.cpu.util,5m)>80\`
- Disk full: \`last(/web-prod-01/vfs.fs.size[/,pfree])<10\`
- Service down: \`last(/web-prod-01/proc.num[nginx])=0\`
- No data: \`nodata(/web-prod-01/system.cpu.util,10m)=1\`

**Severity levels:**
| Level | Название | Когда использовать |
|-------|----------|-------------------|
| **Not classified** | — | Info, не алертить |
| **Information** | Info | FYI events |
| **Warning** | Warning | Деградация, есть workaround |
| **Average** | Average | Значимая проблема |
| **High** | High | Сервис затронут |
| **Disaster** | Disaster | Полный outage |

**Dependencies** — trigger B не алертит если trigger A уже в problem:
- «Disk 90%» depends on «Disk 95%» — не спамить эскалацией

**Event correlation** — группировка related problems:
- Tag-based correlation: все triggers с tag \`service=payment\` → один ticket

**Recovery expression** — когда problem resolved (опционально):
- Автоматическое «Resolved» notification`,
      code: {
        language: 'text',
        code: `# Trigger expressions — примеры

# CPU > 90% за 5 минут
avg(/prod-db-01/system.cpu.util,5m)>90

# Disk free < 5% на /
last(/prod-db-01/vfs.fs.size[/,pfree])<5

# Nginx не запущен
last(/web-prod-01/proc.num[nginx])=0

# Agent не отвечает 10 минут
nodata(/web-prod-01/system.cpu.util,10m)=1

# Сложное: CPU high AND load high
avg(/web-prod-01/system.cpu.util,5m)>80 and avg(/web-prod-01/system.cpu.load[,avg1],5m)>5

# Recovery: CPU < 70%
avg(/web-prod-01/system.cpu.util,5m)<70`,
        caption: 'Примеры trigger expressions',
      },
    },
    {
      title: 'Actions, media types и notifications',
      content: `**Action** — автоматическая реакция на event (trigger problem/recovery).

**Action workflow:**
1. **Conditions** — trigger severity = High, host group = Production
2. **Operations** — send message, remote command, acknowledge
3. **Recovery operations** — «Problem resolved» notification

**Default actions:**
- «Report problems to Zabbix administrators» — email admin

**Media types** — каналы доставки:
- **Email** — SMTP (Office365, Gmail relay)
- **Slack** — webhook URL
- **Telegram** — bot token + chat ID
- **PagerDuty/Opsgenie** — REST API
- **Script** — custom shell (curl to internal API)

**Users and user groups:**
- User → Media (email, Slack) + severity filter (only High+)
- User group → permissions на host groups

**Escalation:**
- Step 1 (0 min): Slack #alerts
- Step 2 (15 min): email on-call engineer
- Step 3 (30 min): PagerDuty + SMS

**Remote commands** (осторожно!):
- Server может выполнить команду на agent: restart nginx, clear cache
- Требует \`EnableRemoteCommands=1\` на agent — security risk
- В production часто disabled; prefer Ansible/Terraform fix

**Maintenance + Acknowledge:**
- Engineer acknowledges → «working on it», suppresses escalation
- Maintenance window → planned silence`,
    },
    {
      title: 'Low-Level Discovery (LLD)',
      content: `**LLD** — автоматическое создание items/triggers/graphs для динамических объектов.

**Типичные сценарии:**
- Disk partitions — \`/dev/sda1\`, \`/dev/sdb1\`, новый mount auto-monitored
- Network interfaces — eth0, eth1, docker0
- Docker containers — новый container → новые items
- Windows services, PostgreSQL databases, Kubernetes pods

**Как работает:**
1. **Discovery rule** — key возвращает JSON array
2. **Preprocessing** — JSONPath к массиву
3. **Item prototypes** — шаблон item с \`{#MOUNTPOINT}\` macro
4. **Trigger prototypes** — «disk {#MOUNTPOINT} < 10%»
5. Zabbix создаёт реальные items для каждого discovered entity

**Discovery rule types:**
- Zabbix agent: \`vfs.fs.discovery\`, \`net.if.discovery\`
- SNMP OID walk
- HTTP agent + JSON
- Script / External (custom)

**LLD macros:**
- \`{#FSNAME}\`, \`{#IFNAME}\`, \`{#CONTAINERNAME}\`
- Filter: не мониторить loopback, tmpfs

**Overrides** — разные intervals/thresholds per discovered item:
- \`/boot\` — warning at 20%, \`/data\` — warning at 5%

**Best practices:**
- Всегда LLD для disks и interfaces (не hardcode)
- Filters для noise reduction
- Prototype naming: «Disk {#FSNAME}: free space»`,
    },
    {
      title: 'Zabbix Proxy для remote sites',
      content: `**Zabbix Proxy** — lightweight collector между agents и central server.

**Зачем proxy:**
- **WAN optimization** — один поток proxy→server вместо 500 agents→server
- **Security** — agents в DMZ общаются только с local proxy
- **Scale** — server offload: proxies собирают, server агрегирует
- **Autonomy** — proxy буферизует при потере связи с server

**Режимы proxy:**
- **Active proxy** — proxy подключается к server (рекомендуется)
- **Passive proxy** — server подключается к proxy

**Архитектура multi-site:**
\`\`\`
Site A: Agents → Proxy A → WAN → Central Server → DB
Site B: Agents → Proxy B → WAN → Central Server
Cloud:  Agents → (direct or proxy) → Central Server
\`\`\`

**Установка:**
\`apt install zabbix-proxy-sqlite3\` (small) или \`zabbix-proxy-pgsql\` (large)
Config: \`ProxyMode=0\` (active), \`Server=\` central server IP

**В UI:**
- **Administration → Proxies →** create proxy (name must match config)
- Hosts в remote site → Monitored by proxy «proxy-site-a»

**HA Proxy** — два proxy на site с keepalived/VIP (manual setup).

**Не путать:** Zabbix Proxy ≠ Zabbix Agent. Proxy — infrastructure component, не ставится на каждый сервер.`,
    },
    {
      title: 'Grafana, API и troubleshooting',
      content: `**Grafana + Zabbix datasource:**
- Plugin: **alexanderzobnin-zabbix-app** (official community)
- Подключение: Zabbix API URL, user/password
- Плюсы: единые дашборды Prometheus + Zabbix
- Минусы: сложные triggers в Grafana не настраиваешь — только визуализация

**Zabbix API (JSON-RPC):**
- Endpoint: \`http://zabbix/api_jsonrpc.php\`
- Auth: \`user.login\` → token → все методы
- Use cases: bulk host create, export config, integration CMDB, Terraform provider

**Типичные проблемы:**

| Симптом | Причина | Решение |
|---------|---------|---------|
| «No data» на item | Agent down, wrong key, firewall | \`zabbix_agent2 -t key\`, check 10050 |
| Host unavailable | Hostname mismatch | Agent Hostname = Zabbix host name |
| Trigger не срабатывает | Wrong expression, dependency | Test expression in UI |
| Алерты не приходят | Action/media misconfigured | Check user media, action conditions |
| Server slow | DB bloat, short retention | Tune housekeeping, TimescaleDB |
| Proxy buffer full | WAN down too long | Increase buffer, fix connectivity |

**Полезные логи:**
- \`/var/log/zabbix/zabbix_server.log\`
- \`/var/log/zabbix/zabbix_agent2.log\`
- \`/var/log/zabbix/zabbix_proxy.log\`

**Housekeeping** — автоматическая очистка old history/trends. Настройка в **Administration → General → Housekeeping**.`,
      code: {
        language: 'python',
        code: `#!/usr/bin/env python3
"""Zabbix API: list hosts in Production group."""
import json
import requests

ZABBIX_URL = "http://zabbix.example.com/api_jsonrpc.php"
USER = "api-user"
PASSWORD = "secret"

def api(method, params, auth=None):
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1,
    }
    if auth:
        payload["auth"] = auth
    r = requests.post(ZABBIX_URL, json=payload, timeout=30)
    return r.json()

# Login
token = api("user.login", {"username": USER, "password": PASSWORD})["result"]

# Get Production host group id
groups = api(
    "hostgroup.get",
    {"filter": {"name": "Production"}},
    auth=token,
)["result"]
group_id = groups[0]["groupid"]

# List hosts
hosts = api(
    "host.get",
    {
        "output": ["hostid", "host", "name", "status"],
        "groupids": group_id,
    },
    auth=token,
)["result"]

for h in hosts:
    status = "enabled" if h["status"] == "0" else "disabled"
    print(f"{h['host']} ({h['name']}) — {status}")

api("user.logout", {}, auth=token)`,
        caption: 'Zabbix API: список hosts через JSON-RPC',
      },
    },
  ],
  practice: [
    'Подними Zabbix Server через Docker Compose или пакеты на VM',
    'Установи Zabbix Agent 2 на 2–3 Linux hosts, link template «Linux by Zabbix agent»',
    'Создай custom template с items, triggers и LLD rule для disk discovery',
    'Настрой Action: Slack или email notification при severity ≥ High',
    'Разверни Zabbix Proxy в отдельной VM, переведи host на monitored by proxy',
    'Подключи Grafana Zabbix datasource и создай dashboard CPU/memory/disk',
  ],
  resources: [
    { title: 'Zabbix Documentation', url: 'https://www.zabbix.com/documentation/current/en/manual' },
    { title: 'Zabbix Agent 2', url: 'https://www.zabbix.com/documentation/current/en/manual/appendix/config/zabbix_agent2' },
    { title: 'Grafana Zabbix Plugin', url: 'https://grafana.com/grafana/plugins/alexanderzobnin-zabbix-app/' },
    { title: 'Zabbix Docker', url: 'https://github.com/zabbix/zabbix-docker' },
    { title: 'Zabbix API Reference', url: 'https://www.zabbix.com/documentation/current/en/manual/api/reference' },
  ],
}
