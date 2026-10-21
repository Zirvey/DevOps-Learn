import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'TP-Link Omada — ecosystem overview',
  duration: '12–15 hours',
  description:
    'Omada Controller (Cloud, Software, Docker, OC200), Gateway ER7206/ER8411, adoption, API, multi-site, firmware, SMB topology, and platform selection',
  sections: [
    {
      title: 'What is Omada SDN',
      content: `**TP-Link Omada** is a software-defined network (SDN) for SMB and mid-market: a single controller manages routers, switches, and access points from one web UI.

**Ecosystem components:**
- **Omada Gateway** — routing, NAT, firewall, VPN, DHCP, DNS relay
- **Omada Switch** — L2/L3 switches with PoE, VLAN, STP, LAG
- **Omada EAP** — Wi‑Fi 6/6E/7 access points
- **Omada Controller** — management hub (Cloud, Software, Hardware OC200/OC300)

**Why Omada for a 20–150 person office:**
- Lower TCO than Cisco Meraki or FortiGate + FortiSwitch + FortiAP
- Unified UI with no subscription required for basic management
- Fast start: adoption in 15–30 minutes for a typical office
- VLAN, RADIUS, guest portal, and VPN supported out of the box

**Limitations:**
- Fewer UTM features than FortiGate (no full IPS/AV on the gateway)
- Enterprise features (fabric analytics, advanced SD-WAN) lag tier-1 vendors
- Documentation and support sometimes trail new firmware UI changes
- REST API is more limited than UniFi or Meraki Dashboard API`,
    },
    {
      title: 'Omada Gateway: ER7206 and ER8411',
      content: `**ER7206** — typical gateway for offices up to ~80 users:
- 1× Gigabit WAN + 1× SFP WAN (dual WAN)
- 5× Gigabit LAN
- Routing throughput ~900 Mbps (without UTM)
- IPsec/OpenVPN/L2TP VPN
- Built-in controller (limited device count — prefer a dedicated controller)

**ER8411** — for 80–200+ user offices or high-load branches:
- 2× 10G SFP+ WAN + 2× 2.5G LAN
- Higher throughput and VPN performance
- Suitable as a core router aggregating multiple VLANs

**Model selection:**

| Criterion | ER7206 | ER8411 |
|----------|--------|--------|
| Users | up to 80 | 80–200+ |
| WAN | 1G + SFP | 10G SFP+ |
| VPN users | ~16–20 concurrent | 50+ |
| Price | lower | higher |
| NAT throughput | ~900 Mbps | ~2+ Gbps |

**Recommendation:** ER7206 for a typical office; ER8411 if you have a 10G ISP uplink or heavy site-to-site VPN.

**ER605 / ER605W** — entry-level for small offices up to ~20 users; no SFP WAN, fewer VPN sessions.`,
    },
    {
      title: 'Omada switches: SG3428 and PoE lineup',
      content: `**SG3428** — 24× Gigabit + 4× SFP, managed L2+, no PoE:
- Core/distribution switch in the server room
- Uplink to gateway via SFP (fiber up to 10 km)
- LAG to a second switch for redundancy

**SG3428MP / SG2210MP** — PoE+ models for powering APs and IP phones:
- SG2210MP: 8× PoE+ ports, budget **150 W**
- SG3428MP: 24× PoE+, budget **250 W**
- SG3452P: 48× PoE+, budget **384 W** — for warehouse / large office

**PoE budget calculation (example: 2-floor office):**
- 6× EAP670 @ ~15 W = 90 W
- 12× IP phone @ 7 W = 84 W
- **Total: 174 W** → one SG2210MP (150 W) is not enough; need SG3428MP or a second PoE switch

**SG3428 as core:**
\`\`\`
ER7206 (LAN) ──► SG3428 (core)
                    ├── SG2210MP Floor1 (PoE → AP, phones)
                    ├── SG2210MP Floor2
                    └── SFP uplink → server room (servers VLAN)
\`\`\``,
    },
    {
      title: 'Access Points: EAP650 and EAP670',
      content: `**EAP650** — Wi‑Fi 6 (802.11ax), dual-band:
- 2×2 MU-MIMO on 5 GHz
- PoE draw: ~12–13 W
- Coverage: open office ~80–100 m² per AP (depends on walls)
- Good for meeting rooms, corridors, small open spaces

**EAP670** — Wi‑Fi 6, 4×4 on 5 GHz:
- Higher client density (30–40 per AP vs 20–25 on EAP650)
- PoE: ~15–16 W (needs PoE+, not af)
- Recommended for open space with 25+ staff per zone

**EAP773 / EAP783** — Wi‑Fi 7 for greenfield high-density projects.

**Planning comparison:**

| Parameter | EAP650 | EAP670 |
|----------|--------|--------|
| 5 GHz radios | 2×2 | 4×4 |
| Clients/AP | ~25 | ~40 |
| PoE | 802.3af (~13 W) | 802.3at (~15 W) |
| Price | lower | higher |

**SMB rule of thumb:** one AP per 60–80 m² open space or one per 2–3 meeting rooms; always plan wired ethernet (mesh is backup only).`,
    },
    {
      title: 'Omada Controller options',
      content: `| Type | Where it runs | Pros | Cons |
|-----|--------------|-------|--------|
| **Omada Cloud** | controller.omada.tplinkcloud.com | No server, remote access, auto-updates | Depends on internet and TP-Link cloud |
| **Software Controller** | Windows/Linux VM, Docker | Full control, local access | Needs server, backup, manual updates |
| **OC200 / OC300** | Rack appliance | Always-on, no VM dependency | Extra hardware, OC200 device limit |
| **Built-in on Gateway** | ER7206/ER8411 | No separate server | Limit ~10–20 devices, not for growth |

**Scenario recommendations:**
- **1 office, no server room:** Omada Cloud
- **Have a VM/mini PC:** Software Controller (Ubuntu 22.04 LTS, 2 vCPU, 4 GB RAM, 20 GB disk)
- **Multiple offices:** Cloud (multi-site) or Software + VPN to controller
- **Strict compliance (data not in cloud):** Software Controller on-prem
- **Docker homelab:** community/official Docker image on a Linux host

**Software Controller ports:** HTTPS **8043** (web UI), **29810–29814** (device adoption/management). Open them only from the Management VLAN.`,
    },
    {
      title: 'Decision tree: OC200 vs Cloud vs Software',
      content: `**Decision tree — choosing a controller platform:**

\`\`\`
Start
  │
  ├─ Config data must NOT live in the cloud?
  │     ├─ Yes → Have a VM/server?
  │     │         ├─ Yes → Software Controller (Ubuntu/Windows)
  │     │         └─ No → OC200/OC300 (appliance)
  │     └─ No → Need multi-site without VPN?
  │               ├─ Yes → Omada Cloud
  │               └─ No → Budget for OC200?
  │                         ├─ Yes → OC200 (up to ~100 devices)
  │                         └─ No → Omada Cloud (free)
  │
  └─ Only 1 gateway + 2 AP, no IT staff?
        └─ Built-in controller on ER7206 (temporary, up to 10–20 devices)
\`\`\`

**OC200 vs OC300:**

| Criterion | OC200 | OC300 |
|----------|-------|-------|
| Max devices | ~100 | ~500 |
| Form factor | Desktop | Rack 1U |
| Price | lower | higher |
| Backup | USB / controller export | USB + scheduled |
| When to choose | 1–2 offices, up to ~80 devices | MSP, campus, 100+ AP |

**Cloud vs Software for MSP:**
- Cloud: easier client onboarding, but depends on TP-Link ID
- Software: one controller per client in their DMZ — more control, more ops

**Migrating between types:** always via Backup → Restore (.bin file). Controller IP must match or you will need re-adopt.`,
    },
    {
      title: 'Installing Software Controller on Ubuntu',
      content: `**Requirements (production):**
- Ubuntu 22.04 LTS or 24.04 LTS
- 2 vCPU, 4 GB RAM (8 GB for 50+ devices)
- 20 GB disk (SSD preferred)
- Static IP in the Management VLAN

**Step-by-step install (.deb):**
1. Download the latest Omada Software Controller from tp-link.com/support
2. Install dependencies: \`sudo apt update && sudo apt install -y openjdk-17-jre-headless jhead\`
3. \`sudo dpkg -i Omada_SDN_Controller_v*.deb\`
4. On dependency errors: \`sudo apt -f install\`
5. \`sudo systemctl enable tpeap && sudo systemctl start tpeap\`
6. Verify: \`sudo systemctl status tpeap\`
7. Web UI: \`https://<server-ip>:8043\`
8. Wizard: admin password (16+ characters), timezone Europe/Moscow, country

**Firewall (ufw):**
\`\`\`bash
sudo ufw allow from 10.0.99.0/24 to any port 8043 proto tcp
sudo ufw allow from 10.0.99.0/24 to any port 29810:29814 proto tcp
sudo ufw allow from 10.0.99.0/24 to any port 29810:29814 proto udp
\`\`\`

**Post-install:**
1. **Settings → Controller → Controller Hostname/IP** — static IP (not DHCP!)
2. **Settings → Maintenance → Backup** — scheduled weekly
3. **Settings → Site → Device Account** — change the default password

**Logs:** \`/opt/tplink/EAPController/logs/\` — for adoption issues check \`server.log\`.`,
    },
    {
      title: 'Installing Software Controller on Windows',
      content: `**Requirements:**
- Windows Server 2019/2022 or Windows 10/11 Pro
- Java JRE 17 (installer often includes a bundled runtime)
- 4 GB RAM, 20 GB disk
- Static IP; Windows Defender exclusion for the install path

**Step-by-step install:**
1. Download the Windows installer from tp-link.com
2. Run as Administrator → choose path (D:\\Omada, not C:\\Program Files for logs)
3. Installer creates Windows Service «Omada Controller»
4. Browser → \`https://<server-ip>:8043\`
5. Accept the self-signed cert (or install a proper cert later)
6. Wizard: password, timezone, country

**Windows Firewall:**
\`\`\`powershell
New-NetFirewallRule -DisplayName "Omada Web" -Direction Inbound -LocalPort 8043 -Protocol TCP -Action Allow -RemoteAddress 10.0.99.0/24
New-NetFirewallRule -DisplayName "Omada Adoption" -Direction Inbound -LocalPort 29810-29814 -Protocol TCP -Action Allow -RemoteAddress 10.0.99.0/24
\`\`\`

**Service management:**
- services.msc → «Omada Controller» → Automatic (Delayed Start)
- After reboot: wait 2–3 minutes for the UI to be ready

**Upgrading on Windows:**
1. Backup config
2. Stop service
3. Run new installer (upgrade in place)
4. Start service, verify devices reconnect

**Common mistake:** server on DHCP — after renew the IP changes and all devices go offline until you restore the IP or re-adopt.`,
    },
    {
      title: 'Docker: installing Omada Controller',
      content: `**When to use Docker:** homelab, DevOps team, quick disposable lab, CI for network automation tests.

**Official vs community image:** TP-Link periodically publishes Docker instructions; check the current tag on the support portal. Community image \`mbentley/omada-controller\` is popular in homelab (not official TP-Link support for production).

**Example docker-compose (community pattern):**
\`\`\`yaml
services:
  omada-controller:
    image: mbentley/omada-controller:5.15
    container_name: omada
    network_mode: host
    environment:
      PUID: 508
      PGID: 508
      MANAGE_HTTP_PORT: 8088
      MANAGE_HTTPS_PORT: 8043
      PORT_APP_DISCOVERY: 27001
      PORT_ADOPT_V1: 29812
      PORT_UPGRADE_V1: 29813
      PORT_MANAGER_V1: 29811
      PORT_MANAGER_V2: 29814
      PORT_DISCOVERY: 29810
      SHOW_SERVER_LOGS: "true"
    volumes:
      - omada-data:/opt/tplink/EAPController/data
      - omada-work:/opt/tplink/EAPController/work
      - omada-logs:/opt/tplink/EAPController/logs
volumes:
  omada-data:
  omada-work:
  omada-logs:
\`\`\`

**Important for Docker:**
- \`network_mode: host\` — discovery/adoption is more reliable than bridge NAT
- Volumes are mandatory — without them you lose config on container recreate
- Backup: copy the volume + export .bin from the UI
- Upgrade: pull new tag, recreate container, verify version match with device firmware

**Production caveat:** for production SMB prefer .deb on bare metal/VM — easier support tickets and predictable reboot behavior.`,
    },
    {
      title: 'Omada Cloud: registration and first Site',
      content: `**Step-by-step Omada Cloud workflow:**
1. Open https://omada.tplinkcloud.com or https://controller.omada.tplinkcloud.com
2. Create a TP-Link ID (or sign in with an existing one)
3. **Add New Controller** → choose **Cloud-Based** (not Local)
4. Create a Site: name, timezone (Europe/Moscow), country
5. Empty dashboard → proceed to device adoption

**Cloud UI differences from Software:**
- No access to the server filesystem
- Backup: **Settings → Maintenance → Backup & Restore** → Download
- Controller updates are automatic (check release notes)
- Bound to TP-Link ID — losing account access = losing management

**Migrating Cloud → Software (or reverse):**
1. Export backup from the current controller
2. Install the new controller
3. **Maintenance → Restore** → upload the .bin file
4. Devices will reconnect (re-adopt may be needed if controller IP changed)

**Cloud security:**
- Enable 2FA on the TP-Link ID
- Limit the admin user list
- Do not use a shared admin account
- Regularly download an offline backup (.bin) — do not rely on the cloud alone`,
    },
    {
      title: 'Multi-site: managing multiple locations',
      content: `**Omada Cloud multi-site (recommended for branches):**
1. One TP-Link ID → multiple Sites in one Cloud controller
2. **Settings → Site** → Add Site → «Office-Kazan», «Office-Moscow»
3. Switch site via the dropdown in the upper-left UI corner
4. Each site has isolated config (VLAN, SSID, devices)
5. Gateway at each branch is adopted into its own site

**Software Controller multi-site:**
- One controller instance supports multiple sites
- **Settings → Site → Create New Site**
- On adoption, the device binds to the active site
- Before adoption, confirm the correct site is selected!

**Centralized management without Cloud:**
\`\`\`
HQ Software Controller (10.0.99.10)
    │
    ├── Site: HQ-Moscow (local L2/L3)
    │
    └── Site: Branch-Kazan
            └── IPsec tunnel → devices in Kazan adopted through the tunnel
\`\`\`

**L3 adoption for a branch:** DHCP Option 138 points to the controller IP over the VPN tunnel; or a local OC200 at the branch with periodic backup to HQ NAS.

**MSP model:**
- Separate Site per customer (naming: CLIENT-001-Office)
- Operator role for NOC, Admin for break-glass only
- Scheduled backup per site → encrypted storage

**Limitations:** no unified cross-site dashboard analytics like Meraki; Insight is per site. API (Open API) is per controller, not federated.`,
    },
    {
      title: 'Omada Open API: automation overview',
      content: `**Omada Open API** — REST API for Software Controller (v5+). Automates inventory, monitoring, and bulk config.

**Enabling the API:**
1. **Settings → Platform Integration → Open API**
2. Create Application → Client ID + Client Secret
3. Grant scopes: read devices, read clients, (write — use carefully)
4. Controller URL: \`https://<controller-ip>:8043\`

**Authentication (OAuth2-style):**
\`\`\`bash
# 1. Login — obtain access token
curl -k -X POST "https://10.0.99.10:8043/openapi/v1/login" \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"YOUR_PASSWORD"}'

# 2. Authorize application
curl -k -X POST "https://10.0.99.10:8043/openapi/v1/authorize" \\
  -H "Content-Type: application/json" \\
  -d '{"clientId":"YOUR_CLIENT_ID","clientSecret":"YOUR_SECRET"}'

# 3. Get device list (site-id from the UI URL)
curl -k "https://10.0.99.10:8043/openapi/v1/sites/SITE_ID/devices" \\
  -H "Authorization: AccessToken=YOUR_TOKEN"
\`\`\`

**Typical use cases:**
- Daily device inventory export to CMDB
- Alerting: webhook when a device is offline (API polling)
- Bulk firmware check before a maintenance window
- Integration with Ansible/Terraform (community modules)

**API limitations:**
- Not all UI actions are available via API
- Cloud controller API differs / is limited
- Rate limits are not clearly documented — do not poll more than 1/min per site
- Write operations are risky without change control

**Security:** API credentials = admin-level; store in a vault, rotate quarterly; do not expose 8043 to the internet.`,
    },
    {
      title: 'Controller UI navigation',
      content: `**Main sections (Software and Cloud are the same):**

| Menu | Purpose |
|------|------------|
| **Dashboard** | Network status, device map, alerts |
| **Devices** | Gateway, Switches, AP — adopt, firmware, config |
| **Clients** | Connected clients, blocking, history |
| **Insight** | Traffic, top clients, health |
| **Settings → Wired Networks** | LAN, VLAN, DHCP on gateway |
| **Settings → Wireless Networks** | SSID, security, portal |
| **Settings → Authentication** | RADIUS profiles, portal users |
| **Settings → Transmission** | Firewall, NAT, VPN, routing |
| **Settings → Site** | Site name, device password |
| **Settings → Platform Integration** | Open API, webhooks |
| **Logs** | System, WLAN, operation logs |

**Typical change workflow:**
1. Find the setting under Settings
2. Make the change → **Save**
3. Check the **Pending** badge — sometimes you need **Apply** on the device
4. **Devices → select device → Config → Provisioning** — sync status

**Pro tip:** before bulk changes — **Maintenance → Backup**. The controller pushes config to devices asynchronously; wait 1–2 minutes and verify «Connected» on all devices.

**Global View (Cloud):** switch between sites; no unified alerting across sites in one view — check each site.`,
    },
    {
      title: 'Device adoption: L2 workflow',
      content: `**L2 adoption** — device and controller share one broadcast domain (same VLAN/L2 segment).

**Preparation:**
1. Connect gateway WAN to the internet; LAN to Management VLAN or default LAN
2. Controller is reachable by IP from that same network
3. Connect switch/AP to a PoE switch on that same network

**Software Controller — step by step:**
1. Power on the device, wait for boot (LED slow blink)
2. Controller → **Devices** → **Pending** tab
3. Device appears with MAC and model → **Adopt**
4. Status: Adopting → Configuring → **Connected** (2–5 minutes)
5. Set **Device Password** (Settings → Site → Device Account) before adoption — shared password for SSH/CLI

**Cloud Controller:**
1. Ensure the device can reach \`*.tplinkcloud.com\` (DNS + HTTPS 443)
2. Same workflow: Devices → Pending → Adopt

**Batch adoption:**
- Select All Pending → Adopt — for initial rollout
- Order: Gateway first → Core switch → Access switches → AP last

**If the device is not in Pending:**
- Check firmware (too old may not support the current controller)
- Factory reset: hold reset 10 sec → back to Pending
- Confirm there is no second controller on the network (conflict)`,
    },
    {
      title: 'L3 Adoption: DHCP Option 138 and DNS',
      content: `When the controller is on a **different subnet** (typically Management VLAN 99, devices on VLAN 1 at first power-on), you need **L3 adoption**.

**Method 1 — DHCP Option 138 (recommended):**
1. On the DHCP server (Windows DC or Omada Gateway) add the option:
   - **Option 138** = Omada Controller IP address
2. For the scope where new devices land: enable option 138
3. On DHCP the device receives the controller address → appears in Pending

**Windows DHCP:**
1. DHCP Manager → Scope Options → Configure Options
2. Predefined: **TP-Link Omada Controller** (138) or Custom
3. IP: \`192.168.99.10\` (example controller)

**Omada Gateway DHCP Option 138:**
1. Settings → Wired Networks → LAN → Edit network
2. DHCP → Advanced → Custom Options → Option 138 → Controller IP

**Method 2 — DNS:**
1. Create DNS A-record: \`omada.company.local\` → controller IP
2. Some firmwares resolve omada.tplinkcloud.com locally via DNS override

**Method 3 — SSH (manual, for single devices):**
\`\`\`
# On switch/AP via console or pre-adoption IP
set controller ip 192.168.99.10
\`\`\`

**Method 4 — Inform URL (legacy UniFi-style, rare on Omada):**
- Not directly applicable; use Option 138

**After L3 adoption:** move device management into VLAN 99 via switch port profile.`,
    },
    {
      title: 'Firmware: update policy',
      content: `**Update order (critical!):**
1. **Controller** (Software) — first
2. **Gateway** — second
3. **Switches** — one at a time, starting with access layer
4. **AP** — last (brief Wi‑Fi disconnect)

**UI workflow:**
1. **Settings → Maintenance → Firmware** or **Devices → select → Upgrade**
2. Check release notes on omadanetworks.com
3. Choose **Schedule upgrade** → maintenance window (Sunday 02:00)
4. For bulk: **Devices → Select All Switches → Batch Upgrade**

**SMB policy:**
- Do not update on Friday
- Keep one rollback image — previous controller backup
- Pilot on one AP/switch before mass rollout
- Document versions in an inventory table
- N-1 policy: stay on stable release, not bleeding-edge day-0

**Pre-upgrade checklist:**
- [ ] Backup controller (.bin)
- [ ] Verify disk space on controller server
- [ ] Notify users (AP reboot = Wi‑Fi blip ~2 min)
- [ ] Confirm maintenance window with business
- [ ] One device pilot group (1 AP + 1 switch)

**Rollback:** Omada rarely supports device downgrade; for the controller — restore a previous-version backup.`,
    },
    {
      title: 'Firmware compatibility matrix',
      content: `**Compatibility rule:** Controller version must be **≥** device firmware versions. Controller first, always.

**Typical matrix (verify release notes — versions change):**

| Controller | Gateway ER7206 | Switch SG3428 | AP EAP670 | Note |
|------------|----------------|---------------|-----------|------------|
| 5.15.x | 1.3.x | 1.0.x | 1.0.x | Stable combo 2025 |
| 5.14.x | 1.2.x | 1.0.x | 1.0.x | Previous stable |
| 5.13.x | 1.2.x | 0.9.x | 0.9.x | Upgrade path to 5.15 |

**Incompatibility symptoms:**
- Device in Pending but adopt fails instantly
- «Connected» but provisioning spins forever
- Missing features in UI (new function not visible)
- API endpoints return 404 after controller upgrade without device upgrade

**Checking versions:**
1. **Settings → Maintenance → Controller Info** — version
2. **Devices → each device → Info** — firmware
3. Export inventory spreadsheet monthly

**Greenfield deployment:** install latest stable controller → adopt devices on factory firmware → batch upgrade devices to match.

**Mixed fleet (EAP650 + EAP670 + EAP773):** one controller manages all; RF features differ by model — do not assume feature parity.

**EOL devices:** older EAP245/EAP225 may not support Controller 5.15+ — check the compatibility list before buying used hardware.`,
    },
    {
      title: 'Typical SMB office topology (50 people)',
      content: `**Scenario:** 2 floors, 50 desks, 6 AP, IP telephony, guest Wi‑Fi, server room.

\`\`\`
                    Internet (fiber)
                         │
                    [ ER7206 ]
                    WAN1 │ LAN (trunk)
                         │
                  [ SG3428 core ]
                   /    |     \\
            SFP/uplink  │      \\
                  [SG2210MP]  [SG2210MP]
                   Floor 1     Floor 2
                   AP×3        AP×3
                   Phones×12   Phones×13
                         │
                  [ Servers / DC ]
                  VLAN 10
\`\`\`

**VLAN plan:**

| VLAN | Purpose | Subnet | Gateway |
|------|------------|--------|---------|
| 10 | Servers | 10.0.10.0/24 | 10.0.10.1 |
| 20 | Workstations | 10.0.20.0/24 | 10.0.20.1 |
| 30 | VoIP | 10.0.30.0/24 | 10.0.30.1 |
| 50 | Corp Wi‑Fi | 10.0.50.0/24 | 10.0.50.1 |
| 60 | Guest Wi‑Fi | 10.0.60.0/24 | 10.0.60.1 |
| 99 | Management | 10.0.99.0/24 | 10.0.99.1 |

**Controller:** Software on a VM in VLAN 99 (\`10.0.99.10\`).

**Management VLAN IP plan:**
| Device | IP |
|--------|-----|
| ER7206 | 10.0.99.1 |
| SG3428 | 10.0.99.2 |
| SG2210MP-F1 | 10.0.99.3 |
| SG2210MP-F2 | 10.0.99.4 |
| Controller | 10.0.99.10 |

**Cabling discipline:** every AP is a home run to the IDF closet; do not daisy-chain PoE between APs.`,
    },
    {
      title: 'Case study: cafe for 10 users',
      content: `**Profile:** coffee shop 80 m², 10 staff devices, guest Wi‑Fi for visitors, 1 POS terminal, 2 IP cameras.

**Bill of Materials:**
| Qty | Model | Role |
|-----|-------|------|
| 1 | ER605 | Gateway, DHCP, firewall |
| 1 | SG2210MP | 8-port PoE switch |
| 2 | EAP650 | Wi‑Fi coverage |
| — | Omada Cloud | Controller (free) |

**Topology:**
\`\`\`
Internet → ER605 → SG2210MP
                      ├─ EAP650 #1 (dining area)
                      ├─ EAP650 #2 (kitchen/office)
                      ├─ POS (wired VLAN 20)
                      └─ Cameras (VLAN 40)
\`\`\`

**VLAN design (minimal):**
| VLAN | Purpose | Subnet |
|------|---------|--------|
| 20 | Staff/POS | 192.168.20.0/24 |
| 50 | Guest Wi‑Fi | 192.168.50.0/24 |
| 40 | Cameras | 192.168.40.0/24 |
| 99 | Management | 192.168.99.0/24 |

**SSID:**
- \`Staff-Cafe\` — WPA2-Personal PSK, VLAN 20
- \`Guest-Cafe\` — Open + Portal voucher, VLAN 50, rate limit 5 Mbps

**Firewall:**
- Deny Guest → RFC1918
- Deny Cameras → Internet (NVR local only)
- Allow Staff → Internet

**Timeline:** half-day install — 2h cabling, 1h adoption, 1h SSID/portal test.

**Budget note:** ~$400–600 total hardware; no controller server cost with Cloud.

**Pitfall:** using ER605 built-in controller — OK for 4 devices; migrate to Cloud before adding a second location.`,
    },
    {
      title: 'Case study: office for 50 users',
      content: `**Profile:** IT company, 50 employees, 2 floors, hybrid work, VoIP, guest Wi‑Fi, AD + NPS, 1 server room.

**Bill of Materials:**
| Qty | Model | Role |
|-----|-------|------|
| 1 | ER7206 | Gateway, VPN, firewall |
| 1 | SG3428 | Core switch |
| 2 | SG2210MP | Floor IDF PoE |
| 6 | EAP670 | Wi‑Fi (3 per floor) |
| 1 | VM Ubuntu | Software Controller |

**Key decisions:**
- Software Controller (compliance: config not in cloud)
- WPA3-Enterprise via NPS for Corp Wi‑Fi
- Management VLAN 99 isolated
- OpenVPN for remote workers (16 concurrent max on ER7206)
- Dual WAN: fiber + LTE backup

**VLANs:** 10 Servers, 20 Workstations, 30 VoIP, 50 Corp Wi‑Fi, 60 Guest, 70 Printers, 99 Mgmt

**Day-0 timeline:**
| Day | Tasks |
|-----|-------|
| 1 | Rack mount, cable test, controller install |
| 2 | Gateway + core switch adopt, VLAN create |
| 3 | PoE switches, AP adopt, trunk config |
| 4 | SSID + NPS integration, firewall rules |
| 5 | VPN, guest portal, acceptance testing |

**Acceptance criteria:**
- RSSI > -67 dBm 95% coverage
- Guest cannot ping 10.0.10.0/24
- 802.1X auth < 3 sec
- VPN RDP to workstation works
- Failover WAN < 90 sec

**Ops:** weekly backup, monthly firmware check, quarterly restore drill.`,
    },
    {
      title: 'Case study: warehouse 100+ users',
      content: `**Profile:** logistics warehouse 3000 m², 120 handheld scanners, 15 office staff, 20 cameras, Wi‑Fi coverage for picking zones, high ceilings (8 m).

**Bill of Materials:**
| Qty | Model | Role |
|-----|-------|------|
| 1 | ER8411 | Gateway (VPN, high throughput) |
| 2 | SG3428 | Core/distribution (LAG between) |
| 4 | SG3428MP | Zone PoE switches |
| 14 | EAP670 | High-density AP (ceiling mount) |
| 1 | OC300 | Dedicated controller appliance |

**Design challenges:**
- High ceilings → mount APs lower on columns, not at the ceiling peak
- Metal shelving → RF shadowing; more APs, lower power
- Handheld scanners: often 2.4 GHz; dedicated SSID «Scanner» VLAN 45
- Cameras: multicast/IGMP, separate VLAN 40, no Wi‑Fi

**VLANs (extended):**
| VLAN | Purpose |
|------|---------|
| 40 | CCTV (wired) |
| 45 | Scanner Wi‑Fi |
| 20 | Office workstations |
| 50 | Office Corp Wi‑Fi |
| 60 | Guest (drivers, visitors) |
| 99 | Management |

**RF plan:** AP every 15 m in picking aisles; channel plan 5 GHz 36/44/52/60/100/108/116/124; 2.4 GHz 1/6/11 only for scanners.

**Controller:** OC300 (500 device headroom for growth); local on UPS; daily backup to NAS.

**Redundancy:** dual WAN (fiber + LTE), LAG core switches, spare AP on shelf.

**Throughput:** ER8411 handles 120 concurrent scanners at low bandwidth; bottleneck is RF airtime, not the gateway.

**Lesson learned:** warehouse ≠ office AP count formula; plan 2× AP density vs open office; validate with a walk test before the ceiling lift rental ends.`,
    },
    {
      title: 'Omada vs UniFi vs Meraki vs Fortinet',
      content: `| Criterion | Omada | UniFi (Ubiquiti) | Cisco Meraki | FortiGate stack |
|----------|-------|------------------|--------------|-----------------|
| Entry price | Low | Low–medium | High | Medium/high |
| Subscription | Not required (base) | Not required (base) | **Required** | FortiGuard |
| Unified UI | Yes | Yes (UniFi Network) | Yes (Dashboard) | FortiOS + FortiLink |
| UTM/NGFW | Basic/none | UDM Pro — moderate | MX — moderate | **Full** |
| Wi‑Fi density | Good (EAP670) | Excellent (U6 Pro) | Excellent | FortiAP |
| API | Open API (limited) | UniFi API (broad) | Meraki API (excellent) | FortiAPI |
| Cloud controller | Free | UniFi Cloud (optional) | Cloud only | FortiCloud optional |
| Support SLA | Community + vendor | Community + vendor | Enterprise 24/7 | Enterprise 24/7 |
| Multi-site | Cloud sites | UniFi Site Manager | Org-wide dashboard | FortiManager |
| Hardware QC | Solid | Solid | Premium | Premium |
| Supply chain | Broad | Broad | Via Cisco partners | Via partners |

**When to choose Omada:**
- Budget is limited; need a solid network without a SOC
- Office without strict compliance (PCI-DSS level 1, HIPAA)
- Team without a dedicated network engineer
- You do not want vendor lock-in via subscription

**When UniFi instead of Omada:**
- Already invested in UniFi ecosystem
- Need a wider community and more how-to content
- UDM Pro as all-in-one gateway+controller+Wi‑Fi

**When Meraki:**
- Budget for 5-year TCO includes licensing
- Need 24/7 TAC, auto VPN mesh, compliance audits
- MSP with Meraki dashboard expertise

**When Fortinet:**
- NGFW, IPS, sandboxing, SD-WAN mandatory
- Existing Fortinet security team
- Government/regulated industry

**Hybrid (not recommended without a reason):** Omada switching + Wi‑Fi, FortiGate edge — possible, but two UIs and harder troubleshooting.`,
    },
    {
      title: 'Licenses, limits, and Device Account',
      content: `**Omada without subscription** covers:
- Controller management (Software/Cloud) — unlimited devices on Software
- VLAN, firewall basics, VPN, RADIUS, guest portal
- Firmware updates
- Basic Insight analytics

**Paid options (verify current pricing):**
- Some advanced features may require a license in the enterprise line
- Hardware warranty/support packages — optional

**Hardware limits (approximate, verify datasheet):**

| Platform | Max managed devices | Notes |
|----------|---------------------|-------|
| ER7206 built-in | 10–20 | Not for production scale |
| OC200 | ~100 | RAM limited |
| OC300 | ~500 | Rack appliance |
| Software Controller | 1000+ | Depends on VM resources |
| Omada Cloud | 1000+ | Per account practical limits |
| ER7206 OpenVPN | ~16 concurrent | Upgrade to ER8411 for more |
| ER8411 OpenVPN | ~50+ concurrent | |
| ER7206 IPsec tunnels | ~20 | |

**Software Controller sizing:**

| Devices | vCPU | RAM | Disk |
|---------|------|-----|------|
| < 50 | 2 | 4 GB | 20 GB |
| 50–150 | 4 | 8 GB | 40 GB |
| 150–500 | 4–8 | 16 GB | 80 GB |

**Device Account (Settings → Site):**
- Shared username/password for adopted devices
- SSH, local fallback access
- **Change the default before adoption!**

**RBAC (Settings → User & Role):**
- **Admin** — full access
- **Operator** — read-only + alerts
- **User** — limited (guest manager)

**Audit:** Logs → Operation Log — who changed configuration.`,
    },
    {
      title: 'Full Omada Controller port list',
      content: `**Software Controller — ports for firewall rules:**

| Port | Protocol | Direction | Purpose |
|------|----------|-------------|------------|
| 8043 | TCP | Inbound | Web UI HTTPS (management) |
| 8088 | TCP | Inbound | HTTP redirect (optional, disable in prod) |
| 29810 | UDP | Inbound | Device discovery |
| 29811 | TCP | Inbound | Device management v1 |
| 29812 | TCP | Inbound | Device adoption v1 |
| 29813 | TCP | Inbound | Device upgrade v1 |
| 29814 | TCP | Inbound | Device management v2 |
| 27001 | UDP | Inbound | App discovery (mobile app) |
| 8843 | TCP | Inbound | Guest portal HTTPS (if local portal) |
| 8080 | TCP | Inbound | Guest portal HTTP redirect |

**Outbound from controller:**
| Destination | Port | Purpose |
|-------------|------|------------|
| \*.tplinkcloud.com | 443 TCP | Firmware download, cloud sync |
| NTP servers | 123 UDP | Time sync |
| DNS | 53 UDP/TCP | Name resolution |

**Outbound from devices (switch/AP/gateway) to controller:**
- TCP 29811, 29812, 29813, 29814
- UDP 29810

**Cloud Controller — devices additionally need:**
| Destination | Port | Purpose |
|-------------|------|------------|
| \*.tplinkcloud.com | 443 TCP | Cloud management |
| n-ws-*.tplinkcloud.com | 443 TCP | WebSocket tunnel |
| firmware servers | 443 TCP | OTA firmware |

**Security rules template:**
\`\`\`
# Allow ONLY from Management VLAN 99 to Controller
ALLOW 10.0.99.0/24 → Controller:8043,29810-29814
DENY   ANY → Controller:8043
ALLOW  Controller → WAN:443 (firmware)
\`\`\`

**VPN admin access:** allow 8043 from VPN pool 10.0.200.0/24 only, not the full internet.`,
    },
    {
      title: 'Backup, restore, and disaster recovery',
      content: `**What to back up:**
1. Full controller settings (.bin)
2. Screenshot/export of VLAN and IP tables
3. Documentation of WAN IP, VPN PSK, RADIUS secret (in a password vault)
4. Device inventory: MAC, serial, location, firmware
5. Port mapping spreadsheet

**Software Controller — scheduled backup:**
1. **Settings → Maintenance → Backup & Restore**
2. **Auto Backup** → Enable → Weekly → path on NAS/SMB share
3. Keep 4 latest copies + 1 offsite encrypted

**Restore to a new server:**
1. Install the same or newer controller version
2. **Restore** → upload .bin
3. Give the new server **the same IP** as the old one
4. Devices reconnect in 5–15 minutes

**Scenario «controller died»:**
| Scenario | RTO | Procedure |
|----------|-----|-----------|
| Software VM crash | 1–2h | New VM, restore .bin, same IP |
| Cloud account lost | 4–24h | TP-Link support + proof of ownership |
| OC200 hardware fail | 2–4h | New OC200, restore backup |
| Ransomware on controller | 4h | Clean install, offline backup restore |

**RPO/RTO for SMB:** RPO 24h (daily backup), RTO 4h — acceptable.

**Disaster recovery test (quarterly):**
1. Spin up lab VM
2. Restore last production backup
3. Verify config loads, VLANs present
4. Do NOT connect to production devices from lab
5. Document time to restore`,
    },
    {
      title: 'Controller and management plane security',
      content: `**Management VLAN 99 — mandatory:**
- Controller, switch management IP, AP management — VLAN 99 only
- Firewall rule: allow 8043, 29810–29814 **only** from VLAN 99 and VPN admin
- Deny management access from Guest and Corp user VLANs

**Hardening checklist:**
1. Admin password 16+ characters, unique, password manager
2. 2FA on TP-Link ID (Cloud)
3. Disable unused users and API applications
4. HTTPS only; do not open 8043 to the internet directly
5. VPN for remote admin access to the controller
6. Regular review of Logs → Failed login
7. Separate break-glass admin account (not for daily use)
8. Controller OS patching (Ubuntu/Windows updates monthly)

**SSH on devices:**
- Disabled or restricted by default
- Key-based auth if enabled, only from VLAN 99

**Physical security:** OC200/controller server in a locked rack; UPS minimum 15 min.

**Network segmentation:** even if an attacker is on the Corp VLAN — there must be no path to 8043.`,
    },
    {
      title: 'Security audit checklist',
      content: `**Quarterly security audit — Omada fundamentals layer:**

**Identity & Access:**
- [ ] Admin accounts: unique per person, no shared
- [ ] Operator roles assigned correctly (least privilege)
- [ ] Device Account password rotated in last 90 days
- [ ] TP-Link ID has 2FA enabled (Cloud)
- [ ] Open API credentials inventoried and rotated
- [ ] Former employee accounts removed

**Network isolation:**
- [ ] Management VLAN 99 has no route from Guest/Corp user VLANs
- [ ] Controller ports 8043/29810-29814 blocked from user VLANs
- [ ] Guest VLAN cannot reach RFC1918 (verified by ping test)
- [ ] VPN access limited to required subnets/ports

**Controller hardening:**
- [ ] Controller on static IP, not DHCP
- [ ] Auto backup enabled and last backup < 7 days
- [ ] Controller OS patched (if Software)
- [ ] No HTTP 8088 exposed externally
- [ ] Self-signed cert replaced or accepted via internal CA policy

**Device security:**
- [ ] All devices on supported firmware (N-1 max)
- [ ] No devices in Pending/Failed state
- [ ] Default passwords changed pre-adoption
- [ ] Unused switch ports disabled or set to default deny profile

**Documentation:**
- [ ] VLAN/IP table current
- [ ] Firewall matrix documented
- [ ] VPN users list matches HR active employees
- [ ] Recovery runbook tested this quarter

**Findings template:** Critical / High / Medium / Low with owner and due date.`,
    },
    {
      title: 'Lab walkthrough: Software Controller in 15 steps',
      content: `**Lab goal:** deploy Omada Software Controller, create a Site, prepare adoption, simulate a VLAN plan — without production hardware (or with 1 lab AP/switch).

**Step 1.** Prepare VM: Ubuntu 22.04, 2 vCPU, 4 GB RAM, 20 GB disk, network in lab VLAN or NAT for internet.

**Step 2.** Assign static IP: \`192.168.1.100/24\` (lab) — \`sudo nano /etc/netplan/00-installer-config.yaml\` → apply.

**Step 3.** Download Omada Software Controller .deb from tp-link.com → scp to VM.

**Step 4.** Install: \`sudo apt install -y openjdk-17-jre-headless && sudo dpkg -i Omada*.deb && sudo apt -f install\`.

**Step 5.** Start: \`sudo systemctl enable tpeap && sudo systemctl start tpeap\` — wait 2 min.

**Step 6.** Open \`https://192.168.1.100:8043\` — accept cert warning, create admin password (16+ chars).

**Step 7.** **Settings → Site** → Create Site «Lab-Office» → timezone Europe/Moscow.

**Step 8.** **Settings → Site → Device Account** → set username \`admin\` + strong password (for future device SSH).

**Step 9.** **Settings → Wired Networks** → Create VLAN 20 «LAB-USERS» \`192.168.20.1/24\` + DHCP pool .100–.200.

**Step 10.** **Settings → Wired Networks** → Create VLAN 99 «MGMT» \`192.168.99.1/24\` — DHCP off.

**Step 11.** **Settings → Maintenance → Backup** → Enable auto backup → local path.

**Step 12.** **Settings → User & Role** → Create Operator «monitor» read-only.

**Step 13.** (Optional hardware) Connect lab EAP/switch → **Devices → Pending → Adopt**.

**Step 14.** **Settings → Controller → Controller Hostname/IP** → verify \`192.168.1.100\`.

**Step 15.** Export backup .bin → document lab state → snapshot VM (VirtualBox/VMware) for rollback.

**Windows variant (replace steps 4–5):** run installer → service auto-start → same UI steps 6–15.

**Validation:** UI loads, Site created, VLAN visible in Wired Networks, backup file exists on disk, Operator cannot edit firewall.`,
    },
    {
      title: 'FAQ: 10 common questions',
      content: `**1. Do I need a license for Omada Cloud?**
No — basic management is free. Check optional paid features on the TP-Link site.

**2. Can I manage Omada without internet?**
Yes — Software Controller on-prem works offline. Cloud and firmware download need internet.

**3. How many devices can OC200 handle?**
About 100 adopted devices (depends on firmware and mix of gateway/switch/AP).

**4. What if I forgot the controller admin password?**
Software: reinstall + restore backup, or reset via CLI (see TP-Link KB). Cloud: reset via TP-Link ID recovery.

**5. Can I mix Omada with non-Omada switches?**
Yes for L2 (generic managed switch), but without central management. VLAN trunks must match manually.

**6. ER7206 built-in controller vs Software — which to choose?**
Built-in only for ≤10 devices demo/small office. Software/Cloud for any growth.

**7. Does the controller need a static IP?**
Yes, mandatory. DHCP on the controller = disaster on lease renewal.

**8. How do I migrate from UniFi to Omada?**
Parallel deployment recommended: new Omada network, migrate VLAN by VLAN; not an in-place swap.

**9. Does Omada support IPv6?**
Partial — gateway DHCPv6 and some features; verify firmware release notes for your use case.

**10. Where are controller logs stored?**
Software Linux: \`/opt/tplink/EAPController/logs/\`. UI: Logs menu. Configure syslog forward under Settings.`,
    },
    {
      title: 'Troubleshooting encyclopedia',
      content: `| # | Symptom | Likely cause | Fix |
|---|---------|-------------------|---------|
| 1 | Device not in Pending | Different subnet without option 138 | DHCP option 138 or temporary L2 |
| 2 | Adopt stuck on «Adopting» | Firewall blocks 29810–29814 | Open controller ports |
| 3 | Adoption failed | Firmware incompatible | Update controller first, factory reset device |
| 4 | Connected but config not applied | Provisioning stuck | Retry Provisioning, reboot device |
| 5 | Two controllers on network | Old OC200 still active | Power off the extra one, reset devices |
| 6 | AP adopted, switch not | PoE/cable/VLAN | Cable test, PoE budget, data VLAN |
| 7 | Cloud device offline | No tplinkcloud.com | DNS, HTTPS 443 outbound |
| 8 | Offline after restore | Controller IP changed | Restore same IP |
| 9 | UI 8043 timeout | Service stopped / firewall | systemctl status tpeap, ufw rules |
| 10 | Java heap OOM on controller | Undersized VM | Increase RAM to 8 GB |
| 11 | Backup restore fails | Version mismatch | Install matching or newer controller |
| 12 | Device shows wrong site | Wrong site selected at adopt | Forget device, switch site, re-adopt |
| 13 | Gateway WAN no internet | PPPoE/VLAN tag wrong | Verify ISP settings, MAC clone |
| 14 | High CPU on controller | Too many devices / logs | Increase resources, enable log rotation |
| 15 | Certificate warning always | Self-signed default | Import internal CA cert or accept policy |
| 16 | API 401 Unauthorized | Token expired | Re-authenticate, check clock sync NTP |
| 17 | DHCP option 138 ignored | Wrong scope / not applied | Verify scope, renew DHCP lease on device |
| 18 | Multi-site wrong config pushed | Editing wrong site | Confirm site dropdown before changes |
| 19 | Docker controller no discovery | Bridge NAT mode | Use host network mode |
| 20 | OC200 USB backup fails | USB format / permissions | FAT32 stick, reformat |

**Escalating to TP-Link:** collect controller version, device MAC, firmware, export Logs, network diagram.`,
    },
    {
      title: 'Interview questions: Omada fundamentals',
      content: `**8 interview questions (network engineer / sysadmin):**

**1.** Explain the difference between L2 and L3 adoption in Omada. When is DHCP Option 138 required?

**2.** Why update the controller before gateway and AP? What happens on a version mismatch?

**3.** Compare Omada Cloud vs Software Controller for an 80-person office with compliance requirement «no cloud config».

**4.** Which ports must be open between the Management VLAN and Software Controller? Why must you not expose 8043 to the internet?

**5.** ER7206 vs ER8411 — selection criteria for an office with 16 remote VPN users and 10G WAN?

**6.** Describe a disaster recovery plan when the Software Controller VM dies on Friday at 17:00. RTO 4 hours.

**7.** What is Device Account and why change it before adoption?

**8.** How would you design multi-site for 3 branches: one Cloud account or three Software controllers? Trade-offs.

**Expected strong answers:** mention Option 138, controller-first firmware, management VLAN isolation, backup restore same IP, PoE budget calculation, no-subscription TCO advantage vs Meraki.`,
    },
    {
      title: 'First launch: full checklist',
      content: `**Day 0 — planning:**
- [ ] VLAN and IP table
- [ ] Cable and patch panel diagram
- [ ] Device list with MACs for inventory
- [ ] Controller choice (Cloud/Software/OC200)
- [ ] Firewall port list documented
- [ ] Controller VM/server provisioned

**Day 1 — deployment:**
1. [ ] Install/register Controller
2. [ ] Create Site, timezone, device password
3. [ ] Adopt Gateway → configure WAN (DHCP/static/PPPoE)
4. [ ] Create Wired Networks (VLAN) on gateway
5. [ ] Adopt core switch → trunk, management IP VLAN 99
6. [ ] Adopt PoE switches → port profiles
7. [ ] Adopt AP → verify PoE power
8. [ ] Create SSID (minimum Corp + Guest)
9. [ ] Firewall: deny Guest → RFC1918
10. [ ] Backup config
11. [ ] Create admin + operator accounts
12. [ ] Document in Confluence/Notion

**Day 2 — validation:**
- [ ] Ping gateway from each VLAN
- [ ] Wi‑Fi connect Corp and Guest
- [ ] Speedtest from a workstation
- [ ] DHCP pool utilization check
- [ ] VPN test (if applicable)
- [ ] Security audit quick pass
- [ ] Handoff documentation to ops team`,
    },
  ],
  practice: [
    'Install Omada Software Controller in a VM (Ubuntu 22.04, 2 vCPU, 4 GB RAM) and open the UI on port 8043',
    'Deploy Omada Controller in Docker (docker-compose) with host network and persistent volumes',
    'Register an Omada Cloud Site and compare the UI with Software Controller — difference table (at least 10 points)',
    'Configure DHCP Option 138 on Windows DHCP or Omada Gateway for L3 adoption',
    'Adopt at least one lab device (switch/AP) and document the adoption timeline',
    'Build a firmware compatibility matrix for 5 devices and an N-1 update policy',
    'Back up the controller, delete the Site in lab, and restore from backup on a new IP (then fix the IP)',
    'Draw a topology for a 50-person office: ER7206 + SG3428 + 2× SG2210MP + 6× EAP670',
    'Calculate PoE budget: 6× EAP670 + 20 phones on SG3428MP — is 250 W enough?',
    'Create admin and operator accounts; verify that operator cannot change firewall',
    'Write a «Controller down» runbook with RTO 4 hours for a Software deployment',
    'Compare 3-year TCO of Omada vs Meraki vs UniFi for a 40-person office',
    'Build a decision tree OC200 vs Cloud vs Software for 3 scenarios (cafe, office, warehouse)',
    'Enable Omada Open API, obtain a token, and export the device list via curl',
    'Run the security audit checklist and document 3 findings with remediation',
  ],
  resources: [
    { title: 'Omada Software Controller Download', url: 'https://www.tp-link.com/us/support/download/omada-software-controller/' },
    { title: 'Omada Documentation Portal', url: 'https://support.omadanetworks.com/' },
    { title: 'Omada Cloud Controller', url: 'https://omada.tplinkcloud.com/' },
    { title: 'ER7206 Datasheet', url: 'https://www.tp-link.com/us/business-networking/omada-router/er7206/' },
    { title: 'Omada Open API Guide', url: 'https://support.omadanetworks.com/us/document/108000/' },
    { title: 'Omada FAQ — Adoption', url: 'https://support.omadanetworks.com/us/document/108000/' },
  ],
  quiz: [
    {
      question: 'Omada is an SDN platform from:',
      options: ['TP-Link', 'Cisco', 'Fortinet'],
      answer: 'TP-Link',
    },
    {
      question: 'Omada Controller deployment options include:',
      options: ['Cloud, Software, and Hardware (OC200/OC300)', 'Cloud only', 'CLI only'],
      answer: 'Cloud, Software, and Hardware (OC200/OC300)',
    },
    {
      question: 'Adoption in Omada means:',
      options: ['Connecting a device to the controller', 'Removing a VLAN', 'Formatting an AP'],
      answer: 'Connecting a device to the controller',
    },
    {
      question: 'Recommended firmware update order is:',
      options: [
        'Controller → Gateway → Switches → AP',
        'AP → Controller first',
        'Random order is fine',
      ],
      answer: 'Controller → Gateway → Switches → AP',
    },
    {
      question: 'In a typical topology the Omada Gateway sits:',
      options: ['Between Internet and LAN', 'As Wi‑Fi only', 'Behind every PC'],
      answer: 'Between Internet and LAN',
    },
    {
      question: 'When should you back up controller config?',
      options: ['Regularly and before changes', 'Never', 'Only when changing ISP'],
      answer: 'Regularly and before changes',
    },
    {
      question: 'DHCP Option 138 is used to:',
      options: [
        'Point devices to the controller for L3 adoption',
        'Remove a VLAN',
        'Configure Active Directory',
        'Print from the controller',
      ],
      answer: 'Point devices to the controller for L3 adoption',
    },
    {
      question: 'A Site in Omada Controller is:',
      options: [
        'A logical group of devices at one location',
        'Only one AP',
        'A DNS zone',
        'A VPN tunnel',
      ],
      answer: 'A logical group of devices at one location',
      explanation: 'One Organization can contain multiple Sites for branch offices.',
    },
    {
      question: 'Default HTTPS port for Omada Software Controller is:',
      options: [
        '8043 (or 443 behind a reverse proxy)',
        '22 (SSH default)',
        '8080 only with no alternatives',
        '161 (SNMP)',
      ],
      answer: '8043 (or 443 behind a reverse proxy)',
    },
    {
      question: 'After restoring a controller backup to a new server, devices reconnect best when:',
      options: [
        'The new server uses the same controller IP',
        'You change the ISP DNS only',
        'You wipe all AP configs first',
        'You disable Option 138 permanently',
      ],
      answer: 'The new server uses the same controller IP',
      explanation: 'Matching the previous controller IP avoids mass re-adoption.',
    },
  ],
}

export default translation
