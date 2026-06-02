# Zod — Implementation Reference

## Naming dan Lokasi

Simbol: `ZS_` prefix (Zod Schema).

```ts
ZS_LoginSchema
ZS_CreateUserSchema
ZS_UpdateProfileSchema
```

File — dua pola tergantung scope:

| Pola | Lokasi | Kapan |
|------|--------|-------|
| `cfn.[feature]-schema.ts` | `app/[feature]/$function/` | Schema dipakai di CE_ (client validation feedback) |
| `[feature].schema.ts` | `app/[feature]/$action/` | Schema server-only, tidak dipakai di CE_ |

Jika schema diimport di TanStack Form untuk client-side validation → gunakan `cfn.[feature]-schema.ts` agar berada di `$function/` (client function folder).

---

## Pattern di Server Action (ACT_)

`safeParse` wajib ada di ACT_ sebelum memanggil `APIS_`. Gunakan `safeParse`, bukan `parse`.

```ts
"use server"
import { ZS_CreateUserSchema } from "../$function/cfn.create-user-schema"
import { APIS_CreateUser } from "@/api/user/user"

export async function ACT_CreateUser(input: unknown) {
  const parsed = ZS_CreateUserSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }
  return APIS_CreateUser(parsed.data)
}
```

`parsed.error.flatten().fieldErrors` menghasilkan `Record<string, string[]>` — cocok untuk ditampilkan per field di CE_.

---

## Schema Definition

```ts
// app/create-user/$function/cfn.create-user-schema.ts
import { z } from "zod"

export const ZS_CreateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["admin", "user", "viewer"]),
  age: z.number().int().min(18, "Minimal 18 tahun").optional(),
})

export type T_CreateUserInput = z.infer<typeof ZS_CreateUserSchema>
```

`z.infer<typeof ZS_Schema>` untuk derive TypeScript type dari schema.

---

## Shared Schema (Client + Server)

Schema yang sama dipakai di TanStack Form (client) dan Server Action (server):

```tsx
// CE_ — import ZS_ untuk validators
import { ZS_CreateUserSchema } from "../$function/cfn.create-user-schema"

const form = useForm({
  validators: {
    onSubmit: ZS_CreateUserSchema,
    onChange: ZS_CreateUserSchema,  // real-time validation
  },
  onSubmit: async ({ value }) => await ACT_CreateUser(value),
})
```

```ts
// ACT_ — import ZS_ yang sama untuk server re-validation
import { ZS_CreateUserSchema } from "../$function/cfn.create-user-schema"

export async function ACT_CreateUser(input: unknown) {
  const parsed = ZS_CreateUserSchema.safeParse(input)
  // ...
}
```

---

## Schema Patterns Umum

```ts
// Optional field dengan default
z.string().optional()
z.string().default("")

// Enum
z.enum(["draft", "published", "archived"])

// Cross-field validation (password match)
z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  }
)

// Transformasi
z.string().transform((val) => val.trim().toLowerCase())

// Union type
z.union([z.string(), z.number()])

// Array dengan min length
z.array(z.string()).min(1, "Pilih minimal satu item")
```

---

## Error Handling di CE_

Jika ACT_ mengembalikan `error`:

```tsx
export function CE_CreateUserForm() {
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})

  const form = useForm({
    onSubmit: async ({ value }) => {
      const result = await ACT_CreateUser(value)
      if (result?.error) {
        setServerErrors(result.error)
      }
    },
  })

  return (
    <form.Field name="email">
      {(field) => (
        <div>
          <input {...} />
          {/* Client validation error */}
          {field.state.meta.errors[0] && (
            <span>{field.state.meta.errors[0]}</span>
          )}
          {/* Server error */}
          {serverErrors.email?.[0] && (
            <span>{serverErrors.email[0]}</span>
          )}
        </div>
      )}
    </form.Field>
  )
}
```

---

## Anti-patterns

```ts
// ❌ Salah — parse() di Server Action (throws exception, tidak graceful)
export async function ACT_Submit(input: unknown) {
  const data = ZS_Schema.parse(input)  // ← throws ZodError jika invalid
  await APIS_Create(data)
}

// ✅ Benar — safeParse() dengan graceful error return
export async function ACT_Submit(input: unknown) {
  const parsed = ZS_Schema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }
  await APIS_Create(parsed.data)
}
```

```ts
// ❌ Salah — tidak ada ZS_ prefix
export const loginSchema = z.object({ ... })
export const LoginSchema = z.object({ ... })

// ✅ Benar
export const ZS_LoginSchema = z.object({ ... })
```

```ts
// ❌ Salah — schema server-only di $function/ tanpa alasan
// (jika tidak dipakai di CE_, tidak perlu di $function/)
app/login/$function/cfn.login-schema.ts  ← padahal CE_ tidak pakai ini

// ✅ Benar — di $action/ jika server-only
app/login/$action/login.schema.ts
```
