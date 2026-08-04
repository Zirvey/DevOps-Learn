import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'OPNsense — services and plugins',
  duration: '6–8 hours',
  description:
    'os-* plugins, Suricata IDS/IPS, Zenarmor, HAProxy + ACME, Unbound advanced, Captive Portal, Netflow, DDNS, RADIUS/LDAP, monitoring and production cases',
sections: [
    {
      title: 'Services and plugins: OPNsense extension model',
      content: `**OPNsense** separates **core firmware** (firewall, routing, base Unbound) and **plugins** — additional services as FreeBSD packages with the **os-*** prefix.

**Why plugins:**
- IDS/IPS (Suricata), L7 filtering (Zenarmor)
- Reverse proxy (HAProxy, nginx)
- ACME Let's Encrypt automation
- Captive portal, RADIUS, ClamAV
- Monitoring agents (Zabbix, Telegraf)
- Netflow exporters, DDNS, WoL

**Where to manage:**
- **System → Firmware → Plugins** — install, remove, versions
- **Services** menu — configuration after install
- **System → Firmware → Updates** — update core separately from plugins

**Architecture:**
\`\`\`
OPNsense Core (FreeBSD + pf + Unbound base)
    │
    ├── os-suricata     → Suricata daemon + rules sync
    ├── os-haproxy      → HAProxy + UI backend
    ├── os-acme-client  → certbot-like ACME + cron renew
    ├── os-nginx        → nginx reverse proxy (alternative to HAProxy)
    ├── os-c-icap       → ICAP for ClamAV integration
    └── os-zabbix-agent → Zabbix agent package
\`\`\`

**Important:** plugin = package + OPNsense plugin metadata (menu entries, config templates, migrations). Removing a plugin via GUI usually cleans config sections; orphaned config is rare but verify after uninstall.

**Production mindset:** do not install "everything from the catalog". Each plugin is a process (CPU, RAM, logs, updates). Document installed plugins in runbook.`,
    },
    {
      title: 'os-* plugins: installation, dependencies and lifecycle',
      content: `**Installation via GUI:**
1. System → Firmware → Plugins
2. Find plugin (e.g. **os-suricata**)
3. **+** Install → reboot not needed for most, but Suricata/HAProxy — restart service

**CLI alternative (SSH):**
\`\`\`shell
pkg install os-suricata
pluginctl -g  # regenerate menu/config
\`\`\`

**Dependencies:** some plugins require others:
- **os-acme-client** often used with **os-haproxy** or **os-nginx**
- **os-c-icap** + ClamAV for antivirus scanning
- Zenarmor — separate vendor package, not always in default repo

**Versioning:**
- Plugin version tied to OPNsense release (24.7, 25.1…)
- After major core upgrade — update all plugins in the same maintenance window
- **Incompatible plugin** blocks upgrade — read release notes

**Removal:**
1. Disable service in GUI
2. Plugins → remove os-*
3. Verify: \`pkg info | grep os-\` on shell
4. Backup config.xml before/after

**Lock packages (optional):** for stable production — pin versions in change management; auto-update plugins without lab test is risky.

| Plugin | Typical RAM overhead | CPU impact |
|--------|----------------------|------------|
| os-suricata | +500 MB – 2 GB | High on IPS |
| os-haproxy | +50–100 MB | Low–medium |
| os-zenarmor* | +200–500 MB | Medium |
| os-zabbix-agent | +20 MB | Minimal |

*Zenarmor licensing separate from OPNsense.`,
      code: {
        language: 'shell',
        caption: 'Check installed os-* packages and service status',
        code: `# list OPNsense plugins
pkg info | grep '^os-'

# plugin-managed service status
configctl status suricata
configctl status haproxy

# restart after config change
configctl restart suricata`,
      },
    },
    {
      title: 'Suricata IDS/IPS: architecture and placement',
      content: `**Suricata** — signature-based **IDS** (detect) and **IPS** (inline block) based on rule matching. The **os-suricata** plugin integrates daemon, rule updates, alerts UI.

**Traffic flow:**
\`\`\`
Packet on interface (WAN/LAN)
    → Suricata inspection engine
    → Rule match → Alert (IDS) or Drop/Reject (IPS)
    → Log → local / syslog / Eve JSON
\`\`\`

**When Suricata on OPNsense:**
- SMB without budget for FortiGuard IPS
- Need ET Open / custom rules
- Homelab / MSP CPE with unified stack

**When NOT Suricata alone:**
- >1 Gbps sustained with full IPS — need hardware NGFW or dedicated IDS appliance
- Managed SOC required without own SIEM

**Placement strategy:**

| Interface | Scenario | Risk |
|-----------|----------|------|
| **WAN** | Inbound attacks, exploit kits | False positives on legitimate traffic rare |
| **LAN** | East-west, lateral movement | High FP rate, CPU load |
| **DMZ OPT** | Public services segment | Focused ruleset |
| **Multiple** | Defense in depth | CPU × N interfaces |

**Start recommendation:** IDS-only on WAN, 2 weeks tuning → IPS enable selective rules.

**Difference from Zenarmor:** Suricata = packet/signature IDS classic; Zenarmor = L7 application visibility + policy (different model, can complement).`,
    },
    {
      title: 'Suricata: IDS, IPS and IPS with drop modes',
      content: `**Services → Intrusion Detection → Administration:**

| Mode | Description | Production use |
|------|----------|----------------|
| **IDS** | Detection + alert, traffic passes | Tuning phase, monitoring |
| **IPS** | Inline enforcement on matched rules | After whitelist tuning |
| **IPS with drop** | Active drop without state (aggressive) | Rare, specific threats |

**IDS mode:**
- Does not affect connectivity
- Alerts in Suricata log + optional syslog
- Ideal for learning baseline

**IPS mode:**
- Suricata acts as inline filter (via netmap/divert — implementation on FreeBSD)
- Matched rule with action drop/reject → packet does not pass
- **Risk:** false positive = outage for legitimate app

**IPS policy rollout:**
1. Week 1–2: IDS only, collect alerts
2. Identify top 20 FP signatures → disable or pass-list
3. Enable IPS with **default pass** + selective drop rules
4. Monitor helpdesk tickets

**Home net vs office:**
- Home: IPS on WAN often OK (low app diversity)
- Office: ERP, custom ports, SaaS — FP nightmare without tuning

**Fail-open vs fail-close:** on Suricata crash traffic usually passes (fail-open) — check version docs; for critical compliance external tap IDS sometimes preferred.`,
    },
    {
      title: 'Suricata: rulesets, ET Open and commercial feeds',
      content: `**Rulesets** — set of signatures (SID). Management: Services → Intrusion Detection → Download.

**Popular feeds:**

| Ruleset | Cost | Update | Notes |
|---------|------|--------|-------|
| **ET Open** | Free | Daily | Good baseline, noisy categories |
| **ET Pro** | Subscription | Daily | Better coverage |
| **Snort registered** | Free (reg) | Regular | Alternative syntax conversion |
| **OPNsense rules** | Free | Bundled | Optimized subset |
| **Custom** | DIY | Manual | IOC blocks, internal |

**Download and install:**
1. Download tab → select ruleset → Download
2. Rules tab → enable/disable categories
3. Update tab → schedule auto-update (cron daily off-peak)

**Category tuning (disable noisy):**
- **POLICY** — P2P, games (if not security policy)
- **CHAT** — if not needed
- Keep: **EXPLOIT**, **MALWARE**, **SCAN**, **TROJAN**, **WEB_CLIENT**

**Custom rules example use cases:**
- Block known bad IPs from threat intel
- Alert on SMB lateral (445) from Guest VLAN
- Detect DNS tunneling patterns (limited without ML)

**Rule actions:** alert, drop, reject, pass — pass for whitelist IP/signature.

**Storage:** rules on disk — monitor space; full ET Open can be 50k+ rules.`,
      code: {
        language: 'text',
        caption: 'Example local custom Suricata rule (pass-list for update server)',
        code: `# local.rules — pass Windows Update CDN from IPS drop
pass ip 192.168.20.0/24 any -> any any (msg:"PASS internal to MS update"; sid:9000001; rev:1;)

# drop known bad scanner
drop ip any any -> $HOME_NET any (msg:"DROP known scanner"; iprep:any,scanner,1,1; sid:9000002; rev:1;)`,
      },
    },
    {
      title: 'Suricata: interface selection and hardware offload',
      content: `**Enable interfaces:** Services → Intrusion Detection → Interfaces — tick WAN, LAN, etc.

**Per-interface considerations:**

**WAN only (SMB default after tuning):**
- Pros: lowest CPU, inbound threat focus
- Cons: no lateral movement detection

**LAN + WAN:**
- Pros: east-west visibility
- Cons: 2× traffic inspection, FP on internal apps

**VLAN-specific:** if Guest is on separate VLAN interface — inspect Guest OPT for exfil detection.

**Hardware offload interaction:**
- NIC offload (LRO, TSO) sometimes conflicts with IDS — Suricata docs recommend disable offload on inspected interfaces
- **Shell:** \`ifconfig igb0 -rxcsum -txcsum -rxcsum6 -txcsum6\` (example)

**MTU / fragmentation:** mismatched MTU → weird Suricata alerts; ensure consistent 1500 or jumbo end-to-end.

**Multi-WAN:** inspect each WAN interface; rules may need per-interface HOME_NET definition.

**VM environments:**
- VirtIO NICs generally OK
- Low packet buffer → drops under load — increase if \`suricata.log\` shows capture drops

**Checklist before enable:**
- [ ] HOME_NET alias matches internal subnets
- [ ] EXTERNAL_NET defined (often \`!HOME_NET\`)
- [ ] Offload disabled if recommended
- [ ] Disk space for logs > 10 GB free`,
    },
    {
      title: 'Suricata: alerts, Eve JSON and SIEM integration',
      content: `**Alert sources:**
- GUI: Services → Intrusion Detection → Alerts
- Log files: \`/var/log/suricata/\`
- Eve JSON: structured events for ELK/Graylog/Wazuh

**Eve JSON format (typical):**
\`\`\`json
{
  "timestamp": "2026-08-04T10:15:00+0000",
  "event_type": "alert",
  "src_ip": "203.0.113.50",
  "dest_ip": "192.168.10.50",
  "proto": "TCP",
  "alert": {
    "action": "allowed",
    "signature": "ET SCAN Suspicious inbound",
    "signature_id": 2001234,
    "category": "Attempted Information Leak"
  }
}
\`\`\`

**Syslog forward:**
- System → Settings → Logging → Remote syslog
- Or Suricata plugin syslog settings
- Use dedicated log host; rate-limit on receiver

**Alert triage workflow:**
1. Filter by **action:blocked** first (IPS hits)
2. Group by signature_id — mass same SID = FP or scan campaign
3. Correlate src_ip: external scan vs internal compromised host
4. Whitelist or disable rule if FP confirmed

**Wazuh / Elastic:** ingest Eve JSON; map signature_id to MITRE.

**Retention:** rotate logs weekly; Suricata verbose on busy WAN — GB/day.

**Don't alert fatigue:** email on every alert = ignored; use SIEM correlation rules.`,
      code: {
        language: 'shell',
        caption: 'Analyze Suricata Eve log on shell',
        code: `# top 10 signatures in last hour
grep '"event_type":"alert"' /var/log/suricata/eve.json | tail -5000 | \\
  jq -r '.alert.signature' | sort | uniq -c | sort -rn | head -10

# blocked IPS events
grep '"action":"blocked"' /var/log/suricata/eve.json | tail -20 | jq .`,
      },
    },
    {
      title: 'Intrusion Detection: tuning and reducing false positives',
      content: `**False positive (FP)** — legitimate traffic matches attack signature. IPS FP = user-visible breakage.

**Tuning ladder:**

1. **Disable categories** — POLICY, P2P, CHAT if not needed
2. **Threshold tuning** — some rules have threshold in metadata
3. **Pass rules** — local.rules with pass action above drop rules
4. **Suppress** — Services → Suricata → Alerts → suppress by SID + IP
5. **HOME_NET accuracy** — wrong definition → external traffic misclassified

**Common FP scenarios SMB:**

| App | Signature noise | Fix |
|-----|----------------|-----|
| Microsoft 365 | SSL anomaly rules | Pass MS IP ranges |
| Zoom/Teams | UDP patterns | Category disable or pass |
| Legacy ERP | Non-standard ports | Pass internal ERP IP |
| Backup (Veeam) | Scan-like behavior | Pass backup server |
| Pen test tools | Intentional alerts | Schedule suppress window |

**Performance tuning:**
- **detect-profile:** \`medium\` vs \`high\` — CPU vs coverage
- Reduce ruleset size — don't enable all categories
- Single WAN inspect first

**IDS on WAN before IPS:** mandatory for office networks.

**Runbook entry:** «Suricata FP ticket» — capture pcap, find SID, suppress, document in change log.

**Metrics:** track alerts/day, blocked/day, CPU % — spike after rule update = review changelog ET.`,
    },
    {
      title: 'Zenarmor: overview and comparison with Suricata',
      content: `**Zenarmor** (formerly Sensei) — **L7 NGFW plugin** for OPNsense: application control, web filtering, device identification, cloud threat intel.

**Not a 1:1 Suricata replacement** — different engines:
- Suricata: signature IDS/IPS on packets
- Zenarmor: flow-based L7 policy, SaaS dashboard optional

**Features (typical tiers):**
- Application blocking (Facebook, TikTok during work hours)
- Web categorization (malware, adult, phishing)
- Device fingerprinting
- Reports and central management (Zenconsole)

**Deployment:**
1. Install Zenarmor plugin from vendor instructions
2. Register license (free tier limited devices)
3. Select interfaces to protect (LAN, Guest)
4. Policies → default deny categories or allowlist mode

**Licensing SMB reality:**
- Free: limited endpoints
- Business: per device/month — factor in TCO vs FortiGate

**Zenarmor + Suricata together:**
- Possible but CPU-heavy
- Pattern: Zenarmor L7 policy on LAN, Suricata IPS on WAN
- Avoid duplicate blocking (both block same category)

**vs FortiGate App Control:** Zenarmor closer philosophically; depth and SSL inspection throughput lower on same hardware.

**When choose Zenarmor:** need user-friendly app blocking without writing Suricata rules; MSP wants cloud-managed policies.`,
    },
    {
      title: 'HAProxy: reverse proxy on OPNsense',
      content: `**os-haproxy** — reverse proxy / load balancer to publish internal services without direct port forward to fragile apps.

**Typical layout:**
\`\`\`
Internet → WAN:443 HAProxy (OPNsense)
              → backend pool 192.168.10.50:443
              → backend pool 192.168.10.51:443 (HA pair)
\`\`\`

**Advantages vs simple port forward:**
- SSL termination on OPNsense (central cert management)
- Health checks — auto remove dead backend
- ACL routing — \`app1.domain\` vs \`app2.domain\` same IP
- Rate limiting, headers, stickiness

**Setup overview:**
1. Install **os-haproxy**
2. Services → HAProxy → Settings → Enable
3. **Real Servers** — backend IPs and ports
4. **Virtual Services** — frontend bind WAN:443 SSL
5. **Rules** — ACLs, backends mapping
6. Firewall: WAN pass to localhost HAProxy (automatic rules often added)

**SSL:**
- Manual cert upload OR **os-acme-client** integration (next section)
- Modern TLS: disable SSLv3, TLS1.0; prefer TLS1.2+

**Health checks:**
- HTTP GET /health → expect 200
- Interval 10s, rise 2, fall 3

**Logging:** HAProxy stats page optional; syslog for access logs.

**Limits:** OPNsense HAProxy not replacement for full F5/nginx-plus at massive scale; SMB 5–20 backends — OK.`,
      code: {
        language: 'text',
        caption: 'HAProxy backend config fragment (conceptual — GUI generates)',
        code: `backend web_pool
    mode http
    balance roundrobin
    option httpchk GET /health
    server web01 192.168.10.50:8080 check inter 10s fall 3 rise 2
    server web02 192.168.10.51:8080 check inter 10s fall 3 rise 2 backup`,
      },
    },
    {
      title: 'ACME Let\'s Encrypt: certificate automation',
      content: `**os-acme-client** — ACME protocol (Let's Encrypt, ZeroSSL) for automatic issuance and renewal of TLS certificates.

**Challenge types on OPNsense:**

| Challenge | When | Requirement |
|-----------|-------|-------------|
| **HTTP-01** | Public web on 80/443 | WAN accessible port 80 |
| **DNS-01** | Wildcard, internal names | API token DNS provider |
| **TLS-ALPN-01** | Rare | Specific HAProxy config |

**HTTP-01 typical flow:**
1. Services → ACME Client → Accounts → Register (Let's Encrypt)
2. Certificates → Add — domain \`vpn.office.com\`
3. Challenge: HTTP-01, interface WAN
4. Action: Deploy to HAProxy / Web GUI
5. Auto-renew: default cron ~60 days

**DNS-01 for wildcard:**
- Plugin supports Cloudflare, Route53, etc.
- API token with minimal scope
- \`*.office.com\` cert for many subdomains

**Integration points:**
- HAProxy frontends — select ACME cert
- System → Trust → Certificates — visible after issuance
- OpenVPN/WireGuard — less common via ACME (use DNS names)

**Rate limits Let's Encrypt:** 50 certs/domain/week — plan SAN carefully.

**Staging:** use LE staging endpoint for testing automation before production cutover.

**Failure alerts:** monitor renewal log; expired cert = outage Friday 00:00.`,
      code: {
        language: 'shell',
        caption: 'Check ACME certs and renewal log',
        code: `# list ACME certificates
ls -la /var/etc/acme-client/certificates/

# renewal log
tail -50 /var/log/acme/acme.log

# check expiry of deployed cert
openssl s_client -connect vpn.office.com:443 -servername vpn.office.com 2>/dev/null | \\
  openssl x509 -noout -dates`,
      },
    },
    {
      title: 'Unbound advanced: blocklists, DNSSEC and sinkhole',
      content: `**Unbound** on OPNsense — recursive resolver for LAN. Advanced: blocklists, DNSSEC validation, local zones, forwarding.

**DNS blocklist (os-unbound-max or manual):**
- Download curated malware/ads domain lists
- NXDOMAIN or redirect to sinkhole IP for blocked domains
- Update daily via cron

**Setup blocklist plugin pattern:**
1. System → Firmware → Plugins → os-unbound-max (if used) or community blocklist scripts
2. Services → Unbound DNS → Blocklists → enable lists (malware, ads optional)
3. Choose block mode: **Refuse** (NXDOMAIN) vs **Redirect** (0.0.0.0)

**Office policy considerations:**
- Ads blocking on work network — HR/legal may object
- Malware/phishing lists — generally approved
- Split: Guest VLAN strict block, Users moderate, Servers no block (breaks telemetry)

**Performance:** 500k domain blocklist — memory ↑; Unbound restart time ↑. Start with smaller lists.

**Bypass risk:** clients using DoH/DoT direct to 8.8.8.8 — firewall block or DNS redirect (next sections).

**Logging blocked queries:** Unbound extended logging — privacy vs security tradeoff.

**vs Pi-hole:** Unbound blocklist on OPNsense = single appliance; Pi-hole = dedicated DNS filter VM.

**DNSSEC** — cryptographic chain of trust from root to domain. Unbound validates responses, blocks spoofed DNS.

**Enable DNSSEC:**
1. Services → Unbound DNS → General
2. **DNSSEC** → Enable
3. **DNSSEC strict mode** — optional (breaks if upstream broken)

**How it works:**
\`\`\`
Client query → Unbound (validator)
    → recursive resolution with DS/DNSKEY checks
    → BOGUS response → SERVFAIL to client
\`\`\`

**Troubleshooting SERVFAIL after DNSSEC enable:**
- Broken domain upstream — rare for major sites
- Captive portal interference
- Forward mode to ISP DNS that strips DNSSEC — use recursive root mode instead

**Anchor updates:** Unbound ships root anchor; auto updates via unbound-anchor cron.

**Internal zones:** DNSSEC for private \`office.local\` — separate AD DNS concern; Unbound forwards AD zone without validating internal unsigned zones.

**Best practice SMB:** enable DNSSEC validation on OPNsense Unbound; internal AD DNS for domain; forward only \`office.local\` → DC.

**Monitoring:** \`unbound-control stats_noreset\` — validator stats; \`bogus\` counter should be low; spike = attack or misconfig.`,
      code: {
        language: 'shell',
        caption: 'Unbound DNSSEC and diagnostics',
        code: `# Unbound status
unbound-control status

# DNSSEC validation test (should show ad = authenticated data)
drill +dnssec dnssec.works A @127.0.0.1

# bogus domains test
drill dnssec-failed.org A @127.0.0.1`,
      },
    },
    {
      title: 'Unbound: host overrides, split DNS and forwarding',
      content: `**Host overrides** — static local records without internal DNS server.

**Services → Unbound DNS → Overrides:**
\`\`\`
Host: crm.office.local
Domain: office.local
IP: 192.168.10.30
\`\`\`

**Split DNS / split horizon:**
- Internal clients resolve \`portal.company.com\` → 192.168.10.40
- External users same name → public CDN IP
- Override on Unbound for internal view

**Domain overrides (forward zone):**
- \`office.local\` → forward to DC 192.168.10.10
- \`ad.company.internal\` → DC
- All other → recursive

**Access control:**
- Unbound **Outgoing** — allow LAN subnets only
- **Incoming** — bind interfaces LAN, VLANs; not WAN

**DHCP integration:** register DHCP leases → automatic local A records.

**Reverse DNS (PTR):** limited on Unbound; AD DNS handles reverse for domain members.

**Migration tip:** document all overrides before moving DNS to dedicated appliance.`,
    },
    {
      title: 'DNS over TLS (DoT) upstream and client policy',
      content: `**DoT** — encrypt DNS queries to upstream resolver (Cloudflare 1.1.1.1, Quad9, etc.).

**Unbound as DoT client (to upstream):**
- Services → Unbound DNS → General → **DNS over TLS**
- Add TLS upstreams: \`1.1.1.1@853#cloudflare-dns.com\`
- Validates upstream cert hostname

**Use case:** ISP DNS snooping mitigation on WAN path; privacy for queries leaving OPNsense.

**DoT/DoH from clients (problem):**
- Chrome, Firefox bypass local DNS policy
- **Mitigation:** block known DoH endpoints (firewall alias), or force DNS to OPNsense only (block outbound 53 except Unbound)

**Force local DNS pattern:**
\`\`\`
LAN rule: allow UDP/TCP 53 to OPNsense IP
LAN rule: block UDP/TCP 53 to any (log)
Optional: block 443 to known DoH providers alias
\`\`\`

**Guest network:** stricter — only OPNsense DNS, no external 53/853.

**Corporate:** acceptable use policy + technical controls aligned.

**DNS over HTTPS (DoH):** Unbound native DoH upstream evolving; check OPNsense version docs.`,
    },
    {
      title: 'Dnsmasq vs Unbound: when to use which',
      content: `OPNsense historically offered **Dnsmasq** plugin (**os-dnsmasq**) as alternative lightweight DNS/DHCP.

**Comparison:**

| Criterion | Unbound | Dnsmasq |
|----------|---------|---------|
| **Role** | Full recursive resolver | Forwarder + cache + simple DHCP DNS |
| **DNSSEC** | Native validator | Limited / forward to validator |
| **Blocklists** | Rich ecosystem | Smaller |
| **Performance large lists** | Good with tuning | Less common |
| **Simplicity homelab** | Default, sufficient | Some prefer combined dnsmasq |
| **AD integration** | Forward zones | Same |

**Default recommendation:** **Unbound** — OPNsense default, better DNSSEC, blocklist plugins target Unbound.

**Dnsmasq when:**
- Legacy migration from pfSense dnsmasq config
- Tiny network, want minimal config
- Specific dnsmasq feature (dhcp-dns integrated quirks)

**Don't run both on same port 53** — conflict. Choose one primary listener per interface.

**DHCP DNS option:** point clients to OPNsense IP; whichever DNS service listens on 53.

**Migration Dnsmasq → Unbound:** export overrides, replicate as Unbound host overrides, test resolution before cutover.`,
    },
    {
      title: 'Captive Portal: guest Wi‑Fi and authentication',
      content: `**Captive Portal** — intercept HTTP(S) until user authenticates (click-through, voucher, RADIUS).

**Use cases:**
- Guest Wi‑Fi isolation with terms acceptance
- Hotel/event temporary access
- BYOD registration portal

**Setup overview:**
1. Services → Captive Portal → Zones → Add
2. Interface: Guest VLAN (OPT)
3. Authentication: **No authentication** (click) / **Local user** / **RADIUS**
4. Allowed addresses: exceptions (payment gateway, MDM)
5. Firewall: Guest already isolated from LAN

**Zone settings:**
- **Idle timeout** — disconnect inactive
- **Hard timeout** — max session duration
- **Traffic quotas** — optional bandwidth cap

**HTTPS limitation:** captive portal traditionally HTTP redirect; modern browsers HSTS can complicate — use dedicated SSID + clear UX.

**RADIUS integration:** forward auth to FreeRADIUS / Microsoft NPS for voucher or AD creds.

**Logging:** connection log per MAC/IP; export for audit.

**Security:**
- Guest VLAN firewall deny RFC1918 except portal/DNS
- Rate limit portal to prevent abuse
- Separate from corporate SSID (never shared VLAN)

**Alternatives:** Wi‑Fi controller guest (Omada, UniFi) may do portal on AP — avoid double portal.`,
    },
    {
      title: 'ClamAV and ICAP: antivirus filtering (limitations)',
      content: `**ClamAV** via **os-c-icap** + ClamAV — HTTP/FTP antivirus scanning. Relevance **declining** in 2026: TLS everywhere limits clear-text scanning.

**Architecture (when applicable):**
\`\`\`
Client HTTP (cleartext) → OPNsense ICAP proxy → ClamAV scan → origin
\`\`\`

**Reality check:**
- **HTTPS** default — without SSL bump AV on firewall useless for web
- Email AV — better on mail server (Exchange, M365)
- File download scan — partial value for HTTP only sites

**When still relevant:**
- Explicit proxy deployment with SSL inspection (rare on OPNsense vs FortiGate)
- Internal file server HTTP mirror cleartext
- Compliance checkbox «AV at gateway» legacy audit

**Setup if required:**
1. os-c-icap + ClamAV packages
2. Services → ICAP → configure listener
3. Clients must use proxy — PAC file
4. Update virus DB daily — \`freshclam\`

**Resource cost:** RAM for ClamAV DB ~1 GB; CPU on scan.

**Recommendation SMB:** invest in endpoint EDR (Defender, CrowdStrike) rather than gateway ClamAV unless clear HTTP use case.

**OPNsense strength:** IDS/Suricata malware rules complement (not replace) AV.`,
    },
    {
      title: 'Netflow, Insight and traffic analytics',
      content: `**Traffic visibility** beyond firewall logs:

**os-netflow plugin** — export flow records to collector:
- Netflow v5/v9, IPFIX
- Collectors: ntopng, Elastic, Mikrotik-style tools, PRTG

**Setup:**
1. Install os-netflow (or os-softflowd variant)
2. Services → Netflow → Enable on LAN/WAN
3. Collector IP and port (usually 2055 UDP)
4. Verify collector receives flows

**OPNsense Insight (built-in):**
- Reporting → Insight — local traffic stats (no plugin)
- Top talkers, protocols, interfaces
- Retention limited by disk — not long-term archive

**Use cases:**
- «Who consumed bandwidth?» — Insight quick answer
- Capacity planning — Netflow historical in ntopng
- Security: exfil detection — spike to unknown IP (complement Suricata)

**Privacy:** flow data = metadata gold; secure collector, retention policy.

**Alternatives:** mirror port to IDS appliance; switch sFlow from core switch — broader visibility than firewall-only flows.`,
    },
    {
      title: 'Dynamic DNS (DDNS) and Wake on LAN (WoL)',
      content: `**Dynamic DNS** — auto-update DNS A record when ISP changes WAN IP (consumer broadband, cheap business lines).

**Services → Dynamic DNS → Settings:**
- Provider: Cloudflare, DuckDNS, No-IP, AWS Route53, many others
- Interface: WAN (track IP)
- Hostname: \`home.office.com\`
- API credentials in settings (not in chat logs!)

**Cloudflare example fields:**
- Zone ID, API token (scoped DNS edit)
- Record name, proxied or DNS-only

**Use with:**
- VPN road warrior Endpoint hostname stable
- HAProxy ACME HTTP-01 (DNS-01 better if IP changes during propagation)
- Remote admin SSH (security: combine with key + fail2ban, not alone)

**Check interval:** 5 min typical; provider rate limits apply.

**Failover:** if DDNS fails, VPN users can't connect — monitor last successful update timestamp.

**Dual WAN:** track primary WAN interface; document failover DNS strategy (secondary record low TTL).

**os-wol** plugin — send magic packet from OPNsense UI/CLI to wake sleeping workstations or NAS.

**WoL requirements:**
- Target NIC supports WoL, enabled in BIOS/UEFI
- Target connected to switched LAN (magic packet L2 broadcast)
- MAC address known, machine on same subnet or directed broadcast configured

**WoL use cases:**
- Wake backup target before nightly job (script via API)
- Remote admin powers on office PC for support (policy dependent)
- Lab automation

**WoL setup:**
1. Install os-wol
2. Services → Wake on LAN → Add host MAC + interface LAN
3. Send magic packet from GUI

**Across subnets:** WoL generally doesn't cross routers; use directed broadcast to subnet broadcast address (security consideration — often disabled).

**Security:** restrict WoL UI to admin; magic packet spoofable on LAN — low risk but document.

**Alternative:** IPMI/iDRAC for servers — more reliable than WoL.`,
      code: {
        language: 'shell',
        caption: 'Check DDNS status via log',
        code: `# dynamic DNS update log
clog /var/log/system.log | grep -i dyndns | tail -20

# current WAN IP
curl -s ifconfig.me
ifconfig wan0 | grep inet`,
      },
    },
    {
      title: 'FreeRADIUS and LDAP: centralized authentication',
      content: `**VPN, Captive Portal, Wi‑Fi** — often need central auth. OPNsense integrates as **RADIUS client** or **LDAP reader** (not full IdP).

**Patterns:**

| Service | Auth backend |
|---------|--------------|
| OpenVPN | Local + RADIUS + LDAP |
| WireGuard | Keys (RADIUS not native WG) |
| Captive Portal | RADIUS, LDAP |
| Admin GUI | Local, LDAP, RADIUS 2FA plugins |

**RADIUS (os-freeradius optional on OPNsense OR external):**
- OPNsense as client → Microsoft NPS, FreeRADIUS VM, Authentik
- VPN → RADIUS for MFA (Duo via RADIUS attributes)

**LDAP (Active Directory):**
- System → Access → Servers → LDAP
- Bind DN service account (read-only)
- Group mapping → OPNsense admin privileges via LDAP group

**FreeRADIUS on OPNsense (os-freeradius):**
- Small office only — run RADIUS on firewall is coupling risk
- Better: dedicated RADIUS VM/container

**Best practice:**
- Service account with minimal AD permissions
- LDAPS (636) not plain LDAP
- Separate auth domain for VPN users vs domain admins
- Account lockout policy coordinated with AD

**Testing:** Diagnostics → Authentication → test LDAP bind before enabling on VPN.`,
      code: {
        language: 'text',
        caption: 'Example LDAP server config fields (GUI equivalent)',
        code: `Host:           dc01.office.local
Port:           636 (LDAPS)
Bind DN:        CN=opnsense-svc,OU=Service,DC=office,DC=local
Base DN:        DC=office,DC=local
User attribute: sAMAccountName
Group attribute: memberOf`,
      },
    },
    {
      title: 'Zabbix and Telegraf: monitoring OPNsense',
      content: `**Monitoring plugins:**
- **os-zabbix-agent** — classic Zabbix agent (passive/active checks)
- **os-zabbix6-agent** — version aligned to Zabbix 6.x
- **os-telegraf** — metrics to InfluxDB/Prometheus stack

**Zabbix template items:**
- CPU, RAM, disk
- Interface throughput, errors
- Gateway status, VPN tunnels
- Suricata alert rate (custom log item)
- Config backup age (external script)

**Setup Zabbix agent:**
1. Install os-zabbix6-agent
2. Services → Zabbix Agent → Enable, Server IP = Zabbix poller
3. Zabbix server: add host, link template **OPNsense** (community or custom)
4. Firewall: allow Zabbix server → OPNsense agent port 10050

**Telegraf alternative:**
- Modern metrics pipeline → Grafana
- SNMP still works without agent (System → Settings → SNMP)

**Alerting examples:**
- WAN gateway down → P1
- Disk > 85% (logs!)
- Suricata process not running
- Config.xml backup stale > 7 days

**Security:** agent port only from monitoring subnet; never expose 10050 to internet.`,
      code: {
        language: 'shell',
        caption: 'SNMP walk example (without agent plugin)',
        code: `# enable SNMP in System → Settings → SNMP
snmpwalk -v2c -c public opnsense-lan.example.com system
snmpwalk -v2c -c public opnsense-lan.example.com IF-MIB::ifInOctets`,
      },
    },
    {
      title: 'nginx and web proxy plugins',
      content: `**os-nginx** — alternative reverse proxy to HAProxy on OPNsense.

**HAProxy vs nginx on OPNsense:**

| | HAProxy | nginx |
|---|---------|-------|
| **Strength** | L4/L7 LB, health checks | Static, flexible reverse proxy |
| **ACME integration** | Mature on OPNsense | Supported |
| **Typical SMB** | Preferred for multi-backend LB | Single app, custom headers |
| **Config** | GUI focused | GUI + custom includes |

**os-web-proxy** (if available in version) — simplified forward proxy for clients (explicit proxy scenario).

**Pattern nginx:**
- Publish internal GitLab, Jenkins with nginx SNI routing
- Custom \`location\` blocks via advanced config includes

**Don't duplicate:** running HAProxy AND nginx both on 443 WAN — conflict. One front door per IP or use different ports (suboptimal).

**SSL:** same ACME client issues certs shared in Trust store.

**Maintenance:** nginx plugin updates may require config migration — backup before upgrade.`,
    },
    {
      title: 'Tor, VPN client packages: risks and policy',
      content: `**Outbound anonymity / bypass tools** in plugin repo — **os-tor**, OpenVPN client plugins, **os-wireguard** (legitimate VPN).

**Risks if misused:**
- **Tor on firewall** — exit node traffic from company IP reputation damage
- **Unauthorized VPN client** on OPNsense — bypass corporate DLP/policy
- **Shadow IT:** admin installs «for test», forgets — persistent backdoor path

**Legitimate uses:**
- WireGuard site-to-site (approved)
- OpenVPN client to cloud VPC
- Tor research isolated lab network (never production LAN)

**Policy:**
- Change control for any VPN client plugin
- Document peer endpoints and crypto keys rotation
- Firewall rules: WG tunnel only to approved subnets

**Detection:** internal audit — \`pkg info | grep os-\` quarterly.

**Compliance:** PCI/HIPAA — Tor on edge likely violation.

**Alternative:** route specific container through Tor on isolated VLAN lab — not on core firewall.`,
    },
    {
      title: 'Safe plugin and core updates',
      content: `**Maintenance window procedure:**

1. **Read** release notes (OPNsense + each os-* plugin)
2. **Backup** config.xml — automated + manual download
3. **Snapshot** VM if virtualized
4. **Lab** clone apply same updates first (same plugin set)
5. **Update core:** System → Firmware → Updates
6. **Reboot** if kernel update requires
7. **Update plugins** one batch or individually per risk
8. **Verify** services: Suricata, HAProxy, Unbound, VPN
9. **Smoke test:** internet, VPN, published apps, DNS
10. **Monitor** 24h — CPU, alerts, helpdesk

**Ordering:**
- Core first, plugins second (standard)
- Never skip versions on production without reading migration notes

**Rollback:**
- VM snapshot restore fastest
- config.xml restore on same firmware version
- Downgrade core — painful; avoid

**Automation:** API/cron for backup; not for silent auto-update production without lab validation.

**Plugin-specific:** Suricata rule update separate from package update — can break IPS; schedule rules update off-peak after package stable.`,
    },
    {
      title: 'Conflict avoidance: common plugin conflicts',
      content: `**Port 53 conflict:**
- Unbound vs Dnsmasq vs BIND plugin — only one listener
- Fix: disable one service; explicit DNS assignment per interface

**Port 443 WAN conflict:**
- HAProxy vs nginx vs port forward to same IP
- Fix: single entry point; HAProxy routes all HTTPS

**Suricata + Zenarmor CPU:**
- Both on LAN 1 Gbps — saturation
- Fix: tier responsibilities; WAN Suricata, LAN Zenarmor OR reduce inspection scope

**ICAP + transparent proxy + Suricata:**
- Complex pathing; double inspection
- Fix: architecture review; usually pick one inspection layer

**ACME HTTP-01 + WAN redirect all to HTTPS:**
- Challenge fails if port 80 blocked
- Fix: allow \`/.well-known/acme-challenge/\` exception rule

**OpenVPN + WireGuard same tunnel subnet:**
- Routing overlap
- Fix: unique tunnel address spaces

**Logging disk fill:**
- Suricata + HAProxy + Insight + firewall log verbose
- Fix: remote syslog, log rotation, reduce log levels

**Config sync HA (CARP):**
- Some plugins don't sync or need manual on secondary — check plugin docs before HA deployment.

**Checklist new plugin:**
- [ ] Ports used?
- [ ] RAM/CPU budget?
- [ ] Conflicts with existing?
- [ ] Backup/restore tested?
- [ ] HA compatibility?`,
    },
    {
      title: 'Practical labs: hands-on scenarios',
      content: `**Lab 1 — Suricata WAN IDS tuning:**
- Install os-suricata, ET Open, IDS WAN only
- Generate external scan (approved lab scanner)
- Review alerts, suppress FP, document 5 SIDs disabled

**Lab 2 — HAProxy + ACME publish app:**
- Backend nginx on LAN 192.168.1.50:8080
- HAProxy WAN 443 SSL terminate
- ACME cert for \`lab.example.com\` HTTP-01
- Verify curl external HTTPS

**Lab 3 — Unbound blocklist + DNS force:**
- Enable malware blocklist
- Query known malware test domain → blocked
- Try client DNS 8.8.8.8 → firewall block

**Lab 4 — Captive Portal Guest:**
- Guest VLAN, portal click-through, isolation from LAN
- Verify RFC1918 blocked post-auth

**Lab 5 — DDNS + WireGuard:**
- DuckDNS update on WAN change simulation
- WG endpoint uses DDNS hostname

**Lab 6 — Zabbix monitoring:**
- Agent on OPNsense, template linked, alert on stopped Suricata

**Lab topology suggestion:**
\`\`\`
[WAN] OPNsense [LAN] ── test clients VM
              └── [OPT Guest VLAN] ── Wi‑Fi AP test
\`\`\`

Document each lab: objective, steps, verification, rollback.`,
    },
    {
      title: 'FAQ and Interview Q&A: OPNsense services and plugins',
      content: `**Q: Suricata IPS broke an app — what to do first?**
A: Switch to IDS temporarily, find SID in alerts, add pass/suppress, re-enable IPS rule selectively.

**Q: HAProxy or port forward?**
A: Single backend simple app — port forward OK. Multiple backends, health checks, SNI — HAProxy.

**Q: Need Pi-hole if Unbound blocklist?**
A: Usually no for SMB; Pi-hole adds UI and group policies; operational cost another VM.

**Q: Zenarmor free tier enough?**
A: Homelab small; office 50+ devices — check license math vs FortiGate quote.

**Q: Let's Encrypt cert did not renew?**
A: Check port 80 reachability, DNS correct, acme.log, rate limits; staging test.

**Q: DNSSEC SERVFAIL on one site?**
A: Likely broken domain or ISP forwarder issue; try recursive without forwarder; temporary disable strict.

**Q: ClamAV worth it?**
A: Rarely at gateway 2026; endpoint EDR priority.

**Q: Plugins after upgrade missing menu?**
A: \`pluginctl -g\` regenerate; reinstall plugin; check pkg corruption.

**Q: CARP HA + Suricata?**
A: Possible; state sync doesn't include Suricata state — document failover Suricata restart behavior.

**Q: Can plugins be managed via API?**
A: Limited REST API; config export/import; full automation often config.xml templating (Ansible) — test carefully.

---

**Interview Q1: Explain difference IDS vs IPS in Suricata on OPNsense.**
A: IDS detects and logs without blocking; IPS inline drops matching signatures. IPS requires tuning to avoid FP outages.

**Interview Q2: How do you publish multiple HTTPS apps on one WAN IP?**
A: HAProxy reverse proxy with SNI/ACL routing, SSL termination, backends on internal ports; ACME for cert lifecycle.

**Interview Q3: DNS filtering architecture without client bypass?**
A: Unbound blocklists on OPNsense, firewall block outbound DNS except to Unbound, block known DoH, optional redirect port 53.

**Interview Q4: Compare Suricata and Zenarmor.**
A: Suricata signature IDS/IPS packet engine; Zenarmor L7 app control and filtering with cloud management; complementary but CPU costly together.

**Interview Q5: Safe plugin update procedure?**
A: Backup config, snapshot, lab test same versions, update core then plugins, smoke tests, monitor 24h, rollback plan.

**Interview Q6: When use DNS-01 ACME vs HTTP-01?**
A: DNS-01 for wildcards and internal names without public HTTP; HTTP-01 simpler when port 80 open on WAN.

**Interview Q7: RADIUS vs LDAP for VPN auth?**
A: RADIUS common for VPN MFA integration; LDAP direct for AD groups; often RADIUS front (NPS) with AD backend.

**Interview Q8: Why not run Dnsmasq and Unbound together?**
A: Port 53 conflict; Unbound preferred for DNSSEC and blocklists on OPNsense.

**Interview Q9: Netflow use case on firewall?**
A: Bandwidth accountability, anomaly detection, historical trends in collector; not replacement for IDS.

**Interview Q10: Gateway AV relevance?**
A: Declining due to TLS; endpoint security primary; Suricata malware rules at network layer supplement.`,
    },
    {
      title: 'Case: transparent proxy and SSL inspection (OPNsense limitations)',
      content: `**Scenario:** company with 80 users wants "transparent proxy" with URL filtering without client PAC configuration.

**Expectation vs reality:**
- Modern HTTPS — without SSL bump proxy sees only SNI/IP (declining visibility)
- OPNsense not FortiGate-level SSL inspection out of box
- «Transparent» often means DNS filtering + Suricata/Zenarmor L7, not full URL in TLS

**Implemented architecture:**
\`\`\`
Users → OPNsense Unbound (blocklist + force DNS)
     → Zenarmor L7 policy on LAN (app/category block)
     → Suricata IDS WAN (malware callbacks)
     → Explicit deny Guest DoH
\`\`\`

**Not implemented (scope/cost):**
- SSL deep inspection — would need specialized proxy + CA deployment on all endpoints
- ICAP ClamAV — rejected (TLS)

**Results:**
- 90% policy goals met without SSL bump
- Helpdesk FP tickets Suricata week 1 — tuned 15 rules
- Zenarmor license cost accepted vs FortiGate renewal quote

**Lesson:** position OPNsense strength as DNS + IDS + routing; set SSL inspection expectations early with management.`,
    },
    {
      title: 'Case: DNS filtering for 120-user office',
      content: `**Context:** office with 120 users, Guest Wi‑Fi, need malware DNS block, no Pi-hole budget, AD DNS for domain.

**Design:**
- **AD DNS** authoritative \`office.local\`, DHCP option 6 → OPNsense LAN IP
- **Unbound** on OPNsense: forward \`office.local\` → DC, recursive + DNSSEC for rest
- **Blocklist:** malware/phishing lists only (no ads — management decision)
- **Firewall:** LAN deny UDP/TCP 53 except to OPNsense; log violations
- **Guest VLAN:** same DNS force, stricter blocklist category social optional

**Bypass handling:**
- Alias external DoH IPs blocked on firewall
- Chrome policy enterprise — disable Secure DNS (GPO)

**Monitoring:**
- Unbound query log sampled to syslog
- Alert spike NXDOMAIN blocklist hits — possible malware campaign

**Incident:** Cryptominer on workstation — C2 domain blocked by DNS, Suricata WAN alert confirmed; host isolated via switch port disable.

**Metrics after 6 months:**
- DNS blocks ~200/day benign false near zero after list curation
- Zero client DNS bypass tickets after GPO

**Rollback plan:** DHCP DNS → DC only, disable blocklist — documented in runbook.`,
    },
    {
      title: 'Case: Suricata IPS on WAN production MSP edge',
      content: `**Context:** MSP manages 40 OPNsense CPE VMs, asymmetric routing avoided, each site 20–50 users, WAN DSL/fiber.

**Phase 1 (month 1):** IDS all sites WAN, central Wazuh ingest Eve JSON, no IPS block.

**Phase 2:** IPS enable per site after local FP review template:
- Global pass: MS Update, Teams, Zoom IP ranges (aliases)
- Disabled categories: POLICY, P2P
- Custom pass internal backup traffic

**Operations:**
- Rule update Sunday 02:00 local cron staggered
- Zabbix alert: suricata not running, eve.json growth anomaly
- Playbook: FP ticket → SID suppress → push config via XMLRPC template

**Incident win:** mass scan campaign blocked IPS WAN before reaching vulnerable legacy DVR on one site port forward (scheduled for removal).

**Incident pain:** ET rule update broke ERP vendor cloud — IPS drop; rollback ruleset previous day snapshot; pass rule added.

**Hardware sizing:** 2 vCPU 4 GB min per site IPS WAN up to 300 Mbps observed; CPU 60% peak.

**MSP lesson:** standardize plugin versions across fleet; one site rogue plugin update = support nightmare.

**Client reporting:** monthly top signatures + blocked count PDF from Wazuh dashboard.`,
    },
  ],
  practice: [
    'Install os-suricata and os-haproxy; verify pkg info | grep os- and configctl status for each service',
    'Configure Suricata IDS on WAN with ET Open; generate test scan alert and find SID in Eve JSON',
    'After 20+ alerts build suppress/pass list for 3 false positives and document SIDs',
    'Deploy HAProxy reverse proxy: WAN 443 → internal web 192.168.1.50:8080 with health check',
    'Configure os-acme-client Let\'s Encrypt HTTP-01 for lab hostname; verify auto-renew in acme.log',
    'Enable Unbound DNSSEC and malware blocklist; verify drill +dnssec and blocked malware test domain',
    'Implement force DNS: firewall block outbound 53 except OPNsense; verify bypass with 8.8.8.8 from client',
    'Configure Captive Portal on Guest VLAN: click-through, RFC1918 isolation, test from Wi-Fi client',
    'Connect Zabbix agent: OPNsense template, alert on stopped Suricata, verify on Zabbix server',
    'Run maintenance drill: backup config.xml, update plugin in lab, smoke test DNS/VPN/HAProxy, document rollback',
  ],
  resources: [
    { title: 'OPNsense Plugins Documentation', url: 'https://docs.opnsense.org/manual/plugins.html' },
    { title: 'OPNsense Intrusion Detection (Suricata)', url: 'https://docs.opnsense.org/manual/ips.html' },
    { title: 'OPNsense HAProxy How-To', url: 'https://docs.opnsense.org/manual/how-tos/haproxy.html' },
    { title: 'OPNsense ACME Client', url: 'https://docs.opnsense.org/manual/acme.html' },
    { title: 'OPNsense Unbound DNS', url: 'https://docs.opnsense.org/manual/unbound.html' },
    { title: 'Zenarmor (Sensei) Documentation', url: 'https://www.zenarmor.com/docs' },
    { title: 'Suricata Rule Tuning Guide', url: 'https://docs.suricata.io/en/suricata-7.0.0/configuration/suricata-yaml.html' },
    { title: 'OPNsense Forum — Plugins', url: 'https://forum.opnsense.org/index.php?board=12.0' },
  ],
  quiz: [
    {
      question: 'Suricata IDS vs IPS on OPNsense:',
      options: ['IDS detects and logs; IPS inline drops matching signatures', 'IDS blocks all traffic; IPS only logs', 'Both are identical', 'IPS does not use rules'],
      answer: 'IDS detects and logs; IPS inline drops matching signatures',
    },
    {
      question: 'First step when Suricata IPS breaks a legitimate app:',
      options: ['Switch to IDS temporarily, find SID, add pass/suppress', 'Delete all rules', 'Disable firewall entirely', 'Reinstall OPNsense'],
      answer: 'Switch to IDS temporarily, find SID, add pass/suppress',
    },
    {
      question: 'Publishing multiple HTTPS apps on one WAN IP uses:',
      options: ['HAProxy reverse proxy with SNI/ACL routing and SSL termination', 'Multiple port forwards to same port', 'Dnsmasq only', 'Captive Portal'],
      answer: 'HAProxy reverse proxy with SNI/ACL routing and SSL termination',
    },
    {
      question: 'DNS-01 ACME challenge is preferred when:',
      options: ['Wildcards or internal names without public HTTP', 'Port 80 is wide open on WAN', 'Only OpenVPN needs certs', 'Suricata is in IDS mode'],
      answer: 'Wildcards or internal names without public HTTP',
    },
    {
      question: 'Why not run Dnsmasq and Unbound together on OPNsense?',
      options: ['Port 53 conflict; Unbound preferred for DNSSEC and blocklists', 'They use different ports by default', 'Dnsmasq cannot forward zones', 'Unbound cannot do recursion'],
      answer: 'Port 53 conflict; Unbound preferred for DNSSEC and blocklists',
    },
    {
      question: 'Zenarmor compared to Suricata:',
      options: ['Zenarmor L7 app control; Suricata signature IDS/IPS — complementary but CPU costly together', 'Identical engines', 'Zenarmor replaces all firewall rules', 'Suricata only does DNS filtering'],
      answer: 'Zenarmor L7 app control; Suricata signature IDS/IPS — complementary but CPU costly together',
    },
    {
      question: 'Gateway ClamAV/ICAP relevance in 2026:',
      options: ['Declining due to TLS; endpoint EDR is primary', 'Mandatory for all SMB', 'Replaces Suricata', 'Required for WireGuard'],
      answer: 'Declining due to TLS; endpoint EDR is primary',
    },
    {
      question: 'Safe OPNsense plugin update order:',
      options: ['Backup, lab test, update core then plugins, smoke test, monitor', 'Update plugins before core always', 'Auto-update production without lab', 'Skip release notes'],
      answer: 'Backup, lab test, update core then plugins, smoke test, monitor',
    },
    {
      question: 'Command to list installed os-* OPNsense plugins:',
      answer: 'pkg info | grep \'^os-\'',
      explanation: 'Also use configctl status <service> for plugin-managed daemons.',
    },
    {
      question: 'Netflow on OPNsense is used for:',
      options: ['Bandwidth accountability and anomaly detection in a collector', 'Replacing IDS entirely', 'WireGuard key exchange', 'LDAP authentication'],
      answer: 'Bandwidth accountability and anomaly detection in a collector',
    },
  ],
}

export default translation
