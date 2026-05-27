---
title: Testing Convention
description: Convention untuk penempatan file test — unit test co-located di samping file sumber, integration test di folder $test/, dan E2E di /e2e/ root dengan Playwright.
---

## Prinsip

Convention ini mengikuti satu prinsip sederhana: **test harus dekat dengan kode yang ditest**. Semakin spesifik scope test, semakin dekat letaknya ke file sumber.

## Tiga Jenis Penempatan

### Unit / Component Test — Co-located

File unit test diletakkan **langsung di samping file yang ditest**, di dalam folder yang sama. Nama file mengikuti pola `[nama-file].test.tsx` atau `[nama-file].test.ts`.

```
app/login/
├── $element/
│   ├── client.form.tsx            → file sumber
│   └── client.form.test.tsx       → component test CE_LoginForm (Vitest + RTL)
├── $function/
│   ├── cfn.validate.ts            → file sumber
│   └── cfn.validate.test.ts       → unit test CFN_ValidateEmail (Vitest)
├── $action/
│   ├── action.submit.ts           → file sumber
│   └── action.submit.test.ts      → unit test ACT_SubmitLogin (Vitest + vi.mock)
└── login.schema.ts                → file sumber
    login.schema.test.ts           → unit test ZS_LoginForm (Vitest)
```

Co-located berarti:
- Tidak ada folder `__tests__/` terpisah
- File test berada di folder yang sama dengan file sumber
- Mudah ditemukan: lihat file sumber → file test ada di sebelahnya

### Integration Test — Folder `$test/`

Test yang mencakup **lebih dari satu layer dalam feature yang sama** diletakkan di folder `$test/`. Test-test ini tidak "milik" satu file manapun — mereka menguji interaksi antar layer.

```
app/login/
├── $action/
│   └── action.submit.ts
├── $element/
│   ├── server.layout.tsx
│   └── client.form.tsx
├── $test/
│   └── login-flow.integration.test.ts  → ACT_ + APIS_ + MSW end-to-end
└── page.tsx
```

`$test/` cocok untuk:
- Integration test yang memanggil beberapa layer sekaligus (ACT_ → APIS_ → response)
- Test yang butuh MSW untuk mock API response per skenario
- Test yang melibatkan beberapa module dalam satu feature

### E2E Test — `/e2e/` di Root

Full user journey di browser nyata menggunakan Playwright. Diletakkan di `/e2e/` root project, diorganisir per feature.

```
e2e/
├── auth/
│   └── login.e2e.ts       → user buka /login, isi form, klik, assert redirect
└── user-management/
    └── user-list.e2e.ts   → user buka /users, lihat list, filter, hapus
```

E2E cocok untuk:
- Verifikasi Server Components (`SE_`, `page.tsx`) yang butuh full Next.js runtime
- Happy path per fitur — test yang membuktikan fitur bekerja end-to-end
- Regresi setelah perubahan besar

## Aturan

| Aturan | Detail |
|--------|--------|
| Unit / component test | Co-located — `client.form.test.tsx` di samping `client.form.tsx` |
| Integration test | Di `$test/` dalam feature folder |
| E2E test | Di `/e2e/[feature]/` di root project |
| Nama file co-located | `[nama-file-sumber].test.tsx` atau `.test.ts` |
| Nama file `$test/` | Deskriptif — `login-flow.integration.test.ts` |
| Nama file E2E | `[feature].e2e.ts` |
| Tidak ada `__tests__/` | Jangan buat folder `__tests__/` — gunakan co-located atau `$test/` |
| Server Component | Tidak di-unit-test — cukup E2E |

## Mocking di Test

### Server Actions — mock Next.js internals

Server Actions di-import langsung dan dipanggil sebagai fungsi biasa. Mock `next/headers`, `next/navigation`, dan `next/cache` sebelum memanggil:

```ts
// $action/action.submit.test.ts
import { vi, it, expect } from "vitest"
import { ACT_SubmitLogin } from "./action.submit"

vi.mock("next/headers", () => ({
    cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
}))
vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}))

it("redirects to /dashboard on valid credentials", async () => {
    const { redirect } = await import("next/navigation")
    await ACT_SubmitLogin({ email: "user@test.com", password: "valid123" })
    expect(redirect).toHaveBeenCalledWith("/dashboard")
})
```

### API Calls — MSW via `src/mocks/node`

Integration test yang melibatkan HTTP fetch menggunakan MSW:

```ts
// $test/login-flow.integration.test.ts
import { server } from "@/mocks/node"
import { http, HttpResponse } from "msw"
import { EP_Auth } from "@/api/auth/auth.endpoint"

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("returns error on 401", async () => {
    server.use(
        http.post(EP_Auth.login, () =>
            HttpResponse.json({ message: "Email atau password salah" }, { status: 401 })
        )
    )
    const result = await ACT_SubmitLogin({ email: "x@x.com", password: "wrong" })
    expect(result?.error).toBe("Email atau password salah")
})
```

## Contoh Component Test

```tsx
// $element/client.form.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { CE_LoginForm } from "./client.form"

it("shows validation error for invalid email", async () => {
    render(<CE_LoginForm />)
    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
        target: { value: "bukan-email" },
    })
    fireEvent.blur(screen.getByRole("textbox", { name: /email/i }))
    expect(await screen.findByText(/format email tidak valid/i)).toBeInTheDocument()
})
```

## Contoh E2E Test

```ts
// e2e/auth/login.e2e.ts
import { test, expect } from "@playwright/test"

test("user can log in with valid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("textbox", { name: /email/i }).fill("user@test.com")
    await page.getByRole("textbox", { name: /password/i }).fill("valid123")
    await page.getByRole("button", { name: /masuk/i }).click()
    await expect(page).toHaveURL("/dashboard")
})
```

## Kapan Tidak Pakai Ini

- Test untuk code di `lib/` atau `api/` — letakkan co-located di samping file sumber, bukan di `$test/` feature.
- Test untuk global store di `store/` — co-located di samping file store.
- Verifikasi visual / layout — Storybook atau screenshot test lebih tepat.

---

> Lihat juga: [Pattern J — Testing Convention](/patterns/testing), [Stack — Testing](/stack/testing)
