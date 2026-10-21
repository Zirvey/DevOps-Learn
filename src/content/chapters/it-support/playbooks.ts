import type { Chapter } from '../../../types'

export const supportPlaybooksChapter: Chapter = {
  id: 'support-playbooks',
  slug: 'support-playbooks',
  title: 'Playbooks: типовые инциденты',
  moduleId: 'it-support',
  order: 3,
  duration: '10–12 часов',
  level: 'intermediate',
  description:
    'Пошаговые runbooks: нет интернета, VPN, Wi‑Fi, пароль, вирус, фишинг и координация с сетевой командой',
  sections: [
    {
      title: 'Как пользоваться playbooks',
      content: `**Playbook (runbook)** — пошаговая инструкция для типового инцидента. Цель: любой L1 решает одинаково, ничего не забывает, эскалирует с полным контекстом.

**Правила работы с playbook:**
1. Следуй шагам по порядку, отмечай в тикете что выполнено
2. Не пропускай «уточни scope» — это экономит часы
3. Если за 20 мин не продвинулся — эскалация с чеклистом
4. Обновляй playbook после postmortem
5. Версионируй в Confluence/KB с датой

**Формат playbook в KB:**
- Metadata: версия, автор, last review
- Scope: L1 / L2 / L3
- Estimated time
- Prerequisites: доступы, tools
- Steps numbered
- Escalation criteria
- Related playbooks`,
    },
    {
      title: 'Playbook 01: Нет интернета (один пользователь)',
      content: `**Scope:** L1 | **Time:** 15–20 min | **Priority:** P3

**Шаги:**
1. **Уточни scope:** только ты или коллеги рядом тоже?
2. **Физика:** кабель воткнут? Wi‑Fi connected? Правильный SSID (Corp)?
3. **ipconfig /all:** есть IPv4? APIPA 169.254.x.x = DHCP fail
4. **Ping gateway** (192.168.x.1): ok?
5. **Ping 8.8.8.8:** ok? Если да — проблема DNS
6. **Ping google.com:** fail при ok 8.8.8.8 → DNS
7. **DNS fix:** ipconfig /flushdns, проверь DNS server = DC IP
8. **Proxy:** Settings → Network → Proxy — off?
9. **VPN:** disconnect VPN, retry
10. **Другой браузер / InPrivate** — исключить extension
11. **Перезагрузка** ПК и switch port (если dock)
12. **Эскалация L3** если subnet-wide или switch issue

**Эскалация если:** gateway ping fail, соседи тоже, APIPA persists after renew`,
    },
    {
      title: 'Playbook 02: Нет интернета (весь офис) — P1',
      content: `**Scope:** L1 open, L3 resolve | **Time:** P1 SLA | **Priority:** P1

**L1 (первые 15 мин):**
1. Создай **P1 ticket**, notify team lead (phone + Teams)
2. Подтверди scope: wired + Wi‑Fi? все этажи? VPN remote ok?
3. Проверь status page провайдера / соседние офисы
4. FortiGate/Omada GUI (read-only): WAN link up? (не перезагружай!)
5. Один тест с телефона на mobile data — внешний сервис down?
6. Собери 3 user reports: hostname, IP, error
7. Handoff L3 с ticket update

**L3:**
1. WAN interface status, errors, recent changes
2. Ping ISP gateway, traceroute
3. Failover WAN — переключился?
4. Recent change? Rollback if needed
5. ISP ticket / NOC call
6. **Comms:** all-staff email каждые 30 min
7. Postmortem в 48h

**ЗАПРЕЩЕНО L1:** reboot firewall, менять policies`,
    },
    {
      title: 'Playbook 03: VPN не подключается',
      content: `**Scope:** L1→L2 | **Time:** 20–30 min | **Priority:** P3

1. FortiClient версия = approved? (Company Portal)
2. Credentials верны? Caps Lock? MFA token synced?
3. Home internet работает? (browser)
4. **Screenshot error** — записать точный код
5. Mobile hotspot test — исключить home router block
6. AD account enabled? Not locked?
7. Test-NetConnection vpn.company.com -Port 443
8. Clear FortiClient config, re-import profile
9. Disable other VPN clients
10. Windows time sync correct? (MFA TOTP sensitive)
11. **L3:** SSL-VPN license seats, FG logs, RADIUS, cert expiry`,
    },
    {
      title: 'Playbook 04: Wi‑Fi не подключается',
      content: `**Scope:** L1 | **Time:** 15 min | **Priority:** P3

1. Corp-WiFi или Guest?
2. Forget network → reconnect
3. 802.1X: username@company.local format
4. Certificate warning — GPO root CA installed?
5. Другие users на том же AP?
6. Wired works, Wi‑Fi only?
7. Airplane mode off, Wi‑Fi adapter enabled
8. Driver update (Device Manager)
9. **L3:** AP status Omada, RADIUS log, VLAN trunk, min RSSI`,
    },
    {
      title: 'Playbook 05: Сброс пароля AD / Azure AD',
      content: `**Scope:** L1 | **Time:** 10 min | **Priority:** P3 (P2 C-level)

**Верификация (обязательно):**
- In-person + badge, OR
- Callback mobile из AD (not ticket email), OR
- Manager approval email from known address

**Шаги:**
1. AD Users & Computers → Reset password
2. Check «Unlock account» if locked
3. «User must change at next logon»
4. Temp password — **голосом** или in-person, NEVER email plain text
5. Confirm login: PC or OWA
6. VPN works after reset?
7. Document verification method in ticket

**Self-service:** направь на Azure AD SSPR если настроен`,
    },
    {
      title: 'Playbook 06: Account locked out',
      content: `**Scope:** L1 | **Time:** 10 min

1. Verify identity (same as password reset)
2. AD → Account tab → Unlock account
3. Find lockout source: saved creds, mobile sync, service?
4. Event ID 4740 on DC — caller computer name
5. User education: old password on phone mail app
6. If recurring → Problem ticket`,
    },
    {
      title: 'Playbook 07: Outlook не работает',
      content: `**Scope:** L1→L2 | **Time:** 20–40 min

1. Scope: send, receive, or both? OWA works?
2. Work Offline accidentally on?
3. Outbox stuck messages — move to Drafts, delete
4. Mailbox quota full? (L2 check)
5. Outlook /safe — add-ins conflict?
6. Recreate OST (see endpoints chapter)
7. scanpst.exe if errors persist
8. MFA / creds: Credential Manager clear
9. **L2:** Exchange traces, litigation hold`,
    },
    {
      title: 'Playbook 08: Teams — нет звука/видео',
      content: `**Scope:** L1 | **Time:** 15 min

1. Teams Settings → Devices → Test call
2. Windows Sound → correct input/output
3. Privacy → Microphone/Camera → Teams allowed
4. Close other apps using camera
5. Clear Teams cache
6. Update Teams
7. USB headset: replug, try different port
8. VPN off test — media path issue?
9. **L2:** firewall UDP, split tunnel policy`,
    },
    {
      title: 'Playbook 09: Принтер offline',
      content: `**Scope:** L1 | **Time:** 10 min

1. Printer powered on? Display errors?
2. Ping printer IP
3. Same VLAN? (user wired VLAN 20, printer VLAN 40 — routing?)
4. Restart Print Spooler on user PC
5. Remove and re-add printer
6. Others print to same printer?
7. **L2:** print server queue, driver, GPO`,
    },
    {
      title: 'Playbook 10: Компьютер медленный',
      content: `**Scope:** L1 | **Time:** 20 min

1. When started? After update?
2. Task Manager → CPU/RAM/Disk 100%?
3. Disk space < 10% free?
4. Startup apps — disable non-essential
5. Pending reboot?
6. Windows Update pending?
7. Specific app or whole OS?
8. DISM/SFC if system slowness (L2)
9. SSD vs HDD? (hardware limit)
10. **Escalate:** malware suspected, DISM fails`,
    },
    {
      title: 'Playbook 11: Blue Screen (BSOD)',
      content: `**Scope:** L1→L2 | **Time:** variable

1. Record stop code and QR if visible
2. Recent software/driver install?
3. Boot Safe Mode — works?
4. If Safe Mode ok → driver or startup app
5. Rollback driver if recent update
6. DISM/SFC from recovery
7. **L2:** minidump analysis, reimage if repeat
8. Check disk health (SMART)`,
    },
    {
      title: 'Playbook 12: Подозрительное письмо (фишинг)',
      content: `**Scope:** L1 + Security | **Priority:** P2

**User reported, did NOT click:**
1. Thank user, do not forward email widely
2. Report button (Defender for Office 365)
3. Ticket P2, tag Security
4. L3/SOC: message trace, hunt similar
5. Block sender/domain if confirmed
6. KB update if new campaign

**User CLICKED link:**
1. **Isolate PC** — disconnect network immediately
2. P2 Security ticket
3. Reset AD password ALL accounts on that PC
4. Defender full scan
5. Check sign-in logs Azure AD for anomalies
6. User interview: credentials entered?
7. Reimage if malware confirmed`,
    },
    {
      title: 'Playbook 13: Ransomware / malware',
      content: `**Scope:** L1 detect, Security lead | **Priority:** P1/P2

**L1:**
1. **DO NOT** power off (optional: isolate network)
2. P1/P2 ticket + phone Security
3. Identify affected machines
4. Do not pay ransom, do not delete files

**Security/L2:**
1. Isolate segment VLAN if spreading
2. Preserve evidence
3. Defender for Endpoint hunt
4. Reimage from golden image
5. Restore files from backup if available
6. Post-incident: IR report, legal, insurance`,
    },
    {
      title: 'Playbook 14: Утеря/кража ноутбука',
      content: `**Scope:** L1 | **Priority:** P2

1. Confirm with user and manager
2. **Intune wipe** immediately — document action ID
3. Disable AD account (if not already)
4. Reset password
5. Revoke Azure AD refresh tokens
6. Police report if theft (user responsibility, assist)
7. Snipe-IT status → Lost
8. Procure replacement via Service Request`,
    },
    {
      title: 'Playbook 15: Новый сотрудник (Joiner)',
      content: `**Scope:** L2 + HR | **Service Request** | **T-3 days**

**Checklist:**
- [ ] HR ticket with start date, manager, title
- [ ] AD account + M365 license
- [ ] Security groups per role template
- [ ] Laptop Autopilot assigned
- [ ] Badge (Facilities)
- [ ] VPN access if remote
- [ ] Shared mailboxes if needed
- [ ] Welcome email + KB links
- [ ] Manager notified of completion`,
    },
    {
      title: 'Playbook 16: Увольнение (Leaver)',
      content: `**Scope:** L2 + HR | **Priority:** P2 | **Same day**

**Trigger:** HR official notification only

- [ ] Disable AD (immediate)
- [ ] Revoke sessions Azure AD
- [ ] Intune wipe corporate device
- [ ] Collect laptop, phone, badge
- [ ] Mailbox: convert shared / forward 30d / litigation hold
- [ ] Remove from groups, distribution lists
- [ ] OneDrive data — manager transfer 30d
- [ ] Shared password rotation if knew
- [ ] Snipe-IT update
- [ ] Confirm with HR complete`,
    },
    {
      title: 'Playbook 17: OneDrive не синхронизирует',
      content: `**Scope:** L1 | **Time:** 15 min

1. Which files? Red X or cloud only?
2. Signed in with work account?
3. Storage quota?
4. Path too long (>400 chars)?
5. Invalid characters in filename?
6. OneDrive reset procedure
7. **L2:** SharePoint library permissions, sync limit`,
    },
    {
      title: 'Playbook 18: Не работает MFA',
      content: `**Scope:** L1→L2 | **Time:** 15 min

1. Which app? Authenticator, SMS, FIDO?
2. Phone time automatic? (TOTP)
3. New phone? — MFA re-register (verified identity)
4. Temporary access pass (Azure AD) — L2 only
5. Backup codes used?
6. Conditional Access blocking old client?`,
    },
    {
      title: 'Playbook 19: Доступ к общей папке',
      content: `**Scope:** L1 Service Request | **Time:** 24h SLA

1. Verify manager/data owner approval email
2. Find share path (\\\\fileserver\\share)
3. AD security group for share — add user
4. gpupdate /force or re-login
5. Confirm access
6. Document group membership in ticket`,
    },
    {
      title: 'Playbook 20: Установка ПО (software request)',
      content: `**Scope:** L1/L2 | **Service Request**

1. Manager approval
2. License available? (SAP, Adobe)
3. In Company Portal? → user self-install
4. Not in portal → L2 package deploy Intune/SCCM
5. Exception unsigned software → security review
6. Close when user confirms installed`,
    },
    {
      title: 'Playbook 21: Домен не резолвится, интернет есть',
      content: `**Scope:** L1→L3 | **Time:** 15 min

1. ipconfig — DNS server = DC IP? (not 8.8.8.8 only)
2. nslookup company.local — works?
3. nslookup -type=SRV _ldap._tcp.company.local
4. VPN connected for remote user?
5. DC reachable? ping DC IP
6. **L3:** DNS service, AD replication, forwarders`,
    },
    {
      title: 'Playbook 22: После Windows Update проблемы',
      content: `**Scope:** L1→L2

1. KB number installed?
2. Uninstall update (Settings → Windows Update → History)
3. Pause updates 7 days
4. Report to L2 if widespread — defer ring
5. DISM/SFC post-rollback
6. Problem ticket if >5 users same KB`,
    },
    {
      title: 'Playbook 23: BitLocker recovery key',
      content: `**Scope:** L1 | **Time:** 10 min

1. Verify user identity (strict)
2. Intune → Devices → user device → Recovery keys
3. Or AD: computer object → BitLocker tab
4. User enters 48-digit key at boot
5. Investigate why triggered: BIOS change, hardware?
6. Escalate if weekly recurrence — TPM issue`,
    },
    {
      title: 'Playbook 24: Координация L1 ↔ L3 при сетевом инциденте',
      content: `**War room roles:**

| Роль | Кто | Делает |
|------|-----|--------|
| **Coordinator** | Team lead | Comms, priorities |
| **L1 lead** | Senior L1 | User tickets, scope collection |
| **L3 engineer** | Network | Technical fix |
| **Scribe** | Anyone | Timeline in ticket |

**Handoff template L1→L3:**
- Ticket #, P1/P2
- Scope: N users, floors, wired/Wi‑Fi
- Started: time
- L1 done: [list]
- Suspect: [component]
- User contact for test: [name]`,
    },
    {
      title: 'Playbook 25: Post-incident review (P1/P2)',
      content: `**В течение 48h после P1:**

1. Timeline: detect → respond → resolve
2. Root cause (5 Whys)
3. What went well
4. What to improve
5. Action items with owners
6. Update playbooks/KB
7. Share summary with management (no blame culture)`,
    },
    {
      title: 'Playbook 26: Не работает микрофон в браузере',
      content: `**Scope L1** 15m\n1. Browser permission\n2. Windows privacy mic\n3. Default device\n4. Other browser test\n5. Escalate driver`,
    },
    {
      title: 'Playbook 27: Не открывается SharePoint',
      content: `**Scope L1→L2**\n1. portal.office.com\n2. InPrivate\n3. Clear cache\n4. License\n5. L2 permissions`,
    },
    {
      title: 'Playbook 28: Заблокирована учётная запись',
      content: `**Scope L1**\n1. AD lockout status\n2. Unlock after verify\n3. Find lockout source\n4. Password reset if needed`,
    },
    {
      title: 'Playbook 29: Не работает сканер',
      content: `**Scope L1**\n1. USB/cable\n2. WIA driver\n3. Restart scan service\n4. Test Windows Scan`,
    },
    {
      title: 'Playbook 30: Adobe/лицензионный софт',
      content: `**Scope SR**\n1. Approval\n2. License pool\n3. Deploy Intune\n4. Sign-in vendor ID`,
    },
    {
      title: 'Playbook 31: Dual monitor не detect',
      content: `**Scope L1**\n1. Win+P Extend\n2. Dock firmware\n3. Cable DP vs HDMI\n4. GPU driver`,
    },
    {
      title: 'Playbook 32: Certificate error browser',
      content: `**Scope L1→L2**\n1. URL correct\n2. System date\n3. Internal CA trust\n4. L2 GPO cert deploy`,
    },
    {
      title: 'Playbook 33: Mobile email iOS/Android',
      content: `**Scope L1**\n1. Outlook app vs mail\n2. Intune app protection\n3. Remove re-add account`,
    },
    {
      title: 'Playbook 34: Conf room AV',
      content: `**Scope L1→Facilities**\n1. Restart room PC\n2. Teams room app\n3. HDMI input\n4. Escalate vendor`,
    },
    {
      title: 'Playbook 35: Smartcard/PIV login',
      content: `**Scope L2**\n1. Reader driver\n2. Cert expiry\n3. Middleware\n4. Security`,
    },
    {
      title: 'Playbook 36: Windows Hello PIN',
      content: `**Scope L1**\n1. TPM ready\n2. Reset PIN\n3. Group policy allow`,
    },
    {
      title: 'Playbook 37: Search Windows broken',
      content: `**Scope L1**\n1. Restart SearchIndexer\n2. Troubleshooter\n3. Rebuild index`,
    },
    {
      title: 'Playbook 38: High CPU svchost',
      content: `**Scope L1→L2**\n1. Task Manager details\n2. Windows Update active?\n3. DISM if corrupt`,
    },
    {
      title: 'Playbook 39: Guest account request',
      content: `**Scope SR deny**\n1. Policy no local guests\n2. Standard user account instead`,
    },
    {
      title: 'Playbook 40: Major incident coordinator',
      content: `**Scope Lead**\n1. P1 ticket\n2. War room Teams\n3. Comms every 30m\n4. Scribe timeline\n5. Postmortem 48h`,
    },
    {
      title: 'War room checklist',
      content: `[ ] P1 ticket #\n[ ] Coordinator assigned\n[ ] L1 scope collection\n[ ] L3 technical lead\n[ ] Scribe timeline\n[ ] Comms draft all-staff\n[ ] Status page update\n[ ] Executive notify if >1h\n[ ] Vendor call if needed\n[ ] Postmortem scheduled`,
    },
    {
      title: 'Major incident comms template',
      content: `T+0: «Мы aware, ticket P1, working»\nT+30: «Cause investigating, next update {{time}}»\nResolved: «Service restored, cause {{brief}}»\nT+48h internal postmortem summary`,
    },
    {
      title: 'Лабораторная Playbooks (16 шагов)',
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
      title: 'Матрица выбора playbook',
      content: `| Симптом | Playbook # |
|---------|------------|
| Нет интернета 1 user | 01 |
| Нет интернета all | 02 |
| VPN | 03 |
| Wi‑Fi | 04 |
| Пароль | 05 |
| Lockout | 06 |
| Outlook | 07 |
| Teams AV | 08 |
| Принтер | 09 |
| Медленный ПК | 10 |
| BSOD | 11 |
| Фишинг | 12 |
| Malware | 13 |
| Lost laptop | 14 |
| Joiner | 15 |
| Leaver | 16 |
| OneDrive | 17 |
| MFA | 18 |
| Folder access | 19 |
| Software | 20 |
| DNS/AD | 21 |
| Win Update | 22 |
| BitLocker | 23 |
| Major incident | 40 |

**Держи эту таблицу** на втором мониторе или распечатай для L1 desk.`,
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
      content: `**Playbook usage maturity model:**
Level 1: printed PDF on desk. Level 2: searchable KB. Level 3: ITSM linked from ticket template. Level 4: metrics on playbook usage vs MTTR.

**Playbook 26–40 quick reference expanded:**
26 Browser mic — permissions, privacy, default device, driver, escalate
27 SharePoint — OWA test, cache, permissions L2
28 Account lockout — unlock, find source lockout events
29 Scanner — USB, WIA service, driver
30 Licensed software — approval, deploy, sign-in
31 Dual monitor — Win+P, dock firmware, cable type
32 Cert error browser — date/time, internal CA trust
33 Mobile mail — Outlook app, app protection, re-add account
34 Conf room — restart room PC, Teams room, HDMI, vendor
35 Smartcard — reader driver, cert expiry, Security
36 Hello PIN — TPM, reset PIN policy
37 Windows Search — restart indexer, rebuild index
38 svchost CPU — identify service, WU, DISM
39 Guest account — deny policy, offer standard user
40 Major incident — coordinator, comms 30m, scribe, postmortem

**War room checklist expanded:**
Assign coordinator (not fixing), scribe (timeline every 15m), comms (email draft approval), technical (L3), L1 lead (user impact scope). No status meetings without agenda. Single source of truth ticket #.

**Major incident comms templates full:**
T+0: «Aware P1 {{service}} investigating»; T+30: «Cause unknown, teams engaged, next {{time}}»; Workaround: «Use {{alt}}»; Resolved: «Restored {{time}}, cause {{brief}}, prevention {{action}}»

**Playbook versioning:**
Semantic version 1.2.0 — major process change minor steps fix. Review every 6 months or after P1 related playbook.

**Tabletop exercise schedule:**
Monthly 45min random P1 scenario; rotate facilitator; document gaps; update playbook within 1 week.

**Playbook metrics:**
Track MTTR when playbook followed vs ad-hoc; target 20% MTTR reduction on top 10 categories.

**Security playbook golden rules:**
Never pay ransom; preserve evidence; isolate not shutdown; Security lead approves reimage.

**Joiner playbook HR integration:**
HR ticket triggers 5 days before start; automated checklist; Facilities badge parallel track.

**Leaver playbook legal hold:**
If litigation hold — mailbox preserve not delete; Legal approves before any wipe.

**Phishing playbook tiers:**
Click no creds: report scan; creds entered: reset all passwords user knows, MFA reset, monitor 30d.

**Network playbook handoff:**
L1 never reboots FG; collects ipconfig from 3 users different floors; ping gateway traceroute if skill allows read-only.

**Post-incident playbook 25 expanded:**
48h deadline; blameless; timeline minute-level P1; 5 Whys; action SMART assigned; share mgmt summary 1 page.

**Quick reference card content (print):**
Top 10 playbooks numbers + P1 phone tree + SLA times + escalation form QR to Confluence.

**Playbook localization:**
RU user comms templates in Russian; internal steps can stay EN for mixed teams EU.

**Integration with monitoring:**
PRTG WAN down auto-creates P1 + assigns playbook 02 automatically if ITSM integration configured.

**New hire playbook training:**
Day 1 read playbooks 01-05; week 1 tabletop 02; month 1 certify on 01-10 timed drill.

**Playbook debt:**
Outdated step called out in retro — owner updates within 5 business days or remove playbook until fixed.

**Cross-team playbooks:**
Facilities power outage + IT UPS runtime calc — joint runbook link.

**Customer-visible vs internal steps:**
User email templates separate from technical steps — don't paste FG CLI to user ticket visible comments incorrectly.`,
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
      title: 'Резюме главы',
      content: `40 playbooks покрывают **80%+** типовых обращений L1. Держи их в KB, версионируй, обновляй после каждого P1.

**Ключевое:**
- Scope first
- Document every step
- 20-min escalation rule
- Security playbooks — не импровизируй
- Joiner/Leaver — только по HR trigger

> Практикуй tabletop exercises ежемесячно — muscle memory важнее знания наизусть.`,
    },
  ],
  practice: [
    '40 playbooks в KB с контактами компании',
    'Tabletop major incident 45 min war room',
    'Flowchart playbooks 01+02 merged',
    'Time playbook 03 VPN <20 min',
    'Playbook 40 comms 3 emails',
    'Postmortem template P1 fill mock',
    'Quick-ref card top-15 playbooks',
    'Version control playbooks v1.0',
    'Phishing playbook 12 tabletop',
    'Joiner 15 + Leaver 15 checklist HR',
    'Escalation 3 real packages',
    'Playbook 26-30 review customize',
    'Matrix print L1 desk',
    'Monthly playbook retro',
    'Add company-specific playbook 41',
  ],
  resources: [
    { title: 'CISA Phishing', url: 'https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks' },
    { title: 'NIST IR', url: 'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final' },
    { title: 'Microsoft Security IR', url: 'https://learn.microsoft.com/en-us/security/operations/incident-response-overview' },
    { title: 'SANS Handler', url: 'https://www.sans.org/white-papers/33901/' },
    { title: 'ITIL Problem', url: 'https://www.axelos.com/best-practice-solutions/itil' },
    { title: 'CompTIA A+', url: 'https://www.comptia.org/certifications/a' },
  ],
}
