import type { Chapter } from '../../../types'

export const windowsServerChapter: Chapter = {
  id: 'windows-server-basics',
  slug: 'windows-server-basics',
  title: 'Windows Server — полное руководство',
  moduleId: 'sysadmin',
  order: 0,
  duration: '12–16 часов',
  level: 'beginner',
  description:
    'Глубокое изучение Windows Server для SMB-офиса: лицензирование, Server Core, роли, PowerShell remoting, WSUS, Windows Admin Center, логи, производительность и troubleshooting',
  sections: [
    {
      title: 'Роль Windows Server в офисе',
      content: `**Windows Server** — платформа для корпоративных сервисов в SMB и enterprise. В офисе на 20–200 человек это обычно «центр вселенной» инфраструктуры.

| Роль | Назначение | Типичный сценарий SMB |
|------|------------|----------------------|
| **Domain Controller (AD DS)** | Централизованные учётные записи, политики | Единый логин для всех ПК |
| **DNS** | Разрешение имён в локальной сети | \`company.local\`, SRV-записи AD |
| **DHCP** | Автоматическая выдача IP | ПК получают IP, gateway, DNS |
| **File Server** | Общие папки, права NTFS | \\\\fileserver\\sales, \\\\fileserver\\hr |
| **Print Server** | Сетевые принтеры | Один драйвер — 50 рабочих мест |
| **RDS** | Удалённые рабочие столы | Удалёнка, тонкие клиенты |
| **Hyper-V** | Виртуализация на Windows | DC + 1С + Veeam на одном железе |
| **WSUS** | Локальные обновления | Контроль патчей без трафика в интернет |

**Windows Server vs Linux Server:**
- Офис с доменом AD → почти всегда Windows Server
- Веб, контейнеры, облако → чаще Linux
- Хороший инженер знает **оба** мира

> Реальный кейс: офис на 45 человек, один физический сервер Dell T340, Hyper-V с 3 VM: DC01, FS01, VEEAM01. Это типичная SMB-схема.`,
    },
    {
      title: 'Версии, редакции и лицензирование',
      content: `**Актуальные версии:** Windows Server 2019, 2022, 2025. Для новых проектов — **2022** или **2025**.

**Editions:**

| Edition | Виртуализация | Когда использовать |
|---------|---------------|-------------------|
| **Standard** | До 2 VM на хосте (при правильной лицензии) | Типичный офис 1–3 сервера |
| **Datacenter** | Неограниченная виртуализация | ЦОД, крупная виртуализация |
| **Essentials** | ≤25 пользователей, упрощённый AD | Legacy, не для новых проектов |

**Лицензирование — два компонента:**

1. **Server license (per-core):** минимум 16 ядер на сервер, лицензируются все физические ядра
2. **CAL (Client Access License):** на каждого **пользователя** (User CAL) или **устройство** (Device CAL)

| Тип CAL | Когда выбирать |
|---------|----------------|
| **User CAL** | Сотрудник работает с 2+ устройств (ПК + ноутбук + телефон) |
| **Device CAL** | Общие ПК (ресепшн, склад, смена) — много людей, мало устройств |

**Пример расчёта для офиса 40 человек:**
- 1× Server Standard (16-core pack, если сервер 8 ядер — 1 pack)
- 40× User CAL (каждый сотрудник имеет свой логин)
- RDS CAL — отдельно, если используется Remote Desktop Services

**Evaluation:** ISO на 180 дней, полный функционал. Для lab — Hyper-V на рабочей станции.

> **Аудит лицензий:** раз в год проверяй соответствие CAL количеству активных AD-учёток. Штрафы Microsoft при проверке — реальны.`,
    },
    {
      title: 'Server Core vs Desktop Experience (GUI)',
      content: `**Desktop Experience** — полный GUI, Server Manager, привычный рабочий стол. Удобно для обучения и первого DC в lab.

**Server Core** — минимальная установка без GUI:
- Меньше поверхность атаки (меньше компонентов)
- Меньше патчей, быстрее перезагрузки
- ~40% экономия RAM
- Управление через PowerShell, RSAT, Windows Admin Center

| Критерий | Server Core | Desktop Experience |
|----------|-------------|-------------------|
| Удобство для новичка | Низкое | Высокое |
| Безопасность | Выше | Ниже |
| Патчи | Меньше | Больше |
| Рекомендация prod | **Да** | Только если есть веская причина |

**Переключение:** нельзя «на лету». Только переустановка или конвертация через DISM (Server Core ↔ Desktop Experience).

**Реальный сценарий SMB:** первый DC — GUI (проще учиться). Второй DC, file server, WSUS — Server Core + Windows Admin Center для GUI-управления.

\`sconfig.exe\` на Server Core — текстовое меню: сеть, hostname, домен, Windows Update, выход в PowerShell.`,
      code: {
        language: 'powershell',
        caption: 'Определение типа установки и переход в PowerShell с sconfig',
        code: `Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" | Select ProductName, InstallationType
# Server Core: InstallationType = Server Core
# Desktop Experience: InstallationType = Server

# На Server Core — sconfig запускается автоматически при входе
# Опция 15: Exit to PowerShell`,
      },
    },
    {
      title: 'Установка и первичная настройка',
      content: `**Минимальные требования (Server 2022):**
- CPU: 1.4 GHz 64-bit
- RAM: 2 GB (реально **4+ GB** для DC, **8+ GB** для Hyper-V host)
- Disk: 32 GB (реально **60–100 GB** для системного тома)

**Порядок первичной настройки (до ролей!):**

1. **Статический IP** — обязательно на DC, рекомендуется на всех серверах
2. **Hostname** — понятное имя: \`SRV-DC01\`, \`SRV-FS01\`, \`SRV-WSUS01\`
3. **Windows Update** — все критические патчи
4. **Активация** — KMS в офисе или MAK-ключ
5. **Часовой пояс и NTP** — критично для Kerberos (±5 мин)
6. **Отключить IE Enhanced Security** (на DC — по политике, для lab — удобнее)
7. **Установка ролей** — через Server Manager или PowerShell

**Именование серверов в SMB:**
\`\`\`
SRV-DC01.company.local   — первый контроллер домена
SRV-DC02.company.local   — второй DC (отказоустойчивость!)
SRV-FS01.company.local   — файловый сервер
SRV-HV01.company.local   — Hyper-V хост
\`\`\`

> **Никогда** не ставь DHCP на единственный DC без резервирования его IP на роутере. Потеря IP DC = потеря домена для клиентов.`,
      code: {
        language: 'powershell',
        caption: 'Первичная настройка через PowerShell',
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
      title: 'Server Manager и роли сервера',
      content: `**Server Manager** (\`servermanager.exe\`) — центральная консоль: роли, службы, события, локальные пользователи, dashboard всех серверов.

**Добавление роли:** Manage → Add Roles and Features Wizard.

**Типовой первый сервер (DC) — роли:**
1. **Active Directory Domain Services** — домен
2. **DNS Server** — устанавливается вместе с AD
3. Опционально: **DHCP** (в крупных сетях — отдельный сервер)

**File Server:**
- **File and Storage Services** → File Server, DFS (опционально)
- NTFS-права, квоты, Shadow Copies (VSS)

**Print Server:**
- **Print and Document Services**
- Общий принтер → драйверы x64/x86 → GPO для автоподключения

**RDS (Remote Desktop Services):**
- RD Session Host — рабочие столы
- RD Gateway — SSL VPN для RDP
- RD Licensing — отдельные RDS CAL
- RD Connection Broker — балансировка сессий

**Hyper-V:**
- Роль Hyper-V на отдельном хосте (не на DC!)
- Virtual Switch, Integration Services

**Features (компоненты, не роли):**
- RSAT — инструменты AD/GPO с рабочей станции админа
- .NET Framework / .NET Core
- Windows Server Backup
- Telnet Client — только для диагностики, не на prod
- GUI на Server Core: \`Install-WindowsFeature Server-Gui-Mgmt-Infra\`

> **Правило SMB:** один DC — риск. Минимум **2 DC** для любого production-офиса. Один пожар в серверной не должен останавливать бизнес.`,
      code: {
        language: 'powershell',
        caption: 'Установка ролей через PowerShell',
        code: `Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
Install-WindowsFeature -Name DHCP -IncludeManagementTools
Install-WindowsFeature -Name FS-FileServer -IncludeManagementTools
Install-WindowsFeature -Name Print-Server -IncludeManagementTools
Get-WindowsFeature | Where-Object InstallState -eq 'Installed' | Select Name, DisplayName`,
      },
    },
    {
      title: 'PowerShell: основы администрирования',
      content: `PowerShell — **основной** инструмент Windows-админа. Всё, что в GUI, можно и нужно автоматизировать.

**Философия:** если делаешь что-то дважды — напиши скрипт.

**Базовые принципы:**
- \`Get-Command *dns*\` — поиск cmdlet
- \`Get-Help Get-Service -Examples\` — примеры
- \`Get-Help Get-Service -Full\` — полная документация
- Pipeline: \`Get-Service | Where-Object Status -eq 'Stopped'\`
- Объекты, не текст — PowerShell возвращает .NET-объекты

**Профили и модули:**
- \`$PROFILE\` — скрипт автозагрузки
- Модули: ActiveDirectory, DnsServer, DhcpServer, GroupPolicy — ставятся с ролями

**Execution Policy:**
\`Set-ExecutionPolicy RemoteSigned\` — локальные скрипты без подписи, скачанные — с подписью.

> В production-скриптах используй \`-WhatIf\` и \`-Confirm\` для опасных операций.`,
      codes: [
        {
          language: 'powershell',
          caption: 'Управление службами и процессами',
          code: `Get-Service -Name W32Time | Format-List *
Restart-Service -Name Spooler -Force
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, @{N='MemMB';E={[math]::Round($_.WorkingSet64/1MB,1)}}

Get-Volume | Format-Table DriveLetter, FileSystemLabel, @{N='FreeGB';E={[math]::Round($_.SizeRemaining/1GB,1)}}, @{N='TotalGB';E={[math]::Round($_.Size/1GB,1)}}`,
        },
        {
          language: 'powershell',
          caption: 'Инвентаризация сервера — шаблон для документации',
          code: `$info = [ordered]@{
  Hostname = $env:COMPUTERNAME
  OS = (Get-CimInstance Win32_OperatingSystem).Caption
  Uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
  RAM_GB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB, 1)
  Roles = (Get-WindowsFeature | Where InstallState -eq 'Installed' | Select -Expand Name) -join ', '
}
$info | Format-List`,
        },
      ],
    },
    {
      title: 'PowerShell Remoting (WinRM)',
      content: `**WinRM** (Windows Remote Management) — удалённое управление через PowerShell. Замена SSH для Windows-мира (OpenSSH тоже доступен, но WinRM — стандарт).

**Настройка на сервере:**
\`Enable-PSRemoting -Force\` — включает WinRM, firewall rule, listener.

**Подключение:**
\`Enter-PSSession -ComputerName SRV-FS01\` — интерактивная сессия
\`Invoke-Command -ComputerName SRV-FS01 -ScriptBlock { Get-Service }\` — разовая команда
\`Invoke-Command -ComputerName SRV-DC01,SRV-FS01 -ScriptBlock { hostname }\` — несколько серверов

**CredSSP / Kerberos:** в домене аутентификация прозрачна. Workgroup — нужен \`-Credential\`.

**Ограничения:**
- Порт **5985** (HTTP) / **5986** (HTTPS)
- Double-hop problem — решается CredSSP или gMSA
- Just Enough Administration (JEA) — ограничение прав в remoting-сессии

**Реальный сценарий:** админ с RSAT на рабочей станции → \`Enter-PSSession SRV-DC01\` → управление AD без RDP на сервер.

> **Безопасность:** не открывай WinRM в интернет. Только внутренняя сеть или через VPN/jump host.`,
      codes: [
        {
          language: 'powershell',
          caption: 'Настройка и использование remoting',
          code: `Enable-PSRemoting -Force
Test-WSMan -ComputerName SRV-FS01

Enter-PSSession -ComputerName SRV-FS01
# Внутри сессии: Get-Service, exit

Invoke-Command -ComputerName SRV-DC01 -ScriptBlock { Get-ADDomain | Select DNSRoot, DomainMode }

# Несколько серверов параллельно
Invoke-Command -ComputerName (Get-ADComputer -Filter * | Select -Expand Name) -ScriptBlock { [PSCustomObject]@{Host=$env:COMPUTERNAME; Uptime=((Get-Date)-(Get-CimInstance Win32_OperatingSystem).LastBootUpTime).Days} }`,
        },
      ],
    },
    {
      title: 'Службы Windows и автозапуск',
      content: `**Services (services.msc)** — фоновые процессы Windows Server.

| Тип запуска | Поведение |
|-------------|-----------|
| **Automatic** | Старт при загрузке ОС |
| **Automatic (Delayed Start)** | Старт через 1–2 мин после загрузки |
| **Manual** | Запуск по требованию |
| **Disabled** | Отключена |

**Критичные службы на DC:**
- **NTDS** (Active Directory Domain Services)
- **DNS** (DNS Server)
- **Netlogon** — регистрация в DNS, аутентификация
- **KDC** (Kerberos Key Distribution Center)
- **W32Time** — синхронизация времени

**Task Scheduler** — «cron для Windows»:
- Триггеры: по расписанию, при событии, при входе
- Действия: запуск программы, PowerShell-скрипта
- Примеры: бэкап, отчёт по дискам, очистка temp

**Реальный кейс:** служба Spooler зависла → принтеры не печатают → \`Restart-Service Spooler\` → решено за 30 секунд. Знай типовые службы своих ролей.`,
      code: {
        language: 'powershell',
        caption: 'Диагностика и управление службами',
        code: `Get-Service | Where-Object Status -eq 'Stopped' -and StartType -eq 'Automatic' | Select Name, DisplayName, Status

Get-Service -Name NTDS, DNS, Netlogon, KDC, W32Time | Format-Table Name, Status, StartType

# Службы, которые не запустились после reboot
Get-WinEvent -FilterHashtable @{LogName='System'; Id=7000,7009,7011; StartTime=(Get-Date).AddDays(-1)} | Select TimeCreated, Message -First 10`,
      },
    },
    {
      title: 'Windows Update и WSUS',
      content: `**Windows Update** на серверах — критично, но требует контроля. Автоматическая перезагрузка DC в рабочее время = инцидент.

**WSUS (Windows Server Update Services)** — локальный сервер обновлений:

| Преимущество | Описание |
|-------------|----------|
| Контроль | Ты решаешь, какие KB ставить |
| Трафик | Один скачивает из интернета, остальные — из WSUS |
| Тестирование | Pilot-группа → production через 1–2 недели |
| Отчёты | Кто не обновился |

**Схема кольцевого обновления (SMB):**
1. **Pilot** — IT-отдел (5 ПК), обновления сразу
2. **Wave 1** — 25% офиса, через 1 неделю
3. **Wave 2** — остальные, через 2 недели
4. **Серверы** — отдельное кольцо, maintenance window (воскресенье 02:00)

**GPO для WSUS:**
- Computer Configuration → Policies → Administrative Templates → Windows Components → Windows Update
- Specify intranet Microsoft update service location: \`http://SRV-WSUS01:8530\`

**На серверах без WSUS:** ручной контроль, maintenance window через GPO или SCONFIG.

> **Золотое правило:** тестируй обновления на **копии** DC (lab VM) перед production. KB, ломающие AD, — редки, но бывают.`,
      codes: [
        {
          language: 'powershell',
          caption: 'Установка WSUS и проверка статуса обновлений',
          code: `Install-WindowsFeature -Name UpdateServices -IncludeManagementTools
# После мастера: http://SRV-WSUS01:8530

Get-WindowsUpdate -MicrosoftUpdate | Select Title, KB, IsDownloaded, IsInstalled
Install-WindowsUpdate -AcceptAll -AutoReboot:$false`,
        },
      ],
    },
    {
      title: 'Windows Admin Center',
      content: `**Windows Admin Center (WAC)** — современная веб-консоль для управления серверами. Бесплатно, без дополнительной лицензии.

**Возможности:**
- Dashboard серверов (CPU, RAM, диски)
- Диспетчер служб, процессов, событий
- Управление ролями (AD, DNS, DHCP, Hyper-V)
- PowerShell-терминал в браузере
- Расширения: Azure, Storage, System Insights

**Установка:**
1. Скачай с microsoft.com/windows-server/admin-center
2. Установи на **отдельную** VM или рабочую станцию админа (не на DC!)
3. Открой \`https://wac-server:6516\`
4. Добавь серверы по имени или IP

**Server Core + WAC = идеальная пара:**
- Server Core на prod — минимальная поверхность атаки
- WAC — GUI когда нужен
- PowerShell remoting — автоматизация

**Реальный сценарий SMB:** IT-админ ставит WAC на свой ПК, добавляет 4 сервера, мониторит диски и обновления из браузера. Не нужен RDP на каждый сервер.

> WAC **не заменяет** GPMC, ADUC, Veeam Console — это complement, не replacement.`,
    },
    {
      title: 'Event Viewer и журналы событий',
      content: `**Event Viewer (eventvwr.msc)** — первый инструмент при любом инциденте на Windows Server.

**Основные журналы:**

| Журнал | Что искать |
|--------|-----------|
| **System** | Службы, драйверы, перезагрузки, Kernel-Power |
| **Application** | Ошибки приложений (SQL, 1С, Veeam) |
| **Security** | Входы, отказы, изменения прав (нужен аудит!) |
| **Directory Service** | AD-репликация, LDAP (только на DC) |
| **DNS Server** | Ошибки DNS-зоны |
| **Setup** | Установка обновлений, ролей |

**Ключевые Event ID:**

| ID | Значение |
|----|----------|
| 1074 | Запланированная перезагрузка |
| 6008 | Неожиданное выключение (питание!) |
| 4624 | Успешный вход |
| 4625 | Неудачный вход (brute-force?) |
| 4740 | Блокировка учётной записи |
| 1311 | Ошибка топологии репликации AD |

**PowerShell для логов:**
\`Get-WinEvent\` — мощнее legacy \`Get-EventLog\`.

**Централизация:** WEF (Windows Event Forwarding) → SIEM, или простой сбор в общую папку для SMB.`,
      codes: [
        {
          language: 'powershell',
          caption: 'Анализ логов через PowerShell',
          code: `Get-WinEvent -LogName System -MaxEvents 20 | Select TimeCreated, Id, LevelDisplayName, Message

Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddDays(-1)} | Select TimeCreated, @{N='User';E={$_.Properties[5].Value}}, @{N='SourceIP';E={$_.Properties[19].Value}}

Get-WinEvent -LogName 'Directory Service' -MaxEvents 10 | Where-Object Id -eq 1311`,
        },
      ],
    },
    {
      title: 'Производительность и мониторинг',
      content: `**Performance Monitor (perfmon.msc)** — счётчики в реальном времени и Data Collector Sets.

**Ключевые счётчики для SMB-сервера:**

| Счётчик | Порог тревоги | Что означает |
|---------|---------------|-------------|
| \\Processor(_Total)\\% Processor Time | >80% sustained | CPU перегружен |
| \\Memory\\Available MBytes | <200 MB | Нехватка RAM |
| \\PhysicalDisk(_Total)\\% Disk Time | >80% | Диск — bottleneck |
| \\PhysicalDisk(_Total)\\Avg. Disk Queue Length | >2 | Очередь к диску |
| \\Network Interface(*)\\Bytes Total/sec | Зависит от NIC | Сетевой трафик |

**Resource Monitor (resmon.exe)** — GUI: CPU, Memory, Disk, Network по процессам.

**Task Manager** — быстрый взгляд, но не для production-мониторинга.

**Реальный кейс:** file server тормозит → resmon → Disk → видим antimalware scanning каждого файла → исключение папки бэкапов из сканирования → проблема решена.

**Рекомендации для SMB:**
- Включи **System Insights** (WAC) — предиктивные алерты
- Настрой email-алерты на диск <15% свободного
- Документируй baseline: нормальный CPU/RAM в рабочее время`,
      code: {
        language: 'powershell',
        caption: 'Быстрая диагностика производительности',
        code: `Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 5
Get-Counter '\Memory\Available MBytes'
Get-Counter '\PhysicalDisk(_Total)\% Disk Time'

Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, @{N='MemMB';E={[math]::Round($_.WorkingSet64/1MB,0)}}, CPU`,
      },
    },
    {
      title: 'Аудит лицензий Windows Server',
      content: `**Зачем аудит:** Microsoft может провести проверку (SAM — Software Asset Management). Несоответствие CAL = штраф.

**Что проверять:**

| Компонент | Как проверить |
|-----------|--------------|
| Server license | Количество ядер, edition (Std/Datacenter) |
| User/Device CAL | Активные AD-учётки vs купленные CAL |
| RDS CAL | Активные RDS-сессии vs RDS CAL |
| Virtualization rights | Standard = 2 VM, сколько VM реально? |

**Инструменты:**
- \`slmgr /dlv\` — детали лицензии Windows
- AD: количество enabled users
- RDS Licensing Manager — использованные CAL

**Документация для аудита:**
1. Список серверов: hostname, edition, cores, роли
2. Количество CAL по типам (User/Device/RDS)
3. Даты покупки, номера лицензий
4. Политика: «1 user = 1 User CAL»

> Храни документы о лицензиях **отдельно** от серверов. При ransomware на file server — лицензии тоже должны быть доступны.`,
      code: {
        language: 'powershell',
        caption: 'Скрипт инвентаризации лицензий',
        code: `slmgr /dlv
(Get-CimInstance SoftwareLicensingService).OA3xOriginalProductKey

$enabledUsers = (Get-ADUser -Filter {Enabled -eq $true}).Count
Write-Host "Enabled AD users: $enabledUsers"
Write-Host "Purchased User CALs: [заполни вручную из документации]"
Write-Host "Delta: проверь соответствие"`,
      },
    },
    {
      title: 'Безопасность Windows Server',
      content: `**Базовый hardening checklist:**

1. **Минимум ролей** — только то, что нужно
2. **Windows Firewall** — default deny, разрешить только нужные порты
3. **Local Administrators** — минимум людей, отдельные admin-учётки
4. **RDP** — только через VPN или jump host, NLA enabled, не 3389 в интернет
5. **Аудит** — Advanced Audit Policy (входы, изменения групп)
6. **Defender** — встроенный AV, исключения для Veeam/SQL
7. **Отключить LLMNR/NetBIOS** — mitm-атаки в локальной сети
8. **Credential Guard** — на поддерживаемом железе (Server 2016+)

**Порты, которые должны быть открыты (DC):**
- 53 (DNS), 88 (Kerberos), 389/636 (LDAP), 445 (SMB), 3268/3269 (GC)
- Полный список: Microsoft docs «Configuring firewalls for AD domains»

**RDP best practices:**
- Network Level Authentication (NLA) — обязательно
- Ограничить по IP через firewall
- MFA через RD Gateway + Azure MFA
- Session timeout: отключать неактивные сессии

**Tiered Administration Model:**
- Tier 0: Domain Admins — только DC, только с PAW (Privileged Access Workstation)
- Tier 1: Server admins — серверы, не DC
- Tier 2: Helpdesk — рабочие станции, сброс паролей`,
    },
    {
      title: 'Hyper-V на Windows Server',
      content: `**Hyper-V** — встроенная виртуализация. Для SMB — альтернатива VMware без лицензий vSphere.

**Требования:**
- 64-bit CPU с SLAT (Second Level Address Translation)
- VT-x/AMD-V включён в BIOS
- Достаточно RAM (выдели хосту минимум 4 GB + RAM для VM)

**Типы Virtual Switch:**

| Тип | Описание |
|-----|----------|
| **External** | VM видна в физической сети |
| **Internal** | VM ↔ Host, не в физической сети |
| **Private** | Только между VM |

**Ключевые операции:**
- **Checkpoints** — снимки (не замена бэкапа!)
- **Integration Services** — драйверы в гостевой ОС
- **Live Migration** — перенос VM без downtime (нужен Failover Cluster)
- **Dynamic Memory** — RAM по требованию

**Типовая схема SMB:**
\`\`\`
SRV-HV01 (физический, 64 GB RAM, 2× SSD RAID1)
├── VM: SRV-DC01 (4 GB RAM, 60 GB disk)
├── VM: SRV-DC02 (4 GB RAM, 60 GB disk)
├── VM: SRV-FS01 (8 GB RAM, 500 GB disk)
└── VM: SRV-VEEAM01 (8 GB RAM, 2 TB disk для repository)
\`\`\`

> **Правило:** бэкап VM через Veeam, не checkpoints. Checkpoints на production DC — плохая идея (влияют на производительность AD).`,
      code: {
        language: 'powershell',
        caption: 'Управление Hyper-V через PowerShell',
        code: `Get-VM | Select Name, State, CPUUsage, @{N='RAM_GB';E={[math]::Round($_.MemoryAssigned/1GB,1)}}
Get-VMSwitch | Select Name, SwitchType
Get-VMHardDiskDrive -VMName "SRV-DC01" | Select VMName, Path

# Создание VM (пример)
New-VM -Name "SRV-TEST01" -MemoryStartupBytes 4GB -NewVHDPath "D:\VMs\SRV-TEST01.vhdx" -NewVHDSizeBytes 60GB -SwitchName "External"`,
      },
    },
    {
      title: 'Troubleshooting: загрузка и службы',
      content: `**Методология при «сервер не работает»:**

1. **Физический уровень:** питание, сеть, KVM/iLO
2. **Загрузка ОС:** Safe Mode, Last Known Good
3. **Службы:** какие не запустились?
4. **Логи:** Event Viewer System + Application
5. **Сеть:** ping, DNS, порты

**Режимы загрузки:**
- **Safe Mode** — минимум драйверов и служб
- **Safe Mode with Networking** — + сеть
- **Directory Services Restore Mode (DSRM)** — только DC, для восстановления AD
- **Last Known Good Configuration** — откат реестра

**Типичные проблемы SMB:**

| Симптом | Причина | Решение |
|---------|---------|---------|
| Сервер не пингуется | Сеть, firewall, IP | Проверь кабель, IP, firewall |
| «Нет логона серверов» | DC недоступен | Проверь DNS, Netlogon, NTDS |
| Служба не стартует | Зависимость, права | Event 7000/7009, services.msc |
| Диск 0 bytes free | Логи, бэкапы, temp | Очистка, расширение тома |
| После обновления — синий экран | Проблемный KB | Откат KB, Safe Mode |

**Boot Configuration:** \`bcdedit\` — настройка загрузки, откат.

> **Правило:** не перезагружай сервер, пока не собрал логи. Event Viewer → System → последние ошибки → скриншот или экспорт.`,
      codes: [
        {
          language: 'powershell',
          caption: 'Диагностика при проблемах загрузки и служб',
          code: `Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2; StartTime=(Get-Date).AddHours(-24)} | Select TimeCreated, Id, ProviderName, Message -First 15

Get-Service | Where-Object {$_.Status -ne 'Running' -and $_.StartType -eq 'Automatic'} | Select Name, Status, StartType

Test-NetConnection -ComputerName SRV-DC01 -Port 389
Test-NetConnection -ComputerName SRV-DC01 -Port 53`,
        },
      ],
    },
    {
      title: 'File Server и Print Server — практика',
      content: `**File Server — типовая настройка SMB:**

1. Установить роль FS-FileServer
2. Создать том/папки: \`D:\\Shares\\Sales\`, \`D:\\Shares\\HR\`
3. Общий доступ (Share permissions): Everyone → Change (или конкретные группы)
4. NTFS permissions: AGDLP — группы AD, не отдельные пользователи
5. Shadow Copies (VSS) — Previous Versions для пользователей
6. Квоты — ограничение места на пользователя/папку

**Print Server:**
1. Установить роль Print-Server
2. Print Management → Add Printer → TCP/IP
3. Опубликовать в AD (List in Directory)
4. GPO: Deploy printer preferences для OU

**Реальный кейс:** бухгалтерия жалуется «файл открыт другим пользователем» → Computer Management → Shared Folders → Open Files → закрыть зависшую сессию. Или: \`Get-SmbOpenFile | Close-SmbOpenFile -Force\`.

**DFS (Distributed File System):** для двух file server — единый namespace \\\\company\\data, репликация между серверами.`,
      code: {
        language: 'powershell',
        caption: 'File Server и Print Server',
        code: `New-Item -Path "D:\Shares\Sales" -ItemType Directory -Force
New-SmbShare -Name "Sales" -Path "D:\Shares\Sales" -FullAccess "COMPANY\G_Sales"
Get-SmbShare | Select Name, Path, Description

Get-Printer | Select Name, DriverName, PortName, Shared
Get-SmbOpenFile | Select ClientComputerName, ClientUserName, Path`,
      },
    },
    {
      title: 'Документация и inventory серверов',
      content: `**Каждый сервер должен быть задокументирован.** При уходе админа или инциденте — это спасение.

**Шаблон inventory (одна строка на сервер):**

| Поле | Пример |
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

**Где хранить:**
- ITSM (Jira, ServiceNow) — CMDB
- SharePoint / wiki
- **Не** только в голове админа

**Автоматизация:** скрипт раз в неделю собирает inventory всех серверов через WinRM → CSV/JSON на file server.

> Обновляй inventory при **каждом** изменении: новая роль, миграция, обновление ОС.`,
      code: {
        language: 'powershell',
        caption: 'Автоматический сбор inventory',
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
$inventory | Export-Csv -Path "\\\\fileserver\\it\\inventory.csv" -NoTypeInformation`,
      },
    },
    {
      title: 'Лабораторная работа: установка Server Core',
      content: `**Цель:** развернуть Windows Server 2022 Server Core, выполнить базовую настройку без GUI и проверить управление через PowerShell и Windows Admin Center.

**Ожидаемый результат:** сервер SRV-CORE01 с статическим IP, синхронизированным временем, установленными обновлениями и доступом по WinRM.

| Шаг | Действие | Ожидаемый вывод |
|-----|----------|-----------------|
| 1 | Создай VM в Hyper-V: 2 vCPU, 4 GB RAM, 60 GB VHDX | VM создана, ISO подключён |
| 2 | При установке выбери **Windows Server 2022 Standard (Server Core)** | InstallationType = Server Core |
| 3 | Задай пароль локального Administrator | Вход через консоль VM |
| 4 | Запусти \`sconfig\` → Option 8 (Network Settings) → статический IP | IP pingable из lab-сети |
| 5 | Option 2: переименуй в SRV-CORE01, перезагрузка | \`hostname\` → SRV-CORE01 |
| 6 | Option 6: Install Updates, перезагрузка при необходимости | Get-HotFix показывает последние KB |
| 7 | Option 15: Exit to PowerShell | PS prompt доступен |
| 8 | Настрой NTP: \`w32tm /config /manualpeerlist:"time.windows.com" /syncfromflags:manual /update\` | w32tm /query /status → Source: time.windows.com |
| 9 | Включи WinRM: \`Enable-PSRemoting -Force\` | Test-WSMan SRV-CORE01 → OK |
| 10 | С рабочей станции: \`Enter-PSSession -ComputerName SRV-CORE01\` | Удалённая PS-сессия открыта |
| 11 | Установи роль: \`Install-WindowsFeature FS-FileServer\` | Get-WindowsFeature FS-FileServer → Installed |
| 12 | Создай share: \`New-SmbShare -Name "Lab" -Path "C:\\\\Lab" -FullAccess "Administrators"\` | \\\\SRV-CORE01\\Lab доступен |
| 13 | Установи Windows Admin Center на admin-ПК, добавь SRV-CORE01 | Dashboard показывает CPU/RAM |
| 14 | Собери baseline: Get-Counter, Get-WinEvent — сохрани в CSV | Файлы baseline сохранены |
| 15 | Документируй: IP, hostname, роли, дата патчей | Запись в inventory |

> **Совет:** Server Core не имеет браузера — все загрузки через PowerShell (\`Invoke-WebRequest\`) или с admin-станции через WinRM copy.`,
      code: {
        language: 'powershell',
        caption: 'Post-install Server Core checklist script',
        code: `$report = [PSCustomObject]@{
  Hostname = $env:COMPUTERNAME
  OS = (Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion").ProductName
  InstallType = (Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion").InstallationType
  IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.PrefixOrigin -eq 'Manual'}).IPAddress
  TimeSync = (w32tm /query /status 2>&1 | Select-String "Source").ToString()
  LastBoot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
  PendingReboot = (Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\WindowsUpdate\\Auto Update\\RebootRequired" -ErrorAction SilentlyContinue) -ne $null
}
$report | Format-List
$report | Export-Csv -Path "C:\\\\Lab\\\\server-core-baseline.csv" -NoTypeInformation`,
      },
    },
    {
      title: 'RDS — развёртывание Remote Desktop Services',
      content: `**Remote Desktop Services (RDS)** — платформа для удалённых рабочих столов и RemoteApp в SMB-офисе.

**Компоненты RDS:**

| Роль | Назначение | SMB-сценарий |
|------|------------|--------------|
| **RD Connection Broker** | Маршрутизация сессий, HA | 2+ session hosts |
| **RD Web Access** | Веб-портал для RDP | Доступ через HTTPS |
| **RD Gateway** | RDP через HTTPS (443) | Без VPN, с MFA |
| **RD Licensing** | Учёт RDS CAL | Обязательно в prod |
| **RD Session Host** | Сами сессии пользователей | 1С, Excel, CRM |

**Порядок развёртывания (Quick Start):**

1. Установи роли через Server Manager → Remote Desktop Services
2. RD Licensing — активируй, укажи тип CAL (Per User / Per Device)
3. RD Session Host — установи приложения (1С, Office)
4. RD Connection Broker — при 2+ session hosts
5. RD Gateway — опционально, для доступа из интернета
6. GPO: loopback processing на OU терминальных серверов
7. Настрой коллекцию: Quick Session Collection или Session-based

**Лицензирование:**
- Windows Server CAL + **отдельные RDS CAL**
- Grace period: 120 дней без license server
- GPO: Specify RD license servers

**Рекомендации SMB:**
- 1 session host до 15 пользователей — достаточно 16 GB RAM
- Profile Disks (UPD) или Folder Redirection для профилей
- Антivirus exclusions для RDS (не сканировать .vhdx профилей в пик)

> **Кейс:** бухгалтерия 12 человек → один RDS-SRV01, RemoteApp для 1С, RDP для полного стола бухгалтеру-главе.`,
      code: {
        language: 'powershell',
        caption: 'Установка RDS ролей через PowerShell',
        code: `Install-WindowsFeature RDS-RD-Server,RDS-Licensing,RDS-Connection-Broker -IncludeManagementTools

Import-Module RemoteDesktop
New-RDSessionDeployment -ConnectionBroker "SRV-RDS01.company.local" -WebAccessServer "SRV-RDS01.company.local" -SessionHost "SRV-RDS01.company.local"

New-RDSessionCollection -CollectionName "OfficeApps" -SessionHost "SRV-RDS01.company.local" -ConnectionBroker "SRV-RDS01.company.local" -PooledUnmanaged

Get-RDSessionCollection
Get-RDUserSession | Select UserName, SessionState, HostServer`,
      },
    },
    {
      title: 'FSRM — квоты и screening файлов',
      content: `**File Server Resource Manager (FSRM)** — квоты, screening, отчёты на файловом сервере.

**Установка:** роль FS-Resource-Manager (вместе с FS-FileServer).

**Квоты (Quotas):**

| Тип | Описание | Когда использовать |
|-----|----------|-------------------|
| **Hard quota** | Блокирует запись при превышении | Строгий лимит per-user |
| **Soft quota** | Email/лог при превышении | Предупреждение за 90% |
| **Auto apply** | На все подпапки | \\\\users\\%username%\\ |

**File Screening:**
- Запрет .exe, .mp3, .iso на file share
- Исключения для IT-папок
- Email-уведомления админу

**Отчёты:**
- Large files (>500 MB)
- Duplicate files
- Least recently accessed
- Quota usage per user

**Типовая настройка SMB:**
1. D:\\\\Shares\\\\Users — auto quota 5 GB per folder
2. D:\\\\Shares\\\\Public — screening: block executables
3. Еженедельный отчёт «Top 50 largest files» на email IT

> FSRM + Shadow Copies = пользователи восстанавливают сами, IT контролирует место.`,
      code: {
        language: 'powershell',
        caption: 'FSRM квоты через PowerShell',
        code: `Import-Module Fsrm

New-FsrmQuota -Path "D:\\\\Shares\\\\Users" -Size 5GB -Template "5 GB limit reports to user"

New-FsrmFileGroup -Name "Blocked Media" -IncludePattern @("*.mp3","*.mp4","*.iso")
New-FsrmFileScreen -Path "D:\\\\Shares\\\\Public" -Template "Block media files"

Get-FsrmQuota | Select Path, Size, Usage, Status
Get-FsrmAction | Select ActionType, EmailTo`,
      },
    },
    {
      title: 'DFS — распределённая файловая система',
      content: `**DFS (Distributed File System)** — единое пространство имён и репликация между file server.

**Два компонента:**

| Компонент | Назначение |
|-----------|------------|
| **DFS Namespace** | \\\\company.local\\Data → \\\\FS01\\Shares\\Data, \\\\FS02\\Shares\\Data |
| **DFS Replication (DFSR)** | Синхронизация папок между серверами |

**Сценарии SMB:**
- Два офиса — namespace скрывает физический сервер
- Миграция file server — добавь новый target, убери старый
- DR — реплика на второй site

**Namespace types:**
- **Domain-based** — \\\\company.local\\Shares (рекомендуется)
- **Stand-alone** — привязан к одному серверу

**DFSR требования:**
- AD domain
- Порты 5722 (RPC), 138/139/445 (SMB)
- Staging folder — место для конфликтов
- Не реплицируй открытые базы (1С, SQL) — только файловые share

**Best practices:**
- Tiered storage: hot на SSD, archive на HDD
- Мониторинг backlog: \`Get-DfsrState\`
- Pre-seed для больших объёмов (robocopy + initial sync)

> **Кейс:** \\\\company\\Data всегда доступен — при падении FS01 клиенты автоматически идут на FS02 через namespace.`,
      code: {
        language: 'powershell',
        caption: 'DFS Namespace и Replication',
        code: `Install-WindowsFeature FS-DFS-Namespace,FS-DFS-Replication -IncludeManagementTools

New-DfsnRoot -Path "\\\\company.local\\Data" -TargetPath "\\\\SRV-FS01\\Shares\\Data" -Type DomainV2
New-DfsnFolder -Path "\\\\company.local\\Data\\Sales" -TargetPath "\\\\SRV-FS01\\Shares\\Sales"

New-DfsReplicationGroup -GroupName "RG-Data" -DomainName "company.local"
New-DfsReplicatedFolder -GroupName "RG-Data" -FolderName "Sales"
Add-DfsrMember -GroupName "RG-Data" -ComputerName "SRV-FS01","SRV-FS02"
Add-DfsrConnection -GroupName "RG-Data" -SourceComputerName "SRV-FS01" -DestinationComputerName "SRV-FS02"

Get-DfsrState -ComputerName SRV-FS01 | Select FolderName, Inbound, Outbound, State`,
      },
    },
    {
      title: 'NLB — введение в Network Load Balancing',
      content: `**NLB (Network Load Balancing)** — встроенная балансировка TCP/UDP на Windows Server (до 32 узлов).

**Когда использовать в SMB:**
- Веб-сервисы на IIS (2+ сервера)
- RD Web Access / RD Gateway HA
- **Не** для SQL, AD, DFS — используй специализированные решения

**Режимы:**
- **Unicast** — MAC на switch, проще
- **Multicast** — требует поддержку switch
- **IGMP Multicast** — меньше flood на switch

**Affinity (привязка):**
- **Single** — один клиент → один сервер (сессии)
- **Network** — по Class C подсети
- **None** — round-robin

**Ограничения NLB:**
- Нет health check уровня приложения (только ping/TCP)
- Все узлы в одной broadcast domain (L2)
- Для enterprise — рассмотри Azure Load Balancer / HAProxy

**Альтернатива SMB:** один сервер + Veeam replication для DR вместо NLB кластера.

> NLB — «достаточно хорошо» для двух IIS-серверов intranet-портала, не для mission-critical AD.`,
      code: {
        language: 'powershell',
        caption: 'Установка NLB и просмотр кластера',
        code: `Install-WindowsFeature NLB -IncludeManagementTools

# Создание кластера — обычно через nlbmgr.msc или:
Import-Module NetworkLoadBalancingClusters
New-NlbCluster -InterfaceName "Ethernet" -ClusterPrimaryIP "192.168.10.100" -ClusterOperationMode "Unicast"

Get-NlbCluster | Select ClusterName, ClusterPrimaryIP, ClusterOperationMode
Get-NlbClusterNode | Select HostName, State, DedicatedIP`,
      },
    },
    {
      title: 'Certificate Services (AD CS) — обзор',
      content: `**Active Directory Certificate Services (AD CS)** — внутренний PKI для сертификатов SMB-инфраструктуры.

**Применение:**
- 802.1X Wi‑Fi (EAP-TLS)
- VPN (SSTP, IKEv2 с cert)
- IIS HTTPS intranet
- Code signing внутренних приложений
- S/MIME почта

**Иерархия CA:**

| Уровень | Роль | SMB |
|---------|------|-----|
| **Root CA** | Корень доверия | Offline, 4096-bit, 10 лет |
| **Issuing CA** | Выдаёт сертификаты | Online на Server Core |
| **Policy/Enrollment** | Web enrollment, auto-enroll GPO | На issuing CA |

**Auto-enrollment через GPO:**
Computer Configuration → Policies → Windows Settings → Security Settings → Public Key Policies → Certificate Services Client - Auto-Enrollment

**Шаблоны сертификатов:**
- **Computer** — для серверов и ПК (802.1X)
- **User** — для S/MIME
- **Web Server** — IIS
- Duplicate template → 2048-bit, SHA256, 1-year validity

**Безопасность:**
- Root CA — выключен, в сейфе после выпуска subordinate
- CRL/OCSP — обязательно для отзыва
- Аудит выдачи сертификатов

> **SMB минимум:** один Issuing CA + GPO auto-enroll для domain computers → Wi‑Fi без пароля, только cert.`,
      code: {
        language: 'powershell',
        caption: 'Установка AD CS Enterprise CA',
        code: `Install-WindowsFeature AD-Certificate -IncludeManagementTools
Install-AdcsCertificationAuthority -CAType EnterpriseRootCA -CryptoProviderName "RSA#Microsoft Software Key Storage Provider" -KeyLength 2048 -HashAlgorithm SHA256 -ValidityPeriod Years -ValidityPeriodUnits 5

Get-CertificationAuthority | Select DisplayName, Status
certutil -ping
certutil -crl`,
      },
    },
    {
      title: 'Performance baseline — скрипты и метрики',
      content: `**Baseline** — эталонные метрики «здорового» сервера. Без baseline невозможно понять, что «медленно».

**Что собирать еженедельно:**

| Метрика | Counter / команда | Порог тревоги |
|---------|-------------------|---------------|
| CPU | \\Processor(_Total)\\% Processor Time | >80% sustained 15 min |
| RAM | Available MBytes | <500 MB free |
| Disk latency | \\PhysicalDisk(*)\\Avg. Disk sec/Read | >20 ms |
| Disk free | Get-Volume | <15% free |
| Network | \\Network Interface(*)\\Bytes Total/sec | baseline + 50% |
| Services | Get-Service Automatic Stopped | любая stopped |
| Events | Errors System 24h | >10 errors |

**Инструменты:**
- **Performance Monitor (perfmon)** — Data Collector Sets
- **Get-Counter** — PowerShell
- **PAL (Performance Analysis of Logs)** — анализ BLG
- **Windows Admin Center** — встроенные графики

**Процесс:**
1. Собери baseline в «тихий» период (ночь, выходной)
2. Сохрани CSV/BLG на \\\\fileserver\\it\\baselines\\
3. Сравнивай при инцидентах «тормозит»
4. Обновляй после major change (новая роль, миграция)

> «Сервер тормозит» → сравни текущий Get-Counter с baseline → disk queue length вырос → проверь Veeam backup window.`,
      codes: [
        {
          language: 'powershell',
          caption: 'Сбор performance baseline',
          code: `$counters = @(
  "\\Processor(_Total)\\% Processor Time",
  "\\Memory\\Available MBytes",
  "\\PhysicalDisk(_Total)\\Avg. Disk Queue Length",
  "\\PhysicalDisk(_Total)\\Avg. Disk sec/Read"
)
$sample = Get-Counter -Counter $counters -SampleInterval 2 -MaxSamples 30
$sample | ForEach-Object {
  [PSCustomObject]@{
    Timestamp = $_.Timestamp
    CPU = [math]::Round($_.CounterSamples[0].CookedValue, 1)
    FreeRAM_MB = [math]::Round($_.CounterSamples[1].CookedValue, 0)
    DiskQueue = [math]::Round($_.CounterSamples[2].CookedValue, 2)
    DiskReadSec = [math]::Round($_.CounterSamples[3].CookedValue, 4)
  }
} | Export-Csv -Path "C:\\\\Lab\\\\perf-baseline.csv" -NoTypeInformation`,
        },
        {
          language: 'powershell',
          caption: 'Scheduled baseline collection',
          code: `$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\\\\Scripts\\\\Collect-Baseline.ps1"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "03:00"
Register-ScheduledTask -TaskName "Weekly-Perf-Baseline" -Action $action -Trigger $trigger -User "SYSTEM" -RunLevel Highest`,
        },
      ],
    },
    {
      title: 'Hardening CIS Level 1 — полный чеклист',
      content: `**CIS Microsoft Windows Server Benchmark Level 1** — базовый hardening для production без критичного impact на бизнес.

**Account Policies:**
- [ ] Minimum password length: 14+ (или FGPP для админов)
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
- [ ] Disable SMBv1 (unless legacy 1С требует — isolate)
- [ ] Enable SMB encryption for sensitive shares

**RDP:**
- [ ] NLA required
- [ ] Encryption level: High
- [ ] Session timeout configured

**Defender / AV:**
- [ ] Real-time protection enabled
- [ ] Exclusions documented (Veeam, SQL)
- [ ] Signature update daily

**Применение:**
- GPO для domain members
- LGPO или DSC для standalone
- CIS-CAT или Microsoft Security Compliance Toolkit для audit

> Level 2 — для high-security (блокировка admin через RDP, Credential Guard everywhere). SMB обычно Level 1 достаточно.`,
    },
    {
      title: 'FAQ — частые вопросы по Windows Server',
      content: `**Q1: Server Core или Desktop Experience для первого DC?**
A: Desktop Experience для обучения; для production второй DC — Server Core + WAC.

**Q2: Сколько RAM нужно Hyper-V хосту на 4 VM?**
A: 4 GB host + сумма RAM VM + 20% overhead. Пример: 4+4+4+8+4 = 24 GB minimum, лучше 32 GB.

**Q3: Можно ли без CAL если все через RDS?**
A: Нет. Нужны Server license + Windows CAL + RDS CAL.

**Q4: Как обновлять Server Core без GUI?**
A: \`sconfig\` → Install Updates, или \`Install-Module PSWindowsUpdate\`, или WSUS + \`wuauclt /detectnow\`.

**Q5: Hyper-V checkpoint на DC — можно?**
A: Не рекомендуется на production DC. Используй Veeam backup.

**Q6: Чем Windows Admin Center лучше RDP?**
A: Role-based access, несколько серверов, меньше RDP-сессий, audit. Не заменяет PS для автоматизации.

**Q7: Как проверить, активирован ли сервер?**
A: \`slmgr /xpr\` или \`Get-CimInstance SoftwareLicensingProduct | Where PartialProductKey\`.

**Q8: WSUS vs Windows Update напрямую?**
A: WSUS для контроля и экономии трафика (10+ серверов/ПК). 1-2 сервера — можно напрямую с расписанием.

**Q9: Нужен ли отдельный DNS если есть DC?**
A: Нет, AD-integrated DNS на DC достаточно для SMB.

**Q10: Как безопасно перезагрузить сервер в рабочее время?**
A: Уведоми пользователей, проверь backup window, \`shutdown /r /t 300 /c "Reboot in 5 min"\`, мониторь службы после.`,
    },
    {
      title: 'Типовые ошибки и решения',
      content: `| Ошибка | Причина | Решение |
|--------|---------|---------|
| «The trust relationship failed» | Secure channel разорван | \`Test-ComputerSecureChannel -Repair\` или rejoin |
| WinRM «Access is denied» | CredSSP, firewall, не admin | Enable-PSRemoting, TrustedHosts, правильная учётка |
| «No logon servers available» | DC/DNS недоступен | Проверь IP DNS клиента, ping DC, Netlogon service |
| Disk 0 bytes free on C: | WSUS, logs, pagefile | Disk Cleanup, move WSUS content, expand VHD |
| Service won't start 7000/7009 | Dependency failed | \`Get-Service -Name X -DependentServices\`, Event Viewer |
| Hyper-V VM «no network» | Wrong vSwitch | Verify External vSwitch, VM network adapter connected |
| RDS «No licenses available» | License server down/expired | RD Licensing Manager, reinstall CALs |
| Time skew Kerberos error | NTP misconfigured | w32tm /resync, PDC emulator = reliable time source |
| «Access denied» on share | NTFS vs Share mismatch | Effective permissions, AGDLP groups |
| Windows Update stuck | Corrupted cache | Stop wuauserv, clear SoftwareDistribution |
| Server Core no sconfig | Corrupted install | Reinstall or run sconfig from full path |
| Certificate auto-enroll failed | Template permissions | Cert template → Security → Enroll for Domain Computers |`,
    },
    {
      title: 'Сценарии «день администратора»',
      content: `**Сценарий 1 — «Утро понедельника, WSUS»**

08:30 — 15 серверов pending reboot после weekend patches. Проверяешь Veeam: backup window завершился в 06:00. Планируешь reboot cascade: WSUS → file server → RDS (предупредил бухгалтерию). Используешь \`Get-WindowsUpdateLog\` на проблемном SRV-APP01 — KB failed 3 times. Вручную: \`Install-WindowsUpdate -AcceptAll -AutoReboot\`. К 10:00 все серверы patched, inventory CSV обновлён.

**Сценарий 2 — «Файловый сервер переполнен»**

11:00 — alert: D: 95% full. FSRM report: user petrov.i — 80 GB video files в \\\\Public. Screening не настроен на Public — добавляешь block *.mp4. Quota soft на petrov.i — email пользователю. Shadow Copies — место съели snapshots, уменьшаешь allocation с 20% до 10%. Robocopy archive старых файлов на cold storage. К 14:00 — 70% free.

**Сценарий 3 — «Новый сервер в production»**

Наняли DevOps — нужен SRV-DEV01. Checklist: static IP, join domain, CIS GPO applied, WinRM enabled, WAC added, Veeam job created, firewall rules documented, inventory row added, backup test restore file. Antivirus exclusions for build artifacts. Change ticket closed. Total: 3 hours following production checklist.`,
    },
    {
      title: 'Чеклист для production',
      content: `**Перед вводом сервера в production:**

**Идентификация и сеть**
- [ ] Hostname по стандарту (SRV-ROLE##)
- [ ] Статический IP, DNS, gateway documented
- [ ] Reverse DNS запись создана
- [ ] VLAN/firewall rules applied

**ОС и безопасность**
- [ ] Server Core (или обоснован GUI)
- [ ] All critical patches installed
- [ ] Activated (KMS/MAK)
- [ ] Time sync to domain hierarchy
- [ ] CIS Level 1 applied
- [ ] Local admin password in LAPS/vault
- [ ] RDP restricted, NLA enabled
- [ ] Defender configured with documented exclusions

**Роли и службы**
- [ ] Minimum roles installed
- [ ] Automatic services verified running
- [ ] Application-specific config documented

**Backup и DR**
- [ ] Veeam/WSB job created and tested
- [ ] Restore test performed (file or system state)
- [ ] RPO/RTO documented for this server

**Мониторинг**
- [ ] Event log forwarding (WEF) or SIEM
- [ ] Performance baseline captured
- [ ] Alert on disk <15%, service stopped

**Документация**
- [ ] CMDB/inventory updated
- [ ] Runbook for common tasks
- [ ] Change ticket approved
- [ ] On-call knows about new server

**Ежеквартально:**
- [ ] Patch compliance review
- [ ] Access review (local admins)
- [ ] Backup restore test
- [ ] Certificate expiry check`,
    },
    {
      title: 'Подготовка к сертификации AZ-800/801',
      content: `**Windows Server Hybrid Administrator (AZ-800 + AZ-801)** — mapping тем этой главы.

| Экзамен AZ-800 | Темы в главе |
|----------------|--------------|
| Deploy and manage AD DS | Server roles, первичная настройка |
| Manage Windows Server | Server Core, sconfig, WAC |
| Manage Hyper-V | Hyper-V раздел, checkpoints vs backup |
| Implement IP Address Management | Static IP, DHCP role overview |
| Implement Windows Server file services | File Server, FSRM, DFS, Print |
| Implement Network Load Balancing | NLB раздел |
| Implement Remote Desktop Services | RDS deployment |
| Implement WSUS | WSUS раздел |
| Monitor Windows Server | Event Viewer, performance baseline |
| Secure Windows Server | Hardening, CIS, firewall |

| Экзамен AZ-801 | Темы в главе |
|----------------|--------------|
| Secure Windows Server | CIS checklist, Tier model |
| Implement PKI | AD CS overview |
| Implement AD CS | Certificate Services |
| Manage Windows Server updates | WSUS, Windows Update |
| Implement disaster recovery | Backup integration, Hyper-V recovery |
| Monitor and troubleshoot | Troubleshooting, Event IDs |
| Implement IPAM | DNS on DC (cross-ref AD chapter) |

**Рекомендуемый порядок подготовки:**
1. Lab: 2 VM Server 2022 + 1 client
2. Пройди все practice tasks этой главы
3. Microsoft Learn path: «Prepare for AZ-800»
4. MeasureUp/Whizlabs practice exams

> AZ-801 фокус на security, DR, monitoring — overlap с backups и AD chapters.`,
    },
    {
      title: 'Вопросы с собеседования',
      content: `**1. В чём разница Server Core и Nano Server?**
Server Core — полноценная минимальная установка для ролей. Nano Server (2016) deprecated для infra roles — заменён на Server Core / containers.

**2. Как работает лицензирование per-core?**
Лицензируются все физические ядра, minimum 16 cores per server. Standard allows 2 OSE (VM), Datacenter unlimited.

**3. Что такое WinRM и чем отличается от RDP?**
WinRM — remoting для PowerShell/CIM, порт 5985/5986. RDP — графический рабочий стол, порт 3389. Admin automation → WinRM.

**4. Зачем WSUS если есть Intune?**
WSUS — on-prem control для servers и legacy. Intune — cloud MDM для endpoints. Гибрид: WSUS servers, Intune clients.

**5. Как диагностировать «медленный» file server?**
Get-Counter disk latency, check SMB sessions, antivirus scan schedule, backup job overlap, network duplex mismatch.

**6. Hyper-V Dynamic Memory — риски?**
Memory ballooning может starve guest. Не использовать на DC, SQL. OK для dev/test.

**7. Что проверить если служба не стартует?**
Dependencies, service account password, Event 7000/7009, permissions, port conflict, corrupted config.

**8. RDS vs VPN для удалёнки?**
RDS — centralized apps, licensing overhead. VPN — full network access, проще для «работай как в офисе». Часто оба.

**9. Зачем SMB signing?**
Защита от relay attacks (NTLM). Обязательно на DC. Performance impact minimal on modern hardware.

**10. Как безопасно decommission сервер?**
Migrate roles/data, remove from Veeam, disable AD computer, remove DNS records, wipe disks, update CMDB, physical disposal cert.`,
    },
  ],
  practice: [
    'Разверни Windows Server 2022 в Hyper-V (evaluation ISO). Выбери Server Core, управляй через sconfig и PowerShell',
    'Настрой статический IP, переименуй сервер, синхронизируй время, установи все обновления',
    'Через PowerShell: выведи список служб, перезапусти Spooler, проверь свободное место на дисках',
    'Установи роль AD-Domain-Services (пока не промоти — только установка роли). Проверь Get-WindowsFeature',
    'Настрой WinRM и подключись к серверу через Enter-PSSession с другой VM',
    'Настрой Windows Firewall: разреши RDP только с подсети 192.168.10.0/24',
    'Создай задачу в Task Scheduler: ежедневный PowerShell-скрипт записи uptime и свободного места в файл',
    'Изучи Event Viewer: найди 5 ошибок за последние 24 часа в System и Security. Объясни каждую',
    'Установи Windows Admin Center, добавь сервер, проверь dashboard CPU/RAM/Disk',
    'Составь таблицу лицензий: сервер (edition, cores), CAL (User/Device), RDS CAL — для гипотетического офиса 30 человек',
    'Документируй inventory: hostname, IP, роли, версия ОС, RAM, backup schedule — шаблон для 3 серверов',
    'Симулируй проблему: останови службу DNS, наблюдай симптомы на клиенте, восстанови, задокументируй Event ID',
    'Пройди лабораторную работу Server Core (15 шагов): WinRM, FS-FileServer, share, baseline CSV',
    'Настрой FSRM: soft quota 2 GB на test share, file screen block *.exe. Проверь срабатывание',
    'Собери performance baseline через Get-Counter, сохрани CSV. Сравни после искусственной нагрузки (CPU stress)',
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
}
