# nuqs — Implementation Reference

## Kapan Pakai nuqs

State yang perlu ada di URL — shareable, bookmarkable, persistent saat refresh:
- Filter (status, kategori, tipe)
- Pagination (page, per_page)
- Search query
- Tab aktif (jika perlu shareable)
- Sort (field, direction)

Jangan pakai nuqs untuk state transient UI seperti modal open/close (→ Zustand).

---

## Import

```ts
import { useQueryState, useQueryStates, parseAsInteger, parseAsString, parseAsBoolean, parseAsArrayOf } from "nuqs"
```

---

## Satu Parameter

```tsx
"use client"
import { useQueryState, parseAsInteger, parseAsString } from "nuqs"

export function CE_UserFilter() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("all"))

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value || null)}
        placeholder="Search..."
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="all">All</option>
        <option value="active">Active</option>
      </select>
    </div>
  )
}
```

`.withDefault(value)` — nilai default jika param tidak ada di URL.
`setSearch(null)` — menghapus param dari URL.

---

## Multiple Parameters Sekaligus (`useQueryStates`)

Gunakan `useQueryStates` jika beberapa param sering diupdate bersama (menghindari multiple navigations):

```tsx
"use client"
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs"

const userFilterParsers = {
  page: parseAsInteger.withDefault(1),
  search: parseAsString.withDefault(""),
  status: parseAsString.withDefault("all"),
}

export function CE_UserFilter() {
  const [filters, setFilters] = useQueryStates(userFilterParsers)

  function handleSearchChange(value: string) {
    setFilters({ search: value || null, page: 1 })  // reset page saat search berubah
  }

  return (
    <input
      value={filters.search}
      onChange={(e) => handleSearchChange(e.target.value)}
    />
  )
}
```

---

## Parsers yang Tersedia

| Parser | URL value | JS value |
|--------|-----------|----------|
| `parseAsString` | `"active"` | `"active"` |
| `parseAsInteger` | `"2"` | `2` |
| `parseAsFloat` | `"1.5"` | `1.5` |
| `parseAsBoolean` | `"true"` | `true` |
| `parseAsArrayOf(parseAsString)` | `"a,b,c"` | `["a", "b", "c"]` |

---

## Shallow vs Deep Navigation

Default `useQueryState` menggunakan shallow routing (tidak trigger server re-render):

```tsx
// shallow (default) — hanya update URL, tidak re-render SE_
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))

// deep — trigger full navigation, SE_ di-re-render
const [page, setPage] = useQueryState("page", {
  ...parseAsInteger.withDefault(1),
  shallow: false,
})
```

Gunakan `shallow: false` jika SE_ perlu fetch ulang berdasarkan URL params.

---

## Membaca di Server Component (SE_)

SE_ bisa membaca search params langsung dari props:

```tsx
// SE_ menerima searchParams dari page.tsx
interface I_UserListPageProps {
  searchParams: Promise<{ page?: string; q?: string }>
}

export async function SE_UserList({ searchParams }: I_UserListPageProps) {
  const { page = "1", q = "" } = await searchParams
  const data = await APIS_GetUsers({ page: parseInt(page), search: q })
  return <CE_UserList initialData={data} />
}
```

---

## NuqsAdapter — Wajib di Provider

`NuqsAdapter` harus ada di root layout agar `useQueryState` bisa dipakai:

```tsx
// app/layout.tsx
import { NuqsAdapter } from "nuqs/adapters/next/app"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
```

---

## Anti-patterns

```tsx
// ❌ Salah — useState untuk filter yang harusnya di URL
const [page, setPage] = useState(1)
const [search, setSearch] = useState("")

// ✅ Benar — nuqs
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))
```

```tsx
// ❌ Salah — URL string parsing manual
const searchParams = useSearchParams()
const page = parseInt(searchParams.get("page") ?? "1")

// ✅ Benar — nuqs parser menangani parsing + default
const [page] = useQueryState("page", parseAsInteger.withDefault(1))
```

```tsx
// ❌ Salah — Zustand untuk state shareable/bookmarkable
const page = useTableStore((s) => s.page)

// ✅ Benar — nuqs untuk state yang perlu di URL
const [page] = useQueryState("page", parseAsInteger.withDefault(1))
```
