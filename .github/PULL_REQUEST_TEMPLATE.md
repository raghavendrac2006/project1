## Description
Provide a concise summary of the changes introduced by this Pull Request.

Fixes #(issue)

## Feature Domain
- [ ] `auth`
- [ ] `dashboard`
- [ ] `documents`
- [ ] `identity`
- [ ] `permissions`
- [ ] `audit`
- [ ] `privacy`
- [ ] `family`
- [ ] `services`
- [ ] `organization` / `government` / `admin`
- [ ] `core/types/services`

## Checklist
- [ ] Code follows the MNC Domain Isolation rules defined in `ARCHITECTURE.md`.
- [ ] Barrel exports (`index.ts`) maintained for modified domains.
- [ ] `npx tsc -b` completed with **0 type errors**.
- [ ] Tested locally on dev server (`npm run dev`).
- [ ] No direct cross-domain private imports.
