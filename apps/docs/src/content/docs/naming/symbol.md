---
title: Symbol & Prefix Naming
description: Referensi lengkap semua prefix simbol dalam Next.js Clean Architecture — ACT_, SE_, CE_, SFN_, CFN_, APIS_, APIC_, ZS_, I_, IRq_, IRs_, T_, E_, QK_, ROUTE_, dan pola useXxxStore.
---

## Tujuan

Setiap simbol yang diekspor dari file memiliki prefix yang menunjukkan tipenya secara eksplisit. Ini memungkinkan developer (dan AI assistant) langsung memahami tujuan simbol hanya dari namanya — tanpa membuka file sumbernya. Prefix juga mencegah naming collision antara tipe simbol yang berbeda dalam satu project besar.

## Tabel Referensi

| Prefix | Tipe | File Pattern | Contoh |
|--------|------|-------------|--------|
| `ACT_` | Server Action | `action.[sub].ts` | `ACT_SubmitLogin` |
| `SE_` | Server Element (React Server Component) | `server.[module].tsx` | `SE_LoginLayout` |
| `CE_` | Client Element (React Client Component) | `client.[module].tsx` | `CE_LoginForm` |
| `SFN_` | Server Function | `sfn.[module].ts` | `SFN_SaveSession` |
| `CFN_` | Client Function | `cfn.[module].ts` | `CFN_ValidateEmail` |
| `useXxxStore` | Zustand Hook | `[module].store.ts` | `useLoginUiStore` |
| `APIS_` | API Function — server-only (internal API) | `[resource].ts` | `APIS_Login` |
| `APIC_` | API Function — client-accessible (Route Handler / External API) | `[resource].ts` | `APIC_GetUsers` |
| `ZS_` | Zod Schema | `[module].schema.ts` | `ZS_LoginForm` |
| `I_` | Interface umum TypeScript | file `.ts` manapun | `I_UserProfile` |
| `IRq_` | Interface Request (payload ke API) | `[resource].type.ts` | `IRq_Login` |
| `IRs_` | Interface Response (response dari API) | `[resource].type.ts` | `IRs_Login` |
| `T_` | Type Alias TypeScript | file `.ts` manapun | `T_UserRole` |
| `E_` | Enum TypeScript | file `.ts` manapun | `E_UserStatus` |
| `QK_` | Query Key TanStack Query | `[domain].register.ts` | `QK_UserList` |
| `ROUTE_` | Konstanta path URL | `routes.register.ts` | `ROUTE_LOGIN` |

## Penjelasan per Prefix

### `ACT_` — Server Action

Fungsi yang dijalankan di server, dipanggil langsung dari Client Component. Wajib ada `"use server"` di atas file atau di atas fungsi.

```ts
// app/login/$action/action.submit.ts
"use server"
export async function ACT_SubmitLogin(data: IRq_Login) {
    const parsed = ZS_LoginForm.safeParse(data)
    if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }
    const result = await APIS_Login(parsed.data)
    if (!result.ok) return { error: { _root: [result.message] } }
    await SFN_SaveSession(result.data.token)
    redirect("/dashboard")
}
```

### `SE_` — Server Element

React Server Component. Dapat mengakses database, session, filesystem secara langsung. Tidak bisa menggunakan hooks.

```tsx
// app/login/$element/server.layout.tsx
import { getTranslations } from "next-intl/server"

export async function SE_LoginLayout() {
    const t = await getTranslations("Login")
    const data = await APIS_GetConfig()
    return (
        <main>
            <h1>{t("title")}</h1>
            <CE_LoginForm config={data} />
        </main>
    )
}
```

### `CE_` — Client Element

React Client Component. Bisa menggunakan hooks, event handler, browser API. Wajib ada `"use client"` di atas file.

```tsx
// app/login/$element/client.form.tsx
"use client"
export function CE_LoginForm() {
    const form = useForm({ ... })
    return <form onSubmit={...}>...</form>
}
```

### `SFN_` — Server Function

Helper function yang hanya berjalan di server — bukan komponen, bukan Server Action. Dipakai oleh `ACT_` atau `SE_`.

```ts
// app/login/$function/sfn.session.ts
import { cache } from "@/lib/cache"

export async function SFN_SaveSession(token: string) {
    await cache.set(`session:${token}`, token, 3600)
}

export async function SFN_GetSession(): Promise<string | null> {
    const cookie = cookies().get("session")
    return cookie?.value ?? null
}
```

### `CFN_` — Client Function

Helper function yang hanya berjalan di client — bukan komponen. Dipakai oleh `CE_`.

```ts
// app/login/$function/cfn.validate.ts
export function CFN_ValidateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function CFN_FormatPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, "").replace(/^62/, "0")
}
```

### `useXxxStore` — Zustand Hook

Pola nama: `use` + nama fitur + nama sub-state + `Store`. Mengikuti konvensi React hook.

```
useLoginUiStore      → fitur: login, sub: ui
useUserFilterStore   → fitur: user, sub: filter
useCartStore         → fitur: cart (tidak ada sub, karena sederhana)
```

```ts
// app/login/$store/ui.store.ts
import { create } from "zustand"

interface I_LoginUiStore {
    isModalOpen: boolean
    openModal: () => void
    closeModal: () => void
}

export const useLoginUiStore = create<I_LoginUiStore>((set) => ({
    isModalOpen: false,
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
}))
```

### `APIS_` — API Function (server-only)

Fungsi fetch ke backend API yang **hanya boleh dipanggil dari server-side code** — `SE_`, `ACT_`, atau `SFN_`. Digunakan untuk Internal API yang tidak bisa diakses langsung dari browser. Disimpan di `api/[feature]/`.

```ts
// api/auth/login.ts
export async function APIS_Login(payload: IRq_Login): Promise<IRs_Login> {
    const res = await fetch(process.env.INTERNAL_API_URL + "/auth/login", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.API_SECRET}` },
        body: JSON.stringify(payload),
    })
    return res.json()
}
```

Dipanggil dari: `ACT_SubmitLogin`, `SE_UserList`, `SFN_GetSession` — **tidak boleh** dari `CE_` atau `useQuery`.

### `APIC_` — API Function (client-accessible)

Fungsi fetch ke API yang **bisa dipanggil dari Client Component** — biasanya via TanStack Query. Digunakan untuk Route Handler Next.js atau External API publik yang bisa diakses dari browser. Disimpan di `api/[feature]/`.

```ts
// api/user/list.ts
export async function APIC_GetUsers(params: IRq_GetUsers): Promise<IRs_GetUsers> {
    const qs = new URLSearchParams({
        search: params.search ?? "",
        page: String(params.page ?? 1),
    })
    const res = await fetch(`/api/users?${qs}`)
    if (!res.ok) throw new Error("Failed to fetch users")
    return res.json()
}
```

Dipanggil dari: `CE_` via `useQuery` — **tidak wajib** memiliki server-side secret.

| | `APIS_` | `APIC_` |
|---|---|---|
| Dipanggil dari | SE_, ACT_, SFN_ | CE_ via TanStack Query |
| Endpoint | Internal API (tidak bisa diakses internet) | Route Handler / External API publik |
| Boleh pakai env secret | Ya | Tidak (berjalan di browser) |

### `ZS_` — Zod Schema

Schema Zod untuk validasi. Dipakai bersama oleh Server Action (validasi server-side) dan Client Element (validasi form client-side).

```ts
// app/login/login.schema.ts
import { z } from "zod"

export const ZS_LoginForm = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
})

export type T_LoginForm = z.infer<typeof ZS_LoginForm>
```

### `I_`, `IRq_`, `IRs_` — Interface

Tiga varian interface TypeScript dengan tujuan berbeda:

- `I_` — interface umum: props komponen, model domain, store state
- `IRq_` — interface request: payload yang dikirim ke API
- `IRs_` — interface response: data yang diterima dari API

```ts
// api/auth/login.type.ts
export interface IRq_Login {
    email: string
    password: string
}

export interface IRs_Login {
    token: string
    user: I_UserProfile
}

// Digunakan di tempat lain:
export interface I_UserProfile {
    id: string
    name: string
    email: string
    role: E_UserRole
}
```

### `T_` — Type Alias

Digunakan untuk union type, mapped type, atau type yang tidak cocok sebagai interface.

```ts
export type T_UserRole = "admin" | "editor" | "viewer"
export type T_ApiStatus = "idle" | "loading" | "success" | "error"
export type T_Nullable<T> = T | null
```

### `E_` — Enum

Enum TypeScript untuk nilai yang terbatas dan memiliki makna semantik.

```ts
export enum E_UserStatus {
    Active = "active",
    Inactive = "inactive",
    Suspended = "suspended",
}

export enum E_OrderStatus {
    Pending = "pending",
    Processing = "processing",
    Shipped = "shipped",
    Delivered = "delivered",
}
```

### `QK_` — Query Key

Konstanta query key untuk TanStack Query. Disimpan di `reg/query-keys.register.ts`. Menggunakan fungsi agar parameter ikut masuk ke cache key.

```ts
// reg/query-keys.register.ts
export const QK_UserList = (search: string) => ["user", "list", search]
export const QK_UserDetail = (id: string) => ["user", "detail", id]
export const QK_ProductList = (category: string, page: number) =>
    ["product", "list", category, page]
```

### `ROUTE_` — Route Constant

Konstanta path URL. Disimpan di `reg/routes.register.ts`. Hindari string path literal tersebar di seluruh codebase.

```ts
// reg/routes.register.ts
export const ROUTE_LOGIN = "/login"
export const ROUTE_DASHBOARD = "/dashboard"
export const ROUTE_USER_MANAGEMENT = "/user-management"
export const ROUTE_USER_DETAIL = (id: string) => `/user/${id}`
```

## Contoh Lengkap — Fitur Login

Contoh ini menunjukkan semua tipe simbol dalam satu fitur nyata:

```
app/login/
├── $action/
│   └── action.submit.ts     → ACT_SubmitLogin
├── $element/
│   ├── server.layout.tsx    → SE_LoginLayout
│   └── client.form.tsx      → CE_LoginForm
├── $function/
│   └── sfn.session.ts       → SFN_SaveSession, SFN_GetSession
├── $store/
│   └── ui.store.ts          → useLoginUiStore
└── login.schema.ts          → ZS_LoginForm

api/auth/
├── login.ts                 → APIS_Login
└── login.type.ts            → IRq_Login, IRs_Login

reg/
├── routes.register.ts       → ROUTE_LOGIN, ROUTE_DASHBOARD
└── query-keys.register.ts   → QK_UserList

(types tersebar di file terkait)
                             → I_UserProfile (api/auth/login.type.ts)
                             → T_LoginForm (app/login/login.schema.ts)
                             → E_UserRole (shared type file)
```

Alur data lengkap fitur login:

```
page.tsx
  └── SE_LoginLayout          (render server, ambil config)
        └── CE_LoginForm      (form client, validasi ZS_LoginForm)
              └── ACT_SubmitLogin  (server action)
                    ├── ZS_LoginForm.safeParse(data)   (validasi ulang)
                    ├── APIS_Login(parsed.data)         (call backend)
                    └── SFN_SaveSession(token)          (simpan session)
```

## Kapan Tidak Pakai Prefix

- **File `page.tsx`, `layout.tsx`, `error.tsx`** — reserved Next.js, tidak menggunakan prefix.
- **Default export yang diwajibkan Next.js** — `export default function Page()` tidak menggunakan prefix.
- **shadcn/ui components** di `components/ui/` — nama mengikuti shadcn, tidak dimodifikasi.
- **`middleware.ts`** — satu file khusus Next.js, tidak menggunakan prefix.
