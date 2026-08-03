import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'DHCP and DNS in the office',
  duration: '10–12 hours',
  description:
    'DHCP scopes by VLAN, reservations, DNS split-horizon, AD-integrated DNS, forwarders and typical problems',
  sections: [
    {
      title: 'The role of DHCP and DNS in a corporate network',
      content: `**DHCP** and **DNS** are two pillars without which the office cannot function. The user sees “no Internet”, and the reason is often DNS; “I can’t log into the domain” - DHCP issued the wrong DNS.

**DHCP issues (options):**
- IP address, subnet mask
- Default gateway (router)
- DNS servers
- Domain name (option 15)
- Lease time
- Optional: NTP (42), PXE (66/67), VoIP (66/150)

**DNS responds to:**
- company.local → internal servers
- google.com → internet via forwarders
- _ldap._tcp.company.local → AD SRV for domain join

**Golden Rule:** domain clients **always** use DNS DC, never only 8.8.8.8.`,
    },
    {
      title: 'Where to place the DHCP server',
      content: `| Option | Pros | Cons | When |
|---------|-------|--------|-------|
| **Windows Server** | AD integration, failover, GPO | Need a server | 30+ users, AD |
| **FortiGate** | Simple, per-VLAN GUI | Limited advanced | 10–30 users SMB |
| **Omada Gateway** | Cheap SMB | Basic | Small office |
| **Linux ISC dhcpd** | Flexibly | Manual, no GUI | DevOps shops |
| **DHCP to DC only** | Best practice AD ​​| DC dependency | Enterprise |

**CRITICAL: never two active DHCP on one scope** - IP conflicts, random failures.

**DHCP Failover (Windows):** hot standby or load balance between 2 DCs - 50+ users recommended.`,
    },
    {
      title: 'DHCP scopes by VLAN: full table',
      content: `**Scopes for office 50 users:**

| Scope name | VLAN | Network | Exclusions | Pool | Lease |
|------------|------|---------|------------|------|-------|
| Workstations | 20 | 192.168.20.0/23 | .1-.99 | .100-.250 | 8h |
| VoIP | 30 | 192.168.30.0/24 | .1-.49 | .50-.200 | 24h |
| Printers | 40 | 192.168.40.0/24 | .1-.49 | .50-.100 + reservations | 7d |
| WiFi-Corp | 50 | 192.168.50.0/24 | .1-.49 | .100-.250 | 4h |
| WiFi-Guest | 60 | 192.168.60.0/24 | .1-.9 | .10-.200 | 1h |
| IoT | 70 | 192.168.70.0/24 | static only | — | — |
| Management | 99 | 192.168.99.0/24 | all static | — | — |

**Options per scope:**
- Option 003 Router: VLAN gateway (.1)
- Option 006 DNS: 192.168.10.10, 192.168.10.11 (DCs)
- Option 015 Domain: company.local
- Option 042 NTP: 192.168.10.10 (optional)`,
      code: {
        language: 'powershell',
        caption: 'DHCP scope on Windows Server',
        code: `Add-DhcpServerv4Scope -Name "Workstations-VLAN20" -StartRange 192.168.20.100 -EndRange 192.168.20.250 -SubnetMask 255.255.255.0
Set-DhcpServerv4OptionValue -ScopeId 192.168.20.0 -Router 192.168.20.1
Set-DhcpServerv4OptionValue -ScopeId 192.168.20.0 -DnsServer 192.168.10.10, 192.168.10.11
Set-DhcpServerv4OptionValue -ScopeId 192.168.20.0 -DnsDomain "company.local"
Add-DhcpServerv4ExclusionRange -ScopeId 192.168.20.0 -StartRange 192.168.20.1 -EndRange 192.168.20.99`,
      },
    },
    {
      title: 'DHCP on FortiGate',
      content: `**FortiGate DHCP server per interface:**

**GUI path:** Network → Interfaces → VLAN20 → DHCP Server → Enable

**Settings:**
- Address range: 192.168.20.100–250
- Netmask: 255.255.255.0
- Default gateway: Same as interface IP
- DNS server: Specify 192.168.10.10, 192.168.10.11
- Lease time: 28800 sec (8h)

**DHCP Relay (when DHCP is on Windows, clients are on other VLANs):**

On FortiGate interface VLAN20:
- DHCP Relay → Enable
- Server IP: 192.168.10.10 (DC DHCP)

On switch (if relay is on switch):
- ip helper-address 192.168.10.10 on VLAN SVI

**Reservation on FG:** Network → DHCP Servers → reserved address by MAC`,
    },
    {
      title: 'Reservations and static addressing',
      content: `**When reservation (DHCP reservation by MAC):**
- Printers — users bookmark IP, drivers
- Servers — actually use static on server, not DHCP
- AP management — static or reservation
- Special devices — cameras with fixed ACL

**When static IP on device:**
- Domain Controllers — **always static**
- Core switches, firewall — static
- Critical servers

**Reservation example printers:**

| Device | MAC | IP | Scope |
|--------|-----|-----|-------|
| HP-F2-MFP | AA:BB:CC:11:22:33 | 192.168.40.10 | Printers |
| HP-F1 | AA:BB:CC:11:22:44 | 192.168.40.11 | Printers |

**Document in IPAM:** MAC, IP, owner, location.`,
      code: {
        language: 'powershell',
        caption: 'DHCP reservation Windows',
        code: `Add-DhcpServerv4Reservation -ScopeId 192.168.40.0 -IPAddress 192.168.40.10 -ClientId "AA-BB-CC-11-22-33" -Name "HP-MFP-Floor2" -Description "2nd floor copier"`,
      },
    },
    {
      title: 'DHCP Relay: architecture and configuration',
      content: `**Problem:** DHCP broadcast does not cross routers. Client on VLAN 50, DHCP server on VLAN 10.

**Solution - DHCP Relay (IP Helper):**

\\\`\\\`\\\`
Client (VLAN 50) DHCP Discover (broadcast)
    → Switch/FortiGate relay agent
    → Unicast to DHCP server 192.168.10.10
    → DHCP Offer unicast back via relay
    → Client receives IP in VLAN 50 scope
\\\`\\\`\\\`

**Windows DHCP:** you need scope for 192.168.50.0/24 on the server + relay on each VLAN without local DHCP.

**FortiGate relay:** per-interface, indicates IP DC.

**Check:** DHCP log on server shows relay agent IP.`,
    },
    {
      title: 'DNS in the office: AD-integrated',
      content: `**Active Directory DNS zones:**
- company.local (or corp.internal - preferable for new domains, avoid .local for Mac/Linux mDNS conflict)
- _msdcs.company.local
- SRV records: _ldap, _kerberos, _gc

**Post types:**

| Type | Example | Destination |
|-----|--------|------------|
| A | fileserver.company.local → 192.168.10.20 | Host |
| CNAME | www → webserver | Alias |
| MX | mail.company.com → external | Email routing |
| SRV | _ldap._tcp | AD discovery |
| PTR | reverse DNS | Troubleshooting, mail |

**Dynamic updates:** AD-joined PCs register A record automatically (secure dynamic update).`,
    },
    {
      title: 'Forwarders and root hints',
      content: `**DNS resolution flow on DC:**

\\\`\\\`\\\`
Client query: google.com
    → DC DNS (192.168.10.10)
    → Not in company.local zone
    → Forwarder: 1.1.1.1 or 8.8.8.8
    → Response to client

Client query: fileserver.company.local
    → DC DNS
    → Local zone answer
\\\`\\\`\\\`

**Forwarders (recommended):**
- Cloudflare 1.1.1.1, 1.0.0.1
- Google 8.8.8.8, 8.8.4.4
- ISP DNS (backup)

**The setting is the same for ALL DC** - otherwise inconsistent results.

**Root hints:** alternative to forwarders, DC queries root servers directly — less common now.

**Conditional forwarder:** partner.local → 10.50.0.10 (partner DC) for cross-forest.`,
    },
    {
      title: 'Split-horizon DNS',
      content: `**Split-horizon (split-brain):** same name, different answers inside vs outside.

**Example:**
- vpn.company.com internal → 192.168.10.5 (private)
- vpn.company.com external → 203.0.113.50 (public WAN IP)

**Implementation:**
- Internal zone on AD DNS: vpn → private IP
- Public zone at Cloudflare/registrar: vpn → public IP

**Problem without split-horizon:**
- Internal user resolves public IP → hairpin through WAN → slow/fail
- Fix: internal DNS override OR NAT loopback on firewall

**Delegation zone:** subdomain dev.company.local → separate DNS server.`,
    },
    {
      title: 'Public DNS: MX, SPF, DKIM, DMARC',
      content: `**Email DNS (at registrar or Cloudflare):**

| Record | Example | Destination |
|--------|--------|------------|
| MX | 10 mail.company.com | Mail routing |
| SPF TXT | v=spf1 include:spf.protection.outlook.com -all | Anti-spoof |
| DKIM | selector._domainkey CNAME | Signing |
| DMARC | v=DMARC1; p=quarantine | Policy |

**VPN:**
- A record vpn.company.com → public IP
- Or CNAME to dynamic DNS

**Not host mail on-prem without expertise** - Microsoft 365 / Google Workspace preferred.`,
    },
    {
      title: 'DNS on FortiGate',
      content: `**FortiGate DNS roles:**

1. **System DNS** - for FG itself (updates, FQDN objects)
2. **DNS Server** — optional, FG as DNS for clients (rare, use DC)
3. **DNS Filter** — block malicious domains

**Typical SMB:** clients use DC DNS, FG does not serve DNS to LAN.

**FG as DNS forwarder (small office without DC):**
- Network → DNS Servers → Create zones
- Forward company.local to DC if hybrid

**DNS over HTTPS (DoH) on clients:**
- Bypasses corporate filtering
- Block via firewall policy or GPO disable DoH in Edge/Chrome`,
    },
    {
      title: 'Troubleshooting matrix: DHCP',
      content: `| Symptom | Check | Fix |
|---------|----------|-----|
| APIPA 169.254.x.x | DHCP server up? Relay? | Fix server/relay |
| Wrong subnet IP | Rogue DHCP? | Disable rogue, DHCP snooping |
| IP conflict | Duplicate reservation | Remove duplicate |
| Lease not renewing | Scope exhausted? | Expand pool, shorten lease |
| Works wired not WiFi | Separate scope? Relay on AP VLAN? | Add scope + relay |
| Slow DHCP | Server overloaded | Failover, check logs |
| Wrong gateway | Scope options wrong | Fix option 003 |
| Wrong DNS | Option 006 wrong | Point to DC |

**Client commands:**
- ipconfig /all — DHCP server, lease time, DNS
- ipconfig /release && ipconfig /renew
- ipconfig /flushdns (after DNS fix)`,
    },
    {
      title: 'Troubleshooting matrix: DNS',
      content: `| Symptom | Check | Fix |
|---------|----------|-----|
| Internet ok, domain fail | DNS = 8.8.8.8 only? | Set DC DNS |
| Domain ok, internet fail | No forwarders on DC | Add forwarders |
| Intermittent resolution | DC1 ok, DC2 broken | Sync DNS settings |
| One server not found | A record missing? | Add record / register |
| Slow DNS | Root hints broken | Use forwarders |
| External works, internal not | Wrong suffix | Primary DNS suffix GPO |
| After VPN | Split DNS missing | VPN DNS suffix |

**Teams:**
- nslookup company.local
- nslookup google.com
- nslookup -type=SRV _ldap._tcp.company.local
- nslookup -type=ANY company.local 192.168.10.10
- dig @192.168.10.10 fileserver.company.local (Linux/Mac)

**“Internet is available, domain is not”** → client DNS not DC
**“There is a domain, but there is no Internet”** → DC forwarders missing/broken`,
    },
    {
      title: 'VoIP DHCP options',
      content: `**IP Phone provisioning options:**

| Option | Value | Destination |
|--------|-------|------------|
| 66 (TFTP) | 192.168.10.15 | Config server |
| 150 (TFTP) | 192.168.10.15 | Cisco phones |
| 120 (SIP) | sip.pbx.local | SIP server |

**Separate VLAN 30 scope** with voice options, short lease not needed (24h).

**QoS:** phones detect via LLDP-MED or DHCP option.`,
    },
    {
      title: 'DHCP Failover Windows Server',
      content: `**Setting failover (2 DC):**

1. Both DC have DHCP role
2. Right-click scope → Configure Failover
3. Mode: Hot Standby (one active) or Load Balance
4. Partner server: DC2
5. Shared secret
6. Test: stop DHCP on DC1, clients renew from DC2

**Recommendation:** Hot Standby 80/20 for 50+ users.`,
      code: {
        language: 'powershell',
        caption: 'Checking DHCP failover status',
        code: `Get-DhcpServerv4Failover -ScopeId 192.168.20.0 | Format-List
Get-DhcpServerv4ScopeStatistics -ScopeId 192.168.20.0`,
      },
    },
    {
      title: 'DHCP and DNS Monitoring',
      content: `**DHCP alerts:**
- Scope > 90% utilized
- DHCP service stopped
- Failover partner unreachable
- Rogue DHCP detected (snooping trap)

**DNS alerts:**
- DNS service down on DC
- Zone transfer failed
- Query latency high
- Secure dynamic update failures

**Windows logs:**
- DHCP Server log: Application and Services
- DNS Server log: DNS Events

**PRTG sensors:** DHCP scope usage %, DNS response time`,
    },
    {
      title: 'Best practices checklist',
      content: `**DHCP:**
- [ ] One authority per scope
- [ ] Reservations documented in IPAM
- [ ] Exclusions for infrastructure
- [ ] Failover for 50+ users
- [ ] Relay on every VLAN without local DHCP
- [ ] Lease time appropriate (8h workstations, 7d printers)

**DNS:**
- [ ] All clients use DC DNS
- [ ] Forwarders on all DCs identical
- [ ] Reverse zones for key subnets
- [ ] Scavenging enabled (stale records)
- [ ] Split-horizon documented
- [ ] SPF/DKIM/DMARC for mail`,
    },
    {
      title: 'Practical case: DHCP/DNS office 50 users',
      content: `**Scenario:** 2 DC, FortiGate dual WAN, 7 VLAN, DHCP on Windows, DNS AD-integrated.

**DC1 (192.168.10.10) — DHCP primary:**
- Scopes: VLAN 20,30,40,50,60 (not 10,99 — static)
- Failover partner DC2 Hot Standby
- DNS: AD integrated zone company.local

**DC2 (192.168.10.11) — DHCP standby + DNS secondary:**
- Identical forwarders: 1.1.1.1, 8.8.8.8
- GC, DNS, DHCP failover partner

**FortiGate:**
- DHCP relay on VLAN 20,50,60 interfaces → 192.168.10.10
- Policies allow DHCP broadcast relay
- Guest VLAN 60: local DHCP optional (isolated, FG as server)

**Reservations:**
- 4 printers VLAN 40
- 6 AP management VLAN 99

**Validation tests:**
1. Laptop VLAN 20: ipconfig shows DC DNS, correct gateway
2. nslookup _ldap._tcp.company.local → SRV records both DC
3. nslookup google.com → resolves via forwarder
4. Disconnect DC1 → client renews, DHCP from DC2 < 60 sec
5. Guest laptop: internet ok, ping 192.168.10.10 blocked`,
    },
    {
      title: 'DNS scavenging and stale records',
      content: `**Problem:** stale A records from reinstalled PCs → wrong IP, connection failures.

**DNS scavenging on Windows:**
1. DNS Manager → zone company.local → Properties
2. Aging: no-refresh 7 days, refresh 7 days
3. Scavenging: enable on zone
4. Server aging/scavenging: enable global
5. Wait refresh interval before expecting cleanup

**Static records:** disable aging on DC, fileserver, printers.

**PTR reverse zones:** create for 192.168.10.0/24, 20.0/23 - helps troubleshooting and mail reverse DNS if on-prem mail.`,
    },
    {
      title: 'Windows DHCP Failover',
      content: `Hot standby: primary DC01 secondary DC02 scope 80/20 split or 50/50 load balance. Add-DhcpServerv4Failover command. Test: stop DHCP on primary, clients renew ok.`,
    },
    {
      title: 'DNSSEC intro',
      content: `Signed zones validate responses. AD DNS rarely DNSSEC internal; external zones on Cloudflare DNSSEC. Office: understand chain of trust concept.`,
    },
    {
      title: 'Split-brain DNS',
      content: `Same name internal vs external different IP. corp.com internal AD, external website. Conditional forwarders + stub zones. Avoid duplicate zones on wrong servers.`,
    },
    {
      title: 'Pi-hole vs AD DNS',
      content: `Pi-hole blocks ads DNS level; breaks AD if replaces DC DNS. Correct: forward AD→Pi-hole or use Pi-hole only guest VLAN with caution.`,
    },
    {
      title: 'Conditional forwarders lab',
      content: `AD DNS forward partner.local to 10.10.10.1. Lab: 2 namespaces, verify nslookup cross-domain.`,
    },
    {
      title: 'IPv6 in office intro',
      content: `ULA fd00::/48, DHCPv6 or SLAAC, dual-stack firewall policies, disable if not managed — broken IPv6 worse than none.`,
    },
    {
      title: 'Laboratory (16 steps)',
      content: `**Goal:** complete the full operational workflow from symptom to postmortem and process improvement.

**Preparation (30 min):** ITSM trial / lab VM / Excel dashboard template / read-only access to FortiGate or Omada (optional).

| # | Step | Details | Done |
|---|-----|--------|------|
| 1 | Prepare the environment | Portal, 3 queues, email-to-ticket | ☐ |
| 2 | SLA policies | P1 15m/4h, P3 4h/24h, pause Pending | ☐ |
| 3 | KB deflection | 5 articles: VPN, password, Wi‑Fi, Outlook, printer | ☐ |
| 4 | Create Incident | “No Internet”, category Network, P3 | ☐ |
| 5 | Fill in context | Asset tag, floor, scope 1 user, screenshot | ☐ |
| 6 | L1 diagnostics | ipconfig, ping GW, ping 8.8.8.8, nslookup | ☐ |
| 7 | Document | Each command + output in ticket comment | ☐ |
| 8 | Escalation | 10-field form L1→L3 if undecided 20 min | ☐ |
| 9 | L2/L3 fix | Root cause: DNS or DHCP - apply fix | ☐ |
| 10 | Resolve | Resolution notes + link KB | ☐ |
| 11 | CSAT | Mock survey 1–5 + comment | ☐ |
| 12 | Service Request | “Monitor 27"” — manager approval flow | ☐ |
| 13 | Problem ticket | Link 3 similar VPN incidents | ☐ |
| 14 | P1 simulation | Tabletop “whole office offline” + war room roles | ☐ |
| 15 | Comms draft | 3 emails: T+0, T+30, Resolved | ☐ |
| 16 | Dashboard | FRT, MTTR, SLA%, reopen rate — 4 charts Excel | ☐ |
| 17 | Postmortem | Blameless 1 page, 3 action items | ☐ |
| 18 | Automation | Rule: category Network → L3 queue | ☐ |
| 19 | Retro | 2 improvements in CSI register | ☐ |
| 20 | Peer review | A colleague checks the ticket quality checklist | ☐ |

**Success criteria:** ticket audit score ≥90%; postmortem action items assigned; dashboard reflects mock data.`,
    },
    {
      title: 'FAQ - 12 frequently asked questions',
      content: `| # | Question | Answer |
|---|--------|--------|
| 1 | Incident vs Service Request? | Incident = broken, restore ASAP. Request = standard catalog service. |
| 2 | When to escalate? | No progress 20 min; infrastructure affected; L2/L3 rights are required; security event. |
| 3 | Can I reset my password by email? | No without multi-factor identity verification according to policy. |
| 4 | CEO requires P1 for printer? | Explain impact matrix; arrange the correct P3/P4 priority. |
| 5 | Do I need a ticket for a 2-minute fix? | Yes - audit trail, metrics, KB input. |
| 6 | Angry user on phone? | Empathy + ETA + focus on fix; escalate threats to lead. |
| 7 | What is FCR? | First Contact Resolution - resolved from the first contact without reopen/escalate. |
| 8 | Problem ticket when? | 3+ similar incidents/month or unknown root cause after L3. |
| 9 | Disable MFA temporarily? | No without a documented Security exception. |
| 10 | What's in resolution notes? | Symptom, checks, actions, result, KB link, versions. |
| 11 | 10 open tickets - okay? | P1/P2 → SLA at risk → FIFO within priority. |
| 12 | KB vs playbook? | KB = user-facing deflection; playbook = internal agent runbook with escalation. |`,
    },
    {
      title: 'Troubleshooting matrix (24 lines)',
      content: `| # | Symptom | L1 checks (15 min) | Probable Cause | Action | Escalation |
|---|---------|-------------------|-------------------|----------|-----------|
| 1 | No internet 1 user | Scope wired/Wi‑Fi | DHCP/DNS/local | ipconfig /renew, flushdns | L3 if subnet |
| 2 | No internet all | WAN LED, mobile test | ISP/FW outage | P1 ticket, notify L3 | Immediate |
| 3 | VPN won't connect | Credentials, MFA, version | Profile/cert | Reinstall FortiClient | L2 FG logs |
| 4 | Outlook disconnect | OWA works? | OST corrupt/cert | Safe mode, recreate OST | L2 Exchange |
| 5 | Teams no sound | Device settings | UDP blocked/driver | Clear cache, test call | L2 network |
| 6 | Slow PC | Task Manager disk/RAM | Full disk, leak | Cleanup, reboot | L2 hardware |
| 7 | Not included Windows | Network, caps lock | Profile/AD lock | Unlock, reset pass | L2 profile |
| 8 | Printer offline | Ping IP | Spooler/GPO | Restart spooler | L2 print server |
| 9 | OneDrive doesn't sync | Account quota | Token stale | Reset OneDrive | L2 SharePoint |
| 10 | BitLocker boot | Verify identity | TPM change | Recovery key Intune | L2 recurring |
| 11 | Wi‑Fi does not connect | SSID, forget network | 802.1X/RADIUS | Re-auth AD creds | L3 NPS |
| 12 | APIPA 169.254.x.x | DHCP scope | Exhausted/wrong | Renew, check lease | L3 DHCP |
| 13 | Domain join fail | nslookup SRV | Wrong DNS 8.8.8.8 | Point to DC DNS | L3 AD |
| 14 | Phishing click | — | Compromised | Isolate, reset pass | Security P2 |
| 15 | BSOD | Stop code photo | Driver/disk | Safe mode, minidump | L2 |
| 16 | MFA loop | Phone time sync | New device | Re-register MFA | L2 TAP |
| 17 | Guest Wi‑Fi captive | Portal load | FG policy | Check VLAN60 | L3 |
| 18 | IP phone no dial tone | VLAN 30 check | DHCP opt 150 | Voice VLAN trunk | L3 |
| 19 | GPO not applied | gpresult /r | Wrong OU/link | gpupdate /force | L2 |
| 20 | Intune non-compliant | Company Portal sync | BitLocker/OS ver | Remediate policies | L2 |
| 21 | After Windows Update | KB number | Bad patch | Uninstall KB | Problem if mass |
| 22 | RDP fail internal | VPN first? | NLA/firewall | Check GPO RDP | L2 |
| 23 | Share access denied | Group membership | ACL/owner | Add AD group | Data owner |
| 24 | Laptop stolen | — | Data breach | Intune wipe, reset pass | Security P1 |`,
    },
    {
      title: 'Case study 1: Avalanche of Outlook tickets',
      content: `**Context:** Fintech office 80 FTE, Monday 09:00, 47 “Outlook certificate error” tickets.

**Timeline:**
- 09:05 — L1 notices the pattern in the queue filter
- 09:10 — Senior L1 creates master ticket, links duplicates
- 09:12 - Priority P2 (OWA web is working - workaround exists)
- 09:20 — L3: expired cert on legacy Exchange load balancer
- 09:35 — Emergency change approved verbally
- 09:50 — Cert renewed, clients reconnect after Outlook restart
- 10:15 — All-staff resolved email

**Metrics:** MTTR 70 min; 47 tickets → 1 master + 46 linked; CSAT dipped to 3.8 that week.

**Action items:** Cert expiry monitoring PRTG 30d alert; auto-renew Let's Encrypt where applicable; KB «Outlook cert error» updated.`,
    },
    {
      title: 'Case study 2: BEC «CEO password»',
      content: `**Context:** 22:15 email “from the CEO”: “Reset your password immediately, conf call in 10 minutes.”

**Actions:**
- L1 on-call did not reset the password
- Called CEO on mobile from AD - CEO didn’t send
- Created P2 Security, blocked sender domain
- Security: BEC attempt, blocked IP, training scheduled

**Lessons:** After-hours does not weaken verification; single-channel email insufficient; report to Security within 15 min.`,
    },
    {
      title: 'Case study 3: 50 remote Autopilot',
      content: `**Context:** EdTech hired 50 remote teachers in 1 week, all Autopilot.

**Approach:**
- Pre-staged profiles by department in Intune groups
- Snipe-IT serial import → Autopilot group tag
- Shipping partner + tracking in Service Request tickets
- Day-1 batch Teams onboarding 10 users per slot

**Results:** 48/50 zero-touch; 2 needed manual ESP (TPM firmware update).
**KB video** “Unpack and turn on” reduced inbound calls by 60%.`,
    },
    {
      title: 'CompTIA A+ / Network+ mapping',
      content: `| CompTIA objective | Domain | Where in the chapter | Exam |
|-------------------|--------|-------------|------|
| Hardware troubleshooting | A+ Core 1 2.x | Laptop lifecycle, diagnostics | 220-1101 |
| Mobile devices | A+ Core 1 3.x | Intune, Autopilot | 220-1101 |
| Virtualization/cloud | A+ Core 1 4.x | Azure AD, M365 | 220-1101 |
| OS troubleshooting | A+ Core 2 1.x | Windows 11, BSOD | 220-1102 |
| Security | A+ Core 2 2.x | MFA, BitLocker, phishing | 220-1102 |
| Software troubleshooting | A+ Core 2 3.x | Outlook, Teams | 220-1102 |
| Operational procedures | A+ Core 2 4.x | ITIL, SLA, documentation | 220-1102 |
| Networking concepts | Network+ 1.x | VLAN, subnet, DNS | N10-008 |
| Network implementation | Network+ 2.x | DHCP, Wi‑Fi, switching | N10-008 |
| Network operations | Network+ 3.x | Monitoring, backups | N10-008 |
| Network security | Network+ 4.x | Firewall, 802.1X, segmentation | N10-008 |
| Network troubleshooting | Network+ 5.x | ipconfig, ping, traceroute | N10-008 |

**Study path:** A+ both cores → Network+ → AZ-900 → role-specific (AZ-104 / CCNA).`,
    },
    {
      title: '10 interview questions',
      content: `| # | Question | A strong answer includes |
|---|--------|------------------------|
| 1 | Incident lifecycle? | New→Open→In Progress→Pending→Resolved→Closed; SLA pause |
| 2 | How do you determine P1? | Impact × urgency; examples: all office down vs one printer |
| 3 | An example of escalation? | Ticket #, scope, steps, logs, suspect, test contact |
| 4 | Password reset verify? | Phone AD, badge, manager — never email alone |
| 5 | Problem Management? | Recurring incidents, root cause, Known Error, Change |
| 6 | Reduce ticket volume? | KB deflection, automation, self-service, training |
| 7 | FRT vs MTTR? | First response vs mean time to resolved |
| 8 | Remote support ethics? | Consent, log session, no unattended access |
| 9 | Documentation? | Every step in ticket; assets, versions, screenshots |
| 10 | Career 2 years? | Concrete skills: AD, PowerShell, Network+, project |`,
    },
    {
      title: 'Templates: email, escalation, KB',
      content: `**1. Email is the solution**
\\\`\\\`\\\`
Subject: [{{TICKET}}] Resolved - {{SUBJECT}}
Hello {{NAME}}!
Done: {{SUMMARY}}.
Action: {{USER_ACTION}}.
Confirm by replying to the letter. CSAT: {{URL}}
IT Support | {{COMPANY}}
\\\`\\\`\\\`

**2. Email - information needed**
\\\`\\\`\\\`
Subject: [{{TICKET}}] Please clarify
{{QUESTIONS}}
A screenshot of the error will speed up the solution.
\\\`\\\`\\\`

**3. Escalation form L1→L3**
Ticket | Priority | Scope | Start | Impact | L1 steps | Suspect | Logs | Test user | Deadline

**4. KB article skeleton**
# Title | Symptoms | Prerequisites | Steps 1-n | Still broken? → ticket cat X | Related | Owner | Updated`,
    },
    {
      title: 'Additional best practices and checklist',
      content: `**Monthly review checklist:**
- [ ] Update KB and playbooks based on ticket results
- [ ] Check SLA compliance and CSAT trend
- [ ] Review open Problem tickets
- [ ] Audit DHCP/DNS/VLAN configuration
- [ ] Firmware security patches network gear
- [ ] Backup firewall/switch configs
- [ ] Test failover WAN / DHCP / RADIUS
- [ ] Training gap analysis for L1
- [ ] Update asset inventory
- [ ] Retro major incidents if there were

**Documentation:** each change - ticket + change record + config backup + diagram update.

**Communication:** users value ETA more than speed - always set expectations.

**Security:** least privilege, segment networks, verify identity, log actions.

**Continuous training:** 2h/week lab + milestone quarterly certification.`,
    },
    {
      title: 'IT Support and Networking Terms Reference',
      content: `| Term | Definition |
|------|------------|
| SLA | Service level agreement — response/resolution targets |
| OLA | Operational level agreement between IT teams |
| FRT | First response time |
| MTTR | Mean time to resolve |
| CSAT | Customer satisfaction 1–5 |
| FCR | First contact resolution rate |
| VLAN | Layer 2 broadcast domain segmentation |
| DHCP | Dynamic host configuration protocol |
| DNS | Domain name resolution |
| RADIUS | Remote authentication for 802.1X |
| STP | Spanning tree — loop prevention |
| PoE | Power over Ethernet for AP/phones |
| UPS | Battery backup for graceful shutdown |
| 802.1X | Port-based network access control |
| WPA3-Enterprise | Wi‑Fi auth with individual credentials |
| BitLocker | Full disk encryption Windows |
| Intune | Microsoft unified endpoint management |
| Autopilot | Zero-touch Windows deployment |
| FG | FortiGate firewall |
| IDF/MDF | Intermediate/main distribution frame |
| BGP/OSPF | Routing protocols — rarely in SMB office |
| NAT/PAT | Address translation at firewall |
| QoS/DSCP | Traffic prioritization for VoIP |
| SIP/RTP | VoIP signaling and media |
| APIPA | 169.254 auto-address — DHCP failure indicator |`,
    },
    {
      title: 'Extended reference — deep dive',
      content: `**Windows DHCP Failover deploy steps:**
1 Install DHCP both DCs 2 Same scopes defined 3 Add failover relationship hot standby 4 Partner server 5 Test stop service DC1 clients renew OK

**Split scope 80/20:**
Primary DC1 80% leases active; DC2 standby 20%; switch on failure automatic

**DHCP scope options complete list office:**
003 Router 006 DNS 015 Domain 042 NTP 044 WINS deprecated 046 NETBIOS deprecated 119 Domain search list 252 WPAD optional

**Reservations best practice:**
Printers, APs (if static), servers, network gear management — document MAC in NetBox

**DHCP audit script idea:**
Get-DhcpServerv4Lease compare duplicates; alert if rogue DHCP detected (PRTG or custom)

**DNS AD integrated zones:**
company.local primary; _msdcs.company.local; reverse PTR for /24 each VLAN optional but recommended

**Conditional forwarder lab steps:**
Partner domain partner.local IP 10.10.10.1 on AD DNS; test nslookup host.partner.local; stub zone alternative

**Split-brain DNS scenario:**
External host.company.com public IP 203.0.113.5; internal same name 192.168.10.50 — use split DNS views FG or Windows DNS policies

**Pi-hole coexistence design:**
Option A: Pi-hole forward all to AD DNS upstream; Option B: Pi-hole guest VLAN only; never replace DC DNS for domain clients

**DNSSEC intro practical:**
Signing public zones Cloudflare; internal AD DNSSEC rare; understand chain of trust DS records at registrar

**IPv6 ULA office plan:**
fd00:1234:5678::/48; /64 per VLAN; DHCPv6 stateful or SLAAC+RDNSS; disable v6 if not ready — broken v6 worse

**DNS troubleshooting flowchart:**
Fail internal name → check DC DNS server IP on client → ping DC → nslookup server → check forwarders → check AD replication

**Common DNS mistakes:**
8.8.8.8 only on domain PC breaks AD; stale A records after DHCP lease expired; CNAME chains too deep

**Windows DNS logging:**
Debug logging brief only troubleshooting; ETW; audit zone changes AD

**FortiGate DHCP relay config:**
Interface VLAN20 DHCP relay enable server 192.168.10.10; verify option 82 if needed multi subnets

**Linux ISC dhcpd snippet reference:**
shared-network rare; host declarations reservations; failover peer block

**DNS load balancing GSLB:**
Multi-site advanced — round robin A records low tech; health check advanced beyond SMB

**Dynamic DNS updates secure:**
Only domain joined clients update; secure dynamic updates AD integrated

**Reverse DNS importance:**
Mail server PTR; some auth systems check reverse; create PTR for static servers

**DNS TTL planning:**
Low TTL 300 before migration; raise 86400 steady state

**Cache poisoning mitigation:**
DNSSEC external; internal use AD ACL restrict zone transfer; patch DNS servers

**DHCP snooping switch feature:**
Untrusted user ports; trusted uplink to DHCP server; block rogue DHCP

**Office DHCP exhaustion incident case:**
Forgot exclude printers static range; pool full Monday AM; fix exclusions expand scope document

**Interview DHCP DNS questions:**
Authoritative vs recursive; DHCP relay why needed; SRV record purpose _ldap._tcp; split horizon definition

**Lab 20 steps DHCP DNS:**
Deploy 2 DC VM; create scopes VLAN20/50; failover; AD DNS forwarders 1.1.1.1; conditional forwarder; client test join domain; failover test

**CompTIA mapping DHCP DNS:**
Ports 67/68 DHCP; 53 DNS TCP UDP; know option 66/150 VoIP

**Tools:**
nslookup dig Windows; DHCP mmc; DNS lint deprecated; dcdiag /test:dns

**Documentation:**
Export DHCP backup weekly; DNS zone export; store with config backups encrypted

**Guest DNS filtering:**
OpenDNS category block on VLAN60 FG DNS filter license optional

**Microsoft 365 DNS records:**
Autodiscover CNAME; SPF TXT; DKIM; DMARC — know L1 escalates M365 DNS not edits blindly`,
    },
    {
      title: 'Extended reference — deep dive',
      content: `Additional operational notes: document every change; test backups quarterly; maintain spares; train successors; review firewall rules semi-annual; validate contact lists emergency; keep ISP account numbers handy; label everything; photo document rack; run tabletop drills; measure twice cut once on IP plan; never expand scope without change ticket; communicate early often; sleep during long P1 only after handover; celebrate wins with team; learn from every breach SLA; automate repetitive; read release notes firmware; respect maintenance windows; keep lab environment; certify skills yearly; mentor juniors; ask when unsure not guess production.Additional operational notes: document every change; test backups quarterly; maintain spares; train successors; review firewall rules semi-annual; validate contact lists emergency; keep ISP account numbers handy; label everything; photo document rack; run tabletop drills; measure twice cut once on IP plan; never expand scope without change ticket; communicate early often; sleep during long P1 only after handover; celebrate wins with team; learn from every breach SLA; automate repetitive; read release notes firmware; respect maintenance windows; keep lab environment; certify skills yearly; mentor juniors; ask when unsure not guess production.Additional operational notes: document every change; test backups quarterly; maintain spares; train successors; review firewall rules semi-annual; validate contact lists emergency; keep ISP account numbers handy; label everything; photo document rack; run tabletop drills; measure twice cut once on IP plan; never expand scope without change ticket; communicate early often; sleep during long P1 only after handover; celebrate wins with team; learn from every breach SLA; automate repetitive; read release notes firmware; respect maintenance windows; keep lab environment; certify skills yearly; mentor juniors; ask when unsure not guess production.`,
    },
    {
      title: 'Operational excellence — quarterly checklist',
      content: `**Operational excellence checklist (quarterly)**

| Area | Task | Owner | Evidence |
|------|------|-------|----------|
| Documentation | Update network diagram + IP plan | Network | Confluence version |
| Security | Review firewall policies unused rules | Security | FG export diff |
| Identity | Access review AD groups | IT | Ticket SR |
| Endpoints | Intune compliance report | Desktop | >95% compliant |
| Wi‑Fi | Controller firmware current | Network | Version screenshot |
| DHCP/DNS | Scope utilization <80% | Sysadmin | DHCP mmc |
| Backups | Test restore file + config | Sysadmin | Restore log |
| DR | Tabletop ISP down 1h | All IT | Meeting notes |
| Training | L1 skills gap review | Lead | Plan doc |
| Vendors | Support contract renewal 90d | Manager | Calendar |

**Incident readiness:** on-call contacts printed; spare AP/switch; FG config backup automated weekly; runbook index linked ITSM.

**Capacity triggers:** DHCP >80% scope; switch ports >85% used; Wi‑Fi complaints >5/week floor; plan project before crisis.

**Compliance notes RU/EU:** personal data processing register; guest Wi‑Fi logging policy legal review; encryption BitLocker audit.

**Handover to operations:** all passwords in vault; labeled rack; asset inventory match; monitoring alerts configured; first 30 days hypercare schedule.

**Continuous learning paths:** Network+ for L1 aiming network; AZ-104 for sysadmin; Ekahau ECSE for wireless lead.

**Tooling stack reference:** ITSM Jira SM; MDM Intune; Firewall FortiGate; Switch Omada; Wi‑Fi Omada; Monitor PRTG; Docs Confluence; IPAM NetBox.

**Communication cadence:** daily L1 standup 15m; weekly metrics review; monthly CAB; quarterly SLA review with business.

**Quality gates new office:** cabling certified; Wi‑Fi survey pass; failover tested; documentation signed; training delivered.

**Risk register examples:** single ISP; no DHCP failover; flat network legacy; expired certs; no spare switch — mitigate with dated plan.

**Project closeout template:** objectives met Y/N; budget actual vs plan; lessons learned; open items; warranty register; celebrate team.

**Operational excellence checklist (quarterly)**

| Area | Task | Owner | Evidence |
|------|------|-------|----------|
| Documentation | Update network diagram + IP plan | Network | Confluence version |
| Security | Review firewall policies unused rules | Security | FG export diff |
| Identity | Access review AD groups | IT | Ticket SR |
| Endpoints | Intune compliance report | Desktop | >95% compliant |
| Wi‑Fi | Controller firmware current | Network | Version screenshot |
| DHCP/DNS | Scope utilization <80% | Sysadmin | DHCP mmc |
| Backups | Test restore file + config | Sysadmin | Restore log |
| DR | Tabletop ISP down 1h | All IT | Meeting notes |
| Training | L1 skills gap review | Lead | Plan doc |
| Vendors | Support contract renewal 90d | Manager | Calendar |

**Incident readiness:** on-call contacts printed; spare AP/switch; FG config backup automated weekly; runbook index linked ITSM.

**Capacity triggers:** DHCP >80% scope; switch ports >85% used; Wi‑Fi complaints >5/week floor; plan project before crisis.

**Compliance notes RU/EU:** personal data processing register; guest Wi‑Fi logging policy legal review; encryption BitLocker audit.

**Handover to operations:** all passwords in vault; labeled rack; asset inventory match; monitoring alerts configured; first 30 days hypercare schedule.

**Continuous learning paths:** Network+ for L1 aiming network; AZ-104 for sysadmin; Ekahau ECSE for wireless lead.

**Tooling stack reference:** ITSM Jira SM; MDM Intune; Firewall FortiGate; Switch Omada; Wi‑Fi Omada; Monitor PRTG; Docs Confluence; IPAM NetBox.

**Communication cadence:** daily L1 standup 15m; weekly metrics review; monthly CAB; quarterly SLA review with business.

**Quality gates new office:** cabling certified; Wi‑Fi survey pass; failover tested; documentation signed; training delivered.

**Risk register examples:** single ISP; no DHCP failover; flat network legacy; expired certs; no spare switch — mitigate with dated plan.

**Project closeout template:** objectives met Y/N; budget actual vs plan; lessons learned; open items; warranty register; celebrate team.`,
    },
    {
      title: 'Directory - escalation tree and glossary supplement',
      content: `**Quick reference — escalation phone tree (example)**
| Tier | Role | Hours | Phone |
|------|------|-------|-------|
| L1 | Helpdesk | 08-20 | ext 2200 |
| L2 | Desktop | 09-18 | ext 2201 |
| L3 | Network on-call | 24x7 | +7-xxx pager |
| Security | SOC | 24x7 | ext 9911 |
| ISP | Provider NOC | 24x7 | ticket portal |
| Facilities | Power/HVAC | 08-20 | ext 3000 |

**Version history template for runbooks:** v1.0 initial; v1.1 post-P1 update; reviewer name; next review date +6 months.

**Audit evidence pack IT support/network:** SLA reports 12 months; sample closed tickets redacted; KB article list; change log; training records; pen test remediation status.

**Glossary supplement:** MTTD mean time to detect; MTBF mean time between failures; CAB change advisory board; CSI continual service improvement; LOB line of business; SSPR self-service password reset; TAP temporary access pass Azure; ODJ offline domain join; ESP enrollment status page; PKI public key infrastructure; SCEP cert enrollment protocol; MDM mobile device management; UEM unified endpoint management; NAC network access control; captive portal guest auth page; RTO recovery time objective; RPO recovery point objective; BIA business impact analysis; DRP disaster recovery plan; BCP business continuity plan; SPOF single point of failure; HA high availability; VRRP virtual router redundancy; HSRP Cisco FHRP; ICMP ping traceroute; ARP address resolution; NIC network interface; DHCPv6 stateful stateless; AAAA IPv6 DNS; dual stack IPv4 IPv6 simultaneous; split tunnel VPN corp only routes; full tunnel all traffic VPN; SSL VPN web portal; IPsec site to site; MFA push TOTP FIDO2; Conditional Access Azure policies; PIM privileged identity management; DLP data loss prevention; EDR endpoint detection response; SOC security operations center; SIEM log aggregation; IOC indicator of compromise; CVE common vulnerabilities; CVSS severity score; Ransomware encrypt extort; BEC business email compromise; Phishing simulation training; Zero Trust never trust always verify; Least privilege minimum access required; Defense in depth layered security; DMZ demilitarized zone perimeter; NAT PAT overload translation; ACL access control list; IPS intrusion prevention inline; IDS intrusion detection passive; WAF web application firewall; DDoS distributed denial of service; QoS quality of service voice video data; DSCP diffserve code point marking; CoS class of service layer2; LLDP link layer discovery; CDP Cisco discovery protocol proprietary; STP spanning tree loop prevention; RSTP rapid STP; MSTP multiple STP; BPDU bridge protocol data unit; LACP link aggregation control protocol; PoE+ 802.3at 30W; PoE++ 802.3bt 60-90W; SFP GBIC fiber transceiver; SMF single mode fiber long range; MMF multimode fiber short range; OM4 fiber standard 10G; Cat6 Cat6a copper standards; TIA-568 wiring standard; Fluke cable certifier test; IDF intermediate distribution frame; MDF main distribution frame; UPS PDU power infrastructure; FG FortiGate; NPS RADIUS Windows; AD DS domain services; GPO group policy; OU organizational unit; AAD Azure Active Directory Entra; Intune MEM endpoint manager; Autopilot zero touch deploy; BitLocker TPM encryption; WUfB Windows update for business; ESP enrollment status page; OST Outlook offline data file; OWA Outlook web app; Teams NG client; OneDrive sync client; SharePoint Online collaboration; M365 Microsoft 365 suite; EXO Exchange Online; SPO SharePoint Online; AVD Azure virtual desktop optional.`,
    },
    {
      title: 'Exam prep, sign-off and pacing guide',
      content: `**Final exam prep — 20 flashcard prompts**
1 Define VLAN and trunk. 2 DHCP vs static when. 3 DNS forwarder vs conditional. 4 WPA2-PSK vs Enterprise. 5 STP purpose. 6 PoE budget calc steps. 7 Incident vs Request. 8 SLA response vs resolution. 9 FRT MTTR FCR CSAT. 10 BitLocker recovery source. 11 Autopilot ESP stuck debug. 12 FortiGate inter-VLAN policy order. 13 802.1X PEAP flow. 14 Guest Wi-Fi isolation test. 15 DHCP failover modes. 16 Split brain DNS symptom. 17 Rogue AP contain steps. 18 UPS sizing formula. 19 Cable Cat6 max length. 20 Postmortem blameless 5 Whys.

**Lab sign-off criteria checklist**
All steps completed; screenshots in ticket; peer review pass; time logged; KB updated if new; supervisor initial; user confirm where applicable; no open security findings; config backup if changed; diagram updated if changed; added to CSI register if improvement found.

**Printable wall poster summary (A4)**
P1 phone tree | SLA times table | Top 5 playbooks | Escalation form QR | Security hotline | ISP account # redacted reference card locked drawer.

**Cross-module links devops-handbook**
After this chapter study: FortiGate module VPN policies; Omada wireless; Sysadmin AD GPO; Observability incidents postmortem; Fundamentals networking bash.

**Instructor notes (self-study pacing)**
Week1 sections 1-10; Week2 11-20; Week3 lab+practice; Week4 review FAQ+interview; allocate 10-12 hours total per chapter estimate includes lab.

**Change log this chapter content v2.0**
Expanded labs FAQ troubleshooting case studies CompTIA mapping interview templates; aligned duration 10-12 hours; 15 practice 6 resources; RU language; slugs preserved.

**Final exam prep — 20 flashcard prompts**
1 Define VLAN and trunk. 2 DHCP vs static when. 3 DNS forwarder vs conditional. 4 WPA2-PSK vs Enterprise. 5 STP purpose. 6 PoE budget calc steps. 7 Incident vs Request. 8 SLA response vs resolution. 9 FRT MTTR FCR CSAT. 10 BitLocker recovery source. 11 Autopilot ESP stuck debug. 12 FortiGate inter-VLAN policy order. 13 802.1X PEAP flow. 14 Guest Wi-Fi isolation test. 15 DHCP failover modes. 16 Split brain DNS symptom. 17 Rogue AP contain steps. 18 UPS sizing formula. 19 Cable Cat6 max length. 20 Postmortem blameless 5 Whys.

**Lab sign-off criteria checklist**
All steps completed; screenshots in ticket; peer review pass; time logged; KB updated if new; supervisor initial; user confirm where applicable; no open security findings; config backup if changed; diagram updated if changed; added to CSI register if improvement found.

**Printable wall poster summary (A4)**
P1 phone tree | SLA times table | Top 5 playbooks | Escalation form QR | Security hotline | ISP account # redacted reference card locked drawer.

**Cross-module links devops-handbook**
After this chapter study: FortiGate module VPN policies; Omada wireless; Sysadmin AD GPO; Observability incidents postmortem; Fundamentals networking bash.

**Instructor notes (self-study pacing)**
Week1 sections 1-10; Week2 11-20; Week3 lab+practice; Week4 review FAQ+interview; allocate 10-12 hours total per chapter estimate includes lab.

**Change log this chapter content v2.0**
Expanded labs FAQ troubleshooting case studies CompTIA mapping interview templates; aligned duration 10-12 hours; 15 practice 6 resources; RU language; slugs preserved.

**Final exam prep — 20 flashcard prompts**
1 Define VLAN and trunk. 2 DHCP vs static when. 3 DNS forwarder vs conditional. 4 WPA2-PSK vs Enterprise. 5 STP purpose. 6 PoE budget calc steps. 7 Incident vs Request. 8 SLA response vs resolution. 9 FRT MTTR FCR CSAT. 10 BitLocker recovery source. 11 Autopilot ESP stuck debug. 12 FortiGate inter-VLAN policy order. 13 802.1X PEAP flow. 14 Guest Wi-Fi isolation test. 15 DHCP failover modes. 16 Split brain DNS symptom. 17 Rogue AP contain steps. 18 UPS sizing formula. 19 Cable Cat6 max length. 20 Postmortem blameless 5 Whys.

**Lab sign-off criteria checklist**
All steps completed; screenshots in ticket; peer review pass; time logged; KB updated if new; supervisor initial; user confirm where applicable; no open security findings; config backup if changed; diagram updated if changed; added to CSI register if improvement found.

**Printable wall poster summary (A4)**
P1 phone tree | SLA times table | Top 5 playbooks | Escalation form QR | Security hotline | ISP account # redacted reference card locked drawer.

**Cross-module links devops-handbook**
After this chapter study: FortiGate module VPN policies; Omada wireless; Sysadmin AD GPO; Observability incidents postmortem; Fundamentals networking bash.

**Instructor notes (self-study pacing)**
Week1 sections 1-10; Week2 11-20; Week3 lab+practice; Week4 review FAQ+interview; allocate 10-12 hours total per chapter estimate includes lab.

**Change log this chapter content v2.0**
Expanded labs FAQ troubleshooting case studies CompTIA mapping interview templates; aligned duration 10-12 hours; 15 practice 6 resources; RU language; slugs preserved.`,
    },
    {
      title: 'Summary checklist before handing in the chapter',
      content: `Before finishing, make sure:
- [ ] Read all sections and completed lab 15+ steps
- [ ] Filled out the troubleshooting matrix for 5 of my cases
- [ ] Answered 12 FAQs without prompts
- [ ] Prepared 3 case study examples from practice or sim
- [ ] Matched 5 topics with CompTIA Network+ objectives
- [ ] Rehearsed 10 interview questions out loud
- [ ] Saved templates email/escalation/KB to personal runbook
- [ ] Completed at least 10 out of 15 practice tasks
- [ ] Duration 10–12 hours - logged the actual time
- [ ] Updated personal notes cross-links other handbook modules`,
    },
    {
      title: 'Chapter Summary',
      content: `1. **DHCP** — scopes per VLAN, options 003/006/015, no duplicate servers
2. **Windows vs FortiGate** — Windows for AD shops, FG for tiny SMB
3. **Relay** - required when DHCP centralized
4. **Reservations** — printers, document MAC
5. **DNS** — AD-integrated, forwarders, never client-only 8.8.8.8
6. **Split-horizon** — internal vs external names
7. **Troubleshooting matrices** — APIPA, DNS duality symptoms

> Next chapter: **Corporate Wi-Fi** - site survey, 802.1X, NPS.`,
    },
  ],
  practice: [
    'DHCP failover 2 DC lab',
    '5 scopes VLAN table',
    'Reservation printer MAC',
    'DNS forwarders diagram',
    'Split-brain scenario doc',
    'Conditional forwarder lab',
    'nslookup SRV _ldap',
    'Pi-hole vs AD design choice',
    'IPv6 ULA plan /48',
    'DNSSEC read Cloudflare docs',
    'DHCP relay FortiGate',
    'Stale DNS cleanup',
    'ipconfig troubleshooting tree',
    'Reverse PTR zone',
    'DHCP audit duplicate servers',
  ],
  resources: [
    { title: 'Windows DHCP', url: 'https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-top' },
    { title: 'AD DNS', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/active-directory-integrated-dns' },
    { title: 'DNSSEC', url: 'https://www.cloudflare.com/dns/dnssec/how-dnssec-works/' },
    { title: 'Pi-hole docs', url: 'https://docs.pi-hole.net/' },
    { title: 'IPv6 design', url: 'https://learn.microsoft.com/en-us/windows-server/networking/technologies/ipv6/ipv6-top' },
    { title: 'CompTIA Network+', url: 'https://www.comptia.org/certifications/network' },
  ],
  quiz: [
    {
      question: 'Two active DHCP on the same scope calls:',
      options: ['IP conflicts', 'Fast internet', 'Automatic AD'],
      answer: 'IP conflicts',
    },
    {
      question: 'DHCP Relay is needed when:',
      options: ['DHCP server in another VLAN', 'No internet', 'Wi-Fi only'],
      answer: 'DHCP server in another VLAN',
    },
    {
      question: 'AD domain clients must use DNS:',
      options: ['Domain Controller', 'Only 8.8.8.8', 'ISP router only'],
      answer: 'Domain Controller',
    },
    {
      question: '“There is Internet, but there is no domain” – this is often the problem:',
      options: ['The client is not using DC DNS', 'Broken printer', 'No PoE'],
      answer: 'The client is not using DC DNS',
    },
    {
      question: 'DHCP reservation binds IP to:',
      options: ['MAC address', 'Username', 'VLAN only'],
      answer: 'MAC address',
    },
    {
      question: 'The SRV record _ldap._tcp is needed for:',
      options: ['Search Domain Controller', 'Posts', 'Stamps'],
      answer: 'Search Domain Controller',
    },
    {
      question: 'TTL in a DNS record defines:',
      options: ['How long a client caches the answer', 'Internet speed', 'DHCP lease', 'VLAN ID'],
      answer: 'How long a client caches the answer',
    },
    {
      question: 'Typical DHCP lease time in an office:',
      options: ['8–24 hours', '5 seconds', '365 days', 'No term (forever)'],
      answer: '8–24 hours',
    },
    {
      question: 'Command to flush DNS cache on a Windows client:',
      answer: 'ipconfig /flushdns',
    },
    {
      question: 'Dynamic DNS update in AD allows:',
      options: ['Clients to register A/AAAA records in the zone', 'Delete DC', 'Change VLAN', 'Disable Kerberos'],
      answer: 'Clients to register A/AAAA records in the zone',
      explanation: 'Without secure DDNS old records accumulate — need cleanup and scavenging.',
    },
  ],
}

export default translation
