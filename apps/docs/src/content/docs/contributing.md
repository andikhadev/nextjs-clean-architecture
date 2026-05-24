---
title: Contributing
description: Panduan menambah halaman baru, memperbarui konten, dan mengikuti style guide dokumentasi ini.
---

## Tujuan

Halaman ini menjelaskan cara berkontribusi ke dokumentasi convention ini — menambah halaman baru, memperbarui konten yang sudah ada, dan memastikan konsistensi style.

---

## Menambah Halaman Baru

Ikuti langkah berikut untuk menambahkan halaman dokumentasi baru:

**1. Buat file MDX di folder yang sesuai**

```
apps/docs/src/content/docs/
├── structure/    ← halaman struktur folder
├── naming/       ← halaman naming convention
├── patterns/     ← halaman pattern guide
└── stack/        ← halaman panduan per library/stack
```

Contoh untuk halaman baru tentang next-intl:
```
apps/docs/src/content/docs/stack/next-intl.mdx
```

**2. Tambahkan entry di sidebar**

Buka `apps/docs/astro.config.mjs` dan tambahkan entry di bawah section yang sesuai:

```js
// apps/docs/astro.config.mjs
{
  label: 'Stack Guide',
  items: [
    { label: 'next-intl', slug: 'stack/next-intl' },
    // tambah di sini
  ],
}
```

**3. Ikuti struktur halaman MDX**

Setiap halaman harus mengikuti template berikut:

```mdx
---
title: Judul Halaman
description: Satu kalimat deskripsi untuk SEO dan AI indexing.
---

## Tujuan

[Satu paragraf: apa ini, kapan dipakai, kenapa ada]

## Aturan

[Tabel atau list rules yang konkret]

## Contoh

[Code block yang bisa langsung copy-paste]

## Kapan Tidak Pakai Ini

[Edge cases, anti-patterns yang perlu dihindari]
```

**4. Jika ada perubahan convention**

Jika halaman baru mengubah atau menambah convention, update juga:
- `.planning/01-convention-spec.md` — source of truth untuk semua convention

---

## Style Guide

### Bahasa

| Konten | Bahasa |
|--------|--------|
| Penjelasan, paragraf, list | Indonesia |
| Kode, nama simbol, nama file, nama folder | Inggris |
| Frontmatter `title` dan `description` | Inggris |

### Tone

- Hindari paragraf panjang — gunakan tabel dan list
- Setiap halaman harus bisa dibaca dalam 2 menit
- Gunakan kalimat aktif dan langsung ke poin

### Code Blocks

Selalu sertakan path file sebagai komentar pertama di setiap code block:

```tsx
// app/login/$element/client.form.tsx
"use client"
export function CE_LoginForm() {
    // ...
}
```

---

## Memperbarui Konten yang Sudah Ada

Jika convention berubah:

1. Update `.planning/01-convention-spec.md` terlebih dahulu
2. Update halaman dokumentasi yang relevan
3. Pastikan contoh kode di semua halaman konsisten dengan convention terbaru

---

## Commit Style

Format commit mengikuti **Conventional Commits**:

```
docs: add next-intl stack guide
docs(patterns): update Pattern C with error handling example
docs(structure): fix folder tree for api layer
```

| Type | Kapan digunakan |
|------|----------------|
| `docs` | Tambah atau ubah konten dokumentasi |
| `feat` | Fitur baru di docs site (komponen, halaman interaktif) |
| `fix` | Perbaikan typo, link rusak, atau contoh kode yang salah |
| `chore` | Update dependensi, config Astro |

---

## Kapan Tidak Perlu PR

- Perbaikan typo minor — langsung commit ke branch `main`
- Update link yang rusak — langsung commit

Untuk perubahan signifikan (convention baru, restrukturisasi sidebar), buat PR agar bisa di-review.
