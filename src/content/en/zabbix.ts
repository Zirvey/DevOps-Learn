import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `Zabbix: infrastructure monitoring`,
  duration: `5–6 hours`,
  description: `Zabbix architecture, agents, templates, triggers, actions, Grafana integration — enterprise infrastructure monitoring`,
  sections: [
    {
      title: `Zabbix vs Prometheus: when to use what`,
      content: `**Zabbix** and **Prometheus** are two popular open-source monitoring systems with different philosophies.

| Criterion | Zabbix | Prometheus |
|----------|--------|------------|
| **Model** | Push + Pull (agent → server) | Pull (scrape /metrics) |
| **UI** | Built-in web frontend | Grafana (separate) |
| **Configuration** | UI + API + templates | YAML + PromQL |
| **Alerting** | Built-in (triggers → actions) | Alertmanager (separate) |
| **Discovery** | LLD, network discovery | Service discovery |
| **Typical use case** | Servers, network, legacy, enterprise | Cloud-native, K8s, microservices |

**Zabbix is stronger when:**
- You need all-in-one: UI, alerts, reporting from one system
- Monitoring heterogeneous infrastructure (Linux, Windows, SNMP devices)
- Remote sites via Zabbix Proxy
- The organization wants templates and inventory out of the box

**Prometheus is stronger when:**
- Kubernetes-native stack (kube-prometheus-stack)
- Microservices with /metrics endpoints
- PromQL and the CNCF ecosystem
- Short-lived jobs, custom metrics in applications

**In production, both are common:** Prometheus for K8s/apps, Zabbix for bare metal, network, Windows AD, SNMP. Grafana unifies dashboards.`,
    },
    {
      title: `Zabbix architecture`,
      content: `**Zabbix 7.x components:**

**1. Zabbix Server** — central brain:
- Receives data from agents and proxies
- Evaluates triggers, runs actions
- Writes to database, serves frontend
- One active server in a cluster (HA via failover)

**2. Zabbix Database** — configuration and history storage:
- **MySQL/MariaDB**, **PostgreSQL**, or **TimescaleDB** (for large volumes)
- History tables (raw data) + trends (aggregates)
- Configuration: hosts, templates, triggers

**3. Zabbix Frontend** — PHP web UI:
- Dashboards, maps, reports, configuration
- Usually on the same server or separate nginx + php-fpm

**4. Zabbix Agent / Agent 2** — on monitored hosts:
- Collects local metrics (CPU, disk, custom scripts)
- Agent 2 — Go-based, plugins, active mode (push to server)

**5. Zabbix Proxy** — for remote sites and scale:
- Collects locally, buffers, sends to server
- Reduces latency and load on central server
- Useful with limited WAN connectivity

**Data flow:**
\`Agent/Proxy → Server → DB\` (metrics)
\`Server → Trigger evaluation → Action → Notification\` (alerts)

**Collection modes:**
- **Active checks** — agent sends data (fewer open ports)
- **Passive checks** — server queries agent (port 10050)
- **SNMP** — switches, routers, UPS
- **IPMI** — hardware sensors
- **HTTP/Java** — application monitoring`,
    },
    {
      title: `Installation: deployment overview`,
      content: `**Zabbix Server installation options:**

**1. Packages (APT/YUM)** — classic for production:
- Ubuntu/Debian: official Zabbix repo
- RHEL/CentOS: zabbix-release rpm
- Components: server, frontend, agent, proxy — separate packages

**2. Docker / Docker Compose** — lab and small installs:
- Official images: zabbix/zabbix-server-pgsql, zabbix-web-nginx-pgsql
- Fast start, but backup/upgrade require discipline

**3. Kubernetes (Helm)** — cloud-native deploy:
- Community chart or zabbix-kubernetes
- External DB (RDS, managed PostgreSQL) recommended

**Minimum requirements (small env):**
- 2 CPU, 4 GB RAM, 50 GB disk (depends on retention and host count)
- PostgreSQL 15+ or MySQL 8+

**First steps after install:**
1. Open web UI (http://server/zabbix)
2. Verify DB schema is created
3. Login: Admin / zabbix (change password!)
4. **Configuration → Hosts** — add first host
5. Install agent on host, link template «Linux by Zabbix agent»

**Important:** timezone and NTP on all components. Time drift breaks triggers and graphs.`,
      code: {
        language: `bash`,
        code: `# Ubuntu 24.04 — install Zabbix 7.x server + frontend (PostgreSQL)
wget https://repo.zabbix.com/zabbix/7.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_7.0-1+ubuntu24.04_all.deb
sudo dpkg -i zabbix-release_7.0-1+ubuntu24.04_all.deb
sudo apt update
sudo apt install -y zabbix-server-pgsql zabbix-frontend-php zabbix-nginx-conf zabbix-sql-scripts zabbix-agent2

# Create DB (PostgreSQL example)
sudo -u postgres createuser --pwprompt zabbix
sudo -u postgres createdb -O zabbix zabbix
zcat /usr/share/zabbix-sql-scripts/postgresql/server.sql.gz | sudo -u zabbix psql zabbix

# Configure /etc/zabbix/zabbix_server.conf
# DBHost=localhost DBName=zabbix DBUser=zabbix DBPassword=<password>

sudo systemctl enable --now zabbix-server zabbix-agent2 nginx php8.3-fpm
sudo systemctl status zabbix-server`,
        caption: `Installing Zabbix Server on Ubuntu (overview)`,
      },
    },
    {
      title: `Zabbix Agent 2: install and configuration`,
      content: `**Zabbix Agent 2** — recommended agent (replacement for legacy Agent 1).

**Agent 2 advantages:**
- Written in Go, single binary
- Plugin architecture (MySQL, Redis, Docker, SMART, etc.)
- Active and passive modes
- Compatible with most legacy agent keys

**Linux install:**
\`apt install zabbix-agent2\` or package from Zabbix repo.

**Key zabbix_agent2.conf parameters:**
- \`Server=\` — Zabbix server/proxy IP (for passive, who can query)
- \`ServerActive=\` — address for active checks (agent push)
- \`Hostname=\` — must match host name in Zabbix UI
- \`ListenPort=10050\` — passive mode port

**User parameters / plugins:**
- Custom metrics via \`Plugins.SystemRun\` or legacy \`UserParameter\`
- Official plugins: \`mysql\`, \`redis\`, \`docker\`, \`memcached\`

**Security:**
- Agent should not be reachable from the internet
- \`AllowKey=system.run[*]\` — restrict or disable (RCE risk)
- Firewall: 10050 only from server/proxy`,
      code: {
        language: `ini`,
        code: `# /etc/zabbix/zabbix_agent2.conf (excerpt)
PidFile=/var/run/zabbix/zabbix_agent2.pid
LogFile=/var/log/zabbix/zabbix_agent2.log
LogFileSize=10

# Passive: who can connect to agent
Server=10.0.1.10,10.0.1.20
ListenPort=10050

# Active: where agent sends data
ServerActive=10.0.1.10:10051

# Host name in Zabbix UI — must match!
Hostname=web-prod-01

# Custom user parameter (legacy style)
UserParameter=nginx.status,curl -s -o /dev/null -w '%{http_code}' http://localhost/nginx_status

# Agent 2 plugin example (Docker)
Plugins.Docker.Endpoint=unix:///var/run/docker.sock`,
        caption: `Zabbix Agent 2 configuration`,
      },
    },
    {
      title: `Hosts, host groups, and inventory`,
      content: `**Host** — logical entity for monitoring (server, VM, switch, service).

**Creating a host:**
1. **Configuration → Hosts → Create host**
2. Host name — technical name (matches Hostname in agent)
3. Visible name — human-readable
4. Groups — organization (Linux servers, Production, DMZ)
5. Interfaces — Agent (10050), SNMP, IPMI, JMX
6. Templates — link ready-made item/trigger sets
7. Macros — \`{$SNMP_COMMUNITY}\`, custom variables

**Host groups** — logical grouping:
- Access rights (user group → read/write on group)
- Mass update templates
- Dashboard filters

**Inventory** — CMDB-lite in Zabbix:
- OS, hardware, location, contact, serial number
- Auto-fill via inventory macros in templates
- Useful for reports and audit

**Maintenance periods** — alert suppression:
- Planned work, patching window
- Host in maintenance → triggers do not send notifications

**Best practices:**
- One host = one physical/virtual server (do not mix roles)
- Naming convention: \`env-role-NN\` (prod-web-01)
- Always via templates, not raw items on host
- Tags (Zabbix 5.4+) — for filtering in dashboards and problems`,
    },
    {
      title: `Templates: standardizing monitoring`,
      content: `**Template** — reusable set of items, triggers, graphs, dashboards, discovery rules.

**Why templates:**
- Configure «Linux by Zabbix agent» once → link to 500 servers
- Template update → all linked hosts get changes
- Versioning and audit via export/import XML/YAML

**Template structure:**
- **Items** — what to collect (CPU load, disk space)
- **Triggers** — alert conditions
- **Graphs** — visualization in UI
- **Discovery rules** — LLD for auto-discovery
- **Web scenarios** — synthetic monitoring (HTTP checks)

**Linked templates** — inheritance:
- Base: «Template OS Linux» + «Template App Nginx»
- Host gets union of all items/triggers

**Official templates (Zabbix 7):**
- Linux by Zabbix agent / agent active
- Windows by Zabbix agent
- Apache/Nginx/MySQL/PostgreSQL
- Network devices (SNMP)

**Custom template workflow:**
1. Create template «Template App MyService»
2. Add items (keys, intervals)
3. Create triggers with severity
4. Graphs and dashboards
5. Export XML → Git (version control!)
6. Link to hosts or via LLD

**Template vs host items:**
- Changes in template → propagate to hosts
- Direct items on host — only for exceptions`,
    },
    {
      title: `Items, keys, and data types`,
      content: `**Item** — specific metric: «CPU utilization», «Free disk space on /».

**Item components:**
- **Name** — description
- **Key** — unique identifier (\`system.cpu.util\`, \`vfs.fs.size[/,free]\`)
- **Type** — Zabbix agent, SNMP, HTTP agent, Script, Calculated, etc.
- **Update interval** — how often to collect (1m, 5m)
- **History/Trends** — retention (7d history, 365d trends by default)

**Popular agent keys:**
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
- **Text** — multi-line (not for graphs)

**Preprocessing** — transform before storage:
- Multiplier, JSONPath, Regular expression, Throttle
- Example: SNMP raw value → multiply by 0.01 → %

**Trapper items** — push from application:
- \`zabbix_sender -z server -s host -k trapper.key -o 42\`
- For custom app metrics without agent polling`,
      code: {
        language: `bash`,
        code: `# Test key on agent manually
zabbix_agent2 -t system.cpu.util
zabbix_agent2 -t vfs.fs.size[/,pfree]

# Send custom metric (trapper item)
zabbix_sender -z zabbix.example.com -s web-prod-01 -k app.queue.depth -o 127

# Test with timestamp
zabbix_sender -z zabbix.example.com -s web-prod-01 \\
  -k app.orders.rate -o 42.5 -T

# Bulk send from backup script
BACKUP_SIZE=$(du -sb /backup/latest | awk '{print $1}')
zabbix_sender -z zabbix.example.com -s backup-server -k backup.size.bytes -o "$BACKUP_SIZE"`,
        caption: `Testing keys and zabbix_sender`,
      },
    },
    {
      title: `Triggers, severity, and correlation`,
      content: `**Trigger** — logical expression on items. When TRUE → problem (alert).

**Trigger expression syntax:**
\`{host:key.function(params)} operator constant\`

**Functions:**
- \`last()\` — last value
- \`avg(5m)\` — average over 5 minutes
- \`min(), max(), count(), change()\`
- \`nodata(10m)\` — no data for 10 min (agent down?)

**Examples:**
- High CPU: \`avg(/web-prod-01/system.cpu.util,5m)>80\`
- Disk full: \`last(/web-prod-01/vfs.fs.size[/,pfree])<10\`
- Service down: \`last(/web-prod-01/proc.num[nginx])=0\`
- No data: \`nodata(/web-prod-01/system.cpu.util,10m)=1\`

**Severity levels:**
| Level | Name | When to use |
|-------|------|-------------|
| **Not classified** | — | Info, do not alert |
| **Information** | Info | FYI events |
| **Warning** | Warning | Degradation, workaround exists |
| **Average** | Average | Significant issue |
| **High** | High | Service affected |
| **Disaster** | Disaster | Full outage |

**Dependencies** — trigger B does not alert if trigger A is already in problem:
- «Disk 90%» depends on «Disk 95%» — avoid escalation spam

**Event correlation** — group related problems:
- Tag-based correlation: all triggers with tag \`service=payment\` → one ticket

**Recovery expression** — when problem is resolved (optional):
- Automatic «Resolved» notification`,
      code: {
        language: `text`,
        code: `# Trigger expressions — examples

# CPU > 90% for 5 minutes
avg(/prod-db-01/system.cpu.util,5m)>90

# Disk free < 5% on /
last(/prod-db-01/vfs.fs.size[/,pfree])<5

# Nginx not running
last(/web-prod-01/proc.num[nginx])=0

# Agent not responding for 10 minutes
nodata(/web-prod-01/system.cpu.util,10m)=1

# Complex: CPU high AND load high
avg(/web-prod-01/system.cpu.util,5m)>80 and avg(/web-prod-01/system.cpu.load[,avg1],5m)>5

# Recovery: CPU < 70%
avg(/web-prod-01/system.cpu.util,5m)<70`,
        caption: `Trigger expression examples`,
      },
    },
    {
      title: `Actions, media types, and notifications`,
      content: `**Action** — automatic response to an event (trigger problem/recovery).

**Action workflow:**
1. **Conditions** — trigger severity = High, host group = Production
2. **Operations** — send message, remote command, acknowledge
3. **Recovery operations** — «Problem resolved» notification

**Default actions:**
- «Report problems to Zabbix administrators» — email admin

**Media types** — delivery channels:
- **Email** — SMTP (Office365, Gmail relay)
- **Slack** — webhook URL
- **Telegram** — bot token + chat ID
- **PagerDuty/Opsgenie** — REST API
- **Script** — custom shell (curl to internal API)

**Users and user groups:**
- User → Media (email, Slack) + severity filter (only High+)
- User group → permissions on host groups

**Escalation:**
- Step 1 (0 min): Slack #alerts
- Step 2 (15 min): email on-call engineer
- Step 3 (30 min): PagerDuty + SMS

**Remote commands** (use carefully!):
- Server can run command on agent: restart nginx, clear cache
- Requires \`EnableRemoteCommands=1\` on agent — security risk
- In production often disabled; prefer Ansible/Terraform fix

**Maintenance + Acknowledge:**
- Engineer acknowledges → «working on it», suppresses escalation
- Maintenance window → planned silence`,
    },
    {
      title: `Low-Level Discovery (LLD)`,
      content: `**LLD** — automatic creation of items/triggers/graphs for dynamic objects.

**Typical scenarios:**
- Disk partitions — \`/dev/sda1\`, \`/dev/sdb1\`, new mount auto-monitored
- Network interfaces — eth0, eth1, docker0
- Docker containers — new container → new items
- Windows services, PostgreSQL databases, Kubernetes pods

**How it works:**
1. **Discovery rule** — key returns JSON array
2. **Preprocessing** — JSONPath to array
3. **Item prototypes** — item template with \`{#MOUNTPOINT}\` macro
4. **Trigger prototypes** — «disk {#MOUNTPOINT} < 10%»
5. Zabbix creates real items for each discovered entity

**Discovery rule types:**
- Zabbix agent: \`vfs.fs.discovery\`, \`net.if.discovery\`
- SNMP OID walk
- HTTP agent + JSON
- Script / External (custom)

**LLD macros:**
- \`{#FSNAME}\`, \`{#IFNAME}\`, \`{#CONTAINERNAME}\`
- Filter: do not monitor loopback, tmpfs

**Overrides** — different intervals/thresholds per discovered item:
- \`/boot\` — warning at 20%, \`/data\` — warning at 5%

**Best practices:**
- Always LLD for disks and interfaces (do not hardcode)
- Filters for noise reduction
- Prototype naming: «Disk {#FSNAME}: free space»`,
    },
    {
      title: `Zabbix Proxy for remote sites`,
      content: `**Zabbix Proxy** — lightweight collector between agents and central server.

**Why proxy:**
- **WAN optimization** — one proxy→server stream instead of 500 agents→server
- **Security** — agents in DMZ talk only to local proxy
- **Scale** — server offload: proxies collect, server aggregates
- **Autonomy** — proxy buffers when link to server is down

**Proxy modes:**
- **Active proxy** — proxy connects to server (recommended)
- **Passive proxy** — server connects to proxy

**Multi-site architecture:**
\`\`\`
Site A: Agents → Proxy A → WAN → Central Server → DB
Site B: Agents → Proxy B → WAN → Central Server
Cloud:  Agents → (direct or proxy) → Central Server
\`\`\`

**Install:**
\`apt install zabbix-proxy-sqlite3\` (small) or \`zabbix-proxy-pgsql\` (large)
Config: \`ProxyMode=0\` (active), \`Server=\` central server IP

**In UI:**
- **Administration → Proxies →** create proxy (name must match config)
- Hosts at remote site → Monitored by proxy «proxy-site-a»

**HA Proxy** — two proxies per site with keepalived/VIP (manual setup).

**Do not confuse:** Zabbix Proxy ≠ Zabbix Agent. Proxy is infrastructure, not installed on every server.`,
    },
    {
      title: `Grafana, API, and troubleshooting`,
      content: `**Grafana + Zabbix datasource:**
- Plugin: **alexanderzobnin-zabbix-app** (official community)
- Connection: Zabbix API URL, user/password
- Pros: unified Prometheus + Zabbix dashboards
- Cons: complex triggers are not configured in Grafana — visualization only

**Zabbix API (JSON-RPC):**
- Endpoint: \`http://zabbix/api_jsonrpc.php\`
- Auth: \`user.login\` → token → all methods
- Use cases: bulk host create, export config, CMDB integration, Terraform provider

**Common issues:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| «No data» on item | Agent down, wrong key, firewall | \`zabbix_agent2 -t key\`, check 10050 |
| Host unavailable | Hostname mismatch | Agent Hostname = Zabbix host name |
| Trigger not firing | Wrong expression, dependency | Test expression in UI |
| Alerts not arriving | Action/media misconfigured | Check user media, action conditions |
| Server slow | DB bloat, short retention | Tune housekeeping, TimescaleDB |
| Proxy buffer full | WAN down too long | Increase buffer, fix connectivity |

**Useful logs:**
- \`/var/log/zabbix/zabbix_server.log\`
- \`/var/log/zabbix/zabbix_agent2.log\`
- \`/var/log/zabbix/zabbix_proxy.log\`

**Housekeeping** — automatic cleanup of old history/trends. Configure in **Administration → General → Housekeeping**.`,
      code: {
        language: `python`,
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
        caption: `Zabbix API: list hosts via JSON-RPC`,
      },
    },
  ],
  practice: [
    `Deploy Zabbix Server via Docker Compose or packages on a VM`,
    `Install Zabbix Agent 2 on 2–3 Linux hosts, link template «Linux by Zabbix agent»`,
    `Create a custom template with items, triggers, and LLD rule for disk discovery`,
    `Configure Action: Slack or email notification when severity ≥ High`,
    `Deploy Zabbix Proxy on a separate VM, move a host to monitored by proxy`,
    `Connect Grafana Zabbix datasource and build CPU/memory/disk dashboard`,
  ],
  resources: [
    { title: `Zabbix Documentation`, url: `https://www.zabbix.com/documentation/current/en/manual` },
    { title: `Zabbix Agent 2`, url: `https://www.zabbix.com/documentation/current/en/manual/appendix/config/zabbix_agent2` },
    { title: `Grafana Zabbix Plugin`, url: `https://grafana.com/grafana/plugins/alexanderzobnin-zabbix-app/` },
    { title: `Zabbix Docker`, url: `https://github.com/zabbix/zabbix-docker` },
    { title: `Zabbix API Reference`, url: `https://www.zabbix.com/documentation/current/en/manual/api/reference` },
  ],
  quiz: [
    {
      question: `What is the main difference between Zabbix and Prometheus collection models?`,
      options: [
        `Zabbix supports agents (push/pull) and SNMP; Prometheus primarily pull-scrapes /metrics`,
        `Prometheus has no time-series storage`,
        `Zabbix cannot monitor Linux servers`,
        `Prometheus includes a built-in PHP frontend`,
      ],
      answer: `Zabbix supports agents (push/pull) and SNMP; Prometheus primarily pull-scrapes /metrics`,
    },
    {
      question: `What must match between Zabbix Agent 2 config and the Zabbix UI for monitoring to work?`,

      options: [
        `Hostname — the agent Hostname parameter must match the host name configured in Zabbix.`,
        `Agent IP address must match the domain DNS zone`,
        `Zabbix Server version must match agent version bit-for-bit`,
        `Network card MAC address must match the template name`,
      ],
      answer: `Hostname — the agent Hostname parameter must match the host name configured in Zabbix.`,
    },
    {
      question: `What is a Zabbix template used for?`,
      options: [
        `Reusable set of items, triggers, graphs linked to many hosts`,
        `Docker image for Zabbix Server only`,
        `Replacement for the database`,
        `Grafana dashboard export format`,
      ],
      answer: `Reusable set of items, triggers, graphs linked to many hosts`,
    },
    {
      question: `Which trigger function detects that an agent stopped sending data?`,
      options: [
        `nodata(10m)`,
        `last()`,
        `avg(5m)`,
        `change()`,
      ],
      answer: `nodata(10m)`,
      explanation: `nodata() returns 1 when no new values arrive for the specified period — typical «agent down» detection.`,
    },
    {
      question: `What is Low-Level Discovery (LLD) in Zabbix?`,
      options: [
        `Automatic creation of items, triggers, and graphs from discovery rules for dynamic objects (disks, interfaces, containers).`,
        `A manual-only way to delete all triggers.`,
        `Low-level encryption for agent traffic.`,
        `A backup tool unrelated to monitoring.`,
      ],
      answer: `Automatic creation of items, triggers, and graphs from discovery rules for dynamic objects (disks, interfaces, containers).`,
    },
    {
      question: `Why deploy Zabbix Proxy at a remote site?`,
      options: [
        `Reduce WAN traffic, buffer data locally, and keep agents talking to a nearby collector`,
        `Replace Zabbix Server entirely at each site`,
        `Run triggers without a central server`,
        `Monitor only SNMP devices`,
      ],
      answer: `Reduce WAN traffic, buffer data locally, and keep agents talking to a nearby collector`,
    },
    {
      question: `What is the default passive agent listen port?`,
      options: [
        `10050`,
        `443`,
        `22`,
        `161`,
      ],
      answer: `10050`,
    },
    {
      question: `How do Actions relate to Triggers in Zabbix?`,
      options: [
        `Actions define notifications and operations when trigger events (problems/recoveries) match conditions`,
        `Actions replace triggers entirely`,
        `Triggers send email without Actions`,
        `Actions only work with SNMP items`,
      ],
      answer: `Actions define notifications and operations when trigger events (problems/recoveries) match conditions`,
    },
    {
      question: `Which Grafana plugin is commonly used to visualize Zabbix data?`,
      options: [
        `alexanderzobnin-zabbix-app`,
        `prometheus-datasource`,
        `loki-datasource`,
        `zabbix-agent2-plugin`,
      ],
      answer: `alexanderzobnin-zabbix-app`,
    },
    {
      question: `What authentication method does the Zabbix JSON-RPC API use?`,
      options: [
        `user.login returns an auth token passed in subsequent API requests; user.logout invalidates it.`,
        `HTTP Basic auth with the Zabbix admin password on every call`,
        `OAuth2 client credentials with rotating JWT cookies`,
        `Kerberos SPNEGO without any session token`,
      ],
      answer: `user.login returns an auth token passed in subsequent API requests; user.logout invalidates it.`,
    },
  ],
}

export default translation
