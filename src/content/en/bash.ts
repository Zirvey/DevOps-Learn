import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Bash scripts: complete guide',
  description:
    'Complete Bash guide for DevOps: syntax, variables, conditionals, loops, functions, error handling, arguments, cron, and best practices',
  duration: '5–6 hours',
  sections: [
    {
      title: 'Why Bash in DevOps',
      content: `**Bash** is the Linux command shell and scripting language. The first automation tool:

- CI/CD steps (GitHub Actions \`run:\`)
- Entrypoint in Docker
- Cron and systemd ExecStartPre
- Glue between CLI utilities (curl, jq, kubectl)
- Quick one-off tasks on a server

> Ansible and Python matter, but **80% of small automation** is bash. Knowing bash speeds up everything else.`,
    },
    {
      title: 'First script and shebang',
      content: `**Shebang** \`#!/bin/bash\` — the interpreter. \`chmod +x\` — execute permission.`,
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
          caption: 'set -euo pipefail — required',
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
      title: 'Variables',
      content: `**Assignment:** no spaces around \`=\`.
**Usage:** \`$VAR\` or \`\${VAR}\` (preferred).
**Locals** — only inside functions: \`local var=value\`.`,
      codes: [
        {
          language: 'bash',
          caption: 'Variables and substitution',
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
      title: 'Arguments and exit codes',
      content: `**Positional parameters:** \`$0\` script name, \`$1\`...\`$9\`, \`$@\` all, \`$#\` count.

**Exit code:** 0 = success, non-0 = error. \`$?\` — code of the last command.`,
      codes: [
        {
          language: 'bash',
          caption: 'Parsing arguments',
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
      title: 'Conditionals and tests',
      content: `**[[ ]]** — extended test (preferred in bash).
**[ ]** — POSIX test.

**Files:** \`-f\` file, \`-d\` dir, \`-e\` exists, \`-r\` readable, \`-x\` executable.
**Strings:** \`=, !=, -z empty, -n non-empty.
**Numbers:** \`-eq, -ne, -lt, -gt\`.`,
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
      title: 'Loops',
      content: `**for**, **while**, **until** — the main loops.`,
      codes: [
        {
          language: 'bash',
          caption: 'for and while',
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
      title: 'Arrays',
      content: `Bash supports **indexed** and **associative** (bash 4+) arrays.`,
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
      title: 'Functions',
      content: `Functions make scripts **readable** and **testable**.`,
      codes: [
        {
          language: 'bash',
          caption: 'Functions with local and return',
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
      title: 'Error handling and trap',
      content: `**trap** — run code on a signal or exit. Cleanup temp files, lock files.`,
      codes: [
        {
          language: 'bash',
          caption: 'trap and err handling',
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
      title: 'I/O and redirection',
      content: `| pipe, \`>\` overwrite, \`>>\` append, \`2>\` stderr, \`&>\` both.

**/dev/null** — “to nowhere”. **/dev/stderr** — stderr.`,
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
      title: 'Working with text: grep, sed, awk',
      content: `The classic **unix toolkit** in scripts.`,
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
      title: 'jq and working with JSON',
      content: `APIs and cloud CLIs return JSON. **jq** is the parser in bash.`,
      code: {
        language: 'bash',
        code: `curl -s https://api.github.com/repos/git/git | jq -r '.stargazers_count'
curl -s ... | jq '.items[] | select(.status=="ok") | .name'

# Переменная из JSON:
VERSION=$(cat package.json | jq -r '.version')`,
      },
    },
    {
      title: 'Parallel execution',
      content: `**xargs -P**, **GNU parallel**, background jobs \`&\` and \`wait\`.`,
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
      title: 'Cron: scheduling scripts',
      content: `Bash scripts + cron = classic automation.`,
      codes: [
        {
          language: 'bash',
          caption: 'crontab examples',
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
      title: 'Production script template',
      content: `Putting best practices into one template:`,
      code: {
        language: 'bash',
        caption: 'backup.sh — reference script',
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
      title: 'Shellcheck and debugging',
      content: `**ShellCheck** — bash linter (shellcheck.net, \`apt install shellcheck\`).

**Debugging:** \`bash -x script.sh\` or \`set -x\` inside the script.`,
      code: {
        language: 'bash',
        code: `shellcheck myscript.sh
bash -n myscript.sh              # syntax check only
bash -x myscript.sh 2>&1 | tee debug.log`,
      },
    },
    {
      title: 'Bash vs Python: when to use which',
      content: `| Bash | Python |
|------|--------|
| Glue CLI, cron, CI one-liners | Complex logic, API clients |
| < 100 lines, calling utilities | Parsing, tests, libraries |
| No dependencies | requests, boto3, k8s client |

**Rule of thumb:** if the script is > 200 lines or you need unit tests — consider Python.`,
    },
    {
      title: 'Script security',
      content: `- Never hardcode secrets — env vars, vault
- Quotes around \`"$var"\` — protection from word splitting
- Don't run \`curl | bash\` from the internet without review
- \`set -u\` catches typos in variable names
- Least privilege: don't run as root unless needed
- Validate input data`,
    },
  ],
  practice: [
    'Write backup.sh: tar.gz a directory, 7-day rotation, logging, set -euo pipefail',
    'Write healthcheck.sh: curl an API, check a port with nc, exit 1 on failure — add to cron */5',
    'Script with getopts: -v verbose, -f file. Print file contents line by line with numbers',
    'retry function: 3 curl attempts with sleep 2 between them',
    'Parse nginx access.log: top 10 IPs via awk/sort/uniq',
    'disk-alert.sh script: if df > 85% — echo alert (later you can mail)',
    'Use trap EXIT to remove a temp dir in a script with mktemp',
    'Run your script through shellcheck and fix all warnings',
    'Parallel ping of 5 hosts from hosts.txt with wait at the end',
    'Refactor: split a monolithic script into functions: log, die, main',
  ],
  resources: [],
  quiz: [
    {
      question: 'What does echo $? print right after a successful command?',
      options: ['0', '1', 'The last PID code', 'An empty string'],
      answer: '0',
      explanation: 'In bash, 0 means successful completion.',
    },
    {
      question: 'How does [[ ]] differ from [ ] in bash?',
      options: [
        '[[ ]] is a built-in construct with safer parsing and support for regex/logic without escaping.',
        '[ ] is built-in while [[ ]] calls external test',
        '[[ ]] works only in sh, [ ] only in bash',
        'No difference, they are synonyms',
      ],
      answer:
        '[[ ]] is a built-in construct with safer parsing and support for regex/logic without escaping.',
    },
    {
      question: 'How do you read command-line arguments in a script?',
      options: ['$1, $2, ... or $@ / $#', 'Only argv[]', 'Via import sys', 'You cannot in bash'],
      answer: '$1, $2, ... or $@ / $#',
    },
    {
      question: 'What does set -euo pipefail do at the start of a script?',
      options: [
        'Exit on error, forbid uninitialized variables, account for errors in pipes',
        'Enables debug output',
        'Disables all aliases',
        'Switches the shell to zsh',
      ],
      answer: 'Exit on error, forbid uninitialized variables, account for errors in pipes',
    },
    {
      question: 'How do you capture command output into a variable?',
      options: [
        'var=$(command) or var=`command` (prefer $()).',
        'var=command without parentheses',
        'var={{ command }}',
        'var=[command]',
      ],
      answer: 'var=$(command) or var=`command` (prefer $()).',
    },
    {
      question: 'What is a heredoc (<<EOF) used for?',
      options: [
        'Pass multiline input to a command or into a file',
        'Create a symbolic link',
        'Start a background process',
        'Compress an archive',
      ],
      answer: 'Pass multiline input to a command or into a file',
    },
    {
      question: 'What does cmd1 | cmd2 do in bash?',
      options: [
        'Pipes stdout of cmd1 to stdin of cmd2 (pipe)',
        'Always runs commands in parallel',
        'Logical AND between exit codes',
        'Redirects stderr to a file',
      ],
      answer: 'Pipes stdout of cmd1 to stdin of cmd2 (pipe)',
      explanation: 'Classic pattern: cat file | grep pattern | wc -l.',
    },
    {
      question: 'How do you loop over *.log files in the current directory in bash?',
      options: [
        'for f in *.log; do ...; done',
        'while *.log do',
        'loop files *.log',
        'foreach log in bash only',
      ],
      answer: 'for f in *.log; do ...; done',
    },
    {
      question: 'What is the difference between > and >> in output redirection?',
      options: [
        '> overwrites the file, >> appends to the end',
        '>> deletes the file',
        '> works only with stderr',
        'No difference',
      ],
      answer: '> overwrites the file, >> appends to the end',
      explanation: 'Important not to overwrite the log on a script rerun.',
    },
    {
      question: 'How do you safely handle paths with spaces when copying in a script?',
      options: [
        'Wrap the variable in double quotes: cp "$src" "$dst".',
        'Use single quotes only: cp \'$src\' \'$dst\'.',
        'Escape spaces with backslash without quoting variables.',
        'Use glob expansion: cp $src $dst always works.',
      ],
      answer: 'Wrap the variable in double quotes: cp "$src" "$dst".',
    },
  ],
}

export default translation
