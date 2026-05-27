# nextjs-clean-architecture

Convention guide for Next.js 15+ App Router projects.
**Saat ini dalam pengembangan v2** — lihat `.planning/ROADMAP.md` untuk status lengkap.

---

## Status Proyek

| Area | File Konteks | Status |
|------|-------------|--------|
| Convention v2 Spec | `.planning/01-convention-spec.md` | ✅ Selesai |
| Astro Starlight Setup | `.planning/02-astro-starlight.md` | ✅ Selesai |
| Konten Dokumentasi | `.planning/03-content.md` | ✅ Selesai |
| llms.txt | `.planning/04-llms-txt.md` | ✅ Selesai |
| AI Workflow | `.planning/05-ai-workflow.md` | 🔲 Belum dimulai |
| Claude Skills | `.planning/06-claude-skills.md` | 🔲 Belum dimulai |
| Deploy | `.planning/07-deploy.md` | 🔲 Belum dimulai |

---

## Struktur Repo

```
.planning/          ← context files per area (baca ini sebelum mulai kerja)
legacy/             ← dokumentasi v1 (vanilla HTML + Markdown, akan dimigrasikan ke Astro)
apps/docs/src/content/docs/examples/
├── landing-page.mdx    ← Contoh 1: Landing Page Bilingual (Pattern A, F, H)
├── user-management.mdx ← Contoh 2: User Management (Pattern A, B, C, D, E, H)
└── form-wizard.mdx     ← Contoh 3: Form Wizard (Pattern C, E, F, H)
```

---

## Stack Target (v2)

```
Next.js 15+  (App Router)
├── UI            shadcn/ui
├── State         Zustand (transient) | URL Search Params via nuqs (persistent)
├── Server State  TanStack Query
├── Forms         TanStack Form + Zod
├── i18n          next-intl
├── API Mocking   MSW (Mock Service Worker) — dev + testing
└── Language      TypeScript strict
```

---

## Convention v2 — Quick Reference

Detail lengkap ada di `.planning/01-convention-spec.md`.

### Folder per Feature

```
app/[feature]/
├── $action/      ACT_ — Next.js Server Actions
├── $element/     SE_ (server) / CE_ (client) — React components
├── $function/    SFN_ (server) / CFN_ (client) — helper functions
├── $store/       useXxxStore — Zustand stores scoped ke feature ini
├── $test/        integration test multi-layer (Vitest + MSW)
└── page.tsx      hanya boleh: return <SE_FeatureLayout />
```

> i18n: string per feature disimpan di `messages/[locale].json` dengan namespace feature,
> bukan di `$lang/`. Gunakan `useTranslations("Feature")` di CE_ dan `getTranslations` di SE_.

### File Naming

| Tipe | Pattern | Contoh |
|------|---------|--------|
| Server Action | `action.[sub].ts` | `action.submit.ts` |
| Server Element | `server.[module].tsx` | `server.layout.tsx` |
| Client Element | `client.[module].tsx` | `client.form.tsx` |
| Server Function | `sfn.[module].ts` | `sfn.session.ts` |
| Client Function | `cfn.[module].ts` | `cfn.validate.ts` |
| Zustand Store | `[module].store.ts` | `ui.store.ts` |
| Zod Schema | `[module].schema.ts` | `login.schema.ts` |
| API | `[resource].ts` + `[resource].type.ts` | `login.ts` |
| Endpoint Path Registry | `[feature].endpoint.ts` | `user.endpoint.ts` |
| MSW Mock Handler | `[resource].mock-handler.ts` | `users-list.mock-handler.ts` |
| Registry | `[domain].register.ts` | `routes.register.ts` |
| i18n messages | `[locale].json` | `id.json`, `en.json` — di `messages/` root |
| Lib adapter | `[library].ts` + `index.ts` | `ioredis.ts` di `lib/cache/` |

### Symbol Naming

| Simbol | Prefix | Simbol | Prefix |
|--------|--------|--------|--------|
| Server Action | `ACT_` | Client Element | `CE_` |
| Server Element | `SE_` | Client Function | `CFN_` |
| Server Function | `SFN_` | Zustand hook | `useXxxStore` |
| API fetch (server-only) | `APIS_` | API fetch (client-accessible) | `APIC_` |
| Endpoint path registry | `EP_` | Zod schema | `ZS_` |
| Interface | `I_` | Request interface | `IRq_` |
| Response interface | `IRs_` | Type alias | `T_` |
| Enum | `E_` | Query key | `QK_` |
| Route constant | `ROUTE_` | i18n (CE_) | `useTranslations` |

### Aturan Penting

- `page.tsx` tidak boleh berisi logika — hanya `return <SE_FeatureLayout />`
- Jangan modifikasi komponen shadcn/ui langsung — buat wrapper di `CE_` atau `lib/`
- **Dilarang:** GlobalEmitter — gunakan Zustand atau URL Search Params
- Search/filter/pagination → URL Search Params
- Modal/selection/toggle → Zustand store
- Zod validation wajib ada di Server Action sebelum memanggil `APIS_`
- `APIS_` hanya boleh dipanggil dari SE_, ACT_, SFN_ — `APIC_` untuk CE_ via TanStack Query
- MSW (dev): aktifkan via `instrumentation-client.ts` (client primary) + `instrumentation.ts` (server)
- MSW fallback: `layout.tsx` bisa memanggil `initMocksClient()` — singleton guard mencegah double init
- MSW (test): import `server` langsung dari `@/mocks/node` untuk lifecycle control
- Testing: unit/component test co-located di samping file sumber; integration test di `$test/`; E2E di `/e2e/[feature]/`
- Server Action test: import langsung sebagai fungsi, `vi.mock('next/headers')` + `vi.mock('next/navigation')`
- SE_ dan `page.tsx` tidak di-unit-test — cukup E2E (Playwright)

---

## Cara Kerja Saat Ini (v1 — legacy)

Docs v1 ada di `legacy/` sebagai referensi konten yang akan dimigrasikan ke Astro Starlight:
- Buka `legacy/index.html` di browser untuk preview
- Konten ada di `legacy/pages/`, navigasi di `legacy/menu.json`

---

## Git Commit Style

Format: **Conventional Commits** — `<type>(<scope>): <description>`

```
feat(login): add OAuth support
fix(session): correct cookie expiry handling
docs: update naming convention table
refactor(user-list): extract filter logic to CFN_
chore: update dependencies
```

| Type | Kapan digunakan |
|------|----------------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `docs` | Perubahan dokumentasi |
| `refactor` | Refactor tanpa perubahan fungsional |
| `chore` | Dependency, config, tooling |
| `test` | Tambah atau perbaiki test |
| `perf` | Optimasi performa |
| `style` | Formatting, tidak ada perubahan logika |

- `scope` opsional — gunakan nama feature folder (`login`, `user-list`, dll.)
- Deskripsi: huruf kecil, tanpa titik di akhir, dalam bahasa Inggris
