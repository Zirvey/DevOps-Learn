import type { Chapter } from '../../../types'

export const opnsenseOperationsChapter: Chapter = {
  id: 'opnsense-operations',
  slug: 'opnsense-operations',
  title: 'OPNsense — эксплуатация, HA и troubleshooting',
  moduleId: 'opnsense',
  order: 4,
  duration: '6–8 часов',
  level: 'advanced',
  description:
    'Day-2 ops, CARP HA, backup/restore, firmware lifecycle, monitoring (SNMP/Netdata/Grafana), REST API, Ansible/Terraform, performance tuning, DR runbooks, outage playbooks и production case studies',
  sections: [
    {
      title: 'Эксплуатационная модель Day-2 для OPNsense',
      content: `**Day-2** — всё, что происходит после первичной настройки firewall: доступность, изменения, мониторинг, восстановление и аудит. OPNsense в SMB/MSP часто «живёт» годами на одном железе — без формализованных процессов любой failover или upgrade превращается в аварию.

**Пять столпов эксплуатации OPNsense:**

| Столп | Цель | Типовые артефакты |
|-------|------|-------------------|
| **Availability** | RTO/RPO для edge | CARP HA, multi-WAN, runbooks |
| **Change** | Предсказуемые изменения | CM tickets, config diff, maintenance window |
| **Observability** | Видеть деградацию до outage | SNMP, syslog, Netdata, Grafana |
| **Recovery** | Восстановление без «магии» | config.xml backups, DR VM, documented restore |
| **Security** | Patch cadence, hardening | Firmware schedule, CVE review, access control |

**Роли в SMB:**

| Роль | Ответственность |
|------|-----------------|
| **Network lead** | Firewall rules, VPN, HA, DR |
| **Sysadmin** | Backups, updates, monitoring agents |
| **Security** | Rule audit, Suricata tuning, log review |
| **MSP NOC** | Alerts tier-1, escalation по runbook |

**Отличие OPNsense от FortiGate в ops:** нет FortiCare SLA — вы самостоятельно планируете HA, backups и security advisory response. Плюс: полный доступ к FreeBSD shell, config.xml и API без vendor gatekeeping.

**As-built documentation (must-have):**
- Physical + logical diagram (WAN, LAN, VLANs, sync link)
- IP plan с gateway VIP (CARP) и real node IPs
- Firewall matrix (source/dest/service)
- VPN onboarding/offboarding
- Backup locations + encryption keys
- ISP contacts, public IPs, reverse DNS
- Admin users в password manager (не в config.xml plain)

**Метрики здоровья edge (baseline):**
- WAN latency/jitter к 2+ probes
- Active states count vs limit
- CPU per core (RSS imbalance indicator)
- Disk free % (logs, Suricata, ZFS)
- CARP role (MASTER/BACKUP) per node
- Last successful backup timestamp`,
    },
    {
      title: 'Day-2 ops checklist',
      content: `Используй как **ежедневный/еженедельный/ежемесячный** чеклист. Адаптируй частоту под SLA клиента.

**Ежедневно (automated + 5 min human review):**
- [ ] Backup config.xml успешен (проверь timestamp в monitoring/SFTP)
- [ ] CARP: ожидаемый MASTER на node1 (или документированный primary)
- [ ] WAN link up, gateway ping OK
- [ ] Disk usage < 80% на всех nodes
- [ ] Нет critical alerts в Zabbix/Grafana (states spike, interface down)
- [ ] Suricata/IDS не в permanent blocking mode без ticket

**Еженедельно:**
- [ ] Review Firewall → Log Files: top denied, unexpected blocks
- [ ] VPN auth failures spike (brute force?)
- [ ] Review System → Log Files → Backend/API errors
- [ ] Проверить scheduled firmware status (pending security release?)
- [ ] Verify syslog ingestion на central SIEM (event count не нулевой)
- [ ] Test read-only API token still valid

**Ежемесячно:**
- [ ] FortiGuard-style: OPNsense security advisories + FreeBSD CVE для критичных пакетов
- [ ] User audit: disable stale admin accounts
- [ ] Certificate expiry (ACME WAN, OpenVPN server cert)
- [ ] Rule hygiene: unused rules, «allow any» audit
- [ ] Capacity: states peak vs limit, CPU peak during business hours
- [ ] Plugin versions aligned между HA nodes

**Ежеквартально:**
- [ ] **CARP failover test** в maintenance window
- [ ] **Restore test**: config.xml на lab VM
- [ ] DR runbook walkthrough (tabletop)
- [ ] Packet capture baseline (sanity check paths)
- [ ] Review hw.igb/RSS tuning если throughput complaints

**При каждом change:**
- [ ] CM ticket с rollback plan
- [ ] Pre-change backup (manual + verify download)
- [ ] Change window + stakeholder notify (VPN blip при HA)
- [ ] Post-change verification checklist
- [ ] Config diff archived в git/S3

**Годовой:**
- [ ] Full DR simulation (cold spare or new VM restore)
- [ ] Password rotation admin/API keys
- [ ] Hardware SMART/ZFS scrub review
- [ ] Contract/ISP renewal, public IP inventory`,
      code: {
        language: 'shell',
        caption: 'Быстрая daily health check с SSH (одна node)',
        code: `# версия и uptime
opnsense-version
uptime

# CARP VIP статус (если HA)
ifconfig | grep -A2 carp

# states и лимиты
pfctl -si | head -20

# диск
df -h / /var

# последний backup в /conf если local copy
ls -lt /root/config-backup-* 2>/dev/null | head -3`,
      },
    },
    {
      title: 'CARP HA: Virtual IPs и архитектура',
      content: `**CARP (Common Address Redundancy Protocol)** — FreeBSD реализация redundant gateway. Клиенты используют **Virtual IP (VIP)** как default gateway; при падении MASTER BACKUP поднимает VIP на своём интерфейсе.

**Типовая топология active/passive:**

\`\`\`
              ISP
                │
         ┌──────┴──────┐
    WAN VIP (CARP)     │
    ┌────────┐  ┌────────┐
    │ FW1    │  │ FW2    │
    │ MASTER │  │ BACKUP │
    │ WAN    │  │ WAN    │
    │ 1.2.3.4│  │ 1.2.3.5│  ← real IPs (разные)
    └────┬───┘  └───┬────┘
         │  sync    │  (dedicated pfsync + XMLRPC)
         └────┬─────┘
              │
    LAN VIP (CARP) 192.168.1.1
              │
         core switch
\`\`\`

**Компоненты VIP:**
- **vhid** — Virtual Host ID (1–255), одинаковый на паре для данного VIP
- **advbase / advskew** — приоритет MASTER (lower skew = preferred master)
- **password** — CARP authentication (не пустой в production!)
- **interface** — LAN, WAN, или DMZ где нужен shared gateway

**Настройка VIP (GUI):**
1. Interfaces → Virtual IPs → Add
2. Type: **CARP**
3. Interface: LAN (или WAN)
4. Address: VIP gateway (например 192.168.1.1/24)
5. Virtual Host ID: уникальный per VIP subnet
6. Advertising Frequency: base 1, skew 0 на intended master, skew 100 на backup

**WAN CARP нюансы:**
- ISP должен выдать **несколько public IP** или accept ARP от VIP MAC
- Некоторые ISP/CPE блокируют — тогда HA только на LAN, WAN через external router
- PPPoE HA сложнее — часто multi-WAN с разными ISP на каждую node

**Real IP per node** нужны для:
- SSH management (не через VIP во время split-brain)
- Sync link (pfsync, XMLRPC)
- Outbound SNAT если не используется VIP на WAN

**Документируй в as-built:**
| Node | WAN real | LAN real | LAN VIP | CARP skew | Role |
|------|----------|----------|---------|-----------|------|
| fw1 | 1.2.3.4 | 192.168.1.2 | 192.168.1.1 | 0 | MASTER |
| fw2 | 1.2.3.5 | 192.168.1.3 | 192.168.1.1 | 100 | BACKUP |`,
    },
    {
      title: 'CARP: sync interface, pfsync и config sync',
      content: `**Stateful HA** требует синхронизации **state table** — без этого TCP sessions рвутся при failover.

**pfsync** — протокол репликации pf states между nodes.

**Настройка (System → High Availability):**
- Enable **Synchronize states**
- Synchronize interface: **dedicated OPT/sync** (рекомендуется) или LAN
- Peer IP: real IP другой node на sync subnet (например 10.255.255.1 ↔ 10.255.255.2)

**Sync interface best practices:**
- Dedicated **1 Gbps direct cable** между nodes (не через production switch если возможно)
- Отдельная subnet: 10.255.255.0/30
- Firewall rules: allow **pfsync** (protocol PFSYNC) и **CARP** между node IPs
- Не route sync subnet в production VLANs

**Config sync (XMLRPC):**
- System → High Availability → **Synchronize configuration**
- Remote node IP: management/sync IP peer
- Sync items: aliases, rules, NAT, VPN, users (выбери всё кроме node-specific: hostname, interface IPs)
- **Node-specific исключения:** real WAN/LAN IPs, CARP skew, hostname

**Порядок первичной настройки HA pair:**
1. Настрой fw2 как standalone clone (restore config с fw1, изменить real IPs)
2. Подключи sync link
3. На fw1: enable pfsync + config sync peer = fw2 sync IP
4. На fw2: mirror settings peer = fw1
5. Push config fw1 → fw2 (или wait auto sync)
6. Verify rules identical: \`pfctl -vvsr | wc -l\` на обеих
7. Failover test

**Firewall rules для HA (пример логики):**
| # | Proto | Source | Dest | Port | Action |
|---|-------|--------|------|------|--------|
| 1 | carp | any | any | — | pass |
| 2 | pfsync | fw1_sync | fw2_sync | — | pass |
| 3 | any | fw1_mgmt | fw2_mgmt | 443 | pass (XMLRPC) |

**Bandwidth:** pfsync traffic = function of connection rate × state size. High CPS environments (many short TCP) — monitor sync link utilization.`,
      code: {
        language: 'shell',
        caption: 'Проверка pfsync и CARP на shell',
        code: `# CARP статус по интерфейсам
ifconfig carp1
ifconfig carp2

# pfsync interface
ifconfig pfsync0

# счётчик states
pfctl -si

# правила с CARP/pfsync (должны быть early in rule set)
pfctl -vvsr | grep -E 'carp|pfsync'`,
      },
    },
    {
      title: 'CARP: preempt, advskew и тестирование failover',
      content: `**Preempt** — когда MASTER возвращается после recovery, он снова становится MASTER (отбирает VIP). Default CARP behavior: lower advskew wins.

**advskew tuning:**
- Intended primary: skew **0–10**
- Backup: skew **100–254**
- При равном skew — tie-break по IP

**Forced role change (maintenance):**
- Временно поднять skew на primary → backup becomes MASTER
- Или shutdown primary в window
- **Не** отключай sync link без isolate procedure

**Failover test procedure (квартально):**

| Шаг | Действие | Expected |
|-----|----------|----------|
| 1 | Pre-check: both nodes healthy, backup = BACKUP | CARP state OK |
| 2 | С workstation: ping gateway VIP continuous | 0% loss ideal |
| 3 | Initiate long TCP (SSH, RDP) через firewall | Session active |
| 4 | \`ifconfig carp1 down\` на MASTER или power off | VIP moves < 3s |
| 5 | Ping VIP | 1-3 lost packets typical |
| 6 | Long TCP session | Survives if pfsync OK |
| 7 | Verify BACKUP now MASTER | ifconfig carp |
| 8 | Restore MASTER | Preempt if skew lower |
| 9 | Document packet loss, time, anomalies | CM ticket |

**Maintenance failover без power off:**
\`\`\`
# на current MASTER — demote себя (временно skew)
# через GUI Virtual IP или ifconfig tuning
# preferred: GUI maintenance mode plugins если установлен
\`\`\`

**VPN during failover:** WireGuard/OpenVPN на VIP — clients reconnect; site-to-site IPsec may need dpd/rekey. Document expected VPN blip 5–30 sec.

**Monitoring CARP:**
- SNMP OID / custom script: parse \`ifconfig carp\` for MASTER
- Alert if **both** MASTER or **neither** MASTER (split-brain)
- Zabbix: two host items per node, trigger on role mismatch duration`,
      code: {
        language: 'shell',
        caption: 'Симуляция failover и проверка preempt',
        code: `# на MASTER — посмотреть skew
ifconfig carp1 | grep advskew

# demote: увеличить skew (пример — осторожно в production)
# ifconfig carp1 vhid 1 advskew 200

# verify peer took MASTER
ssh root@fw2 'ifconfig carp1 | grep carp'

# restore skew на primary
# ifconfig carp1 vhid 1 advskew 0

# continuous ping с client (запускать ДО failover)
# ping -D 192.168.1.1`,
      },
    },
    {
      title: 'HA pitfalls: asymmetric routing',
      content: `**Asymmetric routing** — когда request и response идут через разные firewalls. В HA pair это убивает stateful firewall: один node видит только half-connection, drops или weird NAT.

**Типовые сценарии после failover:**

| Сценарий | Симптом | Причина |
|----------|---------|---------|
| Stale ARP на switch | Partial connectivity | Switch MAC table points to old MASTER MAC |
| Wrong static routes | Some subnets dead | Routes point to real IP not VIP |
| Dual MASTER | Chaos, random drops | Split-brain, sync down |
| SNAT on real IP | Outbound fails on backup | NAT rules use node-specific IP |
| Load balancer upstream | Half sessions | LB hashes to both nodes |

**ARP и L2 после failover:**
- CARP uses **virtual MAC** per VIP — switches must accept gratuitous ARP
- Some cheap switches: **sticky MAC** timeout 300s — may need manual clear
- **VMware/Proxmox:** promiscuous mode / MAC spoofing allow on HA ports

**Prevention checklist:**
- [ ] Default gateway для всех VLANs = **LAN VIP**, не real node IP
- [ ] SNAT outbound uses **WAN VIP** or interface IP mode consistent on both nodes
- [ ] Static routes на upstream router point to VIP
- [ ] Config sync excludes node-specific NAT outbound bindings
- [ ] Test failover **with production traffic patterns** not only ping

**Diagnosis workflow:**
1. Identify failing flow: src, dst, proto, port
2. On **both** nodes during issue: \`pfctl -ss | grep <src>\`
3. If states only on one node while traffic hits both → asymmetric
4. Trace MAC path: which node receives frames for VIP?
5. tcpdump on WAN both nodes simultaneously — compare direction

**Fix patterns:**
- Ensure single MASTER for VIP
- Fix upstream routing to VIP only
- Enable **pfsync** if disabled
- For cloud: consider **cold standby** instead of CARP if hypervisor blocks CARP MAC`,
    },
    {
      title: 'HA pitfalls: state sync и split-brain',
      content: `**pfsync failure** — failover happens but states не синхронизированы → mass TCP reset, users «выброшены» из сессий.

**Причины pfsync break:**
- Sync link down / wrong peer IP
- Firewall rule blocks pfsync between nodes
- One node overloaded — pfsync drops
- Version mismatch после partial upgrade
- MTU issue на sync link (fragmentation)

**Split-brain** — обе nodes считают себя MASTER для одного VIP.

| Причина | Detection | Response |
|---------|-----------|----------|
| Sync link partitioned | Both MASTER alert | Isolate one node |
| CARP password mismatch | CARP logs errors | Fix password sync |
| advskew misconfig | Wrong node master | Fix skew |
| Network loop | MAC flapping | Physical fix |

**Split-brain response runbook:**
1. **Do not** reboot both nodes simultaneously
2. Identify intended MASTER by documentation
3. On **wrong** MASTER: \`ifconfig carp1 down\` (all CARP interfaces)
4. Fix root cause (sync link, password, skew)
5. Bring CARP up on backup only after primary confirmed MASTER
6. Verify single MASTER via monitoring

**State table limits under HA:**
- Both nodes must have **same** pf limits
- Backup RAM must hold full state table at peak
- High connection churn → pfsync bandwidth — size sync link appropriately

**Cloud HA caveats:**
- AWS/Azure/GCP: CARP often **не работает** из коробки (MAC restrictions)
- Alternatives: BGP Anycast, external LB, DNS failover, **OPNsense in cloud as single** + on-prem HA
- Proxmox: virtio + **MAC spoofing allow** on bridge

**Testing state sync:**
\`\`\`
# на MASTER — создать SSH session
# на BACKUP до failover:
pfctl -ss | grep <your_src_ip>  # state should appear
\`\`\`
If empty on backup — pfsync broken **before** failover test matters.`,
    },
    {
      title: 'Backup и restore: config.xml',
      content: `**Вся конфигурация OPNsense** живёт в \`/conf/config.xml\` (XML). Rules, NAT, VPN, users, plugins — один файл.

**GUI backup:**
- System → Configuration → Backups → **Download**
- Optional encryption password (рекомендуется для offsite)

**CLI backup:**
\`\`\`bash
cp /conf/config.xml /root/backup-$(date +%Y%m%d-%H%M).xml
\`\`\`

**Restore (GUI):**
1. System → Configuration → Backups → Restore
2. Upload XML → reboot if prompted
3. Verify interface assignments (особенно после restore на different hardware)

**Restore (disaster — new VM):**
1. Install same major OPNsense version (or newer)
2. Assign interfaces matching logical roles (WAN/LAN)
3. Restore config.xml via GUI or:
\`\`\`bash
cp /root/config-backup.xml /conf/config.xml
/usr/local/etc/rc.reload_all
\`\`\`

**Version compatibility:**
| Direction | Risk |
|-----------|------|
| Restore old config on **newer** OPNsense | Usually OK (auto-migrate) |
| Restore new config on **older** | High — may break |
| Cross-hardware restore | Re-check NIC driver names (igb0 vs vtnet0) |

**Pre-restore checklist:**
- [ ] Backup current broken config (forensics)
- [ ] Note firmware version
- [ ] Maintenance window
- [ ] ISP credentials in config if PPPoE

**Validation after restore:**
\`\`\`bash
xmllint --noout /conf/config.xml
opnsense-version
ifconfig -a
pfctl -vvsr | head
\`\`\`

**Revision history:** System → Configuration → History — UI-level rollback (не substitute для offsite backup).`,
      code: {
        language: 'shell',
        caption: 'Backup, validate и diff config.xml',
        code: `# backup с timestamp
cp /conf/config.xml /root/config-backup-$(date +%Y%m%d).xml

# validate XML
xmllint --noout /conf/config.xml && echo OK

# checksum для monitoring
sha256 /conf/config.xml

# diff двух версий (на admin workstation)
diff -u config-before-change.xml config-after-change.xml | less`,
      },
    },
    {
      title: 'Backup: автоматизация (SFTP, S3, cron)',
      content: `**Scheduled backup** — System → Configuration → Backups:
- Google Drive plugin
- **Nextcloud**
- **SFTP/SCP** to central backup server
- Email (small configs only — не рекомендуется для secrets)

**SFTP automated pattern (recommended MSP):**

| Параметр | Value |
|----------|-------|
| Host | backup-srv.internal |
| Path | /backups/opnsense/\${CUSTOMER}/ |
| Schedule | Daily 02:00 local |
| Retention | 30 daily + 12 monthly on backup server |
| Encryption | gpg encrypt before upload (client-side) |

**Cron на OPNsense (если custom script):**
\`\`\`bash
# /root/scripts/backup-push.sh
BACKUP=/root/config-backup-$(date +%Y%m%d).xml
cp /conf/config.xml "\$BACKUP"
gpg --encrypt -r backup-key "\$BACKUP"
scp "\$BACKUP.gpg" backup@10.0.10.50:/backups/opnsense/hq/
\`\`\`

**S3 / object storage:**
- Use plugin or script with **aws cli** / rclone
- Bucket policy: encryption SSE-KMS, versioning ON
- Lifecycle: Glacier after 90d

**Git-based config tracking (advanced):**
- Nightly export → private git repo
- **Never** commit decrypted secrets — use git-crypt or only structural diff
- \`configctl config diff\` или xmlstarlet для sanitize passwords before commit

**Backup monitoring:**
- External check: file age < 25h on backup server
- SHA256 change alert (unexpected drift без CM ticket)
- Separate backup per HA node? **Один logical config** достаточно если sync works; backup **both** if node-specific drift suspected

**3-2-1 rule для MSP:**
- 3 copies, 2 media types, 1 offsite
- Test restore quarterly per customer tier`,
      code: {
        language: 'shell',
        caption: 'Автоматический backup + gpg + SCP',
        code: `#!/bin/sh
set -e
STAMP=$(date +%Y%m%d-%H%M)
SRC=/conf/config.xml
DEST=/root/config-backup-\${STAMP}.xml
cp "$SRC" "$DEST"
xmllint --noout "$DEST"
gpg --batch --encrypt -r ops-backup@company.local -o "\${DEST}.gpg" "$DEST"
scp "\${DEST}.gpg" backup@10.0.10.50:/backups/opnsense/site-hq/
rm -f "$DEST" "\${DEST}.gpg"`,
      },
    },
    {
      title: 'Firmware upgrade: процедура',
      content: `**In-place upgrade** — стандарт для OPNsense minor releases. Major jumps — read release notes twice.

**Pre-upgrade checklist:**
- [ ] Backup config.xml (verified download)
- [ ] Read [release notes](https://opnsense.org/releases/) и forum sticky
- [ ] HA: upgrade **BACKUP first**, failover, upgrade former MASTER
- [ ] Disk space > 2 GB free on /
- [ ] Maintenance window + rollback plan
- [ ] VPN users notified (brief disconnect possible)

**GUI procedure:**
1. System → Firmware → **Status**
2. Check **Pending updates** (base + kernel + packages)
3. Click **Update** — kernel may require reboot
4. After reboot: verify WAN/LAN, CARP role, VPN
5. System → Firmware → **Plugins** — update os-* plugins

**HA pair upgrade order:**

| Step | Node | Action |
|------|------|--------|
| 1 | BACKUP (current) | Upgrade + reboot |
| 2 | Verify | BACKUP becomes MASTER? or stay BACKUP |
| 3 | Failover test | Optional — confirm traffic on upgraded node |
| 4 | MASTER | Upgrade + reboot |
| 5 | Verify | Preempt to intended primary |
| 6 | Both | Plugin sync |

**CLI upgrade (SSH):**
\`\`\`bash
opnsense-update -p   # check pending
opnsense-update      # apply base update
opnsense-update -b   # reboot if required
\`\`\`

**Post-upgrade verification:**
- Web UI login
- \`opnsense-version\` matches expected
- pf rules loaded: \`pfctl -s info\`
- Suricata/HAProxy plugins started
- CARP MASTER on correct node
- External monitoring green

**Kernel vs base:** иногда два reboot cycles — не panic, wait full boot.`,
      code: {
        language: 'shell',
        caption: 'CLI firmware update и post-check',
        code: `# проверка pending updates
opnsense-update -p

# apply (в maintenance window)
opnsense-update
opnsense-update -b

# после reboot
opnsense-version
pfctl -si | head -5
service configd status`,
      },
    },
    {
      title: 'Firmware: rollback и lifecycle плагинов',
      content: `**Rollback** в OPNsense не «one click» как snapshot VM — планируй rollback path **до** upgrade.

**Rollback strategies:**

| Метод | RTO | Когда использовать |
|-------|-----|-------------------|
| **VM snapshot** (Proxmox/VMware) | 5–15 min | VM deployment — **best** rollback |
| **ZFS boot environment** | 10–20 min | Bare metal ZFS install |
| **Restore config + reinstall old ISO** | 30–60 min | Major breakage |
| **Config rollback only** | 5 min | Bad config change, firmware OK |

**VM snapshot rollback (recommended lab/production VM):**
1. Pre-upgrade snapshot: \`opnsense-pre-24.7\`
2. If broken: shutdown VM → revert snapshot → verify CARP disabled on stale node

**Downgrade firmware:** официально не поддерживается на same partition — reinstall previous version ISO + restore config from **pre-upgrade** backup.

**Plugin lifecycle:**
- Plugins (\`os-suricata\`, \`os-haproxy\`) version-lock to core release
- After core upgrade: **always** update plugins in same window
- Broken plugin: \`pluginctl -d os-<name>\` remove, reinstall from Firmware → Plugins

**Boot environment (ZFS)::**
\`\`\`bash
bectl list
bectl create 24.1-pre-upgrade
# upgrade...
# rollback:
bectl activate 24.1-pre-upgrade
reboot
\`\`\`

**Document in CM ticket:**
- Version before/after
- Snapshot ID / backup file name
- Test results
- Rollback executed? Y/N`,
    },
    {
      title: 'Monitoring: SNMP, Netdata и exporters',
      content: `**Observability stack** для OPNsense типично гибридный: встроенный reporting + external NMS.

**SNMP (built-in):**
- System → Settings → **SNMP**
- Version: **SNMPv3** (authPriv) — не v2c public в production
- Modules: pf, interfaces, CARP (via custom), disk, load
- Bind to management interface only

**Полезные OID категории:**
| Категория | Использование |
|-----------|---------------|
| IF-MIB | WAN bandwidth, errors |
| HOST-RESOURCES | CPU, memory, disk |
| UCD-SNMP | load averages |
| Custom script | CARP MASTER state, pf states count |

**Netdata (plugin os-netdata):**
- Real-time metrics на node
- Dashboard localhost:19999 — **не expose WAN**
- Parent-child streaming to central Netdata for MSP

**Prometheus node_exporter pattern:**
- Telegraf или custom **exec** script → Pushgateway/Prometheus
- Key metrics: \`pf_states\`, \`interface_octets\`, \`carp_master\`

**Zabbix template (community):**
- Items: CPU, memory, pf states, interface traffic
- Triggers: WAN down, states > 80% limit, backup age

**Alert thresholds (starting points SMB):**

| Metric | Warning | Critical |
|--------|---------|----------|
| pf states | 70% max | 90% max |
| CPU sustained | 70% 5m | 90% 5m |
| Disk /var | 75% | 90% |
| WAN errors | >100/s | interface down |
| CARP | wrong node MASTER 5m | dual MASTER |

**Не мониторь только ping WAN IP** — monitor gateway functionality: DNS resolve + HTTP probe через firewall.`,
      code: {
        language: 'shell',
        caption: 'SNMP walk и pf states для monitoring script',
        code: `# SNMPv3 walk (с admin workstation)
snmpwalk -v3 -l authPriv -u monitor -a SHA -A 'SECRET' \\
  -x AES -X 'SECRET' 192.168.99.1 system

# pf states count для custom exporter
pfctl -si | awk '/current entries/{print $3}'

# CARP role script (exit 0=MASTER, 1=BACKUP)
if ifconfig carp1 | grep -q carp:1; then echo MASTER; exit 0; else echo BACKUP; exit 1; fi`,
      },
    },
    {
      title: 'Monitoring: Telegraf и Grafana',
      content: `**Telegraf** на OPNsense (через FreeBSD pkg или sidecar) — гибкий pipeline metrics → InfluxDB/Prometheus/Mimir.

**Типовая архитектура MSP:**

\`\`\`
OPNsense ──Telegraf──► InfluxDB ──► Grafana
     │                      │
     └── syslog ───────────► Loki (logs correlation)
\`\`\`

**Telegraf inputs (exec + snmp):**
\`\`\`toml
[[inputs.exec]]
  commands = ["/usr/local/bin/opnsense-pf-states.sh"]
  timeout = "5s"
  data_format = "influx"

[[inputs.snmp]]
  agents = ["127.0.0.1"]
  version = 3
  # ... snmp v3 auth
\`\`\`

**Grafana dashboard ideas (panels):**
1. **WAN throughput** per interface (in/out stacked)
2. **pf states** current vs max (gauge + trend)
3. **CARP role** per site (stat panel, color by node)
4. **VPN active sessions** (WireGuard: wg show; OpenVPN: status log parse)
5. **Suricata alerts** rate (from syslog/Loki)
6. **Backup age** hours (external prometheus blackbox)
7. **Latency** to 1.1.1.1 / ISP gateway multi-WAN
8. **Certificate expiry** ACME WAN cert

**Correlation при incident:**
- Overlay WAN errors + states spike + CPU
- Jump from Grafana to Loki: \`{host="fw-hq"} |= "filter"\`

**MSP multi-dashboard:**
- Row per customer site
- Variables: site_id, wan_interface
- Alert rules in Grafana Unified Alerting → PagerDuty/Slack

**Synthetic monitoring:**
- External probe (Hetrix, Uptime Kuma) ping **public IP**
- Internal probe from monitoring VLAN: HTTP → internal app through full path`,
    },
    {
      title: 'Syslog remote и SIEM integration',
      content: `**Centralized logging** критичен для security audit и outage RCA.

**GUI: System → Settings → Logging / Remote**
- Enable **Send log messages to remote syslog server**
- Remote server: \`10.0.10.100:514\` (rsyslog/Syslog-ng/Graylog)
- Protocol: TCP (reliable) или TLS если supported
- Format: RFC5424 preferred

**Что forwardить:**

| Log | Value |
|-----|-------|
| Firewall filter | Denied flows, rule debugging |
| Firewall normal | High volume — selective |
| VPN | Auth success/fail |
| System / Backend | Config changes, login |
| Suricata | IDS alerts |
| DHCP | Lease issues |

**Volume control:**
- Log only **blocked** rules in production (not all passed)
- Sampling на high-traffic allow rules
- Separate remote target for security (SIEM) vs ops (Graylog)

**Graylog/ELK pipeline:**
\`\`\`
OPNsense syslog ──► rsyslog ──► Graylog extractors
                              └── GELF TCP 12201
\`\`\`

**Useful Graylog searches:**
- \`source:opnsense-hq AND message:"authentication failed"\`
- \`message:"CARP"\` — failover events
- \`message:"filter"\` AND action:block

**SIEM (Wazuh/Splunk):**
- Correlate VPN brute force + firewall denies
- Alert on config change events (API/user login + configd)

**Retention SMB:** 90d hot, 1y cold — compliance dependent.

**Test monthly:** inject test log line or trigger deny rule → verify arrival in SIEM < 60s.`,
      code: {
        language: 'shell',
        caption: 'Проверка syslog и локальных log files',
        code: `# tail firewall log
clog -f /var/log/filter

# config changes
clog -f /var/log/configd.log

# test remote syslog (на rsyslog server)
logger -n 10.0.10.100 -P 514 -t opnsense-test "syslog pipeline OK"`,
      },
    },
    {
      title: 'REST API: аутентификация и endpoints',
      content: `**OPNsense API** — REST over HTTPS, JSON payloads. Покрытие растёт с каждым release; не 100% GUI parity — verify per task.

**Authentication methods:**

| Метод | Use case |
|-------|----------|
| **API Key + Secret** | Automation (recommended) |
| **User password** | Quick tests only |
| Basic over HTTPS | curl -u (legacy scripts) |

**Create API credentials:**
- System → Access → **Users** → user \`automation\` (least privilege)
- System → Access → **API** → add key for user
- Store key/secret in vault — secret shown **once**

**Base URL:** \`https://192.168.99.1/api/\`

**Common endpoints (examples):**
| Endpoint | Action |
|----------|--------|
| \`/api/core/backup/download/backup\` | Download config |
| \`/api/core/firmware/status\` | Firmware info |
| \`/api/firewall/filter/searchRule\` | List rules |
| \`/api/firewall/filter/addRule\` | Add rule |
| \`/api/diagnostics/interface/getInterfaceConfig\` | Interface state |

**Request pattern:**
- GET — read
- POST — create/action (body JSON)
- PUT — update
- DELETE — remove
- Many POSTs require \`{"uuid":"..."}\` from search first

**Security:**
- API only from management VLAN
- Dedicated automation user, not root
- Rotate keys quarterly
- Audit API user actions in configd.log

**Rate limits:** нет жёсткого vendor limit — не hammer search endpoints in loop.`,
      code: {
        language: 'shell',
        caption: 'REST API: аутентификация и firmware status',
        code: `# API key auth (key + secret headers)
KEY="your-api-key"
SECRET="your-api-secret"
BASE="https://192.168.99.1"

curl -sk -u "$KEY:$SECRET" \\
  "$BASE/api/core/firmware/status" | jq .

# download backup via API
curl -sk -u "$KEY:$SECRET" \\
  -o config-backup.xml \\
  "$BASE/api/core/backup/download/backup"`,
      },
    },
    {
      title: 'REST API: примеры автоматизации',
      content: `**Use cases:** emergency rule, bulk alias update, backup pull, read-only audit export.

**Search firewall rules (JSON):**
\`\`\`bash
curl -sk -u "$KEY:$SECRET" \\
  -X POST "$BASE/api/firewall/filter/searchRule" \\
  -d '{}' | jq '.rows[] | {uuid, description, enabled}'
\`\`\`

**Add temporary allow rule (emergency break-glass):**
Document **always** with expiry ticket — remove via API after incident.

**JSON body structure** mirrors GUI model — use search first to copy template from existing rule.

**Disable rule by UUID:**
\`\`\`bash
UUID="abc-def-..."
curl -sk -u "$KEY:$SECRET" \\
  -X POST "$BASE/api/firewall/filter/toggleRule/$UUID" \\
  -d '{}'
\`\`\`

**Apply changes:**
Many mutations need \`POST /api/firewall/filter/apply\` to reload pf.

**Python pattern (requests):**
\`\`\`python
import requests
s = requests.Session()
s.auth = (API_KEY, API_SECRET)
s.verify = False  # use proper CA in prod
r = s.get(f"{BASE}/api/core/firmware/status")
print(r.json())
\`\`\`

**CI integration:** nightly job pulls config backup via API → encrypted artifact in S3 → drift alert if hash changed without CM ticket.

**Pitfalls:**
- Forgetting **apply** after rule change
- UUID stale after restore
- SSL verify failures — use internal CA cert on automation host`,
      code: {
        language: 'shell',
        caption: 'REST API: search rules и apply firewall',
        code: `KEY="api-key"
SECRET="api-secret"
BASE="https://192.168.99.1"

# search rules
curl -sk -u "$KEY:$SECRET" \\
  -X POST "$BASE/api/firewall/filter/searchRule" \\
  -H "Content-Type: application/json" \\
  -d '{}' | jq '.rows | length'

# apply firewall after changes
curl -sk -u "$KEY:$SECRET" \\
  -X POST "$BASE/api/firewall/filter/apply" \\
  -H "Content-Type: application/json" \\
  -d '{}' | jq .`,
      },
    },
    {
      title: 'Ansible и Terraform для OPNsense',
      content: `**Ansible** — наиболее mature path для OPNsense automation через **ansibleguy/opnsense** или **patrickjahns/opnsense_plugin** community collections.

**Ansible notes:**
- Target: \`hosts: opnsense\` with \`ansible_connection=local\` on jump host **or** SSH to OPNsense as FreeBSD
- Prefer **API modules** over raw XML injection
- Playbook structure: roles per customer/site
- **HA:** run changes on MASTER only; config sync propagates — verify sync before dual edit

**Example Ansible tasks (conceptual):**
\`\`\`yaml
- name: Ensure backup before change
  ansible.builtin.uri:
    url: "https://{{ fw_mgmt }}/api/core/backup/download/backup"
    user: "{{ api_key }}"
    password: "{{ api_secret }}"
    dest: "/tmp/{{ inventory_hostname }}-config.xml"
    validate_certs: true

- name: Apply firewall alias
  opnsense.alias:
    name: NET_SERVERS
    type: host
    content: ["10.0.10.10", "10.0.10.11"]
    api_url: "https://{{ fw_mgmt }}"
    api_key: "{{ api_key }}"
    api_secret: "{{ api_secret }}"
\`\`\`

**Terraform:**
- No official OPNsense provider in Terraform Registry tier-1
- Community: \`browningluke/opnsense\` — verify maturity for your use case
- Typical pattern: **Terraform manages surrounding cloud** (AWS TGW, routes); OPNsense config via Ansible
- Alternative: Terraform **external** data source + API scripts

**GitOps caution:**
- config.xml full push — risky (secrets, node-specific)
- Prefer API resource-per-type with review in PR
- HA node-specific: separate \`host_vars/fw1.yml\` vs \`fw2.yml\` for IPs only

**MSP pattern:**
- Tower/AWX per MSP
- Job templates: backup, upgrade, rule deploy
- Survey: customer_id, ticket_number mandatory`,
    },
    {
      title: 'Performance tuning: NIC, RSS и hw.igb',
      content: `**Throughput complaints** на OPNsense часто = NIC driver tuning, not «buy faster CPU».

**Intel igb/ixgbe (common):**
- Loader tunables в \`/boot/loader.conf.local\`:
\`\`\`
hw.igb.msix_disable=0
hw.igb.rxd=2048
hw.igb.txd=2048
\`\`\`

**RSS (Receive Side Scaling):**
- Distributes packets across CPU cores
- Check: \`sysctl dev.igb.0.iflib\` / interrupt distribution
- **Uneven RSS** → one core 100%, others idle — tune flow tables or disable problematic offload

**Offloads:**
| Setting | Recommendation |
|---------|----------------|
| LRO | Often **off** on firewall |
| TSO | Test — sometimes hurts pf |
| VLAN hardware filter | On for VLAN heavy |

**IRQ affinity (advanced):**
- \`cpuset -l 2 -j irq261\` — pin IRQ to core (version-specific)
- Document before/after throughput test (iperf3 through firewall)

**Multi-WAN load balancing:**
- System → Routing → Gateway Groups
- Monitor pools: ping ISP DNS
- Sticky connections — understand algorithm

**Suricata/IDS impact:** IPS mode = single-threaded bottleneck often — dedicate NIC or expect cap ~1 Gbps on SMB hardware.

**Measurement methodology:**
1. Baseline iperf3 **through firewall** (not on box)
2. Record states count during test
3. Change **one** tunable at a time
4. Reboot if loader.conf changed`,
      code: {
        language: 'shell',
        caption: 'NIC tuning и interrupt load check',
        code: `# текущие loader tunables
sysctl hw.igb | head -20

# interrupt stats
sysctl dev.interrupt

# per-interface counters
netstat -ibn -I igb0

# states during load test
watch -n1 'pfctl -si | grep current'`,
      },
    },
    {
      title: 'Performance tuning: states limits и memory',
      content: `**pf state table** — каждый TCP/UDP flow = state entry. Exhaustion → new connections fail, «random» app breakage.

**Check limits:**
\`\`\`bash
pfctl -si
# max entries, entries, searches, conflicts
\`\`\`

**Default limits** scale with RAM — override in Firewall → Settings → Advanced:
- **Maximum table entries** (states)
- **Timeout values** — lower idle timeout = faster state release

**Tuning guidelines:**

| Environment | State limit hint |
|-------------|------------------|
| Small office | default OK |
| 200 users + NAT | monitor peak, set 20% headroom |
| Heavy CDN/video | high states, tune timeouts |
| Many short API calls | high CPS — CPU + pfsync stress |

**Memory formula (rough):** ~1 KB per state — 500k states ≈ 500 MB+ kernel memory.

**Timeout tuning:**
- Firewall → Settings → **Timeouts**
- Reduce \`tcp.established\` only if understanding impact on long downloads
- \`udp.first\` — DNS-like short UDP

**State killing (emergency only):**
\`\`\`bash
pfctl -F states   # ALL sessions drop — production outage!
\`\`\`
Prefer targeted: \`pfctl -k 192.168.20.50\`

**Platforms limit:**
- 32-bit deprecated
- VM: allocate enough RAM — ballooning hurts

**HA:** both nodes **identical** state limits — backup must hold full table.

**Monitoring:** alert at 70/90% sustained — investigate before hitting 100%.`,
    },
    {
      title: 'Disk, ZFS health и SMART',
      content: `**Disk failure** на edge firewall = outage если нет HA. Monitor proactively.

**UFS (typical install):**
- \`df -h\` — /var log growth, Suricata eve.json
- Log rotation: System → Settings → Logging
- **Full /var** → services fail silently

**ZFS install (production recommended):**
- \`zpool status\` — POOL health
- \`zpool list\` — capacity
- Monthly **scrub**: \`zpool scrub zroot\`

**SMART monitoring:**
\`\`\`bash
smartctl -a /dev/ada0
smartctl -H /dev/ada0  # PASSED/FAIL
\`\`\`
Schedule weekly; alert on **Reallocated_Sector_Ct** increase.

**Log volume drivers:**
| Source | Mitigation |
|--------|------------|
| Firewall log all | Log blocks only |
| Suricata eve | rotate + remote |
| DHCP verbose | reduce |
| Netdata | retention tuning |

**ZFS boot environments** — snapshot before upgrade (see firmware section).

**MSP:** central SMART collection via SNMP extend script — dashboard «disk pred fail» per site.

**Replacement procedure:**
1. HA: replace disk on BACKUP, reinstall, restore config, sync
2. Single: maintenance window, USB reinstall, restore config.xml`,
      code: {
        language: 'shell',
        caption: 'ZFS health и disk space audit',
        code: `# ZFS pool health
zpool status -v

# scrub progress
zpool scrub zroot

# largest log files
du -ah /var/log | sort -rh | head -20

# SMART quick check
smartctl -H /dev/ada0`,
      },
    },
    {
      title: 'Crash dumps и kernel panics',
      content: `**Kernel panic** на firewall — rare but memorable. Prepare capture before second occurrence.

**Symptoms:**
- Sudden reboot, CARP failover
- Console: panic string, backtrace
- \`/var/crash/\` — dump files if configured

**Enable crash dumps (adequate disk required):**
\`\`\`bash
# /etc/rc.conf.local
dumpdev="AUTO"
savecore_enable="YES"
savecore_flags="-z"
\`\`\`

**After panic:**
\`\`\`bash
ls -la /var/crash/
textdump decode -v /var/crash/textdump.tar.X
\`\`\`

**Common causes SMB:**
- Faulty NIC driver + specific offload
- Out of memory / state table explosion
- Bug specific OPNsense release — check forum
- Bad hardware RAM/PSU

**RCA workflow:**
1. Correlate time with CARP event, surge metrics
2. Check \`dmesg\` after reboot
3. Match version — search forum panic + version
4. If reproducible: disable offload, test
5. Open forum thread with panic trace — community responsive

**HA during panic:** backup takes VIP — verify automatic. Root cause still required — backup may panic too if shared bug.

**VM:** increase host monitoring — hypervisor pause/stop events.`,
    },
    {
      title: 'Security updates cadence',
      content: `**Patch cadence** для OPNsense — balance security vs change risk.

**Recommended SMB schedule:**

| Type | Cadence | Notes |
|------|---------|-------|
| **Security advisory (OPNsense)** | Within 7–14 days | Read severity |
| **Minor firmware** | Monthly window | HA order |
| **Major release** | Quarterly after forum stable | Lab first |
| **FreeBSD base CVE** | Bundled in OPNsense release | |
| **Plugins (Suricata)** | With core update | |
| **ACME cert** | Auto 60d renew | monitor |

**Advisory sources:**
- [opnsense.org/security](https://opnsense.org/security/)
- Forum announcements
- RSS/email subscribe

**Severity triage:**

| Severity | Action |
|----------|--------|
| Remote exploit WAN-facing | Emergency window 24–48h |
| Auth bypass API | Same |
| Local admin only | Next monthly |
| Plugin optional | Evaluate exposure |

**Zero-day interim:** temporary firewall rule mitigate → upgrade ASAP.

**Compliance (PCI/ISO):** document patch SLA, exceptions, scan after patch.

**Pen test cycle:** annual external + validate Suricata rules updated.

**Dev/test:** lab mirror production version — test upgrade path before prod.`,
    },
    {
      title: 'Change management для OPNsense',
      content: `**CM process** prevents «quick rule Friday» outages.

**Change categories:**

| Type | Approval | Example |
|------|----------|---------|
| Standard | Pre-approved | Monthly firmware |
| Normal | CAB/manager | New VPN, NAT change |
| Emergency | Post-approve | Break-glass allow rule |

**CM ticket template:**
- Customer/site ID
- Description + business reason
- **Rollback plan** (restore backup name / revert rule UUID)
- Test plan
- Maintenance window
- HA impact (failover expected?)
- Communication list

**Config diff workflow:**
1. Export config before
2. Change in GUI/API
3. Export after
4. \`diff -u\` attach to ticket
5. Or automated API backup to git

**Peer review:** second engineer reviews firewall rule changes — especially **any allow inbound WAN**.

**Maintenance window comms:**
- Email: «VPN may disconnect 30s during HA failover»
- NOC standby first 30 min after change

**Forbidden practices:**
- Edit production without ticket
- Shared admin password
- Test rule «allow any» left enabled
- Upgrade both HA nodes without procedure

**Post-implementation review (PIR):** если incident — blameless, update runbook.`,
    },
    {
      title: 'DR runbooks',
      content: `**Disaster Recovery** — когда site total loss, ransomware on hypervisor, или double hardware failure.

**RTO/RPO targets (SMB typical):**

| Tier | RTO | RPO | Strategy |
|------|-----|-----|----------|
| Tier-1 HQ | 1–4 h | 24 h | HA + offsite backup |
| Tier-2 branch | 4–8 h | 24 h | Cold VM template |
| Tier-3 small | 24 h | 48 h | Spare config + ship hardware |

**DR scenarios:**

**Scenario A — Config corruption:**
1. Restore last good config.xml from backup server
2. Reboot services
3. RTO: 15 min

**Scenario B — Hardware dead, no HA:**
1. Provision new VM / spare box
2. Install OPNsense same major version
3. Assign interfaces WAN/LAN
4. Restore config.xml
5. Update WAN MAC/ISP if changed
6. RTO: 2–4 h

**Scenario C — Datacenter loss:**
1. Activate DR site VM (cloud or secondary DC)
2. Restore config + update DNS/BGP public IP
3. VPN profiles may need new endpoint IP
4. RTO: 4–24 h (DNS propagation)

**DR kit (physical):**
- USB with OPNsense ISO + latest config gpg
- Interface assignment cheat sheet
- ISP activation phone

**Quarterly DR test:**
- Restore to isolated lab network
- Verify VPN, NAT, critical rules
- Time the procedure — update runbook

**Documentation storage:** runbook copies **offsite** — not only on OPNsense.`,
    },
    {
      title: 'Packet capture workflows',
      content: `**Packet capture** — последний accurate tool когда logs недостаточны.

**GUI:** Diagnostics → **Packet Capture**
- Interface: LAN/WAN/VLAN
- Host: filter single IP
- Download pcap → Wireshark on workstation

**CLI tcpdump:**
\`\`\`bash
tcpdump -ni igb1 host 192.168.20.50 and port 443 -w /tmp/capture.pcap
\`\`\`

**Capture без «колпака» на production:**
- Limit **-c count** packets
- Off-hours if possible
- Dedicated capture disk space
- **Sensitive data** in pcap — encrypt storage, delete after RCA

**Workflow «app не работает через firewall»:**

| Step | Capture point | See |
|------|---------------|-----|
| 1 | LAN client | SYN sent? |
| 2 | LAN interface OPNsense | Arrives? |
| 3 | After filter OUT | Forwarded? |
| 4 | WAN OUT | NAT correct src IP? |
| 5 | WAN IN return | Reply arrives? |
| 6 | LAN OUT to client | Delivered? |

**HA captures:** capture on **active MASTER** — verify with CARP state first.

**VPN captures:** on tunnel interface (\`ovpns1\`, \`wg0\`) — encrypted payload, but handshake visible.

**Suricata false positive:** capture accepted flow before drop to tune SID.

**Tools:** Wireshark, tcpdump, **termshark** on jump host.`,
      code: {
        language: 'shell',
        caption: 'tcpdump: capture и rotation',
        code: `# 500 packets WAN, host filter
tcpdump -ni igb0 -c 500 -w /tmp/wan.pcap host 8.8.8.8

# rotate captures (cron pre-incident baseline)
tcpdump -ni igb1 -G 3600 -W 6 -w /var/tmp/lan-%Y%m%d%H.pcap port 443

# read summary
tcpdump -nr /tmp/wan.pcap | head -50`,
      },
    },
    {
      title: 'Outage playbooks: internet, VPN и DHCP',
      content: `### Playbook 1: «Нет интернета» (all users)

| Step | Check | Fix |
|------|-------|-----|
| 1 | WAN link up? | Physical/ISP |
| 2 | Ping ISP gateway from OPNsense WAN | ISP ticket |
| 3 | Ping 1.1.1.1 from OPNsense | Routing/default gw |
| 4 | LAN client ping gateway VIP | CARP/switch |
| 5 | DNS resolve on OPNsense | Unbound restart |
| 6 | pf states maxed? | Raise limit / kill stale |
| 7 | Recent change? | Rollback config |
| 8 | NAT rules present? | Restore outbound NAT |
| 9 | ISP ARP/MAC | Release/renew, update MAC if CPE |

**Quick isolate:** laptop static IP + ping chain.

### Playbook 2: «VPN down»

| Step | Check | Fix |
|------|-------|-----|
| 1 | Service running? | \`pluginctl -s\` / wg show |
| 2 | WAN port reachable? | External port check |
| 3 | Firewall allow WAN→VPN? | Rule |
| 4 | Certificate expiry? | ACME renew |
| 5 | Pool exhaustion? | Expand pool |
| 6 | HA failover broke endpoint? | Clients use VIP? |
| 7 | ISP blocking UDP? | Switch OpenVPN TCP 443 |
| 8 | Radix: one user vs all | Account vs system |

**WireGuard:** \`wg show\` — handshake time recent?

### Playbook 3: «DHCP fail»

| Step | Check | Fix |
|------|-------|-----|
| 1 | Kea/dhcpd running? | Service restart |
| 2 | Pool full? | Expand / shorten lease |
| 3 | New subnet no pool? | Add range |
| 4 | Relay misconfigured? | Helper address |
| 5 | VLAN mismatch? | Interface binding |
| 6 | Disk full /var? | Clean logs |
| 7 | HA split scope? | Sync config |

**Emergency:** static IP handful critical users while fixing.`,
    },
    {
      title: 'Capacity planning',
      content: `**Capacity planning** — annual review prevents «suddenly 100% states».

**Metrics to trend (12 months):**

| Metric | Growth driver |
|--------|---------------|
| Peak pf states | Users, SaaS, IoT |
| WAN peak Mbps | Video, backups |
| VPN concurrent | Remote work policy |
| CPU avg/peak | IDS, VPN crypto |
| Disk /var | Logging, Suricata |
| Rules count | Complexity, MSP ACLs |

**Headroom targets:**
- States: peak < 70% limit
- CPU: peak < 65% sustained business hours
- WAN: peak < 60% contracted ISP rate
- Disk: < 70% with log policy

**Scaling options:**

| Bottleneck | Scale path |
|------------|------------|
| VPN crypto | Faster CPU, more cores |
| IDS throughput | Dedicated IDS sensor inline |
| States | RAM + limit tuning |
| WAN bandwidth | Upgrade ISP, second WAN |
| HA capacity | Same model pair |

**Hardware refresh trigger:** 3 consecutive quarters peak > 75% OR end of vendor support.

**VM sizing:** start 4 vCPU / 4–8 GB for 100 users with IDS; validate with load test.

**Forecast template:** users × 15 states + servers × 50 + 20% margin.`,
    },
    {
      title: 'MSP multi-tenant patterns',
      content: `**MSP** управляет десятками OPNsense instances — стандартизация = margin.

**Tenant isolation models:**

| Model | Pros | Cons |
|-------|------|------|
| **Per-customer VM** | Strong isolation | More overhead |
| **Per-customer hardware** | Performance | Logistics |
| **Shared monitoring** | Efficient NOC | Blast radius if mis-tag |

**Standard golden config:**
- Base hardening template
- SNMPv3 + syslog target per MSP region
- Backup schedule identical
- Admin user naming: \`msp-admin-<region>\`

**Naming convention:**
\`\`\`
opnsense-<customer_id>-<site>-<role>
fw-acme-hq-primary
fw-acme-hq-backup
\`\`\`

**Monitoring tags:**
- customer_id, tier, ha_enabled, version

**Automation hierarchy:**
\`\`\`
AWX ──► site groups ──► backup job / upgrade job
         └── limit: customer_acme
\`\`\`

**Credential vault:** per-site API keys — never one key all customers.

**SLA tiers:**
- Tier Gold: HA + 4h RTO + monthly report
- Tier Silver: single + 8h RTO
- Tier Bronze: best effort

**Onboarding checklist:** 40 items — from IP plan to backup verify.

**Offboarding:** destroy keys, wipe config, ISP handoff doc.

**Billing:** per-device monitoring + backup storage + change hours.`,
    },
    {
      title: 'Labs: практические сценарии',
      content: `**Lab environment** — mirror production patterns at smaller scale. Minimum: 1 OPNsense VM + 2 LAN clients.

**Lab 1 — CARP HA pair:**
- 2 VMs, sync link, LAN VIP
- Failover test with continuous ping + SSH
- Document packet loss

**Lab 2 — Backup/restore DR:**
- Backup config → destroy VM → new VM restore
- Time RTO

**Lab 3 — API automation:**
- Create API user, pull backup cron from Linux jump host
- Add rule via API + apply

**Lab 4 — Monitoring pipeline:**
- SNMPv3 to Zabbix OR Telegraf → Influx → Grafana dashboard pf states

**Lab 5 — Syslog:**
- Graylog in Docker, forward OPNsense logs, create stream alert

**Lab 6 — Packet capture RCA:**
- Break rule intentionally, capture pcap, fix

**Lab 7 — Firmware upgrade + rollback:**
- Snapshot VM, upgrade, revert snapshot

**Lab 8 — Performance baseline:**
- iperf3 through firewall, record states CPU at 100M/500M/1G

**Lab topology:**
\`\`\`
[Internet sim] ── WAN
[OPNsense HA pair]
    └── LAN ── [client1] [client2]
\`\`\`

**Proxmox tip:** clone template VM with ZFS linked clones for fast refresh.`,
    },
    {
      title: 'FAQ',
      content: `**Q: CARP vs keepalived/VRRP?**
A: CARP — native FreeBSD для OPNsense HA pair. VRRP не используется в stock OPNsense.

**Q: Можно ли active-active HA?**
A: Classic CARP — active/passive. Active/active multi-WAN possible but not same VIP active on both for same subnet.

**Q: Как часто backup?**
A: Daily automated minimum; before every change manual.

**Q: API покрывает 100% GUI?**
A: Нет — проверяй endpoint для конкретной задачи; некоторые plugin settings только GUI.

**Q: Suricata на WAN — performance hit?**
A: Significant on SMB hardware — plan 30–50% throughput reduction IPS mode.

**Q: OPNsense в AWS HA?**
A: CARP problematic — consider single instance + automation restore или BGP solutions.

**Q: pfsync через LAN OK?**
A: Works but dedicated sync link preferred — security and bandwidth isolation.

**Q: Downgrade firmware?**
A: Reinstall old ISO + restore old config — not in-place downgrade.

**Q: Как detect split-brain?**
A: Monitor CARP MASTER on both; alert if both MASTER > 30s.

**Q: config.xml secrets?**
A: Passwords hashed but treat as sensitive — encrypt backups.

**Q: IPv6 HA?**
A: Supported with CARP v6 VIPs — test ISP IPv6 stability separately.

**Q: Замена железа — interface names changed?**
A: Re-assign interfaces in console menu before full restore works.`,
    },
    {
      title: 'Interview Q&A',
      content: `**Q1: Опиши failover CARP pair от начала до конца.**
A: MASTER fails → CARP skew election → BACKUP promotes VIP → gratuitous ARP → switches learn new MAC → pfsync states on BACKUP continue flows → clients 1–3 ping loss → monitor confirms new MASTER → RCA primary.

**Q2: asymmetric routing после failover — как диагностировать?**
A: Compare pf states on both nodes, tcpdump both directions, verify default gw is VIP not real IP, check upstream ARP/static routes, confirm single MASTER.

**Q3: Порядок upgrade HA pair?**
A: Backup node first, verify, then primary, plugins after core both, failover test optional between.

**Q4: config.xml restore на новое железо?**
A: Install matching version, assign WAN/LAN roles, restore XML, fix interface mapping if NIC names differ, verify CARP skew/IPs node-specific.

**Q5: states table full — что делать?**
A: Immediate: identify spike source, avoid blind -F states; short-term targeted kill; medium increase limit if RAM allows; long tune timeouts, fix scan malware, scale hardware.

**Q6: Design monitoring for 50 MSP customers.**
A: Standardized SNMPv3/syslog, centralized Grafana multi-tenant, backup age external check, CARP role script, tiered alerts, AWX automation, per-customer API keys.

**Q7: Emergency allow rule — process?**
A: Break-glass API/GUI rule narrow scope, CM emergency ticket, expire/remove within 24h, audit log review.

**Q8: OPNsense vs FortiGate ops burden?**
A: OPNsense: no license renewals, more DIY tuning/patch research; FortiGate: FortiCare, unified ecosystem, less shell freedom.

**Q9: Когда НЕ использовать CARP?**
A: Cloud MAC restrictions, single WAN ISP MAC lock, inadequate sync link, asymmetric upstream routing unfixable.

**Q10: DR test success criteria?**
A: Restored config passes checklist: WAN, NAT, VPN, critical rules, monitoring, backup re-established, documented RTO met.`,
    },
    {
      title: 'Case study 1: asymmetric routing после CARP failover',
      content: `**Контекст:** SMB manufacturing, 120 users, OPNsense HA CARP pair on Proxmox, dual VLAN (Users + Servers).

**Incident:** Planned failover test — backup became MASTER cleanly, but **ERP on servers VLAN** lost DB connections from users VLAN. Ping worked; TCP apps timeout.

**Timeline:**
- T+0: Admin demoted MASTER skew for test
- T+1 min: Users report ERP down
- T+5 min: Primary restored skew — ERP recovered

**Root cause:** Servers VLAN default gateway on **server static config** pointed to fw1 **real IP** 192.168.10.2 not VIP 192.168.10.1. When fw2 MASTER, return traffic from servers went to fw1 (still thinking it's gateway) while clients used VIP → **asymmetric pf states**.

**Why ping worked:** ICMP stateless less sensitive; TCP ERP long-lived broken.

**Fix:**
1. Change all server gateways to VIP 192.168.10.1
2. Document in IP plan «always VIP»
3. Ansible fact check script for wrong gateway
4. Re-test failover — ERP sessions survived

**Lessons:**
- Failover test must include **application** not only ping
- Real IPs for management SSH only — document clearly
- Post-mortem added to quarterly failover checklist item «verify DB flows»`,
    },
    {
      title: 'Case study 2: firmware upgrade в HA pair без процедуры',
      content: `**Контекст:** MSP client retail chain, 40 stores, HQ OPNsense HA — remote branches single node.

**Incident:** Engineer upgraded **both** HQ nodes same evening without failover sequence during major 24.x jump. fw1 reboot mid-upgrade; fw2 partially updated — **config sync XMLRPC version mismatch**. Result: **dual MASTER** CARP, intermittent WAN, 2h outage HQ.

**Timeline:**
- 22:00 both nodes rebooted after update
- 22:15 NOC alerts WAN flapping
- 23:30 MSP isolated fw2 — carp down on fw2
- 00:15 fw1 stable single MASTER; fw2 rebuilt from template + config restore

**Root cause:** Procedure violation + no maintenance snapshot + skipped backup verify.

**Recovery:**
1. fw1 operational as single
2. fw2 reinstall same firmware as fw1
3. Restore pre-upgrade config gpg from backup server
4. Re-sync HA settings
5. Failover test next maintenance window

**Preventive controls:**
- AWX job template «HA upgrade» enforces order with manual approval gate
- Pre-check backup file < 24h old
- VM mandatory snapshot
- CM ticket peer review for HA changes

**Lessons:** HA doubles complexity — **procedure is availability**; tooling enforce beats policy document.`,
    },
    {
      title: 'Case study 3: MSP multi-site restore после ransomware',
      content: `**Контекст:** MSP hosting Proxmox cluster per region; 25 OPNsense VMs; centralized SFTP backups gpg encrypted; no HA on small clients.

**Incident:** Ransomware on Proxmox host encrypted VM disks — including 8 OPNsense VMs. ISP links still up but no routing.

**Response (MSP playbooks activated):**

| Phase | Action | Duration |
|-------|--------|----------|
| Isolate | Host disconnected WAN | 15 min |
| Assess | Identify 8 affected from inventory | 30 min |
| Provision | Clean Proxmox node, template deploy | 2 h |
| Restore | gpg decrypt config.xml per site | 3 h |
| WAN | Coordinate ISP if public IP on new NIC MAC | variable |
| VPN | Push updated OpenVPN profiles (same IP lucky) | 1 h |
| Verify | Automated smoke test script | 1 h |

**RTO achieved:** 6–8h for 8 sites — within Silver SLA.

**What worked:**
- **3-2-1 backups** offsite SFTP attacker couldn't reach
- Standardized template VM — fast deploy
- Inventory API keys + IP plan in separate vault (not on Proxmox)

**Gaps found:**
- 2 sites backups stale (45d) — manual rebuild rules from git
- No tested restore on 3 sites > 1 year

**Post-incident:**
- Monthly restore test automated AWX
- HA offered upgrade Tier Gold for HQ
- Immutable backup copy S3 Object Lock

**Lessons:** MSP multi-tenant — **backup without tested restore is vanity**; ransomware validates DR not HA alone.`,
    },
  ],
  practice: [
    'Разверни CARP HA pair в Proxmox (2 VM + sync link): LAN VIP, failover test с ping и SSH session',
    'Настрой daily backup config.xml на SFTP + gpg; напиши external check «file age < 25h»',
    'Выполни firmware upgrade на BACKUP node first в HA pair по documented procedure',
    'Подними SNMPv3 + экспорт pf states в Zabbix или Grafana (exec script)',
    'Настрой syslog forward на Graylog; создай alert на CARP MASTER change',
    'Создай API user, автоматизируй nightly backup pull через curl на Linux jump host',
    'Tuning lab: baseline iperf3 through firewall, затем adjust hw.igb tunables и сравни',
    'DR exercise: restore config.xml на новую VM, засеки RTO, задокументируй gaps',
    'Outage simulation: сломай outbound NAT, пройди playbook «нет интернета» с tcpdump',
    'Tabletop: asymmetric routing case — настрой wrong gateway на server, reproduce, fix',
  ],
  resources: [
    { title: 'OPNsense HA (CARP) documentation', url: 'https://docs.opnsense.org/manual/hacarp.html' },
    { title: 'OPNsense API reference', url: 'https://docs.opnsense.org/development/api.html' },
    { title: 'OPNsense security advisories', url: 'https://opnsense.org/security/' },
    { title: 'FreeBSD pf tuning', url: 'https://docs.freebsd.org/en/books/handbook/firewalls/' },
    { title: 'ansibleguy/opnsense Ansible collection', url: 'https://github.com/ansibleguy/opnsense' },
    { title: 'OPNsense Forum — HA and operations', url: 'https://forum.opnsense.org/index.php?board=13.0' },
    { title: 'Grafana dashboards community', url: 'https://grafana.com/grafana/dashboards/' },
  ],
}
