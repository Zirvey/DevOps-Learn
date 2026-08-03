import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Office network design',
  duration: '10–12 hours',
  description:
    'SMB office topology: Internet, firewall, core/access, server, IP plan, documentation and standard diagrams',
  sections: [
    {
      title: 'Introduction: Designing an Office SMB Network',
      content: `**SMB office network** (10–100 users) - a balance between enterprise reliability and a reasonable budget. Goal: a secure, segmented, documented network with room for growth.

**Design principles:**
1. **Defense in depth** - firewall on the perimeter, VLAN inside
2. **Separation** - guests ≠ employees ≠ servers ≠ IoT
3. **Redundancy** - dual WAN, UPS, 2 DC, redundant uplinks where critical
4. **Scalability** — IP plan with a reserve, PoE budget 30% headroom
5. **Documentation** - diagram before go-live, not after the accident

**Project stages:**
| Phase | Deliverables |
|------|--------------|
| Discovery | User count, floors, apps, compliance |
| High-level design | Topology, VLAN, IP plan |
| Low-level design | Port matrix, equipment list, BOM |
| Implementation | Cabling, config, test |
| Handover | Docs, training, support contacts |`,
    },
    {
      title: 'Topology: office for 10 users',
      content: `**Profile:** startup, open space, 1st floor ~150 m², 1 server/NAS, remote backup.

\\\`\\\`\\\`
Internet (single WAN + LTE backup optional)
    │
[ISP ONT/Router bridge]
    │
[FortiGate 40F / Omada ER7206]  ← DHCP, DNS forward, VPN, Wi‑Fi controller
    │
[Managed PoE Switch 24p] ← the only switch
    ├── Ports 1-12: Workstations (VLAN 20)
    ├── Ports 13-14: Printers (VLAN 40)
    ├── Ports 15-16: AP (trunk VLAN 50,60)
    ├── Port 17: NAS/Server (VLAN 10)
    └── Port 24: uplink reserved

Wi‑Fi: 2× AP (Corp + Guest SSID)
\\\`\\\`\\\`

**Equipment (reference):**
| Device | Model | Qty |
|------------|--------|--------|
| Firewall | FG-40F / ER7206 | 1 |
| Switch PoE | 24p gigabit, 130W PoE | 1 |
| AP | Wi‑Fi 6, 2×2 | 2 |
| UPS | 1000 VA line-interactive | 1 |
| Rack | 12U wall-mount | 1 |

**Features of 10 users:**
- One switch is enough
- Routing to firewall (no L3 switch needed)
- Windows Server or NAS for files + DC optional (Azure AD possible)
- DHCP on FortiGate or Windows`,
    },
    {
      title: 'Topology: office for 50 users',
      content: `**Profile:** 2 floors, 800 m², AD + 2 DC, IP telephony, 6 AP, server room 12U.

\\\`\\\`\\\`
Internet Primary (fiber) + Backup (LTE/2nd ISP)
    │
[FortiGate 60F–100F]  ← dual WAN, SSL-VPN, inter-VLAN routing
    │ LACP trunk 2×1G
[Core Switch L3 optional / L2 + FG routing]
    │
    ├── [Access SW Floor 1] 24-48p → PCs, phones
    ├── [Access SW Floor 2] 24-48p → PCs, phones
    ├── [PoE Switch] → 4-6 AP (trunk)
    └── [Server SW] → DC1, DC2, NAS, Hyper-V (VLAN 10)

Inter-floor: Fiber OM4 2-core between floors (or copper 10G if short)
\\\`\\\`\\\`

**Equipment:**
| Device | Specification |
|------------|--------------|
| Firewall | FG-80F–100F, 1G WAN |
| Core | 24p L2+ or L3, 2×SFP+ |
| Access | 2× 48p PoE, 370W each |
| AP | 6× Wi‑Fi 6, ceiling mount |
| Fiber | OM4 patch between floors |
| UPS | 2000 VA online for rack |

**Server:** 12–18U rack, PDU metered, patch panel Cat6, fiber panel.`,
    },
    {
      title: 'Topology: office for 100 users',
      content: `**Profile:** 3 floors or 2000 m², 100 workstations, 20 VoIP, 12 AP, full AD, branch VPN possible.

\\\`\\\`\\\`
Dual WAN (SD-WAN policy on FortiGate)
    │
[FortiGate 100F–200F] HA cluster optional
    │ 10G LACP (2×10G or 4×1G)
[Core Switch Stack L3]  ← STP root, optional SVI
    │
    ├── [IDF Floor 1] Access 48p + PoE
    ├── [IDF Floor 2] Access 48p + PoE
    ├── [IDF Floor 3] Access 48p + PoE
    ├── [MDF Server Room] Server stack
    └── [DMZ optional] Web, mail relay

Redundancy:
- 2× DC (different hosts)
- Core stack 2 members
- Dual PSU switches
- UPS + generator hookup
\\\`\\\`\\\`

**Scaling:**
- /23 or /22 for workstations
- Dedicated management VLAN 99
- NetBox/phpIPAM is required
- 24×7 monitoring PRTG/Zabbix
- On-call rotation network team`,
    },
    {
      title: 'IP Plan: Universal VLAN Plan',
      content: `**Basic VLAN matrix (scales 10–100 users):**

| VLAN ID | Name | Subnet (example) | Hosts | Destination |
|---------|------|-----------------|-------|------------|
| 10 | SERVERS | 192.168.10.0/24 | 254 | DC, NAS, Hyper-V |
| 20 | WORKSTATIONS | 192.168.20.0/23 | 510 | PCs, laptops wired |
| 30 | VOIP | 192.168.30.0/24 | 254 | IP phones |
| 40 | PRINTERS | 192.168.40.0/24 | 254 | Printers, MFP |
| 50 | WIFI-CORP | 192.168.50.0/24 | 254 | Corporate Wi‑Fi |
| 60 | WIFI-GUEST | 192.168.60.0/24 | 254 | Guest internet only |
| 70 | IOT-CAMERA | 192.168.70.0/24 | 254 | Cameras, sensors |
| 80 | DMZ | 192.168.80.0/27 | 30 | Public services |
| 99 | MANAGEMENT | 192.168.99.0/24 | 254 | Switches, AP, FW mgmt |

**Reservation of addresses:**
- .1 — gateway (FortiGate interface)
- .2–.10 — network infrastructure (switches, AP)
- .11–.50 — static servers
- .51–.99 — reserved
- .100–.250 — DHCP pool
- .251–.254 — reserved future

**For 10 users:** can be simplified to 5 VLANs (10,20,50,60,99) with /24 each.`,
    },
    {
      title: 'IP plan by office size',
      content: `**10 Users - Compact Plan:**

| VLAN | Subnet | DHCP range |
|------|--------|------------|
| 10 Servers | 192.168.10.0/28 | static only .10-.14 |
| 20 Users | 192.168.20.0/26 | .40-.62 |
| 50 WiFi | 192.168.50.0/26 | .40-.62 |
| 60 Guest | 192.168.60.0/27 | .10-.30 |
| 99 Mgmt | 192.168.99.0/28 | static |

**50 users - standard plan** (see matrix above, /24–/23)

**100 users - advanced:**
| VLAN | Subnet | Note |
|------|--------|------------|
| 20 Workstations | 192.168.20.0/22 | 1022 hosts |
| 50 WiFi Corp | 192.168.50.0/23 | 510 hosts |
| 30 VoIP | 192.168.30.0/23 | call center growth |

**IPAM document:** Excel, NetBox or phpIPAM - VLAN, subnet, gateway, DHCP scope, DNS, description, owner.`,
    },
    {
      title: 'Equipment selection and sizing',
      content: `| Size | Firewall | Core Switch | Access | AP | PoE budget |
|--------|----------|-------------|--------|-----|------------|
| 10 | FG-40F / ER7206 | — (all-in-one) | 1× 24p PoE | 2 | ~40W |
| 50 | FG-80F–100F | 1× 24p SFP+ | 2× 48p PoE | 6 | ~200W |
| 100 | FG-100F–200F | Stack 2×48 | 3× 48p PoE | 12 | ~400W |

**Firewall sizing factors:**
- Throughput with IPS/SSL inspection
- VPN concurrent users (remote 30% of staff?)
- Number of VLAN interfaces
- HA requirement

**Switch criteria (required):**
- Managed: 802.1Q, QoS, SNMP
- PoE+ (30W per port) for AP
- SFP/SFP+ for uplinks
- STP/RSTP, BPDU guard
- CLI + GUI backup

**AP sizing:** 1 AP per 80–120 m² open space, 1 per 4–6 rooms dense walls.`,
    },
    {
      title: 'Physical installation and cabling system',
      content: `**Structured Cabling System (SCS):**

\\\`\\\`\\\`
Workstation outlet (RJ-45)
    │
Horizontal Cat6/Cat6a (max 90m)
    │
Patch panel (numbered)
    │
Patch cord → Access switch port
\\\`\\\`\\\`

**Cables:**
| Type | Application |
|-----|------------|
| Cat6 UTP | Workstations, 1 Gbps, up to 55m 10G |
| Cat6a | 10 Gbps to desk (trading floors) |
| OM3/OM4 fiber | Inter-floor, rack uplinks, long runs |
| OS2 single-mode | Campus, >300m |

**Server / MDF:**
- 42U rack (100 users) or 12U (10 users)
- Vertical cable managers are required
- PDU metered (C13/C19)
- UPS: 30 min minimum runtime at load
- Hot/cold aisle or fan if no CRAC
- Grounding per local code

**Marking:**
- Port switch F2-SW01-P24 = Floor2 Patch panel port 24 = Desk F2-042
- Patch cord colors: blue=user, red=uplink, yellow=server`,
    },
    {
      title: 'Optical fiber: when and how',
      content: `**Fiber vs copper uplink:**

| Criterion | Fiber OM4 | Copper Cat6a |
|----------|-----------|--------------|
| distance | Up to 400m @ 10G | Up to 55m @ 10G |
| EMI immunity | Excellent | Depends on environment |
| Cost | Above (SFP modules) | Below |
| Inter-building | Yes | No outdoor |

**Typical fiber scenarios:**
- Between floors (MDF ↔ IDF)
- Firewall ↔ Core switch (when 10G needed)
- Server room ↔ access closet distant
- Outdoor to outbuilding

**Components:**
- LC-LC duplex patch cords
- SFP+ SR (850nm) for OM3/OM4
- SFP+ LR (1310nm) for single-mode
- Media converter - only if unavoidable

**Testing:** light level meter, or link lights minimum. Document dBm in handover.`,
    },
    {
      title: 'Dual WAN and Internet resiliency',
      content: `**Dual WAN topologies:**

\\\`\\\`\\\`
Option A: Active-Passive
  Primary fiber ──┐
                  ├── [FortiGate SD-WAN] ── LAN
  Backup LTE  ────┘
  Failover when primary down

Option B: Active-Active (load balance)
  ISP1 ──┐
         ├── policy routing / SD-WAN
  ISP2 ──┘
  SaaS via best path, bulk via weighted
\\\`\\\`\\\`

**FortiGate SD-WAN (concept):**
- Health check: ping 8.8.8.8, DNS resolve
- SLA: latency, jitter, packet loss
- Rules: Microsoft 365 → preferred WAN, general → load balance

**Practice SMB 50 users:**
- Primary: business fiber 100/100 Mbps
- Backup: LTE 50 Mbps or second ISP
- Failover time: 30–60 sec acceptable
- Document ISP NOC phones in runbook

**Public IP:**
- Static for VPN endpoint
- Mail relay - carefully (SPF/DKIM)
- Port forwarding minimal (VPN only preferred)`,
    },
    {
      title: 'Server and infrastructure services',
      content: `**Minimum server stack 50 users:**

| Service | Accommodation | VLAN |
|--------|------------|------|
| AD DC1, DC2 | Physical or VM | 10 |
| DNS (AD integrated) | DC | 10 |
| DHCP | Windows Server or FG | 10 mgmt, relay |
| File server / NAS | NAS or VM | 10 |
| Print server | VM optional | 10 |
| NPS (RADIUS) | VM or DC | 10 |
| Backup | Veeam → NAS + cloud | 10 |

**10 users alternative:** Azure AD + Intune, SharePoint/OneDrive files - on-prem DC optional.

**Virtualization:** Hyper-V on 1 host (50 users) or 2-node cluster (100 users).`,
    },
    {
      title: 'Security by Design',
      content: `**Network security zones:**

| Zone | Trust | Firewall policy |
|------|-------|-----------------|
| LAN users | Medium | Internet allowed, servers restricted |
| Servers | High | Inbound only from LAN specific ports |
| Guest | None | Internet only, no RFC1918 |
| IoT | Low | No internet or whitelist only |
| Management | High | Admin IPs only |

**Principles:**
- Default deny between VLANs
- Explicit allow: Workstations → DC (AD ports)
- Workstations → Servers (file, app ports only)
- Guest → WAN only
- IoT → camera cloud only, no LAN

**Admin access:**
- Jump host or VPN → management VLAN
- No direct internet to switch GUI`,
    },
    {
      title: 'Network Documentation: Mandatory Package',
      content: `**Network documentation package:**

1. **L1 diagram** — physical: racks, switches, AP locations
2. **L2/L3 diagram** — logical: VLANs, subnets, routing
3. **IPAM spreadsheet / NetBox** — every subnet documented
4. **Port matrix** — switch port → patch panel → desk
5. **Config backups** — weekly automated Git private repo
6. **Password vault** — Bitwarden, no Excel on share
7. **Runbooks** — no internet, switch down, ISP outage
8. **Contacts** — ISP, vendor, integrator, escalation
9. **Cable test results** — as-built
10. **Warranty inventory** — serial numbers, support contracts

**NetBox** - open-source IPAM + DCIM, recommended with 50 users.`,
    },
    {
      title: 'New office acceptance process',
      content: `**Acceptance checklist:**

**Cabling:**
- [ ] Fluke test Cat6 — pass all outlets
- [ ] Fiber light levels documented
- [ ] Labeling 100% ports

**Network:**
- [ ] All VLANs routing correctly
- [ ] DHCP works per VLAN
- [ ] DNS internal + external resolve
- [ ] Wi‑Fi coverage survey pass
- [ ] VPN external access works
- [ ] Failover WAN tested
- [ ] Firewall policies reviewed

**Operations:**
- [ ] Config backup taken
- [ ] Monitoring alerts configured
- [ ] Documentation handed over
- [ ] Admin training 2h session`,
    },
    {
      title: 'Budget and typical design errors',
      content: `**Typical errors:**

| Error | Consequence | Prevention |
|--------|-------------|------------|
| One VLAN | Security nightmare | Segment day 1 |
| Unmanaged switches | No VLAN, no STP | Managed only |
| PoE underrated | AP reboot under load | 30% headroom |
| No cable labeling | Hours debug | Label during install |
| DHCP on router only | No reservations scale | Windows or FG proper |
| Guest = Corp Wi‑Fi PSK | Leaked password | 802.1X + Guest VLAN |
| No UPS | Corruption on outage | UPS on network gear |
| /24 for 200 users | Exhaustion in 2 years | Plan /23 early |

**Budget ratio benchmark (50 users):**
- Cabling 30%
- Switches + AP 35%
- Firewall 15%
- Servers 15%
- UPS/rack 5%`,
    },
    {
      title: 'Comparison table: 10 vs 50 vs 100',
      content: `| Parameter | 10 users | 50 users | 100 users |
|----------|----------|----------|-----------|
| Switches | 1 | 3–4 | 5–8 |
| AP | 2 | 6 | 12 |
| Firewall | Entry | Mid | Mid-High + HA? |
| Fiber | Optional | Inter-floor | Multi-IDF |
| Dual WAN | Nice to have | Recommended | Required |
| On-prem DC | Optional | 2 DC | 2 DC + cluster |
| L3 switch | No | Optional | Yes (core stack) |
| Documentation | Spreadsheet | NetBox | NetBox + CMDB |
| Staff | MSP / 1 IT | 1 network part-time | Dedicated network |`,
    },
    {
      title: 'BoM: 3 office sizes with pricing',
      content: `**10 users (~€3-5k):** FG-40F €400, SW 24p PoE €300, AP×2 €200, UPS 1kVA €150, rack 12U €200, cabling €800.

**50 users (~€15-25k):** FG-80F €1200, core+2 access €2500, AP×6 €1200, 2 UPS €600, fiber €2000, server €3000, rack 42U €800.

**100 users (~€35-55k):** FG-100F HA €4000, L3 stack €6000, AP×12 €2400, dual WAN €500/mo, 2 IDF €8000, NetBox free, certs €1500.`,
    },
    {
      title: 'Server room layout ASCII',
      content: `Server room layout (42U rack, front view):

+--[RACK 42U]--+
| U42 Patch panel |
| U40 FG-100F     |
| U38 Core SW     |
| U35 UPS         |
| U20 Server      |
| U1  PDU         |
+---------------+
Cold aisle — front | Hot aisle — rear`,
    },
    {
      title: 'UPS sizing calculator',
      content: `Load W = sum devices. VA = W × 1.6. Runtime target 15 min → UPS rating. Example: FG 50W + SW 100W + Server 200W = 350W → 560VA min → buy 1000VA for headroom.`,
    },
    {
      title: 'Cable schedule template',
      content: `| ID | From | To | Type | Length | Test | Label |\\n| C001 | IDF1-P12 | AP-F2-03 | Cat6 | 25m | Pass | C001 |`,
    },
    {
      title: 'As-built documentation pack',
      content: `1. Topology diagram 2. IP plan 3. VLAN matrix 4. Port matrix 5. Firewall policies export 6. Wi-Fi survey 7. Cable schedule 8. Asset list 9. Config backups 10. Acceptance sign-off`,
    },
    {
      title: 'Design lab (16 steps)',
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
      content: `**Server room layout — detailed ASCII (42U example)**

+-- FRONT (cold aisle) --+
| U42  Fiber patch panel |
| U41  Cat6 patch panel  |
| U40  Cable management  |
| U38  FortiGate 100F    |
| U36  Core switch 48p   |
| U34  UPS 3000VA        |
| U20  Dell R750 server  |
| U18  Synology NAS      |
| U02  PDU metered       |
+-- REAR (hot aisle) ----+
HVAC: 18–27°C, humidity 40–55%
Fire: detect only pre-action if budget allows
Access: badge log, no food/drink

**UPS sizing worked example:**
FG 60W + Core 120W + Server 250W + Switch access 80W + NAS 80W = 590W
VA = 590 × 1.6 = 944 VA → buy 1500VA unit for 15 min runtime at load
Add 30% growth → 2000VA line-interactive or online for server room

**Cable schedule — 20 row example template:**
C001 IDF1-P01 → Desk-101 Cat6 18m TIA-568B pass label both ends
Document tester serial calibration date annually

**As-built pack index:**
1 Executive summary 2 Logical diagram 3 Physical diagram 4 IP plan 5 VLAN matrix 6 Port matrix 7 Firewall policy export 8 Wi‑Fi survey PDF 9 Cable test CSV 10 Asset warranty spreadsheet 11 Change log 12 Acceptance signatures

**BoM 10 users detail:**
Include patch cables Cat6 0.5m ×20, cable management 1U ×2, label printer consumables, spare SFP if fiber

**BoM 50 users detail:**
Dual ISP routers in bridge, FG HA optional not required, 2× IDF if >800m², fiber OM4 duplex between floors, ladder rack vs tray cost compare

**BoM 100 users detail:**
Consider FG 200F, separate RADIUS VM, dedicated Wi‑Fi survey contractor, NetBox on-prem VM, 24×7 ISP SLA

**IP addressing — reserved blocks doc:**
.1-.50 infrastructure static; .51-.99 future static; .100-.250 DHCP; .251-.254 reserved; document in NetBox

**PoE budget calculation template:**
Sum AP watts × count + phone watts × count + 30% headroom vs switch PoE budget printed on datasheet

**Dual WAN SD-WAN policy:**
Primary fiber weight 80%, LTE backup 20%, health check HTTP probe, failback when primary stable 5 min

**Security zones drawing:**
Internet | DMZ (if any web) | Users | Servers | Guest | IoT | Mgmt — arrows only through FG

**Cabling standards:**
Horizontal Cat6 max 90m channel; fiber OM4 10G up to 400m; use plenum rated in ceiling if HVAC return

**Rack elevation diagram:**
Visio or draw.io with U positions every device; paste photo after install for audit

**Environmental monitoring:**
Temperature sensor SNMP in rack; alert >30°C; water leak sensor floor if basement IDF

**Budget contingency line items:**
Spare AP, spare switch, extra 24p patch panel, 10% labor overrun

**Project phases Gantt rough:**
Week1 discovery; Week2 design sign-off; Week3-4 cabling; Week5 configure; Week6 test; Week7 handover

**Stakeholder sign-off:**
IT manager, Facilities, Finance for BOM >€10k, external auditor if regulated industry

**Post-install warranty register:**
FG support contract FortiCare; switch lifetime vs 5yr; AP limited lifetime; calendar renewal 90d alert

**Capacity planning 3-year:**
Headcount +20% → IP plan /23 enough? AP count +2 per 15 new users rule of thumb

**Documentation tools compare:**
NetBox vs phpIPAM vs Excel — NetBox wins >30 subnets

**Common design review questions:**
What if ISP down? What if switch fails? Guest isolation proof? IoT on separate VLAN? Mgmt reachable from user VLAN? (should be no)

**Fiber vs copper decision:**
Inter-IDF always fiber; desk Cat6a if 10G future; don't run copper >90m

**Cloud hybrid note:**
If Azure AD only no DC — adjust IP plan DHCP on FG; no on-prem DNS AD integrated

**Acceptance test script excerpt:**
Ping gateway each VLAN; DHCP lease test; DNS internal external; Wi‑Fi 802.1X; VPN split tunnel; print test page; failover unplug WAN1`,
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
      title: 'Chapter Summary',
      content: `1. **Topology** scales: 10 (single switch) → 50 (core+access) → 100 (stack+IDF)
2. **VLAN matrix** — servers, users, VoIP, print, Wi‑Fi, guest, IoT, mgmt
3. **IP plan** — reserve .1–.50 for infra, DHCP .100–.250
4. **Cabling** — Cat6 horizontal, fiber inter-floor, labeling mandatory
5. **Dual WAN** — SD-WAN failover from 50 users up
6. **Documentation** — before go-live, NetBox, config backup
7. **Acceptance** — test WAN failover, Wi‑Fi survey, cable certification

> Next chapter: **VLANs and switching** — trunk, STP, LAG, troubleshooting.`,
    },
  ],
  practice: [
    'BoM Excel 10/50/100 users with prices',
    'Server room ASCII for your office',
    'UPS calc 5 devices',
    'Cable schedule 20 rows',
    'As-built pack 10 docs list',
    'Topology draw.io 50 users 2 floors',
    'IP plan 9 VLAN',
    'PoE budget calc',
    'Dual WAN failover steps',
    'Acceptance checklist 25 items',
    'NetBox 5 subnets',
    'Security zones diagram',
    'Port matrix 24-port',
    'Budget ratio pie chart',
    'Compare 10 vs 100 table extend',
  ],
  resources: [
    { title: 'NetBox', url: 'https://netboxlabs.com/docs/netbox/en/stable/' },
    { title: 'TIA-568', url: 'https://www.cablinginstall.com/cable/article/14171128/tia568-standards-overview' },
    { title: 'FortiGate SD-WAN', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/798036/sd-wan' },
    { title: 'Cable labeling', url: 'https://www.fs.com/blog/cable-labeling-best-practices-51.html' },
    { title: 'APC UPS selector', url: 'https://www.apc.com/us/en/support/ups-selector/' },
    { title: 'CompTIA Network+', url: 'https://www.comptia.org/certifications/network' },
  ],
  quiz: [
    {
      question: 'Typical firewall location in an office network:',
      options: ['Between ISP and internal network', 'Behind every PC', 'Wi‑Fi only'],
      answer: 'Between ISP and internal network',
    },
    {
      question: 'VLAN Guest should usually:',
      options: ['Have internet access only', 'See AD servers', 'Be without DHCP'],
      answer: 'Have internet access only',
    },
    {
      question: 'Why PoE switch in the office?',
      options: ['Powering AP and IP phones over Ethernet', 'Only faster internet', 'Servers only'],
      answer: 'Powering AP and IP phones over Ethernet',
    },
    {
      question: 'IPAM is needed for:',
      options: ['Accounting for IP addresses and subnets', 'Only Wi‑Fi passwords', 'VPN only'],
      answer: 'Accounting for IP addresses and subnets',
    },
    {
      question: 'Dual WAN gives:',
      options: ['Internet channel reservation', 'Free internet', 'Automatic AD'],
      answer: 'Internet channel reservation',
    },
    {
      question: 'Patch cord marking is needed for:',
      options: ['Fast diagnostics in case of failure', 'Beauty', 'PoE reduction'],
      answer: 'Fast diagnostics in case of failure',
    },
    {
      question: 'DMZ in an office network is used for:',
      options: ['Publishing services with limited external access', 'Storing AD', 'Guest Wi‑Fi without firewall', 'Printers only'],
      answer: 'Publishing services with limited external access',
    },
    {
      question: 'Core switch in a three-tier model is:',
      options: ['Central L3/L2 aggregation node', 'Wi‑Fi controller only', 'ISP modem', 'Print server'],
      answer: 'Central L3/L2 aggregation node',
    },
    {
      question: 'Main goal of network segmentation in an office:',
      answer: 'Limit blast radius—isolate guests, IoT, and critical systems',
    },
    {
      question: 'Standard for structured cabling in an office:',
      options: ['TIA/EIA-568', 'ISO 9001', 'PCI DSS', 'HIPAA only'],
      answer: 'TIA/EIA-568',
    },
  ],
}

export default translation
