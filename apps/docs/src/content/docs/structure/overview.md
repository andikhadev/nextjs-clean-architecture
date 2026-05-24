---
title: Struktur Folder
description: Overview lengkap struktur folder untuk proyek Next.js 15+ dengan App Router.
---

## Tujuan

Struktur folder convention ini memisahkan tanggung jawab secara eksplisit — setiap file punya satu tempat yang jelas berdasarkan jenis dan scopenya. Hasilnya: kode mudah dinavigasi, mudah di-refactor, dan mudah dipahami tanpa penjelasan.

---

## Root Structure

```
messages/         Terjemahan next-intl per locale
src/
├── app/          Next.js App Router — pages dan feature folders
├── api/          API call wrappers (fetch ke backend), per feature
├── i18n/         Konfigurasi next-intl (routing, request config)
├── lib/          Shared utilities, third-party adapters, client instances
├── reg/          Global registry: constants, route keys, query keys
└── store/        Global Zustand stores (lintas feature)
```

> `store/` di root hanya untuk state yang dipakai lebih dari satu feature.
> State yang hanya dipakai satu feature masuk `app/[feature]/$store/`.

---

## Feature Folder

Setiap feature adalah satu folder di bawah `app/`. Di dalamnya ada subfolder dengan prefix `$`:

```
app/[feature]/
├── $action/      Next.js Server Actions — prefix ACT_
├── $element/     React components — prefix SE_ atau CE_
├── $function/    Helper functions — prefix SFN_ atau CFN_
├── $store/       Zustand stores untuk feature ini — useXxxStore
├── layout.tsx    (opsional) layout khusus feature
└── page.tsx      Entry point — hanya return <SE_FeatureLayout />
```

### Aturan `page.tsx`

`page.tsx` **tidak boleh berisi logika apapun**. Hanya boleh:

```tsx
// app/login/page.tsx
export default function LoginPage() {
    return <SE_LoginLayout />
}
```

---

## API Layer

```
api/
├── [feature]/
│   ├── [resource].ts        fungsi fetch utama — prefix APIS_
│   └── [resource].type.ts   IRq_ dan IRs_ interfaces
└── common.ts                shared headers, base fetcher, error handler
```

Semua komunikasi ke backend melewati layer ini. Komponen dan Server Actions tidak boleh `fetch()` langsung.

---

## Lib

```
lib/
├── query-client.ts     TanStack Query client instance
├── session.ts          session management (get/set/clear cookie)
├── utils.ts            helper umum (cn, format date, dll)
└── [domain]/           abstraksi untuk integrasi library eksternal
    ├── index.ts        interface + re-export implementasi aktif
    └── [library].ts    implementasi konkret (ioredis, upstash, dll)
```

Setiap integrasi library eksternal **wajib** dibungkus dalam abstraksi di `lib/[domain]/`.
Consumer hanya boleh import dari `lib/[domain]/` — bukan langsung dari library.

---

## Registry

```
reg/
├── routes.register.ts      semua path konstanta — prefix ROUTE_
├── query-keys.register.ts  TanStack Query keys — prefix QK_
└── [domain].register.ts    konstanta domain lain
```

Semua konstanta global yang dipakai lintas feature terpusat di sini.

---

## i18n Messages

```
messages/
├── en.json    semua teks dalam bahasa Inggris
└── id.json    semua teks dalam bahasa Indonesia
```

Namespace per feature di dalam JSON. Tidak ada folder `$lang/` di dalam feature.

---

## Aturan Penting

| Aturan | Detail |
|--------|--------|
| `page.tsx` hanya boleh render | Tidak ada logika, fetch, atau state di `page.tsx` |
| Komponen shadcn jangan dimodifikasi | Buat wrapper di `$element/` atau `lib/` |
| Dilarang GlobalEmitter | Gunakan Zustand atau URL Search Params |
| Import library hanya via `lib/[domain]/` | Jangan import `ioredis`, `nodemailer`, dll. langsung |

---

## Kapan Tidak Pakai Ini

- Proyek kecil (1-2 halaman sederhana) yang tidak perlu skalabilitas — struktur ini memberikan overhead yang tidak sepadan.
- Halaman `(public)` atau route group yang memang tidak memiliki logika bisnis — boleh lebih sederhana.
