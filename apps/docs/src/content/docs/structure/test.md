---
title: Testing Convention
description: Convention untuk penempatan file test — unit test co-located di samping file sumber, integration/E2E di folder $test/ dalam feature.
---

## Prinsip

Convention ini mengikuti satu prinsip sederhana: **test harus dekat dengan kode yang ditest**. Semakin spesifik scope test, semakin dekat letaknya ke file sumber.

## Dua Jenis Penempatan

### Unit Test — Co-located

File unit test diletakkan **langsung di samping file yang ditest**, di dalam folder yang sama. Nama file mengikuti pola `[nama-file].test.tsx` atau `[nama-file].test.ts`.

```
// tree
app/login/
├── $element/
│   ├── client.form.tsx            → file sumber
│   └── client.form.test.tsx       → unit test untuk CE_LoginForm
├── $function/
│   ├── cfn.validate.ts            → file sumber
│   └── cfn.validate.test.ts       → unit test untuk CFN_ValidateEmail
└── login.schema.ts                → file sumber
    login.schema.test.ts           → unit test untuk ZS_LoginForm
```

Co-located berarti:
- Tidak ada folder `__tests__/` terpisah
- File test berada di folder yang sama dengan file sumber
- Mudah ditemukan: lihat file sumber → file test ada di sebelahnya

### Integration / E2E Test — Folder `$test/`

Test yang mencakup lebih dari satu file atau layer — misalnya flow login dari klik tombol sampai redirect dashboard — diletakkan di folder `$test/` dalam feature folder.

```
// tree
app/login/
├── $action/
│   └── action.submit.ts
├── $element/
│   ├── server.layout.tsx
│   └── client.form.tsx
├── $test/
│   ├── login.integration.test.ts   → test ACT_SubmitLogin + APIS_Login end-to-end
│   └── login.e2e.test.ts           → Playwright test: klik form → redirect dashboard
└── page.tsx
```

`$test/` cocok untuk:
- Integration test yang memanggil beberapa layer sekaligus
- E2E test dengan Playwright atau Cypress
- Test yang melibatkan database atau external service

## Aturan

| Aturan | Detail |
|--------|--------|
| Unit test | Co-located — `client.form.test.tsx` di samping `client.form.tsx` |
| Integration/E2E | Di `$test/` dalam feature folder |
| Nama file unit test | `[nama-file-sumber].test.tsx` atau `[nama-file-sumber].test.ts` |
| Nama file `$test/` | Bebas, deskriptif — `login.integration.test.ts` |
| Tidak ada `__tests__/` | Jangan buat folder `__tests__/` — gunakan co-located atau `$test/` |

## Contoh Unit Test

```tsx
// $element/client.form.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { CE_LoginForm } from "./client.form"

describe("CE_LoginForm", () => {
    it("shows validation error for invalid email", async () => {
        render(<CE_LoginForm />)
        fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
            target: { value: "not-an-email" },
        })
        fireEvent.blur(screen.getByRole("textbox", { name: /email/i }))
        expect(await screen.findByText(/format email/i)).toBeInTheDocument()
    })
})
```

```ts
// $function/cfn.validate.test.ts
import { CFN_ValidateEmail } from "./cfn.validate"

describe("CFN_ValidateEmail", () => {
    it("returns true for valid email", () => {
        expect(CFN_ValidateEmail("user@example.com")).toBe(true)
    })

    it("returns false for invalid email", () => {
        expect(CFN_ValidateEmail("not-an-email")).toBe(false)
    })
})
```

## Contoh Integration Test

```ts
// $test/login.integration.test.ts
import { ACT_SubmitLogin } from "../$action/action.submit"

describe("ACT_SubmitLogin", () => {
    it("returns error for wrong credentials", async () => {
        const result = await ACT_SubmitLogin({ email: "wrong@test.com", password: "wrongpass" })
        expect(result.error).toBeDefined()
    })

    it("redirects to dashboard on success", async () => {
        // test dengan credentials yang valid di test database
    })
})
```

## Kapan Tidak Pakai Ini

- Test untuk code di `lib/` atau `api/` — letakkan co-located di samping file sumber, bukan di `$test/` feature.
- Test untuk global store di `store/` — co-located di samping file store.
