# MSW (Mock Service Worker) — Implementation Reference

## Environment Variable

MSW dikontrol via `NEXT_PUBLIC_API_MOCKING`, **bukan** `NODE_ENV`.

```ts
// ❌ Salah
if (process.env.NODE_ENV === "development") {
  await initMocksClient()
}

// ✅ Benar
if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  await initMocksClient()
}
```

Set di `.env.local`:
```
NEXT_PUBLIC_API_MOCKING=enabled
```

Mengapa: memungkinkan toggle mocking independen dari environment — bisa nonaktif di dev jika BE sudah ready, tanpa ubah kode.

---

## Struktur File `mocks/`

```
mocks/
├── index.ts    ← orchestrator: handlers[], initMocksClient(), initMocksServer(), attachLogger()
├── browser.ts  ← HANYA: setupWorker(...handlers) + export worker
└── node.ts     ← HANYA: setupServer(...handlers) + export server
```

### `mocks/browser.ts`

```ts
import { setupWorker } from "msw/browser"
import { handlers } from "./index"

export const worker = setupWorker(...handlers)
```

### `mocks/node.ts`

```ts
import { setupServer } from "msw/node"
import { handlers } from "./index"

export const server = setupServer(...handlers)
```

### `mocks/index.ts`

```ts
import { handlers as welcomeBannerHandlers } from "@/api/welcome-banner/welcome-banner.mock-handler"

export const handlers = [
  ...welcomeBannerHandlers,
  // tambahkan handler lain di sini
]

export function attachLogger(
  instance: { events: { on: Function } },
  label: string
) {
  instance.events.on("request:start", ({ request }: { request: Request }) => {
    console.log(`[MSW ${label}]`, request.method, request.url)
  })
}

export async function initMocksClient() {
  if (typeof window === "undefined") return
  const { worker } = await import("./browser")
  attachLogger(worker, "CLIENT")
  await worker.start({ onUnhandledRequest: "bypass" })
}

export async function initMocksServer() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return  // ← check ada di sini
  const { server } = await import("./node")
  attachLogger(server, "SERVER")
  server.listen({ onUnhandledRequest: "bypass" })
}
```

---

## Setup Dev

### `instrumentation-client.ts` (client — primary)

```ts
export async function register() {
  if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") return
  const { initMocksClient } = await import("@/mocks")
  await initMocksClient()
}
```

### `instrumentation.ts` (server)

`NEXT_RUNTIME` check **tidak** ada di sini — ada di dalam `initMocksServer()`.

```ts
// ✅ Benar
export async function register() {
  if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") return
  const { initMocksServer } = await import("@/mocks")
  await initMocksServer()
}

// ❌ Salah — NEXT_RUNTIME check di instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "development") {
    const { initMocksServer } = await import("@/mocks/node")  // ← salah import path
    initMocksServer()
  }
}
```

### Fallback — `layout.tsx`

Jika mock perlu tersedia sebelum render pertama:

```ts
import { initMocksClient } from "@/mocks"

if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  initMocksClient() // singleton guard di dalam — aman dipanggil berkali-kali
}
```

---

## Mock Handler — Naming & Lokasi

```
api/[feature]/[resource].mock-handler.ts    ✅
api/[feature]/[resource].mock.ts            ❌ salah suffix
```

Contoh:
```
api/welcome-banner/welcome-banner.mock-handler.ts   ✅
api/upload/upload.mock-handler.ts                   ✅
```

Isi handler — selalu gunakan `EP_` registry untuk URL:

```ts
import { http, HttpResponse } from "msw"
import { EP_WelcomeBanner } from "@/reg/welcome-banner.endpoint"
import type { IRs_WelcomeBanner } from "./welcome-banner.type"

export const handlers = [
  http.get(EP_WelcomeBanner.detail(), () => {
    return HttpResponse.json<IRs_WelcomeBanner>({
      title: "Welcome",
      subtitle: "Hello World",
    })
  }),
]
```

---

## Setup Test

```ts
import { server } from "@/mocks/node"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Override per-test:

```ts
import { http, HttpResponse } from "msw"
import { EP_WelcomeBanner } from "@/reg/welcome-banner.endpoint"

it("handles error state", async () => {
  server.use(
    http.get(EP_WelcomeBanner.detail(), () =>
      HttpResponse.json({ error: "Not found" }, { status: 404 })
    )
  )
  // ... test body
})
```

---

## Anti-patterns

| Anti-pattern | Yang Benar |
|-------------|-----------|
| `NODE_ENV === "development"` sebagai kondisi MSW | `NEXT_PUBLIC_API_MOCKING === "enabled"` |
| `NEXT_RUNTIME` check di `instrumentation.ts` | Check ada di dalam `initMocksServer()` di `mocks/index.ts` |
| Import dari `@/mocks/browser` di instrumentation | Import dari `@/mocks` (index.ts) |
| `initMocksClient()` ada di `browser.ts` | `initMocksClient()` ada di `mocks/index.ts` |
| Naming file `[resource].mock.ts` | `[resource].mock-handler.ts` |
| URL hardcode di handler | Gunakan `EP_[Feature]` dari registry |
