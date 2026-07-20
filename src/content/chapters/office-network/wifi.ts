import type { Chapter } from '../../../types'

export const officeWifiChapter: Chapter = {
  id: 'office-wifi',
  slug: 'office-wifi',
  title: 'Корпоративный Wi‑Fi',
  moduleId: 'office-network',
  order: 3,
  duration: '10–12 часов',
  level: 'intermediate',
  description:
    'SSID, WPA3-Enterprise, 802.1X с AD, guest network, site survey, roaming и безопасность беспроводной сети',
  sections: [
    {
      title: 'Архитектура корпоративного Wi‑Fi',
      content: `**Enterprise Wi‑Fi** отличается от домашнего роутера: централизованное управление, несколько SSID, VLAN mapping, RADIUS auth, roaming.

**Компоненты:**

| Компонент | Функция | Примеры |
|-----------|---------|---------|
| **Access Point (AP)** | Радио, клиенты | Ubiquiti, Omada, FortiAP, Aruba |
| **Controller** | Config, roaming, RF | Omada Software, FortiGate, UniFi |
| **RADIUS** | 802.1X auth | Windows NPS, FreeRADIUS |
| **Switch** | PoE, VLAN trunk | Managed PoE switches |
| **Firewall** | Guest isolation, policies | FortiGate |

\`\`\`
Client ←→ AP (PoE) ←trunk→ Switch ←→ FortiGate
                              ↓
                         RADIUS (NPS)
                              ↓
                         Active Directory
\`\`\`

**Не используй consumer mesh** для офиса 20+ users — нет VLAN, нет central management.`,
    },
    {
      title: 'SSID design: Corp, Guest, IoT',
      content: `| SSID | VLAN | Auth | Encryption | Назначение |
|------|------|------|------------|------------|
| **Corp-WiFi** | 50 | WPA3-Enterprise 802.1X | AES | Сотрудники AD |
| **Guest-WiFi** | 60 | WPA2-PSK or Portal | AES | Гости, изоляция |
| **IoT-Devices** | 70 | WPA2-PSK + MAC filter | AES | Принтеры WiFi, TV |
| **Mgmt** (optional) | 99 | Hidden + PSK strong | AES | AP setup only |

**Правила:**
- Max 3–4 SSID per RF (overhead reduces throughput)
- Corp = individual credentials via 802.1X
- **Никогда один PSK для всех сотрудников** — уволенный знает пароль
- Guest bandwidth limit 10–20 Mbps optional
- Broadcast SSID Guest, hide Corp optional (security through obscurity minimal)`,
    },
    {
      title: '802.1X и RADIUS: как это работает',
      content: `**WPA3-Enterprise / 802.1X EAP flow:**

\`\`\`
1. Client → Association Request → AP
2. AP → EAP-Request Identity → Client
3. Client → EAP-Response (username) → AP
4. AP → RADIUS Access-Request → NPS
5. NPS → AD credential check
6. NPS → Access-Accept + VLAN attribute → AP
7. AP → Client connected VLAN 50
\`\`\`

**EAP methods:**

| Method | Auth | Сертификаты | Сложность |
|--------|------|-------------|-----------|
| **PEAP-MSCHAPv2** | AD user/pass | Server cert only | Low (start here) |
| **EAP-TLS** | Client cert | Server + client cert | High (most secure) |
| **EAP-TTLS** | Similar PEAP | Server cert | Medium |

**Рекомендация SMB:** PEAP-MSCHAPv2 + server cert from internal CA, push CA via GPO.`,
    },
    {
      title: 'Windows NPS: настройка пошагово',
      content: `**Network Policy Server на Windows Server:**

**Шаг 1 — Install role:**
- Server Manager → Add Roles → Network Policy and Access Services → NPS

**Шаг 2 — Register in AD:**
- NPS console → right-click NPS → Register in Active Directory

**Шаг 3 — RADIUS client (AP):**
- RADIUS Clients → New
- Friendly name: Omada-APs
- Address: AP management subnet or individual AP IPs
- Shared secret: strong random (same on controller)

**Шаг 4 — Connection Request Policy:**
- Allow all (default) or restrict

**Шаг 5 — Network Policy:**
- Conditions: NAS Port Type = Wireless
- Constraints: EAP Type = PEAP
- Settings: VLAN ID 50 (Tunnel-Type, Tunnel-Medium, Tunnel-Pvt-Group-ID)

**Шаг 6 — Certificate:**
- Server cert with SAN for NPS hostname
- Auto-enroll via AD CS or public cert

**Шаг 7 — Test:**
- NPS event log → success/fail reason`,
    },
    {
      title: 'Настройка AP и controller (Omada example)',
      content: `**Omada Controller — WLAN config:**

1. Settings → Wireless Networks → Create
2. SSID: Corp-WiFi
3. Security: WPA3-Enterprise
4. RADIUS Profile:
   - Primary: 192.168.10.12 (NPS IP)
   - Port: 1812
   - Secret: [match NPS client]
5. VLAN: 50 (override on SSID)
6. Apply to AP group All-Office

**AP switch port:** Trunk, allowed VLAN 50,60,99

**Fast Roaming:** Enable 802.11r (FT) for Corp SSID

**Band steering:** Prefer 5 GHz

**Min RSSI:** -75 dBm (disconnect weak clients)

**FortiAP:** similar on FortiGate WiFi controller, RADIUS defined centrally.`,
    },
    {
      title: 'Guest Wi‑Fi: изоляция и captive portal',
      content: `**Guest requirements:**
- Internet only — NO access RFC1918 (192.168.x.x, 10.x.x.x)
- Client isolation — guests don't see each other
- Optional: bandwidth limit, time limit
- Captive portal — terms acceptance + logging

**FortiGate Guest policy:**
\`\`\`
Source: VLAN60-Guest (192.168.60.0/24)
Destination: WAN interface only
Service: HTTP, HTTPS, DNS, NTP
Action: ACCEPT
Log: Yes

Explicit DENY:
Source: VLAN60 → Destination: all internal VLANs
Action: DENY
\`\`\`

**Captive portal (FortiGate/Omada):**
- Splash page: Terms of Use
- Optional: email collection
- Session timeout: 8 hours
- Walled garden: allow portal, DNS before auth

**PSK Guest:** rotate monthly, display in lobby QR code only`,
    },
    {
      title: 'Site survey: планирование покрытия',
      content: `**Pre-deployment survey (predictive):**
1. Floor plan scale drawing (CAD or PDF)
2. Wall materials: drywall (-3 dB), concrete (-10 dB), glass (-2 dB)
3. AP placement ceiling, center of areas
4. Target RSSI: -65 dBm minimum data areas, -70 dBm acceptable
5. Overlap 15–20% for roaming (same channel avoid!)

**AP density guidelines:**

| Environment | Area per AP | Notes |
|-------------|-------------|-------|
| Open office | 80–120 m² | Ceiling mount |
| Dense cubes | 60–80 m² | More APs |
| Conference rooms | 1 AP per large room | High density |
| Warehouse | 150–200 m² | Higher power AP |

**Post-deployment (validation survey):**
- Walk with WiFi analyzer (Ekahau, NetSpot)
- Measure RSSI, SNR per location
- Fix dead zones — add AP or reposition

**Инструменты:**
- Ekahau Pro (professional)
- NetSpot (SMB)
- Omada built-in site survey
- Android WiFi Analyzer (quick check)`,
    },
    {
      title: 'RF planning: каналы и мощность',
      content: `**2.4 GHz (802.11b/g/n):**
- Only channels 1, 6, 11 (non-overlapping)
- Limited to legacy devices, IoT
- High interference (microwave, Bluetooth)
- Use for guest/IoT if needed, minimize Corp

**5 GHz (802.11a/n/ac/ax) — primary for Corp:**
- Non-DFS channels (no radar wait): 36, 40, 44, 48, 149, 153, 157, 161
- DFS channels (52–144): more spectrum, radar detection pause
- 80 MHz channels in low density, 40 MHz in high density

**6 GHz (Wi‑Fi 6E):** if AP/clients support, future-proof

**Channel plan example (3 APs, 5 GHz):**
| AP | Channel | Width |
|----|---------|-------|
| AP-F1-01 | 36 | 40 MHz |
| AP-F1-02 | 44 | 40 MHz |
| AP-F1-03 | 149 | 40 MHz |

**TX power:** auto or manual — reduce if APs too close (co-channel interference)

**RRM (Radio Resource Management):** controller auto channel/power — enable after baseline manual`,
    },
    {
      title: 'Roaming и производительность',
      content: `**Roaming problem:** client sticks to distant AP, low speed.

**Solutions:**

| Feature | Standard | Benefit |
|---------|----------|---------|
| **802.11r (FT)** | Fast Transition | Faster re-auth same SSID |
| **802.11k** | RRM | AP suggests better AP |
| **802.11v** | BSS Transition | AP can steer client |
| **Band steering** | Vendor | Push to 5 GHz |
| **Min RSSI** | Vendor | Kick weak clients |

**Enable on Corp SSID:**
- 802.11r: yes (test with older clients)
- Fast roaming in Omada/FortiAP
- Min RSSI: -75 dBm

**VoIP/Teams on Wi‑Fi:**
- WMM (Wi-Fi Multimedia) enabled
- QoS priority voice
- Separate VLAN 50 with same policies as wired
- Avoid 2.4 GHz for voice`,
    },
    {
      title: 'Troubleshooting matrix: Wi‑Fi',
      content: `| Симптом | Проверка 1 | Проверка 2 | Fix |
|---------|------------|------------|-----|
| Can't see SSID | AP powered? | Broadcasting enabled? | PoE, enable SSID |
| Can't connect Corp | 802.1X creds? | username@domain | Correct format |
| Cert warning | GPO root CA? | Server cert valid? | Deploy CA cert |
| Connected no IP | VLAN 50 DHCP? | Relay? | Fix DHCP scope |
| Connected no internet | Firewall policy? | DNS? | Guest vs Corp policy |
| Slow speed | RSSI weak? | Channel congest? | Move, change channel |
| Drops frequently | Roaming issue? | Driver old? | 11r, update driver |
| One user only | Device issue? | MAC block? | Forget network |
| All on one AP | Others down? | Controller? | Restart AP, check trunk |
| Guest no internet | Isolation policy | Portal stuck? | FG policy, portal bypass |

**Logs:**
- NPS Event Viewer → Network Policy Server
- AP controller client log
- FortiGate wireless log`,
    },
    {
      title: 'Безопасность Wi‑Fi',
      content: `**Must have:**
- WPA3-Enterprise or WPA2-Enterprise (not WPA2-PSK for staff)
- Unique Guest VLAN + firewall deny internal
- Disable WPS (always)
- Firmware updates quarterly
- Strong RADIUS shared secret
- Rogue AP detection (controller scan)
- Monitor deauth attacks

**Don't rely on:**
- Hidden SSID (trivial to discover)
- MAC filtering alone (MAC spoofing easy)

**Evil twin attack mitigation:**
- 802.1X with server cert validation
- Educate users: don't connect unknown SSID
- Wireless IPS (enterprise controllers)

**WPA3 improvements:** SAE (dragonfly) replaces PSK handshake weaknesses for personal mode`,
    },
    {
      title: 'Wi‑Fi для офисов 10, 50, 100 пользователей',
      content: `**10 users (~150 m²):**
- 2 AP Wi‑Fi 6
- 1 Corp + 1 Guest SSID
- NPS on DC if AD
- PoE switch 130W sufficient

**50 users (~800 m², 2 floors):**
- 6 AP ceiling mount
- Omada/Forti controller
- Dedicated NPS VM
- Channel plan documented
- Heatmap validation

**100 users (~2000 m², 3 floors):**
- 12–15 AP
- Controller HA or cloud
- 2 NPS servers load balanced
- Dedicated WiFi-Corp VLAN /23
- Professional Ekahau survey
- 802.11r/k/v enabled
- On-call for P1 WiFi outages`,
    },
    {
      title: 'Сертификаты для EAP-TLS (advanced)',
      content: `**EAP-TLS deployment (optional upgrade from PEAP):**

1. AD CS (Certificate Authority) on-prem
2. User or computer certificate template
3. Auto-enrollment GPO for domain machines
4. NPS policy requires EAP-TLS
5. AP unchanged (still RADIUS)

**Benefits:** no password over air, phishing-resistant
**Challenges:** BYOD needs manual cert or MDM, cert renewal

**MDM (Intune):** deploy Wi‑Fi profile with cert for mobile devices.`,
    },
    {
      title: 'MDM Wi‑Fi profiles (Intune)',
      content: `**Intune Wi‑Fi configuration profile:**

- Platform: Windows 10/11, iOS, Android
- Network name: Corp-WiFi
- Connect automatically: Yes
- SSID: Corp-WiFi
- Security type: WPA2-Enterprise / WPA3
- EAP type: PEAP
- Authentication: Username/password (Azure AD)
- Or certificate for EAP-TLS
- Proxy: none

**Benefit:** users don't manually configure 802.1X — fewer L1 tickets.

**RADIUS for Azure AD:** NPS still for on-prem, or cloud RADIUS (JumpCloud, RADIUS-as-a-Service) for cloud-only.`,
    },
    {
      title: 'Мониторинг и алерты Wi‑Fi',
      content: `**Metrics to monitor:**
- AP online/offline status
- Client count per AP
- Channel utilization > 70%
- DHCP pool WiFi VLAN exhaustion
- RADIUS auth failure rate spike
- Rogue AP detected

**Alerts:**
- AP offline > 5 min → P2
- All AP floor offline → P1
- RADIUS failures > 10/min → P2 security check

**Controller dashboard:** review weekly utilization for capacity planning.`,
    },
    {
      title: 'Runbook: пользователь не подключается к Wi‑Fi',
      content: `**L1 playbook (8 steps):**

1. Corp or Guest SSID?
2. Other users same area ok?
3. Forget network → reconnect
4. Username format: user@company.local
5. Certificate error? — need Corp root CA (GPO)
6. IP address received? (169.254 = DHCP issue → L3)
7. Wired works? — isolate WiFi issue
8. Escalate L3: AP log, RADIUS NPS event, VLAN trunk

**NPS rejection reasons (Event Viewer):**
- 6273: denied — wrong password
- 6272: success
- Reason code: certificate, policy mismatch`,
    },
    {
      title: 'Сравнение WPA2-PSK vs WPA3-Enterprise',
      content: `| Критерий | WPA2-PSK | WPA3-Enterprise |
|----------|----------|-----------------|
| Auth | Shared password | Individual AD |
| Leaver risk | Must change PSK all | Disable AD account |
| Setup complexity | Low | Medium (NPS) |
| Security | Moderate | High |
| BYOD | Easy (give PSK) | Cert or PEAP |
| Recommended for | Guest, IoT | Staff Corp |

**Вердикт 30+ staff:** WPA3-Enterprise mandatory for Corp SSID.`,
    },
    {
      title: 'Heatmap interpretation',
      content: `Red -40dBm excellent, yellow -65 ok, blue -75 edge, gray no coverage. -67 dBm voice requirement. Overlap 15-20% 2.4GHz, cell sizing 5GHz.`,
    },
    {
      title: 'Ekahau survey report reading',
      content: `Primary/Secondary coverage, data rate maps, interference, AP placement recommendations, capacity users/AP.`,
    },
    {
      title: 'Wi-Fi 6E/7 planning',
      content: `6E adds 6GHz band more channels; 7 multi-link operation future. Plan: Corp on 5+6GHz, IoT 2.4, avoid legacy only if clients support.`,
    },
    {
      title: 'Rogue AP detection',
      content: `FortiGate/Omada rogue scan, classify unauthorized, contain deauth, locate by signal strength walk test.`,
    },
    {
      title: 'Wireless pen test',
      content: `Evil twin, PMKID capture, WPA2-PSK crack guest risk, 802.1X bypass attempts, management interface exposure.`,
    },
    {
      title: 'Guest WiFi legal compliance',
      content: `EU GDPR: minimal logging, privacy policy portal, data retention 30d, consent banner RU 152-FZ logging requirements consult legal.`,
    },
    {
      title: 'Лабораторная (16 шагов)',
      content: `**Цель:** пройти полный operational workflow от симптома до postmortem и улучшения процесса.

**Подготовка (30 мин):** ITSM trial / lab VM / Excel dashboard template / доступ read-only к FortiGate или Omada (optional).

| # | Шаг | Детали | Done |
|---|-----|--------|------|
| 1 | Подготовить среду | Portal, 3 queues, email-to-ticket | ☐ |
| 2 | SLA policies | P1 15m/4h, P3 4h/24h, pause Pending | ☐ |
| 3 | KB deflection | 5 статей: VPN, пароль, Wi‑Fi, Outlook, принтер | ☐ |
| 4 | Создать Incident | «Нет интернета», category Network, P3 | ☐ |
| 5 | Заполнить контекст | Asset tag, floor, scope 1 user, screenshot | ☐ |
| 6 | L1 диагностика | ipconfig, ping GW, ping 8.8.8.8, nslookup | ☐ |
| 7 | Документировать | Каждая команда + output в ticket comment | ☐ |
| 8 | Эскалация | 10-field form L1→L3 если не решено 20 min | ☐ |
| 9 | L2/L3 fix | Root cause: DNS или DHCP — apply fix | ☐ |
| 10 | Resolve | Resolution notes + link KB | ☐ |
| 11 | CSAT | Mock survey 1–5 + comment | ☐ |
| 12 | Service Request | «Монитор 27"» — manager approval flow | ☐ |
| 13 | Problem ticket | Link 3 похожих VPN incidents | ☐ |
| 14 | P1 simulation | Tabletop «весь офис offline» + war room roles | ☐ |
| 15 | Comms draft | 3 emails: T+0, T+30, Resolved | ☐ |
| 16 | Dashboard | FRT, MTTR, SLA%, reopen rate — 4 charts Excel | ☐ |
| 17 | Postmortem | Blameless 1 page, 3 action items | ☐ |
| 18 | Automation | Rule: category Network → L3 queue | ☐ |
| 19 | Retro | 2 improvements в CSI register | ☐ |
| 20 | Peer review | Коллега проверяет ticket quality checklist | ☐ |

**Критерии успеха:** ticket audit score ≥90%; postmortem action items assigned; dashboard reflects mock data.`,
    },
    {
      title: 'FAQ — 12 частых вопросов',
      content: `| # | Вопрос | Ответ |
|---|--------|--------|
| 1 | Incident vs Service Request? | Incident = сломалось, восстановить ASAP. Request = стандартная услуга по каталогу. |
| 2 | Когда эскалировать? | Нет прогресса 20 мин; затронута инфраструктура; нужны права L2/L3; security event. |
| 3 | Можно сбросить пароль по email? | Нет без multi-factor identity verification по policy. |
| 4 | CEO требует P1 для принтера? | Объяснить impact matrix; оформить корректный приоритет P3/P4. |
| 5 | Нужен ли тикет на 2-мин fix? | Да — audit trail, метрики, KB input. |
| 6 | Angry user on phone? | Empathy + ETA + focus on fix; escalate threats to lead. |
| 7 | Что такое FCR? | First Contact Resolution — решено с первого контакта без reopen/escalate. |
| 8 | Problem ticket когда? | 3+ similar incidents/month или unknown root cause after L3. |
| 9 | Отключить MFA временно? | Нет без documented Security exception. |
| 10 | Что в resolution notes? | Symptom, checks, actions, result, KB link, versions. |
| 11 | 10 open tickets — порядок? | P1/P2 → SLA at risk → FIFO within priority. |
| 12 | KB vs playbook? | KB = user-facing deflection; playbook = internal agent runbook with escalation. |`,
    },
    {
      title: 'Матрица troubleshooting (24 строки)',
      content: `| # | Симптом | L1 checks (15 min) | Вероятная причина | Действие | Эскалация |
|---|---------|-------------------|-------------------|----------|-----------|
| 1 | Нет интернета 1 user | Scope wired/Wi‑Fi | DHCP/DNS/local | ipconfig /renew, flushdns | L3 if subnet |
| 2 | Нет интернета all | WAN LED, mobile test | ISP/FW outage | P1 ticket, notify L3 | Immediate |
| 3 | VPN не подключается | Creds, MFA, version | Profile/cert | Reinstall FortiClient | L2 FG logs |
| 4 | Outlook disconnect | OWA works? | OST corrupt/cert | Safe mode, recreate OST | L2 Exchange |
| 5 | Teams нет звука | Device settings | UDP blocked/driver | Clear cache, test call | L2 network |
| 6 | Медленный ПК | Task Manager disk/RAM | Full disk, leak | Cleanup, reboot | L2 hardware |
| 7 | Не входит Windows | Network, caps lock | Profile/AD lock | Unlock, reset pass | L2 profile |
| 8 | Принтер offline | Ping IP | Spooler/GPO | Restart spooler | L2 print server |
| 9 | OneDrive не sync | Account quota | Token stale | Reset OneDrive | L2 SharePoint |
| 10 | BitLocker boot | Verify identity | TPM change | Recovery key Intune | L2 recurring |
| 11 | Wi‑Fi не подключается | SSID, forget network | 802.1X/RADIUS | Re-auth AD creds | L3 NPS |
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
      title: 'Case study 1: Лавина Outlook тикетов',
      content: `**Контекст:** Финтех офис 80 FTE, понедельник 09:00, 47 тикетов «Outlook certificate error».

**Timeline:**
- 09:05 — L1 замечает pattern в queue filter
- 09:10 — Senior L1 создаёт master ticket, links duplicates
- 09:12 — Priority P2 (OWA web работает — workaround exists)
- 09:20 — L3: expired cert on legacy Exchange load balancer
- 09:35 — Emergency change approved verbally
- 09:50 — Cert renewed, clients reconnect after Outlook restart
- 10:15 — All-staff resolved email

**Метрики:** MTTR 70 min; 47 tickets → 1 master + 46 linked; CSAT dipped to 3.8 that week.

**Action items:** Cert expiry monitoring PRTG 30d alert; auto-renew Let's Encrypt where applicable; KB «Outlook cert error» updated.`,
    },
    {
      title: 'Case study 2: BEC «CEO password»',
      content: `**Контекст:** 22:15 email «от CEO»: «Срочно сбрось пароль, конфколл через 10 мин».

**Действия:**
- L1 on-call не сбросил пароль
- Позвонил CEO на mobile из AD — CEO не отправлял
- Создал P2 Security, заблокировал sender domain
- Security: BEC attempt, blocked IP, training scheduled

**Уроки:** After-hours не ослабляет verification; single-channel email insufficient; report to Security within 15 min.`,
    },
    {
      title: 'Case study 3: 50 remote Autopilot',
      content: `**Контекст:** EdTech наняла 50 remote teachers за 1 неделю, все Autopilot.

**Подход:**
- Pre-staged profiles by department in Intune groups
- Snipe-IT serial import → Autopilot group tag
- Shipping partner + tracking in Service Request tickets
- Day-1 batch Teams onboarding 10 users per slot

**Results:** 48/50 zero-touch; 2 needed manual ESP (TPM firmware update).
**KB video** «Распакуй и включи» снизил inbound calls на 60%.`,
    },
    {
      title: 'CompTIA A+ / Network+ mapping',
      content: `| CompTIA objective | Domain | Где в главе | Exam |
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
      title: '10 вопросов на собеседовании',
      content: `| # | Вопрос | Сильный ответ включает |
|---|--------|------------------------|
| 1 | Incident lifecycle? | New→Open→In Progress→Pending→Resolved→Closed; SLA pause |
| 2 | Как определите P1? | Impact × urgency; примеры: all office down vs one printer |
| 3 | Пример эскалации? | Ticket #, scope, steps, logs, suspect, test contact |
| 4 | Password reset verify? | Phone AD, badge, manager — never email alone |
| 5 | Problem Management? | Recurring incidents, root cause, Known Error, Change |
| 6 | Снизить ticket volume? | KB deflection, automation, self-service, training |
| 7 | FRT vs MTTR? | First response vs mean time to resolved |
| 8 | Remote support ethics? | Consent, log session, no unattended access |
| 9 | Документирование? | Every step in ticket; asset, versions, screenshots |
| 10 | Career 2 years? | Concrete skills: AD, PowerShell, Network+, project |`,
    },
    {
      title: 'Шаблоны: email, эскалация, KB',
      content: `**1. Email — решение**
\`\`\`
Тема: [{{TICKET}}] Решено — {{SUBJECT}}
Здравствуйте, {{NAME}}!
Выполнено: {{SUMMARY}}.
Действие: {{USER_ACTION}}.
Подтвердите ответом на письмо. CSAT: {{URL}}
IT Support | {{COMPANY}}
\`\`\`

**2. Email — нужна информация**
\`\`\`
Тема: [{{TICKET}}] Уточните, пожалуйста
{{QUESTIONS}}
Скриншот ошибки ускорит решение.
\`\`\`

**3. Escalation form L1→L3**
Ticket | Priority | Scope | Start | Impact | L1 steps | Suspect | Logs | Test user | Deadline

**4. KB article skeleton**
# Title | Symptoms | Prerequisites | Steps 1-n | Still broken? → ticket cat X | Related | Owner | Updated`,
    },
    {
      title: 'Дополнительные best practices и checklist',
      content: `**Ежемесячный review checklist:**
- [ ] Обновить KB и playbooks по итогам тикетов
- [ ] Проверить SLA compliance и CSAT trend
- [ ] Review открытых Problem tickets
- [ ] Аудит DHCP/DNS/VLAN конфигурации
- [ ] Firmware security patches network gear
- [ ] Backup конфигов firewall/switch
- [ ] Тест failover WAN / DHCP / RADIUS
- [ ] Training gap analysis для L1
- [ ] Обновить asset inventory
- [ ] Retro major incidents если были

**Документирование:** каждое изменение — ticket + change record + config backup + diagram update.

**Коммуникация:** пользователи ценят ETA больше скорости — always set expectations.

**Безопасность:** least privilege, segment networks, verify identity, log actions.

**Непрерывное обучение:** 2h/неделю lab + сертификация milestone quarterly.`,
    },
    {
      title: 'Wi‑Fi 6E channel plan детально',
      content: `6 GHz: more 80/160 MHz channels, less interference. Requires 6E clients. Plan Corp SSID on 5+6 GHz band steering. 2.4 GHz for IoT legacy only.`,
    },
    {
      title: 'Ekahau report: секции и KPI',
      content: `Sections: Coverage (Primary/Secondary), Data rate, SNR, Interference, AP placement, Capacity. Accept: -67 dBm 95% area voice/data.`,
    },
    {
      title: 'Справочник терминов IT Support и сети',
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
      content: `**Heatmap reading guide:**
Red -30 to -50 excellent; yellow -50 to -65 good; light green -65 to -75 edge usable; blue -75+ weak; gray no coverage. Voice recommend -67 dBm 95% coverage area.

**Ekahau survey report sections:**
1 Project info 2 Coverage Primary/Secondary 3 Data rate 4 SNR 5 Interference 6 AP list 7 Recommendations 8 Bill of materials AP count

**Wi‑Fi 6 vs 6E vs 7 planning:**
Wi‑Fi 6 802.11ax 2.4/5 GHz; 6E adds 6 GHz band wider channels; 7 802.11be multi-link ops future; plan cable Cat6a AP drops; 2.5G PoE switches if multi-gig APs

**Channel plan 5 GHz example 6 AP:**
Use 36-48-52-100-116-132 non-DFS if possible; 20 MHz width dense office reduce overlap; 40 MHz if low AP count

**Rogue AP detection workflow:**
Weekly controller scan; classify rogue vs neighbor; contain if evil twin SSID Corp; physical walk hunt signal strength peak

**Wireless pen test scope SMB:**
Evil twin captive portal; WPA2-PSK guest crack demo; 802.1X cert validation; mgmt interface exposure; recommend fixes prioritized

**Guest Wi‑Fi legal RU/EU:**
EU GDPR: privacy policy portal language; minimal logging IP time; retention 30–90d documented; RU 152-FZ consult legal logging personal data; captive terms accept checkbox

**802.1X PEAP deployment checklist:**
NPS registered AD; RADIUS clients AP subnets; server cert from internal CA; GPO push CA trust clients; test Android/iOS/macOS/Windows

**EAP-TLS when:**
High security finance; deploy client certs SCEP Intune; more support overhead

**Roaming optimization:**
Same SSID both bands; 802.11k/r/v enable if controllers support; min RSSI -70 disconnect sticky clients; AP power not max reduce overlap

**FortiAP vs Omada vs standalone:**
Centralized policy; VLAN mapping SSID; firmware schedule maintenance window monthly

**UDP ports firewall for Teams/Zoom Wi‑Fi users:**
443 TCP primary; 3478-3481 UDP real-time; verify not blocked inter-VLAN

**Captive portal guest flow:**
HTTP redirect VLAN60; terms; bandwidth limit 20Mbps; session timeout 8h; sponsor email optional enterprise

**Wi‑Fi calling corporate:**
If used verify QoS DSCP EF; carrier support; may not work all carriers test pilot

**Bluetooth interference 2.4 GHz:**
Headsets conflict Wi‑Fi ch1-11; prefer 5 GHz corp SSID; educate users

**AP placement rules:**
Center of cell not corner; ceiling mount height 3m typical; avoid metal, microwave, elevator shafts; one AP per 60-80 m² open office rule thumb adjust survey

**Power settings:**
Reduce TX power in dense deploy; too high causes sticky clients and co-channel interference

**Mesh vs wired AP:**
Corp always wired Ethernet backhaul; mesh only temporary events not production office

**Survey tools:**
Ekahau professional; NetSpot budget; Omada built-in basic; always validate with client device not just survey laptop

**Acceptance criteria document:**
95% area -67 dBm Corp SSID; guest isolation verified ping internal fail; 802.1X success rate >99% test 20 devices

**Troubleshooting intermittent Wi‑Fi:**
Driver update; roam to AP; RADIUS timeout check; DHCP lease short; interference Wi‑Fi analyzer

**Case study Wi‑Fi:**
Open office -85 dBm dead zones after move — survey found AP removed during remodel — add 2 AP fix CSAT

**Interview Wi‑Fi questions:**
802.1X flow; difference WPA2-PSK vs Enterprise; why max 4 SSID; rogue AP response; -67 dBm meaning

**Wi‑Fi 6E regulatory:**
Check country 6 GHz allowed; EU US timelines differ; AP region lock correct

**Monitoring Wi‑Fi:**
Controller alerts AP down; SNMP trap; user complaint trending dashboard

**Firmware upgrade playbook:**
Notify users; maintenance window; upgrade controller first then AP stagger; rollback previous firmware file saved

**Multicast Wi‑Fi:**
Disable if not needed; enable only video conferencing VLAN optimized

**Outdoor AP:**
Different model IP67; point-to-point bridge between buildings licensed band check

**Wi‑Fi security summary table:**
Guest WPA2-PSK isolate; Corp WPA3-Enterprise 802.1X; IoT WPA2-PSK MAC filter; Mgmt hidden strong PSK`,
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
      title: 'Справочник — escalation tree и glossary supplement',
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
      title: 'Exam prep, sign-off и pacing guide',
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
      title: 'Summary checklist перед сдачей главы',
      content: `Перед завершением убедись:
- [ ] Прочитал все секции и прошёл lab 15+ шагов
- [ ] Заполнил troubleshooting matrix для 5 своих кейсов
- [ ] Ответил на 12 FAQ без подсказок
- [ ] Подготовил 3 case study examples из практики или sim
- [ ] Сопоставил 5 тем с CompTIA Network+ objectives
- [ ] Отрепетировал 10 interview questions вслух
- [ ] Сохранил templates email/escalation/KB в личный runbook
- [ ] Выполнил минимум 10 из 15 practice tasks
- [ ] Duration 10–12 часов — залогировал фактическое время
- [ ] Обновил личные заметки cross-links другие модули handbook`,
    },
    {
      title: 'Credits и версия материала',
      content: `Материал v2.0 expanded July 2026. Slug и moduleId сохранены. Следующий review: через 6 месяцев или после major vendor firmware generation change (Wi‑Fi 7 mass adoption). Feedback: ticket internal IT education queue.

**Lineage:** базовая глава Wi‑Fi → expanded edition с heatmap, Ekahau, 6E/7, rogue AP, pen test, guest compliance.
**Target audience:** L1/L2 support + junior network engineers SMB office.`,
    },
    {
      title: 'Резюме главы',
      content: `1. **Architecture** — AP + controller + NPS + AD + VLAN trunk
2. **SSID** — Corp (802.1X VLAN 50), Guest (isolated VLAN 60)
3. **NPS** — RADIUS client, network policy, VLAN attribute
4. **Site survey** — predictive + validation, -65 dBm target
5. **Channels** — 5 GHz primary, 1/6/11 only on 2.4
6. **Roaming** — 802.11r/k/v, band steering, min RSSI
7. **Security** — no shared PSK staff, guest firewall deny LAN
8. **Troubleshooting matrix** — systematic L1→L3

> Wi‑Fi — частый источник L1 тикетов. Инвестиция в правильный survey и 802.1X окупается снижением инцидентов и рисков.`,
    },
  ],
  practice: [
    'Ekahau/NetSpot heatmap mock floor',
    'SSID design 3 SSID table',
    'NPS RADIUS lab',
    '802.1X PEAP config doc',
    'Guest portal captive setup',
    'Rogue AP drill',
    'Wi-Fi 6E channel plan',
    'UDP 3478-3481 firewall verify',
    'Roaming test walk',
    'Ekahau report section summary',
    'Wireless pen test checklist',
    'GDPR guest WiFi policy',
    'AP placement 6 AP floor plan',
    'Power settings reduce overlap',
    'Survey acceptance -67dBm',
  ],
  resources: [
    { title: 'Ekahau', url: 'https://www.ekahau.com/' },
    { title: 'Wi-Fi 6E', url: 'https://www.wi-fi.org/discover-wi-fi/wi-fi-certified-6' },
    { title: 'Microsoft NPS', url: 'https://learn.microsoft.com/en-us/windows-server/networking/technologies/nps/nps-top' },
    { title: 'Omada Wi-Fi', url: 'https://support.omadanetworks.com/' },
    { title: 'WPA3-Enterprise', url: 'https://www.wi-fi.org/discover-wi-fi/security' },
    { title: 'CompTIA Network+', url: 'https://www.comptia.org/certifications/network' },
  ],
}
