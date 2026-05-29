# Stack Guide — Convention v2

## Stack Resmi

| Layer | Library | Versi |
|-------|---------|-------|
| Framework | Next.js (App Router) | 15+ |
| UI Components | shadcn/ui | latest |
| Server State | TanStack Query | v5 |
| Forms | TanStack Form | v1 |
| Validation | Zod | v3 |
| Client State | Zustand | v5 |
| URL State | nuqs | v2 |
| i18n | next-intl | v4 |
| API Mocking | MSW (Mock Service Worker) | v2 |
| Testing | Vitest + RTL + Playwright | latest |
| Language | TypeScript (strict) | 5+ |

---

## Kapan Pakai Apa

### State Management

```
Pertanyaan: data ini perlu ada di mana?
├── Perlu sync dengan URL (shareable, bookmarkable)?
│   └── nuqs — useQueryState
├── State transient UI (modal, selection, loading)?
│   └── Zustand — useXxxStore
├── Data dari server (API response)?
│   └── TanStack Query — useQuery, useMutation
└── Form input state?
    └── TanStack Form — useForm
```

### Data Fetching

```
Pertanyaan: siapa yang fetch dan kapan?
├── Perlu di-render server-side (SEO, initial load)?
│   └── Pattern A — SE_ + APIS_
├── Perlu refetch setelah mutasi / real-time?
│   └── Pattern B — CE_ + useQuery(APIC_)
├── Perlu proxy ke BE (client tidak boleh tahu URL BE)?
│   └── BFF Pattern — CE_ + APIC_(httpClientInternal) → Route Handler + APIS_(httpServer)
└── Keduanya (SSR + client refetch)?
    └── Pattern A + B — SE_ fetch initial, CE_ refetch via initialData
```

### Form Handling

```
Semua form submission:
└── Pattern C — TanStack Form (CE_) + Zod (ZS_) + Server Action (ACT_)
    ├── CE_Form: TanStack Form untuk UI state dan validation feedback
    ├── ZS_Schema: Zod schema (shared antara client dan server)
    └── ACT_Submit: Server Action — validate ulang dengan Zod, lalu APIS_
```

### i18n

```
Semua user-facing string:
├── CE_ (client component) → useTranslations("Namespace")
├── SE_ (server component) → getTranslations("Namespace")  [async]
└── Tidak boleh hardcode string di JSX
```

---

## HTTP Adapter — Pilihan Instance

```
Pertanyaan: APIS_ atau APIC_? Ke mana?
├── APIS_ ke BE (server-side, ada auth cookie)
│   └── httpServer — dari lib/http/server.ts
├── APIC_ ke BE langsung (client-side, ada base URL env)
│   └── httpClient — dari lib/http/client.ts
└── APIC_ ke Next.js Route Handler (BFF, tidak perlu base URL BE)
    └── httpClientInternal — dari lib/http/client.ts
```

---

## shadcn/ui

**Gunakan shadcn/ui untuk:**
- Semua komponen UI dasar (Button, Input, Dialog, Form, Table, dll)
- Komposisi komponen kompleks

**Jangan:**
- Modifikasi file di `components/ui/` langsung
- Install komponen UI library lain tanpa diskusi

**Buat wrapper CE_ untuk:**
- Komponen dengan behavior custom (loading state, error state)
- Komposisi 2+ shadcn components yang sering dipakai bersama
- Komponen dengan props interface convention (I_[Name]Props)

---

## MSW (Mock Service Worker)

**Kapan aktif:**
- Development: ketika BE belum siap atau tidak available
- Testing: untuk integration test yang butuh API mock

**Setup dev:**
- Client-side mock: `instrumentation-client.ts`
- Server-side mock: `instrumentation.ts`
- Fallback: `layout.tsx` bisa panggil `initMocksClient()` — singleton guard mencegah double init

**Setup test:**
- Import `server` dari `@/mocks/node` untuk lifecycle control

**EP_ Registry:** Selalu gunakan `EP_[Feature]` untuk URL di MSW handler — sama dengan yang dipakai APIS_/APIC_.

---

## Testing Strategy

| Test type | Tool | Lokasi | Untuk |
|-----------|------|--------|-------|
| Unit | Vitest + RTL | co-located | CFN_, CE_ logic, ZS_ |
| Integration | Vitest + MSW | `$test/` | ACT_ + APIS_ flow |
| E2E | Playwright | `e2e/` | SE_, page.tsx, full flow |

SE_ dan page.tsx tidak di-unit-test — cukup E2E.
Server Action test: import langsung, mock `next/headers` + `next/navigation`.
