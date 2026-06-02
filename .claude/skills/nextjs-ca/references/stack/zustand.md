# Zustand — Implementation Reference

## Kapan Pakai Zustand

State transient UI yang perlu dishare antar CE_ dalam satu feature:
- Modal open/close
- Selected item
- Tab aktif
- Loading/processing state

Jangan pakai Zustand untuk data dari server (→ TanStack Query) atau state yang perlu ada di URL (→ nuqs).

---

## Struktur dan Lokasi

```
State satu feature:     app/[feature]/$store/[name].store.ts
State 2+ feature:       store/[name].store.ts  (root)
```

Contoh:
```
app/user-management/$store/ui.store.ts      ← modal state, selected user
store/notification.store.ts                 ← notifikasi lintas feature
```

---

## Pattern Dasar

```ts
// app/user-management/$store/ui.store.ts
import { create } from "zustand"

interface I_UserManagementUiStore {
  isDeleteModalOpen: boolean
  selectedUserId: string | null
  openDeleteModal: (userId: string) => void
  closeDeleteModal: () => void
}

export const useUserManagementUiStore = create<I_UserManagementUiStore>((set) => ({
  isDeleteModalOpen: false,
  selectedUserId: null,
  openDeleteModal: (userId) => set({ isDeleteModalOpen: true, selectedUserId: userId }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedUserId: null }),
}))
```

Naming: `use[Feature][Name]Store` — diawali `use`, diakhiri `Store`.

---

## Interface Wajib

Interface `I_[Name]Store` harus didefinisikan — shape state + semua action:

```ts
interface I_[Feature]UiStore {
  // state
  isOpen: boolean
  selectedId: string | null
  // actions
  open: (id: string) => void
  close: () => void
}
```

---

## Selector Pattern

Ambil hanya state yang dibutuhkan — hindari subscribe ke seluruh store:

```tsx
"use client"
import { useUserManagementUiStore } from "../$store/ui.store"

export function CE_DeleteModal() {
  // ✅ Selector — hanya re-render jika isDeleteModalOpen berubah
  const isOpen = useUserManagementUiStore((s) => s.isDeleteModalOpen)
  const selectedId = useUserManagementUiStore((s) => s.selectedUserId)
  const close = useUserManagementUiStore((s) => s.closeDeleteModal)

  if (!isOpen) return null
  return (
    <dialog open>
      <p>Delete user {selectedId}?</p>
      <button onClick={close}>Cancel</button>
    </dialog>
  )
}
```

---

## Trigger dari CE_ Lain

```tsx
"use client"
import { useUserManagementUiStore } from "../$store/ui.store"

export function CE_UserRow({ user }: { user: T_User }) {
  const openDeleteModal = useUserManagementUiStore((s) => s.openDeleteModal)

  return (
    <tr>
      <td>{user.name}</td>
      <td>
        <button onClick={() => openDeleteModal(user.id)}>Delete</button>
      </td>
    </tr>
  )
}
```

---

## Computed/Derived State

Hitung di dalam selector, bukan di store:

```tsx
// ✅ Derive di selector
const hasSelection = useUiStore((s) => s.selectedIds.length > 0)

// ❌ Jangan simpan derived state di store
set({ hasSelection: selectedIds.length > 0 })  // ← sinkronisasi manual rawan bug
```

---

## Anti-patterns

```tsx
// ❌ Salah — subscribe ke seluruh store (re-render berlebihan)
const store = useUserManagementUiStore()
const { isOpen, selectedId, close } = store

// ✅ Benar — selector per state
const isOpen = useUserManagementUiStore((s) => s.isDeleteModalOpen)
```

```tsx
// ❌ Salah — useState untuk state yang dishare antar komponen
// CE_UserRow menggunakan props drilling untuk open modal
function CE_UserRow({ user, onDelete }) { ... }
function CE_UserList() {
  const [deleteTarget, setDeleteTarget] = useState(null)
  return users.map(u => <CE_UserRow onDelete={setDeleteTarget} />)
}

// ✅ Benar — Zustand mengelola shared state
function CE_UserRow({ user }) {
  const openDeleteModal = useUserManagementUiStore((s) => s.openDeleteModal)
  return <button onClick={() => openDeleteModal(user.id)}>Delete</button>
}
```

```ts
// ❌ Salah — state lintas feature di $store/ feature
// app/user-management/$store/notification.store.ts  ← seharusnya di root store/

// ✅ Benar — state lintas feature di root store/
// store/notification.store.ts
```
