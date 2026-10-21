import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Python for DevOps: scripting and automation',
  description:
    'Python for DevOps: scripting, requests, pathlib, subprocess, typing basics, and small CLI tools for operations',
  duration: '5–7 hours',
  sections: [
    {
      title: 'Why Python for DevOps',
      content: `**Python** is the second language after Bash for many teams: readable syntax, a rich ecosystem, and first-class support in cloud SDKs and Ansible.

**Typical tasks:**
- Glue scripts: API → CSV → Slack notification
- Health checks and synthetic monitoring
- Log parsing, batch rename, inventory reports
- Custom Prometheus exporters
- Terraform/Ansible modules (complement, not replacement)

**When Bash is enough:** a 10-line pipe. **When Python wins:** JSON/API work, structured error handling, tests, and reuse.

**Setup:** Python 3.11+, \`venv\`, \`pip install -r requirements.txt\`, formatter \`ruff\` / \`black\`.`,
    },
    {
      title: 'Script structure and pathlib',
      content: `\`pathlib.Path\` is the modern way to work with paths (prefer it over \`os.path.join\`).

**Idioms:**
- \`Path(__file__).resolve().parent\` — project base
- \`.glob('**/*.yaml')\` — walk configs
- \`.read_text(encoding='utf-8')\` / \`.write_text()\`

Use **argparse** or **typer** for CLI flags.

**Logging:** the \`logging\` module, not \`print\` in production scripts — levels, timestamps, stderr.`,
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
      title: 'subprocess safely',
      content: `**Rule:** never use \`shell=True\` with user input — injection risk.

**Patterns:**
- \`subprocess.run(["kubectl", "get", "pods", "-n", ns], check=True, capture_output=True, text=True)\`
- Timeouts on hung commands
- Returncode handling vs exceptions

**DevOps CLI wrapper:** parse stdout line by line; for JSON use \`kubectl ... -o json\` + \`json.loads\`.

Alternative: libraries (\`kubernetes\` client) when the logic gets complex.`,
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
      title: 'HTTP with requests',
      content: `\`requests\` is the de facto library for REST checks.

**Practices:**
- Session for connection reuse
- Always set \`timeout=(connect, read)\`
- Retry with backoff for transient 5xx (urllib3 Retry or tenacity)
- Never log headers that contain tokens

**Use cases:** probe \`/health\` endpoints, GitHub API rate-limit checks, webhook notifications.`,
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
      title: 'Typing and readability',
      content: `**Type hints** (3.10+) keep team scripts maintainable.

- \`def deploy(version: str, env: Literal["staging", "prod"]) -> int:\`
- \`TypedDict\`, \`dataclasses\` for config structures
- \`mypy\` / \`pyright\` in CI — optional but valuable

**Don't over-engineer:** for a 50-line script, basic hints on public functions are enough.

**Tests:** \`pytest\` + \`monkeypatch\` for subprocess; \`responses\` / httpx mocks for HTTP.`,
    },
    {
      title: 'Mini-CLI: health-check runner',
      content: `Build a **check-services** utility: read a YAML list of URLs, check them in parallel, exit 1 if any fail — ready for cron or CI.

**Project layout:**
\`\`\`
healthrunner/
  pyproject.toml
  healthrunner/
    __main__.py
    checks.py
  tests/
  config.example.yaml
\`\`\`

**Packaging:** \`pip install -e .\` or a single file + \`uv\`.

This pattern shows up in real repos: small focused tools instead of monster Bash.`,
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
      title: 'Pipeline integration and security',
      content: `- Secrets from env (\`os.environ["API_TOKEN"]\`), never hardcode
- \`.env\` only locally; in CI — GitHub Secrets
- Pin dependencies in \`requirements.txt\` or a \`pyproject.toml\` lock
- Shebang \`#!/usr/bin/env python3\` + executable bit for ad-hoc scripts

**vs Ansible:** Python when you need custom logic; Ansible when you need idempotent config across a fleet.

Next building blocks: boto3 (AWS), \`kubernetes\` client, \`hvac\` (Vault).`,
    },
  ],
  practice: [
    'Write a script that walks a directory tree and lists files > 100MB (pathlib + stat)',
    'Wrap `kubectl get nodes -o json` into a Ready/NotReady table',
    'Health checker for 3 URLs with timeout and exit codes for cron',
    'Add type hints and run mypy on one module',
    'Mock subprocess in pytest — success and non-zero returncode cases',
    'CLI via argparse: `--env staging|prod` and `--verbose`',
    'POST a webhook (Slack/Discord) on a failed check',
  ],
  resources: [
    { title: 'Python — pathlib', url: 'https://docs.python.org/3/library/pathlib.html' },
    { title: 'Requests — Quickstart', url: 'https://requests.readthedocs.io/en/latest/user/quickstart/' },
    { title: 'Typer — CLI framework', url: 'https://typer.tiangolo.com/' },
  ],
  quiz: [
    {
      question: 'Why avoid subprocess with shell=True and user input?',
      options: [
        'Command injection risk',
        'Python does not support shell',
        'It is slower than pathlib',
        'Only on Windows',
      ],
      answer: 'Command injection risk',
    },
    {
      question: 'Which module is preferred for paths in modern Python?',
      options: ['pathlib.Path', 'os.path only', 'glob only', 'pickle'],
      answer: 'pathlib.Path',
    },
    {
      question: 'Why set a timeout on requests.get?',
      options: [
        'Avoid hanging the script when a service is unreachable',
        'Speed up DNS',
        'Encrypt TLS',
        'Cache the response',
      ],
      answer: 'Avoid hanging the script when a service is unreachable',
    },
    {
      question: 'Where should API_TOKEN live in a CLI utility used by cron?',
      options: [
        'In an environment variable, not in code',
        'In a docstring',
        'In a git commit',
        'In argv logs',
      ],
      answer: 'In an environment variable, not in code',
    },
    {
      question: 'When is Python preferable to Bash for DevOps glue?',
      options: [
        'JSON/API work, structured error handling, and tests',
        'A one-liner pipe of three commands',
        'Interactive shell only',
        'Never',
      ],
      answer: 'JSON/API work, structured error handling, and tests',
    },
    {
      question: 'What do type hints give you in ops scripts?',
      options: [
        'Readable function contracts and mypy/pyright checks',
        'Automatic deploy',
        'A replacement for logging',
        'Disabling subprocess',
      ],
      answer: 'Readable function contracts and mypy/pyright checks',
    },
    {
      question: 'How do you safely call kubectl from Python?',
      options: [
        'subprocess.run with an argument list and without shell=True',
        'os.system("kubectl " + user_input)',
        'eval(user_cmd)',
        'exec(open("/bin/sh"))',
      ],
      answer: 'subprocess.run with an argument list and without shell=True',
    },
    {
      question: 'Why prefer logging over print in ops scripts?',
      options: [
        'Levels, timestamps, and routing to stderr/aggregators',
        'To hide errors',
        'GUI apps only',
        'A Python 2 requirement',
      ],
      answer: 'Levels, timestamps, and routing to stderr/aggregators',
    },
    {
      question: 'Exit code 1 in a health-check script usually means?',
      options: [
        'Check failed — signal for cron/CI',
        'Success',
        'Warning with no action',
        'Skip tests',
      ],
      answer: 'Check failed — signal for cron/CI',
    },
    {
      question: 'Which config format works well for a URL list in a health runner?',
      options: [
        'A YAML or JSON file in the repo',
        'Hardcoded in 10 places',
        'An SQL dump',
        'Binary pickle only',
      ],
      answer: 'A YAML or JSON file in the repo',
    },
  ],
}

export default translation
