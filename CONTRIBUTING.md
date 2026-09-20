# Contributing to CiviqOne / SAMAGRA

Thank you for your interest in contributing to **CiviqOne**! We welcome contributions from engineers, researchers, and designers worldwide.

## Code of Conduct

All contributors are expected to uphold a respectful, collaborative, and inclusive environment.

---

## 1. Domain-Driven Feature Isolation (DDFI)

This repository follows strict **Domain-Driven Feature Isolation (DDFI)** to prevent merge conflicts across parallel workstreams:

1. **Keep features isolated**: All domain-specific components, pages, and hooks live in `src/features/<domain_name>`.
2. **Strict barrel exports**: Never import directly from another domain's internal subdirectories. Always import through the domain's root `index.ts`.
3. **Shared primitives only in `components/`**: Only cross-cutting, reusable components belong in `src/components/ui/` or `src/components/shared/`.
4. **Centralized data services**: Page components should not manipulate raw storage directly. Use `src/services/` data abstraction layers.

---

## 2. Git Branching & Conventional Commits

We follow standard **Git Flow** and **Conventional Commits**:

### Branch Naming Conventions
- `feature/<ticket-or-name>-<short-description>` (e.g. `feature/CIV-102-zkp-verification`)
- `fix/<ticket-or-name>-<short-description>` (e.g. `fix/CIV-103-otp-autofill`)
- `docs/<short-description>` (e.g. `docs/aws-architecture-diagram`)
- `refactor/<short-description>`

### Commit Message Format
```
<type>(<scope>): <short description>
```
Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Formatting, missing semicolons, etc. (no code changes)
- `refactor`: Refactoring code without changing functionality
- `test`: Adding or updating tests
- `chore`: Build tasks, package updates, configuration

Examples:
- `feat(vault): add client-side SHA-256 integrity check`
- `fix(auth): handle expired WebAuthn challenge grace period`
- `docs(readme): add AWS cloud topology diagram`

---

## 3. Local Development & Verification

Before submitting a Pull Request, ensure all checks pass:

```bash
# 1. Install dependencies
npm install

# 2. Lint and Oxlint checks
npm run lint

# 3. Type-check and production build
npm run build
```

---

## 4. Submitting a Pull Request

1. Fork the repository and create your branch from `main`.
2. Ensure your code passes `npm run build` and `npm run lint`.
3. Open a Pull Request against `main`.
4. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely, including:
   - Summary of changes
   - Domain area affected
   - Manual verification steps & screenshots
   - Checklist items
