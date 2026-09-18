# SAMAGRA Enterprise Architecture & Multi-Developer Guidelines

Welcome to the **Samagra Sovereign Identity & Data Consent Portal** codebase.
This project is structured using **Domain-Driven Feature Isolation (DDFI)** to enable concurrent contributions from multiple engineering teams (MNC standard) without code collision or Git merge conflicts.

---

## 1. Domain Directory Structure

Each feature domain is isolated inside `src/features/<domain_name>` and must expose its public interface via a strictly managed `index.ts` barrel file.

```
src/
├── features/
│   ├── auth/                 # Domain: Citizen Onboarding & WebAuthn / Key Passkey Auth
│   ├── dashboard/            # Domain: Central Sovereign Command Hub
│   ├── documents/            # Domain: Encrypted Document Vault & Cryptographic Inspector
│   ├── identity/             # Domain: Sovereign Identity Credentials Dossier
│   ├── permissions/          # Domain: Active Grants & Real-time Revocation Hub
│   ├── audit/                # Domain: Access History & Immutable Ledger
│   ├── privacy/              # Domain: Security Center & Statutory Privacy Controls
│   ├── family/               # Domain: Delegated Authority & Family Management
│   ├── services/             # Domain: Civic Services & Applications Hub
│   ├── organization/         # Domain: Third-Party Institutional Verification Portal
│   ├── government/           # Domain: Departmental Official Case Worker Portal
│   ├── admin/                # Domain: Super Admin Platform Operations
│   ├── analytics/            # Domain: Consent Analytics & Operational Intelligence
│   └── help/                 # Domain: Multilingual AI Citizen Assistant
├── services/                 # Shared Data Layer & Mock Storage Engine
├── components/               # Atomic Design Shared UI Components
│   ├── ui/                   # Primitive UI Controls (Buttons, Badges, Modals)
│   └── shared/               # Cross-Domain Layout Headers & Navbars
├── types/                    # System-Wide TypeScript Contracts
└── lib/                      # Pure Helper Functions & Encryption Utilities
```

---

## 2. Multi-Developer & Anti-Conflict Rules

To prevent code conflicts across engineering teams, all developers must strictly adhere to the following 5 MNC engineering rules:

1. **Feature Isolation**: Never import private internal components of another domain (`from '../other-feature/internal/SubComponent'`). Always import from the domain's root index file (`from '../other-feature'`).
2. **Type Contract Immutability**: All core data schemas live in `src/types/index.ts`. If a type modification is necessary, it must be additive/optional to maintain backward compatibility across all domains.
3. **Data Service Abstraction**: Page components must not perform raw data manipulation. All state operations must go through `civicStorage` or dedicated domain services in `src/services/`.
4. **Clean Barrel Exports**: Each feature directory must contain an `index.ts` exporting only the primary page component and any public hooks.
5. **Git Branching Policy**:
   - Feature development: `feature/<jira-ticket>-<short-description>`
   - Bug fixes: `fix/<jira-ticket>-<short-description>`
   - Release candidate: `release/vX.Y.Z`

---

## 3. Code Ownership (`CODEOWNERS`)

- **@core-team**: `src/types/`, `src/lib/`, `src/services/`
- **@auth-team**: `src/features/auth/`
- **@civic-identity-team**: `src/features/dashboard/`, `src/features/identity/`, `src/features/documents/`
- **@privacy-security-team**: `src/features/permissions/`, `src/features/audit/`, `src/features/privacy/`
- **@delegation-services-team**: `src/features/family/`, `src/features/services/`
- **@institutional-team**: `src/features/organization/`, `src/features/government/`, `src/features/admin/`

---

## 4. Build & Verification Standard

Before opening a Pull Request, every engineer must verify zero TypeScript compilation errors:

```bash
npm run build   # Or npx tsc -b
```
