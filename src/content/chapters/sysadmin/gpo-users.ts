import type { Chapter } from '../../../types'

export const gpoUsersChapter: Chapter = {
  id: 'gpo-user-management',
  slug: 'gpo-user-management',
  title: 'GPO и управление пользователями — полное руководство',
  moduleId: 'sysadmin',
  order: 2,
  duration: '12–16 часов',
  level: 'intermediate',
  description:
    'Глубокое изучение Group Policy: GPMC, AGPM, security filtering, WMI filters, loopback, Folder Redirection, AppLocker, BitLocker, Credential Guard, onboarding/offboarding runbooks',
  sections: [
    {
      title: 'Group Policy — зачем нужна',
      content: `**GPO (Group Policy Object)** — централизованные настройки Windows для пользователей и компьютеров. Это «конфигурация как код» для Windows-офиса.

**Без GPO:**
- Вручную настраивать 50 ПК — экран блокировки, пароль, принтеры, софт
- Каждый ПК — уникальная конфигурация
- Offboarding не отзывает локальные настройки

**С GPO:**
- Одна политика на OU → применяется автоматически
- Новый ПК в OU → получает все политики при join
- Изменение политики → обновление на всех ПК за 90 мин

**Два типа настроек:**
- **Computer Configuration** — при загрузке ПК (до логина пользователя)
- **User Configuration** — при входе пользователя

**Порядок применения — LSDOU:**
1. **L**ocal — локальная политика ПК
2. **S**ite — политики уровня AD Site
3. **D**omain — политики уровня домена
4. **OU** — политики организационных единиц (последний побеждает при конфликте)

**Порядок внутри GPO:**
1. Policies (Administrative Templates) — принудительные
2. Preferences — «мягкие», пользователь может изменить (если не запрещено)

> GPO — **самый мощный** инструмент Windows-админа. Ошибка в GPO = 50 сломанных ПК. Тестируй на pilot OU.`,
    },
    {
      title: 'GPMC — полный workflow',
      content: `**Group Policy Management Console (GPMC)** — \`gpmc.msc\`. Единственный инструмент для управления GPO.

**Структура GPMC:**
- **Forest → Domain → GPOs** — все GPO домена
- **OU** — привязки GPO (links)
- **WMI Filters** — условия применения
- **Starter GPOs** — шаблоны

**Workflow создания GPO:**

| Шаг | Действие | Детали |
|-----|----------|--------|
| 1 | Планирование | Что настраиваем? Для кого? Computer или User? |
| 2 | Создание GPO | Правый клик на OU → Create a GPO in this domain |
| 3 | Именование | \`GPO-Computers-BitLocker\`, \`GPO-Users-ScreenLock\` |
| 4 | Редактирование | Edit → Computer/User Configuration |
| 5 | Привязка | Link уже создан при шаге 2 |
| 6 | Security Filtering | К каким группам применяется |
| 7 | Тестирование | Pilot OU → gpresult /h report.html |
| 8 | Production | Перенос link на production OU |

**Проверка на клиенте:**
\`gpupdate /force\` — принудительное обновление
\`gpresult /r\` — краткий отчёт
\`gpresult /h report.html\` — HTML-отчёт (открой в браузере)
\`rsop.msc\` — Resultant Set of Policy (GUI)

**Best practices именования:**
\`\`\`
GPO-[Scope]-[Purpose]
GPO-Computers-WindowsUpdate
GPO-Computers-BitLocker
GPO-Users-ScreenLock
GPO-Users-FolderRedirection
GPO-Users-DriveMaps-Sales
\`\`\`

> **Не редактируй** Default Domain Policy и Default Domain Controllers Policy без крайней необходимости. Создавай новые GPO.`,
      code: {
        language: 'powershell',
        caption: 'GPO через PowerShell (GroupPolicy module)',
        code: `Import-Module GroupPolicy
New-GPO -Name "GPO-Users-ScreenLock" | New-GPLink -Target "OU=Users,DC=company,DC=local" -LinkEnabled Yes

Get-GPO -All | Select DisplayName, GpoStatus, CreationTime, ModificationTime
Get-GPInheritance -Target "OU=Sales,OU=Users,DC=company,DC=local"
Get-GPOReport -Name "GPO-Users-ScreenLock" -ReportType Html -Path "C:\temp\gpo-report.html"`,
      },
    },
    {
      title: 'AGPM — управление изменениями GPO',
      content: `**AGPM (Advanced Group Policy Management)** — add-on для GPMC. Change control для GPO.

**Зачем AGPM:**
- Версионирование GPO (кто, когда, что изменил)
- Workflow: Edit → Submit → Approve → Deploy
- Rollback к предыдущей версии
- Разделение ролей: Editor vs Approver

**Роли AGPM:**

| Роль | Права |
|------|-------|
| **Editor** | Создание, редактирование GPO (в checkout) |
| **Reviewer** | Просмотр, сравнение версий |
| **Approver** | Утверждение и deployment |
| **Admin** | Управление ролями AGPM |

**Workflow с AGPM:**
1. Editor: Check Out GPO → редактирование → Check In
2. Editor: Submit for Approval
3. Approver: Review changes (diff) → Approve or Reject
4. GPO автоматически deploy на linked OUs

**Для SMB:** AGPM — часть MDOP (Microsoft Desktop Optimization Pack). Для офиса <100 человек достаточно дисциплины + GPO versioning через backup SYSVOL. AGPM — для enterprise с несколькими редакторами GPO.

**Альтернатива без AGPM:**
- Backup GPO перед изменением: \`Backup-GPO -Name "GPO-Name" -Path "C:\GPO-Backups"\`
- Документирование изменений в ITSM-тикете
- Pilot OU для тестирования`,
      code: {
        language: 'powershell',
        caption: 'Backup и restore GPO',
        code: `Backup-GPO -All -Path "C:\GPO-Backups\$(Get-Date -Format yyyy-MM-dd)"
Get-GPO -All | ForEach-Object { Backup-GPO -Name $_.DisplayName -Path "C:\GPO-Backups\$(Get-Date -Format yyyy-MM-dd)" }

# Restore
Restore-GPO -Name "GPO-Users-ScreenLock" -Path "C:\\GPO-Backups\\2025-03-15\\GPO-GUID-FOLDER"

# Сравнение двух GPO
Compare-GPO -Name "GPO-Users-ScreenLock" -BaseGPOVersion $null -TargetGPOVersion $null`,
      },
    },
    {
      title: 'Security Filtering и WMI Filters',
      content: `**Security Filtering** — контроль, к кому применяется GPO.

**По умолчанию:** GPO применяется к Authenticated Users (все).

**Как ограничить:**
1. Удали Authenticated Users из Security Filtering
2. Добавь нужную группу: G_Sales, G_IT, G_Laptops
3. Права: Read + Apply Group Policy

**Пример:** GPO-Users-DriveMaps-Sales применяется только к G_Sales:
- Security Filtering: G_Sales (Read + Apply)
- Link на OU=Users (или OU=Sales)

**WMI Filters** — применение GPO по условию WMI-запроса:

| Фильтр | WMI Query | Применение |
|--------|-----------|------------|
| Только ноутбуки | BatteryStatus | BitLocker GPO |
| Windows 11 | Version >= 10.0.22000 | Win11-specific policies |
| >8 GB RAM | TotalPhysicalMemory > 8GB | Heavy software GPO |
| SSD only | MediaType = 4 | Оптимизации для SSD |

**Создание WMI Filter в GPMC:**
1. WMI Filters → New
2. Namespace: \`root\\cimv2\`
3. Query: \`SELECT * FROM Win32_Battery\` (ноутбуки)
4. Привязать к GPO

> **Внимание:** WMI Filters замедляют применение GPO (WMI query при каждом refresh). Используй OU + Security Filtering где возможно.`,
      code: {
        language: 'powershell',
        caption: 'Security Filtering через PowerShell',
        code: `Set-GPPermissions -Name "GPO-Users-DriveMaps-Sales" -TargetName "G_Sales" -TargetType Group -PermissionLevel GpoApply
Set-GPPermissions -Name "GPO-Users-DriveMaps-Sales" -TargetName "Authenticated Users" -TargetType Group -PermissionLevel GpoRead -Replace

Get-GPPermission -Name "GPO-Users-DriveMaps-Sales" | Select Trustee, Permission`,
      },
    },
    {
      title: 'Loopback Processing Mode',
      content: `**Loopback Processing** — применение Computer GPO к пользователям, вошедшим на этот ПК.

**Зачем:**
- Терминальный сервер (RDS) — одинаковые настройки для всех пользователей
- Kiosk / общий ПК — настройки зависят от ПК, не от пользователя
- Computer Lab — фиксированная конфигурация

**Два режима:**

| Режим | Поведение |
|-------|-----------|
| **Replace** | User GPO полностью заменяется Computer GPO |
| **Merge** | User GPO + Computer GPO (Computer побеждает при конфликте) |

**Настройка:**
Computer Configuration → Policies → Administrative Templates → System → Group Policy → Configure user Group Policy loopback processing mode

**Реальный сценарий SMB:**
- RDS сервер: loopback Replace → все пользователи получают одинаковые принтеры, drive maps
- Ресепшн (kiosk): loopback Replace → ограниченный рабочий стол, нет доступа к настройкам

> **Не включай** loopback на обычных рабочих станциях — сломает персональные User GPO.`,
    },
    {
      title: 'Политики паролей и блокировки',
      content: `**Password Policy** — через Default Domain Policy или отдельную GPO на уровне домена.

| Параметр | Путь в GPO | Рекомендация SMB |
|----------|-----------|-----------------|
| Minimum password length | Account Policies → Password Policy | 12+ символов |
| Password complexity | Account Policies → Password Policy | Enabled |
| Maximum password age | Account Policies → Password Policy | 90 дней или 0 (never) |
| Account lockout threshold | Account Policies → Account Lockout | 5 попыток |
| Lockout duration | Account Policies → Account Lockout | 30 минут |
| Reset lockout counter | Account Policies → Account Lockout | 30 минут |

**Fine-Grained Password Policies (FGPP):**
- Не через GPO, а через AD (см. главу AD)
- Для разных групп: админы, сервисные учётки, обычные пользователи

**Interactive logon:**
- Computer Configuration → Windows Settings → Security Settings → Local Policies → Security Options
- Interactive logon: Message text — «Это система компании. Несанкционированный доступ запрещён»
- Interactive logon: Machine inactivity limit — 900 сек (15 мин)

**Современный подход:** длинные пароли + MFA (Azure MFA, Windows Hello) вместо частой смены.`,
    },
    {
      title: 'Folder Redirection',
      content: `**Folder Redirection** — перенаправление папок пользователя (Documents, Desktop, Pictures) на file server.

**Зачем:**
- Данные на сервере → бэкапится Veeam
- Roaming: пользователь логинится на любом ПК → его файлы на месте
- Ransomware: серверные данные защищены VSS/immutable backup

**Настройка через GPO:**
User Configuration → Policies → Windows Settings → Folder Redirection

| Папка | Путь на сервере | Рекомендация |
|-------|----------------|-------------|
| Documents | \\\\fileserver\\users\\%username%\\Documents | Обязательно |
| Desktop | \\\\fileserver\\users\\%username%\\Desktop | Рекомендуется |
| Pictures | \\\\fileserver\\users\\%username%\\Pictures | Опционально |
| AppData | Не перенаправлять | Проблемы с профилями |

**Settings:**
- Basic: Redirect everyone's folder to same location → \\\\fileserver\\users\\%username%\\Documents
- Grant user exclusive rights: Yes
- Move contents: Yes (при первом применении)
- Policy Removal: Leave contents (при отключении GPO)

**Offline Files:** кэш на ноутбуке для работы без сети. Настраивай размер кэша.

**Реальный кейс:** бухгалтер сменил ПК → Folder Redirection → все документы на месте без копирования.`,
      code: {
        language: 'powershell',
        caption: 'Проверка Folder Redirection на клиенте',
        code: `# На клиенте — куда перенаправлены папки
gpresult /scope user /v | Select-String "Folder Redirection"

# Проверка доступности share
Test-Path "\\\\fileserver\\users\\$env:USERNAME\\Documents"

# Offline Files status
Sync-Object -ObjectType OfflineFiles`,
      },
    },
    {
      title: 'AppLocker — контроль приложений',
      content: `**AppLocker** — whitelist приложений через GPO. Только разрешённые программы могут запускаться.

**Зачем:**
- Защита от malware (пользователь не запустит .exe из Downloads)
- Compliance: только утверждённый софт
- Лицензионный контроль

**Правила AppLocker (по приоритету):**
1. **Publisher Rules** — по цифровой подписи (лучший вариант)
2. **Path Rules** — по пути (C:\\Program Files\\*)
3. **Hash Rules** — по хешу файла (для неподписанных)

**Типовая конфигурация SMB:**
- Allow: C:\\Program Files\\*, C:\\Windows\\*
- Allow: Publisher = Microsoft, Google, Adobe
- Deny: %TEMP%\\*, %Downloads%\\*.exe
- Audit mode сначала! (Правило → создать → Audit, не Enforce)

**Настройка:**
Computer Configuration → Policies → Windows Settings → Security Settings → Application Control Policies → AppLocker

**Требования:**
- Windows Enterprise или Education (не Home/Pro для enforce)
- Application Identity service — Automatic

> **Всегда** начинай с Audit mode на pilot OU. 2 недели сбора логов → анализ → Enforce.`,
      code: {
        language: 'powershell',
        caption: 'AppLocker — просмотр правил и логов',
        code: `Get-AppLockerPolicy -Effective -Xml
Get-AppLockerPolicy -Local | Test-AppLockerPolicy -Path "C:\Users\test\Downloads\malware.exe"

# Логи AppLocker (Event Viewer → Application and Services Logs → Microsoft → Windows → AppLocker)
Get-WinEvent -LogName "Microsoft-Windows-AppLocker/EXE and DLL" -MaxEvents 20 | Select TimeCreated, Id, Message`,
      },
    },
    {
      title: 'BitLocker через GPO',
      content: `**BitLocker Drive Encryption** — шифрование дисков через GPO. Обязательно для ноутбуков.

**Настройка через GPO:**
Computer Configuration → Policies → Administrative Templates → Windows Components → BitLocker Drive Encryption

| Политика | Значение | Зачем |
|----------|---------|-------|
| Require additional authentication at startup | Enabled, TPM | Без TPM — USB key |
| Choose drive encryption method | XTS-AES 256-bit | Современный стандарт |
| Configure storage card encryption | Force encryption | SD-карты тоже |
| OS drives: recovery options | Save to AD | Восстановление через AD |
| Fixed drives: encryption method | XTS-AES 256-bit | Данные |

**BitLocker Recovery Key в AD:**
- Автоматическое сохранение recovery password в AD
- Helpdesk может восстановить доступ без переустановки
- \`Get-ADObject -Filter {objectClass -eq 'msFVE-RecoveryInformation'}\`

**MBAM (Microsoft BitLocker Administration and Monitoring):**
- Централизованное управление, отчёты compliance
- Для enterprise; SMB — достаточно GPO + AD recovery

**Реальный кейс:** ноутбук украден → BitLocker → данные недоступны. Recovery key в AD → при необходимости восстановления на новом диске.`,
      code: {
        language: 'powershell',
        caption: 'BitLocker статус и recovery key',
        code: `Get-BitLockerVolume | Select MountPoint, VolumeStatus, EncryptionPercentage, ProtectionStatus

# Recovery key из AD
Get-ADObject -Filter 'objectClass -eq "msFVE-RecoveryInformation"' -SearchBase (Get-ADComputer "LAPTOP-IVAN01").DistinguishedName -Properties msFVE-RecoveryPassword | Select msFVE-RecoveryPassword

# Принудительное шифрование (если GPO применена, но не зашифровано)
Manage-bde -on C: -used`,
      },
    },
    {
      title: 'Credential Guard и Device Guard',
      content: `**Credential Guard** — изоляция секретов (NTLM hashes, Kerberos tickets) в виртуализированном Secure World. Защита от Pass-the-Hash.

**Требования:**
- Windows 10/11 Enterprise или Server 2016+
- UEFI, Secure Boot, TPM 2.0, Virtualization-based security (VBS)
- 64-bit CPU с SLAT

**Настройка через GPO:**
Computer Configuration → Policies → Administrative Templates → System → Device Guard
- Turn On Virtualization Based Security: Enabled
- Credential Guard: Enabled with UEFI lock

**Device Guard / WDAC (Windows Defender Application Control):**
- Whitelist приложений на уровне ядра (сильнее AppLocker)
- Для высокобезопасных сред (Tier 0 PAW)

**Для SMB:**
- Credential Guard: включай на всех рабочих станциях (если железо поддерживает)
- Device Guard: опционально, AppLocker достаточно для большинства

> Проверь совместимость: \`msinfo32\` → Virtualization-based security → Running`,
    },
    {
      title: 'GPO Preferences и скрипты',
      content: `**Group Policy Preferences (GPP)** — расширенные настройки без ADMX-шаблонов.

**Популярные Preferences:**

| Preference | Назначение | Пример |
|-----------|------------|--------|
| Drive Maps | Сетевые диски | Z: → \\\\fileserver\\sales |
| Printers | Принтеры | Default printer по OU |
| Shortcuts | Ярлыки | Intranet на рабочем столе |
| Registry | Ключи реестра | Настройка приложения |
| Scheduled Tasks | Задачи | Очистка temp |
| Local Users and Groups | Локальные группы | Добавить Domain Admins в Administrators |
| Environment Variables | Переменные | APP_SERVER=192.168.10.20 |
| Files | Копирование файлов | Конфиг на ПК |
| Folders | Создание папок | C:\\CompanyApp\\logs |

**Item-Level Targeting:** каждый item может иметь условие (группа, OU, IP, WMI).

**Logon/Startup Scripts:**
- User Configuration → Scripts → Logon
- Computer Configuration → Scripts → Startup
- Предпочтительно PowerShell (.ps1) из \\\\fileserver\\scripts

**Опасность GPP Passwords:**
- GPP мог хранить пароли в SYSVOL (зашифрованы, но расшифровываются!)
- **Никогда** не храни пароли в GPP Preferences
- Используй gMSA или LAPS`,
      codes: [
        {
          language: 'powershell',
          caption: 'Drive Maps через GPP (PowerShell альтернатива)',
          code: `# GPP Drive Map настраивается в GPMC GUI
# PowerShell альтернатива (logon script):
if ((Get-ADPrincipalGroupMembership $env:USERNAME).Name -contains "G_Sales") { New-PSDrive -Name "Z" -PSProvider FileSystem -Root "\\fileserver\sales" -Persist }

# Scheduled Task через GPP — пример скрипта очистки
Get-ChildItem $env:TEMP -Recurse -Force -ErrorAction SilentlyContinue | Where {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | Remove-Item -Force -Recurse`,
        },
      ],
    },
    {
      title: 'Windows Update через GPO',
      content: `**Управление обновлениями Windows через GPO** — критично для стабильности офиса.

**Основные политики:**
Computer Configuration → Policies → Administrative Templates → Windows Components → Windows Update

| Политика | Значение | Зачем |
|----------|---------|-------|
| Configure Automatic Updates | Enabled, Auto download and schedule install | Контроль времени |
| No auto-restart with logged on users | Enabled | Не перезагружать при работе |
| Specify intranet Microsoft update service | http://SRV-WSUS01:8530 | WSUS |
| Target group name | Pilot / Production | Кольца обновлений |
| Defer feature updates | 30 days | Тестирование |
| Defer quality updates | 7 days | Тестирование |

**Кольца обновлений (rings):**
1. GPO → WSUS Target Group: Pilot → OU=IT
2. GPO → WSUS Target Group: Production → OU=Computers (кроме IT)
3. WSUS: Approve updates для Pilot → через 1 неделю для Production

**Реальный кейс:** KB ломает VPN → Pilot ring получил KB → IT заметил → Production ring не получил → бизнес не пострадал.`,
    },
    {
      title: 'Делегирование и аудит GPO',
      content: `**Delegation в GPMC:**
- Правый клик на GPO → Delegate
- IT L2: Edit settings, Read (без Apply — если нужно)
- Helpdesk: Read only (gpresult, но не edit)

**Аудит изменений GPO:**
- Event ID 5136, 5137, 5141 — Directory Service (изменения GPO в AD)
- Event ID 4004, 4005 — Group Policy operational log
- AGPM changelog (если используется)

**Опасные GPO (никогда не делай!):**
- Отключение UAC
- «Always install with elevated privileges»
- Logon scripts с Domain Admin creds
- GPP Passwords с паролями
- Отключение Windows Firewall
- AppLocker Deny all (без тестирования)

**GPO Central Store:**
- \\\\company.local\\SYSVOL\\company.local\\Policies\\PolicyDefinitions
- Скопируй ADMX/ADML файлы с Windows 10/11 ISO
- Все DC используют единые шаблоны
- Chrome, Edge, Office ADMX — скачай с сайтов вендоров`,
      code: {
        language: 'powershell',
        caption: 'Central Store и ADMX',
        code: `# Создание Central Store (на DC)
$centralStore = "\\$((Get-ADDomain).DNSRoot)\SYSVOL\$((Get-ADDomain).DNSRoot)\Policies\PolicyDefinitions"
New-Item -Path $centralStore -ItemType Directory -Force
Copy-Item -Path "C:\Windows\PolicyDefinitions\*" -Destination $centralStore -Recurse -Force

# Проверка
Test-Path "$centralStore\windows.admx"`,
      },
    },
    {
      title: 'Onboarding Runbook',
      content: `**Runbook: новый сотрудник (onboarding)**

| # | Шаг | Ответственный | Инструмент | Время |
|---|------|--------------|-----------|-------|
| 1 | Создать AD user | IT Admin | ADUC / PowerShell | 5 мин |
| 2 | Задать OU (отдел) | IT Admin | ADUC | 1 мин |
| 3 | Добавить в группы | IT Admin | ADUC / PowerShell | 5 мин |
| 4 | Лицензия M365 | IT Admin | M365 Admin Center | 5 мин |
| 5 | Подготовить ПК | IT / Helpdesk | MDT / Intune / вручную | 30–60 мин |
| 6 | Join to domain | IT | Settings / PowerShell | 5 мин |
| 7 | Переместить ПК в OU | IT | ADUC | 1 мин |
| 8 | GPO applied (gpupdate) | Автоматически | GPO | 5 мин |
| 9 | MFA enrollment | User + IT | Azure MFA / Windows Hello | 10 мин |
| 10 | VPN profile | IT | GPO / Intune / вручную | 5 мин |
| 11 | Почта, Teams, 1С | IT / User | M365, 1С admin | 15 мин |
| 12 | Документация | IT | ITSM ticket | 5 мин |

**Группы для нового sales-менеджера:**
- G_Sales (отдел)
- G_VPN (удалённый доступ)
- DL_Share_Sales_RW (файлы)
- G_M365_E3 (лицензия)
- G_Sales_Printers (принтеры)

**GPO, которые применятся автоматически:**
- GPO-Users-ScreenLock (OU=Users)
- GPO-Users-DriveMaps-Sales (Security Filtering: G_Sales)
- GPO-Computers-BitLocker (OU=Computers)
- GPO-Computers-WindowsUpdate (OU=Computers)`,
      code: {
        language: 'powershell',
        caption: 'Onboarding скрипт — создание пользователя',
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
      content: `**Runbook: увольнение сотрудника (offboarding) — КРИТИЧНО!**

| # | Шаг | Срочность | Инструмент |
|---|------|----------|-----------|
| 1 | **Disable AD account** | Немедленно | ADUC / PowerShell |
| 2 | **Reset password** | Немедленно | PowerShell |
| 3 | **Revoke sessions** | Немедленно | Azure AD / Revoke-ADUserAllRefreshTokens |
| 4 | Remove from all groups (кроме Domain Users) | В тот же день | PowerShell |
| 5 | Move to OU=Disabled | В тот же день | ADUC |
| 6 | Convert mailbox to shared | 1–3 дня | M365 Admin |
| 7 | Set email forward to manager | 1–3 дня | M365 Admin |
| 8 | Wipe mobile device | Немедленно | Intune |
| 9 | Collect equipment (ПК, телефон, badge) | 1–7 дней | HR + IT |
| 10 | Remove VPN access | Немедленно | Firewall / VPN |
| 11 | Audit file access (кто владелец?) | 1–7 дней | File server |
| 12 | Delete account | 30–90 дней | ADUC (после аудита) |

**Что будет, если забудешь disable:**
- Бывший сотрудник заходит в систему
- Доступ к файлам, почте, VPN
- Потенциальная утечка данных

**Реальный кейс:** уволенный сотрудник зашёл через VPN через 2 недели — учётка не была disabled. Аудит показал скачивание файлов. Урок: disable **в момент** уведомления HR.`,
      code: {
        language: 'powershell',
        caption: 'Offboarding скрипт — полная блокировка',
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
      content: `**GPO не применяется — чеклист:**

| # | Проверка | Команда |
|---|----------|---------|
| 1 | GPO linked? | GPMC → OU → Linked GPOs |
| 2 | GPO enabled? | GPMC → GPO Status |
| 3 | Link enabled? | GPMC → Link enabled |
| 4 | Security Filtering? | GPMC → Delegation tab |
| 5 | WMI Filter? | GPMC → WMI Filter on GPO |
| 6 | Block Inheritance? | GPMC → OU → Block Inheritance |
| 7 | Enforced? | GPMC → Link → Enforced |
| 8 | gpupdate выполнен? | \`gpupdate /force\` |
| 9 | Перелогин? | User GPO требует logoff/logon |
| 10 | Перезагрузка? | Computer GPO требует reboot |

**Команды диагностики:**
\`gpresult /r\` — краткий отчёт
\`gpresult /h report.html\` — полный HTML
\`gpresult /scope computer /z\` — все Computer GPO (verbose)
\`rsop.msc\` — GUI resultant policy

**Event Logs:**
- Application and Services Logs → Microsoft → Windows → Group Policy → Operational
- Event 4004: GPO applied successfully
- Event 5017: GPO link disabled
- Event 8004: GPO denied by WMI filter

**Типичные проблемы SMB:**

| Проблема | Причина | Решение |
|----------|---------|---------|
| Drive map не появился | User GPO, не перелогинился | gpupdate + logoff |
| BitLocker не включился | Нет TPM, GPO требует TPM | Изменить GPO |
| AppLocker блокирует софт | Слишком строгие правила | Audit mode, добавить правило |
| Медленный логин | Много GPO, WMI filters | Оптимизировать, убрать WMI |`,
      code: {
        language: 'powershell',
        caption: 'Диагностика GPO на клиенте',
        code: `gpresult /h C:\temp\gp-report.html
gpresult /scope user /v | Select-String "Applied Group Policy"
gpresult /scope computer /v | Select-String "Applied Group Policy"

Get-WinEvent -LogName "Microsoft-Windows-GroupPolicy/Operational" -MaxEvents 20 | Where-Object {$_.Id -in 4004,5017,8004,8005} | Select TimeCreated, Id, Message`,
      },
    },
    {
      title: 'GPO для RDS и терминальных серверов',
      content: `**Remote Desktop Services (RDS)** — особые требования к GPO.

**Обязательные GPO для RDS:**
- Loopback Processing: Replace (на OU терминальных серверов)
- Session timeout: Disconnect session after 8 hours
- Remove disconnect menu (опционально)
- Printer redirection: настроить default printer
- Drive redirection: разрешить/запретить

**Лицензирование RDS:**
- RDS CAL — отдельно от Windows Server CAL
- Per User или Per Device RDS CAL
- RD Licensing server — GPO для указания license server

**Политики RDS:**
Computer Configuration → Policies → Administrative Templates → Windows Components → Remote Desktop Services

| Политика | Значение |
|----------|---------|
| Limit number of connections | По лицензии |
| Set time limit for disconnected sessions | 8 hours |
| Do not allow drive redirection | No (разрешить) |
| Always prompt for password upon connection | Yes |

**Реальный сценарий:** 10 бухгалтеров работают на RDS → loopback GPO → одинаковые 1С, Excel, принтеры → IT управляет одним сервером вместо 10 ПК.`,
    },
    {
      title: 'Пути настроек GPO — User Configuration',
      content: `**User Configuration → Policies → Administrative Templates** — основные пути для пользовательских политик.

| Категория | Путь | Типовые настройки |
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

| Путь | Назначение |
|------|------------|
| **Security Settings** | User rights (logon locally), restricted groups |
| **Scripts (Logon/Logoff)** | PowerShell/VBS at logon |
| **Internet Explorer Maintenance** | Legacy IE settings |
| **Folder Redirection** | Documents, Desktop → file server |

**User Configuration → Preferences:**
- Drive Maps, Printers, Shortcuts, Registry, Environment
- «Apply once and do not reapply» — для one-time setup
- Item-level targeting — по group, IP, registry

**Computer Configuration paths (reference):**
Computer Config → Policies → Admin Templates → Windows Components → Windows Update
Computer Config → Policies → Windows Settings → Security Settings → BitLocker Drive Encryption

> **Naming in GPMC:** полный path виден в Explain tab каждой политики.`,
    },
    {
      title: 'Пути настроек GPO — Computer Configuration',
      content: `**Computer Configuration → Policies → Administrative Templates** — политики уровня ПК.

| Категория | Путь | SMB настройки |
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

| Раздел | Ключевые политики |
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
- Startup / Shutdown — для deploy software, registry

> Default Domain Policy — только password policy. Всё остальное — отдельные GPO.`,
    },
    {
      title: 'LGPO — offline Group Policy',
      content: `**LGPO.exe (Local Group Policy Object utility)** — Microsoft tool для backup/apply GPO без domain на standalone или air-gapped ПК.

**Сценарии:**
- Workgroup machines
- DMZ servers без domain join
- Baseline export from reference GPO → import offline
- Disaster recovery без DC

**Команды LGPO:**

| Команда | Назначение |
|---------|------------|
| \`LGPO.exe /b path\` | Backup local policy |
| \`LGPO.exe /g path\` | Apply policy from folder |
| \`LGPO.exe /s\` | Export security template |

**Workflow:**
1. На reference machine: configure baseline GPO settings locally
2. \`LGPO.exe /b C:\\\\LGPO-Backup\`
3. Copy folder to target machines (USB, SCCM package)
4. \`LGPO.exe /g C:\\\\LGPO-Backup\`
5. gpupdate /force

**Security Compliance Toolkit:**
- Microsoft bundles LGPO + baselines (Windows 10/11, Server)
- Download ZIP, apply recommended baseline

**Limitations:**
- No Preferences (only Policies)
- No central reporting
- Overwrites local policy completely on /g

> Для 5 workgroup PCs в lab — LGPO быстрее чем manual local policy.`,
      code: {
        language: 'powershell',
        caption: 'LGPO deployment script',
        code: `# Скачай LGPO.exe из Microsoft Security Compliance Toolkit
$lgpoPath = "C:\\\\Tools\\\\LGPO.exe"
$backupPath = "\\\\fileserver\\it\\LGPO-Baseline"

& $lgpoPath /g $backupPath /v
gpupdate /force

# Verify applied settings
secedit /export /cfg C:\\\\Temp\\\\secpol-export.cfg
Get-Content C:\\\\Temp\\\\secpol-export.cfg | Select-String "PasswordHistorySize"`,
      },
    },
    {
      title: 'Policy Analyzer — сравнение GPO',
      content: `**Policy Analyzer** — Microsoft tool для анализа и сравнения effective policy across machines/GPOs.

**Возможности:**
- Import multiple GPO backups or live exports
- Highlight differences between policies
- Export to Excel for compliance audit
- Detect conflicting settings

**Workflow compliance audit:**
1. \`Backup-GPO -All -Path C:\\\\GPO-Audit\\\\$(Get-Date -Format yyyy-MM-dd)\`
2. Policy Analyzer → Add files from backup
3. Compare «Production Baseline» vs «Current State»
4. Export diff report for management

**Альтернативы:**
- **Microsoft Security Compliance Toolkit** — PolicyAnalyzer.exe included
- **GPResult /H** — per-machine snapshot
- **Advanced Group Policy Management (AGPM)** — version diff in enterprise

**Типичные findings:**
- BitLocker GPO disabled on Laptops OU by mistake
- Conflicting password policy (domain vs FGPP)
- AppLocker audit mode left for 2 years
- WSUS server IP changed, GPO not updated

> Quarterly: run Policy Analyzer diff against CIS baseline GPO export.`,
    },
    {
      title: 'Onboarding Runbook — 30 шагов',
      content: `**Полный runbook приёма сотрудника (Sales department example):**

| # | Шаг | Ответственный | SLA |
|---|------|---------------|-----|
| 1 | HR ticket с ФИО, должность, start date | HR | D-5 |
| 2 | Generate SamAccountName по convention | IT | D-3 |
| 3 | Create AD user в OU=Sales,OU=Users | IT | D-3 |
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
| 14 | Prepare laptop from OU=Computers\\Laptops | IT | D-2 |
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

> Temp password — только через secure channel (не email plaintext).`,
    },
    {
      title: 'Offboarding Runbook — 30 шагов',
      content: `**Полный runbook увольнения сотрудника:**

| # | Шаг | Приоритет | SLA |
|---|------|-----------|-----|
| 1 | HR notification с last day (immediate if termination) | Critical | Day 0 |
| 2 | **Disable AD account** (не delete!) | **Немедленно** | 0 min |
| 3 | Reset password to random 32 char | **Немедленно** | 0 min |
| 4 | Move user to OU=Disabled | **Немедленно** | 15 min |
| 5 | Remove from all groups except Domain Users | **Немедленно** | 15 min |
| 6 | Block sign-in M365 (BlockCredential) | **Немедленно** | 15 min |
| 7 | Revoke all active sessions (Revoke-AzureADUserAllRefreshToken) | **Немедленно** | 15 min |
| 8 | Convert mailbox to shared OR forward | High | 1 hr |
| 9 | Remove M365 license (after 30-day retention) | Low | D+30 |
| 10 | Wipe mobile devices (Intune remote wipe) | **Немедленно** | 1 hr |
| 11 | Disable VPN access | **Немедленно** | 15 min |
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
      content: `**Отчётность по compliance GPO** — доказательство для аудита ISO, SOC2, GDPR.

**Источники данных:**

| Источник | Что показывает |
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

| Требование | GPO / Check |
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
$reportPath = "\\\\fileserver\\it\\GPO-Reports\\$date"
New-Item -Path $reportPath -ItemType Directory -Force

Get-GPO -All | ForEach-Object {
  Get-GPOReport -Guid $_.Id -ReportType Html -Path "$reportPath\\$($_.DisplayName).html"
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
$results | Export-Csv "$reportPath\\bitlocker-compliance.csv" -NoTypeInformation`,
      },
    },
    {
      title: 'Лабораторная работа: GPO end-to-end',
      content: `**Цель:** создать, протестировать и задокументировать набор GPO для OU=Lab.

| Шаг | Действие | Ожидаемый результат |
|-----|----------|---------------------|
| 1 | Создай OU=Lab,OU=Users и OU=Lab,OU=Computers | OUs visible in ADUC |
| 2 | GPO-Computers-Baseline: disable USB storage | DevMgmt blocks USB |
| 3 | GPO-Users-ScreenLock: 5 min idle | Screen locks on test user |
| 4 | Security Filtering: GPO-Users-ScreenLock → G_Lab_Users only | Other users unaffected |
| 5 | WMI Filter: apply BitLocker GPO only if chassis=laptop | Desktop skips BitLocker |
| 6 | GPO Preferences: map drive H: to \\\\fileserver\\lab | Drive visible after gpupdate |
| 7 | Link GPOs in correct order (baseline first, specific last) | LSDOU verified in gpresult |
| 8 | gpupdate /force on test PC | Policies applied |
| 9 | gpresult /h lab-report.html | HTML shows all settings |
| 10 | rsop.msc — verify computer and user sections | GUI matches gpresult |
| 11 | Backup all lab GPO: Backup-GPO -All | Folder in C:\\\\GPO-Backups |
| 12 | Policy Analyzer: import backup, export Excel | Diff report saved |
| 13 | Simulate conflict: two GPOs set different screen timeout | Document winner (LSDOU) |
| 14 | LGPO: export from lab PC, apply to workgroup VM | Offline policy works |
| 15 | Document GPO naming convention for your org | 1-page standard |`,
    },
    {
      title: 'FAQ — Group Policy',
      content: `**Q1: GPO не применяется — первые 3 проверки?**
A: gpresult /r, verify link enabled, security filtering group membership, computer in correct OU.

**Q2: Preferences vs Policies — в чём разница?**
A: Policies — registry keys удаляются при un-link. Preferences — «tattoo», могут остаться.

**Q3: Как исключить одного пользователя из GPO?**
A: Security Filtering — deny Apply Group Policy (осторожно!) или WMI filter, или separate OU.

**Q4: Loopback Merge vs Replace?**
A: Replace — only computer GPO user settings. Merge — computer + user combined, computer wins conflicts.

**Q5: Как ускорить boot/login с многими GPO?**
A: Reduce WMI filters, disable unused extensions, use Fast Logon Optimization (careful), split GPOs logically.

**Q6: Central Store — зачем?**
A: ADMX templates in SYSVOL — consistent admin templates all editors.

**Q7: Можно ли GPO on workgroup?**
A: Local Group Policy only. LGPO for bulk. No domain GPO.

**Q8: AppLocker vs Software Restriction Policies?**
A: AppLocker — modern, Win7+. SRP legacy. Use AppLocker.

**Q9: Как откатить GPO изменение?**
A: Restore-GPO from backup, or AGPM rollback, or manually revert setting.

**Q10: GPO и Intune conflict?**
A: Intune MDM wins for enrolled devices on conflict (MDM policy). Use co-management or choose one.`,
    },
    {
      title: 'Типовые ошибки GPO и решения',
      content: `| Ошибка | Причина | Решение |
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
      title: 'Сценарии «день администратора» — GPO',
      content: `**Сценарий 1 — «После GPO change — Excel не открывается»**

CFO звонит в панике. Вчера включили AppLocker enforce mode. Event 8004 on CFO PC: excel.exe blocked (wrong path rule — Office Click-to-Run path). Emergency: create new allow rule for Office16 path, gpupdate on CFO PC. Post-incident: pilot OU next time, keep audit mode 2 weeks.

**Сценарий 2 — «Новый офис, 20 ПК за день»**

Imaging 20 PCs, join OU=Workstations\\NewOffice. Zero touch: BitLocker, Wi‑Fi, drive maps, printers — all GPO. One PC gpresult reference saved. Issue: WMI filter excluded 3 PCs (wrong manufacturer). Fix filter, reapply. 18/20 perfect, 2 manual — acceptable.

**Сценарий 3 — «Audit ISO — докажите screen lock»**

Auditor requests evidence. Export Get-GPOReport for GPO-Users-ScreenLock, GPResult from 10 random PCs via script, Event 4801/4802 lock events from WEF. Compliance report: 98% compliant, 2 PCs offline — documented. Passed audit.`,
    },
    {
      title: 'Чеклист GPO production',
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
      title: 'Подготовка к AZ-800/801 — GPO',
      content: `| AZ-800 Topic | Раздел |
|--------------|--------|
| Configure Group Policy | GPMC workflow, LSDOU |
| Manage GPO scope | Security Filtering, WMI |
| Troubleshoot GPO | Troubleshooting, FAQ |
| Implement Folder Redirection | FR раздел |
| Configure Windows Server security | BitLocker, AppLocker GPO |

| AZ-801 Topic | Раздел |
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
      title: 'Вопросы с собеседования — GPO',
      content: `**1. Что такое LSDOU?**
Local, Site, Domain, OU — order of GPO application. Last writer wins on conflict at same level.

**2. Как работает Security Filtering?**
GPO applies only if user/computer has Read + Apply Group Policy permission in GPO delegation.

**3. Loopback processing — когда нужен?**
Terminal servers, kiosk PCs — need user settings from computer OU regardless of user OU.

**4. Чем отличается Enforced (No Override)?**
GPO at higher level cannot be overridden by lower GPO. Use sparingly.

**5. Как работает Block Inheritance?**
OU ignores inherited GPO from parent. Exceptions for specific GPO with Enforced.

**6. Central Store location?**
\\\\domain.local\\SYSVOL\\domain.local\\Policies\\PolicyDefinitions

**7. Что такое WMI filter?**
Query (WQL) evaluated on client — GPO applies only if query returns true.

**8. Folder Redirection — что происходит offline?**
Files cached locally (offline files), sync on reconnect.

**9. Как troubleshoot slow GPO?**
GPSVC log, enable Group Policy operational log, count GPO extensions, check network to DC.

**10. AGPM vs Backup-GPO?**
AGPM — version control workflow in production. Backup-GPO — point-in-time backup, good for SMB.`,
    },
  ],
  practice: [
    'Создай GPO: экран блокировки через 10 мин, пароль для пробуждения. Привяжи к OU=Users, проверь gpresult',
    'GPO Preferences: подключи сетевой диск Z: для группы G_Sales через Security Filtering',
    'Настрой политику паролей: 12 символов, блокировка после 5 попыток, lockout 30 мин',
    'На клиенте: gpresult /h report.html — изучи все применённые политики, объясни порядок LSDOU',
    'Настрой Folder Redirection для Documents на \\\\fileserver\\users\\%username%\\Documents',
    'Создай AppLocker правило в Audit mode: разрешить C:\\Program Files\\*, C:\\Windows\\*. Проверь логи через 1 день',
    'Настрой BitLocker GPO для OU=Laptops: TPM required, recovery key to AD. Проверь на тестовом ноутбуке',
    'Создай logon script (PowerShell): запись времени входа в \\\\fileserver\\logs\\logon.csv',
    'Спроектируй GPO naming convention для офиса: 8 GPO с именами и назначением',
    'Напиши onboarding runbook на 1 страницу: 12 шагов для нового сотрудника Sales',
    'Напиши offboarding runbook на 1 страницу: 12 шагов, отметь «немедленно» vs «в течение недели»',
    'Настрой GPO Central Store, импортируй ADMX для Google Chrome. Создай GPO с политикой Chrome',
    'Пройди лабораторную GPO end-to-end (15 шагов): Security Filtering, WMI, Preferences, backup',
    'Примени LGPO baseline на workgroup VM, сравни secedit export с domain GPO',
    'Сгенерируй compliance report: Get-GPOReport -All + BitLocker status CSV с 5 ПК',
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
}
