---
title: Zod
description: Panduan setup dan penggunaan Zod dalam konvensi Next.js Clean Architecture — schema ZS_, safeParse, dan type inference T_.
---

## Tujuan dalam Konvensi Ini

Zod dipilih sebagai library validasi schema karena integrasinya yang mulus dengan TypeScript — schema Zod sekaligus menjadi sumber kebenaran tipe data. Dalam konvensi ini, Zod berperan di dua tempat: sebagai **validator form** (dipakai oleh TanStack Form melalui `zodValidator()`) dan sebagai **validator Server Action** (validasi data sebelum memanggil `APIS_`). Schema selalu didefinisikan dengan prefix `ZS_` dan di-co-locate bersama feature yang memakainya.

---

## Setup

```bash
npm install zod
```

---

## Pola Penggunaan

### Mendefinisikan Schema dengan Prefix `ZS_`

Schema Zod selalu diekspor dengan prefix `ZS_` dan disimpan di file `[module].schema.ts` di dalam folder feature:

```ts
// app/login/login.schema.ts
import { z } from "zod"

export const ZS_LoginForm = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
})

export const ZS_RegisterForm = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["admin", "user", "guest"]),
})
```

### Type Inference dengan Prefix `T_`

Selalu gunakan `z.infer` untuk menurunkan type dari schema — jangan mendefinisikan interface secara manual yang bisa sinkron dengan schema:

```ts
// app/login/login.schema.ts
import { z } from "zod"

export const ZS_LoginForm = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
})

// Type otomatis sinkron dengan schema
export type T_LoginForm = z.infer<typeof ZS_LoginForm>
// Hasil: { email: string; password: string }
```

### `safeParse` di Server Action

Selalu gunakan `safeParse` (bukan `parse`) di Server Action — `safeParse` tidak melempar exception sehingga error bisa dikembalikan sebagai response:

```ts
// app/login/$action/action.submit.ts
"use server"
import { redirect } from "next/navigation"
import { ZS_LoginForm } from "../login.schema"
import { APIS_Login } from "@/api/auth/login"
import { SFN_SaveSession } from "../$function/sfn.session"

export async function ACT_SubmitLogin(data: unknown) {
  // Validasi pertama sebelum menyentuh APIS_
  const parsed = ZS_LoginForm.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Data sudah tervalidasi dan type-safe
  const result = await APIS_Login(parsed.data)
  if (!result.ok || !result.data) {
    return { error: { _root: [result.message] } }
  }

  await SFN_SaveSession(result.data.token)
  redirect("/dashboard")
}
```

### Schema Komposisi

Gunakan `.extend()`, `.pick()`, dan `.omit()` untuk membuat varian schema tanpa duplikasi:

```ts
// app/user-profile/user-profile.schema.ts
import { z } from "zod"

// Schema dasar
export const ZS_UserBase = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
  createdAt: z.string().datetime(),
})

// Schema untuk form create — tanpa createdAt
export const ZS_UserCreate = ZS_UserBase.omit({ createdAt: true })

// Schema untuk form update — semua field opsional kecuali id
export const ZS_UserUpdate = ZS_UserBase
  .omit({ createdAt: true })
  .partial()
  .extend({ id: z.string().uuid() })

export type T_UserCreate = z.infer<typeof ZS_UserCreate>
export type T_UserUpdate = z.infer<typeof ZS_UserUpdate>
```

---

## Aturan Konvensi

- Semua schema Zod diberi prefix `ZS_` — contoh: `ZS_LoginForm`, `ZS_UserCreate`
- Schema disimpan di file `[module].schema.ts` yang co-located dengan feature-nya
- Selalu gunakan `safeParse` di Server Action — `parse` hanya untuk kasus yang benar-benar tidak bisa gagal
- Selalu ekspor type hasil inferensi dengan prefix `T_` — contoh: `export type T_LoginForm = z.infer<typeof ZS_LoginForm>`
- Jangan mendefinisikan interface TypeScript manual yang menduplikasi schema Zod
- Zod schema yang sama dipakai oleh form (TanStack Form) **dan** Server Action — satu sumber kebenaran
- Gunakan `.flatten().fieldErrors` untuk format error yang kompatibel dengan form library

---

## Referensi

- [Zod Docs](https://zod.dev/)
- [Pattern C — Form Submit dengan Zod Validation](/patterns/form-submit)
- [TanStack Form — integrasi zodValidator()](/stack/tanstack-form)
