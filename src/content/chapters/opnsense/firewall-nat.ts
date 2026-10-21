import type { Chapter } from '../../../types'

export const opnsenseFirewallNatChapter: Chapter = {
  id: 'opnsense-firewall-nat',
  slug: 'opnsense-firewall-nat',
  title: 'OPNsense — firewall, NAT и политики',
  moduleId: 'opnsense',
  order: 1,
  duration: '6–8 часов',
  level: 'intermediate',
  description:
    'pf packet filter, interface и floating rules, states, aliases, schedules, NAT (outbound/port forward/1:1/hairpin), VLAN policies Guest/IoT/Corp, limiters, Multi-WAN, logging, GeoIP, diagnostics и production кейсы',
  sections: [
    {
      title: 'Модель pf packet filter в OPNsense',
      content: `**OPNsense** использует **pf** (OpenBSD Packet Filter) — stateful firewall на уровне ядра FreeBSD. В отличие от iptables/nftables в Linux, pf имеет единую конфигурацию с чёткой иерархией: **rules → NAT → routing**. Web UI генерирует \`pf.conf\`, который загружается через \`pfctl\`.

**Ключевые концепции pf:**

| Концепция | Описание |
|-----------|----------|
| **Rule** | Pass, Block, Reject — action на matching packet |
| **State** | Entry в state table для stateful connections |
| **Anchor** | Подмножество rules (per-interface в OPNsense) |
| **Table** | Быстрый lookup IP sets (aliases → pf tables) |
| **NAT** | Separate rule set: rdr (redirect/DNAT), nat (SNAT) |

**Packet path (упрощённо):**

\`\`\`
Ingress interface
    → filter rules (in direction, top-to-bottom)
    → routing decision
    → outbound NAT rules (если egress to WAN)
    → egress interface
Return traffic: matched by existing state (fast path)
\`\`\`

**Stateful inspection:** при **Pass** pf создаёт **state** — пару (src/dst IP, ports, protocol). Return packets **не проходят** полный rule evaluation — они match existing state. Это критично для performance и для понимания troubleshooting: «rule на return path» обычно не нужен.

**Block vs Reject:**
- **Block** — silent drop (клиент видит timeout)
- **Reject** — ICMP unreachable (клиент получает immediate error)

**OPNsense mapping:**
- Firewall → Rules → [Interface] — interface-bound rules
- Firewall → Rules → Floating — global/cross-interface rules
- Firewall → NAT — outbound, port forward, 1:1
- Firewall → Aliases — named objects → pf tables

**Сравнение с FortiGate policy model:**

| Аспект | OPNsense (pf) | FortiGate |
|--------|---------------|-----------|
| Rule scope | Per ingress interface + floating | Incoming + outgoing interface |
| Order | First match within anchor | First match global list |
| NAT | Separate NAT section | Per-policy NAT flag + VIP objects |
| Objects | Aliases | Address/Service objects |
| State sync | pfsync (HA) | FGCP cluster |

**Когда pf «думает» interface-first:** rule на LAN ловит трафик **входящий на LAN** от клиентов. Трафик сервера **к** клиенту на LAN — это **out** с точки зрения сервера, но **in** на LAN interface с точки зрения firewall (клиент получает на свой interface). Stateful return обрабатывается через state table.

**CLI essentials:** любое изменение в UI → \`configd filter reload\`. Для live debug не редактируй \`/tmp/rules.debug\` в production без понимания — UI перезагрузит.`,
      code: {
        language: 'shell',
        caption: 'pfctl: загрузка rules, anchors и статистика',
        code: `# текущие filter rules с номерами и hit counters
pfctl -vvsr

# rules в anchor конкретного interface (имя = lowercase interface)
pfctl -a 'vlan20' -vvsr

# NAT rules
pfctl -vvsn

# общая статистика pf
pfctl -s info

# список tables (aliases)
pfctl -s Tables`,
      },
    },
    {
      title: 'Interface rules vs Floating rules',
      content: `**Interface rules** — основной механизм политик в OPNsense. Rule привязан к **одному logical interface** (WAN, LAN, vlan0.20, wg0). Применяется на **ingress** — пакет, входящий на этот interface.

**Floating rules** — глобальные или multi-interface. Настраиваются в **Firewall → Rules → Floating**.

| Параметр | Interface rule | Floating rule |
|----------|----------------|---------------|
| Scope | Один interface | Выбранные interfaces или all |
| Direction | in (default) | in, out, или any |
| Quick | implicit per anchor | опция Quick — stop evaluation |
| Use case | VLAN policy, WAN inbound | Emergency block, global logging |

**Floating Quick rule:** если Quick enabled и rule match — **дальнейшие rules не проверяются** (включая interface rules? — в pf floating обычно evaluated в определённом порядке; OPNsense помещает floating **перед** interface rules когда configured «first»).

**Типовые floating use cases:**

1. **Global block bogons** — часто system уже делает на WAN
2. **Log all denied** — floating block с log на все interfaces (осторожно: volume)
3. **Emergency IOC block** — alias с malicious IPs, floating block quick
4. **Bypass stateful tracking** — advanced: no state для specific flows (редко)

**Interface rule use cases:**

1. **Guest VLAN → WAN allow** — rule на vlan0.60 in
2. **Guest VLAN → internal deny** — rule на vlan0.60 in, dest RFC1918 alias
3. **WAN port forward associated rule** — на WAN in
4. **Inter-VLAN** — rule на **source** VLAN interface (traffic leaving segment через router)

**Критическая ошибка:** ставить inter-VLAN rule на wrong interface. Трафик Guest→Servers входит на OPNsense через **Guest VLAN interface** — rule должна быть там, не на Servers VLAN.

**Direction «out» на floating:** редкий кейс — policy на egress (например log all outbound from WAN). Большинство SMB политик — **in** на каждом segment interface.

**FortiGate analogy:** interface rules ≈ policy с конкретным incoming interface. Floating ≈ global policy или multiple interfaces selected.

**Best practice:** держи 90% rules на interfaces для читаемости. Floating — для truly global controls и Quick blocks.`,
    },
    {
      title: 'Порядок правил и evaluation logic',
      content: `**Golden rule pf:** **first match wins** внутри anchor. Implicit **deny all** в конце каждого interface ruleset (OPNsense добавляет автоматически).

**Рекомендуемый порядок для SMB (per interface, сверху вниз):**

\`\`\`
 1. Anti-lockout / emergency admin access (если нужно)
 2. Explicit DENY high-risk (Guest→Internal, IoT→Corp)
 3. Explicit ALLOW specific (Users→DC, Mgmt→OPNsense)
 4. ALLOW broader internal flows
 5. ALLOW internet egress (с limiter/tag если нужно)
 6. (implicit deny — не добавляй вручную)
\`\`\`

**Почему deny выше allow:** если Guest имеет rule «allow any» выше «block RFC1918» — internal networks доступны. Это #1 breach vector на guest Wi-Fi.

**Rule number:** в GUI drag-and-drop. В CLI \`pfctl -vvsr\` показывает порядок и **evaluations** / **packets** counters.

**Multiple VLANs — не один ruleset:** каждый interface имеет **свой** независимый список. Порядок на VLAN20 не влияет на VLAN60.

**Floating evaluation order (OPNsense):**
- Floating rules с «match **first**» — перед interface rules
- Floating rules с «match **last**» — после interface rules
- Default: first

**NAT evaluation — отдельно:** filter pass не означает NAT applied. Outbound NAT проверяется на **egress**. Port forward (rdr) — до filter на WAN ingress для inbound connections.

**Policy routing interaction:** если traffic использует alternate gateway (policy route rule), NAT rule must match **correct outbound interface** (WAN2 vs WAN1).

**Optimization tips:**
- Специфичные rules (single host, single port) — **выше**
- Alias с thousands entries — evaluation медленнее; split lists
- «Pass any any» — только на trusted low-risk segments и с awareness

**Change management:** перед reorder — backup config.xml. Document rule ID/description в change ticket.

**Troubleshooting order issues:**
1. \`pfctl -vvsr\` — найди rule с hits
2. Временно **log** на suspected rules
3. Diagnostics → States — flow exists?
4. Packet capture — packet reaches firewall?`,
    },
    {
      title: 'States: state table и pfctl -s state',
      content: `**State table** — сердце stateful firewall. Каждая разрешённая connection (и некоторые «stateless» allowances) создаёт entry.

**State содержит:**
- Original source/dest IP и ports
- NAT translation (если applied)
- TCP flags / sequence (для TCP)
- Timeout timers
- Interface association
- Creator rule number

**Просмотр states:**

| Команда | Назначение |
|---------|------------|
| \`pfctl -s state\` | Все states (может быть huge) |
| \`pfctl -s state | wc -l\` | Count |
| \`pfctl -ss\` | Summary по protocol |
| \`pfctl -s states | grep 192.168.20.50\` | Filter by IP |

**GUI:** Firewall → Diagnostics → **States** — search, kill state.

**Kill state:** после rule change, existing sessions могут **продолжать работать** (old state). Для enforcement: kill relevant states или disconnect client.

\`\`\`shell
# kill all states involving host
pfctl -k 192.168.20.50

# kill state for specific src→dst
pfctl -k 192.168.20.50 -k 192.168.10.10
\`\`\`

**State limits:** System → Settings → Firewall → **Maximum states** (default зависит от RAM). При exhaustion — new connections fail. Monitor в Dashboard.

**State timeouts (advanced):**
- TCP established: long (hours)
- UDP: shorter
- ICMP: short

**pfsync (HA):** states replicated между CARP nodes — failover сохраняет active sessions.

**NAT в states:** \`pfctl -s state\` показывает translated addresses — ключ для «вижу internal IP с WAN side» debugging.

**Common state issues:**

| Симптом | Причина |
|---------|---------|
| Rule changed but old traffic works | Existing state |
| Intermittent new connections fail | State table full |
| asymmetric routing | States not created / invalid |
| Long-lived broken TCP | Stale state — kill |

**FortiGate analogy:** \`diagnose sys session list\` — same concept. OPNsense pfctl lighter but less filtered output.`,
      code: {
        language: 'shell',
        caption: 'pfctl -s state: анализ активных сессий',
        code: `# первые 30 states
pfctl -s state | head -30

# states с NAT (grep translated)
pfctl -s state | grep 192.168.10.50

# summary: count per source IP
pfctl -s state | awk '{print $1}' | sort | uniq -c | sort -rn | head

# убить все states (ОСТОРОЖНО — разрыв всех соединений)
pfctl -F states

# убить states одного клиента
pfctl -k 192.168.60.105`,
      },
    },
    {
      title: 'Aliases: hosts, networks, ports',
      content: `**Aliases** — именованные объекты для rules, NAT, limiters. OPNsense компилирует их в **pf tables** для O(1) lookup.

**Типы aliases (Firewall → Aliases):**

| Тип | Пример | Использование |
|-----|--------|---------------|
| **Host(s)** | HOST_DC01 = 192.168.10.10 | Single server |
| **Network(s)** | NET_SERVERS = 192.168.10.0/24 | Subnet |
| **Port(s)** | PORT_WEB = 80, 443 | Service bundle |
| **URL (IP)** | Feed URL → table entries | Blocklists |
| **GeoIP** | Плагин os-geoip | Country block |

**Naming convention (production):**

\`\`\`
HOST_DC01, HOST_FILE01
NET_USERS, NET_GUEST, NET_IOT, NET_MGMT
NET_RFC1918          → 10/8, 172.16/12, 192.168/16
PORT_AD, PORT_WEB, PORT_MGMT
GRP_INTERNAL_ALL     → nested aliases (network type)
\`\`\`

**Nested aliases:** Network alias может включать другие network aliases — \`GRP_INTERNAL\` = NET_SERVERS + NET_USERS + NET_VOIP.

**Ports alias:** PORT_AD = 53, 88, 135, 389, 445, 3268 — для правил Users→DC.

**Best practices:**
- Никаких raw IP в production rules — только aliases
- Один alias = одна роль (не «ALL_INTERNAL_AND_SOME_HOSTS»)
- Revision: aliases в config.xml — diff при change review
- Size warning: alias >10K entries — test rule eval performance

**Host alias для dynamic?** DHCP static mapping + DNS; для true dynamic — RADIUS или external auth (не alias). URL tables для dynamic **IP** lists.

**Export:** aliases не отдельный export — part of config.xml backup.

**FortiGate analogy:** Address + Service objects. OPNsense nested aliases simpler than FortiGate groups but less metadata.`,
      code: {
        language: 'text',
        caption: 'Типовой набор aliases для офиса 50 users',
        code: `# Hosts
HOST_DC01      = 192.168.10.10
HOST_DC02      = 192.168.10.11
HOST_OPNSENSE  = 192.168.99.1

# Networks
NET_SERVERS    = 192.168.10.0/24
NET_USERS      = 192.168.20.0/24
NET_VOIP       = 192.168.30.0/24
NET_IOT        = 192.168.40.0/24
NET_GUEST      = 192.168.60.0/24
NET_MGMT       = 192.168.99.0/24
NET_RFC1918    = 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16

# Ports
PORT_WEB       = 80, 443
PORT_AD        = 53, 88, 135, 389, 445, 3268
PORT_MGMT      = 22, 443

# Groups
GRP_INTERNAL   = NET_SERVERS, NET_USERS, NET_VOIP, NET_MGMT`,
      },
    },
    {
      title: 'URL tables и external feeds',
      content: `**URL Table aliases** загружают IP addresses с HTTP(S) URL — popular для **blocklists** (spamhaus DROP, emerging threats).

**Настройка:**
1. Firewall → Aliases → Add → Type **URL Table (IPs)**
2. URL: \`https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt\`
3. Update frequency: Daily
4. Use в floating block rule: Source → alias → blocklist

**URL Table (Ports)** — редко; для dynamic port lists.

**Cron update:** OPNsense fetcher обновляет tables; failed fetch — last good table остаёт (check logs).

**Размер и performance:**
- 50K IPs — acceptable на modern CPU
- 500K+ — может замедлить reload и matching; consider smaller lists или hardware upgrade

**Private feeds:** internal CSV on web server — \`http://192.168.99.50/blocklist.txt\` (one IP per line).

**pf table stats:**

\`\`\`shell
pfctl -t BLOCKLIST -T show | wc -l
pfctl -t BLOCKLIST -T replace -f /path/to/file
\`\`\`

**Alternatives to URL tables:**
- **Unbound** blocklists — DNS sinkhole (domain level)
- **Suricata** — signature IPS
- **Zenarmor** — L7 policy

**FortiGate analogy:** External Threat Feed connectors. OPNsense URL alias — simpler, manual.

**Compliance note:** document blocklist sources — некоторые feeds запрещены для commercial use (read license).

**Troubleshooting stale feed:** System → Log Files → General или Firewall — alias update errors. Test URL fetch from shell: \`fetch -o /tmp/t.txt <url>\`.`,
    },
    {
      title: 'Schedules: временные окна для rules',
      content: `**Schedules** (Firewall → Schedules) ограничивают **когда** rule active.

**Компоненты schedule:**
- Weekdays + time ranges
- Multiple ranges per schedule
- Month/day exceptions (maintenance windows)

**Примеры:**

| Schedule | Определение | Use case |
|----------|-------------|----------|
| \`BUSINESS_HOURS\` | Mon–Fri 08:00–19:00 | Strict policy daytime |
| \`NIGHT_MAINT\` | Sun 02:00–06:00 | Server patch window |
| \`WEEKEND_OPEN\` | Sat–Sun all day | Relaxed guest access |

**Применение:** Rule → Advanced → Schedule → select.

**Inactive schedule = rule skipped** (не deny — просто не evaluated как pass/block?). В OPNsense rule с schedule **не matches** outside window — traffic falls through to next rule. Plan explicit deny below если нужно «deny outside hours» vs «allow only during hours».

**Pattern «allow only business hours»:**

\`\`\`
Rule 1: Users → Social ports : BLOCK, schedule BUSINESS_HOURS
Rule 2: Users → any : PASS (always)
\`\`\`

Social blocked only during business hours; evenings allowed.

**Pattern «servers patch window only»:**

\`\`\`
Rule 1: Servers → Internet : PASS, schedule NIGHT_MAINT, ports 80,443
Rule 2: Servers → Internet : BLOCK (default)
\`\`\`

**Timezone:** System → Settings → General → Timezone must be correct (Europe/Moscow etc.). NTP enabled.

**HA:** schedules local time on each node — sync NTP.

**FortiGate analogy:** Identical schedule objects on policies.

**Pitfall:** forgetting schedule ended → «suddenly» traffic blocked when maintenance rule expires and lower deny matches.`,
    },
    {
      title: 'Outbound NAT: Automatic, Hybrid, Manual',
      content: `**Outbound NAT (SNAT)** — внутренние IP транслируются в public WAN IP при выходе в internet.

**Три режима (Firewall → NAT → Outbound):**

| Mode | Поведение |
|------|-----------|
| **Automatic** | Auto rules для all internal subnets → WAN IP |
| **Hybrid** | Manual rules + automatic для unmatched |
| **Manual** | Только explicit rules — unmatched **не** NAT |

**Automatic (default lab):** LAN 192.168.1.0/24 → WAN address. Достаточно для single WAN SMB.

**Hybrid (production multi-WAN):** manual rule per WAN:

\`\`\`
Rule 1: Source NET_USERS, Destination any, Interface WAN1 → NAT WAN1 address
Rule 2: Source NET_GUEST, Destination any, Interface WAN2 → NAT WAN2 address
(automatic covers remaining subnets)
\`\`\`

**Manual (strict DMZ):** only explicit SNAT; DMZ without NAT rule = no internet (by design).

**NAT rule fields:**
- **Interface:** outbound interface (WAN)
- **Source / Destination**
- **Translation:** Interface address или static IP (если multiple public IPs)
- **Static-port:** preserve source port (needed for some VoIP/SIP — rare)
- **Non-static port:** NAPT typical

**Policy NAT vs route:** traffic must **exit correct WAN interface** (policy routing) for matching NAT rule.

**No NAT between internal subnets:** outbound NAT applies to traffic leaving to WAN. Inter-VLAN **не** SNAT (остаются original IPs).

**IPv6:** separate NAT rules if NPT or v6 — SMB often v4-only.

**Diagnostics:** States show NAT translation. \`pfctl -vvsn\` — NAT rules with hits.

**FortiGate:** IP Pools + policy NAT. OPNsense separates routing/policy from NAT section — more steps but clearer separation.`,
      code: {
        language: 'text',
        caption: 'Hybrid outbound NAT — dual WAN (концепт)',
        code: `# Mode: Hybrid

Rule 10  | IF WAN_ISP1 | SRC NET_CORP     | DST * | Translation: WAN_ISP1 address
Rule 20  | IF WAN_ISP2 | SRC NET_GUEST    | DST * | Translation: WAN_ISP2 address
Rule 30  | IF WAN_ISP1 | SRC NET_VOIP     | DST * | Translation: WAN_ISP1 address | Static-port: yes
# Automatic: all other internal → default WAN (ISP1)

# Policy routing (Firewall → Rules → LAN):
# NET_GUEST → any | Gateway: WAN_ISP2_GW
# NET_CORP  → any | Gateway: WAN_ISP1_GW`,
      },
    },
    {
      title: 'Port Forward и associated filter rules',
      content: `**Port Forward (DNAT / rdr)** — inbound WAN traffic → internal server.

**Шаги (Firewall → NAT → Port Forward):**

| Поле | Пример |
|------|--------|
| Interface | WAN |
| Protocol | TCP |
| Destination | WAN address |
| Destination port | 443 |
| Redirect target IP | 192.168.10.50 |
| Redirect target port | 443 |
| Filter rule association | **Add associated filter rule** ✓ |
| Filter rule source | any (или restrict) |

**Associated filter rule** автоматически создаёт **Pass** rule на WAN:
- Destination WAN IP, port 443
- Redirects to internal — pf handles after NAT

**Без associated rule:** classic «NAT works, connection timeout» — packet DNAT'd, filter default deny на WAN.

**Security hardening inbound:**
- Source: не «any» — restrict to Cloudflare IPs alias если behind CDN
- GeoIP block на WAN floating **выше** allow
- Log all inbound allows

**Multiple ports:** separate forwards или custom port range.

**Hairpin / reflection:** separate section — не путать с port forward.

**Loopback testing:** external client test mandatory — LAN client to WAN IP behaves differently.

**HA CARP:** port forward to **CARP VIP** WAN address — survives failover.

**Troubleshooting checklist:**
1. WAN rule exists with hits?
2. Internal server firewall listens?
3. Return path: server default gateway = OPNsense?
4. State: WAN→internal created?
5. tcpdump WAN: SYN arrives? LAN: forwarded?

**FortiGate VIP:** same function; VIP + policy required on FG; OPNsense bundles via association.`,
      code: {
        language: 'text',
        caption: 'Port forward HTTPS + implied WAN rule',
        code: `# NAT Port Forward
Interface: WAN
Proto: TCP
Dst: WAN address
Dst port: 443
Redirect: HOST_WEB01 (192.168.10.50)
Redirect port: 443
Association: Add associated filter rule
Filter rule source: any   # production: alias CLOUDFLARE_IPS

# Автосозданная WAN rule (concept):
# Pass | WAN | in | TCP | any → WAN address:443 | NAT → 192.168.10.50:443`,
      },
    },
    {
      title: '1:1 NAT (binat)',
      content: `**1:1 NAT** — bidirectional mapping одного public IP ↔ одного internal host. Используется для:
- DMZ server с dedicated public IP
- Mail server (legacy)
- Compliance «this internal = this external»

**Настройка (Firewall → NAT → One-to-One):**

| Поле | Пример |
|------|--------|
| Interface | WAN |
| External subnet | 203.0.113.5/32 |
| Internal subnet | 192.168.10.50/32 |
| Destination | (any) |

**Отличие от port forward:** **все** ports mapped — full exposure. Firewall rules **still required** — 1:1 не bypass filter.

**Typical DMZ pattern:**

\`\`\`
1:1 NAT: 203.0.113.5 ↔ 192.168.50.10
WAN rule: Pass TCP 80,443 from any to 203.0.113.5
WAN rule: Block all other to 203.0.113.5
\`\`\`

**Outbound from 1:1 host:** appears as 203.0.113.5 to internet ( symmetric mapping).

**Multiple public IPs:** ISP provides block — each 1:1 or combine with port forwards on shared IP.

**vs Virtual IPs:** OPNsense Virtual IP (CARP, other) — holding extra IPs on interface; NAT references them.

**Security warning:** 1:1 без strict WAN rules = full port scan surface.

**Decommission:** remove 1:1 + WAN rules + DNS records together.

**FortiGate:** Static NAT / dedicated policy per IP. Same caution.`,
    },
    {
      title: 'NAT reflection и hairpin',
      content: `**NAT reflection (hairpin)** — LAN client обращается к **public DNS name** (указывает на WAN IP), traffic должен loop internal без выхода в ISP.

**Проблема без hairpin:**
\`\`\`
LAN PC → WAN public IP:443
  → OPNsense NAT tries WAN path
  → ISP may reject or asymmetric routing fails
\`\`\`

**Решения:**

| Метод | Плюсы | Минусы |
|-------|-------|--------|
| **Split DNS (Unbound)** | Clean, no NAT hack | Separate int/ext DNS |
| **NAT reflection** | Works with same public DNS | Extra NAT complexity |
| **Internal DNS override** | Best practice | Requires DNS admin |

**Enable reflection (NAT → Port Forward):**
- **NAT reflection (Pure NAT)** или **NAT+Proxy** mode per forward
- Firewall → Settings → **Reflection** — enable for internal networks

**Pure NAT reflection:** pf rdr rules for LAN interfaces.

**NAT+Proxy:** local proxy process — legacy, rare today.

**Recommended SMB:** **Split DNS** on Unbound:

\`\`\`
Host override: portal.office.local → 192.168.10.50 (internal)
Public DNS: portal.office.com → 203.0.113.1 (WAN)
\`\`\`

**Test hairpin:** from LAN \`curl -k https://public-ip\` — should hit internal server.

**Guest isolation:** hairpin может accidentally allow guest to reach internal via public IP — **block Guest → WAN IP** alias of own organization.

**Performance:** hairpin adds firewall load — prefer split DNS for high volume internal access.`,
    },
    {
      title: 'Anti-lockout rule',
      content: `**Anti-lockout** — механизм предотвращения self-lockout из GUI при aggressive firewall changes.

**Default behavior:** OPNsense often keeps **anti-lockout rule** on LAN — temporary Pass from LAN net to OPNsense management ports (443, 80) that **не удаляется** случайно или highlighted special.

**Location:** Firewall → Rules → LAN — rule с description «Anti-Lockout Rule» или icon.

**Production hardening tension:**
- Anti-lockout спасает при mistake
- Но LAN any→OPNsense too broad если LAN = huge flat network

**Best practice:**
1. Replace broad anti-lockout with **explicit Mgmt rule**: NET_MGMT → OPNsense PORT_MGMT
2. Restrict GUI: System → Settings → Administration → **Listen interfaces** = Mgmt VLAN only
3. SSH key-only from NET_MGMT
4. Keep break-glass: serial/console access documented

**Disable anti-lockout (advanced):** только когда confident в Mgmt access path. Document rollback config backup.

**Scenario:** admin blocks all LAN→OPNsense, no console — **physical access** or IPMI to fix.

**Change window:** always backup before rule changes; use **Scheduled rollback** (manual: restore config at night if ticket open).

**MSP note:** anti-lockout on customer LAN may violate policy — use jump host VPN only.`,
    },
    {
      title: 'Block bogon и private networks на WAN',
      content: `**Bogon networks** — IP ranges не allocated (should not appear on internet). **Private networks** — RFC1918 should not be source on WAN from ISP.

**WAN interface settings (Interfaces → WAN):**
- ☑ **Block private networks** — reject 10/8, 172.16/12, 192.168/16 inbound on WAN
- ☑ **Block bogon networks** — reject bogons inbound

**System updates bogon list** periodically (pf tables).

**Why matter:** spoofed scans, misconfigured ISP, routing leaks — blocking reduces attack surface.

**Outbound private to WAN?** Normal from LAN — rule on LAN, not WAN block.

**Additional floating block (optional):**
- Source: bogon alias (outbound) — block LAN clients sending to bogons (malware C2 noise reduction)

**IPv6:** separate bogon tables for v6 if enabled.

**Verify:**

\`\`\`shell
pfctl -t bogons -T show | head
\`\`\`

**Don't duplicate:** WAN checkbox + manual same rule — redundant but harmless.

**FortiGate:** analogous implicit filters; explicit policies for outbound bogon less common.`,
    },
    {
      title: 'Guest VLAN: политика изоляции',
      content: `**Guest Wi-Fi** — highest risk untrusted segment. Goal: **internet only**, zero internal access.

**Topology:**
\`\`\`
SSID Guest → VLAN60 192.168.60.0/24
Gateway: 192.168.60.1 (OPNsense vlan0.60)
\`\`\`

**Mandatory rules (vlan0.60 interface, order matters):**

| # | Action | Source | Dest | Ports | Log |
|---|--------|--------|------|-------|-----|
| 1 | Block | NET_GUEST | NET_RFC1918 | * | Yes |
| 2 | Block | NET_GUEST | NET_OPNSENSE | * (except DNS) | Yes |
| 3 | Pass | NET_GUEST | !NET_RFC1918 | * | Optional |
| 4 | (deny implicit) | | | | |

**DNS:** allow UDP/TCP 53 to OPNsense or public DNS — **block DNS to internal** prevents zone transfer recon.

**Client isolation on AP:** Wi-Fi layer isolation + VLAN firewall (defense in depth).

**Captive portal (optional):** Services → Captive Portal — terms acceptance, bandwidth limit.

**Limiter:** apply Guest_Limiter 20Mbit on pass rule — fair use.

**No inter-guest?** Block NET_GUEST → NET_GUEST if AP isolation uncertain.

**Monitor:** Firewall → Log Files — guest deny hits weekly review.

**Pentest validation:** nmap from guest to 192.168.10.0/24 — all filtered/timeout.

**Common failure:** rule order — internet pass **above** internal block.`,
    },
    {
      title: 'IoT VLAN: constrained device policy',
      content: `**IoT segment** — cameras, printers, smart TVs, sensors. Limited internet, no corp access except specific.

**Principles:**
- IoT cannot initiate to Corp/Users
- Corp/Users may initiate to IoT **specific ports** (printer 9100, camera 554)
- IoT internet: allow vendor cloud only (hard) or restricted egress

**Rules vlan0.40 (IoT):**

| # | Action | Source | Dest | Service |
|---|--------|--------|------|---------|
| 1 | Block | NET_IOT | GRP_INTERNAL | * |
| 2 | Pass | NET_IOT | any | HTTPS (443) — cloud APIs |
| 3 | Pass | NET_IOT | any | DNS |
| 4 | Block | NET_IOT | any | * (default deny explicit) |

**Rules vlan0.20 (Users) — IoT access:**

| # | Action | Source | Dest | Service |
|---|--------|--------|------|---------|
| 1 | Pass | NET_USERS | NET_IOT | PORT_PRINT (9100, 631) |
| 2 | Pass | NET_USERS | NET_IOT | RTSP (554) — cameras |

**NTP:** allow IoT → OPNsense or public NTP.

**Multicast:** mDNS across VLANs — usually **block**; use proper discovery proxy if needed.

**Firmware updates:** vendor cloud HTTPS — if blocked, devices fail silently.

**Suricata on IoT:** optional IDS inbound from internet to IoT if exposed (avoid expose).

**Segmentation win:** Mirai-style lateral scan from compromised camera blocked at rule 1.`,
    },
    {
      title: 'Corp/Users VLAN: типовые политики',
      content: `**Corp/Users (VLAN20)** — trusted workstations, AD joined.

**Outbound internet:**
- Pass NET_USERS → !NET_RFC1918, ports PORT_WEB + DNS + NTP
- Optional: limit streaming via limiter peak hours

**Internal access:**

| Flow | Rule |
|------|------|
| Users → DC | Pass PORT_AD to HOST_DC01, HOST_DC02 |
| Users → Servers | Pass SMB, RDP (if policy), app ports |
| Users → VoIP | Pass SIP/RTP to NET_VOIP if softphones |
| Block Users → IoT initiate | Except allowed ports on IoT rules |

**Servers VLAN (VLAN10):**
- Servers → Internet: restricted 80/443 patch only (schedule optional)
- Servers → Users: generally block (except WSUS, SCCM)
- Mgmt → Servers: SSH/RDP from NET_MGMT only

**Mgmt VLAN (VLAN99):**
- Pass NET_MGMT → OPNsense PORT_MGMT
- Pass NET_MGMT → GRP_INTERNAL on admin ports
- Block all other from Mgmt outward minimal

**Principle of least privilege:** replace «Pass any» with service aliases.

**Logging:** log denies on Corp; selective log allow for internet (volume).

**App dependencies:** document SaaS IPs — may need FQDN aliases (Unbound) not IP.

**Change control:** matrix Excel mapping VLAN×Dest×Port×Action.`,
    },
    {
      title: 'Traffic Shaper и Limiters',
      content: `**Traffic shaping** в OPNsense — два основных инструмента:

| Tool | Location | Use case |
|------|----------|----------|
| **Limiters** | Firewall → Shaper → Limiters | Per-rule bandwidth cap |
| **Pipes/Queues** | Firewall → Shaper → Shaper | Legacy hierarchical QoS |

**Limiters (modern default):**
1. Shaper → Limiters → Add \`LIMIT_GUEST_DL\` 20 Mbit/s, mask **source**
2. Rule → Advanced → In / Out pipe → select limiter

**Mask source:** each Guest IP gets own 20Mbit bucket — fair.

**Mask destination:** per-server cap.

**Bidirectional shaping:** separate In and Out limiters on rule.

**VoIP priority:** higher pipe priority or dedicated limiter with min bandwidth (advanced shaper).

**Multi-WAN:** limiter applies post-routing — independent per WAN rule.

**Diagnostics:**

\`\`\`shell
dnctl pipe show
dnctl queue show
\`\`\`

**GUI:** Firewall → Diagnostics → **Limiter info** (if available in version).

**Don't confuse with:** QoS on switch (802.1p) — complementary.

**Guest + IoT:** always apply limiters — prevents one guest torrenting entire WAN.

**Production values (50 user SMB):**
- Guest: 20–50 Mbps down, 10 up
- IoT: 5 Mbps aggregate
- Corp: no limit or 200+ Mbps

**FortiGate:** Traffic Shaping profiles on policies — similar concept.`,
      code: {
        language: 'shell',
        caption: 'dnctl: проверка limiters',
        code: `# список pipes/limiters
dnctl pipe show
dnctl sched show

# live statistics
dnctl pipe show | grep -A2 LIMIT_GUEST

# reset statistics (если поддерживается версией)
# dnctl pipe flush`,
      },
    },
    {
      title: 'Multi-WAN, policy routing и gateway groups',
      content: `**Multi-WAN** — два+ ISP для failover или load balance.

**Components:**
1. **Gateways** (System → Routing → Gateways) — WAN1_GW, WAN2_GW, monitor IP
2. **Gateway groups** — failover или loadbalance pool
3. **Policy routing** — rules with **Gateway** field
4. **Outbound NAT** — hybrid per WAN
5. **Default route** — via failover group

**Gateway group types:**

| Type | Behavior |
|------|----------|
| **Failover** | Primary if up, else secondary |
| **Load balance** | Round-robin / weighted |
| **Exclude** | Remove dead gateway from pool |

**Monitor IP:** 1.1.1.1, 8.8.8.8 — detect ISP down vs global.

**Policy routing example:**

\`\`\`
Rule on vlan0.60: NET_GUEST → any | Gateway WAN2_FAILOVER_GROUP
Rule on vlan0.20: NET_USERS → any | Gateway WAN1_FAILOVER_GROUP
Default: WAN1 only
\`\`\`

**Sticky connections:** states tie to gateway — existing flows stay; new flows use policy.

**Asymmetric routing failure:** Guest on WAN2 must SNAT WAN2 IP — NAT rule match.

**DNS failover:** Unbound outgoing — multi-WAN may need source routing care.

**Test failover:** unplug WAN1 — verify Guest still online via WAN2 < 30 sec.

**Load balance caveat:** banking sites may break on IP change mid-session — use failover not LB for corp.

**HA CARP:** each node own WAN IPs or shared — design carefully.`,
      code: {
        language: 'text',
        caption: 'Gateway group и policy routing (концепт)',
        code: `# Gateways
WAN_ISP1_GW  → interface WAN_ISP1, monitor 1.1.1.1
WAN_ISP2_GW  → interface WAN_ISP2, monitor 9.9.9.9

# Group GUEST_WAN (Failover)
Members: WAN_ISP2_GW (prio 1), WAN_ISP1_GW (prio 2)

# Group CORP_WAN (Failover)
Members: WAN_ISP1_GW (prio 1), WAN_ISP2_GW (prio 2)

# Firewall rule vlan0.60 Pass
Source: NET_GUEST | Gateway: GUEST_WAN | NAT: WAN_ISP2 address

# Firewall rule vlan0.20 Pass
Source: NET_USERS | Gateway: CORP_WAN | NAT: WAN_ISP1 address`,
      },
    },
    {
      title: 'Categories, tags и организация rules',
      content: `**Rule categories (Firewall → Categories)** — цветовая и logical группировка в GUI. Не влияет на evaluation — только UX и audit.

**Примеры categories:**
- \`DENY\` (red) — all block rules
- \`INTERNET\` (blue) — egress
- \`GUEST\` (orange)
- \`MGMT\` (purple)
- \`NAT-ASSOC\` (gray) — auto-generated port forward rules

**Description field:** mandatory in production — \`RU-GUEST-001 Block RFC1918\`.

**Tracker ID:** internal number in config — stable reference in docs.

**Naming in docs:** reference tracker + description, not only position (position changes on reorder).

**Filter GUI:** by category, interface, quick search.

**Automation:** config.xml edit scripts — categories preserved.

**vs FortiGate policy labels:** same purpose.

**Audit quarterly:**
- Orphan rules (no hits 90 days) — \`pfctl -vvsr\` counters
- Duplicate rules — same match, different action
- Shadowed rules — upper rule prevents lower from ever matching

**Documentation:** export rules PDF + policy matrix spreadsheet.

**Change ticket template:** Rule ID, interface, action, justification, rollback backup name.`,
    },
    {
      title: 'Logging и Live View',
      content: `**Firewall logging** — критичен для security и troubleshooting.

**Per-rule log:** Rule → Advanced → Log ✓. Logs **matches** of that rule.

**Log files (Firewall → Log Files → Live View / Plain):**
- **Filter** — firewall pass/block
- **System** — general
- **Resolver** — DNS

**Live View:** real-time tail with filter — source IP, dest, rule number.

**Remote syslog:** System → Settings → Logging → remote server (SIEM, Graylog, Wazuh).

**Log format:** включает rule **anchor**, **rule number**, action, src/dst, proto.

**Volume management:**

| Strategy | When |
|----------|------|
| Log only denies | High-traffic corp |
| Log guest all | Audit untrusted |
| Log new rules 24h then disable | Tuning |
| Remote only | Disk constrained appliance |

**Rotate:** local logs limited — forward to central.

**CLI live tail:**

\`\`\`shell
clog -f /var/log/filter
\`\`\`

**Block log vs pass log:** block logs show \`(filter log)\` marker.

**Correlate with states:** timestamp match flow in States tab.

**FortiAnalyzer equivalent:** external syslog + Grafana Loki stack for OPNsense.`,
      code: {
        language: 'shell',
        caption: 'Live firewall log и фильтрация',
        code: `# live filter log
clog -f /var/log/filter

# только блокировки guest subnet
clog -f /var/log/filter | grep 192.168.60

# последние 200 строк
tail -200 /var/log/filter

# поиск по rule label в логе
grep 'RU-GUEST-001' /var/log/filter`,
      },
    },
    {
      title: 'GeoIP и blocklists',
      content: `**GeoIP blocking** — filter by country IP ranges.

**Plugin:** System → Firmware → Plugins → **os-geoip** (or os-geoip-devel).

**Setup:**
1. Install plugin
2. Firewall → Aliases → GeoIP settings → download DB
3. Create alias \`GEO_BLOCK\` countries: CN, RU, etc. (policy-dependent)
4. Floating or WAN rule: Block source GEO_BLOCK inbound

**Inbound vs outbound:**
- **Inbound WAN block** — reduce scan noise (common)
- **Outbound block** — compliance geo restrictions (rare SMB)

**CDN caveat:** blocking country X may block CDN nodes serving content — test SaaS apps.

**Combine with allow list:** block all except GEO_ALLOW for specific service.

**URL blocklists (aliases):** Spamhaus DROP, abuse.ch — auto-updated IP tables.

**Unbound blocklist:** domain level — complements IP block.

**Suricata ET rules:** yet another layer.

**Defense in depth:** GeoIP not precision — VPN bypass. Don't rely solely for compliance.

**Update schedule:** GeoIP DB monthly; URL tables daily.

**Performance:** large Geo tables — same as large aliases.

**Legal:** geo blocking for discrimination — consult legal; technical tool only.`,
    },
    {
      title: 'Diagnostics: packet capture и flow debug',
      content: `**Packet capture workflow** — definitive «packet arrived / left / dropped».

**GUI:** Interfaces → Diagnostics → **Packet Capture**
- Interface: vlan0.20 or WAN
- Filter: \`host 192.168.20.50 and port 443\`
- Max packets, download pcap

**CLI tcpdump:**

\`\`\`shell
tcpdump -ni vlan0.20 host 192.168.20.50 and port 443 -c 50
tcpdump -ni WAN host 203.0.113.1 and port 443 -w /tmp/wan.pcap
\`\`\`

**Simultaneous captures:** WAN + LAN — verify NAT translation timing.

**Filter expressions:** host, net, port, and, or, vlan (careful on physical).

**Read pcap:** Wireshark on workstation — SYN, SYN-ACK, RST patterns.

**No packets on interface:** cabling, wrong VLAN tag, client not sending.

**Packets on WAN but not LAN:** NAT/rdr issue.

**Packets on LAN, no reply:** server or return rule/state.

**Firewall rule debug without capture:** temporary pass log any any on interface — **dangerous** — short window only.

**pfctl -vv sr** — which rule matched (counter increment).

**Traceroute:** Diagnostics → Traceroute from OPNsense with source interface.

**ARP:** Diagnostics → ARP table — wrong MAC?

**Ifconfig:** interface up? correct IP?

**Document capture** in ticket — attach pcap encrypted.`,
      code: {
        language: 'shell',
        caption: 'tcpdump: типовые captures',
        code: `# capture guest client traffic
tcpdump -ni vlan0.60 -c 100 host 192.168.60.105

# WAN inbound to public IP
tcpdump -ni WAN 'dst host 203.0.113.1 and tcp port 443'

# write rotating capture (disk watch)
tcpdump -ni WAN -w /tmp/wan-%Y%m%d.pcap -G 3600 -C 100

# read without wireshark on box
tcpdump -nr /tmp/wan.pcap | head -50`,
      },
    },
    {
      title: 'Типичные ошибки и anti-patterns',
      content: `**Top 15 mistakes (OPNsense firewall/NAT):**

1. **Port forward without associated WAN rule** — timeout symptom
2. **Wrong interface for inter-VLAN rule** — rule on dest VLAN instead of source
3. **Guest allow above guest deny** — order bug
4. **ANY/ANY on WAN** «temporary» — forgotten open door
5. **Hybrid NAT without rule for secondary WAN** — asymmetric SNAT
6. **Policy route wrong gateway** — traffic exits wrong WAN, NAT mismatch
7. **Hairpin without reflection or split DNS** — internal public URL fails
8. **Kill states not done after deny rule** — old sessions continue
9. **Logging everything on corp** — disk full, firewall stress
10. **Huge alias reload** — minutes of rule reload during business hours
11. **1:1 NAT without WAN firewall** — full exposure
12. **Disable anti-lockout without Mgmt path** — brick risk
13. **Duplicate overlapping pass rules** — shadowed auditing confusion
14. **IoT full internet** — compromised device exfiltration
15. **Geo block on outbound breaking CDN** — SaaS outage

**Anti-patterns:**
- «Copy LAN rules to all VLANs» — each segment unique
- «Floating deny all» without logging differentiation
- «One limiter for entire LAN» — unfair bandwidth hog

**Recovery:** config.xml backup restore < 5 min if tested.

**Peer review:** second admin validates rule order before apply.`,
    },
    {
      title: 'Lab scenarios: пошаговые упражнения',
      content: `**Lab topology (минимум):**
\`\`\`
WAN (NAT to internet or simulated)
LAN trunk: VLAN10 Servers, VLAN20 Users, VLAN60 Guest
\`\`\`

**Scenario 1 — Guest isolation proof:**
1. Create NET_GUEST, NET_RFC1918 aliases
2. Rules on vlan0.60: block RFC1918 log, pass internet
3. From guest client: \`ping 192.168.10.10\` fail, \`ping 1.1.1.1\` ok
4. Screenshot deny log entry

**Scenario 2 — Port forward fix:**
1. Add forward WAN:8080 → 192.168.10.50:80 **without** association — verify fail
2. Add association — verify success
3. \`pfctl -vvsr\` show WAN rule hits

**Scenario 3 — Dual WAN policy:**
1. Two WAN interfaces (or simulated secondary)
2. Guest via WAN2, Users via WAN1 — verify diff source IP on internet test sites
3. Fail WAN1 — Users failover

**Scenario 4 — Limiter:**
1. Create 5 Mbps limiter on Guest pass rule
2. iperf or fast.com — verify cap

**Scenario 5 — State kill:**
1. Establish SSH Users→Server
2. Add block rule above — SSH still up
3. \`pfctl -k\` server IP — SSH drops

**Scenario 6 — Split DNS vs hairpin:**
1. Public DNS name → WAN IP
2. Fail from LAN without fix
3. Fix via Unbound override — success

**Deliverable:** policy matrix + 10 rule descriptions documented.`,
    },
    {
      title: 'Полный annotated export: 24 rules SMB офис',
      content: `**Офис ~50 users, 5 VLAN + VPN.** Tracker references for documentation.

**VLAN60 Guest (interface vlan0.60):**

| Track | Action | Source | Dest | Ports | Notes |
|-------|--------|--------|------|-------|-------|
| G-01 | Block | NET_GUEST | NET_RFC1918 | * | Log, #1 priority |
| G-02 | Block | NET_GUEST | HOST_OPNSENSE | * | Except DNS handled below |
| G-03 | Pass | NET_GUEST | HOST_OPNSENSE | 53 | DNS |
| G-04 | Pass | NET_GUEST | !RFC1918 | * | Limiter LIMIT_GUEST |

**VLAN40 IoT (vlan0.40):**

| Track | Action | Source | Dest | Ports |
|-------|--------|--------|------|-------|
| I-01 | Block | NET_IOT | GRP_INTERNAL | * |
| I-02 | Pass | NET_IOT | any | 443,53 |
| I-03 | Block | NET_IOT | any | * |

**VLAN20 Users (vlan0.20):**

| Track | Action | Source | Dest | Ports |
|-------|--------|--------|------|-------|
| U-01 | Pass | NET_USERS | HOST_DC01,02 | PORT_AD |
| U-02 | Pass | NET_USERS | NET_SERVERS | PORT_APP |
| U-03 | Pass | NET_USERS | NET_IOT | PRINT |
| U-04 | Pass | NET_USERS | !RFC1918 | WEB,DNS |

**VLAN10 Servers (vlan0.10):**

| Track | Action | Source | Dest | Ports |
|-------|--------|--------|------|-------|
| S-01 | Pass | NET_SERVERS | !RFC1918 | 80,443 sched |
| S-02 | Block | NET_SERVERS | NET_USERS | * |

**WAN:**

| Track | Action | Source | Dest | Notes |
|-------|--------|--------|------|-------|
| W-01 | Block | GEO_BLOCK | WAN | Floating first |
| W-02 | Pass | any | WAN VIP | 443 assoc PF |
| W-03 | Pass | any | WAN | 51820 WireGuard |

**Mgmt vlan0.99:** M-01 Pass NET_MGMT → OPNsense PORT_MGMT.

Implement in lab minimum 12 rules; full 24 for portfolio.`,
      code: {
        language: 'text',
        caption: 'Пример описания rule для change ticket',
        code: `Tracker: G-01
Interface: vlan0.60 (Guest)
Action: Block + Log
Source: NET_GUEST (192.168.60.0/24)
Destination: NET_RFC1918
Protocol: any
Schedule: always
Gateway: default
Limiter: none
Justification: Guest Wi-Fi isolation per policy v2.1
Rollback: config-2026-08-01-pre-guest.xml
Test: ping 192.168.10.10 from guest → fail + log`,
      },
    },
    {
      title: 'Production case study: Guest isolation breach prevention',
      content: `**Клиент:** retail chain HQ, 55 employees + guest Wi-Fi для vendors.

**До OPNsense:** flat network — vendor laptop compromised → lateral movement to POS back-office server.

**Решение:**
- OPNsense FG replacement on Dell appliance
- VLAN60 Guest, rules G-01..G-04 (block RFC1918 logged)
- Wi-Fi AP guest SSID client isolation
- Unbound DNS only — no internal zone leaks
- Suricata IDS on WAN (alerts to syslog)

**Validation:**
- External pen test: guest nmap internal — 0 responsive hosts
- Firewall logs: ~350 guest deny events/day (normal)
- Vendor workflow: internet + VPN to their own corp — unaffected

**Incident after go-live:** marketing wanted guest access to intranet portal — resolved via **public URL** on internet, not firewall hole.

**Lesson:** deny rules position #1; executive exceptions via process not «temporary allow».

**Metrics:** 3 months — zero guest-origin internal incidents (previously 2 near-misses/year).`,
    },
    {
      title: 'Production case study: Dual WAN failover policies',
      content: `**Клиент:** MSP client, 40 users, dual ISP (fiber + LTE backup).

**Requirements:**
- Corp traffic primary fiber, failover LTE
- Guest always LTE (save fiber bandwidth)
- VoIP prioritized on fiber

**Design:**
- Gateway groups CORP_FAILOVER (fiber→LTE), GUEST_LTE (LTE only)
- Hybrid NAT: corp SNAT fiber public IP; guest SNAT LTE IP
- Policy rules per VLAN gateway field
- VoIP limiter + higher priority queue on fiber interface

**Failover test:** fiber disconnect — corp users reconnect via LTE ~15 sec (state kill for some long TCP).

**Failback:** fiber restore — new sessions prefer fiber; optional scheduled state flush night.

**Problem encountered:** LTE SNAT without hybrid rule — corp failover showed fiber IP asymmetric — fixed NAT rule order.

**Monitoring:** Zabbix on gateway status + syslog deny spike alerts.

**Cost win:** guest streaming moved off fiber — 30% bandwidth savings peak hours.

**Documentation:** runbook «ISP-A down» for NOC — 1 page, gateway screenshots.`,
    },
    {
      title: 'FAQ: 14 частых вопросов (Firewall/NAT)',
      content: `**1. Нужен ли rule на return path?**
Нет для stateful Pass — state handles return.

**2. Port forward vs 1:1 NAT?**
Port forward = specific ports. 1:1 = all ports to one host.

**3. Automatic NAT enough?**
Single WAN yes. Multi-WAN use Hybrid.

**4. Why connection timeout WAN?**
Missing associated filter rule or server GW wrong.

**5. Floating vs interface rule?**
90% interface; floating for global quick blocks.

**6. Guest can ping gateway but not internet?**
DNS block or missing pass rule above block; check NAT.

**7. Rule log but no traffic?**
Misread direction — log on wrong interface.

**8. Geo block broke Microsoft 365?**
CDN in blocked country — adjust or allow M365 alias.

**9. Limiters not working?**
Wrong pipe direction (in vs out); rule without limiter set.

**10. pfctl -F states safe?**
Drops all connections — maintenance window only.

**11. Reflection or split DNS?**
Split DNS preferred; reflection for legacy apps.

**12. How audit rule order?**
Export + \`pfctl -vvsr\` counters + documentation tracker IDs.

**13. Implicit deny logged?**
No — add explicit block+log at bottom if audit needs.

**14. CARP + Multi-WAN?**
Complex — each node needs matching gateway health; test failover thoroughly.`,
    },
    {
      title: 'Interview Q&A: 12 вопросов (Firewall/NAT)',
      content: `**Q1: First match or last match?**
A: First match top-to-bottom per interface anchor.

**Q2: Difference Block vs Reject?**
A: Block silent drop; Reject ICMP error to client.

**Q3: Associated filter rule purpose?**
A: WAN pass for inbound DNAT — without it filter drops.

**Q4: When Hybrid outbound NAT?**
A: Multi-WAN, policy SNAT, non-default mappings.

**Q5: How guest isolation fails most often?**
A: Allow rule above deny internal; wrong rule order.

**Q6: What is state table?**
A: Kernel tracking of permitted flows for stateful inspection.

**Q7: Kill states when?**
A: After policy change must enforce on existing sessions.

**Q8: Policy routing vs default route?**
A: Policy route matches specific traffic to gateway; overrides default for that flow.

**Q9: Bogon block where?**
A: WAN interface checkbox — inbound spoof protection.

**Q10: Limiter mask source?**
A: Per-source IP bandwidth bucket on shared segment.

**Q11: Hairpin problem symptom?**
A: Internal client to public IP fails or asymmetric NAT.

**Q12: OPNsense vs FortiGate policy model key diff?**
A: pf interface anchors + separate NAT section vs unified FortiOS policy with NAT flag and VIP objects.`,
    },
  ],
  practice: [
    'Создай 15+ aliases (NET_*, HOST_*, PORT_*) для lab топологии 5 VLAN — без raw IP в rules',
    'Реализуй Guest policy G-01..G-04 на vlan0.60; проверь ping internal fail + internet ok + deny log',
    'Настрой port forward WAN:443 → web server: сначала без association (fail), затем fix и document hits в pfctl',
    'Переключи outbound NAT на Hybrid; создай manual rule для Guest VLAN на второй WAN (simulated или lab)',
    'Создай limiter 10 Mbps для Guest; verify через speed test или iperf',
    'Настрой gateway group failover; отключи primary WAN и задокументируй время восстановления corp traffic',
    'Floating rule: block inbound GEO alias (2 countries) на WAN; тест с логом',
    'Lab scenario 5: state kill после block rule — задокументируй поведение SSH session',
    'Packet capture: WAN + LAN simultaneous при port forward; объясни pcap в 5 bullet points',
    'Составь policy matrix Excel/MD: 24 rules annotated export для офиса 50 users',
    'Quarterly audit lab: найди shadowed rule (duplicate pass) через pfctl counters',
    'Split DNS override для одного public hostname; сравни с NAT reflection enable',
  ],
  resources: [
    { title: 'OPNsense Firewall Rules (docs)', url: 'https://docs.opnsense.org/manual/firewall.html' },
    { title: 'OPNsense NAT Configuration', url: 'https://docs.opnsense.org/manual/nat.html' },
    { title: 'OPNsense Aliases', url: 'https://docs.opnsense.org/manual/aliases.html' },
    { title: 'OPNsense Traffic Shaper', url: 'https://docs.opnsense.org/manual/shaper.html' },
    { title: 'OPNsense Multi-WAN', url: 'https://docs.opnsense.org/manual/routing.html' },
    { title: 'OPNsense GeoIP plugin', url: 'https://docs.opnsense.org/manual/how-tos/geoip.html' },
    { title: 'pf documentation (FreeBSD)', url: 'https://docs.freebsd.org/en/books/handbook/firewalls/' },
  ],
}
