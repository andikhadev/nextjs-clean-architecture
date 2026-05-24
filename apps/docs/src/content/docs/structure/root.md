---
title: Root Folder
description: Struktur folder tingkat atas proyek Next.js 15+ dengan App Router dan clean architecture.
---

## Tujuan

Root folder mendefinisikan "rumah" dari setiap jenis kode. Setiap folder di level ini punya tanggung jawab tunggal — sehingga developer baru bisa langsung tahu di mana harus mencari atau menambah kode tanpa harus membaca dokumentasi panjang.

## Struktur

```
// tree
messages/         Terjemahan next-intl per locale — en.json, id.json
src/
├── app/          Next.js App Router — pages dan feature folders
├── api/          API call wrappers (fetch ke backend), dikelompokkan per feature
├── i18n/         Konfigurasi next-intl (routing, request config)
├── lib/          Shared utilities, third-party adapters, client instances
├── reg/          Global registry: constants, route keys, query keys
└── store/        Global Zustand stores (hanya yang benar-benar lintas feature)
```

## Aturan

| Folder | Isi | Larangan |
|--------|-----|----------|
| `app/` | Feature folders, `layout.tsx`, `error.tsx`, `not-found.tsx` | Jangan taruh fetch atau business logic di `page.tsx` |
| `api/` | Fetch wrappers ke backend — `APIS_` prefix | Jangan taruh UI atau business logic di sini |
| `i18n/` | `routing.ts` dan `request.ts` untuk konfigurasi next-intl | Jangan taruh string terjemahan di sini — pakai `messages/` |
| `lib/` | Utilities shared dan adapter library eksternal | Jangan import langsung dari library eksternal di luar `lib/` |
| `reg/` | Konstanta global — `ROUTE_`, `QK_` | Jangan taruh konstanta yang hanya dipakai satu feature |
| `store/` | Zustand store lintas feature | Jangan taruh state yang hanya dipakai satu feature di sini |
| `messages/` | File JSON per locale — `en.json`, `id.json` | Jangan buat `$lang/` folder di dalam feature |

## Contoh

```
// tree — contoh proyek login + dashboard
messages/
├── en.json
└── id.json
src/
├── app/
│   ├── login/
│   │   ├── $action/
│   │   ├── $element/
│   │   ├── $function/
│   │   ├── $store/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── api/
│   ├── auth/
│   │   ├── login.ts
│   │   └── login.type.ts
│   └── common.ts
├── i18n/
│   ├── routing.ts
│   └── request.ts
├── lib/
│   ├── utils.ts
│   ├── session.ts
│   └── cache/
│       ├── index.ts
│       └── ioredis.ts
├── reg/
│   ├── routes.register.ts
│   └── query-keys.register.ts
└── store/
    └── notification.store.ts
```

## Kapan Tidak Pakai Ini

- Proyek dengan 1-2 halaman sederhana tanpa logika bisnis — overhead struktur ini tidak sepadan.
- Halaman statis atau marketing page yang tidak ada API call — tidak perlu folder `api/`, `reg/`, atau `store/`.
