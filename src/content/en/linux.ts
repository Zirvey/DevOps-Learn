import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Linux: complete guide',
  duration: '6–8 hours',
  description:
    'Deep Linux study for DevOps: installation, filesystem, users, permissions, processes, systemd, cron, packages, logs, disks, and troubleshooting',
  sections: [
    {
      title: 'Why Linux in DevOps',
      content: `**Over 90% of servers** on the internet run Linux. Kubernetes nodes, Docker hosts, CI runners, cloud VMs, embedded — everywhere Linux or its derivatives.

A DevOps engineer is **daily** in the terminal:
- SSH to production servers
- Reading logs during incidents
- Managing services via systemd
- Writing bash scripts and cron jobs
- Diagnosing CPU, memory, disks

> Windows and macOS are useful on a workstation, but **production is Linux**. WSL2 on Windows gives a Linux environment for learning without a separate VM.`,
    },
    {
      title: 'Choosing a distribution',
      content: `A **distribution** is an OS based on the Linux kernel + a package manager + release policies.

| Family | Distros | Package manager | Where you see it |
|--------|---------|-----------------|------------------|
| Debian | Ubuntu, Debian | apt | Startups, cloud, desktop |
| RHEL | Rocky, Alma, CentOS Stream | dnf/yum | Enterprise, banks |
| SUSE | openSUSE | zypper | Europe, SAP |
| Arch | Arch, Manjaro | pacman | Enthusiasts, rolling |

**For learning DevOps, Ubuntu LTS is recommended** (22.04 or 24.04):
- Huge documentation
- Most tutorials are written for Ubuntu
- LTS = 5 years of security support

**In production** you often see **Rocky/Alma** (CentOS replacements) and **Amazon Linux** on AWS.`,
    },
    {
      title: 'Installing Linux',
      content: `**Options for learning:**

**1. Cloud VPS** (recommended for "real" experience)
- Hetzner, DigitalOcean, Timeweb — Ubuntu Server
- Public IP, real SSH, firewall

**2. Local VM**
- VirtualBox, UTM (macOS), Hyper-V (Windows)
- Multipass: \`multipass launch --name devops -c 2 -m 4G -d 20G\`

**3. WSL2** (Windows)
- \`wsl --install -d Ubuntu-24.04\`

**Minimum VM requirements:** 2 vCPU, 2–4 GB RAM, 20 GB disk.

**When installing Ubuntu Server:**
- Disk layout: guided — whole disk (for a VM)
- Create a user with sudo
- **OpenSSH server** — required
- No GUI (server edition) — saves resources`,
      code: {
        language: 'bash',
        caption: 'System check after install',
        code: `uname -a                    # ядро и архитектура
cat /etc/os-release         # версия дистрибутива
hostnamectl                 # hostname, ОС
whoami && id                  # текущий пользователь
ip addr show                  # сетевые интерфейсы`,
      },
    },
    {
      title: 'Filesystem: FHS overview',
      content: `**FHS** (Filesystem Hierarchy Standard) — the standard layout of directories in Linux.

| Path | Purpose | DevOps examples |
|------|---------|-----------------|
| \`/\` | Root of everything | — |
| \`/bin\`, \`/usr/bin\` | Executables | \`ls\`, \`curl\`, \`systemctl\` |
| \`/sbin\`, \`/usr/sbin\` | System binaries (root) | \`iptables\`, \`fdisk\` |
| \`/etc\` | Configurations | \`nginx/\`, \`ssh/\`, \`systemd/\` |
| \`/var\` | Mutable data | \`/var/log\`, \`/var/lib/docker\` |
| \`/home\` | User home directories | \`~/.ssh/\` |
| \`/root\` | Superuser home | — |
| \`/tmp\` | Temporary files (cleaned) | — |
| \`/opt\` | Third-party software | \`/opt/app/\` |
| \`/proc\` | Virtual FS — processes, kernel | \`/proc/cpuinfo\` |
| \`/sys\` | Virtual FS — devices | — |
| \`/dev\` | Devices | \`/dev/sda\`, \`/dev/null\` |
| \`/mnt\`, \`/media\` | Mount points | — |

> In DevOps you constantly work with \`/etc\` (configs), \`/var/log\` (logs), and \`/home\` (SSH keys).`,
    },
    {
      title: 'Navigation and file operations',
      content: `Master these commands until they are automatic — they underpin everything else.`,
      codes: [
        {
          language: 'bash',
          caption: 'Navigation',
          code: `pwd                         # print working directory
cd /var/log                 # абсолютный путь
cd ..                       # родительская директория
cd ~                        # домашняя директория
ls -lah                     # список: all, human-readable
tree -L 2 /etc/nginx        # дерево (установи: apt install tree)`,
        },
        {
          language: 'bash',
          caption: 'Create, copy, delete',
          code: `mkdir -p /opt/app/{config,logs,data}
touch file.txt
cp -r src/ dst/
mv oldname newname
rm -rf /tmp/build-*          # осторожно! безвозвратно
ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/`,
        },
        {
          language: 'bash',
          caption: 'Viewing and searching',
          code: `cat /etc/hostname
less /var/log/syslog        # q — выход, /pattern — поиск
head -n 20 file.log
tail -f /var/log/nginx/access.log   # follow в реальном времени
find /etc -name "*.conf" 2>/dev/null
grep -r "error" /var/log/nginx/
wc -l access.log            # подсчёт строк`,
        },
      ],
    },
    {
      title: 'Inodes, hard links, and soft links',
      content: `An **inode** is a file metadata structure (permissions, owner, size, pointers to data blocks). The filename is only a reference to an inode.

\`ls -i\` shows the inode number. A **hard link** is another name for the same inode.
A **soft link (symlink)** is a separate file pointing to a path.

| Type | Command | Notes |
|------|---------|-------|
| Hard link | \`ln file hardlink\` | Only within one filesystem |
| Soft link | \`ln -s target link\` | Can cross filesystems, can be broken |

**DevOps practice:** Nginx sites-enabled are classic symlinks to sites-available.`,
      code: {
        language: 'bash',
        code: `df -i                         # использование inodes (важно на мелких ФС!)
stat /etc/passwd              # детали inode
ln -s /var/log/nginx nginx-logs-link
readlink -f nginx-logs-link`,
      },
    },
    {
      title: 'Users and groups',
      content: `Linux is a **multi-user** system. Every process and file belongs to a user and a group.

**Key files:**
- \`/etc/passwd\` — users (name, UID, home, shell)
- \`/etc/shadow\` — password hashes (root only)
- \`/etc/group\` — groups

**UID 0** = root (superuser). **sudo** — run commands as root with audit.

**Least privilege principle:** applications and people run with the minimum required rights.`,
      codes: [
        {
          language: 'bash',
          caption: 'Managing users',
          code: `sudo useradd -m -s /bin/bash deploy
sudo passwd deploy
sudo usermod -aG docker deploy    # добавить в группу
groups deploy
id deploy
sudo userdel -r olduser           # -r удаляет home`,
        },
        {
          language: 'bash',
          caption: 'Passwordless sudo (careful — automation only)',
          code: `# /etc/sudoers.d/deploy
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart myapp

# Проверка синтаксиса:
sudo visudo -c`,
        },
      ],
    },
    {
      title: 'Permissions',
      content: `Every file has permissions for **owner / group / others**: **r**ead (4), **w**rite (2), e**x**ecute (1).

Example: \`-rw-r--r--\` = file, owner rw-, group r--, others r--.
Directory: \`drwxr-xr-x\` — **x** on a directory = right to "enter" (cd).

**Special bits:**
- **setuid** (4xxx) — process runs as the file owner
- **setgid** (2xxx) — on a directory: new files inherit the group
- **sticky** (1xxx) — on \`/tmp\`: only the owner can delete

**umask** — default mask for new files (usually 022 → files 644, dirs 755).`,
      codes: [
        {
          language: 'bash',
          caption: 'chmod, chown, chgrp',
          code: `ls -la file.txt
chmod 644 file.txt              # rw-r--r--
chmod u+x script.sh             # добавить execute владельцу
chmod -R g-w /opt/app           # рекурсивно
chown user:group file
chown -R www-data:www-data /var/www`,
        },
        {
          language: 'bash',
          caption: 'ACL (extended permissions)',
          code: `sudo apt install acl
setfacl -m u:deploy:rx /var/log/myapp
getfacl /var/log/myapp`,
        },
      ],
    },
    {
      title: 'Processes',
      content: `A **process** is a running program. Each has a PID, PPID, user, and state.

**States:** R (running), S (sleeping), D (uninterruptible I/O), Z (zombie), T (stopped).

**Signals:** SIGTERM (15) — polite shutdown, SIGKILL (9) — immediate kill (cannot be caught), SIGHUP (1) — reload config (nginx).

> A zombie is a process that finished but the parent did not call wait(). Many zombies — a bug in the parent process.`,
      codes: [
        {
          language: 'bash',
          caption: 'Viewing processes',
          code: `ps aux | head
ps aux | grep nginx
pgrep -a nginx
top                           # интерактивно, q — выход
htop                          # улучшенный top
pstree -p                     # дерево процессов`,
        },
        {
          language: 'bash',
          caption: 'Managing processes',
          code: `kill 1234                     # SIGTERM
kill -9 1234                  # SIGKILL
killall nginx
nice -n 10 ./heavy-job.sh     # низкий приоритет
renice -n -5 -p 1234          # повысить приоритет (root)`,
        },
      ],
    },
    {
      title: 'systemd — service manager',
      content: `**systemd** is the init system and service manager in modern distros (Ubuntu, Rocky, Debian).

**Unit files** describe services: \`/etc/systemd/system/\` or \`/lib/systemd/system/\`.

**Unit types:** service, socket, timer, mount, target.

**Service lifecycle:** inactive → active (running) → failed.`,
      codes: [
        {
          language: 'ini',
          caption: 'Example application unit file',
          code: `[Unit]
Description=My App
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/opt/app
ExecStart=/opt/app/bin/server
Restart=on-failure
RestartSec=5
Environment=PORT=8080

[Install]
WantedBy=multi-user.target`,
        },
        {
          language: 'bash',
          caption: 'systemctl commands',
          code: `sudo systemctl daemon-reload
sudo systemctl start myapp
sudo systemctl stop myapp
sudo systemctl restart myapp
sudo systemctl enable myapp      # автозапуск
sudo systemctl disable myapp
systemctl status myapp
systemctl is-active nginx
journalctl -u myapp -f --since "1 hour ago"`,
        },
      ],
    },
    {
      title: 'Cron and systemd timers',
      content: `**cron** is the classic scheduler. Crontab format:

\`\`\`
# минута (0-59) час (0-23) день_месяца (1-31) месяц (1-12) день_недели (0-7, 0 и 7 = воскресенье)
* * * * * command
\`\`\`

**systemd timers** are a modern alternative with journald integration and dependencies.

| | cron | systemd timer |
|---|------|---------------|
| Logs | redirect to file | journalctl |
| Missed run | may pile up | OnCalendar + Persistent |
| Dependencies | none | After= other units |`,
      codes: [
        {
          language: 'bash',
          caption: 'crontab',
          code: `crontab -l                    # список задач текущего user
crontab -e                    # редактировать
# Каждый день в 3:00
0 3 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
# Каждые 5 минут
*/5 * * * * /opt/scripts/healthcheck.sh

# Системный cron:
ls /etc/cron.d/
cat /etc/crontab`,
        },
      ],
    },
    {
      title: 'Package managers',
      content: `**Debian/Ubuntu — apt:**
- \`apt update\` — refresh package index
- \`apt upgrade\` — install updates
- \`apt install pkg\` — install
- \`apt remove / purge\` — remove (purge — with configs)

**RHEL/Rocky — dnf:**
- Similar: \`dnf install\`, \`dnf update\`

**Useful to know:** \`dpkg -l\`, \`apt search\`, \`apt show\`, \`which\`, \`dpkg -S\` (which package owns a file).`,
      codes: [
        {
          language: 'bash',
          caption: 'Ubuntu/Debian',
          code: `sudo apt update
sudo apt upgrade -y
sudo apt install -y nginx curl git htop tree
apt search nginx
apt show nginx
dpkg -l | grep nginx
which nginx
sudo apt autoremove -y`,
        },
        {
          language: 'bash',
          caption: 'Rocky/Alma (dnf)',
          code: `sudo dnf check-update
sudo dnf install -y nginx
dnf search nginx
rpm -qa | grep nginx`,
        },
      ],
    },
    {
      title: 'System logs',
      content: `**Where to look for logs:**

| Path | Contents |
|------|----------|
| \`/var/log/syslog\` | General system (Ubuntu) |
| \`/var/log/messages\` | General (RHEL) |
| \`/var/log/auth.log\` | SSH, sudo, auth |
| \`/var/log/kern.log\` | Kernel |
| \`/var/log/nginx/\` | Nginx access/error |
| journald | \`journalctl\` — binary systemd logs |

**Syslog levels:** emerg, alert, crit, err, warning, notice, info, debug.

**Rotation:** logrotate (\`/etc/logrotate.d/\`) — compress and delete old logs.`,
      codes: [
        {
          language: 'bash',
          caption: 'journalctl',
          code: `journalctl -xe                  # последние ошибки
journalctl -u nginx -f
journalctl --since "2024-01-01" --until "2024-01-02"
journalctl -p err -b              # ошибки с последней загрузки
journalctl --disk-usage
sudo journalctl --vacuum-size=500M`,
        },
      ],
    },
    {
      title: 'Disk management',
      content: `**Concepts:** partition, filesystem (ext4, xfs), mount point, LVM (logical volumes).

**Diagnostic commands:**
- \`df -h\` — filesystem usage
- \`du -sh *\` — directory sizes
- \`lsblk\` — block devices
- \`fdisk -l\` — partitions (careful with writes!)

**Typical DevOps problem:** disk full → app crashes. Common culprits: logs, Docker images, \`/tmp\`.`,
      codes: [
        {
          language: 'bash',
          caption: 'Disk diagnostics',
          code: `df -h
df -i                           # inodes!
du -sh /var/* | sort -rh | head
du -sh /var/lib/docker/*
ncdu /                          # интерактивно (apt install ncdu)
find /var/log -type f -size +100M`,
        },
        {
          language: 'bash',
          caption: 'Mounting',
          code: `lsblk -f
mount | grep sda
sudo mount /dev/sdb1 /mnt/data
# /etc/fstab — постоянное монтирование при загрузке
cat /etc/fstab`,
        },
      ],
    },
    {
      title: 'Memory and swap',
      content: `**RAM** is fast volatile memory. **Swap** is a disk partition/file for paging when RAM is low.

\`free -h\` — total, used, free, available, swap.
**Available** matters more than **free** — Linux uses free RAM for cache.

**OOM Killer** — the kernel kills a process under critical memory pressure. Check \`dmesg | grep -i oom\`.

**For production:** monitor memory pressure; swap on SSD is a tradeoff; on NVMe it is acceptable for small instances.`,
      code: {
        language: 'bash',
        code: `free -h
vmstat 1 5
cat /proc/meminfo | head
dmesg | tail -50 | grep -i -E 'oom|kill'
# Процессы по памяти:
ps aux --sort=-%mem | head -10`,
      },
    },
    {
      title: 'Host-level networking',
      content: `Basic commands before the networking chapter — for diagnostics on a server.

- \`ip addr\` — interfaces and IPs
- \`ip route\` — routing table
- \`ss -tulpn\` — listening ports
- \`ping\`, \`traceroute\`, \`curl\`

Files: \`/etc/hosts\`, \`/etc/resolv.conf\` (DNS), Netplan (Ubuntu) in \`/etc/netplan/\`.`,
      code: {
        language: 'bash',
        code: `ip addr show
ip route show
ss -tulpn | grep LISTEN
curl -I http://localhost
hostname -I`,
      },
    },
    {
      title: 'Troubleshooting methodology',
      content: `**USE** (Brendan Gregg): for each resource — **U**tilization, **S**aturation, **E**rrors.

**Order for an incident "server is slow / not responding":**

1. **Is the host reachable?** ping, SSH
2. **Load:** \`uptime\` (load average), \`top\`
3. **CPU:** \`mpstat\`, \`pidstat\`, who eats CPU?
4. **Memory:** \`free\`, OOM in dmesg
5. **Disk:** \`df\`, \`iostat\`, await in iostat
6. **Network:** \`ss\`, \`ping\`, firewall
7. **Services:** \`systemctl status\`, \`journalctl\`
8. **Application logs**

> Document findings. Do not reboot the server until you have collected data (unless it is on fire).`,
      codes: [
        {
          language: 'bash',
          caption: 'Command checklist',
          code: `uptime
top -bn1 | head -20
free -h
df -h
ss -tulpn
systemctl list-units --failed
journalctl -p err -b --no-pager | tail -30
dmesg | tail -20`,
        },
      ],
    },
    {
      title: 'OS-level security (basics)',
      content: `- Regular updates: \`unattended-upgrades\` on Ubuntu
- Minimum open ports (see SSH and firewall chapters)
- Fail2ban — ban IPs after failed SSH attempts
- Audit: \`last\`, \`lastlog\`, \`/var/log/auth.log\`
- Do not work as root all the time

These topics deepen in the Security and SSH modules.`,
    },
  ],
  practice: [
    'Install Ubuntu Server 24.04 in Multipass or on a VPS. Record IP, user, and login method in a personal runbook',
    'Create a deploy user, add to the sudo group. Configure key-only SSH login (no root password)',
    'Create /opt/myapp/{bin,config,logs,data}. Set permissions: bin — 755 root, logs — 775 group app, config — 640',
    'Write a systemd unit for a script that every 30s writes a timestamp to /opt/myapp/logs/heartbeat.log. enable + start',
    'Install nginx via apt. Find the config, logs, process. Restart via systemctl and follow in journalctl',
    'Add a cron job: daily at 2:00 archive /opt/myapp/logs to /opt/myapp/data/backup-YYYYMMDD.tar.gz',
    'Simulate "disk full": create a large file in /tmp, check df. Find and delete it. Install ncdu and scan /var',
    'Troubleshooting practice: run stress-ng (apt install stress-ng) on CPU and memory. Watch top, free, uptime. Stop it',
    'Find 5 failed units (systemctl list-units --failed). Debug one cause via journalctl',
    'Make a one-page cheat sheet: 20 Linux commands you use most often — for yourself',
  ],
  resources: [
    { title: 'Linux Journey', url: 'https://linuxjourney.com' },
  ],
  quiz: [
    {
      question: 'What do the permissions rwxr-xr-- mean for a file?',
      options: [
        'Owner: rwx, group: r-x, others: r--',
        'Everyone has full access',
        'Only root can read',
        'A directory with execute for everyone',
      ],
      answer: 'Owner: rwx, group: r-x, others: r--',
      explanation: 'Three triads: owner/group/others, each rwx.',
    },
    {
      question: 'Which command shows processes listening on TCP ports?',
      options: ['ss -tlnp', 'ls -la', 'df -h', 'uname -a'],
      answer: 'ss -tlnp',
    },
    {
      question: 'How does a hard link differ from a symbolic link (symlink)?',
      options: [
        'A hard link points to the same inode; a symlink is a separate file with a path to the target.',
        'A hard link is always a directory; a symlink is always a file',
        'A symlink points to the same inode; a hard link stores only a path',
        'There is no difference on Linux',
      ],
      answer:
        'A hard link points to the same inode; a symlink is a separate file with a path to the target.',
    },
    {
      question: 'What does chmod +x script.sh do?',
      options: [
        'Adds execute permission for all categories',
        'Makes the file root-only',
        'Deletes the file',
        'Changes the owner to root',
      ],
      answer: 'Adds execute permission for all categories',
    },
    {
      question: 'What are systemd unit files used for?',
      options: [
        'Managing services, autostart, and dependencies',
        'Editing Kubernetes YAML manifests',
        'Creating Docker networks',
        'Configuring BGP routing',
      ],
      answer: 'Managing services, autostart, and dependencies',
    },
    {
      question: 'How do you view the last 50 lines of a log file in real time?',

      options: [
        'tail -f -n 50 /path/to/log or tail -n 50 -f /path/to/log',
        'head -n 50 /path/to/log',
        'cat /path/to/log | grep ERROR',
        'less /path/to/log without follow',
      ],
      answer: 'tail -f -n 50 /path/to/log or tail -n 50 -f /path/to/log',
    },
    {
      question: 'What does df -h show?',
      options: [
        'Filesystem disk space usage in human-readable format',
        'List of running processes',
        'TCP packet routing',
        'Contents of crontab',
      ],
      answer: 'Filesystem disk space usage in human-readable format',
      explanation: 'Useful when diagnosing "disk full" on servers and in containers.',
    },
    {
      question: 'How do you find files larger than 100 MB in the current directory recursively?',
      options: [
        'find . -type f -size +100M',
        'ls -la | grep 100M',
        'du -sh only',
        'grep -r 100M .',
      ],
      answer: 'find . -type f -size +100M',
    },
    {
      question: 'What does chown user:group file do?',
      options: [
        'Changes file owner and group',
        'Changes only rwx permissions',
        'Creates a hard link',
        'Mounts a partition',
      ],
      answer: 'Changes file owner and group',
      explanation: 'Often needed after copying files from root or in Docker volumes.',
    },
    {
      question: 'How do you restart the nginx systemd service and check its status?',


      options: [
        'sudo systemctl restart nginx && sudo systemctl status nginx',
        'sudo service nginx reload && ps aux | grep nginx',
        'sudo killall nginx && nginx -t',
        'sudo systemctl enable nginx && journalctl -f',
      ],
      answer: 'sudo systemctl restart nginx && sudo systemctl status nginx',
    },
  ],
  terminalLab: {
    id: 'linux-basics',
    title: 'Basic Linux commands',
    intro:
      'This is a training terminal: commands are not executed on a server, but syntax is checked the same way as in a real SSH session.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~',
    initialOutput: [
      'Welcome to the Linux syntax trainer.',
      'Follow the steps in order — type a command and press Enter.',
    ],
    steps: [
      {
        id: 'ls',
        instruction: 'List files and directories in the current directory.',
        match: { kind: 'normalized' },
        accept: ['ls'],
        hint: 'A two-letter command: list — directory contents.',
        explanation:
          'ls shows file and folder names in the current directory. On servers you often add flags, e.g. ls -la for permissions and hidden files.',
        fakeOutput: ['deploy.sh  logs  nginx.conf  README.md'],
      },
      {
        id: 'pwd',
        instruction: 'Print the full path of the current working directory.',
        match: { kind: 'normalized' },
        accept: ['pwd'],
        hint: 'Print working directory — “where am I in the filesystem.”',
        explanation:
          'pwd (print working directory) returns an absolute path. Useful after cd and when writing scripts.',
        fakeOutput: ['/home/student'],
      },
      {
        id: 'mkdir-logs',
        instruction: 'Create a directory named logs.',
        match: { kind: 'normalized' },
        accept: ['mkdir logs'],
        hint: 'make directory — one command and the new folder name separated by a space.',
        explanation:
          'mkdir creates a directory. For nested paths use mkdir -p so it does not fail if a parent already exists.',
        fakeOutput: [''],
      },
      {
        id: 'chmod-deploy',
        instruction:
          'Make deploy.sh executable: chmod 755 deploy.sh or chmod +x deploy.sh.',
        match: {
          kind: 'anyOf',
          items: [
            { match: { kind: 'normalized' }, accept: ['chmod 755 deploy.sh'] },
            { match: { kind: 'normalized' }, accept: ['chmod +x deploy.sh'] },
          ],
        },
        accept: [],
        hint: '755 sets rwxr-xr-x; +x adds the execute bit for everyone allowed to read the file.',
        explanation:
          'chmod changes permissions. 755 is typical for deploy scripts; +x is a quick way to make a file executable.',
        fakeOutput: [''],
      },
      {
        id: 'systemctl-nginx',
        instruction: 'Check the nginx service status via systemctl.',
        match: { kind: 'normalized' },
        accept: ['systemctl status nginx'],
        hint: 'systemctl status <service-name> — standard for systemd on modern distros.',
        explanation:
          'systemctl status shows whether the service is running, recent logs, and the exit code. To restart use systemctl restart nginx.',
        fakeOutput: [
          '● nginx.service - A high performance web server and a reverse proxy server',
          '     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)',
          '     Active: active (running) since Fri 2026-07-17 10:00:00 UTC; 2h ago',
        ],
      },
    ],
  },
}

export default translation
