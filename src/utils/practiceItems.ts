import type { PracticeItem } from '../types'
import type { Locale } from '../i18n/contentLabels'

export type PracticeInput = string | PracticeItem

const CODE_RE = /`([^`]+)`/g

function extractCodes(task: string): string[] {
  const codes: string[] = []
  for (const match of task.matchAll(CODE_RE)) {
    if (match[1] && !codes.includes(match[1])) codes.push(match[1])
  }
  return codes.slice(0, 8)
}

function splitClauses(task: string): string[] {
  const cleaned = task.replace(CODE_RE, (_, code: string) => `\`${code}\``)
  return cleaned
    .split(/\s*[;—–]\s*|\.\s+(?=[A-ZА-ЯЁ])/)
    .map((s) => s.replace(/^[-•\d.)\s]+/, '').trim())
    .filter((s) => s.length > 6)
    .slice(0, 5)
}

type Pattern = { test: RegExp; ru: string[]; en: string[] }

const PATTERNS: Pattern[] = [
  {
    test: /скрипт|\.sh\b|bash|shellcheck|getopts|cron/i,
    ru: [
      'Создай файл скрипта (например `nano script.sh`), вставь shebang `#!/usr/bin/env bash`.',
      'Добавь `set -euo pipefail`, реализуй логику из условия, сделай `chmod +x`.',
      'Прогони локально и через `shellcheck`, исправь замечания.',
    ],
    en: [
      'Create the script file (e.g. `nano script.sh`) with `#!/usr/bin/env bash`.',
      'Add `set -euo pipefail`, implement the logic, then `chmod +x`.',
      'Run it locally and through `shellcheck`; fix warnings.',
    ],
  },
  {
    test: /docker|dockerfile|compose|container/i,
    ru: [
      'Работай в каталоге проекта: подготовь `Dockerfile` / `compose.yaml` по условию.',
      'Собери и запусти (`docker build` / `docker compose up`), проверь логи и порты.',
      'Убедись, что контейнер healthy и сервис отвечает с хоста.',
    ],
    en: [
      'In the project folder, prepare `Dockerfile` / `compose.yaml` as required.',
      'Build and run (`docker build` / `docker compose up`); check logs and ports.',
      'Confirm the container is healthy and the service responds from the host.',
    ],
  },
  {
    test: /kubectl|kubernetes|k8s|helm|deployment|pod\b/i,
    ru: [
      'Подготовь манифест или helm values под условие задания.',
      'Примени (`kubectl apply` / `helm upgrade --install`) и проверь `get/describe/logs`.',
      'Критерий: нужные Pod/Service в Ready и поведение совпадает с задачей.',
    ],
    en: [
      'Prepare the manifest or Helm values for the task.',
      'Apply (`kubectl apply` / `helm upgrade --install`) and check `get/describe/logs`.',
      'Done when Pods/Services are Ready and behaviour matches the task.',
    ],
  },
  {
    test: /terraform|ansible|iac|playbook/i,
    ru: [
      'Опиши инфраструктуру/плейбук в файлах модуля по условию.',
      'Проверь план/синтаксис (`terraform plan` / `ansible-playbook --check`), затем примени.',
      'Сверь итоговое состояние с тем, что требовалось в задании.',
    ],
    en: [
      'Describe infra/playbook files as required.',
      'Validate (`terraform plan` / `ansible-playbook --check`), then apply.',
      'Compare the final state with the task requirements.',
    ],
  },
  {
    test: /nginx|ssl|certbot|tls|reverse.?proxy/i,
    ru: [
      'Прави конфиг в `/etc/nginx/...`, проверь `nginx -t`.',
      'Перезагрузи сервис и открой URL/порт с хоста.',
      'Для SSL — выпусти сертификат и проверь HTTPS в браузере/curl.',
    ],
    en: [
      'Edit config under `/etc/nginx/...`, then run `nginx -t`.',
      'Reload the service and hit the URL/port from the host.',
      'For SSL — issue a cert and verify HTTPS via browser/curl.',
    ],
  },
  {
    test: /git\b|github|gitlab|pull request|репозитор/i,
    ru: [
      'Сделай изменения в отдельной ветке, осмысленный commit message.',
      'Запушь и открой PR/MR с кратким описанием «что / зачем».',
      'Проверь, что CI (если есть) зелёный или зафиксируй ошибку.',
    ],
    en: [
      'Work in a feature branch with a clear commit message.',
      'Push and open a PR/MR describing what/why.',
      'Confirm CI is green (or note the failure).',
    ],
  },
  {
    test: /prometheus|grafana|zabbix|alert|monitor|логи|observ/i,
    ru: [
      'Подними/настрой стек мониторинга по условию (exporter / agent / dashboard).',
      'Сгенерируй тестовую нагрузку или ошибку и убедись, что метрика/алерт срабатывает.',
      'Сохрани скрин или текст алерта в заметки — это доказательство выполнения.',
    ],
    en: [
      'Stand up / configure the monitoring piece from the task (exporter, agent, dashboard).',
      'Generate a test signal and confirm the metric/alert fires.',
      'Save a screenshot or alert text as proof.',
    ],
  },
  {
    test: /aws|vpc|iam|eks|cloud|s3\b/i,
    ru: [
      'Работай в учебном аккаунте/sandbox, не в проде.',
      'Создай ресурсы из задания через консоль или CLI, запиши ID/ARN.',
      'В конце — cleanup (удали ресурсы), чтобы не копить счета.',
    ],
    en: [
      'Use a sandbox/training account, never production.',
      'Create the resources via console or CLI; note IDs/ARNs.',
      'Clean up afterwards to avoid surprise bills.',
    ],
  },
  {
    test: /firewall|vlan|dhcp|dns|omada|forti|opnsense|wi-?fi|switch/i,
    ru: [
      'Сначала нарисуй целевую схему (кто с кем говорит, какие сети/VLAN).',
      'Вноси изменения по одному правилу/интерфейсу и проверяй связность (`ping`, клиент).',
      'Зафиксируй итоговый конфиг/скрин — откат должен быть понятен.',
    ],
    en: [
      'Sketch the target topology first (who talks to whom, VLANs/networks).',
      'Change one rule/interface at a time; verify with `ping`/client.',
      'Save the final config/screenshot so rollback is clear.',
    ],
  },
  {
    test: /active directory|gpo|windows server|domain|powershell/i,
    ru: [
      'Делай изменения в lab-домене, не на боевом контроллере.',
      'Проверяй результат на клиенте (`gpupdate`, вход под УЗ, политика).',
      'Документируй шаги — AD легко «сломать» без runbook.',
    ],
    en: [
      'Change only a lab domain, never production DCs.',
      'Verify on a client (`gpupdate`, user logon, policy result).',
      'Document steps — AD is easy to break without a runbook.',
    ],
  },
]

function domainSteps(task: string, locale: Locale): string[] | null {
  for (const pattern of PATTERNS) {
    if (pattern.test.test(task)) {
      return locale === 'en' ? pattern.en : pattern.ru
    }
  }
  return null
}

/** Build a practical hint when content does not ship an explicit one. */
export function buildPracticeHint(task: string, locale: Locale): string {
  const codes = extractCodes(task)
  const clauses = splitClauses(task)
  const domain = domainSteps(task, locale)

  const fromTask =
    clauses.length >= 2
      ? clauses.map((c, i) => `${i + 1}. ${c}`)
      : null

  const generic =
    locale === 'en'
      ? [
          '1. Read the task and name the artifact (script, config, check).',
          '2. Do it on a VPS/VM or local lab — not only in your head.',
          '3. Verify the result, then mark the item done.',
        ]
      : [
          '1. Прочитай условие и определи артефакт: скрипт, конфиг или проверку.',
          '2. Сделай по шагам на VPS/VM или в локальной лаборатории.',
          '3. Проверь результат и отметь пункт выполненным.',
        ]

  const body = fromTask
    ? fromTask
    : domain
      ? domain.map((s, i) => `${i + 1}. ${s}`)
      : generic

  if (locale === 'en') {
    const lines = ['How to approach this:', ...body]
    if (codes.length > 0) {
      lines.push(
        `Useful commands / keywords: ${codes.map((c) => `\`${c}\``).join(', ')}`,
      )
    }
    if (!fromTask && clauses[0]) {
      lines.push(`Focus: ${clauses[0]}`)
    }
    lines.push('Done when the expected result is visible and reproducible.')
    return lines.join('\n')
  }

  const lines = ['Как подойти к заданию:', ...body]
  if (codes.length > 0) {
    lines.push(
      `Полезные команды / ключевые слова: ${codes.map((c) => `\`${c}\``).join(', ')}`,
    )
  }
  if (!fromTask && clauses[0]) {
    lines.push(`Фокус: ${clauses[0]}`)
  }
  lines.push('Готово, когда ожидаемый результат виден и воспроизводится.')
  return lines.join('\n')
}

export function normalizePracticeItem(
  item: PracticeInput,
  locale: Locale,
): PracticeItem {
  if (typeof item === 'string') {
    return { task: item, hint: buildPracticeHint(item, locale) }
  }
  return {
    task: item.task,
    hint: item.hint?.trim() ? item.hint : buildPracticeHint(item.task, locale),
  }
}

export function normalizePracticeList(
  practice: PracticeInput[],
  locale: Locale,
): PracticeItem[] {
  return practice.map((item) => normalizePracticeItem(item, locale))
}
