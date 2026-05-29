# Folder Structure — Convention v2

## Root Structure

```
messages/         next-intl locale files — en.json, id.json
src/
├── app/          Next.js App Router — pages dan feature folders
├── api/          API call wrappers (fetch ke BE), dikelompokkan per feature
├── i18n/         Konfigurasi next-intl (routing, request config)
├── lib/          Third-party adapters dan shared utilities
├── reg/          Global registry: ROUTE_, QK_, EP_
└── store/        Global Zustand stores (dipakai 2+ feature)
```

> `store/` root hanya untuk state lintas feature. State satu feature → `app/[feature]/$store/`.

## Feature Structure

```
app/[feature]/
├── $action/      Server Actions — ACT_ prefix, "use server"
├── $element/     React components — SE_ (server) / CE_ (client) prefix
├── $function/    Helper functions — SFN_ (server) / CFN_ (client) prefix
├── $store/       Zustand stores untuk feature ini — useXxxStore
├── $route/       Next.js Route Handlers (BFF) — route.ts
├── $test/        Integration tests (Vitest + MSW)
└── page.tsx      HANYA: return <SE_FeatureLayout />
```

## API Layer Structure

```
api/[feature]/
├── [feature].ts          APIS_ (server-only) + APIC_ (client) functions
└── [feature].type.ts     IRq_, IRs_, T_ type definitions
```

## Lib Adapter Structure (Pattern G)

```
lib/[domain]/
├── index.ts      I_[Domain]Adapter interface + re-export implementasi
└── [library].ts  Concrete implementation
```

Contoh HTTP adapter:
```
lib/http/
├── index.ts      I_HttpClient, I_HttpClientConfig, I_RequestOptions
├── fetch.ts      createHttpClient() factory
├── server.ts     httpServer — auth dari cookies(), server-only
└── client.ts     httpClient (BE direct) + httpClientInternal (BFF/Route Handler)
```

## Registry Structure

```
reg/
├── routes.register.ts          ROUTE_ constants
├── query-keys.register.ts      QK_ query keys
└── [feature].endpoint.ts       EP_[Feature] path registry
```

## Global Route Handlers

```
app/api/[feature]/route.ts    Route Handler global (dipakai 2+ feature)
```

Feature-scoped Route Handler: `app/[feature]/$route/route.ts`

## Test Structure

```
Unit/component tests: co-located di samping file sumber
Integration tests:    app/[feature]/$test/
E2E tests:           e2e/[feature]/
```
