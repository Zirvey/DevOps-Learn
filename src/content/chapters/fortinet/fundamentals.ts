import type { Chapter } from '../../../types'

export const fortigateFundamentalsChapter: Chapter = {
  id: 'fortigate-fundamentals',
  slug: 'fortigate-fundamentals',
  title: 'FortiGate — основы платформы',
  moduleId: 'fortinet',
  order: 0,
  duration: '10–12 часов',
  level: 'beginner',
  description:
    'FortiOS 7.4, интерфейсы, zones, VDOM, sizing FG-40F/60F/100F, FortiGuard, Security Fabric, первичная настройка SMB-офиса',
  sections: [
    {
      title: 'Экосистема Fortinet и роль FortiGate',
      content: `**FortiGate** — NGFW (Next-Generation Firewall), центральный узел сетевой безопасности типового SMB-офиса. На одном устройстве объединяются маршрутизация, stateful firewall, VPN, UTM-профили и управление периферией Fortinet.

**Семейство продуктов Fortinet:**

| Продукт | Назначение в офисе |
|---------|-------------------|
| **FortiGate** | Firewall, routing, VPN, UTM, SD-WAN, FortiLink controller |
| **FortiSwitch** | Управляемые L2/L3 коммутаторы (FortiLink) |
| **FortiAP** | Wi-Fi точки доступа (CAPWAP к FortiGate) |
| **FortiAnalyzer** | Централизованные логи, отчёты, compliance |
| **FortiManager** | Центральное управление 10+ FortiGate |
| **FortiClient EMS** | Управление endpoint VPN-клиентами |
| **FortiAuthenticator** | MFA, RADIUS, SSO (опционально) |

**Типовой SMB-стек:** один FortiGate FG-60F или FG-100F + 2–4 FortiSwitch + 3–8 FortiAP + FortiAnalyzer VM (или облачный лог-сервер). FortiManager нужен при 3+ филиалах или MSP-модели.

**Почему FortiGate, а не «роутер + отдельный firewall»:** единая консоль, единые политики, встроенный VPN, интеграция Wi-Fi и switching через Security Fabric — меньше точек отказа и проще аудит.`,
    },
    {
      title: 'Выбор модели: FG-40F, FG-60F, FG-100F',
      content: `Для production SMB офиса выбирай модель по **реальному** трафику с UTM, а не по «максимальному throughput из брошюры» (он указан без inspection).

**Ориентиры sizing (офис 20–80 сотрудников):**

| Модель | Типичный офис | Concurrent sessions | UTM throughput* | FortiLink портов |
|--------|---------------|---------------------|-----------------|------------------|
| **FG-40F** | 10–25 чел., 1 Gbps WAN | ~700K | ~500 Mbps | 2× GE |
| **FG-60F** | 25–50 чел., 1 Gbps WAN | ~1.5M | ~700 Mbps | 4× GE |
| **FG-100F** | 50–100 чел., 1–2 Gbps WAN | ~2.5M | ~1 Gbps | 4× GE + 2× 10GE SFP+ |

*UTM throughput — с AV + IPS + App Control; реальная цифра зависит от профилей.

**Когда брать FG-40F:** малый офис, без SSL inspection, до 30 VPN-пользователей, один WAN.

**Когда брать FG-60F:** стандартный офис 30–50 человек, SSL-VPN 20–50 users, FortiSwitch/AP через FortiLink, один основной + LTE backup WAN.

**Когда брать FG-100F:** 50+ пользователей, SD-WAN на двух активных каналах, SSL inspection выборочно, рост до 100 VPN sessions, нужен запас по CPU.

**Правило:** если суммарный интернет-канал > 500 Mbps **и** включён UTM на всём трафике — закладывай FG-100F. Проверяй datasheet на [fortinet.com](https://www.fortinet.com) для актуальных цифр FortiOS 7.4.

**Лицензирование:** базовая железка включает ограниченный набор FortiGuard. Для production закладывай **UTM Bundle** (IPS, AV, Web Filter, App Control, Outbreak Prevention) на 1–3 года.`,
    },
    {
      title: 'FortiOS 7.4: GUI и структура меню',
      content: `**Доступ к GUI:** https://192.168.1.99 (заводской IP на internal/wan зависит от модели). Логин \`admin\` без пароля на factory default — **смени немедленно**.

**Ключевые разделы FortiOS 7.4 GUI:**

| Меню | Назначение |
|------|------------|
| **Dashboard → Status** | CPU, sessions, WAN link, uptime |
| **Network → Interfaces** | Physical, VLAN, loopback, zones |
| **Network → Static Routes** | Default route, policy routes |
| **Policy & Objects** | Firewall policies, addresses, services |
| **Security Profiles** | AV, IPS, Web Filter, App Control, SSL/SSH Inspection |
| **VPN** | IPsec Tunnels, SSL-VPN Settings |
| **User & Authentication** | Local/LDAP users, user groups |
| **WiFi & Switch Controller** | FortiAP, FortiSwitch (FortiLink) |
| **System → Administrators** | Admin accounts, trusted hosts, 2FA |
| **Log & Report** | Forward traffic, events, UTM |
| **System → FortiGuard** | License status, update servers |

**CLI:** SSH на management IP → интерактивная оболочка FortiOS. Структура команд: \`config <path>\` → \`edit <name>\` → \`set <param> <value>\` → \`next\` → \`end\`.

**Полезные show-команды с первого дня:**
- \`get system status\` — версия, serial, operation mode
- \`get system interface physical\` — состояние портов
- \`show system admin\` — учётные записи администраторов
- \`diagnose sys session stat\` — загрузка session table

**Рекомендация для SMB:** веди параллельно GUI (операции) и CLI (backup, troubleshooting, copy-paste runbooks). Экспорт конфига: **System → Configuration → Backup**.`,
    },
    {
      title: 'Первый запуск и смена factory defaults',
      content: `**Factory default FortiGate** — устройство в режиме NAT/route, DHCP на internal, admin без пароля, HTTPS на всех интерфейсах. Это **неприемлемо** для production.

**Чеклист первого запуска (SMB офис):**

1. Подключи PC к internal port, получи DHCP или задай статический IP в подсети FG
2. Залогинься, смени пароль admin (минимум 16 символов, уникальный)
3. **System → Settings:** hostname (\`fg-hq-moscow-01\`), timezone, language
4. Зарегистрируй устройство: **System → FortiGuard → License** → Connect to FortiCare
5. Обнови firmware до **stable** ветки 7.4.x (не beta для production)
6. Настрой WAN (DHCP/static/PPPoE) на \`wan1\`
7. Проверь интернет: **Network → Diagnostics → Ping** → 8.8.8.8
8. Настрой DNS (FortiGuard DNS или internal DC)
9. Настрой NTP: **System → Settings → NTP** → \`pool.ntp.org\`
10. Ограничь admin access: trusted hosts = Management VLAN only
11. Включи 2FA для admin (FortiToken Mobile или email)
12. Сделай backup конфига и сохрани offline

**GUI путь для trusted hosts:** System → Administrators → edit admin → Restrict login to trusted hosts → добавь 192.168.99.0/24 (Management VLAN).

**Важно:** не отключай доступ к FG, пока не проверишь новый management path. Всегда имей console cable (USB/serial) для out-of-band доступа.`,
      code: {
        language: 'text',
        caption: 'CLI: смена hostname, DNS, NTP',
        code: `config system global
    set hostname "fg-hq-moscow-01"
    set timezone 33
    set admin-https-ssl-versions tlsv1-2 tlsv1-3
end

config system dns
    set primary 8.8.8.8
    set secondary 1.1.1.1
end

config system ntp
    set ntpsync enable
    set server-mode disable
    config ntpserver
        edit 1
            set server "pool.ntp.org"
        next
    end
end`,
      },
    },
    {
      title: 'Интерфейсы: physical, VLAN, loopback',
      content: `FortiGate — L3-устройство. Каждый логический интерфейс имеет IP-адрес (кроме pure bridge) и участвует в маршрутизации и firewall policies.

**Типы интерфейсов:**

| Тип | Пример | Когда использовать |
|-----|--------|-------------------|
| **Physical** | wan1, internal, dmz | WAN uplink, trunk к core switch |
| **VLAN subinterface** | internal.10, internal.20 | Сегментация LAN по VLAN ID |
| **Loopback** | lo-mgmt | Stable IP для SNMP, BGP, management |
| **Aggregate (802.3ad)** | aggregate1 | LACP к коммутатору |
| **Software Switch** | soft-switch1 | Объединение портов в L2 bridge |
| **Hard Switch** | lan (на FG-40F/60F) | Встроенный switch chip |
| **Tunnel** | ssl.root, ipsec-tunnel | VPN interfaces |

**Типовая схема SMB офиса (50 человек):**

\`\`\`
wan1          → ISP fiber 1 Gbps (DHCP или static)
wan2          → 4G/LTE modem (backup)
internal      → trunk к FortiSwitch (VLANs 10,20,30,60,99)
VLAN10-Servers    192.168.10.0/24
VLAN20-Workstations 192.168.20.0/24
VLAN30-VoIP       192.168.30.0/24
VLAN60-Guest      192.168.60.0/24
VLAN99-Mgmt       192.168.99.0/24
\`\`\`

**Role интерфейса:** WAN — \`role wan\`, LAN — \`role lan\`. Это влияет на DHCP server defaults и Security Fabric.

**GUI:** Network → Interfaces → Create New → VLAN. Parent interface = internal (trunk).`,
      code: {
        language: 'text',
        caption: 'CLI: VLAN subinterfaces для типового офиса',
        code: `config system interface
    edit "VLAN10-Servers"
        set vdom "root"
        set ip 192.168.10.1 255.255.255.0
        set allowaccess ping
        set role lan
        set interface "internal"
        set vlanid 10
    next
    edit "VLAN20-Workstations"
        set vdom "root"
        set ip 192.168.20.1 255.255.255.0
        set allowaccess ping
        set role lan
        set interface "internal"
        set vlanid 20
    next
    edit "VLAN60-Guest"
        set vdom "root"
        set ip 192.168.60.1 255.255.255.0
        set role lan
        set interface "internal"
        set vlanid 60
    next
    edit "VLAN99-Mgmt"
        set vdom "root"
        set ip 192.168.99.1 255.255.255.0
        set allowaccess ping https ssh
        set role lan
        set interface "internal"
        set vlanid 99
    next
end`,
      },
    },
    {
      title: 'Software Switch, Hard Switch и FortiLink',
      content: `На младших моделях (FG-40F) часть портов — **встроенный switch (hard switch)**. На FG-60F/100F обычно dedicated GE/10GE порты без внутреннего switch.

**Hard Switch (lan):** несколько physical портов объединены на уровне ASIC. Удобно для «роутер + 4 порта» без внешнего switch, но **не рекомендуется** для production сегментации — лучше external FortiSwitch.

**Software Switch:** L2 bridge между интерфейсами в software. Используй редко (performance penalty). Предпочитай VLAN subinterfaces на trunk.

**FortiLink** — выделенный порт или VLAN для управления FortiSwitch и FortiAP:
- Автоматическое обнаружение устройств
- Единая конфигурация VLAN с FortiGate
- CAPWAP туннель для FortiAP

**Типовая схема FortiLink:**
- FG port \`internal\` или dedicated \`a\` → trunk к FortiSwitch
- Native VLAN 4094 (FortiLink) или dedicated VLAN 4094
- User VLANs 10, 20, 30, 60, 99 tagged на trunk

**GUI:** WiFi & Switch Controller → FortiLink Interface → выбери порт. После этого FortiSwitch появится в Managed Switches.

**Важно:** не используй FortiLink порт для обычного user traffic без понимания tagging. Один misconfigured trunk = outage всего офиса.`,
      code: {
        language: 'text',
        caption: 'CLI: FortiLink interface (концепт)',
        code: `config system interface
    edit "fortilink"
        set vdom "root"
        set fortilink enable
        set ip 10.255.1.1 255.255.255.0
        set allowaccess ping fabric
        set type aggregate
        set member "x1" "x2"
        set lldp-transmission enable
        set auto-auth-extension-device enable
    next
end`,
      },
    },
    {
      title: 'Zones: группировка интерфейсов для политик',
      content: `**Zone** — логическая группа интерфейсов. В firewall policy можно указать zone вместо одного interface — политика применяется ко всем членам zone.

**Зачем zones в SMB:**
- Упрощение политик при нескольких WAN (wan1 + wan2 в zone WAN)
- Единая политика «LAN → Internet» для всех user VLAN
- Меньше дублирования при добавлении нового VLAN

**Рекомендуемые zones для офиса:**

| Zone | Members | Назначение |
|------|---------|------------|
| **WAN** | wan1, wan2 | Исходящий интернет, входящие VIP |
| **LAN-Users** | VLAN20, VLAN30 | Рабочие станции, VoIP |
| **LAN-Servers** | VLAN10 | Серверы, DC |
| **LAN-Guest** | VLAN60 | Guest Wi-Fi |
| **MGMT** | VLAN99 | Управление инфраструктурой |

**Пример политики с zones:** Incoming = LAN-Users, Outgoing = WAN — одна политика вместо трёх на каждый VLAN.

**Ограничение:** interface может быть только в одной zone. Tunnel interfaces (IPsec, SSL-VPN) обычно в отдельных zones.

**GUI:** Network → Interfaces → Zone → Create New.`,
      code: {
        language: 'text',
        caption: 'CLI: создание zones',
        code: `config system zone
    edit "WAN"
        set interface "wan1" "wan2"
    next
    edit "LAN-Users"
        set interface "VLAN20-Workstations" "VLAN30-VoIP"
    next
    edit "LAN-Guest"
        set interface "VLAN60-Guest"
    next
end`,
      },
    },
    {
      title: 'VDOM: виртуальные домены',
      content: `**VDOM (Virtual Domain)** — несколько независимых виртуальных firewall на одном физическом FortiGate. У каждого VDOM свои interfaces, policies, routing table.

**Режимы:**
- **Split VDOM** — root + дополнительные VDOM (FG-100F и выше, с лицензией)
- **Multi VDOM** — полное разделение (enterprise, MSP)

**Когда VDOM нужен:**
- MSP обслуживает нескольких клиентов на одном FG
- Крупный enterprise: prod / dev / DMZ полностью изолированы
- Lab на production железе (не рекомендуется, но встречается)

**Когда VDOM НЕ нужен (типичный SMB):**
- Один офис, один admin team
- До 100 пользователей
- Сегментация через VLAN + policies достаточна

**SMB рекомендация:** работай в единственном VDOM \`root\`. VDOM добавляет сложность (inter-VDOM links, отдельные лицензии, путаница в GUI). Не включай Multi-VDOM «на будущее».

**Если всё же нужен VDOM:** FG-100F+, лицензия VDOM, отдельный management VDOM для admin access. Документируй matrix: какой VDOM → какие VLAN → какие policies.

**Проверка:** \`get system vdom-property\` — список VDOM и resource limits.`,
    },
    {
      title: 'Маршрутизация: static routes и default gateway',
      content: `FortiGate выполняет маршрутизацию между подключёнными сетями и через WAN. Для SMB офиса 99% случаев — **static routing**.

**Default route:** 0.0.0.0/0 → gateway ISP на wan1. При dual WAN — см. SD-WAN (глава Operations) или policy-based routes.

**Static routes для internal:**
- Подключённые сети (VLAN interfaces) — connected, маршрут создаётся автоматически
- Remote office subnets — static route через IPsec tunnel interface
- AWS VPC subnets — static route через IPsec to VGW

**GUI:** Network → Static Routes → Create New.

**Distance и priority:** при двух маршрутах к одной сети побеждает меньший distance. Backup route — distance 10, primary — 5.

**Policy Route:** маршрутизация по source/destination/service, не только по destination IP. Используй для «servers patching только через wan2».

**Reverse Path Forwarding (RPF):** FortiGate проверяет, что return traffic придёт на тот же interface. Asymmetric routing ломает RPF → implicit deny. При troubleshooting «трафик уходит, ответ не приходит» — проверь RPF.`,
      code: {
        language: 'text',
        caption: 'CLI: default route и route к AWS через IPsec',
        code: `config router static
    edit 1
        set dst 0.0.0.0 0.0.0.0
        set gateway 203.0.113.1
        set device "wan1"
        set distance 5
    next
    edit 2
        set dst 10.50.0.0 255.255.0.0
        set device "AWS-Tunnel"
        set comment "AWS VPC via IPsec"
    next
end`,
      },
    },
    {
      title: 'DHCP, DNS relay и системные сервисы',
      content: `FortiGate может быть DHCP server для каждого VLAN interface — удобно для Guest и IoT. Для production user VLAN **рекомендуется Windows DHCP** на DC (интеграция с AD, reservations, failover).

**Когда DHCP на FortiGate:**
- Guest VLAN 60 — изолированная подсеть, TTL 4h
- VoIP VLAN — option 66/150 для TFTP (если нет dedicated DHCP)
- Lab, temporary networks

**DNS:**
- **FortiGate as DNS proxy** — clients → FG → FortiGuard DNS (с фильтрацией)
- **DNS relay to DC** — clients → FG → 192.168.10.10 (internal AD DNS)
- **Split DNS** — internal zones через DC, external через FortiGuard

**GUI:** Network → DNS Servers. System → DHCP Server (per interface).

**NTP:** обязателен для корректных логов, сертификатов, IPsec. Синхронизируй FG и все managed devices.

**SNMP (опционально):** для Zabbix/Prometheus SNMP exporter. Read-only community, access только с MGMT VLAN.`,
      code: {
        language: 'text',
        caption: 'CLI: DHCP server для Guest VLAN',
        code: `config system dhcp server
    edit 1
        set dns-service default
        set default-gateway 192.168.60.1
        set netmask 255.255.255.0
        set interface "VLAN60-Guest"
        config ip-range
            edit 1
                set start-ip 192.168.60.100
                set end-ip 192.168.60.200
            next
        end
        set lease-time 14400
    next
end`,
      },
    },
    {
      title: 'FortiGuard: лицензии и обновления',
      content: `**FortiGuard** — облачная служба обновлений Fortinet: IPS signatures, AV, Web Filter categories, Application Control, GeoIP, Outbreak Prevention.

**Типы подписок (UTM Bundle):**

| Сервис | Без подписки | С UTM Bundle |
|--------|-------------|--------------|
| IPS | Ограниченные сигнатуры | Полная база, auto-update |
| Antivirus | Базовый | Extended database |
| Web Filter | Минимум категорий | 90+ categories |
| Application Control | Ограничено | 5000+ applications |
| Outbreak Prevention | Нет | Zero-day cloud check |

**Проверка лицензии:** System → FortiGuard → License Information. Status = Licensed, Expiry > 90 days.

**Scheduled Updates:** System → FortiGuard → Scheduled Updates — ежедневно в 03:00 (off-peak). Включи **push update** для критичных outbreak.

**FortiGuard Anycast:** FG автоматически выбирает ближайший update server. При проблемах с обновлением — проверь DNS и outbound HTTPS к FortiGuard.

**Без активной лицензии:** устройство продолжает маршрутизировать, но UTM-профили деградируют. Для production SMB — **никогда** не допускай expiry: настрой alert за 30/60/90 дней.

**Регистрация:** support.fortinet.com → Register Product → serial number. Привяжи к FortiCare contract.`,
    },
    {
      title: 'Security Fabric: единая экосистема',
      content: `**Security Fabric** — топология безопасности, где FortiGate — root, а FortiSwitch, FortiAP, FortiClient EMS, FortiAnalyzer — fabric members. Единый dashboard, общие теги, автоматическая авторизация устройств.

**Компоненты Fabric в SMB офисе:**

\`\`\`
                    ┌─────────────┐
                    │ FortiAnalyzer│
                    └──────┬──────┘
                           │ logs
┌──────────┐    ┌──────────┴──────────┐    ┌─────────────┐
│FortiClient│◄──│     FortiGate        │───►│ FortiSwitch │
│   EMS     │   │  (Security Fabric    │    │  (FortiLink)│
└──────────┘    │       Root)          │    └──────┬──────┘
                └──────────┬──────────┘           │
                           │ FortiLink             │
                    ┌──────┴──────┐                │
                    │   FortiAP   │◄───────────────┘
                    └─────────────┘
\`\`\`

**Включение Fabric:** Security Fabric → Fabric Connectors → Enable. Authorize downstream devices при первом подключении.

**Преимущества для SMB:**
- Один GUI для firewall + switch + Wi-Fi VLAN assignment
- Quarantine compromised endpoint через EMS → FG policy
- Единые логи на FortiAnalyzer с fabric serial correlation
- Automated tag propagation (compromised host → deny policy)

**FortiLink security:** включи **FortiLink Security Fabric** authorization — неавторизованные switch/AP не подключатся.`,
    },
    {
      title: 'FortiManager: центральное управление',
      content: `**FortiManager** — отдельное устройство/VM для управления множеством FortiGate. Для одного офиса **не нужен**. Рассматривай при:
- 3+ филиалов с одинаковыми политиками
- MSP с десятками клиентских FG
- Centralized logging + config backup (альтернатива — FortiAnalyzer + scripted backup)

**Возможности FortiManager:**
- Policy Package — единый набор policies, push на все FG
- Device Group — группировка по региону/клиенту
- FortiGuard proxy — один update path для изолированных сетей
- Workflow approval для changes

**Альтернатива для SMB без FortiManager:**
- Scheduled config backup на SFTP (скрипт + cron)
- Infrastructure as Code: Terraform FortiOS provider (advanced)
- Документированные runbooks для manual config

**Если один FG-60F в головном офисе:** FortiManager — overkill. Инвестируй в FortiAnalyzer VM для логов.`,
    },
    {
      title: 'Администраторы, профили и 2FA',
      content: `**Принцип least privilege** для admin access на FortiGate production.

**Типы admin profiles:**

| Profile | Права | Кто |
|---------|-------|-----|
| **super_admin** | Полный доступ | 1–2 senior admin |
| **prof_admin** | Policies, objects, no system | Network engineer |
| **read_only** | Только просмотр | NOC, audit |

**Обязательные настройки:**
- Отдельные admin accounts (не shared \`admin\`)
- Trusted hosts = VLAN99 only (192.168.99.0/24)
- HTTPS admin, отключи HTTP
- SSH только с MGMT VLAN
- 2FA: FortiToken Mobile для всех super_admin
- Failed login threshold + lockout
- Admin timeout 15–30 min

**GUI:** System → Administrators → Create New. Profile = ограниченный. Trusted Hosts = включено.

**Аудит:** включи event log для admin login/logout/config change. Forward на FortiAnalyzer.

**Никогда:** admin access с WAN без VPN. Если нужен remote admin — только через SSL-VPN + trusted hosts.`,
      code: {
        language: 'text',
        caption: 'CLI: admin с trusted hosts и ограниченным profile',
        code: `config system admin
    edit "netops"
        set trusthost1 192.168.99.0 255.255.255.0
        set accprofile "prof_admin"
        set vdom "root"
        set password ENC <encrypted>
        set two-factor fortitoken
        set fortitoken <token_serial>
    next
end`,
      },
    },
    {
      title: 'Регистрация, поддержка и firmware policy',
      content: `**FortiCare регистрация** — обязательна для firmware updates, FortiGuard, TAC support.

**Шаги:**
1. support.fortinet.com → Register Product
2. На FG: System → FortiGuard → Login to FortiCare (или CLI \`execute update-now\`)
3. Verify serial, contract, expiry dates

**Firmware policy для SMB production:**
- Ветка: **mature** (7.4.x stable, не 7.6 beta)
- Upgrade window: maintenance Saturday 02:00–06:00
- Pre-upgrade: backup config, read release notes, check known issues
- Post-upgrade: verify VPN, policies, FortiLink devices
- Rollback plan: previous firmware partition (FG хранит 2 образа)

**GUI:** System → Firmware → выбери stable → Upgrade. Для HA — сначала secondary (см. Operations).

**Авто-patch:** не включай auto-firmware без тестового FG. Signature updates — да, firmware — только controlled.`,
    },
    {
      title: 'Backup, restore и revision control',
      content: `**Config backup** — критичная операция. FortiGate без backup = single point of failure.

**Методы backup:**
- **Manual GUI:** System → Configuration → Backup → Encrypt (AES password!)
- **Scheduled:** System → Configuration → Backup Settings → SFTP/SCP
- **CLI:** \`execute backup config tftp <file> <server>\`
- **FortiManager:** automatic revision history

**Что хранить:**
- Ежедневный automated backup (retention 30 days)
- Backup перед каждым change (с ticket ID в имени файла)
- Offline copy (не только на том же FG!)

**Restore:** System → Configuration → Restore. **Внимание:** restore перезаписывает всё, включая admin passwords из backup file.

**Encrypted backup:** всегда шифруй. .conf файл содержит PSK VPN, LDAP bind passwords (masked, но decryptable).

**Version control (advanced):** экспортируй .conf в git private repo, diff перед change. Не commit в public repos.`,
      code: {
        language: 'text',
        caption: 'CLI: backup и restore',
        code: `# Backup на TFTP server
execute backup config tftp fg-hq-backup-20260710.conf 192.168.99.50

# Backup с шифрованием
execute backup config tftp fg-hq-encrypted.conf 192.168.99.50 <password>

# Restore (ОСТОРОЖНО — перезапишет конфиг)
execute restore config tftp fg-hq-backup-20260710.conf 192.168.99.50`,
      },
    },
    {
      title: 'Capacity planning и мониторинг ресурсов',
      content: `**Метрики для monitoring SMB FortiGate:**

| Метрика | Warning | Critical | Команда |
|---------|---------|----------|---------|
| CPU | > 60% sustained | > 85% | \`get system performance status\` |
| Memory | > 70% | > 90% | Dashboard |
| Session count | > 70% max | > 90% max | \`diagnose sys session stat\` |
| Disk | > 80% | > 95% | \`get system status\` |
| WAN bandwidth | > 80% line rate | saturation | SNMP / FortiAnalyzer |

**Session table:** каждое TCP connection = 2 sessions (client→FG, FG→server). FG-60F max ~1.5M — для 50 users с UTM достаточно с запасом.

**Признаки undersized FG:**
- CPU spikes при business hours
- SSL inspection отключена «потому что тормозит»
- Session table near limit
- UTM bypass rules «для скорости»

**Решение:** upgrade модели, selective SSL inspection, ASIC offload where possible, reduce logging verbosity.

**Dashboard widgets:** добавь CPU, Memory, Sessions, WAN utilization, Top applications.`,
    },
    {
      title: 'Типовая архитектура SMB офиса 50 человек',
      content: `**Референс-дизайн** для головного офиса компании ~50 сотрудников.

**Железо:**
- FortiGate FG-60F (UTM Bundle 3yr)
- FortiSwitch 148F-POE × 2 (access layer)
- FortiAP 231F × 4 (open space + meeting rooms)
- FortiAnalyzer 100F VM или syslog server

**Сеть:**
- WAN1: fiber 500 Mbps (primary)
- WAN2: LTE 100 Mbps (backup, SD-WAN failover)
- VLAN10 Servers 192.168.10.0/24
- VLAN20 Workstations 192.168.20.0/24
- VLAN30 VoIP 192.168.30.0/24
- VLAN60 Guest 192.168.60.0/24
- VLAN99 Management 192.168.99.0/24

**Сервисы на FG:**
- Firewall policies (см. глава Policies)
- SSL-VPN для 30 remote users
- DHCP только Guest VLAN
- DNS relay to DC
- FortiGuard Web Filter + IPS на user traffic

**Не на FG:** file server, AD, DHCP для users — на Windows Server в VLAN10.

**Документация:** сетевой diagram, IP plan, admin contacts, ISP details, backup location, FortiCare contract number.`,
    },
    {
      title: 'Troubleshooting базовой связности',
      content: `**Методика «снизу вверх»** при «нет интернета» или «не пингуется»:

1. **Physical:** link up? \`get system interface physical\`
2. **IP:** FG ping gateway? \`execute ping 203.0.113.1\`
3. **DNS:** \`execute ping google.com\` vs \`execute ping 8.8.8.8\`
4. **Route:** \`get router info routing-table all\`
5. **Policy:** Policy Lookup в GUI
6. **NAT:** central SNAT enabled?
7. **Session:** \`diagnose sys session filter <ip>\`

**Частые ошибки первичной настройки:**
- Забыли default route
- Policy без NAT для internet
- Admin trusted hosts блокируют свой IP
- VLAN ID mismatch между FG и switch
- Duplicate IP на interface

**Ping options:** execute ping-options source <interface_ip> — ping с конкретного VLAN.`,
      code: {
        language: 'text',
        caption: 'CLI: диагностика связности',
        code: `get system status
get system interface physical
get router info routing-table all
execute ping 8.8.8.8
execute ping-options source 192.168.20.1
execute ping 192.168.10.10

diagnose debug reset
diagnose debug flow filter addr 192.168.20.50
diagnose debug flow show function-name enable
diagnose debug enable
# воспроизведи трафик с клиента
diagnose debug disable`,
      },
    },

    {
      title: 'Factory reset → production: полный путь',
      content: `**Сценарий:** новый FortiGate из коробки или после lab-теста — довести до production-ready состояния.

**Фаза 1 — Factory baseline (30 мин):**
1. Console cable → login admin (no password)
2. \`execute factoryreset\` (или кнопка reset 10+ sec) — **только на новом/lab FG**
3. Verify: default IP, DHCP on internal, HTTPS on all interfaces
4. Update firmware до целевой 7.4.x **до** production config

**Фаза 2 — Hardening baseline (1 ч):**
1. Смена admin password (16+ chars, unique)
2. Создание named admin accounts, disable shared admin (optional)
3. Hostname, timezone, NTP
4. FortiCare registration + UTM license activation
5. Trusted hosts = MGMT VLAN only
6. Disable HTTP admin, enable HTTPS TLS 1.2+
7. FortiToken 2FA для super_admin

**Фаза 3 — Network foundation (2 ч):**
1. WAN interface (static/DHCP/PPPoE)
2. VLAN subinterfaces per IP plan
3. Zones (WAN, LAN-Users, LAN-Guest, MGMT)
4. Default route + static routes (AWS, branch)
5. DNS relay / FortiGuard DNS

**Фаза 4 — Security baseline (1 ч):**
1. Security Rating → apply FortiGuard recommendations
2. FortiGuard scheduled updates (03:00 daily)
3. Admin audit logging → FortiAnalyzer/syslog
4. Encrypted config backup

**Фаза 5 — Validation (30 мин):**
- Checklist: internet OK, admin only from MGMT, no default passwords
- Security Rating score ≥ 80%
- Backup saved offline
- Change ticket closed

**Rollback:** если что-то сломалось mid-deploy — restore last good backup, не factory reset на production без backup.`,
      code: {
        language: 'text',
        caption: 'CLI: factory reset и post-reset verify',
        code: `# ТОЛЬКО lab или новый FG из коробки
execute factoryreset

# После reset — verify
get system status
show system admin
get system interface physical`,
      },
    },
    {
      title: 'Interface migration при замене FortiGate',
      content: `**Сценарий:** замена FG-60F на FG-100F без изменения IP plan и минимального downtime.

**Подготовка (за неделю):**
1. Export running config с old FG (encrypted backup)
2. Document physical port mapping: wan1→ISP, internal→core switch trunk
3. Verify new FG firmware = same 7.4.x branch
4. Pre-config new FG offline: import config, fix interface names if different

**Port mapping differences:**
| Old FG-60F | New FG-100F | Notes |
|------------|-------------|-------|
| wan1 | wan1 | ISP |
| internal | port1 | Trunk to switch |
| dmz | port2 | If used |
| a, b | x1, x2 | FortiLink may differ |

**Migration window (2–4 ч):**
1. Maintenance notification (VPN/internet downtime)
2. Backup old FG config (final)
3. Physical swap: cables to new FG **same ports where possible**
4. Boot new FG with restored config
5. Fix interface bindings if hardware differs:
   - \`config system interface\` → update \`set interface\` parent for VLANs
6. Verify: WAN IP, VLAN gateways, VPN tunnels, FortiLink switches

**Post-migration validation:**
- Ping test all VLAN gateways
- VPN reconnect (IPsec + SSL-VPN)
- FortiSwitch/AP re-authorize on FortiLink
- FortiAnalyzer re-register device serial
- 24h monitoring

**Rollback:** keep old FG cabled but powered off 48h. If failure — swap back.`,
      code: {
        language: 'text',
        caption: 'CLI: проверка interface mapping после миграции',
        code: `get system interface
diagnose hardware deviceinfo nic
get system status | grep Serial

# Verify VLAN parent interfaces
show system interface | grep -f vlan`,
      },
    },
    {
      title: 'VDOM: когда использовать — decision framework',
      content: `**Decision tree для SMB:**

\`\`\`
Нужен VDOM?
├── Один офис, один admin team → НЕТ (root VDOM + VLAN)
├── MSP, несколько клиентов на одном FG → ДА (Multi-VDOM)
├── Prod + Lab на одном железе → НЕТ (отдельная lab VM)
├── Regulatory: prod/DMZ полная изоляция routing → Рассмотреть VDOM
└── > 100 policies, разные admin teams → Рассмотреть VDOM или FortiManager
\`\`\`

**Root VDOM (99% SMB):**
- Все VLAN = interfaces в root
- Сегментация через firewall policies
- Проще troubleshooting, backup, training

**Multi-VDOM (enterprise/MSP):**
- Требует лицензию VDOM (FG-100F+: 10 VDOM default)
- Каждый VDOM = отдельный routing table, policies, admin scope
- Inter-VDOM link (VDOM-link interface) для controlled cross-VDOM traffic
- FortiManager strongly recommended

**Management VDOM pattern:**
- mgmt VDOM: admin access, FortiAnalyzer connection
- prod VDOM: user traffic
- Сложность ↑, security boundary ↑

**Проверка текущего режима:**
\`\`\`
get system vdom
get system vdom-property
\`\`\`

**SMB правило:** не включай Multi-VDOM «на вырост». VLAN + zones + policies покрывают 50–200 users.`,
    },
    {
      title: 'FortiToken MFA: пошаговая настройка',
      content: `**FortiToken Mobile** — бесплатный OTP для admin и VPN users.

**Для admin account:**
1. System → Administrators → edit admin
2. Two-factor Authentication → FortiToken
3. User & Authentication → FortiToken → Create New → Mobile → assign to admin
4. QR code → scan in FortiToken Mobile app
5. Test login: password + 6-digit code

**Для VPN users (LDAP):**
1. User & Authentication → Authentication Settings → Enable Two-Factor
2. Create LDAP user override OR assign token per user
3. Alternative: FortiAuthenticator as RADIUS proxy (centralized MFA)

**Token lifecycle:**
- Activation: user scans QR within 24h
- Lost device: revoke token, issue new
- Offboarding: delete token immediately

**Troubleshooting OTP fail:**
- NTP sync on FG (\`get system status\` → check time)
- Token drift > 30 sec → re-sync app
- Wrong token assigned to user

**Best practice:** MFA mandatory for: super_admin, VPN-Admins, any admin with write access.`,
      code: {
        language: 'text',
        caption: 'CLI: FortiToken для admin',
        code: `execute fortitoken-mobile import ftm-fgt.csv

config user fortitoken
    edit "FTKMOB0000000001"
        set status active
    next
end

config system admin
    edit "admin"
        set two-factor fortitoken
        set fortitoken "FTKMOB0000000001"
    next
end`,
      },
    },
    {
      title: 'Certificate management: CA, server cert, import',
      content: `**Типы сертификатов на FortiGate:**

| Тип | Назначение | Источник |
|-----|------------|----------|
| **Local CA** | SSL inspection, internal PKI | FG generates |
| **Server cert** | Admin HTTPS, SSL-VPN portal | Let's Encrypt / corporate CA |
| **Trusted CA** | Verify remote servers | Import CA bundle |
| **Remote cert** | IPsec certificate auth | Peer CA |

**SSL-VPN server certificate (production):**
1. System → Certificates → Import → PKCS12 or CSR
2. Or: Let's Encrypt via ACME (FortiOS 7.4+)
3. VPN → SSL-VPN Settings → Server Certificate → select cert
4. Users trust CA (public CA = automatic)

**SSL Deep Inspection CA:**
1. System → Certificates → Create → Certificate Authority
2. Export CA cert (.cer)
3. Deploy via GPO (Windows) / MDM (macOS) to Trusted Root
4. Security Profiles → SSL/SSH Inspection → use CA

**IPsec certificate auth:**
1. Generate CSR on FG
2. Sign at corporate CA
3. Import signed cert + CA chain
4. Phase1 → authmethod signature

**Renewal:** monitor expiry 30 days before. SSL-VPN cert expiry = total VPN outage.`,
      code: {
        language: 'text',
        caption: 'CLI: import server certificate',
        code: `execute vpn certificate local import tftp vpn-server.crt 192.168.99.50
execute vpn certificate ca import tftp ca-bundle.crt 192.168.99.50

config vpn ssl settings
    set servercert "vpn-server-cert"
end`,
      },
    },
    {
      title: 'REST API: примеры автоматизации',
      content: `**FortiGate REST API** (FortiOS 7.4) — автоматизация backup, monitoring, object management.

**Enable API admin:**
1. System → Administrators → Create API admin
2. Profile: read-only (monitoring) or REST API permissions
3. Trusted hosts restrict to automation server

**Authentication:** Bearer token via login endpoint or API key.

**Примеры use cases SMB:**
- Nightly config backup via API
- Sync address objects from CMDB
- Create temporary firewall rule (change automation)
- Pull system status for Grafana

**API paths:**
- \`/api/v2/monitor/system/status\` — GET status
- \`/api/v2/cmdb/firewall/address\` — CRUD addresses
- \`/api/v2/cmdb/system/admin\` — admin management

**Terraform alternative:** FortiOS Terraform provider for Infrastructure as Code.`,
      code: {
        language: 'text',
        caption: 'REST API: login и backup config',
        code: `# Login (get session cookie)
curl -k -X POST "https://192.168.99.1/api/v2/authentication" \
  -H "Content-Type: application/json" \
  -d '{"username":"api-admin","secret":"password"}'

# Get system status
curl -k -X GET "https://192.168.99.1/api/v2/monitor/system/status" \
  -H "Authorization: Bearer <token>"

# Backup config
curl -k -X POST "https://192.168.99.1/api/v2/monitor/system/config/backup" \
  -H "Authorization: Bearer <token>" \
  -o fg-backup.conf`,
      },
    },
    {
      title: 'Sizing calculator: пошаговый walkthrough',
      content: `**Fortinet Sizing Tool** (fortinet.com → Resources → Sizing Tool) — формальный расчёт модели.

**Шаг 1 — Traffic profile:**
- WAN bandwidth: 500 Mbps fiber
- Users: 50 concurrent
- VPN users: 30 SSL-VPN
- UTM: AV + IPS + Web Filter + App Control (no full SSL inspection)

**Шаг 2 — Input parameters:**
| Parameter | Value |
|-----------|-------|
| Throughput required | 500 Mbps |
| UTM enabled | Yes |
| SSL inspection | Partial (30%) |
| Concurrent sessions | 50 users × 50 sessions = 2500 |
| VPN tunnels | 30 SSL + 2 IPsec |
| FortiSwitch/AP | 4 AP, 2 switches |

**Шаг 3 — Tool output:**
- FG-60F: **marginal** at 500 Mbps UTM (700 Mbps rated, 70% rule)
- FG-100F: **recommended** with headroom

**Шаг 4 — Validate with 70% rule:**
Never run FG above 70% sustained CPU/sessions/throughput.

**Шаг 5 — Future growth:**
+20 users/year → FG-100F avoids upgrade in 2 years.

**Manual formula (rough):**
\`\`\`
Required UTM throughput = WAN_speed × 1.2 (overhead)
If Required > Datasheet_UTM × 0.7 → next model up
\`\`\`

**Document:** save sizing tool PDF in procurement folder.`,
    },
    {
      title: 'FG-40F vs FG-60F vs FG-100F: feature matrix',
      content: `**Полная сравнительная матрица (FortiOS 7.4, типовые SKU):**

| Feature | FG-40F | FG-60F | FG-100F |
|---------|--------|--------|---------|
| **Threat Protection throughput** | ~500 Mbps | ~700 Mbps | ~1 Gbps |
| **Concurrent sessions** | ~700K | ~1.5M | ~2.5M |
| **New sessions/sec** | ~35K | ~50K | ~80K |
| **SSL-VPN users (tunnel)** | 50 | 200 | 500 |
| **IPsec VPN throughput** | ~1 Gbps | ~2 Gbps | ~3 Gbps |
| **GE ports** | 5 (hard switch) | 10 | 14 |
| **10GE SFP+** | 0 | 0 | 2 |
| **FortiLink default** | Limited | 4 ports | 4 ports |
| **VDOMs (default license)** | 10 | 10 | 10 |
| **HA Active-Passive** | Yes | Yes | Yes |
| **SD-WAN** | Yes | Yes | Yes |
| **NP7 ASIC** | No | Partial | Yes |
| **Wi-Fi controller (APs)** | 32 | 64 | 128 |
| **Managed switches** | 8 | 16 | 24 |
| **Typical office size** | 10–25 | 25–50 | 50–100 |
| **Price tier** | $ | $$ | $$$ |

**FG-40F ограничения:** hard switch на LAN портах — не ideal для trunk VLAN segmentation. OK для micro-office.

**FG-60F sweet spot:** большинство SMB 30–50 users, один WAN 500 Mbps.

**FG-100F triggers:** dual WAN active, 50+ VPN, SD-WAN load balance, SSL inspection > 30% traffic, FortiLink 3+ switches.`,
    },
    {
      title: 'FortiOS 7.4 lab: FortiGate VM на VMware/ESXi/KVM',
      content: `**Цель lab:** развернуть FortiGate-VM64 trial на гипервизоре, получить working FG для всех глав модуля.

**Скачивание:**
1. support.fortinet.com → Downloads → FortiGate → VM
2. Выбери: VMware (.ovf), ESXi (.zip), KVM (.qcow2)
3. Trial license: 15 days full UTM (extend via FortiCare eval)

**VMware Workstation / Fusion:**
1. File → Open → FortiGate-VM64.ovf
2. RAM: 2 GB min (4 GB recommended)
3. vNICs: 3 (wan1, internal, mgmt)
   - WAN → NAT/bridged to internet
   - Internal → host-only или custom VMnet
   - Mgmt → host-only 192.168.99.0/24
4. Power on → console: login admin/(blank)
5. Default IP: 192.168.1.99 on port1 — adjust per lab

**ESXi:**
1. Upload OVF via vSphere Client → Deploy OVF Template
2. Datastore: 30 GB thin provision
3. Network mapping: WAN-VLAN, LAN-VLAN, MGMT-VLAN
4. Resource pool: 2 vCPU, 4096 MB RAM
5. Console → initial setup

**KVM (libvirt):**
\`\`\`
virt-install --name fg-lab --ram 4096 --vcpus 2 \\
  --disk path=/var/lib/libvirt/images/fg-lab.qcow2 --import \\
  --network bridge=br-wan,model=virtio \\
  --network bridge=br-lan,model=virtio
\`\`\`

**Post-deploy (все платформы):**
1. GUI https://192.168.1.99 — change password
2. Register trial license: System → FortiGuard
3. Upgrade firmware 7.4.x
4. Configure interfaces per lab topology
5. Snapshot VM «clean-baseline»

**Lab topology:**
\`\`\`
[Internet] ← wan1 ← [FG-VM] → internal → [Client VM VLAN20]
                              → mgmt    → [Admin PC VLAN99]
\`\`\`

**Troubleshooting VM:**
- No license → limited functionality, register trial
- vNIC order wrong → check \`get system interface physical\`
- No internet on WAN → hypervisor NAT/bridge config`,
      code: {
        language: 'text',
        caption: 'CLI: первичная настройка VM после deploy',
        code: `config system interface
    edit "port1"
        set alias "wan1"
        set mode dhcp
        set allowaccess ping https
    next
    edit "port2"
        set alias "internal"
        set ip 192.168.20.1 255.255.255.0
        set allowaccess ping https ssh
    next
end

execute ping 8.8.8.8`,
      },
    },
    {
      title: 'Справочник diagnose/debug команд',
      content: `**System diagnostics:**
| Команда | Назначение |
|---------|------------|
| \`get system status\` | Version, serial, uptime, operation mode |
| \`get system performance status\` | CPU, memory, NPU usage |
| \`diagnose sys session stat\` | Session table summary |
| \`diagnose sys top 5 10\` | Top processes by CPU |
| \`get hardware status\` | Temperature, fan, PSU |
| \`diagnose hardware deviceinfo nic\` | NIC details |

**Network diagnostics:**
| Команда | Назначение |
|---------|------------|
| \`get system interface physical\` | Link status all ports |
| \`get router info routing-table all\` | Full routing table |
| \`diagnose ip address list\` | All interface IPs |
| \`diagnose sniffer packet wan1 'host x.x.x.x' 4 0 l\` | Packet capture |
| \`execute traceroute 8.8.8.8\` | Path trace |

**Firewall debug (ОСТОРОЖНО — CPU load):**
| Команда | Назначение |
|---------|------------|
| \`diagnose debug reset\` | Clear debug state |
| \`diagnose debug flow filter addr x.x.x.x\` | Filter by IP |
| \`diagnose debug flow show function-name enable\` | Verbose flow |
| \`diagnose debug enable\` | Start debug |
| \`diagnose debug disable\` | **Stop debug** |

**FortiGuard/connectivity:**
| Команда | Назначение |
|---------|------------|
| \`diagnose debug rating\` | Security Rating debug |
| \`execute update-now\` | Force FortiGuard update |
| \`diagnose test update info\` | Update server reachability |

**Правило:** всегда \`diagnose debug disable\` после session. На production — maintenance window.`,
    },
    {
      title: 'Production case study 1: миграция с SOHO роутера',
      content: `**Клиент:** юридическая фирма, 35 сотрудников, Москва.

**Было:** ISP router + cheap SOHO firewall, flat network 192.168.1.0/24, no VLAN, no VPN inspection.

**Задача:** сегментация, SSL-VPN для 15 remote lawyers, compliance (152-ФЗ logging).

**Решение:**
- FortiGate FG-60F + UTM Bundle 3yr
- VLAN10 Servers, VLAN20 Users, VLAN60 Guest, VLAN99 Mgmt
- SSL-VPN + AD + FortiToken MFA
- FortiAnalyzer VM 90-day log retention

**Timeline:** 2 weekends (deploy + VPN rollout).

**Results:**
- Security Rating: 32% → 87%
- Guest isolated from file server (verified pen test)
- VPN audit trail for compliance
- Incident: blocked ransomware C2 via IPS week 2

**Lessons learned:**
- Schedule SSL-VPN training for lawyers (FortiClient install)
- Pre-create AD group VPN-Users before go-live
- Keep old router 1 week as emergency fallback`,
    },
    {
      title: 'Production case study 2: dual WAN + SD-WAN failover',
      content: `**Клиент:** trading support office, 45 users, SLA 99.9% internet.

**Было:** single fiber WAN, 4h outage cost = $50K business impact.

**Решение:**
- FG-100F HA pair (Active-Passive)
- wan1: fiber 1 Gbps, wan2: LTE 200 Mbps
- SD-WAN with health-check failover (< 15 sec)
- FortiAnalyzer alerts on WAN switch

**Config highlights:**
- Link monitor: ping 8.8.8.8 + 1.1.1.1 every 1 sec
- Failtime: 3, Recoverytime: 5
- Email alert: «Office on LTE backup»

**Failover test results:**
- Unplug fiber → LTE active in 12 seconds
- VPN users: brief disconnect, auto-reconnect
- VoIP: 2 dropped calls (acceptable per SLA)

**Monthly test:** automated script disables wan1 every 1st Sunday 06:00, verifies wan2, restores.

**Cost:** FG-100F HA ≈ 2× hardware, but outage cost justified investment.`,
    },
    {
      title: 'Production case study 3: FortiLink campus Wi-Fi',
      content: `**Клиент:** open-space IT company, 80 employees, 2000 m² office.

**Было:** unmanaged APs, separate controller, inconsistent VLAN assignment.

**Решение:**
- FG-100F as Wi-Fi controller
- 6× FortiAP 231F via FortiSwitch 248E-POE FortiLink
- SSIDs: Corp (802.1X/VLAN20), Guest (VLAN60), Dev (VLAN70)

**Architecture:**
\`\`\`
FG-100F [FortiLink trunk] → FSW-248E → 6× FAP-231F (PoE)
\`\`\`

**Benefits:**
- Single GUI for firewall + Wi-Fi policies
- Guest isolation enforced at FG (not just AP)
- EMS integration: non-compliant laptop → quarantine SSID

**Challenge:** initial RF interference — resolved with site survey, channel plan 1/6/11.

**Metrics post-deploy:**
- Wi-Fi coverage: 98% areas > -65 dBm
- Helpdesk Wi-Fi tickets: -60% in 3 months
- Security Fabric dashboard: unified view`,
    },
    {
      title: 'FAQ: 12 частых вопросов (Fundamentals)',
      content: `**1. Нужен ли FortiManager для одного офиса?**
Нет. FortiAnalyzer для логов + scripted backup достаточно.

**2. FG-40F хватит для 40 пользователей?**
Имя модели ≠ user count. При 500 Mbps + UTM бери FG-60F minimum.

**3. Можно ли использовать FG как DHCP для всех VLAN?**
Можно, но для AD integration лучше Windows DHCP на DC.

**4. Что если FortiGuard license expired?**
Routing работает, UTM деградирует. Renew немедленно.

**5. VDOM vs VLAN — что выбрать?**
VLAN для 99% SMB. VDOM для MSP/multi-tenant.

**6. Как получить trial VM license?**
support.fortinet.com → register → download VM + eval license.

**7. Factory reset удалит license?**
Нет, license привязан к serial. Config удалится.

**8. Можно ли admin access через WAN?**
Не рекомендуется. VPN → MGMT VLAN → admin.

**9. Hard switch vs external FortiSwitch?**
Production с сегментацией → external FortiSwitch на FortiLink.

**10. Какой firmware branch для production?**
7.4.x mature/stable. Не beta.

**11. REST API vs CLI для backup?**
Оба OK. Scheduled SCP backup проще для SMB.

**12. Security Rating 100% реалистичен?**
80–90% — хороший production target. 100% часто ломает UX.`,
    },
    {
      title: 'NSE4 exam topics: mapping (Fundamentals)',
      content: `**NSE4_FGT-7.2/7.4** covers FortiGate operation. Mapping к этой главе:

| NSE4 Domain | Topics in this chapter | Weight |
|-------------|------------------------|--------|
| **FortiOS fundamentals** | GUI, CLI, interfaces, routing | ~15% |
| **Network configuration** | VLAN, zones, static routes, DNS, DHCP | ~20% |
| **Security concepts** | Security Fabric, FortiGuard, admin hardening | ~10% |
| **System administration** | Backup, firmware, NTP, FortiCare | ~15% |
| **Troubleshooting** | diagnose commands, flow debug, connectivity | ~10% |

**Exam prep from this chapter:**
1. Lab: deploy VM, configure 3 VLANs, default route
2. CLI: \`get system status\`, \`get router info routing-table all\`
3. Know FG model sizing differences (40F/60F/100F)
4. VDOM concept (when/when not)
5. Security Rating recommendations
6. Certificate types and use cases

**Not in this chapter (other chapters):**
- Firewall policies → Policies chapter
- VPN → VPN chapter
- HA, FortiAnalyzer → Operations chapter

**Practice exams:** training.fortinet.com → NSE4 → Practice questions.`,
    },
    {
      title: 'Interview Q&A: 10 вопросов (Fundamentals)',
      content: `**Q1: Чем FortiGate отличается от обычного router + ACL?**
A: Stateful NGFW + integrated UTM + VPN + FortiLink switching/Wi-Fi in one platform with single policy model.

**Q2: Как выбрать между FG-60F и FG-100F?**
A: By UTM throughput at 70% rule, concurrent sessions, VPN count, SD-WAN needs — not user count alone.

**Q3: Зачем zones если есть VLAN interfaces?**
A: Zones group interfaces for simplified policies — one rule for multiple VLANs, easier WAN failover.

**Q4: Что такое FortiLink?**
A: Proprietary protocol for FortiGate to manage FortiSwitch/FortiAP as Security Fabric members.

**Q5: Как ограничить admin access?**
A: Trusted hosts (MGMT VLAN), 2FA FortiToken, separate admin profiles, no WAN admin.

**Q6: VDOM — когда нужен?**
A: MSP multi-tenant, strict regulatory separation. Not for typical single-office SMB.

**Q7: Factory default risks?**
A: No admin password, HTTPS on all interfaces, no segmentation — immediate hardening required.

**Q8: Как проверить FortiGuard license status?**
A: \`get system fortiguard\` or System → FortiGuard → License Information.

**Q9: Security Fabric root — кто?**
A: FortiGate. Downstream: FortiSwitch, FortiAP, FortiClient EMS, FortiAnalyzer.

**Q10: Первые 3 команды при «нет интернета»?**
A: \`get system interface physical\`, \`execute ping <gateway>\`, \`get router info routing-table all\`.`,
    },
    {
      title: 'Security Rating: hardening по FortiGuard',
      content: `**Security Rating** (Security Fabric → Security Rating) — automated audit с рекомендациями FortiGuard.

**Типовые рекомендации и fixes:**

| Finding | Risk | Fix |
|---------|------|-----|
| Default admin password | Critical | Change password, 16+ chars |
| No 2FA on admin | High | Enable FortiToken |
| Admin access from any IP | High | Trusted hosts = MGMT VLAN |
| HTTP admin enabled | Medium | HTTPS only |
| Outdated firmware | High | Upgrade to 7.4.x stable |
| Weak SSL/TLS versions | Medium | TLS 1.2+ only |
| No explicit deny policy | Medium | Add deny-all with logging |
| FortiGuard not registered | High | Register FortiCare |
| No scheduled updates | Medium | Daily signature update 03:00 |
| Unused policies enabled | Low | Disable/delete stale rules |

**Workflow (monthly):**
1. Security Fabric → Security Rating → Run Scan
2. Export report PDF
3. Prioritize Critical/High fixes
4. Apply fixes in change window
5. Re-scan → target score ≥ 85%

**CLI check:**
\`\`\`
diagnose sys fortiguard-service rating
\`\`\`

**Не слепо apply all:** some recommendations may break legacy apps — test in lab first.`,
    },

    {
      title: 'Лабораторная: первичная настройка с нуля',
      content: `**Цель:** развернуть FortiGate VM (или physical lab FG) с VLAN сегментацией и базовой связностью.

**Предварительно:** скачай FortiGate VM trial с fortinet.com (KVM/VMware/Hyper-V).

**Шаги:**

1. Deploy VM, подключи port1=WAN, port2=LAN (internal)
2. Login GUI, смени admin password
3. Register FortiGuard (trial license)
4. Update firmware to 7.4.x stable
5. Configure wan1: DHCP (или static в lab network)
6. Create VLAN10, VLAN20, VLAN60 subinterfaces on internal
7. Create zones: WAN, LAN-Users, LAN-Guest
8. Add default route 0.0.0.0/0 via wan1 gateway
9. Create minimal policy: LAN-Users → WAN, NAT on (детали в гл. Policies)
10. Configure DHCP on VLAN60-Guest
11. Restrict admin to 192.168.99.0/24 (create VLAN99)
12. Enable 2FA on admin
13. Backup config, document IP plan

**Проверка:**
- Workstation VM в VLAN20 пингует 8.8.8.8
- Guest VM в VLAN60 пингует internet, НЕ пингует VLAN10
- Admin GUI доступен только из VLAN99

**Cleanup:** export config для reference, snapshot VM.`,
    },
  ],
  practice: [
    'Разверни FortiGate VM trial (KVM/VMware/ESXi), зарегистрируй на FortiCare',
    'Создай 5 VLAN subinterfaces: Servers, Workstations, VoIP, Guest, Management',
    'Настрой zones WAN, LAN-Users, LAN-Guest, MGMT — объясни зачем каждая',
    'Смени admin password, включи 2FA FortiToken, ограничь trusted hosts',
    'Сравни datasheet FG-40F vs FG-60F vs FG-100F для офиса 50 человек — таблица',
    'Настрой NTP, DNS, scheduled FortiGuard updates',
    'Сделай encrypted backup конфига, восстанови на чистый FG VM',
    'CLI: get system status, get system interface, diagnose sys session stat',
    'Нарисуй Security Fabric diagram для офиса с FG + Switch + AP + Analyzer',
    'Напиши IP plan документ: VLAN, subnet, gateway, DHCP scope, DNS',
    'Troubleshoot lab: «workstation не пингует internet» с flow debug',
    'Обоснуй выбор FG-60F vs FG-100F для конкретного кейса (500 Mbps + 40 VPN users)',
    'Пройди Security Rating scan, исправь 5 Critical/High findings',
    'REST API: получи system status через curl, сохрани JSON',
    'FortiOS 7.4 lab: deploy на KVM или VMware, snapshot baseline config',
  ],
  resources: [
    { title: 'Fortinet Training Institute (NSE4)', url: 'https://training.fortinet.com/' },
    { title: 'FortiGate 7.4 Administration Guide', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide' },
    { title: 'FortiGate VM trial download', url: 'https://www.fortinet.com/support/product-downloads' },
    { title: 'FortiGate datasheet (sizing)', url: 'https://www.fortinet.com/products/next-generation-firewall' },
    { title: 'FortiOS CLI reference 7.4', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/cli-reference' },
    { title: 'FortiGate REST API Guide', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/940602/using-apis' },
    { title: 'Fortinet Security Rating', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/893656/security-rating' },
    { title: 'FortiGate sizing tool', url: 'https://www.fortinet.com/resources/enterprise-solutions/sizing-tool' },
  ],
}
