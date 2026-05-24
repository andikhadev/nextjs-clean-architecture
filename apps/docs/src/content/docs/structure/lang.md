---
title: $lang/ (Deprecated)
description: Folder $lang/ di dalam feature tidak lagi digunakan sejak v2 — i18n dikelola melalui messages/[locale].json dan next-intl.
---

## Deprecation Notice

Folder `$lang/` di dalam feature folder **tidak digunakan di v2**. Pendekatan lama (v1) menyimpan terjemahan sebagai file TypeScript di dalam setiap feature — menghasilkan duplikasi dan tidak mendukung locale switching runtime.

**Sejak v2**, semua teks terjemahan disimpan di `messages/[locale].json` di root project dan diakses via next-intl.

## Perubahan dari v1 ke v2

| | v1 (deprecated) | v2 (gunakan ini) |
|---|---|---|
| Lokasi file | `app/[feature]/$lang/id_en.ts` | `messages/id.json` |
| Format | TypeScript object export | JSON dengan namespace |
| Prefix | `LANG_` | Tidak ada — gunakan `t("key")` |
| Akses di CE_ | Import langsung dari `$lang/` | `useTranslations("Feature")` |
| Akses di SE_ | Import langsung dari `$lang/` | `await getTranslations("Feature")` |

## Yang Harus Dilakukan

Jika menemukan folder `$lang/` di codebase yang dimigrasi ke v2:

1. Pindahkan semua string ke `messages/id.json` dan `messages/en.json` dengan namespace feature.
2. Hapus folder `$lang/`.
3. Ganti semua penggunaan `LANG_` dengan `useTranslations` (CE_) atau `getTranslations` (SE_).

## Pendekatan v2

Lihat panduan lengkap di halaman [Pattern H — i18n dengan next-intl](/patterns/i18n).

Ringkasan cepat:

```json
// messages/id.json
{
  "Login": {
    "title": "Masuk",
    "email": "Email",
    "submit": "Masuk"
  }
}
```

```tsx
// CE_ — gunakan useTranslations
"use client"
import { useTranslations } from "next-intl"

export function CE_LoginForm() {
    const t = useTranslations("Login")
    return <button>{t("submit")}</button>
}
```

```tsx
// SE_ — gunakan getTranslations
import { getTranslations } from "next-intl/server"

export async function SE_LoginLayout() {
    const t = await getTranslations("Login")
    return <h1>{t("title")}</h1>
}
```
