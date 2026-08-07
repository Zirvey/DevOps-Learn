import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'FortiGate - Policies, NAT and UTM',
  duration: '12–14 hours',
  description:
    'Firewall policies, ordering, NAT, VIP, UTM profiles, SSL inspection, application control, Geo IP – production SMB office',
  sections: [
    {
      title: 'Firewall policy model in FortiOS 7.4',
      content: `**Firewall policy** is the central traffic control mechanism on FortiGate. Each flow (connection) is checked against an ordered list of policies **from top to bottom**. The first match determines the action.

**Policy fields (5-tuple + extensions):**

| Field | Description | SMB Example |
|------|----------|------------|
| **Incoming Interface/Zone** | Where did the package come from | VLAN20-Workstations |
| **Outgoing Interface / Zone** | Where does it go | wan1 / WAN zone |
| **Source** | Address object / FQDN / geography | ADDR-Workstations |
| **Destination** | Address / FQDN / VIP | all, ADDR-DC |
| **Service** | TCP/UDP ports | HTTPS, SMB, ALL |
| **Schedule** | Action time | always, business-hours |
| **Action** | ACCEPT, DENY, IPSEC | ACCEPT |
| **NAT** | Source NAT (masquerade) | Enable for internet |
| **Security Profiles** | UTM inspection | AV, IPS, Web Filter |
| **Log** | Traffic log | All sessions / security events |

**Stateful inspection:** FortiGate monitors the state of TCP/UDP sessions. Return traffic is automatically allowed if the forward flow was accepted (no need for a separate reverse policy for stateful traffic).

**Implicit deny:** if no policy matches, the traffic is **discarded** without a log (default). Add explicit deny-all at the end with logging for auditing.

**GUI:** Policy & Objects → Firewall Policy → Create New.`,
    },
    {
      title: 'Policy ordering: order is everything',
      content: `**Golden rule:** specific policies are **higher**, general policies are **lower**. Deny - **higher** allow for the same traffic class.

**Recommended procedure for SMB office:**

\\\`\\\`\\\`
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
\\\`\\\`\\\`

**Typical ordering errors:**
- “Allow all” policy at the top of the list → everything else is useless
- Guest allow internet **before** guest deny internal → guest sees servers
- Duplicate policies with different profiles → confusion in troubleshooting

**Policy ID:** FortiGate assigns a sequence number. Reorder: GUI drag-and-drop or \\\`move <id> before <id>\\\`.

**Naming convention:** \\\`POL-DENY-Guest-Internal\\\`, \\\`POL-ALLOW-Users-Internet\\\` - facilitates audit and Policy Lookup.

**Tags (labels):** Policy & Objects → add tag “Production”, “Guest”, “VPN” for filtering in the GUI.`,
    },
    {
      title: 'Address objects and address groups',
      content: `Don't use raw IP in policies - create **address objects** for readability and reuse.

**Types of address objects:**

| Type | Example | When |
|-----|--------|-------|
| **Subnet** | 192.168.20.0/24 | VLAN subnets |
| **IP Range** | 192.168.10.50-192.168.10.60 | DHCP reservations |
| **FQDN** | updates.microsoft.com | Dynamic cloud services |
| **Geography** | Russia, China | Geo blocking |
| **Device (MAC)** | AA:BB:CC:DD:EE:FF | IoT, BYOD |

**Address Groups:** union of objects. \\\`GRP-Internal-All\\\` = VLAN10 + VLAN20 + VLAN30.

**Recommended objects for SMB:**

\\\`\\\`\\\`
ADDR-Servers       192.168.10.0/24
ADDR-Workstations  192.168.20.0/24
ADDR-VoIP          192.168.30.0/24
ADDR-Guest         192.168.60.0/24
ADDR-Mgmt          192.168.99.0/24
ADDR-RFC1918       10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
ADDR-DC            192.168.10.10, 192.168.10.11
\\\`\\\`\\\`

**GUI:** Policy & Objects → Addresses → Create New.

**Fabric Connector addresses:** EMS tags, FSSO users - dynamic groups from Security Fabric.`,
      code: {
        language: 'text',
        caption: 'CLI: address objects and group',
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
      title: 'Service objects and custom ports',
      content: `**Service objects** define the protocol and ports. Built-in services: HTTP (80), HTTPS (443), SMB (445), LDAP (389), DNS (53).

**Custom service** - when a non-standard port is needed:
- App server: TCP 8443
- Custom ERP: TCP 5000-5010
- Monitoring: TCP 9100 (Prometheus node exporter - internal only!)

**Service Groups:** \\\`SVC-Web\\\` = HTTP + HTTPS. \\\`SVC-AD\\\` = LDAP + LDAP-GC + Kerberos + DNS.

**SMB Rule:** principle of least privilege - do not use \\\`ALL\\\` in production policies. Specify specific services:

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
      title: 'Schedules, logging and policy tags',
      content: `**Schedules** limit the action of the policy by time:
- \\\`always\\\` — 24/7 (default)
- \\\`business-hours\\\` — Mon–Fri 08:00–19:00
- \\\`night-patch-window\\\` — Sun 02:00–06:00 for server patching

**Use case:** servers → internet allow only in the patch window. Guest internet - business hours only (optional).

**Logging options per policy:**

| Setting | When to turn on |
|---------|---------------|
| **Disable** | High-volume trusted internal flows |
| **Security Events** | UTM-related policies |
| **All Sessions** | Internet egress, Guest, VPN (for audit) |

**Attention:** log all sessions for 50 users × full internet = **huge** volume. On FG-60F use selective logging: all sessions on Guest/VPN/deny, security events on UTM policies.

**Log forwarding:** Log & Report → Log Settings → Send to FortiAnalyzer / syslog.

**Policy tags:** group by function - “Internet”, “Internal”, “Deny”, “VPN”.`,
    },
    {
      title: 'Typical SMB office policies',
      content: `**Full set of policies** for office ~50 people (5 VLAN + VPN).

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
- Service: SVC-AD, SMB, RDP (if enabled)
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
        caption: 'CLI: policy Users → Internet with UTM',
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
      title: 'Guest Wi-Fi Isolation',
      content: `**Guest network** is the most attacked segment. Users are not trusted, devices are not managed.

**Mandatory measures:**
1. Separate VLAN (60) with /24 subnet
2. **Deny policy** Guest → ALL RFC1918 (above allow internet)
3. Client isolation on FortiAP (can’t see each other)
4. Captive portal (optional) - Terms of Use
5. Bandwidth limit per client (FortiAP traffic shaping)
6. DNS Filter + Web Filter (block malware, adult)
7. Short DHCP lease (4h)
8. No SSL inspection (privacy + performance)

**Check:** with Guest client:
- ping 8.8.8.8 → OK
- ping 192.168.10.10 (DC) → FAIL
- traceroute to internal → blocked at FG
- nmap internal subnet → timeout

**DNS leak test:** Guest should not resolve internal zone names (split DNS on FG: Guest → public DNS only).

**FortiAP setting:** WiFi & Switch Controller → SSID Guest → VLAN 60, Security Mode Captive Portal (optional).`,
    },
    {
      title: 'Central SNAT and IP pools',
      content: `**Source NAT (SNAT)** - replacing internal IP with WAN IP when accessing the internet. Without NAT, private IP is not routed to the internet.

**FortiOS 7.4 modes:**
- **Use Outgoing Interface Address** — default, WAN IP as source (simplest)
- **Use Dynamic IP Pool** - several public IPs, round-robin
- **Central SNAT table** - separate table SNAT rules (advanced, policy-independent)

**SMB default:** NAT enabled per-policy → outgoing interface address. Sufficient for 95% of cases.

**IP Pool** - when the ISP has several public IPs:
- Servers outbound via dedicated IP (for whitelist on SaaS)
- User traffic via another IP

**Central SNAT** (Policy & Objects → Central SNAT):
- Policy 1: Servers → pool «Public-IP-2»
- Policy 2: Users → pool «Public-IP-1»

**Don’t be confused:** SNAT (outbound masquerade) vs VIP/DNAT (inbound port forward).`,
      code: {
        language: 'text',
        caption: 'CLI: IP pool and central SNAT',
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
      title: 'VIP (Virtual IP) and DNAT port forwarding',
      content: `**VIP (Virtual IP)** — mapping public IP:port → internal IP:port. Used for inbound services: web server, mail, RDP (not recommended).

**VIP structure:**
- External IP: 203.0.113.10 (WAN IP)
- External port: 443
- Mapped IP: 192.168.10.50 (internal server)
- Mapped port: 443
- Interface: wan1

**Firewall policy for VIP:** separate policy Incoming wan1 → internal, destination = VIP object, action accept.

**SMB Security Recommendations:**
- **Minimize** port forwarding. Every open port = attack surface
- RDP/SSH on WAN → **prohibited**. Use SSL-VPN
- Web services → Cloudflare proxy / AWS ALB instead of direct VIP
- If VIP is required → IPS + Geo block + rate limiting + restrict source

**Alternatives to VIP:**
- SSL-VPN for remote admin access
- Cloudflare Tunnel for internal web apps
- Site-to-site IPsec for B2B integration`,
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
      content: `**Static NAT** — 1:1 mapping public IP ↔ private IP (all ports). Less commonly VIP, used for:
- Dedicated public IP for mail server
- Legacy application requiring fixed public IP
- SIP trunk with fixed source IP

**On FortiGate:** VIP type = Static NAT (no port forward), or IP pool + policy.

**Risks:** entire port range exposed. For SMB - **avoid** static NAT, prefer VIP with specific ports.

**Outbound static:** internal server always exits with a specific public IP (via IP pool) - safer, use whitelisting for SaaS.`,
    },
    {
      title: 'Security Profiles: UTM overview',
      content: `**UTM (Unified Threat Management)** is a set of security profiles applied to accepted traffic in the firewall policy.

| Profile | Function | Impact on performance |
|---------|---------|----------------------|
| **Antivirus** | Scan files in HTTP/FTP/IMAP | Medium |
| **IPS** | Block exploits by signatures | Medium-High |
| **Web Filter** | URL category blocking | Low-Medium |
| **Application Control** | Identify & block apps (Telegram, torrents) | Medium |
| **DNS Filter** | Block malicious domains | Low |
| **SSL/SSH Inspection** | Decrypt HTTPS for inspection | **High** |
| **DLP** | Data loss prevention | Medium (enterprise) |

**Profile groups:** Security Profiles → Profile Groups → combine AV+IPS+WebFilter into “UTM-Standard”, assign with one button.

**SMB recommendation for tiers:**

| Traffic | Profiles |
|---------|----------|
| Users → Internet | AV + IPS + Web Filter + App Control + DNS Filter |
| Guest → Internet | Web Filter (strict) + DNS Filter |
| Internal (user→server) | IPS only (optional) |
| Servers → Internet | AV + IPS |
| VPN users → Internet | Full UTM (full tunnel) |

**GUI:** Security Profiles → each type → Edit → Clone for custom profiles.`,
    },
    {
      title: 'Antivirus and IPS profiles',
      content: `**Antivirus Profile:**
- Scan protocols: HTTP, SMTP, POP3, IMAP, FTP, SMB
- Action: block infected files, quarantine
- Outbreak Prevention: cloud sandbox check (FortiGuard license)
- **SMB:** enable HTTP + SMB scan. Email scan - if FG inline (rarely, usually on mail gateway)

**IPS Profile:**
- Signature database: 20K+ rules
- Severity filter: block Critical, High, Medium; monitor Low
- Override signatures for false positives
- **SMB:** default IPS sensor + add exceptions for legacy apps

**False positives:** legacy ERP, custom apps can trigger IPS. Workflow:
1. Identify signature ID in log
2. IPS → Edit profile → Override → action “monitor” for a specific signature
3. exception Document with ticket ID

**Do not disable IPS entirely** “because it interferes” - point exceptions.`,
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
      title: 'Web Filter and DNS Filter',
      content: `**Web Filter** - HTTP/HTTPS filtering by URL categories (90+ FortiGuard categories).

**Recommended categories for block (office):**
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

**HTTPS without SSL inspection:** Web Filter works via SNI/URL in cleartext + DNS. **With SSL inspection** - full URL path visible.

**DNS Filter:**
- Block malicious domains at DNS level
- Works even without SSL inspection
- FortiGate as DNS proxy or transparent DNS inspection
- **Recommendation:** enable DNS Filter for **everyone** internet policies — low cost, high value

**Safe Search:** force Google/Bing safe search for Guest VLAN.

**GUI:** Security Profiles → Web Filter / DNS Filter → Create or Clone default.`,
    },
    {
      title: 'Application Control',
      content: `**Application Control** identifies applications (not only ports) - Telegram, WhatsApp, BitTorrent, Tor, gaming.

**Categories for SMB office block:**
- P2P (BitTorrent, eMule)
- Proxy / Tunnel (Ultrasurf, Psiphon)
- Botnet
- Gaming (optional, according to HR policy)
- Instant Messaging (optional — block Telegram desktop, allow web)

**Action types:**
- **Block** — deny connection
- **Monitor** — log only (pilot phase)
- **Allow** — explicit permit (for whitelist approach)

**Deployment workflow:**
1. Week 1: Monitor all → analyze FortiAnalyzer reports
2. Week 2: Block P2P, Tor, known proxies
3. Week 3+: Fine-tune by feedback

**Don't block everything** - Teams, Zoom, Slack should be allowed. Check out the “Collaboration” category.

**Performance:** App Control uses DPI. On FG-60F with 500 Mbps - usually OK. If there are problems, exclude speedtest servers.`,
      code: {
        language: 'text',
        caption: 'CLI: application list with block P2P',
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
      content: `**Problem:** 95%+ internet traffic is HTTPS. Without decryption, UTM sees only IP and SNI, not content.

**SSL Inspection** - FortiGate as MITM proxy: decrypt → inspect → re-encrypt. Corporate CA certificate is installed on all endpoints.

**Modes:**
- **Deep Inspection** — all HTTPS (maximum security, maximum breakage)
- **Certificate Inspection** - only metadata, without full decrypt
- **No Inspection** — bypass

**Requirements for Deep Inspection:**
1. Generate/Import CA: System → Certificates → Create CA
2. Deploy CA cert to all PCs via GPO (Windows) / MDM (macOS)
3. SSL/SSH Profile: Security Profiles → SSL/SSH Inspection → deep-inspection
4. Exceptions: banking, government, health apps (FortiGuard exempt list + custom)

**Legal aspect:** employee consent to inspection (HR policy, AUP).

**SMB practice 2026:**
- Full deep inspection - rarely (breakage, performance, privacy)
- **Certificate inspection + DNS Filter + endpoint EDR** — pragmatic balance
- Deep inspection for Guest - not necessary (no corporate CA)
- Deep inspection for Users → Internet — pilot to subset, expand gradually

**Performance impact:** FG-60F throughput with full SSL inspection can drop to 200-300 Mbps. Plan accordingly.`,
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
      content: `**Geography-based filtering** — block/allow traffic by country IP ranges. FortiGuard GeoIP database.

**Use cases SMB:**
- Block inbound from high-risk countries (if there is no business there)
- Block outbound to sanctioned countries
- VPN brute-force mitigation: block WAN admin/VPN from non-RU IPs (if all employees are in Russia)
- VIP protection: allow HTTPS only from specific countries

**Address object type Geography:**
- Policy & Objects → Addresses → Create → Geography → Russia, Kazakhstan, etc.

**Inbound policy example:**
- WAN → VIP: source = Russia + CIS only, deny rest
- WAN → SSL-VPN: source geography = office countries

**Caution:**
- CDN (Cloudflare) - source IP is not a real client
- Remote employees abroad — block their country = lockout
- GeoIP database is not 100% accurate

**GUI:** Policy & Objects → Addresses → Type: Geography.`,
      code: {
        language: 'text',
        caption: 'CLI: geo block inbound on WAN',
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
      title: 'Policy Lookup and Flow Debug',
      content: `**Policy Lookup (GUI):** Policy & Objects → Policy Lookup → simulate packet:
- Source IP, Dest IP, Port, Protocol, Interface
- Result: matching policy ID, action, NAT, profiles

**Use first** for “why blocked/allowed”.

**Flow Debug (CLI)** — real-time packet tracing:

1. \\\`diagnose debug reset\\\` — clear state
2. \\\`diagnose debug flow filter addr x.x.x.x\\\` — filter by IP
3. \\\`diagnose debug flow show function-name enable\\\` — verbose
4. \\\`diagnose debug enable\\\` — start
5. Reproduce traffic
6. \\\`diagnose debug disable\\\` — stop (required!)

**What to look for in output:**
- \\\`find a route\\\` — routing decision
- \\\`allowed by policy X\\\` — matching policy
- \\\`denied by policy X\\\` — blocked
- \\\`NAT\\\` — source translation
- \\\`iprope_in_check() check failed\\\` — implicit deny

**Session table:** \\\`diagnose sys session list\\\` — active connections. Filter: \\\`diagnose sys session filter src <ip>\\\`.`,
      code: {
        language: 'text',
        caption: 'Flow debug: full cycle',
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
      title: 'Implicit deny, logging and compliance',
      content: `**Implicit deny** — traffic without a matching policy is silently rejected. This is a problem for security audits: it is not clear what is being blocked.

**Explicit deny-all policy (recommendation):**
- Source: all | Dest: all | Service: ALL
- Action: DENY
- Log: All sessions
- Position: **last** in the list
- Name: POL-DENY-Explicit-Log

**Compliance logging:**
- PCI DSS: log all access to cardholder data network
- ISO 27001: audit trail for security events
- Retention: FortiAnalyzer 90+ days

**Log settings:** Policy & Objects → Firewall Policy → per-policy log. + Log & Report → Log Settings → global options.

**FortiAnalyzer reports:** Top blocked destinations, policy violations, UTM blocks - weekly review.`,
    },
    {
      title: 'Performance: ASIC offload and UTM impact',
      content: `FortiGate uses **NP6/NP7 ASIC** for hardware acceleration. Not all traffic is offloadable.

**What will be offloaded (without UTM):**
- Simple routing/NAT between interfaces
- IPsec VPN (with right config)
- Session setup at wire speed

**What will NOT be offloaded:**
- Traffic with UTM profiles (AV, IPS, App Control)
- SSL Deep Inspection
- Complex ACL matching

**NP offload check:** \\\`diagnose npu np6 port-list\\\`, \\\`get hardware npu np6 port-list\\\`

**SMB Optimization:**
- UTM only on internet-bound policies
- Internal traffic — no profiles (or IPS only)
- SSL inspection selective, not blanket
- Log «all sessions» only where needed
- Session TTL tuning for long-lived connections

**If FG-60F bottleneck:** upgrade to FG-100F, reduce UTM scope, or add second WAN with SD-WAN load distribution.`,
    },
    {
      title: 'Complete export office policies: 22 rules with annotations',
      content: `**Production policy set** for an office of 50 people. Each rule has name, purpose, log level.

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

**Export:** \\\`show firewall policy\\\` → save as \\\`fg-policies-$(date).conf\\\`. Diff with every change.`,
      code: {
        language: 'text',
        caption: 'CLI: export all policies',
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
      title: 'ZTNA: Introduction to FortiGate SMB',
      content: `**ZTNA (Zero Trust Network Access)** - access to applications by identity + posture, not by network location.

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
      title: 'Explicit proxy: when and how to configure',
      content: `**Explicit proxy** - clients forward HTTP/HTTPS to FortiGate proxy port (8080/8443) instead of transparent inspection.

**When to use:**
- Legacy apps requiring proxy config
- Granular URL logging without full SSL inspection
- Guest network with proxy authentication
- Compliance: user-level web access audit

**When NOT to use (SMB default):**
- Transparent UTM (Web Filter + DNS Filter) easier
- Modern apps bypass proxy settings
- SSL inspection profile is sufficient

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
      title: 'DNS Filter: advanced settings',
      content: `**DNS Filter** blocks malicious domains at the DNS level - it works even without SSL inspection.

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
\\\`\\\`\\\`
set dnsfilter-profile "DNS-Office-Standard"
\\\`\\\`\\\`

**Guest vs Users:**
- Users: standard block list
- Guest: strict + safe search enforced

**Logging:** DNS Filter blocks appear in UTM log → FortiAnalyzer DNS report.

**Test:** \\\`execute nslookup malware.testcategory.com\\\` from client → should block/redirect.

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
      title: 'Botnet C&C and Outbreak Prevention',
      content: `**Botnet C&C blocking** — FortiGuard real-time block of command-and-control servers.

**Layers:**
1. **DNS Filter:** block C&C domain resolution
2. **IPS:** block C&C IP signatures
3. **Application Control:** block botnet category apps
4. **Outbreak Prevention:** cloud sandbox unknown files

**Enable on all internet policies:**
\\\`\\\`\\\`
set dnsfilter-profile "DNS-Office-Standard"
set ips-sensor "default"
set application-list "default"
\\\`\\\`\\\`

**Outbreak Prevention (AV profile):**
- Suspicious files → FortiCloud sandbox
- Action: block if malicious score high
- Requires active FortiGuard license

**Incident response:**
1. UTM log shows botnet block from internal IP
2. Identify host: \\\`diagnose sys session filter src <ip>\\\`
3. EMS quarantine or VLAN isolation
4. Forensics on endpoint

**False positives:** rare for botnet category. If occurs — override specific signature with ticket.`,
    },
    {
      title: 'Video Filter: YouTube and streaming control',
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
      title: 'DLP: Data Loss Prevention Review',
      content: `**DLP** on FortiGate - detect/prevent sensitive data exfiltration (credit cards, PII, source code).

**DLP sensors detect:**
- Credit card numbers (Luhn check)
- SSN patterns
- Custom regex (project codenames)
- File fingerprint

**SMB reality:** DLP on FG - enterprise feature, moderate complexity. Many SMB use:
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
      title: 'Policy troubleshooting: flowchart (text)',
      content: `**Flowchart “traffic blocked/not working”:**

\\\`\\\`\\\`
START: User reports “the site does not open / no access”
│
├─► [1] Ping destination IP working?
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
\\\`\\\`\\\`

**Document:** print flowchart, keep at NOC desk.`,
    },
    {
      title: 'FortiOS 7.4 lab: policies and UTM on VM',
      content: `**Lab prerequisites:** FortiGate VM from Fundamentals lab (VLANs configured).

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
      title: 'Directory diagnose/debug (Policies)',
      content: `**Policy-specific diagnostics:**

| Team | Destination |
|---------|------------|
| \\\`show firewall policy\\\` | List all policies |
| \\\`diagnose firewall iprope list\\\` | Policy kernel list |
| \\\`diagnose debug flow filter addr x.x.x.x\\\` | Trace packet |
| \\\`diagnose debug flow filter port 443\\\` | Filter by port |
| \\\`diagnose debug flow show function-name enable\\\` | Verbose |
| \\\`diagnose sys session list\\\` | Active sessions |
| \\\`diagnose sys session filter policy-id X\\\` | Sessions per policy |
| \\\`diagnose test application webfilter <url>\\\` | Test web filter |
| \\\`diagnose test application dnsfilter <domain>\\\` | Test DNS filter |
| \\\`diagnose ips anomaly list\\\` | IPS anomaly status |
| \\\`diagnose netlink interface list wan1\\\` | WAN bandwidth |

**UTM debug:**
\\\`\\\`\\\`
diagnose debug application urlfilter -1
diagnose debug enable
# browse URL
diagnose debug disable
\\\`\\\`\\\`

**Session clear (emergency):**
\\\`\\\`\\\`
diagnose sys session filter src <ip>
diagnose sys session clear
\\\`\\\`\\\``,
    },
    {
      title: 'Production case study 1: Guest Wi-Fi breach prevention',
      content: `**Client:** retail HQ, 60 employees + daily guest Wi-Fi.

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
      content: `**Client:** fintech startup, 40 users, compliance requires HTTPS inspection.

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
      content: `**Client:** SaaS company, public VIP for status page only.

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
      title: 'FAQ: 12 frequently asked questions (Policies)',
      content: `**1. Is Implicit deny logged?**
The default is no. Add explicit deny-all with logging.

**2. NAT on internal policies?**
Usually not. NAT is internet-bound only.

**3. ALL service in production?**
Avoid. Principle of least privilege.

**4. Policy order after clone?**
Clone adds at the end - reorder manually.

**5. VIP without policy?**
VIP alone does not provide access - you need a firewall policy.

**6. DNS Filter vs Web Filter?**
DNS = domain level. Web = URL/category. Use both.

**7. Is SSL inspection required?**
No for SMB. Certificate inspection + DNS is often sufficient.

**8. Central SNAT vs policy NAT?**
Policy NAT is easier for SMB. Central SNAT for complex multi-IP.

**9. How to find unused policy?**
FortiAnalyzer: policy hit count report (0 hits 90 days).

**10. Geo block breaks CDN?**
Yes, if VIP direct. Use Cloudflare in front.

**11. Will ZTNA replace VPN policies?**
Gradually. Coexist 1–2 years typical.

**12. DLP on FG for PCI?**
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
      title: 'Interview Q&A: 10 Questions (Policies)',
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
      title: 'Security Rating: hardening policy',
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
\\\`\\\`\\\`
show firewall policy | grep -E "ALL|any.*any"
\\\`\\\`\\\`

**Target:** zero any-any allow rules in production.`,
    },
    {
      title: 'Policy matrix and documentation',
      content: `**Policy matrix** - table “who → where → what is allowed.” Mandatory document for SMB IT.

**Format:**

| # | Source VLAN | Dest VLAN | Ports/Services | NAT | UTM | Action | Policy ID |
|---|-------------|-----------|----------------|-----|-----|--------|-----------|
| 1 | Guest | Internal | ALL | - | - | DENY | POL-001 |
| 2 | Mgmt | FortiGate | 443,22 | - | - | ALLOW | POL-002 |
| 3 | Users | Servers | AD,SMB | - | IPS | ALLOW | POL-003 |
| 4 | Users | Internet | ALL | YES | Full | ALLOW | POL-005 |
| 5 | Any | Any | ALL | - | - | DENY | POL-099 |

**Change management:** any change policy → ticket → backup → change → verify → update matrix.

**Quarterly review:** remove unused policies, verify ordering, check for “ANY-ANY” rules, audit logging coverage.

**Export:** \\\`show firewall policy\\\` → save. Diff with previous version during audit.`,
    },
  ],
  practice: [
    'Create 10+ address objects and 3 address groups for a typical office',
    'Implement 22 firewall policies by annotated export (minimum 12 in lab)',
    'Setting up central SNAT / per-policy NAT for internet access',
    'Create a VIP for HTTPS → internal server, then replace it with VPN-only access',
    'Clone UTM profiles: AV, IPS, Web Filter, App Control - assign to user policy',
    'Enable DNS Filter and Botnet block on all internet policies',
    'Setting up Geo IP block on inbound WAN policies',
    'Pilot SSL Deep Inspection: deploy CA via GPO, test for 5 users',
    'Policy Lookup: simulate “workstation → DC port 389” - which policy match',
    'Flow debug: explain why Guest can\'t ping DC (step-by-step output)',
    'Create a policy matrix Excel/MD for an office of 50 people',
    'Quarterly audit: find and fix “ALL service” policies - replace with specific ports',
    'Video Filter setting: block YouTube Entertainment in business hours',
    'FortiOS 7.4 lab: full policy+UTM lab on VM (VMware/KVM/ESXi)',
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
  quiz: [
    {
      question: 'Firewall policy on FortiGate is processed:',
      options: ['Top to bottom, first match', 'Accidentally', 'Bottom up only'],
      answer: 'Top to bottom, first match',
    },
    {
      question: 'Guest VLAN policy should:',
      options: ['Block RFC1918, allow WAN', 'Allow everything', 'Block WAN'],
      answer: 'Block RFC1918, allow WAN',
    },
    {
      question: 'SNAT is needed for:',
      options: ['Connection of internal networks to the Internet', 'Stamps', 'AD replication only'],
      answer: 'Connection of internal networks to the Internet',
    },
    {
      question: 'SSL Deep Inspection requires:',
      options: ['Corporate CA on clients (GPO)', 'Nothing', 'HTTPS Disables'],
      answer: 'Corporate CA on clients (GPO)',
    },
    {
      question: 'Flow debug is used for:',
      options: ['Diagnosing why traffic is blocked', 'Windows settings', 'Stamps'],
      answer: 'Diagnosing why traffic is blocked',
    },
    {
      question: 'VIP on FortiGate is:',
      options: ['Port forwarding / DNAT', 'VLAN ID', 'VPN user'],
      answer: 'Port forwarding / DNAT',
    },
    {
      question: 'Implicit deny on FortiGate means:',
      options: ['Traffic without a matching policy is blocked', 'Everything allowed by default', 'Only UDP is blocked', 'Guest VLAN is open'],
      answer: 'Traffic without a matching policy is blocked',
    },
    {
      question: 'Application Control in a policy allows:',
      options: ['Allowing/blocking by application, not just port', 'Only changing DNS', 'Only AD join', 'Only printing'],
      answer: 'Allowing/blocking by application, not just port',
    },
    {
      question: 'CLI for tracing why traffic is blocked:',
      options: [
        'diagnose debug flow (or diagnose firewall iprope lookup)',
        'get system status',
        'execute ping-options',
        'config system interface',
      ],
      answer: 'diagnose debug flow (or diagnose firewall iprope lookup)',
    },
    {
      question: 'Log Allowed Traffic in a policy is needed for:',
      options: ['Auditing and troubleshooting allowed sessions', 'Increasing throughput', 'Disabling UTM', 'Changing VLAN'],
      answer: 'Auditing and troubleshooting allowed sessions',
      explanation: 'All Sessions — lots of logs; enable selectively on test policies.',
    },
  ],
}

export default translation
