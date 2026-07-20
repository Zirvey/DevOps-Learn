import type { Chapter } from '../../../types'

export const gitChapter: Chapter = {
  id: 'git',
  slug: 'git',
  title: 'Git: полное руководство',
  moduleId: 'fundamentals',
  order: 2,
  duration: '6–8 часов',
  level: 'beginner',
  description:
    'Глубокий курс Git для DevOps: модель данных, staging, ветки, merge/rebase, конфликты, remote, PR, stash, reflog, теги, hooks, cherry-pick, bisect и GitOps-практики',
  sections: [
    {
      title: 'Зачем Git в DevOps',
      content: `**Git** — распределённая система контроля версий и **единый источник правды** в современной инженерии.

В DevOps через Git живёт почти всё:

| Артефакт | Примеры |
|----------|---------|
| Код приложений | Go, Python, Node, Java |
| Infrastructure as Code | Terraform, Pulumi, CloudFormation |
| Конфигурация серверов | Ansible, Chef, Puppet |
| Kubernetes / GitOps | манифесты, Helm, Kustomize, Argo CD |
| CI/CD | \`.github/workflows\`, \`.gitlab-ci.yml\`, Jenkinsfile |
| Документация | README, ADR, runbooks, postmortems |

**Почему именно Git, а не SVN/Perforce:**
- Локальная история — работаешь offline
- Дешёвое ветвление и merge
- Экосистема: GitHub, GitLab, Bitbucket, Gitea
- Интеграция с каждым CI/CD и GitOps-инструментом

> Правило: **что не в Git — не существует для автоматизации.** Секреты — в vault/secret manager, не в репозитории.`,
    },
    {
      title: 'Как работает Git: snapshots и объекты',
      content: `Git хранит не «патчи к файлам», а **снимки (snapshots)** всего дерева на момент коммита.

**Объекты в \`.git/objects\`:**

| Объект | Что хранит |
|--------|------------|
| **blob** | Содержимое файла (без имени) |
| **tree** | Каталог: имя → blob или tree |
| **commit** | Указатель на tree + parent(s) + author + message + timestamp |
| **tag** | Именованная ссылка на объект (обычно commit) |

Каждый объект идентифицируется **хэшем** (SHA-1, 40 hex-символов; в новых версиях — переход на SHA-256).

**Три «зоны» файла:**

\`\`\`
Working Directory  →  Staging (Index)  →  Repository (.git)
   (modified)            (staged)              (committed)
\`\`\`

1. Правишь файл → **modified**
2. \`git add\` → файл в **index** (snapshot для следующего коммита)
3. \`git commit\` → новый **commit** в истории

**HEAD** — указатель «где ты сейчас»: обычно указывает на tip ветки (\`refs/heads/main\`), реже — на конкретный коммит (**detached HEAD**).`,
    },
    {
      title: 'Установка и первоначальная настройка',
      content: `Настрой идентичность **один раз** на машине. Без \`user.name\` / \`user.email\` коммиты не создадутся (или будут с мусорными метаданными).

**Уровни config:**
- \`--system\` — вся машина
- \`--global\` — пользователь (\`~/.gitconfig\`)
- \`--local\` — только этот репозиторий (\`.git/config\`)`,
      codes: [
        {
          language: 'bash',
          caption: 'Базовая конфигурация',
          code: `git config --global user.name "Temirlan Kakishev"
git config --global user.email "you@company.com"
git config --global init.defaultBranch main
git config --global pull.rebase false   # или true — политика команды
git config --global core.editor "vim"
git config --global color.ui auto
git config --list --show-origin`,
        },
        {
          language: 'bash',
          caption: 'Полезные aliases',
          code: `git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm "commit -m"
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.last "log -1 HEAD"`,
        },
      ],
    },
    {
      title: 'Создание репозитория и первый коммит',
      content: `**Локальный репозиторий** — каталог с скрытой папкой \`.git/\` (объектная БД + refs + config).

Два пути:
1. \`git init\` — новый проект с нуля
2. \`git clone\` — копия удалённого репозитория + remote \`origin\``,
      codes: [
        {
          language: 'bash',
          caption: 'init и clone',
          code: `mkdir myproject && cd myproject
git init

# HTTPS (Personal Access Token вместо пароля)
git clone https://github.com/user/repo.git

# SSH (рекомендуется для ежедневной работы)
git clone git@github.com:user/repo.git mydir`,
        },
        {
          language: 'bash',
          caption: 'Базовый workflow: add → commit → log',
          code: `echo "# My Project" > README.md
git status
git add README.md
git add .                      # все изменения в каталоге
git commit -m "docs: add README"
git log --oneline
git show HEAD                  # последний коммит целиком`,
        },
      ],
    },
    {
      title: 'Staging area подробно',
      content: `**Index (staging)** — промежуточный снимок. Позволяет собрать коммит аккуратно: не всё сразу из working tree.

**Частые сценарии:**
- Закоммитить только часть файлов
- Разбить большую правку на логичные коммиты
- Проверить diff **до** коммита`,
      codes: [
        {
          language: 'bash',
          caption: 'Работа со staging',
          code: `git add path/to/file
git add -p                     # интерактивно по hunks
git restore --staged file.txt  # убрать из index, оставить в working tree
git restore file.txt           # откатить working tree к HEAD
git diff                       # unstaged vs index
git diff --staged              # index vs HEAD
git commit -a -m "msg"         # add всех tracked + commit (осторожно!)`,
        },
      ],
    },
    {
      title: '.gitignore и секреты',
      content: `**Не коммить:** секреты, артефакты сборки, локальные IDE-файлы, state Terraform.

Если секрет уже попал в историю — недостаточно удалить из последнего коммита: хэш остаётся в истории. Нужен \`git filter-repo\` / BFG + **ротация ключей**.

Проверь шаблон на [gitignore.io](https://www.toptal.com/developers/gitignore).`,
      codes: [
        {
          language: 'gitignore',
          caption: 'Типичный .gitignore для DevOps-проекта',
          code: `# Secrets
.env
.env.*
!.env.example
*.pem
*.key
secrets/
credentials.json

# Build / deps
node_modules/
dist/
build/
*.pyc
__pycache__/
.venv/
vendor/

# Terraform
.terraform/
*.tfstate
*.tfstate.*
crash.log

# OS / IDE
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp`,
        },
        {
          language: 'bash',
          caption: 'Если файл уже tracked',
          code: `# Добавил в .gitignore, но файл уже в индексе:
git rm --cached secrets.env
git commit -m "chore: stop tracking secrets.env"`,
        },
      ],
    },
    {
      title: 'Просмотр истории и diff',
      content: `Умение читать историю — основа code review, postmortem и отладки «кто сломал прод».`,
      codes: [
        {
          language: 'bash',
          caption: 'log, show, diff, blame',
          code: `git log
git log --oneline --graph --all --decorate
git log -p -3                  # patch последних 3 коммитов
git log --author="Temirlan" --since="2 weeks ago"
git log -- path/to/file        # история одного файла
git show abc1234
git diff                       # unstaged
git diff --staged
git diff main..feature         # между ветками
git diff main...feature        # от общего предка до feature
git blame file.txt             # автор каждой строки
git shortlog -sn               # кто сколько коммитил`,
        },
      ],
    },
    {
      title: 'Ветки (branches)',
      content: `**Ветка** — лёгкий указатель (\`refs/heads/...\`) на commit. Создание ветки почти бесплатно.

**Зачем:**
- Изоляция фич и экспериментов
- Параллельная работа без блокировок
- Hotfix на \`main\` без остановки разработки

**Стратегии ветвления:**

| Стратегия | Суть | Когда |
|-----------|------|-------|
| **GitHub Flow** | \`main\` + short-lived feature + PR | Большинство продуктовых команд |
| **Trunk-Based** | Очень короткие ветки, частый merge в trunk | Высокая зрелость CI, feature flags |
| **Git Flow** | main, develop, feature, release, hotfix | Релизы по расписанию, legacy |

DevOps-команды чаще **GitHub Flow** или **trunk-based**: \`main\` всегда deployable.`,
      codes: [
        {
          language: 'bash',
          caption: 'Создание и переключение',
          code: `git branch                              # локальные ветки
git branch -a                           # + remote-tracking
git branch feature/nginx-config
git switch feature/nginx-config         # современная команда
git switch -c fix/pipeline-timeout      # создать и перейти
git switch main
git branch -d feature/done              # удалить merged
git branch -D feature/abandoned         # принудительно
git branch -m old-name new-name         # переименовать`,
        },
      ],
    },
    {
      title: 'Merge',
      content: `**Merge** объединяет истории. Результат — либо **fast-forward**, либо **merge commit** с двумя parents.

**Fast-forward:** \`main\` просто «догоняет» tip feature — нет расхождения.

**3-way merge:** есть общий предок и расходящиеся линии → создаётся merge commit.

\`--no-ff\` заставляет всегда создавать merge commit — удобно видеть границу feature в истории.`,
      codes: [
        {
          language: 'bash',
          caption: 'Merge workflow',
          code: `git switch main
git pull origin main
git merge feature/add-monitoring
git push origin main

# Всегда merge commit (даже при FF):
git merge --no-ff feature/x -m "merge: feature/x into main"

# Отменить merge до коммита:
git merge --abort`,
        },
      ],
    },
    {
      title: 'Rebase',
      content: `**Rebase** переносит коммиты на новый base: «как будто ты начал работу от актуального \`main\`». История становится линейной.

| | merge | rebase |
|-|-------|--------|
| История | Сохраняет ветвление | Переписывает (новые SHA) |
| Граф | Merge commits | Линейный |
| Shared branches | Безопасно | **Не rebase публичные ветки** |

**Золотое правило:** не делай rebase веток, которые уже \`pull\`'или другие люди (после force-push история у коллег «поедет»).`,
      codes: [
        {
          language: 'bash',
          caption: 'Rebase feature на main',
          code: `git switch feature/my-work
git fetch origin
git rebase origin/main

# Конфликт во время rebase:
# 1) исправь файлы
# 2) git add .
# 3) git rebase --continue
# или:
git rebase --abort

# Interactive rebase — подчистить историю до push:
git rebase -i HEAD~3
# pick / reword / squash / drop`,
        },
      ],
    },
    {
      title: 'Разрешение конфликтов',
      content: `**Конфликт** — Git не смог автоматически слить одни и те же строки.

Маркеры в файле:

\`\`\`
<<<<<<< HEAD
твоя версия (текущая ветка)
=======
их версия (входящая)
>>>>>>> feature-branch
\`\`\`

**Алгоритм:**
1. Открой файл, выбери нужный код или объедини логику
2. Удали все маркеры \`<<<<<<<\` / \`=======\` / \`>>>>>>>\`
3. \`git add <файл>\`
4. \`git merge --continue\` или \`git rebase --continue\`
5. Прогони тесты / lint

**Инструменты:** \`git mergetool\`, VS Code / Cursor merge editor, \`meld\`.

**Превенция:** маленькие PR, часто синхронизируйся с \`main\`, договаривайтесь о владельцах файлов.`,
    },
    {
      title: 'Remote и синхронизация',
      content: `**Remote** — именованная ссылка на удалённый репозиторий (обычно \`origin\`).

**Протоколы:**
- **HTTPS** — Personal Access Token / credential helper
- **SSH** — ключ (\`~/.ssh/id_ed25519\`) — удобнее для ежедневной работы

\`git fetch\` — скачать объекты и обновить remote-tracking ветки (\`origin/main\`), **без** изменения рабочей директории.

\`git pull\` = \`fetch\` + \`merge\` (или rebase, если так настроено).`,
      codes: [
        {
          language: 'bash',
          caption: 'push, pull, fetch',
          code: `git remote -v
git remote add origin git@github.com:user/repo.git
git remote set-url origin git@github.com:org/repo.git

git push -u origin main            # первый push + upstream tracking
git fetch origin
git pull origin main
git push origin feature/x
git push origin --delete feature/x
git push --force-with-lease        # безопаснее чем --force`,
        },
      ],
    },
    {
      title: 'Pull Request / Merge Request workflow',
      content: `**PR (GitHub)** / **MR (GitLab)** — запрос на слияние + code review + CI checks + обсуждение.

**Типичный DevOps-flow:**
1. \`git switch -c fix/pipeline-timeout\`
2. Изменения + осмысленные коммиты
3. \`git push -u origin fix/pipeline-timeout\`
4. Создать PR → описание: *что / зачем / как проверить*
5. CI: lint, tests, \`terraform plan\`, security scan
6. Review → Approve → Merge (squash или merge commit — политика команды)
7. Удалить ветку

**Branch protection на \`main\`:**
- Require pull request
- Require status checks (CI green)
- Require review (1+)
- No direct push, no force-push

**Хороший PR:** маленький, один смысл, зелёный CI, скриншоты/план Terraform в комментарии.`,
    },
    {
      title: 'Stash: временно отложить работу',
      content: `\`git stash\` сохраняет незакоммиченные изменения во временный стек — удобно, когда нужно срочно переключиться на hotfix.`,
      codes: [
        {
          language: 'bash',
          caption: 'stash workflow',
          code: `git stash push -m "wip: nginx rate limit"
git stash list
git stash show -p stash@{0}
git stash pop                    # применить и удалить из стека
git stash apply stash@{0}        # применить, оставить в стеке
git stash drop stash@{0}
git stash clear                  # очистить весь стек
git stash push -u                # включая untracked файлы`,
        },
      ],
    },
    {
      title: 'Отмена и восстановление',
      content: `Выбирай команду по ситуации: **безопасный откат** vs **перепись истории**.

| Команда | Эффект | Когда |
|---------|--------|-------|
| \`git restore\` | Откат working / staged | Локальные правки до push |
| \`git revert\` | Новый коммит, отменяющий старый | Уже в shared history |
| \`git reset --soft\` | Двигает HEAD, оставляет staged | Переписать последний локальный commit |
| \`git reset --hard\` | Уничтожает незакоммиченное | Только если уверен |
| \`git reflog\` | Журнал движений HEAD | Спасение «потерянных» коммитов |`,
      codes: [
        {
          language: 'bash',
          caption: 'Безопасные и опасные откаты',
          code: `git restore file.txt
git restore --staged file.txt
git revert abc1234                 # безопасный откат на shared branch
git reset --soft HEAD~1            # undo commit, изменения остаются staged
git reset --mixed HEAD~1           # undo commit, изменения в working tree
git reset --hard HEAD~1            # ОПАСНО: потерять uncommitted

git reflog
git reset --hard HEAD@{3}          # вернуться к состоянию из reflog`,
        },
      ],
    },
    {
      title: 'Теги и релизы',
      content: `**Тег** — неизменяемая (по смыслу) метка на коммите: версия релиза, точка для Docker-образа \`app:1.2.0\`.

- **Lightweight** — просто имя → commit
- **Annotated** — с автором, датой, сообщением (**рекомендуется** для релизов)

Semantic Versioning: \`MAJOR.MINOR.PATCH\` (\`v1.4.2\`).`,
      codes: [
        {
          language: 'bash',
          caption: 'Теги',
          code: `git tag
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
git push origin --tags
git checkout v1.0.0                # detached HEAD
git switch -c hotfix/from-v1 v1.0.0
git tag -d v0.9.0
git push origin :refs/tags/v0.9.0  # удалить remote tag`,
        },
      ],
    },
    {
      title: 'Cherry-pick и bisect',
      content: `**Cherry-pick** — перенести один конкретный коммит на текущую ветку (hotfix из \`main\` в \`release/1.x\`).

**Bisect** — бинарный поиск коммита, который внёс баг (между «хорошим» и «плохим» коммитом).`,
      codes: [
        {
          language: 'bash',
          caption: 'cherry-pick и bisect',
          code: `git cherry-pick abc1234
git cherry-pick -x abc1234         # добавить ссылку на исходный commit

git bisect start
git bisect bad                     # текущий коммит — плохой
git bisect good v1.2.0             # эта версия была хорошей
# Git переключает на середину — тестируй, затем:
git bisect good   # или git bisect bad
git bisect reset`,
        },
      ],
    },
    {
      title: 'Git hooks и pre-commit',
      content: `**Hooks** — скрипты при событиях Git. Локальные хуки в \`.git/hooks/\` **не коммитятся**; для команды используют **pre-commit**, Husky, lefthook.

**Полезные точки:**
- **pre-commit** — lint, format, gitleaks (скан секретов)
- **commit-msg** — conventional commits
- **pre-push** — unit tests / быстрый smoke

**Server-side** (GitHub/GitLab): branch protection + required status checks надёжнее локальных хуков (их можно обойти \`--no-verify\`).`,
      codes: [
        {
          language: 'bash',
          caption: 'Пример примитивного pre-commit',
          code: `#!/bin/sh
# .git/hooks/pre-commit
if git diff --cached | grep -E 'AKIA[0-9A-Z]{16}'; then
  echo "ERROR: possible AWS key in staged changes"
  exit 1
fi`,
        },
        {
          language: 'yaml',
          caption: '.pre-commit-config.yaml (фрагмент)',
          code: `repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks`,
        },
      ],
    },
    {
      title: 'Conventional Commits',
      content: `Стандарт сообщений для читаемой истории, changelog и semantic-release:

\`\`\`
type(scope): short description

optional body

optional footer (BREAKING CHANGE: ...)
\`\`\`

**Типы:** \`feat\`, \`fix\`, \`docs\`, \`style\`, \`refactor\`, \`test\`, \`chore\`, \`ci\`, \`build\`, \`perf\`

**Примеры для DevOps:**
- \`feat(api): add /health endpoint\`
- \`fix(terraform): correct S3 bucket policy\`
- \`ci: add Trivy scan step\`
- \`chore(deps): bump nginx to 1.27\`

Хороший subject: **императив**, до ~50–72 символов, без точки в конце.`,
    },
    {
      title: 'Монорепо, submodules и sparse-checkout',
      content: `**Monorepo** — один репозиторий, много проектов (Google, Uber, многие стартапы). Плюс: атомарные изменения API+клиента. Минус: тяжёлый clone, нужна дисциплина CI.

**Polyrepo** — отдельный repo на сервис. Проще права доступа и CI, сложнее координировать breaking changes.

**Git submodule** — репозиторий внутри репозитория (указатель на commit другого repo). Часто болезненны в поддержке — для Terraform modules чаще берут Registry или отдельные repos + version tags.

**Sparse-checkout** — клонировать/checkout только нужные каталоги большого monorepo.`,
      codes: [
        {
          language: 'bash',
          caption: 'sparse-checkout (кратко)',
          code: `git clone --filter=blob:none --sparse git@github.com:org/monorepo.git
cd monorepo
git sparse-checkout set services/api infra/terraform`,
        },
      ],
    },
    {
      title: 'Git в CI/CD и GitOps',
      content: `CI почти всегда триггерится на **push** и **pull_request**.

**Типичные проверки в PR DevOps-репозитория:**
- \`terraform fmt -check\` / \`terraform validate\` / \`terraform plan\`
- Helm lint / kubeconform
- YAML / Ansible lint
- Secret scanning (gitleaks, TruffleHog)
- Container image build + Trivy

**GitOps:** desired state кластера = Git.
- Argo CD / Flux следят за branch (\`main\` или \`env/prod\`)
- Изменение в Git → автоматический (или gated) sync в кластер
- Rollback = \`git revert\` + sync

> Подробнее — в модулях CI/CD (GitHub Actions) и GitOps (Argo CD).`,
    },
    {
      title: 'SSH-ключи для GitHub/GitLab',
      content: `SSH избавляет от постоянного ввода токена. На одной машине — отдельный ключ, на CI — deploy key или machine user.`,
      codes: [
        {
          language: 'bash',
          caption: 'Создание ключа и добавление в ssh-agent',
          code: `ssh-keygen -t ed25519 -C "you@company.com" -f ~/.ssh/id_ed25519_github
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_github
cat ~/.ssh/id_ed25519_github.pub
# → вставь в GitHub → Settings → SSH keys

ssh -T git@github.com
# Hi username! You've successfully authenticated...`,
        },
      ],
    },
    {
      title: 'Чеклист и типичные ошибки',
      content: `**Перед каждым push проверь:**
- [ ] Нет секретов в diff (\`git diff --staged\`)
- [ ] \`.gitignore\` покрывает \`.env\`, \`*.tfstate\`, ключи
- [ ] Сообщения коммитов понятны (conventional commits)
- [ ] Ветка от актуального \`main\`
- [ ] Локально прогнал то, что упадёт в CI

**Частые ошибки новичков:**
1. \`git commit -m "fix"\` без контекста — через месяц не поймёшь
2. Коммит \`.env\` → срочная ротация ключей
3. \`git push --force\` в \`main\` — ломает историю команды
4. Огромный PR на 2000 строк — никто не ревьюит качественно
5. Rebase уже запушенной shared-ветки без согласования
6. \`git reset --hard\` «на всякий случай» — потеря работы

**Шпаргалка дня:**
\`\`\`
status → add → commit → push
switch -c feature/... → работа → push -u → PR
stash когда срочный hotfix
reflog когда «всё пропало»
\`\`\``,
    },
  ],
  practice: [
    'Создай репозиторий devops-handbook-practice на GitHub: README, .gitignore, LICENSE (MIT)',
    'Сделай 5 коммитов с conventional commits: feat, fix, docs, ci, chore',
    'Создай ветку feature/nginx, добавь файл, merge через PR (или локально с --no-ff)',
    'Создай merge conflict намеренно: две ветки меняют одну строку — разреши и закоммить',
    'Попрактикуй rebase: feature от старого main → rebase на актуальный main',
    'Используй git stash: незакоммиченные изменения → stash → switch branch → stash pop',
    'Создай annotated tag v0.1.0 и запушь. Проверь на GitHub Releases',
    'Настрой branch protection на main: require PR, status checks (можно пустой workflow)',
    'Найди «потерянный» коммит через git reflog после git reset --hard (только в тестовом repo!)',
    'Добавь .pre-commit-config.yaml с trailing-whitespace и gitleaks; прогони pre-commit run --all-files',
    'Настрой SSH-ключ для GitHub и клонируй репозиторий по SSH',
    'Сделай интерактивный rebase последних 3 коммитов: squash двух docs-коммитов в один',
  ],
  resources: [
    { title: 'Pro Git Book (RU)', url: 'https://git-scm.com/book/ru/v2' },
    { title: 'Conventional Commits', url: 'https://www.conventionalcommits.org/' },
    { title: 'Oh Shit, Git!?!', url: 'https://ohshitgit.com/' },
    { title: 'gitignore.io', url: 'https://www.toptal.com/developers/gitignore' },
  ],
}
