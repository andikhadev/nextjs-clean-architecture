# AI Workflow Design Spec — Convention v2

**Date:** 2026-05-29
**Status:** Approved
**Scope:** Step 05 — AI Workflow artifacts untuk tim yang mengadopsi Next.js Clean Architecture Convention v2

---

## 1. Overview

### Tujuan

Membuat satu portable `.claude/` folder yang bisa di-copy ke repo manapun. Setelah copy, developer menjalankan `/init` — convention langsung aktif tanpa setup manual.

### Deliverables

- `.claude/commands/` — 5 slash commands (init, new-feature, review-naming, scaffold-adapter, scaffold-i18n)
- `.claude/skills/nextjs-ca/` — bundled convention knowledge sebagai local skill
- Skills on-demand yang diinstall per-project ke `.claude/skills/`

### Dependencies

- Step 01 (convention spec) — ✅ selesai
- Step 04 (llms.txt live) — ✅ selesai
- `nextjs-ca-skill` global sudah ada sebagai referensi content

---

## 2. Portable Package Architecture

### Yang Di-copy ke Project Baru

```
.claude/
├── commands/
│   ├── init.md
│   ├── new-feature.md
│   ├── review-naming.md
│   ├── scaffold-adapter.md
│   └── scaffold-i18n.md
└── skills/
    └── nextjs-ca/          ← satu-satunya yang bundled
        ├── SKILL.md
        └── references/
            ├── patterns.md
            ├── naming.md
            ├── folder-structure.md
            ├── key-rules.md
            └── stack-guide.md
```

### Yang Di-install Saat `/init` (ke `.claude/skills/`)

Skills tidak di-bundle — diinstall fresh dari registry agar selalu up-to-date.

**Mandatory (selalu diinstall):**
- `frontend-design` — UI/UX patterns, layout best practices
- `shadcn` — shadcn/ui component best practices (wajib karena convention melarang modifikasi langsung komponen)
- `nextjs-app-router-patterns` — App Router advanced patterns

**On-demand (diinstall saat command mendeteksi kebutuhan):**
- `nuqs` — saat feature butuh URL search params (Pattern D)
- `tanstack-query-best-practices` — saat feature butuh client-side fetching (Pattern B, APIC_)
- `tanstack-form` — saat feature butuh form (Pattern C)
- `zod` — saat feature butuh Zod schema (ZS_)
- `zustand` — saat feature butuh Zustand store (Pattern E)
- `next-intl-app-router` — saat feature butuh i18n (Pattern H)

### Git Strategy

`.claude/skills/` di-commit ke git secara default — developer yang tidak ingin commit skills bisa tambahkan ke `.gitignore` sendiri. Tidak ada `.gitignore` entry yang ditambahkan otomatis oleh init.

---

## 3. Init Command Design

### Trigger

```
/init
```

Idempotent — re-run berfungsi sebagai sync. Tidak ada command terpisah untuk sync.

### 5-Step Workflow

```
[1] CONTEXT SCAN
    ├── Baca package.json → nama project, versi, dependencies
    ├── Deteksi stack: Next.js, shadcn/ui, TanStack Query/Form,
    │   Zustand, next-intl, Zod, MSW, nuqs
    ├── Cek folder: src/app/, src/api/, src/lib/, src/reg/, messages/
    └── Catat missing folders untuk dilaporkan

[2] DETECT MODE
    ├── Tidak ada CLAUDE.md → mode: first-time
    └── CLAUDE.md ada → mode: sync
        ├── Cek apakah section "Next.js Clean Architecture Convention" sudah ada
        ├── Jika ada → bandingkan versi convention (dari llms.txt header)
        └── Jika belum ada → siapkan untuk smart-merge

[3] FETCH & INSTALL SKILLS
    ├── Fetch llms.txt dari published URL → convention knowledge terbaru
    ├── Cek .claude/skills/ → skills mana yang belum ada
    ├── Install mandatory skills: frontend-design, shadcn, nextjs-app-router-patterns
    └── Update nextjs-ca/references/ dari llms.txt jika sync mode

[4] GENERATE / MERGE CLAUDE.md
    First-time:
    └── Generate CLAUDE.md berdasarkan context scan + llms.txt

    Sync mode:
    ├── Diff section convention lama vs baru
    ├── Report: apa yang berubah, apa yang baru
    ├── Jika ada overlap dengan konten existing → tampilkan conflict + saran
    ├── Tidak ada perubahan tanpa konfirmasi user
    └── Apply setelah user approve

[5] REPORT
    ├── Skills: installed / updated / already up to date
    ├── CLAUDE.md: created / merged / no changes
    ├── Missing folders (src/api/, src/reg/, dll) jika ada
    └── Suggested next step: /new-feature untuk scaffold pertama
```

### Smart Merge Rules

- Section convention selalu di-append di bagian bawah CLAUDE.md
- Konten existing tidak pernah dihapus atau ditimpa
- Jika section overlap terdeteksi → tampilkan excerpt + saran konkret
- Developer selalu konfirmasi sebelum perubahan diapply

### CLAUDE.md Section Template (yang di-generate/update)

```markdown
---

## Next.js Clean Architecture Convention v2

Convention reference: https://[domain]/llms.txt
Full docs: https://[domain]/

### Active Skills

| Trigger | Skill | Aktivasi |
|---------|-------|---------|
| Scaffold, naming, pattern | `nextjs-ca` | Otomatis |
| shadcn/ui component | `shadcn` | Otomatis |
| App Router patterns | `nextjs-app-router-patterns` | Otomatis |
| UI/UX layout | `frontend-design` | Otomatis |
| URL state | `nuqs` | On-demand |
| Client fetching | `tanstack-query-best-practices` | On-demand |
| Form | `tanstack-form` | On-demand |
| Validation | `zod` | On-demand |
| UI state | `zustand` | On-demand |
| i18n | `next-intl-app-router` | On-demand |

### Stack

[diisi berdasarkan context scan — hanya stack yang terdeteksi di package.json]

### Missing Structure

[diisi jika ada folder yang belum ada — kosong jika semua sudah ada]

### Critical Rules

[diisi dari llms.txt — key rules section]
```

---

## 4. Commands Design

### `/new-feature`

**Trigger:** Developer ingin scaffold feature baru dari awal.

**Pertanyaan yang diajukan (satu per satu):**
1. Feature name (kebab-case)?
2. API endpoint dari BE? (path + methods yang tersedia)
3. Apakah perlu store untuk UI state (modal, selection)?
4. Apakah perlu i18n?
5. Apakah ada form? (menentukan TanStack Form + Zod + Server Action)
6. Image upload? Jika ya: upload ke BE langsung atau via adapter (S3, Cloudinary)?

**Tidak diasumsikan:** i18n, store, TanStack Query, MSW — semua harus dikonfirmasi.

**Output:**
- Scaffold file structure sesuai layers yang dikonfirmasi
- Semua simbol yang direferensikan punya file-nya
- Install on-demand skills yang dibutuhkan sebelum generate
- Post-generate: verifikasi tidak ada import yang menggantung

**Mental Model:**
```
PRECISION RULE — berlaku di semua commands:
- Hanya generate apa yang diminta atau dikonfirmasi
- Setiap simbol yang direferensikan HARUS punya file-nya
- Jika ragu → tanya sebelum generate, jangan asumsi
- Verifikasi setelah generate: ada import yang belum punya file?
```

---

### `/review-naming`

**Trigger:** Developer ingin audit file/folder terhadap convention v2.

**Input:** File path, folder path, atau paste kode langsung.

**Yang dicek:**
- File naming (dot-notation: `server.x.tsx`, `client.x.tsx`, dll)
- Symbol prefix (SE_, CE_, ACT_, SFN_, CFN_, APIS_, APIC_, ZS_, QK_, ROUTE_, EP_)
- Interface prefix (I_, IRq_, IRs_)
- `"use client"` / `"use server"` directive
- page.tsx berisi logic (harus hanya return SE_)
- Import library langsung tanpa adapter (seharusnya via `lib/`)
- APIS_ dipanggil dari CE_ (violation)
- GlobalEmitter usage (forbidden)

**Output per issue:**
1. Location — file path + line number
2. Issue — apa yang salah + rule mana yang dilanggar
3. Fix — exact rename atau perubahan yang dibutuhkan

**Summary:** X issues found, Y critical, Z warnings.

---

### `/scaffold-adapter`

**Trigger:** Developer ingin membuat library adapter baru di `lib/[domain]/`.

**Pertanyaan yang diajukan (satu per satu):**
1. Domain name? (cache, storage, mailer, queue, http, dll)
2. Library yang di-wrap? (ioredis, nodemailer, @aws-sdk/client-s3, dll)
3. Operasi yang dibutuhkan sekarang? (bukan semua yang mungkin — hanya yang dikonfirmasi)
4. Ada fitur spesifik? (TTL/expiry untuk cache? Auth header? Retry?)
5. Error handling: custom atau throw dan biarkan caller handle?

**Adapter Scope Rule:**
> Generate interface hanya dengan method yang dikonfirmasi. Jangan generate method "untuk jaga-jaga". Developer extend sendiri jika butuh.

**Output:**
- `lib/[domain]/index.ts` — `I_[Domain]Adapter` interface + re-export
- `lib/[domain]/[library].ts` — concrete implementation

---

### `/scaffold-i18n`

**Trigger:** Developer ingin tambah namespace baru ke messages/.

**Pertanyaan yang diajukan:**
1. Feature name / namespace?
2. Keys yang dibutuhkan? (title, submitButton, errorMessages, dll)
3. Locales yang ada di project? (default: en, id)

**Output:**
- Namespace entry di `messages/[locale].json` untuk setiap locale
- Usage snippet: `useTranslations("[Feature]")` untuk CE_
- Usage snippet: `getTranslations("[Feature]")` untuk SE_

---

## 5. Pattern G Extension: HTTP Adapter

Masuk sebagai contoh konkret Pattern G di dokumentasi convention.

### Interface

```typescript
// lib/http/index.ts
export interface I_RequestOptions {
  headers?: Record<string, string>
}

export interface I_HttpClientConfig {
  baseUrl?: string
  headersFn?: () => Promise<Record<string, string>> | Record<string, string>
}

export interface I_HttpClient {
  get<T>(url: string, options?: I_RequestOptions): Promise<T>
  post<T>(url: string, body?: unknown, options?: I_RequestOptions): Promise<T>
  put<T>(url: string, body?: unknown, options?: I_RequestOptions): Promise<T>
  delete<T>(url: string, options?: I_RequestOptions): Promise<T>
}
```

### Factory & Instances

```
lib/http/
├── index.ts        ← I_HttpClient, I_HttpClientConfig, I_RequestOptions
├── fetch.ts        ← createHttpClient() factory
├── server.ts       ← httpServer (auth dari cookies(), server-only)
└── client.ts       ← httpClient (BE direct) + httpClientInternal (BFF/Route Handler)
```

### Usage Rule

| APIC_/APIS_ calls... | Client yang dipakai |
|----------------------|---------------------|
| BE langsung (client-side) | `httpClient` |
| Next.js Route Handler (BFF) | `httpClientInternal` |
| BE langsung (server-side) | `httpServer` |

### BFF Proxy Pattern

Kasus: APIC_ memanggil Next.js Route Handler yang mem-forward ke BE via APIS_.

```
CE_ → APIC_() → /api/[feature] (Route Handler) → APIS_() → BE
```

- `APIC_` menggunakan `httpClientInternal` (relative URL, tanpa base URL BE)
- Route Handler menggunakan `APIS_` via `httpServer` (dengan auth server-side)
- Client tidak pernah tahu URL BE atau session token

---

## 6. Route Handler Convention

Tambahan baru ke folder structure — belum ada di spec sebelumnya.

**Feature-scoped** (hanya dipakai feature ini):
```
app/[feature]/$route/route.ts
```

**Global** (dipakai lebih dari satu feature):
```
app/api/[feature]/route.ts
```

Route Handler adalah server-side — boleh akses cookies(), session, dan memanggil APIS_.

---

## 7. Mental Model Rules

### Precision Rule (semua commands)

1. Hanya generate layer yang diminta atau dikonfirmasi
2. Setiap simbol yang direferensikan di kode HARUS punya file-nya
3. Jika ragu apakah sebuah layer diperlukan → tanya sebelum generate
4. Tidak ada asumsi: tidak ada i18n, store, TanStack Query kecuali dikonfirmasi
5. Setelah generate: verifikasi setiap import punya file yang sesuai

### Adapter Scope Rule (Pattern G)

1. Tanya operasi yang dibutuhkan sekarang — bukan "mungkin butuh nanti"
2. Tanya fitur spesifik (TTL? Pub/sub? Pipeline? Auth header? Retry?)
3. Generate interface hanya dengan method yang dikonfirmasi
4. Berlaku untuk semua adapter: HTTP, Redis, S3, Mailer, Queue, dll

### Anti-patterns yang Wajib Dicegah

- Menambahkan i18n tanpa konfirmasi
- Menambahkan store tanpa konfirmasi
- Membuat file yang direferensikan tapi tidak di-generate
- Over-engineering adapter dengan method yang tidak diminta
- Memanggil APIS_ dari CE_ (harus via APIC_ + TanStack Query)
- Memodifikasi `components/ui/` langsung (harus buat wrapper)
- Menggunakan GlobalEmitter

---

## 8. Sync Strategy

### Bagaimana Sync Bekerja

Re-run `/init` di project yang sudah adopt convention:

1. Fetch `llms.txt` terbaru → bandingkan versi dengan yang tersimpan di section CLAUDE.md
2. Diff konten convention section lama vs baru
3. Report perubahan: rule baru, pattern baru, naming change
4. Minta konfirmasi sebelum apply update ke CLAUDE.md
5. Update `nextjs-ca/references/` dari content llms.txt terbaru
6. Re-run `npx skills add` untuk mandatory skills → update ke versi terbaru

### Apa yang Tidak Berubah Saat Sync

- Konten existing CLAUDE.md di luar section convention
- Project-specific configuration
- On-demand skills yang sudah terinstall (tidak dihapus, hanya update jika ada)
