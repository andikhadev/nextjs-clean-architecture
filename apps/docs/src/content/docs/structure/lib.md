---
title: Lib (src/lib/)
description: Folder src/lib/ berisi shared utilities dan adapter untuk library eksternal — pola abstraksi yang membuat library bisa diganti tanpa mengubah kode feature.
---

## Tujuan

Folder `lib/` menampung dua jenis kode: utilities shared (fungsi yang dipakai banyak feature) dan adapters untuk library eksternal (Redis, S3, email, dll.). Aturan utamanya: consumer hanya boleh import dari `lib/[domain]/`, bukan langsung dari library — sehingga mengganti library cukup mengubah satu file adapter.

## Struktur

```
// tree
src/lib/
├── query-client.ts        TanStack Query client instance
├── session.ts             session management (get/set/clear cookie)
├── utils.ts               helper umum — cn(), formatDate(), dll.
├── button.tsx             shared UI wrapper atas shadcn Button
└── [domain]/              abstraksi untuk integrasi library eksternal
    ├── index.ts           interface + re-export implementasi aktif
    └── [library].ts       implementasi konkret (ioredis, upstash, dll.)
```

Contoh dengan beberapa domain:

```
// tree
src/lib/
├── utils.ts
├── session.ts
├── query-client.ts
├── cache/
│   ├── index.ts        → export interface I_CacheAdapter + export { cache }
│   └── ioredis.ts      → implementasi dengan ioredis
├── storage/
│   ├── index.ts        → export interface I_StorageAdapter + export { storage }
│   └── s3.ts           → implementasi dengan AWS S3
└── mailer/
    ├── index.ts        → export interface I_MailerAdapter + export { mailer }
    └── resend.ts       → implementasi dengan Resend
```

## Aturan

| Aturan | Detail |
|--------|--------|
| Import dari `lib/[domain]/` | Consumer tidak boleh import langsung dari `ioredis`, `nodemailer`, dll. |
| `index.ts` re-export implementasi aktif | Consumer cukup import dari `lib/cache` — tidak perlu tahu library-nya |
| Interface wajib di `index.ts` | Definisikan `I_XxxAdapter` interface agar implementasi bisa ditukar |
| Utilities flat | `utils.ts`, `session.ts`, `query-client.ts` — tidak perlu subfolder |
| Shared UI di `lib/` | Komponen UI yang dipakai lintas feature boleh ada di `lib/` |

## Contoh — Cache Adapter

```ts
// src/lib/cache/index.ts
export interface I_CacheAdapter {
    get(key: string): Promise<string | null>
    set(key: string, value: string, ttlSeconds?: number): Promise<void>
    del(key: string): Promise<void>
}

// Re-export implementasi aktif — ganti di sini kalau pindah library
export { cache } from "./ioredis"
```

```ts
// src/lib/cache/ioredis.ts
import { Redis } from "ioredis"
import type { I_CacheAdapter } from "."

const client = new Redis(process.env.REDIS_URL!)

export const cache: I_CacheAdapter = {
    get: (key) => client.get(key),
    set: (key, value, ttl) =>
        ttl
            ? client.set(key, value, "EX", ttl).then(() => {})
            : client.set(key, value).then(() => {}),
    del: (key) => client.del(key).then(() => {}),
}
```

Consumer menggunakan tanpa tahu library di baliknya:

```ts
// app/login/$function/sfn.session.ts
import { cache } from "@/lib/cache"

export async function SFN_SaveSession(token: string) {
    await cache.set(`session:${token}`, token, 3600)
}
```

Pindah dari ioredis ke Upstash: buat `lib/cache/upstash.ts`, ubah re-export di `index.ts`. Kode feature tidak berubah.

## Contoh — Shared Utilities

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date, locale = "id-ID"): string {
    return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date)
}
```

## Kapan Tidak Pakai Ini

- Helper yang hanya dipakai satu feature — taruh di `$function/` feature tersebut.
- Konfigurasi next-intl — ada di `src/i18n/`, bukan `lib/`.
- Global Zustand store — ada di `src/store/`, bukan `lib/`.
- Komponen feature-specific — taruh di `$element/` feature, bukan `lib/`.
