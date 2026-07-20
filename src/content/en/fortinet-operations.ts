import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'FortiGate - Operations and FortiSwitch/AP',
  duration: '10–12 hours',
  description:
    'HA, FortiAnalyzer, FortiSwitch/AP FortiLink, SD-WAN, logging, diagnose commands, operational runbooks — SMB production',
  sections: [
    {
      title: 'Operational model for SMB',
      content: `**Operating FortiGate** in an SMB office is not just “set it and forget it.” Regular processes:

| Process | Frequency | Responsible |
|---------|---------|---------------|
| Config backup verify | Daily (automated) | Sysadmin |
| Log review (VPN, deny, UTM) | Weekly | Security/Sysadmin |
| FortiGuard license check | Monthly | Sysadmin |
| Firmware security advisory | On release | Senior admin |
| Policy audit | Quarterly | Security |
| DR test (restore config) | Every six months | Sysadmin |
| Capacity review (CPU, sessions) | Quarterly | Sysadmin |

**Documentation (must-have):**
- Network diagram (physical + logical)
- IP plan (VLANs, subnets, DHCP)
- Policy matrix
- VPN onboarding/offboarding runbooks
- ISP contacts + SLA
- FortiCare contract + serial numbers
- Admin credentials in the password manager (not in the .conf file!)

**Monitoring stack SMB:**
- FortiGate → SNMP → Zabbix/Prometheus (CPU, sessions, WAN)
- Logs → FortiAnalyzer or syslog (Graylog/ELK)
- Alerts → email/Telegram/Slack webhook
- Uptime → external ping (UptimeRobot) to public IP`,
    },
    {
      title: 'High Availability: Active-Passive',
      content: `**HA (High Availability)** - two FortiGates work as a pair: the primary processes traffic, the secondary is in hot standby. In case of failure, primary → failover in 2–30 seconds.

**Active-Passive (SMB standard):**
- One active, one passive
- Shared virtual MAC / virtual IP on LAN interfaces
- Session table is synchronized (configurable)
- Identical models, firmware, licenses

**Requirements:**
- 2× FortiGate (same model: 2× FG-100F)
- Dedicated HA link (direct cable between HA ports or dedicated VLAN)
- Secondary license (not necessarily full UTM, but recommended)
- Same firmware version

**When HA is needed by SMB:**
- RTO < 5 min for internet/VPN
- No backup WAN (HA = hardware redundancy)
- Business critical: trading, medical, 24/7 operations

**When HA is NOT needed (acceptable risk):**
- Office 20–30 people, downtime 1h = acceptable
- There is backup 4G/LTE WAN + spare FG on shelf
- Budget constraint: HA pair FG-100F ≈ 2× cost

**HA alternative:** single FG-100F + cold spare FG-60F (restore config from backup). RTO ~1-2 hours.`,
    },
    {
      title: 'HA configuration and failover test',
      content: `**Setting up HA (GUI):** System → HA → Mode: Active-Passive.

| Setting | Value |
|---------|-------|
| Group Name | FG-HQ-HA |
| Group ID | 1 (unique per HA pair) |
| Priority | Primary: 200, Secondary: 100 |
| HA1 interface | dedicated port (direct cable) |
| Monitor interfaces | wan1, internal |
| Session Pickup | Enable (for TCP continuity) |
| Override | Enable on primary |

**Failover triggers:**
- Primary heartbeat lost
- Monitored interface down (wan1)
- Primary reboot / crash
- Manual failover (maintenance)

**Failover test (quarterly):**
1. Backup config
2. Notify users (brief VPN disconnect)
3. \\\`execute ha failover set 1\\\` on primary (force failover)
4. Verify: secondary becomes primary
5. Ping internet, VPN reconnect test
6. Failback: \\\`execute ha failover set 1\\\` on new secondary
7. Document results in change ticket

**Firmware upgrade to HA:**
1. Upgrade **secondary** first (becomes primary after failover)
2. Verify stability 24h
3. Upgrade remaining unit
4. Never upgrade both simultaneously`,
      code: {
        language: 'text',
        caption: 'CLI: HA status and manual failover',
        code: `get system ha status
diagnose sys ha status

# Manual failover to secondary
execute ha failover set 1

# Check which unit is primary
get system status | grep "Current HA mode"`,
      },
    },
    {
      title: 'FortiAnalyzer: architecture and setup',
      content: `**FortiAnalyzer** - centralized log management, reporting, compliance for Fortinet devices.

**Why SMB FortiAnalyzer:**
- Local FG disk: 7-30 days retention
- FortiAnalyzer: 90-365 days retention
- Advanced reports: top threats, VPN usage, bandwidth
- Compliance: PCI, ISO audit trail
- Correlation across FG + FortiSwitch + FortiAP

**Deployment options:**

| Option | Sizing SMB | Cost |
|--------|-----------|------|
| **FortiAnalyzer VM** | 50 GB/day logs | License by GB/day |
| **FortiAnalyzer hardware** | FAZ-200F | Higher cost |
| **Syslog alternative** | Graylog/ELK free | DIY maintenance |

**Setup FG → FAZ:**
1. FortiAnalyzer: add FortiGate device (serial number)
2. FortiGate: Log & Report → Log Settings → Send to FortiAnalyzer
3. IP: FAZ management IP, port 514 (OFTP) or 443
4. Log types: Traffic, Event, Security, VPN
5. Verify: FAZ → Device Manager → FG status green

**Disk sizing:** 50 users office ≈ 5-15 GB/day logs (depends on log verbosity). Plan 1TB for 90 days.`,
    },
    {
      title: 'Logging: local, FortiAnalyzer, syslog',
      content: `**Log types FortiGate:**

| Type | Content | Retention SMB |
|------|---------|---------------|
| **Traffic** | Forward/Local allowed/denied | 30-90 days |
| **Event** | System, admin, HA events | 90-365 days |
| **Security (UTM)** | AV, IPS, Web Filter blocks | 90-365 days |
| **VPN** | SSL/IPsec connect/disconnect | 365 days |
| **Anomaly** | DDoS, suspicious traffic | 90 days |

**Local disk logging:**
- Limited by FG disk (eMMC/SSD, 16-120 GB)
- Circular overwrite when full
- Good for: real-time troubleshooting
- Bad for: compliance, historical analysis

**Syslog forwarding (alternative to FAZ):**
- Log & Report → Log Settings → Send to Syslog Server
- Format: CSV or CEF (for SIEM)
- Target: Graylog, ELK, Splunk, Wazuh

**Log verbosity tuning:**
- «All sessions» only on: Guest, VPN, deny policies
- «Security events» on UTM policies
- «Disable» on high-volume trusted internal flows
- Prevents disk full and performance impact`,
      code: {
        language: 'text',
        caption: 'CLI: syslog forwarding',
        code: `config log syslogd setting
    set status enable
    set server "192.168.99.50"
    set port 514
    set format csv
    set facility local7
end

config log syslogd filter
    set severity information
    set forward-traffic enable
    set local-traffic enable
    set multicast-traffic disable
    set sniffer-traffic disable
    set anomaly enable
    set voip disable
    set dlp-archive disable
    set gtp disable
    set dns disable
    set ssh enable
    set ssl enable
end`,
      },
    },
    {
      title: 'Monitoring and alerts',
      content: `**SNMP monitoring (Zabbix/Prometheus):**

1. System → SNMP → Enable Agent v2c/v3
2. Community/host restrictions: MGMT VLAN only
3. Key OIDs: CPU, memory, session count, interface bandwidth

**Email alerts (built-in):**
- Log & Report → Alert Email → Configure SMTP
- System → Automation → Triggers:
  - Admin login failure (3+ attempts)
  - HA failover event
  - Disk usage > 80%
  - IPS critical signature match
  - License expiry < 30 days
  - VPN brute force (multiple failed SSL-VPN)

**External uptime monitoring:**
- UptimeRobot / Hetrix: ping public IP + HTTPS VPN portal
- Alert if down > 5 min

**Dashboard (FG GUI):**
- Customize widgets: CPU, sessions, WAN bandwidth, top applications
- FortiAnalyzer dashboards: VPN usage, threat map, compliance

**Weekly review checklist:**
- Top denied destinations (misconfigured app or attack?)
- Top UTM blocks (false positive?)
- VPN login failures (brute force?)
- Disk usage trend`,
    },
    {
      title: 'FortiSwitch and FortiLink',
      content: `**FortiSwitch** - managed switch managed by FortiGate via **FortiLink** protocol (proprietary, based on LLDP + CAPWAP-like).

**FortiLink for SMB benefits:**
- Single GUI (FG) for firewall + switching
- VLAN assignment from FG
- 802.1X authentication via FG
- QoS policies from FG
- Security Fabric integration

**Typical wiring:**
\\\`\\\`\\\`
FortiGate port X1 (FortiLink) ──trunk──► FortiSwitch 148F port 1
                                              │
                                    port 2-24: access VLANs
                                    port 25-28: uplink to 2nd switch
\\\`\\\`\\\`

**Setup steps:**
1. FG: WiFi & Switch Controller → FortiLink Interface → enable port
2. Connect FortiSwitch to FortiLink port
3. FG auto-discovers switch → authorize
4. Configure VLANs on FG → pushed to switch
5. Port assignment: VLAN 20 (workstations) on ports 1-16

**Models SMB:** FortiSwitch 108F (small), 148F-POE (standard office), 248E-POE (larger).

**Quarantine VLAN:** compromised device → auto-move to quarantine port/VLAN via EMS tag.`,
      code: {
        language: 'text',
        caption: 'CLI: FortiSwitch VLAN assignment',
        code: `config switch-controller managed-switch
    edit "FSW-148F-01"
        config ports
            edit "port1"
                set vlan "VLAN20-Workstations"
                set allowed-vlans "VLAN20-Workstations"
                set untagged-vlans "VLAN20-Workstations"
            next
            edit "port2"
                set vlan "VLAN30-VoIP"
                set allowed-vlans "VLAN30-VoIP"
            next
        end
    next
end`,
      },
    },
    {
      title: 'FortiAP and wireless controller',
      content: `**FortiAP** - Wi-Fi access point controlled by FortiGate (integrated wireless controller). Traffic: CAPWAP tunnel to FG or bridge mode.

**Deployment modes:**

| Mode | Traffic | When |
|------|--------|-------|
| **Tunnel** | Wi-Fi → CAPWAP → FG → VLAN | Default, centralized policy |
| **Bridge** | Local switching to AP | Remote office, low bandwidth WAN |
| **Mesh** | AP-to-AP wireless backhaul | No ethernet cabling |

**Setup:**
1. Connect FortiAP to FortiSwitch PoE port
2. FG discovers AP via FortiLink → authorize
3. WiFi & Switch Controller → SSIDs → Create:
   - Corp-WiFi: WPA2-Enterprise (802.1X) or WPA2-Personal
   - Guest-WiFi: WPA2-Personal, VLAN 60, captive portal
4. Assign SSID to AP profiles

**SSID design SMB:**

| SSID | Auth | VLAN | Notes |
|------|------|------|-------|
| Corp | WPA2-Enterprise (RADIUS) | 20 | AD credentials |
| Guest | WPA2-Personal (rotating PSK) | 60 | Isolated, bandwidth limit |
| IoT | WPA2-Personal (fixed PSK) | 70 | Smart devices, restricted |

**Models:** FortiAP 231F (office), 431F (high density), 831F (outdoor).

**RF optimization:** automatic channel selection, TX power adjustment. Review annually.`,
    },
    {
      title: 'SD-WAN: Basics for SMB',
      content: `**SD-WAN on FortiGate** - intelligent routing across multiple WAN links.

**SMB use case:** fiber (primary) + LTE (backup) → automatic failover + load balancing.

**Components:**
- **SD-WAN Zones:** group WAN interfaces (wan1 + wan2)
- **Performance SLA:** ping probes to 8.8.8.8, 1.1.1.1
- **SD-WAN Rules:** application-based routing
- **Health Check:** latency, jitter, packet loss thresholds

**Simple failover (start here):**
1. wan1: primary, distance 5
2. wan2: backup, distance 10
3. Link monitor: ping 8.8.8.8 via wan1, auto-failover to wan2

**Full SD-WAN (when ready):**
- SD-WAN Rules: VoIP → lowest latency WAN
- Video conferencing → best jitter WAN
- Bulk download → wan2 (LTE unlimited plan)
- Business apps → wan1 (fiber)

**GUI:** Network → SD-WAN → Zones, Performance SLAs, SD-WAN Rules.

**SD-WAN is not needed if:** one WAN, or backup WAN only for emergency (static route failover is enough).`,
      code: {
        language: 'text',
        caption: 'CLI: SD-WAN zone and performance SLA',
        code: `config system sdwan
    set status enable
    config zone
        edit "virtual-wan-link"
            set interface "wan1" "wan2"
        next
    end
    config health-check
        edit "Google-DNS"
            set server "8.8.8.8"
            set interval 1000
            set failtime 3
            set recoverytime 3
            set members 1 2
        next
    end
end`,
      },
    },
    {
      title: 'SD-WAN rules and SLA measurement',
      content: `**Performance SLA** measures the quality of each WAN:
- Latency (ms)
- Jitter (ms)
- Packet loss (%)

**Thresholds (typical):**
- Latency: < 100ms (good), > 300ms (bad)
- Jitter: < 30ms (good), > 50ms (bad)
- Packet loss: < 1% (good), > 5% (bad)

**SD-WAN Rule example:**
- Name: VoIP-Priority
- Source: ADDR-VoIP
- Application: SIP, RTP
- Strategy: Best Quality (lowest latency)
- SLA: Google-DNS health check

**Implicit rule:** all other traffic → load balance or primary preferred.

**Monitoring:** Network → SD-WAN → Performance → real-time SLA dashboard.

**LTE backup tips:**
- Set wan2 max bandwidth lower (prevent LTE overuse)
- Only failover, not load-balance (save data plan)
- Alert when on backup WAN (email notification)`,
    },
    {
      title: 'Backup, restore and disaster recovery',
      content: `**Backup strategy (3-2-1 rule adapted):**
- 3 copies: FG running config + automated backup + offline copy
- 2 media: FG disk + SFTP server
- 1 offsite: cloud storage (encrypted .conf)

**Automated backup:**
- System → Configuration → Backup Settings
- Schedule: daily 02:00
- Protocol: SCP/SFTP to 192.168.99.50
- Encrypt: YES (AES password in password manager)

**Pre-change backup (mandatory):**
\\\`\\\`\\\`
execute backup config scp fg-pre-CHG123.conf user@192.168.99.50:/backups/
\\\`\\\`\\\`

**Restore procedure:**
1. Identify last known good config
2. Maintenance window notification
3. System → Configuration → Restore (or CLI)
4. Verify: policies, VPN, interfaces, admin access
5. Test: internet, VPN, internal services
6. Document in ticket

**DR scenario — FG hardware failure:**
1. Obtain spare FG (same or compatible model)
2. Update firmware to match
3. Restore latest backup
4. Connect cables (same port mapping!)
5. Verify WAN IP (may need ISP coordination if static)
6. RTO target: 1-4 hours (with cold spare)

**Test restore quarterly** on VM or spare hardware.`,
      code: {
        language: 'text',
        caption: 'CLI: scheduled backup and restore',
        code: `config system auto-script
    edit "daily-backup"
        set interval 86400
        set repeat 0
        set start auto
        set script "execute backup config scp
            fg-$(date +%Y%m%d).conf backup@192.168.99.50:/fortigate/"
    next
end

# Manual restore
execute restore config scp fg-20260710.conf backup@192.168.99.50:/fortigate/`,
      },
    },
    {
      title: 'Firmware upgrade: production procedure',
      content: `**Firmware upgrade checklist:**

**Pre-upgrade (1 week before):**
- Read release notes: known issues, breaking changes
- Check Fortinet Community for bugs
- Verify FortiCare support active
- Full config backup
- Notify users (VPN disconnect during reboot)

**Upgrade steps (single FG):**
1. Backup config (encrypted)
2. Download firmware from support.fortinet.com
3. System → Firmware → Upload → Select image
4. Upgrade → FG reboots (~5-10 min)
5. Verify: version, VPN, policies, FortiLink devices
6. Monitor 24-48h: CPU, logs, user complaints

**HA upgrade:**
1. Upgrade secondary → becomes primary (failover)
2. Monitor 24h
3. Upgrade old primary (now secondary)
4. Failback if needed

**Rollback:**
- System → Firmware → boot alternate partition
- Or: restore previous firmware image
- Last resort: restore config on spare FG

**Never:** auto-upgrade firmware in production. Signature updates — yes. Firmware — controlled process only.`,
    },
    {
      title: 'Change control and ITSM integration',
      content: `**Change management for FortiGate:**

Every config change → ITSM ticket (Jira, ServiceNow, GLPI):

\\\`\\\`\\\`
CHG-2026-042: Add deny rule Guest→Servers
Requester: Security Officer
Risk: Low
Window: 2026-07-15 14:00 UTC+3
Rollback: delete policy ID 15
Pre-check: backup config
Post-check: Guest cannot ping 192.168.10.10
\\\`\\\`\\\`

**Change categories:**

| Risk | Examples | Approval |
|------|----------|----------|
| **Low** | Add address object, log setting | Sysadmin |
| **Medium** | New firewall policy, VPN user group | Team lead |
| **High** | Policy reorder, firmware upgrade, HA change | CTO + maintenance window |
| **Critical** | WAN config, admin access, disable UTM | CTO + written approval |

**Config annotation:** use \\\`set comments\\\` in CLI or description in GUI for traceability.

**Monthly change review:** list all CHG tickets → verify config matches documentation.`,
    },
    {
      title: 'Diagnosis commands: reference',
      content: `**Daily troubleshooting toolkit:**

**System health:**
\\\`\\\`\\\`
get system status
get system performance status
diagnose sys session stat
get hardware status
\\\`\\\`\\\`

**Network:**
\\\`\\\`\\\`
get system interface physical
get router info routing-table all
execute ping 8.8.8.8
execute traceroute 8.8.8.8
diagnose ip address list
\\\`\\\`\\\`

**Sessions:**
\\\`\\\`\\\`
diagnose sys session list
diagnose sys session filter src 192.168.20.50
diagnose sys session clear # be careful!
\\\`\\\`\\\`

**Firewall:**
\\\`\\\`\\\`
diagnose debug flow filter addr x.x.x.x
diagnose debug flow show function-name enable
diagnose debug enable
diagnose debug disable
\\\`\\\`\\\`

**VPN:**
\\\`\\\`\\\`
diagnose vpn ike gateway list
diagnose vpn tunnel list
diagnose vpn ssl list
\\\`\\\`\\\`

**DNS:**
\\\`\\\`\\\`
execute ping google.com
diagnose test application dns google.com
\\\`\\\`\\\`

**Disk/Memory:**
\\\`\\\`\\\`
diagnose sys top 5 10  # top processes
get system status | grep Disk
\\\`\\\`\\\`

**Important:** \\\`diagnose debug enable\\\` - CPU intensive. Always \\\`diagnose debug disable\\\` after.`,
    },
    {
      title: 'Runbook: no internet in the office',
      content: `**Runbook: P1 - full outage of the Internet in the office**

**Severity:** P1 | **RTO target:** 30 min

**Step 1 — Confirm scope (2 min):**
- Just office? Remote VPN users OK?
- All users or specific VLAN?
- Wired and Wi-Fi affected?

**Step 2 — FortiGate health (3 min):**
\\\`\\\`\\\`
get system status
get system interface physical
execute ping 8.8.8.8
execute ping 203.0.113.1  (ISP gateway)
\\\`\\\`\\\`

**Step 3 — WAN link (5 min):**
- wan1 status: up/down?
- ISP outage? Call ISP NOC
- Modem/ONT lights OK?
- Recent config change? (check CHG tickets)

**Step 4 — Failover (5 min):**
- If wan1 down → wan2 (LTE) should take over
- Manual: \\\`execute ping-options source <wan2-ip>\\\` + ping 8.8.8.8
- If failover failed: check SD-WAN/link monitor config

**Step 5 — Routing (3 min):**
\\\`\\\`\\\`
get router info routing-table all
\\\`\\\`\\\`
- Default route exists via correct WAN?
- Recent static route change?

**Step 6 — Policy (3 min):**
- Policy Lookup: workstation → 8.8.8.8
- Recent policy change blocking?

**Step 7 — DNS (2 min):**
- Ping 8.8.8.8 OK but google.com fails → DNS issue
- Check DNS settings, DC DNS health

**Step 8 — Escalate:**
- ISP ticket opened
- FortiCare TAC if FG issue
- Notify management if > 30 min

**Post-incident:** root cause analysis, update runbook.`,
    },
    {
      title: 'Runbook: high CPU and session table',
      content: `**Runbook: FortiGate CPU > 85% or slow performance**

**Step 1 — Identify load:**
\\\`\\\`\\\`
get system performance status
diagnose sys session stat
diagnose sys top 5 20 10
\\\`\\\`\\\`

**Step 2 — Session table:**
\\\`\\\`\\\`
diagnose sys session list
diagnose sys session filter dst 8.8.8.8
\\\`\\\`\\\`
- Session count near max? (FG-60F: 1.5M)
- Single IP with thousands of sessions? → possible DDoS or scan

**Step 3 — Top talkers:**
- FortiAnalyzer: Top Sources report
- Or: \\\`diagnose netlink interface list wan1\\\` (bandwidth)
- Single user torrenting? → App Control block
- Server compromised? → isolate VLAN

**Step 4 — UTM overload:**
- SSL inspection on all traffic? → selective
- IPS on internal traffic? → disable for trusted flows
- Log all sessions? → reduce verbosity

**Step 5 — DDoS mitigation:**
\\\`\\\`\\\`
config firewall DoS-policy
    edit 1
        set interface "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set service "ALL"
        config anomaly
            edit "tcp_syn_flood"
                set status enable
                set action block
                set threshold 2000
            next
        end
    next
end
\\\`\\\`\\\`

**Step 6 — Immediate relief:**
- Block offending IP (ban list)
- \\\`diagnose sys session filter src <bad-ip>\\\` + clear sessions
- Temporary: disable SSL inspection

**Long-term:** upgrade hardware, optimize UTM policies, rate limiting.`,
    },
    {
      title: 'Runbook: failover WAN and SD-WAN',
      content: `**Runbook: primary WAN down — verify backup active**

**Trigger:** ISP alert, monitoring down, or user complaints.

**Step 1 — Confirm wan1 down:**
\\\`\\\`\\\`
get system interface physical
execute ping 203.0.113.1
\\\`\\\`\\\`

**Step 2 — Check wan2 (LTE):**
\\\`\\\`\\\`
execute ping-options source <wan2-ip>
execute ping 8.8.8.8
get router info routing-table all
\\\`\\\`\\\`

**Step 3 — SD-WAN status:**
- Network → SD-WAN → Performance
- wan1 SLA: fail | wan2 SLA: pass
- Active interface: wan2?

**Step 4 — If failover NOT working:**
- Link monitor disabled? Re-enable
- wan2 route distance higher but wan1 still preferred (link up but no internet)?
- Fix: configure link monitor with action down

**Step 5 — Notify:**
- Email: «Office on LTE backup, limited bandwidth»
- ISP ticket for wan1

**Step 6 — Monitor LTE usage:**
- Data cap on LTE plan?
- Restrict non-critical traffic (YouTube, updates)

**Step 7 — wan1 restored:**
- Verify automatic failback
- If not: check recoverytime in health-check SLA
- Confirm primary route active

**Prevention:** monthly failover test (unplug wan1 cable, verify wan2 takes over in < 30s).`,
    },
    {
      title: 'Capacity planning and health checks',
      content: `**Quarterly capacity review:**

| Metric | FG-60F limit | Current | Action at 70% |
|--------|-------------|---------|---------------|
| Concurrent sessions | 1.5M | ? | Audit top talkers |
| CPU average | 100% | ? | UTM optimization |
| WAN bandwidth | 700 Mbps | ? | Upgrade ISP or FG |
| SSL-VPN users | 200 | ? | License check |
| Disk usage | 100% | ? | Log forwarding tuning |
| MAC table (FortiSwitch) | model dep. | ? | Add switches |

**Health check script (weekly automated):**
\\\`\\\`\\\`
#!/bin/bash
FG=192.168.99.1
ssh admin@$FG "
  get system status
  get system performance status
  diagnose sys session stat
" | mail -s "FG Weekly Health" admin@corp.local
\\\`\\\`\\\`

**Growth triggers for hardware upgrade:**
- Adding 2nd office (IPsec overhead)
- Enabling full SSL inspection company-wide
- Headcount > 80 on FG-60F
- SD-WAN with active load balancing
- Video surveillance VLAN (high bandwidth)

**FortiCare renewal:** 90 days before expiry — budget approval.`,
    },
    {
      title: 'Incident response for FortiGate',
      content: `**Security incident involving FortiGate:**

**Scenario 1: Compromised admin credentials**
1. Immediately disable admin account
2. Check Log & Report → Event → admin logins from unknown IPs
3. Review config changes (diff with last backup)
4. Rotate all passwords, regenerate FortiToken
5. Restrict admin to MGMT VLAN + VPN only
6. FortiCare TAC if config backdoor suspected

**Scenario 2: IPS alert — malware C2 from internal host**
1. Identify source IP from UTM log
2. Quarantine: EMS tag or manual VLAN move
3. Block C2 IP/domain at FG
4. Forensics on endpoint
5. Check lateral movement logs

**Scenario 3: VPN brute force**
1. Log & Report → VPN → failed logins
2. Enable geo-block on SSL-VPN if attacks from abroad
3. Rate limit SSL-VPN connections
4. Verify MFA enabled for all users
5. Block source IPs (temporary ban list)

**Scenario 4: Ransomware in progress**
1. Isolate affected VLAN (disable interface or deny policy)
2. Block known ransomware C2 (FortiGuard outbreak)
3. Preserve logs for forensics
4. Do NOT power off FG (need logs)
5. Activate DR plan

**Post-incident:** update policies, runbook, user training.`,
    },
    {
      title: 'FortiManager: deployment for multi-site SMB',
      content: `**When FortiManager is justified:**
- 3+ branches with identical base policies
- MSP managing client FortiGates
- Centralized FortiGuard updates for air-gapped sites
- Workflow approval for changes

**Deployment (FortiManager VM):**
1. Deploy FMG-VM (VMware/KVM, 4 GB RAM, 100 GB disk)
2. Add license, register FortiCare
3. Add ADOM (Administrative Domain) per customer/region
4. Add devices by serial number
5. Import config from existing FG (baseline)
6. Create Policy Package → assign to device group
7. Install policy package → push to FGs

**Policy Package workflow:**
\\\`\\\`\\\`
Draft policy → Validation → Approval → Install → Verify on FG
\\\`\\\`\\\`

**Without FMG (2-site SMB):**
- Script SCP backup from both FGs
- Git diff configs monthly
- Manual sync critical deny rules

**Sizing:** FMG-VM100G handles 10-30 devices for SMB.`,
      code: {
        language: 'text',
        caption: 'FortiGate: authorize FortiManager',
        code: `config system central-management
    set type fortimanager
    set fmg "<FMG_IP>"
    set serial-number "<FMG_SERIAL>"
end

execute central-mgmt register <FMG_IP> <FMG_SERIAL>`,
      },
    },
    {
      title: 'FortiAnalyzer: reporting and compliance',
      content: `**Essential FortiAnalyzer reports for SMB:**

| Report | Frequency | Purpose |
|--------|-----------|---------|
| VPN Usage Summary | Weekly | Capacity, abuse detection |
| Top Threats (UTM) | Weekly | IPS/AV blocks review |
| Bandwidth by Application | Monthly | Capacity planning |
| Policy Hit Count | Quarterly | Unused policy cleanup |
| Admin Activity | Weekly | Security audit |
| Compliance (PCI/ISO template) | Quarterly | Audit evidence |
| Failed Login (VPN/Admin) | Daily | Brute force detection |

**Create custom report:**
1. FortiAnalyzer → Reports → Report Definitions → Create
2. Data source: FortiGate logs
3. Filters: log type VPN, last 7 days
4. Schedule: email PDF every Monday 08:00

**Compliance templates:**
- PCI DSS: access logs, change logs, deny logs 90+ days
- ISO 27001: incident evidence, admin audit trail

**Disk management:** archive logs > 1 year to cold storage S3/NAS.`,
    },
    {
      title: 'SOC integration: syslog, CEF, SIEM',
      content: `**FortiGate → SOC pipeline:**

\\\`\\\`\\\`
FortiGate → (syslog CEF) → SIEM (Wazuh/Splunk/Elastic) → SOC analysts
         → (OFTP) → FortiAnalyzer → Compliance reports
\\\`\\\`\\\`

**Syslog CEF format (recommended for SIEM):**
\\\`\\\`\\\`
config log syslogd setting
    set format cef
    set server "<SIEM_IP>"
    set port 514
end
\\\`\\\`\\\`

**Key events to alert SOC:**
- IPS critical severity
- Admin login from unknown IP
- VPN login failure > 5/min
- HA failover
- Config change (event log)
- UTM block botnet from internal IP

**Wazuh integration:** FortiGate CEF rules included in Wazuh 4.x.

**FortiAnalyzer vs SIEM:** FAZ for Fortinet-native reports; SIEM for correlation with endpoints, AD, cloud.

**SMB starter:** Graylog free + CEF syslog from FG. Upgrade to Splunk when budget allows.`,
    },
    {
      title: 'HA failover test: formal procedure',
      content: `**Quarterly HA Failover Test Procedure**

**Pre-test (T-24h):**
- [ ] Change ticket approved
- [ ] Backup both HA units
- [ ] Notify users: brief VPN disconnect possible
- [ ] Confirm secondary is synchronized: \\\`get system ha status\\\`

**Test execution:**
1. Record primary serial: \\\`get system status\\\`
2. Verify active sessions baseline: \\\`diagnose sys session stat\\\`
3. **Force failover:** \\\`execute ha failover set 1\\\` on primary
4. T+0: verify secondary became primary (GUI banner, serial)
5. T+1min: ping test internet, internal, VPN reconnect
6. T+5min: check FortiLink switches/AP still managed
7. T+10min: **Failback:** failover again to restore original primary
8. T+15min: verify session pickup (TCP sessions continued)

**Success criteria:**
- Failover < 30 seconds
- Internet restored automatically
- VPN users reconnect without config change
- No FortiLink device deauthorization

**Document:** RTO measured, issues found, remediation tasks.

**If fail:** open FortiCare TAC case with \\\`diagnose sys ha status\\\` output.`,
      code: {
        language: 'text',
        caption: 'CLI: HA failover test commands',
        code: `get system ha status
diagnose sys ha status
diagnose sys session stat

execute ha failover set 1

# After test
get system ha status
diagnose sys session stat`,
      },
    },
    {
      title: 'Firmware upgrade: production runbook',
      content: `**Production Firmware Upgrade Runbook**

**T-7 days:**
- Read FortiOS release notes (7.4.x → target)
- Check Fortinet Community known issues
- Verify FortiCare active
- Test upgrade on lab FG VM identical config

**T-1 day:**
- Change ticket approved
- User notification (maintenance window)
- Encrypted config backup both HA units
- Confirm rollback: alternate partition or spare FG

**Upgrade sequence (HA pair):**
1. Upgrade **secondary** unit (will become primary after failover)
2. Wait failover automatic or force
3. Monitor 24h on new primary (ex-secondary)
4. Upgrade former primary (now secondary)
5. Optional failback to preferred primary

**Upgrade sequence (single FG):**
1. Backup config
2. Upload firmware image
3. Upgrade → 5-10 min reboot
4. Verify: version, VPN, policies, FortiLink
5. Monitor 48h

**Rollback triggers:**
- VPN completely broken > 15 min
- FortiLink mass disconnect
- CPU sustained > 95% post-upgrade
- Critical app broken (IPS false positive storm)

**Rollback action:** boot previous firmware partition or restore config on spare.`,
    },
    {
      title: 'RMA process: Fortinet hardware replacement',
      content: `**RMA (Return Merchandise Authorization) workflow:**

**Step 1 — Identify failure:**
- Hardware alarm: \\\`get hardware status\\\`
- TAC case if uncertain: support.fortinet.com
- Document: serial, symptoms, logs

**Step 2 — Open RMA:**
- FortiCare contract required
- TAC engineer may request: \\\`get system status\\\`, crash log
- RMA approved → replacement shipped (advance or return-first per contract)

**Step 3 — Prepare replacement:**
- **Do NOT factory reset failed unit until config exported**
- Backup config from failed unit (if accessible)
- Pre-config replacement: import backup, update serial-specific items

**Step 4 — Physical swap:**
- Same port mapping as failed unit
- Connect HA cable if HA pair (re-sync)
- Power on, verify license transfers (same contract)

**Step 5 — Post-RMA:**
- Register new serial in FortiCare (if changed)
- FortiAnalyzer: update device serial or re-add
- FortiManager: authorize new device
- Return failed unit per RMA label within 30 days

**Cold spare program:** keep FG-60F on shelf with last config backup. RTO 1-2h without waiting RMA shipping.`,
    },
    {
      title: 'Capacity planning: formulas and thresholds',
      content: `**Capacity formulas:**

**Concurrent sessions:**
\\\`\\\`\\\`
Estimated sessions = users × 50 (avg) + servers × 200
Headroom: estimated < 70% of datasheet max
FG-60F max: 1.5M → plan up to 1M sustained
\\\`\\\`\\\`

**UTM throughput:**
\\\`\\\`\\\`
Required = WAN_bandwidth × UTM_factor
UTM_factor = 1.0 (full UTM), 0.5 (partial SSL inspect), 0.3 (no SSL inspect)
Must be < 70% of Threat Protection throughput spec
\\\`\\\`\\\`

**SSL-VPN:**
\\\`\\\`\\\`
Concurrent_SSL = remote_workers × 0.6 (peak ratio)
Each user ~2-5 Mbps average
VPN_bandwidth = concurrent_SSL × 3 Mbps
\\\`\\\`\\\`

**Log volume:**
\\\`\\\`\\\`
GB/day ≈ users × 0.1 (light) to users × 0.3 (log all sessions)
FAZ disk = GB/day × retention_days × 1.3 (index overhead)
\\\`\\\`\\\`

**CPU thresholds:**
| Level | Action |
|-------|--------|
| < 50% avg | Healthy |
| 50-70% | Plan optimization |
| 70-85% | UTM tuning, upgrade plan |
| > 85% sustained | Upgrade hardware |

**Quarterly review template:** fill table in ticket, compare to last quarter trend.`,
    },
    {
      title: 'FortiOS 7.4 lab: operational baseline on VM',
      content: `**Extended lab (VMware/ESXi/KVM):**

**Part 1 — Logging (45 min):**
1. Deploy Graylog/syslog VM or FortiAnalyzer VM trial
2. Configure CEF/syslog forwarding from FG
3. Generate test events (admin login, policy deny)
4. Verify events in SIEM/FAZ

**Part 2 — Backup automation (30 min):**
1. SCP server in lab
2. Scheduled encrypted backup script
3. Test restore on second FG VM

**Part 3 — SD-WAN failover (45 min):**
1. Configure wan1 + wan2 (wan2 can be second vNIC to test network)
2. Health check + automatic failover
3. Unplug wan1, measure failover time

**Part 4 — HA (optional, 2 VM):**
1. HA Active-Passive between 2 FG VMs
2. Execute failover test procedure
3. Document RTO

**Part 5 — Monitoring (30 min):**
1. SNMP to Zabbix (optional)
2. Email alert on admin login fail
3. Weekly health check script via SSH

**Deliverable:** operational runbook PDF for lab FG.`,
    },
    {
      title: 'Directory diagnose/debug (Operations)',
      content: `**HA diagnostics:**
| Team | Destination |
|---------|------------|
| \\\`get system ha status\\\` | HA mode, priority |
| \\\`diagnose sys ha status\\\` | Detailed HA state |
| \\\`diagnose sys ha dump-by group\\\` | HA debug |
| \\\`execute ha failover set 1\\\` | Force failover |

**Logging diagnostics:**
| Team | Destination |
|---------|------------|
| \\\`execute log filter category 1\\\` | Filter event logs |
| \\\`diagnose test application syslogd 1\\\` | Test syslog connectivity |
| \\\`get log fortianalyzer\\\` | FAZ connection status |

**SD-WAN diagnostics:**
| Team | Destination |
|---------|------------|
| \\\`diagnose sys sdwan status\\\` | SD-WAN state |
| \\\`diagnose sys sdwan health-check\\\` | SLA results |

**FortiLink diagnostics:**
| Team | Destination |
|---------|------------|
| \\\`diagnose switch-controller switch-info\\\` | Managed switches |
| \\\`diagnose wireless-controller wlac -c sta\\\` | Connected APs/clients |

**Performance:**
| Team | Destination |
|---------|------------|
| \\\`diagnose sys top 5 20 10\\\` | CPU by process |
| \\\`diagnose netlink interface list wan1\\\` | Bandwidth per interface |
| \\\`diagnose debug crashlog read\\\` | Crash history |`,
    },
    {
      title: 'Production case study 1: FortiAnalyzer saved audit',
      content: `**Client:** payment processor, PCI DSS audit.

**Requirement:** 1 year firewall log retention, tamper-proof.

**Solution:**
- FortiAnalyzer 300F VM, 2 TB storage
- All internet + deny policies: log all sessions
- VPN + admin: log all events
- Scheduled PCI compliance report monthly
- Syslog copy to Wazuh for real-time alerts

**Audit result:** passed. Auditor reviewed FAZ reports for Q1-Q4.

**Cost of logging:** 25 GB/day → needed disk upgrade at month 8. Plan capacity upfront.

**Lesson:** enable selective logging first, expand after measuring GB/day for 2 weeks.`,
    },
    {
      title: 'Production case study 2: HA failover during power event',
      content: `**Client:** medical clinic, FG-100F HA pair.

**Event:** UPS failure, primary FG lost power.

**Result:**
- Secondary took over in 18 seconds
- VoIP calls dropped (3), reconnected
- VPN users auto-reconnected within 2 min
- No manual intervention

**Post-incident:**
- UPS replaced on both FGs
- HA monitor: add wan1 + internal + power sensor (SNMP on UPS)
- Quarterly failover test scheduled

**Lesson:** HA works if tested. First real failover was smooth because quarterly tests practiced procedure.`,
    },
    {
      title: 'Production case study 3: SOC detected insider threat',
      content: `**Client:** tech company, 70 users, Graylog SIEM + FG CEF syslog.

**Alert:** SOC rule triggered — mass download from file server at 02:00 via VPN.

**Investigation:**
- FAZ + Graylog: VPN user john.d@corp, SSL-VPN session
- Source IP: foreign country (geo anomaly)
- 50 GB SMB transfer in 2 hours

**Response:**
1. Disabled AD account
2. Revoked FortiToken
3. \\\`diagnose vpn ssl list\\\` → killed active session
4. EMS quarantine on endpoint (if online)

**Root cause:** compromised credentials (phishing). No MFA on that user.

**Remediation:** MFA enforced all VPN users within 48h. Geo-block SSL-VPN enabled.`,
    },
    {
      title: 'FAQ: 12 frequently asked questions (Operations)',
      content: `**1. FortiAnalyzer required?**
No, but syslog + 90 day retention minimum for audit.

**2. Is HA needed for 30-user office?**
Depends on RTO. Cold spare acceptable if RTO 2h OK.

**3. How often is firmware upgrade?**
Quarterly review, upgrade if security CVE. Not auto.

**4. SD-WAN vs static route failover?**
Static OK for simple backup WAN. SD-WAN for active monitoring.

**5. FortiManager vs manual backup?**
FMG at 3+ sites. Script backup for 1-2 sites.

**6. Log all sessions disk full?**
Yes on FG-60F. Forward to FAZ, reduce local retention.

**7. HA different models?**
No. Same model, same firmware required.

**8. RMA license transfer?**
Contract follows org; register new serial.

**9. FortiLink without FortiSwitch?**
FortiAP only possible on some setups. Typically both.

**10. SNMP v2c security?**
Restrict to MGMT VLAN, read-only, unique community.

**11. Config backup encryption password lost?**
Backup unrecoverable. Keep password in vault.

**12. SOC for 50-user SMB?**
Start with Graylog + basic alerts. Full SOC when budget allows.`,
    },
    {
      title: 'NSE4 exam topics: mapping (Operations)',
      content: `| NSE4 Domain | This chapter | Weight |
|-------------|--------------|--------|
| **High Availability** | A-P setup, failover | ~10% |
| **Logging/Monitoring** | FAZ, syslog, SNMP | ~10% |
| **FortiSwitch/AP** | FortiLink basics | ~5% |
| **SD-WAN** | Zones, SLA, rules | ~10% |
| **Troubleshooting** | diagnose commands | ~10% |
| **System maintenance** | Backup, firmware | ~10% |

**Exam focus:**
- HA status commands
- Log forwarding config
- SD-WAN simple failover
- Backup/restore procedure
- Interpret \\\`diagnose sys session stat\\\`

**Cross-chapter:** policies and VPN troubleshooting often combined in exam scenarios.`,
    },
    {
      title: 'Interview Q&A: 10 questions (Operations)',
      content: `**Q1: Active-Passive vs Active-Active HA?**
A: SMB uses A-P (one active). A-A needs session sync complexity, same for FortiGate SMB.

**Q2: HA failover triggers?**
A: Heartbeat loss, monitored interface down, manual failover, primary crash.

**Q3: FortiAnalyzer vs local logs?**
A: FAZ = long retention, reports, compliance. Local = short, real-time debug.

**Q4: FortiLink purpose?**
A: Manage FortiSwitch/FortiAP from FortiGate as single control plane.

**Q5: SD-WAN health check?**
A: Probe targets (8.8.8.8) measure latency/jitter/loss per WAN link.

**Q6: Pre-firmware upgrade must-do?**
A: Encrypted backup, read release notes, HA upgrade secondary first.

**Q7: RTO vs RPO for FG?**
A: RTO = time to restore service (HA: seconds, cold spare: hours). RPO = config backup frequency (daily typical).

**Q8: Session pickup in HA?**
A: Syncs TCP sessions to secondary for seamless failover. Enable for VoIP.

**Q9: How detect FG undersized?**
A: CPU > 70% sustained, session table > 70%, user complaints, SSL inspect disabled for perf.

**Q10: First step internet outage runbook?**
A: Confirm scope, check WAN link status, ping ISP gateway, check SD-WAN failover.`,
    },
    {
      title: 'Security Rating: hardening operations',
      content: `**Operations Security Rating findings:**

| Finding | Fix |
|---------|-----|
| No automated backup | Schedule daily SCP backup |
| No log forwarding | Configure FAZ or syslog |
| No NTP sync | Configure pool.ntp.org |
| HA not configured (critical site) | Evaluate HA or cold spare |
| No failover test documented | Quarterly HA test procedure |
| SNMP open to all | Restrict to NMGMT VLAN |
| No admin login alerting | Automation trigger on fail |
| FortiGuard updates manual only | Schedule daily updates |
| No disk monitoring | Alert disk > 80% |
| Default hostname | Set fg-site-role-01 |

**Operational maturity levels:**
- Level 1: manual backup, local logs
- Level 2: automated backup, syslog, monitoring
- Level 3: FAZ, HA, SOC integration, quarterly DR tests

**Target SMB production:** Level 2 minimum, Level 3 for regulated industries.`,
    },
    {
      title: 'Laboratory: operational baseline',
      content: `**Goal:** configure operational baseline on FortiGate VM.

**Steps:**

1. **Logging:** enable syslog to lab server (or FortiAnalyzer VM)
2. **Backup:** scheduled daily SCP backup
3. **SNMP:** enable for Zabbix (optional)
4. **Alerts:** email on admin login failure
5. **SD-WAN:** configure wan1 + wan2 failover with link monitor
6. **FortiSwitch (optional):** connect FSW VM, authorize via FortiLink
7. **Health check script:** SSH + collect status
8. **Runbooks:** write “no internet” 10-step checklist
9. **Failover test:** disable wan1, verify wan2 active
10. **Restore test:** backup → factory reset → restore

**Verification checklist:**
- [ ] Syslog receiving events
- [ ] Backup file on SCP server (encrypted)
- [ ] Email alert on failed login
- [ ] SD-WAN failover < 30 seconds
- [ ] Config restore successful
- [ ] Runbooks saved in ITSM/wiki

**Deliverable:** operational runbook document for your lab FG.`,
    },
  ],
  practice: [
    'Setting up syslog forwarding on Graylog/ELK in lab',
    'Create a scheduled encrypted backup on the SCP/SFTP server',
    'Email alerts setup: admin login fail, disk > 80%, HA failover',
    'Deploy FortiAnalyzer VM, connect FG, create VPN usage report',
    'SD-WAN setup: wan1 + wan2 with automatic failover, test',
    'Connect FortiSwitch to FG via FortiLink, assign VLANs to ports',
    'Create FortiAP SSID: Corp (VLAN20) + Guest (VLAN60)',
    'Perform HA failover test (2 VM in lab) according to formal procedure',
    'Runbook “no internet” - 10 steps with CLI, test in lab',
    'Runbook “CPU 100%” - diagnose commands, find top talker',
    'Quarterly capacity review: fill out the formulas for FG-60F',
    'Restore test: backup → factory reset VM → restore → verify',
    'FortiManager trial: add 2 FG VMs, push policy package',
    'SOC lab: CEF syslog in Wazuh/Graylog, create 3 alert rules',
    'FortiOS 7.4 lab: full operational baseline VMware/KVM/ESXi',
  ],
  resources: [
    { title: 'FortiAnalyzer Administration Guide', url: 'https://docs.fortinet.com/product/fortianalyzer' },
    { title: 'FortiManager Administration Guide', url: 'https://docs.fortinet.com/product/fortimanager' },
    { title: 'FortiGate HA Guide 7.4', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/357416/high-availability' },
    { title: 'FortiSwitch Managed by FortiGate', url: 'https://docs.fortinet.com/document/fortiswitch/7.4.0/fortilink-guide' },
    { title: 'FortiGate SD-WAN Guide', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/889544/sd-wan' },
    { title: 'FortiOS CLI Reference 7.4', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/cli-reference' },
    { title: 'FortiCare RMA Support', url: 'https://support.fortinet.com/' },
    { title: 'FortiGate Logging and Reporting', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/357896/log-and-report' },
  ],
  quiz: [
    {
      question: 'HA Active-Passive on FortiGate gives:',
      options: ['Failover when primary falls', 'Double throughput always', 'Free licenses'],
      answer: 'Failover when primary falls',
    },
    {
      question: 'FortiAnalyzer for:',
      options: ['Centralized logs and reports', 'Wi-Fi only', 'Prints only'],
      answer: 'Centralized logs and reports',
    },
    {
      question: 'FortiLink connects:',
      options: ['FortiGate and FortiSwitch', 'Only AP to the Internet', 'DC to printer'],
      answer: 'FortiGate and FortiSwitch',
    },
    {
      question: 'Before changing policy to FG:',
      options: ['Config backup', 'Factory reset', 'Remove all VLANs'],
      answer: 'Config backup',
    },
    {
      question: 'SD-WAN on FortiGate helps with:',
      options: ['Multi-WAN routing according to SLA', 'AD only', 'GPO only'],
      answer: 'Multi-WAN routing according to SLA',
    },
    {
      question: 'CPU 100% on FG - check:',
      options: ['Session table and UTM load', 'Cable only', 'DNS MX only'],
      answer: 'Session table and UTM load',
    },
  ],
}

export default translation
