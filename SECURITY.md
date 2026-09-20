# Security & Responsible Disclosure Policy

The **CiviqOne / SAMAGRA Sovereign Identity & Data Consent Portal** treats citizen data sovereignty, cryptographic integrity, and operational security as foundational priorities.

## 1. Reporting Security Vulnerabilities

We take security vulnerabilities seriously. If you discover a vulnerability or potential exploit in this repository, **please do NOT open a public GitHub issue.**

Instead, please report it via private channel:
- **Email:** `security@civiqone.org` (or contact project maintainers directly)
- **Subject:** `[SECURITY DISCLOSURE] CiviqOne Vulnerability Report - <Component>`

Please include:
1. Clear description of the vulnerability, potential impact, and affected components.
2. Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
3. Any suggested remediations or mitigations.

We will acknowledge receipt within 48 hours and work with you to triage, patch, and coordinate a responsible public disclosure.

---

## 2. Zero Secrets in Version Control Policy

To safeguard the sovereign identity network:
- **No live API keys, private keys, database credentials, or production tokens may ever be committed to this repository.**
- All sensitive variables must be defined in `.env` (which is excluded via `.gitignore`).
- Use `.env.example` (frontend) and `backend/.env.example` (backend) for documenting non-sensitive configuration keys.
- CI/CD pipelines use AWS Secrets Manager and GitHub Actions encrypted secrets for deployment credentials.

---

## 3. Cryptographic & Architecture Guarantees

- **Client-Side Cryptography**: Sovereign digital identity cards, consent receipts, and document digests utilize standard cryptographic primitives (SHA-256 digests, ECDSA signatures, AES-GCM envelope encryption).
- **Zero-Knowledge Consent Verification**: Selective disclosure mechanisms ensure relying parties verify eligibility without harvesting superfluous personal demographic data.
- **Tamper-Proof Audit Trail**: All data access requests, approvals, and revocations generate immutable, cryptographically verifiable consent receipts.
- **Strict Role-Based Access Control (RBAC)**: Fine-grained authorization gates for Citizens, Institutional Verifiers, Government Officers, and Platform Administrators.

---

## 4. Supported Versions

| Version | Supported | Notes |
| :--- | :--- | :--- |
| `1.x` (Current) | :white_check_mark: | Actively supported with security updates |
| `< 1.0` | :x: | Deprecated |
