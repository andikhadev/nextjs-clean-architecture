---
title: Folder Naming
description: Aturan penamaan folder dalam proyek Next.js Clean Architecture — kebab-case untuk semua folder fitur, prefix $ untuk subfolder khusus.
---

## Tujuan

Konsistensi penamaan folder membuat navigasi kode lebih mudah dan membantu membedakan folder fitur (yang menjadi URL route) dari folder internal yang tidak tampil di URL. Aturan ini juga membuat tooling seperti linter dan AI assistant lebih mudah memahami struktur proyek.

## Aturan

### Folder fitur — kebab-case

Semua folder di dalam `app/` menggunakan **kebab-case**. Tidak ada huruf kapital, tidak ada camelCase, tidak ada PascalCase.

| Contoh benar | Contoh salah |
|---|---|
| `user-management` | `userManagement` |
| `product-list` | `ProductList` |
| `order-detail` | `order_detail` |
| `apply-credit-card` | `ApplyCreditCard` |

### Subfolder khusus — prefix `$`

Di dalam setiap folder fitur, subfolder internal (tidak menjadi route URL) menggunakan prefix `$`. Ini memudahkan membedakan mana folder yang menjadi halaman dan mana yang berisi kode pendukung.

| Folder | Isi | Prefix simbol |
|--------|-----|---------------|
| `$action/` | Next.js Server Actions | `ACT_` |
| `$element/` | React components — server & client | `SE_`, `CE_` |
| `$function/` | Helper functions — server & client | `SFN_`, `CFN_` |
| `$store/` | Zustand stores scoped ke fitur ini | `useXxxStore` |

### Folder di luar `app/`

Folder root seperti `api/`, `lib/`, `reg/`, `store/` juga menggunakan kebab-case untuk subfoldernya:

| Folder | Keterangan |
|--------|------------|
| `api/[feature]/` | API call wrappers per feature |
| `lib/[domain]/` | Abstraksi library eksternal, misal `lib/cache/` |
| `reg/` | Registry: routes, query keys, konstanta domain |
| `store/` | Global Zustand stores (lintas fitur) |

### Dynamic routes Next.js

Kurung siku `[]` **hanya** digunakan untuk dynamic route Next.js — bukan untuk penamaan folder biasa.

```
app/
└── user/
    └── [id]/          ← dynamic route Next.js
        └── $element/  ← subfolder internal
```

## Contoh

Struktur lengkap fitur `login` dan `user-management`:

```
src/app/
├── login/
│   ├── $action/
│   │   └── action.submit.ts
│   ├── $element/
│   │   ├── server.layout.tsx
│   │   └── client.form.tsx
│   ├── $function/
│   │   └── sfn.session.ts
│   └── page.tsx
└── user-management/
    ├── $action/
    │   └── action.delete.ts
    ├── $element/
    │   ├── server.userlist.tsx
    │   └── client.usertable.tsx
    ├── $function/
    │   └── cfn.validate.ts
    ├── $store/
    │   └── ui.store.ts
    └── page.tsx
```

Folder di luar `app/`:

```
src/
├── api/
│   ├── auth/
│   │   ├── login.ts
│   │   └── login.type.ts
│   └── user/
│       ├── list.ts
│       └── list.type.ts
├── lib/
│   ├── cache/
│   │   ├── index.ts
│   │   └── ioredis.ts
│   └── utils.ts
└── reg/
    ├── routes.register.ts
    └── query-keys.register.ts
```

## Kapan Tidak Pakai Ini

- **Next.js special folders** seperti `(group)`, `[slug]`, `@slot`, `_private` — ikuti konvensi Next.js App Router untuk kebutuhan routing khusus.
- **`messages/`** — folder i18n di root project, bukan di dalam `src/`, tidak mengikuti aturan `$` prefix.
- **`components/ui/`** — folder shadcn/ui yang di-generate otomatis, tidak dimodifikasi manual.
