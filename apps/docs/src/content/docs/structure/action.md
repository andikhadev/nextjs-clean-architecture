---
title: $action/ — Server Actions
description: Folder $action/ berisi Next.js Server Actions dengan prefix ACT_, wajib Zod validation sebelum memanggil APIS_.
---

## Tujuan

Folder `$action/` menampung semua Next.js Server Actions untuk satu feature. Server Actions adalah fungsi server-side yang dipanggil langsung dari Client Components — menangani form submission, delete, update, dan operasi yang memerlukan akses server. Dengan menempatkan semua actions di satu folder, mudah untuk mengetahui apa saja yang bisa "dilakukan" dalam sebuah feature.

## Struktur File

```
// tree
app/[feature]/
└── $action/
    ├── action.submit.ts    → form submission utama
    ├── action.delete.ts    → operasi delete
    └── action.update.ts    → operasi update
```

## Aturan

| Aturan | Detail |
|--------|--------|
| Nama file | `action.[sub].ts` — tidak ada `.tsx`, tidak ada komponen |
| Prefix export | Semua export menggunakan prefix `ACT_` |
| Direktif wajib | `"use server"` di baris pertama setiap file |
| Zod validation | **Wajib** jalankan `ZS_.safeParse()` sebelum memanggil `APIS_` |
| Return type | Kembalikan `{ error }` jika gagal — jangan throw, kecuali `redirect()` |
| Tidak ada UI | Tidak ada JSX, tidak ada komponen di folder ini |

## Contoh

```ts
// app/login/$action/action.submit.ts
"use server"

import { redirect } from "next/navigation"
import { ZS_LoginForm } from "../login.schema"
import { APIS_Login } from "@/api/auth/login"
import { SFN_SaveSession } from "../$function/sfn.session"
import type { IRq_Login } from "@/api/auth/login.type"

export async function ACT_SubmitLogin(data: IRq_Login) {
    // 1. Validasi input dengan Zod — WAJIB sebelum memanggil APIS_
    const parsed = ZS_LoginForm.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors }
    }

    // 2. Panggil API layer
    const result = await APIS_Login(parsed.data)
    if (!result.ok || !result.data) {
        return { error: { _root: [result.message] } }
    }

    // 3. Side effects server-side
    await SFN_SaveSession(result.data.token)

    // 4. Redirect setelah sukses
    redirect("/dashboard")
}
```

Dipanggil dari Client Component:

```tsx
// app/login/$element/client.form.tsx
"use client"

import { useForm } from "@tanstack/react-form"
import { ACT_SubmitLogin } from "../$action/action.submit"

export function CE_LoginForm() {
    const form = useForm({
        defaultValues: { email: "", password: "" },
        onSubmit: async ({ value }) => {
            const result = await ACT_SubmitLogin(value)
            if (result?.error) {
                // handle error
            }
        },
    })

    // ...
}
```

## Kapan Tidak Pakai Ini

- Logic read-only yang tidak mengubah state — gunakan `SFN_` di `$function/` atau fetch langsung di SE_ component.
- Operasi yang dipanggil dari Server Component — Server Components bisa memanggil `APIS_` langsung tanpa perlu Server Action.
- API routes (REST endpoints) — gunakan `app/api/` bawaan Next.js, bukan `$action/`.
