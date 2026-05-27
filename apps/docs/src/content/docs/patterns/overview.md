---
title: Pattern Guide
description: 8 pattern data flow untuk Next.js 15+ App Router — kapan pakai mana.
---

## Tujuan

Pattern guide ini menjawab satu pertanyaan: **"Untuk kasus X, saya harus pakai cara apa?"**

Setiap pattern mendefinisikan satu alur data yang spesifik. Untuk decision guide interaktif berbasis kondisi, lihat **[Choosing the Right Pattern](/patterns/choosing)**. Atau gunakan tabel ringkasan di bawah untuk langsung lompat ke halaman detail pattern yang relevan.

---

## Decision Table

| Pattern | Nama | Gunakan ketika... |
|---------|------|-------------------|
| **A** | Server Fetch | Data dibutuhkan saat halaman pertama render dan tidak perlu interaktivitas |
| **B** | Client Fetch (TanStack Query) | Data perlu di-refresh tanpa navigasi, polling, atau tergantung interaksi user |
| **C** | Form Submit | Semua form submission — create, update, delete — dengan validasi |
| **D** | URL Search Params | Search, filter, pagination — state yang perlu di-share atau di-bookmark |
| **E** | Zustand | Modal open/close, selected row, sidebar toggle — state transient yang tidak perlu di URL |
| **F** | shadcn/ui Extension | Membuat UI component yang menggunakan shadcn sebagai base |
| **G** | Library Adapter | Integrasi ke library eksternal yang bisa diganti (Redis, S3, email, dll.) |
| **H** | i18n dengan next-intl | Semua teks yang tampil ke user — label, pesan error, placeholder |
| **I** | API Mocking (MSW) | API contract sudah disepakati tapi backend belum siap, atau butuh isolasi di testing |

---

## Alur Data per Pattern

### Pattern A — Server Fetch

```
page.tsx → SE_ component → APIS_ → data → CE_ via props
```

Data di-fetch di Server Component, hasilnya diteruskan ke Client Component via props.
Cocok untuk halaman yang perlu SSR atau data yang tidak berubah tanpa navigasi.

---

### Pattern B — Client Fetch (TanStack Query)

```
CE_ component → useQuery(QK_, APIC_) → render
```

Data di-fetch di Client Component menggunakan TanStack Query.
`QK_` (query key) didefinisikan di `reg/query-keys.register.ts`.

---

### Pattern C — Form Submit

```
CE_ form (useForm) → onSubmit → ACT_ → ZS_ safeParse → APIS_ → redirect/error
```

Validasi dilakukan dua kali: di client (real-time feedback) dan di server action (keamanan).
Zod schema (`ZS_`) dipakai oleh keduanya.

---

### Pattern D — URL Search Params

```
CE_SearchBar → useQueryState (nuqs) → page re-render → SE_ baca params → data baru
```

`shallow: false` memastikan perubahan URL men-trigger re-render Server Component.
Untuk multiple params, gunakan `useQueryStates` dari nuqs.

---

### Pattern E — Zustand

```
CE_A dispatch → store → CE_B subscribe → re-render
```

Store di-definisikan di `$store/[module].store.ts` dalam feature folder.
Store global (lintas feature) ada di `store/` di root.

---

### Pattern F — shadcn/ui Extension

```
shadcn component di components/ui/ → wrapper CE_/SE_ di $element/ atau lib/
```

Komponen shadcn **tidak boleh dimodifikasi langsung**. Selalu buat wrapper.

---

### Pattern G — Library Adapter

```
lib/[domain]/index.ts (interface) ← lib/[domain]/[library].ts (implementasi)
Consumer hanya import dari lib/[domain]/
```

Ganti library = hanya ubah file implementasi dan re-export di `index.ts`. Consumer tidak berubah.

---

### Pattern H — i18n dengan next-intl

```
messages/[locale].json (namespace per feature)
→ useTranslations("Feature") di CE_
→ getTranslations("Feature") di SE_
```

Tidak ada folder `$lang/` di dalam feature. Semua string ada di `messages/`.

---

### Pattern I — API Mocking (MSW)

```
EP_[Feature] (path constants)
→ APIC_/APIS_ (production fetch) + mock-handler.ts (MSW)
→ aktif via env flag (dev) atau setupServer (testing)
```

`EP_` adalah single source of truth untuk path API. Fungsi fetch dan mock handler import dari `EP_` yang sama — tidak ada duplikasi path.

---

## Aturan Kombinasi

Pattern-pattern ini bisa dikombinasikan dalam satu feature:

**Contoh: Halaman User List dengan search dan modal detail**

| Bagian | Pattern |
|--------|---------|
| Load data awal | A (Server Fetch) |
| Search/filter | D (URL Search Params) |
| Refresh data setelah search | B (Client Fetch) |
| Modal detail | E (Zustand) |
| Form edit | C (Form Submit) |
| Teks label | H (i18n) |

---

## Kapan Tidak Pakai Pattern

- **Pattern A + B bersamaan untuk data yang sama** — pilih salah satu. Gunakan A jika data statis saat render, B jika perlu polling atau reactive update.
- **Pattern D untuk state yang tidak relevan di URL** — gunakan E (Zustand) untuk state yang hanya bermakna di sesi saat ini.
- **Pattern G untuk library yang tidak akan pernah diganti** — boleh import langsung dari `lib/utils.ts` untuk utility sederhana.
