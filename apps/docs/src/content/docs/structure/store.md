---
title: $store/ — Feature Zustand Stores
description: Folder $store/ berisi Zustand stores yang di-scope ke satu feature — untuk state transient seperti modal, selection, dan toggle.
---

## Tujuan

Folder `$store/` menampung Zustand stores yang hanya digunakan dalam satu feature. Dengan menempatkan store di dalam feature folder, scope state menjadi eksplisit — mudah dihapus ketika feature dihapus, dan tidak mencemari global state. Gunakan untuk state transient yang tidak perlu ada di URL.

## Struktur File

```
// tree
app/[feature]/
└── $store/
    ├── ui.store.ts        → export useLoginUiStore (modal, toggle)
    └── filter.store.ts    → export useLoginFilterStore (local filter state)
```

## Aturan

| Aturan | Detail |
|--------|--------|
| Nama file | `[module].store.ts` |
| Nama hook | `use[FeatureName][Module]Store` — misal `useLoginUiStore` |
| Scope | Hanya dipakai dalam feature yang sama — tidak diimport dari feature lain |
| Gunakan untuk | Modal open/close, selected row, toggle sidebar, notifikasi transient |
| Jangan gunakan untuk | Search, filter, pagination — gunakan URL Search Params (nuqs) |
| State lintas feature | Taruh di `src/store/` — bukan di `$store/` feature |

## Feature Store vs Global Store

| | `$store/` (feature) | `src/store/` (global) |
|---|---|---|
| Scope | Satu feature | Lebih dari satu feature |
| Contoh | Modal di halaman login | Notifikasi global, theme |
| Dihapus saat | Feature dihapus | Hanya jika tidak ada yang pakai |

## Contoh

```ts
// app/login/$store/ui.store.ts
import { create } from "zustand"

interface I_LoginUiStore {
    isModalOpen: boolean
    selectedUserId: string | null
    openModal: (id: string) => void
    closeModal: () => void
}

export const useLoginUiStore = create<I_LoginUiStore>((set) => ({
    isModalOpen: false,
    selectedUserId: null,
    openModal: (id) => set({ isModalOpen: true, selectedUserId: id }),
    closeModal: () => set({ isModalOpen: false, selectedUserId: null }),
}))
```

Digunakan di Client Components dalam feature yang sama:

```tsx
// app/login/$element/client.table.tsx
"use client"

import { useLoginUiStore } from "../$store/ui.store"

export function CE_LoginTable({ data }: { data: I_User[] }) {
    const { openModal } = useLoginUiStore()

    return (
        <table>
            {data.map((user) => (
                <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>
                        <button onClick={() => openModal(user.id)}>
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
// app/login/$element/client.modal.tsx
"use client"

import { useLoginUiStore } from "../$store/ui.store"

export function CE_UserDetailModal() {
    const { isModalOpen, selectedUserId, closeModal } = useLoginUiStore()

    if (!isModalOpen) return null

    return (
        <div role="dialog">
            <p>User ID: {selectedUserId}</p>
            <button onClick={closeModal}>Tutup</button>
        </div>
    )
}
```

## Kapan Tidak Pakai Ini

- State yang perlu di-share/di-bookmark — gunakan URL Search Params via nuqs (Pattern D).
- State yang dipakai lebih dari satu feature — pindah ke `src/store/`.
- Data yang berasal dari server — itu bukan state management, gunakan TanStack Query.
- Form state — dikelola oleh TanStack Form, bukan Zustand.
