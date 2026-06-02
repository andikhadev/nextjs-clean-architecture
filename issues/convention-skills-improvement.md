# Skills Improvement Brief — Next.js Clean Architecture v2

## Konteks

Dokumen ini adalah hasil temuan dari **sesi testing skill `nextjs-ca`** yang digunakan di proyek nyata.
Tujuannya adalah panduan perbaikan skills di repository ini agar AI dapat menerapkan convention
secara konsisten, akurat, dan tanpa menggunakan asumsi saat tidak ada informasi di dokumentasi.

Temuan dicatat sebagai **Issues** dengan format terstruktur. Setiap issue mencakup apa yang terjadi,
akar masalah, dan rekomendasi perbaikan spesifik di repository ini.

---

## Issues Log

Format setiap issue:

```
### [ISS-XXX] Judul
- **Status:** open / resolved / pending-fix
- **Ditemukan saat:** konteks/task
- **Dampak:** low / medium / high
- **File skill yang perlu diperbaiki:** path relatif dari root repo convention
```

---

### [ISS-001] MSW: Inisialisasi menggunakan `NODE_ENV` bukan `NEXT_PUBLIC_API_MOCKING`

- **Status:** pending-fix
- **Ditemukan saat:** Scaffold feature welcome-banner, review MSW implementation
- **Dampak:** high — mock tidak bisa dikontrol secara eksplisit, aktif di semua dev environment tanpa opt-in
- **File skill yang perlu diperbaiki:** `references/stack/msw.md` (file baru)

**Yang terjadi:**

AI menggunakan `NODE_ENV === "development"` sebagai kondisi aktivasi MSW.

```ts
// ❌ Yang dihasilkan AI
if (process.env.NODE_ENV === "development") {
  await initMocksClient()
}
```

**Convention yang benar:**

```ts
// ✅ Convention
if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  await initMocksClient()
}
```

**Mengapa ini penting:** `NEXT_PUBLIC_API_MOCKING` memungkinkan toggle mocking secara independen
dari environment — misalnya bisa nonaktif di dev jika BE sudah siap, tanpa ubah kode.

**Akar masalah di skill:** Env variable `NEXT_PUBLIC_API_MOCKING` tidak disebutkan sama sekali
di `stack-guide.md`.

---

### [ISS-002] MSW: `mocks/index.ts` tidak dibuat — struktur file salah

- **Status:** pending-fix
- **Ditemukan saat:** Scaffold feature welcome-banner, review MSW implementation
- **Dampak:** high — `initMocksClient()`, `initMocksServer()`, dan `attachLogger` di tempat yang salah
- **File skill yang perlu diperbaiki:** `references/stack/msw.md` (file baru)

**Yang terjadi:**

AI membuat dua file tanpa `index.ts`:
```
mocks/
├── browser.ts  ← berisi setupWorker + initMocksClient + import handlers langsung
└── node.ts     ← berisi setupServer + initMocksServer + import handlers langsung
```

**Convention yang benar:**

```
mocks/
├── index.ts    ← orchestrator: handlers[], initMocksClient(), initMocksServer(), attachLogger()
├── browser.ts  ← HANYA: setupWorker(...handlers) + export worker
└── node.ts     ← HANYA: setupServer(...handlers) + export server
```

`instrumentation-client.ts` dan `instrumentation.ts` harus import dari `@/mocks` (index.ts),
bukan dari `@/mocks/browser` atau `@/mocks/node`.

**Akar masalah di skill:** Struktur 3 file dan tanggung jawab masing-masing tidak didokumentasikan
di `stack-guide.md`.

---

### [ISS-003] MSW: Naming file handler salah

- **Status:** pending-fix
- **Ditemukan saat:** Scaffold feature welcome-banner
- **Dampak:** medium — inkonsistensi naming antar feature
- **File skill yang perlu diperbaiki:** `references/stack/msw.md` (file baru)

**Yang terjadi:**

AI membuat file handler dengan nama `[resource].mock.ts`:
```
api/welcome-banner/welcome-banner.mock.ts
api/upload/upload.mock.ts
```

**Convention yang benar:**

```
api/welcome-banner/welcome-banner.mock-handler.ts
api/upload/upload.mock-handler.ts
```

**Akar masalah di skill:** Naming convention `[resource].mock-handler.ts` tidak disebutkan
di `stack-guide.md`.

---

### [ISS-004] MSW: `NEXT_RUNTIME` check ada di tempat yang salah

- **Status:** pending-fix
- **Ditemukan saat:** Scaffold feature welcome-banner — menyebabkan runtime error
- **Dampak:** high — `Module not found: @mswjs/interceptors/ClientRequest`
- **File skill yang perlu diperbaiki:** `references/stack/msw.md` (file baru)

**Yang terjadi:**

AI menaruh `NEXT_RUNTIME` check di `instrumentation.ts`:
```ts
// ❌ Yang dihasilkan AI
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "development") {
    const { initMocksServer } = await import("@/mocks/node")
    initMocksServer()
  }
}
```

**Convention yang benar:** `NEXT_RUNTIME` check ada di dalam `initMocksServer()` di `mocks/index.ts`.
`instrumentation.ts` hanya cek `NEXT_PUBLIC_API_MOCKING`:

```ts
// ✅ instrumentation.ts
export async function register() {
  if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") return
  const { initMocksServer } = await import("@/mocks")
  await initMocksServer()
}

// ✅ mocks/index.ts — initMocksServer yang benar
export async function initMocksServer() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const { server } = await import("./node")
  attachLogger(server, "SERVER")
  server.listen({ onUnhandledRequest: "bypass" })
}
```

**Akar masalah di skill:** Detail ini tidak ada di skill sama sekali.

---

### [ISS-005] `lib/http/` naming file tidak sesuai convention

- **Status:** pending-fix
- **Ditemukan saat:** Scaffold feature welcome-banner, tahap planning lib/http
- **Dampak:** medium — inkonsistensi naming, berbeda dari standard
- **File skill yang perlu diperbaiki:** `references/stack/http-adapter.md` (file baru)

**Yang terjadi:**

AI merencanakan:
```
lib/http/http.type.ts    ← tidak ada di convention
lib/http/http-server.ts  ← seharusnya server.ts
lib/http/http-client.ts  ← seharusnya client.ts
```

**Convention yang benar** (sudah ada di `folder-structure.md` tapi tidak cukup detail):
```
lib/http/
├── index.ts    ← I_HttpClient interface + re-export
├── fetch.ts    ← createHttpClient() factory
├── server.ts   ← httpServer (bukan http-server.ts)
└── client.ts   ← httpClient + httpClientInternal (bukan http-client.ts)
```

**Akar masalah di skill:** `folder-structure.md` hanya mencantumkan nama file tanpa isi/tanggung jawab
masing-masing. Tidak ada file `references/stack/http-adapter.md` yang memuat detail lengkap.

---

### [ISS-006] Skill `/new-feature` tidak memaksa pembacaan reference files sebelum generate

- **Status:** pending-fix
- **Ditemukan saat:** Keseluruhan flow `/new-feature` session testing
- **Dampak:** high — semua issue di atas (ISS-001 s/d ISS-005) dapat terjadi berulang di fitur manapun
- **File skill yang perlu diperbaiki:** `new-feature/SKILL.md`

**Yang terjadi:**

Skill `/new-feature` memiliki alur 6 pertanyaan → generate, tanpa langkah wajib membaca
reference files `nextjs-ca`. AI menjalankan scaffold berdasarkan general knowledge.

**Perbaikan yang diperlukan:**

Tambahkan section di `new-feature/SKILL.md` setelah 6 pertanyaan dijawab:

```markdown
## Stack Files — Wajib Dibaca Sebelum Generate

Berdasarkan jawaban pertanyaan di atas, baca file berikut sebelum melakukan generate apapun.
Jangan lanjut ke tahap generate jika file yang relevan belum dibaca.

| Kondisi | File yang harus dibaca |
|---------|----------------------|
| Selalu | references/folder-structure.md |
| Selalu | references/naming.md |
| Ada API endpoint dari BE | references/stack/http-adapter.md |
| MSW mock dikonfirmasi | references/stack/msw.md |
| Ada form (TanStack Form) | references/stack/tanstack-form.md |
| Client fetching (TanStack Query) | references/stack/tanstack-query.md |
| Ada Zustand store | references/stack/zustand.md |
| Ada i18n | references/stack/next-intl.md |
```

---

### [ISS-007] Post-generate tidak ada verifikasi terhadap convention

- **Status:** pending-fix
- **Ditemukan saat:** Keseluruhan session testing
- **Dampak:** medium — violation baru terdeteksi hanya setelah user menegur, bukan proaktif
- **File skill yang perlu diperbaiki:** `new-feature/SKILL.md`

**Yang terjadi:**

Semua violation (ISS-001 s/d ISS-005) baru ditemukan setelah user secara eksplisit meminta
pengecekan convention. Tidak ada langkah self-check di akhir generate.

**Perbaikan yang diperlukan:**

Tambahkan section di akhir `new-feature/SKILL.md`:

```markdown
## Post-generate Verification

Setelah generate semua file, bandingkan hasil terhadap reference files yang telah dibaca:

| Area | Yang Dicek |
|------|-----------|
| MSW setup | env variable, struktur mocks/, naming handler, lokasi initMocks* |
| HTTP adapter | nama file, jumlah file, exports |
| Naming symbols | prefix SE_, CE_, ACT_, APIS_, APIC_, EP_, ZS_, dll |
| Pattern yang dipilih | sesuai use case di patterns.md |
| Folder structure | $element, $action, $function, $store |

Jika ada perbedaan → perbaiki sebelum lapor selesai ke developer.
```

---

## Diagnosis Sistemik

Semua issue di atas bersumber dari **dua layer masalah**:

**Layer 1 — Konten skill tidak lengkap**
Reference files hanya mencatat *bahwa* suatu library dipakai, tanpa menjelaskan *bagaimana*
detail implementasinya. AI mengisi kekosongan dengan asumsi.

**Layer 2 — Tidak ada jaminan reference files dibaca**
Instruksi "baca reference files" di SKILL.md mudah dilewati karena tidak ada trigger eksplisit
berbasis konteks stack yang sedang di-scaffold.

Layer 2 lebih fundamental — menyelesaikan Layer 1 saja tidak cukup.

---

## Solusi: Restructure References + Trigger di `/new-feature`

### Struktur Baru `references/`

```
references/
├── folder-structure.md    ← tetap, selalu dibaca
├── naming.md              ← tetap, selalu dibaca
├── patterns.md            ← tetap, selalu dibaca
├── key-rules.md           ← tetap, selalu dibaca
└── stack/
    ├── msw.md             ← ISS-001, ISS-002, ISS-003, ISS-004
    ├── http-adapter.md    ← ISS-005
    ├── tanstack-form.md   ← buat saat diverifikasi di proyek nyata
    ├── tanstack-query.md  ← buat saat diverifikasi di proyek nyata
    └── ...
```

### Prinsip Penulisan Setiap `stack/*.md`

Setiap file harus cukup lengkap sehingga AI bisa mengimplementasikan stack tersebut **tanpa asumsi**:

- Struktur file lengkap + tanggung jawab masing-masing
- Environment variables yang dibutuhkan
- Contoh kode konkret (bukan hanya deskripsi prosa)
- Aturan wajib dan anti-pattern

---

## Prioritas Pekerjaan

| Prioritas | Task | Issue yang diselesaikan |
|-----------|------|------------------------|
| 1 | Buat `references/stack/msw.md` | ISS-001, ISS-002, ISS-003, ISS-004 |
| 2 | Buat `references/stack/http-adapter.md` | ISS-005 |
| 3 | Update `new-feature/SKILL.md` — tambah trigger + post-verify | ISS-006, ISS-007 |

---

## Cara Menambahkan Issue Baru

Saat menemukan issue baru dari sesi testing:

1. Tambahkan entry baru di section **Issues Log** dengan ID berikutnya (`ISS-008`, dst.)
2. Isi semua field: status, ditemukan saat, dampak, file yang perlu diperbaiki
3. Sertakan contoh kode "yang terjadi" vs "convention yang benar"
4. Tambahkan ke tabel **Prioritas Pekerjaan** jika belum ada

---

## Catatan untuk AI yang Mengerjakan Perbaikan Ini

- Jangan ubah konten convention yang sudah ada dan sudah terbukti benar
- Fokus pada **menambahkan detail** yang hilang, bukan menulis ulang dari awal
- Setiap contoh kode harus mencerminkan pola yang sudah digunakan di proyek nyata
- Gunakan bahasa dan gaya yang konsisten dengan file referensi yang sudah ada
- Setelah selesai membuat file baru di `references/stack/`, update trigger table
  di `new-feature/SKILL.md` jika stack tersebut belum ada di tabelnya
