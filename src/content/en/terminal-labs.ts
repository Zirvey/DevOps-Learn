import type { TerminalLab } from '../../types'

/**
 * English overlays for labs that live in `src/content/terminal-labs.ts`.
 * linux / git already ship EN labs inside their chapter translations.
 */
export const enTerminalLabsBySlug: Record<string, TerminalLab> = {
  docker: {
    id: 'docker-basics',
    title: 'Basic Docker commands',
    intro:
      'Docker syntax trainer: images and containers are not created on a real host, but commands are checked the same way as on a machine with Docker Engine installed.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/project',
    initialOutput: [
      'Welcome to the Docker trainer.',
      'Walk the loop: version → pull → images → run → ps → logs.',
    ],
    steps: [
      {
        id: 'docker-version',
        instruction: 'Check the Docker CLI version.',
        match: { kind: 'normalized' },
        accept: ['docker --version'],
        hint: 'docker --version — quick check that the client is installed and on PATH.',
        explanation:
          'Before working with containers, make sure docker responds. On Linux you often need the docker group or sudo; on macOS/Windows — Docker Desktop running.',
        fakeOutput: ['Docker version 27.3.1, build ce12230'],
      },
      {
        id: 'docker-pull',
        instruction: 'Pull the nginx:alpine image from Docker Hub.',
        match: { kind: 'normalized' },
        accept: ['docker pull nginx:alpine'],
        hint: 'docker pull <repository>:<tag> — download image layers locally.',
        explanation:
          'pull downloads the manifest and layers. The alpine tag is a small Alpine Linux-based image; in prod you often pin a digest (@sha256:...).',
        fakeOutput: [
          'alpine: Pulling from library/nginx',
          'Digest: sha256:abc123def456...',
          'Status: Downloaded newer image for nginx:alpine',
          'docker.io/library/nginx:alpine',
        ],
      },
      {
        id: 'docker-images',
        instruction: 'List local images.',
        match: { kind: 'normalized' },
        accept: ['docker images'],
        hint: 'docker images (or docker image ls) — REPOSITORY, TAG, IMAGE ID, SIZE.',
        explanation:
          'The image list shows what is already cached. Remove with docker rmi; clean dangling images with docker image prune.',
        fakeOutput: [
          'REPOSITORY   TAG       IMAGE ID       CREATED        SIZE',
          'nginx        alpine    4a86014ec699   2 weeks ago    52.5MB',
        ],
      },
      {
        id: 'docker-run',
        instruction:
          'Run an nginx:alpine container in the background named web with port 8080→80 (--rm -d).',
        match: { kind: 'normalized' },
        accept: ['docker run --rm -d --name web -p 8080:80 nginx:alpine'],
        hint: '-d — detached, --name web — name for logs/ps, -p 8080:80 — host:container.',
        explanation:
          'run creates a container from an image. --rm removes the container after stop. -p publishes the service on localhost:8080.',
        fakeOutput: ['a1b2c3d4e5f6789012345678901234567890abcd'],
      },
      {
        id: 'docker-ps',
        instruction: 'List running containers.',
        match: { kind: 'normalized' },
        accept: ['docker ps'],
        hint: 'docker ps — running only; docker ps -a — including stopped.',
        explanation:
          'ps shows CONTAINER ID, IMAGE, PORTS, NAMES. To stop: docker stop web.',
        fakeOutput: [
          'CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                  NAMES',
          'a1b2c3d4e5f6   nginx:alpine   "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds   0.0.0.0:8080->80/tcp   web',
        ],
      },
      {
        id: 'docker-logs',
        instruction: 'Print logs for the web container.',
        match: { kind: 'normalized' },
        accept: ['docker logs web'],
        hint: 'docker logs <name|-f to follow> — stdout/stderr of PID 1 in the container.',
        explanation:
          'Container logs are the first place to look for 502/healthcheck failures. -f helps while debugging; --tail 50 limits output.',
        fakeOutput: [
          '/docker-entrypoint.sh: Configuration complete; ready for start up',
          '2026/07/17 10:05:01 [notice] 1#1: start worker processes',
        ],
      },
    ],
  },

  'docker-compose': {
    id: 'docker-compose-basics',
    title: 'Docker Compose in the terminal',
    intro:
      'Multi-container app trainer: Compose V2 (docker compose) and classic docker-compose syntax are both accepted.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/compose',
    initialOutput: [
      'The directory contains docker-compose.yml with a web service.',
      'Bring the stack up, check status, view logs, then tear it down.',
    ],
    steps: [
      {
        id: 'compose-version',
        instruction: 'Check the Compose version (docker compose or docker-compose).',
        match: {
          kind: 'anyOf',
          items: [
            { match: { kind: 'normalized' }, accept: ['docker compose version'] },
            { match: { kind: 'normalized' }, accept: ['docker-compose --version'] },
          ],
        },
        accept: [],
        hint: 'Compose V2: docker compose version. Legacy binary: docker-compose --version.',
        explanation:
          'Docker Desktop and modern Engine ship compose as a docker subcommand. Standalone docker-compose still appears in CI and on legacy hosts.',
        fakeOutput: ['Docker Compose version v2.29.7'],
      },
      {
        id: 'compose-up',
        instruction: 'Start services in the background: docker compose up -d.',
        match: { kind: 'normalized' },
        accept: ['docker compose up -d'],
        hint: 'up -d — detached; without -d, all service logs stream to the current terminal.',
        explanation:
          'up reads the compose file and creates networks/volumes/containers. --build rebuilds images; --force-recreate recreates containers.',
        fakeOutput: [
          '[+] Running 2/2',
          ' ✔ Network compose_default  Created',
          ' ✔ Container compose-web-1  Started',
        ],
      },
      {
        id: 'compose-ps',
        instruction: 'Show Compose service status.',
        match: { kind: 'normalized' },
        accept: ['docker compose ps'],
        hint: 'docker compose ps — like docker ps, but only for the project in the current directory.',
        explanation:
          'ps is useful after up: NAME, SERVICE, STATUS, PORTS. Default project name is the directory name.',
        fakeOutput: [
          'NAME            IMAGE          COMMAND                  SERVICE   CREATED         STATUS         PORTS',
          'compose-web-1   nginx:alpine   "/docker-entrypoint.…"   web       10 seconds ago  Up 9 seconds   0.0.0.0:8080->80/tcp',
        ],
      },
      {
        id: 'compose-logs',
        instruction:
          'View logs for the web service (docker compose logs -f web or docker compose logs web).',
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
        hint: 'logs web — one-shot; -f — follow, like tail -f.',
        explanation:
          'Logs are aggregated per service from the compose file. For several services: docker compose logs -f web api.',
        fakeOutput: [
          'web-1  | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh',
          'web-1  | 2026/07/17 10:10:00 [notice] 1#1: start worker process 30',
        ],
      },
      {
        id: 'compose-down',
        instruction: 'Stop and remove project containers: docker compose down.',
        match: { kind: 'normalized' },
        accept: ['docker compose down'],
        hint: 'down — stop + rm containers; -v also removes named volumes.',
        explanation:
          'down frees ports and the project network. On shared dev machines only use -v when the data is disposable.',
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
    title: 'kubectl: first steps',
    intro:
      'kubectl trainer: we do not touch a real cluster, but you practice a typical deploy loop — from overview to logs/describe.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/k8s',
    initialOutput: [
      'Context: training cluster, default namespace.',
      'The directory has deployment.yaml for nginx.',
    ],
    steps: [
      {
        id: 'kubectl-nodes',
        instruction: 'List cluster nodes: kubectl get nodes.',
        match: { kind: 'normalized' },
        accept: ['kubectl get nodes'],
        hint: 'get nodes — STATUS Ready means kubelet is responding.',
        explanation:
          'First sanity check after kubeconfig setup. NotReady often points to CNI, disk, or certificates.',
        fakeOutput: [
          'NAME           STATUS   ROLES           AGE   VERSION',
          'node-pool-1    Ready    control-plane   30d   v1.30.2',
          'node-pool-2    Ready    <none>          30d   v1.30.2',
        ],
      },
      {
        id: 'kubectl-pods-all',
        instruction: 'List pods in all namespaces: kubectl get pods -A.',
        match: { kind: 'normalized' },
        accept: ['kubectl get pods -A'],
        hint: '-A (--all-namespaces) — system pods in kube-system, ingress, etc.',
        explanation:
          'Cluster-wide overview: look for CrashLoopBackOff, Pending, ImagePullBackOff. Without -A you only see the current context namespace.',
        fakeOutput: [
          'NAMESPACE     NAME                              READY   STATUS    RESTARTS   AGE',
          'kube-system   coredns-7c94789d5-xxxxx           1/1     Running   0          30d',
          'kube-system   kube-proxy-abcde                  1/1     Running   0          30d',
          'default       web-6d4b8c9f7-xxxxx               1/1     Running   0          2d',
        ],
      },
      {
        id: 'kubectl-apply',
        instruction: 'Apply the deployment.yaml manifest: kubectl apply -f deployment.yaml.',
        match: { kind: 'normalized' },
        accept: ['kubectl apply -f deployment.yaml'],
        hint: 'apply -f — declarative create/update of resources from a file.',
        explanation:
          'apply compares desired state with the live object. create/run are imperative one-shots; GitOps relies on apply.',
        fakeOutput: [
          'deployment.apps/web created',
          'service/web unchanged',
        ],
      },
      {
        id: 'kubectl-get-pods',
        instruction: 'Check pods in the current namespace: kubectl get pods.',
        match: { kind: 'normalized' },
        accept: ['kubectl get pods'],
        hint: 'get pods — add -o wide for NODE/IP or -w to watch.',
        explanation:
          'After apply wait for Running and READY 1/1. If Pending, check events: kubectl describe pod ...',
        fakeOutput: [
          'NAME                   READY   STATUS    RESTARTS   AGE',
          'web-7f9c6d8b5-abcde    1/1     Running   0          12s',
        ],
      },
      {
        id: 'kubectl-describe',
        instruction:
          'Describe a pod (kubectl describe pod <name>) — the describe pod prefix is enough.',
        match: { kind: 'prefix' },
        accept: ['kubectl describe pod'],
        hint: 'describe pod <name> — Events at the bottom often explain OOM, probe failures, scheduling.',
        explanation:
          'describe shows labels, conditions, volumes, and Events from the scheduler/kubelet. Take the pod name from get pods.',
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
        instruction: 'Fetch pod logs: kubectl logs ... (pod name from get pods).',
        match: { kind: 'prefix' },
        accept: ['kubectl logs'],
        hint: 'kubectl logs <pod> — for a Deployment use -l app=web or a specific pod name.',
        explanation:
          'logs reads container stdout. -c selects a container in a multi-container pod; --previous — logs from the crashed instance.',
        fakeOutput: [
          '/docker-entrypoint.sh: Configuration complete; ready for start up',
          '127.0.0.1 - - [17/Jul/2026:10:15:01 +0000] "GET / HTTP/1.1" 200 615',
        ],
      },
    ],
  },

  bash: {
    id: 'bash-basics',
    title: 'Bash: scripts and environment',
    intro:
      'Mini shell lab: echo, file permissions, running a script, and extending PATH — without real execution on the host.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~',
    initialOutput: [
      'Home directory contains script.sh.',
      'Practice the basic prepare-and-run loop for a shell script.',
    ],
    steps: [
      {
        id: 'echo-hello',
        instruction: 'Print the string hello: echo "hello".',
        match: { kind: 'normalized' },
        accept: ['echo "hello"'],
        hint: 'Quotes keep the string as one argument; without them echo still works for a single word.',
        explanation:
          'echo is a simple check that the shell is alive. In scripts prefer printf for portable formatting.',
        fakeOutput: ['hello'],
      },
      {
        id: 'which-bash',
        instruction: 'Find the bash interpreter path: which bash.',
        match: { kind: 'normalized' },
        accept: ['which bash'],
        hint: 'which searches $PATH for an executable; on Linux often /usr/bin/bash.',
        explanation:
          'Shebang #!/usr/bin/env bash is more portable than a hard-coded path. which helps verify bash is available in non-interactive SSH.',
        fakeOutput: ['/usr/bin/bash'],
      },
      {
        id: 'chmod-script',
        instruction: 'Make script.sh executable: chmod +x script.sh.',
        match: { kind: 'normalized' },
        accept: ['chmod +x script.sh'],
        hint: '+x adds the execute bit; alternative — chmod 755 script.sh.',
        explanation:
          'Without +x, ./script.sh gives Permission denied. Check with ls -l script.sh.',
        fakeOutput: [''],
      },
      {
        id: 'run-script',
        instruction: 'Run the script from the current directory: ./script.sh.',
        match: { kind: 'normalized' },
        accept: ['./script.sh'],
        hint: './ — explicit path; the current directory is usually not on PATH for security.',
        explanation:
          'Relative execution needs the execute bit. For debugging: bash -x ./script.sh shows a trace.',
        fakeOutput: [
          'Deploy starting...',
          'OK: nginx config valid',
        ],
      },
      {
        id: 'export-path',
        instruction:
          'Add /opt/bin to PATH for this session: export PATH=$PATH:/opt/bin.',
        match: { kind: 'normalized' },
        accept: ['export PATH=$PATH:/opt/bin'],
        hint: 'export makes the variable visible to child processes; $PATH is the existing search list.',
        explanation:
          'PATH changes in the shell are temporary. Persist via ~/.bashrc or /etc/profile.d/. Avoid duplicating the path on every export.',
        fakeOutput: [''],
      },
    ],
  },

  ssh: {
    id: 'ssh-basics',
    title: 'SSH: keys, access, and tunnels',
    intro:
      'OpenSSH syntax trainer: keys, copy to server, session, scp, and local port forwarding — commands do not go to the network.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~',
    initialOutput: [
      'Training server: user@server (stub in the trainer).',
      'Generate a key, set up access, then practice scp/tunnel.',
    ],
    steps: [
      {
        id: 'ssh-keygen',
        instruction:
          'Generate an Ed25519 key with a comment: ssh-keygen -t ed25519 -C "devops@lab".',
        match: { kind: 'normalized' },
        accept: ['ssh-keygen -t ed25519 -C "devops@lab"'],
        hint: '-t ed25519 — modern algorithm; -C — label at the end of .pub for audit.',
        explanation:
          'Keys default to ~/.ssh/id_ed25519. Set a passphrase to protect against file theft; ssh-agent holds the unlocked key for the session.',
        fakeOutput: [
          'Generating public/private ed25519 key pair.',
          'Your identification has been saved in /home/student/.ssh/id_ed25519',
          'Your public key has been saved in /home/student/.ssh/id_ed25519.pub',
        ],
      },
      {
        id: 'ssh-copy-id',
        instruction:
          'Copy the public key to the server: ssh-copy-id user@server (or equivalent via ssh user@server).',
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
        hint: 'ssh-copy-id appends the key to ~/.ssh/authorized_keys on the remote machine.',
        explanation:
          'After copy-id you can disable password login (PasswordAuthentication no). Check permissions: ~/.ssh 700, authorized_keys 600.',
        fakeOutput: [
          'Number of key(s) added: 1',
          'Now try logging into the machine, with:   ssh user@server',
        ],
      },
      {
        id: 'ssh-login',
        instruction: 'Connect over SSH: ssh user@server.',
        match: { kind: 'normalized' },
        accept: ['ssh user@server'],
        hint: 'user@host — optionally -p port, -i key path, -J jump-host for a bastion.',
        explanation:
          'First connect asks for the host key fingerprint — verify out-of-band. ~/.ssh/config shortens long commands.',
        fakeOutput: [
          'Welcome to Ubuntu 22.04 LTS (GNU/Linux 5.15 x86_64)',
          'Last login: Fri Jul 17 10:00:00 2026 from 203.0.113.10',
        ],
      },
      {
        id: 'scp-file',
        instruction: 'Copy file.txt to the server: scp file.txt user@server:/tmp/.',
        match: { kind: 'normalized' },
        accept: ['scp file.txt user@server:/tmp/'],
        hint: 'scp uses the same SSH transport; -r for directories.',
        explanation:
          'For large trees rsync -avz is often faster. scp is handy for single files and exam-style tasks.',
        fakeOutput: ['file.txt                    100%  4KB   1.2MB/s   00:00'],
      },
      {
        id: 'ssh-tunnel',
        instruction:
          'Open a local forward: ssh -L 8080:localhost:80 user@server.',
        match: { kind: 'normalized' },
        accept: ['ssh -L 8080:localhost:80 user@server'],
        hint: '-L localPort:targetHost:targetPort — localhost on the server is often nginx on :80.',
        explanation:
          'Local forwarding tunnels a port over SSH: curl localhost:8080 on your laptop → service on server:80. -N without a shell, -f in the background.',
        fakeOutput: [
          'bind [127.0.0.1]:8080: Address already in use',
          '(in the training output the tunnel is up; open http://127.0.0.1:8080 locally)',
        ],
      },
    ],
  },

  nginx: {
    id: 'nginx-basics',
    title: 'Nginx: check and operate',
    intro:
      'nginx admin commands on Linux with systemd: config test, reload, vhosts, HTTP check, and the service journal.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '/etc/nginx',
    initialOutput: [
      'nginx is installed; configs live under /etc/nginx.',
      'Test syntax, reload without downtime, and confirm the site answers.',
    ],
    steps: [
      {
        id: 'nginx-test',
        instruction: 'Test the configuration: nginx -t.',
        match: { kind: 'normalized' },
        accept: ['nginx -t'],
        hint: 'nginx -t — test; on systemd often sudo nginx -t as root.',
        explanation:
          'Always -t before reload/restart. A bad include or SSL cert stops reload and leaves the old worker pool.',
        fakeOutput: [
          'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok',
          'nginx: configuration file /etc/nginx/nginx.conf test is successful',
        ],
      },
      {
        id: 'nginx-reload',
        instruction: 'Apply config without a full stop: systemctl reload nginx.',
        match: { kind: 'normalized' },
        accept: ['systemctl reload nginx'],
        hint: 'reload sends HUP to the master; restart drops connections.',
        explanation:
          'reload picks up new server{} and upstream blocks. On a fatal error after edits, revert the config and run nginx -t again.',
        fakeOutput: [''],
      },
      {
        id: 'nginx-sites-enabled',
        instruction: 'List enabled sites: ls /etc/nginx/sites-enabled.',
        match: { kind: 'normalized' },
        accept: ['ls /etc/nginx/sites-enabled'],
        hint: 'On Debian/Ubuntu sites-enabled are symlinks into sites-available.',
        explanation:
          'Each file is a server block. Disable: rm the symlink + reload. On RHEL configs often live in /etc/nginx/conf.d/*.conf.',
        fakeOutput: [
          'default -> /etc/nginx/sites-available/default',
          'app.conf -> /etc/nginx/sites-available/app.conf',
        ],
      },
      {
        id: 'curl-localhost',
        instruction: 'Check response headers: curl -I http://localhost.',
        match: { kind: 'normalized' },
        accept: ['curl -I http://localhost'],
        hint: '-I — headers only (HEAD); -v for verbose TLS/redirect.',
        explanation:
          'Expect HTTP/1.1 200 or 301. 502 often means a dead upstream; check error.log and systemctl status nginx.',
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
          'Show recent nginx journal lines (journalctl -u nginx -n 50 or -n 20).',
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
        hint: 'journalctl -u nginx — unit logs; -n limits lines, -f follows.',
        explanation:
          'systemd aggregates the service stdout/stderr. Also check /var/log/nginx/access.log and error.log for HTTP detail.',
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
      'HashiCorp Terraform trainer: CLI lifecycle for infrastructure as code — state does not change; only syntax is checked.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/infra',
    initialOutput: [
      '~/infra contains main.tf for a training resource.',
      'Walk the full loop: version, init, plan, apply, state list, destroy.',
    ],
    steps: [
      {
        id: 'terraform-version',
        instruction: 'Check the Terraform version: terraform version.',
        match: { kind: 'normalized' },
        accept: ['terraform version'],
        hint: 'version shows the CLI and optional lock file constraints.',
        explanation:
          'CI pins the version via tfenv, asdf, or hashicorp/setup-terraform. Version skew breaks state format and provider protocol.',
        fakeOutput: [
          'Terraform v1.9.5',
          'on darwin_arm64',
        ],
      },
      {
        id: 'terraform-init',
        instruction: 'Initialize the working directory: terraform init.',
        match: { kind: 'normalized' },
        accept: ['terraform init'],
        hint: 'init downloads providers and configures the backend (local/S3/GCS...).',
        explanation:
          'After adding a provider or changing the backend, run terraform init again. -upgrade refreshes provider versions in the lock file.',
        fakeOutput: [
          'Initializing the backend...',
          'Initializing provider plugins...',
          'Terraform has been successfully initialized!',
        ],
      },
      {
        id: 'terraform-plan',
        instruction: 'Build a change plan: terraform plan.',
        match: { kind: 'normalized' },
        accept: ['terraform plan'],
        hint: 'plan — dry-run: + create, ~ update, - destroy in the output.',
        explanation:
          'CI often saves plan as an artifact (terraform plan -out=tfplan) for an audited apply. -var and -var-file supply variables.',
        fakeOutput: [
          'Plan: 1 to add, 0 to change, 0 to destroy.',
          '  # aws_instance.web will be created',
        ],
      },
      {
        id: 'terraform-apply',
        instruction:
          'Apply changes non-interactively: terraform apply -auto-approve.',
        match: { kind: 'normalized' },
        accept: ['terraform apply -auto-approve'],
        hint: 'In prod avoid -auto-approve without reviewing the plan; in lab it is fine.',
        explanation:
          'apply writes state. On drift between state and reality — terraform refresh (legacy) or a plan/apply cycle.',
        fakeOutput: [
          'Apply complete! Resources: 1 added, 0 changed, 0 destroyed.',
          'Outputs:',
          '  public_ip = "203.0.113.50"',
        ],
      },
      {
        id: 'terraform-state-list',
        instruction: 'List resources in state: terraform state list.',
        match: { kind: 'normalized' },
        accept: ['terraform state list'],
        hint: 'state list — resource addresses; state show <addr> — one resource’s attributes.',
        explanation:
          'State is Terraform’s source of truth. A remote backend (S3+DynamoDB) is needed for team work and locking.',
        fakeOutput: [
          'aws_instance.web',
          'aws_security_group.web_sg',
        ],
      },
      {
        id: 'terraform-destroy',
        instruction:
          'Destroy infrastructure from the config: terraform destroy -auto-approve.',
        match: { kind: 'normalized' },
        accept: ['terraform destroy -auto-approve'],
        hint: 'destroy — reverse of apply; -target for partial destroy.',
        explanation:
          'After destroy, state is empty for removed resources. Protect prod with workspace separation, IAM, and manual approval gates.',
        fakeOutput: ['Destroy complete! Resources: 2 destroyed.'],
      },
    ],
  },

  ansible: {
    id: 'ansible-basics',
    title: 'Ansible: ping → playbook check',
    intro:
      'Ansible CLI trainer: inventory and playbooks do not touch real hosts — only the syntax of a typical admin loop is checked.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/ansible',
    initialOutput: [
      '~/ansible has inventory, site.yml, and ansible.cfg.',
      'Walk the loop: version → ping → playbook --check → galaxy collections.',
    ],
    steps: [
      {
        id: 'ansible-version',
        instruction: 'Check the Ansible version: ansible --version.',
        match: { kind: 'normalized' },
        accept: ['ansible --version'],
        hint: 'ansible --version — CLI, Python, and path to ansible.cfg.',
        explanation:
          'Core and collection versions matter for modules. CI pins ansible-core via pip/requirements or the distro package.',
        fakeOutput: [
          'ansible [core 2.16.8]',
          '  config file = /home/student/ansible/ansible.cfg',
          '  configured module search path = [\'/home/student/.ansible/plugins/modules\']',
          '  python version = 3.12.3',
        ],
      },
      {
        id: 'ansible-ping',
        instruction: 'Check connectivity to all hosts with ping: ansible all -m ping.',
        match: { kind: 'normalized' },
        accept: ['ansible all -m ping'],
        hint: 'all — group from inventory; -m ping — built-in connectivity module.',
        explanation:
          'SSH ping confirms keys, user, and Python on targets. FAILURE often means host_key_checking or wrong ansible_user.',
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
          'Run the playbook in dry-run: ansible-playbook site.yml --check.',
        match: { kind: 'normalized' },
        accept: ['ansible-playbook site.yml --check'],
        hint: '--check — check mode (not all modules support it); without it changes apply.',
        explanation:
          'Check mode shows what would change. Add --diff for a full diff. Idempotent tasks should not report changed on a second run.',
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
          'Limit the playbook to group web: ansible-playbook site.yml --limit web.',
        match: { kind: 'normalized' },
        accept: ['ansible-playbook site.yml --limit web'],
        hint: '--limit takes a host/group from inventory; e.g. web1 or web:&prod.',
        explanation:
          'limit shrinks blast radius for staged rollouts. CI often pairs it with --check and tag filters (--tags).',
        fakeOutput: [
          'PLAY [Configure web servers] ***************************************************',
          'PLAY RECAP *********************************************************************',
          'web1                       : ok=3    changed=0    unreachable=0    failed=0',
        ],
      },
      {
        id: 'ansible-galaxy-list',
        instruction: 'List installed collections: ansible-galaxy collection list.',
        match: { kind: 'normalized' },
        accept: ['ansible-galaxy collection list'],
        hint: 'galaxy collection list — community.general, amazon.aws, and install paths.',
        explanation:
          'Install collections with ansible-galaxy collection install -r requirements.yml. Pin versions in requirements for reproducibility.',
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
      'Helm 3 trainer: charts target a training kubectl context — the real cluster is unchanged; only CLI syntax is checked.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/charts',
    initialOutput: [
      'kubeconfig points at a training cluster.',
      'Add the Bitnami repo, search nginx, install a release, list it, then uninstall.',
    ],
    steps: [
      {
        id: 'helm-version',
        instruction: 'Check the Helm version: helm version.',
        match: { kind: 'normalized' },
        accept: ['helm version'],
        hint: 'helm version — client v3; Helm 3 needs no server-side tiller.',
        explanation:
          'Helm 3 stores release secrets/configmaps in the namespace. Pin the CLI version in CI so templating stays consistent.',
        fakeOutput: [
          'version.BuildInfo{Version:"v3.15.3", GitCommit:"...", GoVersion:"go1.22.5"}',
        ],
      },
      {
        id: 'helm-repo-add',
        instruction:
          'Add the Bitnami repository: helm repo add bitnami https://charts.bitnami.com/bitnami.',
        match: { kind: 'normalized' },
        accept: ['helm repo add bitnami https://charts.bitnami.com/bitnami'],
        hint: 'repo add <name> <URL> — then usually helm repo update.',
        explanation:
          'The name bitnami becomes the chart prefix (bitnami/nginx). List repos with helm repo list; refresh indexes with helm repo update.',
        fakeOutput: ['"bitnami" has been added to your repositories'],
      },
      {
        id: 'helm-search',
        instruction: 'Search repos for nginx: helm search repo nginx.',
        match: { kind: 'normalized' },
        accept: ['helm search repo nginx'],
        hint: 'search repo <keyword> queries the local index after repo add/update.',
        explanation:
          'Output shows CHART VERSION and APP VERSION. Exact chart: bitnami/nginx. For OCI registries use helm pull oci://...',
        fakeOutput: [
          'NAME                    CHART VERSION   APP VERSION     DESCRIPTION',
          'bitnami/nginx           18.2.0          1.27.0          NGINX Open Source...',
        ],
      },
      {
        id: 'helm-install',
        instruction:
          'Install release my-nginx from bitnami/nginx: helm install my-nginx bitnami/nginx.',
        match: { kind: 'normalized' },
        accept: ['helm install my-nginx bitnami/nginx'],
        hint: 'install <release> <chart> — default namespace from kubeconfig; -n selects another.',
        explanation:
          'install creates Deployment/Service and records the release. values: -f values.yaml or --set. Upgrade: helm upgrade my-nginx bitnami/nginx.',
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
        instruction: 'List installed releases: helm list.',
        match: { kind: 'normalized' },
        accept: ['helm list'],
        hint: 'list (ls) — NAME, NAMESPACE, REVISION, STATUS; -A for all namespaces.',
        explanation:
          'After install STATUS should be deployed. Failed/pending-install — check kubectl get events and helm status my-nginx.',
        fakeOutput: [
          'NAME      NAMESPACE  REVISION  UPDATED                   STATUS    CHART          APP VERSION',
          'my-nginx  default    1         2026-07-17 10:30:00       deployed  nginx-18.2.0   1.27.0',
        ],
      },
      {
        id: 'helm-uninstall',
        instruction: 'Remove release my-nginx: helm uninstall my-nginx.',
        match: { kind: 'normalized' },
        accept: ['helm uninstall my-nginx'],
        hint: 'uninstall (delete) removes release resources; --keep-history keeps history.',
        explanation:
          'uninstall removes chart manifests. PV/PVC with Retain reclaim policy may remain — check kubectl get pvc.',
        fakeOutput: ['release "my-nginx" uninstalled'],
      },
    ],
  },

  'github-actions': {
    id: 'github-actions-basics',
    title: 'GitHub Actions: workflows and runs',
    intro:
      'GitHub CLI trainer for Actions: local .github/workflows and gh commands — no real GitHub API calls, syntax only.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/project',
    initialOutput: [
      'The repo contains .github/workflows/ci.yml.',
      'Inspect workflows, recent runs, and the CI file contents.',
    ],
    steps: [
      {
        id: 'ls-workflows',
        instruction: 'List workflow files: ls .github/workflows.',
        match: { kind: 'normalized' },
        accept: ['ls .github/workflows'],
        hint: '.github/workflows holds YAML files: ci.yml, deploy.yml, etc.',
        explanation:
          'Each .yml/.yaml is a workflow. The filename need not match the inner name:; GitHub indexes both.',
        fakeOutput: ['ci.yml  deploy.yml'],
      },
      {
        id: 'gh-workflow-list',
        instruction: 'List workflows with gh: gh workflow list.',
        match: { kind: 'normalized' },
        accept: ['gh workflow list'],
        hint: 'Needs gh auth login; list shows NAME, STATE (active), ID.',
        explanation:
          'gh workflow list reads workflows for the current remote repo. disable/enable toggle STATE without deleting the file.',
        fakeOutput: [
          'NAME  STATE   ID',
          'CI    active  12345678',
          'Deploy  active  87654321',
        ],
      },
      {
        id: 'gh-run-list',
        instruction: 'Show recent runs: gh run list.',
        match: { kind: 'normalized' },
        accept: ['gh run list'],
        hint: 'run list — STATUS, TITLE, WORKFLOW, BRANCH; --limit 5 narrows output.',
        explanation:
          'Runs appear after push/PR. Details: gh run view <id>; logs: gh run view <id> --log. Rerun: gh run rerun <id>.',
        fakeOutput: [
          'completed  success  CI  CI  main  push  99887766  2m12s  2026-07-17T10:00:00Z',
          'completed  failure  CI  CI  feature/x  push  99887755  1m03s  2026-07-17T09:40:00Z',
        ],
      },
      {
        id: 'cat-ci-yml',
        instruction: 'Open the CI workflow: cat .github/workflows/ci.yml.',
        match: { kind: 'normalized' },
        accept: ['cat .github/workflows/ci.yml'],
        hint: 'Inside — on:, jobs:, steps: with uses:/run: — the core of Actions YAML.',
        explanation:
          'Read triggers (push/pull_request), runners (runs-on), and steps. Secrets use ${{ secrets.* }}; never commit plaintext tokens.',
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
          'Check CLI auth or a local runner: gh auth status (or act --list).',
        match: {
          kind: 'anyOf',
          items: [
            { match: { kind: 'normalized' }, accept: ['gh auth status'] },
            { match: { kind: 'normalized' }, accept: ['act --list'] },
          ],
        },
        accept: [],
        hint: 'gh auth status — token/scopes; act --list — local workflow runs via Docker (nektos/act).',
        explanation:
          'Without auth, gh workflow/run cannot hit the API. act is useful for a quick local YAML check before push.',
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
      'AWS CLI v2 trainer: credentials do not leave for the cloud — practice syntax of typical read-only commands.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~',
    initialOutput: [
      'default profile is configured (training stub).',
      'Check identity, then S3, EC2, and the EKS cluster list.',
    ],
    steps: [
      {
        id: 'aws-sts-identity',
        instruction:
          'See which principal you are: aws sts get-caller-identity.',
        match: { kind: 'normalized' },
        accept: ['aws sts get-caller-identity'],
        hint: 'STS returns Account, Arn, UserId — first sanity check after aws configure.',
        explanation:
          'get-caller-identity needs little beyond sts:GetCallerIdentity. Bad keys/region show up immediately here.',
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
        instruction: 'List S3 buckets: aws s3 ls.',
        match: { kind: 'normalized' },
        accept: ['aws s3 ls'],
        hint: 's3 ls with no args — account buckets; aws s3 ls s3://bucket/ — objects.',
        explanation:
          'High-level s3 commands are handy in the shell. For IAM/policies people often use s3api. Permission: s3:ListAllMyBuckets.',
        fakeOutput: [
          '2026-01-10 12:00:00 app-artifacts-prod',
          '2026-03-02 09:15:00 terraform-state-lab',
        ],
      },
      {
        id: 'aws-ec2-describe',
        instruction: 'Describe EC2 instances: aws ec2 describe-instances.',
        match: { kind: 'normalized' },
        accept: ['aws ec2 describe-instances'],
        hint: 'describe-instances — JSON of all reservations; --query/--filters narrow output.',
        explanation:
          'In prod you almost always add --filters Name=instance-state-name,Values=running and --query for InstanceId/PrivateIpAddress.',
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
        instruction: 'List EKS clusters: aws eks list-clusters.',
        match: { kind: 'normalized' },
        accept: ['aws eks list-clusters'],
        hint: 'list-clusters — names in the current region; --region changes scope.',
        explanation:
          'Next: aws eks update-kubeconfig --name <cluster> writes kubeconfig. Permissions: eks:ListClusters / DescribeCluster.',
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
          'Confirm the CLI region: aws configure get region (or aws sts get-caller-identity --query Account --output text).',
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
        hint: 'configure get region reads ~/.aws/config; --query/--output text help in scripts.',
        explanation:
          'Region affects EC2/EKS/S3 endpoint behavior. CI sets AWS_REGION / AWS_DEFAULT_REGION explicitly.',
        fakeOutput: ['eu-central-1'],
      },
    ],
  },

  monitoring: {
    id: 'monitoring-basics',
    title: 'Monitoring: Prometheus health and query',
    intro:
      'Prometheus trainer: health endpoint, promtool config check, and Instant Query API — no real scrape, syntax only.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/monitoring',
    initialOutput: [
      'prometheus.yml is in the directory; Prometheus listens on localhost:9090 (stub).',
      'Check health, config validity, and the up metric.',
    ],
    steps: [
      {
        id: 'prom-healthy',
        instruction:
          'Check Prometheus health: curl localhost:9090/-/healthy.',
        match: { kind: 'normalized' },
        accept: ['curl localhost:9090/-/healthy'],
        hint: '/-/healthy — liveness; /-/ready — readiness for queries.',
        explanation:
          'Kubernetes probes hit these URLs. Prometheus Server is Healthy means the process answers HTTP.',
        fakeOutput: ['Prometheus Server is Healthy.'],
      },
      {
        id: 'promtool-check',
        instruction:
          'Validate the config: promtool check config prometheus.yml.',
        match: { kind: 'normalized' },
        accept: ['promtool check config prometheus.yml'],
        hint: 'promtool ships with Prometheus; check rules validates recording/alerting rules.',
        explanation:
          'Always validate config in CI before reload. A bad scrape_configs or file_sd breaks load on SIGHUP/-/reload.',
        fakeOutput: [
          'Checking prometheus.yml',
          '  SUCCESS: 1 rule files found',
        ],
      },
      {
        id: 'prom-query-up',
        instruction:
          'Run an Instant Query for up: curl localhost:9090/api/v1/query?query=up',
        match: { kind: 'normalized' },
        accept: ['curl localhost:9090/api/v1/query?query=up'],
        hint: 'API /api/v1/query?query=<PromQL>; in shell escape & or quote the URL.',
        explanation:
          'up == 1 means the target scrape succeeded. Grafana datasources hit the same HTTP API; encode complex queries.',
        fakeOutput: [
          '{"status":"success","data":{"resultType":"vector","result":[{"metric":{"__name__":"up","job":"prometheus","instance":"localhost:9090"},"value":[1721214000,"1"]}]}}',
        ],
      },
      {
        id: 'prom-targets-or-ready',
        instruction:
          'Check ready or the targets API: curl localhost:9090/-/ready (or curl localhost:9090/api/v1/targets).',
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
          'targets shows health/lastError per job. Empty active — bad scrape_configs or no network to exporters.',
        fakeOutput: ['Prometheus Server is Ready.'],
      },
      {
        id: 'kubectl-or-curl-metrics',
        instruction:
          'Pull metrics from node exporter / pods: curl localhost:9100/metrics (or kubectl get pods -n monitoring).',
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
        hint: '9100 — classic node_exporter; in k8s check the monitoring/observability namespace.',
        explanation:
          'Exporters speak plaintext exposition format. Prometheus scrape reads the same /metrics; in-cluster often ServiceMonitor/PodMonitor (Operator).',
        fakeOutput: [
          '# HELP node_cpu_seconds_total Seconds the CPUs spent in each mode.',
          '# TYPE node_cpu_seconds_total counter',
          'node_cpu_seconds_total{cpu="0",mode="idle"} 12345.67',
        ],
      },
    ],
  },
}
