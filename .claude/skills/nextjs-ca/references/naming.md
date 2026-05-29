# Naming Convention — Convention v2

## File Naming (dot-notation)

| File type | Pattern | Contoh |
|-----------|---------|--------|
| Server Action | `action.[sub].ts` | `action.submit.ts`, `action.delete.ts` |
| Server Element | `server.[module].tsx` | `server.layout.tsx`, `server.data-table.tsx` |
| Client Element | `client.[module].tsx` | `client.form.tsx`, `client.search-bar.tsx` |
| Server Function | `sfn.[module].ts` | `sfn.session.ts`, `sfn.get-user.ts` |
| Client Function | `cfn.[module].ts` | `cfn.validate.ts`, `cfn.format-date.ts` |
| Zustand Store | `[module].store.ts` | `ui.store.ts`, `filter.store.ts` |
| Zod Schema | `[module].schema.ts` atau `cfn.[module]-schema.ts` | `login.schema.ts` |
| API functions | `[feature].ts` | `user-management.ts` |
| API types | `[feature].type.ts` | `user-management.type.ts` |
| Endpoint registry | `[feature].endpoint.ts` | `user.endpoint.ts` |
| MSW mock handler | `[resource].mock-handler.ts` | `users-list.mock-handler.ts` |
| Registry | `[domain].register.ts` | `routes.register.ts`, `query-keys.register.ts` |
| i18n messages | `[locale].json` | `id.json`, `en.json` |
| Lib adapter | `[library].ts` + `index.ts` | `ioredis.ts` di `lib/cache/` |

## Symbol Naming (prefix wajib)

| Symbol | Prefix | Contoh |
|--------|--------|--------|
| Server Action | `ACT_` | `ACT_SubmitLogin`, `ACT_DeleteUser` |
| Server Element | `SE_` | `SE_UserListLayout`, `SE_DataTable` |
| Client Element | `CE_` | `CE_LoginForm`, `CE_SearchBar` |
| Server Function | `SFN_` | `SFN_GetSession`, `SFN_FetchUser` |
| Client Function | `CFN_` | `CFN_ValidateEmail`, `CFN_FormatDate` |
| API server-only | `APIS_` | `APIS_GetUsers`, `APIS_CreateUser` |
| API client | `APIC_` | `APIC_GetUsers`, `APIC_SearchProducts` |
| Zustand hook | `useXxxStore` | `useUserManagementStore`, `useFilterStore` |
| Zod schema | `ZS_` | `ZS_LoginSchema`, `ZS_CreateUserSchema` |
| Query key | `QK_` | `QK_UserList`, `QK_ProductDetail` |
| Route constant | `ROUTE_` | `ROUTE_HOME`, `ROUTE_USER_DETAIL` |
| Endpoint registry | `EP_` | `EP_User`, `EP_CmsHomepageBanner` |
| Interface | `I_` | `I_UserData`, `I_HttpClient` |
| Request interface | `IRq_` | `IRq_CreateUser`, `IRq_UpdateSlide` |
| Response interface | `IRs_` | `IRs_UserList`, `IRs_SlideDetail` |
| Type alias | `T_` | `T_UserRole`, `T_ModalMode` |
| Enum | `E_` | `E_UserRole`, `E_OrderStatus` |

## Directive Rules

- `"use client"` — baris pertama, sebelum imports, di CE_ dan CFN_ yang dijalankan di browser
- `"use server"` — baris pertama, di ACT_ (Server Action)

## Interface Naming (Props)

Props interface untuk component: `I_[ComponentName]Props`

```typescript
interface I_DataTableProps {
  data: T_User[]
  onSelect: (id: string) => void
}
```

## Zustand Store Interface

```typescript
interface I_[Feature]Store {
  // state + action signatures
}

export const use[Feature]Store = create<I_[Feature]Store>(...)
```
