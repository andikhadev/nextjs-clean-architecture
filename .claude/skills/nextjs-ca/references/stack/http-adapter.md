# HTTP Adapter — Implementation Reference

## Struktur File `lib/http/`

```
lib/http/
├── index.ts    ← I_HttpClient interface + I_HttpClientConfig + re-export
├── fetch.ts    ← createHttpClient() factory
├── server.ts   ← httpServer — instance untuk APIS_ (server-only, cookies auth)
└── client.ts   ← httpClient + httpClientInternal — instance untuk APIC_
```

Nama file: `server.ts` dan `client.ts` (bukan `http-server.ts` atau `http-client.ts`).

---

## Tiga Instance

| Instance | Dipakai di | Ke mana | Auth |
|----------|-----------|---------|------|
| `httpServer` | APIS_, SFN_ | BE langsung | cookies() server-side |
| `httpClient` | APIC_ via TanStack Query | BE langsung | env base URL |
| `httpClientInternal` | APIC_ via TanStack Query | Route Handler (BFF) | tidak perlu auth |

---

## `lib/http/index.ts`

```ts
export interface I_HttpClientConfig {
  baseUrl: string
  defaultHeaders?: Record<string, string>
}

export interface I_RequestOptions {
  headers?: Record<string, string>
  cache?: RequestCache
  next?: NextFetchRequestConfig
}

export interface I_HttpClient {
  get<T>(path: string, options?: I_RequestOptions): Promise<T>
  post<T>(path: string, body: unknown, options?: I_RequestOptions): Promise<T>
  put<T>(path: string, body: unknown, options?: I_RequestOptions): Promise<T>
  patch<T>(path: string, body: unknown, options?: I_RequestOptions): Promise<T>
  delete<T>(path: string, options?: I_RequestOptions): Promise<void>
}

export { httpServer } from "./server"
export { httpClient, httpClientInternal } from "./client"
```

---

## `lib/http/fetch.ts`

```ts
import type { I_HttpClient, I_HttpClientConfig, I_RequestOptions } from "./index"

export function createHttpClient(config: I_HttpClientConfig): I_HttpClient {
  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: I_RequestOptions
  ): Promise<T> {
    const res = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...config.defaultHeaders,
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: options?.cache,
      next: options?.next,
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${method} ${path}`)
    }

    return res.json() as Promise<T>
  }

  return {
    get: (path, options) => request("GET", path, undefined, options),
    post: (path, body, options) => request("POST", path, body, options),
    put: (path, body, options) => request("PUT", path, body, options),
    patch: (path, body, options) => request("PATCH", path, body, options),
    delete: (path, options) => request("DELETE", path, undefined, options),
  }
}
```

---

## `lib/http/server.ts`

Server-only — membaca cookies untuk auth.

```ts
import "server-only"
import { cookies } from "next/headers"
import { createHttpClient } from "./fetch"
import type { I_HttpClient, I_RequestOptions } from "./index"

function createServerHttpClient(): I_HttpClient {
  const base = createHttpClient({
    baseUrl: process.env.BACKEND_URL ?? "",
  })

  async function withAuth(options?: I_RequestOptions): Promise<I_RequestOptions> {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
    return {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    }
  }

  return {
    get: async (path, options) => base.get(path, await withAuth(options)),
    post: async (path, body, options) => base.post(path, body, await withAuth(options)),
    put: async (path, body, options) => base.put(path, body, await withAuth(options)),
    patch: async (path, body, options) => base.patch(path, body, await withAuth(options)),
    delete: async (path, options) => base.delete(path, await withAuth(options)),
  }
}

export const httpServer = createServerHttpClient()
```

---

## `lib/http/client.ts`

```ts
import { createHttpClient } from "./fetch"

// Ke BE langsung — gunakan di APIC_ yang fetch ke BE
export const httpClient = createHttpClient({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
})

// Ke Route Handler (BFF) — gunakan di APIC_ yang fetch ke /api/*
export const httpClientInternal = createHttpClient({
  baseUrl: typeof window !== "undefined" ? window.location.origin : "",
})
```

---

## Penggunaan di APIS_ dan APIC_

```ts
// api/user/user.ts

import { httpServer } from "@/lib/http/server"
import { httpClient } from "@/lib/http/client"
import { EP_User } from "@/reg/user.endpoint"
import type { IRs_UserList, IRs_UserDetail, IRq_CreateUser } from "./user.type"

// APIS_ — server-only, dipanggil dari SE_, ACT_, SFN_
export const APIS_GetUsers = (): Promise<IRs_UserList> =>
  httpServer.get(EP_User.list())

export const APIS_GetUser = (id: string): Promise<IRs_UserDetail> =>
  httpServer.get(EP_User.detail(id))

export const APIS_CreateUser = (body: IRq_CreateUser): Promise<IRs_UserDetail> =>
  httpServer.post(EP_User.list(), body)

// APIC_ — client-accessible, dipanggil dari CE_ via TanStack Query
export const APIC_GetUsers = (): Promise<IRs_UserList> =>
  httpClient.get(EP_User.list())
```

---

## Jika `lib/http/` Belum Ada

Saat scaffold feature yang butuh API endpoint, tanya developer:
> "Apakah `lib/http/` sudah ada di project? Jika belum, perlu scaffold HTTP adapter dulu sebelum generate feature ini."

Jangan generate `fetch()` langsung di file APIS_/APIC_.

---

## Anti-patterns

```ts
// ❌ Salah — fetch langsung di feature file
export async function APIS_GetUsers() {
  const res = await fetch(`${process.env.BACKEND_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

// ✅ Benar — gunakan httpServer adapter
export const APIS_GetUsers = (): Promise<IRs_UserList> =>
  httpServer.get(EP_User.list())
```

```
// ❌ Nama file salah
lib/http/http-server.ts
lib/http/http-client.ts
lib/http/http.type.ts

// ✅ Nama file benar
lib/http/server.ts
lib/http/client.ts
lib/http/index.ts   ← interface, bukan types
```
