import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'OPNsense — firewall, NAT, and policies',
  duration: '6–8 hours',
  description:
    'pf packet filter, interface and floating rules, states, aliases, schedules, NAT (outbound/port forward/1:1/hairpin), VLAN policies Guest/IoT/Corp, limiters, Multi-WAN, logging, GeoIP, diagnostics, and production case studies',
  sections: [
    {
      title: 'The pf packet filter model in OPNsense',
      content: `**OPNsense** uses **pf** (OpenBSD Packet Filter) — a stateful firewall at the FreeBSD kernel level. Unlike iptables/nftables on Linux, pf has a unified configuration with a clear hierarchy: **rules → NAT → routing**. The Web UI generates \`pf.conf\`, loaded via \`pfctl\`.

**Key pf concepts:**

| Concept | Description |
|-----------|----------|
| **Rule** | Pass, Block, Reject — action on matching packet |
| **State** | Entry in state table for stateful connections |
| **Anchor** | Subset of rules (per-interface in OPNsense) |
| **Table** | Fast IP set lookup (aliases → pf tables) |
| **NAT** | Separate rule set: rdr (redirect/DNAT), nat (SNAT) |

**Packet path (simplified):**

\`\`\`
Ingress interface
    → filter rules (in direction, top-to-bottom)
    → routing decision
    → outbound NAT rules (if egress to WAN)
    → egress interface
Return traffic: matched by existing state (fast path)
\`\`\`

**Stateful inspection:** on **Pass**, pf creates a **state** — a tuple (src/dst IP, ports, protocol). Return packets **do not** go through full rule evaluation — they match existing state. Critical for performance and troubleshooting: a «rule on return path» is usually not needed.

**Block vs Reject:**
- **Block** — silent drop (client sees timeout)
- **Reject** — ICMP unreachable (client gets immediate error)

**OPNsense mapping:**
- Firewall → Rules → [Interface] — interface-bound rules
- Firewall → Rules → Floating — global/cross-interface rules
- Firewall → NAT — outbound, port forward, 1:1
- Firewall → Aliases — named objects → pf tables

**Comparison with FortiGate policy model:**

| Aspect | OPNsense (pf) | FortiGate |
|--------|---------------|-----------|
| Rule scope | Per ingress interface + floating | Incoming + outgoing interface |
| Order | First match within anchor | First match global list |
| NAT | Separate NAT section | Per-policy NAT flag + VIP objects |
| Objects | Aliases | Address/Service objects |
| State sync | pfsync (HA) | FGCP cluster |

**When pf «thinks» interface-first:** a rule on LAN catches traffic **entering LAN** from clients. Traffic from a server **to** a client on LAN is **out** from the server's perspective, but **in** on the LAN interface from the firewall's perspective. Stateful return is handled via the state table.

**CLI essentials:** any UI change → \`configd filter reload\`. Do not edit \`/tmp/rules.debug\` in production without understanding — the UI will reload.`,
      code: {
        language: 'shell',
        caption: 'pfctl: load rules, anchors, and statistics',
        code: `# current filter rules with numbers and hit counters
pfctl -vvsr

# rules in anchor of specific interface (name = lowercase interface)
pfctl -a 'vlan20' -vvsr

# NAT rules
pfctl -vvsn

# general pf statistics
pfctl -s info

# list tables (aliases)
pfctl -s Tables`,
      },
    },
    {
      title: 'Interface rules vs Floating rules',
      content: `**Interface rules** — the main policy mechanism in OPNsense. A rule is bound to **one logical interface** (WAN, LAN, vlan0.20, wg0). Applied on **ingress** — packet entering that interface.

**Floating rules** — global or multi-interface. Configured in **Firewall → Rules → Floating**.

| Parameter | Interface rule | Floating rule |
|----------|----------------|---------------|
| Scope | One interface | Selected interfaces or all |
| Direction | in (default) | in, out, or any |
| Quick | implicit per anchor | Quick option — stop evaluation |
| Use case | VLAN policy, WAN inbound | Emergency block, global logging |

**Floating Quick rule:** if Quick is enabled and rule matches — **further rules are not checked** (including interface rules? — in pf floating is usually evaluated in a specific order; OPNsense places floating **before** interface rules when configured «first»).

**Typical floating use cases:**

1. **Global block bogons** — system often already does on WAN
2. **Log all denied** — floating block with log on all interfaces (careful: volume)
3. **Emergency IOC block** — alias with malicious IPs, floating block quick
4. **Bypass stateful tracking** — advanced: no state for specific flows (rare)

**Interface rule use cases:**

1. **Guest VLAN → WAN allow** — rule on vlan0.60 in
2. **Guest VLAN → internal deny** — rule on vlan0.60 in, dest RFC1918 alias
3. **WAN port forward associated rule** — on WAN in
4. **Inter-VLAN** — rule on **source** VLAN interface (traffic leaving segment through router)

**Critical mistake:** placing inter-VLAN rule on wrong interface. Guest→Servers traffic enters OPNsense through the **Guest VLAN interface** — rule must be there, not on Servers VLAN.

**Direction «out» on floating:** rare case — policy on egress (e.g. log all outbound from WAN). Most SMB policies — **in** on each segment interface.

**FortiGate analogy:** interface rules ≈ policy with specific incoming interface. Floating ≈ global policy or multiple interfaces selected.

**Best practice:** keep 90% of rules on interfaces for readability. Floating — for truly global controls and Quick blocks.`,
    },
    {
      title: 'Rule order and evaluation logic',
      content: `**Golden rule of pf:** **first match wins** within anchor. Implicit **deny all** at end of each interface ruleset (OPNsense adds automatically).

**Recommended order for SMB (per interface, top to bottom):**

\`\`\`
 1. Anti-lockout / emergency admin access (if needed)
 2. Explicit DENY high-risk (Guest→Internal, IoT→Corp)
 3. Explicit ALLOW specific (Users→DC, Mgmt→OPNsense)
 4. ALLOW broader internal flows
 5. ALLOW internet egress (with limiter/tag if needed)
 6. (implicit deny — do not add manually)
\`\`\`

**Why deny above allow:** if Guest has «allow any» above «block RFC1918» — internal networks are reachable. This is the #1 breach vector on guest Wi-Fi.

**Rule number:** drag-and-drop in GUI. In CLI \`pfctl -vvsr\` shows order and **evaluations** / **packets** counters.

**Multiple VLANs — not one ruleset:** each interface has its **own** independent list. Order on VLAN20 does not affect VLAN60.

**Floating evaluation order (OPNsense):**
- Floating rules with «match **first**» — before interface rules
- Floating rules with «match **last**» — after interface rules
- Default: first

**NAT evaluation — separate:** filter pass does not mean NAT applied. Outbound NAT checked on **egress**. Port forward (rdr) — before filter on WAN ingress for inbound connections.

**Policy routing interaction:** if traffic uses alternate gateway (policy route rule), NAT rule must match **correct outbound interface** (WAN2 vs WAN1).

**Optimization tips:**
- Specific rules (single host, single port) — **higher**
- Alias with thousands of entries — slower evaluation; split lists
- «Pass any any» — only on trusted low-risk segments with awareness

**Change management:** before reorder — backup config.xml. Document rule ID/description in change ticket.

**Troubleshooting order issues:**
1. \`pfctl -vvsr\` — find rule with hits
2. Temporarily **log** on suspected rules
3. Diagnostics → States — flow exists?
4. Packet capture — packet reaches firewall?`,
    },
    {
      title: 'States: state table and pfctl -s state',
      content: `**State table** — heart of stateful firewall. Each permitted connection (and some «stateless» allowances) creates an entry.

**State contains:**
- Original source/dest IP and ports
- NAT translation (if applied)
- TCP flags / sequence (for TCP)
- Timeout timers
- Interface association
- Creator rule number

**Viewing states:**

| Command | Purpose |
|---------|------------|
| \`pfctl -s state\` | All states (can be huge) |
| \`pfctl -s state | wc -l\` | Count |
| \`pfctl -ss\` | Summary by protocol |
| \`pfctl -s states | grep 192.168.20.50\` | Filter by IP |

**GUI:** Firewall → Diagnostics → **States** — search, kill state.

**Kill state:** after rule change, existing sessions may **continue working** (old state). For enforcement: kill relevant states or disconnect client.

\`\`\`shell
# kill all states involving host
pfctl -k 192.168.20.50

# kill state for specific src→dst
pfctl -k 192.168.20.50 -k 192.168.10.10
\`\`\`

**State limits:** System → Settings → Firewall → **Maximum states** (default depends on RAM). On exhaustion — new connections fail. Monitor in Dashboard.

**State timeouts (advanced):**
- TCP established: long (hours)
- UDP: shorter
- ICMP: short

**pfsync (HA):** states replicated between CARP nodes — failover preserves active sessions.

**NAT in states:** \`pfctl -s state\` shows translated addresses — key for «I see internal IP from WAN side» debugging.

**Common state issues:**

| Symptom | Cause |
|---------|--------|
| Rule changed but old traffic works | Existing state |
| Intermittent new connections fail | State table full |
| asymmetric routing | States not created / invalid |
| Long-lived broken TCP | Stale state — kill |

**FortiGate analogy:** \`diagnose sys session list\` — same concept. OPNsense pfctl lighter but less filtered output.`,
      code: {
        language: 'shell',
        caption: 'pfctl -s state: analyze active sessions',
        code: `# first 30 states
pfctl -s state | head -30

# states with NAT (grep translated)
pfctl -s state | grep 192.168.10.50

# summary: count per source IP
pfctl -s state | awk '{print $1}' | sort | uniq -c | sort -rn | head

# kill all states (CAUTION — breaks all connections)
pfctl -F states

# kill states of one client
pfctl -k 192.168.60.105`,
      },
    },
    {
      title: 'Aliases: hosts, networks, ports',
      content: `**Aliases** — named objects for rules, NAT, limiters. OPNsense compiles them into **pf tables** for O(1) lookup.

**Alias types (Firewall → Aliases):**

| Type | Example | Use |
|-----|--------|---------------|
| **Host(s)** | HOST_DC01 = 192.168.10.10 | Single server |
| **Network(s)** | NET_SERVERS = 192.168.10.0/24 | Subnet |
| **Port(s)** | PORT_WEB = 80, 443 | Service bundle |
| **URL (IP)** | Feed URL → table entries | Blocklists |
| **GeoIP** | os-geoip plugin | Country block |

**Naming convention (production):**

\`\`\`
HOST_DC01, HOST_FILE01
NET_USERS, NET_GUEST, NET_IOT, NET_MGMT
NET_RFC1918          → 10/8, 172.16/12, 192.168/16
PORT_AD, PORT_WEB, PORT_MGMT
GRP_INTERNAL_ALL     → nested aliases (network type)
\`\`\`

**Nested aliases:** Network alias can include other network aliases — \`GRP_INTERNAL\` = NET_SERVERS + NET_USERS + NET_VOIP.

**Ports alias:** PORT_AD = 53, 88, 135, 389, 445, 3268 — for Users→DC rules.

**Best practices:**
- No raw IPs in production rules — aliases only
- One alias = one role (not «ALL_INTERNAL_AND_SOME_HOSTS»)
- Revision: aliases in config.xml — diff on change review
- Size warning: alias >10K entries — test rule eval performance

**Host alias for dynamic?** DHCP static mapping + DNS; for true dynamic — RADIUS or external auth (not alias). URL tables for dynamic **IP** lists.

**Export:** aliases not separate export — part of config.xml backup.

**FortiGate analogy:** Address + Service objects. OPNsense nested aliases simpler than FortiGate groups but less metadata.`,
      code: {
        language: 'text',
        caption: 'Typical alias set for 50-user office',
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
      title: 'URL tables and external feeds',
      content: `**URL Table aliases** load IP addresses from HTTP(S) URL — popular for **blocklists** (spamhaus DROP, emerging threats).

**Setup:**
1. Firewall → Aliases → Add → Type **URL Table (IPs)**
2. URL: \`https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt\`
3. Update frequency: Daily
4. Use in floating block rule: Source → alias → blocklist

**URL Table (Ports)** — rare; for dynamic port lists.

**Cron update:** OPNsense fetcher updates tables; failed fetch — last good table remains (check logs).

**Size and performance:**
- 50K IPs — acceptable on modern CPU
- 500K+ — may slow reload and matching; consider smaller lists or hardware upgrade

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

**Compliance note:** document blocklist sources — some feeds prohibit commercial use (read license).

**Troubleshooting stale feed:** System → Log Files → General or Firewall — alias update errors. Test URL fetch from shell: \`fetch -o /tmp/t.txt <url>\`.`,
    },
    {
      title: 'Schedules: time windows for rules',
      content: `**Schedules** (Firewall → Schedules) limit **when** a rule is active.

**Schedule components:**
- Weekdays + time ranges
- Multiple ranges per schedule
- Month/day exceptions (maintenance windows)

**Examples:**

| Schedule | Definition | Use case |
|----------|-------------|----------|
| \`BUSINESS_HOURS\` | Mon–Fri 08:00–19:00 | Strict policy daytime |
| \`NIGHT_MAINT\` | Sun 02:00–06:00 | Server patch window |
| \`WEEKEND_OPEN\` | Sat–Sun all day | Relaxed guest access |

**Application:** Rule → Advanced → Schedule → select.

**Inactive schedule = rule skipped** (not deny — simply not evaluated as pass/block?). In OPNsense rule with schedule **does not match** outside window — traffic falls through to next rule. Plan explicit deny below if you need «deny outside hours» vs «allow only during hours».

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
      content: `**Outbound NAT (SNAT)** — internal IPs translated to public WAN IP when exiting to internet.

**Three modes (Firewall → NAT → Outbound):**

| Mode | Behavior |
|------|-----------|
| **Automatic** | Auto rules for all internal subnets → WAN IP |
| **Hybrid** | Manual rules + automatic for unmatched |
| **Manual** | Only explicit rules — unmatched **not** NAT |

**Automatic (default lab):** LAN 192.168.1.0/24 → WAN address. Enough for single WAN SMB.

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
- **Translation:** Interface address or static IP (if multiple public IPs)
- **Static-port:** preserve source port (needed for some VoIP/SIP — rare)
- **Non-static port:** NAPT typical

**Policy NAT vs route:** traffic must **exit correct WAN interface** (policy routing) for matching NAT rule.

**No NAT between internal subnets:** outbound NAT applies to traffic leaving to WAN. Inter-VLAN **not** SNAT (original IPs remain).

**IPv6:** separate NAT rules if NPT or v6 — SMB often v4-only.

**Diagnostics:** States show NAT translation. \`pfctl -vvsn\` — NAT rules with hits.

**FortiGate:** IP Pools + policy NAT. OPNsense separates routing/policy from NAT section — more steps but clearer separation.`,
      code: {
        language: 'text',
        caption: 'Hybrid outbound NAT — dual WAN (concept)',
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
      title: 'Port Forward and associated filter rules',
      content: `**Port Forward (DNAT / rdr)** — inbound WAN traffic → internal server.

**Steps (Firewall → NAT → Port Forward):**

| Field | Example |
|------|--------|
| Interface | WAN |
| Protocol | TCP |
| Destination | WAN address |
| Destination port | 443 |
| Redirect target IP | 192.168.10.50 |
| Redirect target port | 443 |
| Filter rule association | **Add associated filter rule** ✓ |
| Filter rule source | any (or restrict) |

**Associated filter rule** automatically creates **Pass** rule on WAN:
- Destination WAN IP, port 443
- Redirects to internal — pf handles after NAT

**Without associated rule:** classic «NAT works, connection timeout» — packet DNAT'd, filter default deny on WAN.

**Security hardening inbound:**
- Source: not «any» — restrict to Cloudflare IPs alias if behind CDN
- GeoIP block on WAN floating **above** allow
- Log all inbound allows

**Multiple ports:** separate forwards or custom port range.

**Hairpin / reflection:** separate section — do not confuse with port forward.

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

# Auto-created WAN rule (concept):
# Pass | WAN | in | TCP | any → WAN address:443 | NAT → 192.168.10.50:443`,
      },
    },
    {
      title: '1:1 NAT (binat)',
      content: `**1:1 NAT** — bidirectional mapping of one public IP ↔ one internal host. Used for:
- DMZ server with dedicated public IP
- Mail server (legacy)
- Compliance «this internal = this external»

**Setup (Firewall → NAT → One-to-One):**

| Field | Example |
|------|--------|
| Interface | WAN |
| External subnet | 203.0.113.5/32 |
| Internal subnet | 192.168.10.50/32 |
| Destination | (any) |

**Difference from port forward:** **all** ports mapped — full exposure. Firewall rules **still required** — 1:1 does not bypass filter.

**Typical DMZ pattern:**

\`\`\`
1:1 NAT: 203.0.113.5 ↔ 192.168.50.10
WAN rule: Pass TCP 80,443 from any to 203.0.113.5
WAN rule: Block all other to 203.0.113.5
\`\`\`

**Outbound from 1:1 host:** appears as 203.0.113.5 to internet (symmetric mapping).

**Multiple public IPs:** ISP provides block — each 1:1 or combine with port forwards on shared IP.

**vs Virtual IPs:** OPNsense Virtual IP (CARP, other) — holding extra IPs on interface; NAT references them.

**Security warning:** 1:1 without strict WAN rules = full port scan surface.

**Decommission:** remove 1:1 + WAN rules + DNS records together.

**FortiGate:** Static NAT / dedicated policy per IP. Same caution.`,
    },
    {
      title: 'NAT reflection and hairpin',
      content: `**NAT reflection (hairpin)** — LAN client accesses **public DNS name** (pointing to WAN IP), traffic must loop internal without exiting to ISP.

**Problem without hairpin:**
\`\`\`
LAN PC → WAN public IP:443
  → OPNsense NAT tries WAN path
  → ISP may reject or asymmetric routing fails
\`\`\`

**Solutions:**

| Method | Pros | Cons |
|-------|-------|--------|
| **Split DNS (Unbound)** | Clean, no NAT hack | Separate int/ext DNS |
| **NAT reflection** | Works with same public DNS | Extra NAT complexity |
| **Internal DNS override** | Best practice | Requires DNS admin |

**Enable reflection (NAT → Port Forward):**
- **NAT reflection (Pure NAT)** or **NAT+Proxy** mode per forward
- Firewall → Settings → **Reflection** — enable for internal networks

**Pure NAT reflection:** pf rdr rules for LAN interfaces.

**NAT+Proxy:** local proxy process — legacy, rare today.

**Recommended SMB:** **Split DNS** on Unbound:

\`\`\`
Host override: portal.office.local → 192.168.10.50 (internal)
Public DNS: portal.office.com → 203.0.113.1 (WAN)
\`\`\`

**Test hairpin:** from LAN \`curl -k https://public-ip\` — should hit internal server.

**Guest isolation:** hairpin may accidentally allow guest to reach internal via public IP — **block Guest → WAN IP** alias of own organization.

**Performance:** hairpin adds firewall load — prefer split DNS for high volume internal access.`,
    },
    {
      title: 'Anti-lockout rule',
      content: `**Anti-lockout** — mechanism preventing self-lockout from GUI during aggressive firewall changes.

**Default behavior:** OPNsense often keeps **anti-lockout rule** on LAN — temporary Pass from LAN net to OPNsense management ports (443, 80) that **cannot be removed** accidentally or is highlighted special.

**Location:** Firewall → Rules → LAN — rule with description «Anti-Lockout Rule» or icon.

**Production hardening tension:**
- Anti-lockout saves from mistakes
- But LAN any→OPNsense too broad if LAN = huge flat network

**Best practice:**
1. Replace broad anti-lockout with **explicit Mgmt rule**: NET_MGMT → OPNsense PORT_MGMT
2. Restrict GUI: System → Settings → Administration → **Listen interfaces** = Mgmt VLAN only
3. SSH key-only from NET_MGMT
4. Keep break-glass: serial/console access documented

**Disable anti-lockout (advanced):** only when confident in Mgmt access path. Document rollback config backup.

**Scenario:** admin blocks all LAN→OPNsense, no console — **physical access** or IPMI to fix.

**Change window:** always backup before rule changes; use **Scheduled rollback** (manual: restore config at night if ticket open).

**MSP note:** anti-lockout on customer LAN may violate policy — use jump host VPN only.`,
    },
    {
      title: 'Block bogon and private networks on WAN',
      content: `**Bogon networks** — IP ranges not allocated (should not appear on internet). **Private networks** — RFC1918 should not be source on WAN from ISP.

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
      title: 'Guest VLAN: isolation policy',
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
      title: 'Corp/Users VLAN: typical policies',
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
      title: 'Traffic Shaper and Limiters',
      content: `**Traffic shaping** in OPNsense — two main tools:

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
        caption: 'dnctl: check limiters',
        code: `# list pipes/limiters
dnctl pipe show
dnctl sched show

# live statistics
dnctl pipe show | grep -A2 LIMIT_GUEST

# reset statistics (if supported by version)
# dnctl pipe flush`,
      },
    },
    {
      title: 'Multi-WAN, policy routing, and gateway groups',
      content: `**Multi-WAN** — two+ ISPs for failover or load balance.

**Components:**
1. **Gateways** (System → Routing → Gateways) — WAN1_GW, WAN2_GW, monitor IP
2. **Gateway groups** — failover or loadbalance pool
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
        caption: 'Gateway group and policy routing (concept)',
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
      title: 'Categories, tags, and rule organization',
      content: `**Rule categories (Firewall → Categories)** — color and logical grouping in GUI. Does not affect evaluation — UX and audit only.

**Example categories:**
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
      title: 'Logging and Live View',
      content: `**Firewall logging** — critical for security and troubleshooting.

**Per-rule log:** Rule → Advanced → Log ✓. Logs **matches** of that rule.

**Log files (Firewall → Log Files → Live View / Plain):**
- **Filter** — firewall pass/block
- **System** — general
- **Resolver** — DNS

**Live View:** real-time tail with filter — source IP, dest, rule number.

**Remote syslog:** System → Settings → Logging → remote server (SIEM, Graylog, Wazuh).

**Log format:** includes rule **anchor**, **rule number**, action, src/dst, proto.

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
        caption: 'Live firewall log and filtering',
        code: `# live filter log
clog -f /var/log/filter

# guest subnet blocks only
clog -f /var/log/filter | grep 192.168.60

# last 200 lines
tail -200 /var/log/filter

# search by rule label in log
grep 'RU-GUEST-001' /var/log/filter`,
      },
    },
    {
      title: 'GeoIP and blocklists',
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
      title: 'Diagnostics: packet capture and flow debug',
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
        caption: 'tcpdump: typical captures',
        code: `# capture guest client traffic
tcpdump -ni vlan0.60 -c 100 host 192.168.60.105

# WAN inbound to public IP
tcpdump -ni WAN 'dst host 203.0.113.1 and tcp port 443'

# write rotating capture (watch disk)
tcpdump -ni WAN -w /tmp/wan-%Y%m%d.pcap -G 3600 -C 100

# read without wireshark on box
tcpdump -nr /tmp/wan.pcap | head -50`,
      },
    },
    {
      title: 'Common mistakes and anti-patterns',
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
      title: 'Lab scenarios: step-by-step exercises',
      content: `**Lab topology (minimum):**
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
      title: 'Full annotated export: 24 rules SMB office',
      content: `**Office ~50 users, 5 VLAN + VPN.** Tracker references for documentation.

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
        caption: 'Example rule description for change ticket',
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
      content: `**Client:** retail chain HQ, 55 employees + guest Wi-Fi for vendors.

**Before OPNsense:** flat network — vendor laptop compromised → lateral movement to POS back-office server.

**Solution:**
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
      content: `**Client:** MSP client, 40 users, dual ISP (fiber + LTE backup).

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
      title: 'FAQ: 14 common questions (Firewall/NAT)',
      content: `**1. Need rule on return path?**
No for stateful Pass — state handles return.

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
      title: 'Interview Q&A: 12 questions (Firewall/NAT)',
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
    'Create 15+ aliases (NET_*, HOST_*, PORT_*) for lab topology with 5 VLANs — no raw IPs in rules',
    'Implement Guest policy G-01..G-04 on vlan0.60; verify ping internal fail + internet ok + deny log',
    'Configure port forward WAN:443 → web server: first without association (fail), then fix and document hits in pfctl',
    'Switch outbound NAT to Hybrid; create manual rule for Guest VLAN on second WAN (simulated or lab)',
    'Create 10 Mbps limiter for Guest; verify via speed test or iperf',
    'Configure gateway group failover; disconnect primary WAN and document corp traffic recovery time',
    'Floating rule: block inbound GEO alias (2 countries) on WAN; test with log',
    'Lab scenario 5: state kill after block rule — document SSH session behavior',
    'Packet capture: WAN + LAN simultaneous during port forward; explain pcap in 5 bullet points',
    'Build policy matrix Excel/MD: 24 rules annotated export for 50-user office',
    'Quarterly audit lab: find shadowed rule (duplicate pass) via pfctl counters',
    'Split DNS override for one public hostname; compare with NAT reflection enabled',
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
  quiz: [
    {
      question: 'In OPNsense pf, firewall rules are evaluated:',
      options: [
        'First match wins, top to bottom per interface anchor',
        'Last match wins globally',
        'Random order for load balancing',
        'Only on WAN interface',
      ],
      answer: 'First match wins, top to bottom per interface anchor',
    },
    {
      question: 'Port forward works but external clients get connection timeout. Most likely cause:',
      options: [
        'Missing associated WAN pass filter rule',
        'DHCP pool exhausted',
        'Unbound DNSSEC failure',
        'CARP split-brain',
      ],
      answer: 'Missing associated WAN pass filter rule',
      explanation: 'DNAT alone is insufficient — inbound traffic must be explicitly allowed on WAN after NAT.',
    },
    {
      question: 'Inter-VLAN rule for Guest→Servers traffic should be placed on:',
      options: [
        'Guest VLAN interface (ingress from Guest)',
        'Servers VLAN interface',
        'Floating rules only',
        'WAN interface',
      ],
      answer: 'Guest VLAN interface (ingress from Guest)',
      explanation: 'Traffic enters OPNsense on the source segment interface — rule must match ingress there.',
    },
    {
      question: 'Block vs Reject in pf:',
      options: [
        'Block = silent drop; Reject = ICMP unreachable to client',
        'Block = ICMP error; Reject = silent drop',
        'Both identical behavior',
        'Reject only works on WAN',
      ],
      answer: 'Block = silent drop; Reject = ICMP unreachable to client',
    },
    {
      question: 'Outbound NAT Hybrid mode is recommended when:',
      options: [
        'Multi-WAN with per-segment SNAT policies',
        'Single WAN lab with one LAN',
        'Bridge mode transparent firewall',
        'IPv6-only deployment',
      ],
      answer: 'Multi-WAN with per-segment SNAT policies',
    },
    {
      question: 'After adding a deny rule, existing SSH sessions may continue because:',
      options: [
        'Existing state table entries still match return traffic',
        'SSH bypasses pf entirely',
        'Deny rules apply only to UDP',
        'States auto-refresh every deny',
      ],
      answer: 'Existing state table entries still match return traffic',
      explanation: 'Kill states with pfctl -k or disconnect clients to enforce new deny policy immediately.',
    },
    {
      question: 'CLI command to view NAT rules with hit counters:',
      options: ['pfctl -vvsn', 'pfctl -vvsr', 'pfctl -s nat', 'pfctl -d'],
      answer: 'pfctl -vvsn',
      explanation: 'Use pfctl -vvsr for filter rules; pfctl -s state for active sessions.',
    },
    {
      question: 'Guest VLAN isolation best practice (rule order):',
      options: [
        'Block RFC1918 above allow internet',
        'Allow any above block-internal',
        'Disable firewall on Guest',
        'Use WAN as Guest gateway',
      ],
      answer: 'Block RFC1918 above allow internet',
      explanation: 'If allow-any is above block-internal, guest clients can reach corporate subnets.',
    },
    {
      question: 'Preferred SMB solution for internal clients accessing services by public DNS name:',
      options: [
        'Split DNS (Unbound host override)',
        'Disable NAT entirely',
        '1:1 NAT for every server',
        'Floating pass any on LAN',
      ],
      answer: 'Split DNS (Unbound host override)',
    },
    {
      question: 'WAN interface should enable block private and bogon networks to:',
      options: [
        'Reject spoofed/misrouted inbound traffic from ISP',
        'Block LAN clients from internet',
        'Disable outbound NAT',
        'Force all traffic through VPN',
      ],
      answer: 'Reject spoofed/misrouted inbound traffic from ISP',
      explanation: 'RFC1918 and bogon sources should not arrive inbound on WAN from the internet.',
    },
  ],
}

export default translation
