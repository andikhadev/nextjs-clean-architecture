# 01 — Convention v2 Spec

**Status:** ✅ Selesai
**Tujuan:** Mendefinisikan ulang semua aturan folder, naming, dan pattern data flow
sebagai fondasi dari dokumentasi dan Claude Skills.

---

## Checklist

### Folder Structure
- [x] Root structure finalized
- [x] Feature structure finalized
- [x] Aturan `$store` vs global store
- [x] Posisi Zod schema

### Naming Conventions
- [x] File naming — semua tipe
- [x] Symbol naming — semua prefix
- [x] Folder naming

### Pattern Guide
- [x] Pattern A — Server fetch
- [x] Pattern B — Client fetch (TanStack Query)
- [x] Pattern C — Form submit (TanStack Form + Zod + Server Action)
- [x] Pattern D — Cross-component: URL Search Params
- [x] Pattern E — Cross-component: Zustand
- [x] Pattern F — shadcn/ui extension
- [x] Pattern G — Library abstraction (Adapter)
- [x] Pattern H — i18n dengan next-intl
- [x] Pattern I — API Mocking (MSW + EP_ endpoint registry)

---

## Folder Structure

### Root

```
messages/         Terjemahan next-intl per locale — en.json, id.json
src/
├── app/          Next.js App Router — pages dan feature folders
├── api/          API call wrappers (fetch ke backend), dikelompokkan per feature
├── i18n/         Konfigurasi next-intl (routing, request config)
├── lib/          Shared utilities, third-party adapters, client instances
├── reg/          Global registry: constants, route keys, query keys
└── store/        Global Zustand stores (hanya yang benar-benar lintas feature)
```

> `store/` di root hanya untuk state yang dipakai lebih dari satu feature.
> State yang hanya dipakai satu feature tetap masuk `app/[feature]/$store/`.

### Feature

```
app/[feature]/
├── $action/      Next.js Server Actions — ACT_ prefix
├── $element/     React components — SE_ (server) / CE_ (client) prefix
├── $function/    Helper functions — SFN_ (server) / CFN_ (client) prefix
├── $store/       Zustand stores untuk feature ini — useXxxStore pattern
├── $test/        test files feature ini — co-located unit test + integration/e2e
├── layout.tsx    (opsional) layout khusus feature
└── page.tsx      Entry point — hanya render SE_ component, tidak ada logika
```

> `page.tsx` **tidak boleh** berisi logika apapun. Hanya boleh `return <SE_FeatureLayout />`.

### API Layer

```
api/
├── [feature]/
│   ├── [feature].endpoint.ts    EP_ — path constants (opsional, untuk Pattern I)
│   ├── [resource].ts            fungsi fetch utama — APIS_ atau APIC_
│   ├── [resource].type.ts       IRq_ dan IRs_ interfaces
│   └── [resource].mock-handler.ts  MSW handler (opsional, untuk Pattern I)
└── common.ts                    shared headers, base fetcher, error handler
```

### MSW Wiring

```
src/mocks/
├── browser.ts    setupWorker — implementation detail untuk client
├── node.ts       setupServer — implementation detail + test export
└── index.ts      handlers + initMocksClient() + initMocksServer() + attachLogger()
```

> `src/mocks/` hanya berisi wiring — bukan definisi handler.
> Handler didefinisikan di `api/[feature]/[resource].mock-handler.ts`.

### Lib

```
lib/
├── query-client.ts     TanStack Query client instance
├── session.ts          session management (get/set/clear cookie)
├── utils.ts            helper umum (cn, format date, dll)
└── [domain]/           abstraksi untuk integrasi library eksternal
    ├── index.ts        interface + re-export implementasi aktif
    └── [library].ts    implementasi konkret (ioredis, upstash, dll)
```

> Setiap integrasi library eksternal (Redis, S3, email, dll.) **wajib** dibungkus
> dalam abstraksi di `lib/[domain]/`. Consumer hanya boleh import dari `lib/[domain]`,
> bukan langsung dari library — sehingga ganti library = hanya ubah satu file.

### Registry

```
reg/
├── routes.register.ts      semua path konstanta — ROUTE_
├── query-keys.register.ts  TanStack Query keys — QK_
└── [domain].register.ts    konstanta domain lain
```

---

## Naming Conventions

### File Naming

| Tipe | Pattern | Contoh |
|------|---------|--------|
| Server Action | `action.[sub].ts` | `action.submit.ts` |
| Server Element | `server.[module].tsx` | `server.layout.tsx` |
| Client Element | `client.[module].tsx` | `client.form.tsx` |
| Server Function | `sfn.[module].ts` | `sfn.session.ts` |
| Client Function | `cfn.[module].ts` | `cfn.validate.ts` |
| Zustand Store | `[module].store.ts` | `filter.store.ts` |
| Zod Schema | `[module].schema.ts` | `login.schema.ts` |
| API | `[resource].ts` | `login.ts` |
| API Types | `[resource].type.ts` | `login.type.ts` |
| Endpoint Path Registry | `[feature].endpoint.ts` | `user.endpoint.ts` |
| MSW Mock Handler | `[resource].mock-handler.ts` | `users-list.mock-handler.ts` |
| Registry | `[domain].register.ts` | `routes.register.ts` |
| i18n messages | `[locale].json` | `id.json`, `en.json` — di `messages/` root |

### Symbol / Function Naming

| Simbol | Prefix | Contoh | Keterangan |
|--------|--------|--------|------------|
| Server Action | `ACT_` | `ACT_SubmitLogin` | Di `$action/`, `"use server"` |
| Server Element | `SE_` | `SE_LoginLayout` | Server Component |
| Client Element | `CE_` | `CE_LoginForm` | `"use client"` |
| Server Function | `SFN_` | `SFN_SaveSession` | Hanya jalan di server |
| Client Function | `CFN_` | `CFN_ValidateForm` | Hanya jalan di client |
| Zustand Store | `use[Name]Store` | `useFilterStore` | Mengikuti React hook convention |
| API Function (server-only) | `APIS_` | `APIS_Login` | Hanya dari SE_, ACT_, SFN_ — internal API |
| API Function (client-accessible) | `APIC_` | `APIC_GetUsers` | Dari CE_ via TanStack Query — Route Handler / External API publik |
| Zod Schema | `ZS_` | `ZS_LoginForm` | Zod object schema |
| Interface | `I_` | `I_ButtonProps` | TypeScript interface umum |
| Interface Request | `IRq_` | `IRq_Login` | Payload ke API |
| Interface Response | `IRs_` | `IRs_Login` | Response dari API |
| Type | `T_` | `T_LoginData` | TypeScript type alias |
| Enum | `E_` | `E_UserRole` | TypeScript enum |
| Query Key | `QK_` | `QK_UserList` | TanStack Query key constant |
| Route Constant | `ROUTE_` | `ROUTE_Dashboard` | Path string constant |
| Endpoint Path Registry | `EP_` | `EP_User` | Path constants API, di `[feature].endpoint.ts` |
| i18n hook | `useTranslations` / `getTranslations` | `useTranslations("Login")` | next-intl |

### Folder Naming

- Feature folder: `kebab-case` — `user-management`, `product-list`
- Subfolder khusus: prefix `$` — `$action`, `$element`, `$function`, `$store`, `$lang`
- Lib subfolder: `kebab-case` sesuai domain — `cache`, `storage`, `mailer`

---

## Pattern Guide

### Pattern A — Fetch Data di Server

**Kapan:** Data dibutuhkan saat halaman pertama kali render, tidak perlu interaktivitas.

```
page.tsx → SE_ component → APIS_ → data → CE_ via props
```

```tsx
// page.tsx
export default async function Page({ searchParams }) {
    const params = await searchParams
    return <SE_UserList searchParams={params} />
}

// $element/server.userlist.tsx
export async function SE_UserList({ searchParams }) {
    const data = await APIS_GetUsers({ search: searchParams.search })
    return <CE_UserTable data={data.items} total={data.total} />
}

// $element/client.usertable.tsx
"use client"
export function CE_UserTable({ data, total }: { data: I_User[], total: number }) {
    return <Table data={data} />
}
```

---

### Pattern B — Fetch Data di Client (TanStack Query)

**Kapan:** Data perlu di-refresh tanpa navigasi, ada polling, atau tergantung interaksi user.

```
CE_ component → useQuery(QK_, APIC_) → render
```

```tsx
// reg/query-keys.register.ts
export const QK_UserList = (search: string) => ["user", "list", search]

// $element/client.userlist.tsx
"use client"
import { useQuery } from "@tanstack/react-query"
import { QK_UserList } from "@/reg/query-keys.register"
import { APIC_GetUsers } from "@/api/user/list"

export function CE_UserList({ search }: { search: string }) {
    const { data, isLoading } = useQuery({
        queryKey: QK_UserList(search),
        queryFn: () => APIC_GetUsers({ search }),
    })

    if (isLoading) return <Skeleton />
    return <Table data={data?.items ?? []} />
}
```

---

### Pattern C — Submit Form (TanStack Form + Zod + Server Action)

**Kapan:** Semua form submission — create, update, delete.

```
CE_ form → CFN_ validate (Zod) → ACT_ (Server Action) → APIS_ → redirect/error
```

```tsx
// $action/action.submit.ts — tanda tangan useActionState-compatible
"use server"
export async function ACT_SubmitLogin(_: unknown, formData: FormData) {
    const raw = { email: formData.get("email"), password: formData.get("password") }
    const parsed = ZS_LoginForm.safeParse(raw)
    if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }
    const result = await APIS_Login(parsed.data)
    if (!result.ok) return { error: { _root: result.message } }
    await SFN_SaveSession(result.data.token)
    redirect("/dashboard")
}

// $element/client.form.tsx
"use client"
import { useActionState } from "react"
import { ACT_SubmitLogin } from "../$action/action.submit"

export function CE_LoginForm() {
    const [state, formAction, isPending] = useActionState(ACT_SubmitLogin, null)
    return (
        <form action={formAction}>
            <input name="email" />
            <input name="password" type="password" />
            {state?.error?._root && <p>{state.error._root}</p>}
            <button disabled={isPending}>
                {isPending ? "Memproses..." : "Masuk"}
            </button>
        </form>
    )
}
```

---

### Pattern D — Cross-component State via URL Search Params

**Kapan:** Search, filter, pagination — state yang relevan untuk di-share / di-bookmark.

```
CE_SearchBar → router.replace(?q=xxx) → page re-render → SE_ baca → data baru
```

```tsx
// $element/client.searchbar.tsx
"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export function CE_SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        term ? params.set("q", term) : params.delete("q")
        params.set("page", "1")
        router.replace(`?${params.toString()}`)
    }, 300)

    return (
        <input
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => handleSearch(e.target.value)}
        />
    )
}
```

---

### Pattern E — Cross-component State via Zustand

**Kapan:** State transient yang tidak perlu ada di URL — modal open, selected row,
sidebar toggle, notifikasi.

```
CE_A dispatch → store → CE_B subscribe → re-render
```

```ts
// $store/ui.store.ts
import { create } from "zustand"

interface I_UIStore {
    selectedId: string | null
    isModalOpen: boolean
    setSelectedId: (id: string | null) => void
    openModal: () => void
    closeModal: () => void
}

export const useUIStore = create<I_UIStore>((set) => ({
    selectedId: null,
    isModalOpen: false,
    setSelectedId: (id) => set({ selectedId: id }),
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false, selectedId: null }),
}))
```

```tsx
// CE_Table — dispatch
const { setSelectedId, openModal } = useUIStore()
<button onClick={() => { setSelectedId(row.id); openModal() }}>Detail</button>

// CE_DetailModal — subscribe
const { selectedId, isModalOpen, closeModal } = useUIStore()
```

---

### Pattern F — shadcn/ui Extension



**Kapan:** Setiap kali membuat UI component baru yang pakai shadcn/ui sebagai base.

**Aturan:**
- Komponen shadcn di `components/ui/` — **jangan dimodifikasi langsung**
- Buat wrapper di `$element/` feature atau `lib/` jika shared
- Wrapper mengikuti naming `CE_` / `SE_` sesuai posisinya

```tsx
// lib/button.tsx — shared wrapper atas shadcn Button
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppButton({ className, ...props }: React.ComponentProps<typeof Button>) {
    return <Button className={cn("rounded-lg", className)} {...props} />
}

// $element/client.savebutton.tsx — feature-specific wrapper
"use client"
import { AppButton } from "@/lib/button"

export function CE_SaveButton({ onSave }: { onSave: () => void }) {
    return <AppButton onClick={onSave}>Simpan</AppButton>
}
```

---

### Pattern G — Library Abstraction (Adapter)

**Kapan:** Setiap integrasi ke library eksternal yang bisa diganti — cache (Redis),
object storage (S3), email (Nodemailer/Resend), dll.

**Aturan:**
- Definisikan interface di `lib/[domain]/index.ts`
- Implementasi konkret di `lib/[domain]/[library].ts`
- `index.ts` re-export implementasi aktif — consumer tidak tahu library-nya
- Ganti library = hanya ubah `[library].ts` dan re-export di `index.ts`

```ts
// lib/cache/index.ts — interface + export implementasi aktif
export interface I_CacheAdapter {
    get(key: string): Promise<string | null>
    set(key: string, value: string, ttlSeconds?: number): Promise<void>
    del(key: string): Promise<void>
}

export { cache } from "./ioredis"

// lib/cache/ioredis.ts — implementasi dengan ioredis
import { Redis } from "ioredis"
import type { I_CacheAdapter } from "."

const client = new Redis(process.env.REDIS_URL!)

export const cache: I_CacheAdapter = {
    get: (key) => client.get(key),
    set: (key, value, ttl) =>
        ttl
            ? client.set(key, value, "EX", ttl).then(() => {})
            : client.set(key, value).then(() => {}),
    del: (key) => client.del(key).then(() => {}),
}
```

**Consumer — tidak perlu tahu library:**
```ts
// $function/sfn.session.ts
import { cache } from "@/lib/cache"

export async function SFN_SaveSession(token: string) {
    await cache.set(`session:${token}`, token, 3600)
}
```

**Ganti ioredis → upstash:** buat `lib/cache/upstash.ts`, ubah re-export di `index.ts`. Selesai.

---

### Pattern H — i18n dengan next-intl

**Kapan:** Semua teks yang tampil ke user — label, pesan error, placeholder.

**Struktur:**
```
messages/
├── en.json       semua teks dalam bahasa Inggris
└── id.json       semua teks dalam bahasa Indonesia

src/i18n/
├── routing.ts    defineRouting — locale list, default locale
└── request.ts    getRequestConfig — load messages per request
```

**Namespace per feature** — gunakan nama feature sebagai namespace di JSON:
```json
// messages/id.json
{
  "Login": {
    "title": "Masuk",
    "email": "Email",
    "password": "Kata Sandi",
    "submit": "Masuk",
    "error": {
      "invalidCredentials": "Email atau kata sandi salah"
    }
  }
}
```

**Penggunaan di komponen:**
```tsx
// CE_ — Client Component
"use client"
import { useTranslations } from "next-intl"

export function CE_LoginForm() {
    const t = useTranslations("Login")
    return (
        <form>
            <label>{t("email")}</label>
            <button>{t("submit")}</button>
        </form>
    )
}

// SE_ — Server Component
import { getTranslations } from "next-intl/server"

export async function SE_LoginLayout() {
    const t = await getTranslations("Login")
    return <h1>{t("title")}</h1>
}
```

> `$lang/` folder di feature **tidak digunakan** — semua string ada di `messages/[locale].json`.
> `LANG_` prefix dihapus dari convention — diganti `useTranslations` / `getTranslations`.

---

### Pattern I — API Mocking (MSW)

**Kapan:** API contract sudah disepakati tetapi backend belum siap, atau untuk isolasi frontend dari backend saat testing.

**Alur:**
```
EP_[Feature] (path constants)
    ↓                    ↓
APIS_/APIC_        mock-handler.ts
(real fetch)       (MSW handler)
    ↓                    ↓
Production         Dev / Testing
(env off)         (env enabled / setupServer)
```

**Aturan:**
- `EP_` adalah single source of truth path API — tidak ada string path di tempat lain
- `mock-handler.ts` selalu import path dari `EP_`, tidak pernah hardcode
- Response mock harus sesuai shape `IRs_` yang sudah didefinisikan
- `src/mocks/` hanya berisi wiring — bukan definisi handler
- Tidak pernah aktif di production — guard via `NEXT_PUBLIC_API_MOCKING`
- Hapus mock handler setelah integrasi backend nyata selesai

**Contoh:**
```ts
// api/user/user.endpoint.ts
export const EP_User = {
    list: "/api/users",
    detail: (id: string) => `/api/users/${id}`,
    create: "/api/users",
}

// api/user/user-list.mock-handler.ts
import { http, HttpResponse } from "msw"
import { EP_User } from "./user.endpoint"
import type { IRs_UserList } from "./user-list.type"

export const userListHandler = http.get(EP_User.list, () =>
    HttpResponse.json<IRs_UserList>({ items: [...], total: 2 })
)

// src/mocks/index.ts
import { userListHandler } from "@/api/user/user-list.mock-handler"
export const handlers = [userListHandler]

function attachLogger(instance: { events: any }, runtime: "BROWSER" | "SERVER") {
    instance.events.on("response:mocked", ({ request, response }: any) => {
        console.log(`[MSW][${runtime}] ${request.method} ${new URL(request.url).pathname} → ${response.status}`)
    })
    instance.events.on("request:unhandled", ({ request }: any) => {
        console.warn(`[MSW][${runtime}] ⚠ unhandled: ${request.method} ${new URL(request.url).pathname}`)
    })
}

let clientInitialized = false

export async function initMocksClient() {
    if (clientInitialized) return
    if (typeof window === "undefined") return
    const { worker } = await import("./browser")
    attachLogger(worker, "BROWSER")
    await worker.start({ onUnhandledRequest: "bypass" })
    clientInitialized = true
}

export async function initMocksServer() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return
    const { server } = await import("./node")
    attachLogger(server, "SERVER")
    server.listen({ onUnhandledRequest: "bypass" })
}
```

**Aktivasi:**
```ts
// src/instrumentation-client.ts — primary client (Next.js 15+)
import { initMocksClient } from "@/mocks"
if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
    await initMocksClient()
}

// src/instrumentation.ts — server
export async function register() {
    if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") return
    const { initMocksServer } = await import("@/mocks")
    await initMocksServer()
}

// app/layout.tsx — fallback client (singleton guard mencegah double init)
if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
    const { initMocksClient } = await import("@/mocks")
    await initMocksClient()
}

// vitest.setup.ts — testing (direct import dari @/mocks/node)
import { server } from "@/mocks/node"
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

> Dokumentasi lengkap: [Pattern I — API Mocking](/patterns/api-mocking), [Stack — MSW](/stack/msw)

---

## Catatan Pengembangan Lanjutan

### Menambah Auth Middleware

- Taruh logika auth di `src/middleware.ts` (sudah ada slot di v1)
- Session check: gunakan `getSession()` dari `lib/session.ts`
- Protected routes: definisikan di `reg/routes.register.ts` dengan flag `protected: true`

### Menambah Error Boundary

- Per-feature: `app/[feature]/error.tsx` (Next.js built-in)
- Global: `app/error.tsx`
- Tidak ada perubahan convention — ini sudah bagian dari Next.js App Router
