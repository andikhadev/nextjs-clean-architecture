---
title: TanStack Query
description: Panduan setup dan penggunaan TanStack Query dalam konvensi Next.js Clean Architecture — client-side fetching, query key registry, dan server prefetch.
---

## Tujuan dalam Konvensi Ini

TanStack Query dipilih untuk menangani **server state di sisi client** — data yang perlu di-refresh tanpa navigasi penuh, mendukung polling, atau bergantung pada interaksi user. Berbeda dengan Pattern A (server fetch), TanStack Query dipakai ketika component perlu mengambil atau memperbarui data secara reaktif. Dalam konvensi ini, semua query key disentralisasi di registry `QK_` untuk menghindari inkonsistensi cache.

---

## Setup

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### QueryClient yang Kompatibel dengan Server Components

Buat file `lib/query-client.ts` dengan pola yang aman untuk Next.js App Router:

```ts
// lib/query-client.ts
import { QueryClient, isServer } from "@tanstack/react-query"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 menit — hindari refetch langsung saat mount
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (isServer) {
    // Server: selalu buat QueryClient baru per request
    return makeQueryClient()
  } else {
    // Browser: buat sekali dan simpan
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
```

### Provider di Root Layout

```tsx
// app/layout.tsx (atau app/[locale]/layout.tsx)
"use client"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { getQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## Pola Penggunaan

### Query Key Registry

Semua query key disimpan di `reg/query-keys.register.ts` dengan prefix `QK_`:

```ts
// reg/query-keys.register.ts
export const QK_UserList = (search: string) => ["user", "list", search]
export const QK_UserDetail = (id: string) => ["user", "detail", id]
export const QK_ProductList = (page: number, category: string) =>
  ["product", "list", { page, category }]
```

### useQuery di CE_

```tsx
// app/user-list/$element/client.userlist.tsx
"use client"
import { useQuery } from "@tanstack/react-query"
import { QK_UserList } from "@/reg/query-keys.register"
import { APIS_GetUsers } from "@/api/user/list"
import { useUIStore } from "../$store/filter.store"

export function CE_UserList() {
  const { search } = useFilterStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: QK_UserList(search),
    queryFn: () => APIS_GetUsers({ search }),
  })

  if (isLoading) return <div>Memuat...</div>
  if (isError) return <div>Gagal memuat data</div>

  return <CE_UserTable data={data?.items ?? []} />
}
```

### Mutation dengan Invalidasi

```tsx
// app/user-list/$element/client.deletebutton.tsx
"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { QK_UserList } from "@/reg/query-keys.register"
import { APIS_DeleteUser } from "@/api/user/delete"

export function CE_DeleteButton({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => APIS_DeleteUser(id),
    onSuccess: () => {
      // Invalidasi agar list otomatis refresh
      queryClient.invalidateQueries({ queryKey: ["user", "list"] })
    },
  })

  return (
    <button onClick={() => mutate(userId)} disabled={isPending}>
      {isPending ? "Menghapus..." : "Hapus"}
    </button>
  )
}
```

### Server Prefetch (Pattern Opsional)

Untuk meningkatkan performa dengan prefetch dari Server Component:

```tsx
// app/user-list/$element/server.userlist.tsx
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/query-client"
import { QK_UserList } from "@/reg/query-keys.register"
import { APIS_GetUsers } from "@/api/user/list"

export async function SE_UserList() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: QK_UserList(""),
    queryFn: () => APIS_GetUsers({ search: "" }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CE_UserList />
    </HydrationBoundary>
  )
}
```

---

## Aturan Konvensi

- Semua query key **wajib** menggunakan konstanta `QK_` dari `reg/query-keys.register.ts`
- Query key harus berbentuk array dan mengikuti hierarki `[entity, operation, params]`
- Gunakan `useQuery` hanya di dalam `CE_` (Client Component)
- Gunakan `isPending` (bukan `isLoading`) untuk mutation loading state
- Setelah mutasi berhasil, selalu invalidasi query yang relevan via `queryClient.invalidateQueries`
- `staleTime` minimal 60 detik di default config — hindari refetch agresif
- TanStack Query **hanya untuk server state** — state UI tetap di Zustand

---

## Referensi

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Pattern B — Client Fetch dengan TanStack Query](/patterns/client-fetch)
- [Query Key Registry — QK_ prefix](/conventions/naming)
