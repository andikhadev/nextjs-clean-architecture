---
title: "Pattern D — URL Search Params (nuqs)"
description: Kelola state search, filter, dan pagination di URL menggunakan nuqs agar state bisa di-share, di-bookmark, dan men-trigger re-render Server Component.
---

## Tujuan

Pattern D digunakan untuk state yang relevan secara kontekstual dan perlu bisa di-share via URL — search query, filter kategori, halaman pagination, sort order. Dengan menyimpan state ini di URL (bukan di Zustand atau `useState`), user bisa bookmark halaman, berbagi link dengan filter yang sama, dan menekan tombol back untuk kembali ke state sebelumnya. nuqs menyediakan API `useQueryState` / `useQueryStates` yang bekerja seperti `useState` tapi disinkronisasi ke URL, dengan opsi `shallow: false` untuk men-trigger re-render Server Component.

---

## Alur Data

```
CE_SearchBar  →  useQueryState("q")  →  URL berubah
     ↓
Next.js Router re-render (karena shallow: false)
     ↓
page.tsx menerima searchParams baru
     ↓
SE_Layout  →  APIS_GetUsers({ search: q })  →  data baru
```

**Perbandingan state storage:**

| State | Simpan di | Pattern |
|-------|-----------|---------|
| Search, filter, page | URL (`?q=...&page=2`) | Pattern D — nuqs |
| Modal open/close | Zustand store | [Pattern E — Zustand](/patterns/zustand) |
| Form input sementara | TanStack Form | [Pattern C — Form Submit](/patterns/form-submit) |
| Data server | TanStack Query | [Pattern B — Client Fetch](/patterns/client-fetch) |

---

## Aturan

1. **Gunakan `shallow: false`** untuk params yang perlu men-trigger re-render Server Component (search, filter, page). Tanpa ini, URL berubah tapi Server Component tidak re-render.
2. **Gunakan `useQueryStates`** (bukan beberapa `useQueryState`) untuk multiple params yang related — update bersama dalam satu history entry.
3. **Definisikan parsers di luar komponen** — di atas file atau di file terpisah (`$function/cfn.params.ts`) — bukan inline di hook.
4. **Gunakan typed parsers** dari nuqs: `parseAsInteger`, `parseAsString`, `parseAsBoolean` — bukan raw string.
5. **Set default value** dengan `.withDefault()` agar nilai tidak pernah `null` di dalam komponen.
6. **Debounce input search** sebelum update URL — jangan update URL setiap keystroke.
7. **Reset `page` ke 1** saat search atau filter berubah — jangan biarkan user di halaman 5 dengan filter baru yang mungkin hanya punya 1 halaman.
8. **Gunakan `history: "push"`** untuk perubahan yang user ingin bisa "back" (navigasi antar halaman), `history: "replace"` untuk filter ephemeral.
9. **Clear param dengan `null`** — `setSearch(null)` menghapus `?q=` dari URL sepenuhnya (lebih bersih dari `setSearch("")`).

---

## Contoh

Fitur `user-list` — search + pagination yang tersimpan di URL.

### Struktur File

```
app/user-list/
├── $element/
│   ├── server.layout.tsx      SE_UserListLayout
│   ├── client.searchbar.tsx   CE_SearchBar
│   └── client.pagination.tsx  CE_Pagination
└── page.tsx
```

### Definisi Parsers (di atas komponen atau file terpisah)

```ts
// Definisikan di luar komponen — bukan inline di hook
import { parseAsInteger, parseAsString } from "nuqs"

export const searchParsers = {
    q: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
}
```

### `$element/client.searchbar.tsx`

```tsx
"use client"

import { useQueryStates } from "nuqs"
import { useDebouncedCallback } from "use-debounce"
import { searchParsers } from "./cfn.params"

export function CE_SearchBar() {
    const [{ q, page }, setParams] = useQueryStates(searchParsers, {
        shallow: false,   // trigger Server Component re-render
        history: "push",  // user bisa back ke search sebelumnya
    })

    // Debounce 300ms — tidak update URL setiap keystroke
    const handleSearch = useDebouncedCallback((term: string) => {
        setParams({
            q: term || null,  // null = hapus param dari URL
            page: 1,          // reset page saat search berubah
        })
    }, 300)

    return (
        <input
            type="search"
            defaultValue={q}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari user..."
            className="border rounded px-3 py-2 w-full max-w-sm"
        />
    )
}
```

### `$element/client.pagination.tsx`

```tsx
"use client"

import { useQueryStates } from "nuqs"
import { searchParsers } from "./cfn.params"

interface I_Props {
    total: number
    perPage?: number
}

export function CE_Pagination({ total, perPage = 10 }: I_Props) {
    const [{ page }, setParams] = useQueryStates(searchParsers, {
        shallow: false,
    })

    const totalPages = Math.ceil(total / perPage)

    function goToPage(newPage: number) {
        setParams({ page: newPage })
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-40"
            >
                Sebelumnya
            </button>

            <span className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
            </span>

            <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40"
            >
                Berikutnya
            </button>
        </div>
    )
}
```

### `$element/server.layout.tsx`

```tsx
import { APIS_GetUsers } from "@/api/user/list"
import { CE_SearchBar } from "./client.searchbar"
import { CE_Pagination } from "./client.pagination"
import { CE_UserTable } from "./client.table"

interface I_Props {
    searchParams: { q?: string; page?: string }
}

export async function SE_UserListLayout({ searchParams }: I_Props) {
    const search = searchParams.q ?? ""
    const page = Number(searchParams.page) || 1

    const data = await APIS_GetUsers({ search, page })

    return (
        <section className="space-y-4">
            <CE_SearchBar />
            <CE_UserTable items={data.items} />
            <CE_Pagination total={data.total} />
        </section>
    )
}
```

### `page.tsx`

```tsx
import { SE_UserListLayout } from "./$element/server.layout"

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>
}) {
    const params = await searchParams
    return <SE_UserListLayout searchParams={params} />
}
```

### Setup: `NuqsAdapter` di Root Layout

```tsx
// app/layout.tsx
import { NuqsAdapter } from "nuqs/adapters/next/app"

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <body>
                <NuqsAdapter>{children}</NuqsAdapter>
            </body>
        </html>
    )
}
```

---

## Kapan Tidak Pakai Ini

| Situasi | Pattern yang Tepat |
|---------|-------------------|
| Modal open/close, selected row, sidebar toggle | [Pattern E — Zustand](/patterns/zustand) |
| State yang tidak relevan untuk dibagikan via URL | [Pattern E — Zustand](/patterns/zustand) |
| State form sementara (belum di-submit) | [Pattern C — Form Submit](/patterns/form-submit) |
| Filter kompleks yang butuh ukuran URL besar | Pertimbangkan Zustand + simpan ke URL hanya ID filter |
