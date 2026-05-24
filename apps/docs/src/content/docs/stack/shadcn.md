---
title: shadcn/ui
description: Panduan setup dan penggunaan shadcn/ui dalam konvensi Next.js Clean Architecture — termasuk aturan wrapper CE_ dan penggunaan cn().
---

## Tujuan dalam Konvensi Ini

shadcn/ui dipilih sebagai fondasi komponen UI karena pendekatannya yang unik: komponen di-*copy* sebagai source code ke dalam proyek, bukan dipakai sebagai dependency hitam. Artinya kita punya kontrol penuh atas setiap komponen. Dalam konvensi ini, shadcn/ui berfungsi sebagai **lapisan primitif** — komponen dasar yang tidak pernah dimodifikasi langsung, melainkan selalu dibungkus oleh komponen `CE_` di level feature atau oleh shared wrapper di `lib/`.

---

## Setup

```bash
npx shadcn@latest init
```

Ikuti wizard interaktif. Komponen yang di-generate akan masuk ke `components/ui/`. Pastikan `lib/utils.ts` sudah berisi fungsi `cn()`:

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Menambah komponen baru:

```bash
npx shadcn@latest add button card dialog
```

---

## Pola Penggunaan

### Aturan Emas: Jangan Modifikasi `components/ui/`

File di `components/ui/` adalah *upstream source* — harus tetap bersih agar bisa di-update. Semua kustomisasi dilakukan via wrapper.

### Shared Wrapper di `lib/`

Gunakan untuk komponen yang dipakai lebih dari satu feature:

```tsx
// lib/button.tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return <Button className={cn("rounded-lg", className)} {...props} />
}
```

### Feature Wrapper sebagai `CE_`

Gunakan untuk komponen yang spesifik ke satu feature:

```tsx
// app/login/$element/client.submitbutton.tsx
"use client"
import { AppButton } from "@/lib/button"

interface I_SubmitButtonProps {
  isLoading?: boolean
}

export function CE_SubmitButton({ isLoading }: I_SubmitButtonProps) {
  return (
    <AppButton type="submit" disabled={isLoading}>
      {isLoading ? "Memproses..." : "Masuk"}
    </AppButton>
  )
}
```

### Menggunakan `cn()` untuk Conditional Classes

```tsx
// Benar — gunakan cn() untuk menggabungkan class kondisional
import { cn } from "@/lib/utils"

export function CE_StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-1 text-sm",
        isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
      )}
    >
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  )
}
```

---

## Aturan Konvensi

- **Dilarang** memodifikasi file di `components/ui/` secara langsung — buat wrapper
- Wrapper shared (dipakai banyak feature) → taruh di `lib/`
- Wrapper feature-specific → taruh di `app/[feature]/$element/` dengan prefix `CE_`
- Selalu gunakan `cn()` dari `lib/utils` untuk penggabungan class, bukan template literal manual
- Gunakan semantic color tokens (`bg-primary`, `text-muted-foreground`) — hindari raw color seperti `bg-blue-500`
- Gunakan `size-*` bila width dan height sama — bukan `w-* h-*`
- Gunakan `gap-*` untuk spasi antar elemen — bukan `space-x-*` atau `space-y-*`

---

## Referensi

- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [Pattern F — shadcn/ui Extension](/patterns/shadcn)
- [Naming Convention — CE_ prefix](/conventions/naming)
