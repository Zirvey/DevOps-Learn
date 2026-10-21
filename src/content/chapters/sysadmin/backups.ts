import type { Chapter } from '../../../types'

export const backupsChapter: Chapter = {
  id: 'backups-disaster-recovery',
  slug: 'backups-disaster-recovery',
  title: 'Резервное копирование и восстановление — полное руководство',
  moduleId: 'sysadmin',
  order: 3,
  duration: '12–16 часов',
  level: 'intermediate',
  description:
    'Глубокое изучение бэкапов: стратегия 3-2-1, Veeam, WSB, восстановление AD, ransomware, DR tabletop, RTO/RPO, immutable backups, тестирование восстановления',
  sections: [
    {
      title: 'Правило 3-2-1 и основы стратегии',
      content: `**Правило 3-2-1** — золотой стандарт резервного копирования:

- **3** копии данных (оригинал + 2 бэкапа)
- **2** разных типа носителей (диск + tape/cloud)
- **1** копия offsite (другой офис / облако / другой город)

**Почему 3-2-1:**
- Один диск может сломаться
- Один бэкап может быть повреждён (ransomware шифрует всё на NAS)
- Офис может сгореть (пожар, затопление)

**Расширенное правило 3-2-1-1-0:**
- **1** копия offline/air-gapped
- **0** ошибок при тестировании восстановления

**Типы бэкапов:**

| Тип | Описание | Скорость восстановления | Место |
|-----|----------|------------------------|-------|
| **Full** | Полная копия | Быстрое | Много |
| **Incremental** | Только изменения с последнего бэкапа | Медленное (цепочка) | Мало |
| **Differential** | Изменения с последнего Full | Среднее | Средне |
| **Synthetic Full** | Veeam: full из incrementals | Быстрое | Оптимально |

**Реальный кейс SMB:** file server 500 GB → Full по воскресеньям + Incremental ежедневно → Repository на NAS → Copy Job на S3 (immutable) → Tape раз в месяц в сейф.`,
    },
    {
      title: 'RTO и RPO — определение требований',
      content: `**RPO (Recovery Point Objective)** — сколько данных можно **потерять** (время между бэкапами).

**RTO (Recovery Time Objective)** — сколько **downtime** допустимо (время восстановления).

| Система | Типичный RPO | Типичный RTO | Метод |
|---------|-------------|--------------|-------|
| **AD / DC** | 24 ч | 2–4 ч | System State daily |
| **DNS / DHCP** | 24 ч | 1–2 ч | System State / VM backup |
| **File server** | 1–4 ч | 4–8 ч | Veeam incremental + VSS |
| **1С / ERP** | 15 мин – 1 ч | 1–4 ч | Veeam app-aware + SQL log shipping |
| **Почта (M365)** | Облачный retention | 1–4 ч | M365 backup (Veeam M365) |
| **RDS / терминалы** | 24 ч | 4–8 ч | VM backup |
| **Hyper-V host** | 24 ч | 2–4 ч | Veeam image-level |
| **Рабочие станции** | 24 ч | 1 рабочий день | Не критично (Folder Redirection) |

**Как определить RPO/RPO для своего офиса:**
1. Спроси бизнес: «Сколько часов работы без 1С допустимо?»
2. Спроси бухгалтерию: «Сколько часов данных можно потерять?»
3. Документируй в DR-плане
4. Подбери технологию под требования

> **RPO 0** (ноль потерь) = дорого (replication, clustering). Для SMB обычно RPO 1–24 часа достаточно.`,
    },
    {
      title: 'Windows Server Backup (WSB)',
      content: `**Windows Server Backup** — встроенный инструмент. Бесплатный, но ограниченный.

**Возможности:**
- System State (AD, DNS, registry, boot files)
- Полные тома (bare metal recovery)
- Hyper-V VMs (Windows Server 2012+)
- Scheduled backups

**Ограничения:**
- Нет deduplication
- Нет application-aware (SQL, Exchange — базово)
- Нет replication, cloud tier
- Нет central management
- Один destination per schedule

**Когда использовать WSB:**
- Lab / тестовая среда
- Единственный DC в очень малом офисе (лучше Veeam!)
- Дополнительный System State backup (вместе с Veeam)

**Установка:**
\`Install-WindowsFeature Windows-Server-Backup -IncludeManagementTools\`

**GUI:** Server Manager → Tools → Windows Server Backup
**CLI:** \`wbadmin\``,
      codes: [
        {
          language: 'powershell',
          caption: 'WSB — System State и volume backup',
          code: `Install-WindowsFeature Windows-Server-Backup -IncludeManagementTools

# System State backup (критично для DC!)
wbadmin start systemstatebackup -backupTarget:E: -quiet

# Full volume backup
wbadmin start backup -backupTarget:E: -include:C: -allCritical -vssFull -quiet

# Список бэкапов
wbadmin get versions -backupTarget:E:

# Восстановление System State (только в DSRM!)
# wbadmin start systemstaterecovery -version:MM/DD/YYYY-HH:MM -backupTarget:E:`,
        },
        {
          language: 'powershell',
          caption: 'WSB — расписание через Task Scheduler',
          code: `$action = New-ScheduledTaskAction -Execute "wbadmin" -Argument "start systemstatebackup -backupTarget:E: -quiet"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
Register-ScheduledTask -TaskName "WSB-SystemState-Daily" -Action $action -Trigger $trigger -User "SYSTEM" -RunLevel Highest`,
        },
      ],
    },
    {
      title: 'Veeam Backup & Replication — глубокое погружение',
      content: `**Veeam** — стандарт de facto для бэкапа VM и физических серверов в Windows-офисах.

**Архитектура Veeam:**

| Компонент | Назначение |
|-----------|------------|
| **Veeam B&R Server** | Управление, scheduling, recovery |
| **Backup Proxy** | Обработка данных (может быть на HV host) |
| **Repository** | Хранение бэкапов (.vbk, .vib, .vrb) |
| **Tape Server** | Запись на ленту (опционально) |
| **WAN Accelerator** | Оптимизация copy jobs через WAN |

**Типовая схема SMB:**
\`\`\`
SRV-VEEAM01 (VM, 8 GB RAM)
├── Repository: \\\\NAS\\VeeamBackup (500 GB – 2 TB)
├── Backup Jobs:
│   ├── DC01 + DC02 (daily, app-aware)
│   ├── FS01 (every 4h, incremental)
│   ├── RDS01 (daily)
│   └── HV01 (weekly full)
├── Copy Job → S3 (immutable, daily)
└── SureBackup → lab (weekly verify)
\`\`\`

**Ключевые возможности:**
- **Image-level backup** — весь VM как файл
- **Application-aware** — VSS для SQL, Exchange, AD, 1С
- **Instant VM Recovery** — запуск VM из бэкапа за минуты
- **File-level recovery** — отдельные файлы из VM backup
- **Replication** — копия VM на DR site
- **SureBackup** — автоматическая проверка boot VM из бэкапа
- **Immutable backup** — S3 Object Lock, Linux Hardened Repository

**Лицензирование Veeam:**
- Veeam Universal License (VUL) — per workload
- Community Edition — бесплатно до 10 workloads
- Для SMB 3–10 серверов: Community или Essentials`,
      codes: [
        {
          language: 'powershell',
          caption: 'Veeam PowerShell — базовые операции',
          code: `# Подключение к Veeam Server
Connect-VBRServer -Server localhost

# Список jobs
Get-VBRJob | Select Name, LastRun, LastResult, NextRun

# Список backups
Get-VBRBackup | Select Name, CreationTime, @{N='SizeGB';E={[math]::Round($_.GetStorages().Stats.BackupSize/1GB,1)}}

# Запуск job вручную
Get-VBRJob -Name "Backup-DC-Daily" | Start-VBRJob

# Восстановление файла из VM backup
$restoreSession = Get-VBRRestorePoint -Backup (Get-VBRBackup -Name "Backup-FS01") | Sort CreationTime -Descending | Select -First 1
$flrSession = New-VBRRestoreSession -RestorePoint $restoreSession
Start-VBRFilesRestore -RestoreSession $flrSession`,
        },
      ],
    },
    {
      title: 'Application-Aware Backup',
      content: `**Application-Aware Processing** — Veeam координирует с VSS для консистентного бэкапа приложений.

**Как работает:**
1. Veeam посылает сигнал VSS writer'у приложения
2. Приложение «замораживает» данные (SQL transaction log, AD database)
3. Veeam делает snapshot
4. Приложение продолжает работу
5. Veeam копирует данные из snapshot

**Поддерживаемые приложения:**
- Active Directory (NTDS)
- Microsoft SQL Server
- Microsoft Exchange
- Oracle
- SharePoint
- 1С (через VSS writer или pre-freeze script)

**Настройка в Veeam Job:**
- Processing → Advanced → VSS → Enable application-aware processing
- Guest Processing → Credentials для guest OS
- Для AD: обычно достаточно domain admin creds

**Без application-aware:**
- AD: возможна USN rollback при восстановлении
- SQL: inconsistent database, нужен replay log
- 1С: повреждение базы

> **Всегда** включай application-aware для DC, SQL, 1С. Для file server достаточно VSS file-level.`,
    },
    {
      title: 'Восстановление Active Directory',
      content: `**Типы восстановления AD — знай все, используй правильный:**

| Тип | Когда | Downtime | Сложность |
|-----|-------|----------|-----------|
| **Recycle Bin** | Объект удалён недавно | 0 | Низкая |
| **Authoritative restore** | Объект удалён давно, Recycle Bin нет | 1–4 ч | Высокая |
| **Non-authoritative restore** | DC повреждён, другие DC живы | 2–4 ч | Средняя |
| **Full forest recovery** | Все DC мертвы, ransomware | 4–24 ч | Очень высокая |

**Non-authoritative restore (типичный):**
1. DC сломался (железо, OS corruption)
2. Восстанови VM/System State из бэкапа
3. Загрузи в DSRM
4. \`wbadmin start systemstaterecovery\`
5. Перезагрузка → DC реплицирует с других DC (non-authoritative)

**Authoritative restore (удалённый объект):**
1. Восстанови System State на DC в DSRM
2. \`ntdsutil\` → authoritative restore → объект
3. Перезагрузка → объект реплицируется на все DC
4. **Осторожно:** откатывает ВСЕ изменения после backup point!

**Критично:**
- Всегда имей **2+ DC**
- Бэкап System State **всех** DC
- Тестируй восстановление **ежеквартально**`,
      codes: [
        {
          language: 'powershell',
          caption: 'Authoritative restore — восстановление удалённого пользователя',
          code: `# В DSRM (Directory Services Restore Mode):
# ntdsutil
# authoritative restore
# restore object "CN=Ivan Petrov,OU=Sales,OU=Users,DC=company,DC=local"
# quit
# quit

# После перезагрузки — проверка
Get-ADUser -Identity "ivan.petrov" -Properties * | Select Name, SamAccountName, Enabled, whenChanged`,
        },
        {
          language: 'powershell',
          caption: 'Non-authoritative restore через Veeam',
          code: `# Veeam Instant VM Recovery для DC:
# 1. Veeam Console → Restore → Entire VM → Instant Recovery
# 2. VM запускается из backup (работает сразу)
# 3. Migrate to production (фоновое копирование)
# 4. DC реплицирует изменения с DC02

# Проверка после восстановления
dcdiag /v
repadmin /replsummary`,
        },
      ],
    },
    {
      title: 'File Server и пользовательские данные',
      content: `**Стратегия бэкапа данных — многоуровневая:**

| Уровень | Технология | RPO | Защита от |
|---------|-----------|-----|-----------|
| 1 | Folder Redirection на file server | — | Потеря ПК |
| 2 | VSS / Shadow Copies (Previous Versions) | 2×/день | Случайное удаление |
| 3 | Veeam file server backup | 1–4 ч | Сбой сервера |
| 4 | Copy Job на S3 (immutable) | 24 ч | Ransomware |
| 5 | OneDrive / SharePoint sync | Real-time | Потеря ПК + сервера |

**Volume Shadow Copy Service (VSS) на file server:**
- Snapshots каждые 12 часов (настраивается)
- Пользователь: правый клик → Previous Versions → Restore
- Не замена полного бэкапа! Snapshots на том же диске

**DFS Replication:**
- Два file server — репликация в реальном времени
- RPO ≈ 0 для файлов
- Не защита от ransomware (шифрует на обоих!)

**Права на бэкап:**
- Backup Operators group — достаточно для Veeam/WSB
- **Не** Domain Admin для ежедневных backup jobs
- gMSA для Veeam service account

**Реальный кейс:** бухгалтер удалила папку с отчётами → Previous Versions → восстановление за 2 минуты. Veeam не понадобился.`,
      code: {
        language: 'powershell',
        caption: 'VSS Shadow Copies на file server',
        code: `vssadmin list shadows
vssadmin list shadowstorage

# Настройка Shadow Copies (GUI: свойства тома → Shadow Copies)
# Или через vssadmin:
vssadmin add shadowstorage /for=D: /on=D: /maxsize=10GB
vssadmin create shadow /for=D:

# Проверка Previous Versions (на клиенте)
Get-ChildItem "\\fileserver\sales" | Get-Item | Select Name`,
      },
    },
    {
      title: 'Ransomware и защита бэкапов',
      content: `**Ransomware** — главная угроза для SMB в 2024–2026. Шифрует файлы, базы, **и бэкапы** если они доступны из сети.

**Как ransomware атакует бэкапы:**
1. Проникновение (фишинг, RDP, уязвимость)
2. Lateral movement (Domain Admin hash)
3. Поиск backup repositories (\\\\NAS\\Backup, V: drive)
4. Шифрование production + backups
5. Требование выкупа

**Защита бэкапов — многоуровневая:**

| Уровень | Метод | Описание |
|---------|-------|----------|
| 1 | **Immutable backup** | S3 Object Lock, Veeam Hardened Repository |
| 2 | **Air-gapped** | Tape, отключённый диск, облако без write-доступа |
| 3 | **Separate credentials** | Veeam account ≠ Domain Admin |
| 4 | **Network isolation** | Backup VLAN, firewall rules |
| 5 | **MFA** | На Veeam Console, NAS, облако |
| 6 | **3-2-1** | Offsite копия в другом location |

**Veeam Immutable Backup:**
- Linux Hardened Repository (single-use credentials, immutability flag)
- S3 Object Lock (Compliance mode — нельзя удалить даже root)
- Tape (физически offline)

**Что делать при ransomware:**
1. **Не платить** (в 80% случаев данные не возвращают)
2. Изолировать заражённые системы (отключить сеть)
3. Оценить масштаб (что зашифровано, бэкапы целы?)
4. Восстановить из immutable backup
5. Расследование (как проникли, закрыть вектор)
6. Уведомить (закон о персональных данных, если ПДн затронуты)`,
    },
    {
      title: 'Immutable Backups — настройка',
      content: `**Immutable (неизменяемые) бэкапы** — данные, которые нельзя удалить или изменить в течение retention period. Даже с admin-правами. Даже ransomware.

**Варианты для SMB:**

| Метод | Стоимость | Сложность | Защита |
|-------|----------|-----------|--------|
| **Veeam Hardened Repository (Linux)** | Бесплатно (Linux VM) | Средняя | Высокая |
| **S3 Object Lock (AWS/MinIO/Wasabi)** | $5–20/TB/мес | Низкая | Высокая |
| **Tape** | $50–100/ленту | Средняя | Максимальная (offline) |
| **Rotated USB drives** | $50/диск | Низкая | Средняя (ручной процесс) |

**Настройка Veeam Hardened Repository:**
1. Linux VM (Ubuntu) с dedicated disk
2. Veeam → Backup Infrastructure → Add Repository → Hardened
3. Single-use credentials (генерируются один раз)
4. Immutability: 30 days (или по RPO)
5. Copy Job → этот repository

**S3 Object Lock:**
1. Bucket с Object Lock enabled (при создании!)
2. Compliance mode — нельзя удалить до expiry
3. Veeam → Add S3 Repository → Object Lock enabled
4. Retention: 30 days immutable

> **Тест:** попробуй удалить immutable backup. Если удалился — настройка неправильная.`,
      code: {
        language: 'powershell',
        caption: 'Veeam — проверка immutable repository',
        code: `Get-VBRBackupRepository | Select Name, Type, @{N='Immutable';E={$_.IsImmutabilityEnabled}}, @{N='Days';E={$_.ImmutabilityDays}}

Get-VBRJob | Where-Object {$_.JobType -eq "Backup"} | Select Name, Repository, @{N='LastResult';E={$_.LastRun}}`,
      },
    },
    {
      title: 'Disaster Recovery Plan',
      content: `**DR Plan** — документ, описывающий действия при катастрофе. Без него — паника и хаос.

**Структура DR Plan:**

| Раздел | Содержание |
|--------|-----------|
| 1. Контакты | On-call IT, руководство, провайдер, Veeam support |
| 2. Инвентарь | Все системы: hostname, IP, роль, RPO, RTO, приоритет |
| 3. Сценарии | Пожар, ransomware, сбой DC, потоп, кража сервера |
| 4. Процедуры | Пошаговое восстановление каждой системы |
| 5. Пароли | Ссылка на password vault (НЕ пароли в документе!) |
| 6. Тестирование | График DR drills |
| 7. Версионирование | Дата, автор, changelog |

**Приоритеты восстановления (типичный SMB):**

| Приоритет | Система | RTO | Почему |
|-----------|---------|-----|--------|
| P1 | AD / DNS | 2 ч | Без AD — ничего не работает |
| P1 | Internet / Firewall | 1 ч | Нет связи — нет работы |
| P2 | DHCP | 2 ч | Можно статику временно |
| P2 | File server | 4 ч | Документы, 1С файлы |
| P3 | 1С / ERP | 4 ч | Бизнес-процессы |
| P3 | Почта (M365) | 4 ч | Облако — менее критично |
| P4 | RDS | 8 ч | Удалёнка, не все |
| P5 | Print server | 24 ч | Можно USB-принтер |

**Где хранить DR Plan:**
- Распечатанная копия в сейфе (не в серверной!)
- Облако (SharePoint, Google Drive)
- У руководителя IT на телефоне
- **Не** только на file server (он может быть недоступен!)`,
    },
    {
      title: 'DR Tabletop Exercise',
      content: `**Tabletop Exercise** — обсуждение сценария катастрофы без реального восстановления. Раз в квартал.

**Формат:**
- 60–90 минут
- Участники: IT, руководитель, бухгалтерия (представитель бизнеса)
- Модератор задаёт сценарий, участники описывают действия
- Фиксируются пробелы в DR Plan

**Сценарии для tabletop:**

| # | Сценарий | Ключевые вопросы |
|---|----------|-----------------|
| 1 | Пожар в серверной | Где бэкапы? Как восстановить AD? Кто принимает решения? |
| 2 | Ransomware зашифровал всё | Бэкапы целы? Immutable? Сколько downtime? Платим? |
| 3 | DC01 умер (железо) | Есть DC02? Как быстро восстановить? FSMO? |
| 4 | Уволенный admin удалил AD | Recycle Bin? Authoritative restore? Бэкап? |
| 5 | Провайдер недоступен 24ч | Что работает локально? VPN? Почта в облаке? |

**Пример tabletop (сценарий 2 — ransomware):**
1. Модератор: «Понедельник 9:00, бухгалтерия сообщает: все файлы зашифрованы, записка READ_ME.txt»
2. IT: «Отключаю сеть, проверяю Veeam — последний backup воскресенье 02:00»
3. Руководитель: «Сколько данных потеряем? Когда восстановим?»
4. IT: «RPO 22 часа, RTO 4 часа при целых immutable backups»
5. Модератор: «А если immutable тоже зашифрован?» → обсуждение air-gap

**Результат tabletop:** обновлённый DR Plan, список action items, назначенные ответственные.`,
    },
    {
      title: 'Тестирование восстановления',
      content: `**Бэкап без тестирования восстановления = надежда, не стратегия.**

**Уровни тестирования:**

| Уровень | Частота | Что проверяем | Время |
|---------|---------|--------------|-------|
| **SureBackup (авто)** | Еженедельно | VM boot из backup | Автоматически |
| **File restore** | Ежемесячно | Восстановление файла из backup | 15 мин |
| **VM restore** | Ежеквартально | Полное восстановление VM в lab | 1–2 ч |
| **AD restore** | Ежеквартально | System State / authoritative restore | 2–4 ч |
| **Full DR drill** | Ежегодно | Полное восстановление инфраструктуры | 4–8 ч |

**SureBackup (Veeam):**
- Автоматический boot VM из backup в isolated network
- Проверка: VM стартует, heartbeat, application scripts
- Email-отчёт: success/fail
- Настройка: Veeam → SureBackup job → linked to backup job

**Чеклист тестирования:**

| # | Проверка | Ожидание | Факт |
|---|----------|----------|------|
| 1 | VM boot из backup | Загрузка ОС | |
| 2 | AD работает | dcdiag pass | |
| 3 | DNS резолвит | nslookup OK | |
| 4 | File server доступен | \\\\fileserver\\share | |
| 5 | SQL/1С запускается | Application connect | |
| 6 | Пользователь может войти | Domain login | |
| 7 | Файл восстановлен | Content matches | |

**Документируй каждый тест:** дата, что тестировали, результат, время восстановления, проблемы.`,
      codes: [
        {
          language: 'powershell',
          caption: 'Veeam SureBackup — настройка и проверка',
          code: `# Создание SureBackup job (Veeam Console GUI):
# SureBackup → Add → Link to Backup Job → Application Group (AD, DNS checks)

# Проверка результатов
Get-VSBSession | Select Name, Result, CreationTime, EndTime
Get-VSBSession | Where-Object {$_.Result -ne "Success"} | Select Name, Result, Reason`,
        },
        {
          language: 'powershell',
          caption: 'Ручной тест восстановления файла',
          code: `# Veeam FLR (File Level Restore)
$backup = Get-VBRBackup -Name "Backup-FS01"
$restorePoint = Get-VBRRestorePoint -Backup $backup | Sort CreationTime -Descending | Select -First 1
$session = New-VBRRestoreSession -RestorePoint $restorePoint
$flr = Get-VBRFLRSession -RestoreSession $session
Mount-VBRFlrItem -FlrSession $flr -LocalPath "C:\RestoreTest"
# Проверь файлы в C:\RestoreTest
Dismount-VBRFlrItem -FlrSession $flr`,
        },
      ],
    },
    {
      title: 'Veeam Copy Jobs и offsite',
      content: `**Copy Job** — копирование существующих backup files на другой repository (offsite).

**Зачем Copy Job (а не второй Backup Job):**
- Не нагружает production (копирует готовые .vbk/.vib)
- GFS retention на copy (weekly, monthly, yearly)
- WAN acceleration для удалённого офиса
- Immutable target

**Типовая схема:**
\`\`\`
Backup Job → Local Repository (NAS, fast restore)
Copy Job → S3 Wasabi/MinIO (immutable, offsite)
Copy Job → Tape (monthly, air-gapped)
\`\`\`

**GFS Retention (Grandfather-Father-Son):**
- Daily: 30 copies
- Weekly: 12 copies (3 months)
- Monthly: 12 copies (1 year)
- Yearly: 7 copies (7 years) — для compliance

**Настройка Copy Job:**
1. Veeam → Copy Job → Add
2. Source: existing backup jobs
3. Target: S3 / Hardened Repository
4. Schedule: daily, after backup job completes
5. Retention: GFS policy
6. Enable encryption (пароль или KMS)

> **Правило:** offsite копия должна быть в **другом** location. Другой сервер в той же серверной — не offsite.`,
    },
    {
      title: 'Мониторинг бэкапов и алерты',
      content: `**Бэкап, о котором никто не знает, что он сломался — хуже, чем отсутствие бэкапа.**

**Что мониторить:**

| Метрика | Порог тревоги | Действие |
|---------|--------------|----------|
| Job status | Failed / Warning | Немедленное расследование |
| Last successful run | >25 часов назад | Проверить job, repository |
| Repository free space | <15% | Расширить или cleanup |
| SureBackup result | Failed | Проверить boot, application |
| Copy Job status | Failed | Проверить WAN, S3 credentials |

**Veeam алерты (встроенные):**
- Email notifications: job failed, warning, success summary
- SNMP traps → monitoring system
- Veeam ONE (отдельный продукт) — dashboards, reports

**Для SMB без Veeam ONE:**
- Email notification на каждый failed job
- Еженедельный отчёт: все jobs, status, size, duration
- PowerShell скрипт + Task Scheduler → проверка + email

**Реальный кейс:** Veeam job failed 3 дня подряд — никто не заметил (email в спаме). На 4-й день — ransomware. Урок: мониторинг + алерт в Telegram/Slack.`,
      code: {
        language: 'powershell',
        caption: 'Скрипт мониторинга Veeam jobs',
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
      title: 'Облачные бэкапы и M365',
      content: `**Microsoft 365** — данные в облаке, но **не защищены от пользователя** (удаление, ransomware sync).

**Что M365 НЕ бэкапит:**
- Удалённые письма (после retention period)
- Удалённые файлы OneDrive/SharePoint
- Ransomware-шифрование OneDrive (Microsoft может помочь, но не гарантирует)

**Veeam Backup for Microsoft 365:**
- Exchange Online (почта, календарь, контакты)
- OneDrive for Business
- SharePoint Online
- Teams

**Альтернatives:** AvePoint, Commvault, native M365 retention policies (ограниченные).

**Облачные VM бэкапы:**
- Azure Backup, AWS Backup — для облачных VM
- Veeam для AWS/Azure — если гибридная инфраструктура

**Для SMB с M365:**
- Veeam M365 (бесплатно до 10 пользователей)
- Retention: 1–3 года
- Хранение: local repository + copy to S3`,
    },
    {
      title: 'Runbook: полное восстановление офиса',
      content: `**Runbook: «Серверная уничтожена» — пошаговое восстановление**

| # | Шаг | Время | Ответственный |
|---|------|-------|--------------|
| 1 | Оценить масштаб: что уничтожено? | 30 мин | IT Lead |
| 2 | Уведомить руководство, бизнес | 15 мин | IT Lead |
| 3 | Проверить offsite backups (S3/tape) | 30 мин | IT Admin |
| 4 | Заказать/подготовить железо или облако | 2–24 ч | IT + закупки |
| 5 | Установить Hyper-V host / облачные VM | 2–4 ч | IT Admin |
| 6 | Восстановить DC01 из immutable backup | 1–2 ч | IT Admin |
| 7 | dcdiag, проверить AD | 30 мин | IT Admin |
| 8 | Восстановить DC02 (или promote новый) | 1–2 ч | IT Admin |
| 9 | Восстановить DNS, DHCP (или с DC) | 30 мин | IT Admin |
| 10 | Восстановить File Server | 1–2 ч | IT Admin |
| 11 | Восстановить 1С / SQL | 1–2 ч | IT + 1С admin |
| 12 | Проверить: логин, файлы, 1С, почта | 1 ч | IT + бизнес |
| 13 | Подключить рабочие станции | 30 мин | IT |
| 14 | Документировать инцидент, lessons learned | 2 ч | IT Lead |

**Общий RTO: 8–16 часов** (при наличии железа и целых immutable backups).

**Критичные зависимости:**
- Password vault доступен (не на file server!)
- DR Plan доступен (распечатан!)
- Veeam license key доступен
- S3 credentials доступны`,
    },
    {
      title: 'Veeam Job — пошаговая настройка',
      content: `**Полный walkthrough создания Backup Job в Veeam B&R для SMB.**

| Шаг | Мастер Veeam | Рекомендация SMB |
|-----|--------------|------------------|
| 1 | Backup Job → New Backup Job | Name: BKP-PROD-DC01-Daily |
| 2 | Virtual Machines → Add → From infrastructure | Select DC01, FS01 |
| 3 | Storage → Backup repository | \\\\NAS\\VeeamBackup (fast LAN) |
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

> **Ожидаемый output первого job:** Status Success, .vbk file size ~60% of VM used space (compression).`,
      code: {
        language: 'powershell',
        caption: 'Veeam PowerShell — создать simple backup job',
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
      title: 'Cloud backup — Wasabi и S3',
      content: `**Offsite cloud backup** — обязательный слой 3-2-1 для защиты от ransomware и fire.

**Wasabi vs AWS S3:**

| Критерий | Wasabi | AWS S3 |
|----------|--------|--------|
| Цена | Flat, дешевле egress | Pay per use, egress дорогой |
| S3 API | Совместим | Native |
| Immutability | Object Lock | S3 Object Lock |
| Veeam support | S3-compatible repo | Native + Object Lock |
| Region | EU available (GDPR) | Many regions |

**Настройка S3-compatible repository в Veeam:**

1. Scale-out Backup Repository или S3 Object Storage repository
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

> **Тест:** quarterly restore one VM from S3 to isolated lab — measure RTO.`,
      code: {
        language: 'powershell',
        caption: 'AWS CLI — проверить bucket immutability (S3 Object Lock)',
        code: `# Проверка Object Lock на bucket
aws s3api get-object-lock-configuration --bucket veeam-backup-company-prod

# List backup objects (read-only audit)
aws s3 ls s3://veeam-backup-company-prod/ --recursive --summarize | Select-Object -Last 5

# Veeam Copy Job monitoring via PowerShell
Get-VBRComputerBackupCopyJob | Select Name, LastState, TargetRepository`,
      },
    },
    {
      title: 'Tape rotation — стратегия Grandfather-Father-Son',
      content: `**Tape backup** — air-gapped последняя линия защиты (despite «tape is dead» narrative).

**GFS Tape Rotation:**

| Уровень | Частота | Retention | Назначение |
|---------|---------|-----------|------------|
| **Son (Daily)** | Ежедневно | 5 tapes rotation | Недельный цикл |
| **Father (Weekly)** | Пятница | 4 tapes (month) | Месячный архив |
| **Grandfather (Monthly)** | Последняя пятница | 12 tapes (year) | Годовой compliance |

**Physical security:**
- Tapes offsite в сейфе (bank box или второй офис)
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
      title: 'Cyber Vault — изолированное хранилище',
      content: `**Cyber Vault (Veeam Cyber Vault)** — архитектура immutable offsite backup с zero trust access.

**Принципы:**
- Backup data **не доступен** production credentials
- Separate account, separate network path
- Immutability enforced at storage level
- No mount backup share on production servers

**Architecture SMB:**
\`\`\`
Production (Hyper-V + Veeam)
    ↓ Copy Job (dedicated creds)
Immutable S3 / Hardened Repository (Linux, single-use creds)
    ↓ Optional
Tape vault offsite
\`\`\`

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
      title: 'DR Test Script — полная автоматизация',
      content: `**Скрипт квартального DR test** — проверка restore без ручного хаоса.

**Фазы теста:**
1. Select random backup (DC or file server)
2. Restore to isolated Hyper-V network (192.168.99.0/24)
3. Verify: ping, AD login, file access
4. Document RTO actual vs target
5. Cleanup restored VM

**Checklist в скрипте:**
- [ ] Backup age < 24h
- [ ] Restore completed without errors
- [ ] DC: dcdiag pass
- [ ] File server: test file readable
- [ ] Network isolated (no production route)
- [ ] Report emailed to IT lead`,
      codes: [
        {
          language: 'powershell',
          caption: 'DR test orchestration script (Veeam + verification)',
          code: `# DR-Test-Quarterly.ps1 — run on Veeam server
param(
  [string]$VmName = "SRV-DC01",
  [string]$IsolatedSwitch = "DR-Test-Isolated",
  [string]$ReportPath = "\\\\fileserver\\it\\DR-Reports"
)

Connect-VBRServer -Server localhost
$restorePoint = Get-VBRBackup | Get-VBRBackupRestorePoints | Where {$_.Name -like "*$VmName*"} | Sort CreationTime -Descending | Select -First 1

$startTime = Get-Date
$session = Start-VBRInstantRecovery -Vm $VmName -RestorePoint $restorePoint -Server localhost -RunAsync

# Wait for instant recovery (simplified — use Get-VBRSession in production)
Start-Sleep -Seconds 300

$tests = @()
$tests += [PSCustomObject]@{ Test = "RestoreStarted"; Result = ($session -ne $null) }
$tests += [PSCustomObject]@{ Test = "PingIsolated"; Result = (Test-Connection -ComputerName $VmName -Count 1 -Quiet) }

try {
  $dcdiag = dcdiag /s:$VmName 2>&1 | Out-String
  $tests += [PSCustomObject]@{ Test = "DCDiag"; Result = ($dcdiag -notmatch "failed") }
} catch {
  $tests += [PSCustomObject]@{ Test = "DCDiag"; Result = $false }
}

$duration = (Get-Date) - $startTime
$report = [PSCustomObject]@{
  Date = Get-Date
  VM = $VmName
  RestorePoint = $restorePoint.CreationTime
  RTO_Minutes = [math]::Round($duration.TotalMinutes, 1)
  Tests = $tests
}
$report | Export-Csv "$ReportPath\\DR-Test-$(Get-Date -Format yyyy-MM-dd).csv" -NoTypeInformation
Send-MailMessage -To "it@company.local" -Subject "DR Test Report $VmName" -Body ($report | Out-String) -SmtpServer "smtp.company.local"`,
        },
        {
          language: 'powershell',
          caption: 'WSB restore verification (System State)',
          code: `# Lab only — System State restore requires DSRM reboot
wbadmin get versions -backupTarget:E: | Select-Object -First 5

# Verify backup integrity without full restore
wbadmin start backup -backupTarget:E: -include:C: -allCritical -vssCopy -quiet
$lastVersion = (wbadmin get versions -backupTarget:E: | Select-String "Version").Line
Write-Output "Latest backup: $lastVersion"`,
        },
      ],
    },
    {
      title: 'Insurance, compliance и GDPR retention',
      content: `**Бэкапы и регуляторика** — что требуют аудиторы, страховщики и GDPR.

**GDPR / персональные данные в бэкапах:**
- Backups содержат PII → subject to retention limits
- Right to erasure: **cannot** easily delete one person from tape — plan data minimization
- Retention policy documented: «HR data 7 years, marketing 2 years»
- Encryption at rest mandatory (BitLocker, S3 SSE)
- Cross-border: EU data in EU region (Wasabi eu-central-1)

**Страхование cyber ( cyber insurance ):**
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
      title: 'Лабораторная работа: backup и restore',
      content: `**Цель:** настроить полный цикл backup → verify → restore в lab.

| Шаг | Действие | Ожидаемый результат |
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
      title: 'FAQ — Backup и DR',
      content: `**Q1: Veeam free vs paid для SMB?**
A: Community Edition free for 10 VMs/workloads. Enough for small office. Enterprise for support, tape, scale-out.

**Q2: Как часто тестировать restore?**
A: Critical systems quarterly minimum. DC at least twice per year.

**Q3: Backup на том же NAS что file server — OK?**
A: No for ransomware. Separate device/account, immutable copy offsite.

**Q4: WSB достаточно для DC?**
A: Better than nothing. Veeam app-aware strongly recommended.

**Q5: RPO 15 min — реально для SMB?**
A: Yes with Veeam incremental every 15 min + good network. Cost: storage growth.

**Q6: Instant Recovery vs Full Restore?**
A: Instant — run from backup files, fast, temporary. Full — copy to production storage, permanent.

**Q7: Как защитить Veeam от ransomware?**
A: Hardened repo, separate creds, immutability, no domain admin on Veeam server ideally.

**Q8: M365 нужно бэкапить если Microsoft хранит?**
A: Yes. Microsoft shared responsibility — accidental delete, retention gaps, legal hold.

**Q9: Tape vs cloud vault?**
A: Cloud for daily offsite. Tape for monthly air-gap optional. Many SMB skip tape now.

**Q10: Authoritative restore AD — когда?**
A: Last resort. Object-level mistake → Recycle Bin first. USN rollback → authoritative.`,
    },
    {
      title: 'Типовые ошибки backup и решения',
      content: `| Ошибка | Причина | Решение |
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
      title: 'Сценарии «день администратора» — Backup',
      content: `**Сценарий 1 — «Ransomware в пятницу вечером»**

22:00 — SOC alert: mass file encryption on FS01. Isolate FS01 VLAN immediately. Veeam: last clean backup 4 hours ago (RPO met). Check S3 immutable copy — intact. Instant Recovery FS01 to isolated network, verify files clean. Full restore overnight. Production back Monday 10:00. RTO 36h. Post-mortem: NAS backup deleted by malware — immutable S3 saved company.

**Сценарий 2 — «Auditor Monday morning»**

Auditor requests proof of backup testing. Pull DR test reports Q1-Q4, Veeam job success rate 99.2%, immutability config screenshot, GDPR retention policy document. One gap: Q2 test missing for file server — schedule emergency test same week. Audit passed with observation.

**Сценарий 3 — «Accidental AD user delete»**

HR deleted wrong user. Recycle Bin — object there (< 180 days). Restore-ADObject — 2 minutes. No backup needed. If Recycle Bin disabled scenario: Veeam granular AD restore item-level — 15 minutes. Document: enable Recycle Bin if not already.`,
    },
    {
      title: 'Чеклист backup production',
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
      title: 'Подготовка к AZ-800/801 — Backup/DR',
      content: `| AZ-800 Topic | Раздел |
|--------------|--------|
| Implement disaster recovery | DR Plan, runbooks |
| Manage Hyper-V backups | Veeam, WSB |
| Configure Windows Server Backup | WSB раздел |

| AZ-801 Topic | Раздел |
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
      title: 'Вопросы с собеседования — Backup',
      content: `**1. Объясни правило 3-2-1-1-0.**
3 copies, 2 media types, 1 offsite, 1 offline/air-gapped, 0 untested restores.

**2. RPO vs RTO — пример для file server.**
RPO 4h = max 4 hours data loss. RTO 8h = back online within 8 hours.

**3. Чем incremental отличается от differential?**
Incremental — changes since last backup (any). Differential — since last full.

**4. Как Veeam обеспечивает consistency SQL/AD?**
Application-aware processing via VSS — quiesce before snapshot.

**5. Authoritative vs non-authoritative AD restore?**
Non-auth: restored DC gets updates from others. Auth: restored state wins, replicates outward — dangerous.

**6. Зачем immutable backup?**
Ransomware cannot encrypt or delete backups during retention period.

**7. Instant Recovery риски?**
Runs from backup files — performance limited, not permanent, backup chain locked during IR.

**8. Как test restore без downtime production?**
Restore to isolated network, verify, document. Instant Recovery to separate VLAN.

**9. WSB limitations vs Veeam?**
No central management, dedup, app-aware limited, no cloud tier native.

**10. M365 shared responsibility model?**
Microsoft: infrastructure. Customer: data protection, retention policy, accidental delete recovery.`,
    },
  ],
  practice: [
    'Определи RPO/RTO для 7 систем гипотетического офиса (AD, DNS, File, 1С, M365, RDS, Print). Заполни таблицу',
    'Настрой Windows Server Backup System State на lab DC. Проверь wbadmin get versions',
    'Установи Veeam Community Edition, создай Backup Job для lab VM. Запусти, проверь repository',
    'Восстанови файл из Veeam backup (File Level Recovery). Задокументируй время',
    'Восстанови удалённого AD пользователя: сначала Recycle Bin, потом authoritative restore в lab',
    'Настрой VSS Shadow Copies на file share. Удали файл, восстанови через Previous Versions',
    'Составь DR Plan на 3 страницы: контакты, инвентарь, приоритеты, процедуры для 3 сценариев',
    'Проведи tabletop exercise (сам или с коллегой): сценарий ransomware. Запиши 5 action items',
    'Проверь: бэкап лежит НЕ на том же диске/сервере что и данные. Нарисуй схему 3-2-1 для офиса',
    'Настрой Veeam email notification на failed jobs. Симулируй fail (отключи repository), проверь алерт',
    'Запланируй quarterly restore test в календаре. Создай чеклист из 7 проверок',
    'Сравни стоимость: Veeam Community vs WSB vs облачный backup для офиса на 3 сервера + M365',
    'Пройди Veeam Job walkthrough (15 шагов): app-aware, schedule, notification, test FLR',
    'Настрой S3/Wasabi Copy Job с immutability. Попробуй удалить object — должно fail',
    'Выполни лабораторную backup/restore (15 шагов) и задокументируй фактический RTO',
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
}
