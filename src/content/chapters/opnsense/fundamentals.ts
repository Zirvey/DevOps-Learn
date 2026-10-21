import type { Chapter } from '../../../types'

export const opnsenseFundamentalsChapter: Chapter = {
  id: 'opnsense-fundamentals',
  slug: 'opnsense-fundamentals',
  title: 'OPNsense — основы платформы',
  moduleId: 'opnsense',
  order: 0,
  duration: '8–10 часов',
  level: 'intermediate',
  description:
    'Экосистема OPNsense, редакции и релизы, sizing, установка ISO/VM (Proxmox, ESXi, Hyper-V), wizard первого запуска, интерфейсы (WAN/LAN/OPT/VLAN/bridge/LAGG), статические маршруты и gateways, Multi-WAN, DHCP/Unbound, администрирование (users/2FA/SSH), пакеты, обновления, сертификаты, NTP, логи, REST API, backup config.xml, hardening и troubleshooting связности',
  sections: [
    {
      title: 'OPNsense в экосистеме: от pfSense к open-source NGFW',
      content: `**OPNsense** — open-source платформа сетевой безопасности на базе FreeBSD и **pf** (packet filter). Проект появился в 2014 году как fork pfSense после споров вокруг коммерциализации; сегодня это полноценная альтернатива коммерческим NGFW для SMB, MSP и homelab.

**Что OPNsense даёт «из коробки»:**
- Stateful firewall с гранулярными правилами
- NAT (outbound, port forward, 1:1)
- Multi-WAN, failover, load balancing
- DHCP, DNS (Unbound), captive portal
- VPN: WireGuard, OpenVPN, IPsec
- Плагины: Suricata IDS/IPS, Zenarmor, HAProxy, ACME, Zabbix agent
- Web UI + SSH/CLI, REST API (частично)

**Сравнение с pfSense:**

| Критерий | OPNsense | pfSense |
|----------|----------|---------|
| Лицензия | BSD, community-driven | pfSense CE / Plus (коммерческая ветка) |
| UI/UX | Современный, модульный | Классический, богатый |
| Обновления | Регулярные, прозрачный roadmap | CE vs Plus — разные feature sets |
| Плагины | os-* packages в репозитории | Packages + Plus-only features |
| API | Растущий REST API | Limited в CE |

**Сравнение с FortiGate (SMB контекст):**

| Критерий | OPNsense | FortiGate |
|----------|----------|-----------|
| Стоимость | Без лицензии на базовый firewall | Железо + FortiGuard подписки |
| UTM depth | Suricata/Zenarmor — хорошо, но не tier-1 | IPS/AV/App Control enterprise-grade |
| Security Fabric | Нет единой экосистемы switch/AP | FortiLink, FortiAP, FortiSwitch |
| Support | Community + коммерческие партнёры | FortiCare SLA |
| Throughput | Зависит от CPU/VM, без ASIC offload | ASIC acceleration на моделях FG |

**Когда выбирать OPNsense:**
- Нужен полный контроль, без vendor lock-in и подписок на базовый firewall
- MSP с white-label CPE на VM или белом железе
- Lab, branch office, remote site с WireGuard
- Бюджет ограничен, но нужны IDS, VPN, multi-WAN

**Когда FortiGate/pfSense Plus:**
- Нужен enterprise support SLA и единый стек Wi-Fi/switch
- SSL inspection на высоком throughput с hardware offload
- Compliance требует сертифицированного NGFW vendor

**Архитектурные принципы OPNsense:**
- **L3 routing first** — каждый logical interface = subnet gateway
- **Ingress firewall** — rules на входящий трафик per interface
- **Stateful pf** — return traffic через state table
- **config.xml** — single source of truth для backup/DR
- **Plugin model** — os-* packages без fork core

**Типовые роли в SMB IT:**
| Роль | Задачи на OPNsense |
|------|-------------------|
| Network admin | Interfaces, VLAN, routing, Multi-WAN |
| Security admin | Policies (глава Policies), IDS, hardening |
| MSP NOC | Monitoring, backup, firmware cadence |
| DevOps | REST API, config.xml GitOps |

**Документация:** docs.opnsense.org — primary reference; forum для edge cases; Deciso commercial support для SLA contracts.`,
    },
    {
      title: 'Установка: ISO, VM и первый запуск',
      content: `**Варианты развёртывания:**

| Метод | Сценарий |
|-------|----------|
| **ISO на bare metal** | Физический appliance, whitebox 1U |
| **VMware / Proxmox / Hyper-V** | Центральный firewall в DC |
| **KVM / QEMU** | Lab, cloud edge |
| **AWS/Azure** (community images) | Cloud VPN hub |

**Минимальные ресурсы (lab / малый офис до 30 users):**
- 2 vCPU, 2–4 GB RAM, 20 GB disk
- 2+ network interfaces (WAN + LAN) — критично для routing mode

**Процесс установки с ISO:**
1. Скачай ISO с [opnsense.org/download](https://opnsense.org/download/)
2. Создай VM: UEFI или BIOS, VirtIO NIC (Proxmox) или e1000 (совместимость)
3. Boot ISO → **Install (UFS)** или ZFS для production
4. Assign interfaces: WAN, LAN, OPT (опционально)
5. Задай LAN IP (default часто 192.168.1.1/24)
6. Открой \`https://192.168.1.1\` → login \`root\` / пароль из установки

**Proxmox типовая схема:**
\`\`\`
vmbr0 (WAN) ──► net0 OPNsense
vmbr1 (LAN) ──► net1 OPNsense
\`\`\`

**После установки — чеклист:**
1. Смени пароль root и создай отдельного admin user (не root для UI)
2. **System → Settings → General:** hostname, timezone, language
3. **System → Firmware → Updates:** обнови до stable latest
4. Настрой WAN (DHCP/static/PPPoE)
5. Проверь internet с LAN: Diagnostics → Ping 1.1.1.1
6. Ограничь GUI access: System → Access → Users → disable root login в UI
7. Включи SSH только с Management subnet
8. Сделай первый backup config.xml

**Factory / recovery:** консоль → option 8) Shell → \`opnsense-shell\` для меню. Полный reset: reinstall или restore config.xml.

**UFS vs ZFS quick reference:**

| | UFS | ZFS |
|---|-----|-----|
| VM lab | ✅ Standard | Optional overhead |
| Bare metal single disk | OK | — |
| Bare metal production | OK | ✅ Mirror recommended |
| Boot environments | No | Yes snapshots |

**USB install:** \`dd if=OPNsense-*.iso of=/dev/sdX bs=4M status=progress\` — verify disk target twice.

**Post-install network order:** assign WAN first → set LAN IP → GUI from LAN → configure WAN DHCP/static → test ping upstream.

**Lab tip:** snapshot hypervisor VM immediately after install as \`clean-install\` before any policy changes.`,
      code: {
        language: 'shell',
        caption: 'Консоль OPNsense: проверка интерфейсов и версии',
        code: `# из SSH или shell
opnsense-version
ifconfig -a
netstat -rn

# ping с указанием source interface (LAN)
ping -S 192.168.1.1 1.1.1.1`,
      },
    },
    {
      title: 'Редакции, релизы и модель обновлений',
      content: `**OPNsense — одна основная редакция:** community open-source. Нет «Plus» tier с закрытыми core features (в отличие от pfSense). Коммерческая поддержка — через Deciso и партнёров.

**Ветки релизов:**

| Ветка | Назначение | Production? |
|-------|------------|-------------|
| **stable** | Текущий production release | ✅ Да |
| **business** | Preview следующего stable | ⚠️ Lab only |
| **devel** | Development snapshots | ❌ Нет |

**Номер версии:** \`YY.MM\` (например 24.7). Major каждые ~6 месяцев.

**Где смотреть:** opnsense.org/releases, System → Firmware → Status, \`opnsense-version\` на shell.

**Модель обновлений:**
1. Core firmware — System → Firmware → Updates
2. Plugins — отдельно после core
3. FreeBSD base — bundled в firmware

**Best practice SMB:** monthly maintenance window, backup config.xml + VM snapshot pre-update, smoke test WAN/DNS/SSH после reboot.

**Downgrade:** не рекомендуется — restore snapshot или reinstall + config restore.

**Long-term support:** каждая серия ~12 months — планируй upgrade до EOL.`,
      code: {
        language: 'shell',
        caption: 'Проверка версии и плагинов',
        code: `opnsense-version
pkg info opnsense
opnsense-update -c
pkg query '%n' | grep '^os-' | sort`,
      },
    },
    {
      title: 'Hardware sizing: bare metal и виртуализация',
      content: `OPNsense не имеет ASIC offload — **CPU и NIC** определяют throughput. Sizing — по lab test и monitoring, не по «брошюрным» цифрам.

| Сценарий | Users | vCPU | RAM | Disk |
|----------|-------|------|-----|------|
| Homelab | 1–5 | 2 | 2 GB | 20 GB |
| Малый офис | 10–30 | 2–4 | 4 GB | 32 GB |
| SMB 50 users | 30–60 | 4 | 8 GB | 64 GB |
| SMB + Suricata IPS | 50+ | 4–8 | 16 GB | 128 GB |

**Bare metal:** Intel/AMD с AES-NI; NIC Intel i210/igb; SSD; ZFS mirror для production.

**VM rule:** 4 vCPU / 8 GB для production SMB; monitor CPU при Suricata/VPN peak.

**Concurrent sessions:** \`pfctl -s info\` — state table на 8 GB RAM типично 500K–2M states.

**Red flags:** CPU > 70% sustained, Suricata drops, VPN throughput < 50% expected.`,
      code: {
        language: 'shell',
        caption: 'Мониторинг загрузки и state table',
        code: `top -b -n 1 | head -15
pfctl -s info
netstat -ibn`,
      },
    },
    {
      title: 'Установка на Proxmox VE',
      content: `**Proxmox** — популярный homelab и MSP DC выбор.

**VM:** 4 vCPU, 8 GB RAM, 32 GB VirtIO disk, UEFI q35, 2+ VirtIO NIC.

**Bridges:**
\`\`\`
vmbr0 (WAN) → net0
vmbr1 (LAN) → net1 trunk
vmbr2 (MGMT) → net2 optional
\`\`\`

Attach ISO → Install UFS → remove ISO. Snapshot перед каждым update.

**Proxmox FW на WAN bridge:** often disable — OPNsense is the firewall.

**PCI passthrough:** dedicated Intel NIC если VirtIO insufficient — advanced.`,
      code: {
        language: 'shell',
        caption: 'Proxmox CLI: создание VM (reference)',
        code: `qm create 200 --name opnsense-hq --memory 8192 --cores 4 \\
  --net0 virtio,bridge=vmbr0 --net1 virtio,bridge=vmbr1 \\
  --scsihw virtio-scsi-pci --scsi0 local-lvm:32 \\
  --ostype l26 --bios ovmf --machine q35`,
      },
    },
    {
      title: 'Установка на VMware ESXi / vSphere',
      content: `**ESXi deploy:** Other Linux 6.x 64-bit, 4 vCPU, 8 GB, 32 GB thin, **VMXNET3** NICs.

| vNIC | Port Group | Role |
|------|------------|------|
| vmnic0 | WAN-PG | ISP |
| vmnic1 | LAN-PG | Trunk VLANs |
| vmnic2 | MGMT-PG | Admin |

VMXNET3 not E1000. Promiscuous mode **не нужен** для routing mode.

**vSphere HA:** CARP pair — anti-affinity rule, migrate one node at a time.

**Backup:** Veeam/snapshot + config.xml export.`,
    },
    {
      title: 'Установка на Microsoft Hyper-V',
      content: `**Gen2 VM**, 4–8 GB RAM, Synthetic NICs, **Secure Boot Off** (critical).

**Switches:** External (WAN), Internal (LAN), Private (lab).

Gen2 + Secure Boot disabled для FreeBSD ISO boot.

**Common issues:** won't boot ISO → disable Secure Boot; poor perf → add vCPU AES-NI.`,
    },
    {
      title: 'First boot wizard и консольное меню',
      content: `**Console menu** — out-of-band lifeline.

| Option | Действие |
|--------|----------|
| 1 Assign interfaces | WAN/LAN/OPT |
| 2 Set interface IP | LAN IP |
| 8 Shell | root shell |
| 13 Restore config.xml | DR |

**GUI wizard:** language, hostname, WAN, LAN, password reminder.

\`opnsense-shell\` из shell возвращает в menu. Serial 115200 для IPMI.`,
    },
    {
      title: 'Первый запуск и post-install чеклист',
      content: `**Чеклист SMB:**
1. Root password 16+ chars
2. Hostname, timezone, NTP
3. Firmware update stable
4. WAN DHCP/static
5. Ping 1.1.1.1 Diagnostics
6. Admin user + 2FA, disable root GUI
7. SSH keys, Mgmt VLAN only
8. Backup config.xml
9. Anti-lockout: console open при LAN changes

Smoke: LAN client internet, DNS, NTP \`ntpq -p\`.`,
    },
    {
      title: 'VLAN: сегментация на trunk',
      content: `**VLAN create:** Other Types → VLAN → parent igb1 tag 10 → Assignments → Enable IP .1/24.

**Switch trunk:** allowed VLANs 10,20,60,99 must match.

| VLAN | Subnet | Use |
|------|--------|-----|
| 10 | 192.168.10.0/24 | Servers |
| 20 | 192.168.20.0/24 | Users |
| 60 | 192.168.60.0/24 | Guest |
| 99 | 192.168.99.0/24 | Mgmt |

Inter-VLAN routing on OPNsense — firewall rules per VLAN ingress (глава Policies).`,
    },
    {
      title: 'Bridge и LAGG (802.3ad)',
      content: `**LAGG LACP** — dual uplink к switch, match port-channel both ends.

**Bridge** — transparent L2 (rare); routing+VLAN default для SMB.

LAGG: Interfaces → Other Types → LAGG → LACP members.

Mismatch \`laggproto\` → flapping links.`,
    },
    {
      title: 'Static routes и gateways',
      content: `**System → Routes → Configuration.** Default via WAN gateway.

**Use cases:** remote site 192.168.50.0/24 via 192.168.10.254; VPN routes; blackhole.

**Gateways:** System → Gateways — monitor IP 1.1.1.1 for health.

**Diagnostics:** Diagnostics → Routes, \`netstat -rn\`, traceroute with source IF.`,
      code: {
        language: 'shell',
        caption: 'CLI routing table',
        code: `netstat -rn
netstat -rn -f inet | grep '^default'
traceroute -s 192.168.20.1 8.8.8.8`,
      },
    },
    {
      title: 'Multi-WAN: обзор failover и load balancing',
      content: `**Components:** WAN2 OPT, per-WAN gateways, gateway group failover/load balance, outbound NAT (глава NAT).

**Failover:** Tier1 fiber + Tier2 LTE, monitor 1.1.1.1+8.8.8.8, unplug WAN1 test <30s.

**Not LAGG:** Multi-WAN = different ISP paths/IPs.

**VPN:** primary WAN endpoint; backup needs DDNS/second peer.

**CARP HA** — отдельная глава Operations.

**Gateway group setup (overview):**
1. System → Gateways → Add WAN1, WAN2 with monitor IPs
2. Groups → Failover Tier1 WAN1, Tier2 WAN2
3. System → Routes → Default → select failover group
4. Test unplug WAN1 — verify default shifts < 30 sec
5. Document monthly failover test in runbook

**Load balance:** weights 50/50 only if policy allows asymmetric paths; failover safer for typical SMB.`,
    },
    {
      title: 'Администраторы: users, roles и 2FA',
      content: `**Users:** System → Access → Users. Groups admins vs read-only.

**2FA TOTP:** user token QR → Administration Backend Local+2FA.

**API keys** per automation script. RADIUS+privacyIDEA for enterprise MFA.

No shared \`admin\` account. Break-glass root password in vault.`,
    },
    {
      title: 'SSH, SCP и консольный доступ',
      content: `**SSH:** key-only, PermitRootLogin no, listen Mgmt VLAN.

\`ssh-copy-id\` deploy key → disable password auth.

SCP backup: \`scp user@fw:/conf/config.xml ./backup-$(date +%F).xml\`

Bastion jump host — never SSH on WAN.`,
      code: {
        language: 'shell',
        caption: 'SSH key deploy и SCP backup',
        code: `ssh-copy-id -i ~/.ssh/id_ed25519.pub netadmin@192.168.99.1
ssh -o PasswordAuthentication=no netadmin@192.168.99.1 opnsense-version
scp netadmin@192.168.99.1:/conf/config.xml ./opnsense-backup-$(date +%Y%m%d).xml`,
      },
    },
    {
      title: 'Обзор пакетов (os-* plugins)',
      content: `**Install:** System → Firmware → Plugins.

| Plugin | Use |
|--------|-----|
| os-suricata | IDS/IPS |
| os-wireguard | VPN |
| os-acme-client | Let's Encrypt |
| os-zabbix-agent | Monitoring |
| os-haproxy | LB/reverse proxy |

Update plugins after core firmware. \`pluginctl -s suricata\` status.`,
    },
    {
      title: 'Firmware updates и plugin lifecycle',
      content: `**Workflow:** read release notes → backup + snapshot → update core → reboot → update plugins → smoke test.

Console: \`opnsense-update\` + reboot.

Rollback: VM snapshot fastest. No auto-update on production without staging.`,
    },
    {
      title: 'Сертификаты: введение (CA, GUI, ACME)',
      content: `**System → Trust:** Internal CA → server cert → Administration SSL cert.

**ACME** os-acme-client: HTTP-01 or DNS-01 for \`vpn.office.com\`.

TLS 1.2+ only. Track expiry — Monit alert.`,
      code: {
        language: 'shell',
        caption: 'Проверка GUI certificate',
        code: `openssl s_client -connect 192.168.99.1:443 -servername opnsense.local </dev/null 2>/dev/null \\
  | openssl x509 -noout -subject -dates`,
      },
    },
    {
      title: 'NTP и системное время',
      content: `**Critical for:** VPN IKE, TLS, TOTP 2FA, SIEM correlation.

System → Settings → General: timezone, \`pool.ntp.org\`.

Verify \`ntpq -p\` — synced peer marked with asterisk.

Wrong time → 2FA mysterious failures.`,
    },
    {
      title: 'Logging: основы и forwarding',
      content: `**Sources:** Firewall Live View, System log, DHCP, Unbound, Auth logins.

**Remote syslog** to Graylog/Wazuh. Log deny rules; careful logging all pass — disk fill.

CLI: \`clog -f /var/log/filter\`. SIEM retention 90d hot.`,
      code: {
        language: 'shell',
        caption: 'Firewall log и rule counters',
        code: `clog -f /var/log/filter | grep 192.168.20.50
pfctl -vvsr
pfctl -z`,
      },
    },
    {
      title: 'REST API: введение и automation',
      content: `**Base:** \`https://fw/api/\` — API key auth Basic key:secret.

Read firmware status, download config, list interfaces — automation/GitOps.

Never commit secrets. Test lab before write API calls.

Docs: docs.opnsense.org/development/api.html`,
      code: {
        language: 'shell',
        caption: 'REST API curl examples',
        code: `OPNSENSE_HOST="192.168.99.1"
API_KEY="your-api-key"
API_SECRET="your-api-secret"
curl -sk -u "\${API_KEY}:\${API_SECRET}" \\
  "https://\${OPNSENSE_HOST}/api/core/firmware/status"
curl -sk -u "\${API_KEY}:\${API_SECRET}" \\
  -o config-backup.xml \\
  "https://\${OPNSENSE_HOST}/api/core/backup/download/backup" `,
      },
    },
    {
      title: 'Security hardening checklist',
      content: `**Access:** admin users, 2FA, SSH keys Mgmt only, HTTPS GUI Mgmt only.

**Network:** WAN default deny, inter-VLAN deny default, disable unused IF.

**Ops:** NTP, DNSSEC Unbound, daily encrypted backup, monthly updates, syslog SIEM.

**Advanced:** IDS after tune (глава Services), VPN MFA (глава VPN).`,
    },
    {
      title: 'Lab setup: топология homelab и MSP staging',
      content: `**Topology:** WAN sim ← OPNsense ← LAN trunk → VLAN VMs.

Proxmox vmbr0 NAT WAN sim best for homelab.

Document IP plan, snapshots \`clean-baseline\`, \`post-vlan\`.

MSP: clone prod config → sanitize → lab test → change window.`,
    },
    {
      title: 'Production case study 1: миграция SOHO → OPNsense SMB',
      content: `**Клиент:** дизайн-студия 28 чел., flat network, guest Wi-Fi reached file server.

**Решение:** OPNsense VM Proxmox, VLAN10/20/60/99, Unbound, WireGuard 8 users, Suricata IDS WAN, daily SFTP backup.

**Result:** guest isolated, zero license 3yr TCO vs FortiGate, Suricata caught C2 month 2.

**Lesson:** keep ISP router 1 week emergency bypass.`,
    },
    {
      title: 'Production case study 2: branch Multi-WAN + Zabbix',
      content: `**Клиент:** логистика branch 40 users, internet SLA critical.

**Решение:** bare metal whitebox, fiber+LTE failover, os-zabbix-agent → HQ NOC, SSH только via WireGuard.

Failover fiber unplug → LTE 18 sec. MSP manages 12 sites via API backup script.

**Trade-off:** engineer hours vs FortiGate license cost.`,
    },
    {
      title: 'FAQ: 14 частых вопросов (Fundamentals)',
      content: `**1. OPNsense vs pfSense 2025?** UI/plugins preference; OPNsense BSD community, pfSense Plus commercial.

**2. License for production?** No for core firewall.

**3. RAM for 50 users?** 8 GB min, 16 GB with Suricata IPS.

**4. Wi-Fi controller?** No — use UniFi/Omada APs.

**5. DHCP OPNsense vs DC?** AD → DC DHCP often better.

**6. Update without downtime?** CARP HA; single node maintenance window.

**7. config.xml secrets?** Yes — encrypt backups.

**8. Root GUI?** Lab OK; production disable.

**9. No internet LAN?** Gateway, default route, NAT (глава NAT), DNS vs \`ping 1.1.1.1\`.

**10. VirtIO Proxmox?** Best perf; em fallback.

**11. ZFS vs UFS?** ZFS mirror prod bare metal; UFS VM.

**12. API vs SSH backup?** Both OK scheduled.

**13. Downgrade firmware?** Snapshot restore preferred.

**14. IPv6 mandatory?** No for typical SMB IPv4-only.

**15. Где учиться после Fundamentals?** Policies (firewall/NAT), VPN, Services (Suricata), Operations (HA/CARP).

**16. Можно ли GUI на WAN?** Нет для production — Mgmt VLAN + VPN jump only.

**17. Какой hypervisor для lab?** Proxmox (vmbr NAT WAN) или VMware Workstation — fastest onboarding.

**18. config.xml в git?** Private repo + encryption; treat as secrets bundle.`,
    },
    {
      title: 'Interview Q&A: 10 вопросов (Fundamentals)',
      content: `**Q1:** OPNsense vs Linux iptables? Purpose-built FreeBSD pf + UI + config.xml.

**Q2:** Why pfSense fork? 2014 commercialization; Deciso BSD model.

**Q3:** Sizing? Throughput, Suricata, VPN, sessions — lab test 70% CPU rule.

**Q4:** config.xml? Single XML all settings backup/restore.

**Q5:** WAN vs LAN vs OPT? Naming; OPT=extra routed IF.

**Q6:** Limit admin? Mgmt VLAN listen, 2FA, SSH keys.

**Q7:** Multi-WAN failover? Gateway groups + monitor IPs.

**Q8:** Unbound vs ISP DNS? DNSSEC, overrides, DHCP register.

**Q9:** No internet first steps? Gateway status, default route, ping 1.1.1.1.

**Q10:** CARP when? Sub-minute HA two-node + pfsync.`,
    },
    {
      title: 'Лабораторная: полная первичная настройка с нуля',
      content: `**Цель:** VM + VLAN + DHCP + Unbound + hardening + backup.

1. VM 4vCPU/8GB/3NIC install UFS
2. Firmware update, hostname \`opnsense-lab01\`
3. VLAN10/20/60 on LAN parent
4. DHCP VLAN20/60, Unbound all VLANs
5. Admin \`netadmin\` + 2FA, SSH keys Mgmt
6. Baseline firewall (глава Policies): Guest deny RFC1918
7. Tests: VLAN20 internet, VLAN60 no VLAN10, SSH WAN blocked
8. Backup config.xml, snapshot \`baseline-v1\`

**Acceptance table documented in lab journal.`,
    },
    {
      title: 'Интерфейсы: WAN, LAN, OPT и VLAN',
      content: `OPNsense работает как **L3 router + firewall**. Каждый logical interface участвует в routing table и firewall rule matching.

**Типы интерфейсов:**

| Тип | Примеры | Назначение |
|-----|---------|------------|
| **Physical** | igb0, vtnet0 | WAN uplink, trunk к switch |
| **LAN** | lan | Внутренняя сеть (assigned) |
| **OPT** | opt1, opt2 | DMZ, Guest, второй WAN |
| **VLAN** | vlan0.10 | Сегментация на trunk |
| **Bridge** | bridge0 | L2 bridge (редко в routing mode) |
| **Tunnel** | wg0, ovpns1 | VPN endpoints |

**WAN configuration:**
- **Interfaces → Assignments:** назначь physical port как WAN
- **Interfaces → [WAN]:** Enable, IPv4 DHCP/Static/PPPoE
- Block private networks на WAN — **включи** (не принимать 10.x с ISP)
- Block bogon networks — **включи**

**Типовая топология SMB (50 users):**
\`\`\`
WAN (igb0)     → ISP DHCP / static
LAN (igb1)     → trunk к core switch
  VLAN10 Servers    192.168.10.1/24
  VLAN20 Users      192.168.20.1/24
  VLAN60 Guest      192.168.60.1/24
  VLAN99 Mgmt       192.168.99.1/24
OPT1 (igb2)    → DMZ (web server)
\`\`\`

**VLAN на OPNsense:**
1. Interfaces → Other Types → VLAN → Parent = LAN physical, tag 10
2. Interfaces → Assignments → Add vlan0.10 → Enable
3. Задай IP, subnet — это gateway для VLAN

**OPT vs LAN:** технически идентичны; различие в default firewall rules (LAN often has «allow all out» на fresh install). Для Guest/DMZ создавай отдельный OPT/VLAN с deny inter-VLAN по умолчанию.

**IPv6:** поддерживается (DHCPv6-PD, static). Для SMB часто IPv4-only; если PD с ISP — настрой отдельные rules для v6.`,
    },
    {
      title: 'Firewall rules: порядок, states и best practices',
      content: `**Firewall rules** — ingress matching на каждом interface, first match wins. Stateful pf создаёт state на Pass.

Ключевые темы (полный разбор — глава **OPNsense — firewall, NAT и политики**):
- Interface vs Floating rules
- Pass/Block/Reject, direction in
- Rule order, aliases, schedules
- Guest VLAN deny RFC1918 pattern
- Diagnostics: \`pfctl -vvsr\`, Live View log

**Здесь:** помни, что без explicit rule трафик blocked (implicit deny). После VLAN setup — rules на каждом segment ingress.`,
      code: {
        language: 'shell',
        caption: 'pfctl: просмотр активных правил и счётчиков',
        code: `# все правила с номерами и hits
pfctl -vvsr

# правила для конкретного interface
pfctl -a 'lan' -vvsr

# таблица states (активные сессии)
pfctl -s state | head -20

# статистика по правилам
pfctl -s info`,
      },
    },
    {
      title: 'NAT: outbound, port forwarding и reflection',
      content: `**NAT** — Firewall → NAT. Outbound SNAT automatic для LAN; port forward требует associated filter rule.

Детали outbound/hybrid, 1:1, hairpin, Multi-WAN NAT — глава **firewall, NAT и политики**.

**Troubleshooting hint:** NAT works but timeout = missing WAN pass rule.`,
    },
    {
      title: 'Aliases, schedules и организация политик',
      content: `**Aliases** — именованные Host/Network/Port/URL объекты для rules. Schedules — time windows.

Полный tiered access pattern, GeoIP, URL feeds — глава **firewall, NAT и политики**.

Naming: \`HOST_\`, \`NET_\`, \`PORT_\` prefixes для audit.`,
    },
    {
      title: 'DHCP и DNS (Unbound)',
      content: `**DHCP server:** Services → ISC DHCPv4 → LAN (или per-VLAN interface).

**Типовая настройка VLAN Users:**
- Enable DHCP on \`vlan0.20\`
- Range: 192.168.20.100 – 192.168.20.200
- Gateway: 192.168.20.1 (IP interface)
- DNS servers: 192.168.20.1 (Unbound на OPNsense) или internal DC
- Domain: office.local

**Static mappings:** MAC → fixed IP для printers, AP, servers.

**DHCP relay:** если DHCP на Windows DC — на OPNsense disable local DHCP, настроь helper на switch или relay на DC subnet.

**Unbound DNS (Services → Unbound DNS):**
- Enable на LAN interfaces
- **Register DHCP leases** — local hostname resolution
- **DNS over TLS** upstream (optional privacy): Cloudflare, Quad9
- **Split horizon:** host overrides для internal names

\`\`\`
Host override:
  app.office.local → 192.168.10.50
  vpn.office.local → WAN public IP (для external users)
\`\`\`

**DNS security:**
- Block DNS over HTTPS bypass — firewall rule block known DoH providers (или policy на clients)
- DNS sinkhole через Unbound + blocklist plugin

**Troubleshooting DNS:**
- Diagnostics → DNS Lookup
- \`unbound-control status\` на shell
- tcpdump port 53 на LAN

**Integration с AD:** DC как DNS for domain; OPNsense Unbound forward office.local → DC IP, остальное recursive.`,
    },
    {
      title: 'VPN: WireGuard и OpenVPN',
      content: `**VPN на OPNsense** — tunnel interfaces (wg0, ovpns1) + routes + firewall.

WireGuard road warrior, site-to-site, OpenVPN, IPsec, MFA, split tunnel — глава **OPNsense — VPN**.

**Fundamentals scope:** убедись что WAN UDP 51820 (WG) или 1194 (OVPN) allowed если VPN termination на OPNsense.`,
    },
    {
      title: 'IDS/IPS: пакет Suricata',
      content: `**Suricata** (\`os-suricata\`) — IDS/IPS plugin. Установка через System → Firmware → Plugins.

IDS alert mode → tune → IPS. CPU hungry на >500 Mbps. Альтернатива: Zenarmor (L7).

Операционный tuning и SOC workflow — глава **Services** и **Operations**. Здесь: учитывай Suricata в sizing RAM/CPU.`,
    },
    {
      title: 'Высокая доступность: CARP overview',
      content: `**CARP + pfsync** — HA pair active/passive, shared VIP. Config sync XMLRPC master→backup.

Setup: Virtual IPs CARP, System → High Availability, firewall allow pfsync/CARP.

Полный failover runbook, split-brain, cloud limitations — глава **Operations**. Multi-WAN failover (без CARP) — ниже в этой главе.`,
    },
    {
      title: 'Backup, config.xml и обновления',
      content: `**Конфигурация OPNsense** — единый файл **config.xml** (XML). Все rules, NAT, VPN, users — внутри.

**Backup methods:**

| Метод | Путь |
|-------|------|
| **GUI** | System → Configuration → Backups → Download |
| **Scheduled** | System → Configuration → Backups → Google Drive/SFTP |
| **CLI** | \`cp /conf/config.xml /root/backup-$(date +%F).xml\` |

**Restore:**
1. System → Configuration → Backups → Restore
2. Или boot console → import config
3. **Версия firmware** должна быть compatible — restore на newer usually OK, downgrade risky

**Best practices:**
- Backup before **every** change (automated daily + pre-change manual)
- Store encrypted offsite (S3, git-crypt private repo — без secrets в plain)
- Test restore quarterly на lab VM
- Document «baseline config» version tag

**Обновления:**
- System → Firmware → Status — minor updates in-place
- Major version: read release notes, backup, update, verify
- Plugins update separately after core

**Revision history:** System → Configuration → History — rollback UI changes.

**Disaster recovery RTO:** с чистой VM + config.xml restore — 15–30 min если процедура отработана.`,
      code: {
        language: 'shell',
        caption: 'CLI: backup и diff config.xml',
        code: `# backup
cp /conf/config.xml /root/config-backup-$(date +%Y%m%d).xml

# проверка валидности XML
xmllint --noout /conf/config.xml

# сравнение с предыдущим backup (на admin workstation)
diff -u config-old.xml config-new.xml | less`,
      },
    },
    {
      title: 'Troubleshooting и security hardening',
      content: `**Диагностический workflow:**

1. **Reproduce** — один client, one destination
2. **Check interface** — link up? correct IP?
3. **Routing** — Diagnostics → Routes, traceroute
4. **Firewall** — temporary log on suspected rule
5. **NAT** — states show translation?
6. **Packet capture** — Diagnostics → Packet Capture или tcpdump

**Полезные команды:**

| Команда | Назначение |
|---------|------------|
| \`pfctl -vvsr\` | Rules с counters |
| \`pfctl -s state\` | Active sessions |
| \`tcpdump -ni lan host X and port Y\` | Live capture |
| \`clog -f /var/log/filter\` | Firewall log tail |
| \`arp -a\` | ARP table |

**Packet capture GUI:** Diagnostics → Packet Capture — select interface, filter \`host 192.168.10.50 and port 443\`.

**Типичные проблемы:**

| Симптом | Причина | Fix |
|---------|---------|-----|
| LAN no internet | WAN gateway down, NAT off | Gateways, outbound NAT |
| Port forward timeout | No WAN rule, wrong interface | Associated filter rule |
| VPN connects no LAN | WG firewall, routes, Allowed IPs | Pass WG→LAN, peer Allowed IPs |
| Inter-VLAN blocked | Missing rule on VLAN interface | Rule on source VLAN in |
| DNS fails | Unbound not on interface | Unbound listen interfaces |

**Security hardening checklist:**

- [ ] Disable root GUI login; create admin + operator roles
- [ ] SSH: key-only, no password; restrict source to Mgmt alias
- [ ] GUI: HTTPS only, strong TLS, restrict to Mgmt subnet
- [ ] Default deny inter-VLAN; explicit allow only
- [ ] WAN: block all inbound except VPN + required forwards
- [ ] Enable Unbound DNSSEC validation
- [ ] Suricata IDS/IPS after tuning
- [ ] Auto config backups to offsite
- [ ] NTP sync (System → Settings → General)
- [ ] Disable unused interfaces and services
- [ ] Regular firmware + plugin updates (monthly window)
- [ ] MFA for external access (VPN portal, if used)
- [ ] Syslog forward to central SIEM
- [ ] Review Firewall → Log Files weekly

**Сравнение ops burden с FortiGate:** OPNsense дешевле в license, но требует больше self-managed tuning (Suricata FP, rule hygiene). FortiGate — меньше DIY, выше TCO.`,
      code: {
        language: 'shell',
        caption: 'tcpdump и firewall log на shell',
        code: `# capture 100 packets on LAN, write to file
tcpdump -ni vlan0.20 -c 100 -w /tmp/lan-capture.pcap host 192.168.20.50

# live firewall log
clog -f /var/log/filter | grep 192.168.20.50

# reset rule statistics (осторожно в production)
pfctl -z`,
      },
    },
    {
      title: 'Troubleshooting connectivity: пошаговый workflow',
      content: `**Workflow «нет связности»** — systematic isolation DNS vs routing vs firewall.

**Шаг 1 — Scope:** one client or all? one destination or all internet?

**Шаг 2 — L1/L2:** link up? correct VLAN on switch port? \`ifconfig\` errors/drops?

**Шаг 3 — L3 client:** gateway = OPNsense interface IP? DHCP option correct?

**Шаг 4 — Routing:** Diagnostics → Routes; default route via WAN? \`netstat -rn\`

**Шаг 5 — Gateway health:** System → Gateways → Status — WAN monitor green?

**Шаг 6 — DNS isolate:** \`ping 1.1.1.1\` OK but name fails → Unbound listen interfaces, \`drill @192.168.20.1 host\`

**Шаг 7 — Firewall:** Live View + temporary log on suspected deny rule

**Шаг 8 — NAT:** outbound issue → глава NAT; states show translation?

**Шаг 9 — Capture:** Diagnostics Packet Capture или \`tcpdump -ni vlan0.20 host X\`

**Типичная матрица:**

| Симптом | Layer | First check |
|---------|-------|-------------|
| No internet all LAN | WAN | Gateway status |
| One VLAN only | VLAN IF | Interface enabled + IP |
| DNS only broken | DNS | Unbound listen |
| Inter-VLAN | Firewall | Rule on source VLAN in |
| Intermittent | WAN/LTE | Monitor IP reachability |
| SSH/GUI timeout | Mgmt rule | Firewall allow Mgmt |

**Escalation pack для forum:** \`opnsense-version\`, rule counters, capture, steps to reproduce — без secrets из config.xml.`,
    },
    {
      title: 'DHCP server: расширенная настройка SMB',
      content: `**Services → ISC DHCPv4** per interface — не включай на WAN.

**Pool design VLAN20 Users:**
- Range 192.168.20.100–200 (100 leases)
- Gateway 192.168.20.1
- DNS 192.168.20.1 (Unbound) или DC
- Domain office.local
- Lease 86400 sec

**Static mappings:** printers, AP, cameras — document MAC in IP plan spreadsheet.

**Custom options:** VoIP option 66/150; PXE 66/67 — advanced integrations.

**DHCP relay path:** DC holds DHCP → disable OPNsense DHCP on subnet → Services DHCP Relay → upstream DC IP OR switch ip helper-address.

**Failover:** CARP shared IP + DHCP failover advanced — глава Operations.

**Troubleshooting:**
- No OFFER: firewall UDP 67/68 blocked on interface
- Wrong gateway: pool misconfiguration
- Duplicate IP: static mapping conflict with dynamic pool
- \`tcpdump -ni vlan0.20 port 67 or port 68\`

**IPv6:** Router Advertisements + DHCPv6 separate menu — plan if ISP PD.`,
    },
    {
      title: 'Unbound DNS: resolver, forwarders и split horizon',
      content: `**Services → Unbound DNS → General:** enable, listen LAN+VLAN interfaces only.

**Register DHCP leases** — automatic local hostnames for clients.

**Mode selection:**

| Mode | When |
|------|------|
| Root recursion | Default, no ISP DNS dependency |
| Forward all | Upstream 1.1.1.1 / 8.8.8.8 |
| Split forward | AD domain → DC; rest recursive |

**Host overrides:**
\`\`\`
app.office.local → 192.168.10.50
vpn.office.com → public WAN IP
\`\`\`

**DNS over TLS:** optional upstream privacy to Cloudflare/Quad9.

**DNSSEC validation:** enable — validates chain of trust.

**AD integration:** domain override office.local → forward to DC IP; clients use OPNsense or DC as DNS per design.

**Security:** block client DoH to known providers if policy requires; sinkhole via blocklist plugin.

**Debug:** Diagnostics DNS Lookup; \`unbound-control status\`; \`tcpdump -ni lan port 53\``,
    },
    {
      title: 'config.xml: структура, секреты и DR',
      content: `**Единый XML** — interfaces, routes, users, rules, VPN keys, API secrets.

**Locations:** \`/conf/config.xml\` live; download via GUI/API/SCP.

**Restore paths:**
1. System → Configuration → Backups → Restore
2. Console option 13
3. Clean install + restore (DR VM)

**Version rules:** restore same or newer firmware usually OK; downgrade risky.

**Revision history:** System → Configuration → History — UI diff rollback.

**Secrets handling:** treat backup as credential-equivalent — GPG encrypt offsite:
\`\`\`
tar czf - /conf/config.xml | gpg -c > backup.tar.gz.gpg
\`\`\`

**GitOps caution:** private repo + git-crypt; never public commit.

**Quarterly DR test:** lab VM restore timed — target RTO 30 min documented.

**Change management:** pre-change backup filename includes ticket ID \`config-CHG-1234.xml\`.`,
    },
    {
      title: 'Справочник консольного меню и out-of-band access',
      content: `**Console menu options (reference):**

| # | Function | When to use |
|---|----------|-------------|
| 1 | Assign interfaces | Initial / hardware change |
| 2 | Set interface IP | Locked out GUI wrong LAN IP |
| 3 | Reset root password | Emergency lockout |
| 4 | Factory reset | ⚠️ Total config wipe |
| 7 | Ping | Test WAN without GUI |
| 8 | Shell | Advanced debug |
| 9 | pfTop | Live state table |
| 10 | Firewall log | Quick block visibility |
| 11 | Reload services | Apply without reboot |
| 12 | Firmware update | No GUI access |
| 13 | Restore config.xml | DR |

**Out-of-band paths:** hypervisor console, IPMI/iLO serial, physical KVM.

**opnsense-shell** from shell returns to menu.

**Serial:** \`/boot/loader.conf\` console speed 115200 for datacenter appliances.

**Break-glass:** documented root password in vault; test quarterly.`,
    },
    {
      title: 'IPv6 на OPNsense: обзор для SMB',
      content: `**IPv6 support:** DHCPv6-PD from ISP, static, track interface.

**When to enable:** ISP provides PD; compliance; dual-stack apps.

**When skip:** IPv4-only SMB — majority 2026; enable later without redesign if VLAN/IP plan clean.

**Firewall:** separate IPv6 rule tab — don't assume v4 rules cover v6.

**Unbound:** v6 listening if clients query AAAA.

**Common issues:** ISP PD not propagated; missing v6 default route; v6 rules default deny.

**Lab:** enable v6 on WAN PD sim if learning; production plan addressing scheme first.`,
    },
    {
      title: 'MSP model: центральное управление без FortiManager',
      content: `**MSP managing 10+ OPNsense:**

| Function | Tool |
|----------|------|
| Monitoring | Zabbix / Prometheus node_exporter |
| Backup | Scheduled API/SCP script per site |
| Config drift | diff config.xml weekly |
| Updates | staged: lab → pilot site → fleet |
| Access | WireGuard hub → SSH Mgmt VLAN |

**No single-vendor orchestrator** — scripts + SIEM + ticketing integration.

**Per-customer:** separate config.xml backup encrypted; API keys per tenant.

**Documentation:** standard IP plan template VLAN10/20/60/99.

**Onboarding runbook:** ISO deploy checklist + import baseline policies (глава Policies).`,
    },
    {
      title: 'Sizing walkthrough: офис 50 users пример',
      content: `**Input:** 50 users, 500 Mbps fiber WAN, Suricata IDS WAN only, 20 WireGuard users, no SSL inspection.

**Step 1 — Sessions:** 50 × 50 = 2500 concurrent sessions peak estimate.

**Step 2 — CPU:** IDS adds ~30% CPU at 500 Mbps — plan 4 vCPU minimum.

**Step 3 — RAM:** 8 GB base + IDS buffer → 8–16 GB.

**Step 4 — Disk:** 64 GB SSD; logs local 30d + remote syslog.

**Step 5 — NIC:** 2× GE sufficient; 10GE if internal trunk >1 Gbps aggregate.

**Step 6 — Validate:** lab traffic generator or peak hour \`top\` + \`pfctl -s info\`.

**Rule 70%:** sustained CPU under 70% at peak — if higher, upgrade vCPU/RAM or reduce IDS scope.

**Document:** sizing memo in change folder for future audits.`,
    },
    {
      title: 'Миграция pfSense → OPNsense: overview',
      content: `**Possible** via config import with limitations — not 1:1 plugins.

**Process:**
1. Export pfSense config.xml
2. OPNsense import tool / manual migration (check release notes)
3. Verify interfaces mapping (NIC order may differ)
4. Reinstall plugins os-* equivalents
5. Parallel run cutover weekend

**Watch:** NAT rule format, OpenVPN cert paths, Suricata rule paths differ.

**Rollback:** keep pfSense VM snapshot until 1 week stable.

**FortiGate migration:** no auto-import — manual policy rewrite 2–4 weeks office 50 users.`,
    },
    {
      title: 'Глоссарий Fundamentals (quick reference)',
      content: `| Term | Meaning |
|------|---------|
| **pf** | FreeBSD packet filter engine |
| **OPT** | Additional routed interface |
| **config.xml** | Single configuration file |
| **Unbound** | Validating DNS resolver |
| **CARP** | HA virtual IP failover |
| **pfsync** | State table sync between HA nodes |
| os-* packages | OPNsense plugin package prefix |
| **Gateway group** | Failover/load balance WAN paths |
| **Alias** | Named object group for rules |
| **Ingress rule** | Firewall rule on traffic entering interface |
| **Implicit deny** | Unmatched traffic blocked |
| **Bogon** | Invalid/unallocated IP space |
| **Split DNS** | Different answers inside vs outside |
| **2FA TOTP** | Time-based one-time password |
| **REST API** | HTTP API for automation |
| **VirtIO** | Paravirtual NIC for VMs |
| **LAGG** | FreeBSD link aggregation |
| **PD** | IPv6 prefix delegation from ISP |

**Совет:** держи этот глоссарий рядом при чтении глав Policies, VPN и Operations — единый vocabulary ускоряет onboarding новых инженеров.`,
    },
  ],
  practice: [
    'Разверни OPNsense в Proxmox/VMware/Hyper-V: 2–3 NIC, ISO install, hostname opnsense-lab01',
    'Post-install: firmware, NTP, admin+2FA, disable root GUI, backup config.xml',
    'VLAN10/20/60 на LAN trunk с IP .1 на каждом',
    'Static route 192.168.50.0/24 — verify netstat -rn',
    'DHCP VLAN20 + Unbound host override lab.local',
    'SSH ed25519 key, password auth off, Mgmt VLAN only',
    'Install os-wireguard + os-acme-client (or os-zabbix-agent)',
    'REST API curl firmware status + config download (no secrets in git)',
    'Troubleshoot injected no-internet fault',
    'Snapshot baseline; restore config.xml rollback test'
  ],
  resources: [
    { title: 'OPNsense Official Documentation', url: 'https://docs.opnsense.org/' },
    { title: 'OPNsense Download', url: 'https://opnsense.org/download/' },
    { title: 'OPNsense Forum', url: 'https://forum.opnsense.org/' },
    { title: 'WireGuard on OPNsense (docs)', url: 'https://docs.opnsense.org/manual/how-tos/wireguard-client.html' },
    { title: 'Suricata plugin guide', url: 'https://docs.opnsense.org/manual/ips.html' },
    { title: 'Hardening OPNsense', url: 'https://docs.opnsense.org/manual/hardening.html' },
    { title: 'OPNsense Virtualization Guide', url: 'https://docs.opnsense.org/manual/virtuals.html' },
    { title: 'OPNsense REST API Documentation', url: 'https://docs.opnsense.org/development/api.html' },
    { title: 'OPNsense Release Notes', url: 'https://opnsense.org/releases/' },
  ],
}
