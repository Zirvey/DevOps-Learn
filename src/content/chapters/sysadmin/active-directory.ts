import type { Chapter } from '../../../types'

export const activeDirectoryChapter: Chapter = {
  id: 'active-directory',
  slug: 'active-directory',
  title: 'Active Directory — полное руководство',
  moduleId: 'sysadmin',
  order: 1,
  duration: '12–16 часов',
  level: 'beginner',
  description:
    'Глубокое изучение AD DS: проектирование леса и домена, FSMO, репликация, trusts, DNS, sites, FGPP, LAPS, Recycle Bin, troubleshooting и PowerShell cookbook',
  sections: [
    {
      title: 'Что такое Active Directory',
      content: `**Active Directory Domain Services (AD DS)** — служба каталогов Microsoft. Централизует всё, что связано с идентификацией в Windows-офисе.

**Что даёт AD:**
- **Аутентификация** — логин/пароль, Kerberos tickets
- **Авторизация** — группы, права на файлы, принтеры, приложения
- **Политики** — GPO на пользователей и компьютеры
- **DNS** — интегрированная зона домена, SRV-записи
- **Централизованное управление** — один каталог вместо локальных учёток

**Без AD в офисе:**
- Локальные учётки на каждом ПК
- Хаос с паролями, нет единого SSO
- Невозможно централизовать политики
- Offboarding = физический обход каждого ПК

**С AD:**
- Один логин \`ivan.petrov@company.local\` — доступ к файлам, почте, VPN, Wi‑Fi (802.1X)
- Блокировка учётки = мгновенный отзыв доступа везде
- GPO = единые настройки на всех ПК

> AD — **не просто база пользователей**. Это фундамент всей Windows-инфраструктуры офиса. Потеря AD = остановка бизнеса.`,
    },
    {
      title: 'Проектирование леса и домена',
      content: `**Forest (лес)** — верхний уровень безопасности и репликации схемы. Один лес = общая схема, транзитивное доверие внутри.

**Domain (домен)** — граница администрирования и репликации. Все DC домена реплицируют **все** данные домена.

**Правила проектирования для SMB:**

| Решение | Рекомендация SMB |
|---------|-----------------|
| Количество лесов | **1 лес** — всегда, если нет M&A |
| Количество доменов | **1 домен** — для офиса до 500 человек |
| Имя домена | \`company.local\` или \`corp.company.ru\` |
| NetBIOS | \`COMPANY\` (короткое, ≤15 символов) |
| Functional Level | Максимальный поддерживаемый (Win2016+) |

**Почему один домен:**
- Простота администрирования
- Нет междоменной репликации
- Один набор GPO
- Достаточно для 99% SMB

**Когда несколько доменов:**
- Поглощение компании (M&A) — отдельный домен в том же лесу
- Регуляторные требования (банки, госсектор)
- Географически разделённые бизнес-единицы с разными админами

**Имя домена — необратимое решение:**
- \`.local\` — mDNS конфликт с Apple Bonjour (решаемо)
- Публичное имя (\`company.ru\`) — не создавай AD-домен с публичным именем, если оно не твоё
- Рекомендация: \`corp.company.ru\` или \`ad.company.local\`

**Реальный кейс:** офис 60 человек, один домен \`company.local\`, два DC, одна OU-структура. Работает 10+ лет без изменений.`,
    },
    {
      title: 'OU-структура и делегирование',
      content: `**OU (Organizational Unit)** — контейнер для организации объектов, делегирования прав и привязки GPO.

**Типовая структура SMB (30–100 человек):**
\`\`\`
company.local
├── OU=_Admin            (серверы, DC — без пользовательских GPO)
│   ├── OU=DomainControllers
│   └── OU=MemberServers
├── OU=Users
│   ├── OU=Sales
│   ├── OU=IT
│   ├── OU=HR
│   ├── OU=Management
│   └── OU=Disabled       (уволенные, 30-дневный карантин)
├── OU=Computers
│   ├── OU=Workstations
│   ├── OU=Laptops
│   └── OU=Kiosks
├── OU=Groups             (все security groups)
└── OU=ServiceAccounts
\`\`\`

**Правила:**
- **Не** клади пользователей в default containers (CN=Users) — нельзя привязать GPO
- **Не** клади компьютеры в CN=Computers — то же
- Префикс \`_\` для админских OU — сортировка вверху
- Отдельная OU=Disabled для offboarding

**Делегирование:**
- Helpdesk: сброс паролей, unlock — на OU=Users (без Domain Admin!)
- Sales manager: добавление в G_Sales — на OU=Sales
- GPO editing: IT L2 — на конкретные GPO через GPMC Delegation

> **AGDLP:** Account → Global group → Domain Local group → Permission. Никогда не назначай права напрямую пользователю.`,
    },
    {
      title: 'Создание домена и promote DC',
      content: `**Первый DC в новом лесу — пошагово:**

1. Windows Server установлен, статический IP
2. Hostname задан (SRV-DC01)
3. DNS указывает на себя (127.0.0.1)
4. Время синхронизировано
5. Install-WindowsFeature AD-Domain-Services
6. Install-ADDSForest (или мастер в Server Manager)
7. Перезагрузка
8. Проверка: dcdiag, Get-ADDomain

**DSRM (Directory Services Restore Mode) пароль:**
- Отдельный пароль, **не** domain admin
- Нужен для восстановления AD в безопасном режиме
- Запиши в password vault!

**Functional Levels:**
- Forest Functional Level — возможности всего леса
- Domain Functional Level — возможности домена
- Ставь максимальный, поддерживаемый **самым старым** DC/OS в домене`,
      code: {
        language: 'powershell',
        caption: 'Создание нового леса и домена',
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
      title: 'Пользователи, группы и AGDLP',
      content: `**Типы объектов AD:**

| Объект | Назначение | Пример |
|--------|------------|--------|
| **User** | Сотрудник | ivan.petrov |
| **Group** | Security / Distribution | G_Sales, DL_Share_Sales_R |
| **Computer** | ПК или сервер в домене | WS-IVAN01 |
| **Contact** | Внешний человек без учётки | partner@external.com |
| **Service Account** | Учётка для службы/приложения | svc_backup |

**Группы — scope (область):**

| Scope | Члены | Использование |
|-------|-------|--------------|
| **Domain Local** | Любые из леса | Права на ресурсы в домене |
| **Global** | Только из своего домена | Группировка пользователей |
| **Universal** | Любые из леса | Мульти-доменные леса |

**AGDLP pattern (Account → Global → Domain Local → Permission):**
\`\`\`
ivan.petrov → G_Sales → DL_Share_Sales_RW → NTFS Modify на \\\\fileserver\\sales
\`\`\`

**Атрибуты пользователя:**
- \`sAMAccountName\` — логин (ivan.petrov)
- \`UserPrincipalName\` — email-style (ivan.petrov@company.local)
- \`displayName\` — отображаемое имя
- \`memberOf\` — группы (не задавай вручную — Add-ADGroupMember)`,
      codes: [
        {
          language: 'powershell',
          caption: 'Создание пользователей и групп — cookbook',
          code: `New-ADUser -Name "Ivan Petrov" -SamAccountName "ivan.petrov" -UserPrincipalName "ivan.petrov@company.local" -Path "OU=Sales,OU=Users,DC=company,DC=local" -AccountPassword (ConvertTo-SecureString "TempPass123!" -AsPlainText -Force) -Enabled $true -ChangePasswordAtLogon $true -Description "Sales Manager"

New-ADGroup -Name "G_Sales" -GroupScope Global -Path "OU=Groups,DC=company,DC=local"
New-ADGroup -Name "DL_Share_Sales_RW" -GroupScope DomainLocal -Path "OU=Groups,DC=company,DC=local"
Add-ADGroupMember -Identity "G_Sales" -Members "ivan.petrov"
Add-ADGroupMember -Identity "DL_Share_Sales_RW" -Members "G_Sales"

Get-ADUser -Filter * -SearchBase "OU=Sales,OU=Users,DC=company,DC=local" -Properties MemberOf | Select Name, SamAccountName, @{N='Groups';E={$_.MemberOf -join '; '}}`,
        },
        {
          language: 'powershell',
          caption: 'Offboarding — блокировка и карантин',
          code: `Disable-ADAccount -Identity "ivan.petrov"
Set-ADUser -Identity "ivan.petrov" -Description "DISABLED $(Get-Date -Format yyyy-MM-dd) - offboarding"
Move-ADObject -Identity (Get-ADUser "ivan.petrov").DistinguishedName -TargetPath "OU=Disabled,OU=Users,DC=company,DC=local"
Get-ADUser "ivan.petrov" -Properties MemberOf | Select -Expand MemberOf | ForEach-Object { Remove-ADGroupMember -Identity $_ -Members "ivan.petrov" -Confirm:$false }`,
        },
      ],
    },
    {
      title: 'FSMO роли — глубокое погружение',
      content: `**FSMO (Flexible Single Master Operations)** — 5 ролей, которые могут изменяться только на одном DC в каждый момент времени.

| # | Роль | Scope | Назначение | Что сломается без неё |
|---|------|-------|------------|----------------------|
| 1 | **Schema Master** | Forest | Изменения схемы AD (новые атрибуты, классы) | Нельзя расширить схему (Exchange, LAPS) |
| 2 | **Domain Naming Master** | Forest | Создание/удаление доменов в лесу | Нельзя добавить домен |
| 3 | **RID Master** | Domain | Выдача блоков RID (Relative IDs) | Нельзя создать новые объекты |
| 4 | **PDC Emulator** | Domain | Время, GPO, пароли, legacy NT4 | Рассинхронизация времени, GPO |
| 5 | **Infrastructure Master** | Domain | Обновление cross-domain ссылок | «Phantom» объекты в GC |

**Где размещать в SMB (2 DC):**

| Роль | DC01 | DC02 |
|------|------|------|
| Schema Master | ✓ | |
| Domain Naming Master | ✓ | |
| RID Master | ✓ | |
| PDC Emulator | ✓ | |
| Infrastructure Master | ✓ | |

При 2 DC — все роли на DC01 (нормально для SMB). При добавлении DC03 — можно распределить.

**PDC Emulator — особый:**
- Клиенты синхронизируют время с PDC Emulator
- PDC Emulator синхронизируется с внешним NTP
- При смене пароля — немедленная репликация на PDC
- Legacy NT4 BDC синхронизируются с PDC

**Передача ролей (seize — только при потере DC!):**
\`Move-ADDirectoryServerOperationMasterRole\` — штатная передача
\`Move-ADDirectoryServerOperationMasterRole -Seize\` — принудительный захват (DC мёртв)`,
      code: {
        language: 'powershell',
        caption: 'Просмотр и передача FSMO ролей',
        code: `Get-ADForest | Select SchemaMaster, DomainNamingMaster
Get-ADDomain | Select PDCEmulator, RIDMaster, InfrastructureMaster

# Штатная передача всех ролей на DC02
Move-ADDirectoryServerOperationMasterRole -Identity "SRV-DC02" -OperationMasterRole SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster

# Проверка
Get-ADDomain | Select PDCEmulator, RIDMaster, InfrastructureMaster`,
      },
    },
    {
      title: 'Репликация и топология',
      content: `**Multi-master replication:** любой DC принимает изменения, реплицирует на остальные. Конфликты решаются по timestamp (последний пишет — побеждает).

**Типы репликации:**

| Тип | Описание |
|-----|----------|
| **Intra-site** | Внутри сайта — по расписанию (15 сек) |
| **Inter-site** | Между сайтами — по расписанию (15 мин – 3 часа) |
| **Inbound/Outbound** | Направление потока репликации |

**Connection Objects:** KCC (Knowledge Consistency Checker) автоматически создаёт топологию репликации. Не редактируй вручную без причины.

**Мониторинг репликации:**

| Команда | Что показывает |
|---------|---------------|
| \`repadmin /replsummary\` | Сводка: последняя репликация, ошибки |
| \`repadmin /showrepl\` | Детали по каждому партнёру |
| \`repadmin /syncall\` | Принудительная синхронизация |
| \`dcdiag /v\` | Полная диагностика DC |

**Типичные ошибки репликации:**

| Ошибка | Причина | Решение |
|--------|---------|---------|
| 1722 RPC failed | Firewall, DC недоступен | Проверь порты, ping |
| 8614 (USN rollback) | Восстановление DC из старого бэкапа | Demote + promote или authoritative restore |
| 1311 (stale servers) | DC давно offline | Удалить metadata (ntdsutil) |
| Lingering objects | Объект удалён на одном DC, нет на другом | repadmin /removelingeringobjects |

> **Правило:** если DC offline > 60 дней (tombstone lifetime) — не включай его обратно. Demote и заново promote.`,
      codes: [
        {
          language: 'powershell',
          caption: 'Диагностика репликации',
          code: `repadmin /replsummary
repadmin /showrepl /csv | ConvertFrom-Csv | Where {$_.'Number of Failures' -gt 0}

Get-ADReplicationPartnerMetadata -Target "SRV-DC01" | Select Partner, LastReplicationSuccess, LastReplicationResult

# Принудительная репликация
repadmin /syncall SRV-DC01 /AdeP`,
        },
      ],
    },
    {
      title: 'Sites, Subnets и планирование',
      content: `**AD Sites** — логическое представление физической сети. Влияет на репликацию, аутентификацию, GPO.

**Зачем sites в SMB:**
- Даже с одним офисом — создай default site
- При втором офисе — site per location, inter-site replication
- Клиенты аутентифицируются на ближайшем DC (site-aware)

**Компоненты:**
- **Site** — группа подсетей с хорошей связностью
- **Subnet** — привязка IP-подсети к site
- **Site Link** — связь между sites, определяет расписание репликации
- **Site Link Bridge** — транзитивность между links

**Типовая конфигурация SMB (один офис):**
\`\`\`
Site: Default-First-Site-Name
  Subnet: 192.168.10.0/24
  DC: SRV-DC01, SRV-DC02
\`\`\`

**Два офиса:**
\`\`\`
Site: HQ-Moscow
  Subnet: 192.168.10.0/24
  DC: SRV-DC01, SRV-DC02
Site: Branch-SPb
  Subnet: 192.168.20.0/24
  DC: SRV-DC03
Site-Link: HQ-Moscow <-> Branch-SPb (cost 100, replicate every 15 min)
\`\`\`

**Без правильных subnets:** клиент в филиале может аутентифицироваться на DC в головном офисе через WAN → медленный логин.`,
      code: {
        language: 'powershell',
        caption: 'Создание sites и subnets',
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
      title: 'Trusts (доверительные отношения)',
      content: `**Trust** — механизм доступа ресурсов между доменами/лесами.

**Типы trusts:**

| Тип | Описание | Когда |
|-----|----------|-------|
| **Parent-Child** | Автоматически при создании child domain | Мульти-доменный лес |
| **Tree-Root** | Между деревьями в лесу | Мульти-доменный лес |
| **External** | Между доменами разных лесов | Партнёр, поглощение |
| **Forest** | Полное доверие между лесами | M&A, федерация |
| **Shortcut** | Оптимизация аутентификации | Много доменов в лесу |

**Направление:**
- **One-way** — A доверяет B (пользователи B → ресурсы A)
- **Two-way** — взаимный доступ

**Transitivity:**
- **Transitive** — доверие распространяется (внутри леса)
- **Non-transitive** — только прямое (external trust)

**Для SMB (один домен):** trusts не нужны. Знай теорию на случай M&A или интеграции с партнёром.

**Selective Authentication:** на external/forest trust — явно разрешить доступ к конкретным ресурсам (безопаснее).`,
      code: {
        language: 'powershell',
        caption: 'Просмотр и создание trusts',
        code: `Get-ADTrust -Filter *
nltest /domain_trusts

# External trust (пример — lab only)
# New-ADTrust -Name "partner.local" -Type External -Direction Bidirectional -Target "partner.local"`,
      },
    },
    {
      title: 'DNS в Active Directory',
      content: `**AD-integrated DNS** — зона \`company.local\` хранится в AD (реплицируется вместе с каталогом). Не нужен отдельный бэкап DNS.

**Типы зон:**
- **Primary (AD-integrated)** — основная, реплицируется
- **Secondary** — копия с master (legacy, не рекомендуется)
- **Stub** — только NS и glue records
- **Forward Lookup Zone** — имя → IP
- **Reverse Lookup Zone** — IP → имя (для диагностики)

**Критичные SRV-записи AD:**
- \`_ldap._tcp.company.local\` — локатор домена
- \`_kerberos._tcp.company.local\` — Kerberos
- \`_gc._tcp.company.local\` — Global Catalog

**Forwarders:**
- DC DNS → forwarders (8.8.8.8, провайдер) для внешних имён
- **Не** ставь forwarders на клиентских DNS — только на DC

**Проблемы DNS в AD:**

| Симптом | Причина | Решение |
|---------|---------|---------|
| «Домен есть, интернета нет» | Нет forwarders | Добавь forwarders на DNS DC |
| «Не могу присоединить к домену» | Клиент не использует DC DNS | DNS клиента → IP DC |
| «Медленный логин» | Нет SRV-записей | \`dcdiag /test:dns\`, netdiag |
| Дублирующиеся записи | Старые записи после переименования | DNS scavenging, очистка |

**Dynamic Updates:** AD DNS принимает динамические регистрации от клиентов (Secure only).`,
      codes: [
        {
          language: 'powershell',
          caption: 'DNS диагностика и настройка',
          code: `Get-DnsServerZone | Select ZoneName, ZoneType, IsAutoCreated
Get-DnsServerResourceRecord -ZoneName "company.local" -RRType Srv | Select HostName, RecordData

Set-DnsServerForwarder -IPAddress 8.8.8.8, 1.1.1.1
dcdiag /test:dns

# С клиента:
nslookup company.local
nslookup -type=srv _ldap._tcp.company.local
nslookup google.com`,
        },
      ],
    },
    {
      title: 'Политики паролей и Fine-Grained Password Policy',
      content: `**Default Domain Policy** — одна политика паролей на весь домен. Для SMB часто достаточно.

| Параметр | Рекомендация SMB | NIST SP 800-63B |
|----------|-----------------|-----------------|
| Minimum length | 12+ символов | 8+ (длиннее = лучше) |
| Complexity | Включена | Не обязательна при длине 15+ |
| Maximum age | 90 дней или «никогда» | Не менять без причины |
| Lockout threshold | 5 попыток | 5–10 |
| Lockout duration | 30 мин | 15–30 мин |

**Fine-Grained Password Policy (FGPP):**
- Разные политики для разных групп
- Применяется к **группе**, не OU
- Пример: админы — 16 символов, 3 попытки; пользователи — 12 символов, 5 попыток

**Современный подход (2024+):**
- Длинные пароли (12–16+) вместо сложных коротких
- MFA вместо частой смены пароля
- Passwordless (Windows Hello, FIDO2) — если инфраструктура позволяет
- Запретить распространённые пароли (Azure AD Password Protection, или custom list)

> **Не** ослабляй политику паролей «для удобства». Один взломанный аккаунт = доступ ко всему домену.`,
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
      title: 'LAPS — управление локальными паролями',
      content: `**LAPS (Local Administrator Password Solution)** — автоматическая ротация пароля локального Administrator на каждом ПК.

**Зачем:**
- Один пароль local admin на всех ПК = атака lateral movement
- LAPS: уникальный пароль на каждом ПК, хранится в AD
- Только authorized admins могут читать пароль

**LAPS (legacy) vs Windows LAPS (2023+):**
- Legacy LAPS: отдельный MSI, атрибут \`ms-Mcs-AdmPwd\`
- Windows LAPS: встроен в Windows 11 22H2+ / Server 2022 April Update+, атрибут \`msLAPS-Password\`

**Настройка (Windows LAPS):**
1. GPO: Enable Windows LAPS
2. Password Settings: длина, возраст, complexity
3. AD permissions: кто может читать пароль
4. Клиент: автоматически на поддерживаемых ОС

**Реальный сценарий:** helpdesk получает пароль local admin конкретного ПК через PowerShell → решает проблему → пароль автоматически ротируется по расписанию.`,
      code: {
        language: 'powershell',
        caption: 'Чтение LAPS пароля (Windows LAPS)',
        code: `Get-LapsADPassword -Identity "WS-IVAN01" -AsPlainText
# Требует прав на чтение msLAPS-Password атрибута

# Legacy LAPS:
# Get-ADComputer WS-IVAN01 -Properties ms-Mcs-AdmPwd | Select ms-Mcs-AdmPwd

# Массовая проверка: у каких ПК нет LAPS пароля
Get-ADComputer -Filter * -SearchBase "OU=Workstations,OU=Computers,DC=company,DC=local" -Properties msLAPS-Password | Where {-not $_.'msLAPS-Password'} | Select Name`,
      },
    },
    {
      title: 'AD Recycle Bin и восстановление объектов',
      content: `**AD Recycle Bin** — «корзина» для удалённых AD-объектов. Включить **до** первого удаления!

**Без Recycle Bin:**
- Удалённый объект → tombstone (60–180 дней) → полное удаление
- Authoritative restore из бэкапа — единственный способ

**С Recycle Bin:**
- Удалённый объект → deleted objects container (сохраняет все атрибуты)
- Восстановление одной командой
- Срок: \`msDS-deletedObjectLifetime\` (по умолчанию = tombstone lifetime)

**Включение (необратимо!):**
\`Enable-ADOptionalFeature 'Recycle Bin Feature' -Scope ForestOrConfigurationSet -Target company.local\`

**Восстановление:**
\`Get-ADObject -Filter 'isDeleted -eq $true' -IncludeDeletedObjects\`
\`Restore-ADObject -Identity "CN=Ivan Petrov,OU=Disabled,...\`

**Реальный кейс:** админ случайно удалил OU=Sales с 15 пользователями. С Recycle Bin — восстановление за 5 минут. Без — authoritative restore всего DC, downtime 2–4 часа.`,
      code: {
        language: 'powershell',
        caption: 'AD Recycle Bin — включение и восстановление',
        code: `Enable-ADOptionalFeature 'Recycle Bin Feature' -Scope ForestOrConfigurationSet -Target (Get-ADForest).Name

Get-ADObject -Filter 'isDeleted -eq $true' -IncludeDeletedObjects -Properties * | Select Name, ObjectClass, Deleted, LastKnownParent

# Восстановление удалённого пользователя
Restore-ADObject -Identity "<GUID из Deleted Objects>"

# Восстановление всей OU (содержимое тоже в deleted objects)
Get-ADObject -Filter 'isDeleted -eq $true -and ObjectClass -eq "organizationalUnit"' -IncludeDeletedObjects | Restore-ADObject`,
      },
    },
    {
      title: 'Присоединение компьютеров к домену',
      content: `**Join domain — требования:**
- DNS клиента → IP DC (обязательно!)
- Время синхронизировано (Kerberos ±5 мин)
- Сеть до DC: порты 88, 135, 389, 445, 636, 3268, 3269, 53, 464
- Учётка с правом «Join computer to domain» (по умолчанию — Authenticated Users, 10 joins)

**Способы join:**
1. GUI: Settings → System → About → Join domain
2. PowerShell: \`Add-Computer -DomainName company.local\`
3. GPO + SCCM/Intune (автоматический join при деплое)
4. OOBE (Out of Box Experience) — при первой настройке ПК

**Проблема «trust relationship failed»:**
- Сбой secure channel между ПК и DC
- Причины: давно не был в сети, клонированный образ, смена пароля DC

**Решения:**
1. \`Test-ComputerSecureChannel -Repair -Credential (Get-Credential)\`
2. \`Reset-ComputerMachinePassword\` (PowerShell от локального админа)
3. Переподключить к домену (leave + join)
4. В крайнем случае — пересоздать компьютерный объект в AD`,
      code: {
        language: 'powershell',
        caption: 'Join и repair secure channel',
        code: `Add-Computer -DomainName "company.local" -OUPath "OU=Workstations,OU=Computers,DC=company,DC=local" -Credential (Get-Credential) -Restart

# Repair trust relationship (на проблемном ПК):
Test-ComputerSecureChannel -Verbose
Test-ComputerSecureChannel -Repair -Credential (Get-Credential)

# Перемещение компьютера в правильную OU после join
Get-ADComputer WS-IVAN01 | Move-ADObject -TargetPath "OU=Workstations,OU=Computers,DC=company,DC=local"`,
      },
    },
    {
      title: 'Второй DC и отказоустойчивость',
      content: `**Один DC = single point of failure.** Минимум 2 DC для любого production.

**Добавление второго DC:**
1. Установить Windows Server на второй VM/сервер
2. Статический IP (другой, в той же подсети)
3. DNS → первый DC (пока не станет DC сам)
4. Join в домен (станет member server)
5. Install-ADDSDomainController

**Что получаем:**
- Репликация AD, DNS, GC
- Аутентификация при падении DC01
- Распределение FSMO (опционально)

**Global Catalog (GC):**
- По умолчанию на каждом DC
- Нужен для аутентификации в мульти-доменных лесах
- В однодоменном SMB — GC на всех DC

**RODC (Read-Only DC):**
- Для филиалов без защищённой серверной
- Только чтение, кэш учёток по политике
- SMB с одним офисом — не нужен`,
      code: {
        language: 'powershell',
        caption: 'Добавление второго DC',
        code: `Import-Module ADDSDeployment
Install-ADDSDomainController -DomainName "company.local" -InstallDns:$true -Credential (Get-Credential) -SafeModeAdministratorPassword (ConvertTo-SecureString "DSRM-P@ss!" -AsPlainText -Force)

# После перезагрузки:
Get-ADDomainController -Filter * | Select Name, Site, IsGlobalCatalog, OperationMasterRoles
dcdiag /s:SRV-DC01 /s:SRV-DC02 /v`,
      },
    },
    {
      title: 'Типичные ошибки AD и troubleshooting',
      content: `**Чеклист диагностики AD:**

| # | Проверка | Команда |
|---|----------|---------|
| 1 | DC здоров? | \`dcdiag /v\` |
| 2 | Репликация OK? | \`repadmin /replsummary\` |
| 3 | DNS работает? | \`dcdiag /test:dns\` |
| 4 | Время синхронизировано? | \`w32tm /query /status\` |
| 5 | FSMO на месте? | \`Get-ADDomain\`, \`Get-ADForest\` |
| 6 | Службы запущены? | NTDS, DNS, Netlogon, KDC, W32Time |

**Частые ошибки:**

| Ошибка | Симптом | Решение |
|--------|---------|---------|
| USN rollback | Event 2103, репликация остановлена | Demote DC, заново promote |
| Lingering objects | Event 1388, 1988 | repadmin /removelingeringobjects |
| DNS stale records | Медленный логин, «нет домена» | Scavenging, очистка |
| Time skew | Kerberos pre-auth failed | NTP на PDC → external |
| RID pool exhausted | Нельзя создать объекты | Проверь RID Master, seize если нужно |
| Tombstone lifetime | DC offline >180 дней | Не включать! Demote + promote |

**Инструменты:**
- **dcdiag** — комплексная диагностика
- **repadmin** — репликация
- **netdom** — trust, secure channel
- **ntdsutil** — metadata cleanup, authoritative restore
- **Event Viewer** → Directory Service log`,
      codes: [
        {
          language: 'powershell',
          caption: 'Полная диагностика AD',
          code: `dcdiag /v /c /d /e > C:\temp\dcdiag-report.txt
repadmin /replsummary
repadmin /showutdvec
w32tm /query /status

Get-ADUser -Filter {Enabled -eq $true -and PasswordExpired -eq $true} | Select Name, SamAccountName
Search-ADAccount -AccountExpired -UsersOnly
Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly | Select Name, SamAccountName, LastLogonDate`,
        },
      ],
    },
    {
      title: 'PowerShell AD module — cookbook',
      content: `**Справочник команд для ежедневной работы админа AD.**

Все команды требуют \`Import-Module ActiveDirectory\` (RSAT или на DC).

**Категории:**
- Пользователи: New/Get/Set/Disable/Enable/Remove-ADUser
- Группы: New/Get/Add/Remove-ADGroupMember
- Компьютеры: New/Get/Add-Computer
- OU: New/Get/Move-ADObject
- GPO: Get-GPO, Get-GPInheritance (модуль GroupPolicy)
- Репликация: Get-ADReplicationPartnerMetadata
- Поиск: Get-ADObject, Search-ADAccount

> Сохрани этот cookbook в своём runbook. 80% ежедневных задач — эти команды.`,
      codes: [
        {
          language: 'powershell',
          caption: 'Cookbook: пользователи',
          code: `# Создание
New-ADUser -Name "Test User" -SamAccountName "test.user" -UserPrincipalName "test.user@company.local" -Path "OU=IT,OU=Users,DC=company,DC=local" -AccountPassword (ConvertTo-SecureString "Pass123!" -AsPlainText -Force) -Enabled $true

# Поиск
Get-ADUser -Filter "Department -eq 'Sales'" -Properties Department, Title, Manager
Get-ADUser -Identity "ivan.petrov" -Properties MemberOf, PasswordLastSet, LastLogonDate

# Сброс пароля
Set-ADAccountPassword -Identity "ivan.petrov" -Reset -NewPassword (ConvertTo-SecureString "NewPass123!" -AsPlainText -Force)
Unlock-ADAccount -Identity "ivan.petrov"

# Массовый импорт из CSV
Import-Csv users.csv | ForEach-Object { New-ADUser -Name "$($_.FirstName) $($_.LastName)" -SamAccountName $_.SamAccountName -UserPrincipalName "$($_.SamAccountName)@company.local" -Path "OU=$($_.OU),OU=Users,DC=company,DC=local" -AccountPassword (ConvertTo-SecureString $_.TempPassword -AsPlainText -Force) -Enabled $true -ChangePasswordAtLogon $true }`,
        },
        {
          language: 'powershell',
          caption: 'Cookbook: аудит и отчёты',
          code: `# Неактивные учётки (>90 дней)
Search-ADAccount -AccountInactive -TimeSpan 90 -UsersOnly | Select Name, SamAccountName, LastLogonDate | Export-Csv inactive-users.csv

# Пароли, которые никогда не менялись
Get-ADUser -Filter * -Properties PasswordLastSet | Where {$_.PasswordLastSet -eq $null} | Select Name, SamAccountName

# Все члены группы Domain Admins
Get-ADGroupMember "Domain Admins" -Recursive | Select Name, ObjectClass

# Компьютеры, не входившие в домен >30 дней
Get-ADComputer -Filter * -Properties LastLogonDate | Where {$_.LastLogonDate -lt (Get-Date).AddDays(-30)} | Select Name, LastLogonDate`,
        },
      ],
    },
    {
      title: 'Безопасность AD — Tiered Administration',
      content: `**Tiered Administration Model** — разделение привилегий по уровням.

| Tier | Что защищаем | Кто имеет доступ | С чего логинятся |
|------|-------------|-----------------|-----------------|
| **Tier 0** | AD, DC, PKI | Domain Admins (минимум!) | PAW only |
| **Tier 1** | Серверы | Server Admins | Admin workstation |
| **Tier 2** | Рабочие станции | Helpdesk | Обычный ПК |

**Protected Users group:**
- Защита от credential caching, NTLM, DES
- Добавь всех Tier 0 админов
- Kerberos только (no NTLM fallback)

**gMSA (Group Managed Service Accounts):**
- Сервисные учётки без пароля (AD управляет)
- Для SQL, IIS, backup services

**Audit Policy:**
- Logon events (4624, 4625)
- Account management (4720–4756)
- Directory Service Access
- Централизуй в SIEM или WEF

**Реальный кейс:** админ логинится Domain Admin на рабочей станции → malware крадёт hash → lateral movement на DC. Решение: PAW + Tier 0 только на DC.`,
    },
    {
      title: 'Multi-site AD — проектирование и репликация',
      content: `**AD Sites** — логическая группировка подсетей для оптимизации репликации и аутентификации.

**Когда нужны несколько sites:**
- Филиалы с DC через WAN
- Разные подсети в одном здании ( VLAN )
- RODC в удалённых локациях
- Контроль трафика репликации

**Компоненты site topology:**

| Объект | Назначение | Пример |
|--------|------------|--------|
| **Site** | Группа подсетей | Site-Moscow, Site-SPb |
| **Subnet** | IP → Site mapping | 192.168.10.0/24 → Moscow |
| **Site Link** | Связь между sites | Moscow-SPb, cost 100 |
| **Site Link Bridge** | Transit через hub | Hub: Moscow |

**Проектирование SMB (головной офис + филиал):**
\`\`\`
Site-HeadOffice (192.168.10.0/24)
  └── DC01, DC02 (writable)
Site-Branch (192.168.20.0/24)
  └── RODC01 (read-only)
Site Link: HeadOffice-Branch, cost 200, schedule 08:00-20:00 replicate
\`\`\`

**KCC (Knowledge Consistency Checker):**
- Автоматически строит топологию репликации
- Intersite: обычно через bridgehead server
- Intrasite: full mesh (<15 DC)

**Клиентская логика:**
- DC Locator выбирает DC в своём site
- Fallback на ближайший site по cost

> **Ошибка:** все DC в Default-First-Site-Name — репликация не оптимизирована, клиенты могут ходить через WAN на DC.`,
      code: {
        language: 'powershell',
        caption: 'Создание sites и subnets',
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
      content: `**RODC (Read-Only Domain Controller)** — DC только для чтения, для филиалов с низким уровнем доверия.

**Преимущества:**
- Кэш credentials только разрешённых пользователей (Password Replication Policy)
- Нельзя изменить AD с RODC
- Меньше attack surface в филиале
- Работает при обрыве WAN (cached creds)

**Ограничения:**
- Не держит FSMO роли
- Не поддерживает некоторые apps требующие writable DC
- Password Replication Policy — явный allow/deny list

**Password Replication Policy (PRP):**
- **Allowed:** Domain Admins (если нужно), Branch users group
- **Denied:** Enterprise Admins, Schema Admins, все Tier 0

**Развёртывание:**
1. Writable DC в hub office
2. \`Install-ADDSDomainController -ReadOnlyReplica -SiteName "Site-Branch"\`
3. Настрой PRP: deny Tier 0, allow branch users
4. Staged installation — media для offline initial sync

**Мониторинг:**
\`repadmin /rodcpwdrepl SRV-RODC01\` — какие пароли реплицированы

> **Кейс:** магазин с 5 кассирами, нет IT — RODC + локальный Wi‑Fi, при краже сервера нет writable AD copy.`,
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
      title: 'AD CS — обзор Certificate Services в AD',
      content: `**AD CS в контексте Active Directory** — PKI интegrated с доменом для auto-enrollment и identity.

**Связь AD + PKI:**
- Enterprise CA — member of domain, publishes to AD
- Certificate templates in AD (Configuration partition)
- GPO auto-enrollment for domain members
- Cert mapping to user/computer objects

**Шаблоны для AD-инфраструктуры:**

| Template | Назначение |
|----------|------------|
| Domain Controller | LDAPS on DC |
| Kerberos Authentication | Smart card logon |
| Domain Computer | 802.1X, VPN |
| Domain User | S/MIME, EFS |
| Workstation Authentication | Client auth |

**CRL Distribution Points:**
- Published in AD and HTTP
- Clients check revocation before trust

**Для админа AD:**
- LDAPS (636) требует cert на DC — используй auto-enroll template
- ldaps:// для PowerShell AD Web Services
- Bloodhound/ldap signing — cert optional but recommended

> Детальная установка CA — в главе Windows Server; здесь фокус на integration с AD objects.`,
    },
    {
      title: 'Azure AD Connect — гибридная идентичность',
      content: `**Azure AD Connect (AAD Connect)** — синхронизация on-prem AD с Microsoft Entra ID (Azure AD).

**Зачем SMB нужен hybrid:**
- M365 с тем же UPN что и AD
- SSO в облако без повторного пароля
- Conditional Access + on-prem legacy apps
- Password Hash Sync или Pass-through Auth

**Режимы аутентификации:**

| Режим | Описание | SMB рекомендация |
|-------|----------|-----------------|
| **Password Hash Sync** | Hash в облако | Простой, resilient |
| **Pass-through Auth** | Auth on-prem agent | Строгие compliance |
| **Federation (AD FS)** | SAML tokens | Legacy, сложнее |
| **Seamless SSO** | Kerberos to cloud | + PHS или PTA |

**Типовая установка:**
1. Server 2019/2022 member (не DC!) — SRV-AADCONNECT01
2. .NET, TLS 1.2
3. Service account: AD sync permissions (MS docs)
4. OU filtering — sync only needed OUs
5. Optional: writeback (groups, devices)

**Express settings vs Custom:**
- Express: all OUs, PHS, auto upgrade
- Custom: select OUs, exclude service accounts, staging mode

**Staging mode:**
- Второй AAD Connect server hot standby
- Не sync пока не activated

**Troubleshooting:**
- IdFix — fix UPN, duplicates before sync
- Synchronization Service Manager — connector status
- Event 6600-6699 in Application log

> **Кейс:** ivan.petrov@company.local в AD → ivan.petrov@company.ru в M365 → один пароль, Teams/Outlook SSO.`,
      code: {
        language: 'powershell',
        caption: 'Проверка Azure AD Connect sync status',
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
      content: `**PAM в AD** — time-bound elevation привилегий, JIT (Just-In-Time) admin access.

**Компоненты (Microsoft PAM / MIM):**
- **Shadow Principal** — temporary group membership
- **Approval workflow** — manager approves admin request
- **Time limit** — access expires через N часов
- **Audit** — кто, когда, зачем получил Domain Admin

**Для SMB без MIM:**
- **Microsoft Entra Privileged Identity Management (PIM)** — cloud roles JIT
- **LAPS** — JIT local admin on workstations
- **Tiered Admin + PAW** — manual but effective
- **Temporary AD group** — script adds to G_Admins_Temp, scheduled remove

**Best practices:**
- Zero standing Domain Admin accounts
- Break-glass account — 2 sealed envelopes
- Admin audit: 4672, 4728, 4732 events to SIEM
- Quarterly access review

**Entra ID PIM для hybrid:**
- Global Admin, Exchange Admin — eligible, not permanent
- MFA on activation
- Approval chain

> Enterprise PAM complex; SMB minimum — no daily use Domain Admin, separate admin accounts, MFA on Azure.`,
    },
    {
      title: 'Bloodhound — анализ attack paths в AD',
      content: `**BloodHound** — инструмент для визуализации путей атаки в AD (ACL abuse, Kerberoasting paths).

**Зачем админу (defensive use):**
- Найти «shortest path to Domain Admin»
- Обнаружить опасные ACL (GenericAll on user → DA group)
- Audit nested group memberships
- Pre-audit перед pentest

**Сбор данных:**
- **SharpHound** / BloodHound CE collector — на admin workstation
- Требует domain credentials (reader достаточно)
- Output: ZIP JSON → import in BloodHound

**Типичные findings SMB:**
- Helpdesk has GenericAll on OU=Users → create member → DA path
- Service account SVC_BACKUP in Domain Admins
- Kerberoastable SPN on old service account (weak password)
- Unconstrained delegation on legacy server

**Remediation:**
- Remove excessive ACLs
- gMSA for services
- Protected Users for Tier 0
- Regular BloodHound scans quarterly

> **Важно:** используй только с письменным разрешением. Unauthorized scanning = incident.

**BloodHound CE (open source):**
- Docker или desktop app
- Cypher queries: «Shortest path to Domain Admins»`,
    },
    {
      title: 'KRBTGT rotation — процедура',
      content: `**KRBTGT account** — ключ Kerberos trust в домене. Компрометация = Golden Ticket attack.

**Когда ротировать:**
- После подтверждённого breach AD
- После выявления Golden Ticket в SIEM
- **Не** routined — только при необходимости (breaks auth twice)

**Процедура (Microsoft official — 2-step reset):**

| Шаг | Действие |
|-----|----------|
| 1 | Document: all DCs healthy, repadmin /syncall |
| 2 | First password reset KRBTGT (ADUC or PowerShell) |
| 3 | Wait **10 hours** (max ticket lifetime, default 10h) |
| 4 | Second password reset KRBTGT |
| 5 | Verify: dcdiag, user logons, service tickets |
| 6 | Invalidate old backups containing old KRBTGT hash |

**PowerShell:**
\`Reset-KrbtgtAccountPasswordScript.ps1\` — Microsoft script with prechecks

**Последствия неправильной rotation:**
- Single reset without wait — partial auth failure
- No second reset — old key still valid for Golden Ticket

**Prevention:**
- Protect DCs (Tier 0)
- Monitor Event 4769 anomalies
- Don't run unnecessary KRBTGT rotation «for hygiene»

> После rotation — все TGT re-issued on next logon. Plan maintenance window.`,
      code: {
        language: 'powershell',
        caption: 'KRBTGT password reset (используй официальный скрипт Microsoft!)',
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
      title: 'Полный список портов AD',
      content: `**Firewall rules для Active Directory** — полная таблица для SMB и enterprise.

| Порт | Протокол | Служба | Направление |
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

> Microsoft doc: «Active Directory and Active Directory Domain Services Port Requirements» — распечатай для firewall team.`,
    },
    {
      title: 'Сценарии миграции AD',
      content: `**Типовые migration scenarios для SMB:**

**1. Rename domain (НЕ рекомендуется)**
- Практически невозможно без rebuild
- Используй UPN suffix instead

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
- [ ] Verify apps: 1С, SQL linked to AD

> **Правило:** migrate by adding new, not in-place surgery when possible.`,
    },
    {
      title: 'Лабораторная работа: multi-DC и sites',
      content: `**Цель:** развернуть 2 DC в разных sites, проверить репликацию и DC Locator.

| Шаг | Действие | Ожидаемый результат |
|-----|----------|---------------------|
| 1 | Lab: DC01 в Site-HeadOffice (192.168.10.10) | Get-ADDomain OK |
| 2 | Создай Site-Branch, subnet 192.168.20.0/24 | Sites visible in AD Sites and Services |
| 3 | VM DC02: IP 192.168.20.10, promote replica | 2 DCs in domain |
| 4 | Назначь DC02 в Site-Branch | (Get-ADDomainController DC02).Site = Site-Branch |
| 5 | Client в Branch subnet: nslookup _ldap._tcp.branch | SRV points to DC02 |
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
      content: `**Q1: Сколько DC нужно SMB?**
A: Minimum 2 для HA. Один DC = single point of failure.

**Q2: Можно ли DC на VM без dedicated host?**
A: Да, но не backup/restore snapshot без caution. Hyper-V replication for DR.

**Q3: .local vs .corp — что выбрать?**
A: Внутренний suffix не публичный DNS. corp.company.ru или company.local оба OK.

**Q4: Как часто менять functional level?**
A: When all DCs run newer OS. Not urgent if features not needed.

**Q5: AD Recycle Bin включить можно после создания домена?**
A: Да, irreversible enable. Do it early.

**Q6: Что такое USN rollback?**
A: Restore DC VM snapshot → replication broken. Must demote/repromote or restore from backup properly.

**Q7: Нужен ли DNS на каждом DC?**
A: Recommended. AD-integrated DNS replicates with AD.

**Q8: Как найти «забытые» service accounts?**
A: Search-ADAccount -AccountInactive, check SPNs, BloodHound Kerberoastable.

**Q9: Azure AD replace on-prem AD?**
A: Not fully for GPO, legacy auth, file ACLs. Hybrid most SMB.

**Q10: Как тестировать AD restore без production impact?**
A: Restore DC VM to isolated VLAN, or authoritative restore in lab forest.`,
    },
    {
      title: 'Типовые ошибки AD и решения',
      content: `| Ошибка | Причина | Решение |
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
      title: 'Сценарии «день администратора» — AD',
      content: `**Сценарий 1 — «Филиал не может войти в домен»**

09:00 — звонок из филиала: «пароль не принимается». Проверяешь: WAN link up, RODC pingable. repadmin — RODC last sync 2 days ago (site link schedule too restrictive). Временно: force replication \`repadmin /syncall /AdeP\`. Fix site link schedule to every 15 min during business hours. Root cause: weekend maintenance left link disabled.

**Сценарий 2 — «Новый CEO, срочно доступ»**

Board meeting через час. HR создали учётку в wrong OU (no exec GPO). Move user to OU=Management, add to G_Management, G_VPN, G_ExecShare. FGPP already applies 16-char password. Azure AD Connect delta sync. Test login on laptop. Document in ticket: 25 min total. Remind HR: use onboarding form.

**Сценарий 3 — «Подозрение на компрометацию AD»**

SOC alert: multiple 4768 TGT requests from unusual host. Isolate suspect workstation VLAN. Reset user password, revoke sessions. BloodHound: path from compromised helpdesk account to Domain Admins via ACL misconfiguration. Remove ACL, rotate helpdesk creds, enable PIM for DA. KRBTGT rotation scheduled per Microsoft 2-step. Incident report to management.`,
    },
    {
      title: 'Чеклист AD production',
      content: `**Ежедневно (automated):**
- [ ] dcdiag summary on all DCs
- [ ] Replication latency < 15 min intrasite
- [ ] Critical AD events (4720, 4726, 4740) reviewed

**Еженедельно:**
- [ ] Backup system state verified
- [ ] Inactive accounts report (>90 days)
- [ ] DNS scavenging stats

**Ежемесячно:**
- [ ] Privileged group membership review
- [ ] GPO backup (Backup-GPO -All)
- [ ] Certificate expiry on DC LDAPS
- [ ] Time sync audit on PDC emulator

**Ежеквартально:**
- [ ] AD restore test in lab
- [ ] BloodHound path review
- [ ] Disaster recovery drill (DC failure)
- [ ] Functional level / OS upgrade plan

**Ежегодно:**
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
      title: 'Подготовка к AZ-800/801 — Active Directory',
      content: `| AZ-800 Objective | Раздел главы |
|----------------|--------------|
| Deploy DC | Создание домена, promote DC |
| Configure domain and forest | Проектирование леса, functional levels |
| Create and manage AD objects | Users, groups, AGDLP, OU |
| Manage AD replication | Репликация, sites, repadmin |
| Configure trusts | Trusts раздел |
| Configure AD DNS | DNS в AD |
| Implement Group Policy (AD side) | FGPP, LAPS, Recycle Bin |
| Monitor and troubleshoot AD | dcdiag, troubleshooting |

| AZ-801 Objective | Раздел главы |
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
      title: 'Вопросы с собеседования — AD',
      content: `**1. Что такое FSMO и какие 5 ролей?**
Schema Master, Domain Naming Master (forest), PDC Emulator, RID Master, Infrastructure Master (domain). PDC — most critical (time, password changes).

**2. Как работает Kerberos в AD?**
AS-REQ/TGT from KDC (DC), TGS-REQ for service, mutual auth. Requires time sync ±5 min.

**3. Разница global, universal, domain local groups?**
Global — users, domain-wide. Universal — forest-wide (careful replication). Domain Local — permissions on resources.

**4. Что такое AGDLP?**
Account in Global group, Global in Domain Local, Domain Local on resource Permission. Best practice ACL model.

**5. Как force replication?**
repadmin /syncall /AdeP or Sync-ADObject (PS). KCC builds topology automatically.

**6. Что делает PDC Emulator?**
Primary time source, password change priority, legacy PDC role emulation, DFS root consistency.

**7. AD Recycle Bin vs authoritative restore?**
Recycle Bin — soft-deleted objects, easy restore. Authoritative — for USN/version conflicts, last resort, affects all DCs.

**8. Зачем LAPS?**
Unique local admin password per machine, stored in AD, rotated. Prevents lateral movement via shared local admin.

**9. RODC vs writable DC in branch?**
RODC — read-only, credential caching controlled, safer untrusted location. Writable — full DC if trusted site with IT.

**10. Как обнаружить Kerberoasting?**
Monitor Event 4769 for RC4 encryption, service accounts with SPN and weak passwords, use managed gMSA.`,
    },
  ],
  practice: [
    'Создай лес company.local с одним DC в lab (evaluation). Запиши DSRM пароль в vault',
    'Спроектируй OU-структуру для офиса на 30 человек (Sales, IT, HR, Guests, Disabled)',
    'Создай 3 пользователей, 2 global groups, 1 domain local group. Примени AGDLP на тестовую NTFS-папку',
    'Присоедини Windows 10/11 VM к домену, войди под доменной учёткой. Проверь secure channel',
    'Выполни dcdiag /v и объясни каждое предупреждение. Исправь найденные проблемы',
    'Добавь второй DC (SRV-DC02). Проверь репликацию: repadmin /replsummary',
    'Настрой DNS forwarders, проверь nslookup company.local и google.com с клиента',
    'Создай Fine-Grained Password Policy для группы админов (16 символов, 3 попытки)',
    'Включи AD Recycle Bin. Удали тестового пользователя, восстанови из Recycle Bin',
    'Настрой LAPS (Windows LAPS) через GPO. Прочитай пароль одного ПК через PowerShell',
    'Документируй runbook onboarding: AD user → группы → OU → GPO → почта → VPN (1 страница)',
    'Симулируй «trust relationship failed»: сломай secure channel, почини через Test-ComputerSecureChannel -Repair',
    'Спроектируй multi-site topology: HeadOffice + Branch с subnets, site link, cost. Документируй на diagram',
    'Разверни RODC в lab (или изучи PRP): deny Domain Admins replication, allow branch users group',
    'Установи BloodHound CE, собери data SharpHound, найди shortest path to Domain Admins в lab',
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
}
