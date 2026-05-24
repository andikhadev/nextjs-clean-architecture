---
title: "Pattern F — shadcn/ui Extension"
description: Cara aman memperluas komponen shadcn/ui tanpa memodifikasi file asli di components/ui/, menggunakan wrapper CE_ atau lib/ui/ dengan cn() untuk class merging.
---

## Tujuan

shadcn/ui menambahkan komponen sebagai source code di `components/ui/`. File-file ini bisa di-update ulang via CLI kapan saja — modifikasi langsung di sana akan hilang. Pattern F mendefinisikan cara membuat wrapper di atas komponen shadcn tanpa menyentuh file aslinya: wrapper feature-spesifik masuk ke `$element/` sebagai `CE_`, wrapper yang dipakai di seluruh project masuk ke `lib/ui/`. Dengan pola ini, customisasi aman dari update dan mudah ditemukan.

---

## Aturan

1. **Jangan modifikasi `components/ui/` secara langsung** — file di sana dikelola oleh CLI shadcn dan bisa di-overwrite kapan saja.
2. **Wrapper feature-spesifik** → buat `CE_` di `app/[feature]/$element/client.[module].tsx`.
3. **Wrapper shared (dipakai >1 feature)** → buat di `lib/ui/[component].tsx`.
4. **Gunakan `cn()` dari `@/lib/utils`** untuk menggabungkan class — jangan manual template literal.
5. **Extend props interface** dari komponen asli menggunakan `React.ComponentProps<typeof BaseComponent>` atau `ComponentPropsWithoutRef` — jangan tulis ulang semua props.
6. **Gunakan semantic color tokens** (`bg-primary`, `text-muted-foreground`) — jangan hardcode warna seperti `bg-blue-500`.
7. **Jangan tambahkan logika server** di `CE_` wrapper — kalau butuh data server, fetch di `SE_` dan pass via props.
8. **Nama wrapper** mengikuti prefix feature: `CE_SearchInput`, `CE_SaveButton`, bukan `SearchInput` atau `CustomButton`.

---

## Tabel Keputusan

| Kebutuhan | Pendekatan |
|-----------|-----------|
| Style berbeda untuk satu feature saja | `CE_` wrapper di `$element/` feature |
| Komponen reusable di seluruh project | `lib/ui/[component].tsx` |
| Override style sekali pakai | `className` prop langsung |
| Tambah behavior / event handler | `CE_` atau `lib/ui/` wrapper |
| Butuh data server di dalam komponen | Fetch di `SE_`, pass ke `CE_` via props |

---

## Contoh

Wrapper `Input` dari shadcn dengan debounce — dipakai di fitur `user-list`.

### Struktur File

```
components/ui/
└── input.tsx          ← JANGAN dimodifikasi

app/user-list/
└── $element/
    └── client.searchinput.tsx   CE_SearchInput
```

### `app/user-list/$element/client.searchinput.tsx`

```tsx
// app/user-list/$element/client.searchinput.tsx
"use client"

import * as React from "react"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface I_SearchInputProps extends React.ComponentProps<typeof Input> {
    onDebouncedChange: (value: string) => void
    debounceMs?: number
}

export function CE_SearchInput({
    onDebouncedChange,
    debounceMs = 300,
    className,
    ...props
}: I_SearchInputProps) {
    const handleChange = useDebouncedCallback((value: string) => {
        onDebouncedChange(value)
    }, debounceMs)

    return (
        <Input
            type="search"
            className={cn("max-w-sm", className)}
            onChange={(e) => handleChange(e.target.value)}
            {...props}
        />
    )
}
```

### `lib/ui/app-button.tsx` — shared wrapper

Untuk wrapper yang dipakai di banyak feature, taruh di `lib/ui/`:

```tsx
// lib/ui/app-button.tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type React from "react"

interface I_AppButtonProps extends React.ComponentProps<typeof Button> {
    loading?: boolean
}

export function AppButton({ loading, disabled, className, children, ...props }: I_AppButtonProps) {
    return (
        <Button
            disabled={disabled || loading}
            className={cn("min-w-24", className)}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Memproses...
                </span>
            ) : (
                children
            )}
        </Button>
    )
}
```

### Menggunakan Wrapper di Fitur Lain

```tsx
// app/user-list/$element/client.toolbar.tsx
"use client"

import { CE_SearchInput } from "./client.searchinput"
import { useQueryState } from "nuqs"

export function CE_Toolbar() {
    const [, setSearch] = useQueryState("q", { shallow: false })

    return (
        <div className="flex items-center gap-3">
            <CE_SearchInput
                placeholder="Cari user..."
                onDebouncedChange={(val) => setSearch(val || null)}
            />
        </div>
    )
}
```

---

## Kapan Tidak Pakai Ini

| Situasi | Yang Tepat |
|---------|-----------|
| Butuh style berbeda satu tempat saja | Pakai `className` prop langsung — tidak perlu buat wrapper |
| Butuh komponen shadcn baru yang belum ada | Jalankan `npx shadcn@latest add [component]` — jangan buat dari scratch |
| Perubahan fungsional yang berlaku untuk semua instance | Pertimbangkan PR ke upstream atau ganti library |
| Komponen murni presentasional tanpa logic | `SE_` di server saja sudah cukup |
