import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'OPNsense — open-source firewall',
  duration: '5–6 hours',
  description:
    'Installation, interfaces, firewall rules, NAT, aliases, VPN (WireGuard/OpenVPN), packages (Suricata), backups, operations, and comparison with FortiGate/pfSense',
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
- Compliance requires certified NGFW vendor`,
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
6. Open \\\`https://192.168.1.1\\\` → login \\\`root\\\` / password from install

**Typical Proxmox layout:**
\\\`\\\`\\\`
vmbr0 (WAN) ──► net0 OPNsense
vmbr1 (LAN) ──► net1 OPNsense
\\\`\\\`\\\`

**Post-install checklist:**
1. Change root password and create separate admin user (not root for UI)
2. **System → Settings → General:** hostname, timezone, language
3. **System → Firmware → Updates:** update to stable latest
4. Configure WAN (DHCP/static/PPPoE)
5. Verify internet from LAN: Diagnostics → Ping 1.1.1.1
6. Restrict GUI access: System → Access → Users → disable root UI login
7. Enable SSH only from Management subnet
8. Take first config.xml backup

**Factory / recovery:** console → option 8) Shell → \\\`opnsense-shell\\\` for menu. Full reset: reinstall or restore config.xml.`,
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
\\\`\\\`\\\`
WAN (igb0)     → ISP DHCP / static
LAN (igb1)     → trunk to core switch
  VLAN10 Servers    192.168.10.1/24
  VLAN20 Users      192.168.20.1/24
  VLAN60 Guest      192.168.60.1/24
  VLAN99 Mgmt       192.168.99.1/24
OPT1 (igb2)    → DMZ (web server)
\\\`\\\`\\\`

**VLAN on OPNsense:**
1. Interfaces → Other Types → VLAN → Parent = LAN physical, tag 10
2. Interfaces → Assignments → Add vlan0.10 → Enable
3. Set IP, subnet — this is the gateway for the VLAN

**OPT vs LAN:** technically identical; difference is default firewall rules (LAN often has «allow all out» on fresh install). For Guest/DMZ create separate OPT/VLAN with deny inter-VLAN by default.

**IPv6:** supported (DHCPv6-PD, static). For SMB often IPv4-only; if PD from ISP — configure separate rules for v6.`,
    },
    {
      title: 'Firewall rules: order, states, and best practices',
      content: `OPNsense uses **pf** — rules are processed **top to bottom, first match wins**. Implicit deny on everything not explicitly allowed (unlike legacy «allow all LAN» on some consumer routers).

**Rule structure:**

| Field | Description |
|------|----------|
| **Action** | Pass, Block, Reject |
| **Interface** | WAN, LAN, VLAN10 — rule applies on ingress of this interface |
| **Direction** | in (typical) — traffic entering the interface |
| **Protocol** | TCP/UDP/ICMP/any |
| **Source/Destination** | IP, subnet, alias |
| **Port** | Service or custom |
| **Log** | Enable for audit and troubleshooting |

**Critical: understand direction:**
- Rule on **LAN** with source LAN net → internet: catches traffic **from clients** entering the LAN interface
- Rule on **WAN** for port forward: destination WAN address, port 443

**Quick rules after install (production):**
1. Remove or restrict default «LAN → any» if segmentation is needed
2. Guest VLAN: block to RFC1918, allow WAN only
3. Management VLAN: allow HTTPS/SSH only from admin workstations alias
4. WAN: no allow inbound except explicit port forwards / VPN

**Stateful firewall:** Pass creates state — return traffic is automatically allowed. Block/Reject do not create state.

**Floating rules:** apply to all or selected interfaces — use for global block or emergency deny.

**Order optimization:**
1. Most specific rules at top
2. Alias-based rules for readability
3. Log only on deny rules (or temporarily for debug) — otherwise disk fill

**Anti-patterns:**
- Duplicate rules «just in case»
- Any/any on WAN «for testing» — forgotten and left open
- Rule on wrong interface (common port forward troubleshooting mistake)`,
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
      content: `**NAT in OPNsense** — section **Firewall → NAT**.

**Outbound NAT (SNAT):**
- Default: **Automatic** — LAN/VLAN subnets exit to internet via WAN IP
- **Hybrid:** manual rules + automatic for the rest
- **Manual:** full control (multi-WAN, policy NAT)

Typical SMB: Automatic is enough. Multi-WAN failover: hybrid with rule per WAN.

**Port Forward (DNAT / Inbound):**
1. Firewall → NAT → Port Forward → Add
2. Interface: WAN
3. Destination: WAN address
4. Destination port: 443 (or custom)
5. Redirect target IP: internal server 192.168.10.50
6. Redirect target port: 443
7. **Filter rule association:** Add associated filter rule — auto-creates WAN pass rule

**Without associated rule** packet arrives on WAN, NAT applies, but firewall blocks — typical «NAT works but connection timeout».

**1:1 NAT:** mapping external IP ↔ internal (DMZ host).

**NAT reflection (hairpin):** access internal service via public DNS from LAN — enable only if needed; alternative is split DNS on Unbound.

**Multi-WAN NAT:**
- Each WAN can have its own outbound rule
- Failover: Monitor IPs on WAN gateways (System → Gateways → Status)

**Verification:**
- Diagnostics → States — see NAT translation
- tcpdump on WAN and LAN simultaneously`,
    },
    {
      title: 'Aliases, schedules, and policy organization',
      content: `**Aliases** — named groups of objects for rules and NAT. Simplify audit and change management.

**Alias types:**

| Type | Example |
|-----|--------|
| **Host(s)** | srv-dc01 → 192.168.10.10 |
| **Network(s)** | RFC1918 → 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 |
| **Port(s)** | WEB → 80, 443 |
| **URL** | External feed (updated by cron) |
| **GeoIP** | os-geoip plugin |

**Creation:** Firewall → Aliases → Add. Use in rules: Source → Single host or alias → select alias.

**Schedules (Firewall → Schedules):**
- Time windows for rules (business hours, maintenance window)
- Rule → Advanced → Schedule → select schedule
- Example: deny social media ports in business hours only

**«Tiered access» pattern:**
\\\`\\\`\\\`
Alias ADMINS     → 192.168.99.10-20
Alias SERVERS    → 192.168.10.0/24
Alias GUEST_NET  → 192.168.60.0/24

Rule: GUEST_NET → SERVERS : Block (log)
Rule: ADMINS → any : Pass
\\\`\\\`\\\`

**URL alias / external feeds:** for malware domain blocklists — cron updates. Watch size — large lists slow rule evaluation.

**Naming convention:** prefixes \\\`HOST_\\\`, \\\`NET_\\\`, \\\`PORT_\\\` — easier search with 50+ aliases.

**Export/import:** aliases live in config.xml — backup critical before bulk edit.`,
    },
    {
      title: 'DHCP and DNS (Unbound)',
      content: `**DHCP server:** Services → ISC DHCPv4 → LAN (or per-VLAN interface).

**Typical VLAN Users setup:**
- Enable DHCP on \\\`vlan0.20\\\`
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

\\\`\\\`\\\`
Host override:
  app.office.local → 192.168.10.50
  vpn.office.local → WAN public IP (for external users)
\\\`\\\`\\\`

**DNS security:**
- Block DNS over HTTPS bypass — firewall rule block known DoH providers (or client policy)
- DNS sinkhole via Unbound + blocklist plugin

**DNS troubleshooting:**
- Diagnostics → DNS Lookup
- \\\`unbound-control status\\\` on shell
- tcpdump port 53 on LAN

**AD integration:** DC as DNS for domain; OPNsense Unbound forwards office.local → DC IP, recursive for the rest.`,
    },
    {
      title: 'VPN: WireGuard and OpenVPN',
      content: `**WireGuard** — preferred VPN for remote access and site-to-site in 2024+ (simplicity, performance, modern crypto).

**Remote access (road warrior) on OPNsense:**

1. **VPN → WireGuard → Local** → Add instance (wg0)
2. Listen port: 51820
3. Tunnel address: 10.255.0.1/24 (VPN subnet)
4. **Peers → Add:** client public key, client allowed IPs
5. **Endpoints → Add:** peer per user/device
6. Firewall → WireGuard: Pass from WireGuard net → LAN net (or specific)
7. Outbound NAT: automatic usually covers WG subnet

**Site-to-site WireGuard:** peer with remote public IP, allowed IPs = remote LAN subnet. Mirror config on both ends.

**OpenVPN** (legacy, but needed for some clients):
- VPN → OpenVPN → Servers — road warrior or site-to-site
- Certificates: System → Trust → CA → Server cert → User certs
- Client: exported .ovpn profile
- Performance lower than WireGuard on same CPU

**SMB comparison:**

| | WireGuard | OpenVPN |
|---|-----------|---------|
| Setup | Minimal | CA, certs, more options |
| Mobile | Official apps | OpenVPN Connect |
| Firewall | UDP 51820 | UDP 1194 default |
| Throughput | High | Medium |

**Security:**
- MFA not built into WG — combine with RADIUS + 2FA or per-device keys
- Least privilege: Allowed IPs only for needed subnets
- Disable full tunnel if not needed: split tunnel via Allowed IPs`,
      code: {
        language: 'text',
        caption: 'Example WireGuard peer config (client)',
        code: `[Interface]
PrivateKey = <client-private-key>
Address = 10.255.0.2/32
DNS = 192.168.20.1

[Peer]
PublicKey = <opnsense-public-key>
Endpoint = vpn.office.local:51820
AllowedIPs = 192.168.20.0/24, 192.168.10.0/24
PersistentKeepalive = 25`,
      },
    },
    {
      title: 'IDS/IPS: Suricata package',
      content: `**Suricata** — IDS/IPS plugin (\\\`os-suricata\\\`) for signature-based threat detection on WAN/LAN.

**Installation:**
1. System → Firmware → Plugins → Install **os-suricata**
2. Services → Intrusion Detection → Administration → Enable
3. Select interfaces for inspection (WAN for inbound threats, LAN for east-west)
4. Download rulesets: ET Open (free), Snort registered, or commercial

**Modes:**

| Mode | Action |
|------|----------|
| **IDS** | Detect + alert (does not block) |
| **IPS** | Inline block matching signatures |
| **IPS with drop** | Active rejection |

**Production SMB recommendation:**
- Start with **IDS on WAN** — alerts only, tune 2 weeks
- Whitelist false positives (Services → Suricata → Alerts → toggle)
- Enable IPS on WAN after tuning
- Monitor CPU — Suricata is hungry above ~500 Mbps

**Rule categories:** disable noisy categories (POLICY, P2P) if not needed.

**Logs:** Services → Suricata → Alerts; forward to remote syslog/SIEM.

**Limits vs FortiGate IPS:**
- Suricata — excellent open signatures, manual tuning
- FortiGuard IPS — auto-updates, lower admin overhead, hardware accel
- OPNsense does not replace enterprise SOC workflow without external SIEM

**Alternative:** **Zenarmor** (formerly Sensei) — L7 filtering plugin, different licensing model.`,
    },
    {
      title: 'High availability: CARP overview',
      content: `**CARP (Common Address Redundancy Protocol)** — FreeBSD equivalent of VRRP for OPNsense HA pair.

**Topology:**
\\\`\\\`\\\`
        ISP
          │
    ┌─────┴─────┐
  FW1 (MASTER) FW2 (BACKUP)
    └─────┬─────┘
       LAN switch
\\\`\\\`\\\`

**Components:**
- **CARP VIP** — shared virtual IP on LAN/WAN (clients use VIP as gateway)
- **pfsync** — state table sync between nodes
- **config sync** — XMLRPC sync of configuration (master → backup)

**Requirements:**
- 3+ interfaces per node (WAN, LAN, sync optional on dedicated link)
- Same/similar hardware performance
- Unique real IPs per node + shared VIPs
- **Advskew** — determines master (lower = master)

**Setup (overview):**
1. Interfaces → Virtual IPs → Add CARP VIP on LAN and WAN
2. System → High Availability → Enable pfsync + config sync peer IP
3. Firewall rules allow CARP/pfsync between nodes
4. Test failover: shutdown master → backup takes VIP < 3 sec

**Limitations:**
- 2 nodes active/passive (not active-active for classic CARP)
- Stateful failover requires pfsync — sessions survive
- **Split-brain** risk if sync link down — document procedure
- Cloud HA harder (no CARP on some hypervisors MAC — check virtio)

**Alternatives:** external load balancer, BGP with two public IPs, or cold standby with manual DNS failover — for cloud-only deployments.`,
    },
    {
      title: 'Backup, config.xml, and updates',
      content: `**OPNsense configuration** — single file **config.xml** (XML). All rules, NAT, VPN, users — inside.

**Backup methods:**

| Method | Path |
|-------|------|
| **GUI** | System → Configuration → Backups → Download |
| **Scheduled** | System → Configuration → Backups → Google Drive/SFTP |
| **CLI** | \\\`cp /conf/config.xml /root/backup-$(date +%F).xml\\\` |

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
| \\\`pfctl -vvsr\\\` | Rules with counters |
| \\\`pfctl -s state\\\` | Active sessions |
| \\\`tcpdump -ni lan host X and port Y\\\` | Live capture |
| \\\`clog -f /var/log/filter\\\` | Firewall log tail |
| \\\`arp -a\\\` | ARP table |

**Packet capture GUI:** Diagnostics → Packet Capture — select interface, filter \\\`host 192.168.10.50 and port 443\\\`.

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
  ],
  practice: [
    'Deploy OPNsense in Proxmox/VMware: 2 NICs (WAN+LAN), install from ISO, set hostname opnsense-lab01',
    'Configure WAN DHCP and LAN 192.168.1.1/24; verify ping 1.1.1.1 from Diagnostics and from LAN client',
    'Create VLAN20 (Users) and VLAN60 (Guest) on trunk; firewall: Guest block RFC1918, allow WAN',
    'Set up port forward WAN:443 → internal web server; test from external and fix missing rule if needed',
    'Create aliases NET_SERVERS, PORT_WEB, ADMINS; rewrite 3 rules using aliases',
    'Set up WireGuard road warrior: peer for laptop, verify access to LAN subnet',
    'Install os-suricata, enable IDS on WAN, generate test alert and find it in Suricata logs',
    'Backup config.xml, change hostname, restore backup and confirm hostname rolled back',
  ],
  resources: [
    { title: 'OPNsense Official Documentation', url: 'https://docs.opnsense.org/' },
    { title: 'OPNsense Download', url: 'https://opnsense.org/download/' },
    { title: 'OPNsense Forum', url: 'https://forum.opnsense.org/' },
    { title: 'WireGuard on OPNsense (docs)', url: 'https://docs.opnsense.org/manual/how-tos/wireguard-client.html' },
    { title: 'Suricata plugin guide', url: 'https://docs.opnsense.org/manual/ips.html' },
    { title: 'Hardening OPNsense', url: 'https://docs.opnsense.org/manual/hardening.html' },
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
