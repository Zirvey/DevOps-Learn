import type { Translations } from './ru'

export const en: Translations = {
  common: {
    menu: 'Menu',
    sections: 'sections',
    questions: 'questions',
    chapters: 'chapters',
    completed: 'completed',
    level: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    themeSwitchToLight: 'Switch to light theme',
    themeSwitchToDark: 'Switch to dark theme',
  },
  header: {
    startLearning: 'Start learning',
  },
  search: {
    placeholder: 'Search the handbook... (⌘K)',
    empty: 'No results',
  },
  home: {
    heroBadge: 'Online course · 50 lessons · DevOps + Office IT',
    heroTitlePrefix: 'Platform for learning ',
    heroTitleAccent: 'DevOps',
    heroSubtitle: 'Lessons, practice, and tests.',
    trustLine:
      '{{completed}} of {{total}} chapters completed · {{modules}} modules · {{sections}} sections',
    metricChaptersLabel: 'Chapters in course',
    metricChaptersDeltaProgress: '+{{progress}}% completed',
    metricChaptersDeltaZero: 'From zero to junior',
    metricModulesLabel: 'Modules',
    metricModulesDelta: 'DevOps + Office IT',
    metricProgressLabel: 'Your progress',
    metricProgressDeltaDone: '{{count}} chapters finished',
    metricProgressDeltaEmpty: 'Mark a chapter when you finish it',
    modulesSectionTitle: 'Courses and modules',
    modulesSectionSub:
      '15 modules — a structured path from basics to production practice',
    moduleCardFooter: '{{chapters}} chapters · {{done}} completed',
  },
  chapter: {
    markComplete: 'Mark as completed',
    markedComplete: 'Completed',
    tocMobile: 'Chapter contents',
    tocAria: 'Chapter table of contents',
    practiceTitle: 'Hands-on exercises',
    practiceIntro:
      'Try these on your own machine or a VPS — that is how the material sticks best.',
    resourcesTitle: 'Reference materials (optional)',
    navPrev: 'Previous',
    navNext: 'Next',
    tocSidebar: 'On this page',
    tocPractice: 'Hands-on exercises',
    tocTerminal: 'Terminal practice',
    tocQuiz: 'Self-check quiz',
    tocResources: 'Reference materials',
  },
  quiz: {
    title: 'Self-check quiz',
    intro:
      'Answer the questions to reinforce the material. Click “Check” to reveal the correct answer.',
    check: 'Check',
    showAnswer: 'Show answer',
    hideAnswer: 'Hide answer',
    correct: 'Correct!',
    wrong: 'Incorrect. The right answer:',
    answerLabel: 'Answer:',
  },
  terminal: {
    completed: 'Completed',
    stepOf: 'Step {{current}} of {{total}}',
    hint: 'Hint:',
    successNext: '✓ Correct! Moving to the next step.',
    inputAria: 'Terminal command',
    labCompleteTitle: 'Lab completed!',
    labCompleteBody:
      'You practiced the basic command syntax. Repeat the same steps on a real VPS or local VM to build muscle memory.',
    errEmpty: 'Enter a command and press Enter.',
    errMismatch:
      'Command does not match the expected syntax. Check spaces and arguments.',
    errNoAccept: 'No accepted commands are defined for this step.',
  },
  modules: {
    intro: {
      title: 'Introduction',
      description: 'What DevOps is and where to start',
    },
    fundamentals: {
      title: 'Fundamentals',
      description: 'Linux, networking, Git, and Bash — the DevOps foundation',
    },
    containers: {
      title: 'Containers',
      description: 'Docker and Docker Compose',
    },
    orchestration: {
      title: 'Orchestration',
      description: 'Kubernetes and Helm',
    },
    cicd: {
      title: 'CI/CD',
      description: 'Build and delivery automation',
    },
    iac: {
      title: 'Infrastructure as Code',
      description: 'Terraform and Ansible',
    },
    cloud: {
      title: 'Cloud',
      description: 'AWS and cloud infrastructure',
    },
    observability: {
      title: 'Observability',
      description: 'Monitoring, logs, and alerts',
    },
    security: {
      title: 'Security',
      description: 'DevSecOps and infrastructure protection',
    },
    career: {
      title: 'Career',
      description: 'Portfolio, certifications, and interviews',
    },
    sysadmin: {
      title: 'System administration',
      description: 'Windows Server, Active Directory, GPO, and backups',
    },
    'office-network': {
      title: 'Office networks',
      description: 'Design, VLANs, DHCP/DNS, and Wi‑Fi',
    },
    omada: {
      title: 'TP-Link Omada',
      description: 'Controller, switches, EAP, and VPN',
    },
    fortinet: {
      title: 'Fortinet',
      description: 'FortiGate, firewall, VPN, and operations',
    },
    'it-support': {
      title: 'IT Support',
      description: 'Helpdesk, endpoints, and playbooks',
    },
  },
}
