---
title: "Pattern E — Zustand Store"
description: Kelola UI state transient yang tidak perlu ada di URL menggunakan Zustand, dengan store yang di-scope per feature atau global untuk state lintas feature.
---

## Tujuan

Pattern E digunakan untuk state yang bersifat transient — tidak perlu di-bookmark, tidak perlu di-share via URL, dan tidak perlu di-persist ke server. Contoh klasik: modal terbuka/tutup, baris yang dipilih di tabel, sidebar toggle, atau notifikasi in-app. Dengan Zustand, state ini bisa dibaca dan diubah oleh komponen mana pun dalam scope-nya tanpa prop drilling. Berbeda dari Pattern D (URL Search Params), perubahan di Zustand tidak mengubah URL dan tidak men-trigger re-render Server Component.

---

## Scope Store

| Lokasi | Kapan |
|--------|-------|
| `app/[feature]/$store/` | State hanya dibutuhkan satu feature |
| `src/store/` | State dipakai oleh lebih dari satu feature |

> Defaultnya selalu buat di `$store/` feature. Pindahkan ke `src/store/` hanya jika ada kebutuhan konkret lintas feature.

---

## Alur Data

```
CE_A (dispatch) → useXxxStore → CE_B (subscribe) → re-render
```

State tidak melewati Server Component — hanya hidup di client.

---

## Aturan

1. **Jangan simpan server data di Zustand.** Data dari API masuk ke TanStack Query (Pattern B), bukan Zustand.
2. **Satu store per concern** — jangan gabungkan UI state modal dengan filter state dalam satu store.
3. **Nama file:** `[module].store.ts` — contoh: `ui.store.ts`, `filter.store.ts`.
4. **Nama hook:** `use[Feature][Sub]Store` — contoh: `useLoginUiStore`, `useUserListFilterStore`.
5. **Aktifkan Zustand devtools di development** — untuk memudahkan debugging.
6. **Gunakan `shallow` comparison** saat subscribe ke beberapa field sekaligus untuk menghindari re-render tidak perlu.
7. **Reset store saat unmount jika perlu** — gunakan `useEffect` di komponen root feature.
8. **Jangan gunakan class-based actions** untuk store sederhana — `set` langsung sudah cukup.

---

## Tabel Keputusan

| Jenis state | Gunakan |
|---|---|
| Modal open/close | Pattern E — Zustand |
| Selected row / item | Pattern E — Zustand |
| Sidebar toggle | Pattern E — Zustand |
| Search, filter, pagination | [Pattern D — URL Search Params](/patterns/url-params) |
| Data dari server | [Pattern A](/patterns/server-fetch) / [Pattern B](/patterns/client-fetch) |
| Form input sementara | [Pattern C — Form Submit](/patterns/form-submit) |

---

## Contoh

Fitur `login` dengan modal konfirmasi, dan fitur `user-list` dengan seleksi baris.

### Struktur File

```
app/login/
└── $store/
    └── ui.store.ts        useLoginUiStore

app/user-list/
└── $store/
    └── selection.store.ts useUserListSelectionStore
```

### `app/login/$store/ui.store.ts`

```ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface I_LoginUiStore {
    isConfirmModalOpen: boolean
    openConfirmModal: () => void
    closeConfirmModal: () => void
}

export const useLoginUiStore = create<I_LoginUiStore>()(
    devtools(
        (set) => ({
            isConfirmModalOpen: false,
            openConfirmModal: () => set({ isConfirmModalOpen: true }),
            closeConfirmModal: () => set({ isConfirmModalOpen: false }),
        }),
        { name: "login/ui" }
    )
)
```

### `app/user-list/$store/selection.store.ts`

```ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface I_UserListSelectionStore {
    selectedIds: Set<string>
    selectRow: (id: string) => void
    deselectRow: (id: string) => void
    clearSelection: () => void
}

export const useUserListSelectionStore = create<I_UserListSelectionStore>()(
    devtools(
        (set) => ({
            selectedIds: new Set(),
            selectRow: (id) =>
                set((state) => ({ selectedIds: new Set([...state.selectedIds, id]) })),
            deselectRow: (id) =>
                set((state) => {
                    const next = new Set(state.selectedIds)
                    next.delete(id)
                    return { selectedIds: next }
                }),
            clearSelection: () => set({ selectedIds: new Set() }),
        }),
        { name: "user-list/selection" }
    )
)
```

### Menggunakan di Komponen

```tsx
// CE_UserTable — dispatch
"use client"
import { useUserListSelectionStore } from "../$store/selection.store"

export function CE_UserTable({ items }: { items: I_User[] }) {
    const { selectedIds, selectRow, deselectRow } = useUserListSelectionStore()

    return (
        <table>
            <tbody>
                {items.map((user) => (
                    <tr
                        key={user.id}
                        onClick={() =>
                            selectedIds.has(user.id)
                                ? deselectRow(user.id)
                                : selectRow(user.id)
                        }
                        className={selectedIds.has(user.id) ? "bg-muted" : ""}
                    >
                        <td>{user.name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
```

```tsx
// CE_BulkActionBar — subscribe ke selectedIds
"use client"
import { useUserListSelectionStore } from "../$store/selection.store"

export function CE_BulkActionBar() {
    const { selectedIds, clearSelection } = useUserListSelectionStore()

    if (selectedIds.size === 0) return null

    return (
        <div className="flex items-center gap-3 p-3 border rounded bg-muted">
            <span className="text-sm">{selectedIds.size} item dipilih</span>
            <button onClick={clearSelection} className="text-sm text-muted-foreground">
                Batalkan
            </button>
        </div>
    )
}
```

### Reset Store saat Unmount (opsional)

Jika store perlu dikosongkan saat user meninggalkan feature:

```tsx
// CE_UserListRoot.tsx
"use client"
import { useEffect } from "react"
import { useUserListSelectionStore } from "../$store/selection.store"

export function CE_UserListRoot({ children }: { children: React.ReactNode }) {
    const clearSelection = useUserListSelectionStore((s) => s.clearSelection)

    useEffect(() => {
        return () => clearSelection()
    }, [clearSelection])

    return <>{children}</>
}
```

---

## Kapan Tidak Pakai Ini

| Situasi | Pattern yang Tepat |
|---------|-------------------|
| State perlu bisa di-bookmark atau di-share | [Pattern D — URL Search Params](/patterns/url-params) |
| Data berasal dari server / API | [Pattern A](/patterns/server-fetch) atau [Pattern B](/patterns/client-fetch) |
| Input form sebelum di-submit | [Pattern C — Form Submit](/patterns/form-submit) |
| State dipakai oleh banyak feature berbeda | Pindah ke `src/store/` (tetap Pattern E, beda lokasi) |
