# Key Rules & Anti-patterns — Convention v2

## Rules Wajib

### page.tsx

```
page.tsx HANYA boleh berisi:
  return <SE_FeatureLayout />
```

Tidak boleh ada: fetch, logic, conditional rendering, import komponen langsung.

### APIS_ vs APIC_

| | APIS_ | APIC_ |
|--|-------|-------|
| **Dipanggil dari** | SE_, ACT_, SFN_ | CE_ via TanStack Query |
| **Auth** | httpServer (cookies server-side) | httpClient atau httpClientInternal |
| **Bisa di client?** | ❌ server-only | ✓ |
| **Contoh** | `APIS_GetUsers()` di SE_ | `APIC_GetUsers()` di useQuery |

**APIS_ dipanggil dari CE_ adalah critical violation.**

### Server Action (ACT_)

```typescript
// Zod validation WAJIB ada sebelum APIS_
export async function ACT_Submit(input: unknown) {
  const parsed = ZS_Schema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }
  // baru boleh panggil APIS_
  await APIS_Create(parsed.data)
}
```

### shadcn/ui

Jangan pernah modifikasi file di `components/ui/` langsung.
Buat wrapper di CE_ atau `lib/ui/`.

### Library Import

Jangan import library third-party langsung di feature files.
Gunakan adapter di `lib/[domain]/`.

```typescript
// ❌ Salah
import Redis from "ioredis"
const redis = new Redis(...)

// ✓ Benar
import { cache } from "@/lib/cache"
await cache.get("key")
```

### State Management Decision

| State type | Solusi |
|-----------|--------|
| URL-persistent (filter, search, pagination) | URL Search Params (nuqs) |
| Transient UI (modal, selection, toggle) | Zustand |
| Server state (data dari API) | TanStack Query |
| Form state | TanStack Form |

### Zustand Store Scope

- State satu feature → `app/[feature]/$store/[name].store.ts`
- State 2+ feature → `store/[name].store.ts` (root)

---

## Anti-patterns (Dilarang)

### GlobalEmitter

```typescript
// ❌ Dilarang
globalEmitter.emit("user:updated", data)
globalEmitter.on("user:updated", handler)
```

Gantinya: Zustand (transient) atau URL params (persistent).

### Logic di page.tsx

```typescript
// ❌ Salah
export default function Page() {
  const [data, setData] = useState(null)  // ← logic di sini
  useEffect(() => { fetch(...) }, [])
  return <div>{data}</div>
}

// ✓ Benar
export default function Page() {
  return <SE_FeatureLayout />
}
```

### APIS_ di Client

```typescript
// ❌ Salah — APIS_ dipanggil di CE_
export function CE_UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    APIS_GetUsers().then(setUsers)  // ← violation
  }, [])
}

// ✓ Benar — APIC_ via TanStack Query
export function CE_UserList({ initialData }) {
  const { data } = useQuery({
    queryKey: QK_UserList.list(),
    queryFn: APIC_GetUsers,
    initialData,
  })
}
```

### Modifikasi components/ui/

```typescript
// ❌ Salah — modifikasi langsung
// components/ui/button.tsx
export function Button() {
  // jangan ubah file ini
}

// ✓ Benar — buat wrapper
// client.submit-button.tsx
import { Button } from "@/components/ui/button"
export function CE_SubmitButton(props: I_SubmitButtonProps) {
  return <Button {...props} />
}
```

### Over-engineering Adapter

```typescript
// ❌ Salah — generate semua method "untuk jaga-jaga"
interface I_CacheAdapter {
  get, set, del, exists, expire, ttl,
  incr, decr, lpush, rpush, lrange,  // ← tidak diminta
  publish, subscribe, ...
}

// ✓ Benar — hanya yang dikonfirmasi dibutuhkan
interface I_CacheAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttl?: number): Promise<void>
  del(key: string): Promise<void>
}
```

### Fetch Tanpa Adapter di Feature

```typescript
// ❌ Salah — fetch langsung di feature
export async function APIS_GetUsers() {
  const res = await fetch("https://api.company.com/users", {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

// ✓ Benar — gunakan httpServer adapter
export const APIS_GetUsers = (): Promise<IRs_UserList> =>
  httpServer.get(EP_User.list())
```
