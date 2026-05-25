---
title: API Layer (src/api/)
description: Folder src/api/ berisi fetch wrappers ke backend — fungsi APIS_/APIC_ dan type IRq_/IRs_ yang dikelompokkan per feature.
---

## Tujuan

Folder `api/` adalah satu-satunya tempat yang boleh melakukan `fetch()` ke backend. Semua komunikasi ke API eksternal melewati layer ini — Server Actions dan Server Components tidak boleh `fetch()` langsung. Hasilnya: kalau base URL atau header berubah, hanya satu tempat yang perlu diupdate.

## Dua Jenis API Function

Convention membedakan dua prefix berdasarkan **dari mana fungsi boleh dipanggil**:

| Prefix | Dipanggil dari | Jenis endpoint |
|--------|---------------|----------------|
| `APIS_` | SE_, ACT_, SFN_ (server-side only) | Internal API — tidak bisa diakses dari internet |
| `APIC_` | CE_ via TanStack Query (client-side) | Route Handler atau External API publik |

Ini penting karena `APIS_` boleh menggunakan env secret dan base URL internal, sedangkan `APIC_` dipanggil dari browser sehingga endpoint harus bisa diakses publik.

## Struktur

```
// tree
src/api/
├── auth/
│   ├── login.ts           → export APIS_Login           (server-only)
│   └── login.type.ts      → export IRq_Login, IRs_Login
├── user/
│   ├── list.ts            → export APIC_GetUsers        (client-accessible)
│   ├── list.type.ts       → export IRq_GetUsers, IRs_GetUsers
│   ├── detail.ts          → export APIC_GetUser         (client-accessible)
│   └── detail.type.ts     → export IRq_GetUser, IRs_GetUser
└── common.ts              → shared headers, base fetcher, error handler
```

## Aturan

| Aturan | Detail |
|--------|--------|
| Nama file fungsi | `[resource].ts` — satu file per endpoint/resource |
| Nama file types | `[resource].type.ts` — pasangan wajib untuk setiap `[resource].ts` |
| Prefix fungsi server-only | `APIS_` — hanya boleh dipanggil dari SE_, ACT_, SFN_ |
| Prefix fungsi client-accessible | `APIC_` — boleh dipanggil dari CE_ via TanStack Query |
| Request interface | `IRq_[Name]` — payload yang dikirim ke API |
| Response interface | `IRs_[Name]` — response yang diterima dari API |
| Murni fetch | Tidak ada business logic, tidak ada redirect, tidak ada Zod validation |

## Contoh

```ts
// src/api/auth/login.type.ts
export interface IRq_Login {
    email: string
    password: string
}

export interface IRs_Login {
    token: string
    user: {
        id: string
        name: string
        email: string
    }
}
```

```ts
// src/api/auth/login.ts
import { baseFetch } from "../common"
import type { IRq_Login, IRs_Login } from "./login.type"

export async function APIS_Login(
    payload: IRq_Login
): Promise<{ ok: boolean; data?: IRs_Login; message: string }> {
    return baseFetch<IRs_Login>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    })
}
```

```ts
// src/api/common.ts
const BASE_URL = process.env.API_BASE_URL ?? ""

export async function baseFetch<T>(
    path: string,
    init?: RequestInit
): Promise<{ ok: boolean; data?: T; message: string }> {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: {
                "Content-Type": "application/json",
                ...init?.headers,
            },
            ...init,
        })

        const json = await res.json()

        if (!res.ok) {
            return { ok: false, message: json.message ?? "Terjadi kesalahan" }
        }

        return { ok: true, data: json.data, message: "Berhasil" }
    } catch {
        return { ok: false, message: "Tidak dapat terhubung ke server" }
    }
}
```

Dipanggil dari Server Action:

```ts
// app/login/$action/action.submit.ts
"use server"

import { APIS_Login } from "@/api/auth/login"
import type { IRq_Login } from "@/api/auth/login.type"
import { ZS_LoginForm } from "../login.schema"

export async function ACT_SubmitLogin(data: IRq_Login) {
    const parsed = ZS_LoginForm.safeParse(data)
    if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

    const result = await APIS_Login(parsed.data)
    if (!result.ok) return { error: { _root: [result.message] } }

    // ...
}
```

## Kapan Tidak Pakai Ini

- API routes untuk backend di proyek yang sama — gunakan `app/api/` bawaan Next.js.
- Fetch langsung dari Client Component — gunakan TanStack Query + `APIC_` function ([Pattern B](/patterns/client-fetch)).
- Transformasi atau business logic — `APIS_`/`APIC_` hanya mengembalikan data mentah dari API, transformasi dilakukan di `SFN_` atau langsung di SE_.
