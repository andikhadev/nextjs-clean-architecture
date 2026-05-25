---
title: Choosing the Right Pattern
description: Decision guide berbasis kondisi — untuk kasus X, gunakan pattern mana. Setiap keputusan disertai link ke halaman pattern lengkap.
---

## Cara Menggunakan Halaman Ini

Baca kondisi dari atas ke bawah. Temukan kondisi yang sesuai dengan kebutuhan kamu, lalu ikuti link ke halaman pattern yang relevan untuk contoh kode lengkap.

---

## Data Fetching

### Butuh data dari backend?

**→ Data dibutuhkan saat halaman pertama render dan tidak perlu update tanpa navigasi**

Gunakan [Pattern A — Server Fetch](/patterns/server-fetch).

```
page.tsx → SE_ component → APIS_ → CE_ via props
```

Cocok untuk: halaman statis, SSR, data yang berubah saat user navigasi ke halaman baru.

---

**→ Data perlu di-refresh tanpa navigasi, polling otomatis, atau bereaksi pada interaksi user**

Gunakan [Pattern B — Client Fetch](/patterns/client-fetch).

```
CE_ component → useQuery(QK_, APIC_) → render
```

Cocok untuk: tabel yang refresh setelah delete, dashboard dengan polling, list yang reaktif terhadap filter.

> **Perlu data awal cepat + reaktivitas?** Kombinasikan keduanya: Pattern A prefetch data awal, Pattern B handle refresh selanjutnya via `initialData` dan `HydrationBoundary`.

---

## State Lintas Component

### Ada state yang perlu dibagikan antar component?

**→ State yang perlu di-bookmark, di-share via URL, atau diakses saat halaman pertama load**

Gunakan [Pattern D — URL Search Params](/patterns/url-params).

```
CE_ → useQueryState (nuqs) → page re-render → SE_ baca params → data baru
```

Cocok untuk: search query, filter aktif, nomor halaman, tab aktif yang perlu shareable.

---

**→ State transient yang hanya relevan di sesi saat ini**

Gunakan [Pattern E — Zustand](/patterns/zustand).

```
CE_A dispatch → store → CE_B subscribe → re-render
```

Cocok untuk: modal open/close, selected row, sidebar toggle, multi-step form state.

> **Tips pilih D vs E:** Tanya "apakah user perlu bisa bookmark atau share state ini?" — ya → D, tidak → E.

---

## Form

### Ada form yang perlu di-submit ke server?

Gunakan [Pattern C — Form Submit](/patterns/form-submit).

```
CE_ form (useForm) → onSubmit → ACT_ → ZS_ safeParse → APIS_ → redirect/error
```

Berlaku untuk semua jenis form: create, update, delete. Validasi Zod terjadi dua kali — di client (real-time feedback) dan di Server Action (keamanan).

---

## UI Components

### Pakai shadcn/ui sebagai base komponen?

Gunakan [Pattern F — shadcn/ui Extension](/patterns/shadcn).

```
shadcn component di components/ui/ → wrapper CE_/SE_ di $element/ atau lib/
```

Aturan utama: **jangan pernah modifikasi file di `components/ui/` langsung** — selalu buat wrapper.

---

## Library Eksternal

### Integrasi ke library yang bisa diganti (cache, storage, email, dll.)?

Gunakan [Pattern G — Library Adapter](/patterns/lib-adapter).

```
lib/[domain]/index.ts (interface) ← lib/[domain]/[library].ts (implementasi)
```

Consumer hanya import dari `lib/[domain]/`. Ganti library = ubah satu file implementasi, consumer tidak berubah.

---

## i18n

### Project menggunakan next-intl dan butuh teks multi-bahasa?

Gunakan [Pattern H — i18n dengan next-intl](/patterns/i18n).

```
messages/[locale].json (namespace per feature)
→ useTranslations("Feature") di CE_
→ getTranslations("Feature") di SE_
```

Pattern ini **opsional** — hanya gunakan jika project membutuhkan multi-bahasa.

---

## Kombinasi Pattern

Pattern-pattern di atas bisa dikombinasikan dalam satu feature. Contoh halaman **User Management dengan search dan modal**:

| Bagian | Pattern |
|--------|---------|
| Load data awal | [A — Server Fetch](/patterns/server-fetch) |
| Search/filter | [D — URL Search Params](/patterns/url-params) |
| Refresh setelah mutasi | [B — Client Fetch](/patterns/client-fetch) |
| Modal detail | [E — Zustand](/patterns/zustand) |
| Form create/edit | [C — Form Submit](/patterns/form-submit) |
| Komponen UI | [F — shadcn Extension](/patterns/shadcn) |

Lihat contoh lengkap di [Example — User Management](/examples/user-management).
