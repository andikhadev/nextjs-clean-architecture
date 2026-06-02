# next-intl — Implementation Reference

## Aturan Utama

- Semua user-facing string wajib melalui i18n — tidak boleh hardcode di JSX
- Namespace per feature, nama PascalCase matching nama feature folder
- File di `messages/[locale].json` di root (bukan di `$lang/` folder feature)

---

## Namespace Convention

Nama namespace = nama feature folder diubah ke PascalCase:

| Feature folder | Namespace |
|---------------|-----------|
| `user-management` | `UserManagement` |
| `welcome-banner` | `WelcomeBanner` |
| `cms-homepage` | `CmsHomepage` |

---

## Struktur File `messages/`

```
messages/
├── id.json   ← Bahasa Indonesia
└── en.json   ← English
```

Struktur JSON — nested per namespace:

```json
// messages/id.json
{
  "UserManagement": {
    "title": "Manajemen Pengguna",
    "deleteConfirm": "Hapus pengguna {name}?",
    "table": {
      "name": "Nama",
      "email": "Email",
      "status": "Status"
    },
    "actions": {
      "delete": "Hapus",
      "edit": "Edit",
      "cancel": "Batal"
    }
  }
}
```

```json
// messages/en.json
{
  "UserManagement": {
    "title": "User Management",
    "deleteConfirm": "Delete user {name}?",
    "table": {
      "name": "Name",
      "email": "Email",
      "status": "Status"
    },
    "actions": {
      "delete": "Delete",
      "edit": "Edit",
      "cancel": "Cancel"
    }
  }
}
```

---

## CE_ — `useTranslations`

```tsx
"use client"
import { useTranslations } from "next-intl"

export function CE_UserTable() {
  const t = useTranslations("UserManagement")

  return (
    <table>
      <thead>
        <tr>
          <th>{t("table.name")}</th>
          <th>{t("table.email")}</th>
          <th>{t("table.status")}</th>
        </tr>
      </thead>
    </table>
  )
}
```

---

## SE_ — `getTranslations` (async)

```tsx
import { getTranslations } from "next-intl/server"

export async function SE_UserManagementLayout() {
  const t = await getTranslations("UserManagement")

  return (
    <div>
      <h1>{t("title")}</h1>
      <CE_UserTable />
    </div>
  )
}
```

---

## ACT_ — `getTranslations` di Server Action

```ts
"use server"
import { getTranslations } from "next-intl/server"

export async function ACT_DeleteUser(id: string) {
  const parsed = ZS_DeleteUserSchema.safeParse({ id })
  if (!parsed.success) {
    const t = await getTranslations("UserManagement")
    return { error: t("errors.invalidId") }
  }
  await APIS_DeleteUser(id)
}
```

---

## Interpolasi Variable

```json
// messages/id.json
{
  "UserManagement": {
    "deleteConfirm": "Hapus pengguna {name}?"
  }
}
```

```tsx
const t = useTranslations("UserManagement")
<p>{t("deleteConfirm", { name: user.name })}</p>
```

---

## Plural

```json
{
  "UserManagement": {
    "selectedCount": "{count, plural, =0 {Tidak ada} one {# pengguna} other {# pengguna}} dipilih"
  }
}
```

```tsx
t("selectedCount", { count: selectedIds.length })
```

---

## Anti-patterns

```tsx
// ❌ Salah — hardcode string
<h1>User Management</h1>
<button>Hapus</button>

// ✅ Benar — via i18n
const t = useTranslations("UserManagement")
<h1>{t("title")}</h1>
<button>{t("actions.delete")}</button>
```

```tsx
// ❌ Salah — useTranslations di SE_ (tidak async-aware)
export function SE_UserLayout() {
  const t = useTranslations("UserManagement")  // ← error di SE_
}

// ✅ Benar — getTranslations (async) di SE_
export async function SE_UserLayout() {
  const t = await getTranslations("UserManagement")
}
```

```ts
// ❌ Salah — namespace tidak matching feature folder
const t = useTranslations("Users")       // ← feature folder: user-management
const t = useTranslations("user")        // ← PascalCase wajib

// ✅ Benar
const t = useTranslations("UserManagement")
```

```
// ❌ Salah — string disimpan di $lang/ folder feature
app/user-management/$lang/id.ts

// ✅ Benar — di messages/ root
messages/id.json   (namespace UserManagement di dalamnya)
```
