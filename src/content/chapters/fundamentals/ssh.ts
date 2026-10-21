import type { Chapter } from '../../../types'

export const sshChapter: Chapter = {
  id: 'ssh',
  slug: 'ssh',
  title: 'SSH: безопасный удалённый доступ',
  moduleId: 'fundamentals',
  order: 4,
  duration: '3–4 часа',
  level: 'beginner',
  description:
    'SSH для DevOps: ключи, config, hardening сервера, jump hosts, agent forwarding, scp/rsync и troubleshooting',
  sections: [
    {
      title: 'Что такое SSH',
      content: `**SSH** (Secure Shell) — протокол **безопасного** удалённого доступа к shell и передачи файлов.

- Порт **22/TCP** по умолчанию
- Шифрование трафика (современные cipher suites)
- Аутентификация: пароль или **публичный ключ** (предпочтительно)

**DevOps использует SSH для:**
- Подключения к VPS и bare metal
- Деплоя (git pull, docker pull на сервере)
- Ansible (по умолчанию SSH)
- Туннелирования (port forwarding)
- Jump hosts в приватных сетях`,
    },
    {
      title: 'Архитектура SSH',
      content: `**Клиент** (\`ssh\`) ↔ **Сервер** (\`sshd\`)

**Handshake:**
1. Версии протокола
2. Обмен ключами (Diffie-Hellman) → session key
3. Аутентификация пользователя
4. Сессия (shell, command, subsystem)

**Host key** — отпечаток сервера. При первом подключении спрашивает «доверять?» — сохраняется в \`~/.ssh/known_hosts\`.

> MITM-атака: злоумышленник подменяет host key. В продакшене сверяй fingerprint out-of-band.`,
    },
    {
      title: 'Генерация SSH-ключей',
      content: `**Асимметричная криптография:** приватный ключ (секрет) + публичный ключ (на сервере).

**Ed25519** — современный алгоритм (быстрый, короткий). RSA 4096 — legacy совместимость.`,
      codes: [
        {
          language: 'bash',
          caption: 'Создание ключей',
          code: `# Ed25519 (рекомендуется):
ssh-keygen -t ed25519 -C "you@laptop" -f ~/.ssh/id_ed25519

# RSA (если требуют старые системы):
ssh-keygen -t rsa -b 4096 -C "you@laptop" -f ~/.ssh/id_rsa

# С passphrase (рекомендуется):
# Введи passphrase при создании — защита при краже файла ключа`,
        },
        {
          language: 'bash',
          caption: 'Права на файлы ключей',
          code: `chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
# Приватный ключ — ТОЛЬКО владелец читает`,
        },
      ],
    },
    {
      title: 'Копирование ключа на сервер',
      content: `Публичный ключ должен быть в \`~/.ssh/authorized_keys\` на сервере.`,
      codes: [
        {
          language: 'bash',
          caption: 'ssh-copy-id',
          code: `ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server.example.com

# Вручную:
cat ~/.ssh/id_ed25519.pub | ssh user@server 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'`,
        },
      ],
    },
    {
      title: 'Подключение и базовые команды',
      content: ``,
      codes: [
        {
          language: 'bash',
          caption: 'ssh, scp, sftp',
          code: `ssh user@192.168.1.10
ssh -i ~/.ssh/custom_key user@host
ssh user@host 'uname -a'              # удалённая команда

# Копирование файлов:
scp file.txt user@host:/remote/path/
scp -r ./local_dir user@host:/remote/
scp user@host:/remote/file.txt ./

# SFTP интерактивно:
sftp user@host`,
        },
      ],
    },
    {
      title: 'Файл ~/.ssh/config',
      content: `**SSH config** — алиасы, ключи, jump hosts. Экономит время и ошибки.`,
      code: {
        language: 'ssh-config',
        caption: '~/.ssh/config',
        code: `Host myserver
  HostName 203.0.113.50
  User deploy
  IdentityFile ~/.ssh/id_ed25519
  Port 22

Host prod-web
  HostName 10.0.1.5
  User ubuntu
  ProxyJump bastion
  IdentityFile ~/.ssh/prod_key

Host bastion
  HostName bastion.example.com
  User admin
  IdentityFile ~/.ssh/id_ed25519

Host *.internal
  User deploy
  StrictHostKeyChecking accept-new`,
      },
    },
    {
      title: 'Jump host (bastion)',
      content: `**Jump host** — промежуточный сервер для доступа в приватную сеть.

\`\`\`
Laptop → Bastion (публичный IP) → Private server (10.x.x.x)
\`\`\`

**ProxyJump** (OpenSSH 7.3+):`,
      codes: [
        {
          language: 'bash',
          caption: 'Подключение через bastion',
          code: `ssh -J admin@bastion.example.com deploy@10.0.1.5

# Или в config (см. выше):
ssh prod-web

# Цепочка:
ssh -J jump1,jump2 target`,
        },
      ],
    },
    {
      title: 'SSH agent и forwarding',
      content: `**ssh-agent** — хранит расшифрованные ключи в памяти (не на диске).

\`ssh-add\` — добавить ключ. На macOS Keychain интеграция.

**Agent forwarding** (\`-A\`) — использовать локальный ключ **через** удалённый хост дальше.

> **Опасность:** forwarding на недоверенный сервер — компрометация ключа. Используй только на bastion.`,
      code: {
        language: 'bash',
        code: `eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
ssh-add -l

# Forwarding (осторожно!):
ssh -A user@bastion
# с bastion: ssh internal-server`,
      },
    },
    {
      title: 'Port forwarding (туннели)',
      content: `**Local forward:** локальный порт → удалённый хост:порт через SSH.
**Remote forward:** удалённый порт → локальный.
**Dynamic:** SOCKS proxy.`,
      codes: [
        {
          language: 'bash',
          caption: 'Туннели',
          code: `# Local: localhost:5432 → remote db:5432
ssh -L 5432:db.internal:5432 user@bastion

# Теперь: psql -h localhost -p 5432

# Remote forward (доступ к твоему localhost с сервера):
ssh -R 8080:localhost:3000 user@server

# SOCKS proxy:
ssh -D 1080 user@server`,
        },
      ],
    },
    {
      title: 'Hardening sshd',
      content: `**Цель:** минимизировать поверхность атаки. Файл: \`/etc/ssh/sshd_config\`.

**Рекомендации:**
- Отключить root login по паролю
- Только ключи (PasswordAuthentication no)
- Отключить пустые пароли
- Ограничить пользователей (AllowUsers)
- Сменить порт (security through obscurity — опционально)
- MaxAuthTries 3`,
      codes: [
        {
          language: 'ssh-config',
          caption: 'sshd_config (фрагмент)',
          code: `PermitRootLogin prohibit-password
# или: PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
AllowUsers deploy admin
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2`,
        },
        {
          language: 'bash',
          caption: 'Применение изменений',
          code: `sudo sshd -t                    # проверка синтаксиса!
sudo systemctl reload sshd
# ВАЖНО: держи вторую SSH сессию открытой при первом применении`,
        },
      ],
    },
    {
      title: 'Fail2ban',
      content: `**Fail2ban** — банит IP после N неудачных попыток SSH.

Устанавливается поверх iptables/ufw. Читает \`/var/log/auth.log\`.`,
      code: {
        language: 'bash',
        code: `sudo apt install fail2ban
sudo systemctl enable fail2ban

# /etc/fail2ban/jail.local
# [sshd]
# enabled = true
# maxretry = 3
# bantime = 3600

sudo fail2ban-client status sshd`,
      },
    },
    {
      title: 'rsync через SSH',
      content: `**rsync** — эффективная синхронизация файлов (delta transfer). Стандарт для деплоя и бэкапов.`,
      code: {
        language: 'bash',
        code: `# Локальный → удалённый:
rsync -avz --delete ./build/ user@server:/var/www/

# -a archive, -v verbose, -z compress, --delete удалить лишнее на dest

# Dry run:
rsync -avzn ./build/ user@server:/var/www/

# С exclude:
rsync -avz --exclude 'node_modules' ./ user@server:/app/`,
      },
    },
    {
      title: 'SSH в CI/CD',
      content: `GitHub Actions деплой на VPS:
- Private key в Secrets
- \`ssh-action\` или нативный \`ssh\` в workflow

**Практики:**
- Отдельный deploy key (read-only для git, limited user на сервере)
- Не reuse личного ключа
- \`known_hosts\` — pin host key в CI`,
      code: {
        language: 'yaml',
        caption: 'GitHub Actions deploy (упрощённо)',
        code: `- name: Deploy via SSH
  env:
    SSH_KEY: \${{ secrets.DEPLOY_KEY }}
  run: |
    install -m 600 -D /dev/stdin ~/.ssh/id_ed25519 <<< "$SSH_KEY"
    ssh-keyscan -H server.example.com >> ~/.ssh/known_hosts
    ssh deploy@server.example.com 'cd /app && git pull && docker compose up -d'`,
      },
    },
    {
      title: 'Troubleshooting SSH',
      content: `| Проблема | Диагностика |
|----------|-------------|
| Connection refused | sshd запущен? firewall? порт? |
| Permission denied | ключ в authorized_keys? права 600/700? |
| Host key changed | сервер переустановлен? MITM? |
| Timeout | сеть, security group, wrong IP |
| Too many auth | fail2ban? MaxAuthTries? |

**Verbose:** \`ssh -vvv user@host\` — детальный лог handshake.`,
      code: {
        language: 'bash',
        code: `ssh -vvv user@host 2>&1 | tail -50
sudo systemctl status sshd
sudo journalctl -u sshd -n 50
sudo tail -f /var/log/auth.log
ss -tulpn | grep :22`,
      },
    },
    {
      title: 'Безопасность ключей',
      content: `- **Passphrase** на приватные ключи
- **Не коммить** ключи в Git (gitleaks!)
- Ротация ключей при увольнении / компрометации
- **Hardware keys** (YubiKey) для критичных систем
- \`authorized_keys\` options: \`from="IP"\`, \`command="..."\`, \`no-port-forwarding\`

Пример ограниченного ключа:
\`from="203.0.113.0/24",no-agent-forwarding ssh-ed25519 AAAA...\``,
    },
  ],
  practice: [
    'Сгенерируй Ed25519 ключ с passphrase. Добавь на VPS через ssh-copy-id. Войди без пароля пользователя',
    'Создай ~/.ssh/config с алиасом myvps. Подключайся: ssh myvps',
    'Отключи PasswordAuthentication на VPS (после проверки ключа!). Проверь с второй сессии',
    'Настрой AllowUsers только для своего пользователя в sshd_config',
    'Установи fail2ban. Сделай 4 неудачных входа — проверь ban (fail2ban-client status sshd)',
    'Скопируй файл на сервер через scp и обратно. Сравни checksum (md5sum/sha256sum)',
    'Синхронизируй директорию на сервер через rsync -avz --delete (тестовые файлы!)',
    'Настрой LocalForward: туннель к порту 80 на VPS → localhost:8080. Открой браузер',
    'Выполни ssh -vvv при ошибке (симулируй wrong user) — найди строку с причиной отказа',
    'Добавь свой публичный ключ в authorized_keys вручную (без ssh-copy-id) с правильными chmod',
  ],
  resources: [],
}
