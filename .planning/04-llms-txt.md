# 04 — llms.txt

**Status:** 🔲 Belum dimulai
**Tujuan:** Membuat file machine-readable yang memudahkan AI (Claude, Cursor, Copilot, dll)
memahami convention ini secara instan tanpa perlu membaca seluruh dokumentasi.
Bergantung pada: Step 01 (spec selesai).

---

## Checklist

- [ ] Tulis `llms.txt` — ringkasan convention (untuk quick context)
- [ ] Tulis `llms-full.txt` — versi lengkap dengan semua contoh kode (Pattern A–H)
- [ ] Tempatkan di `apps/docs/public/` agar accessible di root URL
- [ ] Verifikasi `[domain]/llms.txt` bisa diakses setelah deploy
- [ ] Tambahkan link di homepage docs
- [ ] Tambahkan meta tag `<link rel="llms" href="/llms.txt">` di `<head>`

> **Sync rule:** Setiap perubahan `01-convention-spec.md` wajib diikuti update `llms.txt`
> dan `llms-full.txt` sebelum perubahan di-commit. Lihat tabel sinkronisasi di `ROADMAP.md`.

---

## Apa itu llms.txt

Format standar yang sedang berkembang (mirip `robots.txt`) untuk memberikan
konteks terstruktur kepada AI tentang sebuah project atau dokumentasi.

Referensi: https://llmstxt.org

Manfaat untuk convention ini:
- Developer bisa paste URL `llms.txt` ke Claude/Cursor dan langsung dapat context
- Claude Skills bisa fetch `llms.txt` sebagai ground truth sebelum generate kode
- Memastikan AI tidak mengarang convention yang tidak ada

---

## Format `llms.txt` (ringkasan)

```txt
# Next.js Clean Architecture Convention v2

> Convention guide for structuring Next.js 15+ App Router projects.
> Stack: Next.js 15, TypeScript, shadcn/ui, Zustand, nuqs, TanStack Query, TanStack Form, Zod, next-intl.

## Folder Structure

- `messages/` — next-intl locale files (en.json, id.json) — at project root
- `src/app/[feature]/` — one directory per feature
- `src/app/[feature]/$action/` — Next.js Server Actions (ACT_ prefix)
- `src/app/[feature]/$element/` — React components (SE_ server, CE_ client)
- `src/app/[feature]/$function/` — helper functions (SFN_ server, CFN_ client)
- `src/app/[feature]/$store/` — Zustand stores scoped to this feature
- `src/api/[feature]/` — fetch wrappers per feature (APIS_ prefix)
- `src/i18n/` — next-intl routing + request config
- `src/lib/[domain]/` — third-party adapters (index.ts interface + [library].ts impl)
- `src/reg/` — global constants: routes (ROUTE_), query keys (QK_)
- `src/store/` — global Zustand stores (used by 2+ features)

## Naming: Files

- Server Action: `action.[sub].ts`
- Server Element: `server.[module].tsx`
- Client Element: `client.[module].tsx`
- Server Function: `sfn.[module].ts`
- Client Function: `cfn.[module].ts`
- Zustand Store: `[module].store.ts`
- Zod Schema: `[module].schema.ts`
- API: `[resource].ts` + `[resource].type.ts`
- Lib adapter: `[library].ts` (impl) + `index.ts` (interface + re-export)
- i18n messages: `[locale].json` in `messages/` root

## Naming: Symbols

- ACT_ → Server Action
- SE_ → Server Element (component)
- CE_ → Client Element (component, "use client")
- SFN_ → Server Function
- CFN_ → Client Function
- APIS_ → API fetch function
- use[Name]Store → Zustand store hook
- ZS_ → Zod schema
- QK_ → TanStack Query key
- ROUTE_ → route constant
- I_ → Interface, IRq_ → Request interface, IRs_ → Response interface
- T_ → Type alias, E_ → Enum
- I_[Domain]Adapter → lib adapter interface

## Key Rules

- `page.tsx` must only render one SE_ component. No logic allowed.
- Never modify shadcn/ui components directly. Wrap them in CE_/lib.
- Use URL Search Params for search/filter/pagination state.
- Use Zustand only for transient UI state (modals, selections, toggles).
- GlobalEmitter is forbidden. Use Zustand or URL params instead.
- Server Actions must validate with Zod before calling APIS_.
- All API response types use IRs_ prefix. All request types use IRq_.
- Never import external libraries directly — use adapters in lib/[domain]/.
- All user-facing strings use useTranslations (CE_) or getTranslations (SE_/SFN_).

## Patterns

- Pattern A — Server fetch: page → SE_ → APIS_ → CE_ via props
- Pattern B — Client fetch: CE_ → useQuery(QK_, APIS_)
- Pattern C — Form submit: CE_ form (useForm/TanStack Form) → ACT_ (plain object) → Zod validate → APIS_
- Pattern D — Cross-component (persistent): useQueryState (nuqs) → page re-render → SE_ baca
- Pattern E — Cross-component (transient): useXxxStore from $store/ or store/
- Pattern F — shadcn/ui extension: wrap in CE_ or lib/, never modify components/ui/
- Pattern G — Library adapter: lib/[domain]/index.ts (interface) + lib/[domain]/[library].ts (impl)
- Pattern H — i18n: messages/[locale].json namespaced by feature; useTranslations/getTranslations

## Git Commits

Conventional Commits: <type>(<scope>): <description>
Types: feat, fix, docs, refactor, chore, test, perf, style

## Docs

- Full documentation: https://[domain]/
- llms-full.txt (with code examples): https://[domain]/llms-full.txt
- Skills & commands: https://[domain]/skills
```

---

## Format `llms-full.txt` (dengan kode)

Sama seperti `llms.txt` tapi setiap pattern disertai contoh kode lengkap.
Ukuran estimasi: ~5000 token. Cocok untuk di-paste langsung ke context AI.

Struktur tambahan di `llms-full.txt`:
- Contoh kode untuk setiap pattern (A–F)
- Contoh file lengkap: action, element, store, schema, API
- Daftar semua prefix dengan contoh

---

## Catatan Pengembangan Lanjutan

### Update llms.txt saat ada convention baru

Setiap kali ada penambahan convention (misal: i18n pattern dengan next-intl):
1. Tambahkan entry di section "Patterns" atau "Key Rules"
2. Update `llms-full.txt` dengan contoh kode baru
3. Bump version di baris pertama: `# Next.js Clean Architecture Convention v2.1`

### Integrasi dengan Claude Skills

Skill `nextjs-ca-scaffold` dan `nextjs-ca-review` bisa di-setup untuk
fetch `llms.txt` di awal eksekusi sebagai ground truth:

```md
<!-- di dalam skill prompt -->
Before generating any code, fetch the convention spec from:
https://[domain]/llms.txt
Use it as the source of truth for all naming and structure decisions.
```
