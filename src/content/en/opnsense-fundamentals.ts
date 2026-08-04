import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'OPNsense — platform fundamentals',
  duration: '8–10 hours',
  description:
    'OPNsense ecosystem, editions and releases, sizing, ISO/VM install (Proxmox, ESXi, Hyper-V), first-boot wizard, interfaces (WAN/LAN/OPT/VLAN/bridge/LAGG), static routes and gateways, Multi-WAN, DHCP/Unbound, administration (users/2FA/SSH), packages, updates, certificates, NTP, logs, REST API, config.xml backup, hardening, and connectivity troubleshooting',
  sections: [
    {
      title: 'OPNsense in the ecosystem: from pfSense to open-source NGFW',
      content: `**OPNsense** is an open-source network security platform based on FreeBSD and **pf** (packet filter). The project emerged in 2014 as a fork of pfSense after disputes around commercialization; today it is a full alternative to commercial NGFWs for SMB, MSP, and homelab.

**What OPNsense provides out of the box:**
- Stateful firewall with granular rules
- NAT (outbound, port forward, 1:1)
- Multi-WAN, failover, load balancing
- DHCP, DNS (Unbound), captive portal
- VPN: WireGuard, OpenVPN, IPsec
- Plugins: Suricata IDS/IPS, Zenarmor, HAProxy, ACME, Zabbix agent
- Web UI + SSH/CLI, REST API (partial)

**Comparison with pfSense:**

| Criterion | OPNsense | pfSense |
|----------|----------|---------|
| License | BSD, community-driven | pfSense CE / Plus (commercial branch) |
| UI/UX | Modern, modular | Classic, feature-rich |
| Updates | Regular, transparent roadmap | CE vs Plus — different feature sets |
| Plugins | os-* packages in repository | Packages + Plus-only features |
| API | Growing REST API | Limited in CE |

**Comparison with FortiGate (SMB context):**

| Criterion | OPNsense | FortiGate |
|----------|----------|-----------|
| Cost | No license for basic firewall | Hardware + FortiGuard subscriptions |
| UTM depth | Suricata/Zenarmor — good, not tier-1 | IPS/AV/App Control enterprise-grade |
| Security Fabric | No unified switch/AP ecosystem | FortiLink, FortiAP, FortiSwitch |
| Support | Community + commercial partners | FortiCare SLA |
| Throughput | Depends on CPU/VM, no ASIC offload | ASIC acceleration on FG models |

**When to choose OPNsense:**
- Full control needed, no vendor lock-in or subscriptions for basic firewall
- MSP with white-label CPE on VM or bare metal
- Lab, branch office, remote site with WireGuard
- Budget is limited but IDS, VPN, multi-WAN are required

**When FortiGate/pfSense Plus:**
- Enterprise support SLA and unified Wi-Fi/switch stack required
- SSL inspection at high throughput with hardware offload
- Compliance requires certified NGFW vendor

**OPNsense architectural principles:**
- **L3 routing first** — each logical interface = subnet gateway
- **Ingress firewall** — rules on inbound traffic per interface
- **Stateful pf** — return traffic via state table
- **config.xml** — single source of truth for backup/DR
- **Plugin model** — os-* packages without forking core

**Typical SMB IT roles:**

| Role | OPNsense tasks |
|------|----------------|
| Network admin | Interfaces, VLAN, routing, Multi-WAN |
| Security admin | Policies (Policies chapter), IDS, hardening |
| MSP NOC | Monitoring, backup, firmware cadence |
| DevOps | REST API, config.xml GitOps |

**Documentation:** docs.opnsense.org — primary reference; forum for edge cases; Deciso commercial support for SLA contracts.`,
    },
    {
      title: 'Installation: ISO, VM, and first boot',
      content: `**Deployment options:**

| Method | Scenario |
|-------|----------|
| **ISO on bare metal** | Physical appliance, whitebox 1U |
| **VMware / Proxmox / Hyper-V** | Central firewall in DC |
| **KVM / QEMU** | Lab, cloud edge |
| **AWS/Azure** (community images) | Cloud VPN hub |

**Minimum resources (lab / small office up to 30 users):**
- 2 vCPU, 2–4 GB RAM, 20 GB disk
- 2+ network interfaces (WAN + LAN) — critical for routing mode

**ISO installation process:**
1. Download ISO from [opnsense.org/download](https://opnsense.org/download/)
2. Create VM: UEFI or BIOS, VirtIO NIC (Proxmox) or e1000 (compatibility)
3. Boot ISO → **Install (UFS)** or ZFS for production
4. Assign interfaces: WAN, LAN, OPT (optional)
5. Set LAN IP (default often 192.168.1.1/24)
6. Open \`https://192.168.1.1\` → login \`root\` / password from install

**Typical Proxmox layout:**
\`\`\`
vmbr0 (WAN) ──► net0 OPNsense
vmbr1 (LAN) ──► net1 OPNsense
\`\`\`

**Post-install checklist:**
1. Change root password and create separate admin user (not root for UI)
2. **System → Settings → General:** hostname, timezone, language
3. **System → Firmware → Updates:** update to stable latest
4. Configure WAN (DHCP/static/PPPoE)
5. Verify internet from LAN: Diagnostics → Ping 1.1.1.1
6. Restrict GUI access: System → Access → Users → disable root UI login
7. Enable SSH only from Management subnet
8. Take first config.xml backup

**Factory / recovery:** console → option 8) Shell → \`opnsense-shell\` for menu. Full reset: reinstall or restore config.xml.

**UFS vs ZFS quick reference:**

| | UFS | ZFS |
|---|-----|-----|
| VM lab | ✅ Standard | Optional overhead |
| Bare metal single disk | OK | — |
| Bare metal production | OK | ✅ Mirror recommended |
| Boot environments | No | Yes snapshots |

**USB install:** \`dd if=OPNsense-*.iso of=/dev/sdX bs=4M status=progress\` — verify disk target twice.

**Post-install network order:** assign WAN first → set LAN IP → GUI from LAN → configure WAN DHCP/static → test ping upstream.

**Lab tip:** snapshot hypervisor VM immediately after install as \`clean-install\` before any policy changes.`,
      code: {
        language: 'shell',
        caption: 'OPNsense console: check interfaces and version',
        code: `# from SSH or shell
opnsense-version
ifconfig -a
netstat -rn

# ping with source interface (LAN)
ping -S 192.168.1.1 1.1.1.1`,
      },
    },
    {
      title: 'Editions, releases, and update model',
      content: `**OPNsense — one main edition:** community open-source. No «Plus» tier with closed core features (unlike pfSense). Commercial support through Deciso and partners.

**Release branches:**

| Branch | Purpose | Production? |
|-------|------------|-------------|
| **stable** | Current production release | ✅ Yes |
| **business** | Preview of next stable | ⚠️ Lab only |
| **devel** | Development snapshots | ❌ No |

**Version number:** \`YY.MM\` (e.g. 24.7). Major every ~6 months.

**Where to check:** opnsense.org/releases, System → Firmware → Status, \`opnsense-version\` on shell.

**Update model:**
1. Core firmware — System → Firmware → Updates
2. Plugins — separately after core
3. FreeBSD base — bundled in firmware

**SMB best practice:** monthly maintenance window, backup config.xml + VM snapshot pre-update, smoke test WAN/DNS/SSH after reboot.

**Downgrade:** not recommended — restore snapshot or reinstall + config restore.

**Long-term support:** each series ~12 months — plan upgrade before EOL.`,
      code: {
        language: 'shell',
        caption: 'Check version and plugins',
        code: `opnsense-version
pkg info opnsense
opnsense-update -c
pkg query '%n' | grep '^os-' | sort`,
      },
    },
    {
      title: 'Hardware sizing: bare metal and virtualization',
      content: `OPNsense has no ASIC offload — **CPU and NIC** determine throughput. Size by lab test and monitoring, not brochure numbers.

| Scenario | Users | vCPU | RAM | Disk |
|----------|-------|------|-----|------|
| Homelab | 1–5 | 2 | 2 GB | 20 GB |
| Small office | 10–30 | 2–4 | 4 GB | 32 GB |
| SMB 50 users | 30–60 | 4 | 8 GB | 64 GB |
| SMB + Suricata IPS | 50+ | 4–8 | 16 GB | 128 GB |

**Bare metal:** Intel/AMD with AES-NI; NIC Intel i210/igb; SSD; ZFS mirror for production.

**VM rule:** 4 vCPU / 8 GB for production SMB; monitor CPU during Suricata/VPN peaks.

**Concurrent sessions:** \`pfctl -s info\` — state table on 8 GB RAM typically 500K–2M states.

**Red flags:** CPU > 70% sustained, Suricata drops, VPN throughput < 50% expected.`,
      code: {
        language: 'shell',
        caption: 'Monitor load and state table',
        code: `top -b -n 1 | head -15
pfctl -s info
netstat -ibn`,
      },
    },
    {
      title: 'Installation on Proxmox VE',
      content: `**Proxmox** — popular homelab and MSP DC choice.

**VM:** 4 vCPU, 8 GB RAM, 32 GB VirtIO disk, UEFI q35, 2+ VirtIO NIC.

**Bridges:**
\`\`\`
vmbr0 (WAN) → net0
vmbr1 (LAN) → net1 trunk
vmbr2 (MGMT) → net2 optional
\`\`\`

Attach ISO → Install UFS → remove ISO. Snapshot before each update.

**Proxmox FW on WAN bridge:** often disable — OPNsense is the firewall.

**PCI passthrough:** dedicated Intel NIC if VirtIO insufficient — advanced.`,
      code: {
        language: 'shell',
        caption: 'Proxmox CLI: create VM (reference)',
        code: `qm create 200 --name opnsense-hq --memory 8192 --cores 4 \\
  --net0 virtio,bridge=vmbr0 --net1 virtio,bridge=vmbr1 \\
  --scsihw virtio-scsi-pci --scsi0 local-lvm:32 \\
  --ostype l26 --bios ovmf --machine q35`,
      },
    },
    {
      title: 'Installation on VMware ESXi / vSphere',
      content: `**ESXi deploy:** Other Linux 6.x 64-bit, 4 vCPU, 8 GB, 32 GB thin, **VMXNET3** NICs.

| vNIC | Port Group | Role |
|------|------------|------|
| vmnic0 | WAN-PG | ISP |
| vmnic1 | LAN-PG | Trunk VLANs |
| vmnic2 | MGMT-PG | Admin |

VMXNET3 not E1000. Promiscuous mode **not needed** for routing mode.

**vSphere HA:** CARP pair — anti-affinity rule, migrate one node at a time.

**Backup:** Veeam/snapshot + config.xml export.`,
    },
    {
      title: 'Installation on Microsoft Hyper-V',
      content: `**Gen2 VM**, 4–8 GB RAM, Synthetic NICs, **Secure Boot Off** (critical).

**Switches:** External (WAN), Internal (LAN), Private (lab).

Gen2 + Secure Boot disabled for FreeBSD ISO boot.

**Common issues:** won't boot ISO → disable Secure Boot; poor perf → add vCPU AES-NI.`,
    },
    {
      title: 'First boot wizard and console menu',
      content: `**Console menu** — out-of-band lifeline.

| Option | Action |
|--------|----------|
| 1 Assign interfaces | WAN/LAN/OPT |
| 2 Set interface IP | LAN IP |
| 8 Shell | root shell |
| 13 Restore config.xml | DR |

**GUI wizard:** language, hostname, WAN, LAN, password reminder.

\`opnsense-shell\` from shell returns to menu. Serial 115200 for IPMI.`,
    },
    {
      title: 'First boot and post-install checklist',
      content: `**SMB checklist:**
1. Root password 16+ chars
2. Hostname, timezone, NTP
3. Firmware update stable
4. WAN DHCP/static
5. Ping 1.1.1.1 Diagnostics
6. Admin user + 2FA, disable root GUI
7. SSH keys, Mgmt VLAN only
8. Backup config.xml
9. Anti-lockout: console open during LAN changes

Smoke: LAN client internet, DNS, NTP \`ntpq -p\`.`,
    },
    {
      title: 'VLAN: segmentation on trunk',
      content: `**VLAN create:** Other Types → VLAN → parent igb1 tag 10 → Assignments → Enable IP .1/24.

**Switch trunk:** allowed VLANs 10,20,60,99 must match.

| VLAN | Subnet | Use |
|------|--------|-----|
| 10 | 192.168.10.0/24 | Servers |
| 20 | 192.168.20.0/24 | Users |
| 60 | 192.168.60.0/24 | Guest |
| 99 | 192.168.99.0/24 | Mgmt |

Inter-VLAN routing on OPNsense — firewall rules per VLAN ingress (Policies chapter).`,
    },
    {
      title: 'Bridge and LAGG (802.3ad)',
      content: `**LAGG LACP** — dual uplink to switch, match port-channel both ends.

**Bridge** — transparent L2 (rare); routing+VLAN default for SMB.

LAGG: Interfaces → Other Types → LAGG → LACP members.

Mismatch \`laggproto\` → flapping links.`,
    },
    {
      title: 'Static routes and gateways',
      content: `**System → Routes → Configuration.** Default via WAN gateway.

**Use cases:** remote site 192.168.50.0/24 via 192.168.10.254; VPN routes; blackhole.

**Gateways:** System → Gateways — monitor IP 1.1.1.1 for health.

**Diagnostics:** Diagnostics → Routes, \`netstat -rn\`, traceroute with source IF.`,
      code: {
        language: 'shell',
        caption: 'CLI routing table',
        code: `netstat -rn
netstat -rn -f inet | grep '^default'
traceroute -s 192.168.20.1 8.8.8.8`,
      },
    },
    {
      title: 'Multi-WAN: failover and load balancing overview',
      content: `**Components:** WAN2 OPT, per-WAN gateways, gateway group failover/load balance, outbound NAT (NAT chapter).

**Failover:** Tier1 fiber + Tier2 LTE, monitor 1.1.1.1+8.8.8.8, unplug WAN1 test <30s.

**Not LAGG:** Multi-WAN = different ISP paths/IPs.

**VPN:** primary WAN endpoint; backup needs DDNS/second peer.

**CARP HA** — separate Operations chapter.

**Gateway group setup (overview):**
1. System → Gateways → Add WAN1, WAN2 with monitor IPs
2. Groups → Failover Tier1 WAN1, Tier2 WAN2
3. System → Routes → Default → select failover group
4. Test unplug WAN1 — verify default shifts < 30 sec
5. Document monthly failover test in runbook

**Load balance:** weights 50/50 only if policy allows asymmetric paths; failover safer for typical SMB.`,
    },
    {
      title: 'Administrators: users, roles, and 2FA',
      content: `**Users:** System → Access → Users. Groups admins vs read-only.

**2FA TOTP:** user token QR → Administration Backend Local+2FA.

**API keys** per automation script. RADIUS+privacyIDEA for enterprise MFA.

No shared \`admin\` account. Break-glass root password in vault.`,
    },
    {
      title: 'SSH, SCP, and console access',
      content: `**SSH:** key-only, PermitRootLogin no, listen Mgmt VLAN.

\`ssh-copy-id\` deploy key → disable password auth.

SCP backup: \`scp user@fw:/conf/config.xml ./backup-$(date +%F).xml\`

Bastion jump host — never SSH on WAN.`,
      code: {
        language: 'shell',
        caption: 'SSH key deploy and SCP backup',
        code: `ssh-copy-id -i ~/.ssh/id_ed25519.pub netadmin@192.168.99.1
ssh -o PasswordAuthentication=no netadmin@192.168.99.1 opnsense-version
scp netadmin@192.168.99.1:/conf/config.xml ./opnsense-backup-$(date +%Y%m%d).xml`,
      },
    },
    {
      title: 'Package overview (os-* plugins)',
      content: `**Install:** System → Firmware → Plugins.

| Plugin | Use |
|--------|-----|
| os-suricata | IDS/IPS |
| os-wireguard | VPN |
| os-acme-client | Let's Encrypt |
| os-zabbix-agent | Monitoring |
| os-haproxy | LB/reverse proxy |

Update plugins after core firmware. \`pluginctl -s suricata\` status.`,
    },
    {
      title: 'Firmware updates and plugin lifecycle',
      content: `**Workflow:** read release notes → backup + snapshot → update core → reboot → update plugins → smoke test.

Console: \`opnsense-update\` + reboot.

Rollback: VM snapshot fastest. No auto-update on production without staging.`,
    },
    {
      title: 'Certificates: introduction (CA, GUI, ACME)',
      content: `**System → Trust:** Internal CA → server cert → Administration SSL cert.

**ACME** os-acme-client: HTTP-01 or DNS-01 for \`vpn.office.com\`.

TLS 1.2+ only. Track expiry — Monit alert.`,
      code: {
        language: 'shell',
        caption: 'Check GUI certificate',
        code: `openssl s_client -connect 192.168.99.1:443 -servername opnsense.local </dev/null 2>/dev/null \\
  | openssl x509 -noout -subject -dates`,
      },
    },
    {
      title: 'NTP and system time',
      content: `**Critical for:** VPN IKE, TLS, TOTP 2FA, SIEM correlation.

System → Settings → General: timezone, \`pool.ntp.org\`.

Verify \`ntpq -p\` — synced peer marked with asterisk.

Wrong time → 2FA mysterious failures.`,
    },
    {
      title: 'Logging: basics and forwarding',
      content: `**Sources:** Firewall Live View, System log, DHCP, Unbound, Auth logins.

**Remote syslog** to Graylog/Wazuh. Log deny rules; careful logging all pass — disk fill.

CLI: \`clog -f /var/log/filter\`. SIEM retention 90d hot.`,
      code: {
        language: 'shell',
        caption: 'Firewall log and rule counters',
        code: `clog -f /var/log/filter | grep 192.168.20.50
pfctl -vvsr
pfctl -z`,
      },
    },
    {
      title: 'REST API: introduction and automation',
      content: `**Base:** \`https://fw/api/\` — API key auth Basic key:secret.

Read firmware status, download config, list interfaces — automation/GitOps.

Never commit secrets. Test lab before write API calls.

Docs: docs.opnsense.org/development/api.html`,
      code: {
        language: 'shell',
        caption: 'REST API curl examples',
        code: `OPNSENSE_HOST="192.168.99.1"
API_KEY="your-api-key"
API_SECRET="your-api-secret"
curl -sk -u "\${API_KEY}:\${API_SECRET}" \\
  "https://\${OPNSENSE_HOST}/api/core/firmware/status"
curl -sk -u "\${API_KEY}:\${API_SECRET}" \\
  -o config-backup.xml \\
  "https://\${OPNSENSE_HOST}/api/core/backup/download/backup" `,
      },
    },
    {
      title: 'Security hardening checklist',
      content: `**Access:** admin users, 2FA, SSH keys Mgmt only, HTTPS GUI Mgmt only.

**Network:** WAN default deny, inter-VLAN deny default, disable unused IF.

**Ops:** NTP, DNSSEC Unbound, daily encrypted backup, monthly updates, syslog SIEM.

**Advanced:** IDS after tune (Services chapter), VPN MFA (VPN chapter).`,
    },
    {
      title: 'Lab setup: homelab and MSP staging topology',
      content: `**Topology:** WAN sim ← OPNsense ← LAN trunk → VLAN VMs.

Proxmox vmbr0 NAT WAN sim best for homelab.

Document IP plan, snapshots \`clean-baseline\`, \`post-vlan\`.

MSP: clone prod config → sanitize → lab test → change window.`,
    },
    {
      title: 'Production case study 1: SOHO → OPNsense SMB migration',
      content: `**Client:** design studio 28 people, flat network, guest Wi-Fi reached file server.

**Solution:** OPNsense VM Proxmox, VLAN10/20/60/99, Unbound, WireGuard 8 users, Suricata IDS WAN, daily SFTP backup.

**Result:** guest isolated, zero license 3yr TCO vs FortiGate, Suricata caught C2 month 2.

**Lesson:** keep ISP router 1 week emergency bypass.`,
    },
    {
      title: 'Production case study 2: branch Multi-WAN + Zabbix',
      content: `**Client:** logistics branch 40 users, internet SLA critical.

**Solution:** bare metal whitebox, fiber+LTE failover, os-zabbix-agent → HQ NOC, SSH only via WireGuard.

Failover fiber unplug → LTE 18 sec. MSP manages 12 sites via API backup script.

**Trade-off:** engineer hours vs FortiGate license cost.`,
    },
    {
      title: 'FAQ: 14 common questions (Fundamentals)',
      content: `**1. OPNsense vs pfSense 2025?** UI/plugins preference; OPNsense BSD community, pfSense Plus commercial.

**2. License for production?** No for core firewall.

**3. RAM for 50 users?** 8 GB min, 16 GB with Suricata IPS.

**4. Wi-Fi controller?** No — use UniFi/Omada APs.

**5. DHCP OPNsense vs DC?** AD → DC DHCP often better.

**6. Update without downtime?** CARP HA; single node maintenance window.

**7. config.xml secrets?** Yes — encrypt backups.

**8. Root GUI?** Lab OK; production disable.

**9. No internet LAN?** Gateway, default route, NAT (NAT chapter), DNS vs \`ping 1.1.1.1\`.

**10. VirtIO Proxmox?** Best perf; em fallback.

**11. ZFS vs UFS?** ZFS mirror prod bare metal; UFS VM.

**12. API vs SSH backup?** Both OK scheduled.

**13. Downgrade firmware?** Snapshot restore preferred.

**14. IPv6 mandatory?** No for typical SMB IPv4-only.

**15. Where to learn after Fundamentals?** Policies (firewall/NAT), VPN, Services (Suricata), Operations (HA/CARP).

**16. GUI on WAN?** No for production — Mgmt VLAN + VPN jump only.

**17. Best hypervisor for lab?** Proxmox (vmbr NAT WAN) or VMware Workstation — fastest onboarding.

**18. config.xml in git?** Private repo + encryption; treat as secrets bundle.`,
    },
    {
      title: 'Interview Q&A: 10 questions (Fundamentals)',
      content: `**Q1:** OPNsense vs Linux iptables? Purpose-built FreeBSD pf + UI + config.xml.

**Q2:** Why pfSense fork? 2014 commercialization; Deciso BSD model.

**Q3:** Sizing? Throughput, Suricata, VPN, sessions — lab test 70% CPU rule.

**Q4:** config.xml? Single XML all settings backup/restore.

**Q5:** WAN vs LAN vs OPT? Naming; OPT=extra routed IF.

**Q6:** Limit admin? Mgmt VLAN listen, 2FA, SSH keys.

**Q7:** Multi-WAN failover? Gateway groups + monitor IPs.

**Q8:** Unbound vs ISP DNS? DNSSEC, overrides, DHCP register.

**Q9:** No internet first steps? Gateway status, default route, ping 1.1.1.1.

**Q10:** CARP when? Sub-minute HA two-node + pfsync.`,
    },
    {
      title: 'Lab: full initial setup from scratch',
      content: `**Goal:** VM + VLAN + DHCP + Unbound + hardening + backup.

1. VM 4vCPU/8GB/3NIC install UFS
2. Firmware update, hostname \`opnsense-lab01\`
3. VLAN10/20/60 on LAN parent
4. DHCP VLAN20/60, Unbound all VLANs
5. Admin \`netadmin\` + 2FA, SSH keys Mgmt
6. Baseline firewall (Policies chapter): Guest deny RFC1918
7. Tests: VLAN20 internet, VLAN60 no VLAN10, SSH WAN blocked
8. Backup config.xml, snapshot \`baseline-v1\`

**Acceptance table documented in lab journal.**`,
    },
    {
      title: 'Interfaces: WAN, LAN, OPT, and VLAN',
      content: `OPNsense operates as **L3 router + firewall**. Each logical interface participates in the routing table and firewall rule matching.

**Interface types:**

| Type | Examples | Purpose |
|-----|---------|------------|
| **Physical** | igb0, vtnet0 | WAN uplink, trunk to switch |
| **LAN** | lan | Internal network (assigned) |
| **OPT** | opt1, opt2 | DMZ, Guest, second WAN |
| **VLAN** | vlan0.10 | Segmentation on trunk |
| **Bridge** | bridge0 | L2 bridge (rare in routing mode) |
| **Tunnel** | wg0, ovpns1 | VPN endpoints |

**WAN configuration:**
- **Interfaces → Assignments:** assign physical port as WAN
- **Interfaces → [WAN]:** Enable, IPv4 DHCP/Static/PPPoE
- Block private networks on WAN — **enable** (do not accept 10.x from ISP)
- Block bogon networks — **enable**

**Typical SMB topology (50 users):**
\`\`\`
WAN (igb0)     → ISP DHCP / static
LAN (igb1)     → trunk to core switch
  VLAN10 Servers    192.168.10.1/24
  VLAN20 Users      192.168.20.1/24
  VLAN60 Guest      192.168.60.1/24
  VLAN99 Mgmt       192.168.99.1/24
OPT1 (igb2)    → DMZ (web server)
\`\`\`

**VLAN on OPNsense:**
1. Interfaces → Other Types → VLAN → Parent = LAN physical, tag 10
2. Interfaces → Assignments → Add vlan0.10 → Enable
3. Set IP, subnet — this is the gateway for the VLAN

**OPT vs LAN:** technically identical; difference is default firewall rules (LAN often has «allow all out» on fresh install). For Guest/DMZ create separate OPT/VLAN with deny inter-VLAN by default.

**IPv6:** supported (DHCPv6-PD, static). For SMB often IPv4-only; if PD from ISP — configure separate rules for v6.`,
    },
    {
      title: 'Firewall rules: order, states, and best practices',
      content: `**Firewall rules** — ingress matching on each interface, first match wins. Stateful pf creates state on Pass.

Key topics (full coverage — **OPNsense — firewall, NAT, and policies** chapter):
- Interface vs Floating rules
- Pass/Block/Reject, direction in
- Rule order, aliases, schedules
- Guest VLAN deny RFC1918 pattern
- Diagnostics: \`pfctl -vvsr\`, Live View log

**Here:** remember that without explicit rule traffic is blocked (implicit deny). After VLAN setup — rules on each segment ingress.`,
      code: {
        language: 'shell',
        caption: 'pfctl: view active rules and counters',
        code: `# all rules with numbers and hits
pfctl -vvsr

# rules for specific interface
pfctl -a 'lan' -vvsr

# state table (active sessions)
pfctl -s state | head -20

# rule statistics
pfctl -s info`,
      },
    },
    {
      title: 'NAT: outbound, port forwarding, and reflection',
      content: `**NAT** — Firewall → NAT. Outbound SNAT automatic for LAN; port forward requires associated filter rule.

Details on outbound/hybrid, 1:1, hairpin, Multi-WAN NAT — **firewall, NAT, and policies** chapter.

**Troubleshooting hint:** NAT works but timeout = missing WAN pass rule.`,
    },
    {
      title: 'Aliases, schedules, and policy organization',
      content: `**Aliases** — named Host/Network/Port/URL objects for rules. Schedules — time windows.

Full tiered access pattern, GeoIP, URL feeds — **firewall, NAT, and policies** chapter.

Naming: \`HOST_\`, \`NET_\`, \`PORT_\` prefixes for audit.`,
    },
    {
      title: 'DHCP and DNS (Unbound)',
      content: `**DHCP server:** Services → ISC DHCPv4 → LAN (or per-VLAN interface).

**Typical VLAN Users setup:**
- Enable DHCP on \`vlan0.20\`
- Range: 192.168.20.100 – 192.168.20.200
- Gateway: 192.168.20.1 (interface IP)
- DNS servers: 192.168.20.1 (Unbound on OPNsense) or internal DC
- Domain: office.local

**Static mappings:** MAC → fixed IP for printers, AP, servers.

**DHCP relay:** if DHCP on Windows DC — disable local DHCP on OPNsense, configure helper on switch or relay on DC subnet.

**Unbound DNS (Services → Unbound DNS):**
- Enable on LAN interfaces
- **Register DHCP leases** — local hostname resolution
- **DNS over TLS** upstream (optional privacy): Cloudflare, Quad9
- **Split horizon:** host overrides for internal names

\`\`\`
Host override:
  app.office.local → 192.168.10.50
  vpn.office.local → WAN public IP (for external users)
\`\`\`

**DNS security:**
- Block DNS over HTTPS bypass — firewall rule block known DoH providers (or client policy)
- DNS sinkhole via Unbound + blocklist plugin

**DNS troubleshooting:**
- Diagnostics → DNS Lookup
- \`unbound-control status\` on shell
- tcpdump port 53 on LAN

**AD integration:** DC as DNS for domain; OPNsense Unbound forwards office.local → DC IP, recursive for the rest.`,
    },
    {
      title: 'VPN: WireGuard and OpenVPN',
      content: `**VPN on OPNsense** — tunnel interfaces (wg0, ovpns1) + routes + firewall.

WireGuard road warrior, site-to-site, OpenVPN, IPsec, MFA, split tunnel — **OPNsense — VPN** chapter.

**Fundamentals scope:** ensure WAN UDP 51820 (WG) or 1194 (OVPN) allowed if VPN termination on OPNsense.`,
    },
    {
      title: 'IDS/IPS: Suricata package',
      content: `**Suricata** (\`os-suricata\`) — IDS/IPS plugin. Install via System → Firmware → Plugins.

IDS alert mode → tune → IPS. CPU hungry at >500 Mbps. Alternative: Zenarmor (L7).

Operational tuning and SOC workflow — **Services** and **Operations** chapters. Here: account for Suricata in sizing RAM/CPU.`,
    },
    {
      title: 'High availability: CARP overview',
      content: `**CARP + pfsync** — HA pair active/passive, shared VIP. Config sync XMLRPC master→backup.

Setup: Virtual IPs CARP, System → High Availability, firewall allow pfsync/CARP.

Full failover runbook, split-brain, cloud limitations — **Operations** chapter. Multi-WAN failover (without CARP) — earlier in this chapter.`,
    },
    {
      title: 'Backup, config.xml, and updates',
      content: `**OPNsense configuration** — single file **config.xml** (XML). All rules, NAT, VPN, users — inside.

**Backup methods:**

| Method | Path |
|-------|------|
| **GUI** | System → Configuration → Backups → Download |
| **Scheduled** | System → Configuration → Backups → Google Drive/SFTP |
| **CLI** | \`cp /conf/config.xml /root/backup-$(date +%F).xml\` |

**Restore:**
1. System → Configuration → Backups → Restore
2. Or boot console → import config
3. **Firmware version** must be compatible — restore to newer usually OK, downgrade risky

**Best practices:**
- Backup before **every** change (automated daily + pre-change manual)
- Store encrypted offsite (S3, git-crypt private repo — no plain secrets)
- Test restore quarterly on lab VM
- Document «baseline config» version tag

**Updates:**
- System → Firmware → Status — minor updates in-place
- Major version: read release notes, backup, update, verify
- Plugins update separately after core

**Revision history:** System → Configuration → History — rollback UI changes.

**Disaster recovery RTO:** from clean VM + config.xml restore — 15–30 min if procedure is practiced.`,
      code: {
        language: 'shell',
        caption: 'CLI: backup and diff config.xml',
        code: `# backup
cp /conf/config.xml /root/config-backup-$(date +%Y%m%d).xml

# validate XML
xmllint --noout /conf/config.xml

# compare with previous backup (on admin workstation)
diff -u config-old.xml config-new.xml | less`,
      },
    },
    {
      title: 'Troubleshooting and security hardening',
      content: `**Diagnostic workflow:**

1. **Reproduce** — one client, one destination
2. **Check interface** — link up? correct IP?
3. **Routing** — Diagnostics → Routes, traceroute
4. **Firewall** — temporary log on suspected rule
5. **NAT** — states show translation?
6. **Packet capture** — Diagnostics → Packet Capture or tcpdump

**Useful commands:**

| Command | Purpose |
|---------|------------|
| \`pfctl -vvsr\` | Rules with counters |
| \`pfctl -s state\` | Active sessions |
| \`tcpdump -ni lan host X and port Y\` | Live capture |
| \`clog -f /var/log/filter\` | Firewall log tail |
| \`arp -a\` | ARP table |

**Packet capture GUI:** Diagnostics → Packet Capture — select interface, filter \`host 192.168.10.50 and port 443\`.

**Common issues:**

| Symptom | Cause | Fix |
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

**Ops burden vs FortiGate:** OPNsense cheaper in license, but requires more self-managed tuning (Suricata FP, rule hygiene). FortiGate — less DIY, higher TCO.`,
      code: {
        language: 'shell',
        caption: 'tcpdump and firewall log on shell',
        code: `# capture 100 packets on LAN, write to file
tcpdump -ni vlan0.20 -c 100 -w /tmp/lan-capture.pcap host 192.168.20.50

# live firewall log
clog -f /var/log/filter | grep 192.168.20.50

# reset rule statistics (careful in production)
pfctl -z`,
      },
    },
    {
      title: 'Troubleshooting connectivity: step-by-step workflow',
      content: `**«No connectivity» workflow** — systematic isolation DNS vs routing vs firewall.

**Step 1 — Scope:** one client or all? one destination or all internet?

**Step 2 — L1/L2:** link up? correct VLAN on switch port? \`ifconfig\` errors/drops?

**Step 3 — L3 client:** gateway = OPNsense interface IP? DHCP option correct?

**Step 4 — Routing:** Diagnostics → Routes; default route via WAN? \`netstat -rn\`

**Step 5 — Gateway health:** System → Gateways → Status — WAN monitor green?

**Step 6 — DNS isolate:** \`ping 1.1.1.1\` OK but name fails → Unbound listen interfaces, \`drill @192.168.20.1 host\`

**Step 7 — Firewall:** Live View + temporary log on suspected deny rule

**Step 8 — NAT:** outbound issue → NAT chapter; states show translation?

**Step 9 — Capture:** Diagnostics Packet Capture or \`tcpdump -ni vlan0.20 host X\`

**Typical matrix:**

| Symptom | Layer | First check |
|---------|-------|-------------|
| No internet all LAN | WAN | Gateway status |
| One VLAN only | VLAN IF | Interface enabled + IP |
| DNS only broken | DNS | Unbound listen |
| Inter-VLAN | Firewall | Rule on source VLAN in |
| Intermittent | WAN/LTE | Monitor IP reachability |
| SSH/GUI timeout | Mgmt rule | Firewall allow Mgmt |

**Escalation pack for forum:** \`opnsense-version\`, rule counters, capture, steps to reproduce — no secrets from config.xml.`,
    },
    {
      title: 'DHCP server: advanced SMB configuration',
      content: `**Services → ISC DHCPv4** per interface — do not enable on WAN.

**Pool design VLAN20 Users:**
- Range 192.168.20.100–200 (100 leases)
- Gateway 192.168.20.1
- DNS 192.168.20.1 (Unbound) or DC
- Domain office.local
- Lease 86400 sec

**Static mappings:** printers, AP, cameras — document MAC in IP plan spreadsheet.

**Custom options:** VoIP option 66/150; PXE 66/67 — advanced integrations.

**DHCP relay path:** DC holds DHCP → disable OPNsense DHCP on subnet → Services DHCP Relay → upstream DC IP OR switch ip helper-address.

**Failover:** CARP shared IP + DHCP failover advanced — Operations chapter.

**Troubleshooting:**
- No OFFER: firewall UDP 67/68 blocked on interface
- Wrong gateway: pool misconfiguration
- Duplicate IP: static mapping conflict with dynamic pool
- \`tcpdump -ni vlan0.20 port 67 or port 68\`

**IPv6:** Router Advertisements + DHCPv6 separate menu — plan if ISP PD.`,
    },
    {
      title: 'Unbound DNS: resolver, forwarders, and split horizon',
      content: `**Services → Unbound DNS → General:** enable, listen LAN+VLAN interfaces only.

**Register DHCP leases** — automatic local hostnames for clients.

**Mode selection:**

| Mode | When |
|------|------|
| Root recursion | Default, no ISP DNS dependency |
| Forward all | Upstream 1.1.1.1 / 8.8.8.8 |
| Split forward | AD domain → DC; rest recursive |

**Host overrides:**
\`\`\`
app.office.local → 192.168.10.50
vpn.office.com → public WAN IP
\`\`\`

**DNS over TLS:** optional upstream privacy to Cloudflare/Quad9.

**DNSSEC validation:** enable — validates chain of trust.

**AD integration:** domain override office.local → forward to DC IP; clients use OPNsense or DC as DNS per design.

**Security:** block client DoH to known providers if policy requires; sinkhole via blocklist plugin.

**Debug:** Diagnostics DNS Lookup; \`unbound-control status\`; \`tcpdump -ni lan port 53\``,
    },
    {
      title: 'config.xml: structure, secrets, and DR',
      content: `**Single XML** — interfaces, routes, users, rules, VPN keys, API secrets.

**Locations:** \`/conf/config.xml\` live; download via GUI/API/SCP.

**Restore paths:**
1. System → Configuration → Backups → Restore
2. Console option 13
3. Clean install + restore (DR VM)

**Version rules:** restore same or newer firmware usually OK; downgrade risky.

**Revision history:** System → Configuration → History — UI diff rollback.

**Secrets handling:** treat backup as credential-equivalent — GPG encrypt offsite:
\`\`\`
tar czf - /conf/config.xml | gpg -c > backup.tar.gz.gpg
\`\`\`

**GitOps caution:** private repo + git-crypt; never public commit.

**Quarterly DR test:** lab VM restore timed — target RTO 30 min documented.

**Change management:** pre-change backup filename includes ticket ID \`config-CHG-1234.xml\`.`,
    },
    {
      title: 'Console menu and out-of-band access reference',
      content: `**Console menu options (reference):**

| # | Function | When to use |
|---|----------|-------------|
| 1 | Assign interfaces | Initial / hardware change |
| 2 | Set interface IP | Locked out GUI wrong LAN IP |
| 3 | Reset root password | Emergency lockout |
| 4 | Factory reset | ⚠️ Total config wipe |
| 7 | Ping | Test WAN without GUI |
| 8 | Shell | Advanced debug |
| 9 | pfTop | Live state table |
| 10 | Firewall log | Quick block visibility |
| 11 | Reload services | Apply without reboot |
| 12 | Firmware update | No GUI access |
| 13 | Restore config.xml | DR |

**Out-of-band paths:** hypervisor console, IPMI/iLO serial, physical KVM.

**opnsense-shell** from shell returns to menu.

**Serial:** \`/boot/loader.conf\` console speed 115200 for datacenter appliances.

**Break-glass:** documented root password in vault; test quarterly.`,
    },
    {
      title: 'IPv6 on OPNsense: SMB overview',
      content: `**IPv6 support:** DHCPv6-PD from ISP, static, track interface.

**When to enable:** ISP provides PD; compliance; dual-stack apps.

**When skip:** IPv4-only SMB — majority 2026; enable later without redesign if VLAN/IP plan clean.

**Firewall:** separate IPv6 rule tab — don't assume v4 rules cover v6.

**Unbound:** v6 listening if clients query AAAA.

**Common issues:** ISP PD not propagated; missing v6 default route; v6 rules default deny.

**Lab:** enable v6 on WAN PD sim if learning; production plan addressing scheme first.`,
    },
    {
      title: 'MSP model: central management without FortiManager',
      content: `**MSP managing 10+ OPNsense:**

| Function | Tool |
|----------|------|
| Monitoring | Zabbix / Prometheus node_exporter |
| Backup | Scheduled API/SCP script per site |
| Config drift | diff config.xml weekly |
| Updates | staged: lab → pilot site → fleet |
| Access | WireGuard hub → SSH Mgmt VLAN |

**No single-vendor orchestrator** — scripts + SIEM + ticketing integration.

**Per-customer:** separate config.xml backup encrypted; API keys per tenant.

**Documentation:** standard IP plan template VLAN10/20/60/99.

**Onboarding runbook:** ISO deploy checklist + import baseline policies (Policies chapter).`,
    },
    {
      title: 'Sizing walkthrough: 50-user office example',
      content: `**Input:** 50 users, 500 Mbps fiber WAN, Suricata IDS WAN only, 20 WireGuard users, no SSL inspection.

**Step 1 — Sessions:** 50 × 50 = 2500 concurrent sessions peak estimate.

**Step 2 — CPU:** IDS adds ~30% CPU at 500 Mbps — plan 4 vCPU minimum.

**Step 3 — RAM:** 8 GB base + IDS buffer → 8–16 GB.

**Step 4 — Disk:** 64 GB SSD; logs local 30d + remote syslog.

**Step 5 — NIC:** 2× GE sufficient; 10GE if internal trunk >1 Gbps aggregate.

**Step 6 — Validate:** lab traffic generator or peak hour \`top\` + \`pfctl -s info\`.

**Rule 70%:** sustained CPU under 70% at peak — if higher, upgrade vCPU/RAM or reduce IDS scope.

**Document:** sizing memo in change folder for future audits.`,
    },
    {
      title: 'pfSense → OPNsense migration: overview',
      content: `**Possible** via config import with limitations — not 1:1 plugins.

**Process:**
1. Export pfSense config.xml
2. OPNsense import tool / manual migration (check release notes)
3. Verify interfaces mapping (NIC order may differ)
4. Reinstall plugins os-* equivalents
5. Parallel run cutover weekend

**Watch:** NAT rule format, OpenVPN cert paths, Suricata rule paths differ.

**Rollback:** keep pfSense VM snapshot until 1 week stable.

**FortiGate migration:** no auto-import — manual policy rewrite 2–4 weeks office 50 users.`,
    },
    {
      title: 'Fundamentals glossary (quick reference)',
      content: `| Term | Meaning |
|------|---------|
| **pf** | FreeBSD packet filter engine |
| **OPT** | Additional routed interface |
| **config.xml** | Single configuration file |
| **Unbound** | Validating DNS resolver |
| **CARP** | HA virtual IP failover |
| **pfsync** | State table sync between HA nodes |
| os-* packages | OPNsense plugin package prefix |
| **Gateway group** | Failover/load balance WAN paths |
| **Alias** | Named object group for rules |
| **Ingress rule** | Firewall rule on traffic entering interface |
| **Implicit deny** | Unmatched traffic blocked |
| **Bogon** | Invalid/unallocated IP space |
| **Split DNS** | Different answers inside vs outside |
| **2FA TOTP** | Time-based one-time password |
| **REST API** | HTTP API for automation |
| **VirtIO** | Paravirtual NIC for VMs |
| **LAGG** | FreeBSD link aggregation |
| **PD** | IPv6 prefix delegation from ISP |

**Tip:** keep this glossary handy when reading Policies, VPN, and Operations chapters — shared vocabulary speeds onboarding for new engineers.`,
    },
  ],
  practice: [
    'Deploy OPNsense in Proxmox/VMware/Hyper-V: 2–3 NIC, ISO install, hostname opnsense-lab01',
    'Post-install: firmware, NTP, admin+2FA, disable root GUI, backup config.xml',
    'VLAN10/20/60 on LAN trunk with IP .1 on each',
    'Static route 192.168.50.0/24 — verify netstat -rn',
    'DHCP VLAN20 + Unbound host override lab.local',
    'SSH ed25519 key, password auth off, Mgmt VLAN only',
    'Install os-wireguard + os-acme-client (or os-zabbix-agent)',
    'REST API curl firmware status + config download (no secrets in git)',
    'Troubleshoot injected no-internet fault',
    'Snapshot baseline; restore config.xml rollback test',
  ],
  resources: [
    { title: 'OPNsense Official Documentation', url: 'https://docs.opnsense.org/' },
    { title: 'OPNsense Download', url: 'https://opnsense.org/download/' },
    { title: 'OPNsense Forum', url: 'https://forum.opnsense.org/' },
    { title: 'WireGuard on OPNsense (docs)', url: 'https://docs.opnsense.org/manual/how-tos/wireguard-client.html' },
    { title: 'Suricata plugin guide', url: 'https://docs.opnsense.org/manual/ips.html' },
    { title: 'Hardening OPNsense', url: 'https://docs.opnsense.org/manual/hardening.html' },
    { title: 'OPNsense Virtualization Guide', url: 'https://docs.opnsense.org/manual/virtuals.html' },
    { title: 'OPNsense REST API Documentation', url: 'https://docs.opnsense.org/development/api.html' },
    { title: 'OPNsense Release Notes', url: 'https://opnsense.org/releases/' },
  ],
  quiz: [
    {
      question: 'OPNsense is based on:',
      options: ['FreeBSD and pf', 'Linux and iptables only', 'Windows Server', 'macOS'],
      answer: 'FreeBSD and pf',
    },
    {
      question: 'Firewall rules in OPNsense are processed:',
      options: [
        'Top to bottom, first match wins',
        'Bottom to top only',
        'Random order',
        'Only on WAN interface',
      ],
      answer: 'Top to bottom, first match wins',
    },
    {
      question: 'Port forward connection timeout with NAT working usually means:',
      options: [
        'Missing associated WAN firewall pass rule',
        'DHCP pool exhausted',
        'DNSSEC failure',
        'CARP split-brain',
      ],
      answer: 'Missing associated WAN firewall pass rule',
      explanation: 'DNAT alone is not enough — inbound traffic must be allowed on WAN.',
    },
    {
      question: 'Default outbound NAT mode for typical SMB LAN is:',
      options: ['Automatic', 'Disabled', 'Manual only', 'Bridge mode'],
      answer: 'Automatic',
    },
    {
      question: 'WireGuard default listen port on OPNsense is commonly:',
      options: ['51820', '443', '22', '161'],
      answer: '51820',
    },
    {
      question: 'Suricata os-suricata plugin provides:',
      options: ['IDS/IPS signature detection', 'DHCP server only', 'Wi-Fi controller', 'Email relay'],
      answer: 'IDS/IPS signature detection',
    },
    {
      question: 'CARP in OPNsense is used for:',
      options: [
        'High availability with shared virtual IPs',
        'DNS caching',
        'LDAP authentication',
        'PoE budgeting',
      ],
      answer: 'High availability with shared virtual IPs',
    },
    {
      question: 'OPNsense stores full configuration in:',
      options: ['config.xml', 'registry.db', 'etcd', 'active-directory GPO'],
      answer: 'config.xml',
    },
    {
      question: 'CLI command to list active firewall states:',
      answer: 'pfctl -s state',
      explanation: 'Use pfctl -vvsr for rules with hit counters; clog for live filter log.',
    },
    {
      question: 'Guest VLAN best practice on OPNsense:',
      options: [
        'Block RFC1918 destinations, allow internet only',
        'Allow all internal subnets',
        'Disable firewall on Guest',
        'Use WAN as Guest gateway',
      ],
      answer: 'Block RFC1918 destinations, allow internet only',
      explanation: 'Prevents guest clients from reaching internal servers and other VLANs.',
    },
  ],
}

export default translation
