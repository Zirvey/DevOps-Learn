import type { Chapter } from '../../../types'

export const linuxChapter: Chapter = {
  id: 'linux',
  slug: 'linux',
  title: 'Linux: полное руководство',
  moduleId: 'fundamentals',
  order: 0,
  duration: '6–8 часов',
  level: 'beginner',
  description:
    'Глубокое изучение Linux для DevOps: установка, файловая система, пользователи, права, процессы, systemd, cron, пакеты, логи, диски и troubleshooting',
  sections: [
    {
      title: 'Зачем Linux в DevOps',
      content: `**Более 90% серверов** в интернете работают на Linux. Kubernetes nodes, Docker hosts, CI runners, облачные VM, embedded — везде Linux или его производные.

DevOps-инженер **ежедневно** в терминале:
- SSH на production-серверы
- Чтение логов при инцидентах
- Управление службами через systemd
- Написание bash-скриптов и cron-задач
- Диагностика CPU, памяти, дисков

> Windows и macOS полезны на рабочей станции, но **продакшен — это Linux**. WSL2 на Windows даёт Linux-окружение для обучения без отдельной VM.`,
    },
    {
      title: 'Выбор дистрибутива',
      content: `**Дистрибутив** — ОС на базе ядра Linux + пакетный менеджер + политики релизов.

| Семейство | Дистрибутивы | Пакетный менеджер | Где встречается |
|-----------|--------------|-------------------|-----------------|
| Debian | Ubuntu, Debian | apt | Стартапы, облако, desktop |
| RHEL | Rocky, Alma, CentOS Stream | dnf/yum | Enterprise, банки |
| SUSE | openSUSE | zypper | Европа, SAP |
| Arch | Arch, Manjaro | pacman | Энтузиасты, rolling |

**Для обучения DevOps рекомендуется Ubuntu LTS** (22.04 или 24.04):
- Огромная документация
- Большинство туториалов написано под Ubuntu
- LTS = 5 лет поддержки безопасности

**В продакшене** часто встречаются **Rocky/Alma** (замена CentOS) и **Amazon Linux** в AWS.`,
    },
    {
      title: 'Установка Linux',
      content: `**Варианты для обучения:**

**1. VPS в облаке** (рекомендуется для «настоящего» опыта)
- Hetzner, DigitalOcean, Timeweb — Ubuntu Server
- Публичный IP, настоящий SSH, firewall

**2. Локальная VM**
- VirtualBox, UTM (macOS), Hyper-V (Windows)
- Multipass: \`multipass launch --name devops -c 2 -m 4G -d 20G\`

**3. WSL2** (Windows)
- \`wsl --install -d Ubuntu-24.04\`

**Минимальные требования VM:** 2 vCPU, 2–4 GB RAM, 20 GB disk.

**При установке Ubuntu Server:**
- Разметка диска: guided — весь диск (для VM)
- Создай пользователя с sudo
- **OpenSSH server** — обязательно
- Без GUI (server edition) — экономия ресурсов`,
      code: {
        language: 'bash',
        caption: 'Проверка системы после установки',
        code: `uname -a                    # ядро и архитектура
cat /etc/os-release         # версия дистрибутива
hostnamectl                 # hostname, ОС
whoami && id                  # текущий пользователь
ip addr show                  # сетевые интерфейсы`,
      },
    },
    {
      title: 'Файловая система: обзор FHS',
      content: `**FHS** (Filesystem Hierarchy Standard) — стандарт расположения директорий в Linux.

| Путь | Назначение | DevOps-примеры |
|------|------------|----------------|
| \`/\` | Корень всего | — |
| \`/bin\`, \`/usr/bin\` | Исполняемые файлы | \`ls\`, \`curl\`, \`systemctl\` |
| \`/sbin\`, \`/usr/sbin\` | Системные бинарники (root) | \`iptables\`, \`fdisk\` |
| \`/etc\` | Конфигурации | \`nginx/\`, \`ssh/\`, \`systemd/\` |
| \`/var\` | Изменяемые данные | \`/var/log\`, \`/var/lib/docker\` |
| \`/home\` | Домашние каталоги пользователей | \`~/.ssh/\` |
| \`/root\` | Home суперпользователя | — |
| \`/tmp\` | Временные файлы (очищаются) | — |
| \`/opt\` | Стороннее ПО | \`/opt/app/\` |
| \`/proc\` | Виртуальная ФС — процессы, ядро | \`/proc/cpuinfo\` |
| \`/sys\` | Виртуальная ФС — устройства | — |
| \`/dev\` | Устройства | \`/dev/sda\`, \`/dev/null\` |
| \`/mnt\`, \`/media\` | Точки монтирования | — |

> В DevOps ты постоянно работаешь с \`/etc\` (конфиги), \`/var/log\` (логи) и \`/home\` (ключи SSH).`,
    },
    {
      title: 'Навигация и работа с файлами',
      content: `Освой эти команды до автоматизма — они основа всего остального.`,
      codes: [
        {
          language: 'bash',
          caption: 'Навигация',
          code: `pwd                         # print working directory
cd /var/log                 # абсолютный путь
cd ..                       # родительская директория
cd ~                        # домашняя директория
ls -lah                     # список: all, human-readable
tree -L 2 /etc/nginx        # дерево (установи: apt install tree)`,
        },
        {
          language: 'bash',
          caption: 'Создание, копирование, удаление',
          code: `mkdir -p /opt/app/{config,logs,data}
touch file.txt
cp -r src/ dst/
mv oldname newname
rm -rf /tmp/build-*          # осторожно! безвозвратно
ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/`,
        },
        {
          language: 'bash',
          caption: 'Просмотр и поиск',
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
      title: 'Inodes, hard links и soft links',
      content: `**Inode** — структура метаданных файла (права, владелец, размер, указатели на блоки данных). Имя файла — лишь ссылка на inode.

\`ls -i\` показывает номер inode. **Hard link** — ещё одно имя для того же inode.
**Soft link (symlink)** — отдельный файл, указывающий на путь.

| Тип | Команда | Особенности |
|-----|---------|-------------|
| Hard link | \`ln file hardlink\` | Только в пределах одной ФС |
| Soft link | \`ln -s target link\` | Может на другую ФС, может быть битым |

**Практика DevOps:** Nginx sites-enabled — классические symlinks на sites-available.`,
      code: {
        language: 'bash',
        code: `df -i                         # использование inodes (важно на мелких ФС!)
stat /etc/passwd              # детали inode
ln -s /var/log/nginx nginx-logs-link
readlink -f nginx-logs-link`,
      },
    },
    {
      title: 'Пользователи и группы',
      content: `Linux — **multi-user** система. Каждый процесс и файл принадлежит пользователю и группе.

**Ключевые файлы:**
- \`/etc/passwd\` — пользователи (имя, UID, home, shell)
- \`/etc/shadow\` — хэши паролей (только root)
- \`/etc/group\` — группы

**UID 0** = root (суперпользователь). **sudo** — выполнение команд от root с аудитом.

**Принцип least privilege:** приложения и люди работают с минимально необходимыми правами.`,
      codes: [
        {
          language: 'bash',
          caption: 'Управление пользователями',
          code: `sudo useradd -m -s /bin/bash deploy
sudo passwd deploy
sudo usermod -aG docker deploy    # добавить в группу
groups deploy
id deploy
sudo userdel -r olduser           # -r удаляет home`,
        },
        {
          language: 'bash',
          caption: 'sudo без пароля (осторожно, только для automation)',
          code: `# /etc/sudoers.d/deploy
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart myapp

# Проверка синтаксиса:
sudo visudo -c`,
        },
      ],
    },
    {
      title: 'Права доступа (permissions)',
      content: `Каждый файл имеет права для **owner / group / others**: **r**ead (4), **w**rite (2), e**x**ecute (1).

Пример: \`-rw-r--r--\` = файл, владелец rw-, группа r--, остальные r--.
Директория: \`drwxr-xr-x\` — **x** на директории = право «входить» (cd).

**Специальные биты:**
- **setuid** (4xxx) — процесс запускается от владельца файла
- **setgid** (2xxx) — на директории: новые файлы наследуют группу
- **sticky** (1xxx) — на \`/tmp\`: удалить может только владелец

**umask** — маска по умолчанию для новых файлов (обычно 022 → файлы 644, dirs 755).`,
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
          caption: 'ACL (расширенные права)',
          code: `sudo apt install acl
setfacl -m u:deploy:rx /var/log/myapp
getfacl /var/log/myapp`,
        },
      ],
    },
    {
      title: 'Процессы',
      content: `**Процесс** — запущенная программа. У каждого есть PID, PPID, пользователь, состояние.

**Состояния:** R (running), S (sleeping), D (uninterruptible I/O), Z (zombie), T (stopped).

**Сигналы:** SIGTERM (15) — вежливое завершение, SIGKILL (9) — немедленное убийство (нельзя перехватить), SIGHUP (1) — перезагрузка конфига (nginx).

> Zombie — процесс завершился, но родитель не вызвал wait(). Много zombies — баг в родительском процессе.`,
      codes: [
        {
          language: 'bash',
          caption: 'Просмотр процессов',
          code: `ps aux | head
ps aux | grep nginx
pgrep -a nginx
top                           # интерактивно, q — выход
htop                          # улучшенный top
pstree -p                     # дерево процессов`,
        },
        {
          language: 'bash',
          caption: 'Управление процессами',
          code: `kill 1234                     # SIGTERM
kill -9 1234                  # SIGKILL
killall nginx
nice -n 10 ./heavy-job.sh     # низкий приоритет
renice -n -5 -p 1234          # повысить приоритет (root)`,
        },
      ],
    },
    {
      title: 'systemd — менеджер служб',
      content: `**systemd** — init-система и менеджер служб в современных дистрибутивах (Ubuntu, Rocky, Debian).

**Unit-файлы** описывают службы: \`/etc/systemd/system/\` или \`/lib/systemd/system/\`.

**Типы units:** service, socket, timer, mount, target.

**Жизненный цикл службы:** inactive → active (running) → failed.`,
      codes: [
        {
          language: 'ini',
          caption: 'Пример unit-файла приложения',
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
          caption: 'Команды systemctl',
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
      title: 'Cron и systemd timers',
      content: `**cron** — классический планировщик. Формат crontab:

\`\`\`
# минута (0-59) час (0-23) день_месяца (1-31) месяц (1-12) день_недели (0-7, 0 и 7 = воскресенье)
* * * * * command
\`\`\`

**systemd timers** — современная альтернатива с интеграцией в journald и зависимостями.

| | cron | systemd timer |
|---|------|---------------|
| Логи | redirect в файл | journalctl |
| Пропущенный запуск | может накопиться | OnCalendar + Persistent |
| Зависимости | нет | After= других units |`,
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
      title: 'Пакетные менеджеры',
      content: `**Debian/Ubuntu — apt:**
- \`apt update\` — обновить индекс пакетов
- \`apt upgrade\` — установить обновления
- \`apt install pkg\` — установить
- \`apt remove / purge\` — удалить (purge — с конфигами)

**RHEL/Rocky — dnf:**
- Аналогично: \`dnf install\`, \`dnf update\`

**Полезно знать:** \`dpkg -l\`, \`apt search\`, \`apt show\`, \`which\`, \`dpkg -S\` (какому пакету принадлежит файл).`,
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
      title: 'Логи системы',
      content: `**Где искать логи:**

| Путь | Содержимое |
|------|------------|
| \`/var/log/syslog\` | Общие системные (Ubuntu) |
| \`/var/log/messages\` | Общие (RHEL) |
| \`/var/log/auth.log\` | SSH, sudo, auth |
| \`/var/log/kern.log\` | Ядро |
| \`/var/log/nginx/\` | Nginx access/error |
| journald | \`journalctl\` — бинарные логи systemd |

**Уровни syslog:** emerg, alert, crit, err, warning, notice, info, debug.

**Ротация:** logrotate (\`/etc/logrotate.d/\`) — сжатие и удаление старых логов.`,
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
      title: 'Управление дисками',
      content: `**Концепции:** раздел (partition), ФС (ext4, xfs), mount point, LVM (логические тома).

**Команды диагностики:**
- \`df -h\` — использование ФС
- \`du -sh *\` — размер директорий
- \`lsblk\` — блочные устройства
- \`fdisk -l\` — разделы (осторожно с записью!)

**Типичная проблема DevOps:** диск заполнен → приложение падает. Частые виновники: логи, Docker images, \`/tmp\`.`,
      codes: [
        {
          language: 'bash',
          caption: 'Диагностика диска',
          code: `df -h
df -i                           # inodes!
du -sh /var/* | sort -rh | head
du -sh /var/lib/docker/*
ncdu /                          # интерактивно (apt install ncdu)
find /var/log -type f -size +100M`,
        },
        {
          language: 'bash',
          caption: 'Монтирование',
          code: `lsblk -f
mount | grep sda
sudo mount /dev/sdb1 /mnt/data
# /etc/fstab — постоянное монтирование при загрузке
cat /etc/fstab`,
        },
      ],
    },
    {
      title: 'Память и swap',
      content: `**RAM** — быстрая volatile память. **Swap** — раздел/файл на диске для вытеснения страниц при нехватке RAM.

\`free -h\` — total, used, free, available, swap.
**Available** важнее **free** — Linux использует свободную RAM для cache.

**OOM Killer** — ядро убивает процесс при критической нехватке памяти. Смотри \`dmesg | grep -i oom\`.

**Для production:** мониторь memory pressure; swap на SSD — компромисс, на NVMe приемлем для малых инстансов.`,
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
      title: 'Сеть на уровне хоста',
      content: `Базовые команды до главы по сетям — для диагностики на сервере.

- \`ip addr\` — интерфейсы и IP
- \`ip route\` — таблица маршрутизации
- \`ss -tulpn\` — слушающие порты
- \`ping\`, \`traceroute\`, \`curl\`

Файлы: \`/etc/hosts\`, \`/etc/resolv.conf\` (DNS), Netplan (Ubuntu) в \`/etc/netplan/\`.`,
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
      title: 'Troubleshooting: методология',
      content: `**USE** (Brendan Gregg): для каждого ресурса — **U**tilization, **S**aturation, **E**rrors.

**Порядок при инциденте «сервер тормозит / не отвечает»:**

1. **Доступен ли хост?** ping, SSH
2. **Нагрузка:** \`uptime\` (load average), \`top\`
3. **CPU:** \`mpstat\`, \`pidstat\`, кто ест CPU?
4. **Память:** \`free\`, OOM в dmesg
5. **Диск:** \`df\`, \`iostat\`, await в iostat
6. **Сеть:** \`ss\`, \`ping\`, firewall
7. **Службы:** \`systemctl status\`, \`journalctl\`
8. **Логи приложения**

> Документируй находки. Не перезагружай сервер, пока не собрал данные (если не горит).`,
      codes: [
        {
          language: 'bash',
          caption: 'Чеклист команд',
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
      title: 'Безопасность на уровне ОС (основы)',
      content: `- Регулярные обновления: \`unattended-upgrades\` на Ubuntu
- Минимум открытых портов (см. главу SSH и firewall)
- Fail2ban — бан IP после неудачных SSH
- Аудит: \`last\`, \`lastlog\`, \`/var/log/auth.log\`
- Не работай постоянно под root

Эти темы углубляются в модулях Security и SSH.`,
    },
  ],
  practice: [
    'Установи Ubuntu Server 24.04 в Multipass или на VPS. Запиши IP, пользователя, способ входа в личный runbook',
    'Создай пользователя deploy, добавь в группу sudo. Настрой вход только по SSH-ключу (без пароля root)',
    'Создай структуру /opt/myapp/{bin,config,logs,data}. Установи права: bin — 755 root, logs — 775 группа app, config — 640',
    'Напиши systemd unit для скрипта, который каждые 30 сек пишет timestamp в /opt/myapp/logs/heartbeat.log. enable + start',
    'Установи nginx через apt. Найди конфиг, логи, процесс. Перезапусти через systemctl и проследи в journalctl',
    'Добавь cron-задачу: ежедневно в 2:00 архивировать /opt/myapp/logs в /opt/myapp/data/backup-YYYYMMDD.tar.gz',
    'Симулируй «диск полон»: создай большой файл в /tmp, проверь df. Найди и удали. Установи ncdu и просканируй /var',
    'Практика troubleshooting: запусти stress-ng (apt install stress-ng) на CPU и memory. Наблюдай top, free, uptime. Останови',
    'Найди 5 failed units (systemctl list-units --failed). Разбери причину одной через journalctl',
    'Составь одностраничный cheat sheet: 20 команд Linux, которые ты используешь чаще всего — для себя',
  ],
  resources: [
    { title: 'Linux Journey', url: 'https://linuxjourney.com' },
  ],
}
