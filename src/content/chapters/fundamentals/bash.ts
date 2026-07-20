import type { Chapter } from '../../../types'

export const bashChapter: Chapter = {
  id: 'bash',
  slug: 'bash',
  title: 'Bash-скрипты: полное руководство',
  moduleId: 'fundamentals',
  order: 3,
  duration: '5–6 часов',
  level: 'beginner',
  description:
    'Полный гайд по Bash для DevOps: синтаксис, переменные, условия, циклы, функции, обработка ошибок, аргументы, cron и best practices',
  sections: [
    {
      title: 'Зачем Bash в DevOps',
      content: `**Bash** — командная оболочка и язык скриптов Linux. Первый инструмент автоматизации:

- CI/CD steps (GitHub Actions \`run:\`)
- Entrypoint в Docker
- Cron и systemd ExecStartPre
- Glue между CLI-утилитами (curl, jq, kubectl)
- Быстрые одноразовые задачи на сервере

> Ansible и Python важны, но **80% мелкой автоматизации** — bash. Знание bash ускоряет всё остальное.`,
    },
    {
      title: 'Первый скрипт и shebang',
      content: `**Shebang** \`#!/bin/bash\` — интерпретатор. \`chmod +x\` — право на выполнение.`,
      codes: [
        {
          language: 'bash',
          caption: 'hello.sh',
          code: `#!/bin/bash
echo "Hello, DevOps!"

# Запуск:
# chmod +x hello.sh
# ./hello.sh
# или: bash hello.sh`,
        },
        {
          language: 'bash',
          caption: 'set -euo pipefail — обязательно',
          code: `#!/bin/bash
set -euo pipefail
# -e  exit при ошибке команды
# -u  ошибка при неопределённой переменной
# -o pipefail  ошибка в pipe не игнорируется

echo "Safe script"`,
        },
      ],
    },
    {
      title: 'Переменные',
      content: `**Присвоение:** без пробелов вокруг \`=\`.
**Использование:** \`$VAR\` или \`\${VAR}\` (предпочтительно).
**Локальные** — только внутри функций: \`local var=value\`.`,
      codes: [
        {
          language: 'bash',
          caption: 'Переменные и подстановка',
          code: `NAME="World"
echo "Hello, \${NAME}!"
echo "Length: \${#NAME}"

# Значение по умолчанию:
PORT="\${PORT:-8080}"
# Обязательный параметр:
: "\${DATABASE_URL:?DATABASE_URL is required}"

# Command substitution:
NOW=$(date +%Y-%m-%d)
FILES=$(ls /var/log | wc -l)
# или устаревшее: NOW=\`date\``,
        },
      ],
    },
    {
      title: 'Аргументы и exit codes',
      content: `**Позиционные параметры:** \`$0\` script name, \`$1\`...\`$9\`, \`$@\` все, \`$#\` количество.

**Exit code:** 0 = успех, не-0 = ошибка. \`$?\` — код последней команды.`,
      codes: [
        {
          language: 'bash',
          caption: 'Парсинг аргументов',
          code: `#!/bin/bash
set -euo pipefail

usage() {
  echo "Usage: $0 [-v] [-n count] filename"
  exit 1
}

VERBOSE=false
COUNT=1
while getopts "vn:" opt; do
  case $opt in
    v) VERBOSE=true ;;
    n) COUNT="$OPTARG" ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))

[[ $# -eq 1 ]] || usage
FILE="$1"
$VERBOSE && echo "Processing $FILE x$COUNT"`,
        },
      ],
    },
    {
      title: 'Условия и тесты',
      content: `**[[ ]]** — расширенный test (предпочтительно в bash).
**[ ]** — POSIX test.

**Файлы:** \`-f\` file, \`-d\` dir, \`-e\` exists, \`-r\` readable, \`-x\` executable.
**Строки:** \`=, !=, -z empty, -n non-empty.
**Числа:** \`-eq, -ne, -lt, -gt\`.`,
      codes: [
        {
          language: 'bash',
          caption: 'if / elif / else',
          code: `if [[ -f /etc/nginx/nginx.conf ]]; then
  echo "Nginx installed"
elif command -v nginx &>/dev/null; then
  echo "Nginx in PATH"
else
  echo "Nginx not found"
  exit 1
fi

# Короткая форма:
[[ -d "$LOG_DIR" ]] || mkdir -p "$LOG_DIR"`,
        },
        {
          language: 'bash',
          caption: 'case',
          code: `case "$ENV" in
  production|prod)  REPLICAS=3 ;;
  staging|stage)    REPLICAS=1 ;;
  development|dev)  REPLICAS=1 ;;
  *) echo "Unknown ENV: $ENV"; exit 1 ;;
esac`,
        },
      ],
    },
    {
      title: 'Циклы',
      content: `**for**, **while**, **until** — основные циклы.`,
      codes: [
        {
          language: 'bash',
          caption: 'for и while',
          code: `for file in /var/log/*.log; do
  [[ -f "$file" ]] || continue
  echo "Lines in $file: $(wc -l < "$file")"
done

for i in {1..5}; do echo "Iteration $i"; done

while read -r line; do
  echo ">> $line"
done < /etc/hosts

# Бесконечный с break:
while true; do
  curl -sf http://localhost/health && break
  sleep 5
done`,
        },
      ],
    },
    {
      title: 'Массивы',
      content: `Bash поддерживает **indexed** и **associative** (bash 4+) массивы.`,
      code: {
        language: 'bash',
        code: `SERVERS=("web1" "web2" "web3")
echo "First: \${SERVERS[0]}"
echo "All: \${SERVERS[@]}"
echo "Count: \${#SERVERS[@]}"

declare -A REGION_MAP=(
  [us-east]="virginia"
  [eu-west]="ireland"
)
echo "\${REGION_MAP[eu-west]}"`,
      },
    },
    {
      title: 'Функции',
      content: `Функции делают скрипты **читаемыми** и **тестируемыми**.`,
      codes: [
        {
          language: 'bash',
          caption: 'Функции с local и return',
          code: `log() {
  local level="$1"
  shift
  echo "[$(date -Iseconds)] [$level] $*"
}

log INFO "Starting backup"

is_port_open() {
  local host="$1" port="$2"
  nc -z "$host" "$port" 2>/dev/null
}

if is_port_open localhost 80; then
  log INFO "Port 80 is open"
fi`,
        },
      ],
    },
    {
      title: 'Обработка ошибок и trap',
      content: `**trap** — выполнить код при сигнале или выходе. Cleanup temp files, lock files.`,
      codes: [
        {
          language: 'bash',
          caption: 'trap и err handling',
          code: `#!/bin/bash
set -euo pipefail

TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT
trap 'echo "Interrupted"; exit 130' INT TERM

cleanup() {
  echo "Cleaning up..."
}
trap cleanup EXIT

# Явная проверка:
if ! curl -sf http://api/health; then
  echo "Health check failed" >&2
  exit 1
fi`,
        },
      ],
    },
    {
      title: 'Ввод/вывод и перенаправление',
      content: `| pipe, \`>\` overwrite, \`>>\` append, \`2>\` stderr, \`&>\` both.

**/dev/null** — «в никуда». **/dev/stderr** — stderr.`,
      code: {
        language: 'bash',
        code: `command > output.log 2>&1        # stdout+stderr в файл
command 2>/dev/null               # скрыть stderr
{ echo "line1"; echo "line2"; } > file.txt
tee output.log                    # stdout и в файл
exec 1> >(logger -t myscript)     # логи в syslog`,
      },
    },
    {
      title: 'Работа с текстом: grep, sed, awk',
      content: `Классический **unix toolkit** в скриптах.`,
      codes: [
        {
          language: 'bash',
          caption: 'grep, sed, awk',
          code: `# grep
grep -E "error|warn" /var/log/app.log
grep -c "ERROR" app.log

# sed — замена
sed -i 's/localhost/production.db/g' config.yaml
sed -n '10,20p' file.txt          # строки 10-20

# awk
awk '{print $1, $NF}' access.log
awk -F: '{print $1}' /etc/passwd
df -h | awk '$5+0 > 80 {print $0}'  # диск > 80%`,
        },
      ],
    },
    {
      title: 'jq и работа с JSON',
      content: `API и cloud CLI возвращают JSON. **jq** — парсер в bash.`,
      code: {
        language: 'bash',
        code: `curl -s https://api.github.com/repos/git/git | jq -r '.stargazers_count'
curl -s ... | jq '.items[] | select(.status=="ok") | .name'

# Переменная из JSON:
VERSION=$(cat package.json | jq -r '.version')`,
      },
    },
    {
      title: 'Параллельное выполнение',
      content: `**xargs -P**, **GNU parallel**, фоновые задачи \`&\` и \`wait\`.`,
      code: {
        language: 'bash',
        code: `# Фоновые задачи:
for host in web1 web2 web3; do
  ssh "$host" 'uptime' &
done
wait
echo "All done"

# xargs parallel:
cat hosts.txt | xargs -P 4 -I {} curl -sf http://{}/health`,
      },
    },
    {
      title: 'Cron: планирование скриптов',
      content: `Скрипты bash + cron = классическая автоматизация.`,
      codes: [
        {
          language: 'bash',
          caption: 'crontab примеры',
          code: `# crontab -e
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin
MAILTO=admin@example.com

# Каждый день 3:00 — бэкап
0 3 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1

# Каждые 5 минут — health
*/5 * * * * /opt/scripts/healthcheck.sh

# По понедельникам 9:00
0 9 * * 1 /opt/scripts/weekly-report.sh`,
        },
      ],
    },
    {
      title: 'Шаблон production-скрипта',
      content: `Собираем best practices в один шаблон:`,
      code: {
        language: 'bash',
        caption: 'backup.sh — эталонный скрипт',
        code: `#!/bin/bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="/var/log/backup.log"
readonly BACKUP_DIR="/backup"
readonly SOURCE_DIR="/opt/app/data"
readonly RETENTION_DAYS=7

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG_FILE"; }
die() { log "ERROR: $*"; exit 1; }

main() {
  log "Backup started"
  [[ -d "$SOURCE_DIR" ]] || die "Source not found: $SOURCE_DIR"
  mkdir -p "$BACKUP_DIR"

  local timestamp archive
  timestamp=$(date +%Y%m%d_%H%M%S)
  archive="$BACKUP_DIR/backup_\${timestamp}.tar.gz"

  tar -czf "$archive" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")"
  log "Created: $archive"

  find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
  log "Backup completed"
}

main "$@"`,
      },
    },
    {
      title: 'Shellcheck и отладка',
      content: `**ShellCheck** — линтер bash (shellcheck.net, \`apt install shellcheck\`).

**Отладка:** \`bash -x script.sh\` или \`set -x\` внутри скрипта.`,
      code: {
        language: 'bash',
        code: `shellcheck myscript.sh
bash -n myscript.sh              # syntax check only
bash -x myscript.sh 2>&1 | tee debug.log`,
      },
    },
    {
      title: 'Bash vs Python: когда что',
      content: `| Bash | Python |
|------|--------|
| Glue CLI, cron, CI one-liners | Сложная логика, API clients |
| < 100 строк, вызовы утилит | Парсинг, тесты, библиотеки |
| Нет зависимостей | requests, boto3, kubernetes client |

**Правило:** если скрипт > 200 строк или нужны unit-тесты — рассмотри Python.`,
    },
    {
      title: 'Безопасность скриптов',
      content: `- Никогда не хардкодь секреты — env vars, vault
- Кавычки вокруг \`"$var"\` — защита от word splitting
- Не запускай \`curl | bash\` из интернета без проверки
- \`set -u\` ловит опечатки в переменных
- Минимальные права: не запускай от root без нужды
- Валидируй входные данные`,
    },
  ],
  practice: [
    'Напиши скрипт backup.sh: tar.gz директории, ротация 7 дней, логирование, set -euo pipefail',
    'Напиши healthcheck.sh: curl API, проверка порта nc, exit 1 при ошибке — добавь в cron */5',
    'Скрипт с getopts: -v verbose, -f file. Выведи содержимое файла построчно с номерами',
    'Функция retry: 3 попытки curl с sleep 2 между ними',
    'Парсинг access.log nginx: top 10 IP через awk/sort/uniq',
    'Скрипт disk-alert.sh: если df > 85% — echo alert (потом можно mail)',
    'Используй trap EXIT для удаления temp dir в скрипте с mktemp',
    'Прогони свой скрипт через shellcheck и исправь все warning',
    'Параллельный ping 5 хостов из файла hosts.txt с wait в конце',
    'Рефакторинг: разбей монолитный скрипт на функции: log, die, main',
  ],
  resources: [],
}
