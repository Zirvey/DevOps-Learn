import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Git: complete guide',
  duration: '6–8 hours',
  description:
    'Deep Git course for DevOps: data model, staging, branches, merge/rebase, conflicts, remotes, PRs, stash, reflog, tags, hooks, cherry-pick, bisect, and GitOps practices',
  sections: [
    {
      title: 'Why Git in DevOps',
      content: `**Git** is a distributed version control system and the **single source of truth** in modern engineering.

In DevOps, almost everything lives in Git:

| Artifact | Examples |
|----------|---------|
| Application code | Go, Python, Node, Java |
| Infrastructure as Code | Terraform, Pulumi, CloudFormation |
| Server configuration | Ansible, Chef, Puppet |
| Kubernetes / GitOps | manifests, Helm, Kustomize, Argo CD |
| CI/CD | \`.github/workflows\`, \`.gitlab-ci.yml\`, Jenkinsfile |
| Documentation | README, ADR, runbooks, postmortems |

**Why Git specifically, not SVN/Perforce:**
- Local history — you can work offline
- Cheap branching and merge
- Ecosystem: GitHub, GitLab, Bitbucket, Gitea
- Integration with every CI/CD and GitOps tool

> Rule: **if it is not in Git, it does not exist for automation.** Secrets go in a vault/secret manager, not in the repository.`,
    },
    {
      title: 'How Git works: snapshots and objects',
      content: `Git does not store “patches to files” — it stores **snapshots** of the entire tree at commit time.

**Objects in \`.git/objects\`:**

| Object | What it stores |
|--------|----------------|
| **blob** | File contents (without a name) |
| **tree** | Directory: name → blob or tree |
| **commit** | Pointer to a tree + parent(s) + author + message + timestamp |
| **tag** | Named reference to an object (usually a commit) |

Every object is identified by a **hash** (SHA-1, 40 hex characters; newer versions are moving to SHA-256).

**Three “zones” for a file:**

\`\`\`
Working Directory  →  Staging (Index)  →  Repository (.git)
   (modified)            (staged)              (committed)
\`\`\`

1. Edit a file → **modified**
2. \`git add\` → file goes into the **index** (snapshot for the next commit)
3. \`git commit\` → a new **commit** in history

**HEAD** is the pointer to “where you are now”: usually it points at the tip of a branch (\`refs/heads/main\`), less often at a specific commit (**detached HEAD**).`,
    },
    {
      title: 'Installation and initial setup',
      content: `Configure your identity **once** on the machine. Without \`user.name\` / \`user.email\`, commits will not be created (or will have junk metadata).

**Config levels:**
- \`--system\` — entire machine
- \`--global\` — user (\`~/.gitconfig\`)
- \`--local\` — this repository only (\`.git/config\`)`,
      codes: [
        {
          language: 'bash',
          caption: 'Basic configuration',
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
          caption: 'Useful aliases',
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
      title: 'Creating a repository and the first commit',
      content: `A **local repository** is a directory with a hidden \`.git/\` folder (object DB + refs + config).

Two paths:
1. \`git init\` — a new project from scratch
2. \`git clone\` — a copy of a remote repository + remote \`origin\``,
      codes: [
        {
          language: 'bash',
          caption: 'init and clone',
          code: `mkdir myproject && cd myproject
git init

# HTTPS (Personal Access Token вместо пароля)
git clone https://github.com/user/repo.git

# SSH (рекомендуется для ежедневной работы)
git clone git@github.com:user/repo.git mydir`,
        },
        {
          language: 'bash',
          caption: 'Basic workflow: add → commit → log',
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
      title: 'Staging area in detail',
      content: `The **index (staging)** is an intermediate snapshot. It lets you assemble a commit carefully: not everything from the working tree at once.

**Common scenarios:**
- Commit only some of the files
- Split a large change into logical commits
- Review the diff **before** committing`,
      codes: [
        {
          language: 'bash',
          caption: 'Working with staging',
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
      title: '.gitignore and secrets',
      content: `**Do not commit:** secrets, build artifacts, local IDE files, Terraform state.

If a secret already made it into history — deleting it from the latest commit is not enough: the hash remains in history. You need \`git filter-repo\` / BFG + **key rotation**.

Check a template on [gitignore.io](https://www.toptal.com/developers/gitignore).`,
      codes: [
        {
          language: 'gitignore',
          caption: 'Typical .gitignore for a DevOps project',
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
          caption: 'If the file is already tracked',
          code: `# Добавил в .gitignore, но файл уже в индексе:
git rm --cached secrets.env
git commit -m "chore: stop tracking secrets.env"`,
        },
      ],
    },
    {
      title: 'Viewing history and diffs',
      content: `Being able to read history is the foundation of code review, postmortems, and debugging “who broke prod.”`,
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
      title: 'Branches',
      content: `A **branch** is a lightweight pointer (\`refs/heads/...\`) to a commit. Creating a branch is nearly free.

**Why:**
- Isolate features and experiments
- Parallel work without locking
- Hotfix on \`main\` without stopping development

**Branching strategies:**

| Strategy | Idea | When |
|----------|------|------|
| **GitHub Flow** | \`main\` + short-lived feature + PR | Most product teams |
| **Trunk-Based** | Very short branches, frequent merge into trunk | High CI maturity, feature flags |
| **Git Flow** | main, develop, feature, release, hotfix | Scheduled releases, legacy |

DevOps teams more often use **GitHub Flow** or **trunk-based**: \`main\` is always deployable.`,
      codes: [
        {
          language: 'bash',
          caption: 'Creating and switching',
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
      content: `**Merge** joins histories. The result is either a **fast-forward** or a **merge commit** with two parents.

**Fast-forward:** \`main\` simply “catches up” to the feature tip — no divergence.

**3-way merge:** there is a common ancestor and diverging lines → a merge commit is created.

\`--no-ff\` always forces a merge commit — convenient for seeing the feature boundary in history.`,
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
      content: `**Rebase** moves commits onto a new base: “as if you started work from the current \`main\`.” History becomes linear.

| | merge | rebase |
|-|-------|--------|
| History | Preserves branching | Rewrites (new SHAs) |
| Graph | Merge commits | Linear |
| Shared branches | Safe | **Do not rebase public branches** |

**Golden rule:** do not rebase branches that other people have already \`pull\`'ed (after a force-push, colleagues' history will break).`,
      codes: [
        {
          language: 'bash',
          caption: 'Rebase feature onto main',
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
      title: 'Resolving conflicts',
      content: `A **conflict** means Git could not automatically merge the same lines.

Markers in the file:

\`\`\`
<<<<<<< HEAD
твоя версия (текущая ветка)
=======
их версия (входящая)
>>>>>>> feature-branch
\`\`\`

**Algorithm:**
1. Open the file, pick the right code or combine the logic
2. Remove all \`<<<<<<<\` / \`=======\` / \`>>>>>>>\` markers
3. \`git add <file>\`
4. \`git merge --continue\` or \`git rebase --continue\`
5. Run tests / lint

**Tools:** \`git mergetool\`, VS Code / Cursor merge editor, \`meld\`.

**Prevention:** small PRs, sync with \`main\` often, agree on file ownership.`,
    },
    {
      title: 'Remotes and synchronization',
      content: `A **remote** is a named reference to a remote repository (usually \`origin\`).

**Protocols:**
- **HTTPS** — Personal Access Token / credential helper
- **SSH** — key (\`~/.ssh/id_ed25519\`) — more convenient for daily work

\`git fetch\` — download objects and update remote-tracking branches (\`origin/main\`), **without** changing the working directory.

\`git pull\` = \`fetch\` + \`merge\` (or rebase, if configured that way).`,
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
      content: `A **PR (GitHub)** / **MR (GitLab)** is a merge request + code review + CI checks + discussion.

**Typical DevOps flow:**
1. \`git switch -c fix/pipeline-timeout\`
2. Changes + meaningful commits
3. \`git push -u origin fix/pipeline-timeout\`
4. Create a PR → description: *what / why / how to verify*
5. CI: lint, tests, \`terraform plan\`, security scan
6. Review → Approve → Merge (squash or merge commit — team policy)
7. Delete the branch

**Branch protection on \`main\`:**
- Require pull request
- Require status checks (CI green)
- Require review (1+)
- No direct push, no force-push

**A good PR:** small, one purpose, green CI, screenshots / Terraform plan in the comments.`,
    },
    {
      title: 'Stash: temporarily set work aside',
      content: `\`git stash\` saves uncommitted changes on a temporary stack — handy when you need to switch to a hotfix urgently.`,
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
      title: 'Undo and recovery',
      content: `Pick the command for the situation: **safe rollback** vs **rewriting history**.

| Command | Effect | When |
|---------|--------|------|
| \`git restore\` | Revert working / staged | Local edits before push |
| \`git revert\` | New commit that undoes an old one | Already in shared history |
| \`git reset --soft\` | Moves HEAD, keeps staged | Rewrite the last local commit |
| \`git reset --hard\` | Destroys uncommitted work | Only if you are sure |
| \`git reflog\` | Journal of HEAD movements | Recovering “lost” commits |`,
      codes: [
        {
          language: 'bash',
          caption: 'Safe and dangerous rollbacks',
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
      title: 'Tags and releases',
      content: `A **tag** is an immutable (in intent) label on a commit: a release version, a point for a Docker image \`app:1.2.0\`.

- **Lightweight** — just a name → commit
- **Annotated** — with author, date, message (**recommended** for releases)

Semantic Versioning: \`MAJOR.MINOR.PATCH\` (\`v1.4.2\`).`,
      codes: [
        {
          language: 'bash',
          caption: 'Tags',
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
      title: 'Cherry-pick and bisect',
      content: `**Cherry-pick** — move one specific commit onto the current branch (a hotfix from \`main\` into \`release/1.x\`).

**Bisect** — binary search for the commit that introduced a bug (between a “good” and a “bad” commit).`,
      codes: [
        {
          language: 'bash',
          caption: 'cherry-pick and bisect',
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
      title: 'Git hooks and pre-commit',
      content: `**Hooks** are scripts for Git events. Local hooks in \`.git/hooks/\` are **not committed**; teams use **pre-commit**, Husky, or lefthook.

**Useful points:**
- **pre-commit** — lint, format, gitleaks (secret scanning)
- **commit-msg** — conventional commits
- **pre-push** — unit tests / quick smoke

**Server-side** (GitHub/GitLab): branch protection + required status checks are more reliable than local hooks (those can be bypassed with \`--no-verify\`).`,
      codes: [
        {
          language: 'bash',
          caption: 'Primitive pre-commit example',
          code: `#!/bin/sh
# .git/hooks/pre-commit
if git diff --cached | grep -E 'AKIA[0-9A-Z]{16}'; then
  echo "ERROR: possible AWS key in staged changes"
  exit 1
fi`,
        },
        {
          language: 'yaml',
          caption: '.pre-commit-config.yaml (fragment)',
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
      content: `A message standard for readable history, changelogs, and semantic-release:

\`\`\`
type(scope): short description

optional body

optional footer (BREAKING CHANGE: ...)
\`\`\`

**Types:** \`feat\`, \`fix\`, \`docs\`, \`style\`, \`refactor\`, \`test\`, \`chore\`, \`ci\`, \`build\`, \`perf\`

**Examples for DevOps:**
- \`feat(api): add /health endpoint\`
- \`fix(terraform): correct S3 bucket policy\`
- \`ci: add Trivy scan step\`
- \`chore(deps): bump nginx to 1.27\`

A good subject: **imperative mood**, up to ~50–72 characters, no trailing period.`,
    },
    {
      title: 'Monorepos, submodules, and sparse-checkout',
      content: `A **monorepo** is one repository with many projects (Google, Uber, many startups). Plus: atomic API+client changes. Minus: heavy clone, needs CI discipline.

A **polyrepo** is a separate repo per service. Simpler access control and CI, harder to coordinate breaking changes.

A **Git submodule** is a repository inside a repository (a pointer to a commit in another repo). Often painful to maintain — for Terraform modules teams more often use a Registry or separate repos + version tags.

**Sparse-checkout** — clone/checkout only the needed directories of a large monorepo.`,
      codes: [
        {
          language: 'bash',
          caption: 'sparse-checkout (briefly)',
          code: `git clone --filter=blob:none --sparse git@github.com:org/monorepo.git
cd monorepo
git sparse-checkout set services/api infra/terraform`,
        },
      ],
    },
    {
      title: 'Git in CI/CD and GitOps',
      content: `CI is almost always triggered on **push** and **pull_request**.

**Typical checks in a DevOps repository PR:**
- \`terraform fmt -check\` / \`terraform validate\` / \`terraform plan\`
- Helm lint / kubeconform
- YAML / Ansible lint
- Secret scanning (gitleaks, TruffleHog)
- Container image build + Trivy

**GitOps:** the cluster desired state = Git.
- Argo CD / Flux watch a branch (\`main\` or \`env/prod\`)
- A change in Git → automatic (or gated) sync into the cluster
- Rollback = \`git revert\` + sync

> More detail — in the CI/CD (GitHub Actions) and GitOps (Argo CD) modules.`,
    },
    {
      title: 'SSH keys for GitHub/GitLab',
      content: `SSH removes the need to constantly enter a token. On one machine — a separate key; in CI — a deploy key or machine user.`,
      codes: [
        {
          language: 'bash',
          caption: 'Creating a key and adding it to ssh-agent',
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
      title: 'Checklist and common mistakes',
      content: `**Before every push, check:**
- [ ] No secrets in the diff (\`git diff --staged\`)
- [ ] \`.gitignore\` covers \`.env\`, \`*.tfstate\`, keys
- [ ] Commit messages are clear (conventional commits)
- [ ] Branch is based on up-to-date \`main\`
- [ ] You ran locally what will fail in CI

**Common beginner mistakes:**
1. \`git commit -m "fix"\` with no context — in a month you will not understand it
2. Committing \`.env\` → urgent key rotation
3. \`git push --force\` to \`main\` — breaks the team's history
4. A huge 2000-line PR — nobody reviews it well
5. Rebasing an already-pushed shared branch without agreement
6. \`git reset --hard\` “just in case” — lost work

**Cheat sheet of the day:**
\`\`\`
status → add → commit → push
switch -c feature/... → work → push -u → PR
stash when you need an urgent hotfix
reflog when “everything is gone”
\`\`\``,
    },
  ],
  practice: [
    'Create a devops-handbook-practice repository on GitHub: README, .gitignore, LICENSE (MIT)',
    'Make 5 commits with conventional commits: feat, fix, docs, ci, chore',
    'Create a feature/nginx branch, add a file, merge via PR (or locally with --no-ff)',
    'Create a merge conflict on purpose: two branches change the same line — resolve and commit',
    'Practice rebase: feature from an old main → rebase onto current main',
    'Use git stash: uncommitted changes → stash → switch branch → stash pop',
    'Create an annotated tag v0.1.0 and push it. Check it on GitHub Releases',
    'Set up branch protection on main: require PR, status checks (an empty workflow is fine)',
    'Find a “lost” commit via git reflog after git reset --hard (only in a test repo!)',
    'Add a .pre-commit-config.yaml with trailing-whitespace and gitleaks; run pre-commit run --all-files',
    'Set up an SSH key for GitHub and clone a repository over SSH',
    'Do an interactive rebase of the last 3 commits: squash two docs commits into one',
  ],
  resources: [
    { title: 'Pro Git Book', url: 'https://git-scm.com/book/en/v2' },
    { title: 'Conventional Commits', url: 'https://www.conventionalcommits.org/' },
    { title: 'Oh Shit, Git!?!', url: 'https://ohshitgit.com/' },
    { title: 'gitignore.io', url: 'https://www.toptal.com/developers/gitignore' },
  ],
  quiz: [
    {
      question: 'How does git merge differ from git rebase?',
      options: [
        'Merge keeps a merge commit; rebase rewrites history on top of the base',
        'Rebase deletes all commits',
        'Merge only works with a remote repository',
        'Rebase cannot be used on feature branches',
      ],
      answer: 'Merge keeps a merge commit; rebase rewrites history on top of the base',
    },
    {
      question: 'What does git stash do?',
      answer: 'Temporarily saves uncommitted changes so you can switch to another task.',
    },
    {
      question: 'Which command pushes a local branch to origin and sets upstream?',
      options: [
        'git push -u origin branch-name',
        'git fetch --all',
        'git reset --hard',
        'git clean -fd',
      ],
      answer: 'git push -u origin branch-name',
    },
    {
      question: 'What is detached HEAD?',
      options: [
        'HEAD points at a specific commit, not a branch',
        'The repository is corrupted',
        'There is no remote origin',
        'All branches have been deleted',
      ],
      answer: 'HEAD points at a specific commit, not a branch',
    },
    {
      question: 'Why use .gitignore?',
      answer: 'To exclude build artifacts, secrets, and local files from the index.',
    },
    {
      question: 'How do you undo the last commit while keeping changes in the working directory?',
      options: ['git reset --soft HEAD~1', 'git reset --hard HEAD~1', 'git revert HEAD', 'git stash drop'],
      answer: 'git reset --soft HEAD~1',
    },
    {
      question: 'Which command is safer for undoing a commit already on shared main?',
      options: ['git revert', 'git reset --hard', 'git push --force', 'git clean -fdx'],
      answer: 'git revert',
      explanation: 'revert creates a new undo commit and does not rewrite other people’s history.',
    },
    {
      question: 'What does git fetch do without a merge?',
      answer:
        'Downloads objects and updates remote-tracking branches (origin/*) without changing the working directory or current branch.',
    },
    {
      question: 'Why use branch protection on main?',
      options: [
        'Require a PR, review, and green CI instead of a direct push',
        'Speed up git clone',
        'Disable hooks',
        'Automatically delete .gitignore',
      ],
      answer: 'Require a PR, review, and green CI instead of a direct push',
    },
  ],
  terminalLab: {
    id: 'git-basics',
    title: 'Basic Git commands',
    intro:
      'Git syntax trainer: commands are not executed in a real repository, but input correctness is checked — just like everyday terminal work.',
    promptUser: 'student',
    promptHost: 'devops-handbook',
    promptPath: '~/project',
    initialOutput: [
      'Welcome to the Git syntax trainer.',
      'The repository is already initialized. Follow the steps in order.',
    ],
    steps: [
      {
        id: 'git-status',
        instruction: 'Check the state of the working directory and staging area.',
        match: { kind: 'normalized' },
        accept: ['git status'],
        hint: 'The most common Git command: status — “what is changed right now.”',
        explanation:
          'git status shows the branch, staged/unstaged changes, and untracked files. Look here before every commit.',
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
        instruction: 'Add all changes to the staging area with one command.',
        match: { kind: 'normalized' },
        accept: ['git add .'],
        hint: 'git add . — add the current directory and everything inside to the index.',
        explanation:
          'git add . stages all changes in the current tree. For finer control use git add <file> or git add -p.',
        fakeOutput: [''],
      },
      {
        id: 'git-commit',
        instruction:
          'Create a commit with the message docs: add nginx config (via git commit -m "...").',
        match: { kind: 'normalized' },
        accept: ['git commit -m "docs: add nginx config"'],
        hint: 'git commit -m "message" — commit without opening an editor. Quotes are required.',
        explanation:
          'git commit records a snapshot of the index in history. Conventional Commits (docs:, feat:, fix:) help read history and generate changelogs.',
        fakeOutput: [
          '[main 9f3a1c2] docs: add nginx config',
          ' 2 files changed, 18 insertions(+), 1 deletion(-)',
        ],
      },
      {
        id: 'git-branch',
        instruction: 'Create a new branch feature/nginx and switch to it immediately (one command).',
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
        hint: 'Modern form: git switch -c <name>. Classic: git checkout -b <name>.',
        explanation:
          'git switch -c (or checkout -b) creates a branch and moves HEAD to it. Feature branches keep work isolated until a PR.',
        fakeOutput: ["Switched to a new branch 'feature/nginx'"],
      },
      {
        id: 'git-log',
        instruction: 'Show a brief commit history with one line per commit.',
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
        hint: 'git log --oneline — short SHA + message. Often add --graph --all.',
        explanation:
          'git log --oneline is handy for a quick overview. The lg alias from the chapter usually includes --graph --all --decorate.',
        fakeOutput: [
          '9f3a1c2 docs: add nginx config',
          'a1b2c3d chore: initial commit',
        ],
      },
    ],
  },
}

export default translation
