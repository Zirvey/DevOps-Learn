import type { Chapter } from '../../../types'

export const opnsenseFundamentalsChapter: Chapter = {
  id: 'opnsense-fundamentals',
  slug: 'opnsense-fundamentals',
  title: 'OPNsense — open-source firewall',
  moduleId: 'opnsense',
  order: 0,
  duration: '5–6 часов',
  level: 'intermediate',
  description:
    'Установка, интерфейсы, firewall rules, NAT, aliases, VPN (WireGuard/OpenVPN), пакеты (Suricata), бэкапы, эксплуатация и сравнение с FortiGate/pfSense',
  sections: [
    {
      title: 'OPNsense в экосистеме: от pfSense к open-source NGFW',
      content: `**OPNsense** — open-source платформа сетевой безопасности на базе FreeBSD и **pf** (packet filter). Проект появился в 2014 году как fork pfSense после споров вокруг коммерциализации; сегодня это полноценная альтернатива коммерческим NGFW для SMB, MSP и homelab.

**Что OPNsense даёт «из коробки»:**
- Stateful firewall с гранулярными правилами
- NAT (outbound, port forward, 1:1)
- Multi-WAN, failover, load balancing
- DHCP, DNS (Unbound), captive portal
- VPN: WireGuard, OpenVPN, IPsec
- Плагины: Suricata IDS/IPS, Zenarmor, HAProxy, ACME, Zabbix agent
- Web UI + SSH/CLI, REST API (частично)

**Сравнение с pfSense:**

| Критерий | OPNsense | pfSense |
|----------|----------|---------|
| Лицензия | BSD, community-driven | pfSense CE / Plus (коммерческая ветка) |
| UI/UX | Современный, модульный | Классический, богатый |
| Обновления | Регулярные, прозрачный roadmap | CE vs Plus — разные feature sets |
| Плагины | os-* packages в репозитории | Packages + Plus-only features |
| API | Растущий REST API | Limited в CE |

**Сравнение с FortiGate (SMB контекст):**

| Критерий | OPNsense | FortiGate |
|----------|----------|-----------|
| Стоимость | Без лицензии на базовый firewall | Железо + FortiGuard подписки |
| UTM depth | Suricata/Zenarmor — хорошо, но не tier-1 | IPS/AV/App Control enterprise-grade |
| Security Fabric | Нет единой экосистемы switch/AP | FortiLink, FortiAP, FortiSwitch |
| Support | Community + коммерческие партнёры | FortiCare SLA |
| Throughput | Зависит от CPU/VM, без ASIC offload | ASIC acceleration на моделях FG |

**Когда выбирать OPNsense:**
- Нужен полный контроль, без vendor lock-in и подписок на базовый firewall
- MSP с white-label CPE на VM или белом железе
- Lab, branch office, remote site с WireGuard
- Бюджет ограничен, но нужны IDS, VPN, multi-WAN

**Когда FortiGate/pfSense Plus:**
- Нужен enterprise support SLA и единый стек Wi-Fi/switch
- SSL inspection на высоком throughput с hardware offload
- Compliance требует сертифицированного NGFW vendor`,
    },
    {
      title: 'Установка: ISO, VM и первый запуск',
      content: `**Варианты развёртывания:**

| Метод | Сценарий |
|-------|----------|
| **ISO на bare metal** | Физический appliance, whitebox 1U |
| **VMware / Proxmox / Hyper-V** | Центральный firewall в DC |
| **KVM / QEMU** | Lab, cloud edge |
| **AWS/Azure** (community images) | Cloud VPN hub |

**Минимальные ресурсы (lab / малый офис до 30 users):**
- 2 vCPU, 2–4 GB RAM, 20 GB disk
- 2+ network interfaces (WAN + LAN) — критично для routing mode

**Процесс установки с ISO:**
1. Скачай ISO с [opnsense.org/download](https://opnsense.org/download/)
2. Создай VM: UEFI или BIOS, VirtIO NIC (Proxmox) или e1000 (совместимость)
3. Boot ISO → **Install (UFS)** или ZFS для production
4. Assign interfaces: WAN, LAN, OPT (опционально)
5. Задай LAN IP (default часто 192.168.1.1/24)
6. Открой \`https://192.168.1.1\` → login \`root\` / пароль из установки

**Proxmox типовая схема:**
\`\`\`
vmbr0 (WAN) ──► net0 OPNsense
vmbr1 (LAN) ──► net1 OPNsense
\`\`\`

**После установки — чеклист:**
1. Смени пароль root и создай отдельного admin user (не root для UI)
2. **System → Settings → General:** hostname, timezone, language
3. **System → Firmware → Updates:** обнови до stable latest
4. Настрой WAN (DHCP/static/PPPoE)
5. Проверь internet с LAN: Diagnostics → Ping 1.1.1.1
6. Ограничь GUI access: System → Access → Users → disable root login в UI
7. Включи SSH только с Management subnet
8. Сделай первый backup config.xml

**Factory / recovery:** консоль → option 8) Shell → \`opnsense-shell\` для меню. Полный reset: reinstall или restore config.xml.`,
      code: {
        language: 'shell',
        caption: 'Консоль OPNsense: проверка интерфейсов и версии',
        code: `# из SSH или shell
opnsense-version
ifconfig -a
netstat -rn

# ping с указанием source interface (LAN)
ping -S 192.168.1.1 1.1.1.1`,
      },
    },
    {
      title: 'Интерфейсы: WAN, LAN, OPT и VLAN',
      content: `OPNsense работает как **L3 router + firewall**. Каждый logical interface участвует в routing table и firewall rule matching.

**Типы интерфейсов:**

| Тип | Примеры | Назначение |
|-----|---------|------------|
| **Physical** | igb0, vtnet0 | WAN uplink, trunk к switch |
| **LAN** | lan | Внутренняя сеть (assigned) |
| **OPT** | opt1, opt2 | DMZ, Guest, второй WAN |
| **VLAN** | vlan0.10 | Сегментация на trunk |
| **Bridge** | bridge0 | L2 bridge (редко в routing mode) |
| **Tunnel** | wg0, ovpns1 | VPN endpoints |

**WAN configuration:**
- **Interfaces → Assignments:** назначь physical port как WAN
- **Interfaces → [WAN]:** Enable, IPv4 DHCP/Static/PPPoE
- Block private networks на WAN — **включи** (не принимать 10.x с ISP)
- Block bogon networks — **включи**

**Типовая топология SMB (50 users):**
\`\`\`
WAN (igb0)     → ISP DHCP / static
LAN (igb1)     → trunk к core switch
  VLAN10 Servers    192.168.10.1/24
  VLAN20 Users      192.168.20.1/24
  VLAN60 Guest      192.168.60.1/24
  VLAN99 Mgmt       192.168.99.1/24
OPT1 (igb2)    → DMZ (web server)
\`\`\`

**VLAN на OPNsense:**
1. Interfaces → Other Types → VLAN → Parent = LAN physical, tag 10
2. Interfaces → Assignments → Add vlan0.10 → Enable
3. Задай IP, subnet — это gateway для VLAN

**OPT vs LAN:** технически идентичны; различие в default firewall rules (LAN often has «allow all out» на fresh install). Для Guest/DMZ создавай отдельный OPT/VLAN с deny inter-VLAN по умолчанию.

**IPv6:** поддерживается (DHCPv6-PD, static). Для SMB часто IPv4-only; если PD с ISP — настрой отдельные rules для v6.`,
    },
    {
      title: 'Firewall rules: порядок, states и best practices',
      content: `OPNsense использует **pf** — правила обрабатываются **сверху вниз, first match wins**. Implicit deny на всё, что не разрешено (в отличие от legacy «allow all LAN» на некоторых consumer routers).

**Структура rule:**

| Поле | Описание |
|------|----------|
| **Action** | Pass, Block, Reject |
| **Interface** | WAN, LAN, VLAN10 — rule применяется на ingress этого interface |
| **Direction** | in (типично) — трафик входящий на interface |
| **Protocol** | TCP/UDP/ICMP/any |
| **Source/Destination** | IP, subnet, alias |
| **Port** | Service или custom |
| **Log** | Включай для audit и troubleshooting |

**Критично понимать direction:**
- Rule на **LAN** с source LAN net → internet: ловит трафик **от клиентов**, входящий на LAN interface
- Rule на **WAN** для port forward: destination WAN address, port 443

**Quick rules после установки (production):**
1. Удали или ограничь default «LAN → any» если нужна сегментация
2. Guest VLAN: block to RFC1918, allow WAN only
3. Management VLAN: allow HTTPS/SSH только с admin workstations alias
4. WAN: no allow inbound except explicit port forwards / VPN

**Stateful firewall:** Pass создаёт state — return traffic автоматически разрешён. Block/Reject не создают state.

**Floating rules:** применяются на все interfaces или выбранные — используй для global block (bogons уже в system rules) или emergency deny.

**Порядок оптимизации:**
1. Наиболее специфичные rules сверху
2. Alias-based rules для читаемости
3. Log only на deny rules (или временно на debug) — иначе disk fill

**Anti-patterns:**
- Дублирующие rules «на всякий случай»
- Any/any на WAN «для теста» — забыт и открыт
- Rule на wrong interface (частая ошибка port forward troubleshooting)`,
      code: {
        language: 'shell',
        caption: 'pfctl: просмотр активных правил и счётчиков',
        code: `# все правила с номерами и hits
pfctl -vvsr

# правила для конкретного interface
pfctl -a 'lan' -vvsr

# таблица states (активные сессии)
pfctl -s state | head -20

# статистика по правилам
pfctl -s info`,
      },
    },
    {
      title: 'NAT: outbound, port forwarding и reflection',
      content: `**NAT в OPNsense** — раздел **Firewall → NAT**.

**Outbound NAT (SNAT):**
- Default: **Automatic** — LAN/VLAN subnets выходят в internet через WAN IP
- **Hybrid:** manual rules + automatic для остальных
- **Manual:** полный контроль (multi-WAN, policy NAT)

Типовой SMB: Automatic достаточно. Multi-WAN failover: hybrid с rule per WAN.

**Port Forward (DNAT / Inbound):**
1. Firewall → NAT → Port Forward → Add
2. Interface: WAN
3. Destination: WAN address
4. Destination port: 443 (или custom)
5. Redirect target IP: internal server 192.168.10.50
6. Redirect target port: 443
7. **Filter rule association:** Add associated filter rule — автоматически создаёт WAN pass rule

**Без associated rule** пакет приходит на WAN, NAT применяется, но firewall block — типичный «NAT works but connection timeout».

**1:1 NAT:** mapping внешний IP ↔ внутренний (DMZ host).

**NAT reflection (hairpin):** доступ к internal service по public DNS из LAN — включай только если нужно; альтернатива — split DNS на Unbound.

**Multi-WAN NAT:**
- Каждый WAN может иметь свой outbound rule
- Failover: Monitor IPs на WAN gateways (System → Gateways → Status)

**Проверка:**
- Diagnostics → States — видишь NAT translation
- tcpdump на WAN и LAN simultaneously`,
    },
    {
      title: 'Aliases, schedules и организация политик',
      content: `**Aliases** — именованные группы объектов для rules и NAT. Упрощают audit и change management.

**Типы aliases:**

| Тип | Пример |
|-----|--------|
| **Host(s)** | srv-dc01 → 192.168.10.10 |
| **Network(s)** | RFC1918 → 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 |
| **Port(s)** | WEB → 80, 443 |
| **URL** | External feed (обновляется по cron) |
| **GeoIP** | Плагин os-geoip |

**Создание:** Firewall → Aliases → Add. Используй в rules: Source → Single host or alias → выбери alias.

**Schedules (Firewall → Schedules):**
- Временные окна для rules (рабочие часы, maintenance window)
- Rule → Advanced → Schedule → выбери schedule
- Пример: deny social media ports в business hours only

**Паттерн «tiered access»:**
\`\`\`
Alias ADMINS     → 192.168.99.10-20
Alias SERVERS    → 192.168.10.0/24
Alias GUEST_NET  → 192.168.60.0/24

Rule: GUEST_NET → SERVERS : Block (log)
Rule: ADMINS → any : Pass
\`\`\`

**URL alias / external feeds:** для blocklist malware domains — обновление по cron. Проверяй размер — большие lists замедляют rule evaluation.

**Naming convention:** префиксы \`HOST_\`, \`NET_\`, \`PORT_\` — облегчает поиск в 50+ aliases.

**Export/import:** aliases в config.xml — backup критичен перед bulk edit.`,
    },
    {
      title: 'DHCP и DNS (Unbound)',
      content: `**DHCP server:** Services → ISC DHCPv4 → LAN (или per-VLAN interface).

**Типовая настройка VLAN Users:**
- Enable DHCP on \`vlan0.20\`
- Range: 192.168.20.100 – 192.168.20.200
- Gateway: 192.168.20.1 (IP interface)
- DNS servers: 192.168.20.1 (Unbound на OPNsense) или internal DC
- Domain: office.local

**Static mappings:** MAC → fixed IP для printers, AP, servers.

**DHCP relay:** если DHCP на Windows DC — на OPNsense disable local DHCP, настроь helper на switch или relay на DC subnet.

**Unbound DNS (Services → Unbound DNS):**
- Enable на LAN interfaces
- **Register DHCP leases** — local hostname resolution
- **DNS over TLS** upstream (optional privacy): Cloudflare, Quad9
- **Split horizon:** host overrides для internal names

\`\`\`
Host override:
  app.office.local → 192.168.10.50
  vpn.office.local → WAN public IP (для external users)
\`\`\`

**DNS security:**
- Block DNS over HTTPS bypass — firewall rule block known DoH providers (или policy на clients)
- DNS sinkhole через Unbound + blocklist plugin

**Troubleshooting DNS:**
- Diagnostics → DNS Lookup
- \`unbound-control status\` на shell
- tcpdump port 53 на LAN

**Integration с AD:** DC как DNS for domain; OPNsense Unbound forward office.local → DC IP, остальное recursive.`,
    },
    {
      title: 'VPN: WireGuard и OpenVPN',
      content: `**WireGuard** — предпочтительный VPN для remote access и site-to-site в 2024+ (простота, performance, modern crypto).

**Remote access (road warrior) на OPNsense:**

1. **VPN → WireGuard → Local** → Add instance (wg0)
2. Listen port: 51820
3. Tunnel address: 10.255.0.1/24 (VPN subnet)
4. **Peers → Add:** public key клиента, allowed IPs клиента
5. **Endpoints → Add:** peer для каждого user/device
6. Firewall → WireGuard: Pass from WireGuard net → LAN net (или specific)
7. Outbound NAT: automatic usually covers WG subnet

**Site-to-site WireGuard:** peer с remote public IP, allowed IPs = remote LAN subnet. На обоих ends mirror config.

**OpenVPN** (legacy, но нужен для некоторых clients):
- VPN → OpenVPN → Servers — road warrior или site-to-site
- Certificates: System → Trust → CA → Server cert → User certs
- Client: exported .ovpn profile
- Performance ниже WireGuard на same CPU

**Сравнение для SMB:**

| | WireGuard | OpenVPN |
|---|-----------|---------|
| Setup | Минимальный | CA, certs, больше options |
| Mobile | Official apps | OpenVPN Connect |
| Firewall | UDP 51820 | UDP 1194 default |
| Throughput | Высокий | Средний |

**Security:**
- MFA не встроена в WG — combine с RADIUS + 2FA или per-device keys
- Principle least privilege: Allowed IPs только нужные subnets
- Disable full tunnel если не нужен: split tunnel via Allowed IPs`,
      code: {
        language: 'text',
        caption: 'Пример WireGuard peer config (клиент)',
        code: `[Interface]
PrivateKey = <client-private-key>
Address = 10.255.0.2/32
DNS = 192.168.20.1

[Peer]
PublicKey = <opnsense-public-key>
Endpoint = vpn.office.local:51820
AllowedIPs = 192.168.20.0/24, 192.168.10.0/24
PersistentKeepalive = 25`,
      },
    },
    {
      title: 'IDS/IPS: пакет Suricata',
      content: `**Suricata** — IDS/IPS plugin (\`os-suricata\`) для signature-based threat detection на WAN/LAN.

**Установка:**
1. System → Firmware → Plugins → Install **os-suricata**
2. Services → Intrusion Detection → Administration → Enable
3. Выбери interfaces для inspection (WAN для inbound threats, LAN для east-west)
4. Download rulesets: ET Open (free), Snort registered, или commercial

**Modes:**

| Mode | Действие |
|------|----------|
| **IDS** | Detect + alert (не блокирует) |
| **IPS** | Inline block matching signatures |
| **IPS with drop** | Active rejection |

**Production SMB рекомендация:**
- Start with **IDS on WAN** — alerts only, tune 2 weeks
- Whitelist false positives (Services → Suricata → Alerts → toggle)
- Enable IPS on WAN после tuning
- Monitor CPU — Suricata hungry на >500 Mbps

**Rule categories:** disable noisy categories (POLICY, P2P) если не нужны.

**Logs:** Services → Suricata → Alerts; forward to remote syslog/SIEM.

**Limits vs FortiGate IPS:**
- Suricata — excellent open signatures, manual tuning
- FortiGuard IPS — auto-updates, lower admin overhead, hardware accel
- OPNsense не заменяет enterprise SOC workflow без внешнего SIEM

**Alternative:** **Zenarmor** (formerly Sensei) — L7 filtering plugin, другая модель licensing.`,
    },
    {
      title: 'Высокая доступность: CARP overview',
      content: `**CARP (Common Address Redundancy Protocol)** — FreeBSD аналог VRRP для HA pair OPNsense.

**Топология:**
\`\`\`
        ISP
          │
    ┌─────┴─────┐
  FW1 (MASTER) FW2 (BACKUP)
    └─────┬─────┘
       LAN switch
\`\`\`

**Компоненты:**
- **CARP VIP** — shared virtual IP на LAN/WAN (clients use VIP as gateway)
- **pfsync** — синхронизация state table между nodes
- **config sync** — XMLRPC sync конфигурации (master → backup)

**Требования:**
- 3+ interfaces per node (WAN, LAN, sync optional on dedicated link)
- Same hardware/similar performance
- Unique real IPs per node + shared VIPs
- **Advskew** — определяет master (lower = master)

**Настройка (overview):**
1. Interfaces → Virtual IPs → Add CARP VIP на LAN и WAN
2. System → High Availability → Enable pfsync + config sync peer IP
3. Firewall rules allow CARP/pfsync between nodes
4. Test failover: shutdown master → backup takes VIP < 3 sec

**Ограничения:**
- 2 nodes active/passive (не active-active для CARP classic)
- Stateful failover requires pfsync — sessions survive
- **Split-brain** risk if sync link down — document procedure
- Cloud HA сложнее (no CARP on some hypervisors MAC — check virtio)

**Alternatives:** external load balancer, BGP with two public IPs, or cold standby with manual DNS failover — для cloud-only deployments.`,
    },
    {
      title: 'Backup, config.xml и обновления',
      content: `**Конфигурация OPNsense** — единый файл **config.xml** (XML). Все rules, NAT, VPN, users — внутри.

**Backup methods:**

| Метод | Путь |
|-------|------|
| **GUI** | System → Configuration → Backups → Download |
| **Scheduled** | System → Configuration → Backups → Google Drive/SFTP |
| **CLI** | \`cp /conf/config.xml /root/backup-$(date +%F).xml\` |

**Restore:**
1. System → Configuration → Backups → Restore
2. Или boot console → import config
3. **Версия firmware** должна быть compatible — restore на newer usually OK, downgrade risky

**Best practices:**
- Backup before **every** change (automated daily + pre-change manual)
- Store encrypted offsite (S3, git-crypt private repo — без secrets в plain)
- Test restore quarterly на lab VM
- Document «baseline config» version tag

**Обновления:**
- System → Firmware → Status — minor updates in-place
- Major version: read release notes, backup, update, verify
- Plugins update separately after core

**Revision history:** System → Configuration → History — rollback UI changes.

**Disaster recovery RTO:** с чистой VM + config.xml restore — 15–30 min если процедура отработана.`,
      code: {
        language: 'shell',
        caption: 'CLI: backup и diff config.xml',
        code: `# backup
cp /conf/config.xml /root/config-backup-$(date +%Y%m%d).xml

# проверка валидности XML
xmllint --noout /conf/config.xml

# сравнение с предыдущим backup (на admin workstation)
diff -u config-old.xml config-new.xml | less`,
      },
    },
    {
      title: 'Troubleshooting и security hardening',
      content: `**Диагностический workflow:**

1. **Reproduce** — один client, one destination
2. **Check interface** — link up? correct IP?
3. **Routing** — Diagnostics → Routes, traceroute
4. **Firewall** — temporary log on suspected rule
5. **NAT** — states show translation?
6. **Packet capture** — Diagnostics → Packet Capture или tcpdump

**Полезные команды:**

| Команда | Назначение |
|---------|------------|
| \`pfctl -vvsr\` | Rules с counters |
| \`pfctl -s state\` | Active sessions |
| \`tcpdump -ni lan host X and port Y\` | Live capture |
| \`clog -f /var/log/filter\` | Firewall log tail |
| \`arp -a\` | ARP table |

**Packet capture GUI:** Diagnostics → Packet Capture — select interface, filter \`host 192.168.10.50 and port 443\`.

**Типичные проблемы:**

| Симптом | Причина | Fix |
|---------|---------|-----|
| LAN no internet | WAN gateway down, NAT off | Gateways, outbound NAT |
| Port forward timeout | No WAN rule, wrong interface | Associated filter rule |
| VPN connects no LAN | WG firewall, routes, Allowed IPs | Pass WG→LAN, peer Allowed IPs |
| Inter-VLAN blocked | Missing rule on VLAN interface | Rule on source VLAN in |
| DNS fails | Unbound not on interface | Unbound listen interfaces |

**Security hardening checklist:**

- [ ] Disable root GUI login; create admin + operator roles
- [ ] SSH: key-only, no password; restrict source to Mgmt alias
- [ ] GUI: HTTPS only, strong TLS, restrict to Mgmt subnet
- [ ] Default deny inter-VLAN; explicit allow only
- [ ] WAN: block all inbound except VPN + required forwards
- [ ] Enable Unbound DNSSEC validation
- [ ] Suricata IDS/IPS after tuning
- [ ] Auto config backups to offsite
- [ ] NTP sync (System → Settings → General)
- [ ] Disable unused interfaces and services
- [ ] Regular firmware + plugin updates (monthly window)
- [ ] MFA for external access (VPN portal, if used)
- [ ] Syslog forward to central SIEM
- [ ] Review Firewall → Log Files weekly

**Сравнение ops burden с FortiGate:** OPNsense дешевле в license, но требует больше self-managed tuning (Suricata FP, rule hygiene). FortiGate — меньше DIY, выше TCO.`,
      code: {
        language: 'shell',
        caption: 'tcpdump и firewall log на shell',
        code: `# capture 100 packets on LAN, write to file
tcpdump -ni vlan0.20 -c 100 -w /tmp/lan-capture.pcap host 192.168.20.50

# live firewall log
clog -f /var/log/filter | grep 192.168.20.50

# reset rule statistics (осторожно в production)
pfctl -z`,
      },
    },
  ],
  practice: [
    'Разверни OPNsense в Proxmox/VMware: 2 NIC (WAN+LAN), установи с ISO, задай hostname opnsense-lab01',
    'Настрой WAN DHCP и LAN 192.168.1.1/24; проверь ping 1.1.1.1 с Diagnostics и с LAN client',
    'Создай VLAN20 (Users) и VLAN60 (Guest) на trunk; firewall: Guest block RFC1918, allow WAN',
    'Настрой port forward WAN:443 → internal web server; проверь с external и исправь missing rule если нужно',
    'Создай aliases NET_SERVERS, PORT_WEB, ADMINS; перепиши 3 rules с aliases',
    'Подними WireGuard road warrior: peer для laptop, проверь доступ к LAN subnet',
    'Установи os-suricata, включи IDS на WAN, сгенерируй test alert и найди в Suricata logs',
    'Сделай backup config.xml, измени hostname, restore backup и убедись что hostname откатился',
  ],
  resources: [
    { title: 'OPNsense Official Documentation', url: 'https://docs.opnsense.org/' },
    { title: 'OPNsense Download', url: 'https://opnsense.org/download/' },
    { title: 'OPNsense Forum', url: 'https://forum.opnsense.org/' },
    { title: 'WireGuard on OPNsense (docs)', url: 'https://docs.opnsense.org/manual/how-tos/wireguard-client.html' },
    { title: 'Suricata plugin guide', url: 'https://docs.opnsense.org/manual/ips.html' },
    { title: 'Hardening OPNsense', url: 'https://docs.opnsense.org/manual/hardening.html' },
  ],
}
