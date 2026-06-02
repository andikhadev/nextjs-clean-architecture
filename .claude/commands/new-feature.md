# /new-feature — Scaffold Feature (Next.js Clean Architecture v2)

Scaffold folder dan file untuk feature baru sesuai convention v2.

## Precision Rule (wajib diikuti)

- Hanya generate layer yang diminta atau dikonfirmasi
- Setiap simbol yang direferensikan di kode HARUS punya file-nya
- Jika ragu → tanya sebelum generate, jangan asumsi
- Tidak ada asumsi: i18n, store, TanStack Query, MSW tidak ditambahkan kecuali dikonfirmasi
- Setelah generate: verifikasi setiap import punya file yang sesuai

## Pertanyaan (tanya satu per satu, tunggu jawaban sebelum lanjut)

1. **Feature name** — kebab-case, contoh: `user-management`, `cms-homepage-banner`

2. **API endpoint dari BE** — path + HTTP methods yang tersedia
   Contoh: `GET/POST/PUT/DELETE /api/cms/homepage-banner`
   Jika tidak ada → feature adalah client-only atau static

3. **Perlu store untuk UI state?** (modal open/close, selected item, toggle)
   Default: tidak. Tanya jika tidak disebutkan.

4. **Ada form?** (menentukan TanStack Form + Zod schema + Server Action)
   Default: tidak. Tanya jika tidak disebutkan.

5. **Ada image/file upload?** Jika ya:
   - Upload ke BE langsung via endpoint yang sama atau endpoint terpisah?
   - Atau via adapter (S3, Cloudinary, dll)?

6. **Perlu i18n (next-intl)?**
   Default: tidak. Tanya jika tidak disebutkan.

## Stack Reference Files — Wajib Dibaca Sebelum Generate

Berdasarkan jawaban di atas, baca file berikut dari `.claude/skills/nextjs-ca/` sebelum generate apapun.
Jangan lanjut ke generate jika file yang relevan belum dibaca.

| Kondisi | File yang harus dibaca |
|---------|----------------------|
| Selalu | `references/folder-structure.md` |
| Selalu | `references/naming.md` |
| Ada API endpoint dari BE | `references/stack/http-adapter.md` |
| MSW mock dikonfirmasi | `references/stack/msw.md` |
| Ada form (TanStack Form) | `references/stack/tanstack-form.md` |
| Client fetching (TanStack Query) | `references/stack/tanstack-query.md` |
| Ada Zustand store | `references/stack/zustand.md` |
| Ada URL search params / filter / pagination | `references/stack/nuqs.md` |
| Ada i18n | `references/stack/next-intl.md` |
| Ada Zod schema | `references/stack/zod.md` |
| Ada shadcn/ui wrapper | `references/stack/shadcn.md` |

---

## Install On-demand Skills Sebelum Generate

Berdasarkan jawaban di atas, install skill yang dibutuhkan ke `.claude/skills/` jika belum ada:
- Form dikonfirmasi → install `tanstack-form`, `zod`
- Client fetching dari API → install `tanstack-query-best-practices`
- Store dikonfirmasi → install `zustand`
- i18n dikonfirmasi → install `next-intl-app-router`
- URL search params → install `nuqs`

## Generate

Berdasarkan jawaban, generate file-file berikut:

### Selalu di-generate

```
app/[feature]/page.tsx
app/[feature]/$element/server.[feature]-layout.tsx
app/[feature]/$element/client.[feature]-content.tsx
```

`page.tsx` hanya boleh berisi:
```tsx
import { SE_[Feature]Layout } from "./$element/server.[feature]-layout"
export default function Page() {
  return <SE_[Feature]Layout />
}
```

### Jika ada API endpoint

```
api/[feature]/[feature].ts          ← APIS_ + APIC_ functions
api/[feature]/[feature].type.ts     ← IRq_, IRs_, T_ types
reg/[feature].endpoint.ts           ← EP_[Feature] path registry
```

Gunakan `httpServer` untuk APIS_, `httpClient` atau `httpClientInternal` untuk APIC_.
Jika `lib/http/` belum ada → tanya apakah perlu scaffold adapter HTTP dulu.

### Jika ada form

```
app/[feature]/$action/action.submit.ts
app/[feature]/$function/cfn.[feature]-schema.ts   ← ZS_ schema
```

### Jika ada store

```
app/[feature]/$store/ui.store.ts   ← useXxxStore pattern
```

### Jika ada TanStack Query

```
reg/query-keys.register.ts   ← tambahkan QK_[Feature]
```

### Jika ada i18n

```
messages/id.json   ← tambahkan namespace [Feature]
messages/en.json   ← tambahkan namespace [Feature]
```

### Jika ada Route Handler (BFF)

Feature-scoped:
```
app/[feature]/$route/route.ts
```

## Post-generate Verification

Sebelum selesai, bandingkan hasil terhadap reference files yang telah dibaca:

| Area | Yang Dicek |
|------|-----------|
| Import integrity | Setiap `import` punya file target-nya; tidak ada referensi ke simbol yang belum di-generate |
| `page.tsx` | Tidak berisi logic apapun — hanya `return <SE_FeatureLayout />` |
| Naming symbols | Prefix SE_, CE_, ACT_, SFN_, CFN_, APIS_, APIC_, EP_, ZS_, QK_ sesuai convention |
| Folder structure | Subfolder `$element`, `$action`, `$function`, `$store` sesuai yang dibutuhkan |
| MSW setup | Env var `NEXT_PUBLIC_API_MOCKING`, struktur `mocks/`, naming `[resource].mock-handler.ts`, import dari `@/mocks` |
| HTTP adapter | Nama file benar (`server.ts`, `client.ts`), instance yang dipakai sesuai konteks |
| TanStack Query | `QK_` terdaftar di registry, `useQuery` hanya di CE_, `initialData` dari SE_ |
| TanStack Form | `form.Field` binding, error display, submit ke ACT_ (bukan `<form action={ACT_}>`) |
| Zustand | Interface `I_[Name]Store` ada, scope benar (`$store/` vs root `store/`) |
| nuqs | Parser + `.withDefault()` ada, key parameter konsisten antar komponen |
| next-intl | `useTranslations` di CE_, `getTranslations` di SE_/ACT_, namespace sesuai feature |
| Zod | `safeParse` di ACT_ (bukan `parse`), `ZS_` prefix, `error.flatten()` |
| shadcn/ui | Tidak modifikasi `components/ui/` langsung, wrapper di CE_ atau `lib/ui/` |

Jika ada yang tidak sesuai → perbaiki sebelum lapor selesai ke developer.

## Naming Reference

| Type | File | Symbol |
|------|------|--------|
| Server Action | `action.[sub].ts` | `ACT_` |
| Server Element | `server.[module].tsx` | `SE_` |
| Client Element | `client.[module].tsx` | `CE_` |
| Server Function | `sfn.[module].ts` | `SFN_` |
| Client Function | `cfn.[module].ts` | `CFN_` |
| Zustand Store | `[module].store.ts` | `useXxxStore` |
| Zod Schema | `[module].schema.ts` atau `cfn.[module]-schema.ts` | `ZS_` |
| API server-only | `[feature].ts` | `APIS_` |
| API client | `[feature].ts` | `APIC_` |
| Endpoint registry | `[feature].endpoint.ts` | `EP_` |
| Query key | `query-keys.register.ts` | `QK_` |
