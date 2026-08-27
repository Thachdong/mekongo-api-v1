---
name: export-use-case
description: Export 1 use-case đã tồn tại ra ngoài module qua module wiring + public-api.ts. Dùng khi user gọi /export-use-case <UseCaseName> hoặc yêu cầu "export use-case X".
---

# /export-use-case

Input: tên use-case (class name, ví dụ `CreateAccountUseCase`) + module chứa nó (`<name>`).

## Bước 1 — Check tồn tại

Tìm class use-case trong `src/modules/<name>/application/**`.

- KHÔNG tồn tại: báo "use-case chưa được tạo" (nêu tên use-case + module), dừng luôn, không code gì thêm.
- Tồn tại: qua bước 2.

## Bước 2 — Update `src/modules/<name>/<name>.module.ts`

Token DI: `SCREAMING_SNAKE_CASE` của tên use-case (bỏ hậu tố `UseCase`) + hậu tố `_USECASE`.
Ví dụ: `CreateAccountUseCase` → `CREATE_ACCOUNT_USECASE`.

- `providers`: thêm

```ts
{ provide: CREATE_ACCOUNT_USECASE, useExisting: CreateAccountUseCase }
```

(giữ nguyên provider gốc của class use-case nếu đã có; không xoá, chỉ thêm binding token mới).

- `exports`: thêm `CREATE_ACCOUNT_USECASE`.

Import token constant + use-case class đúng path liên quan trong file module.

## Bước 3 — Update `src/modules/<name>/public-api.ts`

Nếu file chưa tồn tại, tạo mới. Thêm export cần thiết để module ngoài dùng được: token constant (`CREATE_ACCOUNT_USECASE`) và type/interface liên quan (input/output port của use-case) nếu có, dạng `export * from '...'` hoặc `export { ... } from '...'` theo pattern file hiện có.

## Ràng buộc

- Chỉ sửa 2 file trên (`<name>.module.ts`, `public-api.ts`). Không sửa domain/application/infrastructure logic, không tạo use-case mới.
- Không report gì thêm sau khi xong — im lặng, chỉ báo khi use-case chưa tồn tại (bước 1).
