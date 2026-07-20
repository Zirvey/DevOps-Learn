import type { Chapter } from '../../../types'

export const ansibleChapter: Chapter = {
  id: 'ansible',
  slug: 'ansible',
  title: 'Ansible: конфигурационное управление',
  moduleId: 'iac',
  order: 1,
  duration: '4–5 часов',
  level: 'intermediate',
  description:
    'Inventory, playbooks, roles, vault, handlers, templates, настройка реального сервера',
  sections: [
    {
      title: 'Конфигурационное управление',
      content: `**Configuration Management (CM)** — автоматизация настройки серверов: установка пакетов, конфигурация файлов, управление службами.

**Задачи CM:**
- Установить nginx, PostgreSQL, Redis
- Настроить firewall, users, SSH keys
- Deploy приложения и обновить конфиги
- Обеспечить идемпотентность — повторный запуск даёт тот же результат

**Инструменты CM:**
| Инструмент | Подход | Агент |
|-----------|--------|-------|
| **Ansible** | Императивный (playbooks) | Нет (SSH) |
| **Chef** | Декларативный | Да (agent) |
| **Puppet** | Декларативный | Да (agent) |
| **SaltStack** | Императивный | Опционально |

**Ansible** — лидер по популярности для CM благодаря простоте, agentless-архитектуре и YAML-синтаксису.`,
    },
    {
      title: 'Terraform vs Ansible',
      content: `**Terraform** и **Ansible** решают разные задачи и часто используются **вместе**:

| | Terraform | Ansible |
|---|-----------|---------|
| Назначение | Создание инфраструктуры | Настройка серверов |
| Уровень | Cloud API (VPC, EC2, S3) | OS level (packages, configs) |
| Подход | Декларативный | Императивный (процедурный) |
| State | terraform.tfstate | Нет (проверяет фактическое состояние) |
| Агент | Нет | Нет (SSH/WinRM) |

**Типичный flow:**
\`\`\`
Terraform: создать VPC → EC2 → Security Group
    ↓
Ansible: установить Docker → deploy app → настроить nginx
\`\`\`

**Интеграция:**
1. Terraform provisioner (устаревший подход)
2. Terraform output → Ansible dynamic inventory
3. Отдельные pipeline steps: terraform apply → ansible-playbook
4. Terraform создаёт, Ansible настраивает — разделение ответственности`,
    },
    {
      title: 'Архитектура Ansible',
      content: `**Компоненты Ansible:**

\`\`\`
Control Node (твой ноутбук/CI)
    │
    │ SSH / WinRM
    ▼
Managed Nodes (серверы)
\`\`\`

- **Control Node** — машина, с которой запускается Ansible (твой ноутбук или CI runner)
- **Managed Nodes** — серверы, которые настраиваются
- **Inventory** — список managed nodes
- **Playbook** — YAML-файл с описанием задач
- **Module** — единица работы (apt, copy, systemd, template...)
- **Role** — переиспользуемый набор tasks, handlers, templates
- **Collection** — пакет modules, roles, plugins

**Agentless** — Ansible не требует установки агента на серверы. Подключается по SSH (Linux) или WinRM (Windows), выполняет модули, отключается.

**Идемпотентность** — повторный запуск playbook не меняет состояние, если оно уже соответствует желаемому.`,
    },
    {
      title: 'Установка Ansible',
      content: `**macOS:**
\`\`\`bash
brew install ansible
\`\`\`

**Ubuntu/Debian:**
\`\`\`bash
sudo apt update && sudo apt install ansible -y
\`\`\`

**pip (любая ОС):**
\`\`\`bash
pip install ansible
# или в venv (рекомендуется)
python3 -m venv ~/ansible-venv
source ~/ansible-venv/bin/activate
pip install ansible
\`\`\`

**Проверка:**
\`\`\`bash
ansible --version
# ansible [core 2.16.x]
\`\`\`

**ansible.cfg** — конфигурация (в текущей директории, ~/.ansible.cfg или /etc/ansible/ansible.cfg):
\`\`\`ini
[defaults]
inventory = ./inventory
remote_user = ubuntu
host_key_checking = False
retry_files_enabled = False

[privilege_escalation]
become = True
become_method = sudo
\`\`\``,
      code: {
        language: 'bash',
        code: `ansible --version
ansible-doc apt       # документация модуля
ansible-doc -l          # список всех модулей

# Структура проекта
mkdir -p my-ansible/{inventory,playbooks,roles}
touch my-ansible/ansible.cfg
touch my-ansible/inventory/hosts.yml`,
        caption: 'Установка и структура проекта',
      },
    },
    {
      title: 'Inventory',
      content: `**Inventory** — список хостов, на которых Ansible выполняет задачи.

**Статический inventory (INI):**
\`\`\`ini
[webservers]
web1.example.com
web2.example.com ansible_host=10.0.1.10

[databases]
db1.example.com

[webservers:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/id_rsa
\`\`\`

**Статический inventory (YAML):**
\`\`\`yaml
all:
  children:
    webservers:
      hosts:
        web1:
          ansible_host: 10.0.1.10
        web2:
          ansible_host: 10.0.1.11
      vars:
        http_port: 80
    databases:
      hosts:
        db1:
          ansible_host: 10.0.2.10
\`\`\`

**Динамический inventory** — скрипт или plugin, генерирующий inventory из облака:
\`\`\`bash
ansible-inventory -i aws_ec2.yml --graph
\`\`\`

**Проверка connectivity:**
\`\`\`bash
ansible all -m ping
ansible webservers -m ping
ansible webservers -m shell -a "uptime"
\`\`\``,
      code: {
        language: 'yaml',
        code: `# inventory/hosts.yml
all:
  children:
    webservers:
      hosts:
        web1:
          ansible_host: 10.0.1.10
          ansible_user: ubuntu
        web2:
          ansible_host: 10.0.1.11
          ansible_user: ubuntu
    databases:
      hosts:
        db1:
          ansible_host: 10.0.2.10
          ansible_user: ubuntu
  vars:
    ansible_python_interpreter: /usr/bin/python3`,
        caption: 'YAML inventory с группами',
      },
    },
    {
      title: 'Ad-hoc команды',
      content: `**Ad-hoc** — разовые команды без playbook.

\`\`\`bash
# Ping всех хостов
ansible all -m ping

# Установить пакет
ansible webservers -m apt -a "name=nginx state=present" --become

# Копировать файл
ansible webservers -m copy -a "src=./index.html dest=/var/www/html/index.html" --become

# Перезапустить службу
ansible webservers -m systemd -a "name=nginx state=restarted" --become

# Собрать facts
ansible webservers -m setup -a "filter=ansible_distribution*"

# Shell команда
ansible webservers -m shell -a "df -h /"
\`\`\`

**Полезные флаги:**
| Флаг | Описание |
|------|----------|
| \`-m\` | Модуль |
| \`-a\` | Аргументы модуля |
| \`--become\` | sudo |
| \`-i\` | Inventory file |
| \`--check\` | Dry-run |
| \`-l\` / \`--limit\` | Ограничить хосты |
| \`-v\` / \`-vvv\` | Verbose |

Ad-hoc — для быстрых задач. Для повторяемых — playbooks.`,
    },
    {
      title: 'Playbooks',
      content: `**Playbook** — YAML-файл, описывающий набор plays (задач для группы хостов).

**Структура:**
\`\`\`yaml
---
- name: Play name
  hosts: target_group
  become: yes
  vars:
    key: value
  tasks:
    - name: Task description
      module:
        param: value
  handlers:
    - name: Handler name
      module:
        param: value
\`\`\`

**Запуск:**
\`\`\`bash
ansible-playbook playbooks/site.yml
ansible-playbook playbooks/site.yml --check    # dry-run
ansible-playbook playbooks/site.yml --limit web1  # один хост
ansible-playbook playbooks/site.yml -v         # verbose
\`\`\`

**Один playbook — несколько plays:**
\`\`\`yaml
- name: Configure web servers
  hosts: webservers
  tasks: [...]

- name: Configure databases
  hosts: databases
  tasks: [...]
\`\`\``,
      code: {
        language: 'yaml',
        code: `---
- name: Configure web servers
  hosts: webservers
  become: yes

  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Install nginx
      apt:
        name: nginx
        state: present

    - name: Start and enable nginx
      systemd:
        name: nginx
        state: started
        enabled: yes

    - name: Copy index page
      copy:
        content: "<h1>Hello from Ansible</h1>"
        dest: /var/www/html/index.html
        mode: '0644'
      notify: Reload nginx

  handlers:
    - name: Reload nginx
      systemd:
        name: nginx
        state: reloaded`,
        caption: 'Playbook: установка и настройка nginx',
      },
    },
    {
      title: 'Tasks и модули',
      content: `**Task** — одна операция в playbook. Использует **модуль** — готовый блок кода.

**Категории модулей:**
| Категория | Примеры |
|-----------|---------|
| **Packaging** | apt, yum, pip, npm |
| **Files** | copy, template, file, lineinfile |
| **Services** | systemd, service |
| **Commands** | command, shell, script |
| **Cloud** | amazon.aws.ec2_instance, community.docker |
| **Database** | mysql_db, postgresql_db |
| **Network** | ufw, iptables |

**Идемпотентные модули (предпочитай):**
\`\`\`yaml
- name: Install nginx (идемпотентно)
  apt:
    name: nginx
    state: present    # установит, если нет; ничего, если есть

- name: Run command (НЕ идемпотентно)
  shell: apt install -y nginx   # выполнится каждый раз!
\`\`\`

**Условия и циклы:**
\`\`\`yaml
- name: Install on Debian
  apt:
    name: nginx
  when: ansible_os_family == "Debian"

- name: Create users
  user:
    name: "{{ item.name }}"
    groups: "{{ item.groups }}"
  loop:
    - { name: alice, groups: sudo }
    - { name: bob, groups: users }
\`\`\``,
    },
    {
      title: 'Variables и Facts',
      content: `**Variables** — параметризация playbooks.

**Источники переменных (приоритет от низшего к высшему):**
1. Command line (\`-e\`)
2. Play vars
3. Host facts
4. Host vars / Group vars
5. Role defaults
6. Inventory vars

**Определение:**
\`\`\`yaml
vars:
  http_port: 80
  app_version: "1.2.3"

vars_files:
  - vars/production.yml
\`\`\`

**Group vars / Host vars:**
\`\`\`
inventory/
├── hosts.yml
├── group_vars/
│   ├── webservers.yml
│   └── databases.yml
└── host_vars/
    └── web1.yml
\`\`\`

**Facts** — автоматически собираемая информация о хосте:
\`\`\`yaml
- name: Print OS
  debug:
    msg: "{{ ansible_distribution }} {{ ansible_distribution_version }}"

- name: Use fact in template
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  vars:
    worker_processes: "{{ ansible_processor_vcpus }}"
\`\`\`

**gather_facts: no** — отключить сбор facts для ускорения.`,
    },
    {
      title: 'Handlers',
      content: `**Handlers** — специальные tasks, которые выполняются **только при изменении** (notify), и **один раз** в конце play (даже если несколько tasks notify).

**Зачем:** не перезапускать nginx 5 раз, если изменилось 5 конфигов.

\`\`\`yaml
tasks:
  - name: Update nginx config
    template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    notify: Restart nginx

  - name: Update site config
    template:
      src: site.conf.j2
      dest: /etc/nginx/sites-available/default
    notify: Restart nginx

handlers:
  - name: Restart nginx
    systemd:
      name: nginx
      state: restarted
\`\`\`

→ Nginx перезапустится **один раз**, даже если оба task изменили файлы.

**listen** — один handler на несколько notify:
\`\`\`yaml
handlers:
  - name: Restart web services
    listen: "restart web"
    systemd:
      name: nginx
      state: restarted
\`\`\`

\`\`\`yaml
notify: "restart web"
\`\`\``,
    },
    {
      title: 'Templates (Jinja2)',
      content: `**Template** — файл с Jinja2-шаблоном, рендерится с variables и копируется на хост.

**Модуль template:**
\`\`\`yaml
- name: Deploy nginx config
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'
    validate: nginx -t -c %s    # проверка перед применением
  notify: Reload nginx
\`\`\`

**Jinja2 синтаксис (.j2 файлы):**
\`\`\`jinja2
# Переменные
worker_processes {{ ansible_processor_vcpus }};
server_name {{ server_name }};

# Условия
{% if ssl_enabled %}
listen 443 ssl;
ssl_certificate {{ ssl_cert_path }};
{% else %}
listen 80;
{% endif %}

# Циклы
{% for upstream in upstreams %}
upstream {{ upstream.name }} {
    server {{ upstream.host }}:{{ upstream.port }};
}
{% endfor %}
\`\`\`

Templates — основной способ управления конфигурационными файлами.`,
      code: {
        language: 'jinja2',
        code: `# templates/nginx.conf.j2
user www-data;
worker_processes {{ worker_processes | default(ansible_processor_vcpus) }};

events {
    worker_connections {{ worker_connections | default(1024) }};
}

http {
    include /etc/nginx/mime.types;

    server {
        listen {{ http_port | default(80) }};
        server_name {{ server_name }};

        location / {
            root /var/www/html;
            index index.html;
        }

        location /api {
            proxy_pass http://127.0.0.1:{{ app_port | default(3000) }};
        }
    }
}`,
        caption: 'Jinja2 шаблон nginx.conf',
      },
    },
    {
      title: 'Roles',
      content: `**Role** — переиспользуемая структура для организации tasks, handlers, templates, vars.

**Структура role:**
\`\`\`
roles/nginx/
├── defaults/main.yml     # default variables (низший приоритет)
├── vars/main.yml         # role variables (высокий приоритет)
├── tasks/main.yml        # tasks
├── handlers/main.yml     # handlers
├── templates/            # Jinja2 templates
│   └── nginx.conf.j2
├── files/                # статические файлы
│   └── index.html
├── meta/main.yml         # metadata, dependencies
└── README.md
\`\`\`

**Использование в playbook:**
\`\`\`yaml
- name: Configure web servers
  hosts: webservers
  become: yes
  roles:
    - role: nginx
      vars:
        http_port: 8080
    - role: common
    - role: docker
\`\`\`

**Создание role:**
\`\`\`bash
ansible-galaxy init roles/nginx
\`\`\`

**Galaxy** — реестр community roles:
\`\`\`bash
ansible-galaxy install geerlingguy.nginx
ansible-galaxy collection install community.docker
\`\`\`

Roles — стандарт организации Ansible-проектов.`,
    },
    {
      title: 'Ansible Vault',
      content: `**Ansible Vault** — шифрование чувствительных данных в playbooks и variables.

**Создание encrypted file:**
\`\`\`bash
ansible-vault create group_vars/all/secrets.yml
ansible-vault edit group_vars/all/secrets.yml
ansible-vault view group_vars/all/secrets.yml
\`\`\`

**Содержимое secrets.yml (зашифровано на диске):**
\`\`\`yaml
db_password: "super-secret-password"
api_key: "sk-1234567890"
jwt_secret: "my-jwt-secret"
\`\`\`

**Запуск с vault:**
\`\`\`bash
ansible-playbook site.yml --ask-vault-pass
ansible-playbook site.yml --vault-password-file ~/.vault_pass
ansible-playbook site.yml --vault-id prod@~/.vault_pass_prod
\`\`\`

**Шифрование отдельных значений:**
\`\`\`bash
ansible-vault encrypt_string 'super-secret' --name 'db_password'
\`\`\`

\`\`\`yaml
db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  663864396538663866313761303061653036653864383862333...
\`\`\`

**Правила:**
- Vault password — НЕ в Git (CI secrets, password manager)
- Шифруй все secrets: passwords, API keys, tokens, certificates
- Разные vault passwords для разных окружений`,
    },
    {
      title: 'Настройка реального сервера: web stack',
      content: `Полный playbook для настройки web-сервера: nginx + Node.js app + firewall + deploy.`,
      code: {
        language: 'yaml',
        code: `---
# playbooks/web-stack.yml
- name: Setup web stack
  hosts: webservers
  become: yes

  vars:
    app_name: myapp
    app_port: 3000
    app_user: app
    node_version: "20"

  roles:
    - common
    - nginx
    - app

# roles/common/tasks/main.yml
- name: Update apt cache
  apt:
    update_cache: yes
    cache_valid_time: 3600

- name: Install base packages
  apt:
    name: [curl, git, ufw, fail2ban]
    state: present

- name: Configure UFW
  ufw:
    rule: allow
    port: "{{ item }}"
    proto: tcp
  loop: [22, 80, 443]

- name: Enable UFW
  ufw:
    state: enabled
    policy: deny

- name: Create app user
  user:
    name: "{{ app_user }}"
    shell: /bin/bash
    system: yes

# roles/app/tasks/main.yml
- name: Install Node.js
  apt:
    name: nodejs
    state: present

- name: Deploy application
  git:
    repo: https://github.com/org/myapp.git
    dest: /opt/{{ app_name }}
    version: main
  notify: Restart app

- name: Install npm dependencies
  npm:
    path: /opt/{{ app_name }}
    production: yes

- name: Copy systemd unit
  template:
    src: app.service.j2
    dest: /etc/systemd/system/{{ app_name }}.service
  notify: Restart app

- name: Enable and start app
  systemd:
    name: "{{ app_name }}"
    state: started
    enabled: yes`,
        caption: 'Playbook: полная настройка web-сервера',
      },
    },
    {
      title: 'Интеграция с Terraform',
      content: `**Паттерн: Terraform создаёт → Ansible настраивает**

**1. Terraform output → Ansible inventory:**
\`\`\`hcl
# outputs.tf
output "web_server_ip" {
  value = aws_instance.web.public_ip
}
\`\`\`

\`\`\`bash
# После terraform apply
terraform output -json | jq -r '.web_server_ip.value' > /tmp/web_ip
\`\`\`

**2. Dynamic inventory (AWS EC2):**
\`\`\`yaml
# inventory/aws_ec2.yml
plugin: amazon.aws.aws_ec2
regions:
  - eu-central-1
filters:
  tag:ManagedBy: terraform
  instance-state-name: running
keyed_groups:
  - key: tags.Role
    prefix: role
hostnames:
  - ip-address
\`\`\`

\`\`\`bash
ansible-playbook -i inventory/aws_ec2.yml playbooks/site.yml
\`\`\`

**3. CI/CD pipeline:**
\`\`\`yaml
# GitHub Actions
- name: Terraform Apply
  run: terraform apply -auto-approve

- name: Wait for SSH
  run: sleep 30

- name: Ansible Configure
  run: ansible-playbook -i inventory/aws_ec2.yml playbooks/site.yml
\`\`\``,
    },
    {
      title: 'Best practices Ansible',
      content: `**1. Структура проекта:**
\`\`\`
ansible/
├── ansible.cfg
├── inventory/
│   ├── hosts.yml
│   ├── group_vars/
│   └── host_vars/
├── playbooks/
│   └── site.yml
├── roles/
│   ├── common/
│   ├── nginx/
│   └── app/
├── files/
├── templates/
└── requirements.yml    # galaxy dependencies
\`\`\`

**2. Идемпотентность** — используй модули, не shell/command (если можно).

**3. Именование** — каждый task с \`name:\` (читаемый вывод).

**4. Tags** — для выборочного запуска:
\`\`\`yaml
- name: Install nginx
  apt: name=nginx
  tags: [packages, nginx]
\`\`\`
\`\`\`bash
ansible-playbook site.yml --tags nginx
\`\`\`

**5. Vault** — все secrets зашифрованы.

**6. Linting:**
\`\`\`bash
pip install ansible-lint
ansible-lint playbooks/site.yml
\`\`\`

**7. Testing:**
- **Molecule** — тестирование roles (Docker/VM)
- **ansible-check** — dry-run перед apply

**8. Версионирование** — Ansible-код в Git, code review через PR.`,
    },
  ],
  practice: [
    'Установи Ansible, создай inventory с 2 группами (webservers, databases) и проверь ping',
    'Напиши playbook для установки nginx, создания HTML-страницы и настройки systemd',
    'Добавь Jinja2 template для nginx.conf с переменными port и server_name',
    'Создай role nginx с tasks, handlers, templates и используй в playbook',
    'Зашифруй db_password через ansible-vault и используй в playbook',
    'Настрой handlers: изменение конфига → reload nginx (проверь, что restart один раз)',
    'Подними EC2 через Terraform, настрой dynamic inventory AWS EC2, запусти playbook',
    'Напиши полный web-stack playbook: ufw + nginx + Node.js app + systemd unit',
    'Установи ansible-lint и исправь все предупреждения в playbooks',
    'Интегрируй Ansible в GitHub Actions: terraform apply → ansible-playbook',
  ],
  resources: [
    { title: 'Ansible Docs', url: 'https://docs.ansible.com' },
    { title: 'Ansible Galaxy', url: 'https://galaxy.ansible.com' },
  ],
}
