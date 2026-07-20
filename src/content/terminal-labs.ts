import type { TerminalLab } from '../types'

export const terminalLabsBySlug: Record<string, TerminalLab> = {
  linux: {
    id: 'linux-basics',
    title: 'Базовые команды Linux',
    intro:
      'Это учебный терминал: команды не выполняются на сервере, но синтаксис проверяется так же, как в реальной SSH-сессии.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~',
    initialOutput: [
      'Добро пожаловать в тренажёр синтаксиса Linux.',
      'Выполняй шаги по порядку — вводи команду и нажимай Enter.',
    ],
    steps: [
      {
        id: 'ls',
        instruction: 'Выведи список файлов и каталогов в текущей директории.',
        match: { kind: 'normalized' },
        accept: ['ls'],
        hint: 'Команда из двух букв: list — список содержимого каталога.',
        explanation:
          'ls показывает имена файлов и папок в текущем каталоге. На сервере часто добавляют ключи, например ls -la для прав и скрытых файлов.',
        fakeOutput: [
          'deploy.sh  logs  nginx.conf  README.md',
        ],
      },
      {
        id: 'pwd',
        instruction: 'Узнай полный путь к текущей рабочей директории.',
        match: { kind: 'normalized' },
        accept: ['pwd'],
        hint: 'Print working directory — «где я сейчас в файловой системе».',
        explanation:
          'pwd (print working directory) возвращает абсолютный путь. Полезно после cd и при написании скриптов.',
        fakeOutput: ['/home/student'],
      },
      {
        id: 'mkdir-logs',
        instruction: 'Создай каталог с именем logs.',
        match: { kind: 'normalized' },
        accept: ['mkdir logs'],
        hint: 'make directory — одна команда и имя новой папки через пробел.',
        explanation:
          'mkdir создаёт директорию. Для вложенных путей используют mkdir -p, чтобы не падать, если родитель уже существует.',
        fakeOutput: [''],
      },
      {
        id: 'chmod-deploy',
        instruction:
          'Сделай скрипт deploy.sh исполняемым: chmod 755 deploy.sh или chmod +x deploy.sh.',
        match: {
          kind: 'anyOf',
          items: [
            { match: { kind: 'normalized' }, accept: ['chmod 755 deploy.sh'] },
            { match: { kind: 'normalized' }, accept: ['chmod +x deploy.sh'] },
          ],
        },
        accept: [],
        hint: '755 задаёт права rwxr-xr-x; +x добавляет бит исполнения для всех, кому разрешено читать файл.',
        explanation:
          'chmod меняет права доступа. 755 типичен для скриптов деплоя; +x — быстрый способ сделать файл исполняемым.',
        fakeOutput: [''],
      },
      {
        id: 'systemctl-nginx',
        instruction: 'Проверь статус службы nginx через systemctl.',
        match: { kind: 'normalized' },
        accept: ['systemctl status nginx'],
        hint: 'systemctl status <имя-службы> — стандарт для systemd в современных дистрибутивах.',
        explanation:
          'systemctl status показывает, запущена ли служба, последние логи и код выхода. Для перезапуска используют systemctl restart nginx.',
        fakeOutput: [
          '● nginx.service - A high performance web server and a reverse proxy server',
          '     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)',
          '     Active: active (running) since Fri 2026-07-17 10:00:00 UTC; 2h ago',
        ],
      },
    ],
  },

  git: {
    id: 'git-basics',
    title: 'Базовые команды Git',
    intro:
      'Тренажёр синтаксиса Git: команды не выполняются в реальном репозитории, но проверяется правильность ввода — как в повседневной работе в терминале.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/project',
    initialOutput: [
      'Добро пожаловать в тренажёр синтаксиса Git.',
      'Репозиторий уже инициализирован. Выполняй шаги по порядку.',
    ],
    steps: [
      {
        id: 'git-status',
        instruction: 'Проверь состояние рабочей директории и staging area.',
        match: { kind: 'normalized' },
        accept: ['git status'],
        hint: 'Самая частая команда Git: status — «что сейчас изменено».',
        explanation:
          'git status показывает ветку, staged/unstaged изменения и untracked файлы. Смотри сюда перед каждым commit.',
        fakeOutput: [
          'On branch main',
          'Changes not staged for commit:',
          '  (use "git add <file>..." to update what will be committed)',
          '	modified:   README.md',
          'Untracked files:',
          '	nginx.conf',
        ],
      },
      {
        id: 'git-add',
        instruction: 'Добавь все изменения в staging area одной командой.',
        match: { kind: 'normalized' },
        accept: ['git add .'],
        hint: 'git add . — добавить текущий каталог и всё внутри в index.',
        explanation:
          'git add . ставит в staging все изменения в текущем дереве. Для точечного контроля используют git add <file> или git add -p.',
        fakeOutput: [''],
      },
      {
        id: 'git-commit',
        instruction:
          'Создай коммит с сообщением docs: add nginx config (через git commit -m "...").',
        match: { kind: 'normalized' },
        accept: ['git commit -m "docs: add nginx config"'],
        hint: 'git commit -m "сообщение" — коммит без открытия редактора. Кавычки обязательны.',
        explanation:
          'git commit фиксирует снимок index в истории. Conventional Commits (docs:, feat:, fix:) помогают читать историю и генерировать changelog.',
        fakeOutput: [
          '[main 9f3a1c2] docs: add nginx config',
          ' 2 files changed, 18 insertions(+), 1 deletion(-)',
        ],
      },
      {
        id: 'git-branch',
        instruction: 'Создай новую ветку feature/nginx и сразу переключись на неё (одной командой).',
        match: {
          kind: 'anyOf',
          items: [
            {
              match: { kind: 'normalized' },
              accept: ['git switch -c feature/nginx'],
            },
            {
              match: { kind: 'normalized' },
              accept: ['git checkout -b feature/nginx'],
            },
          ],
        },
        accept: [],
        hint: 'Современный вариант: git switch -c <имя>. Классический: git checkout -b <имя>.',
        explanation:
          'git switch -c (или checkout -b) создаёт ветку и переключает HEAD на неё. Feature-ветки держат работу изолированно до PR.',
        fakeOutput: ['Switched to a new branch \'feature/nginx\''],
      },
      {
        id: 'git-log',
        instruction: 'Покажи краткую историю коммитов в одну строку на коммит.',
        match: {
          kind: 'anyOf',
          items: [
            { match: { kind: 'normalized' }, accept: ['git log --oneline'] },
            {
              match: { kind: 'normalized' },
              accept: ['git log --oneline --graph --all --decorate'],
            },
            { match: { kind: 'normalized' }, accept: ['git lg'] },
          ],
        },
        accept: [],
        hint: 'git log --oneline — короткий SHA + сообщение. Часто добавляют --graph --all.',
        explanation:
          'git log --oneline удобен для быстрого обзора. Alias lg из главы обычно включает --graph --all --decorate.',
        fakeOutput: [
          '9f3a1c2 docs: add nginx config',
          'a1b2c3d chore: initial commit',
        ],
      },
    ],
  },
}
