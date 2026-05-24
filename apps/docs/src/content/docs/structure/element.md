---
title: $element/ — Server & Client Components
description: Folder $element/ berisi semua React components untuk satu feature — SE_ untuk Server Components dan CE_ untuk Client Components.
---

## Tujuan

Folder `$element/` adalah tempat semua React components untuk satu feature. Pemisahan dilakukan lewat nama file dan prefix export — bukan lewat folder terpisah. Dengan melihat nama file, kita langsung tahu apakah sebuah komponen berjalan di server atau client.

## Dua Tipe Komponen

| Tipe | File pattern | Prefix | Directive | Bisa async? |
|------|-------------|--------|-----------|-------------|
| Server Element | `server.[module].tsx` | `SE_` | Tidak ada | Ya — boleh `await` |
| Client Element | `client.[module].tsx` | `CE_` | `"use client"` wajib | Tidak |

## Struktur File

```
// tree
app/[feature]/
└── $element/
    ├── server.layout.tsx      → export SE_LoginLayout
    ├── server.card.tsx        → export SE_UserCard
    ├── client.form.tsx        → export CE_LoginForm
    └── client.table.tsx       → export CE_UserTable
```

## Aturan

| Aturan | Detail |
|--------|--------|
| Nama file | `server.[module].tsx` atau `client.[module].tsx` |
| Prefix export | `SE_` untuk server, `CE_` untuk client |
| `"use client"` | Wajib ada di baris pertama setiap file `client.*.tsx` |
| SE_ bisa fetch | SE_ boleh memanggil `APIS_` langsung — ini async Server Components |
| CE_ terima props | CE_ menerima data dari SE_ via props, atau fetch sendiri via TanStack Query |
| Tidak ada subfolder | Semua file langsung di `$element/`, tidak bersarang lebih dalam |
| Komponen shadcn | Jangan modifikasi langsung — buat wrapper `CE_` di sini |

## Contoh — SE_ dan CE_ dalam Satu Feature

```tsx
// app/login/$element/server.layout.tsx
import { getTranslations } from "next-intl/server"
import { CE_LoginForm } from "./client.form"

export async function SE_LoginLayout() {
    const t = await getTranslations("Login")

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-bold">{t("title")}</h1>
                <CE_LoginForm />
            </div>
        </main>
    )
}
```

```tsx
// app/login/$element/client.form.tsx
"use client"

import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { ACT_SubmitLogin } from "../$action/action.submit"
import { ZS_LoginForm } from "../login.schema"

export function CE_LoginForm() {
    const t = useTranslations("Login")

    const form = useForm({
        defaultValues: { email: "", password: "" },
        validators: { onSubmit: ZS_LoginForm },
        validatorAdapter: zodValidator(),
        onSubmit: async ({ value }) => {
            await ACT_SubmitLogin(value)
        },
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
            <form.Field name="email">
                {(field) => (
                    <input
                        type="email"
                        placeholder={t("email")}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                    />
                )}
            </form.Field>
            <button type="submit">{t("submit")}</button>
        </form>
    )
}
```

## Contoh — SE_ Fetch Data dan Pass ke CE_

```tsx
// app/user-list/$element/server.layout.tsx
import { APIS_GetUsers } from "@/api/user/list"
import { CE_UserTable } from "./client.table"

export async function SE_UserListLayout({
    searchParams,
}: {
    searchParams: { q?: string; page?: string }
}) {
    const data = await APIS_GetUsers({
        search: searchParams.q ?? "",
        page: Number(searchParams.page ?? 1),
    })

    return <CE_UserTable data={data.items} total={data.total} />
}
```

```tsx
// app/user-list/$element/client.table.tsx
"use client"

import type { I_User } from "@/api/user/list.type"

export function CE_UserTable({
    data,
    total,
}: {
    data: I_User[]
    total: number
}) {
    return (
        <div>
            <p>{total} pengguna ditemukan</p>
            <table>
                {data.map((user) => (
                    <tr key={user.id}>
                        <td>{user.name}</td>
                    </tr>
                ))}
            </table>
        </div>
    )
}
```

## Kapan Tidak Pakai Ini

- Komponen yang dipakai di lebih dari satu feature — taruh di `lib/` sebagai shared component.
- Layout global atau komponen navigasi aplikasi — taruh di `app/layout.tsx` atau `lib/`.
- UI primitif dari shadcn/ui — sudah ada di `components/ui/`, cukup buat wrapper `CE_` jika perlu kustomisasi.
