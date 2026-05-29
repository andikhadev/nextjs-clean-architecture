# /scaffold-adapter — Scaffold Library Adapter (Pattern G)

Buat adapter baru di `lib/[domain]/` mengikuti Pattern G (Library Abstraction).

## Adapter Scope Rule (wajib diikuti)

- Tanya operasi yang dibutuhkan **sekarang** — bukan "mungkin butuh nanti"
- Tanya fitur spesifik sebelum generate — jangan asumsi
- Generate interface hanya dengan method yang dikonfirmasi
- Developer extend sendiri jika butuh lebih

## Pertanyaan (tanya satu per satu, tunggu jawaban)

1. **Domain name** — nama domain adapter ini
   Contoh: `cache`, `storage`, `mailer`, `queue`, `http`, `search`

2. **Library yang di-wrap** — nama package yang digunakan
   Contoh: `ioredis`, `nodemailer`, `@aws-sdk/client-s3`, `@elastic/elasticsearch`

3. **Operasi yang dibutuhkan sekarang** — list method yang akan dipanggil
   Contoh cache: `get`, `set`, `del`
   Contoh mailer: `send`
   Contoh storage: `upload`, `getUrl`, `delete`

4. **Fitur spesifik** — tanya sesuai domain:
   - Cache: perlu TTL/expiry? Pub/sub? Pipeline? Namespace prefix?
   - Storage: perlu signed URL? Presigned upload? Folder/prefix?
   - Mailer: perlu template? Attachments? Multiple recipients?
   - Queue: perlu delay? Priority? Dead letter queue?
   - HTTP: perlu baseUrl? Auth header? Retry?

5. **Error handling** — custom error class atau throw generic dan biarkan caller handle?

## Generate

```
lib/[domain]/
├── index.ts        ← interface + re-export implementasi
└── [library].ts    ← concrete implementation
```

### `index.ts`

```typescript
// Interface dengan method yang dikonfirmasi saja
export interface I_[Domain]Adapter {
  // hanya method yang dikonfirmasi di pertanyaan 3-4
}

// Re-export implementasi dengan nama domain (bukan nama library)
export { [domainName] } from "./[library]"
```

### `[library].ts`

```typescript
import [library] from "[library-package]"

// Implementasi concrete
// Nama export cocok dengan yang di-re-export di index.ts
```

## Rules

- `index.ts` tidak boleh import langsung dari library — hanya type imports
- Consumer import dari `@/lib/[domain]`, bukan dari `@/lib/[domain]/[library]`
- Nama export dari `index.ts` adalah nama domain yang deskriptif (contoh: `cache`, `mailer`, `storage`)
- Jika library butuh singleton pattern (koneksi Redis, dsb) → implementasi di `[library].ts`

## Contoh Hasil

```
lib/cache/
├── index.ts    → export I_CacheAdapter, export { cache } from "./ioredis"
└── ioredis.ts  → const cache: I_CacheAdapter = { get, set, del }
```

Penggunaan di SFN_ atau ACT_:
```typescript
import { cache } from "@/lib/cache"
const value = await cache.get("key")
```
