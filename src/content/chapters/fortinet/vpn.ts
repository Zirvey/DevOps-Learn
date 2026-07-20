import type { Chapter } from '../../../types'

export const fortinetVpnChapter: Chapter = {
  id: 'fortinet-vpn',
  slug: 'fortinet-vpn',
  title: 'FortiGate — VPN (IPsec и SSL)',
  moduleId: 'fortinet',
  order: 2,
  duration: '10–12 часов',
  level: 'intermediate',
  description:
    'Site-to-Site IPsec с AWS, SSL-VPN с AD/LDAP, FortiClient EMS, split tunnel, hardening — production SMB удалёнка',
  sections: [
    {
      title: 'Типы VPN на FortiGate',
      content: `FortiGate поддерживает несколько VPN технологий. Для SMB офиса в 2026 году актуальны два основных:

| Тип | Протокол | Сценарий | Клиент |
|-----|----------|----------|--------|
| **IPsec Site-to-Site** | IKEv1/v2 + ESP | Офис ↔ AWS/Azure, офис ↔ филиал | Автоматический (gateway-to-gateway) |
| **SSL-VPN (Tunnel Mode)** | TLS 1.2/1.3 | Удалённые сотрудники | FortiClient |
| **IPsec Dial-up** | IKEv2 | Remote users (альтернатива SSL) | FortiClient / native OS |
| **SSL-VPN Web Mode** | HTTPS | Browser-only access (limited) | Web browser |

**Не используй в 2026:**
- PPTP — broken cryptography
- L2TP без IPsec — insecure
- SSL-VPN Web Mode как основной remote access (ограниченный функционал)

**Выбор для SMB:**
- **Remote workers** → SSL-VPN Tunnel Mode + FortiClient + AD/LDAP + MFA
- **Cloud connectivity** → IPsec Site-to-Site к AWS VGW/TGW
- **Branch office** → IPsec Site-to-Site между FortiGate

**Licensing:** SSL-VPN users limited by hardware (FG-60F: 200 max tunnel mode). Проверь datasheet.`,
    },
    {
      title: 'IPsec fundamentals: Phase 1 и Phase 2',
      content: `**IPsec VPN** состоит из двух фаз negotiation (IKE):

**Phase 1 (IKE SA)** — secure channel между gateways:
- Authentication: Pre-Shared Key (PSK) или Certificates
- Encryption: AES-256-GCM (рекомендуется)
- Integrity: SHA-256 (если не GCM)
- DH Group: 14 или 19 (ECP-256)
- Lifetime: 86400s (24h)
- Mode: Main (IKEv1) или IKEv2 (предпочтительно)

**Phase 2 (IPsec SA)** — tunnel parameters для data:
- Encryption: AES-256-GCM
- PFS (Perfect Forward Secrecy): enable, DH Group 19
- Lifetime: 3600s (1h)
- Mode: Tunnel (encapsulate entire IP packet)

**FortiGate terminology:**
- **Phase 1 Interface** = IKE gateway (peer definition)
- **Phase 2 Selectors** = proxy IDs (local/remote subnets)
- **Tunnel interface** = virtual interface для routing

**Route-based vs Policy-based:**
- **Route-based** (рекомендуется): tunnel interface + static route. Проще troubleshooting, SD-WAN compatible
- **Policy-based**: phase2 selectors определяют traffic. Legacy, avoid for new deployments`,
    },
    {
      title: 'IPsec Site-to-Site: офис ↔ филиал',
      content: `**Сценарий:** головной офис (FG-HQ, 192.168.0.0/16) ↔ филиал (FG-Branch, 192.168.100.0/24).

**На FG-HQ (GUI VPN → IPsec Wizard → Site to Site):**

1. **Name:** Branch-Office-Tunnel
2. **Remote Gateway:** static IP филиала (или DDNS)
3. **Outgoing interface:** wan1
4. **Authentication:** PSK (минимум 32 random chars) или Certificate
5. **Phase 1:** IKEv2, AES-256-GCM, DH14
6. **Phase 2:** AES-256-GCM, PFS enable
7. **Local subnet:** 192.168.0.0/16
8. **Remote subnet:** 192.168.100.0/24

**На FG-Branch:** зеркальная конфигурация (local/remote swapped).

**Firewall policies (обе стороны):**
- HQ: internal → Branch-Tunnel, source 192.168.0.0/16, dest 192.168.100.0/24
- Branch: internal → HQ-Tunnel, source 192.168.100.0/24, dest 192.168.0.0/16

**Static route (route-based):** 192.168.100.0/24 → Branch-Tunnel interface.

**Проверка:** \`diagnose vpn tunnel list\`, ping remote subnet.`,
      code: {
        language: 'text',
        caption: 'CLI: IPsec site-to-site (FG-HQ)',
        code: `config vpn ipsec phase1-interface
    edit "Branch-Office-P1"
        set interface "wan1"
        set peertype any
        set net-device disable
        set proposal aes256gcm-prfsha256
        set remote-gw 198.51.100.50
        set psksecret ENC <encrypted>
        set ike-version 2
    next
end

config vpn ipsec phase2-interface
    edit "Branch-Office-P2"
        set phase1name "Branch-Office-P1"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 19
        set auto-negotiate enable
        set src-subnet 192.168.0.0 255.255.0.0
        set dst-subnet 192.168.100.0 255.255.255.0
    next
end`,
      },
    },
    {
      title: 'IPsec Site-to-Site с AWS',
      content: `**Сценарий:** SMB офис (FortiGate) ↔ AWS VPC (10.50.0.0/16) через Site-to-Site VPN.

**AWS сторона:**
1. **Virtual Private Gateway (VGW)** или **Transit Gateway (TGW)** attached to VPC
2. **Customer Gateway (CGW):** register FortiGate WAN IP + BGP ASN (если BGP) или static
3. **Site-to-Site VPN Connection:** AWS generates tunnel configs (2 tunnels for redundancy)
4. **Download config** → Vendor: Fortinet FortiGate

**FortiGate сторона (2 tunnels recommended):**

| Parameter | AWS Tunnel 1 | AWS Tunnel 2 |
|-----------|-------------|-------------|
| Remote GW | AWS endpoint IP 1 | AWS endpoint IP 2 |
| Local subnet | 192.168.0.0/16 (office) | same |
| Remote subnet | 10.50.0.0/16 (VPC) | same |
| PSK | From AWS console | From AWS console |

**Routing options:**
- **Static:** route 10.50.0.0/16 → ipsec tunnel (simple, SMB default)
- **BGP:** dynamic routes, failover between tunnels (advanced)

**AWS Security Group:** allow office CIDR 192.168.0.0/16 to EC2/RDS ports.

**Firewall policy на FG:** VLAN-Users → AWS-Tunnel, dest 10.50.0.0/16.

**Monitoring:** CloudWatch VPN metrics + FG \`diagnose vpn ike gateway list\`.`,
      code: {
        language: 'text',
        caption: 'CLI: static route к AWS VPC через IPsec',
        code: `config router static
    edit 10
        set dst 10.50.0.0 255.255.0.0
        set device "AWS-Tunnel1"
        set distance 5
        set comment "AWS VPC primary tunnel"
    next
    edit 11
        set dst 10.50.0.0 255.255.0.0
        set device "AWS-Tunnel2"
        set distance 10
        set comment "AWS VPC backup tunnel"
    next
end`,
      },
    },
    {
      title: 'Route-based vs policy-based IPsec',
      content: `**Route-based VPN (рекомендуется):**
- Phase2 создаёт tunnel interface (e.g. \`Branch-Office-P1\`)
- Traffic direction определяется **routing table** + **firewall policies**
- \`net-device enable\` на phase1 (default в wizard)
- SD-WAN compatible
- Проще add/remove subnets (просто новый route)

**Policy-based VPN (legacy):**
- Phase2 selectors (src/dst subnet) определяют traffic
- Нет tunnel interface
- Каждая subnet pair = отдельный phase2
- Не работает с SD-WAN
- Сложнее troubleshooting

**Миграция policy → route-based:**
1. Create new route-based tunnel
2. Parallel run (test)
3. Migrate routes
4. Delete old policy-based

**Для новых deployments:** всегда route-based. AWS VPN Wizard генерирует route-based config.`,
    },
    {
      title: 'SSL-VPN: архитектура и режимы',
      content: `**SSL-VPN** использует TLS (порт 443) для VPN tunnel. Проходит через большинство firewalls и NAT.

**Режимы FortiGate SSL-VPN:**

| Mode | Описание | Use case |
|------|----------|----------|
| **Tunnel Mode** | Full network access через virtual adapter | Remote workers (основной) |
| **Web Mode** | Browser proxy, portal apps | Vendor temporary access |
| **Web + Tunnel** | Оба | Mixed |

**Tunnel Mode architecture:**
\`\`\`
FortiClient → TLS 443 → FortiGate (ssl.root) → internal VLANs
                ↓
         Virtual IP pool (10.212.134.200-210)
                ↓
         Firewall policies: SSL-VPN → internal
\`\`\`

**Настройка (GUI):** VPN → SSL-VPN Settings:
- Listen on: wan1 (или wan1 + wan2)
- Port: 443
- Server certificate: Fortinet factory или Let's Encrypt / corporate cert
- Tunnel IP pools: 10.212.134.200-10.212.134.210
- DNS servers: internal DC (192.168.10.10)
- Routes: push corporate subnets to client

**Capacity:** FG-60F supports 200 concurrent SSL-VPN tunnel mode users (check license).`,
      code: {
        language: 'text',
        caption: 'CLI: SSL-VPN settings',
        code: `config vpn ssl settings
    set servercert "Fortinet_Factory"
    set idle-timeout 28800
    set auth-timeout 28800
    set tunnel-ip-pools "SSLVPN_TUNNEL_ADDR1"
    set tunnel-ipv6-pools ""
    set dns-server1 192.168.10.10
    set dns-server2 8.8.8.8
    set port 443
    set source-interface "wan1"
    set source-address "all"
    set default-gateway "0.0.0.0"
    set route-overlap enable
end`,
      },
    },
    {
      title: 'SSL-VPN portal и tunnel mode policies',
      content: `**SSL-VPN Portal** определяет что видит user после login: bookmarks, tunnel settings, split tunneling.

**GUI:** VPN → SSL-VPN Portals → Create New → \`full-access\` clone.

**Portal settings:**
- **Tunnel Mode:** enable
- **Split Tunneling:** enable/disable + routing addresses
- **Routing Address:** ADDR-Internal-All (какие subnets push на client)
- **Source IP Pools:** SSLVPN_TUNNEL_ADDR1
- **Limit user logins:** enable (1 session per user)

**User Group → Portal mapping:**
- VPN → SSL-VPN Settings → Authentication/Portal Mapping
- Group \`VPN-Users\` → Portal \`tunnel-standard\`
- Group \`VPN-Admins\` → Portal \`tunnel-full\`

**FortiClient settings (auto from FG):**
- Download from https://fg-wan-ip:443
- Auto-configure tunnel, routes, DNS

**Firewall policy для SSL-VPN:**
- Incoming: ssl.root | Outgoing: VLAN10-Servers
- Source: SSLVPN_TUNNEL_ADDR1 | Dest: ADDR-Servers
- Service: ALL (или specific)
- Profiles: AV, IPS (recommended)`,
    },
    {
      title: 'LDAP/Active Directory authentication',
      content: `**Для production SMB** — никогда local users для VPN. Используй **LDAP/AD integration**.

**Настройка LDAP connector (GUI):**
1. User & Authentication → LDAP Servers → Create New
2. Name: AD-Corp
3. Server IP: 192.168.10.10 (DC)
4. Port: 389 (или 636 LDAPS)
5. Common Name Identifier: sAMAccountName
6. Distinguished Name: DC=corp,DC=local
7. Bind Type: Regular → service account (CN=fgldap,OU=Service,DC=corp,DC=local)
8. Test connectivity

**User Group mapping:**
1. User & Authentication → User Groups → Create
2. Name: VPN-Users
3. Type: Firewall
4. Remote Groups: CN=VPN-Users,OU=Groups,DC=corp,DC=local

**AD side:**
- Create security group \`VPN-Users\` in OU=Groups
- Add members: remote workers only
- Separate group \`VPN-Admins\` for IT (full tunnel)
- Service account \`fgldap\` with read-only permissions

**При offboarding:** disable AD account → VPN access revoked immediately (no FG change needed).`,
      code: {
        language: 'text',
        caption: 'CLI: LDAP server и user group',
        code: `config user ldap
    edit "AD-Corp"
        set server "192.168.10.10"
        set port 389
        set cnid "sAMAccountName"
        set dn "dc=corp,dc=local"
        set type regular
        set username "CN=fgldap,OU=Service,DC=corp,DC=local"
        set password ENC <encrypted>
    next
end

config user group
    edit "VPN-Users"
        set member "AD-Corp"
        config match
            edit 1
                set server-name "AD-Corp"
                set group-name "CN=VPN-Users,OU=Groups,DC=corp,DC=local"
            next
        end
    next
end`,
      },
    },
    {
      title: 'FortiClient: deployment и настройка',
      content: `**FortiClient** — бесплатный VPN client для FortiGate SSL-VPN и IPsec.

**Deployment methods SMB:**

| Method | Как | Когда |
|--------|-----|-------|
| **Manual** | User downloads from FG portal | < 10 users |
| **GPO / Intune** | MSI silent install | 10+ Windows users |
| **FortiClient EMS** | Centralized deploy + config | 20+ users, compliance needed |
| **macOS MDM** | PKG via Jamf/Intune | Mac users |

**Silent install (Windows):**
\`\`\`
msiexec /i FortiClientVPN.msi /quiet /norestart
\`\`\`

**Auto-configure from FortiGate:**
1. VPN → SSL-VPN Settings → Authentication/Portal Mapping
2. User connects to https://vpn.corp.local (or WAN IP)
3. FortiClient downloads config after auth

**Custom FortiClient config (XML):**
- VPN endpoint, split tunnel routes
- Disable local LAN access (security)
- Auto-connect on startup (optional)
- Distribute via EMS or GPO

**Version compatibility:** FortiClient major version ≈ FortiOS version. FG 7.4 → FortiClient 7.4.x.

**Download:** fortinet.com/support/product-downloads или с FG portal.`,
    },
    {
      title: 'FortiClient EMS и endpoint compliance',
      content: `**FortiClient EMS (Endpoint Management Server)** — централизованное управление FortiClient: deploy, config, compliance check, quarantine.

**Compliance use case:**
- VPN access **только** если: AV updated, OS patched, disk encrypted, FortiClient running
- Non-compliant endpoint → quarantine VLAN or deny VPN

**Architecture:**
\`\`\`
FortiClient ←→ EMS Server (on-prem VM or cloud)
     ↓
FortiGate ← Security Fabric tag ← EMS (compromised/quarantined)
\`\`\`

**Setup overview:**
1. Deploy EMS VM (Windows Server)
2. Register EMS with FortiGate (Security Fabric)
3. Create endpoint profile: AV, VPN, vulnerability scan
4. Deploy FortiClient with EMS registration key
5. FG policy: VPN-Users group + EMS tag «Compliant»

**SMB sizing:** EMS free tier до 25 endpoints. Для 50 users — EMS-B100 license.

**Without EMS (minimal):** AD group membership only, no endpoint health check. Acceptable for small teams with managed laptops + Intune compliance.`,
    },
    {
      title: 'Split tunneling: дизайн и риски',
      content: `**Full tunnel:** ALL traffic через VPN → FortiGate → internet.
- Pros: full UTM inspection, DLP, consistent policy
- Cons: FG overload, slow internet for remote users, bandwidth cost

**Split tunnel:** ONLY corporate subnets через VPN, internet напрямую.
- Pros: better UX, less FG load
- Cons: bypassed security, infected laptop → direct internet threat

**Рекомендация SMB 2026:**

| User type | Tunnel mode | Routes |
|-----------|-------------|--------|
| **Regular employees** | Split | 192.168.0.0/16, 10.50.0.0/16 (AWS) |
| **IT admins** | Full | 0.0.0.0/0 |
| **Contractors** | Split (restricted) | Specific app subnets only |

**FortiGate config (Portal):**
- Split Tunneling: Enable
- Routing Address: ADDR-Internal-All (не 0.0.0.0/0)
- Internet Services: disabled

**FortiClient side:** «Allow local LAN access» — **disable** (prevents bypass).

**DNS split:** internal DNS (192.168.10.10) через VPN, public DNS direct. Настрой в SSL-VPN settings.`,
      code: {
        language: 'text',
        caption: 'CLI: SSL-VPN portal split tunnel',
        code: `config vpn ssl web portal
    edit "tunnel-standard"
        set tunnel-mode enable
        set split-tunneling enable
        set ip-pools "SSLVPN_TUNNEL_ADDR1"
        set split-tunneling-routing-address "ADDR-Servers" "ADDR-Workstations"
    next
end`,
      },
    },
    {
      title: 'Full tunnel для привилегированных пользователей',
      content: `**Full tunnel portal** для IT admins, security team, users с доступом к sensitive data.

**Config:**
- Split Tunneling: **disable**
- Default gateway: push FG as gateway (0.0.0.0/0 via VPN)
- All internet traffic inspected by FG UTM
- DNS: only internal DNS servers

**Requirements:**
- FG capacity: 30 full-tunnel users × 5 Mbps avg = 150 Mbps WAN needed
- UTM profiles on VPN→WAN policy
- MFA mandatory
- Shorter idle timeout (4h vs 8h)

**Portal mapping:** AD group VPN-Admins → portal tunnel-full.

**Monitoring:** FortiAnalyzer report «VPN bandwidth by user» — detect abuse.`,
    },
    {
      title: 'MFA: FortiToken и внешние провайдеры',
      content: `**MFA обязательна** для VPN в production. Password only = unacceptable risk.

**Options:**

| Method | Setup | SMB fit |
|--------|-------|---------|
| **FortiToken Mobile** | Free app, FG generates tokens | Best for FortiGate-native |
| **FortiToken Hardware** | Physical OTP device | High-security users |
| **RADIUS + MFA** | FortiAuthenticator / Azure MFA / Duo | AD integrated |
| **SAML SSO** | FortiAuthenticator + Azure AD | Modern, best UX |

**FortiToken Mobile setup:**
1. User & Authentication → Authentication Settings → Two-Factor → Enable
2. Create user (or LDAP user) → assign FortiToken
3. User activates token in FortiToken Mobile app
4. VPN login: password + 6-digit OTP

**LDAP + FortiAuthenticator:**
- FG → RADIUS → FortiAuthenticator → AD + FortiToken
- Centralized MFA for VPN + Wi-Fi + admin

**Azure MFA (SAML):**
- FortiGate SAML SP → Azure AD IdP
- Conditional Access: compliant device required`,
    },
    {
      title: 'VPN firewall policies',
      content: `**Минимальный набор policies для SSL-VPN:**

**POL-VPN-Users-Internal:**
- Incoming: ssl.root | Outgoing: VLAN10, VLAN20
- Source: SSLVPN_TUNNEL_ADDR1 | Dest: GRP-Internal
- Service: specific (SMB, RDP, SSH) — NOT ALL for contractors
- Action: ACCEPT

**POL-VPN-Users-Internet (full tunnel only):**
- Incoming: ssl.root | Outgoing: wan1
- NAT: enable | UTM: full profiles

**POL-VPN-Deny-All:**
- Incoming: ssl.root | Outgoing: any
- Action: DENY | Log: all

**IPsec site-to-site policies:**
- Incoming: Branch-Tunnel | Outgoing: internal
- Source/Dest: remote/local subnets

**Security principle:** VPN users ≠ trusted. Apply UTM, limit access by group, log everything.

**Geo + VPN:** если все users в одной стране — geo-block SSL-VPN port 443 from other countries (дополнительный layer).`,
      code: {
        language: 'text',
        caption: 'CLI: VPN user policy',
        code: `config firewall policy
    edit 0
        set name "POL-SSLVPN-Users-Internal"
        set srcintf "ssl.root"
        set dstintf "VLAN10-Servers" "VLAN20-Workstations"
        set srcaddr "SSLVPN_TUNNEL_ADDR1"
        set dstaddr "GRP-Internal-All"
        set action accept
        set groups "VPN-Users"
        set schedule "always"
        set service "SMB" "RDP" "SSH" "DNS"
        set logtraffic all
    next
end`,
      },
    },
    {
      title: 'Hardening VPN: чеклист production',
      content: `**Обязательный hardening checklist для SMB VPN:**

1. **MFA** на всех VPN users (FortiToken или RADIUS MFA)
2. **AD groups** — VPN-Users, VPN-Admins (separate portals)
3. **No local users** для VPN (LDAP only)
4. **Idle timeout** ≤ 8 hours (4h for admins)
5. **Auto-disconnect** on FortiClient close
6. **1 session per user** (prevent credential sharing)
7. **Strong PSK** для IPsec (32+ chars, rotate annually) или certificates
8. **IKEv2 only** (disable IKEv1)
9. **Crypto:** AES-256-GCM, SHA-256+, DH14+
10. **Geo-blocking** на WAN для VPN port (optional)
11. **Rate limiting** SSL-VPN login attempts
12. **Logging** all VPN events → FortiAnalyzer
13. **Offboarding:** AD disable = instant revoke
14. **FortiClient EMS** compliance check (recommended)
15. **No RDP/SSH VIP** — VPN only for admin access
16. **Certificate** server cert from trusted CA (not self-signed for users)
17. **Disable** SSL-VPN web mode if unused
18. **Review** VPN users quarterly (AD group audit)`,
    },
    {
      title: 'Troubleshooting IPsec (CLI)',
      content: `**IPsec не поднимается — диагностика:**

**Step 1: Phase 1**
\`\`\`
diagnose vpn ike gateway list
diagnose debug application ike -1
diagnose debug enable
# trigger connection
diagnose debug disable
\`\`\`

**Common Phase 1 failures:**
- PSK mismatch
- IKE version mismatch (v1 vs v2)
- Encryption/hash mismatch
- Peer ID mismatch (especially AWS: check CGW config)
- UDP 500/4500 blocked (NAT-T)
- Wrong remote gateway IP

**Step 2: Phase 2**
\`\`\`
diagnose vpn ipsec tunnel list
diagnose vpn tunnel list
\`\`\`

**Common Phase 2 failures:**
- Proxy ID / subnet mismatch
- PFS mismatch
- Encryption mismatch
- Phase 1 not established

**Step 3: Traffic**
\`\`\`
diagnose debug flow filter addr <remote_subnet_host>
diagnose debug enable
\`\`\`

**AWS specific:** verify CGW IP matches wan1, both tunnels configured, VPC route table has route to VPN.`,
    },
    {
      title: 'Troubleshooting SSL-VPN',
      content: `**SSL-VPN connected but no access:**

1. Check tunnel IP assigned: FortiClient → Status
2. FG: \`diagnose vpn ssl list\` — session active?
3. Firewall policy: ssl.root → internal exists?
4. Source address in policy matches tunnel IP pool
5. User in correct AD group?
6. Split tunnel routes pushed? FortiClient → Routing Table
7. DNS resolution: internal names resolve?

**Authentication failures:**
- LDAP connectivity: \`execute ping 192.168.10.10\` from FG
- Bind account locked/expired
- Wrong DN/group mapping
- MFA token out of sync (time drift on FG — check NTP)

**Certificate errors:**
- Server cert expired or hostname mismatch
- Install trusted CA on client
- Try Fortinet factory cert for testing

**FortiClient issues:**
- Version mismatch with FortiOS
- Corrupt profile: reset FortiClient config
- Windows TAP adapter conflict: reinstall

**Logs:** Log & Report → VPN Events → filter by user`,
      code: {
        language: 'text',
        caption: 'CLI: SSL-VPN diagnostics',
        code: `diagnose vpn ssl list
diagnose vpn ssl stats
get vpn ssl settings

# LDAP test
diagnose test authserver ldap AD-Corp testuser <password>

# Active SSL sessions
diagnose vpn ssl filter src-addr 10.212.134.200
diagnose vpn ssl list`,
      },
    },
    {
      title: 'Runbook: onboarding remote worker',
      content: `**Runbook: новый удалённый сотрудник — VPN access**

**Prerequisites:** AD account created, manager approval ticket.

**IT steps (15 min):**

1. Add user to AD group \`VPN-Users\`
2. Verify FG LDAP sync: User & Authentication → LDAP → Test
3. Assign FortiToken (if MFA): create token → send activation QR
4. Send user email:
   - FortiClient download link (or EMS deploy)
   - VPN URL: https://vpn.corp.local:443
   - Instructions: install → connect → login → enter OTP
5. Test: user connects, ping 192.168.10.10 (DC), access file share
6. Verify split tunnel: internet works direct, internal via VPN
7. Log ticket as resolved

**User self-service doc:**
- Install FortiClient 7.4 from [link]
- Click «Configure VPN» → enter vpn.corp.local
- Login: CORP\\username + password
- Enter FortiToken code from app
- Test: open \\\\fileserver.corp.local

**Offboarding:** remove from VPN-Users group, revoke FortiToken, verify no active session.`,
    },
    {
      title: 'Runbook: VPN connected — нет доступа к ресурсам',
      content: `**Runbook: VPN connected, но file server / app недоступен**

**L1 checklist (5 min):**

| # | Check | Command/Action |
|---|-------|----------------|
| 1 | Tunnel IP получен? | FortiClient status |
| 2 | Ping DC? | ping 192.168.10.10 |
| 3 | DNS resolves? | nslookup fileserver.corp.local |
| 4 | Right portal? | VPN-Admins vs VPN-Users |
| 5 | AD group membership? | AD Users & Computers |
| 6 | Account enabled? | AD account status |
| 7 | FG session exists? | diagnose vpn ssl list |
| 8 | Policy allows? | Policy Lookup |
| 9 | Split tunnel routes? | FortiClient routing table |
| 10 | Server-side issue? | ping from FG to server |

**Common root causes:**
- User not in VPN-Users AD group (80% of tickets)
- Split tunnel: server subnet not in routing address
- DNS: client uses public DNS, can't resolve .corp.local
- Firewall policy missing ssl.root → server VLAN
- Server firewall blocks VPN subnet (Windows Firewall on DC)

**Fix DNS:** SSL-VPN settings → DNS Server = 192.168.10.10 (internal DC).`,
    },

    {
      title: 'AWS Site-to-Site VPN: полная конфигурация (AWS + FortiGate)',
      content: `**Topology:** Office FG (192.168.0.0/16) ↔ AWS VPC (10.50.0.0/16)

**AWS side (step-by-step):**
1. VPC → Virtual Private Gateways → Create VGW → attach to VPC
2. VPC → Customer Gateways → Create: IP = FG wan1 public, BGP ASN 65000 (static) or 64512 (BGP)
3. VPC → Site-to-Site VPN Connections → Create
   - Target: VGW
   - CGW: above
   - Routing: Static (10.50.0.0/16 local, 192.168.0.0/16 remote) or BGP
4. Download config → Vendor Fortinet FortiGate
5. VPC Route Table: 192.168.0.0/16 → VGW
6. Security Group: inbound from 192.168.0.0/16

**FortiGate side (Tunnel 1 + 2):**
AWS provides 2 tunnels for redundancy. Configure both phase1/phase2.

**Verify AWS:** VPN Connection → Tunnel Status UP/UP
**Verify FG:** \`diagnose vpn tunnel list\` → both tunnels
**Test:** from office ping EC2 private IP in VPC`,
      code: {
        language: 'text',
        caption: 'CLI: AWS Tunnel 1 (FortiGate) — полный пример',
        code: `config vpn ipsec phase1-interface
    edit "AWS-Tunnel1-P1"
        set interface "wan1"
        set ike-version 2
        set peertype any
        set net-device enable
        set proposal aes256gcm-prfsha256
        set remote-gw 52.x.x.x
        set psksecret <AWS_TUNNEL1_PSK>
        set dpd on-idle
    next
end

config vpn ipsec phase2-interface
    edit "AWS-Tunnel1-P2"
        set phase1name "AWS-Tunnel1-P1"
        set proposal aes256gcm
        set auto-negotiate enable
    next
end

config router static
    edit 10
        set dst 10.50.0.0 255.255.0.0
        set device "AWS-Tunnel1-P1"
        set distance 5
    next
end

config firewall policy
    edit 0
        set name "POL-IPsec-AWS"
        set srcintf "VLAN20-Workstations"
        set dstintf "AWS-Tunnel1-P1"
        set srcaddr "192.168.0.0/16"
        set dstaddr "10.50.0.0/16"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end`,
      },
    },
    {
      title: 'Azure VPN Gateway: Site-to-Site с FortiGate',
      content: `**Topology:** Office FG ↔ Azure VNet (10.60.0.0/16)

**Azure side:**
1. Create Virtual Network Gateway (VPN Gateway, RouteBased)
2. Local Network Gateway: office public IP + 192.168.0.0/16
3. Create Connection: IPsec, PSK, IKEv2
4. Azure provides shared key and gateway IP
5. VNet route table: 192.168.0.0/16 → VirtualNetworkGateway

**FortiGate side:**
Similar to AWS — phase1 with Azure gateway IP, phase2 auto-negotiate (route-based).

**Azure-specific settings:**
| Parameter | Azure requirement |
|-----------|-------------------|
| IKE | IKEv2 |
| Encryption | AES256, GCM preferred |
| PFS | PFS2048 or ECP256 |
| SA lifetime | 3600s (match Azure) |

**Common issues:**
- Phase1 OK, Phase2 fail → lifetime/PFS mismatch
- Traffic one-way → Azure NSG blocks return
- Azure uses policy-based feel but RouteBased = route-based on FG

**Monitoring:** Azure Portal → VPN Gateway → Connections → status`,
      code: {
        language: 'text',
        caption: 'CLI: Azure IPsec phase1',
        code: `config vpn ipsec phase1-interface
    edit "Azure-VNet-P1"
        set interface "wan1"
        set ike-version 2
        set peertype any
        set net-device enable
        set proposal aes256gcm-prfsha256
        set remote-gw <AZURE_GATEWAY_IP>
        set psksecret <AZURE_PSK>
        set dhgrp 19
    next
end`,
      },
    },
    {
      title: 'SSL-VPN Web Mode vs Tunnel Mode',
      content: `**Tunnel Mode (production default):**
- FortiClient virtual adapter
- Full L3 access to routed subnets
- Split/full tunnel control
- Best for remote workers

**Web Mode (limited):**
- Browser-only HTTPS portal
- Bookmarks to internal web apps (RDP bookmark, web apps)
- No network-layer access (no ping, no SMB)
- No FortiClient required

**Comparison:**

| Feature | Tunnel Mode | Web Mode |
|---------|-------------|----------|
| Client | FortiClient | Browser |
| SMB/file share | Yes | No (unless web app) |
| RDP | Native | Bookmark only |
| UTM inspection | Full | HTTP only |
| MFA | Yes | Yes |
| Use case | Employees | Vendors, temp access |

**Web Mode setup:**
1. VPN → SSL-VPN Portals → web-access portal
2. Add bookmarks (RDP, HTTPS internal apps)
3. Disable tunnel-mode on portal
4. Map vendor AD group → web portal

**Security:** disable web mode if unused (attack surface on port 443).`,
    },
    {
      title: 'Certificate-based IPsec VPN',
      content: `**Certificate auth** — stronger than PSK for site-to-site and dial-up.

**Site-to-site with certificates:**
1. Both sides generate CSR
2. Sign at shared CA (or cross-sign)
3. Import CA + local cert on each FG
4. Phase1: \`set authmethod signature\`, \`set certificate <local-cert>\`

**Benefits:**
- No PSK rotation pain
- Individual cert revocation
- Required for some compliance frameworks

**Dial-up IPsec with cert:**
- Remote user cert on FortiClient
- FG validates against CA
- Combined with LDAP for user identity

**vs PSK SMB:** PSK acceptable for single site-to-site if 32+ char random + annual rotation. Certs for multi-site enterprise.`,
      code: {
        language: 'text',
        caption: 'CLI: IPsec phase1 certificate auth',
        code: `config vpn ipsec phase1-interface
    edit "Branch-Cert-P1"
        set interface "wan1"
        set ike-version 2
        set authmethod signature
        set certificate "FG-HQ-IPsec-Cert"
        set remote-gw 198.51.100.50
        set peertype peer
        set peerid "CN=FG-Branch"
    next
end`,
      },
    },
    {
      title: 'IPsec Dial-up: remote users без SSL-VPN',
      content: `**IPsec dial-up** — remote users connect via IKEv2 + FortiClient (IPsec mode).

**When to use vs SSL-VPN:**
- Performance-sensitive (IPsec slightly faster)
- Native OS VPN (Windows IKEv2 without FortiClient)
- Policy requires IPsec not SSL

**Setup:**
1. VPN → IPsec Wizard → Dial-up User
2. Interface: wan1
3. Authentication: PSK per user group OR certificate
4. Assign IP pool to dial-up users
5. Firewall policy: dialup tunnel → internal

**FortiClient:** VPN type IPsec, pre-shared key or cert.

**Limitations vs SSL-VPN:**
- NAT traversal sometimes problematic
- Less granular portal control
- SMB default: SSL-VPN preferred for ease

**Native Windows IKEv2:**
- Phase1 compatible with MS defaults
- EAP-RADIUS for AD auth`,
      code: {
        language: 'text',
        caption: 'CLI: dial-up IPsec phase1',
        code: `config vpn ipsec phase1-interface
    edit "Dialup-Users-P1"
        set type dynamic
        set interface "wan1"
        set ike-version 2
        set peertype dialup
        set net-device enable
        set mode-cfg enable
        set proposal aes256gcm-prfsha256
        set dpd on-idle
        set xauthtype auto
        set authmethod psk
        set psksecret <DIALUP_PSK>
    next
end`,
      },
    },
    {
      title: 'Redundant VPN: dual tunnel и SD-WAN integration',
      content: `**Redundancy patterns:**

**1. AWS/Azure dual tunnel:**
- Tunnel 1: distance 5 (primary)
- Tunnel 2: distance 10 (backup)
- Both active for AWS; BGP preferred for dynamic failover

**2. Dual ISP + dual VPN:**
- wan1 → Cloud Tunnel A
- wan2 → Cloud Tunnel B
- SD-WAN selects healthy path

**3. FG-HQ dual WAN to branch:**
- Branch has 2 internet links
- 2 phase1 to HQ (different remote-gw)

**SD-WAN + VPN:**
\`\`\`
SD-WAN rule: traffic to 10.50.0.0/16 → prefer Tunnel1 SLA
Backup: Tunnel2 if Tunnel1 SLA fail
\`\`\`

**Failover test (quarterly):**
1. Shutdown primary tunnel interface
2. Verify traffic via backup < 30 sec
3. Restore, verify failback

**Monitoring:** FortiAnalyzer VPN uptime report, CloudWatch/Azure metrics.`,
    },
    {
      title: 'VPN performance tuning',
      content: `**IPsec performance:**

| Tuning | Effect |
|--------|--------|
| AES-GCM (not CBC) | Hardware accel, faster |
| Enable NPU offload | Wire-speed crypto on NP6/NP7 |
| Reduce PFS rekey frequency | Less CPU (trade security) |
| Single phase2 per tunnel | Simpler, faster |
| Disable DPD aggressive mode | Less overhead (careful) |

**Check NPU offload:**
\`\`\`
diagnose vpn tunnel list
get hardware npu np6 port-list
\`\`\`

**SSL-VPN performance:**

| Tuning | Effect |
|--------|--------|
| Split tunnel | Reduces FG load 60-80% |
| Disable full UTM on VPN→WAN | Faster internet for remote |
| FortiClient DTLS | Better on lossy links |
| Session limit per user | Prevent abuse |
| Upgrade FG-60F → 100F | If > 50 concurrent SSL |

**Bandwidth formula:**
\`\`\`
SSL-VPN load = concurrent_users × avg_mbps_per_user
If > 70% WAN → split tunnel or upgrade
\`\`\`

**Benchmark:** iperf3 through VPN tunnel during pilot.`,
    },
    {
      title: 'FortiOS 7.4 lab: VPN на VM',
      content: `**Lab topology (2× FG VM or FG + AWS free tier):**

\`\`\`
[FG-HQ VM] ←IPsec→ [FG-Branch VM]
     ↓
[SSL-VPN client VM / FortiClient on laptop]
\`\`\`

**Part 1 — Site-to-site (60 min):**
1. Deploy 2 FG VMs (VMware/KVM/ESXi)
2. Configure wan1 on both (same lab network, static IPs)
3. IPsec wizard site-to-site HQ↔Branch
4. Policies + static routes both sides
5. Ping branch LAN from HQ

**Part 2 — SSL-VPN (60 min):**
1. SSL-VPN settings on FG-HQ
2. Create portal split-tunnel
3. Local user or LDAP (lab AD optional)
4. FortiClient connect from client VM
5. Verify access to branch via HQ routing

**Part 3 — Troubleshooting (30 min):**
1. Break PSK, fix with ike debug
2. Remove firewall policy, diagnose ssl list
3. Document fix in runbook format

**Optional:** AWS free tier VPC + VPN Connection to single FG VM.`,
    },
    {
      title: 'Справочник diagnose/debug (VPN)',
      content: `**IPsec diagnostics:**

| Команда | Назначение |
|---------|------------|
| \`diagnose vpn ike gateway list\` | Phase1 status |
| \`diagnose vpn tunnel list\` | Phase2 / tunnel status |
| \`diagnose vpn ipsec tunnel list\` | Detailed IPsec SA |
| \`diagnose debug application ike -1\` | IKE verbose debug |
| \`diagnose debug application ipsec -1\` | IPsec verbose |
| \`get vpn ipsec tunnel summary\` | Tunnel summary |

**SSL-VPN diagnostics:**

| Команда | Назначение |
|---------|------------|
| \`diagnose vpn ssl list\` | Active SSL sessions |
| \`diagnose vpn ssl stats\` | SSL-VPN statistics |
| \`get vpn ssl settings\` | SSL-VPN config |
| \`diagnose test authserver ldap <name> <user> <pass>\` | LDAP auth test |
| \`diagnose debug application sslvpn -1\` | SSL-VPN debug |

**Always:**
\`\`\`
diagnose debug enable
# reproduce issue
diagnose debug disable
diagnose debug reset
\`\`\``,
    },
    {
      title: 'Production case study 1: 200 remote users SSL-VPN',
      content: `**Клиент:** consulting firm, 200 SSL-VPN users, FG-100F.

**Challenge:** FG-60F maxed at 120 concurrent users, CPU 90%.

**Solution:**
- Upgrade FG-100F
- Split tunnel: only 192.168.0.0/16 + 10.50.0.0/16 (AWS)
- FortiClient EMS deployment via Intune
- FortiToken MFA all users
- 2 portals: standard split + admin full tunnel

**Results:**
- Concurrent capacity: 180 peak, CPU 55%
- User satisfaction improved (internet not via VPN)
- MFA blocked credential stuffing (400 fails/week from abroad)

**Lesson:** size VPN by concurrent sessions, not employee count.`,
    },
    {
      title: 'Production case study 2: AWS dual tunnel failover',
      content: `**Клиент:** e-commerce, office to AWS VPC for ERP.

**Setup:** 2 AWS VPN tunnels, static routing, FG-100F.

**Incident:** AWS maintenance on Tunnel 1, ERP down 45 min (no failover).

**Root cause:** Only Tunnel 1 had static route; Tunnel 2 configured but distance not set.

**Fix:**
- Route 10.50.0.0/16 → Tunnel1 distance 5
- Route 10.50.0.0/16 → Tunnel2 distance 10
- Health check script pings ERP hourly via both tunnels

**Post-fix:** failover in 8 seconds on Tunnel 1 disable test.`,
    },
    {
      title: 'Production case study 3: certificate VPN for partner',
      content: `**Клиент:** manufacturer, B2B IPsec to 5 suppliers.

**Requirement:** no shared PSK (supplier churn risk).

**Solution:**
- Internal CA signs FG and partner certs
- Certificate-based phase1 each supplier
- Unique phase1 per partner (peer ID validation)
- Quarterly cert rotation automated

**Benefits:**
- Revoke one supplier cert without affecting others
- Audit trail per partner connection
- Passed customer security questionnaire

**Operational overhead:** CA management — use FortiAuthenticator or existing AD CS.`,
    },
    {
      title: 'FAQ: 12 частых вопросов (VPN)',
      content: `**1. SSL-VPN vs IPsec for remote users?**
SSL-VPN: easier, FortiClient, port 443. IPsec: performance, native OS.

**2. Split vs full tunnel default?**
Split for regular users. Full only for admins/compliance.

**3. How many SSL-VPN users on FG-60F?**
200 max licensed; practical 50-80 with UTM.

**4. VPN without FortiClient?**
Web mode (limited) or IPsec with native OS/client.

**5. AWS one tunnel enough?**
No. Always configure both AWS tunnels.

**6. MFA bypass for service accounts?**
No. Service accounts shouldn't use VPN; use site-to-site.

**7. IPsec PSK length?**
Minimum 32 random characters.

**8. SSL-VPN on non-443 port?**
Possible but breaks restrictive firewalls. Stay on 443.

**9. Dial-up IPsec vs SSL same pool?**
Use separate IP pools to avoid conflicts.

**10. VPN logs retention?**
365 days recommended for audit.

**11. Geo-block SSL-VPN?**
Effective against brute force. Whitelist travelers.

**12. Certificate expired — VPN down?**
Yes. Monitor cert expiry 30 days ahead.`,
    },
    {
      title: 'NSE4 exam topics: mapping (VPN)',
      content: `| NSE4 Domain | This chapter | Weight |
|-------------|--------------|--------|
| **IPsec VPN** | Phase1/2, site-to-site, route-based | ~15% |
| **SSL-VPN** | Portals, tunnel mode, policies | ~15% |
| **Authentication** | LDAP, FortiToken, certs | ~10% |
| **Troubleshooting** | ike/ssl diagnose | ~10% |

**Likely exam scenarios:**
- Configure site-to-site IPsec between 2 FGs
- SSL-VPN with LDAP group mapping
- Fix VPN «connected no traffic» (missing policy)
- Identify phase1 vs phase2 failure from debug

**Lab exam prep:** 2 VM FG site-to-site + SSL-VPN in 90 min.`,
    },
    {
      title: 'Interview Q&A: 10 вопросов (VPN)',
      content: `**Q1: Phase1 vs Phase2?**
A: Phase1 = IKE SA (management channel). Phase2 = IPsec SA (data tunnel).

**Q2: Route-based vs policy-based?**
A: Route-based uses tunnel interface + routes. Policy-based uses selectors. Always route-based new deployments.

**Q3: SSL-VPN tunnel IP pool purpose?**
A: Assigns virtual IP to client for source address in firewall policies.

**Q4: Why ssl.root interface?**
A: Logical interface representing all SSL-VPN tunnel traffic ingress.

**Q5: Split tunnel security risk?**
A: Infected laptop bypasses FG for internet. Mitigate with EMS compliance.

**Q6: AWS VPN two tunnels?**
A: AWS redundancy standard. Configure both on FG with different distances.

**Q7: FortiToken vs RADIUS MFA?**
A: FortiToken native on FG. RADIUS via FortiAuthenticator/Azure for centralized MFA.

**Q8: IPsec NAT traversal?**
A: UDP 4500 encapsulation when FG behind NAT. Enable NAT-T.

**Q9: VPN user not in policy group?**
A: Policy \`set groups\` must match user's AD/LDAP group.

**Q10: Debug IPsec phase1 fail?**
A: \`diagnose debug application ike -1\`, check PSK, crypto, peer ID, UDP 500/4500.`,
    },
    {
      title: 'Security Rating: hardening VPN',
      content: `**VPN Security Rating findings:**

| Finding | Fix |
|---------|-----|
| SSL-VPN no MFA | Enable FortiToken all users |
| IKEv1 enabled | Disable, IKEv2 only |
| Weak IPsec crypto (DES/3DES) | AES-256-GCM |
| SSL-VPN web mode enabled unused | Disable portal |
| Local VPN users | Migrate to LDAP |
| No VPN logging | Enable VPN event logs → FAZ |
| PSK < 32 chars | Rotate strong PSK |
| Admin VPN full tunnel without UTM | Enable UTM on ssl→wan |
| No idle timeout | Set 8h max (4h admins) |
| No geo-block on VPN | Block high-risk countries |

**Verify:**
\`\`\`
get vpn ssl settings
diagnose vpn ike gateway list
\`\`\``,
    },

    {
      title: 'Сравнение VPN технологий для SMB',
      content: `**FortiGate SSL-VPN vs alternatives:**

| Criteria | FortiGate SSL-VPN | WireGuard | IPsec (native OS) |
|----------|-------------------|-----------|-------------------|
| Integration | Native FG + UTM | Separate server/container | FG or standalone |
| Client | FortiClient | WireGuard app | Built-in OS |
| MFA | FortiToken, RADIUS | Limited | Depends |
| AD integration | Native LDAP | External (script) | Via RADIUS |
| UTM inspection | Yes (full tunnel) | No (bypass FG) | Yes (if via FG) |
| Performance | Good | Excellent | Good |
| Complexity | Medium | Low | High |
| Cost | Included in FG | Free (OSS) | Included |

**Рекомендация SMB:**
- Already on FortiGate → **SSL-VPN** (best integration, AD, MFA, logging)
- Cloud-native startup без FG → WireGuard on VPS (simple, fast)
- Multi-site corporate → IPsec site-to-site (FG-to-FG or FG-to-cloud)
- Don't mix: one remote access solution, fully managed

**Future:** ZTNA (FortiGate ZTNA tags) replacing traditional VPN for SaaS access. Monitor Fortinet ZTNA for hybrid model.`,
    },
  ],
  practice: [
    'Настрой SSL-VPN tunnel mode с LDAP authentication на AD в lab',
    'Создай 2 portals: split-tunnel (users) и full-tunnel (admins)',
    'Разверни FortiToken MFA для 3 test users',
    'IPsec site-to-site: FG-HQ ↔ FG-Branch (2 VM) с IKEv2 AES-256-GCM',
    'IPsec к AWS: подними VPN Connection в AWS free tier, подключи FG VM — оба tunnel',
    'Настрой split tunnel: только 192.168.10.0/24 и 192.168.20.0/24',
    'Напиши runbook onboarding remote worker (1 страница)',
    'Troubleshoot: сломай PSK на IPsec, найди причину через ike debug',
    'Troubleshoot: удали user из AD group, verify VPN denied',
    'Сравни bandwidth: full tunnel vs split tunnel (iperf3 test)',
    'Настрой FortiClient EMS trial (25 endpoints) с compliance check',
    'Azure VPN Gateway: документируй phase1 параметры для Azure RouteBased',
    'Certificate IPsec: настрой authmethod signature на lab tunnel',
    'FortiOS 7.4 lab: полный VPN lab VMware/KVM/ESXi (site-to-site + SSL)',
    'Redundant VPN: dual tunnel failover test с distance metrics',
  ],
  resources: [
    { title: 'FortiGate 7.4 SSL-VPN Guide', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/ssl-vpn/103102/ssl-vpn-overview' },
    { title: 'FortiGate IPsec VPN Guide', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/104465/ipsec-vpn' },
    { title: 'AWS Site-to-Site VPN', url: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html' },
    { title: 'Azure VPN Gateway', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-devices' },
    { title: 'FortiClient Downloads', url: 'https://www.fortinet.com/support/product-downloads' },
    { title: 'FortiClient EMS', url: 'https://docs.fortinet.com/product/forticlient/7.4' },
    { title: 'FortiGate IPsec VPN Tuning', url: 'https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/104465/ipsec-vpn' },
    { title: 'AWS FortiGate VPN config download', url: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/Examples.html' },
  ],
}
