---
title: Feature Folder
description: Anatomi folder feature di Next.js App Router — subfolder $action, $element, $function, $store, dan aturan page.tsx.
---

## Tujuan

Setiap feature adalah satu folder di bawah `app/`. Di dalamnya, kode dibagi ke subfolder dengan prefix `$` — memisahkan Server Actions, komponen, helper function, dan state management secara eksplisit. Hasilnya: kita langsung tahu jenis dan scope sebuah file hanya dari path-nya.

## Struktur

```
// tree
app/[feature]/
├── $action/      Next.js Server Actions — prefix ACT_
├── $element/     React components — prefix SE_ (server) atau CE_ (client)
├── $function/    Helper functions — prefix SFN_ (server) atau CFN_ (client)
├── $store/       Zustand stores scoped ke feature ini — useXxxStore
├── layout.tsx    (opsional) layout khusus feature
└── page.tsx      Entry point — HANYA boleh return <SE_FeatureLayout />
```

## Aturan `page.tsx`

`page.tsx` **tidak boleh berisi logika apapun**. Tidak ada fetch, tidak ada state, tidak ada kondisional.

```tsx
// app/login/page.tsx
export default function LoginPage() {
    return <SE_LoginLayout />
}
```

Kalau butuh `searchParams` atau `params`, lempar langsung ke SE_ component:

```tsx
// app/user-list/page.tsx
export default async function UserListPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>
}) {
    const params = await searchParams
    return <SE_UserListLayout searchParams={params} />
}
```

## Hubungan Antar Subfolder

```
// tree — alur data dalam satu feature
page.tsx
  └─→ $element/server.*.tsx (SE_)    — async Server Components, bisa fetch data
         ├─→ $element/client.*.tsx (CE_)  — Client Components via props
         ├─→ $action/action.*.ts (ACT_)   — dipanggil dari CE_ saat form submit
         ├─→ $function/sfn.*.ts (SFN_)    — helper server-side dipanggil dari SE_
         ├─→ $function/cfn.*.ts (CFN_)    — helper client-side dipanggil dari CE_
         └─→ $store/*.store.ts            — state lokal feature, dipakai CE_
```

## Contoh — Feature Login

```
// tree — app/login/
app/login/
├── $action/
│   └── action.submit.ts       → export ACT_SubmitLogin
├── $element/
│   ├── server.layout.tsx      → export SE_LoginLayout
│   └── client.form.tsx        → export CE_LoginForm
├── $function/
│   └── sfn.session.ts         → export SFN_SaveSession
├── $store/
│   └── ui.store.ts            → export useLoginUiStore
├── login.schema.ts            → export ZS_LoginForm (Zod schema)
└── page.tsx                   → return <SE_LoginLayout />
```

## Aturan

| Aturan | Detail |
|--------|--------|
| `page.tsx` hanya render | Tidak ada logika, fetch, atau kondisional |
| `$store/` hanya untuk feature ini | State lintas feature masuk `src/store/` |
| Zod schema di level feature | File `[feature].schema.ts` di root feature folder |
| Jangan ada subfolder di dalam `$element/` | Semua file langsung di `$element/`, tidak bersarang |
| Komponen shadcn jangan dimodifikasi | Buat wrapper `CE_` di `$element/` |

## Kapan Tidak Pakai Ini

- Route group `(public)` atau `(auth)` yang hanya berisi layout — boleh tanpa subfolder `$`.
- Halaman `not-found.tsx`, `error.tsx`, `loading.tsx` — Next.js special files, tidak mengikuti convention ini.
- Shared komponen yang dipakai lebih dari satu feature — taruh di `lib/` bukan di feature folder.
