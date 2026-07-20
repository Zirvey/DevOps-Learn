import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Helpdesk, tickets and SLA',
  duration: '10–12 hours',
  description:
    'Ticket life cycle, priorities, SLA, escalation, knowledge base and support metrics',
  sections: [
    {
      title: 'Service Desk as an IT Operations Center',
      content: `**Service Desk** is a single entry point for all IT requests. Without it, support lives in personal chats, mail and “come to Vasya” - it is impossible to measure SLA, workload and quality.

**Service Desk Features:**
- Reception and registration of all requests
- Classification and prioritization
- Primary diagnosis and solution (L1)
- Escalation with full context
- Communication of status to the user
- Closing with confirmation
- Collection of metrics and feedback for improvements

**Reception channels:**
| Channel | Pros | Cons |
|-------|-------|--------|
| Email | As usual, async | A lot of “Re: Re:”, the context is lost |
| Web portal | KB deflection, required fields | Users need to be trained |
| Phone | Urgent P1, elderly users | No audit trail without recording in ITSM |
| Teams/Slack bot | Fast for tech staff | Shadow IT tickets outside ITSM |
| Walk-in | Personal contact | Queue, no ticket = problem |

**Rule:** any decision is recorded in the ticket. Even a 2-minute fix at the counter - create a ticket post-factum.`,
    },
    {
      title: 'Ticket life cycle',
      content: `**Standard workflow:**

\\\`\\\`\\\`
New → Open → In Progress → Pending (user/vendor) → Resolved → Closed
                    ↓
              On Hold (awaiting parts)
                    ↓
              Reopened (user says not fixed)
\\\`\\\`\\\`

**Description of statuses:**
| Status | When to use |
|--------|-------------------|
| **New** | Just created, not assigned |
| **Open** | Assigned to agent, work not yet started |
| **In Progress** | Active work |
| **Pending (user)** | Waiting for user response/action |
| **Pending (vendor)** | We are waiting for ISP, Microsoft, RMA |
| **On Hold** | We are waiting for a spare part, change window |
| **Resolved** | Fix applied, waiting for confirmation |
| **Closed** | Confirmed or auto-close |
| **Reopened** | The problem is back |

**Required fields when creating:**
- Requester (who applied)
- Subject (briefly, searchable)
- Category (Hardware, Software, Network...)
- Priority (P1–P4 or Critical/High/Medium/Low)
- Description (symptoms, start time, scope)
- Asset (PC tag, IP printer) - if applicable
- Location (office, floor, remote)

**Closing Rules:**
- Do not close without user confirmation (except documented auto-close)
- Resolution notes are required: what has been done
- Link to KB if you created/updated an article
- Time spent for reporting (optional)`,
    },
    {
      title: 'Priorities: Impact × Urgency matrix',
      content: `**Priority** determines the SLA and processing order. Not to be confused with “who shouts loudest”.

| Priority | Title | Impact | Urgency | Examples |
|----------|----------|--------|---------|---------|
| **P1** | Critical | Many users/businesses worth | Immediately | Whole office without internet, ransomware, DC down |
| **P2** | High | One key user/department | Today | CEO email down, entire department without VPN |
| **P3** | Medium | One user, workaround available | 1–2 days | Outlook slow, one printer |
| **P4** | Low | Minimum impact | 3–5 days | Request for software, question “how to do it” |

**Calibration of priorities (examples for an office of 50 people):**
- 1 user Wi‑Fi → P3
- 10 users Wi‑Fi → P2
- All users Wi‑Fi → P1
- 1 user forgot password → P3 (P2 if C-level)
- Phishing click → P2 (security)

**Priority reduction:** only team lead with a comment in the ticket.
**Promotion:** any agent with new facts.`,
    },
    {
      title: 'SLA: examples for an office of 10, 50 and 100 users',
      content: `**SLA (Service Level Agreement)** - obligations regarding response and resolution time.

**Office of 10 people (without dedicated IT):**
| Priority | Response | Resolution | Support Hours |
|----------|----------|------------|----------------|
| P1 | 30 min | 4 h | Mon–Fri 9–18 |
| P2 | 2 h | 8 h | Mon–Fri 9–18 |
| P3 | 4 h | 24 h | Mon–Fri 9–18 |
| P4 | 8 h | 72 h | Mon–Fri 9–18 |

**Office 50 people (1 L1 + 1 L2, L3 part-time):**
| Priority | Response | Resolution | Clock |
|----------|----------|------------|------|
| P1 | 15 min | 4 h | 24×7 on-call L3 |
| P2 | 30 min | 8 h | Mon–Fri 8–20 |
| P3 | 4 h | 24 h | Mon–Fri 8–20 |
| P4 | 8 h | 72 h | Mon–Fri 8–20 |

**Office 100 people (2 L1 + 2 L2 + L3):**
| Priority | Response | Resolution | Clock |
|----------|----------|------------|------|
| P1 | 15 min | 2 h | 24×7 |
| P2 | 15 min | 4 h | Mon–Sat 7–22 |
| P3 | 2 h | 16 h | Mon–Fri 7–20 |
| P4 | 8 h | 48 h | Mon–Fri 7–20 |

**Definitions:**
- **Response time** — first meaningful reply (not auto-ack)
- **Resolution time** — Resolved status
- **Business hours** — specify timezone (MSK, CET)

**SLA breach actions:**
1. Auto-notify team lead
2. Escalation queue
3. Postmortem for P1/P2 breaches
4. Monthly report for management`,
    },
    {
      title: 'Jira Service Management: Practical Setup',
      content: `**JSM setup checklist for SMB:**

**1. Project type:** Service Management
**2. Request types:**
- Report an issue (Incident)
- Request something (Service Request)
- Ask a question

**3. Queues:**
| Queue | JQL filter | Assignee group |
|-------|------------|----------------|
| L1 Helpdesk | priority in (P3,P4) | helpdesk-team |
| L2 Desktop | category in (Software, Email) | desktop-team |
| L3 Infra | category = Network OR priority = P1 | infra-team |
| Security | category = Security | security-team |

**4. SLA goals (Automation → SLA):**
- P1 Response: 15 min calendar
- P1 Resolution: 4 h calendar
- Pause SLA when status = Pending (user)

**5. Automation rules:**
- Auto-assign Network → L3 queue
- P1 created → Slack webhook + SMS on-call
- Ticket Resolved 48h → auto Close
- Reopened 2× → flag for review

**6. Customer portal:**
- Branding, logo
- KB articles linked to request types
- Allow attachments (screenshots)

**7. Assets (optional):** link laptop serial to ticket`,
    },
    {
      title: 'Zendesk: Hands-on Setup',
      content: `**Zendesk setup for IT helpdesk:**

**1. Groups:** L1, L2, L3, Security
**2. Ticket forms** with custom fields:
- Category (dropdown)
- Asset tag
- Office location

**3. Triggers:**
| Trigger | Condition | Action |
|---------|-----------|--------|
| Route Network | Category = Network | Group = L3 |
| P1 alert | Priority = Urgent | Notify #it-alerts Slack |
| Auto-reply | Ticket created | Send “received, №{{ticket.id}}” |

**4. Macros (canned responses):**
- Password reset instructions
- VPN troubleshooting steps
- «Need more info» template

**5. Views:**
- My open tickets
- SLA breaching soon (Zendesk SLA app)
- Unassigned P1/P2

**6. Help Center:**
- Sections: Getting Started, VPN, Email, Printing
- Article labels for search

**7. Satisfaction survey:** CSAT after Resolved (1–5 stars)`,
    },
    {
      title: 'Categories, tags and routing',
      content: `**Recommended category tree:**

\\\`\\\`\\\`
├── Hardware
│   ├── Laptop/Desktop
│   ├── Monitor/Peripherals
│   └── Docking Station
├── Software
│   ├── Microsoft 365
│   ├── Line-of-business apps
│   └── Installation request
├── Network
│   ├── Internet
│   ├── VPN
│   └── Wi‑Fi
├── Email & Collaboration
│   ├── Outlook
│   └── Teams
├── Printing
├── Access & Identity
│   ├── Password/MFA
│   └── Permissions
├── Security
├── New Hire / Offboarding
└── Other
\\\`\\\`\\\`

**Auto-routing matrix:**
| Category | Subcategory | Queue | Default priority |
|----------|-------------|-------|------------------|
| Network | Internet (all users) | L3 | P1 |
| Network | VPN | L2 | P3 |
| Access | Password | L1 | P3 |
| Security | Any | Security + L2 | P2 |
| New Hire | — | L2 | P3 |

**Tags for analytics:** win11, intune, forticlient, printer-hp, remote-user`,
    },
    {
      title: 'Canned responses vs personalized responses',
      content: `**Canned responses (macros)** speed up the work, but are **dangerous** when copy-pasting blindly.

**When to use macro:**
- Standard Procedure (SSPR link)
- Request additional information
- Closing with KB instruction
- “We have received your ticket No. XXX”

**When NOT to use macro:**
- The user has already described the problem - did not use generic “describe the problem”
- Emotional/angry user - personal tone
- P1 - each message is unique

**Template: request for information**
> Hello, {{name}}!
>
> For diagnostics, please specify:
> 1. Since when has the problem been observed?
> 2. Does the error appear on all sites or only on corporate ones?
> 3. Connected via cable or Wi‑Fi?
> 4. Attach a screenshot of the error.
>
> Best regards, IT Support

**Template: solved**
> Hello!
>
> We have completed: [description of actions].
> Please restart your computer and check [service].
> If the problem persists, reply to this letter, the ticket will be opened again.
>
> Rate the quality of support using the link below.`,
    },
    {
      title: 'Knowledge Base: creation and support',
      content: `**20 required KB articles for a corporate office:**

1. How to create a ticket in the IT portal
2. Password reset (SSPR)
3. Connect to VPN (FortiClient)
4. Connect to Wi‑Fi Corp (802.1X)
5. Guest Wi‑Fi
6. Setting up Outlook on a new PC
7. Teams - no sound
8. Teams - no video
9. OneDrive - files won't sync
10. Connecting a network printer
11. Clearing the print queue
12. “The computer is slow” - self-help
13. Installation of corporate software (Company Portal)
14. BitLocker recovery key
15. Work from home - checklist
16. New employee - first day
17. Report phishing
18. Lost/theft of laptop
19. Mobile mail (iOS/Android)
20. IT contacts and support hours

**Article format (template):**
- **Symptoms** - what the user sees
- **Reason** - briefly (optional)
- **Solution** — numbered steps + screenshots
- **If it doesn’t help** - create a ticket, indicate category X
- **Related Articles**

**Review cycle:** every 6 months or after a major change (Win11, new VPN).`,
    },
    {
      title: 'Escalation: when, how and information package',
      content: `**Escalate if:**
- No access or rights to fix
- The problem is not solved in 20–30 minutes (L1)
- Requires downtime/change window
- Security incident
- Recurring problem (→ Problem ticket)
- C-level user with P2+
- Vendor involvement needed

**Escalation levels:**
| From | To | Trigger |
|------|-----|---------|
| L1 | L2 | Desktop/AD/Intune scope |
| L1/L2 | L3 | Network, server, firewall |
| Any | Security | Phishing, malware, breach |
| L3 | Vendor | Hardware RMA, bug |

**Escalation package (required fields):**
1. Ticket number and priority
2. Business impact (how many users, who)
3. Timeline: when it started, what changed
4. Steps already taken (checklist)
5. Screenshots, logs, error messages
6. Asset info: hostname, IP, user
7. Urgency justification

**Escalation pattern L1→L3:**
> **Escalation to L3**
> Ticket: #12345, P2
> Issue: 15 users floor 2 no internet, wired + Wi‑Fi
> Started: 10:15 MSK
> L1 checked: single user OK on floor 1, APIPA on floor 2
> Suspect: access switch 2 or trunk
> Switch: SW-F2-01, IP 192.168.99.12
> Need: L3 check switch port/VLAN trunk`,
    },
    {
      title: 'Support metrics: dashboard and review',
      content: `| Metric | Definition | Target value |
|---------|-------------|------------------|
| **Ticket volume** | Tickets created/month | Trend + categories |
| **FRT** | First Response Time | By SLA |
| **MTTR** | Mean Time To Resolve | P3: < 8h business |
| **FCR** | First Contact Resolution | > 65% L1 |
| **CSAT** | Customer satisfaction 1–5 | > 4.2 |
| **SLA %** | % tickets in SLA | >95% |
| **Reopen rate** | Reopened / Total closed | < 8% |
| **Backlog age** | Average age open tickets | < 3 days P3 |
| **Agent utilization** | Tickets/agent/day | Benchmark 15–25 L1 |

**Weekly review agenda (30 min):**
1. P1/P2 incidents - what happened, postmortem needed?
2. SLA breaches — root cause
3. Top 5 categories - KB or training?
4. Reopened tickets — quality issue
5. CSAT outliers - negative feedback
6. Backlog > 7 days — assign owners

**Monthly management report (1 page):**
- Total tickets vs last month
- SLA compliance %
- CSAT average
- Top 3 improvements planned`,
    },
    {
      title: 'Problem Management and Known Errors',
      content: `**Problem ticket** is created when:
- 3+ similar Incidents per month
- Root cause unknown after L3 investigation
- Workaround is available, permanent fix is not available

**Problem workflow:**
\\\`\\\`\\\`
Problem Open → Investigation → Root Cause Identified
    → Known Error (KB workaround) → Change Request → Closed
\\\`\\\`\\\`

**Example:**
- **Incidents:** 12 users «Outlook disconnects every hour»
- **Problem:** #PRB-042 Exchange connectivity
- **Root cause:** Expired cert on load balancer
- **Known Error:** KB «Outlook disconnect» → workaround: restart Outlook
- **Change:** CHG-089 cert renewal Sunday 02:00

**Linking:** Incident tickets link to Problem; when closing Problem - review all linked Incidents.`,
    },
    {
      title: 'Service Requests: standardization and fulfillment',
      content: `**Popular Service Requests:**

| Request | Fulfillment time | Approval |
|---------|------------------|----------|
| New laptop | 5 business days | Manager |
| Software install | 2 business days | Manager + license |
| Shared folder access | 1 business day | Data owner |
| Distribution list | 1 business day | Owner |
| VPN access | 1 business day | Manager |
| Mobile phone | 10 business days | HR + Manager |

**Service catalog in ITSM:**
- Description of the service
- SLA fulfillment (not to be confused with incident SLA)
- Required fields (manager email, business justification)
- Approval workflow
- Automation (Intune app deploy after approval)

**Joiner request (automated checklist):**
- [ ] AD account
- [ ] M365 license
- [ ] Laptop from stock
- [ ] Badge (Facilities)
- [ ] Welcome email with KB links`,
    },
    {
      title: 'Communication during mass incidents',
      content: `**P1 communication plan:**

| Time | Action | Channel |
|-------|----------|-------|
| T+0 | P1 ticket, war room | ITSM + Teams |
| T+15 min | “We know about the problem, we are working” | Email all-staff |
| T+30 min | Status update + ETA if known | Email + Teams |
| Every 30 min | Update until resolved | Email |
| Resolved | “Service restored, reason: X” | Email |
| T+48h | Postmortem summary (internal) | Confluence |

**Status page (optional):** status.company.com - green/yellow/red for Internet, Email, VPN.

**Don’t say:** “we don’t know what to do”
**Say:** “the reason is being determined, next update in 30 minutes”`,
    },
    {
      title: 'CSAT and feedback',
      content: `**CSAT survey** — 1–2 questions after Resolved:
1. Rate support 1–5
2. Comment (optional)

**Analysis:**
- CSAT < 3 → team lead review within 24h, callback user
- Trend down for the month → training, staffing, process issue
- CSAT > 4.5 stable → document what works

**Do not penalize low CSAT** when P1 is outside the agent's control - see context.

**NPS vs CSAT:** NPS “do you recommend IT?” - less often, for annual survey.`,
    },
    {
      title: 'ITSM integration with the ecosystem',
      content: `**Useful integrations:**

| System | Integration | Benefit |
|---------|------------|--------|
| Azure AD / AD | SCIM provisioning agents | Auto user sync |
| Microsoft Teams | Ticket notifications | Alerts to channel |
| Slack | /ticket command | Create from chat |
| Intune | Asset sync | Device in ticket |
| PRTG / monitoring | Auto-create P1 | Proactive support |
| Confluence | KB link | Single source of truth |
| Jira Software | Link dev bugs | Dev ↔ IT |

**Email-to-ticket pitfalls:**
- Loop: auto-reply creates a new ticket → disable on support@ mailbox
- CC hell: one thread = one ticket
- Attachments size limit`,
    },
    {
      title: 'Typical errors in helpdesk processes',
      content: `| Error | Consequence | Fix |
|--------|-------------|-----|
| No single channel | Lost hits | Portal + email only |
| Priority "all P1" | SLA meaningless | Calibration training |
| Closing without resolution notes | Reopen, no audit | Required field |
| KB is outdated | Deflection fails | Review cycle |
| No on-call for P1 | Night outage waits | Rotation |
| Shadow IT in chats | No metrics | Policy: tickets first |

**Maturity levels:**
1. **Chaos** - chats, no SLA
2. **Basic** — ITSM, manual routing
3. **Managed** — SLA, KB, metrics review
4. **Optimized** — automation, proactive, Problem mgmt`,
    },
    {
      title: 'Full SLA document (example 50 users)',
      content: `# SLA — IT Support v2.1
**Company:** Example LLC | **Office:** 50 FTE, Moscow | **Timezone:** MSK

## 1. Scope
Corporate IT services: PC, M365, VPN, Wi‑Fi, printers, accounts, peripherals.

## 2. Service Hours
| Priority | Support hours | On-call |
|----------|---------------|---------|
| P1 | 24×7×365 | L3 rotation |
| P2 | Mon–Fri 08:00–20:00 | L2 extended |
| P3–P4 | Mon–Fri 08:00–20:00 | Business hours |

## 3. SLA Targets
| Priority | Definition | Response | Resolution |
|----------|------------|----------|------------|
| **P1 Critical** | >50% users or business stop | 15 min | 4 h |
| **P2 High** | Key user/dept, no workaround | 30 min | 8 h |
| **P3 Medium** | Single user, workaround exists | 4 h | 24 h |
| **P4 Low** | Service request, minimal impact | 8 h | 72 h |

## 4. Definitions
- **Response:** first meaningful human reply (not auto-ack)
- **Resolution:** status Resolved in ITSM
- **Pause:** Pending (user/vendor) stops SLA clock

## 5. Exclusions
User training, vendor RMA delays, force majeure, unsupported BYOD.

## 6. Escalation
SLA breach → auto-notify team lead → monthly management report.

## 7. Review
Quarterly review with business owner. Sign-off: IT Manager + HR Director.`,
    },
    {
      title: 'CSAT surveys: design and analysis',
      content: `2 questions post-Resolved: 1-5 rating + comment. CSAT<3 → lead callback 24h. Track by agent/category monthly.`,
    },
    {
      title: 'Escalation matrix extended',
      content: `| From | To | Trigger | Max wait |\\n| L1 | L2 | 20min no progress desktop | 30m |\\n| L1 | L3 | Network/multi-user | 15m |\\n| L2 | L3 | Infra change needed | 1h |\\n| Any | Security | Phishing/malware | immediate |\\n| L3 | Vendor | RMA/firmware | per contract |`,
    },
    {
      title: '30 canned responses (Russian)',
      content: `**30 canned responses in Russian (personalize {{name}}, {{ticket}}):**

1. “Hello, {{name}}! We have received your request #{{ticket}}. We are already working, we will be back with an update within {{ETA}}.”
2. “For diagnostics, please send a screenshot of the error and the time when the problem started.”
3. “Try to restart your computer and check again. Report the result in this ticket."
4. “Disable VPN (FortiClient) and check your Internet access. If it helps, reconnect the VPN.”
5. “Password reset: Go to {{SSPR_URL}} or call us after verifying your identity.”
6. “Restart the print service: Win+R → services.msc → Print Spooler → Restart.”
7. “Check Outlook in your browser: {{OWA_URL}}. If the web works, we’ll fix the desktop client.”
8. “In Teams: Settings → Devices - Select the correct microphone and speakers.”
9. “Forget the Corp-WiFi Wi-Fi network and connect again using your domain login and password.”
10. “OneDrive can take up to 24 hours to sync after major changes—this is normal.”
11. “We are waiting for your answer. The ticket will close automatically after 48 hours of inactivity."
12. “Transferred to L2 specialist, expect update within 2 hours.”
13. “**P1:** We are aware of a problem with {{service}}. The team is working. Next update in 30 minutes."
14. “Your request for {{service}} has been approved. Completion time: {{SLA}} business days.”
15. “Software available in Company Portal → Install {{app}}.”
16. “BitLocker recovery key issued after verification. Enter on the loading screen."
17. “The new laptop will be ready in 5 working days. We will notify you about the shipment."
18. “Install Microsoft Authenticator and follow the MFA instructions: {{KB_link}}.”
19. “If you suspect phishing, change your password immediately and notify Security.”
20. “Guest Wi‑Fi: SSID {{Guest}}, password {{pass}}. Internet only, no LAN access."
21. “Free up at least 15 GB on your C: drive for Windows updates.”
22. “For RDP, first connect to the VPN, then {{server}}.”
23. “Access to the folder requires the approval of the data owner - send email approval.”
24. “The account has been disabled due to HR offboarding.”
25. “Welcome! Instructions: {{welcome_KB}}. Day-1 call {{time}}.”
26. “Scheduled update tonight 02:00–04:00. A short interruption of {{service}} is possible.”
27. “The provider has confirmed an accident in {{area}}. Recovery ETA {{time}}."
28. “Rate the quality of support (1–5): {{CSAT_link}} - your opinion is important to us.”
29. “Merged with ticket #{{parent}} - stay tuned there for updates.”
30. “Problem solved: {{fix}}. Please confirm that everything is working."`,
    },
    {
      title: 'Jira workflow JSON (description)',
      content: `States: Open→In Progress→Pending→Resolved→Closed. Transitions gated: Resolve requires resolution field. Automation: P1→Slack #it-alerts; Pending user pauses SLA; Reopen 2x→flag review. Request types map to queues via JQL.`,
      code: {
        language: 'json',
        caption: 'Jira automation snippet',
        code: `{"rules":[{"trigger":"issue_created","condition":"priority=P1","action":"notify_slack"}]}`,
      },
    },
    {
      title: 'KPI dashboard',
      content: `Widgets: Open by priority pie | SLA at risk list | FRT 4-week trend | MTTR by category | CSAT avg | Reopen % | Ticket volume vs last month | Agent utilization | Top 5 categories | Problem backlog.`,
    },
    {
      title: 'Laboratory Helpdesk (16 steps)',
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
      title: 'Extended reference — deep dive',
      content: `**Jira Service Management — automation rules catalog**

| Rule name | Trigger | Condition | Action |
|-----------|---------|-----------|--------|
| Route Network | Created | Category=Network | Assign L3 queue |
| P1 Slack alert | Created | Priority=P1 | Webhook #it-alerts |
| SLA pause user | Updated | Status=Pending user | Pause SLA clocks |
| Auto-close 48h | Scheduled | Resolved >48h | Transition Closed |
| Reopen flag | Updated | Reopen count=2 | Label review-needed |
| VIP notify | Created | Requester in VIP group | Notify manager |

**Zendesk triggers mirror:** same logic with native trigger UI; use tags for routing.

**CSAT program design:**
- Send on Resolved only (not Closed) for fresh memory
- Question 1: 1–5 stars; Question 2: free text optional
- Threshold: ≤2 stars → team lead callback within 24h business
- Monthly report by agent — coaching not punishment
- Exclude P1 vendor outages from individual agent score

**Service catalog — 15 standard requests:**
New laptop, monitor, keyboard/mouse, software install, shared folder, distribution list, VPN access, mobile phone, door badge (Facilities link), parking pass, conference room AV, external guest Wi‑Fi sponsor, Adobe license, SAP access, developer tools exception.

**Approval chains:**
Hardware: Manager → IT → Finance if >€800
Data access: Manager → Data owner → Security if confidential
Software with cost: Manager → Finance → IT deploy

**KB deflection measurement:**
Track portal searches → ticket created ratio. Target: 30% searches don't become tickets. A/B test KB titles.

**SLA reporting pack (monthly PDF):**
Page 1 executive summary; Page 2 SLA% by priority chart; Page 3 top categories; Page 4 action plan.

**Ticket quality audit checklist (10 points):**
Category correct, priority justified, asset filled, steps documented, resolution notes, KB linked, CSAT sent, time appropriate, no duplicate, user confirmed.

**Major incident comms — full email set:**
T+0 acknowledge; T+30 investigation; T+60 workaround if any; Resolved root cause brief; T+48h internal postmortem summary.

**OLA between teams example:**
L1→L2 desktop: acknowledge 30 min, resolve or escalate 4h business. L2→L3 network: acknowledge 15 min P1.

**Integration architecture:**
AD→ITSM user sync SCIM; Intune→asset sync; PRTG→auto P1 ticket on WAN down; Teams bot create ticket.

**Knowledge-Centered Service (KCS):**
Agents create KB from tickets; flag article if used in resolution; retire outdated quarterly.

**Shift scheduling 50-user office:**
2 L1 overlapping 08–17; L2 09–18; L3 on-call rotation weekly; holiday coverage plan documented Nov each year.

**Ticket tagging strategy:**
Tags: recurring, training-needed, vendor-waiting, security, project-x — enables reporting.

**Breached SLA root cause categories:**
Understaffed, wrong priority, awaiting user, vendor delay, complex unknown — track monthly.

**Request fulfillment Kanban:**
Backlog → Approved → In progress → User verify → Done. WIP limit 5 per L2.

**Email-to-ticket hygiene:**
Disable autoreply on support@; strip signatures; merge CC threads; attachment virus scan.

**HDI/support metrics benchmarks:**
FCR 65–75% L1; CSAT 4.2+; reopen <8%; SLA >95% P3+.

**Problem ticket template fields:**
Linked incidents, impact count, root cause hypothesis, workaround, permanent fix change #, owner.

**Customer recovery after bad CSAT:**
Lead calls user within 24h; acknowledge; explain; offer follow-up; document in ticket — often converts 2→4 stars.`,
    },
    {
      title: 'Extended reference — deep dive',
      content: `Additional operational notes: document every change; test backups quarterly; maintain spares; train successors; review firewall rules semi-annual; validate contact lists emergency; keep ISP account numbers handy; label everything; photo document rack; run tabletop drills; measure twice cut once on IP plan; never expand scope without change ticket; communicate early often; sleep during long P1 only after handover; celebrate wins with team; learn from every breach SLA; automate repetitive; read release notes firmware; respect maintenance windows; keep lab environment; certify skills yearly; mentor juniors; ask when unsure not guess production.Additional operational notes: document every change; test backups quarterly; maintain spares; train successors; review firewall rules semi-annual; validate contact lists emergency; keep ISP account numbers handy; label everything; photo document rack; run tabletop drills; measure twice cut once on IP plan; never expand scope without change ticket; communicate early often; sleep during long P1 only after handover; celebrate wins with team; learn from every breach SLA; automate repetitive; read release notes firmware; respect maintenance windows; keep lab environment; certify skills yearly; mentor juniors; ask when unsure not guess production.Additional operational notes: document every change; test backups quarterly; maintain spares; train successors; review firewall rules semi-annual; validate contact lists emergency; keep ISP account numbers handy; label everything; photo document rack; run tabletop drills; measure twice cut once on IP plan; never expand scope without change ticket; communicate early often; sleep during long P1 only after handover; celebrate wins with team; learn from every breach SLA; automate repetitive; read release notes firmware; respect maintenance windows; keep lab environment; certify skills yearly; mentor juniors; ask when unsure not guess production.`,
    },
    {
      title: 'Chapter Summary',
      content: `1. **Life cycle** - New → Resolved → Closed with clear statuses
2. **Priorities** - Impact × Urgency, not “who is screaming”
3. **SLA** – different for 10/50/100 users, response ≠ resolution
4. **JSM / Zendesk** — queues, automation, portal, KB
5. **Escalation** - package with impact, steps, logs
6. **KB** — 20 articles minimum, deflection, review cycle
7. **Metrics** – FRT, MTTR, CSAT, reopen – weekly review
8. **P1 comms** — update every 30 min

> Next chapter: **Workstation Support** - Windows 11, Outlook, Teams, Intune.`,
    },
  ],
  practice: [
    'SLA document v1 for 50 users - full table',
    '30 canned responses adapt to the company',
    'Jira SM: 5 automation rules',
    'CSAT survey 2 questions draft',
    'Escalation matrix 10 rows',
    'KPI dashboard mock Excel 6 charts',
    'P1 comms email 3 updates timeline',
    'Problem ticket VPN workflow',
    'Service catalog 10 requests',
    'KB deflection measure baseline',
    'SLA breach tabletop retro',
    'Zendesk vs Jira 1-page comparison',
    'Monthly mgmt report template',
    'Queue routing JQL 4 queues',
    'Integration map AD+Teams+Intune',
  ],
  resources: [
    { title: 'Jira Service Management', url: 'https://www.atlassian.com/software/jira/service-management' },
    { title: 'Zendesk IT', url: 'https://www.zendesk.com/service/help-center/it-knowledge-base/' },
    { title: 'ITIL Service Desk', url: 'https://www.axelos.com/best-practice-solutions/itil' },
    { title: 'HDI KPIs', url: 'https://www.thinkhdi.com/' },
    { title: 'Freshservice', url: 'https://www.freshworks.com/freshservice/' },
    { title: 'Atlassian Automation', url: 'https://www.atlassian.com/software/jira/automation' },
  ],
  quiz: [
    {
      question: 'P1 Critical - example:',
      options: ['Whole office without internet', 'One user forgot his password', 'Mouse request'],
      answer: 'Whole office without internet',
    },
    {
      question: 'SLA Response Time is:',
      options: ['Time until first response', 'Time until retirement', 'Hardware delivery time'],
      answer: 'Time until first response',
    },
    {
      question: 'Knowledge Base helps:',
      options: ['Reduce duplicate tickets', 'Remove AD', 'Disable VPN'],
      answer: 'Reduce duplicate tickets',
    },
    {
      question: 'Escalation should include:',
      options: ['What we have already tried and business impact', 'It just doesn\'t work', 'Nothing'],
      answer: 'What we have already tried and business impact',
    },
    {
      question: 'Reopen rate shows:',
      options: ['% of tickets reopened', 'Internet speed', 'PoE budget'],
      answer: '% of tickets reopened',
    },
    {
      question: 'Pending (user) status when:',
      options: ['We are waiting for the user\'s response', 'Problem solved', 'P1 closed'],
      answer: 'We are waiting for the user\'s response',
    },
  ],
}

export default translation
