export const ru = {
  common: {
    menu: 'Меню',
    sections: 'разделов',
    questions: 'вопросов',
    chapters: 'глав',
    completed: 'пройдено',
    level: {
      beginner: 'Начальный',
      intermediate: 'Средний',
      advanced: 'Продвинутый',
    },
    themeSwitchToLight: 'Переключить на светлую тему',
    themeSwitchToDark: 'Переключить на тёмную тему',
  },
  header: {
    startLearning: 'Начать обучение',
  },
  search: {
    placeholder: 'Поиск по учебнику... (⌘K)',
    empty: 'Ничего не найдено',
  },
  home: {
    heroBadge: 'Онлайн-курс · 50 уроков · DevOps + Office IT',
    heroTitlePrefix: 'Платформа по изучению ',
    heroTitleAccent: 'DevOps',
    heroSubtitle: 'Уроки, практика и тесты.',
    trustLine:
      '{{completed}} из {{total}} глав пройдено · {{modules}} модулей · {{sections}} разделов',
    metricChaptersLabel: 'Глав в курсе',
    metricChaptersDeltaProgress: '+{{progress}}% пройдено',
    metricChaptersDeltaZero: 'С нуля до junior',
    metricModulesLabel: 'Модулей',
    metricModulesDelta: 'DevOps + Office IT',
    metricProgressLabel: 'Ваш прогресс',
    metricProgressDeltaDone: '{{count}} глав завершено',
    metricProgressDeltaEmpty: 'Отметь главу после прохождения',
    modulesSectionTitle: 'Курсы и модули',
    modulesSectionSub:
      '16 модулей — структурированный путь от основ до production-практики',
    moduleCardFooter: '{{chapters}} глав · {{done}} пройдено',
  },
  chapter: {
    markComplete: 'Отметить как пройденное',
    markedComplete: 'Пройдено',
    tocMobile: 'Содержание главы',
    tocAria: 'Оглавление главы',
    practiceTitle: 'Практические задания',
    practiceIntro:
      'Выполни на своём компьютере или VPS — так материал запоминается лучше всего.',
    resourcesTitle: 'Справочные материалы (опционально)',
    navPrev: 'Предыдущая',
    navNext: 'Следующая',
    tocSidebar: 'На этой странице',
    tocPractice: 'Практические задания',
    tocTerminal: 'Терминальная практика',
    tocQuiz: 'Квиз для самопроверки',
    tocResources: 'Справочные материалы',
  },
  quiz: {
    title: 'Квиз для самопроверки',
    intro:
      'Ответь на вопросы, чтобы закрепить материал. Нажми «Проверить», чтобы увидеть правильный ответ.',
    check: 'Проверить',
    showAnswer: 'Показать ответ',
    hideAnswer: 'Скрыть ответ',
    correct: 'Верно!',
    wrong: 'Неверно. Правильный ответ:',
    answerLabel: 'Ответ:',
  },
  terminal: {
    completed: 'Завершено',
    stepOf: 'Шаг {{current}} из {{total}}',
    hint: 'Подсказка:',
    successNext: '✓ Верно! Переходим к следующему шагу.',
    inputAria: 'Команда терминала',
    labCompleteTitle: 'Лабораторная работа завершена!',
    labCompleteBody:
      'Ты отработал базовый синтаксис команд. Повтори те же шаги на реальном VPS или в локальной VM, чтобы закрепить мышечную память.',
    errEmpty: 'Введите команду и нажмите Enter.',
    errMismatch:
      'Команда не совпадает с ожидаемым синтаксисом. Проверьте пробелы и аргументы.',
    errNoAccept: 'Для этого шага не заданы допустимые команды.',
  },
  modules: {
    intro: {
      title: 'Введение',
      description: 'Что такое DevOps и с чего начать путь',
    },
    fundamentals: {
      title: 'Основы',
      description: 'Linux, сети, Git и Bash — фундамент DevOps',
    },
    containers: {
      title: 'Контейнеры',
      description: 'Docker и Docker Compose',
    },
    orchestration: {
      title: 'Оркестрация',
      description: 'Kubernetes и Helm',
    },
    cicd: {
      title: 'CI/CD',
      description: 'GitHub Actions, GitLab CI и GitOps',
    },
    iac: {
      title: 'Infrastructure as Code',
      description: 'Terraform и Ansible',
    },
    cloud: {
      title: 'Облака',
      description: 'AWS и облачная инфраструктура',
    },
    observability: {
      title: 'Наблюдаемость',
      description: 'Prometheus, Grafana, Zabbix, логи и алерты',
    },
    security: {
      title: 'Безопасность',
      description: 'DevSecOps и защита инфраструктуры',
    },
    career: {
      title: 'Карьера',
      description: 'Портфолио, сертификации и собеседования',
    },
    sysadmin: {
      title: 'Системное администрирование',
      description: 'Windows Server, Active Directory, GPO и бэкапы',
    },
    'office-network': {
      title: 'Офисные сети',
      description: 'Проектирование, VLAN, DHCP/DNS и Wi‑Fi',
    },
    omada: {
      title: 'TP-Link Omada',
      description: 'Controller, switches, EAP и VPN',
    },
    fortinet: {
      title: 'Fortinet',
      description: 'FortiGate, firewall, VPN и эксплуатация',
    },
    opnsense: {
      title: 'OPNsense',
      description: 'Open-source firewall, VPN, Suricata и эксплуатация',
    },
    'it-support': {
      title: 'IT Support',
      description: 'Helpdesk, рабочие станции и playbooks',
    },
  },
}

export type Translations = typeof ru
