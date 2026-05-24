---
title: $function/ — Helper Functions
description: Folder $function/ berisi helper functions untuk satu feature — SFN_ untuk server-side dan CFN_ untuk client-side.
---

## Tujuan

Folder `$function/` menampung helper functions yang mendukung logika sebuah feature — namun bukan komponen dan bukan Server Action. Pemisahan server vs client dilakukan lewat nama file dan prefix, sehingga kita tidak bisa tidak sengaja mengimport fungsi server di client atau sebaliknya.

## Dua Tipe Function

| Tipe | File pattern | Prefix | Berjalan di |
|------|-------------|--------|-------------|
| Server Function | `sfn.[module].ts` | `SFN_` | Server only — boleh akses `process.env`, cookies, DB |
| Client Function | `cfn.[module].ts` | `CFN_` | Client only — boleh akses `window`, `localStorage` |

## Struktur File

```
// tree
app/[feature]/
└── $function/
    ├── sfn.session.ts     → export SFN_SaveSession, SFN_ClearSession
    ├── sfn.format.ts      → export SFN_FormatUserData
    ├── cfn.validate.ts    → export CFN_ValidateEmail
    └── cfn.format.ts      → export CFN_FormatCurrency
```

## Aturan

| Aturan | Detail |
|--------|--------|
| Nama file | `sfn.[module].ts` atau `cfn.[module].ts` |
| Prefix export | `SFN_` untuk server, `CFN_` untuk client |
| `SFN_` tidak di client | Jangan import `sfn.*` dari file dengan `"use client"` |
| `CFN_` tidak di server | Jangan import `cfn.*` dari Server Components atau Server Actions |
| Murni fungsi | Tidak ada JSX, tidak ada komponen, tidak ada Zustand store |
| Scope feature | Fungsi yang dipakai lintas feature taruh di `lib/utils.ts` |

## Contoh — SFN_ (Server Function)

```ts
// app/login/$function/sfn.session.ts
import { cache } from "@/lib/cache"
import { cookies } from "next/headers"

export async function SFN_SaveSession(token: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 hari
    })

    // Simpan juga di cache server-side
    await cache.set(`session:${token}`, token, 3600)
}

export async function SFN_ClearSession(): Promise<void> {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
    if (token) await cache.del(`session:${token}`)
    cookieStore.delete("session")
}
```

## Contoh — CFN_ (Client Function)

```ts
// app/login/$function/cfn.validate.ts

export function CFN_ValidateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function CFN_FormatErrorMessage(errors: Record<string, string[]>): string {
    return Object.values(errors).flat().join(", ")
}
```

## Kapan Tidak Pakai Ini

- Fungsi yang dipakai di lebih dari satu feature — taruh di `lib/utils.ts`.
- Operasi yang membutuhkan `"use server"` directive — itu Server Action, bukan helper function, taruh di `$action/`.
- Adapter untuk library eksternal (Redis, S3, email) — taruh di `lib/[domain]/`.
- Zod schema — taruh di `[feature].schema.ts` di level root feature, bukan di `$function/`.
