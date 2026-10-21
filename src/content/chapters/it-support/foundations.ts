import type { Chapter } from '../../../types'

export const itSupportFoundationsChapter: Chapter = {
  id: 'it-support-foundations',
  slug: 'it-support-foundations',
  title: 'IT Support — основы и уровни',
  moduleId: 'it-support',
  order: 0,
  duration: '10–12 часов',
  level: 'beginner',
  description:
    'L1/L2/L3 support, ITIL basics, soft skills, инструменты и карьерный путь от helpdesk к sysadmin/DevOps',
  sections: [
    {
      title: 'Роль IT Support в организации',
      content: `**IT Support** — первая линия контакта между бизнесом и технологиями. От качества поддержки зависит, работает ли компания или стоит сотрудники ждут «когда починят».

**Зона ответственности:**
- Рабочие станции и ноутбуки (Windows, macOS)
- Корпоративные приложения (Office 365, Teams, VPN)
- Учётные записи и доступ (AD, Azure AD)
- Периферия: принтеры, гарнитуры, док-станции
- Эскалация сетевых и серверных инцидентов

**Чего НЕ делает L1 без эскалации:**
- Менять firewall policies
- Перезагружать Domain Controller
- Вносить изменения в production без change request

> Хороший IT Support — не тот, кто знает всё, а тот, кто **быстро решает или правильно эскалирует** с полным контекстом.`,
    },
    {
      title: 'Уровни поддержки: L1, L2, L3, L4',
      content: `| Уровень | Название | Ответственность | Типичные задачи | Время на тикет |
|---------|----------|-----------------|-----------------|----------------|
| **L1** | Helpdesk / Service Desk | Приём, классификация, базовые fix, KB | Сброс пароля, нет звука, принтер offline | 5–20 мин |
| **L2** | Desktop / Systems Support | Сложные ПК, GPO, софт, AD | Outlook OST, VPN profile, Intune compliance | 30–120 мин |
| **L3** | Infrastructure / Network | Серверы, сеть, firewall, DC | VLAN, FortiGate, DHCP scope, RADIUS | Часы–дни |
| **L4** | Vendor / Escalation | Вендор, RMA, warranty | Сломанный switch, firmware bug | По SLA вендора |

**Цель L1:** решить **70%** обращений за **15 минут** или эскалировать с полным пакетом информации.

**Матрица эскалации (пример):**
| Симптом | L1 действие | Куда эскалировать |
|---------|-------------|-------------------|
| Один user — нет интернета | ipconfig, ping, VPN | L2 если не помогло за 20 мин |
| Весь офис без сети | P1 ticket, notify lead | L3 немедленно |
| Подозрение на вирус | Изолировать ПК | L2 + Security |
| Запрос нового ноутбука | Service Request | L2 / Procurement |

**L1 не «закрывает глаза»:** если видишь повторяющуюся проблему у 5 пользователей — это уже не L1, а сигнал для Problem ticket.`,
    },
    {
      title: 'ITIL essentials: практичное применение',
      content: `**ITIL** (Information Technology Infrastructure Library) — набор best practices для IT-сервисов. Полная сертификация не обязательна для старта, но **термины используются везде**.

**Ключевые понятия:**

| Термин | Определение | Пример в офисе |
|--------|-------------|----------------|
| **Incident** | Нарушение нормальной работы сервиса | Outlook не открывается, нет интернета |
| **Service Request** | Запрос стандартной услуги | Новый ноутбук, доступ к папке, установка софта |
| **Problem** | Root cause повторяющихся инцидентов | «Каждый понедельник VPN падает» |
| **Change** | Плановое изменение инфраструктуры | Миграция на Windows 11, смена firewall |
| **CMDB** | База конфигураций (assets) | Snipe-IT: серийники, владельцы, локации |
| **SLA** | Соглашение об уровне сервиса | P1: ответ 15 мин, решение 4 ч |
| **OLA** | Внутреннее соглашение между командами | L1→L3: эскалация в течение 30 мин |

**Incident vs Service Request — как отличить:**
- **Incident:** «У меня сломалось» → восстановить сервис как можно быстрее
- **Service Request:** «Мне нужно» → выполнить по стандартному процессу (может занять дни)

**Problem Management:**
1. Зафиксируй recurring incidents (3+ за месяц)
2. Создай Problem ticket, назначь owner
3. Root cause analysis (5 Whys, fishbone)
4. Known Error + workaround в KB
5. Change для permanent fix

**Change Management (упрощённо для SMB):**
- Standard Change — предодобренный (сброс пароля, deploy printer)
- Normal Change — нужен approval (обновление GPO, firewall rule)
- Emergency Change — P1 fix, post-implementation review обязателен`,
    },
    {
      title: 'ITSM-системы: Jira Service Management и Zendesk',
      content: `**ITSM** (IT Service Management) — платформа для тикетов, SLA, KB и отчётности.

**Jira Service Management (JSM):**
- Интеграция с Jira Software (DevOps видит тикеты)
- Automation rules: auto-assign, SLA timers, escalation
- Assets (CMDB) — платное расширение
- Portal для пользователей: portal.company.com
- Хорош для: tech-компаний, команд с Jira ecosystem

**Zendesk:**
- Простой UI, быстрый старт
- Omnichannel: email, chat, phone
- Macros и triggers для автоматизации
- Help Center (KB) из коробки
- Хорош для: SMB, non-tech industries

**Сравнение для офиса 50 человек:**

| Критерий | Jira SM | Zendesk |
|----------|---------|---------|
| Сложность внедрения | Средняя | Низкая |
| Цена (50 agents) | $$ | $$ |
| KB | Confluence / встроенный | Встроенный Help Center |
| SLA tracking | Отличный | Хороший |
| Интеграция AD/SSO | SAML, SCIM | SAML, SCIM |

**Альтернативы:** Freshservice, ServiceNow (enterprise), osTicket (open-source, self-hosted).

**Минимальная настройка любой ITSM:**
1. Категории и приоритеты
2. SLA policies по приоритетам
3. Queues: L1, L2, L3
4. Email-to-ticket: support@company.com
5. 10 canned responses для топ-запросов
6. KB с 20 статьями до go-live`,
    },
    {
      title: 'Soft skills: коммуникация с пользователями',
      content: `Технические навыки решают 50% задач. **Soft skills** — остальные 50% и главный фактор CSAT.

**Золотые правила:**
1. **Не говори** «это не моя проблема» — всегда «я передам нужному специалисту»
2. **Объясняй простым языком** — не «пересоздам OST», а «починю локальную копию почты»
3. **Подтверждай понимание:** «Правильно ли я понял, что с 9:00 Outlook показывает ошибку подключения?»
4. **Давай ETA:** «Вернусь с решением в течение 30 минут»
5. **Закрывай петлю:** «Проверьте, пожалуйста, работает ли сейчас»

**Скрипт: angry user**
> «Понимаю, что ситуация мешает работе. Давайте сосредоточимся на решении — я сейчас проверю [X] и через [N] минут сообщу статус.»

**Скрипт: «вы всё сломали после обновления»**
> «Спасибо, что сообщили. Обновление могло затронуть [компонент]. Проверю настройки и при необходимости откачу изменение. Ваш тикет в приоритете.»

**Скрипт: пользователь не на связи**
> Email/SMS: «Мы выполнили [действие]. Пожалуйста, перезагрузите ПК и подтвердите, что проблема решена. Тикет закроется автоматически через 48 ч без ответа.»

**Активное слушание:**
- Не перебивай
- Записывай: ОС, версия приложения, время начала, что менялось
- Переспрашивай неясное: «Вы подключены по кабелю или Wi‑Fi?»

**Документирование в тикете:**
- Что сообщил пользователь (дословно ключевое)
- Что проверил (чеклист)
- Что сделал (команды, изменения)
- Результат и next steps`,
    },
    {
      title: 'Работа под стрессом и приоритизация',
      content: `**Пиковые нагрузки:** понедельник утро, после праздников, день payroll, релиз продукта.

**Матрица приоритизации (Impact × Urgency):**

| | Низкая срочность | Высокая срочность |
|---|------------------|-------------------|
| **Высокий impact** | P2 — планировать | P1 — немедленно |
| **Низкий impact** | P4 — в очереди | P3 — сегодня |

**Примеры impact:**
- Весь офис без интернета → High
- CEO не может отправить письмо → High
- Один стажёр без принтера → Low
- 3 из 50 не могут в VPN → Medium

**При P1 инциденте:**
1. Создай P1 ticket (не чат в Telegram!)
2. Notify: team lead, L3 on-call
3. Status page / email staff каждые 30 мин
4. War room: один координатор, остальные не дублируют работу
5. Post-incident review в течение 48 ч

**Burnout prevention для L1:**
- Перерывы каждые 2 часа
- Ротация «тяжёлых» тикетов
- Эскалация без стыда — это профессионализм
- Личный KB заметок для частых fix`,
    },
    {
      title: 'Инструменты IT Support: полный стек',
      content: `| Категория | Инструменты | Назначение |
|-----------|-------------|------------|
| **Ticketing** | Jira SM, Zendesk, Freshservice | Тикеты, SLA, KB |
| **Remote access** | TeamViewer, AnyDesk, RDP, MeshCentral | Удалённая помощь |
| **MDM / UEM** | Microsoft Intune, Jamf (macOS) | Управление устройствами |
| **Password vault** | Bitwarden, 1Password Business | Корпоративные секреты |
| **Monitoring** | PRTG, Uptime Kuma, Zabbix | Доступность сервисов |
| **Documentation** | Confluence, Notion, BookStack | Runbooks, KB |
| **Asset management** | Snipe-IT, Lansweeper | Инвентаризация |
| **Communication** | Teams, Slack | Внутренний чат, алерты |
| **Identity** | Azure AD, AD, Okta | Учётки, SSO, MFA |

**Remote support — best practices:**
- Запрашивай разрешение перед подключением
- Показывай курсор, объясняй действия
- Не оставляй сессию открытой
- Логируй remote sessions в тикете

**Snipe-IT — минимальные поля asset:**
- Asset tag, Serial, Model
- Assigned user, Location
- Purchase date, Warranty end
- Status: Deployed / In stock / Retired`,
    },
    {
      title: 'Классификация обращений: практические примеры',
      content: `**10 сценариев — Incident или Service Request?**

| # | Обращение | Тип | Приоритет |
|---|-----------|-----|-----------|
| 1 | «Не могу войти в Windows» | Incident | P2 |
| 2 | «Нужен доступ к папке Finance» | Service Request | P3 |
| 3 | «Компьютер очень медленный» | Incident | P3 |
| 4 | «Заказать монитор 27"» | Service Request | P4 |
| 5 | «Весь этаж без интернета» | Incident | P1 |
| 6 | «Установить Adobe Acrobat» | Service Request | P4 |
| 7 | «Подозрительное письмо с ссылкой» | Incident (Security) | P2 |
| 8 | «Забыл пароль от VPN» | Incident | P3 |
| 9 | «Новый сотрудник с понедельника» | Service Request | P3 |
| 10 | «Outlook зависает при открытии» | Incident | P3 |

**Теги и категории (рекомендуемый набор):**
- Hardware, Software, Network, Email, Printing
- Access & Identity, Security, Mobile, New Hire, Offboarding

**Auto-routing rules:**
- Category = Network → Queue Infrastructure
- Category = Security → Queue Security + notify SOC
- Keyword «password» → L1 queue, SLA standard`,
    },
    {
      title: 'Knowledge Base: структура и deflection',
      content: `**KB (Knowledge Base)** снижает нагрузку на L1 на 20–40% при хорошем поиске.

**Структура статьи:**
1. **Title** — как пользователь ищет: «Как подключиться к VPN»
2. **Symptoms** — что видит пользователь
3. **Solution** — пошагово, со скриншотами
4. **Prerequisites** — VPN client установлен, учётка активна
5. **Related articles** — ссылки
6. **Last updated** — дата и автор

**Обязательные KB для корпоративного офиса:**
- Подключение к VPN (FortiClient)
- Подключение к Wi‑Fi Corp
- Сброс пароля (self-service SSPR)
- Настройка принтера
- Teams — нет звука/видео
- OneDrive — синхронизация
- Как создать тикет в portal
- Политика BYOD

**Deflection workflow:**
1. User открывает portal
2. Поиск по KB перед созданием тикета
3. «Эта статья помогла?» — Yes → не создаём тикет
4. No → pre-fill ticket с категорией

**Метрики KB:**
- Views, Helpful %, Deflection rate
- Статьи с низким Helpful % — переписать`,
    },
    {
      title: 'Метрики и KPI поддержки',
      content: `| Метрика | Формула / смысл | Цель (SMB) |
|---------|-----------------|------------|
| **First Response Time (FRT)** | Время до первого ответа | P1: 15 мин, P3: 4 ч |
| **MTTR** | Mean Time To Resolve | Зависит от категории |
| **CSAT** | Оценка 1–5 после закрытия | > 4.2 |
| **First Contact Resolution (FCR)** | Решено с первого контакта | > 65% для L1 |
| **Ticket volume** | Тикетов/месяц на 100 users | Тренд вниз = KB работает |
| **Reopen rate** | % повторно открытых | < 8% |
| **SLA compliance** | % в рамках SLA | > 95% |

**Еженедельный review (30 мин):**
1. Top 5 категорий по объёму
2. SLA breaches — почему?
3. Reopened tickets — quality issue?
4. Новые KB статьи из повторяющихся тикетов
5. Training gap для L1

**Dashboard для менеджера:**
- Open tickets by priority (pie)
- SLA at risk (list)
- FRT trend (line, 4 weeks)
- CSAT trend`,
    },
    {
      title: 'Безопасность в IT Support',
      content: `L1 — частая **цель social engineering**. Знай политики и не обходи их.

**Верификация личности при сбросе пароля:**
- Звонок на мобильный из AD (не тот, что в тикете!)
- Личная встреча + badge
- Подтверждение менеджера по email из known address
- **Никогда** по одному письму «я CEO, срочно сбрось пароль»

**Запрещено:**
- Сообщать пароли в plain text email
- Отключать MFA «чтобы было удобнее»
- Давать admin права «на время»
- Подключаться к ПК без записи в тикете

**Security incidents — немедленно:**
- Ransomware, подозрительная активность
- Утеря ноутбука с корпоративными данными
- Фишинг с вводом credentials
→ Ticket P2 + Security team + изоляция устройства

**Clean desk policy:** не оставляй записанные пароли на столах при remote support визитах.`,
    },
    {
      title: 'Onboarding в роль L1: первые 30 дней',
      content: `**Неделя 1:**
- Доступы: ITSM, KB, remote tool, AD read-only
- Shadowing опытного L1 (5+ звонков)
- Изучи топ-20 KB статей
- Схема сети офиса (1 страница)

**Неделя 2:**
- Самостоятельные тикеты P3/P4 под наставником
- Сброс паролей, printer issues, software install
- Заполни cheat sheet: IP gateway, DNS, VPN portal

**Неделя 3–4:**
- P2 тикеты с review
- Первый on-call shadow (если есть)
- Напиши 2 KB статьи из своего опыта

**Чеклист «готов к смене один»:**
- [ ] Знаю SLA и приоритеты
- [ ] Умею создать/эскалировать тикет
- [ ] Знаю 5 playbooks наизусть
- [ ] Есть контакты L2/L3 и провайдера
- [ ] Прочитал security policy`,
    },
    {
      title: 'Карьерный путь: от Helpdesk к Sysadmin и DevOps',
      content: `**Типичная траектория (2–5 лет):**

\`\`\`
Helpdesk L1 (6–12 мес)
    → Desktop Support L2 (12–18 мес)
        → Sysadmin / Network (18–36 мес)
            → DevOps / Cloud Engineer
\`\`\`

**Что учить параллельно с L1:**
| Навык | Ресурс | Зачем |
|-------|--------|-------|
| Active Directory | Модуль Sysadmin | Учётки, GPO |
| Networking | Модуль Office Network | VLAN, DHCP, Wi‑Fi |
| PowerShell | fundamentals | Автоматизация |
| Linux CLI | fundamentals/linux | Серверы, cloud |
| Azure / AWS basics | cloud module | Будущий DevOps |

**Сертификации (опционально, по пути):**
- CompTIA A+ — hardware baseline
- CompTIA Network+ — сеть
- Microsoft AZ-900 — cloud awareness
- ITIL Foundation — для менеджмента

**Как выделиться:**
- Автоматизируй повторяющиеся задачи (PowerShell, Jira automation)
- Веди личный runbook
- Бери Problem tickets, не только Incident
- Участвуй в проектах: миграция Win11, новый офис`,
    },
    {
      title: 'Гибридная работа и поддержка удалённых сотрудников',
      content: `**Вызовы remote/hybrid:**
- Нет физического доступа к ПК
- Home network variability
- VPN dependency
- Time zones

**Стандартный remote toolkit:**
- Intune для wipe/reinstall
- Autopilot для новых устройств
- VPN (FortiClient) + MFA
- TeamViewer/Quick Assist для edge cases
- Self-service portal для паролей (SSPR)

**Shipping hardware:**
- Заранее Autopilot-enrolled laptop
- Инструкция «распакуй и включи»
- Track delivery в тикете
- 30-min onboarding call в день 1

**Home office checklist для user:**
- [ ] Ethernet предпочтительнее Wi‑Fi для VPN
- [ ] Роутер не в гостевом режиме
- [ ] Отдельная сеть для IoT (опционально)
- [ ] Гарнитура с шумоподавлением`,
    },
    {
      title: 'Взаимодействие с другими отделами',
      content: `| Отдел | Типичные запросы | Твоя роль |
|-------|------------------|-----------|
| **HR** | Joiner/Leaver, onboarding | Выполнить checklist по дате |
| **Finance** | Строгий доступ, compliance | Эскалация на L2/security |
| **Legal** | eDiscovery, hold mailbox | По процедуре, не самовольно |
| **Facilities** | Переезд, новые розетки | Координация с сетью |
| **Procurement** | Закупка ноутбуков | Specs, asset registration |

**Joiner/Leaver SLA:**
- Joiner: за 3 рабочих дня до выхода — AD, laptop, badge
- Leaver: в день увольнения до 18:00 — disable AD, wipe device

**Коммуникация с HR:**
- Единый ticketing channel
- Не обсуждай причины увольнения
- Confirm identity для leaver actions`,
    },
    {
      title: 'Типичные ошибки новичков L1',
      content: `| Ошибка | Почему плохо | Как правильно |
|--------|--------------|---------------|
| Закрыть тикет без подтверждения | Reopen, недовольство | Спросить user или auto-close policy |
| Не записать что делал | Невозможно эскалировать | Чеклист в тикете |
| Чинить 2 часа вместо эскалации | SLA breach, burnout | 20-min rule → escalate |
| Копипаст canned response не читая | Нерелевантный ответ | Персонализировать |
| Давать local admin «чтобы поставил софт» | Security hole | Software request process |
| Игнорировать «мелочи» | Problem растёт | Логировать паттерны |

**Правило 20 минут:** если не продвинулся за 20 минут — собери факты и эскалируй. Это не поражение, это SLA discipline.`,
    },
    {
      title: 'Чеклист готовности IT Support к новому офису',
      content: `**До открытия:**
- [ ] ITSM portal и email-to-ticket
- [ ] KB: VPN, Wi‑Fi, printer, ticket creation
- [ ] Asset tags и Snipe-IT
- [ ] On-call rotation L1/L2/L3
- [ ] SLA согласован с бизнесом
- [ ] Контакты провайдера, вендора сети

**День 1:**
- [ ] Walk-in support desk (если есть)
- [ ] Broadcast: как создать тикет
- [ ] Мониторинг: интернет, Wi‑Fi, DC

**Первая неделя:**
- [ ] Daily standup 15 мин по открытым P1/P2
- [ ] Сбор feedback для KB
- [ ] Retro: что пошло не так`,
    },
    {
      title: 'ITIL 4: Service Value System и 34 practices',
      content: `**ITIL 4 Service Value System (SVS)** — операционная модель, связывающая demand (спрос бизнеса) с value (рабочие сервисы).

**Компоненты SVS:**
| Компонент | Описание |
|-----------|----------|
| **Guiding Principles** | 7 принципов: focus on value, start where you are, progress iteratively, collaborate, think holistically, keep it simple, optimize and automate |
| **Governance** | Кто принимает решения, RACI для IT-инвестиций |
| **Service Value Chain** | 6 активностей: Plan → Improve → Engage → Design & Transition → Obtain/Build → Deliver & Support |
| **Practices** | 34 management practices (не «процессы» — гибкий набор) |
| **Continual Improvement** | PDCA, CSI register |

**34 practices — топ-15 для IT Support:**

| Practice | Что делает L1/L2 | Артефакт |
|----------|------------------|----------|
| Incident Management | Восстановить сервис | Ticket, timeline |
| Service Request Management | Стандартные услуги | Service catalog |
| Problem Management | Root cause recurring | Problem record, Known Error |
| Change Enablement | Контроль изменений | Change request |
| Service Desk | Single point of contact | Queues, SLA |
| Knowledge Management | KB, deflection | Confluence articles |
| Monitoring & Event Management | Алерты → tickets | PRTG, auto-ticket |
| Service Level Management | SLA, OLA, UC | SLA document |
| Information Security Management | Политики, verify identity | Security policy |
| Workforce & Talent | Training L1 | Skills matrix |
| Measurement & Reporting | KPI dashboard | Weekly review |
| Relationship Management | Stakeholder comms | Monthly report |
| Portfolio Management | Приоритет проектов | Roadmap |
| Risk Management | Оценка рисков change | Risk register |
| Continual Improvement | Retro, action items | CSI register |

**Service Value Chain — пример «новый сотрудник»:**
1. **Engage** — HR запрос joiner
2. **Plan** — capacity: есть laptop в stock?
3. **Design & Transition** — Autopilot profile, checklist
4. **Obtain/Build** — закупка если нет stock
5. **Deliver & Support** — ship, day-1 call, close ticket
6. **Improve** — retro: 2/10 joiners задержались → fix procurement SLA

**ITIL 4 vs ITIL v3:** v3 = processes; v4 = practices + value streams + гибкость под DevOps/Agile. Сертификация Foundation достаточна для L1/L2 terminology alignment.`,
    },
    {
      title: 'ITSM comparison: Jira vs Zendesk vs Freshservice vs ServiceNow',
      content: `| Tool | Segment | SLA | Price 50 agents | Best for |
|------|---------|-----|-----------------|----------|
| Jira SM | Tech mid | ★★★★★ | $15-25k/y | Atlassian shops |
| Zendesk | SMB | ★★★★ | $12-20k/y | Fast start |
| Freshservice | SMB | ★★★★ | $10-18k/y | ITIL lite |
| ServiceNow | Enterprise | ★★★★★ | $100k+ | 500+ users |
| osTicket | Self-host | ★★ | Free | Budget |`,
    },
    {
      title: 'Карьера и зарплаты RU/EU 2025-2026',
      content: `**Карьерные треки и компенсация (orientir 2025–2026, gross):**

**Россия (Москва / удалёнка в RU компанию):**
| Роль | Опыт | Зарплата ₽/мес | Сертификации |
|------|------|----------------|--------------|
| L1 Helpdesk | 0–1 г | 60 000–120 000 | ITF, A+ in progress |
| L2 Desktop | 1–3 г | 100 000–180 000 | A+, AZ-900 |
| Sysadmin Windows | 2–5 г | 150 000–280 000 | AZ-104, Server |
| Network Engineer | 3–6 г | 180 000–350 000 | Network+, N10-008 |
| DevOps Junior | 3–5 г | 200 000–400 000 | AZ-400, CKA, Terraform |

**EU (Germany, Netherlands, remote contract B2B):**
| Role | Зарплата €/год | Notes |
|------|----------------|-------|
| L1 / Service Desk | 28 000–38 000 | Often shift work |
| L2 Support | 38 000–50 000 | English B2+ |
| Sysadmin | 45 000–65 000 | Hybrid common |
| Network | 50 000–75 000 | CCNA valued |
| DevOps Junior | 55 000–80 000 | K8s + CI/CD |

**Как расти из RU в EU remote:**
1. English B2+ (технический)
2. Portfolio: homelab, GitHub scripts, anonymized runbooks
3. Certifications: A+ → Network+ → AZ-104 or CCNA
4. LinkedIn + EU job boards (WeWorkRemotely, Otta)
5. B2B через Estonia/Cyprus entity или employer of record

**Skills matrix L1 → DevOps (18 месяцев):**
| Месяц | Фокус | Milestone |
|-------|-------|-----------|
| 1–3 | L1 excellence, ITSM, KB | FCR >65%, 20 KB articles read |
| 4–6 | AD, GPO, PowerShell | Automate 3 repetitive tasks |
| 7–9 | Networking VLAN DHCP | Pass Network+ |
| 10–12 | Linux CLI, bash | Homelab Proxmox |
| 13–15 | Azure/AWS basics | AZ-900 + EC2 lab |
| 16–18 | Docker, CI/CD intro | Deploy app via GitHub Actions |`,
    },
    {
      title: 'Remote support tools',
      content: `Quick Assist default Win; TeamViewer Mac; Intune Remote Help E5; RDP servers only; MeshCentral self-host. Policy: consent, log session ID, no unsupervised access.`,
    },
    {
      title: 'Shift handover template',
      content: `**Шаблон передачи смены IT Support**

\`\`\`
═══════════════════════════════════════
  HANDOVER — {{DATE}} — {{SHIFT}} {{TIME}}
  Outgoing: {{AGENT_OUT}} → Incoming: {{AGENT_IN}}
═══════════════════════════════════════

▸ OPEN P1/P2 (активные)
  #{{ID}} P1 — {{SUMMARY}} — {{OWNER}} — next update {{TIME}}
  #{{ID}} P2 — {{SUMMARY}} — waiting L3 FG logs

▸ SLA AT RISK (< 2h to breach)
  #{{ID}} P3 printer floor 3 — parts ETA tomorrow

▸ PENDING USER (>24h) — chase today
  #{{ID}} — sent VPN instructions Mon 14:00

▸ KNOWN PROBLEMS / WORKAROUNDS
  PRB-042 Outlook disconnect hourly — KB-117 workaround

▸ PLANNED CHANGES (next 24h)
  CHG-089 cert renewal 02:00–03:00 MSK — monitor AM tickets

▸ ON-CALL L3: {{NAME}} {{PHONE}}

▸ NOTES
  ISP maintenance Wed 03:00–05:00 — prep comms if tickets spike
\`\`\`

**Правила:** overlap 15 min call при активном P1; pin в Teams #it-handover; incoming agent acknowledges in thread.`,
    },
    {
      title: 'Лабораторная (16 шагов)',
      content: `**Цель:** пройти полный operational workflow от симптома до postmortem и улучшения процесса.

**Подготовка (30 мин):** ITSM trial / lab VM / Excel dashboard template / доступ read-only к FortiGate или Omada (optional).

| # | Шаг | Детали | Done |
|---|-----|--------|------|
| 1 | Подготовить среду | Portal, 3 queues, email-to-ticket | ☐ |
| 2 | SLA policies | P1 15m/4h, P3 4h/24h, pause Pending | ☐ |
| 3 | KB deflection | 5 статей: VPN, пароль, Wi‑Fi, Outlook, принтер | ☐ |
| 4 | Создать Incident | «Нет интернета», category Network, P3 | ☐ |
| 5 | Заполнить контекст | Asset tag, floor, scope 1 user, screenshot | ☐ |
| 6 | L1 диагностика | ipconfig, ping GW, ping 8.8.8.8, nslookup | ☐ |
| 7 | Документировать | Каждая команда + output в ticket comment | ☐ |
| 8 | Эскалация | 10-field form L1→L3 если не решено 20 min | ☐ |
| 9 | L2/L3 fix | Root cause: DNS или DHCP — apply fix | ☐ |
| 10 | Resolve | Resolution notes + link KB | ☐ |
| 11 | CSAT | Mock survey 1–5 + comment | ☐ |
| 12 | Service Request | «Монитор 27"» — manager approval flow | ☐ |
| 13 | Problem ticket | Link 3 похожих VPN incidents | ☐ |
| 14 | P1 simulation | Tabletop «весь офис offline» + war room roles | ☐ |
| 15 | Comms draft | 3 emails: T+0, T+30, Resolved | ☐ |
| 16 | Dashboard | FRT, MTTR, SLA%, reopen rate — 4 charts Excel | ☐ |
| 17 | Postmortem | Blameless 1 page, 3 action items | ☐ |
| 18 | Automation | Rule: category Network → L3 queue | ☐ |
| 19 | Retro | 2 improvements в CSI register | ☐ |
| 20 | Peer review | Коллега проверяет ticket quality checklist | ☐ |

**Критерии успеха:** ticket audit score ≥90%; postmortem action items assigned; dashboard reflects mock data.`,
    },
    {
      title: 'FAQ — 12 частых вопросов',
      content: `| # | Вопрос | Ответ |
|---|--------|--------|
| 1 | Incident vs Service Request? | Incident = сломалось, восстановить ASAP. Request = стандартная услуга по каталогу. |
| 2 | Когда эскалировать? | Нет прогресса 20 мин; затронута инфраструктура; нужны права L2/L3; security event. |
| 3 | Можно сбросить пароль по email? | Нет без multi-factor identity verification по policy. |
| 4 | CEO требует P1 для принтера? | Объяснить impact matrix; оформить корректный приоритет P3/P4. |
| 5 | Нужен ли тикет на 2-мин fix? | Да — audit trail, метрики, KB input. |
| 6 | Angry user on phone? | Empathy + ETA + focus on fix; escalate threats to lead. |
| 7 | Что такое FCR? | First Contact Resolution — решено с первого контакта без reopen/escalate. |
| 8 | Problem ticket когда? | 3+ similar incidents/month или unknown root cause after L3. |
| 9 | Отключить MFA временно? | Нет без documented Security exception. |
| 10 | Что в resolution notes? | Symptom, checks, actions, result, KB link, versions. |
| 11 | 10 open tickets — порядок? | P1/P2 → SLA at risk → FIFO within priority. |
| 12 | KB vs playbook? | KB = user-facing deflection; playbook = internal agent runbook with escalation. |`,
    },
    {
      title: 'Матрица troubleshooting (24 строки)',
      content: `| # | Симптом | L1 checks (15 min) | Вероятная причина | Действие | Эскалация |
|---|---------|-------------------|-------------------|----------|-----------|
| 1 | Нет интернета 1 user | Scope wired/Wi‑Fi | DHCP/DNS/local | ipconfig /renew, flushdns | L3 if subnet |
| 2 | Нет интернета all | WAN LED, mobile test | ISP/FW outage | P1 ticket, notify L3 | Immediate |
| 3 | VPN не подключается | Creds, MFA, version | Profile/cert | Reinstall FortiClient | L2 FG logs |
| 4 | Outlook disconnect | OWA works? | OST corrupt/cert | Safe mode, recreate OST | L2 Exchange |
| 5 | Teams нет звука | Device settings | UDP blocked/driver | Clear cache, test call | L2 network |
| 6 | Медленный ПК | Task Manager disk/RAM | Full disk, leak | Cleanup, reboot | L2 hardware |
| 7 | Не входит Windows | Network, caps lock | Profile/AD lock | Unlock, reset pass | L2 profile |
| 8 | Принтер offline | Ping IP | Spooler/GPO | Restart spooler | L2 print server |
| 9 | OneDrive не sync | Account quota | Token stale | Reset OneDrive | L2 SharePoint |
| 10 | BitLocker boot | Verify identity | TPM change | Recovery key Intune | L2 recurring |
| 11 | Wi‑Fi не подключается | SSID, forget network | 802.1X/RADIUS | Re-auth AD creds | L3 NPS |
| 12 | APIPA 169.254.x.x | DHCP scope | Exhausted/wrong | Renew, check lease | L3 DHCP |
| 13 | Domain join fail | nslookup SRV | Wrong DNS 8.8.8.8 | Point to DC DNS | L3 AD |
| 14 | Phishing click | — | Compromised | Isolate, reset pass | Security P2 |
| 15 | BSOD | Stop code photo | Driver/disk | Safe mode, minidump | L2 |
| 16 | MFA loop | Phone time sync | New device | Re-register MFA | L2 TAP |
| 17 | Guest Wi‑Fi captive | Portal load | FG policy | Check VLAN60 | L3 |
| 18 | IP phone no dial tone | VLAN 30 check | DHCP opt 150 | Voice VLAN trunk | L3 |
| 19 | GPO not applied | gpresult /r | Wrong OU/link | gpupdate /force | L2 |
| 20 | Intune non-compliant | Company Portal sync | BitLocker/OS ver | Remediate policies | L2 |
| 21 | After Windows Update | KB number | Bad patch | Uninstall KB | Problem if mass |
| 22 | RDP fail internal | VPN first? | NLA/firewall | Check GPO RDP | L2 |
| 23 | Share access denied | Group membership | ACL/owner | Add AD group | Data owner |
| 24 | Laptop stolen | — | Data breach | Intune wipe, reset pass | Security P1 |`,
    },
    {
      title: 'Case study 1: Лавина Outlook тикетов',
      content: `**Контекст:** Финтех офис 80 FTE, понедельник 09:00, 47 тикетов «Outlook certificate error».

**Timeline:**
- 09:05 — L1 замечает pattern в queue filter
- 09:10 — Senior L1 создаёт master ticket, links duplicates
- 09:12 — Priority P2 (OWA web работает — workaround exists)
- 09:20 — L3: expired cert on legacy Exchange load balancer
- 09:35 — Emergency change approved verbally
- 09:50 — Cert renewed, clients reconnect after Outlook restart
- 10:15 — All-staff resolved email

**Метрики:** MTTR 70 min; 47 tickets → 1 master + 46 linked; CSAT dipped to 3.8 that week.

**Action items:** Cert expiry monitoring PRTG 30d alert; auto-renew Let's Encrypt where applicable; KB «Outlook cert error» updated.`,
    },
    {
      title: 'Case study 2: BEC «CEO password»',
      content: `**Контекст:** 22:15 email «от CEO»: «Срочно сбрось пароль, конфколл через 10 мин».

**Действия:**
- L1 on-call не сбросил пароль
- Позвонил CEO на mobile из AD — CEO не отправлял
- Создал P2 Security, заблокировал sender domain
- Security: BEC attempt, blocked IP, training scheduled

**Уроки:** After-hours не ослабляет verification; single-channel email insufficient; report to Security within 15 min.`,
    },
    {
      title: 'Case study 3: 50 remote Autopilot',
      content: `**Контекст:** EdTech наняла 50 remote teachers за 1 неделю, все Autopilot.

**Подход:**
- Pre-staged profiles by department in Intune groups
- Snipe-IT serial import → Autopilot group tag
- Shipping partner + tracking in Service Request tickets
- Day-1 batch Teams onboarding 10 users per slot

**Results:** 48/50 zero-touch; 2 needed manual ESP (TPM firmware update).
**KB video** «Распакуй и включи» снизил inbound calls на 60%.`,
    },
    {
      title: 'CompTIA A+ / Network+ mapping',
      content: `| CompTIA objective | Domain | Где в главе | Exam |
|-------------------|--------|-------------|------|
| Hardware troubleshooting | A+ Core 1 2.x | Laptop lifecycle, diagnostics | 220-1101 |
| Mobile devices | A+ Core 1 3.x | Intune, Autopilot | 220-1101 |
| Virtualization/cloud | A+ Core 1 4.x | Azure AD, M365 | 220-1101 |
| OS troubleshooting | A+ Core 2 1.x | Windows 11, BSOD | 220-1102 |
| Security | A+ Core 2 2.x | MFA, BitLocker, phishing | 220-1102 |
| Software troubleshooting | A+ Core 2 3.x | Outlook, Teams | 220-1102 |
| Operational procedures | A+ Core 2 4.x | ITIL, SLA, documentation | 220-1102 |
| Networking concepts | Network+ 1.x | VLAN, subnet, DNS | N10-008 |
| Network implementation | Network+ 2.x | DHCP, Wi‑Fi, switching | N10-008 |
| Network operations | Network+ 3.x | Monitoring, backups | N10-008 |
| Network security | Network+ 4.x | Firewall, 802.1X, segmentation | N10-008 |
| Network troubleshooting | Network+ 5.x | ipconfig, ping, traceroute | N10-008 |

**Study path:** A+ both cores → Network+ → AZ-900 → role-specific (AZ-104 / CCNA).`,
    },
    {
      title: '10 вопросов на собеседовании',
      content: `| # | Вопрос | Сильный ответ включает |
|---|--------|------------------------|
| 1 | Incident lifecycle? | New→Open→In Progress→Pending→Resolved→Closed; SLA pause |
| 2 | Как определите P1? | Impact × urgency; примеры: all office down vs one printer |
| 3 | Пример эскалации? | Ticket #, scope, steps, logs, suspect, test contact |
| 4 | Password reset verify? | Phone AD, badge, manager — never email alone |
| 5 | Problem Management? | Recurring incidents, root cause, Known Error, Change |
| 6 | Снизить ticket volume? | KB deflection, automation, self-service, training |
| 7 | FRT vs MTTR? | First response vs mean time to resolved |
| 8 | Remote support ethics? | Consent, log session, no unattended access |
| 9 | Документирование? | Every step in ticket; asset, versions, screenshots |
| 10 | Career 2 years? | Concrete skills: AD, PowerShell, Network+, project |`,
    },
    {
      title: 'Шаблоны: email, эскалация, KB',
      content: `**1. Email — решение**
\`\`\`
Тема: [{{TICKET}}] Решено — {{SUBJECT}}
Здравствуйте, {{NAME}}!
Выполнено: {{SUMMARY}}.
Действие: {{USER_ACTION}}.
Подтвердите ответом на письмо. CSAT: {{URL}}
IT Support | {{COMPANY}}
\`\`\`

**2. Email — нужна информация**
\`\`\`
Тема: [{{TICKET}}] Уточните, пожалуйста
{{QUESTIONS}}
Скриншот ошибки ускорит решение.
\`\`\`

**3. Escalation form L1→L3**
Ticket | Priority | Scope | Start | Impact | L1 steps | Suspect | Logs | Test user | Deadline

**4. KB article skeleton**
# Title | Symptoms | Prerequisites | Steps 1-n | Still broken? → ticket cat X | Related | Owner | Updated`,
    },
    {
      title: 'Дополнительные best practices и checklist',
      content: `**Ежемесячный review checklist:**
- [ ] Обновить KB и playbooks по итогам тикетов
- [ ] Проверить SLA compliance и CSAT trend
- [ ] Review открытых Problem tickets
- [ ] Аудит DHCP/DNS/VLAN конфигурации
- [ ] Firmware security patches network gear
- [ ] Backup конфигов firewall/switch
- [ ] Тест failover WAN / DHCP / RADIUS
- [ ] Training gap analysis для L1
- [ ] Обновить asset inventory
- [ ] Retro major incidents если были

**Документирование:** каждое изменение — ticket + change record + config backup + diagram update.

**Коммуникация:** пользователи ценят ETA больше скорости — always set expectations.

**Безопасность:** least privilege, segment networks, verify identity, log actions.

**Непрерывное обучение:** 2h/неделю lab + сертификация milestone quarterly.`,
    },
    {
      title: 'Справочник терминов A–Я',
      content: `**Глоссарий IT Support и Office Network (A–Я):**

| Термин | Определение |
|--------|-------------|
| **802.1Q** | VLAN tagging standard |
| **802.1X** | Port/network access control via RADIUS |
| **APIPA** | 169.254.x.x auto IP = DHCP failure |
| **Autopilot** | Zero-touch Windows deploy via Intune |
| **BitLocker** | Full disk encryption |
| **BPDU Guard** | STP protection on access ports |
| **CMDB** | Configuration management database |
| **CSAT** | Customer satisfaction score 1–5 |
| **DHCP** | Dynamic IP assignment |
| **DNSSEC** | DNS response validation |
| **Entra ID** | Microsoft identity (Azure AD) |
| **ESP** | Enrollment Status Page |
| **FCR** | First contact resolution |
| **FRT** | First response time |
| **GPO** | Group Policy Object |
| **IDF/MDF** | Intermediate/main distribution frame |
| **Intune** | Microsoft UEM/MDM |
| **ITIL** | IT service management framework |
| **ITSM** | IT service management platform |
| **KB** | Knowledge base |
| **LAG** | Link aggregation group |
| **MFA** | Multi-factor authentication |
| **MTTR** | Mean time to resolve |
| **NPS** | Network Policy Server (RADIUS) |
| **OLA** | Operational level agreement |
| **PoE** | Power over Ethernet |
| **RADIUS** | Remote authentication dial-in |
| **SLA** | Service level agreement |
| **SSPR** | Self-service password reset |
| **STP** | Spanning Tree Protocol |
| **SVI** | Switched virtual interface |
| **UPS** | Uninterruptible power supply |
| **VLAN** | Virtual LAN broadcast domain |
| **VoIP** | Voice over IP |`,
    },
    {
      title: 'ITIL 4: детальный разбор Value Chain',
      content: `**Plan:** capacity, budget, risk for joiners/projects.
**Improve:** retro P1, CSI register, KB updates.
**Engage:** HR/Finance as customers, SLA review quarterly.
**Design & Transition:** Autopilot rollout, new office VLAN design.
**Obtain/Build:** procurement laptops, license true-up.
**Deliver & Support:** L1 daily tickets, on-call P1.

Each activity consumes inputs (demand, constraints) and produces outputs (services, value).`,
    },
    {
      title: 'Remote support: детальная политика',
      content: `| Tool | When | Audit |
|------|------|-------|
| Quick Assist | Default Win10/11 | Log ticket # + duration |
| TeamViewer | Mac/cross-platform | Session ID in ticket |
| Intune Remote Help | E3/E5 tenant | Auto-audit in Intune |
| RDP | Servers only L2+ | Jump host, no direct internet RDP |

**Prohibited:** unsupervised access; copying files without approval; leaving session open overnight.`,
    },
    {
      title: 'Extended reference — deep dive',
      content: `**ITIL 4 practices — extended reference (part 2)**

| Practice | Trigger | Key metric | Tool |
|----------|---------|------------|------|
| Incident Management | Service down | MTTR, SLA% | ITSM |
| Service Request | User needs standard item | Fulfillment time | Catalog |
| Problem Management | Recurring incidents | Problems closed/month | ITSM+KB |
| Change Enablement | Any prod change | Change success rate | ITSM+ CAB |
| Service Desk | All contacts | CSAT, FCR | Portal |
| Knowledge Management | Repeat questions | Deflection rate | Confluence |
| Service Level Management | Monthly | SLA compliance | Reports |
| Information Security | Policy violation | Security incidents | SIEM |
| Workforce Management | Hiring/training | Skills coverage | HRIS |
| Continual Improvement | Retro | Action items done | CSI register |

**Incident prioritization workshop (facilitator guide):**
1. Gather 10 real tickets from last month
2. Team scores impact 1–5 and urgency 1–5 independently
3. Compare scores — discuss outliers >2 points
4. Document agreed matrix in Confluence
5. Revisit quarterly when org changes

**Soft skills drill — active listening (15 min roleplay):**
- Agent repeats back symptom before troubleshooting
- User confirms or corrects
- Agent asks one clarifying question at a time
- Debrief: did user feel heard? (yes/no + why)

**Asset management deep dive (Snipe-IT):**
- Status workflow: Deployable → Deployed → In repair → Retired
- Custom fields: cost center, warranty, encryption status
- Checkout/checkin ties asset to user ticket
- Quarterly audit: physical walk vs database

**Security awareness for L1:**
- Never share passwords in chat/email
- Verify C-level requests via second channel
- Report USB found in parking lot to Security
- Suspected malware: isolate network first, questions later

**Metrics dashboard — Excel formulas (mock):**
- FRT avg: =AVERAGE(FRT_column)
- SLA%: =COUNTIF(SLA_met,"Yes")/COUNTA(SLA_met)
- Trend: week-over-week delta conditional formatting red/green

**Onboarding L1 week-by-week expanded:**
Week 1 shadow 10 calls; Week 2 solo P4 with review; Week 3 P3; Week 4 P2 shadow; Week 5 on-call shadow; Week 6 sign-off checklist with lead.

**Vendor management L4:**
When to open vendor case: hardware RMA, firmware bug, ISP outage confirmation. Always include serial, firmware version, config snippet (sanitized), timeline.

**Disaster scenarios tabletop (30 min):**
- Ransomware on file server
- Fire in server room
- Key person unavailable during P1
Assign: who declares P1, who comms, who technical lead

**Hybrid work policy highlights:**
- Corp device only for corp data
- Home network: recommend separate IoT SSID
- Lost device: report within 1h
- International travel: notify Security for geo MFA

**Communication templates — status update during P1:**
«Мы продолжаем работу над инцидентом {{ID}}. Текущий статус: {{status}}. Затронуто: {{scope}}. Следующее обновление: {{time}}. Workaround: {{if any}}.»

**KB article quality rubric (score 0–5 each):**
Accuracy, clarity, screenshots, searchable title, updated date. Score <15 → rewrite.

**Career portfolio artifacts:**
- Redacted postmortem PDF
- PowerShell script automating ticket categorization
- Homelab network diagram PNG
- LinkedIn recommendations from L2 lead

**RU/EU job search checklist:**
LinkedIn EN profile, GitHub pinned repos, HH.ru + habr.career, EU: Otta, WeWorkRemotely, B2B contract readiness.

**ITSM data hygiene:**
Close stale Pending>14d with user ping; merge duplicates; require category before Resolve; ban «Other» without comment.

**Escalation anti-patterns:**
Empty escalation «please help»; escalation without user contact; closing before L3 confirms; ping-pong >3 teams without coordinator.

**Problem vs Incident decision tree:**
Single occurrence → Incident. Same root unknown 3× → Problem. Known Error published → link KB to new Incidents.

**Change types SMB simplified:**
Standard (pre-approved): password reset, printer deploy. Normal: GPO change, firewall rule. Emergency: P1 fix with PIR within 48h.

**Continual Improvement register example:**
| ID | Idea | Source | Priority | Owner | Status |
|----|------|--------|----------|-------|--------|
| CSI-01 | Auto VPN KB deflection | Q2 metrics | High | L1 lead | Open |

**Reading list (optional):**
ITIL 4 Foundation book (ch 1–4), «The Phoenix Project» fiction for DevOps mindset, Microsoft Learn IT Support learning paths.`,
    },
    {
      title: 'Резюме главы: ключевые takeaways',
      content: `1. **L1/L2/L3** — чёткие границы и эскалация с контекстом
2. **ITIL термины** — Incident, Request, Problem, Change — используй ежедневно
3. **ITSM** — Jira SM или Zendesk с SLA, KB, queues
4. **Soft skills** — скрипты, активное слушание, ETA
5. **KB deflection** — инвестиция окупается за 2–3 месяца
6. **Security** — верификация личности, никаких паролей в email
7. **Карьера** — AD, сеть, PowerShell, Linux параллельно с L1
8. **Метрики** — FRT, MTTR, CSAT, reopen rate — улучшай еженедельно

> Следующая глава: **Helpdesk, тикеты и SLA** — углубление в жизненный цикл тикета и практику SLA.`,
    },
  ],
  practice: [
    'Jira SM trial: 3 queues + SLA',
    'ITSM comparison для своей компании',
    'Shift handover mock P1+P3',
    '20 сценариев Incident/Request/Problem',
    'Career plan L1→DevOps 24 мес',
    'Mock angry user call',
    'Escalation matrix 12 scenarios',
    '5 KB outlines new office',
    'Tabletop P1 no internet',
    'ITIL 4 map 8 practices',
    'Snipe-IT 15 assets',
    'Remote support policy 1 page',
    'CompTIA A+ 30-day plan',
    'Email templates resolved+info',
    'Retro 3 newbie mistakes',
  ],
  resources: [
    { title: 'ITIL 4 Foundation', url: 'https://www.axelos.com/certifications/itil-service-management/itil-4-foundation' },
    { title: 'CompTIA A+', url: 'https://www.comptia.org/certifications/a' },
    { title: 'Jira Service Management', url: 'https://www.atlassian.com/software/jira/service-management' },
    { title: 'HDI Support Center', url: 'https://www.thinkhdi.com/' },
    { title: 'Snipe-IT', url: 'https://snipeitapp.com/' },
    { title: 'Microsoft Modern Workplace', url: 'https://learn.microsoft.com/en-us/training/paths/modernize-workplace/' },
  ],
}
