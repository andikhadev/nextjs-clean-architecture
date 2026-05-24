---
title: Registry (src/reg/)
description: Folder src/reg/ adalah single source of truth untuk konstanta global — route paths (ROUTE_) dan TanStack Query keys (QK_).
---

## Tujuan

Folder `reg/` menampung konstanta yang dipakai di lebih dari satu feature. Dengan memusatkan konstanta di sini, tidak ada lagi string literal `/login` atau `["user", "list"]` yang tersebar di berbagai file. Kalau route berubah, cukup update satu tempat.

## Struktur

```
// tree
src/reg/
├── routes.register.ts       semua path konstanta — prefix ROUTE_
├── query-keys.register.ts   TanStack Query keys — prefix QK_
└── [domain].register.ts     konstanta domain lain sesuai kebutuhan
```

## Aturan

| Aturan | Detail |
|--------|--------|
| Nama file | `[domain].register.ts` |
| Prefix route | `ROUTE_` — nilai adalah string path |
| Prefix query key | `QK_` — nilai adalah array atau factory function yang mengembalikan array |
| Hanya konstanta | Tidak ada fungsi bisnis, tidak ada fetch, tidak ada komponen |
| Scope global | Hanya konstanta yang dipakai lebih dari satu feature — konstanta lokal tetap di feature |

## Contoh — Routes

```ts
// src/reg/routes.register.ts

export const ROUTE_LOGIN = "/login"
export const ROUTE_REGISTER = "/register"
export const ROUTE_DASHBOARD = "/dashboard"
export const ROUTE_USER_LIST = "/dashboard/users"
export const ROUTE_USER_DETAIL = (id: string) => `/dashboard/users/${id}`
export const ROUTE_PRODUCT_LIST = "/dashboard/products"
```

Digunakan di Server Action setelah sukses:

```ts
// app/login/$action/action.submit.ts
"use server"

import { redirect } from "next/navigation"
import { ROUTE_DASHBOARD } from "@/reg/routes.register"

export async function ACT_SubmitLogin(data: IRq_Login) {
    // ...
    redirect(ROUTE_DASHBOARD)
}
```

## Contoh — Query Keys

```ts
// src/reg/query-keys.register.ts

export const QK_UserList = (search: string, page: number) =>
    ["user", "list", search, page] as const

export const QK_UserDetail = (id: string) =>
    ["user", "detail", id] as const

export const QK_ProductList = (category: string) =>
    ["product", "list", category] as const
```

Digunakan dengan TanStack Query:

```tsx
// app/user-list/$element/client.table.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { QK_UserList } from "@/reg/query-keys.register"
import { APIS_GetUsers } from "@/api/user/list"

export function CE_UserTable() {
    const { data } = useQuery({
        queryKey: QK_UserList("", 1),
        queryFn: () => APIS_GetUsers({ search: "", page: 1 }),
    })

    return <table>{/* ... */}</table>
}
```

## Kapan Tidak Pakai Ini

- Konstanta yang hanya dipakai dalam satu feature — definisikan langsung di file yang membutuhkan, tidak perlu masuk `reg/`.
- Konstanta yang spesifik untuk library (misal: nama event) — taruh di `lib/` atau dekat dengan penggunaannya.
- Environment variables — akses via `process.env` langsung, tidak perlu di-wrap di registry.
