import type { Chapter } from '../../../types'

export const helpdeskSlaChapter: Chapter = {
  id: 'helpdesk-and-sla',
  slug: 'helpdesk-and-sla',
  title: 'Helpdesk, тикеты и SLA',
  moduleId: 'it-support',
  order: 1,
  duration: '10–12 часов',
  level: 'beginner',
  description:
    'Жизненный цикл тикета, приоритеты, SLA, эскалация, knowledge base и метрики поддержки',
  sections: [
    {
      title: 'Service Desk как центр IT-операций',
      content: `**Service Desk** — единая точка входа для всех IT-обращений. Без него поддержка живёт в личных чатах, почте и «подойди к Васе» — невозможно измерить SLA, нагрузку и качество.

**Функции Service Desk:**
- Приём и регистрация всех обращений
- Классификация и приоритизация
- Первичная диагностика и решение (L1)
- Эскалация с полным контекстом
- Коммуникация статуса пользователю
- Закрытие с подтверждением
- Сбор метрик и feedback для улучшений

**Каналы приёма:**
| Канал | Плюсы | Минусы |
|-------|-------|--------|
| Email | Привычно, async | Много «Re: Re:», теряется контекст |
| Web portal | KB deflection, обязательные поля | Нужно обучить users |
| Phone | Срочные P1, elderly users | Нет audit trail без записи в ITSM |
| Teams/Slack bot | Быстро для tech staff | Shadow IT tickets вне ITSM |
| Walk-in | Личный контакт | Очередь, нет тикета = проблема |

**Правило:** любое решение фиксируется в тикете. Даже 2-минутный fix у стойки — создай ticket post-factum.`,
    },
    {
      title: 'Жизненный цикл тикета',
      content: `**Стандартный workflow:**

\`\`\`
New → Open → In Progress → Pending (user/vendor) → Resolved → Closed
                    ↓
              On Hold (awaiting parts)
                    ↓
              Reopened (user says not fixed)
\`\`\`

**Описание статусов:**
| Статус | Когда использовать |
|--------|-------------------|
| **New** | Только создан, не назначен |
| **Open** | Назначен агенту, ещё не начата работа |
| **In Progress** | Активная работа |
| **Pending (user)** | Ждём ответа/действия пользователя |
| **Pending (vendor)** | Ждём ISP, Microsoft, RMA |
| **On Hold** | Ждём запчасть, change window |
| **Resolved** | Fix применён, ждём подтверждения |
| **Closed** | Подтверждено или auto-close |
| **Reopened** | Проблема вернулась |

**Обязательные поля при создании:**
- Requester (кто обратился)
- Subject (кратко, searchable)
- Category (Hardware, Software, Network...)
- Priority (P1–P4 или Critical/High/Medium/Low)
- Description (симптомы, время начала, scope)
- Asset (ПК tag, принтер IP) — если применимо
- Location (офис, этаж, remote)

**Правила закрытия:**
- Не закрывай без подтверждения пользователя (кроме documented auto-close)
- Resolution notes обязательны: что сделано
- Link к KB если создали/обновили статью
- Time spent для отчётности (опционально)`,
    },
    {
      title: 'Приоритеты: матрица Impact × Urgency',
      content: `**Приоритет** определяет SLA и порядок обработки. Не путай с «кто громче кричит».

| Priority | Название | Impact | Urgency | Примеры |
|----------|----------|--------|---------|---------|
| **P1** | Critical | Многие users / бизнес стоит | Немедленно | Весь офис без интернета, ransomware, DC down |
| **P2** | High | Один ключевой user / отдел | Сегодня | CEO email down, весь отдел без VPN |
| **P3** | Medium | Один user, workaround есть | 1–2 дня | Outlook медленный, один принтер |
| **P4** | Low | Минимальный impact | 3–5 дней | Запрос софта, вопрос «как сделать» |

**Калибровка приоритетов (примеры для офиса 50 чел):**
- 1 user Wi‑Fi → P3
- 10 users Wi‑Fi → P2
- Все users Wi‑Fi → P1
- 1 user forgot password → P3 (P2 если C-level)
- Phishing click → P2 (security)

**Понижение приоритета:** только team lead с комментарием в тикете.
**Повышение:** любой агент при новых фактах.`,
    },
    {
      title: 'SLA: примеры для офиса 10, 50 и 100 пользователей',
      content: `**SLA (Service Level Agreement)** — обязательства по времени реакции и решения.

**Офис 10 человек (без dedicated IT):**
| Priority | Response | Resolution | Часы поддержки |
|----------|----------|------------|----------------|
| P1 | 30 min | 4 h | Пн–Пт 9–18 |
| P2 | 2 h | 8 h | Пн–Пт 9–18 |
| P3 | 4 h | 24 h | Пн–Пт 9–18 |
| P4 | 8 h | 72 h | Пн–Пт 9–18 |

**Офис 50 человек (1 L1 + 1 L2, L3 part-time):**
| Priority | Response | Resolution | Часы |
|----------|----------|------------|------|
| P1 | 15 min | 4 h | 24×7 on-call L3 |
| P2 | 30 min | 8 h | Пн–Пт 8–20 |
| P3 | 4 h | 24 h | Пн–Пт 8–20 |
| P4 | 8 h | 72 h | Пн–Пт 8–20 |

**Офис 100 человек (2 L1 + 2 L2 + L3):**
| Priority | Response | Resolution | Часы |
|----------|----------|------------|------|
| P1 | 15 min | 2 h | 24×7 |
| P2 | 15 min | 4 h | Пн–Сб 7–22 |
| P3 | 2 h | 16 h | Пн–Пт 7–20 |
| P4 | 8 h | 48 h | Пн–Пт 7–20 |

**Определения:**
- **Response time** — первый meaningful reply (не auto-ack)
- **Resolution time** — статус Resolved
- **Business hours** — указывай timezone (MSK, CET)

**SLA breach actions:**
1. Auto-notify team lead
2. Escalation queue
3. Postmortem для P1/P2 breaches
4. Monthly report для management`,
    },
    {
      title: 'Jira Service Management: практическая настройка',
      content: `**JSM setup checklist для SMB:**

**1. Project type:** Service Management
**2. Request types:**
- Report an issue (Incident)
- Request something (Service Request)
- Ask a question

**3. Queues:**
| Queue | JQL filter | Assignee group |
|-------|------------|----------------|
| L1 Helpdesk | priority in (P3,P4) | helpdesk-team |
| L2 Desktop | category in (Software, Email) | desktop-team |
| L3 Infra | category = Network OR priority = P1 | infra-team |
| Security | category = Security | security-team |

**4. SLA goals (Automation → SLA):**
- P1 Response: 15 min calendar
- P1 Resolution: 4 h calendar
- Pause SLA when status = Pending (user)

**5. Automation rules:**
- Auto-assign Network → L3 queue
- P1 created → Slack webhook + SMS on-call
- Ticket Resolved 48h → auto Close
- Reopened 2× → flag for review

**6. Customer portal:**
- Branding, logo
- KB articles linked to request types
- Allow attachments (screenshots)

**7. Assets (optional):** link laptop serial to ticket`,
    },
    {
      title: 'Zendesk: практическая настройка',
      content: `**Zendesk setup для IT helpdesk:**

**1. Groups:** L1, L2, L3, Security
**2. Ticket forms** с custom fields:
- Category (dropdown)
- Asset tag
- Office location

**3. Triggers:**
| Trigger | Condition | Action |
|---------|-----------|--------|
| Route Network | Category = Network | Group = L3 |
| P1 alert | Priority = Urgent | Notify #it-alerts Slack |
| Auto-reply | Ticket created | Send «получили, №{{ticket.id}}» |

**4. Macros (canned responses):**
- Password reset instructions
- VPN troubleshooting steps
- «Need more info» template

**5. Views:**
- My open tickets
- SLA breaching soon (Zendesk SLA app)
- Unassigned P1/P2

**6. Help Center:**
- Sections: Getting Started, VPN, Email, Printing
- Article labels for search

**7. Satisfaction survey:** CSAT после Resolved (1–5 stars)`,
    },
    {
      title: 'Категории, теги и маршрутизация',
      content: `**Рекомендуемое дерево категорий:**

\`\`\`
├── Hardware
│   ├── Laptop/Desktop
│   ├── Monitor/Peripherals
│   └── Docking Station
├── Software
│   ├── Microsoft 365
│   ├── Line-of-business apps
│   └── Installation request
├── Network
│   ├── Internet
│   ├── VPN
│   └── Wi‑Fi
├── Email & Collaboration
│   ├── Outlook
│   └── Teams
├── Printing
├── Access & Identity
│   ├── Password/MFA
│   └── Permissions
├── Security
├── New Hire / Offboarding
└── Other
\`\`\`

**Auto-routing matrix:**
| Category | Subcategory | Queue | Default priority |
|----------|-------------|-------|------------------|
| Network | Internet (all users) | L3 | P1 |
| Network | VPN | L2 | P3 |
| Access | Password | L1 | P3 |
| Security | Any | Security + L2 | P2 |
| New Hire | — | L2 | P3 |

**Теги для аналитики:** win11, intune, forticlient, printer-hp, remote-user`,
    },
    {
      title: 'Canned responses vs персонализированные ответы',
      content: `**Canned responses (macros)** ускоряют работу, но **опасны** при слепом копипасте.

**Когда использовать macro:**
- Стандартная процедура (SSPR link)
- Запрос дополнительной информации
- Закрытие с инструкцией KB
- «Мы получили ваш тикет №XXX»

**Когда НЕ использовать macro:**
- Пользователь уже описал проблему — не шли generic «опишите проблему»
- Emotional/angry user — персональный тон
- P1 — каждое сообщение уникально

**Шаблон: запрос информации**
> Здравствуйте, {{name}}!
>
> Для диагностики уточните, пожалуйста:
> 1. С какого времени наблюдается проблема?
> 2. Ошибка появляется на всех сайтах или только на корпоративных?
> 3. Подключены по кабелю или Wi‑Fi?
> 4. Приложите скриншот ошибки.
>
> С уважением, IT Support

**Шаблон: решено**
> Здравствуйте!
>
> Мы выполнили: [описание действий].
> Пожалуйста, перезагрузите компьютер и проверьте [сервис].
> Если проблема останется — ответьте на это письмо, тикет откроется снова.
>
> Оцените качество поддержки по ссылке ниже.`,
    },
    {
      title: 'Knowledge Base: создание и поддержка',
      content: `**20 обязательных KB статей для корпоративного офиса:**

1. Как создать тикет в IT portal
2. Сброс пароля (SSPR)
3. Подключение к VPN (FortiClient)
4. Подключение к Wi‑Fi Corp (802.1X)
5. Guest Wi‑Fi
6. Настройка Outlook на новом ПК
7. Teams — нет звука
8. Teams — нет видео
9. OneDrive — файлы не синхронизируются
10. Подключение сетевого принтера
11. Очистка очереди печати
12. «Компьютер медленный» — self-help
13. Установка корпоративного софта (Company Portal)
14. BitLocker recovery key
15. Работа из дома — checklist
16. Новый сотрудник — первый день
17. Сообщить о фишинге
18. Потеря/кража ноутбука
19. Мобильная почта (iOS/Android)
20. Контакты IT и часы поддержки

**Формат статьи (шаблон):**
- **Симптомы** — что видит user
- **Причина** — кратко (опционально)
- **Решение** — numbered steps + screenshots
- **Если не помогло** — создайте тикет, укажите категорию X
- **Связанные статьи**

**Review cycle:** каждые 6 месяцев или после major change (Win11, новый VPN).`,
    },
    {
      title: 'Эскалация: когда, как и пакет информации',
      content: `**Эскалируй, если:**
- Нет доступа или прав для fix
- Проблема не решается за 20–30 мин (L1)
- Требуется downtime / change window
- Security incident
- Повторяющаяся проблема (→ Problem ticket)
- Пользователь C-level с P2+
- Vendor involvement needed

**Уровни эскалации:**
| From | To | Trigger |
|------|-----|---------|
| L1 | L2 | Desktop/AD/Intune scope |
| L1/L2 | L3 | Network, server, firewall |
| Any | Security | Phishing, malware, breach |
| L3 | Vendor | Hardware RMA, bug |

**Эскалационный пакет (обязательные поля):**
1. Ticket number и priority
2. Business impact (сколько users, кто)
3. Timeline: когда началось, что менялось
4. Steps already taken (чеклист)
5. Screenshots, logs, error messages
6. Asset info: hostname, IP, user
7. Urgency justification

**Шаблон эскалации L1→L3:**
> **Escalation to L3**
> Ticket: #12345, P2
> Issue: 15 users floor 2 no internet, wired + Wi‑Fi
> Started: 10:15 MSK
> L1 checked: single user OK on floor 1, APIPA on floor 2
> Suspect: access switch 2 or trunk
> Switch: SW-F2-01, IP 192.168.99.12
> Need: L3 check switch port/VLAN trunk`,
    },
    {
      title: 'Метрики поддержки: dashboard и review',
      content: `| Метрика | Определение | Целевое значение |
|---------|-------------|------------------|
| **Ticket volume** | Созданных тикетов/месяц | Тренд + категории |
| **FRT** | First Response Time | По SLA |
| **MTTR** | Mean Time To Resolve | P3: < 8h business |
| **FCR** | First Contact Resolution | > 65% L1 |
| **CSAT** | Customer satisfaction 1–5 | > 4.2 |
| **SLA %** | % tickets в SLA | > 95% |
| **Reopen rate** | Reopened / Total closed | < 8% |
| **Backlog age** | Средний возраст open tickets | < 3 days P3 |
| **Agent utilization** | Tickets/agent/day | Benchmark 15–25 L1 |

**Еженедельный review agenda (30 min):**
1. P1/P2 incidents — что случилось, postmortem needed?
2. SLA breaches — root cause
3. Top 5 categories — KB или training?
4. Reopened tickets — quality issue
5. CSAT outliers — негативный feedback
6. Backlog > 7 days — assign owners

**Monthly management report (1 page):**
- Total tickets vs last month
- SLA compliance %
- CSAT average
- Top 3 improvements planned`,
    },
    {
      title: 'Problem Management и Known Errors',
      content: `**Problem ticket** создаётся когда:
- 3+ похожих Incident за месяц
- Root cause неизвестен после L3 investigation
- Workaround есть, permanent fix нет

**Problem workflow:**
\`\`\`
Problem Open → Investigation → Root Cause Identified
    → Known Error (KB workaround) → Change Request → Closed
\`\`\`

**Пример:**
- **Incidents:** 12 users «Outlook disconnects every hour»
- **Problem:** #PRB-042 Exchange connectivity
- **Root cause:** Expired cert on load balancer
- **Known Error:** KB «Outlook disconnect» → workaround: restart Outlook
- **Change:** CHG-089 cert renewal Sunday 02:00

**Linking:** Incident tickets link to Problem; при закрытии Problem — review all linked Incidents.`,
    },
    {
      title: 'Service Requests: стандартизация и fulfillment',
      content: `**Популярные Service Requests:**

| Request | Fulfillment time | Approval |
|---------|------------------|----------|
| New laptop | 5 business days | Manager |
| Software install | 2 business days | Manager + license |
| Shared folder access | 1 business day | Data owner |
| Distribution list | 1 business day | Owner |
| VPN access | 1 business day | Manager |
| Mobile phone | 10 business days | HR + Manager |

**Service catalog в ITSM:**
- Описание услуги
- SLA fulfillment (не путать с incident SLA)
- Required fields (manager email, business justification)
- Approval workflow
- Automation (Intune app deploy после approval)

**Joiner request (automated checklist):**
- [ ] AD account
- [ ] M365 license
- [ ] Laptop from stock
- [ ] Badge (Facilities)
- [ ] Welcome email with KB links`,
    },
    {
      title: 'Коммуникация при массовых инцидентах',
      content: `**P1 communication plan:**

| Время | Действие | Канал |
|-------|----------|-------|
| T+0 | P1 ticket, war room | ITSM + Teams |
| T+15 min | «Мы знаем о проблеме, работаем» | Email all-staff |
| T+30 min | Status update + ETA if known | Email + Teams |
| Каждые 30 min | Update until resolved | Email |
| Resolved | «Сервис восстановлен, причина: X» | Email |
| T+48h | Postmortem summary (internal) | Confluence |

**Status page (опционально):** status.company.com — green/yellow/red для Internet, Email, VPN.

**Не говори:** «мы не знаем что делать»
**Говори:** «причина устанавливается, следующий update в 30 минут»`,
    },
    {
      title: 'CSAT и обратная связь',
      content: `**CSAT survey** — 1–2 вопроса после Resolved:
1. Оцените поддержку 1–5
2. Комментарий (опционально)

**Анализ:**
- CSAT < 3 → team lead review в течение 24h, callback user
- Trend down за месяц → training, staffing, process issue
- CSAT > 4.5 стабильно → document what works

**Не наказывай за низкий CSAT** при P1 вне контроля агента — смотри context.

**NPS vs CSAT:** NPS «порекомендуешь IT?» — реже, для annual survey.`,
    },
    {
      title: 'Интеграции ITSM с экосистемой',
      content: `**Полезные интеграции:**

| Система | Интеграция | Польза |
|---------|------------|--------|
| Azure AD / AD | SCIM provisioning agents | Auto user sync |
| Microsoft Teams | Ticket notifications | Alerts в канал |
| Slack | /ticket command | Create from chat |
| Intune | Asset sync | Device in ticket |
| PRTG / monitoring | Auto-create P1 | Proactive support |
| Confluence | KB link | Single source of truth |
| Jira Software | Link dev bugs | Dev ↔ IT |

**Email-to-ticket pitfalls:**
- Loop: auto-reply создаёт новый ticket → disable on support@ mailbox
- CC hell: один thread = один ticket
- Attachments size limit`,
    },
    {
      title: 'Типовые ошибки helpdesk-процессов',
      content: `| Ошибка | Последствие | Fix |
|--------|-------------|-----|
| Нет единого канала | Потерянные обращения | Portal + email only |
| Приоритет «всё P1» | SLA meaningless | Calibration training |
| Закрытие без resolution notes | Reopen, no audit | Required field |
| KB устарела | Deflection fails | Review cycle |
| Нет on-call для P1 | Night outage waits | Rotation |
| Shadow IT в чатах | No metrics | Policy: ticket first |

**Maturity levels:**
1. **Chaos** — чаты, нет SLA
2. **Basic** — ITSM, manual routing
3. **Managed** — SLA, KB, metrics review
4. **Optimized** — automation, proactive, Problem mgmt`,
    },
    {
      title: 'Полный SLA document (пример 50 users)',
      content: `# SLA — IT Support v2.1
**Компания:** Example LLC | **Офис:** 50 FTE, Москва | **Timezone:** MSK

## 1. Scope
Корпоративные IT-услуги: ПК, M365, VPN, Wi‑Fi, принтеры, учётные записи, периферия.

## 2. Service Hours
| Priority | Support hours | On-call |
|----------|---------------|---------|
| P1 | 24×7×365 | L3 rotation |
| P2 | Mon–Fri 08:00–20:00 | L2 extended |
| P3–P4 | Mon–Fri 08:00–20:00 | Business hours |

## 3. SLA Targets
| Priority | Definition | Response | Resolution |
|----------|------------|----------|------------|
| **P1 Critical** | >50% users или business stop | 15 min | 4 h |
| **P2 High** | Key user/dept, no workaround | 30 min | 8 h |
| **P3 Medium** | Single user, workaround exists | 4 h | 24 h |
| **P4 Low** | Service request, minimal impact | 8 h | 72 h |

## 4. Definitions
- **Response:** first meaningful human reply (not auto-ack)
- **Resolution:** status Resolved in ITSM
- **Pause:** Pending (user/vendor) stops SLA clock

## 5. Exclusions
User training, vendor RMA delays, force majeure, unsupported BYOD.

## 6. Escalation
SLA breach → auto-notify team lead → monthly management report.

## 7. Review
Quarterly review with business owner. Sign-off: IT Manager + HR Director.`,
    },
    {
      title: 'CSAT surveys: design и анализ',
      content: `2 questions post-Resolved: 1-5 rating + comment. CSAT<3 → lead callback 24h. Track by agent/category monthly.`,
    },
    {
      title: 'Escalation matrix расширенная',
      content: `| From | To | Trigger | Max wait |\n| L1 | L2 | 20min no progress desktop | 30m |\n| L1 | L3 | Network/multi-user | 15m |\n| L2 | L3 | Infra change needed | 1h |\n| Any | Security | Phishing/malware | immediate |\n| L3 | Vendor | RMA/firmware | per contract |`,
    },
    {
      title: '30 canned responses (русский)',
      content: `**30 canned responses на русском (персонализируй {{имя}}, {{ticket}}):**

1. «Здравствуйте, {{имя}}! Получили ваше обращение №{{ticket}}. Уже работаем, вернёмся с обновлением в течение {{ETA}}.»
2. «Для диагностики пришлите, пожалуйста, скриншот ошибки и время, когда проблема началась.»
3. «Попробуйте перезагрузить компьютер и проверить снова. Сообщите результат в этом тикете.»
4. «Отключите VPN (FortiClient) и проверьте доступ в интернет. Если помогло — переподключите VPN.»
5. «Сброс пароля: перейдите на {{SSPR_URL}} или позвоните нам после верификации личности.»
6. «Перезапустите службу печати: Win+R → services.msc → Print Spooler → Restart.»
7. «Проверьте Outlook в браузере: {{OWA_URL}}. Если web работает — починим desktop-клиент.»
8. «В Teams: Параметры → Устройства — выберите правильный микрофон и динамики.»
9. «Забудьте Wi‑Fi сеть Corp-WiFi и подключитесь снова, используя доменный логин и пароль.»
10. «OneDrive может синхронизироваться до 24 часов после больших изменений — это нормально.»
11. «Ждём вашего ответа. Тикет закроется автоматически через 48 часов без активности.»
12. «Передали специалисту L2, ожидайте обновление в течение 2 часов.»
13. «**P1:** Мы знаем о проблеме с {{сервис}}. Команда работает. Следующее обновление в 30 минут.»
14. «Ваш запрос на {{услуга}} одобрен. Срок выполнения: {{SLA}} рабочих дней.»
15. «ПО доступно в Company Portal → Установить {{app}}.»
16. «Ключ восстановления BitLocker выдан после верификации. Введите на экране загрузки.»
17. «Новый ноутбук будет готов через 5 рабочих дней. Уведомим о отправке.»
18. «Установите Microsoft Authenticator и следуйте инструкции MFA: {{KB_link}}.»
19. «При подозрении на фишинг немедленно смените пароль и сообщите Security.»
20. «Guest Wi‑Fi: SSID {{Guest}}, пароль {{pass}}. Интернет только, без доступа к LAN.»
21. «Освободите минимум 15 ГБ на диске C: для обновлений Windows.»
22. «Для RDP сначала подключитесь к VPN, затем {{server}}.»
23. «Доступ к папке требует одобрения владельца данных — перешлите email approval.»
24. «Учётная запись отключена по процедуре HR offboarding.»
25. «Добро пожаловать! Инструкции: {{welcome_KB}}. Day-1 звонок {{time}}.»
26. «Сегодня ночью 02:00–04:00 плановое обновление. Возможен краткий перерыв {{сервис}}.»
27. «Провайдер подтвердил аварию в районе {{area}}. ETA восстановления {{time}}.»
28. «Оцените качество поддержки (1–5): {{CSAT_link}} — нам важно ваше мнение.»
29. «Объединили с тикетом №{{parent}} — следите за обновлениями там.»
30. «Проблема решена: {{fix}}. Подтвердите, пожалуйста, что всё работает.»`,
    },
    {
      title: 'Jira workflow JSON (описание)',
      content: `States: Open→In Progress→Pending→Resolved→Closed. Transitions gated: Resolve requires resolution field. Automation: P1→Slack #it-alerts; Pending user pauses SLA; Reopen 2x→flag review. Request types map to queues via JQL.`,
      code: {
        language: 'json',
        code: `{"rules":[{"trigger":"issue_created","condition":"priority=P1","action":"notify_slack"}]}`,
        caption: 'Jira automation snippet'
      },
    },
    {
      title: 'KPI dashboard',
      content: `Widgets: Open by priority pie | SLA at risk list | FRT 4-week trend | MTTR by category | CSAT avg | Reopen % | Ticket volume vs last month | Agent utilization | Top 5 categories | Problem backlog.`,
    },
    {
      title: 'Лабораторная Helpdesk (16 шагов)',
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
      title: 'Extended reference — deep dive',
      content: `**Jira Service Management — automation rules catalog**

| Rule name | Trigger | Condition | Action |
|-----------|---------|-----------|--------|
| Route Network | Created | Category=Network | Assign L3 queue |
| P1 Slack alert | Created | Priority=P1 | Webhook #it-alerts |
| SLA pause user | Updated | Status=Pending user | Pause SLA clocks |
| Auto-close 48h | Scheduled | Resolved >48h | Transition Closed |
| Reopen flag | Updated | Reopen count=2 | Label review-needed |
| VIP notify | Created | Requester in VIP group | Notify manager |

**Zendesk triggers mirror:** same logic with native trigger UI; use tags for routing.

**CSAT program design:**
- Send on Resolved only (not Closed) for fresh memory
- Question 1: 1–5 stars; Question 2: free text optional
- Threshold: ≤2 stars → team lead callback within 24h business
- Monthly report by agent — coaching not punishment
- Exclude P1 vendor outages from individual agent score

**Service catalog — 15 standard requests:**
New laptop, monitor, keyboard/mouse, software install, shared folder, distribution list, VPN access, mobile phone, door badge (Facilities link), parking pass, conference room AV, external guest Wi‑Fi sponsor, Adobe license, SAP access, developer tools exception.

**Approval chains:**
Hardware: Manager → IT → Finance if >€800
Data access: Manager → Data owner → Security if confidential
Software with cost: Manager → Finance → IT deploy

**KB deflection measurement:**
Track portal searches → ticket created ratio. Target: 30% searches don't become tickets. A/B test KB titles.

**SLA reporting pack (monthly PDF):**
Page 1 executive summary; Page 2 SLA% by priority chart; Page 3 top categories; Page 4 action plan.

**Ticket quality audit checklist (10 points):**
Category correct, priority justified, asset filled, steps documented, resolution notes, KB linked, CSAT sent, time appropriate, no duplicate, user confirmed.

**Major incident comms — full email set:**
T+0 acknowledge; T+30 investigation; T+60 workaround if any; Resolved root cause brief; T+48h internal postmortem summary.

**OLA between teams example:**
L1→L2 desktop: acknowledge 30 min, resolve or escalate 4h business. L2→L3 network: acknowledge 15 min P1.

**Integration architecture:**
AD→ITSM user sync SCIM; Intune→asset sync; PRTG→auto P1 ticket on WAN down; Teams bot create ticket.

**Knowledge-Centered Service (KCS):**
Agents create KB from tickets; flag article if used in resolution; retire outdated quarterly.

**Shift scheduling 50-user office:**
2 L1 overlapping 08–17; L2 09–18; L3 on-call rotation weekly; holiday coverage plan documented Nov each year.

**Ticket tagging strategy:**
Tags: recurring, training-needed, vendor-waiting, security, project-x — enables reporting.

**Breached SLA root cause categories:**
Understaffed, wrong priority, awaiting user, vendor delay, complex unknown — track monthly.

**Request fulfillment Kanban:**
Backlog → Approved → In progress → User verify → Done. WIP limit 5 per L2.

**Email-to-ticket hygiene:**
Disable autoreply on support@; strip signatures; merge CC threads; attachment virus scan.

**HDI/support metrics benchmarks:**
FCR 65–75% L1; CSAT 4.2+; reopen <8%; SLA >95% P3+.

**Problem ticket template fields:**
Linked incidents, impact count, root cause hypothesis, workaround, permanent fix change #, owner.

**Customer recovery after bad CSAT:**
Lead calls user within 24h; acknowledge; explain; offer follow-up; document in ticket — often converts 2→4 stars.`,
    },
    {
      title: 'Extended reference — deep dive',
      content: `Additional operational notes: document every change; test backups quarterly; maintain spares; train successors; review firewall rules semi-annual; validate contact lists emergency; keep ISP account numbers handy; label everything; photo document rack; run tabletop drills; measure twice cut once on IP plan; never expand scope without change ticket; communicate early often; sleep during long P1 only after handover; celebrate wins with team; learn from every breach SLA; automate repetitive; read release notes firmware; respect maintenance windows; keep lab environment; certify skills yearly; mentor juniors; ask when unsure not guess production.Additional operational notes: document every change; test backups quarterly; maintain spares; train successors; review firewall rules semi-annual; validate contact lists emergency; keep ISP account numbers handy; label everything; photo document rack; run tabletop drills; measure twice cut once on IP plan; never expand scope without change ticket; communicate early often; sleep during long P1 only after handover; celebrate wins with team; learn from every breach SLA; automate repetitive; read release notes firmware; respect maintenance windows; keep lab environment; certify skills yearly; mentor juniors; ask when unsure not guess production.Additional operational notes: document every change; test backups quarterly; maintain spares; train successors; review firewall rules semi-annual; validate contact lists emergency; keep ISP account numbers handy; label everything; photo document rack; run tabletop drills; measure twice cut once on IP plan; never expand scope without change ticket; communicate early often; sleep during long P1 only after handover; celebrate wins with team; learn from every breach SLA; automate repetitive; read release notes firmware; respect maintenance windows; keep lab environment; certify skills yearly; mentor juniors; ask when unsure not guess production.`,
    },
    {
      title: 'Резюме главы',
      content: `1. **Жизненный цикл** — New → Resolved → Closed с чёткими статусами
2. **Приоритеты** — Impact × Urgency, не «кто кричит»
3. **SLA** — разные для 10/50/100 users, response ≠ resolution
4. **JSM / Zendesk** — queues, automation, portal, KB
5. **Эскалация** — пакет с impact, steps, logs
6. **KB** — 20 статей minimum, deflection, review cycle
7. **Метрики** — FRT, MTTR, CSAT, reopen — weekly review
8. **P1 comms** — update каждые 30 min

> Следующая глава: **Поддержка рабочих станций** — Windows 11, Outlook, Teams, Intune.`,
    },
  ],
  practice: [
    'SLA document v1 для 50 users — полная таблица',
    '30 canned responses адаптируй под компанию',
    'Jira SM: 5 automation rules',
    'CSAT survey 2 questions draft',
    'Escalation matrix 10 rows',
    'KPI dashboard mock Excel 6 charts',
    'P1 comms email 3 updates timeline',
    'Problem ticket VPN workflow',
    'Service catalog 10 requests',
    'KB deflection measure baseline',
    'SLA breach tabletop retro',
    'Zendesk vs Jira 1-page comparison',
    'Monthly mgmt report template',
    'Queue routing JQL 4 queues',
    'Integration map AD+Teams+Intune',
  ],
  resources: [
    { title: 'Jira Service Management', url: 'https://www.atlassian.com/software/jira/service-management' },
    { title: 'Zendesk IT', url: 'https://www.zendesk.com/service/help-center/it-knowledge-base/' },
    { title: 'ITIL Service Desk', url: 'https://www.axelos.com/best-practice-solutions/itil' },
    { title: 'HDI KPIs', url: 'https://www.thinkhdi.com/' },
    { title: 'Freshservice', url: 'https://www.freshworks.com/freshservice/' },
    { title: 'Atlassian Automation', url: 'https://www.atlassian.com/software/jira/automation' },
  ],
}
