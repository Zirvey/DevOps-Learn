import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'Networking for DevOps',
  duration: '5–6 hours',
  description:
    'Deep networking study: OSI and TCP/IP, IP and ports, DNS, HTTP/HTTPS/TLS, curl, firewall (ufw/iptables), diagnostics',
  sections: [
    {
      title: 'Why networking matters for DevOps engineers',
      content: `Almost every production incident is somehow a **network problem**:
- "Site won't open" — DNS? Firewall? Nginx? Upstream?
- "API timeout" — latency, packet loss, connection pool
- "Pod cannot reach the DB" — NetworkPolicy, Service, security group
- "SSL expired" — certificate, cert-manager

Without networking knowledge you will **guess**. With it you will **diagnose systematically**.`,
    },
    {
      title: 'OSI model (7 layers)',
      content: `**OSI** is a reference model for understanding the network stack:

| Layer | Name | PDU | Examples |
|-------|------|-----|----------|
| 7 | Application | Data | HTTP, DNS, SSH |
| 6 | Presentation | Data | TLS, compression |
| 5 | Session | Data | Sessions |
| 4 | Transport | Segment | TCP, UDP |
| 3 | Network | Packet | IP, ICMP |
| 2 | Data Link | Frame | Ethernet, MAC |
| 1 | Physical | Bits | Cable, radio |

DevOps mostly works at layers **4–7**. Layers 1–3 belong more to network engineers and cloud VPCs, but basic understanding is required.`,
    },
    {
      title: 'TCP/IP model (4 layers)',
      content: `The practical internet model is **TCP/IP**:

\`\`\`
Application  │  HTTP, DNS, SSH, TLS
Transport    │  TCP, UDP
Internet     │  IP, ICMP
Link         │  Ethernet, Wi-Fi
\`\`\`

**OSI ↔ TCP/IP mapping:**
- Application (OSI 5–7) → Application
- Transport → Transport
- Network → Internet
- Data Link + Physical → Link

**Encapsulation:** HTTP data → TCP segment (+ port) → IP packet (+ IP addr) → Ethernet frame (+ MAC).`,
    },
    {
      title: 'IP addressing: IPv4',
      content: `**IPv4** — 32 bits, notation: \`192.168.1.10\`

**Private address classes (RFC 1918):**
| Range | CIDR | Use |
|-------|------|-----|
| 10.0.0.0 – 10.255.255.255 | 10.0.0.0/8 | Large corp networks, AWS VPC |
| 172.16.0.0 – 172.31.255.255 | 172.16.0.0/12 | Docker default bridge |
| 192.168.0.0 – 192.168.255.255 | 192.168.0.0/16 | Home routers |

**CIDR** — network mask: \`/24\` = 256 addresses, \`/32\` = one host.

**Loopback:** \`127.0.0.1\` — "this host."
**localhost** resolves to ::1 (IPv6) and 127.0.0.1.`,
      code: {
        language: 'bash',
        code: `ip addr show
ip route show
# Проверка связности:
ping -c 4 8.8.8.8
ping -c 4 google.com`,
      },
    },
    {
      title: 'Ports and sockets',
      content: `A **port** is 16 bits (0–65535), an application identifier on a host.

**Ranges:**
- 0–1023 — well-known (privileged, root)
- 1024–49151 — registered
- 49152–65535 — dynamic/ephemeral (outbound connections)

**Well-known DevOps ports:**
| Port | Service |
|------|---------|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 8080 | Alt HTTP / proxies |
| 9090 | Prometheus |

A **socket** = IP + port + protocol. \`192.168.1.5:443\` is an endpoint.`,
    },
    {
      title: 'TCP vs UDP',
      content: `| | TCP | UDP |
|---|-----|-----|
| Reliability | Guaranteed delivery, ordering | Best effort |
| Connection | 3-way handshake | Connectionless |
| Speed | Slower (overhead) | Faster |
| Examples | HTTP, SSH, DB | DNS queries, video, gaming |

**TCP handshake:** SYN → SYN-ACK → ACK.
**Closing:** FIN → ACK (four-way).

**DevOps:** HTTP/HTTPS — TCP. DNS is usually UDP (sometimes TCP for large responses). Health checks can be TCP connect or HTTP.`,
    },
    {
      title: 'DNS: how it works',
      content: `**DNS** (Domain Name System) is a distributed "name → IP" database.

**Resolution order (simplified):**
1. OS / browser cache
2. \`/etc/hosts\`
3. Resolver (from \`/etc/resolv.conf\`, often 8.8.8.8 or the router)
4. Root → TLD (.com) → Authoritative NS of the domain

**TTL** — how long a record lives in cache (seconds). Low TTL before a migration means faster cutover.`,
    },
    {
      title: 'DNS record types',
      content: `| Type | Purpose | Example |
|------|---------|---------|
| **A** | Domain → IPv4 | \`api.example.com → 93.184.216.34\` |
| **AAAA** | Domain → IPv6 | |
| **CNAME** | Alias to another name | \`www → example.com\` |
| **MX** | Mail server | priority + host |
| **TXT** | Arbitrary text | SPF, DKIM, verification |
| **NS** | Authoritative nameserver | |
| **SRV** | Service + port | \`_https._tcp\` |
| **CAA** | Who may issue SSL | Let's Encrypt |

**DevOps scenarios:**
- A/AAAA — deploy to a new IP
- CNAME — to a load balancer (ALB, Cloudflare)
- TXT — ACME challenge, domain verification`,
      codes: [
        {
          language: 'bash',
          caption: 'DNS diagnostics',
          code: `dig example.com
dig example.com A +short
dig example.com MX
dig @8.8.8.8 example.com       # явный резолвер
nslookup example.com
host example.com
resolvectl query example.com   # systemd-resolved`,
        },
      ],
    },
    {
      title: 'HTTP: application-layer protocol',
      content: `**HTTP** is a text request/response protocol.

**Request structure:**
\`\`\`
GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: curl/8.0
Accept: application/json
\`\`\`

**Methods:** GET (read), POST (create), PUT (replace), PATCH (partial), DELETE, HEAD, OPTIONS.

**Status codes:**
| Class | Meaning | Examples |
|-------|---------|----------|
| 1xx | Informational | 100 Continue |
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirect | 301 Moved Permanently, 302 Found, 304 Not Modified |
| 4xx | Client error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | Server error | 500 Internal, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout |

**502 vs 503:** 502 — upstream is broken; 503 — service intentionally unavailable (maintenance, overload).`,
    },
    {
      title: 'HTTPS and TLS',
      content: `**HTTPS** = HTTP over **TLS** (Transport Layer Security).

**TLS handshake (simplified):**
1. Client Hello (versions, cipher suites)
2. Server Hello + certificate
3. Client verifies the certificate (CA chain)
4. Key exchange
5. Encrypted HTTP

A **certificate** contains: domain(s), public key, CA signature, validity period.

**Let's Encrypt** — free CA. **certbot** — client for obtaining and renewing.

**DevOps:** automate via cert-manager in K8s or cron + certbot on a VM.`,
      codes: [
        {
          language: 'bash',
          caption: 'TLS checks',
          code: `curl -vI https://example.com 2>&1 | grep -E 'SSL|subject|expire'
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -dates -subject
echo | openssl s_client -connect expired.badssl.com:443 2>/dev/null | openssl x509 -noout -dates`,
        },
      ],
    },
    {
      title: 'curl — the DevOps Swiss Army knife',
      content: `**curl** is a CLI for HTTP(S), FTP, and more. Indispensable in CI, scripts, and API debugging.`,
      codes: [
        {
          language: 'bash',
          caption: 'Basic requests',
          code: `curl https://api.example.com/health
curl -I https://example.com          # только заголовки
curl -v https://example.com          # verbose (TLS, headers)
curl -o page.html https://example.com
curl -O https://example.com/file.zip # сохранить с именем из URL`,
        },
        {
          language: 'bash',
          caption: 'POST, JSON, headers',
          code: `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer TOKEN" \\
  -d '{"name": "Alice", "email": "a@example.com"}'

curl -s https://api.example.com/users | jq .
curl -w "\\nHTTP: %{http_code} Time: %{time_total}s\\n" -o /dev/null -s https://example.com`,
        },
        {
          language: 'bash',
          caption: 'Health checks in scripts',
          code: `curl -sf https://api.example.com/health || exit 1
# -s silent, -f fail on HTTP error (4xx, 5xx)`,
        },
      ],
    },
    {
      title: 'Routing and NAT',
      content: `A **router** forwards packets using a routing table.
**Default gateway** — the "everything else" route (0.0.0.0/0).

**NAT** (Network Address Translation) — private IP ↔ public. A home router does NAT.

**In the cloud:** Security Groups (AWS), Firewall Rules (GCP) — virtual firewall at instance level. **NACL** — at subnet level.`,
      code: {
        language: 'bash',
        code: `ip route show
traceroute google.com
tracepath google.com
mtr google.com                   # apt install mtr`,
      },
    },
    {
      title: 'Firewall concepts',
      content: `A **firewall** filters traffic by rules: IP, port, protocol, direction (in/out).

**Rule order matters** — first match wins.

**Default policy:**
- DROP/REJECT everything, allow what is needed (safer)
- ACCEPT everything, deny what is not needed (riskier)

**On Linux:** iptables/nftables (low level), **ufw** (wrapper, Ubuntu), firewalld (RHEL).`,
    },
    {
      title: 'UFW — simple Ubuntu firewall',
      content: `**UFW** (Uncomplicated Firewall) is a user-friendly interface to iptables.`,
      codes: [
        {
          language: 'bash',
          caption: 'Basic UFW setup',
          code: `sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
sudo ufw status verbose
sudo ufw delete allow 80/tcp
sudo ufw reload`,
        },
      ],
    },
    {
      title: 'iptables — low-level firewall',
      content: `**iptables** — tables **filter**, **nat**, **mangle**. Chains: INPUT, OUTPUT, FORWARD.

On modern systems **nftables** replaces iptables, but iptables syntax is still common.`,
      code: {
        language: 'bash',
        caption: 'Viewing and basic rules',
        code: `sudo iptables -L -n -v
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A INPUT -j DROP
# Сохранение (Ubuntu):
sudo apt install iptables-persistent
sudo netfilter-persistent save`,
      },
    },
    {
      title: 'Network diagnostics checklist',
      content: `**"Cannot connect to the service"** — bottom-up by layers:

1. **Physical/link** — interface up? \`ip link\`
2. **IP** — have an address? ping gateway?
3. **DNS** — does the name resolve? \`dig\`
4. **Port** — listening? \`ss -tulpn\`
5. **Firewall** — ufw/iptables/security group?
6. **Service** — nginx/app running? \`systemctl status\`
7. **Application** — curl, response code, logs`,
      codes: [
        {
          language: 'bash',
          caption: 'Full diagnostics kit',
          code: `ping -c 3 8.8.8.8
ping -c 3 google.com
dig +short api.example.com
ss -tulpn | grep :443
curl -v telnet://host:5432     # или nc -zv host 5432
nc -zv localhost 80
traceroute api.example.com
curl -v https://api.example.com/health`,
        },
      ],
    },
    {
      title: 'Load balancing and reverse proxy (intro)',
      content: `A **reverse proxy** (Nginx, HAProxy) accepts client requests and proxies them to backends.

A **load balancer** distributes load across multiple backends:
- Round robin
- Least connections
- IP hash

**L4 vs L7:** L4 (TCP) — faster, does not see HTTP; L7 (HTTP) — routing by path, headers, sticky sessions.

Nginx details are in a separate chapter of this module.`,
    },
    {
      title: 'Networking in a DevOps context',
      content: `How networking shows up later in the handbook:

| Technology | Networking concept |
|------------|-------------------|
| Docker | bridge network, port mapping, custom networks |
| Kubernetes | Pod IP, Service ClusterIP, Ingress, NetworkPolicy |
| Terraform | VPC, subnets, security groups, route tables |
| Cloud | ALB, NLB, CDN, PrivateLink |

The foundation from this chapter underpins all of these abstractions.`,
    },
  ],
  practice: [
    'On a VPS: install nginx, open 80 in ufw. From another machine: curl -I http://IP. Close 80 — confirm timeout. Open again',
    'Set an A record (or /etc/hosts for a test): myapp.local → VPS IP. Check dig and curl by name',
    'Run curl -v https://google.com and write down: HTTP version, status, 3 response headers, TLS handshake time',
    'With ss find all LISTEN ports. For each identify the process (nginx, sshd, ...)',
    'Write a bash health-check: dig + curl + port check via nc. Exit 1 on any error',
    'Simulate a DNS problem: break /etc/resolv.conf, observe curl errors. Restore',
    'Compare responses: curl http://site and curl https://site — headers, redirects (curl -L -v)',
    'Add an iptables DROP rule for port 80 (if ufw is disabled) or study ufw status numbered and delete',
    'traceroute to api.github.com — note hop count and where latency may appear',
    'Explain to a colleague (or in notes) the difference between 502 and 503 using nginx → upstream app',
  ],
  resources: [
    { title: 'MDN HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
  ],
  quiz: [
    {
      question: 'At which OSI layer does the TCP protocol operate?',
      options: ['Transport (L4)', 'Network (L3)', 'Data Link (L2)', 'Application (L7)'],
      answer: 'Transport (L4)',
    },
    {
      question: 'How does TCP differ from UDP?',
      options: [
        'TCP is connection-oriented with delivery guarantees; UDP has no guarantees',
        'UDP always encrypts traffic',
        'TCP is only used for DNS',
        'UDP only works on a local network',
      ],
      answer: 'TCP is connection-oriented with delivery guarantees; UDP has no guarantees',
    },
    {
      question: 'What is CIDR and why is it needed?',
      answer: 'Notation for an IP address range, e.g. 10.0.0.0/24.',
    },
    {
      question: 'Which port does HTTPS use by default?',
      options: ['443', '80', '22', '53'],
      answer: '443',
    },
    {
      question: 'What does NAT do on a home router?',
      options: [
        'Translates private addresses to a public one when going to the internet',
        'Encrypts all application traffic',
        'Resolves domain names',
        'Load-balances HTTP requests across servers',
      ],
      answer: 'Translates private addresses to a public one when going to the internet',
    },
    {
      question: 'Explain the difference between a reverse proxy and a forward proxy.',
      answer:
        'A forward proxy represents clients outbound; a reverse proxy accepts client requests and forwards them to backend servers.',
    },
    {
      question: 'What is DNS for?',
      options: [
        'Resolving domain names to IP addresses',
        'Compressing HTTP responses',
        'L2 routing',
        'Storing TLS certificates',
      ],
      answer: 'Resolving domain names to IP addresses',
    },
  ],
}

export default translation
