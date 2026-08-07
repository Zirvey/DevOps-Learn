import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'SSH: secure remote access',
  description:
    'SSH for DevOps: keys, config, server hardening, jump hosts, agent forwarding, scp/rsync, and troubleshooting',
  duration: '3–4 hours',
  sections: [
    {
      title: 'What is SSH',
      content: `**SSH** (Secure Shell) is a protocol for **secure** remote shell access and file transfer.

- Port **22/TCP** by default
- Traffic encryption (modern cipher suites)
- Authentication: password or **public key** (preferred)

**DevOps uses SSH for:**
- Connecting to VPS and bare metal
- Deploying (git pull, docker pull on the server)
- Ansible (SSH by default)
- Tunneling (port forwarding)
- Jump hosts in private networks`,
    },
    {
      title: 'SSH architecture',
      content: `**Client** (\`ssh\`) ↔ **Server** (\`sshd\`)

**Handshake:**
1. Protocol versions
2. Key exchange (Diffie-Hellman) → session key
3. User authentication
4. Session (shell, command, subsystem)

**Host key** — the server fingerprint. On first connect it asks “trust?” — saved in \`~/.ssh/known_hosts\`.

> MITM attack: an attacker substitutes the host key. In production, verify the fingerprint out-of-band.`,
    },
    {
      title: 'Generating SSH keys',
      content: `**Asymmetric cryptography:** private key (secret) + public key (on the server).

**Ed25519** — modern algorithm (fast, short). RSA 4096 — legacy compatibility.`,
      codes: [
        {
          language: 'bash',
          caption: 'Creating keys',
          code: `# Ed25519 (рекомендуется):
ssh-keygen -t ed25519 -C "you@laptop" -f ~/.ssh/id_ed25519

# RSA (если требуют старые системы):
ssh-keygen -t rsa -b 4096 -C "you@laptop" -f ~/.ssh/id_rsa

# С passphrase (рекомендуется):
# Введи passphrase при создании — защита при краже файла ключа`,
        },
        {
          language: 'bash',
          caption: 'Key file permissions',
          code: `chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
# Приватный ключ — ТОЛЬКО владелец читает`,
        },
      ],
    },
    {
      title: 'Copying the key to the server',
      content: `The public key must be in \`~/.ssh/authorized_keys\` on the server.`,
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
      title: 'Connecting and basic commands',
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
      title: 'The ~/.ssh/config file',
      content: `**SSH config** — aliases, keys, jump hosts. Saves time and mistakes.`,
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
      content: `**Jump host** — an intermediate server for access into a private network.

\`\`\`
Laptop → Bastion (public IP) → Private server (10.x.x.x)
\`\`\`

**ProxyJump** (OpenSSH 7.3+):`,
      codes: [
        {
          language: 'bash',
          caption: 'Connecting via bastion',
          code: `ssh -J admin@bastion.example.com deploy@10.0.1.5

# Или в config (см. выше):
ssh prod-web

# Цепочка:
ssh -J jump1,jump2 target`,
        },
      ],
    },
    {
      title: 'SSH agent and forwarding',
      content: `**ssh-agent** — keeps decrypted keys in memory (not on disk).

\`ssh-add\` — add a key. On macOS, Keychain integration.

**Agent forwarding** (\`-A\`) — use the local key **through** a remote host further on.

> **Danger:** forwarding to an untrusted server — key compromise. Use only on the bastion.`,
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
      title: 'Port forwarding (tunnels)',
      content: `**Local forward:** local port → remote host:port through SSH.
**Remote forward:** remote port → local.
**Dynamic:** SOCKS proxy.`,
      codes: [
        {
          language: 'bash',
          caption: 'Tunnels',
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
      content: `**Goal:** minimize the attack surface. File: \`/etc/ssh/sshd_config\`.

**Recommendations:**
- Disable root login with a password
- Keys only (PasswordAuthentication no)
- Disable empty passwords
- Restrict users (AllowUsers)
- Change the port (security through obscurity — optional)
- MaxAuthTries 3`,
      codes: [
        {
          language: 'ssh-config',
          caption: 'sshd_config (fragment)',
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
          caption: 'Applying changes',
          code: `sudo sshd -t                    # проверка синтаксиса!
sudo systemctl reload sshd
# ВАЖНО: держи вторую SSH сессию открытой при первом применении`,
        },
      ],
    },
    {
      title: 'Fail2ban',
      content: `**Fail2ban** — bans an IP after N failed SSH attempts.

Installed on top of iptables/ufw. Reads \`/var/log/auth.log\`.`,
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
      title: 'rsync over SSH',
      content: `**rsync** — efficient file sync (delta transfer). Standard for deploys and backups.`,
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
      title: 'SSH in CI/CD',
      content: `GitHub Actions deploy to a VPS:
- Private key in Secrets
- \`ssh-action\` or native \`ssh\` in the workflow

**Practices:**
- Separate deploy key (read-only for git, limited user on the server)
- Don't reuse your personal key
- \`known_hosts\` — pin the host key in CI`,
      code: {
        language: 'yaml',
        caption: 'GitHub Actions deploy (simplified)',
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
      content: `| Problem | Diagnosis |
|----------|-------------|
| Connection refused | Is sshd running? firewall? port? |
| Permission denied | Key in authorized_keys? permissions 600/700? |
| Host key changed | Server reinstalled? MITM? |
| Timeout | Network, security group, wrong IP |
| Too many auth | fail2ban? MaxAuthTries? |

**Verbose:** \`ssh -vvv user@host\` — detailed handshake log.`,
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
      title: 'Key security',
      content: `- **Passphrase** on private keys
- **Don't commit** keys to Git (gitleaks!)
- Rotate keys on departure / compromise
- **Hardware keys** (YubiKey) for critical systems
- \`authorized_keys\` options: \`from="IP"\`, \`command="..."\`, \`no-port-forwarding\`

Example of a restricted key:
\`from="203.0.113.0/24",no-agent-forwarding ssh-ed25519 AAAA...\``,
    },
  ],
  practice: [
    'Generate an Ed25519 key with a passphrase. Add it to a VPS via ssh-copy-id. Log in without the user password',
    'Create ~/.ssh/config with alias myvps. Connect with: ssh myvps',
    'Disable PasswordAuthentication on the VPS (after verifying the key!). Check from a second session',
    'Set AllowUsers to only your user in sshd_config',
    'Install fail2ban. Make 4 failed logins — check the ban (fail2ban-client status sshd)',
    'Copy a file to the server via scp and back. Compare checksums (md5sum/sha256sum)',
    'Sync a directory to the server via rsync -avz --delete (test files!)',
    'Set up LocalForward: tunnel to port 80 on the VPS → localhost:8080. Open a browser',
    'Run ssh -vvv on an error (simulate wrong user) — find the line with the rejection reason',
    'Add your public key to authorized_keys manually (without ssh-copy-id) with correct chmod',
  ],
  resources: [],
  quiz: [
    {
      question: 'Where are public keys allowed for server login usually stored?',
      options: [
        '~/.ssh/authorized_keys',
        '~/.ssh/id_rsa.pub on the client',
        '/etc/hosts',
        '/var/log/auth.log only',
      ],
      answer: '~/.ssh/authorized_keys',
    },
    {
      question: 'What does ssh-agent do?',

      options: [
        'Keeps decrypted private keys in memory so you do not enter the passphrase on every connection.',
        'Generates a new key pair on every ssh connection',
        'Encrypts all network traffic between client and server',
        'Automatically adds public keys to authorized_keys on the server',
      ],
      answer:
        'Keeps decrypted private keys in memory so you do not enter the passphrase on every connection.',
    },
    {
      question: 'How do you safely copy a file to a remote host?',
      options: ['scp file user@host:/path', 'ftp file host', 'telnet host', 'nc -l file'],
      answer: 'scp file user@host:/path',
    },
    {
      question: 'Why set Host, HostName, and IdentityFile in ~/.ssh/config?',
      options: [
        'Simplify connecting and choose the right key/host',
        'Disable encryption',
        'Create a new user',
        'Change the root password',
      ],
      answer: 'Simplify connecting and choose the right key/host',
    },
    {
      question: 'Why is password login riskier than keys?',

      options: [
        'It is exposed to brute force and leaks; keys with a passphrase are more reliable when configured correctly.',
        'A password is always more reliable than a long RSA key',
        'SSH keys work only without a passphrase',
        'Passwords cannot be brute-forced at 6 characters long',
      ],
      answer:
        'It is exposed to brute force and leaks; keys with a passphrase are more reliable when configured correctly.',
    },
    {
      question: 'What does the -L option in ssh do?',
      options: [
        'Creates local port forwarding (a tunnel)',
        'Enables verbose logging',
        'Changes the login',
        'Disables host key checking',
      ],
      answer: 'Creates local port forwarding (a tunnel)',
    },
    {
      question: 'What does the -R option in ssh do (remote port forwarding)?',
      options: [
        'Forwards a port from the remote host back to the local machine',
        'Recursively copies directories',
        'Disables compression',
        'Changes host key algorithm',
      ],
      answer: 'Forwards a port from the remote host back to the local machine',
      explanation: 'Used when you need to give access to a service on your machine from a remote server.',
    },
    {
      question: 'Why verify the host fingerprint on first connection?',
      options: [
        'Ensure you are connecting to the correct server, not a MITM',
        'Speed up handshake',
        'Enable X11 forwarding',
        'Create a new SSH key',
      ],
      answer: 'Ensure you are connecting to the correct server, not a MITM',
    },
    {
      question: 'How do you add a private key to ssh-agent?',
      options: [
        'ssh-add ~/.ssh/id_ed25519 (or the path to the needed key).',
        'ssh-keygen -R hostname',
        'scp id_ed25519 to /tmp',
        'chmod 777 ~/.ssh',
      ],
      answer: 'ssh-add ~/.ssh/id_ed25519 (or the path to the needed key).',
    },
    {
      question: 'What does PermitRootLogin no in sshd_config do?',
      options: [
        'Prohibits direct login as root via SSH',
        'Disables all keys',
        'Allows only password',
        'Enables SFTP-only mode for everyone',
      ],
      answer: 'Prohibits direct login as root via SSH',
      explanation: 'Recommended security practice: sudo after logging in as a regular user.',
    },
  ],
}

export default translation
