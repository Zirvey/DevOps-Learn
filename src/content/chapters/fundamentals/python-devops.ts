import type { Chapter } from '../../../types'

export const pythonDevopsChapter: Chapter = {
  id: 'python-devops',
  slug: 'python-for-devops',
  title: 'Python для DevOps: скрипты и автоматизация',
  moduleId: 'fundamentals',
  order: 7,
  duration: '5–7 часов',
  level: 'beginner',
  description:
    'Python в DevOps: скриптинг, requests, pathlib, subprocess, основы typing и небольшие CLI-утилиты для эксплуатации',
  sections: [
    {
      title: 'Зачем Python DevOps-инженеру',
      content: `**Python** — второй язык после Bash для многих команд: читаемый синтаксис, богатая экосистема, first-class в cloud SDK и Ansible.

**Типичные задачи:**
- Glue scripts: API → CSV → Slack notification
- Health checks и synthetic monitoring
- Parsing logs, batch rename, inventory reports
- Custom exporters для Prometheus
- Terraform/Ansible modules (не замена, а дополнение)

**Когда Bash достаточно:** 10 строк pipe. **Когда Python:** JSON/API, error handling, tests, reuse.

**Setup:** Python 3.11+, \`venv\`, \`pip install -r requirements.txt\`, formatter \`ruff\` / \`black\`.`,
    },
    {
      title: 'Структура скрипта и pathlib',
      content: `\`pathlib.Path\` — современная работа с путями (лучше чем \`os.path.join\`).

**Идиомы:**
- \`Path(__file__).resolve().parent\` — база проекта
- \`.glob('**/*.yaml')\` — обход конфигов
- \`.read_text(encoding='utf-8')\` / \`.write_text()\`

**argparse** или **typer** для CLI flags.

**Logging:** модуль \`logging\`, не \`print\` в production scripts — уровни, timestamps, stderr.`,
      code: {
        language: 'python',
        code: `from pathlib import Path
import logging

log = logging.getLogger(__name__)

def find_k8s_manifests(root: Path) -> list[Path]:
    return sorted(root.glob("deploy/**/*.yaml"))

def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    root = Path(__file__).resolve().parent
    for p in find_k8s_manifests(root):
        log.info("found %s", p)

if __name__ == "__main__":
    main()`,
      },
    },
    {
      title: 'subprocess: безопасный вызов команд',
      content: `**Правило:** не используй \`shell=True\` с пользовательским вводом — injection.

**Паттерны:**
- \`subprocess.run(["kubectl", "get", "pods", "-n", ns], check=True, capture_output=True, text=True)\`
- Timeout на hung commands
- Returncode handling vs exceptions

**Обёртка для DevOps CLI:**
Парси stdout построчно; для JSON используй \`kubectl ... -o json\` + \`json.loads\`.

Альтернатива: библиотеки (\`kubernetes\` client) когда нужна сложная логика.`,
      code: {
        language: 'python',
        code: `import subprocess
import json

def kubectl_json(args: list[str]) -> dict:
    cmd = ["kubectl", *args, "-o", "json"]
    proc = subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=60)
    return json.loads(proc.stdout)

pods = kubectl_json(["get", "pods", "-n", "prod"])
for item in pods.get("items", []):
    print(item["metadata"]["name"], item["status"].get("phase"))`,
      },
    },
    {
      title: 'HTTP с requests',
      content: `\`requests\` — de facto для REST checks.

**Практики:**
- Session для connection reuse
- \`timeout=(connect, read)\` всегда
- Retry с backoff для transient 5xx (urllib3 Retry или tenacity)
- Не логировать headers с tokens

**Use cases:** probe /health endpoints, GitHub API rate limit check, webhook notify.`,
      code: {
        language: 'python',
        code: `import requests

def check_health(url: str) -> bool:
    try:
        r = requests.get(url, timeout=(3, 10))
        r.raise_for_status()
        return r.json().get("status") == "ok"
    except requests.RequestException as exc:
        print(f"health check failed: {exc}")
        return False

if __name__ == "__main__":
    ok = check_health("https://api.example.com/health")
    raise SystemExit(0 if ok else 1)`,
      },
    },
    {
      title: 'Typing и читаемость',
      content: `**Type hints** (3.10+) делают скрипты maintainable в команде.

- \`def deploy(version: str, env: Literal["staging", "prod"]) -> int:\`
- \`TypedDict\`, \`dataclasses\` для структур конфига
- \`mypy\` / \`pyright\` в CI — optional но полезно

**Не over-engineer:** для 50-line script достаточно базовых hints на public functions.

**Tests:** \`pytest\` + \`monkeypatch\` для subprocess; \`responses\` / \`httpx mock\` для HTTP.`,
    },
    {
      title: 'Мини-CLI: health-check runner',
      content: `Собери утилиту **check-services**: читает YAML со списком URL, параллельно проверяет, exit code 1 если any fail — готово для cron или CI.

**Структура проекта:**
\`\`\`
healthrunner/
  pyproject.toml
  healthrunner/
    __main__.py
    checks.py
  tests/
  config.example.yaml
\`\`\`

**Packaging:** \`pip install -e .\` или single file + \`uv\`.

Этот паттерн повторяется в реальных repos: small focused tools вместо monster bash.`,
      code: {
        language: 'yaml',
        caption: 'config.example.yaml',
        code: `services:
  - name: api
    url: https://api.example.com/health
    expect_status: 200
  - name: docs
    url: https://docs.example.com/
    expect_status: 200`,
      },
    },
    {
      title: 'Интеграция в pipeline и безопасность',
      content: `- Secrets из env (\`os.environ["API_TOKEN"]\`), не hardcode
- \`.env\` только local; в CI — GitHub Secrets
- Pin dependencies в \`requirements.txt\` или \`pyproject.toml\` lock
- Shebang \`#!/usr/bin/env python3\` + executable bit для ad-hoc scripts

**vs Ansible:** Python когда нужна custom logic; Ansible когда idempotent config на fleet.

Дальше: boto3 (AWS), \`kubernetes\` client, \`hvac\` (Vault) — те же building blocks.`,
    },
  ],
  practice: [
    'Напиши скрипт: обход directory tree, вывод файлов > 100MB (pathlib + stat)',
    'Обёрни `kubectl get nodes -o json` — таблица Ready/NotReady',
    'Health checker для 3 URL с timeout и exit code для cron',
    'Добавь type hints и прогон mypy на одном модуле',
    'Mock subprocess в pytest — тест успеха и non-zero returncode',
    'CLI через argparse: `--env staging|prod` и `--verbose`',
    'Отправь POST webhook (Slack/Discord) при failed check',
  ],
  resources: [
    {
      title: 'Python — pathlib',
      url: 'https://docs.python.org/3/library/pathlib.html',
    },
    {
      title: 'Requests — Quickstart',
      url: 'https://requests.readthedocs.io/en/latest/user/quickstart/',
    },
    {
      title: 'Typer — CLI framework',
      url: 'https://typer.tiangolo.com/',
    },
  ],
}
