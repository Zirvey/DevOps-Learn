import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'IT Support - basics and levels',
  duration: '10–12 hours',
  description:
    'L1/L2/L3 support, ITIL basics, soft skills, tools and career path from helpdesk to sysadmin/DevOps',
  sections: [
    {
      title: 'The role of IT Support in an organization',
      content: `**IT Support** is the first line of contact between business and technology. The quality of support determines whether the company works or whether employees wait “for it to be fixed.”

**Area of responsibility:**
- Workstations and laptops (Windows, macOS)
- Enterprise applications (Office 365, Teams, VPN)
- Accounts and access (AD, Azure AD)
- Peripherals: printers, headsets, docking stations
- Escalation of network and server incidents

**What L1 does NOT do without escalation:**
- Change firewall policies
- Reboot Domain Controller
- Make changes in production without a change request

> A good IT Support is not one who knows everything, but one who **resolves quickly or escalates correctly** with full context.`,
    },
    {
      title: 'Support levels: L1, L2, L3, L4',
      content: `| Level | Title | Responsibility | Typical tasks | Time per ticket |
|---------|----------|-----------------|-----------------|----------------|
| **L1** | Helpdesk/Service Desk | Reception, classification, basic fix, KB | Password reset, no sound, printer offline | 5–20 min |
| **L2** | Desktop/Systems Support | Complex PCs, GPO, software, AD | Outlook OST, VPN profile, Intune compliance | 30–120 min |
| **L3** | Infrastructure/Network | Servers, network, firewall, DC | VLAN, FortiGate, DHCP scope, RADIUS | Hours–days |
| **L4** | Vendor/Escalation | Vendor, RMA, warranty | Broken switch, firmware bug | By vendor SLA |

**Goal L1:** resolve **70%** of calls in **15 minutes** or escalate with a full package of information.

**Escalation Matrix (example):**
| Symptom | L1 action | Where to escalate |
|---------|-------------|-------------------|
| One user - no internet | ipconfig, ping, VPN | L2 if it didn't help in 20 minutes |
| Whole office without network | P1 ticket, notify lead | L3 immediately |
| Virus suspected | Isolate PC | L2 + Security |
| Request a new laptop | Service Request | L2/Procurement |

**L1 does not “turn a blind eye”:** if you see a recurring problem among 5 users, this is no longer L1, but a signal for a Problem ticket.`,
    },
    {
      title: 'ITIL essentials: practical application',
      content: `**ITIL** (Information Technology Infrastructure Library) is a set of best practices for IT services. Full certification is not required to start, but **terms are used everywhere**.

**Key Concepts:**

| Term | Definition | Example in the office |
|--------|-------------|----------------|
| **Incident** | Disruption of normal operation of the service | Outlook won't open, no internet |
| **Service Request** | Standard Service Request | New laptop, access to folder, installation of software |
| **Problem** | Root cause of recurring incidents | “VPN crashes every Monday” |
| **Change** | Planned infrastructure change | Migration to Windows 11, change of firewall |
| **CMDB** | Configuration database (assets) | Snipe-IT: serials, owners, locations |
| **SLA** | Service Level Agreement | P1: answer 15 min, solution 4 h |
| **OLA** | Internal agreement between teams | L1→L3: escalation for 30 min |

**Incident vs Service Request - how to distinguish:**
- **Incident:** “It’s broken” → restore service as quickly as possible
- **Service Request:** “I need” → follow standard process (may take days)

**Problem Management:**
1. Record recurring incidents (3+ per month)
2. Create a Problem ticket, assign owner
3. Root cause analysis (5 Whys, fishbone)
4. Known Error + workaround in KB
5. Change for permanent fix

**Change Management (simplified for SMB):**
- Standard Change - pre-approved (password reset, deploy printer)
- Normal Change - approval required (GPO update, firewall rule)
- Emergency Change — P1 fix, post-implementation review required`,
    },
    {
      title: 'ITSM systems: Jira Service Management and Zendesk',
      content: `**ITSM** (IT Service Management) - platform for tickets, SLA, KB and reporting.

**Jira Service Management (JSM):**
- Integration with Jira Software (DevOps sees tickets)
- Automation rules: auto-assign, SLA timers, escalation
- Assets (CMDB) - paid extension
- Portal for users: portal.company.com
- Good for: tech companies, teams with Jira ecosystem

**Zendesk:**
- Simple UI, quick start
- Omnichannel: email, chat, phone
- Macros and triggers for automation
- Help Center (KB) out of the box
- Good for: SMB, non-tech industries

**Comparison for an office of 50 people:**

| Criterion | Jira SM | Zendesk |
|----------|---------|---------|
| Difficulty of implementation | Average | Low |
| Price (50 agents) | $$ | $$ |
| KB | Confluence/embedded | Built-in Help Center |
| SLA tracking | Excellent | Good |
| AD/SSO Integration | SAML, SCIM | SAML, SCIM |

**Alternatives:** Freshservice, ServiceNow (enterprise), osTicket (open-source, self-hosted).

**Minimum configuration of any ITSM:**
1. Categories and priorities
2. SLA policies by priority
3. Queues: L1, L2, L3
4. Email-to-ticket: support@company.com
5. 10 canned responses for top queries
6. KB with 20 articles before go-live`,
    },
    {
      title: 'Soft skills: communication with users',
      content: `Technical skills solve 50% of problems. **Soft skills** are the remaining 50% and the main factor of CSAT.

**Golden rules:**
1. **Don’t say** “it’s not my problem” - always “I’ll pass it on to the right specialist”
2. **Explain in simple language** - not “I’ll recreate the OST”, but “I’ll fix the local copy of mail”
3. **Confirm understanding:** “Did I understand correctly that since 9:00 Outlook shows a connection error?”
4. **Give us an ETA:** “I’ll be back with a solution within 30 minutes.”
5. **Close the loop:** “Please check if it works now”

**Script: angry user**
> “I understand that the situation interferes with work. Let's focus on the solution - I'll check [X] now and report the status in [N] minutes."

**Script: “you broke everything after the update”**
> “Thank you for letting me know. The update may have affected [component]. I'll check the settings and roll back the change if necessary. Your ticket is a priority."

**Script: user is not online**
> Email/SMS: “We completed [action]. Please restart your PC and confirm that the problem is resolved. The ticket will close automatically after 48 hours without a response."

**Active listening:**
- Don't interrupt
- Write down: OS, application version, start time, what changed
- Ask questions that are unclear: “Are you connected via cable or Wi-Fi?”

**Documentation in ticket:**
- What the user said (key verbatim)
- What I checked (checklist)
- What I did (commands, changes)
- Result and next steps`,
    },
    {
      title: 'Working under stress and prioritizing',
      content: `**Peak loads:** Monday morning, after holidays, payroll day, product release.

**Prioritization Matrix (Impact × Urgency):**

| | Low Urgency | High urgency |
|---|------------------|-------------------|
| **High impact** | P2 - plan | P1 - immediately |
| **Low impact** | P4 - in queue | P3 - today |

**Examples of impact:**
- Whole office without internet → High
- CEO cannot send a letter → High
- One intern without a printer → Low
- 3 out of 50 can’t use VPN → Medium

**For P1 incident:**
1. Create a P1 ticket (not chat in Telegram!)
2. Notify: team lead, L3 on-call
3. Status page / email staff every 30 minutes
4. War room: one coordinator, the rest do not duplicate work
5. Post-incident review within 48 hours

**Burnout prevention for L1:**
- Breaks every 2 hours
- Rotation of “heavy” tickets
- Escalation without shame is professionalism
- Personal KB notes for frequent fixes`,
    },
    {
      title: 'IT Support Tools: Full Stack',
      content: `| Category | Tools | Destination |
|-----------|-------------|------------|
| **Ticketing** | Jira SM, Zendesk, Freshservice | Tickets, SLA, KB |
| **Remote access** | TeamViewer, AnyDesk, RDP, MeshCentral | Remote assistance |
| **MDM/UEM** | Microsoft Intune, Jamf (macOS) | Device management |
| **Password vault** | Bitwarden, 1Password Business | Corporate secrets |
| **Monitoring** | PRTG, Uptime Kuma, Zabbix | Availability of services |
| **Documentation** | Confluence, Notion, BookStack | Runbooks, KB |
| **Asset management** | Snipe-IT, Lansweeper | Inventory |
| **Communication** | Teams, Slack | Internal chat, alerts |
| **Identity** | Azure AD, AD, Okta | Accounts, SSO, MFA |

**Remote support — best practices:**
- Ask permission before connecting
- Show the cursor, explain the actions
- Don't leave the session open
- Log remote sessions in the ticket

**Snipe-IT - minimum asset fields:**
- Asset tag, Serial, Model
- Assigned user, Location
- Purchase date, Warranty end
- Status: Deployed / In stock / Retired`,
    },
    {
      title: 'Classification of requests: practical examples',
      content: `**10 scenarios - Incident or Service Request?**

| # | Appeal | Type | Priority |
|---|-----------|-----|-----------|
| 1 | “I can’t log into Windows” | Incident | P2 |
| 2 | “You need access to the Finance folder” | Service Request | P3 |
| 3 | “The computer is very slow” | Incident | P3 |
| 4 | "Order 27" monitor | Service Request | P4 |
| 5 | “The entire floor without the Internet” | Incident | P1 |
| 6 | "Install Adobe Acrobat" | Service Request | P4 |
| 7 | “Suspicious letter with link” | Incident (Security) | P2 |
| 8 | “Forgot my VPN password” | Incident | P3 |
| 9 | “New employee from Monday” | Service Request | P3 |
| 10 | "Outlook freezes when opening" | Incident | P3 |

**Tags and categories (recommended set):**
- Hardware, Software, Network, Email, Printing
- Access & Identity, Security, Mobile, New Hire, Offboarding

**Auto-routing rules:**
- Category = Network → Queue Infrastructure
- Category = Security → Queue Security + notify SOC
- Keyword «password» → L1 queue, SLA standard`,
    },
    {
      title: 'Knowledge Base: structure and deflection',
      content: `**KB (Knowledge Base)** reduces the load on L1 by 20-40% with a good search.

**Article structure:**
1. **Title** - how the user searches: “How to connect to a VPN”
2. **Symptoms** - what the user sees
3. **Solution** - step by step, with screenshots
4. **Prerequisites** — VPN client installed, account active
5. **Related articles** - links
6. **Last updated** - date and author

**Required KB for corporate office:**
- Connect to VPN (FortiClient)
- Connection to Wi‑Fi Corp
- Password reset (self-service SSPR)
- Printer setup
- Teams - no sound/video
- OneDrive - synchronization
- How to create a ticket in portal
- BYOD Policy

**Deflection workflow:**
1. User opens portal
2. Search by KB before creating a ticket
3. “Was this article helpful?” — Yes → do not create a ticket
4. No → pre-fill ticket with category

**KB Metrics:**
- Views, Helpful %, Deflection rate
- Articles with low Helpful% - rewrite`,
    },
    {
      title: 'Metrics and KPI support',
      content: `| Metric | Formula/meaning | Target (SMB) |
|---------|-----------------|------------|
| **First Response Time (FRT)** | Time to first response | P1: 15 min, P3: 4 h |
| **MTTR** | Mean Time To Resolve | Depends on category |
| **CSAT** | Rating 1-5 after closing | > 4.2 |
| **First Contact Resolution (FCR)** | Decided on first contact | > 65% for L1 |
| **Ticket volume** | Tickets/month for 100 users | Downtrend = KB working |
| **Reopen rate** | % reopened | <8% |
| **SLA compliance** | % within SLA | >95% |

**Weekly review (30 min):**
1. Top 5 categories by volume
2. SLA breaches - why?
3. Reopened tickets — quality issue?
4. New KB articles from recurring tickets
5. Training gap for L1

**Dashboard for manager:**
- Open tickets by priority (pie)
- SLA at risk (list)
- FRT trend (line, 4 weeks)
- CSAT trend`,
    },
    {
      title: 'Security in IT Support',
      content: `L1 is a common **goal of social engineering**. Know the policies and don't bypass them.

**Identity verification when resetting password:**
- Call to mobile from AD (not the one in the ticket!)
- Personal meeting + badge
- Confirmation of the manager by email from known addresses
- **Never** one email “I’m the CEO, urgently reset your password”

**Prohibited:**
- Report passwords in plain text email
- Disable MFA “to make it more convenient”
- Give admin rights “temporarily”
- Connect to a PC without writing a ticket

**Security incidents - immediately:**
- Ransomware, suspicious activity
- Loss of a laptop with corporate data
- Phishing by entering credentials
→ Ticket P2 + Security team + device isolation

**Clean desk policy:** do not leave written passwords on desks during remote support visits.`,
    },
    {
      title: 'Onboarding to L1 role: first 30 days',
      content: `**Week 1:**
- Accesses: ITSM, KB, remote tool, AD read-only
- Shadowing experienced L1 (5+ calls)
- Explore the top 20 KB articles
- Office network diagram (1 page)

**Week 2:**
- Self-guided P3/P4 tickets under a mentor
- Password reset, printer issues, software install
- Fill out the cheat sheet: IP gateway, DNS, VPN portal

**Week 3-4:**
- P2 tickets with review
- First on-call shadow (if available)
- Write a 2 KB article from your experience

**Checklist “ready for shift alone”:**
- [ ] I know SLA and priorities
- [ ] I can create/escalate a ticket
- [ ] I know 5 playbooks by heart
- [ ] There are contacts for L2/L3 and the provider
- [ ] Read the security policy`,
    },
    {
      title: 'Career path: from Helpdesk to Sysadmin and DevOps',
      content: `**Typical trajectory (2–5 years):**

\\\`\\\`\\\`
Helpdesk L1 (6–12 months)
    → Desktop Support L2 (12–18 months)
        → Sysadmin / Network (18–36 months)
            → DevOps / Cloud Engineer
\\\`\\\`\\\`

**What to study in parallel with L1:**
| Skill | Resource | Why |
|-------|--------|-------|
| Active Directory | Sysadmin module | Accounts, GPO |
| Networking | Office Network Module | VLAN, DHCP, Wi‑Fi |
| PowerShell | fundamentals | Automation |
| Linux CLI | fundamentals/linux | Servers, cloud |
| Azure / AWS basics | cloud module | The Future of DevOps |

**Certifications (optional, along the way):**
- CompTIA A+ — hardware baseline
- CompTIA Network+ - network
- Microsoft AZ-900 — cloud awareness
- ITIL Foundation - for management

**How to stand out:**
- Automate repetitive tasks (PowerShell, Jira automation)
- Maintain a personal runbook
- Take Problem tickets, not only Incident
- Participate in projects: Win11 migration, new office`,
    },
    {
      title: 'Hybrid work and support for remote employees',
      content: `**Remote/hybrid calls:**
- No physical access to PC
- Home network variability
- VPN dependency
- Time zones

**Standard remote toolkit:**
- Intune for wipe/reinstall
- Autopilot for new devices
- VPN (FortiClient) + MFA
- TeamViewer/Quick Assist for edge cases
- Self-service portal for passwords (SSPR)

**Shipping hardware:**
- Pre-autopilot-enrolled laptop
- “Unpack and turn on” instructions
- Track delivery in the ticket
- 30-min onboarding call on day 1

**Home office checklist for user:**
- [ ] Ethernet is preferable to Wi‑Fi for VPN
- [ ] Router is not in guest mode
- [ ] Separate network for IoT (optional)
- [ ] Noise-canceling headset`,
    },
    {
      title: 'Interaction with other departments',
      content: `| Department | Typical queries | Your role |
|-------|------------------|-----------|
| **HR** | Joiner/Leaver, onboarding | Execute checklist by date |
| **Finance** | Strict access, compliance | Escalation to L2/security |
| **Legal** | eDiscovery, hold mailbox | According to the procedure, not without permission |
| **Facilities** | Moving, new sockets | Network coordination |
| **Procurement** | Purchasing laptops | Specs, asset registration |

**Joiner/Leaver SLA:**
- Joiner: 3 working days before release - AD, laptop, badge
- Leaver: on the day of dismissal until 18:00 - disable AD, wipe device

**Communication with HR:**
- Single ticketing channel
- Do not discuss the reasons for dismissal
- Confirm identity for leaver actions`,
    },
    {
      title: 'Typical mistakes of L1 beginners',
      content: `| Error | Why is it bad | How to |
|--------|--------------|---------------|
| Close ticket without confirmation | Reopen, dissatisfaction | Ask user or auto-close policy |
| Don't write down what you did | Unable to escalate | Checklist in ticket |
| Repair 2 hours instead of escalation | SLA breach, burnout | 20-min rule → escalate |
| Copy-paste canned response without reading | Irrelevant answer | Personalize |
| Give local admin “to install the software” | Security hole | Software request process |
| Ignore the “little things” | Problem is growing | Log patterns |

**20 minute rule:** if you haven’t made progress in 20 minutes, gather the facts and escalate. This is not a defeat, this is SLA discipline.`,
    },
    {
      title: 'IT Support readiness checklist for a new office',
      content: `**Before opening:**
- [ ] ITSM portal and email-to-ticket
- [ ] KB: VPN, Wi‑Fi, printer, ticket creation
- [ ] Asset tags and Snipe-IT
- [ ] On-call rotation L1/L2/L3
- [ ] SLA agreed with the business
- [ ] Contacts of the provider, network vendor

**Day 1:**
- [ ] Walk-in support desk (if available)
- [ ] Broadcast: how to create a ticket
- [ ] Monitoring: Internet, Wi‑Fi, DC

**First week:**
- [ ] Daily standup 15 min for open P1/P2
- [ ] Collecting feedback for KB
- [ ] Retro: what went wrong`,
    },
    {
      title: 'ITIL 4: Service Value System and 34 practices',
      content: `**ITIL 4 Service Value System (SVS)** is an operating model that links demand (business demand) with value (working services).

**SVS Components:**
| Component | Description |
|-----------|----------|
| **Guiding Principles** | 7 principles: focus on value, start where you are, progress iteratively, collaborate, think holistically, keep it simple, optimize and automate |
| **Governance** | Who makes the decisions, RACI for IT investments |
| **Service Value Chain** | 6 activities: Plan → Improve → Engage → Design & Transition → Obtain/Build → Deliver & Support |
| **Practices** | 34 management practices (not “processes” - flexible set) |
| **Continual Improvement** | PDCA, CSI register |

**34 practices - top 15 for IT Support:**

| Practice | What does L1/L2 do | Artifact |
|----------|------------------|----------|
| Incident Management | Restore service | Ticket, timeline |
| Service Request Management | Standard Services | Service catalog |
| Problem Management | Root cause recurring | Problem record, Known Error |
| Change Enablement | Change control | Change request |
| Service Desk | Single point of contact | Queues, SLA |
| Knowledge Management | KB, deflection | Confluence articles |
| Monitoring & Event Management | Alerts → tickets | PRTG, auto-ticket |
| Service Level Management | SLA, OLA, UC | SLA document |
| Information Security Management | Policies, verify identity | Security policy |
| Workforce & Talent | Training L1 | Skills matrix |
| Measurement & Reporting | KPI dashboard | Weekly review |
| Relationship Management | Stakeholder comms | Monthly report |
| Portfolio Management | Project Priority | Roadmap |
| Risk Management | Risk assessment change | Risk register |
| Continual Improvement | Retro, action items | CSI register |

**Service Value Chain - example “new employee”:**
1. **Engage** – HR request joiner
2. **Plan** - capacity: is there a laptop in stock?
3. **Design & Transition** — Autopilot profile, checklist
4. **Obtain/Build** — purchase if there is no stock
5. **Deliver & Support** — ship, day-1 call, close ticket
6. **Improve** — retro: 2/10 joiners were delayed → fix procurement SLA

**ITIL 4 vs ITIL v3:** v3 = processes; v4 = practices + value streams + flexibility for DevOps/Agile. Foundation certification is sufficient for L1/L2 terminology alignment.`,
    },
    {
      title: 'ITSM comparison: Jira vs Zendesk vs Freshservice vs ServiceNow',
      content: `| Tool | Segment | SLA | Price 50 agents | Best for |
|------|---------|-----|-----------------|----------|
| Jira SM | Tech mid | ★★★★★ | $15-25k/y | Atlassian shops |
| Zendesk | SMB | ★★★★ | $12-20k/y | Fast start |
| Freshservice | SMB | ★★★★ | $10-18k/y | ITIL lite |
| ServiceNow | Enterprise | ★★★★★ | $100k+ | 500+ users |
| osTicket | Self-host | ★★ | Free | Budget |`,
    },
    {
      title: 'Career and salaries RU/EU 2025-2026',
      content: `**Career tracks and compensation (orientir 2025–2026, gross):**

**Russia (Moscow / remote work for a RU company):**
| Role | Experience | Salary ₽/month | Certifications |
|------|------|----------------|--------------|
| L1 Helpdesk | 0–1 g | 60,000–120,000 | ITF, A+ in progress |
| L2 Desktop | 1–3 g | 100,000–180,000 | A+, AZ-900 |
| Sysadmin Windows | 2–5 g | 150,000–280,000 | AZ-104, Server |
| Network Engineer | 3–6 g | 180,000–350,000 | Network+, N10-008 |
| DevOps Junior | 3–5 g | 200,000–400,000 | AZ-400, CKA, Terraform |

**EU (Germany, Netherlands, remote contract B2B):**
| Role | Salary €/year | Notes |
|------|----------------|-------|
| L1 / Service Desk | 28 000–38 000 | Often shift work |
| L2 Support | 38 000–50 000 | English B2+ |
| Sysadmin | 45 000–65 000 | Hybrid common |
| Network | 50 000–75 000 | CCNA valued |
| DevOps Junior | 55 000–80 000 | K8s + CI/CD |

**How to grow from RU to EU remote:**
1. English B2+ (technical)
2. Portfolio: homelab, GitHub scripts, anonymized runbooks
3. Certifications: A+ → Network+ → AZ-104 or CCNA
4. LinkedIn + EU job boards (WeWorkRemotely, Otta)
5. B2B via Estonia/Cyprus entity or employer of record

**Skills matrix L1 → DevOps (18 months):**
| Month | Focus | Milestone |
|-------|-------|-----------|
| 1–3 | L1 excellence, ITSM, KB | FCR >65%, 20 KB articles read |
| 4–6 | AD, GPO, PowerShell | Automate 3 repetitive tasks |
| 7–9 | Networking VLAN DHCP | Pass Network+ |
| 10–12 | Linux CLI, bash | Homelab Proxmox |
| 13–15 | Azure/AWS basics | AZ-900 + EC2 lab |
| 16–18 | Docker, CI/CD intro | Deploy app via GitHub Actions |`,
    },
    {
      title: 'Remote support tools',
      content: `Quick Assist default Win; TeamViewer Mac; Intune Remote Help E5; RDP servers only; MeshCentral self-host. Policy: consent, log session ID, no unsupervised access.`,
    },
    {
      title: 'Shift handover template',
      content: `**IT Support Shift Handover Template**

\\\`\\\`\\\`
═══════════════════════════════════════
  HANDOVER — {{DATE}} — {{SHIFT}} {{TIME}}
  Outgoing: {{AGENT_OUT}} → Incoming: {{AGENT_IN}}
═══════════════════════════════════════

▸ OPEN P1/P2 (active)
  #{{ID}} P1 — {{SUMMARY}} — {{OWNER}} — next update {{TIME}}
  #{{ID}} P2 — {{SUMMARY}} — waiting L3 FG logs

▸ SLA AT RISK (< 2h to breach)
  #{{ID}} P3 printer floor 3 — parts ETA tomorrow

▸ PENDING USER (>24h) — chase today
  #{{ID}} — sent VPN instructions Mon 14:00

▸ KNOWN PROBLEMS / WORKAROUNDS
  PRB-042 Outlook disconnect hourly — KB-117 workaround

▸ PLANNED CHANGES (next 24h)
  CHG-089 cert renewal 02:00–03:00 MSK — monitor AM tickets

▸ ON-CALL L3: {{NAME}} {{PHONE}}

▸ NOTES
  ISP maintenance Wed 03:00–05:00 — prep comms if tickets spike
\\\`\\\`\\\`

**Rules:** overlap 15 min call with P1 active; pin in Teams #it-handover; incoming agent acknowledges in thread.`,
    },
    {
      title: 'Laboratory (16 steps)',
      content: `**Goal:** complete the full operational workflow from symptom to postmortem and process improvement.

**Preparation (30 min):** ITSM trial / lab VM / Excel dashboard template / read-only access to FortiGate or Omada (optional).

| # | Step | Details | Done |
|---|-----|--------|------|
| 1 | Prepare the environment | Portal, 3 queues, email-to-ticket | ☐ |
| 2 | SLA policies | P1 15m/4h, P3 4h/24h, pause Pending | ☐ |
| 3 | KB deflection | 5 articles: VPN, password, Wi‑Fi, Outlook, printer | ☐ |
| 4 | Create Incident | “No Internet”, category Network, P3 | ☐ |
| 5 | Fill in context | Asset tag, floor, scope 1 user, screenshot | ☐ |
| 6 | L1 diagnostics | ipconfig, ping GW, ping 8.8.8.8, nslookup | ☐ |
| 7 | Document | Each command + output in ticket comment | ☐ |
| 8 | Escalation | 10-field form L1→L3 if undecided 20 min | ☐ |
| 9 | L2/L3 fix | Root cause: DNS or DHCP - apply fix | ☐ |
| 10 | Resolve | Resolution notes + link KB | ☐ |
| 11 | CSAT | Mock survey 1–5 + comment | ☐ |
| 12 | Service Request | “Monitor 27"” — manager approval flow | ☐ |
| 13 | Problem ticket | Link 3 similar VPN incidents | ☐ |
| 14 | P1 simulation | Tabletop “whole office offline” + war room roles | ☐ |
| 15 | Comms draft | 3 emails: T+0, T+30, Resolved | ☐ |
| 16 | Dashboard | FRT, MTTR, SLA%, reopen rate — 4 charts Excel | ☐ |
| 17 | Postmortem | Blameless 1 page, 3 action items | ☐ |
| 18 | Automation | Rule: category Network → L3 queue | ☐ |
| 19 | Retro | 2 improvements in CSI register | ☐ |
| 20 | Peer review | A colleague checks the ticket quality checklist | ☐ |

**Success criteria:** ticket audit score ≥90%; postmortem action items assigned; dashboard reflects mock data.`,
    },
    {
      title: 'FAQ - 12 frequently asked questions',
      content: `| # | Question | Answer |
|---|--------|--------|
| 1 | Incident vs Service Request? | Incident = broken, restore ASAP. Request = standard catalog service. |
| 2 | When to escalate? | No progress 20 min; infrastructure affected; L2/L3 rights are required; security event. |
| 3 | Can I reset my password by email? | No without multi-factor identity verification according to policy. |
| 4 | CEO requires P1 for printer? | Explain impact matrix; arrange the correct P3/P4 priority. |
| 5 | Do I need a ticket for a 2-minute fix? | Yes - audit trail, metrics, KB input. |
| 6 | Angry user on phone? | Empathy + ETA + focus on fix; escalate threats to lead. |
| 7 | What is FCR? | First Contact Resolution - resolved from the first contact without reopen/escalate. |
| 8 | Problem ticket when? | 3+ similar incidents/month or unknown root cause after L3. |
| 9 | Disable MFA temporarily? | No without a documented Security exception. |
| 10 | What's in resolution notes? | Symptom, checks, actions, result, KB link, versions. |
| 11 | 10 open tickets - okay? | P1/P2 → SLA at risk → FIFO within priority. |
| 12 | KB vs playbook? | KB = user-facing deflection; playbook = internal agent runbook with escalation. |`,
    },
    {
      title: 'Troubleshooting matrix (24 lines)',
      content: `| # | Symptom | L1 checks (15 min) | Probable Cause | Action | Escalation |
|---|---------|-------------------|-------------------|----------|-----------|
| 1 | No internet 1 user | Scope wired/Wi‑Fi | DHCP/DNS/local | ipconfig /renew, flushdns | L3 if subnet |
| 2 | No internet all | WAN LED, mobile test | ISP/FW outage | P1 ticket, notify L3 | Immediate |
| 3 | VPN won't connect | Credentials, MFA, version | Profile/cert | Reinstall FortiClient | L2 FG logs |
| 4 | Outlook disconnect | OWA works? | OST corrupt/cert | Safe mode, recreate OST | L2 Exchange |
| 5 | Teams no sound | Device settings | UDP blocked/driver | Clear cache, test call | L2 network |
| 6 | Slow PC | Task Manager disk/RAM | Full disk, leak | Cleanup, reboot | L2 hardware |
| 7 | Not included Windows | Network, caps lock | Profile/AD lock | Unlock, reset pass | L2 profile |
| 8 | Printer offline | Ping IP | Spooler/GPO | Restart spooler | L2 print server |
| 9 | OneDrive doesn't sync | Account quota | Token stale | Reset OneDrive | L2 SharePoint |
| 10 | BitLocker boot | Verify identity | TPM change | Recovery key Intune | L2 recurring |
| 11 | Wi‑Fi does not connect | SSID, forget network | 802.1X/RADIUS | Re-auth AD creds | L3 NPS |
| 12 | APIPA 169.254.x.x | DHCP scope | Exhausted/wrong | Renew, check lease | L3 DHCP |
| 13 | Domain join fail | nslookup SRV | Wrong DNS 8.8.8.8 | Point to DC DNS | L3 AD |
| 14 | Phishing click | — | Compromised | Isolate, reset pass | Security P2 |
| 15 | BSOD | Stop code photo | Driver/disk | Safe mode, minidump | L2 |
| 16 | MFA loop | Phone time sync | New device | Re-register MFA | L2 TAP |
| 17 | Guest Wi‑Fi captive | Portal load | FG policy | Check VLAN60 | L3 |
| 18 | IP phone no dial tone | VLAN 30 check | DHCP opt 150 | Voice VLAN trunk | L3 |
| 19 | GPO not applied | gpresult /r | Wrong OU/link | gpupdate /force | L2 |
| 20 | Intune non-compliant | Company Portal sync | BitLocker/OS ver | Remediate policies | L2 |
| 21 | After Windows Update | KB number | Bad patch | Uninstall KB | Problem if mass |
| 22 | RDP fail internal | VPN first? | NLA/firewall | Check GPO RDP | L2 |
| 23 | Share access denied | Group membership | ACL/owner | Add AD group | Data owner |
| 24 | Laptop stolen | — | Data breach | Intune wipe, reset pass | Security P1 |`,
    },
    {
      title: 'Case study 1: Avalanche of Outlook tickets',
      content: `**Context:** Fintech office 80 FTE, Monday 09:00, 47 “Outlook certificate error” tickets.

**Timeline:**
- 09:05 — L1 notices the pattern in the queue filter
- 09:10 — Senior L1 creates master ticket, links duplicates
- 09:12 - Priority P2 (OWA web is working - workaround exists)
- 09:20 — L3: expired cert on legacy Exchange load balancer
- 09:35 — Emergency change approved verbally
- 09:50 — Cert renewed, clients reconnect after Outlook restart
- 10:15 — All-staff resolved email

**Metrics:** MTTR 70 min; 47 tickets → 1 master + 46 linked; CSAT dipped to 3.8 that week.

**Action items:** Cert expiry monitoring PRTG 30d alert; auto-renew Let's Encrypt where applicable; KB «Outlook cert error» updated.`,
    },
    {
      title: 'Case study 2: BEC «CEO password»',
      content: `**Context:** 22:15 email “from the CEO”: “Reset your password immediately, conf call in 10 minutes.”

**Actions:**
- L1 on-call did not reset the password
- Called CEO on mobile from AD - CEO didn’t send
- Created P2 Security, blocked sender domain
- Security: BEC attempt, blocked IP, training scheduled

**Lessons:** After-hours does not weaken verification; single-channel email insufficient; report to Security within 15 min.`,
    },
    {
      title: 'Case study 3: 50 remote Autopilot',
      content: `**Context:** EdTech hired 50 remote teachers in 1 week, all Autopilot.

**Approach:**
- Pre-staged profiles by department in Intune groups
- Snipe-IT serial import → Autopilot group tag
- Shipping partner + tracking in Service Request tickets
- Day-1 batch Teams onboarding 10 users per slot

**Results:** 48/50 zero-touch; 2 needed manual ESP (TPM firmware update).
**KB video** “Unpack and turn on” reduced inbound calls by 60%.`,
    },
    {
      title: 'CompTIA A+ / Network+ mapping',
      content: `| CompTIA objective | Domain | Where in the chapter | Exam |
|-------------------|--------|-------------|------|
| Hardware troubleshooting | A+ Core 1 2.x | Laptop lifecycle, diagnostics | 220-1101 |
| Mobile devices | A+ Core 1 3.x | Intune, Autopilot | 220-1101 |
| Virtualization/cloud | A+ Core 1 4.x | Azure AD, M365 | 220-1101 |
| OS troubleshooting | A+ Core 2 1.x | Windows 11, BSOD | 220-1102 |
| Security | A+ Core 2 2.x | MFA, BitLocker, phishing | 220-1102 |
| Software troubleshooting | A+ Core 2 3.x | Outlook, Teams | 220-1102 |
| Operational procedures | A+ Core 2 4.x | ITIL, SLA, documentation | 220-1102 |
| Networking concepts | Network+ 1.x | VLAN, subnet, DNS | N10-008 |
| Network implementation | Network+ 2.x | DHCP, Wi‑Fi, switching | N10-008 |
| Network operations | Network+ 3.x | Monitoring, backups | N10-008 |
| Network security | Network+ 4.x | Firewall, 802.1X, segmentation | N10-008 |
| Network troubleshooting | Network+ 5.x | ipconfig, ping, traceroute | N10-008 |

**Study path:** A+ both cores → Network+ → AZ-900 → role-specific (AZ-104 / CCNA).`,
    },
    {
      title: '10 interview questions',
      content: `| # | Question | A strong answer includes |
|---|--------|------------------------|
| 1 | Incident lifecycle? | New→Open→In Progress→Pending→Resolved→Closed; SLA pause |
| 2 | How do you determine P1? | Impact × urgency; examples: all office down vs one printer |
| 3 | An example of escalation? | Ticket #, scope, steps, logs, suspect, test contact |
| 4 | Password reset verify? | Phone AD, badge, manager — never email alone |
| 5 | Problem Management? | Recurring incidents, root cause, Known Error, Change |
| 6 | Reduce ticket volume? | KB deflection, automation, self-service, training |
| 7 | FRT vs MTTR? | First response vs mean time to resolved |
| 8 | Remote support ethics? | Consent, log session, no unattended access |
| 9 | Documentation? | Every step in ticket; assets, versions, screenshots |
| 10 | Career 2 years? | Concrete skills: AD, PowerShell, Network+, project |`,
    },
    {
      title: 'Templates: email, escalation, KB',
      content: `**1. Email is the solution**
\\\`\\\`\\\`
Subject: [{{TICKET}}] Resolved - {{SUBJECT}}
Hello {{NAME}}!
Done: {{SUMMARY}}.
Action: {{USER_ACTION}}.
Confirm by replying to the letter. CSAT: {{URL}}
IT Support | {{COMPANY}}
\\\`\\\`\\\`

**2. Email - information needed**
\\\`\\\`\\\`
Subject: [{{TICKET}}] Please clarify
{{QUESTIONS}}
A screenshot of the error will speed up the solution.
\\\`\\\`\\\`

**3. Escalation form L1→L3**
Ticket | Priority | Scope | Start | Impact | L1 steps | Suspect | Logs | Test user | Deadline

**4. KB article skeleton**
# Title | Symptoms | Prerequisites | Steps 1-n | Still broken? → ticket cat X | Related | Owner | Updated`,
    },
    {
      title: 'Additional best practices and checklist',
      content: `**Monthly review checklist:**
- [ ] Update KB and playbooks based on ticket results
- [ ] Check SLA compliance and CSAT trend
- [ ] Review open Problem tickets
- [ ] Audit DHCP/DNS/VLAN configuration
- [ ] Firmware security patches network gear
- [ ] Backup firewall/switch configs
- [ ] Test failover WAN / DHCP / RADIUS
- [ ] Training gap analysis for L1
- [ ] Update asset inventory
- [ ] Retro major incidents if there were

**Documentation:** each change - ticket + change record + config backup + diagram update.

**Communication:** users value ETA more than speed - always set expectations.

**Security:** least privilege, segment networks, verify identity, log actions.

**Continuous training:** 2h/week lab + milestone quarterly certification.`,
    },
    {
      title: 'Directory of terms A–Z',
      content: `**IT Support and Office Network Glossary (A–Z):**

| Term | Definition |
|--------|-------------|
| **802.1Q** | VLAN tagging standard |
| **802.1X** | Port/network access control via RADIUS |
| **APIPA** | 169.254.x.x auto IP = DHCP failure |
| **Autopilot** | Zero-touch Windows deploy via Intune |
| **BitLocker** | Full disk encryption |
| **BPDU Guard** | STP protection on access ports |
| **CMDB** | Configuration management database |
| **CSAT** | Customer satisfaction score 1–5 |
| **DHCP** | Dynamic IP assignment |
| **DNSSEC** | DNS response validation |
| **Entra ID** | Microsoft identity (Azure AD) |
| **ESP** | Enrollment Status Page |
| **FCR** | First contact resolution |
| **FRT** | First response time |
| **GPO** | Group Policy Object |
| **IDF/MDF** | Intermediate/main distribution frame |
| **Intune** | Microsoft UEM/MDM |
| **ITIL** | IT service management framework |
| **ITSM** | IT service management platform |
| **KB** | Knowledge base |
| **LAG** | Link aggregation group |
| **MFA** | Multi-factor authentication |
| **MTTR** | Mean time to resolve |
| **NPS** | Network Policy Server (RADIUS) |
| **OLA** | Operational level agreement |
| **PoE** | Power over Ethernet |
| **RADIUS** | Remote authentication dial-in |
| **SLA** | Service level agreement |
| **SSPR** | Self-service password reset |
| **STP** | Spanning Tree Protocol |
| **SVI** | Switched virtual interface |
| **UPS** | Uninterruptible power supply |
| **VLAN** | Virtual LAN broadcast domain |
| **VoIP** | Voice over IP |`,
    },
    {
      title: 'ITIL 4: detailed analysis of Value Chain',
      content: `**Plan:** capacity, budget, risk for joiners/projects.
**Improve:** retro P1, CSI register, KB updates.
**Engage:** HR/Finance as customers, SLA review quarterly.
**Design & Transition:** Autopilot rollout, new office VLAN design.
**Obtain/Build:** procurement laptops, license true-up.
**Deliver & Support:** L1 daily tickets, on-call P1.

Each activity consumes inputs (demand, constraints) and produces outputs (services, value).`,
    },
    {
      title: 'Remote support: detailed policy',
      content: `| Tool | When | Audit |
|------|------|-------|
| Quick Assist | Default Win10/11 | Log ticket # + duration |
| TeamViewer | Mac/cross-platform | Session ID in ticket |
| Intune Remote Help | E3/E5 tenant | Auto-audit in Intune |
| RDP | Servers only L2+ | Jump host, no direct internet RDP |

**Prohibited:** unsupervised access; copying files without approval; leaving session open overnight.`,
    },
    {
      title: 'Extended reference — deep dive',
      content: `**ITIL 4 practices — extended reference (part 2)**

| Practice | Trigger | Key metric | Tool |
|----------|---------|------------|------|
| Incident Management | Service down | MTTR, SLA% | ITSM |
| Service Request | User needs standard item | Fulfillment time | Catalog |
| Problem Management | Recurring incidents | Problems closed/month | ITSM+KB |
| Change Enablement | Any prod change | Change success rate | ITSM+ CAB |
| Service Desk | All contacts | CSAT, FCR | Portal |
| Knowledge Management | Repeat questions | Deflection rate | Confluence |
| Service Level Management | Monthly | SLA compliance | Reports |
| Information Security | Policy violation | Security incidents | SIEM |
| Workforce Management | Hiring/training | Skills coverage | HRIS |
| Continual Improvement | Retro | Action items done | CSI register |

**Incident prioritization workshop (facilitator guide):**
1. Gather 10 real tickets from last month
2. Team scores impact 1–5 and urgency 1–5 independently
3. Compare scores — discuss outliers >2 points
4. Document agreed matrix in Confluence
5. Revisit quarterly when org changes

**Soft skills drill — active listening (15 min roleplay):**
- Agent repeats back symptom before troubleshooting
- User confirms or corrects
- Agent asks one clarifying question at a time
- Debrief: did user feel heard? (yes/no + why)

**Asset management deep dive (Snipe-IT):**
- Status workflow: Deployable → Deployed → In repair → Retired
- Custom fields: cost center, warranty, encryption status
- Checkout/checkin ties asset to user ticket
- Quarterly audit: physical walk vs database

**Security awareness for L1:**
- Never share passwords in chat/email
- Verify C-level requests via second channel
- Report USB found in parking lot to Security
- Suspected malware: isolate network first, questions later

**Metrics dashboard — Excel formulas (mock):**
- FRT avg: =AVERAGE(FRT_column)
- SLA%: =COUNTIF(SLA_met,"Yes")/COUNTA(SLA_met)
- Trend: week-over-week delta conditional formatting red/green

**Onboarding L1 week-by-week expanded:**
Week 1 shadow 10 calls; Week 2 solo P4 with review; Week 3 P3; Week 4 P2 shadow; Week 5 on-call shadow; Week 6 sign-off checklist with lead.

**Vendor management L4:**
When to open vendor case: hardware RMA, firmware bug, ISP outage confirmation. Always include serial, firmware version, config snippet (sanitized), timeline.

**Disaster scenarios tabletop (30 min):**
- Ransomware on file server
- Fire in server room
- Key person unavailable during P1
Assign: who declares P1, who comms, who technical lead

**Hybrid work policy highlights:**
- Corp device only for corp data
- Home network: recommend separate IoT SSID
- Lost device: report within 1h
- International travel: notify Security for geo MFA

**Communication templates — status update during P1:**
“We continue to work on incident {{ID}}. Current status: {{status}}. Affected: {{scope}}. Next update: {{time}}. Workaround: {{if any}}.”

**KB article quality rubric (score 0–5 each):**
Accuracy, clarity, screenshots, searchable title, updated date. Score <15 → rewrite.

**Career portfolio artifacts:**
- Redacted postmortem PDF
- PowerShell script automating ticket categorization
- Homelab network diagram PNG
- LinkedIn recommendations from L2 lead

**RU/EU job search checklist:**
LinkedIn EN profile, GitHub pinned repos, HH.ru + habr.career, EU: Otta, WeWorkRemotely, B2B contract readiness.

**ITSM data hygiene:**
Close stale Pending>14d with user ping; merge duplicates; require category before Resolve; ban «Other» without comment.

**Escalation anti-patterns:**
Empty escalation «please help»; escalation without user contact; closing before L3 confirms; ping-pong >3 teams without coordinator.

**Problem vs Incident decision tree:**
Single occurrence → Incident. Same root unknown 3× → Problem. Known Error published → link KB to new Incidents.

**Change types SMB simplified:**
Standard (pre-approved): password reset, printer deploy. Normal: GPO change, firewall rule. Emergency: P1 fix with PIR within 48h.

**Continual Improvement register example:**
| ID | Idea | Source | Priority | Owner | Status |
|----|------|--------|----------|-------|--------|
| CSI-01 | Auto VPN KB deflection | Q2 metrics | High | L1 lead | Open |

**Reading list (optional):**
ITIL 4 Foundation book (ch 1–4), «The Phoenix Project» fiction for DevOps mindset, Microsoft Learn IT Support learning paths.`,
    },
    {
      title: 'Chapter Summary: Key Takeaways',
      content: `1. **L1/L2/L3** - clear boundaries and escalation with context
2. **ITIL terms** - Incident, Request, Problem, Change - use daily
3. **ITSM** - Jira SM or Zendesk with SLA, KB, queues
4. **Soft skills** - scripts, active listening, ETA
5. **KB deflection** - the investment pays off in 2–3 months
6. **Security** - identity verification, no passwords in email
7. **Career** - AD, networking, PowerShell, Linux in parallel with L1
8. **Metrics** - FRT, MTTR, CSAT, reopen rate - improve weekly

> Next chapter: **Helpdesk, Tickets and SLA** - dives into the ticket lifecycle and SLA practices.`,
    },
  ],
  practice: [
    'Jira SM trial: 3 queues + SLA',
    'ITSM comparison for your company',
    'Shift handover mock P1+P3',
    '20 Incident/Request/Problem scenarios',
    'Career plan L1→DevOps 24 months',
    'Mock angry user call',
    'Escalation matrix 12 scenarios',
    '5 KB outlines new office',
    'Tabletop P1 no internet',
    'ITIL 4 map 8 practices',
    'Snipe-IT 15 assets',
    'Remote support policy 1 page',
    'CompTIA A+ 30-day plan',
    'Email templates resolved+info',
    'Retro 3 newbie mistakes',
  ],
  resources: [
    { title: 'ITIL 4 Foundation', url: 'https://www.axelos.com/certifications/itil-service-management/itil-4-foundation' },
    { title: 'CompTIA A+', url: 'https://www.comptia.org/certifications/a' },
    { title: 'Jira Service Management', url: 'https://www.atlassian.com/software/jira/service-management' },
    { title: 'HDI Support Center', url: 'https://www.thinkhdi.com/' },
    { title: 'Snipe-IT', url: 'https://snipeitapp.com/' },
    { title: 'Microsoft Modern Workplace', url: 'https://learn.microsoft.com/en-us/training/paths/modernize-workplace/' },
  ],
  quiz: [
    {
      question: 'L1 support usually solves:',
      options: ['Basic incidents and escalates', 'Firewall rules only', 'AD schema only'],
      answer: 'Basic incidents and escalates',
    },
    {
      question: 'Incident vs Service Request:',
      options: ['Broken vs service request', 'Same thing', 'Only for VIP'],
      answer: 'Broken vs service request',
    },
    {
      question: 'ITSM examples:',
      options: ['Jira SM, Zendesk, Freshservice', 'Excel only', 'Outlook only'],
      answer: 'Jira SM, Zendesk, Freshservice',
    },
    {
      question: 'Snipe-IT is used for:',
      options: ['Asset inventory', 'Firewall logs', 'VLAN design'],
      answer: 'Asset inventory',
    },
    {
      question: 'The path L1 → sysadmin includes learning:',
      options: ['AD, Networks, PowerShell', 'Design only', 'Kubernetes only'],
      answer: 'AD, Networks, PowerShell',
    },
    {
      question: 'Blameless in support means:',
      options: ['Focus on solutions, not blame', 'Don\'t help the user', 'Close tickets without response'],
      answer: 'Focus on solutions, not blame',
    },
    {
      question: 'CMDB differs from asset inventory because:',
      options: ['It links CIs and service dependencies', 'It only counts mice', 'DNS only', 'VPN only'],
      answer: 'It links CIs and service dependencies',
    },
    {
      question: 'Shift-left in IT support means:',
      options: ['Early IT involvement and self-service', 'Moving servers left in the rack', 'L3 only', 'No tickets'],
      answer: 'Early IT involvement and self-service',
    },
    {
      question: 'In ITIL, Problem differs from Incident because:',
      answer: 'Incident—restore service now; Problem—find and eliminate the root cause',
    },
    {
      question: 'First Call Resolution (FCR) measures:',
      options: ['% resolved on the first contact', 'Internet speed', 'PoE on switch', 'Number of VLANs'],
      answer: '% resolved on the first contact',
      explanation: 'High FCR reduces L2/L3 load.',
    },
  ],
}

export default translation
