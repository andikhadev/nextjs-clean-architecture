# /review-naming — Audit Naming Convention (v2)

Audit file, folder, atau kode terhadap convention v2 naming rules.

## Input

Terima salah satu dari:
- File path: audit file tersebut
- Folder path: audit struktur folder dan sample files di dalamnya
- Kode yang di-paste: audit langsung

## Yang Dicek

### File Naming

- File menggunakan dot-notation yang benar:
  `server.[module].tsx`, `client.[module].tsx`, `action.[sub].ts`,
  `sfn.[module].ts`, `cfn.[module].ts`, `[module].store.ts`, `[module].schema.ts`
- File API: `[feature].ts` + `[feature].type.ts`
- Endpoint registry: `[feature].endpoint.ts`
- Route Handler: `route.ts` di dalam `$route/` atau `app/api/[feature]/`

### Symbol Naming

| Symbol | Prefix yang benar |
|--------|-------------------|
| Server Action | `ACT_` |
| Server Element | `SE_` |
| Client Element | `CE_` |
| Server Function | `SFN_` |
| Client Function | `CFN_` |
| API server-only | `APIS_` |
| API client | `APIC_` |
| Zustand hook | `useXxxStore` |
| Zod schema | `ZS_` |
| Query key | `QK_` |
| Route constant | `ROUTE_` |
| Endpoint registry | `EP_` |
| Interface | `I_` |
| Request interface | `IRq_` |
| Response interface | `IRs_` |
| Type alias | `T_` |
| Enum | `E_` |

### Directive Checks

- `"use client"` ada di baris pertama file CE_ dan CFN_ yang dijalankan di browser
- `"use server"` ada di baris pertama file ACT_

### Structure Violations

- `page.tsx` berisi logic (harus hanya `return <SE_[Feature]Layout />`)
- CE_ atau CFN_ ada di folder `$action/` atau `$function/` yang salah
- APIS_ dipanggil dari CE_ atau file client-side (harus via APIC_ + TanStack Query)
- Zustand store di `$store/` dipakai oleh 2+ feature (seharusnya pindah ke `store/` root)

### Pattern Violations

- GlobalEmitter digunakan → harus diganti Zustand (transient) atau URL params (persistent)
- Import library langsung di luar `lib/` → harus via adapter
- Fetch langsung di CE_ tanpa TanStack Query → harus pakai `useQuery`
- Zod validation tidak ada di Server Action sebelum memanggil APIS_
- `components/ui/` dimodifikasi langsung → harus buat wrapper

## Output Per Issue

```
[CRITICAL/WARNING] Location: path/to/file.ts (line X)
Issue: [deskripsi masalah + rule yang dilanggar]
Fix: [exact rename atau perubahan yang dibutuhkan]
```

## Summary

```
X issues found — Y critical, Z warnings
```

Critical: violation yang akan menyebabkan bug atau break convention secara fundamental.
Warning: penamaan tidak konsisten atau pattern yang sebaiknya diperbaiki.
