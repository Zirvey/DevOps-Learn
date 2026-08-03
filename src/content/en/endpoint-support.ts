import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Workstation support',
  duration: '10–12 hours',
  description:
    'Windows 10/11 troubleshooting, Outlook, Teams, printers, MDM Intune, PC onboarding and typical desktop tasks',
  sections: [
    {
      title: 'Standard workstation image (Golden Image)',
      content: `**Golden image** - reference PC configuration, the same for all employees. Reduces onboarding time and simplifies troubleshooting.

**Windows 11 Enterprise Standard Stack:**

| Component | Setting |
|-----------|-----------|
| OS | Windows 11 Pro/Enterprise 23H2+ |
| Join | Azure AD Join + Intune (or Hybrid AD) |
| Encryption | BitLocker (TPM 2.0) |
| AV | Microsoft Defender + EDR |
| Office | Microsoft 365 Apps (Click-to-Run) |
| Collaboration | Teams (New Teams), OneDrive |
| VPN | FortiClient EMS-managed |
| Browser | Edge (managed policies) |
| Updates | WUfB rings: Pilot → Broad |

**Deployment methods:**
| Method | When to use |
|-------|-------------------|
| **Intune Autopilot** | Remote users, zero-touch |
| **MDT + WDS** | On-prem, mass deploy |
| **SCCM/MECM** | Enterprise, complex apps |
| **Manual** | Lab only / exceptions |

**Do not install 50 PCs manually** - automation pays off after 10-15 machines.

**Golden image checklist (20 items):**
1. Windows 11 build approved
2. BitLocker policy applied
3. Local admin removed (LAPS)
4. Defender real-time on
5. Firewall enabled all profiles
6. Office 365 licensed and activated
7. Teams default client (New Teams)
8. OneDrive KFM (Known Folder Move) optional
9. VPN profile deployed
10. Corporate Wi‑Fi profile (802.1X)
11. Company Portal app
12. Edge homepage and bookmarks
13. Printer GPO or Intune deploy
14. Screen lock 5 min
15. USB storage policy (block/allow)
16. Software restriction: admin install only
17. Asset tag in hostname (LAP-042)
18. Snipe-IT registration
19. Autopilot hash uploaded
20. Test user login validation`,
    },
    {
      title: 'Windows 11: architecture and differences from Windows 10',
      content: `**Key differences for support:**

| Aspect | Windows 10 | Windows 11 |
|--------|------------|------------|
| TPM | Recommended | **Required** 2.0 |
| Secure Boot | Recommended | **Required** |
| CPU | Wide list | Limited (Intel 8th+, AMD Zen+) |
| UI | Start left | Start center, rounded corners |
| Teams | Classic + optional | Chat from taskbar (can be removed) |
| Settings | Control Panel + Settings | Settings-first |
| Updates | Monthly | Feature + monthly, longer support |

**Compatibility check:**
- Settings → System → About
- PC Health Check app (legacy)
- Intune compliance policy: min OS version

**Frequent Win10→11 migration blockers:**
- TPM 1.2 only → hardware upgrade or exception
- Legacy BIOS (no UEFI) → firmware update
- 4 GB RAM → upgrade to 8 GB minimum
- Unsupported CPU → replace device

**Windows 11 versions (see ticket):**
- 22H2, 23H2, 24H2 — feature updates
- Build number in winver - for KB compatibility`,
    },
    {
      title: 'Windows 11 diagnostics: basic toolkit',
      content: `**First 5 minutes of any desktop ticket:**

1. **Reboot** is no joke, pending reboot breaks 30% of software
2. **Task Manager** (Ctrl+Shift+Esc) → Performance, Startup apps
3. **Event Viewer** → Windows Logs → Application/System, Error last 24h
4. **Settings → Windows Update** — pending updates?
5. **Network** — connected? VPN active?

**Task Manager - what to look for:**
| Tab | Problem | Signal |
|---------|----------|--------|
| Performance | Slow PC | CPU 100%, Disk 100%, RAM > 90% |
| Startup | Long loading time | 20+ enabled apps |
| Processes | Hang | One app 4+ GB RAM |
| Users | "Who is logged in" | Disconnected RDP sessions |

**Event Viewer - filters:**
- Event ID 1000 — application crash
- Event ID 41 — unexpected shutdown (power/kernel)
- Event ID 4625 — failed logon (security, AD issue)

**Reliability Monitor:** Control Panel → Security and Maintenance → Maintenance → View reliability history — timeline crashes.`,
      code: {
        language: 'powershell',
        caption: 'Quick diagnostics for Windows 11',
        code: `Get-CimInstance Win32_OperatingSystem | Select FreePhysicalMemory, TotalVisibleMemorySize
Get-Process | Sort-Object WorkingSet -Descending | Select -First 10 Name, @{N='MB';E={[int]($_.WS/1MB)}}
Get-EventLog -LogName System -EntryType Error -Newest 10
Get-WinEvent -FilterHashtable @{LogName='Application'; Level=2; StartTime=(Get-Date).AddDays(-1)} -MaxEvents 20
Test-NetConnection dc01.company.local -Port 389`,
      },
    },
    {
      title: 'Windows 11: in-depth troubleshooting',
      content: `**Slow PC - decision tree:**

\\\`\\\`\\\`
Slow PC
├── Disk > 90% full? → Cleanup, move to OneDrive, expand disk
├── RAM pressure? → Close apps, upgrade RAM, check leak
├── 100% Disk active time? → Disable SysMain if SSD, check AV scan
├── Many startup apps? → Disable non-essential
├── Pending updates/reboot? → Reboot
├── HDD (not SSD)? → Replace with SSD (biggest win)
└── Specific app? → Reinstall app, check Event Viewer
\\\`\\\`\\\`

**System file repair (order is important):**
1. DISM — repair Windows image
2. SFC — repair system files
3. CHKDSK — disk errors (schedule reboot)

**Network reset:** Settings → Network → Advanced → Network reset (last resort, removes VPN profiles).

**Windows Update stuck:**
- Windows Update Troubleshooter
- Stop wuauserv, clear C:\\\\Windows\\\\SoftwareDistribution\\\\Download
- DISM + SFC, retry update

**Blue Screen (BSOD):**
- Write down the stop code (CRITICAL_PROCESS_DIED, etc.)
- C:\\\\Windows\\\\Minidump → analyze or send L2
- Recent driver update? Rollback in Safe Mode

**Safe Mode:** Settings → Recovery → Advanced startup → Troubleshoot → Startup Settings → F4`,
      code: {
        language: 'powershell',
        caption: 'Repair system files (run as Admin)',
        code: `DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
chkdsk C: /f`,
      },
    },
    {
      title: 'Accounts: Azure AD, Hybrid and on-premises',
      content: `**Join types:**

| Type | Where is the account | Typical scenario |
|-----|------------|-------------------|
| **Azure AD Join** | Cloud only | Remote, modern workplace |
| **Hybrid Azure AD Join** | On-prem AD + Azure AD sync | Legacy GPO + cloud |
| **Domain Join** | On-prem AD only | Old Wednesdays |
| **Workgroup** | Local only | Lab, exception |

**Login Issues:**
| Symptom | Reason | Fix |
|---------|---------|-----|
| «Can't connect to org» | No internet, DNS | Check network, DNS to DC/Azure |
| Wrong password | Typo, expired | Reset, check caps lock |
| «Another user signed in» | Fast startup conflict | Disable fast startup |
| Stuck «Welcome» | Profile issue | New profile or registry fix |
| Hello PIN fails | TPM, policy | Reset PIN, check TPM |

**Hybrid: check sync**
- Azure AD Connect on-prem
- dsregcmd /status — AzureAdJoined, DomainJoined both YES

**User profile corrupt:**
- Create temp admin, login as user → if fails, new profile
- Copy data from C:\\\\Users\\\\old.name to new
- Delete old profile in System Properties`,
    },
    {
      title: 'Microsoft Outlook: complete troubleshooting guide',
      content: `**Architecture:** Outlook desktop → MAPI/Exchange Online or on-prem → mailbox in cloud/Exchange.

**Typical problems and solutions:**

| Symptom | Diagnostics | Solution |
|---------|-------------|---------|
| Doesn't send | Outbox stuck, offline | Work offline off, delete stuck, check quota |
| Doesn't receive | Rules, Focused Inbox | Disable rules test, check Junk |
| «Cannot start Outlook» | Add-in, corrupt profile | Safe mode outlook /safe, disable add-ins |
| OST corrupt | Large OST, crash | Recreate OST (delete .ost, reopen) |
| MFA loop | Cached creds | Clear Credential Manager, re-auth |
| Shared mailbox missing | Permissions | Add via Account Settings |
| Calendar sync off | Delegate, permissions | Check publishing permissions |
| Search not working | Index corrupt | Rebuild search index |

**Offline mode:** Send/Receive tab → Work Offline (if lit) - turn it off.

**Recreate OST:**
1. Close Outlook
2. Control Panel → Mail → Data Files → note path
3. Delete .ost file (NOT .pst unless backup)
4. Open Outlook — re-downloads

**scanpst.exe:** C:\\\\Program Files\\\\Microsoft Office\\\\root\\\\Office16\\\\SCANPST.EXE - for PST/OST errors.

**Exchange Online PowerShell (L2):** check mailbox quota, litigation hold, forwarding rules.`,
      code: {
        language: 'powershell',
        caption: 'Outlook safe mode and profile info',
        code: `Start-Process outlook.exe -ArgumentList '/safe'
Get-ItemProperty 'HKCU:\\\\Software\\\\Microsoft\\\\Office\\\\16.0\\\\Outlook\\\\Profiles\\\\*' -ErrorAction SilentlyContinue`,
      },
    },
    {
      title: 'Microsoft Teams: Audio, Video and Productivity',
      content: `**New Teams vs Classic:** New Teams is a separate application, different cache path.

**Typical problems:**

| Symptom | Solution |
|---------|---------|
| No sound | Settings → Devices → correct speaker/mic, test call |
| Microphone not working | Privacy → Microphone access for Teams |
| Camera black | Privacy → Camera, close other apps using cam |
| High CPU | Hardware acceleration off, close GPU-heavy apps |
| Not included | Clear cache, re-login, check MFA |
| Calls are dropped | Network, VPN split tunnel, UDP blocked |
| Screen share fails | Update GPU driver, disable dual GPU switch |

**Clear Teams cache (New Teams):**
1. Fully quit Teams (tray icon too)
2. Delete %LOCALAPPDATA%\\\\Packages\\\\MSTeams_8wekyb3d8bbwe\\\\LocalCache
3. Or: Settings → Teams → Clear cache
4. Restart Teams

**Firewall ports (FortiGate policy):**
- UDP 3478–3481 (media)
- TCP/UDP 3478–3481
- TCP 443 (fallback)
- Allow *.microsoft.com, *.teams.microsoft.com

**VPN + Teams:** Full tunnel often degrades quality - **split tunnel** for Teams media is recommended.

**Teams Rooms / shared:** separate playbook, firmware updates.`,
    },
    {
      title: 'OneDrive: Sync and Known Folder Move',
      content: `**OneDrive for Business** - sync client for SharePoint/OneDrive storage.

**Sync Issues:**

| Symptom | Reason | Fix |
|---------|---------|-----|
| Red X on files | Sync error | Click error, check path length < 400 |
| «Processing changes» forever | Stuck sync | Reset OneDrive |
| Files missing | Wrong account | Sign in with work account |
| KFM redirected Desktop | Policy | Expected — explain to user |
| Blocked file type | Policy | Request exception |
| Storage full | Quota | Cleanup or request increase |

**Reset OneDrive:**
1. OneDrive tray → Settings → Account → Unlink
2. Run: %localappdata%\\\\Microsoft\\\\OneDrive\\\\onedrive.exe /reset
3. Wait 2 min, re-sign in

**Known Folder Move (KFM):** Desktop, Documents, Pictures → OneDrive. **Backup** before troubleshoot!

**Files On-Demand:** cloud-only files show cloud icon — need internet to open.

**Share sync issues:** check permissions in SharePoint admin, sync library again.`,
    },
    {
      title: 'Printers: network printing and troubleshooting',
      content: `**SMB Print Architecture:**
- Print server (Windows Server) or direct IP printers
- GPO or Intune deploy printer connections
- Driver x64 on server, universal driver preferred

**Deploy printer (GPO):**
1. Print server shares printer (\\\\\\\\print01\\\\HP-Floor2)
2. GPO → User Config → Preferences → Printers → Add TCP/IP or shared
3. Link GPO to OU
4. gpupdate /force

**Typical problems:**

| Symptom | Solution |
|---------|---------|
| Printer offline | Ping IP, check VLAN 40 access, wake printer |
| Wrong default | Set default via GPO or user training |
| Spooler stuck | Restart Print Spooler service |
| Access denied | Permissions on share + security group |
| Bad output | Update driver, check paper size settings |
| Slow print | Large PDF, network, spooler on server |

**Restart Print Spooler:**
- services.msc → Print Spooler → Restart
- Or clear C:\\\\Windows\\\\System32\\\\spool\\\\PRINTERS\\\\*

**IP reservation:** DHCP reservation for printer MAC → stable IP for GPO and firewall.`,
    },
    {
      title: 'Microsoft Intune and MDM: Device Management',
      content: `**Intune (Endpoint Manager)** - cloud MDM/MAM for Windows, iOS, Android.

**Key Features:**

| Function | Destination |
|---------|------------|
| Compliance policies | BitLocker, min OS, password |
| Configuration profiles | Wi‑Fi, VPN, certificates |
| App deployment | Required/available apps |
| Windows Update rings | Pilot/broad deployment |
| Remote actions | Sync, restart, retire, wipe |
| Conditional Access | Block unmanaged devices |

**Compliance policy example:**
- BitLocker: Required
- Min OS: Windows 11 23H2
- Password: 6+ chars or PIN
- Defender: Real-time on
- Non-compliance: mark + block email (CA)

**App deployment types:**
- **Required** — auto-install (Company Portal shows)
- **Available** — user installs from portal
- **Uninstall** — remove legacy app

**Retire vs Wipe:**
- **Retire** — remove company data, keep personal (BYOD)
- **Wipe** — factory reset (corporate owned)

**Troubleshooting Intune:**
- Company Portal → Settings → Sync
- dsregcmd /status — MDM URL
- Intune portal → device → Troubleshoot → collect logs`,
      code: {
        language: 'powershell',
        caption: 'Intune device status (on device)',
        code: `dsregcmd /status
Get-ScheduledTask | Where-Object {$_.TaskName -like '*PushLaunch*'}
Get-WinEvent -LogName 'Microsoft-Windows-DeviceManagement-Enterprise-Diagnostics-Provider/Admin' -MaxEvents 20`,
      },
    },
    {
      title: 'Onboarding a new PC: step-by-step runbook',
      content: `**Pre-ship (before receiving user):**
1. Unbox, asset tag sticker
2. Autopilot profile assigned (user or group)
3. Ethernet connect for first boot (preferred)
4. Power on → Autopilot ESP (Enrollment Status Page)
5. Verify: BitLocker, Office, Teams, VPN, Company Portal
6. Register in Snipe-IT: serial, user, location
7. Ship with quick-start card (KB link)

**Day 1 user session (30 min call):**
1. Login with corp credentials + MFA setup
2. OneDrive sign-in, KFM explanation
3. Teams test call
4. VPN test from home (if remote)
5. Printer appears (GPO/Intune)
6. Confirm ticket checklist closed

**Onboarding ticket checklist:**
- [ ] AD/Azure AD account active
- [ ] M365 license assigned
- [ ] Laptop deployed/Autopilot
- [ ] Snipe-IT updated
- [ ] MFA configured
- [ ] VPN working
- [ ] Welcome KB sent`,
    },
    {
      title: 'Offboarding and device recycling',
      content: `**Leaver - day of dismissal (strictly according to HR trigger):**

| Step | Action | Timing |
|-----|----------|--------|
| 1 | Disable AD account | Immediate |
| 2 | Revoke Azure AD sessions | Immediate |
| 3 | Intune wipe/retire | Within 1h |
| 4 | Collect laptop, badge, phone | Same day |
| 5 | Mailbox: convert shared or forward 30d | Per policy |
| 6 | Remove from all groups | Same day |
| 7 | Change shared passwords user knew | If applicable |
| 8 | Snipe-IT status → In stock/Retired | Same day |

**Wipe confirmation:** Intune → Devices → Monitor → Device actions status.

**Re-provision:** Wiped device → Autopilot reset → ready for next user.`,
    },
    {
      title: 'Peripherals: docking stations, monitors, headsets',
      content: `**USB-C dock issues:**
- Firmware update on dock (Dell, Lenovo utilities)
- One monitor works, two don't → check dock specs + GPU
- Network via dock → install dock Ethernet driver
- Power delivery → 65W+ for laptops

**Bluetooth headset (Teams certified):**
- Pair before Teams call test
- Set as default in Sound settings AND Teams settings
- Interference with Wi‑Fi 2.4 GHz — use 5 GHz Wi‑Fi

**Multiple monitors:**
- Win+P → Extend
- Detect in Display settings if missing
- Driver update for GPU`,
    },
    {
      title: 'Workstation Security',
      content: `**L1 security checklist:**
- BitLocker enabled (manage-bde -status)
- Defender definitions current
- Firewall on all profiles
- No local admin for users
- USB storage policy enforced
- Screen lock 5 min
- MFA on all cloud apps

**Suspected compromise:**
1. Disconnect network
2. Do NOT power off (RAM evidence)
3. P2 ticket + Security
4. Defender offline scan
5. Preserve logs
6. L2: reimage if confirmed

**Lost/stolen laptop:**
- Intune wipe immediately
- Reset AD password
- Revoke refresh tokens Azure AD`,
    },
    {
      title: 'macOS in an enterprise environment (in brief)',
      content: `**Jamf / Intune for macOS** - if the company has Macs.

**Typical tickets:**
- Keychain password loop → sync with AD password
- Outlook Mac vs Windows differences
- FileVault recovery key in Intune
- Printer — IPP or queue

**Escalation:** if there is no Mac specialist, don’t experiment, escalate L2.`,
    },
    {
      title: 'Troubleshooting matrix: desktop',
      content: `| Symptom | L1 checks (15 min) | Escalate L2 if |
|---------|-------------------|----------------|
| Slow PC | Task Mgr, disk space, reboot | After DISM/SFC fail |
| No login | Network, password reset | Profile corrupt |
| Outlook down | /safe, web OWA works? | OST rebuild fail |
| Teams AV | Devices, privacy, cache | Network/UDP policy |
| No print | Ping printer, spooler | GPO/server issue |
| No VPN | Client version, creds | FG logs |
| OneDrive | Account, reset | SharePoint permissions |

**Always document** in the ticket: OS version, build, app version, exact error text.`,
    },
    {
      title: 'Windows 11 24H2: new features for support',
      content: `24H2: Wi-Fi 7 readiness, Recall optional (enterprise off), smart app control, improved Windows Update rollback, Sudo for developers. Support: check winver build 26100+. Copilot+ PC requirements separate from base Win11.`,
    },
    {
      title: 'Autopilot step-by-step (15 steps)',
      content: `1. Hash device serial. 2. Upload to Intune. 3. Create deployment profile. 4. Assign security groups. 5. ESP block until apps. 6. Configure naming template. 7. Hybrid join if needed. 8. Assign compliance. 9. Deploy Company Portal. 10. Office C2R. 11. Teams bootstrap. 12. VPN profile. 13. Wi-Fi 802.1X. 14. BitLocker silent. 15. Test ESP with VM/user.`,
    },
    {
      title: 'Entra ID Join troubleshooting',
      content: `dsregcmd /status: AzureAdJoined YES, TenantName correct. Issues: MDM user cert, conditional access, stale PRT → dsregcmd /leave + rejoin. Workplace join vs Azure AD join differences.`,
    },
    {
      title: 'BitLocker recovery deep dive',
      content: `Triggers: TPM change, BIOS update, dock firmware. Keys: Intune, Entra, AD backup. L1: verify identity strict. Escalate recurring TPM firmware.`,
    },
    {
      title: 'M365 troubleshooting tree',
      content: `M365 root→Outlook/Teams/OneDrive/SharePoint. Auth first: portal.office.com. License assignment. Shared computer activation. Sign out all sessions.`,
    },
    {
      title: 'Hardware diagnostics',
      content: `Dell SupportAssist, Lenovo Vantage, HP Support Framework. RAM test mdsched. Disk CrystalDiskInfo. Battery design capacity <80% replace. Thermal throttle check.`,
    },
    {
      title: 'Laptop lifecycle',
      content: `Procure→Autopilot→Deploy 3y→Refresh→Wipe→Retire. TCO: device $900 + support $200/y + license. EOL: unsupported OS = mandatory refresh.`,
    },
    {
      title: 'Lab Endpoint (16 steps)',
      content: `**Goal:** complete the full operational workflow from symptom to postmortem and process improvement.

**Preparation (30 min):** ITSM trial / lab VM / Excel dashboard template / read-only access to FortiGate or Omada (optional).

| # | Step | Details | Done |
|---|-----|--------|------|
| 1 | Prepare the environment | Portal, 3 queues, email-to-ticket | ☐ |
| 2 | SLA policies | P1 15m/4h, P3 4h/24h, pause Pending | ☐ |
| 3 | KB deflection | 5 articles: VPN, password, Wi‑Fi, Outlook, printer | ☐ |
| 4 | Create Incident | “No Internet”, category Network, P3 | ☐ |
| 5 | Fill in context | Asset tag, floor, scope 1 user, screenshot | ☐ |
| 6 | L1 diagnostics | ipconfig, ping GW, ping 8.8.8.8, nslookup | ☐ |
| 7 | Document | Each command + output in ticket comment | ☐ |
| 8 | Escalation | 10-field form L1→L3 if undecided 20 min | ☐ |
| 9 | L2/L3 fix | Root cause: DNS or DHCP - apply fix | ☐ |
| 10 | Resolve | Resolution notes + link KB | ☐ |
| 11 | CSAT | Mock survey 1–5 + comment | ☐ |
| 12 | Service Request | “Monitor 27"” — manager approval flow | ☐ |
| 13 | Problem ticket | Link 3 similar VPN incidents | ☐ |
| 14 | P1 simulation | Tabletop “whole office offline” + war room roles | ☐ |
| 15 | Comms draft | 3 emails: T+0, T+30, Resolved | ☐ |
| 16 | Dashboard | FRT, MTTR, SLA%, reopen rate — 4 charts Excel | ☐ |
| 17 | Postmortem | Blameless 1 page, 3 action items | ☐ |
| 18 | Automation | Rule: category Network → L3 queue | ☐ |
| 19 | Retro | 2 improvements in CSI register | ☐ |
| 20 | Peer review | A colleague checks the ticket quality checklist | ☐ |

**Success criteria:** ticket audit score ≥90%; postmortem action items assigned; dashboard reflects mock data.`,
    },
    {
      title: 'FAQ - 12 frequently asked questions',
      content: `| # | Question | Answer |
|---|--------|--------|
| 1 | Incident vs Service Request? | Incident = broken, restore ASAP. Request = standard catalog service. |
| 2 | When to escalate? | No progress 20 min; infrastructure affected; L2/L3 rights are required; security event. |
| 3 | Can I reset my password by email? | No without multi-factor identity verification according to policy. |
| 4 | CEO requires P1 for printer? | Explain impact matrix; arrange the correct P3/P4 priority. |
| 5 | Do I need a ticket for a 2-minute fix? | Yes - audit trail, metrics, KB input. |
| 6 | Angry user on phone? | Empathy + ETA + focus on fix; escalate threats to lead. |
| 7 | What is FCR? | First Contact Resolution - resolved from the first contact without reopen/escalate. |
| 8 | Problem ticket when? | 3+ similar incidents/month or unknown root cause after L3. |
| 9 | Disable MFA temporarily? | No without a documented Security exception. |
| 10 | What's in resolution notes? | Symptom, checks, actions, result, KB link, versions. |
| 11 | 10 open tickets - okay? | P1/P2 → SLA at risk → FIFO within priority. |
| 12 | KB vs playbook? | KB = user-facing deflection; playbook = internal agent runbook with escalation. |`,
    },
    {
      title: 'Troubleshooting matrix (24 lines)',
      content: `| # | Symptom | L1 checks (15 min) | Probable Cause | Action | Escalation |
|---|---------|-------------------|-------------------|----------|-----------|
| 1 | No internet 1 user | Scope wired/Wi‑Fi | DHCP/DNS/local | ipconfig /renew, flushdns | L3 if subnet |
| 2 | No internet all | WAN LED, mobile test | ISP/FW outage | P1 ticket, notify L3 | Immediate |
| 3 | VPN won't connect | Credentials, MFA, version | Profile/cert | Reinstall FortiClient | L2 FG logs |
| 4 | Outlook disconnect | OWA works? | OST corrupt/cert | Safe mode, recreate OST | L2 Exchange |
| 5 | Teams no sound | Device settings | UDP blocked/driver | Clear cache, test call | L2 network |
| 6 | Slow PC | Task Manager disk/RAM | Full disk, leak | Cleanup, reboot | L2 hardware |
| 7 | Not included Windows | Network, caps lock | Profile/AD lock | Unlock, reset pass | L2 profile |
| 8 | Printer offline | Ping IP | Spooler/GPO | Restart spooler | L2 print server |
| 9 | OneDrive doesn't sync | Account quota | Token stale | Reset OneDrive | L2 SharePoint |
| 10 | BitLocker boot | Verify identity | TPM change | Recovery key Intune | L2 recurring |
| 11 | Wi‑Fi does not connect | SSID, forget network | 802.1X/RADIUS | Re-auth AD creds | L3 NPS |
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
      title: 'Case study 1: Avalanche of Outlook tickets',
      content: `**Context:** Fintech office 80 FTE, Monday 09:00, 47 “Outlook certificate error” tickets.

**Timeline:**
- 09:05 — L1 notices the pattern in the queue filter
- 09:10 — Senior L1 creates master ticket, links duplicates
- 09:12 - Priority P2 (OWA web is working - workaround exists)
- 09:20 — L3: expired cert on legacy Exchange load balancer
- 09:35 — Emergency change approved verbally
- 09:50 — Cert renewed, clients reconnect after Outlook restart
- 10:15 — All-staff resolved email

**Metrics:** MTTR 70 min; 47 tickets → 1 master + 46 linked; CSAT dipped to 3.8 that week.

**Action items:** Cert expiry monitoring PRTG 30d alert; auto-renew Let's Encrypt where applicable; KB «Outlook cert error» updated.`,
    },
    {
      title: 'Case study 2: BEC «CEO password»',
      content: `**Context:** 22:15 email “from the CEO”: “Reset your password immediately, conf call in 10 minutes.”

**Actions:**
- L1 on-call did not reset the password
- Called CEO on mobile from AD - CEO didn’t send
- Created P2 Security, blocked sender domain
- Security: BEC attempt, blocked IP, training scheduled

**Lessons:** After-hours does not weaken verification; single-channel email insufficient; report to Security within 15 min.`,
    },
    {
      title: 'Case study 3: 50 remote Autopilot',
      content: `**Context:** EdTech hired 50 remote teachers in 1 week, all Autopilot.

**Approach:**
- Pre-staged profiles by department in Intune groups
- Snipe-IT serial import → Autopilot group tag
- Shipping partner + tracking in Service Request tickets
- Day-1 batch Teams onboarding 10 users per slot

**Results:** 48/50 zero-touch; 2 needed manual ESP (TPM firmware update).
**KB video** “Unpack and turn on” reduced inbound calls by 60%.`,
    },
    {
      title: 'CompTIA A+ / Network+ mapping',
      content: `| CompTIA objective | Domain | Where in the chapter | Exam |
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
      title: '10 interview questions',
      content: `| # | Question | A strong answer includes |
|---|--------|------------------------|
| 1 | Incident lifecycle? | New→Open→In Progress→Pending→Resolved→Closed; SLA pause |
| 2 | How do you determine P1? | Impact × urgency; examples: all office down vs one printer |
| 3 | An example of escalation? | Ticket #, scope, steps, logs, suspect, test contact |
| 4 | Password reset verify? | Phone AD, badge, manager — never email alone |
| 5 | Problem Management? | Recurring incidents, root cause, Known Error, Change |
| 6 | Reduce ticket volume? | KB deflection, automation, self-service, training |
| 7 | FRT vs MTTR? | First response vs mean time to resolved |
| 8 | Remote support ethics? | Consent, log session, no unattended access |
| 9 | Documentation? | Every step in ticket; assets, versions, screenshots |
| 10 | Career 2 years? | Concrete skills: AD, PowerShell, Network+, project |`,
    },
    {
      title: 'Templates: email, escalation, KB',
      content: `**1. Email is the solution**
\\\`\\\`\\\`
Subject: [{{TICKET}}] Resolved - {{SUBJECT}}
Hello {{NAME}}!
Done: {{SUMMARY}}.
Action: {{USER_ACTION}}.
Confirm by replying to the letter. CSAT: {{URL}}
IT Support | {{COMPANY}}
\\\`\\\`\\\`

**2. Email - information needed**
\\\`\\\`\\\`
Subject: [{{TICKET}}] Please clarify
{{QUESTIONS}}
A screenshot of the error will speed up the solution.
\\\`\\\`\\\`

**3. Escalation form L1→L3**
Ticket | Priority | Scope | Start | Impact | L1 steps | Suspect | Logs | Test user | Deadline

**4. KB article skeleton**
# Title | Symptoms | Prerequisites | Steps 1-n | Still broken? → ticket cat X | Related | Owner | Updated`,
    },
    {
      title: 'Additional best practices and checklist',
      content: `**Monthly review checklist:**
- [ ] Update KB and playbooks based on ticket results
- [ ] Check SLA compliance and CSAT trend
- [ ] Review open Problem tickets
- [ ] Audit DHCP/DNS/VLAN configuration
- [ ] Firmware security patches network gear
- [ ] Backup firewall/switch configs
- [ ] Test failover WAN / DHCP / RADIUS
- [ ] Training gap analysis for L1
- [ ] Update asset inventory
- [ ] Retro major incidents if there were

**Documentation:** each change - ticket + change record + config backup + diagram update.

**Communication:** users value ETA more than speed - always set expectations.

**Security:** least privilege, segment networks, verify identity, log actions.

**Continuous training:** 2h/week lab + milestone quarterly certification.`,
    },
    {
      title: 'IT Support and Networking Terms Reference',
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
      content: `**Windows 11 24H2 — enterprise rollout checklist**
- Pilot ring 5 devices 2 weeks
- App compatibility matrix signed by app owners
- Intune compliance min version 23H2 or 24H2
- Feature update deferral 7 days after GA
- Helpdesk KB pre-published before broad ring
- Rollback plan: uninstall KB + pause WU ring

**Autopilot ESP troubleshooting matrix:**
| ESP stuck on | Cause | Fix |
|--------------|-------|-----|
| Company Portal | App deploy fail | Intune app assign, check error |
| Office | CDN block | Allow Office CDN URLs |
| VPN | Cert/profile | PKCS cert deploy first |
| BitLocker | TPM | Firmware update |

**Entra join dsregcmd fields:**
AzureAdJoined YES; EnterpriseJoined if hybrid; DomainJoined if on-prem; MdmUrl Intune; AzureAdPrt YES for SSO.

**BitLocker recovery — audit log:**
Who requested, verify method, key ID shown (not full key in ticket), reason TPM change documented.

**Outlook complete fix order:**
1. OWA test 2. Safe mode 3. Disable add-ins 4. New profile 5. Recreate OST 6. scanpst 7. Repair Office 8. Escalate Exchange

**Teams AV ports FortiGate:**
UDP 3478–3481, TCP 443; split tunnel recommended; verify SSL inspection not breaking Teams.

**OneDrive Known Folder Move:**
Redirects Desktop/Documents; explain to users before enable; backup warning; reset OneDrive if sync broken.

**Printer deployment decision:**
<10 users IPP/direct; 10–50 GPO; 50+ print server; always DHCP reservation for printers.

**Intune compliance policies bundle:**
BitLocker, Min OS, Defender on, Secure Boot, Password complexity, Jailbreak block mobile.

**Hardware lifecycle TCO example (3 years):**
Laptop €900 + dock €150 + support €200/yr ×3 + M365 €15/user/mo → compare vs lease.

**macOS corp brief:**
FileVault key escrow Intune; Jamf if >20 Macs; escalate if no Mac specialist.

**Endpoint security baseline:**
LAPS local admin; Credential Guard where supported; Attack surface reduction rules; USB block except approved.

**Windows Update rings Intune:**
Ring0 IT 0 defer; Ring1 Pilot 7 defer; Ring2 Broad 14 defer; Ring3 Critical only for legacy.

**Perf troubleshooting advanced:**
WPA record wait chain; Autoruns cleanup; Page file system managed; SSD health <90% replace.

**Offboarding automation:**
HR webhook → disable AD → revoke sessions → wipe Intune → ticket checklist auto-created.

**Remote desktop support Quick Assist flow:**
User gets code → agent enters → show cursor → fix → disconnect → document.

**M365 license SKU quick ref:**
E3 standard corp; E5 advanced security; F3 frontline; compare before assigning in ticket.

**VDI/Citrix mention:**
If company uses VDI — L1 scope may be thin client + session not physical PC; know escalation to Citrix team.

**Developer machine exceptions:**
Local admin via PIM time-bound; separate VLAN optional; logging required.

**Patch Tuesday process:**
Patch Tuesday +3 days deploy Ring1; +7 Ring2; monitor Problem tickets for same KB.

**Laptop imaging legacy MDT:**
Still seen in air-gapped; know difference vs Autopilot; don't mix methodologies same fleet.

**Warranty RMA process:**
Serial → vendor portal → advance exchange → return old in 14d → update Snipe-IT.

**Battery recall check:**
Vendor serial lookup for fire risk recalls before deploying from stock.

**Docking station firmware:**
Dell TB16/WD19 — update before dual 4K monitor tickets flood queue.

**Multi-user kiosk shared PC:**
Shared PC mode Intune; no personal OneDrive; strict GPO; common in warehouse.

**Accessibility support:**
Screen reader basics; Windows Magnifier; know escalation to accessibility specialist.

**Endpoint backup:**
OneDrive not backup for all — know if company uses Veeam endpoint or none; set expectations.`,
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
      title: 'Directory - escalation tree and glossary supplement',
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
      title: 'Chapter Summary',
      content: `1. **Golden image + Autopilot** - not manual install
2. **Windows 11** — TPM, diagnostics, DISM/SFC/chkdsk
3. **Outlook** — OST recreate, scanpst, safe mode
4. **Teams** — cache, devices, firewall UDP, split tunnel VPN
5. **OneDrive** — reset, KFM awareness
6. **Printers** — spooler, GPO, DHCP reservation
7. **Intune** — compliance, wipe, Company Portal sync
8. **On/Offboarding** — checklists with HR timing

> Next chapter: **Playbooks** - step-by-step runbooks for typical incidents.`,
    },
  ],
  practice: [
    'Autopilot lab VM full ESP',
    'dsregcmd output interpret',
    'BitLocker recovery mock',
    'M365 tree 5 branches draw.io',
    'Outlook OST rebuild lab',
    'Teams cache clear + UDP ports',
    'Intune compliance policy JSON',
    'Golden image 25-point checklist',
    'Hardware diag on loan laptop',
    'Laptop lifecycle spreadsheet TCO',
    'Win11 24H2 feature delta notes',
    'OneDrive reset timing',
    'Offboarding wipe confirm Intune',
    'Printer GPO plan 3 floors',
    'Entra join failure case study',
  ],
  resources: [
    { title: 'Intune docs', url: 'https://learn.microsoft.com/en-us/mem/intune/' },
    { title: 'Windows 11 24H2', url: 'https://learn.microsoft.com/en-us/windows/release-health/' },
    { title: 'Autopilot', url: 'https://learn.microsoft.com/en-us/autopilot/' },
    { title: 'Outlook troubleshoot', url: 'https://learn.microsoft.com/en-us/outlook/troubleshoot/' },
    { title: 'Teams admin', url: 'https://learn.microsoft.com/en-us/microsoftteams/' },
    { title: 'Entra ID', url: 'https://learn.microsoft.com/en-us/entra/identity/' },
  ],
  quiz: [
    {
      question: 'APIPA address 169.254.x.x means:',
      options: ['DHCP did not issue an address', 'Everything is fine', 'VPN active'],
      answer: 'DHCP did not issue an address',
    },
    {
      question: 'BitLocker is usually via:',
      options: ['GPO or Intune', 'BIOS only', 'Printer'],
      answer: 'GPO or Intune',
    },
    {
      question: 'Stuck Outlook - often helps:',
      options: ['Recreate OST / scanpst', 'Remove AD', 'Reboot switch'],
      answer: 'Recreate OST / scanpst',
    },
    {
      question: 'Print Spooler frozen -:',
      options: ['Restart-Service Spooler', 'Format C:', 'Delete VLAN'],
      answer: 'Restart-Service Spooler',
    },
    {
      question: 'Intune Remote wipe when:',
      options: ['Dismissal of an employee', 'Slow PC', 'Guest Wi‑Fi'],
      answer: 'Dismissal of an employee',
    },
    {
      question: 'Golden image is needed for:',
      options: ['Standardization of workstations', 'Linux servers only', 'Firewall only'],
      answer: 'Standardization of workstations',
    },
    {
      question: 'Safe Mode with Networking is used when:',
      options: [
        'Diagnostics with network access but without extra drivers',
        'BIOS only',
        'VPN only',
        'Printer only',
      ],
      answer: 'Diagnostics with network access but without extra drivers',
    },
    {
      question: 'Intune (MDM) in the office is used for:',
      options: [
        'Managing policies and applications on devices',
        'DNS only',
        'VLAN only',
        'Printing only',
      ],
      answer: 'Managing policies and applications on devices',
    },
    {
      question: 'Command to check applied GPO for the current user:',
      answer: 'gpresult /scope user /v',
    },
    {
      question: 'Teams will not start — clearing this often helps:',
      options: [
        'Teams cache (%appdata%\\Microsoft\\Teams)',
        'AD schema',
        'VLAN on switch',
        'DHCP scope',
      ],
      answer: 'Teams cache (%appdata%\\Microsoft\\Teams)',
      explanation: 'Also check WebView2 and network access to Microsoft 365.',
    },
  ],
}

export default translation
