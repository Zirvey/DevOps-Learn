import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'VLANs and switches',
  duration: '10–12 hours',
  description:
    '802.1Q, trunk and access ports, inter-VLAN routing, STP, LAG and managed switches setup in the office',
  sections: [
    {
      title: 'Why VLAN in the office',
      content: `**VLAN (Virtual LAN, IEEE 802.1Q)** - logical segmentation of one physical switch fabric into isolated broadcast domains.

**No VLAN:**
- All devices in one L2 domain
- Broadcast storm affects everyone
- The guest connects to the socket → sees the servers
- Unable to QoS for VoIP
- MITM risks in open office

**With VLAN:**
- Broadcast isolated within VLAN
- Firewall policies between segments
- VoIP priority (VLAN 30 + QoS)
- Guest internet without LAN access
- Logical user movement without re-cabling

**802.1Q tag:** 4 bytes in Ethernet frame - VLAN ID (1–4094), priority (PCP).`,
    },
    {
      title: 'VLAN matrix for office 50 users',
      content: `**Full VLAN and policy matrix:**

| VLAN | Name | Subnet | Gateway | Allowed to |
|------|------|--------|---------|------------|
| 10 | SERVERS | 192.168.10.0/24 | .1 | From 20,30,50 (specific ports) |
| 20 | WORKSTATIONS | 192.168.20.0/23 | .1 | 10 (app ports), 40 (print), internet |
| 30 | VOIP | 192.168.30.0/24 | .1 | 10 (PBX), internet (SIP) |
| 40 | PRINTERS | 192.168.40.0/24 | .1 | From 20,50 only |
| 50 | WIFI-CORP | 192.168.50.0/24 | .1 | Same as 20 |
| 60 | WIFI-GUEST | 192.168.60.0/24 | .1 | Internet ONLY |
| 70 | IOT | 192.168.70.0/24 | .1 | Camera cloud whitelist |
| 99 | MANAGEMENT | 192.168.99.0/24 | .1 | Admin IPs only |

**Trunk allowed VLANs (typical uplink):** 10,20,30,40,50,60,70,99

**Native VLAN:** ​​do not use VLAN 1 - assign 999 unused as native on trunks.`,
    },
    {
      title: 'Access vs Trunk ports',
      content: `| Type | Tagged VLANs | Untagged | Connection |
|-----|--------------|----------|-------------|
| **Access** | 0 | 1 (PVID) | PC, printer, IP phone (data) |
| **Trunk** | Multiple | Native (optional) | Switch↔switch, switch↔FW, switch↔AP |

**Example port plan (48p access switch):**
| Ports | Mode | VLAN | Device |
|-------|------|------|--------|
| 1-36 | Access | 20 | Workstations |
| 37-40 | Access | 30 | VoIP phones |
| 41-42 | Access | 40 | Printers |
| 43-44 | Trunk | 50,60,99 | AP |
| 47-48 | Trunk | all | Uplink core |

**IP Phone + PC (shared port):**
- Phone trunk VLAN 30 + 20, PC on phone access port VLAN 20
- or dedicated port per device (easier troubleshoot)

**Native VLAN mismatch** between switches - leak traffic, security risk. Agree on all trunks.`,
    },
    {
      title: 'Inter-VLAN routing on FortiGate',
      content: `**FortiGate as L3 router between VLANs:**

Each VLAN = interface on FG:
- physical interface + VLAN sub-interface, OR
- software switch, OR
- dedicated VLAN interface bound to physical port

\\\`\\\`\\\`
PC VLAN 20 (192.168.20.50)
  → gateway 192.168.20.1 (FortiGate)
  → firewall policy: VLAN20 → VLAN10 allow AD,DNS,file
  → firewall policy: VLAN20 → WAN allow
  → Server VLAN 10 (192.168.10.10)
\\\`\\\`\\\`

**FortiGate policy order matters:**
1. Explicit deny Guest → LAN
2. Allow Workstation → DC (389, 88, 53, 445)
3. Allow Workstation → Internet
4. Log denied

**DHCP per VLAN:** FortiGate DHCP server OR relay to Windows DC.`,
    },
    {
      title: 'Inter-VLAN routing on L3 switch',
      content: `**When L3 switch (core):**
- High inter-VLAN traffic (storage, iSCSI)
- FortiGate bottleneck (small FG, many VLANs)
- Hairpin through FG undesirable

**SVI (Switch Virtual Interface):**
- vlan 20 → ip address 192.168.20.1/23 on core
- Default route to FortiGate for internet
- FortiGate sees only one transit VLAN or per-VLAN routed

**Hybrid design (common 100 users):**
- L3 switch routes internal VLANs
- FortiGate internet + VPN + security inspection
- ACL on switch or FG for east-west filtering`,
    },
    {
      title: 'Spanning Tree Protocol (STP/RSTP)',
      content: `**STP (802.1D) / RSTP (802.1w)** - prevents L2 loops with redundant links.

**How ​​it works:**
1. Elect root bridge (lowest bridge ID)
2. Each switch finds best path to root
3. Block redundant ports (blocking → forwarding)

**Office setup:**
| Parameter | Recommendation |
|-----------|--------------|
| Protocol | RSTP (802.1w) everywhere |
| Root bridge | Core switch, priority 4096 |
| Secondary root | Backup core, priority 8192 |
| Edge ports | portfast on access ports |
| BPDU Guard | ON all access ports |
| BPDU Filter | OFF (don't use) |

**Loop without STP:** broadcast/multicast storm, MAC table flapping, network “dies” in 10–30 seconds.

**Loop with STP:** one port blocked - redundancy without loop.`,
    },
    {
      title: 'Link Aggregation (LAG / LACP)',
      content: `**802.3ad LACP** - combining 2–8 physical links into one logical channel.

**Advantages:**
- Bandwidth: 2×1G = 2Gbps (or 2×10G)
- Redundancy: one link fails, traffic continues
- No STP block on LAG (single logical link)

**Typical LAGs in an office:**
| Connection | Config |
|------------|--------|
| Core ↔ FortiGate | 2×1G LACP active |
| Core ↔ Core stack | stack cables proprietary |
| Server ↔ switch | 2×10G LACP optional |

**Requirements:**
- LACP mode active both ends
- Same speed ports in group
- Same VLAN trunk config all members
- Max 8 ports typical

**Static LAG (no LACP)** - only if vendor requires, less flexible.`,
    },
    {
      title: 'QoS for VoIP and critical services',
      content: `**QoS layers:**
1. **L2 CoS** (802.1p) — 3 bits in VLAN tag, 0-7 priority
2. **L3 DSCP** — IP header, EF for voice (46)

**VoIP VLAN 30 setup:**
- Dedicated VLAN (always)
- QoS trust on switch uplinks
- Priority queue for CoS 5 (voice)
- Bandwidth guarantee 10% minimum

**Switch config concept:**
- class-of-service voice VLAN
- priority-queue strict for voice
- rate-limit guest VLAN egress

**Wi‑Fi:** WMM voice priority for Teams/Skype calls.`,
    },
    {
      title: 'Setting up managed switch: step-by-step runbook',
      content: `**Initial configuration (any vendor):**

**Day 0 — out of box:**
1. Console cable or default IP (check sticker)
2. Login default credentials → **change password immediately**
3. Set hostname: SW-F1-ACCESS01
4. Set management VLAN 99, static IP 192.168.99.11/24
5. Default gateway 192.168.99.1
6. Disable unused ports (shutdown)
7. Enable SSH, disable Telnet
8. Set NTP server
9. Enable SNMP read-only for monitoring

**Day 1 — VLANs:**
10. Create all VLANs from matrix
11. Assign access ports
12. Configure trunks (allowed VLAN list)
13. Enable RSTP, set priority
14. BPDU guard on access range
15. Configure LAG to core

**Day 2 — validation:**
16. Ping gateway each VLAN from test laptop
17. Verify MAC table
18. Save config + backup to TFTP/Git`,
      code: {
        language: 'text',
        caption: 'Example CLI (Cisco-like, concept for any L2)',
        code: `vlan 10
 name SERVERS
vlan 20
 name WORKSTATIONS
vlan 99
 name MANAGEMENT

interface GigabitEthernet1/0/1
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast
 spanning-tree bpduguard enable

interface GigabitEthernet1/0/48
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,50,60,99
 switchport trunk native vlan 999`,
      },
    },
    {
      title: 'Omada and FortiSwitch: Practical Notes',
      content: `**TP-Link Omada:**
- Omada Controller (software, hardware, cloud)
- Batch config VLAN, port profiles
- LAG, RSTP in GUI
- Port isolation for guest AP ports

**FortiSwitch (managed by FortiGate):**
- FortiLink — proprietary trunk to FG
- VLAN auto-provision from FG
- Centralized policy

**Choice:** standalone Omada cheaper SMB; FortiSwitch if already FortiGate ecosystem.`,
    },
    {
      title: 'Port security and access layer protection',
      content: `**Port security (optional SMB):**
- Limit MAC addresses per port (1 for workstation)
- Violation: shutdown port → notify admin
- Sticky MAC — learn and retain

**DHCP snooping:**
- Trusted ports: uplinks, DHCP server
- Untrusted: access ports
- Blocks rogue DHCP server from user laptop

**Dynamic ARP inspection (DAI):** with DHCP snooping — prevents ARP spoofing

**802.1X on wired:** NPS auth before port opens (advanced, see Wi‑Fi chapter for RADIUS).`,
    },
    {
      title: 'Troubleshooting matrix: switching',
      content: `| Symptom | Check 1 | Check 2 | Check 3 | Fix |
|---------|------------|------------|------------|-----|
| No link | Cable, SFP | Port shutdown? | NIC driver | Re-enable, replace cable |
| Wrong VLAN | show port vlan | Trace patch panel | — | Fix port assignment |
| Inter-VLAN fail | Ping gateway | FG policy log | Route table | Add policy/route |
| Slow network | STP reconvergence? | Loop? | Errors on port | Enable RSTP, find loop |
| Flapping MAC | Loop or duplicate IP | show mac move | — | BPDU guard, isolate |
| Trunk issue | Allowed VLAN list | Native mismatch | Tagging on AP | Align both ends |
| One user only | Access VLAN | NIC speed duplex | — | Fixed in port config |

**Diagnostic commands (concept):**
- show mac address-table
- show spanning-tree
- show interfaces status
- show vlan brief`,
    },
    {
      title: 'Diagnostics: the user does not see the server',
      content: `**5-step L1/L3 checklist:**

1. **Same VLAN?** User VLAN 20, server VLAN 10 — routing needed
2. **Gateway ping?** 192.168.20.1 ok from user PC
3. **Server ping?** 192.168.10.10 from user — fail?
4. **Firewall policy?** FG log: denied VLAN20→VLAN10?
5. **Server firewall?** Windows FW on server blocking?

**Traceroute** from user to server - where is the break?

**ARP table:** arp -a — server MAC resolved?

**Document in ticket:** each step result before escalation.`,
    },
    {
      title: 'Stacking and redundancy access layer',
      content: `**Switch stacking (50–100 users core):**
- Multiple switches act as one logical
- Cross-member LAG
- Single management IP
- Vendor proprietary: Cisco StackWise, Aruba VSX, etc.

**Access redundancy:**
- Dual uplink to core (STP or LAG from access)
- For critical areas: dual NIC workstation (rare in SMB)

**IDF design:** each floor IDF has uplink fiber to MDF — if one fiber cut, floor isolated (accept or dual fiber for 100 users).`,
    },
    {
      title: 'Switch Monitoring',
      content: `**SNMP metrics (PRTG/Zabbix):**
- Interface utilization
- Errors/discards per port
- CPU/memory switch
- STP topology change trap
- PoE consumption

**Syslog** to central server — link up/down, STP events, auth failures.

**Alerts:**
- Uplink > 80% sustained
- Broadcast rate anomaly (loop detection)
- Port error rate threshold
- Config change (if supported)`,
    },
    {
      title: 'Migration: from flat network to VLAN',
      content: `**Migration plan without downtime (weekend):**

**Preparation:**
1. Document current state
2. Create VLANs on switches (no port change yet)
3. Configure FortiGate interfaces + policies in shadow mode
4. Test with one pilot port

**Migration:**
5. Move servers to VLAN 10 (one at a time)
6. Enable DHCP relay per VLAN
7. Move users floor by floor (change access VLAN)
8. Deploy guest Wi‑Fi separate SSID

**Rollback:** keep old config backup, one floor at a time.`,
    },
    {
      title: 'Switching documentation',
      content: `**Port matrix template:**

| Switch | Port | Mode | VLAN | Patch Panel | Desk | Notes |
|--------|------|------|------|-------------|------|-------|
| SW-F1-01 | Gi1/0/1 | access | 20 | PP-F1-01 | F1-001 | John PC |
| SW-F1-01 | Gi1/0/48 | trunk | all | — | Uplink core | LACP member 1 |

**Update on every change** — stale docs worse than none.`,
    },
    {
      title: 'VLAN hopping: risks and protection',
      content: `**VLAN hopping** is an attack of moving from one VLAN to another through substitution of 802.1Q tags or exploitation double-tagging.

**Vectors:**
- **Switch spoofing** — attacker connects his switch, pretending to be trunk
- **Double tagging** — frame with two VLAN tags, outer tag is removed on the first switch

**Protection (required in the office):**
| Measure | Setting |
|------|-----------|
| BPDU Guard | On all access ports |
| Disable DTP | Explicit trunk only (no auto) |
| Native VLAN | Unused VLAN 999, not VLAN 1 |
| Port security | Limit 1 MAC on user ports |
| Management VLAN | Separate, ACL on FG |
| No user trunk | Policy: users never get trunk port |

**Double tagging mitigation:** native VLAN must not match the user VLAN; do not use VLAN 1.`,
    },
    {
      title: 'Practical case: office 50 users end-to-end',
      content: `**Scenario:** new office, 2 floors, 50 workstations, 8 VoIP, 6 AP, 4 printers.

**Step 1 — Core switch SW-CORE-01:**
- Ports 47-48 LACP trunk to FortiGate
- STP priority 4096 (root)
- Management VLAN 99: 192.168.99.2

**Step 2 - Access SW-F1-01 (floor 1):**
- Ports 1-30 access VLAN 20
- Ports 31-34 access VLAN 30 (phones)
- Ports 35-36 access VLAN 40 (printers)
- Port 37 trunk to AP (50,60,99)
- Port 48 trunk uplink to core
- BPDU guard ports 1-46

**Step 3 - FortiGate:**
- VLAN interfaces .1 gateways
- Policies per matrix
- DHCP relay VLAN 20,50 → DC

**Step 4 - Validation:**
- User F1 desk ping DC, fileserver, internet
- Phone registers to PBX
- Printer ping from user
- Guest Wi‑Fi no ping internal
- Failover: disconnect uplink, STP reconvergence < 5 sec

**Document:** port matrix Excel + Visio diagram in the “network book”.`,
    },
    {
      title: 'Cisco vs Omada vs FortiGate VLAN config',
      content: `Side-by-side access port VLAN 20:

**Cisco:** interface Gi1/0/1 → switchport mode access → switchport access vlan 20

**Omada:** Port profile Access VLAN 20

**FortiGate:** Internal interface VLAN subinterface vlan20 192.168.20.1/24

Trunk: Cisco switchport trunk allowed vlan 10,20,30; Omada trunk profile; FG 802.1Q on aggregate.`,
      code: {
        language: 'bash',
        caption: 'Cisco IOS excerpt',
        code: `interface GigabitEthernet1/0/48
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,50,60
 switchport nonegotiate`,
      },
    },
    {
      title: 'Micro-segmentation',
      content: `Beyond VLAN: dynamic groups in FortiGate, identity-based policies, Zero Trust Network Access. Workstation→Server only required ports 445,389,53 not any-any.`,
    },
    {
      title: 'Voice VLAN detailed',
      content: `CDP/LLDP-MED auto VLAN 30. DHCP option 150 TFTP. QoS trust CoS. Separate subnet /24. Firewall: phones→PBX SIP/RTP only.`,
    },
    {
      title: 'Camera VLAN IoT isolation',
      content: `VLAN 70 no internet except NVR cloud whitelist. MAC allowlist. No routing to VLAN 20. Pen test: scan from guest must not see cameras.`,
    },
    {
      title: 'Pen test findings common VLAN',
      content: `Flat network, VLAN hopping double-tag, native VLAN 1, STP no BPDU guard, management VLAN reachable from user, default switch passwords.`,
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
      content: `**Cisco IOS VLAN config — full access + trunk example:**

vlan 20
 name WORKSTATIONS
interface range Gi1/0/1-36
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast
 spanning-tree bpduguard enable
interface Gi1/0/48
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,50,60,99
 switchport nonegotiate

**Omada GUI equivalent:**
Settings → Wired Networks → LAN → VLAN 20; Port profile Access VLAN20 assign ports 1-36; Trunk profile uplink

**FortiGate VLAN interface:**
Network → Interfaces → + VLAN; Parent physical; VLAN ID 20; IP 192.168.20.1/24; DHCP server or relay

**Micro-segmentation FortiGate policies:**
VLAN20→VLAN10 allow TCP 445,389,88,53,135,3268 deny all else; log violations; review monthly

**Voice VLAN LLDP-MED:**
Switch advertises voice VLAN 30; phone auto assigns; PC behind phone data VLAN 20 via pass-through

**Camera VLAN isolation:**
VLAN70 no default route internet; NVR on VLAN10 allows 554 RTSP from NVR IP only; block camera→internet

**IoT VLAN:**
Smart TV, HVAC — no access to users; firmware update window whitelist vendor CDN IPs monthly list

**Pen test common VLAN findings remediated:**
Flat network → segment; VLAN1 native → change 999; STP no root guard → enable; switch default password → change; mgmt VLAN from user → restrict

**STP best practices SMB:**
Enable RSTP; root bridge on core; portfast on access; bpduguard on access; disable unused ports

**LAG between core and FG:**
802.3ad LACP 2 links; hash layer3+4; monitor one link fail scenario

**Inter-VLAN routing comparison:**
Router-on-stick FG vs L3 switch SVI — FG easier for SMB firewall policies; L3 switch if 10G east-west heavy

**VLAN hopping mitigation:**
Disable DTP; explicit trunk; no native VLAN user traffic; prune unused VLANs trunk

**Private VLAN (advanced):**
Rare SMB — isolate ports same VLAN for guest wired ports optional

**Multicast for video (if IPTV):**
IGMP snooping enable; querier on VLAN interface; avoid flood unknown multicast

**Switch hardening checklist:**
Disable unused ports; change default VLAN; SSH only no telnet; AAA RADIUS admin; syslog to SIEM

**Troubleshooting wrong VLAN:**
Show mac address-table on switch; verify PVID; trace port profile; laptop 802.1X vs static access

**Document port matrix Excel columns:**
Switch, Port, VLAN, Mode, Device, Room, Patch panel, Label ID, Changed date, Engineer

**QoS for VoIP on switch:**
Trust DSCP from phone; queue EF for voice; limit best effort user ports if congestion

**FortiSwitch integration note:**
If FG manages FortiSwitch — VLAN sync from FG; single pane; know difference vs standalone Omada

**Migration flat to VLAN:**
Maintenance window; pre-config trunk; move gateway to FG subinterfaces; DHCP scopes per VLAN; rollback plan single flat temp

**VLAN ID numbering convention:**
10 servers 20 users 30 voice 40 print 50 wifi corp 60 guest 70 iot 99 mgmt — document don't randomize

**Testing matrix after VLAN change:**
Ping gateway each VLAN; ping cross-VLAN allowed; ping cross-VLAN denied; internet guest only; AD auth from user VLAN

**CompTIA Network+ VLAN objectives:**
802.1Q tagging, trunk vs access, inter-VLAN routing concept, STP purpose — map lab exercises

**Case study VLAN:**
Guest Wi‑Fi same LAN as servers pre-project — pen test found file shares — post-project guest isolated pass audit

**Interview questions VLAN:**
Explain trunk; native VLAN risk; voice VLAN benefit; how FG routes between VLANs; STP loop symptom broadcast storm`,
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
      content: `1. **VLAN matrix** - segmentation servers, users, VoIP, print, Wi‑Fi, guest, IoT, mgmt
2. **Access vs trunk** - correct port = 50% troubleshooting
3. **Inter-VLAN routing** — FortiGate or L3 core + policies
4. **RSTP + BPDU guard** - loop protection
5. **LACP** - uplink redundancy and bandwidth
6. **QoS** - VoIP VLAN priority
7. **Troubleshooting matrix** — systematic checks

> Next chapter: **DHCP and DNS** - scopes, relay, split-horizon.`,
    },
  ],
  practice: [
    'Cisco+Omada+FG configs side by side doc',
    'Voice VLAN option 150 lab',
    'Camera VLAN FG policy',
    'Micro-seg 5 rules FortiGate',
    'STP BPDU guard enable',
    'Port matrix 48 ports',
    'Native VLAN change 999',
    'LAG 2-link config',
    'Inter-VLAN ping test matrix',
    'Pen test checklist 10 items',
    'Trunk allowed VLAN audit',
    'DHCP relay per VLAN',
    'Voice QoS trust',
    'IoT MAC filter',
    'VLAN diagram draw.io',
  ],
  resources: [
    { title: '802.1Q', url: 'https://en.wikipedia.org/wiki/IEEE_802.1Q' },
    { title: 'Cisco VLAN config', url: 'https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-3/configuration_guide/vlan/b_173_vlan_9300_cg.html' },
    { title: 'Omada VLAN', url: 'https://support.omadanetworks.com/' },
    { title: 'FortiGate VLAN', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/954635/vlan' },
    { title: 'STP best practices', url: 'https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/10556-16.html' },
    { title: 'CompTIA Network+', url: 'https://www.comptia.org/certifications/network' },
  ],
  quiz: [
    {
      question: '802.1Q adds to the frame:',
      options: ['VLAN tag', 'IP address', 'MAC only'],
      answer: 'VLAN tag',
    },
    {
      question: 'Trunk port is used for:',
      options: ['Transfers multiple VLAN tagged', 'One PC', 'Management only'],
      answer: 'Transfers multiple VLAN tagged',
    },
    {
      question: 'STP prevents:',
      options: ['Loops L2', 'DDoS', 'Virus'],
      answer: 'Loops L2',
    },
    {
      question: 'Inter-VLAN routing in SMB is more often on:',
      options: ['Firewall / L3 gateway', 'Printer', 'Each PC'],
      answer: 'Firewall / L3 gateway',
    },
    {
      question: 'BPDU Guard is included on:',
      options: ['Access ports', 'WAN only', 'Servers only'],
      answer: 'Access ports',
    },
    {
      question: 'LAG (LACP) gives:',
      options: ['Merging links for bandwidth and redundancy', 'Wi-Fi only', 'VLAN 1 only'],
      answer: 'Merging links for bandwidth and redundancy',
    },
  ],
}

export default translation
