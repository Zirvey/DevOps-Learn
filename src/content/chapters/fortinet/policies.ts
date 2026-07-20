import type { Chapter } from '../../../types'

export const fortigatePoliciesChapter: Chapter = {
  id: 'fortigate-firewall-policies',
  slug: 'fortigate-firewall-policies',
  title: 'FortiGate — политики, NAT и UTM',
  moduleId: 'fortinet',
  order: 1,
  duration: '12–14 часов',
  level: 'intermediate',
  description:
    'Firewall policies, ordering, NAT, VIP, UTM profiles, SSL inspection, application control, Geo IP — production SMB офис',
  sections: [
    {
      title: 'Модель firewall policy в FortiOS 7.4',
      content: `**Firewall policy** — центральный механизм контроля трафика на FortiGate. Каждый flow (соединение) проверяется против ordered list политик **сверху вниз**. Первое совпадение определяет action.

**Поля политики (5-tuple + extensions):**

| Поле | Описание | Пример SMB |
|------|----------|------------|
| **Incoming Interface / Zone** | Откуда пришёл пакет | VLAN20-Workstations |
| **Outgoing Interface / Zone** | Куда уходит | wan1 / WAN zone |
| **Source** | Address object / FQDN / geography | ADDR-Workstations |
| **Destination** | Address / FQDN / VIP | all, ADDR-DC |
| **Service** | TCP/UDP ports | HTTPS, SMB, ALL |
| **Schedule** | Время действия | always, business-hours |
| **Action** | ACCEPT, DENY, IPSEC | ACCEPT |
| **NAT** | Source NAT (masquerade) | Enable для internet |
| **Security Profiles** | UTM inspection | AV, IPS, Web Filter |
| **Log** | Traffic log | All sessions / security events |

**Stateful inspection:** FortiGate отслеживает состояние TCP/UDP sessions. Return traffic автоматически разрешён, если forward flow был accepted (не нужна отдельная reverse policy для stateful traffic).

**Implicit deny:** если ни одна политика не совпала — трафик **отброшен** без лога (по умолчанию). Добавь explicit deny-all в конце с logging для аудита.

**GUI:** Policy & Objects → Firewall Policy → Create New.`,
    },
    {
      title: 'Policy ordering: порядок решает всё',
      content: `**Золотое правило:** специфичные политики **выше**, общие — **ниже**. Deny — **выше** allow для того же traffic class.

**Рекомендуемый порядок для SMB офиса:**

\`\`\`
 1. Deny Guest → RFC1918 (internal networks)
 2. Deny Workstations → Servers (blocked ports)
 3. Allow Management → FortiGate (HTTPS/SSH)
 4. Allow Workstations → Servers (specific ports)
 5. Allow Servers → Internet (patching, restricted)
 6. Allow Workstations → Internet (NAT + UTM)
 7. Allow Guest → Internet only (NAT, no UTM profiles)
 8. Allow VPN users → internal resources
 9. Allow IPsec → internal subnets
10. Explicit Deny All (log enabled)
\`\`\`

**Типичные ошибки ordering:**
- «Allow all» policy вверху списка → всё остальное бесполезно
- Guest allow internet **перед** guest deny internal → guest видит серверы
- Дублирующие policies с разными profiles → confusion в troubleshooting

**Policy ID:** FortiGate присваивает sequence number. Reorder: GUI drag-and-drop или \`move <id> before <id>\`.

**Naming convention:** \`POL-DENY-Guest-Internal\`, \`POL-ALLOW-Users-Internet\` — облегчает audit и Policy Lookup.

**Теги (labels):** Policy & Objects → добавь tag «Production», «Guest», «VPN» для фильтрации в GUI.`,
    },
    {
      title: 'Address objects и address groups',
      content: `Не используй raw IP в policies — создавай **address objects** для читаемости и переиспользования.

**Типы address objects:**

| Тип | Пример | Когда |
|-----|--------|-------|
| **Subnet** | 192.168.20.0/24 | VLAN subnets |
| **IP Range** | 192.168.10.50-192.168.10.60 | DHCP reservations |
| **FQDN** | updates.microsoft.com | Dynamic cloud services |
| **Geography** | Russia, China | Geo blocking |
| **Device (MAC)** | AA:BB:CC:DD:EE:FF | IoT, BYOD |

**Address Groups:** объединение objects. \`GRP-Internal-All\` = VLAN10 + VLAN20 + VLAN30.

**Рекомендуемые objects для SMB:**

\`\`\`
ADDR-Servers       192.168.10.0/24
ADDR-Workstations  192.168.20.0/24
ADDR-VoIP          192.168.30.0/24
ADDR-Guest         192.168.60.0/24
ADDR-Mgmt          192.168.99.0/24
ADDR-RFC1918       10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
ADDR-DC            192.168.10.10, 192.168.10.11
\`\`\`

**GUI:** Policy & Objects → Addresses → Create New.

**Fabric Connector addresses:** EMS tags, FSSO users — dynamic groups из Security Fabric.`,
      code: {
        language: 'text',
        caption: 'CLI: address objects и group',
        code: `config firewall address
    edit "ADDR-Workstations"
        set subnet 192.168.20.0 255.255.255.0
    next
    edit "ADDR-Guest"
        set subnet 192.168.60.0 255.255.255.0
    next
    edit "ADDR-RFC1918-10"
        set subnet 10.0.0.0 255.0.0.0
    next
end

config firewall addrgrp
    edit "GRP-Internal-All"
        set member "ADDR-Servers" "ADDR-Workstations" "ADDR-VoIP"
    next
end`,
      },
    },
    {
      title: 'Service objects и custom ports',
      content: `**Service objects** определяют протокол и порты. Built-in services: HTTP (80), HTTPS (443), SMB (445), LDAP (389), DNS (53).

**Custom service** — когда нужен нестандартный порт:
- App server: TCP 8443
- Custom ERP: TCP 5000-5010
- Monitoring: TCP 9100 (Prometheus node exporter — только internal!)

**Service Groups:** \`SVC-Web\` = HTTP + HTTPS. \`SVC-AD\` = LDAP + LDAP-GC + Kerberos + DNS.

**Правило SMB:** principle of least privilege — не используй \`ALL\` в production policies. Указывай конкретные services:

| Flow | Services |
|------|----------|
| Users → DC | DNS, LDAP, Kerberos, SMB |
| Users → Internet | HTTP, HTTPS, DNS, NTP |
| Users → File Server | SMB |
| Servers → Internet (patch) | HTTP, HTTPS |
| Mgmt → FortiGate | HTTPS, SSH, SNMP |

**GUI:** Policy & Objects → Services → Create New.`,
      code: {
        language: 'text',
        caption: 'CLI: custom service',
        code: `config firewall service custom
    edit "SVC-ERP-App"
        set tcp-portrange 5000-5010
    next
    edit "SVC-Monitoring"
        set tcp-portrange 9100
    next
end`,
      },
    },
    {
      title: 'Schedules, logging и теги политик',
      content: `**Schedules** ограничивают действие policy по времени:
- \`always\` — 24/7 (default)
- \`business-hours\` — Пн–Пт 08:00–19:00
- \`night-patch-window\` — Вс 02:00–06:00 для server patching

**Use case:** servers → internet allow только в patch window. Guest internet — только business hours (опционально).

**Logging options per policy:**

| Setting | Когда включать |
|---------|---------------|
| **Disable** | High-volume trusted internal flows |
| **Security Events** | UTM-related policies |
| **All Sessions** | Internet egress, Guest, VPN (для audit) |

**Внимание:** log all sessions на 50 users × full internet = **огромный** объём. На FG-60F используй selective logging: all sessions на Guest/VPN/deny, security events на UTM policies.

**Log forwarding:** Log & Report → Log Settings → Send to FortiAnalyzer / syslog.

**Policy tags:** группируй по функции — «Internet», «Internal», «Deny», «VPN».`,
    },
    {
      title: 'Типовые политики SMB офиса',
      content: `**Полный набор policies** для офиса ~50 человек (5 VLAN + VPN).

**POL-001 Deny Guest → Internal**
- Incoming: VLAN60-Guest | Outgoing: any
- Source: ADDR-Guest | Dest: GRP-Internal-All
- Action: DENY | Log: All

**POL-002 Allow Mgmt → FortiGate**
- Incoming: VLAN99-Mgmt | Outgoing: any
- Source: ADDR-Mgmt | Dest: FortiGate | Service: HTTPS, SSH
- Action: ACCEPT

**POL-003 Allow Users → Servers**
- Incoming: VLAN20 | Outgoing: VLAN10
- Source: ADDR-Workstations | Dest: ADDR-Servers
- Service: SVC-AD, SMB, RDP (если разрешён)
- Profiles: none (internal trusted)

**POL-004 Allow Servers → Internet (patch)**
- Incoming: VLAN10 | Outgoing: wan1
- Source: ADDR-Servers | Dest: all | Service: HTTP, HTTPS
- NAT: ON | Schedule: patch-window
- Profiles: AV, IPS

**POL-005 Allow Users → Internet**
- Incoming: VLAN20 | Outgoing: wan1
- Source: ADDR-Workstations | Dest: all
- NAT: ON | Profiles: AV, IPS, Web Filter, App Control, DNS Filter

**POL-006 Allow Guest → Internet**
- Incoming: VLAN60 | Outgoing: wan1
- Source: ADDR-Guest | Dest: all | NAT: ON
- Profiles: Web Filter (strict), DNS Filter

**POL-099 Deny All (explicit)**
- Incoming: any | Outgoing: any | Action: DENY | Log: All`,
      code: {
        language: 'text',
        caption: 'CLI: policy Users → Internet с UTM',
        code: `config firewall policy
    edit 0
        set name "POL-ALLOW-Users-Internet"
        set srcintf "VLAN20-Workstations"
        set dstintf "wan1"
        set srcaddr "ADDR-Workstations"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set utm-status enable
        set av-profile "default"
        set ips-sensor "default"
        set webfilter-profile "default"
        set application-list "default"
        set dnsfilter-profile "default"
        set nat enable
        set logtraffic all
    next
end`,
      },
    },
    {
      title: 'Изоляция Guest Wi-Fi',
      content: `**Guest network** — самый атакуемый сегмент. Пользователи не доверенные, устройства не управляемые.

**Обязательные меры:**
1. Отдельный VLAN (60) с /24 subnet
2. **Deny policy** Guest → ALL RFC1918 (выше allow internet)
3. Client isolation на FortiAP (не видят друг друга)
4. Captive portal (опционально) — Terms of Use
5. Bandwidth limit per client (FortiAP traffic shaping)
6. DNS Filter + Web Filter (block malware, adult)
7. Короткий DHCP lease (4h)
8. No SSL inspection (privacy + performance)

**Проверка:** с Guest client:
- ping 8.8.8.8 → OK
- ping 192.168.10.10 (DC) → FAIL
- traceroute к internal → blocked at FG
- nmap internal subnet → timeout

**DNS leak test:** Guest не должен резолвить internal zone names (split DNS на FG: Guest → только public DNS).

**FortiAP setting:** WiFi & Switch Controller → SSID Guest → VLAN 60, Security Mode Captive Portal (optional).`,
    },
    {
      title: 'Central SNAT и IP pools',
      content: `**Source NAT (SNAT)** — подмена internal IP на WAN IP при выходе в internet. Без NAT private IP не маршрутизируется в internet.

**FortiOS 7.4 modes:**
- **Use Outgoing Interface Address** — default, WAN IP как source (простейший)
- **Use Dynamic IP Pool** — несколько public IP, round-robin
- **Central SNAT table** — отдельная таблица SNAT rules (advanced, policy-independent)

**SMB default:** NAT enabled per-policy → outgoing interface address. Достаточно для 95% случаев.

**IP Pool** — когда у ISP несколько public IP:
- Servers outbound через dedicated IP (для whitelist на SaaS)
- User traffic через другой IP

**Central SNAT** (Policy & Objects → Central SNAT):
- Policy 1: Servers → pool «Public-IP-2»
- Policy 2: Users → pool «Public-IP-1»

**Не путай:** SNAT (outbound masquerade) vs VIP/DNAT (inbound port forward).`,
      code: {
        language: 'text',
        caption: 'CLI: IP pool и central SNAT',
        code: `config firewall ippool
    edit "POOL-WAN-Primary"
        set startip 203.0.113.10
        set endip 203.0.113.10
    next
end

config firewall central-snat-map
    edit 1
        set orig-addr "ADDR-Workstations"
        set dst-addr "all"
        set srcintf "VLAN20-Workstations"
        set dstintf "wan1"
        set nat-ippool "POOL-WAN-Primary"
    next
end`,
      },
    },
    {
      title: 'VIP (Virtual IP) и DNAT port forwarding',
      content: `**VIP (Virtual IP)** — mapping public IP:port → internal IP:port. Используется для inbound services: web server, mail, RDP (не рекомендуется).

**Структура VIP:**
- External IP: 203.0.113.10 (WAN IP)
- External port: 443
- Mapped IP: 192.168.10.50 (internal server)
- Mapped port: 443
- Interface: wan1

**Firewall policy для VIP:** отдельная policy Incoming wan1 → internal, destination = VIP object, action accept.

**Security рекомендации SMB:**
- **Минимизируй** port forwarding. Каждый открытый порт = attack surface
- RDP/SSH на WAN → **запрещено**. Используй SSL-VPN
- Web services → Cloudflare proxy / AWS ALB вместо direct VIP
- Если VIP необходим → IPS + Geo block + rate limiting + restrict source

**Alternatives to VIP:**
- SSL-VPN для remote admin access
- Cloudflare Tunnel для internal web apps
- Site-to-site IPsec для B2B integration`,
      code: {
        language: 'text',
        caption: 'CLI: VIP HTTPS → internal web server',
        code: `config firewall vip
    edit "VIP-Web-HTTPS"
        set extip 203.0.113.10
        set extintf "wan1"
        set portforward enable
        set mappedip "192.168.10.50"
        set extport 443
        set mappedport 443
        set protocol tcp
    next
end

config firewall policy
    edit 0
        set name "POL-ALLOW-WAN-Web"
        set srcintf "wan1"
        set dstintf "VLAN10-Servers"
        set srcaddr "all"
        set dstaddr "VIP-Web-HTTPS"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set ips-sensor "default"
        set logtraffic all
    next
end`,
      },
    },
    {
      title: 'Static NAT (one-to-one mapping)',
      content: `**Static NAT** — 1:1 mapping public IP ↔ private IP (все порты). Реже VIP, используется для:
- Dedicated public IP для mail server
- Legacy application требующая fixed public IP
- SIP trunk с fixed source IP

**На FortiGate:** VIP type = Static NAT (без port forward), или IP pool + policy.

**Риски:** весь port range exposed. Для SMB — **избегай** static NAT, предпочитай VIP с конкретными портами.

**Outbound static:** internal server всегда выходит с определённым public IP (через IP pool) — безопаснее, используй для SaaS whitelisting.`,
    },
    {
      title: 'Security Profiles: обзор UTM',
      content: `**UTM (Unified Threat Management)** — набор security profiles, применяемых к accepted traffic в firewall policy.

| Profile | Функция | Impact на performance |
|---------|---------|----------------------|
| **Antivirus** | Scan files в HTTP/FTP/IMAP | Medium |
| **IPS** | Block exploits по signatures | Medium-High |
| **Web Filter** | URL category blocking | Low-Medium |
| **Application Control** | Identify & block apps (Telegram, torrents) | Medium |
| **DNS Filter** | Block malicious domains | Low |
| **SSL/SSH Inspection** | Decrypt HTTPS для inspection | **High** |
| **DLP** | Data loss prevention | Medium (enterprise) |

**Profile groups:** Security Profiles → Profile Groups → объедини AV+IPS+WebFilter в «UTM-Standard», назначай одной кнопкой.

**SMB рекомендация по tiers:**

| Traffic | Profiles |
|---------|----------|
| Users → Internet | AV + IPS + Web Filter + App Control + DNS Filter |
| Guest → Internet | Web Filter (strict) + DNS Filter |
| Internal (user→server) | IPS only (optional) |
| Servers → Internet | AV + IPS |
| VPN users → Internet | Full UTM (full tunnel) |

**GUI:** Security Profiles → каждый тип → Edit → Clone для custom profiles.`,
    },
    {
      title: 'Antivirus и IPS профили',
      content: `**Antivirus Profile:**
- Scan protocols: HTTP, SMTP, POP3, IMAP, FTP, SMB
- Action: block infected files, quarantine
- Outbreak Prevention: cloud sandbox check (FortiGuard license)
- **SMB:** enable HTTP + SMB scan. Email scan — если FG inline (редко, обычно на mail gateway)

**IPS Profile:**
- Signature database: 20K+ rules
- Severity filter: block Critical, High, Medium; monitor Low
- Override signatures для false positives
- **SMB:** default IPS sensor + add exceptions для legacy apps

**False positives:** legacy ERP, custom apps могут триггерить IPS. Workflow:
1. Identify signature ID в log
2. IPS → Edit profile → Override → action «monitor» для конкретного signature
3. Document exception с ticket ID

**Не отключай IPS целиком** «потому что мешает» — точечные exceptions.`,
      code: {
        language: 'text',
        caption: 'CLI: custom IPS sensor',
        code: `config ips sensor
    edit "IPS-Office-Standard"
        set block-malicious-url enable
        config entries
            edit 1
                set severity medium high critical
                set action block
            next
        end
    next
end`,
      },
    },
    {
      title: 'Web Filter и DNS Filter',
      content: `**Web Filter** — фильтрация HTTP/HTTPS по URL categories (90+ категорий FortiGuard).

**Рекомендуемые категории для block (office):**
- Malicious websites
- Phishing
- Hacking
- Malware
- Spyware
- Botnet
- Newly Observed Domain (caution)
- Adult / Pornography (office policy)
- Gambling (optional)

**FortiGuard Category Filter:** Security Profiles → Web Filter → FortiGuard category based filter.

**HTTPS без SSL inspection:** Web Filter работает по SNI/URL в cleartext + DNS. **С SSL inspection** — полный URL path visible.

**DNS Filter:**
- Block malicious domains на DNS level
- Работает даже без SSL inspection
- FortiGate as DNS proxy или transparent DNS inspection
- **Рекомендация:** включи DNS Filter на **всех** internet policies — low cost, high value

**Safe Search:** force Google/Bing safe search для Guest VLAN.

**GUI:** Security Profiles → Web Filter / DNS Filter → Create or Clone default.`,
    },
    {
      title: 'Application Control',
      content: `**Application Control** идентифицирует приложения (не только ports) — Telegram, WhatsApp, BitTorrent, Tor, gaming.

**Categories для SMB office block:**
- P2P (BitTorrent, eMule)
- Proxy / Tunnel (Ultrasurf, Psiphon)
- Botnet
- Gaming (optional, по HR policy)
- Instant Messaging (optional — block Telegram desktop, allow web)

**Action types:**
- **Block** — deny connection
- **Monitor** — log only (pilot phase)
- **Allow** — explicit permit (для whitelist approach)

**Workflow внедрения:**
1. Week 1: Monitor all → analyze FortiAnalyzer reports
2. Week 2: Block P2P, Tor, known proxies
3. Week 3+: Fine-tune по feedback

**Не блокируй всё подряд** — Teams, Zoom, Slack должны быть allowed. Проверь «Collaboration» category.

**Performance:** App Control использует DPI. На FG-60F с 500 Mbps — обычно OK. При проблемах — exclude speedtest servers.`,
      code: {
        language: 'text',
        caption: 'CLI: application list с block P2P',
        code: `config application list
    edit "APP-Office-Standard"
        config entries
            edit 1
                set category 2
                set action block
                set comment "P2P applications"
            next
            edit 2
                set application 15896
                set action block
                set comment "Tor"
            next
        end
    next
end`,
      },
    },
    {
      title: 'SSL Deep Inspection',
      content: `**Проблема:** 95%+ internet traffic — HTTPS. Без decryption UTM видит только IP и SNI, не content.

**SSL Inspection** — FortiGate как MITM proxy: decrypt → inspect → re-encrypt. Corporate CA certificate установлен на всех endpoints.

**Режимы:**
- **Deep Inspection** — все HTTPS (maximum security, maximum breakage)
- **Certificate Inspection** — только metadata, без full decrypt
- **No Inspection** — bypass

**Требования для Deep Inspection:**
1. Generate/Import CA: System → Certificates → Create CA
2. Deploy CA cert на все ПК через GPO (Windows) / MDM (macOS)
3. SSL/SSH Profile: Security Profiles → SSL/SSH Inspection → deep-inspection
4. Exceptions: banking, government, health apps (FortiGuard exempt list + custom)

**Юридический аспект:** согласие сотрудников на inspection (HR policy, AUP).

**SMB практика 2026:**
- Full deep inspection — редко (breakage, performance, privacy)
- **Certificate inspection + DNS Filter + endpoint EDR** — pragmatic balance
- Deep inspection для Guest — не нужно (нет corporate CA)
- Deep inspection для Users → Internet — pilot на subset, expand gradually

**Performance impact:** FG-60F throughput с full SSL inspection может упасть до 200-300 Mbps. Plan accordingly.`,
      code: {
        language: 'text',
        caption: 'CLI: SSL inspection profile',
        code: `config firewall ssl-ssh-profile
    edit "SSL-Deep-Office"
        config https
            set ports 443
            set status deep-inspection
            set client-certificate bypass
            set unsupported-ssl-version block
            set invalid-server-certificate block
        end
    next
end`,
      },
    },
    {
      title: 'Geo IP blocking',
      content: `**Geography-based filtering** — block/allow traffic по country IP ranges. FortiGuard GeoIP database.

**Use cases SMB:**
- Block inbound from high-risk countries (если нет бизнеса там)
- Block outbound to sanctioned countries
- VPN brute-force mitigation: block WAN admin/VPN from non-RU IPs (если все employees в России)
- VIP protection: allow HTTPS only from specific countries

**Address object type Geography:**
- Policy & Objects → Addresses → Create → Geography → Russia, Kazakhstan, etc.

**Inbound policy example:**
- WAN → VIP: source = Russia + CIS only, deny rest
- WAN → SSL-VPN: source geography = office countries

**Осторожно:**
- CDN (Cloudflare) — source IP не реальный client
- Remote employees abroad — block their country = lockout
- GeoIP database не 100% accurate

**GUI:** Policy & Objects → Addresses → Type: Geography.`,
      code: {
        language: 'text',
        caption: 'CLI: geo block inbound на WAN',
        code: `config firewall address
    edit "GEO-High-Risk"
        set type geography
        set country "CN" "KP" "IR"
    next
end

config firewall policy
    edit 0
        set name "POL-DENY-WAN-GeoBlock"
        set srcintf "wan1"
        set dstintf "any"
        set srcaddr "GEO-High-Risk"
        set dstaddr "all"
        set action deny
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
end`,
      },
    },
    {
      title: 'Policy Lookup и Flow Debug',
      content: `**Policy Lookup (GUI):** Policy & Objects → Policy Lookup → simulate packet:
- Source IP, Dest IP, Port, Protocol, Interface
- Result: matching policy ID, action, NAT, profiles

**Используй первым** при «почему blocked/allowed».

**Flow Debug (CLI)** — real-time packet tracing:

1. \`diagnose debug reset\` — clear state
2. \`diagnose debug flow filter addr x.x.x.x\` — filter by IP
3. \`diagnose debug flow show function-name enable\` — verbose
4. \`diagnose debug enable\` — start
5. Reproduce traffic
6. \`diagnose debug disable\` — stop (обязательно!)

**Что искать в output:**
- \`find a route\` — routing decision
- \`allowed by policy X\` — matching policy
- \`denied by policy X\` — blocked
- \`NAT\` — source translation
- \`iprope_in_check() check failed\` — implicit deny

**Session table:** \`diagnose sys session list\` — active connections. Filter: \`diagnose sys session filter src <ip>\`.`,
      code: {
        language: 'text',
        caption: 'Flow debug: полный цикл',
        code: `diagnose debug reset
diagnose debug flow filter addr 192.168.20.50
diagnose debug flow filter port 443
diagnose debug flow show function-name enable
diagnose debug enable

# С клиента 192.168.20.50 открой https://example.com

diagnose debug disable
diagnose debug reset`,
      },
    },
    {
      title: 'Implicit deny, logging и compliance',
      content: `**Implicit deny** — трафик без matching policy отбрасывается молча. Для security audit это проблема: не видно что блокируется.

**Explicit deny-all policy (рекомендация):**
- Source: all | Dest: all | Service: ALL
- Action: DENY
- Log: All sessions
- Position: **последняя** в списке
- Name: POL-DENY-Explicit-Log

**Compliance logging:**
- PCI DSS: log all access to cardholder data network
- ISO 27001: audit trail для security events
- Retention: FortiAnalyzer 90+ days

**Log settings:** Policy & Objects → Firewall Policy → per-policy log. + Log & Report → Log Settings → global options.

**FortiAnalyzer reports:** Top blocked destinations, policy violations, UTM blocks — еженедельный review.`,
    },
    {
      title: 'Performance: ASIC offload и UTM impact',
      content: `FortiGate использует **NP6/NP7 ASIC** для hardware acceleration. Not all traffic offloadable.

**Что offloadится (без UTM):**
- Simple routing/NAT между interfaces
- IPsec VPN (with right config)
- Session setup at wire speed

**Что НЕ offloadится:**
- Traffic с UTM profiles (AV, IPS, App Control)
- SSL Deep Inspection
- Complex ACL matching

**NP offload check:** \`diagnose npu np6 port-list\`, \`get hardware npu np6 port-list\`

**Оптимизация SMB:**
- UTM только на internet-bound policies
- Internal traffic — no profiles (or IPS only)
- SSL inspection selective, not blanket
- Log «all sessions» only where needed
- Session TTL tuning для long-lived connections

**Если FG-60F bottleneck:** upgrade to FG-100F, reduce UTM scope, или add second WAN with SD-WAN load distribution.`,
    },

    {
      title: 'Полный export политик офиса: 22 правила с аннотациями',
      content: `**Production policy set** для офиса 50 человек. Каждое правило — name, purpose, log level.

| ID | Name | Src | Dst | Service | NAT | UTM | Action | Log |
|----|------|-----|-----|---------|-----|-----|--------|-----|
| 1 | POL-DENY-Guest-Internal | Guest | Internal | ALL | - | - | DENY | All |
| 2 | POL-DENY-Guest-Servers | Guest | Servers | ALL | - | - | DENY | All |
| 3 | POL-DENY-Users-RDP-Ext | Users | Internet | RDP | - | IPS | DENY | All |
| 4 | POL-ALLOW-Mgmt-FG | Mgmt | FG | HTTPS,SSH | - | - | ALLOW | Event |
| 5 | POL-ALLOW-Mgmt-Switches | Mgmt | Switches | HTTPS,SNMP | - | - | ALLOW | Event |
| 6 | POL-ALLOW-Users-DC | Users | DC | AD-Services | - | IPS | ALLOW | Security |
| 7 | POL-ALLOW-Users-Servers | Users | Servers | SMB,RDP,App | - | IPS | ALLOW | Security |
| 8 | POL-ALLOW-VoIP-SBC | VoIP | SBC | SIP,RTP | - | - | ALLOW | Disable |
| 9 | POL-ALLOW-Servers-Patch | Servers | Internet | HTTP,HTTPS | ON | AV,IPS | ALLOW | Security |
| 10 | POL-ALLOW-Users-Internet | Users | WAN | ALL | ON | Full UTM | ALLOW | All |
| 11 | POL-ALLOW-Guest-Internet | Guest | WAN | ALL | ON | Web,DNS | ALLOW | All |
| 12 | POL-ALLOW-SSLVPN-Internal | ssl.root | Internal | Restricted | - | IPS | ALLOW | All |
| 13 | POL-ALLOW-SSLVPN-Internet | ssl.root | WAN | ALL | ON | Full | ALLOW | All |
| 14 | POL-ALLOW-IPsec-HQ-Branch | IPsec | Internal | ALL | - | IPS | ALLOW | Security |
| 15 | POL-ALLOW-IPsec-AWS | IPsec | AWS | ALL | - | IPS | ALLOW | Security |
| 16 | POL-DENY-WAN-GeoBlock | WAN | ANY | ALL | - | - | DENY | All |
| 17 | POL-ALLOW-WAN-VIP-Web | WAN | VIP-Web | HTTPS | - | IPS | ALLOW | All |
| 18 | POL-ALLOW-IoT-Internet | IoT | WAN | HTTP,HTTPS | ON | DNS | ALLOW | Security |
| 19 | POL-DENY-IoT-Internal | IoT | Internal | ALL | - | - | DENY | All |
| 20 | POL-ALLOW-EMS-Quarantine | Quarantine | Internet | HTTP,HTTPS | ON | Full | ALLOW | All |
| 21 | POL-DENY-Quarantine-Internal | Quarantine | Internal | ALL | - | - | DENY | All |
| 22 | POL-DENY-Explicit-Log | ANY | ANY | ALL | - | - | DENY | All |

**Export:** \`show firewall policy\` → save as \`fg-policies-$(date).conf\`. Diff при каждом change.`,
      code: {
        language: 'text',
        caption: 'CLI: export всех policies',
        code: `show firewall policy
show firewall address
show firewall service custom

# Move explicit deny to bottom
config firewall policy
    move 22 after 21
end`,
      },
    },
    {
      title: 'ZTNA: введение для FortiGate SMB',
      content: `**ZTNA (Zero Trust Network Access)** — доступ к приложениям по identity + posture, не по network location.

**Traditional VPN:** user → full network access → lateral movement risk.

**FortiGate ZTNA (FortiOS 7.4):**
- FortiClient connects with EMS tags
- Per-application access (SAP, internal web app)
- No broad subnet access
- Continuous posture check

**Components:**
| Component | Role |
|-----------|------|
| FortiGate | ZTNA gateway, policy enforcement |
| FortiClient + EMS | Device posture, tags |
| FortiAuthenticator | SSO, SAML |
| ZTNA tags | Dynamic policy matching |

**SMB adoption path:**
1. Phase 1: SSL-VPN split tunnel (current)
2. Phase 2: EMS compliance tags on VPN
3. Phase 3: ZTNA for SaaS + critical internal apps
4. Phase 4: Reduce broad VPN subnets

**ZTNA vs VPN coexistence:** VPN for legacy, ZTNA for new apps. Don't rip VPN day one.

**GUI:** Policy & Objects → ZTNA → ZTNA Application Policies.`,
    },
    {
      title: 'Explicit proxy: когда и как настроить',
      content: `**Explicit proxy** — clients направляют HTTP/HTTPS на FortiGate proxy port (8080/8443) вместо transparent inspection.

**Когда использовать:**
- Legacy apps requiring proxy config
- Granular URL logging without full SSL inspection
- Guest network with proxy authentication
- Compliance: user-level web access audit

**Когда НЕ использовать (SMB default):**
- Transparent UTM (Web Filter + DNS Filter) проще
- Modern apps bypass proxy settings
- SSL inspection profile достаточен

**Setup overview:**
1. Network → Explicit Proxy → Enable
2. Set proxy port 8080, enable authentication (LDAP)
3. Client browser/system proxy → FG IP:8080
4. Firewall policy: proxy users → WAN with UTM

**vs Transparent:** explicit requires client config; transparent works automatically.

**Performance:** explicit proxy adds latency. Prefer DNS Filter + certificate inspection for most SMB.`,
      code: {
        language: 'text',
        caption: 'CLI: explicit web proxy enable',
        code: `config web-proxy explicit
    set status enable
    set ftp-over-http enable
    set socks enable
    set http-incoming-port 8080
    set ipv6-status disable
    set unknown-http-version best-effort
end

config firewall proxy-policy
    edit 1
        set name "PROXY-Users-Internet"
        set proxy explicit-web
        set srcintf "VLAN20-Workstations"
        set dstintf "wan1"
        set srcaddr "ADDR-Workstations"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set webfilter-profile "default"
    next
end`,
      },
    },
    {
      title: 'DNS Filter: углублённая настройка',
      content: `**DNS Filter** блокирует malicious domains на DNS-уровне — работает даже без SSL inspection.

**Modes:**
- **Proxy-based:** FG intercepts DNS queries (port 53)
- **FortiGuard DNS:** FG as DNS server for clients
- **DoH/DoT blocking:** prevent DNS bypass

**Recommended categories (block):**
- Botnet C&C
- Malware
- Phishing
- Spam URLs
- Newly Observed Domains (monitor first)

**Per-policy assignment:**
\`\`\`
set dnsfilter-profile "DNS-Office-Standard"
\`\`\`

**Guest vs Users:**
- Users: standard block list
- Guest: strict + safe search enforced

**Logging:** DNS Filter blocks appear in UTM log → FortiAnalyzer DNS report.

**Test:** \`execute nslookup malware.testcategory.com\` from client → should block/redirect.

**Bypass prevention:** block DoH (Cloudflare 1.1.1.1 encrypted) via App Control or DNS Filter.`,
      code: {
        language: 'text',
        caption: 'CLI: DNS filter profile',
        code: `config dnsfilter profile
    edit "DNS-Office-Standard"
        config ftgd-dns-filters
            edit 1
                set category 26
                set action block
            next
            edit 2
                set category 88
                set action block
            next
        end
        set block-botnet enable
    next
end`,
      },
    },
    {
      title: 'Botnet C&C и Outbreak Prevention',
      content: `**Botnet C&C blocking** — FortiGuard real-time block of command-and-control servers.

**Layers:**
1. **DNS Filter:** block C&C domain resolution
2. **IPS:** block C&C IP signatures
3. **Application Control:** block botnet category apps
4. **Outbreak Prevention:** cloud sandbox unknown files

**Enable on all internet policies:**
\`\`\`
set dnsfilter-profile "DNS-Office-Standard"
set ips-sensor "default"
set application-list "default"
\`\`\`

**Outbreak Prevention (AV profile):**
- Suspicious files → FortiCloud sandbox
- Action: block if malicious score high
- Requires active FortiGuard license

**Incident response:**
1. UTM log shows botnet block from internal IP
2. Identify host: \`diagnose sys session filter src <ip>\`
3. EMS quarantine or VLAN isolation
4. Forensics on endpoint

**False positives:** rare for botnet category. If occurs — override specific signature with ticket.`,
    },
    {
      title: 'Video Filter: YouTube и streaming control',
      content: `**Video Filter** (Web Filter sub-feature) — control YouTube categories, Vimeo, streaming.

**Use cases SMB:**
- Block YouTube during business hours (productivity)
- Allow educational/training categories
- Guest: block all streaming (bandwidth)
- Meeting rooms: allow all (presentations)

**Setup:**
1. Security Profiles → Web Filter → edit profile
2. Enable Video Filter
3. YouTube: block categories (Entertainment, Gaming)
4. Action: block or monitor

**Schedule integration:**
- Policy with video-heavy profile → schedule business-hours only
- After hours → relaxed profile

**Limitations:** encrypted QUIC/DoH may bypass — combine with App Control (YouTube app ID).

**Alternative:** App Control block «Video/Audio» category + bandwidth shaping on Guest.`,
    },
    {
      title: 'DLP: обзор Data Loss Prevention',
      content: `**DLP** на FortiGate — detect/prevent sensitive data exfiltration (credit cards, PII, source code).

**DLP sensors detect:**
- Credit card numbers (Luhn check)
- SSN patterns
- Custom regex (project codenames)
- File fingerprint

**SMB reality:** DLP на FG — enterprise feature, moderate complexity. Many SMB use:
- Microsoft 365 DLP (email, SharePoint)
- Endpoint DLP (Symantec, Forcepoint)
- FG DLP for specific compliance (PCI)

**FG DLP setup (if needed):**
1. Security Profiles → DLP Profile → Create
2. Define sensors (credit-card, custom-regex)
3. Assign to policy: Users → Internet
4. Action: block + log + quarantine file

**Performance impact:** medium-high on SSL inspected traffic.

**Recommendation:** start with Web Filter + App Control + endpoint DLP. Add FG DLP when compliance requires network-level enforcement.`,
    },
    {
      title: 'Policy troubleshooting: flowchart (текст)',
      content: `**Flowchart «трафик blocked/не работает»:**

\`\`\`
START: User reports «не открывается сайт / нет доступа»
│
├─► [1] Ping destination IP работает?
│   ├─ NO → Routing problem
│   │   ├─ get router info routing-table all
│   │   ├─ Default route exists?
│   │   └─ Static route to subnet?
│   └─ YES → Continue
│
├─► [2] DNS resolves?
│   ├─ NO → DNS problem (DNS Filter block? DNS server down?)
│   │   ├─ execute nslookup domain
│   │   └─ Check DNS Filter logs
│   └─ YES → Continue
│
├─► [3] Policy Lookup (GUI simulate)
│   ├─ DENY policy matched → Fix policy or reorder
│   ├─ ALLOW but no NAT → Enable NAT on internet policy
│   └─ ALLOW → Continue
│
├─► [4] UTM block?
│   ├─ Check UTM logs (Web Filter, IPS, App Control, DNS)
│   ├─ Override signature or whitelist URL/app
│   └─ Temporarily disable profile to confirm
│
├─► [5] Flow debug (CLI)
│   diagnose debug flow filter addr <client-ip>
│   Look for: iprope_in_check failed = implicit deny
│
├─► [6] Session table
│   diagnose sys session filter src <client-ip>
│   Session exists but no reply? Asymmetric routing / server issue
│
└─► [7] Escalate: server-side firewall, app issue, ISP
END
\`\`\`

**Document:** print flowchart, keep at NOC desk.`,
    },
    {
      title: 'FortiOS 7.4 lab: политики и UTM на VM',
      content: `**Lab prerequisites:** FortiGate VM из Fundamentals lab (VLANs configured).

**Part 1 — Objects (30 min):**
1. Create all address objects (Servers, Users, Guest, DC, RFC1918)
2. Create service groups (AD-Services, Web)
3. Create address group GRP-Internal-All

**Part 2 — Policies (45 min):**
1. Implement rules 1–22 from annotated export (simplified: 10 rules minimum)
2. Verify ordering: deny Guest before allow Guest internet
3. Enable central SNAT or per-policy NAT
4. Add explicit deny-all at bottom with logging

**Part 3 — UTM (45 min):**
1. Clone AV, IPS, Web Filter, App Control, DNS Filter profiles
2. Assign to Users → Internet policy
3. Test: access blocked malware test URL (FortiGuard test page)
4. Test: Guest blocked from pinging DC

**Part 4 — Troubleshooting (30 min):**
1. Break policy order intentionally
2. Use Policy Lookup to diagnose
3. Flow debug from client IP
4. Fix and document root cause

**Verification checklist:**
- [ ] Guest → internet OK, Guest → DC FAIL
- [ ] Users → internet with UTM logs
- [ ] Explicit deny generates logs
- [ ] Policy matrix document updated`,
    },
    {
      title: 'Справочник diagnose/debug (Policies)',
      content: `**Policy-specific diagnostics:**

| Команда | Назначение |
|---------|------------|
| \`show firewall policy\` | List all policies |
| \`diagnose firewall iprope list\` | Policy kernel list |
| \`diagnose debug flow filter addr x.x.x.x\` | Trace packet |
| \`diagnose debug flow filter port 443\` | Filter by port |
| \`diagnose debug flow show function-name enable\` | Verbose |
| \`diagnose sys session list\` | Active sessions |
| \`diagnose sys session filter policy-id X\` | Sessions per policy |
| \`diagnose test application webfilter <url>\` | Test web filter |
| \`diagnose test application dnsfilter <domain>\` | Test DNS filter |
| \`diagnose ips anomaly list\` | IPS anomaly status |
| \`diagnose netlink interface list wan1\` | WAN bandwidth |

**UTM debug:**
\`\`\`
diagnose debug application urlfilter -1
diagnose debug enable
# browse URL
diagnose debug disable
\`\`\`

**Session clear (emergency):**
\`\`\`
diagnose sys session filter src <ip>
diagnose sys session clear
\`\`\``,
    },
    {
      title: 'Production case study 1: Guest Wi-Fi breach prevention',
      content: `**Клиент:** retail HQ, 60 employees + daily guest Wi-Fi.

**Incident (pre-FG):** guest on flat network accessed file server, ransomware spread.

**Solution:**
- FG-60F with strict Guest policies (rules 1–2 above)
- FortiAP Guest SSID → VLAN60, client isolation
- DNS Filter + Web Filter strict on Guest
- Explicit deny Guest → RFC1918 (logged)

**Validation:**
- External pen test: guest could not reach any internal host
- nmap from guest: all internal IPs timeout
- FortiAnalyzer: 400+ guest deny logs/week (normal)

**Policy lesson:** deny rules MUST be above allow internet for same source zone.`,
    },
    {
      title: 'Production case study 2: SSL inspection pilot',
      content: `**Клиент:** fintech startup, 40 users, compliance requires HTTPS inspection.

**Challenge:** full SSL inspection broke banking apps, Google Workspace issues.

**Approach:**
1. Week 1: deploy FG CA via Intune to all laptops
2. Week 2: certificate inspection only (no deep)
3. Week 3: deep inspection on Guest + new users subset (10)
4. Week 4: expand to all except exempt list (banking, medical)

**Exempt list:** FortiGuard exempt + custom banking domains.

**Results:**
- IPS blocked 3 exploit attempts in HTTPS traffic (would miss without inspection)
- CPU: 45% average (FG-100F)
- User complaints: 2 (fixed via exempt)
- Compliance audit: passed

**Key policy:** separate SSL profile per user group, not one-size-fits-all.`,
    },
    {
      title: 'Production case study 3: Geo block stopped WAN scan',
      content: `**Клиент:** SaaS company, public VIP for status page only.

**Problem:** 50K+ inbound scan attempts/day from high-risk countries.

**Solution:**
- POL-DENY-WAN-GeoBlock: deny inbound from CN, KP, IR, etc.
- VIP allow: only Cloudflare IP ranges (if proxied) or US/EU
- Rate limiting on SSL-VPN

**Results:**
- Inbound deny logs: -78% volume
- FG CPU: -15% (less traffic to process)
- False positives: 1 (contractor in blocked country → VPN exception)

**Policy tip:** geo block on inbound only; don't block outbound unless compliance requires.`,
    },
    {
      title: 'FAQ: 12 частых вопросов (Policies)',
      content: `**1. Implicit deny логируется?**
По умолчанию нет. Добавь explicit deny-all с logging.

**2. NAT на internal policies?**
Обычно нет. NAT только internet-bound.

**3. ALL service в production?**
Избегай. Principle of least privilege.

**4. Policy order после clone?**
Clone добавляет в конец — reorder manually.

**5. VIP без policy?**
VIP alone не открывает доступ — нужна firewall policy.

**6. DNS Filter vs Web Filter?**
DNS = domain level. Web = URL/category. Используй оба.

**7. SSL inspection обязателен?**
Нет для SMB. Certificate inspection + DNS часто достаточно.

**8. Central SNAT vs policy NAT?**
Policy NAT проще для SMB. Central SNAT для complex multi-IP.

**9. Как найти unused policy?**
FortiAnalyzer: policy hit count report (0 hits 90 days).

**10. Geo block ломает CDN?**
Да, если VIP direct. Use Cloudflare in front.

**11. ZTNA заменит VPN policies?**
Постепенно. Coexist 1–2 years typical.

**12. DLP на FG для PCI?**
Possible but heavy. Often M365 DLP + FG network controls.`,
    },
    {
      title: 'NSE4 exam topics: mapping (Policies)',
      content: `| NSE4 Domain | This chapter topics | Weight |
|-------------|---------------------|--------|
| **Firewall policies** | Ordering, objects, NAT, VIP | ~25% |
| **Security profiles** | AV, IPS, Web, App, DNS, SSL | ~25% |
| **NAT** | SNAT, DNAT, VIP, IP pools | ~10% |
| **Troubleshooting** | Flow debug, Policy Lookup | ~10% |
| **User authentication** | FSSO basics (in VPN ch.) | ~5% |

**Exam lab tasks likely:**
- Create policy with UTM profiles
- Configure VIP port forward
- Reorder policies correctly
- Troubleshoot with flow debug

**Study focus:** policy ordering scenarios, difference SNAT/VIP, when to use which UTM profile.`,
    },
    {
      title: 'Interview Q&A: 10 вопросов (Policies)',
      content: `**Q1: First matching policy or last?**
A: First match top-to-bottom. Order is critical.

**Q2: Difference VIP vs SNAT?**
A: VIP = inbound DNAT (public→internal). SNAT = outbound masquerade.

**Q3: Guest isolation minimum rules?**
A: Deny Guest→Internal above Allow Guest→Internet.

**Q4: When SSL deep inspection?**
A: When compliance requires content inspect; pilot with exempt list.

**Q5: DNS Filter value without SSL inspection?**
A: Blocks malicious domains at DNS layer — high value, low cost.

**Q6: Implicit vs explicit deny?**
A: Implicit = silent drop. Explicit = logged deny for audit.

**Q7: How test policy without client?**
A: Policy Lookup GUI or diagnose debug flow.

**Q8: UTM on internal traffic?**
A: Optional IPS only. Full UTM typically internet-bound.

**Q9: What is central SNAT?**
A: Separate SNAT table independent of policy NAT flag.

**Q10: Policy hit count zero — delete?**
A: Verify 90 days, check for DR/failover use, then disable and monitor.`,
    },
    {
      title: 'Security Rating: hardening политик',
      content: `**Policy-related Security Rating findings:**

| Finding | Fix |
|---------|-----|
| Any-any allow rule | Replace with specific src/dst/service |
| No deny-all logged | Add POL-DENY-Explicit-Log last |
| Policies without logging | Enable log on internet/deny policies |
| ALL service on WAN inbound | Restrict to required ports |
| No UTM on internet egress | Enable AV+IPS+DNS minimum |
| VIP RDP/SSH to WAN | Remove; use VPN |
| Unused policies enabled | Disable after hit count review |
| No DNS Filter | Add to all internet policies |
| Weak Web Filter profile | Block malicious/phishing categories |
| SSL inspection disabled globally | Enable certificate inspection minimum |

**Monthly audit script:**
\`\`\`
show firewall policy | grep -E "ALL|any.*any"
\`\`\`

**Target:** zero any-any allow rules in production.`,
    },

    {
      title: 'Policy matrix и документация',
      content: `**Policy matrix** — таблица «кто → куда → что разрешено». Обязательный документ для SMB IT.

**Формат:**

| # | Source VLAN | Dest VLAN | Ports/Services | NAT | UTM | Action | Policy ID |
|---|-------------|-----------|----------------|-----|-----|--------|-----------|
| 1 | Guest | Internal | ALL | - | - | DENY | POL-001 |
| 2 | Mgmt | FortiGate | 443,22 | - | - | ALLOW | POL-002 |
| 3 | Users | Servers | AD,SMB | - | IPS | ALLOW | POL-003 |
| 4 | Users | Internet | ALL | YES | Full | ALLOW | POL-005 |
| 5 | Any | Any | ALL | - | - | DENY | POL-099 |

**Change management:** любое изменение policy → ticket → backup → change → verify → update matrix.

**Quarterly review:** удаляй unused policies, verify ordering, check for «ANY-ANY» rules, audit logging coverage.

**Export:** \`show firewall policy\` → save. Diff с предыдущей версией при audit.`,
    },
  ],
  practice: [
    'Создай 10+ address objects и 3 address groups для типового офиса',
    'Реализуй 22 firewall policies по annotated export (minimum 12 в lab)',
    'Настрой central SNAT / per-policy NAT для internet access',
    'Создай VIP для HTTPS → internal server, затем замени на VPN-only access',
    'Клонируй UTM profiles: AV, IPS, Web Filter, App Control — назначь на user policy',
    'Включи DNS Filter и Botnet block на всех internet policies',
    'Настрой Geo IP block на inbound WAN policies',
    'Pilot SSL Deep Inspection: deploy CA via GPO, тест на 5 users',
    'Policy Lookup: симулируй «workstation → DC port 389» — какая policy match',
    'Flow debug: объясни почему Guest не может пинговать DC (пошаговый output)',
    'Создай policy matrix Excel/MD для офиса 50 человек',
    'Quarterly audit: найди и исправь «ALL service» policies — замени на specific ports',
    'Настрой Video Filter: block YouTube Entertainment в business hours',
    'FortiOS 7.4 lab: полный policy+UTM lab на VM (VMware/KVM/ESXi)',
    'Security Rating: fix all policy-related Critical/High findings',
  ],
  resources: [
    { title: 'FortiGate 7.4 Firewall Policy Guide', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/656084/firewall-policy' },
    { title: 'FortiGate Security Profiles', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/777334/security-profiles' },
    { title: 'FortiGate NAT and VIP', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/583020/nat' },
    { title: 'FortiGate SSL Inspection', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/709132/ssl-inspection' },
    { title: 'FortiGate ZTNA Guide', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/944023/ztna' },
    { title: 'FortiGate DNS Filter', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/572589/dns-filter' },
    { title: 'FortiGate DLP', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/896744/data-leak-prevention-dlp' },
    { title: 'FortiGuard Outbreak Prevention', url: 'https://www.fortinet.com/support/fortiguard' },
  ],
}
