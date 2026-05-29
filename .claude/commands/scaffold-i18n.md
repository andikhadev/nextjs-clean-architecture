# /scaffold-i18n — Scaffold i18n Namespace (Pattern H)

Tambah namespace baru ke `messages/` mengikuti Pattern H (next-intl).

## Pertanyaan (tanya satu per satu, tunggu jawaban)

1. **Feature name / namespace** — PascalCase, sesuai nama feature
   Contoh: `Login`, `UserList`, `CmsHomepageBanner`

2. **Keys yang dibutuhkan** — list key-key yang akan dipakai
   Contoh: `title`, `submitButton`, `cancelButton`, `errorRequired`, `errorInvalid`
   Jika tidak tahu semua keys → bisa diisi placeholder `"TODO"` untuk dilengkapi nanti

3. **Locales yang ada di project** — cek `messages/` folder dulu
   Default: `en`, `id`

## Generate

Tambahkan namespace entry ke setiap locale file:

```json
// messages/en.json — tambahkan key baru
{
  "[Feature]": {
    "key1": "English value",
    "key2": "English value"
  }
}
```

```json
// messages/id.json — tambahkan key baru
{
  "[Feature]": {
    "key1": "Indonesian value",
    "key2": "Indonesian value"
  }
}
```

Jangan timpa namespace yang sudah ada — merge ke dalam.

## Usage Snippets

Tampilkan setelah generate:

**Di CE_ (client component):**
```typescript
import { useTranslations } from "next-intl"

export function CE_[Feature]() {
  const t = useTranslations("[Feature]")
  return <h1>{t("title")}</h1>
}
```

**Di SE_ (server component):**
```typescript
import { getTranslations } from "next-intl/server"

export async function SE_[Feature]() {
  const t = await getTranslations("[Feature]")
  return <h1>{t("title")}</h1>
}
```

## Rules

- Namespace name selalu PascalCase, sama dengan nama feature/component
- Semua user-facing string wajib via `useTranslations` / `getTranslations` — tidak boleh hardcode
- Key names menggunakan camelCase
- Jika `next-intl-app-router` skill belum ada di `.claude/skills/` → install dulu
