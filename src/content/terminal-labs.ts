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

  docker: {
    id: 'docker-basics',
    title: 'Базовые команды Docker',
    intro:
      'Тренажёр синтаксиса Docker: образы и контейнеры не создаются на реальном хосте, но команды проверяются так же, как на рабочей машине с установленным Docker Engine.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/project',
    initialOutput: [
      'Добро пожаловать в тренажёр Docker.',
      'Пройди цикл: версия → pull → images → run → ps → logs.',
    ],
    steps: [
      {
        id: 'docker-version',
        instruction: 'Проверь версию Docker CLI.',
        match: { kind: 'normalized' },
        accept: ['docker --version'],
        hint: 'docker --version — быстрая проверка, что клиент установлен и доступен в PATH.',
        explanation:
          'Перед работой с контейнерами убедись, что docker отвечает. На Linux часто нужна группа docker или sudo; на macOS/Windows — запущен Docker Desktop.',
        fakeOutput: ['Docker version 27.3.1, build ce12230'],
      },
      {
        id: 'docker-pull',
        instruction: 'Скачай образ nginx:alpine с Docker Hub.',
        match: { kind: 'normalized' },
        accept: ['docker pull nginx:alpine'],
        hint: 'docker pull <репозиторий>:<тег> — загрузка слоёв образа локально.',
        explanation:
          'pull скачивает manifest и слои. Тег alpine — лёгкий образ на базе Alpine Linux; в проде часто pinят digest (@sha256:...).',
        fakeOutput: [
          'alpine: Pulling from library/nginx',
          'Digest: sha256:abc123def456...',
          'Status: Downloaded newer image for nginx:alpine',
          'docker.io/library/nginx:alpine',
        ],
      },
      {
        id: 'docker-images',
        instruction: 'Покажи список локальных образов.',
        match: { kind: 'normalized' },
        accept: ['docker images'],
        hint: 'docker images (или docker image ls) — REPOSITORY, TAG, IMAGE ID, SIZE.',
        explanation:
          'Список образов помогает понять, что уже закэшировано. Удаление: docker rmi; очистка dangling: docker image prune.',
        fakeOutput: [
          'REPOSITORY   TAG       IMAGE ID       CREATED        SIZE',
          'nginx        alpine    4a86014ec699   2 weeks ago    52.5MB',
        ],
      },
      {
        id: 'docker-run',
        instruction:
          'Запусти контейнер nginx:alpine в фоне с именем web и пробросом порта 8080→80 (--rm -d).',
        match: { kind: 'normalized' },
        accept: [
          'docker run --rm -d --name web -p 8080:80 nginx:alpine',
        ],
        hint: '-d — detached, --name web — имя для logs/ps, -p 8080:80 — host:container.',
        explanation:
          'run создаёт контейнер из образа. --rm удалит контейнер после остановки. Публикация -p делает сервис доступным на localhost:8080.',
        fakeOutput: ['a1b2c3d4e5f6789012345678901234567890abcd'],
      },
      {
        id: 'docker-ps',
        instruction: 'Покажи запущенные контейнеры.',
        match: { kind: 'normalized' },
        accept: ['docker ps'],
        hint: 'docker ps — только running; docker ps -a — включая остановленные.',
        explanation:
          'ps показывает CONTAINER ID, IMAGE, PORTS, NAMES. Для остановки: docker stop web.',
        fakeOutput: [
          'CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                  NAMES',
          'a1b2c3d4e5f6   nginx:alpine   "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds   0.0.0.0:8080->80/tcp   web',
        ],
      },
      {
        id: 'docker-logs',
        instruction: 'Выведи логи контейнера web.',
        match: { kind: 'normalized' },
        accept: ['docker logs web'],
        hint: 'docker logs <имя|-f для follow> — stdout/stderr процесса PID 1 в контейнере.',
        explanation:
          'Логи контейнера — первый источник при 502/healthcheck failures. -f полезен при отладке; --tail 50 ограничивает вывод.',
        fakeOutput: [
          '/docker-entrypoint.sh: Configuration complete; ready for start up',
          '2026/07/17 10:05:01 [notice] 1#1: start worker processes',
        ],
      },
    ],
  },

  'docker-compose': {
    id: 'docker-compose-basics',
    title: 'Docker Compose в терминале',
    intro:
      'Учебный стенд multi-container приложения: проверяется синтаксис Compose V2 (docker compose) и классической формы docker-compose.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/compose',
    initialOutput: [
      'Каталог содержит docker-compose.yml с сервисом web.',
      'Подними стек, проверь статус, посмотри логи и останови окружение.',
    ],
    steps: [
      {
        id: 'compose-version',
        instruction: 'Проверь версию Compose (docker compose или docker-compose).',
        match: {
          kind: 'anyOf',
          items: [
            { match: { kind: 'normalized' }, accept: ['docker compose version'] },
            { match: { kind: 'normalized' }, accept: ['docker-compose --version'] },
          ],
        },
        accept: [],
        hint: 'Compose V2: docker compose version. Старый бинарник: docker-compose --version.',
        explanation:
          'Docker Desktop и современный Engine включают compose как подкоманду docker. Отдельный docker-compose всё ещё встречается в CI и на legacy-хостах.',
        fakeOutput: [
          'Docker Compose version v2.29.7',
        ],
      },
      {
        id: 'compose-up',
        instruction: 'Запусти сервисы в фоне: docker compose up -d.',
        match: { kind: 'normalized' },
        accept: ['docker compose up -d'],
        hint: 'up -d — detached; без -d логи всех сервисов идут в текущий терминал.',
        explanation:
          'up читает compose-файл, создаёт сеть/volumes и контейнеры. --build пересобирает образы; --force-recreate пересоздаёт контейнеры.',
        fakeOutput: [
          '[+] Running 2/2',
          ' ✔ Network compose_default  Created',
          ' ✔ Container compose-web-1  Started',
        ],
      },
      {
        id: 'compose-ps',
        instruction: 'Покажи статус сервисов Compose.',
        match: { kind: 'normalized' },
        accept: ['docker compose ps'],
        hint: 'docker compose ps — аналог docker ps, но только для проекта из текущего каталога.',
        explanation:
          'ps удобен после up: видны NAME, SERVICE, STATUS, PORTS. Имя проекта по умолчанию — имя каталога.',
        fakeOutput: [
          'NAME            IMAGE          COMMAND                  SERVICE   CREATED         STATUS         PORTS',
          'compose-web-1   nginx:alpine   "/docker-entrypoint.…"   web       10 seconds ago  Up 9 seconds   0.0.0.0:8080->80/tcp',
        ],
      },
      {
        id: 'compose-logs',
        instruction:
          'Посмотри логи сервиса web (docker compose logs -f web или docker compose logs web).',
        match: {
          kind: 'anyOf',
          items: [
            {
              match: { kind: 'normalized' },
              accept: ['docker compose logs -f web'],
            },
            { match: { kind: 'normalized' }, accept: ['docker compose logs web'] },
          ],
        },
        accept: [],
        hint: 'logs web — разово; -f — follow, как tail -f.',
        explanation:
          'Логи агрегируются по сервисам из compose-файла. Для нескольких сервисов: docker compose logs -f web api.',
        fakeOutput: [
          'web-1  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh',
          'web-1  | 2026/07/17 10:10:00 [notice] 1#1: start worker process 30',
        ],
      },
      {
        id: 'compose-down',
        instruction: 'Останови и удали контейнеры проекта: docker compose down.',
        match: { kind: 'normalized' },
        accept: ['docker compose down'],
        hint: 'down — stop + rm контейнеров; -v дополнительно удалит named volumes.',
        explanation:
          'down освобождает порты и сеть проекта. На shared dev-машинах не забывай -v только когда данные можно потерять.',
        fakeOutput: [
          '[+] Running 2/2',
          ' ✔ Container compose-web-1  Removed',
          ' ✔ Network compose_default  Removed',
        ],
      },
    ],
  },

  'kubernetes-basics': {
    id: 'kubernetes-basics',
    title: 'kubectl: первые шаги',
    intro:
      'Тренажёр kubectl: кластер не трогаем, но отрабатываем типичный цикл деплоя — от обзора до logs/describe.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/k8s',
    initialOutput: [
      'Контекст: учебный кластер, namespace default.',
      'В каталоге лежит deployment.yaml для nginx.',
    ],
    steps: [
      {
        id: 'kubectl-nodes',
        instruction: 'Покажи узлы кластера: kubectl get nodes.',
        match: { kind: 'normalized' },
        accept: ['kubectl get nodes'],
        hint: 'get nodes — STATUS Ready означает, что kubelet отвечает.',
        explanation:
          'Первый sanity-check после настройки kubeconfig. NotReady часто связан с CNI, диском или сертификатами.',
        fakeOutput: [
          'NAME           STATUS   ROLES           AGE   VERSION',
          'node-pool-1    Ready    control-plane   30d   v1.30.2',
          'node-pool-2    Ready    <none>          30d   v1.30.2',
        ],
      },
      {
        id: 'kubectl-pods-all',
        instruction: 'Выведи поды во всех namespace: kubectl get pods -A.',
        match: { kind: 'normalized' },
        accept: ['kubectl get pods -A'],
        hint: '-A (--all-namespaces) — системные поды kube-system, ingress и т.д.',
        explanation:
          'Обзор всего кластера: ищи CrashLoopBackOff, Pending, ImagePullBackOff. Без -A видишь только текущий namespace из контекста.',
        fakeOutput: [
          'NAMESPACE     NAME                              READY   STATUS    RESTARTS   AGE',
          'kube-system   coredns-7c94789d5-xxxxx           1/1     Running   0          30d',
          'kube-system   kube-proxy-abcde                  1/1     Running   0          30d',
          'default       web-6d4b8c9f7-xxxxx               1/1     Running   0          2d',
        ],
      },
      {
        id: 'kubectl-apply',
        instruction: 'Примени манифест deployment.yaml: kubectl apply -f deployment.yaml.',
        match: { kind: 'normalized' },
        accept: ['kubectl apply -f deployment.yaml'],
        hint: 'apply -f — декларативное создание/обновление ресурсов из файла.',
        explanation:
          'apply сравнивает желаемое состояние с live object. Для одноразовых императивных команд есть create/run, но GitOps опирается на apply.',
        fakeOutput: [
          'deployment.apps/web created',
          'service/web unchanged',
        ],
      },
      {
        id: 'kubectl-get-pods',
        instruction: 'Проверь поды в текущем namespace: kubectl get pods.',
        match: { kind: 'normalized' },
        accept: ['kubectl get pods'],
        hint: 'get pods — добавь -o wide для NODE/IP или -w для watch.',
        explanation:
          'После apply жди Running и READY 1/1. Если Pending — смотри events: kubectl describe pod ...',
        fakeOutput: [
          'NAME                   READY   STATUS    RESTARTS   AGE',
          'web-7f9c6d8b5-abcde    1/1     Running   0          12s',
        ],
      },
      {
        id: 'kubectl-describe',
        instruction:
          'Опиши под (kubectl describe pod <имя>) — достаточно начала команды describe pod.',
        match: { kind: 'prefix' },
        accept: ['kubectl describe pod'],
        hint: 'describe pod <name> — Events внизу часто объясняют OOM, probe failures, scheduling.',
        explanation:
          'describe показывает labels, conditions, volumes и Events от scheduler/kubelet. Имя пода возьми из вывода get pods.',
        fakeOutput: [
          'Name:         web-7f9c6d8b5-abcde',
          'Namespace:    default',
          'Status:       Running',
          'Events:',
          '  Type    Reason     Age   Message',
          '  ----    ------     ----  -------',
          '  Normal  Scheduled  30s   Successfully assigned default/web-... to node-pool-2',
          '  Normal  Pulled     28s   Container image "nginx:alpine" already present on machine',
        ],
      },
      {
        id: 'kubectl-logs',
        instruction: 'Сними логи с пода: kubectl logs ... (имя пода из get pods).',
        match: { kind: 'prefix' },
        accept: ['kubectl logs'],
        hint: 'kubectl logs <pod> — для Deployment добавь -l app=web или имя конкретного pod.',
        explanation:
          'logs читает stdout контейнеров. -c выбирает контейнер в multi-container pod; --previous — логи упавшего инстанса.',
        fakeOutput: [
          '/docker-entrypoint.sh: Configuration complete; ready for start up',
          '127.0.0.1 - - [17/Jul/2026:10:15:01 +0000] "GET / HTTP/1.1" 200 615',
        ],
      },
    ],
  },

  bash: {
    id: 'bash-basics',
    title: 'Bash: скрипты и окружение',
    intro:
      'Мини-лаборатория по shell: echo, права на файл, запуск скрипта и расширение PATH — без реального выполнения на хосте.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~',
    initialOutput: [
      'В домашнем каталоге лежит script.sh.',
      'Отработай базовый цикл подготовки и запуска shell-скрипта.',
    ],
    steps: [
      {
        id: 'echo-hello',
        instruction: 'Выведи строку hello: echo "hello".',
        match: { kind: 'normalized' },
        accept: ['echo "hello"'],
        hint: 'Кавычки сохраняют строку как один аргумент; без них echo тоже сработает для одного слова.',
        explanation:
          'echo — простая проверка, что shell жив. В скриптах предпочитают printf для переносимого форматирования.',
        fakeOutput: ['hello'],
      },
      {
        id: 'which-bash',
        instruction: 'Узнай путь к интерпретатору bash: which bash.',
        match: { kind: 'normalized' },
        accept: ['which bash'],
        hint: 'which ищет исполняемый файл в $PATH; на Linux часто /usr/bin/bash.',
        explanation:
          'Shebang #!/usr/bin/env bash переносимее, чем hardcode пути. which помогает проверить, что bash доступен в non-interactive SSH.',
        fakeOutput: ['/usr/bin/bash'],
      },
      {
        id: 'chmod-script',
        instruction: 'Сделай script.sh исполняемым: chmod +x script.sh.',
        match: { kind: 'normalized' },
        accept: ['chmod +x script.sh'],
        hint: '+x добавляет бит исполнения; альтернатива — chmod 755 script.sh.',
        explanation:
          'Без +x запуск ./script.sh даст Permission denied. Права проверяй ls -l script.sh.',
        fakeOutput: [''],
      },
      {
        id: 'run-script',
        instruction: 'Запусти скрипт из текущего каталога: ./script.sh.',
        match: { kind: 'normalized' },
        accept: ['./script.sh'],
        hint: './ — явный путь; текущий каталог обычно не входит в PATH из соображений безопасности.',
        explanation:
          'Относительный запуск требует execute bit. Для отладки: bash -x ./script.sh показывает трассировку.',
        fakeOutput: [
          'Deploy starting...',
          'OK: nginx config valid',
        ],
      },
      {
        id: 'export-path',
        instruction:
          'Добавь /opt/bin в PATH для текущей сессии: export PATH=$PATH:/opt/bin.',
        match: { kind: 'normalized' },
        accept: ['export PATH=$PATH:/opt/bin'],
        hint: 'export делает переменную видимой дочерним процессам; $PATH — существующие директории поиска.',
        explanation:
          'Изменение PATH в shell временное. Для постоянства — строка в ~/.bashrc или /etc/profile.d/. Не дублируй путь при каждом export.',
        fakeOutput: [''],
      },
    ],
  },

  ssh: {
    id: 'ssh-basics',
    title: 'SSH: ключи, доступ и туннели',
    intro:
      'Тренажёр синтаксиса OpenSSH: ключи, копирование на сервер, сессия, scp и local port forwarding — команды не уходят в сеть.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~',
    initialOutput: [
      'Учебный сервер: user@server (в тренажёре — заглушка).',
      'Сгенерируй ключ, настрой доступ и отработай scp/туннель.',
    ],
    steps: [
      {
        id: 'ssh-keygen',
        instruction:
          'Сгенерируй ключ Ed25519 с комментарием: ssh-keygen -t ed25519 -C "devops@lab".',
        match: { kind: 'normalized' },
        accept: ['ssh-keygen -t ed25519 -C "devops@lab"'],
        hint: '-t ed25519 — современный алгоритм; -C — метка в конце .pub для audit.',
        explanation:
          'По умолчанию ключи в ~/.ssh/id_ed25519. Задай passphrase для защиты при утечке файла; ssh-agent хранит расшифрованный ключ в сессии.',
        fakeOutput: [
          'Generating public/private ed25519 key pair.',
          'Your identification has been saved in /home/student/.ssh/id_ed25519',
          'Your public key has been saved in /home/student/.ssh/id_ed25519.pub',
        ],
      },
      {
        id: 'ssh-copy-id',
        instruction:
          'Скопируй публичный ключ на сервер: ssh-copy-id user@server (или эквивалент через ssh user@server).',
        match: {
          kind: 'anyOf',
          items: [
            {
              match: { kind: 'normalized' },
              accept: ['ssh-copy-id user@server'],
            },
            { match: { kind: 'normalized' }, accept: ['ssh user@server'] },
          ],
        },
        accept: [],
        hint: 'ssh-copy-id дописывает ключ в ~/.ssh/authorized_keys на удалённой машине.',
        explanation:
          'После copy-id вход по паролю можно отключить (PasswordAuthentication no). Проверяй права: ~/.ssh 700, authorized_keys 600.',
        fakeOutput: [
          'Number of key(s) added: 1',
          'Now try logging into the machine, with:   ssh user@server',
        ],
      },
      {
        id: 'ssh-login',
        instruction: 'Подключись по SSH: ssh user@server.',
        match: { kind: 'normalized' },
        accept: ['ssh user@server'],
        hint: 'user@host — опционально -p порт, -i путь к ключу, -J jump-host для bastion.',
        explanation:
          'Первое подключение спросит fingerprint host key — сверяй out-of-band. Config в ~/.ssh/config сокращает длинные команды.',
        fakeOutput: [
          'Welcome to Ubuntu 22.04 LTS (GNU/Linux 5.15 x86_64)',
          'Last login: Fri Jul 17 10:00:00 2026 from 203.0.113.10',
        ],
      },
      {
        id: 'scp-file',
        instruction: 'Скопируй file.txt на сервер: scp file.txt user@server:/tmp/.',
        match: { kind: 'normalized' },
        accept: ['scp file.txt user@server:/tmp/'],
        hint: 'scp использует тот же SSH-транспорт; -r для каталогов.',
        explanation:
          'Для больших деревьев часто быстрее rsync -avz. scp удобен для одиночных файлов и exam-style задач.',
        fakeOutput: ['file.txt                    100%  4KB   1.2MB/s   00:00'],
      },
      {
        id: 'ssh-tunnel',
        instruction:
          'Подними local forward: ssh -L 8080:localhost:80 user@server.',
        match: { kind: 'normalized' },
        accept: ['ssh -L 8080:localhost:80 user@server'],
        hint: '-L localPort:targetHost:targetPort — localhost на сервере часто nginx на :80.',
        explanation:
          'Local forwarding пробрасывает порт через SSH-туннель: curl localhost:8080 на ноутбуке → сервис на server:80. -N без shell, -f в фоне.',
        fakeOutput: [
          'bind [127.0.0.1]:8080: Address already in use',
          '(в учебном выводе туннель установлен; открой http://127.0.0.1:8080 локально)',
        ],
      },
    ],
  },

  nginx: {
    id: 'nginx-basics',
    title: 'Nginx: проверка и эксплуатация',
    intro:
      'Команды администратора nginx на Linux с systemd: тест конфига, reload, vhosts, HTTP-проверка и журнал службы.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '/etc/nginx',
    initialOutput: [
      'Служба nginx установлена; конфиги в /etc/nginx.',
      'Проверь синтаксис, перезагрузи без даунтайма и убедись, что сайт отвечает.',
    ],
    steps: [
      {
        id: 'nginx-test',
        instruction: 'Проверь конфигурацию: nginx -t.',
        match: { kind: 'normalized' },
        accept: ['nginx -t'],
        hint: 'nginx -t — test; на systemd часто sudo nginx -t от root.',
        explanation:
          'Всегда -t перед reload/restart. Ошибка в include или SSL-сертификате остановит reload и оставит старый worker pool.',
        fakeOutput: [
          'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok',
          'nginx: configuration file /etc/nginx/nginx.conf test is successful',
        ],
      },
      {
        id: 'nginx-reload',
        instruction: 'Примени конфиг без полной остановки: systemctl reload nginx.',
        match: { kind: 'normalized' },
        accept: ['systemctl reload nginx'],
        hint: 'reload шлёт HUP master-процессу; restart обрывает соединения.',
        explanation:
          'reload подхватывает новые server{} и upstream. При фатальной ошибке после правок откатывай конфиг и снова nginx -t.',
        fakeOutput: [''],
      },
      {
        id: 'nginx-sites-enabled',
        instruction: 'Посмотри включённые сайты: ls /etc/nginx/sites-enabled.',
        match: { kind: 'normalized' },
        accept: ['ls /etc/nginx/sites-enabled'],
        hint: 'На Debian/Ubuntu sites-enabled — симлинки на sites-available.',
        explanation:
          'Каждый файл — server block. Отключение: rm symlink + reload. На RHEL конфиги часто в /etc/nginx/conf.d/*.conf.',
        fakeOutput: [
          'default -> /etc/nginx/sites-available/default',
          'app.conf -> /etc/nginx/sites-available/app.conf',
        ],
      },
      {
        id: 'curl-localhost',
        instruction: 'Проверь заголовки ответа: curl -I http://localhost.',
        match: { kind: 'normalized' },
        accept: ['curl -I http://localhost'],
        hint: '-I — только HTTP headers (HEAD); -v для verbose TLS/redirect.',
        explanation:
          'Ожидай HTTP/1.1 200 или 301. 502 часто значит мёртвый upstream; смотри error.log и systemctl status nginx.',
        fakeOutput: [
          'HTTP/1.1 200 OK',
          'Server: nginx/1.24.0',
          'Content-Type: text/html',
          'Content-Length: 615',
        ],
      },
      {
        id: 'journalctl-nginx',
        instruction:
          'Покажи последние строки журнала nginx (journalctl -u nginx -n 50 или -n 20).',
        match: {
          kind: 'anyOf',
          items: [
            {
              match: { kind: 'normalized' },
              accept: ['journalctl -u nginx -n 50'],
            },
            {
              match: { kind: 'normalized' },
              accept: ['journalctl -u nginx -n 20'],
            },
          ],
        },
        accept: [],
        hint: 'journalctl -u nginx — логи unit; -n ограничивает число строк, -f follow.',
        explanation:
          'systemd агрегирует stdout/stderr службы. Дополнительно смотри /var/log/nginx/access.log и error.log для HTTP-деталей.',
        fakeOutput: [
          'Jul 17 10:20:01 devops-handbook systemd[1]: Reloading nginx.service...',
          'Jul 17 10:20:01 devops-handbook nginx[1234]: signal process started',
        ],
      },
    ],
  },

  terraform: {
    id: 'terraform-basics',
    title: 'Terraform: init → destroy',
    intro:
      'Тренажёр HashiCorp Terraform: CLI-команды lifecycle инфраструктуры as code — state не меняется, проверяется только синтаксис.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/infra',
    initialOutput: [
      'Каталог ~/infra содержит main.tf для учебного ресурса.',
      'Пройди полный цикл: version, init, plan, apply, state list, destroy.',
    ],
    steps: [
      {
        id: 'terraform-version',
        instruction: 'Проверь версию Terraform: terraform version.',
        match: { kind: 'normalized' },
        accept: ['terraform version'],
        hint: 'version показывает CLI и optional lock file constraints.',
        explanation:
          'В CI pinят версию через tfenv, asdf или hashicorp/setup-terraform. Несовпадение версий ломает state format и provider protocol.',
        fakeOutput: [
          'Terraform v1.9.5',
          'on darwin_arm64',
        ],
      },
      {
        id: 'terraform-init',
        instruction: 'Инициализируй рабочую директорию: terraform init.',
        match: { kind: 'normalized' },
        accept: ['terraform init'],
        hint: 'init скачивает providers и настраивает backend (local/S3/GCS...).',
        explanation:
          'После добавления provider или смены backend снова terraform init. -upgrade обновляет provider versions в lock file.',
        fakeOutput: [
          'Initializing the backend...',
          'Initializing provider plugins...',
          'Terraform has been successfully initialized!',
        ],
      },
      {
        id: 'terraform-plan',
        instruction: 'Построй план изменений: terraform plan.',
        match: { kind: 'normalized' },
        accept: ['terraform plan'],
        hint: 'plan — dry-run: + create, ~ update, - destroy в выводе.',
        explanation:
          'plan сохраняют в CI артеfact (terraform plan -out=tfplan) для audited apply. -var и -var-file подставляют переменные.',
        fakeOutput: [
          'Plan: 1 to add, 0 to change, 0 to destroy.',
          '  # aws_instance.web will be created',
        ],
      },
      {
        id: 'terraform-apply',
        instruction:
          'Примени изменения без интерактива: terraform apply -auto-approve.',
        match: { kind: 'normalized' },
        accept: ['terraform apply -auto-approve'],
        hint: 'В prod избегай -auto-approve без review plan; в lab — норма.',
        explanation:
          'apply записывает state. При drift между state и реальностью — terraform refresh (legacy) или plan/apply cycle.',
        fakeOutput: [
          'Apply complete! Resources: 1 added, 0 changed, 0 destroyed.',
          'Outputs:',
          '  public_ip = "203.0.113.50"',
        ],
      },
      {
        id: 'terraform-state-list',
        instruction: 'Покажи ресурсы в state: terraform state list.',
        match: { kind: 'normalized' },
        accept: ['terraform state list'],
        hint: 'state list — адреса ресурсов; state show <addr> — атрибуты одного.',
        explanation:
          'State — источник правды для Terraform. Remote backend (S3+DynamoDB) нужен для командной работы и locking.',
        fakeOutput: [
          'aws_instance.web',
          'aws_security_group.web_sg',
        ],
      },
      {
        id: 'terraform-destroy',
        instruction: 'Удали инфраструктуру из конфига: terraform destroy -auto-approve.',
        match: { kind: 'normalized' },
        accept: ['terraform destroy -auto-approve'],
        hint: 'destroy — обратный apply; target: -target для частичного удаления.',
        explanation:
          'После destroy state пуст для удалённых ресурсов. Защита prod: workspace separation, IAM, и manual approval gates.',
        fakeOutput: [
          'Destroy complete! Resources: 2 destroyed.',
        ],
      },
    ],
  },

  ansible: {
    id: 'ansible-basics',
    title: 'Ansible: ping → playbook check',
    intro:
      'Тренажёр Ansible CLI: inventory и playbook не трогают реальные хосты — проверяется синтаксис типичного цикла администрирования.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/ansible',
    initialOutput: [
      'Каталог ~/ansible: inventory, site.yml, ansible.cfg.',
      'Пройди цикл: version → ping → playbook --check → galaxy collections.',
    ],
    steps: [
      {
        id: 'ansible-version',
        instruction: 'Проверь версию Ansible: ansible --version.',
        match: { kind: 'normalized' },
        accept: ['ansible --version'],
        hint: 'ansible --version — CLI, Python и путь к ansible.cfg.',
        explanation:
          'Версия core и коллекций важна для модулей. В CI pinят ansible-core через pip/requirements или пакет дистрибутива.',
        fakeOutput: [
          'ansible [core 2.16.8]',
          '  config file = /home/student/ansible/ansible.cfg',
          '  configured module search path = [\'/home/student/.ansible/plugins/modules\']',
          '  python version = 3.12.3',
        ],
      },
      {
        id: 'ansible-ping',
        instruction: 'Проверь связность всех хостов модулем ping: ansible all -m ping.',
        match: { kind: 'normalized' },
        accept: ['ansible all -m ping'],
        hint: 'all — группа из inventory; -m ping — встроенный модуль connectivity.',
        explanation:
          'ping по SSH подтверждает ключи, user и python на целевых хостах. FAILURE часто из-за host_key_checking или wrong ansible_user.',
        fakeOutput: [
          'web1 | SUCCESS => {',
          '    "changed": false,',
          '    "ping": "pong"',
          '}',
        ],
      },
      {
        id: 'ansible-playbook-check',
        instruction:
          'Запусти playbook в dry-run: ansible-playbook site.yml --check.',
        match: { kind: 'normalized' },
        accept: ['ansible-playbook site.yml --check'],
        hint: '--check — check mode (не все модули поддерживают); без него применит изменения.',
        explanation:
          'check mode показывает, что изменилось бы. Для полного diff добавь --diff. Idempotent tasks не должны давать changed повторно.',
        fakeOutput: [
          'PLAY [Configure web servers] ***************************************************',
          'TASK [Gathering Facts] *********************************************************',
          'ok: [web1]',
          'TASK [Ensure nginx is installed] ***********************************************',
          'changed: [web1]',
          'PLAY RECAP *********************************************************************',
          'web1                       : ok=2    changed=1    unreachable=0    failed=0',
        ],
      },
      {
        id: 'ansible-playbook-limit',
        instruction:
          'Ограничь playbook группой web: ansible-playbook site.yml --limit web.',
        match: { kind: 'normalized' },
        accept: ['ansible-playbook site.yml --limit web'],
        hint: '--limit принимает host/group из inventory; можно web1 или web:&prod.',
        explanation:
          'limit сужает blast radius при поэтапном rollout. В CI часто комбинируют с --check и tag-фильтрами (--tags).',
        fakeOutput: [
          'PLAY [Configure web servers] ***************************************************',
          'PLAY RECAP *********************************************************************',
          'web1                       : ok=3    changed=0    unreachable=0    failed=0',
        ],
      },
      {
        id: 'ansible-galaxy-list',
        instruction: 'Покажи установленные коллекции: ansible-galaxy collection list.',
        match: { kind: 'normalized' },
        accept: ['ansible-galaxy collection list'],
        hint: 'galaxy collection list — community.general, amazon.aws и путь установки.',
        explanation:
          'Коллекции ставят через ansible-galaxy collection install -r requirements.yml. Версии фиксируют в requirements для воспроизводимости.',
        fakeOutput: [
          '# /home/student/.ansible/collections/ansible_collections',
          'Collection               Version',
          '------------------------ -------',
          'ansible.posix            1.5.4',
          'community.general        9.1.0',
        ],
      },
    ],
  },

  helm: {
    id: 'helm-basics',
    title: 'Helm: repo → install → uninstall',
    intro:
      'Тренажёр Helm 3: charts ставятся в учебный контекст kubectl — реальный кластер не меняется, проверяется синтаксис CLI.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/charts',
    initialOutput: [
      'kubeconfig указывает на учебный кластер.',
      'Добавь repo Bitnami, найди nginx, установи release, проверь list и удали.',
    ],
    steps: [
      {
        id: 'helm-version',
        instruction: 'Проверь версию Helm: helm version.',
        match: { kind: 'normalized' },
        accept: ['helm version'],
        hint: 'helm version — клиент v3; серверный tiller в Helm 3 не нужен.',
        explanation:
          'Helm 3 хранит release secrets/configmaps в namespace. Pin версию CLI в CI, чтобы templating не расходился.',
        fakeOutput: [
          'version.BuildInfo{Version:"v3.15.3", GitCommit:"...", GoVersion:"go1.22.5"}',
        ],
      },
      {
        id: 'helm-repo-add',
        instruction:
          'Добавь репозиторий Bitnami: helm repo add bitnami https://charts.bitnami.com/bitnami.',
        match: { kind: 'normalized' },
        accept: ['helm repo add bitnami https://charts.bitnami.com/bitnami'],
        hint: 'repo add <имя> <URL> — затем обычно helm repo update.',
        explanation:
          'Имя bitnami становится префиксом chart (bitnami/nginx). Несколько repos: helm repo list; обновление индексов — helm repo update.',
        fakeOutput: ['"bitnami" has been added to your repositories'],
      },
      {
        id: 'helm-search',
        instruction: 'Найди chart nginx в репозиториях: helm search repo nginx.',
        match: { kind: 'normalized' },
        accept: ['helm search repo nginx'],
        hint: 'search repo <keyword> ищет по локальному индексу после repo add/update.',
        explanation:
          'В выводе — CHART VERSION и APP VERSION. Точный chart: bitnami/nginx. Для OCI-реестров используют helm pull oci://...',
        fakeOutput: [
          'NAME                    CHART VERSION   APP VERSION     DESCRIPTION',
          'bitnami/nginx           18.2.0          1.27.0          NGINX Open Source...',
        ],
      },
      {
        id: 'helm-install',
        instruction:
          'Установи release my-nginx из bitnami/nginx: helm install my-nginx bitnami/nginx.',
        match: { kind: 'normalized' },
        accept: ['helm install my-nginx bitnami/nginx'],
        hint: 'install <release> <chart> — namespace по умолчанию из kubeconfig; -n задаёт другой.',
        explanation:
          'install создаёт Deployment/Service и пишет release. values: -f values.yaml или --set. Upgrade: helm upgrade my-nginx bitnami/nginx.',
        fakeOutput: [
          'NAME: my-nginx',
          'LAST DEPLOYED: Fri Jul 17 10:30:00 2026',
          'NAMESPACE: default',
          'STATUS: deployed',
          'REVISION: 1',
        ],
      },
      {
        id: 'helm-list',
        instruction: 'Покажи установленные releases: helm list.',
        match: { kind: 'normalized' },
        accept: ['helm list'],
        hint: 'list (ls) — NAME, NAMESPACE, REVISION, STATUS; -A для всех namespaces.',
        explanation:
          'После install STATUS должен быть deployed. Failed/pending-install — смотри kubectl get events и helm status my-nginx.',
        fakeOutput: [
          'NAME      NAMESPACE  REVISION  UPDATED                   STATUS    CHART          APP VERSION',
          'my-nginx  default    1         2026-07-17 10:30:00       deployed  nginx-18.2.0   1.27.0',
        ],
      },
      {
        id: 'helm-uninstall',
        instruction: 'Удали release my-nginx: helm uninstall my-nginx.',
        match: { kind: 'normalized' },
        accept: ['helm uninstall my-nginx'],
        hint: 'uninstall (delete) снимает ресурсы release; --keep-history сохраняет историю.',
        explanation:
          'uninstall удаляет манифесты chart. PV/PVC с reclaim Retain могут остаться — проверь kubectl get pvc.',
        fakeOutput: ['release "my-nginx" uninstalled'],
      },
    ],
  },

  'github-actions': {
    id: 'github-actions-basics',
    title: 'GitHub Actions: workflows и runs',
    intro:
      'Тренажёр GitHub CLI вокруг Actions: локальный .github/workflows и команды gh — без реального API GitHub, только синтаксис.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/project',
    initialOutput: [
      'Репозиторий содержит .github/workflows/ci.yml.',
      'Осмотри workflows, список runs и содержимое CI-файла.',
    ],
    steps: [
      {
        id: 'ls-workflows',
        instruction: 'Покажи файлы workflows: ls .github/workflows.',
        match: { kind: 'normalized' },
        accept: ['ls .github/workflows'],
        hint: 'В каталоге .github/workflows лежат YAML: ci.yml, deploy.yml и т.д.',
        explanation:
          'Каждый .yml/.yaml — workflow. Имя файла не обязано совпадать с name: внутри; GitHub индексирует оба.',
        fakeOutput: ['ci.yml  deploy.yml'],
      },
      {
        id: 'gh-workflow-list',
        instruction: 'Выведи список workflows через gh: gh workflow list.',
        match: { kind: 'normalized' },
        accept: ['gh workflow list'],
        hint: 'Нужен gh auth login; list показывает NAME, STATE (active), ID.',
        explanation:
          'gh workflow list читает workflows репозитория текущего remote. disable/enable переключают STATE без удаления файла.',
        fakeOutput: [
          'NAME  STATE   ID',
          'CI    active  12345678',
          'Deploy  active  87654321',
        ],
      },
      {
        id: 'gh-run-list',
        instruction: 'Покажи недавние runs: gh run list.',
        match: { kind: 'normalized' },
        accept: ['gh run list'],
        hint: 'run list — STATUS, TITLE, WORKFLOW, BRANCH; --limit 5 сужает вывод.',
        explanation:
          'После push/PR появляются runs. Детали: gh run view <id>; логи: gh run view <id> --log. Перезапуск: gh run rerun <id>.',
        fakeOutput: [
          'completed  success  CI  CI  main  push  99887766  2m12s  2026-07-17T10:00:00Z',
          'completed  failure  CI  CI  feature/x  push  99887755  1m03s  2026-07-17T09:40:00Z',
        ],
      },
      {
        id: 'cat-ci-yml',
        instruction: 'Открой CI workflow: cat .github/workflows/ci.yml.',
        match: { kind: 'normalized' },
        accept: ['cat .github/workflows/ci.yml'],
        hint: 'Внутри — on:, jobs:, steps: с uses:/run: — основа Actions YAML.',
        explanation:
          'Читай triggers (push/pull_request), runners (runs-on) и steps. Секреты — ${{ secrets.* }}; не коммить токены в plaintext.',
        fakeOutput: [
          'name: CI',
          'on:',
          '  push:',
          '    branches: [main]',
          'jobs:',
          '  build:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - run: npm test',
        ],
      },
      {
        id: 'gh-auth-or-act',
        instruction:
          'Проверь auth CLI или локальный runner: gh auth status (или act --list).',
        match: {
          kind: 'anyOf',
          items: [
            { match: { kind: 'normalized' }, accept: ['gh auth status'] },
            { match: { kind: 'normalized' }, accept: ['act --list'] },
          ],
        },
        accept: [],
        hint: 'gh auth status — токен/scopes; act --list — локальный прогон workflows через Docker (nektos/act).',
        explanation:
          'Без auth gh workflow/run не ходят в API. act полезен для быстрой проверки YAML локально до push.',
        fakeOutput: [
          'github.com',
          '  ✓ Logged in to github.com as student (GITHUB_TOKEN)',
          '  ✓ Git operations protocol: https',
          '  ✓ Token: gho_************************************',
        ],
      },
    ],
  },

  'aws-basics': {
    id: 'aws-basics',
    title: 'AWS CLI: identity → S3 → EC2 → EKS',
    intro:
      'Тренажёр AWS CLI v2: credentials не уходят в облако — отрабатывается синтаксис типичных read-only команд.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~',
    initialOutput: [
      'Профиль default настроен (учебная заглушка).',
      'Проверь identity, затем S3, EC2 и список EKS-кластеров.',
    ],
    steps: [
      {
        id: 'aws-sts-identity',
        instruction:
          'Узнай, под каким principal ты работаешь: aws sts get-caller-identity.',
        match: { kind: 'normalized' },
        accept: ['aws sts get-caller-identity'],
        hint: 'STS возвращает Account, Arn, UserId — первый sanity-check после aws configure.',
        explanation:
          'get-caller-identity не требует спец. IAM permissions сверх sts:GetCallerIdentity. Неверный ключ/регион сразу виден здесь.',
        fakeOutput: [
          '{',
          '    "UserId": "AIDAEXAMPLE",',
          '    "Account": "123456789012",',
          '    "Arn": "arn:aws:iam::123456789012:user/student"',
          '}',
        ],
      },
      {
        id: 'aws-s3-ls',
        instruction: 'Перечисли S3 buckets: aws s3 ls.',
        match: { kind: 'normalized' },
        accept: ['aws s3 ls'],
        hint: 's3 ls без аргументов — buckets аккаунта; aws s3 ls s3://bucket/ — объекты.',
        explanation:
          'High-level s3-команды удобны в shell. Для IAM/политик чаще используют s3api. Доступ: s3:ListAllMyBuckets.',
        fakeOutput: [
          '2026-01-10 12:00:00 app-artifacts-prod',
          '2026-03-02 09:15:00 terraform-state-lab',
        ],
      },
      {
        id: 'aws-ec2-describe',
        instruction: 'Опиши EC2 instances: aws ec2 describe-instances.',
        match: { kind: 'normalized' },
        accept: ['aws ec2 describe-instances'],
        hint: 'describe-instances — JSON со всеми reservations; --query/--filters сужают вывод.',
        explanation:
          'В проде почти всегда добавляют --filters Name=instance-state-name,Values=running и --query для InstanceId/PrivateIpAddress.',
        fakeOutput: [
          '{',
          '    "Reservations": [',
          '        {',
          '            "Instances": [',
          '                {',
          '                    "InstanceId": "i-0abc123def456",',
          '                    "InstanceType": "t3.micro",',
          '                    "State": { "Name": "running" }',
          '                }',
          '            ]',
          '        }',
          '    ]',
          '}',
        ],
      },
      {
        id: 'aws-eks-list',
        instruction: 'Покажи EKS-кластеры: aws eks list-clusters.',
        match: { kind: 'normalized' },
        accept: ['aws eks list-clusters'],
        hint: 'list-clusters — имена в текущем регионе; --region меняет scope.',
        explanation:
          'Дальше: aws eks update-kubeconfig --name <cluster> пишет kubeconfig. Права: eks:ListClusters / DescribeCluster.',
        fakeOutput: [
          '{',
          '    "clusters": [',
          '        "lab-eks",',
          '        "staging-eks"',
          '    ]',
          '}',
        ],
      },
      {
        id: 'aws-region-or-help',
        instruction:
          'Уточни регион CLI: aws configure get region (или aws sts get-caller-identity --query Account --output text).',
        match: {
          kind: 'anyOf',
          items: [
            {
              match: { kind: 'normalized' },
              accept: ['aws configure get region'],
            },
            {
              match: { kind: 'normalized' },
              accept: [
                'aws sts get-caller-identity --query Account --output text',
              ],
            },
          ],
        },
        accept: [],
        hint: 'configure get region читает ~/.aws/config; --query/--output text удобны в скриптах.',
        explanation:
          'Регион влияет на EC2/EKS/S3 endpoint behavior. В CI задают AWS_REGION / AWS_DEFAULT_REGION явно.',
        fakeOutput: ['eu-central-1'],
      },
    ],
  },

  monitoring: {
    id: 'monitoring-basics',
    title: 'Monitoring: Prometheus health и query',
    intro:
      'Тренажёр Prometheus: health endpoint, проверка конфига promtool и Instant Query API — без реального scrape, только синтаксис.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/monitoring',
    initialOutput: [
      'В каталоге prometheus.yml; Prometheus слушает localhost:9090 (заглушка).',
      'Проверь health, валидность конфига и метрику up.',
    ],
    steps: [
      {
        id: 'prom-healthy',
        instruction:
          'Проверь health Prometheus: curl localhost:9090/-/healthy.',
        match: { kind: 'normalized' },
        accept: ['curl localhost:9090/-/healthy'],
        hint: 'Эндпоинт /-/healthy — liveness; /-/ready — готовность к запросам.',
        explanation:
          'В Kubernetes probes бьют в эти URL. Ответ Prometheus Server is Healthy означает, что процесс отвечает HTTP.',
        fakeOutput: ['Prometheus Server is Healthy.'],
      },
      {
        id: 'promtool-check',
        instruction:
          'Проверь синтаксис конфига: promtool check config prometheus.yml.',
        match: { kind: 'normalized' },
        accept: ['promtool check config prometheus.yml'],
        hint: 'promtool идёт в составе Prometheus; check rules — для recording/alerting rules.',
        explanation:
          'Всегда валидируй конфиг в CI перед reload. Ошибка scrape_configs или file_sd ломает загрузку при SIGHUP/-/reload.',
        fakeOutput: [
          'Checking prometheus.yml',
          '  SUCCESS: 1 rule files found',
        ],
      },
      {
        id: 'prom-query-up',
        instruction:
          'Сделай Instant Query метрики up: curl localhost:9090/api/v1/query?query=up',
        match: { kind: 'normalized' },
        accept: ['curl localhost:9090/api/v1/query?query=up'],
        hint: 'API /api/v1/query?query=<PromQL>; в shell & экранируй или бери URL в кавычки.',
        explanation:
          'up == 1 значит target scrape успешен. В Grafana datasource бьёт в тот же HTTP API; сложные запросы — URL-encode.',
        fakeOutput: [
          '{"status":"success","data":{"resultType":"vector","result":[{"metric":{"__name__":"up","job":"prometheus","instance":"localhost:9090"},"value":[1721214000,"1"]}]}}',
        ],
      },
      {
        id: 'prom-targets-or-ready',
        instruction:
          'Проверь ready или targets UI API: curl localhost:9090/-/ready (или curl localhost:9090/api/v1/targets).',
        match: {
          kind: 'anyOf',
          items: [
            {
              match: { kind: 'normalized' },
              accept: ['curl localhost:9090/-/ready'],
            },
            {
              match: { kind: 'normalized' },
              accept: ['curl localhost:9090/api/v1/targets'],
            },
          ],
        },
        accept: [],
        hint: '/-/ready — readiness; /api/v1/targets — active/dropped scrape targets JSON.',
        explanation:
          'targets показывает health/lastError по job. Пустой active — неверный scrape_configs или сеть до exporters.',
        fakeOutput: ['Prometheus Server is Ready.'],
      },
      {
        id: 'kubectl-or-curl-metrics',
        instruction:
          'Сними метрики с node exporter / pods: curl localhost:9100/metrics (или kubectl get pods -n monitoring).',
        match: {
          kind: 'anyOf',
          items: [
            {
              match: { kind: 'normalized' },
              accept: ['curl localhost:9100/metrics'],
            },
            {
              match: { kind: 'normalized' },
              accept: ['kubectl get pods -n monitoring'],
            },
          ],
        },
        accept: [],
        hint: '9100 — классический node_exporter; в k8s смотри namespace monitoring/observability.',
        explanation:
          'Exporters отдают plaintext exposition format. Prometheus scrape читает тот же /metrics; в кластере — ServiceMonitor/PodMonitor (Operator).',
        fakeOutput: [
          '# HELP node_cpu_seconds_total Seconds the CPUs spent in each mode.',
          '# TYPE node_cpu_seconds_total counter',
          'node_cpu_seconds_total{cpu="0",mode="idle"} 12345.67',
        ],
      },
    ],
  },
}
