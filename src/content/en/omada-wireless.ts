import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Omada - Wi‑Fi and EAP',
  duration: '12–15 hours',
  description:
    'EAP650/EAP670, SSID, WPA3, RADIUS/NPS, guest portal, channel planning, spectrum analysis, IoT SSID, voice VLAN, roaming and troubleshooting',
  sections: [
    {
      title: 'Wi-Fi architecture at Omada',
      content: `**Centralized management:** Controller push SSID config to all adopted APs. The client connects to the nearest AP; controller coordinates roaming and RF settings.

**Components:**
- **WLAN (SSID)** - logical network, binding to VLAN
- **EAP Access Point** - radio 2.4 / 5 / 6 GHz
- **RADIUS** — Enterprise auth (NPS)
- **Portal** — captive portal Guest
- **Gateway firewall** - Guest isolation

**Corp traffic flow:**
\\\`\\\`\\\`
Client → EAP670 (VLAN 50 tagged) → Switch trunk → ER7206 → Firewall → Server/Internet
\\\`\\\`\\\`

**Guest flow:**
\\\`\\\`\\\`
Client → Portal auth → VLAN 60 → Gateway → Internet only (deny RFC1918)
\\\`\\\`\\\``,
    },
    {
      title: 'EAP650 vs EAP670: selection and placement',
      content: `**EAP650** — Wi‑Fi 6, 2×2, ~13 W PoE:
- 20–25 clients/AP
- Coverage ~80–100 m² open office
- Meeting rooms, corridors

**EAP670** — Wi‑Fi 6, 4×4, ~15 W PoE+:
- 25–40 clients/AP
- High density open space
- OFDMA better multi-user

**Planning 50 users (60% Wi‑Fi = 30 clients):**
- 2 floors → 3 AP/floor = 6 AP
- EAP670 open space, EAP650 meetings
- Spacing 10–12 m open plan

**Mounting:** ceiling center, 2.5–3 m height; ethernet home run; mesh = backup only.`,
    },
    {
      title: 'Channel planning: calculator examples',
      content: `**2.4 GHz - only channels 1, 6, 11 (20 MHz):**

| AP | Location | 2.4 GHz Channel | 5 GHz Channel | Width |
|----|----------|-----------------|---------------|-------|
| AP-F1-01 | Open space NE | 1 | 36 | 40 MHz |
| AP-F1-02 | Open space NW | 6 | 44 | 40 MHz |
| AP-F1-03 | South wing | 11 | 52 | 40 MHz |
| AP-F2-01 | Open space NE | 1 | 100 | 40 MHz |
| AP-F2-02 | Open space NW | 6 | 108 | 40 MHz |
| AP-F2-03 | South wing | 11 | 116 | 40 MHz |

**Reuse rule 2.4:** same channel APs ≥ 3 walls or ≥ 25 m apart.

**5 GHz reuse (40 MHz):** minimum 2 channels apart in same floor → 36/44/52 OK together.

**Density formula (rough):**
\\\`\\\`\\\`
AP_count = floor_area_m2 / coverage_m2_per_AP × density_factor
density_factor: 1.0 standard, 1.5 high ceiling, 2.0 warehouse metal
\\\`\\\`\\\`

**Example warehouse 2000 m²:** 2000/80 × 2.0 = **50 AP** theoretical max → practical 20–25 EAP670 with site survey validation.

**80 MHz channels:** only if ≤3 AP per floor AND clean spectrum; else stick 40 MHz.

**DFS channels (52–144):** enable for more 5 GHz options; watch for radar detection channel switch events.`,
    },
    {
      title: 'Site Survey: Ekahau and alternatives',
      content: `**Ekahau Pro** — industry standard predictive + active survey.

**Ekahau workflow:**
1. Import floor plan (PDF/DWG) → set scale
2. Define walls (drywall, concrete, glass attenuation)
3. Place virtual AP EAP670 → predict heatmap
4. Post-install active survey with Ekahau Sidekick
5. Report: RSSI, SNR, overlap, capacity

**Alternatives (SMB budget):**

| Tool | Cost | Use case |
|------|------|----------|
| **NetSpot Pro** | Low | Mac/Windows walk survey |
| **Omada App** | Free | Basic heatmap with adopted AP |
| **WiFi Analyzer (Android)** | Free | Quick RSSI walk |
| **inSSIDer** | Medium | Interference scan |
| **Hamina** | Medium | Browser-based planning |

**Free workflow without Ekahau:**
1. Floor plan print + grid 5m
2. Temporary mount AP at planned location
3. Walk with WiFi Analyzer → record RSSI every grid point
4. Target: -67 dBm minimum in work areas
5. Adjust AP count/location → repeat

**Acceptance report:** PDF heatmap + AP coordinate table + channel plan signed by customer.`,
    },
    {
      title: 'Creating a WLAN (SSID): step-by-step workflow',
      content: `**Settings → Wireless Networks → Create New Wireless Network**

**Corporate SSID:**
1. **Name:** \\\`Corp-WiFi\\\`
2. **Band:** Dual-band or 5 GHz only if full coverage
3. **WLAN Group:** Default
4. **Device Type:** EAP
5. **VLAN:** WIFI-CORP (50)
6. **Security:** WPA3-Enterprise
7. **RADIUS Profile:** select created profile
8. **Apply to:** All AP or selected
9. **Save**

**Advanced:**
- Hide SSID: No
- Client Isolation: Off
- Multicast: enable on switch IGMP
- Band Steering: ON

**Verify:** laptop 802.1X → IP 10.0.50.x → ping server.`,
    },
    {
      title: 'WPA3 transition mode',
      content: `**WPA3-Transition** — allows WPA2 AND WPA3 clients on same SSID during migration.

**When to use:**
- Mixed fleet: old printers, legacy IoT, new laptops
- Gradual rollout without separate SSIDs

**Config:**
WLAN → Security → **WPA3-Enterprise Transition Mode** (or Personal Transition for PSK)

**Security note:** transition mode vulnerable to downgrade attacks in theory — for high security use WPA3-only + separate legacy SSID.

**Migration path:**
1. Phase 1: WPA2-Enterprise (all clients work)
2. Phase 2: WPA3-Transition (6 months)
3. Phase 3: WPA3-only + decom legacy SSID

**Client compatibility test matrix:**

| Client | WPA3 | Transition | WPA2-only |
|--------|------|------------|-----------|
| Win11 | Yes | Yes | Yes |
| Win10 1903+ | Yes | Yes | Yes |
| macOS 12+ | Yes | Yes | Yes |
| Old Android | No | Yes (WPA2 fallback) | Yes |
| Embedded IoT | No | Maybe | Yes |`,
    },
    {
      title: 'RADIUS and NPS: full integration',
      content: `**Architecture:**
\\\`\\\`\\\`
Client ──EAP-PEAP──► EAP670 ──RADIUS──► NPS ──AD──► Domain User
\\\`\\\`\\\`

**NPS setup:**
1. Add Role → Network Policy Server
2. RADIUS Clients → New: \\\`Omada-AP\\\`, IP = Gateway LAN \\\`10.0.99.1\\\` (or controller IP per design)
3. Shared secret 32+ chars → vault
4. Connection Request Policy → grant Omada
5. Network Policy → Domain Users, PEAP-MSCHAPv2

**Omada RADIUS Profile:**
1. Settings → Authentication → RADIUS Profile → Create
2. Primary: \\\`10.0.10.5\\\` (NPS in Servers VLAN)
3. Port 1812, secret match
4. Accounting 1813 optional

**Firewall:** UDP 1812/1813 from Gateway subnet → NPS.

**Bind to SSID:** Corp-WiFi → WPA3-Enterprise → RADIUS Profile.`,
    },
    {
      title: 'MAC authentication fallback',
      content: `**Use case:** conference room printer, barcode scanner, legacy device without 802.1X.

**MAC Auth Bypass (WLAN Advanced):**
1. Enable **MAC Filtering** whitelist mode
2. Add MAC addresses: \\\`AA:BB:CC:DD:EE:FF\\\` per device
3. Assign to Corp SSID with WPA2-Enterprise primary

**Omada MAC Auth flow:**
- Client attempts 802.1X → fails → check MAC whitelist → allow if listed
- Or dedicated **MAC Auth SSID** without 802.1X (less secure)

**Security warning:** MAC spoofing trivial — use only for isolated VLAN (IoT VLAN 80), not Corp servers VLAN.

**Better alternative:** separate IoT SSID WPA2-Personal long random PSK + MAC filter + client isolation.

**RADIUS MAC Auth (NPS):**
- Calling-Station-Id = MAC address
- Policy per device group — more scalable than UI whitelist for 50+ devices

**Document:** inventory spreadsheet MAC → device name → VLAN → owner.`,
    },
    {
      title: 'Dynamic VLAN via RADIUS attributes',
      content: `**One SSID, multiple VLANs by AD group.**

**NPS:** Tunnel-Private-Group-Id = VLAN ID per policy.

**Omada:** WLAN → Dynamic VLAN Enable; RADIUS profile linked.

**Switch:** AP trunk carries all dynamic VLANs tagged.

**Fallback VLAN:** 50 if RADIUS silent.

**Test:** sales user → 10.0.55.x; IT user → 10.0.56.x.`,
    },
    {
      title: 'IoT SSID: Design and Isolation',
      content: `**IoT SSID «IoT-Net»:**
- VLAN 80 dedicated
- Security: WPA2-Personal (IoT rarely supports Enterprise)
- PSK: 20+ random chars, rotate quarterly
- Client Isolation: **ON**
- Band: 2.4 GHz only (many IoT radios)
- Rate limit: 1 Mbps (prevent botnet C2 bursts)

**Firewall:**
- Deny 80 → RFC1918 except IoT controller \\\`10.0.10.60\\\`
- Deny 80 → Internet OR allow whitelist only (vendor cloud URLs)
- Deny Corp → 80 (prevent lateral)

**Devices:** smart plugs, HVAC, door locks, legacy sensors.

**Separate from Scanner SSID:** warehouse scanners may need VLAN 45 with higher QoS — don't mix with smart coffee machine.

**Monitoring:** alert on IoT VLAN unusual outbound traffic via syslog firewall denies spike.`,
    },
    {
      title: 'Voice VLAN over Wi‑Fi (VoWLAN)',
      content: `**VoIP over Wi‑Fi** requires QoS + fast roaming.

**Dedicated voice SSID (optional) or Corp SSID with QoS:**
- VLAN 30 (same as wired VoIP) OR VLAN 35 Wi‑Fi voice
- WPA2/WPA3-Enterprise
- Fast Roaming 802.11r/k/v **enabled**
- Minimum RSSI -70 dBm (not -65 for voice — too aggressive drop)

**WLAN QoS (if available):**
- WMM: Enable
- Voice priority queue

**Switch/AP trunk:** must include voice VLAN tagged.

**Test:** WiFi call walking between 3 AP → MOS > 3.5, packet loss < 1%.

**Cisco/Teams optimization:** prefer 5 GHz, disable 2.4 for voice SSID if coverage allows.

**Common failure:** voice on Guest SSID or without 802.11r → dropped calls at roam.`,
    },
    {
      title: 'PEAP vs EAP-TLS: choice for SMB',
      content: `| Method | Pros | Cons |
|--------|------|------|
| PEAP-MSCHAPv2 | Fast, AD creds | MITM if no cert validation |
| EAP-TLS | Strong, machine certs | PKI required |

**PEAP SMB:** GPO Wi‑Fi profile + trusted internal CA.

**EAP-TLS:** AD CS auto-enrollment for managed devices.

**Omada:** proxies RADIUS, doesn't terminate 802.1X.`,
    },
    {
      title: 'Guest Wi‑Fi and Captive Portal customization',
      content: `**Guest WLAN setup:**
1. Name: \\\`Guest-WiFi\\\`
2. VLAN 60
3. Security: Open + Portal
4. Portal profile attached

**Portal customization (Settings → Authentication → Portal):**
- **Logo:** upload company logo PNG 200×80
- **Background:** brand color #1a365d
- **Terms of Use:** custom HTML checkbox text
- **Welcome message:** “Welcome to Guest Wi‑Fi Office”
- **Redirect URL:** company.com after auth
- **Session timeout:** 8 hours
- **Idle timeout:** 30 min
- **Rate limit:** 10/5 Mbps

**Landing page fields:** Name, Email (optional), Terms checkbox.

**External portal (advanced):** RADIUS to external auth provider — rarely needed SMB.

**Branding test:** mobile + desktop browser; check HTTPS cert warning on portal (use valid cert on controller if exposing portal externally).`,
    },
    {
      title: 'Voucher Portal for visitors',
      content: `**Workflow:**
1. Portal → Voucher → batch 50 × 24h
2. Print for reception
3. Guest enters code → access granted

**Ops:** monthly rotation, revoke unused, audit logs.

**Rate limit per voucher:** 5 Mbps adequate for guests.`,
    },
    {
      title: 'RF optimization: channels, power, band steering',
      content: `**2.4 GHz:** channels 1/6/11, 20 MHz, Low/Medium power.

**5 GHz:** 40 MHz dense, 80 MHz sparse; DFS enable; scheduled auto-channel night 02:00.

**Band Steering:** ON — push 5 GHz capable clients.

**Min RSSI:** -70 dBm general, -75 dBm warehouse (less aggressive).

**Airtime Fairness:** ON for dense deployments.

**Transmit power:** reduce to minimize overlap — Auto often too high; try Medium manual tuning after survey.`,
    },
    {
      title: 'Spectrum analysis and interference',
      content: `**Spectrum analysis tools:**

| Tool | What it detects |
|------|-----------------|
| Ekahau Sidekick | Full spectrum, non-Wi-Fi interferers |
| MetaGeek Wi-Spy | 2.4/5 GHz interference |
| EAP built-in scan | Neighboring APs, channel util (Controller) |
| WiFi Analyzer Android | Co-channel APs, RSSI |

**Common interferers:**
- Microwave ovens (2.4 GHz pulse)
- Bluetooth dense (2.4 GHz)
- Neighbor AP co-channel (5 GHz)
- Wireless cameras (2.4 GHz illegal wideband)
- LED dimmers (broadband noise)

**Omada Controller RF scan:**
Devices → AP → Tools → RF Scan → view neighboring SSIDs → manual channel adjust.

**Mitigation playbook:**
1. Identify interferer source physically if possible
2. Move to 5 GHz for corp clients
3. Change channel away from neighbor
4. Reduce 2.4 GHz TX power
5. Shield/replace offending device (microwave lunch schedule ≠ IT fix — relocate AP)

**Document:** spectrum baseline at install; quarterly rescan after neighbor moves in.`,
    },
    {
      title: 'Fast Roaming: 802.11r/k/v',
      content: `**Enable on Corp/Voice SSID:**
- 802.11r Fast Roaming
- 802.11k Neighbor Report
- 802.11v BSS Transition

**Requirements:** same SSID/security all AP; modern clients.

**Test:** ping gateway while walking — loss < 2%.

**IoT SSID:** disable 802.11r (breaks some devices).`,
    },
    {
      title: 'Trunk VLAN to AP: Critical Configuration',
      content: `**Checklist AP trunk port:**
- [ ] VLAN 50 tagged Corp
- [ ] VLAN 60 tagged Guest
- [ ] VLAN 99 management
- [ ] Dynamic VLANs if used

**Failure mode:** associate OK, no DHCP → missing VLAN on trunk.

**Diagnose:** AP Connected Clients VLAN tag; switch port VLAN membership.`,
    },
    {
      title: 'Client Isolation and Rate Limiting',
      content: `**Guest:** Client Isolation ON.

**Corp:** Isolation OFF.

**Rate limit Guest:** 10/5 Mbps per client.

**Verify:** two Guest clients cannot ping each other.`,
    },
    {
      title: 'Mesh Wi‑Fi: when to use',
      content: `**OK:** temp, no cable possible, outdoor extension.

**NOT OK:** primary office, VoIP, high throughput.

**Performance:** 1 hop ~50% throughput; max 2 hops.

**Config:** Main AP wired + Mesh Enable; Satellite AP wireless.`,
    },
    {
      title: 'Case study: cafe 10 users - Wi‑Fi',
      content: `**2× EAP650, Guest + Staff SSID**

**Staff:** WPA2-Personal PSK, VLAN 20, hidden SSID optional.

**Guest:** Open + voucher portal, VLAN 50, rate 5 Mbps, isolation ON.

**Channels:** AP1 ch1/36, AP2 ch6/44 — minimize overlap in small space.

**Portal branding:** cafe logo, 4h session, Terms simple.

**Pitfall:** Guest on same VLAN as POS — never; firewall + VLAN separation mandatory.`,
    },
    {
      title: 'Case study: office 50 - Wi‑Fi',
      content: `**6× EAP670, WPA3-Enterprise Corp, Guest portal**

**Channel plan:** 40 MHz 5 GHz, staggered 36/44/52 per floor.

**NPS integration:** Domain Users PEAP; IT group Dynamic VLAN 56.

**Fast roaming enabled** for Teams calls.

**Acceptance:** -67 dBm 95% area; roam test 3 floors; Guest isolation verified.

**Ops:** monthly RF scan; quarterly PSK rotation IoT if any.`,
    },
    {
      title: 'Case study: warehouse 100+ - Wi‑Fi',
      content: `**14× EAP670, Scanner SSID + Office Corp SSID**

**Scanner SSID:** VLAN 45, WPA2-Personal, 2.4 GHz preferred, hidden, MAC whitelist 120 devices.

**Office mezzanine:** Corp SSID WPA3-Enterprise VLAN 50.

**RF challenge:** metal racks → AP on columns at 3m, not ceiling 8m.

**Channel plan wide spacing:** 15m between same 5 GHz channel APs.

**Throughput test:** scanner roaming while picking — latency < 100ms to server.

**Spare AP:** pre-configured in box for 15-min swap.`,
    },
    {
      title: 'Firmware compatibility matrix (AP)',
      content: `| Controller | EAP650 | EAP670 | EAP773 |
|------------|--------|--------|--------|
| 5.15.x | 1.0.x | 1.0.x | 1.0.x |
| 5.14.x | 0.9.x+ | 0.9.x+ | N/A |

**Upgrade AP last** in maintenance window — 2 min reboot each.

**Mixed models same SSID:** OK; RF features differ per model.`,
    },
    {
      title: 'Security audit checklist (Wi‑Fi)',
      content: `- [ ] Corp uses Enterprise not PSK
- [ ] Guest isolated VLAN + firewall tested
- [ ] WPS disabled
- [ ] IoT on separate SSID/VLAN
- [ ] Portal session timeout configured
- [ ] RADIUS shared secret rotated < 1 year
- [ ] No default PSK «password123»
- [ ] Rogue AP detection reviewed weekly
- [ ] Minimum RSSI not too aggressive
- [ ] 802.11r disabled on IoT SSID
- [ ] Management VLAN not broadcast on guest AP`,
    },
    {
      title: 'Lab walkthrough: SSID and portal in 15 steps',
      content: `**Step 1.** Lab Controller + adopted AP (or document simulated).

**Step 2.** Wired Network VLAN 50 LAB-WIFI + DHCP.

**Step 3.** Wired Network VLAN 60 LAB-GUEST + DHCP.

**Step 4.** Switch AP port → AP-Trunk profile 50,60,99.

**Step 5.** RADIUS Profile (optional skip → WPA2-Personal for lab).

**Step 6.** Create WLAN “Lab-Corp” VLAN 50 WPA2-Personal PSK (lab simplification).

**Step 7.** Create WLAN “Lab-Guest” VLAN 60 Open.

**Step 8.** Portal → Local User → user guest/guest123.

**Step 9.** Attach portal to Lab-Guest.

**Step 10.** Firewall deny Guest VLAN → RFC1918.

**Step 11.** Connect phone to Lab-Corp → verify IP .50.x.

**Step 12.** Connect to Lab-Guest → portal login → verify IP .60.x.

**Step 13.** Ping internal gateway from Guest → must FAIL.

**Step 14.** Ping 8.8.8.8 from Guest → OK.

**Step 15.** Screenshot WLAN settings + export backup → lab report.

**Windows lab PC:** use ipconfig and ping for validation steps 11–14.`,
    },
    {
      title: 'FAQ: 10 frequently asked questions (Wi‑Fi)',
      content: `**1. How many clients are there on the EAP670?**
~40 practical; depends on bandwidth per client.

**2. Do I need a separate SSID for 5 GHz?**
Band steering usually enough; separate SSID adds management overhead.

**3. WPA3-Enterprise vs WPA2?**
WPA3 stronger; use Transition during migration.

**4. Guest portal won't open?**
DNS issue or firewall blocking controller portal port.

**5. RADIUS works wired not wireless?**
NPS client IP wrong — usually need gateway IP not AP IP.

**6. Is it possible to hide Corp SSID?**
Yes but security through obscurity minimal; doesn't replace Enterprise auth.

**7. DFS channel switch - what to do?**
Normal if radar detected; monitor logs; avoid DFS if VoIP critical unless needed.

**8. Mesh vs wired AP?**
Always wired for production; mesh 50% throughput penalty.

**9. How to limit Guest bandwidth?**
WLAN rate limit per SSID or per client.

**10. Apple devices roam issues?**
Enable 802.11k/v; avoid overly aggressive min RSSI.`,
    },
    {
      title: 'Troubleshooting encyclopedia: 15+ Wi‑Fi scenarios',
      content: `| # | Symptom | Reason | Solution |
|---|---------|---------|---------|
| 1 | Cannot join Corp | RADIUS fail | NPS log, creds |
| 2 | Join OK, no IP | VLAN missing trunk | Add VLAN to AP port |
| 3 | Slow Wi‑Fi | Co-channel interference | RF scan, change channel |
| 4 | Frequent disconnect | Min RSSI too high | Relax to -70 |
| 5 | Guest portal loop | DNS broken | Fix DNS on gateway |
| 6 | Guest no internet | Firewall | Allow Guest→WAN |
| 7 | 802.1X wired OK Wi‑Fi fail | RADIUS client IP | NPS = gateway IP |
| 8 | One AP slow | Firmware/hardware | Reboot, replace |
| 9 | WPA3 client fail | Old driver | Transition mode |
| 10 | VoIP drops roam | 802.11r off | Enable fast roam |
| 11 | IoT won't connect | WPA3 required | WPA2 SSID for IoT |
| 12 | Wrong VLAN IP | Dynamic VLAN attr | Fix NPS Tunnel-Group-Id |
| 13 | AP offline | PoE/cable | PoE+ port, cable test |
| 14 | Low throughput 2.4 | Congested band | Band steer to 5 |
| 15 | Multicast video stutter | No IGMP snoop | Enable on switch |
| 16 | Hidden SSID not found | Typo/case | Broadcast temporarily |
| 17 | Mac random MAC fail | Private Wi‑Fi addr | Disable for Corp profile |
| 18 | Certificate error PEAP | Untrusted CA | GPO deploy CA cert |
| 19 | Portal SSL warning | Self-signed | Accept or install cert |
| 20 | Neighbor AP same channel | Poor planning | Re-channel both APs |`,
    },
    {
      title: 'Troubleshooting RADIUS/NPS',
      content: `| Symptom | Cause | Fix |
|---------|-------|-----|
| RADIUS timeout | Firewall 1812 | Open UDP |
| Reject all | Secret mismatch | Sync Omada↔NPS |
| Some users fail | NPS group policy | AD membership |
| Cert error | Untrusted CA | GPO CA deploy |
| Stops after DC down | Single NPS | Redundant NPS |
| Dynamic VLAN wrong | Attribute typo | Tunnel-Group-Id |

**Debug:** NPS Event Viewer; \\\`radtest\\\` from Linux; netsh ras tracing.`,
    },
    {
      title: 'Interview questions: Omada Wi‑Fi',
      content: `**8 questions:**

**1.** Design SSID/VLAN scheme for office with Corp, Guest, IoT, Voice — justify separation.

**2.** Explain channel planning for 6 AP on one floor 40 MHz 5 GHz.

**3.** WPA3 transition vs WPA3-only — trade-offs?

**4.** Guest portal loop troubleshooting steps?

**5.** Why 802.11r on Corp but off on IoT SSID?

**6.** RADIUS: why NPS client IP is gateway not AP?

**7.** Calculate AP count for 2000 m² warehouse with metal racks.

**8.** Spectrum analysis found microwave interference — mitigation options?

**Strong answers:** VLAN isolation, IGMP for multicast, trunk VLAN checklist, Ekahau vs free survey tools.`,
    },
    {
      title: 'WLAN Groups: per-floor and per-building',
      content: `**WLAN Group** - set SSID, broadcast only to APs in the group. Useful when different buildings or floors need different SSIDs.

**Example:**
| WLAN Group | AP members | SSIDs |
|------------|------------|-------|
| Building-A | AP-F1-*, AP-F2-* | Corp, Guest, IoT |
| Warehouse | AP-WH-* | Scanner, Guest-Truckers |
| Executive | AP-EXEC-* | Corp-Exec (hidden), Guest |

**Create:** Settings → Wireless Networks → WLAN Group → Create → assign APs.

**Use case warehouse:** Scanner SSID only on warehouse AP — not visible in office building.

**Migration:** move AP between groups without recreating SSID — drag-drop in UI.

**Pitfall:** AP not in any group with SSID applied to «All AP» vs specific group — verify Apply To settings.`,
    },
    {
      title: 'mDNS/Bonjour and multicast-to-unicast',
      content: `**Problem:** Apple AirPrint, Chromecast, Bonjour does not work across VLANs or between Wi‑Fi clients with isolation.

**Solutions:**

**1. Same VLAN (simplest):** printer and users on VLAN 20 — Bonjour works L2.

**2. mDNS reflector/gateway helper:** if Omada gateway supports mDNS proxy between VLANs (check firmware release notes) — enable between 20 ↔ 70.

**3. Wireless multicast enhancement (WLAN Advanced):**
- Enable **Multicast Enhancement** or **mDNS forwarding** if available on EAP firmware
- Reduces multicast airtime consumption
- Converts some multicast to unicast for known clients

**4. Dedicated print SSID** on same VLAN as printers — not ideal but pragmatic SMB fix.

**Switch side:** IGMP snooping + querier on printer VLAN; allow mDNS 224.0.0.251 UDP 5353 between approved VLANs on firewall (narrow scope).

**Test:** iOS device → AirPrint discover printer → print test page.

**Security:** don't reflect mDNS Guest → Corp — prevents service enumeration attacks.`,
    },
    {
      title: 'Outdoor and industrial AP considerations',
      content: `**EAP outdoor models (EAP610-Outdoor, EAP625-Outdoor HD):**
- IP67 rated, -30°C to +65°C
- PoE+ required, shielded cable outdoor
- Higher TX power — watch channel overlap with indoor AP

**Mounting:** pole mount, grounded, surge protector on ethernet (UBNT ETH-SP or equivalent).

**SSID design outdoor:**
- «Guest-Outdoor» separate VLAN 61 if combined with indoor Guest policy differences
- Rate limit lower (3 Mbps) for parking lot users

**Backhaul:** fiber or point-to-point wireless to building — **avoid mesh** for permanent outdoor unless no alternative.

**Warehouse yard:** extend Scanner SSID to yard AP for loading dock — same VLAN 45, min RSSI -75.

**Compliance:** outdoor coverage into public street may need acceptable use policy on Guest portal.`,
    },
    {
      title: 'Wi‑Fi 7 (EAP773) and future planning',
      content: `**EAP773** — Wi‑Fi 7 (802.11be) for greenfield high density:
- 6 GHz band support (where regulatory allowed)
- Multi-link operation (MLO) on compatible clients
- Higher throughput per AP

**Planning notes 2025:**
- Client fleet mostly Wi‑Fi 6 — Wi‑Fi 7 AP backward compatible
- 6 GHz requires AFC/indoor rules per country — verify Russia/regional regulations at deploy time
- PoE++ budget higher — plan switch capacity

**Migration path:** replace EAP670 in highest density zones first (conference, open space); keep EAP670 at edge/low density.

**Controller:** ensure firmware supports EAP773 before purchase.

**Don't deploy Wi‑Fi 7 only for marketing** — Wi‑Fi 6E/7 valuable when clients exist and spectrum clean.`,
    },
    {
      title: 'RADIUS accounting and session tracking',
      content: `**RADIUS Accounting (port 1813)** — logs connect/disconnect, bytes transferred, session time.

**NPS accounting:**
1. Enable accounting on RADIUS client Omada
2. NPS → Accounting → log to file or SQL
3. Omada RADIUS profile → Accounting Enable → same secret

**Use cases:**
- Compliance: who was on Wi‑Fi when
- Capacity: peak concurrent users
- Troubleshoot: «user says disconnected» — correlate session stop time

**CoA (Change of Authorization):** limited Omada support — don't rely on dynamic disconnect via CoA for kill-switch; disable AD account instead.

**Privacy:** retain accounting logs 90 days aligned with GDPR policy; anonymize if exporting analytics.

**Dashboard:** parse NPS logs into Graylog → Grafana «Wi‑Fi sessions per day» panel.`,
    },
    {
      title: 'WPA3-Personal for Guest alternative',
      content: `**Guest SSID options compared:**

| Mode | UX | Security |
|------|-----|----------|
| Open + Portal | Best guest UX | Medium (captive portal) |
| WPA2-Personal PSK | Shared password on wall | Low (PSK shared) |
| WPA3-Personal unique PSK per event | Moderate | Medium-high |
| Open + voucher | Reception control | Medium |

**WPA3-Personal Guest:** rotate PSK weekly, post at reception — simpler than portal for small cafe, worse audit trail than voucher.

**Transition mode WPA3-Personal:** old phones connect WPA2 fallback.

**Recommendation:** office 50+ users → portal voucher; cafe 10 → open portal or weekly PSK.`,
    },
    {
      title: 'Channel planning: warehouse extended example',
      content: `**Warehouse 3000 m², 14 AP, metal racks, 8m ceiling — full channel plan:**

**5 GHz (40 MHz), non-DFS preferred for stability:**

| AP ID | Zone | 5 GHz Ch | 2.4 Ch | TX Power |
|-------|------|----------|--------|----------|
| WH-01 | Loading NE | 36 | 1 | Medium |
| WH-02 | Loading NW | 44 | 6 | Medium |
| WH-03 | Aisle A1-A5 | 52 | 11 | High |
| WH-04 | Aisle A6-A10 | 60 | 1 | High |
| WH-05 | Aisle B1-B5 | 100 | 6 | High |
| WH-06 | Aisle B6-B10 | 108 | 11 | High |
| WH-07 | Packing NE | 116 | 1 | Medium |
| WH-08 | Packing NW | 124 | 6 | Medium |
| WH-09 | Office mezz | 36 | 11 | Low |
| WH-10 | Break room | 44 | 1 | Low |
| WH-11 | Yard dock 1 | 52 | 6 | High |
| WH-12 | Yard dock 2 | 60 | 11 | High |
| WH-13 | Cold storage | 100 | 1 | High |
| WH-14 | Spare/overlap | 108 | 6 | Medium |

**Spacing rule applied:** same 5 GHz channel APs ≥ 40m apart or separated by solid walls.

**Scanner SSID:** bind 2.4 GHz only on WH-01–08; disable 5 GHz radio on scanner WLAN group if clients 2.4-only.

**Validation metric:** walking test with scanner app — roam every 30 sec, latency to ERP server < 150ms, zero session drops in 1 hour pick shift simulation.`,
    },
    {
      title: 'Captive portal: advanced HTML customization',
      content: `**Portal editor fields (Settings → Authentication → Portal → Customize):**

\\\`\\\`\\\`html
<!-- Example welcome block — paste in portal HTML section if supported -->
<div class="portal-header">
  <img src="/upload/logo.png" alt="Company" width="200" />
  <h1>Guest Wi‑Fi — Office Moscow</h1>
  <p>By connecting you accept our <a href="/terms">Acceptable Use Policy</a>.</p>
</div>
\\\`\\\`\\\`

**CSS branding:**
- Primary button color match brand guidelines
- Mobile-responsive preview in Omada portal editor
- Background image < 500 KB for fast load on cellular

**Post-auth redirect:** company.com/welcome or event page.

**Legal:** Terms of Use checkbox mandatory; log acceptance timestamp in portal logs.

**Localization:** Russian + English dual text for international guests.

**Failure mode slow portal:** oversized background image — optimize PNG/WebP.

**HTTPS:** portal served from controller or gateway — cert warning acceptable internal guest network with signage «accept certificate» OR install internal CA signed cert on controller.`,
    },
    {
      title: '15 Wi‑Fi failure scenarios: extended playbook',
      content: `**Scenario drill reference (ops training):**

**S1 Mass outage all SSIDs:** check PoE core switch → gateway → controller connectivity chain.

**S2 Corp only down, Guest OK:** RADIUS/NPS issue — check UDP 1812, DC reachable.

**S3 Guest only down:** portal service or DNS — restart portal, check firewall Guest→controller.

**S4 Single AP dead:** PoE port / AP hardware — swap AP from spare.

**S5 Slow entire floor:** co-channel interference — emergency channel change on 3 AP.

**S6 VoIP drop roam:** verify 802.11r enabled, min RSSI not too aggressive.

**S7 IoT devices flapping:** disable 802.11r on IoT SSID, fix 2.4 channel overlap.

**S8 After firmware upgrade broken:** rollback AP firmware one version on pilot AP test.

**S9 Certificate mass failure Monday AM:** AD CS expired — renew CA, redeploy GPO.

**S10 Dynamic VLAN wrong department:** NPS policy order — first match wins, fix policy priority.

**S11 Scanner warehouse timeout:** RF hole — temporary AP or relocate WH-xx.

**S12 Neighbor new AP interference:** spectrum scan, shift to less used DFS or 5 GHz upper band.

**S13 DHCP exhaustion Wi‑Fi VLAN:** expand pool or shorten lease — check for rogue AP stealing clients.

**S14 MAC randomization iOS:** use profile MDM or disable private Wi‑Fi address in corp instructions.

**S15 Portal loop after DNS change:** fix internal DNS or portal FQDN resolution on gateway.

Each scenario: document **detection → triage → fix → verify → post-mortem** in runbook wiki.`,
    },
    {
      title: 'Ekahau-free workflow: step-by-step alternative survey',
      content: `**Full workflow without Ekahau for an office of 50 people (2 floors):**

**Phase 1 — Predictive (2 hours):**
1. Receive the floor plan PDF from the landlord
2. Import to NetSpot (Mac/Windows) or print A3
3. Mark the zones: open space, meetings, kitchen (metal/appliances), server room
4. Place EAP670 virtual APs every 10–12 m open space
5. Meetings: 1× EAP650 per 3 rooms cluster
6. Export screenshot predicted coverage

**Phase 2 — Pre-install validation (4 hours):**
1. Rent 2 EAP670 + PoE switches
2. Temp mount AP at planned positions (clamp mount, not final installation)
3. Walk test grid 5m with WiFi Analyzer Android:
   - Record RSSI, channel, AP BSSID per point
   - CSV: x, y, rssi, ap_name
4. Adjust positions if RSSI < -70 dBm in desk zones
5. Document final AP coordinates

**Phase 3 — Post-install acceptance (2 hours):**
1. Final mount all AP home-run cabled
2. Adopt in Omada, apply channel plan manual
3. iperf3 server 10.0.10.20 — test 5 spots per floor target > 100 Mbps
4. Roam test: ping -t gateway while walking route 200m
5. Guest portal + Corp 802.1X spot check
6. Sign acceptance with customer

**Deliverables package:**
- PDF floor plan with AP icons + channel labels
- RSSI heatmap (NetSpot export)
- Channel plan table
- SSID/VLAN matrix
- Known dead zones list (if any acceptable)

**Cost comparison:** Ekahau Sidekick survey $15k+ tool — NetSpot Pro ~$100 one-time sufficient SMB.`,
    },
    {
      title: 'GPO Wi‑Fi profile deployment Windows',
      content: `**Enterprise Corp SSID deployment via Group Policy (PEAP):**

1. Create GPO «WiFi-Corp-Profile»
2. Computer Configuration → Policies → Windows Settings → Security Settings → Wireless Network (IEEE 802.11) Policies
3. Create Wireless Profile:
   - SSID: Corp-WiFi
   - Security: WPA2/WPA3-Enterprise
   - Authentication: PEAP, MSCHAPv2
   - Trusted Root CA: internal CA cert
   - Connect automatically
4. Link GPO to OU with laptops
5. \\\`gpupdate /force\\\` on test machine
6. Verify Event Viewer WLAN auto-connect without prompt

**macOS/iOS:** mobileconfig profile via MDM (Jamf, Intune) with same CA trust.

**Rotate CA:** plan GPO update before old CA expiry — Wi‑Fi mass failure common CA oversight.

**Lab validation before mass GPO:** test OU with 2 machines.

**Troubleshoot GPO Wi‑Fi fail:** verify machine cert trust store contains CA; user must be Domain Users for PEAP; check NPS accepts computer auth if using machine certs.

**iOS/Android corp Wi‑Fi:** distribute CA cert via MDM; on Android set «Do not validate» only in lab — never production.

**Reference:** Microsoft Wi-Fi GPO docs + NPS PEAP deployment guide for full step screenshots.`,
    },
    {
      title: 'Troubleshooting Wi‑Fi: decision tree',
      content: `**Structured triage — start top, stop when found:**

\\\`\\\`\\\`
Wi-Fi problem reported
        │
        ├─ ALL users ALL SSIDs?
        │     YES → Controller up? Gateway up? PoE switch up?
        │           → Power/core network issue (L1/L2)
        │     NO ↓
        ├─ ALL users ONE SSID?
        │     YES → RADIUS (Corp) or Portal (Guest) or VLAN trunk
        │     NO ↓
        ├─ ONE user ALL SSIDs?
        │     YES → Client device/driver/profile issue
        │     NO ↓
        ├─ ONE user ONE SSID?
        │     YES → User creds, AD lockout, wrong PSK, MAC filter
        │     NO ↓
        ├─ ONE location ALL users?
        │     YES → AP offline, RF hole, channel interference
        │     NO ↓
        └─ Intermittent roam path?
              YES → 802.11r, min RSSI, overlap too low
\\\`\\\`\\\`

**Time boxes tier-1:**
- 5 min: identify scope (all vs one)
- 10 min: check Controller dashboard device status
- 15 min: VLAN/trunk/RADIUS based on scope
- Escalate tier-2 if not resolved 30 min

**Document every ticket:** scope, BSSID, VLAN, RADIUS accept/reject, resolution — builds knowledge base.`,
    },
    {
      title: 'Wi-Fi Security for SMB',
      content: `**Minimum standard:**
- Corp: WPA3-Enterprise
- Guest: isolated VLAN + portal + rate limit
- IoT: separate SSID, isolation, no corp access
- Disable WPS
- Rotate IoT PSK quarterly
- PCI: Guest never touches CDE network

**Rogue AP review:** weekly Controller insight.

**Compliance audit:** quarterly firewall + Wi‑Fi isolation test documented.`,
    },
  ],
  practice: [
    'Create Corp SSID (WPA3-Enterprise) and Guest SSID (Portal) - VLAN 50 and 60',
    'Expand NPS: RADIUS client Omada, policy Domain Users - test 802.1X',
    'Set up WPA3-Transition SSID and test legacy + modern clients',
    'Dynamic VLAN: two AD groups → two VLANs - verify IP assignment',
    'Guest portal: custom logo, 10 vouchers, rate limit 10 Mbps',
    'Firewall Guest test: ping internal FAIL, 8.8.8.8 OK',
    'Channel plan spreadsheet for 6 AP with calculator formula',
    'Ekahau alternative: NetSpot/Omada App walk survey of one floor',
    'Spectrum scan: document 3 interferers and mitigation',
    'IoT SSID: VLAN 80, isolation, PSK rotation procedure doc',
    'Voice WLAN: enable 802.11r/k/v, MOS test while walking',
    'MAC auth fallback: whitelist 2 lab devices on IoT SSID',
    'Trunk failure drill: remove VLAN 50, reproduce, fix, document',
    'Captive portal customization: branded landing page screenshot',
    'Runbook «Wi‑Fi mass outage» — 10 steps power to RADIUS',
  ],
  resources: [
    { title: 'Omada EAP Product Line', url: 'https://www.omadanetworks.com/us/business-networking/omada/wifi/' },
    { title: 'EAP670 Datasheet', url: 'https://www.tp-link.com/us/business-networking/omada-wifi/eap670/' },
    { title: 'Microsoft NPS Documentation', url: 'https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-top' },
    { title: 'Omada Guest Portal Guide', url: 'https://support.omadanetworks.com/us/document/108003/' },
    { title: 'Wi‑Fi Alliance WPA3', url: 'https://www.wi-fi.org/discover-wi-fi/security' },
    { title: 'NetSpot Site Survey Tool', url: 'https://www.netspotapp.com/' },
  ],
  quiz: [
    {
      question: 'Corp SSID in Omada is tied to:',
      options: ['VLAN / LAN network', 'WAN only', 'USB only'],
      answer: 'VLAN / LAN network',
    },
    {
      question: 'Captive portal is used for:',
      options: ['Guest Wi‑Fi with consent and consideration', 'AD join', 'Stamps'],
      answer: 'Guest Wi‑Fi with consent and consideration',
    },
    {
      question: 'Band steering directs clients to:',
      options: ['5 GHz', 'Only 2.4 GHz', 'Ethernet'],
      answer: '5 GHz',
    },
    {
      question: 'Minimum RSSI disables:',
      options: ['Weak clients from distant AP', 'Internet completely', 'PoE'],
      answer: 'Weak clients from distant AP',
    },
    {
      question: 'RADIUS profile in Omada contains:',
      options: ['IP NPS and shared secret', 'Wi‑Fi password only', 'MAC of all PCs'],
      answer: 'IP NPS and shared secret',
    },
    {
      question: 'Mesh in Omada - when:',
      options: ['No ethernet to AP (throughput below)', 'Always required', 'DC only'],
      answer: 'No ethernet to AP (throughput below)',
    },
  ],
}

export default translation
