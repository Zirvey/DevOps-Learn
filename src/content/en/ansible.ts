import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: `Ansible: configuration management`,
  duration: `4–5 hours`,
  description: `Inventory, playbooks, roles, vault, handlers, templates, and configuring a real server`,
  sections: [
    {
      title: `Configuration management`,
      content: `**Configuration Management (CM)** automates server setup: installing packages, configuring files, managing services.

**CM tasks:**
- Install nginx, PostgreSQL, Redis
- Configure firewall, users, SSH keys
- Deploy applications and update configs
- Ensure idempotency — re-running yields the same result

**CM tools:**
| Tool | Approach | Agent |
|-----------|--------|-------|
| **Ansible** | Imperative (playbooks) | No (SSH) |
| **Chef** | Declarative | Yes (agent) |
| **Puppet** | Declarative | Yes (agent) |
| **SaltStack** | Imperative | Optional |

**Ansible** leads CM popularity thanks to simplicity, agentless architecture, and YAML syntax.`,
    },
    {
      title: `Terraform vs Ansible`,
      content: `**Terraform** and **Ansible** solve different problems and are often used **together**:

| | Terraform | Ansible |
|---|-----------|---------|
| Purpose | Create infrastructure | Configure servers |
| Level | Cloud API (VPC, EC2, S3) | OS level (packages, configs) |
| Approach | Declarative | Imperative (procedural) |
| State | terraform.tfstate | None (checks actual state) |
| Agent | No | No (SSH/WinRM) |

**Typical flow:**
\`\`\`
Terraform: create VPC → EC2 → Security Group
    ↓
Ansible: install Docker → deploy app → configure nginx
\`\`\`

**Integration:**
1. Terraform provisioner (outdated approach)
2. Terraform output → Ansible dynamic inventory
3. Separate pipeline steps: terraform apply → ansible-playbook
4. Terraform creates, Ansible configures — separation of concerns`,
    },
    {
      title: `Ansible architecture`,
      content: `**Ansible components:**

\`\`\`
Control Node (your laptop/CI)
    │
    │ SSH / WinRM
    ▼
Managed Nodes (servers)
\`\`\`

- **Control Node** — the machine that runs Ansible (your laptop or CI runner)
- **Managed Nodes** — servers being configured
- **Inventory** — list of managed nodes
- **Playbook** — YAML file describing tasks
- **Module** — unit of work (apt, copy, systemd, template...)
- **Role** — reusable set of tasks, handlers, templates
- **Collection** — package of modules, roles, plugins

**Agentless** — Ansible does not require an agent on servers. It connects over SSH (Linux) or WinRM (Windows), runs modules, and disconnects.

**Idempotency** — re-running a playbook does not change state if it already matches the desired one.`,
    },
    {
      title: `Installing Ansible`,
      content: `**macOS:**
\`\`\`bash
brew install ansible
\`\`\`

**Ubuntu/Debian:**
\`\`\`bash
sudo apt update && sudo apt install ansible -y
\`\`\`

**pip (any OS):**
\`\`\`bash
pip install ansible
# or in a venv (recommended)
python3 -m venv ~/ansible-venv
source ~/ansible-venv/bin/activate
pip install ansible
\`\`\`

**Verify:**
\`\`\`bash
ansible --version
# ansible [core 2.16.x]
\`\`\`

**ansible.cfg** — configuration (current directory, ~/.ansible.cfg, or /etc/ansible/ansible.cfg):
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
        language: `bash`,
        code: `ansible --version
ansible-doc apt       # документация модуля
ansible-doc -l          # список всех модулей

# Структура проекта
mkdir -p my-ansible/{inventory,playbooks,roles}
touch my-ansible/ansible.cfg
touch my-ansible/inventory/hosts.yml`,
        caption: `Install and project layout`,
      },
    },
    {
      title: `Inventory`,
      content: `**Inventory** — the list of hosts where Ansible runs tasks.

**Static inventory (INI):**
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

**Static inventory (YAML):**
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

**Dynamic inventory** — a script or plugin that generates inventory from the cloud:
\`\`\`bash
ansible-inventory -i aws_ec2.yml --graph
\`\`\`

**Connectivity check:**
\`\`\`bash
ansible all -m ping
ansible webservers -m ping
ansible webservers -m shell -a "uptime"
\`\`\``,
      code: {
        language: `yaml`,
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
        caption: `YAML inventory with groups`,
      },
    },
    {
      title: `Ad-hoc commands`,
      content: `**Ad-hoc** — one-off commands without a playbook.

\`\`\`bash
# Ping all hosts
ansible all -m ping

# Install a package
ansible webservers -m apt -a "name=nginx state=present" --become

# Copy a file
ansible webservers -m copy -a "src=./index.html dest=/var/www/html/index.html" --become

# Restart a service
ansible webservers -m systemd -a "name=nginx state=restarted" --become

# Gather facts
ansible webservers -m setup -a "filter=ansible_distribution*"

# Shell command
ansible webservers -m shell -a "df -h /"
\`\`\`

**Useful flags:**
| Flag | Description |
|------|----------|
| \`-m\` | Module |
| \`-a\` | Module arguments |
| \`--become\` | sudo |
| \`-i\` | Inventory file |
| \`--check\` | Dry-run |
| \`-l\` / \`--limit\` | Limit hosts |
| \`-v\` / \`-vvv\` | Verbose |

Ad-hoc is for quick tasks. For repeatable work — playbooks.`,
    },
    {
      title: `Playbooks`,
      content: `**Playbook** — a YAML file describing a set of plays (tasks for a host group).

**Structure:**
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

**Run:**
\`\`\`bash
ansible-playbook playbooks/site.yml
ansible-playbook playbooks/site.yml --check    # dry-run
ansible-playbook playbooks/site.yml --limit web1  # one host
ansible-playbook playbooks/site.yml -v         # verbose
\`\`\`

**One playbook — multiple plays:**
\`\`\`yaml
- name: Configure web servers
  hosts: webservers
  tasks: [...]

- name: Configure databases
  hosts: databases
  tasks: [...]
\`\`\``,
      code: {
        language: `yaml`,
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
        caption: `Playbook: install and configure nginx`,
      },
    },
    {
      title: `Tasks and modules`,
      content: `**Task** — one operation in a playbook. It uses a **module** — a ready-made code block.

**Module categories:**
| Category | Examples |
|-----------|---------|
| **Packaging** | apt, yum, pip, npm |
| **Files** | copy, template, file, lineinfile |
| **Services** | systemd, service |
| **Commands** | command, shell, script |
| **Cloud** | amazon.aws.ec2_instance, community.docker |
| **Database** | mysql_db, postgresql_db |
| **Network** | ufw, iptables |

**Idempotent modules (prefer these):**
\`\`\`yaml
- name: Install nginx (idempotent)
  apt:
    name: nginx
    state: present    # installs if missing; no-op if present

- name: Run command (NOT idempotent)
  shell: apt install -y nginx   # runs every time!
\`\`\`

**Conditionals and loops:**
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
      title: `Variables and Facts`,
      content: `**Variables** — parameterize playbooks.

**Variable sources (lowest to highest priority):**
1. Command line (\`-e\`)
2. Play vars
3. Host facts
4. Host vars / Group vars
5. Role defaults
6. Inventory vars

**Definition:**
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

**Facts** — automatically gathered host information:
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

**gather_facts: no** — disable fact gathering for speed.`,
    },
    {
      title: `Handlers`,
      content: `**Handlers** — special tasks that run **only on change** (notify), and **once** at the end of the play (even if multiple tasks notify).

**Why:** do not restart nginx 5 times if 5 configs changed.

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

→ Nginx restarts **once**, even if both tasks changed files.

**listen** — one handler for several notify names:
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
      title: `Templates (Jinja2)`,
      content: `**Template** — a Jinja2 template file rendered with variables and copied to the host.

**template module:**
\`\`\`yaml
- name: Deploy nginx config
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    group: root
    mode: '0644'
    validate: nginx -t -c %s    # validate before applying
  notify: Reload nginx
\`\`\`

**Jinja2 syntax (.j2 files):**
\`\`\`jinja2
# Variables
worker_processes {{ ansible_processor_vcpus }};
server_name {{ server_name }};

# Conditionals
{% if ssl_enabled %}
listen 443 ssl;
ssl_certificate {{ ssl_cert_path }};
{% else %}
listen 80;
{% endif %}

# Loops
{% for upstream in upstreams %}
upstream {{ upstream.name }} {
    server {{ upstream.host }}:{{ upstream.port }};
}
{% endfor %}
\`\`\`

Templates are the main way to manage configuration files.`,
      code: {
        language: `jinja2`,
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
        caption: `Jinja2 nginx.conf template`,
      },
    },
    {
      title: `Roles`,
      content: `**Role** — a reusable structure for organizing tasks, handlers, templates, and vars.

**Role layout:**
\`\`\`
roles/nginx/
├── defaults/main.yml     # default variables (lowest priority)
├── vars/main.yml         # role variables (high priority)
├── tasks/main.yml        # tasks
├── handlers/main.yml     # handlers
├── templates/            # Jinja2 templates
│   └── nginx.conf.j2
├── files/                # static files
│   └── index.html
├── meta/main.yml         # metadata, dependencies
└── README.md
\`\`\`

**Usage in a playbook:**
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

**Create a role:**
\`\`\`bash
ansible-galaxy init roles/nginx
\`\`\`

**Galaxy** — community role registry:
\`\`\`bash
ansible-galaxy install geerlingguy.nginx
ansible-galaxy collection install community.docker
\`\`\`

Roles are the standard way to organize Ansible projects.`,
    },
    {
      title: `Ansible Vault`,
      content: `**Ansible Vault** — encrypt sensitive data in playbooks and variables.

**Create an encrypted file:**
\`\`\`bash
ansible-vault create group_vars/all/secrets.yml
ansible-vault edit group_vars/all/secrets.yml
ansible-vault view group_vars/all/secrets.yml
\`\`\`

**secrets.yml contents (encrypted on disk):**
\`\`\`yaml
db_password: "super-secret-password"
api_key: "sk-1234567890"
jwt_secret: "my-jwt-secret"
\`\`\`

**Run with vault:**
\`\`\`bash
ansible-playbook site.yml --ask-vault-pass
ansible-playbook site.yml --vault-password-file ~/.vault_pass
ansible-playbook site.yml --vault-id prod@~/.vault_pass_prod
\`\`\`

**Encrypt individual values:**
\`\`\`bash
ansible-vault encrypt_string 'super-secret' --name 'db_password'
\`\`\`

\`\`\`yaml
db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  663864396538663866313761303061653036653864383862333...
\`\`\`

**Rules:**
- Vault password — NOT in Git (CI secrets, password manager)
- Encrypt all secrets: passwords, API keys, tokens, certificates
- Different vault passwords for different environments`,
    },
    {
      title: `Configuring a real server: web stack`,
      content: `Full playbook for a web server: nginx + Node.js app + firewall + deploy.`,
      code: {
        language: `yaml`,
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
        caption: `Playbook: full web server setup`,
      },
    },
    {
      title: `Integration with Terraform`,
      content: `**Pattern: Terraform creates → Ansible configures**

**1. Terraform output → Ansible inventory:**
\`\`\`hcl
# outputs.tf
output "web_server_ip" {
  value = aws_instance.web.public_ip
}
\`\`\`

\`\`\`bash
# After terraform apply
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
      title: `Ansible best practices`,
      content: `**1. Project structure:**
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

**2. Idempotency** — prefer modules over shell/command when possible.

**3. Naming** — every task with \`name:\` (readable output).

**4. Tags** — for selective runs:
\`\`\`yaml
- name: Install nginx
  apt: name=nginx
  tags: [packages, nginx]
\`\`\`
\`\`\`bash
ansible-playbook site.yml --tags nginx
\`\`\`

**5. Vault** — all secrets encrypted.

**6. Linting:**
\`\`\`bash
pip install ansible-lint
ansible-lint playbooks/site.yml
\`\`\`

**7. Testing:**
- **Molecule** — role testing (Docker/VM)
- **ansible-check** — dry-run before apply

**8. Versioning** — Ansible code in Git, code review via PR.`,
    },
  ],
  practice: [
    `Install Ansible, create an inventory with 2 groups (webservers, databases) and verify ping`,
    `Write a playbook to install nginx, create an HTML page, and configure systemd`,
    `Add a Jinja2 template for nginx.conf with port and server_name variables`,
    `Create an nginx role with tasks, handlers, and templates and use it in a playbook`,
    `Encrypt db_password with ansible-vault and use it in a playbook`,
    `Set up handlers: config change → reload nginx (verify restart happens once)`,
    `Launch EC2 with Terraform, configure AWS EC2 dynamic inventory, run a playbook`,
    `Write a full web-stack playbook: ufw + nginx + Node.js app + systemd unit`,
    `Install ansible-lint and fix all warnings in playbooks`,
    `Integrate Ansible into GitHub Actions: terraform apply → ansible-playbook`,
  ],
  resources: [
    { title: `Ansible Docs`, url: `https://docs.ansible.com` },
    { title: `Ansible Galaxy`, url: `https://galaxy.ansible.com` },
  ],
  quiz: [
    {
      question: `Which port does Ansible use by default to connect to Linux hosts?`,
      options: [
        `22 (SSH)`,
        `80`,
        `443`,
        `2375`,
      ],
      answer: `22 (SSH)`,
    },
    {
      question: `How does a playbook differ from an ad-hoc command?`,
      answer: `A playbook is a declarative YAML scenario with roles and idempotent tasks; ad-hoc is a one-off command.`,
    },
    {
      question: `What is inventory?`,
      options: [
        `A list of hosts and groups to manage`,
        `A Docker registry`,
        `A Terraform state file`,
        `Helm values`,
      ],
      answer: `A list of hosts and groups to manage`,
    },
    {
      question: `Why use roles in Ansible?`,
      options: [
        `A reusable structure for tasks, vars, and templates`,
        `Windows only`,
        `A replacement for Kubernetes RBAC`,
        `Storing binary images`,
      ],
      answer: `A reusable structure for tasks, vars, and templates`,
    },
    {
      question: `What does idempotency mean in Ansible?`,
      answer: `Re-running converges the system to the desired state without unnecessary changes.`,
    },
    {
      question: `How do you pass variables when running a playbook?`,
      options: [
        `-e / --extra-vars or vars_files in the playbook`,
        `Only by editing /etc/hosts`,
        `Via docker run -e`,
        `You cannot override them`,
      ],
      answer: `-e / --extra-vars or vars_files in the playbook`,
    },
  ],
}

export default translation
