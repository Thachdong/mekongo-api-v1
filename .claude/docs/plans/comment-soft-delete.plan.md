# Plan: Soft-delete comment (giữ UI ổn định)

## Mô tả
`DELETE /comments` hiện hard-delete row, gây vỡ UI (con vẫn hiển thị nhưng cha
biến mất). Đổi sang soft-delete: chỉ set `deleted_at`, không xóa row.

## Discovery
- Entity: tái dùng `Comment` (`src/modules/comment/domain/comment.entity.ts`) —
  không cần thêm field/method (business logic không cần đọc `deletedAt`, TypeORM
  tự lọc qua `@DeleteDateColumn`).
- Use-case/port: tái dùng `DeleteCommentUseCase`, `ICommentRepository.delete` —
  không đổi signature, chỉ đổi hành vi bên dưới (infra).
- Package: không cần thêm gì (TypeORM đã hỗ trợ `@DeleteDateColumn` +
  `Repository.softDelete`, `find*` mặc định tự loại trừ row có `deletedAt`).

## Quyết định đã chốt với dev (AskUserQuestion)
1. `CommentHasChildrenError` (chặn xóa nếu còn con): GIỮ NGUYÊN — không đổi vì
   soft-delete vẫn giữ nguyên rule cũ theo yêu cầu dev.
2. `findById` (parent lookup lúc tạo reply, lookup lúc xóa) PHẢI tự loại comment
   đã xóa — dùng `@DeleteDateColumn` để TypeORM tự filter mặc định (không cần
   sửa code query thủ công).

## Chunk tree

### Chunk 1: Comment — soft-delete adapter (module: comment)
- status: done
- Entity: không đổi.
- Steps:
  1. infrastructure (typeorm entity) — thêm `@DeleteDateColumn({ name:
     'deleted_at', type: 'timestamptz' }) deletedAt: Date | null;` vào
     `CommentTypeOrmEntity`.
  2. infrastructure (adapter) — `TypeOrmCommentRepository.delete()` đổi
     `this._repository.delete({id})` thành `this._repository.softDelete({id})`.
     `findById`/`hasChildren` không cần sửa — TypeORM tự thêm điều kiện
     `deleted_at IS NULL` mặc định khi cột là `@DeleteDateColumn`.
  3. migration — thêm cột `deleted_at` (nullable timestamptz) vào bảng
     `comments`.
- Integrate into: không cross-module.
- Gate: build sạch, test cũ (`delete-comment.use-case.spec.ts`,
  `create-comment.use-case.spec.ts`) vẫn pass (không đổi behavior interface).
- Commit range: (điền sau khi dev xác nhận)
- Approved by: dev (2026-09-04, qua AskUserQuestion)
