import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'OPNsense — VPN: WireGuard, OpenVPN, IPsec',
  duration: '6–8 hours',
  description:
    'WireGuard road warrior and site-to-site, OpenVPN SSL/TLS with CSO, IPsec Phase1/2 to AWS/Azure, MFA, split/full tunnel, firewall, DDNS, troubleshooting and hardening',
sections: [
    {
      title: 'VPN selection matrix: WireGuard vs OpenVPN vs IPsec',
      content: `OPNsense supports three major VPN technologies out of the box. For SMB and homelab in 2026, the choice depends on scenario, clients, and AD/MFA integration requirements.

| Criterion | WireGuard | OpenVPN | IPsec |
|----------|-----------|---------|-------|
| **Protocol** | UDP, modern crypto | TLS/SSL or UDP | IKEv1/v2 + ESP |
| **Road warrior** | Excellent | Excellent | Fair |
| **Site-to-site** | Excellent | Good | Excellent (cloud) |
| **Cloud AWS/Azure** | No native | Rare | **Standard** |
| **Clients** | WG app all platforms | OpenVPN Connect | Native OS, strongSwan |
| **MFA** | External RADIUS | RADIUS, OTP | RADIUS, EAP |
| **Performance** | High | Medium | Medium–high |
| **Complexity** | Low | Medium (CA) | High (Phase1/2) |
| **Port** | UDP 51820 | UDP 1194 / TCP 443 | UDP 500, 4500 |
| **Split tunnel** | AllowedIPs | push routes / CSO | routes / selectors |

**SMB recommendations 2026:**

| Scenario | Choice | Why |
|----------|-------|--------|
| Remote employees | **WireGuard** | Simplicity, speed, mobile |
| Legacy OpenVPN clients | **OpenVPN** | .ovpn export, CSO |
| Office ↔ AWS/Azure | **IPsec** | Vendor config download |
| Office ↔ branch | WG or IPsec | WG simpler; IPsec for compliance |
| Contractors restricted | OpenVPN CSO | Per-user routes |

**Do not use:** PPTP, L2TP without IPsec.

**Principle:** one primary remote access + IPsec for site-to-site/cloud.`,
    },
    {
      title: 'VPN architecture on OPNsense',
      content: `VPN on OPNsense = **tunnel interface** + **routing** + **firewall**.

| VPN | Interface | GUI |
|-----|-----------|-----|
| WireGuard | wg0… | VPN → WireGuard → Local |
| OpenVPN | ovpns1… | VPN → OpenVPN → Servers |
| IPsec | enc0 / VTI | VPN → IPsec |

**Road warrior topology:**
\`\`\`
Internet → WAN → OPNsense (wg0) → tunnel 10.255.0.0/24 → LAN/VLANs
\`\`\`

**Packet path:**
1. Client → UDP 51820 WAN
2. Decap on wg0, source 10.255.0.x
3. Firewall: WireGuard → LAN pass
4. Route to destination subnet
5. Return symmetric

**Critical:**
- Rules on VPN interface inbound
- Outbound NAT (usually auto)
- DNS (Unbound on VPN IF or push)
- Routes (static / push / AllowedIPs)

Config in config.xml: \`<wireguard>\`, \`<openvpn>\`, \`<ipsec>\`. Backup before changes.`,
    },
    {
      title: 'WireGuard: principles and cryptography',
      content: `**WireGuard** — L3 VPN with fixed modern crypto. No cipher negotiation.

**Concepts:**
- Private/Public key per **device**
- **Peer** — remote with known public key
- **AllowedIPs** — routing + ACL
- **Endpoint** — IP:port for initiator
- **PersistentKeepalive** — NAT keepalive (~25s)

**Crypto:** Curve25519, ChaCha20-Poly1305, BLAKE2s.

**OPNsense UI:**
- **Local** — instance wg0: port, tunnel address
- **Endpoints** — peers: keys, allowed IPs, endpoint

**Features:**
- Identity = key, not username
- MFA via RADIUS overlay
- Roaming: IP change handled well

**Capacity:** 2 vCPU → 200+ Mbps typical.`,
    },
    {
      title: 'WireGuard Road Warrior: Local Instance and peers',
      content: `**Scenario:** remote users → corporate VLANs.

**Step 1 — Local Instance (VPN → WireGuard → Local → +):**
| Field | Example | Purpose |
|------|--------|------------|
| Name | wg0 | Interface name |
| Listen Port | 51820 | UDP on WAN |
| Tunnel Address | 10.255.0.1/24 | Gateway VPN subnet |
| Disable Routes | off | Auto route WG subnet |

**Step 2 — Generate keys:** UI creates private/public keys for server.

**Step 3 — Endpoint (peer) per device:**
| Field | Example |
|------|--------|
| Name | laptop-alice |
| Public Key | client public key |
| Tunnel Address | 10.255.0.2/32 |
| Allowed IPs | 10.255.0.2/32 |
| Endpoint | empty (road warrior initiates) |

**Step 4 — WAN rule:** Pass UDP 51820 to This Firewall.

**Step 5 — Firewall → WireGuard:** Pass source WireGuard net → dest LAN nets.

**Step 6 — Unbound:** Services → Unbound → Access → allow WireGuard subnet query.

**Multi-device:** unique key + tunnel IP per device (10.255.0.3, .4…).

**Do not:** one shared private key for everyone — compromise = revoke all.`,
      code: {
        language: 'shell',
        caption: 'Shell: WireGuard status on OPNsense',
        code: `# OPNsense shell: check WireGuard instance
wg show
ifconfig wg0

# peers and handshake
wg show wg0 peers
wg show wg0 latest-handshakes`,
      },
    },
    {
      title: 'WireGuard: tunnel addresses, AllowedIPs and DNS',
      content: `**Tunnel Address** on server — gateway subnet (10.255.0.1/24). On client — single host (/32).

**AllowedIPs — bidirectional logic:**

| Side | AllowedIPs | Effect |
|---------|------------|--------|
| Server peer | 10.255.0.2/32 | Accept traffic to client |
| Client peer | 192.168.20.0/24, 192.168.10.0/24 | Route corp subnets via VPN |
| Client full tunnel | 0.0.0.0/0 | All traffic via VPN |

**Split tunnel (client AllowedIPs):**
\`\`\`
192.168.10.0/24, 192.168.20.0/24
\`\`\`
Internet direct, corp via VPN.

**Full tunnel:**
\`\`\`
0.0.0.0/0
\`\`\`
All via OPNsense — NAT WG→WAN rule required.

**DNS:**
- Client config: \`DNS = 192.168.20.1\` (OPNsense Unbound)
- Unbound: listen on wg0, allow queries from 10.255.0.0/24
- Domain override: corp.local → forward to DC

**Server-side AllowedIPs for site-to-site peer:**
\`192.168.100.0/24\` — remote LAN, not only tunnel IP.`,
      code: {
        language: 'text',
        caption: 'WireGuard client config (split tunnel)',
        code: `[Interface]
PrivateKey = <CLIENT_PRIVATE_KEY>
Address = 10.255.0.2/32
DNS = 192.168.20.1

[Peer]
PublicKey = <OPNSENSE_PUBLIC_KEY>
Endpoint = vpn.corp.local:51820
AllowedIPs = 192.168.10.0/24, 192.168.20.0/24
PersistentKeepalive = 25`,
      },
    },
    {
      title: 'WireGuard site-to-site',
      content: `**Scenario:** HQ OPNsense (192.168.0.0/16) ↔ Branch (192.168.100.0/24).

**HQ config:**
- Local wg0, tunnel 10.255.255.1/30
- Peer Branch: public key, Endpoint = branch-wan-ip:51820
- Allowed IPs = 192.168.100.0/24, 10.255.255.2/32

**Branch config (mirror):**
- tunnel 10.255.255.2/30
- Peer HQ: Endpoint = hq-wan-ip:51820
- Allowed IPs = 192.168.0.0/16, 10.255.255.1/32

**Routing:** usually automatic via AllowedIPs; verify Diagnostics → Routes.

**Firewall both sides:**
- WireGuard → LAN: pass remote subnets
- LAN → WireGuard: pass to remote subnets

**NAT:** typically no NAT for site-to-site (pure routing). If overlapping — NAT is a rare fix.

**DDNS:** if WAN is dynamic — Endpoint hostname in peer.

**vs IPsec site-to-site:** WG simpler with 2 peers; IPsec if partner/cloud requires IKE.`,
      code: {
        language: 'text',
        caption: 'WireGuard site-to-site HQ peer (reference)',
        code: `# HQ wg0 conceptual (wg-quick style reference)
[Interface]
Address = 10.255.255.1/30
ListenPort = 51820
PrivateKey = <HQ_PRIVATE>

[Peer]
PublicKey = <BRANCH_PUBLIC>
Endpoint = branch.ddns.net:51820
AllowedIPs = 192.168.100.0/24, 10.255.255.2/32
PersistentKeepalive = 25`,
      },
    },
    {
      title: 'WireGuard client configs: Windows, macOS, mobile',
      content: `**Windows 10/11:**
1. Install WireGuard from wireguard.com
2. Import tunnel from file or QR
3. Activate — check \`ipconfig\` for tunnel adapter
4. \`ping 192.168.20.1\` (OPNsense LAN)

**macOS:**
- WireGuard app (App Store) or \`brew install wireguard-tools\`
- Import .conf
- Split tunnel: verify \`netstat -rn\` only corp routes via utun

**iOS / Android:**
- WireGuard app → scan QR (OPNsense plugin os-wireguard can export QR per peer)
- **Always-on** (Android): VPN settings → always-on + block without VPN (kill switch)

**Export from OPNsense:**
- VPN → WireGuard → Endpoints → Export or os-wireguard QR plugin

**Troubleshooting clients:**
| Issue | Fix |
|-------|-----|
| Handshake 0 | WAN rule, wrong endpoint, clock skew |
| Connected no LAN | AllowedIPs, firewall, DNS |
| Slow | MTU — try 1420 interface MTU |
| Duplicate IP | unique tunnel address per peer |

**GPO/Intune:** distribute .conf via MDM (remove private key from repo — per-device deploy).`,
    },
    {
      title: 'OpenVPN Road Warrior: SSL/TLS and architecture',
      content: `**OpenVPN** — mature VPN with TLS authentication, username/password, per-user certs.

**Road Warrior architecture:**
\`\`\`
Client (OpenVPN Connect) → TLS 443/1194 → ovpns1 → IP pool → firewall → LAN
\`\`\`

**GUI: VPN → OpenVPN → Servers → Add Server:**
| Setting | Recommended |
|---------|-------------|
| Server mode | Remote Access (SSL/TLS) |
| Protocol | UDP 1194 or TCP 443 (restrictive networks) |
| Device mode | tun (L3) |
| Interface | WAN |
| Crypto | AES-256-GCM |
| Auth | Local auth or RADIUS |
| Tunnel network | 10.8.0.0/24 |
| Local networks | 192.168.10.0/24, 192.168.20.0/24 (push) |
| DNS | 192.168.20.1 |

**Certificates (SSL/TLS):**
1. System → Trust → Authorities → Create internal CA
2. System → Trust → Certificates → Server cert (VPN)
3. Per-user certs optional with TLS+auth

**Firewall:** WAN pass OpenVPN port → This Firewall; OpenVPN → LAN rules.

**Performance:** lower than WireGuard on same CPU — prefer WG unless client constraint.`,
      code: {
        language: 'text',
        caption: 'OpenVPN server config fragment',
        code: `# openvpn server fragment (config.xml reference style)
dev ovpns1
proto udp
port 1194
tls-server
cipher AES-256-GCM
topology subnet
server 10.8.0.0 255.255.255.0
push "route 192.168.10.0 255.255.255.0"
push "route 192.168.20.0 255.255.255.0"
push "dhcp-option DNS 192.168.20.1"
user nobody
group nobody
persist-key
persist-tun`,
      },
    },
    {
      title: 'OpenVPN: users, CA and Certificate Override (CSO)',
      content: `**Local users:** System → Access → Users → + (cert + password).

**RADIUS/AD (production):** System → Access → Servers → RADIUS → AD via NPS or FreeRADIUS.

**Certificate Override (CSO)** — per-user/per-cert overrides:
VPN → OpenVPN → CSO → Add:
| Field | Use |
|-------|-----|
| Common Name | user cert CN |
| Tunnel Network | unique subnet (rare) |
| Routes | custom push routes (contractor) |
| DNS | custom DNS |

**Contractor example:**
- Routes push: only 192.168.10.50/32 (one app server)
- No full LAN access

**Client export:**
VPN → OpenVPN → Client Export → pick server + user → download .ovpn

**Revocation:**
- Disable user in AD/local
- Revoke cert: Trust → Certificates → Revoke
- CRL or OCSP (advanced)

**Best practice:** LDAP/RADIUS primary auth; certs for device identity layer.`,
      code: {
        language: 'text',
        caption: 'OpenVPN CSO snippet (contractor restricted)',
        code: `client-config-dir /var/etc/openvpn/cso
# CSO file: /var/etc/openvpn/cso/contractor1
push "route 192.168.10.50 255.255.255.255"
push "dhcp-option DNS 192.168.20.1"
ifconfig-push 10.8.0.50 10.8.0.1`,
      },
    },
    {
      title: 'OpenVPN site-to-site',
      content: `**Scenario:** OPNsense HQ ↔ remote office OPNsense (or cloud VM).

**Mode:** Peer to Peer (SSL/TLS) or Shared Key (legacy — avoid).

**HQ Server:** Peer to Peer SSL/TLS
- Local: 192.168.0.0/16
- Remote: 192.168.200.0/24
- Remote host: branch-wan-ip

**Branch Client:**
- Mirror settings, initiate to HQ
- Local: 192.168.200.0/24

**Routing:** pushed routes + static if needed.

**Firewall:** OpenVPN interface ↔ LAN on both sides.

**vs WireGuard site-to-site:** OpenVPN if remote device only supports OpenVPN; else WG.

**Troubleshooting:**
- TLS handshake fail → cert mismatch, wrong CA
- Connected no route → push routes missing
- \`cat /var/log/openvpn.log\` on OPNsense`,
    },
    {
      title: 'IPsec fundamentals: Phase 1 and Phase 2',
      content: `**IPsec** — standard for site-to-site, especially cloud.

**Phase 1 (IKE SA)** — management channel:
| Parameter | Recommended |
|-----------|-------------|
| Version | IKEv2 |
| Encryption | AES-256-GCM |
| PRF | SHA256 |
| DH Group | 14 or 19 |
| Lifetime | 28800s |
| Auth | PSK (32+ chars) or Certificates |

**Phase 2 (Child SA)** — data tunnel:
| Parameter | Recommended |
|-----------|-------------|
| Protocol | ESP |
| Encryption | AES-256-GCM |
| PFS | enable, group 19 |
| Lifetime | 3600s |
| Mode | Tunnel |

**OPNsense GUI:** VPN → IPsec → Pre-Shared Keys + Phase 1 + Phase 2.

**Route-based (VTI/enc):** tunnel interface + static routes — **recommended**.

**Policy-based:** selectors define traffic — legacy, avoid new deploys.

**Terminology map:**
- Phase 1 = IKE Connection
- Phase 2 = Child SA / Phase 2 entry
- Remote Gateway = peer WAN IP`,
      code: {
        language: 'text',
        caption: 'IPsec Phase 1/2 parameters (reference)',
        code: `# Phase 1 summary (conceptual OPNsense fields)
ikev2
encryption: aes256gcm
prf: sha256
dhgroup: 19
lifetime: 28800
authentication: mutual_psk
nat_traversal: force

# Phase 2
protocol: esp
encryption: aes256gcm
pfs: on
lifetime: 3600
local: 192.168.0.0/16
remote: 10.50.0.0/16`,
      },
    },
    {
      title: 'IPsec site-to-site: office ↔ branch',
      content: `**HQ (192.168.0.0/16) ↔ Branch (192.168.100.0/24).**

**HQ Phase 1:**
- Connection method: Initiate or Respond
- Remote: branch static IP / DDNS
- Pre-shared key: random 32+
- Crypto: IKEv2 AES-256-GCM, DH19

**HQ Phase 2:**
- Local network: LAN subnet
- Remote network: 192.168.100.0/24
- PFS on

**Branch:** mirror (swap subnets).

**Firewall HQ:**
- IPsec → LAN: pass 192.168.100.0/24
- LAN → IPsec: pass to 192.168.100.0/24

**Diagnostics → Routes:** 192.168.100.0/24 via ipsec interface.

**Test:** ping branch server from HQ LAN.

**Common failures:**
- PSK mismatch
- IKE version mismatch
- Subnet mismatch in Phase 2
- UDP 500/4500 blocked`,
      code: {
        language: 'shell',
        caption: 'Shell: IPsec diagnostics on OPNsense',
        code: `# OPNsense / FreeBSD IPsec status
ipsec statusall
ipsec listsa

# IKE logs
clog /var/log/ipsec/latest.log | tail -50

# Packet capture IKE
tcpdump -ni wan udp port 500 or port 4500`,
      },
    },
    {
      title: 'IPsec to AWS Site-to-Site VPN',
      content: `**Topology:** Office OPNsense ↔ AWS VPC 10.50.0.0/16.

**AWS:**
1. Create Virtual Private Gateway → attach VPC
2. Customer Gateway: office WAN IP
3. Site-to-Site VPN Connection → static routes
4. Download config — vendor **OPNsense** or **Generic**
5. VPC route table: 192.168.0.0/16 → VGW
6. Security Groups: allow office CIDR

**OPNsense (2 tunnels):**
- Tunnel 1 Phase1: AWS endpoint 1, PSK 1
- Tunnel 2 Phase1: AWS endpoint 2, PSK 2
- Phase 2: local 192.168.0.0/16 remote 10.50.0.0/16
- Static routes: 10.50.0.0/16 via tunnel 1 (distance 1), tunnel 2 (distance 2)

**Verify AWS:** Tunnel UP/UP in console.

**BGP option:** advanced — dynamic failover; static OK for SMB.

**Firewall:** LAN → IPsec → AWS; consider restrict to needed ports.`,
      code: {
        language: 'text',
        caption: 'AWS Site-to-Site VPN — OPNsense tunnel 1',
        code: `# AWS Tunnel 1 — Phase 1 fields (example)
Remote Gateway: 52.x.x.x
Local ID: office-wan-ip (match CGW)
Remote ID: 52.x.x.x
IKE: v2
Encryption: AES256-GCM
Authentication: PSK <AWS_TUNNEL1_PSK>
NAT-T: enabled

# Static route
Destination: 10.50.0.0/16
Gateway: ipsec-tunnel1
Distance: 5`,
      },
    },
    {
      title: 'IPsec to Azure VPN Gateway',
      content: `**Topology:** Office ↔ Azure VNet 10.60.0.0/16.

**Azure:**
1. Virtual Network Gateway (RouteBased, Generation1/2)
2. Local Network Gateway: office IP + 192.168.0.0/16
3. Connection: IPsec, IKEv2, shared key
4. Note Azure gateway public IP

**Azure requirements:**
| Parameter | Value |
|-----------|-------|
| IKE | IKEv2 |
| Encryption | AES256 |
| Integrity | SHA256 or GCM |
| PFS | PFS2048 or ECP256 |
| SA lifetime | 27000–3600s (match portal) |

**OPNsense:** Phase1 to Azure GW IP, PSK from portal, DH19, AES-GCM.

**Common issues:**
- Phase2 fail → lifetime/PFS mismatch (check Azure sample)
- One-way traffic → Azure NSG blocks return
- UDP 500/4500 on office WAN

**Monitoring:** Azure Portal → VPN Gateway → Connections → status/bytes.`,
      code: {
        language: 'text',
        caption: 'Azure VPN Gateway — Phase 1 alignment',
        code: `# Azure Phase 1 alignment
ikev2
encryption: aes256gcm
integrity: aes256gcm (GCM combined)
prf: sha256
dhgroup: 19
sa lifetime: 28800
psk: <AZURE_SHARED_KEY>
remote: <AZURE_GATEWAY_PUBLIC_IP>`,
      },
    },
    {
      title: 'MFA for VPN on OPNsense',
      content: `WireGuard has no native MFA — identity = key. MFA options:

| Method | Works with | Setup |
|--------|------------|-------|
| **RADIUS + MFA** | OpenVPN, IPsec dial-up | FreeRADIUS + privacyIDEA / Duo |
| **Azure MFA via NPS** | OpenVPN RADIUS | Windows NPS extension |
| **TOTP on portal** | OpenVPN local + plugin | os-nginx + separate auth |
| **Per-device WG keys** | WireGuard | Compromise scope limited |
| **mTLS double layer** | OpenVPN | User pass + cert |

**Production OpenVPN + AD + MFA:**
1. AD user credentials
2. RADIUS to NPS or FreeRADIUS
3. MFA challenge (Duo/privacyIDEA)
4. OpenVPN server auth: RADIUS

**WireGuard MFA patterns:**
- **Gate access:** no WAN WG port; users authenticate to portal, get temporary peer config (scripted)
- **Overlay:** WG only from known IPs (weak)
- **Accept key-only** for managed devices with MDM attestation

**IPsec dial-up:** EAP-RADIUS + MFA on RADIUS server.

**Mandatory:** MFA for all remote access in production — password alone is unacceptable.`,
    },
    {
      title: 'Split tunnel vs Full tunnel',
      content: `**Split tunnel:** only corporate subnets via VPN; internet direct.

| Pros | Cons |
|------|------|
| Better UX, less WAN load | Bypasses OPNsense UTM for web |
| Lower latency for SaaS | Infected laptop → direct exfil |

**Full tunnel:** 0.0.0.0/0 via VPN.

| Pros | Cons |
|------|------|
| Full inspection, DLP possible | High WAN bandwidth |
| Consistent policy | Latency for all traffic |

**Implementation:**

| VPN | Split | Full |
|-----|-------|------|
| WireGuard | Client AllowedIPs corp nets | AllowedIPs 0.0.0.0/0 + NAT |
| OpenVPN | push routes specific | push redirect-gateway def1 |
| IPsec | specific Phase2 / routes | route all via tunnel |

**SMB 2026 matrix:**

| User type | Mode | Routes |
|-----------|------|--------|
| Employees | Split | 192.168.x, 10.50 AWS |
| IT admins | Full | 0.0.0.0/0 |
| Contractors | Split restricted | single host /32 |

**DNS split:** internal DNS via VPN; public DNS direct. Critical for \`.corp.local\`.`,
      code: {
        language: 'text',
        caption: 'Full tunnel — OpenVPN and WireGuard',
        code: `# OpenVPN full tunnel push
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 192.168.20.1"

# WireGuard full tunnel (client)
AllowedIPs = 0.0.0.0/0`,
      },
    },
    {
      title: 'Firewall rules for VPN interfaces',
      content: `**Principle:** VPN users ≠ trusted. Least privilege + log.

**WireGuard rules (Firewall → Rules → WireGuard):**

| # | Source | Dest | Action | Notes |
|---|--------|------|--------|-------|
| 1 | WG net | LAN Servers | Pass | SMB, RDP, DNS |
| 2 | WG net | LAN Users | Pass | as needed |
| 3 | WG net | any | Block | log |

**OpenVPN:** same on OpenVPN tab — source OpenVPN net.

**IPsec site-to-site:** IPsec → LAN and LAN → IPsec.

**WAN rules:**
- Pass UDP 51820 / OpenVPN port to This Firewall
- **Do not** expose management GUI to WAN

**Outbound NAT:**
- WG/OpenVPN → WAN: auto outbound NAT usually applies
- Full tunnel WG: ensure NAT WG subnet → WAN

**Aliases:** group VPN_CLIENTS, NET_INTERNAL — use in rules.

**Logging:** enable on deny rules; forward to remote syslog.`,
      code: {
        language: 'shell',
        caption: 'Shell: firewall rules and states for VPN',
        code: `# Check rules with counters
pfctl -vvsr | grep -A5 wireguard

# States from VPN client
pfctl -s state | grep 10.255.0

# Rule debug (careful in prod)
pfctl -ss | head`,
      },
    },
    {
      title: 'Kill switch and endpoint security',
      content: `**Kill switch** — block all traffic when VPN disconnected.

| Platform | Implementation |
|----------|----------------|
| Windows | WireGuard not built-in; OpenVPN client option |
| macOS | Limited; use Little Snitch or VPN client feature |
| iOS | VPN profile on-demand rules |
| Android | Always-on VPN + block without VPN |
| Linux | nftables script, NetworkManager |

**OpenVPN Connect:** settings → kill switch (platform dependent).

**WireGuard Android:** Always-on + «Block connections without VPN».

**Corporate policy:**
- Managed laptops: Intune compliance + VPN required for corp resources
- Conditional Access (Azure): block if not compliant

**Not a replacement for MFA:** kill switch prevents leak when VPN drops; does not authenticate user.

**Lab test:**
1. Connect VPN, verify corp access
2. Disconnect VPN
3. Confirm no route to corp subnets (ping fail)
4. Confirm internet works or blocked per policy`,
    },
    {
      title: 'Dynamic DNS for VPN endpoints',
      content: `Remote users need stable **Endpoint** when office WAN is dynamic.

**OPNsense DDNS:**
1. Services → Dynamic DNS → + account (Cloudflare, DuckDNS, No-IP)
2. Hostname: vpn.corp.com or vpn.ddns.net
3. Verify: Diagnostics → DNS Lookup

**WireGuard peer Endpoint:**
\`Endpoint = vpn.corp.com:51820\`

**OpenVPN:** users connect to hostname in .ovpn.

**IPsec site-to-site:** remote peer Phase1 uses DDNS hostname if supported; AWS/Azure need static IP on office side (or update CGW when IP changes).

**Cloudflare API token:** preferred over global API key.

**Monitoring:** alert if DDNS update fails — VPN unreachable for remote users.

**Split DNS:** internal users resolve vpn.corp.local; external use same or public hostname.`,
    },
    {
      title: 'Troubleshooting: handshake and connectivity',
      content: `**WireGuard handshake = 0:**

| Check | Action |
|-------|--------|
| WAN rule | UDP 51820 pass |
| Endpoint | correct IP:port, DDNS resolved |
| Keys | public keys match pair |
| Clock | NTP synced |
| ISP | UDP not blocked (try 443 fallback — needs port change) |

**OpenVPN TLS fail:**
- Cert expired / wrong CA
- CN mismatch
- Firewall port
- \`tail -f /var/log/openvpn.log\`

**IPsec Phase 1 fail:**
- PSK mismatch
- IKEv1 vs v2
- \`clog /var/log/ipsec/latest.log\`
- tcpdump port 500,4500

**Connected but no ping:**
- Firewall rule missing on VPN interface
- Wrong source network in rule
- Destination host firewall

**Diagnostic flow:**
1. VPN interface up?
2. Peer/session established?
3. Routes correct?
4. Firewall pass?
5. Return path symmetric?`,
      code: {
        language: 'shell',
        caption: 'Shell: VPN connectivity troubleshooting',
        code: `# WireGuard deep debug
wg show all dump

# OpenVPN log
tail -100 /var/log/openvpn.log

# IPsec
ipsec statusall
ipsec stroke loglevel 2`,
      },
    },
    {
      title: 'Troubleshooting: routing, NAT and MTU',
      content: `**Routing issues:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| Corp net unreachable | No route | AllowedIPs / push / static route |
| One direction works | Missing return rule | LAN → VPN rule |
| Wrong path | Static route priority | Distance metrics |
| AWS partial | Only one tunnel routed | Second static route |

**NAT issues:**
- Full tunnel WG without NAT → no internet
- Add outbound NAT WG → WAN
- Double NAT at branch — unique subnets required

**MTU / fragmentation:**

VPN overhead reduces effective MTU. Symptoms: HTTPS works, large transfers hang.

| VPN | Suggested MTU |
|-----|---------------|
| WireGuard | 1420 on client interface |
| OpenVPN | mssfix 1400 |
| IPsec | 1400 or TCP clamp |

**OpenVPN:** \`mssfix 1400\` in server custom options.

**Test:** \`ping -s 1372 192.168.20.1\` (adjust size).

**TCP MSS clamping:** Firewall → Settings → Normalization — clamp MSS on VPN interface.

**Traceroute:** from VPN client — verify path through OPNsense.`,
    },
    {
      title: 'HA considerations: CARP and VPN',
      content: `**CARP** (System → High Availability) — active/passive pair with shared VIP.

**VPN on HA pair:**

| VPN | HA behavior |
|-----|-------------|
| WireGuard | Peers point to CARP WAN VIP; state sync via pfsync |
| OpenVPN | Server on VIP; sessions survive if pfsync enabled |
| IPsec | Remote peer uses WAN VIP; both nodes need matching config |

**Requirements:**
- Config sync (XMLRPC) master → backup
- pfsync interface for state table
- Unique host IDs, same CARP VIPs

**Failover test:**
1. VPN connected
2. Shutdown master
3. Backup takes VIP < 3s
4. VPN reconnects (WG may need seconds)

**Cloud limitation:** CARP needs MAC VIP — verify hypervisor (Proxmox virtio OK with promisc).

**Alternative:** single node + cold spare config backup; DNS failover manual — acceptable for small SMB.`,
    },
    {
      title: 'Security hardening VPN: production checklist',
      content: `**Mandatory checklist:**

1. MFA for OpenVPN/IPsec user auth (RADIUS)
2. WireGuard: unique keys per device; rotate on offboard
3. No management GUI on WAN
4. Strong PSK IPsec: 32+ random, annual rotation
5. IKEv2 only; disable IKEv1
6. Crypto: AES-256-GCM, DH14+
7. Split tunnel default; full only admins
8. Firewall least privilege VPN → internal
9. Log all VPN deny + allow (storage budget)
10. DDNS + monitor WAN IP changes
11. Disable unused VPN protocols (if only WG — no OpenVPN WAN)
12. NTP synced (IKE sensitive)
13. Auto config backup before VPN changes
14. Quarterly AD group audit VPN users
15. Revoke certs on offboard (OpenVPN)
16. Rate limit WAN (os-nginx or fail2ban) for OpenVPN
17. Geo-block WAN VPN ports (optional)
18. IDS on WAN (Suricata) — detect scan on VPN ports

**Verify:**
\`\`\`
wg show
ipsec statusall
pfctl -vvsr
\`\`\``,
    },
    {
      title: 'Lab: full VPN on OPNsense VM',
      content: `**Topology (Proxmox/VMware):**
\`\`\`
[OPNsense VM] WAN + LAN
[Client VM/laptop] WireGuard + OpenVPN
[Optional: 2nd OPNsense] site-to-site peer
\`\`\`

**Part 1 — WireGuard road warrior (90 min):**
1. wg0 instance, tunnel 10.255.0.1/24
2. Peer for client, export config
3. WAN + WireGuard firewall rules
4. Connect, ping LAN, access file share

**Part 2 — OpenVPN (90 min):**
1. Create CA + server cert
2. Remote Access SSL/TLS server
3. User + client export .ovpn
4. Connect, verify pushed routes

**Part 3 — IPsec site-to-site (90 min):**
1. Second OPNsense VM OR AWS free tier VPN
2. Phase1/2 both sides
3. Policies + ping remote LAN

**Part 4 — Break & fix (60 min):**
1. Wrong PSK — read ipsec log
2. Remove firewall rule — diagnose WG handshake ok but no pass
3. MTU test large ping

**Deliverable:** runbook 1 page per VPN type.`,
    },
    {
      title: 'FAQ: 15 common questions (OPNsense VPN)',
      content: `| # | Question | Answer |
|---|--------|--------|
| 1 | WG vs OpenVPN for remote? | WG default; OpenVPN for legacy |
| 2 | WG MFA? | External RADIUS or key-only managed devices |
| 3 | Split vs full default? | Split employees; full admins only |
| 4 | Change WG port? | Yes; update WAN rule + clients |
| 5 | AWS one tunnel enough? | No — configure both tunnels |
| 6 | OpenVPN TCP 443? | Yes for restrictive networks |
| 7 | IPsec PSK length? | Minimum 32 random chars |
| 8 | Multiple WG instances? | Yes wg0, wg1 different purposes |
| 9 | CARP + WG? | Point peers to CARP VIP |
| 10 | Logs where? | /var/log/openvpn.log, ipsec/, filter |
| 11 | QR code peers? | os-wireguard plugin |
| 12 | Full tunnel without NAT? | Internet breaks — add outbound NAT |
| 13 | Overlapping subnets site-to-site? | Redesign or NAT (painful) |
| 14 | Revoke WG client? | Delete peer endpoint |
| 15 | Cert expired OpenVPN? | Renew server cert, redistribute |`,
    },
    {
      title: 'Interview Q&A: 12 questions (OPNsense VPN)',
      content: `**Q1: WireGuard AllowedIPs on client for split tunnel?**
A: Corporate CIDRs only — e.g. 192.168.10.0/24, 192.168.20.0/24.

**Q2: Phase 1 vs Phase 2 IPsec?**
A: Phase1 IKE SA management; Phase2 ESP data SA.

**Q3: OpenVPN CSO use case?**
A: Per-user route/DNS override — contractor to single server.

**Q4: Why UDP 4500 for IPsec?**
A: NAT-T encapsulation when peer behind NAT.

**Q5: WG handshake 0 — top causes?**
A: Firewall, wrong keys/endpoint, no WAN pass rule.

**Q6: Route-based vs policy-based IPsec?**
A: Route-based uses tunnel IF + routes; policy uses selectors. Prefer route-based.

**Q7: Full tunnel WG setup?**
A: Client AllowedIPs 0.0.0.0/0 + outbound NAT WG→WAN + firewall.

**Q8: DNS fails on VPN connected?**
A: Push/internal DNS not set; client uses public DNS; fix Unbound listen.

**Q9: AWS VPN two tunnels purpose?**
A: Redundancy — different distances for failover.

**Q10: Kill switch on Android WG?**
A: Always-on VPN + block without VPN in settings.

**Q11: How revoke OpenVPN user?**
A: Disable AD/local user + revoke cert if cert-based.

**Q12: MTU symptoms and fix?**
A: Small packets OK, large fail — lower MTU/mssfix 1400.`,
    },
    {
      title: 'Case study 1: 80 remote users WireGuard',
      content: `**Client:** IT services, 80 consultants, OPNsense on Proxmox (4 vCPU).

**Challenge:** OpenVPN on old pfSense — CPU 85%, complaints on latency.

**Solution:**
- Migrate to OPNsense + WireGuard road warrior
- Split tunnel: 192.168.0.0/16 + AWS 10.50.0.0/16 via AllowedIPs
- Per-device keys distributed via Intune .conf
- Unbound on wg0 for internal DNS
- Firewall: WG → servers full; WG → users limited ports

**Results:**
- CPU 25% peak; latency -40%
- Onboard: add peer + Intune push 10 min
- Incident: lost laptop → delete one peer

**Lesson:** size by concurrent users; WG scales better than OpenVPN on same hardware.`,
    },
    {
      title: 'Case study 2: AWS dual tunnel failover',
      content: `**Client:** E-commerce SMB, ERP in AWS VPC 10.50.0.0/16.

**Setup:** OPNsense IPsec, 2 AWS tunnels, static routing.

**Incident:** AWS maintenance Tunnel 1 — ERP unreachable 40 min.

**Root cause:** Only Tunnel 1 had static route; Tunnel 2 configured but no route.

**Fix:**
- Route 10.50.0.0/16 via Tunnel1 distance 5
- Route 10.50.0.0/16 via Tunnel2 distance 10
- Monitor script ping ERP via both paths

**Post-fix:** failover 12 seconds on Tunnel 1 disable test.`,
    },
    {
      title: 'Case study 3: Contractor access OpenVPN CSO',
      content: `**Client:** Manufacturing, external auditor needs one ERP server 192.168.10.50.

**Requirement:** no lateral movement to LAN.

**Solution:**
- OpenVPN SSL/TLS + RADIUS AD auth
- CSO for auditor cert: push route 192.168.10.50/32 only
- Firewall OpenVPN → LAN: pass only to 192.168.10.50:443
- MFA via Duo on RADIUS
- 30-day cert expiry

**Outcome:** audit passed; no other internal hosts reachable from VPN.`,
    },
    {
      title: 'Comparing OPNsense VPN with FortiGate SSL-VPN',
      content: `| Criterion | OPNsense WG/OpenVPN | FortiGate SSL-VPN |
|----------|---------------------|-------------------|
| Cost | Free | License + hardware |
| AD integration | RADIUS | Native LDAP |
| MFA | RADIUS overlay | FortiToken native |
| UTM on VPN | Suricata optional | Built-in IPS/AV |
| Client | WG / OpenVPN | FortiClient |
| Cloud S2S | IPsec manual | Wizard + cloud download |
| Ops effort | Higher DIY | Lower with FortiCare |

**When OPNsense VPN is enough:**
- Budget-conscious SMB
- Team comfortable with firewall rules
- WG performance priority

**When FortiGate wins:**
- Need single-vendor support SLA
- Deep UTM on VPN traffic mandatory
- FortiClient EMS compliance`,
    },
    {
      title: 'Runbook: onboarding remote worker (WireGuard)',
      content: `**Prerequisites:** AD account, manager approval, managed laptop.

**IT steps (15 min):**
1. Verify user in VPN-AD group (if RADIUS used for other services)
2. VPN → WireGuard → Endpoints → Add peer
3. Assign tunnel IP 10.255.0.x/32, generate keys
4. Export .conf or QR
5. Deliver via secure channel (Intune, password manager)
6. User imports → connects
7. Test: ping 192.168.20.1, nslookup dc.corp.local, access share
8. Document in ticket

**Offboarding:**
1. Delete WireGuard endpoint peer
2. Remove AD group
3. Verify wg show — no handshake for user IP

**User doc one-liner:** Install WireGuard → Import tunnel → Activate → test \\\\fileserver.corp.local`,
    },
    {
      title: 'Runbook: VPN connected — no access to resources',
      content: `**L1 checklist (5 min):**

| # | Check | How |
|---|-------|-----|
| 1 | Tunnel up? | wg show / OpenVPN status |
| 2 | Handshake recent? | wg latest-handshakes |
| 3 | Ping OPNsense LAN IP? | ping 192.168.20.1 |
| 4 | DNS resolves? | nslookup server.corp.local |
| 5 | Routes present? | client routing table |
| 6 | Firewall rule? | OPNsense Logs |
| 7 | Server FW? | Windows firewall on target |
| 8 | Wrong split tunnel? | AllowedIPs missing subnet |

**80% root causes:** missing AllowedIPs/route; DNS not internal; firewall rule missing on WireGuard tab.

**Fix DNS:** client DNS = OPNsense Unbound; Unbound allows WG subnet.`,
    },
    {
      title: 'Reference: VPN logs and commands',
      content: `| Component | Log / command |
|-----------|---------------|
| WireGuard | \`wg show\`, \`wg show all dump\` |
| OpenVPN | \`/var/log/openvpn.log\` |
| IPsec | \`/var/log/ipsec/latest.log\`, \`ipsec statusall\` |
| Firewall | \`clog /var/log/filter\`, \`pfctl -s state\` |
| Routes | \`netstat -rn\`, Diagnostics GUI |
| Capture | \`tcpdump -ni wan udp port 51820\` |

**Debug workflow:**
\`\`\`
# reproduce issue
wg show / tail openvpn.log / ipsec statusall
pfctl -vvsr | grep -i vpn
tcpdump on WAN and VPN IF
\`\`\`

**GUI:** Firewall → Log Files → filter interface WireGuard/OpenVPN.`,
    },
  ],
  practice: [
    'WireGuard road warrior: wg0, 2 peers, split tunnel AllowedIPs, firewall rules, ping LAN',
    'WireGuard site-to-site: 2 OPNsense VM HQ↔Branch, verify routing both directions',
    'OpenVPN SSL/TLS: CA, server, user, export .ovpn, connect from Windows',
    'OpenVPN CSO: contractor peer with route only 192.168.10.50/32',
    'IPsec site-to-site: 2 VM IKEv2 AES-256-GCM, ping remote LAN',
    'AWS free tier: Site-to-Site VPN, OPNsense both tunnels, static route failover',
    'Azure VPN Gateway: document Phase1 params, test Connection status',
    'Split vs full tunnel: iperf3 compare WG split and full with NAT',
    'DDNS: Cloudflare API, WireGuard Endpoint hostname, verify update',
    'Troubleshoot: break PSK IPsec, fix via ipsec log',
    'Troubleshoot: remove WG firewall rule, diagnose with pfctl states',
    'MTU lab: find max ping size, set mssfix/MTU 1420',
    'RADIUS + OpenVPN: FreeRADIUS or NPS lab auth',
    'HA lab: CARP VIP + WG peer to VIP, failover test',
    'Write runbook onboarding WG user (1 page)',
  ],
  resources: [
    { title: 'OPNsense WireGuard documentation', url: 'https://docs.opnsense.org/manual/how-tos/wireguard-client.html' },
    { title: 'OPNsense OpenVPN documentation', url: 'https://docs.opnsense.org/manual/vpn/openvpn.html' },
    { title: 'OPNsense IPsec documentation', url: 'https://docs.opnsense.org/manual/vpn/ipsec.html' },
    { title: 'AWS Site-to-Site VPN', url: 'https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html' },
    { title: 'Azure VPN Gateway', url: 'https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-devices' },
    { title: 'WireGuard protocol', url: 'https://www.wireguard.com/' },
    { title: 'OPNsense Forum VPN', url: 'https://forum.opnsense.org/index.php?board=12.0' },
  ],
  quiz: [
    {
      question: 'Default WireGuard listen port on OPNsense is commonly:',
      options: ['51820', '1194', '500', '443'],
      answer: '51820',
    },
    {
      question: 'WireGuard client AllowedIPs for split tunnel should include:',
      options: ['Corporate CIDRs only (e.g. 192.168.10.0/24)', '0.0.0.0/0 always', 'Only the tunnel /32', 'WAN public IP'],
      answer: 'Corporate CIDRs only (e.g. 192.168.10.0/24)',
    },
    {
      question: 'IPsec Phase 1 vs Phase 2:',
      options: ['Phase 1 IKE SA management; Phase 2 ESP data SA', 'Phase 1 is data; Phase 2 is IKE only', 'Both are identical', 'Phase 2 is only for OpenVPN'],
      answer: 'Phase 1 IKE SA management; Phase 2 ESP data SA',
    },
    {
      question: 'OpenVPN CSO (Certificate Override) is used for:',
      options: ['Per-user route/DNS override (e.g. contractor to single server)', 'Replacing WireGuard keys', 'DHCP pool sizing', 'CARP failover'],
      answer: 'Per-user route/DNS override (e.g. contractor to single server)',
    },
    {
      question: 'Why UDP port 4500 for IPsec?',
      options: ['NAT-T encapsulation when peer is behind NAT', 'WireGuard compatibility', 'DNS over TLS', 'OpenVPN default only'],
      answer: 'NAT-T encapsulation when peer is behind NAT',
    },
    {
      question: 'WireGuard handshake stays at 0 — top causes include:',
      options: ['Firewall, wrong keys/endpoint, no WAN pass rule', 'DNSSEC failure only', 'CARP split-brain', 'Expired OpenVPN cert'],
      answer: 'Firewall, wrong keys/endpoint, no WAN pass rule',
    },
    {
      question: 'AWS Site-to-Site VPN provides two tunnels for:',
      options: ['Redundancy and failover with different route distances', 'Doubling bandwidth only', 'Replacing IPsec with SSL', 'Guest Wi‑Fi isolation'],
      answer: 'Redundancy and failover with different route distances',
    },
    {
      question: 'Full tunnel WireGuard on OPNsense requires:',
      options: ['Client AllowedIPs 0.0.0.0/0 + outbound NAT WG→WAN', 'Only changing listen port', 'Disabling Unbound', 'IKEv1 on WAN'],
      answer: 'Client AllowedIPs 0.0.0.0/0 + outbound NAT WG→WAN',
    },
    {
      question: 'CLI command to show WireGuard peers and handshakes:',
      answer: 'wg show',
      explanation: 'Use wg show wg0 latest-handshakes for per-peer timing; wg show all dump for deep debug.',
    },
    {
      question: 'MFA for remote VPN in production:',
      options: ['Mandatory — password alone is unacceptable', 'Optional for all users', 'Only for IPsec site-to-site', 'Not needed with WireGuard keys'],
      answer: 'Mandatory — password alone is unacceptable',
      explanation: 'WireGuard has no native MFA; use RADIUS overlay, managed devices, or gate access via portal.',
    },
  ],
}

export default translation
