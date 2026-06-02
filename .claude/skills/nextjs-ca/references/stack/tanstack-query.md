# TanStack Query — Implementation Reference

## Query Key Registry (`QK_`)

Semua query key terdaftar di `reg/query-keys.register.ts`. Tidak boleh inline di komponen.

```ts
// reg/query-keys.register.ts
export const QK_User = {
  all: () => ["user"] as const,
  list: () => [...QK_User.all(), "list"] as const,
  detail: (id: string) => [...QK_User.all(), "detail", id] as const,
}

export const QK_WelcomeBanner = {
  all: () => ["welcome-banner"] as const,
  detail: () => [...QK_WelcomeBanner.all(), "detail"] as const,
}
```

Naming: `QK_[Feature]` — matching nama feature folder (PascalCase).

---

## Pattern: Server Fetch + Client Hydration (Pattern A + B)

Server component (SE_) fetch data awal, client component (CE_) hydrate dengan `initialData`:

```tsx
// $element/server.user-list.tsx (SE_)
import { APIS_GetUsers } from "@/api/user/user"
import { CE_UserList } from "./client.user-list"

export async function SE_UserList() {
  const initialData = await APIS_GetUsers()
  return <CE_UserList initialData={initialData} />
}
```

```tsx
// $element/client.user-list.tsx (CE_)
"use client"
import { useQuery } from "@tanstack/react-query"
import { APIC_GetUsers } from "@/api/user/user"
import { QK_User } from "@/reg/query-keys.register"

interface I_UserListProps {
  initialData: IRs_UserList
}

export function CE_UserList({ initialData }: I_UserListProps) {
  const { data, isLoading } = useQuery({
    queryKey: QK_User.list(),
    queryFn: APIC_GetUsers,
    initialData,
    staleTime: 30_000,
  })

  if (isLoading) return <div>Loading...</div>
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

---

## Pattern: Mutation + Invalidation

```tsx
"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { QK_User } from "@/reg/query-keys.register"

export function CE_DeleteUserButton({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => APIC_DeleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK_User.list() })
    },
  })

  return (
    <button onClick={() => mutate()} disabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </button>
  )
}
```

---

## `staleTime` dan `gcTime` Guidance

| Use case | staleTime | gcTime |
|---------|-----------|--------|
| Data jarang berubah (config, kategori) | `5 * 60_000` (5 menit) | default (5 menit) |
| Data normal (list, detail) | `30_000` (30 detik) | default |
| Data real-time (notif, chat) | `0` | default |

Default `staleTime` TanStack Query adalah `0` — setiap mount akan refetch. Set sesuai kebutuhan.

---

## Aturan Penggunaan

- `useQuery` dan `useMutation` hanya di CE_ (client component)
- SE_ menggunakan `APIS_` langsung, bukan `useQuery`
- `APIC_` adalah queryFn — bukan `APIS_`
- Query key selalu dari `QK_` registry, tidak pernah inline string
- `initialData` dari SE_ untuk avoid loading state di first render

---

## Provider Setup

QueryClientProvider harus ada di root layout:

```tsx
// app/layout.tsx atau providers wrapper
"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

## Anti-patterns

```tsx
// ❌ Salah — fetch manual di CE_
export function CE_UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    APIC_GetUsers().then(setUsers)
  }, [])
}

// ✅ Benar — useQuery dengan APIC_
export function CE_UserList({ initialData }) {
  const { data } = useQuery({
    queryKey: QK_User.list(),
    queryFn: APIC_GetUsers,
    initialData,
  })
}
```

```tsx
// ❌ Salah — APIS_ di CE_
const { data } = useQuery({
  queryKey: ["users"],          // ← inline key
  queryFn: APIS_GetUsers,       // ← APIS_ di client
})

// ✅ Benar
const { data } = useQuery({
  queryKey: QK_User.list(),     // ← dari registry
  queryFn: APIC_GetUsers,       // ← APIC_ di client
})
```
