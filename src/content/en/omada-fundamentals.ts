import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'TP-Link Omada — обзор экосистемы',
  duration: '12–15 hours',
  description:
    'Omada Controller (Cloud, Software, Docker, OC200), Gateway ER7206/ER8411, adoption, API, multi-site, firmware, топология SMB и выбор платформы',
  sections: [
    {
      title: 'Что такое Omada SDN',
      content: `**TP-Link Omada** — программно-определяемая сеть (SDN) для SMB и mid-market: единый контроллер управляет маршрутизаторами, коммутаторами и точками доступа из одного веб-интерфейса.

**Компоненты экосистемы:**
- **Omada Gateway** — маршрутизация, NAT, firewall, VPN, DHCP, DNS relay
- **Omada Switch** — L2/L3 коммутаторы с PoE, VLAN, STP, LAG
- **Omada EAP** — Wi‑Fi 6/6E/7 access points
- **Omada Controller** — центр управления (Cloud, Software, Hardware OC200/OC300)

**Почему Omada для офиса 20–150 человек:**
- Стоимость владения ниже Cisco Meraki и FortiGate + FortiSwitch + FortiAP
- Единый UI без подписки на базовое управление
- Быстрый старт: adoption за 15–30 минут на типовой офис
- Поддержка VLAN, RADIUS, guest portal, VPN «из коробки»

**Ограничения:**
- Меньше UTM-функций чем FortiGate (нет полноценного IPS/AV на gateway)
- Enterprise features (fabric analytics, advanced SD-WAN) слабее tier-1
- Документация и support иногда отстают от UI новых прошивок
- REST API ограничен по сравнению с UniFi или Meraki Dashboard API`,
    },
    {
      title: 'Omada Gateway: ER7206 и ER8411',
      content: `**ER7206** — типовой gateway для офиса до 80 пользователей:
- 1× Gigabit WAN + 1× SFP WAN (dual WAN)
- 5× Gigabit LAN
- Throughput routing ~900 Mbps (без UTM)
- IPsec/OpenVPN/L2TP VPN
- Встроенный контроллер (ограниченное число устройств — лучше отдельный)

**ER8411** — для офиса 80–200+ пользователей или филиала с высокой нагрузкой:
- 2× 10G SFP+ WAN + 2× 2.5G LAN
- Выше throughput и VPN performance
- Подходит как core router при агрегации нескольких VLAN

**Выбор модели:**

| Критерий | ER7206 | ER8411 |
|----------|--------|--------|
| Пользователи | до 80 | 80–200+ |
| WAN | 1G + SFP | 10G SFP+ |
| VPN users | до 16–20 одновременно | 50+ |
| Цена | ниже | выше |
| NAT throughput | ~900 Mbps | ~2+ Gbps |

**Рекомендация:** ER7206 для типового офиса; ER8411 если есть 10G uplink к провайдеру или site-to-site VPN с высокой нагрузкой.

**ER605 / ER605W** — entry-level для малых офисов до 20 пользователей; без SFP WAN, меньше VPN sessions.`,
    },
    {
      title: 'Коммутаторы Omada: SG3428 и PoE-линейка',
      content: `**SG3428** — 24× Gigabit + 4× SFP, managed L2+, без PoE:
- Core/distribution switch в серверной
- Uplink к gateway через SFP (оптика до 10 км)
- LAG к второму switch для redundancy

**SG3428MP / SG2210MP** — PoE+ модели для раздачи питания AP и IP-телефонов:
- SG2210MP: 8× PoE+ порта, budget **150 W**
- SG3428MP: 24× PoE+, budget **250 W**
- SG3452P: 48× PoE+, budget **384 W** — для warehouse / large office

**Расчёт PoE budget (пример офис 2 этажа):**
- 6× EAP670 @ ~15 W = 90 W
- 12× IP phone @ 7 W = 84 W
- **Итого: 174 W** → одного SG2210MP (150 W) недостаточно; нужен SG3428MP или второй PoE switch

**SG3428 как core:**
\\\`\\\`\\\`
ER7206 (LAN) ──► SG3428 (core)
                    ├── SG2210MP Floor1 (PoE → AP, phones)
                    ├── SG2210MP Floor2
                    └── SFP uplink → серверная (servers VLAN)
\\\`\\\`\\\``,
    },
    {
      title: 'Access Points: EAP650 и EAP670',
      content: `**EAP650** — Wi‑Fi 6 (802.11ax), dual-band:
- 2×2 MU-MIMO на 5 GHz
- Потребление PoE: ~12–13 W
- Покрытие: open office ~80–100 m² на AP (зависит от стен)
- Подходит для переговорок, коридоров, малых open space

**EAP670** — Wi‑Fi 6, 4×4 на 5 GHz:
- Выше плотность клиентов (30–40 на AP vs 20–25 у EAP650)
- PoE: ~15–16 W (нужен PoE+, не af)
- Рекомендуется для open space с 25+ сотрудниками на зону

**EAP773 / EAP783** — Wi‑Fi 7 для greenfield проектов с высокой плотностью.

**Сравнение для планирования:**

| Параметр | EAP650 | EAP670 |
|----------|--------|--------|
| 5 GHz radios | 2×2 | 4×4 |
| Клиенты/AP | ~25 | ~40 |
| PoE | 802.3af (~13 W) | 802.3at (~15 W) |
| Цена | ниже | выше |

**Правило SMB:** один AP на 60–80 m² open space или один на 2–3 переговорки; всегда закладывай ethernet (mesh — только резерв).`,
    },
    {
      title: 'Варианты Omada Controller',
      content: `| Тип | Где работает | Плюсы | Минусы |
|-----|--------------|-------|--------|
| **Omada Cloud** | controller.omada.tplinkcloud.com | Нет сервера, доступ извне, автообновления | Зависимость от интернета и облака TP-Link |
| **Software Controller** | Windows/Linux VM, Docker | Полный контроль, локальный доступ | Нужен сервер, backup, обновления вручную |
| **OC200 / OC300** | Rack appliance | Always-on, не зависит от VM | Доп. железо, лимит устройств OC200 |
| **Built-in на Gateway** | ER7206/ER8411 | Без отдельного сервера | Лимит ~10–20 устройств, не для роста |

**Рекомендации по сценарию:**
- **1 офис, нет серверной:** Omada Cloud
- **Есть VM/mini PC:** Software Controller (Ubuntu 22.04 LTS, 2 vCPU, 4 GB RAM, 20 GB disk)
- **Несколько офисов:** Cloud (multi-site) или Software + VPN к controller
- **Строгие compliance (данные не в облаке):** Software Controller on-prem
- **Docker homelab:** community/official Docker image на Linux host

**Порты Software Controller:** HTTPS **8043** (web UI), **29810–29814** (device adoption/management). Открой их только из Management VLAN.`,
    },
    {
      title: 'Decision tree: OC200 vs Cloud vs Software',
      content: `**Дерево решений — выбор платформы контроллера:**

\\\`\\\`\\\`
Начало
  │
  ├─ Данные конфигурации НЕ могут быть в облаке?
  │     ├─ Да → Есть VM/сервер?
  │     │         ├─ Да → Software Controller (Ubuntu/Windows)
  │     │         └─ Нет → OC200/OC300 (appliance)
  │     └─ Нет → Нужен multi-site без VPN?
  │               ├─ Да → Omada Cloud
  │               └─ Нет → Бюджет на OC200?
  │                         ├─ Да → OC200 (до 100 devices)
  │                         └─ Нет → Omada Cloud (бесплатно)
  │
  └─ Только 1 gateway + 2 AP, нет IT?
        └─ Built-in controller на ER7206 (временно, до 10–20 devices)
\\\`\\\`\\\`

**OC200 vs OC300:**

| Критерий | OC200 | OC300 |
|----------|-------|-------|
| Max devices | ~100 | ~500 |
| Форм-фактор | Desktop | Rack 1U |
| Цена | ниже | выше |
| Backup | USB / controller export | USB + scheduled |
| Когда выбрать | 1–2 офиса, до 80 devices | MSP, campus, 100+ AP |

**Cloud vs Software для MSP:**
- Cloud: проще onboarding клиентов, но зависимость от TP-Link ID
- Software: один controller на клиента в их DMZ — больше контроля, больше ops

**Миграция между типами:** всегда через Backup → Restore (.bin файл). IP controller должен совпасть или потребуется re-adopt.`,
    },
    {
      title: 'Установка Software Controller на Ubuntu',
      content: `**Требования (production):**
- Ubuntu 22.04 LTS или 24.04 LTS
- 2 vCPU, 4 GB RAM (8 GB для 50+ devices)
- 20 GB disk (SSD предпочтительно)
- Static IP в Management VLAN

**Пошаговая установка (.deb):**
1. Скачай последний Omada Software Controller с tp-link.com/support
2. Установи зависимости: \\\`sudo apt update && sudo apt install -y openjdk-17-jre-headless jhead\\\`
3. \\\`sudo dpkg -i Omada_SDN_Controller_v*.deb\\\`
4. При ошибках зависимостей: \\\`sudo apt -f install\\\`
5. \\\`sudo systemctl enable tpeap && sudo systemctl start tpeap\\\`
6. Проверка: \\\`sudo systemctl status tpeap\\\`
7. Web UI: \\\`https://<server-ip>:8043\\\`
8. Мастер: admin password (16+ символов), timezone Europe/Moscow, country

**Firewall (ufw):**
\\\`\\\`\\\`bash
sudo ufw allow from 10.0.99.0/24 to any port 8043 proto tcp
sudo ufw allow from 10.0.99.0/24 to any port 29810:29814 proto tcp
sudo ufw allow from 10.0.99.0/24 to any port 29810:29814 proto udp
\\\`\\\`\\\`

**Post-install:**
1. **Settings → Controller → Controller Hostname/IP** — static IP (не DHCP!)
2. **Settings → Maintenance → Backup** — scheduled weekly
3. **Settings → Site → Device Account** — смени default password

**Логи:** \\\`/opt/tplink/EAPController/logs/\\\` — при проблемах adoption смотри \\\`server.log\\\`.`,
    },
    {
      title: 'Установка Software Controller на Windows',
      content: `**Требования:**
- Windows Server 2019/2022 или Windows 10/11 Pro
- Java JRE 17 (installer часто включает bundled runtime)
- 4 GB RAM, 20 GB disk
- Static IP, исключение из Windows Defender для install path

**Пошаговая установка:**
1. Скачай Windows installer с tp-link.com
2. Запусти от Administrator → выбери путь (D:\\\\Omada, не C:\\\\Program Files для логов)
3. Installer создаёт Windows Service «Omada Controller»
4. Браузер → \\\`https://<server-ip>:8043\\\`
5. Accept self-signed cert (или установи proper cert позже)
6. Мастер: password, timezone, country

**Windows Firewall:**
\\\`\\\`\\\`powershell
New-NetFirewallRule -DisplayName "Omada Web" -Direction Inbound -LocalPort 8043 -Protocol TCP -Action Allow -RemoteAddress 10.0.99.0/24
New-NetFirewallRule -DisplayName "Omada Adoption" -Direction Inbound -LocalPort 29810-29814 -Protocol TCP -Action Allow -RemoteAddress 10.0.99.0/24
\\\`\\\`\\\`

**Service management:**
- services.msc → «Omada Controller» → Automatic (Delayed Start)
- После reboot: подожди 2–3 минуты до готовности UI

**Обновление на Windows:**
1. Backup config
2. Stop service
3. Run new installer (upgrade in place)
4. Start service, verify devices reconnect

**Типичная ошибка:** server на DHCP — после renew IP меняется, все devices offline до restore IP или re-adopt.`,
    },
    {
      title: 'Docker: установка Omada Controller',
      content: `**Когда Docker:** homelab, DevOps-команда, быстрый disposable lab, CI для network automation tests.

**Официальный vs community image:** TP-Link периодически публикует Docker-инструкции; проверяй актуальный tag на support portal. Community image \\\`mbentley/omada-controller\\\` — популярен в homelab (не официальная поддержка TP-Link для prod).

**Пример docker-compose (community pattern):**
\\\`\\\`\\\`yaml
services:
  omada-controller:
    image: mbentley/omada-controller:5.15
    container_name: omada
    network_mode: host
    environment:
      PUID: 508
      PGID: 508
      MANAGE_HTTP_PORT: 8088
      MANAGE_HTTPS_PORT: 8043
      PORT_APP_DISCOVERY: 27001
      PORT_ADOPT_V1: 29812
      PORT_UPGRADE_V1: 29813
      PORT_MANAGER_V1: 29811
      PORT_MANAGER_V2: 29814
      PORT_DISCOVERY: 29810
      SHOW_SERVER_LOGS: "true"
    volumes:
      - omada-data:/opt/tplink/EAPController/data
      - omada-work:/opt/tplink/EAPController/work
      - omada-logs:/opt/tplink/EAPController/logs
volumes:
  omada-data:
  omada-work:
  omada-logs:
\\\`\\\`\\\`

**Важно для Docker:**
- \\\`network_mode: host\\\` — discovery/adoption работает надёжнее чем bridge NAT
- Volumes обязательны — без них потеря config при recreate container
- Backup: копируй volume + export .bin из UI
- Обновление: pull new tag, recreate container, verify version match с device firmware

**Production caveat:** для prod SMB предпочтительнее .deb на bare metal/VM — проще support ticket и predictable reboot behavior.`,
    },
    {
      title: 'Omada Cloud: регистрация и первый Site',
      content: `**Пошаговый workflow Omada Cloud:**
1. Открой https://omada.tplinkcloud.com или https://controller.omada.tplinkcloud.com
2. Создай TP-Link ID (или войди существующим)
3. **Add New Controller** → выбери **Cloud-Based** (не Local)
4. Создай Site: имя, timezone (Europe/Moscow), country
5. Dashboard пустой → переходи к adoption устройств

**Отличия Cloud UI от Software:**
- Нет доступа к файловой системе сервера
- Backup: **Settings → Maintenance → Backup & Restore** → Download
- Обновления controller автоматические (проверяй release notes)
- Привязка к TP-Link ID — потеря доступа к аккаунту = потеря управления

**Миграция Cloud → Software (или обратно):**
1. Export backup из текущего controller
2. Установи новый controller
3. **Maintenance → Restore** → загрузи .bin файл
4. Устройства переподключатся (может потребоваться re-adopt при смене IP controller)

**Безопасность Cloud:**
- Включи 2FA на TP-Link ID
- Ограничь список admin users
- Не используй shared admin account
- Регулярно скачивай offline backup (.bin) — не полагайся только на облако`,
    },
    {
      title: 'Multi-site: управление несколькими площадками',
      content: `**Omada Cloud multi-site (рекомендуется для филиалов):**
1. Один TP-Link ID → несколько Sites в одном Cloud controller
2. **Settings → Site** → Add Site → «Office-Kazan», «Office-Moscow»
3. Переключение site — dropdown в верхнем левом углу UI
4. Каждый site — изолированная config (VLAN, SSID, devices)
5. Gateway в каждом филиале adopted в свой site

**Software Controller multi-site:**
- Один controller instance поддерживает multiple sites
- **Settings → Site → Create New Site**
- Устройство при adoption привязывается к active site
- Перед adoption убедись что выбран правильный site!

**Centralized management без Cloud:**
\\\`\\\`\\\`
HQ Software Controller (10.0.99.10)
    │
    ├── Site: HQ-Moscow (local L2/L3)
    │
    └── Site: Branch-Kazan
            └── IPsec tunnel → devices в Kazan adopted через tunnel
\\\`\\\`\\\`

**L3 adoption для филиала:** DHCP Option 138 указывает на IP controller через VPN tunnel; или локальный OC200 в филиале с периодическим backup на HQ NAS.

**MSP модель:**
- Отдельный Site per customer (naming: CLIENT-001-Office)
- Operator role для NOC, Admin только break-glass
- Scheduled backup per site → encrypted storage

**Ограничения:** нет единого cross-site dashboard analytics как Meraki; Insight per site. API (Open API) — per controller, не federated.`,
    },
    {
      title: 'Omada Open API: обзор автоматизации',
      content: `**Omada Open API** — REST API для Software Controller (v5+). Позволяет автоматизировать inventory, monitoring, bulk config.

**Включение API:**
1. **Settings → Platform Integration → Open API**
2. Create Application → Client ID + Client Secret
3. Grant scopes: read devices, read clients, (write — осторожно)
4. Controller URL: \\\`https://<controller-ip>:8043\\\`

**Аутентификация (OAuth2-style):**
\\\`\\\`\\\`bash
# 1. Login — получить access token
curl -k -X POST "https://10.0.99.10:8043/openapi/v1/login" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"username":"admin","password":"YOUR_PASSWORD"}'

# 2. Authorize application
curl -k -X POST "https://10.0.99.10:8043/openapi/v1/authorize" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"clientId":"YOUR_CLIENT_ID","clientSecret":"YOUR_SECRET"}'

# 3. Получить список устройств (site-id из URL UI)
curl -k "https://10.0.99.10:8043/openapi/v1/sites/SITE_ID/devices" \\\\
  -H "Authorization: AccessToken=YOUR_TOKEN"
\\\`\\\`\\\`

**Типовые use cases:**
- Ежедневный export device inventory в CMDB
- Alerting: webhook при device offline (polling API)
- Bulk firmware check перед maintenance window
- Integration с Ansible/Terraform (community modules)

**Ограничения API:**
- Не все UI actions доступны через API
- Cloud controller API отличается / ограничен
- Rate limits не документированы чётко — не poll чаще 1/min per site
- Write operations опасны без change control

**Безопасность:** API credentials = admin-level; храни в vault, rotate quarterly; не expose 8043 в internet.`,
    },
    {
      title: 'Навигация по UI контроллера',
      content: `**Главные разделы (Software и Cloud идентичны):**

| Меню | Назначение |
|------|------------|
| **Dashboard** | Статус сети, карта устройств, alerts |
| **Devices** | Gateway, Switches, AP — adopt, firmware, config |
| **Clients** | Подключённые клиенты, блокировка, history |
| **Insight** | Traffic, топ клиентов, health |
| **Settings → Wired Networks** | LAN, VLAN, DHCP на gateway |
| **Settings → Wireless Networks** | SSID, security, portal |
| **Settings → Authentication** | RADIUS profiles, portal users |
| **Settings → Transmission** | Firewall, NAT, VPN, routing |
| **Settings → Site** | Site name, device password |
| **Settings → Platform Integration** | Open API, webhooks |
| **Logs** | System, WLAN, operation logs |

**Типовый workflow изменения:**
1. Найди настройку в Settings
2. Внеси изменение → **Save**
3. Проверь **Pending** badge — иногда нужен **Apply** на устройстве
4. **Devices → выбери device → Config → Provisioning** — статус sync

**Pro tip:** перед массовыми изменениями — **Maintenance → Backup**. Controller push config на устройства асинхронно; подожди 1–2 минуты и проверь статус «Connected» на всех devices.

**Global View (Cloud):** переключение между sites; нет unified alerting across sites в одном view — проверяй каждый site.`,
    },
    {
      title: 'Adoption устройств: L2 workflow',
      content: `**L2 adoption** — устройство и controller в одном broadcast domain (один VLAN/L2 сегмент).

**Подготовка:**
1. Gateway подключи WAN к интернету, LAN — в Management VLAN или default LAN
2. Controller доступен по IP из этой же сети
3. Switch/AP подключи к PoE switch в той же сети

**Software Controller — пошагово:**
1. Включи устройство, дождись boot (LED медленно мигает)
2. Controller → **Devices** → вкладка **Pending**
3. Устройство появится с MAC и model → **Adopt**
4. Статус: Adopting → Configuring → **Connected** (2–5 минут)
5. Задай **Device Password** (Settings → Site → Device Account) до adoption — единый пароль для SSH/CLI

**Cloud Controller:**
1. Убедись что устройство может достучаться до \\\`*.tplinkcloud.com\\\` (DNS + HTTPS 443)
2. Тот же workflow: Devices → Pending → Adopt

**Batch adoption:**
- Select All Pending → Adopt — для первоначального rollout
- Порядок: Gateway first → Core switch → Access switches → AP last

**Если устройство не в Pending:**
- Проверь firmware (слишком старый может не поддерживать текущий controller)
- Factory reset: reset 10 сек → снова Pending
- Проверь что нет второго controller в сети (conflict)`,
    },
    {
      title: 'L3 Adoption: DHCP Option 138 и DNS',
      content: `Когда controller в **другой подсети** (типично Management VLAN 99, устройства в VLAN 1 при первом включении), нужен **L3 adoption**.

**Метод 1 — DHCP Option 138 (рекомендуется):**
1. На DHCP server (Windows DC или Omada Gateway) добавь option:
   - **Option 138** = IP адрес Omada Controller
2. Scope для VLAN где новые устройства: включи option 138
3. Устройство при DHCP получит адрес controller → появится в Pending

**Windows DHCP:**
1. DHCP Manager → Scope Options → Configure Options
2. Predefined: **TP-Link Omada Controller** (138) или Custom
3. IP: \\\`192.168.99.10\\\` (пример controller)

**Omada Gateway DHCP Option 138:**
1. Settings → Wired Networks → LAN → Edit network
2. DHCP → Advanced → Custom Options → Option 138 → Controller IP

**Метод 2 — DNS:**
1. Создай DNS A-record: \\\`omada.company.local\\\` → IP controller
2. Некоторые прошивки резолвят omada.tplinkcloud.com locally через DNS override

**Метод 3 — SSH (ручной, для единичных устройств):**
\\\`\\\`\\\`
# На switch/AP через console или pre-adoption IP
set controller ip 192.168.99.10
\\\`\\\`\\\`

**Метод 4 — Inform URL (legacy UniFi-style, редко на Omada):**
- Не применимо напрямую; используй Option 138

**После L3 adoption:** переведи management устройств в VLAN 99 через switch port profile.`,
    },
    {
      title: 'Firmware: политика обновлений',
      content: `**Порядок обновления (критично!):**
1. **Controller** (Software) — первым
2. **Gateway** — вторым
3. **Switches** — по одному, начиная с access layer
4. **AP** — последними (краткий disconnect Wi‑Fi)

**Workflow в UI:**
1. **Settings → Maintenance → Firmware** или **Devices → выбери → Upgrade**
2. Проверь release notes на omadanetworks.com
3. Выбери **Schedule upgrade** → maintenance window (воскресенье 02:00)
4. Для массового: **Devices → Select All Switches → Batch Upgrade**

**Политика SMB:**
- Не обновляй в пятницу
- Держи один откатный образ предыдущей версии controller backup
- Тестируй на одном AP/switch перед массовым rollout
- Документируй версии в таблице inventory
- N-1 policy: держись на stable release, не на bleeding edge day-0

**Pre-upgrade checklist:**
- [ ] Backup controller (.bin)
- [ ] Verify disk space on controller server
- [ ] Notify users (AP reboot = Wi‑Fi blip 2 min)
- [ ] Confirm maintenance window with business
- [ ] One device pilot group (1 AP + 1 switch)

**Откат:** Omada редко поддерживает downgrade на устройствах; для controller — restore backup предыдущей версии.`,
    },
    {
      title: 'Firmware compatibility matrix',
      content: `**Правило совместимости:** версия Controller должна быть **≥** версии firmware на устройствах. Controller first, always.

**Типовая матрица (проверяй release notes — версии меняются):**

| Controller | Gateway ER7206 | Switch SG3428 | AP EAP670 | Примечание |
|------------|----------------|---------------|-----------|------------|
| 5.15.x | 1.3.x | 1.0.x | 1.0.x | Stable combo 2025 |
| 5.14.x | 1.2.x | 1.0.x | 1.0.x | Previous stable |
| 5.13.x | 1.2.x | 0.9.x | 0.9.x | Upgrade path to 5.15 |

**Симптомы несовместимости:**
- Device в Pending но adopt fails instantly
- «Connected» но provisioning eternal spinner
- Missing features в UI (новая функция не видна)
- API endpoints return 404 после controller upgrade без device upgrade

**Проверка версий:**
1. **Settings → Maintenance → Controller Info** — version
2. **Devices → каждое устройство → Info** — firmware
3. Export inventory spreadsheet monthly

**Greenfield deployment:** установи latest stable controller → adopt devices on factory firmware → batch upgrade devices to match.

**Mixed fleet (EAP650 + EAP670 + EAP773):** один controller управляет всеми; но RF features differ by model — не assume feature parity.

**EOL devices:** старые EAP245/EAP225 могут не поддерживать Controller 5.15+ — проверь compatibility list перед purchase of used hardware.`,
    },
    {
      title: 'Типовая топология SMB-офиса (50 человек)',
      content: `**Сценарий:** 2 этажа, 50 рабочих мест, 6 AP, IP-телефония, guest Wi‑Fi, серверная.

\\\`\\\`\\\`
                    Internet (fiber)
                         │
                    [ ER7206 ]
                    WAN1 │ LAN (trunk)
                         │
                  [ SG3428 core ]
                   /    |     \\\\
            SFP/uplink  │      \\\\
                  [SG2210MP]  [SG2210MP]
                   Floor 1     Floor 2
                   AP×3        AP×3
                   Phones×12   Phones×13
                         │
                  [ Servers / DC ]
                  VLAN 10
\\\`\\\`\\\`

**VLAN план:**

| VLAN | Назначение | Subnet | Gateway |
|------|------------|--------|---------|
| 10 | Servers | 10.0.10.0/24 | 10.0.10.1 |
| 20 | Workstations | 10.0.20.0/24 | 10.0.20.1 |
| 30 | VoIP | 10.0.30.0/24 | 10.0.30.1 |
| 50 | Corp Wi‑Fi | 10.0.50.0/24 | 10.0.50.1 |
| 60 | Guest Wi‑Fi | 10.0.60.0/24 | 10.0.60.1 |
| 99 | Management | 10.0.99.0/24 | 10.0.99.1 |

**Controller:** Software на VM в VLAN 99 (\\\`10.0.99.10\\\`).

**IP plan management VLAN:**
| Device | IP |
|--------|-----|
| ER7206 | 10.0.99.1 |
| SG3428 | 10.0.99.2 |
| SG2210MP-F1 | 10.0.99.3 |
| SG2210MP-F2 | 10.0.99.4 |
| Controller | 10.0.99.10 |

**Кабельная дисциплина:** каждый AP — home run в IDF closet; не daisy-chain PoE между AP.`,
    },
    {
      title: 'Case study: кафе 10 пользователей',
      content: `**Профиль:** кофейня 80 m², 10 staff devices, guest Wi‑Fi для посетителей, 1 POS terminal, 2 IP cameras.

**Bill of Materials:**
| Qty | Model | Роль |
|-----|-------|------|
| 1 | ER605 | Gateway, DHCP, firewall |
| 1 | SG2210MP | 8-port PoE switch |
| 2 | EAP650 | Wi‑Fi coverage |
| — | Omada Cloud | Controller (бесплатно) |

**Topology:**
\\\`\\\`\\\`
Internet → ER605 → SG2210MP
                      ├─ EAP650 #1 (dining area)
                      ├─ EAP650 #2 (kitchen/office)
                      ├─ POS (wired VLAN 20)
                      └─ Cameras (VLAN 40)
\\\`\\\`\\\`

**VLAN design (minimal):**
| VLAN | Purpose | Subnet |
|------|---------|--------|
| 20 | Staff/POS | 192.168.20.0/24 |
| 50 | Guest Wi‑Fi | 192.168.50.0/24 |
| 40 | Cameras | 192.168.40.0/24 |
| 99 | Management | 192.168.99.0/24 |

**SSID:**
- \\\`Staff-Cafe\\\` — WPA2-Personal PSK, VLAN 20
- \\\`Guest-Cafe\\\` — Open + Portal voucher, VLAN 50, rate limit 5 Mbps

**Firewall:**
- Deny Guest → RFC1918
- Deny Cameras → Internet (NVR local only)
- Allow Staff → Internet

**Timeline:** half-day install — 2h cabling, 1h adoption, 1h SSID/portal test.

**Budget note:** ~$400–600 total hardware; no controller server cost with Cloud.

**Pitfall:** использование ER605 built-in controller — OK для 4 devices; migrate to Cloud before adding 2nd location.`,
    },
    {
      title: 'Case study: офис 50 пользователей',
      content: `**Профиль:** IT company, 50 employees, 2 floors, hybrid work, VoIP, guest Wi‑Fi, AD + NPS, 1 server room.

**Bill of Materials:**
| Qty | Model | Роль |
|-----|-------|------|
| 1 | ER7206 | Gateway, VPN, firewall |
| 1 | SG3428 | Core switch |
| 2 | SG2210MP | Floor IDF PoE |
| 6 | EAP670 | Wi‑Fi (3 per floor) |
| 1 | VM Ubuntu | Software Controller |

**Key decisions:**
- Software Controller (compliance: config not in cloud)
- WPA3-Enterprise via NPS for Corp Wi‑Fi
- Management VLAN 99 isolated
- OpenVPN for remote workers (16 concurrent max on ER7206)
- Dual WAN: fiber + LTE backup

**VLANs:** 10 Servers, 20 Workstations, 30 VoIP, 50 Corp Wi‑Fi, 60 Guest, 70 Printers, 99 Mgmt

**Day-0 timeline:**
| Day | Tasks |
|-----|-------|
| 1 | Rack mount, cable test, controller install |
| 2 | Gateway + core switch adopt, VLAN create |
| 3 | PoE switches, AP adopt, trunk config |
| 4 | SSID + NPS integration, firewall rules |
| 5 | VPN, guest portal, acceptance testing |

**Acceptance criteria:**
- RSSI > -67 dBm 95% coverage
- Guest cannot ping 10.0.10.0/24
- 802.1X auth < 3 sec
- VPN RDP to workstation works
- Failover WAN < 90 sec

**Ops:** weekly backup, monthly firmware check, quarterly restore drill.`,
    },
    {
      title: 'Case study: склад 100+ пользователей',
      content: `**Профиль:** logistics warehouse 3000 m², 120 handheld scanners, 15 office staff, 20 cameras, Wi‑Fi coverage для picking zones, high ceilings (8m).

**Bill of Materials:**
| Qty | Model | Роль |
|-----|-------|------|
| 1 | ER8411 | Gateway (VPN, high throughput) |
| 2 | SG3428 | Core/distribution (LAG between) |
| 4 | SG3428MP | Zone PoE switches |
| 14 | EAP670 | High-density AP (ceiling mount) |
| 1 | OC300 | Dedicated controller appliance |

**Design challenges:**
- High ceilings → AP mount lower on columns, not ceiling peak
- Metal shelving → RF shadowing; more APs, lower power
- Handheld scanners: 2.4 GHz often; dedicated SSID «Scanner» VLAN 45
- Cameras: multicast/IGMP, separate VLAN 40, no Wi‑Fi

**VLANs (extended):**
| VLAN | Purpose |
|------|---------|
| 40 | CCTV (wired) |
| 45 | Scanner Wi‑Fi |
| 20 | Office workstations |
| 50 | Office Corp Wi‑Fi |
| 60 | Guest (drivers, visitors) |
| 99 | Management |

**RF plan:** AP every 15m in picking aisles; channel plan 5 GHz 36/44/52/60/100/108/116/124; 2.4 GHz 1/6/11 only for scanners.

**Controller:** OC300 (500 device headroom for growth); local on UPS; daily backup to NAS.

**Redundancy:** dual WAN (fiber + LTE), LAG core switches, spare AP on shelf.

**Throughput:** ER8411 handles 120 concurrent scanners @ low bandwidth; bottleneck is RF airtime, not gateway.

**Lesson learned:** warehouse ≠ office AP count formula; plan 2× AP density vs open office; validate with walk test before ceiling lift rental ends.`,
    },
    {
      title: 'Сравнение Omada vs UniFi vs Meraki vs Fortinet',
      content: `| Критерий | Omada | UniFi (Ubiquiti) | Cisco Meraki | FortiGate stack |
|----------|-------|------------------|--------------|-----------------|
| Цена входа | Низкая | Низкая–средняя | Высокая | Средняя/высокая |
| Подписка | Не нужна (база) | Не нужна (база) | **Обязательна** | FortiGuard |
| Единый UI | Да | Да (UniFi Network) | Да (Dashboard) | FortiOS + FortiLink |
| UTM/NGFW | Базовый/нет | UDM Pro — moderate | MX — moderate | **Полноценный** |
| Wi‑Fi density | Хороший (EAP670) | Отличный (U6 Pro) | Отличный | FortiAP |
| API | Open API (ограничен) | UniFi API (широкий) | Meraki API (отличный) | FortiAPI |
| Cloud controller | Бесплатный | UniFi Cloud (optional) | Только cloud | FortiCloud optional |
| Support SLA | Community + vendor | Community + vendor | Enterprise 24/7 | Enterprise 24/7 |
| Multi-site | Cloud sites | UniFi Site Manager | Org-wide dashboard | FortiManager |
| Hardware QC | Стабильный | Стабильный | Premium | Premium |
| Supply chain | Широкий | Широкий | Через Cisco partners | Через partners |

**Когда выбрать Omada:**
- Бюджет ограничен, нужна «нормальная» сеть без SOC
- Офис без строгих compliance (PCI-DSS level 1, HIPAA)
- Команда без dedicated network engineer
- Не хотите vendor lock-in subscription

**Когда UniFi вместо Omada:**
- Уже есть UniFi ecosystem
- Нужен wider community, больше how-to контента
- UDM Pro как all-in-one gateway+controller+Wi‑Fi

**Когда Meraki:**
- Budget for 5-year TCO includes licensing
- Need 24/7 TAC, auto VPN mesh, compliance audits
- MSP with Meraki dashboard expertise

**Когда Fortinet:**
- NGFW, IPS, sandboxing, SD-WAN mandatory
- Existing Fortinet security team
- Government/regulated industry

**Гибрид (не рекомендуется без причины):** Omada switching + Wi‑Fi, FortiGate edge — возможно, но два UI и сложнее troubleshooting.`,
    },
    {
      title: 'Лицензии, лимиты и Device Account',
      content: `**Omada без подписки** для:
- Controller management (Software/Cloud) — unlimited devices on Software
- VLAN, firewall basics, VPN, RADIUS, guest portal
- Firmware updates
- Basic Insight analytics

**Платные опции (проверяй актуальный pricing):**
- Некоторые advanced features могут требовать license в enterprise line
- Hardware warranty/support packages — optional

**Лимиты железа (approximate, verify datasheet):**

| Platform | Max managed devices | Notes |
|----------|---------------------|-------|
| ER7206 built-in | 10–20 | Not for production scale |
| OC200 | ~100 | RAM limited |
| OC300 | ~500 | Rack appliance |
| Software Controller | 1000+ | Depends on VM resources |
| Omada Cloud | 1000+ | Per account practical limits |
| ER7206 OpenVPN | ~16 concurrent | Upgrade ER8411 for more |
| ER8411 OpenVPN | ~50+ concurrent | |
| ER7206 IPsec tunnels | ~20 | |

**Software Controller sizing:**

| Devices | vCPU | RAM | Disk |
|---------|------|-----|------|
| < 50 | 2 | 4 GB | 20 GB |
| 50–150 | 4 | 8 GB | 40 GB |
| 150–500 | 4–8 | 16 GB | 80 GB |

**Device Account (Settings → Site):**
- Единый username/password для adopted devices
- SSH, local fallback access
- **Смени default до adoption!**

**RBAC (Settings → User & Role):**
- **Admin** — полный доступ
- **Operator** — read-only + alerts
- **User** — ограниченный (guest manager)

**Аудит:** Logs → Operation Log — кто менял конфигурацию.`,
    },
    {
      title: 'Полный список портов Omada Controller',
      content: `**Software Controller — порты для firewall rules:**

| Порт | Протокол | Направление | Назначение |
|------|----------|-------------|------------|
| 8043 | TCP | Inbound | Web UI HTTPS (management) |
| 8088 | TCP | Inbound | HTTP redirect (optional, disable in prod) |
| 29810 | UDP | Inbound | Device discovery |
| 29811 | TCP | Inbound | Device management v1 |
| 29812 | TCP | Inbound | Device adoption v1 |
| 29813 | TCP | Inbound | Device upgrade v1 |
| 29814 | TCP | Inbound | Device management v2 |
| 27001 | UDP | Inbound | App discovery (mobile app) |
| 8843 | TCP | Inbound | Guest portal HTTPS (if local portal) |
| 8080 | TCP | Inbound | Guest portal HTTP redirect |

**Outbound от controller:**
| Destination | Порт | Назначение |
|-------------|------|------------|
| \\*.tplinkcloud.com | 443 TCP | Firmware download, cloud sync |
| NTP servers | 123 UDP | Time sync |
| DNS | 53 UDP/TCP | Name resolution |

**Outbound от устройств (switch/AP/gateway) к controller:**
- TCP 29811, 29812, 29813, 29814
- UDP 29810

**Cloud Controller — устройства additionally need:**
| Destination | Порт | Назначение |
|-------------|------|------------|
| \\*.tplinkcloud.com | 443 TCP | Cloud management |
| n-ws-*.tplinkcloud.com | 443 TCP | WebSocket tunnel |
| firmware servers | 443 TCP | OTA firmware |

**Security rules template:**
\\\`\\\`\\\`
# Allow ONLY from Management VLAN 99 to Controller
ALLOW 10.0.99.0/24 → Controller:8043,29810-29814
DENY   ANY → Controller:8043
ALLOW  Controller → WAN:443 (firmware)
\\\`\\\`\\\`

**VPN admin access:** allow 8043 from VPN pool 10.0.200.0/24 only, not full internet.`,
    },
    {
      title: 'Backup, restore и disaster recovery',
      content: `**Что бэкапить:**
1. Full controller settings (.bin)
2. Скриншот/экспорт таблицы VLAN и IP
3. Документация WAN IP, VPN PSK, RADIUS secret (в password vault)
4. Device inventory: MAC, serial, location, firmware
5. Port mapping spreadsheet

**Software Controller — scheduled backup:**
1. **Settings → Maintenance → Backup & Restore**
2. **Auto Backup** → Enable → Weekly → путь на NAS/SMB share
3. Храни 4 последних копии + 1 offsite encrypted

**Restore на новый сервер:**
1. Установи ту же или новее версию controller
2. **Restore** → upload .bin
3. Выдай новому серверу **тот же IP** что был у старого
4. Устройства переподключатся в 5–15 минут

**Сценарий «controller умер»:**
| Scenario | RTO | Procedure |
|----------|-----|-----------|
| Software VM crash | 1–2h | New VM, restore .bin, same IP |
| Cloud account lost | 4–24h | TP-Link support + proof of ownership |
| OC200 hardware fail | 2–4h | New OC200, restore backup |
| Ransomware on controller | 4h | Clean install, offline backup restore |

**RPO/RTO для SMB:** RPO 24h (daily backup), RTO 4h — acceptable.

**Disaster recovery test (quarterly):**
1. Spin up lab VM
2. Restore last production backup
3. Verify config loads, VLANs present
4. Do NOT connect to production devices from lab
5. Document time to restore`,
    },
    {
      title: 'Безопасность controller и management plane',
      content: `**Management VLAN 99 — обязательно:**
- Controller, switch management IP, AP management — только VLAN 99
- Firewall rule: разрешить 8043, 29810–29814 **только** из VLAN 99 и VPN admin
- Запретить management access с Guest и Corp user VLAN

**Hardening checklist:**
1. Admin password 16+ символов, unique, password manager
2. 2FA на TP-Link ID (Cloud)
3. Отключи неиспользуемых users и API applications
4. HTTPS only, не открывай 8043 в internet напрямую
5. VPN для удалённого admin access к controller
6. Регулярный review Logs → Failed login
7. Separate break-glass admin account (not daily use)
8. Controller OS patching (Ubuntu/Windows updates monthly)

**SSH на устройства:**
- По умолчанию выключен или ограничен
- Key-based auth если включён, только из VLAN 99

**Physical security:** OC200/сервер controller в locked rack; UPS minimum 15 min.

**Network segmentation:** даже если attacker в Corp VLAN — не должно быть path к 8043.`,
    },
    {
      title: 'Security audit checklist',
      content: `**Quarterly security audit — Omada fundamentals layer:**

**Identity & Access:**
- [ ] Admin accounts: unique per person, no shared
- [ ] Operator roles assigned correctly (least privilege)
- [ ] Device Account password rotated in last 90 days
- [ ] TP-Link ID has 2FA enabled (Cloud)
- [ ] Open API credentials inventoried and rotated
- [ ] Former employee accounts removed

**Network isolation:**
- [ ] Management VLAN 99 has no route from Guest/Corp user VLANs
- [ ] Controller ports 8043/29810-29814 blocked from user VLANs
- [ ] Guest VLAN cannot reach RFC1918 (verified by ping test)
- [ ] VPN access limited to required subnets/ports

**Controller hardening:**
- [ ] Controller on static IP, not DHCP
- [ ] Auto backup enabled and last backup < 7 days
- [ ] Controller OS patched (if Software)
- [ ] No HTTP 8088 exposed externally
- [ ] Self-signed cert replaced or accepted via internal CA policy

**Device security:**
- [ ] All devices on supported firmware (N-1 max)
- [ ] No devices in Pending/Failed state
- [ ] Default passwords changed pre-adoption
- [ ] Unused switch ports disabled or set to default deny profile

**Documentation:**
- [ ] VLAN/IP table current
- [ ] Firewall matrix documented
- [ ] VPN users list matches HR active employees
- [ ] Recovery runbook tested this quarter

**Findings template:** Critical / High / Medium / Low with owner and due date.`,
    },
    {
      title: 'Lab walkthrough: Software Controller за 15 шагов',
      content: `**Цель lab:** развернуть Omada Software Controller, создать Site, подготовить adoption, симулировать VLAN plan — без production hardware (или с 1 lab AP/switch).

**Шаг 1.** Подготовь VM: Ubuntu 22.04, 2 vCPU, 4 GB RAM, 20 GB disk, network в lab VLAN или NAT для internet.

**Шаг 2.** Назначь static IP: \\\`192.168.1.100/24\\\` (lab) — \\\`sudo nano /etc/netplan/00-installer-config.yaml\\\` → apply.

**Шаг 3.** Скачай Omada Software Controller .deb с tp-link.com → scp на VM.

**Шаг 4.** Установи: \\\`sudo apt install -y openjdk-17-jre-headless && sudo dpkg -i Omada*.deb && sudo apt -f install\\\`.

**Шаг 5.** Запусти: \\\`sudo systemctl enable tpeap && sudo systemctl start tpeap\\\` — жди 2 min.

**Шаг 6.** Открой \\\`https://192.168.1.100:8043\\\` — прими cert warning, создай admin password (16+ chars).

**Шаг 7.** **Settings → Site** → Create Site «Lab-Office» → timezone Europe/Moscow.

**Шаг 8.** **Settings → Site → Device Account** → set username \\\`admin\\\` + strong password (для future device SSH).

**Шаг 9.** **Settings → Wired Networks** → Create VLAN 20 «LAB-USERS» \\\`192.168.20.1/24\\\` + DHCP pool .100–.200.

**Шаг 10.** **Settings → Wired Networks** → Create VLAN 99 «MGMT» \\\`192.168.99.1/24\\\` — DHCP off.

**Шаг 11.** **Settings → Maintenance → Backup** → Enable auto backup → local path.

**Шаг 12.** **Settings → User & Role** → Create Operator «monitor» read-only.

**Шаг 13.** (Optional hardware) Подключи lab EAP/switch → **Devices → Pending → Adopt**.

**Шаг 14.** **Settings → Controller → Controller Hostname/IP** → verify \\\`192.168.1.100\\\`.

**Шаг 15.** Export backup .bin → document lab state → snapshot VM (VirtualBox/VMware) для rollback.

**Windows variant (шаги 4–5 заменить):** run installer → service auto-start → same UI steps 6–15.

**Validation:** UI loads, Site created, VLAN visible in Wired Networks, backup file exists on disk, Operator cannot edit firewall.`,
    },
    {
      title: 'FAQ: 10 частых вопросов',
      content: `**1. Нужна ли лицензия для Omada Cloud?**
Нет, базовое управление бесплатно. Проверяй optional paid features на сайте TP-Link.

**2. Можно ли управлять Omada без internet?**
Да, Software Controller on-prem работает offline. Cloud и firmware download требуют internet.

**3. Сколько устройств тянет OC200?**
Около 100 adopted devices (зависит от прошивки и mix gateway/switch/AP).

**4. Что если забыл пароль admin controller?**
Software: reinstall + restore backup, или reset через CLI (см. TP-Link KB). Cloud: reset через TP-Link ID recovery.

**5. Можно ли mix Omada с non-Omada switches?**
Да для L2 (generic managed switch), но без central management. VLAN trunk must match manually.

**6. ER7206 built-in controller vs Software — что выбрать?**
Built-in только для ≤10 devices demo/small office. Software/Cloud для любого роста.

**7. Нужен ли статический IP для controller?**
Да, обязательно. DHCP на controller = disaster при lease renewal.

**8. Как мигрировать с UniFi на Omada?**
Parallel deployment recommended: new Omada network, migrate VLAN by VLAN; не in-place swap.

**9. Поддерживает ли Omada IPv6?**
Partial — gateway DHCPv6 и some features; verify firmware release notes for your use case.

**10. Где хранятся логи controller?**
Software Linux: \\\`/opt/tplink/EAPController/logs/\\\`. UI: Logs menu. Syslog forward настрой в Settings.`,
    },
    {
      title: 'Troubleshooting encyclopedia',
      content: `| # | Симптом | Вероятная причина | Решение |
|---|---------|-------------------|---------|
| 1 | Устройство не в Pending | Другая подсеть без option 138 | DHCP option 138 или временно L2 |
| 2 | Adopt зависает «Adopting» | Firewall блокирует 29810–29814 | Открой порты controller |
| 3 | Adoption failed | Firmware incompatible | Update controller first, factory reset device |
| 4 | Connected но config не apply | Provisioning stuck | Retry Provisioning, reboot device |
| 5 | Два controller в сети | Старый OC200 активен | Выключи лишний, reset devices |
| 6 | AP adopted, switch нет | PoE/cable/VLAN | Cable test, PoE budget, data VLAN |
| 7 | Cloud device offline | Нет tplinkcloud.com | DNS, HTTPS 443 outbound |
| 8 | После restore offline | Сменился IP controller | Restore same IP |
| 9 | UI 8043 timeout | Service stopped / firewall | systemctl status tpeap, ufw rules |
| 10 | Java heap OOM controller | Undersized VM | Increase RAM to 8 GB |
| 11 | Backup restore fails | Version mismatch | Install matching or newer controller |
| 12 | Device shows wrong site | Wrong site selected at adopt | Forget device, switch site, re-adopt |
| 13 | Gateway WAN no internet | PPPoE/VLAN tag wrong | Verify ISP settings, MAC clone |
| 14 | High CPU on controller | Too many devices / logs | Increase resources, enable log rotation |
| 15 | Certificate warning always | Self-signed default | Import internal CA cert or accept policy |
| 16 | API 401 Unauthorized | Token expired | Re-authenticate, check clock sync NTP |
| 17 | DHCP option 138 ignored | Wrong scope / not applied | Verify scope, renew DHCP lease on device |
| 18 | Multi-site wrong config pushed | Editing wrong site | Confirm site dropdown before changes |
| 19 | Docker controller no discovery | Bridge NAT mode | Use host network mode |
| 20 | OC200 USB backup fails | USB format / permissions | FAT32 stick, reformat |

**Эскалация TP-Link:** собери controller version, device MAC, firmware, export Logs, network diagram.`,
    },
    {
      title: 'Interview questions: Omada fundamentals',
      content: `**8 вопросов для собеседования (network engineer / sysadmin):**

**1.** Объясни разницу между L2 и L3 adoption в Omada. Когда нужен DHCP Option 138?

**2.** Почему controller обновляют раньше gateway и AP? Что happens при version mismatch?

**3.** Сравни Omada Cloud vs Software Controller для офиса 80 человек с compliance requirement «no cloud config».

**4.** Какие порты нужно открыть между Management VLAN и Software Controller? Почему нельзя expose 8043 в internet?

**5.** ER7206 vs ER8411 — criteria выбора для office с 16 remote VPN users и 10G WAN?

**6.** Опиши disaster recovery plan когда Software Controller VM died в пятницу 17:00. RTO 4 hours.

**7.** Что такое Device Account и почему его меняют до adoption?

**8.** Как бы ты спроектировал multi-site setup для 3 филиалов: один Cloud account или три Software controllers? Trade-offs.

**Expected strong answers:** mention Option 138, controller-first firmware, management VLAN isolation, backup restore same IP, PoE budget calculation, no subscription TCO advantage vs Meraki.`,
    },
    {
      title: 'Первый запуск: полный checklist',
      content: `**День 0 — планирование:**
- [ ] Таблица VLAN и IP
- [ ] Схема кабелей и patch panel
- [ ] Список устройств с MAC для inventory
- [ ] Выбор controller (Cloud/Software/OC200)
- [ ] Firewall port list documented
- [ ] Controller VM/server provisioned

**День 1 — развёртывание:**
1. [ ] Установи/зарегистрируй Controller
2. [ ] Создай Site, timezone, device password
3. [ ] Adopt Gateway → настрой WAN (DHCP/static/PPPoE)
4. [ ] Создай Wired Networks (VLAN) на gateway
5. [ ] Adopt core switch → trunk, management IP VLAN 99
6. [ ] Adopt PoE switches → port profiles
7. [ ] Adopt AP → проверь PoE power
8. [ ] Создай SSID (минимум Corp + Guest)
9. [ ] Firewall: deny Guest → RFC1918
10. [ ] Backup config
11. [ ] Создай admin + operator accounts
12. [ ] Документируй в Confluence/Notion

**День 2 — валидация:**
- [ ] Ping gateway из каждого VLAN
- [ ] Wi‑Fi connect Corp и Guest
- [ ] Speedtest с workstation
- [ ] DHCP pool utilization check
- [ ] VPN test (if applicable)
- [ ] Security audit quick pass
- [ ] Handoff documentation to ops team`,
    },
  ],
  practice: [
    'Установи Omada Software Controller в VM (Ubuntu 22.04, 2 vCPU, 4 GB RAM) и открой UI на порту 8043',
    'Разверни Omada Controller в Docker (docker-compose) с host network и persistent volumes',
    'Зарегистрируй Omada Cloud Site и сравни UI с Software Controller — таблица отличий (минимум 10 пунктов)',
    'Настрой DHCP Option 138 на Windows DHCP или Omada Gateway для L3 adoption',
    'Adopt минимум одно lab-устройство (switch/AP) и задокументируй timeline adoption',
    'Составь firmware compatibility matrix для 5 устройств и политику обновления N-1',
    'Сделай backup controller, удали Site в lab и восстанови из backup на новом IP (then fix IP)',
    'Нарисуй топологию офиса 50 человек: ER7206 + SG3428 + 2× SG2210MP + 6× EAP670',
    'Рассчитай PoE budget: 6× EAP670 + 20 phones на SG3428MP — хватает ли 250 W?',
    'Создай admin и operator accounts; проверь что operator не может менять firewall',
    'Напиши runbook «Controller down» с RTO 4 часа для Software deployment',
    'Сравни TCO Omada vs Meraki vs UniFi для офиса 40 человек на 3 года',
    'Построй decision tree OC200 vs Cloud vs Software для 3 сценариев (cafe, office, warehouse)',
    'Включи Omada Open API, получи token, выгрузи device list через curl',
    'Проведи security audit checklist и задокументируй 3 finding с remediation',
  ],
  resources: [
    { title: 'Omada Software Controller Download', url: 'https://www.tp-link.com/us/support/download/omada-software-controller/' },
    { title: 'Omada Documentation Portal', url: 'https://support.omadanetworks.com/' },
    { title: 'Omada Cloud Controller', url: 'https://omada.tplinkcloud.com/' },
    { title: 'ER7206 Datasheet', url: 'https://www.tp-link.com/us/business-networking/omada-router/er7206/' },
    { title: 'Omada Open API Guide', url: 'https://support.omadanetworks.com/us/document/108000/' },
    { title: 'Omada FAQ — Adoption', url: 'https://support.omadanetworks.com/us/document/108000/' },
  ],
  quiz: [
    {
      question: 'Omada is an SDN platform from:',
      options: ['TP-Link', 'Cisco', 'Fortinet'],
      answer: 'TP-Link',
    },
    {
      question: 'Omada Controller options:',
      options: ['Cloud, Software, Hardware OC200', 'Cloud only', 'CLI only'],
      answer: 'Cloud, Software, Hardware OC200',
    },
    {
      question: 'Adoption in Omada is:',
      options: ['Connecting the device to the controller', 'Removing a VLAN', 'AP Formatting'],
      answer: 'Connecting the device to the controller',
    },
    {
      question: 'Firmware update procedure:',
      options: ['Controller → switches → AP', 'AP → controller', 'Random'],
      answer: 'Controller → switches → AP',
    },
    {
      question: 'Omada Gateway in the topology costs:',
      options: ['Between Internet and LAN', 'Wi‑Fi only', 'Behind every PC'],
      answer: 'Between Internet and LAN',
    },
    {
      question: 'Backup controller config is needed:',
      options: ['Regularly, before changes', 'Never', 'Only when changing ISP'],
      answer: 'Regularly, before changes',
    },
  ],
}

export default translation
