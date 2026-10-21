import type { ChapterTranslation } from '../../i18n/chapterTranslation'

const translation: ChapterTranslation = {
  title: 'TLS and PKI: certificates, OpenSSL, Let\'s Encrypt',
  description:
    'TLS/PKI for DevOps: trust chains, OpenSSL, Let\'s Encrypt, nginx termination, and a brief mTLS intro',
  duration: '4–5 hours',
  sections: [
    {
      title: 'TLS in one paragraph and where it sits in the stack',
      content: `**TLS** (Transport Layer Security) encrypts the channel and **authenticates the server** (and optionally the client) via **X.509 certificates**.

**DevOps touchpoints:**
- nginx / Ingress TLS termination
- \`curl -v\` debugging handshake failures
- cert-manager in Kubernetes
- mTLS between microservices
- Rotation before expiry (alerts at < 14 days)

**TLS ≠ VPN:** TLS protects the application layer (HTTP/gRPC); VPN is a network tunnel.`,
    },
    {
      title: 'PKI: CA, chain, SAN',
      content: `**Public Key Infrastructure:**
- **CA** (Certificate Authority) signs certificates
- **Leaf cert** — your domain \`api.example.com\`
- **Intermediate CA** → **Root CA** (in the browser/OS trust store)

**Important fields:**
- **Subject Alternative Name (SAN)** — DNS/IP list; CN alone is deprecated
- **Validity** — Not Before / Not After
- **Key usage** — digital signature, key encipherment

**Self-signed** — CA and leaf are the same entity; fine for labs, not for public web.

**Private key** must stay secret; the certificate is public.`,
    },
    {
      title: 'OpenSSL: inspect and CSR',
      content: `**Inspect a cert:**
\`openssl s_client -connect example.com:443 -servername example.com\`
\`openssl x509 -in cert.pem -text -noout\`

**Generate key + CSR:**
1. Private key (\`ecparam -name prime256v1\` or RSA 2048+)
2. CSR with SAN via a config file
3. Submit CSR to a CA (or self-sign for a lab)

**Verify chain:**
\`openssl verify -CAfile chain.pem leaf.pem\`

**Convert formats:** PEM ↔ PKCS#12 (\`.pfx\`) for Windows/IIS.`,
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
      title: 'Let\'s Encrypt and ACME',
      content: `**Let's Encrypt** is a free automated CA via the **ACME** protocol.

**Challenge types:**
- **HTTP-01** — token at \`http://domain/.well-known/acme-challenge/\`
- **DNS-01** — TXT record (wildcards, internal services)

**Tools:**
- **certbot** — classic on a VM
- **Caddy** — auto HTTPS built-in
- **cert-manager** — native Kubernetes, ClusterIssuer

**Renewal:** certs last 90 days — automation is mandatory; alert on failed renewal jobs.

Use the **staging issuer** for tests to avoid rate limits.`,
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
- **HSTS** after you confirm HTTPS works
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
      title: 'mTLS — mutual TLS briefly',
      content: `**mTLS:** both server **and** client present certificates.

**Use cases:**
- Service mesh (Istio/Linkerd) sidecar identity
- Internal API zero-trust (no “inside the network = trusted”)
- Kafka, Elasticsearch inter-node

**Flow:** client hello → server cert → **client cert request** → client cert → verify against client CA pool.

**Ops burden:** issue/rotate client certs or use SPIFFE/SPIRE identity.

**Start simple:** mTLS on internal admin endpoints before a full mesh.`,
    },
    {
      title: 'Operations checklist',
      content: `- Inventory every cert expiry (spreadsheet or Prometheus)
- Runbook for renewal failure
- Private key permissions 600; HSM/KMS for high assurance
- Document who owns DNS for DNS-01
- Test TLS from outside (SSL Labs) and inside (\`openssl s_client\`)

After this chapter, the link to **nginx** and **Kubernetes Ingress** should be clear.`,
    },
  ],
  practice: [
    'Decode the google.com certificate via openssl s_client — find SAN and expiry',
    'Issue a self-signed cert for localhost and configure nginx HTTPS',
    'Get a Let\'s Encrypt cert on a lab VPS (HTTP-01) or cert-manager staging issuer',
    'Deliberately serve an incomplete chain — reproduce the client error and fix it',
    'Add a blackbox probe or script alert for cert expiry < 20 days',
    'Generate a client cert and enable ssl_verify_client on an internal location',
  ],
  resources: [
    { title: 'Let\'s Encrypt — Documentation', url: 'https://letsencrypt.org/docs/' },
    { title: 'Mozilla SSL Configuration Generator', url: 'https://ssl-config.mozilla.org/' },
    { title: 'cert-manager documentation', url: 'https://cert-manager.io/docs/' },
  ],
  quiz: [
    {
      question: 'What is SAN used for in a certificate?',
      options: [
        'The list of allowed DNS/IP names the client will accept',
        'CPU speed',
        'HTTP version',
        'MTU size',
      ],
      answer: 'The list of allowed DNS/IP names the client will accept',
    },
    {
      question: 'Let\'s Encrypt certificates last roughly?',
      options: [
        '90 days — renewal must be automated',
        '10 years',
        '1 day',
        'Forever',
      ],
      answer: '90 days — renewal must be automated',
    },
    {
      question: 'An HTTP-01 ACME challenge requires?',
      options: [
        'The token reachable over HTTP on port 80 for the domain',
        'Open SSH',
        'Client mTLS',
        'A wildcard without DNS',
      ],
      answer: 'The token reachable over HTTP on port 80 for the domain',
    },
    {
      question: '“unable to get local issuer certificate” often means?',
      options: [
        'Incomplete chain (missing intermediate)',
        'URL too long',
        'HTTP/3',
        'gzip',
      ],
      answer: 'Incomplete chain (missing intermediate)',
    },
    {
      question: 'Where should the private key live?',
      options: [
        'Only on the server/secret store with mode 600, never in Git',
        'In a public README',
        'In a Docker image layer',
        'In browser cache',
      ],
      answer: 'Only on the server/secret store with mode 600, never in Git',
    },
    {
      question: 'What does mTLS add compared to regular TLS?',
      options: [
        'Client authentication with a certificate',
        'Compression only',
        'Disabling encryption',
        'DNS round robin',
      ],
      answer: 'Client authentication with a certificate',
    },
    {
      question: 'An HSTS header makes sense after?',
      options: [
        'Stable working HTTPS on the domain',
        'The first failed cert',
        'HTTP only',
        'Self-signed without trust',
      ],
      answer: 'Stable working HTTPS on the domain',
    },
    {
      question: 'cert-manager in Kubernetes automates?',
      options: [
        'Requesting and renewing certificates via an ACME Issuer',
        'Creating a VPC',
        'Backing up etcd to S3 with no setup',
        'Deploying Java apps',
      ],
      answer: 'Requesting and renewing certificates via an ACME Issuer',
    },
    {
      question: 'Why use openssl s_client -servername?',
      options: [
        'SNI — the correct cert on a shared IP',
        'SSH tunnel',
        'UDP probe',
        'Ping',
      ],
      answer: 'SNI — the correct cert on a shared IP',
    },
    {
      question: 'What should you monitor for TLS in production?',
      options: [
        'Certificate expiry date (alert 14–30 days ahead)',
        'Favicon color',
        'Number of Git comments',
        'README size',
      ],
      answer: 'Certificate expiry date (alert 14–30 days ahead)',
    },
  ],
}

export default translation
