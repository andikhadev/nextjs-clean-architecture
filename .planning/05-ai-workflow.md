# 05 — AI Workflow

**Status:** 🔲 Belum dimulai
**Tujuan:** Membuat artefak yang langsung mempercepat workflow tim dengan AI —
CLAUDE.md template siap pakai, local commands, dan SKILLS.md sebagai index skills.
Bergantung pada: Step 01 (spec selesai) + Step 04 (llms.txt live).

---

## Checklist

### CLAUDE.md Template
- [ ] Tulis template `CLAUDE.md` untuk project yang mengadopsi convention ini
- [ ] Tambahkan referensi ke `llms.txt` sebagai ground truth
- [ ] Publish sebagai file di repo — `templates/CLAUDE.md`

### Local Commands (`.claude/commands/`)
- [ ] `/new-feature` — scaffold folder + file sesuai convention
- [ ] `/review-naming` — audit naming convention di folder yang ditentukan
- [ ] `/scaffold-adapter` — buat adapter baru di `lib/[domain]/`
- [ ] `/scaffold-i18n` — tambah namespace baru ke `messages/[locale].json`
- [ ] Dokumentasikan cara pakai di `SKILLS.md`

### SKILLS.md
- [ ] Tulis `SKILLS.md` di root repo
- [ ] Daftar semua skills + commands yang tersedia
- [ ] Instruksi install: via skills.sh dan via GitHub (fallback)
- [ ] Tambahkan link ke SKILLS.md dari docs Astro

---

## CLAUDE.md Template

Template ini di-drop ke root project oleh tim yang mengadopsi convention.
Simpan di `templates/CLAUDE.md` di repo ini.

```markdown
# [Project Name]

This project follows the Next.js Clean Architecture Convention v2.

Convention reference (always up-to-date): https://[domain]/llms.txt
Full documentation: https://[domain]/

---

## Stack

- Next.js 15+ (App Router)
- shadcn/ui — never modify components/ui/ directly
- Zustand — transient UI state only
- TanStack Query — all client-side data fetching
- TanStack Form + Zod — all form submissions
- next-intl — all user-facing strings

---

## Critical Rules

- `page.tsx` must only contain `return <SE_FeatureLayout />` — no logic
- All user-facing strings must use `useTranslations` / `getTranslations` from next-intl
- Never call external libraries directly — use adapters in `lib/[domain]/`
- Server Actions must validate with Zod before calling APIS_ (server-only) or APIC_ (client-accessible)
- APIS_ can only be called from SE_, ACT_, SFN_ — never from CE_ or useQuery
- APIC_ is for client-side fetching (CE_ via TanStack Query) — Route Handler or public External API
- GlobalEmitter is forbidden — use Zustand (transient) or URL params (persistent)

---

## Folder Structure

\`\`\`
messages/             next-intl locale files — en.json, id.json
src/
├── app/[feature]/
│   ├── $action/      ACT_ — Server Actions ("use server")
│   ├── $element/     SE_ (server) / CE_ (client) — React components
│   ├── $function/    SFN_ (server) / CFN_ (client) — helper functions
│   ├── $store/       useXxxStore — Zustand stores, feature-scoped
│   └── page.tsx      only: return <SE_FeatureLayout />
├── api/[feature]/    APIS_ fetch wrappers + IRq_/IRs_ types
├── i18n/             next-intl routing + request config
├── lib/[domain]/     third-party adapters (index.ts + [library].ts)
├── reg/              ROUTE_ constants, QK_ query keys
└── store/            global Zustand stores (2+ features)
\`\`\`

---

## Naming Quick Reference

| Symbol | Prefix | Symbol | Prefix |
|--------|--------|--------|--------|
| Server Action | `ACT_` | Client Element | `CE_` |
| Server Element | `SE_` | Client Function | `CFN_` |
| Server Function | `SFN_` | Zustand hook | `useXxxStore` |
| API fetch (server-only) | `APIS_` | API fetch (client-accessible) | `APIC_` |
| Zod schema | `ZS_` | | |
| Interface | `I_` | Request interface | `IRq_` |
| Response interface | `IRs_` | Type alias | `T_` |
| Enum | `E_` | Query key | `QK_` |
| Route constant | `ROUTE_` | | |

---

## Git Commit Style

Conventional Commits: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `style`

\`\`\`
feat(login): add OAuth support
fix(session): correct cookie expiry
refactor(user-list): extract filter logic to CFN_
\`\`\`
```

---

## Local Commands

Disimpan di `.claude/commands/` di root project yang mengadopsi convention.
Tersedia sebagai slash command di Claude Code: `/new-feature`, dll.

### `/new-feature`

```markdown
# New Feature — Next.js Clean Architecture

Scaffold a new feature following convention v2.
Convention spec: https://[domain]/llms.txt

Ask the user for:
1. Feature name (kebab-case)
2. Layers needed (default: action, element, function — ask if store/i18n needed)
3. Has form? (determines if Zod schema + Server Action needed)
4. Has client-side fetching? (determines if TanStack Query + QK_ needed)

Generate:
- `app/[feature]/page.tsx` — only `return <SE_[Feature]Layout />`
- `app/[feature]/$element/server.[feature]-layout.tsx`
- `app/[feature]/$element/client.[feature]-content.tsx`
- `api/[feature]/[feature].ts` + `api/[feature]/[feature].type.ts`
- If form: `app/[feature]/$action/action.submit.ts` + `app/[feature]/$function/cfn.validate.ts`
- If store: `app/[feature]/$store/ui.store.ts`
- If i18n: add namespace entry in `messages/id.json` and `messages/en.json`
- If TanStack Query: add `QK_[Feature]` in `reg/query-keys.register.ts`
```

### `/review-naming`

```markdown
# Review Naming — Next.js Clean Architecture

Audit the provided file or folder against convention v2 naming rules.
Convention spec: https://[domain]/llms.txt

For each issue found, output:
1. **Location** — file path (and line if applicable)
2. **Issue** — what is wrong and which rule it violates
3. **Fix** — exact rename or change needed

Check:
- File names follow dot-notation pattern (server.x.tsx, client.x.tsx, etc.)
- Function/component names use correct prefix (SE_, CE_, ACT_, SFN_, CFN_, APIS_, ZS_)
- Interface names use I_, IRq_, IRs_ prefix
- "use client" / "use server" present where required
- page.tsx contains no logic
- No direct library imports where adapter should be used
- No LANG_ objects — should use useTranslations/getTranslations
```

### `/scaffold-adapter`

```markdown
# Scaffold Library Adapter — Next.js Clean Architecture

Create a new library adapter in `lib/[domain]/` following Pattern G.

Ask the user for:
1. Domain name (e.g. cache, storage, mailer, queue)
2. Library being wrapped (e.g. ioredis, nodemailer, @aws-sdk/client-s3)
3. Operations needed (e.g. get/set/del for cache, send for mailer)

Generate:
- `lib/[domain]/index.ts` — I_[Domain]Adapter interface + re-export of implementation
- `lib/[domain]/[library].ts` — concrete implementation

Rules:
- Interface exported from index.ts: `I_[Domain]Adapter`
- Implementation export name matches what's re-exported in index.ts
- No external library imports in index.ts — only type imports
- Consumer-facing export from index.ts should be a plain name (e.g. `cache`, `mailer`)
```

### `/scaffold-i18n`

```markdown
# Scaffold i18n Namespace — Next.js Clean Architecture

Add a new i18n namespace for a feature following Pattern H (next-intl).

Ask the user for:
1. Feature name / namespace (e.g. Login, UserList, ProductDetail)
2. Keys needed (e.g. title, submitButton, errorMessages)
3. Locales in the project (default: en, id)

Generate:
- Namespace entry in `messages/[locale].json` for each locale
- Example usage snippet: `useTranslations("[Feature]")` for CE_
- Example usage snippet: `getTranslations("[Feature]")` for SE_
```

---

## SKILLS.md Template

```markdown
# Skills & Commands

Tools for working with this codebase using Claude Code.

---

## Local Commands

Available in any Claude Code session within this project.

| Command | Description |
|---------|-------------|
| `/new-feature` | Scaffold a new feature folder + files |
| `/review-naming` | Audit naming convention violations |
| `/scaffold-adapter` | Create a new library adapter in `lib/[domain]/` |
| `/scaffold-i18n` | Add a new i18n namespace to `messages/` |

---

## Claude Skills

Installable skills that work across all projects.

### Install via skills.sh

\`\`\`bash
claude skills install nextjs-ca-scaffold
claude skills install nextjs-ca-component
claude skills install nextjs-ca-store
claude skills install nextjs-ca-review
\`\`\`

### Install via GitHub (fallback)

\`\`\`bash
# Clone ke direktori skills Claude Code
git clone https://github.com/[org]/nextjs-clean-architecture .claude/skills/nextjs-ca
\`\`\`

Atau download manual: [GitHub Releases →](https://github.com/[org]/nextjs-clean-architecture/releases)

---

## Convention Reference

- Docs: https://[domain]/
- llms.txt (AI-ready): https://[domain]/llms.txt
- llms-full.txt (with code examples): https://[domain]/llms-full.txt
```
