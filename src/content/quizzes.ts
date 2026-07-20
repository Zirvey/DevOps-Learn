import type { QuizQuestion } from '../types'
import { officeItQuizzes } from './quizzes-office-it'

export const quizzesBySlug: Record<string, QuizQuestion[]> = {
  ...officeItQuizzes,
  'what-is-devops': [
    {
      question: 'Что означает аббревиатура CALMS в контексте DevOps?',
      options: [
        'Culture, Automation, Lean, Measurement, Sharing',
        'Code, Agile, Linux, Monitoring, Security',
        'Continuous, Automated, Lean, Managed, Scalable',
        'Collaboration, Architecture, Logging, Metrics, Support',
      ],
      answer: 'Culture, Automation, Lean, Measurement, Sharing',
      explanation: 'CALMS — распространённая модель для описания пяти столпов DevOps.',
    },
    {
      question: 'Какая главная цель DevOps по сравнению с традиционной моделью «dev vs ops»?',
      options: [
        'Сократить time-to-market и повысить надёжность доставки',
        'Убрать тестирование ради скорости',
        'Передать всю эксплуатацию только разработчикам',
        'Заменить Agile на Waterfall',
      ],
      answer: 'Сократить time-to-market и повысить надёжность доставки',
    },
    {
      question: 'Что такое blameless postmortem?',
      answer: 'Разбор инцидента без поиска виноватых, с фокусом на системные причины и улучшения процессов.',
      explanation: 'Культура без обвинений помогает честно делиться информацией и предотвращать повторения.',
    },
    {
      question: 'Какие метрики чаще всего ассоциируют с эффективностью DevOps (DORA)?',
      options: [
        'Частота деплоев, lead time, MTTR, change failure rate',
        'Количество строк кода, размер команды, число серверов',
        'CPU, RAM, disk IOPS, network throughput',
        'Количество тикетов в Jira и время ответа HR',
      ],
      answer: 'Частота деплоев, lead time, MTTR, change failure rate',
    },
    {
      question: 'Чем DevOps дополняет Agile?',
      options: [
        'Agile ускоряет разработку, DevOps — доставку и эксплуатацию',
        'DevOps отменяет итерации и спринты',
        'Agile касается только фронтенда',
        'DevOps — это только набор облачных сервисов',
      ],
      answer: 'Agile ускоряет разработку, DevOps — доставку и эксплуатацию',
    },
    {
      question: 'Назовите три ключевых антипаттерна традиционной модели «стена между dev и ops».',
      answer: 'Долгие релизы, ручные невоспроизводимые деплои, взаимные обвинения при инцидентах.',
    },
  ],

  'learning-roadmap': [
    {
      question: 'С чего разумнее начать изучение DevOps новичку без опыта администрирования?',
      options: [
        'Linux, сети, Git и основы командной строки',
        'Сразу Kubernetes в продакшене',
        'Только сертификации без практики',
        'Только Terraform без понимания ОС',
      ],
      answer: 'Linux, сети, Git и основы командной строки',
    },
    {
      question: 'Зачем в roadmap важны pet-проекты и homelab?',
      answer: 'Они дают практический опыт деплоя, отладки и автоматизации вне рабочих ограничений.',
      explanation: 'Работодатели ценят демонстрируемые навыки, а не только теорию.',
    },
    {
      question: 'Какой порядок изучения контейнеров обычно рекомендуется?',
      options: [
        'Docker → Docker Compose → Kubernetes basics → продвинутые темы',
        'Kubernetes → Docker → Ansible → Git',
        'Helm → Docker → Linux → YAML',
        'EKS → Terraform → Bash → Nginx',
      ],
      answer: 'Docker → Docker Compose → Kubernetes basics → продвинутые темы',
    },
    {
      question: 'Почему важно чередовать теорию и практику при обучении DevOps?',
      options: [
        'Инструменты быстро забываются без hands-on',
        'Теория полностью заменяет лабораторные работы',
        'Практика нужна только на собеседованиях',
        'Достаточно смотреть видео без повторения',
      ],
      answer: 'Инструменты быстро забываются без hands-on',
    },
    {
      question: 'Какие soft skills полезны DevOps-инженеру?',
      answer: 'Коммуникация между командами, документирование, работа в инцидентах, обучаемость.',
    },
    {
      question: 'Когда имеет смысл углубляться в облако (AWS/GCP/Azure)?',
      options: [
        'После основ Linux, сетей, контейнеров и CI/CD',
        'До изучения Git и Bash',
        'Только после 10 лет опыта',
        'Облако не нужно DevOps-инженеру',
      ],
      answer: 'После основ Linux, сетей, контейнеров и CI/CD',
    },
  ],

  'devops-tools-overview': [
    {
      question: 'К какой категории относится Git в DevOps-стеке?',
      options: [
        'Контроль версий и совместная работа с кодом',
        'Оркестрация контейнеров',
        'Сбор метрик',
        'Управление секретами в runtime',
      ],
      answer: 'Контроль версий и совместная работа с кодом',
    },
    {
      question: 'Чем Terraform отличается от Ansible на высоком уровне?',
      options: [
        'Terraform — декларативный IaC для инфраструктуры, Ansible — конфигурация и автоматизация',
        'Terraform только для Windows, Ansible только для Linux',
        'Ansible создаёт VPC, Terraform настраивает пакеты',
        'Это один и тот же инструмент',
      ],
      answer: 'Terraform — декларативный IaC для инфраструктуры, Ansible — конфигурация и автоматизация',
    },
    {
      question: 'Назовите типичные компоненты CI/CD pipeline.',
      answer: 'Checkout, build, test, scan, package, deploy, notify.',
    },
    {
      question: 'Для чего в стеке observability используют Prometheus и Grafana?',
      options: [
        'Сбор метрик и визуализация/алертинг',
        'Хранение исходного кода',
        'Оркестрация подов',
        'Управление DNS-зонами',
      ],
      answer: 'Сбор метрик и визуализация/алертинг',
    },
    {
      question: 'Что делает reverse proxy вроде Nginx в архитектуре приложения?',
      options: [
        'Терминирует TLS, балансирует нагрузку, проксирует запросы к backend',
        'Компилирует Docker-образы',
        'Хранит состояние Terraform',
        'Заменяет систему контроля версий',
      ],
      answer: 'Терминирует TLS, балансирует нагрузку, проксирует запросы к backend',
    },
    {
      question: 'Перечислите три категории инструментов DevSecOps.',
      answer: 'SAST, DAST/сканирование образов, управление секретами и политиками.',
    },
  ],

  linux: [
    {
      question: 'Что означает права rwxr-xr-- для файла?',
      options: [
        'Владелец: rwx, группа: r-x, остальные: r--',
        'Все имеют полный доступ',
        'Только root может читать',
        'Директория с execute для всех',
      ],
      answer: 'Владелец: rwx, группа: r-x, остальные: r--',
      explanation: 'Три триады: owner/group/others, каждая rwx.',
    },
    {
      question: 'Какая команда покажет процессы, слушающие TCP-порты?',
      options: ['ss -tlnp', 'ls -la', 'df -h', 'uname -a'],
      answer: 'ss -tlnp',
    },
    {
      question: 'Чем отличается жёсткая ссылка (hard link) от символической (symlink)?',
      answer: 'Hard link указывает на тот же inode; symlink — отдельный файл с путём к цели.',
    },
    {
      question: 'Что делает команда chmod +x script.sh?',
      options: [
        'Добавляет право execute для всех категорий',
        'Делает файл root-only',
        'Удаляет файл',
        'Меняет владельца на root',
      ],
      answer: 'Добавляет право execute для всех категорий',
    },
    {
      question: 'Для чего используют systemd unit-файлы?',
      options: [
        'Управление сервисами, автозапуском и зависимостями',
        'Редактирование YAML-манифестов Kubernetes',
        'Создание Docker-сетей',
        'Настройку BGP-маршрутизации',
      ],
      answer: 'Управление сервисами, автозапуском и зависимостями',
    },
    {
      question: 'Как посмотреть последние 50 строк лог-файла в реальном времени?',
      answer: 'tail -f -n 50 /path/to/log или tail -n 50 -f /path/to/log',
    },
  ],

  networking: [
    {
      question: 'На каком уровне OSI работает протокол TCP?',
      options: ['Транспортный (L4)', 'Сетевой (L3)', 'Канальный (L2)', 'Прикладной (L7)'],
      answer: 'Транспортный (L4)',
    },
    {
      question: 'Чем отличается TCP от UDP?',
      options: [
        'TCP — с установкой соединения и гарантией доставки, UDP — без гарантий',
        'UDP всегда шифрует трафик',
        'TCP используется только для DNS',
        'UDP работает только в локальной сети',
      ],
      answer: 'TCP — с установкой соединения и гарантией доставки, UDP — без гарантий',
    },
    {
      question: 'Что такое CIDR и зачем он нужен?',
      answer: 'Нотация для указания диапазона IP-адресов, например 10.0.0.0/24.',
    },
    {
      question: 'Какой порт по умолчанию использует HTTPS?',
      options: ['443', '80', '22', '53'],
      answer: '443',
    },
    {
      question: 'Что делает NAT в домашнем роутере?',
      options: [
        'Преобразует приватные адреса в публичный при выходе в интернет',
        'Шифрует весь трафик приложения',
        'Резолвит доменные имена',
        'Балансирует HTTP-запросы между серверами',
      ],
      answer: 'Преобразует приватные адреса в публичный при выходе в интернет',
    },
    {
      question: 'Объясните разницу между reverse proxy и forward proxy.',
      answer: 'Forward proxy представляет клиентов наружу; reverse proxy принимает запросы от клиентов и направляет их на backend-серверы.',
    },
    {
      question: 'Для чего нужен DNS?',
      options: [
        'Преобразование доменных имён в IP-адреса',
        'Сжатие HTTP-ответов',
        'Маршрутизация на L2',
        'Хранение TLS-сертификатов',
      ],
      answer: 'Преобразование доменных имён в IP-адреса',
    },
  ],

  git: [
    {
      question: 'Чем git merge отличается от git rebase?',
      options: [
        'Merge сохраняет merge-коммит, rebase переписывает историю поверх базы',
        'Rebase удаляет все коммиты',
        'Merge работает только с удалённым репозиторием',
        'Rebase нельзя использовать в feature-ветках',
      ],
      answer: 'Merge сохраняет merge-коммит, rebase переписывает историю поверх базы',
    },
    {
      question: 'Что делает git stash?',
      answer: 'Временно сохраняет незакоммиченные изменения, чтобы переключиться на другую задачу.',
    },
    {
      question: 'Какая команда отправит локальную ветку в origin и установит upstream?',
      options: [
        'git push -u origin branch-name',
        'git fetch --all',
        'git reset --hard',
        'git clean -fd',
      ],
      answer: 'git push -u origin branch-name',
    },
    {
      question: 'Что такое detached HEAD?',
      options: [
        'HEAD указывает на конкретный коммит, а не на ветку',
        'Репозиторий повреждён',
        'Нет удалённого origin',
        'Все ветки удалены',
      ],
      answer: 'HEAD указывает на конкретный коммит, а не на ветку',
    },
    {
      question: 'Зачем использовать .gitignore?',
      answer: 'Чтобы исключить из индекса артефакты сборки, секреты и локальные файлы.',
    },
    {
      question: 'Как отменить последний коммит, оставив изменения в рабочей директории?',
      options: ['git reset --soft HEAD~1', 'git reset --hard HEAD~1', 'git revert HEAD', 'git stash drop'],
      answer: 'git reset --soft HEAD~1',
    },
    {
      question: 'Какая команда безопаснее для отмены коммита, который уже в shared main?',
      options: ['git revert', 'git reset --hard', 'git push --force', 'git clean -fdx'],
      answer: 'git revert',
      explanation: 'revert создаёт новый коммит-отмену и не переписывает чужую историю.',
    },
    {
      question: 'Что делает git fetch без merge?',
      answer: 'Скачивает объекты и обновляет remote-tracking ветки (origin/*), не меняя рабочую директорию и текущую ветку.',
    },
    {
      question: 'Зачем branch protection на main?',
      options: [
        'Требовать PR, review и зелёный CI вместо прямого push',
        'Ускорить git clone',
        'Отключить hooks',
        'Автоматически удалять .gitignore',
      ],
      answer: 'Требовать PR, review и зелёный CI вместо прямого push',
    },
  ],

  bash: [
    {
      question: 'Что выведет echo $? сразу после успешной команды?',
      options: ['0', '1', 'Код последнего PID', 'Пустую строку'],
      answer: '0',
      explanation: 'В bash 0 означает успешное завершение.',
    },
    {
      question: 'Чем [[ ]] отличается от [ ] в bash?',
      answer: '[[ ]] — встроенная конструкция с более безопасным парсингом и поддержкой regex/логики без экранирования.',
    },
    {
      question: 'Как в скрипте прочитать аргументы командной строки?',
      options: ['$1, $2, ... или $@ / $#', 'Только argv[]', 'Через import sys', 'Нельзя в bash'],
      answer: '$1, $2, ... или $@ / $#',
    },
    {
      question: 'Что делает set -euo pipefail в начале скрипта?',
      options: [
        'Выход при ошибке, запрет неинициализированных переменных, учёт ошибок в pipe',
        'Включает отладочный вывод',
        'Отключает все алиасы',
        'Меняет shell на zsh',
      ],
      answer: 'Выход при ошибке, запрет неинициализированных переменных, учёт ошибок в pipe',
    },
    {
      question: 'Как выполнить подстановку вывода команды в переменную?',
      answer: 'var=$(command) или var=`command` (предпочтительно $()).',
    },
    {
      question: 'Для чего используют heredoc (<<EOF)?',
      options: [
        'Передать многострочный ввод команде или в файл',
        'Создать символическую ссылку',
        'Запустить фоновый процесс',
        'Сжать архив',
      ],
      answer: 'Передать многострочный ввод команде или в файл',
    },
  ],

  ssh: [
    {
      question: 'Где обычно хранятся публичные ключи, разрешённые для входа на сервер?',
      options: [
        '~/.ssh/authorized_keys',
        '~/.ssh/id_rsa.pub на клиенте',
        '/etc/hosts',
        '/var/log/auth.log только',
      ],
      answer: '~/.ssh/authorized_keys',
    },
    {
      question: 'Что делает ssh-agent?',
      answer: 'Хранит расшифрованные приватные ключи в памяти, чтобы не вводить passphrase при каждом подключении.',
    },
    {
      question: 'Как безопасно скопировать файл на удалённый хост?',
      options: ['scp file user@host:/path', 'ftp file host', 'telnet host', 'nc -l file'],
      answer: 'scp file user@host:/path',
    },
    {
      question: 'Зачем в ~/.ssh/config задавать Host, HostName и IdentityFile?',
      options: [
        'Упростить подключение и выбрать нужный ключ/хост',
        'Отключить шифрование',
        'Создать нового пользователя',
        'Изменить пароль root',
      ],
      answer: 'Упростить подключение и выбрать нужный ключ/хост',
    },
    {
      question: 'Чем опасен вход по паролю по сравнению с ключами?',
      answer: 'Подвержен брутфорсу и утечкам; ключи с passphrase надёжнее при правильной настройке.',
    },
    {
      question: 'Что делает опция -L в ssh?',
      options: [
        'Создаёт локальный port forwarding (туннель)',
        'Включает verbose-лог',
        'Меняет логин',
        'Отключает проверку host key',
      ],
      answer: 'Создаёт локальный port forwarding (туннель)',
    },
  ],

  yaml: [
    {
      question: 'Чем список в YAML обозначается?',
      options: ['Элементы с дефисом -', 'Квадратные скобки обязательны', 'Только через запятую в одной строке', 'Символом *'],
      answer: 'Элементы с дефисом -',
    },
    {
      question: 'Почему отступы критичны в YAML?',
      answer: 'Отступы определяют вложенность; смешение табов и пробелов ломает парсинг.',
    },
    {
      question: 'Как в YAML задать многострочную строку с сохранением переносов?',
      options: ['| (literal block)', '> (folded) без переносов', 'Только в кавычках одной строкой', 'Через JSON внутри'],
      answer: '| (literal block)',
    },
    {
      question: 'Что означает ключ apiVersion в Kubernetes-манифесте?',
      options: [
        'Версия API группы ресурса',
        'Версия приложения в Docker Hub',
        'Версия Linux на ноде',
        'Версия Helm chart',
      ],
      answer: 'Версия API группы ресурса',
    },
    {
      question: 'Чем null в YAML отличается от пустой строки ""?',
      answer: 'null — отсутствие значения; пустая строка — значение длиной 0.',
    },
    {
      question: 'Для чего в docker-compose.yml используют секцию services?',
      options: [
        'Описание контейнеров и их конфигурации',
        'Только список volume на хосте',
        'Настройку CI pipeline',
        'Описание IAM-ролей AWS',
      ],
      answer: 'Описание контейнеров и их конфигурации',
    },
  ],

  nginx: [
    {
      question: 'В каком блоке nginx задают server_name и listen?',
      options: ['server { }', 'http { } только', 'upstream { }', 'location / только'],
      answer: 'server { }',
    },
    {
      question: 'Что делает директива proxy_pass?',
      answer: 'Проксирует запросы на указанный upstream (backend).',
    },
    {
      question: 'Как nginx выбирает location при нескольких совпадениях?',
      options: [
        'По приоритету: exact > ^~ prefix > regex > longest prefix',
        'Всегда первый в файле',
        'Случайным образом',
        'Только longest prefix без исключений',
      ],
      answer: 'По приоритету: exact > ^~ prefix > regex > longest prefix',
    },
    {
      question: 'Зачем использовать upstream с несколькими backend?',
      options: [
        'Балансировка нагрузки и отказоустойчивость',
        'Ускорение компиляции Go',
        'Хранение сессий в Redis автоматически',
        'Замена TLS-сертификатов',
      ],
      answer: 'Балансировка нагрузки и отказоустойчивость',
    },
    {
      question: 'Как проверить синтаксис конфигурации nginx перед reload?',
      answer: 'nginx -t',
    },
    {
      question: 'Что делает return 301 в server/location?',
      options: [
        'Постоянный редирект на новый URL',
        'Внутренний rewrite без ответа клиенту',
        'Закрывает соединение',
        'Включает basic auth',
      ],
      answer: 'Постоянный редирект на новый URL',
    },
  ],

  docker: [
    {
      question: 'Чем образ (image) отличается от контейнера (container)?',
      options: [
        'Образ — неизменяемый шаблон, контейнер — запущенный экземпляр',
        'Это синонимы',
        'Контейнер хранится в registry, образ — только локально',
        'Образ всегда больше по размеру runtime',
      ],
      answer: 'Образ — неизменяемый шаблон, контейнер — запущенный экземпляр',
    },
    {
      question: 'Что записывает каждый слой в Dockerfile?',
      answer: 'Новый read-only слой файловой системы образа (кроме финального контейнера с writable layer).',
    },
    {
      question: 'Зачем использовать multi-stage build?',
      options: [
        'Уменьшить размер финального образа, отделив сборку от runtime',
        'Запустить несколько контейнеров в одном процессе',
        'Обойти лимиты Docker Hub',
        'Отключить кэш слоёв',
      ],
      answer: 'Уменьшить размер финального образа, отделив сборку от runtime',
    },
    {
      question: 'Что делает флаг -p 8080:80 при docker run?',
      options: [
        'Пробрасывает порт 8080 хоста на порт 80 контейнера',
        'Публикует образ в registry',
        'Меняет права на volume',
        'Запускает контейнер в privileged без сети',
      ],
      answer: 'Пробрасывает порт 8080 хоста на порт 80 контейнера',
    },
    {
      question: 'Чем bridge-сеть по умолчанию отличается от host network mode?',
      answer: 'Bridge изолирует контейнер с NAT; host mode использует сетевой namespace хоста напрямую.',
    },
    {
      question: 'Как посмотреть логи контейнера?',
      options: ['docker logs <container>', 'docker images', 'docker network ls', 'docker volume prune'],
      answer: 'docker logs <container>',
    },
  ],

  'docker-compose': [
    {
      question: 'Какой файл по умолчанию читает docker compose?',
      options: ['docker-compose.yml или compose.yaml', 'Dockerfile', 'package.json', 'helm values.yaml'],
      answer: 'docker-compose.yml или compose.yaml',
    },
    {
      question: 'Как в Compose связать сервисы по имени?',
      answer: 'Сервисы в одной user-defined сети обращаются друг к другу по имени сервиса как DNS-имени.',
    },
    {
      question: 'Что делает depends_on?',
      options: [
        'Задаёт порядок запуска, но не ждёт готовности приложения без healthcheck',
        'Гарантирует, что БД приняла соединения',
        'Создаёт Kubernetes Deployment',
        'Монтирует secrets из Vault',
      ],
      answer: 'Задаёт порядок запуска, но не ждёт готовности приложения без healthcheck',
    },
    {
      question: 'Чем volume отличается от bind mount?',
      options: [
        'Volume управляется Docker, bind mount — прямой путь с хоста',
        'Bind mount быстрее только на Windows',
        'Volume нельзя делать persistent',
        'Разницы нет',
      ],
      answer: 'Volume управляется Docker, bind mount — прямой путь с хоста',
    },
    {
      question: 'Как переопределить переменные окружения для локальной разработки?',
      answer: 'Через .env файл, environment в compose или docker compose --env-file.',
    },
    {
      question: 'Как поднять стек в фоне?',
      options: ['docker compose up -d', 'docker compose build --no-cache only', 'docker run compose', 'kubectl apply -f compose.yml'],
      answer: 'docker compose up -d',
    },
  ],

  'kubernetes-basics': [
    {
      question: 'Какой объект Kubernetes обеспечивает желаемое число реплик Pod?',
      options: ['Deployment', 'ConfigMap', 'IngressClass', 'PersistentVolume только'],
      answer: 'Deployment',
    },
    {
      question: 'Чем Pod отличается от контейнера?',
      answer: 'Pod — минимальная единица планирования в K8s, может содержать один или несколько контейнеров с общими сетью/volume.',
    },
    {
      question: 'Для чего нужен Service типа ClusterIP?',
      options: [
        'Стабильный внутренний IP/DNS для доступа к Pod',
        'Публикация наружу через LoadBalancer автоматически',
        'Хранение секретов',
        'Создание namespace',
      ],
      answer: 'Стабильный внутренний IP/DNS для доступа к Pod',
    },
    {
      question: 'Что хранит ConfigMap?',
      options: [
        'Конфигурационные данные в виде key-value',
        'Docker-образы',
        'TLS private key только в etcd plaintext',
        'Состояние Terraform',
      ],
      answer: 'Конфигурационные данные в виде key-value',
    },
    {
      question: 'Какая команда покажет Pod во всех namespace?',
      answer: 'kubectl get pods -A или kubectl get pods --all-namespaces',
    },
    {
      question: 'Что делает liveness probe?',
      options: [
        'Перезапускает контейнер при неуспешной проверке',
        'Удаляет Deployment',
        'Масштабирует HPA',
        'Создаёт Ingress',
      ],
      answer: 'Перезапускает контейнер при неуспешной проверке',
    },
    {
      question: 'Зачем нужны labels и selectors?',
      answer: 'Связывают объекты (Service, Deployment) с группой Pod по меткам.',
    },
  ],

  'kubernetes-advanced': [
    {
      question: 'Что делает Horizontal Pod Autoscaler (HPA)?',
      options: [
        'Масштабирует число Pod по метрикам (CPU, custom и др.)',
        'Увеличивает CPU limits на ноде',
        'Создаёт новый кластер',
        'Ротирует TLS-сертификаты',
      ],
      answer: 'Масштабирует число Pod по метрикам (CPU, custom и др.)',
    },
    {
      question: 'Чем StatefulSet отличается от Deployment?',
      answer: 'StatefulSet даёт стабильные имена Pod, ordered rollout и привязанные PVC для stateful-приложений.',
    },
    {
      question: 'Для чего используют NetworkPolicy?',
      options: [
        'Ограничение сетевого трафика между Pod на уровне кластера',
        'Настройку DNS вне кластера',
        'Сбор логов в Loki',
        'Управление RBAC пользователей IAM',
      ],
      answer: 'Ограничение сетевого трафика между Pod на уровне кластера',
    },
    {
      question: 'Что такое taints и tolerations?',
      answer: 'Taints отталкивают Pod с ноды; tolerations позволяют Pod планироваться на tainted-ноды.',
    },
    {
      question: 'Зачем нужен PodDisruptionBudget (PDB)?',
      options: [
        'Ограничить число одновременно недоступных Pod при voluntary disruption',
        'Запретить все обновления Deployment',
        'Хранить backup etcd',
        'Настроить Ingress TLS',
      ],
      answer: 'Ограничить число одновременно недоступных Pod при voluntary disruption',
    },
    {
      question: 'Что делает kubectl drain node?',
      answer: 'Эвакуирует Pod с ноды (с учётом PDB) для обслуживания или вывода ноды из кластера.',
    },
  ],

  helm: [
    {
      question: 'Что такое Helm chart?',
      options: [
        'Пакет шаблонов Kubernetes-манифестов с values',
        'Бинарный образ контейнера',
        'Плагин для Terraform',
        'Тип Service в K8s',
      ],
      answer: 'Пакет шаблонов Kubernetes-манифестов с values',
    },
    {
      question: 'Где обычно переопределяют параметры chart при установке?',
      answer: 'В values.yaml или через --set / -f custom-values.yaml при helm install/upgrade.',
    },
    {
      question: 'Чем helm upgrade --install отличается от отдельного install?',
      options: [
        'Идемпотентно: установит или обновит release',
        'Только удаляет release',
        'Работает без kubeconfig',
        'Создаёт только ConfigMap',
      ],
      answer: 'Идемпотентно: установит или обновит release',
    },
    {
      question: 'Что хранит Helm release?',
      options: [
        'Установленный экземпляр chart с revision history',
        'Только Docker registry credentials',
        'Логи приложения',
        'Состояние AWS VPC',
      ],
      answer: 'Установленный экземпляр chart с revision history',
    },
    {
      question: 'Зачем использовать hooks (pre-install, post-upgrade)?',
      answer: 'Выполнить Job или другие ресурсы до/после основных манифестов (миграции, тесты).',
    },
    {
      question: 'Как откатить release на предыдущую ревизию?',
      options: ['helm rollback <release> <revision>', 'kubectl undo deployment', 'git revert HEAD', 'terraform destroy'],
      answer: 'helm rollback <release> <revision>',
    },
  ],

  'cicd-basics': [
    {
      question: 'Чем CI отличается от CD?',
      options: [
        'CI — интеграция и тесты, CD — доставка/деплой в окружения',
        'CI только для Java, CD только для Python',
        'CD означает отсутствие тестов',
        'Это одно и то же',
      ],
      answer: 'CI — интеграция и тесты, CD — доставка/деплой в окружения',
    },
    {
      question: 'Зачем запускать pipeline на pull request?',
      answer: 'Раннее обнаружение ошибок до merge в основную ветку.',
    },
    {
      question: 'Что такое artifact в pipeline?',
      options: [
        'Результат сборки (образ, jar, bundle), передаваемый между стадиями',
        'Только лог job',
        'Секрет в plain text',
        'Terraform state локально',
      ],
      answer: 'Результат сборки (образ, jar, bundle), передаваемый между стадиями',
    },
    {
      question: 'Почему важен принцип «build once, deploy many»?',
      options: [
        'Один и тот же артефакт проходит все окружения, снижая расхождения',
        'Чтобы не хранить версии',
        'Чтобы деплоить только вручную',
        'Чтобы отключить тесты',
      ],
      answer: 'Один и тот же артефакт проходит все окружения, снижая расхождения',
    },
    {
      question: 'Назовите типичные стадии CI pipeline для веб-приложения.',
      answer: 'Lint, unit tests, build, integration/e2e, security scan, publish artifact/image.',
    },
    {
      question: 'Что такое deployment strategy blue-green?',
      options: [
        'Два идентичных окружения; трафик переключается на новое после проверки',
        'Постепенная замена Pod по одному без downtime',
        'Деплой только по пятницам',
        'Откат через git reset',
      ],
      answer: 'Два идентичных окружения; трафик переключается на новое после проверки',
    },
  ],

  'github-actions': [
    {
      question: 'Где описываются workflow в GitHub Actions?',
      options: [
        '.github/workflows/*.yml',
        'Jenkinsfile в корне только',
        '.gitlab-ci.yml',
        'docker-compose.yml',
      ],
      answer: '.github/workflows/*.yml',
    },
    {
      question: 'Чем job отличается от step?',
      answer: 'Job — набор steps на runner; step — отдельное действие (action или shell).',
    },
    {
      question: 'Как передать секрет в workflow безопасно?',
      options: [
        'Через GitHub Secrets и ${{ secrets.NAME }}',
        'В plain text в workflow файле',
        'В коммите в README',
        'Через публичный gist',
      ],
      answer: 'Через GitHub Secrets и ${{ secrets.NAME }}',
    },
    {
      question: 'Что делает actions/checkout?',
      options: [
        'Клонирует репозиторий на runner',
        'Публикует Docker-образ',
        'Создаёт Kubernetes кластер',
        'Деплоит в AWS без credentials',
      ],
      answer: 'Клонирует репозиторий на runner',
    },
    {
      question: 'Когда использовать matrix strategy?',
      answer: 'Для параллельного прогона на разных версиях ОС, языка или параметрах.',
    },
    {
      question: 'Чем workflow_dispatch отличается от push trigger?',
      options: [
        'Ручной запуск workflow из UI/API',
        'Автозапуск при каждом коммите',
        'Только для fork PR',
        'Запуск только по cron без исключений',
      ],
      answer: 'Ручной запуск workflow из UI/API',
    },
  ],

  gitops: [
    {
      question: 'В чём суть GitOps?',
      options: [
        'Желаемое состояние в Git — единый источник правды, контроллер синхронизирует кластер',
        'Деплой только через SSH вручную',
        'Хранение логов в Git',
        'Отказ от CI',
      ],
      answer: 'Желаемое состояние в Git — единый источник правды, контроллер синхронизирует кластер',
    },
    {
      question: 'Какие инструменты часто используют для GitOps в Kubernetes?',
      answer: 'Argo CD, Flux (и аналоги).',
    },
    {
      question: 'Что означает drift в GitOps?',
      options: [
        'Расхождение live-состояния кластера с манифестами в Git',
        'Увеличение latency сети',
        'Падение CPU на ноде',
        'Истечение TLS-сертификата',
      ],
      answer: 'Расхождение live-состояния кластера с манифестами в Git',
    },
    {
      question: 'Почему pull-based деплой предпочтительнее push в некоторых сценариях?',
      options: [
        'Агент в кластере сам тянет изменения, меньше внешних credentials с write-доступом',
        'Push быстрее всегда',
        'Pull не требует Git',
        'Push безопаснее для production',
      ],
      answer: 'Агент в кластере сам тянет изменения, меньше внешних credentials с write-доступом',
    },
    {
      question: 'Как организовать promotion между dev/stage/prod в GitOps?',
      answer: 'Отдельные ветки/директории/overlay (Kustomize) или обновление image tag через PR.',
    },
    {
      question: 'Что делает Argo CD при sync?',
      options: [
        'Приводит ресурсы кластера к состоянию из Git',
        'Собирает Docker-образы',
        'Создаёт EC2 инстансы через console',
        'Удаляет namespace по умолчанию',
      ],
      answer: 'Приводит ресурсы кластера к состоянию из Git',
    },
  ],

  terraform: [
    {
      question: 'Для чего нужен terraform plan?',
      options: [
        'Показать план изменений без применения',
        'Удалить state',
        'Сгенерировать SSH-ключи',
        'Запустить unit-тесты',
      ],
      answer: 'Показать план изменений без применения',
    },
    {
      question: 'Что хранит Terraform state?',
      answer: 'Соответствие ресурсов в коде реальным ID в провайдере и метаданные зависимостей.',
    },
    {
      question: 'Зачем использовать remote backend (S3 + DynamoDB)?',
      options: [
        'Совместная работа, locking и надёжное хранение state',
        'Ускорение интернета',
        'Замена provider plugin',
        'Отключение drift detection',
      ],
      answer: 'Совместная работа, locking и надёжное хранение state',
    },
    {
      question: 'Чем resource отличается от data source?',
      options: [
        'Resource создаёт/управляет объектом, data source только читает существующий',
        'Data source всегда платный',
        'Resource нельзя удалить',
        'Разницы нет',
      ],
      answer: 'Resource создаёт/управляет объектом, data source только читает существующий',
    },
    {
      question: 'Что делает terraform import?',
      answer: 'Добавляет существующий инфраструктурный объект в state под управление Terraform.',
    },
    {
      question: 'Почему нельзя коммитить secrets в .tf файлы?',
      options: [
        'Они попадут в Git-историю и CI-логи',
        'Terraform их не парсит',
        'Provider откажется работать',
        'State не поддерживает строки',
      ],
      answer: 'Они попадут в Git-историю и CI-логи',
    },
  ],

  ansible: [
    {
      question: 'На каком порту по умолчанию Ansible подключается к Linux-хостам?',
      options: ['22 (SSH)', '80', '443', '2375'],
      answer: '22 (SSH)',
    },
    {
      question: 'Чем playbook отличается от ad-hoc команды?',
      answer: 'Playbook — декларативный YAML-сценарий с ролями и идемпотентными tasks; ad-hoc — разовая команда.',
    },
    {
      question: 'Что такое inventory?',
      options: [
        'Список хостов и групп для управления',
        'Docker registry',
        'Файл Terraform state',
        'Helm values',
      ],
      answer: 'Список хостов и групп для управления',
    },
    {
      question: 'Зачем нужны roles в Ansible?',
      options: [
        'Переиспользуемая структура tasks, vars, templates',
        'Только для Windows',
        'Замена Kubernetes RBAC',
        'Хранение бинарных образов',
      ],
      answer: 'Переиспользуемая структура tasks, vars, templates',
    },
    {
      question: 'Что означает идемпотентность в контексте Ansible?',
      answer: 'Повторный запуск приводит систему к желаемому состоянию без лишних изменений.',
    },
    {
      question: 'Как передать переменные при запуске playbook?',
      options: [
        '-e / --extra-vars или vars_files в playbook',
        'Только через редактирование /etc/hosts',
        'Через docker run -e',
        'Нельзя переопределить',
      ],
      answer: '-e / --extra-vars или vars_files в playbook',
    },
  ],

  'aws-basics': [
    {
      question: 'Что такое AWS Region и Availability Zone?',
      options: [
        'Region — географический регион; AZ — изолированный ЦОД внутри региона',
        'Region — VPC, AZ — subnet',
        'Синонимы',
        'Region — только для S3',
      ],
      answer: 'Region — географический регион; AZ — изолированный ЦОД внутри региона',
    },
    {
      question: 'Для чего используют IAM?',
      answer: 'Управление идентичностями, политиками доступа и ролями в AWS.',
    },
    {
      question: 'Чем EC2 отличается от Lambda на высоком уровне?',
      options: [
        'EC2 — виртуальные серверы, Lambda — serverless выполнение по событиям',
        'Lambda всегда дешевле при постоянной нагрузке',
        'EC2 не поддерживает Linux',
        'Lambda хранит только объекты S3',
      ],
      answer: 'EC2 — виртуальные серверы, Lambda — serverless выполнение по событиям',
    },
    {
      question: 'Что хранит S3?',
      options: [
        'Объекты (файлы) в bucket с durability на уровне сервиса',
        'Только реляционные таблицы',
        'Kubernetes Pod',
        'Только Docker-образы без API',
      ],
      answer: 'Объекты (файлы) в bucket с durability на уровне сервиса',
    },
    {
      question: 'Что такое shared responsibility model в AWS?',
      answer: 'AWS отвечает за безопасность облака; клиент — за безопасность в облаке (данные, конфиг, доступ).',
    },
    {
      question: 'Зачем включать MFA для root/IAM пользователей?',
      options: [
        'Снизить риск компрометации учётных записей',
        'Ускорить API-запросы',
        'Отключить billing alerts',
        'Заменить VPC',
      ],
      answer: 'Снизить риск компрометации учётных записей',
    },
  ],

  'aws-networking': [
    {
      question: 'Чем public subnet отличается от private?',
      options: [
        'Public имеет маршрут в Internet Gateway, private — обычно через NAT',
        'Private всегда без IP',
        'Public не может иметь EC2',
        'Разница только в имени',
      ],
      answer: 'Public имеет маршрут в Internet Gateway, private — обычно через NAT',
    },
    {
      question: 'Для чего нужен NAT Gateway?',
      answer: 'Дать исходящий интернет-трафик из private subnet без входящего доступа извне.',
    },
    {
      question: 'Что такое Security Group?',
      options: [
        'Stateful firewall на уровне ENI/instance',
        'Маршрутизатор между регионами',
        'DNS-сервис',
        'Тип S3 bucket policy',
      ],
      answer: 'Stateful firewall на уровне ENI/instance',
    },
    {
      question: 'Чем NACL отличается от Security Group?',
      options: [
        'NACL — stateless на уровне subnet; SG — stateful на уровне instance',
        'NACL работает только в Lambda',
        'SG нельзя менять',
        'NACL — только для S3',
      ],
      answer: 'NACL — stateless на уровне subnet; SG — stateful на уровне instance',
    },
    {
      question: 'Что делает VPC peering?',
      answer: 'Соединяет два VPC для маршрутизации частных IP (с учётом CIDR и маршрутов).',
    },
    {
      question: 'Для чего используют Route 53?',
      options: [
        'DNS-хостинг и маршрутизацию трафика',
        'Создание EC2 AMI',
        'Хранение Terraform state',
        'Сбор метрик CloudWatch',
      ],
      answer: 'DNS-хостинг и маршрутизацию трафика',
    },
  ],

  'aws-eks': [
    {
      question: 'Что такое EKS?',
      options: [
        'Управляемый Kubernetes control plane от AWS',
        'Только managed node groups без API',
        'Serverless база данных',
        'CDN для статики',
      ],
      answer: 'Управляемый Kubernetes control plane от AWS',
    },
    {
      question: 'Кто управляет control plane в EKS?',
      answer: 'AWS; клиент управляет worker nodes, add-ons и workloads.',
    },
    {
      question: 'Для чего нужен aws-load-balancer-controller?',
      options: [
        'Создание ALB/NLB для Service/Ingress в EKS',
        'Сбор логов в CloudWatch только',
        'Установка Helm без RBAC',
        'Создание S3 bucket',
      ],
      answer: 'Создание ALB/NLB для Service/Ingress в EKS',
    },
    {
      question: 'Чем managed node group отличается от self-managed?',
      options: [
        'AWS управляет жизненным циклом EC2 в группе (обновления, scaling hooks)',
        'Self-managed нельзя autoscale',
        'Managed node group без kubelet',
        'Разницы нет',
      ],
      answer: 'AWS управляет жизненным циклом EC2 в группе (обновления, scaling hooks)',
    },
    {
      question: 'Как Pod получает IAM-права в EKS?',
      answer: 'Через IRSA (IAM Roles for Service Accounts) с OIDC провайдером кластера.',
    },
    {
      question: 'Зачем размещать worker nodes в private subnet?',
      options: [
        'Снизить поверхность атаки, исходящий трафик через NAT',
        'Ускорить pull образов без NAT',
        'Отключить RBAC',
        'Обязательное требование EKS для всех кластеров без исключений',
      ],
      answer: 'Снизить поверхность атаки, исходящий трафик через NAT',
    },
  ],

  certifications: [
    {
      question: 'Зачем DevOps-инженеру сертификации?',
      options: [
        'Структурировать знания и подтвердить навыки работодателю',
        'Полностью заменить практический опыт',
        'Гарантировать зарплату',
        'Избежать собеседований',
      ],
      answer: 'Структурировать знания и подтвердить навыки работодателю',
    },
    {
      question: 'Чем CKA ориентирована по сравнению с CKAD?',
      answer: 'CKA — администрирование кластера; CKAD — разработка и деплой приложений в K8s.',
    },
    {
      question: 'Какая сертификация AWS покрывает широкие основы облака?',
      options: [
        'AWS Certified Cloud Practitioner / Solutions Architect Associate',
        'AWS Certified Barista',
        'Only SAP on Azure',
        'CompTIA Linux+ только',
      ],
      answer: 'AWS Certified Cloud Practitioner / Solutions Architect Associate',
    },
    {
      question: 'Как готовиться к hands-on экзаменам эффективнее всего?',
      options: [
        'Практика в lab/killercoda/homelab по экзаменационным доменам',
        'Только чтение PDF без терминала',
        'Заучивание вопросов без kubectl',
        'Пропуск тайм-менеджмента',
      ],
      answer: 'Практика в lab/killercoda/homelab по экзаменационным доменам',
    },
    {
      question: 'Сколько обычно действуют сертификаты AWS и Kubernetes (CNCF)?',
      answer: 'Около 3 лет; требуется пересдача или recertification по правилам программы.',
    },
    {
      question: 'Что важнее на рынке: сертификат или pet-проект?',
      options: [
        'Оба дополняют друг друга; проекты часто весят больше на интервью',
        'Только сертификат',
        'Только диплом вуза',
        'Ничего из перечисленного',
      ],
      answer: 'Оба дополняют друг друга; проекты часто весят больше на интервью',
    },
  ],

  monitoring: [
    {
      question: 'Чем метрика отличается от лога?',
      options: [
        'Метрика — числовой временной ряд; лог — текстовое событие с контекстом',
        'Лог всегда realtime-only',
        'Метрика не хранится',
        'Разницы нет',
      ],
      answer: 'Метрика — числовой временной ряд; лог — текстовое событие с контекстом',
    },
    {
      question: 'Что такое SLI и SLO?',
      answer: 'SLI — измеряемый индикатор качества; SLO — целевое значение SLI за период.',
    },
    {
      question: 'Для чего нужен alerting?',
      options: [
        'Уведомить людей о проблеме по правилам, не заменяя диагностику',
        'Хранить все логи вечно',
        'Автоматически чинить любой баг',
        'Заменить on-call',
      ],
      answer: 'Уведомить людей о проблеме по правилам, не заменяя диагностику',
    },
    {
      question: 'Что такое cardinality в метриках и почему она опасна?',
      options: [
        'Много уникальных label combinations → рост storage и стоимости',
        'Низкая частота scrape',
        'Отсутствие Grafana',
        'Использование HTTPS',
      ],
      answer: 'Много уникальных label combinations → рост storage и стоимости',
    },
    {
      question: 'Назовите четыре сигнала золотого мониторинга (Google SRE).',
      answer: 'Latency, Traffic, Errors, Saturation.',
    },
    {
      question: 'Что делает blackbox monitoring?',
      options: [
        'Проверяет доступность снаружи (HTTP, TCP, DNS)',
        'Снимает heap dump JVM',
        'Читает логи приложения из файла',
        'Управляет Kubernetes RBAC',
      ],
      answer: 'Проверяет доступность снаружи (HTTP, TCP, DNS)',
    },
  ],

  logging: [
    {
      question: 'Что такое structured logging?',
      options: [
        'Логи в JSON/полях для машинного поиска и парсинга',
        'Логи только на русском языке',
        'Вывод без timestamp',
        'Логи только в stderr контейнера без сбора',
      ],
      answer: 'Логи в JSON/полях для машинного поиска и парсинга',
    },
    {
      question: 'Зачем централизовать логи (ELK, Loki, CloudWatch Logs)?',
      answer: 'Единая точка поиска, корреляция, retention и доступ при падении отдельных хостов.',
    },
    {
      question: 'Что такое log aggregation pipeline?',
      options: [
        'Сбор → парсинг → индексация/хранение → поиск/алерты',
        'Только ротация logrotate на одном сервере',
        'Компиляция бинарников',
        'Terraform apply',
      ],
      answer: 'Сбор → парсинг → индексация/хранение → поиск/алерты',
    },
    {
      question: 'Почему не стоит логировать пароли и токены?',
      options: [
        'Риск утечки через log storage и доступы аналитиков',
        'Логи не поддерживают строки',
        'Увеличивается CPU на 100%',
        'JSON запрещает секреты',
      ],
      answer: 'Риск утечки через log storage и доступы аналитиков',
    },
    {
      question: 'Чем trace (distributed tracing) дополняет логи?',
      answer: 'Показывает путь запроса через сервисы с latency по span, упрощая поиск узких мест.',
    },
    {
      question: 'Что делает sidecar-агент для логов в Kubernetes?',
      options: [
        'Считывает логи из shared volume/stdout и отправляет в backend',
        'Заменяет kube-proxy',
        'Создаёт Ingress',
        'Хранит Docker images',
      ],
      answer: 'Считывает логи из shared volume/stdout и отправляет в backend',
    },
  ],

  incidents: [
    {
      question: 'Кто такой incident commander?',
      options: [
        'Координатор реагирования: приоритеты, коммуникация, делегирование',
        'Единственный человек, который чинит всё руками',
        'Юрист компании',
        'Автор последнего коммита по умолчанию',
      ],
      answer: 'Координатор реагирования: приоритеты, коммуникация, делегирование',
    },
    {
      question: 'Что такое MTTR?',
      answer: 'Mean Time To Recovery — среднее время восстановления сервиса после инцидента.',
    },
    {
      question: 'Первый шаг при major outage?',
      options: [
        'Стабилизировать сервис (mitigate), затем искать root cause',
        'Сразу деплоить необтестированный hotfix',
        'Удалить мониторинг чтобы не шумел',
        'Ждать конца смены',
      ],
      answer: 'Стабилизировать сервис (mitigate), затем искать root cause',
    },
    {
      question: 'Зачем вести timeline во время инцидента?',
      options: [
        'Для postmortem и понимания последовательности действий',
        'Чтобы скрыть ошибки',
        'Только для биллинга AWS',
        'Terraform требует timeline',
      ],
      answer: 'Для postmortem и понимания последовательности действий',
    },
    {
      question: 'Что должно быть в blameless postmortem?',
      answer: 'Impact, timeline, root cause, contributing factors, action items с владельцами.',
    },
    {
      question: 'Чем severity P1 отличается от P3 условно?',
      options: [
        'P1 — критический простой бизнеса, P3 — низкий impact/workaround есть',
        'P3 всегда требует CEO',
        'P1 — только предупреждение',
        'Нет разницы',
      ],
      answer: 'P1 — критический простой бизнеса, P3 — низкий impact/workaround есть',
    },
  ],

  devsecops: [
    {
      question: 'Что такое SAST?',
      options: [
        'Статический анализ исходного кода на уязвимости',
        'Сканирование работающего приложения снаружи',
        'Шифрование дисков',
        'Ротация kubeconfig',
      ],
      answer: 'Статический анализ исходного кода на уязвимости',
    },
    {
      question: 'Зачем сканировать Docker-образы в CI?',
      answer: 'Найти известные CVE в базовых слоях и зависимостях до деплоя в prod.',
    },
    {
      question: 'Что такое principle of least privilege?',
      options: [
        'Минимально необходимые права для выполнения задачи',
        'Всем пользователям admin',
        'Отключение MFA',
        'Публичные S3 bucket по умолчанию',
      ],
      answer: 'Минимально необходимые права для выполнения задачи',
    },
    {
      question: 'Где безопаснее хранить секреты в K8s?',
      options: [
        'Secret + внешний vault (Vault, AWS SM) с ограниченным RBAC',
        'В ConfigMap в plain text',
        'В аннотациях Pod',
        'В Dockerfile ENV',
      ],
      answer: 'Secret + внешний vault (Vault, AWS SM) с ограниченным RBAC',
    },
    {
      question: 'Что проверяет OWASP Top 10 в контексте веб-приложений?',
      answer: 'Распространённые классы уязвимостей: injection, broken auth, XSS и др.',
    },
    {
      question: 'Что такое shift-left security?',
      options: [
        'Встраивание проверок безопасности раньше в SDLC',
        'Перенос всех проверок только в prod',
        'Отказ от пентестов',
        'Деплой только по пятницам',
      ],
      answer: 'Встраивание проверок безопасности раньше в SDLC',
    },
  ],

  portfolio: [
    {
      question: 'Что должно быть в сильном DevOps pet-проекте?',
      options: [
        'README, архитектура, CI/CD, IaC, ссылка на код и как воспроизвести',
        'Только скриншот без репозитория',
        'Пароли в репозитории для «честности»',
        'Копия чужого проекта без понимания',
      ],
      answer: 'README, архитектура, CI/CD, IaC, ссылка на код и как воспроизвести',
    },
    {
      question: 'Зачем рисовать диаграмму архитектуры в портфолио?',
      answer: 'Показать понимание потоков данных, сетей, CI/CD и observability.',
    },
    {
      question: 'Как описать свой вклад в командном проекте честно?',
      options: [
        'Конкретные задачи: pipeline, мониторинг, миграция — с метриками результата',
        'Приписать себе всю компанию',
        'Не упоминать команду',
        'Только общие фразы без деталей',
      ],
      answer: 'Конкретные задачи: pipeline, мониторинг, миграция — с метриками результата',
    },
    {
      question: 'Почему важно иметь публичный GitHub/GitLab?',
      answer: 'Рекрутер и интервьюер могут оценить стиль кода, коммиты и документацию.',
    },
    {
      question: 'Какой pet-проект хорошо демонстрирует DevOps-стек?',
      options: [
        'Микросервис в K8s с Terraform, CI, мониторингом и HTTPS',
        'Hello World в одном .txt файле',
        'Форк без изменений',
        'Закрытый репозиторий без описания',
      ],
      answer: 'Микросервис в K8s с Terraform, CI, мониторингом и HTTPS',
    },
    {
      question: 'Что включить в README для ревьюера?',
      answer: 'Цель проекта, стек, prerequisites, команды deploy/destroy, схема и скриншоты дашбордов.',
    },
  ],

  interviews: [
    {
      question: 'Как отвечать на вопрос «расскажите об инциденте» по STAR?',
      options: [
        'Situation, Task, Action, Result — с фокусом на ваши действия и итог',
        'Только обвинять коллег',
        'Уходить от деталей',
        'Говорить только о теории CALMS',
      ],
      answer: 'Situation, Task, Action, Result — с фокусом на ваши действия и итог',
    },
    {
      question: 'Что спросить интервьюера о команде и процессах?',
      answer: 'On-call, зрелость CI/CD, IaC, postmortem culture, ожидания от роли в первые 90 дней.',
    },
    {
      question: 'Как объяснить разницу между Docker и Kubernetes на интервью?',
      options: [
        'Docker — упаковка/запуск контейнеров; K8s — оркестрация, scaling, self-healing',
        'Kubernetes заменяет Linux kernel',
        'Docker — только для Windows',
        'Это одно и то же',
      ],
      answer: 'Docker — упаковка/запуск контейнеров; K8s — оркестрация, scaling, self-healing',
    },
    {
      question: 'Почему на system design важно уточнять требования?',
      answer: 'SLA, RPS, бюджет, compliance и сроки меняют выбор между managed/self-hosted и архитектурой.',
    },
    {
      question: 'Как показать культуру blamelessness на интервью?',
      options: [
        'Рассказать об инциденте с акцентом на улучшения, а не на вину',
        'Сказать, что ошибок не было никогда',
        'Обвинить только vendor',
        'Избегать темы инцидентов',
      ],
      answer: 'Рассказать об инциденте с акцентом на улучшения, а не на вину',
    },
    {
      question: 'Какие темы чаще встречаются на junior/middle DevOps интервью?',
      answer: 'Linux, сети, Git, CI/CD, Docker/K8s basics, troubleshooting, cloud fundamentals.',
    },
    {
      question: 'Что делать, если не знаете ответ на технический вопрос?',
      options: [
        'Честно сказать, описать ход мыслей и смежный опыт',
        'Придумать уверенно неверное',
        'Молчать до конца интервью',
        'Перевести на личные темы',
      ],
      answer: 'Честно сказать, описать ход мыслей и смежный опыт',
    },
  ],
}
