import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Active Directory - The Complete Guide',
  duration: '12–16 hours',
  description:
    'AD DS deep dive: forest and domain design, FSMO, replication, trusts, DNS, sites, FGPP, LAPS, Recycle Bin, troubleshooting and PowerShell cookbook',
  sections: [
    {
      title: 'What is Active Directory',
      content: `**Active Directory Domain Services (AD DS)** is a Microsoft directory service. Centralizes everything related to identification in the Windows office.

**What does AD give:**
- **Authentication** — login/password, Kerberos tickets
- **Authorization** - groups, rights to files, printers, applications
- **Policies** - GPO for users and computers
- **DNS** — integrated domain zone, SRV records
- **Centralized management** - one directory instead of local accounts

**Without AD in the office:**
- Local accounts on each PC
- Chaos with passwords, no single SSO
- Cannot centralize policies
- Offboarding = physically bypassing each PC

**From AD:**
- One login \\\`ivan.petrov@company.local\\\` - access to files, mail, VPN, Wi‑Fi (802.1X)
- Account blocking = instant access revoked everywhere
- GPO = uniform settings on all PCs

> AD is **not just a user base**. This is the foundation of the entire Windows office infrastructure. Loss of AD = business stoppage.`,
    },
    {
      title: 'Forest and Domain Design',
      content: `**Forest**—the top level of security and schema replication. One forest = general scheme, transitive trust within.

**Domain**—administration and replication boundary. All DCs in a domain replicate **all** data in the domain.

**Design rules for SMB:**

| Solution | SMB Recommendation |
|---------|-----------------|
| Number of forests | **1 forest** - always, if there is no M&A |
| Number of domains | **1 domain** - for an office of up to 500 people |
| Domain name | \\\`company.local\\\` or \\\`corp.company.ru\\\` |
| NetBIOS | \\\`COMPANY\\\` (short, ≤15 characters) |
| Functional Level | Maximum supported (Win2016+) |

**Why one domain:**
- Easy administration
- No cross-domain replication
- One set of GPOs
- Sufficient for 99% SMB

**When there are multiple domains:**
- Company acquisition (M&A) - separate domain in the same forest
- Regulatory requirements (banks, public sector)
- Geographically separated business units with different administrators

**Domain name is an irreversible decision:**
- \\\`.local\\\` - mDNS conflict with Apple Bonjour (resolved)
- Public name (\\\`company.ru\\\`) - do not create an AD domain with a public name if it is not yours
- Recommendation: \\\`corp.company.ru\\\` or \\\`ad.company.local\\\`

**Real case:** office of 60 people, one domain \\\`company.local\\\`, two DCs, one OU structure. Works for 10+ years without changes.`,
    },
    {
      title: 'OU structure and delegation',
      content: `**OU (Organizational Unit)** is a container for organizing objects, delegating rights and linking GPOs.

**Typical SMB structure (30–100 people):**
\\\`\\\`\\\`
company.local
├── OU=_Admin (servers, DC - without user GPOs)
│   ├── OU=DomainControllers
│   └── OU=MemberServers
├── OU=Users
│   ├── OU=Sales
│   ├── OU=IT
│   ├── OU=HR
│   ├── OU=Management
│ └── OU=Disabled (fired, 30-day quarantine)
├── OU=Computers
│   ├── OU=Workstations
│   ├── OU=Laptops
│   └── OU=Kiosks
├── OU=Groups (all security groups)
└── OU=ServiceAccounts
\\\`\\\`\\\`

**Rules:**
- **Do not** put users in default containers (CN=Users) - you cannot bind GPO
- **Don’t** put computers in CN=Computers - same
- Prefix \\\`_\\\` for admin OUs - sorting at the top
- Separate OU=Disabled for offboarding

**Delegation:**
- Helpdesk: password reset, unlock - on OU=Users (without Domain Admin!)
- Sales manager: adding to G_Sales - at OU=Sales
- GPO editing: IT L2 - to specific GPOs via GPMC Delegation

> **AGDLP:** Account → Global group → Domain Local group → Permission. Never assign rights directly to a user.`,
    },
    {
      title: 'Create a domain and promote DC',
      content: `**First DC in the new forest - step by step:**

1. Windows Server installed, static IP
2. Hostname set (SRV-DC01)
3. DNS points to itself (127.0.0.1)
4. Time is synchronized
5. Install-WindowsFeature AD-Domain-Services
6. Install-ADDSForest (or wizard in Server Manager)
7. Reboot
8. Check: dcdiag, Get-ADDomain

**DSRM (Directory Services Restore Mode) password:**
- Separate password, **not** domain admin
- Needed to restore AD in safe mode
- Write it down in the password vault!

**Functional Levels:**
- Forest Functional Level - capabilities of the entire forest
- Domain Functional Level - domain capabilities
- Set the maximum supported by the **oldest** DC/OS in the domain`,
      code: {
        language: 'powershell',
        caption: 'Create a new forest and domain',
        code: `Import-Module ADDSDeployment
$safeModePwd = ConvertTo-SecureString "DSRM-P@ssw0rd!" -AsPlainText -Force
Install-ADDSForest -DomainName "company.local" -DomainNetbiosName "COMPANY" -InstallDns:$true -ForestMode "WinThreshold" -DomainMode "WinThreshold" -SafeModeAdministratorPassword $safeModePwd

# После перезагрузки:
Get-ADDomain | Select DNSRoot, DomainMode, PDCEmulator
Get-ADForest | Select Name, ForestMode, DomainNamingMaster
dcdiag /v`,
      },
    },
    {
      title: 'Users, groups and AGDLP',
      content: `**AD object types:**

| Object | Destination | Example |
|--------|------------|--------|
| **User** | Employee | ivan.petrov |
| **Group** | Security / Distribution | G_Sales, DL_Share_Sales_R |
| **Computer** | PC or server in a domain | WS-IVAN01 |
| **Contact** | External person without account | partner@external.com |
| **Service Account** | Account for service/application | svc_backup |

**Groups - scope (area):**

| Scope | Members | Usage |
|-------|-------|--------------|
| **Domain Local** | Any from the forest | Rights to resources in the domain |
| **Global** | Only from your domain | User grouping |
| **Universal** | Any from the forest | Multi-domain forests |

**AGDLP pattern (Account → Global → Domain Local → Permission):**
\\\`\\\`\\\`
ivan.petrov → G_Sales → DL_Share_Sales_RW → NTFS Modify to \\\\\\\\fileserver\\\\sales
\\\`\\\`\\\`

**User attributes:**
- \\\`sAMAccountName\\\` — login (ivan.petrov)
- \\\`UserPrincipalName\\\` — email-style (ivan.petrov@company.local)
- \\\`displayName\\\` - display name
- \\\`memberOf\\\` - groups (do not set manually - Add-ADGroupMember)`,
    },
    {
      title: 'FSMO roles - deep dive',
      content: `**FSMO (Flexible Single Master Operations)** - 5 roles that can only change on one DC at a time.

| # | Role | Scope | Destination | What will break without her |
|---|------|-------|------------|----------------------|
| 1 | **Schema Master** | Forest | AD schema changes (new attributes, classes) | Cannot extend schema (Exchange, LAPS) |
| 2 | **Domain Naming Master** | Forest | Creating/deleting domains in the forest | Can't add domain |
| 3 | **RID Master** | Domain | Issuing RID blocks (Relative IDs) | Cannot create new objects |
| 4 | **PDC Emulator** | Domain | Time, GPO, passwords, legacy NT4 | Time desync, GPO |
| 5 | **Infrastructure Master** | Domain | Updating cross-domain links | "Phantom" objects in GC |

**Where to place in SMB (2 DC):**

| Role | DC01 | DC02 |
|------|------|------|
| Schema Master | ✓ | |
| Domain Naming Master | ✓ | |
| RID Master | ✓ | |
| PDC Emulator | ✓ | |
| Infrastructure Master | ✓ | |

With 2 DC - all roles are on DC01 (normal for SMB). When adding DC03, it can be distributed.

**PDC Emulator - special:**
- Clients synchronize time with PDC Emulator
- PDC Emulator synchronizes with external NTP
- When changing the password - immediate replication to the PDC
- Legacy NT4 BDC synchronized with PDC

**Transfer of roles (seize - only if DC is lost!):**
\\\`Move-ADDirectoryServerOperationMasterRole\\\` — standard transmission
\\\`Move-ADDirectoryServerOperationMasterRole -Seize\\\` - forced capture (DC dead)`,
      code: {
        language: 'powershell',
        caption: 'View and transfer FSMO roles',
        code: `Get-ADForest | Select SchemaMaster, DomainNamingMaster
Get-ADDomain | Select PDCEmulator, RIDMaster, InfrastructureMaster

# Штатная передача всех ролей на DC02
Move-ADDirectoryServerOperationMasterRole -Identity "SRV-DC02" -OperationMasterRole SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster

# Проверка
Get-ADDomain | Select PDCEmulator, RIDMaster, InfrastructureMaster`,
      },
    },
    {
      title: 'Replication and topology',
      content: `**Multi-master replication:** any DC accepts changes and replicates to others. Conflicts are resolved by timestamp (the last one to write wins).

**Replication types:**

| Type | Description |
|-----|----------|
| **Intra-site** | Inside the site - according to schedule (15 sec) |
| **Inter-site** | Between sites - according to schedule (15 min - 3 hours) |
| **Inbound/Outbound** | Replication flow direction |

**Connection Objects:** KCC (Knowledge Consistency Checker) automatically creates a replication topology. Don't manually edit for no reason.

**Replication monitoring:**

| Team | What shows |
|---------|---------------|
| \\\`repadmin /replsummary\\\` | Summary: Latest Replication, Errors |
| \\\`repadmin /showrepl\\\` | Details for each partner |
| \\\`repadmin /syncall\\\` | Forced synchronization |
| \\\`dcdiag /v\\\` | Full DC Diagnostics |

**Typical replication errors:**

| Error | Reason | Solution |
|--------|---------|---------|
| 1722 RPC failed | Firewall, DC unavailable | Check ports, ping |
| 8614 (USN rollback) | Restoring DC from an old backup | Demote + promote or authoritative restore |
| 1311 (stale servers) | DC has been offline for a long time | Remove metadata (ntdsutil) |
| Lingering objects | Object deleted on one DC, not on another | repadmin /removelingeringobjects |

> **Rule:** if DC is offline > 60 days (tombstone lifetime) - do not turn it back on. Demote and re-promote.`,
    },
    {
      title: 'Sites, Subnets and Planning',
      content: `**AD Sites** is a logical representation of a physical network. Affects replication, authentication, GPO.

**Why sites in SMB:**
- Even with one office - create a default site
- At the second office - site per location, inter-site replication
- Clients are authenticated on the nearest DC (site-aware)

**Components:**
- **Site** — a group of subnets with good connectivity
- **Subnet** — binding the IP subnet to the site
- **Site Link** — connection between sites, determines the replication schedule
- **Site Link Bridge** — transitivity between links

**Typical SMB configuration (single office):**
\\\`\\\`\\\`
Site: Default-First-Site-Name
  Subnet: 192.168.10.0/24
  DC: SRV-DC01, SRV-DC02
\\\`\\\`\\\`

**Two offices:**
\\\`\\\`\\\`
Site: HQ-Moscow
  Subnet: 192.168.10.0/24
  DC: SRV-DC01, SRV-DC02
Site: Branch-SPb
  Subnet: 192.168.20.0/24
  DC: SRV-DC03
Site-Link: HQ-Moscow <-> Branch-SPb (cost 100, replicate every 15 min)
\\\`\\\`\\\`

**Without the correct subnets:** the client at the branch can authenticate to the DC at the head office via WAN → slow login.`,
      code: {
        language: 'powershell',
        caption: 'Creating sites and subnets',
        code: `New-ADReplicationSite -Name "HQ-Moscow"
New-ADReplicationSubnet -Name "192.168.10.0/24" -Site "HQ-Moscow"
New-ADReplicationSite -Name "Branch-SPb"
New-ADReplicationSubnet -Name "192.168.20.0/24" -Site "Branch-SPb"
New-ADReplicationSiteLink -Name "HQ-Branch" -SitesIncluded "HQ-Moscow","Branch-SPb" -ReplicationFrequencyInMinutes 15 -Cost 100

Get-ADReplicationSite | Select Name
Get-ADReplicationSubnet -Filter * | Select Name, Site`,
      },
    },
    {
      title: 'Trusts',
      content: `**Trust** is a mechanism for accessing resources between domains/forests.

**Trusts types:**

| Type | Description | When |
|-----|----------|-------|
| **Parent-Child** | Automatically when creating a child domain | Multi-domain forest |
| **Tree-Root** | Between the trees in the forest | Multi-domain forest |
| **External** | Between domains of different forests | Partner, takeover |
| **Forest** | Complete trust between forests | M&A, federation |
| **Shortcut** | Authentication Optimization | Many domains in the forest |

**Direction:**
- **One-way** — A trusts B (users B → resources A)
- **Two-way** - mutual access

**Transitivity:**
- **Transitive** - trust spreads (within the forest)
- **Non-transitive** - only direct (external trust)

**For SMB (single domain):** trusts are not needed. Know the theory in case of M&A or integration with a partner.

**Selective Authentication:** on external/forest trust - explicitly allow access to specific resources (safer).`,
      code: {
        language: 'powershell',
        caption: 'Viewing and creating trusts',
        code: `Get-ADTrust -Filter *
nltest /domain_trusts

# External trust (пример — lab only)
# New-ADTrust -Name "partner.local" -Type External -Direction Bidirectional -Target "partner.local"`,
      },
    },
    {
      title: 'DNS in Active Directory',
      content: `**AD-integrated DNS** - zone \\\`company.local\\\` is stored in AD (replicated along with the directory). No need for a separate DNS backup.

**Zone types:**
- **Primary (AD-integrated)** - primary, replicated
- **Secondary** — copy from master (legacy, not recommended)
- **Stub** - only NS and glue records
- **Forward Lookup Zone** - name → IP
- **Reverse Lookup Zone** - IP → name (for diagnostics)

**Critical AD SRV records:**
- \\\`_ldap._tcp.company.local\\\` — domain locator
- \\\`_kerberos._tcp.company.local\\\` — Kerberos
- \\\`_gc._tcp.company.local\\\` — Global Catalog

**Forwarders:**
- DC DNS → forwarders (8.8.8.8, provider) for external names
- **Don't** install forwarders on client DNS - only on DC

**DNS problems in AD:**

| Symptom | Reason | Solution |
|---------|---------|---------|
| “There is a domain, but there is no Internet” | No forwarders | Add forwarders to DNS DC |
| “I can’t join the domain” | The client is not using DC DNS | Client DNS → IP DC |
| "Slow login" | No SRV records | \\\`dcdiag /test:dns\\\`, netdiag |
| Duplicate entries | Old entries after renaming | DNS scavenging, cleaning |

**Dynamic Updates:** AD DNS accepts dynamic registrations from clients (Secure only).`,
    },
    {
      title: 'Password Policies and Fine-Grained Password Policy',
      content: `**Default Domain Policy**—one password policy for the entire domain. For SMB it is often sufficient.

| Parameter | SMB Recommendation | NIST SP 800-63B |
|----------|-----------------|-----------------|
| Minimum length | 12+ characters | 8+ (longer = better) |
| Complexity | Enabled | Not required for length 15+ |
| Maximum age | 90 days or never | Don't change without reason |
| Lockout threshold | 5 attempts | 5–10 |
| Lockout duration | 30 min | 15–30 min |

**Fine-Grained Password Policy (FGPP):**
- Different policies for different groups
- Applies to **group**, not OU
- Example: admins - 16 characters, 3 attempts; users - 12 characters, 5 attempts

**Modern Approach (2024+):**
- Long passwords (12–16+) instead of complex short ones
- MFA instead of frequent password changes
- Passwordless (Windows Hello, FIDO2) - if the infrastructure allows
- Prohibit common passwords (Azure AD Password Protection, or custom list)

> **Don't** relax your password policy "for convenience." One hacked account = access to the entire domain.`,
      code: {
        language: 'powershell',
        caption: 'Fine-Grained Password Policy',
        code: `New-ADFineGrainedPasswordPolicy -Name "Admin-Password-Policy" -Precedence 10 -MinPasswordLength 16 -PasswordHistoryCount 24 -ComplexityEnabled $true -LockoutThreshold 3 -LockoutDuration "00:30:00" -LockoutObservationWindow "00:30:00" -MaxPasswordAge "60.00:00:00"

New-ADGroup -Name "PasswordPolicy-Admins" -GroupScope Global -Path "OU=Groups,DC=company,DC=local"
Add-ADFineGrainedPasswordPolicySubject -Identity "Admin-Password-Policy" -Subjects "PasswordPolicy-Admins"

Get-ADFineGrainedPasswordPolicy -Filter * | Select Name, MinPasswordLength, LockoutThreshold, AppliesTo`,
      },
    },
    {
      title: 'LAPS - local password management',
      content: `**LAPS (Local Administrator Password Solution)** - automatic rotation of the local Administrator password on each PC.

**Why:**
- One local admin password on all PCs = lateral movement attack
- LAPS: unique password on each PC, stored in AD
- Only authorized admins can read the password

**LAPS (legacy) vs Windows LAPS (2023+):**
- Legacy LAPS: separate MSI, attribute \\\`ms-Mcs-AdmPwd\\\`
- Windows LAPS: built into Windows 11 22H2+ / Server 2022 April Update+, attribute \\\`msLAPS-Password\\\`

**Settings (Windows LAPS):**
1. GPO: Enable Windows LAPS
2. Password Settings: length, age, complexity
3. AD permissions: who can read the password
4. Client: automatically on supported OS

**Real scenario:** helpdesk receives the local admin password of a specific PC via PowerShell → solves the problem → password is automatically rotated according to a schedule.`,
      code: {
        language: 'powershell',
        caption: 'Read LAPS password (Windows LAPS)',
        code: `Get-LapsADPassword -Identity "WS-IVAN01" -AsPlainText
# Требует прав на чтение msLAPS-Password атрибута

# Legacy LAPS:
# Get-ADComputer WS-IVAN01 -Properties ms-Mcs-AdmPwd | Select ms-Mcs-AdmPwd

# Массовая проверка: у каких ПК нет LAPS пароля
Get-ADComputer -Filter * -SearchBase "OU=Workstations,OU=Computers,DC=company,DC=local" -Properties msLAPS-Password | Where {-not $_.'msLAPS-Password'} | Select Name`,
      },
    },
    {
      title: 'AD Recycle Bin and Object Recovery',
      content: `**AD Recycle Bin** - “recycle bin” for deleted AD objects. Enable **until** first deletion!

**Without Recycle Bin:**
- Deleted object → tombstone (60–180 days) → complete deletion
- Authoritative restore from backup is the only way

**With Recycle Bin:**
- Deleted object → deleted objects container (saves all attributes)
- Recovery with one command
- Duration: \\\`msDS-deletedObjectLifetime\\\` (default = tombstone lifetime)

**Activation (irreversible!):**
\\\`Enable-ADOptionalFeature 'Recycle Bin Feature' -Scope ForestOrConfigurationSet -Target company.local\\\`

**Recovery:**
\\\`Get-ADObject -Filter 'isDeleted -eq $true' -IncludeDeletedObjects\\\`
\\\`Restore-ADObject -Identity "CN=Ivan Petrov,OU=Disabled,...\\\`

**Real case:** admin accidentally deleted OU=Sales with 15 users. With Recycle Bin - recovery in 5 minutes. Without - authoritative restore of the entire DC, downtime 2–4 hours.`,
      code: {
        language: 'powershell',
        caption: 'AD Recycle Bin - enable and restore',
        code: `Enable-ADOptionalFeature 'Recycle Bin Feature' -Scope ForestOrConfigurationSet -Target (Get-ADForest).Name

Get-ADObject -Filter 'isDeleted -eq $true' -IncludeDeletedObjects -Properties * | Select Name, ObjectClass, Deleted, LastKnownParent

# Восстановление удалённого пользователя
Restore-ADObject -Identity "<GUID из Deleted Objects>"

# Восстановление всей OU (содержимое тоже в deleted objects)
Get-ADObject -Filter 'isDeleted -eq $true -and ObjectClass -eq "organizationalUnit"' -IncludeDeletedObjects | Restore-ADObject`,
      },
    },
    {
      title: 'Joining computers to a domain',
      content: `**Join domain - requirements:**
- Client DNS → IP DC (required!)
- Time synchronized (Kerberos ±5 min)
- Network to DC: ports 88, 135, 389, 445, 636, 3268, 3269, 53, 464
- An account with the right “Join computer to domain” (by default - Authenticated Users, 10 joins)

**Join methods:**
1. GUI: Settings → System → About → Join domain
2. PowerShell: \\\`Add-Computer -DomainName company.local\\\`
3. GPO + SCCM/Intune (automatic join during deployment)
4. OOBE (Out of Box Experience) - when setting up your PC for the first time

**Trust relationship failed problem:**
- Secure channel failure between PC and DC
- Reasons: haven’t been online for a long time, cloned image, changed DC password

**Solutions:**
1. \\\`Test-ComputerSecureChannel -Repair -Credential (Get-Credential)\\\`
2. \\\`Reset-ComputerMachinePassword\\\` (PowerShell from local admin)
3. Reconnect to the domain (leave + join)
4. As a last resort, recreate the computer object in AD`,
      code: {
        language: 'powershell',
        caption: 'Join and repair secure channel',
        code: `Add-Computer -DomainName "company.local" -OUPath "OU=Workstations,OU=Computers,DC=company,DC=local" -Credential (Get-Credential) -Restart

# Repair trust relationship (на проблемном ПК):
Test-ComputerSecureChannel -Verbose
Test-ComputerSecureChannel -Repair -Credential (Get-Credential)

# Перемещение компьютера в правильную OU после join
Get-ADComputer WS-IVAN01 | Move-ADObject -TargetPath "OU=Workstations,OU=Computers,DC=company,DC=local"`,
      },
    },
    {
      title: 'Second DC and fault tolerance',
      content: `**One DC = single point of failure.** Minimum 2 DC for any production.

**Adding a second DC:**
1. Install Windows Server on the second VM/server
2. Static IP (different, on the same subnet)
3. DNS → first DC (until it becomes a DC itself)
4. Join the domain (becomes a member server)
5. Install-ADDSDomainController

**What we get:**
- AD, DNS, GC replication
- Authentication when DC01 crashes
- FSMO distribution (optional)

**Global Catalog (GC):**
- By default on each DC
- Needed for authentication in multi-domain forests
- In single-domain SMB - GC on all DCs

**RODC (Read-Only DC):**
- For branches without a secure server room
- Read only, account cache by policy
- SMB with one office - not needed`,
      code: {
        language: 'powershell',
        caption: 'Adding a Second DC',
        code: `Import-Module ADDSDeployment
Install-ADDSDomainController -DomainName "company.local" -InstallDns:$true -Credential (Get-Credential) -SafeModeAdministratorPassword (ConvertTo-SecureString "DSRM-P@ss!" -AsPlainText -Force)

# После перезагрузки:
Get-ADDomainController -Filter * | Select Name, Site, IsGlobalCatalog, OperationMasterRoles
dcdiag /s:SRV-DC01 /s:SRV-DC02 /v`,
      },
    },
    {
      title: 'Typical AD and troubleshooting errors',
      content: `**AD diagnostic checklist:**

| # | Check | Team |
|---|----------|---------|
| 1 | Is DC healthy? | \\\`dcdiag /v\\\` |
| 2 | Replication OK? | \\\`repadmin /replsummary\\\` |
| 3 | Is DNS working? | \\\`dcdiag /test:dns\\\` |
| 4 | Is time synchronized? | \\\`w32tm /query /status\\\` |
| 5 | Is FSMO in place? | \\\`Get-ADDomain\\\`, \\\`Get-ADForest\\\` |
| 6 | Are services running? | NTDS, DNS, Netlogon, KDC, W32Time |

**Common mistakes:**

| Error | Symptom | Solution |
|--------|---------|---------|
| USN rollback | Event 2103, replication stopped | Demote DC, re-promote |
| Lingering objects | Event 1388, 1988 | repadmin /removelingeringobjects |
| DNS stale records | Slow login, “no domain” | Scavenging, cleaning |
| Time skew | Kerberos pre-auth failed | NTP to PDC → external |
| RID pool exhausted | Cannot create objects | Check RID Master, seize if necessary |
| Tombstone lifetime | DC offline >180 days | Don't turn it on! Demote + promote |

**Tools:**
- **dcdiag** - comprehensive diagnostics
- **repadmin** - replication
- **netdom** — trust, secure channel
- **ntdsutil** — metadata cleanup, authoritative restore
- **Event Viewer** → Directory Service log`,
    },
    {
      title: 'PowerShell AD module — cookbook',
      content: `**Directory of commands for the daily work of an AD administrator.**

All commands require \\\`Import-Module ActiveDirectory\\\` (RSAT or on DC).

**Categories:**
- Users: New/Get/Set/Disable/Enable/Remove-ADUser
- Groups: New/Get/Add/Remove-ADGroupMember
- Computers: New/Get/Add-Computer
- OU: New/Get/Move-ADObject
- GPO: Get-GPO, Get-GPInheritance (GroupPolicy module)
- Replication: Get-ADReplicationPartnerMetadata
- Search: Get-ADObject, Search-ADAccount

> Save this cookbook in your runbook. 80% of daily tasks are these commands.`,
    },
    {
      title: 'AD Security - Tiered Administration',
      content: `**Tiered Administration Model** - division of privileges into levels.

| Tier | What we protect | Who has access | Where do they log in |
|------|-------------|-----------------|-----------------|
| **Tier 0** | AD, DC, PKI | Domain Admins (minimum!) | PAW only |
| **Tier 1** | Servers | Server Admins | Admin workstation |
| **Tier 2** | Workstations | Helpdesk | Regular PC |

**Protected Users group:**
- Protection against credential caching, NTLM, DES
- Add all Tier 0 admins
- Kerberos only (no NTLM fallback)

**gMSA (Group Managed Service Accounts):**
- Service accounts without password (AD manages)
- For SQL, IIS, backup services

**Audit Policy:**
- Logon events (4624, 4625)
- Account management (4720–4756)
- Directory Service Access
- Centralize in SIEM or WEF

**Real case:** admin logs in Domain Admin on workstation → malware steals hash → lateral movement on DC. Solution: PAW + Tier 0 only on DC.`,
    },
    {
      title: 'Multi-site AD - Design and Replication',
      content: `**AD Sites** - logical grouping of subnets to optimize replication and authentication.

**When several sites are needed:**
- Branches with DC over WAN
- Different subnets in the same building (VLAN)
- RODC in remote locations
- Replication traffic control

**Site topology components:**

| Object | Destination | Example |
|--------|------------|--------|
| **Site** | Subnet Group | Site-Moscow, Site-SPb |
| **Subnet** | IP → Site mapping | 192.168.10.0/24 → Moscow |
| **Site Link** | Communication between sites | Moscow-SPb, cost 100 |
| **Site Link Bridge** | Transit via hub | Hub: Moscow |

**SMB design (head office + branch):**
\\\`\\\`\\\`
Site-HeadOffice (192.168.10.0/24)
  └── DC01, DC02 (writable)
Site-Branch (192.168.20.0/24)
  └── RODC01 (read-only)
Site Link: HeadOffice-Branch, cost 200, schedule 08:00-20:00 replicate
\\\`\\\`\\\`

**KCC (Knowledge Consistency Checker):**
- Automatically builds a replication topology
- Intersite: usually via bridgehead server
- Intrasite: full mesh (<15 DC)

**Client logic:**
- DC Locator selects DC in its site
- Fallback to the nearest site by cost

> **Error:** all DCs in Default-First-Site-Name - replication is not optimized, clients can go through the WAN to the DC.`,
      code: {
        language: 'powershell',
        caption: 'Creating sites and subnets',
        code: `New-ADReplicationSite -Name "Site-HeadOffice"
New-ADReplicationSite -Name "Site-Branch"
New-ADReplicationSubnet -Name "192.168.10.0/24" -Site "Site-HeadOffice"
New-ADReplicationSubnet -Name "192.168.20.0/24" -Site "Site-Branch"
New-ADReplicationSiteLink -Name "HQ-Branch" -SitesIncluded "Site-HeadOffice","Site-Branch" -Cost 200 -ReplicationFrequencyInMinutes 180

Get-ADReplicationSite | Select Name
Get-ADReplicationSubnet -Filter * | Select Name, Site`,
      },
    },
    {
      title: 'RODC — Read-Only Domain Controller',
      content: `**RODC (Read-Only Domain Controller)** - read-only DC, for low-trust branches.

**Advantages:**
- Cache credentials of only authorized users (Password Replication Policy)
- You cannot change AD from RODC
- Less attack surface in the branch
- Works when WAN is broken (cached creds)

**Limitations:**
- Does not hold FSMO role
- Does not support some apps that require writable DC
- Password Replication Policy - explicit allow/deny list

**Password Replication Policy (PRP):**
- **Allowed:** Domain Admins (if necessary), Branch users group
- **Denied:** Enterprise Admins, Schema Admins, all Tier 0

**Deployment:**
1. Writable DC in hub office
2. \\\`Install-ADDSDomainController -ReadOnlyReplica -SiteName "Site-Branch"\\\`
3. PRP setting: deny Tier 0, allow branch users
4. Staged installation - media for offline initial sync

**Monitoring:**
\\\`repadmin /rodcpwdrepl SRV-RODC01\\\` - which passwords are replicated

> **Case:** store with 5 cashiers, no IT - RODC + local Wi‑Fi, if the server is stolen there is no writable AD copy.`,
      code: {
        language: 'powershell',
        caption: 'Promote RODC',
        code: `Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Import-Module ADDSDeployment
$pwd = ConvertTo-SecureString "DSRM-P@ss!" -AsPlainText -Force
Install-ADDSDomainController -DomainName "company.local" -Credential (Get-Credential) -SafeModeAdministratorPassword $pwd -ReadOnlyReplica -SiteName "Site-Branch" -InstallDns

Get-ADDomainController -Filter {IsReadOnly -eq $true} | Select Name, Site, OperatingSystem
Get-ADAccountAuthenticationPolicySilo -Filter * -ErrorAction SilentlyContinue`,
      },
    },
    {
      title: 'AD CS - Overview of Certificate Services in AD',
      content: `**AD CS in the context of Active Directory** - PKI integrated with the domain for auto-enrollment and identity.

**AD+PKI communication:**
- Enterprise CA — member of domain, publishes to AD
- Certificate templates in AD (Configuration partition)
- GPO auto-enrollment for domain members
- Cert mapping to user/computer objects

**Templates for AD infrastructure:**

| Template | Destination |
|----------|------------|
| Domain Controller | LDAPS on DC |
| Kerberos Authentication | Smart card logon |
| Domain Computer | 802.1X, VPN |
| Domain User | S/MIME, EFS |
| Workstation Authentication | Client auth |

**CRL Distribution Points:**
- Published in AD and HTTP
- Clients check revocation before trust

**For AD admin:**
- LDAPS (636) requires cert on DC - use auto-enroll template
- ldaps:// for PowerShell AD Web Services
- Bloodhound/ldap signing — cert optional but recommended

> Detailed CA installation - in the Windows Server chapter; here the focus is on integration with AD objects.`,
    },
    {
      title: 'Azure AD Connect - Hybrid Identity',
      content: `**Azure AD Connect (AAD Connect)** - on-prem AD synchronization with Microsoft Entra ID (Azure AD).

**Why SMB needs a hybrid:**
- M365 with the same UPN as AD
- SSO to the cloud without re-password
- Conditional Access + on-prem legacy apps
- Password Hash Sync or Pass-through Auth

**Authentication modes:**

| Mode | Description | SMB recommendation |
|-------|----------|-----------------|
| **Password Hash Sync** | Hash to the cloud | Simple, resilient |
| **Pass-through Auth** | Auth on-prem agent | Strict compliance |
| **Federation (AD FS)** | SAML tokens | Legacy, more difficult |
| **Seamless SSO** | Kerberos to cloud | + PHS or PTA |

**Typical installation:**
1. Server 2019/2022 member (not DC!) - SRV-AADCONNECT01
2. .NET, TLS 1.2
3. Service account: AD sync permissions (MS docs)
4. OU filtering — sync only needed OUs
5. Optional: writeback (groups, devices)

**Express settings vs Custom:**
- Express: all OUs, PHS, auto upgrade
- Custom: select OUs, exclude service accounts, staging mode

**Staging mode:**
- Second AAD Connect server hot standby
- Do not sync until activated

**Troubleshooting:**
- IdFix — fix UPN, duplicates before sync
- Synchronization Service Manager — connector status
- Event 6600-6699 in Application log

> **Case:** ivan.petrov@company.local in AD → ivan.petrov@company.ru in M365 → one password, Teams/Outlook SSO.`,
      code: {
        language: 'powershell',
        caption: 'Checking Azure AD Connect sync status',
        code: `# На сервере AAD Connect
Import-Module Adsync
Get-ADSyncScheduler | Select AllowedSyncCycleInterval, CurrentlyEnabledSyncCycleInterval
Start-ADSyncSyncCycle -PolicyType Delta

# Metaverse search
Get-ADSyncCSObject -DistinguishedName "CN=ivan petrov,OU=Sales,OU=Users,DC=company,DC=local" | Select ObjectType, ConnectorSpaceAttributes`,
      },
    },
    {
      title: 'Privileged Access Management (PAM)',
      content: `**PAM in AD** - time-bound elevation of privileges, JIT (Just-In-Time) admin access.

**Components (Microsoft PAM / MIM):**
- **Shadow Principal** — temporary group membership
- **Approval workflow** — manager approves admin request
- **Time limit** — access expires after N hours
- **Audit** - who, when, why received Domain Admin

**For SMB without MIM:**
- **Microsoft Entra Privileged Identity Management (PIM)** — cloud roles JIT
- **LAPS** — JIT local admin on workstations
- **Tiered Admin + PAW** — manual but effective
- **Temporary AD group** — script adds to G_Admins_Temp, scheduled remove

**Best practices:**
- Zero standing Domain Admin accounts
- Break-glass account — 2 sealed envelopes
- Admin audit: 4672, 4728, 4732 events to SIEM
- Quarterly access review

**Entra ID PIM for hybrid:**
- Global Admin, Exchange Admin — eligible, not permanent
- MFA on activation
- Approval chain

> Enterprise PAM complex; SMB minimum — no daily use Domain Admin, separate admin accounts, MFA on Azure.`,
    },
    {
      title: 'Bloodhound - analysis of attack paths in AD',
      content: `**BloodHound** is a tool for visualizing attack paths in AD (ACL abuse, Kerberoasting paths).

**Why does the admin need (defensive use):**
- Find “shortest path to Domain Admin”
- Detect dangerous ACLs (GenericAll on user → DA group)
- Audit nested group memberships
- Pre-audit before pentest

**Data collection:**
- **SharpHound** / BloodHound CE collector - on admin workstation
- Requires domain credentials (reader is enough)
- Output: ZIP JSON → import in BloodHound

**Typical SMB findings:**
- Helpdesk has GenericAll on OU=Users → create member → DA path
- Service account SVC_BACKUP in Domain Admins
- Kerberoastable SPN on old service account (weak password)
- Unconstrained delegation on legacy server

**Remediation:**
- Remove excessive ACLs
- gMSA for services
- Protected Users for Tier 0
- Regular BloodHound scans quarterly

> **Important:** Use only with written permission. Unauthorized scanning = incident.

**BloodHound CE (open source):**
- Docker or desktop app
- Cypher queries: «Shortest path to Domain Admins»`,
    },
    {
      title: 'KRBTGT rotation - procedure',
      content: `**KRBTGT account** — Kerberos trust key in the domain. Compromise = Golden Ticket attack.

**When to rotate:**
- After a confirmed AD breach
- After identifying the Golden Ticket in SIEM
- **Not** routined - only when necessary (breaks auth twice)

**Procedure (Microsoft official - 2-step reset):**

| Step | Action |
|-----|----------|
| 1 | Document: all DCs healthy, repadmin /syncall |
| 2 | First password reset KRBTGT (ADUC or PowerShell) |
| 3 | Wait **10 hours** (max ticket lifetime, default 10h) |
| 4 | Second password reset KRBTGT |
| 5 | Verify: dcdiag, user logons, service tickets |
| 6 | Invalidate old backups containing old KRBTGT hash |

**PowerShell:**
\\\`Reset-KrbtgtAccountPasswordScript.ps1\\\` — Microsoft script with prechecks

**Consequences of incorrect rotation:**
- Single reset without wait — partial auth failure
- No second reset — old key still valid for Golden Ticket

**Prevention:**
- Protect DCs (Tier 0)
- Monitor Event 4769 anomalies
- Don't run unnecessary KRBTGT rotation «for hygiene»

> After rotation - all TGTs are re-issued on next logon. Plan maintenance window.`,
      code: {
        language: 'powershell',
        caption: 'KRBTGT password reset (use the official Microsoft script!)',
        code: `# ВНИМАНИЕ: только при confirmed compromise, два раза с интервалом 10+ часов
# Скачай Reset-KrbtgtAccountPasswordScript.ps1 с Microsoft GitHub

# Проверка перед rotation
repadmin /showrepl
dcdiag /v

# После первого reset — WAIT max ticket lifetime (default 10 hours)
# Затем второй reset
Get-ADUser krbtgt -Properties PasswordLastSet | Select PasswordLastSet`,
      },
    },
    {
      title: 'Full list of AD ports',
      content: `**Firewall rules for Active Directory** - complete table for SMB and enterprise.

| Port | Protocol | Service | Direction |
|------|----------|--------|-------------|
| 53 | TCP/UDP | DNS | DC ↔ Clients, DC ↔ DC |
| 88 | TCP/UDP | Kerberos | All domain members |
| 123 | UDP | W32Time NTP | DC → external, clients → DC |
| 135 | TCP | RPC Endpoint Mapper | DC ↔ DC, Admin tools |
| 137-139 | TCP/UDP | NetBIOS | Legacy (minimize) |
| 389 | TCP/UDP | LDAP | All domain members |
| 445 | TCP | SMB | SYSVOL, replication, files |
| 464 | TCP/UDP | Kerberos password change | Clients → DC |
| 636 | TCP | LDAPS | Secure LDAP |
| 3268 | TCP | Global Catalog | Universal groups |
| 3269 | TCP | GC SSL | Secure GC |
| 49152-65535 | TCP | RPC dynamic | DRSUAPI, replication |
| 9389 | TCP | AD Web Services | PowerShell AD module |
| 5722 | TCP | DFSR RPC | File replication |
| 5985-5986 | TCP | WinRM | Remote admin |
| 3389 | TCP | RDP | Admin only, restricted |

**Between DCs (minimum):**
TCP/UDP 53, 88, 389, 445, 636, 3268-3269, 49152-65535

**Clients to DCs:**
TCP/UDP 53, 88, 389, 445, 464, 3268, 9389

**RODC specific:**
Same as clients + RPC to writable DC for replication

**Azure AD Connect:**
443 TCP to Microsoft endpoints, 389/636 to DCs

> Microsoft doc: “Active Directory and Active Directory Domain Services Port Requirements” - print for the firewall team.`,
    },
    {
      title: 'AD Migration Scenarios',
      content: `**Typical migration scenarios for SMB:**

**1. Rename domain (NOT recommended)**
- Almost impossible without rebuild
- Use UPN suffix instead

**2. Upgrade functional level**
- 2012 R2 → 2016 → 2019 → 2022
- Add new DC on new OS, demote old
- Raise forest/domain level when all DCs compatible

**3. Inter-forest migration (M&A)**
- ADMT (Active Directory Migration Tool)
- Migrate users with SID history
- Resource forest or domain trust

**4. Virtual to physical / cloud**
- Demote old, promote new in Azure VM
- Or: VM lift-and-shift, verify USN rollback

**5. SBS 2011 migration (legacy SMB)**
- Export users, new forest, AAD Connect
- Common in Eastern Europe SMB

**6. Exchange on-prem decommission**
- Remove Exchange attributes
- Keep AD for file/print/GPO

**Migration checklist:**
- [ ] Backup all DCs (system state)
- [ ] Document FSMO holders
- [ ] Test lab migration first
- [ ] Communication plan (downtime)
- [ ] Rollback plan (restore from backup)
- [ ] Verify apps: 1C, SQL linked to AD

> **Rule:** migrate by adding new, not in-place surgery when possible.`,
    },
    {
      title: 'Lab: multi-DC and sites',
      content: `**Goal:** deploy 2 DCs in different sites, check replication and DC Locator.

| Step | Action | Expected result |
|-----|----------|---------------------|
| 1 | Lab: DC01 in Site-HeadOffice (192.168.10.10) | Get-ADDomain OK |
| 2 | Create a Site-Branch, subnet 192.168.20.0/24 | Sites visible in AD Sites and Services |
| 3 | VM DC02: IP 192.168.20.10, promote replica | 2 DCs in domain |
| 4 | Assign DC02 to Site-Branch | (Get-ADDomainController DC02).Site = Site-Branch |
| 5 | Client in Branch subnet: nslookup _ldap._tcp.branch | SRV points to DC02 |
| 6 | repadmin /replsummary | No failures |
| 7 | dcdiag /v on both | All tests pass |
| 8 | Create test user on DC01 | Visible on DC02 immediately (same site) or after replication |
| 9 | Simulate WAN: firewall block DC02→DC01 15 min | Branch clients auth against DC02 |
| 10 | Unblock, repadmin /syncall | Replication caught up |
| 11 | Create RODC in Branch (optional advanced) | IsReadOnly = True |
| 12 | Document site topology diagram | Visio/draw.io saved |
| 13 | Export repadmin /showrepl to file | Baseline replication doc |
| 14 | Test secure channel from branch client | Test-ComputerSecureChannel True |
| 15 | Cleanup lab or snapshot for exam prep | Lab reusable |`,
    },
    {
      title: 'FAQ — Active Directory',
      content: `**Q1: How many DCs does SMB need?**
A: Minimum 2 for HA. One DC = single point of failure.

**Q2: Is it possible to have a DC on a VM without a dedicated host?**
A: Yes, but do not backup/restore snapshot without caution. Hyper-V replication for DR.

**Q3: .local vs .corp - what to choose?**
A: Internal suffix is not public DNS. corp.company.ru or company.local are both OK.

**Q4: How often should I change the functional level?**
A: When all DCs run newer OS. Not urgent if features not needed.

**Q5: Can AD Recycle Bin be enabled after creating a domain?**
A: Yes, irreversible enable. Do it early.

**Q6: What is USN rollback?**
A: Restore DC VM snapshot → replication broken. Must demote/repromote or restore from backup properly.

**Q7: Is DNS required on every DC?**
A: Recommended. AD-integrated DNS replicates with AD.

**Q8: How to find “forgotten” service accounts?**
A: Search-ADAccount -AccountInactive, check SPNs, BloodHound Kerberoastable.

**Q9: Azure AD replace on-prem AD?**
A: Not fully for GPO, legacy auth, file ACLs. Hybrid most SMB.

**Q10: How to test AD restore without production impact?**
A: Restore DC VM to isolated VLAN, or authoritative restore in lab forest.`,
    },
    {
      title: 'Common AD errors and solutions',
      content: `| Error | Reason | Solution |
|--------|---------|---------|
| dcdiag DNS test fail | DNS not on DC, wrong pointer | Fix DNS, register DC records |
| Replication access denied | Time skew, creds, firewall | Sync time, check ports 135, 445, RPC |
| «Cannot contact domain» | DNS client wrong, DC down | ipconfig /all, point to DC IP |
| USN rollback detected | VM snapshot restore | Demote DC or metadata cleanup |
| Lingering objects | Improper demotion | repadmin /removelingeringobjects |
| Trust relationship failed | Secure channel broken | Test-ComputerSecureChannel -Repair |
| Kerberos clock skew | Time not synced | w32tm on PDC emulator |
| SYSVOL not shared | JRNL wrap, FRS migration | dfsrmig / Dfsr propagation |
| Cannot create user — insufficient rights | Wrong OU delegation | Check effective permissions on OU |
| Azure AD Connect sync error duplicate | Same UPN/mail | IdFix, resolve duplicates |
| Golden Ticket suspected | KRBTGT compromised | Two-step KRBTGT rotation |
| RODC no replication | PRP, connection object | repadmin, site link schedule |
| Schema version mismatch | Old DC remains | Remove old DC, raise level |
| AD database growing fast | Auditing, objects | AD database maintenance, tombstone |
| GPO not applying (AD side) | SYSVOL replication lag | repadmin, check NETLOGON share |`,
    },
    {
      title: 'Admin Day Scenarios - AD',
      content: `**Scenario 1 - “The branch cannot log into the domain”**

09:00 - call from the branch: “password not accepted.” You check: WAN link up, RODC pingable. repadmin — RODC last sync 2 days ago (site link schedule too restrictive). Temporary: force replication \\\`repadmin /syncall /AdeP\\\`. Fix site link schedule to every 15 min during business hours. Root cause: weekend maintenance left link disabled.

**Scenario 2 - “New CEO, urgent access”**

Board meeting in an hour. HR created an account in the wrong OU (no exec GPO). Move user to OU=Management, add to G_Management, G_VPN, G_ExecShare. FGPP already applies 16-char password. Azure AD Connect delta sync. Test login on laptop. Document in ticket: 25 min total. Remind HR: use onboarding form.

**Scenario 3 - “Suspicion of AD Compromise”**

SOC alert: multiple 4768 TGT requests from unusual host. Isolate suspect workstation VLAN. Reset user password, revoke sessions. BloodHound: path from compromised helpdesk account to Domain Admins via ACL misconfiguration. Remove ACL, rotate helpdesk creds, enable PIM for DA. KRBTGT rotation scheduled per Microsoft 2-step. Incident report to management.`,
    },
    {
      title: 'Checklist AD production',
      content: `**Daily (automated):**
- [ ] dcdiag summary on all DCs
- [ ] Replication latency < 15 min intrasite
- [ ] Critical AD events (4720, 4726, 4740) reviewed

**Weekly:**
- [ ] Backup system state verified
- [ ] Inactive accounts report (>90 days)
- [ ] DNS scavenging stats

**Monthly:**
- [ ] Privileged group membership review
- [ ] GPO backup (Backup-GPO -All)
- [ ] Certificate expiry on DC LDAPS
- [ ] Time sync audit on PDC emulator

**Quarterly:**
- [ ] AD restore test in lab
- [ ] BloodHound path review
- [ ] Disaster recovery drill (DC failure)
- [ ] Functional level / OS upgrade plan

**Annually:**
- [ ] Full AD audit (tools: Purple Knight, AD CS health)
- [ ] Password policy review
- [ ] Documentation update (sites, subnets, trusts)
- [ ] KRBTGT — only if breach, not routine

**Architecture must-haves:**
- [ ] 2+ writable DCs
- [ ] AD Recycle Bin enabled
- [ ] LAPS deployed
- [ ] Tiered admin documented
- [ ] Break-glass account sealed`,
    },
    {
      title: 'Preparing for AZ-800/801 - Active Directory',
      content: `| AZ-800 Objective | Chapter Section |
|----------------|--------------|
| Deploy DC | Create a domain, promote DC |
| Configure domain and forest | Forest design, functional levels |
| Create and manage AD objects | Users, groups, AGDLP, OU |
| Manage AD replication | Replication, sites, repadmin |
| Configure trusts | Trusts section |
| Configure AD DNS | DNS in AD |
| Implement Group Policy (AD side) | FGPP, LAPS, Recycle Bin |
| Monitor and troubleshoot AD | dcdiag, troubleshooting |

| AZ-801 Objective | Chapter Section |
|----------------|--------------|
| Secure AD | Tiered Admin, PAM, Protected Users |
| Implement hybrid identity | Azure AD Connect |
| Configure PKI integration | AD CS overview |
| Monitor AD security | Bloodhound, audit events |
| Implement AD recovery | Recycle Bin, backup cross-ref |
| Manage AD migrations | Migration scenarios |

**Hands-on labs Microsoft Learn:**
- Configure AD sites
- Deploy RODC
- Configure Azure AD Connect
- Perform AD restore`,
    },
    {
      title: 'Interview Questions - AD',
      content: `**1. What is FSMO and what are the 5 roles?**
Schema Master, Domain Naming Master (forest), PDC Emulator, RID Master, Infrastructure Master (domain). PDC — most critical (time, password changes).

**2. How does Kerberos work in AD?**
AS-REQ/TGT from KDC (DC), TGS-REQ for service, mutual auth. Requires time sync ±5 min.

**3. Difference between global, universal, domain local groups?**
Global — users, domain-wide. Universal — forest-wide (careful replication). Domain Local — permissions on resources.

**4. What is AGDLP?**
Account in Global group, Global in Domain Local, Domain Local on resource Permission. Best practice ACL model.

**5. How to force replication?**
repadmin /syncall /AdeP or Sync-ADObject (PS). KCC builds topology automatically.

**6. What does PDC Emulator do?**
Primary time source, password change priority, legacy PDC role emulation, DFS root consistency.

**7. AD Recycle Bin vs authoritative restore?**
Recycle Bin — soft-deleted objects, easy restore. Authoritative — for USN/version conflicts, last resort, affects all DCs.

**8. Why LAPS?**
Unique local admin password per machine, stored in AD, rotated. Prevents lateral movement via shared local admin.

**9. RODC vs writable DC in branch?**
RODC — read-only, credential caching controlled, safer untrusted location. Writable — full DC if trusted site with IT.

**10. How to detect Kerberoasting?**
Monitor Event 4769 for RC4 encryption, service accounts with SPN and weak passwords, use managed gMSA.`,
    },
  ],
  practice: [
    'Create a company.local forest with one DC in lab (evaluation). Write down the DSRM password in vault',
    'Design an OU structure for an office for 30 people (Sales, IT, HR, Guests, Disabled)',
    'Create 3 users, 2 global groups, 1 domain local group. Apply AGDLP to a test NTFS folder',
    'Join Windows 10/11 VM to the domain, log in using a domain account. Check secure channel',
    'Run dcdiag /v and explain each warning. Fix the problems you find',
    'Add a second DC (SRV-DC02). Check replication: repadmin /replsummary',
    'Set up DNS forwarders, check nslookup company.local and google.com from the client',
    'Create a Fine-Grained Password Policy for the admin group (16 characters, 3 attempts)',
    'Enable AD Recycle Bin. Delete test user, restore from Recycle Bin',
    'Configuring LAPS (Windows LAPS) via GPO. Read the password of one PC via PowerShell',
    'Document the runbook onboarding: AD user → groups → OU → GPO → mail → VPN (1 page)',
    'Simulate “trust relationship failed”: break the secure channel, repair it via Test-ComputerSecureChannel -Repair',
    'Design a multi-site topology: HeadOffice + Branch with subnets, site link, cost. Document on diagram',
    'Deploy RODC in lab (or study PRP): deny Domain Admins replication, allow branch users group',
    'Install BloodHound CE, collect SharpHound data, find the shortest path to Domain Admins in the lab',
  ],
  resources: [
    { title: 'Microsoft Learn — Active Directory', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview' },
    { title: 'AD ports for firewall', url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/config-firewall-for-ad-domains-and-trusts' },
    { title: 'Windows LAPS', url: 'https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview' },
    { title: 'AD Recycle Bin', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/adac/introduction-to-active-directory-administrative-center-enhancements--level-100-#ad_recycle_bin_revamped' },
    { title: 'Securing Privileged Access', url: 'https://learn.microsoft.com/en-us/security/privileged-access-workstations/privileged-access-access-model' },
    { title: 'Azure AD Connect', url: 'https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/whatis-azure-ad-connect' },
    { title: 'RODC documentation', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/rodc-placement-and-planning' },
    { title: 'KRBTGT reset guidance', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/ad-forest-recovery-resetting-the-krbtgt-password' },
  ],
  quiz: [
    {
      question: 'What is an OU in Active Directory?',
      options: ['Delegation container and GPO', 'Security group type', 'DNS zone'],
      answer: 'Delegation container and GPO',
    },
    {
      question: 'What authentication protocol does AD use by default?',
      options: ['Kerberos', 'NTLM only', 'LDAP plain text'],
      answer: 'Kerberos',
    },
    {
      question: 'What is the minimum DC recommended in production?',
      options: ['2', '1', '5'],
      answer: '2',
    },
    {
      question: 'AGDLP stands for:',
      options: [
        'Account → Global group → Domain Local group → Permission',
        'Account → Domain Local → Global → Policy',
        'Admin → Group → Domain → Password',
        'Active Directory → Group → Domain → Login',
      ],
      answer: 'Account → Global group → Domain Local group → Permission',
    },
    {
      question: 'Where is the AD-integrated DNS zone stored?',
      options: ['In Active Directory', 'Only in the hosts file', 'On the router', 'In the DHCP scope only'],
      answer: 'In Active Directory',
    },
    {
      question: 'DC Health Check Team:',
      options: ['dcdiag', 'ipconfig', 'docker ps'],
      answer: 'dcdiag',
    },
    {
      question: 'A Global Security Group in AD is used for:',
      options: ['Collecting users by roles/departments', 'Directly assigning NTFS permissions', 'Storing DNS zones', 'Publishing printers only'],
      answer: 'Collecting users by roles/departments',
      explanation: 'Per AGDLP, users go into Global groups; permissions go through Domain Local.',
    },
    {
      question: 'A Forest in AD is:',
      options: ['A security and schema boundary', 'One OU', 'Only a DNS zone', 'A group of printers'],
      answer: 'A security and schema boundary',
    },
    {
      question: 'Utility to find the source of account lockout:',
      options: [
        'LockoutStatus.exe or Get-ADUser / Event Viewer (ID 4740)',
        'dcdiag /dns',
        'ipconfig /renew',
        'gpupdate /force',
      ],
      answer: 'LockoutStatus.exe or Get-ADUser / Event Viewer (ID 4740)',
    },
    {
      question: 'AD replication between DCs uses protocol:',
      options: ['RPC / SMTP (for inter-site)', 'HTTP only', 'FTP only', 'SNMP only'],
      answer: 'RPC / SMTP (for inter-site)',
    },
  ],
}

export default translation
