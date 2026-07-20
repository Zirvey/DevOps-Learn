import type { Chapter } from '../../../types'

export const networkingChapter: Chapter = {
  id: 'networking',
  slug: 'networking',
  title: 'Сети для DevOps',
  moduleId: 'fundamentals',
  order: 1,
  duration: '5–6 часов',
  level: 'beginner',
  description:
    'Глубокое изучение сетей: OSI и TCP/IP, IP и порты, DNS, HTTP/HTTPS/TLS, curl, firewall (ufw/iptables), диагностика',
  sections: [
    {
      title: 'Зачем сети DevOps-инженеру',
      content: `Почти каждый инцидент в продакшене так или иначе **сетевая проблема**:
- «Сайт не открывается» — DNS? Firewall? Nginx? Upstream?
- «API timeout» — latency, packet loss, connection pool
- «Pod не достучался до БД» — NetworkPolicy, Service, security group
- «SSL expired» — сертификат, cert-manager

Без понимания сетей ты будешь **угадывать**. С пониманием — **системно диагностировать**.`,
    },
    {
      title: 'Модель OSI (7 уровней)',
      content: `**OSI** — эталонная модель для понимания сетевого стека:

| Уровень | Название | PDU | Примеры |
|---------|----------|-----|---------|
| 7 | Application | Data | HTTP, DNS, SSH |
| 6 | Presentation | Data | TLS, сжатие |
| 5 | Session | Data | Сессии |
| 4 | Transport | Segment | TCP, UDP |
| 3 | Network | Packet | IP, ICMP |
| 2 | Data Link | Frame | Ethernet, MAC |
| 1 | Physical | Bits | Кабель, радио |

DevOps чаще всего работает на уровнях **4–7**. Уровни 1–3 — зона сетевых инженеров и облачных VPC, но базовое понимание нужно.`,
    },
    {
      title: 'Модель TCP/IP (4 уровня)',
      content: `Практическая модель интернета — **TCP/IP**:

\`\`\`
Application  │  HTTP, DNS, SSH, TLS
Transport    │  TCP, UDP
Internet     │  IP, ICMP
Link         │  Ethernet, Wi-Fi
\`\`\`

**Соответствие OSI ↔ TCP/IP:**
- Application (OSI 5–7) → Application
- Transport → Transport
- Network → Internet
- Data Link + Physical → Link

**Инкапсуляция:** HTTP данные → TCP segment (+ port) → IP packet (+ IP addr) → Ethernet frame (+ MAC).`,
    },
    {
      title: 'IP-адресация: IPv4',
      content: `**IPv4** — 32 бита, запись: \`192.168.1.10\`

**Классы частных адресов (RFC 1918):**
| Диапазон | CIDR | Использование |
|----------|------|---------------|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | Большие корп. сети, AWS VPC |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | Docker default bridge |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | Домашние роутеры |

**CIDR** — маска сети: \`/24\` = 256 адресов, \`/32\` = один хост.

**Loopback:** \`127.0.0.1\` — «этот хост».
**localhost** резолвится в ::1 (IPv6) и 127.0.0.1.`,
      code: {
        language: 'bash',
        code: `ip addr show
ip route show
# Проверка связности:
ping -c 4 8.8.8.8
ping -c 4 google.com`,
      },
    },
    {
      title: 'Порты и сокеты',
      content: `**Порт** — 16 бит (0–65535), идентификатор приложения на хосте.

**Диапазоны:**
- 0–1023 — well-known (привилегированные, root)
- 1024–49151 — registered
- 49152–65535 — dynamic/ephemeral (исходящие соединения)

**Известные порты DevOps:**
| Порт | Сервис |
|------|--------|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 8080 | Alt HTTP / proxies |
| 9090 | Prometheus |

**Сокет** = IP + порт + протокол. \`192.168.1.5:443\` — endpoint.`,
    },
    {
      title: 'TCP vs UDP',
      content: `| | TCP | UDP |
|---|-----|-----|
| Надёжность | Гарантированная доставка, порядок | Best effort |
| Соединение | 3-way handshake | Без соединения |
| Скорость | Медленнее (overhead) | Быстрее |
| Примеры | HTTP, SSH, DB | DNS queries, video, gaming |

**TCP handshake:** SYN → SYN-ACK → ACK.
**Закрытие:** FIN → ACK (four-way).

**DevOps:** HTTP/HTTPS — TCP. DNS обычно UDP (иногда TCP для больших ответов). Health checks могут быть TCP connect или HTTP.`,
    },
    {
      title: 'DNS: как работает',
      content: `**DNS** (Domain Name System) — распределённая БД «имя → IP».

**Порядок резолва (упрощённо):**
1. Кэш ОС / браузера
2. \`/etc/hosts\`
3. Резолвер (из \`/etc/resolv.conf\`, часто 8.8.8.8 или роутер)
4. Root → TLD (.com) → Authoritative NS домена

**TTL** — время жизни записи в кэше (секунды). Низкий TTL перед миграцией — быстрее переключение.`,
    },
    {
      title: 'Типы DNS-записей',
      content: `| Тип | Назначение | Пример |
|-----|------------|--------|
| **A** | Домен → IPv4 | \`api.example.com → 93.184.216.34\` |
| **AAAA** | Домен → IPv6 | |
| **CNAME** | Алиас на другое имя | \`www → example.com\` |
| **MX** | Почтовый сервер | priority + host |
| **TXT** | Произвольный текст | SPF, DKIM, верификация |
| **NS** | Authoritative nameserver | |
| **SRV** | Сервис + порт | \`_https._tcp\` |
| **CAA** | Кто может выпускать SSL | Let's Encrypt |

**DevOps-сценарии:**
- A/AAAA — деплой на новый IP
- CNAME — на load balancer (ALB, Cloudflare)
- TXT — ACME challenge, domain verification`,
      codes: [
        {
          language: 'bash',
          caption: 'Диагностика DNS',
          code: `dig example.com
dig example.com A +short
dig example.com MX
dig @8.8.8.8 example.com       # явный резолвер
nslookup example.com
host example.com
resolvectl query example.com   # systemd-resolved`,
        },
      ],
    },
    {
      title: 'HTTP: протокол прикладного уровня',
      content: `**HTTP** — текстовый протокол запрос/ответ.

**Структура запроса:**
\`\`\`
GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: curl/8.0
Accept: application/json
\`\`\`

**Методы:** GET (читать), POST (создать), PUT (заменить), PATCH (частично), DELETE, HEAD, OPTIONS.

**Статус-коды:**
| Класс | Значение | Примеры |
|-------|----------|---------|
| 1xx | Informational | 100 Continue |
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirect | 301 Moved Permanently, 302 Found, 304 Not Modified |
| 4xx | Client error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | Server error | 500 Internal, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout |

**502 vs 503:** 502 — upstream сломан; 503 — сервис намеренно недоступен (maintenance, overload).`,
    },
    {
      title: 'HTTPS и TLS',
      content: `**HTTPS** = HTTP поверх **TLS** (Transport Layer Security).

**TLS handshake (упрощённо):**
1. Client Hello (версии, cipher suites)
2. Server Hello + сертификат
3. Проверка сертификата клиентом (CA chain)
4. Обмен ключами
5. Шифрованный HTTP

**Сертификат** содержит: домен(ы), публичный ключ, подпись CA, срок действия.

**Let's Encrypt** — бесплатный CA. **certbot** — клиент для получения и обновления.

**DevOps:** автоматизация через cert-manager в K8s или cron + certbot на VM.`,
      codes: [
        {
          language: 'bash',
          caption: 'Проверка TLS',
          code: `curl -vI https://example.com 2>&1 | grep -E 'SSL|subject|expire'
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -dates -subject
echo | openssl s_client -connect expired.badssl.com:443 2>/dev/null | openssl x509 -noout -dates`,
        },
      ],
    },
    {
      title: 'curl — швейцарский нож DevOps',
      content: `**curl** — CLI для HTTP(S), FTP, и др. Незаменим в CI, скриптах, отладке API.`,
      codes: [
        {
          language: 'bash',
          caption: 'Базовые запросы',
          code: `curl https://api.example.com/health
curl -I https://example.com          # только заголовки
curl -v https://example.com          # verbose (TLS, headers)
curl -o page.html https://example.com
curl -O https://example.com/file.zip # сохранить с именем из URL`,
        },
        {
          language: 'bash',
          caption: 'POST, JSON, заголовки',
          code: `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer TOKEN" \\
  -d '{"name": "Alice", "email": "a@example.com"}'

curl -s https://api.example.com/users | jq .
curl -w "\\nHTTP: %{http_code} Time: %{time_total}s\\n" -o /dev/null -s https://example.com`,
        },
        {
          language: 'bash',
          caption: 'Health checks в скриптах',
          code: `curl -sf https://api.example.com/health || exit 1
# -s silent, -f fail on HTTP error (4xx, 5xx)`,
        },
      ],
    },
    {
      title: 'Маршрутизация и NAT',
      content: `**Маршрутизатор** пересылает пакеты по таблице маршрутизации.
**Default gateway** — маршрут «всё остальное» (0.0.0.0/0).

**NAT** (Network Address Translation) — частный IP ↔ публичный. Домашний роутер делает NAT.

**В облаке:** Security Groups (AWS), Firewall Rules (GCP) — виртуальный firewall на уровне инстанса. **NACL** — на уровне subnet.`,
      code: {
        language: 'bash',
        code: `ip route show
traceroute google.com
tracepath google.com
mtr google.com                   # apt install mtr`,
      },
    },
    {
      title: 'Firewall: концепции',
      content: `**Firewall** фильтрует трафик по правилам: IP, порт, протокол, direction (in/out).

**Порядок правил важен** — первое совпадение побеждает.

**Политика по умолчанию:**
- DROP/REJECT всё, разрешить нужное (безопаснее)
- ACCEPT всё, запретить ненужное (опаснее)

**На Linux:** iptables/nftables (низкий уровень), **ufw** (обёртка, Ubuntu), firewalld (RHEL).`,
    },
    {
      title: 'UFW — простой firewall Ubuntu',
      content: `**UFW** (Uncomplicated Firewall) — user-friendly интерфейс к iptables.`,
      codes: [
        {
          language: 'bash',
          caption: 'Базовая настройка UFW',
          code: `sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
sudo ufw status verbose
sudo ufw delete allow 80/tcp
sudo ufw reload`,
        },
      ],
    },
    {
      title: 'iptables — низкоуровневый firewall',
      content: `**iptables** — таблицы **filter**, **nat**, **mangle**. Цепочки: INPUT, OUTPUT, FORWARD.

На современных системах **nftables** заменяет iptables, но синтаксис iptables всё ещё встречается.`,
      code: {
        language: 'bash',
        caption: 'Просмотр и базовые правила',
        code: `sudo iptables -L -n -v
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A INPUT -j DROP
# Сохранение (Ubuntu):
sudo apt install iptables-persistent
sudo netfilter-persistent save`,
      },
    },
    {
      title: 'Диагностика сети: чеклист',
      content: `**«Не могу подключиться к сервису»** — по слоям снизу вверх:

1. **Физика/линк** — интерфейс up? \`ip link\`
2. **IP** — есть адрес? ping gateway?
3. **DNS** — резолвится имя? \`dig\`
4. **Порт** — слушает? \`ss -tulpn\`
5. **Firewall** — ufw/iptables/security group?
6. **Сервис** — nginx/app запущен? \`systemctl status\`
7. **Прикладной** — curl, код ответа, логи`,
      codes: [
        {
          language: 'bash',
          caption: 'Полный набор диагностики',
          code: `ping -c 3 8.8.8.8
ping -c 3 google.com
dig +short api.example.com
ss -tulpn | grep :443
curl -v telnet://host:5432     # или nc -zv host 5432
nc -zv localhost 80
traceroute api.example.com
curl -v https://api.example.com/health`,
        },
      ],
    },
    {
      title: 'Load balancing и reverse proxy (введение)',
      content: `**Reverse proxy** (Nginx, HAProxy) принимает клиентские запросы и проксирует на backend.

**Load balancer** распределяет нагрузку между несколькими backend:
- Round robin
- Least connections
- IP hash

**L4 vs L7:** L4 (TCP) — быстрее, не видит HTTP; L7 (HTTP) — routing по path, headers, sticky sessions.

Детали Nginx — в отдельной главе этого модуля.`,
    },
    {
      title: 'Сети в контексте DevOps',
      content: `Как сети проявляются дальше по учебнику:

| Технология | Сетевая концепция |
|------------|------------------|
| Docker | bridge network, port mapping, custom networks |
| Kubernetes | Pod IP, Service ClusterIP, Ingress, NetworkPolicy |
| Terraform | VPC, subnets, security groups, route tables |
| Cloud | ALB, NLB, CDN, PrivateLink |

Фундамент из этой главы — база для всех этих абстракций.`,
    },
  ],
  practice: [
    'На VPS: установи nginx, открой 80 в ufw. С другой машины: curl -I http://IP. Закрой 80 — убедись, что timeout. Открой снова',
    'Настрой A-запись (или /etc/hosts для теста): myapp.local → IP VPS. Проверь dig и curl по имени',
    'Выполни curl -v https://google.com и выпиши: HTTP версия, статус, 3 заголовка ответа, время TLS handshake',
    'С помощью ss найди все LISTEN порты. Для каждого определи процесс (nginx, sshd, ...)',
    'Напиши bash health-check: dig + curl + проверка порта через nc. Exit 1 при любой ошибке',
    'Симулируй DNS проблему: сломай /etc/resolv.conf, наблюдай ошибки curl. Восстанови',
    'Сравни ответы: curl http://site и curl https://site — заголовки, редиректы (curl -L -v)',
    'Добавь iptables правило DROP для порта 80 (если ufw disabled) или изучи ufw status numbered и delete',
    'traceroute до api.github.com — выпиши количество хопов и где возможна задержка',
    'Объясни коллеге (или в заметках) разницу 502 и 503 на примере nginx → upstream app',
  ],
  resources: [
    { title: 'MDN HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
  ],
}
