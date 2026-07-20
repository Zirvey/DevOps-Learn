import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'FortiGate - Platform Basics',
  duration: '10–12 hours',
  description:
    'FortiOS 7.4, interfaces, zones, VDOM, sizing FG-40F/60F/100F, FortiGuard, Security Fabric, initial setup of SMB office',
  sections: [
    {
      title: 'The Fortinet ecosystem and the role of FortiGate',
      content: `**FortiGate** - NGFW (Next-Generation Firewall), the central network security node of a typical SMB office. Routing, stateful firewall, VPN, UTM profiles and Fortinet edge management are combined on one device.

**Fortinet Product Family:**

| Product | Office Appointment |
|---------|-------------------|
| **FortiGate** | Firewall, routing, VPN, UTM, SD-WAN, FortiLink controller |
| **FortiSwitch** | Managed L2/L3 Switches (FortiLink) |
| **FortiAP** | Wi-Fi access points (CAPWAP to FortiGate) |
| **FortiAnalyzer** | Centralized logs, reports, compliance |
| **FortiManager** | Central Control 10+ FortiGate |
| **FortiClient EMS** | Managing endpoint VPN clients |
| **FortiAuthenticator** | MFA, RADIUS, SSO (optional) |

**Typical SMB stack:** one FortiGate FG-60F or FG-100F + 2–4 FortiSwitch + 3–8 FortiAP + FortiAnalyzer VM (or cloud log server). FortiManager is needed for 3+ branches or MSP model.

**Why FortiGate, and not “router + separate firewall”:** single console, common policies, built-in VPN, Wi-Fi integration and switching via Security Fabric - fewer points of failure and easier auditing.`,
    },
    {
      title: 'Model selection: FG-40F, FG-60F, FG-100F',
      content: `For a production SMB office, choose a model based on **real** traffic with UTM, and not on the “maximum throughput from the brochure” (it is indicated without inspection).

**Sizing guidelines (office 20–80 employees):**

| Model | Typical office | Concurrent sessions | UTM throughput* | FortiLink ports |
|--------|---------------|---------------------|-----------------|------------------|
| **FG-40F** | 10–25 people, 1 Gbps WAN | ~700K | ~500 Mbps | 2×GE |
| **FG-60F** | 25–50 people, 1 Gbps WAN | ~1.5M | ~700 Mbps | 4× GE |
| **FG-100F** | 50–100 people, 1–2 Gbps WAN | ~2.5M | ~1 Gbps | 4× GE + 2× 10GE SFP+ |

*UTM throughput - with AV + IPS + App Control; the actual figure depends on the profiles.

**When to buy FG-40F:** small office, without SSL inspection, up to 30 VPN users, one WAN.

**When to buy FG-60F:** standard office 30–50 people, SSL-VPN 20–50 users, FortiSwitch/AP via FortiLink, one main + LTE backup WAN.

**When to take the FG-100F:** 50+ users, SD-WAN on two active channels, SSL inspection selectively, growth up to 100 VPN sessions, CPU headroom required.

**Rule:** if the total Internet channel is > 500 Mbps **and** UTM is enabled on all traffic - install the FG-100F. Check the datasheet on [fortinet.com](https://www.fortinet.com) for the latest FortiOS 7.4 figures.

**Licensing:** Basic hardware includes a limited set of FortiGuard. For production, pledge **UTM Bundle** (IPS, AV, Web Filter, App Control, Outbreak Prevention) for 1–3 years.`,
    },
    {
      title: 'FortiOS 7.4: GUI and menu structure',
      content: `**GUI access:** https://192.168.1.99 (factory IP on internal/wan depends on the model). Login \\\`admin\\\` without password to factory default - **change immediately**.

**Key sections of FortiOS 7.4 GUI:**

| Menu | Purpose |
|------|------------|
| **Dashboard → Status** | CPU, sessions, WAN link, uptime |
| **Network → Interfaces** | Physical, VLAN, loopback, zones |
| **Network → Static Routes** | Default route, policy routes |
| **Policy & Objects** | Firewall policies, addresses, services |
| **Security Profiles** | AV, IPS, Web Filter, App Control, SSL/SSH Inspection |
| **VPN** | IPsec Tunnels, SSL-VPN Settings |
| **User & Authentication** | Local/LDAP users, user groups |
| **WiFi & Switch Controller** | FortiAP, FortiSwitch (FortiLink) |
| **System → Administrators** | Admin accounts, trusted hosts, 2FA |
| **Log & Report** | Forward traffic, events, UTM |
| **System → FortiGuard** | License status, update servers |

**CLI:** SSH to management IP → interactive FortiOS shell. Command structure: \\\`config <path>\\\` → \\\`edit <name>\\\` → \\\`set <param> <value>\\\` → \\\`next\\\` → \\\`end\\\`.

**Useful show commands from day one:**
- \\\`get system status\\\` — version, serial, operation mode
- \\\`get system interface physical\\\` — port status
- \\\`show system admin\\\` — administrator accounts
- \\\`diagnose sys session stat\\\` — loading session table

**Recommendation for SMB:** run parallel GUI (operations) and CLI (backup, troubleshooting, copy-paste runbooks). Config export: **System → Configuration → Backup**.`,
    },
    {
      title: 'First launch and change of factory defaults',
      content: `**Factory default FortiGate** - device in NAT/route mode, DHCP on internal, admin without password, HTTPS on all interfaces. This is **unacceptable** for production.

**First launch checklist (SMB office):**

1. Connect the PC to the internal port, get DHCP or set a static IP in the FG subnet
2. Log in, change the password admin (minimum 16 characters, unique)
3. **System → Settings:** hostname (\\\`fg-hq-moscow-01\\\`), timezone, language
4. Register the device: **System → FortiGuard → License** → Connect to FortiCare
5. Update the firmware to the **stable** branch 7.4.x (not beta for production)
6. Configure WAN (DHCP/static/PPPoE) on \\\`wan1\\\`
7. Check the Internet: **Network → Diagnostics → Ping** → 8.8.8.8
8. DNS setup (FortiGuard DNS or internal DC)
9. NTP setting: **System → Settings → NTP** → \\\`pool.ntp.org\\\`
10. Limit admin access: trusted hosts = Management VLAN only
11. Enable 2FA for admin (FortiToken Mobile or email)
12. Make a backup of the config and save it offline

**GUI path for trusted hosts:** System → Administrators → edit admin → Restrict login to trusted hosts → add 192.168.99.0/24 (Management VLAN).

**Important:** Do not disable access to FG until you check the new management path. Always have a console cable (USB/serial) for out-of-band access.`,
      code: {
        language: 'text',
        caption: 'CLI: change hostname, DNS, NTP',
        code: `config system global
    set hostname "fg-hq-moscow-01"
    set timezone 33
    set admin-https-ssl-versions tlsv1-2 tlsv1-3
end

config system dns
    set primary 8.8.8.8
    set secondary 1.1.1.1
end

config system ntp
    set ntpsync enable
    set server-mode disable
    config ntpserver
        edit 1
            set server "pool.ntp.org"
        next
    end
end`,
      },
    },
    {
      title: 'Interfaces: physical, VLAN, loopback',
      content: `FortiGate is an L3 device. Each logical interface has an IP address (except pure bridge) and participates in routing and firewall policies.

**Interface types:**

| Type | Example | When to use |
|-----|--------|-------------------|
| **Physical** | wan1, internal, dmz | WAN uplink, trunk to core switch |
| **VLAN subinterface** | internal.10, internal.20 | LAN segmentation by VLAN ID |
| **Loopback** | lo-mgmt | Stable IP for SNMP, BGP, management |
| **Aggregate (802.3ad)** | aggregate1 | LACP to switch |
| **Software Switch** | soft-switch1 | Consolidation of ports in L2 bridge |
| **Hard Switch** | lan (on FG-40F/60F) | Built-in switch chip |
| **Tunnel** | ssl.root, ipsec-tunnel | VPN interfaces |

**Typical SMB office layout (50 people):**

\\\`\\\`\\\`
wan1 → ISP fiber 1 Gbps (DHCP or static)
wan2          → 4G/LTE modem (backup)
internal → trunk to FortiSwitch (VLANs 10,20,30,60,99)
VLAN10-Servers    192.168.10.0/24
VLAN20-Workstations 192.168.20.0/24
VLAN30-VoIP       192.168.30.0/24
VLAN60-Guest      192.168.60.0/24
VLAN99-Mgmt       192.168.99.0/24
\\\`\\\`\\\`

**Interface role:** WAN - \\\`role wan\\\`, LAN - \\\`role lan\\\`. This affects DHCP server defaults and Security Fabric.

**GUI:** Network → Interfaces → Create New → VLAN. Parent interface = internal (trunk).`,
      code: {
        language: 'text',
        caption: 'CLI: VLAN subinterfaces for a typical office',
        code: `config system interface
    edit "VLAN10-Servers"
        set vdom "root"
        set ip 192.168.10.1 255.255.255.0
        set allowaccess ping
        set role lan
        set interface "internal"
        set vlanid 10
    next
    edit "VLAN20-Workstations"
        set vdom "root"
        set ip 192.168.20.1 255.255.255.0
        set allowaccess ping
        set role lan
        set interface "internal"
        set vlanid 20
    next
    edit "VLAN60-Guest"
        set vdom "root"
        set ip 192.168.60.1 255.255.255.0
        set role lan
        set interface "internal"
        set vlanid 60
    next
    edit "VLAN99-Mgmt"
        set vdom "root"
        set ip 192.168.99.1 255.255.255.0
        set allowaccess ping https ssh
        set role lan
        set interface "internal"
        set vlanid 99
    next
end`,
      },
    },
    {
      title: 'Software Switch, Hard Switch and FortiLink',
      content: `On younger models (FG-40F), some of the ports are **built-in switch (hard switch)**. The FG-60F/100F usually has dedicated GE/10GE ports without an internal switch.

**Hard Switch (lan):** several physical ports are combined at the ASIC level. Convenient for “router + 4 ports” without an external switch, but **not recommended** for production segmentation - external FortiSwitch is better.

**Software Switch:** L2 bridge between interfaces in software. Use rarely (performance penalty). Prefer VLAN subinterfaces on trunk.

**FortiLink** - dedicated port or VLAN for managing FortiSwitch and FortiAP:
- Automatic device discovery
- Single VLAN configuration with FortiGate
- CAPWAP tunnel for FortiAP

**Typical FortiLink layout:**
- FG port \\\`internal\\\` or dedicated \\\`a\\\` → trunk to FortiSwitch
- Native VLAN 4094 (FortiLink) or dedicated VLAN 4094
- User VLANs 10, 20, 30, 60, 99 tagged on trunk

**GUI:** WiFi & Switch Controller → FortiLink Interface → select port. The FortiSwitch will then appear in Managed Switches.

**Important:** Do not use the FortiLink port for regular user traffic without understanding tagging. One misconfigured trunk = outage of the entire office.`,
      code: {
        language: 'text',
        caption: 'CLI: FortiLink interface (concept)',
        code: `config system interface
    edit "fortilink"
        set vdom "root"
        set fortilink enable
        set ip 10.255.1.1 255.255.255.0
        set allowaccess ping fabric
        set type aggregate
        set member "x1" "x2"
        set lldp-transmission enable
        set auto-auth-extension-device enable
    next
end`,
      },
    },
    {
      title: 'Zones: grouping interfaces for policies',
      content: `**Zone**—logical group of interfaces. In the firewall policy, you can specify a zone instead of just one interface - the policy applies to all members of the zone.

**Why zones in SMB:**
- Simplification of policies for multiple WANs (wan1 + wan2 in zone WAN)
- Unified “LAN → Internet” policy for all user VLANs
- Less duplication when adding a new VLAN

**Recommended zones for the office:**

| Zone | Members | Destination |
|------|---------|------------|
| **WAN** | wan1, wan2 | Outgoing Internet, incoming VIP |
| **LAN-Users** | VLAN20, VLAN30 | Workstations, VoIP |
| **LAN-Servers** | VLAN10 | Servers, DC |
| **LAN-Guest** | VLAN60 | Guest Wi-Fi |
| **MGMT** | VLAN99 | Infrastructure Management |

**Example of a policy with zones:** Incoming = LAN-Users, Outgoing = WAN - one policy instead of three for each VLAN.

**Limitation:** interface can only be in one zone. Tunnel interfaces (IPsec, SSL-VPN) are usually in separate zones.

**GUI:** Network → Interfaces → Zone → Create New.`,
      code: {
        language: 'text',
        caption: 'CLI: creating zones',
        code: `config system zone
    edit "WAN"
        set interface "wan1" "wan2"
    next
    edit "LAN-Users"
        set interface "VLAN20-Workstations" "VLAN30-VoIP"
    next
    edit "LAN-Guest"
        set interface "VLAN60-Guest"
    next
end`,
      },
    },
    {
      title: 'VDOM: virtual domains',
      content: `**VDOM (Virtual Domain)** - several independent virtual firewalls on one physical FortiGate. Each VDOM has its own interfaces, policies, routing table.

**Modes:**
- **Split VDOM** — root + additional VDOM (FG-100F and higher, with license)
- **Multi VDOM** - complete separation (enterprise, MSP)

**When VDOM is needed:**
- MSP serves multiple clients on one FG
- Large enterprise: prod/dev/DMZ completely isolated
- Lab on production hardware (not recommended, but possible)

**When VDOM is NOT needed (typical SMB):**
- One office, one admin team
- Up to 100 users
- Segmentation via VLAN + policies is sufficient

**SMB recommendation:** work in a single VDOM \\\`root\\\`. VDOM adds complexity (inter-VDOM links, separate licenses, GUI confusion). Don't enable Multi-VDOM "for the future."

**If you still need VDOM:** FG-100F+, VDOM license, separate management VDOM for admin access. Document the matrix: which VDOM → which VLANs → which policies.

**Check:** \\\`get system vdom-property\\\` - list of VDOM and resource limits.`,
    },
    {
      title: 'Routing: static routes and default gateway',
      content: `FortiGate performs routing between connected networks and across the WAN. For an SMB office, 99% of cases are **static routing**.

**Default route:** 0.0.0.0/0 → gateway ISP on wan1. For dual WAN, see SD-WAN (Operations chapter) or policy-based routes.

**Static routes for internal:**
- Connected networks (VLAN interfaces) — connected, the route is created automatically
- Remote office subnets - static route via IPsec tunnel interface
- AWS VPC subnets — static route via IPsec to VGW

**GUI:** Network → Static Routes → Create New.

**Distance and priority:** with two routes to the same network, the smaller distance wins. Backup route - distance 10, primary - 5.

**Policy Route:** routing by source/destination/service, not only by destination IP. Use for “servers patching only via wan2”.

**Reverse Path Forwarding (RPF):** FortiGate verifies that return traffic will arrive on the same interface. Asymmetric routing breaks RPF → implicit deny. When troubleshooting “traffic is leaving, no response is coming” - check the RPF.`,
      code: {
        language: 'text',
        caption: 'CLI: default route and route to AWS over IPsec',
        code: `config router static
    edit 1
        set dst 0.0.0.0 0.0.0.0
        set gateway 203.0.113.1
        set device "wan1"
        set distance 5
    next
    edit 2
        set dst 10.50.0.0 255.255.0.0
        set device "AWS-Tunnel"
        set comment "AWS VPC via IPsec"
    next
end`,
      },
    },
    {
      title: 'DHCP, DNS relay and system services',
      content: `FortiGate can be a DHCP server for each VLAN interface - convenient for Guest and IoT. For production user VLAN **Windows DHCP** on DC is recommended (integration with AD, reservations, failover).

**When DHCP on FortiGate:**
- Guest VLAN 60 - isolated subnet, TTL 4h
- VoIP VLAN — option 66/150 for TFTP (if there is no dedicated DHCP)
- Lab, temporary networks

**DNS:**
- **FortiGate as DNS proxy** — clients → FG → FortiGuard DNS (with filtering)
- **DNS relay to DC** — clients → FG → 192.168.10.10 (internal AD DNS)
- **Split DNS** — internal zones via DC, external via FortiGuard

**GUI:** Network → DNS Servers. System → DHCP Server (per interface).

**NTP:** is required for correct logs, certificates, IPsec. Synchronize FG and all managed devices.

**SNMP (optional):** for Zabbix/Prometheus SNMP exporter. Read-only community, access only with MGMT VLAN.`,
      code: {
        language: 'text',
        caption: 'CLI: DHCP server for Guest VLAN',
        code: `config system dhcp server
    edit 1
        set dns-service default
        set default-gateway 192.168.60.1
        set netmask 255.255.255.0
        set interface "VLAN60-Guest"
        config ip-range
            edit 1
                set start-ip 192.168.60.100
                set end-ip 192.168.60.200
            next
        end
        set lease-time 14400
    next
end`,
      },
    },
    {
      title: 'FortiGuard: licenses and updates',
      content: `**FortiGuard** - Fortinet cloud update service: IPS signatures, AV, Web Filter categories, Application Control, GeoIP, Outbreak Prevention.

**Subscription Types (UTM Bundle):**

| Service | No subscription | With UTM Bundle |
|--------|-------------|--------------|
| IPS | Restricted Signatures | Full database, auto-update |
| Antivirus | Basic | Extended database |
| Web Filter | Minimum categories | 90+ categories |
| Application Control | Limited | 5000+ applications |
| Outbreak Prevention | No | Zero-day cloud check |

**License check:** System → FortiGuard → License Information. Status = Licensed, Expiry > 90 days.

**Scheduled Updates:** System → FortiGuard → Scheduled Updates - daily at 03:00 (off-peak). Enable **push update** for critical outbreaks.

**FortiGuard Anycast:** FG automatically selects the nearest update server. If you have problems with the update, check the DNS and outbound HTTPS to FortiGuard.

**Without an active license:** the device continues to route, but the UTM profiles degrade. For production SMB - **never** allow expiry: set an alert for 30/60/90 days.

**Registration:** support.fortinet.com → Register Product → serial number. Link to FortiCare contract.`,
    },
    {
      title: 'Security Fabric: a unified ecosystem',
      content: `**Security Fabric** is a security topology, where FortiGate is root, and FortiSwitch, FortiAP, FortiClient EMS, FortiAnalyzer are fabric members. Single dashboard, common tags, automatic device authorization.

**Fabric components in SMB office:**

\\\`\\\`\\\`
                    ┌─────────────┐
                    │ FortiAnalyzer│
                    └──────┬──────┘
                           │ logs
┌──────────┐    ┌──────────┴──────────┐    ┌─────────────┐
│FortiClient│◄──│     FortiGate        │───►│ FortiSwitch │
│   EMS     │   │  (Security Fabric    │    │  (FortiLink)│
└──────────┘    │       Root)          │    └──────┬──────┘
                └──────────┬──────────┘           │
                           │ FortiLink             │
                    ┌──────┴──────┐                │
                    │   FortiAP   │◄───────────────┘
                    └─────────────┘
\\\`\\\`\\\`

**Enable Fabric:** Security Fabric → Fabric Connectors → Enable. Authorize downstream devices upon first connection.

**Benefits for SMB:**
- One GUI for firewall + switch + Wi-Fi VLAN assignment
- Quarantine compromised endpoint via EMS → FG policy
- Unified logs on FortiAnalyzer with fabric serial correlation
- Automated tag propagation (compromised host → deny policy)

**FortiLink security:** enable **FortiLink Security Fabric** authorization - unauthorized switch/AP will not connect.`,
    },
    {
      title: 'FortiManager: central management',
      content: `**FortiManager** is a single device/VM for managing multiple FortiGates. For one office **not needed**. Consider when:
- 3+ branches with the same policies
- MSP with dozens of client FGs
- Centralized logging + config backup (alternative - FortiAnalyzer + scripted backup)

**FortiManager Features:**
- Policy Package - a single set of policies, push to all FGs
- Device Group - grouping by region/client
- FortiGuard proxy - one update path for isolated networks
- Workflow approval for changes

**Alternative for SMB without FortiManager:**
- Scheduled config backup on SFTP (script + cron)
- Infrastructure as Code: Terraform FortiOS provider (advanced)
- Documented runbooks for manual config

**If one FG-60F is at the head office:** FortiManager - overkill. Invest in FortiAnalyzer VM for logs.`,
    },
    {
      title: 'Administrators, profiles and 2FA',
      content: `**Least privilege principle** for admin access on FortiGate production.

**Types of admin profiles:**

| Profile | Rights | Who |
|---------|-------|-----|
| **super_admin** | Full access | 1–2 senior admin |
| **prof_admin** | Policies, objects, no system | Network engineer |
| **read_only** | View only | NOC, audit |

**Required settings:**
- Separate admin accounts (not shared \\\`admin\\\`)
- Trusted hosts = VLAN99 only (192.168.99.0/24)
- HTTPS admin, disable HTTP
- SSH only with MGMT VLAN
- 2FA: FortiToken Mobile for everyone super_admin
- Failed login threshold + lockout
- Admin timeout 15–30 min

**GUI:** System → Administrators → Create New. Profile = limited. Trusted Hosts = enabled.

**Audit:** enable event log for admin login/logout/config change. Forward on FortiAnalyzer.

**Never:** admin access from WAN without VPN. If you need remote admin - only through SSL-VPN + trusted hosts.`,
      code: {
        language: 'text',
        caption: 'CLI: admin with trusted hosts and limited profile',
        code: `config system admin
    edit "netops"
        set trusthost1 192.168.99.0 255.255.255.0
        set accprofile "prof_admin"
        set vdom "root"
        set password ENC <encrypted>
        set two-factor fortitoken
        set fortitoken <token_serial>
    next
end`,
      },
    },
    {
      title: 'Registration, support and firmware policy',
      content: `**FortiCare registration** - required for firmware updates, FortiGuard, TAC support.

**Steps:**
1. support.fortinet.com → Register Product
2. On FG: System → FortiGuard → Login to FortiCare (or CLI \\\`execute update-now\\\`)
3. Verify serial, contract, expiry dates

**Firmware policy for SMB production:**
- Branch: **mature** (7.4.x stable, not 7.6 beta)
- Upgrade window: maintenance Saturday 02:00–06:00
- Pre-upgrade: backup config, read release notes, check known issues
- Post-upgrade: verify VPN, policies, FortiLink devices
- Rollback plan: previous firmware partition (FG stores 2 images)

**GUI:** System → Firmware → select stable → Upgrade. For HA - first secondary (see Operations).

**Auto-patch:** do not enable auto-firmware without a test FG. Signature updates - yes, firmware - only controlled.`,
    },
    {
      title: 'Backup, restore and revision control',
      content: `**Config backup** is a critical operation. FortiGate without backup = single point of failure.

**Backup methods:**
- **Manual GUI:** System → Configuration → Backup → Encrypt (AES password!)
- **Scheduled:** System → Configuration → Backup Settings → SFTP/SCP
- **CLI:** \\\`execute backup config tftp <file> <server>\\\`
- **FortiManager:** automatic revision history

**What to store:**
- Daily automated backup (retention 30 days)
- Backup before each change (with ticket ID in the file name)
- Offline copy (not only on the same FG!)

**Restore:** System → Configuration → Restore. **Attention:** restore overwrites everything, including admin passwords from the backup file.

**Encrypted backup:** always encrypt. The .conf file contains PSK VPN, LDAP bind passwords (masked, but decryptable).

**Version control (advanced):** export .conf to git private repo, diff before change. Don't commit to public repos.`,
      code: {
        language: 'text',
        caption: 'CLI: backup and restore',
        code: `# Backup на TFTP server
execute backup config tftp fg-hq-backup-20260710.conf 192.168.99.50

# Backup с шифрованием
execute backup config tftp fg-hq-encrypted.conf 192.168.99.50 <password>

# Restore (ОСТОРОЖНО — перезапишет конфиг)
execute restore config tftp fg-hq-backup-20260710.conf 192.168.99.50`,
      },
    },
    {
      title: 'Capacity planning and resource monitoring',
      content: `**Metrics for monitoring SMB FortiGate:**

| Metric | Warning | Critical | Team |
|---------|---------|----------|---------|
| CPU | > 60% sustained | > 85% | \\\`get system performance status\\\` |
| Memory | > 70% | > 90% | Dashboard |
| Session count | > 70% max | > 90% max | \\\`diagnose sys session stat\\\` |
| Disk | > 80% | > 95% | \\\`get system status\\\` |
| WAN bandwidth | > 80% line rate | saturation | SNMP / FortiAnalyzer |

**Session table:** each TCP connection = 2 sessions (client→FG, FG→server). FG-60F max ~1.5M - enough for 50 users with UTM with a margin.

**Features of undersized FG:**
- CPU spikes during business hours
- SSL inspection is disabled “because it’s slow”
- Session table near limit
- UTM bypass rules “for speed”

**Solution:** upgrade models, selective SSL inspection, ASIC offload where possible, reduce logging verbosity.

**Dashboard widgets:** add CPU, Memory, Sessions, WAN utilization, Top applications.`,
    },
    {
      title: 'Typical architecture of an SMB office for 50 people',
      content: `**Reference design** for the head office of a company with ~50 employees.

**Iron:**
- FortiGate FG-60F (UTM Bundle 3yr)
- FortiSwitch 148F-POE × 2 (access layer)
- FortiAP 231F × 4 (open space + meeting rooms)
- FortiAnalyzer 100F VM or syslog server

**Net:**
- WAN1: fiber 500 Mbps (primary)
- WAN2: LTE 100 Mbps (backup, SD-WAN failover)
- VLAN10 Servers 192.168.10.0/24
- VLAN20 Workstations 192.168.20.0/24
- VLAN30 VoIP 192.168.30.0/24
- VLAN60 Guest 192.168.60.0/24
- VLAN99 Management 192.168.99.0/24

**Services on FG:**
- Firewall policies (see Policies chapter)
- SSL-VPN for 30 remote users
- DHCP Guest VLAN only
- DNS relay to DC
- FortiGuard Web Filter + IPS on user traffic

**Not on FG:** file server, AD, DHCP for users - on Windows Server in VLAN10.

**Documentation:** network diagram, IP plan, admin contacts, ISP details, backup location, FortiCare contract number.`,
    },
    {
      title: 'Troubleshooting basic connectivity',
      content: `**Bottom-up method** for “no Internet” or “does not respond”:

1. **Physical:** link up? \\\`get system interface physical\\\`
2. **IP:** FG ping gateway? \\\`execute ping 203.0.113.1\\\`
3. **DNS:** \\\`execute ping google.com\\\` vs \\\`execute ping 8.8.8.8\\\`
4. **Route:** \\\`get router info routing-table all\\\`
5. **Policy:** Policy Lookup in GUI
6. **NAT:** central SNAT enabled?
7. **Session:** \\\`diagnose sys session filter <ip>\\\`

**Common initial setup errors:**
- Forgot default route
- Policy without NAT for internet
- Admin trusted hosts block their IP
- VLAN ID mismatch between FG and switch
- Duplicate IP on interface

**Ping options:** execute ping-options source <interface_ip> - ping from a specific VLAN.`,
      code: {
        language: 'text',
        caption: 'CLI: connectivity diagnostics',
        code: `get system status
get system interface physical
get router info routing-table all
execute ping 8.8.8.8
execute ping-options source 192.168.20.1
execute ping 192.168.10.10

diagnose debug reset
diagnose debug flow filter addr 192.168.20.50
diagnose debug flow show function-name enable
diagnose debug enable
# воспроизведи трафик с клиента
diagnose debug disable`,
      },
    },
    {
      title: 'Factory reset → production: full path',
      content: `**Scenario:** new FortiGate out of the box or after a lab test - bring it to production-ready state.

**Phase 1 - Factory baseline (30 min):**
1. Console cable → login admin (no password)
2. \\\`execute factoryreset\\\` (or reset button 10+ sec) - **only on new/lab FG**
3. Verify: default IP, DHCP on internal, HTTPS on all interfaces
4. Update firmware to target 7.4.x **to** production config

**Phase 2 - Hardening baseline (1 hour):**
1. Change admin password (16+ chars, unique)
2. Creating named admin accounts, disable shared admin (optional)
3. Hostname, timezone, NTP
4. FortiCare registration + UTM license activation
5. Trusted hosts = MGMT VLAN only
6. Disable HTTP admin, enable HTTPS TLS 1.2+
7. FortiToken 2FA for super_admin

**Phase 3 - Network foundation (2 hours):**
1. WAN interface (static/DHCP/PPPoE)
2. VLAN subinterfaces per IP plan
3. Zones (WAN, LAN-Users, LAN-Guest, MGMT)
4. Default route + static routes (AWS, branch)
5. DNS relay / FortiGuard DNS

**Phase 4 - Security baseline (1 hour):**
1. Security Rating → apply FortiGuard recommendations
2. FortiGuard scheduled updates (03:00 daily)
3. Admin audit logging → FortiAnalyzer/syslog
4. Encrypted config backup

**Phase 5 - Validation (30 min):**
- Checklist: internet OK, admin only from MGMT, no default passwords
- Security Rating score ≥ 80%
- Backup saved offline
- Change ticket closed

**Rollback:** if something breaks mid-deploy - restore last good backup, not factory reset to production without backup.`,
      code: {
        language: 'text',
        caption: 'CLI: factory reset and post-reset verify',
        code: `# ТОЛЬКО lab или новый FG из коробки
execute factoryreset

# После reset — verify
get system status
show system admin
get system interface physical`,
      },
    },
    {
      title: 'Interface migration when replacing FortiGate',
      content: `**Scenario:** replacing FG-60F with FG-100F without changing the IP plan and minimal downtime.

**Preparation (per week):**
1. Export running config with old FG (encrypted backup)
2. Document physical port mapping: wan1→ISP, internal→core switch trunk
3. Verify new FG firmware = same 7.4.x branch
4. Pre-config new FG offline: import config, fix interface names if different

**Port mapping differences:**
| Old FG-60F | New FG-100F | Notes |
|------------|-------------|-------|
| wan1 | wan1 | ISP |
| internal | port1 | Trunk to switch |
| dmz | port2 | If used |
| a, b | x1, x2 | FortiLink may differ |

**Migration window (2–4 hours):**
1. Maintenance notification (VPN/internet downtime)
2. Backup old FG config (final)
3. Physical swap: cables to new FG **same ports where possible**
4. Boot new FG with restored config
5. Fix interface bindings if hardware differs:
   - \\\`config system interface\\\` → update \\\`set interface\\\` parent for VLANs
6. Verify: WAN IP, VLAN gateways, VPN tunnels, FortiLink switches

**Post-migration validation:**
- Ping test all VLAN gateways
- VPN reconnect (IPsec + SSL-VPN)
- FortiSwitch/AP re-authorize on FortiLink
- FortiAnalyzer re-register device serial
- 24h monitoring

**Rollback:** keep old FG cabled but powered off 48h. If failure — swap back.`,
      code: {
        language: 'text',
        caption: 'CLI: checking interface mapping after migration',
        code: `get system interface
diagnose hardware deviceinfo nic
get system status | grep Serial

# Verify VLAN parent interfaces
show system interface | grep -f vlan`,
      },
    },
    {
      title: 'VDOM: when to use - decision framework',
      content: `**Decision tree for SMB:**

\\\`\\\`\\\`
Need a VDOM?
├── One office, one admin team → NO (root VDOM + VLAN)
├── MSP, several clients on one FG → YES (Multi-VDOM)
├── Prod + Lab on one hardware → NO (separate lab VM)
├── Regulatory: prod/DMZ complete routing isolation → Consider VDOM
└── > 100 policies, different admin teams → Consider VDOM or FortiManager
\\\`\\\`\\\`

**Root VDOM (99% SMB):**
- All VLANs = interfaces in root
- Segmentation via firewall policies
- Easier troubleshooting, backup, training

**Multi-VDOM (enterprise/MSP):**
- Requires VDOM license (FG-100F+: 10 VDOM default)
- Each VDOM = separate routing table, policies, admin scope
- Inter-VDOM link (VDOM-link interface) for controlled cross-VDOM traffic
- FortiManager strongly recommended

**Management VDOM pattern:**
- mgmt VDOM: admin access, FortiAnalyzer connection
- prod VDOM: user traffic
- Difficulty ↑, security boundary ↑

**Checking the current mode:**
\\\`\\\`\\\`
get system vdom
get system vdom-property
\\\`\\\`\\\`

**SMB rule:** do not enable Multi-VDOM “for growth”. VLAN + zones + policies cover 50–200 users.`,
    },
    {
      title: 'FortiToken MFA: step-by-step setup',
      content: `**FortiToken Mobile** - free OTP for admin and VPN users.

**For admin account:**
1. System → Administrators → edit admin
2. Two-factor Authentication → FortiToken
3. User & Authentication → FortiToken → Create New → Mobile → assign to admin
4. QR code → scan in FortiToken Mobile app
5. Test login: password + 6-digit code

**For VPN users (LDAP):**
1. User & Authentication → Authentication Settings → Enable Two-Factor
2. Create LDAP user override OR assign token per user
3. Alternative: FortiAuthenticator as RADIUS proxy (centralized MFA)

**Token lifecycle:**
- Activation: user scans QR within 24h
- Lost device: revoke token, issue new
- Offboarding: delete token immediately

**Troubleshooting OTP fail:**
- NTP sync on FG (\\\`get system status\\\` → check time)
- Token drift > 30 sec → re-sync app
- Wrong token assigned to user

**Best practice:** MFA mandatory for: super_admin, VPN-Admins, any admin with write access.`,
      code: {
        language: 'text',
        caption: 'CLI: FortiToken for admin',
        code: `execute fortitoken-mobile import ftm-fgt.csv

config user fortitoken
    edit "FTKMOB0000000001"
        set status active
    next
end

config system admin
    edit "admin"
        set two-factor fortitoken
        set fortitoken "FTKMOB0000000001"
    next
end`,
      },
    },
    {
      title: 'Certificate management: CA, server cert, import',
      content: `**Types of certificates on FortiGate:**

| Type | Destination | Source |
|-----|------------|----------|
| **Local CA** | SSL inspection, internal PKI | FG generates |
| **Server cert** | Admin HTTPS, SSL-VPN portal | Let's Encrypt / corporate CA |
| **Trusted CA** | Verify remote servers | Import CA bundle |
| **Remote cert** | IPsec certificate auth | Peer CA |

**SSL-VPN server certificate (production):**
1. System → Certificates → Import → PKCS12 or CSR
2. Or: Let's Encrypt via ACME (FortiOS 7.4+)
3. VPN → SSL-VPN Settings → Server Certificate → select cert
4. Users trust CA (public CA = automatic)

**SSL Deep Inspection CA:**
1. System → Certificates → Create → Certificate Authority
2. Export CA cert (.cer)
3. Deploy via GPO (Windows) / MDM (macOS) to Trusted Root
4. Security Profiles → SSL/SSH Inspection → use CA

**IPsec certificate auth:**
1. Generate CSR on FG
2. Sign at corporate CA
3. Import signed cert + CA chain
4. Phase1 → authmethod signature

**Renewal:** monitor expiry 30 days before. SSL-VPN cert expiry = total VPN outage.`,
      code: {
        language: 'text',
        caption: 'CLI: import server certificate',
        code: `execute vpn certificate local import tftp vpn-server.crt 192.168.99.50
execute vpn certificate ca import tftp ca-bundle.crt 192.168.99.50

config vpn ssl settings
    set servercert "vpn-server-cert"
end`,
      },
    },
    {
      title: 'REST API: automation examples',
      content: `**FortiGate REST API** (FortiOS 7.4) - automation of backup, monitoring, object management.

**Enable API admin:**
1. System → Administrators → Create API admin
2. Profile: read-only (monitoring) or REST API permissions
3. Trusted hosts restrict to automation server

**Authentication:** Bearer token via login endpoint or API key.

**Examples of use cases SMB:**
- Nightly config backup via API
- Sync address objects from CMDB
- Create temporary firewall rule (change automation)
- Pull system status for Grafana

**API paths:**
- \\\`/api/v2/monitor/system/status\\\` — GET status
- \\\`/api/v2/cmdb/firewall/address\\\` — CRUD addresses
- \\\`/api/v2/cmdb/system/admin\\\` — admin management

**Terraform alternative:** FortiOS Terraform provider for Infrastructure as Code.`,
      code: {
        language: 'text',
        caption: 'REST API: login and backup config',
        code: `# Login (get session cookie)
curl -k -X POST "https://192.168.99.1/api/v2/authentication" \\
  -H "Content-Type: application/json" \\
  -d '{"username":"api-admin","secret":"password"}'

# Get system status
curl -k -X GET "https://192.168.99.1/api/v2/monitor/system/status" \\
  -H "Authorization: Bearer <token>"

# Backup config
curl -k -X POST "https://192.168.99.1/api/v2/monitor/system/config/backup" \\
  -H "Authorization: Bearer <token>" \\
  -o fg-backup.conf`,
      },
    },
    {
      title: 'Sizing calculator: step by step walkthrough',
      content: `**Fortinet Sizing Tool** (fortinet.com → Resources → Sizing Tool) - formal calculation of the model.

**Step 1 — Traffic profile:**
- WAN bandwidth: 500 Mbps fiber
- Users: 50 concurrent
- VPN users: 30 SSL-VPN
- UTM: AV + IPS + Web Filter + App Control (no full SSL inspection)

**Step 2 — Input parameters:**
| Parameter | Value |
|-----------|-------|
| Throughput required | 500 Mbps |
| UTM enabled | Yes |
| SSL inspection | Partial (30%) |
| Concurrent sessions | 50 users × 50 sessions = 2500 |
| VPN tunnels | 30 SSL + 2 IPsec |
| FortiSwitch/AP | 4 AP, 2 switches |

**Step 3 - Tool output:**
- FG-60F: **marginal** at 500 Mbps UTM (700 Mbps rated, 70% rule)
- FG-100F: **recommended** with headroom

**Step 4 — Validate with 70% rule:**
Never run FG above 70% sustained CPU/sessions/throughput.

**Step 5 - Future growth:**
+20 users/year → FG-100F avoids upgrade in 2 years.

**Manual formula (rough):**
\\\`\\\`\\\`
Required UTM throughput = WAN_speed × 1.2 (overhead)
If Required > Datasheet_UTM × 0.7 → next model up
\\\`\\\`\\\`

**Document:** save sizing tool PDF in procurement folder.`,
    },
    {
      title: 'FG-40F vs FG-60F vs FG-100F: feature matrix',
      content: `**Full comparison matrix (FortiOS 7.4, generic SKUs):**

| Feature | FG-40F | FG-60F | FG-100F |
|---------|--------|--------|---------|
| **Threat Protection throughput** | ~500 Mbps | ~700 Mbps | ~1 Gbps |
| **Concurrent sessions** | ~700K | ~1.5M | ~2.5M |
| **New sessions/sec** | ~35K | ~50K | ~80K |
| **SSL-VPN users (tunnel)** | 50 | 200 | 500 |
| **IPsec VPN throughput** | ~1 Gbps | ~2 Gbps | ~3 Gbps |
| **GE ports** | 5 (hard switch) | 10 | 14 |
| **10GE SFP+** | 0 | 0 | 2 |
| **FortiLink default** | Limited | 4 ports | 4 ports |
| **VDOMs (default license)** | 10 | 10 | 10 |
| **HA Active-Passive** | Yes | Yes | Yes |
| **SD-WAN** | Yes | Yes | Yes |
| **NP7 ASIC** | No | Partial | Yes |
| **Wi-Fi controller (APs)** | 32 | 64 | 128 |
| **Managed switches** | 8 | 16 | 24 |
| **Typical office size** | 10–25 | 25–50 | 50–100 |
| **Price tier** | $ | $$ | $$$ |

**FG-40F limitations:** hard switch on LAN ports is not ideal for trunk VLAN segmentation. OK for micro-office.

**FG-60F sweet spot:** most SMB 30–50 users, one WAN 500 Mbps.

**FG-100F triggers:** dual WAN active, 50+ VPN, SD-WAN load balance, SSL inspection > 30% traffic, FortiLink 3+ switches.`,
    },
    {
      title: 'FortiOS 7.4 lab: FortiGate VM on VMware/ESXi/KVM',
      content: `**Lab goal:** deploy FortiGate-VM64 trial on a hypervisor, get a working FG for all module chapters.

**Download:**
1. support.fortinet.com → Downloads → FortiGate → VM
2. Select: VMware (.ovf), ESXi (.zip), KVM (.qcow2)
3. Trial license: 15 days full UTM (extend via FortiCare eval)

**VMware Workstation / Fusion:**
1. File → Open → FortiGate-VM64.ovf
2. RAM: 2 GB min (4 GB recommended)
3. vNICs: 3 (wan1, internal, mgmt)
   - WAN → NAT/bridged to internet
- Internal → host-only or custom VMnet
   - Mgmt → host-only 192.168.99.0/24
4. Power on → console: login admin/(blank)
5. Default IP: 192.168.1.99 on port1 — adjust per lab

**ESXi:**
1. Upload OVF via vSphere Client → Deploy OVF Template
2. Datastore: 30 GB thin provision
3. Network mapping: WAN-VLAN, LAN-VLAN, MGMT-VLAN
4. Resource pool: 2 vCPU, 4096 MB RAM
5. Console → initial setup

**KVM (libvirt):**
\\\`\\\`\\\`
virt-install --name fg-lab --ram 4096 --vcpus 2 \\\\
  --disk path=/var/lib/libvirt/images/fg-lab.qcow2 --import \\\\
  --network bridge=br-wan,model=virtio \\\\
  --network bridge=br-lan,model=virtio
\\\`\\\`\\\`

**Post-deploy (all platforms):**
1. GUI https://192.168.1.99 — change password
2. Register trial license: System → FortiGuard
3. Upgrade firmware 7.4.x
4. Configure interfaces per lab topology
5. Snapshot VM «clean-baseline»

**Lab topology:**
\\\`\\\`\\\`
[Internet] ← wan1 ← [FG-VM] → internal → [Client VM VLAN20]
                              → mgmt    → [Admin PC VLAN99]
\\\`\\\`\\\`

**Troubleshooting VM:**
- No license → limited functionality, register trial
- vNIC order wrong → check \\\`get system interface physical\\\`
- No internet on WAN → hypervisor NAT/bridge config`,
      code: {
        language: 'text',
        caption: 'CLI: initial VM setup after deployment',
        code: `config system interface
    edit "port1"
        set alias "wan1"
        set mode dhcp
        set allowaccess ping https
    next
    edit "port2"
        set alias "internal"
        set ip 192.168.20.1 255.255.255.0
        set allowaccess ping https ssh
    next
end

execute ping 8.8.8.8`,
      },
    },
    {
      title: 'Diagnose/debug commands reference',
      content: `**System diagnostics:**
| Team | Destination |
|---------|------------|
| \\\`get system status\\\` | Version, serial, uptime, operation mode |
| \\\`get system performance status\\\` | CPU, memory, NPU usage |
| \\\`diagnose sys session stat\\\` | Session table summary |
| \\\`diagnose sys top 5 10\\\` | Top processes by CPU |
| \\\`get hardware status\\\` | Temperature, fan, PSU |
| \\\`diagnose hardware deviceinfo nic\\\` | NIC details |

**Network diagnostics:**
| Team | Destination |
|---------|------------|
| \\\`get system interface physical\\\` | Link status all ports |
| \\\`get router info routing-table all\\\` | Full routing table |
| \\\`diagnose ip address list\\\` | All interface IPs |
| \\\`diagnose sniffer packet wan1 'host x.x.x.x' 4 0 l\\\` | Packet capture |
| \\\`execute traceroute 8.8.8.8\\\` | Path trace |

**Firewall debug (CAUTION - CPU load):**
| Team | Destination |
|---------|------------|
| \\\`diagnose debug reset\\\` | Clear debug state |
| \\\`diagnose debug flow filter addr x.x.x.x\\\` | Filter by IP |
| \\\`diagnose debug flow show function-name enable\\\` | Verbose flow |
| \\\`diagnose debug enable\\\` | Start debug |
| \\\`diagnose debug disable\\\` | **Stop debug** |

**FortiGuard/connectivity:**
| Team | Destination |
|---------|------------|
| \\\`diagnose debug rating\\\` | Security Rating debug |
| \\\`execute update-now\\\` | Force FortiGuard update |
| \\\`diagnose test update info\\\` | Update server reachability |

**Rule:** always \\\`diagnose debug disable\\\` after session. On production - maintenance window.`,
    },
    {
      title: 'Production case study 1: migration from SOHO router',
      content: `**Client:** law firm, 35 employees, Moscow.

**It was:** ISP router + cheap SOHO firewall, flat network 192.168.1.0/24, no VLAN, no VPN inspection.

**Task:** segmentation, SSL-VPN for 15 remote lawyers, compliance (152-FZ logging).

**Solution:**
- FortiGate FG-60F + UTM Bundle 3yr
- VLAN10 Servers, VLAN20 Users, VLAN60 Guest, VLAN99 Mgmt
- SSL-VPN + AD + FortiToken MFA
- FortiAnalyzer VM 90-day log retention

**Timeline:** 2 weekends (deploy + VPN rollout).

**Results:**
- Security Rating: 32% → 87%
- Guest isolated from file server (verified pen test)
- VPN audit trail for compliance
- Incident: blocked ransomware C2 via IPS week 2

**Lessons learned:**
- Schedule SSL-VPN training for lawyers (FortiClient install)
- Pre-create AD group VPN-Users before go-live
- Keep old router 1 week as emergency fallback`,
    },
    {
      title: 'Production case study 2: dual WAN + SD-WAN failover',
      content: `**Client:** trading support office, 45 users, SLA 99.9% internet.

**Was:** single fiber WAN, 4h outage cost = $50K business impact.

**Solution:**
- FG-100F HA pair (Active-Passive)
- wan1: fiber 1 Gbps, wan2: LTE 200 Mbps
- SD-WAN with health-check failover (< 15 sec)
- FortiAnalyzer alerts on WAN switch

**Config highlights:**
- Link monitor: ping 8.8.8.8 + 1.1.1.1 every 1 sec
- Failtime: 3, Recoverytime: 5
- Email alert: «Office on LTE backup»

**Failover test results:**
- Unplug fiber → LTE active in 12 seconds
- VPN users: brief disconnect, auto-reconnect
- VoIP: 2 dropped calls (acceptable per SLA)

**Monthly test:** automated script disables wan1 every 1st Sunday 06:00, verifies wan2, restores.

**Cost:** FG-100F HA ≈ 2× hardware, but outage cost justified investment.`,
    },
    {
      title: 'Production case study 3: FortiLink campus Wi-Fi',
      content: `**Client:** open-space IT company, 80 employees, 2000 m² office.

**Was:** unmanaged APs, separate controller, inconsistent VLAN assignment.

**Solution:**
- FG-100F as Wi-Fi controller
- 6× FortiAP 231F via FortiSwitch 248E-POE FortiLink
- SSIDs: Corp (802.1X/VLAN20), Guest (VLAN60), Dev (VLAN70)

**Architecture:**
\\\`\\\`\\\`
FG-100F [FortiLink trunk] → FSW-248E → 6× FAP-231F (PoE)
\\\`\\\`\\\`

**Benefits:**
- Single GUI for firewall + Wi-Fi policies
- Guest isolation enforced at FG (not just AP)
- EMS integration: non-compliant laptop → quarantine SSID

**Challenge:** initial RF interference — resolved with site survey, channel plan 1/6/11.

**Metrics post-deploy:**
- Wi-Fi coverage: 98% areas > -65 dBm
- Helpdesk Wi-Fi tickets: -60% in 3 months
- Security Fabric dashboard: unified view`,
    },
    {
      title: 'FAQ: 12 frequently asked questions (Fundamentals)',
      content: `**1. Is FortiManager needed for one office?**
No. FortiAnalyzer for logs + scripted backup is enough.

**2. Is FG-40F enough for 40 users?**
Model name ≠ user count. For 500 Mbps + UTM, take FG-60F minimum.

**3. Can FG be used as DHCP for all VLANs?**
It’s possible, but for AD integration it’s better to use Windows DHCP on DC.

**4. What if the FortiGuard license has expired?**
Routing works, UTM degrades. Renew immediately.

**5. VDOM vs VLAN - what to choose?**
VLAN for 99% SMB. VDOM for MSP/multi-tenant.

**6. How to get a trial VM license?**
support.fortinet.com → register → download VM + eval license.

**7. Will Factory reset remove the license?**
No, license is tied to serial. Config will be deleted.

**8. Is it possible to have admin access via WAN?**
Not recommended. VPN → MGMT VLAN → admin.

**9. Hard switch vs external FortiSwitch?**
Production with segmentation → external FortiSwitch on FortiLink.

**10. Which firmware branch for production?**
7.4.x mature/stable. Not beta.

**11. REST API vs CLI for backup?**
Both are OK. Scheduled SCP backup is easier for SMB.

**12. Is the Security Rating 100% realistic?**
80–90% is a good production target. 100% often breaks the UX.`,
    },
    {
      title: 'NSE4 exam topics: mapping (Fundamentals)',
      content: `**NSE4_FGT-7.2/7.4** covers FortiGate operation. Mapping to this chapter:

| NSE4 Domain | Topics in this chapter | Weight |
|-------------|------------------------|--------|
| **FortiOS fundamentals** | GUI, CLI, interfaces, routing | ~15% |
| **Network configuration** | VLAN, zones, static routes, DNS, DHCP | ~20% |
| **Security concepts** | Security Fabric, FortiGuard, admin hardening | ~10% |
| **System administration** | Backup, firmware, NTP, FortiCare | ~15% |
| **Troubleshooting** | diagnose commands, flow debug, connectivity | ~10% |

**Exam prep from this chapter:**
1. Lab: deploy VM, configure 3 VLANs, default route
2. CLI: \\\`get system status\\\`, \\\`get router info routing-table all\\\`
3. Know FG model sizing differences (40F/60F/100F)
4. VDOM concept (when/when not)
5. Security Rating recommendations
6. Certificate types and use cases

**Not in this chapter (other chapters):**
- Firewall policies → Policies chapter
- VPN → VPN chapter
- HA, FortiAnalyzer → Operations chapter

**Practice exams:** training.fortinet.com → NSE4 → Practice questions.`,
    },
    {
      title: 'Interview Q&A: 10 Questions (Fundamentals)',
      content: `**Q1: ​​How is FortiGate different from a regular router + ACL?**
A: Stateful NGFW + integrated UTM + VPN + FortiLink switching/Wi-Fi in one platform with single policy model.

**Q2: How to choose between FG-60F and FG-100F?**
A: By UTM throughput at 70% rule, concurrent sessions, VPN count, SD-WAN needs — not user count alone.

**Q3: Why zones if there are VLAN interfaces?**
A: Zones group interfaces for simplified policies — one rule for multiple VLANs, easier WAN failover.

**Q4: What is FortiLink?**
A: Proprietary protocol for FortiGate to manage FortiSwitch/FortiAP as Security Fabric members.

**Q5: How to restrict admin access?**
A: Trusted hosts (MGMT VLAN), 2FA FortiToken, separate admin profiles, no WAN admin.

**Q6: VDOM - when is it needed?**
A: MSP multi-tenant, strict regulatory separation. Not for typical single-office SMB.

**Q7: Factory default risks?**
A: No admin password, HTTPS on all interfaces, no segmentation — immediate hardening required.

**Q8: How can I check FortiGuard license status?**
A: \\\`get system fortiguard\\\` or System → FortiGuard → License Information.

**Q9: Security Fabric root - who?**
A: FortiGate. Downstream: FortiSwitch, FortiAP, FortiClient EMS, FortiAnalyzer.

**Q10: First 3 commands for “no internet”?**
A: \\\`get system interface physical\\\`, \\\`execute ping <gateway>\\\`, \\\`get router info routing-table all\\\`.`,
    },
    {
      title: 'Security Rating: hardening by FortiGuard',
      content: `**Security Rating** (Security Fabric → Security Rating) - automated audit with FortiGuard recommendations.

**Typical recommendations and fixes:**

| Finding | Risk | Fix |
|---------|------|-----|
| Default admin password | Critical | Change password, 16+ chars |
| No 2FA on admin | High | Enable FortiToken |
| Admin access from any IP | High | Trusted hosts = MGMT VLAN |
| HTTP admin enabled | Medium | HTTPS only |
| Outdated firmware | High | Upgrade to 7.4.x stable |
| Weak SSL/TLS versions | Medium | TLS 1.2+ only |
| No explicit deny policy | Medium | Add deny-all with logging |
| FortiGuard not registered | High | Register FortiCare |
| No scheduled updates | Medium | Daily signature update 03:00 |
| Unused policies enabled | Low | Disable/delete stale rules |

**Workflow (monthly):**
1. Security Fabric → Security Rating → Run Scan
2. Export report PDF
3. Prioritize Critical/High fixes
4. Apply fixes in change window
5. Re-scan → target score ≥ 85%

**CLI check:**
\\\`\\\`\\\`
diagnose sys fortiguard-service rating
\\\`\\\`\\\`

**Don't blindly apply all:** some recommendations may break legacy apps - test in lab first.`,
    },
    {
      title: 'Laboratory: initial setup from scratch',
      content: `**Goal:** Deploy a FortiGate VM (or physical lab FG) with VLAN segmentation and basic connectivity.

**Preliminary:** Download FortiGate VM trial from fortinet.com (KVM/VMware/Hyper-V).

**Steps:**

1. Deploy VM, connect port1=WAN, port2=LAN (internal)
2. Login GUI, change admin password
3. Register FortiGuard (trial license)
4. Update firmware to 7.4.x stable
5. Configure wan1: DHCP (or static in lab network)
6. Create VLAN10, VLAN20, VLAN60 subinterfaces on internal
7. Create zones: WAN, LAN-Users, LAN-Guest
8. Add default route 0.0.0.0/0 via wan1 gateway
9. Create minimal policy: LAN-Users → WAN, NAT on (details in chapter Policies)
10. Configure DHCP on VLAN60-Guest
11. Restrict admin to 192.168.99.0/24 (create VLAN99)
12. Enable 2FA on admin
13. Backup config, document IP plan

**Check:**
- Workstation VM in VLAN20 pings 8.8.8.8
- Guest VM in VLAN60 pings the internet, does NOT ping VLAN10
- Admin GUI is only accessible from VLAN99

**Cleanup:** export config for reference, snapshot VM.`,
    },
  ],
  practice: [
    'Deploy FortiGate VM trial (KVM/VMware/ESXi), register with FortiCare',
    'Create 5 VLAN subinterfaces: Servers, Workstations, VoIP, Guest, Management',
    'Setting up zones WAN, LAN-Users, LAN-Guest, MGMT - explain why each',
    'Change admin password, enable 2FA FortiToken, limit trusted hosts',
    'Compare datasheet FG-40F vs FG-60F vs FG-100F for an office of 50 people - table',
    'Configuring NTP, DNS, scheduled FortiGuard updates',
    'Make an encrypted backup of the config, restore it to a clean FG VM',
    'CLI: get system status, get system interface, diagnose sys session stat',
    'Draw a Security Fabric diagram for an office with FG + Switch + AP + Analyzer',
    'Write an IP plan document: VLAN, subnet, gateway, DHCP scope, DNS',
    'Troubleshoot lab: “workstation does not ping the internet” with flow debug',
    'Justify the choice of FG-60F vs FG-100F for a specific case (500 Mbps + 40 VPN users)',
    'Pass Security Rating scan, fix 5 Critical/High findings',
    'REST API: get system status via curl, save JSON',
    'FortiOS 7.4 lab: deploy to KVM or VMware, snapshot baseline config',
  ],
  resources: [
    { title: 'Fortinet Training Institute (NSE4)', url: 'https://training.fortinet.com/' },
    { title: 'FortiGate 7.4 Administration Guide', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide' },
    { title: 'FortiGate VM trial download', url: 'https://www.fortinet.com/support/product-downloads' },
    { title: 'FortiGate datasheet (sizing)', url: 'https://www.fortinet.com/products/next-generation-firewall' },
    { title: 'FortiOS CLI reference 7.4', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/cli-reference' },
    { title: 'FortiGate REST API Guide', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/940602/using-apis' },
    { title: 'Fortinet Security Rating', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/893656/security-rating' },
    { title: 'FortiGate sizing tool', url: 'https://www.fortinet.com/resources/enterprise-solutions/sizing-tool' },
  ],
  quiz: [
    {
      question: 'FortiGate is:',
      options: ['Next-Generation Firewall', 'Wi‑Fi controller only', 'Mail server only'],
      answer: 'Next-Generation Firewall',
    },
    {
      question: 'VDOM to SMB is usually:',
      options: ['One root', '10 mandatory', 'Not supported'],
      answer: 'One root',
    },
    {
      question: 'VLAN subinterface is created on:',
      options: ['Physical interface (for example internal)', 'WAN only', 'USB only'],
      answer: 'Physical interface (for example internal)',
    },
    {
      question: 'FortiGuard subscription gives:',
      options: ['IPS, AV, Web Filter updates', 'GUI only', 'Free internet'],
      answer: 'IPS, AV, Web Filter updates',
    },
    {
      question: 'Security Fabric connects:',
      options: ['FG + FortiSwitch + FortiAP', 'Printers only', 'Outlook only'],
      answer: 'FG + FortiSwitch + FortiAP',
    },
    {
      question: 'First after turning on the new FG:',
      options: ['Change admin password', 'Open all ports', 'Disable DNS'],
      answer: 'Change admin password',
    },
  ],
}

export default translation
