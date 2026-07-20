import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Windows Server - The Complete Guide',
  duration: '12–16 hours',
  description:
    'Deep dive into Windows Server for SMB office: licensing, Server Core, roles, PowerShell remoting, WSUS, Windows Admin Center, logs, performance and troubleshooting',
  sections: [
    {
      title: 'The role of Windows Server in the office',
      content: `**Windows Server** is a platform for corporate services in SMB and enterprise. In an office of 20–200 people, this is usually the “center of the universe” of infrastructure.

| Role | Destination | Typical SMB Scenario |
|------|------------|----------------------|
| **Domain Controller (AD DS)** | Centralized accounts, policies | Single login for all PCs |
| **DNS** | Name resolution on a local network | \\\`company.local\\\`, AD SRV records |
| **DHCP** | Automatic IP issuance | PCs receive IP, gateway, DNS |
| **File Server** | Shared folders, NTFS rights | \\\\\\\\fileserver\\\\sales, \\\\\\\\fileserver\\\\hr |
| **Print Server** | Network Printers | One driver - 50 jobs |
| **RDS** | Remote Desktops | Remote work, thin clients |
| **Hyper-V** | Virtualization on Windows | DC + 1C + Veeam on one hardware |
| **WSUS** | Local updates | Patch control without Internet traffic |

**Windows Server vs Linux Server:**
- Office with an AD domain → almost always Windows Server
- Web, containers, cloud → more often Linux
- A good engineer knows **both** worlds

> Real case: office for 45 people, one physical Dell T340 server, Hyper-V with 3 VMs: DC01, FS01, VEEAM01. This is a typical SMB scheme.`,
    },
    {
      title: 'Versions, editions and licensing',
      content: `**Current versions:** Windows Server 2019, 2022, 2025. For new projects - **2022** or **2025**.

**Editions:**

| Edition | Virtualization | When to use |
|---------|---------------|-------------------|
| **Standard** | Up to 2 VMs per host (with correct license) | Typical office 1–3 servers |
| **Datacenter** | Unlimited virtualization | Data Center, Large Virtualization |
| **Essentials** | ≤25 users, simplified AD | Legacy, not for new projects |

**Licensing - two components:**

1. **Server license (per-core):** minimum 16 cores per server, all physical cores are licensed
2. **CAL (Client Access License):** per **user** (User CAL) or **device** (Device CAL)

| Type CAL | When to choose |
|---------|----------------|
| **User CAL** | An employee works from 2+ devices (PC + laptop + phone) |
| **Device CAL** | Shared PCs (reception, warehouse, shift) - many people, few devices |

**Calculation example for an office of 40 people:**
- 1× Server Standard (16-core pack, if the server has 8 cores - 1 pack)
- 40× User CAL (each employee has his own login)
- RDS CAL - separately if Remote Desktop Services is used

**Evaluation:** ISO for 180 days, full functionality. For lab - Hyper-V on a workstation.

> **License audit:** Once a year, check whether the CAL matches the number of active AD accounts. Microsoft's audit fines are real.`,
    },
    {
      title: 'Server Core vs Desktop Experience (GUI)',
      content: `**Desktop Experience** - full GUI, Server Manager, familiar desktop. Convenient for training and the first DC in the lab.

**Server Core** - minimal installation without GUI:
- Smaller attack surface (fewer components)
- Fewer patches, faster reboots
- ~40% RAM savings
- Management via PowerShell, RSAT, Windows Admin Center

| Criterion | Server Core | Desktop Experience |
|----------|-------------|-------------------|
| Newbie-friendly | Low | High |
| Security | Above | Below |
| Patches | Less | More |
| Recommendation prod | **Yes** | Only if there is a good reason |

**Switching:** cannot be done on the fly. Only reinstallation or conversion via DISM (Server Core ↔ Desktop Experience).

**Real SMB scenario:** first DC is GUI (easier to learn). Second DC, file server, WSUS - Server Core + Windows Admin Center for GUI management.

\\\`sconfig.exe\\\` on Server Core - text menu: network, hostname, domain, Windows Update, exit to PowerShell.`,
      code: {
        language: 'powershell',
        caption: 'Determining the installation type and going to PowerShell with sconfig',
        code: `Get-ItemProperty "HKLM:\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion" | Select ProductName, InstallationType
# Server Core: InstallationType = Server Core
# Desktop Experience: InstallationType = Server

# На Server Core — sconfig запускается автоматически при входе
# Опция 15: Exit to PowerShell`,
      },
    },
    {
      title: 'Installation and initial setup',
      content: `**Minimum requirements (Server 2022):**
- CPU: 1.4 GHz 64-bit
- RAM: 2 GB (actually **4+ GB** for DC, **8+ GB** for Hyper-V host)
- Disk: 32 GB (actually **60–100 GB** for a system volume)

**Initial setup order (before roles!):**

1. **Static IP** - required on DC, recommended on all servers
2. **Hostname** - friendly name: \\\`SRV-DC01\\\`, \\\`SRV-FS01\\\`, \\\`SRV-WSUS01\\\`
3. **Windows Update** - all critical patches
4. **Activation** - KMS in the office or MAK key
5. **Time zone and NTP** - critical for Kerberos (±5 min)
6. **Disable IE Enhanced Security** (on DC - according to policy, for lab - more convenient)
7. **Installing roles** - via Server Manager or PowerShell

**Server naming in SMB:**
\\\`\\\`\\\`
SRV-DC01.company.local - first domain controller
SRV-DC02.company.local - second DC (fault tolerance!)
SRV-FS01.company.local - file server
SRV-HV01.company.local - Hyper-V host
\\\`\\\`\\\`

> **Never** install DHCP on a single DC without reserving its IP on the router. Loss of IP DC = loss of domain for clients.`,
      code: {
        language: 'powershell',
        caption: 'Initial setup via PowerShell',
        code: `Rename-Computer -NewName "SRV-DC01" -Restart

New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.10.10 -PrefixLength 24 -DefaultGateway 192.168.10.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 127.0.0.1

Set-TimeZone -Id "Russian Standard Time"
w32tm /config /manualpeerlist:"time.windows.com" /syncfromflags:manual /update
w32tm /resync /force

Get-ComputerInfo | Select WindowsProductName, OsBuildNumber, CsTotalPhysicalMemory`,
      },
    },
    {
      title: 'Server Manager and Server Roles',
      content: `**Server Manager** (\\\`servermanager.exe\\\`) - central console: roles, services, events, local users, dashboard of all servers.

**Adding a role:** Manage → Add Roles and Features Wizard.

**Typical first server (DC) - roles:**
1. **Active Directory Domain Services** - domain
2. **DNS Server** - installed with AD
3. Optional: **DHCP** (in large networks - a separate server)

**File Server:**
- **File and Storage Services** → File Server, DFS (optional)
- NTFS rights, quotas, Shadow Copies (VSS)

**Print Server:**
- **Print and Document Services**
- Shared printer → x64/x86 drivers → GPO for auto-connection

**RDS (Remote Desktop Services):**
- RD Session Host - desktops
- RD Gateway - SSL VPN for RDP
- RD Licensing - separate RDS CALs
- RD Connection Broker - session balancing

**Hyper-V:**
- Hyper-V role on a separate host (not on DC!)
- Virtual Switch, Integration Services

**Features (components, not roles):**
- RSAT - AD/GPO tools from the admin workstation
- .NET Framework / .NET Core
- Windows Server Backup
- Telnet Client - for diagnostics only, not on prod
- GUI on Server Core: \\\`Install-WindowsFeature Server-Gui-Mgmt-Infra\\\`

> **SMB Rule:** one DC is a risk. Minimum **2 DC** for any production office. One fire in the server room should not stop the business.`,
      code: {
        language: 'powershell',
        caption: 'Installing roles via PowerShell',
        code: `Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
Install-WindowsFeature -Name DHCP -IncludeManagementTools
Install-WindowsFeature -Name FS-FileServer -IncludeManagementTools
Install-WindowsFeature -Name Print-Server -IncludeManagementTools
Get-WindowsFeature | Where-Object InstallState -eq 'Installed' | Select Name, DisplayName`,
      },
    },
    {
      title: 'PowerShell: Administration Basics',
      content: `PowerShell is the **main** Windows admin tool. Everything in the GUI can and should be automated.

**Philosophy:** If you do something twice, write a script.

**Basic principles:**
- \\\`Get-Command *dns*\\\` — cmdlet search
- \\\`Get-Help Get-Service -Examples\\\` - examples
- \\\`Get-Help Get-Service -Full\\\` - complete documentation
- Pipeline: \\\`Get-Service | Where-Object Status -eq 'Stopped'\\\`
- Objects, not text - PowerShell returns .NET objects

**Profiles and modules:**
- \\\`$PROFILE\\\` — startup script
- Modules: ActiveDirectory, DnsServer, DhcpServer, GroupPolicy - installed with roles

**Execution Policy:**
\\\`Set-ExecutionPolicy RemoteSigned\\\` - local scripts without a signature, downloaded ones - with a signature.

> In production scripts, use \\\`-WhatIf\\\` and \\\`-Confirm\\\` for dangerous operations.`,
    },
    {
      title: 'PowerShell Remoting (WinRM)',
      content: `**WinRM** (Windows Remote Management) - remote management via PowerShell. SSH replacement for the Windows world (OpenSSH is also available, but WinRM is the standard).

**Settings on the server:**
\\\`Enable-PSRemoting -Force\\\` - includes WinRM, firewall rule, listener.

**Connection:**
\\\`Enter-PSSession -ComputerName SRV-FS01\\\` - interactive session
\\\`Invoke-Command -ComputerName SRV-FS01 -ScriptBlock { Get-Service }\\\` - one-time command
\\\`Invoke-Command -ComputerName SRV-DC01,SRV-FS01 -ScriptBlock { hostname }\\\` – multiple servers

**CredSSP / Kerberos:** authentication is transparent in the domain. Workgroup - needed \\\`-Credential\\\`.

**Limitations:**
- Port **5985** (HTTP) / **5986** (HTTPS)
- Double-hop problem - solved by CredSSP or gMSA
- Just Enough Administration (JEA) - restriction of rights in a remoting session

**Real scenario:** admin with RSAT on workstation → \\\`Enter-PSSession SRV-DC01\\\` → AD management without RDP to server.

> **Security:** do not open WinRM to the Internet. Internal network only or via VPN/jump host.`,
    },
    {
      title: 'Windows services and startup',
      content: `**Services (services.msc)** - Windows Server background processes.

| Startup type | Behavior |
|-------------|-----------|
| **Automatic** | Start at OS boot |
| **Automatic (Delayed Start)** | Start 1–2 minutes after loading |
| **Manual** | Launch on demand |
| **Disabled** | Disabled |

**Critical services on DC:**
- **NTDS** (Active Directory Domain Services)
- **DNS** (DNS Server)
- **Netlogon** - DNS registration, authentication
- **KDC** (Kerberos Key Distribution Center)
- **W32Time** — time synchronization

**Task Scheduler** - “cron for Windows”:
- Triggers: on schedule, on event, on entry
- Actions: launch a program, PowerShell script
- Examples: backup, disk report, temp cleaning

**Real case:** Spooler service is frozen → printers are not printing → \\\`Restart-Service Spooler\\\` → solved in 30 seconds. Know the typical services of your roles.`,
      code: {
        language: 'powershell',
        caption: 'Diagnostics and service management',
        code: `Get-Service | Where-Object Status -eq 'Stopped' -and StartType -eq 'Automatic' | Select Name, DisplayName, Status

Get-Service -Name NTDS, DNS, Netlogon, KDC, W32Time | Format-Table Name, Status, StartType

# Службы, которые не запустились после reboot
Get-WinEvent -FilterHashtable @{LogName='System'; Id=7000,7009,7011; StartTime=(Get-Date).AddDays(-1)} | Select TimeCreated, Message -First 10`,
      },
    },
    {
      title: 'Windows Update and WSUS',
      content: `**Windows Update** on servers is critical, but requires control. Automatic DC reboot during business hours = incident.

**WSUS (Windows Server Update Services)** - local update server:

| Advantage | Description |
|-------------|----------|
| Control | You decide which KBs to install |
| Traffic | One downloads from the Internet, the rest from WSUS |
| Testing | Pilot group → production in 1–2 weeks |
| Reports | Who hasn't updated |

**Scheme of ring update (SMB):**
1. **Pilot** - IT department (5 PCs), updates immediately
2. **Wave 1** — 25% of the office, after 1 week
3. **Wave 2** - the rest, in 2 weeks
4. **Servers** - separate ring, maintenance window (Sunday 02:00)

**GPO for WSUS:**
- Computer Configuration → Policies → Administrative Templates → Windows Components → Windows Update
- Specify intranet Microsoft update service location: \\\`http://SRV-WSUS01:8530\\\`

**On servers without WSUS:** manual control, maintenance window via GPO or SCONFIG.

> **Golden rule:** test updates on a **copy** DC (lab VM) before production. KBs that break AD are rare, but they do happen.`,
    },
    {
      title: 'Windows Admin Center',
      content: `**Windows Admin Center (WAC)** is a modern web-based server management console. Free, no additional license required.

**Features:**
- Dashboard servers (CPU, RAM, disks)
- Manager of services, processes, events
- Role management (AD, DNS, DHCP, Hyper-V)
- PowerShell terminal in the browser
- Extensions: Azure, Storage, System Insights

**Installation:**
1. Download from microsoft.com/windows-server/admin-center
2. Install on a **separate** VM or admin workstation (not on a DC!)
3. Open \\\`https://wac-server:6516\\\`
4. Add servers by name or IP

**Server Core + WAC = perfect pairing:**
- Server Core on prod - minimal attack surface
- WAC - GUI when needed
- PowerShell remoting - automation

**Real SMB scenario:** An IT admin installs WAC on his PC, adds 4 servers, monitors disks and updates from the browser. No need for RDP on every server.

> WAC **does not replace** GPMC, ADUC, Veeam Console is a complement, not a replacement.`,
    },
    {
      title: 'Event Viewer and Event Logs',
      content: `**Event Viewer (eventvwr.msc)** is the first tool for any Windows Server incident.

**Main magazines:**

| Magazine | What to look for |
|--------|-----------|
| **System** | Services, drivers, reboots, Kernel-Power |
| **Application** | Application errors (SQL, 1C, Veeam) |
| **Security** | Logins, refusals, rights changes (audit needed!) |
| **Directory Service** | AD replication, LDAP (DC only) |
| **DNS Server** | DNS zone errors |
| **Setup** | Installing updates, roles |

**Key Event ID:**

| ID | Meaning |
|----|----------|
| 1074 | Scheduled reboot |
| 6008 | Unexpected shutdown (power!) |
| 4624 | Successful login |
| 4625 | Failed login (brute-force?) |
| 4740 | Account blocking |
| 1311 | AD Replication Topology Error |

**PowerShell for logs:**
\\\`Get-WinEvent\\\` - more powerful than legacy \\\`Get-EventLog\\\`.

**Centralization:** WEF (Windows Event Forwarding) → SIEM, or simple collection into a shared folder for SMB.`,
    },
    {
      title: 'Performance and Monitoring',
      content: `**Performance Monitor (perfmon.msc)** - real-time counters and Data Collector Sets.

**Key counters for SMB server:**

| Counter | Alarm threshold | What does |
|---------|---------------|-------------|
| \\\\Processor(_Total)\\\\% Processor Time | >80% sustained | CPU overloaded |
| \\\\Memory\\\\Available MBytes | <200 MB | Lack of RAM |
| \\\\PhysicalDisk(_Total)\\\\% Disk Time | >80% | Disc – bottleneck |
| \\\\PhysicalDisk(_Total)\\\\Avg. Disk Queue Length | >2 | Disk queue |
| \\\\Network Interface(*)\\\\Bytes Total/sec | Depends on NIC | Network traffic |

**Resource Monitor (resmon.exe)** - GUI: CPU, Memory, Disk, Network by process.

**Task Manager** - a quick look, but not for production monitoring.

**Real case:** file server slows down → resmon → Disk → we see antimalware scanning of each file → excluding the backup folder from scanning → problem solved.

**Recommendations for SMB:**
- Turn on **System Insights** (WAC) - predictive alerts
- Set up email alerts for disk <15% free
- Document baseline: normal CPU/RAM during working hours`,
      code: {
        language: 'powershell',
        caption: 'Quick performance diagnostics',
        code: `Get-Counter '\\Processor(_Total)\\% Processor Time' -SampleInterval 1 -MaxSamples 5
Get-Counter '\\Memory\\Available MBytes'
Get-Counter '\\PhysicalDisk(_Total)\\% Disk Time'

Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, @{N='MemMB';E={[math]::Round($_.WorkingSet64/1MB,0)}}, CPU`,
      },
    },
    {
      title: 'Windows Server License Audit',
      content: `**Why an audit:** Microsoft can conduct an audit (SAM - Software Asset Management). CAL mismatch = penalty.

**What to check:**

| Component | How to check |
|-----------|--------------|
| Server license | Number of cores, edition (Std/Datacenter) |
| User/Device CAL | Active AD accounts vs purchased CALs |
| RDS CAL | Active RDS sessions vs RDS CAL |
| Virtualization rights | Standard = 2 VM, how many VMs is real? |

**Tools:**
- \\\`slmgr /dlv\\\` - Windows license details
- AD: number of enabled users
- RDS Licensing Manager - used CALs

**Audit documentation:**
1. List of servers: hostname, edition, cores, roles
2. Number of CALs by type (User/Device/RDS)
3. Dates of purchase, license numbers
4. Policy: “1 user = 1 User CAL”

> Keep license documents **separate** from servers. For ransomware on a file server, licenses must also be available.`,
      code: {
        language: 'powershell',
        caption: 'License inventory script',
        code: `slmgr /dlv
(Get-CimInstance SoftwareLicensingService).OA3xOriginalProductKey

$enabledUsers = (Get-ADUser -Filter {Enabled -eq $true}).Count
Write-Host "Enabled AD users: $enabledUsers"
Write-Host "Purchased User CALs: [заполни вручную из документации]"
Write-Host "Delta: проверь соответствие"`,
      },
    },
    {
      title: 'Windows Server Security',
      content: `**Basic hardening checklist:**

1. **Minimum roles** - only what is needed
2. **Windows Firewall** — default deny, allow only necessary ports
3. **Local Administrators** - minimum number of people, separate admin accounts
4. **RDP** - only via VPN or jump host, NLA enabled, not 3389 to the Internet
5. **Audit** - Advanced Audit Policy (entries, group changes)
6. **Defender** - built-in AV, exceptions for Veeam/SQL
7. **Disable LLMNR/NetBIOS** - mitm attacks on the local network
8. **Credential Guard** - on supported hardware (Server 2016+)

**Ports that must be open (DC):**
- 53 (DNS), 88 (Kerberos), 389/636 (LDAP), 445 (SMB), 3268/3269 (GC)
- Full list: Microsoft docs “Configuring firewalls for AD domains”

**RDP best practices:**
- Network Level Authentication (NLA) - required
- Restrict by IP via firewall
- MFA via RD Gateway + Azure MFA
- Session timeout: disable inactive sessions

**Tiered Administration Model:**
- Tier 0: Domain Admins - DC only, only with PAW (Privileged Access Workstation)
- Tier 1: Server admins - servers, not DCs
- Tier 2: Helpdesk - workstations, password reset`,
    },
    {
      title: 'Hyper-V on Windows Server',
      content: `**Hyper-V** - embedded virtualization. For SMB - an alternative to VMware without vSphere licenses.

**Requirements:**
- 64-bit CPU with SLAT (Second Level Address Translation)
- VT-x/AMD-V enabled in BIOS
- Enough RAM (give host at least 4 GB + RAM for VM)

**Virtual Switch Types:**

| Type | Description |
|-----|----------|
| **External** | VM is visible on the physical network |
| **Internal** | VM ↔ Host, not on the physical network |
| **Private** | Only between VMs |

**Key operations:**
- **Checkpoints** - snapshots (not a replacement for a backup!)
- **Integration Services** - drivers in the guest OS
- **Live Migration** - VM migration without downtime (requires Failover Cluster)
- **Dynamic Memory** - RAM on demand

**Typical SMB scheme:**
\\\`\\\`\\\`
SRV-HV01 (physical, 64 GB RAM, 2× SSD RAID1)
├── VM: SRV-DC01 (4 GB RAM, 60 GB disk)
├── VM: SRV-DC02 (4 GB RAM, 60 GB disk)
├── VM: SRV-FS01 (8 GB RAM, 500 GB disk)
└── VM: SRV-VEEAM01 (8 GB RAM, 2 TB disk for repository)
\\\`\\\`\\\`

> **Rule:** VM backup via Veeam, not checkpoints. Checkpoints on production DC are a bad idea (affect AD performance).`,
      code: {
        language: 'powershell',
        caption: 'Managing Hyper-V via PowerShell',
        code: `Get-VM | Select Name, State, CPUUsage, @{N='RAM_GB';E={[math]::Round($_.MemoryAssigned/1GB,1)}}
Get-VMSwitch | Select Name, SwitchType
Get-VMHardDiskDrive -VMName "SRV-DC01" | Select VMName, Path

# Создание VM (пример)
New-VM -Name "SRV-TEST01" -MemoryStartupBytes 4GB -NewVHDPath "D:\\VMs\\SRV-TEST01.vhdx" -NewVHDSizeBytes 60GB -SwitchName "External"`,
      },
    },
    {
      title: 'Troubleshooting: Boot and Services',
      content: `**Methodology for “server down”:**

1. **Physical layer:** power, network, KVM/iLO
2. **Boot OS:** Safe Mode, Last Known Good
3. **Services:** which ones did not start?
4. **Logs:** Event Viewer System + Application
5. **Network:** ping, DNS, ports

**Download modes:**
- **Safe Mode** - minimum drivers and services
- **Safe Mode with Networking** — + network
- **Directory Services Restore Mode (DSRM)** - DC only, for AD recovery
- **Last Known Good Configuration** - registry rollback

**Typical SMB problems:**

| Symptom | Reason | Solution |
|---------|---------|---------|
| The server does not respond | Network, firewall, IP | Check cable, IP, firewall |
| "No server login" | DC unavailable | Check DNS, Netlogon, NTDS |
| The service does not start | Dependency, rights | Event 7000/7009, services.msc |
| Disk 0 bytes free | Logs, backups, temp | Cleaning, expanding volume |
| After update - blue screen | Problematic KB | Rollback KB, Safe Mode |

**Boot Configuration:** \\\`bcdedit\\\` - boot configuration, rollback.

> **Rule:** do not reboot the server until you have collected the logs. Event Viewer → System → latest errors → screenshot or export.`,
    },
    {
      title: 'File Server and Print Server - practice',
      content: `**File Server - typical SMB setup:**

1. Install the FS-FileServer role
2. Create volume/folders: \\\`D:\\\\Shares\\\\Sales\\\`, \\\`D:\\\\Shares\\\\HR\\\`
3. Share permissions: Everyone → Change (or specific groups)
4. NTFS permissions: AGDLP - AD groups, not individual users
5. Shadow Copies (VSS) - Previous Versions for users
6. Quotas - limiting space per user/folder

**Print Server:**
1. Install the Print-Server role
2. Print Management → Add Printer → TCP/IP
3. Publish to AD (List in Directory)
4. GPO: Deploy printer preferences for OU

**Real case:** accounting department complains “the file is open by another user” → Computer Management → Shared Folders → Open Files → close the hung session. Or: \\\`Get-SmbOpenFile | Close-SmbOpenFile -Force\\\`.

**DFS (Distributed File System):** for two file servers - a single namespace \\\\\\\\company\\\\data, replication between servers.`,
      code: {
        language: 'powershell',
        caption: 'File Server and Print Server',
        code: `New-Item -Path "D:\\Shares\\Sales" -ItemType Directory -Force
New-SmbShare -Name "Sales" -Path "D:\\Shares\\Sales" -FullAccess "COMPANY\\G_Sales"
Get-SmbShare | Select Name, Path, Description

Get-Printer | Select Name, DriverName, PortName, Shared
Get-SmbOpenFile | Select ClientComputerName, ClientUserName, Path`,
      },
    },
    {
      title: 'Server documentation and inventory',
      content: `**Each server must be documented.** When an administrator leaves or there is an incident, this is a lifesaver.

**inventory template (one line per server):**

| Field | Example |
|------|--------|
| Hostname | SRV-DC01 |
| IP | 192.168.10.10 |
| OS | Windows Server 2022 Standard |
| Roles | AD DS, DNS, DHCP |
| RAM / CPU / Disk | 8 GB / 4 vCPU / 100 GB |
| Physical/VM | VM on SRV-HV01 |
| Backup schedule | Daily System State 02:00 |
| Last patched | 2025-03-15 |
| Owner / Contact | IT Admin Ivan |

**Where to store:**
- ITSM (Jira, ServiceNow) — CMDB
- SharePoint / wiki
- **Not** only in the admin's head

**Automation:** the script collects the inventory of all servers via WinRM → CSV/JSON to the file server once a week.

> Update inventory with **every** change: new role, migration, OS update.`,
      code: {
        language: 'powershell',
        caption: 'Automatic inventory collection',
        code: `$servers = @('SRV-DC01','SRV-FS01','SRV-WSUS01')
$inventory = Invoke-Command -ComputerName $servers -ScriptBlock {
  [PSCustomObject]@{
    Hostname = $env:COMPUTERNAME
    OS = (Get-CimInstance Win32_OperatingSystem).Caption
    LastBoot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    RAM_GB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB,1)
    FreeDisk_GB = [math]::Round((Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace/1GB,1)
  }
}
$inventory | Export-Csv -Path "\\\\\\\\fileserver\\\\it\\\\inventory.csv" -NoTypeInformation`,
      },
    },
    {
      title: 'Lab: Installing Server Core',
      content: `**Goal:** Deploy Windows Server 2022 Server Core, perform basic non-GUI setup, and test management through PowerShell and Windows Admin Center.

**Expected result:** SRV-CORE01 server with static IP, synchronized time, installed updates and access via WinRM.

| Step | Action | Expected output |
|-----|----------|-----------------|
| 1 | Create a VM in Hyper-V: 2 vCPU, 4 GB RAM, 60 GB VHDX | VM created, ISO connected |
| 2 | When installing, select **Windows Server 2022 Standard (Server Core)** | InstallationType = Server Core |
| 3 | Set the local Administrator password | Login via VM console |
| 4 | Run \\\`sconfig\\\` → Option 8 (Network Settings) → static IP | IP pingable from lab network |
| 5 | Option 2: rename to SRV-CORE01, reboot | \\\`hostname\\\` → SRV-CORE01 |
| 6 | Option 6: Install Updates, reboot if necessary | Get-HotFix shows the latest KB |
| 7 | Option 15: Exit to PowerShell | PS prompt available |
| 8 | NTP Setting: \\\`w32tm /config /manualpeerlist:"time.windows.com" /syncfromflags:manual /update\\\` | w32tm /query /status → Source: time.windows.com |
| 9 | Turn on WinRM: \\\`Enable-PSRemoting -Force\\\` | Test-WSMan SRV-CORE01 → OK |
| 10 | From workstation: \\\`Enter-PSSession -ComputerName SRV-CORE01\\\` | Remote PS session is open |
| 11 | Set the role: \\\`Install-WindowsFeature FS-FileServer\\\` | Get-WindowsFeature FS-FileServer → Installed |
| 12 | Create a share: \\\`New-SmbShare -Name "Lab" -Path "C:\\\\\\\\Lab" -FullAccess "Administrators"\\\` | \\\\\\\\SRV-CORE01\\\\Lab available |
| 13 | Install Windows Admin Center on the admin PC, add SRV-CORE01 | Dashboard shows CPU/RAM |
| 14 | Collect baseline: Get-Counter, Get-WinEvent - save to CSV | baseline files saved |
| 15 | Document: IP, hostname, roles, patch date | Record in inventory |

> **Tip:** Server Core does not have a browser - all downloads are via PowerShell (\\\`Invoke-WebRequest\\\`) or from the admin station via WinRM copy.`,
      code: {
        language: 'powershell',
        caption: 'Post-install Server Core checklist script',
        code: `$report = [PSCustomObject]@{
  Hostname = $env:COMPUTERNAME
  OS = (Get-ItemProperty "HKLM:\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion").ProductName
  InstallType = (Get-ItemProperty "HKLM:\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion").InstallationType
  IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.PrefixOrigin -eq 'Manual'}).IPAddress
  TimeSync = (w32tm /query /status 2>&1 | Select-String "Source").ToString()
  LastBoot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
  PendingReboot = (Get-ItemProperty "HKLM:\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\WindowsUpdate\\\\Auto Update\\\\RebootRequired" -ErrorAction SilentlyContinue) -ne $null
}
$report | Format-List
$report | Export-Csv -Path "C:\\\\\\\\Lab\\\\\\\\server-core-baseline.csv" -NoTypeInformation`,
      },
    },
    {
      title: 'RDS - Deploying Remote Desktop Services',
      content: `**Remote Desktop Services (RDS)** is a platform for remote desktops and RemoteApp in an SMB office.

**RDS Components:**

| Role | Destination | SMB script |
|------|------------|--------------|
| **RD Connection Broker** | Session Routing, HA | 2+ session hosts |
| **RD Web Access** | Web portal for RDP | Access via HTTPS |
| **RD Gateway** | RDP over HTTPS (443) | Without VPN, with MFA |
| **RD Licensing** | RDS CAL accounting | Required in prod |
| **RD Session Host** | User sessions themselves | 1C, Excel, CRM |

**Deployment order (Quick Start):**

1. Install roles via Server Manager → Remote Desktop Services
2. RD Licensing - activate, specify the CAL type (Per User / Per Device)
3. RD Session Host - install applications (1C, Office)
4. RD Connection Broker - with 2+ session hosts
5. RD Gateway - optional, for access from the Internet
6. GPO: loopback processing on OU terminal servers
7. Set up a collection: Quick Session Collection or Session-based

**Licensing:**
- Windows Server CAL + **separate RDS CAL**
- Grace period: 120 days without license server
- GPO: Specify RD license servers

**SMB Guidelines:**
- 1 session host for up to 15 users - 16 GB RAM is enough
- Profile Disks (UPD) or Folder Redirection for profiles
- Antivirus exclusions for RDS (do not scan .vhdx profiles at peak)

> **Case:** accounting department of 12 people → one RDS-SRV01, RemoteApp for 1C, RDP for a full desk for the head accountant.`,
      code: {
        language: 'powershell',
        caption: 'Installing RDS roles via PowerShell',
        code: `Install-WindowsFeature RDS-RD-Server,RDS-Licensing,RDS-Connection-Broker -IncludeManagementTools

Import-Module RemoteDesktop
New-RDSessionDeployment -ConnectionBroker "SRV-RDS01.company.local" -WebAccessServer "SRV-RDS01.company.local" -SessionHost "SRV-RDS01.company.local"

New-RDSessionCollection -CollectionName "OfficeApps" -SessionHost "SRV-RDS01.company.local" -ConnectionBroker "SRV-RDS01.company.local" -PooledUnmanaged

Get-RDSessionCollection
Get-RDUserSession | Select UserName, SessionState, HostServer`,
      },
    },
    {
      title: 'FSRM - quotas and screening files',
      content: `**File Server Resource Manager (FSRM)** - quotas, screening, reports on the file server.

**Installation:** FS-Resource-Manager role (together with FS-FileServer).

**Quotas:**

| Type | Description | When to use |
|-----|----------|-------------------|
| **Hard quota** | Blocks recording when exceeded | Strict per-user limit |
| **Soft quota** | Email/log when exceeded | Warning for 90% |
| **Auto apply** | To all subfolders | \\\\\\\\users\\\\%username%\\\\ |

**File Screening:**
- Ban .exe, .mp3, .iso on file share
- Exceptions for IT folders
- Email notifications to the admin

**Reports:**
- Large files (>500 MB)
- Duplicate files
- Least recently accessed
- Quota usage per user

**Typical SMB setup:**
1. D:\\\\\\\\Shares\\\\\\\\Users — auto quota 5 GB per folder
2. D:\\\\\\\\Shares\\\\\\\\Public — screening: block executables
3. Weekly report “Top 50 largest files” by email IT

> FSRM + Shadow Copies = users restore themselves, IT controls the location.`,
      code: {
        language: 'powershell',
        caption: 'FSRM quotas via PowerShell',
        code: `Import-Module Fsrm

New-FsrmQuota -Path "D:\\\\\\\\Shares\\\\\\\\Users" -Size 5GB -Template "5 GB limit reports to user"

New-FsrmFileGroup -Name "Blocked Media" -IncludePattern @("*.mp3","*.mp4","*.iso")
New-FsrmFileScreen -Path "D:\\\\\\\\Shares\\\\\\\\Public" -Template "Block media files"

Get-FsrmQuota | Select Path, Size, Usage, Status
Get-FsrmAction | Select ActionType, EmailTo`,
      },
    },
    {
      title: 'DFS - distributed file system',
      content: `**DFS (Distributed File System)** - a single namespace and replication between file servers.

**Two components:**

| Component | Destination |
|-----------|------------|
| **DFS Namespace** | \\\\\\\\company.local\\\\Data → \\\\\\\\FS01\\\\Shares\\\\Data, \\\\\\\\FS02\\\\Shares\\\\Data |
| **DFS Replication (DFSR)** | Synchronizing folders between servers |

**SMB Scenarios:**
- Two offices - namespace hides the physical server
- File server migration - add a new target, remove the old one
- DR - replica to the second site

**Namespace types:**
- **Domain-based** — \\\\\\\\company.local\\\\Shares (recommended)
- **Stand-alone** - tied to one server

**DFSR requirements:**
- AD domain
- Ports 5722 (RPC), 138/139/445 (SMB)
- Staging folder - a place for conflicts
- Do not replicate open databases (1C, SQL) - only file shares

**Best practices:**
- Tiered storage: hot on SSD, archive on HDD
- Monitoring backlog: \\\`Get-DfsrState\\\`
- Pre-seed for large volumes (robocopy + initial sync)

> **Case:** \\\\\\\\company\\\\Data is always available - when FS01 crashes, clients automatically go to FS02 via namespace.`,
      code: {
        language: 'powershell',
        caption: 'DFS Namespace and Replication',
        code: `Install-WindowsFeature FS-DFS-Namespace,FS-DFS-Replication -IncludeManagementTools

New-DfsnRoot -Path "\\\\\\\\company.local\\\\Data" -TargetPath "\\\\\\\\SRV-FS01\\\\Shares\\\\Data" -Type DomainV2
New-DfsnFolder -Path "\\\\\\\\company.local\\\\Data\\\\Sales" -TargetPath "\\\\\\\\SRV-FS01\\\\Shares\\\\Sales"

New-DfsReplicationGroup -GroupName "RG-Data" -DomainName "company.local"
New-DfsReplicatedFolder -GroupName "RG-Data" -FolderName "Sales"
Add-DfsrMember -GroupName "RG-Data" -ComputerName "SRV-FS01","SRV-FS02"
Add-DfsrConnection -GroupName "RG-Data" -SourceComputerName "SRV-FS01" -DestinationComputerName "SRV-FS02"

Get-DfsrState -ComputerName SRV-FS01 | Select FolderName, Inbound, Outbound, State`,
      },
    },
    {
      title: 'NLB - Introduction to Network Load Balancing',
      content: `**NLB (Network Load Balancing)** - built-in TCP/UDP balancing on Windows Server (up to 32 nodes).

**When to use in SMB:**
- Web services on IIS (2+ servers)
- RD Web Access / RD Gateway HA
- **Not** for SQL, AD, DFS - use specialized solutions

**Modes:**
- **Unicast** - MAC to switch, easier
- **Multicast** — requires switch support
- **IGMP Multicast** - less flood on switch

**Affinity:**
- **Single** - one client → one server (sessions)
- **Network** — via Class C subnet
- **None** — round-robin

**NLB Limitations:**
- No application level health check (ping/TCP only)
- All nodes in one broadcast domain (L2)
- For enterprise - consider Azure Load Balancer / HAProxy

**SMB alternative:** one server + Veeam replication for DR instead of NLB cluster.

> NLB is “good enough” for two IIS servers of an intranet portal, not for mission-critical AD.`,
      code: {
        language: 'powershell',
        caption: 'Installing NLB and viewing the cluster',
        code: `Install-WindowsFeature NLB -IncludeManagementTools

# Создание кластера — обычно через nlbmgr.msc или:
Import-Module NetworkLoadBalancingClusters
New-NlbCluster -InterfaceName "Ethernet" -ClusterPrimaryIP "192.168.10.100" -ClusterOperationMode "Unicast"

Get-NlbCluster | Select ClusterName, ClusterPrimaryIP, ClusterOperationMode
Get-NlbClusterNode | Select HostName, State, DedicatedIP`,
      },
    },
    {
      title: 'Certificate Services (AD CS) - Overview',
      content: `**Active Directory Certificate Services (AD CS)** - internal PKI for SMB infrastructure certificates.

**Application:**
- 802.1X Wi‑Fi (EAP-TLS)
- VPN (SSTP, IKEv2 with cert)
- IIS HTTPS intranet
- Code signing of internal applications
- S/MIME mail

**CA Hierarchy:**

| Level | Role | SMB |
|---------|------|-----|
| **Root CA** | Root of Trust | Offline, 4096-bit, 10 years |
| **Issuing CA** | Issues certificates | Online on Server Core |
| **Policy/Enrollment** | Web enrollment, auto-enroll GPO | On issuing CA |

**Auto-enrollment via GPO:**
Computer Configuration → Policies → Windows Settings → Security Settings → Public Key Policies → Certificate Services Client - Auto-Enrollment

**Certificate templates:**
- **Computer** - for servers and PCs (802.1X)
- **User** — for S/MIME
- **Web Server** — IIS
- Duplicate template → 2048-bit, SHA256, 1-year validity

**Safety:**
- Root CA - disabled, in the safe after subordinate release
- CRL/OCSP - required for revocation
- Audit of certificate issuance

> **SMB minimum:** one Issuing CA + GPO auto-enroll for domain computers → Wi‑Fi without password, only cert.`,
      code: {
        language: 'powershell',
        caption: 'Installing AD CS Enterprise CA',
        code: `Install-WindowsFeature AD-Certificate -IncludeManagementTools
Install-AdcsCertificationAuthority -CAType EnterpriseRootCA -CryptoProviderName "RSA#Microsoft Software Key Storage Provider" -KeyLength 2048 -HashAlgorithm SHA256 -ValidityPeriod Years -ValidityPeriodUnits 5

Get-CertificationAuthority | Select DisplayName, Status
certutil -ping
certutil -crl`,
      },
    },
    {
      title: 'Performance baseline - scripts and metrics',
      content: `**Baseline** - reference metrics for a “healthy” server. Without baseline it is impossible to understand what is “slow”.

**What to collect weekly:**

| Metric | Counter/team | Alarm threshold |
|---------|-------------------|---------------|
| CPU | \\\\Processor(_Total)\\\\% Processor Time | >80% sustained 15 min |
| RAM | Available MBytes | <500 MB free |
| Disk latency | \\\\PhysicalDisk(*)\\\\Avg. Disk sec/Read | >20 ms |
| Disk free | Get-Volume | <15% free |
| Network | \\\\Network Interface(*)\\\\Bytes Total/sec | baseline + 50% |
| Services | Get-Service Automatic Stopped | any stopped |
| Events | Errors System 24h | >10 errors |

**Tools:**
- **Performance Monitor (perfmon)** — Data Collector Sets
- **Get-Counter** — PowerShell
- **PAL (Performance Analysis of Logs)** - BLG analysis
- **Windows Admin Center** - built-in graphics

**Process:**
1. Collect baseline during a “quiet” period (night, weekend)
2. Save CSV/BLG to \\\\\\\\fileserver\\\\it\\\\baselines\\\\
3. Compare in case of incidents “slows down”
4. Update after a major change (new role, migration)

> “The server is slowing down” → compare the current Get-Counter with the baseline → disk queue length has increased → check the Veeam backup window.`,
    },
    {
      title: 'Hardening CIS Level 1 - complete checklist',
      content: `**CIS Microsoft Windows Server Benchmark Level 1** - basic hardening for production without a critical impact on business.

**Account Policies:**
- [ ] Minimum password length: 14+ (or FGPP for admins)
- [ ] Password history: 24
- [ ] Account lockout: 5 attempts, 15 min
- [ ] Guest account disabled

**Local Policies — Audit:**
- [ ] Audit logon events: Success + Failure
- [ ] Audit account logon events: Success + Failure
- [ ] Audit policy change: Success + Failure
- [ ] Audit privilege use: Success + Failure

**Security Options:**
- [ ] Network access: Do not allow anonymous enumeration of SAM
- [ ] Network security: LAN Manager authentication level — NTLMv2 only
- [ ] Interactive logon: Don't display last signed-in
- [ ] Shutdown: Clear virtual memory pagefile

**Windows Firewall:**
- [ ] Domain profile: block inbound default
- [ ] Explicit rules only for required ports per role
- [ ] Remote Desktop: restrict by IP scope

**Services:**
- [ ] Disable Print Spooler on non-print servers (PrintNightmare)
- [ ] Disable unnecessary roles/features
- [ ] Set non-critical services to Manual

**SMB:**
- [ ] SMB signing required (domain controllers)
- [ ] Disable SMBv1 (unless legacy 1C requires - isolate)
- [ ] Enable SMB encryption for sensitive shares

**RDP:**
- [ ] NLA required
- [ ] Encryption level: High
- [ ] Session timeout configured

**Defender / AV:**
- [ ] Real-time protection enabled
- [ ] Exclusions documented (Veeam, SQL)
- [ ] Signature update daily

**Application:**
- GPO for domain members
- LGPO or DSC for standalone
- CIS-CAT or Microsoft Security Compliance Toolkit for audit

> Level 2 - for high-security (admin blocking via RDP, Credential Guard everywhere). SMB Level 1 is usually sufficient.`,
    },
    {
      title: 'FAQ - frequently asked questions about Windows Server',
      content: `**Q1: Server Core or Desktop Experience for the first DC?**
A: Desktop Experience for training; for production, the second DC is Server Core + WAC.

**Q2: How much RAM does a Hyper-V host need for 4 VMs?**
A: 4 GB host + amount of RAM VM + 20% overhead. Example: 4+4+4+8+4 = 24 GB minimum, 32 GB is better.

**Q3: Is it possible without CAL if everything is via RDS?**
A: No. You need a Server license + Windows CAL + RDS CAL.

**Q4: How to update Server Core without GUI?**
A: \\\`sconfig\\\` → Install Updates, or \\\`Install-Module PSWindowsUpdate\\\`, or WSUS + \\\`wuauclt /detectnow\\\`.

**Q5: Hyper-V checkpoint on DC - is it possible?**
A: Not recommended for production DC. Use Veeam backup.

**Q6: Why is Windows Admin Center better than RDP?**
A: Role-based access, multiple servers, fewer RDP sessions, audit. Does not replace PS for automation.

**Q7: How to check if the server is activated?**
A: \\\`slmgr /xpr\\\` or \\\`Get-CimInstance SoftwareLicensingProduct | Where PartialProductKey\\\`.

**Q8: WSUS vs Windows Update directly?**
A: WSUS for monitoring and saving traffic (10+ servers/PCs). 1-2 servers - possible directly with a schedule.

**Q9: Do I need a separate DNS if there is a DC?**
A: No, AD-integrated DNS on DC is sufficient for SMB.

**Q10: How to safely reboot the server during business hours?**
A: Notify users, check the backup window, \\\`shutdown /r /t 300 /c "Reboot in 5 min"\\\`, monitor the service afterwards.`,
    },
    {
      title: 'Typical errors and solutions',
      content: `| Error | Reason | Solution |
|--------|---------|---------|
| "The trust relationship failed" | Secure channel is broken | \\\`Test-ComputerSecureChannel -Repair\\\` or rejoin |
| WinRM "Access is denied" | CredSSP, firewall, not admin | Enable-PSRemoting, TrustedHosts, correct account |
| "No login servers available" | DC/DNS unavailable | Check IP DNS client, ping DC, Netlogon service |
| Disk 0 bytes free on C: | WSUS, logs, pagefile | Disk Cleanup, move WSUS content, expand VHD |
| Service won't start 7000/7009 | Dependency failed | \\\`Get-Service -Name X -DependentServices\\\`, Event Viewer |
| Hyper-V VM «no network» | Wrong vSwitch | Verify External vSwitch, VM network adapter connected |
| RDS «No licenses available» | License server down/expired | RD Licensing Manager, reinstall CALs |
| Time skew Kerberos error | NTP misconfigured | w32tm /resync, PDC emulator = reliable time source |
| «Access denied» on share | NTFS vs Share mismatch | Effective permissions, AGDLP groups |
| Windows Update stuck | Corrupted cache | Stop wuauserv, clear SoftwareDistribution |
| Server Core no sconfig | Corrupted install | Reinstall or run sconfig from full path |
| Certificate auto-enroll failed | Template permissions | Cert template → Security → Enroll for Domain Computers |`,
    },
    {
      title: 'Administrator\'s day scenarios',
      content: `**Scenario 1 - “Monday Morning, WSUS”**

08:30 — 15 servers pending reboot after weekend patches. You check Veeam: the backup window ended at 06:00. Are you planning a reboot cascade: WSUS → file server → RDS (I warned the accounting department). You use \\\`Get-WindowsUpdateLog\\\` on the problematic SRV-APP01 - KB failed 3 times. Manually: \\\`Install-WindowsUpdate -AcceptAll -AutoReboot\\\`. By 10:00 all servers are patched, inventory CSV is updated.

**Scenario 2 - “File server is full”**

11:00 — alert: D: 95% full. FSRM report: user petrov.i – 80 GB video files in \\\\\\\\Public. Screening is not set to Public - add block *.mp4. Quota soft on petrov.i - email to the user. Shadow Copies - the place was eaten by snapshots, reduce allocation from 20% to 10%. Robocopy archive of old files on cold storage. By 14:00 - 70% free.

**Scenario 3 - “New server in production”**

We hired DevOps - we need SRV-DEV01. Checklist: static IP, join domain, CIS GPO applied, WinRM enabled, WAC added, Veeam job created, firewall rules documented, inventory row added, backup test restore file. Antivirus exclusions for build artifacts. Change ticket closed. Total: 3 hours following production checklist.`,
    },
    {
      title: 'Checklist for production',
      content: `**Before introducing the server into production:**

**Identity and Network**
- [ ] Hostname according to standard (SRV-ROLE##)
- [ ] Static IP, DNS, gateway documented
- [ ] Reverse DNS record created
- [ ] VLAN/firewall rules applied

**OS and security**
- [ ] Server Core (or GUI based)
- [ ] All critical patches installed
- [ ] Activated (KMS/MAK)
- [ ] Time sync to domain hierarchy
- [ ] CIS Level 1 applied
- [ ] Local admin password in LAPS/vault
- [ ] RDP restricted, NLA enabled
- [ ] Defender configured with documented exclusions

**Roles and Services**
- [ ] Minimum roles installed
- [ ] Automatic services verified running
- [ ] Application-specific config documented

**Backup and DR**
- [ ] Veeam/WSB job created and tested
- [ ] Restore test performed (file or system state)
- [ ] RPO/RTO documented for this server

**Monitoring**
- [ ] Event log forwarding (WEF) or SIEM
- [ ] Performance baseline captured
- [ ] Alert on disk <15%, service stopped

**Documentation**
- [ ] CMDB/inventory updated
- [ ] Runbook for common tasks
- [ ] Change ticket approved
- [ ] On-call knows about new server

**Quarterly:**
- [ ] Patch compliance review
- [ ] Access review (local admins)
- [ ] Backup restore test
- [ ] Certificate expiry check`,
    },
    {
      title: 'Preparation for AZ-800/801 certification',
      content: `**Windows Server Hybrid Administrator (AZ-800 + AZ-801)** - mapping the topics for this chapter.

| AZ-800 Exam | Chapter Topics |
|----------------|--------------|
| Deploy and manage AD DS | Server roles, initial setup |
| Manage Windows Server | Server Core, sconfig, WAC |
| Manage Hyper-V | Hyper-V partition, checkpoints vs backup |
| Implement IP Address Management | Static IP, DHCP role overview |
| Implement Windows Server file services | File Server, FSRM, DFS, Print |
| Implement Network Load Balancing | NLB section |
| Implement Remote Desktop Services | RDS deployment |
| Implement WSUS | WSUS section |
| Monitor Windows Server | Event Viewer, performance baseline |
| Secure Windows Server | Hardening, CIS, firewall |

| Exam AZ-801 | Chapter Topics |
|----------------|--------------|
| Secure Windows Server | CIS checklist, Tier model |
| Implement PKI | AD CS overview |
| Implement AD CS | Certificate Services |
| Manage Windows Server updates | WSUS, Windows Update |
| Implement disaster recovery | Backup integration, Hyper-V recovery |
| Monitor and troubleshoot | Troubleshooting, Event IDs |
| Implement IPAM | DNS on DC (cross-ref AD chapter) |

**Recommended preparation order:**
1. Lab: 2 VM Server 2022 + 1 client
2. Complete all practice tasks in this chapter
3. Microsoft Learn path: «Prepare for AZ-800»
4. MeasureUp/Whizlabs practice exams

> AZ-801 focus on security, DR, monitoring - overlap with backups and AD chapters.`,
    },
    {
      title: 'Interview Questions',
      content: `**1. What is the difference between Server Core and Nano Server?**
Server Core is a complete minimal installation for roles. Nano Server (2016) deprecated for infra roles - replaced with Server Core / containers.

**2. How does per-core licensing work?**
All physical cores are licensed, minimum 16 cores per server. Standard allows 2 OSE (VM), Datacenter unlimited.

**3. What is WinRM and how is it different from RDP?**
WinRM - remoting for PowerShell/CIM, port 5985/5986. RDP - graphical desktop, port 3389. Admin automation → WinRM.

**4. Why WSUS if you have Intune?**
WSUS - on-prem control for servers and legacy. Intune - cloud MDM for endpoints. Hybrid: WSUS servers, Intune clients.

**5. How to diagnose a “slow” file server?**
Get-Counter disk latency, check SMB sessions, antivirus scan schedule, backup job overlap, network duplex mismatch.

**6. Hyper-V Dynamic Memory - risks?**
Memory ballooning can starve guest. Do not use on DC, SQL. OK for dev/test.

**7. What to check if the service does not start?**
Dependencies, service account password, Event 7000/7009, permissions, port conflict, corrupted config.

**8. RDS vs VPN for remote access?**
RDS - centralized apps, licensing overhead. VPN - full network access, easier for “work like in the office.” Often both.

**9. Why SMB signing?**
Protection against relay attacks (NTLM). A must on DC. Performance impact minimal on modern hardware.

**10. How to securely decommission a server?**
Migrate roles/data, remove from Veeam, disable AD computer, remove DNS records, wipe disks, update CMDB, physical disposal cert.`,
    },
  ],
  practice: [
    'Deploy Windows Server 2022 in Hyper-V (evaluation ISO). Select Server Core, manage via sconfig and PowerShell',
    'Set up a static IP, rename the server, synchronize time, install all updates',
    'Via PowerShell: list services, restart Spooler, check free disk space',
    'Install the AD-Domain-Services role (don’t skip it yet - just install the role). Check Get-WindowsFeature',
    'Set up WinRM and connect to the server via Enter-PSSession from another VM',
    'Windows Firewall settings: allow RDP only from the 192.168.10.0/24 subnet',
    'Create a task in Task Scheduler: daily PowerShell script for recording uptime and free space to a file',
    'Explore Event Viewer: find 5 errors in the last 24 hours in System and Security. Explain each one',
    'Install Windows Admin Center, add a server, check the CPU/RAM/Disk dashboard',
    'Make a table of licenses: server (edition, cores), CAL (User/Device), RDS CAL - for a hypothetical office of 30 people',
    'Document inventory: hostname, IP, roles, OS version, RAM, backup schedule - template for 3 servers',
    'Simulate a problem: stop the DNS service, observe symptoms on the client, restore, document the Event ID',
    'Complete the Server Core lab (15 steps): WinRM, FS-FileServer, share, baseline CSV',
    'FSRM settings: soft quota 2 GB per test share, file screen block *.exe. Check operation',
    'Collect performance baseline via Get-Counter, save CSV. Compare after artificial load (CPU stress)',
  ],
  resources: [
    { title: 'Microsoft Learn — Windows Server', url: 'https://learn.microsoft.com/en-us/windows-server/' },
    { title: 'Windows Server 2022 evaluation', url: 'https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2022' },
    { title: 'Windows Admin Center', url: 'https://learn.microsoft.com/en-us/windows-server/manage/windows-admin-center/overview' },
    { title: 'Windows Server licensing', url: 'https://learn.microsoft.com/en-us/windows-server/get-started/windows-server-licensing' },
    { title: 'Hyper-V on Windows Server', url: 'https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-on-windows-server' },
    { title: 'CIS Windows Server Benchmark', url: 'https://www.cisecurity.org/benchmark/microsoft_windows_server' },
    { title: 'AZ-800 Exam Skills Outline', url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-800/' },
    { title: 'Remote Desktop Services documentation', url: 'https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/welcome-to-rds' },
  ],
  quiz: [
    {
      question: 'What tool is the Windows Server Role Management Central Console?',
      options: ['Server Manager', 'Device Manager', 'Task Scheduler', 'Regedit'],
      answer: 'Server Manager',
    },
    {
      question: 'Why shouldn\'t Domain Controller get IP via DHCP?',
      options: ['A stable address is critical for DNS and AD', 'DHCP is disabled by Microsoft', 'This is a recommendation for Wi‑Fi only'],
      answer: 'A stable address is critical for DNS and AD',
    },
    {
      question: 'Which edition of Windows Server is right for a typical multi-VM office?',
      options: ['Standard', 'Datacenter', 'Home', 'Embedded'],
      answer: 'Standard',
    },
    {
      question: 'What are Windows services managed from the command line?',
      answer: 'Get-Service, Start-Service, Stop-Service, Restart-Service (PowerShell) or sc.exe',
    },
    {
      question: 'Why shouldn\'t RDP be opened directly to the Internet?',
      options: ['High risk of brute-force and exploits', 'RDP doesn\'t work over NAT', 'Only UDP required'],
      answer: 'High risk of brute-force and exploits',
    },
    {
      question: 'Hyper-V on Windows Server is used for:',
      options: ['Server and lab virtualization', 'Docker containers only', 'File server only'],
      answer: 'Server and lab virtualization',
    },
  ],
}

export default translation
