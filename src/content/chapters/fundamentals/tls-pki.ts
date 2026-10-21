import type { Chapter } from '../../../types'

export const tlsPkiChapter: Chapter = {
  id: 'tls-pki',
  slug: 'tls-pki',
  title: 'TLS и PKI: сертификаты, OpenSSL, Let\'s Encrypt',
  moduleId: 'fundamentals',
  order: 8,
  duration: '4–5 часов',
  level: 'intermediate',
  description:
    'Основы TLS/PKI для DevOps: цепочки доверия, OpenSSL, Let\'s Encrypt, nginx termination и кратко mTLS',
  sections: [
    {
      title: 'TLS в одном абзаце и где он в стеке',
      content: `**TLS** (Transport Layer Security) шифрует канал и **аутентифицирует сервер** (и опционально клиента) через **X.509 сертификаты**.

**DevOps точки контакта:**
- nginx / Ingress TLS termination
- \`curl -v\` debugging handshake failures
- Cert-manager в Kubernetes
- mTLS между microservices
- Rotation before expiry (алерты на < 14 days)

**TLS ≠ VPN:** TLS защищает application layer HTTP/gRPC; VPN — network tunnel.`,
    },
    {
      title: 'PKI: CA, цепочка, SAN',
      content: `**Public Key Infrastructure:**
- **CA** (Certificate Authority) подписывает сертификаты
- **Leaf cert** — ваш домен \`api.example.com\`
- **Intermediate CA** → **Root CA** (в trust store браузера/OS)

**Важные поля:**
- **Subject Alternative Name (SAN)** — список DNS/IP; CN alone deprecated
- **Validity** — Not Before / Not After
- **Key usage** — digital signature, key encipherment

**Self-signed** — CA и leaf одно лицо; подходит для lab, не для public web.

**Private key** MUST stay secret; cert is public.`,
    },
    {
      title: 'OpenSSL: inspect и CSR',
      content: `**Inspect cert:**
\`openssl s_client -connect example.com:443 -servername example.com\`
\`openssl x509 -in cert.pem -text -noout\`

**Generate key + CSR:**
1. Private key (\`ecparam -name prime256v1\` or RSA 2048+)
2. CSR with SAN via config file
3. Submit CSR to CA (or self-sign for lab)

**Verify chain:**
\`openssl verify -CAfile chain.pem leaf.pem\`

**Convert formats:** PEM ↔ PKCS#12 (\`.pfx\`) для Windows/IIS.`,
      code: {
        language: 'bash',
        code: `# SAN config
cat > san.cnf <<'EOF'
[req]
distinguished_name=dn
req_extensions=req_ext
[dn]
CN=api.example.com
[req_ext]
subjectAltName=DNS:api.example.com,DNS:*.example.com
EOF

openssl req -new -newkey ec:<(openssl ecparam -name prime256v1) \\
  -nodes -keyout key.pem -out req.csr -config san.cnf
openssl x509 -req -in req.csr -signkey key.pem -days 365 -out cert.pem \\
  -extensions req_ext -extfile san.cnf`,
      },
    },
    {
      title: 'Let\'s Encrypt и ACME',
      content: `**Let's Encrypt** — free automated CA via **ACME** protocol.

**Challenge types:**
- **HTTP-01** — token on \`http://domain/.well-known/acme-challenge/\`
- **DNS-01** — TXT record (wildcards, internal services)

**Tools:**
- **certbot** — classic on VM
- **Caddy** — auto HTTPS built-in
- **cert-manager** — native K8s, ClusterIssuer

**Renewal:** certs 90 days — automation mandatory; alert on failed renewal job.

**Staging issuer** для тестов — avoid rate limits.`,
      code: {
        language: 'bash',
        caption: 'certbot nginx plugin (VM)',
        code: `sudo certbot --nginx -d api.example.com -d www.example.com
sudo certbot renew --dry-run
# cron/systemd timer: certbot renew`,
      },
    },
    {
      title: 'nginx TLS termination',
      content: `**Best practices:**
- TLS 1.2+ only; modern cipher suites
- **HSTS** после проверки HTTPS работает
- Full chain in \`ssl_certificate\` (leaf + intermediate)
- OCSP stapling where supported

**Common errors:**
- \`SSL: certificate subject name does not match\` — wrong SAN
- \`unable to get local issuer certificate\` — incomplete chain
- Expired cert — monitor \`ssl_cert_not_after\` (blackbox exporter)`,
      code: {
        language: 'nginx',
        code: `server {
  listen 443 ssl http2;
  server_name api.example.com;
  ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  add_header Strict-Transport-Security "max-age=31536000" always;
}`,
      },
    },
    {
      title: 'mTLS — mutual TLS кратко',
      content: `**mTLS:** сервер **и** клиент предъявляют сертификаты.

**Use cases:**
- Service mesh (Istio/Linkerd) sidecar identity
- Internal API zero-trust (no «inside network = trusted»)
- Kafka, Elasticsearch inter-node

**Flow:** client hello → server cert → **client cert request** → client cert → verify against client CA pool.

**Ops burden:** issue/rotate client certs or SPIFFE/SPIRE identity.

**Start simple:** mTLS on internal admin endpoints before full mesh.`,
    },
    {
      title: 'Операционный checklist',
      content: `- Inventory всех cert expiry (spreadsheet или Prometheus)
- Runbook renewal failure
- Private keys permissions 600, HSM/KMS for high assurance
- Document who owns DNS for DNS-01
- Test TLS from external (SSL Labs) и internal (openssl s_client)

После этой главы связка с **nginx** и **Kubernetes Ingress** должна быть прозрачной.`,
    },
  ],
  practice: [
    'Расшифруй сертификат google.com через openssl s_client — найди SAN и срок действия',
    'Выпусти self-signed cert для localhost и настрой nginx HTTPS',
    'Получи Let\'s Encrypt cert на lab VPS (HTTP-01) или cert-manager staging issuer',
    'Намеренно отдай incomplete chain — воспроизведи ошибку клиента и исправь',
    'Добавь blackbox probe или script alert на cert expiry < 20 days',
    'Сгенерируй client cert и включи ssl_verify_client на internal location',
  ],
  resources: [
    {
      title: 'Let\'s Encrypt — Documentation',
      url: 'https://letsencrypt.org/docs/',
    },
    {
      title: 'Mozilla SSL Configuration Generator',
      url: 'https://ssl-config.mozilla.org/',
    },
    {
      title: 'cert-manager documentation',
      url: 'https://cert-manager.io/docs/',
    },
  ],
}
