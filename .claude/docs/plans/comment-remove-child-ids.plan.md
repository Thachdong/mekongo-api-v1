# Plan: Bỏ childIds khỏi Comment (refactor)

## Mô tả
`childIds` trên `Comment` là denormalized cache không cần thiết — quan hệ
cha/con đã có `parentId` làm source of truth. Bỏ field, column, và toàn bộ
logic đồng bộ nó; thay check "còn con thì không xóa được" bằng query thật qua
`parentId`.

## Discovery
- Ảnh hưởng across tất cả layer của module `comment`:
  - domain: `Comment.childIds` field, `addChild`, `removeChildId` methods.
  - application: `CreateCommentUseCase` (update parent.addChild + transaction),
    `DeleteCommentUseCase` (check `childIds.length`, update parent.removeChildId
    + transaction), 2 spec file.
  - infrastructure: `CommentTypeOrmEntity.childIds` column, `comment.mapper.ts`,
    `CommentResponseDto.childIds`, `comment.controller.ts` mapping.
- Hệ quả phát hiện thêm (đã hỏi dev, xác nhận xử lý):
  1. Rule "comment còn con thì không xóa được" (`CommentHasChildrenError`) VẪN
     GIỮ, nhưng đổi cơ chế check: thêm method mới
     `ICommentRepository.hasChildren(commentId): Promise<boolean>` (query
     `COUNT WHERE parent_id = commentId`) thay vì đọc `childIds.length`.
  2. Cả `CreateCommentUseCase` và `DeleteCommentUseCase` sau khi bỏ update-parent
     đều chỉ còn 1 write duy nhất → `TRANSACTION_MANAGER` của comment module
     (`ITransactionManager`, `TypeOrmCommentTransactionManager`,
     `transaction-context.ts`, thêm riêng cho feature `comment-create`) thành
     dead code — XÓA LUÔN (đã hỏi dev, xác nhận).
  3. `CommentResponseDto.childIds` bỏ khỏi response (đã hỏi dev, xác nhận —
     breaking change nhẹ cho client).
- Migration: cần generate migration mới DROP COLUMN `child_ids`.

## Chunk tree

### Chunk 1: Bỏ childIds (module: comment) — refactor xuyên layer
- status: done
- Entity: sửa `Comment` (không tạo mới) — bỏ field + 2 method.
- Steps:
  1. domain — mini-gate xác nhận khi chạy skill `domain`:
     - Bỏ `childIds` khỏi `TCommentProps` + `Comment` (field, getter,
       constructor).
     - Bỏ method `addChild`, `removeChildId`.
     - `CommentHasChildrenError` GIỮ NGUYÊN (không đổi gì ở domain layer, chỉ
       đổi nơi gọi nó ở use-case).
  2. infrastructure (adapter):
     - `CommentTypeOrmEntity`: bỏ column `child_ids`.
     - `comment.mapper.ts`: bỏ map `childIds` cả 2 chiều.
     - `ICommentRepository`: thêm method `hasChildren(commentId: string): Promise<boolean>`.
     - `TypeOrmCommentRepository`: implement `hasChildren` (query
       `count({ where: { parentId: commentId } }) > 0`), bỏ import/dùng
       `childIds` nếu còn sót.
     - XÓA: `application/ports/transaction-manager.interface.ts`,
       `infrastructure/typeorm/typeorm-transaction-manager.service.ts`,
       `infrastructure/typeorm/transaction-context.ts` (dead code sau refactor).
     - Migration: generate mới (drop `child_ids` column) sau khi sửa
       `CommentTypeOrmEntity`, chạy trên DB local.
  3. use-case:
     - `CreateCommentUseCase`: bỏ toàn bộ block "nếu có parentId → addChild +
       update parent", bỏ `runInTransaction` wrapper (chỉ còn
       `commentRepository.create(...)` trực tiếp), bỏ inject
       `TRANSACTION_MANAGER`. VẪN GIỮ bước validate `parentId` tồn tại +
       `parent.postId === postId` (đọc parent qua `findById`, chỉ để validate,
       không update).
     - `DeleteCommentUseCase`: thay `comment.childIds.length > 0` bằng
       `await commentRepository.hasChildren(comment.id)`. Bỏ toàn bộ block dọn
       `parent.childIds` (fetch parent + removeChildId + update), bỏ
       `runInTransaction` wrapper, bỏ inject `TRANSACTION_MANAGER`.
     - Cập nhật `comment-application.tokens.ts`: bỏ `TRANSACTION_MANAGER`.
     - Cập nhật 2 spec file (`create-comment.use-case.spec.ts`,
       `delete-comment.use-case.spec.ts`): bỏ mock `transactionManager`, bỏ
       assertion liên quan `childIds`/`addChild`/`removeChildId`, thêm mock
       `hasChildren` cho `delete-comment.use-case.spec.ts` + test case query
       thật thay vì đọc mảng.
  4. infrastructure (endpoint):
     - `CommentResponseDto`: bỏ field `childIds`.
     - `comment.controller.ts`: bỏ dòng map `dto.childIds = ...`.
  5. doc — kiểm tra lại `create-comment.doc.ts`/`delete-comment.doc.ts` xem có
     tham chiếu `childIds` trong description/schema không (rà soát, sửa nếu
     có — hiện tại theo review sơ bộ thì KHÔNG có tham chiếu trực tiếp field
     này trong 2 file doc, chỉ cần xác nhận lại lúc chạy).
- `comment.module.ts`: bỏ provider `TRANSACTION_MANAGER`/`TypeOrmCommentTransactionManager`.
- Integrate into: không cross-module, không ảnh hưởng module khác.
- Gate: build comment module thành công, `jest` toàn bộ pass, endpoint
  `POST /comments` + `DELETE /comments` vẫn chạy đúng end-to-end (tạo comment
  không update parent nữa, xóa comment check con qua query thật).
- Verify đã chạy: `tsc --noEmit` sạch, `eslint` sạch, `jest` toàn bộ pass
  35/35 (giảm 1 test so với trước — 2 test childIds-cleanup gộp thành 1 test
  "reply không update parent"), `nest build` sạch, migration
  `1788491017611-RemoveCommentChildIds.ts` (DROP COLUMN `child_ids`) generate +
  chạy thành công trên DB local, boot thử app thật — `CommentModule` vẫn init
  OK, route `POST/DELETE /api/comments` vẫn map đúng, không lỗi DI dù đã xóa
  `TRANSACTION_MANAGER` khỏi module.
- Commit range: chưa commit (chờ dev xác nhận)
- Approved by: dev (2026-09-04, qua AskUserQuestion)
