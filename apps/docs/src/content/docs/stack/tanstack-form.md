---
title: TanStack Form
description: Panduan setup dan penggunaan TanStack Form dalam konvensi Next.js Clean Architecture — form headless type-safe dengan Zod adapter dan Server Action.
---

## Tujuan dalam Konvensi Ini

TanStack Form dipilih sebagai solusi form karena sifatnya yang *headless* dan type-safe penuh. Dalam konvensi ini, TanStack Form selalu dipadukan dengan Zod schema (`ZS_` prefix) untuk validasi, dan terhubung ke Server Action (`ACT_`) saat submission. Tidak ada form dalam konvensi ini yang mengirim data langsung ke API — semua melewati Server Action untuk keamanan dan validasi di server.

---

## Setup

```bash
npm install @tanstack/react-form @tanstack/zod-form-adapter
```

---

## Pola Penggunaan

### Form Dasar dengan Zod Adapter

Form selalu berada di `CE_` (Client Component) karena membutuhkan interaktivitas:

```tsx
// app/login/$element/client.form.tsx
"use client"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { ACT_SubmitLogin } from "../$action/action.submit"
import { ZS_LoginForm } from "../login.schema"

export function CE_LoginForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: ZS_LoginForm,
    },
    onSubmit: async ({ value }) => {
      await ACT_SubmitLogin(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: ZS_LoginForm.shape.email,
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && field.state.meta.errors[0] && (
              <p>{field.state.meta.errors[0].toString()}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: ZS_LoginForm.shape.password,
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Password</label>
            <input
              id={field.name}
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.isTouched && field.state.meta.errors[0] && (
              <p>{field.state.meta.errors[0].toString()}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(s) => [s.canSubmit, s.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Memproses..." : "Masuk"}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
```

### Validasi Cross-field (Linked Fields)

```tsx
// Contoh: confirm password yang bergantung pada field password
<form.Field
  name="confirmPassword"
  validators={{
    onChangeListenTo: ["password"],
    onChange: ({ value, fieldApi }) => {
      const password = fieldApi.form.getFieldValue("password")
      if (value !== password) return "Password tidak cocok"
      return undefined
    },
  }}
>
  {(field) => (
    <div>
      <label>Konfirmasi Password</label>
      <input
        type="password"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.isTouched && field.state.meta.errors[0] && (
        <p>{field.state.meta.errors[0].toString()}</p>
      )}
    </div>
  )}
</form.Field>
```

### Form-level Validation

Untuk validasi yang melibatkan lebih dari satu field:

```tsx
const form = useForm({
  defaultValues: { startDate: "", endDate: "" },
  validators: {
    onChange: ({ value }) => {
      if (value.startDate && value.endDate && value.startDate > value.endDate) {
        return "Tanggal mulai tidak boleh setelah tanggal selesai"
      }
      return undefined
    },
  },
  onSubmit: async ({ value }) => {
    await ACT_SubmitDateRange(value)
  },
})
```

---

## Aturan Konvensi

- Form selalu ada di `CE_` (Client Component) — gunakan `"use client"` directive
- Setiap form **wajib** dipasangkan dengan Zod schema `ZS_` yang sudah didefinisikan di `[module].schema.ts`
- `onSubmit` form **harus** memanggil Server Action (`ACT_`) — tidak boleh langsung ke API
- Selalu gunakan `validatorAdapter: zodValidator()` untuk konsistensi
- Selalu panggil `e.preventDefault()` dan `e.stopPropagation()` di handler submit
- Selalu pasang `onBlur={field.handleBlur}` pada setiap input untuk pelacakan `isTouched`
- Tampilkan error hanya setelah `field.state.meta.isTouched === true` untuk UX yang baik
- Gunakan `form.Subscribe` dengan selector untuk meminimalkan re-render

---

## Referensi

- [TanStack Form Docs](https://tanstack.com/form/latest)
- [Pattern C — Form Submit dengan Server Action](/patterns/form-submit)
- [Zod — ZS_ schema convention](/stack/zod)
