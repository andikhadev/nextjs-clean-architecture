# Convention v2 — Roadmap

> Membangun ulang Next.js Clean Architecture Convention dengan stack modern,
> dokumentasi Astro Starlight, Claude Skills, dan AI workflow tools siap pakai.

Setiap step punya context file tersendiri dengan detail teknis lengkap.
File ini hanya untuk tracking progress keseluruhan.

---

## Stack Target

```
Next.js 15+  (App Router)
├── UI            shadcn/ui
├── State         Zustand (transient) | URL Search Params via nuqs (persistent)
├── Server State  TanStack Query
├── Forms         TanStack Form + Zod
├── i18n          next-intl
├── API Mocking   MSW (Mock Service Worker)
└── Language      TypeScript strict
```

---

## Progress

| # | Area | Context File | Status |
|---|------|-------------|--------|
| 1 | Convention v2 Spec | [01-convention-spec.md](01-convention-spec.md) | ✅ Selesai |
| 1a | Convention v2 — Perbaikan Dokumentasi | Perbaikan dari review developer: APIC_, decision guide, testing convention, fix $lang/ | ✅ Selesai |
| 1b | Convention v2 — Pattern I: API Mocking (MSW) | Pattern baru: EP_ registry, mock-handler co-located, src/mocks/ wiring. Stack page MSW + update user-management example | ✅ Selesai |
| 2 | Astro Starlight — Setup | [02-astro-starlight.md](02-astro-starlight.md) | ✅ Selesai |
| 3 | Astro Starlight — Konten | [03-content.md](03-content.md) | ✅ Selesai |
| 4 | llms.txt | [04-llms-txt.md](04-llms-txt.md) | ✅ Selesai |
| 5 | AI Workflow | [05-ai-workflow.md](05-ai-workflow.md) | 🔲 Belum dimulai |
| 6 | Claude Skills | [06-claude-skills.md](06-claude-skills.md) | 🔲 Belum dimulai |
| 7 | Deploy | [07-deploy.md](07-deploy.md) | 🔲 Belum dimulai |

**Legend:** 🔲 Belum dimulai · 🔄 In progress · ✅ Selesai · ⏸ Di-hold

---

## Aturan Sinkronisasi

> **Setiap perubahan di `01-convention-spec.md` wajib di-sync ke dokumen terkait sebelum PR di-merge.**

| Jika mengubah... | Wajib update juga... |
|-----------------|---------------------|
| Folder/file naming | `04-llms-txt.md` (draft llms.txt + llms-full.txt) |
| Symbol naming / prefix | `04-llms-txt.md`, `05-ai-workflow.md` (CLAUDE.md template + commands), `CLAUDE.md` |
| Pattern baru (A–H, dst) | `03-content.md` (checklist konten), `04-llms-txt.md` |
| Stack (library baru) | `ROADMAP.md` (Stack Target), `CLAUDE.md`, `04-llms-txt.md` |
| Key rules | `04-llms-txt.md`, `05-ai-workflow.md` (CLAUDE.md template) |
| Pattern I / EP_ / mock-handler | `01-convention-spec.md` (Pattern I section + naming tables), `CLAUDE.md` (Quick Reference) |

---

## Keputusan yang sudah dibuat

| Topik | Keputusan | Alasan |
|-------|-----------|--------|
| Docs platform | Astro Starlight | Built-in search, MDX, Vercel-ready, AI-friendly |
| State transient | Zustand | Type-safe, DevTools, ganti GlobalEmitter |
| State persistent | URL Search Params | Native Next.js, shareable, SSR-compatible |
| Forms | TanStack Form + Zod | Composable, tidak opinionated terhadap UI |
| Server state | TanStack Query | Cache, invalidation, optimistic updates |
| UI components | shadcn/ui | Ownership penuh atas kode komponen |
| i18n | next-intl | First-class support Next.js App Router, server + client |
| Skills distribution | skills.sh (utama) + GitHub Releases (fallback) | Mudah di-install; fallback tanpa dependency eksternal |
| Git commit style | Conventional Commits | Tooling ecosystem luas (commitlint, changelog gen) |
| Library integration | Adapter pattern di `lib/[domain]/` | Ganti library = ubah satu file |
| API Mocking | MSW (Mock Service Worker) | Intercept di network layer — kode produksi tidak berubah |
| Endpoint path registry | `EP_` prefix di `[feature].endpoint.ts` | Single source of truth path — dipakai bersama `APIS_`/`APIC_` dan mock handler |
| Mock handler location | Co-located di `api/[feature]/` sebagai `[resource].mock-handler.ts` | 1:1 dengan file API — ketika path berubah, handler ada di sebelahnya |
| MSW activation | `instrumentation-client.ts` (client primary) + `instrumentation.ts` (server); `layout.tsx` sebagai fallback | Separation of concern — init logic tidak campur di UI layer |
| MSW index.ts design | `initMocksClient()` + `initMocksServer()` dengan dynamic import | Mencegah bundling issue — browser/server API tidak saling contaminate |
| MSW logging | `attachLogger(instance, runtime)` centralized di `src/mocks/index.ts` | Format `[MSW][BROWSER\|SERVER]` konsisten, satu tempat ubah |

---

## Post-v2 Roadmap

Item ini tidak masuk v2 — dijadwalkan setelah v2 rilis dan diadopsi.

| # | Area | Catatan |
|---|------|---------|
| P1 | Cross-feature dependency rules | Aturan eksplisit import antar feature. Opsi: ESLint plugin (eslint-plugin-import boundaries), terbuka untuk alternatif lain |
| P2 | Convention v3 Spec | Evaluasi berdasarkan feedback adopsi v2 |

---

## Referensi

- [Example Use Case — docs](../apps/docs/src/content/docs/examples/) — 3 contoh nyata: Landing Page Bilingual, User Management, Form Wizard
- [Docs lama](../legacy/) — konten v1 yang akan dimigrasikan
