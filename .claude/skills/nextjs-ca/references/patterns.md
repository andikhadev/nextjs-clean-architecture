# Patterns — Convention v2

## Pattern A — Server Fetch

**Kapan:** Data dibutuhkan saat halaman pertama kali dimuat, SEO-sensitive, atau tidak butuh real-time update.

**Flow:**
```
page.tsx → SE_Layout → SFN_/APIS_ → BE
```

**Rule:** APIS_ dipanggil dari SE_ atau SFN_ saja. Tidak boleh dari CE_.

```typescript
// server.layout.tsx
export async function SE_FeatureLayout() {
  const data = await APIS_GetData()
  return <CE_Content initialData={data} />
}
```

---

## Pattern B — Client Fetch (TanStack Query)

**Kapan:** Data butuh real-time update, refetch setelah mutasi, atau conditional fetching.

**Flow:**
```
CE_ → useQuery(APIC_) → BE atau Route Handler
```

**Rule:** APIC_ dipakai di CE_ via TanStack Query. Gunakan `initialData` dari server untuk hydration.

```typescript
// client.content.tsx
const { data } = useQuery({
  queryKey: QK_Feature.list(),
  queryFn: APIC_GetData,
  initialData,
})
```

---

## Pattern C — Form Submit (TanStack Form + Zod + Server Action)

**Kapan:** Ada form yang submit data ke server.

**Flow:**
```
CE_Form → ACT_Submit (Server Action) → ZS_ validate → APIS_ → BE
```

**Rule:** Zod validation wajib ada di Server Action sebelum memanggil APIS_.

```typescript
// action.submit.ts
export async function ACT_Submit(input: unknown) {
  const parsed = ZS_Schema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }
  await APIS_Create(parsed.data)
  return { success: true }
}
```

---

## Pattern D — Cross-component State: URL Search Params (nuqs)

**Kapan:** State perlu persist di URL (sharable, bookmarkable) — filter, pagination, search query, tab aktif.

**Rule:** Gunakan nuqs (`useQueryState`) bukan useState untuk URL-persistent state.

```typescript
const [search, setSearch] = useQueryState("q")
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))
```

---

## Pattern E — Cross-component State: Zustand

**Kapan:** State transient yang dibagi antar CE_ dalam feature yang sama — modal open/close, selected item, toggle state.

**Rule:** Feature-scoped store di `$store/`, global store di `store/` root (hanya jika 2+ feature).

```typescript
// ui.store.ts
export const useFeatureStore = create<I_FeatureStore>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}))
```

---

## Pattern F — shadcn/ui Extension

**Kapan:** Butuh customisasi atau komposisi komponen shadcn/ui.

**Rule:** Jangan modifikasi `components/ui/` langsung. Buat wrapper di CE_ atau `lib/ui/`.

```typescript
// client.submit-button.tsx — wrapper dengan loading state
export function CE_SubmitButton({ isLoading, ...props }: I_SubmitButtonProps) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading ? <Loader2 className="animate-spin" /> : props.children}
    </Button>
  )
}
```

---

## Pattern G — Library Adapter

**Kapan:** Menggunakan third-party library yang mungkin di-swap atau butuh abstraksi.

**Rule:** Buat adapter di `lib/[domain]/`. Consumer import dari `@/lib/[domain]`, bukan dari library langsung.

**Adapter Scope Rule:** Generate hanya method yang dikonfirmasi dibutuhkan sekarang.

```
lib/cache/
├── index.ts    → I_CacheAdapter interface + export { cache }
└── ioredis.ts  → concrete implementation
```

### HTTP Adapter (contoh Pattern G)

Tiga instance untuk tiga konteks berbeda:

| Instance | Untuk | Auth |
|----------|-------|------|
| `httpServer` | APIS_ (server-side) | cookies() dari next/headers |
| `httpClient` | APIC_ → BE langsung | NEXT_PUBLIC_API_BASE_URL |
| `httpClientInternal` | APIC_ → Route Handler (BFF) | tidak ada (relative URL) |

**BFF Proxy Pattern:**
```
CE_ → APIC_(httpClientInternal) → Route Handler → APIS_(httpServer) → BE
```
Client tidak tahu URL BE. Session token tidak terekspos ke browser.

---

## Pattern H — i18n (next-intl)

**Kapan:** Ada user-facing string yang perlu diterjemahkan.

**Rule:** Semua string user-facing wajib via `useTranslations` (CE_) atau `getTranslations` (SE_). Tidak boleh hardcode.

```typescript
// CE_ — client component
const t = useTranslations("FeatureName")
return <h1>{t("title")}</h1>

// SE_ — server component
const t = await getTranslations("FeatureName")
return <h1>{t("title")}</h1>
```

---

## Pattern I — API Mocking (MSW)

**Kapan:** Perlu mock API untuk development atau testing sebelum BE siap.

**Setup:**
- Dev: aktifkan via `instrumentation-client.ts` (client) + `instrumentation.ts` (server)
- Test: import `server` langsung dari `@/mocks/node`

**EP_ Registry:** Semua endpoint path didefinisikan di `reg/[feature].endpoint.ts` sebagai `EP_[Feature]` — dipakai oleh APIS_/APIC_ dan MSW handler, agar tidak ada duplikasi string URL.

```typescript
// reg/user.endpoint.ts
export const EP_User = {
  list: () => "/api/users",
  detail: (id: string) => `/api/users/${id}`,
}
```

---

## Pattern J — Testing Convention

**Unit/Component test:** Co-located di samping file sumber (`*.test.ts`, `*.test.tsx`)
**Integration test:** `app/[feature]/$test/`
**E2E test:** `e2e/[feature]/` dengan Playwright

**Server Action test:** Import langsung sebagai fungsi, `vi.mock('next/headers')` + `vi.mock('next/navigation')`

**SE_ dan page.tsx:** Tidak di-unit-test — cukup E2E via Playwright.
