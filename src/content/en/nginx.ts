import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Nginx: reverse proxy and web server',
  description:
    'Nginx for DevOps: installation, static files, reverse proxy, load balancing, SSL/TLS, logs, caching, and troubleshooting',
  duration: '4–5 hours',
  sections: [
    {
      title: 'Why Nginx in DevOps',
      content: `**Nginx** is a high-performance web server and reverse proxy. An industry standard:

- Serving **static** content (HTML, CSS, JS, assets)
- **Reverse proxy** in front of an application (Node, Python, Go)
- **Load balancing** across multiple backends
- **TLS termination** — HTTPS at the edge
- **Ingress controller** in Kubernetes (nginx-ingress)

> Before Kubernetes on a VPS, a typical setup is: **Nginx → app:3000**. In K8s, Ingress plays the same role.`,
    },
    {
      title: 'Nginx architecture',
      content: `**Master process** + **worker processes** (by CPU count or config).

- Asynchronous event-driven model — low memory, many connections
- Configuration: \`nginx -t\` → \`reload\` without downtime
- Modules: http, stream, mail

**Main files (Ubuntu/Debian):**
| Path | Purpose |
|------|------------|
| \`/etc/nginx/nginx.conf\` | Main config |
| \`/etc/nginx/sites-available/\` | Virtual hosts |
| \`/etc/nginx/sites-enabled/\` | Symlinks to active |
| \`/var/www/html/\` | Default web root |
| \`/var/log/nginx/\` | access.log, error.log |`,
    },
    {
      title: 'Installation and first start',
      content: ``,
      codes: [
        {
          language: 'bash',
          caption: 'Installation',
          code: `sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
curl -I http://localhost`,
        },
        {
          language: 'bash',
          caption: 'Managing the config',
          code: `sudo nginx -t              # проверка синтаксиса
sudo systemctl reload nginx  # применить без разрыва соединений
sudo systemctl restart nginx # полный рестарт
nginx -V                     # версия и модули`,
        },
      ],
    },
    {
      title: 'nginx.conf structure',
      content: `The config is **directives** and **blocks** \`{ }\`.

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

A directive ends with \`;\`. Blocks are nested.`,
      code: {
        language: 'nginx',
        caption: 'Minimal nginx.conf (fragment)',
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
      title: 'Static site',
      content: `The simplest **server block** — serving files from a directory.`,
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
          caption: 'Activating the site',
          code: `sudo mkdir -p /var/www/mysite
echo '<h1>Hello Nginx</h1>' | sudo tee /var/www/mysite/index.html
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx`,
        },
      ],
    },
    {
      title: 'server_name and virtual hosts',
      content: `**server_name** — which Host header Nginx uses to pick a server block.

- Exact match: \`server_name api.example.com;\`
- Wildcard: \`*.example.com\`
- Default: \`default_server\` on listen
- \`_\` — catch-all for invalid names

Multiple sites on one IP — **name-based virtual hosting**.`,
    },
    {
      title: 'Reverse proxy',
      content: `**Reverse proxy** — Nginx accepts client requests and proxies them to a backend application.

\`\`\`
Client → Nginx:443 → app:3000 (localhost or private network)
\`\`\`

**Why:**
- TLS on Nginx, app without SSL
- Single entry point
- Cache, rate limit, auth
- WebSocket support`,
      codes: [
        {
          language: 'nginx',
          caption: 'Proxy to a Node.js application',
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
      title: 'location: request routing',
      content: `**location prefixes:**
| Syntax | Priority | Example |
|-----------|-----------|--------|
| \`=\` | Exact | \`location = /health\` |
| \`^~\` | Prefix without regex | \`location ^~ /static/\` |
| \`~\` / \`~*\` | Regex (case sensitive/insensitive) | \`location ~ \\.php$\` |
| \`/\` | General prefix | \`location /\` |

**try_files** — try files in order, otherwise fallback.`,
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
      content: `**upstream** — a group of backend servers.`,
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
      title: 'SSL/TLS and HTTPS',
      content: `**TLS termination** on Nginx — the standard setup.

**Let's Encrypt + certbot** — free certificates, auto-renewal.`,
      codes: [
        {
          language: 'bash',
          caption: 'certbot for Nginx',
          code: `sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
# Автообновление:
sudo certbot renew --dry-run
sudo systemctl status certbot.timer`,
        },
        {
          language: 'nginx',
          caption: 'Manual SSL setup',
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
      title: 'Logging',
      content: `**access_log** — every request. **error_log** — errors.

**Log format** is configured via \`log_format\`.`,
      codes: [
        {
          language: 'nginx',
          caption: 'Custom log format',
          code: `log_format main '$remote_addr - $remote_user [$time_local] '
                '"$request" $status $body_bytes_sent '
                '"$http_referer" "$http_user_agent" '
                'rt=$request_time';

access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log warn;`,
        },
        {
          language: 'bash',
          caption: 'Analyzing logs',
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
      title: 'Caching and compression',
      content: `**gzip** — compress text responses.
**proxy_cache** — cache backend responses (careful with personal data).`,
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
      title: 'Rate limiting and security',
      content: `**limit_req** — protection from DDoS and brute force.
**client_max_body_size** — upload limit.

Hide the version: \`server_tokens off;\``,
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
      title: 'Common errors and troubleshooting',
      content: `| Symptom | Cause | Fix |
|---------|---------|---------|
| 502 Bad Gateway | Backend down | systemctl status app, curl backend |
| 504 Gateway Timeout | Backend slow | proxy_read_timeout, fix app |
| 413 Request Entity Too Large | Large upload | client_max_body_size |
| 403 Forbidden | File permissions | chown www-data, chmod |
| Redirect loop | proxy headers | X-Forwarded-Proto |

**Diagnosis:** \`nginx -t\`, \`error.log\`, \`curl -v\`, \`ss -tulpn\`.`,
      code: {
        language: 'bash',
        code: `sudo tail -50 /var/log/nginx/error.log
curl -v http://localhost
curl -v http://127.0.0.1:3000    # backend напрямую
sudo nginx -T | less              # полный конфиг с includes`,
      },
    },
    {
      title: 'Nginx in Docker and Kubernetes',
      content: `**Docker:** official \`nginx:alpine\` image, config via volume mount.

**Kubernetes:** Ingress resource + nginx-ingress controller — the same Nginx, managed by the K8s API.

server/location/upstream concepts are **the same** — only how the config is delivered changes.`,
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
      content: `- Always \`nginx -t\` before reload
- Separate server block per domain
- HTTPS everywhere, HSTS after verification
- Logs in structured format → Loki/ELK
- Monitoring: nginx-prometheus-exporter
- Version configs in Git (\`/etc/nginx\` → ansible or copy)
- Non-root in containers where possible`,
    },
  ],
  practice: [
    'Install nginx on a VPS. Create a static site in /var/www/portfolio with index.html and style.css',
    'Configure server_name (or IP). Check with curl -H "Host: ..." if needed',
    'Run a simple app on :3000 (python -m http.server). Set up reverse proxy / → :3000',
    'Add location = /health with return 200. Use it in a bash healthcheck',
    'Get SSL via certbot --nginx. Verify HTTP→HTTPS redirect and openssl s_client',
    'Enable gzip on. Compare response size: curl -H "Accept-Encoding: gzip" -I',
    'Analyze access.log: top 10 IPs and 404 count via awk',
    'Simulate 502: stop the backend, curl through nginx. Find the entry in error.log',
    'Create an upstream with 2 backends (two python -m http.server ports). Verify round-robin',
    'Version the nginx config in a Git repo. Document the config deploy steps',
  ],
  resources: [
    { title: 'Nginx Docs', url: 'https://nginx.org/en/docs/' },
  ],
  quiz: [
    {
      question: 'In which nginx block do you set server_name and listen?',
      options: ['server { }', 'http { } only', 'upstream { }', 'location / only'],
      answer: 'server { }',
    },
    {
      question: 'What does the proxy_pass directive do?',

      options: [
        'Proxies requests to the specified upstream (backend).',
        'Sets the virtual host name',
        'Enables gzip compression',
        'Opens the listen port',
      ],
      answer: 'Proxies requests to the specified upstream (backend).',
    },
    {
      question: 'How does nginx choose a location when several match?',
      options: [
        'By priority: exact > ^~ prefix > regex > longest prefix',
        'Always the first in the file',
        'At random',
        'Only longest prefix with no exceptions',
      ],
      answer: 'By priority: exact > ^~ prefix > regex > longest prefix',
    },
    {
      question: 'Why use upstream with multiple backends?',
      options: [
        'Load balancing and fault tolerance',
        'Faster Go compilation',
        'Automatic session storage in Redis',
        'Replacing TLS certificates',
      ],
      answer: 'Load balancing and fault tolerance',
    },
    {
      question: 'How do you check nginx config syntax before reload?',
      options: [
        'nginx -t',
        'nginx -s stop',
        'systemctl disable nginx',
        'kill -9 $(pidof nginx)',
      ],
      answer: 'nginx -t',
    },
    {
      question: 'What does return 301 in server/location do?',
      options: [
        'Permanent redirect to a new URL',
        'Internal rewrite without a response to the client',
        'Closes the connection',
        'Enables basic auth',
      ],
      answer: 'Permanent redirect to a new URL',
    },
    {
      question: 'What does the try_files directive do in a location?',
      options: [
        'Checks files/URIs in order and serves the first found or fallback',
        'Proxies HTTPS only',
        'Enables gzip',
        'Sets upstream health check',
      ],
      answer: 'Checks files/URIs in order and serves the first found or fallback',
      explanation: 'Often used for SPAs: try_files $uri /index.html.',
    },
    {
      question: 'Why configure client_max_body_size in nginx?',
      options: [
        'Limit maximum request body size (file uploads)',
        'Increase number of worker processes',
        'Enable HTTP/2',
        'Set static cache TTL',
      ],
      answer: 'Limit maximum request body size (file uploads)',
    },
    {
      question: 'What does the gzip on directive do?',
      options: [
        'Enables response compression for supported content types',
        'Encrypts TLS traffic',
        'Balances TCP at L4',
        'Writes access log to syslog',
      ],
      answer: 'Enables response compression for supported content types',
      explanation: 'Reduces traffic volume for text resources (HTML, CSS, JS).',
    },
    {
      question: 'How do you safely apply a new nginx configuration without downtime for active connections?',
      options: [
        'nginx -t && nginx -s reload (or systemctl reload nginx after successful check).',
        'nginx -s stop && nginx',
        'Edit config and kill -HUP without testing.',
        'systemctl restart nginx without syntax check.',
      ],
      answer: 'nginx -t && nginx -s reload (or systemctl reload nginx after successful check).',
    },
  ],
}

export default translation
