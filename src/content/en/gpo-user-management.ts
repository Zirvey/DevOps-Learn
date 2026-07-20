import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'GPO and User Management - The Complete Guide',
  duration: '12–16 hours',
  description:
    'Deep learning of Group Policy: GPMC, AGPM, security filtering, WMI filters, loopback, Folder Redirection, AppLocker, BitLocker, Credential Guard, onboarding/offboarding runbooks',
  sections: [
    {
      title: 'Group Policy - why is it needed?',
      content: `**GPO (Group Policy Object)** - centralized Windows settings for users and computers. This is "configuration as code" for Windows Office.

**Without GPO:**
- Manually configure 50 PCs - lock screen, password, printers, software
- Each PC has a unique configuration
- Offboarding does not revoke local settings

**With GPO:**
- One policy per OU → applied automatically
- New PC in OU → receives all policies upon join
- Policy change → update on all PCs in 90 minutes

**Two types of settings:**
- **Computer Configuration** - when loading the PC (before user login)
- **User Configuration** - when user logs in

**Order of application - LSDOU:**
1. **L**ocal - local PC policy
2. **S**ite - AD Site level policies
3. **D**omain - domain level policies
4. **OU** - policies of organizational units (the latter wins in the event of a conflict)

**Order within GPO:**
1. Policies (Administrative Templates) - forced
2. Preferences - “soft”, the user can change (if not prohibited)

> GPO is the **most powerful** Windows admin tool. GPO error = 50 broken PCs. Test on pilot OU.`,
    },
    {
      title: 'GPMC - complete workflow',
      content: `**Group Policy Management Console (GPMC)** - \\\`gpmc.msc\\\`. The only tool for GPO management.

**GPMC structure:**
- **Forest → Domain → GPOs** — all GPOs of the domain
- **OU** — GPO bindings (links)
- **WMI Filters** - conditions of use
- **Starter GPOs** - templates

**GPO creation workflow:**

| Step | Action | Details |
|-----|----------|--------|
| 1 | Planning | What are we setting up? For whom? Computer or User? |
| 2 | Create a GPO | Right click on OU → Create a GPO in this domain |
| 3 | Naming | \\\`GPO-Computers-BitLocker\\\`, \\\`GPO-Users-ScreenLock\\\` |
| 4 | Editing | Edit → Computer/User Configuration |
| 5 | Binding | Link has already been created in step 2 |
| 6 | Security Filtering | To which groups does |
| 7 | Testing | Pilot OU → gpresult /h report.html |
| 8 | Production | Transfer link to production OU |

**Check on the client:**
\\\`gpupdate /force\\\` - forced update
\\\`gpresult /r\\\` - short report
\\\`gpresult /h report.html\\\` — HTML report (open in browser)
\\\`rsop.msc\\\` — Resultant Set of Policy (GUI)

**Best naming practices:**
\\\`\\\`\\\`
GPO-[Scope]-[Purpose]
GPO-Computers-WindowsUpdate
GPO-Computers-BitLocker
GPO-Users-ScreenLock
GPO-Users-FolderRedirection
GPO-Users-DriveMaps-Sales
\\\`\\\`\\\`

> **Do not edit** Default Domain Policy and Default Domain Controllers Policy unless absolutely necessary. Create new GPOs.`,
      code: {
        language: 'powershell',
        caption: 'GPO via PowerShell (GroupPolicy module)',
        code: `Import-Module GroupPolicy
New-GPO -Name "GPO-Users-ScreenLock" | New-GPLink -Target "OU=Users,DC=company,DC=local" -LinkEnabled Yes

Get-GPO -All | Select DisplayName, GpoStatus, CreationTime, ModificationTime
Get-GPInheritance -Target "OU=Sales,OU=Users,DC=company,DC=local"
Get-GPOReport -Name "GPO-Users-ScreenLock" -ReportType Html -Path "C:\\temp\\gpo-report.html"`,
      },
    },
    {
      title: 'AGPM - GPO Change Management',
      content: `**AGPM (Advanced Group Policy Management)** - add-on for GPMC. Change control for GPO.

**Why AGPM:**
- GPO versioning (who changed what, when)
- Workflow: Edit → Submit → Approve → Deploy
- Rollback to previous version
- Separation of roles: Editor vs Approver

**AGPM Roles:**

| Role | Rights |
|------|-------|
| **Editor** | Creating, editing GPO (in checkout) |
| **Reviewer** | View, compare versions |
| **Approver** | Approval and deployment |
| **Admin** | AGPM Role Management |

**Workflow with AGPM:**
1. Editor: Check Out GPO → editing → Check In
2. Editor: Submit for Approval
3. Approver: Review changes (diff) → Approve or Reject
4. GPO automatically deploys to linked OUs

**For SMB:** AGPM is part of MDOP (Microsoft Desktop Optimization Pack). For an office of <100 people, discipline + GPO versioning via backup SYSVOL is enough. AGPM - for enterprise with multiple GPO editors.

**Alternative without AGPM:**
- Backup GPO before change: \\\`Backup-GPO -Name "GPO-Name" -Path "C:\\GPO-Backups"\\\`
- Documenting changes in an ITSM ticket
- Pilot OU for testing`,
      code: {
        language: 'powershell',
        caption: 'Backup and restore GPO',
        code: `Backup-GPO -All -Path "C:\\GPO-Backups\\$(Get-Date -Format yyyy-MM-dd)"
Get-GPO -All | ForEach-Object { Backup-GPO -Name $_.DisplayName -Path "C:\\GPO-Backups\\$(Get-Date -Format yyyy-MM-dd)" }

# Restore
Restore-GPO -Name "GPO-Users-ScreenLock" -Path "C:\\\\GPO-Backups\\\\2025-03-15\\\\GPO-GUID-FOLDER"

# Сравнение двух GPO
Compare-GPO -Name "GPO-Users-ScreenLock" -BaseGPOVersion $null -TargetGPOVersion $null`,
      },
    },
    {
      title: 'Security Filtering and WMI Filters',
      content: `**Security Filtering** - controls who the GPO applies to.

**Default:** GPO applies to Authenticated Users (all).

**How to limit:**
1. Remove Authenticated Users from Security Filtering
2. Add the desired group: G_Sales, G_IT, G_Laptops
3. Rights: Read + Apply Group Policy

**Example:** GPO-Users-DriveMaps-Sales applies only to G_Sales:
- Security Filtering: G_Sales (Read + Apply)
- Link to OU=Users (or OU=Sales)

**WMI Filters** - applying GPO based on the WMI request:

| Filter | WMI Query | Application |
|--------|-----------|------------|
| Laptops only | BatteryStatus | BitLocker GPO |
| Windows 11 | Version >= 10.0.22000 | Win11-specific policies |
| >8 GB RAM | TotalPhysicalMemory > 8GB | Heavy software GPO |
| SSD only | MediaType = 4 | Optimizations for SSD |

**Creating a WMI Filter in GPMC:**
1. WMI Filters → New
2. Namespace: \\\`root\\\\cimv2\\\`
3. Query: \\\`SELECT * FROM Win32_Battery\\\` (laptops)
4. Link to GPO

> **Warning:** WMI Filters slow down GPO application (WMI query on every refresh). Use OU + Security Filtering where possible.`,
      code: {
        language: 'powershell',
        caption: 'Security Filtering via PowerShell',
        code: `Set-GPPermissions -Name "GPO-Users-DriveMaps-Sales" -TargetName "G_Sales" -TargetType Group -PermissionLevel GpoApply
Set-GPPermissions -Name "GPO-Users-DriveMaps-Sales" -TargetName "Authenticated Users" -TargetType Group -PermissionLevel GpoRead -Replace

Get-GPPermission -Name "GPO-Users-DriveMaps-Sales" | Select Trustee, Permission`,
      },
    },
    {
      title: 'Loopback Processing Mode',
      content: `**Loopback Processing** - Applies a Computer GPO to users logged into this PC.

**Why:**
- Terminal server (RDS) - the same settings for all users
- Kiosk / shared PC - settings depend on the PC, not on the user
- Computer Lab - fixed configuration

**Two modes:**

| Mode | Behavior |
|-------|-----------|
| **Replace** | User GPO is completely replaced by Computer GPO |
| **Merge** | User GPO + Computer GPO (Computer wins the conflict) |

**Settings:**
Computer Configuration → Policies → Administrative Templates → System → Group Policy → Configure user Group Policy loopback processing mode

**Real SMB scenario:**
- RDS server: loopback Replace → all users receive the same printers, drive maps
- Reception (kiosk): loopback Replace → limited desktop, no access to settings

> **Do not enable** loopback on regular workstations - it will break personal User GPOs.`,
    },
    {
      title: 'Password and lockout policies',
      content: `**Password Policy** - via Default Domain Policy or a separate GPO at the domain level.

| Parameter | Path to GPO | SMB Recommendation |
|----------|-----------|-----------------|
| Minimum password length | Account Policies → Password Policy | 12+ characters |
| Password complexity | Account Policies → Password Policy | Enabled |
| Maximum password age | Account Policies → Password Policy | 90 days or 0 (never) |
| Account lockout threshold | Account Policies → Account Lockout | 5 attempts |
| Lockout duration | Account Policies → Account Lockout | 30 minutes |
| Reset lockout counter | Account Policies → Account Lockout | 30 minutes |

**Fine-Grained Password Policies (FGPP):**
- Not through GPO, but through AD (see chapter AD)
- For different groups: admins, service accounts, regular users

**Interactive logon:**
- Computer Configuration → Windows Settings → Security Settings → Local Policies → Security Options
- Interactive logon: Message text - “This is the company system. Unauthorized access is prohibited"
- Interactive logon: Machine inactivity limit - 900 sec (15 min)

**Modern approach:** long passwords + MFA (Azure MFA, Windows Hello) instead of changing frequently.`,
    },
    {
      title: 'Folder Redirection',
      content: `**Folder Redirection** - redirection of user folders (Documents, Desktop, Pictures) to the file server.

**Why:**
- Data on the server → backed up by Veeam
- Roaming: the user logs in to any PC → his files are in place
- Ransomware: server data protected by VSS/immutable backup

**Configuration via GPO:**
User Configuration → Policies → Windows Settings → Folder Redirection

| Folder | Server path | Recommendation |
|-------|----------------|-------------|
| Documents | \\\\\\\\fileserver\\\\users\\\\%username%\\\\Documents | Required |
| Desktop | \\\\\\\\fileserver\\\\users\\\\%username%\\\\Desktop | Recommended |
| Pictures | \\\\\\\\fileserver\\\\users\\\\%username%\\\\Pictures | Optional |
| AppData | Do not redirect | Problems with profiles |

**Settings:**
- Basic: Redirect everyone's folder to same location → \\\\\\\\fileserver\\\\users\\\\%username%\\\\Documents
- Grant user exclusive rights: Yes
- Move contents: Yes (on first use)
- Policy Removal: Leave contents (when GPO is disabled)

**Offline Files:** cache on a laptop for working without a network. Adjust the cache size.

**Real case:** accountant changed PC → Folder Redirection → all documents in place without copying.`,
      code: {
        language: 'powershell',
        caption: 'Checking Folder Redirection on the client',
        code: `# На клиенте — куда перенаправлены папки
gpresult /scope user /v | Select-String "Folder Redirection"

# Проверка доступности share
Test-Path "\\\\\\\\fileserver\\\\users\\\\$env:USERNAME\\\\Documents"

# Offline Files status
Sync-Object -ObjectType OfflineFiles`,
      },
    },
    {
      title: 'AppLocker - application control',
      content: `**AppLocker** - whitelist applications via GPO. Only authorized programs can run.

**Why:**
- Protection against malware (the user will not run the .exe from Downloads)
- Compliance: only approved software
- License control

**AppLocker rules (by priority):**
1. **Publisher Rules** - by digital signature (best option)
2. **Path Rules** - along the path (C:\\\\Program Files\\\\*)
3. **Hash Rules** - by file hash (for unsigned)

**Typical SMB configuration:**
- Allow: C:\\\\Program Files\\\\*, C:\\\\Windows\\\\*
- Allow: Publisher = Microsoft, Google, Adobe
- Deny: %TEMP%\\\\*, %Downloads%\\\\*.exe
- Audit mode first! (Rule -> Create -> Audit, not Enforce)

**Settings:**
Computer Configuration → Policies → Windows Settings → Security Settings → Application Control Policies → AppLocker

**Requirements:**
- Windows Enterprise or Education (not Home/Pro for enforce)
- Application Identity service — Automatic

> **Always** start with Audit mode on pilot OU. 2 weeks of log collection → analysis → Enforce.`,
      code: {
        language: 'powershell',
        caption: 'AppLocker - viewing rules and logs',
        code: `Get-AppLockerPolicy -Effective -Xml
Get-AppLockerPolicy -Local | Test-AppLockerPolicy -Path "C:\\Users\\test\\Downloads\\malware.exe"

# Логи AppLocker (Event Viewer → Application and Services Logs → Microsoft → Windows → AppLocker)
Get-WinEvent -LogName "Microsoft-Windows-AppLocker/EXE and DLL" -MaxEvents 20 | Select TimeCreated, Id, Message`,
      },
    },
    {
      title: 'BitLocker via GPO',
      content: `**BitLocker Drive Encryption** - drive encryption via GPO. A must for laptops.

**Configuration via GPO:**
Computer Configuration → Policies → Administrative Templates → Windows Components → BitLocker Drive Encryption

| Politics | Meaning | Why |
|----------|---------|-------|
| Require additional authentication at startup | Enabled, TPM | Without TPM - USB key |
| Choose drive encryption method | XTS-AES 256-bit | Modern standard |
| Configure storage card encryption | Force encryption | SD cards too |
| OS drives: recovery options | Save to AD | Recovery via AD |
| Fixed drives: encryption method | XTS-AES 256-bit | Data |

**BitLocker Recovery Key in AD:**
- Automatic saving of recovery password in AD
- Helpdesk can restore access without reinstallation
- \\\`Get-ADObject -Filter {objectClass -eq 'msFVE-RecoveryInformation'}\\\`

**MBAM (Microsoft BitLocker Administration and Monitoring):**
- Centralized management, compliance reports
- For enterprise; SMB - GPO + AD recovery is enough

**Real case:** laptop stolen → BitLocker → data unavailable. Recovery key in AD → if necessary, recovery on a new disk.`,
      code: {
        language: 'powershell',
        caption: 'BitLocker status and recovery key',
        code: `Get-BitLockerVolume | Select MountPoint, VolumeStatus, EncryptionPercentage, ProtectionStatus

# Recovery key из AD
Get-ADObject -Filter 'objectClass -eq "msFVE-RecoveryInformation"' -SearchBase (Get-ADComputer "LAPTOP-IVAN01").DistinguishedName -Properties msFVE-RecoveryPassword | Select msFVE-RecoveryPassword

# Принудительное шифрование (если GPO применена, но не зашифровано)
Manage-bde -on C: -used`,
      },
    },
    {
      title: 'Credential Guard and Device Guard',
      content: `**Credential Guard** - isolation of secrets (NTLM hashes, Kerberos tickets) in a virtualized Secure World. Pass-the-Hash protection.

**Requirements:**
- Windows 10/11 Enterprise or Server 2016+
- UEFI, Secure Boot, TPM 2.0, Virtualization-based security (VBS)
- 64-bit CPU with SLAT

**Configuration via GPO:**
Computer Configuration → Policies → Administrative Templates → System → Device Guard
- Turn On Virtualization Based Security: Enabled
- Credential Guard: Enabled with UEFI lock

**Device Guard / WDAC (Windows Defender Application Control):**
- Whitelist applications at the kernel level (stronger than AppLocker)
- For highly secure environments (Tier 0 PAW)

**For SMB:**
- Credential Guard: enable on all workstations (if the hardware supports it)
- Device Guard: optional, AppLocker is enough for most

> Check compatibility: \\\`msinfo32\\\` → Virtualization-based security → Running`,
    },
    {
      title: 'GPO Preferences and Scripts',
      content: `**Group Policy Preferences (GPP)** - advanced settings without ADMX templates.

**Popular Preferences:**

| Preference | Destination | Example |
|-----------|------------|--------|
| Drive Maps | Network drives | Z: → \\\\\\\\fileserver\\\\sales |
| Printers | Printers | Default printer by OU |
| Shortcuts | Shortcuts | Intranet on desktop |
| Registry | Registry keys | Setting up the application |
| Scheduled Tasks | Tasks | Clear temp |
| Local Users and Groups | Local groups | Add Domain Admins to Administrators |
| Environment Variables | Variables | APP_SERVER=192.168.10.20 |
| Files | Copying files | Config on PC |
| Folders | Creating folders | C:\\\\CompanyApp\\\\logs |

**Item-Level Targeting:** each item can have a condition (group, OU, IP, WMI).

**Logon/Startup Scripts:**
- User Configuration → Scripts → Logon
- Computer Configuration → Scripts → Startup
- Preferably PowerShell (.ps1) from \\\\\\\\fileserver\\\\scripts

**Danger of GPP Passwords:**
- GPP could store passwords in SYSVOL (encrypted, but decryptable!)
- **Never** store passwords in GPP Preferences
- Use gMSA or LAPS`,
    },
    {
      title: 'Windows Update via GPO',
      content: `**Managing Windows updates through GPO** is critical to office stability.

**Basic Policies:**
Computer Configuration → Policies → Administrative Templates → Windows Components → Windows Update

| Politics | Meaning | Why |
|----------|---------|-------|
| Configure Automatic Updates | Enabled, Auto download and schedule install | Time control |
| No auto-restart with logged on users | Enabled | Do not reboot while working |
| Specify intranet Microsoft update service | http://SRV-WSUS01:8530 | WSUS |
| Target group name | Pilot/Production | Upgrade Rings |
| Defer feature updates | 30 days | Testing |
| Defer quality updates | 7 days | Testing |

**Upgrade rings:**
1. GPO → WSUS Target Group: Pilot → OU=IT
2. GPO → WSUS Target Group: Production → OU=Computers (except IT)
3. WSUS: Approve updates for Pilot → in 1 week for Production

**Real case:** KB breaks VPN → Pilot ring received by KB → IT noticed → Production ring did not receive → business was not affected.`,
    },
    {
      title: 'GPO delegation and auditing',
      content: `**Delegation to GPMC:**
- Right click on GPO → Delegate
- IT L2: Edit settings, Read (without Apply - if necessary)
- Helpdesk: Read only (gpresult, but not edit)

**Audit GPO changes:**
- Event ID 5136, 5137, 5141 - Directory Service (GPO changes in AD)
- Event ID 4004, 4005 — Group Policy operational log
- AGPM changelog (if used)

**Dangerous GPOs (never do this!):**
- Disable UAC
- «Always install with elevated privileges»
- Logon scripts with Domain Admin creds
- GPP Passwords with passwords
- Disable Windows Firewall
- AppLocker Deny all (without testing)

**GPO Central Store:**
- \\\\\\\\company.local\\\\SYSVOL\\\\company.local\\\\Policies\\\\PolicyDefinitions
- Copy ADMX/ADML files from Windows 10/11 ISO
- All DCs use the same templates
- Chrome, Edge, Office ADMX - download from vendor sites`,
      code: {
        language: 'powershell',
        caption: 'Central Store and ADMX',
        code: `# Создание Central Store (на DC)
$centralStore = "\\\\$((Get-ADDomain).DNSRoot)\\SYSVOL\\$((Get-ADDomain).DNSRoot)\\Policies\\PolicyDefinitions"
New-Item -Path $centralStore -ItemType Directory -Force
Copy-Item -Path "C:\\Windows\\PolicyDefinitions\\*" -Destination $centralStore -Recurse -Force

# Проверка
Test-Path "$centralStore\\windows.admx"`,
      },
    },
    {
      title: 'Onboarding Runbook',
      content: `**Runbook: new employee (onboarding)**

| # | Step | Responsible | Tool | Time |
|---|------|--------------|-----------|-------|
| 1 | Create AD user | IT Admin | ADUC/PowerShell | 5 min |
| 2 | Set OU (department) | IT Admin | ADUC | 1 min |
| 3 | Add to groups | IT Admin | ADUC/PowerShell | 5 min |
| 4 | M365 License | IT Admin | M365 Admin Center | 5 min |
| 5 | Prepare PC | IT/Helpdesk | MDT/Intune/manual | 30–60 min |
| 6 | Join to domain | IT | Settings/PowerShell | 5 min |
| 7 | Move PC to OU | IT | ADUC | 1 min |
| 8 | GPO applied (gpupdate) | Automatically | GPO | 5 min |
| 9 | MFA enrollment | User + IT | Azure MFA / Windows Hello | 10 min |
| 10 | VPN profile | IT | GPO/Intune/manual | 5 min |
| 11 | Mail, Teams, 1C | IT/User | M365, 1C admin | 15 min |
| 12 | Documentation | IT | ITSM ticket | 5 min |

**Groups for a new sales manager:**
- G_Sales (department)
- G_VPN (remote access)
- DL_Share_Sales_RW (files)
- G_M365_E3 (license)
- G_Sales_Printers (printers)

**GPOs that will be applied automatically:**
- GPO-Users-ScreenLock (OU=Users)
- GPO-Users-DriveMaps-Sales (Security Filtering: G_Sales)
- GPO-Computers-BitLocker (OU=Computers)
- GPO-Computers-WindowsUpdate (OU=Computers)`,
      code: {
        language: 'powershell',
        caption: 'Onboarding script - creating a user',
        code: `$newUser = @{
  Name = "Anna Smirnova"
  SamAccountName = "anna.smirnova"
  UPN = "anna.smirnova@company.local"
  Path = "OU=Sales,OU=Users,DC=company,DC=local"
  Password = ConvertTo-SecureString "TempPass2025!" -AsPlainText -Force
}
New-ADUser @newUser -Enabled $true -ChangePasswordAtLogon $true -Description "Sales Manager - started $(Get-Date -Format yyyy-MM-dd)"
$groups = @("G_Sales","G_VPN","DL_Share_Sales_RW","G_M365_E3")
$groups | ForEach-Object { Add-ADGroupMember -Identity $_ -Members "anna.smirnova" }
Write-Host "User created. Groups added. Ticket updated."`,
      },
    },
    {
      title: 'Offboarding Runbook',
      content: `**Runbook: dismissal of an employee (offboarding) - CRITICAL!**

| # | Step | Urgency | Tool |
|---|------|----------|-----------|
| 1 | **Disable AD account** | Immediately | ADUC/PowerShell |
| 2 | **Reset password** | Immediately | PowerShell |
| 3 | **Revoke sessions** | Immediately | Azure AD / Revoke-ADUserAllRefreshTokens |
| 4 | Remove from all groups (except Domain Users) | Same day | PowerShell |
| 5 | Move to OU=Disabled | Same day | ADUC |
| 6 | Convert mailbox to shared | 1–3 days | M365 Admin |
| 7 | Set email forward to manager | 1–3 days | M365 Admin |
| 8 | Wipe mobile device | Immediately | Intune |
| 9 | Collect equipment (PC, phone, badge) | 1–7 days | HR + IT |
| 10 | Remove VPN access | Immediately | Firewall/VPN |
| 11 | Audit file access (who is the owner?) | 1–7 days | File server |
| 12 | Delete account | 30–90 days | ADUC (after audit) |

**What happens if you forget disable:**
- A former employee logs into the system
- Access to files, mail, VPN
- Potential data leak

**Real case:** a fired employee logged in via VPN after 2 weeks - the account was not disabled. The audit showed downloading of files. Lesson: disable **at the moment** of HR notification.`,
      code: {
        language: 'powershell',
        caption: 'Offboarding script - complete blocking',
        code: `$user = "ivan.petrov"
Disable-ADAccount -Identity $user
Set-ADAccountPassword -Identity $user -Reset -NewPassword (ConvertTo-SecureString (New-Guid).Guid -AsPlainText -Force)
Set-ADUser -Identity $user -Description "DISABLED $(Get-Date -Format 'yyyy-MM-dd HH:mm') - offboarding"
Move-ADObject -Identity (Get-ADUser $user).DistinguishedName -TargetPath "OU=Disabled,OU=Users,DC=company,DC=local"
Get-ADUser $user -Properties MemberOf | Select -Expand MemberOf | Where-Object {$_ -notmatch "Domain Users"} | ForEach-Object { Remove-ADGroupMember -Identity $_ -Members $user -Confirm:$false }
Write-Host "Account disabled, password reset, moved to Disabled OU, groups removed."`,
      },
    },
    {
      title: 'Troubleshooting GPO',
      content: `**GPO does not apply - checklist:**

| # | Check | Team |
|---|----------|---------|
| 1 | GPO linked? | GPMC → OU → Linked GPOs |
| 2 | GPO enabled? | GPMC → GPO Status |
| 3 | Link enabled? | GPMC → Link enabled |
| 4 | Security Filtering? | GPMC → Delegation tab |
| 5 | WMI Filter? | GPMC → WMI Filter on GPO |
| 6 | Block Inheritance? | GPMC → OU → Block Inheritance |
| 7 | Enforced? | GPMC → Link → Enforced |
| 8 | gpupdate done? | \\\`gpupdate /force\\\` |
| 9 | Perelogin? | User GPO requires logoff/logon |
| 10 | Reboot? | Computer GPO requires reboot |

**Diagnostic commands:**
\\\`gpresult /r\\\` — brief report
\\\`gpresult /h report.html\\\` - full HTML
\\\`gpresult /scope computer /z\\\` - all Computer GPOs (verbose)
\\\`rsop.msc\\\` — GUI resultant policy

**Event Logs:**
- Application and Services Logs → Microsoft → Windows → Group Policy → Operational
- Event 4004: GPO applied successfully
- Event 5017: GPO link disabled
- Event 8004: GPO denied by WMI filter

**Typical SMB problems:**

| Problem | Reason | Solution |
|----------|---------|---------|
| Drive map did not appear | User GPO, did not re-login | gpupdate + logoff |
| BitLocker did not turn on | No TPM, GPO requires TPM | Edit GPO |
| AppLocker blocks software | Rules are too strict | Audit mode, add rule |
| Slow login | Many GPOs, WMI filters | Optimize, remove WMI |`,
      code: {
        language: 'powershell',
        caption: 'Diagnostics of GPO on the client',
        code: `gpresult /h C:\\temp\\gp-report.html
gpresult /scope user /v | Select-String "Applied Group Policy"
gpresult /scope computer /v | Select-String "Applied Group Policy"

Get-WinEvent -LogName "Microsoft-Windows-GroupPolicy/Operational" -MaxEvents 20 | Where-Object {$_.Id -in 4004,5017,8004,8005} | Select TimeCreated, Id, Message`,
      },
    },
    {
      title: 'GPO for RDS and Terminal Servers',
      content: `**Remote Desktop Services (RDS)** - special requirements for GPOs.

**Required GPOs for RDS:**
- Loopback Processing: Replace (on OU terminal servers)
- Session timeout: Disconnect session after 8 hours
- Remove disconnect menu (optional)
- Printer redirection: configure default printer
- Drive redirection: enable/disable

**RDS Licensing:**
- RDS CAL - separate from Windows Server CAL
- Per User or Per Device RDS CAL
- RD Licensing server - GPO for specifying license server

**RDS Policies:**
Computer Configuration → Policies → Administrative Templates → Windows Components → Remote Desktop Services

| Politics | Meaning |
|----------|---------|
| Limit number of connections | Under license |
| Set time limit for disconnected sessions | 8 hours |
| Do not allow drive redirection | No (allow) |
| Always prompt for password upon connection | Yes |

**Real scenario:** 10 accountants work on RDS → loopback GPO → identical 1C, Excel, printers → IT manages one server instead of 10 PCs.`,
    },
    {
      title: 'GPO settings paths - User Configuration',
      content: `**User Configuration → Policies → Administrative Templates** - the main paths for user policies.

| Category | Path | Typical settings |
|-----------|------|-------------------|
| **Control Panel** | User Config → Policies → Admin Templates → Control Panel | Hide screens, disable Settings pages |
| **Desktop** | → Desktop | Wallpaper, lock screen image |
| **Start Menu** | → Start Menu and Taskbar | Pin apps, disable shutdown |
| **Windows Components** | → Windows Components | Edge, Store, Cortana disable |
| **Remote Desktop Services** | → Windows Components → RDS | Session limits, redirection |
| **Network** | → Network | Offline files, network connections |
| **System** | → System | Ctrl+Alt+Del, scripts, user profiles |
| **Windows Explorer** | → Windows Components → File Explorer | Hide drives, default save location |

**User Configuration → Policies → Windows Settings:**

| Path | Destination |
|------|------------|
| **Security Settings** | User rights (logon locally), restricted groups |
| **Scripts (Logon/Logoff)** | PowerShell/VBS at logon |
| **Internet Explorer Maintenance** | Legacy IE settings |
| **Folder Redirection** | Documents, Desktop → file server |

**User Configuration → Preferences:**
- Drive Maps, Printers, Shortcuts, Registry, Environment
- “Apply once and do not reapply” - for one-time setup
- Item-level targeting - by group, IP, registry

**Computer Configuration paths (reference):**
Computer Config → Policies → Admin Templates → Windows Components → Windows Update
Computer Config → Policies → Windows Settings → Security Settings → BitLocker Drive Encryption

> **Naming in GPMC:** the full path is visible in the Explain tab of each policy.`,
    },
    {
      title: 'GPO settings paths - Computer Configuration',
      content: `**Computer Configuration → Policies → Administrative Templates** - PC level policies.

| Category | Path | SMB settings |
|-----------|------|---------------|
| **Windows Components → Windows Update** | WU policies | WSUS server, defer quality updates |
| **Windows Components → BitLocker** | BitLocker | TPM required, recovery to AD |
| **Windows Components → Windows Defender** | Defender AV | Exclusions via GPO |
| **Windows Components → AppLocker** | AppLocker | Allow rules Program Files |
| **Windows Components → Credential Guard** | Device Guard | Enable VBS, CG |
| **System → Logon** | Logon | Don't display last user |
| **System → Power Management** | Power | Sleep disabled on servers/desktops |
| **Network → Network Connections** | Network | Prohibit use of ICS |
| **Network → WLAN Service** | Wi‑Fi | Preferred network list |

**Computer Configuration → Policies → Windows Settings → Security Settings:**

| Section | Key Policies |
|--------|-------------------|
| **Account Policies** | Password, lockout, Kerberos |
| **Local Policies → Audit** | Audit logon, policy change |
| **Local Policies → User Rights** | Deny logon locally, shut down |
| **Local Policies → Security Options** | LAN Manager auth, SMB signing |
| **Windows Firewall** | Domain profile rules |
| **Public Key Policies** | Auto-enrollment, trusted roots |
| **Application Control (AppLocker)** | Executable rules |
| **Advanced Audit Policy** | Granular audit (recommended over legacy) |

**Windows Settings → Scripts:**
- Startup / Shutdown - for deploy software, registry

> Default Domain Policy - password policy only. Everything else is separate GPOs.`,
    },
    {
      title: 'LGPO — offline Group Policy',
      content: `**LGPO.exe (Local Group Policy Object utility)** - Microsoft tool for backup/apply GPO without domain on a standalone or air-gapped PC.

**Scenarios:**
- Workgroup machines
- DMZ servers without domain join
- Baseline export from reference GPO → import offline
- Disaster recovery without DC

**LGPO Commands:**

| Team | Destination |
|---------|------------|
| \\\`LGPO.exe /b path\\\` | Backup local policy |
| \\\`LGPO.exe /g path\\\` | Apply policy from folder |
| \\\`LGPO.exe /s\\\` | Export security template |

**Workflow:**
1. On the reference machine: configure baseline GPO settings locally
2. \\\`LGPO.exe /b C:\\\\\\\\LGPO-Backup\\\`
3. Copy folder to target machines (USB, SCCM package)
4. \\\`LGPO.exe /g C:\\\\\\\\LGPO-Backup\\\`
5. gpupdate /force

**Security Compliance Toolkit:**
- Microsoft bundles LGPO + baselines (Windows 10/11, Server)
- Download ZIP, apply recommended baseline

**Limitations:**
- No Preferences (only Policies)
- No central reporting
- Overwrites local policy completely on /g

> For 5 workgroup PCs in the lab - LGPO is faster than manual local policy.`,
      code: {
        language: 'powershell',
        caption: 'LGPO deployment script',
        code: `# Скачай LGPO.exe из Microsoft Security Compliance Toolkit
$lgpoPath = "C:\\\\\\\\Tools\\\\\\\\LGPO.exe"
$backupPath = "\\\\\\\\fileserver\\\\it\\\\LGPO-Baseline"

& $lgpoPath /g $backupPath /v
gpupdate /force

# Verify applied settings
secedit /export /cfg C:\\\\\\\\Temp\\\\\\\\secpol-export.cfg
Get-Content C:\\\\\\\\Temp\\\\\\\\secpol-export.cfg | Select-String "PasswordHistorySize"`,
      },
    },
    {
      title: 'Policy Analyzer - GPO comparison',
      content: `**Policy Analyzer** - Microsoft tool for analyzing and comparing effective policy across machines/GPOs.

**Possibilities:**
- Import multiple GPO backups or live exports
- Highlight differences between policies
- Export to Excel for compliance audit
- Detect conflicting settings

**Workflow compliance audit:**
1. \\\`Backup-GPO -All -Path C:\\\\\\\\GPO-Audit\\\\\\\\$(Get-Date -Format yyyy-MM-dd)\\\`
2. Policy Analyzer → Add files from backup
3. Compare «Production Baseline» vs «Current State»
4. Export diff report for management

**Alternatives:**
- **Microsoft Security Compliance Toolkit** — PolicyAnalyzer.exe included
- **GPResult /H** — per-machine snapshot
- **Advanced Group Policy Management (AGPM)** — version diff in enterprise

**Typical findings:**
- BitLocker GPO disabled on Laptops OU by mistake
- Conflicting password policy (domain vs FGPP)
- AppLocker audit mode left for 2 years
- WSUS server IP changed, GPO not updated

> Quarterly: run Policy Analyzer diff against CIS baseline GPO export.`,
    },
    {
      title: 'Onboarding Runbook - 30 steps',
      content: `**Full employee reception runbook (Sales department example):**

| # | Step | Responsible | SLA |
|---|------|---------------|-----|
| 1 | HR ticket with full name, position, start date | HR | D-5 |
| 2 | Generate SamAccountName by convention | IT | D-3 |
| 3 | Create AD user in OU=Sales,OU=Users | IT | D-3 |
| 4 | Set UPN: first.last@company.local | IT | D-3 |
| 5 | Add to G_Sales, G_AllStaff, G_VPN | IT | D-3 |
| 6 | Add to G_Sales_Share (AGDLP) | IT | D-3 |
| 7 | Set manager attribute in AD | HR/IT | D-3 |
| 8 | Enable «User must change password at logon» | IT | D-3 |
| 9 | FGPP applies automatically (12 char) | Auto | — |
| 10 | Email mailbox (M365 or on-prem) | IT | D-2 |
| 11 | Add to M365 groups (Sales, All) | IT | D-2 |
| 12 | Azure AD Connect delta sync if hybrid | Auto/IT | D-2 |
| 13 | Assign M365 license | IT | D-2 |
| 14 | Prepare laptop from OU=Computers\\\\Laptops | IT | D-2 |
| 15 | Verify GPO: BitLocker, Screen Lock, Drive Maps | IT | D-2 |
| 16 | Install LOB apps: CRM, Office | IT | D-1 |
| 17 | Configure VPN profile (Intune or manual) | IT | D-1 |
| 18 | Assign desk phone / Teams number | IT | D-1 |
| 19 | Create badge / access card (physical) | Security | D-1 |
| 20 | Print welcome sheet: login, temp password, IT contact | IT | D-1 |
| 21 | Day 1: handover laptop, force password change | IT | D0 |
| 22 | Verify login, email, share access | IT | D0 |
| 23 | User signs AUP (acceptable use policy) | HR | D0 |
| 24 | Add to onboarding distribution list | IT | D0 |
| 25 | Schedule security awareness training | HR | D+7 |
| 26 | Verify CRM access with sales manager | Manager | D+3 |
| 27 | Document in CMDB / asset register | IT | D+1 |
| 28 | Close HR ticket | IT | D+1 |
| 29 | 30-day review: unused accounts check | IT | D+30 |
| 30 | Add to quarterly access review list | IT | Ongoing |

> Temp password - only via secure channel (not email plaintext).`,
    },
    {
      title: 'Offboarding Runbook - 30 steps',
      content: `**Full employee dismissal runbook:**

| # | Step | Priority | SLA |
|---|------|-----------|-----|
| 1 | HR notification with last day (immediate if termination) | Critical | Day 0 |
| 2 | **Disable AD account** (not delete!) | **Immediately** | 0 min |
| 3 | Reset password to random 32 char | **Immediately** | 0 min |
| 4 | Move user to OU=Disabled | **Immediately** | 15 min |
| 5 | Remove from all groups except Domain Users | **Immediately** | 15 min |
| 6 | Block sign-in M365 (BlockCredential) | **Immediately** | 15 min |
| 7 | Revoke all active sessions (Revoke-AzureADUserAllRefreshToken) | **Immediately** | 15 min |
| 8 | Convert mailbox to shared OR forward | High | 1 hr |
| 9 | Remove M365 license (after 30-day retention) | Low | D+30 |
| 10 | Wipe mobile devices (Intune remote wipe) | **Immediately** | 1 hr |
| 11 | Disable VPN access | **Immediately** | 15 min |
| 12 | Collect laptop / phone | High | D0 |
| 13 | Remote wipe laptop if not returned (BitLocker recovery) | High | D+3 |
| 14 | Remove from physical access control | Security | D0 |
| 15 | Change shared passwords user knew | High | 24 hr |
| 16 | Review service accounts owned by user | Medium | 24 hr |
| 17 | Transfer file ownership (OneDrive, shares) | Medium | 48 hr |
| 18 | Manager gets access to former employee data | Medium | 48 hr |
| 19 | Remove from CRM, LOB apps | High | 24 hr |
| 20 | Document in offboarding ticket | Medium | D0 |
| 21 | Archive mailbox per retention policy | Low | D+30 |
| 22 | Delete Azure AD sync object if hard delete planned | Low | D+90 |
| 23 | 30-day hold in OU=Disabled (legal/compliance) | Policy | 30 days |
| 24 | Review audit log: last logon, file access | Medium | D+7 |
| 25 | Confirm no scheduled tasks under user creds | Medium | 48 hr |
| 26 | Remove email from distribution lists | Medium | 24 hr |
| 27 | Update org chart, Teams | HR | D+1 |
| 28 | After retention: Delete-ADUser or keep for audit | Policy | D+90 |
| 29 | Reclaim hardware asset tag | IT | D+7 |
| 30 | Close ticket, lessons learned if incident | IT | D+7 |

> **Termination for cause:** steps 1-8 in first 5 minutes. HR + IT coordinated.`,
    },
    {
      title: 'Compliance reporting GPO',
      content: `**Compliance GPO reporting** - evidence for ISO, SOC2, GDPR audits.

**Data sources:**

| Source | What shows |
|----------|----------------|
| **Get-GPOReport -All -ReportType Html** | All GPO settings |
| **GPResult /H** | Effective policy per machine/user |
| **Advanced Audit + 4719** | Policy change events |
| **Microsoft Secure Score** | Cloud + hybrid posture |
| **Policy Analyzer diff** | Drift from baseline |
| **Intune compliance policies** | MDM overlap with GPO |

**Automated compliance script (weekly):**
1. Backup all GPO to dated folder
2. Export GPResult from sample PCs (10% per OU)
3. Check BitLocker status: Get-BitLockerVolume via WinRM
4. Report non-compliant machines to ITSM

**Key compliance checks SMB:**

| Requirement | GPO/Check |
|------------|-------------|
| Password 12+ chars | Default Domain Policy / FGPP |
| Screen lock 10 min | GPO-Users-ScreenLock |
| BitLocker on laptops | GPO-Computers-BitLocker + report |
| Local admin via LAPS | Separate GPO |
| USB block (optional) | Device restriction GPO |
| Audit policy enabled | GPO-Computers-Audit |

**Dashboard for management:**
- % laptops BitLocker encrypted
- % PCs with latest GPO version (SYSVOL version)
- Count failed gpupdate (Event 1129)

> Auditors want **evidence**: HTML reports dated, not «we have GPO».`,
      code: {
        language: 'powershell',
        caption: 'GPO compliance report script',
        code: `Import-Module GroupPolicy
$date = Get-Date -Format yyyy-MM-dd
$reportPath = "\\\\\\\\fileserver\\\\it\\\\GPO-Reports\\\\$date"
New-Item -Path $reportPath -ItemType Directory -Force

Get-GPO -All | ForEach-Object {
  Get-GPOReport -Guid $_.Id -ReportType Html -Path "$reportPath\\\\$($_.DisplayName).html"
}

$computers = Get-ADComputer -Filter * -SearchBase "OU=Workstations,DC=company,DC=local"
$results = foreach ($pc in $computers) {
  try {
    Invoke-Command -ComputerName $pc.Name -ScriptBlock {
      [PSCustomObject]@{
        Computer = $env:COMPUTERNAME
        BitLocker = (Get-BitLockerVolume -MountPoint C:).VolumeStatus
        LastBoot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
      }
    } -ErrorAction Stop
  } catch {
    [PSCustomObject]@{ Computer = $pc.Name; BitLocker = "Unreachable"; LastBoot = $null }
  }
}
$results | Export-Csv "$reportPath\\\\bitlocker-compliance.csv" -NoTypeInformation`,
      },
    },
    {
      title: 'Lab: GPO end-to-end',
      content: `**Goal:** Create, test and document a set of GPOs for OU=Lab.

| Step | Action | Expected result |
|-----|----------|---------------------|
| 1 | Create OU=Lab,OU=Users and OU=Lab,OU=Computers | OUs visible in ADUC |
| 2 | GPO-Computers-Baseline: disable USB storage | DevMgmt blocks USB |
| 3 | GPO-Users-ScreenLock: 5 min idle | Screen locks on test user |
| 4 | Security Filtering: GPO-Users-ScreenLock → G_Lab_Users only | Other users unaffected |
| 5 | WMI Filter: apply BitLocker GPO only if chassis=laptop | Desktop skips BitLocker |
| 6 | GPO Preferences: map drive H: to \\\\\\\\fileserver\\\\lab | Drive visible after gpupdate |
| 7 | Link GPOs in correct order (baseline first, specific last) | LSDOU verified in gpresult |
| 8 | gpupdate /force on test PC | Policies applied |
| 9 | gpresult /h lab-report.html | HTML shows all settings |
| 10 | rsop.msc — verify computer and user sections | GUI matches gpresult |
| 11 | Backup all lab GPO: Backup-GPO -All | Folder in C:\\\\\\\\GPO-Backups |
| 12 | Policy Analyzer: import backup, export Excel | Diff report saved |
| 13 | Simulate conflict: two GPOs set different screen timeout | Document winner (LSDOU) |
| 14 | LGPO: export from lab PC, apply to workgroup VM | Offline policy works |
| 15 | Document GPO naming convention for your org | 1-page standard |`,
    },
    {
      title: 'FAQ — Group Policy',
      content: `**Q1: ​​GPO not applied - first 3 checks?**
A: gpresult /r, verify link enabled, security filtering group membership, computer in correct OU.

**Q2: Preferences vs Policies - what's the difference?**
A: Policies - registry keys are deleted when un-linked. Preferences - “tattoo”, may remain.

**Q3: How do I exclude one user from a GPO?**
A: Security Filtering - deny Apply Group Policy (be careful!) or WMI filter, or separate OU.

**Q4: Loopback Merge vs Replace?**
A: Replace — only computer GPO user settings. Merge — computer + user combined, computer wins conflicts.

**Q5: How to speed up boot/login with many GPOs?**
A: Reduce WMI filters, disable unused extensions, use Fast Logon Optimization (careful), split GPOs logically.

**Q6: Central Store - why?**
A: ADMX templates in SYSVOL — consistent admin templates all editors.

**Q7: Is it possible to GPO on workgroup?**
A: Local Group Policy only. LGPO for bulk. No domain GPO.

**Q8: AppLocker vs Software Restriction Policies?**
A: AppLocker — modern, Win7+. SRP legacy. Use AppLocker.

**Q9: How do I roll back a GPO change?**
A: Restore-GPO from backup, or AGPM rollback, or manually revert setting.

**Q10: GPO and Intune conflict?**
A: Intune MDM wins for enrolled devices on conflict (MDM policy). Use co-management or choose one.`,
    },
    {
      title: 'Common GPO errors and solutions',
      content: `| Error | Reason | Solution |
|--------|---------|---------|
| GPO not applying | Link disabled, wrong OU | Enable link, move object |
| Access denied gpupdate | Missing read on GPO | Authenticated Users Read + Apply |
| Slow logon (>2 min) | Many GPO, WMI, scripts | Split GPO, optimize scripts |
| Drive map not appearing | Item-level targeting wrong | Check targeting, user in group |
| BitLocker not encrypting | TPM not ready, GPO wrong OU | tpm.msc, verify computer config |
| Conflicting settings | Multiple GPO same setting | LSDOU order, disable duplicate |
| AppLocker blocks app | Path/hash rule missing | Event 8003/8004, add allow rule |
| Folder Redirection fails | Share permission | Grant user Modify on folder |
| Screen lock not working | User GPO blocked by loopback | Check loopback mode |
| WSUS GPO wrong target | Pointing to old server | Update policy, gpupdate |
| LGPO overwrote domain GPO | Applied LGPO on domain PC | Don't mix; rejoin or gpupdate |
| Central Store missing ADMX | Not created | Copy PolicyDefinitions to SYSVOL |
| Deny Apply too broad | Accidental deny ACE | Audit GPO delegation |
| Password policy not applying | FGPP precedence issue | Resultant Set of Policy for FGPP |
| Scripts not running | PowerShell execution policy | GPO sets bypass for logon scripts |`,
    },
    {
      title: 'Admin Day Scenarios - GPO',
      content: `**Scenario 1 - “After GPO change - Excel does not open”**

The CFO calls in a panic. Yesterday we enabled AppLocker enforce mode. Event 8004 on CFO PC: excel.exe blocked (wrong path rule - Office Click-to-Run path). Emergency: create new allow rule for Office16 path, gpupdate on CFO PC. Post-incident: pilot OU next time, keep audit mode 2 weeks.

**Scenario 2 - “New office, 20 PCs per day”**

Imaging 20 PCs, join OU=Workstations\\\\NewOffice. Zero touch: BitLocker, Wi‑Fi, drive maps, printers — all GPO. One PC gpresult reference saved. Issue: WMI filter excluded 3 PCs (wrong manufacturer). Fix filter, reapply. 18/20 perfect, 2 manual — acceptable.

**Scenario 3 - “Audit ISO - prove screen lock”**

Auditor requests evidence. Export Get-GPOReport for GPO-Users-ScreenLock, GPResult from 10 random PCs via script, Event 4801/4802 lock events from WEF. Compliance report: 98% compliant, 2 PCs offline — documented. Passed audit.`,
    },
    {
      title: 'GPO production checklist',
      content: `**Design phase:**
- [ ] GPO naming convention documented
- [ ] One purpose per GPO (avoid mega-GPO)
- [ ] Default Domain Policy untouched except password
- [ ] Central Store configured
- [ ] Pilot OU exists

**Deployment phase:**
- [ ] Backup-GPO before every change
- [ ] Change ticket with rollback plan
- [ ] Test on pilot OU 48h minimum
- [ ] gpresult verified on each policy type (user/computer)

**Security:**
- [ ] GPO delegation: only GPO_Admins edit
- [ ] No Deny Apply without documentation
- [ ] AppLocker / BitLocker enforced on laptops
- [ ] Audit GPO changes (4719)

**Operations:**
- [ ] Weekly GPO backup automated
- [ ] Quarterly Policy Analyzer baseline diff
- [ ] Compliance report (BitLocker, screen lock)
- [ ] Onboarding/offboarding runbooks linked to GPO groups

**RDS-specific:**
- [ ] Loopback Replace on session hosts OU
- [ ] Session timeout configured
- [ ] Printer redirection tested`,
    },
    {
      title: 'Preparing for AZ-800/801 - GPO',
      content: `| AZ-800 Topic | Section |
|--------------|--------|
| Configure Group Policy | GPMC workflow, LSDOU |
| Manage GPO scope | Security Filtering, WMI |
| Troubleshoot GPO | Troubleshooting, FAQ |
| Implement Folder Redirection | FR section |
| Configure Windows Server security | BitLocker, AppLocker GPO |

| AZ-801 Topic | Section |
|--------------|--------|
| Harden Windows Server | CIS via GPO, Credential Guard |
| Configure endpoint security | Defender, AppLocker |
| Manage updates | WSUS GPO |
| Implement compliance | Compliance reporting |
| Secure privileged access | LAPS GPO, admin restrictions |

**Exam tips:**
- Know LSDOU order cold
- Loopback Merge vs Replace scenarios
- FGPP vs Default Domain Policy
- gpresult / rsop interpretation`,
    },
    {
      title: 'Interview Questions - GPO',
      content: `**1. What is LSDOU?**
Local, Site, Domain, OU — order of GPO application. Last writer wins on conflict at same level.

**2. How does Security Filtering work?**
GPO applies only if user/computer has Read + Apply Group Policy permission in GPO delegation.

**3. Loopback processing - when is it needed?**
Terminal servers, kiosk PCs — need user settings from computer OU regardless of user OU.

**4. How is Enforced (No Override) different?**
GPO at higher level cannot be overridden by lower GPO. Use sparingly.

**5. How does Block Inheritance work?**
OU ignores inherited GPO from parent. Exceptions for specific GPO with Enforced.

**6. Central Store location?**
\\\\\\\\domain.local\\\\SYSVOL\\\\domain.local\\\\Policies\\\\PolicyDefinitions

**7. What is WMI filter?**
Query (WQL) evaluated on client — GPO applies only if query returns true.

**8. Folder Redirection - what happens offline?**
Files cached locally (offline files), sync on reconnect.

**9. How to troubleshoot slow GPO?**
GPSVC log, enable Group Policy operational log, count GPO extensions, check network to DC.

**10. AGPM vs Backup-GPO?**
AGPM — version control workflow in production. Backup-GPO — point-in-time backup, good for SMB.`,
    },
  ],
  practice: [
    'Create a GPO: lock screen after 10 minutes, wake-up password. Link to OU=Users, check gpresult',
    'GPO Preferences: map network drive Z: for the G_Sales group via Security Filtering',
    'Set up a password policy: 12 characters, lock after 5 attempts, lockout 30 min',
    'On the client: gpresult /h report.html - study all applied policies, explain the LSDOU order',
    'Setting Folder Redirection for Documents to \\\\\\\\fileserver\\\\users\\\\%username%\\\\Documents',
    'Create an AppLocker rule in Audit mode: allow C:\\\\Program Files\\\\*, C:\\\\Windows\\\\*. Check the logs after 1 day',
    'Setting up BitLocker GPO for OU=Laptops: TPM required, recovery key to AD. Test it on a test laptop',
    'Create a logon script (PowerShell): record logon time to \\\\\\\\fileserver\\\\logs\\\\logon.csv',
    'Design a GPO naming convention for the office: 8 GPOs with names and purpose',
    'Write a 1-page onboarding runbook: 12 steps for a new Sales employee',
    'Write a 1 page offboarding runbook: 12 steps, mark “immediately” vs “within a week”',
    'Set up Central Store GPO, import ADMX for Google Chrome. Create a GPO with Chrome Policy',
    'Complete GPO end-to-end lab (15 steps): Security Filtering, WMI, Preferences, backup',
    'Apply LGPO baseline on workgroup VM, compare secedit export with domain GPO',
    'Generate compliance report: Get-GPOReport -All + BitLocker status CSV from 5 PCs',
  ],
  resources: [
    { title: 'Microsoft Learn — Group Policy', url: 'https://learn.microsoft.com/en-us/windows-server/identity/group-policy/group-policy-overview' },
    { title: 'GPO Central Store', url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-client/group-policy/create-and-manage-central-store' },
    { title: 'AppLocker', url: 'https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/applocker/applocker-overview' },
    { title: 'BitLocker Group Policy', url: 'https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/configure' },
    { title: 'Folder Redirection', url: 'https://learn.microsoft.com/en-us/windows-server/storage/folder-redirection/folder-redirection-using-group-policy' },
    { title: 'LGPO and Security Compliance Toolkit', url: 'https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-security-configuration-framework/security-compliance-toolkit-10' },
    { title: 'Policy Analyzer', url: 'https://learn.microsoft.com/en-us/windows/security/threat-protection/windows-security-configuration-framework/security-compliance-toolkit-10' },
    { title: 'Group Policy Preferences', url: 'https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/dn581922(v=ws.11)' },
  ],
  quiz: [
    {
      question: 'What does LSDOU mean in Group Policy?',
      options: ['Local, Site, Domain, OU - order of application', 'Linux, Server, Domain, User', 'Logon, Startup, Domain, OU'],
      answer: 'Local, Site, Domain, OU - order of application',
    },
    {
      question: 'GPO Preferences are used for:',
      options: ['Drive maps, registry, shortcuts without ADMX', 'Passwords only', 'BitLocker only'],
      answer: 'Drive maps, registry, shortcuts without ADMX',
    },
    {
      question: 'First operation when offboarding an employee:',
      options: ['Disable AD account', 'Delete AD account', 'Format PC'],
      answer: 'Disable AD account',
    },
    {
      question: 'Command to force GPO update on client:',
      answer: 'gpupdate /force',
    },
    {
      question: 'Where should you NOT store passwords in a GPO?',
      options: ['GPP Scheduled Tasks with embedded creds', 'GPO Password Policy', 'GPO Screensaver lock'],
      answer: 'GPP Scheduled Tasks with embedded creds',
    },
    {
      question: 'Computer Configuration applies:',
      options: ['When the computer boots', 'Only when logout', 'Only on DC'],
      answer: 'When the computer boots',
    },
  ],
}

export default translation
