# shadcn/ui — Implementation Reference

## Aturan Utama

- Jangan pernah modifikasi file di `components/ui/` langsung
- Gunakan komponen shadcn/ui as-is untuk penggunaan dasar
- Buat CE_ wrapper hanya jika ada custom behavior atau komposisi

---

## Kapan Buat Wrapper CE_

| Situasi | Action |
|---------|--------|
| Pakai Button as-is | Import langsung dari `@/components/ui/button` |
| Button dengan loading state | Buat `CE_SubmitButton` |
| Komposisi 2+ komponen yang sering dipakai bersama | Buat CE_ wrapper |
| Custom behavior (confirm dialog, auto-dismiss) | Buat CE_ wrapper |
| Props interface convention (`I_[Name]Props`) | Buat CE_ wrapper |

---

## Penggunaan Langsung (Tidak Perlu Wrapper)

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function CE_UserRow({ user }: { user: T_User }) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>
        <Badge variant={user.active ? "default" : "secondary"}>
          {user.active ? "Active" : "Inactive"}
        </Badge>
      </td>
    </tr>
  )
}
```

---

## Wrapper CE_ — Custom Behavior

```tsx
"use client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { ComponentProps } from "react"

interface I_SubmitButtonProps extends ComponentProps<typeof Button> {
  isLoading?: boolean
  loadingText?: string
}

export function CE_SubmitButton({
  isLoading,
  loadingText = "Loading...",
  children,
  disabled,
  ...props
}: I_SubmitButtonProps) {
  return (
    <Button disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
```

---

## Wrapper CE_ — Komposisi

```tsx
"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface I_ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  isLoading?: boolean
}

export function CE_ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  isLoading,
}: I_ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Loading..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Form Fields dengan shadcn + TanStack Form

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<form.Field name="email">
  {(field) => (
    <div className="space-y-1">
      <Label htmlFor={field.name}>Email</Label>
      <Input
        id={field.name}
        name={field.name}
        type="email"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={field.state.meta.errors.length > 0}
      />
      {field.state.meta.errors[0] && (
        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
      )}
    </div>
  )}
</form.Field>
```

---

## Lokasi Wrapper

```
Wrapper untuk satu feature:   app/[feature]/$element/client.[name].tsx
Wrapper shared 2+ feature:    lib/ui/[name].tsx  (atau components/[name].tsx)
```

Jangan buat wrapper di `components/ui/` — folder itu milik shadcn, bisa di-overwrite saat update.

---

## Anti-patterns

```tsx
// ❌ Salah — modifikasi langsung di components/ui/
// components/ui/button.tsx
export function Button({ isLoading, ...props }) {  // ← tambah prop baru langsung
  return isLoading ? <Loader /> : <button {...props} />
}

// ✅ Benar — buat wrapper CE_
// client.submit-button.tsx
import { Button } from "@/components/ui/button"
export function CE_SubmitButton({ isLoading, ...props }) { ... }
```

```tsx
// ❌ Salah — install UI library lain tanpa diskusi
import { MantineButton } from "@mantine/core"
import { AntdButton } from "antd"

// ✅ Benar — selalu shadcn/ui, buat wrapper jika kurang
import { Button } from "@/components/ui/button"
```

```tsx
// ❌ Salah — wrapper di components/ui/ (akan di-overwrite shadcn update)
// components/ui/submit-button.tsx

// ✅ Benar — wrapper di $element/ atau lib/ui/
// app/login/$element/client.submit-button.tsx
// lib/ui/confirm-dialog.tsx
```
