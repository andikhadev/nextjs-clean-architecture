---
title: Zustand
description: Panduan setup dan penggunaan Zustand dalam konvensi Next.js Clean Architecture — state transient per-feature dan global store.
---

## Tujuan dalam Konvensi Ini

Zustand dipilih sebagai solusi state management untuk **state transient** — state yang tidak perlu ada di URL dan bukan data server. Contoh penggunaannya: modal open/close, selected row, sidebar toggle, dan notifikasi sementara. Dalam konvensi ini Zustand beroperasi di dua level: **feature store** di `$store/` untuk state yang hanya relevan dalam satu feature, dan **global store** di `src/store/` untuk state yang dipakai lintas feature.

---

## Setup

```bash
npm install zustand
```

Tidak ada konfigurasi global yang diperlukan. Setiap store dibuat secara independen menggunakan `create()`.

---

## Pola Penggunaan

### Feature Store di `$store/`

Store yang hanya dipakai dalam satu feature taruh di `app/[feature]/$store/`:

```ts
// app/user-list/$store/ui.store.ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface I_UIStore {
  selectedId: string | null
  isModalOpen: boolean
  setSelectedId: (id: string | null) => void
  openModal: () => void
  closeModal: () => void
}

export const useUIStore = create<I_UIStore>()(
  devtools(
    (set) => ({
      selectedId: null,
      isModalOpen: false,
      setSelectedId: (id) => set({ selectedId: id }),
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false, selectedId: null }),
    }),
    { name: "UserList/UI" }
  )
)
```

### Global Store di `src/store/`

Untuk state yang dipakai lebih dari satu feature:

```ts
// src/store/notification.store.ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface I_NotificationStore {
  message: string | null
  type: "success" | "error" | "info" | null
  showNotification: (message: string, type: "success" | "error" | "info") => void
  clearNotification: () => void
}

export const useNotificationStore = create<I_NotificationStore>()(
  devtools(
    (set) => ({
      message: null,
      type: null,
      showNotification: (message, type) => set({ message, type }),
      clearNotification: () => set({ message: null, type: null }),
    }),
    { name: "Global/Notification" }
  )
)
```

### Dispatch dan Subscribe di Komponen

```tsx
// CE_UserTable — dispatch (menulis ke store)
"use client"
import { useUIStore } from "../$store/ui.store"

export function CE_UserTable({ data }: { data: I_User[] }) {
  const { setSelectedId, openModal } = useUIStore()

  return (
    <table>
      {data.map((user) => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>
            <button
              onClick={() => {
                setSelectedId(user.id)
                openModal()
              }}
            >
              Detail
            </button>
          </td>
        </tr>
      ))}
    </table>
  )
}
```

```tsx
// CE_DetailModal — subscribe (membaca dari store)
"use client"
import { useUIStore } from "../$store/ui.store"

export function CE_DetailModal() {
  const { selectedId, isModalOpen, closeModal } = useUIStore()

  if (!isModalOpen) return null

  return (
    <div role="dialog">
      <p>ID: {selectedId}</p>
      <button onClick={closeModal}>Tutup</button>
    </div>
  )
}
```

### Selector untuk Performa

Gunakan selector untuk menghindari re-render yang tidak perlu:

```tsx
// Hanya re-render saat isModalOpen berubah
const isModalOpen = useUIStore((state) => state.isModalOpen)

// Hindari — subscribe ke seluruh store menyebabkan re-render berlebihan
const store = useUIStore()
```

---

## Aturan Konvensi

- Penamaan store hook: `useXxxStore` — mengikuti konvensi React hook
- Store yang hanya dipakai satu feature → `app/[feature]/$store/[module].store.ts`
- Store yang dipakai lebih dari satu feature → `src/store/[module].store.ts`
- **Dilarang** menyimpan data server di Zustand — gunakan TanStack Query untuk server state
- **Dilarang** menyimpan state yang perlu di-bookmark atau di-share — gunakan URL Search Params (nuqs)
- Selalu gunakan `devtools` middleware dengan nama deskriptif untuk kemudahan debugging
- Interface store diberi prefix `I_` sesuai naming convention
- Gunakan selector saat mengonsumsi store untuk menghindari re-render yang tidak perlu

---

## Referensi

- [Zustand Docs](https://zustand.docs.pmnd.rs/)
- [Pattern E — Cross-component State via Zustand](/patterns/zustand)
- [Naming Convention — useXxxStore](/naming/symbol)
