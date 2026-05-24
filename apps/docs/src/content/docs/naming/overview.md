---
title: Naming Conventions
description: Tabel lengkap semua prefix dan pattern penamaan file, folder, dan simbol.
---

## Tujuan

Naming convention ini membuat setiap simbol dan file **self-documenting**. Dengan membaca nama sebuah fungsi atau file, developer langsung tahu: jenis apa, di mana letaknya, dan bagaimana cara memanggilnya — tanpa perlu membuka file-nya.

Prefix eksplisit juga memudahkan AI (seperti Claude) untuk memahami codebase tanpa diberi penjelasan tambahan.

---

## Symbol Naming

Semua fungsi, komponen, hook, schema, dan konstanta mengikuti prefix berikut:

| Simbol | Prefix | Contoh | Keterangan |
|--------|--------|--------|------------|
| Server Action | `ACT_` | `ACT_SubmitLogin` | Di `$action/`, wajib `"use server"` |
| Server Element | `SE_` | `SE_LoginLayout` | React Server Component |
| Client Element | `CE_` | `CE_LoginForm` | React Client Component, wajib `"use client"` |
| Server Function | `SFN_` | `SFN_SaveSession` | Helper yang hanya jalan di server |
| Client Function | `CFN_` | `CFN_ValidateForm` | Helper yang hanya jalan di client |
| Zustand Store | `use[Name]Store` | `useFilterStore` | Mengikuti React hook convention |
| API Function | `APIS_` | `APIS_Login` | Fetch ke backend, di `api/` layer |
| Zod Schema | `ZS_` | `ZS_LoginForm` | Zod object schema |
| Interface | `I_` | `I_ButtonProps` | TypeScript interface umum |
| Interface Request | `IRq_` | `IRq_Login` | Payload yang dikirim ke API |
| Interface Response | `IRs_` | `IRs_Login` | Response yang diterima dari API |
| Type Alias | `T_` | `T_LoginData` | TypeScript type alias |
| Enum | `E_` | `E_UserRole` | TypeScript enum |
| Query Key | `QK_` | `QK_UserList` | TanStack Query key constant |
| Route Constant | `ROUTE_` | `ROUTE_Dashboard` | Path string constant |

---

## File Naming

| Tipe File | Pattern | Contoh |
|-----------|---------|--------|
| Server Action | `action.[sub].ts` | `action.submit.ts` |
| Server Element | `server.[module].tsx` | `server.layout.tsx` |
| Client Element | `client.[module].tsx` | `client.form.tsx` |
| Server Function | `sfn.[module].ts` | `sfn.session.ts` |
| Client Function | `cfn.[module].ts` | `cfn.validate.ts` |
| Zustand Store | `[module].store.ts` | `filter.store.ts` |
| Zod Schema | `[module].schema.ts` | `login.schema.ts` |
| API Fetch | `[resource].ts` | `login.ts` |
| API Types | `[resource].type.ts` | `login.type.ts` |
| Registry | `[domain].register.ts` | `routes.register.ts` |
| i18n messages | `[locale].json` | `en.json`, `id.json` |

---

## Folder Naming

| Jenis Folder | Convention | Contoh |
|--------------|-----------|--------|
| Feature folder | `kebab-case` | `user-management`, `product-list` |
| Subfolder khusus | prefix `$` | `$action`, `$element`, `$function`, `$store` |
| Lib subdomain | `kebab-case` | `cache`, `storage`, `mailer` |

---

## Contoh Lengkap — Feature Login

```
app/login/
├── $action/
│   └── action.submit.ts        → export async function ACT_SubmitLogin
├── $element/
│   ├── server.layout.tsx       → export async function SE_LoginLayout
│   └── client.form.tsx         → export function CE_LoginForm
├── $function/
│   └── sfn.session.ts          → export async function SFN_SaveSession
├── login.schema.ts             → export const ZS_LoginForm
└── page.tsx                    → export default function LoginPage

api/auth/
├── login.ts                    → export async function APIS_Login
└── login.type.ts               → export interface IRq_Login, IRs_Login

reg/
└── routes.register.ts          → export const ROUTE_Dashboard = "/dashboard"
```

---

## Kapan Tidak Pakai Prefix

- File konfigurasi (`next.config.ts`, `tailwind.config.ts`) — tidak menggunakan prefix
- Next.js special files (`layout.tsx`, `page.tsx`, `error.tsx`, `loading.tsx`) — ikuti convention Next.js
- shadcn/ui components di `components/ui/` — jangan diubah, naming mengikuti shadcn
