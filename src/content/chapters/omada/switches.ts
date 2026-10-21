import type { Chapter } from '../../../types'

export const omadaSwitchesChapter: Chapter = {
  id: 'omada-switches-vlans',
  slug: 'omada-switches-vlans',
  title: 'Omada — коммутаторы и VLAN',
  moduleId: 'omada',
  order: 1,
  duration: '12–15 часов',
  level: 'intermediate',
  description:
    'SG3428, VLAN design, port profiles, PoE, LAG, STP, IGMP, storm control, ACL, SNMP, syslog, stack limits, CLI export и интеграция с Gateway',
  sections: [
    {
      title: 'Роль коммутатора в Omada SDN',
      content: `**Omada Switch** — managed L2/L2+ коммутатор, полностью управляемый из Controller. Конфигурация push-ится на устройство; локальный web UI switch доступен как fallback.

**Что настраивается из Controller:**
- VLAN membership (access/trunk)
- Port profiles (шаблоны портов)
- PoE budget и per-port power
- STP/RSTP, loop prevention
- LAG (link aggregation)
- L2 ACL, IGMP snooping, storm control
- Cable diagnostics
- Monitoring: traffic, errors, MAC table

**Что остаётся на Gateway (ER7206/ER8411):**
- Inter-VLAN routing (L3)
- DHCP server per VLAN
- Firewall между VLAN
- NAT в интернет

**Принцип:** switch = L2 fabric; gateway = L3 + security policy.

**Stacking note:** Omada switches **не поддерживают** stacking/chassis aggregation как Cisco StackWise. Redundancy через LAG + dual uplinks, не single logical switch.`,
    },
    {
      title: 'Модели: SG3428, SG3428MP, SG2210MP, SG3452P',
      content: `**SG3428** (24× GE + 4× SFP):
- Non-PoE core/distribution
- Switching capacity 56 Gbps
- Management через Controller или static IP VLAN 99
- SFP: 1G/2.5G модули

**SG3428MP** (24× PoE+ GE + 4× SFP):
- PoE budget **250 W**
- ~16 EAP670 max (без phones)

**SG2210MP** (8× PoE+ GE + 2× GE uplink):
- PoE budget **150 W**
- IDF closet: 3–4 AP + phones

**SG3452P** (48× PoE+ GE + 4× SFP+):
- PoE budget **384 W**
- Warehouse / large office access layer

**Таблица выбора:**

| Офис | Core | Access/IDF |
|------|------|------------|
| 20 чел, 1 этаж | SG3428MP | — |
| 50 чел, 2 этажа | SG3428 | 2× SG2210MP |
| 100 чел, 3 этажа | SG3428 + LAG | 3× SG2210MP |
| 100+ warehouse | 2× SG3428 LAG | 4× SG3428MP |`,
    },
    {
      title: 'VLAN design: эталонная схема SMB',
      content: `**Эталонная схема VLAN (офис 50–80 человек):**

| VLAN ID | Имя | Subnet | Назначение |
|---------|-----|--------|------------|
| 10 | SERVERS | 10.0.10.0/24 | DC, файловые, 1C, SQL |
| 20 | WORKSTATIONS | 10.0.20.0/24 | ПК, ноутбуки wired |
| 30 | VOIP | 10.0.30.0/24 | IP-телефоны |
| 50 | WIFI-CORP | 10.0.50.0/24 | Corporate SSID |
| 60 | WIFI-GUEST | 10.0.60.0/24 | Guest SSID + portal |
| 70 | PRINTERS | 10.0.70.0/24 | Принтеры, MFP |
| 99 | MGMT | 10.0.99.0/24 | Switches, AP, controller |

**Правила проектирования:**
- Не используй VLAN 1 для production traffic
- Management VLAN 99 — /24, static IP only
- Guest изолирован firewall на gateway
- VoIP отдельный VLAN для QoS
- Резервируй DHCP: servers static, workstations max 80% pool

**Связь с Wi‑Fi:** каждый SSID → свой VLAN; AP trunk несёт tagged VLAN 50, 60, 99.`,
    },
    {
      title: 'VLAN сценарии: voice VLAN (phone + PC)',
      content: `**Voice VLAN** — IP-телефон на access порту, PC daisy-chained через phone. Два VLAN на одном порту.

**Схема:**
\`\`\`
Switch port ──► IP Phone (VLAN 30 tagged voice)
                    └── PC (VLAN 20 untagged data)
\`\`\`

**Port Profile «Phone-PC»:**
1. Settings → Wired Networks → Profiles → Switch Port → Create
2. **Mode:** Custom
3. **Native/Untagged VLAN:** 20 (Workstations)
4. **Voice VLAN:** 30 (VoIP) — tagged automatically to phone via LLDP-MED
5. **Tagged VLANs:** 30

**Требования:**
- Phones support LLDP-MED or manual VLAN config on phone
- DHCP для VoIP scope на gateway VLAN 30
- QoS trust DSCP на switch port

**Alternative — separate ports:** phone VLAN 30 access, PC VLAN 20 access — проще troubleshoot, больше портов.

**Troubleshoot:** PC получает IP из VLAN 30 → native VLAN wrong; phone no dial tone → voice VLAN missing on trunk uplink.`,
    },
    {
      title: 'VLAN сценарии: IoT и cameras',
      content: `**IoT VLAN (VLAN 80):** smart sensors, HVAC, door locks — no internet by default, no access to corp.

**CCTV VLAN (VLAN 40):** IP cameras wired, multicast heavy, isolated from user VLANs.

**Design:**
| VLAN | Access | Internet | To Servers |
|------|--------|----------|------------|
| 40 CCTV | Switch ports only | Deny | Allow NVR IP only |
| 80 IoT | Switch/AP IoT SSID | Deny or limited | Deny |

**Firewall (gateway):**
- Deny 40 → Any except 10.0.10.50 (NVR)
- Deny 80 → RFC1918
- Allow 10.0.10.50 → 40 (NVR pulls streams)

**Switch config:**
- Camera ports: access VLAN 40, storm control enabled
- IGMP snooping enabled (see dedicated section)
- Disable unused ports

**IoT Wi‑Fi:** separate SSID «IoT-Net» VLAN 80, WPA2-Personal long PSK, no portal, client isolation ON.`,
    },
    {
      title: 'VLAN сценарии: DMZ и guest isolation',
      content: `**DMZ VLAN (VLAN 15):** public-facing servers behind reverse proxy, not on internal server VLAN.

\`\`\`
Internet → ER7206 → Port Forward 443 → Reverse Proxy (VLAN 15)
                                              └──► App servers (VLAN 10) restricted ports
\`\`\`

**Rules:**
- VLAN 15 → VLAN 10: allow only app ports (8080, 5432 from proxy IP)
- VLAN 10 → VLAN 15: deny (prevent lateral)
- VLAN 20/50 → VLAN 15: deny

**Guest VLAN 60 isolation (defense in depth):**
1. Switch: Guest only on Wi‑Fi AP trunk (no wired guest ports)
2. Gateway: Deny 60 → RFC1918 (rule #1 in ACL)
3. Gateway: Allow 60 → WAN DNS/HTTP/HTTPS only
4. Client isolation on SSID

**Verification script (from Guest client):**
\`\`\`bash
ping 10.0.10.1    # FAIL
ping 10.0.20.1    # FAIL
ping 8.8.8.8      # OK
nslookup google.com  # OK
\`\`\``,
    },
    {
      title: 'VLAN сценарии: management и native VLAN hardening',
      content: `**Management VLAN 99 best practices:**
- All switch management IPs in 10.0.99.0/24
- No DHCP on VLAN 99 (static only)
- Native VLAN on inter-switch trunks: either 99 or unused VLAN 999 (blackhole)
- Never use VLAN 1 as native on trunks

**Native VLAN debate:**
| Approach | Pro | Con |
|----------|-----|-----|
| Native 99 | Simple mgmt untagged | Slight info leak if misconfigured |
| All tagged + native 999 | Strict, no accidental access | More complex profiles |

**Switch management access:**
1. Devices → Switch → IP Settings → Static \`10.0.99.x/24\`, GW \`10.0.99.1\`
2. Verify ping from controller

**Disable VLAN 1 on all ports:** port profile PVID never 1; shutdown unused ports with default «Disabled» profile.

**802.1X on switch ports (where supported):** wired 802.1X for conference room ports — RADIUS auth before VLAN assignment.`,
    },
    {
      title: 'VLAN сценарии: dynamic VLAN и RADIUS',
      content: `**Dynamic VLAN assignment via RADIUS** — один wired port profile, VLAN assigned by NPS based on AD group.

**NPS attributes:**
- Tunnel-Type = VLAN
- Tunnel-Medium-Type = 802
- Tunnel-Private-Group-Id = 20 (or 30, 55, etc.)

**Omada switch:**
1. Port profile: 802.1X enabled (if firmware supports on model)
2. Fallback VLAN: 20 (guest wired port)
3. RADIUS server: NPS IP

**Use cases:**
- Hot-desk ports: IT group → VLAN 56, Sales → VLAN 55
- Contractor port: fallback VLAN 90 (internet only)

**Switch trunk consideration:** uplink trunks must carry ALL possible dynamic VLANs.

**Fallback:** RADIUS timeout → assign «Quarantine» VLAN 91 with captive portal only.`,
    },
    {
      title: 'Создание Wired Networks на Gateway',
      content: `**Cloud / Software Controller — одинаковый UI:**

1. **Settings → Wired Networks → LAN → Create New Network**
2. Поля:
   - **Name:** \`WORKSTATIONS\`
   - **VLAN ID:** \`20\`
   - **Gateway/Subnet:** \`10.0.20.1/24\`
   - **DHCP:** Enable
   - **Range:** \`10.0.20.100\` – \`10.0.20.250\`
   - **DNS:** \`10.0.10.5\` + \`8.8.8.8\`
3. **Save** → gateway создаст VLAN interface + DHCP
4. Повтори для VLAN 10, 30, 50, 60, 70, 99

**VLAN 99 (Management):**
- DHCP: Disable
- Gateway: \`10.0.99.1\`
- Static: SG3428 → \`10.0.99.2\`, Controller → \`10.0.99.10\`

**DHCP reservations:** Servers, printers, NVR — reserve by MAC in each scope.

**Verification:** ping gateway from each VLAN; \`ipconfig /all\` shows correct DNS suffix.`,
    },
    {
      title: 'Port Profiles: создание и применение',
      content: `**Port Profile** — шаблон настроек порта.

**Создание (Settings → Wired Networks → Profiles → Switch Port):**

| Profile | Mode | VLAN | Примечание |
|---------|------|------|------------|
| \`WS-Access\` | Access | 20 untagged | Рабочие места |
| \`Phone-PC\` | Custom | 20 + voice 30 | Phone + PC |
| \`AP-Trunk\` | Trunk | 50,60,99 tagged | Wi‑Fi VLAN |
| \`Uplink-Core\` | Trunk | All + native 99 | Между switches |
| \`Server-Access\` | Access | 10 | Серверная |
| \`CCTV-Access\` | Access | 40 | Камеры |
| \`Disabled\` | Access | 999 | Unused ports |

**Применение:**
1. Devices → Switches → SG3428 → Ports
2. Select ports → Batch Edit → Profile
3. Document mapping in spreadsheet

**Naming convention:** \`{TYPE}-{VLAN}-{LOCATION}\` e.g. \`AP-TRUNK-F1-IDF\`.`,
    },
    {
      title: 'Шаблон port mapping: 48-port switch',
      content: `**SG3452P / SG3428 extended — полный mapping template:**

| Sw Port | Patch Panel | Profile | VLAN | Endpoint | Notes |
|---------|-------------|---------|------|----------|-------|
| 1 | PP-1-01 | WS-Access | 20 | Desk-101 | |
| 2 | PP-1-02 | WS-Access | 20 | Desk-102 | |
| 3 | PP-1-03 | Phone-PC | 20/30 | Desk-103 | Phone+PC |
| 4 | PP-1-04 | AP-Trunk | 50,60,99 | AP-F1-01 | Ceiling |
| 5 | PP-1-05 | AP-Trunk | 50,60,99 | AP-F1-02 | |
| 6 | PP-1-06 | CCTV-Access | 40 | CAM-F1-01 | |
| 7–24 | PP-1-07–24 | WS-Access | 20 | Desks | |
| 25 | PP-1-25 | Server-Access | 10 | Server-01 | |
| 26 | PP-1-26 | Server-Access | 10 | Server-02 | |
| 27–28 | — | LAG-Uplink | All | SG3428-Core | LACP |
| 29–46 | PP-2-xx | WS-Access | 20 | Floor 2 | |
| 47 | — | AP-Trunk | 50,60,99 | AP-F1-03 | |
| 48 | — | Uplink-Core | All | ER7206 LAN | SFP preferred |
| SFP1 | — | Uplink-Core | All | Core-SG3428 | Fiber 1G |
| SFP2 | — | Disabled | — | Spare | |

**Color coding patch panel:** blue=workstation, red=server, yellow=AP, green=phone, orange=camera.

**Excel formula tip:** VLOOKUP patch panel label → auto-fill switch port for field techs.

**As-built:** update within 24h of any patch change; photo of rack + spreadsheet in Confluence.`,
    },
    {
      title: 'Access и Trunk порты: детальная настройка',
      content: `**Access port (один untagged VLAN):**
1. Devices → Switch → Port X → Edit
2. Profile: Access / WS-Access
3. **PVID:** 20
4. **Tagged VLANs:** none
5. Loop Prevention: Enable

**Trunk port (к AP):**
1. Profile: AP-Trunk
2. **Tagged:** 50, 60, 99 (+ 55, 56 if dynamic)
3. **Native:** none or 99 per design
4. VLAN **must match** SSID VLAN in Wireless Networks

**Trunk между switches:**
- Tagged: 10, 20, 30, 40, 50, 60, 70, 99
- Enable LAG if 2 cables

**Typical error:** AP trunk missing VLAN 50 → SSID Corp broken (associate but no DHCP).

**Verification:** Switch → Port → VLAN membership tab; AP → Connected Clients → VLAN column.`,
    },
    {
      title: 'Inter-VLAN routing и firewall на Gateway',
      content: `Omada Gateway = **router-on-a-stick** для всех Wired Networks VLAN.

**Traffic flow workstation → server:**
\`\`\`
PC 10.0.20.50 → GW 10.0.20.1 → route 10.0.10.0/24 → firewall → Server 10.0.10.20
\`\`\`

**Firewall ACL (Settings → Transmission → Firewall):**
1. Deny Guest (60) → RFC1918
2. Allow Workstations (20) → Servers (10): 445, 3389, 1433
3. Deny CCTV (40) → Internet
4. Allow Any LAN → WAN
5. Implicit deny

**Rule order:** first match wins. Deny Guest **above** Allow Any.

**Logging:** enable on deny rules for audit; rotate logs to avoid disk fill.

**Test matrix:** spreadsheet Source VLAN × Dest VLAN × Expected Result.`,
    },
    {
      title: 'PoE: budget, планирование и мониторинг',
      content: `**Стандарты PoE:**
- 802.3af (PoE): 15.4 W
- 802.3at (PoE+): 30 W
- 802.3bt (PoE++): 60–90 W (select models)

**EAP670:** PoE+ ~15 W typical, peak 18 W

**Расчёт Floor 1 (SG2210MP 150 W):**

| Device | Qty | W/ea | Sum |
|--------|-----|------|-----|
| EAP670 | 3 | 15 W | 45 W |
| IP Phone | 8 | 7 W | 56 W |
| **Total** | | | **101 W** |

Reserve: 49 W (~3 AP or 6 phones headroom)

**Monitoring:** Devices → Switch → PoE tab → Total Power, per-port.

**Overload:** Power Denied on port → add switch or disable PoE on unused ports.

**Budget planning tool:** sum(nameplate W × qty) × 1.2 safety factor ≤ switch PoE budget.`,
    },
    {
      title: 'LAG / Link Aggregation между switches',
      content: `**LAG purpose:** redundancy + aggregate bandwidth between SG3428 ↔ SG2210MP.

**Setup:**
1. Devices → SG3428 → LAG → Create → ports 27–28, LACP
2. Same on SG2210MP
3. Apply → wait sync

**Rules:**
- Cables diverse physical paths
- LACP mode (802.3ad)
- Max 8 ports per LAG
- **No LAG** to ER7206 LAN (usually unsupported)

**Test:** disconnect one cable → traffic continues; Insight → LAG Active.

**MLAG note:** Omada does NOT support MLAG — one LAG pair per two switches only, no multi-chassis LAG.`,
    },
    {
      title: 'Stack limitations и альтернативы redundancy',
      content: `**Omada switches — NO stacking:**
- No single logical switch ID
- No cross-switch LAG to one logical port (MC-LAG)
- Each switch managed individually in Controller

**Alternatives for redundancy:**

| Requirement | Solution |
|-------------|----------|
| Uplink redundancy | LAG between access ↔ core |
| Core redundancy | Dual core switches + STP root/backup |
| Gateway redundancy | Dual WAN failover (not switch stack) |
| Loop-free redundant L2 | RSTP with root on core |

**Dual core design (advanced SMB):**
\`\`\`
        [ER7206]
           |
    [SG3428-A]───LAG───[SG3428-B]
       /    \\         /    \\
   IDF-1   IDF-2   IDF-3  IDF-4
\`\`\`
- STP root: SG3428-A priority 4096
- STP backup root: SG3428-B priority 8192
- Inter-core LAG for VLAN trunk

**Cost trade-off:** second core switch vs downtime risk — for 100+ users, justify dual core.`,
    },
    {
      title: 'STP, RSTP и Loop Prevention',
      content: `**L2 loop** = broadcast storm in seconds.

**Omada defaults:** RSTP enabled, Loop Prevention on access ports.

**Recommendations:**
1. Root bridge = SG3428 core, priority **4096**
2. Access switches: default 32768
3. Loop Prevention: all access ports
4. BPDU Guard equivalent: block BPDU on access

**Never:** connect two switch ports together «for test».

**Diagnosis:** Insight → Loop Detected; port Blocking in STP view; MAC flapping.

**Recovery:** identify loop port → disable → fix cabling → re-enable.`,
    },
    {
      title: 'Multicast и IGMP snooping для камер',
      content: `**Problem:** 20 cameras multicast video → floods all VLAN 40 ports without IGMP snooping.

**IGMP Snooping (Devices → Switch → IGMP):**
1. Enable **IGMP Snooping** globally
2. Enable **IGMP Querier** on VLAN 40 (if no router querier)
3. Fast Leave: Enable for camera VLAN

**Architecture:**
\`\`\`
Cameras (multicast 239.x.x.x) → Switch IGMP Snoop → NVR joins group → only NVR port receives stream
\`\`\`

**Gateway:** typically no multicast routing needed if NVR and cameras same VLAN.

**Cross-VLAN multicast (avoid if possible):** requires IGMP proxy on gateway — limited Omada support; keep cameras + NVR same VLAN 40.

**Verify:** without snooping, all VLAN 40 ports show high RX; with snooping, only NVR port + camera ports active.

**Wi‑Fi multicast:** enable IGMP snooping on AP trunk; enable «Multicast Enhancement» on WLAN if available for Bonjour/mDNS.`,
    },
    {
      title: 'Storm control и broadcast protection',
      content: `**Storm Control** — rate-limit broadcast/multicast/unknown unicast per port.

**When to enable:**
- Access ports (workstations, phones)
- Camera ports (prevent camera malfunction flooding)
- Any port facing untrusted devices

**Configuration (Devices → Switch → Storm Control):**
| Port type | Broadcast threshold | Action |
|-----------|---------------------|--------|
| WS-Access | 500 pps | Shutdown port |
| AP-Trunk | 2000 pps | Alert only |
| Uplink | Disable storm ctrl | STP handles |

**Interaction with loops:** storm control is backup; STP/loop prevention is primary.

**False positive:** legitimate broadcast-heavy app (old protocols) → increase threshold or isolate app VLAN.

**Recovery:** err-disabled port → admin re-enable after fixing cause.

**DHCP snooping:** not universally available on Omada — use storm control + port security (MAC limit) as alternative.`,
    },
    {
      title: 'Cable diagnostics и физический уровень',
      content: `**Omada cable diagnostic (Devices → Switch → Port → Cable Test):**
- Tests pair continuity, length estimate, open/short
- Run remotely without field visit for initial triage

**Interpretation:**
| Result | Action |
|--------|--------|
| OK, length < 90m | Likely good |
| Open pair | Re-terminate or replace cable |
| Short | Check jack/patch panel |
| Length > 90m | Move IDF or add intermediate switch |

**Physical layer checklist:**
- CAT6 for new installs (not CAT5e for PoE+ runs)
- Max 90m channel + 10m patch cords
- Separate data/power from fluorescent ballasts
- PoE: 802.3at ports for EAP670

**SFP troubleshooting:**
- Compatible 1G/2.5G module list from TP-Link
- DOM diagnostics if module supports
- Clean fiber connectors (one dirty connector = intermittent link)

**Fluke alternative:** Omada diagnostic good for «is it the cable»; Fluke for certification documentation.`,
    },
    {
      title: 'QoS для VoIP на switch',
      content: `**VLAN 30 VoIP** needs priority at congestion.

**Switch QoS (Devices → Switch → QoS):**
1. Enable QoS
2. Trust Mode: DSCP (phones mark EF = 46)
3. Voice queue: highest priority
4. Phone-PC profile: voice VLAN 30

**Phone config:** enable DSCP for RTP streams.

**Test:** iperf flood on switch + concurrent VoIP call → MOS > 3.5.

**Limitation:** Omada QoS simpler than Cisco; adequate for 30 phones SMB.

**Wired + wireless VoIP:** prioritize both VLAN 30 wired and voice WLAN (see wireless chapter).`,
    },
    {
      title: 'L2 ACL на Omada Switch',
      content: `**L2 ACL** — MAC/VLAN filter at switch, not firewall replacement.

**Use cases:**
- Block specific MAC on port
- Restrict port to single expected MAC (port security lite)

**Create:** Devices → Switch → ACL → Deny src MAC → bind port.

**Inter-VLAN policy:** always on Gateway firewall.

**SMB rule:** 95% policies on gateway; switch ACL for exceptions only.`,
    },
    {
      title: 'Config export/import и CLI',
      content: `**Controller backup (.bin):** full network including all switches — primary DR method.

**Per-device export (Devices → Switch → Config → Export):**
- Text/JSON config snapshot
- Store in Git for change tracking

**CLI access (SSH after adopt):**
\`\`\`
# Connect: ssh admin@10.0.99.2 (Device Account creds)
show running-config
show vlan
show mac address-table
show poe status
show interface status

# Manual controller IP (pre-adopt)
set controller ip 10.0.99.10
\`\`\`

**Import:** Devices → Switch → Config → Import (lab/test only — risky in prod without review).

**GitOps pattern:**
1. Export config after approved change
2. Commit to \`network-configs/switch-SG3428-$(date).txt\`
3. PR review for audit trail

**Factory reset CLI:** \`reset\` → device returns Pending → re-adopt.

**Warning:** CLI changes may be overwritten by Controller provisioning — always change via Controller UI for persistence.`,
    },
    {
      title: 'SNMP мониторинг коммутаторов',
      content: `**Setup (Devices → Switch → Services → SNMP):**
1. SNMP v2c Enable (or v3 authPriv for security)
2. Community: unique string (not \`public\`)
3. Trap receiver: Zabbix/PRTG IP (UDP 162)
4. Location/Contact: fill for inventory

**Monitor OIDs:**
- ifOperStatus (link up/down)
- ifInOctets/ifOutOctets (traffic)
- PoE power consumption
- CPU/memory if available

**Zabbix:** community template «TP-Link» or LLD discovery on sysDescr.

**Alerts:**
- Uplink down > 1 min → P1
- PoE power > 90% budget → P2
- CRC errors increasing → P3 cable issue

**Security:** SNMP only from VLAN 99 monitoring server; firewall deny from user VLANs.`,
    },
    {
      title: 'Syslog: централизованные логи switch',
      content: `**Setup:**
1. Settings → Controller → Log → Syslog OR Devices → Switch → Log
2. Server: \`10.0.10.50\` (Graylog), Port 514 UDP
3. Level: Warning+ prod, Info for troubleshoot
4. Facility: local0

**Log events:**
- Link up/down
- STP topology change
- PoE fault
- Loop detected
- Admin login

**Graylog stream:** \`omada-switch\` filter \`source:10.0.99.*\`

**Alert:** uplink port down > 60 sec → Slack webhook.

**Retention:** 90 days minimum.`,
    },
    {
      title: 'Case study: кафе — switch layer',
      content: `**SG2210MP single switch design:**
- Port 1–2: EAP650 AP-Trunk (VLAN 50, 99)
- Port 3: POS wired access VLAN 20
- Port 4–5: Camera access VLAN 40
- Port 6: Printer VLAN 70
- Port 7–8: Spare disabled
- Port 9–10: Uplink to ER605

**PoE budget:** 2× EAP650 @ 13W = 26W of 150W — plenty.

**No inter-switch trunk needed.** Simple profiles only.

**Common mistake:** putting POS on Guest VLAN — breaks PCI segmentation; POS on staff VLAN 20 with firewall restrict.`,
    },
    {
      title: 'Case study: офис 50 — switch layer',
      content: `**Core SG3428 + 2× SG2210MP**

**SG3428 ports:**
- SFP1 → ER7206 LAN trunk all VLANs
- Port 1–2 → LAG to SG2210MP-F1
- Port 3–4 → LAG to SG2210MP-F2
- Port 5–8 → Server room access VLAN 10
- Remaining → spare/disabled

**Each SG2210MP:** 3 AP trunks, 8 WS, 5 Phone-PC, 2 VoIP-only, LAG uplink.

**STP root:** SG3428 priority 4096.

**IGMP:** enabled globally for future camera expansion to VLAN 40.

**Documentation deliverable:** 48-row port map per switch in Excel as-built.`,
    },
    {
      title: 'Case study: склад 100+ — switch layer',
      content: `**Dual SG3428 core LAG + 4× SG3428MP access**

**Design:**
- Core LAG interconnection + dual uplink to ER8411 (separate paths)
- Each warehouse zone: SG3428MP with 4 AP + 8 scanner chargers (wired)
- CCTV: dedicated ports VLAN 40, IGMP snooping, storm control 500pps
- Scanner VLAN 45: access ports only, no trunk to user areas

**Cable runs:** warehouse ceiling 8m — use wall-mount enclosures at 3m for AP home runs max 90m.

**Spare parts:** 1× SG2210MP on shelf, 2× pre-terminated fiber, 24× patch cords.

**Night rollout:** pre-stage configs in Controller profiles; swap switches during closed hours; verify via syslog streaming before opening.`,
    },
    {
      title: 'Firmware compatibility matrix (switches)',
      content: `| Controller | SG3428 | SG3428MP | SG2210MP | SG3452P |
|------------|--------|----------|----------|---------|
| 5.15.x | 1.0.x | 1.0.x | 1.0.x | 1.0.x |
| 5.14.x | 0.9.x+ | 0.9.x+ | 0.9.x+ | 0.9.x+ |

**Before upgrade:** backup .bin; upgrade one access switch first; verify port profiles apply; then core.

**Downgrade:** generally not supported on switches — plan forward-only.

**Mixed firmware in stack:** N/A (no stacking) — but mixed firmware in same site works if all ≥ minimum for controller.`,
    },
    {
      title: 'Security audit checklist (switches)',
      content: `**Switch security audit — quarterly:**

- [ ] All unused ports disabled or «Disabled» profile
- [ ] No ports on VLAN 1 for production
- [ ] Management IPs only in VLAN 99
- [ ] Device Account password rotated
- [ ] SNMP community not default; v3 if possible
- [ ] STP root correctly set on core
- [ ] No unauthorized MACs on server ports (MAC table review)
- [ ] Port map documentation current
- [ ] IGMP snooping enabled on camera VLAN
- [ ] Storm control on access ports
- [ ] Firmware N-1 or current stable
- [ ] Syslog receiving events (test link flap)
- [ ] LAG ports on diverse paths (physical audit)`,
    },
    {
      title: 'Lab walkthrough: VLAN и port profiles за 15 шагов',
      content: `**Цель:** на lab switch (or simulator docs) создать VLAN fabric end-to-end with Controller.

**Шаг 1.** Lab Controller running (from fundamentals lab).

**Шаг 2.** Adopt lab switch (or use existing) → verify Connected.

**Шаг 3.** Settings → Wired Networks → Create VLAN 20 LAB-WS \`192.168.20.1/24\` + DHCP.

**Шаг 4.** Create VLAN 50 LAB-WIFI \`192.168.50.1/24\` + DHCP.

**Шаг 5.** Create VLAN 99 LAB-MGMT — static only.

**Шаг 6.** Settings → Profiles → Switch Port → Create WS-Access VLAN 20.

**Шаг 7.** Create AP-Trunk tagged 50, 99.

**Шаг 8.** Create Uplink-Trunk all VLANs.

**Шаг 9.** Devices → Switch → assign port 1 WS-Access.

**Шаг 10.** Assign port 2 AP-Trunk (simulate AP).

**Шаг 11.** Assign port 3 Uplink (or loop to gateway LAN).

**Шаг 12.** Set switch static IP 192.168.99.2/24 VLAN 99.

**Шаг 13.** Firewall rule: deny Guest if created — test later with wireless lab.

**Шаг 14.** Connect test PC to port 1 → verify DHCP 192.168.20.x.

**Шаг 15.** Export switch config + screenshot port page → save to lab report.

**Windows note:** same UI steps; lab PC for test can be Windows with ipconfig verification.`,
    },
    {
      title: 'FAQ: 10 частых вопросов (switches)',
      content: `**1. Нужен ли L3 switch для inter-VLAN routing?**
Нет, Omada Gateway делает routing. L3 switch опционален для very large deployments.

**2. Сколько VLAN можно создать?**
Практически 50+ на gateway; помни про trunk must carry each VLAN to all switches/AP.

**3. Поддерживает ли SG3428 10G?**
SFP 1G/2.5G typically; не 10G SFP+ (check SG3452XP for 10G).

**4. Можно ли использовать non-Omada SFP modules?**
Third-party often works; TP-Link lists compatibility; test before bulk purchase.

**5. Что делать при loop?**
Disable suspect port immediately; check STP alerts; never leave loop «to see what happens».

**6. Как добавить VLAN на все trunks сразу?**
Edit Uplink profile tagged VLAN list → re-apply to all uplink ports batch.

**7. PoE passthrough между switches?**
Generally no — each switch needs direct PoE budget for its APs.

**8. Export config без Controller?**
Local switch web UI limited export; Controller is primary management plane.

**9. Voice VLAN без LLDP-MED?**
Manual VLAN config on each phone model — tedious but works.

**10. MAC flapping между портами?**
Loop or duplicate MAC device; check STP and disconnect one port.`,
    },
    {
      title: 'Troubleshooting encyclopedia (switches)',
      content: `| # | Симптом | Причина | Решение |
|---|---------|---------|---------|
| 1 | PC no IP | Wrong port VLAN / DHCP off | Check profile PVID, gateway DHCP |
| 2 | Wrong subnet IP | VLAN mismatch | Port VLAN vs DHCP scope |
| 3 | No cross-VLAN access | Firewall deny | Gateway ACL rules |
| 4 | AP Wi‑Fi broken | Trunk missing Wi‑Fi VLAN | Add VLAN 50,60 to AP trunk |
| 5 | Whole floor offline | Uplink down / STP block | LAG status, cable test |
| 6 | Intermittent link | Bad cable / CRC errors | Replace patch, cable diagnostic |
| 7 | New VLAN dead | Not on uplink trunk | Add VLAN to all trunks |
| 8 | Mgmt unreachable | Wrong IP VLAN | Static 10.0.99.x |
| 9 | PoE denied | Budget exceeded | Add switch, disable unused PoE |
| 10 | AP reboots | PoE af not at | Use PoE+ port |
| 11 | 100M not 1G | Damaged pairs | Re-terminate CAT6 |
| 12 | SFP down | Wrong module | Compatible SFP list |
| 13 | Camera flood | No IGMP snooping | Enable IGMP on VLAN 40 |
| 14 | Broadcast storm | Loop | STP, disable loop port |
| 15 | Phone wrong VLAN | Native VLAN error | Phone-PC profile |
| 16 | Config revert | CLI edit overwritten | Change via Controller |
| 17 | LAG not forming | LACP mismatch | Same ports/mode both sides |
| 18 | Port err-disabled | Storm control trip | Fix cause, re-enable |
| 19 | High latency VoIP | No QoS trust | Enable DSCP trust |
| 20 | MAC not learning | Port security / ACL | Check ACL bindings |`,
    },
    {
      title: 'Interview questions: Omada switches',
      content: `**8 вопросов для собеседования:**

**1.** Объясни разницу access vs trunk port. Как trunk к AP должен быть настроен для Corp + Guest SSID?

**2.** Как работает voice VLAN с PC daisy-chained через IP phone?

**3.** Почему Omada switches не stack и как ты обеспечишь redundancy без stacking?

**4.** IGMP snooping — зачем для IP cameras? Что happens без него?

**5.** Рассчитай PoE budget: 4× EAP670 + 12 phones на SG2210MP 150W — достаточно?

**6.** Опиши порядок troubleshooting «весь этаж offline».

**7.** Storm control vs STP — в чём разница и когда оба нужны?

**8.** Как документируешь port mapping для 48-port switch и зачем это ops team?

**Strong answer signals:** mentions gateway does L3, IGMP for multicast, LAG not to gateway, first-match firewall, patch panel as-built docs.`,
    },
    {
      title: 'Port security и MAC limiting',
      content: `**Port Security** — ограничение числа MAC на access порту для предотвращения unauthorized hub/switch подключений.

**Use cases:**
- Server ports: max 1 MAC (known server)
- Workstation ports: max 2 MAC (PC + occasional VM bridge)
- Conference room: max 10 MAC during events

**Omada configuration pattern:**
1. Devices → Switch → Port → Advanced → MAC Limit (if supported on firmware)
2. Alternative: L2 ACL allow only known MAC, deny others
3. Violation action: drop traffic or shutdown port

**Workflow нового сотрудника:**
- DHCP reservation optional
- First connect learns MAC automatically
- Document in port mapping spreadsheet

**Violation troubleshooting:**
- User brought own switch → explain policy, remove switch
- VM bridge duplicated MAC → increase limit to 2
- IP phone + PC = 2 MAC behind phone — use Phone-PC profile with limit 3

**Not a replacement for 802.1X** — combine where conference ports need AD auth + MAC limit fallback.`,
    },
    {
      title: 'Port mirroring для IDS и troubleshooting',
      content: `**Port Mirroring (SPAN)** — копия трафика uplink или suspect port на monitoring port для Wireshark/IDS.

**When useful:**
- Debug intermittent application on VLAN 20
- Temporary IDS sensor (Suricata) on dedicated port
- Compliance capture (short window, legal approval)

**Omada support:** check switch model/firmware — SG3428 may support mirror in local UI or CLI:
\`\`\`
# Example CLI pattern (verify on your firmware)
monitor session 1 source interface gigabitEthernet 1/0/1 both
monitor session 1 destination interface gigabitEthernet 1/0/48
\`\`\`

**Best practice:**
- Mirror only when needed — 1 Gbps mirror port saturates on busy uplink
- Disable after capture
- Never mirror Guest VLAN to unsecured laptop long-term

**Alternative without SPAN:** ER7206 firewall log + client-side tcpdump on server for app-layer issues.`,
    },
    {
      title: 'VLAN сценарии: printer isolation',
      content: `**Printers VLAN 70** — MFP часто становятся attack vector; изолируй от workstations direct access где возможно.

**Design:**
| Source | Dest Printers VLAN 70 | Ports |
|--------|----------------------|-------|
| Workstations 20 | Allow | 9100, 515, 631, 445 |
| Servers 10 | Allow | all (print server) |
| Guest 60 | Deny | any |
| Printers 70 | Internet | Deny (firmware updates via print server proxy) |

**Switch:** printer ports access VLAN 70, no trunk needed.

**Driver deployment:** users connect via print server \\\\print.company.local not direct IP — simplifies firewall.

**Wi‑Fi printing:** avoid — if required, Corp SSID only, firewall allow 50→70 ports listed.

**Scan-to-email MFP:** allow printer IP → SMTP server 10.0.10.25 port 587 only on gateway.`,
    },
    {
      title: 'CLI reference: команды для эксплуатации',
      content: `**SSH to switch (Device Account creds, VLAN 99 reachable):**

\`\`\`
# System info
show system
show version
show controller

# VLAN
show vlan
show vlan port

# Interfaces
show interface status
show interface counters

# MAC table
show mac address-table
show mac address-table interface gigabitEthernet 1/0/5

# PoE
show poe status
show poe interface gigabitEthernet 1/0/4

# STP
show spanning-tree
show spanning-tree interface

# LAG
show link-aggregation

# Cable test
test cable diagnostic interface gigabitEthernet 1/0/10

# Reboot
reload

# Factory reset (CAUTION)
reset
\`\`\`

**Pre-adoption (console):**
\`\`\`
set controller ip 10.0.99.10
set username admin password YourStrongPassword
\`\`\`

**Remember:** Controller provisioning overwrites manual CLI changes — prefer UI for persistent config.`,
    },
    {
      title: 'Мониторинг и алерты switch',
      content: `**Insight dashboard:** port utilization, error counters, MAC table, PoE status.

**Alerts (Settings → Notification):**
- Device Offline > 5 min
- Loop Detected → immediate
- PoE Exceeded → immediate
- Port errors threshold

**Weekly review:** top traffic ports, error ports, unused ports to disable.

**Integration:** syslog → Graylog → Slack/Telegram rules.

**Capacity planning:** port utilization > 60% sustained → plan upgrade; MAC table > 80% → investigate.`,
    },
  ],
  practice: [
    'Создай 7 VLAN в Omada Wired Networks: Servers, Workstations, VoIP, Corp Wi‑Fi, Guest, Printers, Management',
    'Создай 7 port profiles включая Phone-PC, AP-Trunk, CCTV — примени на lab switch',
    'Заполни полный 48-port mapping template для вымышленного офиса (минимум 48 строк)',
    'Настрой trunk к AP с VLAN 50, 60, 99 — проверь Wi‑Fi connect',
    'Рассчитай PoE budget: 4× EAP670 + 10 phones на SG2210MP — достаточно ли 150 W?',
    'Настрой LAG между двумя Omada switches и протестируй failover',
    'Включи IGMP snooping на VLAN камер и объясни multicast path',
    'Настрой storm control на access портах — threshold 500 pps',
    'Запусти cable diagnostic на 3 портах — задокументируй результаты',
    'Экспорт switch config через CLI show running-config и сохрани в Git',
    'Настрой RSTP: SG3428 root priority 4096 — verify topology',
    'Firewall: deny Guest → RFC1918 — ping test matrix из 4 VLAN',
    'SNMP snmpwalk на switch — минимум 5 OID',
    'Syslog в Graylog/docker — получи port up/down event',
    'Напиши runbook «Этаж offline» — 10 шагов диагностики uplink',
  ],
  resources: [
    { title: 'Omada Switch Configuration Guide', url: 'https://support.omadanetworks.com/us/document/108000/' },
    { title: 'SG3428 Product Page', url: 'https://www.tp-link.com/us/business-networking/omada-switch/sg3428/' },
    { title: 'SG3428MP PoE Switch', url: 'https://www.tp-link.com/us/business-networking/omada-switch/sg3428mp/' },
    { title: 'IEEE 802.1Q VLAN Overview', url: 'https://en.wikipedia.org/wiki/IEEE_802.1Q' },
    { title: 'Omada FAQ — VLAN', url: 'https://support.omadanetworks.com/us/document/108002/' },
    { title: 'IGMP Snooping Best Practices', url: 'https://support.omadanetworks.com/us/document/108002/' },
  ],
}
