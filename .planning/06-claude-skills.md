# 05 — Claude Skills

**Status:** 🔲 Belum dimulai
**Tujuan:** Membuat 4 Claude Skills yang bisa di-install via skills.sh,
sehingga seluruh anggota tim bisa generate dan review kode sesuai convention
tanpa perlu hafal semua aturan.
Bergantung pada: Step 01 (spec selesai) + Step 04 (llms.txt live).

---

## Checklist

### Skill 1: `nextjs-ca-scaffold`
- [ ] Tulis file skill markdown
- [ ] Test: scaffold feature `user-management`
- [ ] Test: scaffold feature `product-list` dengan TanStack Query
- [ ] Test: scaffold hanya satu layer (misal: hanya `$store`)
- [ ] Publish ke skills.sh

### Skill 2: `nextjs-ca-component`
- [ ] Tulis file skill markdown
- [ ] Test: generate `SE_` saja
- [ ] Test: generate pasangan `SE_` + `CE_`
- [ ] Test: `CE_` dengan Zustand store
- [ ] Publish ke skills.sh

### Skill 3: `nextjs-ca-store`
- [ ] Tulis file skill markdown
- [ ] Test: simple UI store (modal, selection)
- [ ] Test: store dengan TanStack Query integration
- [ ] Test: global store vs feature store
- [ ] Publish ke skills.sh

### Skill 4: `nextjs-ca-review`
- [ ] Tulis file skill markdown
- [ ] Test: audit file dengan naming yang salah
- [ ] Test: audit yang menggunakan GlobalEmitter
- [ ] Test: audit prop drilling yang seharusnya pakai Zustand
- [ ] Publish ke skills.sh

---

## Cara Kerja Claude Skills

Skill adalah file markdown yang mendefinisikan instruksi untuk Claude.
Disimpan di `.claude/skills/[skill-name]/skill.md` dan di-trigger via `/skill-name`.

Struktur file skill:
```
.claude/skills/nextjs-ca-scaffold/
└── skill.md
```

Setelah publish ke skills.sh, anggota tim install dengan:
```bash
claude skills install nextjs-ca-scaffold
```

---

## Skill 1: `nextjs-ca-scaffold`

**Trigger:** `/nextjs-ca-scaffold`
**Deskripsi:** Scaffold struktur folder dan file untuk feature baru sesuai convention v2.

```markdown
# Next.js Clean Architecture — Scaffold Feature

Generate a complete feature folder structure following the Next.js Clean Architecture
Convention v2. Before generating, fetch the convention spec from:
https://[domain]/llms.txt

## When to use
When the user wants to create a new feature from scratch.

## What to ask the user (if not provided)
1. Feature name (kebab-case) — e.g. "user-management"
2. What layers are needed: action, element, function, store, lang (default: all)
3. Will it use TanStack Query for client-side fetching? (yes/no)
4. Will it have a form? (yes/no, to include Zod schema)

## What to generate

Always generate:
- `app/[feature]/page.tsx` — only renders SE_ component
- `app/[feature]/$element/server.[feature]-layout.tsx` — SE_ shell
- `app/[feature]/$element/client.[feature]-content.tsx` — CE_ main content

Generate based on answers:
- If has action: `app/[feature]/$action/action.submit.ts`
- If has form: `app/[feature]/$function/cfn.validate.ts` + `[feature].schema.ts`
- If has store: `app/[feature]/$store/ui.store.ts`
- If uses TanStack Query: `reg/query-keys.register.ts` entry + `cfn.fetch.ts`
- If has i18n: add namespace entry in `messages/id.json` and `messages/en.json`
- Always: `api/[feature]/[feature].ts` + `api/[feature]/[feature].type.ts`

## Rules to follow
- page.tsx must only contain: return <SE_FeatureLayout />
- All naming must follow convention (ACT_, SE_, CE_, SFN_, CFN_, APIS_, ZS_, QK_)
- Include "use client" / "use server" directives correctly
- Zod validation must happen in Server Action before calling APIS_
- Never use GlobalEmitter
```

---

## Skill 2: `nextjs-ca-component`

**Trigger:** `/nextjs-ca-component`
**Deskripsi:** Scaffold satu atau sepasang component (SE_/CE_) untuk feature yang sudah ada.

```markdown
# Next.js Clean Architecture — Scaffold Component

Generate a server and/or client component following the convention v2.
Convention reference: https://[domain]/llms.txt

## What to ask the user (if not provided)
1. Feature name — which feature does this component belong to?
2. Component name — e.g. "data-table", "search-bar", "detail-modal"
3. Type: server-only, client-only, or server+client pair?
4. Does the client component need a Zustand store? (yes/no)
5. Does it receive data from parent (props) or fetch its own (TanStack Query)?

## What to generate

For server component:
- `app/[feature]/$element/server.[name].tsx` with SE_ prefix

For client component:
- `app/[feature]/$element/client.[name].tsx` with CE_ prefix
- Add "use client" at top

For server+client pair:
- SE_ component that renders CE_ component (passes data via props)

If Zustand store needed:
- `app/[feature]/$store/[name].store.ts` with useXxxStore pattern

## Rules
- File names use dot notation: server.data-table.tsx
- Function names use PascalCase with prefix: SE_DataTable, CE_DataTable
- Props interface uses I_ prefix: I_DataTableProps
- "use client" goes on line 1, before imports
```

---

## Skill 3: `nextjs-ca-store`

**Trigger:** `/nextjs-ca-store`
**Deskripsi:** Scaffold Zustand store untuk feature atau global, dengan TypeScript interface.

```markdown
# Next.js Clean Architecture — Scaffold Zustand Store

Generate a Zustand store following convention v2.
Convention reference: https://[domain]/llms.txt

## What to ask the user (if not provided)
1. Store name — e.g. "filter", "ui", "cart"
2. Scope: feature-level or global? 
   - Feature-level → `app/[feature]/$store/[name].store.ts`
   - Global → `store/[name].store.ts`
3. What state does it hold? (describe the data)
4. What actions does it need?

## What to generate

```ts
// [name].store.ts
import { create } from "zustand"

interface I_[Name]Store {
    // state fields
    // action signatures
}

export const use[Name]Store = create<I_[Name]Store>((set, get) => ({
    // initial state
    // action implementations
}))
```

## Rules
- Interface prefix: I_[Name]Store
- Hook name: use[Name]Store (camelCase, use prefix)
- Keep actions simple — one responsibility per action
- If state needs to persist across page refresh, suggest using URL params instead
- If state is used by 2+ features, place in global `store/` not `$store/`
```

---

## Skill 4: `nextjs-ca-review`

**Trigger:** `/nextjs-ca-review`
**Deskripsi:** Audit kode atau folder yang ada terhadap convention v2 dan beri rekomendasi konkret.

```markdown
# Next.js Clean Architecture — Code Review

Review the provided code or folder structure against convention v2.
Convention reference: https://[domain]/llms.txt

## What to review
If the user provides a file path: review that file.
If the user provides a folder: review the structure and sample files.
If the user pastes code: review the code directly.

## What to check

### Naming violations
- Wrong file naming pattern (e.g. `LoginForm.tsx` instead of `client.form.tsx`)
- Wrong function prefix (e.g. `LoginForm` instead of `CE_LoginForm`)
- Missing "use client" / "use server" directive
- Wrong interface prefix (e.g. `LoginRequest` instead of `IRq_Login`)

### Structure violations
- Logic in `page.tsx` (should only render SE_ component)
- Component in wrong folder (e.g. CE_ in `$function/`)
- API call directly in component (should go through `api/` layer)
- Zustand store at wrong scope (feature store in global `store/`)

### Pattern violations
- GlobalEmitter usage → suggest Zustand or URL params
- Prop drilling across server components → suggest Zustand
- Direct state sharing between CE_ siblings → suggest Zustand or URL params
- Missing Zod validation in Server Action
- Fetch inside CE_ without TanStack Query → suggest useQuery

## Output format
For each issue found:
1. **Location** — file and line number if possible
2. **Issue** — what is wrong
3. **Fix** — exact code or rename to fix it
4. **Rule** — which convention rule this violates

End with a summary: X issues found, Y critical, Z warnings.
```

---

## Distribusi

### Via skills.sh (utama)

Proses publish (perlu akun skills.sh):

```bash
npm install -g @skills-sh/cli
skills login
skills publish .claude/skills/nextjs-ca-scaffold
skills publish .claude/skills/nextjs-ca-component
skills publish .claude/skills/nextjs-ca-store
skills publish .claude/skills/nextjs-ca-review
```

Cara install untuk anggota tim:
```bash
claude skills install nextjs-ca-scaffold
claude skills install nextjs-ca-component
claude skills install nextjs-ca-store
claude skills install nextjs-ca-review
```

### Via GitHub Releases (fallback)

Jika skills.sh tidak tersedia:
```bash
# Clone langsung ke .claude/skills
git clone https://github.com/[org]/nextjs-clean-architecture .claude/skills/nextjs-ca
```

Tambahkan instruksi dan CTA download di halaman docs Astro.
Lihat checklist di `03-content.md` section "AI Workflow".

---

## Catatan Pengembangan Lanjutan

### Menambah skill baru (misal: `/nextjs-ca-i18n`)

Jika convention berkembang ke i18n dengan next-intl:
1. Buat `.claude/skills/nextjs-ca-i18n/skill.md`
2. Update `llms.txt` dengan pattern i18n baru
3. Referensikan `llms.txt` di dalam skill prompt
4. Publish ke skills.sh dengan `skills publish`

### Update skill yang sudah publish

Jika ada perubahan convention:
1. Edit file skill markdown
2. Update versi di frontmatter skill
3. `skills publish` ulang — versi lama tetap tersedia, tim bisa update via `skills update`

### Menambah slash command lokal (project-specific)

Selain skills.sh, bisa tambah command langsung di repo untuk keperluan spesifik tim:
```
.claude/commands/
├── new-feature.md     → /new-feature
└── check-naming.md    → /check-naming
```
Command ini hanya aktif saat Claude Code dijalankan di dalam repo ini.
Cocok untuk command yang terlalu spesifik untuk di-publish ke skills.sh.
