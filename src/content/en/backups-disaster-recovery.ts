import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Backup and Restore - The Complete Guide',
  duration: '12–16 hours',
  description:
    'Deep study of backups: 3-2-1 strategy, Veeam, WSB, AD recovery, ransomware, DR tabletop, RTO/RPO, immutable backups, recovery testing',
  sections: [
    {
      title: 'The 3-2-1 Rule and Basic Strategy',
      content: `**Rule 3-2-1** - the gold standard for backup:

- **3** copies of data (original + 2 backups)
- **2** different types of media (disk + tape/cloud)
- **1** offsite copy (another office / cloud / another city)

**Why 3-2-1:**
- One disk may break
- One backup may be damaged (ransomware encrypts everything on the NAS)
- The office may burn down (fire, flooding)

**Advanced Rule 3-2-1-1-0:**
- **1** copy offline/air-gapped
- **0** errors when testing recovery

**Types of backups:**

| Type | Description | Recovery rate | Place |
|-----|----------|------------------------|-------|
| **Full** | Full copy | Quick | A lot |
| **Incremental** | Only changes from the last backup | Slow (chain) | Few |
| **Differential** | Changes since last Full | Average | Average |
| **Synthetic Full** | Veeam: full of incrementals | Quick | Optimally |

**Real SMB case:** file server 500 GB → Full on Sundays + Incremental daily → Repository on NAS → Copy Job on S3 (immutable) → Tape once a month to the safe.`,
    },
    {
      title: 'RTO and RPO - defining requirements',
      content: `**RPO (Recovery Point Objective)** - how much data can be **lost** (time between backups).

**RTO (Recovery Time Objective)** - how much **downtime** is allowed (recovery time).

| System | Typical RPO | Typical RTO | Method |
|---------|-------------|--------------|-------|
| **AD/DC** | 24 h | 2–4 h | System State daily |
| **DNS/DHCP** | 24 h | 1–2 h | System State / VM backup |
| **File server** | 1–4 h | 4–8 h | Veeam incremental + VSS |
| **1C / ERP** | 15 min – 1 hour | 1–4 h | Veeam app-aware + SQL log shipping |
| **Mail (M365)** | Cloud retention | 1–4 h | M365 backup (Veeam M365) |
| **RDS / terminals** | 24 h | 4–8 h | VM backup |
| **Hyper-V host** | 24 h | 2–4 h | Veeam image-level |
| **Workstations** | 24 h | 1 working day | Not critical (Folder Redirection) |

**How to determine RPO/RPO for your office:**
1. Ask the business: “How many hours of work without 1C is acceptable?”
2. Ask accounting: “How many hours of data can I lose?”
3. Document in the DR plan
4. Match the technology to your requirements

> **RPO 0** (zero loss) = expensive (replication, clustering). For SMB, an RPO of 1-24 hours is usually sufficient.`,
    },
    {
      title: 'Windows Server Backup (WSB)',
      content: `**Windows Server Backup** is a built-in tool. Free but limited.

**Possibilities:**
- System State (AD, DNS, registry, boot files)
- Full volumes (bare metal recovery)
- Hyper-V VMs (Windows Server 2012+)
- Scheduled backups

**Limitations:**
- No deduplication
- No application-aware (SQL, Exchange - basic)
- No replication, cloud tier
- No central management
- One destination per schedule

**When to use WSB:**
- Lab/test environment
- The only DC in a very small office (better than Veeam!)
- Additional System State backup (together with Veeam)

**Installation:**
\\\`Install-WindowsFeature Windows-Server-Backup -IncludeManagementTools\\\`

**GUI:** Server Manager → Tools → Windows Server Backup
**CLI:** \\\`wbadmin\\\``,
    },
    {
      title: 'Veeam Backup & Replication - Deep Dive',
      content: `**Veeam** is a de facto standard for VM backup and physical servers in Windows offices.

**Veeam Architecture:**

| Component | Destination |
|-----------|------------|
| **Veeam B&R Server** | Management, scheduling, recovery |
| **Backup Proxy** | Data processing (may be on HV host) |
| **Repository** | Storage of backups (.vbk, .vib, .vrb) |
| **Tape Server** | Record to tape (optional) |
| **WAN Accelerator** | Optimizing copy jobs over WAN |

**Typical SMB scheme:**
\\\`\\\`\\\`
SRV-VEEAM01 (VM, 8 GB RAM)
├── Repository: \\\\\\\\NAS\\\\VeeamBackup (500 GB – 2 TB)
├── Backup Jobs:
│   ├── DC01 + DC02 (daily, app-aware)
│   ├── FS01 (every 4h, incremental)
│   ├── RDS01 (daily)
│   └── HV01 (weekly full)
├── Copy Job → S3 (immutable, daily)
└── SureBackup → lab (weekly verify)
\\\`\\\`\\\`

**Key Features:**
- **Image-level backup** — the entire VM as a file
- **Application-aware** - VSS for SQL, Exchange, AD, 1C
- **Instant VM Recovery** - launching a VM from a backup in minutes
- **File-level recovery** - individual files from VM backup
- **Replication** - copy of the VM on the DR site
- **SureBackup** - automatic check of boot VM from backup
- **Immutable backup** — S3 Object Lock, Linux Hardened Repository

**Veeam Licensing:**
- Veeam Universal License (VUL) — per workload
- Community Edition - free up to 10 workloads
- For SMB 3–10 servers: Community or Essentials`,
    },
    {
      title: 'Application-Aware Backup',
      content: `**Application-Aware Processing** - Veeam coordinates with VSS for consistent application backup.

**How it works:**
1. Veeam sends a signal to the VSS writer of the application
2. The application “freezes” data (SQL transaction log, AD database)
3. Veeam takes a snapshot
4. The application continues to work
5. Veeam copies data from snapshot

**Supported Applications:**
- Active Directory (NTDS)
- Microsoft SQL Server
- Microsoft Exchange
- Oracle
- SharePoint
- 1C (via VSS writer or pre-freeze script)

**Setup in Veeam Job:**
- Processing → Advanced → VSS → Enable application-aware processing
- Guest Processing → Credentials for guest OS
- For AD: domain admin creds are usually enough

**Without application-aware:**
- AD: USN rollback possible during recovery
- SQL: inconsistent database, need replay log
- 1C: database damage

> **Always** enable application-aware for DC, SQL, 1C. For a file server, VSS file-level is sufficient.`,
    },
    {
      title: 'Active Directory Recovery',
      content: `**AD recovery types - know everything, use the right one:**

| Type | When | Downtime | Difficulty |
|-----|-------|----------|-----------|
| **Recycle Bin** | Object recently deleted | 0 | Low |
| **Authoritative restore** | The object was deleted a long time ago, there is no Recycle Bin | 1–4 h | High |
| **Non-authoritative restore** | DC is damaged, other DCs are alive | 2–4 h | Average |
| **Full forest recovery** | All DCs are dead, ransomware | 4–24 h | Very high |

**Non-authoritative restore (typical):**
1. DC is broken (hardware, OS corruption)
2. Restore VM/System State from backup
3. Upload to DSRM
4. \\\`wbadmin start systemstaterecovery\\\`
5. Reboot → DC replicates from other DCs (non-authoritative)

**Authoritative restore (remote object):**
1. Restore System State on DC in DSRM
2. \\\`ntdsutil\\\` → authoritative restore → object
3. Reboot → the object is replicated to all DCs
4. **Caution:** rolls back ALL changes after the backup point!

**Critical:**
- Always have **2+ DC**
- Backup System State **all** DC
- Test recovery **quarterly**`,
    },
    {
      title: 'File Server and User Data',
      content: `**Data backup strategy is multi-level:**

| Level | Technology | RPO | Protection from |
|---------|-----------|-----|-----------|
| 1 | Folder Redirection to file server | — | PC Loss |
| 2 | VSS / Shadow Copies (Previous Versions) | 2×/day | Accidental deletion |
| 3 | Veeam file server backup | 1–4 h | Server crash |
| 4 | Copy Job on S3 (immutable) | 24 h | Ransomware |
| 5 | OneDrive/SharePoint sync | Real-time | Loss of PC + server |

**Volume Shadow Copy Service (VSS) on file server:**
- Snapshots every 12 hours (configurable)
- User: right click → Previous Versions → Restore
- Not a replacement for a full backup! Snapshots on the same disk

**DFS Replication:**
- Two file servers - real-time replication
- RPO ≈ 0 for files
- No ransomware protection (encrypts on both!)

**Backup rights:**
- Backup Operators group - enough for Veeam/WSB
- **Not** Domain Admin for daily backup jobs
- gMSA for Veeam service account

**Real case:** an accountant deleted a folder with reports → Previous Versions → recovery in 2 minutes. No need for Veeam.`,
      code: {
        language: 'powershell',
        caption: 'VSS Shadow Copies on file server',
        code: `vssadmin list shadows
vssadmin list shadowstorage

# Настройка Shadow Copies (GUI: свойства тома → Shadow Copies)
# Или через vssadmin:
vssadmin add shadowstorage /for=D: /on=D: /maxsize=10GB
vssadmin create shadow /for=D:

# Проверка Previous Versions (на клиенте)
Get-ChildItem "\\\\fileserver\\sales" | Get-Item | Select Name`,
      },
    },
    {
      title: 'Ransomware and backup protection',
      content: `**Ransomware** is the main threat to SMB in 2024–2026. Encrypts files, databases, **and backups** if they are accessible from the network.

**How ransomware attacks backups:**
1. Penetration (phishing, RDP, vulnerability)
2. Lateral movement (Domain Admin hash)
3. Search for backup repositories (\\\\\\\\NAS\\\\Backup, V: drive)
4. Encryption production + backups
5. Demand for ransom

**Backup protection is multi-level:**

| Level | Method | Description |
|---------|-------|----------|
| 1 | **Immutable backup** | S3 Object Lock, Veeam Hardened Repository |
| 2 | **Air-gapped** | Tape, disconnected disk, cloud without write access |
| 3 | **Separate credentials** | Veeam account ≠ Domain Admin |
| 4 | **Network isolation** | Backup VLAN, firewall rules |
| 5 | **MFA** | On Veeam Console, NAS, Cloud |
| 6 | **3-2-1** | Offsite copy in another location |

**Veeam Immutable Backup:**
- Linux Hardened Repository (single-use credentials, immutability flag)
- S3 Object Lock (Compliance mode - even root cannot be removed)
- Tape (physically offline)

**What to do with ransomware:**
1. **Do not pay** (in 80% of cases the data is not returned)
2. Isolate infected systems (disable the network)
3. Assess the scale (what is encrypted, are the backups intact?)
4. Restore from immutable backup
5. Investigation (how they got in, close the vector)
6. Notify (personal data law, if personal data is affected)`,
    },
    {
      title: 'Immutable Backups - setup',
      content: `**Immutable (unchangeable) backups** - data that cannot be deleted or changed during the retention period. Even with admin rights. Even ransomware.

**Options for SMB:**

| Method | Cost | Difficulty | Protection |
|-------|----------|-----------|--------|
| **Veeam Hardened Repository (Linux)** | Free (Linux VM) | Average | High |
| **S3 Object Lock (AWS/MinIO/Wasabi)** | $5–20/TB/month | Low | High |
| **Tape** | $50-100/tape | Average | Maximum (offline) |
| **Rotated USB drives** | $50/disc | Low | Medium (manual process) |

**Setting up Veeam Hardened Repository:**
1. Linux VM (Ubuntu) with dedicated disk
2. Veeam → Backup Infrastructure → Add Repository → Hardened
3. Single-use credentials (generated once)
4. Immutability: 30 days (or according to RPO)
5. Copy Job → this repository

**S3 Object Lock:**
1. Bucket with Object Lock enabled (when created!)
2. Compliance mode - cannot be removed until expiry
3. Veeam → Add S3 Repository → Object Lock enabled
4. Retention: 30 days immutable

> **Test:** try deleting the immutable backup. If deleted, the setting is incorrect.`,
      code: {
        language: 'powershell',
        caption: 'Veeam - checking immutable repository',
        code: `Get-VBRBackupRepository | Select Name, Type, @{N='Immutable';E={$_.IsImmutabilityEnabled}}, @{N='Days';E={$_.ImmutabilityDays}}

Get-VBRJob | Where-Object {$_.JobType -eq "Backup"} | Select Name, Repository, @{N='LastResult';E={$_.LastRun}}`,
      },
    },
    {
      title: 'Disaster Recovery Plan',
      content: `**DR Plan** - a document describing actions in case of a disaster. Without it there is panic and chaos.

**DR Plan structure:**

| Section | Contents |
|--------|-----------|
| 1. Contacts | On-call IT, management, provider, Veeam support |
| 2. Inventory | All systems: hostname, IP, role, RPO, RTO, priority |
| 3. Scripts | Fire, ransomware, DC failure, flood, server theft |
| 4. Procedures | Step-by-step recovery of each system |
| 5. Passwords | Link to password vault (NOT passwords in the document!) |
| 6. Testing | DR drills schedule |
| 7. Versioning | Date, author, changelog |

**Recovery priorities (typical SMB):**

| Priority | System | RTO | Why |
|-----------|---------|-----|--------|
| P1 | AD/DNS | 2 hrs | Without AD - nothing works |
| P1 | Internet/Firewall | 1 hour | No connection - no work |
| P2 | DHCP | 2 hrs | You can static temporarily |
| P2 | File server | 4 h | Documents, 1C files |
| P3 | 1C / ERP | 4 h | Business processes |
| P3 | Mail (M365) | 4 h | Cloud - less critical |
| P4 | RDS | 8 h | Remote work, not all |
| P5 | Print server | 24 h | USB printer possible |

**Where to store DR Plan:**
- Printed copy in the safe (not in the server room!)
- Cloud (SharePoint, Google Drive)
- On the phone of the IT manager
- **Not** only on the file server (it may be unavailable!)`,
    },
    {
      title: 'DR Tabletop Exercise',
      content: `**Tabletop Exercise** - Discussing a disaster scenario with no real recovery. Once a quarter.

**Format:**
- 60–90 minutes
- Participants: IT, manager, accounting (business representative)
- The moderator sets the scenario, the participants describe the actions
- Gaps in the DR Plan are recorded

**Scripts for tabletop:**

| # | Script | Key questions |
|---|----------|-----------------|
| 1 | Fire in the server room | Where are the backups? How to restore AD? Who makes the decisions? |
| 2 | Ransomware encrypted everything | Are the backups intact? Immutable? How much downtime? Are we paying? |
| 3 | DC01 died (hardware) | Do you have DC02? How to quickly restore? FSMO? |
| 4 | Fired admin deleted AD | Recycle Bin? Authoritative restore? Backup? |
| 5 | Provider unavailable 24h | What works locally? VPN? Mail in the cloud? |

**Example tabletop (scenario 2 - ransomware):**
1. Moderator: “Monday 9:00, accounting reports: all files are encrypted, note READ_ME.txt”
2. IT: “I turn off the network, check Veeam - last backup Sunday 02:00”
3. Manager: “How much data will we lose? When will we restore it?
4. IT: “RPO 22 hours, RTO 4 hours with entire immutable backups”
5. Moderator: “What if immutable is also encrypted?” → air-gap discussion

**Tabletop result:** updated DR Plan, list of action items, assigned responsible persons.`,
    },
    {
      title: 'Recovery testing',
      content: `**Backup without recovery testing = hope, not strategy.**

**Testing levels:**

| Level | Frequency | What we check | Time |
|---------|---------|--------------|-------|
| **SureBackup (auto)** | Weekly | VM boot from backup | Automatically |
| **File restore** | Monthly | Restoring a file from backup | 15 min |
| **VM restore** | Quarterly | Full VM recovery in lab | 1–2 h |
| **AD restore** | Quarterly | System State / authoritative restore | 2–4 h |
| **Full DR drill** | Annually | Complete infrastructure restoration | 4–8 h |

**SureBackup (Veeam):**
- Automatic boot VM from backup to isolated network
- Check: VM starts, heartbeat, application scripts
- Email report: success/fail
- Settings: Veeam → SureBackup job → linked to backup job

**Testing checklist:**

| # | Check | Waiting | Fact |
|---|----------|----------|------|
| 1 | VM boot from backup | OS loading | |
| 2 | AD works | dcdiag pass | |
| 3 | DNS resolve | nslookup OK | |
| 4 | File server available | \\\\\\\\fileserver\\\\share | |
| 5 | SQL/1C starts | Application connect | |
| 6 | User can login | Domain login | |
| 7 | File restored | Content matches | |

**Document each test:** date tested, result, recovery time, problems.`,
    },
    {
      title: 'Veeam Copy Jobs and offsite',
      content: `**Copy Job** - copying existing backup files to another repository (offsite).

**Why Copy Job (and not the second Backup Job):**
- Does not load production (copies ready-made .vbk/.vib)
- GFS retention on copy (weekly, monthly, yearly)
- WAN acceleration for remote office
- Immutable target

**Typical diagram:**
\\\`\\\`\\\`
Backup Job → Local Repository (NAS, fast restore)
Copy Job → S3 Wasabi/MinIO (immutable, offsite)
Copy Job → Tape (monthly, air-gapped)
\\\`\\\`\\\`

**GFS Retention (Grandfather-Father-Son):**
- Daily: 30 copies
- Weekly: 12 copies (3 months)
- Monthly: 12 copies (1 year)
- Yearly: 7 copies (7 years) - for compliance

**Setting up Copy Job:**
1. Veeam → Copy Job → Add
2. Source: existing backup jobs
3. Target: S3 / Hardened Repository
4. Schedule: daily, after backup job completes
5. Retention: GFS policy
6. Enable encryption (password or KMS)

> **Rule:** offsite copy must be in **different** location. Another server in the same server room is not offsite.`,
    },
    {
      title: 'Backup monitoring and alerts',
      content: `**A backup that no one knows is broken is worse than no backup.**

**What to monitor:**

| Metric | Alarm threshold | Action |
|---------|--------------|----------|
| Job status | Failed/Warning | Immediate investigation |
| Last successful run | >25 hours ago | Check job, repository |
| Repository free space | <15% | Expand or cleanup |
| SureBackup result | Failed | Check boot, application |
| Copy Job status | Failed | Check WAN, S3 credentials |

**Veeam alerts (built-in):**
- Email notifications: job failed, warning, success summary
- SNMP traps → monitoring system
- Veeam ONE (separate product) - dashboards, reports

**For SMB without Veeam ONE:**
- Email notification for every failed job
- Weekly report: all jobs, status, size, duration
- PowerShell script + Task Scheduler → check + email

**Real case:** Veeam job failed 3 days in a row - no one noticed (email in spam). On the 4th day - ransomware. Lesson: monitoring + alert in Telegram/Slack.`,
      code: {
        language: 'powershell',
        caption: 'Veeam jobs monitoring script',
        code: `Connect-VBRServer -Server localhost
$failedJobs = Get-VBRJob | Where-Object {$_.LastResult -eq "Failed"}
if ($failedJobs) {
  $body = $failedJobs | Select Name, LastRun, LastResult | Format-Table | Out-String
  Send-MailMessage -To "admin@company.local" -From "veeam@company.local" -Subject "ALERT: Veeam Backup Failed" -Body $body -SmtpServer "mail.company.local"
}

$repos = Get-VBRBackupRepository
$repos | ForEach-Object {
  $free = $_.GetContainer().CachedTotalSpace.InBytes - $_.GetContainer().CachedFreeSpace.InBytes
  $pct = [math]::Round(($_.GetContainer().CachedFreeSpace.InBytes / $_.GetContainer().CachedTotalSpace.InBytes) * 100, 1)
  if ($pct -lt 15) { Write-Warning "Repository $($_.Name): only $pct% free!" }
}`,
      },
    },
    {
      title: 'Cloud backups and M365',
      content: `**Microsoft 365** - data in the cloud, but **not protected from the user** (deletion, ransomware sync).

**What M365 does NOT backup:**
- Deleted emails (after retention period)
- Deleted OneDrive/SharePoint files
- Ransomware encryption of OneDrive (Microsoft can help, but does not guarantee)

**Veeam Backup for Microsoft 365:**
- Exchange Online (mail, calendar, contacts)
- OneDrive for Business
- SharePoint Online
- Teams

**Alternatives:** AvePoint, Commvault, native M365 retention policies (limited).

**Cloud VM backups:**
- Azure Backup, AWS Backup - for cloud VMs
- Veeam for AWS/Azure - if hybrid infrastructure

**For SMB with M365:**
- Veeam M365 (free for up to 10 users)
- Retention: 1–3 years
- Storage: local repository + copy to S3`,
    },
    {
      title: 'Runbook: complete office restoration',
      content: `**Runbook: “Server room destroyed” - step-by-step recovery**

| # | Step | Time | Responsible |
|---|------|-------|--------------|
| 1 | Assess the scale: what was destroyed? | 30 min | IT Lead |
| 2 | Notify management, business | 15 min | IT Lead |
| 3 | Check offsite backups (S3/tape) | 30 min | IT Admin |
| 4 | Order/prepare hardware or cloud | 2–24 h | IT + procurement |
| 5 | Install Hyper-V host / cloud VMs | 2–4 h | IT Admin |
| 6 | Restore DC01 from immutable backup | 1–2 h | IT Admin |
| 7 | dcdiag, check AD | 30 min | IT Admin |
| 8 | Restore DC02 (or promote new one) | 1–2 h | IT Admin |
| 9 | Restore DNS, DHCP (or from DC) | 30 min | IT Admin |
| 10 | Restore File Server | 1–2 h | IT Admin |
| 11 | Restore 1C / SQL | 1–2 h | IT + 1C admin |
| 12 | Check: login, files, 1C, mail | 1 hour | IT + business |
| 13 | Connect workstations | 30 min | IT |
| 14 | Document the incident, lessons learned | 2 hrs | IT Lead |

**General RTO: 8–16 hours** (with hardware and entire immutable backups).

**Critical dependencies:**
- Password vault available (not on file server!)
- DR Plan available (printed!)
- Veeam license key available
- S3 credentials available`,
    },
    {
      title: 'Veeam Job - step-by-step setup',
      content: `**Complete walkthrough of creating a Backup Job in Veeam B&R for SMB.**

| Step | Veeam Master | SMB Recommendation |
|-----|--------------|------------------|
| 1 | Backup Job → New Backup Job | Name: BKP-PROD-DC01-Daily |
| 2 | Virtual Machines → Add → From infrastructure | Select DC01, FS01 |
| 3 | Storage → Backup repository | \\\\\\\\NAS\\\\VeeamBackup (fast LAN) |
| 4 | Advanced → Backup | Incremental, synthetic full weekly |
| 5 | Advanced → Storage | Enable deduplication, compression Optimal |
| 6 | Advanced → Integration | VSS enabled, processing mode Direct SAN/NFC |
| 7 | Advanced → Notification | Email on Failure, Warning |
| 8 | Guest Processing | Enable Application-Aware (SQL, AD) |
| 9 | Schedule | Daily 01:00, retry 3 times |
| 10 | Automatic verification | SureBackup optional weekly |
| 11 | Guest OS credentials | Domain admin for in-guest processing |
| 12 | Create → Run | First full backup |
| 13 | Verify restore | File Level Recovery test |
| 14 | Document job in runbook | RPO achieved, retention set |
| 15 | Add to monitoring dashboard | Veeam ONE or email alerts |

**Retention settings:**
- 7 restore points daily + 4 weekly + 2 monthly (GFS)
- For DC: minimum 14 daily system-aware backups

**Proxy selection:**
- On Hyper-V host for local VMs — optimal performance
- Separate proxy if heavy load

> **Expected output of the first job:** Status Success, .vbk file size ~60% of VM used space (compression).`,
      code: {
        language: 'powershell',
        caption: 'Veeam PowerShell - create a simple backup job',
        code: `# Veeam PowerShell snapin required
Connect-VBRServer -Server localhost

$server = Get-VBRServer -Name localhost
$repo = Get-VBRBackupRepository -Name "Default Backup Repository"
$job = Add-VBRViBackupJob -Name "BKP-Lab-DC01" -Description "Daily DC backup" -Entity (Find-VBRViEntity -Name "SRV-DC01") -BackupRepository $repo -BackupMode Incremental

Set-VBRJobOptions -Job $job -OptionsDefaultStorage (New-VBRJobStorageOptions -StoragePolicy (New-VBRJobStoragePolicy -CompressionLevel Optimal -EnableInlineDedup $true))

Start-VBRJob -Job $job
Get-VBRJob -Name "BKP-Lab-DC01" | Select Name, LastResult, LastState`,
      },
    },
    {
      title: 'Cloud backup - Wasabi and S3',
      content: `**Offsite cloud backup** is a mandatory 3-2-1 layer for protection against ransomware and fire.

**Wasabi vs AWS S3:**

| Criterion | Wasabi | AWS S3 |
|----------|--------|--------|
| Price | Flat, cheaper egress | Pay per use, egress dear |
| S3 API | Compatible | Native |
| Immutability | Object Lock | S3 Object Lock |
| Veeam support | S3-compatible repo | Native + Object Lock |
| Region | EU available (GDPR) | Many regions |

**Setting up an S3-compatible repository in Veeam:**

1. Scale-out Backup Repository or S3 Object Storage repository
2. Add Cloud Provider → Amazon S3 compatible
3. Service point: s3.wasabisys.com (or region endpoint)
4. Access key / Secret key (IAM user, minimal permissions)
5. Bucket: veeam-backup-company-prod
6. Enable **Immutability** (Object Lock compliance mode)
7. Copy Job: source local repo → S3 daily

**Security:**
- Separate IAM user per Veeam
- MFA on cloud account root
- Bucket policy: deny delete before retention
- Encryption: SSE-S3 or client-side (Veeam)

**Cost estimate SMB:**
- 500 GB backups × $6/TB Wasabi ≈ $3/month storage
- Egress minimal if restore rare

> **Test:** quarterly restore one VM from S3 to isolated lab - measure RTO.`,
      code: {
        language: 'powershell',
        caption: 'AWS CLI - check bucket immutability (S3 Object Lock)',
        code: `# Проверка Object Lock на bucket
aws s3api get-object-lock-configuration --bucket veeam-backup-company-prod

# List backup objects (read-only audit)
aws s3 ls s3://veeam-backup-company-prod/ --recursive --summarize | Select-Object -Last 5

# Veeam Copy Job monitoring via PowerShell
Get-VBRComputerBackupCopyJob | Select Name, LastState, TargetRepository`,
      },
    },
    {
      title: 'Tape rotation - Grandfather-Father-Son strategy',
      content: `**Tape backup** — air-gapped last line of defense (despite “tape is dead” narrative).

**GFS Tape Rotation:**

| Level | Frequency | retention | Destination |
|---------|---------|-----------|------------|
| **Son (Daily)** | Daily | 5 tapes rotation | Weekly cycle |
| **Father (Weekly)** | Friday | 4 tapes (month) | Monthly archive |
| **Grandfather (Monthly)** | Last Friday | 12 tapes (year) | Annual compliance |

**Physical security:**
- Tapes offsite in a safe (bank box or second office)
- Fireproof safe minimum
- Chain of custody log

**Veeam Tape Job setup:**
1. Add Tape Server role
2. Add tape library (LTO-8/9)
3. Media pool: Daily, Weekly, Monthly
4. Tape Job → GFS media set
5. Export tape after write (physical remove)

**Restore from tape:**
- Catalog tape in library OR import offline tape
- File Level or Full VM restore
- RTO: hours (not minutes) — plan accordingly

**SMB reality:**
- LTO-9 drive expensive → cloud immutable replaces daily tape
- Monthly tape to vault still valuable for ransomware air-gap

> Label tapes: COMPANY-Daily-W01, COMPANY-Monthly-2025-03.`,
    },
    {
      title: 'Cyber ​​Vault - isolated storage',
      content: `**Cyber ​​Vault (Veeam Cyber ​​Vault)** - immutable offsite backup architecture with zero trust access.

**Principles:**
- Backup data **not available** production credentials
- Separate account, separate network path
- Immutability enforced at storage level
- No mount backup share on production servers

**Architecture SMB:**
\\\`\\\`\\\`
Production (Hyper-V + Veeam)
    ↓ Copy Job (dedicated creds)
Immutable S3 / Hardened Repository (Linux, single-use creds)
    ↓ Optional
Tape vault offsite
\\\`\\\`\\\`

**Veeam Hardened Repository (Linux):**
- XFS with immutability flag
- SSH key only, no password
- Veeam user cannot delete backups during retention
- Separate VLAN, firewall deny from prod

**Recovery from Cyber Vault:**
- Break-glass credentials in sealed envelope
- Restore to **isolated** network first
- Malware scan before production rejoin

**Testing:**
- Quarterly: restore random VM from vault to isolated VLAN
- Document time: copy + restore + verify

> Cyber Vault useless if production admin has same creds as vault — separate identity.`,
    },
    {
      title: 'DR Test Script - full automation',
      content: `**Quarterly DR test script** - restore check without manual chaos.

**Test phases:**
1. Select random backup (DC or file server)
2. Restore to isolated Hyper-V network (192.168.99.0/24)
3. Verify: ping, AD login, file access
4. Document RTO actual vs target
5. Cleanup restored VM

**Checklist in the script:**
- [ ] Backup age < 24h
- [ ] Restore completed without errors
- [ ] DC: dcdiag pass
- [ ] File server: test file readable
- [ ] Network isolated (no production route)
- [ ] Report emailed to IT lead`,
    },
    {
      title: 'Insurance, compliance and GDPR retention',
      content: `**Backups and regulations** - what auditors, insurers and GDPR require.

**GDPR / personal data in backups:**
- Backups contain PII → subject to retention limits
- Right to erasure: **cannot** easily delete one person from tape — plan data minimization
- Retention policy documented: «HR data 7 years, marketing 2 years»
- Encryption at rest mandatory (BitLocker, S3 SSE)
- Cross-border: EU data in EU region (Wasabi eu-central-1)

**Cyber ​​insurance:**
- Insurers require: MFA, immutable backups, tested restore
- Claim denied if no proof of backup testing
- Document quarterly DR tests → evidence for claim

**Compliance frameworks:**

| Framework | Backup requirement |
|-----------|-------------------|
| **ISO 27001** | A.12.3 backup, test restore |
| **SOC 2** | Availability, backup monitoring |
| **PCI DSS** | Encrypted backups, access control |
| **HIPAA** | 6-year retention, audit trail |
| **Russian 152-FZ** | Personal data localization |

**Retention schedule example SMB:**

| Data type | Retention | Storage |
|-----------|-----------|---------|
| AD System State | 30 days online, 1 year archive | Veeam + S3 |
| File server | 90 days online, 7 years monthly | S3 + tape |
| Email (M365) | 3 years | Veeam M365 |
| CCTV (if any) | 30 days | Separate system |

**Legal hold:**
- Litigation hold overrides normal retention
- Tag backups during legal hold — no deletion

> Consult legal before deleting backups containing employee data post-GDPR request.`,
    },
    {
      title: 'Lab: backup and restore',
      content: `**Goal:** set up a full backup → verify → restore cycle in the lab.

| Step | Action | Expected result |
|-----|----------|---------------------|
| 1 | Lab: 1 DC VM + Veeam CE installed | Veeam console accessible |
| 2 | Add Hyper-V server to Veeam | Infrastructure scanned |
| 3 | Create Backup Job per walkthrough (15 steps) | Job Success, .vbk created |
| 4 | Enable application-aware processing | VSS writers listed in log |
| 5 | Create test file on DC desktop | file-backup-test.txt |
| 6 | Run incremental backup | Size smaller than full |
| 7 | Delete test file on production VM | File gone |
| 8 | File Level Recovery → restore file | File restored in 5 min |
| 9 | Instant Recovery to isolated network | VM boots in 2 min |
| 10 | Run dcdiag on instant recovered DC | Tests pass (isolated) |
| 11 | Configure Copy Job to S3/Wasabi (or simulated) | Copy Success |
| 12 | Enable immutability on repository | Delete blocked during retention |
| 13 | Simulate failed job (wrong credentials) | Email alert received |
| 14 | Run DR test script | CSV report generated |
| 15 | Document RPO/RTO actual vs target | DR plan updated |`,
    },
    {
      title: 'FAQ - Backup and DR',
      content: `**Q1: ​​Veeam free vs paid for SMB?**
A: Community Edition free for 10 VMs/workloads. Enough for small office. Enterprise for support, tape, scale-out.

**Q2: How often should restore be tested?**
A: Critical systems quarterly minimum. DC at least twice per year.

**Q3: Backup on the same NAS as the file server - OK?**
A: No for ransomware. Separate device/account, immutable copy offsite.

**Q4: Is WSB enough for DC?**
A: Better than nothing. Veeam app-aware strongly recommended.

**Q5: Is RPO 15 min realistic for SMB?**
A: Yes with Veeam incremental every 15 min + good network. Cost: storage growth.

**Q6: Instant Recovery vs Full Restore?**
A: Instant — run from backup files, fast, temporary. Full — copy to production storage, permanent.

**Q7: How to protect Veeam from ransomware?**
A: Hardened repo, separate creds, immutability, no domain admin on Veeam server ideally.

**Q8: Does M365 need to be backed up if Microsoft stores it?**
A: Yes. Microsoft shared responsibility — accidental delete, retention gaps, legal hold.

**Q9: Tape vs cloud vault?**
A: Cloud for daily offsite. Tape for monthly air-gap optional. Many SMB skip tape now.

**Q10: Authoritative restore AD - when?**
A: Last resort. Object-level mistake → Recycle Bin first. USN rollback → authoritative.`,
    },
    {
      title: 'Typical backup errors and solutions',
      content: `| Error | Reason | Solution |
|--------|---------|---------|
| VSS writer failed | SQL/AD service stuck | Restart VSS writers, reboot, exclude conflicting backup |
| Backup job skipped | Maintenance window overlap | Reschedule, extend window |
| Repository full | Retention too long, no GFS | Expand storage, enable GFS pruning |
| Slow backup (>8h) | Proxy wrong, network 1Gbps saturated | Local proxy, 10Gbps link, exclude temp |
| Restore AD USN rollback | Restored old DC snapshot | Metadata cleanup, demote/repromote |
| Copy Job failed S3 | Wrong endpoint, credentials | Verify IAM, bucket policy |
| Immutable delete failed test | Expected — retention active | Wait retention expiry or test bucket |
| SureBackup failed | Network isolated wrong | Fix lab network, check DNS |
| M365 backup throttled | Graph API limits | Veeam proxy server, reduce parallelism |
| Tape drive dirty | Rarely cleaned | Clean tape drive, replace media |
| Ransomware encrypted NAS backup | NAS joined to domain | Hardened repo, separate credentials |
| wbadmin system state fail | Insufficient space on target | Free space 2x system state size |
| 1C backup inconsistent | VSS not supported | 1C scheduled backup + Veeam after |
| DR test VM network conflict | Same IP as production | Isolated VLAN, different subnet |
| Insurance claim denied | No restore test proof | Quarterly documented DR tests |`,
    },
    {
      title: 'Administrator\'s Day Scenarios - Backup',
      content: `**Scenario 1 - “Friday Night Ransomware”**

22:00 — SOC alert: mass file encryption on FS01. Isolate FS01 VLAN immediately. Veeam: last clean backup 4 hours ago (RPO met). Check S3 immutable copy — intact. Instant Recovery FS01 to isolated network, verify files clean. Full restore overnight. Production back Monday 10:00. RTO 36h. Post-mortem: NAS backup deleted by malware — immutable S3 saved company.

**Scenario 2 - “Auditor Monday morning”**

Auditor requests proof of backup testing. Pull DR test reports Q1-Q4, Veeam job success rate 99.2%, immutability config screenshot, GDPR retention policy document. One gap: Q2 test missing for file server — schedule emergency test same week. Audit passed with observation.

**Scenario 3 - “Accidental AD user delete”**

HR deleted wrong user. Recycle Bin — object there (< 180 days). Restore-ADObject — 2 minutes. No backup needed. If Recycle Bin disabled scenario: Veeam granular AD restore item-level — 15 minutes. Document: enable Recycle Bin if not already.`,
    },
    {
      title: 'Backup production checklist',
      content: `**Architecture:**
- [ ] 3-2-1 rule implemented
- [ ] Immutable offsite copy (S3 Object Lock or hardened repo)
- [ ] Backup credentials ≠ production domain admin
- [ ] Separate network path for backup traffic

**Jobs:**
- [ ] All critical VMs in backup jobs
- [ ] DC: app-aware daily
- [ ] Retention documented per data class
- [ ] Copy Job to offsite daily success

**Monitoring:**
- [ ] Email alert on failure within 15 min
- [ ] Daily review backup dashboard
- [ ] Repository capacity alert at 80%

**Testing:**
- [ ] Quarterly restore test scheduled
- [ ] DR tabletop annually
- [ ] RTO/RPO documented and measured

**Compliance:**
- [ ] Retention policy aligned with GDPR/legal
- [ ] Encryption at rest verified
- [ ] Access log to backup systems reviewed monthly

**Runbooks:**
- [ ] AD restore procedure printed
- [ ] Full office DR runbook accessible offline
- [ ] Break-glass credentials sealed`,
    },
    {
      title: 'Preparing for AZ-800/801 - Backup/DR',
      content: `| AZ-800 Topic | Section |
|--------------|--------|
| Implement disaster recovery | DR Plan, runbooks |
| Manage Hyper-V backups | Veeam, WSB |
| Configure Windows Server Backup | WSB section |

| AZ-801 Topic | Section |
|--------------|--------|
| Implement disaster recovery | Full DR, Cyber Vault |
| Manage backup infrastructure | Veeam architecture |
| Monitor backup and recovery | Monitoring, alerts |
| Secure backup data | Immutable, ransomware |
| Implement recovery procedures | AD restore, DR script |

**Exam focus:**
- RPO vs RTO definitions and scenarios
- AD restore types: non-authoritative vs authoritative
- Immutable backup purpose
- 3-2-1-1-0 rule`,
    },
    {
      title: 'Interview Questions - Backup',
      content: `**1. Explain the rule 3-2-1-1-0.**
3 copies, 2 media types, 1 offsite, 1 offline/air-gapped, 0 untested restores.

**2. RPO vs RTO - example for file server.**
RPO 4h = max 4 hours data loss. RTO 8h = back online within 8 hours.

**3. How is incremental different from differential?**
Incremental — changes since last backup (any). Differential — since last full.

**4. How does Veeam ensure SQL/AD consistency?**
Application-aware processing via VSS — quiesce before snapshot.

**5. Authoritative vs non-authoritative AD restore?**
Non-auth: restored DC gets updates from others. Auth: restored state wins, replicates outward — dangerous.

**6. Why immutable backup?**
Ransomware cannot encrypt or delete backups during retention period.

**7. Instant Recovery risks?**
Runs from backup files — performance limited, not permanent, backup chain locked during IR.

**8. How to test restore without downtime production?**
Restore to isolated network, verify, document. Instant Recovery to separate VLAN.

**9. WSB limitations vs Veeam?**
No central management, dedup, app-aware limited, no cloud tier native.

**10. M365 shared responsibility model?**
Microsoft: infrastructure. Customer: data protection, retention policy, accidental delete recovery.`,
    },
  ],
  practice: [
    'Determine RPO/RTO for 7 hypothetical office systems (AD, DNS, File, 1C, M365, RDS, Print). Fill out the table',
    'Setting up Windows Server Backup System State on lab DC. Check wbadmin get versions',
    'Install Veeam Community Edition, create a Backup Job for lab VM. Run it, check the repository',
    'Recover the file from Veeam backup (File Level Recovery). Document the time',
    'Restore a deleted AD user: first Recycle Bin, then authoritative restore in lab',
    'Setting up VSS Shadow Copies on file share. Delete the file, restore via Previous Versions',
    'Create a 3-page DR Plan: contacts, inventory, priorities, procedures for 3 scenarios',
    'Do a tabletop exercise (by yourself or with a colleague): ransomware script. Write down 5 action items',
    'Check: the backup is NOT on the same disk/server as the data. Draw a 3-2-1 diagram for the office',
    'Configure Veeam email notification for failed jobs. Simulate fail (disable repository), check the alert',
    'Schedule a quarterly restore test in your calendar. Create a checklist of 7 checks',
    'Compare the cost: Veeam Community vs WSB vs cloud backup for office for 3 servers + M365',
    'Complete the Veeam Job walkthrough (15 steps): app-aware, schedule, notification, test FLR',
    'Setting up S3/Wasabi Copy Job with immutability. Try deleting object - it should fail',
    'Complete the backup/restore lab (15 steps) and document the actual RTO',
  ],
  resources: [
    { title: 'Veeam University Free', url: 'https://www.veeam.com/resources/university.html' },
    { title: 'Microsoft — AD recovery', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/ad-recovery' },
    { title: 'Veeam Hardened Repository', url: 'https://helpcenter.veeam.com/docs/backup/vsphere/hardened_repository.html' },
    { title: 'Windows Server Backup', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-server-backup/install-windows-server-backup' },
    { title: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' },
    { title: 'Wasabi S3 compatibility', url: 'https://docs.wasabi.com/docs/veeam-backup-and-replication-with-wasabi' },
    { title: 'Veeam Immutable Backup', url: 'https://www.veeam.com/blog/veeam-immutable-backup.html' },
    { title: 'GDPR and backups guidance', url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/' },
  ],
  quiz: [
    {
      question: 'Rule 3-2-1 in backups:',
      options: ['3 copies, 2 media, 1 offsite', '3 servers, 2 disks, 1 tape', '3 times a day'],
      answer: '3 copies, 2 media, 1 offsite',
    },
    {
      question: 'RPO means:',
      options: ['Tolerable data loss over time', 'Service recovery time', 'Number of replicas'],
      answer: 'Tolerable data loss over time',
    },
    {
      question: 'System State backup is critical for:',
      options: ['Domain Controller', 'Printer only', 'Wi-Fi only'],
      answer: 'Domain Controller',
    },
    {
      question: 'Veeam is most often used for:',
      options: ['Image-level backup VM', 'DNS only', 'GPO only'],
      answer: 'Image-level backup VM',
    },
    {
      question: 'First priority for disaster recovery:',
      options: ['AD / DNS', 'Printers', 'Guest Wi‑Fi'],
      answer: 'AD / DNS',
    },
    {
      question: 'Immutable backup protects against:',
      options: ['Ransomware', 'Slow Internet', 'VLAN misconfiguration'],
      answer: 'Ransomware',
    },
    {
      question: 'RTO (Recovery Time Objective) is:',
      options: ['Allowable service downtime', 'Allowable data loss', 'Number of backup copies', 'Tape retention period'],
      answer: 'Allowable service downtime',
      explanation: 'RPO — how much data can be lost; RTO — how quickly to restore operations.',
    },
    {
      question: 'A restore drill is needed to:',
      options: ['Verify backups actually work', 'Speed up internet', 'Update GPO', 'Change VLAN'],
      answer: 'Verify backups actually work',
    },
    {
      question: 'First step when restoring a DC from backup:',
      answer: 'Boot into Directory Services Restore Mode (DSRM) or restore System State',
    },
    {
      question: 'An offsite backup copy is typically stored:',
      options: ['In another building/cloud, separate from production', 'On the same NAS as production', 'Only on the admin desktop', 'In Guest VLAN'],
      answer: 'In another building/cloud, separate from production',
    },
  ],
}

export default translation
