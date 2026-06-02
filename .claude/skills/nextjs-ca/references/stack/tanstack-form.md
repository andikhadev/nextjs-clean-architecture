# TanStack Form — Implementation Reference

## Pattern Dasar (Pattern C)

```
CE_[Feature]Form (TanStack Form)
  → ZS_[Feature]Schema (Zod, client-side validation feedback)
  → ACT_Submit (Server Action, Zod re-validate + APIS_)
```

TanStack Form mengelola form state dan validation feedback di client. Submit diteruskan ke Server Action — bukan `<form action={ACT_}>` langsung.

---

## Setup `useForm`

```tsx
"use client"
import { useForm } from "@tanstack/react-form"
import { ZS_LoginSchema } from "@/app/login/$function/cfn.login-schema"
import { ACT_Login } from "../$action/action.login"

export function CE_LoginForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: ZS_LoginSchema,  // ← Zod schema untuk full-form validation
    },
    onSubmit: async ({ value }) => {
      const result = await ACT_Login(value)
      if (result?.error) {
        // handle server error
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      {/* fields */}
    </form>
  )
}
```

---

## Field Binding

```tsx
<form.Field
  name="email"
  validators={{
    onChange: ZS_LoginSchema.shape.email,  // ← field-level validation
  }}
>
  {(field) => (
    <div>
      <label htmlFor={field.name}>Email</label>
      <input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.errors.length > 0 && (
        <span role="alert">{field.state.meta.errors[0]}</span>
      )}
    </div>
  )}
</form.Field>
```

---

## Zod Schema — Shared antara Client dan Server

```ts
// app/login/$function/cfn.login-schema.ts
import { z } from "zod"

export const ZS_LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
})

export type T_LoginInput = z.infer<typeof ZS_LoginSchema>
```

Schema ini diimport di:
- `CE_LoginForm` — untuk client-side validation feedback (via `validators`)
- `ACT_Login` — untuk server-side re-validation sebelum `APIS_`

---

## Server Action (ACT_)

```ts
// $action/action.login.ts
"use server"
import { ZS_LoginSchema } from "../$function/cfn.login-schema"
import { APIS_Login } from "@/api/auth/auth"

export async function ACT_Login(input: unknown) {
  const parsed = ZS_LoginSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }
  return APIS_Login(parsed.data)
}
```

---

## Submit State

```tsx
<button type="submit" disabled={form.state.isSubmitting}>
  {form.state.isSubmitting ? "Loading..." : "Login"}
</button>
```

---

## Form dengan Array Fields

```tsx
<form.Field name="tags" mode="array">
  {(field) => (
    <div>
      {field.state.value.map((_, i) => (
        <form.Field key={i} name={`tags[${i}]`}>
          {(subField) => (
            <input
              value={subField.state.value}
              onChange={(e) => subField.handleChange(e.target.value)}
            />
          )}
        </form.Field>
      ))}
      <button type="button" onClick={() => field.pushValue("")}>
        Add tag
      </button>
    </div>
  )}
</form.Field>
```

---

## Anti-patterns

```tsx
// ❌ Salah — form action langsung ke Server Action (tidak ada validation feedback)
<form action={ACT_Submit}>
  <input name="email" />
  <button type="submit">Submit</button>
</form>

// ❌ Salah — useActionState menggantikan TanStack Form
const [state, action] = useActionState(ACT_Submit, null)

// ✅ Benar — TanStack Form + submit ke ACT_
const form = useForm({
  onSubmit: async ({ value }) => await ACT_Submit(value),
  validators: { onSubmit: ZS_Schema },
})
```

```tsx
// ❌ Salah — tidak ada ZS_ untuk client validation
const form = useForm({
  onSubmit: async ({ value }) => await ACT_Submit(value),
  // ← tidak ada validators — user tidak dapat feedback real-time
})

// ✅ Benar
const form = useForm({
  validators: { onSubmit: ZS_Schema },
  onSubmit: async ({ value }) => await ACT_Submit(value),
})
```
