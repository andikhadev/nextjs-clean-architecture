---
title: File Naming
description: Referensi lengkap pola penamaan file di Next.js Clean Architecture — 11 tipe file, folder tempat tinggal, dan simbol export yang dihasilkan.
---

## Tujuan

Setiap tipe file dalam konvensi ini memiliki pola nama yang unik sehingga tujuan file langsung terlihat dari namanya — tanpa perlu membuka isinya. Pola ini juga membantu tooling dan AI memahami peran setiap file secara otomatis.

## Aturan

Tabel berikut adalah referensi lengkap semua tipe file dalam proyek:

| Tipe File | Pola Nama | Contoh | Simbol Export | Lokasi |
|-----------|-----------|--------|---------------|--------|
| Server Action | `action.[sub].ts` | `action.submit.ts` | `ACT_` | `app/[feature]/$action/` |
| Server Element | `server.[module].tsx` | `server.layout.tsx` | `SE_` | `app/[feature]/$element/` |
| Client Element | `client.[module].tsx` | `client.form.tsx` | `CE_` | `app/[feature]/$element/` |
| Server Function | `sfn.[module].ts` | `sfn.session.ts` | `SFN_` | `app/[feature]/$function/` |
| Client Function | `cfn.[module].ts` | `cfn.validate.ts` | `CFN_` | `app/[feature]/$function/` |
| Zustand Store | `[module].store.ts` | `ui.store.ts` | `useXxxStore` | `app/[feature]/$store/` atau `store/` |
| Zod Schema | `[module].schema.ts` | `login.schema.ts` | `ZS_` | `app/[feature]/` |
| API Function (server-only) | `[resource].ts` | `login.ts` | `APIS_` | `api/[feature]/` |
| API Function (client-accessible) | `[resource].ts` | `list.ts` | `APIC_` | `api/[feature]/` |
| API Types | `[resource].type.ts` | `login.type.ts` | `IRq_`, `IRs_` | `api/[feature]/` |
| Endpoint Path Registry | `[feature].endpoint.ts` | `user.endpoint.ts` | `EP_` | `api/[feature]/` |
| MSW Mock Handler | `[resource].mock-handler.ts` | `users-list.mock-handler.ts` | — | `api/[feature]/` |
| Registry | `[domain].register.ts` | `routes.register.ts` | `ROUTE_`, `QK_` | `reg/` |
| Lib Adapter | `[library].ts` + `index.ts` | `ioredis.ts` di `lib/cache/` | — | `lib/[domain]/` |

> **Catatan:** File i18n menggunakan pola `[locale].json` (contoh: `id.json`, `en.json`) dan disimpan di folder `messages/` di root project — bukan di dalam `src/`.

## Contoh

### Server Action — `action.[sub].ts`

Sub-bagian nama mendeskripsikan aksi yang dilakukan: `submit`, `delete`, `update`, dll.

```ts
// app/login/$action/action.submit.ts
"use server"
export async function ACT_SubmitLogin(data: IRq_Login) { ... }
```

### Server & Client Element — `server.[module].tsx` / `client.[module].tsx`

Prefix file (`server` atau `client`) langsung menunjukkan di mana komponen dirender.

```tsx
// app/login/$element/server.layout.tsx
export async function SE_LoginLayout() { ... }

// app/login/$element/client.form.tsx
"use client"
export function CE_LoginForm() { ... }
```

### Server & Client Function — `sfn.[module].ts` / `cfn.[module].ts`

`sfn` = Server Function, `cfn` = Client Function. Keduanya berisi helper murni, bukan komponen.

```ts
// app/login/$function/sfn.session.ts
export async function SFN_SaveSession(token: string) { ... }

// app/login/$function/cfn.validate.ts
export function CFN_ValidateEmail(email: string): boolean { ... }
```

### Zustand Store — `[module].store.ts`

Nama modul mendeskripsikan state yang dikelola: `ui`, `filter`, `cart`, dll.

```ts
// app/user-management/$store/ui.store.ts
export const useUIStore = create<I_UIStore>((set) => ({ ... }))
```

### Zod Schema — `[module].schema.ts`

Schema diletakkan di root folder fitur — bukan di subfolder — karena dipakai oleh Server Action dan Client Element.

```ts
// app/login/login.schema.ts
export const ZS_LoginForm = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})
```

### API Function & Types — `[resource].ts` + `[resource].type.ts`

Dua file ini selalu berpasangan: satu untuk fungsi fetch, satu untuk interface request/response.

```ts
// api/auth/login.ts — APIS_: server-only (internal API, tidak bisa diakses dari browser)
export async function APIS_Login(payload: IRq_Login): Promise<IRs_Login> { ... }

// api/user/list.ts — APIC_: client-accessible (Route Handler atau External API publik)
export async function APIC_GetUsers(params: IRq_GetUsers): Promise<IRs_GetUsers> { ... }

// api/auth/login.type.ts
export interface IRq_Login { email: string; password: string }
export interface IRs_Login { token: string; user: I_UserProfile }
```

### Registry — `[domain].register.ts`

File registry menyimpan konstanta yang dipakai lintas file: path URL, query key TanStack Query, dll.

```ts
// reg/routes.register.ts
export const ROUTE_LOGIN = "/login"
export const ROUTE_DASHBOARD = "/dashboard"

// reg/query-keys.register.ts
export const QK_UserList = (search: string) => ["user", "list", search]
```

### Lib Adapter — `[library].ts` + `index.ts`

Pasangan file ini memisahkan interface dari implementasi sehingga mengganti library hanya memerlukan perubahan satu file.

```ts
// lib/cache/index.ts — interface + re-export implementasi aktif
export interface I_CacheAdapter { get(...): ...; set(...): ...; del(...): ... }
export { cache } from "./ioredis"

// lib/cache/ioredis.ts — implementasi konkret
export const cache: I_CacheAdapter = { ... }
```

## Kapan Tidak Pakai Ini

- **`page.tsx` dan `layout.tsx`** — nama ini sudah ditentukan oleh Next.js App Router, tidak mengikuti pola di atas.
- **`error.tsx`, `loading.tsx`, `not-found.tsx`** — file reserved Next.js, ikuti konvensi Next.js.
- **`middleware.ts`** — satu file di `src/`, tidak menggunakan prefix apapun.
- **`common.ts` di `api/`** — shared base fetcher, helper lintas API, tidak mengikuti pola `[resource].ts`.
