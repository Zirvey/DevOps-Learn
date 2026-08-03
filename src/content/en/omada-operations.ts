import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Omada - VPN, monitoring and operation',
  duration: '12–15 hours',
  description:
    'OpenVPN, IPsec Azure, WireGuard, firewall export, dual WAN, SNMP MIB, Grafana, syslog, maintenance calendar, DR controller and day-2 ops',
  sections: [
    {
      title: 'Omada Gateway Operational Model',
      content: `**Omada Gateway (ER7206/ER8411)** - edge router, firewall, VPN concentrator, DHCP/DNS for all VLANs.

**Day-2 pillars:**
- Availability: dual WAN, health checks, alerting
- Security: firewall, VPN ACL, firmware
- Remote access: OpenVPN employees, IPsec branches/cloud
- Observability: SNMP, syslog, Grafana, Controller logs
- Recovery: backup/restore controller + documented runbooks

**Roles SMB:**
- **Admin:** full Controller access, change approval
- **Operator:** monitoring, tier-1 alerts
- **Helpdesk:** guest vouchers, VPN profile distribution

**As-built docs:** WAN IPs, VLAN table, firewall matrix, VPN PSK in vault + Confluence.`,
    },
    {
      title: 'OpenVPN: remote access for employees',
      content: `**Use case:** remote worker → office LAN (RDP, files, 1C).

**Setup (Settings → VPN → OpenVPN → Create):**
1. Server Mode: SSL VPN Server
2. Interface: WAN1
3. Client Pool: \\\`10.0.200.0/24\\\` (no overlap LAN!)
4. DNS: \\\`10.0.10.5\\\` internal DC
5. Split Tunnel: Enable → \\\`10.0.0.0/8\\\` via VPN
6. Protocol: UDP 1194
7. Encryption: AES-256-GCM
8. Export .ovpn profile

**Firewall:** Allow VPN pool → VLAN 10, 20 (restrict ports).

**ER7206 limit:** ~16 concurrent — plan ER8411 for growth.

**Client:** OpenVPN Connect all platforms.`,
    },
    {
      title: 'OpenVPN: Users and Authentication',
      content: `**Local VPN Users:** Settings → VPN → OpenVPN → Users.

**RADIUS (recommended):** OpenVPN → RADIUS Profile → NPS «VPN-Users» AD group.

**Offboarding:** disable AD → VPN fails immediately.

**MFA gap:** Omada OpenVPN no native MFA — use RADIUS + Azure MFA extension or cert-based auth.

**Cert rotation:** annual for client certs if EAP-TLS-style VPN certs used.`,
    },
    {
      title: 'IPsec Site-to-Site VPN',
      content: `**Office ↔ Office (Omada ↔ Omada):**

**Moscow initiator:**
1. Settings → VPN → IPsec → Create
2. Name: \\\`S2S-Kazan\\\`
3. Remote GW: public IP
4. IKEv2, AES-256, SHA-256, DH14
5. PSK 32+ chars → vault
6. Local: \\\`10.0.0.0/16\\\`, Remote: \\\`10.1.0.0/16\\\`
7. NAT-T Enable

**Mirror on remote.** Verify tunnel Up, ping cross-subnet.

**Troubleshooting:** Phase 1 = IKE/PSK/NAT; Phase 2 = subnet selectors mismatch.`,
    },
    {
      title: 'IPsec VPN to Microsoft Azure',
      content: `**Use case:** Omada ER7206/ER8411 ↔ Azure VPN Gateway (VNet connectivity).

**Azure side (Portal):**
1. Create Virtual Network Gateway (VpnGw1)
2. Local Network Gateway = Omada office public IP
3. Local address space: \\\`10.0.0.0/16\\\`
4. Create VPN Connection → IPsec PSK
5. Note Azure public IP and shared key

**Omada side:**
1. Settings → VPN → IPsec → Create
2. Remote Gateway: Azure VPN Gateway public IP
3. IKEv2
4. Encryption: **AES-256, SHA-256, DH Group 2 or 14** (match Azure proposal!)
5. PSK: same as Azure connection
6. Local Subnet: \\\`10.0.0.0/16\\\` (office)
7. Remote Subnet: \\\`10.100.0.0/16\\\` (Azure VNet)
8. NAT-T: Enable (office likely behind NAT)

**Azure IKE match (typical):**
| Parameter | Azure | Omada |
|-----------|-------|-------|
| IKE | v2 | v2 |
| Encryption | AES256 | AES-256 |
| Integrity | SHA256 | SHA-256 |
| PFS | DHGroup14 | DH14 |
| Phase1 SA | 28800s | match |

**Firewall Omada:** allow Azure VNet → office servers (specific ports).

**Route:** Azure VMs use Local Network Gateway routes; Omada auto-adds remote subnet.

**Test:** ping Azure VM \\\`10.100.1.4\\\` from office workstation; traceroute via tunnel.

**Common failure:** Azure requires specific crypto suite — mismatch = Phase 1 fail; use Azure «Reset» on connection after Omada change.`,
    },
    {
      title: 'WireGuard: comparison with Omada VPN',
      content: `**Omada native VPN:** OpenVPN, IPsec IKEv2, L2TP (legacy). **No native WireGuard** on ER7206/ER8411.

**WireGuard comparison:**

| Aspect | OpenVPN (Omada) | IPsec (Omada) | WireGuard (external) |
|--------|-----------------|---------------|----------------------|
| Native Omada | Yes | Yes | No |
| Performance ER7206 | Moderate | Good | N/A on box |
| Setup complexity | Low | Medium | Low (if Linux) |
| Mobile clients | Good | Good | Excellent |
| Site-to-site | OpenVPN limited | **Best on Omada** | Needs Linux endpoint |
| Crypto | AES-256-GCM | AES-256 | ChaCha20 |

**WireGuard workaround architecture:**
\\\`\\\`\\\`
Remote user ──WireGuard──► Linux VM (10.0.99.20) ──► Office LAN VLANs
                              └── not through ER7206 VPN engine
\\\`\\\`\\\`

**When WireGuard instead of Omada VPN:**
- Dev team wants modern VPN on Linux bastion
- Need >50 concurrent on ER7206 limit
- Cloud-native team already runs WireGuard on K8s

**When stay Omada VPN:**
- Single vendor support
- Unified firewall rules for VPN pool
- No extra Linux VM to patch

**Hybrid:** IPsec site-to-site for Azure + OpenVPN for users = standard Omada ops; WireGuard only if explicit requirement.`,
    },
    {
      title: 'L2TP/IPsec and legacy VPN',
      content: `**L2TP/IPsec:** legacy Windows built-in VPN — weaker security.

**Setup if required:** Settings → VPN → L2TP, PSK, pool \\\`10.0.201.0/24\\\`.

**PPTP:** NEVER enable — broken protocol.

**2025 recommendation:** OpenVPN or IPsec only; migrate L2TP users within 6 months.`,
    },
    {
      title: 'Firewall: Designing Rules',
      content: `**Zone model:**

| Zone | VLAN | Trust |
|------|------|-------|
| LAN | 10,20,30,50,70 | Trusted |
| Guest | 60 | Untrusted |
| VPN | 200,201 | Semi-trusted |
| WAN | — | External |

**Rule order (first match wins):**

| # | Action | Source | Dest | Service |
|---|--------|--------|------|---------|
| 1 | Deny | Guest 60 | RFC1918 | Any |
| 2 | Allow | Guest 60 | WAN | DNS,HTTP,HTTPS |
| 3 | Allow | VPN 200 | Servers 10 | RDP,445,3389 |
| 4 | Allow | WS 20 | Servers 10 | App ports |
| 5 | Deny | CCTV 40 | WAN | Any |
| 6 | Allow | LAN | WAN | Any |
| 7 | Deny | Any | Any | Any |

**UI:** Settings → Transmission → Firewall → ACL.

**Log denies** for audit — watch volume.`,
    },
    {
      title: 'Firewall rule set: full export example',
      content: `**Documented firewall matrix (as-built export format):**

\\\`\\\`\\\`yaml
# Omada Firewall ACL Export — Office-Moscow
# Gateway: ER7206 | Version: 1.3.x | Date: 2025-06-01
# Rule order: top to bottom, first match wins

rules:
  - id: 1
    name: DENY-Guest-to-LAN
    action: deny
    log: true
    source:
      type: network
      network: WIFI-GUEST      # VLAN 60
    destination:
      type: ip_range
      range: 10.0.0.0/8
    service: any

  - id: 2
    name: DENY-Guest-to-RFC1918-172
    action: deny
    log: true
    source:
      network: WIFI-GUEST
    destination:
      range: 172.16.0.0/12
    service: any

  - id: 3
    name: DENY-Guest-to-RFC1918-192
    action: deny
    source:
      network: WIFI-GUEST
    destination:
      range: 192.168.0.0/16
    service: any

  - id: 4
    name: ALLOW-Guest-Internet
    action: allow
    source:
      network: WIFI-GUEST
    destination:
      type: any
    service: DNS,HTTP,HTTPS

  - id: 5
    name: ALLOW-VPN-to-Servers
    action: allow
    source:
      range: 10.0.200.0/24     # OpenVPN pool
    destination:
      network: SERVERS       # VLAN 10
    service: RDP,SSH,SMB,HTTPS

  - id: 6
    name: ALLOW-VPN-to-Workstations
    action: allow
    source:
      range: 10.0.200.0/24
    destination:
      network: WORKSTATIONS
    service: RDP

  - id: 7
    name: ALLOW-WS-to-Servers
    action: allow
    source:
      network: WORKSTATIONS
    destination:
      network: SERVERS
    service: SMB,HTTP,HTTPS,MSSQL,RDP

  - id: 8
    name: DENY-WS-to-Servers-SQL
    action: deny
    source:
      network: WORKSTATIONS
    destination:
      network: SERVERS
    service: MSSQL
    note: IT group uses VPN for SQL

  - id: 9
    name: DENY-CCTV-Internet
    action: deny
    source:
      network: CCTV          # VLAN 40
    destination:
      type: any
    service: any

  - id: 10
    name: ALLOW-NVR-to-CCTV
    action: allow
    source:
      ip: 10.0.10.50         # NVR
    destination:
      network: CCTV
    service: any

  - id: 11
    name: DENY-IoT-Lateral
    action: deny
    source:
      network: IOT           # VLAN 80
    destination:
      range: 10.0.0.0/8
    service: any

  - id: 12
    name: ALLOW-LAN-Internet
    action: allow
    source:
      type: lan
    destination:
      type: wan
    service: any

  - id: 13
    name: IMPLICIT-DENY
    action: deny
    source: any
    destination: any
    service: any
\\\`\\\`\\\`

**Operational use:** store YAML in Git; after UI change update YAML within 24h; quarterly diff audit UI vs Git.

**Omada UI export:** full config in controller .bin backup; per-rule documentation manual or via Open API where supported.`,
    },
    {
      title: 'NAT, Port Forwarding and Hairpin',
      content: `**Port forward (minimize):** WAN:443 → 10.0.10.20:443, source IP whitelist.

**Hairpin NAT:** internal access to public IP — enable for 1C/web apps.

**Prefer:** reverse proxy in VLAN 10 over direct port forward to workstation.

**Quarterly review:** remove stale forwards.`,
    },
    {
      title: 'Dual WAN: failover and load balance',
      content: `**WAN1 fiber primary, WAN2 LTE backup.**

**Failover Only recommended** for 1C, banking, VoIP (session stickiness).

**Health check:** 8.8.8.8 + 1.1.1.1, interval 30s, fail threshold 3.

**Test:** pull WAN1 cable → WAN2 < 90s → document packet loss.

**Document:** both public IPs, LTE SIM ICCID, ISP contacts.`,
    },
    {
      title: 'DNS, DHCP and Gateway Network Services',
      content: `**DHCP per VLAN:** lease 8h workstations, 24h printers; reservations by MAC.

**DNS:** internal DC primary; Guest public DNS only.

**NTP:** pool.ntp.org or internal.

**Troubleshoot «internet OK, names fail»:** DNS reachability, Guest DNS leak, VPN suffix.`,
    },
    {
      title: 'SNMP MIB monitoring Gateway and Switch',
      content: `**Enable SNMP (Devices → Gateway → Services → SNMP):**
- v2c unique community OR v3 authPriv (authSHA, privAES)
- Trap receiver: monitoring server UDP 162

**Key MIB groups (standard IF-MIB + vendor):**

| OID / Metric | Description | Alert threshold |
|--------------|-------------|-----------------|
| IF-MIB ifOperStatus | WAN link up/down | != up |
| IF-MIB ifInErrors/ifOutErrors | Interface errors | > 100/hour |
| HOST-RESOURCES-MIB hrProcessorLoad | CPU % | > 80% 5min |
| HOST-RESOURCES-MIB hrStorageUsed | Memory/disk | > 90% |
| Custom VPN tunnel status | IPsec/OpenVPN up | down > 2min |
| DHCP pool utilization | Omada insight/API | > 80% |

**SNMP walk example:**
\\\`\\\`\\\`bash
snmpwalk -v2c -c OmadaReadOnly 10.0.99.1 IF-MIB::ifOperStatus
snmpwalk -v2c -c OmadaReadOnly 10.0.99.1 HOST-RESOURCES-MIB::hrProcessorLoad
\\\`\\\`\\\`

**Switch PoE OID:** monitor total power vs budget via vendor-specific OID (check TP-Link MIB download).

**Security:** SNMP read-only; access only from VLAN 99 monitoring host; rotate community quarterly.

**v3 recommended prod:**
\\\`\\\`\\\`
username: omada-monitor
auth: SHA, authPassword: ***
priv: AES, privPassword: ***
\\\`\\\`\\\``,
    },
    {
      title: 'Grafana dashboard ideas for Omada',
      content: `**Stack:** Prometheus/SNMP Exporter → Grafana OR Zabbix → Grafana plugin.

**Dashboard panels (suggested):**

| Panel | Source | Visualization |
|-------|--------|---------------|
| WAN status | SNMP ifOperStatus WAN1/WAN2 | Stat red/green |
| WAN throughput | ifHCInOctets/ifHCOutOctets | Time series Mbps |
| Gateway CPU/Memory | hrProcessorLoad | Gauge |
| VPN tunnels up | SNMP/custom script | Stat |
| OpenVPN sessions | Controller API poll | Counter |
| Device count online | Open API | Stat |
| AP clients total | Open API | Time series |
| DHCP pool % | Gateway SNMP/API | Gauge per VLAN |
| Firewall denies/min | Syslog Loki query | Time series |
| PoE budget % | Switch SNMP | Gauge per switch |
| Top talkers | NetFlow if available / Insight manual | Table |

**Loki + Promtail for syslog:**
\\\`\\\`\\\`
{facility="local1"} |= "firewall" | json | line_format "{{.message}}"
\\\`\\\`\\\`

**Alert rules (Grafana):**
- WAN down > 2 min → P1 PagerDuty
- VPN tunnel down > 5 min → P2
- Gateway CPU > 90% 10 min → P2
- DHCP pool > 90% → P3

**Homelab shortcut:** Zabbix templates community «TP-Link» → Grafana Zabbix datasource — faster than raw SNMP exporter setup.

**Controller Software:** also export JVM metrics via node_exporter on host for controller health panel.`,
    },
    {
      title: 'Syslog and log centralization',
      content: `**Architecture:**
\\\`\\\`\\\`
Gateway + Switches + AP + Controller → UDP 514 → Graylog/ELK/Loki
\\\`\\\`\\\`

**Gateway syslog categories:** Firewall, VPN, DHCP, System.

**Useful alerts:**
- Firewall deny spike Guest VLAN
- VPN auth fail > 10/min
- Gateway reboot
- Config change operation log

**Retention:** 90–180 days; GDPR IP/MAC policy.

**Wazuh:** optional SIEM on same syslog stream for correlation.`,
    },
    {
      title: 'Maintenance calendar: annual plan',
      content: `**Daily (automated):**
- Device offline alert
- WAN down alert
- VPN tunnel down
- Controller disk < 20%

**Weekly:**
- Insight dashboard review
- DHCP pool < 80%
- Guest voucher inventory
- Failed VPN auth review

**Monthly:**
| Week | Task |
|------|------|
| W1 | Firmware advisory check omadanetworks.com |
| W2 | User/VPN access review vs HR |
| W3 | Guest Wi‑Fi end-to-end test |
| W4 | Verify backup success + download offsite copy |

**Quarterly:**
- Controller restore drill (lab)
- Firewall rule audit vs Git YAML
- Guest isolation penetration test
- Dual WAN failover test
- Network diagram update
- SNMP community rotation
- Security audit checklist

**Half year:**
- VPN PSK/cert rotation
- RADIUS secret rotation
- AP RF survey spot-check

**Annually:**
- Hardware warranty review
- Capacity planning (users, AP, PoE, VPN sessions)
- Full disaster recovery tablettop exercise
- TCO review vs alternatives
- Update runbooks

**Calendar template (ICS):** recurring Sunday 02:00 firmware window quarterly; backup daily 03:00 automated.`,
    },
    {
      title: 'Backup, restore and disaster recovery controller',
      content: `**Controller backup:**
1. Settings → Maintenance → Backup → Auto weekly
2. SMB/NFS share + encrypted offsite
3. Keep 4 local + 1 offsite minimum

**Gateway config:** included in .bin; optional per-device export.

**DR scenarios:**

| Scenario | RTO | Procedure |
|----------|-----|-----------|
| Controller VM crash | 2h | New VM, restore .bin, **same IP** |
| Gateway hardware fail | 4h | New ER7206, adopt, restore or re-provision |
| Accidental rule delete | 15m | Restore backup or manual revert |
| Ransomware controller | 4h | Clean install, offline backup |
| Cloud account compromise | 24h | TP-Link support, 2FA recovery, offline backup |
| OC200 dead | 2h | Replace hardware, restore .bin |

**DR controller runbook (Software):**
1. Provision Ubuntu VM (same specs or larger)
2. Install matching or newer controller version
3. Restore latest .bin backup
4. Assign **exact same IP** (10.0.99.10)
5. Verify firewall rules, VLANs in UI
6. Wait 15 min — devices reconnect automatically
7. Verify all devices Connected
8. If devices stuck: verify ports 29810-29814, no old controller running
9. Post-incident: root cause, update backup frequency if needed

**Quarterly drill:** lab restore without touching production devices.

**RPO target SMB:** 24h daily backup. **RTO target:** 4h.`,
    },
    {
      title: 'Change management for SMB',
      content: `**Process:**
1. Ticket with rollback plan
2. Announce maintenance 24h Slack/email
3. Backup before change
4. Implement → verify → close
5. Post-mortem if failed

| Change | Risk | Window |
|--------|------|--------|
| Firewall rule | Medium | Business hours OK |
| Gateway firmware | High | Sunday 02:00 |
| VLAN renumber | High | Weekend |
| VPN user add | Low | Anytime |
| Dual WAN test | Medium | After hours |

**Rollback template:** «Restore backup DATE-TIME» or «Delete rule #N».`,
    },
    {
      title: 'Day-2 operations: regular tasks',
      content: `See Maintenance Calendar section for full schedule.

**Critical daily automated alerts:** WAN down, core switch offline, controller unreachable, VPN tunnel down site-to-site.

**Operator shift checklist (15 min):**
- Dashboard all green?
- Any alerts overnight?
- WAN throughput normal?
- VPN sessions expected count?

**Escalation:** outage > 1h business impact → manager + ISP ticket parallel.`,
    },
    {
      title: 'Integration with Active Directory and NPS',
      content: `| Service | AD Integration |
|---------|----------------|
| Wi‑Fi Corp | NPS PEAP/EAP-TLS |
| VPN OpenVPN | RADIUS → NPS |
| Guest Portal | Local users |
| Controller Admin | Local separate creds |

**NPS HA:** primary DC1, secondary DC2 in RADIUS profile.

**Leaver:** disable AD → Wi‑Fi + VPN denied.

**Never use domain admin for Omada login** — break-glass local admin only.`,
    },
    {
      title: 'Security hardening Gateway',
      content: `**Baseline:**
1. Default passwords changed
2. Admin UI VPN-only access
3. Disable WAN ping if option
4. PPTP disabled
5. Guest isolated tested
6. SNMP not «public»
7. Firmware stable branch
8. 2FA TP-Link Cloud
9. Port forwards minimized
10. UPS on gateway + core switch

**WAN surface:** Cloudflare tunnel > port forward for public web.`,
    },
    {
      title: 'Security audit checklist (operations)',
      content: `- [ ] Firewall rules match Git YAML export
- [ ] Guest → RFC1918 deny tested this quarter
- [ ] VPN users match HR active list
- [ ] OpenVPN split tunnel scope minimal
- [ ] IPsec PSK < 365 days old or rotation scheduled
- [ ] No port forward without owner documented
- [ ] SNMP v3 or strong v2c community
- [ ] Syslog receiving from all devices
- [ ] Backup < 7 days old, offsite copy verified
- [ ] Restore drill this quarter completed
- [ ] Dual WAN failover tested this quarter
- [ ] Controller admin accounts reviewed
- [ ] Azure IPsec crypto matches both sides documented
- [ ] Grafana alerts firing correctly (test alert monthly)`,
    },
    {
      title: 'Case study: cafe 10 users – operations',
      content: `**Minimal ops:** Omada Cloud, ER605, no on-prem controller.

**Monitoring:** TP-Link app notifications device offline.

**Backup:** monthly Cloud backup download to owner laptop.

**VPN:** not needed for 10 users.

**Firewall:** Guest deny LAN only rule — test monthly.

**Firmware:** quarterly auto-schedule Sunday 3am.

**Support:** owner phone → IT contractor retainer for emergencies.`,
    },
    {
      title: 'Case study: office 50 – operations',
      content: `**Software Controller VM, Zabbix SNMP, Graylog syslog.**

**VPN:** OpenVPN 8 regular remote users, RADIUS NPS.

**Dual WAN:** fiber + LTE, failover tested quarterly.

**Grafana:** WAN throughput + VPN sessions + device count dashboard on NOC TV.

**Maintenance:** monthly backup verify; quarterly restore drill; firewall Git YAML audit.

**On-call:** operator tier-1 → admin tier-2 → TP-Link support tier-3 with logs ready.`,
    },
    {
      title: 'Case study: warehouse 100+ – operations',
      content: `**OC300 controller, ER8411, 4 site IPsec to HQ (if multi-warehouse).**

**Monitoring:** full SNMP + Grafana + PagerDuty P1 WAN/VPN.

**Syslog:** Wazuh SIEM for firewall denies, VPN brute force.

**DR:** OC300 spare on shelf; daily backup NAS + weekly offsite S3; RTO 2h documented.

**Maintenance calendar strictly followed** — scanner Wi‑Fi outage = production stop.

**Capacity review semiannual:** VPN sessions, DHCP pools, AP client counts trending.`,
    },
    {
      title: 'Firmware compatibility matrix (gateway/ops)',
      content: `| Controller | ER7206 | ER8411 | ER605 |
|------------|--------|--------|-------|
| 5.15.x | 1.3.x | 1.3.x | 2.2.x |
| 5.14.x | 1.2.x | 1.2.x | 2.1.x |

**Gateway upgrade:** always after controller; backup before; verify VPN tunnels re-establish.

**Feature check post-upgrade:** IPsec to Azure, OpenVPN export, hairpin NAT if used.`,
    },
    {
      title: 'Lab walkthrough: VPN and firewall in 15 steps',
      content: `**Step 1.** Lab Controller + adopted ER7206 (or simulated gateway docs).

**Step 2.** Create VLAN 20 + 60 Wired Networks with DHCP.

**Step 3.** Firewall rule 1: Deny Guest → 10.0.0.0/8.

**Step 4.** Firewall rule 2: Allow LAN → WAN.

**Step 5.** Test Guest ping internal - must FAIL (skip if no Guest client).

**Step 6.** Settings → VPN → OpenVPN → Create server pool 10.0.200.0/24.

**Step 7.** Split tunnel 10.0.0.0/8 enabled.

**Step 8.** Create local VPN user labuser.

**Step 9.** Export .ovpn profile.

**Step 10.** Firewall Allow VPN 200 → VLAN 20 RDP.

**Step 11.** Install OpenVPN Connect on lab laptop.

**Step 12.** Connect VPN → verify IP 10.0.200.x.

**Step 13.** Ping internal gateway 10.0.20.1 - OK.

**Step 14.** Document firewall rules as YAML export format.

**Step 15.** Backup controller .bin → snapshot lab state.

**Windows lab:** OpenVPN Connect for Windows on steps 11–13; PowerShell Test-NetConnection for ping tests.`,
    },
    {
      title: 'FAQ: 10 frequently asked questions (operations)',
      content: `**1. OpenVPN vs IPsec for remote users?**
OpenVPN easier; IPsec better site-to-site and Azure.

**2. How many OpenVPN on ER7206?**
~16 concurrent — check datasheet for exact firmware.

**3. Does Omada support WireGuard?**
No native — use external Linux VM if required.

**4. How to export firewall rules?**
Manual YAML doc + full .bin backup; Open API limited write/read ACL.

**5. Does Dual WAN load balance break 1C?**
Yes often — use failover only.

**6. Grafana without SNMP?**
Controller Open API polling alternative for device counts.

**7. IPsec Azure Phase 1 fail?**
Crypto mismatch — align AES256/SHA256/DH14 both sides.

**8. How is test backup valid?**
Quarterly lab restore - don't trust untested backups.

**9. Controller on Cloud - DR?**
Download .bin monthly offsite; protect TP-Link ID with 2FA.

**10. Log retention compliance?**
90–180 days typical SMB; anonymize if GDPR concern.`,
    },
    {
      title: 'Troubleshooting encyclopedia (operations)',
      content: `| # | Symptom | Reason | Solution |
|---|---------|---------|---------|
| 1 | OpenVPN timeout | UDP 1194 blocked | Try TCP 443 profile |
| 2 | VPN auth fail | RADIUS/creds | NPS log |
| 3 | VPN no LAN access | Firewall deny pool | Allow VPN→LAN rule |
| 4 | VPN no DNS | DNS not pushed | OpenVPN DNS settings |
| 5 | IPsec Phase 1 fail | PSK/NAT | Verify PSK, NAT-T |
| 6 | IPsec Phase 2 fail | Subnet mismatch | Selectors align |
| 7 | Azure IPsec down | Crypto mismatch | Match IKE proposal |
| 8 | Intermittent VPN | Idle timeout | Keepalive adjust |
| 9 | Slow VPN | ER7206 CPU | ER8411, split tunnel |
| 10 | One-way traffic | Asymmetric route | Routes both ends |
| 11 | Failover no work | Health check loose | Threshold/DNS check |
| 12 | WAN flapping | Unstable primary | Increase fail count |
| 13 | Load balance app break | Session split ISP | Failover only mode |
| 14 | Guest reaches server | Rule order | Deny Guest above Allow |
| 15 | Port forward dead | Wrong internal IP | Verify server IP |
| 16 | Hairpin fail | NAT loopback off | Enable hairpin |
| 17 | DHCP exhaustion | Small pool | Expand/shorten lease |
| 18 | SNMP timeout | ACL/firewall | Allow VLAN99→monitor |
| 19 | Syslog missing | Wrong IP/port | Verify 514 UDP |
| 20 | Controller restore fail | Version mismatch | Match controller version |
| 21 | Post-firmware VPN dead | Config reset | Re-export VPN settings |
| 22 | Grafana flatline | SNMP community wrong | Rotate/update exporter |`,
    },
    {
      title: 'Interview questions: Omada operations',
      content: `**8 questions:**

**1.** Design firewall rule order for Guest, VPN, LAN — explain first-match semantics.

**2.** OpenVPN split vs full tunnel — when which for compliance?

**3.** IPsec Omada to Azure — list Phase 1 crypto that must match.

**4.** ER7206 at 18 VPN users — what do you recommend?

**5.** WireGuard vs OpenVPN on Omada — architecture if client demands WireGuard?

**6.** DR: controller VM died Friday 5pm — step-by-step RTO 4h.

**7.** What Grafana panels for Omada NOC dashboard minimum viable?

**8.** Dual WAN load balance vs failover — business impact example?

**Strong answers:** failover for 1C, Azure crypto table, same IP restore, SNMP+syslog stack, Git-tracked firewall YAML.`,
    },
    {
      title: 'Dynamic DNS (DDNS) for changing WAN IP',
      content: `**Use case:** office on dynamic ISP IP but remote workers need stable hostname for IPsec/OpenVPN.

**Omada DDNS (Settings → Internet → DDNS):**
- Providers: No-IP, DynDNS, TP-Link cloud (check supported list per firmware)
- Hostname: \\\`office-moscow.ddns.net\\\`
- Update on WAN IP change automatic

**IPsec site-to-site:** remote end uses DDNS hostname not static IP — verify peer supports hostname resolution.

**OpenVPN:** distribute .ovpn with remote ddns hostname embedded.

**Alternative:** business fiber with static IP — skip DDNS (preferred prod).

**Monitor:** alert if DDNS update fails 24h — may indicate WAN issue.

**Azure IPsec note:** Azure Local Network Gateway typically needs static IP — use DDNS updater script on Azure side if office IP dynamic (less common enterprise).`,
    },
    {
      title: 'Controller high availability: options and limits',
      content: `**Omada Software Controller — NO native active-active HA cluster.**

**Practical HA patterns:**

| Pattern | RTO | Complexity |
|---------|-----|------------|
| Daily backup + cold standby VM | 2–4h | Low |
| VM snapshot weekly + auto backup daily | 1–2h | Low |
| OC300 hardware + USB backup | 2h | Low |
| Omada Cloud (TP-Link SLA) | minutes | Low ops |
| Hot standby VM powered off, sync backup | 30–60m | Medium |

**Hot standby procedure:**
1. Secondary VM installed same controller version, powered off
2. Daily rsync backup .bin to standby host
3. Failover: power on standby, restore latest .bin, assign same IP via VM migration
4. Devices reconnect automatically

**NOT supported:** two controllers managing same site simultaneously — causes adoption conflict.

**Cloud vs on-prem HA:** Cloud eliminates controller VM ops but introduces internet dependency.

**Database:** controller embeds config in local DB — no external PostgreSQL cluster option.`,
    },
    {
      title: 'PCI-DSS and compliance logging',
      content: `**Guest Wi‑Fi isolation (PCI requirement if CDE present on network):**
- CDE VLAN 10 isolated — no route from Guest 60
- Quarterly test documented: Guest ping CDE server FAIL
- Firewall deny rules logged

**Logging requirements:**
- Firewall allow/deny logs retained 90 days minimum
- VPN access logs via RADIUS accounting
- Controller operation log — who changed ACL
- Syslog to tamper-resistant storage (WORM/S3 object lock optional)

**Segmentation validation:**
- Quarterly Nmap from Guest VLAN toward CDE — only expected denies
- Change control for any rule touching CDE boundary

**Omada limitation:** not a PCI-certified appliance like FortiGate — SMB PCI SAQ-A may offload card processing to P2PE terminal on separate network entirely (recommended for cafe case study).`,
    },
    {
      title: 'IPsec Azure: extended troubleshooting matrix',
      content: `| Phase | Symptom | Azure side check | Omada side check |
|-------|---------|------------------|------------------|
| P1 | Timeout | NSG allow UDP 500,4500 ESP | WAN firewall pass IKE |
| P1 | Auth fail | Re-enter PSK connection | PSK character-for-character |
| P1 | Proposal mismatch | View Azure diag logs | Match AES256/SHA256/DH14 |
| P2 | Quick mode fail | Traffic selector CIDR | Local/remote subnet exact match |
| P2 | One subnet only works | Add address spaces VNet | Add multiple phase2 if needed |
| Connected no ping | NSG on VM subnet | Allow ICMP or app ports | Omada firewall allow Azure CIDR |
| Intermittent | DPD timeout | Increase DPD interval | Keepalive on both sides |
| After office IP change | Tunnel down | Update Local NW Gateway IP | Update DDNS or static IP |
| Double NAT | Phase1 unstable | Azure supports NAT-T | Enable NAT-T Omada |
| MTU black hole | TCP works partial | Azure MSS clamping | Lower TCP MSS on tunnel |

**Azure diagnostic logs:** VPN Gateway → Diagnostic settings → Log Analytics → query «IKE diagnostic log».

**Omada:** Gateway → VPN → connection log + enable debug briefly during maintenance window.

**Verification script from office:**
\\\`\\\`\\\`bash
ping 10.100.1.4
traceroute 10.100.1.4
curl -I http://10.100.1.4  # if web VM
\\\`\\\`\\\``,
    },
    {
      title: 'NetFlow/sFlow and traffic visibility limits',
      content: `**Omada ER7206/ER8411:** limited or no full NetFlow/sFlow export compared to Cisco — plan accordingly.

**Alternatives for «who uses bandwidth»:**
1. **Gateway Insight** in Controller — top clients, application categories (basic)
2. **SNMP interface counters** on WAN — Mbps trending in Grafana
3. **Mirror port** on core switch → ntopng (advanced)
4. **Syslog firewall** — connection metadata limited
5. **Open API** poll client list + byte counters periodic

**Zabbix trend WAN:** sufficient for capacity planning without full flow export.

**When upgrade path needed:** if application-level visibility mandatory — parallel appliance (NTOPNG box) or upgrade to NGFW with App Control (FortiGate) — understand Omada trade-off at purchase time.`,
    },
    {
      title: 'Open API monitoring integration',
      content: `**Poll Controller Open API for ops dashboard:**

\\\`\\\`\\\`bash
# Cron every 5 min — device offline count
TOKEN=$(curl -sk -X POST .../login ... | jq -r .token)
DEVICES=$(curl -sk .../sites/SITE_ID/devices -H "Authorization: AccessToken=$TOKEN")
OFFLINE=$(echo "$DEVICES" | jq '[.data[] | select(.status==0)] | length')
# Push to Prometheus pushgateway or Slack webhook if OFFLINE > 0
\\\`\\\`\\\`

**Metrics to automate:**
- Devices offline count by type (AP/switch/gateway)
- Total Wi‑Fi clients
- Controller disk usage (SSH to VM: df -h)
- Last backup age (file mtime on NAS)

**Alerting:** integrate with existing ops stack — don't build parallel alert system if Zabbix already exists.

**Security:** API creds read-only scope; cron runs from monitoring VLAN 99 host.`,
    },
    {
      title: 'On-call runbook templates',
      content: `**Template: WAN outage**
1. Confirm scope: external down detector + office report
2. Check ER7206 WAN LED + Insight WAN status
3. Ping ISP gateway from Omada diagnostics
4. If ISP issue: open ticket, enable LTE WAN2 failover
5. Notify users Slack/email ETA from ISP
6. Post-mortem if > 30 min business impact

**Template: Controller unreachable**
1. Ping controller IP 10.0.99.10
2. SSH VM: systemctl status tpeap
3. Restart service if hung: systemctl restart tpeap
4. If VM dead: failover to standby restore procedure (DR section)
5. Devices continue forwarding — Wi‑Fi works, no config changes until restored

**Template: VPN outage**
1. Check Gateway VPN status page
2. Test UDP 1194 external (nc -u from outside)
3. Review NPS if RADIUS auth
4. Rollback recent firewall rule if correlated change
5. Communicate workaround (temporary IPsec or split tunnel disable)

**Keep runbooks in Confluence one page each — link from Grafana alert annotations.**`,
    },
    {
      title: 'Escalation and support TP-Link',
      content: `**Before ticket collect:**
- Controller + gateway firmware versions
- Device model, serial, MAC
- Sanitized log export
- Network diagram
- Reproduction steps
- Firewall/VPN config summary (not secrets)

**Channels:** support.omadanetworks.com, community forum, distributor RMA.

**RMA:** hardware fail after power cycle + factory reset.

**Internal escalation:** outage > 1h → management + ISP parallel.

**Severity guide:** P1 all users down; P2 site partial; P3 single user VPN; P4 cosmetic.`,
    },
  ],
  practice: [
    'OpenVPN setup: pool 10.0.200.0/24, split tunnel, export .ovpn — connect with client',
    'RDP to workstation VLAN 20 via OpenVPN — verify firewall rule',
    'IPsec site-to-site Omada ↔ strongSwan Linux OR second Omada — ping tunnel',
    'IPsec to Azure VNet: document crypto match table Phase1/Phase2',
    'Create a firewall YAML export 13 rules — implement top 5 in lab gateway',
    'Port forward 443 → internal with source IP whitelist - test external',
    'Dual WAN failover test — measure time and packet loss',
    'SNMP v3 setup + snmpwalk 5 OIDs with gateway',
    'Syslog → Graylog/Loki — alert for VPN auth failure',
    'Grafana: dashboard 6 panels (WAN, CPU, VPN, devices, DHCP, denies)',
    'Backup controller + simulate restore on lab VM same IP',
    'Quarterly restore drill checklist — execute in lab',
    'WireGuard comparison doc: when NOT to use on Omada',
    'Maintenance calendar ICS or spreadsheet for 12 months',
    'Runbook «Total outage» — gateway + ISP + controller failure paths',
  ],
  resources: [
    { title: 'Omada VPN Configuration Guide', url: 'https://support.omadanetworks.com/us/document/108001/' },
    { title: 'Azure VPN Gateway IPsec settings', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-devices' },
    { title: 'ER7206 Datasheet', url: 'https://www.tp-link.com/us/business-networking/omada-router/er7206/' },
    { title: 'ER8411 Gateway', url: 'https://www.tp-link.com/us/business-networking/omada-router/er8411/' },
    { title: 'OpenVPN Connect Client', url: 'https://openvpn.net/client/' },
    { title: 'Grafana SNMP Dashboard Guide', url: 'https://grafana.com/docs/grafana/latest/datasources/snmp/' },
  ],
  quiz: [
    {
      question: 'OpenVPN on Omada Gateway for:',
      options: ['Remote employees', 'Prints only', 'AD schema only'],
      answer: 'Remote employees',
    },
    {
      question: 'Guest firewall policy:',
      options: ['Deny LAN, Allow WAN', 'Allow all', 'Deny WAN'],
      answer: 'Deny LAN, Allow WAN',
    },
    {
      question: 'Dual WAN failover is checked via:',
      options: ['Health check ping', 'Reboot only', 'GPO'],
      answer: 'Health check ping',
    },
    {
      question: 'PPTP VPN:',
      options: ['Do not use - unsafe', 'Recommended by Microsoft', 'Required for AD'],
      answer: 'Do not use - unsafe',
    },
    {
      question: 'Split tunnel VPN sends to the tunnel:',
      options: ['Corporate subnets only (configuration)', 'All traffic is always', 'Nothing'],
      answer: 'Corporate subnets only (configuration)',
    },
    {
      question: 'Upon death, the controller is restored from:',
      options: ['Backup + re-adopt', 'Factory reset AP only', 'Deleting a VLAN'],
      answer: 'Backup + re-adopt',
    },
    {
      question: 'Syslog from Omada Gateway is sent for:',
      options: ['Centralized log storage', 'Faster Wi-Fi', 'AD backup', 'Printing'],
      answer: 'Centralized log storage',
    },
    {
      question: 'SNMP on Omada is used for:',
      options: ['Monitoring in Zabbix/Prometheus/Grafana', 'DNS only', 'GPO only', 'Printing only'],
      answer: 'Monitoring in Zabbix/Prometheus/Grafana',
    },
    {
      question: 'After factory reset of an Omada device you need to:',
      answer: 'Perform adoption again and apply profiles from the controller',
    },
    {
      question: 'Load Balance on Dual WAN in Omada distributes:',
      options: ['Sessions across both links per policy', 'DNS only', 'AD replication only', 'Multicast only'],
      answer: 'Sessions across both links per policy',
      explanation: 'Failover and load balance are different modes; check health checks.',
    },
  ],
}

export default translation
