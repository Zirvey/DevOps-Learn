import type { Chapter } from '../../../types'

export const nginxChapter: Chapter = {
  id: 'nginx',
  slug: 'nginx',
  title: 'Nginx: reverse proxy и веб-сервер',
  moduleId: 'fundamentals',
  order: 6,
  duration: '4–5 часов',
  level: 'beginner',
  description:
    'Nginx для DevOps: установка, статика, reverse proxy, load balancing, SSL/TLS, логи, кэширование и troubleshooting',
  sections: [
    {
      title: 'Зачем Nginx в DevOps',
      content: `**Nginx** — высокопроизводительный веб-сервер и reverse proxy. Стандарт индустрии:

- Раздача **статики** (HTML, CSS, JS, assets)
- **Reverse proxy** перед приложением (Node, Python, Go)
- **Load balancing** между несколькими backend
- **TLS termination** — HTTPS на edge
- **Ingress controller** в Kubernetes (nginx-ingress)

> До Kubernetes на VPS типичная схема: **Nginx → app:3000**. В K8s ту же роль играет Ingress.`,
    },
    {
      title: 'Архитектура Nginx',
      content: `**Master process** + **worker processes** (по числу CPU или конфигу).

- Асинхронная event-driven модель — мало памяти, много соединений
- Конфигурация: \`nginx -t\` → \`reload\` без downtime
- Модули: http, stream, mail

**Основные файлы (Ubuntu/Debian):**
| Путь | Назначение |
|------|------------|
| \`/etc/nginx/nginx.conf\` | Главный конфиг |
| \`/etc/nginx/sites-available/\` | Виртуальные хосты |
| \`/etc/nginx/sites-enabled/\` | Symlinks на active |
| \`/var/www/html/\` | Дефолтный web root |
| \`/var/log/nginx/\` | access.log, error.log |`,
    },
    {
      title: 'Установка и первый запуск',
      content: ``,
      codes: [
        {
          language: 'bash',
          caption: 'Установка',
          code: `sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
curl -I http://localhost`,
        },
        {
          language: 'bash',
          caption: 'Управление конфигом',
          code: `sudo nginx -t              # проверка синтаксиса
sudo systemctl reload nginx  # применить без разрыва соединений
sudo systemctl restart nginx # полный рестарт
nginx -V                     # версия и модули`,
        },
      ],
    },
    {
      title: 'Структура nginx.conf',
      content: `Конфиг — **директивы** и **блоки** \`{ }\`.

\`\`\`
main context
├── events { }
└── http {
      upstream { }
      server {
        location / { }
      }
    }
\`\`\`

Директива заканчивается \`;\`. Блоки вложенные.`,
      code: {
        language: 'nginx',
        caption: 'Минимальный nginx.conf (фрагмент)',
        code: `user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  sendfile on;
  keepalive_timeout 65;

  include /etc/nginx/conf.d/*.conf;
  include /etc/nginx/sites-enabled/*;
}`,
      },
    },
    {
      title: 'Статический сайт',
      content: `Простейший **server block** — раздача файлов из директории.`,
      codes: [
        {
          language: 'nginx',
          caption: '/etc/nginx/sites-available/mysite',
          code: `server {
  listen 80;
  server_name example.com www.example.com;
  root /var/www/mysite;
  index index.html index.htm;

  location / {
    try_files $uri $uri/ =404;
  }

  location ~* \\.(css|js|png|jpg|ico|svg|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}`,
        },
        {
          language: 'bash',
          caption: 'Активация сайта',
          code: `sudo mkdir -p /var/www/mysite
echo '<h1>Hello Nginx</h1>' | sudo tee /var/www/mysite/index.html
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx`,
        },
      ],
    },
    {
      title: 'server_name и виртуальные хосты',
      content: `**server_name** — по какому Host header Nginx выбирает server block.

- Точное совпадение: \`server_name api.example.com;\`
- Wildcard: \`*.example.com\`
- Default: \`default_server\` на listen
- \`_\` — catch-all invalid names

Несколько сайтов на одном IP — **name-based virtual hosting**.`,
    },
    {
      title: 'Reverse proxy',
      content: `**Reverse proxy** — Nginx принимает запросы клиента и проксирует на backend приложение.

\`\`\`
Client → Nginx:443 → app:3000 (localhost или private network)
\`\`\`

**Зачем:**
- TLS на Nginx, app без SSL
- Единая точка входа
- Кэш, rate limit, auth
- WebSocket support`,
      codes: [
        {
          language: 'nginx',
          caption: 'Proxy к Node.js приложению',
          code: `server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}`,
        },
      ],
    },
    {
      title: 'location: маршрутизация запросов',
      content: `**Префиксы location:**
| Синтаксис | Приоритет | Пример |
|-----------|-----------|--------|
| \`=\` | Точное | \`location = /health\` |
| \`^~\` | Префикс без regex | \`location ^~ /static/\` |
| \`~\` / \`~*\` | Regex (case sensitive/insensitive) | \`location ~ \\.php$\` |
| \`/\` | Общий префикс | \`location /\` |

**try_files** — попробовать файлы по порядку, иначе fallback.`,
      code: {
        language: 'nginx',
        code: `location = /health {
  return 200 'OK';
  add_header Content-Type text/plain;
}

location /api/ {
  proxy_pass http://backend:8080/;
}

location / {
  try_files $uri $uri/ /index.html;
}`,
      },
    },
    {
      title: 'Load balancing (upstream)',
      content: `**upstream** — группа backend серверов.`,
      code: {
        language: 'nginx',
        caption: 'Round-robin load balancing',
        code: `upstream backend {
  least_conn;  # или: ip_hash; или round-robin по умолчанию
  server 10.0.1.10:8080 weight=3;
  server 10.0.1.11:8080;
  server 10.0.1.12:8080 backup;
  keepalive 32;
}

server {
  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
  }
}`,
      },
    },
    {
      title: 'SSL/TLS и HTTPS',
      content: `**TLS termination** на Nginx — стандартная схема.

**Let's Encrypt + certbot** — бесплатные сертификаты, автообновление.`,
      codes: [
        {
          language: 'bash',
          caption: 'certbot для Nginx',
          code: `sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
# Автообновление:
sudo certbot renew --dry-run
sudo systemctl status certbot.timer`,
        },
        {
          language: 'nginx',
          caption: 'Ручная настройка SSL',
          code: `server {
  listen 443 ssl http2;
  server_name example.com;

  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers off;

  location / {
    root /var/www/mysite;
  }
}

server {
  listen 80;
  server_name example.com;
  return 301 https://$host$request_uri;
}`,
        },
      ],
    },
    {
      title: 'Логирование',
      content: `**access_log** — каждый запрос. **error_log** — ошибки.

**Формат log** настраивается через \`log_format\`.`,
      codes: [
        {
          language: 'nginx',
          caption: 'Кастомный log format',
          code: `log_format main '$remote_addr - $remote_user [$time_local] '
                '"$request" $status $body_bytes_sent '
                '"$http_referer" "$http_user_agent" '
                'rt=$request_time';

access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log warn;`,
        },
        {
          language: 'bash',
          caption: 'Анализ логов',
          code: `# Top IP:
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head

# 5xx ошибки:
awk '$9 ~ /^5/' /var/log/nginx/access.log | tail -20

# Real-time:
tail -f /var/log/nginx/access.log`,
        },
      ],
    },
    {
      title: 'Кэширование и сжатие',
      content: `**gzip** — сжатие текстовых ответов.
**proxy_cache** — кэш ответов backend (осторожно с персональными данными).`,
      code: {
        language: 'nginx',
        code: `gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;

# Proxy cache (фрагмент):
# proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api:10m;
# proxy_cache api;
# proxy_cache_valid 200 10m;`,
      },
    },
    {
      title: 'Rate limiting и безопасность',
      content: `**limit_req** — защита от DDoS и brute force.
**client_max_body_size** — лимит upload.

Скрыть версию: \`server_tokens off;\``,
      code: {
        language: 'nginx',
        code: `limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
  server_tokens off;
  client_max_body_size 10M;

  location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://backend;
  }
}`,
      },
    },
    {
      title: 'Типичные ошибки и troubleshooting',
      content: `| Симптом | Причина | Решение |
|---------|---------|---------|
| 502 Bad Gateway | Backend down | systemctl status app, curl backend |
| 504 Gateway Timeout | Backend медленный | proxy_read_timeout, fix app |
| 413 Request Entity Too Large | Большой upload | client_max_body_size |
| 403 Forbidden | Права на files | chown www-data, chmod |
| Redirect loop | proxy headers | X-Forwarded-Proto |

**Диагностика:** \`nginx -t\`, \`error.log\`, \`curl -v\`, \`ss -tulpn\`.`,
      code: {
        language: 'bash',
        code: `sudo tail -50 /var/log/nginx/error.log
curl -v http://localhost
curl -v http://127.0.0.1:3000    # backend напрямую
sudo nginx -T | less              # полный конфиг с includes`,
      },
    },
    {
      title: 'Nginx в Docker и Kubernetes',
      content: `**Docker:** официальный образ \`nginx:alpine\`, конфиг через volume mount.

**Kubernetes:** Ingress resource + nginx-ingress controller — тот же Nginx, управляемый K8s API.

Концепции server/location/upstream **те же** — меняется способ доставки конфига.`,
      code: {
        language: 'yaml',
        caption: 'K8s Ingress (nginx-ingress)',
        code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts: [app.example.com]
      secretName: app-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-app
                port:
                  number: 80`,
      },
    },
    {
      title: 'Best practices',
      content: `- Всегда \`nginx -t\` перед reload
- Отдельный server block на домен
- HTTPS everywhere, HSTS после проверки
- Логи в structured format → Loki/ELK
- Мониторинг: nginx-prometheus-exporter
- Версионировать конфиги в Git (\`/etc/nginx\` → ansible или copy)
- Non-root в контейнерах где возможно`,
    },
  ],
  practice: [
    'Установи nginx на VPS. Создай статический сайт в /var/www/portfolio с index.html и style.css',
    'Настрой server_name (или IP). Проверь curl -H "Host: ..." при необходимости',
    'Запусти простое приложение на :3000 (python -m http.server). Настрой reverse proxy / → :3000',
    'Добавь location = /health с return 200. Используй в bash healthcheck',
    'Получи SSL через certbot --nginx. Проверь редирект HTTP→HTTPS и openssl s_client',
    'Настрой gzip on. Сравни размер ответа: curl -H "Accept-Encoding: gzip" -I',
    'Проанализируй access.log: top 10 IP и количество 404 через awk',
    'Симулируй 502: останови backend, curl через nginx. Найди запись в error.log',
    'Создай upstream с 2 backend (два порта python -m http.server). Проверь round-robin',
    'Версионируй конфиг nginx в Git репозитории. Документируй шаги деплоя конфига',
  ],
  resources: [
    { title: 'Nginx Docs', url: 'https://nginx.org/en/docs/' },
  ],
}
